// Sincroniza el GTFS oficial del Gran Concepción que publica la DTPR
// (División de Transporte Público Regional, Ministerio de Transportes) y
// regenera todos los src/data/gtfs-*.generated.ts. Reemplaza a los cuatro
// extractores que leían una sqlite local del GTFS 2019.
//
// - Zip: GTFS_URL (por defecto el de dtpr.gob.cl), con caché en .cache/gtfs/.
//   GTFS_ZIP_PATH lee un zip local en vez de descargar.
// - La versión vigente (feed_version "Gran Concepción20250228") declara
//   calendario 2024-01-01..2025-12-31 y no hay publicación posterior: los
//   días de servicio salen de los flags de calendar.txt sin filtrar por
//   fecha, y el rango declarado queda en GTFS_CONCEPCION_SOURCE.
// - Horas vacías en stop_times (paradas no timepoint) se ignoran; nunca se
//   leen como 00:00.
//
// Run: npm run sync:gtfs   (después corre sync:coverage)

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { simplify } from './lib/simplify.ts';
import {
  compareStopServiceWindows,
  renderScheduleModule,
  renderStopServicesModule,
  type StopServiceWindow,
} from './lib/gtfs-encode.ts';
import {
  DEFAULT_GTFS_URL,
  downloadGtfsZip,
  listZipEntries,
  localGtfsZip,
  parseGtfsTime,
  readGtfsRows,
  readGtfsTable,
} from './lib/gtfs-zip.ts';
import {
  addTripStopTime,
  cleanText,
  emptyTripWindow,
  feedVersionDate,
  finishTripWindow,
  formatGtfsDate,
  mostCommonKey,
  parseHeadsign,
  routeNetwork,
  routeOperator,
  serviceDaysFromCalendar,
  serviceWindow,
  type TripDropReason,
  type TripWindowAccumulator,
} from './lib/gtfs-transform.ts';
import type {
  BusRoute,
  BusRouteDirection,
  LatLngTuple,
  Paradero,
  RouteSchedule,
  ScheduledTrip,
} from '../src/types/transport.ts';

const SCRIPT = 'scripts/sync-gtfs-official.ts';
const SIMPLIFY_TOLERANCE = 0.00008;
const OUT = {
  stops: resolve('src/data/gtfs-stops.generated.ts'),
  routes: resolve('src/data/gtfs-bus-routes.generated.ts'),
  barrel: resolve('src/data/gtfs-concepcion.generated.ts'),
  schedule: resolve('src/data/gtfs-schedule.generated.ts'),
  frequency: resolve('src/data/gtfs-stop-frequency.generated.ts'),
  services: resolve('src/data/gtfs-stop-services.generated.ts'),
};

const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const stopKey = (stopId: string) => `gtfs-stop-${stopId}`;
const routeKey = (routeId: string) => `gtfs-route-${routeId}`;
const round7 = (value: number) => Number(value.toFixed(7));

