// Route + stop dataset for the conce.patagua.dev visor.
//
// Progressive loading model
// -------------------------
// On first paint we only have the two Biotrén routes (small, eager). The 102
// bus routes of the official GTFS (both directions, ~110 KB gz) are
// dynamically imported from the split `gtfs-bus-routes.generated.ts` chunk a
// tick after mount — no Suspense boundary, no loading spinner, the visor
// renders the map immediately and the sidebar/search fills in once they land.
//
// Data sources
//  ✔ Biotrén L1 & L2 — estaciones OSM; trazado unido desde railway=rail de OSM
//    (scripts/fetch-biotren-track.ts); horarios de los itinerarios oficiales
//    de EFE en static-service-patterns.ts. Re-generate: `npm run sync:biotren-track`.
//
//  ✔ Micros urbanas e interurbanos 201/201-AU (Santa Juana), 401/401Y/411/421
//    (Tomé) y 302/304 (Lota) — GTFS oficial de la DTPR (versión del
//    2025-02-28; calendario declarado hasta el 2025-12-31, la última
//    publicación). Cada recorrido trae sus dos sentidos. Re-generate:
//    `npm run sync:gtfs`.
//
//  ✘ Taxibús / colectivo — no open dataset exists for the metro area.

import { Bus, Train } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import {
  BIOTREN_L1_STOPS,
  BIOTREN_L2_STOPS,
} from '@/data/biotren.generated';
import { BIOTREN_L1_TRACK, BIOTREN_L2_TRACK } from '@/data/biotren-track.generated';
import { BIOTREN_IDENTITY, INTERURBAN_IDENTITY } from '@/data/route-identity';
import { interurbanOperator } from '@/data/bus-lines';
import { GTFS_STOPS } from '@/data/gtfs-stops.generated';
import { operatorTimetablesOfRoute } from '@/data/operator-timetables';
import { STATIC_SERVICE_PATTERNS } from '@/data/static-service-patterns';
import { densifyPath } from '@/lib/geo';
import { serviceSpansFromTrips } from '@/lib/operating-hours';
import { isInterurban, lineOperatorName, routeCodeKey } from '@/lib/route-labels';
import { buildStaticRouteSchedules, DAY_INDEXES } from '@/realtime/static-service-schedules';
import type {
  BusRoute,
  MapCenter,
  Route,
  RouteDirection,
  RouteType,
  RouteTypeId,
  ScheduledTrip,
  ServiceSpans,
  Stop,
  StopWithRoutes,
} from '@/types/transport';

export const CONCE_CENTER: MapCenter = { lat: -36.8201, lng: -73.0444 };

export const ROUTE_TYPES: Record<RouteTypeId, RouteType> = {
  micro: {
    id: 'micro',
    label: 'Micro',
    short: 'Micro',
    description: 'Buses urbanos',
    Icon: Bus,
  },
  biotren: {
    id: 'biotren',
    label: 'Biotrén',
    short: 'Biotrén',
    description: 'Tren de cercanías',
    Icon: Train,
  },
};

// Resumen de los itinerarios EFE vigentes desde el 15-07-2026 (salida por
// salida en static-service-patterns.ts). Cuenta solo trenes de cabecera a
// cabecera; los horarios van de la primera salida a la última llegada.
const BIOTREN_L1_FREQUENCY = {
  'Lun – Vie': '19 trenes desde Hualqui y 18 desde Mercado · cada 30 min en punta, 45–60 min fuera de punta · sin trenes 13:15–15:00',
  Sábado: '8 trenes por sentido · cada 60 min de 16:00 a 20:00, cada 1,5–4 h antes',
  Domingo: '4 trenes por sentido (Tren Laja–Talcahuano) · cada 3–4 h',
};
const BIOTREN_L1_HOURS = '06:20 — 22:48 (Lun-Vie) · 08:30 — 21:26 (Sáb-Dom)';
const BIOTREN_L2_FREQUENCY = {
  'Lun – Vie': '52 trenes por sentido · cada ~12 min en punta (7–23 min), 15–80 min al mediodía',
  Sábado: '26 trenes desde Coronel y 27 desde Concepción · cada 30 min en mañana y tarde, 15–80 min al mediodía',
  Domingo: '16 trenes por sentido · cada 15–80 min (típico ~55 min)',
};
const BIOTREN_L2_HOURS = '05:55 — 23:32 (Lun-Vie) · 06:30 — 22:12 (Sáb) · 08:30 — 21:42 (Dom)';
const RAIL_MAX_SEGMENT_METERS = 300;
const ROAD_MAX_SEGMENT_METERS = 300;

// Tramos con servicio de Biotrén desde los itinerarios EFE (ambos sentidos).
function staticServiceSpans(routeId: string): ServiceSpans {
  const days: ScheduledTrip[][] = [[], [], [], [], [], [], []];
  const schedules = buildStaticRouteSchedules(STATIC_SERVICE_PATTERNS.filter((p) => p.routeId === routeId));
  for (const schedule of Object.values(schedules)) schedule.forEach((trips, day) => days[day].push(...trips));
  return serviceSpansFromTrips(days);
}

