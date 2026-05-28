// Establecimientos educacionales (kindergarten / school / college /
// university) — puntos con marcador. Capa lazy, render imperativo.

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { School, SchoolKind } from '@/data/schools.generated';
import type { LayerLoadStatus } from '@/hooks/use-layer-status';

const KIND_COLOR: Record<SchoolKind, string> = {
  kindergarten: '#f59e0b', // amber
  school: '#dc2626', // red — los más comunes y más relevantes para política
  college: '#7c3aed', // violet
  university: '#2563eb', // blue
};

const KIND_LABEL: Record<SchoolKind, string> = {
  kindergarten: 'Jardín infantil',
  school: 'Colegio',
  college: 'Liceo / técnico',
  university: 'Universidad',
};

let dataCache: readonly School[] | null = null;
let dataPromise: Promise<readonly School[]> | null = null;
function loadSchools(): Promise<readonly School[]> {
  if (dataCache) return Promise.resolve(dataCache);
  dataPromise ??= import('@/data/schools.generated').then((mod) => {
    dataCache = mod.SCHOOLS;
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

export function SchoolsLayer({
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

    const draw = (items: readonly School[]) => {
      if (cancelled) return;
      for (const s of items) {
        const color = KIND_COLOR[s.kind];
        const tooltip = `${s.name} · ${KIND_LABEL[s.kind]}${
          s.operator ? ` · ${s.operator}` : ''
        }${s.religion && s.religion !== 'none' ? ` · ${s.religion}` : ''}`;
        const marker = L.circleMarker([s.lat, s.lng], {
          radius: s.kind === 'university' ? 6 : s.kind === 'school' ? 4.5 : 3.5,
          color: '#ffffff',
          weight: 1.2,
          fillColor: color,
          fillOpacity: 0.92,
          renderer: canvasRenderer,
        });
        marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -4], opacity: 0.95 });
        group.addLayer(marker);
      }
      group.addTo(map);
      onStatusChange({ loading: false, error: null, ready: true });
    };

    if (dataCache) {
      draw(dataCache);
    } else {
      onStatusChange({ loading: true, error: null, ready: false });
      void loadSchools()
        .then(draw)
        .catch((err) => {
          dataPromise = null;
          if (!cancelled) {
            onStatusChange({
              loading: false,
              error: err instanceof Error ? err.message : 'No se pudo cargar educación',
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
