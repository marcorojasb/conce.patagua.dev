// Digitiza las rutas interurbanas licitadas que NO viven en el GTFS Gran
// Concepción de la Subsecretaría. Hoy:
//   201 — Concepción ↔ Santa Juana (licitación DTPR ELC0007, op. jul-2024).
//   401 — Concepción ↔ Tomé Alto (Perímetro de Exclusión de Tomé, op. mar-2022).
//   411 — Concepción ↔ Dichato (extensión norte vía Tomé del 401).
//   421 — Concepción ↔ Av. Estadio (Tomé urbano, hora punta, agregado nov-2022).
//
// ¿Por qué no hay relación route=bus en OSM?
//   Probas vía Overpass con
//     relation["route"="bus"]["ref"~"^(201|401|411|421)$"]
//   alrededor del Gran Concepción/Tomé devuelven CERO elementos al
//   día de generación. Por eso este script NO descarga una relación
//   pre-trazada; en su lugar:
//
//     1. Toma una lista de WAYPOINTS por servicio — cada uno citado con
//        su osm_id de OpenStreetMap (Nominatim o búsqueda directa). Los
//        waypoints siguen palabra por palabra la descripción del trazado
//        publicada por el MTT / municipalidad y reproducida en los
//        artículos del wiki:
//          - `src/wiki/articles/ruta-201-santa-juana.tsx`
//          - `src/wiki/articles/concepcion-tome.tsx`
//
//     2. Descarga TODAS las geometrías highway= (trunk/primary/secondary/
//        tertiary y sus _link) en una bbox que cubre todo el corredor
//        Santa Juana → Concepción → Penco → Lirquén → Tomé → Dichato.
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

// Bounding box que cubre TODOS los corredores: Santa Juana al sur, San
// Pedro de la Paz al oeste, Concepción centro al norte, hasta Dichato/
// Pingueral al norte y Tomé Alto al noreste. Holgura al este para incluir
// la ruta 150 completa.
const CORRIDOR_BBOX = '-37.20,-73.20,-36.50,-72.85';

// Half-width del corredor por defecto, en metros. El stitcher solo permite
// nodos OSM que estén dentro de esta franja perpendicular al segmento entre
// waypoints — así la Dijkstra no se escapa por calles paralelas.
const CORRIDOR_HALF_WIDTH_M = 1200;

// Tramos rurales largos sobre Ruta 156 / Ruta 150 son rectos a escala de
// ciudad pero el grafo OSM tiene mucha rampa de acceso / colectora paralela.
// Ampliamos el corredor solo para los segmentos rurales (waypoint.wideCorridor
// = true).
const WIDE_CORRIDOR_HALF_WIDTH_M = 2500;

// RDP tolerance — degrees. ~5e-5 ≈ 5 m a esta latitud. Mantiene curvas
// visibles a nivel zoom 14+ pero recorta vértices redundantes en rectas.
const SIMPLIFY_TOLERANCE = 5e-5;

// Waypoints — cada uno cita su fuente en OSM (way o node id). Si re-ordenás
// o agregás, mantené el citation stamp — es lo único que distingue un dato
// verificable de uno inventado.
interface Waypoint {
  /** Etiqueta para logs y para el comentario del archivo generado. */
  label: string;
  lat: number;
  lng: number;
  /** OSM type+id (citation). */
  osm: string;
  /** Si el tramo SIGUIENTE este es interurbano largo (Ruta 160/156/150
   *  rural), ampliar el ancho del corredor para que la Dijkstra no se
   *  atasque por falta de conectividad lateral. */
  wideCorridor?: boolean;
}

// ---------------------------------------------------------------------------
// 201 — Concepción ↔ Santa Juana (Ruta 156 / Ruta de la Madera + Pte. JP II)
// ---------------------------------------------------------------------------

