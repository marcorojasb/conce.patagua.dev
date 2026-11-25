// Dibujo de las micros en el canvas propio (vehicle-canvas-layer.ts). Las
// estimadas y las con GPS nunca se parecen, a ningún zoom:
//   - estimada: círculo con anillo blanco punteado (píldora punteada de cerca);
//   - GPS: cuadrado con anillo verde (ámbar y desvaída con el dato viejo),
//     píldora sólida con punto "en vivo" de cerca.
// Las formas y colores salen de VEHICLE_STYLE, igual que la leyenda.
// Las funciones de selección (recorte, orden, nivel de detalle) son puras y
// tienen pruebas; las de dibujo agrupan por color para pintar miles de micros
// con pocas llamadas al canvas.

import { readableTextOn } from '@/lib/utils';
import { VEHICLE_STYLE, type DirectionId, type MapFocus, type MapVehicle } from '@/types/ui-contracts';

/**
 * dot: puntos (zoom ≤ 12), salvo las micros del recorrido o paradero elegido,
 * que van como forma mediana: son pocas y son las que se buscan (como puntos
 * de 2,5 px se confundían con las paradas de su propia línea, justo al abrir
 * un recorrido largo, que se encuadra a zoom 11). icon: forma con rumbo
 * (13–14). pill: letrero con el código (≥ 15).
 */
export type VehicleLod = 'dot' | 'icon' | 'pill';

export function lodForZoom(zoom: number): VehicleLod {
  if (zoom <= 12) return 'dot';
  return zoom <= 14 ? 'icon' : 'pill';
}

/**
 * Qué se pinta como punto y qué como sprite (forma o letrero) en un nivel de
 * detalle. Lejos, las del foco van como forma mediana; las atenuadas nunca
 * llevan letrero.
 */
export function splitForLod<T extends Pick<DrawItem, 'emphasis'>>(
  items: readonly T[],
  lod: VehicleLod,
): { dots: T[]; sprites: T[] } {
  if (lod !== 'dot') return { dots: [], sprites: [...items] };
  const dots: T[] = [];
  const sprites: T[] = [];
  for (const item of items) (item.emphasis === 'focus' ? sprites : dots).push(item);
  return { dots, sprites };
}

export interface LatLngBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

/** Recorte por lat/lng antes de proyectar: proyectar miles de puntos fuera de pantalla es lo caro. */
export function cullVehicles<T extends { lat: number; lng: number }>(vehicles: readonly T[], box: LatLngBox): T[] {
  const out: T[] = [];
  for (const v of vehicles) {
    if (v.lat >= box.south && v.lat <= box.north && v.lng >= box.west && v.lng <= box.east) out.push(v);
  }
  return out;
}

export type VehicleEmphasis = 'hidden' | 'dimmed' | 'normal' | 'focus';

export interface FocusIndex {
  ids: ReadonlySet<string>;
  /** Solo con un único recorrido en foco. */
  directionId: DirectionId | null;
}

export function focusIndex(focus: MapFocus | null): FocusIndex | null {
  if (!focus || focus.routeIds.length === 0) return null;
  const ids = new Set(focus.routeIds);
  return { ids, directionId: ids.size === 1 ? focus.directionId : null };
}

/**
 * Con foco, lo demás se atenúa; con un sentido elegido, las micros del otro
 * sentido del mismo recorrido no se dibujan (las sin sentido conocido, sí).
 */
export function vehicleEmphasis(
  vehicle: Pick<MapVehicle, 'routeId' | 'directionId'>,
  focus: FocusIndex | null,
): VehicleEmphasis {
  if (!focus) return 'normal';
  if (!focus.ids.has(vehicle.routeId)) return 'dimmed';
  if (focus.directionId != null && vehicle.directionId != null && vehicle.directionId !== focus.directionId) {
    return 'hidden';
  }
  return 'focus';
}

export interface DrawItem {
  vehicle: MapVehicle;
  emphasis: Exclude<VehicleEmphasis, 'hidden'>;
  /** Coordenadas de capa (las del canvas de Leaflet). */
  x: number;
  y: number;
}

