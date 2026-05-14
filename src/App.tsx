import { useCallback, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { ConceMap } from '@/components/conce-map';
import { Header } from '@/components/header';
import { RouteDetailSheet } from '@/components/route-detail-sheet';
import { Sidebar } from '@/components/sidebar';
import { StopDetailSheet } from '@/components/stop-detail-sheet';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import { ROUTES, ROUTE_TYPES, STOPS } from '@/data/routes';
import { useTheme } from '@/hooks/use-theme';
import type { FlyToToken, RouteTypeId, SheetKind } from '@/types/transport';

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [visibleRouteIds, setVisibleRouteIds] = useState<string[]>(() =>
    ROUTES.map((r) => r.id),
  );
  const [typeFilters, setTypeFilters] = useState<Record<RouteTypeId, boolean>>(() =>
    Object.fromEntries(
      (Object.keys(ROUTE_TYPES) as RouteTypeId[]).map((k) => [k, true]),
    ) as Record<RouteTypeId, boolean>,
  );

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [sheetKind, setSheetKind] = useState<SheetKind>(null);

  const [flyToToken, setFlyToToken] = useState<FlyToToken | null>(null);

  const selectedRoute = useMemo(
    () => ROUTES.find((r) => r.id === selectedRouteId) ?? null,
    [selectedRouteId],
  );
  const selectedStop = useMemo(
    () => STOPS.find((s) => s.id === selectedStopId) ?? null,
    [selectedStopId],
  );

  const visibleIdsAfterTypeFilter = useMemo(() => {
    return visibleRouteIds.filter((id) => {
      const r = ROUTES.find((x) => x.id === id);
      return r && typeFilters[r.type];
    });
  }, [visibleRouteIds, typeFilters]);

  const onToggleVisible = useCallback((id: string) => {
    setVisibleRouteIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }, []);

  const onToggleType = useCallback((typeId: RouteTypeId) => {
    setTypeFilters((f) => ({ ...f, [typeId]: !f[typeId] }));
  }, []);

  const onSelectRoute = useCallback((id: string) => {
    const r = ROUTES.find((x) => x.id === id);
    if (!r) return;
    setVisibleRouteIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
    setTypeFilters((f) => ({ ...f, [r.type]: true }));
    setSelectedRouteId(id);
    setSelectedStopId(null);
    setSheetKind('route');
    setFlyToToken({ key: Date.now(), target: { kind: 'bounds', path: r.path } });
  }, []);

  const onSelectStop = useCallback((id: string) => {
    const s = STOPS.find((x) => x.id === id);
    if (!s) return;
    setSelectedStopId(id);
    setSheetKind('stop');
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'point', lat: s.lat, lng: s.lng, zoom: 16 },
    });
  }, []);

  const closeSheet = useCallback(() => {
    setSheetKind(null);
    setSelectedRouteId(null);
    setSelectedStopId(null);
  }, []);

  const onFocusRoute = useCallback(() => {
    if (!selectedRoute) return;
    setFlyToToken({
      key: Date.now(),
      target: { kind: 'bounds', path: selectedRoute.path },
    });
  }, [selectedRoute]);

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
                    Toca una línea o paradero para ver detalles. Usa <Kbd>⌘</Kbd> <Kbd>K</Kbd>{' '}
                    para buscar.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          <div className="pointer-events-none absolute bottom-4 left-3 z-10">
            <div className="pointer-events-auto rounded-md border bg-background/90 px-3 py-2 text-[11px] shadow-sm backdrop-blur">
              <div className="mb-1 font-medium uppercase tracking-wider text-muted-foreground">
                Leyenda
              </div>
              <div className="flex flex-col gap-1">
                {ROUTES.map((r) => (
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
    </div>
  );
}
