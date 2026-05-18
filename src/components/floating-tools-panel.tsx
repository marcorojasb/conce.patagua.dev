import { useEffect, useMemo, useState } from 'react';
import { Building2, Compass, Download, Eye, ImageDown, RefreshCw, X } from 'lucide-react';
import { PlannerPanel } from '@/components/planner-panel';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ROUTES, useRoutesVersion } from '@/data/routes';
import { GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { POIS } from '@/data/pois.generated';
import { TERMINALS } from '@/data/terminals.generated';
import type { PlannerMatch } from '@/lib/planner';
import { useOperatorStats } from '@/lib/operator-stats';
import {
  buildExport,
  downloadGeoJSON,
  type ExportLayer,
} from '@/lib/geojson-export';
import type { RoutingResult } from '@/lib/routing';
import {
  buildWallpaperLegend,
  buildWallpaper,
  CURATED_VIEWS,
  downloadBlob,
  padBbox,
  selectWallpaperRoutes,
  WALLPAPER_SIZES,
  WALLPAPER_STYLES,
  type WallpaperRouteMode,
  type WallpaperSizePreset,
  type WallpaperStyle,
} from '@/lib/wallpaper';
import { STATIC_SERVICE_PATTERNS } from '@/data/static-service-patterns';
import { computeActiveVehicles, type SimulationRouteInput } from '@/realtime/simulated-vehicles';
import type { CoverageCell, RouteSchedule, SimulatedVehicle, Theme } from '@/types/transport';

export type AnalysisTab = 'cobertura' | 'operadores' | 'export' | 'wallpaper';

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
  wallpaper: {
    label: 'Fondo de pantalla',
    description: 'Genera un PNG de la red para usar como wallpaper.',
  },
};