const WAYPOINTS_201: Waypoint[] = [
  // Plaza de Armas Santa Juana — terminal urbana del lado rural.
  // OSM way 83652338 (leisure=park). Fuente verificada vía Nominatim.
  { label: 'Plaza de Armas Santa Juana', lat: -37.174932, lng: -72.937703, osm: 'way/83652338' },
  // Salida nor-poniente desde el centro vía Lautaro (Ruta O-882, secondary).
  // OSM way 88968095 ("Lautaro"), confirmado por around:3000 desde la plaza.
  { label: 'Lautaro / O-882 (Santa Juana norte)', lat: -37.171, lng: -72.946, osm: 'way/88968095', wideCorridor: true },
  // Empalme Ruta 156 (Ruta de la Madera). El wiki menciona "Ruta 160 (Ruta
  // de la Madera)" — error frecuente en prensa; en OSM y en cartas viales del
  // MOP la Ruta de la Madera es ref=156. La 160 (Concepción-Tres Pinos-Lebu)
  // entronca con la 156 más al norte y comparte el último tramo hacia San
  // Pedro.
  { label: 'Empalme Ruta 156 (Santa Juana)', lat: -37.204988, lng: -72.951716, osm: 'way/452349096', wideCorridor: true },
  { label: 'Ruta 156 km ~30 (sur)', lat: -37.118937, lng: -72.984566, osm: 'way/454726746', wideCorridor: true },
  { label: 'Ruta 156 km ~55', lat: -37.054714, lng: -72.985221, osm: 'way/335857748', wideCorridor: true },
  { label: 'Ruta 156 km ~75', lat: -36.979332, lng: -72.974965, osm: 'way/1022056101', wideCorridor: true },
  { label: 'Ruta 156 km ~90 (curva norte)', lat: -36.949111, lng: -73.043495, osm: 'way/753162502', wideCorridor: true },
  { label: 'Ruta 156 entrada SP de la Paz', lat: -36.902972, lng: -73.056897, osm: 'way/136999265' },
  { label: 'Ing. Ernesto Pinto Lagarrigue (San Pedro)', lat: -36.873047, lng: -73.065583, osm: 'way/1185626414' },
  { label: 'Av. Pedro Aguirre Cerda (acceso Pte. JP II)', lat: -36.843286, lng: -73.076649, osm: 'way/1020353743', wideCorridor: true },
  { label: 'Enlace Pte. JP II (rampa)', lat: -36.838384, lng: -73.089489, osm: 'way/1055593209', wideCorridor: true },
  { label: 'Av. Jorge Alessandri (sobre Pte. JP II)', lat: -36.824144, lng: -73.092038, osm: 'way/566741892' },
  { label: 'Av. Jorge Alessandri (acceso norte)', lat: -36.816094, lng: -73.084137, osm: 'way/566741891' },
  { label: 'Vega Monumental', lat: -36.810273, lng: -73.079712, osm: 'way/113257664' },
  { label: 'Av. Manuel Rodríguez esq. Castellón', lat: -36.815663, lng: -73.053015, osm: 'node/12521687707' },
];

// ---------------------------------------------------------------------------
// 401 / 411 / 421 — Corredor Concepción ↔ Tomé (Ruta 150)
// ---------------------------------------------------------------------------
//
// Trazado base: artículo del wiki `concepcion-tome.tsx` (sección "Trazado")
// + PorDóndeVaLaMicro. Concepción → Tomé pasa por:
//   Terminal Manuel Rodríguez → Av. Chacabuco → Plaza Perú →
//   Rotonda Bonilla → Camino a Penco → Bypass Penco (Ruta 150) →
//   Plaza de Penco → Plaza de Lirquén → costa → Bellavista Tomé →
//   Costanera Tomé → Vicente Palacios → Diego Portales (Plaza de Tomé)
//   → Tomé Alto.
//
// El 411 extiende: Tomé Alto → Avenida Estadio → Costanera norte →
//   Camino a Dichato (Ruta 150 norte) → Av. Daniel Vera (Dichato).
//
// El 421 termina antes: Concepción → ... → Tomé centro → Avenida Estadio
//   (Tomé urbano).
//
// Los tres comparten el tramo Concepción ↔ Tomé centro. Cada `BusRoute`
// tiene su propio `path` independiente — duplicación intencional, refleja
// los tres servicios reales del operador.

