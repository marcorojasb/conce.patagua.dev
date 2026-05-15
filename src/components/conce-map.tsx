import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
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
  SimulatedVehicle,
  Terminal,
  Theme,
} from '@/types/transport';
import type { RoutingResult } from '@/lib/routing';
import { categorize } from '@/hooks/use-air-quality';
import { CoverageLayer } from '@/components/coverage-layer';
import { CyclewaysLayer } from '@/components/cycleways-layer';
import { ParaderosLayer } from '@/components/paraderos-layer';

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
  selectedParaderoId: string | null;
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
  simulatedVehicles: SimulatedVehicle[];
  routeColorById: Map<string, string>;
  onSelectSimulatedVehicle: (id: string) => void;
  showCoverage: boolean;
  coverageThreshold: 'all' | 'underserved';
  onCoverageLoadingChange: (loading: boolean) => void;
  showCycleways: boolean;
  onCyclewaysLoadingChange: (loading: boolean) => void;
  // Optional: notifies the parent of the current visible bbox so features
  // like wallpaper export can render the same frame the user is seeing.
  onBoundsChange?: (bounds: [[number, number], [number, number]]) => void;
  // Walking midpoint result drawn on top of the route layer (path + M marker).
  plannerMidpoint?: RoutingResult | null;
}

const TILE_URL = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

// Attribution is split into two pieces: the abbreviated form always renders;
// the long form (with "Subsecretaría de Transportes (Chile)" disclaimer) is
// CSS-hidden in narrow viewports to avoid a 2-line wrap that clutters the
// map's bottom edge on phones. License obligations are still met because
// the Data Sources sheet carries the full credit.
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com/attributions">CARTO</a> · GTFS Gran Concepción <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a><span class="attr-long"> Subsecretaría de Transportes (Chile)</span>';

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
    let cancelled = false;
    // Respect users who asked the OS to reduce motion — vestibular sensitive
    // users find auto-panning jarring. We skip the animation and snap.
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Leaflet's flyTo/flyToBounds animate via requestAnimationFrame and
    // unproject coordinates against the map's pixel size. When the container
    // hasn't laid out yet (size = 0×0), unprojection produces NaN and the
    // whole tree crashes. We poll briefly for a non-zero size before flying.
    const tryFly = () => {
      if (cancelled) return;
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) {
        requestAnimationFrame(tryFly);
        return;
      }
      if (token.target.kind === 'bounds') {
        const bounds = L.latLngBounds(token.target.path);
        if (reduceMotion) {
          map.fitBounds(bounds, { padding: [60, 60], animate: false });
        } else {
          map.flyToBounds(bounds, { padding: [60, 60], duration: 0.7 });
        }
      } else {
        const center: [number, number] = [token.target.lat, token.target.lng];
        const zoom = token.target.zoom ?? map.getZoom();
        if (reduceMotion) {
          map.setView(center, zoom, { animate: false });
        } else {
          map.flyTo(center, zoom, { duration: 0.7 });
        }
      }
    };
    tryFly();
    return () => {
      cancelled = true;
    };
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

