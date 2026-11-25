import { describe, expect, it } from 'vitest';
import { readSticky, writeSticky } from './use-sticky-state';

describe('almacén de useStickyState', () => {
  it('el primer montaje siembra el valor inicial (también perezoso)', () => {
    expect(readSticky('test.a', 1)).toBe(1);
    expect(readSticky('test.b', () => ['x'])).toEqual(['x']);
  });

  it('lo escrito sobrevive a desmontar y volver a montar', () => {
    readSticky('test.filter', 'all');
    writeSticky('test.filter', 'error');
    // Un montaje nuevo con otro valor inicial lee lo guardado, no el inicial.
    expect(readSticky('test.filter', 'all')).toBe('error');
  });

  it('cada clave es independiente', () => {
    writeSticky('test.x', 10);
    expect(readSticky('test.y', 20)).toBe(20);
    expect(readSticky('test.x', 0)).toBe(10);
  });
});
