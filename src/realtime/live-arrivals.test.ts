import { describe, expect, it } from 'vitest';
import {
  INITIAL_LIVE_STATE,
  applyFailure,
  applySnapshot,
  formatAge,
  htmlToText,
  liveView,
  minutesFromLabel,
  minutesUntil,
  nextPollDelay,
  parseStopInfo,
  serviceNotes,
  splitServicio,
  type StopInfoSnapshot,
} from '@/realtime/live-arrivals';
import { stopInfoFixtures } from '@/realtime/live-arrivals.fixtures';

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
    expect(snap.arrivals.map((a) => a.route)).toEqual(['62H', '30Q', '30Q']);
    expect(snap.arrivals[0]).toMatchObject({ direction: 'R', distanceM: 210.7, timeLabel: 'Llegando' });
    expect(snap.routeInfo[0]).toEqual({ route: '30Q', direction: 'I', msg: 'Bus pasa cada 10 min aprox.' });
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
      '🚨 Alerta GPS: Servicio 201 (Ida) no está enviando información en tiempo real.',
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
  it('separa el sentido pegado al servicio', () => {
    expect(splitServicio('201I')).toEqual({ route: '201', direction: 'I' });
    expect(splitServicio('201AUR')).toEqual({ route: '201AU', direction: 'R' });
    expect(splitServicio('X')).toEqual({ route: 'X', direction: null });
  });

  it('sin micros + alerta GPS + frecuencia → "sin datos en vivo · pasa cada …"', () => {
    expect(serviceNotes(snapshotOf(fixtures.noLiveData))).toEqual([
      { route: '201', direction: 'I', text: 'sin datos en vivo · pasa cada 1 hora aprox.' },
    ]);
  });

  it('la alerta de otro sentido no marca a esta línea', () => {
    const notes = serviceNotes(
      snapshotOf({
        predictions: [],
        routeInfo: [{ servicio: '201R', msg: 'Bus pasa cada 1 hora aprox.' }],
        alerts: fixtures.noLiveData.alerts,
      }),
    );
    expect(notes).toContainEqual({ route: '201', direction: 'R', text: 'pasa cada 1 hora aprox.' });
    expect(notes).toContainEqual({ route: '201', direction: 'I', text: 'sin datos en vivo' });
  });

  it('la nota se mantiene hasta que vuelven las predicciones de esa línea', () => {
    let state = applySnapshot(INITIAL_LIVE_STATE, snapshotOf(fixtures.noLiveData));
    expect(liveView(state, NOW, false).kind).toBe('no-live-data');
    state = applySnapshot(state, snapshotOf(fixtures.empty, NOW + 30_000));
    expect(state.notes).toHaveLength(1);
    state = applySnapshot(
      state,
      snapshotOf({ predictions: [{ route: '201', direction: 'I', epochTime: NOW_S + 600 }] }, NOW + 60_000),
    );
    expect(state.notes).toEqual([]);
  });
});

describe('estados', () => {
  it('con datos', () => {
    const state = applySnapshot(INITIAL_LIVE_STATE, snapshotOf(fixtures.withBuses));
    const view = liveView(state, NOW + 5_000, false);
    expect(view.kind).toBe('live');
    expect(view.arrivals).toHaveLength(3);
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
