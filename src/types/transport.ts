import type { LucideIcon } from 'lucide-react';

export type RouteTypeId = 'micro' | 'biotren';

export interface RouteType {
  id: RouteTypeId;
  label: string;
  short: string;
  description: string;
  Icon: LucideIcon;
}

export interface WikidataEnrichment {
  openedYear?: number;
  imageUrl?: string;
  wikipediaEs?: string;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  ref?: string;
  /** OSM wikidata Q-id (only set for stations with one tagged). */
  wikidata?: string;
  /** OSM wheelchair=* value. */
  wheelchair?: 'yes' | 'limited' | 'no';
  /** OSM tactile_paving=yes presence. */
  tactilePaving?: boolean;
}

export interface StopWithRoutes extends Stop {
  routes: string[];
}

export type LatLngTuple = [number, number];

export interface Route {
  id: string;
  code: string;
  name: string;
  type: RouteTypeId;
  color: string;
  operator: string;
  headway: string;
  hours: string;
  frequencyByDay: Record<string, string>;
  stops: Stop[];
  path: LatLngTuple[];
}

export interface MapCenter {
  lat: number;
  lng: number;
}

export interface Terminal {
  id: string;
  osmId: number;
  name: string;
  lat: number;
  lng: number;
  network?: string;
  operator?: string;
}

export interface Paradero {
  id: string;
  osmId?: number;
  source?: 'gtfs' | 'osm';
  sourceId?: string;
  name?: string;
  lat: number;
  lng: number;
  operator?: string;
  shelter?: boolean;
  ref?: string;
}

/**
 * Per-route schedule: 7 buckets keyed by day of week (0=Monday, ..., 6=Sunday).
 * Each bucket is a flat list of trips, each encoded as
 * `[startMinutesFromMidnight, durationMinutes]`. Used by the simulated-vehicles
 * layer to project where a bus *should* be right now according to its
 * scheduled trip; not real GPS.
 */
export type ScheduledTrip = [number, number];
export type RouteSchedule = [
  ScheduledTrip[],
  ScheduledTrip[],
  ScheduledTrip[],
  ScheduledTrip[],
  ScheduledTrip[],
  ScheduledTrip[],
  ScheduledTrip[],
];

export interface SimulatedVehicle {
  /** Stable id tied to `routeId|tripStartMin` so React keys/animations are stable per trip. */
  id: string;
  routeId: string;
  /** 0..1 fraction along the polyline. */
  progress: number;
  lat: number;
  lng: number;
  /** Bearing in degrees, 0=N, 90=E. */
  bearing: number;
  /** Minutes since the trip's scheduled start. */
  elapsedMin: number;
  /** Total scheduled minutes for this trip. */
  durationMin: number;
  /** Scheduled departure as minutes from midnight (for display). */
  startMin: number;
}

export interface BusRoute {
  id: string;
  osmId?: number;
  source?: 'gtfs' | 'osm';
  sourceId?: string;
  ref: string;
  name: string;
  operator?: string;
  network?: string;
  colour?: string;
  path: LatLngTuple[];
  /** Ordered paradero ids matched or loaded for this route at build time. */
  stopIds: string[];
}

export type PoiCategory = 'hospital' | 'university' | 'college' | 'mall';

export interface Poi {
  id: string;
  osmId: number;
  osmType: 'node' | 'way';
  name: string;
  category: PoiCategory;
  lat: number;
  lng: number;
}

export interface AirQualityStation {
  id: string;
  name: string;
  comuna: string;
  operator: string;
  lat: number;
  lng: number;
  pm25: number | null;
  pm10: number | null;
}

export type FlyToTarget =
  | { kind: 'bounds'; path: LatLngTuple[] }
  | { kind: 'point'; lat: number; lng: number; zoom?: number };

export interface FlyToToken {
  key: number;
  target: FlyToTarget;
}

export type Theme = 'light' | 'dark';

export type SheetKind = 'route' | 'stop' | 'terminal' | 'poi' | 'paradero' | null;
