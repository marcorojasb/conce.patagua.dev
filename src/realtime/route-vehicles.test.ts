import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GPS_MAX_AGE_MS,
  GPS_STALE_AFTER_MS,
  INITIAL_ROUTE_VEHICLES_STATE,
  MAX_GPS_PAIRS,
  applyRouteVehicles,
  applyRouteVehiclesFailure,
  gpsServicesFor,
  gpsStatusByRoute,
  gpsVehiclesForMap,
  normalizeGpsPairs,
  parseRouteVehiclesResponse,
  readRouteVehiclesResult,
  retainGpsPairs,
  routeVehiclesUrl,
  sourceClock,
  vehicleAge,
  type RouteVehiclesResponse,
  type RouteVehiclesState,
} from '@/realtime/route-vehicles';
import { routeVehiclesFixtures } from '@/realtime/route-vehicles.fixtures';
import { getRouteVehiclesSnapshot, watchRouteVehicles } from '@/hooks/use-route-vehicles';
import { GTFS_BUS_ROUTES } from '@/data/gtfs-bus-routes.generated';
import type { Route } from '@/types/transport';

const NOW = Date.UTC(2026, 10, 24, 15, 56, 0);
const fixtures = routeVehiclesFixtures(NOW);

function parsed(raw: unknown, now = NOW): RouteVehiclesResponse {
  const result = parseRouteVehiclesResponse(raw, now);
  if (!result.ok) throw new Error(result.error);
  return { fetchedAt: result.fetchedAt, services: result.services };
}

function vehiclesOf(raw: unknown, pair: string) {
  const service = parsed(raw).services[pair];
  if (service?.status !== 'ok') throw new Error(`${pair} sin datos`);
  return service.vehicles;
}

// Recorridos del visor como los arma src/data/routes.ts: los del GTFS con sus
// sentidos y Biotrén sin sentidos.
const GTFS_ROUTES = GTFS_BUS_ROUTES.map(
  (r) => ({ id: r.id, code: r.ref, type: 'micro', network: r.network, directions: r.directions ?? [] }) as unknown as Route,
);
const BIOTREN = ['L1', 'L2'].map((code) => ({ id: `bt-${code.toLowerCase()}`, code, type: 'biotren' }) as unknown as Route);
const byCode = (code: string): Route => {
  const route = GTFS_ROUTES.find((r) => r.code === code);
  if (!route) throw new Error(`sin ${code}`);
  return route;
};