function compactColor(color: string | undefined): string | undefined {
  const hex = (color ?? '').trim().replace(/^#/, '');
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex.toLowerCase()}` : undefined;
}

function increment<K>(map: Map<K, number>, key: K, by = 1): void {
  map.set(key, (map.get(key) ?? 0) + by);
}

// ---------------------------------------------------------------------------
// 1. Zip
// ---------------------------------------------------------------------------

const url = process.env.GTFS_URL ?? DEFAULT_GTFS_URL;
const localZip = process.env.GTFS_ZIP_PATH;
console.log(localZip ? `Leyendo zip local ${localZip}…` : `Descargando ${url}…`);
const zip = localZip ? await localGtfsZip(localZip) : await downloadGtfsZip(url, resolve('.cache/gtfs'));
console.log(`  → ${(zip.size / 1e6).toFixed(1)} MB · sha256 ${zip.sha256.slice(0, 12)}… · ${zip.origin}`);
const entries = await listZipEntries(zip.path);

// ---------------------------------------------------------------------------
// 2. Tablas chicas
// ---------------------------------------------------------------------------

const feedInfo = entries.has('feed_info.txt') ? (await readGtfsRows(zip.path, entries, 'feed_info.txt'))[0] : undefined;

const calendarRows = await readGtfsRows(zip.path, entries, 'calendar.txt');
const serviceIds = calendarRows.map((row) => row.service_id.trim()).sort(byText);
const serviceIndex = new Map(serviceIds.map((id, index) => [id, index]));
const serviceDays: boolean[][] = serviceIds.map(() => []);
let calendarStart: string | null = null;
let calendarEnd: string | null = null;
for (const row of calendarRows) {
  serviceDays[serviceIndex.get(row.service_id.trim())!] = serviceDaysFromCalendar(row);
  const start = formatGtfsDate(row.start_date);
  const end = formatGtfsDate(row.end_date);
  if (start && (!calendarStart || start < calendarStart)) calendarStart = start;
  if (end && (!calendarEnd || end > calendarEnd)) calendarEnd = end;
}

interface RouteInfo {
  routeId: string;
  ref: string;
  name: string;
  colour?: string;
}

const routeById = new Map<string, RouteInfo>();
let nonBusRoutes = 0;
for (const row of await readGtfsRows(zip.path, entries, 'routes.txt')) {
  if (row.route_type.trim() !== '3') {
    nonBusRoutes += 1;
    continue;
  }
  const routeId = row.route_id.trim();
  const ref = cleanText(row.route_short_name) || routeId;
  routeById.set(routeId, {
    routeId,
    ref,
    name: cleanText(row.route_long_name) || ref,
    colour: compactColor(row.route_color),
  });
}

const paraderos: Paradero[] = [];
let skippedStops = 0;
for (const row of await readGtfsRows(zip.path, entries, 'stops.txt')) {
  const lat = Number(row.stop_lat);
  const lng = Number(row.stop_lon);
  const locationType = (row.location_type ?? '').trim();
  if (
    !row.stop_lat?.trim() ||
    !row.stop_lon?.trim() ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    (locationType !== '' && locationType !== '0')
  ) {
    skippedStops += 1;
    continue;
  }
  const sourceId = row.stop_id.trim();
  const code = cleanText(row.stop_code);
  paraderos.push({
    id: stopKey(sourceId),
    source: 'gtfs',
    sourceId,
    name: cleanText(row.stop_name) || `Paradero ${code || sourceId}`,
    lat: round7(lat),
    lng: round7(lng),
    ...(code ? { ref: code } : {}),
  });
}
paraderos.sort((a, b) => byText(a.sourceId!, b.sourceId!));
const stopIndex = new Map(paraderos.map((p, index) => [p.sourceId!, index]));

const shapePoints = new Map<string, Array<[number, number, number]>>();
if (entries.has('shapes.txt')) {
  for await (const row of readGtfsTable(zip.path, entries, 'shapes.txt')) {
    const lat = Number(row.shape_pt_lat);
    const lng = Number(row.shape_pt_lon);
    const sequence = Number(row.shape_pt_sequence);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(sequence)) continue;
    const shapeId = row.shape_id.trim();
    const list = shapePoints.get(shapeId) ?? [];
    list.push([sequence, lat, lng]);
    shapePoints.set(shapeId, list);
  }
}
for (const list of shapePoints.values()) list.sort((a, b) => a[0] - b[0]);

interface TripInfo {
  route: RouteInfo;
  /** -1 si el service_id no está en calendar.txt. */
  serviceIdx: number;
  directionId: 0 | 1;
  headsign: string;
  shapeId: string;
  routeHeadsignIdx: number;
  /** Pares [stop_sequence, índice de paradero] en el orden en que llegan. */
  stopPairs: number[];
  window: TripWindowAccumulator;
}

// Índice compacto de (ruta, headsign) para agrupar pasadas por paradero.
const routeHeadsigns: Array<[routeId: string, headsign: string]> = [];
const routeHeadsignIndex = new Map<string, number>();
function internRouteHeadsign(routeId: string, headsign: string): number {
  const key = `${routeId}\t${headsign}`;
  let index = routeHeadsignIndex.get(key);
  if (index === undefined) {
    index = routeHeadsigns.length;
    routeHeadsigns.push([routeId, headsign]);
    routeHeadsignIndex.set(key, index);
  }
  return index;
}

const tripById = new Map<string, TripInfo>();
let tripsOutsideBusRoutes = 0;
let tripsWithoutCalendar = 0;
for (const row of await readGtfsRows(zip.path, entries, 'trips.txt')) {
  const route = routeById.get(row.route_id.trim());
  if (!route) {
    tripsOutsideBusRoutes += 1;
    continue;
  }
  const direction = (row.direction_id ?? '').trim();
  if (direction !== '' && direction !== '0' && direction !== '1') {
    throw new Error(`trips.txt: direction_id="${row.direction_id}" en ${row.trip_id}`);
  }
  const serviceIdx = serviceIndex.get(row.service_id.trim()) ?? -1;
  if (serviceIdx === -1) tripsWithoutCalendar += 1;
  const headsign = cleanText(row.trip_headsign);
  tripById.set(row.trip_id.trim(), {
    route,
    serviceIdx,
    directionId: direction === '1' ? 1 : 0,
    headsign,
    shapeId: (row.shape_id ?? '').trim(),
    routeHeadsignIdx: internRouteHeadsign(route.routeId, headsign),
    stopPairs: [],
    window: emptyTripWindow(),
  });
}

// ---------------------------------------------------------------------------
// 3. stop_times en streaming (~300 MB): patrones, ventanas y pasadas
// ---------------------------------------------------------------------------

console.log('Leyendo stop_times.txt…');
const stopCount = paraderos.length;
const serviceCount = serviceIds.length;
// [servicio][paradero * 24 + hora] → pasadas.
const frequencyByService = serviceIds.map(() => new Uint32Array(stopCount * 24));
// ((ruta/headsign * paraderos) + paradero) * servicios + servicio → minutos de pasada.
const passMinutes = new Map<number, number[]>();
let stopTimeRows = 0;
let orphanStopTimes = 0;
let unknownStopTimes = 0;
let untimedStopTimes = 0;

for await (const row of readGtfsTable(zip.path, entries, 'stop_times.txt')) {
  stopTimeRows += 1;
  const trip = tripById.get(row.trip_id.trim());
  if (!trip) {
    orphanStopTimes += 1;
    continue;
  }
  const stopIdx = stopIndex.get(row.stop_id.trim());
  if (stopIdx === undefined) {
    unknownStopTimes += 1;
    continue;
  }
  const sequence = Number(row.stop_sequence);
  if (!Number.isInteger(sequence)) throw new Error(`stop_times.txt: stop_sequence="${row.stop_sequence}"`);
  const arrival = parseGtfsTime(row.arrival_time);
  const departure = parseGtfsTime(row.departure_time);
  trip.stopPairs.push(sequence, stopIdx);
  addTripStopTime(trip.window, sequence, arrival, departure);

  // Frecuencia y ventanas usan la hora de llegada (como los extractores
  // sqlite); si solo viene la salida se usa esa, y sin ninguna se omite.
  const passing = arrival ?? departure;
  if (passing === null) {
    untimedStopTimes += 1;
    continue;
  }
  if (trip.serviceIdx === -1) continue;
  frequencyByService[trip.serviceIdx][stopIdx * 24 + (Math.floor(passing / 3600) % 24)] += 1;
  const stopHeadsign = cleanText(row.stop_headsign);
  const routeHeadsignIdx =
    stopHeadsign && stopHeadsign !== trip.headsign
      ? internRouteHeadsign(trip.route.routeId, stopHeadsign)
      : trip.routeHeadsignIdx;
  const key = (routeHeadsignIdx * stopCount + stopIdx) * serviceCount + trip.serviceIdx;
  const minutes = passMinutes.get(key);
  if (minutes) minutes.push(Math.floor(passing / 60));
  else passMinutes.set(key, [Math.floor(passing / 60)]);
}
console.log(`  → ${stopTimeRows.toLocaleString('en-US')} filas`);

// ---------------------------------------------------------------------------
// 4. Recorridos: un sentido por direction_id con su patrón más común
// ---------------------------------------------------------------------------

function tripPattern(trip: TripInfo): number[] {
  const pairs = trip.stopPairs;
  const order = Array.from({ length: pairs.length / 2 }, (_, k) => k).sort(
    (a, b) => pairs[2 * a] - pairs[2 * b],
  );
  return order.map((k) => pairs[2 * k + 1]);
}

const tripsByRoute = new Map<string, TripInfo[]>();
for (const trip of tripById.values()) {
  const list = tripsByRoute.get(trip.route.routeId) ?? [];
  list.push(trip);
  tripsByRoute.set(trip.route.routeId, list);
}

function buildDirection(directionId: 0 | 1, trips: TripInfo[]): BusRouteDirection | null {
  const patternCounts = new Map<string, number>();
  const patterns = new Map<TripInfo, string>();
  for (const trip of trips) {
    const pattern = tripPattern(trip).join(',');
    patterns.set(trip, pattern);
    increment(patternCounts, pattern);
  }
  const pattern = mostCommonKey(patternCounts);
  if (!pattern) return null;
  const stopIdxs = pattern.split(',').map(Number);

  const shapeCounts = new Map<string, number>();
  const headsignCounts = new Map<string, number>();
  for (const trip of trips) {
    increment(headsignCounts, trip.headsign);
    if (patterns.get(trip) === pattern && trip.shapeId) increment(shapeCounts, trip.shapeId);
  }
  const shape = shapePoints.get(mostCommonKey(shapeCounts) ?? '') ?? [];
  const rawPath: LatLngTuple[] =
    shape.length > 1
      ? shape.map(([, lat, lng]) => [lat, lng])
      : stopIdxs.map((idx) => [paraderos[idx].lat, paraderos[idx].lng]);
  if (rawPath.length < 2) return null;

  const headsign = mostCommonKey(headsignCounts) ?? '';
  const { variant } = parseHeadsign(headsign);
  return {
    directionId,
    headsign,
    ...(variant ? { variant } : {}),
    path: simplify(rawPath, SIMPLIFY_TOLERANCE).map(([lat, lng]) => [round7(lat), round7(lng)]),
    stopIds: stopIdxs.map((idx) => paraderos[idx].id),
  };
}

type GeneratedRoute = Omit<BusRoute, 'path' | 'stopIds' | 'directions'> & {
  directions: BusRouteDirection[];
};

const routes: GeneratedRoute[] = [];
let skippedRoutes = 0;
const sortedRoutes = Array.from(routeById.values()).sort(
  (a, b) => byText(a.ref.toLowerCase(), b.ref.toLowerCase()) || byText(a.routeId, b.routeId),
);
for (const route of sortedRoutes) {
  const trips = tripsByRoute.get(route.routeId) ?? [];
  const directions = ([0, 1] as const)
    .map((directionId) => buildDirection(directionId, trips.filter((t) => t.directionId === directionId)))
    .filter((direction) => direction !== null);
  if (directions.length === 0) {
    skippedRoutes += 1;
    console.warn(`  ! ${route.ref} (${route.routeId}) sin viajes o trazado: se omite`);
    continue;
  }
  const operator = routeOperator(trips.map((trip) => trip.headsign));
  routes.push({
    id: routeKey(route.routeId),
    source: 'gtfs',
    sourceId: route.routeId,
    ref: route.ref,
    name: route.name,
    ...(operator ? { operator } : {}),
    network: routeNetwork(route.ref),
    ...(route.colour ? { colour: route.colour } : {}),
    directions,
  });
}
const keptRouteIds = new Set(routes.map((route) => route.sourceId!));

// ---------------------------------------------------------------------------
// 5. Horarios: ventana de cada viaje por día de la semana
// ---------------------------------------------------------------------------

const emptySchedule = (): RouteSchedule => [[], [], [], [], [], [], []];
const directionSchedules = new Map<string, RouteSchedule>();
const droppedByRoute = new Map<string, Map<TripDropReason, number>>();
const keptTripsByService = serviceIds.map(() => 0);
let droppedTrips = 0;

for (const trip of tripById.values()) {
  if (trip.serviceIdx === -1 || !keptRouteIds.has(trip.route.routeId)) continue;
  const window = finishTripWindow(trip.window);
  if (!window.ok) {
    droppedTrips += 1;
    const reasons = droppedByRoute.get(trip.route.ref) ?? new Map<TripDropReason, number>();
    increment(reasons, window.reason);
    droppedByRoute.set(trip.route.ref, reasons);
    continue;
  }
  keptTripsByService[trip.serviceIdx] += 1;
  const key = `${routeKey(trip.route.routeId)}#${trip.directionId}`;
  const schedule = directionSchedules.get(key) ?? emptySchedule();
  const scheduled: ScheduledTrip = [window.startMin, window.durationMin];
  serviceDays[trip.serviceIdx].forEach((active, day) => {
    if (active) schedule[day].push(scheduled);
  });
  directionSchedules.set(key, schedule);
}
const byStart = (a: ScheduledTrip, b: ScheduledTrip) => a[0] - b[0] || a[1] - b[1];
for (const schedule of directionSchedules.values()) for (const day of schedule) day.sort(byStart);

