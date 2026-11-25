// "Micros en el mapa": elige de dónde salen las micros que dibuja el mapa, una
// sola fuente a la vez y siempre a la vista:
// - Horario: estimadas desde los horarios GTFS/EFE. No son GPS y se dice.
// - GPS en vivo: solo micros que transmiten su posición. Una línea sin GPS
//   queda sin micros y se nombra en el detalle; nunca se rellena con estimadas.
// - Ocultar micros: ninguna.
// Las formas del selector y del estado son las mismas del mapa y la leyenda.

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, EyeOff, Loader2 } from 'lucide-react';
import { GpsStatusList } from '@/components/gps-status-list';
import { VehicleSwatch } from '@/components/map-legend';
import { ROUTES_BY_ID } from '@/data/routes';
import { useClock } from '@/hooks/use-clock';
import { routePillCode } from '@/lib/route-labels';
import { formatAge } from '@/realtime/live-arrivals';
import { compactGpsNotice, gpsHeadline, selectedLineNotice } from '@/realtime/gps-mode-summary';
import { MAX_GPS_PAIRS } from '@/realtime/route-vehicles';
import { useSimulationStatus } from '@/realtime/use-simulated-vehicles';
import { cn } from '@/lib/utils';
import type { GpsLineStatus, GpsModeView, MicrosControlProps, MicrosMode, SimulationScope } from '@/types/ui-contracts';

const AGE_TICK_MS = 5_000;

// El detalle por línea arranca abierto en escritorio y plegado en móvil; lo
// que elija la persona se recuerda mientras dure la visita.
let detailOpenChoice: boolean | null = null;

function initialDetailOpen(): boolean {
  if (detailOpenChoice != null) return detailOpenChoice;
  return typeof window === 'undefined' || window.matchMedia('(min-width: 768px)').matches;
}

function plural(n: number, one: string, many: string): string {
  return `${n.toLocaleString('es-CL')} ${n === 1 ? one : many}`;
}

interface Option<T extends string> {
  value: T;
  label: ReactNode;
  name: string;
}

/** Botones de opción con flechas (patrón radiogroup de ARIA). */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = 'md',
}: {
  label: string;
  value: T | null;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = options.findIndex((o) => o.value === value);
    const next = options[(index + step + options.length) % options.length];
    onChange(next.value);
    const radios = event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
    radios[options.indexOf(next)]?.focus();
  };
  const focusable = value ?? options[0].value;
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('flex min-w-0 rounded-md bg-muted p-0.5', size === 'sm' && 'text-[11px]')}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.name}
            tabIndex={option.value === focusable ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded px-2 font-medium transition-colors focus-ring',
              size === 'md' ? 'h-8' : 'h-6',
              // Sin elegir: más oscuro que muted-foreground, que sobre bg-muted quedaba en 4.4:1.
              checked ? 'bg-background text-foreground shadow-sm' : 'text-foreground/70 hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const MODE_OPTIONS: readonly Option<'schedule' | 'gps'>[] = [
  {
    value: 'schedule',
    name: 'Horario',
    label: (
      <>
        <VehicleSwatch symbol="estimate" className="size-4" />
        Horario
      </>
    ),
  },
  {
    value: 'gps',
    name: 'GPS en vivo',
    label: (
      <>
        <VehicleSwatch symbol="gps" className="size-4" />
        GPS en vivo
      </>
    ),
  },
];

const SCOPE_OPTIONS: readonly Option<SimulationScope>[] = [
  { value: 'visible', name: 'Mis líneas', label: 'Mis líneas' },
  { value: 'all', name: 'Toda la red', label: 'Toda la red' },
];

function StatusLine({ state, icon, children }: { state: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <p data-micros-status data-state={state} className="flex min-w-0 items-start gap-1.5 leading-snug">
      {icon}
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function ActionLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-medium text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground focus-ring"
    >
      {children}
    </button>
  );
}

