import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { ConceMap } from '@/components/conce-map';
import { Header } from '@/components/header';
import { RouteDetailSheet } from '@/components/route-detail-sheet';
import { Sidebar } from '@/components/sidebar';
import { StopDetailSheet } from '@/components/stop-detail-sheet';
import { TerminalDetailSheet } from '@/components/terminal-detail-sheet';
import { DataSourcesSheet } from '@/components/data-sources-sheet';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import { DEFAULT_VISIBLE_ROUTE_IDS, ROUTES, ROUTE_TYPES, STOPS } from '@/data/routes';
import { TERMINALS } from '@/data/terminals.generated';
import { PARADEROS } from '@/data/paraderos.generated';
import { useTheme } from '@/hooks/use-theme';
import { readUrlState, useSyncUrlState } from '@/hooks/use-url-state';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import type { FlyToToken, RouteTypeId, SheetKind } from '@/types/transport';

const INITIAL_URL = readUrlState();

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        : null;

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(INITIAL_URL.route);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(INITIAL_URL.stop);
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(INITIAL_URL.terminal);
  const [sheetKind, setSheetKind] = useState<SheetKind>(initialSheet);

  const [showTerminals, setShowTerminals] = useState(true);
  const [showParaderos, setShowParaderos] = useState(INITIAL_URL.paraderos);
  const [onlyOperatingNow, setOnlyOperatingNow] = useState(INITIAL_URL.activos);

  const [flyToToken, setFlyToToken] = useState<FlyToToken | null>(null);

  const [sourcesOpen, setSourcesOpen] = useState(false);

  useSyncUrlState({
    route: selectedRouteId,
    stop: selectedStopId,
    terminal: selectedTerminalId,
    paraderos: showParaderos,
    activos: onlyOperatingNow,
  });

  // Apply the initial fly-to once the map is mounted.
  useEffect(() => {
    if (INITIAL_URL.route) {
      const r = ROUTES.find((x) => x.id === INITIAL_URL.route);
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
    }
  }, []);

  const selectedRoute = useMemo(
    () => ROUTES.find((r) => r.id === selectedRouteId) ?? null,
    [selectedRouteId],
  );
  const selectedStop = useMemo(
    () => STOPS.find((s) => s.id === selectedStopId) ?? null,
    [selectedStopId],
  );
  const selectedTerminal = useMemo(
    () => TERMINALS.find((t) => t.id === selectedTerminalId) ?? null,
    [selectedTerminalId],
  );

  const visibleIdsAfterTypeFilter = useMemo(() => {
    return visibleRouteIds.filter((id) => {
      const r = ROUTES.find((x) => x.id === id);
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

  const onSelectRoute = useCallback((id: string) => {
    const r = ROUTES.find((x) => x.id === id);
    if (!r) return;
    setVisibleRouteIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
    setTypeFilters((f) => ({ ...f, [r.type]: true }));
    setSelectedRouteId(id);
    setSelectedStopId(null);
    setSelectedTerminalId(null);
    setSheetKind('route');
    setFlyToToken({ key: Date.now(), target: { kind: 'bounds', path: r.path } });
  }, []);

  const onSelectStop = useCallback((id: string) => {
    const s = STOPS.find((x) => x.id === id);
    if (!s) return;
    setSelectedStopId(id);
    setSelectedTerminalId(null);
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
    setSheetKind('terminal');
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: t.lat, lng: t.lng, zoom: 16 },
    });
  }, []);

  const onSelectParadero = useCallback((id: string) => {
    const p = PARADEROS.find((x) => x.id === id);
    if (!p) return;
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: p.lat, lng: p.lng, zoom: 17 },
    });
  }, []);

  const closeSheet = useCallback(() => {
    setSheetKind(null);
    setSelectedRouteId(null);
    setSelectedStopId(null);
    setSelectedTerminalId(null);
  }, []);

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
          routes={ROUTES}
          visibleRouteIds={visibleRouteIds}
          onToggleVisible={onToggleVisible}
          selectedRouteId={selectedRouteId}
          onSelectRoute={onSelectRoute}
          typeFilters={typeFilters}
          onToggleType={onToggleType}
          onSetAllByType={onSetAllByType}
          onSetAllByOperator={onSetAllByOperator}
          terminalsCount={TERMINALS.length}
          paraderosCount={PARADEROS.length}
          showTerminals={showTerminals}
          showParaderos={showParaderos}
          onToggleTerminals={() => setShowTerminals((v) => !v)}
          onToggleParaderos={() => setShowParaderos((v) => !v)}
          onlyOperatingNow={onlyOperatingNow}
          onToggleOnlyOperatingNow={() => setOnlyOperatingNow((v) => !v)}
          onOpenSources={() => setSourcesOpen(true)}
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
            paraderos={PARADEROS}
            showParaderos={showParaderos}
            onSelectParadero={onSelectParadero}
          />

          {!sheetKind && (
            <div className="pointer-events-none absolute left-3 top-3 z-10 animate-fade-in">
              <Card className="pointer-events-auto max-w-[260px] border-border/80 backdrop-blur supports-[backdrop-filter]:bg-background/85">
                <CardHeader className="space-y-1 p-3">
                  <CardTitle className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    Concepción · Biobío
                  </CardTitle>
                  <CardDescription className="text-[12px] leading-snug text-foreground">
                    Toca una línea, paradero o terminal. Usa <Kbd>⌘</Kbd> <Kbd>K</Kbd> para
                    buscar. Activa <span className="font-medium">Paraderos OSM</span> en la
                    barra para ver los ~1.7k paraderos urbanos.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          <div className="pointer-events-none absolute bottom-4 left-3 z-10">
            <div className="pointer-events-auto max-h-[40vh] overflow-y-auto thin-scroll rounded-md border bg-background/90 px-3 py-2 text-[11px] shadow-sm backdrop-blur">
              <div className="mb-1 font-medium uppercase tracking-wider text-muted-foreground">
                Leyenda · {visibleIdsAfterTypeFilter.length} visible
                {visibleIdsAfterTypeFilter.length === 1 ? '' : 's'}
              </div>
              <div className="flex flex-col gap-1">
                {ROUTES.filter((r) => visibleIdsAfterTypeFilter.includes(r.id))
                  .slice(0, 12)
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
        </main>
      </div>

      <RouteDetailSheet
        open={sheetKind === 'route'}
        route={selectedRoute}
        onOpenChange={(o) => (!o ? closeSheet() : undefined)}
        onFocusRoute={onFocusRoute}
        onSelectStop={onSelectStop}
      />
      <StopDetailSheet
        open={sheetKind === 'stop'}
        stop={selectedStop}
        onOpenChange={(o) => (!o ? closeSheet() : undefined)}
        onSelectRoute={onSelectRoute}
      />
      <TerminalDetailSheet
        open={sheetKind === 'terminal'}
        terminal={selectedTerminal}
        onOpenChange={(o) => (!o ? closeSheet() : undefined)}
        onFocus={onFocusTerminal}
      />
      <DataSourcesSheet open={sourcesOpen} onOpenChange={setSourcesOpen} />
    </div>
  );
}