// ---------------------------------------------------------------------------
// 6. Frecuencia horaria y ventanas de servicio por paradero
// ---------------------------------------------------------------------------

const stopFrequency = new Map<string, number[]>();
for (let stopIdx = 0; stopIdx < stopCount; stopIdx++) {
  const counts = new Array<number>(7 * 24).fill(0);
  let total = 0;
  for (let s = 0; s < serviceCount; s++) {
    for (let hour = 0; hour < 24; hour++) {
      const value = frequencyByService[s][stopIdx * 24 + hour];
      if (value === 0) continue;
      for (let day = 0; day < 7; day++) {
        if (serviceDays[s][day]) counts[day * 24 + hour] += value;
      }
      total += value;
    }
  }
  if (total > 0) stopFrequency.set(paraderos[stopIdx].id, counts);
}

const stopWindows = new Map<string, StopServiceWindow[]>();
// Agrupa las pasadas por (ruta/headsign, paradero) uniendo los servicios de cada día.
const passGroups = new Map<number, Array<number[] | undefined>>();
for (const [key, minutes] of passMinutes) {
  const group = Math.floor(key / serviceCount);
  const perService = passGroups.get(group) ?? new Array<number[] | undefined>(serviceCount);
  perService[key % serviceCount] = minutes;
  passGroups.set(group, perService);
}
for (const [group, perService] of passGroups) {
  const stopIdx = group % stopCount;
  const [routeId, headsign] = routeHeadsigns[Math.floor(group / stopCount)];
  for (let day = 0; day < 7; day++) {
    const minutes: number[] = [];
    for (let s = 0; s < serviceCount; s++) {
      if (serviceDays[s][day] && perService[s]) minutes.push(...perService[s]!);
    }
    const window = serviceWindow(minutes);
    if (!window) continue;
    const stopId = paraderos[stopIdx].id;
    const list = stopWindows.get(stopId) ?? [];
    list.push([routeKey(routeId), headsign, day, ...window]);
    stopWindows.set(stopId, list);
  }
}
for (const list of stopWindows.values()) list.sort(compareStopServiceWindows);

