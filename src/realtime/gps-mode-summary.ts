// Resumen del modo "GPS en vivo" para el control "Micros en el mapa": una
// fila por línea del mapa con lo que se sabe de su GPS. Además de los estados
// de la consulta (gpsStatusByRoute), dice qué líneas no se consultan y por
// qué: la fuente no las sigue (Biotrén, 302/304) o quedaron fuera del tope de
// 16 sentidos por consulta. Nunca se cuentan micros estimadas.

import type { GpsSelection, RouteGpsStatus } from '@/realtime/route-vehicles';
import type { Route } from '@/types/transport';
import type { GpsLineStatus, GpsModeView } from '@/types/ui-contracts';

type LineInfo = Pick<Route, 'id' | 'code' | 'color'>;

function row(
  route: LineInfo,
  status: GpsLineStatus['status'],
  vehicles = 0,
  lastSignalAgeMs?: number,
): GpsLineStatus {
  return {
    routeId: route.id,
    code: route.code,
    color: route.color,
    status,
    vehicles,
    ...(lastSignalAgeMs != null ? { lastSignalAgeMs } : {}),
  };
}

/** "sin GPS ahora" o, si la fuente lista micros con señal vieja, "última señal hace 22 min". */
export function noGpsText(line: Pick<GpsLineStatus, 'lastSignalAgeMs'>): string {
  if (line.lastSignalAgeMs == null) return 'sin GPS ahora';
  const minutes = Math.floor(line.lastSignalAgeMs / 60_000);
  if (minutes < 60) return `sin GPS ahora · última señal hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `sin GPS ahora · última señal hace ${hours} h`;
}

/**
 * Filas en este orden: las consultadas en orden de prioridad (la
 * seleccionada primero), luego las que la fuente no sigue y al final las que
 * quedaron fuera del tope. Una consultada sin estado todavía está "pending".
 */
export function summarizeGpsLines(
  selection: Pick<GpsSelection, 'routeByPair' | 'untracked' | 'omittedRoutes'>,
  routesById: ReadonlyMap<string, LineInfo>,
  statusByRoute: ReadonlyMap<string, { status: RouteGpsStatus; vehicles: number; lastSignalAgeMs?: number }>,
): GpsLineStatus[] {
  const rows: GpsLineStatus[] = [];
  const seen = new Set<string>();
  for (const { routeId } of selection.routeByPair.values()) {
    if (seen.has(routeId)) continue;
    seen.add(routeId);
    const route = routesById.get(routeId);
    if (!route) continue;
    const entry = statusByRoute.get(routeId);
    rows.push(row(route, entry?.status ?? 'pending', entry?.vehicles ?? 0, entry?.lastSignalAgeMs));
  }
  for (const route of selection.untracked) rows.push(row(route, 'untracked'));
  for (const route of selection.omittedRoutes) rows.push(row(route, 'omitted'));
  return rows;
}

/** Líneas que sí se consultan (las que pueden tener GPS). */
export function queriedLines(lines: readonly GpsLineStatus[]): GpsLineStatus[] {
  return lines.filter((line) => line.status !== 'untracked' && line.status !== 'omitted');
}

/**
 * Clave del resumen: cambia solo si cambia algo que se muestra (estados,
 * conteos, hora de la consulta, carga o falla), no con cada tic del reloj.
 */
export function gpsViewKey(view: GpsModeView): string {
  const lines = view.lines
    .map((l) => `${l.routeId}:${l.status}:${l.vehicles}:${l.lastSignalAgeMs == null ? '' : Math.floor(l.lastSignalAgeMs / 60_000)}`)
    .join(',');
  return [view.active, view.loading, view.failure, view.fetchedAt, view.vehicles, view.stale, lines].join('|');
}

/**
 * Lo que dice la línea de estado del modo GPS, en orden: el servidor sin GPS;
 * nada en el mapa; solo líneas que la fuente no sigue; micros a la vista; la
 * consulta falló; ninguna transmite; todavía consultando. `omitted` (líneas
 * fuera del tope) acompaña a todos: el detalle por línea puede estar plegado.
 */
export type GpsHeadline = (
  | { state: 'unconfigured' }
  | { state: 'no-lines' }
  | { state: 'untracked-only'; untracked: readonly GpsLineStatus[] }
  | { state: 'live'; liveLines: number }
  | { state: 'failed' }
  | { state: 'empty'; failing: number }
  | { state: 'loading' }
) & { queried: number; omitted: number };

export function gpsHeadline(view: Pick<GpsModeView, 'failure' | 'lines' | 'vehicles'>): GpsHeadline {
  const queried = queriedLines(view.lines);
  const omitted = view.lines.filter((l) => l.status === 'omitted').length;
  const counts = { queried: queried.length, omitted };
  const failing = queried.filter((l) => l.status === 'unavailable').length;
  if (view.failure === 'unconfigured') return { state: 'unconfigured', ...counts };
  if (queried.length === 0 && omitted === 0 && view.vehicles === 0) {
    const untracked = view.lines.filter((l) => l.status === 'untracked');
    return untracked.length > 0 ? { state: 'untracked-only', untracked, ...counts } : { state: 'no-lines', ...counts };
  }
  if (view.vehicles > 0) {
    return { state: 'live', liveLines: queried.filter((l) => l.status === 'live').length, ...counts };
  }
  if (view.failure || (queried.length > 0 && failing === queried.length)) return { state: 'failed', ...counts };
  if (queried.length > 0 && queried.every((l) => l.status === 'no-gps' || l.status === 'unavailable')) {
    return { state: 'empty', failing, ...counts };
  }
  return { state: 'loading', ...counts };
}

const COMPACT_ROW_TEXT: Partial<Record<GpsLineStatus['status'], string>> = {
  'no-gps': 'sin GPS ahora',
  unavailable: 'no se pudo consultar',
  untracked: 'sin GPS (la fuente no la sigue)',
  omitted: 'sin consultar (tope de 16 sentidos)',
};

/** "401: sin GPS ahora" si la línea elegida no tiene micros con GPS por una razón que se puede decir. */
export function selectedLineNotice(
  lines: readonly GpsLineStatus[],
  selectedRouteId: string | null,
  labelOf: (line: GpsLineStatus) => string,
): string | null {
  const selected = selectedRouteId ? lines.find((l) => l.routeId === selectedRouteId) : undefined;
  const text = selected?.status === 'no-gps' ? noGpsText(selected) : selected ? COMPACT_ROW_TEXT[selected.status] : undefined;
  return selected && text ? `${labelOf(selected)}: ${text}` : null;
}

/**
 * Una línea para el control compacto (teléfono con una ficha abierta): solo
 * cuando el GPS no está simplemente funcionando, para que el mapa sin micros
 * nunca quede sin explicación. Primero lo que impide todo, después la línea
 * elegida, después el resto. null si no hay nada que decir.
 */
export function compactGpsNotice(
  view: Pick<GpsModeView, 'failure' | 'lines' | 'vehicles'>,
  selectedRouteId: string | null,
  labelOf: (line: GpsLineStatus) => string,
): string | null {
  const headline = gpsHeadline(view);
  if (headline.state === 'unconfigured') return 'El GPS en vivo no está activado en este servidor';
  if (headline.state === 'failed') return 'No se pudo consultar el GPS · reintentando';
  const selected = selectedLineNotice(view.lines, selectedRouteId, labelOf);
  if (selected) return selected;
  if (headline.state === 'untracked-only') return 'Tus líneas no tienen GPS en la fuente';
  if (headline.state === 'no-lines') return 'Sin líneas en el mapa para ver su GPS';
  if (headline.state === 'empty') return 'Ninguna de tus líneas transmite GPS ahora';
  if (headline.omitted > 0) {
    return `${headline.omitted} ${headline.omitted === 1 ? 'línea' : 'líneas'} sin consultar (tope de 16 sentidos)`;
  }
  return null;
}