describe('parseRouteVehiclesResponse', () => {
  it('lee los servicios de ejemplo con solo los campos públicos de cada micro', () => {
    const response = parsed(fixtures.ok);
    expect(response.fetchedAt).toBe(NOW);
    expect(Object.keys(response.services).sort()).toEqual(Object.keys(fixtures.services).sort());
    expect(response.services['24F:R']).toMatchObject({ status: 'ok', fetchedAt: NOW - 5_000 });
    expect(vehiclesOf(fixtures.ok, '24F:R')[0]).toEqual({
      service: '24F',
      direction: 'R',
      plate: 'PRUE51',
      lat: -36.8221,
      lng: -73.0478,
      bearing: 239,
      reportedAt: NOW - 20_000,
    });
    expect(response.services['401I:I']).toEqual({ status: 'ok', fetchedAt: NOW - 5_000, vehicles: [] });
    expect(response.services['421I:I']).toEqual({ status: 'unavailable' });
    expect(response.services['421R:R']).toEqual({ status: 'rate_limited' });
  });

  it('un estado desconocido o un servicio sin lista de micros es "unavailable"', () => {
    const response = parsed({
      fetchedAt: NOW,
      services: {
        '10A:I': { status: 'degraded' },
        '10A:R': { status: 'ok' },
        '20A:R': { status: 'ok', vehicles: 'ninguna' },
        '20V:I': null,
        '30Q:I': 'ok',
      },
    });
    for (const service of Object.values(response.services)) expect(service).toEqual({ status: 'unavailable' });
    expect(Object.keys(response.services)).toHaveLength(5);
  });

  it('ignora claves que no son "<SERVICIO>:<I|R>"', () => {
    const ok = { status: 'ok', vehicles: [] };
    const response = parsed({ services: { '24F': ok, '24F:X': ok, '24f:R': ok, '../x:I': ok, 'ABCDEFGH:I': ok, 'B02R:R': ok } });
    expect(Object.keys(response.services)).toEqual(['B02R:R']);
  });

  it('descarta micros sin posición válida y limpia patente, rumbo y hora', () => {
    const base = { plate: 'PRUE10', bearing: 90, reportedAt: NOW - 10_000 };
    const vehicles = vehiclesOf(
      {
        fetchedAt: NOW,
        services: {
          '24F:R': {
            status: 'ok',
            fetchedAt: NOW,
            vehicles: [
              { ...base, lat: 0, lng: 0 },
              { ...base, lat: -33.45, lng: -70.66 },
              { ...base, lat: null, lng: -73.05 },
              { ...base, lat: Number.NaN, lng: -73.05 },
              'micro',
              { ...base, lat: '-36.82', lng: '-73.05', plate: 'ab-cd-12', bearing: '239' },
              { ...base, lat: -36.83, lng: -73.06, plate: '???', bearing: -1, reportedAt: '2026-11-24T15:55:22Z' },
              { ...base, lat: -36.84, lng: -73.07, plate: null, bearing: 360, reportedAt: Math.floor(NOW / 1000) - 30 },
              { ...base, lat: -36.85, lng: -73.08, plate: 'PRUE11', bearing: 400, reportedAt: '2026-11-24T15:55:22' },
              { ...base, lat: -36.86, lng: -73.09, plate: 'PRUE12', bearing: null, reportedAt: NOW + 10 * 60_000 },
              { ...base, lat: -36.87, lng: -73.1, plate: 'PRUE13', reportedAt: NOW + 30_000 },
            ],
          },
        },
      },
      '24F:R',
    );
    expect(vehicles.map((v) => [v.plate, v.lat, v.bearing, v.reportedAt])).toEqual([
      ['ABCD12', -36.82, 239, NOW - 10_000],
      [null, -36.83, null, Date.UTC(2026, 10, 24, 15, 55, 22)],
      [null, -36.84, 0, NOW - 30_000],
      // Sin zona horaria la hora es ambigua: desconocida.
      ['PRUE11', -36.85, null, null],
      // Más de 2 min en el futuro: reloj del GPS malo, hora desconocida.
      ['PRUE12', -36.86, null, null],
      ['PRUE13', -36.87, 90, NOW + 30_000],
    ]);
  });

  it('la misma patente dos veces en un servicio: queda la posición más reciente', () => {
    const vehicles = vehiclesOf(
      {
        services: {
          '24F:R': {
            status: 'ok',
            fetchedAt: NOW,
            vehicles: [
              { plate: 'PRUE10', lat: -36.82, lng: -73.05, bearing: 0, reportedAt: NOW - 60_000 },
              { plate: null, lat: -36.83, lng: -73.05, bearing: 0, reportedAt: NOW - 5_000 },
              { plate: 'prue10', lat: -36.821, lng: -73.051, bearing: 0, reportedAt: NOW - 10_000 },
              { plate: 'PRUE10', lat: -36.8, lng: -73.0, bearing: 0, reportedAt: null },
              { plate: null, lat: -36.84, lng: -73.05, bearing: 0, reportedAt: NOW - 5_000 },
            ],
          },
        },
      },
      '24F:R',
    );
    expect(vehicles.map((v) => [v.plate, v.lat])).toEqual([
      ['PRUE10', -36.821],
      [null, -36.83],
      [null, -36.84],
    ]);
  });

  it('sin fetchedAt usa `now`; cada servicio hereda el general si no trae el suyo', () => {
    const response = parsed({ services: { '24F:R': { status: 'ok', vehicles: [] } } }, NOW + 1);
    expect(response.fetchedAt).toBe(NOW + 1);
    expect(response.services['24F:R']).toMatchObject({ fetchedAt: NOW + 1 });
  });

  it('lo que no se entiende es una falla', () => {
    for (const raw of [null, '<html>', [], { fetchedAt: NOW }, { services: [] }, fixtures.unreadable]) {
      expect(parseRouteVehiclesResponse(raw, NOW).ok).toBe(false);
    }
  });
});

