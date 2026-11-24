// Llegadas en vivo al paradero abierto, vía /api/stop-arrivals (intermediaria
// de la fuente de Transapp; ver api/stop-arrivals.ts). Solo se consulta un
// paradero a la vez —el que está abierto— y solo con la pestaña visible.
//
// Ritmo: cada 30 s; tras una falla, 60 s; tras tres seguidas, 5 min. Las
// reglas sobre qué se muestra (respuesta vacía dudosa, edad del dato, notas
// "sin datos en vivo") viven en src/realtime/live-arrivals.ts.

import { useEffect, useSyncExternalStore } from 'react';
import {
  INITIAL_LIVE_STATE,
  applyFailure,
  applySnapshot,
  nextPollDelay,
  parseStopInfo,
  type LiveArrivalsState,
  type LiveFailure,
} from '@/realtime/live-arrivals';

const ENDPOINT = '/api/stop-arrivals';
const REQUEST_TIMEOUT_MS = 12_000;
const HIDDEN_RECHECK_MS = 30_000;

interface StopArrivalsResponse {
  fetchedAt?: unknown;
  data?: unknown;
  error?: unknown;
}

export interface LiveArrivalsSnapshot {
  stopCode: string | null;
  state: LiveArrivalsState;
  loading: boolean;
}

const IDLE: LiveArrivalsSnapshot = { stopCode: null, state: INITIAL_LIVE_STATE, loading: false };

let snapshot = IDLE;
let timer: number | null = null;
let inFlight: AbortController | null = null;
const listeners = new Set<() => void>();

function setSnapshot(next: LiveArrivalsSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): LiveArrivalsSnapshot {
  return snapshot;
}

function failureFrom(status: number, body: StopArrivalsResponse | null): LiveFailure {
  if (body?.error === 'unconfigured') return 'unconfigured';
  if (status === 429 || body?.error === 'rate_limited') return 'rate_limited';
  return 'unavailable';
}

async function loadOnce(stopCode: string, signal: AbortSignal): Promise<LiveArrivalsState> {
  const current = snapshot.state;
  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?stop=${encodeURIComponent(stopCode)}`, { signal });
  } catch (err) {
    if (signal.aborted && !(err instanceof DOMException && err.name === 'TimeoutError')) throw err;
    return applyFailure(current, 'unavailable');
  }
  let body: StopArrivalsResponse | null = null;
  try {
    body = (await res.json()) as StopArrivalsResponse;
  } catch {
    body = null;
  }
  if (!res.ok) return applyFailure(current, failureFrom(res.status, body));
  if (!body || typeof body.fetchedAt !== 'number') return applyFailure(current, 'unreadable');
  const parsed = parseStopInfo(body.data, body.fetchedAt);
  return parsed.ok ? applySnapshot(current, parsed.snapshot) : applyFailure(current, 'unreadable');
}

function clearTimer(): void {
  if (timer != null) window.clearTimeout(timer);
  timer = null;
}

function stop(): void {
  clearTimer();
  inFlight?.abort();
  inFlight = null;
  setSnapshot(IDLE);
}

async function poll(stopCode: string): Promise<void> {
  if (snapshot.stopCode !== stopCode) return;
  if (document.hidden) {
    timer = window.setTimeout(() => void poll(stopCode), HIDDEN_RECHECK_MS);
    return;
  }
  const ctrl = new AbortController();
  inFlight = ctrl;
  const timeout = window.setTimeout(() => ctrl.abort(new DOMException('timeout', 'TimeoutError')), REQUEST_TIMEOUT_MS);
  setSnapshot({ ...snapshot, loading: true });
  try {
    const next = await loadOnce(stopCode, ctrl.signal);
    if (snapshot.stopCode !== stopCode) return;
    setSnapshot({ stopCode, state: next, loading: false });
    timer = window.setTimeout(() => void poll(stopCode), nextPollDelay(next.failures));
  } catch {
    // Abortado porque se cerró o cambió el paradero: el dueño es otro.
  } finally {
    window.clearTimeout(timeout);
    if (inFlight === ctrl) inFlight = null;
  }
}

function start(stopCode: string): void {
  clearTimer();
  inFlight?.abort();
  inFlight = null;
  setSnapshot({ stopCode, state: INITIAL_LIVE_STATE, loading: true });
  void poll(stopCode);
}

export function useLiveArrivals(stopCode: string | null): LiveArrivalsSnapshot {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect -- El fetch vive en el store externo (start → poll) con AbortController, timeout y ritmo variable; el proyecto no usa librería de data fetching.
  useEffect(() => {
    if (!stopCode) return;
    start(stopCode);
    return stop;
  }, [stopCode]);

  return current.stopCode === stopCode ? current : IDLE;
}
