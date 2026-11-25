// Store de navegación del visor: la URL más `history.state` son la única
// fuente de verdad de lo que hay en pantalla (ver `src/lib/view-state.ts`).
// Todo cambio pasa por aquí y se aplica al historial en el momento, desde el
// manejador del evento (nunca desde un efecto): abrir una superficie es una
// entrada nueva, ajustar pestaña, sentido o preferencias reemplaza la actual,
// y cerrar es `history.back()`. Hay un solo `popstate` y un solo Escape.
//
// `history.back()` es asíncrono: mientras no llega su `popstate`, las demás
// operaciones esperan en una cola, así "cerrar Capas y elegir una línea" en
// el mismo toque no se pisan.

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { CORRIDOR_BY_ID } from '@/data/interurban-corridors';
import {
  DEFAULT_VISIBLE_ROUTE_IDS,
  ROUTES,
  ROUTES_BY_ID,
  STOPS,
  findRoute,
  microRoutesReady,
  useRoutesVersion,
} from '@/data/routes';
import { GTFS_STOPS } from '@/data/gtfs-stops.generated';
import { POIS } from '@/data/pois.generated';
import { TERMINALS } from '@/data/terminals.generated';
import { escapeOnlyClosedHint } from '@/components/ui/tooltip';
import { distanceMeters } from '@/lib/geo';
import { getMapViewport, subscribeMapViewport } from '@/lib/map-viewport';
import { routePillCode } from '@/lib/route-labels';
import {
  historyOpFor,
  landingEntries,
  mergeOnPop,
  parseView,
  resolveView,
  samePrefs,
  selectionKey,
  serializeView,
  surfaceLabel,
  type HistoryEntryState,
  type InvalidRef,
  type ResolveContext,
  type SerializeContext,
  type StoredMapView,
  type SurfaceLabels,
} from '@/lib/view-state';
import { linesEqualDefault, type LinesCatalog } from '@/lib/visible-lines';
import type { FlyToTarget, FlyToToken, StopWithRoutes } from '@/types/transport';
import type {
  DirectionId,
  Overlay,
  PanelId,
  RouteTab,
  SelectOrigin,
  Selection,
  ToolId,
  ViewPrefs,
  ViewState,
} from '@/types/ui-contracts';

export const LINES_CATALOG: LinesCatalog = { routes: ROUTES, defaultIds: DEFAULT_VISIBLE_ROUTE_IDS };

interface NavSnapshot {
  state: ViewState;
  flyTo: FlyToToken | null;
  /** Referencias de enlaces que no existen, acumuladas (App avisa cada una una vez). */
  invalid: readonly InvalidRef[];
}

// ── Datos para resolver y nombrar ───────────────────────────────────────────

/**
 * Paradero por id: el de un recorrido (con sus recorridos) o, si ninguno
 * dibujado lo toca, el paradero GTFS sin recorridos. Los paraderos GTFS
 * entran a STOPS recién con el chunk de recorridos; GTFS_STOPS ya está.
 */
export function findStop(id: string): StopWithRoutes | null {
  const onRoute = STOPS.find((s) => s.id === id);
  if (onRoute) return onRoute;
  const paradero = GTFS_STOPS.find((s) => s.id === id);
  if (!paradero) return null;
  return {
    id: paradero.id,
    name: paradero.name ?? `Paradero ${paradero.sourceId ?? ''}`.trim(),
    lat: paradero.lat,
    lng: paradero.lng,
    ref: paradero.ref,
    routes: [],
  };
}

function stopById(id: string): { name: string; lat: number; lng: number; onRoute: boolean } | null {
  const stop = findStop(id);
  return stop ? { name: stop.name, lat: stop.lat, lng: stop.lng, onRoute: stop.routes.length > 0 } : null;
}

function resolveCtx(): ResolveContext {
  return {
    findRoute: (ref) => {
      const match = findRoute(ref);
      return match ? { id: match.route.id, directionId: match.directionId } : null;
    },
    stopExists: (id) => stopById(id) != null,
    terminalExists: (id) => TERMINALS.some((t) => t.id === id),
    poiExists: (id) => POIS.some((p) => p.id === id),
    corridorExists: (id) => CORRIDOR_BY_ID.has(id),
    routesReady: microRoutesReady,
  };
}

