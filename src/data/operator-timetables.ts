// Salidas que vende el operador cuando el GTFS solo trae un programa a
// intervalo fijo (ver src/lib/schedule-program.ts).
//
// La 201 (Transportes Santa Juana, servicio «Ejecutivo», $1.000): lista de
// salidas a la venta en kupos.cl, leída de las páginas HTML públicas el
// miércoles 25-11-2026, sin API. La página muestra solo el día de la consulta:
// se asume la misma lista de lunes a viernes. No separa la 201 de la 201-AU. La
// página de la empresa en kupos.cl (/es/pasajes/bus/transportes-santa-juana)
// dice que desde Santa Juana la primera sale a las 05:30, pero la lista del día
// empieza a las 06:30. Reemplaza las 220 + 200 salidas
// del programa GTFS, que con la 201-AU pedirían 86 micros en ruta a la vez
// para una flota de 23.
//
// Imports relativos y solo de tipo: data-quality.ts carga este archivo con
// Node, sin el alias "@/".
import type { ScheduledTrip } from '../types/transport.ts';
import type { StaticServiceDay } from './static-service-patterns.ts';

export interface OperatorTimetable {
  /** Sentido del GTFS cuyas salidas reemplaza esos días: "<routeId>#<directionId>". */
  scheduleKey: string;
  /** "201 → Concepción": pruebas y calidad de datos. */
  label: string;
  /** De dónde salen, como lo nombra el operador ("Santa Juana"): la ficha de paradero lo muestra. */
  origin: string;
  days: readonly StaticServiceDay[];
  /** [salidaMin, duraciónMin] ordenadas por salida, tal como las publica el operador. */
  trips: readonly ScheduledTrip[];
  sourceLabel: string;
  sourceUrl: string;
  note: string;
}

function min(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** "06:30 06:40 …" con la duración de casi todas y las salidas que duran otra cosa. */
function departures(list: string, durationMin: number, exceptions: Record<string, number>): ScheduledTrip[] {
  return list
    .trim()
    .split(/\s+/)
    .map((hhmm): ScheduledTrip => [min(hhmm), exceptions[hhmm] ?? durationMin]);
}

const KUPOS_SOURCE_LABEL = 'Transportes Santa Juana · salidas a la venta en kupos.cl (25-11-2026)';
const KUPOS_NOTE =
  'Lista de venta del operador del miércoles 25-11-2026, la única fecha leída: el visor la usa de lunes a viernes. No separa la 201 de la 201-AU. La página de la empresa en kupos.cl (/es/pasajes/bus/transportes-santa-juana) dice que desde Santa Juana la primera sale a las 05:30, pero la lista del día empieza a las 06:30.';

export const OPERATOR_TIMETABLES: readonly OperatorTimetable[] = [
  {
    scheduleKey: 'gtfs-route-949#0',
    label: '201 → Concepción',
    origin: 'Santa Juana',
    days: ['weekday'],
    // 1 h 54 min; la de 07:01, 2 h 23 min.
    trips: departures(
      '06:30 06:40 06:50 07:01 07:10 07:15 07:30 07:45 07:50 08:01 08:10 08:20 08:35 08:55 09:10 09:20 09:40 ' +
        '10:01 10:20 10:40 11:01 11:20 11:40 12:01 12:10 12:20 12:40 13:00 13:20 13:40 14:01 14:30 14:45 15:00 ' +
        '15:15 15:30 15:45 16:01 16:10 16:20 16:40 17:01 17:10 17:20 17:40 18:05 18:15 18:30 19:15 19:30 20:05 ' +
        '21:05 22:01',
      114,
      { '07:01': 143 },
    ),
    sourceLabel: KUPOS_SOURCE_LABEL,
    sourceUrl: 'https://kupos.cl/en/bus/tickets/santa-juana/concepcion',
    note: KUPOS_NOTE,
  },
  {
    scheduleKey: 'gtfs-route-949#1',
    label: '201 → Santa Juana',
    origin: 'Concepción',
    days: ['weekday'],
    // 1 h 57 min; la de 13:20, 2 h.
    trips: departures(
      '06:15 06:40 07:01 07:15 07:30 07:45 08:01 08:20 08:40 09:01 09:15 09:30 09:45 10:01 10:15 10:30 10:45 ' +
        '11:01 11:20 11:40 12:01 12:15 12:30 13:01 13:20 13:40 14:01 14:10 14:20 14:40 15:01 15:10 15:20 15:40 ' +
        '16:01 16:15 16:30 16:45 16:50 17:01 17:05 17:20 17:30 17:35 17:45 18:01 18:10 18:15 18:30 18:40 18:50 ' +
        '19:01 19:20 19:40 20:01 20:25 21:01 21:30 22:05 23:05',
      117,
      { '13:20': 120 },
    ),
    sourceLabel: KUPOS_SOURCE_LABEL,
    sourceUrl: 'https://kupos.cl/en/bus/tickets/concepcion/santa-juana',
    note: KUPOS_NOTE,
  },
];

export function operatorTimetablesOfRoute(routeId: string): OperatorTimetable[] {
  return OPERATOR_TIMETABLES.filter((timetable) => timetable.scheduleKey.startsWith(`${routeId}#`));
}
