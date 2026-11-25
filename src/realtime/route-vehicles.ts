// Micros con GPS por recorrido, para el modo "GPS en vivo" del mapa. Vienen de
// /api/route-vehicles (ver api/route-vehicles.ts), que consulta por servicio y
// sentido la misma fuente de Transapp que las llegadas a paraderos
// (…/synoptic/machines?route=<servicio>&direction=<I|R>): la fuente no tiene
// una consulta para toda la red, así que se pide solo lo que está en el mapa.
//
// Reglas:
// - Un servicio sin micros ("machines" vacío) es "sin GPS ahora", nunca se
//   rellena con estimadas (pasa, por ejemplo, con la 401/411/421 de Tomé).
// - Biotrén no tiene GPS en la fuente y la 302/304 (Coronel–Lota) no la sigue:
//   esas líneas quedan fuera de la consulta y se informan aparte.
// - Una posición se ve como vieja pasados 2 min y no se dibuja pasados 5 min.
// - Si una consulta falla, lo último bueno de cada servicio sigue valiendo
//   hasta 5 min.

import { visorServiceName, type LiveDirection, type LiveFailure } from '@/realtime/live-arrivals';
import type { Route } from '@/types/transport';

export const GPS_STALE_AFTER_MS = 2 * 60_000;
export const GPS_MAX_AGE_MS = 5 * 60_000;
/**
 * Diferencia tolerada entre el reloj del equipo y el del servidor. Por debajo
 * se envejece con la hora del equipo (la diferencia es la caché de la CDN, de
 * segundos); por encima el equipo tiene la hora corrida y se corrige: si no,
 * un teléfono adelantado 6 min vería todas las posiciones vencidas.
 */
export const CLOCK_SKEW_TOLERANCE_MS = 60_000;
/** Tope de pares servicio:sentido por consulta (el mismo que acepta la intermediaria). */
export const MAX_GPS_PAIRS = 16;

export interface GpsVehicle {
  /** Nombre del servicio en la fuente ("24F", "401I"). */
  service: string;
  direction: LiveDirection;
  plate: string | null;
  lat: number;
  lng: number;
  /** Rumbo en grados (0 = N, 90 = E), o null si la fuente no lo trae. */
  bearing: number | null;
  /** Hora de la posición según el GPS (ms Unix), o null si no se sabe. */
  reportedAt: number | null;
}

export type ServiceGps =
  | { status: 'ok'; fetchedAt: number; vehicles: GpsVehicle[] }
  | { status: 'unavailable' | 'rate_limited' };

export interface RouteVehiclesResponse {
  fetchedAt: number;
  /** Por par "<SERVICIO>:<I|R>". */
  services: Record<string, ServiceGps>;
}

export type RouteVehiclesParse = ({ ok: true } & RouteVehiclesResponse) | { ok: false; error: string };

// ── Forma cruda de la respuesta de /api/route-vehicles ─────────────────────

interface RawRouteVehiclesResponse {
  fetchedAt?: unknown;
  services?: unknown;
  error?: unknown;
}

interface RawServiceGps {
  status?: unknown;
  fetchedAt?: unknown;
  vehicles?: unknown;
}

interface RawGpsVehicle {
  plate?: unknown;
  lat?: unknown;
  lng?: unknown;
  bearing?: unknown;
  reportedAt?: unknown;
}

const GPS_PAIR = /^([0-9A-Z]{2,7}):([IR])$/;

// Caja amplia del Gran Concepción, la misma de las llegadas: fuera de ella o
// en 0,0 es un GPS sin señal, no una micro.
const REGION = { minLat: -37.6, maxLat: -36.3, minLng: -73.6, maxLng: -72.5 };

// Un GPS que dice estar más de 2 min en el futuro respecto de la consulta
// tiene la hora mal: se toma como hora desconocida.
const FUTURE_TOLERANCE_MS = 2 * 60_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return Number(value);
  return null;
}

/**
 * Marca de tiempo en ms Unix: número en ms (o en s) o texto ISO con zona
 * ("2026-11-24T15:55:22Z"). Sin zona el navegador la leería como hora local.
 */
