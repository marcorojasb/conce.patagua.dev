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
      scheduleId: 'gtfs-route-test',
      progress: 0.5,
      sourceKind: 'gtfs',
    });
  });

  it('supports directional static-pattern schedules over reversed paths', () => {
    const routes = [
      {
        id: 'interurban-421-conce-avestadio',
        routeId: 'interurban-421',
        color: '#0891b2',
        directionLabel: 'Concepción → Av. Estadio',
        sourceKind: 'community' as const,
        confidence: 'community' as const,
        path: [
          [-36.82, -73.06],
          [-36.72, -72.98],
        ] as Array<[number, number]>,
      },
      {
        id: 'interurban-421-avestadio-conce',
        routeId: 'interurban-421',
        color: '#0891b2',
        directionLabel: 'Av. Estadio → Concepción',
        sourceKind: 'community' as const,
        confidence: 'community' as const,
        path: [
          [-36.72, -72.98],
          [-36.82, -73.06],
        ] as Array<[number, number]>,
      },
    ];
    const schedules: Record<string, RouteSchedule> = {
      'interurban-421-conce-avestadio': [
        [[18 * 60, 60]],
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
      ],
      'interurban-421-avestadio-conce': [
        [[6 * 60, 60]],
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
      ],
    };

    const vehicles = computeActiveVehicles(new Date(2026, 4, 18, 18, 30), routes, schedules);

    expect(vehicles).toHaveLength(1);
    expect(vehicles[0]).toMatchObject({
      scheduleId: 'interurban-421-conce-avestadio',
      routeId: 'interurban-421',
      directionLabel: 'Concepción → Av. Estadio',
      sourceKind: 'community',
      progress: 0.5,
    });
  });
});
