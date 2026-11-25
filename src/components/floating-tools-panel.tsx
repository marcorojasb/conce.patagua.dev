import { lazy, Suspense, useMemo, type ReactNode } from 'react';
import { Building2, Download, Gauge, ImageDown, Plus, Route as RouteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { PlannerPanel } from '@/components/planner-panel';
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { ROUTES, useRoutesVersion } from '@/data/routes';
import { useOperatorStats } from '@/lib/operator-stats';
import { routeColorVars } from '@/lib/route-colors';
import type { FloatingToolsPanelProps, ToolId } from '@/types/ui-contracts';

const ExportTool = lazy(() => import('@/components/export-tool'));
const WallpaperTool = lazy(() => import('@/components/wallpaper-tool'));
const DataQualityTool = lazy(() => import('@/components/data-quality-tool'));

// Mismos nombres que los botones de la columna de herramientas (map-layer-control).
const TOOL_META: Record<ToolId, { label: string; description: string; Icon: typeof RouteIcon }> = {
  planner: {
    label: 'Planificador',
    description: 'Recorridos que pasan a ≤400 m de A y B',
    Icon: RouteIcon,
  },
  operators: {
    label: 'Operadores',
    description: 'Cuántos recorridos y kilómetros tiene cada operador del GTFS.',
    Icon: Building2,
  },
  quality: {
    label: 'Calidad de datos',
    description: 'Trazados, paraderos, horarios y cobertura de la simulación.',
    Icon: Gauge,
  },
  export: {
    label: 'Exportar GeoJSON',
    description: 'Descarga capas como FeatureCollection para QGIS, Python o R.',
    Icon: Download,
  },
  wallpaper: {
    label: 'Fondo de pantalla',
    description: 'Un PNG de la red para usar como fondo de pantalla.',
    Icon: ImageDown,
  },
};

export function FloatingToolsPanel({
  tool,
  chrome,
  planner,
  onShowOperatorRoutes,
  onSelectRoute,
  visibleRouteIds,
  theme,
  micros,
  scope,
  layers,
}: FloatingToolsPanelProps) {
  const meta = TOOL_META[tool];

  return (
    <FloatingInfoPanel
      chrome={chrome}
      title={meta.label}
      eyebrow={
        <>
          <meta.Icon />
          Herramienta
        </>
      }
      description={meta.description}
      closeLabel="Cerrar herramienta"
      // Las herramientas cortas no ocupan toda la altura en escritorio (con
      // contenido largo el panel igual tiene tope y desplazamiento propio).
      fit={tool === 'planner' || tool === 'quality' || tool === 'export'}
    >
      {tool === 'planner' && <PlannerPanel {...planner} />}

      {tool === 'operators' && (
        <OperatorsTool visibleRouteIds={visibleRouteIds} onShowOperatorRoutes={onShowOperatorRoutes} />
      )}

      {tool === 'export' && (
        <LazyPanelFallback>
          <ExportTool visibleRouteIds={visibleRouteIds} />
        </LazyPanelFallback>
      )}

      {tool === 'quality' && (
        <LazyPanelFallback>
          <DataQualityTool onSelectRoute={onSelectRoute} />
        </LazyPanelFallback>
      )}

      {tool === 'wallpaper' && (
        <LazyPanelFallback>
          <WallpaperTool
            visibleRouteIds={visibleRouteIds}
            theme={theme}
            micros={micros}
            scope={scope}
            layers={layers}
            plannerMidpoint={planner.midpoint}
            plannerOrigin={planner.a}
            plannerDestination={planner.b}
          />
        </LazyPanelFallback>
      )}
    </FloatingInfoPanel>
  );
}

/**
 * Operadores con sus recorridos. "Mostrar N" los agrega al mapa y el panel
 * sigue abierto (App avisa "Agregados N · Deshacer").
 */
function OperatorsTool({
  visibleRouteIds,
  onShowOperatorRoutes,
}: {
  visibleRouteIds: readonly string[];
  onShowOperatorRoutes: (operator: string) => void;
}) {
  const operatorStats = useOperatorStats();
  const routesVersion = useRoutesVersion();
  const microCount = useMemo(() => {
    void routesVersion;
    return ROUTES.filter((r) => r.type === 'micro').length;
  }, [routesVersion]);
  const visible = useMemo(() => new Set(visibleRouteIds), [visibleRouteIds]);

  return (
    <div className="space-y-3">
      <ul className="divide-y overflow-hidden rounded-md border">
        {operatorStats.map((s) => {
          const missing = s.routeIds.filter((id) => !visible.has(id)).length;
          return (
            <li key={s.operator} className="flex items-center gap-3 px-3 py-2">
              <span
                aria-hidden
                className="inline-block size-2.5 shrink-0 rounded-full bg-[var(--route)] dark:bg-[var(--route-dark)]"
                style={routeColorVars(s.color)}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.operator}</div>
                <div className="text-[11px] tabular-nums text-muted-foreground">
                  {s.routesCount} {s.routesCount === 1 ? 'recorrido' : 'recorridos'} · {s.totalKm.toFixed(0)} km
                </div>
              </div>
              {missing > 0 ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0 px-2 text-[11px]"
                  onClick={() => onShowOperatorRoutes(s.operator)}
                >
                  <Plus className="size-3" />
                  Mostrar {s.routesCount} {s.routesCount === 1 ? 'recorrido' : 'recorridos'}
                </Button>
              ) : (
                <span className="shrink-0 text-[11px] text-muted-foreground">Todos en el mapa</span>
              )}
            </li>
          );
        })}
      </ul>
      <Notice>
        Los km suman la distancia entre vértices del trazado GTFS simplificado (Douglas–Peucker
        ~16 m): una aproximación al largo operacional, sin recorridos en vacío. Total flota:{' '}
        <span className="font-mono tabular-nums">{microCount}</span> servicios urbanos.
      </Notice>
    </div>
  );
}

function LazyPanelFallback({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Notice>Cargando herramienta…</Notice>
      }
    >
      {children}
    </Suspense>
  );
}
