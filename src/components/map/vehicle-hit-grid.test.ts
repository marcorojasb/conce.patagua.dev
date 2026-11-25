import { describe, expect, it } from 'vitest';
import { VEHICLE_TAB_HEIGHT, vehicleDiameterForZoom, vehicleSymbolRadius } from '@/components/map/map-paint';
import {
  HIT_RADIUS_DOT_MOUSE_PX,
  HIT_RADIUS_DOT_TOUCH_PX,
  HIT_RADIUS_MOUSE_PX,
  HIT_RADIUS_TOUCH_PX,
  hitRadiusPx,
  VehicleHitGrid,
  type HitShape,
} from '@/components/map/vehicle-hit-grid';

const D = vehicleDiameterForZoom(15);
const ESTIMATE: HitShape = { kind: 'circle', radius: vehicleSymbolRadius('estimate', D) };
const GPS: HitShape = { kind: 'square', radius: vehicleSymbolRadius('gps', D) };

describe('VehicleHitGrid', () => {
  it('devuelve lo más cercano dentro del radio', () => {
    const grid = new VehicleHitGrid<string>();
    grid.insert(100, 100, 'lejos');
    grid.insert(108, 104, 'cerca');
    grid.insert(140, 100, 'fuera');
    expect(grid.nearest(110, 105, 10)).toBe('cerca');
    expect(grid.size).toBe(3);
  });

  it('busca en celdas vecinas cuando el punto está en un borde', () => {
    const grid = new VehicleHitGrid<string>(32);
    grid.insert(33, 33, 'otra-celda');
    expect(grid.nearest(30, 30, 10)).toBe('otra-celda');
  });

  it('sin nada en el radio o en una celda vacía devuelve null', () => {
    const grid = new VehicleHitGrid<string>();
    grid.insert(0, 0, 'a');
    expect(grid.nearest(500, 500, 16)).toBeNull();
    expect(grid.nearest(11, 0, 10)).toBeNull();
    expect(grid.nearest(10, 0, 10)).toBe('a');
  });

  it('ante un empate gana lo último insertado (lo que queda encima)', () => {
    const grid = new VehicleHitGrid<string>();
    grid.insert(64, 10, 'abajo');
    grid.insert(64, 10, 'encima');
    expect(grid.nearest(64, 10, 10)).toBe('encima');
    // Mismo empate repartido en dos celdas: decide el orden de inserción, no la celda.
    const split = new VehicleHitGrid<string>(32);
    split.insert(36, 0, 'derecha-primero');
    split.insert(28, 0, 'izquierda-despues');
    expect(split.nearest(32, 0, 10)).toBe('izquierda-despues');
  });

  it('coordenadas negativas y limpiar', () => {
    const grid = new VehicleHitGrid<string>();
    grid.insert(-40, -70, 'neg');
    expect(grid.nearest(-38, -66, 10)).toBe('neg');
    grid.clear();
    expect(grid.nearest(-38, -66, 10)).toBeNull();
    expect(grid.size).toBe(0);
  });

  it('con el radio táctil busca en las celdas vecinas en diagonal', () => {
    const grid = new VehicleHitGrid<string>(32);
    grid.insert(50, 50, 'diagonal');
    grid.insert(80, 20, 'lejos');
    // (64, 64) es la esquina de cuatro celdas; (50, 50) está a 19,8 px.
    expect(grid.nearest(64, 64, HIT_RADIUS_TOUCH_PX)).toBe('diagonal');
    expect(grid.nearest(64, 64, HIT_RADIUS_MOUSE_PX)).toBeNull();
  });
});

