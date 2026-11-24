import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

function channelLuminance(value: number): number {
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

/** "#rgb", "#rrggbb" o "hsl(h s% l%)" (con o sin comas) a [r, g, b] en 0..1. */
function parseColor(color: string): [number, number, number] | null {
  const text = color.trim();
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
  }
  const hsl = /^hsla?\(\s*(-?[\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i.exec(text);
  if (!hsl) return null;
  const h = (((Number(hsl[1]) % 360) + 360) % 360) / 360;
  const s = Math.min(1, Number(hsl[2]) / 100);
  const l = Math.min(1, Number(hsl[3]) / 100);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    const u = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (u < 1 / 6) return p + (q - p) * 6 * u;
    if (u < 1 / 2) return q;
    if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6;
    return p;
  };
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)];
}

/**
 * Color de texto que contrasta con un fondo de color de recorrido.
 *
 * Los datasets traen colores claros (amarillos, verdes, celestes) junto a
 * oscuros: con `color: '#fff'` fijo el peor caso queda en 1.56:1, muy por
 * debajo del 4.5:1 de WCAG AA. Se elige entre blanco y negro según la
 * luminancia relativa del fondo (misma fórmula que usa el contraste WCAG).
 *
 * Acepta hex de 3 o 6 dígitos y hsl(), que es lo que emite `operatorColor()`
 * para un recorrido sin color en el GTFS (con tonos amarillos que también son
 * claros). Un color que no se entiende cae a blanco.
 */
export function readableTextOn(background: string): '#fff' | '#111' {
  const rgb = parseColor(background);
  if (!rgb) return '#fff';
  const [r, g, b] = rgb.map(channelLuminance);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.05 ? '#fff' : '#111';
}
