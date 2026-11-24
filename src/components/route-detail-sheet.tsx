import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  ChevronRight,
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
import { GTFS_CONCEPCION_SOURCE } from '@/data/gtfs-stops.generated';
import { ROUTE_TYPES } from '@/data/routes';
import { STATIC_SERVICE_PATTERNS, type StaticServicePattern } from '@/data/static-service-patterns';
import { WikiLinkButton } from '@/components/wiki-link';
import { chileClock } from '@/lib/chile-time';
import { isRouteOperatingAt } from '@/lib/operating-hours';
import {
  departuresByHour,
  isEvenlySpaced,
  summarizeDay,
  summarizeToday,
  type NextDeparture,
} from '@/lib/route-schedule-summary';
import { formatServiceClock } from '@/lib/stop-services';
import { isInterurban } from '@/lib/route-labels';
import { cn } from '@/lib/utils';
import type { LatLngTuple, Route, RouteSchedule, Stop } from '@/types/transport';

interface RouteDetailSheetProps {
  open: boolean;
  route: Route | null;
  onOpenChange: (open: boolean) => void;
  onFocusRoute: () => void;
  onDeselectRoute: () => void;
  onSelectStop: (id: string) => void;
}

// Mismo import() que la capa de servicios en curso (activa al iniciar): el
// chunk de horarios suele estar ya en caché al abrir la ficha y no pesa en la
// carga inicial. Las micros se leen por sentido ("gtfs-route-835#0") y
// Biotrén por patrón EFE (un id por sentido y tipo de día).
let schedulesPromise: Promise<Record<string, RouteSchedule>> | null = null;
function loadSchedules(): Promise<Record<string, RouteSchedule>> {
  schedulesPromise ??= Promise.all([
    import('@/data/gtfs-schedule.generated'),
    import('@/realtime/static-service-schedules'),
  ]).then(([gtfs, staticSchedules]) => ({
    ...gtfs.ROUTE_DIRECTION_SCHEDULES,
    ...staticSchedules.STATIC_ROUTE_SCHEDULES,
  }));
  return schedulesPromise;
}

const PATTERNS_BY_ROUTE = new Map<string, StaticServicePattern[]>();
for (const pattern of STATIC_SERVICE_PATTERNS) {
  const list = PATTERNS_BY_ROUTE.get(pattern.routeId) ?? [];
  list.push(pattern);
  PATTERNS_BY_ROUTE.set(pattern.routeId, list);
}

/** Un sentido tal como lo muestra la ficha. */
interface DirectionView {
  /** Clave de su horario: "gtfs-route-835#0" en micros, "forward"/"reverse" en patrones estáticos. */
  key: string;
  /** Código del letrero en ese sentido ("10A"). */
  variant?: string;
  destination: string;
  /** Solo patrones estáticos (Biotrén): estación de salida. */
  origin?: string;
  stops: Stop[];
  km: number;
}

function routeDirections(route: Route): DirectionView[] {
  if (route.directions && route.directions.length > 0) {
    return route.directions.map((d) => ({
      key: `${route.id}#${d.directionId}`,
      variant: d.variant,
      destination: d.destination ?? d.headsign,
      stops: d.stops,
      km: pathKilometers(d.path),
    }));
  }
  // Biotrén no tiene sentidos en el modelo: salen de sus patrones EFE, que
  // recorren `route.stops` en orden (forward) o al revés (reverse).
  const patterns = PATTERNS_BY_ROUTE.get(route.id) ?? [];
  const km = pathKilometers(route.path);
  const views: DirectionView[] = [];
  for (const direction of ['forward', 'reverse'] as const) {
    const pattern = patterns.find((p) => p.direction === direction);
    if (!pattern) continue;
    const [origin, destination] = pattern.directionLabel.split('→').map((part) => part.trim());
    views.push({
      key: direction,
      origin: destination ? origin : undefined,
      destination: destination || pattern.directionLabel,
      stops: direction === 'forward' ? route.stops : [...route.stops].reverse(),
      km,
    });
  }
  return views;
}

