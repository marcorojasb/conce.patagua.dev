// Naïve route-coverage finder: given an origin and a destination, returns
// routes whose polyline has at least one vertex within `maxDistanceM` of each.
//
// Doesn't model transfers, walking distance to the actual stop, or direction
// of travel — for those, we'd need a proper GTFS journey planner. This covers
// the most common "is there a single ride that takes me from A near B?" use.

import { distanceMeters, type LatLng } from '@/lib/geo';
import type { Route } from '@/types/transport';

export interface PlannerMatch {
  route: Route;
  originDistance: number;
  destinationDistance: number;
  totalDistance: number;
}

export function findRoutes(
  origin: LatLng,
  destination: LatLng,
  routes: Route[],
  maxDistanceM = 400,
): PlannerMatch[] {
  const matches: PlannerMatch[] = [];
  for (const r of routes) {
    let minO = Infinity;
    let minD = Infinity;
    for (const p of r.path) {
      const pll: LatLng = [p[0], p[1]];
      const dO = distanceMeters(pll, origin);
      if (dO < minO) minO = dO;
      const dD = distanceMeters(pll, destination);
      if (dD < minD) minD = dD;
      if (minO <= 1 && minD <= 1) break;
    }
    if (minO <= maxDistanceM && minD <= maxDistanceM) {
      matches.push({
        route: r,
        originDistance: minO,
        destinationDistance: minD,
        totalDistance: minO + minD,
      });
    }
  }
  matches.sort((a, b) => a.totalDistance - b.totalDistance);
  return matches;
}
