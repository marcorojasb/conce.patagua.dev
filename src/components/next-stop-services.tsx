import { useEffect, useReducer, type ReactNode } from 'react';
import { ArrowRight, CalendarClock } from 'lucide-react';
import { RouteBadge } from '@/components/route-badge';
import { Notice } from '@/components/ui/notice';
import { SectionLabel } from '@/components/ui/section-label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatServiceClock,
  getNextStopServices,
  type NextStopService,
  type StopServiceSnapshot,
} from '@/lib/stop-services';
import { chileClock } from '@/lib/chile-time';
import type { StopServiceWindow } from '@/data/gtfs-stop-services.generated';
import type { Route } from '@/types/transport';

interface Props {
  stopId: string;
  /** Recorridos que pasan por el paradero (con sus sentidos). */
  routes: Route[];
  enabled: boolean;
}

interface State {
  loading: boolean;
  error: string | null;
  snapshot: StopServiceSnapshot | null;
}

type Action =
  | { type: 'loading' }
  | { type: 'success'; snapshot: StopServiceSnapshot }
  | { type: 'error'; error: string };

const initialState: State = {
  loading: false,
  error: null,
  snapshot: null,
};

function reducer(state: State, action: Action): State {
  if (action.type === 'loading') {
    return { ...state, loading: true, error: null };
  }
  if (action.type === 'success') {
    return { loading: false, error: null, snapshot: action.snapshot };
  }
  return { loading: false, error: action.error, snapshot: null };
}

/** "ahora", "en 12 min", "en 1 h 05 min", o "mañana" si pasa después de medianoche y falta más de una hora. */
function formatWait(minutesUntil: number, scheduledMin: number): string {
  if (minutesUntil === 0) return 'ahora';
  if (minutesUntil < 60) return `en ${minutesUntil} min`;
  if (scheduledMin >= 1440) return 'mañana';
  const minutes = minutesUntil % 60;
  return `en ${Math.floor(minutesUntil / 60)} h${minutes ? ` ${String(minutes).padStart(2, '0')} min` : ''}`;
}

/** De dónde sale la hora: dicho tal cual, sin presentar una estimación como dato publicado. */
function serviceDetail(service: NextStopService, route: Route | undefined): string {
  if (service.source === 'gtfs-window') {
    return service.headwayMin
      ? `aprox. · intervalo típico ~${service.headwayMin} min`
      : 'aprox., según el horario del paradero';
  }
  const published = service.source === 'static-trips';
  if (service.origin) {
    const departure = `sale de ${service.origin.name} ${formatServiceClock(service.origin.departureMin)}`;
    return `${departure} · paso ${published ? 'aprox.' : 'estimado'}`;
  }
  if (!published) return 'estimada según frecuencia publicada';
  return route?.type === 'biotren' ? 'sale de aquí · itinerario EFE' : 'sale de aquí · itinerario oficial';
}

export function NextStopServicesBlock({ stopId, routes, enabled }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!enabled || !stopId) return;
    let cancelled = false;
    dispatch({ type: 'loading' });
    const snapshot = (windows: StopServiceWindow[] | undefined) =>
      getNextStopServices({ stopId, routes, windows, now: new Date() });
    // Solo los paraderos GTFS con micros necesitan el chunk de ventanas.
    if (!stopId.startsWith('gtfs-stop-') || !routes.some((r) => r.id.startsWith('gtfs-route-'))) {
      dispatch({ type: 'success', snapshot: snapshot(undefined) });
      return;
    }
    void import('@/data/gtfs-stop-services.generated')
      .then((mod) => {
        if (cancelled) return;
        dispatch({ type: 'success', snapshot: snapshot(mod.STOP_SERVICE_WINDOWS[stopId]) });
      })
      .catch((err) => {
        if (cancelled) return;
        dispatch({
          type: 'error',
          error: err instanceof Error ? err.message : 'No se pudo cargar el horario',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, stopId, routes]);

  const services = state.snapshot?.services ?? [];
  const routeById = new Map(routes.map((route) => [route.id, route] as const));

  let content: ReactNode;
  if (state.loading) {
    content = (
      <div className="space-y-1.5" aria-label="Cargando próximas pasadas programadas" role="status">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[52px] w-full rounded-md" />
        ))}
      </div>
    );
  } else if (state.error) {
    content = <Notice tone="danger">No se pudo cargar el horario: {state.error}</Notice>;
  } else if (services.length === 0) {
    content = (
      <Notice>
        Sin próximas pasadas en el horario publicado para estos recorridos. Si una línea no
        publica horario, el visor no inventa una hora.
      </Notice>
    );
  } else {
    content = (
      <>
        <ul className="space-y-1.5">
          {services.map((service) => {
            const route = routeById.get(service.routeId);
            return (
              <li
                key={`${service.routeId}-${service.destination}-${service.scheduledMin}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border bg-card p-2"
              >
                <RouteBadge
                  code={service.variant ?? route?.code ?? service.routeId}
                  color={route?.color ?? '#64748b'}
                />
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1 text-sm font-medium">
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-label="hacia" />
                    <span className="truncate">{service.destination}</span>
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {serviceDetail(service, route)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold">
                    {formatServiceClock(service.scheduledMin)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatWait(service.minutesUntil, service.scheduledMin)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          Hora de Chile según el programa publicado (GTFS oficial DTPR en micros, itinerario EFE
          en Biotrén); no vienen del GPS. Una fila por línea y sentido; las marcadas aprox. se
          proyectan desde el intervalo típico del paradero o la distancia a la cabecera.
        </p>
      </>
    );
  }

  const clock = state.snapshot ? formatServiceClock(chileClock(state.snapshot.generatedAt).minutes) : null;

  return (
    <section aria-label="Próximas pasadas según el horario">
      <SectionLabel
        icon={<CalendarClock />}
        aside={clock && !state.loading ? <span title="Hora de Chile">{clock}</span> : undefined}
      >
        Próximas pasadas · horario
      </SectionLabel>

      {content}
    </section>
  );
}
