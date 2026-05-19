import { describe, expect, it } from 'vitest';
import { formatServiceClock, getNextStopServices } from './stop-services';
import type { StopServiceWindow } from '@/data/gtfs-stop-services.generated';

describe('stop service helpers', () => {
  it('estimates the next programmed service from compact GTFS windows', () => {
    const windows: StopServiceWindow[] = [
      ['gtfs-route-1', 'Centro', 0, 360, 600, 15, 17],
    ];
    const snapshot = getNextStopServices({
      stopId: 'gtfs-stop-1',
      routeIds: ['gtfs-route-1'],
      windows,
      now: new Date('2026-05-18T08:07:00-04:00'),
    });
    expect(snapshot.services[0]).toMatchObject({
      routeId: 'gtfs-route-1',
      scheduledMin: 495,
      minutesUntil: 8,
      source: 'gtfs-window',
    });
  });

  it('rolls to tomorrow when today has no later service', () => {
    const windows: StopServiceWindow[] = [
      ['gtfs-route-1', 'Centro', 0, 360, 420, 20, 4],
      ['gtfs-route-1', 'Centro', 1, 360, 420, 20, 4],
    ];
    const snapshot = getNextStopServices({
      stopId: 'gtfs-stop-1',
      routeIds: ['gtfs-route-1'],
      windows,
      now: new Date('2026-05-18T23:50:00-04:00'),
    });
    expect(snapshot.services[0].scheduledMin).toBe(1800);
    expect(formatServiceClock(snapshot.services[0].scheduledMin)).toBe('06:00');
  });

  it('returns an honest empty state when no windows match the stop routes', () => {
    const snapshot = getNextStopServices({
      stopId: 'gtfs-stop-1',
      routeIds: ['gtfs-route-2'],
      windows: [['gtfs-route-1', 'Centro', 0, 360, 600, 15, 17]],
      now: new Date('2026-05-18T08:00:00-04:00'),
    });
    expect(snapshot.services).toEqual([]);
    expect(snapshot.hasGtfsWindows).toBe(false);
  });
});
