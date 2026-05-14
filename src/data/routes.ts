// Route + stop dataset for the Conce Transporte visor.
//
// Current sources (May 2026):
//
//  ✔ Biotrén L1 & L2 — stations from OpenStreetMap (Overpass), names + order
//    from EFE Trenes (efe.cl/biotren/servicio-y-trazado), schedule from EFE.
//    Track polyline is stitched from OSM `railway=rail` ways operated by
//    EFE Sur via corridor-constrained Dijkstra (see
//    scripts/fetch-biotren-track.ts). Sections of the corridor with no
//    nearby rail nodes (~ 7 of 24 segments) fall back to a straight line
//    between the two adjacent stations.
//    Re-generate: `npm run sync:biotren-track`.
//
//  ✔ Recorridos de micros — 133 `route=bus` relations from OpenStreetMap,
//    each with full polyline geometry (simplified with Douglas–Peucker).
//    Stops are matched at build time by snapping `highway=bus_stop` paraderos
//    within 30 m of the route polyline, ordered by progress along the path.
//    Re-generate: `npm run sync:bus-routes` (depends on paraderos.generated).
//
//  ✘ Taxibús / colectivo — out of scope; no open dataset for the metro area.
//    The previous demo route has been removed.

import { Bus, Train } from 'lucide-react';
import {
  BIOTREN_L1_STOPS,
  BIOTREN_L2_STOPS,
} from '@/data/biotren.generated';
import { BIOTREN_L1_TRACK, BIOTREN_L2_TRACK } from '@/data/biotren-track.generated';
import { BUS_ROUTES } from '@/data/bus-routes.generated';
import { PARADEROS } from '@/data/paraderos.generated';
import type {
  BusRoute,
  MapCenter,
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

const PARADERO_BY_ID = new Map(PARADEROS.map((p) => [p.id, p]));

function busRouteToRoute(b: BusRoute): Route {
  const stops: Stop[] = [];
  for (const id of b.stopIds) {
    const p = PARADERO_BY_ID.get(id);
    if (!p) continue;
    stops.push({
      id: p.id,
      name: p.name ?? `Paradero ${p.ref ?? p.osmId}`,
      lat: p.lat,
      lng: p.lng,
      ref: p.ref,
    });
  }
  return {
    id: b.id,
    code: b.ref,
    name: b.name,
    type: 'micro',
    color: b.colour ?? operatorColor(b.operator, b.id),
    operator: b.operator ?? 'Operador no registrado (OSM)',
    headway: '—',
    hours: '—',
    frequencyByDay: {},
    stops,
    path: b.path,
  };
}

const MICRO_ROUTES: Route[] = BUS_ROUTES.map(busRouteToRoute);

export const ROUTES: Route[] = [...BIOTREN_ROUTES, ...MICRO_ROUTES];

// Biotrén route ids are the only ones visible by default — the urban micros
// (133 routes) would clutter the map. Users opt in via the sidebar.
export const DEFAULT_VISIBLE_ROUTE_IDS: string[] = BIOTREN_ROUTES.map((r) => r.id);

// Unique operator list (for filter UI in future tandas).
export const BUS_OPERATORS: string[] = Array.from(
  new Set(BUS_ROUTES.map((r) => r.operator).filter((o): o is string => !!o)),
).sort((a, b) => a.localeCompare(b, 'es'));

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
