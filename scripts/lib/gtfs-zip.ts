// Lectura del GTFS oficial (zip publicado por DTPR) sin binarios del sistema
// (ni unzip ni sqlite3).
//
// - Descarga con caché en .cache/gtfs/ (gitignored): antes de bajar de nuevo
//   se consulta con HEAD y se reutiliza el zip si ETag/Last-Modified y tamaño
//   no cambiaron.
// - Cada entrada se ubica con el directorio central del zip y se descomprime
//   en streaming con node:zlib, verificando tamaño y CRC-32. No usamos un
//   unzip secuencial (que busca firmas PK dentro de los datos comprimidos):
//   el zip de DTPR trae data descriptors, así que los tamaños solo están al
//   final de cada entrada y en el directorio central. stop_times.txt pesa
//   ~300 MB descomprimido y nunca se carga entero en memoria.
// - Lector CSV RFC 4180 en streaming: BOM, campos entre comillas con comas,
//   comillas dobles y saltos de línea, CRLF.

import { createHash } from 'node:crypto';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { open } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { crc32, createInflateRaw } from 'node:zlib';

export const DEFAULT_GTFS_URL = 'https://dtpr.gob.cl/wp-content/uploads/2025/12/granconcepcion.zip';

const USER_AGENT = 'gtfs-sync/1.0 (node)';

/** Lo que scripts/sync-gtfs-official.ts necesita sí o sí del zip. */
export const REQUIRED_GTFS_FILES = ['calendar.txt', 'routes.txt', 'stops.txt', 'trips.txt', 'stop_times.txt'];

export interface GtfsZipFile {
  path: string;
  sha256: string;
  size: number;
  /** Cuándo se descargó el zip (con GTFS_ZIP_PATH: fecha de modificación del archivo). */
  fetchedAt: string;
  origin: 'download' | 'cache' | 'local';
}

interface CacheMeta {
  url: string;
  etag: string | null;
  lastModified: string | null;
  size: number;
  sha256: string;
  fetchedAt: string;
}

export async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
  return hash.digest('hex');
}

export async function localGtfsZip(path: string): Promise<GtfsZipFile> {
  const stat = statSync(path);
  return {
    path,
    sha256: await sha256File(path),
    size: stat.size,
    fetchedAt: stat.mtime.toISOString(),
    origin: 'local',
  };
}

function readCacheMeta(metaPath: string, url: string, zipPath: string): CacheMeta | null {
  if (!existsSync(metaPath) || !existsSync(zipPath)) return null;
  try {
    const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as Partial<CacheMeta>;
    if (
      meta.url !== url ||
      typeof meta.size !== 'number' ||
      typeof meta.sha256 !== 'string' ||
      typeof meta.fetchedAt !== 'string' ||
      statSync(zipPath).size !== meta.size
    ) {
      return null;
    }
    return {
      url: meta.url,
      etag: typeof meta.etag === 'string' ? meta.etag : null,
      lastModified: typeof meta.lastModified === 'string' ? meta.lastModified : null,
      size: meta.size,
      sha256: meta.sha256,
      fetchedAt: meta.fetchedAt,
    };
  } catch {
    return null;
  }
}

/** Solo se reutiliza si el servidor da tamaño y al menos ETag o Last-Modified, y todo coincide. */
export function isSameRemoteFile(
  cached: Pick<CacheMeta, 'etag' | 'lastModified' | 'size'>,
  headers: Pick<Headers, 'get'>,
): boolean {
  const etag = headers.get('etag');
  const lastModified = headers.get('last-modified');
  const length = headers.get('content-length');
  if (length === null || Number(length) !== cached.size) return false;
  if (etag === null && lastModified === null) return false;
  if (etag !== null && etag !== cached.etag) return false;
  if (lastModified !== null && lastModified !== cached.lastModified) return false;
  return true;
}

