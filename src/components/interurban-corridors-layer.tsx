// Corredores interurbanos que NO están en el GTFS oficial (hoy Florida y
// Yumbel, operados por privados sin licitación DTPR): un pin por corredor y,
// si se conoce su terminal urbano, una línea discontinua hasta él que sugiere
// el servicio sin afirmar un trazado real.
//
// El pin no abre un popup: el clic elige el corredor y su ficha (enlace al
// wiki incluido) se abre en la superficie de siempre, como cualquier otra
// selección; así Atrás la cierra. El corredor elegido se dibuja aunque la capa
// esté apagada.

import { memo, useMemo, type RefObject } from 'react';
import { Polyline } from 'react-leaflet';
import L from 'leaflet';
import { INTERURBAN_CORRIDORS, type InterurbanCorridor } from '@/data/interurban-corridors';
import { PointMarker, cachedIcon, type MapActions } from '@/components/map/map-markers';

interface Props {
  enabled: boolean;
  selectedId: string | null;
  actions: RefObject<MapActions>;
}

function corridorLabel(corridor: InterurbanCorridor): string {
  // Número de ruta del título ("Ruta 146") o el destino del id: todos salen de
  // Concepción ("concepcion-florida" → "FLO"), así cada pin dice a dónde va.
  const destination = corridor.id.split('-').at(-1) ?? corridor.id;
  return corridor.title.match(/Ruta\s+(\w+)/i)?.[1] ?? destination.slice(0, 3).toUpperCase();
}

/** HTML del pin de un corredor: lo usan el mapa y la leyenda (map-swatches.tsx). */
export function corridorPinHtml(corridor: InterurbanCorridor, active: boolean): string {
  const label = corridorLabel(corridor).replace(/[^\w-]/g, '');
  // Sin GTFS: neutro (zinc-600), nunca el color de una línea con trazado oficial.
  const color = /^#[0-9a-f]{3,8}$/i.test(corridor.color) ? corridor.color : '#52525b';
  return `<div class="interurban-pin${active ? ' is-active' : ''}" style="--pin-bg:${color}">${label}</div>`;
}

function corridorIcon(corridor: InterurbanCorridor, active: boolean): L.DivIcon {
  return cachedIcon(`corridor|${corridor.id}|${active}`, () =>
    L.divIcon({
      className: 'interurban-pin-wrap',
      html: corridorPinHtml(corridor, active),
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    }),
  );
}

function connectorOptions(color: string): L.PathOptions {
  return { color, weight: 3, opacity: 0.55, dashArray: '8 8', lineCap: 'round', interactive: false };
}

const CorridorConnector = memo(function CorridorConnector({ corridor }: { corridor: InterurbanCorridor }) {
  const positions = useMemo<L.LatLngTuple[] | null>(
    () => (corridor.terminal ? [corridor.terminal, corridor.anchor] : null),
    [corridor],
  );
  const options = useMemo(() => connectorOptions(corridor.color), [corridor.color]);
  if (!positions) return null;
  return <Polyline positions={positions} pathOptions={options} />;
});

export const InterurbanCorridorsLayer = memo(function InterurbanCorridorsLayer({ enabled, selectedId, actions }: Props) {
  const corridors = useMemo(
    () => (enabled ? INTERURBAN_CORRIDORS : INTERURBAN_CORRIDORS.filter((c) => c.id === selectedId)),
    [enabled, selectedId],
  );
  return (
    <>
      {corridors.map((c) => (
        <CorridorConnector key={`connector-${c.id}`} corridor={c} />
      ))}
      {corridors.map((c) => (
        <PointMarker
          key={c.id}
          lat={c.anchor[0]}
          lng={c.anchor[1]}
          icon={corridorIcon(c, c.id === selectedId)}
          title={c.title}
          subtitle={`${c.subtitle} · toca para ver el corredor`}
          kind="corridor"
          id={c.id}
          actions={actions}
          zIndexOffset={300}
        />
      ))}
    </>
  );
});
