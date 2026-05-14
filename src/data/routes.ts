// Sample/mock data for Concepción.
// TODO: Reemplazar por feed real (GTFS de la Región del Biobío,
// API del Biotrén, datos abiertos de la SEREMITT, OSM Overpass para paraderos).
// Estructura pensada para sustituir mocks sin tocar la UI.

import { Bus, Train, Car } from 'lucide-react';
import type { MapCenter, Route, RouteType, RouteTypeId, StopWithRoutes } from '@/types/transport';

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

// Recorridos ficticios. Coordenadas aproximadas dentro de Concepción/Talcahuano
// para que las líneas se vean razonables sobre el mapa. NO corresponden a
// recorridos reales: son de relleno para el prototipo.
export const ROUTES: Route[] = [
  {
    id: 'l1',
    code: 'L1',
    name: 'Plaza Independencia ↔ Universidad de Concepción',
    type: 'micro',
    color: '#E11D48',
    operator: 'Línea Urbana Demo',
    headway: '8 min',
    hours: '06:00 — 23:30',
    frequencyByDay: {
      'Lun – Vie': 'cada 6–10 min',
      Sábado: 'cada 10–15 min',
      Domingo: 'cada 15–20 min',
    },
    stops: [
      { id: 'l1-s1', name: 'Plaza Independencia', lat: -36.827, lng: -73.0498 },
      { id: 'l1-s2', name: 'Tribunales', lat: -36.8255, lng: -73.0467 },
      { id: 'l1-s3', name: 'Mercado Central', lat: -36.8235, lng: -73.0438 },
      { id: 'l1-s4', name: 'Plaza Perú', lat: -36.8294, lng: -73.0387 },
      { id: 'l1-s5', name: 'Casa del Arte', lat: -36.8298, lng: -73.0353 },
      { id: 'l1-s6', name: 'Universidad de Concepción', lat: -36.8311, lng: -73.0312 },
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
    id: 'b1',
    code: 'BT',
    name: 'Biotrén · Concepción ↔ Hualqui',
    type: 'biotren',
    color: '#0EA5E9',
    operator: 'EFE Trenes (demo)',
    headway: '20 min',
    hours: '06:30 — 22:00',
    frequencyByDay: {
      'Lun – Vie': 'cada 12–20 min',
      Sábado: 'cada 20–30 min',
      Domingo: 'cada 30 min',
    },
    stops: [
      { id: 'b1-s1', name: 'Estación Concepción', lat: -36.8275, lng: -73.0531 },
      { id: 'b1-s2', name: 'Chiguayante (demo)', lat: -36.9213, lng: -73.0214 },
      { id: 'b1-s3', name: 'Hualqui (demo)', lat: -36.974, lng: -72.942 },
    ],
    path: [
      [-36.8275, -73.0531],
      [-36.8362, -73.044],
      [-36.853, -73.0345],
      [-36.8767, -73.029],
      [-36.905, -73.0235],
      [-36.9213, -73.0214],
      [-36.9456, -72.982],
      [-36.962, -72.959],
      [-36.974, -72.942],
    ],
  },
  {
    id: 't25',
    code: 'T-25',
    name: 'Talcahuano ↔ Centro Concepción',
    type: 'taxibus',
    color: '#16A34A',
    operator: 'Taxibuses del Litoral (demo)',
    headway: '12 min',
    hours: '05:45 — 23:00',
    frequencyByDay: {
      'Lun – Vie': 'cada 8–12 min',
      Sábado: 'cada 12–18 min',
      Domingo: 'cada 20 min',
    },
    stops: [
      { id: 't25-s1', name: 'Plaza Talcahuano', lat: -36.722, lng: -73.117 },
      { id: 't25-s2', name: 'Higueras', lat: -36.748, lng: -73.108 },
      { id: 't25-s3', name: 'Las Salinas', lat: -36.7705, lng: -73.0945 },
      { id: 't25-s4', name: 'Hualpén centro', lat: -36.792, lng: -73.084 },
      { id: 't25-s5', name: 'Av. Jorge Alessandri', lat: -36.806, lng: -73.067 },
      { id: 't25-s6', name: 'Plaza Independencia', lat: -36.827, lng: -73.0498 },
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
