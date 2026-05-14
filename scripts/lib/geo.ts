// Lightweight geo helpers for build-time scripts.
// Distances use the equirectangular approximation — accurate enough below ~5°
// of separation, which more than covers Concepción metro.

export type LatLng = [number, number];

const M_PER_DEG_LAT = 111_320;

export function distanceMeters(a: LatLng, b: LatLng): number {
  const meanLat = ((a[0] + b[0]) / 2) * (Math.PI / 180);
  const dy = (a[0] - b[0]) * M_PER_DEG_LAT;
  const dx = (a[1] - b[1]) * M_PER_DEG_LAT * Math.cos(meanLat);
  return Math.sqrt(dx * dx + dy * dy);
}

/** Cumulative distance from path[0] to each path[i], in meters. */
export function cumulativeDistances(path: LatLng[]): number[] {
  const out = new Array<number>(path.length);
  out[0] = 0;
  for (let i = 1; i < path.length; i++) {
    out[i] = out[i - 1] + distanceMeters(path[i - 1], path[i]);
  }
  return out;
}

/**
 * For a `target` lat/lng and a polyline, return the index of the nearest
 * polyline vertex along with that vertex's perpendicular distance in meters.
 * Good enough for matching transit stops to nearby routes — the polylines
 * have been pre-simplified to ~16 m so segment midpoints rarely miss.
 */
export function nearestVertex(path: LatLng[], target: LatLng): { idx: number; d: number } {
  let bestIdx = 0;
  let bestD = Infinity;
  for (let i = 0; i < path.length; i++) {
    const d = distanceMeters(path[i], target);
    if (d < bestD) {
      bestD = d;
      bestIdx = i;
    }
  }
  return { idx: bestIdx, d: bestD };
}
