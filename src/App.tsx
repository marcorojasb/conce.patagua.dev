// Cascarón del visor: une la navegación (URL + historial, `useNavigation`),
// el mapa, los controles sobre el mapa y la superficie de fichas y
// herramientas. El estado de pantalla vive en el store de navegación; aquí
// solo se derivan las líneas del mapa, el foco y la fuente de micros.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ConceMap } from '@/components/conce-map';
import { Header } from '@/components/header';
import { MapHints } from '@/components/map-hints';
import { MapLayerControl } from '@/components/map-layer-control';
import { MapLegend } from '@/components/map-legend';
import { MicrosSlot } from '@/components/micros-slot';
import { Sidebar } from '@/components/sidebar';
import { SurfaceHost } from '@/components/surface-host';
import { WelcomeCard, useWelcomeCard } from '@/components/welcome-card';
import { CONCE_CENTER, ROUTES, ROUTES_BY_ID, useRoutesVersion } from '@/data/routes';
import { GTFS_STOPS } from '@/data/gtfs-stops.generated';
import { POIS } from '@/data/pois.generated';
import { TERMINALS } from '@/data/terminals.generated';
import { useAirQuality } from '@/hooks/use-air-quality';
import { useClock } from '@/hooks/use-clock';
import { useLayerStatus } from '@/hooks/use-layer-status';
import { useLiveArrivals } from '@/hooks/use-live-arrivals';
import { usePlannerState } from '@/hooks/use-planner-state';
import { useTheme } from '@/hooks/use-theme';
import {
  LINES_CATALOG,
  findStop,
  flyMapTo,
  getNavState,
  isPendingRoute,
  useNavigation,
} from '@/hooks/use-view-state';
import { getMapViewport } from '@/lib/map-viewport';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import { cn } from '@/lib/utils';
import type { InvalidRef } from '@/lib/view-state';
import { hiddenByFilter, linesEqualDefault, resolveLines, setLinesVisible, toggleLine } from '@/lib/visible-lines';
import { liveStopCode, onlyUntrackedLines } from '@/realtime/live-arrivals';
import { gpsVehicleFeed } from '@/realtime/gps-vehicle-feed';
import { scheduleVehicleFeed } from '@/realtime/schedule-vehicle-feed';
import { buildSimulationRoutes } from '@/realtime/simulated-vehicles';
import { useSimulationControl } from '@/realtime/use-simulated-vehicles';
import type {
  DirectionId,
  LoadableLayer,
  MapFocus,
  MapLayersState,
  MapNotice,
  MapTarget,
  MicrosMode,
  Selection,
  SelectOrigin,
  SimulationScope,
  SurfaceChrome,
  ToolId,
} from '@/types/ui-contracts';

const DESKTOP_QUERY = '(min-width: 768px)';
const NOTICE_MS = 8_000;
const EMPTY_IDS = new Set<string>();
const LAYER_COUNTS = { terminals: TERMINALS.length, paraderos: GTFS_STOPS.length, pois: POIS.length };
const NO_RETRIES: Record<LoadableLayer, number> = { coverage: 0, cycleways: 0, greenspace: 0, schools: 0 };

function subscribeDesktop(listener: () => void): () => void {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

/** Escritorio (barra lateral acoplada) o móvil (barra lateral como capa sobre el mapa). */
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
}

const INVALID_NOUN: Record<InvalidRef['kind'], string> = {
  route: 'el recorrido',
  stop: 'el paradero',
  terminal: 'el terminal',
  poi: 'el lugar',
  corridor: 'el corredor',
  lines: '',
};

function invalidNoticeText(ref: InvalidRef): string {
  if (ref.kind !== 'lines') return `No encontramos ${INVALID_NOUN[ref.kind]} «${ref.ref}»`;
  const count = ref.ref.split(',').length;
  return count === 1 ? `1 línea del enlace no existe («${ref.ref}»)` : `${count} líneas del enlace no existen`;
}

/**
 * Avisos sobre el mapa, uno a la vez y por 8 s. Un aviso con "Deshacer"
 * reemplaza a los otros con acción, así nunca queda a la vista un deshacer
 * de un estado que ya cambió.
 */
