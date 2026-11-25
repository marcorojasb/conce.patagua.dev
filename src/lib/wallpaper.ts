// Generates a high-resolution PNG of the network composed for use as a phone
// or desktop wallpaper. We don't reuse the visor's live Leaflet map (the
// viewport is wrong, the chrome would leak in, and DOM-to-image of a tiled
// map is messy). Instead we render fresh: project the world to mercator at a
// zoom level that fits the requested bbox, fetch Esri Gray Canvas tiles
// directly, paint them onto an offscreen canvas, then stroke route polylines
// on top.
//
// Outcome: deterministic, retina-sharp, no UI leakage, no extra deps.
//
// Líneas y micros van con el color de pantalla del tema en que se dibuja el
// PNG (displayRouteColor, inkRouteColor), el mismo del mapa: el `route_color`
// oficial crudo no se lee sobre las teselas. Las micros son siempre estimadas
// según horario (el PNG no lleva GPS) y se pintan con la insignia del mapa
// (map-paint.ts: círculo con aro blanco y flecha), o con su punto en una
// imagen chica; la leyenda muestra la misma de las dos que se dibujó. Las
// ciclovías van con el color y el trazo de su capa. Lugares y Educación
// comparten colores a propósito (map-theme.ts): como en el mapa, los separa la
// forma (el lugar es un pin con aro y pictograma, el establecimiento un punto).

import { paintVehicleDot, paintVehicleSymbol } from '@/components/map/map-paint';
import { MAP_SAMPLE_INK, MAP_THEME, POI_COLOR, SCHOOL_COLOR } from '@/lib/map-theme';
import { displayRouteColor, inkRouteColor } from '@/lib/route-colors';
import type { PoiCategory } from '@/types/transport';

const TILE_SIZE = 256;
// Esri sirve tiles reales hasta z16; más allá devuelve un placeholder, así que
// nunca pedimos por encima de ese nivel y sobreescalamos lo que haga falta.
const TILE_MAX_NATIVE_ZOOM = 16;

export type WallpaperTheme = 'light' | 'dark';
export type WallpaperStyle = 'clean' | 'technical' | 'editorial' | 'night';
export type WallpaperRouteMode = 'visible' | 'all' | 'biotren' | 'interurban';

function tileUrl(theme: WallpaperTheme, z: number, x: number, y: number): string {
  const layer = theme === 'dark' ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base';
  return `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${layer}/MapServer/tile/${z}/${y}/${x}`;
}

export interface WallpaperRoute {
  path: Array<[number, number]>; // [lat, lng] vertices
  color: string;
  weight?: number;
  /** Punteado en px a escala 1 (ciclovías compartidas). */
  dash?: number[];
}

export interface WallpaperCoverageCell {
  lat: number;
  lng: number;
  bucket: 'excelente' | 'buena' | 'marginal' | 'pobre' | 'muy-pobre';
}

export interface WallpaperPoint {
  lat: number;
  lng: number;
}

export interface WallpaperStyledPoint extends WallpaperPoint {
  color: string;
  radius?: number;
}

/** Lugar de la capa Centros de atracción: el color y el pictograma salen de la categoría. */
export interface WallpaperPoi extends WallpaperPoint {
  category: PoiCategory;
}

export interface WallpaperPolygon {
  ring: Array<[number, number]>;
  fill: string;
  stroke?: string;
}

export interface WallpaperVehicle extends WallpaperPoint {
  color: string;
  bearing: number;
  routeId: string;
  label?: string;
  sourceKind?: string;
}

export interface WallpaperLegendItem {
  label: string;
  color: string;
  kind?: 'line' | 'dot' | 'square' | 'polygon' | 'vehicle' | 'poi';
}

export interface WallpaperMidpoint {
  path: Array<[number, number]>;
  midpoint: [number, number];
  origin?: WallpaperPoint;
  destination?: WallpaperPoint;
}

