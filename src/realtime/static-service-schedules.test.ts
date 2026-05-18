import { describe, expect, it } from 'vitest';
import { buildStaticRouteSchedules, expandFrequencyWindow } from '@/realtime/static-service-schedules';
import type { StaticServicePattern } from '@/data/static-service-patterns';

const pattern: StaticServicePattern = {
  id: 'test-pattern',
  routeId: 'route',
  direction: 'forward',
  directionLabel: 'A → B',
  days: ['weekday'],
  startMin: 8 * 60,
  endMin: 9 * 60,
  headwayMin: 20,
  durationMin: 35,
  sourceKind: 'estimated',
  confidence: 'estimated',
  sourceLabel: 'Fixture',
  sourceUrl: 'https://example.com',
  note: 'test',
};

describe('static service schedules', () => {
  it('expands a frequency window into deterministic trips', () => {
    expect(expandFrequencyWindow(pattern)).toEqual([
      [480, 35],
      [500, 35],
      [520, 35],
      [540, 35],
    ]);
  });

  it('maps weekday patterns to Monday through Friday only', () => {
    const schedules = buildStaticRouteSchedules([pattern]);

    expect(schedules['test-pattern'][0]).toHaveLength(4);
    expect(schedules['test-pattern'][4]).toHaveLength(4);
    expect(schedules['test-pattern'][5]).toHaveLength(0);
    expect(schedules['test-pattern'][6]).toHaveLength(0);
  });
});