describe('readRouteVehiclesResult', () => {
  it('distingue sin configurar, tope, caída e ilegible', () => {
    expect(readRouteVehiclesResult(503, fixtures.unconfigured, NOW)).toEqual({ ok: false, failure: 'unconfigured' });
    expect(readRouteVehiclesResult(429, null, NOW)).toEqual({ ok: false, failure: 'rate_limited' });
    expect(readRouteVehiclesResult(502, { error: 'upstream' }, NOW)).toEqual({ ok: false, failure: 'unavailable' });
    expect(readRouteVehiclesResult(400, { error: 'bad_request' }, NOW)).toEqual({ ok: false, failure: 'unavailable' });
    expect(readRouteVehiclesResult(200, fixtures.unreadable, NOW)).toEqual({ ok: false, failure: 'unreadable' });
    expect(readRouteVehiclesResult(200, null, NOW)).toEqual({ ok: false, failure: 'unreadable' });
    const result = readRouteVehiclesResult(200, fixtures.ok, NOW);
    expect(result.ok && Object.keys(result.response.services)).toHaveLength(9);
  });
});

describe('gpsServicesFor', () => {
  const pairNames = (routes: Route[]) => gpsServicesFor(routes).pairs;

  it('un par por sentido con el nombre de la fuente (sentido 0 = I, 1 = R)', () => {
    expect(pairNames([byCode('24MF')])).toEqual(['24M:I', '24F:R']);
    expect(pairNames([byCode('23BS')])).toEqual(['23B:I', '23S:R']);
    expect(pairNames([byCode('401')])).toEqual(['401I:I', '401R:R']);
    expect(pairNames([byCode('201-AU')])).toEqual(['201AUI:I', '201AUR:R']);
    expect(pairNames([byCode('B02')])).toEqual(['B02I:I', 'B02R:R']);
    expect(pairNames([byCode('02C-Y')])).toEqual([
      `02CY:${byCode('02C-Y').directions![0].directionId === 0 ? 'I' : 'R'}`,
    ]);
    const selection = gpsServicesFor([byCode('24MF')]);
    expect(selection.routeByPair.get('24F:R')).toEqual({ routeId: 'gtfs-route-800', directionId: 1 });
  });

  it('lo visible al abrir (Biotrén e interurbanos): 11 pares, sin GPS Biotrén y 302/304', () => {
    const interurban = GTFS_ROUTES.filter((r) => r.network?.startsWith('Interurbano'));
    const selection = gpsServicesFor([...BIOTREN, ...interurban]);
    expect([...selection.pairs].sort()).toEqual(
      ['201AUI:I', '201AUR:R', '201I:I', '201R:R', '401I:I', '401R:R', '401Y:I', '411I:I', '411R:R', '421I:I', '421R:R'],
    );
    expect(selection.untracked.map((r) => r.code).sort()).toEqual(['302', '304', 'L1', 'L2']);
    expect(selection.omitted).toBe(0);
    expect(selection.omittedRoutes).toEqual([]);
  });

  it('de todo el GTFS solo la 302 y la 304 quedan sin nombre en la fuente', () => {
    expect(gpsServicesFor(GTFS_ROUTES).untracked.map((r) => r.code)).toEqual(['302', '304']);
  });

  it('primero la línea seleccionada; luego el orden recibido', () => {
    const routes = [byCode('401'), byCode('30QE'), byCode('24MF')];
    expect(gpsServicesFor(routes, { selectedRouteId: 'gtfs-route-800' }).pairs).toEqual([
      '24M:I',
      '24F:R',
      '401I:I',
      '401R:R',
      '30Q:I',
      '30E:R',
    ]);
    // Seleccionada fuera de las dadas: no se agrega.
    expect(gpsServicesFor(routes, { selectedRouteId: 'gtfs-route-835' }).pairs[0]).toBe('401I:I');
    // Repetida: cuenta una vez.
    expect(gpsServicesFor([byCode('401'), byCode('401')]).pairs).toEqual(['401I:I', '401R:R']);
  });

  it('tope: líneas completas en orden; pasado el tope ella y las siguientes se cuentan como omitidas', () => {
    const selection = gpsServicesFor([byCode('24MF'), byCode('30QE'), byCode('401Y')], { max: 3 });
    expect(selection.pairs).toEqual(['24M:I', '24F:R']);
    expect(selection.omitted).toBe(3);
    expect(selection.omittedRoutes.map((r) => r.code)).toEqual(['30QE', '401Y']);

    const all = gpsServicesFor(GTFS_ROUTES, { selectedRouteId: 'gtfs-route-540' });
    const total = GTFS_ROUTES.reduce((n, r) => n + gpsServicesFor([r]).pairs.length, 0);
    expect(all.pairs.length).toBeLessThanOrEqual(MAX_GPS_PAIRS);
    expect(all.pairs.length + all.omitted).toBe(total);
    expect(all.pairs.slice(0, 2)).toEqual(['401I:I', '401R:R']);
    // Ninguna línea queda con un solo sentido consultado.
    for (const { routeId } of all.routeByPair.values()) {
      const route = GTFS_ROUTES.find((r) => r.id === routeId)!;
      expect(gpsServicesFor([route]).pairs.every((p) => all.routeByPair.has(p))).toBe(true);
    }
    // Las omitidas son líneas completas, sin repetir ninguna consultada.
    expect(all.omittedRoutes.reduce((n, r) => n + gpsServicesFor([r]).pairs.length, 0)).toBe(all.omitted);
    const queried = new Set([...all.routeByPair.values()].map((v) => v.routeId));
    expect(all.omittedRoutes.some((r) => queried.has(r.id))).toBe(false);
    // Nunca más de lo que acepta la intermediaria.
    expect(gpsServicesFor(GTFS_ROUTES, { max: 99 }).pairs).toEqual(gpsServicesFor(GTFS_ROUTES).pairs);
  });
});

