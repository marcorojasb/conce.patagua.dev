import { describe, expect, it } from 'vitest';
import {
  bearingBucket,
  cullVehicles,
  focusIndex,
  lodForZoom,
  sortForDraw,
  splitForLod,
  vehicleEmphasis,
  type DrawItem,
} from '@/components/map/vehicle-draw';
import type { MapVehicle } from '@/types/ui-contracts';

function vehicle(over: Partial<MapVehicle> = {}): MapVehicle {
  return {
    id: 'v',
    kind: 'estimate',
    routeId: 'r1',
    directionId: 0,
    lat: -36.82,
    lng: -73.05,
    bearing: 90,
    color: '#ff0000',
    code: '10A',
    stale: false,
    tooltip: '10A hacia Centro · estimado según horario',
    ...over,
  };
}

function item(id: string, emphasis: DrawItem['emphasis'], over: Partial<MapVehicle> = {}): DrawItem {
  return { vehicle: vehicle({ id, ...over }), emphasis, x: 0, y: 0 };
}

describe('lodForZoom', () => {
  it('punto lejos, forma mediana en 13–14 y letrero desde 15', () => {
    expect(lodForZoom(10)).toBe('dot');
    expect(lodForZoom(11)).toBe('dot');
    expect(lodForZoom(12)).toBe('dot');
    expect(lodForZoom(13)).toBe('icon');
    expect(lodForZoom(14)).toBe('icon');
    expect(lodForZoom(15)).toBe('pill');
    expect(lodForZoom(18)).toBe('pill');
  });
});

describe('splitForLod', () => {
  const items = [item('foco', 'focus'), item('normal', 'normal'), item('tenue', 'dimmed')];

  it('lejos (un recorrido largo se encuadra a zoom 11) las del foco van como forma, el resto como punto', () => {
    const { dots, sprites } = splitForLod(items, lodForZoom(11));
    expect(sprites.map((i) => i.vehicle.id)).toEqual(['foco']);
    expect(dots.map((i) => i.vehicle.id)).toEqual(['normal', 'tenue']);
  });

  it('sin foco, todo punto lejos', () => {
    const { dots, sprites } = splitForLod([items[1]], 'dot');
    expect(sprites).toEqual([]);
    expect(dots).toHaveLength(1);
  });

  it('de cerca todo es forma o letrero', () => {
    expect(splitForLod(items, 'icon').sprites).toHaveLength(3);
    expect(splitForLod(items, 'pill').dots).toEqual([]);
  });
});

describe('cullVehicles', () => {
  it('deja solo lo que cae en el recuadro, bordes incluidos', () => {
    const box = { south: -37, west: -73.2, north: -36.7, east: -72.9 };
    const inside = vehicle({ id: 'in' });
    const edge = vehicle({ id: 'edge', lat: -37, lng: -72.9 });
    const north = vehicle({ id: 'north', lat: -36.6 });
    const east = vehicle({ id: 'east', lng: -72.8 });
    expect(cullVehicles([inside, edge, north, east], box).map((v) => v.id)).toEqual(['in', 'edge']);
  });
});

describe('vehicleEmphasis', () => {
  it('sin foco todo es normal', () => {
    expect(vehicleEmphasis(vehicle(), focusIndex(null))).toBe('normal');
    expect(focusIndex({ routeIds: [], directionId: 1 })).toBeNull();
  });

  it('con foco atenúa las demás líneas', () => {
    const focus = focusIndex({ routeIds: ['r1'], directionId: null });
    expect(vehicleEmphasis(vehicle(), focus)).toBe('focus');
    expect(vehicleEmphasis(vehicle({ routeId: 'r2' }), focus)).toBe('dimmed');
  });

  it('con un sentido elegido oculta el otro sentido, no las sin sentido', () => {
    const focus = focusIndex({ routeIds: ['r1'], directionId: 1 });
    expect(vehicleEmphasis(vehicle({ directionId: 0 }), focus)).toBe('hidden');
    expect(vehicleEmphasis(vehicle({ directionId: 1 }), focus)).toBe('focus');
    expect(vehicleEmphasis(vehicle({ directionId: null }), focus)).toBe('focus');
  });

  it('el sentido no aplica con varios recorridos en foco (paradero)', () => {
    const focus = focusIndex({ routeIds: ['r1', 'r2'], directionId: 1 });
    expect(vehicleEmphasis(vehicle({ directionId: 0 }), focus)).toBe('focus');
  });
});

describe('sortForDraw', () => {
  it('atenuadas, luego viejas, normales y el foco arriba', () => {
    const items = [
      item('focus', 'focus', { kind: 'gps' }),
      item('normal', 'normal', { kind: 'gps' }),
      item('stale', 'normal', { kind: 'gps', stale: true }),
      item('dimmed', 'dimmed', { kind: 'gps' }),
    ];
    expect(sortForDraw(items).map((i) => i.vehicle.id)).toEqual(['dimmed', 'stale', 'normal', 'focus']);
  });

  it('dentro de un grupo agrupa por color y respeta el orden de llegada', () => {
    const items = [
      item('b1', 'normal', { color: '#bbbbbb' }),
      item('a1', 'normal', { color: '#aaaaaa' }),
      item('b2', 'normal', { color: '#bbbbbb' }),
      item('a2', 'normal', { color: '#aaaaaa' }),
    ];
    expect(sortForDraw(items).map((i) => i.vehicle.id)).toEqual(['a1', 'a2', 'b1', 'b2']);
  });

  it('no modifica el arreglo recibido', () => {
    const items = [item('x', 'focus'), item('y', 'dimmed')];
    sortForDraw(items);
    expect(items.map((i) => i.vehicle.id)).toEqual(['x', 'y']);
  });
});

describe('bearingBucket', () => {
  it('redondea el rumbo a 16 direcciones y respeta la falta de rumbo', () => {
    expect(bearingBucket(0)).toBe(0);
    expect(bearingBucket(11)).toBe(0);
    expect(bearingBucket(12)).toBe(1);
    expect(bearingBucket(90)).toBe(4);
    expect(bearingBucket(359)).toBe(0);
    expect(bearingBucket(-90)).toBe(12);
    expect(bearingBucket(null)).toBeNull();
    expect(bearingBucket(Number.NaN)).toBeNull();
  });
});
