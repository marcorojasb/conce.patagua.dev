// Qué cambia en la red de recorridos dibujada entre dos estados. Es puro para
// poder probarlo: la capa (route-network-layer.ts) solo aplica el resultado y
// así encender una línea crea dos trazados y sus paradas, sin tocar el resto.

import { MAP_THEME } from '@/lib/map-theme';
import type { DirectionId, MapFocus } from '@/types/ui-contracts';
import type { Theme } from '@/types/transport';

export interface NetworkEntryState {
  /** Recorrido destacado (ficha abierta o paradero que lo atiende). */
  focus: boolean;
  /** Hay foco y este recorrido no está en él. */
  dim: boolean;
  /** Solo con un único recorrido en foco y un sentido elegido: se dibuja ese sentido. */
  directionId: DirectionId | null;
}

export interface NetworkState {
  theme: Theme;
  /** Recorridos dibujados en orden: la red y después los de foco que no están en ella. */
  order: readonly string[];
  entries: ReadonlyMap<string, NetworkEntryState>;
}

export interface NetworkDiff {
  add: string[];
  remove: string[];
  /** Cambió foco, atenuación o tema: basta setStyle. */
  restyle: string[];
  /** Cambió el sentido dibujado: otro trazado y otras paradas. */
  reshape: string[];
  /** Algún recorrido entró o salió del foco: hay que reordenar lo destacado al frente. */
  focusChanged: boolean;
}

/**
 * Estado deseado de la red. `exists` deja fuera ids que todavía no cargan (las
 * micros GTFS llegan en un chunk diferido): entran en la siguiente pasada.
 */
export function planNetworkState(
  networkIds: readonly string[],
  focus: MapFocus | null,
  theme: Theme,
  exists: (id: string) => boolean,
): NetworkState {
  const focusIds = new Set(focus?.routeIds ?? []);
  const singleDirection = focus && focusIds.size === 1 ? focus.directionId : null;
  const order: string[] = [];
  const entries = new Map<string, NetworkEntryState>();
  const push = (id: string) => {
    if (entries.has(id) || !exists(id)) return;
    const inFocus = focusIds.has(id);
    order.push(id);
    entries.set(id, {
      focus: inFocus,
      dim: focusIds.size > 0 && !inFocus,
      directionId: inFocus ? singleDirection : null,
    });
  };
  for (const id of networkIds) push(id);
  for (const id of focusIds) push(id);
  return { theme, order, entries };
}

export function planNetworkDiff(prev: NetworkState | null, next: NetworkState): NetworkDiff {
  const diff: NetworkDiff = { add: [], remove: [], restyle: [], reshape: [], focusChanged: false };
  const themeChanged = prev != null && prev.theme !== next.theme;
  if (prev) {
    for (const id of prev.order) {
      if (!next.entries.has(id)) {
        diff.remove.push(id);
        if (prev.entries.get(id)?.focus) diff.focusChanged = true;
      }
    }
  }
  for (const id of next.order) {
    const after = next.entries.get(id)!;
    const before = prev?.entries.get(id);
    if (!before) {
      diff.add.push(id);
      if (after.focus) diff.focusChanged = true;
      continue;
    }
    if (before.directionId !== after.directionId) diff.reshape.push(id);
    if (before.focus !== after.focus) diff.focusChanged = true;
    if (themeChanged || before.focus !== after.focus || before.dim !== after.dim) diff.restyle.push(id);
  }
  return diff;
}

export interface RouteStyle {
  casing: { weight: number; opacity: number };
  line: { weight: number; opacity: number };
  stopOpacity: number;
}

