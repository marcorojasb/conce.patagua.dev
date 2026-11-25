import { beforeAll, describe, expect, it, vi } from 'vitest';
import { GTFS_BUS_ROUTES } from '@/data/gtfs-bus-routes.generated';
import { INTERURBAN_CORRIDORS } from '@/data/interurban-corridors';
import * as routes from '@/data/routes';
import { MAP_THEME } from '@/lib/map-theme';
import { displayRouteColor, inkRouteColor, mixHex, pillRouteColor, routeColorVars } from '@/lib/route-colors';
import { readableTextOn } from '@/lib/utils';
import type { LatLngTuple, Theme } from '@/types/transport';

// Los recorridos GTFS (con la identidad de los interurbanos) llegan con el
// chunk diferido que routes.ts pide al cargar.
beforeAll(async () => {
  await vi.waitFor(() => expect(routes.microRoutesReady).toBe(true), { timeout: 10_000 });
});

const THEMES: Theme[] = ['light', 'dark'];

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** Contraste WCAG entre dos hex de 6 dígitos. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = channels(hex).map(linear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function oklab(hex: string): [number, number, number] {
  const [r, g, b] = channels(hex).map(linear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const deltaE = (a: string, b: string) => {
  const [p, q] = [oklab(a), oklab(b)];
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};

const full = (color: '#fff' | '#000') => (color === '#fff' ? '#ffffff' : '#000000');

/** Todos los colores de origen: los oficiales del GTFS (incluidos los que la identidad reemplaza) y los del visor. */
function sourceColors(): string[] {
  const colors = [...GTFS_BUS_ROUTES.map((r) => r.colour ?? ''), ...routes.ROUTES.map((r) => r.color)];
  return [...new Set(colors.filter((c) => /^#[0-9a-f]{6}$/i.test(c)).map((c) => c.toLowerCase()))];
}

/** Identidad curada (Biotrén e interurbanos), con su variante oscura elegida a mano. */
const curatedColors = () => routes.ROUTES.filter((r) => r.type === 'biotren' || r.officialColor).map((r) => r.color);

describe('displayRouteColor', () => {
  // Origen → claro, oscuro (spec §3.2, prototipo final/colors-final.mjs).
  const GOLDEN: [origin: string, light: string, dark: string][] = [
    ['#0071ca', '#0860ab', '#6cb2fe'],
    ['#0d7215', '#176c1b', '#70c06d'],
    ['#ce5504', '#a14207', '#fa9263'],
    ['#ad0101', '#983026', '#f48474'],
    ['#b10086', '#8f3571', '#e785c3'],
    ['#b38800', '#826202', '#daae42'],
    ['#4e0963', '#6a2e7f', '#c081d9'],
    ['#12ad6d', '#067d4d', '#5ad093'],
    ['#613fa6', '#5f439d', '#ae95f7'],
    ['#a4e617', '#608718', '#a9d46c'],
    ['#c5e416', '#718401', '#bad161'],
    ['#049684', '#017466', '#54c8b5'],
    ['#598200', '#4a6d01', '#94bf59'],
    ['#007ab8', '#01669b', '#58b8fa'],
    // Curados: Biotrén L1 y L2, 302 y 421.
    ['#0284c7', '#0284c7', '#38bdf8'],
    ['#075985', '#075985', '#0ea5e9'],
    ['#258343', '#258343', '#6fd187'],
    ['#0891b2', '#0891b2', '#81dffe'],
  ];

  it.each(GOLDEN)('%s → %s / %s', (origin, light, dark) => {
    expect(displayRouteColor(origin, 'light')).toBe(light);
    expect(displayRouteColor(origin, 'dark')).toBe(dark);
    expect(displayRouteColor(origin.toUpperCase(), 'dark')).toBe(dark);
    expect(inkRouteColor(origin, 'light')).toBe(light);
  });

  it('cada línea llega a 3:1 contra la tierra del mapa y su píldora a 4.5:1, en los dos temas', () => {
    const colors = sourceColors();
    expect(colors.length).toBeGreaterThan(25);
    for (const theme of THEMES) {
      for (const color of colors) {
        const shown = displayRouteColor(color, theme);
        expect(shown, `${color} ${theme}`).toMatch(/^#[0-9a-f]{6}$/);
        expect(contrast(shown, MAP_THEME[theme].land), `${color} ${theme} → ${shown}`).toBeGreaterThanOrEqual(3);
        expect(contrast(shown, full(readableTextOn(shown))), `${color} ${theme} → ${shown}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('la flecha blanca se lee sobre la tinta de cada insignia (3:1), en los dos temas', () => {
    for (const color of sourceColors()) {
      for (const theme of THEMES) {
        expect(contrast('#ffffff', inkRouteColor(color, theme)), `${color} ${theme}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('en oscuro la insignia se parece a su línea más que la tinta clara', () => {
    for (const color of sourceColors()) {
      const line = displayRouteColor(color, 'dark');
      const ink = inkRouteColor(color, 'dark');
      expect(deltaE(ink, line), color).toBeLessThan(deltaE(inkRouteColor(color, 'light'), line));
      // Mismo tono que la línea (≤ 2°) salvo los casi grises.
      const [, a, b] = oklab(line);
      if (Math.hypot(a, b) < 0.02) continue;
      const hue = (hex: string) => {
        const [, x, y] = oklab(hex);
        return (Math.atan2(y, x) * 180) / Math.PI;
      };
      const drift = Math.abs(hue(ink) - hue(line)) % 360;
      expect(Math.min(drift, 360 - drift), color).toBeLessThanOrEqual(2);
    }
    // L1 en oscuro: línea #38bdf8, insignia celeste (no el #0284c7 del tema claro).
    expect(inkRouteColor('#0284c7', 'dark')).toBe('#0198cd');
    expect(inkRouteColor('#0e7490', 'dark')).toBe('#0f84a4');
    // 421, la más clara: el paso la dejaba bajo 3:1 y se baja lo justo.
    expect(inkRouteColor('#0891b2', 'dark')).toBe('#3e9fbd');
  });

  it('conserva el tono del color oficial (≤ 2°)', () => {
    const hue = (hex: string) => {
      const [, a, b] = oklab(hex);
      return (Math.atan2(b, a) * 180) / Math.PI;
    };
    const curated = new Set(curatedColors());
    for (const color of sourceColors()) {
      const [, a, b] = oklab(color);
      if (Math.hypot(a, b) < 0.02 || curated.has(color)) continue;
      for (const theme of THEMES) {
        const drift = Math.abs(hue(displayRouteColor(color, theme)) - hue(color)) % 360;
        expect(Math.min(drift, 360 - drift), `${color} ${theme}`).toBeLessThanOrEqual(2);
      }
    }
  });

  it('colores de origen distintos siguen distintos en cada tema', () => {
    const colors = sourceColors();
    for (const theme of THEMES) {
      expect(new Set(colors.map((c) => displayRouteColor(c, theme))).size, theme).toBe(colors.length);
    }
  });

  it('entiende el hsl() del color por operador y cae a gris con lo que no entiende', () => {
    expect(displayRouteColor('hsl(60 70% 45%)', 'light')).toMatch(/^#[0-9a-f]{6}$/);
    expect(displayRouteColor('hsl(60 70% 45%)', 'dark')).toMatch(/^#[0-9a-f]{6}$/);
    for (const theme of THEMES) {
      const unknown = displayRouteColor('var(--x)', theme);
      expect(unknown).toMatch(/^#[0-9a-f]{6}$/);
      expect(contrast(unknown, MAP_THEME[theme].land)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('identidad curada', () => {
  it('pinta Biotrén en azules e interurbanos por corredor, y guarda el color oficial', () => {
    const byCode = (code: string) => routes.ROUTES.find((r) => r.code === code)!;
    expect(byCode('L1').color).toBe('#0284c7');
    expect(byCode('L2').color).toBe('#075985');
    expect(byCode('302')).toMatchObject({ color: '#258343', officialColor: '#1de1f0' });
    expect(byCode('401').color).toBe(byCode('401Y').color);
    // Las urbanas conservan su route_color oficial.
    const urban = GTFS_BUS_ROUTES.find((r) => r.ref === '10AN')!;
    expect(byCode('10AN')).toMatchObject({ color: urban.colour });
    expect(byCode('10AN').officialColor).toBeUndefined();
  });

  it('las líneas de la vista por defecto que comparten más de 10 km, y sus micros, se distinguen (ΔE OKLab ≥ 0.06)', () => {
    // Grilla de ~65 m: celdas que cruza cada trazado, interpolando cada tramo.
    const cell = (lat: number, lng: number) => `${Math.round(lat / 0.0006)}|${Math.round(lng / 0.00075)}`;
    const cells = (path: LatLngTuple[]) => {
      const set = new Set<string>();
      path.forEach(([lat, lng], i) => {
        set.add(cell(lat, lng));
        const next = path[i + 1];
        if (!next) return;
        const steps = Math.ceil(Math.hypot(next[0] - lat, next[1] - lng) / 0.0003);
        for (let k = 1; k < steps; k++) set.add(cell(lat + ((next[0] - lat) * k) / steps, lng + ((next[1] - lng) * k) / steps));
      });
      return set;
    };
    const visible = routes.DEFAULT_VISIBLE_ROUTE_IDS.map((id) => routes.ROUTES_BY_ID.get(id)!);
    expect(visible.map((r) => r.code)).toEqual(expect.arrayContaining(['L1', 'L2', '201', '302', '401', '421']));
    const grids = visible.map((r) => cells(r.path));
    let pairs = 0;
    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        const [a, b] = [visible[i], visible[j]];
        // Tronco y variante de Tomé: mismo color a propósito.
        if ([a.code, b.code].sort().join('/') === '401/401Y') continue;
        let shared = 0;
        for (const c of grids[i]) if (grids[j].has(c)) shared++;
        if (shared * 0.065 <= 10) continue;
        pairs++;
        for (const theme of THEMES) {
          const d = deltaE(displayRouteColor(a.color, theme), displayRouteColor(b.color, theme));
          expect(d, `${a.code}/${b.code} ${theme}`).toBeGreaterThanOrEqual(0.06);
          // Y sus micros: la insignia también dice de qué línea es (en oscuro
          // las tintas llegaron a quedar a ΔE 0,006 entre 401 y 421).
          const ink = deltaE(inkRouteColor(a.color, theme), inkRouteColor(b.color, theme));
          expect(ink, `${a.code}/${b.code} ${theme} tinta`).toBeGreaterThanOrEqual(0.06);
        }
      }
    }
    // 201/201-AU, 302/304, Tomé, Lota con L2…
    expect(pairs).toBeGreaterThanOrEqual(8);
  });

  it('ningún color curado ni pin de corredor se confunde con GPS en vivo o dato viejo', () => {
    const curated = curatedColors();
    expect(curated.length).toBe(10);
    for (const theme of THEMES) {
      const { live, stale } = MAP_THEME[theme];
      const colors = [...curated.map((c) => displayRouteColor(c, theme)), ...INTERURBAN_CORRIDORS.map((c) => c.color)];
      for (const color of colors) {
        expect(deltaE(color, live), `${color} ${theme} live`).toBeGreaterThanOrEqual(0.03);
        expect(deltaE(color, stale), `${color} ${theme} stale`).toBeGreaterThanOrEqual(0.03);
      }
    }
  });
});

describe('pillRouteColor', () => {
  it('en claro toda píldora lleva texto blanco, y en oscuro, negro', () => {
    for (const color of sourceColors()) {
      const light = pillRouteColor(color, 'light');
      expect(readableTextOn(light), `${color} → ${light}`).toBe('#fff');
      expect(contrast(light, '#ffffff'), `${color} → ${light}`).toBeGreaterThanOrEqual(4.5);
      const dark = pillRouteColor(color, 'dark');
      expect(readableTextOn(dark), `${color} → ${dark}`).toBe('#000');
      expect(contrast(dark, '#000000'), `${color} → ${dark}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('solo oscurece las que no llegaban con blanco (Biotrén L1, 421)', () => {
    expect(pillRouteColor('#0284c7', 'light')).toBe('#057bb9');
    expect(pillRouteColor('#0891b2', 'light')).toBe('#067f9d');
    expect(pillRouteColor('#075985', 'light')).toBe('#075985');
    expect(pillRouteColor('#258343', 'light')).toBe('#258343');
    expect(pillRouteColor('#0284c7', 'dark')).toBe('#38bdf8');
  });
});

describe('routeColorVars', () => {
  it('da el color y el texto legible de cada tema', () => {
    expect(routeColorVars('#258343')).toEqual({
      '--route': '#258343',
      '--route-fg': '#fff',
      '--route-dark': '#6fd187',
      '--route-fg-dark': '#000',
    });
    expect(Object.keys(routeColorVars('hsl(60 70% 45%)')).sort()).toEqual([
      '--route',
      '--route-dark',
      '--route-fg',
      '--route-fg-dark',
    ]);
  });
});

describe('mixHex', () => {
  it('mezcla por canal', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixHex('#258343', '#efefef', 0)).toBe('#258343');
    expect(mixHex('#258343', '#efefef', 1)).toBe('#efefef');
  });
});
