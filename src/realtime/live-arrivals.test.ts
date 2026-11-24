import { describe, expect, it } from 'vitest';
import {
  INITIAL_LIVE_STATE,
  applyFailure,
  applySnapshot,
  formatAge,
  gpsArrivals,
  htmlToText,
  liveView,
  minutesFromLabel,
  minutesUntil,
  nextPollDelay,
  parseStopInfo,
  indexLiveServices,
  liveServiceLabel,
  liveServiceName,
  liveStopCode,
  onlyUntrackedLines,
  serviceNotes,
  visorServiceName,
  type StopInfoSnapshot,
} from '@/realtime/live-arrivals';
import { stopInfoFixtures } from '@/realtime/live-arrivals.fixtures';
import { GTFS_BUS_ROUTES } from '@/data/gtfs-bus-routes.generated';
import type { Route, RouteDirection } from '@/types/transport';

const NOW = Date.UTC(2026, 10, 24, 12, 0, 0);
const NOW_S = NOW / 1000;
const fixtures = stopInfoFixtures(NOW_S);

function snapshotOf(raw: unknown, fetchedAt = NOW): StopInfoSnapshot {
  const parsed = parseStopInfo(raw, fetchedAt);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.snapshot;
}

describe('parseStopInfo', () => {
  it('lee predicciones, routeInfo y alertas, ordenadas por llegada', () => {
    const snap = snapshotOf(fixtures.withBuses);
    expect(snap.arrivals.map((a) => a.route)).toEqual(['62H', '30Q', '62H', '30Q', '30Q']);
    expect(snap.arrivals[0]).toMatchObject({
      direction: 'I',
      distanceM: 210.7,
      timeLabel: 'Llegando',
      plate: 'PRUE20',
      tripId: '62H_I_L_1325',
      position: { lat: -36.8262, lng: -73.0497 },
      realtime: true,
    });
    // "11R" es una variante urbana: la R no es el sentido.
    expect(snap.routeInfo[0]).toEqual({ route: '11R', direction: null, msg: 'Bus pasa cada 10 minutos aprox.' });
  });

  it('no inventa posición ni patente con datos fuera de rango', () => {
    const base = { route: '10A', direction: 'I', epochTime: NOW_S + 60, realtime: true };
    const snap = snapshotOf({
      predictions: [
        { ...base, latitude: 0, longitude: 0, licensePlate: '???' },
        { ...base, latitude: -33.45, longitude: -70.66, licensePlate: 'ab-cd-12' },
        { ...base, latitude: '-36.82', longitude: '-73.05', licensePlate: 'AB1234', realtime: false },
      ],
    });
    expect(snap.arrivals.map((a) => [a.position, a.plate, a.realtime])).toEqual([
      [null, null, true],
      [null, 'ABCD12', true],
      [{ lat: -36.82, lng: -73.05 }, 'AB1234', false],
    ]);
  });

  it('solo `realtime: true` cuenta como GPS', () => {
    const snap = snapshotOf({
      predictions: ['false', 0, null, undefined, 'true', 1, true].map((realtime, i) => ({
        route: '10A',
        epochTime: NOW_S + 60 + i,
        ...(realtime === undefined ? {} : { realtime }),
      })),
    });
    expect(snap.arrivals.map((a) => a.realtime)).toEqual([false, false, false, false, false, false, true]);
  });

  it('trata como falla lo que no se entiende, no como "sin micros"', () => {
    expect(parseStopInfo(fixtures.unreadable, NOW).ok).toBe(false);
    expect(parseStopInfo('<html>', NOW).ok).toBe(false);
    expect(parseStopInfo(null, NOW).ok).toBe(false);
    expect(parseStopInfo([], NOW).ok).toBe(false);
    expect(parseStopInfo({ alerts: [] }, NOW).ok).toBe(false);
  });

  it('una respuesta vacía es válida y no trae routeInfo', () => {
    const snap = snapshotOf(fixtures.empty);
    expect(snap.arrivals).toEqual([]);
    expect(snap.routeInfo).toEqual([]);
  });

  it('descarta predicciones sin línea o sin forma de saber cuándo llegan', () => {
    const snap = snapshotOf({
      predictions: [
        { direction: 'I', epochTime: NOW_S + 60 },
        { route: '10A', timeLabel: 'sin info' },
        'basura',
        { route: '10A', timeLabel: '+ de 25 min' },
      ],
    });
    expect(snap.arrivals).toHaveLength(1);
    expect(minutesUntil(snap.arrivals[0], NOW)).toBe(25);
  });

  it('pasa las alertas HTML a texto plano', () => {
    const snap = snapshotOf(fixtures.noLiveData);
    expect(snap.alerts).toEqual([
      '🚨 Alerta GPS: Servicio 201AU (Regreso) no está enviando información en tiempo real.',
    ]);
    expect(htmlToText('<b>a&nbsp;&amp;&#233;</b><script>x</script>')).toBe('a &éx');
  });
});