export interface WallpaperConfig {
  bbox: [[number, number], [number, number]]; // [[minLat, minLng], [maxLat, maxLng]]
  width: number;
  height: number;
  theme: WallpaperTheme;
  style?: WallpaperStyle;
  routes: WallpaperRoute[];
  cycleways?: WallpaperRoute[];
  greenspace?: WallpaperPolygon[];
  coverageCells?: WallpaperCoverageCell[];
  /** GTFS stops (paraderos) to dot on the map. */
  paraderos?: WallpaperPoint[];
  /** Bus terminals to mark with squares. */
  terminales?: WallpaperPoint[];
  pois?: WallpaperPoi[];
  schools?: WallpaperStyledPoint[];
  vehicles?: WallpaperVehicle[];
  legendItems?: WallpaperLegendItem[];
  showLegend?: boolean;
  showScale?: boolean;
  /** Walking midpoint result drawn as dashed line + A/M/B markers. */
  midpoint?: WallpaperMidpoint;
  title?: string;
  subtitle?: string;
}

export interface WallpaperRouteSource {
  id: string;
  type: 'micro' | 'biotren';
  network?: string;
  path: Array<[number, number]>;
  color: string;
}

export interface WallpaperFrameOptions {
  paddingPct: number;
  zoomDelta: number;
}

const COVERAGE_COLOR: Record<WallpaperCoverageCell['bucket'], string> = {
  excelente: 'rgba(34, 197, 94, 0.55)',
  buena: 'rgba(132, 204, 22, 0.5)',
  marginal: 'rgba(234, 179, 8, 0.45)',
  pobre: 'rgba(249, 115, 22, 0.45)',
  'muy-pobre': 'rgba(239, 68, 68, 0.45)',
};
const COVERAGE_HALF_STEP = 0.0015; // matches the coverage grid generator

// Insignia de micro: Ø18 en una imagen de 1280 px (el mapa la pinta de Ø20 a
// zoom 13). Más chica que 10 px no se lee y va el punto del mapa de lejos.
const VEHICLE_BADGE_DIAMETER = 18;
const VEHICLE_BADGE_MIN_PX = 10;
// Pin de lugar a escala de línea (como paraderos y establecimientos): con
// 14 px el pictograma (8 px) todavía se reconoce y no tapa la red.
const POI_PIN_DIAMETER = 14;

// Pictogramas de los pines de lugar: los trazados de POI_SVG en map-markers.tsx
// (íconos Lucide en una grilla de 24, trazo 2), repetidos porque ese módulo
// trae Leaflet; wallpaper.test.ts comprueba que sigan iguales.
const POI_GLYPH: Record<PoiCategory, string[]> = {
  hospital: [
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z',
    'M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27',
  ],
  university: ['M22 10v6M2 10l10-5 10 5-10 5z', 'M6 12v5c3 3 9 3 12 0v-5'],
  college: ['M22 10v6M2 10l10-5 10 5-10 5z', 'M6 12v5c3 3 9 3 12 0v-5'],
  mall: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
};

const STYLE_META: Record<
  WallpaperStyle,
  {
    label: string;
    overlay: string;
    vignette: number;
    titleScale: number;
    routeHaloAlpha: number;
    legend: boolean;
  }
> = {
  clean: {
    label: 'Limpio',
    overlay: 'rgba(255,255,255,0)',
    vignette: 0.18,
    titleScale: 1,
    routeHaloAlpha: 0.7,
    legend: false,
  },
  technical: {
    label: 'Técnico',
    overlay: 'rgba(255,255,255,0.04)',
    vignette: 0.12,
    titleScale: 0.9,
    routeHaloAlpha: 0.85,
    legend: true,
  },
  editorial: {
    label: 'Editorial',
    overlay: 'rgba(0,0,0,0.04)',
    vignette: 0.28,
    titleScale: 1.35,
    routeHaloAlpha: 0.9,
    legend: true,
  },
  night: {
    label: 'Nocturno',
    overlay: 'rgba(0,0,0,0.16)',
    vignette: 0.38,
    titleScale: 1.05,
    routeHaloAlpha: 0.95,
    legend: true,
  },
};

export const WALLPAPER_STYLES: Array<{ id: WallpaperStyle; label: string; description: string }> = [
  { id: 'clean', label: 'Limpio', description: 'Mapa sobrio, rutas y marca discreta.' },
  { id: 'technical', label: 'Técnico', description: 'Leyenda, escala y capas analíticas.' },
  { id: 'editorial', label: 'Editorial', description: 'Título más visible, composición tipo póster.' },
  { id: 'night', label: 'Nocturno', description: 'Alto contraste para pantallas OLED.' },
];

