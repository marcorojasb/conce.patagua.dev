import { describe, expect, it } from 'vitest';
import {
  compareRouteCodes,
  directionCode,
  isInterurban,
  lineFamily,
  matchesRouteQuery,
  routeCodeKey,
  routePillCode,
  routeShortName,
} from '@/lib/route-labels';
import { GTFS_BUS_ROUTES } from '@/data/gtfs-bus-routes.generated';
import type { Route, RouteDirection } from '@/types/transport';

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
    // La píldora de la línea completa ("30Q/E") es el mismo código.
    expect(routeCodeKey('30Q/E')).toBe('30QE');
    expect(routeCodeKey('23B/S')).toBe(routeCodeKey('23BS'));
  });
});

describe('matchesRouteQuery', () => {
  const route10AN = {
    code: '10AN',
    name: 'Vía Láctea 10N - Los Bloques - Vía Láctea 10A - Centinela',
    operator: 'Vía Láctea',
    directions: [
      { ...direction(0, 'Centinela'), variant: '10A', headsign: 'Vía Láctea 10A - Centinela' },
      { ...direction(1, 'Los Bloques'), variant: '10N', headsign: 'Vía Láctea 10N - Los Bloques' },
    ],
  };
  const route201AU = {
    code: '201-AU',
    name: '201-AU - Santa Juana - 201-AU - Concepción',
    operator: 'Operador no informado en el GTFS',
    directions: [],
  };

  it('encuentra por código, variante de un sentido o código escrito de otra forma', () => {
    expect(matchesRouteQuery(route10AN, '10an')).toBe(true);
    expect(matchesRouteQuery(route10AN, '10A')).toBe(true);
    expect(matchesRouteQuery(route10AN, '10 n')).toBe(true);
    expect(matchesRouteQuery(route10AN, '10P')).toBe(false);
    expect(matchesRouteQuery(route201AU, '201 au')).toBe(true);
  });

  it('encuentra por la etiqueta que muestra la píldora', () => {
    const route30QE = {
      code: '30QE',
      name: '30Q - Penco Chico - 30E - Higueras',
      operator: 'Expresos Chiguayante',
      directions: [
        { ...direction(0, 'Higueras'), variant: '30Q', headsign: '30Q - Higueras' },
        { ...direction(1, 'Penco Chico'), variant: '30E', headsign: '30E - Penco Chico' },
      ],
    };
    const route23BS = {
      code: '23BS',
      name: '23B - Lomas - 23S - Centro',
      operator: 'Buses Base',
      directions: [
        { ...direction(0, 'Centro'), variant: '23B', headsign: '23B - Centro' },
        { ...direction(1, 'Lomas'), variant: '23S', headsign: '23S - Lomas' },
      ],
    };
    expect(matchesRouteQuery(route30QE, '30Q/E')).toBe(true);
    expect(matchesRouteQuery(route30QE, '30q/')).toBe(true);
    expect(matchesRouteQuery(route23BS, '23B/S')).toBe(true);
    expect(matchesRouteQuery(route10AN, '10A/N')).toBe(true);
    expect(matchesRouteQuery(route23BS, '30Q/E')).toBe(false);
  });

  it('encuentra por destino u operador sin importar tildes', () => {
    expect(matchesRouteQuery(route10AN, 'centinela')).toBe(true);
    expect(matchesRouteQuery(route10AN, 'via lactea')).toBe(true);
    expect(matchesRouteQuery(route201AU, 'concepcion')).toBe(true);
    expect(matchesRouteQuery(route201AU, 'tomé')).toBe(false);
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

describe('routePillCode y directionCode', () => {
  // Los recorridos tal como los arma src/data/routes.ts desde el GTFS oficial.
  const byCode = (code: string): Pick<Route, 'code' | 'directions'> => {
    const route = GTFS_BUS_ROUTES.find((r) => r.ref === code);
    if (!route) throw new Error(`sin ${code}`);
    const directions = (route.directions ?? []).map(
      (d): RouteDirection => ({ directionId: d.directionId, headsign: d.headsign, variant: d.variant, path: [], stops: [] }),
    );
    return { code: route.ref, directions };
  };

  it('junta los dos letreros cuando solo cambia la última letra', () => {
    expect(routePillCode(byCode('30QE'))).toBe('30Q/E');
    expect(routePillCode(byCode('20VA'))).toBe('20V/A');
    expect(routePillCode(byCode('23BS'))).toBe('23B/S');
    expect(routePillCode(byCode('02AD'))).toBe('02A/D');
  });

  it('deja el código cuando los dos sentidos dicen lo mismo, hay uno solo o no hay letrero', () => {
    expect(routePillCode(byCode('201'))).toBe('201');
    expect(routePillCode(byCode('201-AU'))).toBe('201-AU');
    expect(routePillCode(byCode('02C-Y'))).toBe('02C-Y');
    expect(routePillCode(byCode('80J-Y'))).toBe('80J-Y');
    expect(routePillCode(byCode('401'))).toBe('401');
    expect(routePillCode({ code: 'L1' })).toBe('L1');
  });

  it('dos letreros que difieren en más que la última letra van completos, en orden de sentido', () => {
    const route = {
      code: 'X1',
      directions: [direction(1, 'B'), direction(0, 'A')].map((d, i) => ({ ...d, variant: i === 0 ? '11B' : '10A' })),
    };
    expect(routePillCode(route)).toBe('10A/11B');
  });

  it('por sentido: el letrero de ese sentido, o el código de la línea si no tiene', () => {
    expect(directionCode(byCode('30QE'), 0)).toBe('30Q');
    expect(directionCode(byCode('30QE'), 1)).toBe('30E');
    expect(directionCode(byCode('23BS'), 1)).toBe('23S');
    expect(directionCode(byCode('201-AU'), 0)).toBe('201-AU');
    expect(directionCode(byCode('02C-Y'), 1)).toBe('02C');
    expect(directionCode(byCode('80J-Y'), 0)).toBe('80J');
    expect(directionCode(byCode('401'), 1)).toBe('401');
    // Un sentido que la línea no tiene: el código de la línea.
    expect(directionCode(byCode('02C-Y'), 0)).toBe('02C-Y');
    // Sin sentido (ambos o Biotrén): el de la línea completa.
    expect(directionCode(byCode('30QE'), null)).toBe('30Q/E');
    expect(directionCode({ code: 'L1' }, null)).toBe('L1');
  });
});
