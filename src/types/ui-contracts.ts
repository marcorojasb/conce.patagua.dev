// Contratos entre los cuatro paquetes del refactor del visor: navegación y
// estado (App), dibujo del mapa, modo GPS y etiquetas, y superficies (fichas,
// paneles, barra lateral). Solo tipos y constantes, sin lógica: cada paquete
// implementa o consume estas formas sin importar código de los otros. Se crea
// tal cual en todos los paquetes y ninguno lo edita por su cuenta.

import type { ReactNode } from 'react';
import type { LiveArrivalsSnapshot } from '@/hooks/use-live-arrivals';
import type { LayerLoadStatus, LayerStatusControls } from '@/hooks/use-layer-status';
import type { PlannerMatch } from '@/lib/planner';
import type { RoutingResult } from '@/lib/routing';
import type { LiveFailure } from '@/realtime/live-arrivals';
import type { RouteGpsStatus } from '@/realtime/route-vehicles';
import type {
  AirQualityStation,
  FlyToToken,
  Poi,
  Route,
  StopWithRoutes,
  Terminal,
  Theme,
} from '@/types/transport';

// ── Estado de la vista (dueño: paquete A) ───────────────────────────────────

export type DirectionId = 0 | 1;
export type RouteTab = 'info' | 'recorrido' | 'horarios';

/** Lo que muestra la ficha. `stop` cubre paradas de recorrido y paraderos GTFS (mismo id). */
export type Selection =
  | { kind: 'route'; id: string; dir: DirectionId | null; tab: RouteTab }
  | { kind: 'stop'; id: string }
  | { kind: 'terminal'; id: string }
  | { kind: 'poi'; id: string }
  | { kind: 'corridor'; id: string };

export type ToolId = 'planner' | 'operators' | 'quality' | 'export' | 'wallpaper';
export type PanelId = ToolId | 'sources';

/** Micros en el mapa: según horario, solo GPS en vivo, o ninguna. Nunca se mezclan. */
export type MicrosMode = 'schedule' | 'gps' | 'off';
/** Solo para Horario: micros de las líneas en el mapa o de toda la red. */
export type SimulationScope = 'visible' | 'all';
export type CoverageThreshold = 'all' | 'underserved';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapLayersState {
  paraderos: boolean;
  terminals: boolean;
  pois: boolean;
  airQuality: boolean;
  coverage: boolean;
  coverageThreshold: CoverageThreshold;
  cycleways: boolean;
  greenspace: boolean;
  schools: boolean;
  corridors: boolean;
}

/** Preferencias pegajosas: van en la URL con replace y Atrás/Adelante no las deshacen. */
export interface ViewPrefs {
  /** Códigos de recorrido ("30QE", "L1") en orden de agregado; null = conjunto por defecto. */
  lines: string[] | null;
  onlyOperating: boolean;
  micros: MicrosMode;
  scope: SimulationScope;
  layers: MapLayersState;
  planner: { a: LatLng | null; b: LatLng | null };
}

/** Capas transitorias de una entrada del historial: solo en history.state, nunca en la URL. */
export type Overlay = 'sidebar' | 'layers' | 'pick-a' | 'pick-b' | null;

export interface ViewState {
  selection: Selection | null;
  panel: PanelId | null;
  prefs: ViewPrefs;
  overlay: Overlay;
  /** Entradas del visor debajo de esta en el historial (0 = base). */
  depth: number;
  /** Nombre de la superficie anterior para el "←" ("30Q/E", "Planificador"); null si antes estaba el mapa solo. */
  backLabel: string | null;
}

/** De dónde vino una selección: con 'map' el mapa no se mueve; con 'list' o 'link' encuadra. */
export type SelectOrigin = 'map' | 'list' | 'link';

// ── Superficie (panel derecho en escritorio, hoja inferior en móvil; dueño: D) ──

export interface SurfaceChrome {
  /** "×": cierra toda superficie y vuelve al mapa. */
  onClose: () => void;
  /** "← {label}": un paso atrás. null sin superficie anterior. */
  back: { label: string; onBack: () => void } | null;
  /** Fuerza la altura "asomada" en móvil (eligiendo un punto, barra lateral abierta). */
  collapsed: boolean;
}