interface FloatingToolsPanelProps {
  /** Active tool. `null` hides the panel entirely (it doesn't render). */
  tool: AnalysisTab | null;
  /** Close handler — sets tool to null on the App side. */
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
  // For the GeoJSON export tab — knows which routes the user has on the map.
  visibleRouteIds: string[];
  // For the Wallpaper tab — current viewport + theme.
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
    () => ROUTES.filter((r) => r.type === 'micro').length,
    [routesVersion],
  );
  if (!tool) return null;
  const meta = TOOL_META[tool];

  return (
    // pointer-events-none on the wrapper so clicks fall through to the map
    // anywhere outside the card. The card itself reclaims them.
    <div
      className={cn(
        'pointer-events-none absolute z-[5000]',
        // Mobile: bottom-anchored card. 58vh leaves ~40% of viewport for the
        // map above — enough to keep context while reading the panel.
        'left-2 right-2 bottom-2 h-[58vh]',
        // Desktop: detach from left, anchor to the right just left of the
        // toolbar buttons (right-3 + 40px wide). Top/bottom 12px.
        'sm:left-auto sm:right-[64px] sm:top-3 sm:bottom-3 sm:w-[380px] sm:h-auto',
      )}
      aria-live="polite"
    >
      <div
        role="dialog"
        aria-modal={false}
        aria-label={meta.label}
        // Grid layout instead of flex so the ScrollArea row has a definite
        // (not "computed via flex") height — required for Radix ScrollArea's
        // h-full viewport to size correctly inside on iOS Safari.
        className="pointer-events-auto grid h-full max-h-[inherit] min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-lg border bg-background shadow-xl animate-fade-in"
      >
        {/* Cosmetic drag handle, mobile only — communicates "this is a
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
            className="-mr-1 -mt-1 h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="min-h-0 flex-1">
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
                              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
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

            {tool === 'export' && <ExportTab visibleRouteIds={visibleRouteIds} />}

            {tool === 'wallpaper' && (
              <WallpaperTab
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
            )}
          </div>
        </ScrollArea>
      </div>
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
          : ImageDown;
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border bg-muted/40 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

interface ExportRow {
  key: ExportLayer;
  label: string;
  detail: string;
  defaultChecked: boolean;
  size?: () => number;
}

const EXPORT_ROWS: ExportRow[] = [
  {
    key: 'routes-visible',
    label: 'Recorridos visibles',
    detail: 'Solo los recorridos actualmente activos en el mapa',
    defaultChecked: true,
  },
  {
    key: 'routes-all',
    label: 'Todos los recorridos',
    detail: `${ROUTES.length} líneas, ignora filtros del visor`,
    defaultChecked: false,
  },
  {
    key: 'paraderos',
    label: 'Paraderos',
    detail: `${GTFS_STOPS.length.toLocaleString('es-CL')} puntos GTFS`,
    defaultChecked: true,
  },
  {
    key: 'terminales',
    label: 'Terminales',
    detail: `${TERMINALS.length} estaciones intermodales`,
    defaultChecked: false,
  },
  {
    key: 'centros',
    label: 'Centros de atracción',
    detail: `${POIS.length} POIs urbanos`,
    defaultChecked: false,
  },
  {
    key: 'cobertura',
    label: 'Cobertura territorial',
    detail: '7.649 polígonos · ~10 MB sin gzip',
    defaultChecked: false,
  },
];

function ExportTab({ visibleRouteIds }: { visibleRouteIds: string[] }) {
  const [selected, setSelected] = useState<Set<ExportLayer>>(
    () => new Set(EXPORT_ROWS.filter((r) => r.defaultChecked).map((r) => r.key)),
  );
  const [busy, setBusy] = useState(false);

  const toggle = (key: ExportLayer) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        // Mutual exclusion between "solo visibles" y "todos": tener ambos
        // activos resultaría en duplicados.
        if (key === 'routes-visible') next.delete('routes-all');
        if (key === 'routes-all') next.delete('routes-visible');
      }
      return next;
    });
  };

  const download = async () => {
    setBusy(true);
    try {
      let coverageCells: readonly CoverageCell[] | null = null;
      if (selected.has('cobertura')) {
        const mod = await import('@/data/coverage.generated');
        coverageCells = mod.COVERAGE_CELLS;
      }
      const fc = buildExport(selected, { visibleRouteIds, coverageCells });
      const stamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      downloadGeoJSON(fc, `conce-patagua-dev-${stamp}.geojson`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-snug text-muted-foreground">
        Exporta la selección actual como un FeatureCollection{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
          .geojson
        </code>{' '}
        para abrirlo en QGIS, Python (geopandas), R (sf), o cualquier herramienta
        de análisis SIG. Cada feature lleva sus propias{' '}
        <code className="font-mono text-[11px]">properties</code> incluyendo un
        campo <code className="font-mono text-[11px]">layer</code> para filtrar.
      </p>

      <div className="overflow-hidden rounded-md border">
        <ul className="divide-y">
          {EXPORT_ROWS.map((row) => {
            const checked = selected.has(row.key);
            return (
              <li key={row.key}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-accent/40">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{row.label}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {row.detail}
                    </div>
                  </div>
                  <Switch
                    checked={checked}
                    onCheckedChange={() => toggle(row.key)}
                    aria-label={row.label}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        type="button"
        onClick={download}
        disabled={selected.size === 0 || busy}
        className="w-full"
      >
        <Download className="h-4 w-4" />
        {busy ? 'Generando…' : 'Descargar GeoJSON'}
      </Button>

      <div className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
        Atribución requerida en cualquier publicación: los recorridos y paraderos
        vienen del GTFS Gran Concepción CC BY 4.0 de la Subsecretaría de
        Transportes; terminales, POIs y trazado del Biotrén de OpenStreetMap
        bajo ODbL.
      </div>
    </div>
  );
}

interface WallpaperTabProps {
  visibleRouteIds: string[];
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
  // The walking midpoint computed in the planner. Surfaced here so the user
  // can include the A/M/B trace in the PNG without having to switch tabs.
  plannerMidpoint: RoutingResult | null;
  plannerOrigin: { lat: number; lng: number } | null;
  plannerDestination: { lat: number; lng: number } | null;
}

interface LayerToggleState {
  recorridos: boolean;
  servicios: boolean;
  punto_medio: boolean;
  paraderos: boolean;
  terminales: boolean;
  cobertura: boolean;
  ciclovias: boolean;
  areas_verdes: boolean;
  educacion: boolean;
  centros: boolean;
}

function WallpaperTab({
  visibleRouteIds,
  mapBounds,
  theme,
  simulatedVehicles,
  simulationScope,
  activeMapLayers,
  plannerMidpoint,
  plannerOrigin,
  plannerDestination,
}: WallpaperTabProps) {
  const [mode, setMode] = useState<'current' | 'curated' | 'manual'>('current');
  const [styleId, setStyleId] = useState<WallpaperStyle>('clean');
  const [sizeId, setSizeId] = useState<string>(WALLPAPER_SIZES[0].id);
  const [curatedId, setCuratedId] = useState<string>(CURATED_VIEWS[0].id);
  const [routeMode, setRouteMode] = useState<WallpaperRouteMode>('visible');
  const [servicesScope, setServicesScope] = useState<'visible' | 'all'>(simulationScope);
  const [framePadding, setFramePadding] = useState(8);
  const [zoomDelta, setZoomDelta] = useState(0);
  const [manualBbox, setManualBbox] = useState<[[number, number], [number, number]] | null>(mapBounds);
  const [titleText, setTitleText] = useState('Gran Concepción en movimiento');
  const [subtitleText, setSubtitleText] = useState('Red de transporte público y capas urbanas');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const [layers, setLayers] = useState<LayerToggleState>({
    recorridos: true,
    servicios: activeMapLayers.simulated,
    punto_medio: false,
    paraderos: activeMapLayers.paraderos,
    terminales: activeMapLayers.terminales,
    cobertura: activeMapLayers.coverage,
    ciclovias: activeMapLayers.cycleways,
    areas_verdes: activeMapLayers.greenspace,
    educacion: activeMapLayers.schools,
    centros: activeMapLayers.pois,
  });
  const setLayer = (key: keyof LayerToggleState) => () =>
    setLayers((cur) => ({ ...cur, [key]: !cur[key] }));

  useEffect(() => {
    if (!manualBbox && mapBounds) setManualBbox(mapBounds);
  }, [manualBbox, mapBounds]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const size = WALLPAPER_SIZES.find((s) => s.id === sizeId) ?? WALLPAPER_SIZES[0];
  const curated = CURATED_VIEWS.find((c) => c.id === curatedId) ?? CURATED_VIEWS[0];
  const midpointAvailable = !!plannerMidpoint;

  const resolveBbox = () => {
    const raw =
      mode === 'curated'
        ? curated.bbox
        : mode === 'manual'
          ? manualBbox ?? mapBounds
          : mapBounds;
    if (!raw) throw new Error('Aún no hay vista del mapa para capturar.');
    return padBbox(raw, { paddingPct: framePadding, zoomDelta });
  };

  const buildBlob = async (preview: boolean) => {
    setProgress(preview ? 'Preparando preview…' : 'Calculando composición…');
    const bbox = resolveBbox();
    const selectedRouteSources = layers.recorridos
      ? selectWallpaperRoutes(
          ROUTES.map((r) => ({
            id: r.id,
            type: r.type,
            network: r.network,
            path: r.path,
            color: r.color,
          })),
          visibleRouteIds,
          routeMode,
        )
      : [];
    const routesForRender = selectedRouteSources.map((r) => ({
      path: r.path,
      color: r.color,
      weight: r.type === 'biotren' ? 5 : 2.5,
    }));

    const routeIds = new Set(selectedRouteSources.map((r) => r.id));
    const vehicles = layers.servicios
      ? await loadWallpaperVehicles(servicesScope, visibleRouteIds, simulatedVehicles)
      : [];
    const scopedVehicles = servicesScope === 'visible'
      ? vehicles.filter((v) => routeIds.size === 0 || routeIds.has(v.routeId))
      : vehicles;
    const routeColorById = new Map(ROUTES.map((r) => [r.id, r.color]));
    const vehiclesForRender = scopedVehicles.map((v) => ({
      lat: v.lat,
      lng: v.lng,
      bearing: v.bearing,
      routeId: v.routeId,
      color: routeColorById.get(v.routeId) ?? '#38bdf8',
      label: v.directionLabel ?? v.routeId,
      sourceKind: v.sourceKind,
    }));

    setProgress('Cargando capas urbanas…');
    const [coverageCells, cycleways, greenspace, schools] = await Promise.all([
      layers.cobertura ? loadCoverage(bbox) : Promise.resolve(undefined),
      layers.ciclovias ? loadCycleways(bbox) : Promise.resolve(undefined),
      layers.areas_verdes ? loadGreenspace(bbox) : Promise.resolve(undefined),
      layers.educacion ? loadSchools(bbox) : Promise.resolve(undefined),
    ]);

    const paraderosLayer = layers.paraderos
      ? GTFS_STOPS.filter((p) => pointInBbox(p.lat, p.lng, bbox)).map((p) => ({ lat: p.lat, lng: p.lng }))
      : undefined;
    const terminalesLayer = layers.terminales
      ? TERMINALS.filter((t) => pointInBbox(t.lat, t.lng, bbox)).map((t) => ({ lat: t.lat, lng: t.lng }))
      : undefined;
    const poisLayer = layers.centros
      ? POIS.filter((p) => pointInBbox(p.lat, p.lng, bbox)).map((p) => ({
          lat: p.lat,
          lng: p.lng,
          color: p.category === 'hospital' ? '#ef4444' : p.category === 'mall' ? '#f97316' : '#7c3aed',
          radius: p.category === 'hospital' ? 3.6 : 3,
        }))
      : undefined;
    const midpointLayer =
      layers.punto_medio && plannerMidpoint
        ? {
            path: plannerMidpoint.path,
            midpoint: plannerMidpoint.midpoint,
            origin: plannerOrigin ?? undefined,
            destination: plannerDestination ?? undefined,
          }
        : undefined;

    const scale = preview ? Math.min(360 / size.width, 520 / size.height) : 1;
    const outWidth = preview ? Math.max(220, Math.round(size.width * scale)) : size.width;
    const outHeight = preview ? Math.max(220, Math.round(size.height * scale)) : size.height;
    const legendItems = buildWallpaperLegend({
      routesCount: routesForRender.length,
      vehiclesCount: vehiclesForRender.length,
      paraderos: !!paraderosLayer?.length,
      terminales: !!terminalesLayer?.length,
      cobertura: !!coverageCells?.length,
      cycleways: !!cycleways?.length,
      greenspace: !!greenspace?.length,
      schools: !!schools?.length,
      pois: !!poisLayer?.length,
    });

    setProgress(preview ? 'Renderizando preview…' : 'Renderizando PNG…');
    return buildWallpaper({
      bbox,
      width: outWidth,
      height: outHeight,
      theme,
      style: styleId,
      routes: routesForRender,
      cycleways,
      greenspace,
      coverageCells,
      paraderos: paraderosLayer,
      terminales: terminalesLayer,
      pois: poisLayer,
      schools,
      vehicles: vehiclesForRender,
      legendItems,
      showLegend: styleId !== 'clean' || legendItems.length > 3,
      showScale: styleId === 'technical',
      midpoint: midpointLayer,
      title: titleText.trim() || undefined,
      subtitle: subtitleText.trim() || `${routesForRender.length} recorridos · ${vehiclesForRender.length} servicios simulados`,
    });
  };

  const generatePreview = async () => {
    setPreviewBusy(true);
    try {
      const blob = await buildBlob(true);
      const nextUrl = URL.createObjectURL(blob);
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return nextUrl;
      });
    } catch (err) {
      console.error(err);
      setProgress(err instanceof Error ? err.message : 'Error al generar preview.');
    } finally {
      setPreviewBusy(false);
      setTimeout(() => setProgress(null), 2500);
    }
  };

  const generate = async () => {
    setBusy(true);
    try {
      const blob = await buildBlob(false);
      const stamp = new Date().toISOString().slice(0, 10);
      const filename = `conce-patagua-dev-${mode === 'curated' ? curated.id : mode}-${styleId}-${size.width}x${size.height}-${stamp}.png`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error(err);
      setProgress(err instanceof Error ? err.message : 'Error al generar.');
      setTimeout(() => setProgress(null), 3500);
      setBusy(false);
      return;
    }
    setBusy(false);
    setProgress(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-snug text-muted-foreground">
        Mini editor de composición para wallpapers: estilos, capas, encuadre,
        servicios programados y descarga PNG en alta resolución.
      </p>

      <div className="space-y-1.5">
        <SectionLabel>Estilo</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {WALLPAPER_STYLES.map((s) => (
            <Button
              key={s.id}
              type="button"
              variant={styleId === s.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStyleId(s.id)}
              aria-pressed={styleId === s.id}
              className="h-auto justify-start whitespace-normal py-2 text-left"
            >
              <span>
                <span className="block text-xs font-semibold">{s.label}</span>
                <span className="block text-[10px] font-normal opacity-75">{s.description}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Button
          type="button"
          variant={mode === 'current' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('current')}
          aria-pressed={mode === 'current'}
        >
          Vista actual
        </Button>
        <Button
          type="button"
          variant={mode === 'curated' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('curated')}
          aria-pressed={mode === 'curated'}
        >
          Vistas curadas
        </Button>
        <Button
          type="button"
          variant={mode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('manual')}
          aria-pressed={mode === 'manual'}
        >
          Manual
        </Button>
      </div>

      {mode === 'curated' && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Composición
          </div>
          <div className="overflow-hidden rounded-md border">
            <ul className="divide-y">
              {CURATED_VIEWS.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setCuratedId(v.id)}
                    className={`block w-full px-3 py-2 text-left transition-colors focus-ring ${
                      v.id === curatedId ? 'bg-accent/60' : 'hover:bg-accent/30'
                    }`}
                    aria-pressed={v.id === curatedId}
                  >
                    <div className="text-sm font-medium">{v.label}</div>
                    <div className="text-[11px] leading-snug text-muted-foreground">
                      {v.description}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="space-y-2 rounded-md border bg-muted/20 p-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-[11px] text-muted-foreground">
            Padding {framePadding}%
            <input
              type="range"
              min="0"
              max="24"
              value={framePadding}
              onChange={(e) => setFramePadding(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="space-y-1 text-[11px] text-muted-foreground">
            Zoom {zoomDelta > 0 ? `+${zoomDelta}` : zoomDelta}
            <input
              type="range"
              min="-3"
              max="3"
              value={zoomDelta}
              onChange={(e) => setZoomDelta(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!mapBounds}
          onClick={() => {
            if (mapBounds) setManualBbox(mapBounds);
            setMode('manual');
          }}
          className="w-full"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Usar vista actual para encuadre manual
        </Button>
      </div>

      <div className="grid gap-2">
        <input
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-ring"
          placeholder="Título"
          aria-label="Título del wallpaper"
        />
        <input
          value={subtitleText}
          onChange={(e) => setSubtitleText(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-ring"
          placeholder="Subtítulo"
          aria-label="Subtítulo del wallpaper"
        />
      </div>

      <div className="space-y-1.5">
        <SectionLabel>Capas a incluir</SectionLabel>
        <div className="overflow-hidden rounded-md border">
          <LayerToggle
            label="Recorridos"
            detail="Polilíneas de las rutas seleccionadas"
            checked={layers.recorridos}
            onChange={setLayer('recorridos')}
          />
          {layers.recorridos && (
            <SegmentedRows
              label="Recorridos"
              options={[
                ['visible', 'Visibles'],
                ['all', 'Toda red'],
                ['biotren', 'Biotrén'],
                ['interurban', 'Interurbanos'],
              ]}
              value={routeMode}
              onChange={(v) => setRouteMode(v as WallpaperRouteMode)}
            />
          )}
          <LayerToggle
            label="Servicios en curso"
            detail="Vehículos simulados por horario, no GPS"
            checked={layers.servicios}
            onChange={setLayer('servicios')}
          />
          {layers.servicios && (
            <SegmentedRows
              label="Servicios"
              options={[
                ['visible', 'Solo visibles'],
                ['all', 'Toda red'],
              ]}
              value={servicesScope}
              onChange={(v) => setServicesScope(v as 'visible' | 'all')}
            />
          )}
          <LayerToggle
            label="Punto medio caminando"
            detail={
              midpointAvailable
                ? 'Trazado peatonal A → M → B y pines'
                : 'Calcula primero un punto medio en el planificador'
            }
            checked={layers.punto_medio && midpointAvailable}
            onChange={setLayer('punto_medio')}
            disabled={!midpointAvailable}
          />
          <LayerToggle
            label="Paraderos"
            detail={`${GTFS_STOPS.length.toLocaleString('es-CL')} puntos GTFS (visibles a zoom 12+)`}
            checked={layers.paraderos}
            onChange={setLayer('paraderos')}
          />
          <LayerToggle
            label="Terminales"
            detail={`${TERMINALS.length} estaciones intermodales`}
            checked={layers.terminales}
            onChange={setLayer('terminales')}
          />
          <LayerToggle
            label="Cobertura territorial"
            detail="Heatmap por distancia al paradero más cercano"
            checked={layers.cobertura}
            onChange={setLayer('cobertura')}
          />
          <LayerToggle
            label="Ciclovías"
            detail="Infraestructura ciclista desde OSM"
            checked={layers.ciclovias}
            onChange={setLayer('ciclovias')}
          />
          <LayerToggle
            label="Áreas verdes"
            detail="Parques, plazas, bosques y reservas"
            checked={layers.areas_verdes}
            onChange={setLayer('areas_verdes')}
          />
          <LayerToggle
            label="Educación"
            detail="Establecimientos educacionales"
            checked={layers.educacion}
            onChange={setLayer('educacion')}
          />
          <LayerToggle
            label="Centros de atracción"
            detail={`${POIS.length} hospitales, universidades, malls y similares`}
            checked={layers.centros}
            onChange={setLayer('centros')}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <SectionLabel>Tamaño</SectionLabel>
        <div className="overflow-hidden rounded-md border">
          <SizeGroup label="Teléfono" presets={WALLPAPER_SIZES.filter((s) => s.group === 'phone')} selectedId={sizeId} onSelect={setSizeId} />
          <SizeGroup label="Computador" presets={WALLPAPER_SIZES.filter((s) => s.group === 'desktop')} selectedId={sizeId} onSelect={setSizeId} />
        </div>
      </div>

      <div className="space-y-2 rounded-md border bg-muted/20 p-2">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Previsualización del wallpaper"
            className="mx-auto max-h-[360px] rounded border object-contain"
          />
        ) : (
          <div className="grid h-40 place-items-center rounded border border-dashed text-[11px] text-muted-foreground">
            Preview pendiente
          </div>
        )}
        <Button type="button" variant="outline" onClick={generatePreview} disabled={previewBusy || busy} className="w-full">
          <Eye className="h-4 w-4" />
          {previewBusy ? progress ?? 'Generando preview…' : 'Generar preview'}
        </Button>
      </div>

      <Button type="button" onClick={generate} disabled={busy} className="w-full">
        <ImageDown className="h-4 w-4" />
        {busy ? progress ?? 'Generando…' : 'Descargar PNG'}
      </Button>

      {progress && !busy && (
        <div className="rounded-md border bg-destructive/10 p-2 text-[11px] text-destructive">
          {progress}
        </div>
      )}

      <div className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
        El PNG incluye atribución obligatoria embebida (OSM · CARTO · GTFS Gran
        Concepción CC BY 4.0). Si lo publicas, mantén esa franja visible.
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function SegmentedRows({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<[string, string]>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="border-b bg-muted/20 px-3 py-2">
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map(([id, text]) => (
          <Button
            key={id}
            type="button"
            variant={value === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(id)}
            aria-pressed={value === id}
            className="h-7 px-2 text-[11px]"
          >
            {text}
          </Button>
        ))}
      </div>
    </div>
  );
}

function LayerToggle({
  label,
  detail,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 border-b px-3 py-2 transition-colors last:border-b-0 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-accent/40'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{detail}</div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
    </label>
  );
}

function SizeGroup({
  label,
  presets,
  selectedId,
  onSelect,
}: {
  label: string;
  presets: WallpaperSizePreset[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="border-b last:border-b-0">
      <div className="bg-muted/30 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul className="divide-y">
        {presets.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p.id)}
              aria-pressed={p.id === selectedId}
              className={`flex w-full items-center justify-between px-3 py-1.5 text-left transition-colors focus-ring ${
                p.id === selectedId ? 'bg-accent/60' : 'hover:bg-accent/30'
              }`}
            >
              <span className="text-sm">{p.label}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {p.width}×{p.height}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function loadCoverage(bbox?: [[number, number], [number, number]]) {
  const mod = await import('@/data/coverage.generated');
  return mod.COVERAGE_CELLS.map(([lat, lng, dist]: CoverageCell) => ({
    lat,
    lng,
    bucket:
      dist <= 200
        ? ('excelente' as const)
        : dist <= 400
          ? ('buena' as const)
          : dist <= 600
            ? ('marginal' as const)
            : dist <= 1000
              ? ('pobre' as const)
            : ('muy-pobre' as const),
  })).filter((cell) => !bbox || pointInBbox(cell.lat, cell.lng, bbox));
}

async function loadCycleways(bbox: [[number, number], [number, number]]) {
  const mod = await import('@/data/cycleways.generated');
  return mod.CYCLEWAYS
    .filter((c) => pathIntersectsBbox(c.path, bbox))
    .map((c) => ({
      path: c.path,
      color: c.kind === 'segregated' ? '#2563eb' : c.kind === 'shared' ? '#6366f1' : '#06b6d4',
      weight: c.kind === 'segregated' ? 2.4 : 1.8,
    }));
}

async function loadGreenspace(bbox: [[number, number], [number, number]]) {
  const mod = await import('@/data/greenspace.generated');
  return mod.GREEN_SPACES
    .filter((g) => pathIntersectsBbox(g.ring, bbox))
    .slice(0, 900)
    .map((g) => ({
      ring: g.ring,
      fill:
        g.kind === 'forest' || g.kind === 'nature_reserve'
          ? 'rgba(22, 163, 74, 0.24)'
          : 'rgba(34, 197, 94, 0.32)',
      stroke: 'rgba(22, 163, 74, 0.42)',
    }));
}

async function loadSchools(bbox: [[number, number], [number, number]]) {
  const mod = await import('@/data/schools.generated');
  return mod.SCHOOLS
    .filter((s) => pointInBbox(s.lat, s.lng, bbox))
    .map((s) => ({
      lat: s.lat,
      lng: s.lng,
      color: s.kind === 'university' || s.kind === 'college' ? '#7c3aed' : '#dc2626',
      radius: s.kind === 'university' || s.kind === 'college' ? 3.1 : 2.3,
    }));
}

async function loadWallpaperVehicles(
  scope: 'visible' | 'all',
  visibleRouteIds: string[],
  currentVehicles: SimulatedVehicle[],
) {
  if (scope === 'visible') {
    const visible = new Set(visibleRouteIds);
    return currentVehicles.filter((vehicle) => visible.has(vehicle.routeId));
  }

  const [gtfs, staticSchedules] = await Promise.all([
    import('@/data/gtfs-schedule.generated'),
    import('@/realtime/static-service-schedules'),
  ]);
  const schedules: Record<string, RouteSchedule> = {
    ...gtfs.ROUTE_SCHEDULES,
    ...staticSchedules.STATIC_ROUTE_SCHEDULES,
  };
  return computeActiveVehicles(new Date(), buildSimulationRoutesForWallpaper(), schedules);
}

function buildSimulationRoutesForWallpaper(): SimulationRouteInput[] {
  const gtfsRoutes: SimulationRouteInput[] = ROUTES.filter(
    (r) => r.type === 'micro' && r.id.startsWith('gtfs-route-'),
  ).map((r) => ({
    id: r.id,
    routeId: r.id,
    color: r.color,
    path: r.path,
    sourceKind: 'gtfs',
    confidence: 'official',
    sourceLabel: 'GTFS Gran Concepción',
  }));
  const staticRoutes = STATIC_SERVICE_PATTERNS.flatMap((pattern) => {
    const route = ROUTES.find((r) => r.id === pattern.routeId);
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
}

function pointInBbox(lat: number, lng: number, bbox: [[number, number], [number, number]]) {
  const [[latMin, lngMin], [latMax, lngMax]] = bbox;
  return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
}

function pathIntersectsBbox(path: Array<[number, number]>, bbox: [[number, number], [number, number]]) {
  return path.some(([lat, lng]) => pointInBbox(lat, lng, bbox));
}
