import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Clock,
  CreditCard,
  Crosshair,
  Ellipsis,
  ExternalLink,
  EyeOff,
  Github,
  Info,
  MapPin,
  Plus,
  Route as RouteIcon,
  Wallet,
} from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { Notice } from '@/components/ui/notice';
import { RouteBadge } from '@/components/route-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SectionLabel } from '@/components/ui/section-label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { StatTile } from '@/components/ui/stat-tile';
import { StatusChip } from '@/components/ui/status-chip';
import { StatusDot } from '@/components/ui/status-dot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { knownFleetOfRoute } from '@/data/fleets';
import { GTFS_CONCEPCION_SOURCE } from '@/data/gtfs-stops.generated';
import { operatorTimetablesOfRoute, type OperatorTimetable } from '@/data/operator-timetables';
import { ROUTE_TYPES } from '@/data/routes';
import { STATIC_SERVICE_PATTERNS, type StaticServicePattern } from '@/data/static-service-patterns';
import { WikiLinkButton } from '@/components/wiki-link';
import { chileClock } from '@/lib/chile-time';
import { isRouteOperatingAt } from '@/lib/operating-hours';
import {
  departuresByHour,
  directionProgram,
  isEvenlySpaced,
  summarizeDay,
  summarizeProgramDay,
  summarizeToday,
  type NextDeparture,
  type ProgramDaySummary,
} from '@/lib/route-schedule-summary';
import { formatServiceClock } from '@/lib/stop-services';
import { routeColorVars } from '@/lib/route-colors';
import { directionCode, isInterurban, routePillCode, routeShortName } from '@/lib/route-labels';
import { cn } from '@/lib/utils';
import { loadScheduleIndex } from '@/realtime/schedule-index';
import type { LatLngTuple, Route, RouteSchedule, Stop } from '@/types/transport';
import type { DirectionId, RouteDetailSheetProps, RouteTab } from '@/types/ui-contracts';

const REPORT_URL = 'https://github.com/marcorojasb/conce.patagua.dev/issues';

// Los horarios salen del mismo índice que el modo Horario del mapa (GTFS con
// las listas del operador y el Biotrén), pero sin ralear: la ficha muestra el
// programa tal cual, como frecuencia. Las micros se leen por sentido
// ("gtfs-route-835#0") y Biotrén por patrón EFE (un id por sentido y tipo de día).

const PROGRAM_SENTENCE =
  'El GTFS de la DTPR reparte las salidas a intervalo fijo entre la primera y la última: es un programa, no un itinerario. Las salidas reales pueden ser otras, casi siempre menos, y variar según la hora.';

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
  /** Sentido GTFS (cambia el mapa); null en los patrones de Biotrén. */
  directionId: DirectionId | null;
  /** Letrero en ese sentido ("30E"; el de la línea si no tiene variante). */
  code: string;
  destination: string;
  /** Solo patrones estáticos (Biotrén): estación de salida. */
  origin?: string;
  stops: Stop[];
  km: number;
}

