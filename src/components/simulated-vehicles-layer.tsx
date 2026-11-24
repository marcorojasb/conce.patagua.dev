// Vehículos estimados ("Servicios en curso") dibujados de forma imperativa.
//
// Cada viaje conserva su marcador mientras dure: en cada tick solo se llama a
// setLatLng y se actualiza la rotación, así la transición CSS de
// .vehicle-marker-wrap lo hace avanzar suave y no hay trabajo de React. Con
// toda la red encendida son ~600 marcadores; recrearlos cada segundo era lo
// que trababa el mapa.

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { subscribeSimulatedVehicles } from '@/realtime/use-simulated-vehicles';
import type { SimulatedVehicle } from '@/types/transport';

interface Props {
  routeColorById: Map<string, string>;
  routeLabelById: Map<string, string>;
  onSelect: (routeId: string) => void;
}

const SOURCE_KIND_LABEL: Record<SimulatedVehicle['sourceKind'], string> = {
  gtfs: 'GTFS oficial',
  official: 'fuente oficial',
  operator: 'operador',
  community: 'fuente comunitaria',
  estimated: 'estimado',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function safeToken(value: string): string {
  return value.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
}

function vehicleIcon(color: string, vehicle: SimulatedVehicle): L.DivIcon {
  return L.divIcon({
    className: `vehicle-marker-wrap route-${safeToken(vehicle.routeId)} source-${safeToken(vehicle.sourceKind)}`,
    html: `<div class="vehicle-marker is-estimate" data-route-id="${escapeHtml(vehicle.routeId)}" data-source-kind="${vehicle.sourceKind}" style="--vehicle-bg:${escapeHtml(color)};--vehicle-rotation:${vehicle.bearing.toFixed(1)}deg" aria-hidden="true"><svg class="vehicle-marker-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3 19 21 12 17 5 21 12 3Z"/></svg></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function tooltipHtml(vehicle: SimulatedVehicle, label: string): string {
  const lines = [
    `<span class="font-medium">${escapeHtml(label)}</span>`,
    '<span class="font-semibold">Estimación según horario · no es GPS</span>',
    `${Math.round(vehicle.progress * 100)}% del trayecto programado`,
  ];
  if (vehicle.directionLabel) lines.push(escapeHtml(vehicle.directionLabel));
  lines.push(
    `Simulación ${SOURCE_KIND_LABEL[vehicle.sourceKind]}${vehicle.sourceLabel ? ` · ${escapeHtml(vehicle.sourceLabel)}` : ''}`,
  );
  if (vehicle.note) lines.push(escapeHtml(vehicle.note));
  return lines.join('<br />');
}

export function SimulatedVehiclesLayer({ routeColorById, routeLabelById, onSelect }: Props) {
  const map = useMap();
  // Colores, etiquetas y el handler cambian poco; se leen en cada tick desde
  // refs para no rearmar la suscripción.
  const colorsRef = useRef(routeColorById);
  const labelsRef = useRef(routeLabelById);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    colorsRef.current = routeColorById;
    labelsRef.current = routeLabelById;
    onSelectRef.current = onSelect;
  }, [routeColorById, routeLabelById, onSelect]);

  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup -- El cleanup desuscribe y quita todos los marcadores.
  useEffect(() => {
    const markers = new Map<string, { marker: L.Marker; vehicle: SimulatedVehicle }>();
    const group = L.layerGroup().addTo(map);

    const unsubscribe = subscribeSimulatedVehicles((vehicles) => {
      const seen = new Set<string>();
      for (const vehicle of vehicles) {
        seen.add(vehicle.id);
        const entry = markers.get(vehicle.id);
        if (entry) {
          entry.vehicle = vehicle;
          entry.marker.setLatLng([vehicle.lat, vehicle.lng]);
          const el = entry.marker.getElement()?.firstElementChild as HTMLElement | null | undefined;
          el?.style.setProperty('--vehicle-rotation', `${vehicle.bearing.toFixed(1)}deg`);
          continue;
        }
        const color = colorsRef.current.get(vehicle.routeId) ?? '#0ea5e9';
        const marker = L.marker([vehicle.lat, vehicle.lng], {
          icon: vehicleIcon(color, vehicle),
          keyboard: false,
          zIndexOffset: 900,
        });
        const created = { marker, vehicle };
        marker.bindTooltip(
          () => tooltipHtml(created.vehicle, labelsRef.current.get(created.vehicle.routeId) ?? created.vehicle.routeId),
          { direction: 'top', offset: [0, -16], opacity: 0.95, className: '!text-[11px]' },
        );
        marker.on('click', () => onSelectRef.current(created.vehicle.routeId));
        marker.addTo(group);
        markers.set(vehicle.id, created);
      }
      for (const [id, entry] of markers) {
        if (seen.has(id)) continue;
        entry.marker.off();
        group.removeLayer(entry.marker);
        markers.delete(id);
      }
    });

    return () => {
      unsubscribe();
      for (const entry of markers.values()) entry.marker.off();
      group.remove();
    };
  }, [map]);

  return null;
}
