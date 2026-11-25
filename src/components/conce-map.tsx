// Mapa del visor. Todo lo que es vector (trazados y paradas de recorrido,
// paraderos, cobertura, ciclovías, áreas verdes, educación) va en el único
// canvas del mapa (preferCanvas con un solo `renderer`, creado una vez): un
// solo canvas recibe los clics, así que tocar una línea funciona aunque se
// hayan encendido otras capas antes. Ese canvas acepta el toque a 8 px de la
// línea con puntero grueso (dedo) y a 3 px con mouse; se decide con
// `(pointer: coarse)` y no con L.Browser.touch, que es verdadero en todo
// navegador de escritorio con PointerEvent. Las micros van en su propio
// canvas sin eventos (vehicle-canvas-layer.ts) y quedan pocos marcadores DOM
// (map-markers.tsx). Colores y formas por tema: map-paint.ts y map-theme.ts.
//
// Zoom, encuadre y gestos no pasan por React: las capas escuchan a Leaflet y
// el encuadre se publica en map-viewport.ts. El componente está envuelto en
// memo y los callbacks se leen desde un ref, así una identidad nueva de un
// callback nunca rearma capas.

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CONCE_CENTER, useRoutesVersion } from '@/data/routes';
import { CoverageLayer } from '@/components/coverage-layer';
import { CyclewaysLayer } from '@/components/cycleways-layer';
import { GreenspaceLayer } from '@/components/greenspace-layer';
import { InterurbanCorridorsLayer } from '@/components/interurban-corridors-layer';
import { ParaderosLayer } from '@/components/paraderos-layer';
import { SchoolsLayer } from '@/components/schools-layer';
import { MapMarkers, type MapActions } from '@/components/map/map-markers';
import { RouteNetworkLayer } from '@/components/map/route-network-layer';
import { VehicleCanvasLayer } from '@/components/map/vehicle-canvas-layer';
import { attachMapInteraction, type MapInteraction } from '@/components/map/map-interaction';
import { setMapViewport } from '@/lib/map-viewport';
import type { ConceMapProps, MapFocus, VehicleFeed } from '@/types/ui-contracts';
import type { FlyToToken, Theme } from '@/types/transport';

// Esri Gray Canvas. CARTO pasó sus basemaps a un modelo con API key en 2026:
// los tiles de `basemaps.cartocdn.com` siguen respondiendo 200 pero devuelven
// una imagen con marca de agua "API KEY REQUIRED", así que el mapa base quedaba
// inservible. Esri sirve la misma estética gris minimalista sin credenciales.
// La URL lleva {z}/{y}/{x} (y antes que x), al revés que el resto de los
// proveedores XYZ; leaflet la expande igual.
const TILE_URL = {
  light:
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
};
// Rótulos (calles, comunas, lugares) del mismo Gray Canvas, en su propia capa:
// la base no los trae al zoom de inicio y sin ellos cuesta ubicarse. Va sobre
// la base y bajo las líneas, que siguen mandando.
const LABELS_URL = {
  light:
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
};

// Esri corta los tiles reales en z16: más allá responde un placeholder, así que
// Leaflet tiene que sobreescalar el z16 en vez de pedir z17+.
const TILE_MAX_NATIVE_ZOOM = 16;
const TILE_MAX_ZOOM = 19;

// Atribución en dos partes: la corta siempre se ve; la larga se oculta por
// CSS en pantallas angostas para no partir en dos líneas el borde del mapa.
// El crédito completo de cada fuente está en "Fuentes de datos". El GTFS de
// DTPR no declara licencia: se cita la fuente sin atribuirle una.
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://www.esri.com/">Esri</a>, HERE, Garmin · GTFS <a href="https://dtpr.gob.cl/">DTPR</a><span class="attr-long"> · itinerarios EFE</span>';

const MAP_CENTER: L.LatLngTuple = [CONCE_CENTER.lat, CONCE_CENTER.lng];

// Lo que tapa la superficie abierta ([data-surface]: panel derecho en
// escritorio, hoja inferior en móvil), en px del contenedor del mapa. Al
// centrar se descuenta para que lo pedido quede en la parte visible. Si la
// superficie todavía no está en el DOM (se carga diferida), se usan las
// medidas de diseño. Nunca más del 70% del mapa.
const COVER_GAP_PX = 12;
const FALLBACK_PANEL = { media: '(min-width: 640px)', width: 420, right: 64, sheetRatio: 0.58, sheetBottom: 8 };

