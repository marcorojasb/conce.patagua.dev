import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Radio, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { LiveArrivalsSnapshot } from '@/hooks/use-live-arrivals';
import {
  DIRECTION_LABEL,
  STALE_AFTER_MS,
  formatAge,
  liveView,
  minutesUntil,
  normalizeRouteCode,
  type LiveArrival,
  type LiveDirection,
} from '@/realtime/live-arrivals';
import { cn, readableTextOn } from '@/lib/utils';
import type { Route } from '@/types/transport';

interface Props {
  live: LiveArrivalsSnapshot;
  /** Recorridos del visor que pasan por el paradero, para el color de la línea. */
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

function serviceLabel(route: string, direction: LiveDirection | null): string {
  return direction ? `${route} ${DIRECTION_LABEL[direction]}` : route;
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

export function LiveArrivalsBlock({ live, routes }: Props) {
  const now = useClock();
  const view = liveView(live.state, now, live.loading);
  const colorByCode = useMemo(
    () => new Map(routes.map((r) => [normalizeRouteCode(r.code), r.color])),
    [routes],
  );
  const ageIsOld = view.ageMs != null && view.ageMs > STALE_AFTER_MS;

  return (
    <section
      className="rounded-md border bg-card p-3"
      aria-label="Llegadas en vivo"
      data-live-state={view.kind}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Radio className="size-3.5 text-emerald-600" />
          Llegadas en vivo
        </div>
        {view.ageMs != null && (
          <span
            className={cn(
              'font-mono text-[11px]',
              ageIsOld
                ? 'rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
                : 'text-muted-foreground',
            )}
          >
            {formatAge(view.ageMs)}
          </span>
        )}
      </div>

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
              key={`${arrival.route}-${arrival.direction}-${arrival.arrivalAt}-${arrival.tripId ?? arrival.plate ?? ''}`}
              arrival={arrival}
              now={now}
              color={colorByCode.get(normalizeRouteCode(arrival.route)) ?? NEUTRAL_COLOR}
            />
          ))}
        </ul>
      )}

      {view.kind === 'stale' && (
        <p className="mt-2 rounded-md bg-amber-50 p-2 text-[12px] leading-snug text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          Dato viejo: la fuente no ha entregado nada nuevo desde {formatAge(view.ageMs ?? 0)}. Los
          minutos se descuentan desde entonces.
        </p>
      )}

      {view.lastFailure && view.lastFailure !== 'unconfigured' && view.ageMs != null && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          La última consulta falló; se muestra el último dato recibido.
        </p>
      )}

      {view.notes.length > 0 && (
        <ul className="mt-2 space-y-1">
          {view.notes.map((note) => (
            <li
              key={`${note.route}-${note.direction}`}
              className="flex items-baseline gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-[12px]"
            >
              <span className="font-mono font-semibold">{serviceLabel(note.route, note.direction)}</span>
              <span className="text-muted-foreground">{note.text}</span>
            </li>
          ))}
        </ul>
      )}

      {view.kind === 'empty' && (
        <p className="rounded-md bg-muted/40 p-2.5 text-[12px] leading-snug text-muted-foreground">
          Sin micros en camino a este paradero. La fuente informa solo las que vienen en los
          próximos ~30 min.
        </p>
      )}

      {view.kind === 'down' && (
        <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-[12px] leading-snug text-destructive">
          <WifiOff className="mt-0.5 size-3.5 shrink-0" />
          Fuente en vivo caída o sin respuesta. Se reintenta sola
          {live.state.failures >= 3 ? ' cada 5 min' : ' en 1 min'}; mientras tanto no se
          muestran micros en vivo.
        </p>
      )}

      {view.kind === 'unconfigured' && (
        <p className="rounded-md bg-muted/40 p-2.5 text-[12px] leading-snug text-muted-foreground">
          Las llegadas en vivo no están activadas en este despliegue.
        </p>
      )}

      {view.alerts.length > 0 && (
        <ul className="mt-2 space-y-1">
          {view.alerts.map((alert) => (
            <li key={alert} className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-600" />
              {alert}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
        GPS de las micros vía la app de Transapp/DTPR: fuente no oficial, puede fallar o
        quedar vacía.
      </p>
    </section>
  );
}

function ArrivalRow({ arrival, now, color }: { arrival: LiveArrival; now: number; color: string }) {
  const minutes = minutesUntil(arrival, now);
  const details = [
    arrival.distanceM != null ? `a ${formatDistance(arrival.distanceM)}` : null,
    arrival.plate,
  ].filter(Boolean);
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border bg-muted/20 p-2">
      <Badge
        className="border-transparent font-mono"
        style={{ background: color, color: readableTextOn(color) }}
      >
        {arrival.route}
      </Badge>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">
          {arrival.direction ? DIRECTION_LABEL[arrival.direction] : 'sentido no informado'}
        </div>
        <div className="truncate text-[11px] text-muted-foreground">
          {details.length > 0 ? details.join(' · ') : 'sin distancia informada'}
        </div>
      </div>
      <div className="text-right font-mono text-sm font-semibold">
        {minutes === 0 ? 'llegando' : `${minutes} min`}
      </div>
    </li>
  );
}