// ---------------------------------------------------------------------------
// 7. Archivos generados
// ---------------------------------------------------------------------------

const generatedAt = new Date().toISOString();
const publisher = cleanText(feedInfo?.feed_publisher_name) || null;
const feedVersion = cleanText(feedInfo?.feed_version) || null;
const versionDate = feedVersionDate(feedVersion ?? undefined);
const feedStartDate = formatGtfsDate(feedInfo?.feed_start_date) ?? calendarStart;
const feedEndDate = formatGtfsDate(feedInfo?.feed_end_date) ?? calendarEnd;
const expired = feedEndDate !== null && feedEndDate < generatedAt.slice(0, 10);

const source = {
  source: 'GTFS oficial DTPR',
  publisher,
  url,
  sha256: zip.sha256,
  feedVersion,
  feedStartDate,
  feedEndDate,
  fetchedAt: zip.fetchedAt,
  generatedAt,
  routes: routes.length,
  stops: paraderos.length,
  skippedRoutes,
  note:
    `GTFS oficial publicado por ${publisher ?? 'la DTPR'}` +
    `${versionDate ? `, versión del ${versionDate}` : feedVersion ? `, versión ${feedVersion}` : ''}. ` +
    `Calendario declarado del ${feedStartDate ?? '?'} al ${feedEndDate ?? '?'}` +
    (expired
      ? ': ya venció y no hay una versión posterior publicada, así que se usa sin filtrar por fecha como la programación oficial más reciente.'
      : '.'),
};

