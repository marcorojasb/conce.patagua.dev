import { useEffect, useState } from 'react';
import { Eye, ImageDown, RefreshCw } from 'lucide-react';
import { CYCLEWAY_KIND_STYLE } from '@/components/cycleways-layer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { SectionLabel } from '@/components/ui/section-label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { ROUTES } from '@/data/routes';
import { GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { POIS } from '@/data/pois.generated';
import { TERMINALS } from '@/data/terminals.generated';
import { useStickyState } from '@/hooks/use-sticky-state';
import { getMapViewport, type MapBounds } from '@/lib/map-viewport';
import { POI_COLOR, SCHOOL_COLOR } from '@/lib/map-theme';
import { buildSimulationRoutes, computeActiveVehicles } from '@/realtime/simulated-vehicles';
import { loadSimulationSchedules } from '@/realtime/use-simulated-vehicles';
import { buildWallpaper, buildWallpaperLegend, CURATED_VIEWS, downloadBlob, padBbox, selectWallpaperRoutes, wallpaperRenderTheme, WALLPAPER_SIZES, WALLPAPER_STYLES, type WallpaperRouteMode, type WallpaperSizePreset, type WallpaperStyle } from '@/lib/wallpaper';
import type { CoverageCell, Theme } from '@/types/transport';
import type { LatLng, MapLayersState, MicrosMode, SimulationScope } from '@/types/ui-contracts';
import type { RoutingResult } from '@/lib/routing';

interface WallpaperTabProps {
  visibleRouteIds: readonly string[];
  theme: Theme;
  /** Con Horario en el mapa, las micros estimadas parten incluidas. */
  micros: MicrosMode;
  scope: SimulationScope;
  layers: MapLayersState;
  // El punto medio a pie del planificador: se puede incluir el trazado A/M/B
  // en el PNG sin cambiar de herramienta.
  plannerMidpoint: RoutingResult | null;
  plannerOrigin: LatLng | null;
  plannerDestination: LatLng | null;
}

// Opciones de dos líneas (nombre y descripción) o en columna: el control fija
// el alto de una línea y el ancho parejo, así que aquí se sueltan.
const STACKED_OPTIONS =
  '[&>button]:h-auto [&>button]:min-h-10 [&>button]:justify-start [&>button]:whitespace-normal [&>button]:py-2 [&>button]:text-left';

const MODE_OPTIONS = [
  { value: 'current', label: 'Vista actual' },
  { value: 'curated', label: 'Vistas curadas' },
  { value: 'manual', label: 'Manual' },
] as const;

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

// Todo el formulario vive en useStickyState: abrir otra superficie y volver
// con Atrás lo encuentra igual (la vista previa sí se rehace).
// react-doctor-disable-next-line react-doctor/no-giant-component, react-doctor/prefer-useReducer, react-doctor/no-high-complexity-react-function -- Export controls are independent form fields; keeping preview, sizing, and download flow together avoids hidden coupling.
export default function WallpaperTool({
  visibleRouteIds,
  theme,
  micros,
  scope,
  layers: mapLayers,
  plannerMidpoint,
  plannerOrigin,
  plannerDestination,
}: WallpaperTabProps) { // react-doctor-disable-line react-doctor/prefer-useReducer -- Export form controls are intentionally independent, not a single state machine.
  const [mode, setMode] = useStickyState<'current' | 'curated' | 'manual'>('wallpaper.mode', 'current');
  const [styleId, setStyleId] = useStickyState<WallpaperStyle>('wallpaper.style', 'clean');
  const [sizeId, setSizeId] = useStickyState<string>('wallpaper.size', WALLPAPER_SIZES[0].id);
  const [curatedId, setCuratedId] = useStickyState<string>('wallpaper.curated', CURATED_VIEWS[0].id);
  const [routeMode, setRouteMode] = useStickyState<WallpaperRouteMode>('wallpaper.routeMode', 'visible');
  const [servicesScopeOverride, setServicesScopeOverride] = useStickyState<SimulationScope | null>(
    'wallpaper.servicesScope',
    null,
  );
  const [framePadding, setFramePadding] = useStickyState('wallpaper.padding', 8);
  const [zoomDelta, setZoomDelta] = useStickyState('wallpaper.zoomDelta', 0);
  const [manualBbox, setManualBbox] = useStickyState<MapBounds | null>(
    'wallpaper.manualBbox',
    () => getMapViewport()?.bounds ?? null,
  );
  const [titleText, setTitleText] = useStickyState('wallpaper.title', 'Gran Concepción en movimiento');
  const [subtitleText, setSubtitleText] = useStickyState(
    'wallpaper.subtitle',
    'Red de transporte público y capas urbanas',
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const [layers, setLayers] = useStickyState<LayerToggleState>('wallpaper.layers', () => ({
    recorridos: true,
    servicios: micros === 'schedule',
    punto_medio: false,
    paraderos: mapLayers.paraderos,
    terminales: mapLayers.terminals,
    cobertura: mapLayers.coverage,
    ciclovias: mapLayers.cycleways,
    areas_verdes: mapLayers.greenspace,
    educacion: mapLayers.schools,
    centros: mapLayers.pois,
  }));
  const setLayer = (key: keyof LayerToggleState) => () =>
    setLayers((cur) => ({ ...cur, [key]: !cur[key] }));

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const size = WALLPAPER_SIZES.find((s) => s.id === sizeId) ?? WALLPAPER_SIZES[0];
  const curated = CURATED_VIEWS.find((c) => c.id === curatedId) ?? CURATED_VIEWS[0];
  const midpointAvailable = !!plannerMidpoint;
  const servicesScope = servicesScopeOverride ?? scope;

  const resolveBbox = () => {
    // El encuadre del mapa se lee al generar (map-viewport), no se sigue en vivo.
    const current = getMapViewport()?.bounds ?? null;
    const raw = mode === 'curated' ? curated.bbox : mode === 'manual' ? (manualBbox ?? current) : current;
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
          [...visibleRouteIds],
          routeMode,
        )
      : [];
    const routesForRender = selectedRouteSources.map((r) => ({
      path: r.path,
      color: r.color,
      weight: r.type === 'biotren' ? 5 : 2.5,
    }));

    const routeIds = new Set(selectedRouteSources.map((r) => r.id));
    const vehicles = layers.servicios ? await loadWallpaperVehicles(servicesScope, visibleRouteIds) : [];
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
      ? GTFS_STOPS.flatMap((p) =>
          pointInBbox(p.lat, p.lng, bbox) ? [{ lat: p.lat, lng: p.lng }] : [],
        )
      : undefined;
    const terminalesLayer = layers.terminales
      ? TERMINALS.flatMap((t) =>
          pointInBbox(t.lat, t.lng, bbox) ? [{ lat: t.lat, lng: t.lng }] : [],
        )
      : undefined;
    const poisLayer = layers.centros
      ? POIS.flatMap((p) =>
          pointInBbox(p.lat, p.lng, bbox)
            ? [{
                lat: p.lat,
                lng: p.lng,
                color: POI_COLOR[p.category],
                radius: p.category === 'hospital' ? 3.6 : 3,
              }]
            : [],
        )
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
    }, wallpaperRenderTheme(theme, styleId));

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
      subtitle: subtitleText.trim() || `${routesForRender.length} recorridos · ${vehiclesForRender.length} micros estimadas según horario`,
    });
  };

  const generatePreview = async () => {
    setPreviewBusy(true);
    try {
      const blob = await buildBlob(true);
      // El revoke de la URL anterior lo hace el useEffect de limpieza, que es
      // el único dueño de esa responsabilidad (un updater de estado tiene que
      // ser puro).
      // react-doctor-disable-next-line react-doctor/no-create-object-url-without-revoke -- El revoke vive en el cleanup del efecto que observa previewUrl (líneas 98-102); el detector no rastrea ese efecto.
      setPreviewUrl(URL.createObjectURL(blob));
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
        Elige estilo, capas y encuadre, y descarga un PNG en alta resolución. Lo que
        configures se mantiene si abres otra cosa y vuelves.
      </p>

      <div>
        <SectionLabel className="mb-1.5">Estilo</SectionLabel>
        <SegmentedControl
          variant="toggle"
          label="Estilo"
          value={styleId}
          onChange={setStyleId}
          options={WALLPAPER_STYLES.map((s) => ({
            value: s.id,
            label: <TwoLineOption label={s.label} detail={s.description} />,
          }))}
          className={`grid grid-cols-2 ${STACKED_OPTIONS}`}
        />
      </div>

      <SegmentedControl variant="toggle" label="Encuadre" value={mode} onChange={setMode} options={MODE_OPTIONS} />

      {mode === 'curated' && (
        <div>
          <SectionLabel className="mb-1.5">Composición</SectionLabel>
          <SegmentedControl
            variant="toggle"
            label="Composición"
            value={curatedId}
            onChange={setCuratedId}
            options={CURATED_VIEWS.map((v) => ({
              value: v.id,
              label: <TwoLineOption label={v.label} detail={v.description} />,
            }))}
            className={`flex-col ${STACKED_OPTIONS}`}
          />
        </div>
      )}

      <div className="space-y-2 rounded-md border bg-card p-2.5">
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-[11px] tabular-nums text-muted-foreground">
            Padding {framePadding}%
            <input
              type="range"
              aria-label="Padding del encuadre"
              min="0"
              max="24"
              value={framePadding}
              onChange={(e) => setFramePadding(Number(e.target.value))}
              className="w-full accent-foreground"
            />
          </label>
          <label className="space-y-1 text-[11px] tabular-nums text-muted-foreground">
            Zoom {zoomDelta > 0 ? `+${zoomDelta}` : zoomDelta}
            <input
              type="range"
              aria-label="Zoom del encuadre"
              min="-3"
              max="3"
              value={zoomDelta}
              onChange={(e) => setZoomDelta(Number(e.target.value))}
              className="w-full accent-foreground"
            />
          </label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const bounds = getMapViewport()?.bounds;
            if (bounds) setManualBbox(bounds);
            setMode('manual');
          }}
          className="w-full"
        >
          <RefreshCw className="size-3.5" />
          Usar vista actual para encuadre manual
        </Button>
      </div>

      <div className="grid gap-2">
        <Input
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          placeholder="Título"
          aria-label="Título del fondo de pantalla"
        />
        <Input
          value={subtitleText}
          onChange={(e) => setSubtitleText(e.target.value)}
          placeholder="Subtítulo"
          aria-label="Subtítulo del fondo de pantalla"
        />
      </div>

      <div>
        <SectionLabel className="mb-1.5">Capas a incluir</SectionLabel>
        <div className="overflow-hidden rounded-md border">
          <LayerToggle
            label="Recorridos"
            detail="Trazados de los recorridos elegidos"
            checked={layers.recorridos}
            onChange={setLayer('recorridos')}
          />
          {layers.recorridos && (
            <SegmentedRows
              label="Recorridos"
              options={[
                ['visible', 'Visibles'],
                ['all', 'Toda la red'],
                ['biotren', 'Biotrén'],
                ['interurban', 'Interurbanos'],
              ]}
              value={routeMode}
              onChange={(v) => setRouteMode(v as WallpaperRouteMode)}
            />
          )}
          <LayerToggle
            label="Micros según horario"
            detail="Dónde deberían ir según el horario: estimadas, no GPS"
            checked={layers.servicios}
            onChange={setLayer('servicios')}
          />
          {layers.servicios && (
            <SegmentedRows
              label="Micros"
              options={[
                ['visible', 'Solo visibles'],
                ['all', 'Toda la red'],
              ]}
              value={servicesScope}
              onChange={(v) => setServicesScopeOverride(v as SimulationScope)}
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

      <div>
        <SectionLabel className="mb-1.5">Tamaño</SectionLabel>
        <div className="space-y-2">
          <SizeGroup label="Teléfono" presets={WALLPAPER_SIZES.filter((s) => s.group === 'phone')} selectedId={sizeId} onSelect={setSizeId} />
          <SizeGroup label="Computador" presets={WALLPAPER_SIZES.filter((s) => s.group === 'desktop')} selectedId={sizeId} onSelect={setSizeId} />
        </div>
      </div>

      <div className="space-y-2 rounded-md border bg-card p-2">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vista previa del fondo de pantalla"
            className="mx-auto max-h-[360px] rounded border object-contain"
          />
        ) : (
          <div className="grid h-40 place-items-center rounded border border-dashed text-[11px] text-muted-foreground">
            Preview pendiente
          </div>
        )}
        <Button type="button" variant="outline" onClick={generatePreview} disabled={previewBusy || busy} className="w-full">
          <Eye className="size-4" />
          {previewBusy ? progress ?? 'Generando preview…' : 'Generar preview'}
        </Button>
      </div>

      <Button type="button" onClick={generate} disabled={busy} className="w-full">
        <ImageDown className="size-4" />
        {busy ? progress ?? 'Generando…' : 'Descargar PNG'}
      </Button>

      {progress && !busy && <Notice tone="danger">{progress}</Notice>}

      <Notice>
        El PNG incluye la atribución embebida (OSM · Esri · GTFS oficial DTPR ·
        itinerarios EFE). Si lo publicas, mantén esa franja visible.
      </Notice>
    </div>
  );
}

