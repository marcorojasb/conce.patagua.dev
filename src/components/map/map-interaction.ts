// Clics y puntero del mapa que no son de una capa de Leaflet:
// - Eligiendo un punto del planificador, todo clic sobre el mapa es ese punto:
//   se captura antes que Leaflet (fase de captura en el contenedor) y no abre
//   nada más, ni línea, ni paradero, ni micro. Cursor en cruz y sin tooltips.
// - Fuera de eso, un clic sobre una micro (canvas sin eventos) la elige; si no
//   hay micro bajo el dedo, Leaflet lo maneja como siempre.
// - Puntero sobre una micro: el tooltip compartido, una vez por cuadro.
// Los marcadores DOM, los popups y los controles se manejan solos: sus clics
// se ignoran aquí. Un clic tras arrastrar más de 6 px no cuenta.

import L from 'leaflet';
import { hideMapTooltip, setMapTooltipEnabled, showMapTooltip } from '@/components/map/map-tooltip';
import type { LatLng, MapVehicle } from '@/types/ui-contracts';

const IGNORED_TARGETS = '.leaflet-marker-pane, .leaflet-popup-pane, .leaflet-control-container';
const CLICK_SLOP_PX = 6;

export const VEHICLE_SECONDARY = {
  estimate: 'Estimada según el programa · no es GPS',
  gps: 'GPS en vivo · Transapp/DTPR, no oficial',
} as const;

export interface MapInteractionHandlers {
  onPick: (point: LatLng) => void;
  /** La micro bajo el punto; `touch` agranda el radio (vehicle-hit-grid.ts). */
  hitVehicle: (containerPoint: L.Point, touch: boolean) => MapVehicle | null;
  onSelectVehicle: (vehicle: MapVehicle) => void;
}

export interface MapInteraction {
  setPicking: (picking: boolean) => void;
  detach: () => void;
}

export function attachMapInteraction(map: L.Map, handlers: MapInteractionHandlers): MapInteraction {
  const container = map.getContainer();
  let picking = false;
  let down: { x: number; y: number; touch: boolean } | null = null;
  let hoverFrame = 0;
  let lastMove: L.LeafletMouseEvent | null = null;
  let overVehicle = false;

  const setOverVehicle = (value: boolean) => {
    if (value === overVehicle) return;
    overVehicle = value;
    container.classList.toggle('is-over-vehicle', value);
  };

  const onPointerDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' || e.pointerType === 'pen' };
  };

  const onClick = (e: MouseEvent) => {
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest(IGNORED_TARGETS)) return;
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > CLICK_SLOP_PX) return;
    if (picking) {
      e.stopImmediatePropagation();
      e.preventDefault();
      const latlng = map.mouseEventToLatLng(e);
      handlers.onPick({ lat: latlng.lat, lng: latlng.lng });
      return;
    }
    const vehicle = handlers.hitVehicle(map.mouseEventToContainerPoint(e), down?.touch === true);
    if (!vehicle) return;
    e.stopImmediatePropagation();
    hideMapTooltip(map, 'vehicle');
    handlers.onSelectVehicle(vehicle);
  };

  const hover = () => {
    hoverFrame = 0;
    const e = lastMove;
    if (!e || picking) return;
    const vehicle = handlers.hitVehicle(e.containerPoint, false);
    setOverVehicle(vehicle != null);
    if (vehicle) {
      showMapTooltip(map, [vehicle.lat, vehicle.lng], vehicle.tooltip, VEHICLE_SECONDARY[vehicle.kind], 'vehicle');
    } else {
      hideMapTooltip(map, 'vehicle');
    }
  };

  const onMouseMove = (e: L.LeafletMouseEvent) => {
    lastMove = e;
    if (!hoverFrame && !picking) hoverFrame = requestAnimationFrame(hover);
  };

  const onMouseOut = () => {
    lastMove = null;
    setOverVehicle(false);
    hideMapTooltip(map, 'vehicle');
  };

  container.addEventListener('pointerdown', onPointerDown, true);
  container.addEventListener('click', onClick, true);
  map.on('mousemove', onMouseMove);
  map.on('mouseout', onMouseOut);

  return {
    setPicking(next) {
      if (next === picking) return;
      picking = next;
      container.classList.toggle('is-picking', next);
      setMapTooltipEnabled(map, !next);
      if (next) setOverVehicle(false);
    },
    detach() {
      if (hoverFrame) cancelAnimationFrame(hoverFrame);
      container.removeEventListener('pointerdown', onPointerDown, true);
      container.removeEventListener('click', onClick, true);
      map.off('mousemove', onMouseMove);
      map.off('mouseout', onMouseOut);
      container.classList.remove('is-picking', 'is-over-vehicle');
      setMapTooltipEnabled(map, true);
    },
  };
}
