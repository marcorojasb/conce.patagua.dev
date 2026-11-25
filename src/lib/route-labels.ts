// Ruta relativa con extensión: scripts/validate-map-links.ts carga este archivo con Node, sin el alias "@/".
import { BUS_LINES, INTERURBAN_NETWORKS, type BusLine } from '../data/bus-lines.ts';
import type { Route } from '@/types/transport';
import type { DirectionId } from '@/types/ui-contracts';

function directionsInOrder(route: Pick<Route, 'directions'>) {
  return [...(route.directions ?? [])].sort((a, b) => a.directionId - b.directionId);
}

/**
 * Nombre corto para listas. Con dos sentidos, los destinos de los letreros
 * oficiales en el orden de la píldora: 10A/N → "Centinela ↔ Los Bloques"
 * (10A va a Centinela, 10N a Los Bloques); con uno, "hacia <destino>". Sin
 * sentidos se quita el código del nombre: "02A: Centinela I" → "Centinela I",
 * "Biotrén L1 · Hualqui ↔ …" → "Hualqui ↔ …".
 */
export function routeShortName(route: Pick<Route, 'code' | 'name' | 'directions'>): string {
  const destinations = directionsInOrder(route)
    .map((d) => d.destination)
    .filter((d): d is string => !!d);
  if (destinations.length === 2 && destinations[0] !== destinations[1]) {
    return `${destinations[0]} ↔ ${destinations[1]}`;
  }
  if (destinations.length >= 1) return `hacia ${destinations[0]}`;
  const code = route.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stripped = route.name.replace(new RegExp(`^(Biotrén\\s+)?${code}\\s*[:·]\\s*`), '');
  return stripped || route.name;
}

/**
 * Lo que dice el letrero en cada sentido: "10A hacia Centinela, 10N hacia
 * Los Bloques". null si ningún sentido trae destino (Biotrén).
 */
