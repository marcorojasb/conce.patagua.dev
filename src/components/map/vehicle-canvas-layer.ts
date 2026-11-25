// Micros del mapa en un canvas propio, encima de trazados y paraderos y debajo
// de los marcadores (panel vehiclePane, z 450). Antes cada micro era un
// marcador DOM con transición CSS: con 20 líneas, 2.400 capas de composición
// movidas cada segundo y el mapa trabado al arrastrar.
//
// - Una sola fuente a la vez (VehicleFeed): al cambiarla se borra lo dibujado
//   en el acto, así estimadas y GPS nunca conviven ni un cuadro.
// - Cada dibujo recorta por lat/lng antes de proyectar, ordena (atenuadas,
//   viejas, normales, foco) y pinta en lotes según el zoom, con las formas y
//   los colores del tema de map-paint.ts (setTheme redibuja).
// - Las lengüetas (zoom ≥ 15) van en JetBrains Mono: al terminar de cargar la
//   fuente se rehacen los sprites, que pudieron pintarse con la de respaldo.
// - No se redibuja mientras el mapa se arrastra o hace zoom: se guarda lo
//   último y se dibuja al terminar: Leaflet vacía el canvas tras moveend,
//   zoomend y viewreset y llama a _draw, que aquí dibuja las micros.
// - Al soltar un arrastre (sin cambio de zoom) el canvas no se reubica en el
//   mismo toque: lo dibujado sigue en su lugar (se movió con el mapa) y se
//   reubica y redibuja después del siguiente cuadro pintado. Así soltar el
//   mapa no espera a las miles de micros; solo el borde recién descubierto
//   queda sin ellas un instante. Un zoom o un viewreset sí es inmediato.
// - Solo las micros con GPS y solo desde zoom 16 se interpola el avance entre
//   actualizaciones (≤ 30 fps, durante 1 s, para lo que ya estaba dibujado):
//   llegan cada 30 s y saltarían. Las estimadas se recalculan cada segundo:
//   interpolarlas dejaba una animación que nunca paraba (CPU y batería) y las
//   hacía parecer GPS.
// - El canvas no recibe eventos (pointer-events: none): clic y puntero los
//   resuelve map-interaction.ts con hitTest sobre una grilla de 32 px.
// - Tras cada dibujo deja conteos en atributos data-* del canvas (pruebas y
//   benchmark): data-mode, data-vehicles, data-estimated, data-gps,
//   data-stale, data-drawn.

import L from 'leaflet';
import { VEHICLE_TAB_FONT, vehicleDiameterForZoom } from '@/components/map/map-paint';
import {
  clearSprites,
  cullVehicles,
  drawVehicleItems,
  focusIndex,
  lodForZoom,
  setSpriteScale,
  sortForDraw,
  vehicleEmphasis,
  type DrawItem,
  type FocusIndex,
  type VehicleLod,
} from '@/components/map/vehicle-draw';
import { hitRadiusPx, VehicleHitGrid } from '@/components/map/vehicle-hit-grid';
import type { MapFocus, MapVehicle, VehicleFeed } from '@/types/ui-contracts';
import type { Theme } from '@/types/transport';

export const VEHICLE_PANE = 'vehiclePane';
const VEHICLE_PANE_Z = '450';
const INTERPOLATE_MIN_ZOOM = 16;
const INTERPOLATE_MS = 1000;
const INTERPOLATE_FRAME_MS = 1000 / 30;
// Un gesto que nunca avisó su fin (zoom táctil cortado) no debe congelar las micros.
const STUCK_INTERACTION_MS = 4000;

/** Lo que usa esta capa de las tripas de L.Canvas (no está en los tipos públicos). */
interface CanvasInternals {
  _map?: L.Map & { _animatingZoom?: boolean };
  _ctx?: CanvasRenderingContext2D;
  _container?: HTMLCanvasElement;
  _bounds?: L.Bounds;
  _zoom?: number;
}

/** Los métodos de L.Canvas que aquí se reemplazan (no están en los tipos públicos). */
const canvasProto = L.Canvas.prototype as unknown as { _update(this: L.Canvas): void; _reset(this: L.Canvas): void };