export async function downloadGtfsZip(url: string, cacheDir: string): Promise<GtfsZipFile> {
  mkdirSync(cacheDir, { recursive: true });
  const zipPath = join(cacheDir, basename(new URL(url).pathname) || 'gtfs.zip');
  const metaPath = `${zipPath}.json`;
  const cached = readCacheMeta(metaPath, url, zipPath);

  if (cached) {
    const fromCache: GtfsZipFile = {
      path: zipPath,
      sha256: cached.sha256,
      size: cached.size,
      fetchedAt: cached.fetchedAt,
      origin: 'cache',
    };
    try {
      const head = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(30_000),
      });
      if (head.ok && isSameRemoteFile(cached, head.headers)) return fromCache;
    } catch (error) {
      console.warn(`  ! HEAD ${url} falló (${(error as Error).message}); se usa el zip en caché.`);
      return fromCache;
    }
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(10 * 60_000),
  });
  if (!res.ok || !res.body) throw new Error(`GET ${url} respondió HTTP ${res.status}`);

  const partPath = `${zipPath}.part`;
  const hash = createHash('sha256');
  let size = 0;
  // Se valida antes de tocar la caché: una página de error servida con HTTP
  // 200 quedaría guardada y el HEAD de la corrida siguiente la daría por buena.
  // En CI la caché se guarda aunque este sync falle (el paso no bloquea el job).
  try {
    await pipeline(
      Readable.fromWeb(res.body as NodeReadableStream<Uint8Array>),
      async function* (source: AsyncIterable<Buffer>) {
        for await (const chunk of source) {
          hash.update(chunk);
          size += chunk.length;
          yield chunk;
        }
      },
      createWriteStream(partPath),
    );
    const expected = res.headers.get('content-length');
    if (expected !== null && Number(expected) !== size) {
      throw new Error(`descarga incompleta, ${size} de ${expected} bytes`);
    }
    const entries = await listZipEntries(partPath);
    const missing = REQUIRED_GTFS_FILES.filter((name) => !entries.has(name));
    if (missing.length > 0) throw new Error(`el zip no trae ${missing.join(', ')}`);
  } catch (error) {
    rmSync(partPath, { force: true });
    throw new Error(`GET ${url} no entregó un GTFS válido: ${(error as Error).message}`);
  }
  rmSync(metaPath, { force: true });
  renameSync(partPath, zipPath);

  const meta: CacheMeta = {
    url,
    etag: res.headers.get('etag'),
    lastModified: res.headers.get('last-modified'),
    size,
    sha256: hash.digest('hex'),
    fetchedAt: new Date().toISOString(),
  };
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
  return { path: zipPath, sha256: meta.sha256, size, fetchedAt: meta.fetchedAt, origin: 'download' };
}

