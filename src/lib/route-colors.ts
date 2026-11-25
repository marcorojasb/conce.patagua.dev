// Color de pantalla de un recorrido, por tema.
//
// Los `route_color` del GTFS de la DTPR van de L 0,32 a 0,87 y C hasta 0,26
// en OKLCH (verdes lima, morados, cian): ningún color único llega a 3:1 sobre
// los dos mapas base (tierra clara #efefef, oscura #474749). Por eso se
// conserva el tono del color oficial y se fija la luminosidad por tema
// (claro 0,42–0,58, oscuro 0,70–0,82), con el croma acotado a 0,04–0,14.
// Biotrén e interurbanos traen identidad curada (routes.ts) y su variante
// oscura va en CURATED_DARK.
//
// Límites conocidos: sobre el agua clara (#d0cfd4) algunas líneas quedan bajo
// 3:1 (421 2,38; L1 2,64), y hay urbanas con el mismo `route_color` oficial
// que comparten calle: entre urbanas lo que las distingue es la leyenda, el
// tooltip y el foco, no el color.

import type { CSSProperties } from 'react';
import { parseColor, readableTextOn } from '@/lib/utils';
import type { Theme } from '@/types/transport';

// Identidad clara → oscura. Interurbanos: L_dark = 0,66 + 1,1·(L − 0,43),
// C_dark = min(C + 0,01; 0,14), mismo tono, redondeados. Biotrén a mano: la
// regla dejaba L2 apagado.
const CURATED_DARK: Record<string, string> = {
  '#0284c7': '#38bdf8', // Biotrén L1
  '#075985': '#0ea5e9', // Biotrén L2
  '#0f766e': '#5cc1b7', // 201
  '#115e59': '#53a59e', // 201-AU
  '#258343': '#6fd187', // 302
  '#126635': '#59ae74', // 304
  '#0e7490': '#5dbfe1', // 401 y 401Y
  '#155e75': '#57a5c1', // 411
  '#0891b2': '#81dffe', // 421
};

const UNKNOWN_COLOR = '#71717a';

const LIGHTNESS: Record<Theme, [min: number, max: number]> = {
  light: [0.42, 0.58],
  dark: [0.7, 0.82],
};

