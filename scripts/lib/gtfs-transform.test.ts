import { describe, expect, it } from 'vitest';
import {
  addTripStopTime,
  cleanText,
  emptyTripWindow,
  feedVersionDate,
  finishTripWindow,
  formatGtfsDate,
  mostCommonKey,
  correctTripHeadsign,
  parseHeadsign,
  routeNetwork,
  routeOperator,
  serviceDaysFromCalendar,
  serviceWindow,
  stopNameAndRef,
  URBAN_NETWORK,
} from './gtfs-transform.ts';
import { parseGtfsTime } from './gtfs-zip.ts';

describe('parseHeadsign', () => {
  it('separa operador, variante y destino', () => {
    expect(parseHeadsign('Vía Láctea 10P - Leonera')).toEqual({
      operator: 'Vía Láctea',
      variant: '10P',
      destination: 'Leonera',
    });
    expect(parseHeadsign('San Pedro del Mar 23S -  Av. Michaihue')).toEqual({
      operator: 'San Pedro del Mar',
      variant: '23S',
      destination: 'Av. Michaihue',
    });
    expect(parseHeadsign('Buses Hualpencillo 42F -   Prat con Freire')).toEqual({
      operator: 'Buses Hualpencillo',
      variant: '42F',
      destination: 'Prat con Freire',
    });
    expect(parseHeadsign('Biobús B02 - Casino Marina del Sol')).toEqual({
      operator: 'Biobús',
      variant: 'B02',
      destination: 'Casino Marina del Sol',
    });
  });

  it('no confunde palabras del operador con la variante', () => {
    expect(parseHeadsign('Vía Siglo XXI 13G - Pta. Leones').operator).toBe('Vía Siglo XXI');
    expect(parseHeadsign('Chiguayante Sur 14T -  Coquimbo').operator).toBe('Chiguayante Sur');
    expect(parseHeadsign('Las Galaxias San Vicente - Hualqui')).toEqual({ destination: 'Hualqui' });
  });

  it('interurbanos: solo variante o solo destino', () => {
    expect(parseHeadsign('201-AU - Santa Juana')).toEqual({ variant: '201-AU', destination: 'Santa Juana' });
    expect(parseHeadsign('201 - Concepción')).toEqual({ variant: '201', destination: 'Concepción' });
    expect(parseHeadsign('Tomé ')).toEqual({ destination: 'Tomé' });
  });
});

describe('routeOperator', () => {
  it('usa el operador solo si es el mismo en todos los headsigns que lo traen', () => {
    expect(routeOperator(['Vía Láctea 10P - Leonera', 'Vía Láctea 10C -  Las Canchas'])).toBe('Vía Láctea');
    expect(routeOperator(['Vía Láctea 10P - Leonera', 'Sotrapel 12A - Leonera'])).toBeUndefined();
    expect(routeOperator(['201 - Concepción', '201 - Santa Juana'])).toBeUndefined();
    expect(routeOperator(['Concepción', 'Las Bahías 70I -  Centinela'])).toBe('Las Bahías');
  });
});

describe('routeNetwork', () => {
  it('etiqueta los interurbanos del feed y deja el resto como red urbana', () => {
    expect(routeNetwork('201-AU')).toBe('Interurbano Santa Juana');
    expect(routeNetwork('401Y')).toBe('Interurbano Tomé');
    expect(routeNetwork('304')).toBe('Interurbano Lota');
    expect(routeNetwork('B02')).toBe(URBAN_NETWORK);
    expect(routeNetwork('10CP')).toBe(URBAN_NETWORK);
  });
});

describe('stopNameAndRef', () => {
  it('sin stop_code (casi todo el feed) no hay ref', () => {
    expect(stopNameAndRef('Av. Collao -  Juan Bosco', '', '50040')).toEqual({ name: 'Av. Collao - Juan Bosco' });
    expect(stopNameAndRef('', undefined, '50040')).toEqual({ name: 'Paradero 50040' });
  });

  it('un código de verdad queda como ref', () => {
    expect(stopNameAndRef('Los Carrera', 'PC1234', '1')).toEqual({ name: 'Los Carrera', ref: 'PC1234' });
    expect(stopNameAndRef('', '1506365', '1')).toEqual({ name: 'Paradero 1506365', ref: '1506365' });
  });

  it('las calles que DTPR dejó en stop_code van al nombre', () => {
    expect(stopNameAndRef('Plaza de Armas', 'Entre San Martin y Bulnes', '38646')).toEqual({
      name: 'Plaza de Armas (Entre San Martin y Bulnes)',
    });
    expect(stopNameAndRef('', 'entre Av. Collao esq Juan Bosco', '35203')).toEqual({
      name: 'entre Av. Collao esq Juan Bosco',
    });
  });
});

describe('serviceDaysFromCalendar', () => {
  const row = (flags: string) => {
    const [monday, tuesday, wednesday, thursday, friday, saturday, sunday] = flags.split('');
    return { service_id: 'X', monday, tuesday, wednesday, thursday, friday, saturday, sunday };
  };

  it('mapea L/S/D de DTPR a días lunes..domingo', () => {
    expect(serviceDaysFromCalendar(row('1111100'))).toEqual([true, true, true, true, true, false, false]);
    expect(serviceDaysFromCalendar(row('0000010'))).toEqual([false, false, false, false, false, true, false]);
    expect(serviceDaysFromCalendar(row('0000001'))).toEqual([false, false, false, false, false, false, true]);
  });

  it('rechaza flags que no son 0/1', () => {
    expect(() => serviceDaysFromCalendar(row('111110 '))).toThrow(/sunday/);
  });
});

