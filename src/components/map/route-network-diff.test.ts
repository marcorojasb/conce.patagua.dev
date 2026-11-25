import { describe, expect, it } from 'vitest';
import {
  DENSE_NETWORK_STOPS,
  casingColor,
  networkStopsMinZoom,
  planNetworkDiff,
  planNetworkState,
  routeStyleFor,
  stopStyleForZoom,
  topPaintedRef,
} from '@/components/map/route-network-diff';

const all = () => true;

describe('planNetworkState', () => {
  it('dibuja el foco aunque no esté en la red y atenúa el resto', () => {
    const state = planNetworkState(['a', 'b'], { routeIds: ['c'], directionId: null }, 'light', all);
    expect(state.order).toEqual(['a', 'b', 'c']);
    expect(state.entries.get('c')).toEqual({ focus: true, dim: false, directionId: null });
    expect(state.entries.get('a')).toEqual({ focus: false, dim: true, directionId: null });
  });

  it('el sentido solo aplica con un único recorrido en foco', () => {
    const one = planNetworkState(['a', 'b'], { routeIds: ['a'], directionId: 1 }, 'light', all);
    expect(one.entries.get('a')?.directionId).toBe(1);
    expect(one.entries.get('b')?.directionId).toBeNull();
    const two = planNetworkState(['a', 'b'], { routeIds: ['a', 'b'], directionId: 1 }, 'light', all);
    expect(two.entries.get('a')?.directionId).toBeNull();
  });

  it('deja fuera lo que todavía no cargó, sin repetir ids', () => {
    const state = planNetworkState(['a', 'x', 'a'], null, 'light', (id) => id !== 'x');
    expect(state.order).toEqual(['a']);
    expect(state.entries.get('a')).toEqual({ focus: false, dim: false, directionId: null });
  });
});

describe('planNetworkDiff', () => {
  it('desde cero agrega todo', () => {
    const next = planNetworkState(['a', 'b'], null, 'light', all);
    expect(planNetworkDiff(null, next)).toEqual({
      add: ['a', 'b'],
      remove: [],
      restyle: [],
      reshape: [],
      focusChanged: false,
    });
  });

  it('encender y apagar líneas solo toca esas líneas', () => {
    const prev = planNetworkState(['a', 'b'], null, 'light', all);
    const next = planNetworkState(['b', 'c'], null, 'light', all);
    expect(planNetworkDiff(prev, next)).toEqual({
      add: ['c'],
      remove: ['a'],
      restyle: [],
      reshape: [],
      focusChanged: false,
    });
  });

  it('elegir un recorrido reestiliza todos (foco y atenuados) sin recrearlos', () => {
    const prev = planNetworkState(['a', 'b'], null, 'light', all);
    const next = planNetworkState(['a', 'b'], { routeIds: ['a'], directionId: null }, 'light', all);
    const diff = planNetworkDiff(prev, next);
    expect(diff.add).toEqual([]);
    expect(diff.remove).toEqual([]);
    expect(diff.restyle).toEqual(['a', 'b']);
    expect(diff.focusChanged).toBe(true);
  });

  it('un recorrido elegido fuera de la red se agrega y se quita al soltarlo', () => {
    const base = planNetworkState(['a'], null, 'light', all);
    const focused = planNetworkState(['a'], { routeIds: ['z'], directionId: null }, 'light', all);
    expect(planNetworkDiff(base, focused)).toMatchObject({ add: ['z'], restyle: ['a'], focusChanged: true });
    expect(planNetworkDiff(focused, base)).toMatchObject({ remove: ['z'], restyle: ['a'], focusChanged: true });
  });

  it('cambiar el tema reestiliza todo', () => {
    const prev = planNetworkState(['a', 'b'], null, 'light', all);
    const next = planNetworkState(['a', 'b'], null, 'dark', all);
    expect(planNetworkDiff(prev, next).restyle).toEqual(['a', 'b']);
  });

  it('elegir o soltar un sentido cambia el trazado sin reestilizar', () => {
    const both = planNetworkState(['a', 'b'], { routeIds: ['a'], directionId: null }, 'light', all);
    const dir1 = planNetworkState(['a', 'b'], { routeIds: ['a'], directionId: 1 }, 'light', all);
    const dir0 = planNetworkState(['a', 'b'], { routeIds: ['a'], directionId: 0 }, 'light', all);
    expect(planNetworkDiff(both, dir1)).toEqual({ add: [], remove: [], restyle: [], reshape: ['a'], focusChanged: false });
    expect(planNetworkDiff(dir1, dir0).reshape).toEqual(['a']);
    expect(planNetworkDiff(dir1, both).reshape).toEqual(['a']);
  });

  it('sin cambios no hace nada', () => {
    const state = planNetworkState(['a', 'b'], { routeIds: ['a'], directionId: 0 }, 'dark', all);
    const again = planNetworkState(['a', 'b'], { routeIds: ['a'], directionId: 0 }, 'dark', all);
    expect(planNetworkDiff(state, again)).toEqual({ add: [], remove: [], restyle: [], reshape: [], focusChanged: false });
  });
});

