// Planificador: A y B viven en las preferencias (URL `a=`/`b=`, replace) y
// elegir un punto es la capa transitoria `pick-a`/`pick-b` sobre el panel, así
// cerrar el planificador o volver con Atrás termina la elección sin dejar el
// mapa "pegado" capturando toques. El trazado por calles (punto medio) es
// estado local y se descarta solo si cambian A o B.

import { useCallback, useMemo, useRef, useState } from 'react';
import { ROUTES, ROUTES_BY_ID } from '@/data/routes';
import {
  closeOverlay,
  getNavState,
  openOverlay,
  openPanel,
  setPrefs,
} from '@/hooks/use-view-state';
import { findRoutes } from '@/lib/planner';
import { routeBetween, type RoutingResult } from '@/lib/routing';
import { pickStep } from '@/lib/view-state';
import type { Route } from '@/types/transport';
import type { LatLng, Overlay, PlannerPanelProps } from '@/types/ui-contracts';

interface Options {
  a: LatLng | null;
  b: LatLng | null;
  overlay: Overlay;
  /** Líneas en el mapa (ya con el filtro de horario): donde se buscan coincidencias. */
  networkIds: readonly string[];
  routesVersion: number;
  onSelectRoute: (id: string) => void;
}

interface MidpointState {
  key: string;
  result: RoutingResult | null;
  loading: boolean;
  error: string | null;
}

function pointsKey(a: LatLng | null, b: LatLng | null): string | null {
  return a && b ? `${a.lat},${a.lng};${b.lat},${b.lng}` : null;
}

export interface PlannerState {
  panel: PlannerPanelProps;
  pick: 'a' | 'b' | null;
  midpoint: RoutingResult | null;
  /** Toque en el mapa eligiendo un punto. */
  onMapPick: (point: LatLng) => void;
  /** "Salir desde aquí": A en el paradero, abre el planificador y pide B si falta. */
  onPlanFrom: (point: LatLng) => void;
  /** "Ir hasta aquí": lo mismo con B. */
  onPlanTo: (point: LatLng) => void;
}

export function usePlannerState({ a, b, overlay, networkIds, routesVersion, onSelectRoute }: Options): PlannerState {
  const [searchAll, setSearchAll] = useState(false);
  const [midpointState, setMidpointState] = useState<MidpointState | null>(null);
  const midpointAbortRef = useRef<AbortController | null>(null);
  const key = pointsKey(a, b);
  const midpoint = midpointState && midpointState.key === key ? midpointState : null;
  const pick = overlay === 'pick-a' ? 'a' : overlay === 'pick-b' ? 'b' : null;

  const matches = useMemo(() => {
    if (!a || !b) return [];
    // ROUTES crece al llegar el chunk GTFS: routesVersion invalida el cálculo.
    void routesVersion;
    const pool: Route[] = [];
    if (searchAll) pool.push(...ROUTES);
    else {
      for (const id of networkIds) {
        const route = ROUTES_BY_ID.get(id);
        if (route) pool.push(route);
      }
    }
    return findRoutes([a.lat, a.lng], [b.lat, b.lng], pool);
  }, [a, b, searchAll, networkIds, routesVersion]);

  const abortMidpoint = useCallback(() => {
    midpointAbortRef.current?.abort();
    midpointAbortRef.current = null;
  }, []);

  const onClearMidpoint = useCallback(() => {
    abortMidpoint();
    setMidpointState(null);
  }, [abortMidpoint]);

  const onComputeMidpoint = useCallback(async () => {
    if (!a || !b || !key) return;
    abortMidpoint();
    const ctrl = new AbortController();
    midpointAbortRef.current = ctrl;
    setMidpointState({ key, result: null, loading: true, error: null });
    try {
      const result = await routeBetween([a.lat, a.lng], [b.lat, b.lng], { signal: ctrl.signal });
      if (!ctrl.signal.aborted) setMidpointState({ key, result, loading: false, error: null });
    } catch (err) {
      if (!ctrl.signal.aborted) {
        setMidpointState({
          key,
          result: null,
          loading: false,
          error: err instanceof Error ? `No se pudo calcular: ${err.message}` : 'No se pudo calcular el trazado',
        });
      }
    }
  }, [a, b, key, abortMidpoint]);

  const onPick = useCallback((target: 'a' | 'b') => {
    openOverlay(target === 'a' ? 'pick-a' : 'pick-b');
  }, []);

  const onCancelPick = useCallback(() => {
    const current = getNavState().overlay;
    if (current === 'pick-a' || current === 'pick-b') closeOverlay();
  }, []);

  const onClear = useCallback(() => {
    abortMidpoint();
    setPrefs({ planner: { a: null, b: null } });
    const current = getNavState().overlay;
    if (current === 'pick-a' || current === 'pick-b') closeOverlay();
  }, [abortMidpoint]);

  const onMapPick = useCallback(
    (point: LatLng) => {
      const { overlay: current, prefs } = getNavState();
      if (current !== 'pick-a' && current !== 'pick-b') return;
      abortMidpoint();
      const step = pickStep(current, point, prefs.planner);
      setPrefs({ planner: step.planner });
      if (step.done) closeOverlay();
      else if (step.overlay) openOverlay(step.overlay);
    },
    [abortMidpoint],
  );

  const planWith = useCallback(
    (target: 'a' | 'b', point: LatLng) => {
      abortMidpoint();
      const { planner } = getNavState().prefs;
      const next = target === 'a' ? { ...planner, a: point } : { ...planner, b: point };
      setPrefs({ planner: next });
      openPanel('planner');
      if (target === 'a' && !next.b) openOverlay('pick-b');
      if (target === 'b' && !next.a) openOverlay('pick-a');
    },
    [abortMidpoint],
  );
  const onPlanFrom = useCallback((point: LatLng) => planWith('a', point), [planWith]);
  const onPlanTo = useCallback((point: LatLng) => planWith('b', point), [planWith]);

  const panel = useMemo<PlannerPanelProps>(
    () => ({
      a,
      b,
      pick,
      matches,
      searchAll,
      onSearchAllChange: setSearchAll,
      linesOnMap: networkIds.length,
      onPick,
      onCancelPick,
      onClear,
      onSelectRoute,
      midpoint: midpoint?.result ?? null,
      midpointLoading: midpoint?.loading ?? false,
      midpointError: midpoint?.error ?? null,
      onComputeMidpoint: () => void onComputeMidpoint(),
      onClearMidpoint,
    }),
    [a, b, pick, matches, searchAll, networkIds.length, onPick, onCancelPick, onClear, onSelectRoute, midpoint, onComputeMidpoint, onClearMidpoint],
  );

  return { panel, pick, midpoint: midpoint?.result ?? null, onMapPick, onPlanFrom, onPlanTo };
}