describe('ventana de un viaje', () => {
  type Row = [sequence: number, arrival: string, departure: string];
  const windowOf = (rows: Row[]) => {
    const acc = emptyTripWindow();
    for (const [sequence, arrival, departure] of rows) {
      addTripStopTime(acc, sequence, parseGtfsTime(arrival), parseGtfsTime(departure));
    }
    return finishTripWindow(acc);
  };

  it('va de la primera salida a la última llegada, ignorando horas vacías', () => {
    const rows: Row[] = [
      [1, '06:50:00', '06:50:00'],
      [2, '', ''],
      [3, '07:05:00', '07:05:00'],
      [4, '', ''],
    ];
    expect(windowOf(rows)).toEqual({ ok: true, startMin: 410, durationMin: 15 });
    expect(windowOf([...rows].reverse())).toEqual({ ok: true, startMin: 410, durationMin: 15 });
  });

  it('una primera parada sin hora no se lee como medianoche', () => {
    expect(
      windowOf([
        [1, '', ''],
        [2, '06:50:00', '06:52:00'],
        [3, '07:30:00', ''],
      ]),
    ).toEqual({ ok: true, startMin: 412, durationMin: 38 });
  });

  it('admite viajes después de medianoche (> 24 h)', () => {
    expect(
      windowOf([
        [1, '23:50:00', '23:50:00'],
        [2, '24:40:30', '24:40:30'],
      ]),
    ).toEqual({ ok: true, startMin: 1430, durationMin: 51 });
  });

  it('descarta solo viajes rotos', () => {
    expect(windowOf([[1, '', '']])).toEqual({ ok: false, reason: 'sin horas' });
    expect(windowOf([[1, '07:00:00', '07:00:00']])).toEqual({ ok: false, reason: 'duración ≤ 0' });
    expect(
      windowOf([
        [1, '08:00:00', '08:00:00'],
        [2, '07:00:00', '07:00:00'],
      ]),
    ).toEqual({ ok: false, reason: 'duración ≤ 0' });
    expect(
      windowOf([
        [1, '05:00:00', '05:00:00'],
        [2, '11:01:00', '11:01:00'],
      ]),
    ).toEqual({ ok: false, reason: 'duración > 6 h' });
    expect(
      windowOf([
        [1, '05:00:00', '05:00:00'],
        [2, '11:00:00', '11:00:00'],
      ]),
    ).toEqual({ ok: true, startMin: 300, durationMin: 360 });
  });
});

describe('serviceWindow', () => {
  it('deduplica, usa la mediana superior y solo intervalos de 1 a 180 min', () => {
    expect(serviceWindow([420, 400, 400, 430, 700])).toEqual([400, 700, 20, 4]);
    expect(serviceWindow([1467])).toEqual([1467, 1467, 0, 1]);
    expect(serviceWindow([])).toBeNull();
  });
});

describe('utilidades', () => {
  it('mostCommonKey desempata por la clave menor', () => {
    expect(mostCommonKey(new Map([['b', 2], ['a', 2], ['c', 1]]))).toBe('a');
    expect(mostCommonKey(new Map())).toBeUndefined();
  });

  it('fechas y texto del feed', () => {
    expect(formatGtfsDate('20251231')).toBe('2025-12-31');
    expect(formatGtfsDate('2025-12-31')).toBeNull();
    expect(feedVersionDate('Gran Concepción20250228')).toBe('2025-02-28');
    expect(feedVersionDate('v1')).toBeNull();
    expect(cleanText('  Los Manios esq Av San Pedro  Norte ')).toBe('Los Manios esq Av San Pedro Norte');
  });
});

describe('correctTripHeadsign', () => {
  it('endereza la variante cruzada y deja el destino', () => {
    expect(correctTripHeadsign('02AD', 0, 'Hualpensan 02D - Mirador del Pacífico')).toBe(
      'Hualpensan 02A - Mirador del Pacífico',
    );
    expect(correctTripHeadsign('02AD', 1, 'Hualpensan 02A - Parque empresarial Biobio')).toBe(
      'Hualpensan 02D - Parque empresarial Biobio',
    );
  });

  it('en 23BS endereza también el destino', () => {
    expect(correctTripHeadsign('23BS', 0, 'San Pedro del Mar 23S - Av. Michaihue')).toBe(
      'San Pedro del Mar 23B - Terminal Collao',
    );
    expect(correctTripHeadsign('23BS', 1, 'San Pedro del Mar 23B - Terminal Collao')).toBe(
      'San Pedro del Mar 23S - Av. Michaihue',
    );
  });

  it('no toca letreros que ya vienen bien ni otras líneas', () => {
    expect(correctTripHeadsign('23BS', 0, 'San Pedro del Mar 23B - Terminal Collao')).toBe(
      'San Pedro del Mar 23B - Terminal Collao',
    );
    expect(correctTripHeadsign('10AN', 0, 'Vía Láctea 10A - Centinela')).toBe('Vía Láctea 10A - Centinela');
  });
});