function drawRank(item: Pick<DrawItem, 'emphasis'> & { vehicle: Pick<MapVehicle, 'stale'> }): number {
  if (item.emphasis === 'dimmed') return 0;
  if (item.vehicle.stale) return 1;
  return item.emphasis === 'focus' ? 3 : 2;
}

/**
 * Orden de pintado: atenuadas abajo, después las con dato viejo, las normales
 * y arriba las del foco. Dentro de cada grupo, por color, para pintar en lotes.
 */
export function sortForDraw<T extends Pick<DrawItem, 'emphasis'> & { vehicle: Pick<MapVehicle, 'stale' | 'color'> }>(
  items: readonly T[],
): T[] {
  return items
    .map((item, index) => ({ item, index, rank: drawRank(item) }))
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.item.vehicle.color !== b.item.vehicle.color) return a.item.vehicle.color < b.item.vehicle.color ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

// ── Dibujo ──────────────────────────────────────────────────────────────────
//
// Las formas medianas y los letreros se pintan una vez en un sprite (canvas
// chico en caché) y después solo se copian con drawImage: en un navegador sin
// GPU, rasterizar 2.000 anillos punteados costaba ~30 ms por dibujo; copiar
// sprites, ~5 ms. El rumbo se redondea a 16 direcciones (22,5°). Lejos (zoom
// ≤ 12) los puntos se pintan directo, en lotes por color.

const PILL_FONT = '600 10px system-ui, -apple-system, "Segoe UI", sans-serif';
const PILL_HEIGHT = 16;
const TAU = Math.PI * 2;
const BEARING_STEPS = 16;
const ESTIMATE_DASH = [...VEHICLE_STYLE.estimate.dash];
/** Contorno de la estimada mediana (la leyenda usa el mismo). */
export const ESTIMATE_HALO = 'rgba(15, 23, 42, 0.5)';
const MAX_SPRITES = 4000;

/** Rumbo en grados → una de 16 direcciones; null sin rumbo. */
export function bearingBucket(bearing: number | null): number | null {
  if (bearing == null || !Number.isFinite(bearing)) return null;
  const deg = ((bearing % 360) + 360) % 360;
  return Math.round(deg / (360 / BEARING_STEPS)) % BEARING_STEPS;
}

interface Sprite {
  image: HTMLCanvasElement;
  /** Tamaño en px CSS y punto de anclaje (el centro de la micro). */
  w: number;
  h: number;
  ax: number;
  ay: number;
}

const sprites = new Map<string, Sprite>();
let spriteScale = 1;

/** Píxeles de dispositivo por px CSS del canvas de Leaflet (2 en pantallas retina). */
export function setSpriteScale(scale: number): void {
  if (scale === spriteScale) return;
  spriteScale = scale;
  sprites.clear();
}

function sprite(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): Sprite {
  let cached = sprites.get(key);
  if (cached) return cached;
  if (sprites.size >= MAX_SPRITES) sprites.clear();
  const image = document.createElement('canvas');
  image.width = Math.ceil(w * spriteScale);
  image.height = Math.ceil(h * spriteScale);
  const ctx = image.getContext('2d')!;
  ctx.scale(spriteScale, spriteScale);
  paint(ctx);
  cached = { image, w, h, ax: w / 2, ay: h / 2 };
  sprites.set(key, cached);
  return cached;
}

const textColors = new Map<string, string>();
let measureCtx: CanvasRenderingContext2D | null = null;

function textColorOn(color: string): string {
  let c = textColors.get(color);
  if (!c) textColors.set(color, (c = readableTextOn(color)));
  return c;
}

function vehicleAlpha(item: DrawItem): number {
  if (item.emphasis === 'dimmed') return VEHICLE_STYLE.dimmedAlpha;
  if (item.vehicle.kind === 'estimate') return VEHICLE_STYLE.estimate.alpha;
  return item.vehicle.stale ? VEHICLE_STYLE.gpsStale.alpha : VEHICLE_STYLE.gps.alpha;
}

