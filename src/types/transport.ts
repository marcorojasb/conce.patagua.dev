import type { LucideIcon } from 'lucide-react';

export type RouteTypeId = 'micro' | 'biotren';

export interface RouteType {
  id: RouteTypeId;
  label: string;
  short: string;
  description: string;
  Icon: LucideIcon;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  ref?: string;
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
  osmId: number;
  name?: string;
  lat: number;
  lng: number;
  operator?: string;
  shelter?: boolean;
  ref?: string;
}

export interface BusRoute {
  id: string;
  osmId: number;
  ref: string;
  name: string;
  operator?: string;
  network?: string;
  colour?: string;
  path: LatLngTuple[];
  /** Ordered paradero ids matched to this route by build-time proximity. */
  stopIds: string[];
}

export type FlyToTarget =
  | { kind: 'bounds'; path: LatLngTuple[] }
  | { kind: 'point'; lat: number; lng: number; zoom?: number };

export interface FlyToToken {
  key: number;
  target: FlyToTarget;
}

export type Theme = 'light' | 'dark';

export type SheetKind = 'route' | 'stop' | 'terminal' | null;