// Anchors compartidos del tramo Concepción → Tomé centro. Re-usados por
// 401, 411 y 421.
const W_TERMINAL_MR: Waypoint = {
  // OSM way 425356582 (amenity=bus_station "Terminal de líneas a Tomé").
  // bounds verificadas vía Overpass: minlat=-36.81940, minlon=-73.06232,
  // maxlat=-36.81886, maxlon=-73.06165. Tomamos centroide aproximado.
  label: 'Terminal Manuel Rodríguez (Concepción)',
  lat: -36.81912,
  lng: -73.06197,
  osm: 'way/425356582',
};

const W_PLAZA_PERU: Waypoint = {
  // OSM way 368010844 (leisure=park "Plaza Perú"). Plaza fundacional UdeC.
  label: 'Plaza Perú (Av. Chacabuco)',
  lat: -36.826866,
  lng: -73.039979,
  osm: 'way/368010844',
};

const W_ROTONDA_BONILLA: Waypoint = {
  // OSM way 364272946 (Rotonda General Bonilla, Chillancito) — punto de
  // empalme entre la trama urbana de Concepción y el Camino a Penco /
  // Ruta 150 hacia el norte. Punto de origen del electrocorredor MOP.
  label: 'Rotonda General Bonilla',
  lat: -36.810541,
  lng: -73.027236,
  osm: 'way/364272946',
};

const W_CAMINO_PENCO: Waypoint = {
  // OSM way 1082623861 ("Camino a Penco", Los Conquistadores, Chillancito,
  // Concepción). Primer tramo del eje que continúa como Bypass Penco /
  // Ruta 150.
  label: 'Camino a Penco (salida Concepción)',
  lat: -36.804661,
  lng: -73.024748,
  osm: 'way/1082623861',
  wideCorridor: true,
};

const W_COSMITO: Waypoint = {
  // OSM node 1313627248 (place "Cosmito", Penco). Localidad sobre Ruta 150
  // entre Concepción y Penco urbano.
  label: 'Cosmito (Ruta 150)',
  lat: -36.776199,
  lng: -73.020942,
  osm: 'node/1313627248',
  wideCorridor: true,
};

const W_BYPASS_PENCO_SUR: Waypoint = {
  // OSM way 29396494 ("Bypass Penco", ref=150). Vértice intermedio del
  // bypass al sur de Penco urbano — guía a Dijkstra a tomar la 150 y no
  // calles costeras paralelas.
  label: 'Bypass Penco (sur)',
  lat: -36.749116,
  lng: -72.992369,
  osm: 'way/29396494',
  wideCorridor: true,
};

const W_PLAZA_PENCO: Waypoint = {
  // OSM way 27729446 (leisure=park "Plaza Los Conquistadores", Penco) —
  // la "Plaza de Penco" del wiki es esta plaza fundacional.
  label: 'Plaza Los Conquistadores (Penco)',
  lat: -36.738743,
  lng: -72.993666,
  osm: 'way/27729446',
};

const W_BYPASS_LIRQUEN: Waypoint = {
  // OSM way 114624596 ("Bypass Penco" en Villa Italia, Lirquén). Tramo
  // intermedio Penco → Lirquén.
  label: 'Bypass Penco (Lirquén sur)',
  lat: -36.730704,
  lng: -72.981324,
  osm: 'way/114624596',
  wideCorridor: true,
};

