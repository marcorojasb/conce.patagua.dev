import { MapPin, X } from 'lucide-react';
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
    <div className="rounded-md border bg-card p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Planificador
        </span>
        {hasAny && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-ring"
            aria-label="Limpiar"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
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
        <div className="mt-2 border-t pt-2">
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
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[12px]',
        active && 'border-foreground/80 bg-accent',
      )}
    >
      <span
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
        style={{ background: isOrigin ? '#16A34A' : '#DC2626' }}
      >
        {isOrigin ? 'A' : 'B'}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono">
        {point ? `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` : '—'}
      </span>
      <Button
        type="button"
        size="sm"
        variant={active ? 'default' : 'outline'}
        className="h-6 px-2 text-[10px]"
        onClick={onPick}
      >
        <MapPin className="h-3 w-3" />
        {active ? 'Click mapa…' : point ? 'Mover' : 'Marcar'}
      </Button>
    </div>
  );
}
