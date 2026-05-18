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
    stubWindow('?route=gtfs-route-1&paraderos=1&pois=1&aire=0');

    expect(readUrlState()).toMatchObject({
      route: 'gtfs-route-1',
      paraderos: true,
      pois: true,
      aire: false,
    });
  });

  it('reads and clears focus params without dropping other params', () => {
    const history = stubWindow('?focus=route:101&route=gtfs-route-1');

    expect(readFocusParam()).toEqual({ kind: 'route', id: '101' });

    clearFocusParam();

    expect(history.replaceState).toHaveBeenCalledWith(null, '', '/?route=gtfs-route-1');
    expect(window.location.search).toBe('?route=gtfs-route-1');
  });
});
