// Establecimientos educacionales (kindergarten / school / college /
// university) — puntos con marcador. Capa lazy, render imperativo.

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { School, SchoolKind } from '@/data/schools.generated';

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

let dataPromise: Promise<readonly School[]> | null = null;
function loadSchools(): Promise<readonly School[]> {
  dataPromise ??= import('@/data/schools.generated').then((mod) => mod.SCHOOLS);
  return dataPromise;
}

interface Props {
  enabled: boolean;
  canvasRenderer: L.Canvas;
  onLoadingChange: (loading: boolean) => void;
}

export function SchoolsLayer({ enabled, canvasRenderer, onLoadingChange }: Props) {
  const map = useMap();
  const [items, setItems] = useState<readonly School[] | null>(null);

  useEffect(() => {
    if (!enabled || items) return;
    onLoadingChange(true);
    let cancelled = false;
    void loadSchools()
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
    return () => {
      group.remove();
    };
  }, [enabled, items, canvasRenderer, map]);

  return null;
}
