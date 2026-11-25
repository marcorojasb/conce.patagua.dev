import { describe, expect, it } from 'vitest';
import { ROUTE_DIRECTION_SCHEDULES } from '@/data/gtfs-schedule.generated';
import { STATIC_SERVICE_PATTERNS } from '@/data/static-service-patterns';
import { capToFleet, fixedIntervalProgram, peakInTransit } from '@/lib/schedule-program';
import { expandFrequencyWindow } from '@/realtime/static-service-schedules';
import type { RouteSchedule, ScheduledTrip } from '@/types/transport';

function tripsFromGaps(first: number, gaps: readonly number[], duration = 30): ScheduledTrip[] {
  const trips: ScheduledTrip[] = [[first, duration]];
  for (const gap of gaps) trips.push([trips[trips.length - 1][0] + gap, duration]);
  return trips;
}

function everyMinutes(first: number, count: number, headway: number, duration: number): ScheduledTrip[] {
  return Array.from({ length: count }, (_, i): ScheduledTrip => [first + i * headway, duration]);
}

function week(trips: ScheduledTrip[]): RouteSchedule {
  return [trips, trips, trips, trips, trips, trips, trips];
}

describe('fixedIntervalProgram', () => {
  it('detecta 20 salidas cada 5 min, aunque vengan desordenadas', () => {
    const trips = everyMinutes(360, 20, 5, 40);
    const program = { first: 360, last: 455, headwayMin: 5, durationMin: 40, trips: 20, share: 1 };
    expect(fixedIntervalProgram(trips)).toEqual(program);
    expect(fixedIntervalProgram([...trips].reverse())).toEqual(program);
  });

  it('con 11 salidas no dice nada', () => {
    expect(fixedIntervalProgram(everyMinutes(360, 11, 5, 40))).toBeNull();
  });

  it('exige que al menos el 80 % de los intervalos sean el más frecuente', () => {
    const below = tripsFromGaps(360, [...Array(15).fill(5), ...Array(5).fill(7)]);
    const atThreshold = tripsFromGaps(360, [...Array(16).fill(5), ...Array(4).fill(7)]);
    expect(fixedIntervalProgram(below)).toBeNull();
    expect(fixedIntervalProgram(atThreshold)).toMatchObject({ headwayMin: 5, trips: 21, share: 0.8 });
  });

  it('cuenta las salidas repetidas como intervalos de 0', () => {
    const trips = everyMinutes(360, 20, 5, 40);
    const repeated = [...trips, ...trips.slice(0, 5)];
    expect(fixedIntervalProgram(repeated)).toBeNull();
  });

  it('cuenta como iguales los intervalos que difieren en 1 min por redondeo (30/31)', () => {
    // Como el sábado de la 44EU: 18 de 30 min, 8 de 31 y un hueco de mediodía.
    const trips = tripsFromGaps(360, [...Array(10).fill(30), ...Array(8).fill(31), 123, ...Array(8).fill(30)]);
    expect(fixedIntervalProgram(trips)).toMatchObject({ headwayMin: 30, trips: 28, share: 26 / 27 });
    // ±2 ya no es redondeo.
    const wider = tripsFromGaps(360, [...Array(18).fill(30), ...Array(8).fill(32)]);
    expect(fixedIntervalProgram(wider)).toBeNull();
  });

  it('marca el programa de fin de semana de la 44EU y la 23CH, que redondea a 30 y 31 min', () => {
    for (const key of ['gtfs-route-832#0', 'gtfs-route-832#1', 'gtfs-route-845#0']) {
      for (const day of [5, 6]) {
        expect(fixedIntervalProgram(ROUTE_DIRECTION_SCHEDULES[key][day]), `${key} día ${day}`).toMatchObject({
          headwayMin: 30,
        });
      }
    }
  });

  it('no marca los itinerarios de EFE del Biotrén', () => {
    expect(STATIC_SERVICE_PATTERNS).toHaveLength(12);
    for (const pattern of STATIC_SERVICE_PATTERNS) {
      expect(fixedIntervalProgram(expandFrequencyWindow(pattern)), pattern.id).toBeNull();
    }
  });

  it('marca el programa GTFS de la 201 hacia Concepción en día hábil', () => {
    expect(fixedIntervalProgram(ROUTE_DIRECTION_SCHEDULES['gtfs-route-949#0'][0])).toMatchObject({
      headwayMin: 5,
      trips: 220,
      first: 338,
      last: 1433,
    });
  });
});

describe('peakInTransit', () => {
  it('usa intervalos cerrados: la que sale cuando la otra llega cuenta las dos', () => {
    expect(peakInTransit([[0, 10], [10, 10]])).toEqual({ peak: 2, at: 10 });
    expect(peakInTransit([[0, 10], [11, 10]])).toEqual({ peak: 1, at: 0 });
    expect(peakInTransit([])).toEqual({ peak: 0, at: null });
  });
});

describe('capToFleet', () => {
  const programA = everyMinutes(360, 193, 5, 60);
  const programB = everyMinutes(365, 193, 5, 60);
  const irregular: ScheduledTrip[] = [[400, 60], [430, 60], [500, 60], [640, 60], [700, 60]];

  it('ralea el programa hasta caber en la flota y conserva la primera salida', () => {
    const capped = capToFleet([week(programA), week(programB)], 10);
    for (let day = 0; day < 7; day++) {
      expect(peakInTransit([...capped[0][day], ...capped[1][day]]).peak).toBeLessThanOrEqual(10);
      expect(capped[0][day][0]).toEqual(programA[0]);
      expect(capped[1][day][0]).toEqual(programB[0]);
      expect(capped[0][day].length).toBeLessThan(programA.length);
    }
  });

  it('no toca un sentido que no es programa', () => {
    const fixed = week(irregular);
    const capped = capToFleet([week(programA), fixed], 6);
    for (let day = 0; day < 7; day++) {
      expect(capped[1][day]).toBe(irregular);
      expect(peakInTransit([...capped[0][day], ...capped[1][day]]).peak).toBeLessThanOrEqual(6);
    }
  });

  it('deja el día igual si ya cabe', () => {
    const schedule = week(programA);
    expect(capToFleet([schedule], 100)[0][0]).toBe(programA);
  });

  it('no muta la entrada, aunque los días compartan arreglo', () => {
    const input = [week(programA), week(irregular)];
    const before = structuredClone(input);
    capToFleet(input, 4);
    expect(input).toEqual(before);
    expect(input[0][0]).toBe(input[0][4]);
  });

  it('vacía el programa si el sentido fijo solo ya supera la flota', () => {
    const crowded = everyMinutes(400, 8, 1, 100);
    const capped = capToFleet([week(programA), week(crowded)], 5);
    for (let day = 0; day < 7; day++) {
      expect(capped[0][day]).toEqual([]);
      expect(capped[1][day]).toBe(crowded);
    }
  });
});