const SERIALIZE_CTX: SerializeContext = {
  routeCode: (id) => ROUTES_BY_ID.get(id)?.code ?? null,
  isDefaultLines: (lines) => linesEqualDefault(lines, LINES_CATALOG, microRoutesReady),
};

export const SURFACE_LABELS: SurfaceLabels = {
  route: (id) => {
    const route = ROUTES_BY_ID.get(id);
    return route ? routePillCode(route) : null;
  },
  stop: (id) => stopById(id)?.name ?? null,
  terminal: (id) => TERMINALS.find((t) => t.id === id)?.name ?? null,
  poi: (id) => POIS.find((p) => p.id === id)?.name ?? null,
  corridor: (id) => CORRIDOR_BY_ID.get(id)?.title ?? null,
};

/** A dónde mira el mapa al abrir una selección desde una lista o un enlace. */
export function flyTargetFor(selection: Selection): FlyToTarget | null {
  switch (selection.kind) {
    case 'route': {
      const route = ROUTES_BY_ID.get(selection.id);
      if (!route) return null;
      const direction = selection.dir != null ? route.directions?.find((d) => d.directionId === selection.dir) : null;
      const path = direction && direction.path.length > 1 ? direction.path : route.path;
      return { kind: 'bounds', path };
    }
    case 'stop': {
      const stop = stopById(selection.id);
      return stop ? { kind: 'point', lat: stop.lat, lng: stop.lng, zoom: stop.onRoute ? 16 : 17 } : null;
    }
    case 'terminal': {
      const terminal = TERMINALS.find((t) => t.id === selection.id);
      return terminal ? { kind: 'point', lat: terminal.lat, lng: terminal.lng, zoom: 16 } : null;
    }
    case 'poi': {
      const poi = POIS.find((p) => p.id === selection.id);
      return poi ? { kind: 'point', lat: poi.lat, lng: poi.lng, zoom: 16 } : null;
    }
    case 'corridor': {
      const corridor = CORRIDOR_BY_ID.get(selection.id);
      if (!corridor) return null;
      return corridor.terminal
        ? { kind: 'bounds', path: [corridor.terminal, corridor.anchor] }
        : { kind: 'point', lat: corridor.anchor[0], lng: corridor.anchor[1], zoom: 11 };
    }
  }
}

/** Selección de recorrido cuyo código aún espera el chunk GTFS. */
export function isPendingRoute(selection: Selection | null): boolean {
  return selection?.kind === 'route' && !ROUTES_BY_ID.has(selection.id);
}

// ── Store ───────────────────────────────────────────────────────────────────

const listeners = new Set<() => void>();
let snapshot: NavSnapshot;
let flyKey = 0;

function emit(next: Partial<NavSnapshot>): void {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): NavSnapshot {
  return snapshot;
}

/** Estado de navegación de ahora, para leerlo dentro de un manejador. */
export function getNavState(): ViewState {
  return snapshot.state;
}

// Hay un vuelo pedido que el mapa todavía no termina: el último encuadre
// publicado (getMapViewport) es el de antes y no sirve para decir "ya está ahí".
let flyPending = false;

function token(target: FlyToTarget): FlyToToken {
  flyKey += 1;
  flyPending = true;
  return { key: flyKey, target };
}

/** Mueve el mapa (centrar una ficha, "Acercar", recentrar). */
export function flyMapTo(target: FlyToTarget): void {
  emit({ flyTo: token(target) });
}

function urlFor(state: ViewState): string {
  return `${window.location.pathname}${serializeView(state, SERIALIZE_CTX)}${window.location.hash}`;
}

function entryState(state: ViewState, view: StoredMapView | null): HistoryEntryState {
  return { conce: 1, overlay: state.overlay, depth: state.depth, backLabel: state.backLabel, view };
}

function currentEntryView(): StoredMapView | null {
  return parseView('', window.history.state).view;
}

function viewportNow(): StoredMapView | null {
  const viewport = getMapViewport();
  return viewport ? { lat: viewport.center.lat, lng: viewport.center.lng, zoom: viewport.zoom } : null;
}