describe('minutos', () => {
  it('desde epochTime: redondeado y nunca negativo', () => {
    const snap = snapshotOf({
      predictions: [
        { route: 'A', epochTime: NOW_S + 89 },
        { route: 'B', epochTime: NOW_S - 60 },
      ],
    });
    expect(snap.arrivals.map((a) => minutesUntil(a, NOW))).toEqual([0, 1]);
  });

  it('sin epochTime usa el primer número de timeLabel ("Llegando" = 0)', () => {
    expect(minutesFromLabel('Llegando')).toBe(0);
    expect(minutesFromLabel('1 a 3 min')).toBe(1);
    expect(minutesFromLabel('+ de 25 min')).toBe(25);
    expect(minutesFromLabel('—')).toBeNull();
  });

  it('descarta la micro que debía pasar hace más de 2 min', () => {
    const state = applySnapshot(
      INITIAL_LIVE_STATE,
      snapshotOf({
        predictions: [
          { route: 'A', epochTime: NOW_S - 90 },
          { route: 'B', epochTime: NOW_S - 150 },
        ],
      }),
    );
    expect(liveView(state, NOW, false).arrivals.map((a) => a.route)).toEqual(['A']);
  });
});

describe('servicio y notas', () => {
  it('nombre canónico: el sentido solo va pegado en interurbanas y Biobús', () => {
    expect(liveServiceName('201AU', 'R')).toBe('201AUR');
    expect(liveServiceName('201 AU', 'I')).toBe('201AUI');
    expect(liveServiceName('401', 'I')).toBe('401I');
    expect(liveServiceName('401I', 'I')).toBe('401I');
    expect(liveServiceName('b02', 'R')).toBe('B02R');
    expect(liveServiceName('401Y', 'I')).toBe('401Y');
    expect(liveServiceName('11R', 'R')).toBe('11R');
    expect(liveServiceName('63I', 'I')).toBe('63I');
    expect(liveServiceName('02C-Y', null)).toBe('02CY');
  });

  it('sin micros + alerta GPS + frecuencia → "sin datos en vivo · pasa cada …"', () => {
    expect(serviceNotes(snapshotOf(fixtures.noLiveData))).toEqual([
      { route: '201AUR', direction: 'R', text: 'sin datos en vivo · pasa cada 1 hora aprox.' },
    ]);
  });

  it('la alerta de otro sentido no marca a esta línea', () => {
    const notes = serviceNotes(
      snapshotOf({
        predictions: [],
        routeInfo: [{ servicio: '201AUI', msg: 'Bus pasa cada 1 hora aprox.' }],
        alerts: fixtures.noLiveData.alerts,
      }),
    );
    expect(notes).toContainEqual({ route: '201AUI', direction: 'I', text: 'pasa cada 1 hora aprox.' });
    expect(notes).toContainEqual({ route: '201AUR', direction: 'R', text: 'sin datos en vivo' });
  });

  it('la alerta urbana da el sentido a la nota de routeInfo', () => {
    const notes = serviceNotes(
      snapshotOf({
        predictions: [],
        routeInfo: [{ servicio: '10K', msg: 'Bus pasa cada 25 minutos aprox.' }],
        alerts: [{ message: 'Alerta GPS: Servicio 10K (Regreso) no está enviando información en tiempo real.' }],
      }),
    );
    expect(notes).toEqual([
      { route: '10K', direction: 'R', text: 'sin datos en vivo · pasa cada 25 minutos aprox.' },
    ]);
  });

  it('la nota se mantiene hasta que vuelven las predicciones de esa línea', () => {
    let state = applySnapshot(INITIAL_LIVE_STATE, snapshotOf(fixtures.noLiveData));
    expect(liveView(state, NOW, false).kind).toBe('no-live-data');
    state = applySnapshot(state, snapshotOf(fixtures.empty, NOW + 30_000));
    expect(state.notes).toHaveLength(1);
    state = applySnapshot(
      state,
      snapshotOf({ predictions: [{ route: '201AU', direction: 'R', epochTime: NOW_S + 600 }] }, NOW + 60_000),
    );
    expect(state.notes).toEqual([]);
  });
});

