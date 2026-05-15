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

export interface WallpaperConfig {
  bbox: [[number, number], [number, number]]; // [[minLat, minLng], [maxLat, maxLng]]
  width: number;
  height: number;
  theme: WallpaperTheme;
  routes: WallpaperRoute[];
  coverageCells?: WallpaperCoverageCell[];
  title?: string;
  subtitle?: string;
}

const COVERAGE_COLOR: Record<WallpaperCoverageCell['bucket'], string> = {
  excelente: 'rgba(34, 197, 94, 0.55)',
  buena: 'rgba(132, 204, 22, 0.5)',
  marginal: 'rgba(234, 179, 8, 0.45)',
  pobre: 'rgba(249, 115, 22, 0.45)',
  'muy-pobre': 'rgba(239, 68, 68, 0.45)',
};
const COVERAGE_HALF_STEP = 0.0015; // matches the coverage grid generator

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
  const { bbox, width, height, theme, routes, coverageCells, title, subtitle } = cfg;
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

  ctx.fillStyle = theme === 'dark' ? '#0b0b0d' : '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Compute visible tile range and fetch in parallel.
  const tileMinX = Math.floor(originX / TILE_SIZE);
  const tileMinY = Math.floor(originY / TILE_SIZE);
  const tileMaxX = Math.floor((originX + width) / TILE_SIZE);
  const tileMaxY = Math.floor((originY + height) / TILE_SIZE);
  const tileStyle = theme === 'dark' ? 'dark_all' : 'light_all';

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
  for (const r of routes) {
    if (r.path.length < 2) continue;
    ctx.strokeStyle = r.color;
    ctx.lineWidth = (r.weight ?? 3) * lineScale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < r.path.length; i++) {
      const [x, y] = toCanvas(r.path[i][0], r.path[i][1]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Branding strip bottom-left. Keep small enough to leave the network visible.
  const padX = Math.round(width * 0.035);
  const padY = Math.round(height * 0.035);
  const titleSize = Math.round(Math.min(width, height) * 0.034);
  const subtitleSize = Math.round(titleSize * 0.55);
  const attrSize = Math.round(titleSize * 0.4);

  ctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.85)';
  ctx.font = `600 ${titleSize}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(title ?? 'Conce Transporte', padX, height - padY - subtitleSize - attrSize - 8);

  ctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)';
  ctx.font = `500 ${subtitleSize}px Inter, system-ui, sans-serif`;
  ctx.fillText(
    subtitle ?? 'Visor de transporte público del Gran Concepción · patagua.dev',
    padX,
    height - padY - attrSize - 4,
  );

  ctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  ctx.font = `400 ${attrSize}px Inter, system-ui, sans-serif`;
  ctx.fillText(
    'OSM contributors © CARTO · GTFS Gran Concepción CC BY 4.0',
    padX,
    height - padY,
  );

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