function TwoLineOption({ label, detail }: { label: string; detail: string }) {
  return (
    <span className="min-w-0">
      <span className="block text-xs font-semibold">{label}</span>
      <span className="block text-[11px] font-normal leading-snug opacity-75">{detail}</span>
    </span>
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
      <SectionLabel className="mb-1.5">{label}</SectionLabel>
      {/* Cada opción crece desde su ancho natural: a partes iguales "Interurbanos" no cabe. */}
      <SegmentedControl
        variant="toggle"
        size="sm"
        label={label}
        value={value}
        onChange={onChange}
        options={options.map(([id, text]) => ({ value: id, label: text }))}
        className="[&>button]:flex-auto"
      />
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
  const selected = presets.some((p) => p.id === selectedId) ? selectedId : null;
  return (
    <div>
      <SectionLabel className="mb-1">{label}</SectionLabel>
      <SegmentedControl
        variant="toggle"
        size="sm"
        label={label}
        value={selected}
        onChange={onSelect}
        options={presets.map((p) => ({
          value: p.id,
          label: (
            <span className="flex w-full items-center justify-between gap-2">
              <span className="text-sm font-normal">{p.label}</span>
              <span className="font-mono text-[11px] font-normal tabular-nums opacity-75">
                {p.width}×{p.height}
              </span>
            </span>
          ),
        }))}
        className={`flex-col ${STACKED_OPTIONS}`}
      />
    </div>
  );
}

async function loadCoverage(bbox?: [[number, number], [number, number]]) {
  const mod = await import('@/data/coverage.generated');
  return mod.COVERAGE_CELLS.flatMap(([lat, lng, dist]: CoverageCell) => {
    if (bbox && !pointInBbox(lat, lng, bbox)) return [];
    return [{
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
    }];
  });
}

async function loadCycleways(bbox: [[number, number], [number, number]]) {
  const mod = await import('@/data/cycleways.generated');
  // Trazo de cada tipo como en la capa del mapa; el color lo pone buildWallpaper según el tema.
  return mod.CYCLEWAYS.flatMap((c) => {
    if (!pathIntersectsBbox(c.path, bbox)) return [];
    const style = CYCLEWAY_KIND_STYLE[c.kind];
    return [{ path: c.path, color: style.color, weight: style.weight, dash: style.dash?.split(' ').map(Number) }];
  });
}

async function loadGreenspace(bbox: [[number, number], [number, number]]) {
  const mod = await import('@/data/greenspace.generated');
  const spaces = [];
  for (const g of mod.GREEN_SPACES) {
    if (!pathIntersectsBbox(g.ring, bbox)) continue;
    spaces.push({
      ring: g.ring,
      fill:
        g.kind === 'forest' || g.kind === 'nature_reserve'
          ? 'rgba(22, 163, 74, 0.24)'
          : 'rgba(34, 197, 94, 0.32)',
      stroke: 'rgba(22, 163, 74, 0.42)',
    });
    if (spaces.length >= 900) break;
  }
  return spaces;
}

async function loadSchools(bbox: [[number, number], [number, number]]) {
  const mod = await import('@/data/schools.generated');
  return mod.SCHOOLS.flatMap((s) =>
    pointInBbox(s.lat, s.lng, bbox)
      ? [{
      lat: s.lat,
      lng: s.lng,
      color: SCHOOL_COLOR[s.kind],
      radius: s.kind === 'university' || s.kind === 'college' ? 3.1 : 2.3,
        }]
      : [],
  );
}

/** Micros estimadas ahora según horario (siempre estimadas: el PNG no lleva GPS). */
async function loadWallpaperVehicles(scope: SimulationScope, visibleRouteIds: readonly string[]) {
  const schedules = await loadSimulationSchedules();
  const visible = new Set(visibleRouteIds);
  const routes = scope === 'visible' ? ROUTES.filter((r) => visible.has(r.id)) : ROUTES;
  return computeActiveVehicles(new Date(), buildSimulationRoutes(routes), schedules);
}

function pointInBbox(lat: number, lng: number, bbox: [[number, number], [number, number]]) {
  const [[latMin, lngMin], [latMax, lngMax]] = bbox;
  return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
}

function pathIntersectsBbox(path: Array<[number, number]>, bbox: [[number, number], [number, number]]) {
  return path.some(([lat, lng]) => pointInBbox(lat, lng, bbox));
}