type Rgb = [number, number, number];

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklab(rgb: Rgb): Rgb {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab a sRGB lineal (sin acotar: sirve para saber si cae fuera de gamut). */
function oklabToLinearRgb([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function rgbToHex(rgb: Rgb): string {
  return `#${rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, '0')).join('')}`;
}

const inGamut = (linear: Rgb) => linear.every((c) => c >= -1e-4 && c <= 1 + 1e-4);

/** OKLCH (L, C, tono en radianes) de un color que parseColor entiende; gris medio si no. */
function toOklch(color: string): Rgb {
  const [L, a, b] = rgbToOklab(parseColor(color) ?? (parseColor(UNKNOWN_COLOR) as Rgb));
  return [L, Math.hypot(a, b), Math.atan2(b, a)];
}

/** OKLCH → hex, bajando el croma de a 0,002 hasta caber en sRGB (conserva L y tono). */
function fromOklch(L: number, C: number, hue: number): string {
  for (; C > 0; C -= 0.002) {
    const linear = oklabToLinearRgb([L, C * Math.cos(hue), C * Math.sin(hue)]);
    if (inGamut(linear)) return rgbToHex(linear.map(fromLinear) as Rgb);
  }
  return rgbToHex(oklabToLinearRgb([L, 0, 0]).map(fromLinear) as Rgb);
}

/** Luminancia relativa WCAG de un hex. */
function luminance(hex: string): number {
  const [r, g, b] = (parseColor(hex) as Rgb).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Baja la luminosidad OKLCH (mismo tono y croma) de a 0,005 hasta que `ok` se cumpla. */
function darkenUntil(hex: string, ok: (candidate: string) => boolean): string {
  let [L] = toOklch(hex);
  const [, C, hue] = toOklch(hex);
  let out = hex;
  while (!ok(out) && L > 0.2) {
    L -= 0.005;
    out = fromOklch(L, C, hue);
  }
  return out;
}

function normalize(color: string, theme: Theme): string {
  const key = color.trim().toLowerCase();
  const curated = CURATED_DARK[key];
  if (curated) return theme === 'light' ? key : curated;

  const [L0, C0, hue] = toOklch(color);
  const t = (Math.min(0.87, Math.max(0.32, L0)) - 0.32) / 0.55;
  const [lo, hi] = LIGHTNESS[theme];
  // Los grises quedan grises; el resto, ni apagado ni chillón.
  return fromOklch(lo + (hi - lo) * t, C0 < 0.02 ? C0 : Math.min(0.14, Math.max(0.04, C0)), hue);
}

const cache = new Map<string, string>();

/** Color con que se dibuja la línea en el tema (trazado, aro de parada, píldora, muestra). `#rrggbb`. */
export function displayRouteColor(color: string, theme: Theme): string {
  return memo(`${theme}|${color}`, () => normalize(color, theme));
}

function memo(key: string, compute: () => string): string {
  let out = cache.get(key);
  if (out === undefined) {
    out = compute();
    cache.set(key, out);
  }
  return out;
}

/** Paso de luminosidad OKLCH de la tinta oscura sobre la clara (fix-2). */
const DARK_INK_LIFT = 0.05;

/**
 * Relleno de la insignia de micro, siempre con aro y flecha blancos (≥ 3:1).
 * En claro es el color de la línea. En oscuro, el tono y el croma de la
 * línea oscura con la luminosidad de la tinta clara más un paso fijo: queda
 * más cerca de su línea (en oscuro, pastel) y conserva la separación entre
 * líneas que trae del claro. (Bajar la línea oscura justo hasta 3:1 dejaba
 * todas las tintas con la misma luminancia: el Biotrén y las micros a Tomé
 * salían del mismo celeste.) Si la flecha queda bajo 3:1 (421), se baja lo
 * justo.
 */
export function inkRouteColor(color: string, theme: Theme): string {
  if (theme === 'light') return displayRouteColor(color, 'light');
  return memo(`ink|${color}`, () => {
    const [L] = toOklch(displayRouteColor(color, 'light'));
    const [, C, hue] = toOklch(displayRouteColor(color, 'dark'));
    return darkenUntil(fromOklch(L + DARK_INK_LIFT, C, hue), (hex) => 1.05 / (luminance(hex) + 0.05) >= 3);
  });
}

/**
 * Fondo de la píldora con el código (RouteBadge) en tema claro: el color de
 * la línea, oscurecido (mismo tono) hasta que el texto blanco sea el legible.
 * Así toda la columna de píldoras lleva texto blanco; antes L1 y 421 salían
 * con texto negro junto a L2 y 401 con blanco. Solo la píldora: la línea del
 * mapa conserva su color. En oscuro las píldoras ya llevan todas texto negro.
 */
export function pillRouteColor(color: string, theme: Theme): string {
  if (theme === 'dark') return displayRouteColor(color, 'dark');
  return memo(`pill|${color}`, () => darkenUntil(displayRouteColor(color, 'light'), (hex) => readableTextOn(hex) === '#fff'));
}

export type RouteColorVars = Record<'--route' | '--route-fg' | '--route-dark' | '--route-fg-dark', string> & CSSProperties;

/**
 * Variables CSS para pintar en el DOM con el color de cada tema sin pasar el
 * tema por React: `bg-[var(--route)] dark:bg-[var(--route-dark)]`, y su texto
 * legible en `--route-fg` / `--route-fg-dark`. Es el color de la píldora
 * (pillRouteColor): lo usan RouteBadge y los trazos de la ficha.
 */
export function routeColorVars(color: string): RouteColorVars {
  const light = pillRouteColor(color, 'light');
  const dark = pillRouteColor(color, 'dark');
  return {
    '--route': light,
    '--route-fg': readableTextOn(light),
    '--route-dark': dark,
    '--route-fg-dark': readableTextOn(dark),
  };
}

/** Mezcla por canal sRGB, `a + (b − a)·t` (GPS viejo: color de la línea desteñido hacia la tierra). */
export function mixHex(a: string, b: string, t: number): string {
  const from = parseColor(a);
  const to = parseColor(b);
  if (!from || !to) return a;
  return rgbToHex(from.map((c, i) => c + (to[i] - c) * t) as Rgb);
}
