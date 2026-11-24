# AGENTS.md

Guía para agentes de IA (y colaboradores humanos nuevos) trabajando en este repo.

## Qué es esto

Visor de transporte público del Gran Concepción (React + Vite + TS + Tailwind + shadcn/ui + react-leaflet), más una segunda app mini-wiki en `/wiki`. Ver `README.md` para el detalle de stack, scripts y despliegue.

## Estructura

```
src/
  App.tsx            visor principal
  components/ui/      componentes shadcn/ui (Radix)
  data/                *.generated.ts (no editar a mano, ver scripts/) + datos curados (routes.ts, interurban-corridors.ts, static-service-patterns.ts)
  hooks/               hooks de datos en vivo (ej. use-air-quality contra SINCA, use-live-arrivals)
  lib/                 lógica de dominio: planner, routing, geo, horarios, calidad de datos, export GeoJSON
  realtime/            llegadas en vivo (live-arrivals.ts) y simulación de Servicios en curso
  types/               tipos compartidos
  wiki/                segunda app, montada en /wiki (wiki-app.tsx + articles/)
api/                   funciones de Vercel (stop-arrivals.ts: intermediaria de llegadas en vivo)
scripts/               generación de datasets (sync:*) + validación/smoke (data:validate, smoke, bundle:budget)
```

## Datos: fuentes y reglas

- **Buses**: GTFS oficial de la DTPR (`https://dtpr.gob.cl/wp-content/uploads/2025/12/granconcepcion.zip`, versión "Gran Concepción20250228"). Calendario declarado 2024-01-01..2025-12-31, formalmente vencido pero es la última publicación oficial; el visor lo usa sin filtrar por fecha y lo dice en la UI. 102 recorridos, 188 sentidos, 2.239 paraderos. Incluye los interurbanos 201/201-AU, 401/401Y/411/421 y 302/304.
- **Sync**: `npm run sync:gtfs` (`scripts/sync-gtfs-official.ts`, lee el zip con `node:zlib`, sin sqlite), diario en `.github/workflows/sync-data.yml`. Ya no existen los scripts `sync:gtfs-*`/`sync:stop-*` ni la base sqlite del feed 2019.
- **Códigos**: el código del recorrido junta dos variantes, una por sentido (`10AN` = sentido 0 `10A` + sentido 1 `10N`). La variante sale del letrero oficial. `MapLink route=` acepta el código (`10AN`) o una variante (`10A`).
- **Letreros cruzados**: en 02AD, 02KP y 23BS el feed trae el letrero cruzado entre sentidos; `correctTripHeadsign` (`scripts/lib/gtfs-transform.ts`) lo corrige solo cuando viene cruzado. No "arreglar" a mano en los generados.
- **Biotrén**: itinerarios oficiales de EFE (desde 2026-07-15) transcritos tren por tren en `src/data/static-service-patterns.ts`; estaciones y vía desde OSM.
- **Florida y Yumbel**: sin GTFS, solo pins en `src/data/interurban-corridors.ts`.
- **Llegadas en vivo**: fuente NO oficial de la app Transapp (`phone.dtpr.transapp.cl`), vía `api/stop-arrivals.ts` (caché 25 s por paradero, tope 30 consultas/min). El identificador de cliente sale de `TRANSAPP_PHONE_ID` (Vercel). **Nunca escribir su valor (ni ningún UUID o identificador de la fuente) en el repo, la wiki, tests, commits ni logs.**
- **Servicios en curso**: estimación según horario programado, nunca GPS; la UI debe rotularla como estimación.

## Convenciones observadas en el código existente

- **Sin abstracciones especulativas**: funciones puntuales y tipadas directamente para el caso de uso actual (ver `src/lib/data-quality.ts`, `src/hooks/*`), sin capas de indirección, factories o "configurabilidad" no usada.
- **Comentarios solo cuando el "por qué" no es obvio**: bloques de comentario cortos al inicio de un archivo/hook explicando de dónde viene un dato externo, su cadencia de actualización o una decisión no evidente (ej. cabecera de `src/hooks/use-air-quality.ts` explicando el bbox y la frecuencia de polling; cabecera de `scripts/fetch-wikidata.ts` explicando qué propiedades de Wikidata se usan). No hay comentarios redundantes que repitan lo que el código ya dice.
- **Tipado explícito de datos externos**: al parsear respuestas de APIs externas (SINCA, Wikidata, Overpass) se definen interfaces locales para la forma cruda de la respuesta y se valida con guards (`typeof x === 'number'`, etc.) antes de mapear al tipo de dominio interno — no se confía en `any` ni en el shape remoto.
- **Separación estricta datos generados vs. curados**: todo archivo `*.generated.ts` en `src/data/` se regenera con un script `sync:*` (ver README) y no debe editarse a mano; los archivos sin `.generated` son fuente de verdad manual.
- **Tests colocados junto al código**: `*.test.ts` vive al lado del archivo que prueba (`src/lib/planner.test.ts`, `src/lib/routing.test.ts`, `src/data/route-quality.test.ts`), no en una carpeta `__tests__` separada.
- **Nombres de rutas/scripts en inglés técnico, contenido/copy en español**: el código (identificadores, nombres de archivo) está en inglés; la UI, comentarios de dominio y artículos de la wiki están en español (el proyecto es para Concepción, Chile).

## Antes de dar por terminado un cambio

```bash
npm run check
```

(`typecheck` + `test` + `data:validate` + `maplinks:validate` + `build` + `bundle:budget` + `smoke`). Si el cambio toca capas de datos, UI del mapa o la wiki, correr además `npm run check:full` (agrega `smoke:services`, con Playwright).

`maplinks:validate` comprueba que cada `<MapLink>` de artículos apunte a una entidad real y que el índice reverso `MAP_WIKI_LINKS` en `src/wiki/map-links.ts` solo use slugs/códigos existentes.

No editar directamente los `*.generated.ts` en `src/data/` — si un dataset necesita cambiar, corre el `sync:*` correspondiente (ver tabla en README.md) o edita el script que lo genera.

## Wiki: legibilidad y radar X

- Plantilla en capas: `FactStrip` → `ArticleSummary` → `NewsPulse` → secciones → `CollapsibleSection` (ver `src/wiki/articles/_components.tsx` y piloto `biotren.tsx`).
- Actualizar con señales de X: skill `.agents/skills/wiki-x-research/SKILL.md`, queries en `docs/wiki-research-queries.md`, bitácoras en `docs/research/`. **X no es fuente primaria.**

## Notas pendientes / no verificado

- Las llegadas en vivo necesitan `TRANSAPP_PHONE_ID` en las variables de entorno (Vercel, o `.env.local` para `npm run dev`). Sin ella `/api/stop-arrivals` responde 503 y la ficha dice que no están activadas. La fuente no es oficial ni documentada: puede cambiar o cortarse sin aviso.
- El calendario del GTFS oficial venció el 2025-12-31 y no hay versión posterior: cambios de la red en 2026 (por ejemplo 11 servicios que la fuente en vivo ya sigue: 02H 02L 20F 20N 30H 30Z 50SY 70FY 70HY 80B 80V) no están en el visor hasta que la DTPR publique otra.
- `interurban-routes.generated.ts` (trazados OSM de 201/401/411/421) ya no se importa ni se regenera en `sync:osm`: esos servicios vienen del GTFS oficial. Se conserva porque el wiki lo cita; `npm run sync:interurban-routes` sigue disponible a mano.
