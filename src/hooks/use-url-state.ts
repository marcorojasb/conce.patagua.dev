// Two-way sync between a subset of app state and the URL query string.
//
// The URL is the source of truth on first mount (so deep links work) and gets
// overwritten via `history.replaceState` on every state change (no entries
// added to the back stack — selecting a route is not "navigation").

import { useEffect, useRef } from 'react';

export interface UrlState {
  route: string | null;
  stop: string | null;
  terminal: string | null;
  paraderos: boolean;
  activos: boolean;
}

export function readUrlState(): UrlState {
  if (typeof window === 'undefined') {
    return { route: null, stop: null, terminal: null, paraderos: false, activos: false };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    route: p.get('route'),
    stop: p.get('stop'),
    terminal: p.get('terminal'),
    paraderos: p.get('paraderos') === '1',
    activos: p.get('activos') === '1',
  };
}

export function useSyncUrlState(state: UrlState): void {
  // Guard against the very first render — we don't want to wipe a deep link
  // before the app has had a chance to apply it.
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const p = new URLSearchParams();
    if (state.route) p.set('route', state.route);
    if (state.stop) p.set('stop', state.stop);
    if (state.terminal) p.set('terminal', state.terminal);
    if (state.paraderos) p.set('paraderos', '1');
    if (state.activos) p.set('activos', '1');
    const qs = p.toString();
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, [state.route, state.stop, state.terminal, state.paraderos, state.activos]);
}
