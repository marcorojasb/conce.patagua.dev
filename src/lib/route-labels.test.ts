import { describe, expect, it } from 'vitest';
import { compareRouteCodes, isInterurban, lineFamily, routeShortName } from '@/lib/route-labels';

describe('routeShortName', () => {
  it('quita el código que ya se muestra aparte', () => {
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

describe('lineFamily', () => {
  it('agrupa variantes por número de línea', () => {
    expect(lineFamily('30Q')).toBe('30');
    expect(lineFamily('02A')).toBe('2');
    expect(lineFamily('10 J')).toBe('10');
    expect(lineFamily('201')).toBe('201');
    expect(lineFamily('B01')).toBe('B01');
  });
});

describe('compareRouteCodes', () => {
  it('ordena de forma natural', () => {
    expect(['30Q', '201', '10B', '02A', '10A'].sort(compareRouteCodes)).toEqual(['02A', '10A', '10B', '30Q', '201']);
  });
});

describe('isInterurban', () => {
  it('reconoce todas las redes interurbanas, no solo la del 201', () => {
    expect(isInterurban({ network: 'Interurbano Biobío' })).toBe(true);
    expect(isInterurban({ network: 'Interurbano Tomé' })).toBe(true);
    expect(isInterurban({ network: 'GTFS Gran Concepción' })).toBe(false);
    expect(isInterurban({})).toBe(false);
  });
});
