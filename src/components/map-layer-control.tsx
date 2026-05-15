import {
  Bus,
  Building2,
  Compass,
  Crosshair,
  Download,
  GraduationCap,
  Grid3x3,
  ImageDown,
  Layers2,
  Loader2,
  MapPin,
  Wind,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { AnalysisTab } from '@/components/floating-tools-panel';

interface MapLayerControlProps {
  terminalsCount: number;
  paraderosCount: number;
  poisCount: number;
  showTerminals: boolean;
  showParaderos: boolean;
  showPois: boolean;
  showAirQuality: boolean;
  showSimulatedVehicles: boolean;
  showCoverage: boolean;
  coverageThreshold: 'all' | 'underserved';
  onToggleTerminals: () => void;
  onToggleParaderos: () => void;
  onTogglePois: () => void;
  onToggleAirQuality: () => void;
  onToggleSimulatedVehicles: () => void;
  onToggleCoverage: () => void;
  onSetCoverageThreshold: (t: 'all' | 'underserved') => void;
  airQualityStatus: { stations: { id: string }[]; loading: boolean; error: string | null };
  simulationStatus: { count: number; loading: boolean };
  coverageStatus: { loading: boolean };
  onRecenter: () => void;
  // Toggle the analysis tool panel. Click same = close, different = switch.
  onOpenTool: (tab: AnalysisTab) => void;
  /** Active tool — drives the pressed state on toolbar buttons. */
  activeTool: AnalysisTab | null;
}

interface ToolBtn {
  id: AnalysisTab;
  label: string;
  Icon: typeof Compass;
}

const TOOLS: ToolBtn[] = [
  { id: 'cobertura', label: 'Planificador (cobertura OD)', Icon: Compass },
  { id: 'operadores', label: 'Operadores', Icon: Building2 },
  { id: 'export', label: 'Export GeoJSON', Icon: Download },
  { id: 'wallpaper', label: 'Fondo de pantalla', Icon: ImageDown },
];

export function MapLayerControl({
  terminalsCount,
  paraderosCount,
  poisCount,
  showTerminals,
  showParaderos,
  showPois,
  showAirQuality,
  showSimulatedVehicles,
  showCoverage,
  coverageThreshold,
  onToggleTerminals,
  onToggleParaderos,
  onTogglePois,
  onToggleAirQuality,
  onToggleSimulatedVehicles,
  onToggleCoverage,
  onSetCoverageThreshold,
  airQualityStatus,
  simulationStatus,
  coverageStatus,
  onRecenter,
  onOpenTool,
  activeTool,
}: MapLayerControlProps) {
  const [open, setOpen] = useState(false);
  const enabledCount = [
    showTerminals,
    showParaderos,
    showPois,
    showAirQuality,
    showSimulatedVehicles,
    showCoverage,
  ].filter(Boolean).length;

  const layers = useMemo(
    () => [
      {
        id: 'paraderos',
        label: 'Paraderos GTFS',
        detail: `${paraderosCount.toLocaleString('es-CL')} puntos · zoom 14+`,
        icon: MapPin,
        checked: showParaderos,
        onToggle: onToggleParaderos,
      },
      {
        id: 'terminales',
        label: 'Terminales',
        detail: `${terminalsCount.toLocaleString('es-CL')} puntos`,
        icon: Building2,
        checked: showTerminals,
        onToggle: onToggleTerminals,
      },
      {
        id: 'destinos',
        label: 'Centros de atracción',
        detail: `${poisCount.toLocaleString('es-CL')} puntos`,
        icon: GraduationCap,
        checked: showPois,
        onToggle: onTogglePois,
      },
      {
        id: 'aire',
        label: 'Calidad del aire',
        detail: showAirQuality
          ? `${airQualityStatus.stations.length.toLocaleString('es-CL')} estaciones`
          : 'Estaciones SINCA',
        icon: airQualityStatus.loading ? Loader2 : Wind,
        checked: showAirQuality,
        onToggle: onToggleAirQuality,
        loading: airQualityStatus.loading,
      },
      {
        id: 'simulated',
        label: 'Servicios en curso',
        detail: showSimulatedVehicles
          ? simulationStatus.loading
            ? 'Cargando horario…'
            : `${simulationStatus.count.toLocaleString('es-CL')} programados · simulación`
          : 'Proyección según horario GTFS',
        icon: simulationStatus.loading ? Loader2 : Bus,
        checked: showSimulatedVehicles,
        onToggle: onToggleSimulatedVehicles,
        loading: simulationStatus.loading,
      },
      {
        id: 'coverage',
        label: 'Cobertura territorial',
        detail: showCoverage
          ? coverageStatus.loading
            ? 'Cargando grilla…'
            : coverageThreshold === 'underserved'
              ? 'Solo zonas > 600 m del paradero'
              : 'Distancia al paradero más cercano'
          : 'Heatmap por distancia',
        icon: coverageStatus.loading ? Loader2 : Grid3x3,
        checked: showCoverage,
        onToggle: onToggleCoverage,
        loading: coverageStatus.loading,
      },
    ],
    [
      airQualityStatus.loading,
      airQualityStatus.stations.length,
      onToggleAirQuality,
      onToggleParaderos,
      onTogglePois,
      onToggleSimulatedVehicles,
      onToggleTerminals,
      onToggleCoverage,
      paraderosCount,
      poisCount,
      showAirQuality,
      showCoverage,
      showParaderos,
      showPois,
      showSimulatedVehicles,
      showTerminals,
      simulationStatus.count,
      simulationStatus.loading,
      coverageThreshold,
      coverageStatus.loading,
      terminalsCount,
    ],
  );

  // Sized smaller in mobile so 6 stacked buttons + separator fit comfortably
  // without dominating the right edge of the map.
  const BTN_CLASS =
    'pointer-events-auto h-9 w-9 border-border/80 bg-background/90 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/85 md:h-10 md:w-10';

  return (
    <div className="pointer-events-none absolute right-2 top-2 z-10 flex flex-col items-end gap-1.5 md:right-3 md:top-3 md:gap-2">
      <Tooltip content="Centrar Gran Concepción" side="left">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRecenter}
          aria-label="Centrar Gran Concepción"
          className={BTN_CLASS}
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </Tooltip>

      <Tooltip content="Capas del mapa" side="left">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Abrir capas del mapa"
          className={cn(BTN_CLASS, open && 'bg-accent text-accent-foreground')}
        >
          <Layers2 className="h-4 w-4" />
          {enabledCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium leading-none text-background">
              {enabledCount}
            </span>
          )}
        </Button>
      </Tooltip>

      {/* Visual separator between view controls (recenter, layers) and
          analysis tools (planner, operators, export, wallpaper). */}
      <div aria-hidden className="pointer-events-none h-px w-5 bg-border/60 md:w-6" />

      {TOOLS.map((t) => {
        const Icon = t.Icon;
        const isActive = activeTool === t.id;
        return (
          <Tooltip key={t.id} content={t.label} side="left">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onOpenTool(t.id)}
              aria-label={t.label}
              aria-pressed={isActive}
              className={cn(
                BTN_CLASS,
                isActive && 'bg-accent text-accent-foreground border-foreground/40',
              )}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </Tooltip>
        );
      })}

      {open && (
        <Card className="pointer-events-auto w-[min(88vw,300px)] rounded-md border-border/80 bg-background/95 p-2 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <div className="flex items-center justify-between px-1 py-1">
            <div>
              <div className="text-sm font-medium">Capas del mapa</div>
              <div className="text-[11px] text-muted-foreground">
                Overlays visibles sobre los recorridos
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
              aria-label="Cerrar capas"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-1 space-y-1">
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div key={layer.id}>
                  <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent/50">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border bg-muted/40 text-muted-foreground">
                      <Icon className={cn('h-4 w-4', layer.loading && 'animate-spin')} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium leading-tight">
                        {layer.label}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {layer.detail}
                      </span>
                    </span>
                    <Switch
                      checked={layer.checked}
                      onCheckedChange={layer.onToggle}
                      aria-label={layer.label}
                    />
                  </label>
                  {layer.id === 'coverage' && layer.checked && (
                    <div className="ml-10 flex gap-1 pb-1 pl-2">
                      <button
                        type="button"
                        onClick={() => onSetCoverageThreshold('all')}
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] transition-colors focus-ring',
                          coverageThreshold === 'all'
                            ? 'bg-foreground text-background'
                            : 'border bg-background text-muted-foreground hover:text-foreground',
                        )}
                      >
                        Heatmap completo
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetCoverageThreshold('underserved')}
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] transition-colors focus-ring',
                          coverageThreshold === 'underserved'
                            ? 'bg-foreground text-background'
                            : 'border bg-background text-muted-foreground hover:text-foreground',
                        )}
                      >
                        Solo zonas mal servidas
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {showCoverage && (
            <div className="mt-2 rounded-md border bg-muted/30 p-2">
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Distancia al paradero
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                {[
                  { color: '#15803d', label: '≤200 m' },
                  { color: '#65a30d', label: '200–400' },
                  { color: '#facc15', label: '400–600' },
                  { color: '#f97316', label: '600–1000' },
                  { color: '#dc2626', label: '>1 km' },
                ].map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1">
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-3 rounded-sm"
                      style={{ background: b.color }}
                    />
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
