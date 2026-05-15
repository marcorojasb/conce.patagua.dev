// Aggregates per-operator metrics across the micro routes for the
// operator comparator. Computed on demand from the live `ROUTES` array —
// memoized against the routes-version subscription so it only recomputes
// after the micros lazy-chunk lands.

import { ROUTES, useRoutesVersion } from '@/data/routes';
import { distanceMeters } from '@/lib/geo';
import type { LatLngTuple } from '@/types/transport';
import { useMemo } from 'react';

export interface OperatorStat {
  operator: string;
  routesCount: number;
  totalKm: number;
  /** Stable sample color drawn from the first route of the operator. */
  color: string;
  /** Route ids belonging to this operator — used to bulk-toggle visibility. */
  routeIds: string[];
}

function pathKm(path: LatLngTuple[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += distanceMeters(
      [path[i - 1][0], path[i - 1][1]],
      [path[i][0], path[i][1]],
    );
  }
  return total / 1000;
}

function compute(): OperatorStat[] {
  const acc = new Map<
    string,
    { routes: number; km: number; color: string; ids: string[] }
  >();
  for (const r of ROUTES) {
    if (r.type !== 'micro') continue;
    const op = r.operator;
    const entry = acc.get(op) ?? { routes: 0, km: 0, color: r.color, ids: [] };
    entry.routes += 1;
    entry.km += pathKm(r.path);
    entry.ids.push(r.id);
    acc.set(op, entry);
  }
  return Array.from(acc.entries())
    .map(([operator, data]) => ({
      operator,
      routesCount: data.routes,
      totalKm: data.km,
      color: data.color,
      routeIds: data.ids,
    }))
    .sort((a, b) => b.routesCount - a.routesCount || b.totalKm - a.totalKm);
}

/**
 * Returns the operator stats for the current ROUTES state. Re-runs when
 * micros load (via the routes-version subscription).
 */
export function useOperatorStats(): OperatorStat[] {
  const version = useRoutesVersion();
  return useMemo(() => compute(), [version]);
}
