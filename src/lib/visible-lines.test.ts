import { describe, expect, it } from 'vitest';
import {
  hiddenByFilter,
  linesEqualDefault,
  resolveLines,
  setLinesVisible,
  toggleLine,
  type LinesCatalog,
} from '@/lib/visible-lines';
import type { Route, RouteDirection } from '@/types/transport';

function route(id: string, code: string, variants: string[] = []): Route {
  const directions: RouteDirection[] = variants.map((variant, i) => ({
    directionId: i as 0 | 1,
    headsign: variant,
    variant,
    path: [],
    stops: [],
  }));
  return {
    id,
    code,
    name: code,
    type: code.startsWith('L') ? 'biotren' : 'micro',
    color: '#000',
    operator: '',
    headway: '',
    hours: '',
    frequencyByDay: {},
    stops: [],
    path: [],
    directions: directions.length > 0 ? directions : undefined,
  };
}

// Antes del chunk GTFS solo está el Biotrén; al llegar, ROUTES y el conjunto
// por defecto crecen en el lugar (los interurbanos entran a lo visible).
function catalogs() {
  const routes: Route[] = [route('bt-l1', 'L1'), route('bt-l2', 'L2')];
  const defaultIds = ['bt-l1', 'bt-l2'];
  const catalog: LinesCatalog = { routes, defaultIds };
  const land = () => {
    routes.push(route('gtfs-route-877', '30QE', ['30Q', '30E']), route('gtfs-route-1', '201-AU'), route('gtfs-route-835', '10AN', ['10A', '10N']));
    defaultIds.push('gtfs-route-1');
  };
  return { catalog, land };
}

describe('resolveLines', () => {
  it('sin lista usa el conjunto por defecto, que crece al llegar el chunk GTFS', () => {
    const { catalog, land } = catalogs();
    expect(resolveLines(null, catalog)).toEqual({ ids: ['bt-l1', 'bt-l2'], unknown: [] });
    land();
    expect(resolveLines(null, catalog)).toEqual({ ids: ['bt-l1', 'bt-l2', 'gtfs-route-1'], unknown: [] });
  });

  it('resuelve códigos, variantes e ids en orden de agregado y reporta los desconocidos', () => {
    const { catalog, land } = catalogs();
    land();
    expect(resolveLines(['30QE', 'L1', '201 AU', '10N', 'gtfs-route-877', 'NOEXISTE'], catalog)).toEqual({
      ids: ['gtfs-route-877', 'bt-l1', 'gtfs-route-1', 'gtfs-route-835'],
      unknown: ['NOEXISTE'],
    });
    expect(resolveLines([], catalog)).toEqual({ ids: [], unknown: [] });
  });
});

describe('toggleLine y setLinesVisible', () => {
  it('materializan el conjunto por defecto y escriben códigos', () => {
    const { catalog, land } = catalogs();
    land();
    expect(toggleLine(null, 'gtfs-route-877', catalog)).toEqual(['L1', 'L2', '201-AU', '30QE']);
    expect(toggleLine(null, 'bt-l2', catalog)).toEqual(['L1', '201-AU']);
    expect(toggleLine(['30QE', 'L1'], 'gtfs-route-877', catalog)).toEqual(['L1']);
    expect(toggleLine([], 'bt-l1', catalog)).toEqual(['L1']);
  });

  it('agrega al final sin repetir y quita varias a la vez', () => {
    const { catalog, land } = catalogs();
    land();
    expect(setLinesVisible(['30QE'], ['bt-l1', 'gtfs-route-877', 'gtfs-route-835'], true, catalog)).toEqual([
      '30QE',
      'L1',
      '10AN',
    ]);
    expect(setLinesVisible(null, ['bt-l1', 'gtfs-route-1'], false, catalog)).toEqual(['L2']);
  });
});

describe('hiddenByFilter', () => {
  it('devuelve las visibles que no operan ahora', () => {
    const operating = new Set(['a', 'c']);
    expect(hiddenByFilter(['a', 'b', 'c', 'd'], (id) => operating.has(id))).toEqual(new Set(['b', 'd']));
    expect(hiddenByFilter([], () => false)).toEqual(new Set());
  });
});

describe('linesEqualDefault', () => {
  it('compara como conjunto y solo con los recorridos ya cargados', () => {
    const { catalog, land } = catalogs();
    expect(linesEqualDefault(null, catalog, false)).toBe(true);
    // Antes del chunk "L1,L2" es una elección explícita: no se pierde de la URL.
    expect(linesEqualDefault(['L1', 'L2'], catalog, false)).toBe(false);
    land();
    expect(linesEqualDefault(['201-AU', 'L2', 'L1'], catalog, true)).toBe(true);
    expect(linesEqualDefault(['L1', 'L2'], catalog, true)).toBe(false);
    expect(linesEqualDefault(['L1', 'L2', '201-AU', 'NOEXISTE'], catalog, true)).toBe(false);
    expect(linesEqualDefault([], catalog, true)).toBe(false);
  });
});
