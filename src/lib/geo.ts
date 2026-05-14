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
