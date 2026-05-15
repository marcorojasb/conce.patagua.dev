import {
  Building2,
  Crosshair,
  GraduationCap,
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

interface MapLayerControlProps {
  terminalsCount: number;
  paraderosCount: number;
  poisCount: number;
  showTerminals: boolean;
  showParaderos: boolean;
  showPois: boolean;
  showAirQuality: boolean;
  onToggleTerminals: () => void;
  onToggleParaderos: () => void;
  onTogglePois: () => void;
  onToggleAirQuality: () => void;
  airQualityStatus: { stations: { id: string }[]; loading: boolean; error: string | null };
  onRecenter: () => void;
}

export function MapLayerControl({
  terminalsCount,
  paraderosCount,
  poisCount,
  showTerminals,
  showParaderos,
  showPois,
  showAirQuality,
  onToggleTerminals,
  onToggleParaderos,
  onTogglePois,
  onToggleAirQuality,
  airQualityStatus,
  onRecenter,
}: MapLayerControlProps) {
  const [open, setOpen] = useState(false);
  const enabledCount = [showTerminals, showParaderos, showPois, showAirQuality].filter(Boolean).length;

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
    ],
    [
      airQualityStatus.loading,
      airQualityStatus.stations.length,
      onToggleAirQuality,
      onToggleParaderos,
      onTogglePois,
      onToggleTerminals,
      paraderosCount,
      poisCount,
      showAirQuality,
      showParaderos,
      showPois,
      showTerminals,
      terminalsCount,
    ],
  );

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
      <Tooltip content="Centrar Gran Concepción" side="left">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRecenter}
          aria-label="Centrar Gran Concepción"
          className="pointer-events-auto h-10 w-10 border-border/80 bg-background/90 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/85"
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
          className={cn(
            'pointer-events-auto h-10 w-10 border-border/80 bg-background/90 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/85',
            open && 'bg-accent text-accent-foreground',
          )}
        >
          <Layers2 className="h-4 w-4" />
          {enabledCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium leading-none text-background">
              {enabledCount}
            </span>
          )}
        </Button>
      </Tooltip>

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
                <label
                  key={layer.id}
                  className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent/50"
                >
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
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
