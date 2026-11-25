// Micros con GPS de las líneas en el mapa, vía /api/route-vehicles
// (intermediaria de la fuente de Transapp; ver api/route-vehicles.ts). Solo
// consulta mientras el modo "GPS en vivo" está prendido (pares no vacíos) y la
// pestaña está visible; al volver a la pestaña consulta en el acto.
//
// Ritmo: cada 30 s; tras una falla, 60 s; tras tres seguidas, 5 min
// (nextPollDelay). Un cambio de líneas espera medio segundo antes de consultar
// para no gastar consultas mientras se prenden varias seguidas. Las reglas
// sobre qué se conserva y qué se dibuja viven en src/realtime/route-vehicles.ts.
//
// Un solo componente debe usar el hook a la vez: el store es uno para la app.

import { useEffect, useSyncExternalStore } from 'react';
import { nextPollDelay } from '@/realtime/live-arrivals';
import {
  INITIAL_ROUTE_VEHICLES_STATE,
  applyRouteVehicles,
  applyRouteVehiclesFailure,
  normalizeGpsPairs,
  readRouteVehiclesResult,
  retainGpsPairs,
  routeVehiclesUrl,
  type RouteVehiclesState,
} from '@/realtime/route-vehicles';

const REQUEST_TIMEOUT_MS = 12_000;
const PAIRS_CHANGE_DELAY_MS = 500;

export interface RouteVehiclesView {
  state: RouteVehiclesState;
  loading: boolean;
}

export interface RouteVehiclesStoreSnapshot {
  /** Pares normalizados unidos por coma; null sin consulta en curso. */
  key: string | null;
  view: RouteVehiclesView;
}

const IDLE_VIEW: RouteVehiclesView = { state: INITIAL_ROUTE_VEHICLES_STATE, loading: false };
const IDLE: RouteVehiclesStoreSnapshot = { key: null, view: IDLE_VIEW };

let snapshot: RouteVehiclesStoreSnapshot = IDLE;
let timer: number | null = null;
let pendingStop: number | null = null;
let inFlight: AbortController | null = null;
let waitingForVisible = false;
const listeners = new Set<() => void>();

function setSnapshot(next: RouteVehiclesStoreSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Estado del store (lo usan el hook y las pruebas). */
export function getRouteVehiclesSnapshot(): RouteVehiclesStoreSnapshot {
  return snapshot;
}

async function loadOnce(pairs: string[], signal: AbortSignal): Promise<RouteVehiclesState> {
  const current = snapshot.view.state;
  let res: Response;
  try {
    res = await fetch(routeVehiclesUrl(pairs), { signal });
  } catch (err) {
    if (signal.aborted && !(err instanceof DOMException && err.name === 'TimeoutError')) throw err;
    return applyRouteVehiclesFailure(current, 'unavailable', Date.now());
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  const receivedAt = Date.now();
  const result = readRouteVehiclesResult(res.status, body, receivedAt);
  return result.ok
    ? applyRouteVehicles(current, result.response, pairs, receivedAt)
    : applyRouteVehiclesFailure(current, result.failure, Date.now());
}

function clearTimer(): void {
  if (timer != null) window.clearTimeout(timer);
  timer = null;
}

function schedule(key: string, delay: number): void {
  clearTimer();
  timer = window.setTimeout(() => {
    timer = null;
    void poll(key);
  }, delay);
}

async function poll(key: string): Promise<void> {
  if (snapshot.key !== key) return;
  if (document.hidden) {
    waitingForVisible = true;
    return;
  }
  const pairs = key.split(',');
  const ctrl = new AbortController();
  inFlight = ctrl;
  const timeout = window.setTimeout(() => ctrl.abort(new DOMException('timeout', 'TimeoutError')), REQUEST_TIMEOUT_MS);
  setSnapshot({ key, view: { ...snapshot.view, loading: true } });
  try {
    const next = await loadOnce(pairs, ctrl.signal);
    if (snapshot.key !== key) return;
    setSnapshot({ key, view: { state: next, loading: false } });
    schedule(key, nextPollDelay(next.failures));
  } catch {
    // Abortado porque cambiaron las líneas o se apagó el modo: el dueño es otro.
  } finally {
    window.clearTimeout(timeout);
    if (inFlight === ctrl) inFlight = null;
  }
}

function onVisibilityChange(): void {
  if (document.hidden || !waitingForVisible || !snapshot.key) return;
  waitingForVisible = false;
  void poll(snapshot.key);
}

function stop(): void {
  pendingStop = null;
  clearTimer();
  inFlight?.abort();
  inFlight = null;
  waitingForVisible = false;
  document.removeEventListener('visibilitychange', onVisibilityChange);
  setSnapshot(IDLE);
}

/**
 * Empieza a consultar `key` (pares normalizados unidos por coma) o cambia a
 * él conservando el dato de los pares que siguen, y devuelve cómo dejar de
 * hacerlo. El fin se aplaza un instante: si las líneas cambian, el efecto
 * siguiente lo cancela y no se pierde lo ya mostrado (tampoco se consulta dos
 * veces con el doble efecto de StrictMode).
 */
export function watchRouteVehicles(key: string): () => void {
  if (pendingStop != null) window.clearTimeout(pendingStop);
  pendingStop = null;
  if (snapshot.key !== key) {
    const previous = snapshot.key;
    clearTimer();
    inFlight?.abort();
    inFlight = null;
    waitingForVisible = false;
    document.addEventListener('visibilitychange', onVisibilityChange);
    const pairs = key.split(',');
    const state = previous ? retainGpsPairs(snapshot.view.state, pairs) : INITIAL_ROUTE_VEHICLES_STATE;
    setSnapshot({ key, view: { state, loading: true } });
    if (previous) schedule(key, PAIRS_CHANGE_DELAY_MS);
    else void poll(key);
  }
  return () => {
    pendingStop = window.setTimeout(stop, 0);
  };
}

export function useRouteVehicles(pairs: string[] | null): RouteVehiclesView {
  const current = useSyncExternalStore(subscribe, getRouteVehiclesSnapshot, getRouteVehiclesSnapshot);
  const key = pairs ? normalizeGpsPairs(pairs).join(',') : '';

  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect -- El fetch vive en el store externo (watchRouteVehicles → poll) con AbortController, timeout y ritmo variable; el proyecto no usa librería de data fetching.
  useEffect(() => {
    if (!key) return;
    return watchRouteVehicles(key);
  }, [key]);

  if (!key || !current.key) return IDLE_VIEW;
  if (current.key === key) return current.view;
  // Cambiaron las líneas y el efecto todavía no corre: lo de los pares que
  // siguen se muestra igual, para que sus micros no parpadeen.
  return { state: retainGpsPairs(current.view.state, key.split(',')), loading: true };
}
