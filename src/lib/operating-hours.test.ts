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

    expect(isRouteOperatingAt(route, new Date(2026, 4, 18, 6, 0))).toBe(true);
    expect(isRouteOperatingAt(route, new Date(2026, 4, 18, 23, 30))).toBe(false);
  });

  it('falls back to the default bus window when hours are not parseable', () => {
    const route = routeWithHours('Según calendario GTFS');

    expect(isRouteOperatingAt(route, new Date(2026, 4, 18, 7, 0))).toBe(true);
    expect(isRouteOperatingAt(route, new Date(2026, 4, 18, 23, 0))).toBe(false);
  });
});
