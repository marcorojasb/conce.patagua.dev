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
import { useSimulatedVehicles } from '@/realtime/use-simulated-vehicles';
import { findRoutes } from '@/lib/planner';
import { routeBetween, type RoutingResult } from '@/lib/routing';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import { DEFAULT_VISIBLE_ROUTE_IDS, ROUTES, ROUTES_BY_ID, ROUTE_TYPES, STOPS } from '@/data/routes';
import { TERMINALS } from '@/data/terminals.generated';
import { GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { POIS } from '@/data/pois.generated';
import { useAirQuality } from '@/hooks/use-air-quality';
import { useTheme } from '@/hooks/use-theme';
import { readUrlState, useSyncUrlState } from '@/hooks/use-url-state';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import { cn } from '@/lib/utils';
import type { FlyToToken, Route, RouteTypeId, SheetKind } from '@/types/transport';

const INITIAL_URL = readUrlState();

export default function App() {
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

  const [showTerminals, setShowTerminals] = useState(true);
  const [showParaderos, setShowParaderos] = useState(INITIAL_URL.paraderos);
  const [showPois, setShowPois] = useState(INITIAL_URL.pois);
  const [showAirQuality, setShowAirQuality] = useState(INITIAL_URL.aire);
  const [onlyOperatingNow, setOnlyOperatingNow] = useState(INITIAL_URL.activos);

  const airQuality = useAirQuality(showAirQuality);

  const [plannerOrigin, setPlannerOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [plannerDestination, setPlannerDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [pickerMode, setPickerMode] = useState<'origin' | 'destination' | null>(null);

  const plannerMatches = useMemo(() => {
    if (!plannerOrigin || !plannerDestination) return [];
    const visible: Route[] = [];
    for (const id of visibleRouteIds) {
      const r = ROUTES_BY_ID.get(id);
      if (r) visible.push(r);
    }
    const pool = visible.length > 0 ? visible : ROUTES;
    return findRoutes(
      [plannerOrigin.lat, plannerOrigin.lng],
      [plannerDestination.lat, plannerDestination.lng],
      pool,
    );
  }, [plannerOrigin, plannerDestination, visibleRouteIds]);

  const onPickPoint = useCallback(
    (latlng: { lat: number; lng: number }) => {
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

  // Walking midpoint between A and B, fetched from OSRM. Path + marker live
  // here so the user can close the analysis sheet and still see them on the
  // map. Any change to A or B invalidates the cached result.
  const [plannerMidpoint, setPlannerMidpoint] = useState<RoutingResult | null>(null);
  const [plannerMidpointLoading, setPlannerMidpointLoading] = useState(false);
  const [plannerMidpointError, setPlannerMidpointError] = useState<string | null>(null);
  const midpointAbortRef = useRef<AbortController | null>(null);

  const clearMidpointState = useCallback(() => {
    midpointAbortRef.current?.abort();
    midpointAbortRef.current = null;
    setPlannerMidpoint(null);
    setPlannerMidpointLoading(false);
    setPlannerMidpointError(null);
  }, []);

  const onClearPlanner = useCallback(() => {
    setPlannerOrigin(null);
    setPlannerDestination(null);
    setPickerMode(null);
    clearMidpointState();
  }, [clearMidpointState]);

  // Invalidate midpoint when either endpoint moves — the previous path is
  // stale immediately, no point keeping it around.
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

  const [showSimulatedVehicles, setShowSimulatedVehicles] = useState(false);

  // Pool of routes the simulator can project vehicles for. We feed all
  // micro routes (Biotrén doesn't have GTFS schedule data in the feed).
  const simulationRoutes = useMemo(
    () =>
      ROUTES.filter((r) => r.type === 'micro').map((r) => ({
        id: r.id,
        color: r.color,
        path: r.path,
      })),
    [],
  );
  const routeColorById = useMemo(
    () => new Map(ROUTES.map((r) => [r.id, r.color])),
    [],
  );
  const { vehicles: simulatedVehicles, loading: simulationLoading } = useSimulatedVehicles({
    enabled: showSimulatedVehicles,
    routes: simulationRoutes,
    intervalMs: 4000,
  });

  // Clicking a simulated vehicle pops the underlying route's detail sheet —
  // saves us building a parallel "vehicle sheet" UI when the natural thing
  // to know is which route the projected bus belongs to.
  const onSelectSimulatedVehicle = useCallback(
    (vehicleId: string) => {
      const routeId = vehicleId.split('|')[0];
      if (routeId) onSelectRoute(routeId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [showCoverage, setShowCoverage] = useState(false);
  const [coverageThreshold, setCoverageThreshold] = useState<'all' | 'underserved'>('all');
  const [coverageLoading, setCoverageLoading] = useState(false);

  // Last viewport reported by the map. Used by the wallpaper exporter so the
  // "vista actual" mode captures exactly what the user is looking at.
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null);

  const [flyToToken, setFlyToToken] = useState<FlyToToken | null>(null);

  const [sourcesOpen, setSourcesOpen] = useState(false);
  // Single active tool — null means no panel is open. Floating, non-modal:
  // the user can keep interacting with the map while a tool is on screen.
  const [activeTool, setActiveTool] = useState<AnalysisTab | null>(null);

  // Toolbar button behavior: click same tool = close; different = switch.
  const toggleTool = useCallback((t: AnalysisTab) => {
    setActiveTool((cur) => (cur === t ? null : t));
  }, []);

  const onShowOperatorRoutes = useCallback(
    (operator: string) => {
      onSetAllByOperator(operator, true);
      setActiveTool(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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
    if (INITIAL_URL.route) {
      const r = ROUTES_BY_ID.get(INITIAL_URL.route);
      if (r) setFlyToToken({ key: Date.now(), target: { kind: 'bounds', path: r.path } });
      return;
    }
    if (INITIAL_URL.stop) {
      const s = STOPS.find((x) => x.id === INITIAL_URL.stop);
      if (s) {
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
        setFlyToToken({
          key: Date.now(),
          target: { kind: 'point', lat: p.lat, lng: p.lng, zoom: 16 },
        });
      }
    }
  }, []);

  const selectedRoute = useMemo(
    () => (selectedRouteId ? ROUTES_BY_ID.get(selectedRouteId) ?? null : null),
    [selectedRouteId],
  );
  const selectedStop = useMemo(
    () => STOPS.find((s) => s.id === selectedStopId) ?? null,
    [selectedStopId],
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
  }, [visibleRouteIds, typeFilters, onlyOperatingNow]);

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
  }, []);

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
  }, []);

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

  const onUseParaderoAsOrigin = useCallback((point: { lat: number; lng: number }) => {
    setPlannerOrigin(point);
    setPickerMode(plannerDestination ? null : 'destination');
  }, [plannerDestination]);

  const onUseParaderoAsDestination = useCallback((point: { lat: number; lng: number }) => {
    setPlannerDestination(point);
    setPickerMode(plannerOrigin ? null : 'origin');
  }, [plannerOrigin]);

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
          onOpenAnalysis={() => setActiveTool('cobertura')}
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
            onSelectSimulatedVehicle={onSelectSimulatedVehicle}
            showCoverage={showCoverage}
            coverageThreshold={coverageThreshold}
            onCoverageLoadingChange={setCoverageLoading}
            onBoundsChange={setMapBounds}
            plannerMidpoint={plannerMidpoint}
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
            onToggleTerminals={() => setShowTerminals((v) => !v)}
            onToggleParaderos={() => setShowParaderos((v) => !v)}
            onTogglePois={() => setShowPois((v) => !v)}
            onToggleAirQuality={() => setShowAirQuality((v) => !v)}
            onToggleSimulatedVehicles={() => setShowSimulatedVehicles((v) => !v)}
            showCoverage={showCoverage}
            coverageThreshold={coverageThreshold}
            onToggleCoverage={() => setShowCoverage((v) => !v)}
            onSetCoverageThreshold={setCoverageThreshold}
            airQualityStatus={airQuality}
            simulationStatus={{
              count: simulatedVehicles.length,
              loading: simulationLoading,
            }}
            coverageStatus={{ loading: coverageLoading }}
            onRecenter={onRecenterMap}
            onOpenTool={toggleTool}
            activeTool={activeTool}
          />

          {!sheetKind && !activeTool && (
            <div className="pointer-events-none absolute left-2 top-2 z-10 animate-fade-in md:left-3 md:top-3">
              <Card className="pointer-events-auto max-w-[220px] border-border/80 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:max-w-[260px]">
                <CardHeader className="space-y-1 p-3">
                  <CardTitle className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    Concepción · Biobío
                  </CardTitle>
                  <CardDescription className="text-[12px] leading-snug text-foreground">
                    Visor técnico de recorridos, paraderos, terminales y capas urbanas.
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
              activeTool && 'hidden md:block',
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
        onUseAsOrigin={onUseParaderoAsOrigin}
        onUseAsDestination={onUseParaderoAsDestination}
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
