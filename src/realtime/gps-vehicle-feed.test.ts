import { describe, expect, it } from 'vitest';
import { GTFS_BUS_ROUTES } from '@/data/gtfs-bus-routes.generated';
import {
  buildGpsMapVehicles,
  gpsVehicleFeed,
  publishGpsVehicles,
  stopGpsOnMap,
  type GpsMapInput,
} from '@/realtime/gps-vehicle-feed';
import { indexLiveServices, type LiveArrival, type LiveView } from '@/realtime/live-arrivals';
import {
  INITIAL_ROUTE_VEHICLES_STATE,
  applyRouteVehicles,
  gpsServicesFor,
  parseRouteVehiclesResponse,
  type RouteVehiclesState,
} from '@/realtime/route-vehicles';
import { routeVehiclesFixtures } from '@/realtime/route-vehicles.fixtures';
import type { Route, RouteDirection } from '@/types/transport';
import type { MapVehicle } from '@/types/ui-contracts';

const NOW = Date.UTC(2026, 10, 24, 15, 56, 0);

// Recorridos del visor como los arma src/data/routes.ts desde el GTFS oficial.
const ROUTES: Route[] = GTFS_BUS_ROUTES.map(
  (r) =>
    ({
      id: r.id,
      code: r.ref,
      color: r.colour ?? '#334155',
      type: 'micro',
      network: r.network,
      directions: (r.directions ?? []).map(
        (d): RouteDirection => ({ ...d, stops: [] }),
      ),
    }) as unknown as Route,
);
const byCode = (code: string): Route => {
  const route = ROUTES.find((r) => r.code === code);
  if (!route) throw new Error(`sin ${code}`);
  return route;
};
const LIVE_SERVICES = indexLiveServices(ROUTES);

/**
 * Estado tras consultar los pares de las líneas dadas con las respuestas de
 * ejemplo en `at`; `moveLat` corre todas las micros hacia el norte.
 */
function polled(routes: Route[], at: number, previous: RouteVehiclesState = INITIAL_ROUTE_VEHICLES_STATE, moveLat = 0) {
  const selection = gpsServicesFor(routes);
  const response = routeVehiclesFixtures(at).responseFor(selection.pairs);
  for (const service of Object.values(response.services)) {
    if (service.status === 'ok') service.vehicles = service.vehicles.map((v) => ({ ...v, lat: v.lat + moveLat }));
  }
  const parsed = parseRouteVehiclesResponse(response, at);
  if (!parsed.ok) throw new Error(parsed.error);
  const state = applyRouteVehicles(previous, parsed, selection.pairs);
  return { selection, state };
}

function input(routes: Route[], state: RouteVehiclesState, now: number, stop: GpsMapInput['stop'] = null): GpsMapInput {
  return {
    byService: state.byService,
    routeByPair: gpsServicesFor(routes).routeByPair,
    routesById: new Map(routes.map((r) => [r.id, r])),
    liveServices: LIVE_SERVICES,
    stop,
    now,
  };
}

function arrival(fields: Partial<LiveArrival> & Pick<LiveArrival, 'route' | 'plate'>) {
  return {
    direction: null,
    arrivalAt: NOW + 5 * 60_000,
    timeLabel: '5 min',
    distanceM: 1200,
    tripId: null,
    realtime: true,
    position: { lat: -36.83, lng: -73.06 },
    ...fields,
  } as LiveArrival & { position: { lat: number; lng: number } };
}

