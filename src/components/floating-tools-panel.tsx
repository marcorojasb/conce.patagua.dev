import { lazy, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { Building2, Compass, Download, Gauge, ImageDown, X } from 'lucide-react';
import { PlannerPanel } from '@/components/planner-panel';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ROUTES, useRoutesVersion } from '@/data/routes';
import type { PlannerMatch } from '@/lib/planner';
import { useOperatorStats } from '@/lib/operator-stats';
import type { RoutingResult } from '@/lib/routing';
import type { SimulatedVehicle, Theme } from '@/types/transport';

const ExportTool = lazy(() => import('@/components/export-tool'));
const WallpaperTool = lazy(() => import('@/components/wallpaper-tool'));
const DataQualityTool = lazy(() => import('@/components/data-quality-tool'));

export type AnalysisTab = 'cobertura' | 'operadores' | 'export' | 'wallpaper' | 'calidad';

const TOOL_META: Record<AnalysisTab, { label: string; description: string }> = {
  cobertura: {
    label: 'Cobertura OD · Planificador',
    description:
      'Marca dos puntos en el mapa para ver recorridos que pasan a ≤400 m de ambos y/o calcular el punto medio caminando.',
  },
  operadores: {
    label: 'Operadores',
    description: 'Distribución del servicio entre operadores con recorridos en el feed GTFS.',
  },
  export: {
    label: 'Exportar GeoJSON',
    description: 'Descarga capas como FeatureCollection para QGIS / Python / R.',
  },
  calidad: {
    label: 'Calidad de datos',
    description: 'Revisa trazados, paraderos, horarios y cobertura de simulación.',
  },
  wallpaper: {
    label: 'Fondo de pantalla',
    description: 'Genera un PNG de la red para usar como wallpaper.',
  },
};

interface FloatingToolsPanelProps {
  /** Active tool. `null` hides the panel entirely (it doesn't render). */
  tool: AnalysisTab | null;
  /** Close handler, sets tool to null on the App side. */
  onClose: () => void;
  // Planner state lifted from App so it persists when the sheet closes.
  plannerOrigin: { lat: number; lng: number } | null;
  plannerDestination: { lat: number; lng: number } | null;
  pickerMode: 'origin' | 'destination' | null;
  plannerMatches: PlannerMatch[];
  matchesAvailable: boolean;
  onPickOrigin: () => void;
  onPickDestination: () => void;
  onClearPlanner: () => void;
  onSelectRoute: (id: string) => void;
  onShowOperatorRoutes: (operator: string) => void;
  // For the GeoJSON export tab, knows which routes the user has on the map.
  visibleRouteIds: string[];
  // For the Wallpaper tab, current viewport + theme.
  mapBounds: [[number, number], [number, number]] | null;
  theme: Theme;
  simulatedVehicles: SimulatedVehicle[];
  simulationScope: 'visible' | 'all';
  activeMapLayers: {
    paraderos: boolean;
    terminales: boolean;
    pois: boolean;
    coverage: boolean;
    cycleways: boolean;
    greenspace: boolean;
    schools: boolean;
    simulated: boolean;
  };
  // Walking midpoint between origin and destination (lifted to App so the
  // route/marker survive while the user closes and reopens this sheet).
  plannerMidpoint: RoutingResult | null;
  plannerMidpointLoading: boolean;
  plannerMidpointError: string | null;
  onComputeMidpoint: () => void;
  onClearMidpoint: () => void;
}

