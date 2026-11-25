// Dibujo de las micros en el canvas propio (vehicle-canvas-layer.ts). Las
// estimadas y las con GPS nunca se parecen, a ningún zoom: las formas las
// pinta map-paint.ts (insignia redonda y plana, cuadrada con anillo verde,
// cuadrada desteñida con anillo ámbar), el mismo código que usa la leyenda.
// Las funciones de selección (recorte, orden, nivel de detalle) son puras y
// tienen pruebas; las de dibujo agrupan para pintar miles de micros con pocas
// llamadas al canvas.

import {
  BEARING_STEPS,
  paintVehicleSymbol,
  paintVehicleTab,
  traceVehicleDot,
  vehicleDotStyle,
  type VehicleDotStyle,
  vehicleDiameterForZoom,
  vehicleSpriteHalf,
  vehicleSymbolRadius,
  vehicleTabLayout,
  VEHICLE_TAB_FONT,
  VEHICLE_TAB_HEIGHT,
} from '@/components/map/map-paint';
import type { HitShape, VehicleHitGrid } from '@/components/map/vehicle-hit-grid';
import { inkRouteColor } from '@/lib/route-colors';
import { VEHICLE_STYLE, type DirectionId, type MapFocus, type MapVehicle } from '@/types/ui-contracts';
import type { Theme } from '@/types/transport';

/**
 * dot: puntos (zoom ≤ 12), salvo las micros del recorrido o paradero elegido,
 * que van como insignia de Ø20: son pocas y son las que se buscan (como
 * puntos se confundían con las paradas de su propia línea, justo al abrir un
 * recorrido largo, que se encuadra a zoom 11). icon: insignia con rumbo
 * (13–14). pill: insignia con lengüeta del código (≥ 15).
 *
 * `dense` (estimadas de toda la red, ~3.000): puntos también a zoom 13. Ahí
 * miles de insignias de Ø20 eran una alfombra que tapaba líneas y calles.
 */
export type VehicleLod = 'dot' | 'icon' | 'pill';

export function lodForZoom(zoom: number, dense = false): VehicleLod {
  if (zoom <= (dense ? 13 : 12)) return 'dot';
  return zoom <= 14 ? 'icon' : 'pill';
}

/**
 * Qué se pinta como punto y qué como sprite (insignia, con o sin lengüeta) en
 * un nivel de detalle. Lejos, las del foco van como insignia; las atenuadas
 * nunca llevan lengüeta.
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
 * y arriba las del foco. Dentro de cada grupo, por color, para pintar en lotes
 * (los puntos lejanos de las estimadas van por tinta).
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
// Las insignias, las lengüetas y los puntos lejanos se pintan una vez en un
// sprite (canvas chico en caché) y después solo se copian con drawImage: en
// un navegador sin GPU, rasterizar 2.000 aros costaba ~30 ms por dibujo;
// copiar sprites, ~5 ms. Claves: `e|tinta|rumbo|D` (estimada),
// `g|tema|tinta|viejo|rumbo|D` (GPS), `l|tema|viejo|en vivo|código`
// (lengüeta) y `d|forma|relleno|borde|ancho` (punto); con ~26 tintas, 17
// rumbos y 3 tamaños quedan bajo MAX_SPRITES. Insignia y lengüeta van en
// sprites aparte a propósito: juntas serían uno por código y rumbo, y crearlos
// al hacer zoom costaba más que la segunda copia (medido con bench:map a 4x).

export const MAX_SPRITES = 4000;
/** Lejos, las del foco van como insignia del tamaño de zoom 13. */
const FOCUS_DOT_DIAMETER = vehicleDiameterForZoom(13);

/** Rumbo en grados → una de 16 direcciones; null sin rumbo. */
export function bearingBucket(bearing: number | null): number | null {
  if (bearing == null || !Number.isFinite(bearing)) return null;
  const deg = ((bearing % 360) + 360) % 360;
  return Math.round(deg / (360 / BEARING_STEPS)) % BEARING_STEPS;
}

/**
 * Clave del sprite de la insignia. La tinta ya trae el tema (inkRouteColor);
 * el GPS además lleva el tema por los anillos y la mezcla del viejo.
 */
export function badgeSpriteKey(
  kind: MapVehicle['kind'],
  ink: string,
  stale: boolean,
  bucket: number | null,
  diameter: number,
  theme: Theme,
): string {
  return kind === 'estimate' ? `e|${ink}|${bucket}|${diameter}` : `g|${theme}|${ink}|${stale}|${bucket}|${diameter}`;
}

