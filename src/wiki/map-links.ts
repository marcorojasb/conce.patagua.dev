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
//   - `byRouteCode`   → claves como "201", "L1", "10A" (route.code en el
//                       visor — proviene de GTFS routes.txt `route_short_name`
//                       o de la relación OSM). Útil para enlazar artículos
//                       de un recorrido específico desde la sheet del mapa.
//   - `byCorridorId`  → claves arbitrarias (slug-style) para corredores
//                       interurbanos que no tienen route en el GTFS urbano
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

export const MAP_WIKI_LINKS = {
  byRouteCode: {
    // Servicios licitados con artículo dedicado. El código "201" se enchufa
    // contra la ruta nativa interurbana servida desde
    // `src/data/interurban-routes.generated.ts` (trazado digitalizado desde
    // OSM, paraderos OSM citados). El visor lo trata como cualquier urbano
    // y muestra el botón "Ver en el wiki →" porque hay match en este mapa.
    '201': 'ruta-201-santa-juana',
    '201 AU': 'ruta-201-santa-juana',
  } as Record<string, string>,

  // Los corredores interurbanos sin trazado verificable conservan su lugar
  // (cuando aparezcan Florida / Yumbel, se mapean acá). Hoy el mapa está
  // vacío porque el único corredor previamente listado (201 Santa Juana)
  // migró a ruta nativa del visor.
  byCorridorId: {} as Record<string, string>,

  byTerminalId: {
    // Estación Intermodal Concepción es punto de salida de servicios
    // interurbanos documentados (201 a Santa Juana, futuros). Linkeamos
    // al índice general — el usuario navega desde ahí al recorrido
    // específico.
    'osm-way-135488014': 'recorridos-interurbanos',
  } as Record<string, string>,
} as const;

/** Devuelve el slug del artículo wiki para un código de ruta (ej. "201"). */
export function findWikiSlugForRouteCode(code: string): string | null {
  return MAP_WIKI_LINKS.byRouteCode[code] ?? null;
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
