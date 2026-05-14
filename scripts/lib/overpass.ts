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
      const body = await curlGet(`${mirror}?data=${encoded}`);
      const parsed = JSON.parse(body) as OverpassResponse<E>;
      if (!Array.isArray(parsed.elements)) {
        throw new Error('unexpected response shape');
      }
      return parsed;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`All Overpass mirrors failed: ${String(lastError)}`);
}