/** Clave del sprite de la lengüeta (no depende de la línea: fondo del tema y texto). */
export function tabSpriteKey(theme: Theme, stale: boolean, live: boolean, code: string): string {
  return `l|${theme}|${stale}|${live}|${code}`;
}

interface Sprite {
  image: HTMLCanvasElement;
  /** Tamaño en px CSS y punto de anclaje (el centro de la micro; en la lengüeta, el borde de la insignia). */
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

/** Borra los sprites (al cargar JetBrains Mono, para rehacer las lengüetas con ella). */
export function clearSprites(): void {
  sprites.clear();
}

function sprite(key: string, w: number, h: number, ax: number, ay: number, paint: (ctx: CanvasRenderingContext2D) => void): Sprite {
  let cached = sprites.get(key);
  if (cached) return cached;
  if (sprites.size >= MAX_SPRITES) sprites.clear();
  const image = document.createElement('canvas');
  image.width = Math.ceil(w * spriteScale);
  image.height = Math.ceil(h * spriteScale);
  const ctx = image.getContext('2d')!;
  ctx.scale(spriteScale, spriteScale);
  paint(ctx);
  cached = { image, w, h, ax, ay };
  sprites.set(key, cached);
  return cached;
}

// Tinta de cada color de línea y tema: el mapa de route-colors arma una clave
// por llamada; aquí se pregunta miles de veces por dibujo.
const inks: Record<Theme, Map<string, string>> = { light: new Map(), dark: new Map() };

function inkOf(color: string, theme: Theme): string {
  const byColor = inks[theme];
  let ink = byColor.get(color);
  if (ink === undefined) byColor.set(color, (ink = inkRouteColor(color, theme)));
  return ink;
}

let measureCtx: CanvasRenderingContext2D | null = null;

function badgeSprite(item: DrawItem, diameter: number, theme: Theme): Sprite {
  const { kind, color, stale, bearing } = item.vehicle;
  const ink = inkOf(color, theme);
  const bucket = bearingBucket(bearing);
  const half = vehicleSpriteHalf(kind, diameter);
  return sprite(badgeSpriteKey(kind, ink, stale, bucket, diameter, theme), 2 * half, 2 * half, half, half, (ctx) =>
    paintVehicleSymbol(ctx, half, half, { kind, stale, ink, diameter, bucket, theme }),
  );
}

/** Lengüeta: anclada en el borde derecho de la insignia (la estimada no lleva punto en vivo). */
function tabSprite(vehicle: MapVehicle, theme: Theme): Sprite {
  const gps = vehicle.kind === 'gps';
  const stale = gps && vehicle.stale;
  const live = gps && !vehicle.stale;
  const key = tabSpriteKey(theme, stale, live, vehicle.code);
  const cached = sprites.get(key);
  if (cached) return cached;
  measureCtx ??= document.createElement('canvas').getContext('2d')!;
  measureCtx.font = VEHICLE_TAB_FONT;
  const layout = vehicleTabLayout(measureCtx.measureText(vehicle.code).width, live);
  const pad = 1;
  const ax = pad - layout.start;
  const ay = pad + VEHICLE_TAB_HEIGHT / 2;
  return sprite(key, layout.width + 2 * pad, VEHICLE_TAB_HEIGHT + 2 * pad, ax, ay, (ctx) =>
    paintVehicleTab(ctx, ax, ay, { code: vehicle.code, theme, stale, live }),
  );
}

function vehicleAlpha(item: Pick<DrawItem, 'emphasis'>): number {
  return item.emphasis === 'dimmed' ? VEHICLE_STYLE.dimmedAlpha : 1;
}

/** Medio lado del sprite de un punto lejano: radio 3 (cuadrado 3,5) más el trazo y el suavizado. */
const DOT_SPRITE_HALF = 5;

/** Punto lejano como sprite: copiar miles de sprites chicos rasteriza menos que trazar miles de arcos con borde. */
function dotSprite(style: VehicleDotStyle): Sprite {
  const half = DOT_SPRITE_HALF;
  return sprite(`d|${style.shape}|${style.fill}|${style.stroke}|${style.lineWidth}`, 2 * half, 2 * half, half, half, (ctx) => {
    ctx.beginPath();
    traceVehicleDot(ctx, style.shape, half, half);
    ctx.fillStyle = style.fill;
    ctx.fill();
    ctx.lineWidth = style.lineWidth;
    ctx.strokeStyle = style.stroke;
    ctx.stroke();
  });
}

/**
 * Lejos: punto con la tinta (estimada), cuadrado verde lleno (GPS) o cuadrado
 * hueco ámbar (GPS viejo), copiados desde un sprite por estilo. Con miles de
 * puntos, trazarlos como arcos con borde llevaba el commit de cada redibujo
 * (uno por segundo con las estimadas) a ~70 ms a 4x; los sprites lo bajan.
 */
function drawDots(ctx: CanvasRenderingContext2D, items: readonly DrawItem[], theme: Theme, hits: VehicleHitGrid<MapVehicle>): void {
  let alpha = -1;
  let s: Sprite | null = null;
  let last: MapVehicle | null = null;
  for (const item of items) {
    const a = vehicleAlpha(item);
    if (a !== alpha) ctx.globalAlpha = alpha = a;
    const v = item.vehicle;
    // Vienen ordenadas por color (sortForDraw): el sprite cambia pocas veces.
    if (!s || !last || v.kind !== last.kind || v.stale !== last.stale || (v.kind === 'estimate' && v.color !== last.color)) {
      const ink = v.kind === 'estimate' ? inkOf(v.color, theme) : '';
      s = dotSprite(vehicleDotStyle({ kind: v.kind, stale: v.stale, ink, theme }));
    }
    last = v;
    ctx.drawImage(s.image, Math.round(item.x) - s.ax, Math.round(item.y) - s.ay, s.w, s.h);
    // El punto (Ø7) queda dentro del radio de toque: sin forma propia.
    hits.insert(item.x, item.y, v);
  }
}

export interface VehicleDrawOptions {
  lod: VehicleLod;
  /** Diámetro de las insignias a este zoom (vehicleDiameterForZoom). */
  diameter: number;
  theme: Theme;
}

/**
 * Pinta los ítems ya recortados, proyectados y ordenados con sortForDraw. Las
 * atenuadas nunca llevan lengüeta; lejos, las del foco van como insignia Ø20.
 * Cada micro queda en `hits` (vaciada antes por quien llama) en el orden en
 * que se pinta, con lo que ocupa lo dibujado: así el toque sigue al dibujo.
 */
export function drawVehicleItems(
  ctx: CanvasRenderingContext2D,
  items: readonly DrawItem[],
  o: VehicleDrawOptions,
  hits: VehicleHitGrid<MapVehicle>,
): void {
  ctx.save();
  const { dots, sprites: badges } = splitForLod(items, o.lod);
  if (dots.length > 0) drawDots(ctx, dots, o.theme, hits);
  if (badges.length > 0) {
    drawBadges(ctx, badges, o.lod === 'dot' ? FOCUS_DOT_DIAMETER : o.diameter, o.lod === 'pill', o.theme, hits);
  }
  ctx.restore();
}

function drawBadges(
  ctx: CanvasRenderingContext2D,
  items: readonly DrawItem[],
  diameter: number,
  tabs: boolean,
  theme: Theme,
  hits: VehicleHitGrid<MapVehicle>,
): void {
  // Para el toque: la estimada es un círculo con su contorno; la GPS, el
  // cuadrado que encierra su anillo (en diagonal, ~19 px a Ø26).
  const shapes: Record<MapVehicle['kind'], HitShape> = {
    estimate: { kind: 'circle', radius: vehicleSymbolRadius('estimate', diameter) },
    gps: { kind: 'square', radius: vehicleSymbolRadius('gps', diameter) },
  };
  let alpha = -1;
  for (const item of items) {
    const a = vehicleAlpha(item);
    if (a !== alpha) ctx.globalAlpha = alpha = a;
    let tabEnd = 0;
    if (tabs && item.emphasis !== 'dimmed') {
      const tab = tabSprite(item.vehicle, theme);
      ctx.drawImage(tab.image, Math.round(item.x + diameter / 2 - tab.ax), Math.round(item.y - tab.ay), tab.w, tab.h);
      // Donde termina, desde el centro, el sprite recién copiado (sin su
      // borde transparente de 1 px).
      tabEnd = diameter / 2 - tab.ax + tab.w - 1;
    }
    const s = badgeSprite(item, diameter, theme);
    ctx.drawImage(s.image, Math.round(item.x - s.ax), Math.round(item.y - s.ay), s.w, s.h);
    hits.insert(item.x, item.y, item.vehicle, shapes[item.vehicle.kind], tabEnd);
  }
}
