// Muestras de la leyenda y de "Micros en el mapa": pintadas con map-paint.ts,
// el mismo código que dibuja el mapa, sobre la tierra del mapa base del tema
// y nítidas con devicePixelRatio. La muestra es el símbolo: si cambia el
// dibujo del mapa, cambia la leyenda.
//
// Se pintan en un canvas fuera del documento y se muestran como <img>: cada
// <canvas> en la página era su propia capa de composición (21 con la leyenda
// abierta y las capas temáticas encendidas) y encarecía cada cuadro de zoom.

import { useMemo } from 'react';
import {
  paintCircleMarker,
  paintLineSample,
  paintStopSymbol,
  paintVehicleDot,
  paintVehicleSymbol,
  vehicleSymbolRadius,
  type VehicleSymbolKind,
} from '@/components/map/map-paint';
import { useCurrentTheme } from '@/hooks/use-theme';
import { MAP_SAMPLE_INK, MAP_THEME } from '@/lib/map-theme';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/transport';

export type VehicleSymbol = 'estimate' | 'gps' | 'gpsStale';

/** Rumbo fijo de las muestras: noreste. */
const SAMPLE_BUCKET = 2;
/** Zoom al que se muestran las paradas: 12 px por fuera, como el paradero de siempre. */
const SAMPLE_STOP_ZOOM = 15;

/**
 * Insignia más grande que cabe en una muestra de `size` px: Ø(size − 6) la
 * estimada; el GPS, con su anillo exterior, algo menor.
 */
export function swatchDiameter(kind: VehicleSymbolKind, size: number): number {
  let diameter = size - 6;
  while (diameter > 4 && vehicleSymbolRadius(kind, diameter) > size / 2 - 0.5) diameter -= 1;
  return diameter;
}

const images = new Map<string, string>();

/**
 * Imagen de la muestra (DPR y fondo de tierra), pintada una vez por clave y
 * guardada: `key` resume todo lo que pinta `paint`.
 */
function useSwatchImage(
  width: number,
  height: number,
  theme: Theme,
  key: string,
  paint: (ctx: CanvasRenderingContext2D) => void,
): string | undefined {
  const dpr = typeof window === 'undefined' ? 1 : Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  const id = `${theme}|${width}x${height}@${dpr}|${key}`;
  // `id` resume lo que pinta `paint` (y el tamaño, el tema y el DPR).
  return useMemo(() => swatchImage(id, width, height, dpr, theme, paint), [id]);
}

function swatchImage(
  id: string,
  width: number,
  height: number,
  dpr: number,
  theme: Theme,
  paint: (ctx: CanvasRenderingContext2D) => void,
): string | undefined {
  const cached = images.get(id);
  if (cached !== undefined || typeof document === 'undefined') return cached;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = MAP_THEME[theme].land;
  ctx.fillRect(0, 0, width, height);
  paint(ctx);
  const url = canvas.toDataURL();
  images.set(id, url);
  return url;
}

/** Micro como la dibuja el mapa, con tinta de ejemplo gris y rumbo noreste. */
export function VehicleSwatch({ kind, size = 20, className }: { kind: VehicleSymbol; size?: number; className?: string }) {
  const theme = useCurrentTheme();
  const symbol: VehicleSymbolKind = kind === 'estimate' ? 'estimate' : 'gps';
  const diameter = swatchDiameter(symbol, size);
  const src = useSwatchImage(size, size, theme, `${kind}|${diameter}`, (ctx) =>
    paintVehicleSymbol(ctx, size / 2, size / 2, {
      kind: symbol,
      stale: kind === 'gpsStale',
      ink: MAP_SAMPLE_INK,
      diameter,
      bucket: SAMPLE_BUCKET,
      theme,
    }),
  );
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      aria-hidden
      data-vehicle-symbol={kind}
      className={cn('block shrink-0 rounded-md', className)}
      style={{ width: size, height: size }}
    />
  );
}

