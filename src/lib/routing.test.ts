import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatDistanceMeters, formatDurationSeconds, routeBetween } from '@/lib/routing';

describe('routing helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('formats distance and duration labels', () => {
    expect(formatDistanceMeters(850)).toBe('850 m');
    expect(formatDistanceMeters(1250)).toBe('1.25 km');
    expect(formatDurationSeconds(45)).toBe('45 s');
    expect(formatDurationSeconds(3700)).toBe('1 h 02 min');
  });

  it('uses OSRM coordinate order and returns a route midpoint', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [
          {
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 0],
                [2, 0],
              ],
            },
            distance: 222_390,
            duration: 3600,
          },
        ],
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await routeBetween([10, 20], [11, 21]);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/foot/20,10;21,11?'),
      expect.any(Object),
    );
    expect(result.midpoint[0]).toBeCloseTo(0, 5);
    expect(result.midpoint[1]).toBeCloseTo(1, 2);
    expect(result.durationSeconds).toBe(3600);
  });
});
