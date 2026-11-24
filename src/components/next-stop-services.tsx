import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { CalendarClock } from 'lucide-react';
import { RouteBadge } from '@/components/route-badge';
import { Notice } from '@/components/ui/notice';
import { SectionLabel } from '@/components/ui/section-label';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES_BY_ID, useRoutesVersion } from '@/data/routes';
import {
  formatServiceClock,
  getNextStopServices,
  type StopServiceSnapshot,
} from '@/lib/stop-services';
import { chileClock } from '@/lib/chile-time';
import type { StopServiceWindow } from '@/data/gtfs-stop-services.generated';
import type { Route } from '@/types/transport';

interface Props {
  stopId: string;
  routeIds: string[];
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

const FALLBACK_COLOR = '#0ea5e9';

export function NextStopServicesBlock({ stopId, routeIds, enabled }: Props) {
  const routesVersion = useRoutesVersion();
  const [state, dispatch] = useReducer(reducer, initialState);
  const routeKey = routeIds.join('|');

  useEffect(() => {
    if (!enabled || !stopId) return;
    let cancelled = false;
    dispatch({ type: 'loading' });
    void routesVersion;
    const ids = routeKey ? routeKey.split('|') : [];
    const routes: Route[] = [];
    let hasGtfsRoute = false;
    for (const id of ids) {
      const route = ROUTES_BY_ID.get(id);
      if (route) routes.push(route);
      if (id.startsWith('gtfs-route-')) hasGtfsRoute = true;
    }
    if (!stopId.startsWith('gtfs-stop-') || !hasGtfsRoute) {
      dispatch({
        type: 'success',
        snapshot: getNextStopServices({
          stopId,
          routeIds: ids,
          windows: undefined,
          now: new Date(),
          staticRoutes: routes,
        }),
      });
      return;
    }
    void import('@/data/gtfs-stop-services.generated')
      .then((mod) => {
        if (cancelled) return;
        const windows = mod.STOP_SERVICE_WINDOWS[stopId] as StopServiceWindow[] | undefined;
        dispatch({
          type: 'success',
          snapshot: getNextStopServices({
            stopId,
            routeIds: ids,
            windows,
            now: new Date(),
            staticRoutes: routes,
          }),
        });
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
  }, [enabled, stopId, routeKey, routesVersion]);

  const services = state.snapshot?.services ?? [];
  const routeById = useMemo(() => {
    void routesVersion;
    const entries = (routeKey ? routeKey.split('|') : []).map((id) => [id, ROUTES_BY_ID.get(id)] as const);
    return new Map(entries);
  }, [routeKey, routesVersion]);

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
                key={`${service.routeId}-${service.headsign}-${service.scheduledMin}-${service.source}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border bg-card p-2"
              >
                <RouteBadge
                  code={route?.code ?? service.routeId.replace('gtfs-route-', '')}
                  color={route?.color ?? FALLBACK_COLOR}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {service.headsign || route?.name || 'Servicio programado'}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {service.source === 'gtfs-window'
                      ? `${service.countInWindow} pasadas al día`
                      : 'aprox., según frecuencia publicada'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold">
                    {formatServiceClock(service.scheduledMin)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {service.minutesUntil === 0 ? 'ahora' : `en ${service.minutesUntil} min`}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          Horas estimadas con el horario publicado (GTFS) o la frecuencia anunciada; no
          vienen del GPS.
        </p>
      </>
    );
  }

  const clock = state.snapshot ? formatServiceClock(chileClock(state.snapshot.generatedAt).minutes) : null;

  return (
    <section aria-label="Próximas pasadas según el horario">
      <SectionLabel
        icon={<CalendarClock />}
        aside={clock && !state.loading ? `${clock} hora de Chile` : undefined}
      >
        Próximas pasadas · horario
      </SectionLabel>

      {content}
    </section>
  );
}
