import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ROUTES, ROUTES_BY_ID } from '@/data/routes';
import { findRoutes } from '@/lib/planner';
import { routeBetween, type RoutingResult } from '@/lib/routing';
import type { Route } from '@/types/transport';

type PlannerPoint = { lat: number; lng: number };
type PickerMode = 'origin' | 'destination' | null;

interface Options {
  visibleRouteIds: string[];
  routesVersion: number;
}

export function usePlannerState({ visibleRouteIds, routesVersion }: Options) {
  const [plannerOrigin, setPlannerOrigin] = useState<PlannerPoint | null>(null);
  const [plannerDestination, setPlannerDestination] = useState<PlannerPoint | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [plannerMidpoint, setPlannerMidpoint] = useState<RoutingResult | null>(null);
  const [plannerMidpointLoading, setPlannerMidpointLoading] = useState(false);
  const [plannerMidpointError, setPlannerMidpointError] = useState<string | null>(null);
  const midpointAbortRef = useRef<AbortController | null>(null);

  const plannerMatches = useMemo(() => {
    if (!plannerOrigin || !plannerDestination) return [];
    const visible: Route[] = [];
    for (const id of visibleRouteIds) {
      const route = ROUTES_BY_ID.get(id);
      if (route) visible.push(route);
    }
    const pool = visible.length > 0 ? visible : ROUTES;
    return findRoutes(
      [plannerOrigin.lat, plannerOrigin.lng],
      [plannerDestination.lat, plannerDestination.lng],
      pool,
    );
  }, [plannerOrigin, plannerDestination, visibleRouteIds, routesVersion]);

  const clearMidpointState = useCallback(() => {
    midpointAbortRef.current?.abort();
    midpointAbortRef.current = null;
    setPlannerMidpoint(null);
    setPlannerMidpointLoading(false);
    setPlannerMidpointError(null);
  }, []);

  const onPickPoint = useCallback(
    (latlng: PlannerPoint) => {
      if (pickerMode === 'origin') {
        setPlannerOrigin(latlng);
        setPickerMode(plannerDestination ? null : 'destination');
      } else if (pickerMode === 'destination') {
        setPlannerDestination(latlng);
        setPickerMode(null);
      }
    },
    [pickerMode, plannerDestination],
  );

  const onClearPlanner = useCallback(() => {
    setPlannerOrigin(null);
    setPlannerDestination(null);
    setPickerMode(null);
    clearMidpointState();
  }, [clearMidpointState]);

  useEffect(() => {
    clearMidpointState();
  }, [plannerOrigin, plannerDestination, clearMidpointState]);

  const onComputeMidpoint = useCallback(async () => {
    if (!plannerOrigin || !plannerDestination) return;
    midpointAbortRef.current?.abort();
    const ctrl = new AbortController();
    midpointAbortRef.current = ctrl;
    setPlannerMidpointLoading(true);
    setPlannerMidpointError(null);
    try {
      const result = await routeBetween(
        [plannerOrigin.lat, plannerOrigin.lng],
        [plannerDestination.lat, plannerDestination.lng],
        { signal: ctrl.signal },
      );
      if (ctrl.signal.aborted) return;
      setPlannerMidpoint(result);
      setPlannerMidpointLoading(false);
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setPlannerMidpointLoading(false);
      setPlannerMidpointError(
        err instanceof Error
          ? `No se pudo calcular: ${err.message}`
          : 'No se pudo calcular el trazado',
      );
    }
  }, [plannerOrigin, plannerDestination]);

  const onUsePointAsOrigin = useCallback(
    (point: PlannerPoint) => {
      setPlannerOrigin(point);
      setPickerMode(plannerDestination ? null : 'destination');
    },
    [plannerDestination],
  );

  const onUsePointAsDestination = useCallback(
    (point: PlannerPoint) => {
      setPlannerDestination(point);
      setPickerMode(plannerOrigin ? null : 'origin');
    },
    [plannerOrigin],
  );

  return {
    plannerOrigin,
    plannerDestination,
    pickerMode,
    setPickerMode,
    plannerMatches,
    plannerMidpoint,
    plannerMidpointLoading,
    plannerMidpointError,
    onPickPoint,
    onClearPlanner,
    onComputeMidpoint,
    clearMidpointState,
    onUsePointAsOrigin,
    onUsePointAsDestination,
  };
}