export function FloatingToolsPanel({
  tool,
  onClose,
  plannerOrigin,
  plannerDestination,
  pickerMode,
  plannerMatches,
  matchesAvailable,
  onPickOrigin,
  onPickDestination,
  onClearPlanner,
  onSelectRoute,
  onShowOperatorRoutes,
  visibleRouteIds,
  mapBounds,
  theme,
  simulatedVehicles,
  simulationScope,
  activeMapLayers,
  plannerMidpoint,
  plannerMidpointLoading,
  plannerMidpointError,
  onComputeMidpoint,
  onClearMidpoint,
}: FloatingToolsPanelProps) {
  // Hooks must run unconditionally; we early-return after they're called.
  const operatorStats = useOperatorStats();
  const routesVersion = useRoutesVersion();
  const microCount = useMemo(
    () => {
      void routesVersion;
      return ROUTES.filter((r) => r.type === 'micro').length;
    },
    [routesVersion],
  );

  useEffect(() => {
    if (!tool) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, tool]);

  if (!tool) return null;
  const meta = TOOL_META[tool];

  return (
    // pointer-events-none on the wrapper so clicks fall through to the map
    // anywhere outside the card. The card itself reclaims them.
    <div
      className={cn(
        'pointer-events-none absolute z-[5000]',
        // Mobile: bottom-anchored card. 58vh leaves ~40% of viewport for the
        // map above, enough to keep context while reading the panel.
        'left-2 right-2 bottom-2 h-[58vh]',
        // Desktop: detach from left, anchor to the right just left of the
        // toolbar buttons (right-3 + 40px wide). Top/bottom 12px.
        'sm:left-auto sm:right-[64px] sm:top-3 sm:bottom-3 sm:w-[380px] sm:h-auto',
      )}
      aria-live="polite"
    >
      <aside
        role="dialog"
        aria-label={meta.label}
        // Grid layout instead of flex so the ScrollArea row has a definite
        // (not "computed via flex") height, required for Radix ScrollArea's
        // h-full viewport to size correctly inside on iOS Safari.
        className="pointer-events-auto grid h-full max-h-[inherit] min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-lg border bg-background shadow-xl animate-fade-in"
      >
        {/* Cosmetic drag handle, mobile only, communicates "this is a
            dismissable bottom sheet" the same way iOS does. Closing is
            actually done via the X button or the toolbar toggle. */}
        <div className="flex justify-center py-1.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>
        <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <ToolIcon tool={tool} />
              <h2 className="truncate text-sm font-semibold tracking-tight">
                {meta.label}
              </h2>
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {meta.description}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar herramienta"
            className="-mr-1 -mt-1 size-8 shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        <ScrollArea className="min-h-0 flex-1 scroll-fade-y">
          <div className="px-4 py-3">
            {tool === 'cobertura' && (
              <PlannerPanel
                origin={plannerOrigin}
                destination={plannerDestination}
                pickerMode={pickerMode}
                matches={plannerMatches}
                matchesAvailable={matchesAvailable}
                onPickOrigin={onPickOrigin}
                onPickDestination={onPickDestination}
                onClear={onClearPlanner}
                onSelectRoute={onSelectRoute}
                midpoint={plannerMidpoint}
                midpointLoading={plannerMidpointLoading}
                midpointError={plannerMidpointError}
                onComputeMidpoint={onComputeMidpoint}
                onClearMidpoint={onClearMidpoint}
              />
            )}

            {tool === 'operadores' && (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-md border">
                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b bg-muted/30 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <span>Operador</span>
                    <span className="text-right">Rutas</span>
                    <span className="text-right">Km totales</span>
                  </div>
                  <ul className="divide-y">
                    {operatorStats.map((s) => (
                      <li key={s.operator}>
                        <button
                          type="button"
                          onClick={() => onShowOperatorRoutes(s.operator)}
                          className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/60 focus-ring"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-block size-2.5 shrink-0 rounded-full"
                              style={{ background: s.color }}
                            />
                            <span className="truncate text-sm font-medium">
                              {s.operator}
                            </span>
                          </span>
                          <span className="font-mono text-[12px] text-muted-foreground">
                            {s.routesCount}
                          </span>
                          <span className="font-mono text-[12px] text-muted-foreground">
                            {s.totalKm.toFixed(0)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
                  Km totales se calculan sumando la distancia entre vértices del trazado
                  GTFS simplificado (Douglas–Peucker ~16 m). Aproximación al largo
                  operacional, no incluye recorridos en vacío. Total flota:
                  {' '}<span className="font-mono">{microCount}</span> servicios urbanos.
                </div>
              </div>
            )}

            {tool === 'export' && (
              <LazyPanelFallback>
                <ExportTool visibleRouteIds={visibleRouteIds} />
              </LazyPanelFallback>
            )}

            {tool === 'calidad' && (
              <LazyPanelFallback>
                <DataQualityTool onSelectRoute={onSelectRoute} />
              </LazyPanelFallback>
            )}

            {tool === 'wallpaper' && (
              <LazyPanelFallback>
                <WallpaperTool
                  visibleRouteIds={visibleRouteIds}
                  mapBounds={mapBounds}
                  theme={theme}
                  simulatedVehicles={simulatedVehicles}
                  simulationScope={simulationScope}
                  activeMapLayers={activeMapLayers}
                  plannerMidpoint={plannerMidpoint}
                  plannerOrigin={plannerOrigin}
                  plannerDestination={plannerDestination}
                />
              </LazyPanelFallback>
            )}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}

function ToolIcon({ tool }: { tool: AnalysisTab }) {
  const Icon =
    tool === 'cobertura'
      ? Compass
      : tool === 'operadores'
        ? Building2
        : tool === 'export'
          ? Download
          : tool === 'calidad'
            ? Gauge
            : ImageDown;
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-md border bg-muted/40 text-muted-foreground">
      <Icon className="size-3.5" />
    </span>
  );
}

function LazyPanelFallback({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
          Cargando herramienta…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
