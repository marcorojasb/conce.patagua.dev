import { describe, expect, it } from 'vitest';
import { chileClock } from '@/lib/chile-time';

describe('chileClock', () => {
  it('reads Chile wall time when the UTC instant is already the next day (CLST, -03)', () => {
    expect(chileClock(new Date('2026-11-24T02:30:00Z'))).toEqual({ day: 0, minutes: 23 * 60 + 30 });
  });

  it('reads Chile wall time in winter (CLT, -04)', () => {
    expect(chileClock(new Date('2026-05-18T12:30:00Z'))).toEqual({ day: 0, minutes: 8 * 60 + 30 });
  });

  it('keeps seconds as a fraction of a minute', () => {
    expect(chileClock(new Date('2026-05-18T08:07:30-04:00')).minutes).toBe(8 * 60 + 7.5);
  });

  it('normalizes weekdays to Monday-first indexes', () => {
    expect(chileClock(new Date('2026-05-24T00:00:00-04:00'))).toEqual({ day: 6, minutes: 0 });
    expect(chileClock(new Date('2026-05-23T23:59:00-04:00')).day).toBe(5);
  });
});
