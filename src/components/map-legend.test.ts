import { describe, expect, it } from 'vitest';
import { routeShortName } from '@/components/map-legend';

describe('routeShortName', () => {
  it('quita el código que ya muestra la columna de la leyenda', () => {
    expect(routeShortName({ code: '02A', name: '02A: Centinela I - Mirador del Pacífico' })).toBe(
      'Centinela I - Mirador del Pacífico',
    );
    expect(routeShortName({ code: 'L1', name: 'Biotrén L1 · Hualqui ↔ Mercado Talcahuano' })).toBe(
      'Hualqui ↔ Mercado Talcahuano',
    );
    expect(routeShortName({ code: '17 O', name: '17 O: Lomas de San Sebastián' })).toBe('Lomas de San Sebastián');
  });

  it('deja el nombre tal cual si no empieza con el código', () => {
    expect(routeShortName({ code: '201', name: 'Concepción ↔ Santa Juana' })).toBe('Concepción ↔ Santa Juana');
    expect(routeShortName({ code: '201', name: '201:' })).toBe('201:');
  });
});
