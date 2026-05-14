import { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip as LeafletTooltip,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L, { type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CONCE_CENTER } from '@/data/routes';
import type { FlyToToken, Route, Theme } from '@/types/transport';

interface ConceMapProps {
  theme: Theme;
  routes: Route[];
  visibleRouteIds: string[];
  selectedRouteId: string | null;
  selectedStopId: string | null;
  onSelectRoute: (id: string) => void;
  onSelectStop: (id: string) => void;
  flyToToken: FlyToToken | null;
}

const TILE_URL = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function FlyToOnToken({ token }: { token: FlyToToken | null }) {
  const map = useMap();
  useEffect(() => {
    if (!token) return;
    if (token.target.kind === 'bounds') {
      const bounds = L.latLngBounds(token.target.path);
      map.flyToBounds(bounds, { padding: [60, 60], duration: 0.7 });
    } else {
      map.flyTo([token.target.lat, token.target.lng], token.target.zoom ?? map.getZoom(), {
        duration: 0.7,
      });
    }
  }, [token, map]);
  return null;
}

function InvalidateOnResize({ trigger }: { trigger: unknown }) {
  const map = useMap();
  useEffect(() => {
    const id = window.setInterval(() => map.invalidateSize(), 320);
    const stop = window.setTimeout(() => window.clearInterval(id), 1000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [trigger, map]);
  return null;
}

function stopIcon(color: string, active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'stop-marker-wrap',
    html: `<div class="stop-marker ${active ? 'is-active' : ''}" style="--stop-color:${color}"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export function ConceMap({
  theme,
  routes,
  visibleRouteIds,
  selectedRouteId,
  selectedStopId,
  onSelectRoute,
  onSelectStop,
  flyToToken,
}: ConceMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => mapRef.current?.invalidateSize(), 50);
    return () => window.clearTimeout(id);
  }, []);

  const visibleRoutes = useMemo(
    () => routes.filter((r) => visibleRouteIds.includes(r.id)),
    [routes, visibleRouteIds],
  );

  const drawnStops = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ stop: Route['stops'][number]; color: string }> = [];
    for (const r of visibleRoutes) {
      for (const s of r.stops) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        list.push({ stop: s, color: r.color });
      }
    }
    return list;
  }, [visibleRoutes]);

  return (
    <MapContainer
      ref={(instance) => {
        mapRef.current = instance;
      }}
      center={[CONCE_CENTER.lat, CONCE_CENTER.lng]}
      zoom={13}
      zoomControl={false}
      attributionControl
      className="absolute inset-0"
    >
      <TileLayer key={theme} url={TILE_URL[theme]} attribution={ATTRIBUTION} maxZoom={19} />
      <ZoomControl position="bottomright" />

      {visibleRoutes.map((r) => {
        const isSelected = selectedRouteId === r.id;
        return (
          <Polyline
            key={r.id}
            positions={r.path}
            pathOptions={{
              color: r.color,
              weight: isSelected ? 6 : 4,
              opacity: isSelected ? 1 : 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
            eventHandlers={{ click: () => onSelectRoute(r.id) }}
          />
        );
      })}

      {drawnStops.map(({ stop, color }) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lng]}
          icon={stopIcon(color, selectedStopId === stop.id)}
          eventHandlers={{ click: () => onSelectStop(stop.id) }}
          keyboard={false}
        >
          <LeafletTooltip direction="top" offset={[0, -6]} opacity={0.95}>
            {stop.name}
          </LeafletTooltip>
        </Marker>
      ))}

      <FlyToOnToken token={flyToToken} />
      <InvalidateOnResize trigger={visibleRoutes.length} />
    </MapContainer>
  );
}
