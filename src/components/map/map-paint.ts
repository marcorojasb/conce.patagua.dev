// Pintado compartido del mapa: micros, paradas y muestras de línea. Lo usan el
// canvas de micros (vehicle-draw.ts arma sus sprites con estas funciones), la
// red de recorridos (estilo de las paradas) y las muestras de la leyenda y de
// "Micros en el mapa" (map-swatches.tsx): la leyenda dibuja con el mismo
// código que el mapa.
//
// Micros: la forma dice el tipo y el relleno, la línea (la "tinta": el color
// de la línea; en oscuro, un paso más claro que en claro; siempre con aro y
// flecha blancos).
//   - estimada según el programa: la insignia de siempre (7d6cdbf), círculo plano
//     con aro blanco sólido y flecha blanca;
//   - GPS al día: cuadrado redondeado con aro blanco sólido, anillo verde
//     separado por una ranura y sombra;
//   - GPS viejo (> 2 min): el mismo cuadrado desteñido hacia el mapa (opaco),
//     flecha hueca y anillo ámbar cortado.
// Lejos (nivel `dot`): punto redondo, cuadrado verde lleno o cuadrado hueco
// ámbar. Cada par se distingue también sin color: redondo y plano frente a
// cuadrado con anillo separado y sombra, anillo entero frente a cortado,
// flecha llena frente a hueca, lleno frente a hueco. (Un aro punteado en la
// estimada se leía como engranaje y no hacía falta: la forma ya la separa.)

import { routeStyleFor, stopStyleForZoom } from '@/components/map/route-network-diff';
import { MAP_THEME } from '@/lib/map-theme';
import { mixHex } from '@/lib/route-colors';
import type { Theme } from '@/types/transport';

export type VehicleSymbolKind = 'estimate' | 'gps';

const TAU = Math.PI * 2;
const WHITE = '#ffffff';
/** El rumbo se redondea a 16 direcciones (22,5°). */
export const BEARING_STEPS = 16;
/** Contorno oscuro tenue: despega la insignia de su propia línea (del mismo color). */
export const BADGE_CONTOUR = 'rgba(15, 23, 42, 0.45)';
/** Sombra de las insignias con GPS (las estimadas son planas). */
export const GPS_SHADOW = { color: 'rgba(0, 0, 0, 0.35)', blur: 4, offsetY: 1 } as const;
/** Lengüeta con el código del sentido (zoom ≥ 15). */
export const VEHICLE_TAB_FONT = '500 11px "JetBrains Mono", ui-monospace, monospace';
export const VEHICLE_TAB_HEIGHT = 18;
/** Esquina de la insignia GPS, como fracción del lado. */
const GPS_CORNER = 0.28;
// Cuánto se sale la sombra del cuadrado (desenfoque 4 + desplazamiento 1, con holgura).
const SHADOW_MARGIN = 7;

/** Diámetro de la insignia según el zoom (13, 14 y 15 o más; la del original medía 26). */
export function vehicleDiameterForZoom(zoom: number): 20 | 22 | 26 {
  if (zoom >= 15) return 26;
  return zoom >= 14 ? 22 : 20;
}

/** Ancho del aro blanco: 2 a Ø18–20, 2,5 a Ø22 y 3 a Ø26; más fino en las muestras chicas. */
export function vehicleRingWidth(diameter: number): number {
  if (diameter >= 26) return 3;
  if (diameter >= 22) return 2.5;
  if (diameter >= 18) return 2;
  return Math.max(1.25, diameter / 9);
}

/** Anillo exterior del GPS: 2,5 px a 1,5 px del borde (proporcional bajo Ø18, en muestras chicas). */
export function gpsRingGeometry(diameter: number): { gap: number; width: number } {
  const k = Math.min(1, diameter / 18);
  return { gap: 1.5 * k, width: 2.5 * k };
}

/** Radio de lo que ocupa la insignia (sin la sombra): contorno en la estimada, anillo en el GPS. */
export function vehicleSymbolRadius(kind: VehicleSymbolKind, diameter: number): number {
  if (kind === 'estimate') return diameter / 2 + 1;
  const { gap, width } = gpsRingGeometry(diameter);
  return diameter / 2 + gap + width;
}

