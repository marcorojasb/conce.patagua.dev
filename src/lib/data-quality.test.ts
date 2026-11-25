import { describe, expect, it } from 'vitest';
import { buildDataQualityReport, summarizeIssues } from './data-quality';

describe('data quality report', () => {
  it('summarizes severities', () => {
    expect(
      summarizeIssues([
        { severity: 'error', category: 'routes', title: 'a', detail: 'a' },
        { severity: 'warning', category: 'geometry', title: 'b', detail: 'b' },
        { severity: 'info', category: 'simulation', title: 'c', detail: 'c' },
      ]),
    ).toEqual({ error: 1, warning: 1, info: 1 });
  });

  it('reports current generated data without fatal errors', () => {
    const report = buildDataQualityReport();
    expect(report.routeCount).toBeGreaterThan(100);
    expect(report.stopCount).toBeGreaterThan(1000);
    expect(report.summary.error).toBe(0);
    expect(report.summary.warning).toBeGreaterThan(0);
  });

  it('dice que el GTFS es un programa a intervalo fijo y coteja la flota real', () => {
    const report = buildDataQualityReport();
    const find = (title: string, routeId?: string) =>
      report.issues.find((i) => i.title === title && (routeId === undefined || i.routeId === routeId));
    expect(find('Programa a intervalo fijo')?.severity).toBe('warning');
    expect(find('Flota implícita sobre la real', 'gtfs-route-949')).toMatchObject({
      severity: 'warning',
      category: 'simulation',
    });
    expect(find('Itinerario del operador', 'gtfs-route-949')?.detail).toMatch(/\(113 salidas.*las 420 del programa/);
    expect(find('Flota curada con recorrido inexistente')).toBeUndefined();
    expect(find('Itinerario del operador sin sentido GTFS')).toBeUndefined();

    expect(report.programs.length).toBeGreaterThan(90);
    expect(report.programs.find((row) => row.code === '201')).toEqual({
      routeId: 'gtfs-route-949',
      code: '201',
      headways: { weekday: [5, 5], saturday: [10, 10], sunday: [10, 10] },
      weekdayTrips: 420,
      weekdayPeak: expect.any(Number),
      fleet: { id: 'santa-juana', buses: 23, groupPeak: 86 },
    });
    expect(report.programs.find((row) => row.code === '201-AU')?.headways).toEqual({
      weekday: [15, 30],
      saturday: null,
      sunday: null,
    });
  });
});