/**
 * Los letreros van opacos: su texto se eligió para contrastar con el color de
 * la línea y con transparencia el mapa de fondo se lo comía. Lo que dice
 * "estimada" o "dato viejo" está en el borde y el relleno, no en la opacidad.
 */
function spriteAlpha(item: DrawItem, lod: 'icon' | 'pill'): number {
  return lod === 'pill' && item.emphasis !== 'dimmed' ? 1 : vehicleAlpha(item);
}

// Velo blanco del letrero GPS viejo: se ve desteñido y el texto negro sobre
// él contrasta al menos 6:1 con cualquier color de línea (aun negro puro).
const STALE_VEIL = 'rgba(255, 255, 255, 0.55)';

function gpsRing(stale: boolean): string {
  return stale ? VEHICLE_STYLE.gpsStale.ring : VEHICLE_STYLE.gps.ring;
}

// roundRect llegó tarde a algunos navegadores (Safari < 16): sin él, esquinas rectas.
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function headingTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, bucket: number, tip: number, base: number, half: number) {
  const a = (bucket * TAU) / BEARING_STEPS;
  const sin = Math.sin(a);
  const cos = Math.cos(a);
  ctx.beginPath();
  ctx.moveTo(x + sin * tip, y - cos * tip);
  ctx.lineTo(x + sin * base + cos * half, y - cos * base + sin * half);
  ctx.lineTo(x + sin * base - cos * half, y - cos * base - sin * half);
  ctx.closePath();
}

/**
 * Estimada mediana: círculo de 6 px, anillo blanco punteado y flecha blanca de
 * rumbo. Un contorno oscuro tenue por fuera la despega de su propia línea (del
 * mismo color) y de las paradas blancas del recorrido elegido.
 */
