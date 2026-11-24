// Llegadas en vivo a un paradero desde la fuente que usa la app de Transapp
// (phone.dtpr.transapp.cl/v7/phone/<zona>/stopInfo). No es un feed oficial ni
// documentado: el visor la consulta a través de /api/stop-arrivals (ver
// api/stop-arrivals.ts) y aquí solo se interpreta la respuesta cruda.
//
// Forma comprobada con respuestas reales (24-nov-2026, 6 paraderos de 6
// comunas): cada predicción trae `route` y `direction` ("I"/"R"), `epochTime`
// (s), `timeLabel`, `distance` (metros en línea recta, no por la ruta),
// `latitude`/`longitude` del bus, `licensePlate`, `tripId` y `realtime`
// (`true` si la predicción sale del GPS). Solo `realtime: true` cuenta como
// GPS: un valor ausente o de otro tipo ("false", 0, null) no.
//
// Reglas heredadas de la integración que ya funciona en otro proyecto:
// - Si la respuesta no se entiende o `predictions` no es una lista, es una
//   falla, no "sin micros".
// - Minutos desde `epochTime` (segundos Unix); si falta, el primer número de
//   `timeLabel` ("Llegando" = 0). Si ya debía pasar hace más de 2 min, se
//   descarta.
// - La fuente a veces responde vacío sin motivo (3 de 14 consultas el
//   20-nov): una respuesta vacía cuando la anterior tenía micros por llegar no
//   la reemplaza. El dato anterior sigue valiendo 10 min mostrando su edad.
// - Una línea sin micros con alerta "Servicio X (Ida) … tiempo real" se
//   muestra como "sin datos en vivo"; nunca se rellena con simuladas.

import type { Route, RouteDirection } from '@/types/transport';

export type LiveDirection = 'I' | 'R';

export interface LiveArrival {
  /** Nombre del servicio en la fuente, uno por sentido ("20A", "401I"): ver `liveServiceName`. */
  route: string;
  direction: LiveDirection | null;
  /** Llegada estimada (ms Unix). */
  arrivalAt: number;
  timeLabel: string | null;
  /** Metros en línea recta hasta el paradero, según la fuente. */
  distanceM: number | null;
  plate: string | null;
  tripId: string | null;
  position: { lat: number; lng: number } | null;
  /** `true` solo si la fuente marca la predicción con `realtime: true` (GPS). */
  realtime: boolean;
}

export interface LiveRouteInfo {
  route: string;
  direction: LiveDirection | null;
  msg: string | null;
}

export interface StopInfoSnapshot {
  /** Momento (ms Unix) en que se consultó la fuente. */
  fetchedAt: number;
  arrivals: LiveArrival[];
  routeInfo: LiveRouteInfo[];
  /** Alertas en texto plano (la fuente las manda en HTML). */
  alerts: string[];
}

export type StopInfoParse =
  | { ok: true; snapshot: StopInfoSnapshot }
  | { ok: false; error: string };

// ── Forma cruda de la respuesta ─────────────────────────────────────────────

interface RawPrediction {
  route?: unknown;
  direction?: unknown;
  epochTime?: unknown;
  timeLabel?: unknown;
  distance?: unknown;
  realtime?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  licensePlate?: unknown;
  tripId?: unknown;
}

interface RawRouteInfo {
  servicio?: unknown;
  msg?: unknown;
}

interface RawAlert {
  message?: unknown;
}

interface RawStopInfo {
  predictions?: unknown;
  routeInfo?: unknown;
  alerts?: unknown;
}

export const PASSED_TOLERANCE_MS = 2 * 60_000;
export const SNAPSHOT_MAX_AGE_MS = 10 * 60_000;
export const STALE_AFTER_MS = 2 * 60_000;
/** Cada cuánto se recalculan minutos, edad y vencimiento entre consultas. */
export const LIVE_CLOCK_TICK_MS = 5_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return Number(value);
  return null;
}

function parseDirection(value: unknown): LiveDirection | null {
  return value === 'I' || value === 'R' ? value : null;
}

/** Minutos que dice `timeLabel`: "Llegando" = 0, si no el primer número. */
export function minutesFromLabel(label: string): number | null {
  if (/llegando/i.test(label)) return 0;
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : null;
}

// Caja amplia del Gran Concepción (Tomé/Dichato a Santa Juana/Lota): una
// posición fuera de ella o en 0,0 es un GPS sin señal, no un bus.
const REGION = { minLat: -37.6, maxLat: -36.3, minLng: -73.6, maxLng: -72.5 };