function routeDirections(route: Route): DirectionView[] {
  if (route.directions && route.directions.length > 0) {
    return [...route.directions]
      .sort((a, b) => a.directionId - b.directionId)
      .map((d) => ({
        key: `${route.id}#${d.directionId}`,
        directionId: d.directionId,
        code: directionCode(route, d.directionId),
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
      directionId: null,
      code: route.code,
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
  /** Listas del operador que reemplazan al GTFS algunos días (la 201 de lunes a viernes). */
  operatorTimetables: OperatorTimetable[];
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
    operatorTimetables: operatorTimetablesOfRoute(route.id),
  };
}

type ScheduleState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; data: RouteScheduleData | null };

function useRouteSchedule(route: Route): ScheduleState {
  const [index, setIndex] = useState<Record<string, RouteSchedule> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (index || failed) return undefined;
    let cancelled = false;
    loadScheduleIndex()
      .then((loaded) => {
        if (!cancelled) setIndex(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [index, failed]);

  return useMemo<ScheduleState>(() => {
    if (failed) return { status: 'error', retry: () => setFailed(false) };
    if (!index) return { status: 'loading' };
    return { status: 'ready', data: scheduleForRoute(route, index) };
  }, [failed, index, route]);
}

/** Hora actual que avanza sola mientras la ficha está abierta. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
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

/** "cada 5 min"; "cada 15–30 min" si los sentidos salen a distinto intervalo. */
function formatProgramHeadway({ headwayMin, headwayMax }: ProgramDaySummary): string {
  if (headwayMin === headwayMax) return `cada ${formatHeadway(headwayMin)}`;
  if (headwayMax < 60) return `cada ${headwayMin}–${headwayMax} min`;
  return `cada ${formatHeadway(headwayMin)}–${formatHeadway(headwayMax)}`;
}

/** Frase del programa más, si se conoce, la flota real de la línea. */
function programNote(route: Route): string {
  const fleet = knownFleetOfRoute(route.id);
  return fleet
    ? `${PROGRAM_SENTENCE} Flota real de ${fleet.label}: ${fleet.buses} buses (${fleet.sourceLabel}).`
    : PROGRAM_SENTENCE;
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

/** "hacia Nonguén" → "Hacia Nonguén" (título de la ficha). */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
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

const TABS: readonly RouteTab[] = ['info', 'recorrido', 'horarios'];
const isRouteTab = (value: string): value is RouteTab => (TABS as readonly string[]).includes(value);

export function RouteDetailSheet({
  chrome,
  route,
  tab,
  onTabChange,
  directionId,
  onDirectionChange,
  membership,
  onFocusRoute,
  onSelectStop,
}: RouteDetailSheetProps) {
  const schedule = useRouteSchedule(route);
  const now = useNow();
  const directions = useMemo(() => routeDirections(route), [route]);
  const routeKm = useMemo(() => pathKilometers(route.path), [route]);
  // Micros: el sentido viene de la URL y cambia el mapa. Biotrén: su patrón
  // EFE es una elección local de la ficha (el mapa dibuja la línea entera).
  const [patternKey, setPatternKey] = useState<string | null>(null);
  const gtfsDirections = directions.filter((d) => d.directionId !== null);
  const twoWay = gtfsDirections.length > 1;
  const activeKey =
    gtfsDirections.length > 0
      ? twoWay
        ? (gtfsDirections.find((d) => d.directionId === directionId)?.key ?? null)
        : gtfsDirections[0].key
      : (patternKey ?? directions[0]?.key ?? null);

  const pickDirection = (key: string) => {
    const view = directions.find((d) => d.key === key);
    if (!view) return;
    if (view.directionId === null) setPatternKey(key);
    else onDirectionChange(view.directionId);
  };
  const showDirection = (key: string) => {
    pickDirection(key);
    onTabChange('recorrido');
  };

  const TypeIcon = ROUTE_TYPES[route.type].Icon;

  return (
    <FloatingInfoPanel
      chrome={chrome}
      title={capitalize(routeShortName(route))}
      description={
        <>
          {route.operator}
          <MembershipChips onMap={membership.onMap} hiddenByFilter={membership.hiddenByFilter} />
        </>
      }
      scroll={false}
      eyebrow={
        <div className="flex flex-wrap items-center gap-1.5">
          <RouteBadge code={routePillCode(route)} color={route.color} />
          <TypeIcon />
          <span>{ROUTE_TYPES[route.type].label}</span>
          {isInterurban(route) && <StatusChip tone="muted">{route.network}</StatusChip>}
        </div>
      }
      actions={<RouteActions route={route} membership={membership} onFocusRoute={onFocusRoute} />}
    >
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isRouteTab(value)) onTabChange(value);
        }}
        className="flex h-full min-h-0 flex-col gap-3 px-5 pb-5 pt-4"
      >
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

        {twoWay && (
          <DirectionGroup
            route={route}
            directions={gtfsDirections}
            directionId={directionId}
            onChange={onDirectionChange}
          />
        )}

        <TabsContent value="info" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-2 scroll-fade-y">
            <InfoTab
              route={route}
              directions={directions}
              activeKey={twoWay ? activeKey : null}
              schedule={schedule}
              now={now}
              routeKm={routeKm}
              onShowDirection={showDirection}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recorrido" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-2 scroll-fade-y">
            <StopsTab
              route={route}
              directions={directions}
              activeKey={activeKey}
              onPickDirection={pickDirection}
              routeKm={routeKm}
              onSelectStop={onSelectStop}
            />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="horarios" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full pr-2 scroll-fade-y">
            <ScheduleTab route={route} directions={directions} schedule={schedule} now={now} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </FloatingInfoPanel>
  );
}

/** "No está en tu mapa" / "Fuera de horario ahora": por qué el mapa la dibuja como la dibuja. */
function MembershipChips({ onMap, hiddenByFilter }: { onMap: boolean; hiddenByFilter: boolean }) {
  if (onMap && !hiddenByFilter) return null;
  return (
    <span className="ml-1.5 inline-flex flex-wrap gap-1 align-middle">
      {!onMap && <StatusChip tone="dashed">No está en tu mapa</StatusChip>}
      {hiddenByFilter && (
        <StatusChip
          tone="stale"
          icon={<Clock aria-hidden />}
          title="«Operando ahora» la saca de la red; se dibuja igual mientras está abierta"
        >
          Fuera de horario ahora
        </StatusChip>
      )}
    </span>
  );
}

/**
 * Acciones de la ficha. En móvil van en una sola fila que se desliza de lado
 * y lo secundario (wiki, reportar) queda tras "⋯"; en escritorio, a la vista.
 */
function RouteActions({
  route,
  membership,
  onFocusRoute,
}: {
  route: Route;
  membership: RouteDetailSheetProps['membership'];
  onFocusRoute: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreId = useId();
  const report = () => window.open(REPORT_URL, '_blank', 'noopener');

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <div className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {/* En el teléfono, padding más corto: con "Más acciones" (40 px) al
              lado, "Centrar en el mapa" cabe entero en 390 px. */}
          {membership.onMap ? (
            <Button size="sm" variant="outline" className="shrink-0 max-sm:gap-1.5 max-sm:px-2" onClick={membership.onRemove}>
              <EyeOff className="size-3.5" />
              Quitar del mapa
            </Button>
          ) : (
            <Button size="sm" className="shrink-0 max-sm:gap-1.5 max-sm:px-2" onClick={membership.onAdd}>
              <Plus className="size-3.5" />
              Agregar al mapa
            </Button>
          )}
          <Button size="sm" variant="outline" className="shrink-0 max-sm:gap-1.5 max-sm:px-2" onClick={onFocusRoute}>
            <Crosshair className="size-3.5" />
            Centrar en el mapa
          </Button>
          <span className="hidden sm:contents">
            <WikiLinkButton kind="route" code={route.code} />
            <Button
              size="iconSm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Reportar un problema con este recorrido"
              title="Reportar un problema con este recorrido"
              onClick={report}
            >
              <Github className="size-4" />
            </Button>
          </span>
        </div>
        <Button
          size="iconSm"
          variant="outline"
          className="shrink-0 sm:hidden"
          aria-label="Más acciones"
          aria-expanded={moreOpen}
          aria-controls={moreOpen ? moreId : undefined}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <Ellipsis className="size-4" />
        </Button>
      </div>
      {moreOpen && (
        <div id={moreId} className="mt-2 flex flex-wrap gap-1.5 sm:hidden">
          <WikiLinkButton kind="route" code={route.code} />
          <Button size="sm" variant="outline" onClick={report}>
            <Github className="size-3.5" />
            Reportar un problema
          </Button>
        </div>
      )}
    </div>
  );
}

/** "Ambos" o un sentido: el mapa dibuja solo ese trazado, sus paraderos y sus micros. */
function DirectionGroup({
  route,
  directions,
  directionId,
  onChange,
}: {
  route: Route;
  directions: DirectionView[];
  directionId: DirectionId | null;
  onChange: (directionId: DirectionId | null) => void;
}) {
  // toggle (botones con aria-pressed), no radio: el smoke busca el sentido
  // elegido como botón presionado dentro del grupo "Sentido".
  return (
    <SegmentedControl
      variant="toggle"
      label="Sentido"
      value={directionId === null ? 'both' : String(directionId)}
      onChange={(value) => onChange(value === 'both' ? null : (Number(value) as DirectionId))}
      options={[
        { value: 'both', label: 'Ambos' },
        ...directions.map((d) => ({
          value: String(d.directionId),
          label: <DirectionSign route={route} direction={d} />,
          name: `${d.code} → ${d.destination}`,
          title: `${d.code} hacia ${d.destination}`,
        })),
      ]}
      // "Ambos" a su ancho, a la izquierda, y los dos sentidos uno bajo el
      // otro a todo lo ancho que queda: en una fila el destino quedaba en
      // 5–7 letras ("Higuer…") y no se leía hacia dónde va cada uno. En
      // móvil la flecha cede su lugar al destino.
      className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] max-md:[&_svg]:hidden [&>button:first-child]:row-span-2 [&>button:first-child]:h-auto [&>button:not(:first-child)]:justify-start"
    />
  );
}

function stopsNoun(route: Route, count: number): string {
  if (route.type === 'biotren') return count === 1 ? 'estación' : 'estaciones';
  return count === 1 ? 'paradero' : 'paraderos';
}

/** Letrero de un sentido: código de ese sentido ("30E") y destino. */
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
      <RouteBadge code={direction.code} color={route.color} />
      {/* currentColor atenuado: se lee también dentro de un sentido elegido (invertido). */}
      <ArrowRight className="size-3.5 shrink-0 opacity-60" aria-label="hacia" />
      <span className="truncate">{direction.destination}</span>
    </span>
  );
}

