import {
  AlertTriangle,
  BarChart3,
  Clock,
  CreditCard,
  ExternalLink,
  Github,
  Info,
  MapPin,
  Route as RouteIcon,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { Notice } from '@/components/ui/notice';
import { RouteBadge } from '@/components/route-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SectionLabel } from '@/components/ui/section-label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_TYPES } from '@/data/routes';
import {
  STATIC_SERVICE_PATTERNS,
  type StaticServiceDirection,
  type StaticServicePattern,
} from '@/data/static-service-patterns';
import type { StopServiceWindow } from '@/data/gtfs-stop-services.generated';
import { WikiLinkButton } from '@/components/wiki-link';
import { chileClock } from '@/lib/chile-time';
import {
  departuresByHour,
  summarizeDay,
  summarizeToday,
  summarizeWindowsDay,
  summarizeWindowsToday,
  type DayServiceSummary,
  type NextDeparture,
  type RouteTodaySummary,
} from '@/lib/route-schedule-summary';
import { formatServiceClock } from '@/lib/stop-services';
import { cn } from '@/lib/utils';
import type { Route, RouteSchedule } from '@/types/transport';

interface RouteDetailSheetProps {
  open: boolean;
  route: Route | null;
  onOpenChange: (open: boolean) => void;
  onFocusRoute: () => void;
  onDeselectRoute: () => void;
  onSelectStop: (id: string) => void;
}

// Mismo import() que la capa de servicios en curso (activa al iniciar): el
// chunk de horarios (~700 KB) suele estar ya en caché al abrir la ficha y no
// pesa en la carga inicial.
let schedulesPromise: Promise<Record<string, RouteSchedule>> | null = null;
function loadSchedules(): Promise<Record<string, RouteSchedule>> {
  schedulesPromise ??= Promise.all([
    import('@/data/gtfs-schedule.generated'),
    import('@/realtime/static-service-schedules'),
  ]).then(([gtfs, staticSchedules]) => ({
    ...gtfs.ROUTE_SCHEDULES,
    ...staticSchedules.STATIC_ROUTE_SCHEDULES,
  }));
  return schedulesPromise;
}

// Respaldo para los recorridos GTFS que el extractor de horarios dejó sin
// viajes: sus ventanas de paso por paradero. Es el mismo chunk (~330 KB gz)
// que usa la ficha de paradero, así que solo se pide para esos recorridos.
let stopWindowsPromise: Promise<Record<string, StopServiceWindow[]>> | null = null;
function loadStopWindows(): Promise<Record<string, StopServiceWindow[]>> {
  stopWindowsPromise ??= import('@/data/gtfs-stop-services.generated').then(
    (mod) => mod.STOP_SERVICE_WINDOWS,
  );
  return stopWindowsPromise;
}

const PATTERNS_BY_ROUTE = new Map<string, StaticServicePattern[]>();
for (const pattern of STATIC_SERVICE_PATTERNS) {
  const list = PATTERNS_BY_ROUTE.get(pattern.routeId) ?? [];
  list.push(pattern);
  PATTERNS_BY_ROUTE.set(pattern.routeId, list);
}

interface ScheduleDirection {
  label: string;
  schedules: RouteSchedule[];
}

type RouteScheduleData =
  | {
      kind: 'trips';
      /** Todos los sentidos juntos (para contar salidas). */
      all: RouteSchedule[];
      /** Solo en patrones estáticos: el GTFS no separa sentidos en este dataset. */
      directions: ScheduleDirection[];
      /** Reconstruido desde una frecuencia publicada, no viajes programados uno a uno. */
      estimated: boolean;
    }
  | {
      /** Sin viajes uno a uno: ventana de paso por el primer paradero. */
      kind: 'windows';
      windows: StopServiceWindow[];
      originName: string;
    };

function todaySummary(data: RouteScheduleData, now: Date): RouteTodaySummary {
  return data.kind === 'trips'
    ? summarizeToday(data.all, now)
    : summarizeWindowsToday(data.windows, now);
}

function daySummary(data: RouteScheduleData, day: number): DayServiceSummary {
  return data.kind === 'trips' ? summarizeDay(data.all, day) : summarizeWindowsDay(data.windows, day);
}

