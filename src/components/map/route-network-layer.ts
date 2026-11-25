// Red de recorridos del mapa: trazados (borde + línea) y sus paradas, todo en
// el canvas por defecto del mapa (preferCanvas), el mismo donde dibujan los
// paraderos y las capas temáticas: un solo canvas recibe los clics, así que
// tocar una línea funciona siempre.
//
// Antes cada render de React recreaba o reestilizaba cada <Polyline> y cada
// parada era un marcador DOM con su tooltip: con 20 líneas, miles de nodos.
// Ahora la capa guarda lo dibujado y aplica solo la diferencia que calcula
// planNetworkDiff: encender una línea agrega dos trazados y sus paradas;
// elegir un recorrido solo cambia estilos. Las paradas se muestran según el
// zoom sin pasar por React.

import L from 'leaflet';
import { ROUTES_BY_ID } from '@/data/routes';
import { directionCode, routeShortName } from '@/lib/route-labels';
import { bindMapTooltip, hideMapTooltip } from '@/components/map/map-tooltip';
import {
  FOCUS_STOPS_MIN_ZOOM,
  casingColor,
  networkStopsMinZoom,
  planNetworkDiff,
  planNetworkState,
  routeStyleFor,
  stopRadiusForZoom,
  type NetworkEntryState,
  type NetworkState,
} from '@/components/map/route-network-diff';
import type { DirectionId, MapFocus, MapTarget } from '@/types/ui-contracts';
import type { LatLngTuple, Route, Stop, Theme } from '@/types/transport';

export interface RouteNetworkCallbacks {
  onSelect: (target: MapTarget) => void;
}

interface RouteEntry {
  route: Route;
  casing: L.Polyline;
  line: L.Polyline;
  state: NetworkEntryState;
  stopIds: string[];
}

interface StopEntry {
  stop: Stop;
  marker: L.CircleMarker;
  /** Recorridos dibujados que pasan por la parada, en orden de llegada. */
  refs: string[];
  shown: boolean;
  focus: boolean;
  styleKey: string;
}

// Uniones biseladas y un poco más de simplificación: sin GPU, rasterizar las
// uniones redondas de 200 trazados anchos era ~25% del redibujo tras cada
// arrastre o zoom, y a este grosor no se nota la diferencia.
const LINE_SHAPE: L.PolylineOptions = { lineCap: 'round', lineJoin: 'bevel', smoothFactor: 1.5 };

// Relleno de las paradas: el fondo del tema (como el marcador DOM de antes).
const STOP_FILL: Record<Theme, string> = { light: '#ffffff', dark: '#09090b' };

function directionOf(route: Route, directionId: DirectionId | null) {
  return directionId == null ? undefined : route.directions?.find((d) => d.directionId === directionId);
}

function pathFor(route: Route, directionId: DirectionId | null): LatLngTuple[] {
  return directionOf(route, directionId)?.path ?? route.path;
}

function stopsFor(route: Route, directionId: DirectionId | null): Stop[] {
  return directionOf(route, directionId)?.stops ?? route.stops;
}

export class RouteNetworkLayer {
  private readonly map: L.Map;
  private readonly callbacks: RouteNetworkCallbacks;
  private readonly routes = new Map<string, RouteEntry>();
  private readonly stops = new Map<string, StopEntry>();
  private state: NetworkState | null = null;
  private zoom: number;

  constructor(map: L.Map, callbacks: RouteNetworkCallbacks) {
    this.map = map;
    this.callbacks = callbacks;
    this.zoom = map.getZoom();
    map.on('zoomend', this.onZoomEnd);
  }

  /** Aplica el estado pedido tocando solo lo que cambió. */
  update(networkIds: readonly string[], focus: MapFocus | null, theme: Theme): void {
    const next = planNetworkState(networkIds, focus, theme, (id) => ROUTES_BY_ID.has(id));
    const diff = planNetworkDiff(this.state, next);
    const themeChanged = this.state != null && this.state.theme !== theme;
    this.state = next;

    for (const id of diff.remove) this.removeRoute(id);
    for (const id of diff.add) this.addRoute(ROUTES_BY_ID.get(id)!, next.entries.get(id)!, theme);
    for (const id of diff.reshape) this.reshapeRoute(id, next.entries.get(id)!.directionId);
    for (const id of diff.restyle) this.restyleRoute(id, next.entries.get(id)!, theme);

    const changed = diff.add.length + diff.remove.length + diff.reshape.length + diff.restyle.length > 0;
    if (!changed && !themeChanged) return;
    const shownSome = this.syncStops();
    if (diff.add.length > 0 || diff.reshape.length > 0 || diff.focusChanged || shownSome) this.reorder();
  }

  destroy(): void {
    this.map.off('zoomend', this.onZoomEnd);
    for (const id of [...this.routes.keys()]) this.removeRoute(id);
    this.state = null;
  }

  private readonly onZoomEnd = () => {
    const zoom = this.map.getZoom();
    if (zoom === this.zoom) return;
    this.zoom = zoom;
    if (this.syncStops()) this.reorder();
  };

