import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LAYERS,
  DEFAULT_PREFS,
  historyOpFor,
  landingEntries,
  mergeOnPop,
  parseView,
  pickStep,
  resolveView,
  selectionKey,
  serializeView,
  surfaceLabel,
  type ResolveContext,
  type SerializeContext,
} from '@/lib/view-state';
import type { Selection, ViewPrefs, ViewState } from '@/types/ui-contracts';

// Catálogo mínimo con la forma de los datos reales: 30QE (30Q/30E),
// 10AN (10A/10N) y Biotrén L1, que no tiene sentidos.
const ROUTES = [
  { id: 'gtfs-route-877', code: '30QE', variants: ['30Q', '30E'] },
  { id: 'gtfs-route-835', code: '10AN', variants: ['10A', '10N'] },
  { id: 'bt-l1', code: 'L1', variants: [] as string[] },
];

function findRoute(ref: string): { id: string; directionId?: 0 | 1 } | null {
  const key = ref.toUpperCase();
  for (const r of ROUTES) if (r.id === ref || r.code === key) return { id: r.id };
  for (const r of ROUTES) {
    const i = r.variants.indexOf(key);
    if (i >= 0) return { id: r.id, directionId: i as 0 | 1 };
  }
  return null;
}

function resolveCtx(routesReady = true): ResolveContext {
  return {
    findRoute,
    stopExists: (id) => id === 'gtfs-stop-37477' || id === 'bt-l1-s1',
    terminalExists: (id) => id === 'osm-way-135488014',
    poiExists: (id) => id === 'osm-node-1',
    corridorExists: (id) => id === 'concepcion-florida',
    routesReady,
  };
}

const serializeCtx: SerializeContext = {
  routeCode: (id) => ROUTES.find((r) => r.id === id)?.code ?? null,
  isDefaultLines: (lines) => lines.length === 1 && lines[0] === 'L1',
};

function view(patch: Partial<ViewState> = {}, prefs: Partial<ViewPrefs> = {}): ViewState {
  return {
    selection: null,
    panel: null,
    prefs: { ...DEFAULT_PREFS, ...prefs },
    overlay: null,
    depth: 0,
    backLabel: null,
    ...patch,
  };
}

function read(search: string, historyState: unknown = null, routesReady = true) {
  return resolveView(parseView(search, historyState), resolveCtx(routesReady));
}

const route30: Selection = { kind: 'route', id: 'gtfs-route-877', dir: null, tab: 'info' };
const stop: Selection = { kind: 'stop', id: 'gtfs-stop-37477' };

