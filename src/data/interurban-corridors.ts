// Corredores interurbanos del Gran Concepción — servicios licitados que
// conectan el área metropolitana con comunas rurales o satélite y que
// NO están en el feed GTFS urbano de la Subsecretaría de Transportes.
//
// Este archivo es la "tabla puente" entre el mapa y los artículos del
// /wiki: un pin grande por corredor, con tooltip que enlaza al artículo.
//
// Procedencia de coordenadas
// --------------------------
// Cada anchor es un nodo o relación de OpenStreetMap consultado vía
// Nominatim (cita su `osm_id`). Las terminales en Concepción se reutilizan
// del dataset `src/data/terminals.generated.ts` cuando existen — así no
// se duplican coordenadas. Si un corredor no tiene un trazado oficial
// publicado, dejamos `path` vacío y el corredor se muestra como pin
// puntual; cuando aparezca el GTFS oficial, el corredor migra al visor
// principal y este archivo queda como contexto histórico.
//
// Para AGREGAR un corredor: confirmar coordenadas en
// https://nominatim.openstreetmap.org/search?format=json&q=… y citar el
// osm_id correspondiente. Si no hay fuente abierta, NO agregar.

import type { LatLngTuple } from '@/types/transport';

export interface InterurbanCorridor {
  /**
   * ID estable usado en URLs (`?focus=corridor:…`) y como ancla desde el
   * wiki (`<MapLink corridor="ruta-201" />`). Se elige por código de
   * servicio cuando existe (ej.: "ruta-201"), y por par origen-destino
   * cuando no (ej.: "concepcion-florida" para el corredor Conce ↔ Florida).
   */
  id: string;
  /** Slug del artículo del wiki que documenta el corredor. */
  wikiSlug: string;
  /** Título corto para tooltip en el mapa. */
  title: string;
  /** Sub-rótulo en el tooltip (operador, frecuencia o estado). */
  subtitle: string;
  /** Color del pin (HSL/HEX). */
  color: string;
  /**
   * Punto representativo del corredor. Para servicios con terminal urbano
   * conocido, suele apuntar al lado rural (que es lo que NO está en el
   * visor); el lado urbano ya aparece como Terminal.
   */
  anchor: LatLngTuple;
  /**
   * Segundo punto opcional (ej.: terminal en Concepción). Si está
   * presente, dibujamos una línea discontinua entre `anchor` y `terminal`
   * para sugerir que existe un servicio entre ambos — sin afirmar que el
   * trazado real sea recto (no lo es). Es una señal de "corredor", no un
   * shape del GTFS.
   */
  terminal?: LatLngTuple;
  /** Lista de fuentes de las coordenadas del anchor. */
  sources: Array<{ label: string; href: string }>;
}

// 201 Santa Juana y 401/411/421 Tomé se integraron como rutas nativas del
// visor (ver `src/data/interurban-routes.generated.ts` y `src/data/routes.ts`).
// Este overlay cubre corredores sin shape verificable: Florida y Yumbel.
// Cuando aparezca su trazado oficial, migran al dataset principal.
//
// El toggle del panel de capas se muestra cuando
// `INTERURBAN_CORRIDORS.length > 0` (ver map-layer-control.tsx).
//
// Coordenadas de terminales urbanos citadas desde terminals.generated.ts
// (mismo osm_id); se copian acá para que este módulo no importe datasets
// generados (scripts Node sin alias Vite y sin arrastre de React).

export const INTERURBAN_CORRIDORS: InterurbanCorridor[] = [
  {
    id: 'concepcion-florida',
    wikiSlug: 'concepcion-florida',
    title: 'Concepción ↔ Florida (corredor de El Pimentón)',
    subtitle: 'Sin GTFS público · operadores privados',
    color: '#b45309',
    // Ilustre Municipalidad de Florida (Arturo Prat) — Nominatim 2026-07-17.
    anchor: [-36.8237723, -72.6608169],
    // osm-way-114474600 · Terminal Camilo Henríquez
    terminal: [-36.8087472, -73.0340681],
    sources: [
      {
        label: 'OSM node 7926543037 · Municipalidad de Florida',
        href: 'https://www.openstreetmap.org/node/7926543037',
      },
      {
        label: 'OSM way 114474600 · Terminal Camilo Henríquez',
        href: 'https://www.openstreetmap.org/way/114474600',
      },
    ],
  },
  {
    id: 'concepcion-yumbel',
    wikiSlug: 'concepcion-yumbel',
    title: 'Concepción ↔ Yumbel',
    subtitle: 'Ruta 146 · sin PE ni licitación DTPR',
    color: '#0f766e',
    // Terminal Rodoviario San Francisco (Yumbel) — Nominatim 2026-07-17.
    anchor: [-37.1034745, -72.5618012],
    // osm-way-597586612 · Terminal Collao
    terminal: [-36.8158265, -73.0223785],
    sources: [
      {
        label: 'OSM way 116413519 · Terminal Rodoviario San Francisco',
        href: 'https://www.openstreetmap.org/way/116413519',
      },
      {
        label: 'OSM way 597586612 · Terminal Collao',
        href: 'https://www.openstreetmap.org/way/597586612',
      },
    ],
  },
];

export const CORRIDOR_BY_ID = new Map(
  INTERURBAN_CORRIDORS.map((c) => [c.id, c] as const),
);
