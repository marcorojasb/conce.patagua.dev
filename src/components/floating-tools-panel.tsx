import { useState } from 'react';
import { Building2, Compass, Download, ImageDown, X } from 'lucide-react';
import { PlannerPanel } from '@/components/planner-panel';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/data/routes';
import { GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { POIS } from '@/data/pois.generated';
import { TERMINALS } from '@/data/terminals.generated';
import type { PlannerMatch } from '@/lib/planner';
import { OPERATOR_STATS } from '@/lib/operator-stats';
import {
  buildExport,
  downloadGeoJSON,
  type ExportLayer,
} from '@/lib/geojson-export';
import type { RoutingResult } from '@/lib/routing';
import {
  buildWallpaper,
  CURATED_VIEWS,
  downloadBlob,
  WALLPAPER_SIZES,
  type CuratedView,
  type WallpaperSizePreset,
} from '@/lib/wallpaper';
import type { CoverageCell, Theme } from '@/types/transport';

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
  // Walking midpoint between origin and destination (lifted to App so the
  // route/marker survive while the user closes and reopens this sheet).
  plannerMidpoint: RoutingResult | null;
  plannerMidpointLoading: boolean;
  plannerMidpointError: string | null;
  onComputeMidpoint: () => void;
  onClearMidpoint: () => void;
}

