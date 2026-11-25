import { describe, expect, it } from 'vitest';
import { GTFS_BUS_ROUTES } from '@/data/gtfs-bus-routes.generated';
import {
  compactGpsNotice,
  gpsHeadline,
  gpsViewKey,
  queriedLines,
  selectedLineNotice,
  summarizeGpsLines,
} from '@/realtime/gps-mode-summary';
import {
  INITIAL_ROUTE_VEHICLES_STATE,
  MAX_GPS_PAIRS,
  applyRouteVehicles,
  applyRouteVehiclesFailure,
  gpsServicesFor,
  gpsStatusByRoute,
  parseRouteVehiclesResponse,
  type RouteVehiclesState,
} from '@/realtime/route-vehicles';
import { routeVehiclesFixtures } from '@/realtime/route-vehicles.fixtures';
import type { Route } from '@/types/transport';
import type { GpsLineStatus, GpsModeView } from '@/types/ui-contracts';

const NOW = Date.UTC(2026, 10, 24, 15, 56, 0);

const ROUTES: Route[] = GTFS_BUS_ROUTES.map(
  (r) =>
    ({
      id: r.id,
      code: r.ref,
      color: r.colour ?? '#334155',
      network: r.network,
      directions: r.directions ?? [],
    }) as unknown as Route,
);
const BIOTREN = ['L1', 'L2'].map(
  (code) => ({ id: `bt-${code.toLowerCase()}`, code, color: '#e30613', type: 'biotren' }) as unknown as Route,
);
const ALL = [...BIOTREN, ...ROUTES];
const BY_ID = new Map(ALL.map((r) => [r.id, r]));
const byCode = (code: string): Route => {
  const route = ALL.find((r) => r.code === code);
  if (!route) throw new Error(`sin ${code}`);
  return route;
};

function summary(routes: Route[], state: RouteVehiclesState, now = NOW) {
  const selection = gpsServicesFor(routes);
  return summarizeGpsLines(selection, BY_ID, gpsStatusByRoute(selection.routeByPair, state, now));
}

function stateFor(routes: Route[]): RouteVehiclesState {
  const { pairs } = gpsServicesFor(routes);
  const parsed = parseRouteVehiclesResponse(routeVehiclesFixtures(NOW).responseFor(pairs), NOW);
  if (!parsed.ok) throw new Error(parsed.error);
  return applyRouteVehicles(INITIAL_ROUTE_VEHICLES_STATE, parsed, pairs);
}

const statuses = (rows: ReturnType<typeof summary>) => Object.fromEntries(rows.map((r) => [r.code, r.status]));

describe('summarizeGpsLines', () => {
  it('una fila por línea: con GPS, sin GPS ahora, sin poder consultar y no seguida por la fuente', () => {
    const routes = [byCode('24MF'), byCode('401'), byCode('411'), byCode('421'), byCode('L1'), byCode('302')];
    const rows = summary(routes, stateFor(routes));
    expect(rows.map((r) => r.code)).toEqual(['24MF', '401', '411', '421', 'L1', '302']);
    expect(statuses(rows)).toEqual({
      '24MF': 'live',
      // Responde sin micros por los dos sentidos.
      '401': 'no-gps',
      // Su única posición tiene 7 min: no cuenta.
      '411': 'no-gps',
      // 421I:I no se pudo consultar y 421R:R topó el límite de la intermediaria.
      '421': 'unavailable',
      L1: 'untracked',
      '302': 'untracked',
    });
    expect(rows.find((r) => r.code === '24MF')).toMatchObject({ vehicles: 5, color: byCode('24MF').color });
    expect(rows.filter((r) => r.code !== '24MF').every((r) => r.vehicles === 0)).toBe(true);
    expect(queriedLines(rows).map((r) => r.code)).toEqual(['24MF', '401', '411', '421']);
  });

  it('antes de la primera respuesta las consultadas están "pending"; si la consulta falla, "unavailable"', () => {
    const routes = [byCode('24MF'), byCode('L1')];
    expect(statuses(summary(routes, INITIAL_ROUTE_VEHICLES_STATE))).toEqual({ '24MF': 'pending', L1: 'untracked' });
    const failed = applyRouteVehiclesFailure(INITIAL_ROUTE_VEHICLES_STATE, 'unavailable', NOW);
    expect(statuses(summary(routes, failed))).toEqual({ '24MF': 'unavailable', L1: 'untracked' });
  });

  it('con 20 líneas: las que no caben en 16 sentidos quedan "omitted", al final y en orden', () => {
    const urban = ROUTES.filter((r) => /^\d{2}[A-Z]{2}$/.test(r.code)).slice(0, 20);
    expect(urban).toHaveLength(20);
    const selection = gpsServicesFor(urban);
    expect(selection.pairs.length).toBeLessThanOrEqual(MAX_GPS_PAIRS);
    const rows = summary(urban, INITIAL_ROUTE_VEHICLES_STATE);
    const omitted = rows.filter((r) => r.status === 'omitted');
    expect(rows).toHaveLength(20);
    expect(queriedLines(rows)).toHaveLength(MAX_GPS_PAIRS / 2);
    expect(omitted.map((r) => r.code)).toEqual(urban.slice(MAX_GPS_PAIRS / 2).map((r) => r.code));
    expect(rows.slice(-omitted.length)).toEqual(omitted);
  });

  it('la línea seleccionada va primero', () => {
    const routes = [byCode('401'), byCode('24MF')];
    const selection = gpsServicesFor(routes, { selectedRouteId: byCode('24MF').id });
    const rows = summarizeGpsLines(selection, BY_ID, new Map());
    expect(rows.map((r) => [r.code, r.status])).toEqual([
      ['24MF', 'pending'],
      ['401', 'pending'],
    ]);
  });
});