describe('pares para la URL', () => {
  it('mayúsculas, sin repetidos ni inválidos, tope por prioridad y luego ordenados', () => {
    expect(normalizeGpsPairs([' 401i:I', '24F:R', '24F:R', '24f:r', 'basura', '24F:X'])).toEqual(['24F:R', '401I:I']);
    const many = Array.from({ length: 20 }, (_, i) => `${String(90 - i).padStart(2, '0')}A:I`);
    const normalized = normalizeGpsPairs(many);
    expect(normalized).toHaveLength(MAX_GPS_PAIRS);
    expect(normalized).toContain('90A:I');
    expect(normalized).not.toContain('71A:I');
    expect(normalized).toEqual([...normalized].sort());
    expect(routeVehiclesUrl(['401I:I', '24f:R'])).toBe('/api/route-vehicles?services=24F:R,401I:I');
  });
});

describe('estado entre consultas', () => {
  const PAIRS = ['24F:R', '24M:I', '401I:I'];
  const first = () => applyRouteVehicles(INITIAL_ROUTE_VEHICLES_STATE, parsed(fixtures.responseFor(PAIRS)), PAIRS);

  it('guarda solo los pares pedidos; uno que no vino queda "unavailable"', () => {
    const state = applyRouteVehicles(INITIAL_ROUTE_VEHICLES_STATE, parsed(fixtures.ok), ['24F:R', '99Z:I']);
    expect(Object.keys(state.byService)).toEqual(['24F:R', '99Z:I']);
    expect(state.byService['99Z:I']).toEqual({ status: 'unavailable' });
    expect(state).toMatchObject({ fetchedAt: NOW, failures: 0, lastFailure: null });
  });

  it('un servicio que esta vez no se pudo leer conserva su dato bueno hasta 5 min', () => {
    const unavailable = (at: number) =>
      parsed({ fetchedAt: at, services: { '24F:R': { status: 'unavailable' }, '24M:I': { status: 'rate_limited' } } });
    let state = applyRouteVehicles(first(), unavailable(NOW + 60_000), PAIRS);
    expect(state.byService['24F:R']).toMatchObject({ status: 'ok', fetchedAt: NOW - 5_000 });
    expect(state.byService['24M:I']).toMatchObject({ status: 'ok' });
    // 401I:I no vino en esta respuesta y no tenía micros: igual conserva su "sin GPS".
    expect(state.byService['401I:I']).toMatchObject({ status: 'ok', vehicles: [] });
    state = applyRouteVehicles(state, unavailable(NOW + 6 * 60_000), PAIRS);
    expect(state.byService['24F:R']).toEqual({ status: 'unavailable' });
    expect(state.byService['24M:I']).toEqual({ status: 'rate_limited' });
  });

  it('un dato más viejo que el que se tiene (caché de otra instancia) no lo pisa', () => {
    const newer = applyRouteVehicles(
      INITIAL_ROUTE_VEHICLES_STATE,
      parsed({ fetchedAt: NOW, services: { '24F:R': { status: 'ok', fetchedAt: NOW, vehicles: [] } } }),
      ['24F:R'],
    );
    const state = applyRouteVehicles(newer, parsed(fixtures.ok), ['24F:R']);
    expect(state.byService['24F:R']).toEqual({ status: 'ok', fetchedAt: NOW, vehicles: [] });
  });

  it('una consulta fallida deja solo lo bueno de menos de 5 min y cuenta la falla', () => {
    let state: RouteVehiclesState = applyRouteVehicles(
      INITIAL_ROUTE_VEHICLES_STATE,
      parsed(fixtures.ok),
      Object.keys(fixtures.services),
    );
    state = applyRouteVehiclesFailure(state, 'unavailable', NOW + 60_000);
    expect(state).toMatchObject({ failures: 1, lastFailure: 'unavailable', fetchedAt: NOW });
    expect(Object.keys(state.byService).sort()).toEqual(['201AUI:I', '24F:R', '24M:I', '401I:I', '401R:R', '411I:I', '411R:R']);
    state = applyRouteVehiclesFailure(state, 'rate_limited', NOW + GPS_MAX_AGE_MS);
    expect(state.failures).toBe(2);
    expect(state.byService).toEqual({});
    state = applyRouteVehicles(state, parsed(fixtures.responseFor(PAIRS), NOW), PAIRS);
    expect(state).toMatchObject({ failures: 0, lastFailure: null });
  });

  it('al cambiar las líneas se conserva lo de los pares que siguen', () => {
    const state = retainGpsPairs(first(), ['24F:R', '30Q:I']);
    expect(Object.keys(state.byService)).toEqual(['24F:R']);
    expect(state.fetchedAt).toBe(NOW);
  });
});

