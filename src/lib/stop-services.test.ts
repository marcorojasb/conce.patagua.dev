import { describe, expect, it } from 'vitest';
import {
  formatServiceClock,
  getNextStopServices,
  stopPositionAlong,
} from './stop-services';
import type { StopServiceWindow } from '@/data/gtfs-stop-services.generated';
import type { Route, Stop } from '@/types/transport';

const HEADSIGN_10A = 'Vía Láctea 10A - Centinela';
const HEADSIGN_10N = 'Vía Láctea 10N - Los Bloques';

function busRoute(id: string): Route {
  return {
    id,
    code: '10AN',
    name: 'Vía Láctea 10N - Los Bloques - Vía Láctea 10A - Centinela',
    type: 'micro',
    color: '#000',
    operator: 'Vía Láctea',
    headway: '',
    hours: '',
    frequencyByDay: {},
    stops: [],
    path: [],
    directions: [
      { directionId: 0, headsign: HEADSIGN_10A, variant: '10A', destination: 'Centinela', path: [], stops: [] },
      { directionId: 1, headsign: HEADSIGN_10N, variant: '10N', destination: 'Los Bloques', path: [], stops: [] },
    ],
  };
}

const ROUTE = busRoute('gtfs-route-835');

// 2026-05-18 es lunes; en mayo Chile está en CLT (-04).
describe('próximas pasadas desde ventanas GTFS', () => {
  it('proyecta la próxima con el intervalo de la ventana y usa el destino del sentido', () => {
    const windows: StopServiceWindow[] = [['gtfs-route-835', HEADSIGN_10A, 0, 360, 600, 15, 17]];
    const snapshot = getNextStopServices({
      stopId: 'gtfs-stop-1',
      routes: [ROUTE],
      windows,
      now: new Date('2026-05-18T08:07:00-04:00'),
    });
    expect(snapshot.services).toEqual([
      {
        routeId: 'gtfs-route-835',
        variant: '10A',
        destination: 'Centinela',
        scheduledMin: 495,
        minutesUntil: 8,
        source: 'gtfs-window',
        headwayMin: 15,
      },
    ]);
  });

  it('una fila por recorrido y sentido: si hoy queda servicio no repite el de mañana', () => {
    const windows: StopServiceWindow[] = [
      ['gtfs-route-835', HEADSIGN_10A, 0, 360, 1320, 10, 97],
      ['gtfs-route-835', HEADSIGN_10A, 1, 360, 1320, 10, 97],
      ['gtfs-route-835', HEADSIGN_10N, 0, 380, 1300, 10, 93],
    ];
    const snapshot = getNextStopServices({
      stopId: 'gtfs-stop-1',
      routes: [ROUTE],
      windows,
      now: new Date('2026-05-18T12:01:00-04:00'),
    });
    expect(snapshot.services.map((s) => [s.variant, s.scheduledMin])).toEqual([
      ['10A', 730],
      ['10N', 730],
    ]);
  });

  it('pasa al día siguiente cuando hoy ya no queda servicio', () => {
    const windows: StopServiceWindow[] = [
      ['gtfs-route-835', HEADSIGN_10A, 0, 360, 420, 20, 4],
      ['gtfs-route-835', HEADSIGN_10A, 1, 360, 420, 20, 4],
    ];
    const snapshot = getNextStopServices({
      stopId: 'gtfs-stop-1',
      routes: [ROUTE],
      windows,
      now: new Date('2026-05-18T23:50:00-04:00'),
    });
    expect(snapshot.services).toHaveLength(1);
    expect(snapshot.services[0].scheduledMin).toBe(1800);
    expect(formatServiceClock(snapshot.services[0].scheduledMin)).toBe('06:00');
  });

  it('de madrugada sigue la ventana de ayer que pasa de las 24:00', () => {
    // Lunes 06:00–24:30 cada 15; martes 00:10 → próxima 00:15 (del lunes).
    const windows: StopServiceWindow[] = [['gtfs-route-835', HEADSIGN_10A, 0, 360, 1470, 15, 75]];
    const snapshot = getNextStopServices({
      stopId: 'gtfs-stop-1',
      routes: [ROUTE],
      windows,
      now: new Date('2026-05-19T00:10:00-04:00'),
    });
    expect(snapshot.services[0]).toMatchObject({ scheduledMin: 15, minutesUntil: 5 });
  });

  it('sin el sentido en el modelo muestra el letrero oficial tal cual', () => {
    const bare: Route = { ...ROUTE, directions: undefined };
    const snapshot = getNextStopServices({
      stopId: 'gtfs-stop-1',
      routes: [bare],
      windows: [['gtfs-route-835', HEADSIGN_10A, 0, 360, 600, 15, 17]],
      now: new Date('2026-05-18T08:07:00-04:00'),
    });
    expect(snapshot.services[0]).toMatchObject({ variant: undefined, destination: HEADSIGN_10A });
  });

  it('no ofrece el sentido que termina en el paradero', () => {
    const stop = (id: string): Stop => ({ id, name: id, lat: 0, lng: 0 });
    const terminal: Route = {
      ...ROUTE,
      directions: [
        { ...ROUTE.directions![0], stops: [stop('a'), stop('terminal')] },
        { ...ROUTE.directions![1], stops: [stop('terminal'), stop('a')] },
      ],
    };
    const snapshot = getNextStopServices({
      stopId: 'terminal',
      routes: [terminal],
      windows: [
        ['gtfs-route-835', HEADSIGN_10A, 0, 400, 1300, 10, 91],
        ['gtfs-route-835', HEADSIGN_10N, 0, 360, 1260, 10, 91],
      ],
      now: new Date('2026-05-18T08:00:00-04:00'),
    });
    expect(snapshot.services.map((s) => s.variant)).toEqual(['10N']);
  });

  it('ignora ventanas de recorridos que no son del paradero', () => {
    const snapshot = getNextStopServices({
      stopId: 'gtfs-stop-1',
      routes: [busRoute('gtfs-route-2')],
      windows: [['gtfs-route-835', HEADSIGN_10A, 0, 360, 600, 15, 17]],
      now: new Date('2026-05-18T08:00:00-04:00'),
    });
    expect(snapshot.services).toEqual([]);
  });
});

