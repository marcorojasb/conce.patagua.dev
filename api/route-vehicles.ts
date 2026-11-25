// Micros con GPS por línea y sentido, desde la fuente que usa la app de
// Transapp (phone.dtpr.transapp.cl/v7/phone/<id>/synoptic/machines). La fuente
// solo responde por servicio y sentido (sin `route` devuelve una lista vacía,
// no la red completa), así que el visor pide varios pares de una vez:
// GET /api/route-vehicles?services=24F:R,401I:I
//
// - De 1 a 16 pares "<SERVICIO>:<I|R>" con el nombre de la fuente ("24F",
//   "401I", "201AUR"), en mayúsculas y sin repetir; cualquier otra cosa es 400
//   sin consultar. Sin TRANSAPP_PHONE_ID responde 503 "unconfigured".
// - Por par: caché de 20 s en memoria de la instancia y consulta en vuelo
//   compartida; los pares se consultan en paralelo, con 10 s de espera máxima.
//   La CDN guarda cada respuesta 15 s.
// - Tope de MAX_UPSTREAM_PER_MINUTE consultas por minuto por instancia, aparte
//   del de los paraderos. Pasado el tope, o si la fuente falla, se sirve lo
//   último del par si tiene menos de 2 min (con su propio `fetchedAt`); si no,
//   "rate_limited" o "unavailable". Lo guardado se descarta a los 10 min.
// - De cada micro salen solo patente, posición, rumbo y hora del reporte: ni
//   el identificador del equipo GPS ni el resto de los campos. Una posición
//   fuera del Gran Concepción o en 0,0 es un GPS sin señal y no sale.
// - Una lista vacía es una respuesta válida ("sin GPS ahora"), no una falla:
//   hay líneas que a ratos no transmiten (401/411/421 en Tomé).

import { fetchSource, isRecord, jsonResponse, minuteBudget, sourceId } from './_transapp.js';

const CACHE_TTL_MS = 20_000;
const LAST_GOOD_MAX_AGE_MS = 2 * 60_000;
const EVICT_AFTER_MS = 10 * 60_000;
const UPSTREAM_TIMEOUT_MS = 10_000;
const MAX_UPSTREAM_PER_MINUTE = 60;
const MAX_PAIRS = 16;
const CDN_SECONDS = 15;
const PAIR = /^([0-9A-Z]{2,7}):([IR])$/;
// Un reporte con hora futura más allá de esto es un reloj de GPS desajustado.
const FUTURE_TOLERANCE_MS = 60_000;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;
// Caja amplia del Gran Concepción (Tomé/Dichato a Santa Juana/Lota), la misma
// de src/realtime/live-arrivals.ts.
const REGION = { minLat: -37.6, maxLat: -36.3, minLng: -73.6, maxLng: -72.5 };

export type RouteVehiclesError = 'bad_request' | 'unconfigured';

interface RawSynoptic {
  machines?: unknown;
}

interface RawMachine {
  licensePlate?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  bearing?: unknown;
  timestamp?: unknown;
}

interface Vehicle {
  plate: string | null;
  lat: number;
  lng: number;
  bearing: number | null;
  reportedAt: number | null;
}

interface CachedEntry {
  fetchedAt: number;
  vehicles: Vehicle[];
}

type ServicePayload =
  | { status: 'ok'; fetchedAt: number; vehicles: Vehicle[] }
  | { status: 'unavailable' | 'rate_limited' };

const cache = new Map<string, CachedEntry>();
const inFlight = new Map<string, Promise<CachedEntry>>();
const budget = minuteBudget(MAX_UPSTREAM_PER_MINUTE);

function fail(error: RouteVehiclesError, status: number, cdnSeconds: number): Response {
  return jsonResponse({ error }, status, cdnSeconds);
}

/** Pares normalizados y sin repetir, o null si alguno no calza o son demasiados. */
function parsePairs(raw: string | null): string[] | null {
  if (!raw) return null;
  const pairs = new Set<string>();
  for (const item of raw.split(',')) {
    const pair = item.trim().toUpperCase();
    if (!PAIR.test(pair)) return null;
    pairs.add(pair);
    if (pairs.size > MAX_PAIRS) return null;
  }
  return [...pairs];
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return Number(value);
  return null;
}

