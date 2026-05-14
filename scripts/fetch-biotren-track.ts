// Builds real-rail polylines for Biotrén L1 and L2 by stitching the OSM
// `railway=rail` ways operated by EFE Sur into a graph and running a
// corridor-constrained Dijkstra between each consecutive station pair.
//
// The graph keeps OSM node ids as vertices and weights edges by haversine
// distance between consecutive nodes inside each way. For each station pair
// (A, B) the corridor mask keeps only nodes within ~600 m of the segment AB,
// which throws away freight branches, industrial spurs, and harbor sidings
// that share the EFE Sur operator tag but are nowhere near the Biotrén line.
//
// Run: npm run sync:biotren-track

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { overpass } from './lib/overpass.ts';
import { simplify } from './lib/simplify.ts';
import {
  distanceMeters,
  pointToSegmentMeters,
  type LatLng,
} from './lib/geo.ts';
import { dijkstra, type AdjEntry } from './lib/dijkstra.ts';
import { BIOTREN_L1_STOPS, BIOTREN_L2_STOPS } from '../src/data/biotren.generated.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../src/data/biotren-track.generated.ts');

const BBOX = '-37.10,-73.25,-36.65,-72.80';
const CORRIDOR_HALF_WIDTH_M = 600;
const SIMPLIFY_TOLERANCE = 5e-5; // ~5 m

interface WayEl {
  type: 'way';
  id: number;
  nodes: number[];
  geometry: Array<{ lat: number; lon: number }>;
}

async function fetchRailWays() {
  return overpass<WayEl>(`[out:json][timeout:60];
way["railway"="rail"]["operator"~"EFE",i](${BBOX});
out geom;`);
}

interface Stop {
  lat: number;
  lng: number;
}

function buildGraph(ways: WayEl[]) {
  const coords = new Map<number, LatLng>();
  const adj = new Map<number, AdjEntry[]>();

  for (const w of ways) {
    if (!w.nodes || !w.geometry || w.nodes.length !== w.geometry.length) continue;
    for (let i = 0; i < w.nodes.length; i++) {
      const id = w.nodes[i];
      const pt = w.geometry[i];
      coords.set(id, [pt.lat, pt.lon]);
    }
    for (let i = 0; i < w.nodes.length - 1; i++) {
      const a = w.nodes[i];
      const b = w.nodes[i + 1];
      const ca = w.geometry[i];
      const cb = w.geometry[i + 1];
      const d = distanceMeters([ca.lat, ca.lon], [cb.lat, cb.lon]);
      pushEdge(adj, a, b, d);
      pushEdge(adj, b, a, d);
    }
  }
  return { coords, adj };
}

function pushEdge(adj: Map<number, AdjEntry[]>, from: number, to: number, w: number) {
  const list = adj.get(from) ?? [];
  // Dedupe parallel edges; keep the shorter one.
  const existing = list.find((e) => e.to === to);
  if (existing) {
    if (w < existing.w) existing.w = w;
  } else {
    list.push({ to, w });
  }
  adj.set(from, list);
}

function nearestNodeId(coords: Map<number, LatLng>, target: Stop): number | null {
  let best: { id: number; d: number } | null = null;
  for (const [id, c] of coords) {
    const d = distanceMeters(c, [target.lat, target.lng]);
    if (!best || d < best.d) best = { id, d };
  }
  return best?.id ?? null;
}

function corridorMask(
  coords: Map<number, LatLng>,
  a: Stop,
  b: Stop,
): Set<number> {
  const aLL: LatLng = [a.lat, a.lng];
  const bLL: LatLng = [b.lat, b.lng];
  const allowed = new Set<number>();
  for (const [id, c] of coords) {
    if (pointToSegmentMeters(c, aLL, bLL) <= CORRIDOR_HALF_WIDTH_M) {
      allowed.add(id);
    }
  }
  return allowed;
}

