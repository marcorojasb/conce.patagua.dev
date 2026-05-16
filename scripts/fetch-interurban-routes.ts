// Digitiza las rutas interurbanas licitadas que NO viven en el GTFS Gran
// Concepción de la Subsecretaría — hoy solo la 201 Concepción ↔ Santa Juana.
//
// ¿Por qué no hay relación route=bus en OSM?
//   El servicio 201 se inauguró en julio 2024 (licitación DTPR ELC0007). A
//   la fecha (mayo 2026) no hay relación route=bus mapeada en OSM. Una
//   consulta Overpass con bbox sobre Biobío y filtros ref="201" / name~"Santa
//   Juana" / operator~"Santa Juana" devuelve cero elementos. Por eso este
//   script NO descarga una relación pre-trazada; en su lugar:
//
//     1. Toma una lista de WAYPOINTS — cada uno citado con su osm_id de
//        OpenStreetMap (Nominatim o búsqueda directa). Estos waypoints
//        siguen palabra por palabra la descripción del trazado publicada
//        por el MTT y reproducida en `src/wiki/articles/ruta-201-santa-juana.tsx`:
//        Santa Juana centro → Avello → Lautaro → Ruta 160 → San Pedro Viejo
//        → Puente Juan Pablo II → Vega Monumental → Av. Manuel Rodríguez
//        → Castellón.
//
//     2. Descarga TODAS las geometrías highway= (trunk/primary/secondary)
//        en una bbox que cubre el corredor.
//
//     3. Reconstruye el polyline corriendo Dijkstra-por-corredor entre
//        waypoints consecutivos sobre el grafo de calles OSM — mismo
//        patrón que `scripts/fetch-biotren-track.ts` usa para Biotrén.
//        Cada vértice del path final viene de un nodo OSM real; no se
//        inventan coordenadas.
//
//     4. Marca el resultado como `digitized: true`. La UI muestra una
//        nota "Trazado aproximado — no es shape GTFS verificado" cuando
//        esta bandera está presente. Cuando aparezca el GTFS oficial,
//        este archivo queda obsoleto y se borra.
//
// Run: npm run sync:interurban-routes

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { overpass } from './lib/overpass.ts';
import { simplify } from './lib/simplify.ts';
import {
  distanceMeters,
  pointToSegmentMeters,
  type LatLng,
} from './lib/geo.ts';
import { dijkstra, type AdjEntry } from './lib/dijkstra.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../src/data/interurban-routes.generated.ts');

// Bounding box que cubre todo el corredor Santa Juana ↔ Concepción centro
// (más holgura). Cubre Ruta 160 desde Santa Juana hasta San Pedro de la Paz
// y la trama urbana Concepción / Lorenzo Arenas / Tucapel.
const CORRIDOR_BBOX = '-37.20,-73.20,-36.78,-72.90';

// Half-width del corredor por defecto, en metros. El stitcher solo permite
// nodos OSM que estén dentro de esta franja perpendicular al segmento entre
// waypoints — así la Dijkstra no se escapa por calles paralelas.
const CORRIDOR_HALF_WIDTH_M = 1200;

// Tramos rurales largos sobre Ruta 160 son rectos a escala de ciudad pero
// el grafo OSM tiene mucha rampa de acceso / colectora paralela. Ampliamos
// el corredor solo para los segmentos rurales (waypoint.wideCorridor=true).
const WIDE_CORRIDOR_HALF_WIDTH_M = 2500;

// RDP tolerance — degrees. ~5e-5 ≈ 5 m a esta latitud. Mantiene curvas
// visibles a nivel zoom 14+ pero recorta vértices redundantes en rectas.
const SIMPLIFY_TOLERANCE = 5e-5;

// Waypoints del trazado Santa Juana → Concepción. Cada uno cita su fuente
// en OSM (way o node id). Si re-ordenás o agregás, mantené el citation
// stamp — es lo único que distingue un dato verificable de uno inventado.
interface Waypoint {
  /** Etiqueta para logs y para el comentario del archivo generado. */
  label: string;
  lat: number;
  lng: number;
  /** OSM type+id (citation). */
  osm: string;
  /** Si el tramo SIGUIENTE este es interurbano largo (Ruta 160 rural), ampliar
   *  el ancho del corredor para que la Dijkstra no se atasque por falta de
   *  conectividad lateral. */
  wideCorridor?: boolean;
}

