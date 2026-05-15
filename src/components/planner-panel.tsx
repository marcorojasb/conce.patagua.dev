import { LocateFixed, MapPin, Route, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTE_TYPES } from '@/data/routes';
import { cn } from '@/lib/utils';
import type { PlannerMatch } from '@/lib/planner';

interface PlannerPanelProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  pickerMode: 'origin' | 'destination' | null;
  matches: PlannerMatch[];
  matchesAvailable: boolean;
  onPickOrigin: () => void;
  onPickDestination: () => void;
  onClear: () => void;
  onSelectRoute: (id: string) => void;
}

export function PlannerPanel({
  origin,
  destination,
  pickerMode,
  matches,
  matchesAvailable,
  onPickOrigin,
  onPickDestination,
  onClear,
  onSelectRoute,
}: PlannerPanelProps) {
  const hasAny = !!origin || !!destination;
  return (
    <div className="min-w-0 rounded-md border bg-card">
      <div className="flex min-w-0 items-center justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Route className="h-3.5 w-3.5" />
            Planificador
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
            Cobertura por proximidad a recorridos
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant="outline" className="h-6 font-mono text-[10px]">
            400 m
          </Badge>
          {hasAny && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-ring"
              aria-label="Limpiar"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-2 p-2">
        <PickerRow
          kind="origin"
          point={origin}
          active={pickerMode === 'origin'}
          onPick={onPickOrigin}
        />
        <PickerRow
          kind="destination"
          point={destination}
          active={pickerMode === 'destination'}
          onPick={onPickDestination}
        />
      </div>

      {origin && destination && (
        <div className="border-t px-2 pb-2 pt-2">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{matches.length === 0 ? 'Sin coincidencias' : `${matches.length} recorridos cubren ambos`}</span>
            <span className="font-mono">≤400 m</span>
          </div>
          {!matchesAvailable && matches.length === 0 && (
            <div className="rounded-md border bg-muted/40 p-2 text-[11px] text-muted-foreground">
              No hay micros activadas. Habilita la capa Micro en Tipo (botón
              "Activar todos") y vuelve a colocar los pines.
            </div>
          )}
          <div className="space-y-1">
            {matches.slice(0, 10).map((m) => (
              <button
                key={m.route.id}
                type="button"
                onClick={() => onSelectRoute(m.route.id)}
                className="flex w-full items-center gap-2 rounded-md border bg-background p-1.5 text-left transition-colors hover:bg-accent focus-ring"
              >
                <Badge
                  className="border-transparent font-mono text-[10px]"
                  style={{ background: m.route.color, color: '#fff' }}
                >
                  {m.route.code}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium">{m.route.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {ROUTE_TYPES[m.route.type].short} · A {Math.round(m.originDistance)} m ·
                    B {Math.round(m.destinationDistance)} m
                  </div>
                </div>
              </button>
            ))}
            {matches.length > 10 && (
              <div className="text-center text-[10px] text-muted-foreground">
                + {matches.length - 10} más
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PickerRow({
  kind,
  point,
  active,
  onPick,
}: {
  kind: 'origin' | 'destination';
  point: { lat: number; lng: number } | null;
  active: boolean;
  onPick: () => void;
}) {
  const isOrigin = kind === 'origin';
  const label = isOrigin ? 'Origen' : 'Destino';
  const color = isOrigin ? '#16A34A' : '#DC2626';
  return (
    <div
      className={cn(
        'min-w-0 rounded-md border bg-background p-2 text-[12px] transition-colors',
        active && 'border-foreground/80 bg-accent/70',
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white shadow-sm"
          style={{ background: color }}
        >
          {isOrigin ? 'A' : 'B'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="truncate font-mono text-[12px]">
            {point ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : 'Sin punto definido'}
          </div>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant={active ? 'default' : point ? 'secondary' : 'outline'}
        className="mt-2 h-8 w-full min-w-0 justify-center overflow-hidden px-2 text-[11px]"
        onClick={onPick}
      >
        {active ? <LocateFixed className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
        <span className="truncate">
          {active ? 'Haz click en el mapa' : point ? `Cambiar ${label.toLowerCase()}` : `Elegir ${label.toLowerCase()}`}
        </span>
      </Button>
    </div>
  );
}
