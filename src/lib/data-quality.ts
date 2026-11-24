import { BIOTREN_L1_STOPS, BIOTREN_L2_STOPS } from '../data/biotren.generated.ts';
import { BIOTREN_L1_TRACK, BIOTREN_L2_TRACK } from '../data/biotren-track.generated.ts';
import { GTFS_BUS_ROUTES } from '../data/gtfs-bus-routes.generated.ts';
import { GTFS_STOPS } from '../data/gtfs-stops.generated.ts';
import { ROUTE_DIRECTION_SCHEDULES } from '../data/gtfs-schedule.generated.ts';
import { STATIC_SERVICE_PATTERNS } from '../data/static-service-patterns.ts';
import { densifyPath, distanceToPathMeters, maxSegmentMeters } from './geo.ts';
import type { LatLngTuple, Stop } from '../types/transport.ts';

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

export interface DataQualityReport {
  issues: DataQualityIssue[];
  summary: Record<DataQualitySeverity, number>;
  routeCount: number;
  stopCount: number;
  scheduledRouteCount: number;
  simulatedRouteCount: number;
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

  return {
    issues,
    summary: summarizeIssues(issues),
    routeCount: routeIds.size,
    stopCount: stopIds.size,
    scheduledRouteCount: scheduleRouteIds.size,
    simulatedRouteCount,
  };
}
