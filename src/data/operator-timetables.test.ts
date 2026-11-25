import { describe, expect, it } from 'vitest';
import { GTFS_BUS_ROUTES } from '@/data/gtfs-bus-routes.generated';
import { knownFleetOfRoute } from '@/data/fleets';
import { OPERATOR_TIMETABLES, operatorTimetablesOfRoute } from '@/data/operator-timetables';
import { fixedIntervalProgram, peakInTransit } from '@/lib/schedule-program';

const byKey = new Map(OPERATOR_TIMETABLES.map((timetable) => [timetable.scheduleKey, timetable]));
const toConcepcion = byKey.get('gtfs-route-949#0')!;
const toSantaJuana = byKey.get('gtfs-route-949#1')!;

describe('salidas del operador de la 201 (kupos.cl, 25-11-2026)', () => {
  it('trae 53 salidas desde Santa Juana y 60 desde Concepción, ordenadas', () => {
    expect(toConcepcion.trips).toHaveLength(53);
    expect(toSantaJuana.trips).toHaveLength(60);
    for (const timetable of OPERATOR_TIMETABLES) {
      const starts = timetable.trips.map(([start]) => start);
      expect(starts).toEqual([...starts].sort((a, b) => a - b));
      expect(new Set(starts).size).toBe(starts.length);
    }
    expect([toConcepcion.trips[0][0], toConcepcion.trips.at(-1)![0]]).toEqual([390, 1321]);
    expect([toSantaJuana.trips[0][0], toSantaJuana.trips.at(-1)![0]]).toEqual([375, 1385]);
  });

  it('dura lo que publica el operador, con sus dos excepciones', () => {
    const durations = (trips: readonly (readonly [number, number])[]) =>
      new Map(trips.map(([start, duration]) => [start, duration]));
    const sjCon = durations(toConcepcion.trips);
    const conSj = durations(toSantaJuana.trips);
    expect(sjCon.get(7 * 60 + 1)).toBe(143);
    expect(conSj.get(13 * 60 + 20)).toBe(120);
    expect(toConcepcion.trips.filter(([, d]) => d !== 114)).toEqual([[421, 143]]);
    expect(toSantaJuana.trips.filter(([, d]) => d !== 117)).toEqual([[800, 120]]);
  });

  it('reemplaza sentidos reales del GTFS, cada uno hacia su destino', () => {
    const route = GTFS_BUS_ROUTES.find((r) => r.id === 'gtfs-route-949');
    expect(route?.ref).toBe('201');
    const destination = (directionId: number) =>
      route?.directions?.find((d) => d.directionId === directionId)?.destination;
    expect(destination(0)).toBe('Concepción');
    expect(destination(1)).toBe('Santa Juana');
    for (const timetable of OPERATOR_TIMETABLES) {
      const [routeId, directionId] = timetable.scheduleKey.split('#');
      const directions = GTFS_BUS_ROUTES.find((r) => r.id === routeId)?.directions ?? [];
      expect(directions.map((d) => d.directionId)).toContain(Number(directionId));
      expect(timetable.days).toEqual(['weekday']);
    }
    expect(operatorTimetablesOfRoute('gtfs-route-949')).toHaveLength(2);
    expect(operatorTimetablesOfRoute('gtfs-route-94')).toHaveLength(0);
  });

  it('no es un programa a intervalo fijo y cabe en la flota de la 201', () => {
    expect(fixedIntervalProgram(toConcepcion.trips)).toBeNull();
    expect(fixedIntervalProgram(toSantaJuana.trips)).toBeNull();
    const fleet = knownFleetOfRoute('gtfs-route-949');
    expect(fleet?.buses).toBe(23);
    expect(peakInTransit([...toConcepcion.trips, ...toSantaJuana.trips]).peak).toBeLessThanOrEqual(fleet!.buses);
  });
});