const sourceLine = `// Fuente: ${source.source} · ${feedVersion ?? 'sin feed_version'} · calendario ${feedStartDate ?? '?'}..${feedEndDate ?? '?'}${expired ? ' (vencido, sin filtrar por fecha)' : ''}.
// ${url} · sha256 ${zip.sha256}`;
const banner = (description: string) => `// AUTO-GENERATED by ${SCRIPT} on ${generatedAt}.
${sourceLine}
${description}
// Re-generate: \`npm run sync:gtfs\`.
`;

const stopsFile = `${banner(`// GTFS paraderos (Paradero[]) — paired with gtfs-bus-routes.generated.ts.`)}
import type { Paradero } from '@/types/transport';

export const GTFS_CONCEPCION_SOURCE = ${JSON.stringify(source, null, 2)} as const;

export const GTFS_STOPS: Paradero[] = ${JSON.stringify(paraderos)};
`;

const routesFile = `${banner(`// GTFS bus routes con sus dos sentidos (directions) — chunk pesado que
// src/data/routes.ts carga en diferido al iniciar. \`path\`/\`stopIds\` de cada
// ruta son los del primer sentido (direction_id 0 si existe).`)}
import type { BusRoute, BusRouteDirection } from '@/types/transport';

type GeneratedRoute = Omit<BusRoute, 'path' | 'stopIds' | 'directions'> & {
  directions: BusRouteDirection[];
};

