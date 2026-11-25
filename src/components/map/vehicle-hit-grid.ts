// Búsqueda de la micro bajo el puntero sin recorrer las miles dibujadas: una
// grilla de celdas de 32 px en coordenadas de capa, rehecha en cada dibujo.
// El canvas de micros no recibe eventos (pointer-events: none); el clic y el
// puntero los resuelve map-interaction.ts preguntando aquí.

export const HIT_CELL_PX = 32;

// Radio de toque alrededor del centro de la micro. Con insignias (zoom ≥ 13):
// con el mouse, la insignia más grande (Ø26); con el dedo, 40 px de diámetro
// (objetivo táctil mínimo), más que cualquier insignia con su anillo. Lejos,
// con puntos de Ø7 pegados a los paraderos de su línea, el radio vuelve al de
// antes (10 y 16): con 20 px, tocar un paradero o una línea en "Toda la red"
// abría una micro.
export const HIT_RADIUS_MOUSE_PX = 13;
export const HIT_RADIUS_TOUCH_PX = 20;
export const HIT_RADIUS_DOT_MOUSE_PX = 10;
export const HIT_RADIUS_DOT_TOUCH_PX = 16;

/** Radio de toque según lo dibujado: puntos (nivel `dot`) o insignias. */
export function hitRadiusPx(dots: boolean, touch: boolean): number {
  if (dots) return touch ? HIT_RADIUS_DOT_TOUCH_PX : HIT_RADIUS_DOT_MOUSE_PX;
  return touch ? HIT_RADIUS_TOUCH_PX : HIT_RADIUS_MOUSE_PX;
}

export class VehicleHitGrid<T> {
  private cells = new Map<number, Array<{ x: number; y: number; seq: number; item: T }>>();
  private seq = 0;

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
  }

  get size(): number {
    let n = 0;
    for (const list of this.cells.values()) n += list.length;
    return n;
  }

  /** Se inserta en orden de dibujo: ante un empate gana lo último, que es lo que queda encima. */
  insert(x: number, y: number, item: T): void {
    const k = this.key(Math.floor(x / this.cell), Math.floor(y / this.cell));
    let list = this.cells.get(k);
    if (!list) this.cells.set(k, (list = []));
    list.push({ x, y, seq: this.seq++, item });
  }

  /** Lo más cercano a (x, y) dentro de `radius` px, o null. */
  nearest(x: number, y: number, radius: number): T | null {
    const r2 = radius * radius;
    let best: T | null = null;
    let bestD = Infinity;
    let bestSeq = -1;
    const minX = Math.floor((x - radius) / this.cell);
    const maxX = Math.floor((x + radius) / this.cell);
    const minY = Math.floor((y - radius) / this.cell);
    const maxY = Math.floor((y + radius) / this.cell);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const list = this.cells.get(this.key(cx, cy));
        if (!list) continue;
        for (const entry of list) {
          const dx = entry.x - x;
          const dy = entry.y - y;
          const d = dx * dx + dy * dy;
          if (d > r2 || d > bestD || (d === bestD && entry.seq < bestSeq)) continue;
          bestD = d;
          bestSeq = entry.seq;
          best = entry.item;
        }
      }
    }
    return best;
  }
}