interface Covered {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Lo que tapa "Micros en el mapa" y los avisos ([data-map-overlay], arriba a
 * la izquierda). En un teléfono ocupan casi todo el ancho: se descuenta por
 * arriba. En escritorio son una columna angosta que con el detalle GPS o la
 * tarjeta de inicio se alarga: se descuenta por el lado que quita menos mapa.
 */
function coveredByOverlay(rect: DOMRect): Pick<Covered, 'top' | 'left'> {
  const overlay = document.querySelector('[data-map-overlay="top-left"]')?.getBoundingClientRect();
  if (!overlay || overlay.width === 0 || overlay.height === 0) return { top: 0, left: 0 };
  const width = overlay.right - rect.left + COVER_GAP_PX;
  const height = overlay.bottom - rect.top + COVER_GAP_PX;
  if (overlay.width > rect.width / 2 || height / rect.height <= width / rect.width) {
    return { top: Math.min(Math.max(0, height), rect.height * 0.35), left: 0 };
  }
  return { top: 0, left: Math.min(Math.max(0, width), rect.width * 0.4) };
}

function coveredBySurface(map: L.Map, surfaceOpen: boolean): Covered {
  const rect = map.getContainer().getBoundingClientRect();
  const { top, left } = coveredByOverlay(rect);
  const clampRight = (v: number) => Math.min(Math.max(0, v), rect.width * 0.7 - left);
  if (!surfaceOpen) return { top, right: 0, bottom: 0, left };
  const clampBottom = (v: number) => Math.min(Math.max(0, v), rect.height * 0.7 - top);
  const surface = document.querySelector('[data-surface]')?.getBoundingClientRect();
  if (surface && surface.width > 0 && surface.height > 0) {
    // Panel a la derecha (escritorio) u hoja abajo (móvil), según dónde quedó.
    if (surface.left > rect.left + rect.width / 2) {
      return { top, right: clampRight(rect.right - surface.left + COVER_GAP_PX), bottom: 0, left };
    }
    return { top, right: 0, bottom: clampBottom(rect.bottom - surface.top + COVER_GAP_PX), left };
  }
  if (window.matchMedia(FALLBACK_PANEL.media).matches) {
    const panelLeft = window.innerWidth - FALLBACK_PANEL.right - FALLBACK_PANEL.width - COVER_GAP_PX;
    return { top, right: clampRight(rect.right - panelLeft), bottom: 0, left };
  }
  const sheetTop = window.innerHeight * (1 - FALLBACK_PANEL.sheetRatio) - FALLBACK_PANEL.sheetBottom;
  return { top, right: 0, bottom: clampBottom(rect.bottom - sheetTop), left };
}

function FlyToOnToken({ token, surfaceOpen }: { token: FlyToToken | null; surfaceOpen: boolean }) {
  const map = useMap();
  // Se lee al volar; que se abra o cierre la superficie no es motivo para volar.
  const surfaceOpenRef = useRef(surfaceOpen);
  useLayoutEffect(() => {
    surfaceOpenRef.current = surfaceOpen;
  }, [surfaceOpen]);
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let waitedForSurface = 0;
    // Respeta a quien pidió al sistema reducir el movimiento: sin animación.
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    // flyTo anima desproyectando contra el tamaño del mapa: con el contenedor
    // todavía en 0×0 sale NaN y se cae todo. Se espera a que tenga tamaño y,
    // unos cuadros, a que la superficie diferida aparezca para medirla.
    const tryFly = () => {
      if (cancelled) return;
      const size = map.getSize();
      const surfacePending =
        surfaceOpenRef.current && !document.querySelector('[data-surface]') && waitedForSurface < 10;
      if (size.x === 0 || size.y === 0 || surfacePending) {
        waitedForSurface += 1;
        requestAnimationFrame(tryFly);
        return;
      }
      if (token.target.kind === 'view') {
        // Volver a un encuadre guardado: tal cual, sin descontar nada.
        const { lat, lng, zoom } = token.target;
        if (reduceMotion) map.setView([lat, lng], zoom, { animate: false });
        else map.flyTo([lat, lng], zoom, { duration: 0.7 });
        return;
      }
      const covered = coveredBySurface(map, surfaceOpenRef.current);
      if (token.target.kind === 'bounds') {
        const bounds = L.latLngBounds(token.target.path);
        const padding = {
          paddingTopLeft: L.point(60 + covered.left, 60 + covered.top),
          paddingBottomRight: L.point(60 + covered.right, 60 + covered.bottom),
        };
        if (reduceMotion) map.fitBounds(bounds, { ...padding, animate: false });
        else map.flyToBounds(bounds, { ...padding, duration: 0.7 });
        return;
      }
      const zoom = token.target.zoom ?? map.getZoom();
      // El centro se corre la mitad de lo tapado: el punto queda al medio de la parte visible.
      const center = map.unproject(
        map
          .project([token.target.lat, token.target.lng], zoom)
          .add([(covered.right - covered.left) / 2, (covered.bottom - covered.top) / 2]),
        zoom,
      );
      if (reduceMotion) map.setView(center, zoom, { animate: false });
      else map.flyTo(center, zoom, { duration: 0.7 });
    };
    tryFly();
    return () => {
      cancelled = true;
    };
  }, [token, map]);
  return null;
}