function readTimestamp(value: unknown): number | null {
  const n = finiteNumber(value);
  if (n != null) {
    if (n >= 1e12 && n < 1e13) return n;
    if (n >= 1e9 && n < 1e10) return n * 1000;
    return null;
  }
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/.test(text)) return null;
  const ms = Date.parse(text);
  return Number.isFinite(ms) ? ms : null;
}

/** Patentes chilenas: "ABCD12" o "AB1234"; cualquier otra cosa no se muestra. */
function readPlate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const plate = value.toUpperCase().replace(/[\s.-]+/g, '');
  return /^[A-Z]{2,4}\d{2,4}$/.test(plate) && plate.length === 6 ? plate : null;
}

function readBearing(value: unknown): number | null {
  const n = finiteNumber(value);
  return n != null && n >= 0 && n <= 360 ? n % 360 : null;
}

function parseVehicle(
  raw: unknown,
  service: string,
  direction: LiveDirection,
  fetchedAt: number,
): GpsVehicle | null {
  if (!isRecord(raw)) return null;
  const v = raw as RawGpsVehicle;
  const lat = finiteNumber(v.lat);
  const lng = finiteNumber(v.lng);
  if (lat == null || lng == null) return null;
  if (lat < REGION.minLat || lat > REGION.maxLat || lng < REGION.minLng || lng > REGION.maxLng) return null;
  const reportedAt = readTimestamp(v.reportedAt);
  return {
    service,
    direction,
    plate: readPlate(v.plate),
    lat,
    lng,
    bearing: readBearing(v.bearing),
    reportedAt: reportedAt != null && reportedAt <= fetchedAt + FUTURE_TOLERANCE_MS ? reportedAt : null,
  };
}

/** La misma patente dos veces en un servicio: queda la posición más reciente. */
function dedupeByPlate(vehicles: GpsVehicle[]): GpsVehicle[] {
  const out: GpsVehicle[] = [];
  const indexByPlate = new Map<string, number>();
  for (const vehicle of vehicles) {
    const index = vehicle.plate ? indexByPlate.get(vehicle.plate) : undefined;
    if (index == null) {
      if (vehicle.plate) indexByPlate.set(vehicle.plate, out.length);
      out.push(vehicle);
    } else if ((vehicle.reportedAt ?? -Infinity) > (out[index].reportedAt ?? -Infinity)) {
      out[index] = vehicle;
    }
  }
  return out;
}

function parseService(raw: unknown, service: string, direction: LiveDirection, fetchedAt: number): ServiceGps {
  if (!isRecord(raw)) return { status: 'unavailable' };
  const body = raw as RawServiceGps;
  if (body.status === 'rate_limited') return { status: 'rate_limited' };
  if (body.status !== 'ok' || !Array.isArray(body.vehicles)) return { status: 'unavailable' };
  const serviceFetchedAt = readTimestamp(body.fetchedAt) ?? fetchedAt;
  const vehicles: GpsVehicle[] = [];
  for (const item of body.vehicles) {
    const vehicle = parseVehicle(item, service, direction, serviceFetchedAt);
    if (vehicle) vehicles.push(vehicle);
  }
  return { status: 'ok', fetchedAt: serviceFetchedAt, vehicles: dedupeByPlate(vehicles) };
}

/**
 * Interpreta el cuerpo 200 de /api/route-vehicles. `now` reemplaza a un
 * `fetchedAt` ausente. Un estado desconocido cuenta como "unavailable"; las
 * micros sin posición válida se descartan.
 */
export function parseRouteVehiclesResponse(raw: unknown, now: number): RouteVehiclesParse {
  if (!isRecord(raw)) return { ok: false, error: 'Respuesta ilegible' };
  const body = raw as RawRouteVehiclesResponse;
  if (!isRecord(body.services)) return { ok: false, error: 'Respuesta sin servicios' };
  const fetchedAt = readTimestamp(body.fetchedAt) ?? now;
  const services: Record<string, ServiceGps> = {};
  for (const [pair, value] of Object.entries(body.services)) {
    const match = GPS_PAIR.exec(pair);
    if (!match) continue;
    services[pair] = parseService(value, match[1], match[2] as LiveDirection, fetchedAt);
  }
  return { ok: true, fetchedAt, services };
}

