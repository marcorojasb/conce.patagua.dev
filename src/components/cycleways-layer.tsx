// Cycling infrastructure layer for the visor, segregated cycleways,
// shared paths, and on-road bike lanes from OSM.
//
// Uses imperative Leaflet (L.featureGroup + L.polyline on the map's single
// default canvas) instead of react-leaflet so the 460+ polylines don't pay
// reconciliation cost on every parent render. Same pattern as
// coverage-layer.tsx. The dataset is lazy-loaded, chunk only downloads
// the first time the layer is enabled. Hover uses the map's shared tooltip.

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Cycleway, CyclewayKind } from '@/data/cycleways.generated';
import type { LayerStatusControls } from '@/hooks/use-layer-status';
import { bindMapTooltip } from '@/components/map/map-tooltip';

// Color encoding by kind, segregated stands out (the gold standard for
// safety), shared is muted (less reliable infra), lane is in-between. The
// map legend draws its key from this same table.
export const CYCLEWAY_KIND_STYLE: Record<CyclewayKind, { color: string; weight: number; dash?: string; label: string }> = {
  segregated: { color: '#2563eb', weight: 3, label: 'Ciclovía segregada' }, // blue-600
  lane: { color: '#06b6d4', weight: 2, label: 'Ciclobanda en calzada' }, // cyan-500
  shared: { color: '#6366f1', weight: 2.5, dash: '4 4', label: 'Ruta compartida' }, // indigo-500 dashed
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
  retryKey: number;
  loadStatus: LayerStatusControls;
}

export function CyclewaysLayer({
  enabled,
  retryKey,
  loadStatus,
}: Props) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const group = L.featureGroup();

    const draw = (items: readonly Cycleway[]) => {
      if (cancelled) return;
      for (const c of items) {
        const style = CYCLEWAY_KIND_STYLE[c.kind];
        const detail = `${style.label}${c.surface ? ` · ${c.surface}` : ''}`;
        const primary = c.name ?? style.label;
        const secondary = c.name ? detail : c.surface ?? undefined;
        const line = L.polyline(c.path, {
          color: style.color,
          weight: style.weight,
          opacity: 0.85,
          dashArray: style.dash,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: true,
        });
        bindMapTooltip(line, map, () => ({ primary, secondary }), { sticky: true });
        group.addLayer(line);
      }
      group.addTo(map);
      group.bringToBack();
      loadStatus.succeed();
    };

    if (dataCache) {
      draw(dataCache);
    } else {
      loadStatus.start();
      void loadCycleways()
        .then(draw)
        .catch((err) => {
          dataPromise = null;
          if (!cancelled) {
            loadStatus.fail(err, 'No se pudo cargar ciclovías');
          }
        });
    }

    return () => {
      cancelled = true;
      group.eachLayer((layer) => {
        layer.off();
      });
      group.remove();
    };
  }, [enabled, map, loadStatus, retryKey]);

  return null;
}
