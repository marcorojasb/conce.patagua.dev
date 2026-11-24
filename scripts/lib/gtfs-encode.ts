// Formatos compactos para los módulos generados de horarios y de ventanas por
// paradero. El feed oficial trae el doble de viajes que el GTFS 2019 (~57 mil)
// y en el formato plano esos chunks superaban su presupuesto
// (scripts/check-bundle-budget.ts). Cada módulo se decodifica al cargarse y
// exporta exactamente las mismas formas que antes, así que la app no cambia.
//
// - Horarios: salidas como diferencia con el viaje anterior (la programación
//   oficial es muy regular: "+5 min, 125 min" se repite y gzip lo aplasta) y
//   días idénticos (lunes a viernes) guardados una sola vez.
// - Ventanas por paradero: los días con la misma ventana van juntos en una
//   máscara de bits, y ruta/headsign se referencian por índice.

import type { RouteSchedule, ScheduledTrip } from '../../src/types/transport.ts';

export type StopServiceWindow = [
  routeId: string,
  headsign: string,
  day: number,
  firstMin: number,
  lastMin: number,
  medianHeadwayMin: number,
  count: number,
];

const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function sameTrips(a: readonly ScheduledTrip[], b: readonly ScheduledTrip[]): boolean {
  return a.length === b.length && a.every((trip, i) => trip[0] === b[i][0] && trip[1] === b[i][1]);
}

/** Días ya ordenados por salida → literal `[[Δ,dur,…],0,0,0,0,[…],[…]]`. */
export function encodeScheduleDays(schedule: RouteSchedule): string {
  const days = schedule.map((trips, day) => {
    const earlier = schedule.findIndex((other) => sameTrips(other, trips));
    if (earlier < day) return String(earlier);
    let previous = 0;
    const flat: number[] = [];
    for (const [start, duration] of trips) {
      flat.push(start - previous, duration);
      previous = start;
    }
    return `[${flat.join(',')}]`;
  });
  return `[${days.join(',')}]`;
}

export function renderScheduleModule(options: {
  banner: string;
  directionSchedules: ReadonlyMap<string, RouteSchedule>;
  meta: Record<string, string | number>;
}): string {
  const body = Array.from(options.directionSchedules.entries())
    .sort((a, b) => byText(a[0], b[0]))
    .map(([key, schedule]) => `  ${JSON.stringify(key)}: ${encodeScheduleDays(schedule)},`)
    .join('\n');
  return `${options.banner}
import type { RouteSchedule, ScheduledTrip } from '@/types/transport';

// Cada día es [Δsalida, duración, Δsalida, duración, …] (Δ respecto de la
// salida anterior) o el índice de un día anterior idéntico (martes = lunes).
type EncodedDay = number[] | number;

function decodeSchedule(days: EncodedDay[]): RouteSchedule {
  const decoded: ScheduledTrip[][] = [];
  for (const day of days) {
    if (typeof day === 'number') {
      decoded.push(decoded[day]);
      continue;
    }
    const trips: ScheduledTrip[] = [];
    for (let i = 0, start = 0; i < day.length; i += 2) {
      start += day[i];
      trips.push([start, day[i + 1]]);
    }
    decoded.push(trips);
  }
  return decoded as RouteSchedule;
}

const ENCODED: Record<string, EncodedDay[]> = {
${body}
};

/** Por sentido: clave "gtfs-route-<id>#<direction_id>". */
export const ROUTE_DIRECTION_SCHEDULES: Record<string, RouteSchedule> = {};
/** Ambos sentidos juntos por ruta, ordenados por salida. */
export const ROUTE_SCHEDULES: Record<string, RouteSchedule> = {};
for (const [key, days] of Object.entries(ENCODED)) {
  const schedule = decodeSchedule(days);
  ROUTE_DIRECTION_SCHEDULES[key] = schedule;
  const merged = (ROUTE_SCHEDULES[key.slice(0, key.lastIndexOf('#'))] ??= [[], [], [], [], [], [], []]);
  schedule.forEach((trips, day) => merged[day].push(...trips));
}
for (const schedule of Object.values(ROUTE_SCHEDULES)) {
  for (const trips of schedule) trips.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

export const SCHEDULE_META = ${JSON.stringify(options.meta, null, 2)} as const;
`;
}

