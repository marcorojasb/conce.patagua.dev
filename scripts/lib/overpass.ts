// Tiny Overpass helper used by all sync:* scripts.
//
// Why curl? Node's built-in fetch (undici) intermittently hangs with
// ETIMEDOUT against Overpass endpoints on this machine, while plain
// curl works fine to the same hosts. Until that resolves, we shell out.

import { spawn } from 'node:child_process';

const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
];

const UA = 'conce-patagua-dev/0.1 (https://github.com/marcorojasb/conce.patagua.dev)';

function curlGet(url: string, timeoutSec = 30): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('curl', [
      '-sS',
      '-m', String(timeoutSec),
      '-H', `User-Agent: ${UA}`,
      '-H', 'Accept: application/json',
      url,
    ]);
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (b: Buffer) => { stdout += b.toString('utf8'); });
    child.stderr.on('data', (b: Buffer) => { stderr += b.toString('utf8'); });
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`curl exited ${code}: ${stderr.trim()}`));
    });
    child.on('error', reject);
  });
}

export interface OverpassResponse<E = unknown> {
  elements: E[];
}

export async function overpass<E = unknown>(query: string): Promise<OverpassResponse<E>> {
  const encoded = encodeURIComponent(query);
  let lastError: unknown;
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      console.log(`  → ${new URL(mirror).host}`);
      // react-doctor-disable-next-line react-doctor/async-await-in-loop -- Overpass mirrors are fallbacks; querying all public mirrors in parallel is wasteful and can trip rate limits.
      const body = await curlGet(`${mirror}?data=${encoded}`);
      const parsed = JSON.parse(body) as OverpassResponse<E> & { remark?: string };
      if (!Array.isArray(parsed.elements)) {
        throw new Error('unexpected response shape');
      }
      // Overpass responde 200 con un `remark` cuando el query falla o viene
      // parcial (runtime timeout, rate limit). Sin esto el mirror siguiente
      // no se intenta y el dataset se escribe degradado.
      if (parsed.remark) {
        throw new Error(`Overpass remark: ${parsed.remark}`);
      }
      return parsed;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`All Overpass mirrors failed: ${String(lastError)}`);
}

/**
 * Corta el sync cuando una query de bbox devuelve 0 elementos. Las queries del
 * visor cubren todo el Gran Concepción y siempre tienen datos, así que un
 * resultado vacío significa que la respuesta vino degradada: sin esta guarda
 * el script reescribe el dataset con una lista vacía (pasó con greenspace).
 */
export function assertOverpassElements<E>(elements: E[], label: string): void {
  if (elements.length === 0) {
    throw new Error(
      `Overpass devolvió 0 elementos para ${label}; se aborta sin tocar el dataset.`,
    );
  }
}
