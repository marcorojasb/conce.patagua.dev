import { describe, expect, it } from 'vitest';
import {
  containsPoint,
  mercatorU,
  mercatorV,
  packPolygons,
  polygonAt,
  polygonGrid,
} from '@/components/map/packed-polygons';

// Un parque cuadrado en el centro de Concepción y una plaza dentro de él.
const PARK: Array<[number, number]> = [
  [-36.82, -73.06],
  [-36.82, -73.04],
  [-36.84, -73.04],
  [-36.84, -73.06],
  [-36.82, -73.06],
];
const PLAZA: Array<[number, number]> = [
  [-36.825, -73.055],
  [-36.825, -73.05],
  [-36.83, -73.05],
  [-36.83, -73.055],
];
// Un polígono en L (no convexo), lejos.
const L_SHAPE: Array<[number, number]> = [
  [-36.7, -73.1],
  [-36.7, -73.08],
  [-36.71, -73.08],
  [-36.71, -73.09],
  [-36.72, -73.09],
  [-36.72, -73.1],
];

const at = (packedIndex: ReturnType<typeof packPolygons>, lat: number, lng: number) =>
  polygonAt(packedIndex, polygonGrid(packedIndex, 8), mercatorU(lng), mercatorV(lat));

describe('Mercator normalizada', () => {
  it('coincide con la proyección de Leaflet a escala 1 (EPSG:3857)', () => {
    expect(mercatorU(0)).toBe(0.5);
    expect(mercatorU(180)).toBe(1);
    expect(mercatorV(0)).toBeCloseTo(0.5, 12);
    // Más al sur, más abajo; y el norte arriba.
    expect(mercatorV(-36.8)).toBeGreaterThan(0.5);
    expect(mercatorV(10)).toBeLessThan(0.5);
  });
});

describe('packPolygons', () => {
  it('empaqueta vértices, inicios y cajas', () => {
    const packed = packPolygons([PARK, PLAZA]);
    expect(Array.from(packed.starts)).toEqual([0, 5, 9]);
    expect(packed.coords).toHaveLength(18);
    expect(packed.boxes[0]).toBeCloseTo(mercatorU(-73.06), 12);
    expect(packed.boxes[3]).toBeCloseTo(mercatorV(-36.84), 12);
  });
});

describe('punto en polígono', () => {
  const packed = packPolygons([PARK, PLAZA, L_SHAPE]);

  it('dentro y fuera de un polígono, también en la parte cóncava de una L', () => {
    expect(containsPoint(packed, 0, mercatorU(-73.045), mercatorV(-36.835))).toBe(true);
    expect(containsPoint(packed, 0, mercatorU(-73.03), mercatorV(-36.835))).toBe(false);
    expect(containsPoint(packed, 2, mercatorU(-73.095), mercatorV(-36.715))).toBe(true);
    // Esquina vacía de la L: dentro de la caja, fuera del polígono.
    expect(containsPoint(packed, 2, mercatorU(-73.085), mercatorV(-36.715))).toBe(false);
  });

  it('con polígonos anidados gana el más chico; fuera de todo, -1', () => {
    expect(at(packed, -36.8275, -73.0525)).toBe(1);
    expect(at(packed, -36.835, -73.045)).toBe(0);
    expect(at(packed, -36.715, -73.085)).toBe(-1);
    expect(at(packed, -36.9, -73.2)).toBe(-1);
  });
});
