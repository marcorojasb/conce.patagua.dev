// Builds real-rail polylines for Biotrén L1 and L2 by stitching together
// the OSM `railway=rail` ways operated by EFE Sur, ordered along the line
// of stations (which we already know from biotren.generated.ts).
//
// Strategy: pull every EFE rail way's geometry; index them by their endpoint
// nodes; then for each consecutive pair of stations we walk the rail graph
// from one to the next using a simple BFS through shared endpoints.
//
// Run: npm run sync:biotren-track

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { overpass } from './lib/overpass.ts';
import { simplify } from './lib/simplify.ts';
import { BIOTREN_L1_STOPS, BIOTREN_L2_STOPS } from '../src/data/biotren.generated.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../src/data/biotren-track.generated.ts');

const BBOX = '-37.10,-73.25,-36.65,-72.80';

interface WayEl {
  type: 'way';
  id: number;
  nodes: number[];
  geometry: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
}

async function fetchRailWays() {
  return overpass<WayEl>(`[out:json][timeout:60];
way["railway"="rail"]["operator"~"EFE",i](${BBOX});
out geom;`);
}

function round5(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

/**
 * Greedy walk: starting from the OSM node nearest to `from`, hop way-by-way
 * picking the unused way whose nearest endpoint extends the path closer to
 * `to` than where we currently are. Stops when within `targetEpsilon` meters
 * of `to` or after `maxHops` hops.
 *
 * Good enough for an open corridor like Biotrén where ways aren't ambiguous.
 */
function buildSegment(
  ways: WayEl[],
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Array<[number, number]> {
  const distM = (a: { lat: number; lon?: number; lng?: number }, b: { lat: number; lon?: number; lng?: number }) => {
    const aLng = (a as { lon?: number; lng?: number }).lon ?? (a as { lng?: number }).lng ?? 0;
    const bLng = (b as { lon?: number; lng?: number }).lon ?? (b as { lng?: number }).lng ?? 0;
    const R = 6371e3;
    const φ1 = (a.lat * Math.PI) / 180;
    const φ2 = (b.lat * Math.PI) / 180;
    const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
    const Δλ = ((bLng - aLng) * Math.PI) / 180;
    const x =
      Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };

  // For each way, find its midpoint distance to `from`/`to`.
  function nearestEnd(w: WayEl, p: { lat: number; lng: number }): 'start' | 'end' {
    const s = w.geometry[0];
    const e = w.geometry[w.geometry.length - 1];
    return distM(s, { lat: p.lat, lon: p.lng }) <= distM(e, { lat: p.lat, lon: p.lng })
      ? 'start'
      : 'end';
  }

  function wayDistanceTo(w: WayEl, p: { lat: number; lng: number }): number {
    let best = Infinity;
    for (const g of w.geometry) {
      const d = distM(g, { lat: p.lat, lon: p.lng });
      if (d < best) best = d;
    }
    return best;
  }

  // Pick the way closest to `from` to start with.
  const sorted = [...ways].sort(
    (a, b) => wayDistanceTo(a, from) - wayDistanceTo(b, from),
  );
  const startWay = sorted[0];
  if (!startWay) return [];

  const used = new Set<number>();
  used.add(startWay.id);
  const startSide = nearestEnd(startWay, from);
  let path: Array<[number, number]> =
    startSide === 'start'
      ? startWay.geometry.map((g) => [round5(g.lat), round5(g.lon)] as [number, number])
      : startWay.geometry
          .slice()
          .reverse()
          .map((g) => [round5(g.lat), round5(g.lon)] as [number, number]);
  let tail = path[path.length - 1];

  const maxHops = 80;
  const arriveEpsilon = 80; // meters
  let hop = 0;
  while (hop < maxHops) {
    const tailPt = { lat: tail[0], lon: tail[1] };
    const targetDist = distM(tailPt, { lat: to.lat, lon: to.lng });
    if (targetDist < arriveEpsilon) break;

    // Pick next way whose nearest endpoint is close to tail AND whose other
    // endpoint is closer to `to`.
    let bestWay: WayEl | null = null;
    let bestScore = Infinity;
    let bestReverse = false;
    for (const w of ways) {
      if (used.has(w.id)) continue;
      const s = w.geometry[0];
      const e = w.geometry[w.geometry.length - 1];
      const dStart = distM(s, tailPt);
      const dEnd = distM(e, tailPt);
      if (Math.min(dStart, dEnd) > 200) continue;

      const reverse = dEnd < dStart;
      const otherEnd = reverse ? s : e;
      const dToTarget = distM(otherEnd, { lat: to.lat, lon: to.lng });
      const score = Math.min(dStart, dEnd) + dToTarget * 1.05;
      if (score < bestScore) {
        bestScore = score;
        bestWay = w;
        bestReverse = reverse;
      }
    }

    if (!bestWay) break;
    used.add(bestWay.id);
    const segment = bestReverse ? [...bestWay.geometry].reverse() : bestWay.geometry;
    for (const g of segment) {
      const next: [number, number] = [round5(g.lat), round5(g.lon)];
      // Skip duplicate join point.
      if (next[0] === tail[0] && next[1] === tail[1]) continue;
      path.push(next);
      tail = next;
    }
    hop += 1;
  }

  return path;
}

function buildLine(
  ways: WayEl[],
  stops: typeof BIOTREN_L1_STOPS,
): Array<[number, number]> {
  if (stops.length < 2) return [];
  const path: Array<[number, number]> = [[stops[0].lat, stops[0].lng]];
  for (let i = 1; i < stops.length; i++) {
    const seg = buildSegment(ways, stops[i - 1], stops[i]);
    if (seg.length === 0) {
      // Fallback: straight line.
      path.push([stops[i].lat, stops[i].lng]);
      continue;
    }
    for (const p of seg) {
      const tail = path[path.length - 1];
      if (tail && tail[0] === p[0] && tail[1] === p[1]) continue;
      path.push(p);
    }
    // Make sure we end exactly at the station.
    path.push([stops[i].lat, stops[i].lng]);
  }
  return path;
}

function render(l1: Array<[number, number]>, l2: Array<[number, number]>): string {
  const banner = `// AUTO-GENERATED by scripts/fetch-biotren-track.ts on ${new Date().toISOString()}.
// Source: OpenStreetMap (Overpass API) — railway=rail ways operated by EFE Sur,
// stitched into ordered polylines following the Biotrén stop sequence.
// Re-generate: \`npm run sync:biotren-track\`.

import type { LatLngTuple } from '@/types/transport';
`;
  const lit = (path: Array<[number, number]>) =>
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

  console.log('Building L1 track…');
  const l1Raw = buildLine(ways, BIOTREN_L1_STOPS);
  const l1 = simplify(l1Raw, 5e-5); // ~5 m, tighter than buses since less data
  console.log(`  → L1: ${l1Raw.length} raw → ${l1.length} simplified`);

  console.log('Building L2 track…');
  const l2Raw = buildLine(ways, BIOTREN_L2_STOPS);
  const l2 = simplify(l2Raw, 5e-5);
  console.log(`  → L2: ${l2Raw.length} raw → ${l2.length} simplified`);

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, render(l1, l2));
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
