// Pre-computes compact per-stop service windows from GTFS stop_times.
//
// Instead of shipping every scheduled stop arrival (millions of rows after
// calendar expansion), we store one compact window per stop/route/headsign/day:
// [routeId, headsign, day, firstMin, lastMin, medianHeadwayMin, count].
// Runtime uses this to estimate upcoming programmed services at a paradero.
//
// Run: npm run sync:stop-services

import { writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const DEFAULT_DB =
  '/Users/marcorojasbelmar/Desktop/api red/legal_transit_backend/data/db/gran_concepcion_candidate.sqlite';
const dbPath = process.env.GTFS_DB_PATH ?? DEFAULT_DB;
const outPath = resolve('src/data/gtfs-stop-services.generated.ts');

function rows<T>(sql: string): T[] {
  const result = spawnSync('sqlite3', ['-json', dbPath, sql], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 512,
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

interface VisitRow {
  stop_id: string | number;
  route_id: string | number;
  service_id: string | number;
  headsign: string | null;
  arrival_min: number;
}

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

console.log('Reading stop-time visits…');
const visits = rows<VisitRow>(`
  WITH bus_routes AS (
    SELECT route_id FROM routes WHERE CAST(route_type AS INTEGER) = 3
  ),
  bus_trips AS (
    SELECT
      t.trip_id,
      t.route_id,
      t.service_id,
      NULLIF(t.trip_headsign, '') AS trip_headsign
    FROM trips t
    JOIN bus_routes br ON br.route_id = t.route_id
  )
  SELECT
    st.stop_id,
    bt.route_id,
    bt.service_id,
    COALESCE(NULLIF(st.stop_headsign, ''), bt.trip_headsign, '') AS headsign,
    (
      CAST(SUBSTR(st.arrival_time, 1, 2) AS INTEGER) * 60
      + CAST(SUBSTR(st.arrival_time, 4, 2) AS INTEGER)
    ) AS arrival_min
  FROM stop_times st
  JOIN bus_trips bt ON bt.trip_id = st.trip_id
  WHERE st.arrival_time IS NOT NULL
`);
console.log(`  → ${visits.length.toLocaleString('en-US')} raw visits`);

const buckets = new Map<string, number[]>();
let skipped = 0;
for (const visit of visits) {
  const days = serviceDays.get(String(visit.service_id));
  if (!days) {
    skipped += 1;
    continue;
  }
  const stopId = `gtfs-stop-${visit.stop_id}`;
  const routeId = `gtfs-route-${visit.route_id}`;
  const headsign = (visit.headsign ?? '').trim();
  const minute = Math.max(0, Math.round(visit.arrival_min));
  for (let day = 0; day < 7; day++) {
    if (!days[day]) continue;
    const key = `${stopId}\t${routeId}\t${headsign}\t${day}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(minute);
    buckets.set(key, bucket);
  }
}
if (skipped > 0) console.warn(`  ! ${skipped} visits skipped (no calendar entry)`);

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

type WindowTuple = [string, string, number, number, number, number, number];
const byStop = new Map<string, WindowTuple[]>();
for (const [key, minutes] of buckets) {
  const [stopId, routeId, headsign, dayText] = key.split('\t');
  const unique = Array.from(new Set(minutes)).sort((a, b) => a - b);
  if (unique.length === 0) continue;
  const gaps: number[] = [];
  for (let i = 1; i < unique.length; i++) {
    const gap = unique[i] - unique[i - 1];
    if (gap > 0 && gap <= 180) gaps.push(gap);
  }
  const tuple: WindowTuple = [
    routeId,
    headsign,
    Number(dayText),
    unique[0],
    unique[unique.length - 1],
    median(gaps),
    unique.length,
  ];
  const list = byStop.get(stopId) ?? [];
  list.push(tuple);
  byStop.set(stopId, list);
}

for (const list of byStop.values()) {
  list.sort((a, b) => a[2] - b[2] || a[3] - b[3] || a[0].localeCompare(b[0]));
}

const entries = Array.from(byStop.entries()).sort((a, b) => a[0].localeCompare(b[0]));
const totalWindows = entries.reduce((acc, [, list]) => acc + list.length, 0);

const banner = `// AUTO-GENERATED by scripts/extract-stop-service-windows.ts on ${new Date().toISOString()}.
// Compact programmed service windows by GTFS stop.
// Tuple: [routeId, headsign, day, firstMin, lastMin, medianHeadwayMin, count].
// Day index: 0=Monday..6=Sunday. Derived from GTFS static stop_times.
// Re-generate: \`npm run sync:stop-services\`.

export type StopServiceWindow = [
  routeId: string,
  headsign: string,
  day: number,
  firstMin: number,
  lastMin: number,
  medianHeadwayMin: number,
  count: number,
];

`;

const body = entries
  .map(([stopId, list]) => {
    const tuples = list
      .map(([routeId, headsign, day, first, last, headway, count]) =>
        `[${JSON.stringify(routeId)},${JSON.stringify(headsign)},${day},${first},${last},${headway},${count}]`,
      )
      .join(',');
    return `  ${JSON.stringify(stopId)}: [${tuples}]`;
  })
  .join(',\n');

const output = `${banner}export const STOP_SERVICE_WINDOWS: Record<string, StopServiceWindow[]> = {
${body},
};

export const STOP_SERVICE_WINDOWS_META = {
  generatedAt: ${JSON.stringify(new Date().toISOString())},
  paraderos: ${entries.length},
  windows: ${totalWindows},
  rawVisits: ${visits.length},
} as const;
`;

writeFileSync(outPath, output);
console.log(
  `Wrote ${outPath} (${(output.length / 1024).toFixed(1)} KB raw, ${entries.length} stops, ${totalWindows} windows)`,
);
