import { describe, expect, it } from 'vitest';
import {
  buildWallpaperLegend,
  padBbox,
  selectWallpaperRoutes,
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
      '12 servicios en curso',
      'Paraderos',
      'Cobertura territorial',
      'Áreas verdes',
    ]);
  });
});
