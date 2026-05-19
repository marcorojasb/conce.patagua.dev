import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ROUTES } from '@/data/routes';
import { GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { POIS } from '@/data/pois.generated';
import { TERMINALS } from '@/data/terminals.generated';
import { buildExport, downloadGeoJSON, type ExportLayer } from '@/lib/geojson-export';
import type { CoverageCell } from '@/types/transport';

interface ExportRow {
  key: ExportLayer;
  label: string;
  detail: string;
  defaultChecked: boolean;
  size?: () => number;
}

const EXPORT_ROWS: ExportRow[] = [
  {
    key: 'routes-visible',
    label: 'Recorridos visibles',
    detail: 'Solo los recorridos actualmente activos en el mapa',
    defaultChecked: true,
  },
  {
    key: 'routes-all',
    label: 'Todos los recorridos',
    detail: `${ROUTES.length} líneas, ignora filtros del visor`,
    defaultChecked: false,
  },
  {
    key: 'paraderos',
    label: 'Paraderos',
    detail: `${GTFS_STOPS.length.toLocaleString('es-CL')} puntos GTFS`,
    defaultChecked: true,
  },
  {
    key: 'terminales',
    label: 'Terminales',
    detail: `${TERMINALS.length} estaciones intermodales`,
    defaultChecked: false,
  },
  {
    key: 'centros',
    label: 'Centros de atracción',
    detail: `${POIS.length} POIs urbanos`,
    defaultChecked: false,
  },
  {
    key: 'cobertura',
    label: 'Cobertura territorial',
    detail: '7.649 polígonos · ~10 MB sin gzip',
    defaultChecked: false,
  },
];

export default function ExportTool({ visibleRouteIds }: { visibleRouteIds: string[] }) {
  const [selected, setSelected] = useState<Set<ExportLayer>>(
    () => new Set(EXPORT_ROWS.filter((r) => r.defaultChecked).map((r) => r.key)),
  );
  const [busy, setBusy] = useState(false);

  const toggle = (key: ExportLayer) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        // Mutual exclusion between "solo visibles" y "todos": tener ambos
        // activos resultaría en duplicados.
        if (key === 'routes-visible') next.delete('routes-all');
        if (key === 'routes-all') next.delete('routes-visible');
      }
      return next;
    });
  };

  const download = async () => {
    setBusy(true);
    try {
      let coverageCells: readonly CoverageCell[] | null = null;
      if (selected.has('cobertura')) {
        const mod = await import('@/data/coverage.generated');
        coverageCells = mod.COVERAGE_CELLS;
      }
      const fc = buildExport(selected, { visibleRouteIds, coverageCells });
      const stamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      downloadGeoJSON(fc, `conce-patagua-dev-${stamp}.geojson`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-snug text-muted-foreground">
        Exporta la selección actual como un FeatureCollection{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
          .geojson
        </code>{' '}
        para abrirlo en QGIS, Python (geopandas), R (sf), o cualquier herramienta
        de análisis SIG. Cada feature lleva sus propias{' '}
        <code className="font-mono text-[11px]">properties</code> incluyendo un
        campo <code className="font-mono text-[11px]">layer</code> para filtrar.
      </p>

      <div className="overflow-hidden rounded-md border">
        <ul className="divide-y">
          {EXPORT_ROWS.map((row) => {
            const checked = selected.has(row.key);
            return (
              <li key={row.key}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-accent/40">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{row.label}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {row.detail}
                    </div>
                  </div>
                  <Switch
                    checked={checked}
                    onCheckedChange={() => toggle(row.key)}
                    aria-label={row.label}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        type="button"
        onClick={download}
        disabled={selected.size === 0 || busy}
        className="w-full"
      >
        <Download className="h-4 w-4" />
        {busy ? 'Generando…' : 'Descargar GeoJSON'}
      </Button>

      <div className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
        Atribución requerida en cualquier publicación: los recorridos y paraderos
        vienen del GTFS Gran Concepción CC BY 4.0 de la Subsecretaría de
        Transportes; terminales, POIs y trazado del Biotrén de OpenStreetMap
        bajo ODbL.
      </div>
    </div>
  );
}

