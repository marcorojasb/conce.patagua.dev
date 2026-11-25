import { BIOTREN_L1_STOPS, BIOTREN_L2_STOPS } from '../data/biotren.generated.ts';
import { BIOTREN_L1_TRACK, BIOTREN_L2_TRACK } from '../data/biotren-track.generated.ts';
import { GTFS_BUS_ROUTES } from '../data/gtfs-bus-routes.generated.ts';
import { GTFS_STOPS } from '../data/gtfs-stops.generated.ts';
import { ROUTE_DIRECTION_SCHEDULES } from '../data/gtfs-schedule.generated.ts';
import { STATIC_SERVICE_PATTERNS } from '../data/static-service-patterns.ts';
import { KNOWN_FLEETS, URBAN_PERIMETER_FLEET, knownFleetOfRoute } from '../data/fleets.ts';
import { OPERATOR_TIMETABLES } from '../data/operator-timetables.ts';
import { densifyPath, distanceToPathMeters, maxSegmentMeters } from './geo.ts';
import { compareRouteCodes } from './route-labels.ts';
import { fixedIntervalProgram, peakInTransit } from './schedule-program.ts';
import type { LatLngTuple, ScheduledTrip, Stop } from '../types/transport.ts';

export type DataQualitySeverity = 'error' | 'warning' | 'info';
export type DataQualityCategory = 'routes' | 'stops' | 'schedules' | 'geometry' | 'simulation';

export interface DataQualityIssue {
  severity: DataQualitySeverity;
  category: DataQualityCategory;
  title: string;
  detail: string;
  routeId?: string;
  stopId?: string;
}

export interface FixedIntervalRouteRow {
  routeId: string;
  /** route.ref */
  code: string;
  /** [menor, mayor] intervalo de programa entre sus sentidos; null si ese día ninguno es programa. */
  headways: Record<'weekday' | 'saturday' | 'sunday', [number, number] | null>;
  /** Salidas del GTFS en día hábil, ambos sentidos. */
  weekdayTrips: number;
  /** peakInTransit de esas salidas. */
  weekdayPeak: number;
  /** groupPeak: pico en día hábil de todos los recorridos de la flota. */
  fleet: { id: string; buses: number; groupPeak: number } | null;
}

export interface DataQualityReport {
  issues: DataQualityIssue[];
  summary: Record<DataQualitySeverity, number>;
  routeCount: number;
  stopCount: number;
  scheduledRouteCount: number;
  simulatedRouteCount: number;
  /** Recorridos con algún día de programa a intervalo fijo, en orden de código. */
  programs: FixedIntervalRouteRow[];
}

const PROGRAM_DAYS = { weekday: 0, saturday: 5, sunday: 6 } as const;

