// Parques, jardines, plazas, bosques y reservas (OSM): ~2.100 polígonos
// rellenos, en un canvas propio debajo de los trazados (panel greenspacePane).
//
// Antes eran L.polygon en el canvas compartido del mapa: ~16 MB de heap y
// cada zoom reproyectaba sus ~48.000 vértices y volvía a pintarlos junto con
// todas las líneas. Ahora los vértices viven empaquetados en Mercator
// normalizada (packed-polygons.ts) y este canvas los pasa a píxeles con una
// multiplicación al terminar cada movimiento o zoom.
//
// El canvas no recibe eventos (pointer-events: none), así que nunca tapa los
// clics de líneas y paraderos. El nombre del área se muestra con el tooltip
// compartido al pasar el puntero, solo si no hay otra capa interactiva debajo
// (un trazado o una ciclovía mandan). El dataset se descarga recién la
// primera vez que se enciende la capa.

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GreenKind, GreenSpace } from '@/data/greenspace.generated';
import type { LayerStatusControls } from '@/hooks/use-layer-status';
import { hideMapTooltip, showMapTooltip } from '@/components/map/map-tooltip';
import {
  mercatorU,
  mercatorV,
  packPolygons,
  polygonAt,
  polygonGrid,
  type PackedPolygons,
  type PolygonGrid,
} from '@/components/map/packed-polygons';

const GREENSPACE_PANE = 'greenspacePane';
// Sobre la cobertura (350) y debajo de trazados y ciclovías (overlayPane, 400).
const GREENSPACE_PANE_Z = '360';
const STROKE_WIDTH = 0.8;
/** Vértices a menos de esto (px) del anterior no se dibujan: lejos, un parque son pocos píxeles. */
const MIN_STEP_PX = 0.75;

export const GREEN_KIND_STYLE: Record<GreenKind, { fill: string; stroke: string }> = {
  // Parque "típico", verde frondoso.
  park: { fill: 'rgba(34, 197, 94, 0.45)', stroke: 'rgba(21, 128, 61, 0.85)' },
  // Jardines / centros botánicos, verde más oscuro.
  garden: { fill: 'rgba(22, 163, 74, 0.4)', stroke: 'rgba(20, 83, 45, 0.8)' },
  // Plazas, más amarillento, indica pavimento.
  plaza: { fill: 'rgba(132, 204, 22, 0.4)', stroke: 'rgba(77, 124, 15, 0.8)' },
  // Bosques urbanos.
  forest: { fill: 'rgba(5, 150, 105, 0.5)', stroke: 'rgba(6, 95, 70, 0.85)' },
  // Reservas naturales (grandes, valoradas).
  nature_reserve: {
    fill: 'rgba(16, 185, 129, 0.45)',
    stroke: 'rgba(6, 78, 59, 0.85)',
  },
};

const KIND_LABEL: Record<GreenKind, string> = {
  park: 'Parque',
  garden: 'Jardín',
  plaza: 'Plaza',
  forest: 'Bosque',
  nature_reserve: 'Reserva natural',
};

interface GreenData {
  items: readonly GreenSpace[];
  packed: PackedPolygons;
  grid: PolygonGrid;
  /** Índices de polígono por tipo: se pintan juntos con el mismo estilo. */
  byKind: Array<[GreenKind, number[]]>;
}

let dataPromise: Promise<GreenData> | null = null;
let dataReady = false;
function loadGreenspace(): Promise<GreenData> {
  dataPromise ??= import('@/data/greenspace.generated').then((mod) => {
    dataReady = true;
    const items = mod.GREEN_SPACES;
    const packed = packPolygons(items.map((g) => g.ring));
    const byKind = new Map<GreenKind, number[]>();
    items.forEach((g, i) => {
      const list = byKind.get(g.kind) ?? [];
      list.push(i);
      byKind.set(g.kind, list);
    });
    return { items, packed, grid: polygonGrid(packed), byKind: [...byKind] };
  });
  return dataPromise;
}

/** Lo que usa esta capa de las tripas de L.Canvas (no está en los tipos públicos). */
interface CanvasInternals {
  _map?: L.Map;
  _ctx?: CanvasRenderingContext2D;
  _container?: HTMLCanvasElement;
  _bounds?: L.Bounds;
}

class GreenspaceCanvasLayer extends L.Canvas {
  private hoverFrame = 0;
  private lastMove: L.LeafletMouseEvent | null = null;
  private showing = false;

  constructor(private readonly data: GreenData) {
    super({ pane: GREENSPACE_PANE, padding: 0.1 });
  }

  private get internals(): CanvasInternals {
    return this as unknown as CanvasInternals;
  }

