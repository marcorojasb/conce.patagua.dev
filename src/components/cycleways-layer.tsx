// Cycling infrastructure layer for the visor — segregated cycleways,
// shared paths, and on-road bike lanes from OSM.
//
// Uses imperative Leaflet (L.featureGroup + L.polyline on a shared canvas
// renderer) instead of react-leaflet so the 460+ polylines don't pay
// reconciliation cost on every parent render. Same pattern as
// coverage-layer.tsx. The dataset is lazy-loaded — chunk only downloads
// the first time the layer is enabled.

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Cycleway, CyclewayKind } from '@/data/cycleways.generated';
import type { LayerLoadStatus } from '@/hooks/use-layer-status';

// Color encoding by kind — segregated stands out (the gold standard for
// safety), shared is muted (less reliable infra), lane is in-between.
const KIND_STYLE: Record<CyclewayKind, { color: string; weight: number; dash?: string }> = {
  segregated: { color: '#2563eb', weight: 3 }, // blue-600
  shared: { color: '#6366f1', weight: 2.5, dash: '4 4' }, // indigo-500 dashed
  lane: { color: '#06b6d4', weight: 2 }, // cyan-500
};

let dataCache: readonly Cycleway[] | null = null;
let dataPromise: Promise<readonly Cycleway[]> | null = null;
function loadCycleways(): Promise<readonly Cycleway[]> {
  if (dataCache) return Promise.resolve(dataCache);
  dataPromise ??= import('@/data/cycleways.generated').then((mod) => {
    dataCache = mod.CYCLEWAYS;
    return dataCache;
  });
  return dataPromise;
}

interface Props {
  enabled: boolean;
  canvasRenderer: L.Canvas;
  retryKey: number;
  onStatusChange: (status: LayerLoadStatus) => void;
}

export function CyclewaysLayer({
  enabled,
  canvasRenderer,
  retryKey,
  onStatusChange,
}: Props) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const group = L.featureGroup();

    const draw = (items: readonly Cycleway[]) => {
      if (cancelled) return;
      for (const c of items) {
        const style = KIND_STYLE[c.kind];
        const tooltip = c.name
          ? `${c.name} · ${KIND_LABEL[c.kind]}${c.surface ? ` · ${c.surface}` : ''}`
          : `${KIND_LABEL[c.kind]}${c.surface ? ` · ${c.surface}` : ''}`;
        const line = L.polyline(c.path, {
          color: style.color,
          weight: style.weight,
          opacity: 0.85,
          dashArray: style.dash,
          lineCap: 'round',
          lineJoin: 'round',
          renderer: canvasRenderer,
          interactive: true,
        });
        line.bindTooltip(tooltip, { sticky: true, direction: 'top', opacity: 0.9 });
        group.addLayer(line);
      }
      group.addTo(map);
      onStatusChange({ loading: false, error: null, ready: true });
    };

    if (dataCache) {
      draw(dataCache);
    } else {
      onStatusChange({ loading: true, error: null, ready: false });
      void loadCycleways()
        .then(draw)
        .catch((err) => {
          dataPromise = null;
          if (!cancelled) {
            onStatusChange({
              loading: false,
              error: err instanceof Error ? err.message : 'No se pudo cargar ciclovías',
              ready: false,
            });
          }
        });
    }

    return () => {
      cancelled = true;
      group.remove();
    };
  }, [enabled, canvasRenderer, map, onStatusChange, retryKey]);

  return null;
}

const KIND_LABEL: Record<CyclewayKind, string> = {
  segregated: 'Ciclovía segregada',
  shared: 'Ruta compartida',
  lane: 'Ciclobanda en calzada',
};
