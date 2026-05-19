import { buildDataQualityReport } from '../src/lib/data-quality.ts';

const report = buildDataQualityReport();
const failures = report.issues.filter((issue) => issue.severity === 'error');
const warnings = report.issues.filter((issue) => issue.severity === 'warning');

if (failures.length > 0) {
  console.error('Generated data validation failed:');
  for (const failure of failures) console.error(`  - ${failure.detail}`);
  if (warnings.length > 0) {
    console.error('Warnings:');
    for (const warning of warnings) console.error(`  - ${warning.detail}`);
  }
  process.exit(1);
}

const missingSchedule = warnings.filter((warning) => warning.title === 'Ruta GTFS sin bucket horario');
const otherWarnings = warnings.filter((warning) => warning.title !== 'Ruta GTFS sin bucket horario');
if (missingSchedule.length > 0) {
  console.warn(
    `Warning: ${missingSchedule.length} GTFS routes have no schedule bucket (sample: ${missingSchedule
      .slice(0, 10)
      .map((warning) => warning.detail.split(' aparece')[0])
      .join(', ')}).`,
  );
}
for (const warning of otherWarnings) console.warn(`Warning: ${warning.detail}`);
console.log(
  `Generated data OK: ${report.routeCount} routes, ${report.stopCount} GTFS stops, ${report.scheduledRouteCount} scheduled routes.`,
);
