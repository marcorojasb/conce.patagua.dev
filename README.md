# conce.patagua.dev

Visor open source del transporte público del Gran Concepción, Chile: Biotrén, buses, terminales, ciclovías, colegios, áreas verdes, puntos de interés y calidad del aire, sobre un mapa Leaflet. Incluye además un mini-wiki (`/wiki`) con artículos sobre el sistema de transporte de la región (recorridos interurbanos, GTFS, Ley 20.378, SEREMITT, etc.).

## Stack

- React 18 + TypeScript + Vite 6
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
- `src/hooks/` — hooks de datos en vivo (ej. calidad del aire vía SINCA).
- `scripts/` — scripts de sync/generación de datos y de verificación (`check`).

## Correr en local

```bash
npm install
npm run dev
```

Con esto alcanza para trabajar en el visor y en el wiki: ninguno de los dos requiere la sqlite de GTFS para levantar el dev server, porque los `*.generated.ts` ya están commiteados en el repo (ver más abajo la distinción de qué scripts `sync:*` sí requieren la sqlite).

## Antes de un PR

```bash
npm run check
```

Esto corre en orden: `typecheck` → `test` (Vitest) → `data:validate` (valida los `*.generated.ts`) → `build` → `bundle:budget` (chequea tamaño del bundle) → `smoke` (smoke test del dev server).

`npm run check:full` agrega además `smoke:services`, que usa Playwright para probar el visor en un browser real — más lento, útil antes de mergear cambios que tocan capas de datos o UI del mapa.

## El wiki (`/wiki`)

El wiki es la segunda mini-app del proyecto: un conjunto de artículos sobre el sistema de transporte del Gran Concepción y el Biobío (perímetros de exclusión, BusPay, subsidio Ley 20.378, corredores interurbanos, Biotrén, GTFS, OSM, taxis colectivos, marco institucional SEREMITT/DTPR, etc.) que complementa al visor con contexto que no cabe en un mapa: regulación, licitaciones, historia, tarifas, instituciones.

**Para quién es**: para cualquier persona que llega a `conce.patagua.dev/wiki` buscando entender el sistema (usuario final), y también como bitácora editorial del equipo — cada artículo cita sus fuentes y se marca como "pendiente de verificación" cuando corresponde, así que sirve de registro de qué se sabe con certeza y qué no.

### Cómo está armado

- `src/wiki/articles/*.tsx` — un componente React por artículo (contenido en JSX, no Markdown). El nombre del archivo es el slug de la URL (`src/wiki/articles/biotren.tsx` → `/wiki/biotren`).
- `src/wiki/articles.ts` — registro central: un array `ARTICLES` con metadata de cada artículo (`slug`, `title`, `summary`, `section`, `updated`, y el componente cargado con `lazy()`). Todo artículo nuevo se agrega acá manualmente, además de crear su archivo; no hay auto-descubrimiento de archivos.
- `src/wiki/articles/_components.tsx` — componentes de layout compartidos por los artículos (`Section`, `KeyValueList`, y similares para tablas/cronologías), para que las fichas se vean consistentes sin repetir clases de Tailwind en cada una.
- `src/wiki/wiki-app.tsx` — shell del wiki: header, panel lateral de navegación agrupado por `section` (`SECTION_LABELS`), y el área de contenido. Enrutamiento propio sin librería de routing: lee `window.location.pathname` con `useSyncExternalStore` + `popstate`, navega con `history.pushState`. Es completamente independiente del router (inexistente) del visor.
- `src/wiki/map-link.tsx` / `map-links.ts` — componente `<MapLink>` para que un artículo enlace a una vista enfocada del visor (`/?focus=<kind>:<id>`, ej. `<MapLink route="10A">`). Es el único punto de acoplamiento entre wiki y visor, y es unidireccional (el wiki apunta al visor, no al revés) y sin validación en tiempo de build — si el id no existe, el visor abre la vista por defecto.

### Cómo agregar o editar una página

