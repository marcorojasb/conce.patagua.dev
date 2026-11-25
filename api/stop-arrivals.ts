// Intermediaria entre el visor y la fuente de llegadas que usa la app de
// Transapp (phone.dtpr.transapp.cl). Hace falta porque esa fuente no manda
// cabecera CORS, y además evita que cada visitante consulte una fuente ajena:
//
// - El identificador de la ruta /v7/phone/<id>/ sale de TRANSAPP_PHONE_ID. Sin
//   esa variable responde 503 "unconfigured" y no consulta nada.
// - Caché por paradero de 25 s en la CDN de Vercel (s-maxage) y en memoria de
//   la instancia, más consultas en vuelo compartidas.
// - Tope de MAX_UPSTREAM_PER_MINUTE consultas a la fuente por instancia (aparte
//   del de api/route-vehicles.ts); pasado el tope se sirve lo último guardado
//   del paradero o 429.
// - Solo códigos con la forma de los paraderos del GTFS de DTPR ("P" + stop_id
//   de 3 a 8 dígitos o "PV…", y los "PF…" renombrados por la fuente), en
//   mayúsculas: variantes del mismo código no gastan otra consulta ni otra
//   entrada de caché. Lo guardado se descarta a los 10 min.
//
// Solo se valida que la respuesta sea JSON con una lista `predictions`, y de
// predictions/routeInfo/alerts se reenvían únicamente los campos que lee
// src/realtime/live-arrivals.ts, con valores simples (texto, número, booleano
// o null): el identificador del equipo GPS y el resto no salen de aquí. La
// interpretación vive en ese archivo.

import { fetchSource, isRecord, jsonResponse, minuteBudget, sourceId } from './_transapp.js';

const CACHE_TTL_MS = 25_000;
const LAST_GOOD_MAX_AGE_MS = 10 * 60_000;
const UPSTREAM_TIMEOUT_MS = 8_000;
const MAX_UPSTREAM_PER_MINUTE = 30;
const STOP_CODE = /^(?:P(?:PV)?\d{3,8}|PF-?\d{5})$/;

const PREDICTION_FIELDS = [
  'route',
  'direction',
  'epochTime',
  'timeLabel',
  'distance',
  'realtime',
  'latitude',
  'longitude',
  'licensePlate',
  'tripId',
] as const;
const ROUTE_INFO_FIELDS = ['servicio', 'msg'] as const;
const ALERT_FIELDS = ['message'] as const;

export type StopArrivalsError = 'bad_request' | 'unconfigured' | 'rate_limited' | 'upstream';

type ForwardedValue = string | number | boolean | null;
type ForwardedItem = Record<string, ForwardedValue>;

interface ForwardedBody {
  predictions: ForwardedItem[];
  routeInfo: ForwardedItem[];
  alerts: ForwardedItem[];
}

interface CachedEntry {
  fetchedAt: number;
  data: ForwardedBody;
}

const cache = new Map<string, CachedEntry>();
const inFlight = new Map<string, Promise<CachedEntry>>();
const budget = minuteBudget(MAX_UPSTREAM_PER_MINUTE);

function fail(error: StopArrivalsError, status: number, cdnSeconds: number): Response {
  return jsonResponse({ error }, status, cdnSeconds);
}

function forwardedValue(value: unknown): value is ForwardedValue {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function pickFields(items: unknown, fields: readonly string[]): ForwardedItem[] {
  if (!Array.isArray(items)) return [];
  const out: ForwardedItem[] = [];
  for (const item of items) {
    if (!isRecord(item)) continue;
    const kept: ForwardedItem = {};
    for (const field of fields) {
      const value = item[field];
      if (forwardedValue(value)) kept[field] = value;
    }
    if (Object.keys(kept).length > 0) out.push(kept);
  }
  return out;
}

function readable(raw: unknown): ForwardedBody | null {
  if (!isRecord(raw) || !Array.isArray(raw.predictions)) return null;
  return {
    predictions: pickFields(raw.predictions, PREDICTION_FIELDS),
    routeInfo: pickFields(raw.routeInfo, ROUTE_INFO_FIELDS),
    alerts: pickFields(raw.alerts, ALERT_FIELDS),
  };
}

function pruneCache(now: number): void {
  for (const [code, entry] of cache) {
    if (now - entry.fetchedAt >= LAST_GOOD_MAX_AGE_MS) cache.delete(code);
  }
}

async function fetchUpstream(id: string, stopCode: string): Promise<CachedEntry> {
  const raw = await fetchSource(id, `stopInfo?stopCode=${encodeURIComponent(stopCode)}&mode=3`, UPSTREAM_TIMEOUT_MS);
  const data = readable(raw);
  if (!data) throw new Error('respuesta ilegible');
  const entry = { fetchedAt: Date.now(), data };
  cache.set(stopCode, entry);
  return entry;
}

export async function GET(request: Request): Promise<Response> {
  const stopCode = (new URL(request.url).searchParams.get('stop') ?? '').toUpperCase();
  if (!STOP_CODE.test(stopCode)) return fail('bad_request', 400, 3600);

  const id = sourceId();
  if (!id) return fail('unconfigured', 503, 60);

  const now = Date.now();
  pruneCache(now);
  const cached = cache.get(stopCode);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return jsonResponse(cached, 200, Math.ceil((CACHE_TTL_MS - (now - cached.fetchedAt)) / 1000));
  }

  let pending = inFlight.get(stopCode);
  if (!pending) {
    if (!budget.take(now)) {
      if (cached && now - cached.fetchedAt < LAST_GOOD_MAX_AGE_MS) return jsonResponse(cached, 200, 10);
      return fail('rate_limited', 429, 10);
    }
    pending = fetchUpstream(id, stopCode).finally(() => inFlight.delete(stopCode));
    inFlight.set(stopCode, pending);
  }

  try {
    return jsonResponse(await pending, 200, CACHE_TTL_MS / 1000);
  } catch {
    return fail('upstream', 502, 15);
  }
}