function estimateIcon(color: string, bucket: number | null): Sprite {
  return sprite(`e|${color}|${bucket}`, 18, 18, (ctx) => {
    ctx.beginPath();
    ctx.arc(9, 9, 7.5, 0, TAU);
    ctx.strokeStyle = ESTIMATE_HALO;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(9, 9, 6, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = VEHICLE_STYLE.estimate.ring;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(ESTIMATE_DASH);
    ctx.stroke();
    ctx.setLineDash([]);
    if (bucket != null) {
      headingTriangle(ctx, 9, 9, bucket, 4.5, -2.5, 2.8);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  });
}

/** Con GPS mediana: cuadrado de 12 px, borde blanco, anillo verde (ámbar si viejo) y muesca de rumbo. */
function gpsIcon(color: string, stale: boolean, bucket: number | null): Sprite {
  return sprite(`g|${color}|${stale}|${bucket}`, 32, 32, (ctx) => {
    const ring = gpsRing(stale);
    ctx.beginPath();
    roundRect(ctx, 8, 8, 16, 16, 5);
    ctx.lineWidth = 2;
    ctx.strokeStyle = ring;
    ctx.stroke();
    ctx.beginPath();
    roundRect(ctx, 10, 10, 12, 12, 3);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    if (bucket != null) {
      headingTriangle(ctx, 16, 16, bucket, 13, 8.5, 3.5);
      ctx.fillStyle = ring;
      ctx.fill();
    }
  });
}

/**
 * Letrero de cerca, siempre opaco. Estimada: borde blanco punteado y sin punto.
 * GPS: anillo verde y punto "en vivo". GPS viejo: anillo ámbar, sin punto y
 * relleno desteñido con texto negro.
 */
function pill(kind: MapVehicle['kind'], color: string, stale: boolean, code: string): Sprite {
  const key = `p|${kind}|${color}|${stale}|${code}`;
  const cached = sprites.get(key);
  if (cached) return cached;
  const gps = kind === 'gps';
  const live = gps && !stale;
  measureCtx ??= document.createElement('canvas').getContext('2d')!;
  measureCtx.font = PILL_FONT;
  const w = Math.max(24, Math.ceil(measureCtx.measureText(code).width) + (live ? 20 : 12));
  const h = PILL_HEIGHT;
  const pad = 4;
  return sprite(key, w + pad * 2, h + pad * 2, (ctx) => {
    const left = pad;
    const top = pad;
    const cy = top + h / 2;
    if (gps) {
      ctx.beginPath();
      roundRect(ctx, left - 2.5, top - 2.5, w + 5, h + 5, h / 2 + 2.5);
      ctx.lineWidth = 2;
      ctx.strokeStyle = gpsRing(stale);
      ctx.stroke();
    }
    ctx.beginPath();
    roundRect(ctx, left, top, w, h, h / 2);
    ctx.fillStyle = color;
    ctx.fill();
    if (gps && stale) {
      ctx.fillStyle = STALE_VEIL;
      ctx.fill();
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    if (!gps) ctx.setLineDash(ESTIMATE_DASH);
    ctx.stroke();
    ctx.setLineDash([]);
    let textX = left + w / 2;
    if (live) {
      // Punto "en vivo" al inicio del letrero.
      ctx.beginPath();
      ctx.arc(left + 8, cy, 3, 0, TAU);
      ctx.fillStyle = VEHICLE_STYLE.gps.ring;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      textX += 4;
    }
    ctx.fillStyle = gps && stale ? '#000000' : textColorOn(color);
    ctx.font = PILL_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, textX, cy + 0.5);
  });
}

function spriteFor(item: DrawItem, lod: 'icon' | 'pill'): Sprite {
  const { vehicle } = item;
  if (lod === 'pill' && item.emphasis !== 'dimmed') return pill(vehicle.kind, vehicle.color, vehicle.stale, vehicle.code);
  const bucket = bearingBucket(vehicle.bearing);
  return vehicle.kind === 'gps' ? gpsIcon(vehicle.color, vehicle.stale, bucket) : estimateIcon(vehicle.color, bucket);
}

/**
 * Lejos: puntos de 2,5 px las estimadas y cuadrados de 5 px las con GPS, en
 * lotes por color. Van sobre su propia línea, del mismo color: el contorno
 * (blanco las estimadas, verde o ámbar las con GPS) es lo que las separa de ella.
 */
function drawDots(ctx: CanvasRenderingContext2D, items: readonly DrawItem[]): void {
  ctx.lineWidth = 1;
  let i = 0;
  while (i < items.length) {
    const first = items[i];
    const alpha = vehicleAlpha(first);
    const { kind, color, stale } = first.vehicle;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.strokeStyle = kind === 'gps' ? gpsRing(stale) : VEHICLE_STYLE.estimate.ring;
    ctx.beginPath();
    for (; i < items.length; i++) {
      const item = items[i];
      const v = item.vehicle;
      if (v.kind !== kind || v.color !== color || v.stale !== stale || vehicleAlpha(item) !== alpha) break;
      if (kind === 'gps') {
        ctx.rect(item.x - 2.5, item.y - 2.5, 5, 5);
      } else {
        ctx.moveTo(item.x + 2.5, item.y);
        ctx.arc(item.x, item.y, 2.5, 0, TAU);
      }
    }
    ctx.fill();
    ctx.stroke();
  }
}

/**
 * Pinta los ítems ya recortados, proyectados y ordenados con sortForDraw. Las
 * atenuadas nunca llevan letrero: se dibujan como forma mediana.
 */
export function drawVehicleItems(ctx: CanvasRenderingContext2D, items: readonly DrawItem[], lod: VehicleLod): void {
  ctx.save();
  const { dots, sprites: shapes } = splitForLod(items, lod);
  if (dots.length > 0) drawDots(ctx, dots);
  if (shapes.length > 0) drawSprites(ctx, shapes, lod === 'pill' ? 'pill' : 'icon');
  ctx.restore();
}

function drawSprites(ctx: CanvasRenderingContext2D, items: readonly DrawItem[], lod: 'icon' | 'pill'): void {
  let alpha = -1;
  for (const item of items) {
    const a = spriteAlpha(item, lod);
    if (a !== alpha) ctx.globalAlpha = alpha = a;
    const s = spriteFor(item, lod);
    ctx.drawImage(s.image, Math.round(item.x - s.ax), Math.round(item.y - s.ay), s.w, s.h);
  }
}
