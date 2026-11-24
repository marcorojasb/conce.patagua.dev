import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Radio, WifiOff } from 'lucide-react';
import { RouteBadge } from '@/components/route-badge';
import { Notice } from '@/components/ui/notice';
import { SectionLabel } from '@/components/ui/section-label';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES, useRoutesVersion } from '@/data/routes';
import type { LiveArrivalsSnapshot } from '@/hooks/use-live-arrivals';
import {
  DIRECTION_LABEL,
  STALE_AFTER_MS,
  formatAge,
  indexLiveServices,
  liveServiceLabel,
  liveView,
  minutesUntil,
  servicesWithoutGps,
  visorServiceName,
  type LiveArrival,
  type LiveDirection,
  type LiveServiceMatch,
} from '@/realtime/live-arrivals';
import { cn } from '@/lib/utils';
import type { Route } from '@/types/transport';

interface Props {
  live: LiveArrivalsSnapshot;
  /** Recorridos del visor que pasan por el paradero. */
  routes: Route[];
}

const CLOCK_TICK_MS = 5_000;
const NEUTRAL_COLOR = '#334155';

function useClock(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/** "hacia Leonera" si el sentido calza con el visor; si no, "ida"/"regreso". */
function towards(match: LiveServiceMatch | undefined, direction: LiveDirection | null): string {
  const destination = match?.direction.destination;
  if (destination) return `hacia ${destination}`;
  return direction ? `Sentido ${DIRECTION_LABEL[direction]}` : 'Sentido no informado';
}

export function LiveArrivalsBlock({ live, routes }: Props) {
  const now = useClock();
  const view = liveView(live.state, now, live.loading);
  // La fuente puede anunciar líneas que el GTFS de 2025 no hace pasar por
  // este paradero: el calce se busca en toda la red, no solo en `routes`.
  const routesVersion = useRoutesVersion();
  const services = useMemo(() => {
    void routesVersion;
    return indexLiveServices(ROUTES);
  }, [routesVersion]);
  // Paradero solo con líneas que la fuente no sigue (Coronel–Lota).
  const untracked = routes.filter((r) => (r.directions ?? []).length > 0);
  const allUntracked =
    untracked.length > 0 &&
    untracked.every((r) => (r.directions ?? []).every((d) => visorServiceName(r.code, d) == null));
  const ageIsOld = view.ageMs != null && view.ageMs > STALE_AFTER_MS;
  // Las alertas "Servicio X no está enviando información en tiempo real" ya
  // quedan como nota "sin datos en vivo" en su línea: no se repiten.
  const otherAlerts = view.alerts.filter((alert) => servicesWithoutGps([alert]).size === 0);

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

        {view.lastFailure && view.lastFailure !== 'unconfigured' && view.ageMs != null && (
          <p className="text-[11px] text-muted-foreground">
            La última consulta falló; se muestra el último dato recibido.
          </p>
        )}

        {view.kind === 'no-live-data' && (
          <Notice>Ninguna micro con GPS en camino ahora.</Notice>
        )}

        {view.kind === 'empty' && allUntracked && (
          <Notice>
            La fuente en vivo no sigue las líneas de este paradero (
            {untracked.map((r) => r.code).join(', ')}); guíate por el horario.
          </Notice>
        )}

        {view.kind === 'empty' && !allUntracked && (
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
    arrival.realtime ? null : 'estimado, sin GPS',
  ].filter(Boolean);
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border bg-card p-2">
      <RouteBadge code={liveServiceLabel(arrival.route, match)} color={match?.route.color ?? NEUTRAL_COLOR} />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{towards(match, arrival.direction)}</div>
        <div className="truncate text-[11px] text-muted-foreground">
          {details.length > 0 ? details.join(' · ') : 'sin distancia informada'}
        </div>
      </div>
      <div
        className={cn(
          'text-right font-mono text-sm font-semibold',
          !stale && 'text-emerald-700 dark:text-emerald-400',
        )}
      >
        {minutes === 0 ? 'llegando' : `${minutes} min`}
      </div>
    </li>
  );
}
