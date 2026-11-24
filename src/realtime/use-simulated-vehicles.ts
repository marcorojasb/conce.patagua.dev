// Store de la capa "Servicios en curso" (vehículos estimados desde horarios).
//
// Antes era un useState dentro de App: cada tick (1 s) re-renderizaba toda la
// app —barra lateral con 175 recorridos incluida— y react-leaflet reemplazaba
// el DOM de cada marcador, lo que además cortaba la transición CSS que los
// hace avanzar suave. Ahora el tick vive fuera de React:
// - la capa del mapa se suscribe con `subscribeSimulatedVehicles` y mueve
//   marcadores existentes (setLatLng), sin pasar por React;
// - quien solo necesita el conteo usa `useSimulationStatus`, que cambia
//   únicamente cuando entra o sale un viaje.
//
// El chunk de horarios GTFS (~cientos de KB, por sentido) se carga recién la
// primera vez que la capa se enciende; los de Biotrén (EFE) son chicos y ya
// vienen con el bundle principal.

import { useEffect, useSyncExternalStore } from 'react';
import { computeActiveVehicles, type SimulationRouteInput } from '@/realtime/simulated-vehicles';
import { STATIC_ROUTE_SCHEDULES } from '@/realtime/static-service-schedules';
import type { RouteSchedule, SimulatedVehicle } from '@/types/transport';

const TICK_MS = 1000;

export interface SimulationStatus {
  loading: boolean;
  error: string | null;
  count: number;
  nonGtfsCount: number;
}

const IDLE_STATUS: SimulationStatus = { loading: false, error: null, count: 0, nonGtfsCount: 0 };

let vehicles: SimulatedVehicle[] = [];
let status = IDLE_STATUS;
let schedules: Record<string, RouteSchedule> | null = null;
let schedulePromise: Promise<Record<string, RouteSchedule>> | null = null;
const vehicleListeners = new Set<(vehicles: SimulatedVehicle[]) => void>();
const statusListeners = new Set<() => void>();

/** Horarios por clave de simulación (`<routeId>#<directionId>` o id de patrón). */
export function loadSimulationSchedules(): Promise<Record<string, RouteSchedule>> {
  schedulePromise ??= import('@/data/gtfs-schedule.generated').then((gtfs) => ({
    ...gtfs.ROUTE_DIRECTION_SCHEDULES,
    ...STATIC_ROUTE_SCHEDULES,
  }));
  return schedulePromise;
}

function setStatus(next: SimulationStatus): void {
  if (
    next.loading === status.loading &&
    next.error === status.error &&
    next.count === status.count &&
    next.nonGtfsCount === status.nonGtfsCount
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
  for (const v of next) if (v.sourceKind !== 'gtfs') nonGtfsCount += 1;
  setStatus({ loading: false, error: null, count: next.length, nonGtfsCount });
}

/** La capa del mapa recibe cada tick sin pasar por React. */
export function subscribeSimulatedVehicles(listener: (vehicles: SimulatedVehicle[]) => void): () => void {
  vehicleListeners.add(listener);
  listener(vehicles);
  return () => {
    vehicleListeners.delete(listener);
  };
}

/** Lectura puntual (p. ej. al generar un fondo de pantalla). */
export function getSimulatedVehicles(): SimulatedVehicle[] {
  return vehicles;
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

/** Enciende/apaga la simulación para el conjunto de rutas dado. Lo usa App, una vez. */
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

    if (!schedules) setStatus({ ...status, loading: true, error: null });
    loadSimulationSchedules()
      .then((loaded) => {
        if (cancelled) return;
        schedules = loaded;
        tick();
        timer = window.setInterval(tick, TICK_MS);
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
      if (timer != null) window.clearInterval(timer);
    };
  }, [enabled, routes, retryKey]);
}
