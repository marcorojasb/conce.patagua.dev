import { describe, expect, it } from 'vitest';
import { scheduleDirectionId, scheduleVehicleFeed, toMapVehicles } from '@/realtime/schedule-vehicle-feed';
import { simulationVehicleLabels } from '@/lib/vehicle-labels';
import type { Route, SimulatedVehicle } from '@/types/transport';

function route(over: Partial<Route>): Route {
  return {
    id: 'r',
    code: 'R',
    name: 'R',
    type: 'micro',
    color: '#123456',
    operator: 'Op',
    headway: '',
    hours: '',
    frequencyByDay: {},
    stops: [],
    path: [],
    ...over,
  };
}

const microRoute = route({
  id: 'gtfs-30qe',
  code: '30QE',
  color: '#ff0000',
  directions: [
    { directionId: 0, headsign: '30Q Lomas', variant: '30Q', destination: 'Lomas', path: [], stops: [] },
    { directionId: 1, headsign: '30E Centro', variant: '30E', destination: 'Centro', path: [], stops: [] },
  ],
});
const biotren = route({ id: 'bt-l1', code: 'L1', type: 'biotren', color: '#e11d48' });
const routes = [microRoute, biotren];
const routesById = new Map(routes.map((r) => [r.id, r]));
const labels = simulationVehicleLabels(routes);

function sim(over: Partial<SimulatedVehicle>): SimulatedVehicle {
  return {
    id: 'x|480',
    scheduleId: 'x',
    routeId: 'x',
    progress: 0.5,
    lat: -36.82,
    lng: -73.05,
    bearing: 120,
    elapsedMin: 10,
    durationMin: 60,
    startMin: 480,
    sourceKind: 'gtfs',
    confidence: 'official',
    ...over,
  };
}

describe('scheduleDirectionId', () => {
  it('lee el sentido del sufijo #0/#1 y nada en los patrones de Biotrén', () => {
    expect(scheduleDirectionId('gtfs-30qe#0')).toBe(0);
    expect(scheduleDirectionId('gtfs-30qe#1')).toBe(1);
    expect(scheduleDirectionId('bt-l1-hualqui-mercado-weekday')).toBeNull();
  });
});

describe('toMapVehicles', () => {
  it('usa la variante del sentido como código, el color del recorrido y marca estimada', () => {
    const [v] = toMapVehicles(
      [sim({ id: 'gtfs-30qe#1|480', scheduleId: 'gtfs-30qe#1', routeId: 'gtfs-30qe' })],
      labels,
      routesById,
    );
    expect(v).toEqual({
      id: 'gtfs-30qe#1|480',
      kind: 'estimate',
      routeId: 'gtfs-30qe',
      directionId: 1,
      lat: -36.82,
      lng: -73.05,
      bearing: 120,
      color: '#ff0000',
      code: '30E',
      stale: false,
      tooltip: '30E hacia Centro · estimado según horario',
    });
  });

  it('Biotrén: código de la línea, sin sentido, destino del patrón EFE', () => {
    const [v] = toMapVehicles(
      [sim({ id: 'bt|1', scheduleId: 'bt-l1-hualqui-mercado-weekday', routeId: 'bt-l1', sourceKind: 'official' })],
      labels,
      routesById,
    );
    expect(v.kind).toBe('estimate');
    expect(v.stale).toBe(false);
    expect(v.directionId).toBeNull();
    expect(v.code).toBe('L1');
    expect(v.color).toBe('#e11d48');
    expect(v.tooltip).toBe('L1 hacia Mercado Talcahuano · estimado según horario');
  });

  it('sin letrero ni recorrido cae al id, con color por defecto', () => {
    const [v] = toMapVehicles([sim({ scheduleId: 'desconocido#0', routeId: 'desconocido' })], labels, routesById);
    expect(v.code).toBe('desconocido');
    expect(v.color).toBe('#0ea5e9');
    expect(v.directionId).toBe(0);
  });
});

describe('scheduleVehicleFeed', () => {
  it('es la fuente de estimadas y entrega lo último al suscribirse', () => {
    expect(scheduleVehicleFeed.kind).toBe('estimate');
    const received: number[] = [];
    const unsubscribe = scheduleVehicleFeed.subscribe((vehicles) => received.push(vehicles.length));
    unsubscribe();
    expect(received).toEqual([0]);
  });
});
