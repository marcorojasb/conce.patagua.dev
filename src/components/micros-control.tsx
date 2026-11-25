// "Micros en el mapa": elige de dónde salen las micros que dibuja el mapa, una
// sola fuente a la vez y siempre a la vista:
// - Horario: estimadas desde los horarios GTFS/EFE. No son GPS y se dice.
// - GPS en vivo: solo micros que transmiten su posición. Una línea sin GPS
//   queda sin micros y se nombra en el detalle; nunca se rellena con estimadas.
// - Ocultar micros: ninguna.
// Las formas del selector y del estado son las mismas del mapa y la leyenda.
//
// En el teléfono queda en una fila (≤ 52 px): Horario / GPS, la cuenta de la
// elegida ("171 estimadas", "5 con GPS") siempre a la vista, ocultar y un
// chevron que abre el estado completo y el alcance. En escritorio el estado
// está siempre abierto.

import { useId, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, EyeOff, Loader2 } from 'lucide-react';
import { GpsStatusList } from '@/components/gps-status-list';
import { VehicleSwatch } from '@/components/map/map-swatches';
import { SectionLabel } from '@/components/ui/section-label';
import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control';
import { ROUTES_BY_ID } from '@/data/routes';
import { useClock } from '@/hooks/use-clock';
import { routePillCode } from '@/lib/route-labels';
import { formatAge } from '@/realtime/live-arrivals';
import { compactGpsNotice, gpsHeadline, selectedLineNotice } from '@/realtime/gps-mode-summary';
import { MAX_GPS_PAIRS } from '@/realtime/route-vehicles';
import { useSimulationStatus, type SimulationStatus } from '@/realtime/use-simulated-vehicles';
import { cn } from '@/lib/utils';
import type { GpsLineStatus, GpsModeView, MicrosControlProps, MicrosMode, SimulationScope } from '@/types/ui-contracts';

const AGE_TICK_MS = 5_000;

const DESKTOP_QUERY = '(min-width: 768px)';
/** Bajo 380 px la elegida va sin su muestra: así la cuenta ("5 GPS · 1/5 líneas") no se corta a 360 px. */
const NARROW_QUERY = '(max-width: 379px)';

// Una suscripción estable por consulta (useSyncExternalStore se resuscribe si cambia).
const mediaSubscribers = new Map<string, (listener: () => void) => () => void>();

function subscribeMedia(media: string): (listener: () => void) => () => void {
  let subscribe = mediaSubscribers.get(media);
  if (!subscribe) {
    subscribe = (listener) => {
      const query = window.matchMedia(media);
      query.addEventListener('change', listener);
      return () => query.removeEventListener('change', listener);
    };
    mediaSubscribers.set(media, subscribe);
  }
  return subscribe;
}

function useMediaQuery(media: string, fallback: boolean): boolean {
  return useSyncExternalStore(
    subscribeMedia(media),
    () => window.matchMedia(media).matches,
    () => fallback,
  );
}

/** Escritorio: el estado siempre abierto y los rótulos completos. */
function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY, true);
}

// El detalle por línea arranca abierto en escritorio y plegado en móvil; en
// el teléfono el estado completo también arranca plegado. Lo que elija la
// persona se recuerda mientras dure la visita.
let detailOpenChoice: boolean | null = null;
let statusOpenChoice = false;

function initialDetailOpen(): boolean {
  if (detailOpenChoice != null) return detailOpenChoice;
  return typeof window === 'undefined' || window.matchMedia(DESKTOP_QUERY).matches;
}

function plural(n: number, one: string, many: string): string {
  return `${n.toLocaleString('es-CL')} ${n === 1 ? one : many}`;
}

const SCOPE_OPTIONS: readonly SegmentedOption<SimulationScope>[] = [
  { value: 'visible', name: 'Mis líneas', label: 'Mis líneas' },
  { value: 'all', name: 'Toda la red', label: 'Toda la red' },
];

/** Cuenta corta de la opción elegida ("171 estimadas", "5 con GPS"): lo que se ve con el estado plegado. */
export function scheduleMeta(simulation: SimulationStatus, noLines: boolean): string {
  if (noLines) return 'sin líneas';
  if (simulation.error) return 'sin horario';
  if (simulation.loading) return 'cargando…';
  return plural(simulation.count, 'estimada', 'estimadas');
}