export function padBbox(
  bbox: WallpaperConfig['bbox'],
  { paddingPct, zoomDelta }: WallpaperFrameOptions,
): WallpaperConfig['bbox'] {
  const [[latMin, lngMin], [latMax, lngMax]] = bbox;
  const latSpan = Math.max(0.001, latMax - latMin);
  const lngSpan = Math.max(0.001, lngMax - lngMin);
  const zoomFactor = Math.pow(1.16, -zoomDelta);
  const pad = Math.max(0, paddingPct) / 100;
  const targetLatSpan = latSpan * (1 + pad * 2) * zoomFactor;
  const targetLngSpan = lngSpan * (1 + pad * 2) * zoomFactor;
  const centerLat = (latMin + latMax) / 2;
  const centerLng = (lngMin + lngMax) / 2;
  return [
    [centerLat - targetLatSpan / 2, centerLng - targetLngSpan / 2],
    [centerLat + targetLatSpan / 2, centerLng + targetLngSpan / 2],
  ];
}

export function selectWallpaperRoutes(
  routes: WallpaperRouteSource[],
  visibleRouteIds: string[],
  mode: WallpaperRouteMode,
): WallpaperRouteSource[] {
  const visible = new Set(visibleRouteIds);
  return routes.filter((route) => {
    if (mode === 'visible') return visible.has(route.id);
    if (mode === 'all') return true;
    if (mode === 'biotren') return route.type === 'biotren';
    return route.network?.startsWith('Interurbano') ?? false;
  });
}

/** Tema en que se pinta el PNG: el nocturno siempre en oscuro. */
export function wallpaperRenderTheme(theme: WallpaperTheme, style: WallpaperStyle = 'clean'): WallpaperTheme {
  return style === 'night' ? 'dark' : theme;
}

/** Leyenda automática de las capas activas, con los colores del tema en que se pinta (wallpaperRenderTheme). */
export function buildWallpaperLegend(
  input: {
    routesCount: number;
    vehiclesCount: number;
    paraderos: boolean;
    terminales: boolean;
    cobertura: boolean;
    cycleways: boolean;
    greenspace: boolean;
    schools: boolean;
    pois: boolean;
  },
  theme: WallpaperTheme = 'light',
): WallpaperLegendItem[] {
  const c = MAP_THEME[theme];
  const ink = theme === 'dark' ? '#fafafa' : '#3f3f46';
  const items: WallpaperLegendItem[] = [];
  if (input.routesCount > 0) items.push({ label: `${input.routesCount} recorridos`, color: c.sample, kind: 'line' });
  if (input.vehiclesCount > 0) {
    // Lo mismo que dice el panel: son estimaciones según horario, no
    // posiciones GPS. Corto para que "(no GPS)" quepa también en la vista previa.
    const noun = input.vehiclesCount === 1 ? 'micro estimada' : 'micros estimadas';
    items.push({ label: `${input.vehiclesCount} ${noun} (no GPS)`, color: MAP_SAMPLE_INK, kind: 'vehicle' });
  }
  if (input.paraderos) items.push({ label: 'Paraderos', color: ink, kind: 'dot' });
  if (input.terminales) items.push({ label: 'Terminales', color: ink, kind: 'square' });
  if (input.cobertura) items.push({ label: 'Cobertura territorial', color: '#facc15', kind: 'polygon' });
  if (input.cycleways) items.push({ label: 'Ciclovías', color: c.cycleway, kind: 'line' });
  if (input.greenspace) items.push({ label: 'Áreas verdes', color: '#22c55e', kind: 'polygon' });
  if (input.schools) items.push({ label: 'Educación', color: SCHOOL_COLOR.school, kind: 'dot' });
  if (input.pois) items.push({ label: 'Centros de atracción', color: POI_COLOR.hospital, kind: 'poi' });
  return items;
}

/**
 * Pin de un lugar como `.poi-marker` del mapa (index.css): disco del color de
 * la categoría con aro del fondo (2 de 22 px), sombra y el pictograma en
 * blanco (13 de 22 px). Lo pintan la imagen y la muestra de la leyenda.
 */
