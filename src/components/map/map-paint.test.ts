import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BADGE_CONTOUR,
  GPS_SHADOW,
  VEHICLE_TAB_FONT,
  gpsRingGeometry,
  gpsStaleFill,
  paintLineSample,
  paintStopSymbol,
  paintVehicleDot,
  paintVehicleSymbol,
  paraderoMarkerStyle,
  staleRingDash,
  stopMarkerStyle,
  vehicleArrowPoints,
  vehicleDiameterForZoom,
  vehicleDotStyle,
  vehicleRingWidth,
  vehicleSpriteHalf,
  vehicleSymbolRadius,
  vehicleTabLayout,
  type VehicleSymbolOptions,
} from '@/components/map/map-paint';
import { stopStyleForZoom } from '@/components/map/route-network-diff';
import { MAP_THEME } from '@/lib/map-theme';
import { inkRouteColor, mixHex } from '@/lib/route-colors';
import type { Theme } from '@/types/transport';

// Contexto de canvas falso: anota cada relleno y cada trazo con su estilo y
// las figuras del trazado, para comprobar qué se dibuja sin un navegador.
interface Shape {
  kind: 'arc' | 'rect' | 'roundRect' | 'line';
  args: number[];
}

interface Op {
  op: 'fill' | 'stroke' | 'drawImage' | 'fillText';
  style?: string;
  width?: number;
  dash?: number[];
  alpha: number;
  shapes: Shape[];
  text?: string;
  font?: string;
}

class RecordingContext {
  fillStyle = '#000000';
  strokeStyle = '#000000';
  lineWidth = 1;
  globalAlpha = 1;
  lineCap = 'butt';
  lineJoin = 'miter';
  font = '10px sans-serif';
  textAlign = 'start';
  textBaseline = 'alphabetic';
  shadowColor = 'transparent';
  shadowBlur = 0;
  shadowOffsetX = 0;
  shadowOffsetY = 0;
  scaleFactor = 1;
  ops: Op[] = [];
  private shapes: Shape[] = [];
  private dash: number[] = [];
  private stack: Array<Record<string, unknown>> = [];

  save() {
    this.stack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      globalAlpha: this.globalAlpha,
      dash: this.dash,
      font: this.font,
    });
  }
  restore() {
    Object.assign(this, this.stack.pop() ?? {});
  }
  scale(x: number) {
    this.scaleFactor *= x;
  }
  getTransform() {
    return { a: this.scaleFactor, b: 0 };
  }
  beginPath() {
    this.shapes = [];
  }
  closePath() {}
  moveTo(...args: number[]) {
    this.shapes.push({ kind: 'line', args });
  }
  lineTo(...args: number[]) {
    this.shapes.push({ kind: 'line', args });
  }
  arc(...args: number[]) {
    this.shapes.push({ kind: 'arc', args });
  }
  rect(...args: number[]) {
    this.shapes.push({ kind: 'rect', args });
  }
  roundRect(x: number, y: number, w: number, h: number, r: number | number[]) {
    this.shapes.push({ kind: 'roundRect', args: [x, y, w, h, ...(Array.isArray(r) ? r : [r])] });
  }
  setLineDash(dash: number[]) {
    this.dash = [...dash];
  }
  fill() {
    this.ops.push({ op: 'fill', style: this.fillStyle, alpha: this.globalAlpha, shapes: [...this.shapes] });
  }
  stroke() {
    this.ops.push({
      op: 'stroke',
      style: this.strokeStyle,
      width: this.lineWidth,
      dash: [...this.dash],
      alpha: this.globalAlpha,
      shapes: [...this.shapes],
    });
  }
  drawImage() {
    this.ops.push({ op: 'drawImage', alpha: this.globalAlpha, shapes: [] });
  }
  measureText(text: string) {
    return { width: text.length * 6.6 };
  }
  fillText(text: string) {
    this.ops.push({ op: 'fillText', style: this.fillStyle, alpha: this.globalAlpha, shapes: [], text, font: this.font });
  }
}