function readPosition(raw: RawPrediction): LiveArrival['position'] {
  const lat = finiteNumber(raw.latitude);
  const lng = finiteNumber(raw.longitude);
  if (lat == null || lng == null) return null;
  if (lat < REGION.minLat || lat > REGION.maxLat || lng < REGION.minLng || lng > REGION.maxLng) return null;
  return { lat, lng };
}

/** Patentes chilenas: "ABCD12" o "AB1234"; cualquier otra cosa no se muestra. */
function readPlate(value: unknown): string | null {
  const plate = nonEmptyString(value)?.toUpperCase().replace(/[\s.-]+/g, '');
  return plate && /^[A-Z]{2,4}\d{2,4}$/.test(plate) && plate.length === 6 ? plate : null;
}

function parsePrediction(raw: unknown, fetchedAt: number): LiveArrival | null {
  if (!isRecord(raw)) return null;
  const p = raw as RawPrediction;
  const rawRoute = nonEmptyString(p.route);
  if (!rawRoute) return null;
  const explicitDirection = parseDirection(p.direction);
  const route = liveServiceName(rawRoute, explicitDirection);
  const timeLabel = nonEmptyString(p.timeLabel);
  const epochSeconds = finiteNumber(p.epochTime);
  let arrivalAt: number | null = null;
  if (epochSeconds != null && epochSeconds > 1_000_000_000) {
    arrivalAt = epochSeconds * 1000;
  } else if (timeLabel) {
    const minutes = minutesFromLabel(timeLabel);
    if (minutes != null) arrivalAt = fetchedAt + minutes * 60_000;
  }
  if (arrivalAt == null) return null;
  const distance = finiteNumber(p.distance);
  return {
    route,
    direction: explicitDirection ?? suffixDirection(route),
    arrivalAt,
    timeLabel,
    distanceM: distance != null && distance >= 0 ? distance : null,
    plate: readPlate(p.licensePlate),
    tripId: nonEmptyString(p.tripId),
    position: readPosition(p),
    realtime: p.realtime === true,
  };
}

// ── Nombres de servicio ─────────────────────────────────────────────────────
// La fuente nombra cada sentido por separado, como el letrero de la micro:
// las urbanas con la variante ("20A" es el 20VA de regreso, "02CY" el 02C-Y)
// y las interurbanas y el Biobús con el sentido pegado ("401I", "201AUR",
// "B02R"). En "11R" o "63I" la última letra es parte de la variante, no el
// sentido. Las alertas a veces omiten el sufijo ("Servicio 201AU (Regreso)").

const SUFFIXED_SERVICE = /^(?:\d{3}|B\d{2})(?:AU)?$/;
const SUFFIXED_WITH_DIRECTION = /^(?:\d{3}|B\d{2})(?:AU)?([IR])$/;

/** Nombre canónico del servicio: "201 AU" + R → "201AUR", "20A" → "20A". */
export function liveServiceName(route: string, direction: LiveDirection | null): string {
  const name = route.toUpperCase().replace(/[\s-]+/g, '');
  return direction && SUFFIXED_SERVICE.test(name) ? name + direction : name;
}

function suffixDirection(service: string): LiveDirection | null {
  const match = SUFFIXED_WITH_DIRECTION.exec(service);
  return match ? (match[1] as LiveDirection) : null;
}

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Las alertas llegan en HTML: se pasan a texto plano y nunca se inyectan. */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (entity, body: string) => {
      if (body[0] === '#') {
        const code = body[1] === 'x' || body[1] === 'X'
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
      }
      return HTML_ENTITIES[body.toLowerCase()] ?? entity;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseStopInfo(raw: unknown, fetchedAt: number): StopInfoParse {
  if (!isRecord(raw)) return { ok: false, error: 'Respuesta ilegible' };
  const body = raw as RawStopInfo;
  if (!Array.isArray(body.predictions)) {
    return { ok: false, error: 'Respuesta sin lista de predicciones' };
  }

  const arrivals: LiveArrival[] = [];
  for (const item of body.predictions) {
    const arrival = parsePrediction(item, fetchedAt);
    if (arrival) arrivals.push(arrival);
  }
  arrivals.sort((a, b) => a.arrivalAt - b.arrivalAt);

  const routeInfo: LiveRouteInfo[] = [];
  if (Array.isArray(body.routeInfo)) {
    for (const item of body.routeInfo) {
      if (!isRecord(item)) continue;
      const info = item as RawRouteInfo;
      const servicio = nonEmptyString(info.servicio);
      if (!servicio) continue;
      const route = liveServiceName(servicio, null);
      routeInfo.push({ route, direction: suffixDirection(route), msg: nonEmptyString(info.msg) });
    }
  }

  const alerts: string[] = [];
  if (Array.isArray(body.alerts)) {
    for (const item of body.alerts) {
      if (!isRecord(item)) continue;
      const message = nonEmptyString((item as RawAlert).message);
      if (!message) continue;
      const text = htmlToText(message);
      if (text) alerts.push(text);
    }
  }

  return { ok: true, snapshot: { fetchedAt, arrivals, routeInfo, alerts } };
}

// ── Reglas sobre el dato ya interpretado ────────────────────────────────────

export function isGone(arrival: LiveArrival, now: number): boolean {
  return arrival.arrivalAt < now - PASSED_TOLERANCE_MS;
}

/** Minutos que faltan: redondeado, nunca negativo. */
export function minutesUntil(arrival: LiveArrival, now: number): number {
  return Math.max(0, Math.round((arrival.arrivalAt - now) / 60_000));
}

export function upcomingArrivals(snapshot: StopInfoSnapshot, now: number): LiveArrival[] {
  return snapshot.arrivals.filter((a) => !isGone(a, now));
}

export function snapshotAge(snapshot: StopInfoSnapshot, now: number): number {
  return Math.max(0, now - snapshot.fetchedAt);
}

/** "recién", "hace 40 s", "hace 3 min". */
export function formatAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 10) return 'recién';
  if (seconds < 60) return `hace ${Math.floor(seconds / 10) * 10} s`;
  return `hace ${Math.floor(seconds / 60)} min`;
}

