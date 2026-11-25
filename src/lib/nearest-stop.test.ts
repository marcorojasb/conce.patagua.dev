import { describe, expect, it } from 'vitest';
import { nearestStop } from './nearest-stop';

// Plaza de Armas de Concepción y alrededores (1e-3° de latitud ≈ 111 m).
const STOPS = [
  { id: 'a', name: 'Barros Arana / Caupolicán', lat: -36.8270, lng: -73.0503 },
  { id: 'b', name: 'O’Higgins / Aníbal Pinto', lat: -36.8285, lng: -73.0503 },
  { id: 'c', lat: -36.8271, lng: -73.0503 },
  { id: 'd', name: 'Lejos', lat: -36.8400, lng: -73.0503 },
];

describe('nearestStop', () => {
  it('elige el más cercano con nombre dentro del radio', () => {
    const hit = nearestStop({ lat: -36.8272, lng: -73.0503 }, STOPS, 300);
    expect(hit?.stop.id).toBe('a');
    expect(hit?.meters).toBeGreaterThan(15);
    expect(hit?.meters).toBeLessThan(30);
  });

  it('null si nada queda a 300 m o menos', () => {
    expect(nearestStop({ lat: -36.8330, lng: -73.0503 }, STOPS, 300)).toBeNull();
    expect(nearestStop({ lat: -36.8272, lng: -73.0503 }, [], 300)).toBeNull();
  });

  it('respeta el borde del radio', () => {
    // b queda a ~145 m: dentro de 300, fuera de 100.
    const point = { lat: -36.8298, lng: -73.0503 };
    expect(nearestStop(point, STOPS, 300)?.stop.id).toBe('b');
    expect(nearestStop(point, STOPS, 100)).toBeNull();
  });
});
