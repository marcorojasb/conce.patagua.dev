// Columna de botones a la derecha del mapa: centrar, Capas, la guía de inicio
// ("?") y las herramientas. Capas es una ventanita no modal junto a la
// columna (en móvil, un panel abajo): no es una superficie, no toca la ficha
// abierta y se cierra con Escape, Atrás, "×" o tocando fuera. Las micros ya
// no están aquí: tienen su propio control sobre el mapa ("Micros en el mapa"),
// y las claves de cobertura y ciclovías pasaron a la leyenda.

import {
  AlertTriangle,
  Bike,
  BookOpen,
  Building2,
  CheckCircle2,
  CircleHelp,
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
  Route as RouteIcon,
  RotateCcw,
  School,
  Trees,
  Wind,
  X,
} from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { useWelcomeCard } from '@/components/welcome-card';
import { INTERURBAN_CORRIDORS } from '@/data/interurban-corridors';
import { cn } from '@/lib/utils';
import type { LayerLoadStatus } from '@/hooks/use-layer-status';
import type { LoadableLayer, MapLayerControlProps, MapLayersState, ToolId } from '@/types/ui-contracts';

interface ToolButton {
  id: ToolId;
  label: string;
  Icon: typeof Crosshair;
}

const TOOLS: ToolButton[] = [
  { id: 'planner', label: 'Planificador', Icon: RouteIcon },
  { id: 'operators', label: 'Operadores', Icon: Building2 },
  { id: 'quality', label: 'Calidad de datos', Icon: Gauge },
  { id: 'export', label: 'Exportar GeoJSON', Icon: Download },
  { id: 'wallpaper', label: 'Fondo de pantalla', Icon: ImageDown },
];

// En móvil la columna solo muestra el planificador; el resto de las
// herramientas va al menú "Más herramientas" para no tapar el mapa.
const MOBILE_TOOL: ToolId = 'planner';
const OVERFLOW_TOOLS = TOOLS.filter((t) => t.id !== MOBILE_TOOL);

// Botones del riel: superficie de control de 40 px en todo tamaño, como el
// zoom de Leaflet (index.css). Encendido (Capas abierta, herramienta a la
// vista) va invertido, como toda opción elegida.
const BTN_CLASS =
  'surface-control pointer-events-auto size-10 rounded-lg p-0 text-foreground md:size-10 [&_svg]:size-[18px]';
const BTN_ON = 'border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background';

type CoverageThreshold = MapLayersState['coverageThreshold'];
const COVERAGE_OPTIONS: readonly SegmentedOption<CoverageThreshold>[] = [
  { value: 'all', name: 'Todas las zonas', label: 'Todas las zonas' },
  // El texto visible está dentro del nombre accesible.
  { value: 'underserved', name: 'Solo zonas mal servidas', label: 'Mal servidas' },
];

interface LayerRow {
  key: keyof MapLayersState;
  label: string;
  detail: string;
  Icon: typeof Crosshair;
  /** Capa que se descarga al prenderla: muestra carga, error y "Reintentar". */
  load?: LoadableLayer | 'airQuality';
}

function loadState(
  row: LayerRow,
  status: MapLayerControlProps['status'],
): (LayerLoadStatus & { detail?: string }) | null {
  if (!row.load) return null;
  if (row.load === 'airQuality') {
    const air = status.airQuality;
    return {
      loading: air.loading,
      error: air.error,
      ready: !air.loading && !air.error && air.stations > 0,
      detail: air.stations > 0 ? `${air.stations.toLocaleString('es-CL')} estaciones SINCA` : undefined,
    };
  }
  return status[row.load];
}

const LOADING_TEXT: Record<LoadableLayer | 'airQuality', string> = {
  coverage: 'Cargando grilla…',
  cycleways: 'Cargando trazados…',
  greenspace: 'Cargando polígonos…',
  schools: 'Cargando establecimientos…',
  airQuality: 'Cargando estaciones…',
};

