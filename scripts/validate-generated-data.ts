import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BIOTREN_L1_STOPS, BIOTREN_L2_STOPS } from '../src/data/biotren.generated.ts';
import { BIOTREN_L1_TRACK, BIOTREN_L2_TRACK } from '../src/data/biotren-track.generated.ts';
import { GTFS_BUS_ROUTES } from '../src/data/gtfs-bus-routes.generated.ts';
import { GTFS_STOPS } from '../src/data/gtfs-stops.generated.ts';
import { ROUTE_SCHEDULES } from '../src/data/gtfs-schedule.generated.ts';
import { INTERURBAN_BUS_ROUTES, INTERURBAN_PARADEROS } from '../src/data/interurban-routes.generated.ts';
import { densifyPath, distanceToPathMeters, maxSegmentMeters } from '../src/lib/geo.ts';

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

const interurbanParaderoById = new Map(INTERURBAN_PARADEROS.map((stop) => [stop.id, stop]));
const routeQualityInputs = [
  {
    id: 'bt-l1',
    path: BIOTREN_L1_TRACK,
    stops: BIOTREN_L1_STOPS,
    rawMaxSegmentMeters: 4_000,
    maxStopDistanceMeters: 120,
  },
  {
    id: 'bt-l2',
    path: BIOTREN_L2_TRACK,
    stops: BIOTREN_L2_STOPS,
    rawMaxSegmentMeters: 4_000,
    maxStopDistanceMeters: 120,
  },
  ...INTERURBAN_BUS_ROUTES.map((route) => ({
    id: route.id,
    path: route.path,
    stops: route.stopIds.map((id) => interurbanParaderoById.get(id)).filter((stop) => stop != null),
    rawMaxSegmentMeters: 1_500,
    maxStopDistanceMeters: 150,
  })),
];

for (const route of routeQualityInputs) {
  if (route.path.length < 2) {
    failures.push(`${route.id} has no usable path.`);
    continue;
  }
  const rawMax = maxSegmentMeters(route.path);
  if (rawMax > route.rawMaxSegmentMeters) {
    warnings.push(`${route.id} raw path has a long segment (${Math.round(rawMax)} m); runtime path is densified.`);
  }
  const normalizedMax = maxSegmentMeters(densifyPath(route.path, 300));
  if (normalizedMax > 320) {
    failures.push(`${route.id} normalized path still has a long segment (${Math.round(normalizedMax)} m).`);
  }
  for (const stop of route.stops) {
    const d = distanceToPathMeters([stop.lat, stop.lng], route.path);
    if (d > route.maxStopDistanceMeters) {
      failures.push(`${route.id} stop ${stop.id} is ${Math.round(d)} m from the path.`);
    }
  }
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
