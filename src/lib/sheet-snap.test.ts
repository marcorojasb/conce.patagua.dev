import { describe, expect, it } from 'vitest';
import { nextSnap, shownSnap, SNAP_DRAG_PX, toggleSnap } from './sheet-snap';

describe('nextSnap', () => {
  it('subir avanza una altura y se queda en la completa', () => {
    expect(nextSnap('peek', -SNAP_DRAG_PX)).toBe('half');
    expect(nextSnap('half', -80)).toBe('full');
    expect(nextSnap('full', -200)).toBe('full');
  });

  it('bajar retrocede una altura y desde la asomada descarta', () => {
    expect(nextSnap('full', SNAP_DRAG_PX)).toBe('half');
    expect(nextSnap('half', 80)).toBe('peek');
    expect(nextSnap('peek', 120)).toBe('dismiss');
  });

  it('un arrastre corto no cambia nada', () => {
    for (const snap of ['peek', 'half', 'full'] as const) {
      expect(nextSnap(snap, SNAP_DRAG_PX - 1)).toBe(snap);
      expect(nextSnap(snap, -(SNAP_DRAG_PX - 1))).toBe(snap);
      expect(nextSnap(snap, 0)).toBe(snap);
    }
  });
});

describe('shownSnap', () => {
  it('collapsed fuerza la asomada y al terminar vuelve la anterior', () => {
    expect(shownSnap('full', true, null)).toBe('peek');
    expect(shownSnap('full', false, null)).toBe('full');
    expect(shownSnap('half', false, 'full')).toBe('half');
  });

  it('lo que el usuario mueve con la hoja plegada manda mientras dure', () => {
    // Subir desde la asomada plegada muestra la media.
    const moved = nextSnap(shownSnap('full', true, null), -60);
    expect(moved).toBe('half');
    expect(shownSnap('full', true, moved as 'half')).toBe('half');
  });

  it('bajar con la hoja plegada (asomada) descarta', () => {
    expect(nextSnap(shownSnap('half', true, null), 60)).toBe('dismiss');
  });
});

describe('toggleSnap', () => {
  it('la manija alterna entre media y completa y saca de la asomada', () => {
    expect(toggleSnap('peek')).toBe('half');
    expect(toggleSnap('half')).toBe('full');
    expect(toggleSnap('full')).toBe('half');
  });
});