describe('routeStyleFor', () => {
  it('usa los pesos y opacidades del plan; el borde normal depende del tema', () => {
    expect(routeStyleFor({ focus: false, dim: false }, 'light')).toEqual({
      casing: { weight: 7, opacity: 0.35 },
      line: { weight: 4, opacity: 0.82 },
      stopOpacity: 1,
    });
    expect(routeStyleFor({ focus: false, dim: false }, 'dark')).toEqual({
      casing: { weight: 7, opacity: 0.5 },
      line: { weight: 4, opacity: 0.82 },
      stopOpacity: 1,
    });
    for (const theme of ['light', 'dark'] as const) {
      expect(routeStyleFor({ focus: true, dim: false }, theme)).toEqual({
        casing: { weight: 10, opacity: 0.7 },
        line: { weight: 6, opacity: 1 },
        stopOpacity: 1,
      });
      expect(routeStyleFor({ focus: false, dim: true }, theme)).toEqual({
        casing: { weight: 7, opacity: 0.08 },
        line: { weight: 4, opacity: 0.16 },
        stopOpacity: 0.25,
      });
    }
  });

  it('borde blanco en claro y casi negro en oscuro', () => {
    expect(casingColor('light')).toBe('#ffffff');
    expect(casingColor('dark')).toBe('#020617');
  });
});

describe('stopStyleForZoom', () => {
  it('parada de micro: 3/1,5 lejos, 4/2 a zoom 14 y 12 px por fuera desde 15', () => {
    expect(stopStyleForZoom(11)).toEqual({ radius: 3, weight: 1.5 });
    expect(stopStyleForZoom(12)).toEqual({ radius: 3, weight: 1.5 });
    expect(stopStyleForZoom(13)).toEqual({ radius: 3, weight: 1.5 });
    expect(stopStyleForZoom(14)).toEqual({ radius: 4, weight: 2 });
    expect(stopStyleForZoom(15)).toEqual({ radius: 5, weight: 2 });
    expect(stopStyleForZoom(18)).toEqual({ radius: 5, weight: 2 });
    const outer = stopStyleForZoom(15);
    expect(2 * (outer.radius + outer.weight / 2)).toBe(12);
  });

  it('estación del Biotrén: aro grueso y siempre más grande que la parada de micro', () => {
    expect(stopStyleForZoom(11, true)).toEqual({ radius: 4, weight: 2.5 });
    expect(stopStyleForZoom(12, true)).toEqual({ radius: 4, weight: 2.5 });
    expect(stopStyleForZoom(13, true)).toEqual({ radius: 5, weight: 3 });
    expect(stopStyleForZoom(14, true)).toEqual({ radius: 6, weight: 3 });
    expect(stopStyleForZoom(15, true)).toEqual({ radius: 7, weight: 3 });
    for (let zoom = 10; zoom <= 19; zoom++) {
      const station = stopStyleForZoom(zoom, true);
      const stop = stopStyleForZoom(zoom);
      expect(station.radius).toBeGreaterThan(stop.radius);
      expect(station.weight).toBeGreaterThan(stop.weight);
    }
  });
});

describe('topPaintedRef', () => {
  it('elige el recorrido pintado más arriba, no el primero que trajo la parada', () => {
    const rank = new Map([
      ['a', 1],
      ['b', 3],
      ['c', 2],
    ]);
    expect(topPaintedRef(['a', 'b', 'c'], rank)).toBe('b');
    expect(topPaintedRef(['c', 'a'], rank)).toBe('c');
    // Subir un trazado al frente (foco) cambia el color del aro de sus paradas compartidas.
    rank.set('a', 4);
    expect(topPaintedRef(['a', 'b', 'c'], rank)).toBe('a');
  });

  it('ignora lo que no tiene rango y sin nada devuelve null', () => {
    expect(topPaintedRef(['x', 'y'], new Map([['y', 1]]))).toBe('y');
    expect(topPaintedRef(['x'], new Map())).toBeNull();
    expect(topPaintedRef([], new Map([['a', 1]]))).toBeNull();
  });
});

describe('networkStopsMinZoom', () => {
  it('con pocas paradas se ven desde zoom 13; con muchas, desde 14', () => {
    expect(networkStopsMinZoom(400)).toBe(13);
    expect(networkStopsMinZoom(DENSE_NETWORK_STOPS)).toBe(13);
    expect(networkStopsMinZoom(DENSE_NETWORK_STOPS + 1)).toBe(14);
  });
});
