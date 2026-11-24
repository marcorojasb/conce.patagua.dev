import { describe, expect, it } from 'vitest';
import { STATIC_SERVICE_PATTERNS, type StaticServicePattern } from '@/data/static-service-patterns';

const biotren = STATIC_SERVICE_PATTERNS.filter((pattern) => pattern.routeId.startsWith('bt-'));

function pattern(id: string): StaticServicePattern {
  const found = biotren.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`falta el patrón ${id}`);
  return found;
}

function starts(id: string): number[] {
  return (pattern(id).trips ?? []).map(([start]) => start);
}

const hhmm = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));

describe('Biotrén static patterns (itinerarios EFE vigentes desde 15-07-2026)', () => {
  it('carries the official departure count per line, direction and day', () => {
    // Solo corridas de cabecera a cabecera; los servicios cortos van en la nota.
    const counts = Object.fromEntries(biotren.map((p) => [p.id, p.trips?.length]));
    expect(counts).toEqual({
      'bt-l1-hualqui-mercado-weekday': 19,
      'bt-l1-mercado-hualqui-weekday': 18,
      'bt-l1-hualqui-mercado-saturday': 8,
      'bt-l1-mercado-hualqui-saturday': 8,
      'bt-l1-hualqui-mercado-sunday': 4,
      'bt-l1-mercado-hualqui-sunday': 4,
      'bt-l2-coronel-concepcion-weekday': 52,
      'bt-l2-concepcion-coronel-weekday': 52,
      'bt-l2-coronel-concepcion-saturday': 26,
      'bt-l2-concepcion-coronel-saturday': 27,
      'bt-l2-coronel-concepcion-sunday': 16,
      'bt-l2-concepcion-coronel-sunday': 16,
    });
  });

  it('keeps first and last departures and per-trip durations from the images', () => {
    expect(pattern('bt-l1-hualqui-mercado-weekday').trips).toContainEqual([hhmm('06:20'), 64]);
    expect(pattern('bt-l1-hualqui-mercado-weekday').trips).toContainEqual([hhmm('20:00'), 67]);
    expect(starts('bt-l1-hualqui-mercado-weekday').at(-1)).toBe(hhmm('21:52'));
    expect(starts('bt-l1-mercado-hualqui-weekday')[0]).toBe(hhmm('06:31'));
    expect(pattern('bt-l2-coronel-concepcion-weekday').trips?.[0]).toEqual([hhmm('05:55'), 45]);
    expect(pattern('bt-l2-concepcion-coronel-weekday').trips?.at(-1)).toEqual([hhmm('22:50'), 42]);
    expect(starts('bt-l1-mercado-hualqui-sunday')).toEqual(['08:30', '12:30', '16:01', '20:01'].map(hhmm));
  });

  it('runs on Sunday only the "Sáb/Dom" rows, a subset of Saturday', () => {
    for (const [saturday, sunday] of [
      ['bt-l1-hualqui-mercado-saturday', 'bt-l1-hualqui-mercado-sunday'],
      ['bt-l1-mercado-hualqui-saturday', 'bt-l1-mercado-hualqui-sunday'],
      ['bt-l2-coronel-concepcion-saturday', 'bt-l2-coronel-concepcion-sunday'],
      ['bt-l2-concepcion-coronel-saturday', 'bt-l2-concepcion-coronel-sunday'],
    ]) {
      const saturdayStarts = new Set(starts(saturday));
      expect(starts(sunday).every((start) => saturdayStarts.has(start)), sunday).toBe(true);
    }
  });

  it('cites EFE as an official source and keeps the summary window consistent', () => {
    for (const p of biotren) {
      const trips = p.trips ?? [];
      expect(p.confidence, p.id).toBe('official');
      expect(p.sourceKind, p.id).toBe('official');
      expect(p.sourceUrl, p.id).toMatch(/^https:\/\/www\.efe\.cl\/wp-content\/uploads\/2026\/07\/.+\.jpg$/);
      expect(p.sourceLabel, p.id).toContain('15-07-2026');
      expect(trips.map(([start]) => start), p.id).toEqual([...trips.map(([start]) => start)].sort((a, b) => a - b));
      expect(new Set(trips.map(([start]) => start)).size, p.id).toBe(trips.length);
      expect(trips.every(([, duration]) => duration >= 40 && duration <= 70), p.id).toBe(true);
      expect(p.startMin, p.id).toBe(trips[0][0]);
      expect(p.endMin, p.id).toBe(trips[trips.length - 1][0]);
      expect(p.headwayMin, p.id).toBeGreaterThan(0);
    }
  });
});