function ScheduleStatus({
  scope,
  onScopeChange,
  onRetry,
  linesOnMap,
  onOpenLines,
}: {
  scope: SimulationScope;
  onScopeChange: (s: SimulationScope) => void;
  onRetry?: () => void;
  linesOnMap: number | undefined;
  onOpenLines: () => void;
}) {
  const simulation = useSimulationStatus();
  let line: ReactNode;
  if (scope === 'visible' && linesOnMap === 0) {
    // Sin líneas no hay qué estimar: se dice eso, no que el horario esté vacío.
    line = (
      <StatusLine state="schedule-no-lines">
        No hay líneas en tu mapa · <ActionLink onClick={onOpenLines}>Elegir líneas</ActionLink> ·{' '}
        <ActionLink onClick={() => onScopeChange('all')}>Toda la red</ActionLink>
      </StatusLine>
    );
  } else if (simulation.error) {
    line = (
      <StatusLine state="schedule-error" icon={<AlertTriangle className="mt-px size-3.5 shrink-0 text-amber-600" />}>
        No se pudo cargar el horario
        {onRetry && (
          <>
            {' · '}
            <ActionLink onClick={onRetry}>Reintentar</ActionLink>
          </>
        )}
      </StatusLine>
    );
  } else if (simulation.loading) {
    line = (
      <StatusLine state="schedule-loading" icon={<Loader2 className="mt-px size-3.5 shrink-0 animate-spin" />}>
        Cargando horario…
      </StatusLine>
    );
  } else {
    line = (
      <StatusLine state="schedule">
        {simulation.count > 0 ? (
          <>
            <span className="font-medium text-foreground">{plural(simulation.count, 'estimada', 'estimadas')}</span> ·
            según horario, no es GPS
          </>
        ) : (
          'Ninguna micro programada ahora · según horario, no es GPS'
        )}
      </StatusLine>
    );
  }
  return (
    <>
      {line}
      <Segmented label="Qué micros estimar" value={scope} options={SCOPE_OPTIONS} onChange={onScopeChange} size="sm" />
    </>
  );
}

/** Píldora de la línea tal como la muestran la lista y el detalle ("30Q/E"). */
function lineLabel(line: GpsLineStatus): string {
  const route = ROUTES_BY_ID.get(line.routeId);
  return route ? routePillCode(route) : line.code;
}

/** "Se consultan 8 de 20 líneas": con el detalle plegado igual se sabe que hay líneas sin consultar. */
function OmittedSummary({ queried, omitted }: { queried: number; omitted: number }) {
  if (omitted === 0) return null;
  return (
    <span data-gps-omitted-summary className="block">
      Se consultan {queried} de {plural(queried + omitted, 'línea', 'líneas')} (tope de {MAX_GPS_PAIRS} sentidos por
      consulta)
    </span>
  );
}

