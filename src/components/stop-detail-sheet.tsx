import { useMemo } from 'react';
import {
  Accessibility,
  ArrowDownToDot,
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
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { LiveArrivalsBlock } from '@/components/live-arrivals-block';
import { NextStopServicesBlock } from '@/components/next-stop-services';
import { RouteBadge } from '@/components/route-badge';
import { WikiLinkButton } from '@/components/wiki-link';
import { ROUTES_BY_ID, ROUTE_TYPES, useRoutesVersion } from '@/data/routes';
import { BIOTREN_WIKIDATA } from '@/data/wikidata.generated';
import type { LiveArrivalsSnapshot } from '@/hooks/use-live-arrivals';
import { isoDayOfWeek, useStopFrequency } from '@/hooks/use-stop-frequency';
import { chileClock } from '@/lib/chile-time';
import { routeShortName } from '@/lib/route-labels';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import { cn } from '@/lib/utils';
import type { Route, StopWithRoutes } from '@/types/transport';

type PlannerPoint = { lat: number; lng: number };

interface StopDetailSheetProps {
  open: boolean;
  stop: StopWithRoutes | null;
  live: LiveArrivalsSnapshot;
  onOpenChange: (open: boolean) => void;
  onSelectRoute: (id: string) => void;
  /** Sin estas acciones la ficha no ofrece Origen/Destino del planificador. */
  onUseAsOrigin?: (point: PlannerPoint) => void;
  onUseAsDestination?: (point: PlannerPoint) => void;
}

/** stop_id del GTFS ("gtfs-stop-37520" → "37520"); Biotrén y paraderos OSM no tienen. */
function gtfsStopCode(stopId: string): string | null {
  return /^gtfs-stop-(.+)$/.exec(stopId)?.[1] ?? null;
}

function stopSummary(stop: StopWithRoutes, routes: Route[], isBiotrenStation: boolean): string {
  const lines = routes.filter((r) => r.type === 'biotren').map((r) => r.code);
  if (isBiotrenStation && lines.length > 0) {
    return `${lines.length === 1 ? 'Línea' : 'Líneas'} ${lines.join(' y ')}`;
  }
  const n = stop.routes.length;
  const count = n === 0 ? 'sin recorridos asociados' : `${n} ${n === 1 ? 'recorrido' : 'recorridos'}`;
  const code = gtfsStopCode(stop.id);
  return code ? `Código ${code} · ${count}` : count;
}

export function StopDetailSheet({
  open,
  stop,
  live,
  onOpenChange,
  onSelectRoute,
  onUseAsOrigin,
  onUseAsDestination,
}: StopDetailSheetProps) {
  // `ROUTES_BY_ID` se muta in-place al llegar el chunk de micros: sin la versión
  // en las deps, un deep link abierto antes de esa carga se queda con la lista
  // de recorridos incompleta.
  const routesVersion = useRoutesVersion();
  const routes = useMemo(() => {
    void routesVersion;
    if (!stop) return [];
    const linkedRoutes = [];
    for (const id of stop.routes) {
      const route = ROUTES_BY_ID.get(id);
      if (route) linkedRoutes.push(route);
    }
    return linkedRoutes;
  }, [stop, routesVersion]);

  // La frecuencia por hora solo existe para paraderos del GTFS; el chunk se
  // pide recién con la ficha abierta.
  const freqStopId = open && stop && gtfsStopCode(stop.id) ? stop.id : null;
  const frequency = useStopFrequency(freqStopId);

  if (!stop) return null;

  const isBiotrenStation = !!stop.wikidata || routes.some((r) => r.type === 'biotren');
  const hasRoutes = stop.routes.length > 0;
  const point = { lat: stop.lat, lng: stop.lng };
  const hasActions = !!onUseAsOrigin || !!onUseAsDestination || isBiotrenStation;
  const wikidata = stop.wikidata ? BIOTREN_WIKIDATA[stop.wikidata] : undefined;
  const hasAbout = !!wikidata && !!(wikidata.openedYear || wikidata.imageUrl || wikidata.wikipediaEs);

  return (
    <FloatingInfoPanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={stop.name}
      eyebrow={
        <>
          {isBiotrenStation ? <TrainFront /> : <MapPin />}
          {isBiotrenStation ? 'Estación Biotrén' : 'Paradero'}
        </>
      }
      description={stopSummary(stop, routes, isBiotrenStation)}
      actions={
        hasActions ? (
          <div className="flex flex-wrap gap-2">
            {onUseAsOrigin && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                title="Usar este punto como origen del planificador"
                onClick={() => onUseAsOrigin(point)}
              >
                <ArrowUpFromDot className="size-4 text-emerald-600" />
                Origen
              </Button>
            )}
            {onUseAsDestination && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                title="Usar este punto como destino del planificador"
                onClick={() => onUseAsDestination(point)}
              >
                <ArrowDownToDot className="size-4 text-red-600" />
                Destino
              </Button>
            )}
            {isBiotrenStation && <WikiLinkButton kind="slug" slug="biotren" />}
          </div>
        ) : undefined
      }
      contentClassName="space-y-6"
    >
      <AccessibilityBadges stop={stop} />

      {live.stopCode && <LiveArrivalsBlock live={live} routes={routes} />}

      {hasRoutes ? (
        <>
          <NextStopServicesBlock stopId={stop.id} routeIds={stop.routes} enabled={open} />
          <RoutesSection routes={routes} onSelectRoute={onSelectRoute} />
        </>
      ) : (
        <Notice icon={<Info />}>
          Ningún recorrido del visor está asociado a este paradero. Figura en el listado oficial
          de paraderos (GTFS), pero no en los viajes que usamos para dibujar los recorridos, así
          que no podemos decir qué líneas se detienen aquí ni a qué hora.
          {(onUseAsOrigin || onUseAsDestination) && ' Igual puedes usarlo como origen o destino.'}
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

      <p className="font-mono text-[10px] text-muted-foreground">
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
        <Badge variant="secondary" className="gap-1 font-normal">
          <Accessibility className="size-3" />
          Accesible
        </Badge>
      )}
      {stop.wheelchair === 'limited' && (
        <Badge variant="outline" className="gap-1 font-normal">
          <Accessibility className="size-3" />
          Acceso limitado
        </Badge>
      )}
      {stop.tactilePaving && (
        <Badge variant="secondary" className="gap-1 font-normal">
          <Footprints className="size-3" />
          Pavimento podotáctil
        </Badge>
      )}
    </div>
  );
}

