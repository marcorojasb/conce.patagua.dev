// Parques, jardines, plazas y reservas naturales — polígonos rellenos
// dibujados imperativamente con L.featureGroup + L.polygon en el canvas
// renderer compartido. Lazy-loaded chunk para no inflar el main bundle.

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GreenKind, GreenSpace } from '@/data/greenspace.generated';

const KIND_STYLE: Record<GreenKind, { fill: string; stroke: string }> = {
  // Parque "típico" — verde frondoso.
  park: { fill: 'rgba(34, 197, 94, 0.45)', stroke: 'rgba(21, 128, 61, 0.85)' },
  // Jardines / centros botánicos — verde más oscuro.
  garden: { fill: 'rgba(22, 163, 74, 0.4)', stroke: 'rgba(20, 83, 45, 0.8)' },
  // Plazas — más amarillento, indica pavimento.
  plaza: { fill: 'rgba(132, 204, 22, 0.4)', stroke: 'rgba(77, 124, 15, 0.8)' },
  // Bosques urbanos.
  forest: { fill: 'rgba(5, 150, 105, 0.5)', stroke: 'rgba(6, 95, 70, 0.85)' },
  // Reservas naturales (grandes, valoradas).
  nature_reserve: {
    fill: 'rgba(16, 185, 129, 0.45)',
    stroke: 'rgba(6, 78, 59, 0.85)',
  },
};

const KIND_LABEL: Record<GreenKind, string> = {
  park: 'Parque',
  garden: 'Jardín',
  plaza: 'Plaza',
  forest: 'Bosque',
  nature_reserve: 'Reserva natural',
};

let dataPromise: Promise<readonly GreenSpace[]> | null = null;
function loadGreenspace(): Promise<readonly GreenSpace[]> {
  dataPromise ??= import('@/data/greenspace.generated').then((mod) => mod.GREEN_SPACES);
  return dataPromise;
}

interface Props {
  enabled: boolean;
  canvasRenderer: L.Canvas;
  onLoadingChange: (loading: boolean) => void;
}

export function GreenspaceLayer({ enabled, canvasRenderer, onLoadingChange }: Props) {
  const map = useMap();
  const [items, setItems] = useState<readonly GreenSpace[] | null>(null);

  useEffect(() => {
    if (!enabled || items) return;
    onLoadingChange(true);
    let cancelled = false;
    void loadGreenspace()
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
    for (const g of items) {
      const style = KIND_STYLE[g.kind];
      const haKm2 = g.areaM2 / 10_000;
      const tooltip = g.name
        ? `${g.name} · ${KIND_LABEL[g.kind]} · ${haKm2.toFixed(1)} ha`
        : `${KIND_LABEL[g.kind]} · ${haKm2.toFixed(1)} ha`;
      const polygon = L.polygon(g.ring, {
        color: style.stroke,
        weight: 0.8,
        fillColor: style.fill,
        fillOpacity: 1, // alpha lives in the rgba above
        renderer: canvasRenderer,
        interactive: true,
      });
      polygon.bindTooltip(tooltip, { sticky: true, direction: 'top', opacity: 0.9 });
      group.addLayer(polygon);
    }
    group.addTo(map);
    // Background layer: stick under route polylines so paths read on top.
    group.bringToBack();
    return () => {
      group.remove();
    };
  }, [enabled, items, canvasRenderer, map]);

  return null;
}
