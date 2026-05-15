// Extracts per-route trip schedules from the GTFS SQLite cache.
//
// For each urban-bus route (route_type=3), produces the list of trips
// programmed for each day of week. Each trip is encoded as
// [startMinutesFromMidnight, durationMinutes].
//
// Lives in a separate generated file so the React app can lazy-load it
// only when the "Buses simulados" layer is enabled — the schedule weighs
// ~50 KB gz which is meaningful for first paint.
//
// Run: npm run sync:gtfs-schedule

import { writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const DEFAULT_DB =
  '/Users/marcorojasbelmar/Desktop/api red/legal_transit_backend/data/db/gran_concepcion_candidate.sqlite';
const dbPath = process.env.GTFS_DB_PATH ?? DEFAULT_DB;
const outPath = resolve('src/data/gtfs-schedule.generated.ts');

function rows<T>(sql: string): T[] {
  const result = spawnSync('sqlite3', ['-json', dbPath, sql], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 128,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `sqlite3 exited with ${result.status}`);
  }
  const text = result.stdout.trim();
  return text ? (JSON.parse(text) as T[]) : [];
}

interface CalendarRow {
  service_id: string | number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

interface TripScheduleRow {
  route_id: string | number;
  service_id: string | number;
  start_seconds: number;
  end_seconds: number;
}

// 1. Build service_id → 7-day weekday mask
console.log('Reading calendar…');
const calendar = rows<CalendarRow>(`
  SELECT
    service_id,
    CAST(monday AS INTEGER) AS monday,
    CAST(tuesday AS INTEGER) AS tuesday,
    CAST(wednesday AS INTEGER) AS wednesday,
    CAST(thursday AS INTEGER) AS thursday,
    CAST(friday AS INTEGER) AS friday,
    CAST(saturday AS INTEGER) AS saturday,
    CAST(sunday AS INTEGER) AS sunday
  FROM calendar
`);

const serviceDays = new Map<string, boolean[]>();
for (const c of calendar) {
  serviceDays.set(String(c.service_id), [
    Boolean(c.monday),
    Boolean(c.tuesday),
    Boolean(c.wednesday),
    Boolean(c.thursday),
    Boolean(c.friday),
    Boolean(c.saturday),
    Boolean(c.sunday),
  ]);
}
console.log(`  → ${serviceDays.size} service patterns`);

// 2. For each trip on a route_type=3 route, get its start/end window from
//    stop_times. GTFS arrival_time/departure_time strings can exceed 24:00:00
//    (overnight services), so we parse manually into seconds.
console.log('Reading trip windows from stop_times…');
const tripWindows = rows<TripScheduleRow>(`
  WITH bus_routes AS (
    SELECT route_id FROM routes WHERE CAST(route_type AS INTEGER) = 3
  ),
  bus_trips AS (
    SELECT t.trip_id, t.route_id, t.service_id
    FROM trips t
    JOIN bus_routes br ON br.route_id = t.route_id
  ),
  trip_bounds AS (
    SELECT
      st.trip_id,
      MIN(
        (CAST(SUBSTR(st.arrival_time, 1, 2) AS INTEGER) * 3600)
        + (CAST(SUBSTR(st.arrival_time, 4, 2) AS INTEGER) * 60)
        + CAST(SUBSTR(st.arrival_time, 7, 2) AS INTEGER)
      ) AS start_seconds,
      MAX(
        (CAST(SUBSTR(st.departure_time, 1, 2) AS INTEGER) * 3600)
        + (CAST(SUBSTR(st.departure_time, 4, 2) AS INTEGER) * 60)
        + CAST(SUBSTR(st.departure_time, 7, 2) AS INTEGER)
      ) AS end_seconds
    FROM stop_times st
    JOIN bus_trips bt ON bt.trip_id = st.trip_id
    GROUP BY st.trip_id
  )
  SELECT
    bt.route_id,
    bt.service_id,
    tb.start_seconds,
    tb.end_seconds
  FROM trip_bounds tb
  JOIN bus_trips bt ON bt.trip_id = tb.trip_id
  WHERE tb.start_seconds IS NOT NULL
    AND tb.end_seconds IS NOT NULL
    AND tb.end_seconds > tb.start_seconds;
`);
console.log(`  → ${tripWindows.length.toLocaleString('en-US')} bus trips with valid windows`);

// 3. Bucket trips by route + day-of-week. Each trip lands in every day its
//    service is active. Mon-Fri service triplicates to 5 buckets — acceptable
//    for a 27k-row dataset.
type Trip = [number, number]; // [startMinutesFromMidnight, durationMinutes]
type RouteSchedule = [Trip[], Trip[], Trip[], Trip[], Trip[], Trip[], Trip[]]; // mon..sun

const byRoute = new Map<string, RouteSchedule>();
const emptySchedule = (): RouteSchedule => [[], [], [], [], [], [], []];

let skipped = 0;
for (const t of tripWindows) {
  const days = serviceDays.get(String(t.service_id));
  if (!days) {
    skipped += 1;
    continue;
  }
  const routeId = `gtfs-route-${t.route_id}`;
  const schedule = byRoute.get(routeId) ?? emptySchedule();
  const startMin = Math.floor(t.start_seconds / 60);
  const durationMin = Math.round((t.end_seconds - t.start_seconds) / 60);
  if (durationMin <= 0 || durationMin > 240) continue; // sanity: skip >4h
  for (let i = 0; i < 7; i++) {
    if (days[i]) schedule[i].push([startMin, durationMin]);
  }
  byRoute.set(routeId, schedule);
}
if (skipped > 0) console.warn(`  ! ${skipped} trips skipped (no calendar entry)`);

// 4. Sort each day's trips by start time for deterministic output + smaller
//    diffs on regenerate.
for (const schedule of byRoute.values()) {
  for (const day of schedule) day.sort((a, b) => a[0] - b[0]);
}

const routeCount = byRoute.size;
const totalTripDays = Array.from(byRoute.values()).reduce(
  (acc, sched) => acc + sched.reduce((a, day) => a + day.length, 0),
  0,
);
console.log(`  → ${routeCount} routes · ${totalTripDays.toLocaleString('en-US')} route-day entries`);

// 5. Emit. Inline output (no JSON.stringify(indent)) to keep file size down.
const banner = `// AUTO-GENERATED by scripts/extract-gtfs-schedule.ts on ${new Date().toISOString()}.
// Source: GTFS static Gran Concepción candidate · SQLite cache.
// Per-route trips bucketed by day of week. Each trip is
// [startMinutesFromMidnight, durationMinutes].
// 0=Monday, 1=Tuesday, ..., 6=Sunday.
// Re-generate: \`npm run sync:gtfs-schedule\`.

import type { RouteSchedule } from '@/types/transport';

`;

const sortedEntries = Array.from(byRoute.entries()).sort((a, b) =>
  a[0].localeCompare(b[0]),
);
const body = sortedEntries
  .map(([routeId, schedule]) => {
    const days = schedule
      .map((day) => '[' + day.map(([s, d]) => `[${s},${d}]`).join(',') + ']')
      .join(',\n    ');
    return `  ${JSON.stringify(routeId)}: [\n    ${days},\n  ]`;
  })
  .join(',\n');

const output = `${banner}export const ROUTE_SCHEDULES: Record<string, RouteSchedule> = {
${body},
};

export const SCHEDULE_META = {
  generatedAt: ${JSON.stringify(new Date().toISOString())},
  routes: ${routeCount},
  totalEntries: ${totalTripDays},
} as const;
`;

writeFileSync(outPath, output);
console.log(`Wrote ${outPath} (${(output.length / 1024).toFixed(1)} KB raw)`);
