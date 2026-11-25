import { describe, expect, it } from 'vitest';
import { GTFS_BUS_ROUTES } from '@/data/gtfs-bus-routes.generated';
import { ROUTES } from '@/data/routes';
import { readableTextOn } from '@/lib/utils';

/** Contraste WCAG entre dos colores hex de 6 dígitos. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const full = (color: '#fff' | '#000') => (color === '#fff' ? '#ffffff' : '#000000');

describe('readableTextOn', () => {
  it('usa texto oscuro sobre los colores claros del GTFS y blanco sobre los oscuros', () => {
    // 302 (celeste), 304 y 421 (verdes claros), 02L-Y (amarillo verdoso).
    for (const light of ['#1de1f0', '#6af926', '#4edb1d', '#c5e416', '#0EA5E9']) {
      expect(readableTextOn(light)).toBe('#000');
    }
    // 401 (morado), 10BO (verde oscuro), 23NT (rojo), 24MF (azul).
    for (const dark of ['#4e0963', '#0d7215', '#ad0101', '#0071ca']) {
      expect(readableTextOn(dark)).toBe('#fff');
    }
  });

  it('entiende hex de 3 dígitos y sin almohadilla', () => {
    expect(readableTextOn('#ff0')).toBe('#000');
    expect(readableTextOn('000')).toBe('#fff');
  });

  it('entiende el hsl() del color por operador, también en tonos amarillos', () => {
    // operatorColor(): hsl(<tono> 70% 45%). El amarillo con blanco quedaba en ~1.9:1.
    expect(readableTextOn('hsl(60 70% 45%)')).toBe('#000');
    expect(readableTextOn('hsl(240, 70%, 45%)')).toBe('#fff');
    expect(readableTextOn('hsl(280deg 70% 45%)')).toBe('#fff');
  });

  it('cae a blanco con un color que no entiende', () => {
    expect(readableTextOn('var(--x)')).toBe('#fff');
    expect(readableTextOn('')).toBe('#fff');
  });

  it('el texto de cada píldora de recorrido llega a 4.5:1 (WCAG AA)', () => {
    // Incluye los tonos medios que con #111 quedaban cortos: oliva y naranjo.
    const colors = ['#598200', '#ce5504', '#007ab8', ...ROUTES.map((r) => r.color), ...GTFS_BUS_ROUTES.map((r) => r.colour ?? '')];
    expect(colors.length).toBeGreaterThan(100);
    for (const color of colors) {
      if (!/^#[0-9a-f]{6}$/i.test(color)) continue;
      expect(contrast(color, full(readableTextOn(color))), color).toBeGreaterThanOrEqual(4.5);
    }
  });
});