/**
 * Resultado de una consulta HTTP a /api/route-vehicles: la respuesta
 * interpretada o el tipo de falla.
 */
export function readRouteVehiclesResult(
  status: number,
  body: unknown,
  now: number,
): { ok: true; response: RouteVehiclesResponse } | { ok: false; failure: LiveFailure } {
  const error = isRecord(body) ? (body as RawRouteVehiclesResponse).error : undefined;
  if (status < 200 || status >= 300) {
    if (error === 'unconfigured') return { ok: false, failure: 'unconfigured' };
    if (status === 429 || error === 'rate_limited') return { ok: false, failure: 'rate_limited' };
    return { ok: false, failure: 'unavailable' };
  }
  const parsed = parseRouteVehiclesResponse(body, now);
  if (!parsed.ok) return { ok: false, failure: 'unreadable' };
  return { ok: true, response: { fetchedAt: parsed.fetchedAt, services: parsed.services } };
}

// ── Qué se consulta ─────────────────────────────────────────────────────────

export interface GpsSelection {
  /** Pares "<SERVICIO>:<I|R>" a consultar, en orden de prioridad. */
  pairs: string[];
  routeByPair: Map<string, { routeId: string; directionId: 0 | 1 }>;
  /** Líneas que la fuente no sigue: Biotrén, 302/304. */
  untracked: Route[];
  /** Pares que no entraron por el tope. */
  omitted: number;
  /** Líneas que quedaron fuera por el tope, en el orden recibido. */
  omittedRoutes: Route[];
}

/**
 * Pares a consultar para las líneas dadas: uno por sentido con nombre en la
 * fuente. Primero la línea seleccionada (si está entre las dadas), luego el
 * orden recibido. Una línea entra con todos sus sentidos o no entra: pasado
 * el tope, ella y las siguientes cuentan en `omitted`.
 */
export function gpsServicesFor(
  routes: readonly Route[],
  opts: { selectedRouteId?: string | null; max?: number } = {},
): GpsSelection {
  const max = Math.max(0, Math.min(MAX_GPS_PAIRS, Math.floor(opts.max ?? MAX_GPS_PAIRS)));
  const selected = opts.selectedRouteId ? routes.find((r) => r.id === opts.selectedRouteId) : undefined;
  const ordered = selected ? [selected, ...routes.filter((r) => r !== selected)] : routes;

  const pairs: string[] = [];
  const routeByPair: GpsSelection['routeByPair'] = new Map();
  const untracked: Route[] = [];
  const omittedRoutes: Route[] = [];
  const seenRoutes = new Set<string>();
  const seenPairs = new Set<string>();
  let omitted = 0;
  let full = false;

  for (const route of ordered) {
    if (seenRoutes.has(route.id)) continue;
    seenRoutes.add(route.id);
    const routePairs: Array<[string, 0 | 1]> = [];
    for (const direction of route.directions ?? []) {
      const name = visorServiceName(route.code, direction);
      if (!name) continue;
      const pair = `${name}:${direction.directionId === 0 ? 'I' : 'R'}`;
      if (seenPairs.has(pair)) continue;
      seenPairs.add(pair);
      routePairs.push([pair, direction.directionId]);
    }
    if (routePairs.length === 0) {
      if (!(route.directions ?? []).some((d) => visorServiceName(route.code, d))) untracked.push(route);
      continue;
    }
    if (full || pairs.length + routePairs.length > max) {
      full = true;
      omitted += routePairs.length;
      omittedRoutes.push(route);
      continue;
    }
    for (const [pair, directionId] of routePairs) {
      pairs.push(pair);
      routeByPair.set(pair, { routeId: route.id, directionId });
    }
  }
  return { pairs, routeByPair, untracked, omitted, omittedRoutes };
}

/**
 * Pares válidos para la URL: en mayúsculas, sin repetidos, a lo más
 * MAX_GPS_PAIRS (los primeros, que son los prioritarios) y ordenados, para
 * que el mismo conjunto dé siempre la misma URL y comparta la caché de la CDN.
 */