  onAdd(map: L.Map): this {
    const pane = map.getPane(GREENSPACE_PANE) ?? map.createPane(GREENSPACE_PANE);
    pane.style.zIndex = GREENSPACE_PANE_Z;
    pane.style.pointerEvents = 'none';
    super.onAdd(map);
    const canvas = this.internals._container;
    if (canvas) {
      canvas.classList.add('greenspace-canvas');
      canvas.style.pointerEvents = 'none';
    }
    map.on('mousemove', this.onMove);
    map.on('mouseout', this.onOut);
    return this;
  }

  onRemove(map: L.Map): this {
    map.off('mousemove', this.onMove);
    map.off('mouseout', this.onOut);
    if (this.hoverFrame) cancelAnimationFrame(this.hoverFrame);
    this.onOut();
    super.onRemove(map);
    return this;
  }

  /** Leaflet llama a _draw al terminar cada movimiento o zoom (el canvas ya quedó limpio y en su lugar). */
  _draw(): void {
    const { _map: map, _ctx: ctx, _container: canvas, _bounds: bounds } = this.internals;
    if (!map || !ctx || !canvas || !bounds) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const scale = map.options.crs?.scale(map.getZoom()) ?? 256 * 2 ** map.getZoom();
    const origin = map.getPixelOrigin();
    // Lo que cubre el canvas, en Mercator normalizada.
    const minU = (bounds.min!.x + origin.x) / scale;
    const minV = (bounds.min!.y + origin.y) / scale;
    const maxU = (bounds.max!.x + origin.x) / scale;
    const maxV = (bounds.max!.y + origin.y) / scale;
    const { coords, starts, boxes } = this.data.packed;

    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineJoin = 'round';
    for (const [kind, indices] of this.data.byKind) {
      const style = GREEN_KIND_STYLE[kind];
      ctx.fillStyle = style.fill;
      ctx.strokeStyle = style.stroke;
      for (const i of indices) {
        if (boxes[i * 4] > maxU || boxes[i * 4 + 2] < minU || boxes[i * 4 + 1] > maxV || boxes[i * 4 + 3] < minV) continue;
        ctx.beginPath();
        let lastX = NaN;
        let lastY = NaN;
        for (let k = starts[i]; k < starts[i + 1]; k++) {
          const x = coords[k * 2] * scale - origin.x;
          const y = coords[k * 2 + 1] * scale - origin.y;
          if (k === starts[i]) ctx.moveTo(x, y);
          else if (Math.abs(x - lastX) >= MIN_STEP_PX || Math.abs(y - lastY) >= MIN_STEP_PX) ctx.lineTo(x, y);
          else continue;
          lastX = x;
          lastY = y;
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  private readonly onMove = (e: L.LeafletMouseEvent) => {
    this.lastMove = e;
    if (!this.hoverFrame) this.hoverFrame = requestAnimationFrame(this.hover);
  };

  private readonly onOut = () => {
    this.lastMove = null;
    const map = this.internals._map;
    if (this.showing && map) hideMapTooltip(map, 'feature');
    this.showing = false;
  };

  private readonly hover = () => {
    this.hoverFrame = 0;
    const e = this.lastMove;
    const map = this.internals._map;
    if (!e || !map) return;
    const target = e.originalEvent.target;
    // Un trazado, paradero o ciclovía bajo el puntero (el canvas compartido lo
    // marca como interactivo) o un marcador: su tooltip manda.
    if (
      target instanceof Element &&
      (target.classList.contains('leaflet-interactive') || target.closest('.leaflet-marker-pane, .leaflet-control-container'))
    ) {
      this.showing = false;
      return;
    }
    const i = polygonAt(this.data.packed, this.data.grid, mercatorU(e.latlng.lng), mercatorV(e.latlng.lat));
    if (i < 0) {
      if (this.showing) hideMapTooltip(map, 'feature');
      this.showing = false;
      return;
    }
    const g = this.data.items[i];
    const hectares = `${(g.areaM2 / 10_000).toFixed(1).replace('.', ',')} ha`;
    const primary = g.name ?? KIND_LABEL[g.kind];
    const secondary = g.name ? `${KIND_LABEL[g.kind]} · ${hectares}` : hectares;
    showMapTooltip(map, e.latlng, primary, secondary);
    this.showing = true;
  };
}

interface Props {
  enabled: boolean;
  retryKey: number;
  loadStatus: LayerStatusControls;
}

export function GreenspaceLayer({ enabled, retryKey, loadStatus }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let layer: GreenspaceCanvasLayer | null = null;
    if (!dataReady) loadStatus.start();
    void loadGreenspace()
      .then((data) => {
        if (cancelled) return;
        layer = new GreenspaceCanvasLayer(data);
        layer.addTo(map);
        loadStatus.succeed();
      })
      .catch((err) => {
        dataPromise = null;
        dataReady = false;
        if (!cancelled) loadStatus.fail(err, 'No se pudo cargar áreas verdes');
      });

    return () => {
      cancelled = true;
      layer?.remove();
    };
  }, [enabled, map, loadStatus, retryKey]);

  return null;
}
