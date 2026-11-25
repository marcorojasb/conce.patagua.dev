import { useMemo } from 'react';
import { AlertTriangle, MapPinned, Radio, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RouteBadge } from '@/components/route-badge';
import { Notice } from '@/components/ui/notice';
import { SectionLabel } from '@/components/ui/section-label';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES, useRoutesVersion } from '@/data/routes';
import { useClock } from '@/hooks/use-clock';
import type { LiveArrivalsSnapshot } from '@/hooks/use-live-arrivals';
import {
  DIRECTION_LABEL,
  LIVE_CLOCK_TICK_MS,
  STALE_AFTER_MS,
  formatAge,
  indexLiveServices,
  liveServiceLabel,
  liveView,
  minutesUntil,
  onlyUntrackedLines,
  servicesWithoutGps,
  type LiveArrival,
  type LiveDirection,
  type LiveServiceMatch,
} from '@/realtime/live-arrivals';
import { stopGpsOnMap } from '@/realtime/gps-vehicle-feed';
import { cn } from '@/lib/utils';
import type { Route } from '@/types/transport';
import type { MicrosMode } from '@/types/ui-contracts';

interface Props {
  live: LiveArrivalsSnapshot;
  /** Recorridos del visor que pasan por el paradero. */
  routes: Route[];
  /** Fuera del modo GPS el mapa no dibuja estas micros: se ofrece cambiarlo. */
  micros: MicrosMode;
  onShowGpsOnMap: () => void;
}

const NEUTRAL_COLOR = '#334155';

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/** "hacia Leonera" si el sentido calza con el visor; si no, "ida"/"regreso". */
function towards(match: LiveServiceMatch | undefined, direction: LiveDirection | null): string {
  const destination = match?.direction.destination;
  if (destination) return `hacia ${destination}`;
  return direction ? `Sentido ${DIRECTION_LABEL[direction]}` : 'Sentido no informado';
}

export function LiveArrivalsBlock({ live, routes, micros, onShowGpsOnMap }: Props) {
  // Paradero solo con líneas que la fuente no sigue (Coronel–Lota): App no
  // la consulta y aquí solo se avisa.
  if (onlyUntrackedLines(routes)) {
    return (
      <section aria-label="Llegadas en vivo" data-live-state="untracked">
        <SectionLabel icon={<Radio className="text-emerald-600 dark:text-emerald-400" />}>
          Llegadas en vivo · GPS
        </SectionLabel>
        <Notice>
          La fuente en vivo no sigue las líneas de este paradero (
          {routes.filter((r) => (r.directions ?? []).length > 0).map((r) => r.code).join(', ')});
          guíate por el horario.
        </Notice>
      </section>
    );
  }
  return <TrackedLiveArrivals live={live} micros={micros} onShowGpsOnMap={onShowGpsOnMap} />;
}