describe('próximas pasadas de Biotrén (itinerario EFE)', () => {
  // Estaciones reales de L2 en orden Coronel → Concepción (forward).
  const L2_STOPS: Stop[] = [
    { id: 'coronel', name: 'Coronel', lat: -37.0246351, lng: -73.1508068 },
    { id: 'lomas', name: 'Lomas Coloradas', lat: -36.8825028, lng: -73.1395361 },
    { id: 'concepcion', name: 'Concepción', lat: -36.8301581, lng: -73.0610353 },
  ];
  const L2: Route = {
    ...busRoute('bt-l2'),
    code: 'L2',
    type: 'biotren',
    stops: L2_STOPS,
    directions: undefined,
  };
  // Lunes 05:50: el primer tren sale de Coronel 05:55 (45 min) y el primero
  // desde Concepción a las 06:45.
  const MONDAY_0550 = new Date('2026-05-18T05:50:00-04:00');

  it('en la cabecera da la salida publicada, sin cabecera de origen aparte', () => {
    const snapshot = getNextStopServices({
      stopId: 'coronel',
      routes: [L2],
      windows: undefined,
      now: MONDAY_0550,
    });
    // En Coronel solo sale hacia Concepción: el otro sentido termina ahí.
    expect(snapshot.services).toEqual([
      {
        routeId: 'bt-l2',
        destination: 'Concepción',
        scheduledMin: 355,
        minutesUntil: 5,
        source: 'static-trips',
        origin: undefined,
      },
    ]);
  });

  it('en una estación intermedia interpola la pasada y conserva la salida desde la cabecera', () => {
    const position = stopPositionAlong(L2_STOPS, 'lomas')!;
    const snapshot = getNextStopServices({
      stopId: 'lomas',
      routes: [L2],
      windows: undefined,
      now: MONDAY_0550,
    });
    const toConcepcion = snapshot.services.find((s) => s.destination === 'Concepción')!;
    expect(toConcepcion.origin).toEqual({ name: 'Coronel', departureMin: 355 });
    expect(toConcepcion.scheduledMin).toBe(355 + Math.round(position * 45));
    const toCoronel = snapshot.services.find((s) => s.destination === 'Coronel')!;
    expect(toCoronel.origin).toEqual({ name: 'Concepción', departureMin: 405 });
    expect(toCoronel.scheduledMin).toBe(405 + Math.round((1 - position) * 42));
  });

  it('cuenta los trenes que ya salieron de la cabecera pero aún no pasan por la estación', () => {
    // 06:10: el de 05:55 desde Coronel todavía no llega a Concepción (06:40).
    const snapshot = getNextStopServices({
      stopId: 'lomas',
      routes: [L2],
      windows: undefined,
      now: new Date('2026-05-18T06:10:00-04:00'),
    });
    const toConcepcion = snapshot.services.find((s) => s.destination === 'Concepción')!;
    expect(toConcepcion.origin?.departureMin).toBe(355);
  });

  it('después del último tren pasa al primero del día siguiente', () => {
    // Domingo 23:00 → lunes: primer tren desde Coronel 05:55.
    const snapshot = getNextStopServices({
      stopId: 'coronel',
      routes: [L2],
      windows: undefined,
      now: new Date('2026-05-17T23:00:00-04:00'),
    });
    expect(snapshot.services).toHaveLength(1);
    expect(snapshot.services[0]).toMatchObject({ scheduledMin: 1440 + 355, minutesUntil: 415 });
  });
});
