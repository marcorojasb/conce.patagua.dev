import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BADGE_CONTOUR } from '@/components/map/map-paint';
import { MAP_SAMPLE_INK, POI_COLOR, SCHOOL_COLOR } from '@/lib/map-theme';
import type { PoiCategory } from '@/types/transport';
import { displayRouteColor, inkRouteColor } from './route-colors';
import {
  buildWallpaper,
  buildWallpaperLegend,
  padBbox,
  selectWallpaperRoutes,
  type WallpaperConfig,
  type WallpaperRouteSource,
} from './wallpaper';

const routes: WallpaperRouteSource[] = [
  { id: 'gtfs-route-201', type: 'micro', network: 'GTFS Gran Concepción', color: '#0ea5e9', path: [[0, 0], [1, 1]] },
  { id: 'bt-l1', type: 'biotren', network: 'Biotrén', color: '#0284c7', path: [[0, 0], [1, 1]] },
  { id: 'interurban-401', type: 'micro', network: 'Interurbano Tomé', color: '#14b8a6', path: [[0, 0], [1, 1]] },
];

describe('wallpaper helpers', () => {
  it('pads and zooms a bbox around the same center', () => {
    const bbox: [[number, number], [number, number]] = [[-37, -73], [-36, -72]];
    const padded = padBbox(bbox, { paddingPct: 10, zoomDelta: 0 });
    expect(padded[0][0]).toBeCloseTo(-37.1);
    expect(padded[1][0]).toBeCloseTo(-35.9);
    expect((padded[0][0] + padded[1][0]) / 2).toBeCloseTo(-36.5);

    const zoomed = padBbox(bbox, { paddingPct: 0, zoomDelta: 2 });
    expect(zoomed[1][0] - zoomed[0][0]).toBeLessThan(1);
  });

  it('selects routes by visible, whole network and modal subsets', () => {
    expect(selectWallpaperRoutes(routes, ['bt-l1'], 'visible').map((r) => r.id)).toEqual(['bt-l1']);
    expect(selectWallpaperRoutes(routes, [], 'all')).toHaveLength(3);
    expect(selectWallpaperRoutes(routes, [], 'biotren').map((r) => r.id)).toEqual(['bt-l1']);
    expect(selectWallpaperRoutes(routes, [], 'interurban').map((r) => r.id)).toEqual(['interurban-401']);
  });

  it('builds an automatic legend from active layers only', () => {
    const legend = buildWallpaperLegend({
      routesCount: 4,
      vehiclesCount: 12,
      paraderos: true,
      terminales: false,
      cobertura: true,
      cycleways: false,
      greenspace: true,
      schools: false,
      pois: false,
    });
    expect(legend.map((item) => item.label)).toEqual([
      '4 recorridos',
      '12 micros estimadas (no GPS)',
      'Paraderos',
      'Cobertura territorial',
      'Áreas verdes',
    ]);
  });

  it('separa por forma Educación y Centros de atracción, que comparten colores', () => {
    // Mismo rojo para colegio y hospital (map-theme.ts): la muestra tiene que ser otra.
    expect(SCHOOL_COLOR.school).toBe(POI_COLOR.hospital);
    const legend = buildWallpaperLegend({
      routesCount: 0,
      vehiclesCount: 0,
      paraderos: false,
      terminales: false,
      cobertura: false,
      cycleways: false,
      greenspace: false,
      schools: true,
      pois: true,
    });
    const schools = legend.find((item) => item.label === 'Educación');
    const pois = legend.find((item) => item.label === 'Centros de atracción');
    expect(schools?.kind).toBe('dot');
    expect(pois?.kind).toBe('poi');
  });
});

/**
 * Canvas falso que anota cada color con que se traza o rellena y cada trazado
 * SVG (Path2D) que se pinta; las teselas fallan al instante.
 */
function stubCanvas(): { strokes: string[]; fills: string[]; dashes: number[][]; paths: string[] } {
  const strokes: string[] = [];
  const fills: string[] = [];
  const dashes: number[][] = [];
  const paths: string[] = [];
  const ctx = new Proxy({} as Record<string | symbol, unknown>, {
    get: (target, key) => {
      if (key in target) return target[key];
      if (key === 'setLineDash') return (d: number[]) => dashes.push([...d]);
      if (key === 'createRadialGradient') return () => ({ addColorStop: () => {} });
      if (key === 'measureText') return () => ({ width: 10 });
      return () => {};
    },
    set: (target, key, value) => {
      if (key === 'strokeStyle') strokes.push(value);
      if (key === 'fillStyle') fills.push(value);
      target[key] = value;
      return true;
    },
  });
  const canvas = { width: 0, height: 0, getContext: () => ctx, toBlob: (cb: (b: Blob) => void) => cb(new Blob()) };
  vi.stubGlobal('document', { createElement: () => canvas });
  vi.stubGlobal(
    'Image',
    class {
      onerror: (() => void) | null = null;
      set src(_url: string) {
        queueMicrotask(() => this.onerror?.());
      }
    },
  );
  vi.stubGlobal(
    'Path2D',
    class {
      constructor(d: string) {
        paths.push(d);
      }
    },
  );
  return { strokes, fills, dashes, paths };
}