function replaceEntry(next: ViewState): void {
  window.history.replaceState(entryState(next, currentEntryView()), '', urlFor(next));
  emit({ state: next });
}

function pushEntry(next: ViewState): void {
  // El encuadre actual queda en la entrada que se deja: Atrás lo restaura.
  window.history.replaceState(entryState(snapshot.state, viewportNow()), '', window.location.href);
  window.history.pushState(entryState(next, null), '', urlFor(next));
  emit({ state: next });
}

/**
 * Aplica `next` (selección, panel, capa o preferencias) con la operación que
 * corresponde; profundidad y "← anterior" se calculan aquí.
 */
function navigate(next: ViewState): void {
  const prev = snapshot.state;
  const op = historyOpFor(prev, next);
  if (op === 'none') return;
  const navChanged = selectionKey(prev.selection) !== selectionKey(next.selection) || prev.panel !== next.panel;
  if (op === 'push') {
    pushEntry({
      ...next,
      depth: prev.depth + 1,
      backLabel: navChanged ? surfaceLabel(prev, SURFACE_LABELS) : prev.backLabel,
    });
    return;
  }
  // Desde una capa transitoria la entrada se convierte en la nueva superficie:
  // debajo queda la superficie que la capa tapaba.
  const fromOverlay = navChanged && prev.overlay !== null;
  replaceEntry({
    ...next,
    depth: prev.depth,
    backLabel: fromOverlay ? surfaceLabel(prev, SURFACE_LABELS) : prev.backLabel,
  });
}

// Cola mientras se espera el popstate de un history.back()/go().
let pendingPop = false;
let pendingTimer: number | null = null;
// "×" y el botón de la herramienta activa cierran sin mover el mapa; Atrás
// (y "← anterior") sí vuelve al encuadre de la superficie anterior.
let restoreViewOnPop = true;
const queue: Array<() => void> = [];

function run(op: () => void): void {
  if (pendingPop) queue.push(op);
  else op();
}

function flush(): void {
  while (!pendingPop && queue.length > 0) queue.shift()?.();
}

function traverse(steps: number, restoreView = true): void {
  pendingPop = true;
  restoreViewOnPop = restoreView;
  if (pendingTimer != null) window.clearTimeout(pendingTimer);
  // Si el popstate no llega (p. ej. la entrada de abajo es de otro documento
  // tras recargar), la cola no queda trabada.
  pendingTimer = window.setTimeout(() => {
    pendingTimer = null;
    pendingPop = false;
    restoreViewOnPop = true;
    flush();
  }, 1000);
  window.history.go(-steps);
}

function stripSurface(): void {
  const s = snapshot.state;
  if (s.selection || s.panel || s.overlay) {
    replaceEntry({ ...s, selection: null, panel: null, overlay: null, backLabel: null });
  }
}

/** Un paso atrás: cierra la capa transitoria o la superficie de arriba. */
export function back(): void {
  run(() => {
    if (snapshot.state.depth > 0) traverse(1);
    else stripSurface();
  });
}

/** "← anterior" del encabezado: vuelve a la superficie anterior aunque haya una capa encima. */
export function backSurface(restoreView = true): void {
  run(() => {
    const s = snapshot.state;
    const steps = s.overlay ? 2 : 1;
    if (s.depth >= steps) traverse(steps, restoreView);
    else if (s.depth > 0) {
      traverse(s.depth, restoreView);
      run(stripSurface);
    } else stripSurface();
  });
}

/** "×": de vuelta al mapa (la base); Adelante la vuelve a abrir. */
export function closeSurface(): void {
  run(() => {
    const { depth } = snapshot.state;
    if (depth > 0) {
      traverse(depth, false);
      // La base no debería tener nada abierto; si lo tiene (entrada ajena), se limpia.
      run(stripSurface);
    } else stripSurface();
  });
}

/**
 * Abre una selección. Elegir lo mismo no la cierra: con otro sentido lo ajusta
 * y desde una lista o enlace vuelve a encuadrar; desde el mapa no lo mueve.
 */
