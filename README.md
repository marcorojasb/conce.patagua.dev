# conce.patagua.dev

Visor open source del transporte público del Gran Concepción, Chile: Biotrén, buses, terminales, ciclovías, colegios, áreas verdes, puntos de interés y calidad del aire, sobre un mapa Leaflet. Incluye además un mini-wiki (`/wiki`) con artículos sobre el sistema de transporte de la región (recorridos interurbanos, GTFS, Ley 20.378, SEREMITT, etc.).

## Stack

- React 18 + TypeScript + Vite 6
- Tailwind CSS + shadcn/ui (Radix primitives) — configuración en `components.json`
- react-leaflet / Leaflet para el mapa
- Vitest para tests
- Desplegado en Vercel (ver `vercel.json`)

## Estructura

- `src/App.tsx` — visor principal (mapa, capas, filtros).
- `src/wiki/` — segunda app (`wiki-app.tsx`), montada en `/wiki`. `src/main.tsx` decide cuál renderizar según `window.location.pathname`; ambas se cargan como chunks lazy independientes.
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

## Antes de un PR

```bash
npm run check
```

Esto corre en orden: `typecheck` → `test` (Vitest) → `data:validate` (valida los `*.generated.ts`) → `build` → `bundle:budget` (chequea tamaño del bundle) → `smoke` (smoke test del dev server).

`npm run check:full` agrega además `smoke:services`, que usa Playwright para probar el visor en un browser real — más lento, útil antes de mergear cambios que tocan capas de datos o UI del mapa.

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
