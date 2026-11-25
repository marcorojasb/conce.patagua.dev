// El GTFS de la DTPR («Gran Concepción20250228») no trae itinerarios: sus
// viajes (trip_id "POT-…", sin block_id ni frequencies.txt) expanden un
// programa de operación a intervalo fijo. En día hábil casi todos los sentidos
// salen cada N min exactos de la primera a la última salida: la 201 trae 420
// salidas de ~2 h 46 min, cuando el operador vende ~113. Aquí se detecta ese
// programa por sentido y día, en tiempo de ejecución y sin regenerar datos.
//
// Imports relativos con extensión: scripts/validate-generated-data.ts carga
// este archivo (vía data-quality.ts) con Node, sin el alias "@/".
import type { RouteSchedule, ScheduledTrip } from '../types/transport.ts';

/** Con menos salidas, un intervalo parejo no dice nada (refuerzos de 1–5 viajes). */
export const FIXED_INTERVAL_MIN_TRIPS = 12;
/**
 * Parte de los intervalos entre salidas consecutivas que debe ser igual al más
 * frecuente, ±1 min: el programa redondea a minutos enteros (cada 30 o 31 min
 * cuando reparte dos por hora en una ventana que no calza).
 */
export const FIXED_INTERVAL_MIN_SHARE = 0.8;

export interface FixedIntervalProgram {
  /** Primera salida (min desde 00:00; puede pasar de 1440). */
  first: number;
  last: number;
  /** Intervalo más frecuente (moda). */
  headwayMin: number;
  /** Mediana de las duraciones. */
  durationMin: number;
  trips: number;
  /** 0..1: intervalos iguales a la moda (±1 min) / intervalos. */
  share: number;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/** Salidas de UN sentido en UN día: programa a intervalo fijo, o null. */
export function fixedIntervalProgram(trips: readonly ScheduledTrip[]): FixedIntervalProgram | null {
  if (trips.length < FIXED_INTERVAL_MIN_TRIPS) return null;
  const starts = trips.map(([start]) => start).sort((a, b) => a - b);
  const gapCounts = new Map<number, number>();
  for (let i = 1; i < starts.length; i++) {
    const gap = starts[i] - starts[i - 1];
    if (gap > 0) gapCounts.set(gap, (gapCounts.get(gap) ?? 0) + 1);
  }
  let headwayMin = 0;
  let modeCount = 0;
  for (const [gap, count] of gapCounts) {
    if (count > modeCount || (count === modeCount && gap < headwayMin)) {
      headwayMin = gap;
      modeCount = count;
    }
  }
  let even = 0;
  for (const [gap, count] of gapCounts) if (Math.abs(gap - headwayMin) <= 1) even += count;
  const share = even / (starts.length - 1);
  if (share < FIXED_INTERVAL_MIN_SHARE) return null;
  return {
    first: starts[0],
    last: starts[starts.length - 1],
    headwayMin,
    durationMin: median(trips.map(([, duration]) => duration)),
    trips: trips.length,
    share,
  };
}

/**
 * Máximo de viajes en ruta a la vez. Intervalos cerrados [salida, salida +
 * duración], como computeActiveVehicles: a igual minuto, las salidas cuentan
 * antes que las llegadas. `at` es el minuto en que se alcanza por primera vez
 * (null sin viajes).
 */
export function peakInTransit(trips: readonly ScheduledTrip[]): { peak: number; at: number | null } {
  const events: [minute: number, delta: number][] = [];
  for (const [start, duration] of trips) events.push([start, 1], [start + duration, -1]);
  events.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  let current = 0;
  let peak = 0;
  let at: number | null = null;
  for (const [minute, delta] of events) {
    current += delta;
    if (current > peak) {
      peak = current;
      at = minute;
    }
  }
  return { peak, at };
}

/**
 * Ralea, día por día, las salidas de programa de un grupo de sentidos que
 * comparten flota para que nunca haya más de `buses` en ruta a la vez. Cada
 * sentido de programa conserva las salidas 0, k, 2k… con el primer k que cabe;
 * los demás sentidos (listas del operador, refuerzos) no se tocan. Si ni con
 * una salida por sentido cabe, el programa queda vacío ese día.
 *
 * No muta la entrada: el GTFS decodificado comparte el mismo arreglo entre
 * lunes y viernes. Los días sin cambios conservan el arreglo original.
 */
export function capToFleet(schedules: readonly RouteSchedule[], buses: number): RouteSchedule[] {
  const result = schedules.map((schedule) => [...schedule] as RouteSchedule);
  for (let day = 0; day < 7; day++) {
    const fixed: ScheduledTrip[] = [];
    const programs: { index: number; trips: ScheduledTrip[] }[] = [];
    schedules.forEach((schedule, index) => {
      const trips = schedule[day];
      if (fixedIntervalProgram(trips)) programs.push({ index, trips: [...trips].sort((a, b) => a[0] - b[0]) });
      else fixed.push(...trips);
    });
    if (programs.length === 0) continue;

    const longest = Math.max(...programs.map((program) => program.trips.length));
    let kept: ScheduledTrip[][] | null = null;
    let step = 1;
    for (; step <= longest; step++) {
      const candidate = programs.map((program) => program.trips.filter((_, i) => i % step === 0));
      if (peakInTransit([...fixed, ...candidate.flat()]).peak <= buses) {
        kept = candidate;
        break;
      }
    }
    if (step === 1) continue;
    programs.forEach((program, i) => {
      result[program.index][day] = (kept?.[i] ?? []).map(([start, duration]): ScheduledTrip => [start, duration]);
    });
  }
  return result;
}
