import { lazy, Suspense, useMemo, type ReactNode } from 'react';
import { Building2, Compass, Download, Gauge, ImageDown } from 'lucide-react';
import { PlannerPanel } from '@/components/planner-panel';
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { ROUTES, useRoutesVersion } from '@/data/routes';
import type { PlannerMatch } from '@/lib/planner';
import { useOperatorStats } from '@/lib/operator-stats';
import type { RoutingResult } from '@/lib/routing';
import type { Theme } from '@/types/transport';

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


  if (!tool) return null;
  const meta = TOOL_META[tool];

  return (
    <FloatingInfoPanel
      open
      onClose={onClose}
      title={meta.label}
      eyebrow={
        <>
          <ToolIcon tool={tool} />
          Herramienta
        </>
      }
      description={meta.description}
      closeLabel="Cerrar herramienta"
    >
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
              simulationScope={simulationScope}
              activeMapLayers={activeMapLayers}
              plannerMidpoint={plannerMidpoint}
              plannerOrigin={plannerOrigin}
              plannerDestination={plannerDestination}
            />
          </LazyPanelFallback>
        )}
    </FloatingInfoPanel>
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
  return <Icon />;
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
