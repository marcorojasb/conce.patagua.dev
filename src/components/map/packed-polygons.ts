// Polígonos empaquetados en arreglos tipados, para las áreas verdes (~2.100
// polígonos y ~48.000 vértices). Como L.Polygon cada vértice eran tres
// objetos (LatLng, punto proyectado y su copia recortada) más un objeto
// Leaflet por polígono: ~16 MB de heap y todo reproyectado en cada zoom. Aquí
// cada vértice son dos números en coordenadas Mercator normalizadas (0..1):
// pasar a píxeles a cualquier zoom es una multiplicación, sin proyectar.
//
// Funciones puras (con pruebas): empaquetar, punto en polígono y una grilla
// gruesa para encontrar el polígono bajo el puntero sin recorrerlos todos.

/** x Mercator normalizada (0 = 180° O, 1 = 180° E), la misma de Leaflet a escala 1. */
export function mercatorU(lng: number): number {
  return 0.5 + lng / 360;
}

/** y Mercator normalizada (0 = norte, 1 = sur). */
export function mercatorV(lat: number): number {
  const phi = (lat * Math.PI) / 180;
  return 0.5 - Math.log(Math.tan(Math.PI / 4 + phi / 2)) / (2 * Math.PI);
}

export interface PackedPolygons {
  /** u, v de todos los vértices, polígono tras polígono. */
  coords: Float64Array;
  /** Primer vértice de cada polígono; `starts[n]` es el total de vértices. */
  starts: Uint32Array;
  /** Caja de cada polígono: minU, minV, maxU, maxV. */
  boxes: Float64Array;
}

export function packPolygons(rings: ReadonlyArray<ReadonlyArray<readonly [number, number]>>): PackedPolygons {
  let total = 0;
  for (const ring of rings) total += ring.length;
  const coords = new Float64Array(total * 2);
  const starts = new Uint32Array(rings.length + 1);
  const boxes = new Float64Array(rings.length * 4);
  let k = 0;
  rings.forEach((ring, i) => {
    starts[i] = k / 2;
    let minU = Infinity;
    let minV = Infinity;
    let maxU = -Infinity;
    let maxV = -Infinity;
    for (const [lat, lng] of ring) {
      const u = mercatorU(lng);
      const v = mercatorV(lat);
      coords[k++] = u;
      coords[k++] = v;
      if (u < minU) minU = u;
      if (u > maxU) maxU = u;
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }
    boxes.set([minU, minV, maxU, maxV], i * 4);
  });
  starts[rings.length] = total;
  return { coords, starts, boxes };
}

/** El punto (u, v) cae dentro del polígono `i` (regla par-impar). */
export function containsPoint(packed: PackedPolygons, i: number, u: number, v: number): boolean {
  const { coords, starts, boxes } = packed;
  if (u < boxes[i * 4] || v < boxes[i * 4 + 1] || u > boxes[i * 4 + 2] || v > boxes[i * 4 + 3]) return false;
  const start = starts[i];
  const end = starts[i + 1];
  let inside = false;
  for (let a = start, b = end - 1; a < end; b = a++) {
    const ua = coords[a * 2];
    const va = coords[a * 2 + 1];
    const ub = coords[b * 2];
    const vb = coords[b * 2 + 1];
    if (va > v !== vb > v && u < ((ub - ua) * (v - va)) / (vb - va) + ua) inside = !inside;
  }
  return inside;
}

export interface PolygonGrid {
  minU: number;
  minV: number;
  cell: number;
  cols: number;
  rows: number;
  /** Polígonos cuya caja toca cada celda. */
  cells: number[][];
}

/** Grilla de `size` × `size` celdas sobre la caja de todos los polígonos. */
export function polygonGrid(packed: PackedPolygons, size = 64): PolygonGrid {
  const n = packed.starts.length - 1;
  let minU = Infinity;
  let minV = Infinity;
  let maxU = -Infinity;
  let maxV = -Infinity;
  for (let i = 0; i < n; i++) {
    minU = Math.min(minU, packed.boxes[i * 4]);
    minV = Math.min(minV, packed.boxes[i * 4 + 1]);
    maxU = Math.max(maxU, packed.boxes[i * 4 + 2]);
    maxV = Math.max(maxV, packed.boxes[i * 4 + 3]);
  }
  const cell = Math.max(maxU - minU, maxV - minV, 1e-9) / size;
  const cols = Math.max(1, Math.ceil((maxU - minU) / cell));
  const rows = Math.max(1, Math.ceil((maxV - minV) / cell));
  const cells: number[][] = Array.from({ length: cols * rows }, () => []);
  const col = (u: number) => Math.min(cols - 1, Math.max(0, Math.floor((u - minU) / cell)));
  const row = (v: number) => Math.min(rows - 1, Math.max(0, Math.floor((v - minV) / cell)));
  for (let i = 0; i < n; i++) {
    const b = packed.boxes;
    for (let r = row(b[i * 4 + 1]); r <= row(b[i * 4 + 3]); r++) {
      for (let c = col(b[i * 4]); c <= col(b[i * 4 + 2]); c++) cells[r * cols + c].push(i);
    }
  }
  return { minU, minV, cell, cols, rows, cells };
}

/**
 * El polígono bajo (u, v), o -1. Si hay varios (una plaza dentro de un
 * parque), el de caja más chica: el más específico.
 */
export function polygonAt(packed: PackedPolygons, grid: PolygonGrid, u: number, v: number): number {
  const c = Math.floor((u - grid.minU) / grid.cell);
  const r = Math.floor((v - grid.minV) / grid.cell);
  if (c < 0 || r < 0 || c >= grid.cols || r >= grid.rows) return -1;
  let best = -1;
  let bestArea = Infinity;
  for (const i of grid.cells[r * grid.cols + c]) {
    if (!containsPoint(packed, i, u, v)) continue;
    const b = packed.boxes;
    const area = (b[i * 4 + 2] - b[i * 4]) * (b[i * 4 + 3] - b[i * 4 + 1]);
    if (area < bestArea) {
      bestArea = area;
      best = i;
    }
  }
  return best;
}
