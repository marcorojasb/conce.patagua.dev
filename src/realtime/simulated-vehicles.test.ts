import { describe, expect, it } from 'vitest';
import { computeActiveVehicles, isoDayOfWeek } from '@/realtime/simulated-vehicles';
import type { RouteSchedule } from '@/types/transport';

const emptyDay: RouteSchedule[number] = [];

describe('simulated vehicles', () => {
  it('normalizes weekdays to Monday-first indexes', () => {
    expect(isoDayOfWeek(new Date(2026, 4, 18))).toBe(0);
    expect(isoDayOfWeek(new Date(2026, 4, 24))).toBe(6);
  });

  it('projects active trips for routes that arrive after initial app load', () => {
    const routes = [
      {
        id: 'gtfs-route-test',
        color: '#0ea5e9',
        path: [
          [-36.82, -73.05],
          [-36.82, -73.04],
        ] as Array<[number, number]>,
      },
    ];
    const schedules: Record<string, RouteSchedule> = {
      'gtfs-route-test': [[[8 * 60, 60]], emptyDay, emptyDay, emptyDay, emptyDay, emptyDay, emptyDay],
    };

    const vehicles = computeActiveVehicles(new Date(2026, 4, 18, 8, 30), routes, schedules);

    expect(vehicles).toHaveLength(1);
    expect(vehicles[0]).toMatchObject({
      routeId: 'gtfs-route-test',
      progress: 0.5,
    });
  });
});
