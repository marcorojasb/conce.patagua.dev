// Pulls all OSM bus route relations in the greater Concepción metro area
// and emits a typed module with each route's polyline geometry.
//
// Run: npm run sync:bus-routes
//
// Output is a self-contained list of routes — no station references back
// into the OSM graph. Stops are not included here because the separate
// `paraderos.generated` layer already covers them.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { overpass } from './lib/overpass.ts';
import { simplify } from './lib/simplify.ts';
import {
  cumulativeDistances,
  distanceMeters,
  nearestVertex,
} from './lib/geo.ts';
import { PARADEROS } from '../src/data/paraderos.generated.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../src/data/bus-routes.generated.ts');

const BBOX = '-37.10,-73.25,-36.65,-72.80';

interface OverpassRelation {
  type: 'relation';
  id: number;
  members: Array<{
    type: 'node' | 'way' | 'relation';
    ref: number;
    role: string;
    geometry?: Array<{ lat: number; lon: number }>;
  }>;
  tags?: Record<string, string>;
}

async function queryOverpass() {
  return overpass<OverpassRelation>(`[out:json][timeout:90];
relation["type"="route"]["route"="bus"](${BBOX});
out geom;`);
}

interface Resolved {
  id: string;
  osmId: number;
  ref: string;
  name: string;
  operator?: string;
  network?: string;
  colour?: string;
  /** Flat polyline of [lat, lng] pairs, stitched from way members in order. */
  path: Array<[number, number]>;
  /** Paradero ids matched to this route by ≤30 m proximity, ordered along the path. */
  stopIds: string[];
}

const MATCH_DISTANCE_M = 30;

function dedupConsecutive(path: Array<[number, number]>): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let prev: [number, number] | null = null;
  for (const p of path) {
    if (prev && Math.abs(prev[0] - p[0]) < 1e-7 && Math.abs(prev[1] - p[1]) < 1e-7) {
      continue;
    }
    out.push(p);
    prev = p;
  }
  return out;
}

/** Rounds coords to 5 decimals (~1 m precision) to cut JSON size by ~30%. */
function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

/**
 * Returns paradero ids whose nearest vertex on `path` is within
 * MATCH_DISTANCE_M, sorted by their progress along the polyline. Consecutive
 * duplicates are collapsed (a paradero can be the closest to several adjacent
 * vertices after simplification).
 */
function matchParaderos(path: Array<[number, number]>): string[] {
  const cum = cumulativeDistances(path);
  const matched: Array<{ id: string; progress: number }> = [];
  for (const p of PARADEROS) {
    const { idx, d } = nearestVertex(path, [p.lat, p.lng]);
    if (d <= MATCH_DISTANCE_M) {
      matched.push({ id: p.id, progress: cum[idx] });
    }
  }
  matched.sort((a, b) => a.progress - b.progress);
  const out: string[] = [];
  for (const m of matched) {
    if (out[out.length - 1] !== m.id) out.push(m.id);
  }
  return out;
}

interface WayGeom {
  geometry: Array<{ lat: number; lon: number }>;
}

const ENDPOINT_KEY_PRECISION = 6;
const keyOf = (pt: { lat: number; lon: number }) =>
  `${pt.lat.toFixed(ENDPOINT_KEY_PRECISION)},${pt.lon.toFixed(ENDPOINT_KEY_PRECISION)}`;

/**
 * Stitches a list of OSM way members into a single ordered polyline by
 * walking the endpoint graph from a terminus.
 *
 * Hard cutoff: the walker refuses to bridge gaps wider than `MAX_GAP_M`.
 * When the next unused way's nearest endpoint exceeds that distance, the
 * walk stops and any remaining ways are dropped. Rationale: when the OSM
 * relation has unrelated/missing ways, jumping across them creates the
 * 10+ km "reach-back" artefacts that previously plagued routes like 16I
 * and 81C. A shorter-but-clean polyline beats a complete-but-corrupt one.
 *
 * Determinism: we try every endpoint that appears in exactly one way as a
 * candidate start, plus a fallback (way 0 from its start). We pick the
 * candidate whose resulting walk consumes the most ways before hitting the
 * cutoff. Ties broken by total walk length. This makes the output stable
 * across runs.
 */
const MAX_GAP_M = 200;

