// La única superficie a la vista (panel derecho en escritorio, hoja inferior
// en móvil): el panel si hay uno, si no la ficha de la selección. El historial
// es la pila; aquí solo se elige qué mostrar y se le pasa el marco común
// (`chrome`: "← anterior" y "×").
//
// Fichas y herramientas se cargan recién al abrirse: no hacen falta para el
// primer dibujo del mapa y sacarlas del chunk principal lo mantiene dentro del
// presupuesto (scripts/check-bundle-budget.ts).

import { lazy } from 'react';
import { LazyBoundary } from '@/components/lazy-boundary';
import { POIS } from '@/data/pois.generated';
import { ROUTES_BY_ID, useRoutesVersion } from '@/data/routes';
import { TERMINALS } from '@/data/terminals.generated';
import type { LiveArrivalsSnapshot } from '@/hooks/use-live-arrivals';
import { findStop, flyMapTo, flyTargetFor, isPendingRoute } from '@/hooks/use-view-state';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import type { Theme } from '@/types/transport';
import type {
  DirectionId,
  LatLng,
  PanelId,
  PlannerPanelProps,
  RouteTab,
  Selection,
  SelectOrigin,
  SurfaceChrome,
  ViewPrefs,
} from '@/types/ui-contracts';

const RouteDetailSheet = lazy(() =>
  import('@/components/route-detail-sheet').then((m) => ({ default: m.RouteDetailSheet })),
);
const StopDetailSheet = lazy(() =>
  import('@/components/stop-detail-sheet').then((m) => ({ default: m.StopDetailSheet })),
);
const TerminalDetailSheet = lazy(() =>
  import('@/components/terminal-detail-sheet').then((m) => ({ default: m.TerminalDetailSheet })),
);
const PoiDetailSheet = lazy(() =>
  import('@/components/poi-detail-sheet').then((m) => ({ default: m.PoiDetailSheet })),
);
const CorridorDetailSheet = lazy(() =>
  import('@/components/corridor-detail-sheet').then((m) => ({ default: m.CorridorDetailSheet })),
);
const DataSourcesSheet = lazy(() =>
  import('@/components/data-sources-sheet').then((m) => ({ default: m.DataSourcesSheet })),
);
const FloatingToolsPanel = lazy(() =>
  import('@/components/floating-tools-panel').then((m) => ({ default: m.FloatingToolsPanel })),
);

interface SurfaceHostProps {
  selection: Selection | null;
  panel: PanelId | null;
  chrome: SurfaceChrome;
  theme: Theme;
  prefs: ViewPrefs;
  /** Líneas en el mapa (sin aplicar el filtro de horario). */
  visibleRouteIds: readonly string[];
  live: LiveArrivalsSnapshot;
  planner: PlannerPanelProps;
  onSelect: (selection: Selection, origin: SelectOrigin) => void;
  onRefineRoute: (patch: { tab?: RouteTab; dir?: DirectionId | null }) => void;
  onSetLineVisible: (id: string, visible: boolean) => void;
  onShowOperatorRoutes: (operator: string) => void;
  onShowGpsOnMap: () => void;
  onPlanFrom: (point: LatLng) => void;
  onPlanTo: (point: LatLng) => void;
  /** El chunk de la superficie no cargó: se cierra y el mapa sigue. */
  onError: () => void;
}

function selectRoute(onSelect: SurfaceHostProps['onSelect']) {
  return (id: string, dir?: DirectionId) => onSelect({ kind: 'route', id, dir: dir ?? null, tab: 'info' }, 'list');
}

function focusOn(selection: Selection): () => void {
  return () => {
    const target = flyTargetFor(selection);
    if (target) flyMapTo(target);
  };
}

export function SurfaceHost(props: SurfaceHostProps) {
  // Las fichas leen ROUTES/STOPS, que crecen al llegar el chunk GTFS.
  useRoutesVersion();
  return <LazyBoundary onError={props.onError}>{renderSurface(props)}</LazyBoundary>;
}

function renderSurface({
  selection,
  panel,
  chrome,
  theme,
  prefs,
  visibleRouteIds,
  live,
  planner,
  onSelect,
  onRefineRoute,
  onSetLineVisible,
  onShowOperatorRoutes,
  onShowGpsOnMap,
  onPlanFrom,
  onPlanTo,
}: SurfaceHostProps) {
  if (panel === 'sources') return <DataSourcesSheet chrome={chrome} />;
  if (panel) {
    return (
      <FloatingToolsPanel
        tool={panel}
        chrome={chrome}
        planner={planner}
        onShowOperatorRoutes={onShowOperatorRoutes}
        onSelectRoute={selectRoute(onSelect)}
        visibleRouteIds={visibleRouteIds}
        theme={theme}
        micros={prefs.micros}
        scope={prefs.scope}
        layers={prefs.layers}
      />
    );
  }
  if (!selection || isPendingRoute(selection)) return null;

  switch (selection.kind) {
    case 'route': {
      const route = ROUTES_BY_ID.get(selection.id);
      if (!route) return null;
      const onMap = visibleRouteIds.includes(route.id);
      return (
        <RouteDetailSheet
          key={route.id}
          chrome={chrome}
          route={route}
          tab={selection.tab}
          onTabChange={(tab) => onRefineRoute({ tab })}
          directionId={selection.dir}
          onDirectionChange={(dir) => onRefineRoute({ dir })}
          membership={{
            onMap,
            hiddenByFilter: prefs.onlyOperating && !isRouteOperatingNow(route),
            onAdd: () => onSetLineVisible(route.id, true),
            onRemove: () => onSetLineVisible(route.id, false),
          }}
          onFocusRoute={focusOn(selection)}
          onSelectStop={(id) => onSelect({ kind: 'stop', id }, 'list')}
        />
      );
    }
    case 'stop': {
      const stop = findStop(selection.id);
      if (!stop) return null;
      return (
        <StopDetailSheet
          key={stop.id}
          chrome={chrome}
          stop={stop}
          live={live}
          micros={prefs.micros}
          onShowGpsOnMap={onShowGpsOnMap}
          onSelectRoute={selectRoute(onSelect)}
          onPlanFrom={onPlanFrom}
          onPlanTo={onPlanTo}
        />
      );
    }
    case 'terminal': {
      const terminal = TERMINALS.find((t) => t.id === selection.id);
      if (!terminal) return null;
      return <TerminalDetailSheet key={terminal.id} chrome={chrome} terminal={terminal} onFocus={focusOn(selection)} />;
    }
    case 'poi': {
      const poi = POIS.find((p) => p.id === selection.id);
      if (!poi) return null;
      return (
        <PoiDetailSheet
          key={poi.id}
          chrome={chrome}
          poi={poi}
          onFocus={focusOn(selection)}
          onSelectRoute={(id) => onSelect({ kind: 'route', id, dir: null, tab: 'info' }, 'list')}
        />
      );
    }
    case 'corridor':
      return <CorridorDetailSheet key={selection.id} chrome={chrome} corridorId={selection.id} onFocus={focusOn(selection)} />;
  }
}