const FOCUS: RouteStyle = { casing: { weight: 10, opacity: 0.7 }, line: { weight: 6, opacity: 1 }, stopOpacity: 1 };
const DIMMED: RouteStyle = { casing: { weight: 7, opacity: 0.08 }, line: { weight: 4, opacity: 0.16 }, stopOpacity: 0.25 };
// En estado normal el borde va más marcado en oscuro (casi negro a 0,5): con
// el claro de 0,35 las líneas se fundían con las calles del mapa oscuro.
const NORMAL: Record<Theme, RouteStyle> = {
  light: { casing: { weight: 7, opacity: MAP_THEME.light.casingAlpha }, line: { weight: 4, opacity: 0.82 }, stopOpacity: 1 },
  dark: { casing: { weight: 7, opacity: MAP_THEME.dark.casingAlpha }, line: { weight: 4, opacity: 0.82 }, stopOpacity: 1 },
};

export function routeStyleFor(state: Pick<NetworkEntryState, 'focus' | 'dim'>, theme: Theme): RouteStyle {
  if (state.focus) return FOCUS;
  return state.dim ? DIMMED : NORMAL[theme];
}

/** Borde bajo cada trazado: blanco sobre el mapa claro, casi negro sobre el oscuro. */
export function casingColor(theme: Theme): string {
  return MAP_THEME[theme].casing;
}

/** Zoom desde el que se dibujan las paradas: antes las de foco, así se ve dónde para. */
export const NETWORK_STOPS_MIN_ZOOM = 13;
export const FOCUS_STOPS_MIN_ZOOM = 11;
/** Las estaciones del Biotrén son pocas y espaciadas: se ven desde lejos aunque no haya foco. */
export const STATION_STOPS_MIN_ZOOM = 11;

// Con muchas líneas encendidas, a zoom 13 las paradas de la red son una
// alfombra de puntos que tapa los trazados, y rasterizarlas era la mitad del
// costo de redibujar el canvas al encender una línea (≈ 180 de 320 ms con 20
// familias y la CPU a 4x). Pasado este número aparecen recién desde zoom 14;
// la vista inicial (Biotrén + interurbanos, ~400 paradas) no cambia.
export const DENSE_NETWORK_STOPS = 800;

/** Zoom desde el que se dibujan las paradas de la red (no las del foco) según cuántas hay. */
export function networkStopsMinZoom(stopCount: number): number {
  return stopCount > DENSE_NETWORK_STOPS ? NETWORK_STOPS_MIN_ZOOM + 1 : NETWORK_STOPS_MIN_ZOOM;
}

export interface StopStyle {
  /** Radio del punto (px, sin el trazo). */
  radius: number;
  /** Ancho del aro del color de la línea. */
  weight: number;
}

/**
 * Punto de parada según el zoom. A zoom 15 la de micro mide 12 px por fuera,
 * como el marcador de paradero de antes; la estación del Biotrén lleva aro
 * grueso y es más grande a todo zoom.
 */
export function stopStyleForZoom(zoom: number, station = false): StopStyle {
  if (station) {
    if (zoom >= 15) return { radius: 7, weight: 3 };
    if (zoom >= 14) return { radius: 6, weight: 3 };
    if (zoom >= 13) return { radius: 5, weight: 3 };
    return { radius: 4, weight: 2.5 };
  }
  if (zoom >= 15) return { radius: 5, weight: 2 };
  if (zoom >= 14) return { radius: 4, weight: 2 };
  return { radius: 3, weight: 1.5 };
}

/**
 * Recorrido cuyo color lleva el aro de una parada: el que se pinta encima
 * (mayor `paintRank`, el orden en que la capa agregó o subió cada trazado).
 * Así el aro calza con la línea que se ve sobre la parada y no con la primera
 * que la trajo. null si ningún recorrido tiene rango.
 */
export function topPaintedRef(refs: readonly string[], paintRank: ReadonlyMap<string, number>): string | null {
  let best: string | null = null;
  let bestRank = -Infinity;
  for (const ref of refs) {
    const rank = paintRank.get(ref);
    if (rank !== undefined && rank > bestRank) {
      bestRank = rank;
      best = ref;
    }
  }
  return best;
}
