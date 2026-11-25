import { describe, expect, it } from 'vitest';
import {
  compareRouteCodes,
  directionCode,
  groupByCorridor,
  groupByLine,
  groupDetail,
  isInterurban,
  lineFamily,
  lineOperatorName,
  matchGroupQuery,
  matchesRouteQuery,
  routeCodeKey,
  routeDirectionsLabel,
  routeGroupContext,
  routePillCode,
  routeShortName,
  searchGroups,
} from '@/lib/route-labels';
import { BUS_LINES, interurbanOperator } from '@/data/bus-lines';
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

  it('usa los destinos oficiales de cada sentido, en el orden de las letras de la píldora', () => {
    const name = 'Vía Láctea 10N - Los Bloques - Vía Láctea 10A - Centinela';
    // 10A/N: la A va a Centinela y la N a Los Bloques.
    expect(
      routeShortName({ code: '10AN', name, directions: [direction(1, 'Los Bloques'), direction(0, 'Centinela')] }),
    ).toBe('Centinela ↔ Los Bloques');
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
    // Biobús es la unidad de negocio B0: B01 y B02 son la misma línea.
    expect(lineFamily('B01')).toBe('B0');
    expect(lineFamily('B02')).toBe('B0');
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

// Los recorridos tal como los arma src/data/routes.ts desde el GTFS oficial
// (sin trazados ni paraderos, que la lista no usa).
const GTFS = GTFS_BUS_ROUTES.map((r) => ({
  id: r.id,
  code: r.ref,
  name: r.name,
  operator: lineOperatorName(r.ref, r.operator) ?? interurbanOperator(r.network) ?? 'Operador sin confirmar',
  network: r.network,
  directions: (r.directions ?? []).map(
    (d): RouteDirection => ({
      directionId: d.directionId,
      headsign: d.headsign,
      variant: d.variant,
      destination: d.destination,
      path: [],
      stops: [],
    }),
  ),
}));
const URBAN = GTFS.filter((r) => !isInterurban(r));
const INTERURBAN = GTFS.filter((r) => isInterurban(r));
const LINES = groupByLine(URBAN);
const line = (number: string) => {
  const group = LINES.find((g) => g.number === number);
  if (!group) throw new Error(`sin línea ${number}`);
  return group;
};
const codes = (group: { routes: Array<{ code: string }> }) => group.routes.map((r) => r.code);
const summary = (query: string) =>
  searchGroups(LINES, query).map((g) => `${g.number}:${g.match ?? codes(g).join(',')}`);

describe('routeShortName y routeDirectionsLabel con el GTFS', () => {
  const byRef = (code: string) => GTFS.find((r) => r.code === code)!;

  it('el primer destino es el de la primera letra de la píldora', () => {
    expect(routePillCode(byRef('10AN'))).toBe('10A/N');
    expect(routeShortName(byRef('10AN'))).toBe('Centinela ↔ Los Bloques');
    expect(routePillCode(byRef('14HT'))).toBe('14H/T');
    expect(routeShortName(byRef('14HT'))).toBe('San Vicente ↔ Coquimbo');
    expect(routeShortName(byRef('401'))).toBe('Concepción ↔ Tomé');
  });

  it('dice lo que muestra cada letrero', () => {
    expect(routeDirectionsLabel(byRef('10AN'))).toBe('10A hacia Centinela, 10N hacia Los Bloques');
    expect(routeDirectionsLabel(byRef('80H'))).toBe('80H hacia Hualqui');
    expect(routeDirectionsLabel({ code: 'L1' })).toBeNull();
  });
});

describe('groupByLine', () => {
  it('toda línea urbana del GTFS tiene nombre y comunas curados en bus-lines.ts', () => {
    const curated = new Set(BUS_LINES.map((l) => l.number));
    for (const group of LINES) {
      expect(curated.has(group.number!), `línea ${group.number} (${codes(group).join(', ')})`).toBe(true);
      expect(group.communes.length).toBeGreaterThan(0);
    }
  });

  it('ordena por número de unidad de negocio, como las señales de paradero, con Biobús al final', () => {
    const numbers = LINES.map((g) => g.number);
    expect(numbers.slice(0, 4)).toEqual(['02', '10', '11', '12']);
    expect(numbers.indexOf('18')).toBeLessThan(numbers.indexOf('20'));
    expect(numbers.at(-2)).toBe('90');
    expect(numbers.at(-1)).toBe('B0');
    expect(line('B0').name).toBe('Biobús');
    // Dentro de la línea, por código.
    expect(codes(line('10'))).toEqual(['10AN', '10BO', '10CP', '10DM', '10JL', '10TK']);
  });

  it('nombra la línea por su empresa y no por el letrero del GTFS', () => {
    expect(line('10').name).toBe('Vía Láctea');
    expect(line('14').name).toBe('Chiguayante Sur');
    expect(line('65').name).toBe('Buses Cóndor');
    expect(line('65').operators).toEqual(['Buses Cóndor']);
    expect(groupDetail(line('14'))).toBe('Chiguayante – Talcahuano');
    expect(groupDetail(line('72'))).toBe('Concepción');
  });

  it('en la segunda línea, San Pedro de la Paz va corta para que quepa en un teléfono', () => {
    expect(groupDetail(line('21'))).toBe('San Pedro – Concepción');
    expect(groupDetail(line('20'))).toBe('San Pedro – Talcahuano');
    expect(groupDetail(line('40'))).toBe('Hualpén – San Pedro');
    // La lista completa (el title del encabezado) y la búsqueda siguen con el nombre entero.
    expect(line('21').communes).toContain('San Pedro de la Paz');
  });

  it('separa la 31 y la 32 aunque el letrero diga "Ruta del Mar" en las dos', () => {
    expect(line('31').name).toBe('Ruta del Mar');
    expect(line('32').name).toBe('Buses Ruta del Mar');
    expect(codes(line('31'))).toEqual(['31DF']);
    expect(codes(line('32'))).toEqual(['32EG', '32JK']);
  });

  it('la 50 es una línea con dos letreros: cada fila suelta dice el suyo', () => {
    const fifty = line('50');
    expect(fifty.name).toBe('Campanil y Denavi Sur');
    expect(fifty.operators).toEqual(['Buses Campanil', 'Denavi Sur']);
    const [su, yp] = fifty.routes;
    expect(routeGroupContext(fifty, su)).toBe('50 · Buses Campanil');
    expect(routeGroupContext(fifty, yp)).toBe('50 · Denavi Sur');
    expect(routeGroupContext(line('10'), line('10').routes[0])).toBe('10 · Vía Láctea');
  });

  it('sin nombre curado usa la empresa del letrero', () => {
    const [group] = groupByLine([{ code: '57YP', name: 'x', operator: 'Denavi Sur', network: 'GTFS Gran Concepción' }]);
    expect(group).toMatchObject({ number: '57', name: 'Denavi Sur', communes: [] });
  });
});

describe('lineOperatorName', () => {
  it('la empresa de la línea, no la del letrero, salvo en la 50', () => {
    expect(lineOperatorName('65DQ', 'Buses Condor')).toBe('Buses Cóndor');
    expect(lineOperatorName('31DF', 'Ruta del Mar')).toBe('Ruta del Mar');
    expect(lineOperatorName('32EG', 'Ruta del Mar')).toBe('Buses Ruta del Mar');
    expect(lineOperatorName('B02', 'Biobus')).toBe('Biobús');
    expect(lineOperatorName('50SU', 'Buses Campanil')).toBe('Buses Campanil');
    expect(lineOperatorName('50YP', 'Denavi Sur')).toBe('Denavi Sur');
    // Interurbanos y líneas fuera de la tabla: el del letrero (o ninguno).
    expect(lineOperatorName('401', undefined)).toBeUndefined();
    expect(lineOperatorName('57YP', 'Denavi Sur')).toBe('Denavi Sur');
  });
});

describe('groupByCorridor', () => {
  it('agrupa los interurbanos por corredor, en orden de código, con su operador confirmado', () => {
    const corridors = groupByCorridor(INTERURBAN);
    expect(corridors.map((g) => [g.name, groupDetail(g), codes(g).join(' ')])).toEqual([
      ['Santa Juana', 'Transportes Santa Juana', '201 201-AU'],
      ['Lota', 'Operador sin confirmar', '302 304'],
      ['Tomé', 'Transportes Tomé', '401 401Y 411 421'],
    ]);
    expect(routeGroupContext(corridors[2], corridors[2].routes[0])).toBe('Tomé · Transportes Tomé');
  });
});

describe('matchGroupQuery y searchGroups', () => {
  it('sin búsqueda deja todo', () => {
    expect(searchGroups(LINES, '  ')).toHaveLength(LINES.length);
  });

  it('el número exacto abre la línea entera; el comienzo de un número la deja cerrada', () => {
    expect(summary('14')).toEqual(['14:open']);
    expect(summary('línea 14')).toEqual(['14:open']);
    expect(summary('02')).toEqual(['02:open']);
    expect(summary('2')).toEqual(['02:open', '20:closed', '21:closed', '22:closed', '23:closed', '24:closed']);
    expect(matchGroupQuery(line('B0'), 'b0')).toBe('open');
    expect(summary('1')).toEqual(['10', '11', '12', '13', '14', '16', '17', '18'].map((n) => `${n}:closed`));
  });

  it('la empresa abre la línea entera, con o sin tildes ni espacios', () => {
    expect(summary('via lactea')).toEqual(['10:open']);
    expect(summary('Vía Láctea')).toEqual(['10:open']);
    expect(searchGroups(LINES, 'via lactea')[0].routes).toHaveLength(6);
    expect(summary('condor')).toEqual(['65:open']);
    expect(summary('expreso chiguayante')).toEqual(['17:open']);
    expect(summary('riviera bio bio')).toEqual(['21:open']);
    expect(summary('nueva sotrapel')).toEqual(['12:open']);
    expect(summary('denavi')).toEqual(['50:open']);
    expect(summary('campanil')).toEqual(['50:open']);
    expect(summary('ruta del mar')).toEqual(['31:open', '32:open']);
    expect(summary('biobus')).toEqual(['B0:open']);
  });

  it('una comuna deja cerradas las líneas que la recorren', () => {
    const chiguayante = summary('chiguayante');
    // Las empresas con "Chiguayante" en el nombre, abiertas; las que solo pasan por la comuna, cerradas.
    expect(chiguayante).toContain('14:open');
    expect(chiguayante).toContain('17:open');
    expect(chiguayante).toContain('10:closed');
    expect(chiguayante).toContain('18:closed');
    // La 80L sale de Chiguayante y lo dice su nombre oficial: va suelta.
    expect(chiguayante).toContain('80:80L');
    // Los de la 30 que dicen "Penco" en el letrero van sueltos; en las demás
    // ninguno lo dice (la 62 va a Lirquén, la 50 a Cosmito) y van cerradas.
    expect(summary('penco')).toEqual(['17:closed', '30:30MB,30NC,30QE', '31:closed', '32:closed', '50:closed', '62:closed']);
  });

  it('una comuna muestra sueltos los recorridos cuyo letrero la nombra', () => {
    const hualqui = summary('hualqui');
    expect(hualqui).toContain('80:80H,80J,80J-Y,80K,80Q');
    expect(searchGroups(LINES, 'hualqui').find((g) => g.number === '80')?.match).toBeNull();
  });

  it('un nombre calza desde el comienzo de una palabra, no por un trozo', () => {
    // "Flota" no es Lota: la 43 y la 44 no aparecen.
    expect(summary('lota')).toEqual([]);
    expect(searchGroups(groupByCorridor(INTERURBAN), 'lota').map((g) => [g.name, g.match])).toEqual([['Lota', 'open']]);
    // Dos letras no abren líneas enteras por un trozo de su nombre.
    expect(summary('an').filter((s) => s.endsWith(':open'))).toEqual([]);
  });

  it('lo que empieza como una comuna no abre una empresa que solo empieza igual', () => {
    const hualpen = summary('hualpen');
    expect(hualpen).toContain('02:closed');
    expect(hualpen).toContain('42:closed');
    expect(hualpen.filter((s) => s.endsWith(':open'))).toEqual([]);
    // Con la palabra entera sí.
    expect(summary('hualpencillo')).toContain('42:open');
    expect(summary('chig')).toContain('14:closed');
    expect(summary('san pedro')).toContain('22:open');
  });

  it('un destino o un código deja solo los recorridos que calzan, sueltos', () => {
    // La 70F sale de Centinela (su letrero dice Nonguén): el nombre oficial la nombra.
    expect(summary('centinela')).toEqual(['10:10AN,10JL', '70:70F,70I']);
    expect(summary('10a')).toEqual(['10:10AN']);
    expect(summary('30Q/E')).toEqual(['30:30QE']);
    expect(summary('lirquen')).toEqual(['30:30MB,30NC', '31:31DF', '62:62HM']);
    expect(summary('xyz')).toEqual([]);
  });

  it('los corredores calzan por destino u operador', () => {
    const corridors = groupByCorridor(INTERURBAN);
    expect(searchGroups(corridors, 'tome').map((g) => [g.name, g.match])).toEqual([['Tomé', 'open']]);
    expect(searchGroups(corridors, 'transportes santa juana').map((g) => [g.name, g.match])).toEqual([
      ['Santa Juana', 'open'],
    ]);
    expect(searchGroups(corridors, '201 au').map((g) => [g.name, g.match, codes(g).join()])).toEqual([
      ['Santa Juana', null, '201-AU'],
    ]);
  });
});

describe('matchesRouteQuery con los nombres curados (también ⌘K)', () => {
  const byRef = (code: string) => GTFS.find((r) => r.code === code)!;

  it('encuentra por empresa aunque el letrero la escriba distinto', () => {
    expect(matchesRouteQuery(byRef('65DQ'), 'cóndor')).toBe(true);
    expect(matchesRouteQuery(byRef('17AW'), 'expreso chiguayante')).toBe(true);
    expect(matchesRouteQuery(byRef('21QB'), 'riviera bio bio')).toBe(true);
    expect(matchesRouteQuery(byRef('32EG'), 'buses ruta del mar')).toBe(true);
    expect(matchesRouteQuery(byRef('31DF'), 'buses ruta del mar')).toBe(false);
    expect(matchesRouteQuery(byRef('401'), 'transportes tome')).toBe(true);
    expect(matchesRouteQuery(byRef('14HT'), 'línea 14')).toBe(true);
  });

  it('desde el comienzo de una palabra', () => {
    expect(matchesRouteQuery(byRef('43JT'), 'lota')).toBe(false);
    expect(matchesRouteQuery(byRef('43JT'), 'flota')).toBe(true);
    expect(matchesRouteQuery(byRef('43JT'), 'hualpencillo')).toBe(true);
    expect(matchesRouteQuery(byRef('10AN'), 'bloques')).toBe(true);
    expect(matchesRouteQuery(byRef('10AN'), 'loques')).toBe(false);
  });
});
