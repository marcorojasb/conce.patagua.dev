import { describe, expect, it } from 'vitest';
import { VehicleHitGrid } from '@/components/map/vehicle-hit-grid';

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
});
