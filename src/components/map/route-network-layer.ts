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
//
// Colores: cada línea con su color de pantalla del tema (displayRouteColor) y
// cada parada con el aro de la línea que se pinta encima de ella (paintRank:
// el orden en que se agregó o subió cada trazado), así el aro calza con lo que
// se ve. Las estaciones del Biotrén llevan aro grueso, se ven desde zoom 11 y
// quedan encima de las paradas de micro. La capa Paraderos avisa cuando
// aparece (PARADEROS_SHOWN_EVENT) para volver a poner las paradas encima:
// si no, sus puntos grises quedaban dentro del aro de color ("aros dobles").

import L from 'leaflet';
import { ROUTES_BY_ID } from '@/data/routes';
import { directionCode, routeShortName } from '@/lib/route-labels';
import { displayRouteColor } from '@/lib/route-colors';
import { bindMapTooltip, hideMapTooltip } from '@/components/map/map-tooltip';
import { stopMarkerStyle } from '@/components/map/map-paint';
import {
  FOCUS_STOPS_MIN_ZOOM,
  STATION_STOPS_MIN_ZOOM,
  casingColor,
  networkStopsMinZoom,
  planNetworkDiff,
  planNetworkState,
  routeStyleFor,
  stopStyleForZoom,
  topPaintedRef,
  type NetworkEntryState,
  type NetworkState,
} from '@/components/map/route-network-diff';
import type { DirectionId, MapFocus, MapTarget } from '@/types/ui-contracts';
import type { LatLngTuple, Route, Stop, Theme } from '@/types/transport';

/** Lo dispara la capa Paraderos en el mapa al mostrarse: sus puntos quedan encima de todo. */
export const PARADEROS_SHOWN_EVENT = 'paraderosshown';

export interface RouteNetworkCallbacks {
  onSelect: (target: MapTarget) => void;
}

interface RouteEntry {
  route: Route;
  /** Color de pantalla en el tema actual (trazado y aro de sus paradas). */
  color: string;
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
  /** Estación del Biotrén: aro grueso, visible desde lejos y encima de las paradas de micro. */
  station: boolean;
  shown: boolean;
  focus: boolean;
  styleKey: string;
}