export interface GpsMeta {
  /** Lo que se ve (~18 letras: cabe a 360 px). */
  text: string;
  /** Lo que no cupo, solo para lectores de pantalla (el meta se enlaza con aria-describedby). */
  note: string;
  /** Hay micros con dato viejo: el meta lleva además un ícono de aviso. */
  stale: boolean;
}

const short = (text: string): GpsMeta => ({ text, note: '', stale: false });

/**
 * Cuenta del modo GPS con el control plegado en el teléfono, donde es lo
 * único que se ve. Primero la edad si el dato más nuevo tiene un minuto o
 * más (todo el mapa está atrasado), si no las líneas sin GPS (quedan sin
 * micros y nada más lo avisa); el dato viejo lleva además un ícono que no
 * depende del texto. Lo que no cabe va en `note`.
 */
export function gpsMeta(gps: GpsModeView, now: number = Date.now()): GpsMeta {
  const headline = gpsHeadline(gps);
  switch (headline.state) {
    case 'live': {
      const count = gps.vehicles.toLocaleString('es-CL');
      const total = gps.lines.length;
      const partial = headline.liveLines > 0 && headline.liveLines < total;
      const age = gps.fetchedAt != null ? Math.max(0, now - gps.fetchedAt) : 0;
      const staleNote = gps.stale > 0 ? `${gps.stale.toLocaleString('es-CL')} con dato viejo` : '';
      const linesNote = partial ? `${headline.liveLines} de ${plural(total, 'línea', 'líneas')} con GPS` : '';
      const notes = (...parts: string[]) => parts.filter(Boolean).join(' · ');
      if (age >= 60_000) {
        return { text: `${count} GPS · ${formatAge(age)}`, note: notes(linesNote, staleNote), stale: gps.stale > 0 };
      }
      if (partial) {
        return { text: `${count} GPS · ${headline.liveLines}/${total} líneas`, note: notes(linesNote, staleNote), stale: gps.stale > 0 };
      }
      if (gps.stale > 0) return { text: `${count} GPS · ${plural(gps.stale, 'viejo', 'viejos')}`, note: staleNote, stale: true };
      return short(`${count} con GPS`);
    }
    case 'loading':
      return short('buscando…');
    case 'empty':
      return short('sin GPS aún');
    case 'untracked-only':
      return short('sin GPS');
    case 'no-lines':
      return short('sin líneas');
    case 'failed':
      return short('reintentando…');
    case 'unconfigured':
      return short('no activado');
  }
}

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
      <StatusLine state="schedule-error" icon={<AlertTriangle className="mt-px size-3.5 shrink-0 text-stale" />}>
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
      <SegmentedControl
        variant="radio"
        size="sm"
        label="Qué micros estimar"
        value={scope}
        options={SCOPE_OPTIONS}
        onChange={onScopeChange}
      />
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
        <StatusLine state="gps-unconfigured" icon={<AlertTriangle className="mt-px size-3.5 shrink-0 text-stale" />}>
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
            <span className="block text-stale">No se pudo actualizar · reintentando</span>
          )}
        </StatusLine>
      );
      break;
    }
    case 'failed':
      line = (
        <StatusLine state="gps-failed" icon={<AlertTriangle className="mt-px size-3.5 shrink-0 text-stale" />}>
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
        <p data-gps-selected-line className="font-medium text-stale">
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
            className="-mx-1 flex min-h-10 items-center gap-1 self-start rounded-md px-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-ring md:min-h-7"
          >
            <ChevronDown className={cn('size-3.5 transition-transform', !open && '-rotate-90')} />
            Detalle por línea
          </button>
          {open && (
            <>
              <GpsStatusList id={detailId} lines={gps.lines} />
              <p>Posiciones de Transapp/DTPR · fuente no oficial</p>
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
      <AlertTriangle className="mt-px size-3.5 shrink-0 text-stale" aria-hidden />
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
      <AlertTriangle className="mt-px size-3.5 shrink-0 text-stale" aria-hidden />
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
  const desktop = useIsDesktop();
  const narrow = useMediaQuery(NARROW_QUERY, false);
  const simulation = useSimulationStatus();
  const statusId = useId();
  // La edad del GPS en la cuenta plegada del teléfono.
  const now = useClock(AGE_TICK_MS, !desktop && mode === 'gps' && gps.fetchedAt != null);
  // Lo que vuelve al quitar "Ocultar micros".
  const [shownMode, setShownMode] = useState<'schedule' | 'gps'>(mode === 'gps' ? 'gps' : 'schedule');
  const [statusOpen, setStatusOpen] = useState(statusOpenChoice);
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
  const toggleStatus = () => {
    statusOpenChoice = !statusOpen;
    setStatusOpen(!statusOpen);
  };

  // Teléfono: la cuenta de la elegida va en su segunda línea y solo la elegida
  // lleva su muestra; así la fila cabe en 360 px sin cortar "Horario" ni "GPS".
  const meta = (value: 'schedule' | 'gps') => {
    if (desktop || mode !== value) return undefined;
    if (value === 'schedule') {
      return (
        <span data-micros-meta className="block truncate">
          {scheduleMeta(simulation, scope === 'visible' && linesOnMap === 0)}
        </span>
      );
    }
    const { text, note, stale } = gpsMeta(gps, now);
    return (
      <span data-micros-meta data-stale={stale || undefined} className="flex min-w-0 items-center gap-1">
        {stale && <AlertTriangle aria-hidden className="!size-3 shrink-0" />}
        <span className="truncate">{text}</span>
        {note && <span className="sr-only"> · {note}</span>}
      </span>
    );
  };
  const swatch = (value: 'schedule' | 'gps') =>
    desktop || (mode === value && !narrow) ? (
      <VehicleSwatch kind={value === 'schedule' ? 'estimate' : 'gps'} size={desktop ? 16 : 14} />
    ) : undefined;
  const modeOptions: SegmentedOption<'schedule' | 'gps'>[] = [
    { value: 'schedule', name: 'Horario', label: 'Horario', icon: swatch('schedule'), meta: meta('schedule') },
    {
      value: 'gps',
      name: 'GPS en vivo',
      // El texto visible ("GPS") está dentro del nombre accesible ("GPS en vivo").
      label: (
        <>
          <span className="md:hidden">GPS</span>
          <span className="hidden md:inline">GPS en vivo</span>
        </>
      ),
      icon: swatch('gps'),
      meta: meta('gps'),
    },
  ];

  const showStatus = !compact && (desktop || statusOpen);

  return (
    <section
      aria-label="Micros en el mapa"
      data-micros-control
      data-mode={mode}
      className="surface-control w-[min(20rem,calc(100vw-4.5rem))] text-[12px] md:w-80"
    >
      <div className="p-1">
        {desktop && (
          <SectionLabel className="mb-1 px-1.5 pt-1">
            <span aria-hidden>Micros en el mapa</span>
          </SectionLabel>
        )}
        <div className="flex items-center gap-0.5">
          <SegmentedControl
            variant="radio"
            size="md"
            fit={desktop ? 'equal' : 'content'}
            label="Micros en el mapa"
            value={mode === 'off' ? null : mode}
            options={modeOptions}
            onChange={selectMode}
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={toggleHidden}
            aria-pressed={mode === 'off'}
            aria-label="Ocultar micros"
            title={mode === 'off' ? 'Mostrar micros' : 'Ocultar micros'}
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-ring md:size-8',
              mode === 'off' && 'bg-foreground text-background hover:bg-foreground/90 hover:text-background',
            )}
          >
            <EyeOff className="size-4" />
          </button>
          {!desktop && !compact && (
            <button
              type="button"
              onClick={toggleStatus}
              aria-expanded={statusOpen}
              aria-controls={statusOpen ? statusId : undefined}
              aria-label="Estado de las micros"
              className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-ring"
            >
              <ChevronDown className={cn('size-4 transition-transform', statusOpen && 'rotate-180')} />
            </button>
          )}
        </div>
      </div>
      {showStatus && mode !== 'off' && (
        <div
          id={statusId}
          className="thin-scroll flex max-h-[45vh] flex-col gap-1.5 overflow-y-auto border-t px-2.5 py-2 text-[11px] text-muted-foreground"
        >
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
      {showStatus && mode === 'off' && (
        <p
          id={statusId}
          data-micros-status
          data-state="off"
          className="border-t px-2.5 py-1.5 text-[11px] text-muted-foreground"
        >
          Micros ocultas
        </p>
      )}
      {mode === 'gps' && compact && <CompactGpsNotice gps={gps} selectedRouteId={selectedRouteId} />}
      {mode === 'schedule' && compact && <CompactScheduleNotice onRetry={onRetrySchedule} />}
    </section>
  );
}
