// Líneas "En el mapa": la URL las guarda como códigos ("30QE", "L1") en el
// orden en que se agregaron (`lineas=`); sin el parámetro es el conjunto por
// defecto, que crece cuando llega el chunk GTFS con los interurbanos. Aquí se
// resuelven a ids y se calculan los cambios; App los escribe con replace.

import { routeCodeKey } from '@/lib/route-labels';
import type { Route } from '@/types/transport';

export interface LinesCatalog {
  /** ROUTES (crece en el lugar al llegar el chunk GTFS). */
  routes: readonly Route[];
  /** DEFAULT_VISIBLE_ROUTE_IDS (también crece en el lugar). */
  defaultIds: readonly string[];
}

// Mismo criterio que findRoute (id, código o variante de un sentido), pero
// contra el catálogo recibido para poder probarlo sin el chunk GTFS.
function routeFor(ref: string, catalog: LinesCatalog): Route | null {
  const key = routeCodeKey(ref);
  let byVariant: Route | null = null;
  for (const route of catalog.routes) {
    if (route.id === ref || routeCodeKey(route.code) === key) return route;
    if (!byVariant && route.directions?.some((d) => d.variant && routeCodeKey(d.variant) === key)) byVariant = route;
  }
  return byVariant;
}

/** Ids visibles en orden de agregado, más los códigos que no calzan con ningún recorrido. */
export function resolveLines(
  lines: readonly string[] | null,
  catalog: LinesCatalog,
): { ids: string[]; unknown: string[] } {
  if (lines == null) {
    const known = new Set(catalog.routes.map((r) => r.id));
    return { ids: catalog.defaultIds.filter((id) => known.has(id)), unknown: [] };
  }
  const ids: string[] = [];
  const unknown: string[] = [];
  for (const code of lines) {
    const route = routeFor(code, catalog);
    if (!route) unknown.push(code);
    else if (!ids.includes(route.id)) ids.push(route.id);
  }
  return { ids, unknown };
}

function codesFor(ids: readonly string[], catalog: LinesCatalog): string[] {
  const byId = new Map(catalog.routes.map((r) => [r.id, r]));
  return ids.flatMap((id) => {
    const route = byId.get(id);
    return route ? [route.code] : [];
  });
}

/**
 * Prende o apaga una línea. Desde el conjunto por defecto lo materializa
 * primero, así la lista guardada sigue siendo la que el usuario ve.
 */
export function toggleLine(lines: readonly string[] | null, id: string, catalog: LinesCatalog): string[] {
  const current = resolveLines(lines, catalog).ids;
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  return codesFor(next, catalog);
}

/** Agrega (al final, en el orden dado) o quita varias líneas a la vez. */
export function setLinesVisible(
  lines: readonly string[] | null,
  ids: readonly string[],
  visible: boolean,
  catalog: LinesCatalog,
): string[] {
  const current = resolveLines(lines, catalog).ids;
  if (!visible) {
    const drop = new Set(ids);
    return codesFor(current.filter((id) => !drop.has(id)), catalog);
  }
  const next = [...current];
  for (const id of ids) if (!next.includes(id)) next.push(id);
  return codesFor(next, catalog);
}

/** De las líneas visibles, las que el filtro "Operando ahora" saca del mapa. */
export function hiddenByFilter(
  ids: readonly string[],
  isOperating: (id: string) => boolean,
): Set<string> {
  return new Set(ids.filter((id) => !isOperating(id)));
}

/**
 * La lista equivale al conjunto por defecto (mismo conjunto, en cualquier
 * orden). Antes del chunk GTFS el defecto aún está incompleto: una lista
 * explícita no se da por defecto, para no perderla al escribir la URL.
 */
export function linesEqualDefault(
  lines: readonly string[] | null,
  catalog: LinesCatalog,
  routesReady: boolean,
): boolean {
  if (lines == null) return true;
  if (!routesReady) return false;
  const { ids, unknown } = resolveLines(lines, catalog);
  if (unknown.length > 0) return false;
  const defaults = resolveLines(null, catalog).ids;
  return ids.length === defaults.length && defaults.every((id) => ids.includes(id));
}
