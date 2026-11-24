import { describe, expect, it } from 'vitest';
import { buildSimulationRoutes, computeActiveVehicles } from '@/realtime/simulated-vehicles';
import type { LatLngTuple, Route, RouteSchedule } from '@/types/transport';

const emptyDay: RouteSchedule[number] = [];
const line: LatLngTuple[] = [
  [-36.82, -73.05],
  [-36.82, -73.04],
];

describe('simulated vehicles', () => {
  it('projects active trips for routes that arrive after initial app load', () => {
    const routes = [
      {
        id: 'gtfs-route-test',
        color: '#0ea5e9',
        path: [
          [-36.82, -73.05],
          [-36.82, -73.04],
        ] as Array<[number, number]>,
      },
    ];
    const schedules: Record<string, RouteSchedule> = {
      'gtfs-route-test': [[[8 * 60, 60]], emptyDay, emptyDay, emptyDay, emptyDay, emptyDay, emptyDay],
    };

    const vehicles = computeActiveVehicles(new Date('2026-05-18T08:30:00-04:00'), routes, schedules);

    expect(vehicles).toHaveLength(1);
    expect(vehicles[0]).toMatchObject({
      routeId: 'gtfs-route-test',
      scheduleId: 'gtfs-route-test',
      progress: 0.5,
      sourceKind: 'gtfs',
    });
  });

  it('supports directional static-pattern schedules over reversed paths', () => {
    const routes = [
      {
        id: 'bt-l2-concepcion-coronel-weekday',
        routeId: 'bt-l2',
        color: '#0284c7',
        directionLabel: 'Concepción → Coronel',
        sourceKind: 'official' as const,
        confidence: 'official' as const,
        path: [
          [-36.82, -73.06],
          [-36.72, -72.98],
        ] as Array<[number, number]>,
      },
      {
        id: 'bt-l2-coronel-concepcion-weekday',
        routeId: 'bt-l2',
        color: '#0284c7',
        directionLabel: 'Coronel → Concepción',
        sourceKind: 'official' as const,
        confidence: 'official' as const,
        path: [
          [-36.72, -72.98],
          [-36.82, -73.06],
        ] as Array<[number, number]>,
      },
    ];
    const schedules: Record<string, RouteSchedule> = {
      'bt-l2-concepcion-coronel-weekday': [
        [[18 * 60, 60]],
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
      ],
      'bt-l2-coronel-concepcion-weekday': [
        [[6 * 60, 60]],
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
        emptyDay,
      ],
    };

    const vehicles = computeActiveVehicles(new Date('2026-05-18T18:30:00-04:00'), routes, schedules);

    expect(vehicles).toHaveLength(1);
    expect(vehicles[0]).toMatchObject({
      scheduleId: 'bt-l2-concepcion-coronel-weekday',
      routeId: 'bt-l2',
      directionLabel: 'Concepción → Coronel',
      sourceKind: 'official',
      progress: 0.5,
    });
  });

  it('keeps last night trips running after midnight from the previous service day', () => {
    const routes = [{ id: 'gtfs-route-test#0', routeId: 'gtfs-route-test', color: '#0ea5e9', path: line }];
    // Domingo: una salida 23:30 (60 min) y otra escrita 24:40 como en GTFS.
    const schedules: Record<string, RouteSchedule> = {
      'gtfs-route-test#0': [[[5 * 60, 30]], emptyDay, emptyDay, emptyDay, emptyDay, emptyDay, [[1410, 60], [1480, 20]]],
    };

    // Lunes 00:15 Chile: el viaje del domingo 23:30 va en la mitad; el de lunes 05:00 no partió.
    const at0015 = computeActiveVehicles(new Date('2026-05-18T00:15:00-04:00'), routes, schedules);
    expect(at0015.map((v) => [v.startMin, v.progress])).toEqual([[1410, 0.75]]);

    // Lunes 00:50: la salida "24:40" del domingo está en curso.
    const at0050 = computeActiveVehicles(new Date('2026-05-18T00:50:00-04:00'), routes, schedules);
    expect(at0050.map((v) => [v.id, v.progress])).toEqual([['gtfs-route-test#0|1480', 0.5]]);
  });
});

describe('buildSimulationRoutes', () => {
  const stop = { id: 's', name: 'S', lat: -36.82, lng: -73.05 };
  const route: Route = {
    id: 'gtfs-route-835',
    code: '10AN',
    name: 'Vía Láctea 10N - Los Bloques - Vía Láctea 10A - Centinela',
    type: 'micro',
    color: '#0ea5e9',
    operator: 'Vía Láctea',
    headway: '',
    hours: '',
    frequencyByDay: {},
    stops: [stop],
    path: [...line, ...[...line].reverse()],
    directions: [
      { directionId: 0, headsign: 'Vía Láctea 10A - Centinela', variant: '10A', destination: 'Centinela', path: line, stops: [stop] },
      { directionId: 1, headsign: 'Vía Láctea 10N - Los Bloques', variant: '10N', destination: 'Los Bloques', path: [...line].reverse(), stops: [stop] },
    ],
  };

  it('creates one simulation input per GTFS direction keyed like ROUTE_DIRECTION_SCHEDULES', () => {
    const inputs = buildSimulationRoutes([route]);
    expect(inputs.map((input) => [input.id, input.routeId, input.directionLabel, input.sourceKind])).toEqual([
      ['gtfs-route-835#0', 'gtfs-route-835', '10A → Centinela', 'gtfs'],
      ['gtfs-route-835#1', 'gtfs-route-835', '10N → Los Bloques', 'gtfs'],
    ]);
    expect(inputs[1].path).toBe(route.directions![1].path);
  });

  it('uses the official EFE patterns for Biotrén, reversing the track for the return', () => {
    const biotren: Route = { ...route, id: 'bt-l1', code: 'L1', type: 'biotren', directions: undefined, path: line };
    const inputs = buildSimulationRoutes([biotren]);
    expect(inputs.length).toBe(6);
    expect(inputs.every((input) => input.routeId === 'bt-l1' && input.confidence === 'official')).toBe(true);
    const reverse = inputs.find((input) => input.id === 'bt-l1-mercado-hualqui-weekday')!;
    expect(reverse.path).toEqual([...line].reverse());
  });
});