// El contenedor del mapa cambia de ancho al abrir o cerrar la barra lateral
// (animado) y con el viewport. Leaflet cachea el tamaño: sin invalidateSize
// sigue dibujando para el tamaño viejo y sobra una franja sin pintar.
function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    let frame = 0;
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => map.invalidateSize());
    });
    observer.observe(map.getContainer());
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

/** Publica el encuadre en map-viewport.ts (fuera de React) al cargar y tras cada movimiento o zoom. */
function MapViewportSync() {
  const map = useMap();
  useEffect(() => {
    const publish = () => {
      const b = map.getBounds();
      const c = map.getCenter();
      setMapViewport({
        bounds: [
          [b.getSouth(), b.getWest()],
          [b.getNorth(), b.getEast()],
        ],
        center: { lat: c.lat, lng: c.lng },
        zoom: map.getZoom(),
      });
    };
    publish();
    map.on('load moveend zoomend', publish);
    return () => {
      map.off('load moveend zoomend', publish);
    };
  }, [map]);
  return null;
}

function RouteNetwork({
  networkRouteIds,
  focus,
  theme,
  actions,
}: {
  networkRouteIds: readonly string[];
  focus: MapFocus | null;
  theme: Theme;
  actions: RefObject<MapActions>;
}) {
  const map = useMap();
  // Las micros GTFS llegan en un chunk diferido: al llegar se dibujan los ids que faltaban.
  const routesVersion = useRoutesVersion();
  const layerRef = useRef<RouteNetworkLayer | null>(null);
  useEffect(() => {
    const layer = new RouteNetworkLayer(map, { onSelect: (target) => actions.current.onSelect(target) });
    layerRef.current = layer;
    return () => {
      layer.destroy();
      layerRef.current = null;
    };
  }, [map, actions]);
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;
    return afterNextPaint(() => layer.update(networkRouteIds, focus, theme));
  }, [networkRouteIds, focus, theme, routesVersion]);
  return null;
}

/**
 * Corre `run` después del próximo cuadro pintado. Al encender una línea o
 * elegir un recorrido, el botón y la ficha se pintan primero y el canvas de
 * trazados (lo caro con muchas líneas: rasterizar cientos de trazados) se
 * redibuja en la tarea siguiente: el toque responde al tiro y el mapa llega
 * un cuadro después. Cambios seguidos se juntan: vale el último.
 */
function afterNextPaint(run: () => void): () => void {
  let timer = 0;
  const frame = requestAnimationFrame(() => {
    timer = window.setTimeout(run, 0);
  });
  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(timer);
  };
}

function Vehicles({
  feed,
  dense,
  focus,
  theme,
  picking,
  actions,
}: {
  feed: VehicleFeed | null;
  dense: boolean;
  focus: MapFocus | null;
  theme: Theme;
  picking: boolean;
  actions: RefObject<MapActions>;
}) {
  const map = useMap();
  const layerRef = useRef<VehicleCanvasLayer | null>(null);
  const interactionRef = useRef<MapInteraction | null>(null);
  useEffect(() => {
    const layer = new VehicleCanvasLayer();
    layer.addTo(map);
    layerRef.current = layer;
    const interaction = attachMapInteraction(map, {
      onPick: (point) => actions.current.onPick(point),
      hitVehicle: (point, touch) => layer.hitTest(point, touch),
      onSelectVehicle: (vehicle) =>
        actions.current.onSelect({ kind: 'vehicle', routeId: vehicle.routeId, directionId: vehicle.directionId }),
    });
    interactionRef.current = interaction;
    return () => {
      interaction.detach();
      layer.remove();
      interactionRef.current = null;
      layerRef.current = null;
    };
  }, [map, actions]);
  // Antes que la fuente: lo primero que se dibuja ya lleva los colores del tema.
  useEffect(() => {
    layerRef.current?.setTheme(theme);
  }, [theme]);
  useEffect(() => {
    layerRef.current?.setDense(dense);
  }, [dense]);
  useEffect(() => {
    layerRef.current?.setFeed(feed);
  }, [feed]);
  useEffect(() => {
    layerRef.current?.setFocus(focus);
  }, [focus]);
  useEffect(() => {
    interactionRef.current?.setPicking(picking);
  }, [picking]);
  return null;
}

