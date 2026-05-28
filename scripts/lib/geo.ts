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

/**
 * Perpendicular distance from `p` to the line segment a–b, in meters,
 * using an equirectangular projection centered on the segment.
 */
export function pointToSegmentMeters(p: LatLng, a: LatLng, b: LatLng): number {
  const latMid = (a[0] + b[0]) / 2;
  const mPerLat = M_PER_DEG_LAT;
  const mPerLng = M_PER_DEG_LAT * Math.cos(latMid * (Math.PI / 180));
  const ax = 0;
  const ay = 0;
  const bx = (b[1] - a[1]) * mPerLng;
  const by = (b[0] - a[0]) * mPerLat;
  const px = (p[1] - a[1]) * mPerLng;
  const py = (p[0] - a[0]) * mPerLat;
  const segLen2 = bx * bx + by * by;
  if (segLen2 === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  let t = (px * bx + py * by) / segLen2;
  t = Math.max(0, Math.min(1, t));
  const cx = bx * t;
  const cy = by * t;
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}
