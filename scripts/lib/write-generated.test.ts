import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { sameIgnoringTimestamps, writeGeneratedFiles } from './write-generated.ts';

describe('writeGeneratedFiles', () => {
  const dir = mkdtempSync(join(tmpdir(), 'write-generated-test-'));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));
  const a = join(dir, 'a.generated.ts');
  const b = join(dir, 'b.generated.ts');
  const file = (stamp: string, body: string) => `// on ${stamp}\nexport const X = ${body};\n`;

  it('escribe archivos nuevos y los que cambian de contenido', () => {
    expect(writeGeneratedFiles([{ path: a, content: file('2026-01-01T00:00:00.000Z', '1') }])).toEqual([true]);
    expect(
      writeGeneratedFiles([
        { path: a, content: file('2026-01-02T00:00:00.000Z', '2') },
        { path: b, content: file('2026-01-02T00:00:00.000Z', '1') },
      ]),
    ).toEqual([true, true]);
    expect(readFileSync(a, 'utf8')).toBe(file('2026-01-02T00:00:00.000Z', '2'));
    expect(readdirSync(dir).filter((name) => name.endsWith('.tmp'))).toEqual([]);
  });

  it('no reescribe si solo cambian las marcas de tiempo', () => {
    expect(writeGeneratedFiles([{ path: a, content: file('2026-03-03T10:20:30.456Z', '2') }])).toEqual([false]);
    expect(readFileSync(a, 'utf8')).toBe(file('2026-01-02T00:00:00.000Z', '2'));
  });

  it('si falla una escritura no reemplaza ninguno ni deja .tmp', () => {
    const missingDir = join(dir, 'no-existe', 'c.generated.ts');
    expect(() =>
      writeGeneratedFiles([
        { path: a, content: file('2026-01-04T00:00:00.000Z', '3') },
        { path: missingDir, content: 'x' },
      ]),
    ).toThrow();
    expect(readFileSync(a, 'utf8')).toBe(file('2026-01-02T00:00:00.000Z', '2'));
    expect(existsSync(`${a}.tmp`)).toBe(false);
  });

  it('sameIgnoringTimestamps compara todo lo demás', () => {
    expect(sameIgnoringTimestamps(file('2026-01-01T00:00:00.000Z', '1'), file('2027-05-05T05:05:05.555Z', '1'))).toBe(
      true,
    );
    expect(sameIgnoringTimestamps(file('2026-01-01T00:00:00.000Z', '1'), file('2026-01-01T00:00:00.000Z', '2'))).toBe(
      false,
    );
  });
});
