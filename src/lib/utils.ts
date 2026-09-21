import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

function channelLuminance(value: number): number {
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

/**
 * Color de texto que contrasta con un fondo de color de recorrido.
 *
 * Los datasets traen 175 colores y 74 de ellos son claros (amarillos, verdes,
 * celestes): con `color: '#fff'` fijo el peor caso queda en 1.56:1, muy por
 * debajo del 4.5:1 de WCAG AA. Se elige entre blanco y negro según la
 * luminancia relativa del fondo (misma fórmula que usa el contraste WCAG).
 *
 * Un fondo que no sea hex de 6 dígitos cae a blanco: el único caso en el
 * código es `operatorColor()`, que emite hsl(… 45%), siempre oscuro.
 */
export function readableTextOn(background: string): '#fff' | '#111' {
  const hex = background.startsWith('#') ? background.slice(1) : background;
  if (hex.length !== 6 || !/^[0-9a-f]{6}$/i.test(hex)) return '#fff';

  const [r, g, b] = [0, 2, 4].map((i) =>
    channelLuminance(parseInt(hex.slice(i, i + 2), 16) / 255),
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.05 ? '#fff' : '#111';
}
