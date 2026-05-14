import { useEffect, useMemo, useRef } from 'react';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip as LeafletTooltip,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet';
import L, { type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CONCE_CENTER } from '@/data/routes';
import type {
  AirQualityStation,
  FlyToToken,
  Paradero,
  Poi,
  PoiCategory,
  Route,
  Terminal,
  Theme,
} from '@/types/transport';
import { categorize } from '@/hooks/use-air-quality';

interface ConceMapProps {
  theme: Theme;
  routes: Route[];
  visibleRouteIds: string[];
  selectedRouteId: string | null;
  selectedStopId: string | null;
  onSelectRoute: (id: string) => void;
  onSelectStop: (id: string) => void;
  flyToToken: FlyToToken | null;
  terminals: Terminal[];
  showTerminals: boolean;
  selectedTerminalId: string | null;
  onSelectTerminal: (id: string) => void;
  paraderos: Paradero[];
  showParaderos: boolean;
  onSelectParadero: (id: string) => void;
  pois: Poi[];
  showPois: boolean;
  selectedPoiId: string | null;
  onSelectPoi: (id: string) => void;
  airQuality: AirQualityStation[];
  showAirQuality: boolean;
  pickerMode: 'origin' | 'destination' | null;
  onPickPoint: (latlng: { lat: number; lng: number }) => void;
  plannerOrigin: { lat: number; lng: number } | null;
  plannerDestination: { lat: number; lng: number } | null;
}

const TILE_URL = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const BUILDING_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/></svg>';

const POI_SVG: Record<PoiCategory, string> = {
  hospital:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>',
  university:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  college:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  mall:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
};

const POI_COLOR: Record<PoiCategory, string> = {
  hospital: '#DC2626', // red-600
  university: '#2563EB', // blue-600
  college: '#7C3AED', // violet-600
  mall: '#EA580C', // orange-600
};

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

function MapClickCapture({
  enabled,
  onPick,
}: {
  enabled: boolean;
  onPick: (latlng: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function pinIcon(kind: 'origin' | 'destination'): L.DivIcon {
  const color = kind === 'origin' ? '#16A34A' : '#DC2626';
  const label = kind === 'origin' ? 'A' : 'B';
  return L.divIcon({
    className: 'planner-pin-wrap',
    html: `<div class="planner-pin" style="--pin-bg:${color}">${label}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
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

function terminalIcon(active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'terminal-marker-wrap',
    html: `<div class="terminal-marker ${active ? 'is-active' : ''}">${BUILDING_SVG}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function poiIcon(category: PoiCategory, active: boolean): L.DivIcon {
  const color = POI_COLOR[category];
  const html = `<div class="poi-marker ${active ? 'is-active' : ''}" style="--poi-bg:${color};--poi-fg:#fff">${POI_SVG[category]}</div>`;
  return L.divIcon({
    className: 'poi-marker-wrap',
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function aqIcon(pm25: number | null): L.DivIcon {
  const { color } = categorize(pm25);
  const label = pm25 == null ? '·' : String(Math.round(pm25));
  return L.divIcon({
    className: 'aq-marker-wrap',
    html: `<div class="aq-marker" style="--aq-color:${color}">${label}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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
  terminals,
  showTerminals,
  selectedTerminalId,
  onSelectTerminal,
  paraderos,
  showParaderos,
  onSelectParadero,
  pois,
  showPois,
  selectedPoiId,
  onSelectPoi,
  airQuality,
  showAirQuality,
  pickerMode,
  onPickPoint,
  plannerOrigin,
  plannerDestination,
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

  // Shared canvas renderer keeps 1.7k paradero markers performant.
  const paraderoRenderer = useMemo(() => L.canvas({ padding: 0.2 }), []);

  return (
    <MapContainer
      ref={(instance) => {
        mapRef.current = instance;
      }}
      center={[CONCE_CENTER.lat, CONCE_CENTER.lng]}
      zoom={13}
      zoomControl={false}
      attributionControl
      preferCanvas
      className="absolute inset-0"
    >
      <TileLayer key={theme} url={TILE_URL[theme]} attribution={ATTRIBUTION} maxZoom={19} />
      <ZoomControl position="bottomright" />

      {showParaderos &&
        paraderos.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={3}
            pathOptions={{
              color: 'hsl(var(--muted-foreground))',
              weight: 1,
              fillColor: 'hsl(var(--background))',
              fillOpacity: 0.85,
            }}
            renderer={paraderoRenderer}
            eventHandlers={{ click: () => onSelectParadero(p.id) }}
          >
            {p.name && (
              <LeafletTooltip direction="top" offset={[0, -3]} opacity={0.9}>
                {p.name}
              </LeafletTooltip>
            )}
          </CircleMarker>
        ))}

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

      {showTerminals &&
        terminals.map((t) => (
          <Marker
            key={t.id}
            position={[t.lat, t.lng]}
            icon={terminalIcon(selectedTerminalId === t.id)}
            eventHandlers={{ click: () => onSelectTerminal(t.id) }}
            keyboard={false}
          >
            <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.95}>
              {t.name}
            </LeafletTooltip>
          </Marker>
        ))}

      {showPois &&
        pois.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={poiIcon(p.category, selectedPoiId === p.id)}
            eventHandlers={{ click: () => onSelectPoi(p.id) }}
            keyboard={false}
          >
            <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.95}>
              {p.name}
            </LeafletTooltip>
          </Marker>
        ))}

      {showAirQuality &&
        airQuality.map((s) => {
          const cat = categorize(s.pm25);
          return (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={aqIcon(s.pm25)}
              keyboard={false}
            >
              <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-[11px]">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-muted-foreground">
                    {s.comuna} · {cat.label}
                    {s.pm25 != null && ` · PM2.5 ${Math.round(s.pm25)} µg/m³`}
                  </div>
                </div>
              </LeafletTooltip>
            </Marker>
          );
        })}

      {plannerOrigin && (
        <Marker
          key="planner-origin"
          position={[plannerOrigin.lat, plannerOrigin.lng]}
          icon={pinIcon('origin')}
          keyboard={false}
        >
          <LeafletTooltip direction="top" offset={[0, -22]} opacity={0.95}>
            Origen
          </LeafletTooltip>
        </Marker>
      )}
      {plannerDestination && (
        <Marker
          key="planner-destination"
          position={[plannerDestination.lat, plannerDestination.lng]}
          icon={pinIcon('destination')}
          keyboard={false}
        >
          <LeafletTooltip direction="top" offset={[0, -22]} opacity={0.95}>
            Destino
          </LeafletTooltip>
        </Marker>
      )}

      <MapClickCapture enabled={pickerMode !== null} onPick={onPickPoint} />
      <FlyToOnToken token={flyToToken} />
      <InvalidateOnResize trigger={visibleRoutes.length} />
    </MapContainer>
  );
}