describe('edad y mapa', () => {
  it('edad desde la hora del GPS; null si no se sabe', () => {
    expect(vehicleAge({ reportedAt: NOW - 30_000 }, NOW)).toBe(30_000);
    expect(vehicleAge({ reportedAt: NOW + 5_000 }, NOW)).toBe(0);
    expect(vehicleAge({ reportedAt: null }, NOW)).toBeNull();
    expect(GPS_STALE_AFTER_MS).toBe(2 * 60_000);
    expect(GPS_MAX_AGE_MS).toBe(5 * 60_000);
  });

  it('se dibujan las vigentes, la de 4 min como vieja y la de 7 min no', () => {
    const { byService } = applyRouteVehicles(INITIAL_ROUTE_VEHICLES_STATE, parsed(fixtures.ok), Object.keys(fixtures.services));
    const drawn = gpsVehiclesForMap(byService, NOW);
    expect(drawn.map((v) => [v.id, v.stale])).toEqual([
      ['24F:R#PRUE51', false],
      ['24F:R#PRUE52', false],
      ['24F:R#PRUE53', true],
      ['24M:I#PRUE55', false],
      ['24M:I#PRUE56', false],
      ['201AUI:I#PRUE57', false],
    ]);
    expect(drawn[2].ageMs).toBe(4 * 60_000);
    // A los 2 min más, la de 4 min ya pasó los 5 y las demás se ven viejas.
    expect(gpsVehiclesForMap(byService, NOW + 2 * 60_000).map((v) => [v.plate, v.stale])).toEqual([
      ['PRUE51', true],
      ['PRUE52', true],
      ['PRUE55', true],
      ['PRUE56', true],
      ['PRUE57', true],
    ]);
    expect(gpsVehiclesForMap(byService, NOW + 6 * 60_000)).toEqual([]);
  });

  it('sin hora del GPS la edad es la de la consulta; sin patente la clave es la posición en la lista', () => {
    const { byService } = applyRouteVehicles(
      INITIAL_ROUTE_VEHICLES_STATE,
      parsed({
        services: {
          '24F:R': { status: 'ok', fetchedAt: NOW - 3 * 60_000, vehicles: [{ plate: null, lat: -36.82, lng: -73.05, bearing: null, reportedAt: null }] },
        },
      }),
      ['24F:R'],
    );
    expect(gpsVehiclesForMap(byService, NOW)).toMatchObject([{ id: '24F:R#0', ageMs: 3 * 60_000, stale: true }]);
    expect(gpsVehiclesForMap(byService, NOW + 3 * 60_000)).toEqual([]);
  });

  it('estado por línea: con GPS, "sin GPS ahora", esperando o sin poder consultar', () => {
    const routes = [byCode('24MF'), byCode('401'), byCode('411'), byCode('421'), byCode('201-AU')];
    const { pairs, routeByPair } = gpsServicesFor(routes);
    const status = (state: RouteVehiclesState, now = NOW) =>
      Object.fromEntries([...gpsStatusByRoute(routeByPair, state, now)].map(([id, s]) => [routes.find((r) => r.id === id)!.code, s]));

    expect(status(INITIAL_ROUTE_VEHICLES_STATE)).toEqual({
      '24MF': { status: 'pending', vehicles: 0 },
      '401': { status: 'pending', vehicles: 0 },
      '411': { status: 'pending', vehicles: 0 },
      '421': { status: 'pending', vehicles: 0 },
      '201-AU': { status: 'pending', vehicles: 0 },
    });

    const state = applyRouteVehicles(INITIAL_ROUTE_VEHICLES_STATE, parsed(fixtures.responseFor(pairs)), pairs);
    expect(status(state)).toEqual({
      '24MF': { status: 'live', vehicles: 5 },
      // La fuente respondió sin micros en ambos sentidos.
      '401': { status: 'no-gps', vehicles: 0 },
      // Solo una posición vencida: tampoco hay GPS ahora.
      '411': { status: 'no-gps', vehicles: 0 },
      '421': { status: 'unavailable', vehicles: 0 },
      '201-AU': { status: 'live', vehicles: 1 },
    });
    // Pasados 6 min sin consulta nueva (pestaña oculta) no se sabe: se espera, no "sin GPS".
    expect(status(state, NOW + 6 * 60_000)).toMatchObject({
      '24MF': { status: 'pending', vehicles: 0 },
      '401': { status: 'pending', vehicles: 0 },
    });

    // Sin respuesta aún y la consulta falló: no se puede decir que no hay GPS.
    expect(status(applyRouteVehiclesFailure(INITIAL_ROUTE_VEHICLES_STATE, 'unavailable', NOW))['401']).toEqual({
      status: 'unavailable',
      vehicles: 0,
    });
  });

  it('una patente listada en los dos sentidos cuenta una vez, como en el mapa', () => {
    const route = byCode('30QE');
    const { pairs, routeByPair } = gpsServicesFor([route]);
    const micro = (plate: string) => ({ plate, lat: -36.8, lng: -73.05, bearing: null, reportedAt: NOW - 20_000 });
    const response = parsed({
      fetchedAt: NOW,
      services: {
        '30Q:I': { status: 'ok', fetchedAt: NOW, vehicles: [micro('PRUE77'), micro('PRUE78')] },
        '30E:R': { status: 'ok', fetchedAt: NOW, vehicles: [micro('PRUE77')] },
      },
    });
    const state = applyRouteVehicles(INITIAL_ROUTE_VEHICLES_STATE, response, pairs);
    expect(gpsStatusByRoute(routeByPair, state, NOW).get(route.id)).toEqual({ status: 'live', vehicles: 2 });
  });
});