1. Crear `src/wiki/articles/mi-slug.tsx` exportando un componente default (ver cualquier artículo existente como plantilla, o `src/wiki/articles/sobre-este-wiki.tsx` para el manual de estilo editorial completo: voz, formato de montos, banners de verificación, cross-links, largo objetivo de 400-700 líneas).
2. Agregar una entrada en el array `ARTICLES` de `src/wiki/articles.ts` con `slug`, `title`, `summary`, `section` (una de `estructural | interurbanos | urbanos | fuentes | metodologia`) y `updated`, apuntando el `Component` a `lazy(() => import('./articles/mi-slug'))`.
3. No hace falta tocar `wiki-app.tsx`: la navegación lateral y la home del wiki (`WikiHome`) se generan automáticamente a partir de `ARTICLES`.
4. Cada artículo publicado incluye automáticamente un link "Editar en GitHub" (`ArticleHeader` en `wiki-app.tsx`) hacia `github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/<slug>.tsx`, pensado para que alguien proponga una corrección vía PR sin clonar el repo.

### Wiki ↔ visor

Ambas apps viven en el mismo build de Vite y el mismo despliegue de Vercel, pero no comparten componentes de UI, estado ni datos entre sí (el wiki no importa `src/App.tsx` ni datasets de `src/data/`, salvo el enlace de vuelta vía `MapLink`). La única conexión real es esa: un artículo puede linkear a una vista del mapa; el visor no linkea de vuelta a artículos específicos todavía.

## Scripts de sincronización de datos (`sync:*`)

Los datasets en `src/data/*.generated.ts` no se escriben a mano: se generan a partir de fuentes externas (Overpass/OSM, GTFS, Wikidata) corriendo los scripts correspondientes en `scripts/`. Un workflow de GitHub Actions (`.github/workflows/`) corre `npm run sync:all` diariamente (06:30 UTC) y abre un PR automático si hay cambios en `src/data`.

| Script | Fuente | Genera |
|---|---|---|
| `sync:biotren` | Overpass (`railway=station`, operador EFE) | `biotren.generated.ts` |
| `sync:biotren-track` | Overpass (`railway=rail`) + Dijkstra | `biotren-track.generated.ts` |
| `sync:terminals` | Overpass (`amenity=bus_station`) | `terminals.generated.ts` |
| `sync:gtfs-concepcion` | sqlite local vía `sqlite3` CLI | `gtfs-concepcion.generated.ts`, `gtfs-stops.generated.ts`, `gtfs-bus-routes.generated.ts` |
| `sync:gtfs-schedule` | sqlite local | `gtfs-schedule.generated.ts` |
| `sync:coverage` | — | `coverage.generated.ts` (grilla de cobertura) |
| `sync:stop-frequency` | sqlite local | `gtfs-stop-frequency.generated.ts` |
| `sync:stop-services` | sqlite local | `gtfs-stop-services.generated.ts` |
| `sync:pois` | Overpass | `pois.generated.ts` |
| `sync:wikidata` | SPARQL de Wikidata (Q-ids ya presentes en `biotren.generated.ts`) | `wikidata.generated.ts` |
| `sync:cycleways` | Overpass | `cycleways.generated.ts` |
| `sync:greenspace` | Overpass | `greenspace.generated.ts` |
| `sync:schools` | Overpass | `schools.generated.ts` |
| `sync:interurban-routes` | Overpass | `interurban-routes.generated.ts` |
| `sync:all` | — | corre todos los anteriores excepto `sync:coverage` (según `package.json` actual) |

Los scripts `sync:gtfs-*` y `sync:stop-*` dependen de un binario `sqlite3` disponible en el sistema y de una base de datos GTFS local apuntada por la variable de entorno `GTFS_DB_PATH` (con un default hardcodeado a una ruta local de macOS en `scripts/generate-gtfs-concepcion.ts` que no existe en otros entornos). **Pendiente**: no hay `.env.example` en el repo ni documentación de cómo obtener/generar esa base sqlite (`gran_concepcion_candidate.sqlite`) desde cero — quien quiera correr estos scripts necesita averiguarlo por su cuenta o pedirle la base al mantenedor.

El resto de los scripts (Overpass, Wikidata) no requieren credenciales: usan endpoints públicos con un User-Agent identificándose como este proyecto.

## Despliegue

Configurado para Vercel (`vercel.json`). Único ajuste no default: rewrites de `/wiki` y `/wiki/:slug*` hacia `/index.html`, para que el router basado en `pathname` de `src/main.tsx` reciba la ruta y monte la wiki en el cliente (SPA).