function RoutesSection({
  routes,
  onSelectRoute,
}: {
  routes: Route[];
  onSelectRoute: (id: string) => void;
}) {
  const activeCount = routes.reduce((acc, r) => acc + (isRouteOperatingNow(r) ? 1 : 0), 0);
  return (
    <section aria-label="Recorridos que pasan">
      <SectionLabel
        icon={<Waypoints />}
        aside={
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
            {activeCount} de {routes.length} operando ahora
          </span>
        }
      >
        Recorridos que pasan
      </SectionLabel>
      <ul className="space-y-1.5">
        {routes.map((r) => {
          const Icon = ROUTE_TYPES[r.type].Icon;
          const active = isRouteOperatingNow(r);
          const details = [
            ROUTE_TYPES[r.type].short,
            r.operator,
            /^\d/.test(r.headway) ? `cada ${r.headway}` : null,
          ]
            .filter(Boolean)
            .join(' · ');
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelectRoute(r.id)}
                className="flex w-full items-center gap-2 rounded-md border bg-card p-2 text-left transition-colors hover:bg-accent focus-ring"
              >
                <RouteBadge code={r.code} color={r.color} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{routeShortName(r)}</div>
                  <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon className="size-[11px] shrink-0" />
                    <span className="truncate">{details}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    active ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                  )}
                  title={active ? 'Operando ahora' : 'Fuera de horario o sin datos'}
                  aria-hidden
                />
                <span className="sr-only">{active ? 'Operando ahora' : 'Fuera de horario o sin datos'}</span>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
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
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
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
          Sin frecuencia por hora: los recorridos de este paradero no publican horario en el GTFS
          del Gran Concepción.
        </Notice>
      </section>
    );
  }

  const max = Math.max(...stats.todaySlice, 1);

  return (
    <section aria-label="Frecuencia programada">
      {label}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat label={`${hh(hourNow)}–${hh((hourNow + 1) % 24)} h`} value={stats.now} suffix="pasadas" />
        <Stat label="Hoy" value={stats.totalToday} suffix="pasadas" />
        <Stat label="Hora punta" value={stats.peakHour.count} suffix={`a las ${hh(stats.peakHour.hour)}`} />
      </div>
      <HourlyBars hourly={stats.todaySlice} max={max} currentHour={hourNow} />
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Pasadas por hora según el horario publicado (GTFS Gran Concepción); la barra oscura es la
        hora actual.
      </p>
    </section>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="rounded-md border bg-card p-2">
      <div className="truncate text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-base font-semibold leading-none">{value}</span>
        <span className="truncate text-[11px] text-muted-foreground">{suffix}</span>
      </div>
    </div>
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
      <div className="mt-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[2px] font-mono text-[10px] text-muted-foreground" aria-hidden>
        {HOUR_TICKS.map((hour) => (
          <span key={hour} className="col-span-6" style={{ gridColumnStart: hour + 1 }}>
            {hh(hour)}
          </span>
        ))}
      </div>
    </div>
  );
}
