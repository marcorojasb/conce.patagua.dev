import { describe, expect, it } from 'vitest';
import { isRouteOperatingAt } from '@/lib/operating-hours';
import type { Route } from '@/types/transport';

function routeWithHours(hours: string): Route {
  return {
    id: 'r',
    code: 'R',
    name: 'Ruta test',
    type: 'micro',
    color: '#0ea5e9',
    operator: 'Test',
    headway: '',
    hours,
    frequencyByDay: {},
    stops: [],
    path: [],
  };
}

describe('operating-hours', () => {
  it('reads explicit HH:mm windows', () => {
    const route = routeWithHours('05:45 - 23:10');

    expect(isRouteOperatingAt(route, new Date('2026-05-18T06:00:00-04:00'))).toBe(true);
    expect(isRouteOperatingAt(route, new Date('2026-05-18T23:30:00-04:00'))).toBe(false);
  });

  it('uses Chile time even when the UTC instant falls on another hour or day', () => {
    const route = routeWithHours('05:45 - 23:10');

    // 02:30 UTC = 23:30 del día anterior en Chile (CLST): fuera de servicio.
    expect(isRouteOperatingAt(route, new Date('2026-11-24T02:30:00Z'))).toBe(false);
    // 12:30 UTC = 09:30 en Chile (CLST): en servicio.
    expect(isRouteOperatingAt(route, new Date('2026-11-24T12:30:00Z'))).toBe(true);
  });

  it('falls back to the default bus window when hours are not parseable', () => {
    const route = routeWithHours('Según calendario GTFS');

    expect(isRouteOperatingAt(route, new Date('2026-05-18T07:00:00-04:00'))).toBe(true);
    expect(isRouteOperatingAt(route, new Date('2026-05-18T23:00:00-04:00'))).toBe(false);
  });
});