function walkFrom(
  ways: WayGeom[],
  startIdx: number,
  startFlip: boolean,
): { path: Array<[number, number]>; consumed: number; maxGap: number } {
  const used = new Set<number>([startIdx]);
  const firstGeom = startFlip
    ? [...ways[startIdx].geometry].reverse()
    : ways[startIdx].geometry;
  const path: Array<[number, number]> = firstGeom.map((p) => [
    round5(p.lat),
    round5(p.lon),
  ]);
  let maxGap = 0;
  while (used.size < ways.length) {
    const tail = path[path.length - 1];
    let bestIdx = -1;
    let bestDist = Infinity;
    let bestFlip = false;
    for (let i = 0; i < ways.length; i++) {
      if (used.has(i)) continue;
      const g = ways[i].geometry;
      const dStart = distanceMeters([tail[0], tail[1]], [g[0].lat, g[0].lon]);
      const dEnd = distanceMeters(
        [tail[0], tail[1]],
        [g[g.length - 1].lat, g[g.length - 1].lon],
      );
      if (dStart < bestDist) {
        bestDist = dStart;
        bestIdx = i;
        bestFlip = false;
      }
      if (dEnd < bestDist) {
        bestDist = dEnd;
        bestIdx = i;
        bestFlip = true;
      }
    }
    if (bestIdx === -1 || bestDist > MAX_GAP_M) break;
    if (bestDist > maxGap) maxGap = bestDist;
    used.add(bestIdx);
    const g = bestFlip
      ? [...ways[bestIdx].geometry].reverse()
      : ways[bestIdx].geometry;
    const startJ =
      Math.abs(g[0].lat - tail[0]) < 1e-5 && Math.abs(g[0].lon - tail[1]) < 1e-5
        ? 1
        : 0;
    for (let j = startJ; j < g.length; j++) {
      path.push([round5(g[j].lat), round5(g[j].lon)]);
    }
  }
  return { path, consumed: used.size, maxGap };
}

function stitchWays(rawWays: WayGeom[]): {
  path: Array<[number, number]>;
  consumed: number;
  total: number;
  maxGap: number;
} {
  const ways = rawWays.filter((w) => w.geometry && w.geometry.length >= 2);
  if (ways.length === 0)
    return { path: [], consumed: 0, total: 0, maxGap: 0 };
  if (ways.length === 1) {
    return {
      path: ways[0].geometry.map((p) => [round5(p.lat), round5(p.lon)]),
      consumed: 1,
      total: 1,
      maxGap: 0,
    };
  }

  type Endpoint = { wayIdx: number; atStart: boolean };
  const endpoints = new Map<string, Endpoint[]>();
  for (let i = 0; i < ways.length; i++) {
    const g = ways[i].geometry;
    const sk = keyOf(g[0]);
    const ek = keyOf(g[g.length - 1]);
    if (!endpoints.has(sk)) endpoints.set(sk, []);
    if (!endpoints.has(ek)) endpoints.set(ek, []);
    endpoints.get(sk)!.push({ wayIdx: i, atStart: true });
    endpoints.get(ek)!.push({ wayIdx: i, atStart: false });
  }

  // Collect every terminus candidate (endpoint that belongs to exactly one
  // way). For each, attempt the walk; keep the result that consumed the
  // most ways. Stable tie-break: shorter polyline first (favours tight
  // stitching over scenic detours), then way-index ascending.
  const candidates: Array<{ idx: number; flip: boolean }> = [];
  for (const eps of endpoints.values()) {
    if (eps.length === 1) {
      candidates.push({ idx: eps[0].wayIdx, flip: !eps[0].atStart });
    }
  }
  if (candidates.length === 0) {
    candidates.push({ idx: 0, flip: false });
  }
  candidates.sort((a, b) => (a.idx - b.idx) || (Number(a.flip) - Number(b.flip)));

  let best = walkFrom(ways, candidates[0].idx, candidates[0].flip);
  for (let i = 1; i < candidates.length; i++) {
    const r = walkFrom(ways, candidates[i].idx, candidates[i].flip);
    if (
      r.consumed > best.consumed ||
      (r.consumed === best.consumed && r.path.length < best.path.length)
    ) {
      best = r;
    }
  }

  return {
    path: best.path,
    consumed: best.consumed,
    total: ways.length,
    maxGap: best.maxGap,
  };
}

interface BuildOutput {
  resolved: Resolved | null;
  truncated: boolean;
  total: number;
  consumed: number;
  maxGap: number;
}

