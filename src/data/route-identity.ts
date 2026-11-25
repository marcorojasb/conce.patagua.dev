// Color de identidad curado (tema claro) del Biotrén y de los interurbanos.
// Módulo chico y sin datos: lo usan routes.ts y el wiki, que así pinta los
// códigos de estas líneas igual que el visor sin cargar el GTFS.
//
// Biotrén en azules, L1 más claro que L2 (un paso más oscuro que el diseño
// original para llegar a 3:1 sobre el mapa claro). Interurbanos: la familia
// de color dice el corredor (petróleo Santa Juana, verde Lota, cian Tomé); el
// `route_color` oficial mezclaba morados, lima y cian que chocaban entre sí.
// 401 y 401Y (tronco y variante) comparten color a propósito. Las urbanas
// conservan su `route_color` oficial y no están aquí.

import { routeCodeKey } from '@/lib/route-labels';

export const BIOTREN_IDENTITY = { L1: '#0284c7', L2: '#075985' } as const;

export const INTERURBAN_IDENTITY: Record<string, string> = {
  '201': '#0f766e',
  '201-AU': '#115e59',
  '302': '#258343',
  '304': '#126635',
  '401': '#0e7490',
  '401Y': '#0e7490',
  '411': '#155e75',
  '421': '#0891b2',
};

const BY_KEY = new Map(
  Object.entries({ ...BIOTREN_IDENTITY, ...INTERURBAN_IDENTITY }).map(([code, color]) => [routeCodeKey(code), color]),
);

/** Color curado de un código de Biotrén o interurbano ("L1", "201 AU", "401Y"); null en las urbanas. */
export function curatedRouteColor(code: string): string | null {
  return BY_KEY.get(routeCodeKey(code)) ?? null;
}