const asCtx = (r: RecordingContext) => r as unknown as CanvasRenderingContext2D;
const INK = inkRouteColor('#0071ca', 'light');
const THEMES: Theme[] = ['light', 'dark'];

function paint(o: Partial<VehicleSymbolOptions> & Pick<VehicleSymbolOptions, 'kind'>): RecordingContext {
  const ctx = new RecordingContext();
  paintVehicleSymbol(asCtx(ctx), 20, 20, { stale: false, ink: INK, diameter: 22, bucket: 4, theme: 'light', ...o });
  return ctx;
}

const strokes = (r: RecordingContext) => r.ops.filter((o) => o.op === 'stroke');
const fills = (r: RecordingContext) => r.ops.filter((o) => o.op === 'fill');
const usesShape = (r: RecordingContext, kind: Shape['kind']) => r.ops.some((o) => o.shapes.some((s) => s.kind === kind));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('tamaños', () => {
  it('insignia de Ø20, Ø22 y Ø26 a zoom 13, 14 y 15 o más', () => {
    expect(vehicleDiameterForZoom(12)).toBe(20);
    expect(vehicleDiameterForZoom(13)).toBe(20);
    expect(vehicleDiameterForZoom(14)).toBe(22);
    expect(vehicleDiameterForZoom(15)).toBe(26);
    expect(vehicleDiameterForZoom(19)).toBe(26);
  });

  it('aro blanco de 2, 2,5 y 3 px', () => {
    expect(vehicleRingWidth(18)).toBe(2);
    expect(vehicleRingWidth(20)).toBe(2);
    expect(vehicleRingWidth(22)).toBe(2.5);
    expect(vehicleRingWidth(26)).toBe(3);
    expect(vehicleRingWidth(10)).toBeGreaterThan(1);
  });

  it('anillo GPS de 2,5 px a 1,5 px del borde desde Ø18', () => {
    expect(gpsRingGeometry(18)).toEqual({ gap: 1.5, width: 2.5 });
    expect(gpsRingGeometry(26)).toEqual({ gap: 1.5, width: 2.5 });
    expect(vehicleSymbolRadius('gps', 26)).toBe(17);
    expect(vehicleSymbolRadius('estimate', 26)).toBe(14);
  });

  it('el sprite contiene la insignia (y la sombra en el GPS)', () => {
    for (const d of [16, 18, 22, 26]) {
      expect(vehicleSpriteHalf('estimate', d)).toBeGreaterThanOrEqual(vehicleSymbolRadius('estimate', d));
      expect(vehicleSpriteHalf('gps', d)).toBeGreaterThanOrEqual(d / 2 + GPS_SHADOW.blur + GPS_SHADOW.offsetY);
      expect(vehicleSpriteHalf('gps', d)).toBeGreaterThanOrEqual(vehicleSymbolRadius('gps', d));
    }
  });
});

describe('flecha de rumbo', () => {
  it('apunta al norte con el rumbo 0 y al este con el 4, en una caja de 0,58·D', () => {
    const d = 24;
    const scale = (0.58 * d) / 24;
    const north = vehicleArrowPoints(50, 50, d, 0);
    expect(north[0][0]).toBeCloseTo(50, 6);
    expect(north[0][1]).toBeCloseTo(50 - 9 * scale, 6);
    const east = vehicleArrowPoints(50, 50, d, 4);
    expect(east[0][0]).toBeCloseTo(50 + 9 * scale, 6);
    expect(east[0][1]).toBeCloseTo(50, 6);
    const ys = north.map((p) => p[1]);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(18 * scale, 6);
  });
});