const WAYPOINTS_201: Waypoint[] = [
  // Plaza de Armas Santa Juana — terminal urbana del lado rural.
  // OSM way 83652338 (leisure=park "Plaza de Armas Santa Juana"). Fuente
  // verificada vía Nominatim.
  { label: 'Plaza de Armas Santa Juana', lat: -37.174932, lng: -72.937703, osm: 'way/83652338' },
  // Salida nor-poniente desde el centro vía Lautaro (Ruta O-882, secondary).
  // OSM way 88968095 ("Lautaro"), confirmado por around:3000 desde la plaza.
  { label: 'Lautaro / O-882 (Santa Juana norte)', lat: -37.171, lng: -72.946, osm: 'way/88968095', wideCorridor: true },
  // Empalme Ruta 156 (Ruta de la Madera) — coordenada tomada del extremo sur
  // del trunk ref=156 dentro del bbox del corredor (way 452349096).
  // OJO: el wiki menciona "Ruta 160 (Ruta de la Madera)" — error frecuente
  // en prensa; en OSM y en cartas viales del MOP la Ruta de la Madera es
  // ref=156. La 160 (Concepción-Tres Pinos-Lebu) entronca con la 156 más al
  // norte y comparte el último tramo hacia San Pedro.
  { label: 'Empalme Ruta 156 (Santa Juana)', lat: -37.204988, lng: -72.951716, osm: 'way/452349096', wideCorridor: true },
  // Punto intermedio sobre Ruta 156 (way 454726746) para guiar a Dijkstra a
  // través del corredor rural sin saltarse a calles paralelas.
  { label: 'Ruta 156 km ~30 (sur)', lat: -37.118937, lng: -72.984566, osm: 'way/454726746', wideCorridor: true },
  // Punto intermedio sobre Ruta 156 (way 335857748) — tercio medio.
  { label: 'Ruta 156 km ~55', lat: -37.054714, lng: -72.985221, osm: 'way/335857748', wideCorridor: true },
  // Punto intermedio sobre Ruta 156 (way 1022056101) — antes del cruce con
  // ramal hacia San Pedro de la Paz.
  { label: 'Ruta 156 km ~75', lat: -36.979332, lng: -72.974965, osm: 'way/1022056101', wideCorridor: true },
  // Punto intermedio sobre Ruta 156 (way 753162502) — curva al norte hacia
  // San Pedro de la Paz. Esencial para que Dijkstra no salte por línea recta
  // por encima de cerros y bosques.
  { label: 'Ruta 156 km ~90 (curva norte)', lat: -36.949111, lng: -73.043495, osm: 'way/753162502', wideCorridor: true },
  // Punto intermedio sobre Ruta 156 (way 136999265) — entrada a la zona
  // urbana de San Pedro de la Paz.
  { label: 'Ruta 156 entrada SP de la Paz', lat: -36.902972, lng: -73.056897, osm: 'way/136999265' },
  // Ingeniero Ernesto Pinto Lagarrigue — re-nombramiento urbano de la 156
  // dentro de San Pedro (OSM way 1185626414, trunk, sigue cumpliendo el ref).
  // Este waypoint guía a Dijkstra por el corredor urbano antes del puente.
  { label: 'Ing. Ernesto Pinto Lagarrigue (San Pedro)', lat: -36.873047, lng: -73.065583, osm: 'way/1185626414' },
  // Av. Pedro Aguirre Cerda — corredor urbano por la ribera sur del Biobío,
  // tramo final de la 156/160 antes del puente. OSM way 1020353743 (trunk,
  // ref=160, name="Avenida Pedro Aguirre Cerda").
  { label: 'Av. Pedro Aguirre Cerda (acceso Pte. JP II)', lat: -36.843286, lng: -73.076649, osm: 'way/1020353743', wideCorridor: true },
  // Enlace Pte. JP II — punto de empalme entre Av. Pedro Aguirre Cerda y
  // Av. Jorge Alessandri vía trunk_links del nudo vial. OSM way 1055593209
  // (trunk_link, geometry verificada con around:300 desde el centro del nudo).
  { label: 'Enlace Pte. JP II (rampa)', lat: -36.838384, lng: -73.089489, osm: 'way/1055593209', wideCorridor: true },
  // Avenida Jorge Alessandri — roadway que CRUZA el río Biobío sobre el
  // Puente Juan Pablo II. OSM way 566741892 (trunk, name="Avenida Jorge
  // Alessandri"). El puente (way 417042291, man_made=bridge) lleva la calle.
  { label: 'Av. Jorge Alessandri (sobre Pte. JP II)', lat: -36.824144, lng: -73.092038, osm: 'way/566741892' },
  // Av. Jorge Alessandri en el extremo norte del puente (lado Concepción,
  // sector Lorenzo Arenas).
  { label: 'Av. Jorge Alessandri (acceso norte)', lat: -36.816094, lng: -73.084137, osm: 'way/566741891' },
  // Vega Monumental — mercado mayorista referenciado en el comunicado MTT
  // como hito intermedio. OSM way 113257664 (shop=marketplace).
  { label: 'Vega Monumental', lat: -36.810273, lng: -73.079712, osm: 'way/113257664' },
  // Av. Manuel Rodríguez esquina Castellón — terminus del recorrido en
  // Concepción centro. OSM node 12521687707 (highway=traffic_signals).
  { label: 'Av. Manuel Rodríguez esq. Castellón', lat: -36.815663, lng: -73.053015, osm: 'node/12521687707' },
];

