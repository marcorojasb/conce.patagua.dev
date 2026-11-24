# conce.patagua.dev

Visor open source del transporte público del Gran Concepción, Chile: Biotrén, buses, terminales, ciclovías, colegios, áreas verdes, puntos de interés y calidad del aire, sobre un mapa Leaflet. Incluye además un mini-wiki (`/wiki`) con artículos sobre el sistema de transporte de la región (recorridos interurbanos, GTFS, Ley 20.378, SEREMITT, etc.).

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS + shadcn/ui (Radix primitives) — configuración en `components.json`
- react-leaflet / Leaflet para el mapa
- Vitest para tests
- Desplegado en Vercel (ver `vercel.json`)

## Qué se ve al entrar

- `conce.patagua.dev` (`/`) — el visor: mapa Leaflet con capas conmutables (Biotrén, buses urbanos GTFS, terminales, ciclovías, áreas verdes, colegios, POIs, calidad del aire) y un planificador de viajes.
- `conce.patagua.dev/wiki` — el wiki: un sitio de artículos con navegación lateral por secciones, buscable por índice, sin mapa. Cada artículo puede enlazar de vuelta a una vista específica del visor (ver "Wiki ↔ visor" más abajo).

Son dos productos distintos que comparten build, estilos (Tailwind/shadcn) y despliegue, pero no comparten pantalla ni estado: no hay forma de tener el mapa y un artículo abiertos a la vez, son rutas separadas.

## Estructura

- `src/App.tsx` — visor principal (mapa, capas, filtros).
- `src/wiki/` — segunda app (`wiki-app.tsx`), montada en `/wiki`. `src/main.tsx` decide cuál renderizar según `window.location.pathname`; ambas se cargan como chunks lazy independientes (`lazy(() => import(...))`), así que un usuario que solo visita `/` nunca descarga el código del wiki y viceversa.
- `src/data/*.generated.ts` — datasets generados por los scripts `sync:*` (no editar a mano).
- `src/data/*.ts` (sin `.generated`) — datos curados a mano (`routes.ts`, `interurban-corridors.ts`, `static-service-patterns.ts`).
- `src/lib/` — lógica de dominio (planner, routing, horarios de operación, exportación GeoJSON, calidad de datos).
- `src/hooks/` — hooks de datos en vivo (calidad del aire vía SINCA, llegadas en vivo al paradero abierto).
- `api/` — funciones de Vercel (hoy solo `stop-arrivals.ts`, intermediaria de las llegadas en vivo).
- `scripts/` — scripts de sync/generación de datos y de verificación (`check`).

## De dónde salen los datos

