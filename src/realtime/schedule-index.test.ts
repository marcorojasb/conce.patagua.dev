import { describe, expect, it } from 'vitest';
import { KNOWN_FLEETS } from '@/data/fleets';
import { ROUTE_DIRECTION_SCHEDULES } from '@/data/gtfs-schedule.generated';
import { OPERATOR_TIMETABLES } from '@/data/operator-timetables';
import { peakInTransit } from '@/lib/schedule-program';
import { capToKnownFleets, loadScheduleIndex, withOperatorTimetables } from '@/realtime/schedule-index';
import type { ScheduledTrip } from '@/types/transport';

const SJ_CON = 'gtfs-route-949#0';
const CON_SJ = 'gtfs-route-949#1';

function keysOfRoutes(index: Record<string, unknown>, routeIds: readonly string[]): string[] {
  return Object.keys(index).filter((key) => routeIds.includes(key.slice(0, key.lastIndexOf('#'))));
}

describe('withOperatorTimetables', () => {
  it('reemplaza solo los días hábiles de la 201 y no muta el GTFS', () => {
    const before = ROUTE_DIRECTION_SCHEDULES[SJ_CON][0].length;
    const index = withOperatorTimetables(ROUTE_DIRECTION_SCHEDULES);
    for (const key of [SJ_CON, CON_SJ]) {
      const timetable = OPERATOR_TIMETABLES.find((t) => t.scheduleKey === key)!;
      for (let day = 0; day < 5; day++) expect(index[key][day]).toEqual(timetable.trips);
      expect(index[key][5]).toBe(ROUTE_DIRECTION_SCHEDULES[key][5]);
      expect(index[key][6]).toBe(ROUTE_DIRECTION_SCHEDULES[key][6]);
    }
    expect(index['gtfs-route-950#0']).toBe(ROUTE_DIRECTION_SCHEDULES['gtfs-route-950#0']);
    expect(ROUTE_DIRECTION_SCHEDULES[SJ_CON][0]).toHaveLength(before);
    expect(before).toBe(220);
  });

  it('ignora una lista cuyo sentido no existe', () => {
    const index = withOperatorTimetables(ROUTE_DIRECTION_SCHEDULES, [
      { ...OPERATOR_TIMETABLES[0], scheduleKey: 'gtfs-route-0#0' },
    ]);
    expect(index).not.toHaveProperty(['gtfs-route-0#0']);
    expect(Object.keys(index)).toHaveLength(Object.keys(ROUTE_DIRECTION_SCHEDULES).length);
  });
});

describe('capToKnownFleets', () => {
  const index = withOperatorTimetables(ROUTE_DIRECTION_SCHEDULES);
  const capped = capToKnownFleets(index);

  it('nunca pone más micros en ruta que buses tiene la flota, también al cruzar medianoche', () => {
    for (const fleet of KNOWN_FLEETS) {
      const keys = keysOfRoutes(capped, fleet.routeIds);
      expect(keys.length, fleet.id).toBeGreaterThan(0);
      for (let day = 0; day < 7; day++) {
        const yesterday = (day + 6) % 7;
        const trips: ScheduledTrip[] = [
          ...keys.flatMap((key) => capped[key][day]),
          ...keys.flatMap((key) => capped[key][yesterday].map(([s, d]): ScheduledTrip => [s - 1440, d])),
        ];
        expect(peakInTransit(trips).peak, `${fleet.id} día ${day}`).toBeLessThanOrEqual(fleet.buses);
      }
    }
  });

  it('deja igual lo que ya cabe y ralea lo que no', () => {
    const tome = KNOWN_FLEETS.find((f) => f.id === 'tome')!;
    for (const key of keysOfRoutes(index, tome.routeIds)) {
      for (let day = 0; day < 7; day++) expect(capped[key][day]).toBe(index[key][day]);
    }
    const un80 = KNOWN_FLEETS.find((f) => f.id === 'un80')!;
    const weekdayTrips = (source: typeof index) =>
      keysOfRoutes(source, un80.routeIds).reduce((sum, key) => sum + source[key][0].length, 0);
    expect(weekdayTrips(capped)).toBeLessThan(weekdayTrips(index));
    // La lista del operador de la 201 no se ralea.
    expect(capped[SJ_CON][0]).toBe(index[SJ_CON][0]);
  });

  it('no toca los recorridos sin flota conocida', () => {
    expect(capped['gtfs-route-877#0']).toBe(index['gtfs-route-877#0']);
  });
});

describe('loadScheduleIndex', () => {
  it('junta el GTFS con las listas del operador y los itinerarios de EFE', async () => {
    const index = await loadScheduleIndex();
    expect(index[SJ_CON][0]).toHaveLength(53);
    expect(index[SJ_CON][5]).toBe(ROUTE_DIRECTION_SCHEDULES[SJ_CON][5]);
    expect(index['bt-l2-coronel-concepcion-weekday'][0].length).toBeGreaterThan(0);
    expect(await loadScheduleIndex()).toBe(index);
  });
});