function scheduleForRoute(
  routeId: string,
  index: Record<string, RouteSchedule>,
): RouteScheduleData | null {
  const patterns = PATTERNS_BY_ROUTE.get(routeId);
  if (patterns) {
    const byDirection = new Map<StaticServiceDirection, ScheduleDirection>();
    for (const pattern of patterns) {
      const schedule = index[pattern.id];
      if (!schedule) continue;
      const direction = byDirection.get(pattern.direction) ?? {
        label: pattern.directionLabel,
        schedules: [],
      };
      direction.schedules.push(schedule);
      byDirection.set(pattern.direction, direction);
    }
    const directions = [...byDirection.values()];
    if (directions.length === 0) return null;
    return {
      kind: 'trips',
      all: directions.flatMap((d) => d.schedules),
      directions,
      estimated: true,
    };
  }
  const schedule = index[routeId];
  return schedule ? { kind: 'trips', all: [schedule], directions: [], estimated: false } : null;
}

type ScheduleState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; data: RouteScheduleData | null };

function useRouteSchedule(route: Route | null, active: boolean): ScheduleState {
  const [index, setIndex] = useState<Record<string, RouteSchedule> | null>(null);
  const [stopWindows, setStopWindows] = useState<Record<string, StopServiceWindow[]> | null>(
    null,
  );
  const [failed, setFailed] = useState(false);
  const routeId = active ? route?.id : undefined;
  const origin = route?.stops[0];
  const needsWindows = Boolean(
    index && origin && routeId?.startsWith('gtfs-route-') && !index[routeId],
  );

  useEffect(() => {
    if (!routeId || index || failed) return undefined;
    let cancelled = false;
    loadSchedules()
      .then((loaded) => {
        if (!cancelled) setIndex(loaded);
      })
      .catch(() => {
        schedulesPromise = null;
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [routeId, index, failed]);

  useEffect(() => {
    if (!needsWindows || stopWindows || failed) return undefined;
    let cancelled = false;
    loadStopWindows()
      .then((loaded) => {
        if (!cancelled) setStopWindows(loaded);
      })
      .catch(() => {
        stopWindowsPromise = null;
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [needsWindows, stopWindows, failed]);

  return useMemo<ScheduleState>(() => {
    if (failed) return { status: 'error', retry: () => setFailed(false) };
    if (!routeId || !index) return { status: 'loading' };
    const own = scheduleForRoute(routeId, index);
    if (own || !needsWindows || !origin) return { status: 'ready', data: own };
    if (!stopWindows) return { status: 'loading' };
    const windows = (stopWindows[origin.id] ?? []).filter((w) => w[0] === routeId);
    const hasService = [0, 1, 2, 3, 4, 5, 6].some(
      (day) => summarizeWindowsDay(windows, day).departures > 0,
    );
    return {
      status: 'ready',
      data: hasService ? { kind: 'windows', windows, originName: origin.name } : null,
    };
  }, [failed, index, needsWindows, origin, routeId, stopWindows]);
}

/** Hora actual que avanza sola mientras la ficha está abierta. */
function useNow(active: boolean): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return undefined;
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, [active]);
  return now;
}

const DAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const DAY_SHORT = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

type DayGroup = 'weekday' | 'saturday' | 'sunday';
const DAY_GROUPS: Array<{ id: DayGroup; label: string }> = [
  { id: 'weekday', label: 'Lun–Vie' },
  { id: 'saturday', label: 'Sáb' },
  { id: 'sunday', label: 'Dom' },
];

function groupOfDay(day: number): DayGroup {
  if (day === 5) return 'saturday';
  if (day === 6) return 'sunday';
  return 'weekday';
}

/** Día que representa al grupo: hoy si cae en él; si no, lunes / sábado / domingo. */
function representativeDay(group: DayGroup, today: number): number {
  if (groupOfDay(today) === group) return today;
  return group === 'weekday' ? 0 : group === 'saturday' ? 5 : 6;
}

function formatHeadway(minutes: number): string {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  return m % 60 === 0 ? `${m / 60} h` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

function formatNext(next: NextDeparture, today: number): string {
  const clock = formatServiceClock(next.minutes);
  if (next.dayOffset === 0) return clock;
  if (next.dayOffset === 1) return `mañana ${clock}`;
  return `${DAY_SHORT[(today + next.dayOffset) % 7]} ${clock}`;
}

function formatRange(first: number | null, last: number | null): string | null {
  if (first === null || last === null) return null;
  return `${formatServiceClock(first)}–${formatServiceClock(last)}`;
}

function formatKm(km: number): string {
  return `${km.toLocaleString('es-CL', { maximumFractionDigits: 1 })} km`;
}

function pathKilometers(path: Array<[number, number]>): number {
  let km = 0;
  for (let i = 1; i < path.length; i++) {
    const [a, b] = [path[i - 1], path[i]];
    const R = 6371;
    const dLat = ((b[0] - a[0]) * Math.PI) / 180;
    const dLng = ((b[1] - a[1]) * Math.PI) / 180;
    const lat1 = (a[0] * Math.PI) / 180;
    const lat2 = (b[0] * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    km += 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  return km;
}

export function RouteDetailSheet({
  open,
  route,
  onOpenChange,
  onFocusRoute,
  onDeselectRoute,
  onSelectStop,
}: RouteDetailSheetProps) {
  const schedule = useRouteSchedule(route, open);
  const now = useNow(open);
  const lengthKm = useMemo(() => (route ? pathKilometers(route.path) : 0), [route]);

  const panelChrome = useMemo(() => {
    if (!route) return null;
    const TypeIcon = ROUTE_TYPES[route.type].Icon;
    return {
      eyebrow: (
        <div className="flex flex-wrap items-center gap-1.5">
          <RouteBadge code={route.code} color={route.color} />
          <TypeIcon />
          <span>{ROUTE_TYPES[route.type].label}</span>
          {route.network === 'Interurbano Biobío' && (
            <Badge
              variant="outline"
              className="border-teal-600/40 bg-teal-500/10 text-[10px] font-normal text-teal-900 dark:text-teal-200"
            >
              Interurbano · licitado DTPR
            </Badge>
          )}
        </div>
      ),
      actions: (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" onClick={onFocusRoute}>
            <RouteIcon className="size-3.5" />
            Centrar en mapa
          </Button>
          <Button size="sm" variant="secondary" onClick={onDeselectRoute}>
            <XCircle className="size-3.5" />
            Deseleccionar
          </Button>
          <WikiLinkButton kind="route" code={route.code} />
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Reportar un problema con este recorrido"
            title="Reportar un problema con este recorrido"
            onClick={() =>
              window.open(
                'https://github.com/marcorojasb/conce.patagua.dev/issues',
                '_blank',
                'noopener',
              )
            }
          >
            <Github className="size-4" />
          </Button>
        </div>
      ),
    };
  }, [onDeselectRoute, onFocusRoute, route]);

  if (!route || !panelChrome) return null;

  return (
    <FloatingInfoPanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={route.name}
      description={route.operator}
      scroll={false}
      eyebrow={panelChrome.eyebrow}
      actions={panelChrome.actions}
    >
      <Tabs defaultValue="info" className="flex h-full min-h-0 flex-col px-5 pb-5 pt-4">
        <TabsList className="self-start">
          <TabsTrigger value="info">
            <Info className="size-3" />
            Info
          </TabsTrigger>
          <TabsTrigger value="recorrido">
            <RouteIcon className="size-3" />
            Recorrido
          </TabsTrigger>
          <TabsTrigger value="horarios">
            <Clock className="size-3" />
            Horarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="min-h-0 flex-1">
          <ScrollArea className="h-full pr-2 scroll-fade-y">
            <InfoTab route={route} schedule={schedule} now={now} lengthKm={lengthKm} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recorrido" className="min-h-0 flex-1">
          <ScrollArea className="h-full pr-2 scroll-fade-y">
            <StopsTab route={route} lengthKm={lengthKm} onSelectStop={onSelectStop} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="horarios" className="min-h-0 flex-1">
          <ScrollArea className="h-full pr-2 scroll-fade-y">
            <ScheduleTab route={route} schedule={schedule} now={now} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </FloatingInfoPanel>
  );
}

function StatCard({
  label,
  value,
  detail,
  indicator,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  indicator?: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {indicator}
        {label}
      </div>
      <div className="mt-1 truncate text-base font-semibold leading-tight tabular-nums">
        {value}
      </div>
      {detail && (
        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{detail}</div>
      )}
    </div>
  );
}

function stopsNoun(route: Route, count: number): string {
  if (route.type === 'biotren') return count === 1 ? 'estación' : 'estaciones';
  return count === 1 ? 'paradero' : 'paraderos';
}

function InfoTab({
  route,
  schedule,
  now,
  lengthKm,
}: {
  route: Route;
  schedule: ScheduleState;
  now: Date;
  lengthKm: number;
}) {
  const today = chileClock(now).day;
  const routeCard =
    route.stops.length > 0 ? (
      <StatCard
        label="Recorrido"
        value={`${route.stops.length} ${stopsNoun(route, route.stops.length)}`}
        detail={formatKm(lengthKm)}
      />
    ) : (
      <StatCard label="Recorrido" value={formatKm(lengthKm)} detail="sin paraderos cargados" />
    );

  return (
    <div className="space-y-4">
      <section>
        <SectionLabel icon={<Clock />} aside={`hoy, ${DAY_NAMES[today]}`}>
          Servicio
        </SectionLabel>
        {schedule.status === 'loading' ? (
          <div className="grid grid-cols-2 gap-2" aria-busy="true" aria-label="Cargando horario">
            <Skeleton className="h-[74px]" />
            <Skeleton className="h-[74px]" />
            <Skeleton className="h-[74px]" />
            {routeCard}
          </div>
        ) : schedule.status === 'error' ? (
          <div className="space-y-2">
            <ScheduleError retry={schedule.retry} />
            <div className="grid grid-cols-2 gap-2">{routeCard}</div>
          </div>
        ) : schedule.data ? (
          <TodayCards data={schedule.data} now={now} routeCard={routeCard} />
        ) : (
          <div className="space-y-2">
            <Notice icon={<Info />}>
              Este recorrido no tiene horario publicado en los datos abiertos que usa
              el visor, así que no podemos indicar a qué hora pasa.
            </Notice>
            <div className="grid grid-cols-2 gap-2">{routeCard}</div>
          </div>
        )}
      </section>

      <section>
        <SectionLabel icon={<Wallet />}>Tarifa</SectionLabel>
        <div className="rounded-md border bg-card p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5 text-sm font-medium">
              {route.type === 'biotren' ? '$680 – $2.400' : '$750'}
              <span className="text-[11px] font-normal text-muted-foreground">
                CLP {route.type === 'biotren' ? 'por tramo' : 'adulto'}
              </span>
            </div>
            <Badge variant="outline" className="gap-1 font-normal">
              <CreditCard className="size-3" />
              Pago electrónico próximamente
            </Badge>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
            {route.type === 'biotren'
              ? 'Boletería EFE: el valor depende del tramo origen-destino. Aún no hay tarjeta integrada con las micros.'
              : 'Valor referencial en efectivo en buses del Gran Concepción. DTPR anunció pago electrónico integrado para 2026; reglas y descuentos aún no publicados.'}
          </p>
        </div>
      </section>

      <SourceNote route={route} schedule={schedule} />
    </div>
  );
}

function ScheduleError({ retry }: { retry: () => void }) {
  return (
    <Notice tone="danger" icon={<AlertTriangle />}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>No se pudo cargar el horario.</span>
        <Button size="sm" variant="outline" className="h-7" onClick={retry}>
          Reintentar
        </Button>
      </div>
    </Notice>
  );
}

function TodayCards({
  data,
  now,
  routeCard,
}: {
  data: RouteScheduleData;
  now: Date;
  routeCard: ReactNode;
}) {
  const summary = todaySummary(data, now);
  const range = formatRange(summary.first, summary.last);
  const directions = data.kind === 'trips' ? data.directions.length : 1;
  const estimated = data.kind === 'trips' && data.estimated;
  const next = summary.nextDeparture ? formatNext(summary.nextDeparture, summary.day) : null;

  let nowValue: string;
  let nowDetail: string;
  if (summary.operatingNow && summary.nextDeparture && summary.nextDeparture.dayOffset > 0) {
    nowValue = 'Últimos viajes';
    nowDetail = next ? `próxima salida ${next}` : 'sin más salidas';
  } else if (summary.operatingNow) {
    nowValue = summary.headwayNow ? `cada ~${formatHeadway(summary.headwayNow)}` : 'En servicio';
    // Con ventanas de paso no se conoce cada salida, pero sí hasta cuándo hay.
    nowDetail = next
      ? `próxima ${next}`
      : summary.last !== null
        ? `hasta las ${formatServiceClock(summary.last)}`
        : 'sin más salidas';
    if (summary.headwayNow && directions > 1) nowDetail = `por sentido · ${nowDetail}`;
  } else {
    nowValue = 'Sin servicio';
    nowDetail = next ? `próxima ${next}` : 'sin salidas programadas';
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard
        label="Horario"
        value={range ?? 'Sin servicio'}
        detail={range ? 'primera y última salida' : 'no hay salidas hoy'}
      />
      <StatCard
        label="Salidas"
        value={summary.departures}
        detail={
          directions > 1
            ? `${estimated ? 'estimadas' : 'programadas'} · ambos sentidos`
            : estimated
              ? 'estimadas hoy'
              : 'programadas hoy'
        }
      />
      <StatCard
        label="Ahora"
        value={nowValue}
        detail={nowDetail}
        indicator={
          <span
            aria-hidden
            className={cn(
              'size-1.5 rounded-full',
              summary.operatingNow ? 'bg-emerald-500' : 'bg-muted-foreground/40',
            )}
          />
        }
      />
      {routeCard}
    </div>
  );
}

function SourceNote({ route, schedule }: { route: Route; schedule: ScheduleState }) {
  const patterns = PATTERNS_BY_ROUTE.get(route.id) ?? [];

  if (patterns.length > 0) {
    const notes = [...new Set(patterns.map((p) => p.note))];
    const sources = new Map<string, string>();
    for (const p of patterns) if (!sources.has(p.sourceUrl)) sources.set(p.sourceUrl, p.sourceLabel);
    return (
      <Notice icon={<Info />}>
        <p>Horario estimado, no es el itinerario oficial. {notes.join(' ')}</p>
        <p className="mt-1">
          Fuente:{' '}
          {[...sources].map(([url, label], i) => (
            <span key={url}>
              {i > 0 && ' · '}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-foreground"
              >
                {label}
                <ExternalLink className="size-3" />
              </a>
            </span>
          ))}
          {route.type === 'biotren' && '. Estaciones y vía: OpenStreetMap.'}
        </p>
      </Notice>
    );
  }

  if (route.id.startsWith('gtfs-route-')) {
    const kind = schedule.status === 'ready' ? schedule.data?.kind : undefined;
    return (
      <Notice icon={<Info />}>
        {kind === 'trips'
          ? 'Recorrido, paraderos y horario programado del GTFS estático Gran Concepción (Subsecretaría de Transportes). Cada salida es un viaje planificado desde su cabecera; no son llegadas en vivo.'
          : kind === 'windows'
            ? 'Recorrido, paraderos y horario programado del GTFS estático Gran Concepción (Subsecretaría de Transportes), resumido en su primer paradero porque el feed trae horas incompletas en algunos viajes. No son llegadas en vivo.'
            : 'Recorrido y paraderos del GTFS estático Gran Concepción (Subsecretaría de Transportes).'}
      </Notice>
    );
  }

  return (
    <Notice icon={<Info />}>
      Trazado y paraderos desde datos abiertos (OpenStreetMap y descripción oficial del
      servicio).
    </Notice>
  );
}

function ScheduleTab({
  route,
  schedule,
  now,
}: {
  route: Route;
  schedule: ScheduleState;
  now: Date;
}) {
  const clock = chileClock(now);
  const [pickedGroup, setPickedGroup] = useState<DayGroup | null>(null);
  const group = pickedGroup ?? groupOfDay(clock.day);

  if (schedule.status === 'loading') {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Cargando horario">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
        <Skeleton className="h-32" />
      </div>
    );
  }
  if (schedule.status === 'error') return <ScheduleError retry={schedule.retry} />;
  if (!schedule.data) {
    return (
      <Notice icon={<Info />}>
        No hay horario abierto para este recorrido: los datos que usa el visor no
        incluyen sus viajes programados ni una frecuencia publicada. Cuando exista una
        fuente oficial, aquí aparecerán las salidas por hora.
      </Notice>
    );
  }

  const data = schedule.data;
  const day = representativeDay(group, clock.day);
  const isToday = day === clock.day;
  const summary = daySummary(data, day);
  const currentHour = isToday ? Math.floor(clock.minutes / 60) : null;
  const dayLabel = isToday ? `hoy, ${DAY_NAMES[day]}` : DAY_NAMES[day];

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Día de la semana"
        className="inline-flex rounded-lg bg-muted p-1 text-muted-foreground"
      >
        {DAY_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={g.id === group}
            onClick={() => setPickedGroup(g.id)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors focus-ring',
              g.id === group
                ? 'bg-background text-foreground shadow-sm'
                : 'hover:text-foreground/80',
            )}
          >
            {g.label}
            {groupOfDay(clock.day) === g.id && (
              <>
                {' '}
                <span className="text-[10px] font-normal text-muted-foreground">hoy</span>
              </>
            )}
          </button>
        ))}
      </div>

      {summary.departures === 0 ? (
        <Notice icon={<Info />}>
          Sin salidas el {DAY_NAMES[day]}.
        </Notice>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            <MiniStat label="Primera" value={formatServiceClock(summary.first ?? 0)} />
            <MiniStat label="Última" value={formatServiceClock(summary.last ?? 0)} />
            <MiniStat label="Salidas" value={String(summary.departures)} />
            <MiniStat
              label="Intervalo"
              value={summary.medianHeadway ? `~${formatHeadway(summary.medianHeadway)}` : '—'}
            />
          </div>

          {data.kind === 'trips' ? (
            <section>
              <SectionLabel icon={<BarChart3 />} aside={dayLabel}>
                Salidas por hora
              </SectionLabel>
              <HourlyChart
                hourly={departuresByHour(data.all, day)}
                currentHour={currentHour}
                dayName={DAY_NAMES[day]}
              />
            </section>
          ) : (
            <Notice icon={<Info />}>
              Sin desglose por hora para este recorrido: las cifras son las pasadas
              programadas por su primer paradero,{' '}
              <span className="font-medium text-foreground">{data.originName}</span>.
            </Notice>
          )}
        </>
      )}

      {data.kind === 'trips' && data.directions.length > 1 && (
        <section>
          <SectionLabel icon={<RouteIcon />}>Por sentido</SectionLabel>
          <ul className="divide-y rounded-md border bg-card">
            {data.directions.map((direction) => {
              const s = summarizeDay(direction.schedules, day);
              const range = formatRange(s.first, s.last);
              return (
                <li key={direction.label} className="px-3 py-2">
                  <div className="text-sm font-medium leading-tight">{direction.label}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                    {range
                      ? [
                          range,
                          `${s.departures} salidas`,
                          s.medianHeadway ? `cada ~${formatHeadway(s.medianHeadway)}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')
                      : 'sin servicio este día'}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <SourceNote route={route} schedule={schedule} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border bg-card px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

const AXIS_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

function HourlyChart({
  hourly,
  currentHour,
  dayName,
}: {
  hourly: number[];
  currentHour: number | null;
  dayName: string;
}) {
  const max = Math.max(...hourly, 1);
  const peak = hourly.indexOf(max);
  // Con frecuencia pareja (patrones estimados) no hay una "hora con más salidas".
  const even = hourly.every((count) => count === 0 || count === max);
  const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const plural = (n: number) => `${n} ${n === 1 ? 'salida' : 'salidas'}`;

  return (
    <div className="rounded-md border bg-card p-3">
      <div
        role="group"
        aria-label={`Salidas por hora, ${dayName}`}
        className="flex h-28 items-end gap-[2px]"
      >
        {hourly.map((count, hour) => {
          const label = `${hh(hour)} · ${plural(count)}`;
          const isCurrent = hour === currentHour;
          return (
            <div
              key={hour}
              role="img"
              aria-label={isCurrent ? `${label} (hora actual)` : label}
              title={label}
              className="flex h-full min-w-0 flex-1 flex-col justify-end"
            >
              <div
                className={cn(
                  'w-full rounded-t-[3px]',
                  count === 0
                    ? 'bg-border'
                    : isCurrent
                      ? 'bg-foreground'
                      : 'bg-foreground/30',
                )}
                style={{ height: count === 0 ? 2 : `${Math.max((count / max) * 100, 6)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-[2px] font-mono text-[10px] text-muted-foreground" aria-hidden>
        {hourly.map((_, hour) => (
          <span
            key={hour}
            className="min-w-0 flex-1 overflow-visible whitespace-nowrap"
          >
            {AXIS_HOURS.includes(hour) ? String(hour).padStart(2, '0') : ''}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {even ? (
          <>Ritmo parejo: {plural(max)} por hora.</>
        ) : (
          <>
            Hora con más salidas:{' '}
            <span className="font-medium text-foreground">{hh(peak)}</span> ({plural(max)})
          </>
        )}
        {currentHour !== null && (even || currentHour !== peak) && (
          <>
            {' · '}ahora ({hh(currentHour)}): {plural(hourly[currentHour])}
          </>
        )}
      </p>
    </div>
  );
}

function StopsTab({
  route,
  lengthKm,
  onSelectStop,
}: {
  route: Route;
  lengthKm: number;
  onSelectStop: (id: string) => void;
}) {
  const stops = route.stops;
  const last = stops.length - 1;

  return (
    <div className="space-y-3">
      {route.digitized && (
        // Este trazado se digitalizó desde la descripción oficial del servicio y
        // waypoints OSM citados; no es un shape GTFS verificado. Los urbanos y
        // Biotrén no lo necesitan porque vienen de GTFS / OSM directos.
        <Notice tone="warning" icon={<AlertTriangle />}>
          Trazado aproximado: se reconstruyó a partir de la descripción oficial del
          recorrido y calles de OpenStreetMap, no de un trazado oficial georreferenciado.
        </Notice>
      )}

      {stops.length === 0 ? (
        <Notice icon={<Info />}>
          Este recorrido viene de OpenStreetMap sin lista de paraderos. Largo total:{' '}
          <span className="font-semibold text-foreground">{formatKm(lengthKm)}</span>.
          Activa la capa de paraderos para ver los puntos cercanos.
        </Notice>
      ) : (
        <section>
          <SectionLabel
            icon={<MapPin />}
            aside={`${stops.length} · ${formatKm(lengthKm)}`}
          >
            {route.type === 'biotren' ? 'Estaciones en orden' : 'Paraderos en orden'}
          </SectionLabel>
          <p className="mb-2 text-[11px] text-muted-foreground">
            Toca {route.type === 'biotren' ? 'una estación' : 'un paradero'} para verlo
            en el mapa.
          </p>
          <ol>
            {stops.map((stop, i) => {
              const endpoint = i === 0 ? 'Origen' : i === last ? 'Destino' : null;
              return (
                <li key={`${stop.id}-${i}`} className="relative">
                  {i < last && (
                    <span
                      aria-hidden
                      className="absolute left-[13px] top-4 h-full w-0.5"
                      style={{ background: route.color, opacity: 0.45 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectStop(stop.id)}
                    className="relative flex w-full items-start gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-muted focus-ring"
                  >
                    <span className="flex w-4 shrink-0 justify-center pt-1" aria-hidden>
                      <span
                        className={cn(
                          'rounded-full border-2 bg-background',
                          endpoint ? 'size-3.5 -mt-px' : 'size-3',
                        )}
                        style={{
                          borderColor: route.color,
                          background: endpoint ? route.color : undefined,
                        }}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      {endpoint && (
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {endpoint}
                        </span>
                      )}
                      <span
                        className={cn(
                          'block text-sm leading-tight',
                          endpoint ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {stop.name}
                      </span>
                    </span>
                    <span className="shrink-0 pt-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