describe('insignias: la estimada nunca se parece a un GPS', () => {
  it('estimada: la insignia de siempre, círculo con la tinta, aro blanco sólido, plana, flecha blanca llena', () => {
    const r = paint({ kind: 'estimate' });
    expect(usesShape(r, 'roundRect')).toBe(false);
    expect(r.ops.some((o) => o.op === 'drawImage')).toBe(false);
    const ring = strokes(r).find((o) => o.style === '#ffffff');
    expect(ring?.dash).toEqual([]);
    expect(ring?.width).toBe(2.5);
    expect(ring?.shapes[0].args.slice(3, 5)).toEqual([0, Math.PI * 2]);
    expect(fills(r).map((o) => o.style)).toEqual([INK, '#ffffff']);
    expect(strokes(r).some((o) => o.style === MAP_THEME.light.live || o.style === MAP_THEME.light.stale)).toBe(false);
    const contour = strokes(r).find((o) => o.style === BADGE_CONTOUR);
    expect(contour?.shapes[0].args[2]).toBe(11.5);
  });

  it('GPS al día: cuadrado con aro blanco sólido, anillo verde separado y flecha blanca llena', () => {
    for (const theme of THEMES) {
      const r = paint({ kind: 'gps', theme, diameter: 26 });
      expect(usesShape(r, 'arc')).toBe(false);
      const ring = strokes(r).find((o) => o.style === MAP_THEME[theme].live);
      // Lado D + 5,5 y radio 0,28·D + 2,75: 1,5 px de ranura y 2,5 px de anillo.
      expect(ring?.width).toBe(2.5);
      expect(ring?.shapes[0].args[2]).toBeCloseTo(26 + 5.5, 6);
      expect(ring?.shapes[0].args[4]).toBeCloseTo(0.28 * 26 + 2.75, 6);
      const white = strokes(r).find((o) => o.style === '#ffffff');
      expect(white?.dash).toEqual([]);
      expect(white?.alpha).toBe(1);
      expect(ring?.dash).toEqual([]);
      expect(fills(r).map((o) => o.style)).toEqual([INK, '#ffffff']);
    }
  });

  it('GPS viejo: relleno desteñido opaco, aro blanco a 0,7, flecha hueca y anillo ámbar', () => {
    for (const theme of THEMES) {
      const r = paint({ kind: 'gps', stale: true, theme });
      const fill = fills(r);
      expect(fill).toHaveLength(1);
      expect(fill[0].style).toBe(mixHex(INK, MAP_THEME[theme].land, 0.5));
      expect(fill[0].alpha).toBe(1);
      // Anillo ámbar cortado: la señal de forma del dato viejo, también sin color.
      const ring = strokes(r).find((o) => o.style === MAP_THEME[theme].stale);
      expect(ring?.dash).toEqual(staleRingDash(22));
      expect(ring?.dash?.length).toBe(2);
      expect(strokes(r).some((o) => o.style === MAP_THEME[theme].live)).toBe(false);
      const white = strokes(r).filter((o) => o.style === '#ffffff');
      expect(white.map((o) => o.alpha)).toEqual([0.7, 1]);
      // La flecha hueca es un trazo de 1,5 px.
      expect(white[1].width).toBe(1.5);
    }
    expect(gpsStaleFill('#000000', 'light')).toBe(mixHex('#000000', '#efefef', 0.5));
  });

  it('sin rumbo, un punto al centro (hueco en el viejo)', () => {
    const fresh = paint({ kind: 'estimate', bucket: null, diameter: 26 });
    const dot = fills(fresh).at(-1);
    expect(dot?.style).toBe('#ffffff');
    expect(dot?.shapes[0]).toEqual({ kind: 'arc', args: [20, 20, 0.12 * 26, 0, Math.PI * 2] });
    const stale = paint({ kind: 'gps', stale: true, bucket: null });
    // Hueco y más grande que el punto lleno, para que se vea.
    expect(strokes(stale).at(-1)?.shapes[0]).toEqual({ kind: 'arc', args: [20, 20, 0.2 * 22, 0, Math.PI * 2] });
  });

  it('solo el GPS lleva sombra, de un sello hecho una vez por diámetro y escala', () => {
    const made: RecordingContext[] = [];
    vi.stubGlobal('document', {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => {
          const ctx = new RecordingContext();
          made.push(ctx);
          return ctx;
        },
      }),
    });
    const estimate = paint({ kind: 'estimate', diameter: 18 });
    expect(estimate.ops.some((o) => o.op === 'drawImage')).toBe(false);
    const a = paint({ kind: 'gps', diameter: 18 });
    const b = paint({ kind: 'gps', stale: true, diameter: 18, theme: 'dark' });
    expect(a.ops[0].op).toBe('drawImage');
    expect(b.ops[0].op).toBe('drawImage');
    expect(made).toHaveLength(1);
    expect(made[0].shadowColor).toBe(GPS_SHADOW.color);
    expect(made[0].shadowBlur).toBe(GPS_SHADOW.blur);
    expect(made[0].shadowOffsetY).toBe(GPS_SHADOW.offsetY);
    // El cuadrado del sello cae fuera del lienzo: solo queda su sombra.
    const square = made[0].ops[0].shapes[0];
    expect(square.args[0] + square.args[2]).toBeLessThan(0);
  });
});

