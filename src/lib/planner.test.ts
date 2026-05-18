import { describe, expect, it } from 'vitest';
import { findRoutes } from '@/lib/planner';
import type { Route } from '@/types/transport';

function route(id: string, path: Array<[number, number]>): Route {
  return {
    id,
    code: id,
    name: id,
    type: 'micro',
    color: '#0ea5e9',
    operator: 'Test',
    headway: '',
    hours: '',
    frequencyByDay: {},
    stops: [],
    path,
  };
}

describe('planner', () => {
  it('returns matching routes sorted by total access distance', () => {
    const close = route('close', [
      [-36.82, -73.05],
      [-36.82, -73.04],
    ]);
    const far = route('far', [
      [-36.821, -73.051],
      [-36.821, -73.041],
    ]);

    const matches = findRoutes(
      [-36.82, -73.05],
      [-36.82, -73.04],
      [far, close],
      200,
    );

    expect(matches.map((m) => m.route.id)).toEqual(['close', 'far']);
  });
});
