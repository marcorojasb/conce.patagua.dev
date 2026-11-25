// Grilla de cobertura de paraderos como mapa de calor translúcido.
//
// Son ~9.000 celdas de una grilla regular (0,003°): antes cada una era un
// L.rectangle en el canvas compartido del mapa, y cada zoom o cambio de línea
// volvía a proyectarlas y pintarlas todas (~30 MB de heap y más de 1 s de zoom
// con la CPU frenada). Ahora se pintan una sola vez en una imagen, en
// proyección Mercator (las filas tienen la altura que tienen en el mapa, así
// que calzan exacto), y Leaflet solo la escala: un zoom no cuesta nada.
//
// La imagen va en su propio panel debajo de los trazados, sin eventos
// (pointer-events: none): no recibe clics, así que no tapa líneas ni
// paraderos. El dataset se descarga recién la primera vez que se enciende.

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { CoverageCell } from '@/types/transport';
import type { LayerStatusControls } from '@/hooks/use-layer-status';
import type { CoverageThreshold } from '@/types/ui-contracts';

const STEP = 0.003;
const HALF = STEP / 2;
/** Píxeles de imagen por celda a lo ancho: el borde de una celda queda a menos de ~25 m de su lugar. */
const PX_PER_CELL = 6;
const COVERAGE_PANE = 'coveragePane';
// Entre las teselas (200) y los trazados (overlayPane, 400).
const COVERAGE_PANE_Z = '350';

/** Color por distancia al paradero más cercano (m). La leyenda del mapa usa los mismos. */
export const COVERAGE_BINS: ReadonlyArray<{ min: number; max: number; color: string; label: string }> = [
  { min: 0, max: 200, color: '#15803d', label: '≤ 200 m' },
  { min: 200, max: 400, color: '#65a30d', label: '200–400 m' },
  { min: 400, max: 600, color: '#facc15', label: '400–600 m' },
  { min: 600, max: 1000, color: '#f97316', label: '600 m–1 km' },
  { min: 1000, max: Infinity, color: '#dc2626', label: '> 1 km' },
];

/** Con el umbral "mal servidas" solo se dibujan las celdas desde esta distancia. */
export const UNDERSERVED_MIN_M = 600;

function colorFor(distance: number): string {
  for (const b of COVERAGE_BINS) {
    if (distance <= b.max) return b.color;
  }
  return COVERAGE_BINS[COVERAGE_BINS.length - 1].color;
}

let cellsCache: readonly CoverageCell[] | null = null;
let cellsPromise: Promise<readonly CoverageCell[]> | null = null;
function loadCells(): Promise<readonly CoverageCell[]> {
  if (cellsCache) return Promise.resolve(cellsCache);
  cellsPromise ??= import('@/data/coverage.generated').then((mod) => {
    cellsCache = mod.COVERAGE_CELLS;
    return cellsCache;
  });
  return cellsPromise;
}

interface CoverageImage {
  url: string;
  bounds: L.LatLngBoundsExpression;
}

/** y de Mercator (sin escala) de una latitud en grados. */
function mercatorY(lat: number): number {
  const phi = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + phi / 2));
}

// Una imagen por umbral, hecha una vez por visita.
const imageCache = new Map<CoverageThreshold, Promise<CoverageImage>>();

function coverageImage(cells: readonly CoverageCell[], threshold: CoverageThreshold): Promise<CoverageImage> {
  let cached = imageCache.get(threshold);
  if (cached) return cached;
  cached = new Promise<CoverageImage>((resolve, reject) => {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    for (const [lat, lng] of cells) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
    const south = minLat - HALF;
    const north = maxLat + HALF;
    const west = minLng - HALF;
    const east = maxLng + HALF;
    // Escala única para x e y: píxeles por radián de longitud.
    const scale = PX_PER_CELL / ((STEP * Math.PI) / 180);
    const yNorth = mercatorY(north);
    const width = Math.round(((east - west) * Math.PI * scale) / 180);
    const height = Math.round((yNorth - mercatorY(south)) * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Sin canvas 2D'));
      return;
    }
    const minDist = threshold === 'underserved' ? UNDERSERVED_MIN_M : 0;
    // Bordes enteros: celdas vecinas comparten borde sin franjas mezcladas.
    const px = (lng: number) => Math.round(((lng - west) * Math.PI * scale) / 180);
    const py = (lat: number) => Math.round((yNorth - mercatorY(lat)) * scale);
    for (const [lat, lng, dist] of cells) {
      if (dist < minDist) continue;
      const x0 = px(lng - HALF);
      const y0 = py(lat + HALF);
      ctx.fillStyle = colorFor(dist);
      ctx.fillRect(x0, y0, px(lng + HALF) - x0, py(lat - HALF) - y0);
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo armar la imagen de cobertura'));
        return;
      }
      resolve({
        url: URL.createObjectURL(blob),
        bounds: [
          [south, west],
          [north, east],
        ],
      });
    }, 'image/png');
  });
  cached.catch(() => imageCache.delete(threshold));
  imageCache.set(threshold, cached);
  return cached;
}

interface Props {
  enabled: boolean;
  threshold: CoverageThreshold;
  retryKey: number;
  loadStatus: LayerStatusControls;
}

export function CoverageLayer({ enabled, threshold, retryKey, loadStatus }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let overlay: L.ImageOverlay | null = null;
    const pane = map.getPane(COVERAGE_PANE) ?? map.createPane(COVERAGE_PANE);
    pane.style.zIndex = COVERAGE_PANE_Z;
    pane.style.pointerEvents = 'none';

    if (!cellsCache) loadStatus.start();
    void loadCells()
      .then((cells) => coverageImage(cells, threshold))
      .then((image) => {
        if (cancelled) return;
        overlay = L.imageOverlay(image.url, image.bounds, {
          pane: COVERAGE_PANE,
          opacity: threshold === 'underserved' ? 0.55 : 0.4,
          interactive: false,
          className: 'coverage-overlay',
        }).addTo(map);
        loadStatus.succeed();
      })
      .catch((err) => {
        cellsPromise = null;
        if (!cancelled) loadStatus.fail(err, 'No se pudo cargar cobertura');
      });

    return () => {
      cancelled = true;
      overlay?.remove();
    };
  }, [enabled, threshold, map, loadStatus, retryKey]);

  return null;
}
