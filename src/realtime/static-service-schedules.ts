import { STATIC_SERVICE_PATTERNS, type StaticServicePattern } from '@/data/static-service-patterns';
import type { RouteSchedule, ScheduledTrip } from '@/types/transport';

const DAY_INDEXES = {
  weekday: [0, 1, 2, 3, 4],
  saturday: [5],
  sunday: [6],
} as const;

function emptySchedule(): RouteSchedule {
  return [[], [], [], [], [], [], []];
}

export function expandFrequencyWindow(pattern: StaticServicePattern): ScheduledTrip[] {
  const trips: ScheduledTrip[] = [];
  for (let start = pattern.startMin; start <= pattern.endMin; start += pattern.headwayMin) {
    trips.push([start, pattern.durationMin]);
  }
  return trips;
}

export function buildStaticRouteSchedules(
  patterns: StaticServicePattern[] = STATIC_SERVICE_PATTERNS,
): Record<string, RouteSchedule> {
  const schedules: Record<string, RouteSchedule> = {};
  for (const pattern of patterns) {
    const schedule = (schedules[pattern.id] ??= emptySchedule());
    const trips = expandFrequencyWindow(pattern);
    for (const day of pattern.days) {
      for (const index of DAY_INDEXES[day]) {
        schedule[index].push(...trips);
      }
    }
  }
  return schedules;
}

export const STATIC_ROUTE_SCHEDULES = buildStaticRouteSchedules();