export function normalizeGpsPairs(pairs: readonly string[]): string[] {
  const valid: string[] = [];
  for (const raw of pairs) {
    const pair = raw.trim().toUpperCase();
    if (GPS_PAIR.test(pair) && !valid.includes(pair)) valid.push(pair);
  }
  return valid.slice(0, MAX_GPS_PAIRS).sort();
}

/** "/api/route-vehicles?services=24F:R,401I:I" con los pares ya normalizados. */
export function routeVehiclesUrl(pairs: readonly string[]): string {
  return `/api/route-vehicles?services=${normalizeGpsPairs(pairs).join(',')}`;
}

// ── Estado acumulado entre consultas ────────────────────────────────────────

export interface RouteVehiclesState {
  byService: Record<string, ServiceGps>;
  /** Momento (ms Unix) de la última respuesta buena. */
  fetchedAt: number | null;
  failures: number;
  lastFailure: LiveFailure | null;
  /** Hora del equipo menos hora del servidor al recibir la última respuesta buena. */
  clockOffsetMs?: number;
}

export const INITIAL_ROUTE_VEHICLES_STATE: RouteVehiclesState = {
  byService: {},
  fetchedAt: null,
  failures: 0,
  lastFailure: null,
};

function freshOk(service: ServiceGps | undefined, now: number): service is Extract<ServiceGps, { status: 'ok' }> {
  return service?.status === 'ok' && now - service.fetchedAt <= GPS_MAX_AGE_MS;
}

/**
 * Hora para envejecer posiciones, en el reloj del servidor: la del equipo,
 * corregida solo si está corrida más de CLOCK_SKEW_TOLERANCE_MS.
 */
export function sourceClock(state: Pick<RouteVehiclesState, 'clockOffsetMs'>, now: number): number {
  const offset = state.clockOffsetMs ?? 0;
  return Math.abs(offset) > CLOCK_SKEW_TOLERANCE_MS ? now - offset : now;
}

/**
 * Suma una respuesta buena al estado, solo para los pares consultados. Un
 * servicio que esta vez no se pudo leer conserva su último dato bueno
 * mientras no pase de GPS_MAX_AGE_MS; uno más viejo que el que ya se tiene
 * (caché de otra instancia) no lo pisa. `receivedAt` (hora del equipo al
 * recibirla) mide cuánto está corrido su reloj.
 */
export function applyRouteVehicles(
  state: RouteVehiclesState,
  response: RouteVehiclesResponse,
  pairs: readonly string[],
  receivedAt?: number,
): RouteVehiclesState {
  const now = response.fetchedAt;
  const byService: Record<string, ServiceGps> = {};
  for (const pair of pairs) {
    const previous = state.byService[pair];
    const next = response.services[pair] ?? { status: 'unavailable' };
    if (next.status === 'ok') {
      byService[pair] = previous?.status === 'ok' && previous.fetchedAt > next.fetchedAt ? previous : next;
    } else {
      byService[pair] = freshOk(previous, now) ? previous : next;
    }
  }
  return {
    byService,
    fetchedAt: Math.max(state.fetchedAt ?? 0, response.fetchedAt),
    failures: 0,
    lastFailure: null,
    clockOffsetMs: receivedAt != null ? receivedAt - response.fetchedAt : state.clockOffsetMs,
  };
}

/** Consulta fallida: queda solo lo bueno de menos de GPS_MAX_AGE_MS. */
export function applyRouteVehiclesFailure(
  state: RouteVehiclesState,
  failure: LiveFailure,
  now: number,
): RouteVehiclesState {
  const byService: Record<string, ServiceGps> = {};
  const sourceNow = sourceClock(state, now);
  for (const [pair, service] of Object.entries(state.byService)) {
    if (freshOk(service, sourceNow)) byService[pair] = service;
  }
  return { ...state, byService, failures: state.failures + 1, lastFailure: failure };
}

