import { useMemo, type ReactNode } from 'react';
import {
  Accessibility,
  ArrowDownToDot,
  ArrowRight,
  ArrowUpFromDot,
  ChartColumn,
  ChevronRight,
  ExternalLink,
  Footprints,
  Info,
  MapPin,
  TrainFront,
  Waypoints,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { SectionLabel } from '@/components/ui/section-label';
import { Skeleton } from '@/components/ui/skeleton';
import { StatTile } from '@/components/ui/stat-tile';
import { StatusChip } from '@/components/ui/status-chip';
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { LiveArrivalsBlock } from '@/components/live-arrivals-block';
import { NextStopServicesBlock } from '@/components/next-stop-services';
import { RouteBadge } from '@/components/route-badge';
import { WikiLinkButton } from '@/components/wiki-link';
import { ROUTES_BY_ID, ROUTE_TYPES, useRoutesVersion } from '@/data/routes';
import { BIOTREN_WIKIDATA } from '@/data/wikidata.generated';
import { isoDayOfWeek, useStopFrequency } from '@/hooks/use-stop-frequency';
import { chileClock } from '@/lib/chile-time';
import { directionCode, routePillCode, routeShortName } from '@/lib/route-labels';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import { endsAt } from '@/lib/stop-services';
import { liveStopCode } from '@/realtime/live-arrivals';
import { cn } from '@/lib/utils';
import type { Route, RouteDirection, StopWithRoutes } from '@/types/transport';
import type { DirectionId, StopDetailSheetProps } from '@/types/ui-contracts';

/** stop_id del GTFS ("gtfs-stop-37520" → "37520"); Biotrén y paraderos OSM no tienen. */
function gtfsStopCode(stopId: string): string | null {
  return /^gtfs-stop-(.+)$/.exec(stopId)?.[1] ?? null;
}

function stopSummary(stop: StopWithRoutes, routes: Route[], isBiotrenStation: boolean): ReactNode {
  const lines = routes.filter((r) => r.type === 'biotren').map((r) => r.code);
  if (isBiotrenStation && lines.length > 0) {
    return `${lines.length === 1 ? 'Línea' : 'Líneas'} ${lines.join(' y ')}`;
  }
  const n = stop.routes.length;
  const count = n === 0 ? 'sin recorridos asociados' : `${n} ${n === 1 ? 'recorrido' : 'recorridos'}`;
  const code = gtfsStopCode(stop.id);
  return code ? (
    <>
      Código <span className="font-mono font-medium">{code}</span> · {count}
    </>
  ) : (
    count
  );
}

export function StopDetailSheet({
  chrome,
  stop,
  live,
  micros,
  onShowGpsOnMap,
  onSelectRoute,
  onPlanFrom,
  onPlanTo,
}: StopDetailSheetProps) {
  // `ROUTES_BY_ID` se muta in-place al llegar el chunk de micros: sin la versión
  // en las deps, un deep link abierto antes de esa carga se queda con la lista
  // de recorridos incompleta.
  const routesVersion = useRoutesVersion();
  const routes = useMemo(() => {
    void routesVersion;
    const linkedRoutes = [];
    for (const id of stop.routes) {
      const route = ROUTES_BY_ID.get(id);
      if (route) linkedRoutes.push(route);
    }
    return linkedRoutes;
  }, [stop, routesVersion]);

  // La frecuencia por hora solo existe para paraderos del GTFS.
  const freqStopId = gtfsStopCode(stop.id) ? stop.id : null;
  const frequency = useStopFrequency(freqStopId);

  const isBiotrenStation = !!stop.wikidata || routes.some((r) => r.type === 'biotren');
  const hasRoutes = stop.routes.length > 0;
  const point = { lat: stop.lat, lng: stop.lng };
  const wikidata = stop.wikidata ? BIOTREN_WIKIDATA[stop.wikidata] : undefined;
  const hasAbout = !!wikidata && !!(wikidata.openedYear || wikidata.imageUrl || wikidata.wikipediaEs);

  return (
    <FloatingInfoPanel
      chrome={chrome}
      title={stop.name}
      eyebrow={
        <>
          {isBiotrenStation ? <TrainFront /> : <MapPin />}
          {isBiotrenStation ? 'Estación Biotrén' : 'Paradero'}
        </>
      }
      description={stopSummary(stop, routes, isBiotrenStation)}
      actions={
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            title="Abrir el planificador con este paradero como origen (A)"
            onClick={() => onPlanFrom(point)}
          >
            <ArrowUpFromDot className="size-4 text-origin" />
            Salir desde aquí
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            title="Abrir el planificador con este paradero como destino (B)"
            onClick={() => onPlanTo(point)}
          >
            <ArrowDownToDot className="size-4 text-destination" />
            Ir hasta aquí
          </Button>
          {isBiotrenStation && <WikiLinkButton kind="slug" slug="biotren" className="shrink-0" />}
        </div>
      }
      contentClassName="space-y-6"
    >
      <AccessibilityBadges stop={stop} />

      {/* Todo paradero GTFS tiene bloque: si sus líneas no se siguen en vivo, App no consulta y el bloque lo dice. */}
      {liveStopCode(stop.id) && (
        <LiveArrivalsBlock live={live} routes={routes} micros={micros} onShowGpsOnMap={onShowGpsOnMap} />
      )}

      {hasRoutes ? (
        <>
          <NextStopServicesBlock stopId={stop.id} routes={routes} enabled />
          <RoutesSection stopId={stop.id} routes={routes} onSelectRoute={onSelectRoute} />
        </>
      ) : (
        <Notice icon={<Info />}>
          Ningún recorrido del visor está asociado a este paradero. Figura en el listado oficial
          de paraderos (GTFS), pero no en los viajes que usamos para dibujar los recorridos, así
          que no podemos decir qué líneas se detienen aquí ni a qué hora. Igual puedes salir desde
          aquí o llegar hasta aquí con el planificador.
        </Notice>
      )}

      <FrequencyBlock
        hourly={frequency.hourly}
        loading={frequency.loading}
        showEmpty={!!freqStopId && hasRoutes}
      />

      {hasAbout && wikidata && (
        <section aria-label="Sobre la estación">
          <SectionLabel icon={<Info />}>Sobre la estación</SectionLabel>
          {wikidata.imageUrl && (
            <img
              src={wikidata.imageUrl}
              alt={stop.name}
              className="mb-2 aspect-video w-full rounded-md border object-cover"
              loading="lazy"
            />
          )}
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            {wikidata.openedYear && (
              <Badge variant="secondary" className="font-mono">
                Inaugurada {wikidata.openedYear}
              </Badge>
            )}
            {wikidata.wikipediaEs && (
              <a
                href={wikidata.wikipediaEs}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 rounded-sm text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-ring"
              >
                Wikipedia <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </section>
      )}

      <p className="font-mono text-[11px] text-muted-foreground">
        Ubicación {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
      </p>
    </FloatingInfoPanel>
  );
}

function AccessibilityBadges({ stop }: { stop: StopWithRoutes }) {
  if (!stop.wheelchair && !stop.tactilePaving) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {stop.wheelchair === 'yes' && (
        <StatusChip tone="muted" icon={<Accessibility />}>
          Accesible
        </StatusChip>
      )}
      {stop.wheelchair === 'limited' && (
        <StatusChip tone="dashed" icon={<Accessibility />}>
          Acceso limitado
        </StatusChip>
      )}
      {stop.tactilePaving && (
        <StatusChip tone="muted" icon={<Footprints />}>
          Pavimento podotáctil
        </StatusChip>
      )}
    </div>
  );
}

/** Sentidos del recorrido que se detienen en el paradero (los dos en cabeceras y tramos compartidos). */
function directionsServing(route: Route, stopId: string): RouteDirection[] {
  return (route.directions ?? [])
    .filter((d) => d.stops.some((stop) => stop.id === stopId))
    .sort((a, b) => a.directionId - b.directionId);
}

/** Una fila por línea y sentido que se detiene aquí: su letrero ("30E") y hacia dónde va. */
function RoutesSection({
  stopId,
  routes,
  onSelectRoute,
}: {
  stopId: string;
  routes: Route[];
  onSelectRoute: (id: string, directionId?: DirectionId) => void;
}) {
  const activeCount = routes.reduce((acc, r) => acc + (isRouteOperatingNow(r) ? 1 : 0), 0);
  const rows = routes.flatMap((route): Array<{ route: Route; direction: RouteDirection | null }> => {
    const here = directionsServing(route, stopId);
    if (here.length === 0) return [{ route, direction: null }];
    return here.map((direction) => ({ route, direction }));
  });
  return (
    <section aria-label="Recorridos que pasan">
      <SectionLabel
        icon={<Waypoints />}
        aside={
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-live" aria-hidden />
            {activeCount} de {routes.length} operando ahora
          </span>
        }
      >
        Recorridos que pasan
      </SectionLabel>
      <ul className="space-y-1.5">
        {rows.map(({ route, direction }) => (
          <li key={`${route.id}#${direction?.directionId ?? ''}`}>
            <RouteRow stopId={stopId} route={route} direction={direction} onSelectRoute={onSelectRoute} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RouteRow({
  stopId,
  route,
  direction,
  onSelectRoute,
}: {
  stopId: string;
  route: Route;
  direction: RouteDirection | null;
  onSelectRoute: (id: string, directionId?: DirectionId) => void;
}) {
  const Icon = ROUTE_TYPES[route.type].Icon;
  const active = isRouteOperatingNow(route);
  const ends = direction ? endsAt(direction.stops, stopId) : false;
  return (
    <button
      type="button"
      onClick={() => onSelectRoute(route.id, direction?.directionId)}
      className="flex w-full items-center gap-2 rounded-md border bg-card p-2.5 text-left transition-colors hover:bg-accent focus-ring"
    >
      <RouteBadge
        code={direction ? directionCode(route, direction.directionId) : routePillCode(route)}
        color={route.color}
      />
      <div className="min-w-0 flex-1">
        {direction ? (
          <div
            className={cn(
              'flex min-w-0 items-center gap-1 text-sm',
              ends ? 'text-muted-foreground' : 'font-medium',
            )}
          >
            {ends ? (
              <span className="truncate">termina aquí</span>
            ) : (
              <>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-label="hacia" />
                <span className="truncate">{direction.destination ?? direction.headsign}</span>
              </>
            )}
          </div>
        ) : (
          <div className="truncate text-sm font-medium">{routeShortName(route)}</div>
        )}
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
          <Icon className="size-[11px] shrink-0" aria-label={ROUTE_TYPES[route.type].short} />
          <span className="truncate">{route.operator}</span>
        </div>
      </div>
      <span
        className={cn('size-2 shrink-0 rounded-full', active ? 'bg-live' : 'bg-muted-foreground/40')}
        title={active ? 'Operando ahora' : 'Fuera de horario o sin datos'}
        aria-hidden
      />
      <span className="sr-only">{active ? 'Operando ahora' : 'Fuera de horario o sin datos'}</span>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}

const DAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const HOUR_TICKS = [0, 6, 12, 18];

function hh(hour: number): string {
  return String(hour).padStart(2, '0');
}

function FrequencyBlock({
  hourly,
  loading,
  showEmpty,
}: {
  hourly: number[] | null;
  loading: boolean;
  /** Avisar que falta el dato (paradero GTFS con recorridos) en vez de omitir la sección. */
  showEmpty: boolean;
}) {
  const now = new Date();
  const today = isoDayOfWeek(now);
  const hourNow = Math.floor(chileClock(now).minutes / 60);

  const stats = useMemo(() => {
    if (!hourly) return null;
    const todaySlice = hourly.slice(today * 24, today * 24 + 24);
    const peakHour = todaySlice.reduce(
      (acc, count, hour) => (count > acc.count ? { hour, count } : acc),
      { hour: 0, count: 0 },
    );
    return {
      now: todaySlice[hourNow] ?? 0,
      totalToday: todaySlice.reduce((a, b) => a + b, 0),
      peakHour,
      todaySlice,
    };
  }, [hourly, today, hourNow]);

  if (!loading && !stats && !showEmpty) return null;

  const label = (
    <SectionLabel icon={<ChartColumn />} aside={stats ? DAY_NAMES[today] : undefined}>
      Frecuencia programada
    </SectionLabel>
  );

  if (loading) {
    return (
      <section aria-label="Frecuencia programada">
        {label}
        <div role="status" aria-label="Cargando frecuencia programada">
          <div className="mb-2 grid grid-cols-3 gap-2">
            <Skeleton className="h-[78px] w-full" />
            <Skeleton className="h-[78px] w-full" />
            <Skeleton className="h-[78px] w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section aria-label="Frecuencia programada">
        {label}
        <Notice>
          Sin frecuencia por hora: los recorridos de este paradero no traen horario en el GTFS
          oficial de la DTPR.
        </Notice>
      </section>
    );
  }

  const max = Math.max(...stats.todaySlice, 1);

  return (
    <section aria-label="Frecuencia programada">
      {label}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <StatTile label={`${hh(hourNow)}–${hh((hourNow + 1) % 24)} h`} value={stats.now} detail="pasadas" />
        <StatTile label="Hoy" value={stats.totalToday} detail="pasadas" />
        <StatTile label="Hora punta" value={stats.peakHour.count} detail={`a las ${hh(stats.peakHour.hour)} h`} />
      </div>
      <HourlyBars hourly={stats.todaySlice} max={max} currentHour={hourNow} />
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Pasadas por hora según el programa oficial de la DTPR (GTFS); la barra resaltada es la
        hora actual.
      </p>
    </section>
  );
}

function HourlyBars({
  hourly,
  max,
  currentHour,
}: {
  hourly: number[];
  max: number;
  currentHour: number;
}) {
  return (
    <div>
      <div className="flex h-12 items-end gap-[2px]">
        {hourly.map((count, hour) => {
          const pct = max > 0 ? (count / max) * 100 : 0;
          const isCurrent = hour === currentHour;
          const tooltip = `${hh(hour)}:00 · ${count} pasadas`;
          return (
            <div
              key={hour}
              className="flex h-full min-w-0 flex-1 flex-col justify-end"
              title={tooltip}
              aria-label={tooltip}
            >
              <div
                className={cn(
                  'w-full rounded-t-sm transition-colors',
                  isCurrent
                    ? 'bg-foreground'
                    : count > 0
                      ? 'bg-foreground/35'
                      : 'bg-foreground/10',
                )}
                style={{ height: `${Math.max(pct, count > 0 ? 4 : 1)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[2px] font-mono text-[11px] text-muted-foreground" aria-hidden>
        {HOUR_TICKS.map((hour) => (
          <span key={hour} className="col-span-6" style={{ gridColumnStart: hour + 1 }}>
            {hh(hour)}
          </span>
        ))}
      </div>
    </div>
  );
}