/** Servicios con la alerta "Servicio X (Ida|Regreso) … tiempo real", por nombre canónico. */
export function servicesWithoutGps(alerts: string[]): Map<string, LiveDirection> {
  const out = new Map<string, LiveDirection>();
  for (const alert of alerts) {
    if (!/tiempo real/i.test(alert)) continue;
    for (const match of alert.matchAll(/Servicio\s+([0-9A-Za-z-]+)\s*\((Ida|Regreso|Vuelta|Retorno)\)/gi)) {
      const direction: LiveDirection = /^ida$/i.test(match[2]) ? 'I' : 'R';
      out.set(liveServiceName(match[1], direction), direction);
    }
  }
  return out;
}

export interface ServiceNote {
  route: string;
  direction: LiveDirection | null;
  /** "sin datos en vivo · pasa cada 1 hora aprox." */
  text: string;
}

/**
 * Notas para las líneas que no traen micros: "sin datos en vivo" si una
 * alerta lo dice para esa línea y sentido, "pasa cada N" si routeInfo lo trae.
 */
export function serviceNotes(snapshot: StopInfoSnapshot): ServiceNote[] {
  const withArrivals = new Set(snapshot.arrivals.map((a) => a.route));
  const noGps = servicesWithoutGps(snapshot.alerts);
  const services = new Map<string, { route: string; direction: LiveDirection | null; msg: string | null }>();
  for (const info of snapshot.routeInfo) {
    services.set(info.route, { ...info, direction: info.direction ?? noGps.get(info.route) ?? null });
  }
  for (const [route, direction] of noGps) {
    if (!services.has(route)) services.set(route, { route, direction, msg: null });
  }

  const notes: ServiceNote[] = [];
  for (const [route, service] of services) {
    if (withArrivals.has(route)) continue;
    const parts: string[] = [];
    if (noGps.has(route)) parts.push('sin datos en vivo');
    const frequency = service.msg?.match(/pasa cada\s+(.+)$/i);
    if (frequency) parts.push(`pasa cada ${frequency[1]}`);
    if (parts.length === 0) continue;
    notes.push({ route: service.route, direction: service.direction, text: parts.join(' · ') });
  }
  return notes;
}

// ── Estado acumulado entre consultas ────────────────────────────────────────

export type LiveFailure = 'unconfigured' | 'unavailable' | 'unreadable' | 'rate_limited';

export interface LiveArrivalsState {
  /** Último dato que se muestra (puede ser anterior a la última consulta). */
  snapshot: StopInfoSnapshot | null;
  /** Notas por línea; solo desaparecen cuando vuelven las predicciones. */
  notes: ServiceNote[];
  failures: number;
  lastFailure: LiveFailure | null;
  /** Respuestas vacías seguidas que no reemplazaron al dato anterior. */
  ignoredEmpty: number;
}

export const INITIAL_LIVE_STATE: LiveArrivalsState = {
  snapshot: null,
  notes: [],
  failures: 0,
  lastFailure: null,
  ignoredEmpty: 0,
};

