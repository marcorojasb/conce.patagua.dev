import { BIOTREN_L1_STOPS, BIOTREN_L2_STOPS } from '../data/biotren.generated.ts';
import { BIOTREN_L1_TRACK, BIOTREN_L2_TRACK } from '../data/biotren-track.generated.ts';
import { GTFS_BUS_ROUTES } from '../data/gtfs-bus-routes.generated.ts';
import { GTFS_STOPS } from '../data/gtfs-stops.generated.ts';
import { ROUTE_SCHEDULES } from '../data/gtfs-schedule.generated.ts';
import { INTERURBAN_BUS_ROUTES, INTERURBAN_PARADEROS } from '../data/interurban-routes.generated.ts';
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
  const routeIds = new Set([
    'bt-l1',
    'bt-l2',
    ...INTERURBAN_BUS_ROUTES.map((route) => route.id),
    ...gtfsRouteIds,
  ]);
  const stopIds = new Set(GTFS_STOPS.map((stop) => stop.id));
  const scheduleRouteIds = new Set(Object.keys(ROUTE_SCHEDULES));

  if (GTFS_BUS_ROUTES.length === 0) {
    issue(issues, 'error', 'routes', 'GTFS sin recorridos', 'GTFS_BUS_ROUTES está vacío.');
  }
  if (GTFS_STOPS.length === 0) {
    issue(issues, 'error', 'stops', 'GTFS sin paraderos', 'GTFS_STOPS está vacío.');
  }
  if (scheduleRouteIds.size === 0) {
    issue(issues, 'error', 'schedules', 'Horarios vacíos', 'ROUTE_SCHEDULES no tiene rutas.');
  }

  for (const route of GTFS_BUS_ROUTES) {
    if (route.path.length < 2) {
      issue(
        issues,
        'error',
        'geometry',
        'Ruta GTFS sin trazado usable',
        `${route.ref} no tiene path suficiente para dibujarse.`,
        { routeId: route.id },
      );
    }
    for (const stopId of route.stopIds) {
      if (!stopIds.has(stopId)) {
        issue(
          issues,
          'error',
          'stops',
          'Paradero referenciado sin geometría',
          `${route.ref} referencia ${stopId}, pero no existe en GTFS_STOPS.`,
          { routeId: route.id, stopId },
        );
      }
    }
    if (!scheduleRouteIds.has(route.id)) {
      issue(
        issues,
        'warning',
        'schedules',
        'Ruta GTFS sin bucket horario',
        `${route.ref} aparece como ruta, pero no tiene entradas en ROUTE_SCHEDULES.`,
        { routeId: route.id },
      );
    }
  }

  for (const scheduleId of scheduleRouteIds) {
    if (!routeIds.has(scheduleId)) {
      issue(
        issues,
        'error',
        'schedules',
        'Horario referencia ruta inexistente',
        `${scheduleId} existe en ROUTE_SCHEDULES pero no en rutas cargables.`,
        { routeId: scheduleId },
      );
    }
  }

  const interurbanParaderoById = new Map(INTERURBAN_PARADEROS.map((stop) => [stop.id, stop]));
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
    ...INTERURBAN_BUS_ROUTES.map((route) => ({
      id: route.id,
      label: route.ref,
      path: route.path,
      stops: route.stopIds.map((id) => interurbanParaderoById.get(id)).filter((stop) => stop != null),
      rawMaxSegmentMeters: 1_500,
      maxStopDistanceMeters: 150,
    })),
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
