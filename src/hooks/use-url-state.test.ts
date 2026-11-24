import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearFocusParam, readFocusParam, readUrlState } from '@/hooks/use-url-state';

function stubWindow(search: string) {
  const history = {
    replaceState: vi.fn((_state: unknown, _title: string, url: string) => {
      const [pathname, nextSearch = ''] = url.split('?');
      window.location.pathname = pathname;
      window.location.search = nextSearch ? `?${nextSearch}` : '';
    }),
  };
  vi.stubGlobal('window', {
    location: {
      pathname: '/',
      search,
    },
    history,
  });
  return history;
}

describe('URL state', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads route and layer query params', () => {
    stubWindow('?route=gtfs-route-833&paraderos=1&pois=1&aire=0');

    expect(readUrlState()).toMatchObject({
      route: 'gtfs-route-833',
      paraderos: true,
      pois: true,
      aire: false,
    });
  });

  it('reads the route direction only when it is 0 or 1', () => {
    stubWindow('?route=gtfs-route-835&dir=1');
    expect(readUrlState()).toMatchObject({ route: 'gtfs-route-835', dir: 1 });
    stubWindow('?route=gtfs-route-835&dir=0');
    expect(readUrlState().dir).toBe(0);
    stubWindow('?route=gtfs-route-835&dir=2');
    expect(readUrlState().dir).toBeNull();
  });

  it('reads and clears focus params without dropping other params', () => {
    const history = stubWindow('?focus=route:10A&route=gtfs-route-835');

    expect(readFocusParam()).toEqual({ kind: 'route', id: '10A' });

    clearFocusParam();

    expect(history.replaceState).toHaveBeenCalledWith(null, '', '/?route=gtfs-route-835');
    expect(window.location.search).toBe('?route=gtfs-route-835');
  });

  it('keeps official codes with hyphens or encoded spaces intact in focus params', () => {
    // App resuelve el código (o la variante de un sentido) con findRoute.
    stubWindow('?focus=route:201-AU');
    expect(readFocusParam()).toEqual({ kind: 'route', id: '201-AU' });
    stubWindow('?focus=route:201%20AU');
    expect(readFocusParam()).toEqual({ kind: 'route', id: '201 AU' });
  });
});
