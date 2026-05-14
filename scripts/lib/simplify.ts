// Ramer–Douglas–Peucker polyline simplification.
// Tolerance is in degrees; ~0.0001 ≈ 11 m at Concepción latitude — invisible
// at city zoom levels but cuts point counts by ~80–95 %.

export type Point = [number, number];

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    const ex = px - ax;
    const ey = py - ay;
    return Math.sqrt(ex * ex + ey * ey);
  }
  // Distance from point (px,py) to the line through (ax,ay)→(bx,by).
  const num = Math.abs(dy * px - dx * py + bx * ay - by * ax);
  const den = Math.sqrt(dx * dx + dy * dy);
  return num / den;
}

export function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length < 3) return points.slice();
  // Iterative DP to avoid stack overflow on long lines.
  const keep = new Array<boolean>(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack: Array<[number, number]> = [[0, points.length - 1]];

  while (stack.length) {
    const [first, last] = stack.pop()!;
    if (last <= first + 1) continue;
    let maxDist = 0;
    let maxIdx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpendicularDistance(points[i], points[first], points[last]);
      if (d > maxDist) {
        maxDist = d;
        maxIdx = i;
      }
    }
    if (maxDist > tolerance && maxIdx !== -1) {
      keep[maxIdx] = true;
      stack.push([first, maxIdx], [maxIdx, last]);
    }
  }
  const out: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    if (keep[i]) out.push(points[i]);
  }
  return out;
}