function TrackedLiveArrivals({
  live,
  micros,
  onShowGpsOnMap,
}: {
  live: LiveArrivalsSnapshot;
  micros: MicrosMode;
  onShowGpsOnMap: () => void;
}) {
  const now = useClock(LIVE_CLOCK_TICK_MS);
  // Sin paradero en consulta todavía (App espera a conocer sus recorridos): se
  // muestra como cargando, nunca como "sin micros".
  const view = liveView(live.state, now, live.loading || live.stopCode == null);
  // La fuente puede anunciar líneas que el GTFS de 2025 no hace pasar por
  // este paradero: el calce se busca en toda la red, no solo en `routes`.
  const routesVersion = useRoutesVersion();
  const services = useMemo(() => {
    void routesVersion;
    return indexLiveServices(ROUTES);
  }, [routesVersion]);
  const ageIsOld = view.ageMs != null && view.ageMs > STALE_AFTER_MS;
  // Las alertas "Servicio X no está enviando información en tiempo real" ya
  // quedan como nota "sin datos en vivo" en su línea: no se repiten.
  const otherAlerts = view.alerts.filter((alert) => servicesWithoutGps([alert]).size === 0);
  // Micros de esta lista que el mapa dibuja en modo GPS (estimadas y GPS nunca
  // se mezclan): con GPS y posición, de un dato de hasta 5 min. Es la misma
  // regla del mapa; pasado eso la lista las sigue mostrando, el mapa no.
  const onMap = stopGpsOnMap(view);
  const withPosition = onMap?.arrivals.length ?? 0;

  return (
    <section aria-label="Llegadas en vivo" data-live-state={view.kind}>
      <SectionLabel
        icon={<Radio className="text-emerald-600 dark:text-emerald-400" />}
        aside={
          view.ageMs != null ? (
            <span
              className={cn(
                ageIsOld &&
                  'rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-200',
              )}
            >
              {formatAge(view.ageMs)}
            </span>
          ) : undefined
        }
      >
        Llegadas en vivo · GPS
      </SectionLabel>

      <div className="space-y-2">
        {view.kind === 'loading' && (
          <div className="space-y-1.5" role="status" aria-label="Consultando llegadas en vivo">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-[46px] w-full rounded-md" />
            ))}
          </div>
        )}

        {(view.kind === 'live' || view.kind === 'stale') && (
          <ul className="space-y-1.5">
            {view.arrivals.map((arrival) => (
              <ArrivalRow
                key={`${arrival.route}-${arrival.arrivalAt}-${arrival.tripId ?? arrival.plate ?? ''}`}
                arrival={arrival}
                match={services.get(arrival.route)}
                now={now}
                stale={view.kind === 'stale'}
              />
            ))}
          </ul>
        )}

        {view.kind === 'stale' && (
          <Notice tone="warning">
            Dato viejo: la fuente no entrega nada nuevo desde {formatAge(view.ageMs ?? 0)}. Los
            minutos se descuentan desde entonces.
          </Notice>
        )}

        {withPosition > 0 &&
          (micros === 'gps' ? (
            <p className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground" data-gps-on-map>
              <MapPinned className="mt-px size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              El mapa dibuja {withPosition === 1 ? 'esta micro' : `estas ${withPosition} micros`} con su
              posición GPS (cuadradas,{' '}
              {onMap?.stale ? 'anillo ámbar: dato de hace más de 2 min' : 'anillo verde'}).
            </p>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full justify-center border-emerald-600/40 text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
              onClick={onShowGpsOnMap}
            >
              <MapPinned className="size-3.5" />
              Ver en el mapa con GPS en vivo
            </Button>
          ))}

        {view.lastFailure && view.lastFailure !== 'unconfigured' && view.ageMs != null && (
          <p className="text-[11px] text-muted-foreground">
            La última consulta falló; se muestra el último dato recibido.
          </p>
        )}

        {view.kind === 'no-live-data' && (
          <Notice>Ninguna micro con GPS en camino ahora.</Notice>
        )}

        {view.kind === 'empty' && (
          <Notice>
            Sin micros en camino según el GPS. La fuente solo informa las que llegan en los
            próximos ~30 min.
          </Notice>
        )}

        {view.kind === 'down' && (
          <Notice tone="danger" icon={<WifiOff />}>
            Fuente en vivo caída o sin respuesta. Se reintenta sola
            {live.state.failures >= 3 ? ' cada 5 min' : ' en 1 min'}; mientras tanto, guíate por
            el horario.
          </Notice>
        )}

        {view.kind === 'unconfigured' && (
          <Notice>Las llegadas en vivo no están activadas en este despliegue.</Notice>
        )}

        {view.notes.length > 0 && (
          <ul className="space-y-1">
            {view.notes.map((note) => {
              const match = services.get(note.route);
              return (
                <li key={note.route} className="flex items-center gap-2 text-[12px] leading-snug">
                  <RouteBadge
                    code={liveServiceLabel(note.route, match)}
                    color={match?.route.color ?? NEUTRAL_COLOR}
                  />
                  <span className="min-w-0 text-muted-foreground">
                    {match?.direction.destination
                      ? `${towards(match, note.direction)} · `
                      : note.direction
                        ? `${DIRECTION_LABEL[note.direction]} · `
                        : ''}
                    {note.text}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {otherAlerts.length > 0 && (
          <Notice tone="warning" icon={<AlertTriangle />}>
            <ul className="space-y-1">
              {otherAlerts.map((alert) => (
                <li key={alert}>{alert}</li>
              ))}
            </ul>
          </Notice>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        GPS de las micros vía Transapp/DTPR: fuente no oficial, puede fallar o quedar vacía.
      </p>
    </section>
  );
}

function ArrivalRow({
  arrival,
  match,
  now,
  stale,
}: {
  arrival: LiveArrival;
  match: LiveServiceMatch | undefined;
  now: number;
  stale: boolean;
}) {
  const minutes = minutesUntil(arrival, now);
  const details = [
    match?.direction.destination && arrival.direction ? DIRECTION_LABEL[arrival.direction] : null,
    arrival.distanceM != null ? `a ${formatDistance(arrival.distanceM)} en línea recta` : null,
    arrival.plate ? `patente ${arrival.plate}` : null,
  ].filter(Boolean);
  return (
    <li
      className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border bg-card p-2"
      data-realtime={arrival.realtime ? 'gps' : 'estimate'}
    >
      <RouteBadge code={liveServiceLabel(arrival.route, match)} color={match?.route.color ?? NEUTRAL_COLOR} />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{towards(match, arrival.direction)}</div>
        {/* Sin GPS va primero y nunca se corta: es lo que distingue la fila. */}
        {!arrival.realtime && (
          <span className="mt-0.5 inline-block rounded bg-muted px-1.5 py-px text-[10px] font-medium text-foreground">
            estimado, sin GPS
          </span>
        )}
        {/* Puede ocupar dos líneas: la patente no se pierde en pantallas angostas. */}
        <div className="text-[11px] leading-snug text-muted-foreground">
          {details.length > 0 ? details.join(' · ') : 'sin distancia informada'}
        </div>
      </div>
      <div
        className={cn(
          'text-right font-mono text-sm font-semibold',
          arrival.realtime && !stale ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground',
        )}
      >
        {minutes === 0 ? 'llegando' : `${minutes} min`}
      </div>
    </li>
  );
}
