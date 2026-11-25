// Qué hay en pantalla, como dato: la URL más `history.state`. Este módulo es
// puro (no toca `window`): lee y escribe el query string, decide si un cambio
// es una entrada nueva del historial (push), un ajuste de la misma (replace) o
// nada, y cómo se combinan las preferencias al volver con Atrás. El store que
// lo aplica al navegador vive en `src/hooks/use-view-state.ts`.
//
// Tres clases de estado (ver plan del refactor, §2.1):
// - navegación (`selection`, `panel`): propia de cada entrada del historial;
// - preferencias (`prefs`: líneas, micros, capas, filtro, puntos A/B): van en
//   la URL con replace y Atrás/Adelante no las deshacen;
// - capa transitoria (`overlay`: barra lateral móvil, Capas, elegir punto):
//   solo en `history.state`, nunca en la URL, así un enlace o una recarga no
//   vuelven en "modo elegir punto".

import type {
  CoverageThreshold,
  DirectionId,
  LatLng,
  MapLayersState,
  MicrosMode,
  Overlay,
  PanelId,
  RouteTab,
  Selection,
  ViewPrefs,
  ViewState,
} from '@/types/ui-contracts';

export const DEFAULT_LAYERS: MapLayersState = {
  paraderos: false,
  terminals: false,
  pois: false,
  airQuality: false,
  coverage: false,
  coverageThreshold: 'all',
  cycleways: false,
  greenspace: false,
  schools: false,
  corridors: false,
};

export const DEFAULT_PREFS: ViewPrefs = {
  lines: null,
  onlyOperating: false,
  micros: 'schedule',
  scope: 'visible',
  layers: DEFAULT_LAYERS,
  planner: { a: null, b: null },
};

/** Encuadre del mapa guardado en la entrada que se deja al navegar; Atrás lo restaura. */
export interface StoredMapView {
  lat: number;
  lng: number;
  zoom: number;
}

/** Lo que el visor escribe en `history.state`. */
export interface HistoryEntryState {
  conce: 1;
  overlay: Overlay;
  depth: number;
  backLabel: string | null;
  view: StoredMapView | null;
}

/**
 * Vista leída de la URL y de `history.state`, sin resolver: en una selección
 * de recorrido `id` es lo que vino en el enlace ("30QE", "10A", un id), y
 * `prefs.lines` trae los códigos tal cual.
 */
export interface RawView extends ViewState {
  view: StoredMapView | null;
  /** La entrada ya era del visor (recarga o Atrás/Adelante), no un aterrizaje. */
  known: boolean;
  /** Venía el `?focus=` del wiki: se convierte en selección y sale de la URL. */
  hadFocus: boolean;
}

export type InvalidRefKind = Selection['kind'] | 'lines';

export interface InvalidRef {
  kind: InvalidRefKind;
  ref: string;
}

export interface ResolveContext {
  findRoute(ref: string): { id: string; directionId?: DirectionId } | null;
  stopExists(id: string): boolean;
  terminalExists(id: string): boolean;
  poiExists(id: string): boolean;
  corridorExists(id: string): boolean;
  /** Llegó el chunk de recorridos GTFS: recién ahí un código desconocido es inválido. */
  routesReady: boolean;
}

export interface SerializeContext {
  routeCode(id: string): string | null;
  isDefaultLines(lines: readonly string[]): boolean;
}

// Caja del Gran Concepción: un A/B fuera de ella viene de un enlace roto.
const REGION = { minLat: -37.6, maxLat: -36.3, minLng: -73.6, maxLng: -72.5 };

const PANEL_PARAM: Record<PanelId, string> = {
  planner: 'planificador',
  operators: 'operadores',
  quality: 'calidad',
  export: 'exportar',
  wallpaper: 'fondo',
  sources: 'fuentes',
};
const PANEL_BY_PARAM = new Map(Object.entries(PANEL_PARAM).map(([id, param]) => [param, id as PanelId]));