const ROUTES: GeneratedRoute[] = ${JSON.stringify(routes)};

export const GTFS_BUS_ROUTES: BusRoute[] = ROUTES.map((route) => ({
  ...route,
  path: route.directions[0].path,
  stopIds: route.directions[0].stopIds,
}));
`;

const barrelFile = `// AUTO-GENERATED by ${SCRIPT} on ${generatedAt}.
// Barrel — re-exports from the split files. Prefer importing from
// gtfs-stops.generated.ts directly to avoid bundling the heavy bus-routes
// chunk into your module.

export { GTFS_STOPS, GTFS_CONCEPCION_SOURCE } from './gtfs-stops.generated';
export { GTFS_BUS_ROUTES } from './gtfs-bus-routes.generated';
`;

const scheduledRouteIds = new Set(
  Array.from(directionSchedules.keys(), (key) => key.slice(0, key.lastIndexOf('#'))),
);
// Entradas ruta-día como las contaba el extractor anterior (ambos sentidos juntos).
const totalEntries = Array.from(directionSchedules.values()).reduce(
  (acc, schedule) => acc + schedule.reduce((sum, day) => sum + day.length, 0),
  0,
);

const scheduleFile = renderScheduleModule({
  banner: banner(`// Viajes programados por día de la semana. Cada viaje es
// [startMinutesFromMidnight, durationMinutes]: salida de la primera parada con
// hora → llegada a la última (las horas vacías se ignoran; pueden pasar de
// 1440). 0=Monday, 1=Tuesday, ..., 6=Sunday.
// ROUTE_SCHEDULES junta ambos sentidos; ROUTE_DIRECTION_SCHEDULES los separa.
// Formato compacto decodificado al cargar: ver scripts/lib/gtfs-encode.ts.`),
  directionSchedules,
  meta: {
    generatedAt,
    routes: scheduledRouteIds.size,
    directions: directionSchedules.size,
    totalEntries,
    droppedTrips,
  },
});

const frequencyBody = Array.from(stopFrequency.entries())
  .sort((a, b) => byText(a[0], b[0]))
  .map(([id, counts]) => {
    let last = counts.length - 1;
    while (last >= 0 && counts[last] === 0) last--;
    return `  ${JSON.stringify(id)}: [${counts.slice(0, last + 1).join(',')}]`;
  })
  .join(',\n');
const frequencyFile = `${banner(`// Hourly bus frequency at every paradero. Each entry is a flat 168-element
// array — \`arr[day * 24 + hour]\` is the number of buses scheduled to pass
// during that hour (trailing zeros trimmed). Day index: 0=Monday..6=Sunday.
// Hora = llegada (o salida si falta) módulo 24, en el día del servicio; las
// filas sin hora se omiten.`)}
export const STOP_FREQUENCY: Record<string, number[]> = {
${frequencyBody},
};

export const STOP_FREQUENCY_META = {
  generatedAt: ${JSON.stringify(generatedAt)},
  paraderos: ${stopFrequency.size},
  arrivals: ${stopTimeRows - orphanStopTimes - unknownStopTimes - untimedStopTimes},
} as const;
`;

const totalWindows = Array.from(stopWindows.values()).reduce((acc, list) => acc + list.length, 0);
const servicesFile = renderStopServicesModule({
  banner: banner(`// Compact programmed service windows by GTFS stop.