/** Medio lado del sprite de una insignia: ajustado en la estimada, con lugar para la sombra en el GPS. */
export function vehicleSpriteHalf(kind: VehicleSymbolKind, diameter: number): number {
  return Math.ceil(kind === 'estimate' ? vehicleSymbolRadius(kind, diameter) : diameter / 2 + SHADOW_MARGIN);
}

/** Corte del anillo ámbar del GPS viejo: trazos de ~1,6× el ancho del anillo con huecos de ~1× (4 y 2,5 px a Ø18). */
export function staleRingDash(diameter: number): [dash: number, gap: number] {
  const { width } = gpsRingGeometry(diameter);
  return [1.6 * width, width];
}

/** Relleno del GPS viejo: la tinta desteñida hacia la tierra del mapa, opaca (nada de α, que en oscuro la oscurecía). */
export function gpsStaleFill(ink: string, theme: Theme): string {
  return mixHex(ink, MAP_THEME[theme].land, 0.5);
}

// Flecha de rumbo del marcador original (`M12 3 19 21 12 17 5 21 12 3Z`, caja
// de 24), relativa al centro de la caja.
const ARROW: ReadonlyArray<readonly [number, number]> = [
  [0, -9],
  [7, 9],
  [0, 5],
  [-7, 9],
];

/** Vértices de la flecha: caja de 0,58·D centrada, girada `bucket`·22,5° (0 = norte, horario). */
export function vehicleArrowPoints(cx: number, cy: number, diameter: number, bucket: number): Array<[number, number]> {
  const scale = (0.58 * diameter) / 24;
  const angle = (bucket * TAU) / BEARING_STEPS;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return ARROW.map(([x, y]) => [cx + (x * cos - y * sin) * scale, cy + (x * sin + y * cos) * scale]);
}

// roundRect llegó tarde a algunos navegadores (Safari < 16): sin él, esquinas rectas.
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]): void {
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/** Píxeles de dispositivo por px CSS del contexto (sprites al doble en retina, muestras con devicePixelRatio). */
function contextScale(ctx: CanvasRenderingContext2D): number {
  if (typeof ctx.getTransform !== 'function') return 1;
  const t = ctx.getTransform();
  return Math.round(Math.hypot(t.a, t.b) * 100) / 100 || 1;
}

interface Seal {
  image: HTMLCanvasElement;
  half: number;
}

const seals = new Map<string, Seal>();

/**
 * Sombra del cuadrado GPS hecha una vez por diámetro y escala, y después solo
 * copiada: un shadowBlur por sprite (o peor, por cuadro) cuesta caro sin GPU.
 * El cuadrado se pinta fuera del lienzo y solo su sombra cae dentro.
 */
function shadowSeal(ctx: CanvasRenderingContext2D, diameter: number): Seal | null {
  const scale = contextScale(ctx);
  const key = `${diameter}|${scale}`;
  const cached = seals.get(key);
  if (cached) return cached;
  if (typeof document === 'undefined') return null;
  const half = Math.ceil(diameter / 2 + SHADOW_MARGIN);
  const image = document.createElement('canvas');
  image.width = Math.ceil(2 * half * scale);
  image.height = image.width;
  const sctx = image.getContext('2d');
  if (!sctx) return null;
  const away = 4 * half;
  sctx.scale(scale, scale);
  // El desenfoque y el desplazamiento de la sombra no siguen la transformación: van en px del lienzo.
  sctx.shadowColor = GPS_SHADOW.color;
  sctx.shadowBlur = GPS_SHADOW.blur * scale;
  sctx.shadowOffsetX = away * scale;
  sctx.shadowOffsetY = GPS_SHADOW.offsetY * scale;
  sctx.fillStyle = '#000000';
  sctx.beginPath();
  roundRect(sctx, half - diameter / 2 - away, half - diameter / 2, diameter, diameter, GPS_CORNER * diameter);
  sctx.fill();
  const seal = { image, half };
  seals.set(key, seal);
  return seal;
}

export interface VehicleSymbolOptions {
  kind: VehicleSymbolKind;
  /** Solo GPS: dato de hace más de 2 min. */
  stale: boolean;
  /** Tinta: inkRouteColor(color de la línea, tema). */
  ink: string;
  diameter: number;
  /** Rumbo en 16 direcciones; null sin rumbo (punto al centro). */
  bucket: number | null;
  theme: Theme;
  /** Con lengüeta: el código del sentido. */
  code?: string;
}

function paintEstimateBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, d: number, ink: string): void {
  const r = d / 2;
  const w = vehicleRingWidth(d);
  ctx.beginPath();
  ctx.arc(cx, cy, r + 0.5, 0, TAU);
  ctx.lineWidth = 1;
  ctx.strokeStyle = BADGE_CONTOUR;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r - w / 2, 0, TAU);
  ctx.lineWidth = w;
  ctx.strokeStyle = WHITE;
  ctx.stroke();
}

function paintGpsBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  d: number,
  ink: string,
  stale: boolean,
  theme: Theme,
): void {
  const c = MAP_THEME[theme];
  const half = d / 2;
  const corner = GPS_CORNER * d;
  const w = vehicleRingWidth(d);
  const ring = gpsRingGeometry(d);
  const seal = shadowSeal(ctx, d);
  if (seal) ctx.drawImage(seal.image, cx - seal.half, cy - seal.half, 2 * seal.half, 2 * seal.half);
  // Anillo exterior (verde sólido al día, ámbar cortado el viejo), separado
  // del cuadrado por una ranura donde se ve el mapa. El corte es la señal de
  // forma del dato viejo: en gris, verde y ámbar tienen casi la misma luminancia.
  const outer = half + ring.gap + ring.width / 2;
  ctx.beginPath();
  roundRect(ctx, cx - outer, cy - outer, 2 * outer, 2 * outer, corner + ring.gap + ring.width / 2);
  ctx.lineWidth = ring.width;
  ctx.strokeStyle = stale ? c.stale : c.live;
  if (stale) ctx.setLineDash(staleRingDash(d));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  roundRect(ctx, cx - half - 0.5, cy - half - 0.5, d + 1, d + 1, corner + 0.5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = BADGE_CONTOUR;
  ctx.stroke();
  ctx.beginPath();
  roundRect(ctx, cx - half, cy - half, d, d, corner);
  ctx.fillStyle = stale ? gpsStaleFill(ink, theme) : ink;
  ctx.fill();
  const inner = half - w / 2;
  const alpha = ctx.globalAlpha;
  ctx.beginPath();
  roundRect(ctx, cx - inner, cy - inner, 2 * inner, 2 * inner, Math.max(0, corner - w / 2));
  ctx.lineWidth = w;
  ctx.strokeStyle = WHITE;
  if (stale) ctx.globalAlpha = alpha * 0.7;
  ctx.stroke();
  ctx.globalAlpha = alpha;
}

/**
 * Flecha blanca de rumbo (hueca con el dato viejo); sin rumbo, un punto (en
 * el viejo, un aro hueco más grande: un punto hueco de 2 px no se veía).
 */
function paintHeading(ctx: CanvasRenderingContext2D, cx: number, cy: number, d: number, bucket: number | null, hollow: boolean): void {
  ctx.beginPath();
  if (bucket == null) {
    ctx.arc(cx, cy, (hollow ? 0.2 : 0.12) * d, 0, TAU);
  } else {
    const points = vehicleArrowPoints(cx, cy, d, bucket);
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
  }
  if (hollow) {
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = WHITE;
    ctx.stroke();
  } else {
    ctx.fillStyle = WHITE;
    ctx.fill();
  }
}

/** Insignia de una micro centrada en (cx, cy), con su lengüeta si trae `code`. */
export function paintVehicleSymbol(ctx: CanvasRenderingContext2D, cx: number, cy: number, o: VehicleSymbolOptions): void {
  const stale = o.kind === 'gps' && o.stale;
  ctx.save();
  if (o.code != null) {
    paintVehicleTab(ctx, cx + o.diameter / 2, cy, { code: o.code, theme: o.theme, stale, live: o.kind === 'gps' && !stale });
  }
  if (o.kind === 'estimate') paintEstimateBadge(ctx, cx, cy, o.diameter, o.ink);
  else paintGpsBadge(ctx, cx, cy, o.diameter, o.ink, stale, o.theme);
  paintHeading(ctx, cx, cy, o.diameter, o.bucket, stale);
  ctx.restore();
}

export interface VehicleTabLayout {
  /** Desde el borde derecho de la insignia: la lengüeta arranca 3 px por debajo de ella. */
  start: number;
  width: number;
  textX: number;
  /** Centro del punto "en vivo" (solo GPS al día). */
  dotX: number;
}

/** Medidas de la lengüeta, relativas al borde derecho de la insignia. */
export function vehicleTabLayout(textWidth: number, live: boolean): VehicleTabLayout {
  const start = -3;
  const textX = live ? 16 : 7;
  return { start, textX, dotX: 9, width: textX - start + Math.ceil(textWidth) + 6 };
}

export interface VehicleTabOptions {
  code: string;
  theme: Theme;
  /** GPS viejo: texto apagado. */
  stale: boolean;
  /** GPS al día: punto en vivo. */
  live: boolean;
}

/**
 * Lengüeta con el código del sentido, desde `left` (el borde derecho de la
 * insignia) hacia la derecha. Se pinta antes que la insignia, que la tapa en parte.
 */
export function paintVehicleTab(ctx: CanvasRenderingContext2D, left: number, cy: number, o: VehicleTabOptions): VehicleTabLayout {
  const c = MAP_THEME[o.theme];
  ctx.save();
  ctx.font = VEHICLE_TAB_FONT;
  const layout = vehicleTabLayout(ctx.measureText(o.code).width, o.live);
  const top = cy - VEHICLE_TAB_HEIGHT / 2;
  ctx.beginPath();
  roundRect(ctx, left + layout.start + 0.5, top + 0.5, layout.width - 1, VEHICLE_TAB_HEIGHT - 1, [0, 5, 5, 0]);
  ctx.fillStyle = c.surface;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = c.tabBorder;
  ctx.stroke();
  if (o.live) {
    ctx.beginPath();
    ctx.arc(left + layout.dotX, cy, 3, 0, TAU);
    ctx.fillStyle = c.live;
    ctx.fill();
  }
  ctx.fillStyle = o.stale ? c.muted : c.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(o.code, left + layout.textX, cy + 0.5);
  ctx.restore();
  return layout;
}

export interface VehicleDotOptions {
  kind: VehicleSymbolKind;
  stale: boolean;
  ink: string;
  theme: Theme;
}

export interface VehicleDotStyle {
  shape: 'circle' | 'square';
  fill: string;
  stroke: string;
  lineWidth: number;
}

/** Nivel `dot` (zoom ≤ 12): punto con la tinta, cuadrado verde lleno o cuadrado hueco ámbar. */
export function vehicleDotStyle(o: VehicleDotOptions): VehicleDotStyle {
  const c = MAP_THEME[o.theme];
  if (o.kind === 'estimate') return { shape: 'circle', fill: o.ink, stroke: WHITE, lineWidth: 1.5 };
  if (o.stale) return { shape: 'square', fill: c.stopFill, stroke: c.stale, lineWidth: 2 };
  return { shape: 'square', fill: c.live, stroke: c.stopFill, lineWidth: 1.5 };
}

/** Agrega al trazado actual un punto de micro (para pintar muchos en un lote). */
export function traceVehicleDot(ctx: CanvasRenderingContext2D, shape: VehicleDotStyle['shape'], x: number, y: number): void {
  if (shape === 'circle') {
    ctx.moveTo(x + 3, y);
    ctx.arc(x, y, 3, 0, TAU);
  } else {
    ctx.rect(x - 3.5, y - 3.5, 7, 7);
  }
}

export function paintVehicleDot(ctx: CanvasRenderingContext2D, cx: number, cy: number, o: VehicleDotOptions): void {
  const style = vehicleDotStyle(o);
  ctx.save();
  ctx.beginPath();
  traceVehicleDot(ctx, style.shape, cx, cy);
  ctx.fillStyle = style.fill;
  ctx.fill();
  ctx.lineWidth = style.lineWidth;
  ctx.strokeStyle = style.stroke;
  ctx.stroke();
  ctx.restore();
}

/** Opciones de L.CircleMarker de una parada; paintStopSymbol pinta lo mismo. */
export interface StopMarkerStyle {
  radius: number;
  weight: number;
  color: string;
  fillColor: string;
  fillOpacity: number;
  opacity: number;
}

/**
 * Parada de la red: relleno del tema y aro del color de pantalla de la línea
 * que se pinta encima (o gris neutro sin línea); la estación del Biotrén con
 * aro grueso. Atenuada al 0,25 cuando hay otro recorrido en foco.
 */
export function stopMarkerStyle(o: {
  lineColor: string | null;
  theme: Theme;
  zoom: number;
  station?: boolean;
  dim?: boolean;
}): StopMarkerStyle {
  const c = MAP_THEME[o.theme];
  const { radius, weight } = stopStyleForZoom(o.zoom, o.station);
  const opacity = o.dim ? routeStyleFor({ focus: false, dim: true }, o.theme).stopOpacity : 1;
  return { radius, weight, color: o.lineColor ?? c.neutralStop, fillColor: c.stopFill, fillOpacity: opacity, opacity };
}

/** Paradero GTFS (capa Paraderos): punto gris chico; el elegido, oscuro con aro del fondo. */
export function paraderoMarkerStyle(o: { selected: boolean; dim: boolean; theme: Theme }): StopMarkerStyle {
  const c = MAP_THEME[o.theme];
  if (o.selected) return { radius: 6, weight: 3, color: c.stopFill, fillColor: c.selection, fillOpacity: 1, opacity: 1 };
  return { radius: 3, weight: 1, color: c.neutralStop, fillColor: c.stopFill, fillOpacity: 0.86, opacity: o.dim ? 0.55 : 0.9 };
}

/** Pinta un punto como lo hace L.CircleMarker en el canvas de Leaflet (relleno, luego aro). */
export function paintCircleMarker(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: Pick<StopMarkerStyle, 'radius' | 'weight' | 'color' | 'fillColor' | 'fillOpacity'> & { opacity?: number },
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, s.radius, 0, TAU);
  ctx.globalAlpha = s.fillOpacity;
  ctx.fillStyle = s.fillColor;
  ctx.fill();
  ctx.globalAlpha = s.opacity ?? 1;
  ctx.lineWidth = s.weight;
  ctx.strokeStyle = s.color;
  ctx.stroke();
  ctx.restore();
}

