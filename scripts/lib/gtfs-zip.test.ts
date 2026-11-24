import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crc32, deflateRawSync } from 'node:zlib';
import { afterAll, describe, expect, it } from 'vitest';
import {
  isSameRemoteFile,
  listZipEntries,
  parseCsv,
  parseGtfsTime,
  readGtfsRows,
  readZipEntry,
} from './gtfs-zip.ts';

async function collect(source: Iterable<Uint8Array | string>): Promise<Array<Record<string, string>>> {
  const rows: Array<Record<string, string>> = [];
  for await (const row of parseCsv(source)) rows.push(row);
  return rows;
}

describe('parseCsv', () => {
  it('lee comillas con comas, comillas dobles y saltos de línea, con CRLF', async () => {
    const text =
      'stop_id,stop_name,stop_desc\r\n' +
      '20151,"Ruta la Madera Km 43,2",\r\n' +
      '1,"Dice ""hola""","línea 1\r\nlínea 2"\r\n' +
      '2,"a\nb",x';
    expect(await collect([text])).toEqual([
      { stop_id: '20151', stop_name: 'Ruta la Madera Km 43,2', stop_desc: '' },
      { stop_id: '1', stop_name: 'Dice "hola"', stop_desc: 'línea 1\r\nlínea 2' },
      { stop_id: '2', stop_name: 'a\nb', stop_desc: 'x' },
    ]);
  });

  it('quita el BOM tanto en bytes como en texto', async () => {
    const bytes = new TextEncoder().encode('﻿route_id,route_short_name\n843,23LP\n');
    expect(await collect([bytes])).toEqual([{ route_id: '843', route_short_name: '23LP' }]);
    expect(await collect(['﻿route_id\n843\n'])).toEqual([{ route_id: '843' }]);
  });

  it('da lo mismo sin importar dónde se corten los trozos (incluso dentro de un carácter UTF-8)', async () => {
    const text = 'a,b,c\r\n"x,""y""\r\nz",Láctea,\r\n1,2,3\n\n4,"",6';
    const expected = await collect([text]);
    expect(expected).toEqual([
      { a: 'x,"y"\r\nz', b: 'Láctea', c: '' },
      { a: '1', b: '2', c: '3' },
      { a: '4', b: '', c: '6' },
    ]);
    const bytes = new TextEncoder().encode(text);
    expect(await collect(Array.from(bytes, (byte) => Uint8Array.of(byte)))).toEqual(expected);
    for (let cut = 1; cut < text.length; cut++) {
      expect(await collect([text.slice(0, cut), text.slice(cut)])).toEqual(expected);
    }
  });

  it('completa con "" las columnas faltantes, recorta nombres de columna e ignora líneas en blanco', async () => {
    expect(await collect([' trip_id , stop_id\n\nT1\n'])).toEqual([{ trip_id: 'T1', stop_id: '' }]);
  });

  it('falla ante comillas sin cerrar o texto después de cerrarlas', async () => {
    await expect(collect(['a,b\n"x,1\n'])).rejects.toThrow(/comilla sin cerrar/);
    await expect(collect(['a,b\n"x"y,1\n'])).rejects.toThrow(/después de cerrar comillas/);
  });
});

describe('parseGtfsTime', () => {
  it('convierte a segundos, admite horas ≥ 24 y una sola cifra en la hora', () => {
    expect(parseGtfsTime('06:50:00')).toBe(6 * 3600 + 50 * 60);
    expect(parseGtfsTime('6:50:00')).toBe(6 * 3600 + 50 * 60);
    expect(parseGtfsTime(' 25:10:30 ')).toBe(25 * 3600 + 10 * 60 + 30);
    expect(parseGtfsTime('24:00:00')).toBe(86_400);
  });

  it('una hora vacía es null, no medianoche', () => {
    expect(parseGtfsTime('')).toBeNull();
    expect(parseGtfsTime('   ')).toBeNull();
    expect(parseGtfsTime(undefined)).toBeNull();
    expect(parseGtfsTime('00:00:00')).toBe(0);
  });

  it('rechaza formatos inválidos', () => {
    expect(() => parseGtfsTime('6:5:00')).toThrow(/inválida/);
    expect(() => parseGtfsTime('06:60:00')).toThrow(/inválida/);
    expect(() => parseGtfsTime('mañana')).toThrow(/inválida/);
  });
});

