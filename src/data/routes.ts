// Route + stop dataset for the conce.patagua.dev visor.
//
// Progressive loading model
// -------------------------
// On first paint we only have the two Biotrén routes (small, eager). The 169
// micro routes (~250 KB gz with their full paths) are dynamically imported
// from the split `gtfs-bus-routes.generated.ts` chunk a tick after mount —
// no Suspense boundary, no loading spinner, the visor renders the map
// immediately and the sidebar/search fills in once micros arrive.
//
// Data sources
//  ✔ Biotrén L1 & L2 — OSM stations + EFE Trenes (efe.cl/biotren); track
//    polyline stitched from OSM railway=rail (see scripts/fetch-biotren-track.ts).
//    Re-generate: `npm run sync:biotren-track`.
//
//  ✔ Recorridos de micros — GTFS estático Gran Concepción (Subsecretaría de
//    Transportes). Generator emits two files; we eager-import stops, lazy-
//    import bus routes. Re-generate: `npm run sync:gtfs-concepcion`.
//
//  ✘ Taxibús / colectivo — no open dataset exists for the metro area.

import { Bus, Train } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  BIOTREN_L1_STOPS,
  BIOTREN_L2_STOPS,
} from '@/data/biotren.generated';
import { BIOTREN_L1_TRACK, BIOTREN_L2_TRACK } from '@/data/biotren-track.generated';
import { GTFS_STOPS } from '@/data/gtfs-stops.generated';
import {
  INTERURBAN_BUS_ROUTES,
  INTERURBAN_PARADEROS,
} from '@/data/interurban-routes.generated';
import type {
  BusRoute,
  MapCenter,
  Paradero,
  Route,
  RouteType,
  RouteTypeId,
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

const BIOTREN_FREQUENCY = {
  'Lun – Vie': 'cada 6–12 min en punta · 15 min valle',
  Sábado: 'cada 12–20 min',
  Domingo: 'cada 20–30 min',
};
const BIOTREN_HOURS = '05:45 — 23:10 (Lun-Vie)';

// Hash operator name → stable hue so the same operator's routes share a color.
function operatorColor(operator: string | undefined, fallbackSeed: string): string {
  const key = operator ?? fallbackSeed;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 45%)`;
}

const BIOTREN_ROUTES: Route[] = [
  {
    id: 'bt-l1',
    code: 'L1',
    name: 'Biotrén L1 · Hualqui ↔ Mercado Talcahuano',
    type: 'biotren',
    color: '#0EA5E9',
    operator: 'EFE Sur · Biotrén',
    headway: '12 min',
    hours: BIOTREN_HOURS,
    frequencyByDay: BIOTREN_FREQUENCY,
    stops: BIOTREN_L1_STOPS,
    path: BIOTREN_L1_TRACK,
  },
  {
    id: 'bt-l2',
    code: 'L2',
    name: 'Biotrén L2 · Coronel ↔ Concepción',
    type: 'biotren',
    color: '#0284C7',
    operator: 'EFE Sur · Biotrén',
    headway: '12 min',
    hours: BIOTREN_HOURS,
    frequencyByDay: BIOTREN_FREQUENCY,
    stops: BIOTREN_L2_STOPS,
    path: BIOTREN_L2_TRACK,
  },
];

// Combinamos paraderos GTFS con los digitalizados de rutas interurbanas
// (hoy: 201 Santa Juana + 401/411/421 Tomé). Si más adelante el GTFS
// oficial incluye estos paraderos, el dataset interurbano queda vacío y
// este Map vuelve a ser trivialmente igual a `GTFS_STOPS`.
const PARADERO_BY_ID = new Map<string, Paradero>([
  ...GTFS_STOPS.map((p) => [p.id, p] as const),
  ...INTERURBAN_PARADEROS.map((p) => [p.id, p] as const),
]);

// Buses interurbanos (201 Santa Juana + 401/411/421 Tomé) — pequeñísimos
// en bytes vs. los 169 GTFS, así que los cargamos eagerly y aparecen junto
// con Biotrén en el primer paint. La sheet de detalle, la búsqueda y el
// simulador los tratan exactamente igual que un urbano.
const INTERURBAN_ROUTES: Route[] = INTERURBAN_BUS_ROUTES.map((b) =>
  busRouteToRoute(b, PARADERO_BY_ID),
);

function busRouteToRoute(b: BusRoute, paraderoIndex: Map<string, Paradero>): Route {
  const stops: Stop[] = [];
  for (const id of b.stopIds) {
    const p = paraderoIndex.get(id);
    if (!p) continue;
    stops.push({
      id: p.id,
      name: p.name ?? `Paradero ${p.ref ?? p.osmId}`,
      lat: p.lat,
      lng: p.lng,
      ref: p.ref,
    });
  }
  // Las rutas interurbanas (network !== GTFS) viven fuera del feed; al no
  // tener stop_times.txt no podemos prometer una frecuencia programada.
  const isGtfs = b.source === 'gtfs';
  return {
    id: b.id,
    code: b.ref,
    name: b.name,
    type: 'micro',
    color: b.colour ?? operatorColor(b.operator, b.id),
    operator: b.operator ?? 'Operador no registrado (GTFS)',
    headway: isGtfs ? 'Programado GTFS' : 'Frecuencia operativa publicada por operador',
    hours: isGtfs ? 'Según calendario GTFS' : 'Según horario publicado por operador',
    frequencyByDay: {},
    stops,
    path: b.path,
    network: b.network,
    digitized: b.digitized,
  };
}

// Mutable arrays/Maps: arrancamos con Biotrén + interurbanos (estos dos
// son chicos y se prerenderean eagerly). Los 169 micros GTFS llegan después
// vía dynamic import. La identidad del array NO cambia — los consumidores
// que mantienen una referencia ven los nuevos elementos cuando aparecen;
// el contador de versión + subscripción debajo dispara los re-renders.
const SEED_ROUTES: Route[] = [...BIOTREN_ROUTES, ...INTERURBAN_ROUTES];
export const ROUTES: Route[] = [...SEED_ROUTES];
export const ROUTES_BY_ID = new Map<string, Route>(
  SEED_ROUTES.map((r) => [r.id, r]),
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

// Visibles por defecto: Biotrén + interurbanos (servicios licitados que
// el usuario debería ver desde el primer paint). Los 169 micros del GTFS
// urbano siguen siendo opt-in via sidebar — saturan el mapa si todos
// aparecieran prendidos.
export const DEFAULT_VISIBLE_ROUTE_IDS: string[] = [
  ...BIOTREN_ROUTES.map((r) => r.id),
  ...INTERURBAN_ROUTES.map((r) => r.id),
];

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
  // Extend the stops index with the new routes' stops in place — same
  // array identity so paradero detail sheets keep working.
  const stopIndex = new Map(STOPS.map((s) => [s.id, s]));
  for (const r of routes) {
    for (const s of r.stops) {
      const existing = stopIndex.get(s.id);
      if (existing) {
        if (!existing.routes.includes(r.id)) existing.routes.push(r.id);
      } else {
        const entry: StopWithRoutes = { ...s, routes: [r.id] };
        stopIndex.set(s.id, entry);
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
      const micros = mod.GTFS_BUS_ROUTES.map((b) =>
        busRouteToRoute(b, PARADERO_BY_ID),
      );
      appendMicros(micros);
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
  // useSyncExternalStore would be the idiomatic choice but adds a
  // dependency on React 18 features that are already in use; we mirror it
  // with useState + useEffect to keep the file dependency-light.
  const [v, setV] = useState(routesVersion);
  useEffect(() => subscribe(() => setV(routesVersion)), []);
  return v;
}