function buildRoute(rel: OverpassRelation): BuildOutput {
  const tags = rel.tags ?? {};
  const ref = tags.ref;
  const name = tags.name;
  if (!ref || !name)
    return { resolved: null, truncated: false, total: 0, consumed: 0, maxGap: 0 };

  const wayMembers: WayGeom[] = rel.members
    .filter((m) => m.type === 'way' && !!m.geometry)
    .map((m) => ({ geometry: m.geometry! }));

  const { path, consumed, total, maxGap } = stitchWays(wayMembers);
  const truncated = consumed < total;

  // 1.5e-4 ≈ 16 m at Concepción latitude — invisible at city zoom, cuts
  // the bundle by ~85 %.
  const cleaned = simplify(dedupConsecutive(path), 1.5e-4);
  if (cleaned.length < 2)
    return { resolved: null, truncated, total, consumed, maxGap };
  const stopIds = matchParaderos(cleaned);

  const out: Resolved = {
    id: `osm-bus-${rel.id}`,
    osmId: rel.id,
    ref,
    name,
    path: cleaned,
    stopIds,
  };
  if (tags.operator) out.operator = tags.operator;
  if (tags.network) out.network = tags.network;
  if (tags.colour) out.colour = tags.colour;
  return { resolved: out, truncated, total, consumed, maxGap };
}

function render(routes: Resolved[]): string {
  const banner = `// AUTO-GENERATED by scripts/fetch-bus-routes.ts on ${new Date().toISOString()}.
// Source: OpenStreetMap (Overpass API) — type=route route=bus relations
// within the Biobío metro bbox. ${routes.length} routes total.
// Re-generate: \`npm run sync:bus-routes\`.

import type { BusRoute } from '@/types/transport';
`;
  const literal =
    '[\n' +
    routes
      .map((r) => {
        const parts = [
          `id:'${r.id}'`,
          `osmId:${r.osmId}`,
          `ref:${JSON.stringify(r.ref)}`,
          `name:${JSON.stringify(r.name)}`,
        ];
        if (r.operator) parts.push(`operator:${JSON.stringify(r.operator)}`);
        if (r.network) parts.push(`network:${JSON.stringify(r.network)}`);
        if (r.colour) parts.push(`colour:${JSON.stringify(r.colour)}`);
        const pathStr = '[' + r.path.map(([la, ln]) => `[${la},${ln}]`).join(',') + ']';
        parts.push(`path:${pathStr}`);
        const stopsStr = '[' + r.stopIds.map((id) => JSON.stringify(id)).join(',') + ']';
        parts.push(`stopIds:${stopsStr}`);
        return `  {${parts.join(',')}},`;
      })
      .join('\n') +
    '\n]';
  return `${banner}
export const BUS_ROUTES: BusRoute[] = ${literal};
`;
}

async function main() {
  console.log('Fetching bus route relations from Overpass…');
  const data = await queryOverpass();
  console.log(`  → ${data.elements.length} relations`);

  const built = data.elements.map((rel) => ({
    rel,
    ...buildRoute(rel),
  }));
  const routes = built
    .map((b) => b.resolved)
    .filter((r): r is Resolved => r !== null);
  const truncated = built.filter((b) => b.truncated && b.resolved);
  const truncatedDropped = built.reduce(
    (acc, b) => (b.truncated ? acc + (b.total - b.consumed) : acc),
    0,
  );

  console.log(`  → ${routes.length} routes with usable geometry`);
  console.log(
    `  → ${truncated.length} routes truncated at MAX_GAP_M (${truncatedDropped} ways dropped total)`,
  );
  if (truncated.length > 0) {
    console.log('  truncated routes (ref · osmId · consumed/total · maxGap m):');
    for (const b of truncated.slice(0, 20)) {
      const tags = b.rel.tags ?? {};
      console.log(
        `    ${(tags.ref ?? '?').padEnd(8)} ${b.rel.id}  ${b.consumed}/${b.total}  gap=${Math.round(b.maxGap)}`,
      );
    }
    if (truncated.length > 20) console.log(`    + ${truncated.length - 20} more`);
  }

  const totalPts = routes.reduce((acc, r) => acc + r.path.length, 0);
  const totalStops = routes.reduce((acc, r) => acc + r.stopIds.length, 0);
  console.log(`  → ${totalPts} polyline points · ${totalStops} stop matches`);

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, render(routes));
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
