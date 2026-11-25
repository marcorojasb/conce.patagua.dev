// Capa de paraderos GTFS: ~2.100 puntos en el canvas compartido del mapa.
//
// Los marcadores se crean una vez cada vez que se enciende la capa y después
// solo cambian de estilo en el lugar (paradero abierto, atenuado con un
// recorrido destacado, tema): antes cada cambio de selección los recreaba
// todos. Se ven desde zoom 14; la capa escucha el zoom por su cuenta, sin
// pasar por React. Los colores son los del tema fijos en código: al cambiar de
// tema, el efecto de esta capa corre antes de que App cambie la clase .dark,
// así que leer las variables CSS daría los del tema anterior.

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { GTFS_STOPS } from '@/data/gtfs-stops.generated';
import { bindMapTooltip, hideMapTooltip } from '@/components/map/map-tooltip';
import type { MapActions } from '@/components/map/map-markers';
import type { Theme } from '@/types/transport';

export const PARADEROS_MIN_ZOOM = 14;

const COLORS: Record<Theme, { fg: string; muted: string; bg: string }> = {
  light: { fg: '#09090b', muted: '#71717a', bg: '#ffffff' },
  dark: { fg: '#fafafa', muted: '#a1a1aa', bg: '#09090b' },
};

interface Props {
  enabled: boolean;
  selectedId: string | null;
  /** Hay recorridos destacados: los paraderos quedan en segundo plano. */
  dim: boolean;
  theme: Theme;
  actions: RefObject<MapActions>;
}

interface Applied {
  selectedId: string | null;
  dim: boolean;
  theme: Theme;
}

function styleFor(selected: boolean, dim: boolean, theme: Theme): L.CircleMarkerOptions {
  const c = COLORS[theme];
  return selected
    ? { radius: 5, color: c.fg, weight: 2, fillColor: c.fg, fillOpacity: 1, opacity: 1 }
    : { radius: 3, color: c.muted, weight: 1, fillColor: c.bg, fillOpacity: 0.86, opacity: dim ? 0.55 : 0.9 };
}

function applyStyle(marker: L.CircleMarker, style: L.CircleMarkerOptions): void {
  marker.setStyle(style);
  if (style.radius != null) marker.setRadius(style.radius);
}

export function ParaderosLayer({ enabled, selectedId, dim, theme, actions }: Props) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.CircleMarker> | null>(null);
  const appliedRef = useRef<Applied | null>(null);
  // Lo pedido en el último render: al encender la capa se crea ya con ese estilo.
  const wantedRef = useRef<Applied>({ selectedId, dim, theme });
  useLayoutEffect(() => {
    wantedRef.current = { selectedId, dim, theme };
  }, [selectedId, dim, theme]);

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup -- El cleanup quita los listeners de zoom y de cada marcador y saca el grupo del mapa.
  useEffect(() => {
    if (!enabled) return;
    const group = L.featureGroup();
    const markers = new Map<string, L.CircleMarker>();
    const wanted = wantedRef.current;
    for (const p of GTFS_STOPS) {
      const marker = L.circleMarker([p.lat, p.lng], styleFor(p.id === wanted.selectedId, wanted.dim, wanted.theme));
      marker.on('click', () => {
        hideMapTooltip(map);
        actions.current.onSelect({ kind: 'stop', id: p.id });
      });
      bindMapTooltip(marker, map, () => ({
        primary: p.name ?? 'Paradero',
        secondary: 'Paradero · toca para ver llegadas',
        at: [p.lat, p.lng],
      }));
      markers.set(p.id, marker);
      group.addLayer(marker);
    }
    markersRef.current = markers;
    appliedRef.current = wanted;
    const syncZoom = () => {
      const show = map.getZoom() >= PARADEROS_MIN_ZOOM;
      if (show && !map.hasLayer(group)) {
        group.addTo(map);
        const selected = appliedRef.current?.selectedId;
        if (selected) markers.get(selected)?.bringToFront();
      } else if (!show && map.hasLayer(group)) {
        group.remove();
      }
    };
    syncZoom();
    map.on('zoomend', syncZoom);
    return () => {
      map.off('zoomend', syncZoom);
      group.eachLayer((layer) => {
        layer.off();
      });
      group.remove();
      markersRef.current = null;
      appliedRef.current = null;
    };
  }, [enabled, map, actions]);

  // Estilos en el lugar: todo si cambia el tema o la atenuación; si no, solo
  // el paradero que se deja y el que se abre.
  useEffect(() => {
    const markers = markersRef.current;
    const applied = appliedRef.current;
    if (!markers || !applied) return;
    if (applied.selectedId === selectedId && applied.dim === dim && applied.theme === theme) return;
    if (applied.dim !== dim || applied.theme !== theme) {
      for (const [id, marker] of markers) applyStyle(marker, styleFor(id === selectedId, dim, theme));
    } else if (applied.selectedId !== selectedId) {
      const previous = applied.selectedId ? markers.get(applied.selectedId) : undefined;
      if (previous) applyStyle(previous, styleFor(false, dim, theme));
    }
    const current = selectedId ? markers.get(selectedId) : undefined;
    if (current) {
      applyStyle(current, styleFor(true, dim, theme));
      current.bringToFront();
    }
    appliedRef.current = { selectedId, dim, theme };
  }, [enabled, selectedId, dim, theme]);

  return null;
}
