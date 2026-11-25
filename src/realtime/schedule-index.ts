// Índice de horarios por clave de simulación (`<routeId>#<directionId>` o id
// de patrón) que comparten la ficha de recorrido, el modo Horario del mapa y
// el fondo de pantalla. El GTFS se carga en un chunk aparte (cientos de KB) y
// recibe encima las listas del operador (la 201 de lunes a viernes); la ficha
// lo muestra tal cual y la simulación además lo ralea por flota.

import { KNOWN_FLEETS, type KnownFleet } from '@/data/fleets';
import { OPERATOR_TIMETABLES, type OperatorTimetable } from '@/data/operator-timetables';
import { capToFleet } from '@/lib/schedule-program';
import { DAY_INDEXES, STATIC_ROUTE_SCHEDULES } from '@/realtime/static-service-schedules';
import type { RouteSchedule, ScheduledTrip } from '@/types/transport';

/**
 * Copia del índice GTFS con los días que reemplaza cada lista del operador
 * (tuplas y arreglos nuevos; no muta). Si la clave no existe, la ignora: la
 * calidad de datos la reporta como error.
 */
export function withOperatorTimetables(
  gtfs: Readonly<Record<string, RouteSchedule>>,
  timetables: readonly OperatorTimetable[] = OPERATOR_TIMETABLES,
): Record<string, RouteSchedule> {
  const index: Record<string, RouteSchedule> = { ...gtfs };
  for (const timetable of timetables) {
    const current = index[timetable.scheduleKey];
    if (!current) continue;
    const schedule = [...current] as RouteSchedule;
    for (const day of timetable.days) {
      for (const dayIndex of DAY_INDEXES[day]) {
        schedule[dayIndex] = timetable.trips.map(([start, duration]): ScheduledTrip => [start, duration]);
      }
    }
    index[timetable.scheduleKey] = schedule;
  }
  return index;
}

/**
 * Copia del índice donde los sentidos de cada flota conocida (claves
 * "<routeId>#<n>" cuyo routeId está en fleet.routeIds) pasan por
 * capToFleet(…, fleet.buses).
 */
export function capToKnownFleets(
  index: Readonly<Record<string, RouteSchedule>>,
  fleets: readonly KnownFleet[] = KNOWN_FLEETS,
): Record<string, RouteSchedule> {
  const capped: Record<string, RouteSchedule> = { ...index };
  for (const fleet of fleets) {
    const keys = Object.keys(index).filter((key) => {
      const hash = key.lastIndexOf('#');
      return hash > 0 && fleet.routeIds.includes(key.slice(0, hash));
    });
    if (keys.length === 0) continue;
    const schedules = capToFleet(
      keys.map((key) => index[key]),
      fleet.buses,
    );
    keys.forEach((key, i) => {
      capped[key] = schedules[i];
    });
  }
  return capped;
}

let indexPromise: Promise<Record<string, RouteSchedule>> | null = null;

/**
 * Un solo import() del chunk de horarios GTFS, compartido:
 * { ...withOperatorTimetables(gtfs.ROUTE_DIRECTION_SCHEDULES), ...STATIC_ROUTE_SCHEDULES }.
 * Si falla, se olvida la promesa para poder reintentar.
 */
export function loadScheduleIndex(): Promise<Record<string, RouteSchedule>> {
  indexPromise ??= import('@/data/gtfs-schedule.generated').then(
    (gtfs) => ({
      ...withOperatorTimetables(gtfs.ROUTE_DIRECTION_SCHEDULES),
      ...STATIC_ROUTE_SCHEDULES,
    }),
    (err: unknown) => {
      indexPromise = null;
      throw err;
    },
  );
  return indexPromise;
}
