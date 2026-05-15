// Builds GeoJSON FeatureCollections from the visor's current state so an
// analyst can drop the export into QGIS / Python / R for deeper work.
//
// Layers are independent: we don't try to be clever and merge them — each
// feature carries the props it needs and the consumer can filter by
// `properties.layer` to split.

import { ROUTES, ROUTE_TYPES } from '@/data/routes';
import { GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { POIS } from '@/data/pois.generated';
import { TERMINALS } from '@/data/terminals.generated';
import type { CoverageCell } from '@/types/transport';

export type ExportLayer =
  | 'routes-visible'
  | 'routes-all'
  | 'paraderos'
  | 'terminales'
  | 'centros'
  | 'cobertura';

const COVERAGE_HALF_STEP = 0.0015; // matches the 0.003° generator step

interface BuildOptions {
  visibleRouteIds: string[];
  coverageCells: readonly CoverageCell[] | null;
}

interface Feature {
  type: 'Feature';
  geometry:
    | { type: 'Point'; coordinates: [number, number] }
    | { type: 'LineString'; coordinates: Array<[number, number]> }
    | { type: 'Polygon'; coordinates: Array<Array<[number, number]>> };
  properties: Record<string, string | number | boolean | null>;
}

interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
}

export function buildExport(
  layers: Set<ExportLayer>,
  opts: BuildOptions,
): FeatureCollection {
  const features: Feature[] = [];

  const wantRoutes = layers.has('routes-visible') || layers.has('routes-all');
  if (wantRoutes) {
    const visible = new Set(opts.visibleRouteIds);
    for (const r of ROUTES) {
      const isVisible = visible.has(r.id);
      if (layers.has('routes-visible') && !isVisible) continue;
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: r.path.map(([lat, lng]) => [lng, lat]),
        },
        properties: {
          layer: 'route',
          id: r.id,
          code: r.code,
          name: r.name,
          type: r.type,
          typeLabel: ROUTE_TYPES[r.type].label,
          operator: r.operator,
          color: r.color,
          visibleInViewer: isVisible,
          stopsCount: r.stops.length,
        },
      });
    }
  }

  if (layers.has('paraderos')) {
    for (const p of GTFS_STOPS) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {
          layer: 'paradero',
          id: p.id,
          osmId: p.osmId ?? null,
          name: p.name ?? '',
          ref: p.ref ?? '',
          source: p.source ?? '',
        },
      });
    }
  }

  if (layers.has('terminales')) {
    for (const t of TERMINALS) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [t.lng, t.lat] },
        properties: {
          layer: 'terminal',
          id: t.id,
          osmId: t.osmId,
          name: t.name,
          network: t.network ?? null,
          operator: t.operator ?? null,
        },
      });
    }
  }

  if (layers.has('centros')) {
    for (const p of POIS) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {
          layer: 'centro-atraccion',
          id: p.id,
          osmId: p.osmId,
          osmType: p.osmType,
          name: p.name,
          category: p.category,
        },
      });
    }
  }

  if (layers.has('cobertura') && opts.coverageCells) {
    for (const [lat, lng, distance] of opts.coverageCells) {
      const minLat = lat - COVERAGE_HALF_STEP;
      const maxLat = lat + COVERAGE_HALF_STEP;
      const minLng = lng - COVERAGE_HALF_STEP;
      const maxLng = lng + COVERAGE_HALF_STEP;
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [minLng, minLat],
              [maxLng, minLat],
              [maxLng, maxLat],
              [minLng, maxLat],
              [minLng, minLat],
            ],
          ],
        },
        properties: {
          layer: 'cobertura',
          distanceMeters: distance,
          bucket:
            distance <= 200
              ? 'excelente'
              : distance <= 400
                ? 'buena'
                : distance <= 600
                  ? 'marginal'
                  : distance <= 1000
                    ? 'pobre'
                    : 'muy-pobre',
        },
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

/**
 * Triggers a browser download of the given FeatureCollection.
 */
export function downloadGeoJSON(collection: FeatureCollection, filename: string): void {
  const blob = new Blob([JSON.stringify(collection)], {
    type: 'application/geo+json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revocation so the click has a chance to fire.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
