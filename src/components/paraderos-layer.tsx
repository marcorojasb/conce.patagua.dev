// Paraderos GTFS layer — 2110 points rendered imperatively via Leaflet
// instead of as react-leaflet <CircleMarker> children of <MapContainer>.
//
// Why: each tick of the simulated-vehicles state (every 4 s) re-renders
// <ConceMap>, which previously walked all 2110 <CircleMarker> children
// through React's reconciler — even though Leaflet's canvas renderer
// underneath does its own efficient drawing. This component owns its
// L.featureGroup outside React's tree, so it doesn't repaint until
// `paraderos`, `selectedId`, `shouldDim`, or `enabled` actually change.

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Paradero } from '@/types/transport';

interface Props {
  enabled: boolean;
  paraderos: Paradero[];
  selectedId: string | null;
  shouldDim: boolean;
  canvasRenderer: L.Canvas;
  onSelect: (id: string) => void;
}

function readColor(varName: string): string {
  if (typeof document === 'undefined') return '#888';
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `hsl(${v})` : '#888';
}

export function ParaderosLayer({
  enabled,
  paraderos,
  selectedId,
  shouldDim,
  canvasRenderer,
  onSelect,
}: Props) {
  const map = useMap();
  // Keep a stable handler ref to onSelect so we don't rebuild markers on
  // every render. The actual click target reads from this ref at call time.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!enabled) return;
    const group = L.featureGroup();
    // Resolve CSS variables once per build (they're theme-dependent).
    const fg = readColor('--foreground');
    const muted = readColor('--muted-foreground');
    const bg = readColor('--background');

    for (const p of paraderos) {
      const isSelected = selectedId === p.id;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: isSelected ? 5 : 3,
        color: isSelected ? fg : muted,
        weight: isSelected ? 2 : 1,
        fillColor: isSelected ? fg : bg,
        fillOpacity: isSelected ? 1 : 0.86,
        opacity: shouldDim ? 0.55 : 0.9,
        renderer: canvasRenderer,
      });
      if (p.name) {
        marker.bindTooltip(p.name, { direction: 'top', offset: [0, -3], opacity: 0.9 });
      }
      marker.on('click', () => onSelectRef.current(p.id));
      group.addLayer(marker);
    }
    group.addTo(map);
    return () => {
      group.remove();
    };
    // We intentionally rebuild on any of these changes — Leaflet markers
    // are cheap to recreate and avoiding granular per-marker mutation keeps
    // the code small. For perf compared to React the win is already huge
    // because we no longer reconcile 2110 elements on every parent render.
  }, [enabled, paraderos, selectedId, shouldDim, canvasRenderer, map]);

  return null;
}
