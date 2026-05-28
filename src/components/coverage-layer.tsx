// Renders the paradero coverage grid as a translucent heatmap overlay.
//
// Uses Leaflet's imperative API (L.featureGroup + L.rectangle) rather than
// 7 k react-leaflet <Rectangle/> components: skipping React's reconciliation
// for every cell on each render keeps the layer cheap when toggled on. The
// rectangles share a single L.canvas renderer (`paraderoRenderer`) so they
// paint to one canvas, not 7 k SVG nodes.
//
// The dataset itself is lazy-loaded via dynamic import, the chunk only
// downloads the first time the layer is enabled.

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { CoverageCell } from '@/types/transport';
import type { LayerStatusControls } from '@/hooks/use-layer-status';

const STEP = 0.003;
const HALF = STEP / 2;

const BINS: Array<{ max: number; color: string; label: string }> = [
  { max: 200, color: '#15803d', label: '≤ 200 m' },
  { max: 400, color: '#65a30d', label: '200–400 m' },
  { max: 600, color: '#facc15', label: '400–600 m' },
  { max: 1000, color: '#f97316', label: '600–1000 m' },
  { max: Infinity, color: '#dc2626', label: '> 1 km' },
];

function colorFor(distance: number): string {
  for (const b of BINS) {
    if (distance <= b.max) return b.color;
  }
  return BINS[BINS.length - 1].color;
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

interface Props {
  enabled: boolean;
  canvasRenderer: L.Canvas;
  threshold: 'all' | 'underserved';
  retryKey: number;
  loadStatus: LayerStatusControls;
}

export function CoverageLayer({
  enabled,
  canvasRenderer,
  threshold,
  retryKey,
  loadStatus,
}: Props) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const group = L.featureGroup();

    const draw = (cells: readonly CoverageCell[]) => {
      if (cancelled) return;
      const minDist = threshold === 'underserved' ? 600 : 0;
      for (const [lat, lng, dist] of cells) {
        if (dist < minDist) continue;
        const fill = colorFor(dist);
        const rect = L.rectangle(
          [
            [lat - HALF, lng - HALF],
            [lat + HALF, lng + HALF],
          ],
          {
            color: fill,
            fillColor: fill,
            fillOpacity: threshold === 'underserved' ? 0.55 : 0.4,
            weight: 0,
            interactive: false,
            renderer: canvasRenderer,
          },
        );
        group.addLayer(rect);
      }
      group.addTo(map);
      loadStatus.succeed();
    };

    if (cellsCache) {
      draw(cellsCache);
    } else {
      loadStatus.start();
      void loadCells()
        .then(draw)
        .catch((err) => {
          cellsPromise = null;
          if (!cancelled) {
            loadStatus.fail(err, 'No se pudo cargar cobertura');
          }
        });
    }

    return () => {
      cancelled = true;
      group.remove();
    };
  }, [enabled, threshold, canvasRenderer, map, loadStatus, retryKey]);

  return null;
}
