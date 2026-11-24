// Llegadas en vivo a un paradero desde la fuente que usa la app de Transapp
// (phone.dtpr.transapp.cl/v7/phone/<id>/stopInfo). No es un feed oficial ni
// documentado: el visor la consulta a través de /api/stop-arrivals (ver
// api/stop-arrivals.ts) y aquí solo se interpreta la respuesta cruda.
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

export type LiveDirection = 'I' | 'R';

export interface LiveArrival {
  route: string;
  direction: LiveDirection | null;
  /** Llegada estimada (ms Unix). */
  arrivalAt: number;
  timeLabel: string | null;
  /** Metros hasta el paradero, según la fuente. */
  distanceM: number | null;
  plate: string | null;
  tripId: string | null;
  position: { lat: number; lng: number } | null;
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
// Campos de posición, patente y viaje: ver `readVehicleFields`.

interface RawPrediction {
  route?: unknown;
  direction?: unknown;
  epochTime?: unknown;
  timeLabel?: unknown;
  distance?: unknown;
  [key: string]: unknown;
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

function readVehicleFields(_raw: RawPrediction): Pick<LiveArrival, 'plate' | 'tripId' | 'position'> {
  return { plate: null, tripId: null, position: null };
}

function parsePrediction(raw: unknown, fetchedAt: number): LiveArrival | null {
  if (!isRecord(raw)) return null;
  const p = raw as RawPrediction;
  const route = nonEmptyString(p.route);
  if (!route) return null;
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
    direction: parseDirection(p.direction),
    arrivalAt,
    timeLabel,
    distanceM: distance != null && distance >= 0 ? distance : null,
    ...readVehicleFields(p),
  };
}

/** "201I" → { route: "201", direction: "I" }. El sentido viene pegado al final. */
export function splitServicio(servicio: string): { route: string; direction: LiveDirection | null } {
  const last = servicio.slice(-1);
  if (servicio.length > 1 && (last === 'I' || last === 'R')) {
    return { route: servicio.slice(0, -1), direction: last };
  }
  return { route: servicio, direction: null };
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
      routeInfo.push({ ...splitServicio(servicio), msg: nonEmptyString(info.msg) });
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

export function serviceKey(route: string, direction: LiveDirection | null): string {
  return `${route}|${direction ?? ''}`;
}

/** Servicios con la alerta "Servicio X (Ida|Regreso) … tiempo real". */
export function servicesWithoutGps(alerts: string[]): Set<string> {
  const out = new Set<string>();
  for (const alert of alerts) {
    if (!/tiempo real/i.test(alert)) continue;
    for (const match of alert.matchAll(/Servicio\s+([0-9A-Za-z]+)\s*\((Ida|Regreso|Vuelta|Retorno)\)/gi)) {
      const direction: LiveDirection = /^ida$/i.test(match[2]) ? 'I' : 'R';
      out.add(serviceKey(match[1], direction));
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
  const withArrivals = new Set(snapshot.arrivals.map((a) => serviceKey(a.route, a.direction)));
  const noGps = servicesWithoutGps(snapshot.alerts);
  const services = new Map<string, { route: string; direction: LiveDirection | null; msg: string | null }>();
  for (const info of snapshot.routeInfo) {
    services.set(serviceKey(info.route, info.direction), info);
  }
  for (const key of noGps) {
    if (services.has(key)) continue;
    const [route, direction] = key.split('|');
    services.set(key, { route, direction: parseDirection(direction), msg: null });
  }

  const notes: ServiceNote[] = [];
  for (const [key, service] of services) {
    if (withArrivals.has(key)) continue;
    const parts: string[] = [];
    if (noGps.has(key)) parts.push('sin datos en vivo');
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
  const withArrivals = new Set(snapshot.arrivals.map((a) => serviceKey(a.route, a.direction)));
  const merged = new Map<string, ServiceNote>();
  for (const note of previous) {
    const key = serviceKey(note.route, note.direction);
    if (!withArrivals.has(key)) merged.set(key, note);
  }
  for (const note of serviceNotes(snapshot)) {
    merged.set(serviceKey(note.route, note.direction), note);
  }
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
  const base = {
    notes: state.notes,
    alerts: usable ? snapshot.alerts : [],
    ageMs: usable ? snapshotAge(snapshot, now) : null,
    lastFailure: state.lastFailure,
  };

  if (usable) {
    const arrivals = upcomingArrivals(snapshot, now);
    if (arrivals.length > 0) {
      const kind = snapshotAge(snapshot, now) > STALE_AFTER_MS ? 'stale' : 'live';
      return { ...base, kind, arrivals };
    }
  }
  if (state.lastFailure && !usable) {
    return {
      ...base,
      kind: state.lastFailure === 'unconfigured' ? 'unconfigured' : 'down',
      arrivals: [],
    };
  }
  if (!snapshot) return { ...base, kind: loading ? 'loading' : 'empty', arrivals: [] };
  if (state.notes.some((n) => n.text.includes('sin datos en vivo'))) {
    return { ...base, kind: 'no-live-data', arrivals: [] };
  }
  return { ...base, kind: 'empty', arrivals: [] };
}

// ── Calce con los datos del visor ───────────────────────────────────────────

/**
 * stopCode de la fuente para un paradero del visor. Los paraderos GTFS del
 * visor no traen stop_code (viene vacío en el feed), así que se usa el stop_id.
 * Los paraderos interurbanos digitalizados desde OSM no tienen código.
 */
export function liveStopCode(stopId: string): string | null {
  const match = /^gtfs-stop-(\d+)$/.exec(stopId);
  return match ? match[1] : null;
}

/** "02A" y "2A", "17 O" y "17O" se comparan igual. */
export function normalizeRouteCode(code: string): string {
  return code.toUpperCase().replace(/\s+/g, '').replace(/^0+(?=[0-9A-Z])/, '');
}

export const DIRECTION_LABEL: Record<LiveDirection, string> = { I: 'ida', R: 'regreso' };