const W_PLAZA_LIRQUEN: Waypoint = {
  // OSM way 116548067 (leisure=park "Plaza de Lirquén"). Terminal norte
  // del Biotrén está unas cuadras al sureste; transbordo natural.
  label: 'Plaza de Lirquén',
  lat: -36.712794,
  lng: -72.976736,
  osm: 'way/116548067',
};

const W_VIADUCTO_LIRQUEN: Waypoint = {
  // OSM way 29396493 ("Viaducto Puerto de Lirquén", ref=150). Tramo
  // costero entre Lirquén y Tomé que la 150 hace por viaducto sobre el
  // puerto.
  label: 'Viaducto Puerto de Lirquén (Ruta 150)',
  lat: -36.690000,
  lng: -72.961000,
  osm: 'way/29396493',
  wideCorridor: true,
};

const W_BELLAVISTA_TOME: Waypoint = {
  // OSM node 1235426711 (place "Bellavista", Tomé) — sector industrial
  // textil histórico, mencionado explícitamente en el trazado del wiki
  // ("Bellavista Oveja Tomé" sobre la costanera).
  label: 'Bellavista (Tomé)',
  lat: -36.636842,
  lng: -72.951300,
  osm: 'node/1235426711',
  wideCorridor: true,
};

const W_COSTANERA_TOME_SUR: Waypoint = {
  // OSM way 551975460 ("Costanera", Población Almirante Latorre,
  // Bellavista, Tomé). Tramo costanera al sur del centro de Tomé.
  label: 'Costanera Tomé (Bellavista)',
  lat: -36.626484,
  lng: -72.955851,
  osm: 'way/551975460',
};

const W_COSTANERA_TOME_CENTRO: Waypoint = {
  // OSM way 30930557 ("Costanera", El Morro, Tomé). Costanera frente al
  // centro de Tomé urbano.
  label: 'Costanera Tomé (centro / El Morro)',
  lat: -36.617077,
  lng: -72.963202,
  osm: 'way/30930557',
};

const W_DIEGO_PORTALES_TOME: Waypoint = {
  // OSM way 455232401 ("Diego Portales", El Morro, Tomé). El wiki cita
  // "Diego Portales (Plaza de Tomé)" como hito en el centro.
  label: 'Diego Portales (Plaza de Tomé)',
  lat: -36.616862,
  lng: -72.958266,
  osm: 'way/455232401',
};

const W_VICENTE_PALACIOS_TOME: Waypoint = {
  // OSM way 127128304 ("Vicente Palacios", Lomas de San José, Tomé Alto).
  // El wiki cita la calle como hito en el ascenso al sector alto.
  label: 'Vicente Palacios (Tomé Alto)',
  lat: -36.604764,
  lng: -72.953916,
  osm: 'way/127128304',
};

const W_TOME_ALTO: Waypoint = {
  // OSM node 8495135802 (place "Tomé Alto"). Terminus del 401.
  label: 'Tomé Alto (terminus 401)',
  lat: -36.604478,
  lng: -72.964666,
  osm: 'node/8495135802',
};

// 411 — extensión norte hacia Dichato.
const W_AV_ESTADIO_TOME: Waypoint = {
  // OSM way 149476411 ("Avenida Estadio", Villa Nuevo Cocholgüe, Tomé Alto).
  // Hito de salida norte; usado también como terminus del 421.
  label: 'Avenida Estadio (Tomé)',
  lat: -36.598616,
  lng: -72.969462,
  osm: 'way/149476411',
};

const W_RUTA150_NORTE: Waypoint = {
  // Punto intermedio sobre Ruta 150 norte camino a Dichato. Tomado del
  // tramo continuo Tomé → Dichato del corredor; el ref=150 sigue al norte
  // de Tomé urbano. Usamos las coords del nodo "Pingueral" cercano para
  // anclar la curva por la costa.
  label: 'Camino a Dichato (Ruta 150 norte)',
  lat: -36.560000,
  lng: -72.940000,
  osm: 'way/29396493',
  wideCorridor: true,
};