function paintPoiPin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  category: PoiCategory,
  diameter: number,
  theme: WallpaperTheme,
) {
  const unit = diameter / 22;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 3 * unit;
  ctx.shadowOffsetY = unit;
  ctx.beginPath();
  ctx.arc(cx, cy, diameter / 2, 0, Math.PI * 2);
  // stopFill es el --background de cada tema, el color del aro del pin.
  ctx.fillStyle = MAP_THEME[theme].stopFill;
  ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.beginPath();
  ctx.arc(cx, cy, diameter / 2 - 2 * unit, 0, Math.PI * 2);
  ctx.fillStyle = POI_COLOR[category];
  ctx.fill();
  const glyph = 13 * unit;
  ctx.translate(cx - glyph / 2, cy - glyph / 2);
  ctx.scale(glyph / 24, glyph / 24);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const d of POI_GLYPH[category]) ctx.stroke(new Path2D(d));
  ctx.restore();
}

function projectAtZoom(lat: number, lng: number, zoom: number): [number, number] {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
  return [x, y];
}

// Pick the largest zoom such that the bbox fits within width × height pixels.
function pickZoom(
  bbox: WallpaperConfig['bbox'],
  width: number,
  height: number,
): number {
  const [[latMin, lngMin], [latMax, lngMax]] = bbox;
  for (let z = 18; z >= 0; z--) {
    const [x1, y1] = projectAtZoom(latMax, lngMin, z);
    const [x2, y2] = projectAtZoom(latMin, lngMax, z);
    const pxW = Math.abs(x2 - x1);
    const pxH = Math.abs(y2 - y1);
    if (pxW <= width * 0.92 && pxH <= height * 0.92) return z;
  }
  return 0;
}