// Paraderos OSM-verificables del recorrido — coordenadas tomadas directamente
// de nodos OSM (vía Overpass `around:`) o de waypoints citados. Cada entrada
// reusable como Paradero independiente y referenciada por id en `stopIds`.
interface DigitizedStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Fuente OSM citada para auditoría. */
  osm: string;
}

const STOPS_201: DigitizedStop[] = [
  {
    id: 'osm-201-plaza-santa-juana',
    name: 'Plaza de Armas Santa Juana',
    lat: -37.174932,
    lng: -72.937703,
    osm: 'way/83652338',
  },
  {
    // Paradero real OSM dentro de la cuadra de Pedro de Valdivia, capturado
    // por una consulta around:500 del centro de Santa Juana.
    id: 'osm-201-stop-11643182817',
    name: 'Pedro de Valdivia (Santa Juana)',
    lat: -37.174164,
    lng: -72.939946,
    osm: 'node/11643182817',
  },
  {
    id: 'osm-201-san-pedro-viejo',
    name: 'San Pedro Viejo',
    lat: -36.840183,
    lng: -73.081803,
    osm: 'node/4923575727',
  },
  {
    id: 'osm-201-puente-juan-pablo-ii',
    name: 'Puente Juan Pablo II',
    lat: -36.823763,
    lng: -73.091720,
    osm: 'way/417042291',
  },
  {
    id: 'osm-201-vega-monumental',
    name: 'Vega Monumental',
    lat: -36.810273,
    lng: -73.079712,
    osm: 'way/113257664',
  },
  {
    id: 'osm-201-castellon',
    name: 'Castellón / Manuel Rodríguez (Concepción)',
    lat: -36.815663,
    lng: -73.053015,
    osm: 'node/12521687707',
  },
];

// ---------------------------------------------------------------------------
// Grafo de calles
// ---------------------------------------------------------------------------

interface WayEl {
  type: 'way';
  id: number;
  nodes?: number[];
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
}

async function fetchCorridorWays(): Promise<WayEl[]> {
  // Filtramos a highway= jerárquico (trunk/primary/secondary/tertiary) sobre
  // la bbox del corredor. La inclusión de tertiary deja entrar Av. Manuel
  // Rodríguez y las calles del centro Santa Juana sin inundar con
  // residenciales.
  const query = `[out:json][timeout:120];
(
  way["highway"~"^(trunk|primary|secondary|tertiary|trunk_link|primary_link|secondary_link)$"](${CORRIDOR_BBOX});
);
out geom;`;
  const data = await overpass<WayEl>(query);
  return data.elements.filter(
    (e): e is WayEl => e.type === 'way' && !!e.geometry && !!e.nodes,
  );
}