interface Interpolation {
  from: Map<string, { lat: number; lng: number }>;
  start: number;
}

function sameFocus(a: FocusIndex | null, b: FocusIndex | null): boolean {
  if (a === b) return true;
  if (!a || !b || a.directionId !== b.directionId || a.ids.size !== b.ids.size) return false;
  for (const id of a.ids) if (!b.ids.has(id)) return false;
  return true;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

export class VehicleCanvasLayer extends L.Canvas {
  private feed: VehicleFeed | null = null;
  private unsubscribe: (() => void) | null = null;
  private vehicles: readonly MapVehicle[] = [];
  private focus: FocusIndex | null = null;
  private theme: Theme = 'light';
  /** Estimadas de toda la red: puntos también a zoom 13 (lodForZoom). */
  private dense = false;
  private interactingSince = 0;
  private drawFrame = 0;
  private animFrame = 0;
  private lastAnimDraw = 0;
  private interpolation: Interpolation | null = null;
  /** Posición dibujada por id (GPS desde zoom 16, para interpolar desde ahí). */
  private drawnAt = new Map<string, { lat: number; lng: number }>();
  private readonly grid = new VehicleHitGrid<MapVehicle>();
  /** Nivel de detalle del último dibujo: decide el radio de toque. */
  private drawnLod: VehicleLod = 'icon';

  private stats = '';
  /** Reubicación postergada tras soltar un arrastre (rAF + timeout). */
  private deferredFrame = 0;
  private deferredTimer = 0;
  private syncUpdate = false;
  private updatedOrigin: L.Point | null = null;

  constructor() {
    super({ pane: VEHICLE_PANE, padding: 0.1 });
  }

  private get internals(): CanvasInternals {
    return this as unknown as CanvasInternals;
  }

  onAdd(map: L.Map): this {
    const pane = map.getPane(VEHICLE_PANE) ?? map.createPane(VEHICLE_PANE);
    pane.style.zIndex = VEHICLE_PANE_Z;
    pane.style.pointerEvents = 'none';
    // Leaflet dibuja al doble en pantallas retina: los sprites, igual.
    setSpriteScale(L.Browser.retina ? 2 : 1);
    super.onAdd(map);
    const canvas = this.internals._container;
    if (canvas) {
      canvas.classList.add('vehicle-canvas');
      canvas.style.pointerEvents = 'none';
    }
    map.on('movestart zoomstart', this.onInteractStart);
    map.on('moveend zoomend', this.onInteractEnd);
    this.resubscribe();
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts
        .load(VEHICLE_TAB_FONT)
        .then(() => {
          if (!this.internals._map) return;
          clearSprites();
          this.requestDraw();
        })
        .catch(() => {
          // Sin la fuente, las lengüetas quedan con la monoespaciada del sistema.
        });
    }
    return this;
  }

  onRemove(map: L.Map): this {
    map.off('movestart zoomstart', this.onInteractStart);
    map.off('moveend zoomend', this.onInteractEnd);
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.cancelFrames();
    this.cancelDeferredUpdate();
    super.onRemove(map);
    return this;
  }

  /** viewreset: el origen de píxeles cambia, se reubica en el acto. */
  _reset(): void {
    this.syncUpdate = true;
    try {
      canvasProto._reset.call(this);
    } finally {
      this.syncUpdate = false;
    }
  }

  /**
   * Leaflet reubica y vacía el canvas en cada moveend. Tras un arrastre puro
   * (mismo zoom y mismo origen de píxeles) se posterga hasta después del
   * próximo cuadro: lo dibujado sigue bien ubicado porque se movió con el mapa.
   */
  _update(): void {
    const { _map: map, _bounds: bounds, _zoom: zoom } = this.internals;
    const pan =
      !this.syncUpdate &&
      !!map &&
      !!bounds &&
      !map._animatingZoom &&
      zoom === map.getZoom() &&
      this.updatedOrigin != null &&
      map.getPixelOrigin().equals(this.updatedOrigin);
    if (pan) {
      this.deferUpdate();
      return;
    }
    this.cancelDeferredUpdate();
    canvasProto._update.call(this);
    if (map) this.updatedOrigin = map.getPixelOrigin();
  }

  private deferUpdate(): void {
    this.cancelDeferredUpdate();
    this.deferredFrame = requestAnimationFrame(() => {
      this.deferredFrame = 0;
      this.deferredTimer = window.setTimeout(() => {
        this.deferredTimer = 0;
        // Otro arrastre empezó: su moveend la vuelve a pedir.
        if (!this.internals._map || this.isInteracting()) return;
        canvasProto._update.call(this);
      }, 0);
    });
  }

  private cancelDeferredUpdate(): void {
    if (this.deferredFrame) cancelAnimationFrame(this.deferredFrame);
    if (this.deferredTimer) window.clearTimeout(this.deferredTimer);
    this.deferredFrame = 0;
    this.deferredTimer = 0;
  }

  /** Cambia la fuente: borra en el acto lo de la anterior y se suscribe a la nueva. */
  setFeed(feed: VehicleFeed | null): void {
    if (feed === this.feed) return;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.cancelFrames();
    this.feed = feed;
    this.vehicles = [];
    this.drawnAt.clear();
    this.drawNow();
    this.resubscribe();
  }

  /** Tinta, anillos, mezcla del GPS viejo y lengüetas siguen al tema. */
  setTheme(theme: Theme): void {
    if (theme === this.theme) return;
    this.theme = theme;
    this.requestDraw();
  }

  setDense(dense: boolean): void {
    if (dense === this.dense) return;
    this.dense = dense;
    this.requestDraw();
  }

  setFocus(focus: MapFocus | null): void {
    const next = focusIndex(focus);
    if (sameFocus(next, this.focus)) return;
    this.focus = next;
    this.requestDraw();
  }

  isInteracting(): boolean {
    return this.interactingSince > 0 && performance.now() - this.interactingSince < STUCK_INTERACTION_MS;
  }

  /**
   * Leaflet vacía el canvas y llama a _draw (desde _redraw) cada vez que lo
   * reubica: al terminar un arrastre o un zoom y en un viewreset (cuando el
   * redibujo queda postergado, después de un 'update'). Sin capas propias, aquí
   * se dibujan las micros; si no, un setView sin animación las borraría hasta
   * la próxima actualización de la fuente (30 s en GPS).
   */
  _draw(): void {
    this.drawNow();
  }

  /** La micro dibujada más cercana a un punto del contenedor del mapa, con el radio de toque de lo dibujado. */
  hitTest(containerPoint: L.Point, touch: boolean): MapVehicle | null {
    const map = this.internals._map;
    if (!map || this.isInteracting()) return null;
    const p = map.containerPointToLayerPoint(containerPoint);
    return this.grid.nearest(p.x, p.y, hitRadiusPx(this.drawnLod === 'dot', touch));
  }

  private resubscribe(): void {
    if (!this.feed || !this.internals._map || this.unsubscribe) return;
    this.unsubscribe = this.feed.subscribe(this.onVehicles);
  }

  /** Se interpola solo el GPS (cada 30 s), de cerca. */
  private interpolates(map: L.Map): boolean {
    return this.feed?.kind === 'gps' && map.getZoom() >= INTERPOLATE_MIN_ZOOM;
  }

  private readonly onVehicles = (vehicles: readonly MapVehicle[]) => {
    const previous = this.drawnAt;
    this.vehicles = vehicles;
    if (this.isInteracting()) return; // se dibuja al terminar el gesto
    const map = this.internals._map;
    if (map && this.interpolates(map) && previous.size > 0 && !prefersReducedMotion()) {
      const from = new Map<string, { lat: number; lng: number }>();
      for (const v of vehicles) {
        const p = previous.get(v.id);
        if (p && (p.lat !== v.lat || p.lng !== v.lng)) from.set(v.id, p);
      }
      if (from.size > 0) {
        this.interpolation = { from, start: performance.now() };
        if (!this.animFrame) this.animFrame = requestAnimationFrame(this.animate);
        return;
      }
    }
    this.requestDraw();
  };

  private readonly onInteractStart = () => {
    this.interactingSince = performance.now();
    this.interpolation = null;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.animFrame = 0;
  };

  private readonly onInteractEnd = () => {
    this.interactingSince = 0;
  };

  private readonly animate = (now: number) => {
    this.animFrame = 0;
    const interpolation = this.interpolation;
    if (!interpolation || this.isInteracting()) {
      this.interpolation = null;
      return;
    }
    if (now - this.lastAnimDraw >= INTERPOLATE_FRAME_MS - 1) {
      this.lastAnimDraw = now;
      this.drawNow(now);
    }
    if (now - interpolation.start < INTERPOLATE_MS) {
      this.animFrame = requestAnimationFrame(this.animate);
    } else {
      this.interpolation = null;
      this.drawNow();
    }
  };

  private requestDraw(): void {
    if (this.drawFrame || this.isInteracting()) return;
    this.drawFrame = requestAnimationFrame(() => {
      this.drawFrame = 0;
      if (!this.isInteracting()) this.drawNow();
    });
  }

  private cancelFrames(): void {
    if (this.drawFrame) cancelAnimationFrame(this.drawFrame);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.drawFrame = 0;
    this.animFrame = 0;
    this.interpolation = null;
  }

  private drawNow(now = performance.now()): void {
    const { _map: map, _ctx: ctx, _container: canvas } = this.internals;
    if (!map || !ctx || !canvas) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    this.grid.clear();

    let estimated = 0;
    let gps = 0;
    let stale = 0;
    for (const v of this.vehicles) {
      if (v.kind === 'gps') gps += 1;
      else estimated += 1;
      if (v.stale) stale += 1;
    }

    const zoom = map.getZoom();
    const trackPositions = this.interpolates(map);
    const interpolation = trackPositions ? this.interpolation : null;
    const t = interpolation ? Math.min(1, (now - interpolation.start) / INTERPOLATE_MS) : 1;
    const bounds = map.getBounds().pad(0.1);
    const visible = cullVehicles(this.vehicles, {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    });
    const items: DrawItem[] = [];
    const drawnAt = trackPositions ? new Map<string, { lat: number; lng: number }>() : this.drawnAt;
    if (!trackPositions) drawnAt.clear();
    for (const vehicle of visible) {
      const emphasis = vehicleEmphasis(vehicle, this.focus);
      if (emphasis === 'hidden') continue;
      let { lat, lng } = vehicle;
      const from = interpolation?.from.get(vehicle.id);
      if (from && t < 1) {
        lat = from.lat + (lat - from.lat) * t;
        lng = from.lng + (lng - from.lng) * t;
      }
      if (trackPositions) drawnAt.set(vehicle.id, { lat, lng });
      const p = map.latLngToLayerPoint([lat, lng]);
      items.push({ vehicle, emphasis, x: p.x, y: p.y });
    }
    this.drawnAt = drawnAt;
    const sorted = sortForDraw(items);
    this.drawnLod = lodForZoom(zoom, this.dense);
    drawVehicleItems(ctx, sorted, { lod: this.drawnLod, diameter: vehicleDiameterForZoom(zoom), theme: this.theme });
    for (const item of sorted) this.grid.insert(item.x, item.y, item.vehicle);

    const mode = this.feed ? (this.feed.kind === 'gps' ? 'gps' : 'schedule') : 'off';
    const stats = `${mode}|${this.vehicles.length}|${estimated}|${gps}|${stale}|${sorted.length}`;
    if (stats !== this.stats) {
      this.stats = stats;
      canvas.dataset.mode = mode;
      canvas.dataset.vehicles = String(this.vehicles.length);
      canvas.dataset.estimated = String(estimated);
      canvas.dataset.gps = String(gps);
      canvas.dataset.stale = String(stale);
      canvas.dataset.drawn = String(sorted.length);
    }
  }
}