/** Patentes chilenas: "ABCD12" o "AB1234"; cualquier otra cosa no se muestra. */
function readPlate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const plate = value.toUpperCase().replace(/[\s.-]+/g, '');
  return plate.length === 6 && /^[A-Z]{2,4}\d{2,4}$/.test(plate) ? plate : null;
}

/** Rumbo en grados enteros 0–359; fuera de 0–360 se toma como desconocido. */
function readBearing(value: unknown): number | null {
  const bearing = finiteNumber(value);
  if (bearing == null || bearing < 0 || bearing > 360) return null;
  return Math.round(bearing) % 360;
}

function readReportedAt(value: unknown, fetchedAt: number): number | null {
  if (typeof value !== 'string' || !ISO_TIMESTAMP.test(value)) return null;
  const at = Date.parse(value);
  return Number.isFinite(at) && at <= fetchedAt + FUTURE_TOLERANCE_MS ? at : null;
}

function readVehicle(raw: unknown, fetchedAt: number): Vehicle | null {
  if (!isRecord(raw)) return null;
  const machine = raw as RawMachine;
  const lat = finiteNumber(machine.latitude);
  const lng = finiteNumber(machine.longitude);
  if (lat == null || lng == null || (lat === 0 && lng === 0)) return null;
  if (lat < REGION.minLat || lat > REGION.maxLat || lng < REGION.minLng || lng > REGION.maxLng) return null;
  return {
    plate: readPlate(machine.licensePlate),
    lat,
    lng,
    bearing: readBearing(machine.bearing),
    reportedAt: readReportedAt(machine.timestamp, fetchedAt),
  };
}

function readVehicles(raw: unknown, fetchedAt: number): Vehicle[] | null {
  if (!isRecord(raw)) return null;
  const machines = (raw as RawSynoptic).machines;
  if (!Array.isArray(machines)) return null;
  return machines.flatMap((machine) => readVehicle(machine, fetchedAt) ?? []);
}

function pruneCache(now: number): void {
  for (const [pair, entry] of cache) {
    if (now - entry.fetchedAt >= EVICT_AFTER_MS) cache.delete(pair);
  }
}

async function fetchVehicles(id: string, pair: string): Promise<CachedEntry> {
  const [service, direction] = pair.split(':');
  const raw = await fetchSource(
    id,
    `synoptic/machines?route=${encodeURIComponent(service)}&direction=${direction}`,
    UPSTREAM_TIMEOUT_MS,
  );
  const fetchedAt = Date.now();
  const vehicles = readVehicles(raw, fetchedAt);
  if (!vehicles) throw new Error('respuesta ilegible');
  const entry = { fetchedAt, vehicles };
  cache.set(pair, entry);
  return entry;
}

function served(entry: CachedEntry): ServicePayload {
  return { status: 'ok', fetchedAt: entry.fetchedAt, vehicles: entry.vehicles };
}

async function servicePayload(id: string, pair: string, now: number): Promise<ServicePayload> {
  const cached = cache.get(pair);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) return served(cached);
  const lastGood = cached && now - cached.fetchedAt < LAST_GOOD_MAX_AGE_MS ? cached : null;

  let pending = inFlight.get(pair);
  if (!pending) {
    if (!budget.take(now)) return lastGood ? served(lastGood) : { status: 'rate_limited' };
    pending = fetchVehicles(id, pair).finally(() => inFlight.delete(pair));
    inFlight.set(pair, pending);
  }

  try {
    return served(await pending);
  } catch {
    return lastGood ? served(lastGood) : { status: 'unavailable' };
  }
}

export async function GET(request: Request): Promise<Response> {
  const pairs = parsePairs(new URL(request.url).searchParams.get('services'));
  if (!pairs) return fail('bad_request', 400, 3600);

  const id = sourceId();
  if (!id) return fail('unconfigured', 503, 60);

  const now = Date.now();
  pruneCache(now);
  const payloads = await Promise.all(pairs.map((pair) => servicePayload(id, pair, now)));
  const services: Record<string, ServicePayload> = {};
  pairs.forEach((pair, i) => {
    services[pair] = payloads[i];
  });
  return jsonResponse({ fetchedAt: Date.now(), services }, 200, CDN_SECONDS);
}
