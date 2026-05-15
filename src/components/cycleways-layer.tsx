// Cycling infrastructure layer for the visor — segregated cycleways,
// shared paths, and on-road bike lanes from OSM.
//
// Uses imperative Leaflet (L.featureGroup + L.polyline on a shared canvas
// renderer) instead of react-leaflet so the 460+ polylines don't pay
// reconciliation cost on every parent render. Same pattern as
// coverage-layer.tsx. The dataset is lazy-loaded — chunk only downloads
// the first time the layer is enabled.

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Cycleway, CyclewayKind } from '@/data/cycleways.generated';

// Color encoding by kind — segregated stands out (the gold standard for
// safety), shared is muted (less reliable infra), lane is in-between.
const KIND_STYLE: Record<CyclewayKind, { color: string; weight: number; dash?: string }> = {
  segregated: { color: '#2563eb', weight: 3 }, // blue-600
  shared: { color: '#6366f1', weight: 2.5, dash: '4 4' }, // indigo-500 dashed
  lane: { color: '#06b6d4', weight: 2 }, // cyan-500
};

let dataPromise: Promise<readonly Cycleway[]> | null = null;
function loadCycleways(): Promise<readonly Cycleway[]> {
  dataPromise ??= import('@/data/cycleways.generated').then((mod) => mod.CYCLEWAYS);
  return dataPromise;
}

interface Props {
  enabled: boolean;
  canvasRenderer: L.Canvas;
  onLoadingChange: (loading: boolean) => void;
}

export function CyclewaysLayer({ enabled, canvasRenderer, onLoadingChange }: Props) {
  const map = useMap();
  const [items, setItems] = useState<readonly Cycleway[] | null>(null);

  useEffect(() => {
    if (!enabled || items) return;
    onLoadingChange(true);
    let cancelled = false;
    void loadCycleways()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .finally(() => {
        if (!cancelled) onLoadingChange(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, items, onLoadingChange]);

  useEffect(() => {
    if (!enabled || !items) return;
    const group = L.featureGroup();
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
    return () => {
      group.remove();
    };
  }, [enabled, items, canvasRenderer, map]);

  return null;
}

const KIND_LABEL: Record<CyclewayKind, string> = {
  segregated: 'Ciclovía segregada',
  shared: 'Ruta compartida',
  lane: 'Ciclobanda en calzada',
};