describe('lengüeta', () => {
  it('medidas desde el borde de la insignia, con lugar para el punto en vivo', () => {
    expect(vehicleTabLayout(20, false)).toEqual({ start: -3, textX: 7, dotX: 9, width: 36 });
    expect(vehicleTabLayout(19.2, true)).toEqual({ start: -3, textX: 16, dotX: 9, width: 45 });
  });

  it('se pinta antes que la insignia, en mono; punto en vivo solo en el GPS al día', () => {
    const live = paint({ kind: 'gps', diameter: 26, code: '30E' });
    expect(live.ops[0]).toMatchObject({ op: 'fill', style: MAP_THEME.light.surface });
    const text = live.ops.find((o) => o.op === 'fillText');
    expect(text).toMatchObject({ text: '30E', font: VEHICLE_TAB_FONT, style: MAP_THEME.light.text });
    expect(VEHICLE_TAB_FONT).toContain('JetBrains Mono');
    expect(fills(live).some((o) => o.style === MAP_THEME.light.live)).toBe(true);
    const tab = live.ops[0].shapes[0].args;
    expect(tab[0]).toBeCloseTo(20 + 13 - 3 + 0.5, 6);
    expect(tab.slice(4)).toEqual([0, 5, 5, 0]);

    const estimate = paint({ kind: 'estimate', diameter: 26, code: '30E', theme: 'dark' });
    expect(estimate.ops[0]).toMatchObject({ op: 'fill', style: MAP_THEME.dark.surface });
    expect(fills(estimate).some((o) => o.style === MAP_THEME.dark.live)).toBe(false);

    const stale = paint({ kind: 'gps', stale: true, diameter: 26, code: '30E' });
    expect(stale.ops.find((o) => o.op === 'fillText')?.style).toBe(MAP_THEME.light.muted);
    expect(fills(stale).some((o) => o.style === MAP_THEME.light.live)).toBe(false);
  });
});

describe('nivel dot (zoom ≤ 12)', () => {
  it('punto redondo con la tinta, cuadrado verde lleno y cuadrado hueco ámbar', () => {
    for (const theme of THEMES) {
      const c = MAP_THEME[theme];
      expect(vehicleDotStyle({ kind: 'estimate', stale: false, ink: INK, theme })).toEqual({
        shape: 'circle',
        fill: INK,
        stroke: '#ffffff',
        lineWidth: 1.5,
      });
      expect(vehicleDotStyle({ kind: 'gps', stale: false, ink: INK, theme })).toEqual({
        shape: 'square',
        fill: c.live,
        stroke: c.stopFill,
        lineWidth: 1.5,
      });
      expect(vehicleDotStyle({ kind: 'gps', stale: true, ink: INK, theme })).toEqual({
        shape: 'square',
        fill: c.stopFill,
        stroke: c.stale,
        lineWidth: 2,
      });
    }
  });

  it('pinta la forma del estilo: círculo de radio 3 o cuadrado de 7×7', () => {
    const round = new RecordingContext();
    paintVehicleDot(asCtx(round), 10, 10, { kind: 'estimate', stale: false, ink: INK, theme: 'light' });
    expect(round.ops[0].shapes.find((s) => s.kind === 'arc')?.args.slice(0, 3)).toEqual([10, 10, 3]);
    const square = new RecordingContext();
    paintVehicleDot(asCtx(square), 10, 10, { kind: 'gps', stale: true, ink: INK, theme: 'dark' });
    expect(square.ops[0].shapes[0]).toEqual({ kind: 'rect', args: [6.5, 6.5, 7, 7] });
    expect(square.ops.map((o) => o.style)).toEqual([MAP_THEME.dark.stopFill, MAP_THEME.dark.stale]);
  });
});