function loadTile(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function buildWallpaper(cfg: WallpaperConfig): Promise<Blob> {
  const {
    bbox,
    width,
    height,
    theme,
    style = 'clean',
    routes,
    cycleways,
    greenspace,
    coverageCells,
    paraderos,
    terminales,
    pois,
    schools,
    vehicles,
    legendItems,
    showLegend,
    showScale,
    midpoint,
    title,
    subtitle,
  } = cfg;
  const styleMeta = STYLE_META[style];
  const renderTheme = wallpaperRenderTheme(theme, style);
  const [[latMin, lngMin], [latMax, lngMax]] = bbox;
  const centerLat = (latMin + latMax) / 2;
  const centerLng = (lngMin + lngMax) / 2;
  const zoom = pickZoom(bbox, width, height);

  const [cx, cy] = projectAtZoom(centerLat, centerLng, zoom);
  const originX = cx - width / 2;
  const originY = cy - height / 2;

  // World-pixel → canvas-pixel converter, scoped to this render.
  const toCanvas = (lat: number, lng: number): [number, number] => {
    const [px, py] = projectAtZoom(lat, lng, zoom);
    return [px - originX, py - originY];
  };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.fillStyle = renderTheme === 'dark' ? '#0b0b0d' : '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Pedimos los tiles un nivel más profundo que el zoom de composición para
  // que se dibujen reducidos (2x de detalle real), y nunca por encima de z16,
  // que es donde Esri corta. `tilePx` es cuánto ocupa un tile en la grilla del
  // zoom de composición: 128 con supersampling, 256 sin él, más si sobreescalamos.
  const tileZoom = Math.min(zoom + 1, TILE_MAX_NATIVE_ZOOM);
  const tilePx = TILE_SIZE * Math.pow(2, zoom - tileZoom);
  const tilesPerSide = Math.pow(2, tileZoom);

  const tileMinX = Math.floor(originX / tilePx);
  const tileMinY = Math.floor(originY / tilePx);
  const tileMaxX = Math.floor((originX + width) / tilePx);
  const tileMaxY = Math.floor((originY + height) / tilePx);

  const tilePromises: Promise<{ img: HTMLImageElement | null; tx: number; ty: number }>[] = [];
  for (let tx = tileMinX; tx <= tileMaxX; tx++) {
    for (let ty = tileMinY; ty <= tileMaxY; ty++) {
      if (ty < 0 || ty >= tilesPerSide) continue;
      const wrapped = ((tx % tilesPerSide) + tilesPerSide) % tilesPerSide;
      tilePromises.push(
        loadTile(tileUrl(renderTheme, tileZoom, wrapped, ty)).then((img) => ({ img, tx, ty })),
      );
    }
  }
  const tiles = await Promise.all(tilePromises);
  for (const { img, tx, ty } of tiles) {
    if (!img) continue;
    ctx.drawImage(img, tx * tilePx - originX, ty * tilePx - originY, tilePx, tilePx);
  }

  ctx.fillStyle = styleMeta.overlay;
  ctx.fillRect(0, 0, width, height);

  if (styleMeta.vignette > 0) {
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.18,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72,
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, `rgba(0,0,0,${styleMeta.vignette})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  if (greenspace && greenspace.length > 0) {
    ctx.lineWidth = Math.max(0.6, Math.min(width, height) / 2200);
    for (const poly of greenspace) {
      if (poly.ring.length < 3) continue;
      ctx.beginPath();
      for (let i = 0; i < poly.ring.length; i++) {
        const [x, y] = toCanvas(poly.ring[i][0], poly.ring[i][1]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = poly.fill;
      ctx.fill();
      if (poly.stroke) {
        ctx.strokeStyle = poly.stroke;
        ctx.stroke();
      }
    }
  }

  // Coverage cells under the routes so routes stay legible on top.
  if (coverageCells && coverageCells.length > 0) {
    for (const cell of coverageCells) {
      const [x1, y1] = toCanvas(cell.lat + COVERAGE_HALF_STEP, cell.lng - COVERAGE_HALF_STEP);
      const [x2, y2] = toCanvas(cell.lat - COVERAGE_HALF_STEP, cell.lng + COVERAGE_HALF_STEP);
      ctx.fillStyle = COVERAGE_COLOR[cell.bucket];
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
  }

  // Routes — stroked polylines, scaled-up weight so they're crisp at print res.
  const lineScale = Math.max(1, Math.min(width, height) / 1280);
  const drawPath = (
    route: WallpaperRoute,
    options?: { halo?: boolean; alpha?: number; dash?: number[] },
  ) => {
    const { halo = false, alpha = 1, dash } = options ?? {};
    const r = route;
    if (r.path.length < 2) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = halo ? (renderTheme === 'dark' ? 'rgba(0,0,0,0.86)' : 'rgba(255,255,255,0.88)') : r.color;
    ctx.lineWidth = ((r.weight ?? 3) + (halo ? 4.5 : 0)) * lineScale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash.map((d) => d * lineScale));
    ctx.beginPath();
    for (let i = 0; i < r.path.length; i++) {
      const [x, y] = toCanvas(r.path[i][0], r.path[i][1]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  };

  // Ciclovías como en el mapa: un solo color del tema, sin borde, y el tipo
  // por el trazo (grosor y punteado de cada una).
  if (cycleways && cycleways.length > 0) {
    for (const r of cycleways) drawPath({ ...r, color: MAP_THEME[renderTheme].cycleway }, { dash: r.dash });
  }

  for (const r of routes) drawPath(r, { halo: true, alpha: styleMeta.routeHaloAlpha });
  for (const r of routes) drawPath({ ...r, color: displayRouteColor(r.color, renderTheme) });

  // Paraderos as small filled circles. Skipped at very low zoom — wouldn't
  // be readable anyway and they'd just blanket the map.
  if (paraderos && paraderos.length > 0 && zoom >= 12) {
    const r = 1.8 * lineScale;
    ctx.fillStyle = renderTheme === 'dark' ? 'rgba(250,250,250,0.85)' : 'rgba(15,15,15,0.7)';
    ctx.strokeStyle = renderTheme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 0.6 * lineScale;
    for (const p of paraderos) {
      const [x, y] = toCanvas(p.lat, p.lng);
      if (x < -r || x > width + r || y < -r || y > height + r) continue;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Terminals as small filled squares — distinct shape from paraderos so the
  // viewer can tell them apart at glance.
  if (terminales && terminales.length > 0) {
    const s = 5 * lineScale;
    ctx.fillStyle = renderTheme === 'dark' ? '#fafafa' : '#0f0f0f';
    ctx.strokeStyle = renderTheme === 'dark' ? '#000' : '#fff';
    ctx.lineWidth = 1.2 * lineScale;
    for (const t of terminales) {
      const [x, y] = toCanvas(t.lat, t.lng);
      if (x < -s || x > width + s || y < -s || y > height + s) continue;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
      ctx.strokeRect(x - s / 2, y - s / 2, s, s);
    }
  }

  // Establecimientos como punto chico; los lugares encima, como el pin del
  // mapa. En oscuro el aro va oscuro, como antes: blanco, en la vista previa
  // se confundía con el punto de una micro estimada del mismo azul.
  if (schools && schools.length > 0 && zoom >= 11) {
    ctx.lineWidth = 1.1 * lineScale;
    ctx.strokeStyle = renderTheme === 'dark' ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.9)';
    for (const p of schools) {
      const radius = (p.radius ?? 2.4) * lineScale;
      const [x, y] = toCanvas(p.lat, p.lng);
      if (x < -radius || x > width + radius || y < -radius || y > height + radius) continue;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.stroke();
    }
  }
  if (pois && pois.length > 0 && zoom >= 11) {
    const diameter = POI_PIN_DIAMETER * lineScale;
    for (const p of pois) {
      const [x, y] = toCanvas(p.lat, p.lng);
      if (x < -diameter || x > width + diameter || y < -diameter || y > height + diameter) continue;
      paintPoiPin(ctx, x, y, p.category, diameter, renderTheme);
    }
  }

  // Micros estimadas: la insignia del mapa (aro blanco y flecha) a escala de
  // la imagen. En una imagen chica (la vista previa) no se leería: van como
  // el punto redondo del mapa de lejos, que tampoco se confunde con un GPS.
  // La leyenda usa la misma decisión.
  const vehicleScale = Math.min(width, height) / 1280;
  const vehicleBadges = VEHICLE_BADGE_DIAMETER * vehicleScale >= VEHICLE_BADGE_MIN_PX;
  if (vehicles && vehicles.length > 0) {
    const reach = vehicleBadges ? (VEHICLE_BADGE_DIAMETER / 2 + 1) * vehicleScale : 5;
    for (const v of vehicles) {
      const [x, y] = toCanvas(v.lat, v.lng);
      if (x < -reach || x > width + reach || y < -reach || y > height + reach) continue;
      const ink = inkRouteColor(v.color, renderTheme);
      if (!vehicleBadges) {
        paintVehicleDot(ctx, x, y, { kind: 'estimate', stale: false, ink, theme: renderTheme });
        continue;
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(vehicleScale, vehicleScale);
      paintVehicleSymbol(ctx, 0, 0, {
        kind: 'estimate',
        stale: false,
        ink,
        diameter: VEHICLE_BADGE_DIAMETER,
        bucket: Number.isFinite(v.bearing) ? Math.round((((v.bearing % 360) + 360) % 360) / 22.5) % 16 : null,
        theme: renderTheme,
      });
      ctx.restore();
    }
  }

  // Walking midpoint — dashed purple line + A/M/B labeled pins. Drawn last
  // so it always reads on top regardless of underlying layer.
  if (midpoint && midpoint.path.length >= 2) {
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 3.5 * lineScale;
    ctx.setLineDash([8 * lineScale, 6 * lineScale]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < midpoint.path.length; i++) {
      const [x, y] = toCanvas(midpoint.path[i][0], midpoint.path[i][1]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    const drawLabeledPin = (
      lat: number,
      lng: number,
      label: string,
      bg: string,
    ) => {
      const [x, y] = toCanvas(lat, lng);
      const r = 11 * lineScale;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5 * lineScale;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${Math.round(11 * lineScale)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y + 0.5);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    };

    if (midpoint.origin) drawLabeledPin(midpoint.origin.lat, midpoint.origin.lng, 'A', '#15803d');
    if (midpoint.destination) drawLabeledPin(midpoint.destination.lat, midpoint.destination.lng, 'B', '#DC2626');
    drawLabeledPin(midpoint.midpoint[0], midpoint.midpoint[1], 'M', '#7C3AED');
  }

  // Branding strip bottom-left: optional content title (curated view name
  // or "vista actual · N recorridos"), then "conce.patagua.dev" small, then
  // the OSM/Esri/GTFS attribution as fine print.
  const padX = Math.round(width * 0.035);
  const padY = Math.round(height * 0.035);
  const minDim = Math.min(width, height);
  const subtitleSize = Math.round(minDim * 0.022 * styleMeta.titleScale);
  const brandSize = Math.round(minDim * 0.016);
  const attrSize = Math.round(minDim * 0.012);

  ctx.textBaseline = 'alphabetic';

  if (showScale || style === 'technical') {
    drawScaleBar(ctx, {
      width,
      height,
      centerLat,
      zoom,
      lineScale,
      renderTheme,
      padX,
      padY,
    });
  }

  const shouldDrawLegend = showLegend ?? styleMeta.legend;
  if (shouldDrawLegend && legendItems && legendItems.length > 0) {
    drawLegend(ctx, legendItems, {
      width,
      height,
      lineScale,
      renderTheme,
      padX,
      padY,
      vehicleBadges,
    });
  }

  let cursor = height - padY;
  ctx.fillStyle = renderTheme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  ctx.font = `400 ${attrSize}px Inter, system-ui, sans-serif`;
  ctx.fillText('OSM contributors © Esri · GTFS oficial DTPR · itinerarios EFE', padX, cursor);
  cursor -= attrSize + 4;

  ctx.fillStyle = renderTheme === 'dark' ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.78)';
  ctx.font = `600 ${brandSize}px Inter, system-ui, sans-serif`;
  ctx.fillText('conce.patagua.dev', padX, cursor);
  cursor -= brandSize + 4;

  if (subtitle) {
    ctx.fillStyle = renderTheme === 'dark' ? 'rgba(255,255,255,0.64)' : 'rgba(0,0,0,0.56)';
    ctx.font = `400 ${Math.round(subtitleSize * 0.72)}px Inter, system-ui, sans-serif`;
    ctx.fillText(subtitle, padX, cursor);
    cursor -= Math.round(subtitleSize * 0.72) + 6;
  }

  if (title) {
    ctx.fillStyle = renderTheme === 'dark' ? 'rgba(255,255,255,0.86)' : 'rgba(0,0,0,0.78)';
    ctx.font = `500 ${subtitleSize}px Inter, system-ui, sans-serif`;
    ctx.fillText(title, padX, cursor);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('canvas.toBlob returned null'));
      },
      'image/png',
      0.95,
    );
  });
}

function drawScaleBar(
  ctx: CanvasRenderingContext2D,
  opts: {
    width: number;
    height: number;
    centerLat: number;
    zoom: number;
    lineScale: number;
    renderTheme: WallpaperTheme;
    padX: number;
    padY: number;
  },
) {
  const metersPerPixel =
    (156543.03392 * Math.cos((opts.centerLat * Math.PI) / 180)) /
    Math.pow(2, opts.zoom);
  const kmPx = 1000 / metersPerPixel;
  const x = opts.width - opts.padX - kmPx;
  const y = opts.height - opts.padY - 18 * opts.lineScale;
  if (!Number.isFinite(kmPx) || kmPx < 24 || x < opts.width * 0.5) return;
  ctx.save();
  ctx.strokeStyle = opts.renderTheme === 'dark' ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.72)';
  ctx.lineWidth = 2 * opts.lineScale;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + kmPx, y);
  ctx.stroke();
  ctx.fillStyle = opts.renderTheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.58)';
  ctx.font = `500 ${Math.round(11 * opts.lineScale)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('1 km', x + kmPx / 2, y - 6 * opts.lineScale);
  ctx.restore();
}

function drawLegend(
  ctx: CanvasRenderingContext2D,
  items: WallpaperLegendItem[],
  opts: {
    width: number;
    height: number;
    lineScale: number;
    renderTheme: WallpaperTheme;
    padX: number;
    padY: number;
    /** La misma decisión de la imagen: insignia o, en una imagen chica, punto. */
    vehicleBadges: boolean;
  },
) {
  const fontSize = Math.round(11 * opts.lineScale);
  const rowH = Math.round(18 * opts.lineScale);
  // Ancho según el rótulo más largo, sin pasar del ancho de la imagen.
  ctx.save();
  ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
  const longest = Math.max(0, ...items.map((item) => ctx.measureText(item.label).width));
  ctx.restore();
  const panelW = Math.min(opts.width - 2 * opts.padX, Math.max(160 * opts.lineScale, longest + 56 * opts.lineScale));
  const panelH = 18 * opts.lineScale + items.length * rowH;
  const x = opts.width - opts.padX - panelW;
  const y = opts.padY;
  ctx.save();
  ctx.fillStyle = opts.renderTheme === 'dark' ? 'rgba(8,10,14,0.72)' : 'rgba(255,255,255,0.78)';
  ctx.strokeStyle = opts.renderTheme === 'dark' ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, panelW, panelH, 10 * opts.lineScale);
  ctx.fill();
  ctx.stroke();

  ctx.font = `600 ${Math.round(10 * opts.lineScale)}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = opts.renderTheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  ctx.fillText('LEYENDA', x + 12 * opts.lineScale, y + 16 * opts.lineScale);
  ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
  items.forEach((item, idx) => {
    const rowY = y + 30 * opts.lineScale + idx * rowH;
    const iconX = x + 14 * opts.lineScale;
    const iconY = rowY - 4 * opts.lineScale;
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = 2.2 * opts.lineScale;
    if (item.kind === 'line') {
      ctx.beginPath();
      ctx.moveTo(iconX, iconY);
      ctx.lineTo(iconX + 18 * opts.lineScale, iconY);
      ctx.stroke();
    } else if (item.kind === 'square' || item.kind === 'polygon') {
      ctx.fillRect(iconX, iconY - 5 * opts.lineScale, 10 * opts.lineScale, 10 * opts.lineScale);
    } else if (item.kind === 'vehicle') {
      // Lo mismo que se dibujó en la imagen (insignia o punto), con la tinta de ejemplo.
      ctx.save();
      ctx.translate(iconX + 7 * opts.lineScale, iconY);
      ctx.scale(opts.lineScale, opts.lineScale);
      if (opts.vehicleBadges) {
        paintVehicleSymbol(ctx, 0, 0, {
          kind: 'estimate',
          stale: false,
          ink: item.color,
          diameter: 14,
          bucket: 2,
          theme: opts.renderTheme,
        });
      } else {
        paintVehicleDot(ctx, 0, 0, { kind: 'estimate', stale: false, ink: item.color, theme: opts.renderTheme });
      }
      ctx.restore();
    } else if (item.kind === 'poi') {
      // El pin de hospital (el primero de la leyenda del mapa), del tamaño de la imagen.
      paintPoiPin(ctx, iconX + 7 * opts.lineScale, iconY, 'hospital', POI_PIN_DIAMETER * opts.lineScale, opts.renderTheme);
    } else {
      ctx.beginPath();
      ctx.arc(iconX + 5 * opts.lineScale, iconY, 4 * opts.lineScale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = opts.renderTheme === 'dark' ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.72)';
    ctx.fillText(item.label, x + 42 * opts.lineScale, rowY);
  });
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface WallpaperSizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  group: 'phone' | 'desktop';
}

export const WALLPAPER_SIZES: WallpaperSizePreset[] = [
  // Phones — portrait.
  { id: 'iphone-15-pro-max', label: 'iPhone 15 Pro Max', width: 1290, height: 2796, group: 'phone' },
  { id: 'iphone-15-pro', label: 'iPhone 15 Pro', width: 1179, height: 2556, group: 'phone' },
  { id: 'iphone-se', label: 'iPhone SE', width: 750, height: 1334, group: 'phone' },
  // Desktops — landscape.
  { id: 'macbook-retina', label: 'MacBook Retina', width: 2880, height: 1800, group: 'desktop' },
  { id: 'imac-5k', label: 'iMac 5K', width: 5120, height: 2880, group: 'desktop' },
  { id: '4k-uhd', label: '4K UHD', width: 3840, height: 2160, group: 'desktop' },
  { id: 'fullhd', label: 'Full HD', width: 1920, height: 1080, group: 'desktop' },
];

// Curated views — bounds + sensible default for the layer selection.
export interface CuratedView {
  id: string;
  label: string;
  description: string;
  bbox: [[number, number], [number, number]];
  includeBiotren: boolean;
  includeMicros: boolean;
  includeCoverage: boolean;
}

export const CURATED_VIEWS: CuratedView[] = [
  {
    id: 'biotren',
    label: 'Biotrén completo',
    description: 'Las dos líneas del tren urbano, Hualqui–Talcahuano y Coronel–Concepción.',
    bbox: [[-37.05, -73.18], [-36.69, -72.93]],
    includeBiotren: true,
    includeMicros: false,
    includeCoverage: false,
  },
  {
    id: 'micros-centro',
    label: 'Red de micros centro',
    description: 'Concepción centro + Hualpén/San Pedro: la maraña de servicios urbanos.',
    bbox: [[-36.86, -73.12], [-36.78, -73.02]],
    includeBiotren: true,
    includeMicros: true,
    includeCoverage: false,
  },
  {
    id: 'cobertura-metro',
    label: 'Cobertura territorial',
    description: 'Heatmap de distancia al paradero más cercano, vista metropolitana.',
    bbox: [[-37.08, -73.20], [-36.66, -72.90]],
    includeBiotren: true,
    includeMicros: true,
    includeCoverage: true,
  },
];
