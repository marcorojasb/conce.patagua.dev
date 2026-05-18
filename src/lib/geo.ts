// Browser-runtime geo helpers (mirror of scripts/lib/geo.ts).
// Kept tiny so it bundles cheaply for client-side proximity computations.

export type LatLng = [number, number];

const M_PER_DEG_LAT = 111_320;

export function distanceMeters(a: LatLng, b: LatLng): number {
  const meanLat = ((a[0] + b[0]) / 2) * (Math.PI / 180);
  const dy = (a[0] - b[0]) * M_PER_DEG_LAT;
  const dx = (a[1] - b[1]) * M_PER_DEG_LAT * Math.cos(meanLat);
  return Math.sqrt(dx * dx + dy * dy);
}

export function densifyPath(path: LatLng[], maxSegmentMeters = 350): LatLng[] {
  if (path.length < 2) return path;
  const out: LatLng[] = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const d = distanceMeters(a, b);
    const steps = Math.max(1, Math.ceil(d / maxSegmentMeters));
    for (let j = 1; j <= steps; j++) {
      const t = j / steps;
      out.push([
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
      ]);
    }
  }
  return out;
}

export function maxSegmentMeters(path: LatLng[]): number {
  let max = 0;
  for (let i = 1; i < path.length; i++) {
    max = Math.max(max, distanceMeters(path[i - 1], path[i]));
  }
  return max;
}

function pointToSegmentDistanceMeters(p: LatLng, a: LatLng, b: LatLng): number {
  const meanLat = ((a[0] + b[0] + p[0]) / 3) * (Math.PI / 180);
  const ax = a[1] * M_PER_DEG_LAT * Math.cos(meanLat);
  const ay = a[0] * M_PER_DEG_LAT;
  const bx = b[1] * M_PER_DEG_LAT * Math.cos(meanLat);
  const by = b[0] * M_PER_DEG_LAT;
  const px = p[1] * M_PER_DEG_LAT * Math.cos(meanLat);
  const py = p[0] * M_PER_DEG_LAT;
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy || 1)));
  const dx = px - (ax + t * vx);
  const dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceToPathMeters(point: LatLng, path: LatLng[]): number {
  if (path.length === 0) return Infinity;
  if (path.length === 1) return distanceMeters(point, path[0]);
  let min = Infinity;
  for (let i = 1; i < path.length; i++) {
    min = Math.min(min, pointToSegmentDistanceMeters(point, path[i - 1], path[i]));
  }
  return min;
}