// Tuple: [routeId, headsign, day, firstMin, lastMin, medianHeadwayMin, count].
// Day index: 0=Monday..6=Sunday. Minutos de llegada (o salida si falta) desde
// la medianoche del día de servicio; las filas sin hora se omiten.
// Formato compacto decodificado al cargar: ver scripts/lib/gtfs-encode.ts.`),
  windowsByStop: stopWindows,
  meta: {
    generatedAt,
    paraderos: stopWindows.size,
    windows: totalWindows,
    rawVisits: stopTimeRows - orphanStopTimes - unknownStopTimes - untimedStopTimes,
  },
});

// Las marcas de tiempo cambian en cada corrida; si es lo único distinto no se
// reescribe el archivo, así el sync diario no abre PRs vacíos.
const TIMESTAMP_RE = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g;
function writeGenerated(path: string, content: string): { path: string; raw: number; gzip: number; changed: boolean } {
  const previous = existsSync(path) ? readFileSync(path, 'utf8') : null;
  const changed = previous?.replace(TIMESTAMP_RE, '') !== content.replace(TIMESTAMP_RE, '');
  if (changed) writeFileSync(path, content);
  return { path, raw: Buffer.byteLength(content), gzip: gzipSync(content).length, changed };
}

const written = [
  writeGenerated(OUT.stops, stopsFile),
  writeGenerated(OUT.routes, routesFile),
  writeGenerated(OUT.barrel, barrelFile),
  writeGenerated(OUT.schedule, scheduleFile),
  writeGenerated(OUT.frequency, frequencyFile),
  writeGenerated(OUT.services, servicesFile),
];

// ---------------------------------------------------------------------------
// 8. Resumen
// ---------------------------------------------------------------------------

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
console.log(`\nGTFS ${feedVersion ?? '?'} (${feedStartDate}..${feedEndDate}${expired ? ', vencido' : ''})`);
console.log(`  rutas: ${routes.length} (${skippedRoutes} omitidas, ${nonBusRoutes} no-bus)`);
console.log(
  `  sentidos: ${routes.reduce((acc, r) => acc + r.directions.length, 0)} · rutas con un solo sentido: ${
    routes.filter((r) => r.directions.length === 1).map((r) => r.ref).join(', ') || '—'
  }`,
);
console.log(`  paraderos: ${paraderos.length} (${skippedStops} omitidos)`);
console.log(
  `  viajes por servicio: ${serviceIds
    .map((id, i) => `${id} ${keptTripsByService[i]} (${serviceDays[i].map((on, d) => (on ? 'LMXJVSD'[d] : '·')).join('')})`)
    .join(' · ')}`,
);
console.log(`  viajes descartados: ${droppedTrips}`);
for (const [ref, reasons] of Array.from(droppedByRoute.entries()).sort((a, b) => byText(a[0], b[0]))) {
  console.log(`    ${ref}: ${Array.from(reasons.entries()).map(([reason, n]) => `${n} ${reason}`).join(', ')}`);
}
const anomalies = [
  [tripsOutsideBusRoutes, 'viajes de rutas no-bus'],
  [tripsWithoutCalendar, 'viajes sin service_id en calendar.txt (fuera de horarios)'],
  [orphanStopTimes, 'filas de stop_times sin viaje conocido'],
  [unknownStopTimes, 'filas de stop_times con paradero desconocido'],
  [untimedStopTimes, 'filas de stop_times sin hora (ignoradas en frecuencia/ventanas)'],
] as const;
for (const [count, label] of anomalies) if (count > 0) console.log(`  ! ${count.toLocaleString('en-US')} ${label}`);
console.log(`  stop_times: ${stopTimeRows.toLocaleString('en-US')} filas · ventanas por paradero: ${totalWindows.toLocaleString('en-US')}`);
console.log('Archivos:');
for (const file of written) {
  console.log(
    `  ${file.changed ? 'escrito ' : 'sin cambios'} ${file.path.slice(process.cwd().length + 1)} · ${kb(file.raw)} (${kb(file.gzip)} gzip)`,
  );
}
