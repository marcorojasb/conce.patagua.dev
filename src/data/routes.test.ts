import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as routes from '@/data/routes';
import { GTFS_BUS_ROUTES } from '@/data/gtfs-bus-routes.generated';
import { isRouteOperatingAt } from '@/lib/operating-hours';

// Los recorridos GTFS llegan con el chunk diferido que routes.ts pide al cargar.
beforeAll(async () => {
  await vi.waitFor(() => expect(routes.microRoutesReady).toBe(true), { timeout: 10_000 });
});

describe('findRoute', () => {
  it('resolves ids, official codes and codes written another way', () => {
    expect(routes.findRoute('gtfs-route-835')?.route.code).toBe('10AN');
    expect(routes.findRoute('10AN')).toEqual({ route: routes.ROUTES_BY_ID.get('gtfs-route-835') });
    expect(routes.findRoute('201 AU')?.route.code).toBe('201-AU');
    expect(routes.findRoute('L1')?.route.id).toBe('bt-l1');
  });

  it('resolves the variant shown on the bus to its route and direction', () => {
    expect(routes.findRoute('10A')).toMatchObject({ route: { code: '10AN' }, directionId: 0 });
    expect(routes.findRoute('10N')).toMatchObject({ route: { code: '10AN' }, directionId: 1 });
    expect(routes.findRoute('62H')).toMatchObject({ route: { code: '62HM' } });
    // Un código propio gana a la variante de otro recorrido (80J-Y también muestra "80J").
    expect(routes.findRoute('80J')).toEqual({ route: routes.ROUTES.find((r) => r.code === '80J') });
  });

  it('maps the ids of the old hand-digitized interurbans to the official routes', () => {
    expect(routes.findRoute('interurban-201')?.route.code).toBe('201');
    expect(routes.findRoute('interurban-421')?.route.code).toBe('421');
    expect(routes.findRoute('no-existe')).toBeNull();
  });
});

describe('GTFS routes with both directions', () => {
  it('lists a route at stops served only by its return direction', () => {
    const source = GTFS_BUS_ROUTES.find((r) => r.ref === '02AD')!;
    const [outbound, inbound] = source.directions!;
    const returnOnly = inbound.stopIds.filter((id) => !outbound.stopIds.includes(id));
    expect(returnOnly.length).toBeGreaterThan(0);
    for (const stopId of returnOnly) {
      expect(routes.STOPS.find((s) => s.id === stopId)?.routes, stopId).toContain(source.id);
    }
  });

  it('keeps each direction with its own path, stops, variant and destination', () => {
    const route = routes.ROUTES_BY_ID.get('gtfs-route-835')!;
    expect(route.directions?.map((d) => [d.directionId, d.variant, d.destination])).toEqual([
      [0, '10A', 'Centinela'],
      [1, '10N', 'Los Bloques'],
    ]);
    for (const direction of route.directions!) {
      expect(direction.stops.length).toBeGreaterThan(50);
      expect(direction.path.length).toBeGreaterThan(50);
    }
    expect(route.path.length).toBe(route.directions!.reduce((n, d) => n + d.path.length, 0));
    expect(new Set(route.stops.map((s) => s.id)).size).toBe(route.stops.length);
  });

  it('shows Biotrén and the official interurbans by default, not the urban network', () => {
    const defaults = routes.DEFAULT_VISIBLE_ROUTE_IDS.map((id) => routes.ROUTES_BY_ID.get(id)?.code).sort();
    expect(defaults).toEqual(['201', '201-AU', '302', '304', '401', '401Y', '411', '421', 'L1', 'L2']);
  });
});

describe('operating hours from the official schedules', () => {
  // 2026-11-23 es lunes; Chile en CLST (-03).
  const at = (day: string, time: string) => new Date(`2026-11-${day}T${time}:00-03:00`);

  it('follows each GTFS route schedule by day of week', () => {
    const route11C = routes.ROUTES.find((r) => r.code === '11C')!; // solo 17:00–19:49 lun–vie
    expect(isRouteOperatingAt(route11C, at('23', '08:30'))).toBe(false);
    expect(isRouteOperatingAt(route11C, at('23', '18:00'))).toBe(true);
    expect(isRouteOperatingAt(route11C, at('28', '18:00'))).toBe(false);
  });

  it('follows the operator list for the 201 on weekdays, not the GTFS program', () => {
    const route201 = routes.ROUTES_BY_ID.get('gtfs-route-949')!;
    // Lista de kupos: 06:15 a 23:05 + 1 h 57 min = 01:02. El programa iba de 05:38 a 02:33.
    expect(isRouteOperatingAt(route201, at('25', '06:00'))).toBe(false);
    expect(isRouteOperatingAt(route201, at('25', '06:15'))).toBe(true);
    expect(isRouteOperatingAt(route201, at('26', '01:00'))).toBe(true);
    expect(isRouteOperatingAt(route201, at('26', '02:00'))).toBe(false);
    // Sábado sin lista: sigue el programa (desde las 05:53).
    expect(isRouteOperatingAt(route201, at('28', '06:00'))).toBe(true);
  });

  it('follows the EFE itineraries for Biotrén, including the L1 midday gap', () => {
    const l1 = routes.ROUTES_BY_ID.get('bt-l1')!;
    expect(isRouteOperatingAt(l1, at('23', '08:30'))).toBe(true);
    expect(isRouteOperatingAt(l1, at('23', '14:30'))).toBe(false);
    expect(isRouteOperatingAt(l1, at('23', '23:30'))).toBe(false);
  });
});