export function select(selection: Selection, origin: SelectOrigin): void {
  run(() => {
    const prev = snapshot.state;
    const current = prev.selection;
    if (current && prev.panel === null && selectionKey(current) === selectionKey(selection)) {
      const refined =
        current.kind === 'route' && selection.kind === 'route' && selection.dir != null && selection.dir !== current.dir
          ? { ...current, dir: selection.dir }
          : current;
      // Con la barra lateral o Capas encima: se cierran y la ficha queda.
      if (prev.overlay) back();
      run(() => navigate({ ...snapshot.state, selection: refined }));
      if (origin !== 'map') {
        const target = flyTargetFor(refined);
        if (target) flyMapTo(target);
      }
      return;
    }
    navigate({ ...prev, selection, panel: null, overlay: null });
    if (origin !== 'map') {
      const target = flyTargetFor(selection);
      if (target) flyMapTo(target);
    }
  });
}

/** Pestaña o sentido de la ficha de recorrido (replace). */
export function refineRoute(patch: { tab?: RouteTab; dir?: DirectionId | null }): void {
  run(() => {
    // Un ajuste bajo una capa transitoria se perdería al cerrarla: primero se cierra.
    if (snapshot.state.overlay) back();
    run(() => {
      const s = snapshot.state;
      if (s.selection?.kind !== 'route') return;
      navigate({
        ...s,
        selection: {
          ...s.selection,
          tab: patch.tab ?? s.selection.tab,
          dir: patch.dir === undefined ? s.selection.dir : patch.dir,
        },
      });
    });
  });
}

export function openPanel(panel: PanelId): void {
  run(() => {
    const s = snapshot.state;
    if (s.panel === panel) {
      if (s.overlay && s.overlay !== 'pick-a' && s.overlay !== 'pick-b') back();
      return;
    }
    navigate({ ...s, panel, overlay: null });
  });
}

/** Botón de herramienta: abre, cambia de herramienta, o con la activa cierra (Atrás). */
export function togglePanel(panel: ToolId): void {
  run(() => {
    if (snapshot.state.panel === panel) backSurface(false);
    else openPanel(panel);
  });
}

type PrefsPatch = Partial<ViewPrefs> | ((prefs: ViewPrefs) => Partial<ViewPrefs>);

/** Preferencias (líneas, micros, capas, filtro, A/B): replace, sobreviven a Atrás. */
export function setPrefs(patch: PrefsPatch): void {
  run(() => {
    const s = snapshot.state;
    const changes = typeof patch === 'function' ? patch(s.prefs) : patch;
    navigate({ ...s, prefs: { ...s.prefs, ...changes } });
  });
}

export function openOverlay(overlay: Exclude<Overlay, null>): void {
  run(() => {
    const s = snapshot.state;
    if (s.overlay === overlay) return;
    if ((overlay === 'pick-a' || overlay === 'pick-b') && s.panel !== 'planner') return;
    navigate({ ...s, overlay });
  });
}

export function closeOverlay(): void {
  run(() => {
    if (snapshot.state.overlay) back();
  });
}

// ── Navegador ───────────────────────────────────────────────────────────────

function onPopState(event: PopStateEvent): void {
  if (pendingTimer != null) window.clearTimeout(pendingTimer);
  pendingTimer = null;
  const raw = parseView(window.location.search, event.state);
  const resolved = resolveView(raw, resolveCtx());
  const popped = resolved.state;
  // Las líneas de la entrada no cuentan (quedan las de ahora): no se avisa de ellas.
  const invalid = resolved.invalid.filter((ref) => ref.kind !== 'lines');
  const prev = snapshot.state;
  const merged = mergeOnPop(prev, raw.known ? popped : { ...popped, overlay: null, depth: 0, backLabel: null });
  const url = urlFor(merged);
  if (!raw.known || !samePrefs(popped.prefs, merged.prefs) || url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(entryState(merged, raw.view), '', url);
  }

  // Al volver a otra superficie, el mapa vuelve a donde estaba; cerrar una
  // capa transitoria no lo mueve.
  let flyTo = snapshot.flyTo;
  const navChanged = selectionKey(prev.selection) !== selectionKey(merged.selection) || prev.panel !== merged.panel;
  const viewport = getMapViewport();
  const restoreView = restoreViewOnPop;
  restoreViewOnPop = true;
  if (navChanged && raw.view && restoreView) {
    const near =
      !flyPending &&
      viewport &&
      viewport.zoom === raw.view.zoom &&
      distanceMeters([viewport.center.lat, viewport.center.lng], [raw.view.lat, raw.view.lng]) < 10;
    if (!near) flyTo = token({ kind: 'view', lat: raw.view.lat, lng: raw.view.lng, zoom: raw.view.zoom });
  }

  emit({ state: merged, flyTo, invalid: invalid.length > 0 ? [...snapshot.invalid, ...invalid] : snapshot.invalid });
  pendingPop = false;
  flush();
}

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') != null
  );
}