describe('parseView y serializeView', () => {
  it('ida y vuelta de todos los parámetros', () => {
    const state = view(
      { selection: { kind: 'route', id: 'gtfs-route-877', dir: 1, tab: 'recorrido' }, panel: 'planner' },
      {
        lines: ['30QE', '10AN', 'L1'],
        onlyOperating: true,
        micros: 'gps',
        scope: 'all',
        layers: {
          paraderos: true,
          terminals: true,
          pois: true,
          airQuality: true,
          coverage: true,
          coverageThreshold: 'underserved',
          cycleways: true,
          greenspace: true,
          schools: true,
          corridors: true,
        },
        planner: { a: { lat: -36.82012, lng: -73.04441 }, b: { lat: -36.7, lng: -73.1 } },
      },
    );
    const search = serializeView(state, serializeCtx);
    expect(search).toBe(
      '?route=30QE&dir=1&tab=recorrido&panel=planificador&lineas=30QE,10AN,L1&activos=1&micros=gps&red=1' +
        '&paraderos=1&terminales=1&pois=1&aire=1&cobertura=mal&ciclovias=1&verdes=1&educacion=1&corredores=1' +
        '&a=-36.82012,-73.04441&b=-36.70000,-73.10000',
    );
    expect(read(search).state).toEqual(state);
  });

  it('ida y vuelta de cada selección y de cada panel', () => {
    const selections: Selection[] = [
      { kind: 'stop', id: 'gtfs-stop-37477' },
      { kind: 'terminal', id: 'osm-way-135488014' },
      { kind: 'poi', id: 'osm-node-1' },
      { kind: 'corridor', id: 'concepcion-florida' },
      { kind: 'route', id: 'gtfs-route-835', dir: 0, tab: 'horarios' },
    ];
    for (const selection of selections) {
      const state = view({ selection });
      expect(read(serializeView(state, serializeCtx)).state).toEqual(state);
    }
    for (const panel of ['planner', 'operators', 'quality', 'export', 'wallpaper', 'sources'] as const) {
      const state = view({ panel });
      expect(read(serializeView(state, serializeCtx)).state).toEqual(state);
    }
    const coverageAll = view({}, { layers: { ...DEFAULT_LAYERS, coverage: true } });
    expect(serializeView(coverageAll, serializeCtx)).toBe('?cobertura=1');
    expect(read('?cobertura=1').state).toEqual(coverageAll);
    expect(read('?micros=off').state.prefs.micros).toBe('off');
  });

  it('omite los valores por defecto', () => {
    expect(serializeView(view(), serializeCtx)).toBe('');
    expect(serializeView(view({ selection: route30 }), serializeCtx)).toBe('?route=30QE');
    // Igual al conjunto por defecto: sin `lineas`.
    expect(serializeView(view({}, { lines: ['L1'] }), serializeCtx)).toBe('');
  });

  it('lineas vacío es ninguna y sin el parámetro es el conjunto por defecto', () => {
    expect(read('').state.prefs.lines).toBeNull();
    expect(read('?lineas=').state.prefs.lines).toEqual([]);
    expect(serializeView(view({}, { lines: [] }), serializeCtx)).toBe('?lineas=');
    expect(read('?lineas=30QE,%2010AN%20,30QE').state.prefs.lines).toEqual(['30QE', '10AN']);
  });

  it('lee el sentido solo si es 0 o 1, y la pestaña solo si existe', () => {
    expect(read('?route=gtfs-route-835&dir=1').state.selection).toEqual({
      kind: 'route',
      id: 'gtfs-route-835',
      dir: 1,
      tab: 'info',
    });
    expect(read('?route=gtfs-route-835&dir=2&tab=nada').state.selection).toEqual({
      kind: 'route',
      id: 'gtfs-route-835',
      dir: null,
      tab: 'info',
    });
  });

  it('la variante de un sentido abre su recorrido con ese sentido (?route=10A → dir 0)', () => {
    expect(read('?route=10A').state.selection).toEqual({ kind: 'route', id: 'gtfs-route-835', dir: 0, tab: 'info' });
    expect(read('?route=10N').state.selection).toMatchObject({ dir: 1 });
    // Un `dir` explícito manda sobre el de la variante.
    expect(read('?route=10A&dir=1').state.selection).toMatchObject({ dir: 1 });
  });

  it('convierte el ?focus= del wiki en selección y avisa que hay que sacarlo', () => {
    const fromRoute = parseView('?focus=route:10A', null);
    expect(fromRoute.hadFocus).toBe(true);
    expect(resolveView(fromRoute, resolveCtx()).state.selection).toEqual({
      kind: 'route',
      id: 'gtfs-route-835',
      dir: 0,
      tab: 'info',
    });
    expect(read('?focus=stop:gtfs-stop-37477').state.selection).toEqual(stop);
    expect(read('?focus=corridor:concepcion-florida').state.selection).toEqual({
      kind: 'corridor',
      id: 'concepcion-florida',
    });
    // Códigos con guion o espacios codificados llegan intactos a findRoute.
    expect(parseView('?focus=route:201-AU', null).selection).toMatchObject({ id: '201-AU' });
    expect(parseView('?focus=route:201%20AU', null).selection).toMatchObject({ id: '201 AU' });
    expect(parseView('?focus=nada', null).selection).toBeNull();
    expect(parseView('?focus=avion:1', null).selection).toBeNull();
    // El parámetro explícito gana y focus nunca se vuelve a escribir.
    expect(read('?focus=route:10A&route=gtfs-route-877').state.selection).toMatchObject({ id: 'gtfs-route-877' });
    expect(serializeView(read('?focus=route:10A').state, serializeCtx)).toBe('?route=10AN&dir=0');
  });

  it('ignora A/B mal formados o fuera del Gran Concepción y redondea a 5 decimales', () => {
    expect(read('?a=-36.8,abc&b=-33.45,-70.66').state.prefs.planner).toEqual({ a: null, b: null });
    expect(read('?a=-36.8&b=1,2,3').state.prefs.planner).toEqual({ a: null, b: null });
    expect(read('?a=-36.8201234,-73.0444444').state.prefs.planner.a).toEqual({ lat: -36.82012, lng: -73.04444 });
  });

  it('lee la capa transitoria, la profundidad y el encuadre solo de una entrada del visor', () => {
    const entry = { conce: 1, overlay: 'layers', depth: 2, backLabel: '30Q/E', view: { lat: -36.8, lng: -73, zoom: 13 } };
    const raw = parseView('?route=30QE', entry);
    expect(raw).toMatchObject({ overlay: 'layers', depth: 2, backLabel: '30Q/E', known: true });
    expect(raw.view).toEqual({ lat: -36.8, lng: -73, zoom: 13 });
    const foreign = parseView('?route=30QE', { overlay: 'layers', depth: 4 });
    expect(foreign).toMatchObject({ overlay: null, depth: 0, backLabel: null, known: false, view: null });
    expect(parseView('', { conce: 1, overlay: 'otra', depth: -1, view: { lat: 'x' } })).toMatchObject({
      overlay: null,
      depth: 0,
      view: null,
    });
  });

  it('elegir un punto solo sobrevive encima del planificador', () => {
    expect(read('?panel=planificador', { conce: 1, overlay: 'pick-a', depth: 2 }).state.overlay).toBe('pick-a');
    expect(read('?route=30QE', { conce: 1, overlay: 'pick-a', depth: 2 }).state.overlay).toBeNull();
  });
});

