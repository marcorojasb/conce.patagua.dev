// Resumen legible del horario de un recorrido (ficha de recorrido).
//
// Un RouteSchedule trae, por día (0=lunes), la lista de viajes
// [salidaMin, duraciónMin] en hora de Chile. Un recorrido tiene uno por
// sentido (ROUTE_DIRECTION_SCHEDULES en micros, un patrón EFE por sentido y
// tipo de día en Biotrén): se suman para contar salidas, pero el intervalo se
// mide dentro de cada uno, porque mezclar sentidos que salen a la misma hora
// desde cada extremo partiría el intervalo a la mitad (o a cero).
//
// Las salidas después de medianoche (>= 1440) pertenecen al día de servicio
// anterior: cuentan en las cifras de ese día y, de madrugada, como servicio
// "de ayer" todavía en curso.

import { chileClock } from '@/lib/chile-time';
import type { RouteSchedule } from '@/types/transport';

const DAY_MIN = 1440;
const HEADWAY_WINDOW_MIN = 60;
/** Cuántos días adelante buscar la próxima salida (cubre servicios de un solo día por semana). */
const LOOKAHEAD_DAYS = 7;

export interface DayServiceSummary {
  /** Primera salida del día de servicio, en minutos desde la medianoche (null si no hay). */
  first: number | null;
  /** Última salida; puede pasar de 1440 en servicios nocturnos. */
  last: number | null;
  departures: number;
  /** Mediana de los intervalos entre salidas consecutivas del mismo sentido. */
  medianHeadway: number | null;
}

export interface NextDeparture {
  /** Hora de reloj de la salida, 0..1439. */
  minutes: number;
  /** 0 = hoy, 1 = mañana… según el calendario de Chile. */
  dayOffset: number;
}

export interface RouteTodaySummary extends DayServiceSummary {
  /** Día de hoy en Chile, 0=lunes..6=domingo. */
  day: number;
  /** Hay al menos un viaje en curso según el horario (o dentro de la ventana de paso). */
  operatingNow: boolean;
  /** Intervalo típico entre salidas en ±60 min de ahora (null si no hay dos salidas). */
  headwayNow: number | null;
  nextDeparture: NextDeparture | null;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Intervalos > 0 entre salidas consecutivas de una lista de inicios. */
function gaps(starts: number[]): number[] {
  const sorted = [...starts].sort((a, b) => a - b);
  const out: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    if (gap > 0) out.push(gap);
  }
  return out;
}

/** Inicios de un sentido en la línea de tiempo de hoy: ayer en negativo, mañana sobre 1440. */
function startsAround(schedule: RouteSchedule, day: number, from: number, to: number): number[] {
  const starts: number[] = [];
  for (const offset of [-1, 0, 1]) {
    const bucket = schedule[(day + offset + 7) % 7];
    for (const [start] of bucket) {
      const t = start + offset * DAY_MIN;
      if (t >= from && t <= to) starts.push(t);
    }
  }
  return starts;
}

export function summarizeDay(schedules: readonly RouteSchedule[], day: number): DayServiceSummary {
  let first: number | null = null;
  let last: number | null = null;
  let departures = 0;
  const allGaps: number[] = [];
  for (const schedule of schedules) {
    const bucket = schedule[day];
    departures += bucket.length;
    for (const [start] of bucket) {
      if (first === null || start < first) first = start;
      if (last === null || start > last) last = start;
    }
    allGaps.push(...gaps(bucket.map(([start]) => start)));
  }
  return { first, last, departures, medianHeadway: median(allGaps) };
}

export function summarizeToday(schedules: readonly RouteSchedule[], now: Date): RouteTodaySummary {
  const { day, minutes: nowMin } = chileClock(now);

  let operatingNow = false;
  const nearbyGaps: number[] = [];
  for (const schedule of schedules) {
    // Viajes de ayer que cruzan la medianoche siguen en curso de madrugada.
    for (const offset of [-1, 0]) {
      for (const [start, duration] of schedule[(day + offset + 7) % 7]) {
        const t = start + offset * DAY_MIN;
        if (t <= nowMin && nowMin < t + duration) operatingNow = true;
      }
    }
    // Solo hay "intervalo ahora" si quedan salidas en la próxima hora: si la
    // siguiente sale en tres horas, los intervalos de la mañana no aplican.
    const upcoming = startsAround(schedule, day, nowMin, nowMin + HEADWAY_WINDOW_MIN);
    if (upcoming.length > 0) {
      nearbyGaps.push(
        ...gaps(startsAround(schedule, day, nowMin - HEADWAY_WINDOW_MIN, nowMin + HEADWAY_WINDOW_MIN)),
      );
    }
  }

  return {
    ...summarizeDay(schedules, day),
    day,
    operatingNow,
    headwayNow: median(nearbyGaps),
    nextDeparture: earliestStartFrom(day, nowMin, (d) =>
      schedules.flatMap((schedule) => schedule[d].map(([start]) => start)),
    ),
  };
}

/** Primer inicio >= ahora, mirando desde los nocturnos de ayer hasta una semana adelante. */
function earliestStartFrom(
  day: number,
  nowMin: number,
  startsOfDay: (day: number) => number[],
): NextDeparture | null {
  let next: number | null = null;
  for (let offset = -1; offset <= LOOKAHEAD_DAYS; offset++) {
    // Todo inicio del día `offset` es posterior a su medianoche: si ya hay
    // uno antes, los días siguientes no pueden mejorarlo.
    if (next !== null && offset * DAY_MIN > next) break;
    for (const start of startsOfDay((day + offset + 7) % 7)) {
      const t = start + offset * DAY_MIN;
      if (t >= nowMin && (next === null || t < next)) next = t;
    }
  }
  if (next === null) return null;
  const dayOffset = Math.floor(next / DAY_MIN);
  return { minutes: next - dayOffset * DAY_MIN, dayOffset };
}

/**
 * Salidas por hora de reloj (24 valores) para un día de servicio. Las
 * nocturnas (>= 24:00) se cuentan en su hora de madrugada del mismo gráfico.
 */
export function departuresByHour(schedules: readonly RouteSchedule[], day: number): number[] {
  const hours = Array.from({ length: 24 }, () => 0);
  for (const schedule of schedules) {
    for (const [start] of schedule[day]) {
      hours[Math.floor((start % DAY_MIN) / 60)] += 1;
    }
  }
  return hours;
}

/**
 * Todos los sentidos salen a intervalo fijo ese día (±1 min de redondeo),
 * como pasa con los horarios armados desde una frecuencia. Ahí la "hora con
 * más salidas" solo refleja dónde cae el borde de cada hora, no una punta.
 */
export function isEvenlySpaced(schedules: readonly RouteSchedule[], day: number): boolean {
  return schedules.every((schedule) => {
    const dayGaps = gaps(schedule[day].map(([start]) => start));
    return dayGaps.length === 0 || Math.max(...dayGaps) - Math.min(...dayGaps) <= 1;
  });
}