function onKeyDown(event: KeyboardEvent): void {
  // Un tooltip de ayuda que se cierra con este Escape no se lo queda: la
  // ficha también se cierra con el mismo toque.
  if (event.key !== 'Escape' || (event.defaultPrevented && !escapeOnlyClosedHint(event))) return;
  if (isTextField(event.target) || isTextField(document.activeElement)) return;
  // ⌘K u otro diálogo modal: Escape es suyo.
  if (document.querySelector('[role="dialog"][aria-modal="true"], [role="dialog"][data-state="open"]')) return;
  const s = snapshot.state;
  if (s.overlay || s.selection || s.panel) {
    event.preventDefault();
    back();
  }
}

let flyAfterRoutes = false;
/**
 * Selección del enlace de aterrizaje que esperaba el chunk GTFS ("30QE",
 * "NOEXISTE"): su entrada del historial se agrega recién al saber si existe.
 * Si no existe, no queda una entrada muerta (un Atrás que no cambia nada).
 */
let deferredLanding: { key: string | null; panel: PanelId | null } | null = null;

/**
 * Resuelve lo que esperaba el chunk GTFS (un `?route=30QE` o `lineas=` del
 * enlace): ajusta la URL, encuadra el recorrido y reporta lo que no existe.
 * Idempotente: se llama cada vez que cambia la versión de recorridos.
 */
function resolvePendingRefs(): void {
  run(() => {
    const prev = snapshot.state;
    const { state, invalid } = resolveView(prev, resolveCtx());
    const target = flyAfterRoutes && state.selection ? flyTargetFor(state.selection) : null;
    flyAfterRoutes = false;
    const landing = deferredLanding;
    deferredLanding = null;
    // Sigue tal cual se aterrizó (nadie navegó mientras llegaba el chunk).
    const untouchedLanding =
      landing !== null &&
      selectionKey(prev.selection) === landing.key &&
      prev.panel === landing.panel &&
      prev.depth === 0 &&
      prev.overlay === null;
    const invalidNext = invalid.length > 0 ? [...snapshot.invalid, ...invalid] : snapshot.invalid;
    if (untouchedLanding && (state.selection || state.panel)) {
      // Queda algo abierto (el recorrido existe, o el panel del enlace): recién
      // ahora la base solo con preferencias y encima eso.
      const { base, push } = landingEntries(state);
      window.history.replaceState(entryState(base, currentEntryView()), '', urlFor(base));
      if (push) window.history.pushState(entryState(push, null), '', urlFor(push));
      emit({ state: push ?? base, flyTo: target ? token(target) : snapshot.flyTo, invalid: invalidNext });
      return;
    }
    const location = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const changed = urlFor(state) !== location || selectionKey(state.selection) !== selectionKey(prev.selection);
    if (!changed && invalid.length === 0 && !target) return;
    window.history.replaceState(entryState(state, currentEntryView()), '', urlFor(state));
    emit({ state, flyTo: target ? token(target) : snapshot.flyTo, invalid: invalidNext });
  });
}

/** Un enlace al planificador con A y B abre el mapa mostrando los dos puntos. */
function plannerLandingTarget(state: ViewState): FlyToTarget | null {
  const { a, b } = state.prefs.planner;
  if (state.panel !== 'planner' || !a || !b) return null;
  return { kind: 'bounds', path: [[a.lat, a.lng], [b.lat, b.lng]] };
}

/**
 * Se llegó desde el wiki del mismo sitio (un `<MapLink>`): Atrás debe volver
 * al artículo, así que no se agrega la entrada base del aterrizaje.
 */
