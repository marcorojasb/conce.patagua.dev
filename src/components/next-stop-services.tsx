import { useEffect, useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ROUTES_BY_ID, useRoutesVersion } from '@/data/routes';
import {
  formatServiceClock,
  getNextStopServices,
  type StopServiceSnapshot,
} from '@/lib/stop-services';
import type { StopServiceWindow } from '@/data/gtfs-stop-services.generated';

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

export function NextStopServicesBlock({ stopId, routeIds, enabled }: Props) {
  const routesVersion = useRoutesVersion();
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    snapshot: null,
  });
  const routeKey = routeIds.join('|');

  useEffect(() => {
    if (!enabled || !stopId) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    const routes = routeIds.map((id) => ROUTES_BY_ID.get(id)).filter((route) => route != null);
    const hasGtfsRoute = routeIds.some((id) => id.startsWith('gtfs-route-'));
    if (!stopId.startsWith('gtfs-stop-') || !hasGtfsRoute) {
      setState({
        loading: false,
        error: null,
        snapshot: getNextStopServices({
          stopId,
          routeIds,
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
        setState({
          loading: false,
          error: null,
          snapshot: getNextStopServices({
            stopId,
            routeIds,
            windows,
            now: new Date(),
            staticRoutes: routes,
          }),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: err instanceof Error ? err.message : 'No se pudieron cargar próximos servicios',
          snapshot: null,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, stopId, routeKey, routesVersion]);

  const services = state.snapshot?.services ?? [];
  const routeById = useMemo(() => new Map(routeIds.map((id) => [id, ROUTES_BY_ID.get(id)])), [routeKey, routesVersion]);

  if (state.loading) {
    return (
      <div className="mt-4 rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
        Cargando próximos servicios programados…
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="mt-4 rounded-md border bg-destructive/10 p-3 text-[12px] text-destructive">
        {state.error}
      </div>
    );
  }

  if (!state.snapshot || services.length === 0) {
    return (
      <div className="mt-4 rounded-md border bg-muted/40 p-3 text-[12px] leading-snug text-muted-foreground">
        Sin próximos servicios programados para las rutas vinculadas en este momento.
        Cuando la ruta no tiene <span className="font-mono">stop_times.txt</span>, el visor no inventa una hora exacta.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          Próximos servicios
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatServiceClock(state.snapshot.generatedAt.getHours() * 60 + state.snapshot.generatedAt.getMinutes())}
        </span>
      </div>

      <div className="space-y-1.5">
        {services.map((service) => {
          const route = routeById.get(service.routeId);
          const label = route?.code ?? service.routeId.replace('gtfs-route-', '');
          return (
            <div
              key={`${service.routeId}-${service.headsign}-${service.scheduledMin}-${service.source}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border bg-muted/20 p-2"
            >
              <Badge
                className="border-transparent font-mono"
                style={{ background: route?.color ?? '#0ea5e9', color: '#fff' }}
              >
                {label}
              </Badge>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {service.headsign || route?.name || 'Servicio programado'}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {service.source === 'gtfs-window'
                    ? `GTFS estático · ${service.countInWindow} pasadas/día`
                    : 'Estimación por frecuencia publicada'}
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
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-[10px] leading-snug text-muted-foreground">
        Horas estimadas desde GTFS estático o frecuencias publicadas; no son GPS ni GTFS-RT.
      </div>
    </div>
  );
}
