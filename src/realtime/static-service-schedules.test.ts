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

  it('does not hang when a pattern declares a non-positive headway', () => {
    // Un headway <= 0 dejaría el `for` de expansión girando para siempre en el
    // module load del builder, colgando la app entera.
    for (const headwayMin of [0, -10]) {
      expect(expandFrequencyWindow({ ...pattern, headwayMin })).toEqual([[480, 35]]);
      expect(
        buildStaticRouteSchedules([{ ...pattern, headwayMin }])['test-pattern'][0],
      ).toEqual([[480, 35]]);
    }
  });

  it('expands explicit trips instead of the frequency window when a pattern lists them', () => {
    const trips: [number, number][] = [
      [6 * 60 + 20, 64],
      [6 * 60 + 56, 60],
      [21 * 60 + 52, 56],
    ];
    expect(expandFrequencyWindow({ ...pattern, trips })).toEqual(trips);

    const schedules = buildStaticRouteSchedules([{ ...pattern, days: ['sunday'], trips }]);
    expect(schedules['test-pattern'][6]).toEqual(trips);
    expect(schedules['test-pattern'].slice(0, 6).every((day) => day.length === 0)).toBe(true);
  });

  it('maps weekday patterns to Monday through Friday only', () => {
    const schedules = buildStaticRouteSchedules([pattern]);

    expect(schedules['test-pattern'][0]).toHaveLength(4);
    expect(schedules['test-pattern'][4]).toHaveLength(4);
    expect(schedules['test-pattern'][5]).toHaveLength(0);
    expect(schedules['test-pattern'][6]).toHaveLength(0);
  });
});
