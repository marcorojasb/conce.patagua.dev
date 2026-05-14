// Curated overrides for bus route polylines whose OSM relations are
// irreparably broken (gaps, missing ways, wrong members) and that the
// endpoint-graph stitcher in scripts/fetch-bus-routes.ts can't recover
// automatically.
//
// HOW TO ADD AN OVERRIDE
//
//  1. Identify the broken route. After running `npm run sync:bus-routes`
//     the script logs "N residual gaps >250 m across M routes" — these
//     are candidates. Visually inspect the route at https://conce.patagua.dev
//     too.
//
//  2. Get a corrected polyline. Options, in order of preference:
//     a. **Edit OSM directly** (preferred — fixes the data for everyone).
//        Open the relation at https://www.openstreetmap.org/relation/<osmId>,
//        reorder/repair the way members, save. Run `npm run sync:bus-routes`
//        again to pick up the fix and DELETE the override entry.
//     b. **Draw a corrected polyline manually**, using the operator's
//        published route description (Wikipedia, operator website) as
//        reference. Use a tool like geojson.io to trace, then paste the
//        coords below.
//
//  3. Add an entry below, keyed by the route id (`osm-bus-<osmId>` as
//     it appears in bus-routes.generated.ts). Use 5-decimal precision.
//
//  4. Document the source in the comment immediately above each override.
//
// The override mechanism is applied in src/data/routes.ts when building
// the Route object — the override fully replaces the OSM-derived path,
// stopIds are recomputed against PARADEROS at runtime.

import type { LatLngTuple } from '@/types/transport';

export interface RouteOverride {
  path: LatLngTuple[];
  /** Short source/citation so future maintainers know where this came from. */
  source: string;
  /** ISO date the override was last verified. */
  verified: string;
}

export const ROUTE_OVERRIDES: Record<string, RouteOverride> = {
  // No overrides yet. Empty intentionally — every route currently flows
  // from OSM via the greedy stitcher. Populate this map when a specific
  // line still shows visible glitches after `npm run sync:bus-routes`.
  //
  // Example shape (kept commented for reference):
  //
  // 'osm-bus-12345678': {
  //   path: [
  //     [-36.82700, -73.04980],
  //     [-36.82550, -73.04670],
  //     // ...
  //   ],
  //   source: 'Wikipedia: Buses licitados del Gran Concepción + verificación OSM editor',
  //   verified: '2026-05-14',
  // },
};
