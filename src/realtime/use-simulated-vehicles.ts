// React hook that returns the set of simulated vehicles currently in transit.
//
// Lazy-loads the schedule chunk (~hundreds of KB) only the first time the
// caller enables the layer, so the initial app bundle isn't paying for a
// feature that the user might never turn on.

import { useEffect, useRef, useState } from 'react';
import { computeActiveVehicles } from '@/realtime/simulated-vehicles';
import type {
  LatLngTuple,
  RouteSchedule,
  SimulatedVehicle,
} from '@/types/transport';

interface RouteInput {
  id: string;
  color: string;
  path: LatLngTuple[];
}

interface Options {
  enabled: boolean;
  routes: RouteInput[];
  /** Recompute interval in milliseconds. Default 8 s. */
  intervalMs?: number;
}

interface State {
  loading: boolean;
  error: string | null;
  vehicles: SimulatedVehicle[];
  lastUpdate: Date | null;
}

let schedulePromise: Promise<Record<string, RouteSchedule>> | null = null;
function loadSchedule(): Promise<Record<string, RouteSchedule>> {
  schedulePromise ??= import('@/data/gtfs-schedule.generated').then(
    (mod) => mod.ROUTE_SCHEDULES,
  );
  return schedulePromise;
}

export function useSimulatedVehicles({
  enabled,
  routes,
  intervalMs = 8000,
}: Options): State {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    vehicles: [],
    lastUpdate: null,
  });
  const schedulesRef = useRef<Record<string, RouteSchedule> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: number | null = null;

    const tick = () => {
      const schedules = schedulesRef.current;
      if (!schedules) return;
      const vehicles = computeActiveVehicles(new Date(), routes, schedules);
      if (!cancelled) {
        setState((s) => ({ ...s, vehicles, lastUpdate: new Date() }));
      }
    };

    const start = async () => {
      setState((s) => ({ ...s, loading: schedulesRef.current === null }));
      try {
        if (!schedulesRef.current) {
          schedulesRef.current = await loadSchedule();
        }
        if (cancelled) return;
        tick();
        timer = window.setInterval(tick, intervalMs);
        setState((s) => ({ ...s, loading: false, error: null }));
      } catch (err) {
        if (cancelled) return;
        setState({
          loading: false,
          error: err instanceof Error ? err.message : 'No se pudo cargar el horario',
          vehicles: [],
          lastUpdate: null,
        });
      }
    };

    void start();
    return () => {
      cancelled = true;
      if (timer != null) window.clearInterval(timer);
    };
    // `routes` reference changes each render; we intentionally only restart
    // when enabled or interval changes. Schedule recomputation per tick reads
    // current routes through the closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs]);

  // When disabled, clear stale vehicles so the map repaints empty.
  useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, vehicles: [], lastUpdate: null }));
    }
  }, [enabled]);

  return state;
}
