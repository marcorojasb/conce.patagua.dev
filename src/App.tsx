import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { ConceMap } from '@/components/conce-map';
import { MapLegend } from '@/components/map-legend';
import { Header } from '@/components/header';
import { MapLayerControl } from '@/components/map-layer-control';
import { Sidebar } from '@/components/sidebar';
import { LazyBoundary } from '@/components/lazy-boundary';
import type { AnalysisTab } from '@/components/floating-tools-panel';
import { useSimulationControl, useSimulationStatus } from '@/realtime/use-simulated-vehicles';
import { useLiveArrivals } from '@/hooks/use-live-arrivals';
import { indexLiveServices, liveStopCode, onlyUntrackedLines } from '@/realtime/live-arrivals';
import { buildSimulationRoutes, type SimulationRouteInput } from '@/realtime/simulated-vehicles';
import { WelcomeCard } from '@/components/welcome-card';
import {
  CONCE_CENTER,
  DEFAULT_VISIBLE_ROUTE_IDS,
  ROUTES,
  ROUTES_BY_ID,
  STOPS,
  findRoute,
  useRoutesVersion,
} from '@/data/routes';
import { TERMINALS } from '@/data/terminals.generated';
import { GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { POIS } from '@/data/pois.generated';
import { useAirQuality } from '@/hooks/use-air-quality';
import { useLayerStatus } from '@/hooks/use-layer-status';
import { usePlannerState } from '@/hooks/use-planner-state';
import { useTheme } from '@/hooks/use-theme';
import {
  clearFocusParam,
  readFocusParam,
  readUrlState,
  useSyncUrlState,
} from '@/hooks/use-url-state';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import { routeShortName } from '@/lib/route-labels';
import { cn } from '@/lib/utils';
import { CORRIDOR_BY_ID } from '@/data/interurban-corridors';
import type { FlyToToken, Route, SheetKind, StopWithRoutes } from '@/types/transport';

// Fichas y herramientas se cargan recién al abrirse: no hacen falta para el
// primer dibujo del mapa y sacarlas del chunk principal lo mantiene dentro del
// presupuesto (scripts/check-bundle-budget.ts).
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
const DataSourcesSheet = lazy(() =>
  import('@/components/data-sources-sheet').then((m) => ({ default: m.DataSourcesSheet })),
);
const FloatingToolsPanel = lazy(() =>
  import('@/components/floating-tools-panel').then((m) => ({ default: m.FloatingToolsPanel })),
);

const INITIAL_URL = readUrlState();
// `?focus=<kind>:<id>` puede venir desde el wiki (`<MapLink>`). Lo leemos
// una sola vez al iniciar; el visor lo aplica como un flyTo + activación
// de capas, y `clearFocusParam` lo retira del query string para que la
// URL siga limpia mientras el usuario navega.
const INITIAL_FOCUS = readFocusParam();
type SimulationScope = 'visible' | 'all';
type SelectedDetail = Exclude<SheetKind, null>;

interface SelectedDetailState {
  kind: SelectedDetail;
  id: string;
  /** Sentido pedido cuando el recorrido llegó por la variante de un letrero ("10A"). */
  directionId?: 0 | 1;
}

// Recorrido pedido por la URL: `?route=` (id, o también código/variante) o
// `?focus=route:` desde el wiki ("201", "10A"). Los recorridos GTFS llegan en
// un chunk diferido; si todavía no está, App lo aplica cuando carga.
const INITIAL_ROUTE_REF =
  INITIAL_URL.route ??
  (!INITIAL_URL.stop && !INITIAL_URL.terminal && !INITIAL_URL.poi && INITIAL_FOCUS?.kind === 'route'
    ? INITIAL_FOCUS.id
    : null);
const INITIAL_ROUTE_MATCH = INITIAL_ROUTE_REF ? findRoute(INITIAL_ROUTE_REF) : null;
const INITIAL_ROUTE = INITIAL_ROUTE_MATCH?.route ?? null;
let pendingRouteRef = INITIAL_ROUTE_REF && !INITIAL_ROUTE ? INITIAL_ROUTE_REF : null;
// Visibles por defecto que ya existen al montar (Biotrén); los interurbanos
// oficiales llegan con el chunk GTFS y se suman a lo visible en ese momento.
const EAGER_DEFAULT_ROUTE_IDS = new Set(DEFAULT_VISIBLE_ROUTE_IDS);
const INITIAL_FOCUS_CORRIDOR =
  INITIAL_FOCUS?.kind === 'corridor' ? CORRIDOR_BY_ID.get(INITIAL_FOCUS.id) ?? null : null;

function initialSelectedDetail(): SelectedDetailState | null {
  if (INITIAL_ROUTE_REF) {
    return INITIAL_ROUTE_MATCH
      ? {
          kind: 'route',
          id: INITIAL_ROUTE_MATCH.route.id,
          directionId: INITIAL_ROUTE_MATCH.directionId ?? INITIAL_URL.dir ?? undefined,
        }
      : null;
  }
  if (INITIAL_URL.stop) return { kind: 'stop', id: INITIAL_URL.stop };
  if (INITIAL_URL.terminal) return { kind: 'terminal', id: INITIAL_URL.terminal };
  if (INITIAL_URL.poi) return { kind: 'poi', id: INITIAL_URL.poi };
  if (!INITIAL_FOCUS) return null;
  if (INITIAL_FOCUS.kind === 'stop') return { kind: 'stop', id: INITIAL_FOCUS.id };
  if (INITIAL_FOCUS.kind === 'terminal') return { kind: 'terminal', id: INITIAL_FOCUS.id };
  if (INITIAL_FOCUS.kind === 'poi') return { kind: 'poi', id: INITIAL_FOCUS.id };
  return null;
}

function pointFlyToToken(lat: number, lng: number, zoom: number): FlyToToken {
  return { key: 0, target: { kind: 'point', lat, lng, zoom } };
}

// Los paraderos GTFS entran a STOPS recién con el chunk de recorridos; para
// centrar el mapa basta su posición, que ya está en GTFS_STOPS.
function stopPosition(id: string): { lat: number; lng: number } | null {
  return STOPS.find((x) => x.id === id) ?? GTFS_STOPS.find((x) => x.id === id) ?? null;
}

function initialFlyToToken(): FlyToToken | null {
  if (INITIAL_ROUTE_REF) {
    return INITIAL_ROUTE ? { key: 0, target: { kind: 'bounds', path: INITIAL_ROUTE.path } } : null;
  }
  if (INITIAL_URL.stop) {
    const stop = stopPosition(INITIAL_URL.stop);
    return stop ? pointFlyToToken(stop.lat, stop.lng, 16) : null;
  }
  if (INITIAL_URL.terminal) {
    const terminal = TERMINALS.find((x) => x.id === INITIAL_URL.terminal);
    return terminal ? pointFlyToToken(terminal.lat, terminal.lng, 16) : null;
  }
  if (INITIAL_URL.poi) {
    const poi = POIS.find((x) => x.id === INITIAL_URL.poi);
    return poi ? pointFlyToToken(poi.lat, poi.lng, 16) : null;
  }
  if (!INITIAL_FOCUS) return null;
  if (INITIAL_FOCUS.kind === 'corridor' && INITIAL_FOCUS_CORRIDOR) {
    const { anchor, terminal } = INITIAL_FOCUS_CORRIDOR;
    return terminal
      ? { key: 0, target: { kind: 'bounds', path: [terminal, anchor] } }
      : pointFlyToToken(anchor[0], anchor[1], 11);
  }
  if (INITIAL_FOCUS.kind === 'stop') {
    const stop = stopPosition(INITIAL_FOCUS.id);
    return stop ? pointFlyToToken(stop.lat, stop.lng, 16) : null;
  }
  if (INITIAL_FOCUS.kind === 'terminal') {
    const terminal = TERMINALS.find((x) => x.id === INITIAL_FOCUS.id);
    return terminal ? pointFlyToToken(terminal.lat, terminal.lng, 16) : null;
  }
  if (INITIAL_FOCUS.kind === 'poi') {
    const poi = POIS.find((x) => x.id === INITIAL_FOCUS.id);
    return poi ? pointFlyToToken(poi.lat, poi.lng, 16) : null;
  }
  return null;
}

// react-doctor-disable-next-line react-doctor/no-giant-component, react-doctor/prefer-useReducer, react-doctor/no-high-complexity-react-function -- App is the route/map shell; coupled state was consolidated, remaining state slices are independent UI controls.
export default function App() {
  // Subscribes to the micros-loaded event so the sidebar/search/etc.
  // re-render the moment the bus-routes lazy chunk lands.
  const routesVersion = useRoutesVersion();
  const [theme, toggleTheme] = useTheme();
  // Default closed on mobile (sidebar overlays the map below md:), open on
  // desktop where it docks alongside.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px)').matches;
  });

  const [visibleRouteIds, setVisibleRouteIds] = useState<string[]>(() => {
    // If a deep link selects a route, make sure it's visible too.
    if (INITIAL_ROUTE && !DEFAULT_VISIBLE_ROUTE_IDS.includes(INITIAL_ROUTE.id)) {
      return [...DEFAULT_VISIBLE_ROUTE_IDS, INITIAL_ROUTE.id];
    }
    return [...DEFAULT_VISIBLE_ROUTE_IDS];
  });


  const [selectedDetail, setSelectedDetail] = useState<SelectedDetailState | null>(initialSelectedDetail);
  const selectedRouteId = selectedDetail?.kind === 'route' ? selectedDetail.id : null;
  const selectedStopId = selectedDetail?.kind === 'stop' ? selectedDetail.id : null;
  const selectedParaderoId = selectedDetail?.kind === 'paradero' ? selectedDetail.id : null;
  const selectedTerminalId = selectedDetail?.kind === 'terminal' ? selectedDetail.id : null;
  const selectedPoiId = selectedDetail?.kind === 'poi' ? selectedDetail.id : null;
  const sheetKind = selectedDetail?.kind ?? null;

  // Deep-links de terminal/poi (URL durable o ?focus=) encienden la capa
  // para que el pin sea visible al aterrizar desde el wiki.
  const [showTerminals, setShowTerminals] = useState(
    () =>
      !!INITIAL_URL.terminal ||
      INITIAL_FOCUS?.kind === 'terminal' ||
      false,
  );
  const [showParaderos, setShowParaderos] = useState(INITIAL_URL.paraderos);
  const [commandOpen, setCommandOpen] = useState(false);
  // Los paraderos se dibujan desde zoom 14: el atajo los enciende y acerca al
  // centro de Concepción para que se vean de inmediato.
  const onShowStopsNearCenter = useCallback(() => {
    setShowParaderos(true);
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: CONCE_CENTER.lat, lng: CONCE_CENTER.lng, zoom: 16 },
    });
  }, []);
  const [showPois, setShowPois] = useState(
    () => !!INITIAL_URL.poi || INITIAL_FOCUS?.kind === 'poi' || false,
  );
  const [showAirQuality, setShowAirQuality] = useState(INITIAL_URL.aire);
  const [onlyOperatingNow, setOnlyOperatingNow] = useState(INITIAL_URL.activos);
  const [airQualityRetryKey, setAirQualityRetryKey] = useState(0);

  const airQuality = useAirQuality(showAirQuality, airQualityRetryKey);

  const {
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
  } = usePlannerState({ visibleRouteIds, routesVersion });

  const [showSimulatedVehicles, setShowSimulatedVehicles] = useState(true);
  const [simulationScope, setSimulationScope] = useState<SimulationScope>('visible');
  const [simulationRetryKey, setSimulationRetryKey] = useState(0);

  // Pool of routes the simulator can project vehicles for: one input per GTFS
  // direction and per Biotrén EFE pattern (see buildSimulationRoutes).
  const simulationRoutes = useMemo<SimulationRouteInput[]>(() => {
    void routesVersion;
    if (simulationScope === 'all') return buildSimulationRoutes(ROUTES);
    const visible = new Set(visibleRouteIds);
    return buildSimulationRoutes(ROUTES.filter((r) => visible.has(r.id)));
  }, [routesVersion, simulationScope, visibleRouteIds]);
  const routeColorById = useMemo(
    () => {
      void routesVersion;
      return new Map(ROUTES.map((r) => [r.id, r.color]));
    },
    [routesVersion],
  );
  const routeLabelById = useMemo(
    () => {
      void routesVersion;
      return new Map(ROUTES.map((r) => [r.id, `${r.code} · ${routeShortName(r)}`]));
    },
    [routesVersion],
  );
  useSimulationControl({
    enabled: showSimulatedVehicles,
    routes: simulationRoutes,
    retryKey: simulationRetryKey,
  });
  const simulationStatus = useSimulationStatus();

  // La fuente en vivo nombra cada sentido por separado ("62H", "401I"): el
  // índice lo lleva al recorrido y sentido del visor.
  const liveServices = useMemo(() => {
    void routesVersion;
    return indexLiveServices(ROUTES);
  }, [routesVersion]);


  const [showCoverage, setShowCoverage] = useState(false);
  const [coverageThreshold, setCoverageThreshold] = useState<'all' | 'underserved'>('all');
  const coverageLayer = useLayerStatus();
  const [coverageRetryKey, setCoverageRetryKey] = useState(0);
  const [showCycleways, setShowCycleways] = useState(false);
  const cyclewaysLayer = useLayerStatus();
  const [cyclewaysRetryKey, setCyclewaysRetryKey] = useState(0);
  const [showGreenspace, setShowGreenspace] = useState(false);
  const greenspaceLayer = useLayerStatus();
  const [greenspaceRetryKey, setGreenspaceRetryKey] = useState(0);
  const [showSchools, setShowSchools] = useState(false);
  const schoolsLayer = useLayerStatus();
  const [schoolsRetryKey, setSchoolsRetryKey] = useState(0);
  // Si la URL trae `?focus=corridor:…` activamos la capa de corredores
  // inmediatamente, el usuario llegó desde el wiki y espera ver el pin.
  const [showInterurbanCorridors, setShowInterurbanCorridors] = useState(
    INITIAL_FOCUS?.kind === 'corridor',
  );

  // Last viewport reported by the map. Used by the wallpaper exporter so the
  // "vista actual" mode captures exactly what the user is looking at.
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null);

  const [flyToToken, setFlyToToken] = useState<FlyToToken | null>(initialFlyToToken);

  // Al llegar el chunk GTFS: los interurbanos por defecto pasan a visibles y
  // un deep link a un recorrido que aún no estaba cargado se aplica (una vez).
  useEffect(() => {
    if (routesVersion === 0) return;
    const pending = pendingRouteRef ? findRoute(pendingRouteRef) : null;
    pendingRouteRef = null;
    const add = DEFAULT_VISIBLE_ROUTE_IDS.filter((id) => !EAGER_DEFAULT_ROUTE_IDS.has(id));
    if (pending) add.push(pending.route.id);
    setVisibleRouteIds((cur) => {
      const missing = add.filter((id) => !cur.includes(id));
      return missing.length > 0 ? [...cur, ...missing] : cur;
    });
    if (pending) {
      setSelectedDetail({
        kind: 'route',
        id: pending.route.id,
        directionId: pending.directionId ?? INITIAL_URL.dir ?? undefined,
      });
      setFlyToToken({ key: Date.now(), target: { kind: 'bounds', path: pending.route.path } });
    }
  }, [routesVersion]);

  const [sourcesOpen, setSourcesOpen] = useState(false);
  // Single active tool, null means no panel is open. Floating, non-modal:
  // the user can keep interacting with the map while a tool is on screen.
  const [activeTool, setActiveTool] = useState<AnalysisTab | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);

  const closeDetailPanels = useCallback(() => {
    setSelectedDetail(null);
  }, []);

  const closeSidebarOnMobile = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(min-width: 768px)').matches) {
      setSidebarOpen(false);
    }
  }, []);

  // Toolbar button behavior: click same tool = close; different = switch.
  const toggleTool = useCallback((t: AnalysisTab) => {
    closeDetailPanels();
    setSourcesOpen(false);
    setLayersOpen(false);
    closeSidebarOnMobile();
    setActiveTool((cur) => (cur === t ? null : t));
  }, [closeDetailPanels, closeSidebarOnMobile]);

  const toggleLayers = useCallback(() => {
    const next = !layersOpen;
    setLayersOpen(next);
    if (next) {
      closeDetailPanels();
      setSourcesOpen(false);
      setActiveTool(null);
      closeSidebarOnMobile();
    }
  }, [layersOpen, closeDetailPanels, closeSidebarOnMobile]);

  useSyncUrlState({
    route: selectedRouteId,
    dir: selectedDetail?.kind === 'route' ? selectedDetail.directionId ?? null : null,
    stop: selectedStopId,
    terminal: selectedTerminalId,
    poi: selectedPoiId,
    paraderos: showParaderos,
    activos: onlyOperatingNow,
    pois: showPois,
    aire: showAirQuality,
  });

  const selectedRoute = useMemo(
    () => {
      void routesVersion;
      return selectedRouteId ? ROUTES_BY_ID.get(selectedRouteId) ?? null : null;
    },
    [selectedRouteId, routesVersion],
  );
  const selectedStop = useMemo(
    () => {
      void routesVersion;
      return STOPS.find((s) => s.id === selectedStopId) ?? null;
    },
    [selectedStopId, routesVersion],
  );
  // Un paradero de la capa GTFS abre la misma ficha que una parada de
  // recorrido; si no aparece en ningún recorrido dibujado, va sin recorridos.
  const selectedParaderoStop = useMemo<StopWithRoutes | null>(() => {
    void routesVersion;
    if (!selectedParaderoId) return null;
    const onRoute = STOPS.find((s) => s.id === selectedParaderoId);
    if (onRoute) return onRoute;
    const p = GTFS_STOPS.find((x) => x.id === selectedParaderoId);
    if (!p) return null;
    return {
      id: p.id,
      name: p.name ?? `Paradero ${p.sourceId ?? ''}`.trim(),
      lat: p.lat,
      lng: p.lng,
      ref: p.ref,
      routes: [],
    };
  }, [selectedParaderoId, routesVersion]);
  // Llegadas reales solo para el paradero abierto (ficha de paradero GTFS o
  // parada de un recorrido): una consulta por vez, nunca para toda la red. Se
  // espera a conocer sus recorridos (chunk GTFS): un paradero con solo líneas
  // que la fuente no sigue (302/304) no se consulta, así no gasta el tope de
  // la intermediaria, y la ficha lo avisa.
  const liveStop = sheetKind === 'stop' ? selectedStop : sheetKind === 'paradero' ? selectedParaderoStop : null;
  const liveStopRoutes = useMemo(() => {
    void routesVersion;
    return (liveStop?.routes ?? []).flatMap((id) => ROUTES_BY_ID.get(id) ?? []);
  }, [liveStop, routesVersion]);
  const liveArrivals = useLiveArrivals(
    liveStop && routesVersion > 0 && !onlyUntrackedLines(liveStopRoutes) ? liveStopCode(liveStop.id) : null,
  );

  const selectedTerminal = useMemo(
    () => TERMINALS.find((t) => t.id === selectedTerminalId) ?? null,
    [selectedTerminalId],
  );
  const selectedPoi = useMemo(
    () => POIS.find((p) => p.id === selectedPoiId) ?? null,
    [selectedPoiId],
  );

  const visibleIdsAfterTypeFilter = useMemo(() => {
    void routesVersion;
    return visibleRouteIds.filter((id) => {
      const r = ROUTES_BY_ID.get(id);
      if (!r) return false;
      if (onlyOperatingNow && !isRouteOperatingNow(r)) return false;
      return true;
    });
  }, [visibleRouteIds, onlyOperatingNow, routesVersion]);
  const legendRoutes = useMemo(() => {
    void routesVersion;
    return visibleIdsAfterTypeFilter
      .map((id) => ROUTES_BY_ID.get(id))
      .filter((r): r is Route => !!r);
  }, [visibleIdsAfterTypeFilter, routesVersion]);

  const onToggleVisible = useCallback((id: string) => {
    setVisibleRouteIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }, []);

  const onSetVisible = useCallback((ids: string[], visible: boolean) => {
    const target = new Set(ids);
    setVisibleRouteIds((cur) => {
      if (!visible) return cur.filter((id) => !target.has(id));
      const next = new Set(cur);
      for (const id of ids) next.add(id);
      return Array.from(next);
    });
  }, []);

  const onShowOperatorRoutes = useCallback(
    (operator: string) => {
      void routesVersion;
      onSetVisible(ROUTES.filter((r) => r.operator === operator).map((r) => r.id), true);
      setActiveTool(null);
    },
    [onSetVisible, routesVersion],
  );

  const clearSelection = closeDetailPanels;

  const onSelectRoute = useCallback(
    (id: string) => {
      if (selectedRouteId === id && sheetKind === 'route') {
        clearSelection();
        return;
      }
      const r = ROUTES_BY_ID.get(id);
      if (!r) return;
      setVisibleRouteIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
      setSelectedDetail({ kind: 'route', id });
      setSourcesOpen(false);
      setLayersOpen(false);
      setActiveTool(null);
      setFlyToToken({ key: Date.now(), target: { kind: 'bounds', path: r.path } });
      closeSidebarOnMobile();
    },
    [clearSelection, closeSidebarOnMobile, selectedRouteId, sheetKind],
  );

  // El sentido elegido en la ficha va a la URL (`&dir=`), para que recargar o
  // compartir abra el mismo.
  const onPickRouteDirection = useCallback((directionId: 0 | 1) => {
    setSelectedDetail((cur) => (cur?.kind === 'route' ? { ...cur, directionId } : cur));
  }, []);

  // Clicking a simulated vehicle pops the underlying route's detail sheet, // saves us building a parallel "vehicle sheet" UI when the natural thing
  // to know is which route the projected bus belongs to.
  const onSelectSimulatedVehicle = useCallback(
    (routeId: string) => {
      if (routeId) onSelectRoute(routeId);
    },
    [onSelectRoute],
  );

  const onSelectStop = useCallback((id: string) => {
    const s = STOPS.find((x) => x.id === id);
    if (!s) return;
    setSelectedDetail({ kind: 'stop', id });
    setSourcesOpen(false);
    setLayersOpen(false);
    setActiveTool(null);
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: s.lat, lng: s.lng, zoom: 16 },
    });
  }, []);

  const onSelectTerminal = useCallback((id: string) => {
    const t = TERMINALS.find((x) => x.id === id);
    if (!t) return;
    setSelectedDetail({ kind: 'terminal', id });
    setSourcesOpen(false);
    setLayersOpen(false);
    setActiveTool(null);
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: t.lat, lng: t.lng, zoom: 16 },
    });
  }, []);

  const onSelectPoi = useCallback((id: string) => {
    const p = POIS.find((x) => x.id === id);
    if (!p) return;
    setSelectedDetail({ kind: 'poi', id });
    setSourcesOpen(false);
    setLayersOpen(false);
    setActiveTool(null);
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: p.lat, lng: p.lng, zoom: 16 },
    });
  }, []);

  const onSelectParadero = useCallback((id: string) => {
    const p = GTFS_STOPS.find((x) => x.id === id);
    if (!p) return;
    setSelectedDetail({ kind: 'paradero', id });
    setSourcesOpen(false);
    setLayersOpen(false);
    setActiveTool(null);
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: p.lat, lng: p.lng, zoom: 17 },
    });
  }, []);

  // `focus` is a one-shot handoff from the wiki; selectedDetail/flyToToken
  // already captured it during initial state creation, so keep the URL tidy.
  useEffect(() => {
    if (INITIAL_FOCUS) clearFocusParam();
  }, []);

  const closeSheet = clearSelection;

  const onFocusRoute = useCallback(() => {
    if (!selectedRoute) return;
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'bounds', path: selectedRoute.path },
    });
  }, [selectedRoute]);

  const onFocusTerminal = useCallback(() => {
    if (!selectedTerminal) return;
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: selectedTerminal.lat, lng: selectedTerminal.lng, zoom: 16 },
    });
  }, [selectedTerminal]);

  const onFocusPoi = useCallback(() => {
    if (!selectedPoi) return;
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: selectedPoi.lat, lng: selectedPoi.lng, zoom: 16 },
    });
  }, [selectedPoi]);

  const onRecenterMap = useCallback(() => {
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: -36.8201, lng: -73.0444, zoom: 12 },
    });
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onSelectRoute={onSelectRoute}
        onSelectStop={onSelectStop}
        commandOpen={commandOpen}
        onCommandOpenChange={setCommandOpen}
      />

      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          routes={ROUTES}
          visibleRouteIds={visibleRouteIds}
          onToggleVisible={onToggleVisible}
          onSetVisible={onSetVisible}
          selectedRouteId={selectedRouteId}
          onSelectRoute={onSelectRoute}
          onlyOperatingNow={onlyOperatingNow}
          onToggleOnlyOperatingNow={() => setOnlyOperatingNow((v) => !v)}
          onOpenSources={() => {
            closeDetailPanels();
            setLayersOpen(false);
            setActiveTool(null);
            setSourcesOpen(true);
            closeSidebarOnMobile();
          }}
          onOpenAnalysis={() => {
            closeDetailPanels();
            setSourcesOpen(false);
            setLayersOpen(false);
            setActiveTool('cobertura');
            closeSidebarOnMobile();
          }}
        />

        <main className="relative flex-1">
          <ConceMap
            theme={theme}
            routes={ROUTES}
            visibleRouteIds={visibleIdsAfterTypeFilter}
            selectedRouteId={selectedRouteId}
            selectedStopId={selectedStopId}
            onSelectRoute={onSelectRoute}
            onSelectStop={onSelectStop}
            flyToToken={flyToToken}
            terminals={TERMINALS}
            selectedTerminalId={selectedTerminalId}
            onSelectTerminal={onSelectTerminal}
            paraderos={GTFS_STOPS}
            selectedParaderoId={selectedParaderoId}
            onSelectParadero={onSelectParadero}
            pois={POIS}
            selectedPoiId={selectedPoiId}
            onSelectPoi={onSelectPoi}
            airQuality={airQuality.stations}
            layerVisibility={{
              terminals: showTerminals,
              paraderos: showParaderos,
              pois: showPois,
              airQuality: showAirQuality,
              coverage: showCoverage,
              cycleways: showCycleways,
              greenspace: showGreenspace,
              schools: showSchools,
              interurbanCorridors: showInterurbanCorridors,
            }}
            pickerMode={pickerMode}
            onPickPoint={onPickPoint}
            plannerOrigin={plannerOrigin}
            plannerDestination={plannerDestination}
            routeColorById={routeColorById}
            routeLabelById={routeLabelById}
            onSelectSimulatedVehicle={onSelectSimulatedVehicle}
            live={liveArrivals}
            liveServices={liveServices}
            panelOpen={!!sheetKind || sourcesOpen || !!activeTool || layersOpen}
            coverageThreshold={coverageThreshold}
            coverageRetryKey={coverageRetryKey}
            coverageLoadStatus={coverageLayer.controls}
            cyclewaysRetryKey={cyclewaysRetryKey}
            cyclewaysLoadStatus={cyclewaysLayer.controls}
            greenspaceRetryKey={greenspaceRetryKey}
            greenspaceLoadStatus={greenspaceLayer.controls}
            schoolsRetryKey={schoolsRetryKey}
            schoolsLoadStatus={schoolsLayer.controls}
            onBoundsChange={setMapBounds}
            plannerMidpoint={plannerMidpoint}
          />

          <MapLayerControl
            terminalsCount={TERMINALS.length}
            paraderosCount={GTFS_STOPS.length}
            poisCount={POIS.length}
            visibility={{
              terminals: showTerminals,
              paraderos: showParaderos,
              pois: showPois,
              airQuality: showAirQuality,
              simulatedVehicles: showSimulatedVehicles,
              coverage: showCoverage,
              cycleways: showCycleways,
              greenspace: showGreenspace,
              schools: showSchools,
              interurbanCorridors: showInterurbanCorridors,
            }}
            simulationScope={simulationScope}
            onToggleTerminals={() => setShowTerminals((v) => !v)}
            onToggleParaderos={() => setShowParaderos((v) => !v)}
            onTogglePois={() => setShowPois((v) => !v)}
            onToggleAirQuality={() => setShowAirQuality((v) => !v)}
            onToggleSimulatedVehicles={() => setShowSimulatedVehicles((v) => !v)}
            onSetSimulationScope={setSimulationScope}
            coverageThreshold={coverageThreshold}
            onToggleCoverage={() => setShowCoverage((v) => !v)}
            onSetCoverageThreshold={setCoverageThreshold}
            onToggleCycleways={() => setShowCycleways((v) => !v)}
            onToggleGreenspace={() => setShowGreenspace((v) => !v)}
            onToggleSchools={() => setShowSchools((v) => !v)}
            onToggleInterurbanCorridors={() => setShowInterurbanCorridors((v) => !v)}
            airQualityStatus={airQuality}
            onRetryAirQuality={() => setAirQualityRetryKey((v) => v + 1)}
            simulationStatus={simulationStatus}
            onRetrySimulation={() => setSimulationRetryKey((v) => v + 1)}
            coverageStatus={coverageLayer.status}
            cyclewaysStatus={cyclewaysLayer.status}
            greenspaceStatus={greenspaceLayer.status}
            schoolsStatus={schoolsLayer.status}
            onRetryCoverage={() => setCoverageRetryKey((v) => v + 1)}
            onRetryCycleways={() => setCyclewaysRetryKey((v) => v + 1)}
            onRetryGreenspace={() => setGreenspaceRetryKey((v) => v + 1)}
            onRetrySchools={() => setSchoolsRetryKey((v) => v + 1)}
            layersOpen={layersOpen}
            onToggleLayers={toggleLayers}
            onCloseLayers={() => setLayersOpen(false)}
            onRecenter={onRecenterMap}
            onOpenTool={toggleTool}
            activeTool={activeTool}
          />

          {!sheetKind && !sourcesOpen && !activeTool && !layersOpen && (
            <div className="pointer-events-none absolute left-2 top-2 z-10 animate-fade-in md:left-3 md:top-3">
              <WelcomeCard
                routesCount={ROUTES.length}
                stopsCount={GTFS_STOPS.length}
                onSearch={() => setCommandOpen(true)}
                onShowStops={onShowStopsNearCenter}
              />
            </div>
          )}

          {/* Legend hides on mobile when a tool panel is open (bottom-anchored,
              would overlap). On desktop both can coexist (sidebar/legend left,
              tool panel right) so we keep it visible. */}
          <div
            className={cn(
              'pointer-events-none absolute bottom-10 left-2 z-10 md:bottom-6 md:left-3',
              (sheetKind || sourcesOpen || activeTool || layersOpen) && 'hidden md:block',
            )}
          >
            <MapLegend
              routes={legendRoutes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={onSelectRoute}
            />
          </div>

          {activeTool && (
            <LazyBoundary onError={() => setActiveTool(null)}>
              <FloatingToolsPanel
                tool={activeTool}
                onClose={() => setActiveTool(null)}
                plannerOrigin={plannerOrigin}
                plannerDestination={plannerDestination}
                pickerMode={pickerMode}
                plannerMatches={plannerMatches}
                matchesAvailable={visibleRouteIds.length > 0}
                onPickOrigin={() => setPickerMode('origin')}
                onPickDestination={() => setPickerMode('destination')}
                onClearPlanner={onClearPlanner}
                onSelectRoute={onSelectRoute}
                onShowOperatorRoutes={onShowOperatorRoutes}
                visibleRouteIds={visibleRouteIds}
                mapBounds={mapBounds}
                theme={theme}
                simulationScope={simulationScope}
                activeMapLayers={{
                  paraderos: showParaderos,
                  terminales: showTerminals,
                  pois: showPois,
                  coverage: showCoverage,
                  cycleways: showCycleways,
                  greenspace: showGreenspace,
                  schools: showSchools,
                  simulated: showSimulatedVehicles,
                }}
                plannerMidpoint={plannerMidpoint}
                plannerMidpointLoading={plannerMidpointLoading}
                plannerMidpointError={plannerMidpointError}
                onComputeMidpoint={onComputeMidpoint}
                onClearMidpoint={clearMidpointState}
              />
            </LazyBoundary>
          )}
        </main>
      </div>

      <LazyBoundary onError={closeSheet}>
        {sheetKind === 'route' && (
          <RouteDetailSheet
            open={sheetKind === 'route'}
            route={selectedRoute}
            directionId={selectedDetail?.directionId}
            onPickDirection={onPickRouteDirection}
            onOpenChange={(o) => (!o ? closeSheet() : undefined)}
            onFocusRoute={onFocusRoute}
            onDeselectRoute={closeSheet}
            onSelectStop={onSelectStop}
          />
        )}
        {(sheetKind === 'stop' || sheetKind === 'paradero') && (
          <StopDetailSheet
            open
            stop={sheetKind === 'stop' ? selectedStop : selectedParaderoStop}
            live={liveArrivals}
            onOpenChange={(o) => (!o ? closeSheet() : undefined)}
            onSelectRoute={onSelectRoute}
            onUseAsOrigin={onUsePointAsOrigin}
            onUseAsDestination={onUsePointAsDestination}
          />
        )}
        {sheetKind === 'terminal' && (
          <TerminalDetailSheet
            open={sheetKind === 'terminal'}
            terminal={selectedTerminal}
            onOpenChange={(o) => (!o ? closeSheet() : undefined)}
            onFocus={onFocusTerminal}
          />
        )}
        {sheetKind === 'poi' && (
          <PoiDetailSheet
            open={sheetKind === 'poi'}
            poi={selectedPoi}
            onOpenChange={(o) => (!o ? closeSheet() : undefined)}
            onFocus={onFocusPoi}
            onSelectRoute={onSelectRoute}
          />
        )}
        {sourcesOpen && <DataSourcesSheet open onOpenChange={setSourcesOpen} />}
      </LazyBoundary>
    </div>
  );
}
