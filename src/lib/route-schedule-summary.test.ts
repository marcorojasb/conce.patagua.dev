import { describe, expect, it } from 'vitest';
import type { StopServiceWindow } from '@/data/gtfs-stop-services.generated';
import {
  departuresByHour,
  summarizeDay,
  summarizeToday,
  summarizeWindowsDay,
  summarizeWindowsToday,
} from '@/lib/route-schedule-summary';
import type { RouteSchedule, ScheduledTrip } from '@/types/transport';

function every(fromMin: number, toMin: number, stepMin: number, durationMin = 60): ScheduledTrip[] {
  const trips: ScheduledTrip[] = [];
  for (let t = fromMin; t <= toMin; t += stepMin) trips.push([t, durationMin]);
  return trips;
}

function weekdaysOnly(trips: ScheduledTrip[]): RouteSchedule {
  return [trips, trips, trips, trips, trips, [], []];
}

// Lunes a viernes 06:00–22:00: cada 20 min hasta las 09:00 y luego cada 30.
const URBAN = weekdaysOnly([...every(360, 540, 20), ...every(570, 1320, 30)]);

// 2026-05-18 es lunes; en mayo Chile está en CLT (-04).
const MONDAY_0830 = new Date('2026-05-18T08:30:00-04:00');

describe('summarizeToday', () => {
  it('resume hoy con primera y última salida, total, intervalo y próxima', () => {
    const summary = summarizeToday([URBAN], MONDAY_0830);
    expect(summary.day).toBe(0);
    expect(summary.first).toBe(360);
    expect(summary.last).toBe(1320);
    expect(summary.departures).toBe(10 + 26);
    expect(summary.operatingNow).toBe(true);
    // Ventana 07:30–09:30: salidas 07:40…09:00 cada 20 y 09:30 (30 después).
    expect(summary.headwayNow).toBe(20);
    expect(summary.nextDeparture).toEqual({ minutes: 520, dayOffset: 0 });
  });

  it('cuenta una salida exacta a la hora actual como próxima', () => {
    const summary = summarizeToday([URBAN], new Date('2026-05-18T08:40:00-04:00'));
    expect(summary.nextDeparture).toEqual({ minutes: 520, dayOffset: 0 });
  });

  it('usa hora de Chile aunque el instante UTC ya sea otro día', () => {
    // 01:35Z del martes = 21:35 del lunes en Chile (CLT).
    const summary = summarizeToday([URBAN], new Date('2026-05-19T01:35:00Z'));
    expect(summary.day).toBe(0);
    expect(summary.nextDeparture).toEqual({ minutes: 1320, dayOffset: 0 });
    expect(summary.headwayNow).toBe(30);
  });

  it('sin servicio de madrugada: no opera, sin intervalo y próxima a las 06:00', () => {
    const summary = summarizeToday([URBAN], new Date('2026-05-18T03:00:00-04:00'));
    expect(summary.operatingNow).toBe(false);
    expect(summary.headwayNow).toBeNull();
    expect(summary.nextDeparture).toEqual({ minutes: 360, dayOffset: 0 });
  });

  it('pasada la última salida, la próxima es mañana', () => {
    const summary = summarizeToday([URBAN], new Date('2026-05-18T23:30:00-04:00'));
    expect(summary.operatingNow).toBe(false);
    expect(summary.nextDeparture).toEqual({ minutes: 360, dayOffset: 1 });
  });

  it('el viernes de noche salta el fin de semana hasta el lunes', () => {
    const summary = summarizeToday([URBAN], new Date('2026-05-22T23:00:00-04:00'));
    expect(summary.day).toBe(4);
    expect(summary.nextDeparture).toEqual({ minutes: 360, dayOffset: 3 });
  });

  it('un día sin viajes resume cero salidas', () => {
    const summary = summarizeToday([URBAN], new Date('2026-05-23T12:00:00-04:00'));
    expect(summary.day).toBe(5);
    expect(summary).toMatchObject({
      first: null,
      last: null,
      departures: 0,
      medianHeadway: null,
      operatingNow: false,
      headwayNow: null,
    });
  });

  it('un viaje nocturno de ayer (> 24:00) sigue operando de madrugada', () => {
    const night: RouteSchedule = [[[1470, 40]], [], [], [], [], [], []];
    // Martes 00:45 en Chile: el viaje del lunes salió a las 24:30.
    const summary = summarizeToday([night], new Date('2026-05-19T00:45:00-04:00'));
    expect(summary.day).toBe(1);
    expect(summary.operatingNow).toBe(true);
    expect(summary.departures).toBe(0);
    expect(summary.nextDeparture).toEqual({ minutes: 30, dayOffset: 7 });
  });

  it('una salida nocturna del día de hoy cuenta como próxima de madrugada de mañana', () => {
    const night: RouteSchedule = [[[1380, 30], [1470, 30]], [], [], [], [], [], []];
    const summary = summarizeToday([night], new Date('2026-05-18T23:30:00-04:00'));
    expect(summary.last).toBe(1470);
    expect(summary.nextDeparture).toEqual({ minutes: 30, dayOffset: 1 });
  });

  it('mide el intervalo dentro de cada sentido y suma salidas de ambos', () => {
    const forward = weekdaysOnly(every(360, 1320, 48, 54));
    const reverse = weekdaysOnly(every(360, 1320, 48, 54));
    const summary = summarizeToday([forward, reverse], MONDAY_0830);
    expect(summary.departures).toBe(2 * 21);
    expect(summary.headwayNow).toBe(48);
    expect(summary.medianHeadway).toBe(48);
  });

  it('funciona en horario de verano (CLST, -03)', () => {
    const summary = summarizeToday([URBAN], new Date('2026-11-24T08:30:00-03:00'));
    expect(summary.day).toBe(1);
    expect(summary.nextDeparture).toEqual({ minutes: 520, dayOffset: 0 });
  });
});

