// Los pocos marcadores DOM que quedan en el mapa (≤ ~120 con todas las capas):
// el paradero abierto, los pines del planificador, terminales, puntos de
// interés y estaciones de calidad del aire. Trazados, paradas, paraderos y
// micros van en canvas.
//
// Los íconos salen de un caché a nivel de módulo (clave tipo|color|activo) y
// las posiciones se memorizan: un render de App no reemplaza el DOM de ningún
// marcador. La terminal o el punto de interés elegido se dibuja aunque su capa
// esté apagada. Eligiendo un punto del planificador, tocar un marcador fija el
// punto ahí y no abre su ficha.

import { memo, useMemo, type RefObject } from 'react';
import { Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { STOPS, ROUTES_BY_ID } from '@/data/routes';
import { GTFS_STOPS } from '@/data/gtfs-stops.generated';
import { TERMINALS } from '@/data/terminals.generated';
import { POIS } from '@/data/pois.generated';
import { categorize } from '@/hooks/use-air-quality';
import { hideMapTooltip, showMapTooltip } from '@/components/map/map-tooltip';
import type { RoutingResult } from '@/lib/routing';
import type { LatLng, MapLayersState, MapTarget, Selection } from '@/types/ui-contracts';
import type { AirQualityStation, PoiCategory } from '@/types/transport';

/** Lo que necesitan los manejadores de clic; vive en un ref para no rearmar marcadores. */
export interface MapActions {
  pick: 'a' | 'b' | null;
  onPick: (point: LatLng) => void;
  onSelect: (target: MapTarget) => void;
}

const BUILDING_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/></svg>';

const POI_SVG: Record<PoiCategory, string> = {
  hospital:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>',
  university:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  college:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  mall: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
};

const POI_COLOR: Record<PoiCategory, string> = {
  hospital: '#DC2626',
  university: '#2563EB',
  college: '#7C3AED',
  mall: '#EA580C',
};

const POI_LABEL: Record<PoiCategory, string> = {
  hospital: 'Hospital o clínica',
  university: 'Universidad',
  college: 'Instituto o CFT',
  mall: 'Centro comercial',
};

const iconCache = new Map<string, L.DivIcon>();

/** Un L.DivIcon por clave: el mismo objeto entre renders, así react-leaflet no toca el DOM. */
export function cachedIcon(key: string, make: () => L.DivIcon): L.DivIcon {
  let icon = iconCache.get(key);
  if (!icon) iconCache.set(key, (icon = make()));
  return icon;
}

// Los colores vienen de datasets propios, pero igual se filtra lo que entra a un style="".
function cssColor(color: string): string {
  return /^(#[0-9a-f]{3,8}|hsla?\([\d\s.,%deg-]+\))$/i.test(color) ? color : '#334155';
}

function stopIcon(color: string): L.DivIcon {
  return cachedIcon(`stop|${color}|active`, () =>
    L.divIcon({
      className: 'stop-marker-wrap',
      html: `<div class="stop-marker is-active" style="--stop-color:${cssColor(color)}"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    }),
  );
}

function pinIcon(label: 'A' | 'B' | 'M'): L.DivIcon {
  const color = label === 'A' ? '#16A34A' : label === 'B' ? '#DC2626' : '#7C3AED';
  return cachedIcon(`pin|${label}`, () =>
    L.divIcon({
      className: 'planner-pin-wrap',
      html: `<div class="planner-pin" style="--pin-bg:${color}">${label}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    }),
  );
}

function terminalIcon(active: boolean): L.DivIcon {
  return cachedIcon(`terminal|${active}`, () =>
    L.divIcon({
      className: 'terminal-marker-wrap',
      html: `<div class="terminal-marker${active ? ' is-active' : ''}">${BUILDING_SVG}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    }),
  );
}

function poiIcon(category: PoiCategory, active: boolean): L.DivIcon {
  return cachedIcon(`poi|${category}|${active}`, () =>
    L.divIcon({
      className: 'poi-marker-wrap',
      html: `<div class="poi-marker${active ? ' is-active' : ''}" style="--poi-bg:${POI_COLOR[category]};--poi-fg:#fff">${POI_SVG[category]}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    }),
  );
}

function aqIcon(pm25: number | null): L.DivIcon {
  const { color } = categorize(pm25);
  const label = pm25 == null || !Number.isFinite(pm25) ? '·' : String(Math.round(pm25));
  return cachedIcon(`aq|${color}|${label}`, () =>
    L.divIcon({
      className: 'aq-marker-wrap',
      html: `<div class="aq-marker" style="--aq-color:${color}">${label}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    }),
  );
}

interface PointMarkerProps {
  lat: number;
  lng: number;
  icon: L.DivIcon;
  title: string;
  subtitle?: string;
  /** Qué abre el clic; null = nada (solo informa). */
  kind: 'terminal' | 'poi' | 'corridor' | 'planner' | null;
  id: string;
  actions: RefObject<MapActions>;
  zIndexOffset?: number;
}

/** Marcador interactivo con el tooltip compartido; eligiendo un punto, el clic es ese punto. */
export const PointMarker = memo(function PointMarker({
  lat,
  lng,
  icon,
  title,
  subtitle,
  kind,
  id,
  actions,
  zIndexOffset,
}: PointMarkerProps) {
  const map = useMap();
  const position = useMemo<L.LatLngTuple>(() => [lat, lng], [lat, lng]);
  const handlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      click: (e) => {
        const current = actions.current;
        hideMapTooltip(map);
        if (current.pick) current.onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
        else if (kind === 'planner') current.onSelect({ kind });
        else if (kind) current.onSelect({ kind, id });
      },
      mouseover: () => {
        if (!actions.current.pick) showMapTooltip(map, position, title, subtitle);
      },
      mouseout: () => hideMapTooltip(map, 'feature'),
    }),
    [map, position, title, subtitle, kind, id, actions],
  );
  return (
    <Marker position={position} icon={icon} eventHandlers={handlers} keyboard={false} zIndexOffset={zIndexOffset} />
  );
});

/** Marcador que no recibe eventos: el clic pasa a lo que haya debajo (paradero, línea, mapa). */
const StaticMarker = memo(function StaticMarker({
  lat,
  lng,
  icon,
  zIndexOffset,
}: {
  lat: number;
  lng: number;
  icon: L.DivIcon;
  zIndexOffset?: number;
}) {
  const position = useMemo<L.LatLngTuple>(() => [lat, lng], [lat, lng]);
  return <Marker position={position} icon={icon} interactive={false} keyboard={false} zIndexOffset={zIndexOffset} />;
});

/** Paradero abierto: siempre marcado, aunque ninguno de sus recorridos esté en el mapa. */
function SelectedStopMarker({ stopId }: { stopId: string }) {
  const stop = STOPS.find((s) => s.id === stopId) ?? GTFS_STOPS.find((p) => p.id === stopId);
  if (!stop) return null;
  const routeId = 'routes' in stop ? stop.routes[0] : undefined;
  const color = (routeId && ROUTES_BY_ID.get(routeId)?.color) || '#334155';
  return <StaticMarker lat={stop.lat} lng={stop.lng} icon={stopIcon(color)} zIndexOffset={500} />;
}

const MIDPOINT_PATH_OPTIONS: L.PathOptions = {
  color: '#7C3AED',
  weight: 4,
  opacity: 0.85,
  dashArray: '6 6',
  lineCap: 'round',
  interactive: false,
};

/** A y B se tocan para volver al planificador (no quedan como pines mudos). */
const PlannerPins = memo(function PlannerPins({
  a,
  b,
  midpoint,
  actions,
}: {
  a: LatLng | null;
  b: LatLng | null;
  midpoint: RoutingResult | null;
  actions: RefObject<MapActions>;
}) {
  return (
    <>
      {midpoint && midpoint.path.length >= 2 && (
        <Polyline positions={midpoint.path} pathOptions={MIDPOINT_PATH_OPTIONS} />
      )}
      {midpoint && (
        <StaticMarker lat={midpoint.midpoint[0]} lng={midpoint.midpoint[1]} icon={pinIcon('M')} zIndexOffset={800} />
      )}
      {a && (
        <PointMarker
          lat={a.lat}
          lng={a.lng}
          icon={pinIcon('A')}
          title="Origen (A) del planificador"
          subtitle="Toca para ver el planificador"
          kind="planner"
          id="a"
          actions={actions}
          zIndexOffset={900}
        />
      )}
      {b && (
        <PointMarker
          lat={b.lat}
          lng={b.lng}
          icon={pinIcon('B')}
          title="Destino (B) del planificador"
          subtitle="Toca para ver el planificador"
          kind="planner"
          id="b"
          actions={actions}
          zIndexOffset={900}
        />
      )}
    </>
  );
});

const AirQualityMarkers = memo(function AirQualityMarkers({
  stations,
  actions,
}: {
  stations: readonly AirQualityStation[];
  actions: RefObject<MapActions>;
}) {
  return (
    <>
      {stations.map((s) => {
        const cat = categorize(s.pm25);
        const pm = s.pm25 != null && Number.isFinite(s.pm25) ? ` · PM2,5 ${Math.round(s.pm25)} µg/m³` : '';
        return (
          <PointMarker
            key={s.id}
            lat={s.lat}
            lng={s.lng}
            icon={aqIcon(s.pm25)}
            title={s.name}
            subtitle={`${s.comuna} · ${cat.label}${pm}`}
            kind={null}
            id={s.id}
            actions={actions}
          />
        );
      })}
    </>
  );
});

interface MapMarkersProps {
  selection: Selection | null;
  layers: MapLayersState;
  airQuality: readonly AirQualityStation[];
  planner: { a: LatLng | null; b: LatLng | null; midpoint: RoutingResult | null };
  actions: RefObject<MapActions>;
}

export const MapMarkers = memo(function MapMarkers({ selection, layers, airQuality, planner, actions }: MapMarkersProps) {
  const selectedTerminal = selection?.kind === 'terminal' ? selection.id : null;
  const selectedPoi = selection?.kind === 'poi' ? selection.id : null;
  const terminals = useMemo(
    () => (layers.terminals ? TERMINALS : TERMINALS.filter((t) => t.id === selectedTerminal)),
    [layers.terminals, selectedTerminal],
  );
  const pois = useMemo(
    () => (layers.pois ? POIS : POIS.filter((p) => p.id === selectedPoi)),
    [layers.pois, selectedPoi],
  );
  return (
    <>
      {terminals.map((t) => (
        <PointMarker
          key={t.id}
          lat={t.lat}
          lng={t.lng}
          icon={terminalIcon(t.id === selectedTerminal)}
          title={t.name}
          subtitle="Terminal · toca para ver detalles"
          kind="terminal"
          id={t.id}
          actions={actions}
        />
      ))}
      {pois.map((p) => (
        <PointMarker
          key={p.id}
          lat={p.lat}
          lng={p.lng}
          icon={poiIcon(p.category, p.id === selectedPoi)}
          title={p.name}
          subtitle={`${POI_LABEL[p.category]} · toca para ver cómo llegar`}
          kind="poi"
          id={p.id}
          actions={actions}
        />
      ))}
      {layers.airQuality && <AirQualityMarkers stations={airQuality} actions={actions} />}
      {selection?.kind === 'stop' && <SelectedStopMarker stopId={selection.id} />}
      <PlannerPins a={planner.a} b={planner.b} midpoint={planner.midpoint} actions={actions} />
    </>
  );
});
