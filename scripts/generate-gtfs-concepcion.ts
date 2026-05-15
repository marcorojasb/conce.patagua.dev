import { existsSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { simplify } from './lib/simplify.ts';
import type { BusRoute, Paradero } from '../src/types/transport.ts';

const DEFAULT_DB =
  '/Users/marcorojasbelmar/Desktop/api red/legal_transit_backend/data/db/gran_concepcion_candidate.sqlite';
const dbPath = process.env.GTFS_DB_PATH ?? DEFAULT_DB;
const outPath = resolve('src/data/gtfs-concepcion.generated.ts');

interface GtfsRouteRow {
  route_id: string | number;
  agency_id?: string | number;
  agency_name?: string;
  route_short_name?: string;
  route_long_name?: string;
  route_color?: string;
}

interface GtfsStopRow {
  stop_id: string | number;
  stop_code?: string | number;
  stop_name?: string;
  lat: number;
  lng: number;
}

interface TripCandidate {
  route_id: string | number;
  trip_id: string | number;
  shape_id?: string | number;
  trip_headsign?: string;
  stop_count: number;
}

interface ShapePoint {
  shape_id: string | number;
  lat: number;
  lng: number;
  seq: number;
}

function sqlString(value: string | number | undefined): string {
  return `'${String(value ?? '').replaceAll("'", "''")}'`;
}

function rows<T>(sql: string): T[] {
  const result = spawnSync('sqlite3', ['-json', dbPath, sql], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 64,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `sqlite3 exited with ${result.status}`);
  }
  const text = result.stdout.trim();
  return text ? (JSON.parse(text) as T[]) : [];
}

