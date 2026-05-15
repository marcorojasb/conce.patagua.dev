// Street routing between two points using the public OSRM-based router
// hosted by OpenStreetMap. The project-osrm.org demo only ships the 'car'
// profile (silently falls back, gave us ~39 km/h durations for foot), but
// routing.openstreetmap.de exposes routed-foot / routed-car / routed-bike
// separately. "Best effort" per fair-use policy — fine for an analysis tool
// used occasionally, NOT for high-traffic production. If load grows we
// self-host OSRM or switch to OpenRouteService / Mapbox Directions.
//
// Why walking? The planner answers "where do we meet halfway" — the midpoint
// that matters for a meeting is pedestrian-accessible, not car-shortcut.

const OSRM_BASE = 'https://routing.openstreetmap.de/routed-foot/route/v1';
const PROFILE = 'foot';

export interface RoutingResult {
  /** Full polyline of the routed path, [lat, lng] vertices in order. */
  path: Array<[number, number]>;
  /** Walking-route midpoint by distance — half the cumulative path length. */
  midpoint: [number, number];
  /** Total path distance, meters. */
  distanceMeters: number;
  /** Walking duration the router estimated, seconds. */
  durationSeconds: number;
  /** Distance along the path from A to the midpoint, meters. */
  distanceFromAMeters: number;
  /** Distance along the path from the midpoint to B, meters. */
  distanceToBMeters: number;
}

interface OsrmResponse {
  code: string;
  message?: string;
  routes?: Array<{
    geometry: { type: 'LineString'; coordinates: Array<[number, number]> };
    distance: number;
    duration: number;
  }>;
}

function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// Walk the polyline summing segment lengths. When the cumulative reaches
// targetMeters, linearly interpolate inside the current segment and return
// that point — accurate to the simplification of the polyline.
function pointAtDistance(
  path: Array<[number, number]>,
  targetMeters: number,
): [number, number] {
  if (path.length === 0) return [0, 0];
  if (path.length === 1) return path[0];
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const segLen = haversineMeters(path[i - 1], path[i]);
    if (acc + segLen >= targetMeters) {
      const t = segLen > 0 ? (targetMeters - acc) / segLen : 0;
      const lat = path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t;
      const lng = path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t;
      return [lat, lng];
    }
    acc += segLen;
  }
  return path[path.length - 1];
}

export interface RouteBetweenOptions {
  /** Abort the fetch (e.g. component unmount, point changed). */
  signal?: AbortSignal;
}

export async function routeBetween(
  a: [number, number],
  b: [number, number],
  opts: RouteBetweenOptions = {},
): Promise<RoutingResult> {
  // OSRM coordinate order is lng,lat — bit them on the API side, not us.
  const coords = `${a[1]},${a[0]};${b[1]},${b[0]}`;
  const url = `${OSRM_BASE}/${PROFILE}/${coords}?overview=full&geometries=geojson`;

  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok) {
    throw new Error(`OSRM HTTP ${res.status}`);
  }
  const data = (await res.json()) as OsrmResponse;
  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(`OSRM: ${data.code}${data.message ? ` — ${data.message}` : ''}`);
  }
  const route = data.routes[0];
  const path = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng] as [number, number],
  );

  // Use the router's distance, fall back to summing if missing (shouldn't
  // happen on OSRM but we don't trust foreign APIs blindly).
  const totalMeters =
    Number.isFinite(route.distance) && route.distance > 0
      ? route.distance
      : path.reduce(
          (acc, p, i) => (i === 0 ? 0 : acc + haversineMeters(path[i - 1], p)),
          0,
        );

  const midpoint = pointAtDistance(path, totalMeters / 2);

  return {
    path,
    midpoint,
    distanceMeters: totalMeters,
    durationSeconds: route.duration ?? 0,
    distanceFromAMeters: totalMeters / 2,
    distanceToBMeters: totalMeters / 2,
  };
}

export function formatDistanceMeters(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 2 : 1)} km`;
}

export function formatDurationSeconds(s: number): string {
  if (s < 60) return `${Math.round(s)} s`;
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return `${h} h ${String(rest).padStart(2, '0')} min`;
}