export interface ZipEntry {
  name: string;
  /** 0 = sin compresión, 8 = deflate. */
  method: number;
  compressedSize: number;
  size: number;
  crc32: number;
  localHeaderOffset: number;
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const EOCD_MIN_LENGTH = 22;

export async function listZipEntries(zipPath: string): Promise<Map<string, ZipEntry>> {
  const file = await open(zipPath, 'r');
  try {
    const { size } = await file.stat();
    const tailLength = Math.min(size, EOCD_MIN_LENGTH + 0xffff);
    const tail = Buffer.alloc(tailLength);
    await file.read(tail, 0, tailLength, size - tailLength);
    let eocd = -1;
    for (let i = tailLength - EOCD_MIN_LENGTH; i >= 0; i--) {
      if (tail.readUInt32LE(i) === EOCD_SIGNATURE) {
        eocd = i;
        break;
      }
    }
    if (eocd === -1) throw new Error(`${zipPath} no es un zip válido (sin directorio central)`);

    const count = tail.readUInt16LE(eocd + 10);
    const directorySize = tail.readUInt32LE(eocd + 12);
    const directoryOffset = tail.readUInt32LE(eocd + 16);
    if (count === 0xffff || directorySize === 0xffffffff || directoryOffset === 0xffffffff) {
      throw new Error(`${zipPath} es ZIP64, formato no soportado por este lector`);
    }

    const directory = Buffer.alloc(directorySize);
    await file.read(directory, 0, directorySize, directoryOffset);
    const entries = new Map<string, ZipEntry>();
    let p = 0;
    for (let i = 0; i < count; i++) {
      if (directory.readUInt32LE(p) !== CENTRAL_SIGNATURE) {
        throw new Error(`${zipPath}: directorio central corrupto (entrada ${i})`);
      }
      const flags = directory.readUInt16LE(p + 8);
      const nameLength = directory.readUInt16LE(p + 28);
      const extraLength = directory.readUInt16LE(p + 30);
      const commentLength = directory.readUInt16LE(p + 32);
      const name = directory.toString(flags & 0x800 ? 'utf8' : 'latin1', p + 46, p + 46 + nameLength);
      if (flags & 0x1) throw new Error(`${zipPath}: ${name} está cifrado`);
      entries.set(name, {
        name,
        method: directory.readUInt16LE(p + 10),
        crc32: directory.readUInt32LE(p + 16),
        compressedSize: directory.readUInt32LE(p + 20),
        size: directory.readUInt32LE(p + 24),
        localHeaderOffset: directory.readUInt32LE(p + 42),
      });
      p += 46 + nameLength + extraLength + commentLength;
    }
    return entries;
  } finally {
    await file.close();
  }
}

/** Bytes descomprimidos de una entrada, en trozos; valida tamaño y CRC-32 al terminar. */
export async function* readZipEntry(zipPath: string, entry: ZipEntry): AsyncGenerator<Buffer> {
  if (entry.method !== 0 && entry.method !== 8) {
    throw new Error(`${entry.name}: método de compresión ${entry.method} no soportado`);
  }
  const header = Buffer.alloc(30);
  const file = await open(zipPath, 'r');
  try {
    await file.read(header, 0, header.length, entry.localHeaderOffset);
  } finally {
    await file.close();
  }
  if (header.readUInt32LE(0) !== LOCAL_SIGNATURE) {
    throw new Error(`${entry.name}: cabecera local no encontrada`);
  }
  // La cabecera local puede traer un "extra" distinto al del directorio central.
  const dataStart = entry.localHeaderOffset + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);

  let crc = 0;
  let size = 0;
  if (entry.compressedSize > 0) {
    const raw = createReadStream(zipPath, {
      start: dataStart,
      end: dataStart + entry.compressedSize - 1,
      highWaterMark: 1 << 20,
    });
    const inflate = entry.method === 8 ? createInflateRaw() : null;
    if (inflate) {
      raw.on('error', (error) => inflate.destroy(error));
      raw.pipe(inflate);
    }
    try {
      for await (const chunk of inflate ?? raw) {
        const buffer = chunk as Buffer;
        crc = crc32(buffer, crc);
        size += buffer.length;
        yield buffer;
      }
    } finally {
      raw.destroy();
    }
  }
  if (size !== entry.size || crc >>> 0 !== entry.crc32) {
    throw new Error(`${entry.name}: tamaño o CRC-32 no coinciden con el directorio central`);
  }
}

const QUOTE = 34;
const COMMA = 44;
const LF = 10;
const CR = 13;

/**
 * Corta `text` en registros completos y los agrega a `out`. Devuelve hasta
 * dónde consumió: lo que queda es un registro incompleto que sigue en el
 * próximo trozo (salvo con `final`, donde el fin del texto cierra el registro).
 */