describe('VehicleHitGrid con lo dibujado', () => {
  it('a zoom 15 un clic sobre la lengüeta elige su micro, aunque esté a 30–60 px del centro', () => {
    const grid = new VehicleHitGrid<string>(32);
    grid.insert(100, 100, 'micro', ESTIMATE, 60);
    expect(grid.nearest(130, 100, HIT_RADIUS_MOUSE_PX)).toBe('micro');
    // Otra celda (la micro está en la columna 3; el punto, en la 4).
    expect(grid.nearest(159, 100 + VEHICLE_TAB_HEIGHT / 2, HIT_RADIUS_MOUSE_PX)).toBe('micro');
    // Fuera de la lengüeta: más allá del extremo, encima o debajo, o a la izquierda de la insignia.
    expect(grid.nearest(161, 100, HIT_RADIUS_MOUSE_PX)).toBeNull();
    expect(grid.nearest(130, 100 + VEHICLE_TAB_HEIGHT / 2 + 1, HIT_RADIUS_MOUSE_PX)).toBeNull();
    expect(grid.nearest(100 - 15, 100, HIT_RADIUS_MOUSE_PX)).toBeNull();
  });

  it('sin lengüeta, un punto a la derecha fuera del radio no elige nada', () => {
    const grid = new VehicleHitGrid<string>(32);
    grid.insert(100, 100, 'tenue', ESTIMATE);
    grid.insert(100, 100 + 200, 'punto');
    expect(grid.nearest(130, 100, HIT_RADIUS_MOUSE_PX)).toBeNull();
    // Sin lengüeta no hay franja de su alto bajo el centro.
    expect(grid.nearest(100, 100 + 200 + 5, 0)).toBeNull();
  });

  it('el cuadrado GPS con su anillo: la esquina cuenta con el mouse aunque pase de 13 px', () => {
    const grid = new VehicleHitGrid<string>(32);
    grid.insert(100, 100, 'gps', GPS);
    const diagonal = (r: number) => r / Math.SQRT2;
    expect(grid.nearest(100 - diagonal(15), 100 - diagonal(15), HIT_RADIUS_MOUSE_PX)).toBe('gps');
    // El anillo a Ø26 llega a ~19,4 px en diagonal.
    expect(grid.nearest(100 + diagonal(19), 100 - diagonal(19), HIT_RADIUS_MOUSE_PX)).toBe('gps');
    expect(grid.nearest(100 + GPS.radius, 100, HIT_RADIUS_MOUSE_PX)).toBe('gps');
    expect(grid.nearest(100 + GPS.radius + 1, 100, HIT_RADIUS_MOUSE_PX)).toBeNull();
    expect(grid.nearest(100, 100 + 40, HIT_RADIUS_MOUSE_PX)).toBeNull();
    // El cuadrado alcanza la celda vecina aunque el radio de toque no llegue.
    const edge = new VehicleHitGrid<string>(32);
    edge.insert(127.5, 100, 'gps', GPS);
    expect(edge.nearest(142.5, 100, HIT_RADIUS_MOUSE_PX)).toBe('gps');
  });

  it('sobre lo dibujado gana lo último dibujado (lo que queda encima), no el centro más cercano', () => {
    // Dos insignias que se pisan: el punto está más cerca del centro de la de abajo.
    const badges = new VehicleHitGrid<string>(32);
    badges.insert(0, 0, 'abajo', ESTIMATE);
    badges.insert(20, 0, 'encima', ESTIMATE);
    expect(badges.nearest(8, 0, HIT_RADIUS_MOUSE_PX)).toBe('encima');
    // La lengüeta de una micro dibujada después tapa la insignia de otra.
    const tab = new VehicleHitGrid<string>(32);
    tab.insert(40, 12, 'insignia', ESTIMATE);
    tab.insert(0, 0, 'lengüeta', ESTIMATE, 60);
    expect(tab.nearest(40, 5, HIT_RADIUS_MOUSE_PX)).toBe('lengüeta');
    // Una insignia encima de un punto cercano (lejos, las del foco van sobre los puntos).
    const focus = new VehicleHitGrid<string>(32);
    focus.insert(3, 0, 'punto');
    focus.insert(13, 0, 'foco', { kind: 'square', radius: vehicleSymbolRadius('gps', 20) });
    expect(focus.nearest(0, 0, HIT_RADIUS_DOT_MOUSE_PX)).toBe('foco');
    // Fuera de lo dibujado sigue mandando el más cercano dentro del radio.
    expect(focus.nearest(-5, 0, HIT_RADIUS_DOT_MOUSE_PX)).toBe('punto');
  });

  it('limpiar borra las entradas, también las que tenían lengüeta', () => {
    const grid = new VehicleHitGrid<string>(32);
    grid.insert(0, 0, 'a', ESTIMATE, 70);
    grid.clear();
    grid.insert(0, 0, 'b');
    expect(grid.nearest(50, 0, HIT_RADIUS_MOUSE_PX)).toBeNull();
    expect(grid.nearest(5, 0, HIT_RADIUS_MOUSE_PX)).toBe('b');
  });
});

describe('radios de toque', () => {
  it('con el dedo, 40 px de diámetro y más que la insignia más grande con su anillo', () => {
    expect(2 * HIT_RADIUS_TOUCH_PX).toBeGreaterThanOrEqual(40);
    const biggest = vehicleDiameterForZoom(18);
    expect(HIT_RADIUS_TOUCH_PX).toBeGreaterThanOrEqual(vehicleSymbolRadius('gps', biggest));
  });

  it('con el mouse, al menos la insignia más grande', () => {
    expect(HIT_RADIUS_MOUSE_PX).toBeGreaterThanOrEqual(vehicleDiameterForZoom(18) / 2);
    expect(HIT_RADIUS_MOUSE_PX).toBeLessThan(HIT_RADIUS_TOUCH_PX);
  });

  it('lejos (puntos de Ø7) el radio es menor: tocar un paradero o una línea no abre una micro', () => {
    expect(hitRadiusPx(true, false)).toBe(HIT_RADIUS_DOT_MOUSE_PX);
    expect(hitRadiusPx(true, true)).toBe(HIT_RADIUS_DOT_TOUCH_PX);
    expect(hitRadiusPx(false, true)).toBe(HIT_RADIUS_TOUCH_PX);
    expect(HIT_RADIUS_DOT_TOUCH_PX).toBeLessThan(HIT_RADIUS_TOUCH_PX);
    // La del foco va como insignia Ø20 también lejos: la cubre su forma (vehicle-draw.test.ts).
  });
});