export function routeDirectionsLabel(route: Pick<Route, 'code' | 'directions'>): string | null {
  const parts = directionsInOrder(route)
    .filter((d) => d.destination)
    .map((d) => `${d.variant ?? route.code} hacia ${d.destination}`);
  return parts.length > 0 ? parts.join(', ') : null;
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

/** Palabras sin tildes ni mayúsculas: "Flota Las Lilas 43T - Hualpencillo" → flota, las, lilas, 43t, hualpencillo. */
const foldedWords = (text: string) => fold(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/**
 * Si lo buscado aparece desde el comienzo de una palabra, con o sin espacios:
 * "riviera bio bio" calza con "Riviera Biobío" y "biobus" con "Biobús", pero
 * "lota" no con "Flota Las Lilas" ni "an" con "Chiguayante". Con `wholeWords`
 * además termina donde termina una palabra: "hualpencillo" calza con "Buses
 * Hualpencillo" y "hualpen" no.
 */
function matchesFromWordStart(text: string, query: string, wholeWords = false): boolean {
  const q = foldedWords(query).join('');
  if (!q) return false;
  const words = foldedWords(text);
  const joined = words.join('');
  // Dónde empieza cada palabra en `joined`, y al final su largo.
  const bounds = [0];
  for (const word of words) bounds.push(bounds[bounds.length - 1] + word.length);
  return bounds
    .slice(0, -1)
    .some((start) => joined.startsWith(q, start) && (!wholeWords || bounds.includes(start + q.length)));
}

/** Lo buscado, sin tildes y sin un "línea" adelante ("línea 14" → "14"). */
const normalizeQuery = (query: string) => fold(query.trim()).replace(/^linea\s+/, '');

/** Un nombre buscado con menos letras calzaría con casi todo. */
const MIN_NAME_QUERY = 2;

/**
 * Línea a la que pertenece un recorrido urbano, que es su empresa (unidad de
 * negocio): "30Q" y "30B" son la 30, "02A" la 2, "B02" la B0 (Biobús). La
 * línea se conoce por la empresa y su número ("Vía Láctea", la 10); el
 * recorrido, por el letrero (número, letra y destino: "10A Centinela").
 */
export function lineFamily(code: string): string {
  const trimmed = code.trim();
  if (/^B0\d/i.test(trimmed)) return 'B0';
  const match = /^0*(\d+)/.exec(trimmed);
  return match ? match[1] : trimmed;
}

const LINES_BY_KEY = new Map(BUS_LINES.map((line) => [lineFamily(line.number), line]));
const curatedLine = (key: string): BusLine | undefined => LINES_BY_KEY.get(key);

/** Todas las comunas de las líneas: lo buscado que empieza como una de ellas es esa comuna. */
const COMMUNES = Array.from(new Set(BUS_LINES.flatMap((line) => line.communes)));

/** Nombres curados de la línea de un código ("10AN" → Vía Láctea); vacío si no es una línea urbana conocida. */
function curatedLineNames(code: string): readonly string[] {
  const line = curatedLine(lineFamily(code));
  return line ? [line.name, ...(line.aliases ?? [])] : [];
}

/**
 * Empresa de un recorrido para fichas, comparador de operadores y búsqueda:
 * la de su línea en bus-lines.ts ("Buses Cóndor" y no el "Buses Condor" del
 * letrero; la 31 y la 32 por separado), salvo en la 50, donde cada recorrido
 * conserva la de su letrero (Buses Campanil o Denavi Sur). Sin línea curada
 * (interurbanos, o una línea que aún no está en la tabla), la del letrero.
 */
export function lineOperatorName(code: string, headsignOperator: string | undefined): string | undefined {
  const line = curatedLine(lineFamily(code));
  return line && !line.operatorPerRoute ? line.name : headsignOperator;
}

/**
 * Búsqueda de recorridos por número —el código o la variante que muestra la
 * micro en cada sentido ("10A" encuentra 10AN, "201 au" el 201-AU, "línea
 * 14" la 14; un número solo busca códigos)—, por destino del letrero o por
 * empresa, también con los nombres curados ("condor", "expreso chiguayante",
 * "riviera bio bio"). Sin tildes ("tome" encuentra Tomé) y desde el comienzo
 * de una palabra: "lota" no trae la 43 por "Flota Las Lilas".
 */
export function matchesRouteQuery(
  route: Pick<Route, 'code' | 'name' | 'operator' | 'directions'>,
  query: string,
): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  // Con el cero escrito ("02") se busca tal cual: la 02 y no las 20.
  const codeKey = /^0\d/.test(q) ? (code: string) => code.toUpperCase().replace(/[\s/-]+/g, '') : routeCodeKey;
  const key = codeKey(q);
  const directions = route.directions ?? [];
  // También lo que muestra la píldora ("30Q/E"): quien copia la etiqueta la encuentra.
  const codes = [route.code, routePillCode(route), ...directions.flatMap((d) => (d.variant ? [d.variant] : []))];
  if (key !== '' && codes.some((code) => codeKey(code).startsWith(key))) return true;
  // Un número solo es un código: "2" no trae la 12A por su nombre.
  if (/^\d+$/.test(q)) return false;
  const texts = [route.name, ...directions.map((d) => d.headsign), route.operator, ...curatedLineNames(route.code)];
  return texts.some((text) => matchesFromWordStart(text, q));
}

/**
 * Si el letrero o el nombre oficial del recorrido nombran el lugar con
 * palabras enteras ("hualqui" → 80H hacia Hualqui, y la 80J, que sale de
 * Hualqui), sin calzar con el comienzo de una empresa ("hualpen" no trae la
 * 02 por "Hualpensan").
 */
function routeNamesPlace(route: Pick<Route, 'name' | 'directions'>, place: string): boolean {
  return [route.name, ...(route.directions ?? []).map((d) => d.headsign)].some((text) =>
    matchesFromWordStart(text, place, true),
  );
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

// ── Grupos de la lista: líneas urbanas y corredores interurbanos ───────────

type GroupableRoute = Pick<Route, 'code' | 'name' | 'operator' | 'directions' | 'network'>;

export interface RouteGroup<R extends GroupableRoute = Route> {
  /** Línea: su número sin ceros ("10", "2", "B0"). Corredor: su red del GTFS. */
  key: string;
  kind: 'line' | 'corridor';
  /** Número de la unidad de negocio ("02", "10", "B0"); null en los corredores. */
  number: string | null;
  /** Como se conoce: la empresa ("Vía Láctea") o el destino del corredor ("Tomé"). */
  name: string;
  /** Comunas que recorre la línea; la primera y la última son sus extremos. */
  communes: readonly string[];
  /** Corredores: operador con fuente, o null si no está confirmado. */
  operator: string | null;
  aliases: readonly string[];
  /** Empresas que dicen los letreros del GTFS; más de una en la 50 (Campanil y Denavi Sur). */
  operators: readonly string[];
  /** En orden de código. */
  routes: R[];
}

function bucket<R extends GroupableRoute>(routes: readonly R[], keyOf: (route: R) => string): Map<string, R[]> {
  const map = new Map<string, R[]>();
  for (const route of routes) {
    const key = keyOf(route);
    const list = map.get(key);
    if (list) list.push(route);
    else map.set(key, [route]);
  }
  for (const list of map.values()) list.sort((a, b) => compareRouteCodes(a.code, b.code));
  return map;
}

const uniqueOperators = (routes: readonly GroupableRoute[]) =>
  Array.from(new Set(routes.map((r) => r.operator).filter(Boolean)));

/**
 * Micros urbanas por línea, de menor a mayor número (02, 10, 11 … 90, B0),
 * el orden de las señales de paradero oficiales. Se agrupa por número y no
 * por el nombre del letrero: la 31 y la 32 dicen "Ruta del Mar" y son
 * empresas distintas, y la 50 trae dos nombres.
 */
export function groupByLine<R extends GroupableRoute>(routes: readonly R[]): RouteGroup<R>[] {
  return Array.from(bucket(routes, (r) => lineFamily(r.code)), ([key, list]): RouteGroup<R> => {
    const line = curatedLine(key);
    const operators = uniqueOperators(list);
    return {
      key,
      kind: 'line',
      number: line?.number ?? key,
      name: line?.name ?? (operators.join(' y ') || `Línea ${key}`),
      communes: line?.communes ?? [],
      operator: null,
      aliases: line?.aliases ?? [],
      operators,
      routes: list,
    };
  }).sort((a, b) => compareRouteCodes(a.key, b.key));
}

/** Interurbanos por corredor (Santa Juana, Lota, Tomé), en orden de código. */
export function groupByCorridor<R extends GroupableRoute>(routes: readonly R[]): RouteGroup<R>[] {
  return Array.from(bucket(routes, (r) => r.network ?? ''), ([network, list]): RouteGroup<R> => {
    const corridor = INTERURBAN_NETWORKS.find((c) => c.network === network);
    const operator = corridor ? corridor.operator : null;
    return {
      key: network,
      kind: 'corridor',
      number: null,
      name: corridor?.name ?? network.replace(/^Interurbano\s+/, ''),
      communes: [],
      operator,
      aliases: [],
      operators: operator ? [operator] : [],
      routes: list,
    };
  }).sort((a, b) => compareRouteCodes(a.routes[0].code, b.routes[0].code));
}

/** Nombre corto de una comuna para la segunda línea del encabezado, que en un teléfono de 360 px no cabe entera. */
const SHORT_COMMUNE: Readonly<Record<string, string>> = { 'San Pedro de la Paz': 'San Pedro' };

/**
 * Segunda línea del encabezado. Línea: de qué comuna a qué comuna llega
 * ("Chiguayante – Talcahuano", "San Pedro – Concepción"; la lista completa,
 * con Concepción al medio y los nombres enteros, va en el title). Corredor:
 * su operador.
 */
export function groupDetail(group: Pick<RouteGroup<GroupableRoute>, 'kind' | 'communes' | 'operator'>): string {
  if (group.kind === 'corridor') return group.operator ?? 'Operador sin confirmar';
  const { communes } = group;
  return (communes.length > 2 ? [communes[0], communes[communes.length - 1]] : communes)
    .map((commune) => SHORT_COMMUNE[commune] ?? commune)
    .join(' – ');
}

/**
 * Para una fila que se lista fuera de su grupo (resultado suelto de una
 * búsqueda): "10 · Vía Láctea", "50 · Denavi Sur" (en la 50, la empresa de
 * su letrero), "Tomé · Transportes Tomé".
 */
export function routeGroupContext<R extends GroupableRoute>(group: RouteGroup<R>, route: R): string {
  if (group.kind === 'corridor') return `${group.name} · ${groupDetail(group)}`;
  const name = group.operators.length > 1 ? route.operator : group.name;
  return `${group.number} · ${name}`;
}

export type GroupMatch = 'open' | 'closed' | null;

/**
 * Cómo calza una búsqueda con un grupo entero:
 * - 'open': el número exacto ("14", "02", "línea 14") o la empresa desde el
 *   comienzo de una palabra, sin tildes ni espacios ("via lactea", "condor",
 *   "denavi", "riviera bio bio"): se muestra la línea completa y abierta. Si
 *   lo buscado empieza como una comuna, la empresa tiene que calzar con
 *   palabras enteras: "hualpencillo" abre la 42, "hualpen" no abre la 02
 *   (Hualpensan) ni la 42.
 * - 'closed': el comienzo de un número ("1" → 10…18) o una comuna ("penco",
 *   "hualpen"): la línea completa, cerrada.
 * - null: a lo más calzan recorridos sueltos (matchesRouteQuery).
 */
export function matchGroupQuery(
  group: Pick<RouteGroup<GroupableRoute>, 'number' | 'name' | 'aliases' | 'operators' | 'communes'>,
  query: string,
): GroupMatch {
  const q = normalizeQuery(query);
  if (!q) return null;
  if (group.number) {
    const key = routeCodeKey(q);
    const number = routeCodeKey(group.number);
    if (key === number) return 'open';
    // Tal como se escribe: "2" es el comienzo de 20…24 (y la 02 por el número exacto); "02" solo la 02.
    if (/^\d+$/.test(q) && group.number.startsWith(q)) return 'closed';
  }
  if (q.length < MIN_NAME_QUERY) return null;
  const cq = foldedWords(q).join('');
  const looksLikeCommune = COMMUNES.some((commune) => foldedWords(commune).join('').startsWith(cq));
  const names = [group.name, ...group.aliases, ...group.operators];
  if (names.some((name) => matchesFromWordStart(name, q, looksLikeCommune))) return 'open';
  if (group.communes.some((commune) => matchesFromWordStart(commune, q))) return 'closed';
  return null;
}

export type GroupSearchResult<R extends GroupableRoute> = RouteGroup<R> & { match: GroupMatch };

/**
 * Los grupos que deja una búsqueda. Si calza el grupo entero (matchGroupQuery)
 * van todos sus recorridos; si no, solo los que calzan por sí mismos, y la
 * lista los muestra sueltos con su línea al lado. Una línea que calza por
 * comuna muestra sueltos los recorridos cuyo letrero la nombra ("hualqui" →
 * 80H, 80Q…, "80 · Las Galaxias"); si ninguno la nombra (los de la 62 a Penco
 * dicen "Lirquen"), va entera y cerrada. Sin búsqueda, todo.
 */
export function searchGroups<R extends GroupableRoute>(
  groups: readonly RouteGroup<R>[],
  query: string,
): GroupSearchResult<R>[] {
  if (!query.trim()) return groups.map((group) => ({ ...group, match: null }));
  const byNumber = /^\d+$/.test(normalizeQuery(query));
  return groups.flatMap((group): GroupSearchResult<R>[] => {
    const match = matchGroupQuery(group, query);
    if (match === 'open') return [{ ...group, match }];
    if (match === 'closed') {
      const naming = byNumber ? [] : group.routes.filter((route) => routeNamesPlace(route, query));
      return [naming.length > 0 ? { ...group, routes: naming, match: null } : { ...group, match }];
    }
    const routes = group.routes.filter((route) => matchesRouteQuery(route, query));
    return routes.length > 0 ? [{ ...group, routes, match }] : [];
  });
}
