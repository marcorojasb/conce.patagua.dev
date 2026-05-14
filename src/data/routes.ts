// Route + stop dataset for the Conce Transporte visor.
//
// Current sources (May 2026):
//
//  ✔ Biotrén L1 & L2 — stations from OpenStreetMap (Overpass), names + order
//    from EFE Trenes (efe.cl/biotren/servicio-y-trazado), schedule from EFE.
//    Data lives in `biotren.generated.ts` and is refreshable with
//    `npm run sync:biotren`.
//
//  ✘ Micros (buses urbanos) — still mock. DTPR has not published an open
//    GTFS feed for Gran Concepción yet (announced but not live on
//    datos.gob.cl as of 2026-05). Once published, swap the mock route below
//    for the GTFS shapes/trips.
//    Intermediate option: load individual stops from OSM (`highway=bus_stop`)
//    while waiting on full GTFS — leaves the legend honest about scope.
//
//  ✘ Taxibús / colectivo — mock. No open dataset; would need an aggregator
//    or scraping operator sites. Low priority until micros are real.

import { Bus, Train, Car } from 'lucide-react';
import {
  BIOTREN_L1_PATH,
  BIOTREN_L1_STOPS,
  BIOTREN_L2_PATH,
  BIOTREN_L2_STOPS,
} from '@/data/biotren.generated';
import type {
  MapCenter,
  Route,
  RouteType,
  RouteTypeId,
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
  taxibus: {
    id: 'taxibus',
    label: 'Taxibús / Colectivo',
    short: 'Taxibús',
    description: 'Colectivos y taxibuses',
    Icon: Car,
  },
};

const BIOTREN_HOURS = {
  L1: '05:45 — 23:10 (Lun-Vie)',
  L2: '05:45 — 23:10 (Lun-Vie)',
};

const BIOTREN_FREQUENCY = {
  'Lun – Vie': 'cada 6–12 min en punta · 15 min valle',
  Sábado: 'cada 12–20 min',
  Domingo: 'cada 20–30 min',
};

export const ROUTES: Route[] = [
  // ── Biotrén — datos reales ──────────────────────────────────────────────
  {
    id: 'bt-l1',
    code: 'L1',
    name: 'Biotrén L1 · Hualqui ↔ Mercado Talcahuano',
    type: 'biotren',
    color: '#0EA5E9',
    operator: 'EFE Sur · Biotrén',
    headway: '12 min',
    hours: BIOTREN_HOURS.L1,
    frequencyByDay: BIOTREN_FREQUENCY,
    stops: BIOTREN_L1_STOPS,
    path: BIOTREN_L1_PATH,
  },
  {
    id: 'bt-l2',
    code: 'L2',
    name: 'Biotrén L2 · Coronel ↔ Concepción',
    type: 'biotren',
    color: '#0284C7',
    operator: 'EFE Sur · Biotrén',
    headway: '12 min',
    hours: BIOTREN_HOURS.L2,
    frequencyByDay: BIOTREN_FREQUENCY,
    stops: BIOTREN_L2_STOPS,
    path: BIOTREN_L2_PATH,
  },

  // ── Mock pendiente de GTFS oficial ──────────────────────────────────────
  {
    id: 'micro-demo',
    code: 'M-Demo',
    name: 'Plaza Independencia ↔ Universidad de Concepción (demo)',
    type: 'micro',
    color: '#E11D48',
    operator: 'Recorrido ficticio · pendiente GTFS Gran Concepción',
    headway: '8 min',
    hours: '06:00 — 23:30',
    frequencyByDay: {
      'Lun – Vie': 'cada 6–10 min',
      Sábado: 'cada 10–15 min',
      Domingo: 'cada 15–20 min',
    },
    stops: [
      { id: 'mdemo-s1', name: 'Plaza Independencia', lat: -36.827, lng: -73.0498 },
      { id: 'mdemo-s2', name: 'Tribunales', lat: -36.8255, lng: -73.0467 },
      { id: 'mdemo-s3', name: 'Mercado Central', lat: -36.8235, lng: -73.0438 },
      { id: 'mdemo-s4', name: 'Plaza Perú', lat: -36.8294, lng: -73.0387 },
      { id: 'mdemo-s5', name: 'Casa del Arte', lat: -36.8298, lng: -73.0353 },
      { id: 'mdemo-s6', name: 'Universidad de Concepción', lat: -36.8311, lng: -73.0312 },
    ],
    path: [
      [-36.827, -73.0498],
      [-36.8259, -73.048],
      [-36.8253, -73.0465],
      [-36.824, -73.0445],
      [-36.8233, -73.042],
      [-36.8275, -73.0398],
      [-36.8294, -73.0387],
      [-36.8298, -73.0353],
      [-36.8305, -73.033],
      [-36.8311, -73.0312],
    ],
  },
  {
    id: 't-demo',
    code: 'T-Demo',
    name: 'Talcahuano ↔ Centro Concepción (demo)',
    type: 'taxibus',
    color: '#16A34A',
    operator: 'Recorrido ficticio · sin fuente abierta',
    headway: '12 min',
    hours: '05:45 — 23:00',
    frequencyByDay: {
      'Lun – Vie': 'cada 8–12 min',
      Sábado: 'cada 12–18 min',
      Domingo: 'cada 20 min',
    },
    stops: [
      { id: 'tdemo-s1', name: 'Plaza Talcahuano', lat: -36.722, lng: -73.117 },
      { id: 'tdemo-s2', name: 'Higueras', lat: -36.748, lng: -73.108 },
      { id: 'tdemo-s3', name: 'Las Salinas', lat: -36.7705, lng: -73.0945 },
      { id: 'tdemo-s4', name: 'Hualpén centro', lat: -36.792, lng: -73.084 },
      { id: 'tdemo-s5', name: 'Av. Jorge Alessandri', lat: -36.806, lng: -73.067 },
      { id: 'tdemo-s6', name: 'Plaza Independencia', lat: -36.827, lng: -73.0498 },
    ],
    path: [
      [-36.722, -73.117],
      [-36.735, -73.113],
      [-36.748, -73.108],
      [-36.76, -73.1015],
      [-36.7705, -73.0945],
      [-36.782, -73.089],
      [-36.792, -73.084],
      [-36.8, -73.076],
      [-36.806, -73.067],
      [-36.8155, -73.0585],
      [-36.827, -73.0498],
    ],
  },
];

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