describe('gpsViewKey', () => {
  const base: GpsModeView = {
    active: true,
    loading: false,
    failure: null,
    fetchedAt: NOW,
    lines: [{ routeId: 'r', code: '24MF', color: '#000', status: 'live', vehicles: 2 }],
    vehicles: 2,
    stale: 0,
  };

  it('cambia con lo que se muestra y no con objetos nuevos de igual contenido', () => {
    expect(gpsViewKey({ ...base, lines: [...base.lines.map((l) => ({ ...l }))] })).toBe(gpsViewKey(base));
    for (const changed of [
      { ...base, loading: true },
      { ...base, failure: 'unavailable' as const },
      { ...base, fetchedAt: NOW + 30_000 },
      { ...base, stale: 1 },
      { ...base, lines: [{ ...base.lines[0], status: 'no-gps' as const, vehicles: 0 }] },
    ]) {
      expect(gpsViewKey(changed)).not.toBe(gpsViewKey(base));
    }
  });
});

describe('gpsHeadline y compactGpsNotice', () => {
  const line = (code: string, status: GpsLineStatus['status'], vehicles = 0): GpsLineStatus => ({
    routeId: `id-${code}`,
    code,
    color: '#000',
    status,
    vehicles,
  });
  const view = (lines: GpsLineStatus[], vehicles = 0, failure: GpsModeView['failure'] = null) => ({ lines, vehicles, failure });
  const label = (l: GpsLineStatus) => l.code;

  it('el servidor sin GPS va antes que todo', () => {
    expect(gpsHeadline(view([line('401', 'pending')], 0, 'unconfigured')).state).toBe('unconfigured');
    expect(compactGpsNotice(view([], 0, 'unconfigured'), null, label)).toMatch(/no está activado/);
  });

  it('solo líneas que la fuente no sigue no es "sin líneas"', () => {
    const lines = [line('L1', 'untracked'), line('302', 'untracked')];
    expect(gpsHeadline(view(lines))).toMatchObject({ state: 'untracked-only', untracked: lines });
    expect(gpsHeadline(view([])).state).toBe('no-lines');
    expect(compactGpsNotice(view(lines), null, label)).toBe('Tus líneas no tienen GPS en la fuente');
  });

  it('las líneas fuera del tope acompañan a todos los estados', () => {
    const lines = [line('10AN', 'no-gps'), line('20VA', 'no-gps'), line('30QE', 'omitted'), line('40X', 'omitted')];
    expect(gpsHeadline(view(lines))).toMatchObject({ state: 'empty', queried: 2, omitted: 2, failing: 0 });
    expect(gpsHeadline(view([line('10AN', 'live', 3), line('30QE', 'omitted')], 3))).toMatchObject({
      state: 'live',
      liveLines: 1,
      omitted: 1,
    });
    expect(gpsHeadline(view([line('10AN', 'pending'), line('30QE', 'omitted')]))).toMatchObject({ state: 'loading', omitted: 1 });
    expect(compactGpsNotice(view([line('10AN', 'live', 3), line('30QE', 'omitted')], 3), null, label)).toBe(
      '1 línea sin consultar (tope de 16 sentidos)',
    );
  });

  it('todas sin poder consultar es una falla; mezcla de vacías y fallidas, "ninguna transmite"', () => {
    expect(gpsHeadline(view([line('421', 'unavailable')])).state).toBe('failed');
    expect(gpsHeadline(view([line('401', 'no-gps'), line('421', 'unavailable')]))).toMatchObject({ state: 'empty', failing: 1 });
  });

  it('compacto: la línea abierta sin GPS se nombra; con GPS funcionando no dice nada', () => {
    const lines = [line('401', 'no-gps'), line('24MF', 'live', 5), line('421', 'unavailable')];
    expect(compactGpsNotice(view(lines, 5), 'id-401', label)).toBe('401: sin GPS ahora');
    expect(compactGpsNotice(view(lines, 5), 'id-421', label)).toBe('421: no se pudo consultar');
    expect(compactGpsNotice(view(lines, 5), 'id-24MF', label)).toBeNull();
    expect(compactGpsNotice(view(lines, 5), null, label)).toBeNull();
    expect(selectedLineNotice([line('L1', 'untracked')], 'id-L1', label)).toBe('L1: sin GPS (la fuente no la sigue)');
    expect(selectedLineNotice(lines, 'id-24MF', label)).toBeNull();
  });
});