function compactColor(color?: string): string | undefined {
  if (!color) return undefined;
  const hex = color.trim().replace(/^#/, '');
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex.toLowerCase()}` : undefined;
}

function displayName(route: GtfsRouteRow): string {
  const code = String(route.route_short_name ?? '').trim();
  const long = String(route.route_long_name ?? '').trim();
  if (code && long) return `${code}: ${long}`;
  return code || long || `Ruta ${route.route_id}`;
}

function gtfsStopId(stopId: string | number): string {
  return `gtfs-stop-${stopId}`;
}

function gtfsRouteId(routeId: string | number): string {
  return `gtfs-route-${routeId}`;
}

if (!existsSync(dbPath)) {
  throw new Error(`GTFS SQLite database not found: ${dbPath}`);
}

const gtfsStops = rows<GtfsStopRow>(`
  SELECT
    stop_id,
    stop_code,
    stop_name,
    CAST(stop_lat AS REAL) AS lat,
    CAST(stop_lon AS REAL) AS lng
  FROM stops
  WHERE stop_lat IS NOT NULL
    AND stop_lon IS NOT NULL
  ORDER BY CAST(stop_id AS TEXT);
`);

const stopById = new Map(gtfsStops.map((s) => [String(s.stop_id), s]));

const paraderos: Paradero[] = gtfsStops.map((s) => ({
  id: gtfsStopId(s.stop_id),
  source: 'gtfs',
  sourceId: String(s.stop_id),
  name: s.stop_name || `Paradero ${s.stop_code ?? s.stop_id}`,
  lat: Number(s.lat.toFixed(7)),
  lng: Number(s.lng.toFixed(7)),
  ref: s.stop_code == null ? undefined : String(s.stop_code),
}));

const routeRows = rows<GtfsRouteRow>(`
  SELECT
    r.route_id,
    r.agency_id,
    a.agency_name,
    r.route_short_name,
    r.route_long_name,
    r.route_color
  FROM routes r
  LEFT JOIN agency a ON a.agency_id = r.agency_id
  WHERE CAST(r.route_type AS INTEGER) = 3
  ORDER BY r.route_short_name COLLATE NOCASE, r.route_id;
`);

const representativeTrips = rows<TripCandidate>(`
  WITH trip_counts AS (
    SELECT
      t.route_id,
      t.trip_id,
      t.shape_id,
      t.trip_headsign,
      COUNT(st.stop_id) AS stop_count
    FROM trips t
    LEFT JOIN stop_times st ON st.trip_id = t.trip_id
    GROUP BY t.route_id, t.trip_id, t.shape_id, t.trip_headsign
  ),
  ranked AS (
    SELECT
      *,
      ROW_NUMBER() OVER (
        PARTITION BY route_id
        ORDER BY stop_count DESC, trip_id
      ) AS rank
    FROM trip_counts
  )
  SELECT route_id, trip_id, shape_id, trip_headsign, stop_count
  FROM ranked
  WHERE rank = 1;
`);

const tripByRouteId = new Map(representativeTrips.map((t) => [String(t.route_id), t]));
const tripIds = representativeTrips.map((t) => sqlString(t.trip_id)).join(',');
const shapeIds = Array.from(
  new Set(representativeTrips.map((t) => t.shape_id).filter((id) => id != null)),
)
  .map((id) => sqlString(id))
  .join(',');

const selectedStopTimes = tripIds
  ? rows<GtfsStopRow & { trip_id: string | number; seq: number }>(`
      SELECT
        st.trip_id,
        CAST(st.stop_sequence AS INTEGER) AS seq,
        s.stop_id,
        s.stop_code,
        s.stop_name,
        CAST(s.stop_lat AS REAL) AS lat,
        CAST(s.stop_lon AS REAL) AS lng
      FROM stop_times st
      JOIN stops s ON s.stop_id = st.stop_id
      WHERE st.trip_id IN (${tripIds})
      ORDER BY st.trip_id, CAST(st.stop_sequence AS INTEGER);
    `)
  : [];

const stopsByTripId = new Map<string, Array<GtfsStopRow & { seq: number }>>();
for (const stop of selectedStopTimes) {
  const key = String(stop.trip_id);
  const list = stopsByTripId.get(key) ?? [];
  list.push(stop);
  stopsByTripId.set(key, list);
}

const selectedShapes = shapeIds
  ? rows<ShapePoint>(`
      SELECT
        shape_id,
        CAST(shape_pt_sequence AS INTEGER) AS seq,
        CAST(shape_pt_lat AS REAL) AS lat,
        CAST(shape_pt_lon AS REAL) AS lng
      FROM shapes
      WHERE shape_id IN (${shapeIds})
      ORDER BY shape_id, CAST(shape_pt_sequence AS INTEGER);
    `)
  : [];

const shapeById = new Map<string, ShapePoint[]>();
for (const point of selectedShapes) {
  const key = String(point.shape_id);
  const list = shapeById.get(key) ?? [];
  list.push(point);
  shapeById.set(key, list);
}

const routes: BusRoute[] = [];
let skipped = 0;

for (const route of routeRows) {
  const trip = tripByRouteId.get(String(route.route_id));
  if (!trip) {
    skipped += 1;
    continue;
  }

  const stopRows = stopsByTripId.get(String(trip.trip_id)) ?? [];

  const stopIds = stopRows
    .filter((s) => stopById.has(String(s.stop_id)))
    .map((s) => gtfsStopId(s.stop_id));

  const shape = trip.shape_id ? (shapeById.get(String(trip.shape_id)) ?? []) : [];

  const rawPath = shape.length > 1
    ? shape.map((p) => [Number(p.lat), Number(p.lng)] as [number, number])
    : stopRows.map((s) => [Number(s.lat), Number(s.lng)] as [number, number]);

  if (rawPath.length < 2) {
    skipped += 1;
    continue;
  }

  const path = simplify(rawPath, 0.00008).map(([lat, lng]) => [
    Number(lat.toFixed(7)),
    Number(lng.toFixed(7)),
  ] as [number, number]);

  routes.push({
    id: gtfsRouteId(route.route_id),
    source: 'gtfs',
    sourceId: String(route.route_id),
    ref: String(route.route_short_name ?? route.route_id),
    name: displayName(route),
    operator: route.agency_name || undefined,
    network: 'GTFS Gran Concepción',
    colour: compactColor(route.route_color),
    path,
    stopIds,
  });
}

const summary = {
  source: 'gran_concepcion_candidate',
  generatedAt: new Date().toISOString(),
  routes: routes.length,
  stops: paraderos.length,
  skippedRoutes: skipped,
  note:
    'GTFS estático funcional para recorridos, shapes, paraderos y horarios programados. Verificación legal/primaria pendiente antes de uso productivo.',
};

const file = `// AUTO-GENERATED by scripts/generate-gtfs-concepcion.ts on ${summary.generatedAt}.
// Source: GTFS static Gran Concepción candidate imported into local SQLite.
// Re-generate: \`npm run sync:gtfs-concepcion\`.

import type { BusRoute, Paradero } from '@/types/transport';

export const GTFS_CONCEPCION_SOURCE = ${JSON.stringify(summary, null, 2)} as const;

export const GTFS_STOPS: Paradero[] = ${JSON.stringify(paraderos)};

export const GTFS_BUS_ROUTES: BusRoute[] = ${JSON.stringify(routes)};
`;

writeFileSync(outPath, file);
console.log(
  `Generated ${outPath}: ${routes.length} bus routes, ${paraderos.length} stops, ${skipped} skipped.`,
);
