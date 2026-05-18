import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { ConceMap } from '@/components/conce-map';
import { Header } from '@/components/header';
import { MapLayerControl } from '@/components/map-layer-control';
import { ParaderoDetailSheet } from '@/components/paradero-detail-sheet';
import { RouteDetailSheet } from '@/components/route-detail-sheet';
import { Sidebar } from '@/components/sidebar';
import { StopDetailSheet } from '@/components/stop-detail-sheet';
import { TerminalDetailSheet } from '@/components/terminal-detail-sheet';
import { PoiDetailSheet } from '@/components/poi-detail-sheet';
import { DataSourcesSheet } from '@/components/data-sources-sheet';
import { FloatingToolsPanel, type AnalysisTab } from '@/components/floating-tools-panel';
import { STATIC_SERVICE_PATTERNS } from '@/data/static-service-patterns';
import { useSimulatedVehicles } from '@/realtime/use-simulated-vehicles';
import type { SimulationRouteInput } from '@/realtime/simulated-vehicles';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import { DEFAULT_VISIBLE_ROUTE_IDS, ROUTES, ROUTES_BY_ID, ROUTE_TYPES, STOPS, useRoutesVersion } from '@/data/routes';
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
import { cn } from '@/lib/utils';
import { CORRIDOR_BY_ID } from '@/data/interurban-corridors';
import type { FlyToToken, Route, RouteTypeId, SheetKind } from '@/types/transport';

