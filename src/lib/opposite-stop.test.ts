import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as routesModule from '@/data/routes';
import { findOppositeStop } from '@/lib/opposite-stop';
import type { Route, RouteDirection, Stop } from '@/types/transport';

function stop(id: string, lat: number, lng: number): Stop {
  return { id, name: id, lat, lng };
}

function route(id: string, there: Stop[], back: Stop[]): Route {
  const direction = (directionId: 0 | 1, stops: Stop[], destination: string): RouteDirection => ({
    directionId,
    headsign: destination,
    destination,
    path: [],
    stops,
  });
  return {
    id,
    code: id,
    directions: [direction(0, there, 'Norte'), direction(1, back, 'Sur')],
    stops: [...there, ...back],
  } as unknown as Route;
}

// ~0,00018° de latitud son 20 m.
const A = stop('a', -36.8, -73.05);
const A_FRONT = stop('a-front', -36.80018, -73.05);
const A_FAR = stop('a-far', -36.8009, -73.05); // ~100 m
const B = stop('b', -36.81, -73.05);

describe('findOppositeStop', () => {
  it('el del sentido contrario a ≤ 60 m, con el destino de ese sentido', () => {
    const r = route('r1', [A, B], [A_FAR, A_FRONT]);
    const found = findOppositeStop('a', [r]);
    expect(found?.stop.id).toBe('a-front');
    expect(found?.distanceM).toBeGreaterThan(15);
    expect(found?.distanceM).toBeLessThan(25);
    expect(found?.lines.map((l) => [l.route.id, l.destination])).toEqual([['r1', 'Sur']]);
  });

  it('nada si el otro sentido para lejos, o si la línea para aquí en los dos sentidos', () => {
    expect(findOppositeStop('a', [route('r1', [A, B], [A_FAR])])).toBeNull();
    expect(findOppositeStop('a', [route('r1', [A, B], [B, A, A_FRONT])])).toBeNull();
    expect(findOppositeStop('a', [route('r1', [B], [A_FRONT])])).toBeNull();
  });

  it('entre varios, el que comparten más líneas', () => {
    const A_SIDE = stop('a-side', -36.8, -73.0503); // ~27 m al oeste
    const found = findOppositeStop('a', [
      route('r1', [A], [A_FRONT]),
      route('r2', [A], [A_SIDE]),
      route('r3', [A], [A_SIDE]),
    ]);
    expect(found?.stop.id).toBe('a-side');
    expect(found?.lines.map((l) => l.route.id)).toEqual(['r2', 'r3']);
  });
});

describe('findOppositeStop con el GTFS oficial', () => {
  beforeAll(async () => {
    await vi.waitFor(() => expect(routesModule.microRoutesReady).toBe(true), { timeout: 10_000 });
  });

  it('20318 (Camino El Patagual, hacia Concepción) tiene enfrente al 20317, hacia Santa Juana', () => {
    const here = routesModule.STOPS.find((s) => s.id === 'gtfs-stop-20318');
    expect(here).toBeDefined();
    const routes = here!.routes.map((id) => routesModule.ROUTES_BY_ID.get(id)!).filter(Boolean);
    const found = findOppositeStop('gtfs-stop-20318', routes);
    expect(found?.stop.id).toBe('gtfs-stop-20317');
    expect(found?.distanceM).toBeLessThan(30);
    expect(found?.lines.map((l) => l.route.code).sort()).toEqual(['201', '201-AU']);
    expect(found?.lines.every((l) => /santa juana/i.test(l.destination ?? ''))).toBe(true);
    // Y de vuelta.
    expect(findOppositeStop('gtfs-stop-20317', routes)?.stop.id).toBe('gtfs-stop-20318');
  });
});
