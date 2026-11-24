// Projects vehicle positions from scheduled trips: GTFS oficial DTPR (one
// schedule per direction) and the official EFE itineraries for Biotrén.
//
// "Simulated" because the data source is the static schedule, not real GPS:
// a bus shown at point X is where its scheduled trip *should* be at the
// current moment assuming on-time service. Real-world delays, cancellations,
// and detours are invisible here. The UI must communicate that honestly.

import { STATIC_SERVICE_PATTERNS } from '@/data/static-service-patterns';
import { chileClock } from '@/lib/chile-time';
import type {
  LatLngTuple,
  Route,
  RouteSchedule,
  SimulatedVehicle,
  SimulationConfidence,
  SimulationSourceKind,
} from '@/types/transport';

export interface SimulationRouteInput {
  /** Clave del horario: `<routeId>#<directionId>` en GTFS, id del patrón en Biotrén. */
  id: string;
  routeId?: string;
  color: string;
  path: LatLngTuple[];
  directionLabel?: string;
  sourceKind?: SimulationSourceKind;
  confidence?: SimulationConfidence;
  sourceLabel?: string;
  sourceUrl?: string;
  note?: string;
}

/**
 * Una entrada por sentido: cada sentido GTFS recorre su propio trazado con
 * los viajes de ROUTE_DIRECTION_SCHEDULES; Biotrén usa sus patrones EFE sobre
 * la vía (al revés para el regreso).
 */
export function buildSimulationRoutes(routes: readonly Route[]): SimulationRouteInput[] {
  const out: SimulationRouteInput[] = [];
  for (const route of routes) {
    for (const direction of route.directions ?? []) {
      const destination = direction.destination ?? direction.headsign;
      out.push({
        id: `${route.id}#${direction.directionId}`,
        routeId: route.id,
        color: route.color,
        path: direction.path,
        directionLabel: direction.variant ? `${direction.variant} → ${destination}` : `Hacia ${destination}`,
        sourceKind: 'gtfs',
        confidence: 'official',
        sourceLabel: 'DTPR',
      });
    }
  }
  const routeById = new Map(routes.map((route) => [route.id, route]));
  for (const pattern of STATIC_SERVICE_PATTERNS) {
    const route = routeById.get(pattern.routeId);
    if (!route) continue;
    out.push({
      id: pattern.id,
      routeId: pattern.routeId,
      color: route.color,
      path: pattern.direction === 'reverse' ? [...route.path].reverse() : route.path,
      directionLabel: pattern.directionLabel,
      sourceKind: pattern.sourceKind,
      confidence: pattern.confidence,
      sourceLabel: pattern.sourceLabel,
      sourceUrl: pattern.sourceUrl,
      note: pattern.note,
    });
  }
  return out;
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
function geometryFor(route: SimulationRouteInput): RouteGeometry {
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
 * given routes, using the per-direction schedule dataset.
 */
export function computeActiveVehicles(
  now: Date,
  routes: SimulationRouteInput[],
  schedules: Record<string, RouteSchedule>,
): SimulatedVehicle[] {
  const { day, minutes: nowMin } = chileClock(now);
  const yesterday = (day + 6) % 7;

  const out: SimulatedVehicle[] = [];

  for (const route of routes) {
    const sched = schedules[route.id];
    if (!sched) continue;

    const geom = geometryFor(route);
    if (geom.total === 0) continue;

    // Viajes de hoy y los de ayer que siguen de madrugada: GTFS escribe esas
    // horas sobre 24:00 dentro del día de servicio anterior.
    for (const [trips, offset] of [[sched[day], 0], [sched[yesterday], 1440]] as const) {
      for (const [startMin, durationMin] of trips ?? []) {
        const elapsed = nowMin + offset - startMin;
        if (elapsed < 0 || elapsed > durationMin) continue;
        const progress = elapsed / durationMin;
        const pt = pointAtProgress(geom.path, geom.cumulative, geom.total, progress);
        out.push({
          id: `${route.id}|${startMin}`,
          scheduleId: route.id,
          routeId: route.routeId ?? route.id,
          directionLabel: route.directionLabel,
          progress,
          lat: pt.lat,
          lng: pt.lng,
          bearing: pt.bearing,
          elapsedMin: elapsed,
          durationMin,
          startMin,
          sourceKind: route.sourceKind ?? 'gtfs',
          confidence: route.confidence ?? 'official',
          sourceLabel: route.sourceLabel,
          sourceUrl: route.sourceUrl,
          note: route.note,
        });
      }
    }
  }
  return out;
}