describe('reloj del equipo corrido', () => {
  it('mide el desfase al recibir y envejece en la hora del servidor solo pasado 1 min', () => {
    const { pairs } = gpsServicesFor([byCode('24MF')]);
    const response = parsed(fixtures.responseFor(pairs));
    // Equipo 6 min adelantado: sin corregir, todo vencería.
    const ahead = applyRouteVehicles(INITIAL_ROUTE_VEHICLES_STATE, response, pairs, NOW + 6 * 60_000);
    expect(ahead.clockOffsetMs).toBe(6 * 60_000);
    expect(sourceClock(ahead, NOW + 6 * 60_000)).toBe(NOW);
    expect(gpsVehiclesForMap(ahead.byService, sourceClock(ahead, NOW + 6 * 60_000))).toHaveLength(5);
    // Unos segundos (caché de la CDN): se usa la hora del equipo.
    const cached = applyRouteVehicles(INITIAL_ROUTE_VEHICLES_STATE, response, pairs, NOW + 15_000);
    expect(sourceClock(cached, NOW + 20_000)).toBe(NOW + 20_000);
    // Una falla posterior no borra lo vigente por el reloj del equipo.
    const failed = applyRouteVehiclesFailure(ahead, 'unavailable', NOW + 6 * 60_000 + 30_000);
    expect(Object.keys(failed.byService)).toEqual(Object.keys(ahead.byService));
    expect(failed.clockOffsetMs).toBe(6 * 60_000);
  });
});