function clock(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function issue(
  issues: DataQualityIssue[],
  severity: DataQualitySeverity,
  category: DataQualityCategory,
  title: string,
  detail: string,
  refs: Pick<DataQualityIssue, 'routeId' | 'stopId'> = {},
) {
  issues.push({ severity, category, title, detail, ...refs });
}

export function summarizeIssues(issues: readonly DataQualityIssue[]): Record<DataQualitySeverity, number> {
  return {
    error: issues.filter((i) => i.severity === 'error').length,
    warning: issues.filter((i) => i.severity === 'warning').length,
    info: issues.filter((i) => i.severity === 'info').length,
  };
}

export function buildDataQualityReport(): DataQualityReport {
  const issues: DataQualityIssue[] = [];
  const gtfsRouteIds = new Set(GTFS_BUS_ROUTES.map((route) => route.id));
  const routeIds = new Set(['bt-l1', 'bt-l2', ...gtfsRouteIds]);
  const stopIds = new Set(GTFS_STOPS.map((stop) => stop.id));
  // Los horarios GTFS van por sentido: `<routeId>#<directionId>`.
  const directionScheduleIds = new Set(Object.keys(ROUTE_DIRECTION_SCHEDULES));
  const scheduleRouteIds = new Set(
    Array.from(directionScheduleIds, (key) => key.slice(0, key.lastIndexOf('#'))),
  );
  const directionIds = new Set<string>();

  if (GTFS_BUS_ROUTES.length === 0) {
    issue(issues, 'error', 'routes', 'GTFS sin recorridos', 'GTFS_BUS_ROUTES está vacío.');
  }
  if (GTFS_STOPS.length === 0) {
    issue(issues, 'error', 'stops', 'GTFS sin paraderos', 'GTFS_STOPS está vacío.');
  }
  if (directionScheduleIds.size === 0) {
    issue(issues, 'error', 'schedules', 'Horarios vacíos', 'ROUTE_DIRECTION_SCHEDULES no tiene sentidos.');
  }

  for (const route of GTFS_BUS_ROUTES) {
    const directions = route.directions ?? [];
    if (directions.length === 0) {
      issue(issues, 'error', 'routes', 'Ruta GTFS sin sentidos', `${route.ref} no trae sentidos (directions).`, {
        routeId: route.id,
      });
    }
    for (const direction of directions) {
      const label = `${route.ref} sentido ${direction.directionId}`;
      const scheduleId = `${route.id}#${direction.directionId}`;
      directionIds.add(scheduleId);
      if (direction.path.length < 2) {
        issue(issues, 'error', 'geometry', 'Sentido GTFS sin trazado usable', `${label} no tiene path suficiente para dibujarse.`, {
          routeId: route.id,
        });
      }
      for (const stopId of direction.stopIds) {
        if (!stopIds.has(stopId)) {
          issue(
            issues,
            'error',
            'stops',
            'Paradero referenciado sin geometría',
            `${label} referencia ${stopId}, pero no existe en GTFS_STOPS.`,
            { routeId: route.id, stopId },
          );
        }
      }
      if (!directionScheduleIds.has(scheduleId)) {
        issue(
          issues,
          'warning',
          'schedules',
          'Ruta GTFS sin bucket horario',
          `${label} aparece como ruta, pero no tiene entradas en ROUTE_DIRECTION_SCHEDULES.`,
          { routeId: route.id },
        );
      }
    }
    if (!route.serviceSpans) {
      issue(
        issues,
        'warning',
        'schedules',
        'Ruta GTFS sin tramos de servicio',
        `${route.ref} no trae serviceSpans: "Operando ahora" la mostrará siempre fuera de horario.`,
        { routeId: route.id },
      );
    }
  }

  for (const scheduleId of directionScheduleIds) {
    if (!directionIds.has(scheduleId)) {
      const routeId = scheduleId.slice(0, scheduleId.lastIndexOf('#'));
      issue(
        issues,
        'error',
        'schedules',
        'Horario referencia sentido inexistente',
        `${scheduleId} existe en ROUTE_DIRECTION_SCHEDULES pero no como sentido de una ruta cargable.`,
        { routeId },
      );
    }
  }

  const routeQualityInputs: Array<{
    id: string;
    label: string;
    path: LatLngTuple[];
    stops: Array<Pick<Stop, 'id' | 'lat' | 'lng'>>;
    rawMaxSegmentMeters: number;
    maxStopDistanceMeters: number;
  }> = [
    {
      id: 'bt-l1',
      label: 'Biotrén L1',
      path: BIOTREN_L1_TRACK,
      stops: BIOTREN_L1_STOPS,
      rawMaxSegmentMeters: 4_000,
      maxStopDistanceMeters: 120,
    },
    {
      id: 'bt-l2',
      label: 'Biotrén L2',
      path: BIOTREN_L2_TRACK,
      stops: BIOTREN_L2_STOPS,
      rawMaxSegmentMeters: 4_000,
      maxStopDistanceMeters: 120,
    },
  ];

  for (const route of routeQualityInputs) {
    if (route.path.length < 2) {
      issue(issues, 'error', 'geometry', 'Ruta sin trazado usable', `${route.label} no tiene path usable.`, {
        routeId: route.id,
      });
      continue;
    }
    const rawMax = maxSegmentMeters(route.path);
    if (rawMax > route.rawMaxSegmentMeters) {
      issue(
        issues,
        'warning',
        'geometry',
        'Segmento largo en trazado fuente',
        `${route.label} tiene un segmento fuente de ${Math.round(rawMax)} m; runtime lo densifica.`,
        { routeId: route.id },
      );
    }
    const normalizedMax = maxSegmentMeters(densifyPath(route.path, 300));
    if (normalizedMax > 320) {
      issue(
        issues,
        'error',
        'geometry',
        'Segmento largo tras densificar',
        `${route.label} queda con segmento de ${Math.round(normalizedMax)} m tras densificar.`,
        { routeId: route.id },
      );
    }
    for (const stop of route.stops) {
      const distance = distanceToPathMeters([stop.lat, stop.lng], route.path);
      if (distance > route.maxStopDistanceMeters) {
        issue(
          issues,
          'error',
          'geometry',
          'Paradero lejos del trazado',
          `${stop.id} está a ${Math.round(distance)} m de ${route.label}.`,
          { routeId: route.id, stopId: stop.id },
        );
      }
    }
  }

  const staticRouteIds = new Set(STATIC_SERVICE_PATTERNS.map((pattern) => pattern.routeId));
  for (const routeId of staticRouteIds) {
    if (!routeIds.has(routeId)) {
      issue(
        issues,
        'error',
        'simulation',
        'Patrón estático sin ruta',
        `${routeId} tiene patrón de simulación, pero no existe como ruta.`,
        { routeId },
      );
    }
  }
  const simulatedRouteCount = new Set([...scheduleRouteIds, ...staticRouteIds]).size;
  issue(
    issues,
    'info',
    'simulation',
    'Cobertura de simulación',
    `${simulatedRouteCount} rutas tienen horarios GTFS o patrones estáticos para servicios en curso.`,
  );

  const programs = checkFixedIntervalPrograms(issues, gtfsRouteIds, directionScheduleIds);

  return {
    issues,
    summary: summarizeIssues(issues),
    routeCount: routeIds.size,
    stopCount: stopIds.size,
    scheduledRouteCount: scheduleRouteIds.size,
    simulatedRouteCount,
    programs,
  };
}

/**
 * El GTFS es un programa a intervalo fijo, no un itinerario (ver
 * schedule-program.ts): cuántos sentidos lo son, cuántas micros pondría en
 * ruta a la vez contra la flota real y qué datos curados lo reemplazan. Todo
 * sobre el GTFS crudo: diagnostica el feed, no lo que muestra el visor.
 */
function checkFixedIntervalPrograms(
  issues: DataQualityIssue[],
  gtfsRouteIds: ReadonlySet<string>,
  directionScheduleIds: ReadonlySet<string>,
): FixedIntervalRouteRow[] {
  const keysByRoute = new Map<string, string[]>();
  for (const key of directionScheduleIds) {
    const routeId = key.slice(0, key.lastIndexOf('#'));
    keysByRoute.set(routeId, [...(keysByRoute.get(routeId) ?? []), key]);
  }
  const tripsOf = (routeIds: readonly string[], day: number): ScheduledTrip[] =>
    routeIds.flatMap((routeId) => (keysByRoute.get(routeId) ?? []).flatMap((key) => ROUTE_DIRECTION_SCHEDULES[key][day]));

  let weekdayDirections = 0;
  let programDirections = 0;
  let weekdayTrips = 0;
  let programTrips = 0;
  for (const key of directionScheduleIds) {
    const trips = ROUTE_DIRECTION_SCHEDULES[key][PROGRAM_DAYS.weekday];
    if (trips.length === 0) continue;
    weekdayDirections += 1;
    weekdayTrips += trips.length;
    if (fixedIntervalProgram(trips)) {
      programDirections += 1;
      programTrips += trips.length;
    }
  }
  if (programDirections > 0) {
    const pct = ((programTrips / weekdayTrips) * 100).toLocaleString('es-CL', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    issue(
      issues,
      'warning',
      'schedules',
      'Programa a intervalo fijo',
      `${programDirections} de ${weekdayDirections} sentidos de día hábil salen a intervalo fijo de la primera a la última salida (${pct} % de los viajes). El GTFS es un programa, no un itinerario: las fichas muestran su frecuencia y su ventana, no cuentan salidas.`,
    );
  }

  const urbanRouteIds = GTFS_BUS_ROUTES.filter((route) => route.network === URBAN_PERIMETER_FLEET.network).map(
    (route) => route.id,
  );
  const urban = peakInTransit(tripsOf(urbanRouteIds, PROGRAM_DAYS.weekday));
  const urbanOver = urban.peak > URBAN_PERIMETER_FLEET.buses;
  issue(
    issues,
    urbanOver ? 'warning' : 'info',
    'simulation',
    'Flota implícita de la red urbana',
    `En día hábil el programa pone ${urban.peak.toLocaleString('es-CL')} micros urbanas en ruta a la vez (${clock(urban.at ?? 0)}); la flota inscrita del perímetro es ${URBAN_PERIMETER_FLEET.buses.toLocaleString('es-CL')} (${URBAN_PERIMETER_FLEET.sourceLabel}).`,
  );

  const groupPeaks = new Map<string, number>();
  for (const fleet of KNOWN_FLEETS) {
    for (const routeId of fleet.routeIds) {
      if (!gtfsRouteIds.has(routeId)) {
        issue(
          issues,
          'error',
          'simulation',
          'Flota curada con recorrido inexistente',
          `${capitalize(fleet.label)}: ${routeId} no existe en GTFS_BUS_ROUTES (src/data/fleets.ts).`,
        );
      }
    }
    const [weekday, saturday, sunday] = [PROGRAM_DAYS.weekday, PROGRAM_DAYS.saturday, PROGRAM_DAYS.sunday].map(
      (day) => peakInTransit(tripsOf(fleet.routeIds, day)).peak,
    );
    groupPeaks.set(fleet.id, weekday);
    const over = weekday > fleet.buses;
    issue(
      issues,
      over ? 'warning' : 'info',
      'simulation',
      over ? 'Flota implícita sobre la real' : 'Flota implícita dentro de la real',
      `${capitalize(fleet.label)}: el GTFS pone ${weekday} micros en ruta a la vez en día hábil (sábado ${saturday}, domingo ${sunday}); flota real ${fleet.buses} (${fleet.sourceLabel}).` +
        (over ? ' En el mapa se ralean sus salidas de programa hasta caber.' : ''),
      { routeId: fleet.routeIds[0] },
    );
  }

  const timetablesByRoute = new Map<string, typeof OPERATOR_TIMETABLES>();
  for (const timetable of OPERATOR_TIMETABLES) {
    if (!directionScheduleIds.has(timetable.scheduleKey)) {
      issue(
        issues,
        'error',
        'schedules',
        'Itinerario del operador sin sentido GTFS',
        `${timetable.label}: ${timetable.scheduleKey} no existe en ROUTE_DIRECTION_SCHEDULES (src/data/operator-timetables.ts).`,
      );
      continue;
    }
    const routeId = timetable.scheduleKey.slice(0, timetable.scheduleKey.lastIndexOf('#'));
    timetablesByRoute.set(routeId, [...(timetablesByRoute.get(routeId) ?? []), timetable]);
  }
  for (const [routeId, timetables] of timetablesByRoute) {
    const code = GTFS_BUS_ROUTES.find((route) => route.id === routeId)?.ref ?? routeId;
    const operatorTrips = timetables.reduce((sum, t) => sum + t.trips.length, 0);
    const gtfsTrips = timetables.reduce((sum, t) => sum + ROUTE_DIRECTION_SCHEDULES[t.scheduleKey][PROGRAM_DAYS.weekday].length, 0);
    // "kupos.cl, 25-11-2026": sitio de la lista y fecha en que se leyó.
    const [{ sourceUrl, sourceLabel }] = timetables;
    const readOn = [new URL(sourceUrl).hostname.replace(/^www\./, ''), sourceLabel.match(/\d{2}-\d{2}-\d{4}/)?.[0]]
      .filter(Boolean)
      .join(', ');
    issue(
      issues,
      'info',
      'schedules',
      'Itinerario del operador',
      `${code}: de lunes a viernes el visor usa la lista de venta del operador (${operatorTrips} salidas, ${readOn}) en vez de las ${gtfsTrips} del programa GTFS.`,
      { routeId },
    );
  }

  const rows: FixedIntervalRouteRow[] = [];
  for (const route of GTFS_BUS_ROUTES) {
    const keys = keysByRoute.get(route.id) ?? [];
    const headways = {} as FixedIntervalRouteRow['headways'];
    for (const [name, day] of Object.entries(PROGRAM_DAYS) as [keyof typeof PROGRAM_DAYS, number][]) {
      const intervals = keys.flatMap((key) => fixedIntervalProgram(ROUTE_DIRECTION_SCHEDULES[key][day])?.headwayMin ?? []);
      headways[name] = intervals.length > 0 ? [Math.min(...intervals), Math.max(...intervals)] : null;
    }
    if (!headways.weekday && !headways.saturday && !headways.sunday) continue;
    const weekdayRouteTrips = tripsOf([route.id], PROGRAM_DAYS.weekday);
    const fleet = knownFleetOfRoute(route.id);
    rows.push({
      routeId: route.id,
      code: route.ref,
      headways,
      weekdayTrips: weekdayRouteTrips.length,
      weekdayPeak: peakInTransit(weekdayRouteTrips).peak,
      fleet: fleet ? { id: fleet.id, buses: fleet.buses, groupPeak: groupPeaks.get(fleet.id) ?? 0 } : null,
    });
  }
  return rows.sort((a, b) => compareRouteCodes(a.code, b.code));
}
