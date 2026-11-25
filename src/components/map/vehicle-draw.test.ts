import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  MAX_SPRITES,
  badgeSpriteKey,
  bearingBucket,
  cullVehicles,
  drawVehicleItems,
  focusIndex,
  lodForZoom,
  sortForDraw,
  splitForLod,
  tabSpriteKey,
  vehicleEmphasis,
  type DrawItem,
} from '@/components/map/vehicle-draw';
import { vehicleDiameterForZoom } from '@/components/map/map-paint';
import { HIT_RADIUS_DOT_MOUSE_PX, HIT_RADIUS_MOUSE_PX, VehicleHitGrid } from '@/components/map/vehicle-hit-grid';
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
    // Toda la red: puntos también a zoom 13, insignias desde 14.
    expect(lodForZoom(13, true)).toBe('dot');
    expect(lodForZoom(14, true)).toBe('icon');
    expect(lodForZoom(12, true)).toBe('dot');
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

describe('claves de sprite', () => {
  it('la estimada solo depende de su tinta (que ya trae el tema); el GPS lleva el tema (anillos y mezcla del viejo)', () => {
    expect(badgeSpriteKey('estimate', '#0860ab', false, 3, 18, 'light')).toBe('e|#0860ab|3|18');
    expect(badgeSpriteKey('estimate', '#0860ab', false, 3, 18, 'dark')).toBe('e|#0860ab|3|18');
    expect(badgeSpriteKey('gps', '#0860ab', true, null, 26, 'dark')).toBe('g|dark|#0860ab|true|null|26');
    expect(badgeSpriteKey('gps', '#0860ab', false, null, 26, 'dark')).not.toBe(
      badgeSpriteKey('gps', '#0860ab', true, null, 26, 'dark'),
    );
    expect(tabSpriteKey('light', false, true, '30E')).toBe('l|light|false|true|30E');
  });

  it('con ~26 tintas, 17 rumbos y 3 tamaños, una fuente y un tema caben en el caché', () => {
    const inks = Array.from({ length: 26 }, (_, i) => `#0000${i.toString(16).padStart(2, '0')}`);
    const buckets = [null, ...Array.from({ length: 16 }, (_, i) => i)];
    const diameters = [...new Set([13, 14, 15].map(vehicleDiameterForZoom))];
    for (const kind of ['estimate', 'gps'] as const) {
      const keys = new Set<string>();
      for (const ink of inks) {
        for (const bucket of buckets) {
          for (const d of diameters) {
            for (const stale of kind === 'gps' ? [false, true] : [false]) {
              keys.add(badgeSpriteKey(kind, ink, stale, bucket, d, 'light'));
            }
          }
        }
      }
      expect(keys.size).toBeLessThan(MAX_SPRITES);
    }
  });
});

interface Copy {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Contexto 2D de mentira (las pruebas corren en Node, sin canvas): cada método
 * es un no-op, measureText da 6,6 px por carácter (JetBrains Mono a 11 px) y
 * drawImage anota dónde se copió cada sprite.
 */
function fakeContext(copies: Copy[] = []): CanvasRenderingContext2D {
  const props: Record<PropertyKey, unknown> = {
    measureText: (text: string) => ({ width: 6.6 * text.length }),
    getTransform: () => ({ a: 1, b: 0 }),
    drawImage: (_image: unknown, x: number, y: number, w: number, h: number) => copies.push({ x, y, w, h }),
  };
  return new Proxy(props, {
    get: (target, prop) => (prop in target ? target[prop] : () => {}),
    set: (target, prop, value) => {
      target[prop] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

describe('drawVehicleItems deja en la grilla de toque lo que dibuja', () => {
  beforeAll(() => {
    vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => fakeContext() }) });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  const at = (id: string, emphasis: DrawItem['emphasis'], x: number, over: Partial<MapVehicle> = {}): DrawItem => ({
    ...item(id, emphasis, over),
    x,
    y: 200,
  });

  function draw(items: DrawItem[], zoom: number, copies?: Copy[]): VehicleHitGrid<MapVehicle> {
    const grid = new VehicleHitGrid<MapVehicle>();
    const o = { lod: lodForZoom(zoom), diameter: vehicleDiameterForZoom(zoom), theme: 'light' as const };
    drawVehicleItems(fakeContext(copies), items, o, grid);
    return grid;
  }

  it('a zoom 15 un clic sobre el código (la lengüeta, a la derecha) elige la micro', () => {
    for (const kind of ['estimate', 'gps'] as const) {
      const copies: Copy[] = [];
      const micro = at(kind, 'normal', 200, { kind });
      const grid = draw([micro], 15, copies);
      expect(grid.nearest(230, 200, HIT_RADIUS_MOUSE_PX)).toBe(micro.vehicle);
      // Hasta donde termina el sprite de la lengüeta (se copia antes que la insignia), no más allá.
      const tab = copies[0];
      expect(tab.x + tab.w).toBeGreaterThan(240);
      expect(grid.nearest(tab.x + tab.w - 1, 200 + 8, HIT_RADIUS_MOUSE_PX)).toBe(micro.vehicle);
      expect(grid.nearest(tab.x + tab.w + 2, 200, HIT_RADIUS_MOUSE_PX)).toBeNull();
      // Fuera de todo: nada.
      expect(grid.nearest(200, 240, HIT_RADIUS_MOUSE_PX)).toBeNull();
      expect(grid.nearest(230, 215, HIT_RADIUS_MOUSE_PX)).toBeNull();
    }
  });

  it('atenuada (sin lengüeta): el lugar del código no la elige', () => {
    const tenue = at('tenue', 'dimmed', 200);
    const grid = draw([tenue], 15);
    expect(grid.nearest(230, 200, HIT_RADIUS_MOUSE_PX)).toBeNull();
    expect(grid.nearest(212, 200, HIT_RADIUS_MOUSE_PX)).toBe(tenue.vehicle);
  });

  it('GPS a zoom 15: la esquina del cuadrado con su anillo elige la micro con el mouse', () => {
    const gps = at('gps', 'normal', 200, { kind: 'gps' });
    const grid = draw([gps], 15);
    const d = (r: number) => r / Math.SQRT2;
    expect(grid.nearest(200 - d(15), 200 - d(15), HIT_RADIUS_MOUSE_PX)).toBe(gps.vehicle);
    expect(grid.nearest(200 - d(19), 200 + d(19), HIT_RADIUS_MOUSE_PX)).toBe(gps.vehicle);
    expect(grid.nearest(200 - 20, 200 - 20, HIT_RADIUS_MOUSE_PX)).toBeNull();
  });

  it('lejos, la del foco con GPS (insignia Ø20) a 12 px elige la micro; un punto a 12 px, no', () => {
    const punto = at('punto', 'dimmed', 400, { kind: 'gps' });
    const foco = at('foco', 'focus', 200, { kind: 'gps' });
    const grid = draw([punto, foco], 11);
    expect(grid.nearest(212, 200, HIT_RADIUS_DOT_MOUSE_PX)).toBe(foco.vehicle);
    expect(grid.nearest(210, 190, HIT_RADIUS_DOT_MOUSE_PX)).toBe(foco.vehicle);
    expect(grid.nearest(405, 200, HIT_RADIUS_DOT_MOUSE_PX)).toBe(punto.vehicle);
    expect(grid.nearest(412, 200, HIT_RADIUS_DOT_MOUSE_PX)).toBeNull();
    expect(grid.size).toBe(2);
  });
});