function GpsStatus({
  gps,
  onModeChange,
  onOpenLines,
  detailCollapsed,
  selectedRouteId,
}: {
  gps: GpsModeView;
  onModeChange: (mode: MicrosMode) => void;
  onOpenLines: () => void;
  detailCollapsed: boolean;
  selectedRouteId: string | null;
}) {
  const [detailOpen, setDetailOpen] = useState(initialDetailOpen);
  // Plegado por fuera (ficha abierta, avisos): se puede abrir un momento y al
  // dejar de estarlo vuelve a lo que eligió la persona.
  const [peek, setPeek] = useState(false);
  const [wasCollapsed, setWasCollapsed] = useState(detailCollapsed);
  if (detailCollapsed !== wasCollapsed) {
    setWasCollapsed(detailCollapsed);
    setPeek(false);
  }
  const detailId = useId();
  const now = useClock(AGE_TICK_MS, gps.fetchedAt != null);
  const headline = gpsHeadline(gps);
  const { queried, omitted } = headline;
  const toHorario = <ActionLink onClick={() => onModeChange('schedule')}>Cambiar a Horario</ActionLink>;
  const omittedSummary = <OmittedSummary queried={queried} omitted={omitted} />;

  let line: ReactNode;
  switch (headline.state) {
    case 'unconfigured':
      line = (
        <StatusLine state="gps-unconfigured" icon={<AlertTriangle className="mt-px size-3.5 shrink-0 text-amber-600" />}>
          El GPS en vivo no está activado en este servidor · {toHorario}
        </StatusLine>
      );
      break;
    case 'no-lines':
      line = (
        <StatusLine state="gps-no-lines">
          Agrega líneas al mapa para ver su GPS · <ActionLink onClick={onOpenLines}>Elegir líneas</ActionLink>
        </StatusLine>
      );
      break;
    case 'untracked-only':
      line = (
        <StatusLine state="gps-untracked-only">
          Tus líneas no tienen GPS en la fuente ({headline.untracked.map(lineLabel).join(', ')}) ·{' '}
          <ActionLink onClick={onOpenLines}>Elegir otras líneas</ActionLink>
        </StatusLine>
      );
      break;
    case 'live': {
      const age = gps.fetchedAt != null ? ` · ${formatAge(Math.max(0, now - gps.fetchedAt))}` : '';
      // Sin líneas con GPS propias, las micros son del paradero abierto: no se cuentan líneas.
      const { liveLines } = headline;
      const linesText =
        liveLines === 0
          ? ''
          : liveLines === queried
            ? ` · ${plural(liveLines, 'línea', 'líneas')}`
            : ` · ${liveLines} de ${plural(queried, 'línea', 'líneas')}`;
      line = (
        <StatusLine state="gps-live" icon={gps.loading ? <Loader2 className="mt-px size-3.5 shrink-0 animate-spin" /> : null}>
          <span className="font-medium text-foreground">{gps.vehicles.toLocaleString('es-CL')} con GPS</span>
          {linesText}
          {age}
          {gps.stale > 0 && <> · {gps.stale.toLocaleString('es-CL')} con dato viejo</>}
          {omittedSummary}
          {gps.failure && (
            <span className="block text-amber-700 dark:text-amber-400">No se pudo actualizar · reintentando</span>
          )}
        </StatusLine>
      );
      break;
    }
    case 'failed':
      line = (
        <StatusLine state="gps-failed" icon={<AlertTriangle className="mt-px size-3.5 shrink-0 text-amber-600" />}>
          No se pudo consultar el GPS · reintentando
          {omittedSummary}
        </StatusLine>
      );
      break;
    case 'empty':
      line = (
        <StatusLine state="gps-empty">
          {omitted > 0 ? (
            <>Ninguna de las {plural(queried, 'línea consultada', 'líneas consultadas')} transmite GPS ahora</>
          ) : (
            'Ninguna de tus líneas transmite GPS ahora'
          )}
          {headline.failing > 0 && <> ({headline.failing.toLocaleString('es-CL')} sin poder consultar)</>} · {toHorario}
          {omittedSummary}
        </StatusLine>
      );
      break;
    case 'loading':
      line = (
        <StatusLine state="gps-loading" icon={<Loader2 className="mt-px size-3.5 shrink-0 animate-spin" />}>
          Buscando micros con GPS…
          {omittedSummary}
        </StatusLine>
      );
      break;
  }

  const open = detailCollapsed ? peek : detailOpen;
  const toggleDetail = () => {
    if (detailCollapsed) {
      setPeek(!peek);
      return;
    }
    detailOpenChoice = !detailOpen;
    setDetailOpen(!detailOpen);
  };

  // Con el detalle plegado, la línea elegida sin GPS igual se nombra.
  const selectedNotice = open ? null : selectedLineNotice(gps.lines, selectedRouteId, lineLabel);

  return (
    <>
      {line}
      {selectedNotice && (
        <p data-gps-selected-line className="font-medium text-amber-800 dark:text-amber-300">
          {selectedNotice}
        </p>
      )}
      {gps.lines.length > 0 && gps.failure !== 'unconfigured' && (
        <>
          <button
            type="button"
            onClick={toggleDetail}
            aria-expanded={open}
            aria-controls={open ? detailId : undefined}
            className="flex items-center gap-1 self-start rounded text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-ring"
          >
            <ChevronDown className={cn('size-3.5 transition-transform', !open && '-rotate-90')} />
            Detalle por línea
          </button>
          {open && (
            <>
              <GpsStatusList id={detailId} lines={gps.lines} />
              <p className="text-[10px]">Posiciones de Transapp/DTPR · fuente no oficial</p>
            </>
          )}
        </>
      )}
    </>
  );
}

/**
 * Con una ficha abierta en un teléfono el control queda en el selector, pero
 * si el GPS no está simplemente funcionando lo dice en una línea: un mapa
 * sin micros nunca queda sin explicación.
 */