function layerRows(counts: MapLayerControlProps['counts']): LayerRow[] {
  const rows: LayerRow[] = [
    {
      key: 'paraderos',
      label: 'Paraderos GTFS',
      detail: `${counts.paraderos.toLocaleString('es-CL')} paraderos con llegadas en vivo · desde zoom 14`,
      Icon: MapPin,
    },
    { key: 'terminals', label: 'Terminales', detail: `${counts.terminals.toLocaleString('es-CL')} terminales`, Icon: Building2 },
    {
      key: 'pois',
      label: 'Centros de atracción',
      detail: `${counts.pois.toLocaleString('es-CL')} lugares (universidades, hospitales…)`,
      Icon: GraduationCap,
    },
    { key: 'airQuality', label: 'Calidad del aire', detail: 'Estaciones SINCA', Icon: Wind, load: 'airQuality' },
    {
      key: 'coverage',
      label: 'Cobertura territorial',
      detail: 'Distancia caminando al paradero más cercano',
      Icon: Grid3x3,
      load: 'coverage',
    },
    {
      key: 'cycleways',
      label: 'Ciclovías',
      detail: 'Segregadas, ciclobandas y rutas compartidas (OSM)',
      Icon: Bike,
      load: 'cycleways',
    },
    { key: 'greenspace', label: 'Áreas verdes', detail: 'Parques, plazas y reservas (OSM)', Icon: Trees, load: 'greenspace' },
    { key: 'schools', label: 'Educación', detail: 'Jardines, colegios y universidades (OSM)', Icon: School, load: 'schools' },
  ];
  // Solo si hay corredores sin GTFS en el dataset (hoy Florida y Yumbel).
  if (INTERURBAN_CORRIDORS.length > 0) {
    rows.push({
      key: 'corridors',
      label: 'Corredores interurbanos',
      detail: 'Servicios privados sin GTFS (Florida, Yumbel)',
      Icon: BookOpen,
    });
  }
  return rows;
}

function LayersPopover({
  counts,
  layers,
  onLayersChange,
  status,
  onRetry,
}: Pick<MapLayerControlProps, 'counts' | 'layers' | 'onLayersChange' | 'status' | 'onRetry'>) {
  const rows = layerRows(counts);
  return (
    <div className="space-y-0.5 p-2">
      {rows.map((row) => {
        const checked = layers[row.key] === true;
        const load = loadState(row, status);
        const loading = checked && !!load?.loading;
        const error = checked ? (load?.error ?? null) : null;
        const Icon = error ? AlertTriangle : loading ? Loader2 : row.Icon;
        const detail = error
          ? 'No se pudo cargar'
          : loading && row.load
            ? LOADING_TEXT[row.load]
            : checked && load?.detail
              ? load.detail
              : row.detail;
        return (
          <div key={row.key}>
            <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-accent/50">
              <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-muted/40 text-muted-foreground">
                <Icon className={cn('size-4', loading && 'animate-spin', error && 'text-stale')} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium leading-tight">{row.label}</span>
                <span className="block text-[11px] leading-snug text-muted-foreground">{detail}</span>
                {error && row.load && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onRetry(row.load!);
                    }}
                    className="mt-1 inline-flex min-h-10 items-center gap-1 rounded-md border bg-background px-2 text-[11px] font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-foreground focus-ring md:min-h-7"
                  >
                    <RotateCcw className="size-3" />
                    Reintentar
                  </button>
                )}
              </span>
              {checked && load?.ready && !loading && !error && (
                <CheckCircle2 className="size-3.5 shrink-0 text-live" />
              )}
              <Switch
                checked={checked}
                onCheckedChange={(value) => onLayersChange({ [row.key]: value })}
                aria-label={row.label}
              />
            </label>
            {row.key === 'coverage' && checked && (
              <SegmentedControl
                variant="radio"
                size="sm"
                label="Qué zonas mostrar"
                value={layers.coverageThreshold}
                options={COVERAGE_OPTIONS}
                onChange={(value) => onLayersChange({ coverageThreshold: value })}
                className="ml-12 mr-2 pb-1"
              />
            )}
          </div>
        );
      })}
      <p className="px-2 pt-1 text-[11px] text-muted-foreground">
        Las claves de color de las capas encendidas están en la leyenda del mapa.
      </p>
    </div>
  );
}

