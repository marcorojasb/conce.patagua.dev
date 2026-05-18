// Generates a high-resolution PNG of the network composed for use as a phone
// or desktop wallpaper. We don't reuse the visor's live Leaflet map (the
// viewport is wrong, the chrome would leak in, and DOM-to-image of a tiled
// map is messy). Instead we render fresh: project the world to mercator at a
// zoom level that fits the requested bbox, fetch CARTO tiles directly, paint
// them onto an offscreen canvas, then stroke route polylines on top.
//
// Outcome: deterministic, retina-sharp, no UI leakage, no extra deps.

const TILE_SIZE = 256;
const TILE_SUBDOMAINS = ['a', 'b', 'c'];

export type WallpaperTheme = 'light' | 'dark';
export type WallpaperStyle = 'clean' | 'technical' | 'editorial' | 'night';
export type WallpaperRouteMode = 'visible' | 'all' | 'biotren' | 'interurban';

export interface WallpaperRoute {
  path: Array<[number, number]>; // [lat, lng] vertices
  color: string;
  weight?: number;
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
  kind?: 'line' | 'dot' | 'square' | 'polygon' | 'vehicle';
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
  pois?: WallpaperStyledPoint[];
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

export function buildWallpaperLegend(input: {
  routesCount: number;
  vehiclesCount: number;
  paraderos: boolean;
  terminales: boolean;
  cobertura: boolean;
  cycleways: boolean;
  greenspace: boolean;
  schools: boolean;
  pois: boolean;
}): WallpaperLegendItem[] {
  const items: WallpaperLegendItem[] = [];
  if (input.routesCount > 0) items.push({ label: `${input.routesCount} recorridos`, color: '#0ea5e9', kind: 'line' });
  if (input.vehiclesCount > 0) items.push({ label: `${input.vehiclesCount} servicios en curso`, color: '#f8fafc', kind: 'vehicle' });
  if (input.paraderos) items.push({ label: 'Paraderos', color: '#f8fafc', kind: 'dot' });
  if (input.terminales) items.push({ label: 'Terminales', color: '#f8fafc', kind: 'square' });
  if (input.cobertura) items.push({ label: 'Cobertura territorial', color: '#facc15', kind: 'polygon' });
  if (input.cycleways) items.push({ label: 'Ciclovías', color: '#2563eb', kind: 'line' });
  if (input.greenspace) items.push({ label: 'Áreas verdes', color: '#22c55e', kind: 'polygon' });
  if (input.schools) items.push({ label: 'Educación', color: '#dc2626', kind: 'dot' });
  if (input.pois) items.push({ label: 'Centros de atracción', color: '#7c3aed', kind: 'dot' });
  return items;
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
  const renderTheme: WallpaperTheme = style === 'night' ? 'dark' : theme;
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

  // Compute visible tile range and fetch in parallel.
  const tileMinX = Math.floor(originX / TILE_SIZE);
  const tileMinY = Math.floor(originY / TILE_SIZE);
  const tileMaxX = Math.floor((originX + width) / TILE_SIZE);
  const tileMaxY = Math.floor((originY + height) / TILE_SIZE);
  const tileStyle = renderTheme === 'dark' ? 'dark_all' : 'light_all';

  const tilePromises: Promise<{ img: HTMLImageElement | null; tx: number; ty: number }>[] = [];
  for (let tx = tileMinX; tx <= tileMaxX; tx++) {
    for (let ty = tileMinY; ty <= tileMaxY; ty++) {
      if (ty < 0 || ty >= Math.pow(2, zoom)) continue;
      const wrapped = ((tx % Math.pow(2, zoom)) + Math.pow(2, zoom)) % Math.pow(2, zoom);
      const sub = TILE_SUBDOMAINS[(tx + ty + zoom) % TILE_SUBDOMAINS.length];
      const url = `https://${sub}.basemaps.cartocdn.com/${tileStyle}/${zoom}/${wrapped}/${ty}@2x.png`;
      tilePromises.push(loadTile(url).then((img) => ({ img, tx, ty })));
    }
  }
  const tiles = await Promise.all(tilePromises);
  for (const { img, tx, ty } of tiles) {
    if (!img) continue;
    ctx.drawImage(img, tx * TILE_SIZE - originX, ty * TILE_SIZE - originY, TILE_SIZE, TILE_SIZE);
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

  if (cycleways && cycleways.length > 0) {
    for (const r of cycleways) drawPath(r, { alpha: 0.78, dash: [5, 4] });
  }

  for (const r of routes) drawPath(r, { halo: true, alpha: styleMeta.routeHaloAlpha });
  for (const r of routes) drawPath(r);

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

  const drawStyledPoints = (points: WallpaperStyledPoint[] | undefined, fallbackRadius: number) => {
    if (!points || points.length === 0 || zoom < 11) return;
    ctx.lineWidth = 1.1 * lineScale;
    for (const p of points) {
      const radius = (p.radius ?? fallbackRadius) * lineScale;
      const [x, y] = toCanvas(p.lat, p.lng);
      if (x < -radius || x > width + radius || y < -radius || y > height + radius) continue;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = renderTheme === 'dark' ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.9)';
      ctx.stroke();
    }
  };

  drawStyledPoints(schools, 2.4);
  drawStyledPoints(pois, 3.1);

  if (vehicles && vehicles.length > 0) {
    const markerSize = 7.2 * lineScale;
    for (const v of vehicles) {
      const [x, y] = toCanvas(v.lat, v.lng);
      if (x < -markerSize || x > width + markerSize || y < -markerSize || y > height + markerSize) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((v.bearing * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, -markerSize);
      ctx.lineTo(markerSize * 0.78, markerSize * 0.82);
      ctx.lineTo(0, markerSize * 0.42);
      ctx.lineTo(-markerSize * 0.78, markerSize * 0.82);
      ctx.closePath();
      ctx.fillStyle = v.color;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = Math.max(1.4, 1.8 * lineScale);
      ctx.fill();
      ctx.stroke();
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

    if (midpoint.origin) drawLabeledPin(midpoint.origin.lat, midpoint.origin.lng, 'A', '#16A34A');
    if (midpoint.destination) drawLabeledPin(midpoint.destination.lat, midpoint.destination.lng, 'B', '#DC2626');
    drawLabeledPin(midpoint.midpoint[0], midpoint.midpoint[1], 'M', '#7C3AED');
  }

  // Branding strip bottom-left: optional content title (curated view name
  // or "vista actual · N recorridos"), then "conce.patagua.dev" small, then
  // the OSM/CARTO/GTFS attribution as fine print.
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
    });
  }

  let cursor = height - padY;
  ctx.fillStyle = renderTheme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  ctx.font = `400 ${attrSize}px Inter, system-ui, sans-serif`;
  ctx.fillText('OSM contributors © CARTO · GTFS Gran Concepción CC BY 4.0', padX, cursor);
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
  },
) {
  const fontSize = Math.round(11 * opts.lineScale);
  const rowH = Math.round(18 * opts.lineScale);
  const panelW = Math.min(opts.width * 0.46, 280 * opts.lineScale);
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
      ctx.beginPath();
      ctx.moveTo(iconX + 5 * opts.lineScale, iconY - 7 * opts.lineScale);
      ctx.lineTo(iconX + 11 * opts.lineScale, iconY + 6 * opts.lineScale);
      ctx.lineTo(iconX - 1 * opts.lineScale, iconY + 6 * opts.lineScale);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = opts.renderTheme === 'dark' ? '#111827' : '#fff';
      ctx.stroke();
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
