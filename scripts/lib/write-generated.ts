// Escritura de *.generated.ts para los sync que se corren seguido (GTFS y
// cobertura):
// - Si lo único distinto son las marcas de tiempo ISO (generatedAt, fecha del
//   banner), el archivo no se toca: re-sincronizar un dataset que no cambió
//   deja el diff limpio.
// - Todo se escribe primero a .tmp y recién después se renombra, para que un
//   error a mitad de camino no deje archivos de dos versiones del feed.

import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';

const TIMESTAMP_RE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g;

export function sameIgnoringTimestamps(a: string, b: string): boolean {
  return a.replace(TIMESTAMP_RE, '') === b.replace(TIMESTAMP_RE, '');
}

/** Devuelve, por archivo, si se reescribió. */
export function writeGeneratedFiles(files: ReadonlyArray<{ path: string; content: string }>): boolean[] {
  const changed = files.map(
    ({ path, content }) => !existsSync(path) || !sameIgnoringTimestamps(readFileSync(path, 'utf8'), content),
  );
  const pending = files.filter((_, i) => changed[i]);
  try {
    for (const { path, content } of pending) writeFileSync(`${path}.tmp`, content);
  } catch (error) {
    for (const { path } of pending) rmSync(`${path}.tmp`, { force: true });
    throw error;
  }
  for (const { path } of pending) renameSync(`${path}.tmp`, path);
  return changed;
}