describe('summarizeDay', () => {
  it('usa la mediana de intervalos del día', () => {
    expect(summarizeDay([URBAN], 0).medianHeadway).toBe(30);
  });
});

describe('departuresByHour', () => {
  it('cuenta salidas por hora de reloj', () => {
    const hours = departuresByHour([URBAN], 0);
    expect(hours).toHaveLength(24);
    expect(hours[5]).toBe(0);
    expect(hours[6]).toBe(3);
    expect(hours[9]).toBe(2); // 09:00 y 09:30
    expect(hours[22]).toBe(1);
    expect(hours.reduce((a, b) => a + b, 0)).toBe(36);
  });

  it('suma sentidos y lleva las nocturnas a su hora de madrugada', () => {
    const a: RouteSchedule = [[[480, 30], [1470, 30]], [], [], [], [], [], []];
    const b: RouteSchedule = [[[490, 30]], [], [], [], [], [], []];
    const hours = departuresByHour([a, b], 0);
    expect(hours[8]).toBe(2);
    expect(hours[0]).toBe(1);
  });
});

describe('ventanas de paso (respaldo sin viajes)', () => {
  // Lunes a viernes 06:00–23:30 cada 20 min (57 pasadas); el sábado solo
  // trae una ventana 00:00–00:00 sin horas reales.
  const WINDOWS: StopServiceWindow[] = [
    ...[0, 1, 2, 3, 4].map(
      (day): StopServiceWindow => ['gtfs-route-1', 'Centro', day, 360, 1410, 20, 57],
    ),
    ['gtfs-route-1', 'Centro', 5, 0, 0, 0, 1],
  ];

  it('resume el día con la ventana e ignora las de 00:00 sin horas', () => {
    expect(summarizeWindowsDay(WINDOWS, 0)).toEqual({
      first: 360,
      last: 1410,
      departures: 57,
      medianHeadway: 20,
    });
    expect(summarizeWindowsDay(WINDOWS, 5).departures).toBe(0);
  });

  it('dentro de la ventana opera con su intervalo y no inventa la próxima salida', () => {
    const summary = summarizeWindowsToday(WINDOWS, MONDAY_0830);
    expect(summary.operatingNow).toBe(true);
    expect(summary.headwayNow).toBe(20);
    expect(summary.nextDeparture).toBeNull();
  });

  it('fuera de la ventana da la primera pasada siguiente', () => {
    const early = summarizeWindowsToday(WINDOWS, new Date('2026-05-18T04:00:00-04:00'));
    expect(early.operatingNow).toBe(false);
    expect(early.headwayNow).toBeNull();
    expect(early.nextDeparture).toEqual({ minutes: 360, dayOffset: 0 });

    const friday = summarizeWindowsToday(WINDOWS, new Date('2026-05-22T23:45:00-04:00'));
    expect(friday.nextDeparture).toEqual({ minutes: 360, dayOffset: 3 });
  });
});
