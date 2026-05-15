// Projects vehicle positions from the GTFS scheduled-trip dataset.
//
// "Simulated" because the data source is the static schedule, not real GPS:
// a bus shown at point X is where its scheduled trip *should* be at the
// current moment assuming on-time service. Real-world delays, cancellations,
// and detours are invisible here. The UI must communicate that honestly.

import type { LatLngTuple, RouteSchedule, SimulatedVehicle } from '@/types/transport';

interface RouteWithPath {
  id: string;
  color: string;
  path: LatLngTuple[];
}

/**
 * Returns the JS weekday index normalized so Monday=0..Sunday=6 — matches
 * the layout of RouteSchedule buckets.
 */
export function isoDayOfWeek(date: Date): number {
  // JS getDay(): 0=Sunday..6=Saturday. We want 0=Monday..6=Sunday.
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

/**
 * Picks a point at fractional `progress` (0..1) along `path`. Returns the
 * interpolated lat/lng plus the bearing of the underlying segment so the
 * vehicle marker can be oriented.
 */
function pointAtProgress(
  path: LatLngTuple[],
  cumulative: number[],
  total: number,
  progress: number,
): { lat: number; lng: number; bearing: number } {
  if (path.length === 0) return { lat: 0, lng: 0, bearing: 0 };
  if (path.length === 1) {
    return { lat: path[0][0], lng: path[0][1], bearing: 0 };
  }
  const target = Math.max(0, Math.min(1, progress)) * total;
  // Binary search the segment containing `target`.
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] <= target) lo = mid;
    else hi = mid;
  }
  const segStart = cumulative[lo];
  const segEnd = cumulative[lo + 1];
  const span = segEnd - segStart || 1;
  const t = (target - segStart) / span;
  const [aLat, aLng] = path[lo];
  const [bLat, bLng] = path[lo + 1];
  const lat = aLat + (bLat - aLat) * t;
  const lng = aLng + (bLng - aLng) * t;
  // Bearing from a→b: atan2(Δlng·cos(meanLat), Δlat)
  const meanLat = ((aLat + bLat) / 2) * (Math.PI / 180);
  const dy = bLat - aLat;
  const dx = (bLng - aLng) * Math.cos(meanLat);
  const bearing = ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
  return { lat, lng, bearing };
}

interface RouteGeometry {
  path: LatLngTuple[];
  cumulative: number[];
  total: number;
  color: string;
}

const geometryCache = new Map<string, RouteGeometry>();
function geometryFor(route: RouteWithPath): RouteGeometry {
  let cached = geometryCache.get(route.id);
  if (cached) return cached;
  const cumulative = [0];
  for (let i = 1; i < route.path.length; i++) {
    const [aLat, aLng] = route.path[i - 1];
    const [bLat, bLng] = route.path[i];
    const dy = (bLat - aLat) * 111_320;
    const meanLat = ((aLat + bLat) / 2) * (Math.PI / 180);
    const dx = (bLng - aLng) * 111_320 * Math.cos(meanLat);
    cumulative.push(cumulative[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const total = cumulative[cumulative.length - 1] ?? 0;
  cached = { path: route.path, cumulative, total, color: route.color };
  geometryCache.set(route.id, cached);
  return cached;
}

/**
 * Computes the set of vehicles that should be in transit at `now` for the
 * given routes, using the per-route schedule dataset.
 */
export function computeActiveVehicles(
  now: Date,
  routes: RouteWithPath[],
  schedules: Record<string, RouteSchedule>,
): SimulatedVehicle[] {
  const day = isoDayOfWeek(now);
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const out: SimulatedVehicle[] = [];

  for (const route of routes) {
    const sched = schedules[route.id];
    if (!sched) continue;
    const todays = sched[day];
    if (!todays || todays.length === 0) continue;

    const geom = geometryFor(route);
    if (geom.total === 0) continue;

    for (let i = 0; i < todays.length; i++) {
      const [startMin, durationMin] = todays[i];
      const elapsed = nowMin - startMin;
      // Overnight services: GTFS encodes start/durations using minutes that
      // can exceed 24*60. nowMin is wrapped to [0,1440). If a trip started
      // late today but its window still encompasses nowMin, project it.
      const inWindowToday = elapsed >= 0 && elapsed <= durationMin;
      const inWindowYesterday =
        startMin > 1440 - durationMin &&
        elapsed + 1440 >= 0 &&
        elapsed + 1440 <= durationMin;
      if (!inWindowToday && !inWindowYesterday) continue;
      const eff = inWindowToday ? elapsed : elapsed + 1440;
      const progress = eff / durationMin;
      const pt = pointAtProgress(geom.path, geom.cumulative, geom.total, progress);
      out.push({
        id: `${route.id}|${startMin}`,
        routeId: route.id,
        progress,
        lat: pt.lat,
        lng: pt.lng,
        bearing: pt.bearing,
        elapsedMin: eff,
        durationMin,
        startMin,
      });
    }
  }
  return out;
}
