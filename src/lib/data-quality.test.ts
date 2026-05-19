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
});