describe('resolveView', () => {
  it('deja pendiente un código de recorrido hasta que llegan los recorridos GTFS', () => {
    const pending = read('?route=30QE', null, false);
    expect(pending.invalid).toEqual([]);
    expect(pending.state.selection).toEqual({ kind: 'route', id: '30QE', dir: null, tab: 'info' });
    // Un id exacto no necesita esperar.
    expect(read('?route=bt-l1', null, false).state.selection).toMatchObject({ id: 'bt-l1' });
    expect(read('?route=NOEXISTE', null, false).invalid).toEqual([]);
  });

  it('informa y saca las referencias que no existen', () => {
    for (const [search, kind, ref] of [
      ['?route=NOEXISTE', 'route', 'NOEXISTE'],
      ['?stop=NOEXISTE', 'stop', 'NOEXISTE'],
      ['?terminal=x', 'terminal', 'x'],
      ['?poi=x', 'poi', 'x'],
      ['?corredor=x', 'corridor', 'x'],
      ['?focus=corridor:x', 'corridor', 'x'],
    ] as const) {
      const { state, invalid } = read(search);
      expect(state.selection).toBeNull();
      expect(invalid).toEqual([{ kind, ref }]);
    }
  });

  it('quita de lineas los códigos desconocidos y los repetidos, recién con los recorridos cargados', () => {
    const { state, invalid } = read('?lineas=30QE,NOEXISTE,gtfs-route-877,L1,OTRA');
    expect(state.prefs.lines).toEqual(['30QE', 'L1']);
    expect(invalid).toEqual([{ kind: 'lines', ref: 'NOEXISTE,OTRA' }]);
    expect(read('?lineas=30QE,NOEXISTE', null, false).state.prefs.lines).toEqual(['30QE', 'NOEXISTE']);
  });
});

describe('historyOpFor', () => {
  const base = view();
  const routeOpen = view({ selection: route30, depth: 1 });

  it('abrir o cambiar de selección es una entrada nueva', () => {
    expect(historyOpFor(base, view({ selection: route30 }))).toBe('push');
    expect(historyOpFor(routeOpen, view({ selection: stop }))).toBe('push');
  });

  it('elegir lo mismo no hace nada; pestaña y sentido se ajustan en la misma entrada', () => {
    expect(historyOpFor(routeOpen, routeOpen)).toBe('none');
    expect(historyOpFor(routeOpen, view({ selection: { ...route30, tab: 'recorrido' } }))).toBe('replace');
    expect(historyOpFor(routeOpen, view({ selection: { ...route30, dir: 1 } }))).toBe('replace');
  });

  it('abrir un panel es una entrada nueva; de panel a panel se reemplaza', () => {
    expect(historyOpFor(base, view({ panel: 'planner' }))).toBe('push');
    expect(historyOpFor(routeOpen, view({ selection: route30, panel: 'quality' }))).toBe('push');
    expect(historyOpFor(view({ panel: 'planner' }), view({ panel: 'quality' }))).toBe('replace');
    expect(historyOpFor(view({ panel: 'quality' }), view({ panel: 'sources' }))).toBe('replace');
  });

  it('elegir un resultado dentro de un panel es una entrada nueva sobre el panel', () => {
    expect(historyOpFor(view({ panel: 'planner' }), view({ selection: route30 }))).toBe('push');
    expect(historyOpFor(view({ selection: stop, panel: 'quality' }), view({ selection: route30 }))).toBe('push');
  });

  it('una capa transitoria se abre con push, cambia con replace y navegar desde ella la reemplaza', () => {
    expect(historyOpFor(routeOpen, { ...routeOpen, overlay: 'layers' })).toBe('push');
    expect(historyOpFor(base, { ...base, overlay: 'sidebar' })).toBe('push');
    const picking = view({ panel: 'planner', overlay: 'pick-a' });
    expect(historyOpFor(picking, { ...picking, overlay: 'pick-b' })).toBe('replace');
    expect(historyOpFor(view({ overlay: 'sidebar' }), view({ selection: route30 }))).toBe('replace');
    expect(historyOpFor(view({ overlay: 'layers' }), view({ panel: 'planner' }))).toBe('replace');
    expect(historyOpFor(view({ overlay: 'layers' }), view())).toBe('replace');
  });

  it('las preferencias se ajustan en la misma entrada', () => {
    expect(historyOpFor(routeOpen, { ...routeOpen, prefs: { ...routeOpen.prefs, micros: 'gps' } })).toBe('replace');
    expect(
      historyOpFor(routeOpen, {
        ...routeOpen,
        prefs: { ...routeOpen.prefs, layers: { ...DEFAULT_LAYERS, paraderos: true } },
      }),
    ).toBe('replace');
    expect(historyOpFor(base, view({}, { lines: [] }))).toBe('replace');
    expect(historyOpFor(base, view({}, { planner: { a: { lat: -36.8, lng: -73 }, b: null } }))).toBe('replace');
    expect(historyOpFor(base, view({}, { ...DEFAULT_PREFS }))).toBe('none');
  });
});