  private addRoute(route: Route, state: NetworkEntryState, theme: Theme): void {
    const style = routeStyleFor(state);
    const path = pathFor(route, state.directionId);
    const casing = L.polyline(path, {
      color: casingColor(theme),
      weight: style.casing.weight,
      opacity: style.casing.opacity,
      ...LINE_SHAPE,
      interactive: false,
    });
    const line = L.polyline(path, {
      color: route.color,
      weight: style.line.weight,
      opacity: style.line.opacity,
      ...LINE_SHAPE,
    });
    line.on('click', () => {
      // En pantallas táctiles el toque también abre el tooltip: se cierra al elegir.
      hideMapTooltip(this.map);
      this.callbacks.onSelect({ kind: 'route', id: route.id });
    });
    bindMapTooltip(
      line,
      this.map,
      () => ({
        // Con un sentido elegido el trazado es el de ese sentido: "30E", si no "30Q/E".
        primary: `${directionCode(route, this.routes.get(route.id)?.state.directionId ?? null)} · ${routeShortName(route)}`,
        secondary: 'Toca para ver la ficha',
      }),
      { sticky: true },
    );
    casing.addTo(this.map);
    line.addTo(this.map);
    const entry: RouteEntry = { route, casing, line, state, stopIds: [] };
    this.routes.set(route.id, entry);
    for (const stop of stopsFor(route, state.directionId)) this.acquireStop(stop, route.id);
    entry.stopIds = stopsFor(route, state.directionId).map((s) => s.id);
  }

  private removeRoute(id: string): void {
    const entry = this.routes.get(id);
    if (!entry) return;
    for (const stopId of entry.stopIds) this.releaseStop(stopId, id);
    entry.casing.remove();
    entry.line.off();
    entry.line.remove();
    this.routes.delete(id);
  }

  private reshapeRoute(id: string, directionId: DirectionId | null): void {
    const entry = this.routes.get(id);
    if (!entry) return;
    const path = pathFor(entry.route, directionId);
    entry.casing.setLatLngs(path);
    entry.line.setLatLngs(path);
    const nextStops = stopsFor(entry.route, directionId);
    // Primero se toman las nuevas y después se sueltan las viejas: las paradas
    // compartidas por ambos sentidos no se recrean.
    for (const stop of nextStops) this.acquireStop(stop, id);
    for (const stopId of entry.stopIds) this.releaseStop(stopId, id);
    entry.stopIds = nextStops.map((s) => s.id);
    entry.state = { ...entry.state, directionId };
  }

  private restyleRoute(id: string, state: NetworkEntryState, theme: Theme): void {
    const entry = this.routes.get(id);
    if (!entry) return;
    entry.state = state;
    const style = routeStyleFor(state);
    entry.casing.setStyle({ color: casingColor(theme), ...style.casing });
    entry.line.setStyle(style.line);
  }

  private acquireStop(stop: Stop, routeId: string): void {
    let entry = this.stops.get(stop.id);
    if (!entry) {
      const marker = L.circleMarker([stop.lat, stop.lng], { radius: stopRadiusForZoom(this.zoom), weight: 1.75 });
      marker.on('click', () => {
        hideMapTooltip(this.map);
        this.callbacks.onSelect({ kind: 'stop', id: stop.id });
      });
      bindMapTooltip(marker, this.map, () => ({
        primary: stop.name,
        secondary: 'Paradero · toca para ver llegadas',
        at: [stop.lat, stop.lng],
      }));
      entry = { stop, marker, refs: [], shown: false, focus: false, styleKey: '' };
      this.stops.set(stop.id, entry);
    }
    entry.refs.push(routeId);
  }

  private releaseStop(stopId: string, routeId: string): void {
    const entry = this.stops.get(stopId);
    if (!entry) return;
    const i = entry.refs.indexOf(routeId);
    if (i >= 0) entry.refs.splice(i, 1);
    if (entry.refs.length > 0) return;
    entry.marker.off();
    if (entry.shown) entry.marker.remove();
    this.stops.delete(stopId);
  }

  /**
   * Estilo y visibilidad de cada parada según el recorrido que la trae (el de
   * foco primero), el foco y el zoom. Devuelve si apareció alguna (queda encima
   * de todo y hay que reordenar lo destacado).
   */
  private syncStops(): boolean {
    const theme = this.state?.theme ?? 'light';
    const anyFocus = [...this.routes.values()].some((r) => r.state.focus);
    const radius = stopRadiusForZoom(this.zoom);
    const networkMinZoom = networkStopsMinZoom(this.stops.size);
    let shownSome = false;
    for (const entry of this.stops.values()) {
      const focusRef = anyFocus ? entry.refs.find((id) => this.routes.get(id)?.state.focus) : undefined;
      const colorRoute = this.routes.get(focusRef ?? entry.refs[0])?.route;
      const color = colorRoute?.color ?? '#334155';
      const dim = anyFocus && !focusRef;
      entry.focus = focusRef != null;
      const styleKey = `${color}|${dim}|${radius}|${theme}`;
      if (styleKey !== entry.styleKey) {
        entry.styleKey = styleKey;
        const opacity = dim ? routeStyleFor({ focus: false, dim: true }).stopOpacity : 1;
        entry.marker.setStyle({ color, fillColor: STOP_FILL[theme], fillOpacity: opacity, opacity });
        entry.marker.setRadius(radius);
      }
      const show = this.zoom >= (entry.focus ? FOCUS_STOPS_MIN_ZOOM : networkMinZoom);
      if (show === entry.shown) continue;
      entry.shown = show;
      if (show) {
        entry.marker.addTo(this.map);
        shownSome = true;
      } else {
        entry.marker.remove();
      }
    }
    return shownSome;
  }

  /** Orden de pintado: paradas sobre los trazados y lo destacado (trazado y paradas) al frente. */
  private reorder(): void {
    for (const entry of this.stops.values()) if (entry.shown && !entry.focus) entry.marker.bringToFront();
    for (const entry of this.routes.values()) {
      if (!entry.state.focus) continue;
      entry.casing.bringToFront();
      entry.line.bringToFront();
    }
    for (const entry of this.stops.values()) if (entry.shown && entry.focus) entry.marker.bringToFront();
  }
}