/**
 * Orden canónico de las ventanas de un paradero: día, primera pasada, ruta,
 * headsign (el mismo que producía el extractor sqlite, más desempates).
 */
export function compareStopServiceWindows(a: StopServiceWindow, b: StopServiceWindow): number {
  return a[2] - b[2] || a[3] - b[3] || byText(a[0], b[0]) || byText(a[1], b[1]);
}

export function renderStopServicesModule(options: {
  banner: string;
  windowsByStop: ReadonlyMap<string, readonly StopServiceWindow[]>;
  meta: Record<string, string | number>;
}): string {
  const services: Array<[string, string]> = [];
  const serviceKeys = new Set<string>();
  for (const windows of options.windowsByStop.values()) {
    for (const [routeId, headsign] of windows) {
      const key = `${routeId}\t${headsign}`;
      if (serviceKeys.has(key)) continue;
      serviceKeys.add(key);
      services.push([routeId, headsign]);
    }
  }
  services.sort((a, b) => byText(a[0], b[0]) || byText(a[1], b[1]));
  const serviceIndex = new Map(services.map(([routeId, headsign], i) => [`${routeId}\t${headsign}`, i]));

  const body = Array.from(options.windowsByStop.entries())
    .sort((a, b) => byText(a[0], b[0]))
    .map(([stopId, windows]) => {
      // Mismo servicio y misma ventana en varios días → un grupo con máscara.
      const groups = new Map<string, { window: StopServiceWindow; mask: number }>();
      for (const window of windows) {
        const [routeId, headsign, day, ...values] = window;
        const key = [routeId, headsign, ...values].join('\t');
        const group = groups.get(key);
        if (group) group.mask |= 1 << day;
        else groups.set(key, { window, mask: 1 << day });
      }
      const flat = Array.from(groups.values())
        .sort(
          (a, b) =>
            a.window[3] - b.window[3] ||
            byText(a.window[0], b.window[0]) ||
            byText(a.window[1], b.window[1]) ||
            a.mask - b.mask,
        )
        .flatMap(({ window, mask }) => [
          serviceIndex.get(`${window[0]}\t${window[1]}`)!,
          mask,
          window[3],
          window[4],
          window[5],
          window[6],
        ]);
      return `  ${JSON.stringify(stopId)}: [${flat.join(',')}],`;
    })
    .join('\n');

  return `${options.banner}
export type StopServiceWindow = [
  routeId: string,
  headsign: string,
  day: number,
  firstMin: number,
  lastMin: number,
  medianHeadwayMin: number,
  count: number,
];

// [routeId, headsign] referenciados por índice desde ENCODED.
const SERVICES: Array<[routeId: string, headsign: string]> = ${JSON.stringify(services)};

// Por paradero, grupos de 6 números: [servicio, días, firstMin, lastMin,
// medianHeadwayMin, count]. \`días\` es una máscara de bits (bit 0 = lunes …
// bit 6 = domingo) que junta los días con la misma ventana.
const ENCODED: Record<string, number[]> = {
${body}
};

export const STOP_SERVICE_WINDOWS: Record<string, StopServiceWindow[]> = {};
for (const [stopId, groups] of Object.entries(ENCODED)) {
  const windows: StopServiceWindow[] = [];
  for (let day = 0; day < 7; day++) {
    for (let i = 0; i < groups.length; i += 6) {
      if ((groups[i + 1] & (1 << day)) === 0) continue;
      const [routeId, headsign] = SERVICES[groups[i]];
      windows.push([routeId, headsign, day, groups[i + 2], groups[i + 3], groups[i + 4], groups[i + 5]]);
    }
  }
  STOP_SERVICE_WINDOWS[stopId] = windows;
}

export const STOP_SERVICE_WINDOWS_META = ${JSON.stringify(options.meta, null, 2)} as const;
`;
}