function MapContent(props: ConceMapProps) {
  const {
    theme,
    networkRouteIds,
    focus,
    selection,
    layers,
    layerLoad,
    layerRetryKeys,
    airQuality,
    vehicleFeed,
    vehiclesDense = false,
    planner,
    pick,
    flyTo,
    surfaceOpen,
  } = props;
  const actions = useRef<MapActions>({ pick, onPick: props.onPick, onSelect: props.onSelect });
  useLayoutEffect(() => {
    actions.current = { pick, onPick: props.onPick, onSelect: props.onSelect };
  }, [pick, props.onPick, props.onSelect]);
  const plannerPoints = useMemo(
    () => ({ a: planner.a, b: planner.b, midpoint: planner.midpoint }),
    [planner.a, planner.b, planner.midpoint],
  );
  const selectedStopId = selection?.kind === 'stop' ? selection.id : null;
  const selectedCorridorId = selection?.kind === 'corridor' ? selection.id : null;

  return (
    <>
      <MapViewportSync />
      <MapAutoResize />
      <FlyToOnToken token={flyTo} surfaceOpen={surfaceOpen} />
      <CoverageLayer
        enabled={layers.coverage}
        threshold={layers.coverageThreshold}
        retryKey={layerRetryKeys.coverage}
        loadStatus={layerLoad.coverage}
      />
      <GreenspaceLayer enabled={layers.greenspace} retryKey={layerRetryKeys.greenspace} loadStatus={layerLoad.greenspace} />
      <CyclewaysLayer enabled={layers.cycleways} retryKey={layerRetryKeys.cycleways} loadStatus={layerLoad.cycleways} />
      <SchoolsLayer enabled={layers.schools} retryKey={layerRetryKeys.schools} loadStatus={layerLoad.schools} />
      <RouteNetwork networkRouteIds={networkRouteIds} focus={focus} theme={theme} actions={actions} />
      <ParaderosLayer
        enabled={layers.paraderos}
        selectedId={selectedStopId}
        dim={focus != null && focus.routeIds.length > 0}
        theme={theme}
        actions={actions}
      />
      <InterurbanCorridorsLayer enabled={layers.corridors} selectedId={selectedCorridorId} actions={actions} />
      <MapMarkers selection={selection} layers={layers} airQuality={airQuality} planner={plannerPoints} actions={actions} />
      <Vehicles feed={vehicleFeed} dense={vehiclesDense} focus={focus} theme={theme} picking={pick != null} actions={actions} />
    </>
  );
}

/** Tolerancia de toque del canvas de vectores: más holgada con el dedo. */
function canvasTolerance(): number {
  return typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches ? 8 : 3;
}

export const ConceMap = memo(function ConceMap(props: ConceMapProps) {
  const [renderer] = useState(() => L.canvas({ tolerance: canvasTolerance() }));
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={13}
      zoomControl={false}
      attributionControl
      preferCanvas
      renderer={renderer}
      className="absolute inset-0"
    >
      <TileLayer
        key={props.theme}
        url={TILE_URL[props.theme]}
        attribution={ATTRIBUTION}
        maxNativeZoom={TILE_MAX_NATIVE_ZOOM}
        maxZoom={TILE_MAX_ZOOM}
      />
      <TileLayer
        key={`labels-${props.theme}`}
        url={LABELS_URL[props.theme]}
        maxNativeZoom={TILE_MAX_NATIVE_ZOOM}
        maxZoom={TILE_MAX_ZOOM}
        zIndex={2}
      />
      <ZoomControl position="bottomright" />
      <MapContent {...props} />
    </MapContainer>
  );
});