describe('estados', () => {
  it('con datos', () => {
    const state = applySnapshot(INITIAL_LIVE_STATE, snapshotOf(fixtures.withBuses));
    const view = liveView(state, NOW + 5_000, false);
    expect(view.kind).toBe('live');
    expect(view.arrivals).toHaveLength(5);
  });

  it('una vacía de golpe no reemplaza a la anterior con micros por llegar', () => {
    let state = applySnapshot(INITIAL_LIVE_STATE, snapshotOf(fixtures.withBuses));
    state = applySnapshot(state, snapshotOf(fixtures.empty, NOW + 30_000));
    expect(state.ignoredEmpty).toBe(1);
    expect(state.snapshot?.fetchedAt).toBe(NOW);
    expect(liveView(state, NOW + 30_000, false).kind).toBe('live');
  });

  it('una vacía sí reemplaza cuando las micros anteriores ya pasaron', () => {
    let state = applySnapshot(
      INITIAL_LIVE_STATE,
      snapshotOf({ predictions: [{ route: 'A', epochTime: NOW_S + 30 }] }),
    );
    state = applySnapshot(state, snapshotOf(fixtures.empty, NOW + 4 * 60_000));
    expect(state.ignoredEmpty).toBe(0);
    expect(liveView(state, NOW + 4 * 60_000, false).kind).toBe('empty');
  });

  it('dato viejo pasados 2 min; deja de mostrarse a los 10 min', () => {
    const far = snapshotOf({ predictions: [{ route: 'A', epochTime: NOW_S + 3600 }] });
    const state = applyFailure(applySnapshot(INITIAL_LIVE_STATE, far), 'unavailable');
    expect(liveView(state, NOW + 90_000, false).kind).toBe('live');
    expect(liveView(state, NOW + 3 * 60_000, false)).toMatchObject({ kind: 'stale', lastFailure: 'unavailable' });
    expect(liveView(state, NOW + 11 * 60_000, false).kind).toBe('down');
  });

  it('fuente caída sin dato previo, y fuente sin configurar', () => {
    expect(liveView(applyFailure(INITIAL_LIVE_STATE, 'unavailable'), NOW, false).kind).toBe('down');
    expect(liveView(applyFailure(INITIAL_LIVE_STATE, 'unreadable'), NOW, false).kind).toBe('down');
    expect(liveView(applyFailure(INITIAL_LIVE_STATE, 'unconfigured'), NOW, false).kind).toBe('unconfigured');
    expect(liveView(INITIAL_LIVE_STATE, NOW, true).kind).toBe('loading');
  });

  it('dato vencido sin falla: se espera la consulta, no se dice "sin micros"', () => {
    const state = applySnapshot(INITIAL_LIVE_STATE, snapshotOf(fixtures.withBuses));
    // Pestaña oculta o equipo suspendido 11 min: las micros ni siquiera pasaron.
    for (const loading of [false, true]) {
      expect(liveView(state, NOW + 11 * 60_000, loading)).toMatchObject({ kind: 'loading', arrivals: [], ageMs: null });
    }
  });

  it('micros ya pasadas y la consulta siguiente falló: fuente caída, no "sin micros"', () => {
    let state = applySnapshot(
      INITIAL_LIVE_STATE,
      snapshotOf({ predictions: [{ route: 'A', epochTime: NOW_S + 30, realtime: true }] }),
    );
    state = applyFailure(state, 'unavailable');
    expect(liveView(state, NOW + 4 * 60_000, false)).toMatchObject({ kind: 'down', ageMs: null });
    // Si la fuente había dicho que no venía ninguna, eso sigue valiendo mientras no venza.
    const empty = applyFailure(applySnapshot(INITIAL_LIVE_STATE, snapshotOf(fixtures.empty)), 'unavailable');
    expect(liveView(empty, NOW + 60_000, false)).toMatchObject({ kind: 'empty', lastFailure: 'unavailable' });
  });

  it('las notas "sin datos en vivo" vencen con su dato', () => {
    const state = applySnapshot(INITIAL_LIVE_STATE, snapshotOf(fixtures.noLiveData));
    expect(liveView(state, NOW + 60_000, false).kind).toBe('no-live-data');
    const expired = liveView(state, NOW + 11 * 60_000, false);
    expect(expired.kind).toBe('loading');
    expect(expired.notes).toEqual([]);
    expect(liveView(applyFailure(state, 'unavailable'), NOW + 11 * 60_000, false)).toMatchObject({
      kind: 'down',
      notes: [],
    });
  });

  it('ritmo: 30 s, tras una falla 60 s, tras varias 5 min', () => {
    expect(nextPollDelay(0)).toBe(30_000);
    expect(nextPollDelay(1)).toBe(60_000);
    expect(nextPollDelay(2)).toBe(60_000);
    expect(nextPollDelay(3)).toBe(300_000);
  });

  it('edad legible', () => {
    expect(formatAge(4_000)).toBe('recién');
    expect(formatAge(43_000)).toBe('hace 40 s');
    expect(formatAge(185_000)).toBe('hace 3 min');
  });
});