function buildLine(
  coords: Map<number, LatLng>,
  adj: Map<number, AdjEntry[]>,
  stops: Stop[],
  name: string,
): LatLng[] {
  if (stops.length < 2) return [];
  const out: LatLng[] = [[stops[0].lat, stops[0].lng]];
  let fallbacks = 0;
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    const allowed = corridorMask(coords, a, b);
    // Inside the corridor, find graph entry / exit nodes nearest to each stop.
    let startId: number | null = null;
    let endId: number | null = null;
    let bestStartD = Infinity;
    let bestEndD = Infinity;
    for (const id of allowed) {
      const c = coords.get(id)!;
      const da = distanceMeters(c, [a.lat, a.lng]);
      if (da < bestStartD) {
        bestStartD = da;
        startId = id;
      }
      const db = distanceMeters(c, [b.lat, b.lng]);
      if (db < bestEndD) {
        bestEndD = db;
        endId = id;
      }
    }
    if (startId == null || endId == null) {
      fallbacks += 1;
      out.push([b.lat, b.lng]);
      continue;
    }
    const nodeIds = dijkstra(adj, startId, endId, allowed);
    if (nodeIds.length < 2) {
      fallbacks += 1;
      out.push([b.lat, b.lng]);
      continue;
    }
    for (const id of nodeIds) {
      const c = coords.get(id)!;
      const tail = out[out.length - 1];
      if (tail && tail[0] === c[0] && tail[1] === c[1]) continue;
      out.push(c);
    }
    // Always anchor at the station coordinate.
    const tail = out[out.length - 1];
    if (tail[0] !== b.lat || tail[1] !== b.lng) {
      out.push([b.lat, b.lng]);
    }
  }
  if (fallbacks > 0) {
    console.warn(`  ! ${name}: ${fallbacks}/${stops.length - 1} segments fell back to straight line`);
  }
  return out;
}

function render(l1: LatLng[], l2: LatLng[]): string {
  const banner = `// AUTO-GENERATED by scripts/fetch-biotren-track.ts on ${new Date().toISOString()}.
// Source: OpenStreetMap (Overpass API) — railway=rail ways operated by EFE Sur,
// stitched via corridor-Dijkstra between consecutive Biotrén stops.
// Re-generate: \`npm run sync:biotren-track\`.

import type { LatLngTuple } from '@/types/transport';
`;
  const lit = (path: LatLng[]) =>
    '[' + path.map(([la, ln]) => `[${la},${ln}]`).join(',') + ']';
  return `${banner}
export const BIOTREN_L1_TRACK: LatLngTuple[] = ${lit(l1)};
export const BIOTREN_L2_TRACK: LatLngTuple[] = ${lit(l2)};
`;
}

async function main() {
  console.log('Fetching EFE rail ways from Overpass…');
  const data = await fetchRailWays();
  const ways = data.elements.filter((e): e is WayEl => e.type === 'way' && !!e.geometry);
  console.log(`  → ${ways.length} rail ways with geometry`);

  console.log('Building rail graph…');
  const { coords, adj } = buildGraph(ways);
  console.log(`  → ${coords.size} unique rail nodes / ${adj.size} adj entries`);

  console.log('Solving L1 corridor (Hualqui ↔ Mercado Talcahuano)…');
  const l1Raw = buildLine(coords, adj, BIOTREN_L1_STOPS, 'L1');
  const l1 = simplify(l1Raw as Array<[number, number]>, SIMPLIFY_TOLERANCE);
  console.log(`  → L1: ${l1Raw.length} raw → ${l1.length} simplified`);

  console.log('Solving L2 corridor (Coronel ↔ Concepción)…');
  const l2Raw = buildLine(coords, adj, BIOTREN_L2_STOPS, 'L2');
  const l2 = simplify(l2Raw as Array<[number, number]>, SIMPLIFY_TOLERANCE);
  console.log(`  → L2: ${l2Raw.length} raw → ${l2.length} simplified`);

  // Find unique node IDs not referenced (sanity check — unused).
  if (coords.size > 0 && adj.size === 0) {
    throw new Error('Graph has no edges; rail data likely malformed.');
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, render(l1, l2));
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