function splitCsvRecords(text: string, final: boolean, out: string[][]): number {
  const n = text.length;
  let i = 0;
  while (i < n) {
    const recordStart = i;
    const fields: string[] = [];
    for (;;) {
      let value: string;
      if (text.charCodeAt(i) === QUOTE) {
        value = '';
        let j = i + 1;
        for (;;) {
          const q = text.indexOf('"', j);
          if (q === -1) {
            if (final) throw new Error(`CSV: comilla sin cerrar en "${text.slice(recordStart, recordStart + 80)}"`);
            return recordStart;
          }
          // Una comilla al final del trozo puede ser la primera de un "" escapado.
          if (q === n - 1 && !final) return recordStart;
          if (text.charCodeAt(q + 1) === QUOTE) {
            value += text.slice(j, q + 1);
            j = q + 2;
            continue;
          }
          value += text.slice(j, q);
          i = q + 1;
          break;
        }
      } else {
        let j = i;
        while (j < n) {
          const c = text.charCodeAt(j);
          if (c === COMMA || c === LF || c === CR) break;
          j++;
        }
        value = text.slice(i, j);
        i = j;
      }
      fields.push(value);

      if (i >= n) {
        if (!final) return recordStart;
        break;
      }
      const c = text.charCodeAt(i);
      if (c === COMMA) {
        i++;
        continue;
      }
      if (c === LF) {
        i++;
        break;
      }
      if (c === CR) {
        if (i + 1 >= n && !final) return recordStart;
        i += text.charCodeAt(i + 1) === LF ? 2 : 1;
        break;
      }
      throw new Error(`CSV: texto después de cerrar comillas en "${text.slice(recordStart, i + 20)}"`);
    }
    out.push(fields);
  }
  return n;
}

/**
 * Registros CSV como objetos `{ columna: valor }` según la primera fila.
 * Las columnas faltantes quedan como '' y las líneas en blanco (o solo con
 * espacios) se ignoran.
 */
export async function* parseCsv(
  source: AsyncIterable<Uint8Array | string> | Iterable<Uint8Array | string>,
): AsyncGenerator<Record<string, string>> {
  // fatal: un feed en Latin-1 debe fallar, no llenar los nombres de "V�a".
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const decode = (bytes?: Uint8Array) => {
    try {
      return bytes ? decoder.decode(bytes, { stream: true }) : decoder.decode();
    } catch {
      throw new Error('CSV: el archivo no es UTF-8 válido (¿viene en Latin-1?)');
    }
  };
  let header: string[] | null = null;
  let pending = '';
  let atStart = true;
  const batch: string[][] = [];

  function* drain(): Generator<Record<string, string>> {
    for (const fields of batch) {
      if (fields.length === 1 && fields[0].trim() === '') continue;
      if (!header) {
        header = fields.map((name) => name.trim());
        continue;
      }
      const record: Record<string, string> = {};
      for (let k = 0; k < header.length; k++) record[header[k]] = fields[k] ?? '';
      yield record;
    }
    batch.length = 0;
  }

  for await (const chunk of source) {
    let text = typeof chunk === 'string' ? chunk : decode(chunk);
    if (atStart && text.length > 0) {
      // TextDecoder ya descarta el BOM de los bytes; esto cubre entradas string.
      if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
      atStart = false;
    }
    pending += text;
    pending = pending.slice(splitCsvRecords(pending, false, batch));
    yield* drain();
  }
  pending += decode();
  splitCsvRecords(pending, true, batch);
  yield* drain();
}

export function readGtfsTable(
  zipPath: string,
  entries: Map<string, ZipEntry>,
  name: string,
): AsyncGenerator<Record<string, string>> {
  const entry = entries.get(name);
  if (!entry) throw new Error(`El GTFS no trae ${name}`);
  return parseCsv(readZipEntry(zipPath, entry));
}

export async function readGtfsRows(
  zipPath: string,
  entries: Map<string, ZipEntry>,
  name: string,
): Promise<Array<Record<string, string>>> {
  const rows: Array<Record<string, string>> = [];
  for await (const row of readGtfsTable(zipPath, entries, name)) rows.push(row);
  return rows;
}

/**
 * Hora GTFS "H:MM:SS" → segundos desde el inicio del día de servicio.
 * Admite horas ≥ 24 (servicios que cruzan la medianoche). Vacía → null: GTFS
 * permite omitir horas en paradas que no son timepoint y no son 00:00.
 */
export function parseGtfsTime(value: string | undefined): number | null {
  const text = value?.trim();
  if (!text) return null;
  const match = /^(\d{1,3}):([0-5]\d):([0-5]\d)$/.exec(text);
  if (!match) throw new Error(`Hora GTFS inválida: "${value}"`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}