describe('paradas', () => {
  it('relleno del tema y aro del color de la línea; sin línea, gris neutro', () => {
    for (const theme of THEMES) {
      const style = stopMarkerStyle({ lineColor: '#123456', theme, zoom: 15 });
      expect(style).toEqual({
        radius: 5,
        weight: 2,
        color: '#123456',
        fillColor: MAP_THEME[theme].stopFill,
        fillOpacity: 1,
        opacity: 1,
      });
      expect(stopMarkerStyle({ lineColor: null, theme, zoom: 15 }).color).toBe(MAP_THEME[theme].neutralStop);
    }
  });

  it('atenuada al 0,25 y estación con aro grueso', () => {
    const dim = stopMarkerStyle({ lineColor: '#123456', theme: 'light', zoom: 14, dim: true });
    expect(dim.opacity).toBe(0.25);
    expect(dim.fillOpacity).toBe(0.25);
    expect(stopMarkerStyle({ lineColor: '#123456', theme: 'dark', zoom: 13, station: true })).toMatchObject(
      stopStyleForZoom(13, true),
    );
  });

  it('paradero GTFS: punto gris chico; el elegido, relleno de selección con aro del fondo', () => {
    expect(paraderoMarkerStyle({ selected: false, dim: false, theme: 'light' })).toEqual({
      radius: 3,
      weight: 1,
      color: '#71717a',
      fillColor: '#ffffff',
      fillOpacity: 0.86,
      opacity: 0.9,
    });
    expect(paraderoMarkerStyle({ selected: true, dim: true, theme: 'dark' })).toEqual({
      radius: 6,
      weight: 3,
      color: MAP_THEME.dark.stopFill,
      fillColor: MAP_THEME.dark.selection,
      fillOpacity: 1,
      opacity: 1,
    });
    // La parada de la red a zoom 14 tapa al paradero gris de abajo (sin aro doble).
    const stop = stopStyleForZoom(14);
    const paradero = paraderoMarkerStyle({ selected: false, dim: false, theme: 'light' });
    expect(stop.radius - stop.weight / 2).toBeGreaterThanOrEqual(paradero.radius);
  });

  it('paintStopSymbol pinta como L.CircleMarker: relleno y luego aro', () => {
    const r = new RecordingContext();
    paintStopSymbol(asCtx(r), 10, 10, { lineColor: '#abcdef', theme: 'dark', zoom: 15, station: true });
    expect(r.ops.map((o) => [o.op, o.style])).toEqual([
      ['fill', MAP_THEME.dark.stopFill],
      ['stroke', '#abcdef'],
    ]);
    expect(r.ops[1].width).toBe(3);
    expect(r.ops[0].shapes[0].args.slice(0, 3)).toEqual([10, 10, 7]);
  });
});

describe('muestra de línea', () => {
  it('borde del tema y línea con los anchos y opacidades del trazado', () => {
    for (const theme of THEMES) {
      const r = new RecordingContext();
      paintLineSample(asCtx(r), 4, 16, 4, { lineColor: '#0860ab', theme });
      expect(r.ops).toMatchObject([
        { op: 'stroke', style: MAP_THEME[theme].casing, width: 7, alpha: MAP_THEME[theme].casingAlpha },
        { op: 'stroke', style: '#0860ab', width: 4, alpha: 0.82, dash: [] },
      ]);
    }
  });

  it('sin borde: una sola línea, con su punteado y ancho', () => {
    const r = new RecordingContext();
    paintLineSample(asCtx(r), 4, 16, 4, { lineColor: '#57534e', theme: 'light', casing: false, dash: '4 4', weight: 2.5 });
    expect(r.ops).toMatchObject([{ op: 'stroke', style: '#57534e', width: 2.5, alpha: 1, dash: [4, 4] }]);
  });
});
