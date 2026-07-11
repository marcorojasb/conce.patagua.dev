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
  hooks/               hooks de datos en vivo (ej. useAirQuality contra SINCA)
  lib/                 lógica de dominio: planner, routing, geo, horarios, calidad de datos, export GeoJSON
  realtime/            estado en tiempo real
  types/               tipos compartidos
  wiki/                segunda app, montada en /wiki (wiki-app.tsx + articles/)
scripts/               generación de datasets (sync:*) + validación/smoke (data:validate, smoke, bundle:budget)
```

## Convenciones observadas en el código existente

- **Sin abstracciones especulativas**: funciones puntuales y tipadas directamente para el caso de uso actual (ver `src/lib/data-quality.ts`, `src/hooks/*`), sin capas de indirección, factories o "configurabilidad" no usada.
- **Comentarios solo cuando el "por qué" no es obvio**: bloques de comentario cortos al inicio de un archivo/hook explicando de dónde viene un dato externo, su cadencia de actualización o una decisión no evidente (ej. cabecera de `src/hooks/useAirQuality` explicando el bbox y la frecuencia de polling; cabecera de `scripts/fetch-wikidata.ts` explicando qué propiedades de Wikidata se usan). No hay comentarios redundantes que repitan lo que el código ya dice.
- **Tipado explícito de datos externos**: al parsear respuestas de APIs externas (SINCA, Wikidata, Overpass) se definen interfaces locales para la forma cruda de la respuesta y se valida con guards (`typeof x === 'number'`, etc.) antes de mapear al tipo de dominio interno — no se confía en `any` ni en el shape remoto.
- **Separación estricta datos generados vs. curados**: todo archivo `*.generated.ts` en `src/data/` se regenera con un script `sync:*` (ver README) y no debe editarse a mano; los archivos sin `.generated` son fuente de verdad manual.
- **Tests colocados junto al código**: `*.test.ts` vive al lado del archivo que prueba (`src/lib/planner.test.ts`, `src/lib/routing.test.ts`, `src/data/route-quality.test.ts`), no en una carpeta `__tests__` separada.
- **Nombres de rutas/scripts en inglés técnico, contenido/copy en español**: el código (identificadores, nombres de archivo) está en inglés; la UI, comentarios de dominio y artículos de la wiki están en español (el proyecto es para Concepción, Chile).

## Antes de dar por terminado un cambio

```bash
npm run check
```

(`typecheck` + `test` + `data:validate` + `build` + `bundle:budget` + `smoke`). Si el cambio toca capas de datos, UI del mapa o la wiki, correr además `npm run check:full` (agrega `smoke:services`, con Playwright).

No editar directamente los `*.generated.ts` en `src/data/` — si un dataset necesita cambiar, corre el `sync:*` correspondiente (ver tabla en README.md) o edita el script que lo genera.

## Notas pendientes / no verificado

- Los scripts `sync:gtfs-*` y `sync:stop-*` requieren un binario `sqlite3` y una base de datos local apuntada por `GTFS_DB_PATH`; no hay `.env.example` ni documentación de cómo obtener esa base desde cero.