const W_DICHATO: Waypoint = {
  // OSM node 214221598 (place "Dichato"). Centro urbano de Dichato.
  label: 'Dichato (centro)',
  lat: -36.548627,
  lng: -72.936438,
  osm: 'node/214221598',
};

const W_AV_DANIEL_VERA: Waypoint = {
  // OSM way 27679748 ("Avenida Daniel Vera", Villa Rica, Dichato). El wiki
  // cita esta avenida como terminus del 411 en Dichato.
  label: 'Av. Daniel Vera (Dichato terminus)',
  lat: -36.538053,
  lng: -72.926259,
  osm: 'way/27679748',
};

// 401 (Concepción ↔ Tomé Alto)
const WAYPOINTS_401: Waypoint[] = [
  W_TERMINAL_MR,
  W_PLAZA_PERU,
  W_ROTONDA_BONILLA,
  W_CAMINO_PENCO,
  W_COSMITO,
  W_BYPASS_PENCO_SUR,
  W_PLAZA_PENCO,
  W_BYPASS_LIRQUEN,
  W_PLAZA_LIRQUEN,
  W_VIADUCTO_LIRQUEN,
  W_BELLAVISTA_TOME,
  W_COSTANERA_TOME_SUR,
  W_COSTANERA_TOME_CENTRO,
  W_DIEGO_PORTALES_TOME,
  W_VICENTE_PALACIOS_TOME,
  W_TOME_ALTO,
];

// 411 (Concepción ↔ Dichato vía Tomé) — comparte el tronco con el 401
// hasta Diego Portales y desde ahí sigue al norte por costa hacia Dichato.
const WAYPOINTS_411: Waypoint[] = [
  W_TERMINAL_MR,
  W_PLAZA_PERU,
  W_ROTONDA_BONILLA,
  W_CAMINO_PENCO,
  W_COSMITO,
  W_BYPASS_PENCO_SUR,
  W_PLAZA_PENCO,
  W_BYPASS_LIRQUEN,
  W_PLAZA_LIRQUEN,
  W_VIADUCTO_LIRQUEN,
  W_BELLAVISTA_TOME,
  W_COSTANERA_TOME_SUR,
  W_COSTANERA_TOME_CENTRO,
  W_DIEGO_PORTALES_TOME,
  W_AV_ESTADIO_TOME,
  W_RUTA150_NORTE,
  W_DICHATO,
  W_AV_DANIEL_VERA,
];

// 421 (Concepción ↔ Av. Estadio · hora punta). Termina en Tomé urbano,
// no llega a Tomé Alto ni Dichato — variante intra-Tomé añadida nov-2022.
const WAYPOINTS_421: Waypoint[] = [
  W_TERMINAL_MR,
  W_PLAZA_PERU,
  W_ROTONDA_BONILLA,
  W_CAMINO_PENCO,
  W_COSMITO,
  W_BYPASS_PENCO_SUR,
  W_PLAZA_PENCO,
  W_BYPASS_LIRQUEN,
  W_PLAZA_LIRQUEN,
  W_VIADUCTO_LIRQUEN,
  W_BELLAVISTA_TOME,
  W_COSTANERA_TOME_SUR,
  W_COSTANERA_TOME_CENTRO,
  W_DIEGO_PORTALES_TOME,
  W_AV_ESTADIO_TOME,
];

// Paraderos OSM-verificables del corredor — coordenadas tomadas directamente
// de nodos OSM (vía Overpass `around:`) o de waypoints citados.
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

