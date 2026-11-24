import { describe, expect, it } from 'vitest';
import { compareRouteCodes, isInterurban, lineFamily, routeCodeKey, routeShortName } from '@/lib/route-labels';
import type { RouteDirection } from '@/types/transport';

function direction(directionId: 0 | 1, destination: string): RouteDirection {
  return { directionId, headsign: `Op ${destination}`, destination, path: [], stops: [] };
}

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

  it('usa los destinos oficiales de cada sentido cuando existen', () => {
    const name = 'Vía Láctea 10N - Los Bloques - Vía Láctea 10A - Centinela';
    expect(
      routeShortName({ code: '10AN', name, directions: [direction(0, 'Centinela'), direction(1, 'Los Bloques')] }),
    ).toBe('Los Bloques ↔ Centinela');
    expect(routeShortName({ code: '70F', name: 'Las Bahías 70F - Nonguén', directions: [direction(1, 'Nonguén')] })).toBe(
      'hacia Nonguén',
    );
  });

  it('deja el nombre tal cual si no empieza con el código', () => {
    expect(routeShortName({ code: '201', name: 'Concepción ↔ Santa Juana' })).toBe('Concepción ↔ Santa Juana');
    expect(routeShortName({ code: '201', name: '201:' })).toBe('201:');
  });
});

describe('routeCodeKey', () => {
  it('iguala códigos escritos de distintas formas', () => {
    expect(routeCodeKey('201 AU')).toBe(routeCodeKey('201-AU'));
    expect(routeCodeKey('02a')).toBe('2A');
    expect(routeCodeKey('10 J')).toBe('10J');
    expect(routeCodeKey('B02')).toBe('B02');
    expect(routeCodeKey('80J-Y')).toBe('80JY');
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
    expect(isInterurban({ network: 'Interurbano Santa Juana' })).toBe(true);
    expect(isInterurban({ network: 'Interurbano Tomé' })).toBe(true);
    expect(isInterurban({ network: 'Interurbano Lota' })).toBe(true);
    expect(isInterurban({ network: 'GTFS Gran Concepción' })).toBe(false);
    expect(isInterurban({})).toBe(false);
  });
});