describe('buildGpsMapVehicles', () => {
  const lines = [byCode('24MF'), byCode('401'), byCode('421')];

  it('solo micros con GPS de las respuestas, todas kind "gps", con letrero del sentido y color de la línea', () => {
    const { state } = polled(lines, NOW);
    const vehicles = buildGpsMapVehicles(input(lines, state, NOW));
    // 24F:R: 3 de 4 (la de 7 min no); 24M:I: 2. La 401 responde sin micros y la 421 no se pudo consultar.
    expect(vehicles).toHaveLength(5);
    expect(vehicles.every((v) => v.kind === 'gps')).toBe(true);
    const r24 = byCode('24MF');
    expect(vehicles.every((v) => v.routeId === r24.id && v.color === r24.color)).toBe(true);
    const f = vehicles.find((v) => v.id === '24F:R#PRUE51')!;
    expect(f).toMatchObject({ directionId: 1, code: '24F', bearing: 239, stale: false, lat: -36.8221, lng: -73.0478 });
    expect(f.tooltip).toMatch(/^24F hacia .+ · GPS hace 20 s · patente PRUE51$/);
    expect(vehicles.find((v) => v.id === '24M:I#PRUE55')).toMatchObject({ directionId: 0, code: '24M' });
  });

  it('vieja pasados 2 min y fuera pasados 5 min', () => {
    const { state } = polled(lines, NOW);
    const at = (now: number) => buildGpsMapVehicles(input(lines, state, now));
    const ids = (vehicles: MapVehicle[]) => vehicles.map((v) => v.id).sort();

    // PRUE53 tiene 4 min: vieja. PRUE51 (20 s) no.
    const first = at(NOW);
    expect(first.find((v) => v.id === '24F:R#PRUE53')?.stale).toBe(true);
    expect(first.filter((v) => v.stale)).toHaveLength(1);
    expect(ids(first)).not.toContain('24F:R#PRUE54');

    // 100 s después PRUE51 cumple 2 min: todavía no es vieja; a los 2 min y 1 s, sí.
    expect(at(NOW + 100_000).find((v) => v.id === '24F:R#PRUE51')?.stale).toBe(false);
    expect(at(NOW + 101_000).find((v) => v.id === '24F:R#PRUE51')?.stale).toBe(true);

    // PRUE53 cumple 5 min a los 60 s y deja de dibujarse pasado eso.
    expect(ids(at(NOW + 60_000))).toContain('24F:R#PRUE53');
    expect(ids(at(NOW + 61_000))).not.toContain('24F:R#PRUE53');
  });

  it('ids estables entre consultas aunque la micro se mueva', () => {
    const one = polled(lines, NOW);
    const two = polled(lines, NOW + 30_000, one.state, 0.002);
    const a = buildGpsMapVehicles(input(lines, one.state, NOW));
    const b = buildGpsMapVehicles(input(lines, two.state, NOW + 30_000));
    expect(b.map((v) => v.id).sort()).toEqual(a.map((v) => v.id).sort());
    const moved = b.find((v) => v.id === '24F:R#PRUE51')!;
    expect(moved.lat).toBeCloseTo(-36.8201, 6);
  });

  it('salta servicios que no se consultaron y recorridos desconocidos', () => {
    // El estado trae todos los servicios de ejemplo, pero solo se consultó la 24MF.
    const parsed = parseRouteVehiclesResponse(routeVehiclesFixtures(NOW).ok, NOW);
    if (!parsed.ok) throw new Error(parsed.error);
    const all = Object.keys(parsed.services);
    const state = applyRouteVehicles(INITIAL_ROUTE_VEHICLES_STATE, parsed, all);
    const only24 = buildGpsMapVehicles(input([byCode('24MF')], state, NOW));
    expect(new Set(only24.map((v) => v.routeId))).toEqual(new Set([byCode('24MF').id]));
    // Un par consultado cuyo recorrido no está entre los dados tampoco se dibuja.
    const orphan = { ...input([byCode('24MF')], state, NOW), routesById: new Map<string, Route>() };
    expect(buildGpsMapVehicles(orphan)).toEqual([]);
  });

  it('suma las micros con GPS del paradero abierto, sin repetir patente: queda la más nueva', () => {
    const { state } = polled(lines, NOW);
    const stop = {
      ageMs: 10_000,
      stale: false,
      arrivals: [
        // Misma patente que en /api/route-vehicles (dato de hace 20 s): el del paradero es más nuevo.
        arrival({ route: '24F', direction: 'R', plate: 'PRUE51', position: { lat: -36.823, lng: -73.049 } }),
        // Misma patente que una de 4 min: también gana el paradero, y deja de ser vieja.
        arrival({ route: '24F', direction: 'R', plate: 'PRUE53', position: { lat: -36.842, lng: -73.092 } }),
        // Línea que no está en el mapa: igual se dibuja, con su letrero.
        arrival({ route: '30E', direction: 'R', plate: 'PRUE30' }),
        // Servicio que el visor no conoce: no se dibuja.
        arrival({ route: '99Z', direction: 'I', plate: 'PRUE99' }),
      ],
    };
    const vehicles = buildGpsMapVehicles(input(lines, state, NOW, stop));
    expect(vehicles).toHaveLength(6);
    expect(vehicles.filter((v) => v.id === '24F:R#PRUE51')).toHaveLength(1);
    expect(vehicles.find((v) => v.id === '24F:R#PRUE51')).toMatchObject({ lat: -36.823, lng: -73.049, bearing: null });
    expect(vehicles.find((v) => v.id === '24F:R#PRUE53')).toMatchObject({ lat: -36.842, stale: false });
    expect(vehicles.find((v) => v.id === '30E:R#PRUE30')).toMatchObject({
      kind: 'gps',
      routeId: byCode('30QE').id,
      directionId: 1,
      code: '30E',
    });
    expect(vehicles.some((v) => v.id.includes('PRUE99'))).toBe(false);

    // Si el dato del paradero es más viejo, se queda la posición de /api/route-vehicles.
    const older = buildGpsMapVehicles(input(lines, state, NOW, { ...stop, ageMs: 60_000 }));
    expect(older.find((v) => v.id === '24F:R#PRUE51')).toMatchObject({ lat: -36.8221, bearing: 239 });
  });

  it('las del paradero envejecen igual: viejas pasados 2 min y fuera pasados 5 min', () => {
    const view = (ageMs: number): LiveView => ({
      kind: ageMs > 2 * 60_000 ? 'stale' : 'live',
      arrivals: [arrival({ route: '30E', direction: 'R', plate: 'PRUE30' }), arrival({ route: '30E', plate: null, realtime: false })],
      notes: [],
      alerts: [],
      ageMs,
      lastFailure: null,
    });
    const none = INITIAL_ROUTE_VEHICLES_STATE;
    // Solo las con GPS y posición.
    expect(stopGpsOnMap(view(30_000))).toMatchObject({ ageMs: 30_000, stale: false });
    expect(stopGpsOnMap(view(30_000))?.arrivals).toHaveLength(1);
    const old = stopGpsOnMap(view(2 * 60_000 + 1_000));
    expect(old?.stale).toBe(true);
    expect(buildGpsMapVehicles(input([], none, NOW, old))[0].stale).toBe(true);
    // A los 6 min la ficha todavía las lista (hasta 10 min), pero el mapa ya no: la regla es una.
    expect(stopGpsOnMap(view(6 * 60_000))).toBeNull();
    const expired = { arrivals: old!.arrivals, ageMs: 5 * 60_000 + 1_000, stale: true };
    expect(buildGpsMapVehicles(input([], none, NOW, expired))).toEqual([]);
  });
});

describe('gpsVehicleFeed', () => {
  it('es la fuente "gps": entrega lo último al suscribirse y cada publicación; [] al apagar', () => {
    expect(gpsVehicleFeed.kind).toBe('gps');
    const lines = [byCode('24MF')];
    const { state } = polled(lines, NOW);
    const vehicles = buildGpsMapVehicles(input(lines, state, NOW));

    const seen: (readonly MapVehicle[])[] = [];
    const unsubscribe = gpsVehicleFeed.subscribe((v) => seen.push(v));
    publishGpsVehicles(vehicles);
    publishGpsVehicles(vehicles);
    const late: (readonly MapVehicle[])[] = [];
    const unsubscribeLate = gpsVehicleFeed.subscribe((v) => late.push(v));
    publishGpsVehicles([]);
    publishGpsVehicles([]);
    unsubscribe();
    unsubscribeLate();
    publishGpsVehicles(vehicles);

    expect(seen.map((v) => v.length)).toEqual([0, 5, 0]);
    expect(late.map((v) => v.length)).toEqual([5, 0]);
    expect(seen.flat().every((v) => v.kind === 'gps')).toBe(true);
    publishGpsVehicles([]);
  });
});
