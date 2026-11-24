import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as routes from '@/data/routes';
import { distanceToPathMeters, maxSegmentMeters } from '@/lib/geo';
import type { Route } from '@/types/transport';

// Biotrén (EFE) e interurbanos del GTFS oficial: los recorridos visibles por
// defecto, que la simulación anima con más detalle.
const QUALITY_ROUTES = ['L1', 'L2', '201', '201-AU', '302', '304', '401', '411', '421'];

beforeAll(async () => {
  await vi.waitFor(() => expect(routes.microRoutesReady).toBe(true), { timeout: 10_000 });
});

function qualityRoutes(): Route[] {
  return QUALITY_ROUTES.map((code) => {
    const route = routes.findRoute(code)?.route;
    expect(route, code).toBeTruthy();
    return route!;
  });
}

describe('route geometry quality', () => {
  it('keeps visible Biotrén and interurban paths dense enough for smooth simulation', () => {
    for (const route of qualityRoutes()) {
      expect(maxSegmentMeters(route.path), route.code).toBeLessThanOrEqual(320);
      for (const direction of route.directions ?? []) {
        expect(maxSegmentMeters(direction.path), `${route.code}#${direction.directionId}`).toBeLessThanOrEqual(320);
      }
    }
  });

  it('keeps each direction stops aligned with that direction path', () => {
    for (const route of qualityRoutes()) {
      const directions = route.directions ?? [];
      if (directions.length === 0) {
        for (const stop of route.stops) {
          expect(distanceToPathMeters([stop.lat, stop.lng], route.path), `${route.code}:${stop.name}`).toBeLessThanOrEqual(150);
        }
      }
      for (const direction of directions) {
        for (const stop of direction.stops) {
          expect(
            distanceToPathMeters([stop.lat, stop.lng], direction.path),
            `${route.code}#${direction.directionId}:${stop.name}`,
          ).toBeLessThanOrEqual(150);
        }
      }
    }
  });
});