/** Capas encendidas con `<param>=1`, en el orden en que se escriben. */
const LAYER_PARAMS: Array<[Exclude<keyof MapLayersState, 'coverage' | 'coverageThreshold'>, string]> = [
  ['paraderos', 'paraderos'],
  ['terminals', 'terminales'],
  ['pois', 'pois'],
  ['airQuality', 'aire'],
];
const LAYER_PARAMS_AFTER_COVERAGE: Array<[Exclude<keyof MapLayersState, 'coverage' | 'coverageThreshold'>, string]> = [
  ['cycleways', 'ciclovias'],
  ['greenspace', 'verdes'],
  ['schools', 'educacion'],
  ['corridors', 'corredores'],
];

const FOCUS_KINDS = new Set(['route', 'corridor', 'terminal', 'stop', 'poi']);

function round5(value: number): number {
  return Math.round(value * 1e5) / 1e5;
}

function parsePoint(raw: string | null): LatLng | null {
  if (!raw) return null;
  const parts = raw.split(',');
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < REGION.minLat || lat > REGION.maxLat || lng < REGION.minLng || lng > REGION.maxLng) return null;
  return { lat: round5(lat), lng: round5(lng) };
}

function formatPoint(point: LatLng): string {
  return `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;
}

function parseLines(raw: string | null): string[] | null {
  if (raw == null) return null;
  const codes: string[] = [];
  for (const part of raw.split(',')) {
    const code = part.trim();
    if (code && !codes.includes(code)) codes.push(code);
  }
  return codes;
}

function parseTab(raw: string | null): RouteTab {
  return raw === 'recorrido' || raw === 'horarios' ? raw : 'info';
}

function parseDir(raw: string | null): DirectionId | null {
  return raw === '0' ? 0 : raw === '1' ? 1 : null;
}

function parseMicros(raw: string | null): MicrosMode {
  return raw === 'gps' ? 'gps' : raw === 'off' ? 'off' : 'schedule';
}

function readEntryState(historyState: unknown): HistoryEntryState | null {
  if (!historyState || typeof historyState !== 'object') return null;
  const s = historyState as Record<string, unknown>;
  if (s.conce !== 1) return null;
  const overlay =
    s.overlay === 'sidebar' || s.overlay === 'layers' || s.overlay === 'pick-a' || s.overlay === 'pick-b'
      ? s.overlay
      : null;
  const depth = typeof s.depth === 'number' && Number.isInteger(s.depth) && s.depth >= 0 ? s.depth : 0;
  const backLabel = typeof s.backLabel === 'string' ? s.backLabel : null;
  let view: StoredMapView | null = null;
  if (s.view && typeof s.view === 'object') {
    const v = s.view as Record<string, unknown>;
    if (
      typeof v.lat === 'number' &&
      typeof v.lng === 'number' &&
      typeof v.zoom === 'number' &&
      Number.isFinite(v.lat) &&
      Number.isFinite(v.lng) &&
      Number.isFinite(v.zoom)
    ) {
      view = { lat: v.lat, lng: v.lng, zoom: v.zoom };
    }
  }
  return { conce: 1, overlay, depth, backLabel, view };
}

function selectionFromFocus(raw: string | null): Selection | null {
  if (!raw) return null;
  const colon = raw.indexOf(':');
  if (colon <= 0) return null;
  const kind = raw.slice(0, colon);
  const id = raw.slice(colon + 1);
  if (!id || !FOCUS_KINDS.has(kind)) return null;
  if (kind === 'route') return { kind: 'route', id, dir: null, tab: 'info' };
  return { kind: kind as Exclude<Selection['kind'], 'route'>, id };
}

/** Lee la vista de un query string (`location.search`) y de `history.state`. */
export function parseView(search: string, historyState: unknown): RawView {
  const p = new URLSearchParams(search);
  const entry = readEntryState(historyState);

  const route = p.get('route');
  const stop = p.get('stop') ?? p.get('paradero');
  const terminal = p.get('terminal');
  const poi = p.get('poi');
  const corridor = p.get('corredor');
  let selection: Selection | null = null;
  if (route) selection = { kind: 'route', id: route, dir: parseDir(p.get('dir')), tab: parseTab(p.get('tab')) };
  else if (stop) selection = { kind: 'stop', id: stop };
  else if (terminal) selection = { kind: 'terminal', id: terminal };
  else if (poi) selection = { kind: 'poi', id: poi };
  else if (corridor) selection = { kind: 'corridor', id: corridor };
  const hadFocus = p.has('focus');
  if (!selection) selection = selectionFromFocus(p.get('focus'));

  const panel = PANEL_BY_PARAM.get(p.get('panel') ?? '') ?? null;

  const cobertura = p.get('cobertura');
  const coverageThreshold: CoverageThreshold = cobertura === 'mal' ? 'underserved' : 'all';
  const layers: MapLayersState = { ...DEFAULT_LAYERS, coverage: cobertura === '1' || cobertura === 'mal', coverageThreshold };
  for (const [key, param] of [...LAYER_PARAMS, ...LAYER_PARAMS_AFTER_COVERAGE]) layers[key] = p.get(param) === '1';

  const prefs: ViewPrefs = {
    lines: parseLines(p.get('lineas')),
    onlyOperating: p.get('activos') === '1',
    micros: parseMicros(p.get('micros')),
    scope: p.get('red') === '1' ? 'all' : 'visible',
    layers,
    planner: { a: parsePoint(p.get('a')), b: parsePoint(p.get('b')) },
  };

  return {
    selection,
    panel,
    prefs,
    overlay: entry?.overlay ?? null,
    depth: entry?.depth ?? 0,
    backLabel: entry?.backLabel ?? null,
    view: entry?.view ?? null,
    known: entry != null,
    hadFocus,
  };
}

/**
 * Resuelve las referencias de una vista leída. Los recorridos por código se
 * resuelven recién con `routesReady` (antes solo por id exacto): mientras
 * tanto la selección queda pendiente con la referencia tal cual. Lo que no
 * existe sale de la vista y se informa en `invalid`.
 */
export function resolveView(
  raw: ViewState,
  ctx: ResolveContext,
): { state: ViewState; invalid: InvalidRef[] } {
  const invalid: InvalidRef[] = [];
  let selection = raw.selection;
  if (selection) {
    switch (selection.kind) {
      case 'route': {
        const match = ctx.findRoute(selection.id);
        if (match && (ctx.routesReady || match.id === selection.id)) {
          selection = { ...selection, id: match.id, dir: selection.dir ?? match.directionId ?? null };
        } else if (ctx.routesReady) {
          invalid.push({ kind: 'route', ref: selection.id });
          selection = null;
        }
        break;
      }
      case 'stop':
        if (!ctx.stopExists(selection.id)) {
          invalid.push({ kind: 'stop', ref: selection.id });
          selection = null;
        }
        break;
      case 'terminal':
        if (!ctx.terminalExists(selection.id)) {
          invalid.push({ kind: 'terminal', ref: selection.id });
          selection = null;
        }
        break;
      case 'poi':
        if (!ctx.poiExists(selection.id)) {
          invalid.push({ kind: 'poi', ref: selection.id });
          selection = null;
        }
        break;
      case 'corridor':
        if (!ctx.corridorExists(selection.id)) {
          invalid.push({ kind: 'corridor', ref: selection.id });
          selection = null;
        }
        break;
    }
  }

  let prefs = raw.prefs;
  if (ctx.routesReady && prefs.lines && prefs.lines.length > 0) {
    const kept: string[] = [];
    const seenIds = new Set<string>();
    const unknown: string[] = [];
    for (const code of prefs.lines) {
      const match = ctx.findRoute(code);
      if (!match) unknown.push(code);
      else if (!seenIds.has(match.id)) {
        seenIds.add(match.id);
        kept.push(code);
      }
    }
    if (kept.length !== prefs.lines.length) prefs = { ...prefs, lines: kept };
    if (unknown.length > 0) invalid.push({ kind: 'lines', ref: unknown.join(',') });
  }

  // Elegir un punto solo existe sobre el planificador.
  const overlay = (raw.overlay === 'pick-a' || raw.overlay === 'pick-b') && raw.panel !== 'planner' ? null : raw.overlay;

  return {
    state: {
      selection,
      panel: raw.panel,
      prefs,
      overlay,
      depth: raw.depth,
      backLabel: raw.backLabel,
    },
    invalid,
  };
}

// `URLSearchParams` escaparía las comas y los dos puntos ("30QE%2C10AN"): el
// enlace se arma a mano para que siga legible al compartirlo.
function encodeValue(value: string): string {
  return encodeURIComponent(value).replace(/%2C/gi, ',');
}

/** Query string de la vista ("?route=30QE&tab=recorrido", o "" sin nada que guardar). */
export function serializeView(state: ViewState, ctx: SerializeContext): string {
  const parts: Array<[string, string]> = [];
  const sel = state.selection;
  if (sel?.kind === 'route') {
    parts.push(['route', ctx.routeCode(sel.id) ?? sel.id]);
    if (sel.dir != null) parts.push(['dir', String(sel.dir)]);
    if (sel.tab !== 'info') parts.push(['tab', sel.tab]);
  } else if (sel?.kind === 'stop') parts.push(['stop', sel.id]);
  else if (sel?.kind === 'terminal') parts.push(['terminal', sel.id]);
  else if (sel?.kind === 'poi') parts.push(['poi', sel.id]);
  else if (sel?.kind === 'corridor') parts.push(['corredor', sel.id]);
  if (state.panel) parts.push(['panel', PANEL_PARAM[state.panel]]);

  const { prefs } = state;
  if (prefs.lines && !ctx.isDefaultLines(prefs.lines)) parts.push(['lineas', prefs.lines.join(',')]);
  if (prefs.onlyOperating) parts.push(['activos', '1']);
  if (prefs.micros !== 'schedule') parts.push(['micros', prefs.micros]);
  if (prefs.scope === 'all') parts.push(['red', '1']);
  for (const [key, param] of LAYER_PARAMS) if (prefs.layers[key]) parts.push([param, '1']);
  if (prefs.layers.coverage) parts.push(['cobertura', prefs.layers.coverageThreshold === 'underserved' ? 'mal' : '1']);
  for (const [key, param] of LAYER_PARAMS_AFTER_COVERAGE) if (prefs.layers[key]) parts.push([param, '1']);
  if (prefs.planner.a) parts.push(['a', formatPoint(prefs.planner.a)]);
  if (prefs.planner.b) parts.push(['b', formatPoint(prefs.planner.b)]);

  if (parts.length === 0) return '';
  return `?${parts.map(([key, value]) => `${key}=${encodeValue(value)}`).join('&')}`;
}

/** Identidad de una selección, sin pestaña ni sentido: elegir lo mismo no navega. */
export function selectionKey(selection: Selection | null): string | null {
  return selection ? `${selection.kind}:${selection.id}` : null;
}

function sameSelection(a: Selection | null, b: Selection | null): boolean {
  if (selectionKey(a) !== selectionKey(b)) return false;
  if (a?.kind === 'route' && b?.kind === 'route') return a.dir === b.dir && a.tab === b.tab;
  return true;
}

function samePoint(a: LatLng | null, b: LatLng | null): boolean {
  return a === b || (!!a && !!b && a.lat === b.lat && a.lng === b.lng);
}

export function samePrefs(a: ViewPrefs, b: ViewPrefs): boolean {
  if (a === b) return true;
  const sameLines =
    a.lines === b.lines ||
    (!!a.lines && !!b.lines && a.lines.length === b.lines.length && a.lines.every((code, i) => code === b.lines?.[i]));
  return (
    sameLines &&
    a.onlyOperating === b.onlyOperating &&
    a.micros === b.micros &&
    a.scope === b.scope &&
    (Object.keys(DEFAULT_LAYERS) as Array<keyof MapLayersState>).every((key) => a.layers[key] === b.layers[key]) &&
    samePoint(a.planner.a, b.planner.a) &&
    samePoint(a.planner.b, b.planner.b)
  );
}

/**
 * Operación del historial para pasar de `prev` a `next` (tabla del plan, §2.1):
 * otra selección, abrir un panel o una capa transitoria es una entrada nueva;
 * pestaña, sentido, panel a panel, capa a capa y preferencias se ajustan en la
 * misma. Navegar desde una capa transitoria (elegir un recorrido en la barra
 * lateral móvil) reemplaza esa entrada, así Atrás no vuelve a abrirla. Cerrar
 * una capa o volver no pasa por aquí: es `history.back()`.
 */
export function historyOpFor(prev: ViewState, next: ViewState): 'push' | 'replace' | 'none' {
  const selectionChanged = selectionKey(prev.selection) !== selectionKey(next.selection);
  const panelChanged = prev.panel !== next.panel;
  const navChanged = selectionChanged || panelChanged;

  if (navChanged) {
    if (prev.overlay !== null && next.overlay === null) return 'replace';
    if (!selectionChanged && prev.panel !== null && next.panel !== null) return 'replace';
    return 'push';
  }
  if (prev.overlay !== next.overlay) {
    return prev.overlay === null ? 'push' : 'replace';
  }
  if (!sameSelection(prev.selection, next.selection) || !samePrefs(prev.prefs, next.prefs)) return 'replace';
  return 'none';
}

/** Al volver con Atrás/Adelante: la navegación de la entrada, las preferencias de ahora. */
export function mergeOnPop(current: ViewState, popped: ViewState): ViewState {
  return { ...popped, prefs: current.prefs };
}

/**
 * Aterrizaje desde un enlace con algo abierto: una entrada base solo con
 * preferencias y encima la del enlace, así el primer Atrás cierra la ficha y
 * deja al usuario en el visor.
 */
export function landingEntries(state: ViewState): { base: ViewState; push: ViewState | null } {
  const base: ViewState = { ...state, selection: null, panel: null, overlay: null, depth: 0, backLabel: null };
  if (!state.selection && !state.panel) return { base, push: null };
  return { base, push: { ...state, overlay: null, depth: 1, backLabel: null } };
}

/**
 * Un toque en el mapa eligiendo un punto: lo fija y, si falta el otro, pasa a
 * elegirlo; con los dos puestos termina (`done`) y quien llama cierra la capa.
 */
export function pickStep(
  overlay: Overlay,
  point: LatLng,
  planner: ViewPrefs['planner'],
): { planner: ViewPrefs['planner']; overlay: Overlay; done: boolean } {
  const rounded = { lat: round5(point.lat), lng: round5(point.lng) };
  if (overlay === 'pick-a') {
    const next = { ...planner, a: rounded };
    return next.b ? { planner: next, overlay: null, done: true } : { planner: next, overlay: 'pick-b', done: false };
  }
  if (overlay === 'pick-b') {
    const next = { ...planner, b: rounded };
    return next.a ? { planner: next, overlay: null, done: true } : { planner: next, overlay: 'pick-a', done: false };
  }
  return { planner, overlay, done: true };
}

export const PANEL_LABELS: Record<PanelId, string> = {
  planner: 'Planificador',
  operators: 'Operadores',
  quality: 'Calidad de datos',
  export: 'Exportar GeoJSON',
  wallpaper: 'Fondo de pantalla',
  sources: 'Fuentes de datos',
};

export interface SurfaceLabels {
  route(id: string): string | null;
  stop(id: string): string | null;
  terminal(id: string): string | null;
  poi(id: string): string | null;
  corridor(id: string): string | null;
}

/** Nombre de la superficie a la vista (el panel tapa a la selección), para el "← …" de la siguiente. */
export function surfaceLabel(state: Pick<ViewState, 'selection' | 'panel'>, labels: SurfaceLabels): string | null {
  if (state.panel) return PANEL_LABELS[state.panel];
  const sel = state.selection;
  if (!sel) return null;
  switch (sel.kind) {
    case 'route':
      return labels.route(sel.id);
    case 'stop':
      return labels.stop(sel.id);
    case 'terminal':
      return labels.terminal(sel.id);
    case 'poi':
      return labels.poi(sel.id);
    case 'corridor':
      return labels.corridor(sel.id);
  }
}