// Los pines de lugar del mapa (POI_SVG en map-markers.tsx, que no se puede
// importar aquí porque trae Leaflet): los trazados de cada pictograma.
const markersSource = readFileSync(new URL('../components/map/map-markers.tsx', import.meta.url), 'utf8');
function mapPoiGlyph(category: PoiCategory): string[] {
  const block = /const POI_SVG[^=]*=\s*\{([\s\S]*?)\n\};/.exec(markersSource)?.[1] ?? '';
  const svg = new RegExp(`${category}:\\s*'([^']*)'`).exec(block)?.[1] ?? '';
  return [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
}

describe('buildWallpaper', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const base: WallpaperConfig = {
    bbox: [[-36.85, -73.1], [-36.8, -73.0]],
    width: 300,
    height: 300,
    theme: 'light',
    routes: [{ path: [[-36.84, -73.08], [-36.81, -73.02]], color: '#0d7215', weight: 3 }],
    vehicles: [{ lat: -36.83, lng: -73.05, bearing: 45, routeId: 'r', color: '#b10086' }],
  };

  it('pinta líneas y micros con el color de pantalla del tema, no con el oficial crudo', async () => {
    const { strokes, fills } = stubCanvas();
    await buildWallpaper({ ...base, theme: 'dark' });
    expect(strokes).toContain(displayRouteColor('#0d7215', 'dark'));
    // La micro, con la tinta del tema (la misma de la insignia del mapa).
    expect(fills).toContain(inkRouteColor('#b10086', 'dark'));
    expect(strokes).not.toContain('#0d7215');
    expect(fills).not.toContain('#b10086');
  });

  it('a tamaño de fondo de pantalla, la micro es la insignia estimada del mapa (aro blanco sólido y contorno)', async () => {
    const { fills, strokes, dashes } = stubCanvas();
    await buildWallpaper({ ...base, width: 1280, height: 1280 });
    expect(fills).toContain(inkRouteColor('#b10086', 'light'));
    expect(strokes).toContain('#ffffff');
    expect(strokes).toContain(BADGE_CONTOUR);
    expect(dashes.some((d) => d.length > 0)).toBe(false);
  });

  it('el estilo nocturno usa los colores del tema oscuro aunque la app esté en claro', async () => {
    const { strokes } = stubCanvas();
    await buildWallpaper({ ...base, theme: 'light', style: 'night' });
    expect(strokes).toContain(displayRouteColor('#0d7215', 'dark'));
    expect(strokes).not.toContain(displayRouteColor('#0d7215', 'light'));
  });

  const legendItems = buildWallpaperLegend({
    routesCount: 1,
    vehiclesCount: 1,
    paraderos: false,
    terminales: false,
    cobertura: false,
    cycleways: false,
    greenspace: false,
    schools: false,
    pois: false,
  });

  it('en una imagen chica la leyenda muestra el punto de micro que se dibujó, no la insignia', async () => {
    const { strokes, fills } = stubCanvas();
    await buildWallpaper({ ...base, width: 240, height: 520, legendItems, showLegend: true });
    expect(fills).toContain(inkRouteColor('#b10086', 'light'));
    expect(fills).toContain(MAP_SAMPLE_INK);
    expect(strokes).not.toContain(BADGE_CONTOUR);
  });

  it('a tamaño de fondo de pantalla la leyenda muestra la insignia, como la imagen', async () => {
    const withLegend = stubCanvas();
    await buildWallpaper({ ...base, width: 1280, height: 1280, vehicles: [], legendItems, showLegend: true });
    expect(withLegend.strokes).toContain(BADGE_CONTOUR);
    vi.unstubAllGlobals();
    const withoutLegend = stubCanvas();
    await buildWallpaper({ ...base, width: 1280, height: 1280, vehicles: [], legendItems, showLegend: false });
    expect(withoutLegend.strokes).not.toContain(BADGE_CONTOUR);
  });

  it('pinta los lugares como el pin del mapa (aro y pictograma) y los establecimientos como punto', async () => {
    const categories: PoiCategory[] = ['hospital', 'university', 'college', 'mall'];
    for (const category of categories) {
      vi.unstubAllGlobals();
      const { fills, paths } = stubCanvas();
      await buildWallpaper({
        ...base,
        width: 1280,
        height: 1280,
        vehicles: [],
        pois: [{ lat: -36.83, lng: -73.05, category }],
        showLegend: false,
      });
      expect(mapPoiGlyph(category).length, category).toBeGreaterThan(0);
      expect(paths, category).toEqual(mapPoiGlyph(category));
      expect(fills, category).toContain(POI_COLOR[category]);
    }

    vi.unstubAllGlobals();
    const school = stubCanvas();
    await buildWallpaper({
      ...base,
      width: 1280,
      height: 1280,
      vehicles: [],
      schools: [{ lat: -36.83, lng: -73.05, color: SCHOOL_COLOR.school }],
      showLegend: false,
    });
    expect(school.fills).toContain(SCHOOL_COLOR.school);
    expect(school.paths).toEqual([]);
  });

  it('la muestra de Centros de atracción en la leyenda es el mismo pin', async () => {
    const { paths } = stubCanvas();
    const legend = buildWallpaperLegend({
      routesCount: 0,
      vehiclesCount: 0,
      paraderos: false,
      terminales: false,
      cobertura: false,
      cycleways: false,
      greenspace: false,
      schools: true,
      pois: true,
    });
    await buildWallpaper({ ...base, vehicles: [], legendItems: legend, showLegend: true });
    expect(paths).toEqual(mapPoiGlyph('hospital'));
  });
});