- **Buses**: el [GTFS oficial de la DTPR](https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/) para el Gran Concepción ([`granconcepcion.zip`](https://dtpr.gob.cl/wp-content/uploads/2025/12/granconcepcion.zip)), versión `Gran Concepción20250228` (programa del 28-02-2025). Su calendario declarado (01-01-2024 a 31-12-2025) ya venció, pero es la última publicación oficial; el visor la usa como el programa más reciente y lo dice en la ficha de cada recorrido. Trae 102 recorridos con 188 sentidos (16 recorridos publican uno solo), 2.239 paraderos y 57.019 viajes (29.240 por día hábil, 14.405 el sábado y 13.374 el domingo). Incluye los interurbanos 201/201-AU (Santa Juana), 401/401Y/411/421 (Tomé y Dichato) y 302/304 (Lota ↔ Concepción). Hasta noviembre de 2026 el visor usaba el feed 2019 de la Subsecretaría de Transportes (169 servicios, uno por letra), procesado con sqlite; ese pipeline ya no existe.
- **Códigos de recorrido**: el código del GTFS junta las dos letras de un recorrido, una por sentido: `10AN` es el sentido 0 `10A` más el sentido 1 `10N`. La variante es el código que muestra el bus y sale del letrero oficial ("Vía Láctea 10A - Centinela"). En 02AD, 02KP y 23BS el feed trae el letrero cruzado entre sentidos (en 23BS también el destino); la sincronización lo corrige solo cuando viene cruzado (`correctTripHeadsign` en `scripts/lib/gtfs-transform.ts`).
- **Biotrén**: estaciones y vía desde OpenStreetMap; horarios de los [itinerarios oficiales de EFE](https://www.efe.cl/itinerario-biotren/) vigentes desde el 15-07-2026, transcritos tren por tren en `src/data/static-service-patterns.ts` (día hábil: L1 37 trenes, L2 104). EFE no publica GTFS.
- **Florida y Yumbel**: no tienen GTFS; en el mapa son solo un pin de corredor con enlace al wiki (`src/data/interurban-corridors.ts`).
- **Llegadas en vivo**: fuente no oficial de la app de Transapp, solo para el paradero abierto (ver más abajo).
- **Servicios en curso**: estimación según el horario programado (GTFS y EFE), nunca GPS; la UI la rotula como estimación.

## Correr en local

```bash
npm install
npm run dev
```

Con esto alcanza para trabajar en el visor y en el wiki: ninguno de los dos necesita descargar datos para levantar el dev server, porque los `*.generated.ts` ya están commiteados en el repo (ver más abajo los scripts `sync:*` que los regeneran).

## Antes de un PR

```bash
npm run check
```

Esto corre en orden: `typecheck` → `test` (Vitest) → `data:validate` (valida los `*.generated.ts`) → `maplinks:validate` (MapLinks del wiki + índice reverso) → `build` → `bundle:budget` (chequea tamaño del bundle) → `smoke` (smoke test del dev server).

`npm run check:full` agrega además `smoke:services`, que usa Playwright para probar el visor en un browser real — más lento, útil antes de mergear cambios que tocan capas de datos o UI del mapa.

## El wiki (`/wiki`)

El wiki es la segunda mini-app del proyecto: un conjunto de artículos sobre el sistema de transporte del Gran Concepción y el Biobío (perímetros de exclusión, BusPay, subsidio Ley 20.378, corredores interurbanos, Biotrén, GTFS, OSM, taxis colectivos, marco institucional SEREMITT/DTPR, etc.) que complementa al visor con contexto que no cabe en un mapa: regulación, licitaciones, historia, tarifas, instituciones.

**Para quién es**: para cualquier persona que llega a `conce.patagua.dev/wiki` buscando entender el sistema (usuario final), y también como bitácora editorial del equipo — cada artículo cita sus fuentes y se marca como "pendiente de verificación" cuando corresponde, así que sirve de registro de qué se sabe con certeza y qué no.

### Cómo está armado

- `src/wiki/articles/*.tsx` — un componente React por artículo (contenido en JSX, no Markdown). El nombre del archivo es el slug de la URL (`src/wiki/articles/biotren.tsx` → `/wiki/biotren`).
- `src/wiki/articles.ts` — registro central: un array `ARTICLES` con metadata de cada artículo (`slug`, `title`, `summary`, `section`, `updated`, y el componente cargado con `lazy()`). Todo artículo nuevo se agrega acá manualmente, además de crear su archivo; no hay auto-descubrimiento de archivos.
- `src/wiki/articles/_components.tsx` — componentes de layout compartidos por los artículos (`Section`, `KeyValueList`, y similares para tablas/cronologías), para que las fichas se vean consistentes sin repetir clases de Tailwind en cada una.
- `src/wiki/wiki-app.tsx` — shell del wiki: header, panel lateral de navegación agrupado por `section` (`SECTION_LABELS`), y el área de contenido. Enrutamiento propio sin librería de routing: lee `window.location.pathname` con `useSyncExternalStore` + `popstate`, navega con `history.pushState`. Es completamente independiente del router (inexistente) del visor.
- `src/wiki/map-link.tsx` / `map-links.ts` — puente bidireccional wiki ↔ visor:
  - **Wiki → mapa:** componente `<MapLink>` que genera `/?focus=<kind>:<id>` (ej. `<MapLink route="L1">`). Si el id no existe, el visor hace fallback graceful (vista por defecto).
  - **Mapa → wiki:** índice `MAP_WIKI_LINKS` en `map-links.ts` (por `route.code`, `corridorId`, `terminalId`). Las detail sheets del visor muestran "Ver en el wiki" vía `WikiLinkButton` cuando hay match.

### Cómo agregar o editar una página

1. Crear `src/wiki/articles/mi-slug.tsx` exportando un componente default (ver cualquier artículo existente como plantilla, o `src/wiki/articles/sobre-este-wiki.tsx` para el manual de estilo editorial completo: voz, formato de montos, banners de verificación, cross-links, largo objetivo de 400-700 líneas).
2. Agregar una entrada en el array `ARTICLES` de `src/wiki/articles.ts` con `slug`, `title`, `summary`, `section` (una de `estructural | interurbanos | urbanos | fuentes | metodologia`) y `updated`, apuntando el `Component` a `lazy(() => import('./articles/mi-slug'))`.
3. No hace falta tocar `wiki-app.tsx`: la navegación lateral y la home del wiki (`WikiHome`) se generan automáticamente a partir de `ARTICLES`.
4. Cada artículo publicado incluye automáticamente un link "Editar en GitHub" (`ArticleHeader` en `wiki-app.tsx`) hacia `github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/<slug>.tsx`, pensado para que alguien proponga una corrección vía PR sin clonar el repo.

### Wiki ↔ visor

Ambas apps viven en el mismo build de Vite y el mismo despliegue de Vercel, pero no comparten componentes de UI ni estado entre sí (el wiki no importa `src/App.tsx`). El único acoplamiento es el puente de enlaces:

1. Un artículo puede apuntar al mapa con `<MapLink>` (`/?focus=…`).
2. Una entidad del mapa puede apuntar a su artículo con el índice de `map-links.ts` + `WikiLinkButton` (o el popup de corredores interurbanos).

Para agregar un enlace mapa→wiki: crear o identificar el artículo, añadir la entrada en `MAP_WIKI_LINKS` (`byRouteCode` / `byCorridorId` / `byTerminalId`), y —si es un corredor sin GTFS— la entrada en `src/data/interurban-corridors.ts`.

## Scripts de sincronización de datos (`sync:*`)

Los datasets en `src/data/*.generated.ts` no se escriben a mano: se generan a partir de fuentes externas (Overpass/OSM, GTFS, Wikidata) corriendo los scripts correspondientes en `scripts/`. Un workflow de GitHub Actions (`.github/workflows/sync-data.yml`) corre `sync:osm` y `sync:gtfs` (lo mismo que `sync:all`) diariamente (06:30 UTC) y abre un PR automático si hay cambios en `src/data`. Si falla el paso del GTFS (por ejemplo, dtpr.gob.cl caído), el PR igual se abre con los datos OSM y los archivos GTFS quedan como estaban.

| Script | Fuente | Genera |
|---|---|---|
| `sync:biotren` | Overpass (`railway=station`, operador EFE) | `biotren.generated.ts` |
| `sync:biotren-track` | Overpass (`railway=rail`) + Dijkstra | `biotren-track.generated.ts` |
| `sync:terminals` | Overpass (`amenity=bus_station`) | `terminals.generated.ts` |
| `sync:gtfs` | GTFS oficial de la DTPR (`granconcepcion.zip` en dtpr.gob.cl), luego corre `sync:coverage` | `gtfs-stops.generated.ts` (+ `GTFS_CONCEPCION_SOURCE`), `gtfs-bus-routes.generated.ts` (con ambos sentidos), `gtfs-concepcion.generated.ts` (barrel), `gtfs-schedule.generated.ts`, `gtfs-stop-frequency.generated.ts`, `gtfs-stop-services.generated.ts` |
| `sync:coverage` | `gtfs-stops.generated.ts` | `coverage.generated.ts` (grilla de cobertura) |
| `sync:pois` | Overpass | `pois.generated.ts` |
| `sync:wikidata` | SPARQL de Wikidata (Q-ids ya presentes en `biotren.generated.ts`) | `wikidata.generated.ts` |
| `sync:cycleways` | Overpass | `cycleways.generated.ts` |
| `sync:greenspace` | Overpass | `greenspace.generated.ts` |
| `sync:schools` | Overpass | `schools.generated.ts` |
| `sync:interurban-routes` | Overpass | `interurban-routes.generated.ts` (trazados OSM de 201/401/411/421 digitalizados a mano; el visor ya no los usa, esos servicios vienen del GTFS oficial) |
| `sync:all` | — | `sync:osm` + `sync:gtfs` (todos los anteriores) |

`sync:gtfs` (`scripts/sync-gtfs-official.ts`) no necesita credenciales ni binarios del sistema: descarga el zip oficial y lo lee en streaming con Node (`stop_times.txt` pesa ~300 MB descomprimido). Detalles:

- **Fuente**: `GTFS_URL` (por defecto `https://dtpr.gob.cl/wp-content/uploads/2025/12/granconcepcion.zip`). El zip queda en `.cache/gtfs/` (ignorado por git) y se reutiliza mientras el servidor informe el mismo ETag/Last-Modified y tamaño; una descarga que no es un zip GTFS completo falla sin reemplazar la caché. Con `GTFS_ZIP_PATH=/ruta/al.zip` se lee un zip local sin descargar. Detrás de un proxy HTTPS, Node ≥ 22.21 necesita `NODE_USE_ENV_PROXY=1`.
- **Vigencia**: la versión publicada (`feed_version` "Gran Concepción20250228") declara calendario 2024-01-01 a 2025-12-31 y no hay una posterior. Los días de servicio salen de los flags de `calendar.txt` sin filtrar por fecha; el rango declarado, la URL, el sha256 y la fecha de descarga quedan en `GTFS_CONCEPCION_SOURCE`.
- **Horas**: las horas vacías de `stop_times` (paradas que no son timepoint) se ignoran, nunca se leen como 00:00. Un viaje va de la primera salida con hora a la última llegada con hora; solo se descartan viajes rotos (sin horas, duración ≤ 0 o > 6 h) y el script los cuenta por ruta en su resumen.
- **Sentidos y letreros**: cada recorrido trae sus dos sentidos (`direction_id` 0 y 1), con la secuencia de paraderos más común, su shape y su letrero; del letrero salen la variante (`10A`) y el destino. Si el letrero de un sentido viene cruzado con el del otro (hoy 02AD, 02KP y 23BS), `correctTripHeadsign` lo corrige; la evidencia es el orden de letras del código, los paraderos terminales de cada sentido y la red publicada en la app Transapp/DTPR.
- **Formato**: horarios y ventanas por paradero se guardan compactos (ver `scripts/lib/gtfs-encode.ts`) y se decodifican al cargar el módulo, para respetar los presupuestos de `bundle:budget`. Si lo único que cambia es la marca de tiempo, ni estos archivos ni `coverage.generated.ts` se reescriben.

El resto de los scripts (Overpass, Wikidata) no requieren credenciales: usan endpoints públicos con un User-Agent identificándose como este proyecto.

## Llegadas en vivo (fuente no oficial)

Al abrir un paradero GTFS, la ficha muestra las micros que vienen a ese paradero con su GPS real (línea, sentido, minutos, distancia y patente) y el mapa las dibuja como marcadores cuadrados con anillo verde. Las micros de "Servicios en curso" siguen siendo una **estimación según horario** (redondas, borde punteado) y así se rotulan.

- Fuente: `phone.dtpr.transapp.cl`, la que usa la app de Transapp para la DTPR. No es oficial ni documentada y no manda CORS, así que el navegador consulta `api/stop-arrivals.ts` (función de Vercel): caché de 25 s por paradero en la CDN y en memoria, consultas en vuelo compartidas, tope de 30 consultas por minuto por instancia y un nombre de cliente genérico.
- Variable de entorno: `TRANSAPP_PHONE_ID`, el identificador de cliente que pide la fuente (configurado en Vercel; nunca va en el repo). Sin ella la función responde 503 y la ficha dice que las llegadas en vivo no están activadas.
- Qué trae (comprobado con respuestas reales el 24-11-2026 en paraderos de Concepción, Tomé, San Pedro, Talcahuano y Coronel): por micro, línea, sentido, minutos, posición GPS, patente y distancia en línea recta al paradero (no por la ruta). Las líneas sin GPS llegan como "sin datos en vivo · pasa cada N".
- Calce con el GTFS: el código de paradero de la fuente es `P` + el `stop_id` oficial (2.202 de 2.239 paraderos; 6 más con otro nombre; 31 no existen en la fuente). La fuente nombra las líneas por sentido (`20A`, `401I`): 183 de los 188 sentidos oficiales tienen par. Sigue 11 servicios de 2026 que el GTFS 2025 no trae (02H 02L 20F 20N 30H 30Z 50SY 70FY 70HY 80B 80V) y no sigue en vivo la 302 ni la 304. Sus coordenadas de paradero coinciden con las oficiales (mediana 3 m, 97% a menos de 20 m), lo que respalda la ubicación oficial de los paraderos.
- Reglas (en `src/realtime/live-arrivals.ts`, con pruebas): respuesta ilegible = falla; minutos desde `epochTime` o `timeLabel`; se descarta la micro que debía pasar hace más de 2 min; una respuesta vacía de golpe no borra un dato con micros por llegar; un dato vale 10 min mostrando su edad (destacada pasados 2 min); "sin datos en vivo · pasa cada N" cuando la fuente avisa que la línea no transmite GPS. Consulta cada 30 s, 60 s tras una falla y 5 min tras tres seguidas, solo con la pestaña visible.
- En local, `npm run dev` monta el mismo handler (plugin en `vite.config.ts`); los smoke tests interceptan `/api/stop-arrivals` con respuestas de ejemplo y nunca consultan la fuente real.

## Despliegue

Configurado para Vercel (`vercel.json`). Ajustes no default: rewrites de `/wiki` y `/wiki/:slug*` hacia `/index.html`, para que el router basado en `pathname` de `src/main.tsx` reciba la ruta y monte la wiki en el cliente (SPA); la función `api/stop-arrivals.ts` (requiere `TRANSAPP_PHONE_ID` en las variables de entorno del proyecto); y `.vercelignore` para que las pruebas de `api/` no se publiquen como funciones.
