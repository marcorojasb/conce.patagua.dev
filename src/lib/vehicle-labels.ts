// Etiquetas de las micros en el mapa, iguales en los dos modos de "Micros en
// el mapa": una píldora con el código del letrero en el color del recorrido y
// una flecha de rumbo, y una descripción con el mismo formato:
//   "24F hacia Hualpén · GPS hace 20 s · patente PRUE51"
//   "24F hacia Hualpén · estimado según horario"
// Lo que las distingue (sólida con punto en vivo, punteada y más clara, ámbar
// con el dato viejo) está en las clases .vehicle-pill.is-gps / .is-estimate /
// .is-stale de src/index.css.

import { STATIC_SERVICE_PATTERNS } from '@/data/static-service-patterns';
import { formatAge } from '@/realtime/live-arrivals';
import { readableTextOn } from '@/lib/utils';
import type { Route } from '@/types/transport';

export interface VehicleLabel {
  /** Código del letrero en ese sentido ("10A", "L1"). */
  code: string;
  destination: string | null;
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Letrero de cada horario que proyecta la simulación, por su clave: GTFS
 * "<routeId>#<directionId>" con la variante del sentido; Biotrén por el id del
 * patrón EFE, con el destino de su "Origen → Destino".
 */
export function simulationVehicleLabels(routes: readonly Route[]): Map<string, VehicleLabel> {
  const labels = new Map<string, VehicleLabel>();
  for (const route of routes) {
    for (const direction of route.directions ?? []) {
      labels.set(`${route.id}#${direction.directionId}`, {
        code: direction.variant ?? route.code,
        destination: direction.destination ?? direction.headsign ?? null,
      });
    }
  }
  const routeById = new Map(routes.map((route) => [route.id, route]));
  for (const pattern of STATIC_SERVICE_PATTERNS) {
    const route = routeById.get(pattern.routeId);
    if (!route) continue;
    const destination = pattern.directionLabel.split('→')[1]?.trim();
    labels.set(pattern.id, { code: route.code, destination: destination || pattern.directionLabel });
  }
  return labels;
}

function headline(code: string, destination: string | null): string {
  return destination ? `${code} hacia ${destination}` : code;
}

/** "24F hacia Hualpén · GPS hace 20 s · patente PRUE51" (edad null: sin hora del GPS). */
export function gpsTooltipLine(vehicle: {
  code: string;
  destination: string | null;
  ageMs: number | null;
  plate: string | null;
}): string {
  const parts = [
    headline(vehicle.code, vehicle.destination),
    vehicle.ageMs == null ? 'GPS' : `GPS ${formatAge(vehicle.ageMs)}`,
  ];
  if (vehicle.plate) parts.push(`patente ${vehicle.plate}`);
  return parts.join(' · ');
}

/** "24F hacia Hualpén · estimado según horario". */
export function estimateTooltipLine(code: string, destination: string | null): string {
  return `${headline(code, destination)} · estimado según horario`;
}

const ARROW_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 21 12 17 5 21 12 3Z"/></svg>';

export interface VehiclePill {
  kind: 'gps' | 'estimate';
  code: string;
  color: string;
  /** Grados (0 = N); null sin rumbo: punto en vez de flecha. */
  bearing: number | null;
  stale?: boolean;
  /** Clases extra del marcador (las que buscan las pruebas: vehicle-marker, live-vehicle-marker…). */
  className?: string;
  /** Atributos data-* (sin el prefijo). */
  data?: Record<string, string>;
}

/** Píldora de una micro para un L.divIcon. Todo texto variable va escapado. */
export function vehiclePillHtml(pill: VehiclePill): string {
  const classes = ['vehicle-pill', pill.kind === 'gps' ? 'is-gps' : 'is-estimate'];
  if (pill.stale) classes.push('is-stale');
  if (pill.bearing == null) classes.push('no-heading');
  if (pill.className) classes.push(pill.className);
  const style = [
    `--vehicle-bg:${escapeHtml(pill.color)}`,
    `--vehicle-fg:${readableTextOn(pill.color)}`,
    `--vehicle-rotation:${(pill.bearing ?? 0).toFixed(1)}deg`,
  ].join(';');
  const data = Object.entries(pill.data ?? {})
    .map(([key, value]) => ` data-${key}="${escapeHtml(value)}"`)
    .join('');
  const code = escapeHtml(pill.code.slice(0, 7));
  return `<div class="${escapeHtml(classes.join(' '))}" style="${style}"${data}><span class="vehicle-pill-heading">${ARROW_SVG}</span><span class="vehicle-pill-code">${code}</span></div>`;
}