function cameFromWiki(): boolean {
  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === window.location.origin && referrer.pathname.startsWith('/wiki');
  } catch {
    return false;
  }
}

function init(): NavSnapshot {
  const raw = parseView(window.location.search, window.history.state);
  const { state, invalid } = resolveView(raw, resolveCtx());
  // Una recarga nunca vuelve con una capa transitoria (barra lateral, Capas,
  // elegir punto): solo la navegación y las preferencias.
  let current: ViewState = { ...state, overlay: null };
  if (raw.known) {
    window.history.replaceState(entryState(current, raw.view), '', urlFor(current));
  } else {
    // Aterrizaje: base solo con preferencias y encima lo del enlace, así el
    // primer Atrás cierra la ficha y no saca al usuario del visor. Desde el
    // wiki no: ahí Atrás vuelve al artículo. Un recorrido que espera el chunk
    // GTFS se apila al resolverse (resolvePendingRefs).
    const { base, push } = landingEntries(current);
    if (!push || cameFromWiki()) {
      current = { ...current, depth: 0, backLabel: null };
      window.history.replaceState(entryState(current, null), '', urlFor(current));
    } else if (isPendingRoute(push.selection)) {
      current = { ...push, depth: 0 };
      deferredLanding = { key: selectionKey(current.selection), panel: current.panel };
      window.history.replaceState(entryState(current, null), '', urlFor(current));
    } else {
      window.history.replaceState(entryState(base, null), '', urlFor(base));
      window.history.pushState(entryState(push, null), '', urlFor(push));
      current = push;
    }
  }
  const target = current.selection ? flyTargetFor(current.selection) : plannerLandingTarget(current);
  // Un recorrido del enlace que espera el chunk GTFS se encuadra al resolverse.
  flyAfterRoutes = isPendingRoute(current.selection);
  return { state: current, flyTo: target ? token(target) : null, invalid };
}

/**
 * El encuadre de cada entrada queda guardado en ella mientras se mira (no
 * solo al dejarla con un push): así Atrás y también Adelante vuelven a donde
 * estaba el mapa en esa ficha.
 */
let viewWriteTimer: number | null = null;
function rememberEntryView(): void {
  flyPending = false;
  if (viewWriteTimer != null) window.clearTimeout(viewWriteTimer);
  viewWriteTimer = window.setTimeout(() => {
    viewWriteTimer = null;
    // Mientras llega el popstate de un Atrás la entrada actual todavía es la anterior.
    if (pendingPop) return;
    const view = viewportNow();
    const current = parseView('', window.history.state);
    if (!view || !current.known) return;
    const stored = current.view;
    if (stored && stored.zoom === view.zoom && stored.lat === view.lat && stored.lng === view.lng) return;
    window.history.replaceState({ ...(window.history.state as HistoryEntryState), view }, '', window.location.href);
  }, 400);
}

if (typeof window !== 'undefined') {
  // Recarga con una capa transitoria abierta: la capa no vuelve y la entrada
  // de abajo es la misma pantalla sin ella (una capa siempre se apila sobre
  // su propia pantalla). Se vuelve a esa entrada, así el primer Atrás no cae
  // en una pantalla idéntica.
  const before = parseView('', window.history.state);
  const reloadedOverlay = before.known && before.overlay !== null && before.depth > 0;
  snapshot = init();
  window.addEventListener('popstate', onPopState);
  window.addEventListener('keydown', onKeyDown);
  subscribeMapViewport(rememberEntryView);
  if (reloadedOverlay) traverse(1, false);
}

const ACTIONS = {
  select,
  refineRoute,
  openPanel,
  togglePanel,
  back,
  backSurface,
  closeSurface,
  setPrefs,
  openOverlay,
  closeOverlay,
};

export type Navigation = typeof ACTIONS & {
  state: ViewState;
  flyTo: FlyToToken | null;
  invalid: readonly InvalidRef[];
};

export function useNavigation(): Navigation {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const routesVersion = useRoutesVersion();
  useEffect(() => {
    if (routesVersion > 0) resolvePendingRefs();
  }, [routesVersion]);
  return useMemo(
    () => ({ ...ACTIONS, state: current.state, flyTo: current.flyTo, invalid: current.invalid }),
    [current],
  );
}