/** Cambiaron las líneas en el mapa: se conserva lo de los pares que siguen. */
export function retainGpsPairs(state: RouteVehiclesState, pairs: readonly string[]): RouteVehiclesState {
  const byService: Record<string, ServiceGps> = {};
  for (const pair of pairs) {
    const service = state.byService[pair];
    if (service) byService[pair] = service;
  }
  return { ...state, byService };
}

// ── Lo que se dibuja ────────────────────────────────────────────────────────

/** Edad de la posición según el GPS, o null si la fuente no dio la hora. */
export function vehicleAge(vehicle: Pick<GpsVehicle, 'reportedAt'>, now: number): number | null {
  return vehicle.reportedAt == null ? null : Math.max(0, now - vehicle.reportedAt);
}

export interface MapGpsVehicle extends GpsVehicle {
  /** Clave estable entre consultas: servicio, sentido y patente (o posición en la lista). */
  id: string;
  ageMs: number;
  /** Pasó GPS_STALE_AFTER_MS: se dibuja como posición vieja. */
  stale: boolean;
}

/**
 * Micros con GPS para el mapa. Sin hora del GPS, la edad es la de la
 * consulta. Pasados GPS_MAX_AGE_MS no se dibujan.
 */
export function gpsVehiclesForMap(byService: Record<string, ServiceGps>, now: number): MapGpsVehicle[] {
  const out: MapGpsVehicle[] = [];
  for (const [pair, service] of Object.entries(byService)) {
    if (service.status !== 'ok') continue;
    service.vehicles.forEach((vehicle, index) => {
      const ageMs = vehicleAge(vehicle, now) ?? Math.max(0, now - service.fetchedAt);
      if (ageMs > GPS_MAX_AGE_MS) return;
      const id = `${pair}#${vehicle.plate ?? index}`;
      out.push({ ...vehicle, id, ageMs, stale: ageMs > GPS_STALE_AFTER_MS });
    });
  }
  return out;
}

/**
 * Por línea: "live" si hay al menos una micro para dibujar; "no-gps" si la
 * fuente respondió hace menos de 5 min por todos sus sentidos sin ninguna
 * vigente ("sin GPS ahora"); "pending" mientras falta una respuesta vigente;
 * "unavailable" si algún sentido no se pudo consultar o la consulta falló.
 */
export type RouteGpsStatus = 'pending' | 'live' | 'no-gps' | 'unavailable';

export function gpsStatusByRoute(
  routeByPair: GpsSelection['routeByPair'],
  state: RouteVehiclesState,
  now: number,
): Map<string, { status: RouteGpsStatus; vehicles: number }> {
  const byRoute = new Map<
    string,
    { vehicles: number; plates: Set<string>; ok: number; missing: number; failed: number }
  >();
  for (const [pair, { routeId }] of routeByPair) {
    const entry = byRoute.get(routeId) ?? { vehicles: 0, plates: new Set<string>(), ok: 0, missing: 0, failed: 0 };
    byRoute.set(routeId, entry);
    const service = state.byService[pair];
    if (service && service.status !== 'ok') entry.failed += 1;
    // Sin dato o con uno de más de 5 min: no se sabe, se espera la consulta.
    else if (!freshOk(service, now)) entry.missing += 1;
    else {
      entry.ok += 1;
      // Una patente listada en los dos sentidos es una micro, como en el mapa.
      for (const vehicle of gpsVehiclesForMap({ [pair]: service }, now)) {
        if (!vehicle.plate) entry.vehicles += 1;
        else if (!entry.plates.has(vehicle.plate)) {
          entry.plates.add(vehicle.plate);
          entry.vehicles += 1;
        }
      }
    }
  }
  const out = new Map<string, { status: RouteGpsStatus; vehicles: number }>();
  for (const [routeId, entry] of byRoute) {
    let status: RouteGpsStatus;
    if (entry.vehicles > 0) status = 'live';
    else if (entry.missing === 0 && entry.failed === 0) status = 'no-gps';
    else if (entry.failed === 0 && !state.lastFailure) status = 'pending';
    else status = 'unavailable';
    out.set(routeId, { status, vehicles: entry.vehicles });
  }
  return out;
}