/** Menú de herramientas secundarias, solo en móvil. */
function ToolsOverflowMenu({ activePanel, onSelect }: { activePanel: MapLayerControlProps['activePanel']; onSelect: (tool: ToolId) => void }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const activeInMenu = OVERFLOW_TOOLS.some((t) => t.id === activePanel);

  useEffect(() => {
    if (!open) return undefined;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitemradio"]')?.focus();
    // En fase de captura: ningún stopPropagation del mapa impide que tocar fuera lo cierre.
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
      // El Escape es del menú: no cierra la superficie de abajo.
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
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
    // relative: el menú se abre junto a su botón (hacia arriba, sobre la ficha
    // que pueda haber abajo), no junto al primer botón de la columna.
    <div ref={wrapperRef} className="relative sm:hidden" onKeyDown={onKeyDown}>
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((value) => !value)}
        aria-label="Más herramientas"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={cn(BTN_CLASS, (open || activeInMenu) && BTN_ON)}
      >
        <Ellipsis />
      </Button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Más herramientas"
          className="surface-panel pointer-events-auto absolute bottom-0 right-full mr-2 w-56 p-1 animate-fade-in"
        >
          {OVERFLOW_TOOLS.map((t) => {
            const isActive = activePanel === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                tabIndex={-1}
                onClick={() => {
                  buttonRef.current?.focus();
                  setOpen(false);
                  onSelect(t.id);
                }}
                className={cn(
                  'flex min-h-10 w-full items-center gap-3 rounded-md px-2.5 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                  isActive && 'bg-accent font-medium text-accent-foreground',
                )}
              >
                <t.Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{t.label}</span>
                {isActive && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-foreground" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MapLayerControl({
  counts,
  layers,
  onLayersChange,
  status,
  onRetry,
  layersOpen,
  onLayersOpenChange,
  onRecenter,
  activePanel,
  onToggleTool,
}: MapLayerControlProps) {
  const welcome = useWelcomeCard();
  const popoverId = useId();
  const layersButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // El foco estaba dentro de Capas: al cerrarla (Escape, ×, Atrás) vuelve al
  // botón que la abrió. Se anota al moverse el foco, porque al cerrar el nodo
  // ya salió del DOM y el foco quedó en <body>.
  const focusInsideRef = useRef(false);
  const closeRef = useRef(onLayersOpenChange);
  useEffect(() => {
    closeRef.current = onLayersOpenChange;
  }, [onLayersOpenChange]);
  // En escritorio, con una ficha abierta a la derecha, Capas se abre a su
  // izquierda en vez de taparla (si cabe); px desde el borde derecho del mapa.
  const [anchorRight, setAnchorRight] = useState<number | null>(null);

  const enabledCount = (
    ['paraderos', 'terminals', 'pois', 'airQuality', 'coverage', 'cycleways', 'greenspace', 'schools', 'corridors'] as const
  ).filter((key) => layers[key]).length;

  useLayoutEffect(() => {
    if (!layersOpen) return undefined;
    const place = () => {
      const popover = popoverRef.current;
      const parent = popover?.offsetParent?.getBoundingClientRect();
      const surface = document.querySelector('[data-surface]')?.getBoundingClientRect();
      if (!popover || !parent || !surface || surface.width === 0 || !window.matchMedia('(min-width: 640px)').matches) {
        setAnchorRight(null);
        return;
      }
      const right = parent.right - surface.left + 8;
      const fits = surface.left > parent.left + parent.width / 2 && parent.width - right - 8 >= popover.offsetWidth;
      setAnchorRight(fits ? Math.round(right) : null);
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [layersOpen]);

  useEffect(() => {
    if (!layersOpen) return undefined;
    const popover = popoverRef.current;
    popover?.focus({ preventScroll: true });
    focusInsideRef.current = true;
    // Tocar fuera la cierra (en captura, antes que el mapa); el botón Capas se maneja solo.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popover?.contains(target) || layersButtonRef.current?.contains(target)) return;
      focusInsideRef.current = false;
      closeRef.current(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      if (focusInsideRef.current) layersButtonRef.current?.focus({ preventScroll: true });
      focusInsideRef.current = false;
    };
  }, [layersOpen]);

  const closeLayers = () => {
    layersButtonRef.current?.focus({ preventScroll: true });
    onLayersOpenChange(false);
  };

  const onPopoverKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    // El Escape es de Capas: no cierra la ficha de abajo.
    event.preventDefault();
    closeLayers();
  };

  return (
    <>
      <div
        data-map-rail
        className="pointer-events-none absolute right-2 top-2 z-20 flex flex-col items-end gap-1.5 md:right-3 md:top-3 md:gap-2"
      >
        <Tooltip content="Centrar Gran Concepción" side="left">
          <Button type="button" variant="ghost" size="icon" onClick={onRecenter} aria-label="Centrar Gran Concepción" className={BTN_CLASS}>
            <Crosshair />
          </Button>
        </Tooltip>

        <Tooltip content="Capas del mapa" side="left">
          <Button
            ref={layersButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onLayersOpenChange(!layersOpen)}
            aria-expanded={layersOpen}
            aria-controls={layersOpen ? popoverId : undefined}
            aria-label="Capas del mapa"
            className={cn(BTN_CLASS, 'relative', layersOpen && BTN_ON)}
          >
            <Layers2 />
            {enabledCount > 0 && (
              // Aro del color de fondo: se separa del botón también cuando éste va invertido.
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[10px] font-medium leading-4 text-background ring-2 ring-background">
                {enabledCount}
              </span>
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Cómo usar el mapa" side="left">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={welcome.show}
            aria-label="Cómo usar el mapa"
            className={BTN_CLASS}
          >
            <CircleHelp />
          </Button>
        </Tooltip>

        <div aria-hidden className="pointer-events-none h-px w-5 bg-border/60 md:w-6" />

        {TOOLS.map((t) => {
          const isActive = activePanel === t.id;
          return (
            <Tooltip key={t.id} content={t.label} side="left">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onToggleTool(t.id)}
                aria-label={t.label}
                aria-pressed={isActive}
                className={cn(
                  BTN_CLASS,
                  t.id !== MOBILE_TOOL && 'hidden sm:inline-flex',
                  isActive && BTN_ON,
                )}
              >
                <t.Icon />
              </Button>
            </Tooltip>
          );
        })}

        <ToolsOverflowMenu activePanel={activePanel} onSelect={onToggleTool} />
      </div>

      {layersOpen && (
        // Fuera de la columna (z-20) para quedar sobre la ficha (z-30): en
        // escritorio junto a la columna (a la izquierda de la ficha si hay una
        // y cabe); en móvil, un panel abajo que no tapa la columna.
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-label="Capas del mapa"
          tabIndex={-1}
          onKeyDown={onPopoverKeyDown}
          onFocus={() => {
            focusInsideRef.current = true;
          }}
          onBlur={(event) => {
            focusInsideRef.current = event.currentTarget.contains(event.relatedTarget as Node | null);
          }}
          style={anchorRight != null ? { right: anchorRight } : undefined}
          className={cn(
            // En móvil deja libre la columna de botones de la derecha.
            'surface-panel fixed bottom-2 left-2 right-[3.25rem] z-[36] flex max-h-[min(70dvh,36rem)] flex-col overflow-hidden outline-none animate-fade-in',
            'sm:absolute sm:bottom-auto sm:left-auto sm:top-2 sm:max-h-[calc(100%-1rem)] sm:w-80 md:right-16 md:top-3 md:max-h-[calc(100%-1.5rem)]',
          )}
        >
          {/* Encabezado como el de las fichas: rótulo, título y "×"; manija en el teléfono. */}
          <div aria-hidden className="flex h-5 items-end justify-center sm:hidden">
            <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
          </div>
          <div className="flex items-start justify-between gap-3 border-b px-5 pb-3 pt-2 sm:py-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
                <Layers2 aria-hidden />
                Mapa
              </div>
              <h2 className="text-lg font-semibold leading-tight tracking-tight text-foreground">Capas</h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeLayers}
              aria-label="Cerrar capas"
              className="-mr-2.5 -mt-2 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </Button>
          </div>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
            <LayersPopover
              counts={counts}
              layers={layers}
              onLayersChange={onLayersChange}
              status={status}
              onRetry={onRetry}
            />
          </div>
        </div>
      )}
    </>
  );
}