// Los días con lista del operador (operator-timetables.ts, que cubre los dos
// sentidos) los tramos salen de ella y no del programa del GTFS: así "Operando
// ahora" calza con la ficha del recorrido y con el mapa (la 201 de lunes a
// viernes: 06:15 a 01:02, no 05:38 a 02:33).
function withOperatorSpans(routeId: string, spans: ServiceSpans | undefined): ServiceSpans | undefined {
  const timetables = operatorTimetablesOfRoute(routeId);
  if (!spans || timetables.length === 0) return spans;
  const days: ScheduledTrip[][] = [[], [], [], [], [], [], []];
  for (const timetable of timetables) {
    for (const kind of timetable.days) for (const index of DAY_INDEXES[kind]) days[index].push(...timetable.trips);
  }
  const operatorSpans = serviceSpansFromTrips(days);
  return spans.map((daySpans, day) => (days[day].length > 0 ? operatorSpans[day] : daySpans));
}

// Hash operator name → stable hue so the same operator's routes share a color.
function operatorColor(operator: string | undefined, fallbackSeed: string): string {
  const key = operator ?? fallbackSeed;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 45%)`;
}

// `color` es la identidad en tema claro (route-identity.ts); route-colors.ts
// da la de cada tema.
const BIOTREN_ROUTES: Route[] = [
  {
    id: 'bt-l1',
    code: 'L1',
    name: 'Biotrén L1 · Hualqui ↔ Mercado Talcahuano',
    type: 'biotren',
    color: BIOTREN_IDENTITY.L1,
    operator: 'EFE Sur · Biotrén',
    headway: '30 min en punta',
    hours: BIOTREN_L1_HOURS,
    frequencyByDay: BIOTREN_L1_FREQUENCY,
    stops: BIOTREN_L1_STOPS,
    path: densifyPath(BIOTREN_L1_TRACK, RAIL_MAX_SEGMENT_METERS),
    serviceSpans: staticServiceSpans('bt-l1'),
  },
  {
    id: 'bt-l2',
    code: 'L2',
    name: 'Biotrén L2 · Coronel ↔ Concepción',
    type: 'biotren',
    color: BIOTREN_IDENTITY.L2,
    operator: 'EFE Sur · Biotrén',
    headway: '12 min en punta',
    hours: BIOTREN_L2_HOURS,
    frequencyByDay: BIOTREN_L2_FREQUENCY,
    stops: BIOTREN_L2_STOPS,
    path: densifyPath(BIOTREN_L2_TRACK, RAIL_MAX_SEGMENT_METERS),
    serviceSpans: staticServiceSpans('bt-l2'),
  },
];

const PARADERO_BY_ID = new Map(GTFS_STOPS.map((p) => [p.id, p] as const));

function resolveStops(stopIds: string[]): Stop[] {
  const stops: Stop[] = [];
  for (const id of stopIds) {
    const p = PARADERO_BY_ID.get(id);
    if (!p) continue;
    stops.push({ id: p.id, name: p.name ?? `Paradero ${p.ref ?? p.sourceId}`, lat: p.lat, lng: p.lng, ref: p.ref });
  }
  return stops;
}

function busRouteToRoute(b: BusRoute): Route {
  const directions = (b.directions ?? [{ directionId: 0, headsign: b.name, path: b.path, stopIds: b.stopIds }]).map(
    (d): RouteDirection => ({
      directionId: d.directionId,
      headsign: d.headsign,
      variant: d.variant,
      destination: d.destination,
      path: densifyPath(d.path, ROAD_MAX_SEGMENT_METERS),
      stops: resolveStops(d.stopIds),
    }),
  );
  // Un paradero que solo toca el regreso también es del recorrido: la ficha
  // del paradero lo lista igual.
  const stopById = new Map<string, Stop>();
  for (const d of directions) for (const stop of d.stops) if (!stopById.has(stop.id)) stopById.set(stop.id, stop);
  // Interurbanos con la identidad curada de su corredor (route-identity.ts).
  const identity = INTERURBAN_IDENTITY[b.ref];
  return {
    id: b.id,
    code: b.ref,
    name: b.name,
    type: 'micro',
    color: identity ?? b.colour ?? operatorColor(b.operator, b.id),
    officialColor: identity ? b.colour : undefined,
    // La empresa de la línea, no la del letrero ("Buses Cóndor", la 31 y la 32
    // por separado); el GTFS no trae operador en los interurbanos: el
    // confirmado también sale de bus-lines.ts. El color sigue saliendo del letrero.
    operator: lineOperatorName(b.ref, b.operator) ?? interurbanOperator(b.network) ?? 'Operador sin confirmar',
    headway: 'Programado GTFS',
    hours: 'Según calendario GTFS',
    frequencyByDay: {},
    stops: Array.from(stopById.values()),
    // Ida y regreso se tocan en las cabeceras (< 100 m en todo el feed), así
    // que seguidos forman el circuito completo sin saltos visibles.
    path: directions.flatMap((d) => d.path),
    directions,
    serviceSpans: withOperatorSpans(b.id, b.serviceSpans),
    network: b.network,
    digitized: b.digitized,
  };
}

// Mutable arrays/Maps: arrancamos con Biotrén (chico, se prerenderea
// eagerly). Los 102 recorridos GTFS llegan después vía dynamic import. La
// identidad del array NO cambia — los consumidores que mantienen una
// referencia ven los nuevos elementos cuando aparecen; el contador de
// versión + subscripción debajo dispara los re-renders.
export const ROUTES: Route[] = [...BIOTREN_ROUTES];
export const ROUTES_BY_ID = new Map<string, Route>(
  BIOTREN_ROUTES.map((r) => [r.id, r]),
);

function buildStopIndex(routes: Route[]): StopWithRoutes[] {
  const map = new Map<string, StopWithRoutes>();
  for (const r of routes) {
    for (const s of r.stops) {
      const existing = map.get(s.id);
      if (existing) {
        existing.routes.push(r.id);
      } else {
        map.set(s.id, { ...s, routes: [r.id] });
      }
    }
  }
  return Array.from(map.values());
}

export const STOPS: StopWithRoutes[] = buildStopIndex(ROUTES);

// Visibles por defecto: Biotrén + interurbanos oficiales. Los interurbanos
// vienen en el chunk GTFS, así que se agregan cuando llega (misma lista,
// mutada como ROUTES); App los suma a lo visible en ese momento. Las micros
// urbanas siguen siendo opt-in desde la barra lateral: todas prendidas
// saturan el mapa.
export const DEFAULT_VISIBLE_ROUTE_IDS: string[] = BIOTREN_ROUTES.map((r) => r.id);

export interface RouteMatch {
  route: Route;
  /** Sentido cuando se encontró por la variante de un letrero ("10A"). */
  directionId?: 0 | 1;
}

/**
 * Busca un recorrido por id, por código ("10AN", "201 AU") o por la variante
 * de uno de sus sentidos ("10A" → 10AN sentido 0), que es lo que muestra la
 * micro y lo que citan el wiki y las llegadas en vivo. Acepta también los ids
 * de los interurbanos digitalizados que hubo antes ("interurban-201").
 */
export function findRoute(ref: string): RouteMatch | null {
  const byId = ROUTES_BY_ID.get(ref);
  if (byId) return { route: byId };
  const key = routeCodeKey(ref.replace(/^interurban-/, ''));
  if (!key) return null;
  const byCode = ROUTES.find((r) => routeCodeKey(r.code) === key);
  if (byCode) return { route: byCode };
  for (const route of ROUTES) {
    const direction = route.directions?.find((d) => d.variant && routeCodeKey(d.variant) === key);
    if (direction) return { route, directionId: direction.directionId };
  }
  return null;
}

// Tiny subscription store: bump a counter and notify so consumers
// re-render the moment micros land. (Not using useSyncExternalStore to
// keep the file dependency-light — useState + useEffect mirror it.)
let routesVersion = 0;
const listeners = new Set<() => void>();
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * `true` once the micro routes have loaded. Use `useRoutesVersion()` (or
 * any state that derives from ROUTES) to get re-rendered automatically.
 */
export let microRoutesReady = false;

function appendMicros(routes: Route[]): void {
  if (microRoutesReady) return;
  ROUTES.push(...routes);
  for (const r of routes) ROUTES_BY_ID.set(r.id, r);
  DEFAULT_VISIBLE_ROUTE_IDS.push(...routes.filter(isInterurban).map((r) => r.id));
  // Extend the stops index with the new routes' stops in place — same
  // array identity so paradero detail sheets keep working.
  const stopIndex = new Map(STOPS.map((s) => [s.id, s]));
  const stopRouteIndex = new Map(STOPS.map((s) => [s.id, new Set(s.routes)]));
  for (const r of routes) {
    for (const s of r.stops) {
      const existing = stopIndex.get(s.id);
      if (existing) {
        const routeIds = stopRouteIndex.get(s.id)!;
        if (!routeIds.has(r.id)) {
          routeIds.add(r.id);
          existing.routes.push(r.id);
        }
      } else {
        const entry: StopWithRoutes = { ...s, routes: [r.id] };
        stopIndex.set(s.id, entry);
        stopRouteIndex.set(s.id, new Set(entry.routes));
        STOPS.push(entry);
      }
    }
  }
  microRoutesReady = true;
  routesVersion += 1;
  for (const cb of listeners) cb();
}

// Kick off the lazy load on module init. The browser typically starts
// fetching this in parallel with the rest of the main chunk, so it lands
// within ~200ms after first paint on a fast connection. We swallow errors
// to keep the initial UI alive — the user just won't see micros.
function startMicroLoad(): void {
  void import('@/data/gtfs-bus-routes.generated')
    .then((mod) => {
      appendMicros(mod.GTFS_BUS_ROUTES.map(busRouteToRoute));
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[routes] Failed to load micro routes:', err);
    });
}
startMicroLoad();

/**
 * Re-renders the calling component when the micro routes load. Returns
 * the version counter (0 before micros land, 1 after) so consumers can
 * pick branches if they want, but most just need the trigger.
 */
export function useRoutesVersion(): number {
  return useSyncExternalStore(subscribe, () => routesVersion);
}
