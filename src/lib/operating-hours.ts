// "Operando ahora" según el horario programado de cada recorrido, día por día.
//
// Cada ruta trae `serviceSpans`: los tramos del día en que hay al menos un
// viaje programado en curso (GTFS oficial DTPR para micros, itinerarios EFE
// para Biotrén). Un hueco de hasta SERVICE_GAP_TOLERANCE_MIN entre la llegada
// de un viaje y la salida del siguiente no corta el tramo: una línea cada
// 40 min sigue operando entre pasadas, pero la L1 sin trenes de 13:15 a 15:00
// queda fuera de servicio a esa hora, igual que en el itinerario.
//
// Imports relativos con extensión: scripts/sync-gtfs-official.ts usa
// `serviceSpansFromTrips` desde Node, sin el alias `@/` de Vite.

import { chileClock } from './chile-time.ts';
import type { Route, ScheduledTrip, ServiceSpan, ServiceSpans } from '../types/transport.ts';

export const SERVICE_GAP_TOLERANCE_MIN = 60;

/** Une los viajes [salida, duración] de cada día en tramos con servicio. */
export function serviceSpansFromTrips(days: ReadonlyArray<readonly ScheduledTrip[]>): ServiceSpans {
  return days.map((trips) => {
    const spans: ServiceSpan[] = [];
    for (const [start, duration] of [...trips].sort((a, b) => a[0] - b[0])) {
      const end = start + duration;
      const last = spans[spans.length - 1];
      if (last && start - last[1] <= SERVICE_GAP_TOLERANCE_MIN) last[1] = Math.max(last[1], end);
      else spans.push([start, end]);
    }
    return spans;
  });
}

function inSpans(spans: readonly ServiceSpan[] | undefined, minute: number): boolean {
  return spans?.some(([start, end]) => minute >= start && minute <= end) ?? false;
}

export function isRouteOperatingAt(route: Pick<Route, 'serviceSpans'>, date: Date): boolean {
  const spans = route.serviceSpans;
  if (!spans) return false;
  const { day, minutes } = chileClock(date);
  // Los viajes de anoche que siguen de madrugada viven en el día anterior
  // con horas sobre 24:00.
  return inSpans(spans[day], minutes) || inSpans(spans[(day + 6) % 7], minutes + 1440);
}

export function isRouteOperatingNow(route: Pick<Route, 'serviceSpans'>): boolean {
  return isRouteOperatingAt(route, new Date());
}
