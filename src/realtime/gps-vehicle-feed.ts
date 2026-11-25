// Fuente "GPS en vivo" del mapa: solo micros con posición GPS real, con la
// forma común MapVehicle. Nunca lleva estimadas: si una línea no transmite,
// no tiene micros aquí (el control "Micros en el mapa" lo dice aparte).
//
// Se arma con dos orígenes de la misma fuente de Transapp:
// - /api/route-vehicles: las micros de las líneas en el mapa (use-route-vehicles);
// - las llegadas del paradero abierto que traen GPS y posición, que pueden ser
//   de líneas que no están en el mapa.
// La misma patente en los dos queda una vez, con la posición más reciente.
//
// useGpsMode publica aquí y el canvas de micros se suscribe sin pasar por React.

import { directionCode } from '@/lib/route-labels';
import { gpsTooltipLine } from '@/lib/vehicle-labels';
import {
  formatDeparture,
  gpsArrivals,
  notDepartedYet,
  type LiveArrival,
  type LiveServiceMatch,
  type LiveView,
} from '@/realtime/live-arrivals';
import {
  GPS_MAX_AGE_MS,
  GPS_STALE_AFTER_MS,
  gpsVehiclesForMap,
  type GpsSelection,
  type ServiceGps,
} from '@/realtime/route-vehicles';
import type { Route } from '@/types/transport';
import type { DirectionId, MapVehicle, VehicleFeed } from '@/types/ui-contracts';

/** Llegadas con GPS y posición del paradero abierto que el mapa dibuja, y la edad de esa consulta. */
export interface StopGpsArrivals {
  arrivals: ReadonlyArray<LiveArrival & { position: { lat: number; lng: number } }>;
  ageMs: number;
  /** Dato de más de GPS_STALE_AFTER_MS: se dibujan con anillo ámbar. */
  stale: boolean;
}

/**
 * Las micros del paradero abierto que dibuja el modo GPS: las con GPS y
 * posición de una consulta de hasta GPS_MAX_AGE_MS (la ficha las sigue
 * listando hasta 10 min, pero el mapa ya no). Una sola regla para el mapa y
 * para lo que la ficha dice del mapa.
 */
export function stopGpsOnMap(view: LiveView): StopGpsArrivals | null {
  if (view.ageMs == null || view.ageMs > GPS_MAX_AGE_MS) return null;
  const arrivals = gpsArrivals(view);
  return arrivals.length > 0 ? { arrivals, ageMs: view.ageMs, stale: view.ageMs > GPS_STALE_AFTER_MS } : null;
}

export interface GpsMapInput {
  byService: Record<string, ServiceGps>;
  routeByPair: GpsSelection['routeByPair'];
  /** Recorridos consultados, por id. */
  routesById: ReadonlyMap<string, Route>;
  /** Nombre de la fuente → recorrido y sentido (indexLiveServices de todos los recorridos). */
  liveServices: ReadonlyMap<string, LiveServiceMatch>;
  stop: StopGpsArrivals | null;
  /** Hora en el reloj del servidor de /api/route-vehicles (sourceClock). */
  now: number;
}

function destinationOf(route: Route, directionId: DirectionId): string | null {
  const direction = route.directions?.find((d) => d.directionId === directionId);
  return direction?.destination ?? direction?.headsign ?? null;
}

function toMapVehicle(
  route: Route,
  directionId: DirectionId,
  v: {
    id: string;
    lat: number;
    lng: number;
    bearing: number | null;
    plate: string | null;
    ageMs: number;
    /** "19:00" si su viaje todavía no sale de la cabecera. */
    departsAt?: string | null;
  },
): MapVehicle {
  const code = directionCode(route, directionId);
  return {
    id: v.id,
    kind: 'gps',
    routeId: route.id,
    directionId,
    lat: v.lat,
    lng: v.lng,
    bearing: v.bearing,
    color: route.color,
    code,
    stale: v.ageMs > GPS_STALE_AFTER_MS,
    tooltip: gpsTooltipLine({
      code,
      destination: destinationOf(route, directionId),
      ageMs: v.ageMs,
      plate: v.plate,
      departsAt: v.departsAt,
    }),
  };
}

/**
 * Micros con GPS para el mapa. Se dibujan las de menos de 5 min (viejas
 * pasados 2 min); un servicio que no está entre los consultados o sin
 * recorrido conocido se salta. El id es "<SERVICIO>:<I|R>#<patente>" en los
 * dos orígenes, así una micro no cambia de id al pasar de uno a otro.
 */
export function buildGpsMapVehicles(input: GpsMapInput): MapVehicle[] {
  const { now } = input;
  const out: MapVehicle[] = [];
  /** Edad de la posición de cada salida, para quedarse con la más nueva por patente. */
  const ageOf: number[] = [];
  const indexByPlate = new Map<string, number>();

  const add = (vehicle: MapVehicle, plate: string | null, ageMs: number) => {
    const index = plate ? indexByPlate.get(plate) : undefined;
    if (index == null) {
      if (plate) indexByPlate.set(plate, out.length);
      out.push(vehicle);
      ageOf.push(ageMs);
    } else if (ageMs < ageOf[index]) {
      // Las llegadas del paradero no traen rumbo: la micro conserva la flecha
      // del reporte GPS de su línea mientras ese reporte no sea viejo.
      const previous = out[index];
      out[index] =
        vehicle.bearing == null && previous.bearing != null && !previous.stale
          ? { ...vehicle, bearing: previous.bearing }
          : vehicle;
      ageOf[index] = ageMs;
    }
  };

  for (const v of gpsVehiclesForMap(input.byService, now)) {
    const target = input.routeByPair.get(`${v.service}:${v.direction}`);
    const route = target ? input.routesById.get(target.routeId) : undefined;
    if (!target || !route) continue;
    add(toMapVehicle(route, target.directionId, v), v.plate, v.ageMs);
  }

  const stop = input.stop;
  if (stop && stop.ageMs <= GPS_MAX_AGE_MS) {
    for (const arrival of stop.arrivals) {
      const match = input.liveServices.get(arrival.route);
      if (!match) continue;
      const directionId = match.direction.directionId;
      const direction = arrival.direction ?? (directionId === 0 ? 'I' : 'R');
      const id = arrival.plate
        ? `${arrival.route}:${direction}#${arrival.plate}`
        : `${arrival.route}:${direction}#viaje-${arrival.tripId ?? arrival.arrivalAt}`;
      const vehicle = toMapVehicle(match.route, directionId, {
        id,
        lat: arrival.position.lat,
        lng: arrival.position.lng,
        bearing: null,
        plate: arrival.plate,
        ageMs: stop.ageMs,
        departsAt: arrival.departsAt != null && notDepartedYet(arrival, now) ? formatDeparture(arrival.departsAt) : null,
      });
      add(vehicle, arrival.plate, stop.ageMs);
    }
  }
  return out;
}

const EMPTY: readonly MapVehicle[] = [];
let current: readonly MapVehicle[] = EMPTY;
const listeners = new Set<(vehicles: readonly MapVehicle[]) => void>();

/** Lo publica useGpsMode; [] con el modo apagado. */
export function publishGpsVehicles(vehicles: readonly MapVehicle[]): void {
  const next = vehicles.length === 0 ? EMPTY : vehicles;
  if (next === current) return;
  current = next;
  for (const listener of listeners) listener(current);
}

export const gpsVehicleFeed: VehicleFeed = {
  kind: 'gps',
  subscribe(listener) {
    listeners.add(listener);
    listener(current);
    return () => {
      listeners.delete(listener);
    };
  },
};