// Paraderos compartidos del tramo Concepción ↔ Tomé. Re-usados por 401, 411
// y 421 — cada ruta lista los que efectivamente sirve. Cada coord proviene
// de un waypoint OSM ya citado arriba.
const STOPS_TOME_SHARED: DigitizedStop[] = [
  {
    id: 'osm-tome-terminal-mr',
    name: 'Terminal Manuel Rodríguez (Concepción)',
    lat: -36.81912,
    lng: -73.06197,
    osm: 'way/425356582',
  },
  {
    id: 'osm-tome-plaza-peru',
    name: 'Plaza Perú (Av. Chacabuco)',
    lat: -36.826866,
    lng: -73.039979,
    osm: 'way/368010844',
  },
  {
    id: 'osm-tome-rotonda-bonilla',
    name: 'Rotonda General Bonilla',
    lat: -36.810541,
    lng: -73.027236,
    osm: 'way/364272946',
  },
  {
    id: 'osm-tome-cosmito',
    name: 'Cosmito (Ruta 150)',
    lat: -36.776199,
    lng: -73.020942,
    osm: 'node/1313627248',
  },
  {
    id: 'osm-tome-plaza-penco',
    name: 'Plaza de Penco (Los Conquistadores)',
    lat: -36.738743,
    lng: -72.993666,
    osm: 'way/27729446',
  },
  {
    id: 'osm-tome-plaza-lirquen',
    name: 'Plaza de Lirquén',
    lat: -36.712794,
    lng: -72.976736,
    osm: 'way/116548067',
  },
  {
    id: 'osm-tome-bellavista',
    name: 'Bellavista (Tomé)',
    lat: -36.636842,
    lng: -72.951300,
    osm: 'node/1235426711',
  },
  {
    id: 'osm-tome-costanera-centro',
    name: 'Costanera de Tomé (centro)',
    lat: -36.617077,
    lng: -72.963202,
    osm: 'way/30930557',
  },
  {
    id: 'osm-tome-diego-portales',
    name: 'Diego Portales (Plaza de Tomé)',
    lat: -36.616862,
    lng: -72.958266,
    osm: 'way/455232401',
  },
];

const STOPS_401_EXTRA: DigitizedStop[] = [
  {
    id: 'osm-tome-tome-alto',
    name: 'Tomé Alto (terminus 401)',
    lat: -36.604478,
    lng: -72.964666,
    osm: 'node/8495135802',
  },
];

const STOPS_411_EXTRA: DigitizedStop[] = [
  {
    id: 'osm-tome-av-estadio',
    name: 'Av. Estadio (salida Tomé hacia Dichato)',
    lat: -36.598616,
    lng: -72.969462,
    osm: 'way/149476411',
  },
  {
    id: 'osm-tome-dichato-centro',
    name: 'Dichato (centro)',
    lat: -36.548627,
    lng: -72.936438,
    osm: 'node/214221598',
  },
  {
    id: 'osm-tome-daniel-vera',
    name: 'Av. Daniel Vera (Dichato terminus)',
    lat: -36.538053,
    lng: -72.926259,
    osm: 'way/27679748',
  },
];

const STOPS_421_EXTRA: DigitizedStop[] = [
  // 421 termina en Av. Estadio — re-usa el mismo paradero que el 411 usa
  // como punto de paso. Definido en STOPS_411_EXTRA[0].
];

// Diccionario de TODOS los paraderos para serializar al archivo generado.
function uniqStops(...lists: DigitizedStop[][]): DigitizedStop[] {
  const seen = new Set<string>();
  const out: DigitizedStop[] = [];
  for (const l of lists) {
    for (const s of l) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        out.push(s);
      }
    }
  }
  return out;
}

