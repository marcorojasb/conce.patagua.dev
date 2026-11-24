import {
  AlertTriangle,
  Bike,
  BookOpen,
  Bus,
  Building2,
  CheckCircle2,
  Compass,
  Crosshair,
  Download,
  Ellipsis,
  Gauge,
  GraduationCap,
  Grid3x3,
  ImageDown,
  Layers2,
  Loader2,
  MapPin,
  RotateCcw,
  School,
  Trees,
  Wind,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { INTERURBAN_CORRIDORS } from '@/data/interurban-corridors';
import type { AnalysisTab } from '@/components/floating-tools-panel';
import type { LayerLoadStatus } from '@/hooks/use-layer-status';

const LAYERS_EYEBROW = (
  <>
    <Layers2 />
    Mapa
  </>
);

interface MapLayerControlProps {
  terminalsCount: number;
  paraderosCount: number;
  poisCount: number;
  visibility: MapLayerControlVisibility;
  simulationScope: 'visible' | 'all';
  coverageThreshold: 'all' | 'underserved';
  onToggleTerminals: () => void;
  onToggleParaderos: () => void;
  onTogglePois: () => void;
  onToggleAirQuality: () => void;
  onToggleSimulatedVehicles: () => void;
  onSetSimulationScope: (scope: 'visible' | 'all') => void;
  onToggleCoverage: () => void;
  onSetCoverageThreshold: (t: 'all' | 'underserved') => void;
  onToggleCycleways: () => void;
  onToggleGreenspace: () => void;
  onToggleSchools: () => void;
  onToggleInterurbanCorridors: () => void;
  airQualityStatus: { stations: { id: string }[]; loading: boolean; error: string | null };
  simulationStatus: {
    count: number;
    nonGtfsCount: number;
    loading: boolean;
    error: string | null;
  };
  coverageStatus: LayerLoadStatus;
  cyclewaysStatus: LayerLoadStatus;
  greenspaceStatus: LayerLoadStatus;
  schoolsStatus: LayerLoadStatus;
  onRetryCoverage: () => void;
  onRetryCycleways: () => void;
  onRetryGreenspace: () => void;
  onRetrySchools: () => void;
  onRetryAirQuality: () => void;
  onRetrySimulation: () => void;
  layersOpen: boolean;
  onToggleLayers: () => void;
  onCloseLayers: () => void;
  onRecenter: () => void;
  // Toggle the analysis tool panel. Click same = close, different = switch.
  onOpenTool: (tab: AnalysisTab) => void;
  /** Active tool, drives the pressed state on toolbar buttons. */
  activeTool: AnalysisTab | null;
}

interface MapLayerControlVisibility {
  terminals: boolean;
  paraderos: boolean;
  pois: boolean;
  airQuality: boolean;
  simulatedVehicles: boolean;
  coverage: boolean;
  cycleways: boolean;
  greenspace: boolean;
  schools: boolean;
  interurbanCorridors: boolean;
}

interface ToolBtn {
  id: AnalysisTab;
  label: string;
  Icon: typeof Compass;
}

interface MapLayerRow {
  id: string;
  label: string;
  detail: string;
  icon: typeof Compass;
  checked: boolean;
  onToggle: () => void;
  loading?: boolean;
  error?: string | null;
  ready?: boolean;
  onRetry?: () => void;
}

const TOOLS: ToolBtn[] = [
  { id: 'cobertura', label: 'Planificador (cobertura OD)', Icon: Compass },
  { id: 'operadores', label: 'Operadores', Icon: Building2 },
  { id: 'calidad', label: 'Calidad de datos', Icon: Gauge },
  { id: 'export', label: 'Exportar GeoJSON', Icon: Download },
  { id: 'wallpaper', label: 'Fondo de pantalla', Icon: ImageDown },
];

// En móvil la columna solo muestra el planificador; el resto de las
// herramientas va al menú "Más herramientas" para no tapar el mapa.
const MOBILE_TOOL: AnalysisTab = 'cobertura';
const OVERFLOW_TOOLS = TOOLS.filter((t) => t.id !== MOBILE_TOOL);

// Sized smaller in mobile so the stacked buttons fit comfortably without
// dominating the right edge of the map.
const BTN_CLASS =
  'pointer-events-auto size-9 border-border/80 bg-background/90 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/85 md:h-10 md:w-10';

interface ToolsOverflowMenuProps {
  activeTool: AnalysisTab | null;
  onSelect: (tab: AnalysisTab) => void;
}

/** Menú de herramientas secundarias, solo bajo `md`. */
function ToolsOverflowMenu({ activeTool, onSelect }: ToolsOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const activeInMenu = OVERFLOW_TOOLS.some((t) => t.id === activeTool);

  useEffect(() => {
    if (!open) return undefined;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitemradio"]')?.focus();
    // En fase de captura: ningún stopPropagation del mapa o de otro panel
    // impide que el "clic fuera" cierre el menú.
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === 'Escape') {
      // Sin esto el Escape también cerraría el panel de herramienta abierto.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [],
    );
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === 'ArrowDown'
        ? (current + 1) % items.length
        : event.key === 'ArrowUp'
          ? (current - 1 + items.length) % items.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : -1;
    if (next === -1) return;
    event.preventDefault();
    items[next].focus();
  };

  return (
    // El menú se ancla a la columna completa (no a este botón) para abrir
    // desde arriba y no quedar bajo la hoja inferior de un panel abierto.
    <div ref={wrapperRef} className="sm:hidden" onKeyDown={onKeyDown}>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen((value) => !value)}
        aria-label="Más herramientas"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={cn(
          BTN_CLASS,
          (open || activeInMenu) && 'bg-accent text-accent-foreground',
          activeInMenu && 'border-foreground/40',
        )}
      >
        <Ellipsis className="size-4" />
      </Button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Más herramientas"
          className="pointer-events-auto absolute right-full top-0 mr-2 w-56 rounded-lg border bg-popover/95 p-1 text-popover-foreground shadow-xl backdrop-blur supports-[backdrop-filter]:bg-popover/90 animate-fade-in"
        >
          {OVERFLOW_TOOLS.map((t) => {
            const Icon = t.Icon;
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                tabIndex={-1}
                onClick={() => {
                  // El menú se desmonta: el foco vuelve a su botón y desde ahí
                  // el panel que se abre lo toma.
                  buttonRef.current?.focus();
                  setOpen(false);
                  onSelect(t.id);
                }}
                className={cn(
                  'flex min-h-11 w-full items-center gap-3 rounded-md px-2.5 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                  isActive && 'bg-accent font-medium text-accent-foreground',
                )}
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{t.label}</span>
                {isActive && (
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-giant-component -- Data-driven layer rows keep the floating toolbar and its layer popover in one cohesive control surface.
export function MapLayerControl({
  terminalsCount,
  paraderosCount,
  poisCount,
  visibility,
  simulationScope,
  coverageThreshold,
  onToggleTerminals,
  onToggleParaderos,
  onTogglePois,
  onToggleAirQuality,
  onToggleSimulatedVehicles,
  onSetSimulationScope,
  onToggleCoverage,
  onSetCoverageThreshold,
  onToggleCycleways,
  onToggleGreenspace,
  onToggleSchools,
  onToggleInterurbanCorridors,
  airQualityStatus,
  simulationStatus,
  coverageStatus,
  cyclewaysStatus,
  greenspaceStatus,
  schoolsStatus,
  onRetryCoverage,
  onRetryCycleways,
  onRetryGreenspace,
  onRetrySchools,
  onRetryAirQuality,
  onRetrySimulation,
  layersOpen,
  onToggleLayers,
  onCloseLayers,
  onRecenter,
  onOpenTool,
  activeTool,
}: MapLayerControlProps) {
  const {
    terminals: showTerminals,
    paraderos: showParaderos,
    pois: showPois,
    airQuality: showAirQuality,
    simulatedVehicles: showSimulatedVehicles,
    coverage: showCoverage,
    cycleways: showCycleways,
    greenspace: showGreenspace,
    schools: showSchools,
    interurbanCorridors: showInterurbanCorridors,
  } = visibility;

  const enabledCount = [
    showTerminals,
    showParaderos,
    showPois,
    showAirQuality,
    showSimulatedVehicles,
    showCoverage,
    showCycleways,
    showGreenspace,
    showSchools,
    showInterurbanCorridors,
  ].filter(Boolean).length;


  const layers = useMemo<MapLayerRow[]>(
    () => [
      {
        id: 'paraderos',
        label: 'Paraderos GTFS',
        detail: `${paraderosCount.toLocaleString('es-CL')} puntos · zoom 14+`,
        icon: MapPin,
        checked: showParaderos,
        onToggle: onToggleParaderos,
      },
      {
        id: 'terminales',
        label: 'Terminales',
        detail: `${terminalsCount.toLocaleString('es-CL')} puntos`,
        icon: Building2,
        checked: showTerminals,
        onToggle: onToggleTerminals,
      },
      {
        id: 'destinos',
        label: 'Centros de atracción',
        detail: `${poisCount.toLocaleString('es-CL')} puntos`,
        icon: GraduationCap,
        checked: showPois,
        onToggle: onTogglePois,
      },
      {
        id: 'aire',
        label: 'Calidad del aire',
        detail: airQualityStatus.error
          ? 'Error al cargar estaciones'
          : showAirQuality
          ? `${airQualityStatus.stations.length.toLocaleString('es-CL')} estaciones`
          : 'Estaciones SINCA',
        icon: airQualityStatus.error ? AlertTriangle : airQualityStatus.loading ? Loader2 : Wind,
        checked: showAirQuality,
        onToggle: onToggleAirQuality,
        loading: airQualityStatus.loading,
        error: airQualityStatus.error,
        ready: showAirQuality && !airQualityStatus.loading && airQualityStatus.stations.length > 0,
        onRetry: onRetryAirQuality,
      },
      {
        id: 'simulated',
        label: 'Servicios en curso (estimación)',
        detail: showSimulatedVehicles
          ? simulationStatus.loading
            ? 'Cargando horario…'
              : simulationStatus.error
              ? 'No se pudo cargar el horario'
              : simulationStatus.count > 0
                ? `${simulationStatus.count.toLocaleString('es-CL')} en curso · ${simulationScope === 'visible' ? 'rutas visibles' : 'toda la red'}`
                : 'Sin servicios programados activos ahora'
          : 'Según horario, no es GPS',
        icon: simulationStatus.error ? AlertTriangle : simulationStatus.loading ? Loader2 : Bus,
        checked: showSimulatedVehicles,
        onToggle: onToggleSimulatedVehicles,
        loading: simulationStatus.loading,
        error: simulationStatus.error,
        ready: showSimulatedVehicles && !simulationStatus.loading && simulationStatus.count > 0,
        onRetry: onRetrySimulation,
      },
      {
        id: 'coverage',
        label: 'Cobertura territorial',
        detail: showCoverage
          ? coverageStatus.error
            ? 'Error al cargar grilla'
            : coverageStatus.loading
            ? 'Cargando grilla…'
            : coverageThreshold === 'underserved'
              ? 'Solo zonas > 600 m del paradero'
              : 'Distancia al paradero más cercano'
          : 'Heatmap por distancia',
        icon: coverageStatus.error ? AlertTriangle : coverageStatus.loading ? Loader2 : Grid3x3,
        checked: showCoverage,
        onToggle: onToggleCoverage,
        loading: coverageStatus.loading,
        error: coverageStatus.error,
        ready: coverageStatus.ready,
        onRetry: onRetryCoverage,
      },
      {
        id: 'cycleways',
        label: 'Infraestructura ciclista',
        detail: showCycleways
          ? cyclewaysStatus.error
            ? 'Error al cargar trazados'
            : cyclewaysStatus.loading
            ? 'Cargando trazados…'
            : 'Ciclovías, ciclobandas y rutas compartidas (OSM)'
          : 'Red ciclista del Gran Concepción',
        icon: cyclewaysStatus.error ? AlertTriangle : cyclewaysStatus.loading ? Loader2 : Bike,
        checked: showCycleways,
        onToggle: onToggleCycleways,
        loading: cyclewaysStatus.loading,
        error: cyclewaysStatus.error,
        ready: cyclewaysStatus.ready,
        onRetry: onRetryCycleways,
      },
      {
        id: 'greenspace',
        label: 'Áreas verdes',
        detail: showGreenspace
          ? greenspaceStatus.error
            ? 'Error al cargar polígonos'
            : greenspaceStatus.loading
            ? 'Cargando polígonos…'
            : 'Parques, plazas, bosques y reservas (OSM)'
          : 'Espacios verdes públicos',
        icon: greenspaceStatus.error ? AlertTriangle : greenspaceStatus.loading ? Loader2 : Trees,
        checked: showGreenspace,
        onToggle: onToggleGreenspace,
        loading: greenspaceStatus.loading,
        error: greenspaceStatus.error,
        ready: greenspaceStatus.ready,
        onRetry: onRetryGreenspace,
      },
      {
        id: 'schools',
        label: 'Educación',
        detail: showSchools
          ? schoolsStatus.error
            ? 'Error al cargar educación'
            : schoolsStatus.loading
            ? 'Cargando establecimientos…'
            : 'Jardines, colegios, liceos, universidades'
          : 'Establecimientos educacionales (OSM)',
        icon: schoolsStatus.error ? AlertTriangle : schoolsStatus.loading ? Loader2 : School,
        checked: showSchools,
        onToggle: onToggleSchools,
        loading: schoolsStatus.loading,
        error: schoolsStatus.error,
        ready: schoolsStatus.ready,
        onRetry: onRetrySchools,
      },
      // Toggle de corredores interurbanos, solo aparece si hay corredores
      // sin trazado verificable en el dataset. Hoy la 201 vive como ruta
      // nativa, así que el toggle se esconde hasta que se agregue otro
      // corredor (Florida / Yumbel / Tomé rural) a interurban-corridors.ts.
      ...(INTERURBAN_CORRIDORS.length > 0
        ? [
            {
              id: 'interurban',
              label: 'Corredores interurbanos',
              detail: showInterurbanCorridors
                ? 'Servicios licitados fuera del GTFS urbano · enlace al wiki'
                : 'Pines a comunas rurales/satélite',
              icon: BookOpen,
              checked: showInterurbanCorridors,
              onToggle: onToggleInterurbanCorridors,
            },
          ]
        : []),
    ],
    [
      airQualityStatus.loading,
      airQualityStatus.stations.length,
      airQualityStatus.error,
      onRetryAirQuality,
      onToggleAirQuality,
      onToggleParaderos,
      onTogglePois,
      onToggleSimulatedVehicles,
      onToggleTerminals,
      onToggleCoverage,
      paraderosCount,
      poisCount,
      showAirQuality,
      showCoverage,
      showParaderos,
      showPois,
      showSimulatedVehicles,
      simulationScope,
      showTerminals,
      simulationStatus.count,
      simulationStatus.error,
      simulationStatus.loading,
      onRetrySimulation,
      coverageThreshold,
      coverageStatus.loading,
      coverageStatus.error,
      coverageStatus.ready,
      onRetryCoverage,
      terminalsCount,
      showCycleways,
      onToggleCycleways,
      cyclewaysStatus.loading,
      cyclewaysStatus.error,
      cyclewaysStatus.ready,
      onRetryCycleways,
      showGreenspace,
      onToggleGreenspace,
      greenspaceStatus.loading,
      greenspaceStatus.error,
      greenspaceStatus.ready,
      onRetryGreenspace,
      showSchools,
      onToggleSchools,
      schoolsStatus.loading,
      schoolsStatus.error,
      schoolsStatus.ready,
      onRetrySchools,
      showInterurbanCorridors,
      onToggleInterurbanCorridors,
    ],
  );

  return (
    <>
      <div className="pointer-events-none absolute right-2 top-2 z-20 flex flex-col items-end gap-1.5 md:right-3 md:top-3 md:gap-2">
      <Tooltip content="Centrar Gran Concepción" side="left">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRecenter}
          aria-label="Centrar Gran Concepción"
          className={BTN_CLASS}
        >
          <Crosshair className="size-4" />
        </Button>
      </Tooltip>

      <Tooltip content="Capas del mapa" side="left">
        <Button
          type="button"
          variant="outline"
          size="icon"
              onClick={onToggleLayers}
              aria-expanded={layersOpen}
              aria-label="Abrir capas del mapa"
              className={cn(BTN_CLASS, layersOpen && 'bg-accent text-accent-foreground')}
        >
          <Layers2 className="size-4" />
          {enabledCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium leading-none text-background">
              {enabledCount}
            </span>
          )}
        </Button>
      </Tooltip>

      {/* Visual separator between view controls (recenter, layers) and
          analysis tools (planner, operators, export, wallpaper). */}
      <div aria-hidden className="pointer-events-none h-px w-5 bg-border/60 md:w-6" />

      {TOOLS.map((t) => {
        const Icon = t.Icon;
        const isActive = activeTool === t.id;
        return (
          <Tooltip key={t.id} content={t.label} side="left">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                onCloseLayers();
                onOpenTool(t.id);
              }}
              aria-label={t.label}
              aria-pressed={isActive}
              className={cn(
                BTN_CLASS,
                t.id !== MOBILE_TOOL && 'hidden sm:inline-flex',
                isActive && 'bg-accent text-accent-foreground border-foreground/40',
              )}
            >
              <Icon className="size-4" />
            </Button>
          </Tooltip>
        );
      })}

      <ToolsOverflowMenu
        activeTool={activeTool}
        onSelect={(tab) => {
          onCloseLayers();
          onOpenTool(tab);
        }}
      />
      </div>

      <FloatingInfoPanel
        open={layersOpen}
        onClose={onCloseLayers}
        title="Capas del mapa"
        eyebrow={LAYERS_EYEBROW}
        description="Lo que se dibuja sobre los recorridos."
        closeLabel="Cerrar capas"
        contentClassName="space-y-1 px-3 py-3"
      >
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div key={layer.id}>
                  <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-accent/50">
                    <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-muted/40 text-muted-foreground">
                      <Icon className={cn('size-4', layer.loading && 'animate-spin')} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium leading-tight">
                        {layer.label}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {layer.detail}
                      </span>
                      {layer.error && layer.checked && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            layer.onRetry?.();
                          }}
                          className="mt-1 inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground focus-ring"
                        >
                          <RotateCcw className="size-3" />
                          Reintentar
                        </button>
                      )}
                    </span>
                    {layer.ready && layer.checked && !layer.loading && !layer.error && (
                      <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                    )}
                    <Switch
                      checked={layer.checked}
                      onCheckedChange={layer.onToggle}
                      aria-label={layer.label}
                    />
                  </label>
                  {layer.id === 'coverage' && layer.checked && (
                    <div className="ml-10 flex flex-wrap gap-1 pb-1 pl-2">
                      <button
                        type="button"
                        onClick={() => onSetCoverageThreshold('all')}
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] transition-colors focus-ring',
                          coverageThreshold === 'all'
                            ? 'bg-foreground text-background'
                            : 'border bg-background text-muted-foreground hover:text-foreground',
                        )}
                      >
                        Heatmap completo
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetCoverageThreshold('underserved')}
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] transition-colors focus-ring',
                          coverageThreshold === 'underserved'
                            ? 'bg-foreground text-background'
                            : 'border bg-background text-muted-foreground hover:text-foreground',
                        )}
                      >
                        Solo zonas mal servidas
                      </button>
                    </div>
                  )}
                  {layer.id === 'simulated' && layer.checked && (
                    <div className="ml-10 flex flex-wrap gap-1 pb-1 pl-2">
                      <button
                        type="button"
                        onClick={() => onSetSimulationScope('visible')}
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] transition-colors focus-ring',
                          simulationScope === 'visible'
                            ? 'bg-foreground text-background'
                            : 'border bg-background text-muted-foreground hover:text-foreground',
                        )}
                      >
                        Solo visibles
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetSimulationScope('all')}
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] transition-colors focus-ring',
                          simulationScope === 'all'
                            ? 'bg-foreground text-background'
                            : 'border bg-background text-muted-foreground hover:text-foreground',
                        )}
                      >
                        Toda la red
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {showCoverage && (
              <div className="mt-2 rounded-md border bg-muted/30 p-2">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Distancia al paradero
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                  {[
                    { color: '#15803d', label: '≤200 m' },
                    { color: '#65a30d', label: '200–400' },
                    { color: '#facc15', label: '400–600' },
                    { color: '#f97316', label: '600–1000' },
                    { color: '#dc2626', label: '>1 km' },
                  ].map((b) => (
                    <span key={b.label} className="inline-flex items-center gap-1">
                      <span
                        aria-hidden
                        className="inline-block h-2.5 w-3 rounded-sm"
                        style={{ background: b.color }}
                      />
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {showCycleways && (
              <div className="mt-2 rounded-md border bg-muted/30 p-2">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Infraestructura ciclista
                </div>
                <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="inline-block h-[3px] w-5 rounded-full" style={{ background: '#2563eb' }} />
                    Ciclovía segregada
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="inline-block h-[3px] w-5 rounded-full" style={{ background: '#06b6d4' }} />
                    Ciclobanda en calzada
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="inline-block h-[3px] w-5 border-t-2 border-dashed" style={{ borderColor: '#6366f1' }} />
                    Ruta compartida (peatón)
                  </span>
                </div>
              </div>
            )}
      </FloatingInfoPanel>
    </>
  );
}
