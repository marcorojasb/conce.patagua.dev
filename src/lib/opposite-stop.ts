// Paradero de enfrente: el del sentido contrario de las mismas líneas, a pocos
// metros. En el 20318 (Camino El Patagual, hacia Concepción) solo pasan micros
// hacia Concepción; quien quiere ir a Santa Juana espera en el 20317, a ~20 m
// en la vereda de enfrente. Sale del GTFS (paradas de cada sentido), no de la
// fuente en vivo.

import { distanceMeters } from '@/lib/geo';
import type { Route, Stop } from '@/types/transport';

/** Más lejos que esto ya no es "enfrente": suele ser otra cuadra u otra calle. */
export const OPPOSITE_STOP_MAX_M = 60;

export interface OppositeStop {
  stop: Stop;
  distanceM: number;
  /** Líneas de este paradero que paran allá en el otro sentido, con su destino. */
  lines: Array<{ route: Route; destination: string | null }>;
}

/**
 * El paradero más cercano (≤ 60 m) donde paran, en el sentido contrario, las
 * líneas que aquí paran en un solo sentido. Si hay varios, el que comparten más
 * líneas y luego el más cercano. Null si no hay ninguno: una línea que en este
 * punto para en los dos sentidos no cuenta, y en calles de un solo sentido el
 * regreso suele ir por otra.
 */
export function findOppositeStop(stopId: string, routes: readonly Route[]): OppositeStop | null {
  const candidates = new Map<string, OppositeStop>();
  for (const route of routes) {
    const directions = route.directions ?? [];
    const here = directions.find((d) => d.stops.some((s) => s.id === stopId));
    if (!here) continue;
    const other = directions.find((d) => d.directionId !== here.directionId);
    if (!other || other.stops.some((s) => s.id === stopId)) continue;
    const origin = here.stops.find((s) => s.id === stopId)!;
    let best: { stop: Stop; distanceM: number } | null = null;
    for (const stop of other.stops) {
      const distanceM = distanceMeters([origin.lat, origin.lng], [stop.lat, stop.lng]);
      if (distanceM <= OPPOSITE_STOP_MAX_M && (!best || distanceM < best.distanceM)) best = { stop, distanceM };
    }
    if (!best) continue;
    const entry = candidates.get(best.stop.id) ?? { ...best, lines: [] };
    entry.lines.push({ route, destination: other.destination ?? null });
    candidates.set(best.stop.id, entry);
  }
  let pick: OppositeStop | null = null;
  for (const candidate of candidates.values()) {
    if (
      !pick ||
      candidate.lines.length > pick.lines.length ||
      (candidate.lines.length === pick.lines.length && candidate.distanceM < pick.distanceM)
    ) {
      pick = candidate;
    }
  }
  return pick;
}
