import { describe, expect, it } from 'vitest';
import { gpsMeta, scheduleMeta, scheduleProgramNote } from '@/components/micros-control';
import type { GpsLineStatus, GpsModeView } from '@/types/ui-contracts';

const line = (status: GpsLineStatus['status'], vehicles = 0): GpsLineStatus => ({
  routeId: `r-${status}-${vehicles}`,
  code: '24F',
  color: '#0071ca',
  status,
  vehicles,
});

const view = (patch: Partial<GpsModeView>): GpsModeView => ({
  active: true,
  loading: false,
  failure: null,
  fetchedAt: 0,
  lines: [],
  vehicles: 0,
  stale: 0,
  ...patch,
});

describe('scheduleMeta', () => {
  const idle = { loading: false, error: null, count: 0, nonGtfsCount: 0, urbanCount: 0 };

  it('cuenta las estimadas, en singular y con separador de miles', () => {
    expect(scheduleMeta({ ...idle, count: 171 }, false)).toBe('171 estimadas');
    expect(scheduleMeta({ ...idle, count: 1 }, false)).toBe('1 estimada');
    expect(scheduleMeta({ ...idle, count: 3034 }, false)).toBe('3.034 estimadas');
    expect(scheduleMeta(idle, false)).toBe('0 estimadas');
  });

  it('dice por qué no hay cuenta: sin líneas, horario que no cargó o cargando', () => {
    expect(scheduleMeta({ ...idle, error: 'x', loading: true }, true)).toBe('sin líneas');
    expect(scheduleMeta({ ...idle, error: 'x', loading: true }, false)).toBe('sin horario');
    expect(scheduleMeta({ ...idle, loading: true }, false)).toBe('cargando…');
  });
});

describe('scheduleProgramNote', () => {
  const idle = { loading: false, error: null, count: 0, nonGtfsCount: 0, urbanCount: 0 };

  it('sin micros del GTFS no hay aviso (el Biotrén va por itinerario de EFE)', () => {
    expect(scheduleProgramNote(idle)).toBeNull();
    expect(scheduleProgramNote({ ...idle, count: 12, nonGtfsCount: 12 })).toBeNull();
  });

  it('con pocas micros dice que puede haber otra cantidad, casi siempre menos, y que solo se recortan las de flota conocida', () => {
    const note = scheduleProgramNote({ ...idle, count: 40, nonGtfsCount: 6, urbanCount: 20 });
    expect(note).toMatch(/puede haber otra cantidad de micros, casi siempre menos/);
    expect(note).toMatch(/Solo las líneas con flota conocida/);
  });

  it('si las urbanas pasan de la flota inscrita del perímetro lo dice con la cifra', () => {
    const note = scheduleProgramNote({ ...idle, count: 2981, nonGtfsCount: 12, urbanCount: 2800 });
    expect(note).toMatch(/más micros urbanas que las 1\.894 inscritas en el perímetro: en la calle hay menos/);
    // El total puede pasar de 1.894 con interurbanos sin que las urbanas lo hagan.
    expect(scheduleProgramNote({ ...idle, count: 1950, nonGtfsCount: 12, urbanCount: 1850 })).toMatch(
      /casi siempre menos/,
    );
  });
});

describe('gpsMeta', () => {
  // fetchedAt 0 en las vistas de ejemplo: "ahora" es medio minuto después.
  const NOW = 30_000;
  const text = (v: GpsModeView, now = NOW) => gpsMeta(v, now).text;

  it('cuenta las micros con GPS y aparte las de dato viejo, con un aviso que no depende del texto', () => {
    expect(gpsMeta(view({ lines: [line('live', 5)], vehicles: 5 }), NOW)).toEqual({ text: '5 con GPS', note: '', stale: false });
    expect(gpsMeta(view({ lines: [line('live', 5)], vehicles: 5, stale: 1 }), NOW)).toEqual({
      text: '5 GPS · 1 viejo',
      note: '1 con dato viejo',
      stale: true,
    });
    expect(text(view({ lines: [line('live', 5)], vehicles: 5, stale: 2 }))).toBe('5 GPS · 2 viejos');
  });

  it('dice cuántas de las líneas consultadas tienen GPS (las que la fuente no sigue no cuentan), y el dato viejo va en el aviso', () => {
    const lines = [line('live', 5), line('no-gps'), line('untracked'), line('omitted')];
    expect(text(view({ lines, vehicles: 5 }))).toBe('5 GPS · 1/2 líneas');
    expect(gpsMeta(view({ lines, vehicles: 5, stale: 1 }), NOW)).toEqual({
      text: '5 GPS · 1/2 líneas',
      note: '1 de 2 líneas con GPS · 1 con dato viejo',
      stale: true,
    });
  });

  it('con el dato más nuevo de un minuto o más, dice su edad primero', () => {
    const lines = [line('live', 5), line('no-gps')];
    expect(gpsMeta(view({ lines, vehicles: 5, stale: 1 }), 150_000)).toEqual({
      text: '5 GPS · hace 2 min',
      note: '1 de 2 líneas con GPS · 1 con dato viejo',
      stale: true,
    });
    expect(text(view({ lines: [line('live', 5)], vehicles: 5 }), 59_000)).toBe('5 con GPS');
  });

  it('queda corta (≤ 19 letras; el smoke G13 comprueba que no se corte a 360 px)', () => {
    const lines = [line('live', 12), line('no-gps'), line('untracked'), line('live', 3)];
    expect(text(view({ lines, vehicles: 15, stale: 2 }))).toBe('15 GPS · 2/3 líneas');
    expect(text(view({ lines, vehicles: 15 }), 600_000)).toBe('15 GPS · hace 10 min');
    expect(text(view({ lines, vehicles: 15, stale: 2 })).length).toBeLessThanOrEqual(19);
  });

  it('sin micros dice si busca, si no hay GPS, si falla o si no está activado', () => {
    expect(text(view({ lines: [line('pending')] }))).toBe('buscando…');
    expect(text(view({ lines: [line('no-gps')] }))).toBe('sin GPS aún');
    expect(text(view({ lines: [line('untracked')] }))).toBe('sin GPS');
    expect(text(view({}))).toBe('sin líneas');
    expect(text(view({ lines: [line('unavailable')] }))).toBe('reintentando…');
    expect(text(view({ lines: [line('pending')], failure: 'unconfigured' }))).toBe('no activado');
  });
});
