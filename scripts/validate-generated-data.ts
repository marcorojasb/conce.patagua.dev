import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GTFS_BUS_ROUTES } from '../src/data/gtfs-bus-routes.generated.ts';
import { GTFS_STOPS } from '../src/data/gtfs-stops.generated.ts';
import { ROUTE_SCHEDULES } from '../src/data/gtfs-schedule.generated.ts';

const ROOT = process.cwd();
const ROUTES_SOURCE = readFileSync(join(ROOT, 'src', 'data', 'routes.ts'), 'utf8');

function excerptBetween(source: string, startToken: string): string {
  const start = source.indexOf(startToken);
  if (start === -1) return '';
  const end = source.indexOf('];', start);
  return end === -1 ? source.slice(start) : source.slice(start, end);
}

function quotedStrings(source: string): string[] {
  return Array.from(source.matchAll(/['"]([^'"]+)['"]/g), (match) => match[1]);
}

const failures: string[] = [];
const warnings: string[] = [];

const seedRouteIds = new Set(
  Array.from(ROUTES_SOURCE.matchAll(/\bid:\s*'([^']+)'/g), (match) => match[1]),
);
const gtfsRouteIds = new Set(GTFS_BUS_ROUTES.map((route) => route.id));
const routeIds = new Set([...seedRouteIds, ...gtfsRouteIds]);
const stopIds = new Set(GTFS_STOPS.map((stop) => stop.id));
const scheduleRouteIds = new Set(Object.keys(ROUTE_SCHEDULES));

if (GTFS_BUS_ROUTES.length === 0) failures.push('GTFS_BUS_ROUTES is empty.');
if (GTFS_STOPS.length === 0) failures.push('GTFS_STOPS is empty.');
if (scheduleRouteIds.size === 0) failures.push('ROUTE_SCHEDULES is empty.');

const defaultVisibleIds = quotedStrings(excerptBetween(ROUTES_SOURCE, 'DEFAULT_VISIBLE_ROUTE_IDS'));
const missingDefaultVisible = defaultVisibleIds.filter((id) => !routeIds.has(id));
if (missingDefaultVisible.length > 0) {
  failures.push(`Default visible route ids do not exist: ${missingDefaultVisible.join(', ')}`);
}

const routesWithoutPath = GTFS_BUS_ROUTES
  .filter((route) => route.path.length < 2)
  .map((route) => `${route.id} (${route.ref})`);
if (routesWithoutPath.length > 0) {
  failures.push(`GTFS routes without usable path: ${routesWithoutPath.slice(0, 12).join(', ')}`);
}

const orphanStopRefs = new Set<string>();
for (const route of GTFS_BUS_ROUTES) {
  for (const stopId of route.stopIds) {
    if (!stopIds.has(stopId)) orphanStopRefs.add(`${route.id}:${stopId}`);
  }
}
if (orphanStopRefs.size > 0) {
  failures.push(
    `GTFS route stop references without stop geometry: ${Array.from(orphanStopRefs).slice(0, 12).join(', ')}`,
  );
}

const schedulesWithoutRoute = Array.from(scheduleRouteIds).filter((id) => !routeIds.has(id));
if (schedulesWithoutRoute.length > 0) {
  failures.push(`Schedules reference missing routes: ${schedulesWithoutRoute.slice(0, 12).join(', ')}`);
}

const routesWithoutSchedule = GTFS_BUS_ROUTES.filter((route) => !scheduleRouteIds.has(route.id));
if (routesWithoutSchedule.length > 0) {
  warnings.push(
    `${routesWithoutSchedule.length} GTFS routes have no schedule bucket (sample: ${routesWithoutSchedule
      .slice(0, 10)
      .map((route) => route.ref)
      .join(', ')}).`,
  );
}

if (failures.length > 0) {
  console.error('Generated data validation failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  if (warnings.length > 0) {
    console.error('Warnings:');
    for (const warning of warnings) console.error(`  - ${warning}`);
  }
  process.exit(1);
}

for (const warning of warnings) console.warn(`Warning: ${warning}`);
console.log(
  `Generated data OK: ${routeIds.size} routes, ${GTFS_STOPS.length} GTFS stops, ${scheduleRouteIds.size} scheduled routes.`,
);