/** Micro como se ve de lejos (zoom ≤ 12): punto redondo, cuadrado verde lleno o cuadrado hueco ámbar. */
export function VehicleDotSwatch({ kind, size = 12, className }: { kind: VehicleSymbol; size?: number; className?: string }) {
  const theme = useCurrentTheme();
  const src = useSwatchImage(size, size, theme, `dot|${kind}`, (ctx) =>
    paintVehicleDot(ctx, size / 2, size / 2, {
      kind: kind === 'estimate' ? 'estimate' : 'gps',
      stale: kind === 'gpsStale',
      ink: MAP_SAMPLE_INK,
      theme,
    }),
  );
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      aria-hidden
      data-vehicle-dot={kind}
      className={cn('block shrink-0 rounded-sm', className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Parada de la red (o estación del Biotrén, aro grueso) con el aro de `color`
 * (color de pantalla ya resuelto; por defecto, la línea de ejemplo del tema),
 * o con `layer` el punto gris de la capa Paraderos.
 */
export function StopSwatch({
  station = false,
  layer = false,
  color,
  size = 20,
  className,
}: {
  station?: boolean;
  layer?: boolean;
  color?: string;
  size?: number;
  className?: string;
}) {
  const theme = useCurrentTheme();
  const lineColor = color ?? MAP_THEME[theme].sample;
  const src = useSwatchImage(size, size, theme, `${station}|${layer}|${lineColor}`, (ctx) =>
    paintStopSymbol(ctx, size / 2, size / 2, { lineColor, theme, zoom: SAMPLE_STOP_ZOOM, station, layer }),
  );
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      aria-hidden
      className={cn('block shrink-0 rounded-md', className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Tramo de línea como el trazado del mapa (borde del tema y línea). `color`
 * es el color de pantalla ya resuelto (displayRouteColor); por defecto, la
 * línea de ejemplo del tema.
 */
export function LineSwatch({
  color,
  dash,
  casing = true,
  weight,
  width = 20,
  height = 8,
  className,
}: {
  color?: string;
  dash?: string;
  casing?: boolean;
  weight?: number;
  width?: number;
  height?: number;
  className?: string;
}) {
  const theme = useCurrentTheme();
  const lineColor = color ?? MAP_THEME[theme].sample;
  const src = useSwatchImage(width, height, theme, `${lineColor}|${dash}|${casing}|${weight}`, (ctx) =>
    paintLineSample(ctx, 4, width - 4, height / 2, { lineColor, theme, dash, casing, weight }),
  );
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      aria-hidden
      className={cn('block shrink-0 rounded-sm', className)}
      style={{ width, height }}
    />
  );
}

/** Punto como un L.CircleMarker del mapa (p. ej. schoolMarkerStyle de la capa Educación). */
export function CircleMarkerSwatch({
  style,
  size = 14,
  className,
}: {
  style: Parameters<typeof paintCircleMarker>[3];
  size?: number;
  className?: string;
}) {
  const theme = useCurrentTheme();
  const key = `${style.radius}|${style.weight}|${style.color}|${style.fillColor}|${style.fillOpacity}`;
  const src = useSwatchImage(size, size, theme, key, (ctx) => paintCircleMarker(ctx, size / 2, size / 2, style));
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      aria-hidden
      className={cn('block shrink-0 rounded-sm', className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Pin del mapa (terminal, lugar, corredor) con el mismo HTML y CSS que su
 * marcador (terminalPinHtml, poiPinHtml, corridorPinHtml), reducido.
 */
export function PinSwatch({ html, scale = 0.8, className }: { html: string; scale?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('pointer-events-none grid shrink-0 place-items-center [&>div]:shadow-none', className)}
      style={{ transform: `scale(${scale})` }}
      // HTML fijo del propio visor (map-markers.tsx, interurban-corridors-layer.tsx), sin datos de terceros.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
