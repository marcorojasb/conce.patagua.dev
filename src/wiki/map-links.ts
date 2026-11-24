// Map ↔ Wiki link index — la "tabla puente" entre entidades del visor
// y artículos del /wiki.
//
// ¿Por qué vive en `src/wiki/` y no en `src/data/`?
//   El índice es propiedad del wiki: los artículos saben de su existencia
//   y a qué entidades del mapa quieren enlazar. El mapa, por su parte,
//   sólo consume este archivo para decidir si mostrar un botón "Ver en
//   el wiki →" cuando hay artículo. Cambios al wiki van en el mismo PR
//   sin tocar `src/data/`.
//
// Formato
// -------
// El índice se organiza por tipo de entidad porque cada uno tiene su
// propio identificador estable:
//
//   - `byRouteCode`   → claves como "201", "201-AU", "L1" (route.code en el
//                       visor — `route_short_name` del GTFS oficial DTPR, o
//                       L1/L2 de Biotrén). Se comparan sin espacios, guiones
//                       ni ceros a la izquierda (`routeCodeKey`), así que
//                       "201 AU" y "201-AU" son la misma clave.
//   - `byCorridorId`  → claves arbitrarias (slug-style) para corredores
//                       interurbanos que no están en el GTFS oficial
//                       (ver `src/data/interurban-corridors.ts`).
//   - `byTerminalId`  → IDs del dataset `terminals.generated.ts`
//                       (ej.: `osm-way-135488014` = Estación Intermodal
//                       Concepción). Útil cuando un terminal es nodo de
//                       servicios documentados en el wiki.
//
// Convención para agregar
// -----------------------
// 1. Crear o identificar el artículo en `src/wiki/articles/`.
// 2. Agregar una entrada acá. Si no existe el slug, el visor lo ignora.
// 3. Si la entidad no aparece en `routes.ts`/`terminals.generated.ts`/etc.
//    (caso típico: corredor interurbano), agregarla a
//    `src/data/interurban-corridors.ts` con su anchor sourced de OSM.
//
// Futuro
// ------
// Cuando los artículos crezcan en número, este índice puede derivarse
// automáticamente de un campo `mapLinks` en `articles.ts`. Por ahora,
// edición manual es más simple y evita conflictos con el agente que
// escribe contenido en paralelo.

import { routeCodeKey } from '../lib/route-labels.ts';

const MAP_WIKI_LINKS = {
  byRouteCode: {
    // Biotrén (OSM + EFE). Ambas líneas comparten el artículo operativo.
    L1: 'biotren',
    L2: 'biotren',
    // Interurbanos que la DTPR publica en el mismo GTFS oficial que la red
    // urbana: la ficha del recorrido muestra "Ver en el wiki →" para ellos.
    '201': 'ruta-201-santa-juana',
    '201-AU': 'ruta-201-santa-juana',
    // Perímetro de Exclusión de Tomé (op. 2022): todos al artículo del
    // corredor Concepción ↔ Tomé.
    '401': 'concepcion-tome',
    '401Y': 'concepcion-tome',
    '411': 'concepcion-tome',
    '421': 'concepcion-tome',
    // Lota ↔ Concepción por la Ruta 160.
    '302': 'concepcion-coronel-lota',
    '304': 'concepcion-coronel-lota',
  } as Record<string, string>,

  // Corredores interurbanos sin GTFS (pins en interurban-corridors.ts):
  // Florida y Yumbel.
  byCorridorId: {
    'concepcion-florida': 'concepcion-florida',
    'concepcion-yumbel': 'concepcion-yumbel',
  } as Record<string, string>,

  byTerminalId: {
    // Estación Intermodal Concepción: cabecera de interurbanos documentados.
    'osm-way-135488014': 'recorridos-interurbanos',
    // Terminales urbanos usados por Florida / Yumbel (y el índice general).
    // Camilo Henríquez (way 114474600) salió del dataset: OSM lo marcó como
    // recinto en obra el 31-may-2026, así que ya no es terminal operativo.
    'osm-way-597586612': 'recorridos-interurbanos', // Collao
    // Eje sur: Intermodal Coronel + operadores del corredor Coronel-Lota.
    'osm-node-6718688807': 'concepcion-coronel-lota', // Intermodal Coronel
    'osm-way-464462966': 'concepcion-coronel-lota', // Las Galaxias
    'osm-way-423901976': 'concepcion-coronel-lota', // Jota Ewert
    // Cabecera Concepción del PE Tomé.
    'osm-way-425356582': 'concepcion-tome', // Terminal de líneas a Tomé
  } as Record<string, string>,
} as const;

/** Expuesto para tests y el validador de MapLinks (no mutar). */
export const MAP_WIKI_LINK_INDEX = MAP_WIKI_LINKS;

const SLUG_BY_ROUTE_CODE_KEY = new Map(
  Object.entries(MAP_WIKI_LINKS.byRouteCode).map(([code, slug]) => [routeCodeKey(code), slug]),
);

/** Devuelve el slug del artículo wiki para un código de ruta (ej. "201", "201 AU"). */
export function findWikiSlugForRouteCode(code: string): string | null {
  return SLUG_BY_ROUTE_CODE_KEY.get(routeCodeKey(code)) ?? null;
}

/** Devuelve el slug del artículo wiki para un corredor interurbano. */
export function findWikiSlugForCorridor(corridorId: string): string | null {
  return MAP_WIKI_LINKS.byCorridorId[corridorId] ?? null;
}

/** Devuelve el slug del artículo wiki para un terminal del dataset OSM. */
export function findWikiSlugForTerminal(terminalId: string): string | null {
  return MAP_WIKI_LINKS.byTerminalId[terminalId] ?? null;
}

/** Construye la URL pública del artículo. */
export function wikiUrl(slug: string): string {
  return `/wiki/${slug}`;
}

/**
 * Construye una URL del visor que abre el mapa enfocado en una entidad.
 * El parámetro `focus=<kind>:<id>` lo lee `src/hooks/use-url-state.ts`
 * en el primer render del visor.
 */
export function mapFocusUrl(
  kind: 'route' | 'corridor' | 'terminal' | 'stop' | 'poi',
  id: string,
): string {
  return `/?focus=${kind}:${encodeURIComponent(id)}`;
}