function InfoTab({
  route,
  directions,
  activeKey,
  schedule,
  now,
  routeKm,
  onShowDirection,
}: {
  route: Route;
  directions: DirectionView[];
  /** Sentido elegido (solo micros de dos sentidos); null = ambos. */
  activeKey: string | null;
  schedule: ScheduleState;
  now: Date;
  routeKm: number;
  onShowDirection: (key: string) => void;
}) {
  const today = chileClock(now).day;
  const routeCard =
    route.stops.length > 0 ? (
      <StatTile
        label="Recorrido"
        value={`${route.stops.length} ${stopsNoun(route, route.stops.length)}`}
        detail={
          (route.directions?.length ?? 0) > 1
            ? 'distintos, en ambos sentidos'
            : formatKm(directions[0]?.km ?? routeKm)
        }
      />
    ) : (
      <StatTile label="Recorrido" value={formatKm(routeKm)} detail="sin paraderos cargados" />
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
            <Skeleton className="h-[78px]" />
            <Skeleton className="h-[78px]" />
            <Skeleton className="h-[78px]" />
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
              const active = direction.key === activeKey;
              return (
                <li key={direction.key}>
                  <button
                    type="button"
                    onClick={() => onShowDirection(direction.key)}
                    title="Ver sus paraderos en orden"
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md border bg-card p-2 text-left transition-colors hover:bg-accent focus-ring',
                      active && 'border-foreground/40 bg-accent/60',
                    )}
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

      <FareCard route={route} />

      <SourceNote route={route} schedule={schedule} />
    </div>
  );
}