function useNotices() {
  const [queue, setQueue] = useState<MapNotice[]>([]);
  const nextId = useRef(0);
  const push = useCallback((text: string, action?: MapNotice['action']) => {
    nextId.current += 1;
    const notice: MapNotice = { id: nextId.current, text, action };
    setQueue((q) => [...(action ? q.filter((n) => !n.action) : q), notice]);
  }, []);
  const dismiss = useCallback(() => setQueue((q) => q.slice(1)), []);
  const current = queue[0] ?? null;
  useEffect(() => {
    if (!current) return undefined;
    const id = window.setTimeout(() => setQueue((q) => (q[0]?.id === current.id ? q.slice(1) : q)), NOTICE_MS);
    return () => window.clearTimeout(id);
  }, [current]);
  return { notice: current, push, dismiss };
}

export default function App() {
  const routesVersion = useRoutesVersion();
  const [theme, toggleTheme] = useTheme();
  const nav = useNavigation();
  const { state, select, refineRoute, togglePanel, openPanel, backSurface, closeSurface, setPrefs, openOverlay, closeOverlay } = nav;
  const { selection, panel, overlay, prefs, backLabel } = state;
  const isDesktop = useIsDesktop();
  const [dockedOpen, setDockedOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const welcome = useWelcomeCard();
  const hideWelcome = welcome.hide;
  const notices = useNotices();
  const pushNotice = notices.push;

  // ── Líneas en el mapa ─────────────────────────────────────────────────────
  const visibleIds = useMemo(() => {
    void routesVersion;
    return resolveLines(prefs.lines, LINES_CATALOG).ids;
  }, [prefs.lines, routesVersion]);
  const isDefaultLines = linesEqualDefault(prefs.lines, LINES_CATALOG, routesVersion > 0);
  // "Operando ahora" se recalcula cada minuto, solo con el filtro puesto.
  const minute = useClock(60_000, prefs.onlyOperating);
  const hiddenIds = useMemo(() => {
    void minute;
    if (!prefs.onlyOperating) return EMPTY_IDS;
    return hiddenByFilter(visibleIds, (id) => {
      const route = ROUTES_BY_ID.get(id);
      return !!route && isRouteOperatingNow(route);
    });
  }, [visibleIds, prefs.onlyOperating, minute]);
  const networkIds = useMemo(
    () => (hiddenIds.size > 0 ? visibleIds.filter((id) => !hiddenIds.has(id)) : visibleIds),
    [visibleIds, hiddenIds],
  );

  // ── Selección y foco ──────────────────────────────────────────────────────
  const routePending = isPendingRoute(selection);
  const shownSelection = routePending ? null : selection;
  const selectedRouteId = shownSelection?.kind === 'route' ? shownSelection.id : null;
  const focus = useMemo<MapFocus | null>(() => {
    void routesVersion;
    if (shownSelection?.kind === 'route') return { routeIds: [shownSelection.id], directionId: shownSelection.dir };
    if (shownSelection?.kind === 'stop') {
      const network = new Set(networkIds);
      const routeIds = (findStop(shownSelection.id)?.routes ?? []).filter((id) => network.has(id));
      return routeIds.length > 0 ? { routeIds, directionId: null } : null;
    }
    return null;
  }, [shownSelection, networkIds, routesVersion]);
  const surfaceOpen = !!panel || !!shownSelection;

  // ── Micros: una sola fuente a la vez ──────────────────────────────────────
  const vehicleFeed = prefs.micros === 'gps' ? gpsVehicleFeed : prefs.micros === 'schedule' ? scheduleVehicleFeed : null;
  const simulationKey =
    prefs.scope === 'all' ? 'all' : [...new Set([...networkIds, ...(focus?.routeIds ?? [])])].sort().join(',');
  const simulationRoutes = useMemo(() => {
    void routesVersion;
    if (simulationKey === 'all') return buildSimulationRoutes(ROUTES);
    const ids = new Set(simulationKey.split(','));
    return buildSimulationRoutes(ROUTES.filter((r) => ids.has(r.id)));
  }, [simulationKey, routesVersion]);
  const [scheduleRetryKey, setScheduleRetryKey] = useState(0);
  const onRetrySchedule = useCallback(() => setScheduleRetryKey((k) => k + 1), []);
  useSimulationControl({ enabled: prefs.micros === 'schedule', routes: simulationRoutes, retryKey: scheduleRetryKey });
  // GPS: primero el foco, luego las líneas agregadas más recientemente (el
  // tope de 16 sentidos deja fuera las más antiguas).
  const gpsRoutes = useMemo(() => {
    void routesVersion;
    const ids = [...(focus?.routeIds ?? []), ...[...networkIds].reverse()];
    return [...new Set(ids)].flatMap((id) => ROUTES_BY_ID.get(id) ?? []);
  }, [focus, networkIds, routesVersion]);

  // Llegadas en vivo solo del paradero con la ficha a la vista, y no de los
  // que solo tocan líneas que la fuente no sigue (302/304).
  const liveStop = shownSelection?.kind === 'stop' && !panel ? findStop(shownSelection.id) : null;
  const liveStopTracked = useMemo(() => {
    if (!liveStop || routesVersion === 0) return false;
    return !onlyUntrackedLines(liveStop.routes.flatMap((id) => ROUTES_BY_ID.get(id) ?? []));
  }, [liveStop, routesVersion]);
  const live = useLiveArrivals(liveStop && liveStopTracked ? liveStopCode(liveStop.id) : null);

  // ── Capas ─────────────────────────────────────────────────────────────────
  const coverage = useLayerStatus();
  const cycleways = useLayerStatus();
  const greenspace = useLayerStatus();
  const schools = useLayerStatus();
  const [retryKeys, setRetryKeys] = useState(NO_RETRIES);
  const [airRetryKey, setAirRetryKey] = useState(0);
  const airQuality = useAirQuality(prefs.layers.airQuality, airRetryKey);
  const layerLoad = useMemo(
    () => ({
      coverage: coverage.controls,
      cycleways: cycleways.controls,
      greenspace: greenspace.controls,
      schools: schools.controls,
    }),
    [coverage.controls, cycleways.controls, greenspace.controls, schools.controls],
  );
  const layerStatus = useMemo(
    () => ({
      coverage: coverage.status,
      cycleways: cycleways.status,
      greenspace: greenspace.status,
      schools: schools.status,
      airQuality: { stations: airQuality.stations.length, loading: airQuality.loading, error: airQuality.error },
    }),
    [coverage.status, cycleways.status, greenspace.status, schools.status, airQuality],
  );
  const onRetryLayer = useCallback((layer: LoadableLayer | 'airQuality') => {
    if (layer === 'airQuality') setAirRetryKey((k) => k + 1);
    else setRetryKeys((keys) => ({ ...keys, [layer]: keys[layer] + 1 }));
  }, []);
  const onLayersChange = useCallback(
    (patch: Partial<MapLayersState>) => setPrefs((p) => ({ layers: { ...p.layers, ...patch } })),
    [setPrefs],
  );
  const onLayersOpenChange = useCallback(
    (open: boolean) => (open ? openOverlay('layers') : closeOverlay()),
    [openOverlay, closeOverlay],
  );

  // ── Acciones ──────────────────────────────────────────────────────────────
  const selectAndHideWelcome = useCallback(
    (next: Selection, origin: SelectOrigin) => {
      hideWelcome();
      select(next, origin);
    },
    [hideWelcome, select],
  );
  const onSelectRouteFromList = useCallback(
    (id: string, dir?: DirectionId) => selectAndHideWelcome({ kind: 'route', id, dir: dir ?? null, tab: 'info' }, 'list'),
    [selectAndHideWelcome],
  );
  const onSelectStopFromList = useCallback(
    (id: string) => selectAndHideWelcome({ kind: 'stop', id }, 'list'),
    [selectAndHideWelcome],
  );
  const onMapSelect = useCallback(
    (target: MapTarget) => {
      if (target.kind === 'planner') {
        openPanel('planner');
      } else if (target.kind === 'vehicle') {
        selectAndHideWelcome({ kind: 'route', id: target.routeId, dir: target.directionId, tab: 'info' }, 'map');
      } else if (target.kind === 'route') {
        selectAndHideWelcome({ kind: 'route', id: target.id, dir: null, tab: 'info' }, 'map');
      } else {
        selectAndHideWelcome({ kind: target.kind, id: target.id }, 'map');
      }
    },
    [selectAndHideWelcome, openPanel],
  );

  const planner = usePlannerState({
    a: prefs.planner.a,
    b: prefs.planner.b,
    overlay,
    networkIds,
    routesVersion,
    onSelectRoute: onSelectRouteFromList,
  });
  const plannerOnMap = useMemo(
    () => ({ a: prefs.planner.a, b: prefs.planner.b, midpoint: planner.midpoint }),
    [prefs.planner.a, prefs.planner.b, planner.midpoint],
  );

  const onToggleVisible = useCallback(
    (id: string) => {
      hideWelcome();
      setPrefs((p) => ({ lines: toggleLine(p.lines, id, LINES_CATALOG) }));
    },
    [hideWelcome, setPrefs],
  );
  const onSetVisible = useCallback(
    (ids: readonly string[], visible: boolean) => {
      hideWelcome();
      setPrefs((p) => ({ lines: setLinesVisible(p.lines, ids, visible, LINES_CATALOG) }));
    },
    [hideWelcome, setPrefs],
  );
  const onSetLineVisible = useCallback((id: string, visible: boolean) => onSetVisible([id], visible), [onSetVisible]);
  const onRestoreDefault = useCallback(() => setPrefs({ lines: null }), [setPrefs]);
  const onClearAll = useCallback(() => {
    const before = getNavState().prefs.lines;
    const count = resolveLines(before, LINES_CATALOG).ids.length;
    if (count === 0) return;
    setPrefs({ lines: [] });
    pushNotice(`Quitadas ${count} ${count === 1 ? 'línea' : 'líneas'}`, {
      label: 'Deshacer',
      run: () => setPrefs({ lines: before }),
    });
  }, [setPrefs, pushNotice]);
  const onShowOperatorRoutes = useCallback(
    (operator: string) => {
      const before = getNavState().prefs.lines;
      const current = new Set(resolveLines(before, LINES_CATALOG).ids);
      const ids = ROUTES.filter((r) => r.operator === operator).map((r) => r.id);
      const added = ids.filter((id) => !current.has(id)).length;
      if (added === 0) {
        pushNotice('Esos recorridos ya están en el mapa');
        return;
      }
      hideWelcome();
      setPrefs({ lines: setLinesVisible(before, ids, true, LINES_CATALOG) });
      pushNotice(`Agregados ${added} ${added === 1 ? 'recorrido' : 'recorridos'}`, {
        label: 'Deshacer',
        run: () => setPrefs({ lines: before }),
      });
    },
    [hideWelcome, setPrefs, pushNotice],
  );
  const onToggleOnlyOperating = useCallback(() => setPrefs((p) => ({ onlyOperating: !p.onlyOperating })), [setPrefs]);
  const onClearOperatingFilter = useCallback(() => setPrefs({ onlyOperating: false }), [setPrefs]);
  const onModeChange = useCallback((micros: MicrosMode) => setPrefs({ micros }), [setPrefs]);
  const onScopeChange = useCallback((scope: SimulationScope) => setPrefs({ scope }), [setPrefs]);
  const onShowGpsOnMap = useCallback(() => setPrefs({ micros: 'gps' }), [setPrefs]);
  const onToggleTool = useCallback((tool: ToolId) => togglePanel(tool), [togglePanel]);
  const onOpenPlanner = useCallback(() => openPanel('planner'), [openPanel]);
  const onOpenSources = useCallback(() => openPanel('sources'), [openPanel]);
  const onRecenter = useCallback(
    () => flyMapTo({ kind: 'point', lat: CONCE_CENTER.lat, lng: CONCE_CENTER.lng, zoom: 12 }),
    [],
  );
  const onParaderosZoomIn = useCallback(() => {
    // Acerca sin correr el centro: lo que se mira sigue en el mismo lugar.
    const viewport = getMapViewport();
    const center = viewport?.center ?? CONCE_CENTER;
    flyMapTo({ kind: 'view', lat: center.lat, lng: center.lng, zoom: 15 });
  }, []);
  // Atajo de la tarjeta de inicio: paraderos encendidos y el mapa acercado al
  // centro, donde se ven (desde zoom 14).
  const onShowStops = useCallback(() => {
    hideWelcome();
    setPrefs((p) => ({ layers: { ...p.layers, paraderos: true } }));
    flyMapTo({ kind: 'point', lat: CONCE_CENTER.lat, lng: CONCE_CENTER.lng, zoom: 16 });
    pushNotice('Toca un paradero para ver sus llegadas en vivo');
  }, [hideWelcome, setPrefs, pushNotice]);
  const onSearch = useCallback(() => setCommandOpen(true), []);

  // Barra lateral: acoplada en escritorio (estado local); en móvil es una
  // capa transitoria del historial, así Atrás y Escape la cierran.
  const sidebarOpen = isDesktop ? dockedOpen : overlay === 'sidebar';
  const onToggleSidebar = useCallback(() => {
    if (isDesktop) setDockedOpen((open) => !open);
    else if (getNavState().overlay === 'sidebar') closeOverlay();
    else openOverlay('sidebar');
  }, [isDesktop, openOverlay, closeOverlay]);
  const onCloseSidebar = useCallback(() => {
    if (isDesktop) setDockedOpen(false);
    else closeOverlay();
  }, [isDesktop, closeOverlay]);
  const onOpenLines = useCallback(() => {
    if (isDesktop) setDockedOpen(true);
    else openOverlay('sidebar');
  }, [isDesktop, openOverlay]);

  // Avisos de enlaces con referencias que no existen (cada una una vez).
  const shownInvalid = useRef(0);
  useEffect(() => {
    const fresh = nav.invalid.slice(shownInvalid.current);
    shownInvalid.current = nav.invalid.length;
    for (const ref of fresh) pushNotice(invalidNoticeText(ref));
  }, [nav.invalid, pushNotice]);

  const chrome = useMemo<SurfaceChrome>(
    () => ({
      onClose: closeSurface,
      back: backLabel ? { label: backLabel, onBack: () => backSurface() } : null,
      collapsed: overlay === 'pick-a' || overlay === 'pick-b' || overlay === 'sidebar',
    }),
    [closeSurface, backSurface, backLabel, overlay],
  );

  const pickHint = useMemo(
    () => (planner.pick ? { target: planner.pick, onCancel: planner.panel.onCancelPick } : null),
    [planner.pick, planner.panel.onCancelPick],
  );
  const operatingHint = useMemo(
    () => (prefs.onlyOperating ? { hiddenCount: hiddenIds.size, onClear: onClearOperatingFilter } : null),
    [prefs.onlyOperating, hiddenIds.size, onClearOperatingFilter],
  );
  const paraderosHint = useMemo(
    () => (prefs.layers.paraderos ? { onZoomIn: onParaderosZoomIn } : null),
    [prefs.layers.paraderos, onParaderosZoomIn],
  );
  // A/B del planificador con el planificador cerrado: los pines siguen en el
  // mapa (y en el enlace) hasta que se quitan; el aviso dice de qué son.
  const hasPlannerPoints = !!(prefs.planner.a || prefs.planner.b);
  const onClearPlannerPoints = useCallback(() => setPrefs({ planner: { a: null, b: null } }), [setPrefs]);
  const plannerPointsHint = useMemo(
    () => (hasPlannerPoints && panel !== 'planner' ? { onOpen: onOpenPlanner, onClear: onClearPlannerPoints } : null),
    [hasPlannerPoints, panel, onOpenPlanner, onClearPlannerPoints],
  );
  // Sola aparece sin nada abierto; pedida con "?" aparece igual sobre una ficha.
  const showWelcome = welcome.visible && !overlay && (welcome.requested || !surfaceOpen);
  // El detalle GPS por línea (largo) se pliega si debajo hay avisos o la
  // tarjeta de inicio, o si una ficha ocupa la derecha: taparía lo encuadrado.
  const gpsDetailCollapsed =
    surfaceOpen || showWelcome || !!notices.notice || !!pickHint || !!operatingHint || !!plannerPointsHint;

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleSidebar={onToggleSidebar}
        onSelectRoute={onSelectRouteFromList}
        onSelectStop={onSelectStopFromList}
        commandOpen={commandOpen}
        onCommandOpenChange={setCommandOpen}
      />

      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={onCloseSidebar}
          routes={ROUTES}
          visibleRouteIds={visibleIds}
          hiddenByFilter={hiddenIds}
          isDefaultLines={isDefaultLines}
          onToggleVisible={onToggleVisible}
          onSetVisible={onSetVisible}
          onRestoreDefault={onRestoreDefault}
          onClearAll={onClearAll}
          selectedRouteId={selectedRouteId}
          onSelectRoute={onSelectRouteFromList}
          onlyOperatingNow={prefs.onlyOperating}
          onToggleOnlyOperatingNow={onToggleOnlyOperating}
          onOpenPlanner={onOpenPlanner}
          onOpenSources={onOpenSources}
        />

        <main className="relative flex-1">
          <ConceMap
            theme={theme}
            networkRouteIds={networkIds}
            focus={focus}
            selection={shownSelection}
            layers={prefs.layers}
            layerLoad={layerLoad}
            layerRetryKeys={retryKeys}
            airQuality={airQuality.stations}
            vehicleFeed={vehicleFeed}
            vehiclesDense={prefs.micros === 'schedule' && prefs.scope === 'all'}
            planner={plannerOnMap}
            pick={planner.pick}
            onPick={planner.onMapPick}
            flyTo={nav.flyTo}
            surfaceOpen={surfaceOpen}
            onSelect={onMapSelect}
          />

          {/* Columna izquierda sobre el mapa: arriba el control de micros, los
              avisos y la tarjeta de inicio; abajo la leyenda. Lo de arriba
              nunca pasa por debajo de la leyenda: si no cabe, se desplaza. */}
          <div className="pointer-events-none absolute bottom-6 left-2 top-2 z-10 flex max-w-[calc(100%-4rem)] flex-col justify-between gap-1.5 md:left-3 md:top-3">
            <div
              data-map-overlay="top-left"
              className="thin-scroll pointer-events-none -m-1 flex min-h-0 shrink flex-col items-start gap-1.5 overflow-y-auto p-1"
            >
              <div className="pointer-events-auto max-w-full">
                <MicrosSlot
                  mode={prefs.micros}
                  onModeChange={onModeChange}
                  scope={prefs.scope}
                  onScopeChange={onScopeChange}
                  routes={gpsRoutes}
                  selectedRouteId={selectedRouteId}
                  stopLive={liveStop ? live : null}
                  onOpenLines={onOpenLines}
                  compact={surfaceOpen && !isDesktop}
                  detailCollapsed={gpsDetailCollapsed}
                  onRetrySchedule={onRetrySchedule}
                />
              </div>
              <div className="pointer-events-auto max-w-full">
                <MapHints
                  operatingFilter={operatingHint}
                  paraderosZoom={paraderosHint}
                  pick={pickHint}
                  plannerPoints={plannerPointsHint}
                  notice={notices.notice}
                  onDismissNotice={notices.dismiss}
                />
              </div>
              {showWelcome && (
                <div className="pointer-events-auto max-w-full animate-fade-in">
                  <WelcomeCard
                    routesCount={ROUTES.length}
                    stopsCount={GTFS_STOPS.length}
                    onSearch={onSearch}
                    onShowStops={onShowStops}
                    onDismiss={hideWelcome}
                  />
                </div>
              )}
            </div>

            <div className={cn('pointer-events-auto shrink-0 self-start', surfaceOpen && 'hidden sm:block')}>
              <MapLegend
                micros={prefs.micros}
                layers={prefs.layers}
                collapsed={surfaceOpen || showWelcome}
                plannerPoints={hasPlannerPoints}
                lines={networkIds}
              />
            </div>
          </div>

          <MapLayerControl
            counts={LAYER_COUNTS}
            layers={prefs.layers}
            onLayersChange={onLayersChange}
            status={layerStatus}
            onRetry={onRetryLayer}
            layersOpen={overlay === 'layers'}
            onLayersOpenChange={onLayersOpenChange}
            onRecenter={onRecenter}
            activePanel={panel}
            onToggleTool={onToggleTool}
          />
        </main>
      </div>

      <SurfaceHost
        selection={selection}
        panel={panel}
        chrome={chrome}
        theme={theme}
        prefs={prefs}
        visibleRouteIds={visibleIds}
        live={live}
        planner={planner.panel}
        onSelect={selectAndHideWelcome}
        onRefineRoute={refineRoute}
        onSetLineVisible={onSetLineVisible}
        onShowOperatorRoutes={onShowOperatorRoutes}
        onShowGpsOnMap={onShowGpsOnMap}
        onPlanFrom={planner.onPlanFrom}
        onPlanTo={planner.onPlanTo}
        onError={closeSurface}
      />
    </div>
  );
}