interface RouteScheduleData {
  /** Un horario por sentido (en Biotrén, por sentido y tipo de día). */
  all: RouteSchedule[];
  /** Horarios de cada sentido, por `DirectionView.key`. */
  byDirection: Map<string, RouteSchedule[]>;
  /** Reconstruido desde una frecuencia anunciada, no salidas publicadas una a una. */
  estimated: boolean;
}

function scheduleForRoute(
  route: Route,
  index: Record<string, RouteSchedule>,
): RouteScheduleData | null {
  const byDirection = new Map<string, RouteSchedule[]>();
  const add = (key: string, schedule: RouteSchedule | undefined) => {
    if (schedule) byDirection.set(key, [...(byDirection.get(key) ?? []), schedule]);
  };
  const patterns = PATTERNS_BY_ROUTE.get(route.id);
  if (patterns) {
    for (const pattern of patterns) add(pattern.direction, index[pattern.id]);
  } else {
    for (const directionId of [0, 1]) {
      add(`${route.id}#${directionId}`, index[`${route.id}#${directionId}`]);
    }
  }
  if (byDirection.size === 0) return null;
  return {
    all: [...byDirection.values()].flat(),
    byDirection,
    estimated: patterns?.some((p) => !p.trips) ?? false,
  };
}

type ScheduleState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; data: RouteScheduleData | null };