/**
 * Parada de la red (o estación del Biotrén) con el aro de `lineColor`; el
 * paradero elegido; o, con `layer`, el punto gris de la capa Paraderos.
 */
export function paintStopSymbol(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  o: { lineColor: string; theme: Theme; zoom: number; station?: boolean; selected?: boolean; layer?: boolean },
): void {
  const s =
    o.selected || o.layer
      ? paraderoMarkerStyle({ selected: o.selected === true, dim: false, theme: o.theme })
      : stopMarkerStyle({ lineColor: o.lineColor, theme: o.theme, zoom: o.zoom, station: o.station });
  paintCircleMarker(ctx, cx, cy, s);
}

/**
 * Tramo de línea como el trazado del mapa: borde del tema y línea encima, con
 * los anchos y opacidades de routeStyleFor. Sin borde (`casing: false`) es una
 * línea sola, opaca salvo que se pida otra cosa (ciclovías).
 */
export function paintLineSample(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  y: number,
  o: { lineColor: string; theme: Theme; focus?: boolean; dash?: string; casing?: boolean; weight?: number; opacity?: number },
): void {
  const style = routeStyleFor({ focus: o.focus === true, dim: false }, o.theme);
  const casing = o.casing !== false;
  ctx.save();
  ctx.lineCap = 'round';
  if (casing) {
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.globalAlpha = style.casing.opacity;
    ctx.lineWidth = style.casing.weight;
    ctx.strokeStyle = MAP_THEME[o.theme].casing;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.globalAlpha = o.opacity ?? (casing ? style.line.opacity : 1);
  ctx.lineWidth = o.weight ?? style.line.weight;
  ctx.strokeStyle = o.lineColor;
  if (o.dash) ctx.setLineDash(o.dash.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0));
  ctx.stroke();
  ctx.restore();
}
