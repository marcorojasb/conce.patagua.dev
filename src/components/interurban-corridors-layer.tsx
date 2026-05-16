// Corredores interurbanos — overlay opcional que dibuja un pin grande
// por cada servicio licitado documentado en el wiki que NO está en el
// feed GTFS urbano (Santa Juana, Florida, Yumbel, Tomé rural, etc.).
//
// Cada pin abre un tooltip persistente con título, operador/estado y un
// link "Ver en el wiki →". Si el corredor tiene también un terminal
// urbano conocido, dibujamos una línea discontinua entre ambos para
// sugerir que existe servicio en el corredor — NO un trazado real del
// GTFS (eso lo aclara el tooltip).
//
// Render imperativo (Leaflet plano) por consistencia con coverage/
// cycleways/paraderos y para que el popup pueda contener HTML/links que
// react-leaflet's <Popup> requeriría montar fuera del tree del mapa.

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { INTERURBAN_CORRIDORS } from '@/data/interurban-corridors';
import { wikiUrl } from '@/wiki/map-links';

interface Props {
  enabled: boolean;
  /** Notifica al padre cuando el usuario clickea un corredor — para que
   * el visor pueda centrar el mapa en ese par origen-destino. */
  onSelectCorridor?: (corridorId: string) => void;
}

function corridorIcon(color: string, code: string): L.DivIcon {
  return L.divIcon({
    className: 'interurban-pin-wrap',
    html: `<div class="interurban-pin" style="--pin-bg:${color}" title="${code}">${escapeHtml(code)}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[c]!;
  });
}

export function InterurbanCorridorsLayer({ enabled, onSelectCorridor }: Props) {
  const map = useMap();
  // Cache the callback in a ref so we can rebuild markers only when
  // `enabled` flips, not on every parent re-render.
  const onSelectRef = useRef(onSelectCorridor);
  useEffect(() => {
    onSelectRef.current = onSelectCorridor;
  }, [onSelectCorridor]);

  useEffect(() => {
    if (!enabled) return;
    const group = L.featureGroup();

    for (const c of INTERURBAN_CORRIDORS) {
      // Short label for the pin glyph (route number or first 3 chars).
      const labelMatch = c.title.match(/Ruta\s+(\w+)/i);
      const label = labelMatch?.[1] ?? c.id.slice(0, 3).toUpperCase();

      // Dashed connector when we know the urban end of the corridor.
      if (c.terminal) {
        const connector = L.polyline([c.terminal, c.anchor], {
          color: c.color,
          weight: 3,
          opacity: 0.55,
          dashArray: '8 8',
          lineCap: 'round',
          interactive: false,
        });
        group.addLayer(connector);
      }

      const marker = L.marker(c.anchor, {
        icon: corridorIcon(c.color, label),
        keyboard: false,
      });

      const slugUrl = wikiUrl(c.wikiSlug);
      const popupHtml = `
        <div class="interurban-popup">
          <div class="text-[11px] uppercase tracking-wider text-muted-foreground">Corredor interurbano</div>
          <div class="text-sm font-semibold leading-tight" style="margin-top:2px">${escapeHtml(c.title)}</div>
          <div class="text-[12px] text-muted-foreground" style="margin-top:4px">${escapeHtml(c.subtitle)}</div>
          <div style="margin-top:8px">
            <a href="${slugUrl}" class="interurban-popup-link">Ver en el wiki →</a>
          </div>
          <div class="text-[10px] text-muted-foreground" style="margin-top:6px;line-height:1.4">
            Fuera del GTFS urbano · pin sobre coordenada referencial de OSM
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml, {
        maxWidth: 260,
        className: 'interurban-popup-wrap',
      });
      marker.bindTooltip(c.title, { direction: 'top', offset: [0, -34], opacity: 0.95 });
      marker.on('click', () => {
        marker.openPopup();
        onSelectRef.current?.(c.id);
      });
      group.addLayer(marker);
    }

    group.addTo(map);
    return () => {
      group.remove();
    };
  }, [enabled, map]);

  return null;
}