function mergeNotes(previous: ServiceNote[], snapshot: StopInfoSnapshot): ServiceNote[] {
  const withArrivals = new Set(snapshot.arrivals.map((a) => a.route));
  const merged = new Map<string, ServiceNote>();
  for (const note of previous) {
    if (!withArrivals.has(note.route)) merged.set(note.route, note);
  }
  for (const note of serviceNotes(snapshot)) merged.set(note.route, note);
  return [...merged.values()];
}

export function applySnapshot(
  state: LiveArrivalsState,
  snapshot: StopInfoSnapshot,
): LiveArrivalsState {
  const previous = state.snapshot;
  // La intermediaria puede servir lo guardado de otra instancia: un dato más
  // viejo que el que ya se muestra no lo pisa.
  if (previous && snapshot.fetchedAt < previous.fetchedAt) {
    return { ...state, failures: 0, lastFailure: null };
  }
  const now = snapshot.fetchedAt;
  const suspiciousEmpty =
    snapshot.arrivals.length === 0 &&
    previous != null &&
    snapshotAge(previous, now) <= SNAPSHOT_MAX_AGE_MS &&
    upcomingArrivals(previous, now).length > 0;
  if (suspiciousEmpty) {
    return { ...state, failures: 0, lastFailure: null, ignoredEmpty: state.ignoredEmpty + 1 };
  }
  return {
    snapshot,
    notes: mergeNotes(state.notes, snapshot),
    failures: 0,
    lastFailure: null,
    ignoredEmpty: 0,
  };
}

export function applyFailure(state: LiveArrivalsState, failure: LiveFailure): LiveArrivalsState {
  return { ...state, failures: state.failures + 1, lastFailure: failure };
}

/** Ritmo de consulta: 30 s; tras una falla, 60 s; tras varias, 5 min. */
export function nextPollDelay(failures: number): number {
  if (failures === 0) return 30_000;
  if (failures < 3) return 60_000;
  return 5 * 60_000;
}

export type LiveViewKind =
  | 'loading'
  | 'live'
  | 'stale'
  | 'no-live-data'
  | 'empty'
  | 'down'
  | 'unconfigured';

export interface LiveView {
  kind: LiveViewKind;
  arrivals: LiveArrival[];
  notes: ServiceNote[];
  alerts: string[];
  ageMs: number | null;
  /** La última consulta falló pero se sigue mostrando un dato reciente. */
  lastFailure: LiveFailure | null;
}

export function liveView(state: LiveArrivalsState, now: number, loading: boolean): LiveView {
  const snapshot = state.snapshot;
  const usable = snapshot != null && snapshotAge(snapshot, now) <= SNAPSHOT_MAX_AGE_MS;
  const failed: LiveViewKind | null = state.lastFailure
    ? state.lastFailure === 'unconfigured'
      ? 'unconfigured'
      : 'down'
    : null;
  const none = { arrivals: [], notes: [], alerts: [], ageMs: null, lastFailure: state.lastFailure };

  if (usable) {
    const base = {
      notes: state.notes,
      alerts: snapshot.alerts,
      ageMs: snapshotAge(snapshot, now),
      lastFailure: state.lastFailure,
    };
    const arrivals = upcomingArrivals(snapshot, now);
    if (arrivals.length > 0) {
      const kind = base.ageMs > STALE_AFTER_MS ? 'stale' : 'live';
      return { ...base, kind, arrivals };
    }
    // Las micros del último dato ya pasaron y la consulta siguiente falló: no
    // se sabe si vienen otras, así que no se dice "sin micros".
    if (failed && snapshot.arrivals.length > 0) return { ...none, kind: failed };
    if (state.notes.some((n) => n.text.includes('sin datos en vivo'))) {
      return { ...base, kind: 'no-live-data', arrivals: [] };
    }
    return { ...base, kind: 'empty', arrivals: [] };
  }
  if (failed) return { ...none, kind: failed };
  // Sin dato vigente: el último venció (pestaña oculta, equipo suspendido) o
  // todavía no llega. No es "sin micros": se espera la próxima consulta.
  if (snapshot || loading) return { ...none, kind: 'loading' };
  return { ...none, kind: 'empty' };
}

/**
 * Micros que se dibujan en el mapa: solo las que la fuente da con GPS y
 * posición, y solo mientras el bloque de llegadas las muestra (en vivo o con
 * el dato viejo destacado). Fuera de eso no hay marcador.
 */
export function gpsArrivals(view: LiveView): Array<LiveArrival & { position: { lat: number; lng: number } }> {
  if (view.kind !== 'live' && view.kind !== 'stale') return [];
  return view.arrivals.flatMap((arrival) =>
    arrival.realtime && arrival.position ? [{ ...arrival, position: arrival.position }] : [],
  );
}