describe('mergeOnPop, landingEntries y selectionKey', () => {
  it('Atrás trae la navegación de la entrada pero mantiene las preferencias de ahora', () => {
    const current = view({ selection: stop, depth: 2, backLabel: '30Q/E' }, { micros: 'gps', lines: ['L1'] });
    const popped = view({ selection: { ...route30, tab: 'recorrido' }, depth: 1 }, { micros: 'schedule' });
    expect(mergeOnPop(current, popped)).toEqual({ ...popped, prefs: current.prefs });
  });

  it('un enlace con algo abierto aterriza sobre una base solo con preferencias', () => {
    const linked = view({ selection: route30, panel: 'planner', overlay: 'layers', depth: 3, backLabel: 'x' }, { micros: 'gps' });
    const { base, push } = landingEntries(linked);
    expect(base).toEqual(view({}, { micros: 'gps' }));
    expect(push).toEqual(view({ selection: route30, panel: 'planner', depth: 1 }, { micros: 'gps' }));
    expect(landingEntries(view({}, { lines: [] }))).toEqual({ base: view({}, { lines: [] }), push: null });
  });

  it('selectionKey ignora pestaña y sentido', () => {
    expect(selectionKey(null)).toBeNull();
    expect(selectionKey(route30)).toBe('route:gtfs-route-877');
    expect(selectionKey({ ...route30, dir: 1, tab: 'horarios' })).toBe('route:gtfs-route-877');
    expect(selectionKey(stop)).toBe('stop:gtfs-stop-37477');
  });
});

describe('pickStep', () => {
  const a = { lat: -36.82, lng: -73.04 };
  const b = { lat: -36.71, lng: -73.11 };

  it('fija A, pasa a B y termina', () => {
    const first = pickStep('pick-a', a, { a: null, b: null });
    expect(first).toEqual({ planner: { a, b: null }, overlay: 'pick-b', done: false });
    const second = pickStep(first.overlay, b, first.planner);
    expect(second).toEqual({ planner: { a, b }, overlay: null, done: true });
  });

  it('con el otro punto ya puesto termina de inmediato', () => {
    expect(pickStep('pick-b', b, { a, b: null })).toEqual({ planner: { a, b }, overlay: null, done: true });
    expect(pickStep('pick-b', b, { a: null, b: null })).toEqual({ planner: { a: null, b }, overlay: 'pick-a', done: false });
    expect(pickStep('pick-a', { lat: -36.8201234, lng: -73.0444444 }, { a: null, b })).toEqual({
      planner: { a: { lat: -36.82012, lng: -73.04444 }, b },
      overlay: null,
      done: true,
    });
  });

  it('sin estar eligiendo no cambia nada', () => {
    expect(pickStep(null, a, { a: null, b: null })).toEqual({ planner: { a: null, b: null }, overlay: null, done: true });
  });
});

describe('surfaceLabel', () => {
  const labels = {
    route: (id: string) => (id === 'gtfs-route-877' ? '30Q/E' : null),
    stop: () => 'O’Higgins esq. Salas',
    terminal: () => 'Terminal Collao',
    poi: () => 'Hospital Regional',
    corridor: () => 'Concepción ↔ Florida',
  };

  it('nombra lo que está a la vista: el panel tapa a la selección', () => {
    expect(surfaceLabel(view(), labels)).toBeNull();
    expect(surfaceLabel(view({ selection: route30 }), labels)).toBe('30Q/E');
    expect(surfaceLabel(view({ selection: stop }), labels)).toBe('O’Higgins esq. Salas');
    expect(surfaceLabel(view({ selection: route30, panel: 'planner' }), labels)).toBe('Planificador');
    expect(surfaceLabel(view({ panel: 'quality' }), labels)).toBe('Calidad de datos');
    expect(surfaceLabel(view({ selection: { kind: 'corridor', id: 'x' } }), labels)).toBe('Concepción ↔ Florida');
  });
});
