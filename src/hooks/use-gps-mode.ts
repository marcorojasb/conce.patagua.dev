// Modo "GPS en vivo" de "Micros en el mapa". Con el modo prendido consulta el
// GPS de las líneas dadas (useRouteVehicles: cada 30 s con la pestaña a la
// vista), envejece las posiciones con un reloj de 5 s y publica las micros en
// gpsVehicleFeed, que el canvas del mapa dibuja sin pasar por React. Con el
// modo apagado no consulta nada y publica [].
//
// Devuelve el resumen para el control (MicrosControl). Ese objeto cambia solo
// cuando cambia algo que se muestra, no con cada tic del reloj: quien lo usa
// no se vuelve a dibujar cada 5 s.
//
// Lo llama un solo componente (MicrosSlot): el store de useRouteVehicles y la
// fuente del mapa son uno para la app.

import { useEffect, useMemo } from 'react';
import { ROUTES, useRoutesVersion } from '@/data/routes';
import { useClock } from '@/hooks/use-clock';
import { useRouteVehicles } from '@/hooks/use-route-vehicles';
import { gpsViewKey, summarizeGpsLines } from '@/realtime/gps-mode-summary';
import { buildGpsMapVehicles, publishGpsVehicles, stopGpsOnMap, type StopGpsArrivals } from '@/realtime/gps-vehicle-feed';
import { indexLiveServices, liveView } from '@/realtime/live-arrivals';
import { gpsServicesFor, gpsStatusByRoute, sourceClock, type RouteGpsStatus } from '@/realtime/route-vehicles';
import type { GpsModeOptions, GpsModeView, MapVehicle } from '@/types/ui-contracts';

const AGE_TICK_MS = 5_000;
const NO_VEHICLES: readonly MapVehicle[] = [];

const IDLE_VIEW: GpsModeView = {
  active: false,
  loading: false,
  failure: null,
  fetchedAt: null,
  lines: [],
  vehicles: 0,
  stale: 0,
};

export function useGpsMode({ enabled, routes, selectedRouteId, stopLive }: GpsModeOptions): GpsModeView {
  const routesVersion = useRoutesVersion();
  const selection = useMemo(() => gpsServicesFor(routes, { selectedRouteId }), [routes, selectedRouteId]);
  const { state, loading } = useRouteVehicles(enabled ? selection.pairs : null);
  // Sin avanzar con la pestaña oculta (useClock): nadie mira el mapa.
  const now = useClock(AGE_TICK_MS, enabled);

  const routesById = useMemo(() => new Map(routes.map((route) => [route.id, route])), [routes]);
  // Las llegadas del paradero pueden ser de cualquier línea, no solo de las del mapa.
  const liveServices = useMemo(() => {
    void routesVersion;
    return indexLiveServices(ROUTES);
  }, [routesVersion]);

  // Las del paradero con la misma regla que la ficha usa para decir qué dibuja el mapa.
  const stop = useMemo<StopGpsArrivals | null>(() => {
    if (!enabled || !stopLive?.state.snapshot) return null;
    return stopGpsOnMap(liveView(stopLive.state, now, stopLive.loading));
  }, [enabled, stopLive, now]);

  // Posiciones envejecidas en el reloj del servidor: un equipo con la hora
  // corrida no las ve todas vencidas.
  const sourceNow = sourceClock(state, now);
  const vehicles = useMemo(
    () =>
      enabled
        ? buildGpsMapVehicles({
            byService: state.byService,
            routeByPair: selection.routeByPair,
            routesById,
            liveServices,
            stop,
            now: sourceNow,
          })
        : NO_VEHICLES,
    [enabled, state.byService, selection.routeByPair, routesById, liveServices, stop, sourceNow],
  );

  useEffect(() => {
    publishGpsVehicles(vehicles);
  }, [vehicles]);
  useEffect(() => () => publishGpsVehicles(NO_VEHICLES), []);

  const view: GpsModeView = useMemo(() => {
    if (!enabled) return IDLE_VIEW;
    // Cada fila cuenta lo que el mapa dibuja de esa línea (sin repetir
    // patente, con las del paradero abierto): nunca otro número.
    const drawnByRoute = new Map<string, number>();
    let stale = 0;
    for (const vehicle of vehicles) {
      if (vehicle.stale) stale += 1;
      drawnByRoute.set(vehicle.routeId, (drawnByRoute.get(vehicle.routeId) ?? 0) + 1);
    }
    const statusByRoute = new Map<string, { status: RouteGpsStatus; vehicles: number; lastSignalAgeMs?: number }>();
    for (const [routeId, entry] of gpsStatusByRoute(selection.routeByPair, state, sourceNow)) {
      const drawn = drawnByRoute.get(routeId) ?? 0;
      statusByRoute.set(routeId, drawn > 0 ? { status: 'live', vehicles: drawn } : { ...entry, vehicles: 0 });
    }
    return {
      active: true,
      loading,
      failure: state.lastFailure,
      // En la hora del equipo, para que "hace 12 s" no dependa de su reloj corrido.
      fetchedAt: state.fetchedAt != null ? state.fetchedAt + (now - sourceNow) : null,
      lines: summarizeGpsLines(selection, routesById, statusByRoute),
      vehicles: vehicles.length,
      stale,
    };
  }, [enabled, selection, state, now, sourceNow, vehicles, loading, routesById]);

  // El resumen se rehace en cada tic, pero se entrega el mismo objeto mientras
  // su clave (todo lo que se muestra de él) no cambie: así MicrosControl no se
  // dibuja de nuevo cada 5 s.
  const key = gpsViewKey(view);
  return useMemo(() => view, [key]); // react-doctor-disable-line react-doctor/exhaustive-deps -- `key` resume `view`.
}