function CompactGpsNotice({ gps, selectedRouteId }: { gps: GpsModeView; selectedRouteId: string | null }) {
  const text = compactGpsNotice(gps, selectedRouteId, lineLabel);
  if (!text) return null;
  return (
    <p
      data-micros-status
      data-state="gps-compact"
      className="flex items-start gap-1.5 border-t px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground"
    >
      <AlertTriangle className="mt-px size-3.5 shrink-0 text-amber-600" aria-hidden />
      <span className="min-w-0">{text}</span>
    </p>
  );
}

/** Compacto en Horario: solo si el horario no cargó (el mapa queda sin micros). */
function CompactScheduleNotice({ onRetry }: { onRetry?: () => void }) {
  const simulation = useSimulationStatus();
  if (!simulation.error) return null;
  return (
    <p
      data-micros-status
      data-state="schedule-compact"
      className="flex items-start gap-1.5 border-t px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground"
    >
      <AlertTriangle className="mt-px size-3.5 shrink-0 text-amber-600" aria-hidden />
      <span className="min-w-0">
        No se pudo cargar el horario
        {onRetry && (
          <>
            {' · '}
            <ActionLink onClick={onRetry}>Reintentar</ActionLink>
          </>
        )}
      </span>
    </p>
  );
}

export function MicrosControl({
  mode,
  onModeChange,
  scope,
  onScopeChange,
  gps,
  onOpenLines,
  compact = false,
  onRetrySchedule,
  selectedRouteId = null,
  linesOnMap,
  detailCollapsed = false,
}: MicrosControlProps) {
  // Lo que vuelve al quitar "Ocultar micros".
  const [shownMode, setShownMode] = useState<'schedule' | 'gps'>(mode === 'gps' ? 'gps' : 'schedule');
  const selectMode = (next: 'schedule' | 'gps') => {
    setShownMode(next);
    onModeChange(next);
  };
  const toggleHidden = () => {
    if (mode === 'off') onModeChange(shownMode);
    else {
      setShownMode(mode);
      onModeChange('off');
    }
  };

  return (
    <section
      aria-label="Micros en el mapa"
      data-micros-control
      data-mode={mode}
      className="w-[min(20rem,calc(100vw-5rem))] rounded-lg border bg-background/90 text-[12px] shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="hidden px-2.5 pt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:block">
        Micros en el mapa
      </div>
      <div className="flex items-center gap-1 p-1 md:px-1.5">
        <div className="min-w-0 flex-1">
          <Segmented
            label="Micros en el mapa"
            value={mode === 'off' ? null : mode}
            options={MODE_OPTIONS}
            onChange={selectMode}
          />
        </div>
        <button
          type="button"
          onClick={toggleHidden}
          aria-pressed={mode === 'off'}
          aria-label="Ocultar micros"
          title={mode === 'off' ? 'Mostrar micros' : 'Ocultar micros'}
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-ring',
            mode === 'off' && 'bg-foreground text-background hover:bg-foreground/90 hover:text-background',
          )}
        >
          <EyeOff className="size-4" />
        </button>
      </div>
      {mode !== 'off' && !compact && (
        <div className="flex flex-col gap-1.5 border-t px-2.5 py-2 text-[11px] text-muted-foreground">
          {mode === 'schedule' ? (
            <ScheduleStatus
              scope={scope}
              onScopeChange={onScopeChange}
              onRetry={onRetrySchedule}
              linesOnMap={linesOnMap}
              onOpenLines={onOpenLines}
            />
          ) : (
            <GpsStatus
              gps={gps}
              onModeChange={onModeChange}
              onOpenLines={onOpenLines}
              detailCollapsed={detailCollapsed}
              selectedRouteId={selectedRouteId}
            />
          )}
        </div>
      )}
      {mode === 'gps' && compact && <CompactGpsNotice gps={gps} selectedRouteId={selectedRouteId} />}
      {mode === 'schedule' && compact && <CompactScheduleNotice onRetry={onRetrySchedule} />}
      {mode === 'off' && !compact && (
        <p data-micros-status data-state="off" className="border-t px-2.5 py-1.5 text-[11px] text-muted-foreground">
          Micros ocultas
        </p>
      )}
    </section>
  );
}
