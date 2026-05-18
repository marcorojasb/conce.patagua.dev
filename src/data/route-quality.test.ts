import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/data/routes';
import { distanceToPathMeters, maxSegmentMeters } from '@/lib/geo';

const QUALITY_ROUTE_IDS = ['bt-l1', 'bt-l2', 'interurban-201', 'interurban-401', 'interurban-411', 'interurban-421'];

describe('route geometry quality', () => {
  it('keeps visible Biotrén and interurban paths dense enough for smooth simulation', () => {
    for (const id of QUALITY_ROUTE_IDS) {
      const route = ROUTES.find((candidate) => candidate.id === id);
      expect(route, id).toBeTruthy();
      expect(maxSegmentMeters(route!.path), id).toBeLessThanOrEqual(320);
    }
  });

  it('keeps modeled stops aligned with their route paths', () => {
    for (const id of QUALITY_ROUTE_IDS) {
      const route = ROUTES.find((candidate) => candidate.id === id)!;
      for (const stop of route.stops) {
        expect(distanceToPathMeters([stop.lat, stop.lng], route.path), `${id}:${stop.name}`).toBeLessThanOrEqual(150);
      }
    }
  });
});