describe('micros en el mapa', () => {
  it('solo las con GPS y posición, y solo mientras el bloque las muestra', () => {
    const state = applySnapshot(INITIAL_LIVE_STATE, snapshotOf(fixtures.withBuses));
    const plates = (now: number, s = state) => gpsArrivals(liveView(s, now, false)).map((a) => a.plate);
    // Sin la estimada (PRUE21, realtime:false) ni la sin señal (PRUE40, 0,0).
    expect(plates(NOW)).toEqual(['PRUE20', 'PRUE10', 'PRUE30']);
    // La 62H llegaba en 40 s: a los 3 min ya no se dibuja; el resto, con el dato viejo.
    expect(liveView(state, NOW + 3 * 60_000, false).kind).toBe('stale');
    expect(plates(NOW + 3 * 60_000)).toEqual(['PRUE10', 'PRUE30']);
    // Vencido el dato (10 min) no queda ninguna, haya fallado o no la consulta.
    expect(plates(NOW + 11 * 60_000)).toEqual([]);
    expect(plates(NOW + 11 * 60_000, applyFailure(state, 'unavailable'))).toEqual([]);
  });
});

describe('calce con el visor', () => {
  const dir = (directionId: 0 | 1, variant?: string, destination?: string): RouteDirection =>
    ({ directionId, variant, destination, headsign: '', path: [], stops: [] }) as RouteDirection;
  const route = (code: string, directions: RouteDirection[]): Route =>
    ({ id: `r-${code}`, code, color: '#123456', directions }) as unknown as Route;

  it('paradero con solo líneas que la fuente no sigue', () => {
    expect(onlyUntrackedLines([route('302', [dir(0), dir(1)]), route('304', [dir(0), dir(1)])])).toBe(true);
    expect(onlyUntrackedLines([route('302', [dir(0), dir(1)]), route('62HM', [dir(0, '62H'), dir(1, '62M')])])).toBe(false);
    // Sin recorridos conocidos (o solo Biotrén, sin sentidos) no se sabe: se consulta.
    expect(onlyUntrackedLines([])).toBe(false);
    expect(onlyUntrackedLines([route('L1', [])])).toBe(false);
  });

  it('stopCode de la fuente = "P" + stop_id del GTFS', () => {
    expect(liveStopCode('gtfs-stop-37520')).toBe('P37520');
    expect(liveStopCode('gtfs-stop-PV42001')).toBe('PPV42001');
    expect(liveStopCode('gtfs-stop-39592')).toBe('PF-00004');
    expect(liveStopCode('osm-node-123')).toBeNull();
  });

  it('nombre de la fuente para cada sentido del visor', () => {
    expect(visorServiceName('20VA', dir(1, '20A'))).toBe('20A');
    // En 23BS el letrero del GTFS dice 23S en el sentido 0: manda el orden del código.
    expect(visorServiceName('23BS', dir(0, '23S'))).toBe('23B');
    expect(visorServiceName('80J-Y', dir(0, '80J'))).toBe('80JY');
    expect(visorServiceName('201-AU', dir(1))).toBe('201AUR');
    expect(visorServiceName('B02', dir(0))).toBe('B02I');
    expect(visorServiceName('401Y', dir(0))).toBe('401Y');
    expect(visorServiceName('02C-Y', dir(1, '02C'))).toBe('02CY');
    expect(visorServiceName('302', dir(0))).toBeNull();
    expect(visorServiceName('L1', dir(0))).toBeNull();
  });

  it('etiqueta: variante del letrero o código de la línea', () => {
    const index = indexLiveServices([
      route('20VA', [dir(0, '20V'), dir(1, '20A', 'Lomas')]),
      route('401', [dir(0), dir(1)]),
      route('02C-Y', [dir(1, '02C')]),
      route('18PY', [dir(0, '18P'), dir(1, '18Y')]),
    ]);
    expect(index.get('20A')?.direction.destination).toBe('Lomas');
    expect(liveServiceLabel('20A', index.get('20A'))).toBe('20A');
    expect(liveServiceLabel('401I', index.get('401I'))).toBe('401');
    expect(liveServiceLabel('02CY', index.get('02CY'))).toBe('02C-Y');
    expect(liveServiceLabel('18Y', index.get('18Y'))).toBe('18Y');
    expect(liveServiceLabel('421R', undefined)).toBe('421');
    expect(liveServiceLabel('20F', undefined)).toBe('20F');
  });

  // Servicios que publica la fuente (tabla de recorridos de Transapp del
  // 21-nov-2026, leída el 24-nov-2026). Los que no calzan son servicios que
  // el GTFS de DTPR (feb-2025) no tiene con ese nombre.
  const SOURCE_SERVICES = `02A 02CY 02D 02H 02K 02L 02P 10A 10B 10C 10D 10J 10K 10L 10M 10N 10O 10P 10T
    11C 11E 11F 11M 11Q 11R 12A 12B 12Q 12R 13G 13S 14H 14T 14U 14Z 16H 16I 16K 16V 17A 17C 17M 17O 17W
    17X 18P 18Y 201AUI 201AUR 201I 201R 20A 20F 20J 20L 20M 20N 20T 20V 20W 20Z 21B 21Q 22C 22D 22E 22J
    22K 22N 22O 22R 22S 22X 23A 23B 23C 23E 23H 23L 23N 23P 23Q 23S 23T 23V 24F 24M 24R 24T 30B 30C 30D
    30E 30H 30M 30N 30Q 30R 30Z 31D 31F 32E 32G 32J 32K 401I 401R 401Y 40B 40G 40N 40P 411I 411R 41C 41Q
    41R 41V 421I 421R 42F 42H 42U 42W 43J 43T 44A 44B 44E 44U 50P 50S 50SY 50U 50Y 52A 52D 56O 56V 60K
    60L 60M 60X 60Y 60Z 62H 62M 62N 62O 63B 63F 63G 63H 63I 63K 63L 63P 65D 65E 65F 65Q 65R 65S 70F 70FY
    70G 70H 70HY 70I 70J 70K 71I 71Z 72J 72K 72W 72Z 80B 80H 80J 80JY 80K 80L 80Q 80V 80Z 81C 81S 90E
    90J 90X 90Y B02I B02R`.split(/\s+/);

  it('cada servicio de la fuente calza con un sentido del GTFS, salvo los nuevos', () => {
    const routes = GTFS_BUS_ROUTES.map((r) => route(r.ref, (r.directions ?? []) as unknown as RouteDirection[]));
    const index = indexLiveServices(routes);
    expect(SOURCE_SERVICES).toHaveLength(194);
    const unmatched = SOURCE_SERVICES.filter((name) => !index.has(name));
    expect(unmatched).toEqual(['02H', '02L', '20F', '20N', '30H', '30Z', '50SY', '70FY', '70HY', '80B', '80V']);
    // Y ningún sentido del visor queda con dos nombres de la fuente.
    const names = routes.flatMap((r) => (r.directions ?? []).map((d) => visorServiceName(r.code, d)));
    const used = names.filter((n): n is string => n != null);
    expect(new Set(used).size).toBe(used.length);
  });
});
