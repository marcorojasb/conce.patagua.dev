import { describe, expect, it } from 'vitest';
import { isRouteOperatingAt, serviceSpansFromTrips } from '@/lib/operating-hours';
import type { ScheduledTrip } from '@/types/transport';

const hhmm = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));

function week(byDay: Partial<Record<number, ScheduledTrip[]>>): ScheduledTrip[][] {
  return Array.from({ length: 7 }, (_, day) => byDay[day] ?? []);
}

// 2026-05-18 es lunes; Chile en CLT (-04).
const monday = (time: string) => new Date(`2026-05-18T${time}:00-04:00`);
const saturday = (time: string) => new Date(`2026-05-23T${time}:00-04:00`);

describe('serviceSpansFromTrips', () => {
  it('merges overlapping trips and short gaps, and splits on long gaps', () => {
    const spans = serviceSpansFromTrips(
      week({
        0: [
          [hhmm('06:20'), 64],
          [hhmm('07:30'), 56], // 6 min después de llegar el anterior: mismo tramo
          [hhmm('12:17'), 56], // 3 h 51 min sin trenes: tramo nuevo
          [hhmm('15:37'), 56], // 2 h 24 min después: otro tramo
        ],
      }),
    );
    expect(spans[0]).toEqual([
      [hhmm('06:20'), hhmm('08:26')],
      [hhmm('12:17'), hhmm('13:13')],
      [hhmm('15:37'), hhmm('16:33')],
    ]);
    expect(spans.slice(1).every((day) => day.length === 0)).toBe(true);
  });

  it('sorts trips before merging', () => {
    const spans = serviceSpansFromTrips(week({ 2: [[600, 30], [480, 30], [540, 30]] }));
    expect(spans[2]).toEqual([[480, 630]]);
  });
});

describe('isRouteOperatingAt', () => {
  const route = {
    serviceSpans: serviceSpansFromTrips(
      week({
        0: [[hhmm('06:00'), 60], [hhmm('16:00'), 60]],
        6: [[hhmm('23:30'), 90]], // domingo: termina el lunes 01:00
      }),
    ),
  };

  it('follows the per-day schedule, including gaps without service', () => {
    expect(isRouteOperatingAt(route, monday('06:30'))).toBe(true);
    expect(isRouteOperatingAt(route, monday('11:00'))).toBe(false);
    expect(isRouteOperatingAt(route, monday('16:59'))).toBe(true);
    expect(isRouteOperatingAt(route, saturday('06:30'))).toBe(false);
  });

  it('keeps last night trips running after midnight', () => {
    expect(isRouteOperatingAt(route, monday('00:45'))).toBe(true);
    expect(isRouteOperatingAt(route, monday('01:30'))).toBe(false);
  });

  it('uses Chile time even when the UTC instant falls on another day', () => {
    // 2026-05-18T10:30Z = lunes 06:30 en Chile.
    expect(isRouteOperatingAt(route, new Date('2026-05-18T10:30:00Z'))).toBe(true);
    // 2026-05-19T00:30Z = lunes 20:30 en Chile: sin servicio.
    expect(isRouteOperatingAt(route, new Date('2026-05-19T00:30:00Z'))).toBe(false);
  });

  it('does not claim service for routes without schedule data', () => {
    expect(isRouteOperatingAt({}, monday('12:00'))).toBe(false);
  });
});