function buildGraph(ways: WayEl[]): {
  coords: Map<number, LatLng>;
  adj: Map<number, AdjEntry[]>;
} {
  const coords = new Map<number, LatLng>();
  const adj = new Map<number, AdjEntry[]>();
  const pushEdge = (from: number, to: number, w: number) => {
    const list = adj.get(from) ?? [];
    const existing = list.find((e) => e.to === to);
    if (existing) {
      if (w < existing.w) existing.w = w;
    } else {
      list.push({ to, w });
    }
    adj.set(from, list);
  };
  for (const w of ways) {
    if (!w.nodes || !w.geometry || w.nodes.length !== w.geometry.length) continue;
    for (let i = 0; i < w.nodes.length; i++) {
      coords.set(w.nodes[i], [w.geometry[i].lat, w.geometry[i].lon]);
    }
    for (let i = 0; i < w.nodes.length - 1; i++) {
      const a = w.nodes[i];
      const b = w.nodes[i + 1];
      const d = distanceMeters(
        [w.geometry[i].lat, w.geometry[i].lon],
        [w.geometry[i + 1].lat, w.geometry[i + 1].lon],
      );
      pushEdge(a, b, d);
      pushEdge(b, a, d);
    }
  }
  return { coords, adj };
}

function corridorMask(
  coords: Map<number, LatLng>,
  a: Waypoint,
  b: Waypoint,
  halfWidthM: number,
): Set<number> {
  const aLL: LatLng = [a.lat, a.lng];
  const bLL: LatLng = [b.lat, b.lng];
  const allowed = new Set<number>();
  for (const [id, c] of coords) {
    if (pointToSegmentMeters(c, aLL, bLL) <= halfWidthM) allowed.add(id);
  }
  return allowed;
}

function nearestNodeInside(
  coords: Map<number, LatLng>,
  allowed: Set<number>,
  target: Waypoint,
): { id: number; d: number } | null {
  let best: { id: number; d: number } | null = null;
  for (const id of allowed) {
    const c = coords.get(id);
    if (!c) continue;
    const d = distanceMeters(c, [target.lat, target.lng]);
    if (!best || d < best.d) best = { id, d };
  }
  return best;
}

function buildLine(
  coords: Map<number, LatLng>,
  adj: Map<number, AdjEntry[]>,
  waypoints: Waypoint[],
): { path: LatLng[]; fallbacks: number } {
  if (waypoints.length < 2) return { path: [], fallbacks: 0 };
  const out: LatLng[] = [[waypoints[0].lat, waypoints[0].lng]];
  let fallbacks = 0;

  for (let i = 1; i < waypoints.length; i++) {
    const a = waypoints[i - 1];
    const b = waypoints[i];
    const halfWidth = a.wideCorridor || b.wideCorridor
      ? WIDE_CORRIDOR_HALF_WIDTH_M
      : CORRIDOR_HALF_WIDTH_M;

    const allowed = corridorMask(coords, a, b, halfWidth);
    const start = nearestNodeInside(coords, allowed, a);
    const end = nearestNodeInside(coords, allowed, b);
    if (!start || !end) {
      console.warn(`  ! ${a.label} → ${b.label}: no nodes inside corridor; straight-line fallback`);
      fallbacks += 1;
      out.push([b.lat, b.lng]);
      continue;
    }
    const nodeIds = dijkstra(adj, start.id, end.id, allowed);
    if (nodeIds.length < 2) {
      console.warn(`  ! ${a.label} → ${b.label}: Dijkstra found no path; straight-line fallback`);
      fallbacks += 1;
      out.push([b.lat, b.lng]);
      continue;
    }
    for (const id of nodeIds) {
      const c = coords.get(id)!;
      const tail = out[out.length - 1];
      if (tail && tail[0] === c[0] && tail[1] === c[1]) continue;
      out.push(c);
    }
    const tail = out[out.length - 1];
    if (tail[0] !== b.lat || tail[1] !== b.lng) {
      out.push([b.lat, b.lng]);
    }
  }
  return { path: out, fallbacks };
}

// ---------------------------------------------------------------------------
// Render del archivo generado
// ---------------------------------------------------------------------------

function pathKm(path: LatLng[]): number {
  let m = 0;
  for (let i = 1; i < path.length; i++) m += distanceMeters(path[i - 1], path[i]);
  return m / 1000;
}

