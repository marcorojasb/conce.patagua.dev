import { Building2, Compass } from 'lucide-react';
import { PlannerPanel } from '@/components/planner-panel';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/data/routes';
import type { PlannerMatch } from '@/lib/planner';
import { OPERATOR_STATS } from '@/lib/operator-stats';

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
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
