import { describe, expect, it } from 'vitest';
import { readableTextOn } from '@/lib/utils';

describe('readableTextOn', () => {
  it('usa texto oscuro sobre los colores claros del GTFS y blanco sobre los oscuros', () => {
    // 302 (celeste), 304 y 421 (verdes claros), 02L-Y (amarillo verdoso).
    for (const light of ['#1de1f0', '#6af926', '#4edb1d', '#c5e416', '#0EA5E9']) {
      expect(readableTextOn(light)).toBe('#111');
    }
    // 401 (morado), 10BO (verde oscuro), 23NT (rojo), 24MF (azul).
    for (const dark of ['#4e0963', '#0d7215', '#ad0101', '#0071ca']) {
      expect(readableTextOn(dark)).toBe('#fff');
    }
  });

  it('entiende hex de 3 dígitos y sin almohadilla', () => {
    expect(readableTextOn('#ff0')).toBe('#111');
    expect(readableTextOn('000')).toBe('#fff');
  });

  it('entiende el hsl() del color por operador, también en tonos amarillos', () => {
    // operatorColor(): hsl(<tono> 70% 45%). El amarillo con blanco quedaba en ~1.9:1.
    expect(readableTextOn('hsl(60 70% 45%)')).toBe('#111');
    expect(readableTextOn('hsl(240, 70%, 45%)')).toBe('#fff');
    expect(readableTextOn('hsl(280deg 70% 45%)')).toBe('#fff');
  });

  it('cae a blanco con un color que no entiende', () => {
    expect(readableTextOn('var(--x)')).toBe('#fff');
    expect(readableTextOn('')).toBe('#fff');
  });
});
