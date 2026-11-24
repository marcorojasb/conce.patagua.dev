// Intermediaria entre el visor y la fuente de llegadas que usa la app de
// Transapp (phone.dtpr.transapp.cl). Hace falta porque esa fuente no manda
// cabecera CORS, y además evita que cada visitante consulte una fuente ajena:
//
// - El identificador de la ruta /v7/phone/<id>/ sale de TRANSAPP_PHONE_ID. Sin
//   esa variable responde 503 "unconfigured" y no consulta nada.
// - Caché por paradero de 25 s en la CDN de Vercel (s-maxage) y en memoria de
//   la instancia, más consultas en vuelo compartidas.
// - Tope de MAX_UPSTREAM_PER_MINUTE consultas a la fuente por instancia; pasado
//   el tope se sirve lo último guardado del paradero o 429.
// - Solo códigos con la forma de los paraderos del GTFS de DTPR ("P" + stop_id
//   de 3 a 8 dígitos o "PV…", y los "PF…" renombrados por la fuente), en
//   mayúsculas: variantes del mismo código no gastan otra consulta ni otra
//   entrada de caché. Lo guardado se descarta a los 10 min.
//
// Solo se valida que la respuesta sea JSON con una lista `predictions` y se
// reenvían predictions/routeInfo/alerts tal cual: la interpretación vive en
// src/realtime/live-arrivals.ts.

const UPSTREAM = 'https://phone.dtpr.transapp.cl/v7/phone';
const USER_AGENT = 'visor-transporte/1.0';
const CACHE_TTL_MS = 25_000;
const LAST_GOOD_MAX_AGE_MS = 10 * 60_000;
const UPSTREAM_TIMEOUT_MS = 8_000;
const MAX_UPSTREAM_PER_MINUTE = 30;
const STOP_CODE = /^(?:P(?:PV)?\d{3,8}|PF-?\d{5})$/;

export type StopArrivalsError = 'bad_request' | 'unconfigured' | 'rate_limited' | 'upstream';

interface UpstreamBody {
  predictions: unknown[];
  routeInfo?: unknown;
  alerts?: unknown;
}

interface CachedEntry {
  fetchedAt: number;
  data: UpstreamBody;
}

const cache = new Map<string, CachedEntry>();
const inFlight = new Map<string, Promise<CachedEntry>>();
let upstreamCalls: number[] = [];

function json(body: unknown, status: number, cdnSeconds: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=0, s-maxage=${cdnSeconds}`,
    },
  });
}

function fail(error: StopArrivalsError, status: number, cdnSeconds: number): Response {
  return json({ error }, status, cdnSeconds);
}

function readable(raw: unknown): UpstreamBody | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const body = raw as Record<string, unknown>;
  if (!Array.isArray(body.predictions)) return null;
  return { predictions: body.predictions, routeInfo: body.routeInfo, alerts: body.alerts };
}

function pruneCache(now: number): void {
  for (const [code, entry] of cache) {
    if (now - entry.fetchedAt >= LAST_GOOD_MAX_AGE_MS) cache.delete(code);
  }
}

function underLimit(now: number): boolean {
  upstreamCalls = upstreamCalls.filter((t) => now - t < 60_000);
  return upstreamCalls.length < MAX_UPSTREAM_PER_MINUTE;
}

async function fetchUpstream(phoneId: string, stopCode: string): Promise<CachedEntry> {
  upstreamCalls.push(Date.now());
  const url = `${UPSTREAM}/${encodeURIComponent(phoneId)}/stopInfo?stopCode=${encodeURIComponent(stopCode)}&mode=3`;
  const res = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = readable(await res.json());
  if (!data) throw new Error('respuesta ilegible');
  const entry = { fetchedAt: Date.now(), data };
  cache.set(stopCode, entry);
  return entry;
}

export async function GET(request: Request): Promise<Response> {
  const stopCode = (new URL(request.url).searchParams.get('stop') ?? '').toUpperCase();
  if (!STOP_CODE.test(stopCode)) return fail('bad_request', 400, 3600);

  const phoneId = process.env.TRANSAPP_PHONE_ID?.trim();
  if (!phoneId) return fail('unconfigured', 503, 60);

  const now = Date.now();
  pruneCache(now);
  const cached = cache.get(stopCode);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return json(cached, 200, Math.ceil((CACHE_TTL_MS - (now - cached.fetchedAt)) / 1000));
  }

  let pending = inFlight.get(stopCode);
  if (!pending) {
    if (!underLimit(now)) {
      if (cached && now - cached.fetchedAt < LAST_GOOD_MAX_AGE_MS) return json(cached, 200, 10);
      return fail('rate_limited', 429, 10);
    }
    pending = fetchUpstream(phoneId, stopCode).finally(() => inFlight.delete(stopCode));
    inFlight.set(stopCode, pending);
  }

  try {
    return json(await pending, 200, CACHE_TTL_MS / 1000);
  } catch {
    return fail('upstream', 502, 15);
  }
}
