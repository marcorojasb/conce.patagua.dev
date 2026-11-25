// Búsqueda de la micro bajo el puntero sin recorrer las miles dibujadas: una
// grilla de celdas de 32 px en coordenadas de capa, rehecha en cada dibujo.
// El canvas de micros no recibe eventos (pointer-events: none); el clic y el
// puntero los resuelve map-interaction.ts preguntando aquí.
//
// Cada micro se guarda con lo que ocupa lo dibujado (vehicle-draw.ts la
// inserta al pintarla): su insignia con el anillo y, de cerca, la lengüeta
// del código, que llega hasta ~75 px a la derecha del centro. Un clic sobre lo
// dibujado elige esa micro aunque quede lejos del centro; fuera de todo, la
// más cercana dentro del radio de toque.

import { VEHICLE_TAB_HEIGHT } from '@/components/map/map-paint';

export const HIT_CELL_PX = 32;

// Radio de toque alrededor del centro de la micro, además de lo dibujado. Con
// insignias (zoom ≥ 13): con el mouse, la insignia más grande (Ø26); con el
// dedo, 40 px de diámetro (objetivo táctil mínimo), más que cualquier insignia
// con su anillo. Lejos, con puntos de Ø7 pegados a los paraderos de su línea,
// el radio vuelve al de antes (10 y 16): con 20 px, tocar un paradero o una
// línea en "Toda la red" abría una micro.
export const HIT_RADIUS_MOUSE_PX = 13;
export const HIT_RADIUS_TOUCH_PX = 20;
export const HIT_RADIUS_DOT_MOUSE_PX = 10;
export const HIT_RADIUS_DOT_TOUCH_PX = 16;

/** Radio de toque según lo dibujado: puntos (nivel `dot`) o insignias. */
export function hitRadiusPx(dots: boolean, touch: boolean): number {
  if (dots) return touch ? HIT_RADIUS_DOT_TOUCH_PX : HIT_RADIUS_DOT_MOUSE_PX;
  return touch ? HIT_RADIUS_TOUCH_PX : HIT_RADIUS_MOUSE_PX;
}

/** Lo que ocupa la insignia alrededor del centro, en px. */
export interface HitShape {
  /** Círculo (estimada) o cuadrado (GPS: su anillo llega más lejos en diagonal). */
  kind: 'circle' | 'square';
  /** Radio del círculo o medio lado del cuadrado. */
  radius: number;
}

/** Sin forma propia: solo cuenta el radio de toque (los puntos lejanos son menores que él). */
const POINT: HitShape = { kind: 'circle', radius: 0 };
const TAB_HALF_HEIGHT = VEHICLE_TAB_HEIGHT / 2;

interface Entry<T> {
  x: number;
  y: number;
  seq: number;
  item: T;
  shape: HitShape;
  /** Extremo derecho de la lengüeta desde el centro; 0 sin lengüeta. */
  tabEnd: number;
}

/** ¿Cae (dx, dy), relativo al centro, sobre la insignia o la lengüeta? */
function onDrawn(entry: Entry<unknown>, dx: number, dy: number): boolean {
  const { kind, radius } = entry.shape;
  const ady = Math.abs(dy);
  if (kind === 'square' ? Math.abs(dx) <= radius && ady <= radius : dx * dx + dy * dy <= radius * radius) return true;
  return entry.tabEnd > 0 && dx >= 0 && dx <= entry.tabEnd && ady <= TAB_HALF_HEIGHT;
}

export class VehicleHitGrid<T> {
  private cells = new Map<number, Array<Entry<T>>>();
  private seq = 0;
  /** Lo más lejos que llega una insignia y una lengüeta: cuántas celdas vecinas mirar. */
  private maxShape = 0;
  private maxTabEnd = 0;

  private readonly cell: number;

  constructor(cell = HIT_CELL_PX) {
    this.cell = cell;
  }

  // Clave numérica de la celda: evita armar strings en cada inserción. Las
  // coordenadas de capa caben holgadas en ±2^20 celdas.
  private key(cx: number, cy: number): number {
    return (cx + 1_048_576) * 2_097_152 + (cy + 1_048_576);
  }

  clear(): void {
    this.cells.clear();
    this.seq = 0;
    this.maxShape = 0;
    this.maxTabEnd = 0;
  }

  get size(): number {
    let n = 0;
    for (const list of this.cells.values()) n += list.length;
    return n;
  }

  /**
   * Se inserta en orden de dibujo (lo último queda encima), con la insignia
   * dibujada y el extremo derecho de la lengüeta, si la lleva.
   */
  insert(x: number, y: number, item: T, shape: HitShape = POINT, tabEnd = 0): void {
    const k = this.key(Math.floor(x / this.cell), Math.floor(y / this.cell));
    let list = this.cells.get(k);
    if (!list) this.cells.set(k, (list = []));
    list.push({ x, y, seq: this.seq++, item, shape, tabEnd });
    if (shape.radius > this.maxShape) this.maxShape = shape.radius;
    if (tabEnd > this.maxTabEnd) this.maxTabEnd = tabEnd;
  }

  /**
   * Lo que hay en (x, y): si cae sobre lo dibujado (insignia o lengüeta), lo
   * último dibujado ahí, que es lo que queda encima; si no, lo más cercano
   * dentro de `radius` px (ante un empate, lo último). O null.
   */
  nearest(x: number, y: number, radius: number): T | null {
    const r2 = radius * radius;
    const reach = Math.max(radius, this.maxShape);
    // La lengüeta sale a la derecha: se mira más a la izquierda del punto.
    const minX = Math.floor((x - Math.max(reach, this.maxTabEnd)) / this.cell);
    const maxX = Math.floor((x + reach) / this.cell);
    const rise = this.maxTabEnd > 0 ? Math.max(reach, TAB_HALF_HEIGHT) : reach;
    const minY = Math.floor((y - rise) / this.cell);
    const maxY = Math.floor((y + rise) / this.cell);
    let top: Entry<T> | null = null;
    let best: Entry<T> | null = null;
    let bestD = Infinity;
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const list = this.cells.get(this.key(cx, cy));
        if (!list) continue;
        for (const entry of list) {
          const dx = x - entry.x;
          const dy = y - entry.y;
          if (onDrawn(entry, dx, dy)) {
            if (!top || entry.seq > top.seq) top = entry;
            continue;
          }
          const d = dx * dx + dy * dy;
          if (d > r2 || d > bestD || (d === bestD && best && entry.seq < best.seq)) continue;
          bestD = d;
          best = entry;
        }
      }
    }
    return (top ?? best)?.item ?? null;
  }
}