function midpointIcon(): L.DivIcon {
  return L.divIcon({
    className: 'planner-pin-wrap',
    html: `<div class="planner-pin" style="--pin-bg:#7C3AED">M</div>`,
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

function ZoomWatcher({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend() {
      onZoom(map.getZoom());
    },
  });
  useEffect(() => {
    onZoom(map.getZoom());
  }, [map, onZoom]);
  return null;
}

function BoundsTracker({
  onChange,
}: {
  onChange: (bounds: [[number, number], [number, number]]) => void;
}) {
  const fire = (b: L.LatLngBounds) =>
    onChange([
      [b.getSouth(), b.getWest()],
      [b.getNorth(), b.getEast()],
    ]);
  const map = useMapEvents({
    moveend() {
      fire(map.getBounds());
    },
    zoomend() {
      fire(map.getBounds());
    },
  });
  useEffect(() => {
    fire(map.getBounds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
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
  selectedParaderoId,
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
  simulatedVehicles,
  routeColorById,
  onSelectSimulatedVehicle,
  showCoverage,
  coverageThreshold,
  onCoverageLoadingChange,
  showCycleways,
  onCyclewaysLoadingChange,
  onBoundsChange,
  plannerMidpoint,
}: ConceMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    const id = window.setTimeout(() => mapRef.current?.invalidateSize(), 50);
    return () => window.clearTimeout(id);
  }, []);

  const visibleRoutes = useMemo(
    () => routes.filter((r) => visibleRouteIds.includes(r.id)),
    [routes, visibleRouteIds],
  );
  const selectedRoute = useMemo(
    () => visibleRoutes.find((r) => r.id === selectedRouteId) ?? null,
    [selectedRouteId, visibleRoutes],
  );

  const drawnStops = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ stop: Route['stops'][number]; color: string }> = [];
    const stopRoutes = selectedRoute ? [selectedRoute] : visibleRoutes;
    for (const r of stopRoutes) {
      for (const s of r.stops) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        list.push({ stop: s, color: r.color });
      }
    }
    return list;
  }, [selectedRoute, visibleRoutes]);

  // Shared canvas renderer keeps 1.7k paradero markers performant.
  const paraderoRenderer = useMemo(() => L.canvas({ padding: 0.2 }), []);
  const showParaderosAtCurrentZoom = showParaderos && zoom >= 14;
  const shouldDimForSelectedRoute = !!selectedRouteId;

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
      <ZoomWatcher onZoom={setZoom} />

      <CoverageLayer
        enabled={showCoverage}
        canvasRenderer={paraderoRenderer}
        threshold={coverageThreshold}
        onLoadingChange={onCoverageLoadingChange}
      />

      <CyclewaysLayer
        enabled={showCycleways}
        canvasRenderer={paraderoRenderer}
        onLoadingChange={onCyclewaysLoadingChange}
      />

      <ParaderosLayer
        enabled={showParaderosAtCurrentZoom}
        paraderos={paraderos}
        selectedId={selectedParaderoId}
        shouldDim={shouldDimForSelectedRoute}
        canvasRenderer={paraderoRenderer}
        onSelect={onSelectParadero}
      />

      {visibleRoutes.map((r) => {
        const isSelected = selectedRouteId === r.id;
        const muted = shouldDimForSelectedRoute && !isSelected;
        return (
          <Fragment key={r.id}>
            <Polyline
              positions={r.path}
              pathOptions={{
                color: theme === 'dark' ? '#020617' : '#ffffff',
                weight: isSelected ? 10 : 7,
                opacity: muted ? 0.08 : isSelected ? 0.7 : 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              interactive={false}
            />
            <Polyline
              positions={r.path}
              pathOptions={{
                color: r.color,
                weight: isSelected ? 6 : 4,
                opacity: muted ? 0.16 : isSelected ? 1 : 0.82,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={{ click: () => onSelectRoute(r.id) }}
            />
          </Fragment>
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

      {plannerMidpoint && plannerMidpoint.path.length >= 2 && (
        <Polyline
          key="planner-midpoint-path"
          positions={plannerMidpoint.path}
          pathOptions={{
            color: '#7C3AED',
            weight: 4,
            opacity: 0.85,
            dashArray: '6 6',
            lineCap: 'round',
          }}
        />
      )}
      {plannerMidpoint && (
        <Marker
          key="planner-midpoint"
          position={plannerMidpoint.midpoint}
          icon={midpointIcon()}
          keyboard={false}
        >
          <LeafletTooltip direction="top" offset={[0, -22]} opacity={0.95}>
            Punto medio caminando
          </LeafletTooltip>
        </Marker>
      )}

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

      {simulatedVehicles.length > 0 &&
        simulatedVehicles.map((v) => {
          const color = routeColorById.get(v.routeId) ?? '#0ea5e9';
          return (
            <CircleMarker
              key={v.id}
              center={[v.lat, v.lng]}
              radius={5}
              pathOptions={{
                color: '#ffffff',
                weight: 1.5,
                fillColor: color,
                fillOpacity: 0.95,
              }}
              renderer={paraderoRenderer}
              eventHandlers={{ click: () => onSelectSimulatedVehicle(v.id) }}
            >
              <LeafletTooltip
                direction="top"
                offset={[0, -6]}
                opacity={0.95}
                className="!text-[11px]"
              >
                Servicio en curso · {Math.round(v.progress * 100)}% del trayecto
              </LeafletTooltip>
            </CircleMarker>
          );
        })}

      <MapClickCapture enabled={pickerMode !== null} onPick={onPickPoint} />
      <FlyToOnToken token={flyToToken} />
      <InvalidateOnResize trigger={visibleRoutes.length} />
      {onBoundsChange && <BoundsTracker onChange={onBoundsChange} />}
    </MapContainer>
  );
}