/** Marco común de toda superficie (FloatingInfoPanel). Su raíz lleva `data-surface` y `data-snap`. */
export interface FloatingInfoPanelProps {
  chrome: SurfaceChrome;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  widthClassName?: string;
  scroll?: boolean;
  /** Nombre accesible de la "×" (por defecto "Cerrar"). */
  closeLabel?: string;
}

// ── Micros en el mapa (estimadas: B; GPS: C; dibujo: B) ─────────────────────

export type VehicleKind = 'estimate' | 'gps';

export interface MapVehicle {
  /** Estable entre actualizaciones del mismo viaje o patente. */
  id: string;
  kind: VehicleKind;
  routeId: string;
  /** Sentido GTFS; null en Biotrén o si no se sabe. */
  directionId: DirectionId | null;
  lat: number;
  lng: number;
  /** Grados, 0 = N; null sin rumbo. */
  bearing: number | null;
  color: string;
  /** Letrero del sentido ("30E", "L1"). */
  code: string;
  /** Solo GPS: posición con más de GPS_STALE_AFTER_MS. Siempre false en estimadas. */
  stale: boolean;
  /** Texto plano de una línea para el tooltip; quien lo dibuja lo escapa. */
  tooltip: string;
}

/** Fuente de micros del mapa. Una sola a la vez; cambiar de fuente borra lo dibujado. */
export interface VehicleFeed {
  readonly kind: VehicleKind;
  /** Llama al listener en el acto con lo último y luego en cada actualización. */
  subscribe(listener: (vehicles: readonly MapVehicle[]) => void): () => void;
}

/** Claves visuales compartidas por el canvas de micros (B) y la leyenda (C). */
export const VEHICLE_STYLE = {
  estimate: { shape: 'circle', ring: '#ffffff', dash: [3, 2], alpha: 0.85, label: 'Micro estimada según horario' },
  gps: { shape: 'square', ring: '#059669', dash: [], alpha: 1, label: 'Micro con GPS en vivo' },
  gpsStale: { shape: 'square', ring: '#d97706', dash: [], alpha: 0.6, label: 'GPS de hace más de 2 min' },
  dimmedAlpha: 0.25,
} as const;

// ── Mapa (dueño: B; lo usa A) ──────────────────────────────────────────────

export type LoadableLayer = 'coverage' | 'cycleways' | 'greenspace' | 'schools';

export type MapTarget =
  | { kind: 'route'; id: string }
  | { kind: 'stop'; id: string }
  | { kind: 'terminal'; id: string }
  | { kind: 'poi'; id: string }
  | { kind: 'corridor'; id: string }
  | { kind: 'vehicle'; routeId: string; directionId: DirectionId | null }
  /** Un pin A o B del planificador: abre el planificador. */
  | { kind: 'planner' };

/** Recorridos destacados: los demás (trazados, paradas y micros) se atenúan. */
export interface MapFocus {
  routeIds: readonly string[];
  /** Con un solo recorrido y un sentido elegido: solo ese trazado, sus paradas y sus micros. */
  directionId: DirectionId | null;
}

export interface ConceMapProps {
  theme: Theme;
  /** Recorridos dibujados como red (visibles y que pasan el filtro), en orden de agregado. */
  networkRouteIds: readonly string[];
  /** Se dibuja aunque no esté en networkRouteIds (capa de foco). */
  focus: MapFocus | null;
  selection: Selection | null;
  layers: MapLayersState;
  layerLoad: Record<LoadableLayer, LayerStatusControls>;
  layerRetryKeys: Record<LoadableLayer, number>;
  airQuality: readonly AirQualityStation[];
  /** null con las micros ocultas. */
  vehicleFeed: VehicleFeed | null;
  planner: { a: LatLng | null; b: LatLng | null; midpoint: RoutingResult | null };
  /** Eligiendo un punto del planificador: todo clic en el mapa es ese punto. */
  pick: 'a' | 'b' | null;
  onPick: (point: LatLng) => void;
  flyTo: FlyToToken | null;
  /** Hay superficie abierta: al centrar se descuenta lo que tapa ([data-surface]). */
  surfaceOpen: boolean;
  onSelect: (target: MapTarget) => void;
}

