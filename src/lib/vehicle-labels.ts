// Textos de las micros en el mapa, con el mismo formato en los dos modos de
// "Micros en el mapa": el letrero del sentido y su destino, y luego de dónde
// sale la posición:
//   "24F hacia Hualpén · GPS hace 20 s · patente PRUE51"
//   "24F hacia Hualpén · estimado según horario"
// Las formas (estimada redonda y punteada; con GPS cuadrada con anillo verde,
// ámbar si el dato es viejo) las dibuja el canvas de micros con VEHICLE_STYLE
// de src/types/ui-contracts.ts, el mismo que usa la leyenda.

import { STATIC_SERVICE_PATTERNS } from '@/data/static-service-patterns';
import { formatAge } from '@/realtime/live-arrivals';
import type { Route } from '@/types/transport';

export interface VehicleLabel {
  /** Código del letrero en ese sentido ("10A", "L1"). */
  code: string;
  destination: string | null;
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