// ── Store del hook (src/hooks/use-route-vehicles.ts) ────────────────────────
// Sin DOM: document y window mínimos, fetch falso y relojes de vitest.

describe('sondeo de useRouteVehicles', () => {
  const KEY = '24F:R,24M:I';
  let hidden = false;
  let visibilityListeners: Array<() => void> = [];
  let responses: Array<{ status: number; body: unknown }> = [];
  const fetchMock = vi.fn(async (url: string, init?: { signal?: AbortSignal }) => {
    void url;
    if (init?.signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const next = responses.shift() ?? { status: 200, body: fixtures.responseFor(KEY.split(',')) };
    return { status: next.status, ok: next.status < 300, json: async () => next.body } as unknown as Response;
  });

  const setHidden = (value: boolean) => {
    hidden = value;
    for (const listener of visibilityListeners) listener();
  };
  const flush = () => vi.advanceTimersByTimeAsync(0);

  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
    hidden = false;
    visibilityListeners = [];
    responses = [];
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {
      setTimeout: (fn: () => void, ms?: number) => setTimeout(fn, ms),
      clearTimeout: (id: number) => clearTimeout(id),
    });
    vi.stubGlobal('document', {
      get hidden() {
        return hidden;
      },
      addEventListener: (_: string, fn: () => void) => visibilityListeners.push(fn),
      removeEventListener: (_: string, fn: () => void) => {
        visibilityListeners = visibilityListeners.filter((l) => l !== fn);
      },
    });
  });

  afterEach(async () => {
    // Si una prueba falló a medias, el store sigue prendido: se apaga para la siguiente.
    const key = getRouteVehiclesSnapshot().key;
    if (key) watchRouteVehicles(key)();
    await vi.runOnlyPendingTimersAsync();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('consulta al prender, cada 30 s, y deja de consultar al apagar', async () => {
    const stop = watchRouteVehicles(KEY);
    expect(getRouteVehiclesSnapshot()).toMatchObject({ key: KEY, view: { loading: true } });
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/route-vehicles?services=24F:R,24M:I');
    const view = getRouteVehiclesSnapshot().view;
    expect(view.loading).toBe(false);
    expect(Object.keys(view.state.byService)).toEqual(['24F:R', '24M:I']);

    await vi.advanceTimersByTimeAsync(29_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    stop();
    await flush();
    expect(getRouteVehiclesSnapshot().key).toBeNull();
    expect(visibilityListeners).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('tras fallas espera más (60 s, luego 5 min) y conserva lo bueno', async () => {
    const stop = watchRouteVehicles(KEY);
    await flush();
    responses = [
      { status: 502, body: { error: 'upstream' } },
      { status: 502, body: { error: 'upstream' } },
      { status: 502, body: { error: 'upstream' } },
    ];
    await vi.advanceTimersByTimeAsync(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const state = getRouteVehiclesSnapshot().view.state;
    expect(state).toMatchObject({ failures: 1, lastFailure: 'unavailable' });
    expect(Object.keys(state.byService)).toEqual(['24F:R', '24M:I']);

    await vi.advanceTimersByTimeAsync(59_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(getRouteVehiclesSnapshot().view.state.failures).toBe(3);
    // El dato bueno tiene 2,5 min: sigue.
    expect(Object.keys(getRouteVehiclesSnapshot().view.state.byService)).toEqual(['24F:R', '24M:I']);

    await vi.advanceTimersByTimeAsync(4 * 60_000 + 59_000);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(getRouteVehiclesSnapshot().view.state).toMatchObject({ failures: 0, lastFailure: null });
    stop();
  });

  it('sin configurar: lo dice y no insiste más que con el ritmo de fallas', async () => {
    responses = [{ status: 503, body: fixtures.unconfigured }];
    const stop = watchRouteVehicles(KEY);
    await flush();
    expect(getRouteVehiclesSnapshot().view.state).toMatchObject({ failures: 1, lastFailure: 'unconfigured' });
    await vi.advanceTimersByTimeAsync(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    stop();
  });

  it('con la pestaña oculta no consulta; al volver consulta en el acto', async () => {
    const stop = watchRouteVehicles(KEY);
    await flush();
    setHidden(true);
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    setHidden(false);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    stop();
  });

  it('cambiar de líneas conserva lo que sigue, espera medio segundo y no duplica con StrictMode', async () => {
    let stop = watchRouteVehicles(KEY);
    // Doble efecto de StrictMode: limpiar y volver a montar con lo mismo no consulta de nuevo.
    stop();
    stop = watchRouteVehicles(KEY);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Cambio de líneas: el efecto viejo se limpia y el nuevo arranca en el mismo commit.
    stop();
    stop = watchRouteVehicles('24F:R,401I:I');
    expect(getRouteVehiclesSnapshot().view).toMatchObject({ loading: true });
    expect(Object.keys(getRouteVehiclesSnapshot().view.state.byService)).toEqual(['24F:R']);
    await vi.advanceTimersByTimeAsync(499);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/route-vehicles?services=24F:R,401I:I');
    stop();
    await flush();
    expect(getRouteVehiclesSnapshot().key).toBeNull();
  });
});
