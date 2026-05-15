// Renders the paradero coverage grid as a translucent heatmap overlay.
//
// Uses Leaflet's imperative API (L.featureGroup + L.rectangle) rather than
// 7 k react-leaflet <Rectangle/> components: skipping React's reconciliation
// for every cell on each render keeps the layer cheap when toggled on. The
// rectangles share a single L.canvas renderer (`paraderoRenderer`) so they
// paint to one canvas, not 7 k SVG nodes.
//
// The dataset itself is lazy-loaded via dynamic import — the chunk only
// downloads the first time the layer is enabled.

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { CoverageCell } from '@/types/transport';

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

let cellsPromise: Promise<readonly CoverageCell[]> | null = null;
function loadCells(): Promise<readonly CoverageCell[]> {
  cellsPromise ??= import('@/data/coverage.generated').then((mod) => mod.COVERAGE_CELLS);
  return cellsPromise;
}

interface Props {
  enabled: boolean;
  canvasRenderer: L.Canvas;
  threshold: 'all' | 'underserved';
  onLoadingChange: (loading: boolean) => void;
}

export function CoverageLayer({
  enabled,
  canvasRenderer,
  threshold,
  onLoadingChange,
}: Props) {
  const map = useMap();
  const [cells, setCells] = useState<readonly CoverageCell[] | null>(null);

  useEffect(() => {
    if (!enabled || cells) return;
    onLoadingChange(true);
    let cancelled = false;
    void loadCells()
      .then((data) => {
        if (!cancelled) setCells(data);
      })
      .finally(() => {
        if (!cancelled) onLoadingChange(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, cells, onLoadingChange]);

  useEffect(() => {
    if (!enabled || !cells) return;
    const group = L.featureGroup();
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
    return () => {
      group.remove();
    };
  }, [enabled, cells, threshold, canvasRenderer, map]);

  return null;
}
