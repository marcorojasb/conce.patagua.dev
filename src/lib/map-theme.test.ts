import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MAP_THEME, POI_COLOR, SCHOOL_COLOR } from '@/lib/map-theme';
import { displayRouteColor } from '@/lib/route-colors';
import { parseColor, readableTextOn } from '@/lib/utils';
import type { Theme } from '@/types/transport';

// El canvas no lee variables CSS: sus constantes repiten las de index.css.
const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

/** Canales 0..255 de una variable HSL (`--x: H S% L%;`) del bloque del tema. */
function cssChannels(theme: Theme, name: string): number[] {
  const block = (theme === 'light' ? /:root\s*\{([^}]*)\}/ : /\.dark\s*\{([^}]*)\}/).exec(css)?.[1] ?? '';
  const value = new RegExp(`${name}:\\s*([^;]+);`).exec(block)?.[1];
  expect(value, `${name} en ${theme}`).toBeDefined();
  const rgb = parseColor(`hsl(${value})`);
  expect(rgb, `${name}: ${value}`).not.toBeNull();
  return rgb!.map((c) => Math.round(c * 255));
}

const hexChannels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

describe('MAP_THEME', () => {
  it.each([
    ['light', 'live', '--live'],
    ['light', 'stale', '--stale'],
    ['light', 'land', '--map-land'],
    ['dark', 'live', '--live'],
    ['dark', 'stale', '--stale'],
    ['dark', 'land', '--map-land'],
  ] as const)('%s.%s es %s de index.css', (theme, key, variable) => {
    const expected = cssChannels(theme, variable);
    const actual = hexChannels(MAP_THEME[theme][key]);
    actual.forEach((channel, i) => expect(Math.abs(channel - expected[i]), `${MAP_THEME[theme][key]} canal ${i}`).toBeLessThanOrEqual(1));
  });
});

describe('colores de lugares y educación', () => {
  it('son los Tailwind 600 de antes con el tono conservado y el croma acotado, y el blanco se lee encima', () => {
    const origin: Record<string, string> = {
      hospital: '#dc2626',
      university: '#2563eb',
      college: '#7c3aed',
      mall: '#ea580c',
      kindergarten: '#f59e0b',
      school: '#dc2626',
    };
    for (const [key, color] of [...Object.entries(POI_COLOR), ...Object.entries(SCHOOL_COLOR)]) {
      expect(color, key).toBe(displayRouteColor(origin[key], 'light'));
      expect(readableTextOn(color), key).toBe('#fff');
    }
  });
});
