// Fuente "Horario" del mapa: las micros estimadas de la simulación por
// horario (use-simulated-vehicles.ts) con la forma común MapVehicle. Nunca son
// GPS: kind 'estimate' y stale siempre false. Se convierte una vez por tic,
// aunque haya más de un suscriptor.

import { ROUTES, ROUTES_BY_ID } from '@/data/routes';
import { estimateTooltipLine, simulationVehicleLabels, type VehicleLabel } from '@/lib/vehicle-labels';
import { subscribeSimulatedVehicles } from '@/realtime/use-simulated-vehicles';
import type { DirectionId, MapVehicle, VehicleFeed } from '@/types/ui-contracts';
import type { Route, SimulatedVehicle } from '@/types/transport';

const FALLBACK_COLOR = '#0ea5e9';

/** Sentido GTFS desde la clave del horario ("<routeId>#1"); los patrones de Biotrén no lo tienen. */
export function scheduleDirectionId(scheduleId: string): DirectionId | null {
  const match = /#([01])$/.exec(scheduleId);
  return match ? (Number(match[1]) as DirectionId) : null;
}

interface ScheduleMeta {
  code: string;
  color: string;
  directionId: DirectionId | null;
  tooltip: string;
}

// Código, color y tooltip son los mismos para todos los viajes de un horario:
// se arman una vez por clave y no en cada tic (miles de strings por segundo).
const metaByLabels = new WeakMap<ReadonlyMap<string, VehicleLabel>, Map<string, ScheduleMeta>>();

function scheduleMeta(
  vehicle: SimulatedVehicle,
  labels: ReadonlyMap<string, VehicleLabel>,
  routesById: ReadonlyMap<string, Pick<Route, 'code' | 'color'>>,
): ScheduleMeta {
  let cache = metaByLabels.get(labels);
  if (!cache) metaByLabels.set(labels, (cache = new Map()));
  const key = `${vehicle.scheduleId}|${vehicle.routeId}`;
  let meta = cache.get(key);
  if (!meta) {
    const route = routesById.get(vehicle.routeId);
    const label = labels.get(vehicle.scheduleId);
    const code = label?.code ?? route?.code ?? vehicle.routeId;
    meta = {
      code,
      color: route?.color ?? FALLBACK_COLOR,
      directionId: scheduleDirectionId(vehicle.scheduleId),
      tooltip: estimateTooltipLine(code, label?.destination ?? null),
    };
    cache.set(key, meta);
  }
  return meta;
}

export function toMapVehicles(
  vehicles: readonly SimulatedVehicle[],
  labels: ReadonlyMap<string, VehicleLabel>,
  routesById: ReadonlyMap<string, Pick<Route, 'code' | 'color'>>,
): MapVehicle[] {
  return vehicles.map((v) => {
    const meta = scheduleMeta(v, labels, routesById);
    return {
      id: v.id,
      kind: 'estimate',
      routeId: v.routeId,
      directionId: meta.directionId,
      lat: v.lat,
      lng: v.lng,
      bearing: Number.isFinite(v.bearing) ? v.bearing : null,
      color: meta.color,
      code: meta.code,
      stale: false,
      tooltip: meta.tooltip,
    };
  });
}

// Letreros por clave de horario; se rehacen cuando llegan las micros GTFS
// (ROUTES crece una vez, en el mismo arreglo).
let labels: Map<string, VehicleLabel> = new Map();
let labelsForRoutes = -1;
let lastInput: readonly SimulatedVehicle[] | null = null;
let lastOutput: MapVehicle[] = [];

function mapped(vehicles: readonly SimulatedVehicle[]): MapVehicle[] {
  if (labelsForRoutes !== ROUTES.length) {
    labels = simulationVehicleLabels(ROUTES);
    labelsForRoutes = ROUTES.length;
    lastInput = null;
  }
  if (vehicles !== lastInput) {
    lastInput = vehicles;
    lastOutput = toMapVehicles(vehicles, labels, ROUTES_BY_ID);
  }
  return lastOutput;
}

export const scheduleVehicleFeed: VehicleFeed = {
  kind: 'estimate',
  subscribe(listener) {
    return subscribeSimulatedVehicles((vehicles) => listener(mapped(vehicles)));
  },
};