interface Fare {
  value: string;
  unit: string;
  /** Medio de pago, cuando se sabe cuál es. */
  payment: string | null;
  note: string;
}

// Tarifa adulto vigente de cada red, la misma que citan sus artículos del
// wiki (biotren, ruta-201-santa-juana, concepcion-tome,
// concepcion-coronel-lota y el perímetro de exclusión urbano).
function routeFare(route: Route): Fare {
  if (route.type === 'biotren') {
    return {
      value: '$420 – $850',
      unit: 'CLP adulto, por zona',
      payment: 'Tarjeta Conecta',
      note: 'Zonas Z1–Z10 vigentes desde el 2-ene-2026: el valor depende del tramo origen-destino. Se paga con la tarjeta Conecta en los validadores de estación, sin integración tarifaria con las micros.',
    };
  }
  if (route.network === 'Interurbano Santa Juana') {
    return {
      value: '$1.000',
      unit: 'CLP adulto',
      payment: 'Pago electrónico próximamente',
      note: 'Tarifa del servicio licitado Santa Juana ↔ Concepción (DTPR ELC0007); no aplica la tarifa urbana. Estudiantes $330; adultos mayores y personas con discapacidad, gratis.',
    };
  }
  if (route.network === 'Interurbano Tomé') {
    return {
      value: '$780 – $830',
      unit: 'CLP adulto',
      payment: 'Pago electrónico próximamente',
      note: '$780 hasta Tomé y $830 hasta Dichato desde el reajuste del 23-feb-2025 (perímetro de exclusión de Tomé); no aplica la tarifa urbana.',
    };
  }
  if (route.network === 'Interurbano Lota') {
    return {
      value: 'Sin tarifa única',
      unit: 'interurbano',
      payment: null,
      note: 'No hay una tarifa única publicada para Lota ↔ Concepción: varía por operador y tramo. Revisa el artículo del corredor en el wiki.',
    };
  }
  if (isInterurban(route)) {
    return {
      value: 'Tarifa propia',
      unit: 'interurbano',
      payment: null,
      note: 'No aplica la tarifa urbana. Revisa el artículo del recorrido en el wiki.',
    };
  }
  return {
    value: '$580',
    unit: 'CLP adulto',
    payment: 'Pago electrónico próximamente',
    note: 'Tarifa urbana del Gran Concepción vigente desde el 23-feb-2025, en efectivo. DTPR anunció pago electrónico integrado para 2026; reglas y descuentos aún no publicados.',
  };
}

