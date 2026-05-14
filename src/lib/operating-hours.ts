// Heuristics to decide whether a given route is operating "right now".
//
// Biotrén hours come in human strings like "05:45 — 23:10 (Lun-Vie)" and the
// frequencyByDay map has per-day keys. OSM bus routes have no hours at all,
// so we fall back to a conservative default window.

import type { Route } from '@/types/transport';

const DEFAULT_BUS_START_MIN = 6 * 60; // 06:00
const DEFAULT_BUS_END_MIN = 22 * 60 + 30; // 22:30

function parseHHMM(s: string): number | null {
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function parseHoursString(hours: string): { start: number; end: number } | null {
  // Matches "05:45 — 23:10" with em-dash, en-dash, or hyphen.
  const m = hours.match(/(\d{1,2}:\d{2})\s*[—–-]\s*(\d{1,2}:\d{2})/);
  if (!m) return null;
  const start = parseHHMM(m[1]);
  const end = parseHHMM(m[2]);
  if (start == null || end == null) return null;
  return { start, end };
}

export function isRouteOperatingAt(route: Route, date: Date): boolean {
  const parsed = parseHoursString(route.hours);
  const startMin = parsed?.start ?? DEFAULT_BUS_START_MIN;
  const endMin = parsed?.end ?? DEFAULT_BUS_END_MIN;
  const nowMin = date.getHours() * 60 + date.getMinutes();
  if (startMin <= endMin) {
    return nowMin >= startMin && nowMin <= endMin;
  }
  // Spans midnight (not the case in Concepción today, but be defensive).
  return nowMin >= startMin || nowMin <= endMin;
}

export function isRouteOperatingNow(route: Route): boolean {
  return isRouteOperatingAt(route, new Date());
}

/** Human-readable label for the operating status. */
export function operatingLabel(route: Route, date: Date = new Date()): string {
  const parsed = parseHoursString(route.hours);
  if (!parsed) return 'Horario no publicado';
  const active = isRouteOperatingAt(route, date);
  return active ? 'Operativo ahora' : 'Fuera de horario';
}