// ── Calce con los datos del visor ───────────────────────────────────────────

/**
 * Paraderos que la fuente renombró como "parada ficticia" (PF): mismo nombre
 * y a menos de 40 m del GTFS de DTPR, según la tabla de la fuente del
 * 21-nov-2026.
 */
const STOP_CODE_RENAMED: Record<string, string> = {
  '38812': 'PF-00003',
  '39592': 'PF-00004',
  '40350': 'PF40350',
  '40545': 'PF40545',
  '42890': 'PF42890',
  '42898': 'PF42898',
};

/**
 * stopCode de la fuente para un paradero del visor: "P" + stop_id del GTFS de
 * DTPR ("37520" → "P37520", "PV42001" → "PPV42001"). Así calzan 2.202 de los
 * 2.239 paraderos del GTFS; 6 más con `STOP_CODE_RENAMED` y 31 no existen en
 * la fuente. Fuera del GTFS (estaciones del Biotrén) no hay código.
 */
export function liveStopCode(stopId: string): string | null {
  const match = /^gtfs-stop-([A-Za-z0-9-]+)$/.exec(stopId);
  if (!match) return null;
  return STOP_CODE_RENAMED[match[1]] ?? `P${match[1]}`;
}

/**
 * Líneas del GTFS de DTPR que la fuente en vivo no sigue (Coronel–Lota: sus
 * paraderos existen pero sin recorridos, comprobado el 24-nov-2026).
 */
const NOT_IN_LIVE_SOURCE = new Set(['302', '304']);

/**
 * Nombre en la fuente para un sentido de un recorrido del visor, o null si la
 * fuente no lo sigue. Sigue el orden de las letras del código, que es el que
 * usa la fuente y el que calza con las secuencias de paradas: en "23BS" la B
 * es el sentido 0 ("I") y la S el 1 ("R"). No se usa la variante del letrero
 * del GTFS porque en 02AD, 02KP y 23BS viene cruzada entre sentidos.
 */
export function visorServiceName(
  code: string,
  direction: Pick<RouteDirection, 'directionId'>,
): string | null {
  const base = code.toUpperCase().replace(/[\s-]+/g, '');
  const first = direction.directionId === 0;
  if (NOT_IN_LIVE_SOURCE.has(base)) return null;
  if (SUFFIXED_SERVICE.test(base)) return base + (first ? 'I' : 'R');
  if (/^\d{3}Y$/.test(base)) return base;
  // "02C-Y", "80J-Y": una sola variante con la Y pegada.
  if (/^\d{2}[A-Z]-Y$/i.test(code.trim().replace(/\s+/g, ''))) return base;
  const pair = /^(\d{2})([A-Z])([A-Z])$/.exec(base);
  if (pair) return pair[1] + (first ? pair[2] : pair[3]);
  return /^\d{2}[A-Z]$/.test(base) ? base : null;
}

/**
 * Paradero cuyas líneas (todas las que tienen sentidos) la fuente en vivo no
 * sigue, como los de la 302/304: no se consulta la fuente y la ficha lo dice.
 */
export function onlyUntrackedLines(routes: readonly Pick<Route, 'code' | 'directions'>[]): boolean {
  const withDirections = routes.filter((r) => (r.directions ?? []).length > 0);
  return (
    withDirections.length > 0 &&
    withDirections.every((r) => (r.directions ?? []).every((d) => visorServiceName(r.code, d) == null))
  );
}

export interface LiveServiceMatch {
  route: Route;
  direction: RouteDirection;
}

/** Índice nombre de la fuente → recorrido y sentido del visor. */
export function indexLiveServices(routes: readonly Route[]): Map<string, LiveServiceMatch> {
  const index = new Map<string, LiveServiceMatch>();
  for (const route of routes) {
    for (const direction of route.directions ?? []) {
      const name = visorServiceName(route.code, direction);
      if (name && !index.has(name)) index.set(name, { route, direction });
    }
  }
  return index;
}

/** Código para mostrar: el nombre de la fuente ("20A", "23B") o el de la línea ("401", "201-AU", "02C-Y"). */
export function liveServiceLabel(service: string, match: LiveServiceMatch | undefined): string {
  const lineCode = SUFFIXED_SERVICE.test(service.slice(0, -1)) || (/Y$/.test(service) && /-Y$/i.test(match?.route.code ?? ''));
  if (match && lineCode) {
    return match.route.code;
  }
  return suffixDirection(service) ? service.slice(0, -1) : service;
}

export const DIRECTION_LABEL: Record<LiveDirection, string> = { I: 'ida', R: 'regreso' };