function FareCard({ route }: { route: Route }) {
  const fare = routeFare(route);
  return (
    <section>
      <SectionLabel icon={<Wallet />}>Tarifa</SectionLabel>
      <div className="rounded-md border bg-card p-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-semibold tabular-nums">{fare.value}</span>
            <span className="text-[11px] text-muted-foreground">{fare.unit}</span>
          </div>
          {fare.payment && (
            <StatusChip tone="muted" icon={<CreditCard aria-hidden />}>
              {fare.payment}
            </StatusChip>
          )}
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{fare.note}</p>
      </div>
    </section>
  );
}

function ScheduleError({ retry }: { retry: () => void }) {
  return (
    <Notice tone="danger" icon={<AlertTriangle />}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>No se pudo cargar el horario.</span>
        <Button size="sm" variant="outline" onClick={retry}>
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
  const operatorToday = data.operatorTimetables.some((t) => t.days.includes(groupOfDay(summary.day)));
  // Misma regla que el punto "operando ahora" de la barra lateral y la ficha
  // de paradero (los tramos ya siguen la lista del operador los días que la
  // hay); sin tramos calculados se usa el viaje en curso del horario.
  const operatingNow = route.serviceSpans ? isRouteOperatingAt(route, now) : summary.operatingNow;
  const program = summarizeProgramDay([...data.byDirection.values()], summary.day);
  const range = program ? formatRange(program.first, program.last) : formatRange(summary.first, summary.last);
  const bothWays = data.byDirection.size > 1;
  const next = summary.nextDeparture ? formatNext(summary.nextDeparture, summary.day) : null;

  let nowValue: string;
  let nowDetail: string;
  if (operatingNow && summary.nextDeparture && summary.nextDeparture.dayOffset > 0) {
    nowValue = 'Últimos viajes';
    nowDetail = next ? `próxima salida ${next}` : 'sin más salidas';
  } else if (operatingNow && program) {
    nowValue = 'En servicio';
    nowDetail = `última salida ${formatServiceClock(program.last)}`;
  } else if (operatingNow) {
    nowValue = summary.headwayNow ? `cada ~${formatHeadway(summary.headwayNow)}` : 'En servicio';
    nowDetail = next ? `próxima ${next}` : 'sin más salidas';
    if (summary.headwayNow && bothWays) nowDetail = `por sentido · ${nowDetail}`;
  } else {
    nowValue = 'Sin servicio';
    nowDetail = next ? `próxima ${next}` : 'sin salidas programadas';
  }

  const nowTile = (
    <StatTile
      label={
        <span className="inline-flex items-center gap-1.5">
          <StatusDot on={operatingNow} label={operatingNow ? 'Operando ahora' : 'Fuera de horario ahora'} />
          Ahora
        </span>
      }
      value={nowValue}
      detail={nowDetail}
    />
  );

  // Programa a intervalo fijo: su frecuencia y su ventana, nunca un conteo de salidas.
  if (program) {
    return (
      <div>
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Horario" value={range} detail="ventana del programa" />
          <StatTile
            label="Frecuencia"
            value={formatProgramHeadway(program)}
            detail={bothWays ? 'programa oficial, por sentido' : 'programa oficial DTPR'}
          />
          {nowTile}
          {routeCard}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{programNote(route)}</p>
      </div>
    );
  }

  let departuresDetail: string;
  if (operatorToday) departuresDetail = bothWays ? 'según el operador, 2 sentidos' : 'según el operador';
  else if (data.estimated) departuresDetail = bothWays ? 'estimadas, 2 sentidos' : 'estimadas hoy';
  else departuresDetail = bothWays ? 'en ambos sentidos' : 'programadas hoy';

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatTile
        label="Horario"
        value={range ?? 'Sin servicio'}
        detail={range ? 'primera y última salida' : 'no hay salidas hoy'}
      />
      <StatTile label="Salidas" value={summary.departures} detail={departuresDetail} />
      {nowTile}
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
    const data = schedule.status === 'ready' ? schedule.data : null;
    return <GtfsSourceNote hasSchedule={data !== null} operatorTimetables={data?.operatorTimetables ?? []} />;
  }
  return (
    <Notice icon={<Info />}>
      Trazado y paraderos desde datos abiertos (OpenStreetMap y descripción oficial del
      servicio).
    </Notice>
  );
}