const INITIAL_URL = readUrlState();
// `?focus=<kind>:<id>` puede venir desde el wiki (`<MapLink>`). Lo leemos
// una sola vez al iniciar; el visor lo aplica como un flyTo + activación
// de capas, y `clearFocusParam` lo retira del query string para que la
// URL siga limpia mientras el usuario navega.
const INITIAL_FOCUS = readFocusParam();
type SimulationScope = 'visible' | 'all';

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
    if (INITIAL_URL.route && !DEFAULT_VISIBLE_ROUTE_IDS.includes(INITIAL_URL.route)) {
      return [...DEFAULT_VISIBLE_ROUTE_IDS, INITIAL_URL.route];
    }
    return DEFAULT_VISIBLE_ROUTE_IDS;
  });
  const [typeFilters, setTypeFilters] = useState<Record<RouteTypeId, boolean>>(() =>
    Object.fromEntries(
      (Object.keys(ROUTE_TYPES) as RouteTypeId[]).map((k) => [k, true]),
    ) as Record<RouteTypeId, boolean>,
  );

  const initialSheet: SheetKind = INITIAL_URL.route
    ? 'route'
    : INITIAL_URL.stop
      ? 'stop'
      : INITIAL_URL.terminal
        ? 'terminal'
        : INITIAL_URL.poi
          ? 'poi'
          : null;

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(INITIAL_URL.route);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(INITIAL_URL.stop);
  const [selectedParaderoId, setSelectedParaderoId] = useState<string | null>(null);
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(INITIAL_URL.terminal);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(INITIAL_URL.poi);
  const [sheetKind, setSheetKind] = useState<SheetKind>(initialSheet);

  const [showTerminals, setShowTerminals] = useState(false);
  const [showParaderos, setShowParaderos] = useState(INITIAL_URL.paraderos);
  const [showPois, setShowPois] = useState(INITIAL_URL.pois);
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

  // Pool of routes the simulator can project vehicles for. GTFS urban
  // services keep their original route id; Biotrén/interurban services use
  // directional static patterns with explicit source/confidence metadata.
  const simulationRoutes = useMemo<SimulationRouteInput[]>(() => {
    const visibleSimulationRouteIds = new Set(visibleRouteIds);
    const gtfsRoutes: SimulationRouteInput[] = ROUTES.filter(
      (r) =>
        r.type === 'micro' &&
        r.id.startsWith('gtfs-route-') &&
        (simulationScope === 'all' || visibleSimulationRouteIds.has(r.id)),
    ).map((r) => ({
      id: r.id,
      routeId: r.id,
      color: r.color,
      path: r.path,
      sourceKind: 'gtfs',
      confidence: 'official',
      sourceLabel: 'GTFS Gran Concepción',
    }));
    const staticRoutes: SimulationRouteInput[] = STATIC_SERVICE_PATTERNS.flatMap((pattern) => {
      if (simulationScope === 'visible' && !visibleSimulationRouteIds.has(pattern.routeId)) {
        return [];
      }
      const route = ROUTES_BY_ID.get(pattern.routeId);
      if (!route) return [];
      return [
        {
          id: pattern.id,
          routeId: pattern.routeId,
          color: route.color,
          path: pattern.direction === 'reverse' ? [...route.path].reverse() : route.path,
          directionLabel: pattern.directionLabel,
          sourceKind: pattern.sourceKind,
          confidence: pattern.confidence,
          sourceLabel: pattern.sourceLabel,
          sourceUrl: pattern.sourceUrl,
          note: pattern.note,
        },
      ];
    });
    return [...gtfsRoutes, ...staticRoutes];
  }, [routesVersion, simulationScope, visibleRouteIds]);
  const routeColorById = useMemo(
    () => new Map(ROUTES.map((r) => [r.id, r.color])),
    [routesVersion],
  );
  const routeLabelById = useMemo(
    () => new Map(ROUTES.map((r) => [r.id, `${r.code} · ${r.name}`])),
    [routesVersion],
  );
  const {
    vehicles: simulatedVehicles,
    loading: simulationLoading,
    error: simulationError,
    lastUpdate: simulationLastUpdate,
  } = useSimulatedVehicles({
    enabled: showSimulatedVehicles,
    routes: simulationRoutes,
    retryKey: simulationRetryKey,
    intervalMs: 1000,
  });
  const simulatedNonGtfsCount = useMemo(
    () => simulatedVehicles.filter((v) => v.sourceKind !== 'gtfs').length,
    [simulatedVehicles],
  );

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
  // inmediatamente — el usuario llegó desde el wiki y espera ver el pin.
  const [showInterurbanCorridors, setShowInterurbanCorridors] = useState(
    INITIAL_FOCUS?.kind === 'corridor',
  );

  // Last viewport reported by the map. Used by the wallpaper exporter so the
  // "vista actual" mode captures exactly what the user is looking at.
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null);

  const [flyToToken, setFlyToToken] = useState<FlyToToken | null>(null);
  const initialFlyAppliedRef = useRef(false);

  const [sourcesOpen, setSourcesOpen] = useState(false);
  // Single active tool — null means no panel is open. Floating, non-modal:
  // the user can keep interacting with the map while a tool is on screen.
  const [activeTool, setActiveTool] = useState<AnalysisTab | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);

  // Toolbar button behavior: click same tool = close; different = switch.
  const toggleTool = useCallback((t: AnalysisTab) => {
    setLayersOpen(false);
    setActiveTool((cur) => (cur === t ? null : t));
  }, []);

  const toggleLayers = useCallback(() => {
    setLayersOpen((cur) => {
      const next = !cur;
      if (next) setActiveTool(null);
      return next;
    });
  }, []);

  useSyncUrlState({
    route: selectedRouteId,
    stop: selectedStopId,
    terminal: selectedTerminalId,
    poi: selectedPoiId,
    paraderos: showParaderos,
    activos: onlyOperatingNow,
    pois: showPois,
    aire: showAirQuality,
  });

  // Apply the initial fly-to once the map is mounted.
  useEffect(() => {
    if (initialFlyAppliedRef.current) return;
    // 1) Deep link tradicional (?route= / ?stop= / etc.) — toma prioridad
    //    porque ya selecciona la sheet correspondiente.
    if (INITIAL_URL.route) {
      const r = ROUTES_BY_ID.get(INITIAL_URL.route);
      if (!r) return;
      initialFlyAppliedRef.current = true;
      setFlyToToken({ key: Date.now(), target: { kind: 'bounds', path: r.path } });
      return;
    }
    if (INITIAL_URL.stop) {
      const s = STOPS.find((x) => x.id === INITIAL_URL.stop);
      if (s) {
        initialFlyAppliedRef.current = true;
        setFlyToToken({
          key: Date.now(),
          target: { kind: 'point', lat: s.lat, lng: s.lng, zoom: 16 },
        });
      }
      return;
    }
    if (INITIAL_URL.terminal) {
      const t = TERMINALS.find((x) => x.id === INITIAL_URL.terminal);
      if (t) {
        initialFlyAppliedRef.current = true;
        setFlyToToken({
          key: Date.now(),
          target: { kind: 'point', lat: t.lat, lng: t.lng, zoom: 16 },
        });
      }
      return;
    }
    if (INITIAL_URL.poi) {
      const p = POIS.find((x) => x.id === INITIAL_URL.poi);
      if (p) {
        initialFlyAppliedRef.current = true;
        setFlyToToken({
          key: Date.now(),
          target: { kind: 'point', lat: p.lat, lng: p.lng, zoom: 16 },
        });
      }
      return;
    }
    // 2) `?focus=<kind>:<id>` — viene desde el wiki vía `<MapLink>`. Limpiamos
    //    el parámetro de la URL después de aplicarlo: el visor mantiene su
    //    propia sincronización por entidad (route/stop/…) y `focus` no
    //    necesita persistir.
    if (INITIAL_FOCUS) {
      if (!applyFocus(INITIAL_FOCUS)) return;
      clearFocusParam();
      initialFlyAppliedRef.current = true;
      return;
    }
    initialFlyAppliedRef.current = true;
  }, [routesVersion, applyFocus]);

  // Resolver de focus deep-links provenientes del wiki. Cubre:
  //   - route   → si el código (route.code) está cargado, abre la sheet
  //               y enfoca el shape. Útil si en el futuro el GTFS urbano
  //               incluye un servicio que el wiki documenta.
  //   - corridor → enciende la capa interurbana, centra el pin del corredor
  //                y abre su popup automáticamente sería ideal — el popup
  //                lo abre el usuario; nosotros enfocamos el área entre
  //                terminal y anchor.
  //   - terminal → reutiliza onSelectTerminal.
  //   - stop    → reutiliza onSelectStop.
  //   - poi     → reutiliza onSelectPoi.
  function applyFocus(focus: { kind: string; id: string }): boolean {
    if (focus.kind === 'route') {
      // Buscar por route.id O por route.code (ambos son IDs estables que
      // un autor de wiki podría usar). route.id es de la forma `gtfs-route-NNNN`,
      // route.code es la sigla mostrada al usuario.
      const direct = ROUTES_BY_ID.get(focus.id);
      const r = direct ?? ROUTES.find((x) => x.code === focus.id);
      if (!r) return false;
      onSelectRoute(r.id);
      return true;
    }
    if (focus.kind === 'corridor') {
      const c = CORRIDOR_BY_ID.get(focus.id);
      if (!c) return false;
      setShowInterurbanCorridors(true);
      // Enfocar el área del corredor — si conocemos los dos extremos,
      // bounds; si solo el anchor, point con zoom regional.
      if (c.terminal) {
        setFlyToToken({
          key: Date.now(),
          target: { kind: 'bounds', path: [c.terminal, c.anchor] },
        });
      } else {
        setFlyToToken({
          key: Date.now(),
          target: { kind: 'point', lat: c.anchor[0], lng: c.anchor[1], zoom: 11 },
        });
      }
      return true;
    }
    if (focus.kind === 'terminal') {
      onSelectTerminal(focus.id);
      return true;
    }
    if (focus.kind === 'stop') {
      onSelectStop(focus.id);
      return true;
    }
    if (focus.kind === 'poi') {
      onSelectPoi(focus.id);
      return true;
    }
    return false;
  }

  const selectedRoute = useMemo(
    () => (selectedRouteId ? ROUTES_BY_ID.get(selectedRouteId) ?? null : null),
    [selectedRouteId, routesVersion],
  );
  const selectedStop = useMemo(
    () => STOPS.find((s) => s.id === selectedStopId) ?? null,
    [selectedStopId, routesVersion],
  );
  const selectedParadero = useMemo(
    () => GTFS_STOPS.find((p) => p.id === selectedParaderoId) ?? null,
    [selectedParaderoId],
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
    return visibleRouteIds.filter((id) => {
      const r = ROUTES_BY_ID.get(id);
      if (!r) return false;
      if (!typeFilters[r.type]) return false;
      if (onlyOperatingNow && !isRouteOperatingNow(r)) return false;
      return true;
    });
  }, [visibleRouteIds, typeFilters, onlyOperatingNow, routesVersion]);

  const onToggleVisible = useCallback((id: string) => {
    setVisibleRouteIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }, []);

  const onToggleType = useCallback((typeId: RouteTypeId) => {
    setTypeFilters((f) => ({ ...f, [typeId]: !f[typeId] }));
  }, []);

  const onSetAllByType = useCallback((typeId: RouteTypeId, on: boolean) => {
    const idsOfType = new Set(ROUTES.filter((r) => r.type === typeId).map((r) => r.id));
    setVisibleRouteIds((cur) => {
      if (on) {
        const next = new Set(cur);
        for (const id of idsOfType) next.add(id);
        return Array.from(next);
      }
      return cur.filter((id) => !idsOfType.has(id));
    });
    setTypeFilters((f) => ({ ...f, [typeId]: true }));
  }, [routesVersion]);

  const onSetAllByOperator = useCallback((operator: string, on: boolean) => {
    const idsOfOp = new Set(
      ROUTES.filter((r) => r.operator === operator).map((r) => r.id),
    );
    setVisibleRouteIds((cur) => {
      if (on) {
        const next = new Set(cur);
        for (const id of idsOfOp) next.add(id);
        return Array.from(next);
      }
      return cur.filter((id) => !idsOfOp.has(id));
    });
    // Enable the relevant type filter so the operator's routes actually render.
    const firstRoute = ROUTES.find((r) => r.operator === operator);
    if (firstRoute) {
      setTypeFilters((f) => ({ ...f, [firstRoute.type]: true }));
    }
  }, [routesVersion]);

  const onShowOperatorRoutes = useCallback(
    (operator: string) => {
      onSetAllByOperator(operator, true);
      setActiveTool(null);
    },
    [onSetAllByOperator],
  );

  const closeSidebarOnMobile = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(min-width: 768px)').matches) {
      setSidebarOpen(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSheetKind(null);
    setSelectedRouteId(null);
    setSelectedStopId(null);
    setSelectedParaderoId(null);
    setSelectedTerminalId(null);
    setSelectedPoiId(null);
  }, []);

  const onSelectRoute = useCallback(
    (id: string) => {
      if (selectedRouteId === id && sheetKind === 'route') {
        clearSelection();
        return;
      }
      const r = ROUTES_BY_ID.get(id);
      if (!r) return;
      setVisibleRouteIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
      setTypeFilters((f) => ({ ...f, [r.type]: true }));
      setSelectedRouteId(id);
      setSelectedStopId(null);
      setSelectedParaderoId(null);
      setSelectedTerminalId(null);
      setSelectedPoiId(null);
      setSheetKind('route');
      setFlyToToken({ key: Date.now(), target: { kind: 'bounds', path: r.path } });
      closeSidebarOnMobile();
    },
    [clearSelection, closeSidebarOnMobile, selectedRouteId, sheetKind],
  );

  // Clicking a simulated vehicle pops the underlying route's detail sheet —
  // saves us building a parallel "vehicle sheet" UI when the natural thing
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
    setSelectedStopId(id);
    setSelectedParaderoId(null);
    setSelectedTerminalId(null);
    setSelectedPoiId(null);
    setSheetKind('stop');
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: s.lat, lng: s.lng, zoom: 16 },
    });
  }, []);

  const onSelectTerminal = useCallback((id: string) => {
    const t = TERMINALS.find((x) => x.id === id);
    if (!t) return;
    setSelectedTerminalId(id);
    setSelectedRouteId(null);
    setSelectedStopId(null);
    setSelectedParaderoId(null);
    setSelectedPoiId(null);
    setSheetKind('terminal');
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: t.lat, lng: t.lng, zoom: 16 },
    });
  }, []);

  const onSelectPoi = useCallback((id: string) => {
    const p = POIS.find((x) => x.id === id);
    if (!p) return;
    setSelectedPoiId(id);
    setSelectedRouteId(null);
    setSelectedStopId(null);
    setSelectedParaderoId(null);
    setSelectedTerminalId(null);
    setSheetKind('poi');
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: p.lat, lng: p.lng, zoom: 16 },
    });
  }, []);

  const onSelectParadero = useCallback((id: string) => {
    const p = GTFS_STOPS.find((x) => x.id === id);
    if (!p) return;
    setSelectedParaderoId(id);
    setSelectedRouteId(null);
    setSelectedStopId(null);
    setSelectedTerminalId(null);
    setSelectedPoiId(null);
    setSheetKind('paradero');
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: p.lat, lng: p.lng, zoom: 17 },
    });
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
      />

      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          routes={ROUTES}
          visibleRouteIds={visibleRouteIds}
          onToggleVisible={onToggleVisible}
          selectedRouteId={selectedRouteId}
          onSelectRoute={onSelectRoute}
          typeFilters={typeFilters}
          onToggleType={onToggleType}
          onSetAllByType={onSetAllByType}
          onSetAllByOperator={onSetAllByOperator}
          onlyOperatingNow={onlyOperatingNow}
          onToggleOnlyOperatingNow={() => setOnlyOperatingNow((v) => !v)}
          onOpenSources={() => setSourcesOpen(true)}
          onOpenAnalysis={() => {
            setLayersOpen(false);
            setActiveTool('cobertura');
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
            showTerminals={showTerminals}
            selectedTerminalId={selectedTerminalId}
            onSelectTerminal={onSelectTerminal}
            paraderos={GTFS_STOPS}
            showParaderos={showParaderos}
            selectedParaderoId={selectedParaderoId}
            onSelectParadero={onSelectParadero}
            pois={POIS}
            showPois={showPois}
            selectedPoiId={selectedPoiId}
            onSelectPoi={onSelectPoi}
            airQuality={airQuality.stations}
            showAirQuality={showAirQuality}
            pickerMode={pickerMode}
            onPickPoint={onPickPoint}
            plannerOrigin={plannerOrigin}
            plannerDestination={plannerDestination}
            simulatedVehicles={simulatedVehicles}
            routeColorById={routeColorById}
            routeLabelById={routeLabelById}
            onSelectSimulatedVehicle={onSelectSimulatedVehicle}
            showCoverage={showCoverage}
            coverageThreshold={coverageThreshold}
            coverageRetryKey={coverageRetryKey}
            onCoverageStatusChange={coverageLayer.setStatus}
            showCycleways={showCycleways}
            cyclewaysRetryKey={cyclewaysRetryKey}
            onCyclewaysStatusChange={cyclewaysLayer.setStatus}
            showGreenspace={showGreenspace}
            greenspaceRetryKey={greenspaceRetryKey}
            onGreenspaceStatusChange={greenspaceLayer.setStatus}
            showSchools={showSchools}
            schoolsRetryKey={schoolsRetryKey}
            onSchoolsStatusChange={schoolsLayer.setStatus}
            onBoundsChange={setMapBounds}
            plannerMidpoint={plannerMidpoint}
            showInterurbanCorridors={showInterurbanCorridors}
          />

          <MapLayerControl
            terminalsCount={TERMINALS.length}
            paraderosCount={GTFS_STOPS.length}
            poisCount={POIS.length}
            showTerminals={showTerminals}
            showParaderos={showParaderos}
            showPois={showPois}
            showAirQuality={showAirQuality}
            showSimulatedVehicles={showSimulatedVehicles}
            simulationScope={simulationScope}
            onToggleTerminals={() => setShowTerminals((v) => !v)}
            onToggleParaderos={() => setShowParaderos((v) => !v)}
            onTogglePois={() => setShowPois((v) => !v)}
            onToggleAirQuality={() => setShowAirQuality((v) => !v)}
            onToggleSimulatedVehicles={() => setShowSimulatedVehicles((v) => !v)}
            onSetSimulationScope={setSimulationScope}
            showCoverage={showCoverage}
            coverageThreshold={coverageThreshold}
            onToggleCoverage={() => setShowCoverage((v) => !v)}
            onSetCoverageThreshold={setCoverageThreshold}
            showCycleways={showCycleways}
            onToggleCycleways={() => setShowCycleways((v) => !v)}
            showGreenspace={showGreenspace}
            onToggleGreenspace={() => setShowGreenspace((v) => !v)}
            showSchools={showSchools}
            onToggleSchools={() => setShowSchools((v) => !v)}
            showInterurbanCorridors={showInterurbanCorridors}
            onToggleInterurbanCorridors={() => setShowInterurbanCorridors((v) => !v)}
            airQualityStatus={airQuality}
            onRetryAirQuality={() => setAirQualityRetryKey((v) => v + 1)}
            simulationStatus={{
              count: simulatedVehicles.length,
              nonGtfsCount: simulatedNonGtfsCount,
              loading: simulationLoading,
              error: simulationError,
              lastUpdate: simulationLastUpdate,
            }}
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

          {!sheetKind && !activeTool && !layersOpen && (
            <div className="pointer-events-none absolute left-2 top-2 z-10 animate-fade-in md:left-3 md:top-3">
              <Card className="pointer-events-auto max-w-[220px] border-border/80 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:max-w-[260px]">
                <CardHeader className="space-y-1 p-3">
                  <CardTitle className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    Concepción · Biobío
                  </CardTitle>
                  <CardDescription className="text-[12px] leading-snug text-foreground">
                    Capas de transporte público y, próximamente, planificación urbana y
                    servicios para política pública del Gran Concepción.
                    <span className="hidden md:inline">
                      {' '}
                      Usa <Kbd>⌘</Kbd> <Kbd>K</Kbd> para buscar.
                    </span>
                    <span className="mt-2 grid grid-cols-3 gap-1.5">
                      <span className="rounded border bg-background/70 px-1.5 py-1">
                        <span className="block font-mono text-[11px]">171</span>
                        <span className="text-[10px] text-muted-foreground">recorridos</span>
                      </span>
                      <span className="rounded border bg-background/70 px-1.5 py-1">
                        <span className="block font-mono text-[11px]">
                          {GTFS_STOPS.length.toLocaleString('es-CL')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">paraderos</span>
                      </span>
                      <span className="rounded border bg-background/70 px-1.5 py-1">
                        <span className="block font-mono text-[11px]">GTFS</span>
                        <span className="text-[10px] text-muted-foreground">estático</span>
                      </span>
                    </span>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Legend hides on mobile when a tool panel is open (bottom-anchored,
              would overlap). On desktop both can coexist (sidebar/legend left,
              tool panel right) so we keep it visible. */}
          <div
            className={cn(
              'pointer-events-none absolute bottom-10 left-2 z-10 md:bottom-6 md:left-3',
              (activeTool || layersOpen) && 'hidden md:block',
            )}
          >
            <div className="pointer-events-auto max-h-[35vh] overflow-y-auto thin-scroll rounded-md border bg-background/90 px-3 py-2 text-[11px] shadow-sm backdrop-blur md:max-h-[40vh]">
              <div className="mb-1 font-medium uppercase tracking-wider text-muted-foreground">
                Leyenda · {visibleIdsAfterTypeFilter.length} visible
                {visibleIdsAfterTypeFilter.length === 1 ? '' : 's'}
              </div>
              <div className="flex flex-col gap-1">
                {visibleIdsAfterTypeFilter
                  .slice(0, 12)
                  .map((id) => ROUTES_BY_ID.get(id))
                  .filter((r): r is Route => !!r)
                  .map((r) => (
                    <div key={r.id} className="flex items-center gap-2">
                      <span
                        className="inline-block h-[3px] w-5 rounded-full"
                        style={{ background: r.color }}
                      />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {r.code}
                      </span>
                      <span className="max-w-[160px] truncate">
                        {ROUTE_TYPES[r.type].short}
                      </span>
                    </div>
                  ))}
                {visibleIdsAfterTypeFilter.length > 12 && (
                  <div className="pt-1 text-muted-foreground">
                    + {visibleIdsAfterTypeFilter.length - 12} más
                  </div>
                )}
              </div>
            </div>
          </div>

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
            simulatedVehicles={simulatedVehicles}
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
        </main>
      </div>

      <RouteDetailSheet
        open={sheetKind === 'route'}
        route={selectedRoute}
        onOpenChange={(o) => (!o ? closeSheet() : undefined)}
        onFocusRoute={onFocusRoute}
        onDeselectRoute={closeSheet}
        onSelectStop={onSelectStop}
      />
      <StopDetailSheet
        open={sheetKind === 'stop'}
        stop={selectedStop}
        onOpenChange={(o) => (!o ? closeSheet() : undefined)}
        onSelectRoute={onSelectRoute}
      />
      <ParaderoDetailSheet
        open={sheetKind === 'paradero'}
        paradero={selectedParadero}
        onOpenChange={(o) => (!o ? closeSheet() : undefined)}
        onSelectRoute={onSelectRoute}
        onUseAsOrigin={onUsePointAsOrigin}
        onUseAsDestination={onUsePointAsDestination}
      />
      <TerminalDetailSheet
        open={sheetKind === 'terminal'}
        terminal={selectedTerminal}
        onOpenChange={(o) => (!o ? closeSheet() : undefined)}
        onFocus={onFocusTerminal}
      />
      <PoiDetailSheet
        open={sheetKind === 'poi'}
        poi={selectedPoi}
        onOpenChange={(o) => (!o ? closeSheet() : undefined)}
        onFocus={onFocusPoi}
        onSelectRoute={onSelectRoute}
      />
      <DataSourcesSheet open={sourcesOpen} onOpenChange={setSourcesOpen} />
    </div>
  );
}
