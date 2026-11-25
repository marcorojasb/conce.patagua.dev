import type { Route } from '@/types/transport';
import type { DirectionId } from '@/types/ui-contracts';

/**
 * Nombre corto para listas. Con dos sentidos, "origen ↔ destino" desde los
 * letreros oficiales (10AN → "Los Bloques ↔ Centinela", mismo orden que el
 * route_long_name de DTPR); con uno, "hacia <destino>". Sin sentidos se quita
 * el código del nombre: "02A: Centinela I" → "Centinela I", "Biotrén L1 · Hualqui ↔ …" → "Hualqui ↔ …".
 */
export function routeShortName(route: Pick<Route, 'code' | 'name' | 'directions'>): string {
  const destinations = (route.directions ?? []).map((d) => d.destination).filter((d): d is string => !!d);
  if (destinations.length === 2 && destinations[0] !== destinations[1]) {
    return `${destinations[1]} ↔ ${destinations[0]}`;
  }
  if (destinations.length >= 1) return `hacia ${destinations[0]}`;
  const code = route.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stripped = route.name.replace(new RegExp(`^(Biotrén\\s+)?${code}\\s*[:·]\\s*`), '');
  return stripped || route.name;
}

/**
 * Clave para comparar códigos tal como los escribe la gente o los trae otra
 * fuente: sin mayúsculas, espacios, guiones, barras ni ceros a la izquierda
 * ("02A" = "2a", "201 AU" = "201-AU", "30Q/E" = "30QE", lo que muestra la
 * píldora de la línea).
 */
export function routeCodeKey(code: string): string {
  return code.toUpperCase().replace(/[\s/-]+/g, '').replace(/^0+(?=\d)/, '');
}

/** Texto para comparar sin tildes ni mayúsculas: "Lirquén" → "lirquen". */
export const fold = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * Búsqueda de recorridos por número —el código o la variante que muestra la
 * micro en cada sentido ("10A" encuentra 10AN, "201 au" el 201-AU)—, por
 * destino del letrero u operador. Sin tildes: "tome" encuentra Tomé.
 */
export function matchesRouteQuery(
  route: Pick<Route, 'code' | 'name' | 'operator' | 'directions'>,
  query: string,
): boolean {
  const q = fold(query.trim());
  if (!q) return true;
  const key = routeCodeKey(q);
  const directions = route.directions ?? [];
  // También lo que muestra la píldora ("30Q/E"): quien copia la etiqueta la encuentra.
  const codes = [route.code, routePillCode(route), ...directions.flatMap((d) => (d.variant ? [d.variant] : []))];
  return (
    (key !== '' && codes.some((code) => routeCodeKey(code).startsWith(key))) ||
    fold(route.name).includes(q) ||
    directions.some((d) => fold(d.headsign).includes(q)) ||
    fold(route.operator).includes(q)
  );
}

/**
 * Número de línea al que pertenece una variante: "30Q" y "30B" son la línea
 * 30, "02A" la 2, "10 J" la 10. Así se agrupa en la lista: la gente conoce
 * las micros por número, no por la empresa que las opera.
 */
export function lineFamily(code: string): string {
  const match = /^0*(\d+)/.exec(code.trim());
  return match ? match[1] : code.trim();
}

const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

/** Orden natural de códigos: 2A < 10A < 10B < 30Q < 201. */
export function compareRouteCodes(a: string, b: string): number {
  return collator.compare(a, b);
}

/**
 * Servicios interurbanos que DTPR publica en el mismo GTFS que la red urbana:
 * "Interurbano Santa Juana" (201, 201-AU), "Interurbano Tomé" (401, 401Y,
 * 411, 421) e "Interurbano Lota" (302, 304).
 */
export function isInterurban(route: Pick<Route, 'network'>): boolean {
  return route.network?.startsWith('Interurbano') ?? false;
}

function directionsInOrder(route: Pick<Route, 'directions'>) {
  return [...(route.directions ?? [])].sort((a, b) => a.directionId - b.directionId);
}

/**
 * Código de la línea completa para píldoras y títulos: con dos sentidos de
 * letrero distinto que solo cambian en la última letra, las dos juntas
 * ("30QE" → "30Q/E", "23BS" → "23B/S"); con dos letreros distintos de otra
 * forma, "v0/v1"; si no, el código tal cual ("201", "201-AU", "02C-Y", "L1").
 * Así se lee lo que dice la micro y no un código que no aparece en la calle.
 */
export function routePillCode(route: Pick<Route, 'code' | 'directions'>): string {
  const variants = directionsInOrder(route).map((d) => d.variant);
  if (variants.length !== 2) return route.code;
  const [first, second] = variants;
  if (!first || !second || first === second) return route.code;
  if (first.length === second.length && first.slice(0, -1) === second.slice(0, -1)) {
    return `${first}/${second.slice(-1)}`;
  }
  return `${first}/${second}`;
}

/**
 * Código de un sentido: el letrero de la micro en ese sentido ("30E"), o el
 * de la línea si no tiene ("401"). Sin sentido (ambos, o Biotrén) es el de
 * la línea completa, igual que routePillCode.
 */
export function directionCode(
  route: Pick<Route, 'code' | 'directions'>,
  directionId: DirectionId | null,
): string {
  if (directionId == null) return routePillCode(route);
  const direction = route.directions?.find((d) => d.directionId === directionId);
  return direction?.variant ?? route.code;
}