function GtfsSourceNote({
  hasSchedule,
  operatorTimetables,
}: {
  hasSchedule: boolean;
  operatorTimetables: OperatorTimetable[];
}) {
  const feed = GTFS_CONCEPCION_SOURCE;
  const expired = Date.parse(`${feed.feedEndDate}T23:59:59-03:00`) < Date.now();
  return (
    <Notice icon={<Info />}>
      <p>
        {hasSchedule ? 'Recorrido, paraderos y programa de salidas' : 'Recorrido y paraderos'} del
        GTFS oficial de la DTPR
        {FEED_PROGRAM_DATE ? `, programa del ${FEED_PROGRAM_DATE}` : ''} (versión «
        {feed.feedVersion}»).
      </p>
      <p className="mt-1">
        {expired
          ? `Su calendario declarado (${formatIsoDate(feed.feedStartDate)} a ${formatIsoDate(feed.feedEndDate)}) ya venció, pero es la última programación publicada: puede no reflejar cambios posteriores.`
          : `Calendario declarado vigente hasta el ${formatIsoDate(feed.feedEndDate)}.`}
        {hasSchedule &&
          ' Ese programa reparte las salidas a intervalo fijo; no es un itinerario ni son llegadas en vivo.'}
      </p>
      <p className="mt-1">
        Fuente:{' '}
        <a href={feed.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
          DTPR · granconcepcion.zip
          <ExternalLink className="size-3" />
        </a>
      </p>
      {operatorTimetables.length > 0 && (
        <>
          <p className="mt-1">
            De lunes a viernes, las salidas son las que vende el operador (kupos.cl, lista del
            25-11-2026), no las del GTFS.
          </p>
          {/* Una página por sentido con el mismo rótulo: el sentido las distingue. */}
          <SourceDetails
            summary="Fuentes y notas de las salidas del operador"
            items={operatorTimetables.map((t) => ({ ...t, sourceLabel: `${t.label}: ${t.sourceLabel}` }))}
          />

        </>
      )}
    </Notice>
  );
}

/** Enlaces y notas, sin repetir, bajo un desplegable. */
function SourceDetails({
  summary,
  items,
}: {
  summary: string;
  items: ReadonlyArray<{ sourceUrl: string; sourceLabel: string; note: string }>;
}) {
  const notes = [...new Set(items.map((item) => item.note))];
  const sources = new Map<string, string>();
  for (const item of items) if (!sources.has(item.sourceUrl)) sources.set(item.sourceUrl, item.sourceLabel);
  return (
    <details className="mt-1">
      <summary className="cursor-pointer rounded-sm hover:text-foreground focus-ring">{summary}</summary>
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
  const operator = route.type === 'biotren' ? 'EFE' : 'el operador';

  return (
    <Notice icon={<Info />}>
      <p>
        {official
          ? `Itinerario oficial de ${operator}, salida por salida. Cuenta solo los viajes de cabecera a cabecera.`
          : 'Horario estimado desde una frecuencia publicada; no es el itinerario oficial.'}
        {route.type === 'biotren' && ' Estaciones y vía: OpenStreetMap.'}
      </p>
      <SourceDetails summary="Fuentes y notas del itinerario" items={patterns} />
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
        <div className="grid grid-cols-2 gap-2">
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
  const program = summarizeProgramDay([...data.byDirection.values()], day);
  const currentHour = isToday ? Math.floor(clock.minutes / 60) : null;
  const dayLabel = isToday ? `hoy, ${DAY_NAMES[day]}` : DAY_NAMES[day];
  const scheduledDirections = directions.filter((d) => data.byDirection.has(d.key));

  return (
    <div className="space-y-4">
      <SegmentedControl
        variant="toggle"
        label="Día de la semana"
        value={group}
        onChange={setPickedGroup}
        options={DAY_GROUPS.map((g) => ({
          value: g.id,
          label:
            groupOfDay(clock.day) === g.id ? (
              <>
                {g.label} <span className="text-[11px] font-normal opacity-75">hoy</span>
              </>
            ) : (
              g.label
            ),
        }))}
      />

      {summary.departures === 0 ? (
        <Notice icon={<Info />}>Sin salidas el {DAY_NAMES[day]}.</Notice>
      ) : (
        <>
          {program ? (
            // Programa a intervalo fijo: ventana y frecuencia, sin conteo ni gráfico por hora.
            <div className="grid grid-cols-3 gap-2">
              <StatTile compact label="Primera" value={formatServiceClock(program.first)} />
              <StatTile compact label="Última" value={formatServiceClock(program.last)} />
              <StatTile compact label="Frecuencia" value={formatProgramHeadway(program)} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <StatTile compact label="Primera" value={formatServiceClock(summary.first ?? 0)} />
              <StatTile compact label="Última" value={formatServiceClock(summary.last ?? 0)} />
              <StatTile compact label="Salidas" value={summary.departures} />
              <StatTile
                compact
                label="Intervalo"
                value={summary.medianHeadway ? `~${formatHeadway(summary.medianHeadway)}` : '—'}
              />
            </div>
          )}

          {scheduledDirections.length > 1 && (
            <section aria-label="Por sentido">
              <SectionLabel icon={<ArrowLeftRight />} aside={dayLabel}>
                Por sentido
              </SectionLabel>
              <ul className="divide-y rounded-md border bg-card">
                {scheduledDirections.map((direction) => {
                  const schedules = data.byDirection.get(direction.key) ?? [];
                  const s = summarizeDay(schedules, day);
                  const range = formatRange(s.first, s.last);
                  const directionHeadway = directionProgram(schedules, day)?.headwayMin;
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
                              ...(directionHeadway
                                ? [`programa cada ${formatHeadway(directionHeadway)}`]
                                : [
                                    `${s.departures} ${s.departures === 1 ? 'salida' : 'salidas'}`,
                                    s.medianHeadway ? `cada ~${formatHeadway(s.medianHeadway)}` : null,
                                  ]),
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

          {program ? (
            <div data-schedule-program>
              <Notice icon={<Info />}>{programNote(route)}</Notice>
            </div>
          ) : (
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
          )}
        </>
      )}

      <SourceNote route={route} schedule={schedule} />
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
      <div className="mt-1 flex gap-[2px] font-mono text-[11px] text-muted-foreground" aria-hidden>
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
  activeKey,
  onPickDirection,
  routeKm,
  onSelectStop,
}: {
  route: Route;
  directions: DirectionView[];
  /** null con "Ambos" en una micro de dos sentidos: se pide elegir uno. */
  activeKey: string | null;
  onPickDirection: (key: string) => void;
  routeKm: number;
  onSelectStop: (id: string) => void;
}) {
  const direction = directions.find((d) => d.key === activeKey) ?? null;
  // Patrones de Biotrén: se eligen aquí (no cambian el mapa).
  const patterns = directions.filter((d) => d.directionId === null);
  const stops = direction?.stops ?? (directions.length === 0 ? route.stops : []);
  const km = direction?.km ?? routeKm;
  const last = stops.length - 1;
  const place = route.type === 'biotren' ? 'una estación' : 'un paradero';

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

      {patterns.length > 1 && (
        <SegmentedControl
          variant="toggle"
          label="Sentido"
          value={activeKey}
          onChange={onPickDirection}
          options={patterns.map((d) => ({ value: d.key, label: <DirectionSign route={route} direction={d} /> }))}
        />
      )}

      {!direction && directions.length > 1 ? (
        <section aria-label="Elegir sentido">
          <p className="mb-2 text-[12px] leading-snug text-muted-foreground">
            El mapa muestra los dos sentidos. Elige uno para ver sus paraderos en orden (el mapa
            dibuja solo ese).
          </p>
          <ul className="space-y-1.5">
            {directions.map((d) => (
              <li key={d.key}>
                <button
                  type="button"
                  onClick={() => onPickDirection(d.key)}
                  className="flex w-full items-center gap-2 rounded-md border bg-card p-2 text-left transition-colors hover:bg-accent focus-ring"
                >
                  <div className="min-w-0 flex-1">
                    <DirectionSign route={route} direction={d} className="text-sm font-medium" />
                    <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                      {d.stops.length} {stopsNoun(route, d.stops.length)} · {formatKm(d.km)}
                    </div>
                  </div>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : stops.length === 0 ? (
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
            Toca {place} para ver su ficha.
          </p>
          <ol style={routeColorVars(route.color)}>
            {stops.map((stop, i) => {
              const endpoint = i === 0 ? 'Origen' : i === last ? 'Destino' : null;
              return (
                <li key={`${stop.id}-${i}`} className="relative">
                  {i < last && (
                    <span
                      aria-hidden
                      className="absolute left-[13px] top-4 h-full w-0.5 bg-[var(--route)] opacity-45 dark:bg-[var(--route-dark)]"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectStop(stop.id)}
                    className="relative flex min-h-10 w-full items-start gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-muted focus-ring md:min-h-0"
                  >
                    <span className="flex w-4 shrink-0 justify-center pt-1" aria-hidden>
                      <span
                        className={cn(
                          'rounded-full border-2 border-[color:var(--route)] dark:border-[color:var(--route-dark)]',
                          endpoint
                            ? 'size-3.5 -mt-px bg-[var(--route)] dark:bg-[var(--route-dark)]'
                            : 'size-3 bg-background',
                        )}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      {endpoint && (
                        <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