const micrCount = ROUTES.filter((r) => r.type === 'micro').length;

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
  plannerMidpoint,
  plannerMidpointLoading,
  plannerMidpointError,
  onComputeMidpoint,
  onClearMidpoint,
}: FloatingToolsPanelProps) {
  if (!tool) return null;
  const meta = TOOL_META[tool];

  return (
    // pointer-events-none on the wrapper so clicks fall through to the map
    // anywhere outside the card. The card itself reclaims them.
    <div
      className={cn(
        'pointer-events-none absolute z-10',
        // Mobile: bottom-anchored card with margins, max 65vh height.
        'left-2 right-2 bottom-2 max-h-[65vh]',
        // Desktop: detach from left, anchor to the right just left of the
        // toolbar buttons (which are right-3 + 40px wide).
        'sm:left-auto sm:right-[64px] sm:top-3 sm:bottom-3 sm:w-[380px] sm:max-h-none',
      )}
      aria-live="polite"
    >
      <div
        role="dialog"
        aria-modal={false}
        aria-label={meta.label}
        className="pointer-events-auto flex h-full max-h-[inherit] min-h-0 flex-col overflow-hidden rounded-lg border bg-background/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/90 animate-fade-in"
      >
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
                    {OPERATOR_STATS.map((s) => (
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
                  {' '}<span className="font-mono">{micrCount}</span> servicios urbanos.
                </div>
              </div>
            )}

            {tool === 'export' && <ExportTab visibleRouteIds={visibleRouteIds} />}

            {tool === 'wallpaper' && (
              <WallpaperTab
                visibleRouteIds={visibleRouteIds}
                mapBounds={mapBounds}
                theme={theme}
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
      downloadGeoJSON(fc, `conce-transporte-${stamp}.geojson`);
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
  // The walking midpoint computed in the planner. Surfaced here so the user
  // can include the A/M/B trace in the PNG without having to switch tabs.
  plannerMidpoint: RoutingResult | null;
  plannerOrigin: { lat: number; lng: number } | null;
  plannerDestination: { lat: number; lng: number } | null;
}

interface LayerToggleState {
  recorridos: boolean;
  punto_medio: boolean;
  paraderos: boolean;
  terminales: boolean;
  cobertura: boolean;
}

function WallpaperTab({
  visibleRouteIds,
  mapBounds,
  theme,
  plannerMidpoint,
  plannerOrigin,
  plannerDestination,
}: WallpaperTabProps) {
  const [mode, setMode] = useState<'current' | 'curated'>('current');
  const [sizeId, setSizeId] = useState<string>(WALLPAPER_SIZES[0].id);
  const [curatedId, setCuratedId] = useState<string>(CURATED_VIEWS[0].id);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  // Layer toggles default to a sensible baseline per mode/curated view but
  // the user can override anything. We don't reset on mode change — that's
  // surprising. Only the "punto medio" toggle is force-off when there's no
  // midpoint computed.
  const [layers, setLayers] = useState<LayerToggleState>({
    recorridos: true,
    punto_medio: false,
    paraderos: false,
    terminales: false,
    cobertura: false,
  });
  const setLayer = (key: keyof LayerToggleState) => () =>
    setLayers((cur) => ({ ...cur, [key]: !cur[key] }));

  const size = WALLPAPER_SIZES.find((s) => s.id === sizeId) ?? WALLPAPER_SIZES[0];
  const curated = CURATED_VIEWS.find((c) => c.id === curatedId) ?? CURATED_VIEWS[0];
  const midpointAvailable = !!plannerMidpoint;

  const generate = async () => {
    setBusy(true);
    setProgress('Calculando viewport…');
    try {
      let bbox: [[number, number], [number, number]];
      let headlineText: string;
      let includeAll = false;
      let onlyBiotren = false;
      if (mode === 'current') {
        if (!mapBounds) throw new Error('Aún no hay vista del mapa para capturar.');
        bbox = mapBounds;
        headlineText = `Vista actual · ${visibleRouteIds.length} recorridos`;
        includeAll = true;
      } else {
        bbox = curated.bbox;
        headlineText = curated.label;
        onlyBiotren = curated.includeBiotren && !curated.includeMicros;
        if (curated.includeBiotren && curated.includeMicros) includeAll = true;
      }

      const wantRoute = (r: (typeof ROUTES)[number]) => {
        if (!layers.recorridos) return false;
        if (mode === 'current') return visibleRouteIds.includes(r.id);
        if (includeAll) return true;
        if (onlyBiotren) return r.type === 'biotren';
        return false;
      };

      setProgress('Preparando capas…');
      const routesForRender = ROUTES.filter(wantRoute).map((r) => ({
        path: r.path,
        color: r.color,
        weight: r.type === 'biotren' ? 5 : 2.5,
      }));

      let coverageCells: Awaited<ReturnType<typeof loadCoverage>> | null = null;
      if (layers.cobertura) {
        setProgress('Cargando cobertura territorial…');
        coverageCells = await loadCoverage();
      }

      const paraderosLayer = layers.paraderos
        ? GTFS_STOPS.map((p) => ({ lat: p.lat, lng: p.lng }))
        : undefined;
      const terminalesLayer = layers.terminales
        ? TERMINALS.map((t) => ({ lat: t.lat, lng: t.lng }))
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

      setProgress('Renderizando tiles y trazados…');
      const blob = await buildWallpaper({
        bbox,
        width: size.width,
        height: size.height,
        theme,
        routes: routesForRender,
        coverageCells: coverageCells ?? undefined,
        paraderos: paraderosLayer,
        terminales: terminalesLayer,
        midpoint: midpointLayer,
        title: headlineText,
      });

      const stamp = new Date().toISOString().slice(0, 10);
      const filename = `conce-transporte-${mode === 'current' ? 'vista' : curated.id}-${size.width}x${size.height}-${stamp}.png`;
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
        Genera una imagen PNG de la red para usar como fondo de pantalla. Render
        directo a canvas (tiles CARTO + trazados GTFS/OSM), sin recortar el
        visor — la salida es nítida en pantallas retina.
      </p>

      <div className="grid grid-cols-2 gap-1.5">
        <Button
          type="button"
          variant={mode === 'current' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('current')}
        >
          Vista actual
        </Button>
        <Button
          type="button"
          variant={mode === 'curated' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('curated')}
        >
          Vistas curadas
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

      <div className="space-y-1.5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Capas a incluir
        </div>
        <div className="overflow-hidden rounded-md border">
          <LayerToggle
            label="Recorridos"
            detail="Polilíneas de las rutas seleccionadas"
            checked={layers.recorridos}
            onChange={setLayer('recorridos')}
          />
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
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Tamaño
        </div>
        <div className="overflow-hidden rounded-md border">
          <SizeGroup label="Teléfono" presets={WALLPAPER_SIZES.filter((s) => s.group === 'phone')} selectedId={sizeId} onSelect={setSizeId} />
          <SizeGroup label="Computador" presets={WALLPAPER_SIZES.filter((s) => s.group === 'desktop')} selectedId={sizeId} onSelect={setSizeId} />
        </div>
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

async function loadCoverage() {
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
  }));
}

// Curated views consume types from the wallpaper lib — keep the type
// re-exported so consumers don't reach across the module boundary.
export type { CuratedView };
