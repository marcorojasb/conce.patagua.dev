// Establecimientos educacionales (kindergarten / school / college /
// university), puntos con marcador. Capa lazy, render imperativo.

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { School, SchoolKind } from '@/data/schools.generated';
import type { LayerStatusControls } from '@/hooks/use-layer-status';

const KIND_COLOR: Record<SchoolKind, string> = {
  kindergarten: '#f59e0b', // amber
  school: '#dc2626', // red, los más comunes y más relevantes para política
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
  loadStatus: LayerStatusControls;
}

export function SchoolsLayer({
  enabled,
  canvasRenderer,
  retryKey,
  loadStatus,
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
      loadStatus.succeed();
    };

    if (dataCache) {
      draw(dataCache);
    } else {
      loadStatus.start();
      void loadSchools()
        .then(draw)
        .catch((err) => {
          dataPromise = null;
          if (!cancelled) {
            loadStatus.fail(err, 'No se pudo cargar educación');
          }
        });
    }

    return () => {
      cancelled = true;
      group.remove();
    };
  }, [enabled, canvasRenderer, map, loadStatus, retryKey]);

  return null;
}