describe('isSameRemoteFile', () => {
  const cached = { etag: '"abc"', lastModified: 'Fri, 28 Feb 2025 13:05:00 GMT', size: 100 };
  const headers = (values: Record<string, string>) => new Headers(values);

  it('reutiliza solo si coinciden tamaño y ETag/Last-Modified', () => {
    expect(isSameRemoteFile(cached, headers({ etag: '"abc"', 'content-length': '100' }))).toBe(true);
    expect(
      isSameRemoteFile(cached, headers({ 'last-modified': cached.lastModified, 'content-length': '100' })),
    ).toBe(true);
    expect(isSameRemoteFile(cached, headers({ etag: '"abc"', 'content-length': '101' }))).toBe(false);
    expect(isSameRemoteFile(cached, headers({ etag: '"xyz"', 'content-length': '100' }))).toBe(false);
    expect(isSameRemoteFile(cached, headers({ 'content-length': '100' }))).toBe(false);
    expect(isSameRemoteFile(cached, headers({ etag: '"abc"' }))).toBe(false);
  });
});

// Zip mínimo con data descriptors (bit 3), igual que el que publica DTPR: la
// cabecera local no trae tamaños ni CRC.
function makeZip(files: Array<{ name: string; content: string; store?: boolean }>): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const data = Buffer.from(file.content, 'utf8');
    const compressed = file.store ? data : deflateRawSync(data);
    const name = Buffer.from(file.name, 'utf8');
    const method = file.store ? 0 : 8;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0808, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(name.length, 26);
    const descriptor = Buffer.alloc(16);
    descriptor.writeUInt32LE(0x08074b50, 0);
    descriptor.writeUInt32LE(crc, 4);
    descriptor.writeUInt32LE(compressed.length, 8);
    descriptor.writeUInt32LE(data.length, 12);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0808, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, compressed, descriptor);
    centrals.push(central, name);
    offset += local.length + name.length + compressed.length + descriptor.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

describe('lectura del zip', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gtfs-zip-test-'));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  const stopTimes =
    'trip_id,arrival_time,departure_time,stop_id,stop_sequence\n' +
    Array.from({ length: 5000 }, (_, i) => `T${i % 7},${i % 2 ? '' : '25:00:00'},,${i},${i}`).join('\n');
  const zipPath = join(dir, 'feed.zip');
  writeFileSync(
    zipPath,
    makeZip([
      { name: 'agency.txt', content: 'agency_id,agency_name\nDTPR,"División de Transporte Público Regional"\n', store: true },
      { name: 'stop_times.txt', content: stopTimes },
    ]),
  );

  it('ubica las entradas por el directorio central y las lee en streaming', async () => {
    const entries = await listZipEntries(zipPath);
    expect([...entries.keys()]).toEqual(['agency.txt', 'stop_times.txt']);
    expect(await readGtfsRows(zipPath, entries, 'agency.txt')).toEqual([
      { agency_id: 'DTPR', agency_name: 'División de Transporte Público Regional' },
    ]);
    const rows = await readGtfsRows(zipPath, entries, 'stop_times.txt');
    expect(rows).toHaveLength(5000);
    expect(rows[1]).toEqual({ trip_id: 'T1', arrival_time: '', departure_time: '', stop_id: '1', stop_sequence: '1' });
    await expect(readGtfsRows(zipPath, entries, 'shapes.txt')).rejects.toThrow(/no trae shapes\.txt/);
  });

  it('detecta datos que no calzan con el CRC del directorio central', async () => {
    const entries = await listZipEntries(zipPath);
    const entry = { ...entries.get('stop_times.txt')!, crc32: 1 };
    const read = async () => {
      for await (const chunk of readZipEntry(zipPath, entry)) void chunk;
    };
    await expect(read()).rejects.toThrow(/CRC-32/);
  });
});