// Uniones biseladas y un poco más de simplificación: sin GPU, rasterizar las
// uniones redondas de 200 trazados anchos era ~25% del redibujo tras cada
// arrastre o zoom, y a este grosor no se nota la diferencia.
const LINE_SHAPE: L.PolylineOptions = { lineCap: 'round', lineJoin: 'bevel', smoothFactor: 1.5 };

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
  /**
   * Orden de pintado de cada trazado: sube en cada addRoute y en cada
   * bringToFront (Leaflet pinta el canvas en ese orden, el último encima).
   */
  private readonly paintRank = new Map<string, number>();
  private paintSeq = 0;

  constructor(map: L.Map, callbacks: RouteNetworkCallbacks) {
    this.map = map;
    this.callbacks = callbacks;
    this.zoom = map.getZoom();
    map.on('zoomend', this.onZoomEnd);
    map.on(PARADEROS_SHOWN_EVENT, this.onParaderosShown);
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
    this.reorderPending = false;
    this.map.off('zoomend', this.onZoomEnd);
    this.map.off(PARADEROS_SHOWN_EVENT, this.onParaderosShown);
    for (const id of [...this.routes.keys()]) this.removeRoute(id);
    this.state = null;
  }

  private readonly onZoomEnd = () => {
    const zoom = this.map.getZoom();
    if (zoom === this.zoom) return;
    this.zoom = zoom;
    if (this.syncStops()) this.requestReorder();
  };

  private readonly onParaderosShown = () => {
    for (const entry of this.stops.values()) {
      if (entry.shown) {
        this.requestReorder();
        return;
      }
    }
  };

  private reorderPending = false;

  /**
   * Un solo reordenamiento tras el zoomend: al cruzar el zoom 14 aparecen a
   * la vez las paradas de la red y la capa Paraderos, y cada una pedía el
   * suyo (miles de bringToFront dos veces seguidas).
   */
  private requestReorder(): void {
    if (this.reorderPending) return;
    this.reorderPending = true;
    queueMicrotask(() => {
      if (this.reorderPending && this.state != null) this.reorder();
    });
  }

  private addRoute(route: Route, state: NetworkEntryState, theme: Theme): void {
    const style = routeStyleFor(state, theme);
    const path = pathFor(route, state.directionId);
    const casing = L.polyline(path, {
      color: casingColor(theme),
      weight: style.casing.weight,
      opacity: style.casing.opacity,
      ...LINE_SHAPE,
      interactive: false,
    });
    const color = displayRouteColor(route.color, theme);
    const line = L.polyline(path, {
      color,
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
    this.paintRank.set(route.id, ++this.paintSeq);
    const entry: RouteEntry = { route, color, casing, line, state, stopIds: [] };
    this.routes.set(route.id, entry);
    for (const stop of stopsFor(route, state.directionId)) this.acquireStop(stop, route);
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
    this.paintRank.delete(id);
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
    for (const stop of nextStops) this.acquireStop(stop, entry.route);
    for (const stopId of entry.stopIds) this.releaseStop(stopId, id);
    entry.stopIds = nextStops.map((s) => s.id);
    entry.state = { ...entry.state, directionId };
  }

  private restyleRoute(id: string, state: NetworkEntryState, theme: Theme): void {
    const entry = this.routes.get(id);
    if (!entry) return;
    entry.state = state;
    entry.color = displayRouteColor(entry.route.color, theme);
    const style = routeStyleFor(state, theme);
    entry.casing.setStyle({ color: casingColor(theme), ...style.casing });
    entry.line.setStyle({ color: entry.color, ...style.line });
  }

  private acquireStop(stop: Stop, route: Route): void {
    let entry = this.stops.get(stop.id);
    if (!entry) {
      const marker = L.circleMarker([stop.lat, stop.lng], stopStyleForZoom(this.zoom));
      marker.on('click', () => {
        hideMapTooltip(this.map);
        this.callbacks.onSelect({ kind: 'stop', id: stop.id });
      });
      bindMapTooltip(marker, this.map, () => ({
        primary: stop.name,
        secondary: 'Paradero · toca para ver llegadas',
        at: [stop.lat, stop.lng],
      }));
      entry = { stop, marker, refs: [], station: false, shown: false, focus: false, styleKey: '' };
      this.stops.set(stop.id, entry);
    }
    entry.refs.push(route.id);
    if (route.type === 'biotren') entry.station = true;
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
   * Estilo y visibilidad de cada parada según el recorrido que se ve encima
   * (el de foco si hay), el foco y el zoom. Devuelve si apareció alguna (queda
   * encima de todo y hay que reordenar lo destacado).
   */
  private syncStops(): boolean {
    const theme = this.state?.theme ?? 'light';
    let anyFocus = false;
    for (const r of this.routes.values()) {
      if (r.state.focus) {
        anyFocus = true;
        break;
      }
    }
    const networkMinZoom = networkStopsMinZoom(this.stops.size);
    // El tamaño entra en la clave, no el zoom: de 15 en adelante no cambia y
    // reestilizar miles de paradas en cada paso de zoom pide otro redibujo.
    const stopSize = stopStyleForZoom(this.zoom);
    const stationSize = stopStyleForZoom(this.zoom, true);
    let shownSome = false;
    for (const entry of this.stops.values()) {
      const focusRef = anyFocus ? entry.refs.find((id) => this.routes.get(id)?.state.focus) : undefined;
      const ringRef = focusRef ?? topPaintedRef(entry.refs, this.paintRank);
      const color = (ringRef != null && this.routes.get(ringRef)?.color) || null;
      const dim = anyFocus && !focusRef;
      entry.focus = focusRef != null;
      const size = entry.station ? stationSize : stopSize;
      const styleKey = `${color}|${dim}|${size.radius}|${size.weight}|${theme}`;
      if (styleKey !== entry.styleKey) {
        entry.styleKey = styleKey;
        // setStyle de L.CircleMarker también aplica el radio.
        entry.marker.setStyle(stopMarkerStyle({ lineColor: color, theme, zoom: this.zoom, station: entry.station, dim }));
      }
      const minZoom = entry.station ? STATION_STOPS_MIN_ZOOM : entry.focus ? FOCUS_STOPS_MIN_ZOOM : networkMinZoom;
      const show = this.zoom >= minZoom;
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

  /**
   * Orden de pintado: paradas de micro sobre los trazados, estaciones sobre
   * ellas y lo destacado (trazado y paradas) al frente.
   */
  private reorder(): void {
    this.reorderPending = false;
    for (const entry of this.stops.values()) if (entry.shown && !entry.focus && !entry.station) entry.marker.bringToFront();
    for (const entry of this.stops.values()) if (entry.shown && !entry.focus && entry.station) entry.marker.bringToFront();
    for (const entry of this.routes.values()) {
      if (!entry.state.focus) continue;
      entry.casing.bringToFront();
      entry.line.bringToFront();
      this.paintRank.set(entry.route.id, ++this.paintSeq);
    }
    for (const entry of this.stops.values()) if (entry.shown && entry.focus && !entry.station) entry.marker.bringToFront();
    for (const entry of this.stops.values()) if (entry.shown && entry.focus && entry.station) entry.marker.bringToFront();
  }
}
