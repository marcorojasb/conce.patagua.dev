// Store de las micros estimadas desde horarios (modo "Horario" del mapa).
//
// Antes era un useState dentro de App: cada tick (1 s) re-renderizaba toda la
// app —barra lateral con 175 recorridos incluida—. Ahora el tick vive fuera
// de React:
// - el mapa se suscribe a través de `scheduleVehicleFeed`
//   (schedule-vehicle-feed.ts), que las pasa a MapVehicle, y las dibuja en su
//   canvas de micros sin pasar por React;
// - quien solo necesita el conteo usa `useSimulationStatus`, que cambia
//   únicamente cuando entra o sale un viaje.
//
// El chunk de horarios GTFS (~cientos de KB, por sentido) se carga recién la
// primera vez que la capa se enciende; los de Biotrén (EFE) son chicos y ya
// vienen con el bundle principal. El GTFS es un programa a intervalo fijo que
// pide más micros que buses: en las líneas con flota conocida
// (src/data/fleets.ts) sus salidas se ralean hasta caber, y la 201 usa de
// lunes a viernes la lista del operador (ver src/realtime/schedule-index.ts).

import { useEffect, useSyncExternalStore } from 'react';
import { URBAN_PERIMETER_FLEET } from '@/data/fleets';
import { ROUTES_BY_ID } from '@/data/routes';
import { capToKnownFleets, loadScheduleIndex } from '@/realtime/schedule-index';
import { computeActiveVehicles, type SimulationRouteInput } from '@/realtime/simulated-vehicles';
import type { RouteSchedule, SimulatedVehicle } from '@/types/transport';

const TICK_MS = 1000;

export interface SimulationStatus {
  loading: boolean;
  error: string | null;
  count: number;
  nonGtfsCount: number;
  /** Micros urbanas (red del perímetro): se comparan con su flota inscrita. */
  urbanCount: number;
}

const IDLE_STATUS: SimulationStatus = { loading: false, error: null, count: 0, nonGtfsCount: 0, urbanCount: 0 };

let vehicles: SimulatedVehicle[] = [];
let status = IDLE_STATUS;
let schedules: Record<string, RouteSchedule> | null = null;
let schedulePromise: Promise<Record<string, RouteSchedule>> | null = null;
const vehicleListeners = new Set<(vehicles: SimulatedVehicle[]) => void>();
const statusListeners = new Set<() => void>();

/**
 * Horarios por clave de simulación (`<routeId>#<directionId>` o id de patrón),
 * raleados según la flota donde se conoce.
 */
export function loadSimulationSchedules(): Promise<Record<string, RouteSchedule>> {
  schedulePromise ??= loadScheduleIndex().then((index) => capToKnownFleets(index));
  return schedulePromise;
}

function setStatus(next: SimulationStatus): void {
  if (
    next.loading === status.loading &&
    next.error === status.error &&
    next.count === status.count &&
    next.nonGtfsCount === status.nonGtfsCount &&
    next.urbanCount === status.urbanCount
  ) {
    return;
  }
  status = next;
  for (const listener of statusListeners) listener();
}

function publish(next: SimulatedVehicle[]): void {
  vehicles = next;
  for (const listener of vehicleListeners) listener(next);
  let nonGtfsCount = 0;
  let urbanCount = 0;
  for (const v of next) {
    if (v.sourceKind !== 'gtfs') nonGtfsCount += 1;
    else if (ROUTES_BY_ID.get(v.routeId)?.network === URBAN_PERIMETER_FLEET.network) urbanCount += 1;
  }
  setStatus({ loading: false, error: null, count: next.length, nonGtfsCount, urbanCount });
}

/** La capa del mapa recibe cada tick sin pasar por React. */
export function subscribeSimulatedVehicles(listener: (vehicles: SimulatedVehicle[]) => void): () => void {
  vehicleListeners.add(listener);
  listener(vehicles);
  return () => {
    vehicleListeners.delete(listener);
  };
}

function subscribeStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

function getStatus(): SimulationStatus {
  return status;
}

export function useSimulationStatus(): SimulationStatus {
  return useSyncExternalStore(subscribeStatus, getStatus, getStatus);
}

interface Options {
  enabled: boolean;
  routes: SimulationRouteInput[];
  retryKey?: number;
}

/**
 * Enciende/apaga la simulación para el conjunto de rutas dado. Lo usa App, una
 * vez. Con la pestaña oculta no calcula: al volver a la vista calcula en el
 * acto y retoma el tic.
 */
export function useSimulationControl({ enabled, routes, retryKey = 0 }: Options): void {
  useEffect(() => {
    if (!enabled) {
      publish([]);
      return;
    }
    let cancelled = false;
    let timer: number | null = null;
    const tick = () => {
      if (schedules) publish(computeActiveVehicles(new Date(), routes, schedules));
    };
    const startTicking = () => {
      if (cancelled || !schedules || timer != null || document.hidden) return;
      tick();
      timer = window.setInterval(tick, TICK_MS);
    };
    const stopTicking = () => {
      if (timer != null) window.clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => (document.hidden ? stopTicking() : startTicking());
    document.addEventListener('visibilitychange', onVisibility);

    if (!schedules) setStatus({ ...status, loading: true, error: null });
    loadSimulationSchedules()
      .then((loaded) => {
        if (cancelled) return;
        schedules = loaded;
        // Oculta al cargar: igual se calcula una vez, así al volver hay micros y conteo.
        if (document.hidden) tick();
        startTicking();
      })
      .catch((err: unknown) => {
        schedulePromise = null;
        if (cancelled) return;
        vehicles = [];
        for (const listener of vehicleListeners) listener(vehicles);
        setStatus({
          ...IDLE_STATUS,
          error: err instanceof Error ? err.message : 'No se pudo cargar el horario',
        });
      });

    return () => {
      cancelled = true;
      stopTicking();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, routes, retryKey]);
}