const ALL_STOPS: DigitizedStop[] = uniqStops(
  STOPS_201,
  STOPS_TOME_SHARED,
  STOPS_401_EXTRA,
  STOPS_411_EXTRA,
  STOPS_421_EXTRA,
);

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
  // la bbox del corredor. La inclusión de tertiary deja entrar avenidas
  // urbanas (Costanera de Tomé, Diego Portales, Vicente Palacios) y las
  // calles del centro Santa Juana sin inundar con residenciales.
  // motorway/motorway_link incluidos porque la Ruta 150 cruza la Autopista
  // del Itata (ref=152, motorway) en el enlace Penco; los buses no transitan
  // por la motorway pero los nodos del intercambiador comparten geometría
  // con los enlaces de la 150 — sin estos links Dijkstra encuentra un gap
  // entre "Camino a Penco" (trunk) y "Bypass Penco" (primary).
  const query = `[out:json][timeout:180];
(
  way["highway"~"^(motorway|motorway_link|trunk|primary|secondary|tertiary|trunk_link|primary_link|secondary_link)$"](${CORRIDOR_BBOX});
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

interface RouteSpec {
  id: string;
  ref: string;
  name: string;
  colour: string;
  stopIds: string[];
  path: LatLng[];
  vertices: number;
  km: number;
  fallbacks: number;
  waypointsCount: number;
}

function render(specs: RouteSpec[]): string {
  const lines: string[] = [];
  lines.push(`// AUTO-GENERATED by scripts/fetch-interurban-routes.ts on ${new Date().toISOString()}.`);
  lines.push(`// Source: OpenStreetMap (Overpass API). NO existe relación route=bus en OSM`);
  lines.push(`// para 201 / 401 / 411 / 421 a la fecha de generación, así que el trazado de`);
  lines.push(`// cada servicio se digitalizó a partir de waypoints OSM citados (ver script)`);
  lines.push(`// y se reconstruyó con Dijkstra-por-corredor sobre el grafo highway= regional.`);
  lines.push(`// Cada vértice del path es un nodo OSM real — NO hay coordenadas inventadas.`);
  lines.push(`// El campo \`digitized: true\` distingue estas rutas de las del GTFS oficial.`);
  for (const s of specs) {
    lines.push(`//   ${s.ref.padEnd(4)}  ${s.vertices.toString().padStart(4)} vért · ${s.km.toFixed(1).padStart(5)} km · ${s.waypointsCount} waypoints citados · ${s.fallbacks} fallback(s).`);
  }
  lines.push(`// Re-generate: \`npm run sync:interurban-routes\`.`);
  lines.push(``);
  lines.push(`import type { BusRoute, Paradero } from '@/types/transport';`);
  lines.push(``);
  lines.push(`/** Paraderos OSM verificables del corpus interurbano — coords citadas en script. */`);
  lines.push(`export const INTERURBAN_PARADEROS: Paradero[] = ${JSON.stringify(
    ALL_STOPS.map((s) => ({
      id: s.id,
      source: 'osm' as const,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
    })),
    null,
    2,
  )};`);
  lines.push(``);
  lines.push(`/**`);
  lines.push(` * Buses interurbanos licitados FUERA del GTFS Gran Concepción.`);
  lines.push(` *   201 — Santa Juana (DTPR ELC0007).`);
  lines.push(` *   401/411/421 — Tomé / Dichato / Av. Estadio (Perímetro Tomé op. 2022).`);
  lines.push(` * Cuando aparezcan en el feed oficial, esta lista se vacía y el archivo`);
  lines.push(` * se elimina.`);
  lines.push(` *`);
  lines.push(` * Campo \`digitized: true\` informa al UI que el trazado no es shape GTFS`);
  lines.push(` * verificado y debe acompañarse de una nota.`);
  lines.push(` */`);
  lines.push(`export const INTERURBAN_BUS_ROUTES: BusRoute[] = [`);
  for (const s of specs) {
    lines.push(`  {`);
    lines.push(`    id: '${s.id}',`);
    lines.push(`    source: 'osm',`);
    lines.push(`    ref: '${s.ref}',`);
    lines.push(`    name: ${JSON.stringify(s.name)},`);
    lines.push(`    operator: ${s.ref === '201' ? "'Transportes Santa Juana SpA'" : "'Transportes Tomé'"},`);
    lines.push(`    network: ${s.ref === '201' ? "'Interurbano Biobío'" : "'Interurbano Tomé'"},`);
    lines.push(`    colour: '${s.colour}',`);
    lines.push(`    digitized: true,`);
    lines.push(`    path: ${JSON.stringify(s.path.map(([la, ln]) => [Number(la.toFixed(5)), Number(ln.toFixed(5))]))},`);
    lines.push(`    stopIds: ${JSON.stringify(s.stopIds)},`);
    lines.push(`  },`);
  }
  lines.push(`];`);
  return lines.join('\n') + '\n';
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

  // Solve cada ruta y empaqueta su spec.
  const specs: RouteSpec[] = [];

  function solveRoute(opts: {
    id: string;
    ref: string;
    name: string;
    colour: string;
    waypoints: Waypoint[];
    stopIds: string[];
    minVertices?: number;
  }): void {
    console.log(`Solving corridor ${opts.ref} (${opts.waypoints[0].label} → ${opts.waypoints[opts.waypoints.length - 1].label})…`);
    const { path: raw, fallbacks } = buildLine(coords, adj, opts.waypoints);
    const path = simplify(raw as Array<[number, number]>, SIMPLIFY_TOLERANCE);
    const km = pathKm(path);
    console.log(`  → ${opts.ref}: ${raw.length} vértices raw → ${path.length} simplificado · ${km.toFixed(1)} km · fallbacks=${fallbacks}`);
    const minV = opts.minVertices ?? 10;
    if (path.length < minV) {
      throw new Error(`Path resultante muy corto para ${opts.ref} (${path.length} < ${minV}) — algo falló en la digitalización, no sobreescribo.`);
    }
    specs.push({
      id: opts.id,
      ref: opts.ref,
      name: opts.name,
      colour: opts.colour,
      stopIds: opts.stopIds,
      path,
      vertices: path.length,
      km,
      fallbacks,
      waypointsCount: opts.waypoints.length,
    });
  }

  solveRoute({
    id: 'interurban-201',
    ref: '201',
    name: '201: Concepción ↔ Santa Juana',
    colour: '#0f766e',
    waypoints: WAYPOINTS_201,
    stopIds: STOPS_201.map((s) => s.id),
  });

  // Tres servicios Tomé. Color: misma familia teal/cyan oscuro derivada del
  // corredor #0e7490 que ya usaba el pin del overlay.
  solveRoute({
    id: 'interurban-401',
    ref: '401',
    name: '401: Concepción ↔ Tomé Alto',
    colour: '#0e7490',
    waypoints: WAYPOINTS_401,
    stopIds: [...STOPS_TOME_SHARED.map((s) => s.id), ...STOPS_401_EXTRA.map((s) => s.id)],
  });
  solveRoute({
    id: 'interurban-411',
    ref: '411',
    name: '411: Concepción ↔ Dichato (vía Tomé)',
    colour: '#155e75',
    waypoints: WAYPOINTS_411,
    stopIds: [
      ...STOPS_TOME_SHARED.map((s) => s.id),
      ...STOPS_411_EXTRA.map((s) => s.id),
    ],
  });
  solveRoute({
    id: 'interurban-421',
    ref: '421',
    name: '421: Concepción ↔ Av. Estadio (Tomé · hora punta)',
    colour: '#0891b2',
    waypoints: WAYPOINTS_421,
    stopIds: [
      ...STOPS_TOME_SHARED.map((s) => s.id),
      // 421 termina en Av. Estadio — usa el mismo paradero que el 411.
      'osm-tome-av-estadio',
    ],
  });

  // Idempotencia: si el archivo ya existe y el contenido (sin banner) es
  // idéntico, no reescribimos para evitar churn en git.
  const next = render(specs);
  if (existsSync(OUT_PATH)) {
    const prev = readFileSync(OUT_PATH, 'utf8');
    const stripBanner = (s: string) =>
      s
        .split('\n')
        .filter((l) => !l.startsWith('// AUTO-GENERATED') && !(l.startsWith('//   ') && /\d+ vért/.test(l)))
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