// ── Modo GPS (dueño: C; lo usa A) ───────────────────────────────────────────

export interface GpsModeOptions {
  enabled: boolean;
  /** Recorridos a consultar en orden de prioridad (el seleccionado lo antepone gpsServicesFor). */
  routes: readonly Route[];
  selectedRouteId: string | null;
  /** Llegadas del paradero abierto: sus micros con GPS se suman sin repetir patente. */
  stopLive: LiveArrivalsSnapshot | null;
}

export interface GpsLineStatus {
  routeId: string;
  code: string;
  color: string;
  /** 'untracked': la fuente no la sigue (Biotrén, 302/304); 'omitted': quedó fuera del tope de 16 sentidos. */
  status: RouteGpsStatus | 'untracked' | 'omitted';
  vehicles: number;
  /** 'no-gps' con micros listadas cuyo GPS pasó de 5 min: edad de la señal más reciente. */
  lastSignalAgeMs?: number;
}

export interface GpsModeView {
  active: boolean;
  loading: boolean;
  /** Falla de la consulta completa (no de una línea). */
  failure: LiveFailure | null;
  fetchedAt: number | null;
  lines: readonly GpsLineStatus[];
  vehicles: number;
  stale: number;
}

// ── Controles sobre el mapa (dueño: C; los usa A) ───────────────────────────

export interface MicrosControlProps {
  mode: MicrosMode;
  onModeChange: (mode: MicrosMode) => void;
  scope: SimulationScope;
  onScopeChange: (scope: SimulationScope) => void;
  gps: GpsModeView;
  /** "Elegir líneas": abre la lista de recorridos. */
  onOpenLines: () => void;
  /**
   * Solo el selector, sin la línea de estado ni el detalle: en un teléfono con
   * una ficha abierta queda poco mapa a la vista.
   */
  compact?: boolean;
  /** "Reintentar" cuando no cargó el horario de las micros estimadas. */
  onRetrySchedule?: () => void;
  /** Recorrido elegido: en modo compacto se dice si él no tiene GPS. */
  selectedRouteId?: string | null;
  /** Líneas en el mapa (red + foco): sin ninguna, Horario lo dice en vez de culpar al horario. */
  linesOnMap?: number;
  /**
   * Detalle por línea plegado (se puede abrir a mano): con una ficha abierta
   * en escritorio o con avisos debajo, la lista larga taparía el mapa.
   */
  detailCollapsed?: boolean;
}

export interface MapLegendProps {
  micros: MicrosMode;
  layers: MapLayersState;
  /** Plegada (solo el botón) mientras hay una superficie abierta. */
  collapsed: boolean;
  /** Hay puntos A o B del planificador en el mapa. */
  plannerPoints?: boolean;
}

export interface MapNotice {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
}

export interface MapHintsProps {
  /** Chip "Operando ahora · N ocultas · Quitar"; null sin el filtro. */
  operatingFilter: { hiddenCount: number; onClear: () => void } | null;
  /** Capa de paraderos encendida: el chip se ve solo bajo zoom 14 (lo lee de map-viewport). */
  paraderosZoom: { onZoomIn: () => void } | null;
  pick: { target: 'a' | 'b'; onCancel: () => void } | null;
  /** Puntos A/B del planificador en el mapa con el planificador cerrado: "Ver" o "Quitar". */
  plannerPoints?: { onOpen: () => void; onClear: () => void } | null;
  notice: MapNotice | null;
  onDismissNotice: () => void;
}

export interface MapLayerControlProps {
  counts: { terminals: number; paraderos: number; pois: number };
  layers: MapLayersState;
  onLayersChange: (patch: Partial<MapLayersState>) => void;
  status: Record<LoadableLayer, LayerLoadStatus> & {
    airQuality: { stations: number; loading: boolean; error: string | null };
  };
  onRetry: (layer: LoadableLayer | 'airQuality') => void;
  layersOpen: boolean;
  onLayersOpenChange: (open: boolean) => void;
  onRecenter: () => void;
  activePanel: PanelId | null;
  onToggleTool: (tool: ToolId) => void;
}

