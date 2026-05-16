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
  poi: string | null;
  paraderos: boolean;
  activos: boolean;
  pois: boolean;
  aire: boolean;
}

/**
 * Deep-link de "enfoque inicial" usado por el wiki para navegar al visor
 * con una entidad ya centrada (ej.: `?focus=corridor:ruta-201`).
 * Se lee una sola vez en mount y se limpia del query string después de
 * aplicar el flyTo — no tiene sentido mantenerlo en la URL durante toda
 * la sesión porque el visor ya sincroniza `route`/`stop`/`terminal` por
 * separado.
 */
export type FocusKind = 'route' | 'corridor' | 'terminal' | 'stop' | 'poi';
export interface FocusParam {
  kind: FocusKind;
  id: string;
}

export function readFocusParam(): FocusParam | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('focus');
  if (!raw) return null;
  const colon = raw.indexOf(':');
  if (colon <= 0) return null;
  const kind = raw.slice(0, colon) as FocusKind;
  const id = raw.slice(colon + 1);
  if (!id) return null;
  if (
    kind !== 'route' &&
    kind !== 'corridor' &&
    kind !== 'terminal' &&
    kind !== 'stop' &&
    kind !== 'poi'
  ) {
    return null;
  }
  return { kind, id };
}

/** Elimina `?focus=…` del query string sin generar entrada en el back stack. */
export function clearFocusParam(): void {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams(window.location.search);
  if (!p.has('focus')) return;
  p.delete('focus');
  const qs = p.toString();
  const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', next);
}

export function readUrlState(): UrlState {
  if (typeof window === 'undefined') {
    return {
      route: null,
      stop: null,
      terminal: null,
      poi: null,
      paraderos: false,
      activos: false,
      pois: false,
      aire: false,
    };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    route: p.get('route'),
    stop: p.get('stop'),
    terminal: p.get('terminal'),
    poi: p.get('poi'),
    paraderos: p.get('paraderos') === '1',
    activos: p.get('activos') === '1',
    pois: p.get('pois') === '1',
    aire: p.get('aire') === '1',
  };
}

export function useSyncUrlState(state: UrlState): void {
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
    if (state.poi) p.set('poi', state.poi);
    if (state.paraderos) p.set('paraderos', '1');
    if (state.activos) p.set('activos', '1');
    if (state.pois) p.set('pois', '1');
    if (state.aire) p.set('aire', '1');
    const qs = p.toString();
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, [
    state.route,
    state.stop,
    state.terminal,
    state.poi,
    state.paraderos,
    state.activos,
    state.pois,
    state.aire,
  ]);
}
