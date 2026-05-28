import { STATIC_SERVICE_PATTERNS } from '@/data/static-service-patterns';
import type { StopServiceWindow } from '@/data/gtfs-stop-services.generated';
import type { Route } from '@/types/transport';

export interface NextStopService {
  routeId: string;
  headsign: string;
  scheduledMin: number;
  minutesUntil: number;
  source: 'gtfs-window' | 'static-frequency';
  confidence: 'programmed' | 'estimated';
  countInWindow: number;
}

export interface StopServiceSnapshot {
  services: NextStopService[];
  hasGtfsWindows: boolean;
  hasStaticEstimates: boolean;
  generatedAt: Date;
}

function isoDayOfWeek(date: Date): number {
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

export function formatServiceClock(totalMin: number): string {
  const wrapped = ((Math.floor(totalMin) % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function nextFromWindow(
  firstMin: number,
  lastMin: number,
  headwayMin: number,
  count: number,
  nowMin: number,
  dayOffset: number,
): number | null {
  const offset = dayOffset * 1440;
  const first = firstMin + offset;
  const last = lastMin + offset;
  const target = nowMin;
  if (target > last) return null;
  if (headwayMin <= 0 || count <= 1) return first >= target ? first : null;
  if (target <= first) return first;
  const steps = Math.ceil((target - first) / headwayMin);
  const next = first + steps * headwayMin;
  return next <= last ? next : null;
}

export function getNextStopServices(input: {
  stopId: string;
  routeIds: string[];
  windows: readonly StopServiceWindow[] | undefined;
  now: Date;
  limit?: number;
  staticRoutes?: Route[];
}): StopServiceSnapshot {
  const limit = input.limit ?? 8;
  const routeFilter = new Set(input.routeIds);
  const day = isoDayOfWeek(input.now);
  const nowMin =
    input.now.getHours() * 60 +
    input.now.getMinutes() +
    input.now.getSeconds() / 60;
  const services: NextStopService[] = [];
  const windows = input.windows ?? [];

  for (const [routeId, headsign, windowDay, first, last, headway, count] of windows) {
    if (routeFilter.size > 0 && !routeFilter.has(routeId)) continue;
    for (const offset of [0, 1]) {
      const targetDay = (day + offset) % 7;
      if (windowDay !== targetDay) continue;
      const next = nextFromWindow(first, last, headway, count, nowMin, offset);
      if (next == null) continue;
      services.push({
        routeId,
        headsign,
        scheduledMin: next,
        minutesUntil: Math.max(0, Math.round(next - nowMin)),
        source: 'gtfs-window',
        confidence: 'programmed',
        countInWindow: count,
      });
      break;
    }
  }

  const staticServices = getStaticFrequencyServices({
    routeIds: input.routeIds,
    routes: input.staticRoutes ?? [],
    now: input.now,
  });
  services.push(...staticServices);

  services.sort((a, b) => a.minutesUntil - b.minutesUntil || a.routeId.localeCompare(b.routeId));
  return {
    services: services.slice(0, limit),
    hasGtfsWindows: windows.some(([routeId]) => routeFilter.size === 0 || routeFilter.has(routeId)),
    hasStaticEstimates: staticServices.length > 0,
    generatedAt: input.now,
  };
}

function getStaticFrequencyServices({
  routeIds,
  routes,
  now,
}: {
  routeIds: string[];
  routes: Route[];
  now: Date;
}): NextStopService[] {
  const routeSet = new Set(routeIds);
  const routeIdsWithStaticPattern = new Set(STATIC_SERVICE_PATTERNS.map((p) => p.routeId));
  const staticRoutes = routes.filter((route) => routeSet.has(route.id) && routeIdsWithStaticPattern.has(route.id));
  if (staticRoutes.length === 0) return [];

  const day = isoDayOfWeek(now);
  const dayKind = day < 5 ? 'weekday' : day === 5 ? 'saturday' : 'sunday';
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const out: NextStopService[] = [];
  const patternsByRoute = new Map<string, typeof STATIC_SERVICE_PATTERNS>();
  for (const pattern of STATIC_SERVICE_PATTERNS) {
    if (!pattern.days.some((day) => day === dayKind)) continue;
    const patterns = patternsByRoute.get(pattern.routeId);
    if (patterns) {
      patterns.push(pattern);
    } else {
      patternsByRoute.set(pattern.routeId, [pattern]);
    }
  }

  for (const route of staticRoutes) {
    const patterns = patternsByRoute.get(route.id) ?? [];
    for (const pattern of patterns) {
      const next = nextFromWindow(
        pattern.startMin,
        pattern.endMin,
        pattern.headwayMin,
        Math.max(1, Math.floor((pattern.endMin - pattern.startMin) / pattern.headwayMin)),
        nowMin,
        0,
      );
      if (next == null) continue;
      out.push({
        routeId: route.id,
        headsign: pattern.directionLabel,
        scheduledMin: next,
        minutesUntil: Math.max(0, Math.round(next - nowMin)),
        source: 'static-frequency',
        confidence: 'estimated',
        countInWindow: 0,
      });
    }
  }
  return out;
}