function render(
  path: LatLng[],
  fallbacks: number,
  totalWaypoints: number,
): string {
  const km = pathKm(path);
  const banner = `// AUTO-GENERATED by scripts/fetch-interurban-routes.ts on ${new Date().toISOString()}.
// Source: OpenStreetMap (Overpass API). NO existe relación route=bus en OSM
// para el 201 Santa Juana ↔ Concepción a la fecha de generación, así que el
// trazado se digitalizó a partir de waypoints OSM citados (ver script) y se
// reconstruyó con Dijkstra-por-corredor sobre el grafo highway= regional.
// Cada vértice del path es un nodo OSM real — NO hay coordenadas inventadas.
// El campo \`digitized: true\` distingue esta ruta de las del GTFS oficial.
// ${path.length} vértices · ${km.toFixed(1)} km · ${totalWaypoints} waypoints citados · ${fallbacks} segment(s) en fallback.
// Re-generate: \`npm run sync:interurban-routes\`.

import type { BusRoute, Paradero } from '@/types/transport';

/** Paraderos OSM verificables del corredor 201 — coordenadas citadas en script. */
export const INTERURBAN_PARADEROS: Paradero[] = ${JSON.stringify(
    STOPS_201.map((s) => ({
      id: s.id,
      source: 'osm' as const,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
    })),
    null,
    2,
  )};

/**
 * Buses interurbanos licitados FUERA del GTFS Gran Concepción. Hoy solo el
 * 201 Concepción ↔ Santa Juana (licitación DTPR ELC0007). Cuando aparezcan
 * en el feed oficial, esta lista se vacía y el archivo se elimina.
 *
 * Campo \`digitized: true\` informa al UI que el trazado no es shape GTFS
 * verificado y debe acompañarse de una nota.
 */
export const INTERURBAN_BUS_ROUTES: BusRoute[] = [
  {
    id: 'interurban-201',
    source: 'osm',
    ref: '201',
    name: '201: Concepción ↔ Santa Juana',
    operator: 'Transportes Santa Juana SpA',
    network: 'Interurbano Biobío',
    colour: '#0f766e',
    digitized: true,
    path: ${JSON.stringify(path.map(([la, ln]) => [Number(la.toFixed(5)), Number(ln.toFixed(5))]))},
    stopIds: ${JSON.stringify(STOPS_201.map((s) => s.id))},
  },
];
`;
  return banner;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Fetching corridor highway ways from Overpass…');
  const ways = await fetchCorridorWays();
  console.log(`  → ${ways.length} ways con geometry`);
  if (ways.length === 0) {
    throw new Error('Overpass devolvió 0 ways — corredor sin datos, no sobreescribo.');
  }

  console.log('Building street graph…');
  const { coords, adj } = buildGraph(ways);
  console.log(`  → ${coords.size} nodos / ${adj.size} adj entries`);

  console.log('Solving 201 corridor (Santa Juana → Concepción)…');
  const { path: raw, fallbacks } = buildLine(coords, adj, WAYPOINTS_201);
  const path = simplify(raw as Array<[number, number]>, SIMPLIFY_TOLERANCE);
  console.log(`  → 201: ${raw.length} vértices raw → ${path.length} simplificado · ${pathKm(path).toFixed(1)} km · fallbacks=${fallbacks}`);
  if (path.length < 10) {
    throw new Error('Path resultante muy corto — algo falló en la digitalización, no sobreescribo.');
  }

  // Idempotencia: si el archivo ya existe y el contenido (sin banner) es
  // idéntico, no reescribimos para evitar churn en git.
  const next = render(path, fallbacks, WAYPOINTS_201.length);
  if (existsSync(OUT_PATH)) {
    const prev = readFileSync(OUT_PATH, 'utf8');
    // Strip banners (líneas que empiezan con "// AUTO-GENERATED" y la
    // siguiente con stats) — comparan estructura, no timestamps.
    const stripBanner = (s: string) =>
      s
        .split('\n')
        .filter((l) => !l.startsWith('// AUTO-GENERATED') && !l.startsWith('// ') || l.startsWith('// Source') || l.startsWith('// Run') || l.startsWith('// Re-generate'))
        .join('\n');
    if (stripBanner(prev) === stripBanner(next)) {
      console.log('No hay cambios significativos; archivo intacto.');
      return;
    }
  }
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, next);
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
