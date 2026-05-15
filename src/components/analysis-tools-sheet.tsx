import { useState } from 'react';
import { Building2, Compass, Download } from 'lucide-react';
import { PlannerPanel } from '@/components/planner-panel';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/data/routes';
import { GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { POIS } from '@/data/pois.generated';
import { TERMINALS } from '@/data/terminals.generated';
import type { PlannerMatch } from '@/lib/planner';
import { OPERATOR_STATS } from '@/lib/operator-stats';
import {
  buildExport,
  downloadGeoJSON,
  type ExportLayer,
} from '@/lib/geojson-export';
import type { CoverageCell } from '@/types/transport';

interface AnalysisToolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Planner state lifted from App so it persists when the sheet closes.
  plannerOrigin: { lat: number; lng: number } | null;
  plannerDestination: { lat: number; lng: number } | null;
  pickerMode: 'origin' | 'destination' | null;
  plannerMatches: PlannerMatch[];
  matchesAvailable: boolean;
  onPickOrigin: () => void;
  onPickDestination: () => void;
  onClearPlanner: () => void;
  onSelectRoute: (id: string) => void;
  onShowOperatorRoutes: (operator: string) => void;
  // For the GeoJSON export tab — knows which routes the user has on the map.
  visibleRouteIds: string[];
}

const micrCount = ROUTES.filter((r) => r.type === 'micro').length;

export function AnalysisToolsSheet({
  open,
  onOpenChange,
  plannerOrigin,
  plannerDestination,
  pickerMode,
  plannerMatches,
  matchesAvailable,
  onPickOrigin,
  onPickDestination,
  onClearPlanner,
  onSelectRoute,
  onShowOperatorRoutes,
  visibleRouteIds,
}: AnalysisToolsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md sm:w-[460px]">
        <SheetHeader>
          <SheetTitle className="pr-8">Herramientas de análisis</SheetTitle>
          <SheetDescription>
            Estudios técnicos sobre la red de transporte público. Usa estas vistas para
            mirar cobertura, conectividad y distribución del servicio.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="cobertura" className="flex min-h-0 flex-1 flex-col px-5 pb-5">
          <TabsList className="self-start">
            <TabsTrigger value="cobertura">
              <Compass className="h-3 w-3" />
              Cobertura OD
            </TabsTrigger>
            <TabsTrigger value="operadores">
              <Building2 className="h-3 w-3" />
              Operadores
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-3 w-3" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cobertura" className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-3">
                <p className="text-[12px] leading-snug text-muted-foreground">
                  Marca dos puntos en el mapa (origen y destino). El estudio devuelve los
                  recorridos cargados cuya polilínea pasa a ≤400 m de ambos —
                  aproximación de conectividad por proximidad, sin considerar transbordo
                  ni distancia caminable real.
                </p>
                <PlannerPanel
                  origin={plannerOrigin}
                  destination={plannerDestination}
                  pickerMode={pickerMode}
                  matches={plannerMatches}
                  matchesAvailable={matchesAvailable}
                  onPickOrigin={onPickOrigin}
                  onPickDestination={onPickDestination}
                  onClear={onClearPlanner}
                  onSelectRoute={onSelectRoute}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="operadores" className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-3">
                <p className="text-[12px] leading-snug text-muted-foreground">
                  Distribución del servicio entre los {OPERATOR_STATS.length} operadores
                  con recorridos en el feed GTFS. Toca un operador para mostrar todos sus
                  recorridos en el mapa.
                </p>
                <div className="overflow-hidden rounded-md border">
                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b bg-muted/30 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <span>Operador</span>
                    <span className="text-right">Rutas</span>
                    <span className="text-right">Km totales</span>
                  </div>
                  <ul className="divide-y">
                    {OPERATOR_STATS.map((s) => (
                      <li key={s.operator}>
                        <button
                          type="button"
                          onClick={() => onShowOperatorRoutes(s.operator)}
                          className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent/60 focus-ring"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ background: s.color }}
                            />
                            <span className="truncate text-sm font-medium">
                              {s.operator}
                            </span>
                          </span>
                          <span className="font-mono text-[12px] text-muted-foreground">
                            {s.routesCount}
                          </span>
                          <span className="font-mono text-[12px] text-muted-foreground">
                            {s.totalKm.toFixed(0)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
                  Km totales se calculan sumando la distancia entre vértices del trazado
                  GTFS simplificado (Douglas–Peucker ~16 m). Es una aproximación al
                  largo operacional, no incluye recorridos en vacío. Total flota:
                  {' '}<span className="font-mono">{micrCount}</span> servicios urbanos
                  registrados.
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="export" className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <ExportTab visibleRouteIds={visibleRouteIds} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

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

function ExportTab({ visibleRouteIds }: { visibleRouteIds: string[] }) {
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
      downloadGeoJSON(fc, `conce-transporte-${stamp}.geojson`);
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