function useRouteSchedule(route: Route | null, active: boolean): ScheduleState {
  const [index, setIndex] = useState<Record<string, RouteSchedule> | null>(null);
  const [failed, setFailed] = useState(false);
  const wanted = active && route !== null;

  useEffect(() => {
    if (!wanted || index || failed) return undefined;
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
  }, [wanted, index, failed]);

  return useMemo<ScheduleState>(() => {
    if (failed) return { status: 'error', retry: () => setFailed(false) };
    if (!route || !index) return { status: 'loading' };
    return { status: 'ready', data: scheduleForRoute(route, index) };
  }, [failed, index, route]);
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

function pathKilometers(path: LatLngTuple[]): number {
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

/** "2025-12-31" → "31-12-2025". */
function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

// DTPR versiona como "Gran Concepción20250228": la fecha del programa va al final.
const FEED_PROGRAM_DATE = (() => {
  const match = /(\d{4})(\d{2})(\d{2})\s*$/.exec(GTFS_CONCEPCION_SOURCE.feedVersion);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
})();

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
  const directions = useMemo(() => (route ? routeDirections(route) : []), [route]);
  const routeKm = useMemo(() => (route ? pathKilometers(route.path) : 0), [route]);
  const [tab, setTab] = useState('info');
  // El sentido elegido vale para el recorrido en que se eligió.
  const [pickedDirection, setPickedDirection] = useState<{ routeId: string; key: string } | null>(
    null,
  );
  const directionKey =
    pickedDirection && pickedDirection.routeId === route?.id
      ? pickedDirection.key
      : directions[0]?.key;

  const panelChrome = useMemo(() => {
    if (!route) return null;
    const TypeIcon = ROUTE_TYPES[route.type].Icon;
    return {
      eyebrow: (
        <div className="flex flex-wrap items-center gap-1.5">
          <RouteBadge code={route.code} color={route.color} />
          <TypeIcon />
          <span>{ROUTE_TYPES[route.type].label}</span>
          {isInterurban(route) && (
            <Badge
              variant="outline"
              className="border-teal-600/40 bg-teal-500/10 text-[10px] font-normal text-teal-900 dark:text-teal-200"
            >
              {route.network}
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

  const pickDirection = (key: string) => setPickedDirection({ routeId: route.id, key });
  const showDirection = (key: string) => {
    pickDirection(key);
    setTab('recorrido');
  };

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
      <Tabs value={tab} onValueChange={setTab} className="flex h-full min-h-0 flex-col px-5 pb-5 pt-4">
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
            <InfoTab
              route={route}
              directions={directions}
              schedule={schedule}
              now={now}
              routeKm={routeKm}
              onShowDirection={showDirection}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recorrido" className="min-h-0 flex-1">
          <ScrollArea className="h-full pr-2 scroll-fade-y">
            <StopsTab
              route={route}
              directions={directions}
              directionKey={directionKey}
              onPickDirection={pickDirection}
              routeKm={routeKm}
              onSelectStop={onSelectStop}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="horarios" className="min-h-0 flex-1">
          <ScrollArea className="h-full pr-2 scroll-fade-y">
            <ScheduleTab route={route} directions={directions} schedule={schedule} now={now} />
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

/** Letrero de un sentido: código de la variante (o de la ruta) y destino. */
function DirectionSign({
  route,
  direction,
  className,
}: {
  route: Route;
  direction: DirectionView;
  className?: string;
}) {
  return (
    <span className={cn('flex min-w-0 items-center gap-1.5', className)}>
      <RouteBadge code={direction.variant ?? route.code} color={route.color} />
      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-label="hacia" />
      <span className="truncate">{direction.destination}</span>
    </span>
  );
}

function InfoTab({
  route,
  directions,
  schedule,
  now,
  routeKm,
  onShowDirection,
}: {
  route: Route;
  directions: DirectionView[];
  schedule: ScheduleState;
  now: Date;
  routeKm: number;
  onShowDirection: (key: string) => void;
}) {
  const today = chileClock(now).day;
  const routeCard =
    route.stops.length > 0 ? (
      <StatCard
        label="Recorrido"
        value={`${route.stops.length} ${stopsNoun(route, route.stops.length)}`}
        detail={
          (route.directions?.length ?? 0) > 1
            ? 'sumando ambos sentidos'
            : formatKm(directions[0]?.km ?? routeKm)
        }
      />
    ) : (
      <StatCard label="Recorrido" value={formatKm(routeKm)} detail="sin paraderos cargados" />
    );
  const data = schedule.status === 'ready' ? schedule.data : null;

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
        ) : data ? (
          <TodayCards route={route} data={data} now={now} routeCard={routeCard} />
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

      {directions.length > 0 && (
        <section aria-label="Sentidos">
          <SectionLabel icon={<ArrowLeftRight />}>
            {directions.length === 1 ? 'Sentido' : 'Sentidos'}
          </SectionLabel>
          <ul className="space-y-1.5">
            {directions.map((direction) => {
              const daySchedules = data?.byDirection.get(direction.key);
              const day = daySchedules ? summarizeDay(daySchedules, today) : null;
              const range = day ? formatRange(day.first, day.last) : null;
              const details = [
                direction.origin ? `desde ${direction.origin}` : null,
                `${direction.stops.length} ${stopsNoun(route, direction.stops.length)}`,
                formatKm(direction.km),
                data ? (range ? `hoy ${range}` : 'hoy sin salidas') : null,
              ].filter(Boolean);
              return (
                <li key={direction.key}>
                  <button
                    type="button"
                    onClick={() => onShowDirection(direction.key)}
                    title="Ver sus paraderos en orden"
                    className="flex w-full items-center gap-2 rounded-md border bg-card p-2 text-left transition-colors hover:bg-accent focus-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <DirectionSign
                        route={route}
                        direction={direction}
                        className="text-sm font-medium"
                      />
                      <div className="mt-0.5 truncate text-[11px] text-muted-foreground tabular-nums">
                        {details.join(' · ')}
                      </div>
                    </div>
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>
          {route.directions?.length === 1 && (
            <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
              El GTFS oficial publica un solo sentido para este recorrido.
            </p>
          )}
        </section>
      )}

      <section>
        <SectionLabel icon={<Wallet />}>Tarifa</SectionLabel>
        <div className="rounded-md border bg-card p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5 text-sm font-medium">
              {route.type === 'biotren' ? '$680 – $2.400' : isInterurban(route) ? 'Según tramo' : '$750'}
              <span className="text-[11px] font-normal text-muted-foreground">
                {route.type === 'biotren' ? 'CLP por tramo' : isInterurban(route) ? 'interurbano' : 'CLP adulto'}
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
              : isInterurban(route)
                ? 'Los servicios interurbanos cobran según el tramo y tienen su propia tarifa regulada; no aplica la tarifa urbana. Revisa el artículo del recorrido en la wiki.'
                : 'Valor referencial en efectivo en buses urbanos del Gran Concepción. DTPR anunció pago electrónico integrado para 2026; reglas y descuentos aún no publicados.'}
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
  route,
  data,
  now,
  routeCard,
}: {
  route: Route;
  data: RouteScheduleData;
  now: Date;
  routeCard: ReactNode;
}) {
  const summary = summarizeToday(data.all, now);
  // Misma regla que el punto "operando ahora" de la barra lateral y la ficha
  // de paradero; sin tramos calculados se usa el viaje en curso del horario.
  const operatingNow = route.serviceSpans ? isRouteOperatingAt(route, now) : summary.operatingNow;
  const range = formatRange(summary.first, summary.last);
  const bothWays = data.byDirection.size > 1;
  const next = summary.nextDeparture ? formatNext(summary.nextDeparture, summary.day) : null;

  let nowValue: string;
  let nowDetail: string;
  if (operatingNow && summary.nextDeparture && summary.nextDeparture.dayOffset > 0) {
    nowValue = 'Últimos viajes';
    nowDetail = next ? `próxima salida ${next}` : 'sin más salidas';
  } else if (operatingNow) {
    nowValue = summary.headwayNow ? `cada ~${formatHeadway(summary.headwayNow)}` : 'En servicio';
    nowDetail = next ? `próxima ${next}` : 'sin más salidas';
    if (summary.headwayNow && bothWays) nowDetail = `por sentido · ${nowDetail}`;
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
          bothWays
            ? `${data.estimated ? 'estimadas' : 'programadas'} · ambos sentidos`
            : data.estimated
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
              operatingNow ? 'bg-emerald-500' : 'bg-muted-foreground/40',
            )}
          />
        }
      />
      {routeCard}
    </div>
  );
}

const linkClass =
  'inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-foreground';

function SourceNote({ route, schedule }: { route: Route; schedule: ScheduleState }) {
  const patterns = PATTERNS_BY_ROUTE.get(route.id);
  if (patterns) return <PatternSourceNote route={route} patterns={patterns} />;
  if (route.id.startsWith('gtfs-route-')) {
    const hasSchedule = schedule.status === 'ready' && schedule.data !== null;
    return <GtfsSourceNote hasSchedule={hasSchedule} />;
  }
  return (
    <Notice icon={<Info />}>
      Trazado y paraderos desde datos abiertos (OpenStreetMap y descripción oficial del
      servicio).
    </Notice>
  );
}

function GtfsSourceNote({ hasSchedule }: { hasSchedule: boolean }) {
  const feed = GTFS_CONCEPCION_SOURCE;
  const expired = Date.parse(`${feed.feedEndDate}T23:59:59-03:00`) < Date.now();
  return (
    <Notice icon={<Info />}>
      <p>
        {hasSchedule ? 'Recorrido, paraderos y horario programado' : 'Recorrido y paraderos'} del
        GTFS oficial de la DTPR
        {FEED_PROGRAM_DATE ? `, programa del ${FEED_PROGRAM_DATE}` : ''} (versión «
        {feed.feedVersion}»).
      </p>
      <p className="mt-1">
        {expired
          ? `Su calendario declarado (${formatIsoDate(feed.feedStartDate)} a ${formatIsoDate(feed.feedEndDate)}) ya venció, pero es la última programación publicada: puede no reflejar cambios posteriores.`
          : `Calendario declarado vigente hasta el ${formatIsoDate(feed.feedEndDate)}.`}
        {hasSchedule &&
          ' Cada salida es un viaje planificado desde su cabecera; no son llegadas en vivo.'}
      </p>
      <p className="mt-1">
        Fuente:{' '}
        <a href={feed.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
          DTPR · granconcepcion.zip
          <ExternalLink className="size-3" />
        </a>
      </p>
    </Notice>
  );
}

function PatternSourceNote({
  route,
  patterns,
}: {
  route: Route;
  patterns: StaticServicePattern[];
}) {
  const official = patterns.every((p) => p.confidence === 'official' && p.trips);
  const notes = [...new Set(patterns.map((p) => p.note))];
  const sources = new Map<string, string>();
  for (const p of patterns) if (!sources.has(p.sourceUrl)) sources.set(p.sourceUrl, p.sourceLabel);
  const operator = route.type === 'biotren' ? 'EFE' : 'el operador';

  return (
    <Notice icon={<Info />}>
      <p>
        {official
          ? `Itinerario oficial de ${operator}, salida por salida. Cuenta solo los viajes de cabecera a cabecera.`
          : 'Horario estimado desde una frecuencia publicada; no es el itinerario oficial.'}
        {route.type === 'biotren' && ' Estaciones y vía: OpenStreetMap.'}
      </p>
      <details className="mt-1">
        <summary className="cursor-pointer rounded-sm hover:text-foreground focus-ring">
          Fuentes y notas del itinerario
        </summary>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {[...sources].map(([url, label]) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {label}
                <ExternalLink className="size-3" />
              </a>
            </li>
          ))}
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </details>
    </Notice>
  );
}

function ScheduleTab({
  route,
  directions,
  schedule,
  now,
}: {
  route: Route;
  directions: DirectionView[];
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
      <div className="space-y-4">
        <Notice icon={<Info />}>
          No hay horario abierto para este recorrido: los datos que usa el visor no
          incluyen sus viajes programados ni una frecuencia publicada.
        </Notice>
        <SourceNote route={route} schedule={schedule} />
      </div>
    );
  }

  const data = schedule.data;
  const day = representativeDay(group, clock.day);
  const isToday = day === clock.day;
  const summary = summarizeDay(data.all, day);
  const currentHour = isToday ? Math.floor(clock.minutes / 60) : null;
  const dayLabel = isToday ? `hoy, ${DAY_NAMES[day]}` : DAY_NAMES[day];
  const scheduledDirections = directions.filter((d) => data.byDirection.has(d.key));

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
        <Notice icon={<Info />}>Sin salidas el {DAY_NAMES[day]}.</Notice>
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

          {scheduledDirections.length > 1 && (
            <section aria-label="Por sentido">
              <SectionLabel icon={<ArrowLeftRight />} aside={dayLabel}>
                Por sentido
              </SectionLabel>
              <ul className="divide-y rounded-md border bg-card">
                {scheduledDirections.map((direction) => {
                  const s = summarizeDay(data.byDirection.get(direction.key) ?? [], day);
                  const range = formatRange(s.first, s.last);
                  return (
                    <li key={direction.key} className="px-3 py-2">
                      <DirectionSign
                        route={route}
                        direction={direction}
                        className="text-sm font-medium leading-tight"
                      />
                      <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                        {range
                          ? [
                              direction.origin ? `sale de ${direction.origin}` : null,
                              range,
                              `${s.departures} ${s.departures === 1 ? 'salida' : 'salidas'}`,
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

          <section>
            <SectionLabel icon={<BarChart3 />} aside={dayLabel}>
              {scheduledDirections.length > 1 ? 'Salidas por hora · ambos sentidos' : 'Salidas por hora'}
            </SectionLabel>
            <HourlyChart
              hourly={departuresByHour(data.all, day)}
              currentHour={currentHour}
              dayName={DAY_NAMES[day]}
              evenlySpaced={data.estimated || isEvenlySpaced(data.all, day)}
            />
          </section>
        </>
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
/** Con más horas empatadas en el máximo, nombrarlas no ayuda a leer el gráfico. */
const MAX_PEAK_HOURS_LISTED = 3;

function HourlyChart({
  hourly,
  currentHour,
  dayName,
  evenlySpaced,
}: {
  hourly: number[];
  currentHour: number | null;
  dayName: string;
  /** Salidas a intervalo fijo: la hora "con más salidas" sería un efecto del corte por hora. */
  evenlySpaced: boolean;
}) {
  const max = Math.max(...hourly, 1);
  const total = hourly.reduce((a, b) => a + b, 0);
  const peaks = hourly.flatMap((count, hour) => (count === max ? [hour] : []));
  const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const plural = (n: number) => `${n} ${n === 1 ? 'salida' : 'salidas'}`;
  const showPeak = !evenlySpaced && total > 2;

  let peakText: ReactNode = null;
  if (evenlySpaced && total > 2) {
    peakText = 'Salidas a intervalo parejo: no hay una hora con más salidas.';
  } else if (showPeak && peaks.length <= MAX_PEAK_HOURS_LISTED) {
    const hours = peaks.map(hh);
    const list = hours.length > 1 ? `${hours.slice(0, -1).join(', ')} y ${hours[hours.length - 1]}` : hours[0];
    peakText = (
      <>
        {peaks.length > 1 ? 'Horas con más salidas: ' : 'Hora con más salidas: '}
        <span className="font-medium text-foreground">{list}</span> ({plural(max)}
        {peaks.length > 1 ? ' c/u' : ''})
      </>
    );
  } else if (showPeak) {
    peakText = `Hasta ${plural(max)} por hora, en ${peaks.length} horas del día.`;
  }
  const nowText =
    currentHour !== null && !(showPeak && peaks.length === 1 && peaks[0] === currentHour)
      ? `ahora (${hh(currentHour)}): ${plural(hourly[currentHour])}`
      : null;

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
      {(peakText || nowText) && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {peakText}
          {peakText && nowText && ' · '}
          {nowText}
        </p>
      )}
    </div>
  );
}

function StopsTab({
  route,
  directions,
  directionKey,
  onPickDirection,
  routeKm,
  onSelectStop,
}: {
  route: Route;
  directions: DirectionView[];
  directionKey: string | undefined;
  onPickDirection: (key: string) => void;
  routeKm: number;
  onSelectStop: (id: string) => void;
}) {
  const direction = directions.find((d) => d.key === directionKey) ?? directions[0];
  const stops = direction?.stops ?? route.stops;
  const km = direction?.km ?? routeKm;
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

      {directions.length > 1 && (
        <div role="group" aria-label="Sentido" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {directions.map((d) => (
            <button
              key={d.key}
              type="button"
              aria-pressed={d.key === direction?.key}
              onClick={() => onPickDirection(d.key)}
              className={cn(
                'min-w-0 rounded-md px-2 py-1 text-xs font-medium transition-colors focus-ring',
                d.key === direction?.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground/80',
              )}
            >
              <DirectionSign route={route} direction={d} />
            </button>
          ))}
        </div>
      )}

      {stops.length === 0 ? (
        <Notice icon={<Info />}>
          Este recorrido viene de OpenStreetMap sin lista de paraderos. Largo total:{' '}
          <span className="font-semibold text-foreground">{formatKm(km)}</span>.
          Activa la capa de paraderos para ver los puntos cercanos.
        </Notice>
      ) : (
        <section>
          <SectionLabel icon={<MapPin />} aside={`${stops.length} · ${formatKm(km)}`}>
            {direction
              ? `${route.type === 'biotren' ? 'Estaciones' : 'Paraderos'} hacia ${direction.destination}`
              : route.type === 'biotren'
                ? 'Estaciones en orden'
                : 'Paraderos en orden'}
          </SectionLabel>
          <p className="mb-2 text-[11px] text-muted-foreground">
            {route.directions?.length === 1 && 'El GTFS oficial publica un solo sentido. '}
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
                    <span aria-hidden className="shrink-0 pt-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
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