export interface WelcomeCardProps {
  routesCount: number;
  stopsCount: number;
  onSearch: () => void;
  onShowStops: () => void;
  onDismiss: () => void;
}

// ── Superficies, barra lateral y buscador (dueño: D; los usa A) ─────────────

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  routes: readonly Route[];
  /** En el mapa (sin aplicar el filtro de horario), en orden de agregado. */
  visibleRouteIds: readonly string[];
  /** De las visibles, las que "Operando ahora" saca del mapa. */
  hiddenByFilter: ReadonlySet<string>;
  isDefaultLines: boolean;
  onToggleVisible: (id: string) => void;
  onSetVisible: (ids: readonly string[], visible: boolean) => void;
  onRestoreDefault: () => void;
  onClearAll: () => void;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onlyOperatingNow: boolean;
  onToggleOnlyOperatingNow: () => void;
  onOpenPlanner: () => void;
  onOpenSources: () => void;
}

export interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  /** Con la variante buscada ("30E") llega su sentido. */
  onSelectRoute: (id: string, directionId?: DirectionId) => void;
  onSelectStop: (id: string) => void;
  commandOpen: boolean;
  onCommandOpenChange: (open: boolean) => void;
}

export interface RouteDetailSheetProps {
  chrome: SurfaceChrome;
  route: Route;
  tab: RouteTab;
  onTabChange: (tab: RouteTab) => void;
  /** null = ambos sentidos (así se dibuja). */
  directionId: DirectionId | null;
  onDirectionChange: (directionId: DirectionId | null) => void;
  /** Chapa "No está en tu mapa · Agregar" / "Fuera de horario". */
  membership: { onMap: boolean; hiddenByFilter: boolean; onAdd: () => void; onRemove: () => void };
  onFocusRoute: () => void;
  onSelectStop: (id: string) => void;
}

export interface StopDetailSheetProps {
  chrome: SurfaceChrome;
  stop: StopWithRoutes;
  live: LiveArrivalsSnapshot;
  micros: MicrosMode;
  /** "Ver en el mapa con GPS en vivo": pasa el mapa a modo GPS. */
  onShowGpsOnMap: () => void;
  onSelectRoute: (id: string, directionId?: DirectionId) => void;
  /** "Salir desde aquí" / "Ir hasta aquí": abren el planificador con A o B puesto. */
  onPlanFrom: (point: LatLng) => void;
  onPlanTo: (point: LatLng) => void;
}

export interface TerminalDetailSheetProps {
  chrome: SurfaceChrome;
  terminal: Terminal;
  onFocus: () => void;
}

export interface PoiDetailSheetProps {
  chrome: SurfaceChrome;
  poi: Poi;
  onFocus: () => void;
  onSelectRoute: (id: string) => void;
}

export interface CorridorDetailSheetProps {
  chrome: SurfaceChrome;
  corridorId: string;
  onFocus: () => void;
}

export interface DataSourcesSheetProps {
  chrome: SurfaceChrome;
}

export interface PlannerPanelProps {
  a: LatLng | null;
  b: LatLng | null;
  pick: 'a' | 'b' | null;
  matches: readonly PlannerMatch[];
  /** Buscar en todas las líneas y no solo en las del mapa. */
  searchAll: boolean;
  onSearchAllChange: (value: boolean) => void;
  linesOnMap: number;
  onPick: (target: 'a' | 'b') => void;
  onCancelPick: () => void;
  onClear: () => void;
  onSelectRoute: (id: string) => void;
  midpoint: RoutingResult | null;
  midpointLoading: boolean;
  midpointError: string | null;
  onComputeMidpoint: () => void;
  onClearMidpoint: () => void;
}

export interface FloatingToolsPanelProps {
  tool: ToolId;
  chrome: SurfaceChrome;
  planner: PlannerPanelProps;
  /** "Mostrar N recorridos": los agrega y deja el panel abierto (aviso con Deshacer). */
  onShowOperatorRoutes: (operator: string) => void;
  onSelectRoute: (id: string) => void;
  visibleRouteIds: readonly string[];
  theme: Theme;
  micros: MicrosMode;
  scope: SimulationScope;
  layers: MapLayersState;
}
