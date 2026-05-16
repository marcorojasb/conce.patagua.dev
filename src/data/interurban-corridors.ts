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
   * cuando no (ej.: "el-pimenton" para Concepción ↔ Florida).
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

// El 201 Santa Juana se integró como ruta nativa del visor (ver
// `src/data/interurban-routes.generated.ts` y `src/data/routes.ts`).
// El sistema de corredores queda en pie para futuros servicios licitados
// que aún no tienen trazado verificable: Florida (corredor El Pimentón),
// Yumbel, Tomé rural, etc. Cuando aparezca su trazado, se mueven al
// dataset principal y este overlay se vacía o desaparece.
//
// Placeholder de ejemplo (comentado) — descomentá y editá cuando agregues:
//
//   {
//     id: 'el-pimenton',
//     wikiSlug: 'corredor-el-pimenton',
//     title: 'Corredor El Pimentón · Concepción ↔ Florida',
//     subtitle: 'Sin GTFS público · operación informal',
//     color: '#b45309',
//     anchor: [-36.83, -72.66],
//     sources: [{ label: 'OSM …', href: '…' }],
//   },

export const INTERURBAN_CORRIDORS: InterurbanCorridor[] = [
  {
    // Conce ↔ Tomé · servicios 401 / 411 / 421 operados por Transportes Tomé
    // bajo el Perímetro de Exclusión de Tomé (decreto MTT jul-2016, op. 2022).
    // No están en el feed GTFS urbano. El tramo Concepción↔Penco↔Lirquén sí
    // está cubierto por micros del GTFS (17M, 30B/C/E, 31F, 57Y, 62H); este
    // pin marca el lado de Tomé que falta.
    id: 'concepcion-tome',
    wikiSlug: 'concepcion-tome',
    title: 'Concepción ↔ Tomé · 401 / 411 / 421',
    subtitle: 'Transportes Tomé · perímetro de exclusión Tomé (op. 2022)',
    color: '#0e7490',
    // Anchor en Tomé urbano (centro administrativo de la comuna). OSM
    // relation 1558890 "Tomé" — clasificación town, place_rank 16.
    anchor: [-36.6171, -72.9575],
    // Terminal en Concepción ya presente en terminals.generated.ts como
    // osm-way-425356582 "Terminal de líneas a Tomé" (Angol esq. Manuel
    // Rodríguez aprox.). Repetimos la coordenada acá para que el overlay
    // pueda dibujar la línea discontinua sin tener que cruzar datasets.
    terminal: [-36.8191314, -73.0619879],
    sources: [
      {
        label: 'OSM relation 1558890 · Tomé (Nominatim)',
        href: 'https://nominatim.openstreetmap.org/search?q=Tom%C3%A9%2C+Biob%C3%ADo%2C+Chile&format=json&limit=3',
      },
      {
        label: 'OSM way 425356582 · Terminal de líneas a Tomé (Manuel Rodríguez, Concepción)',
        href: 'https://www.openstreetmap.org/way/425356582',
      },
      {
        label: 'OSM way 1082594953 · Ruta 150 (ref=150)',
        href: 'https://www.openstreetmap.org/way/1082594953',
      },
    ],
  },
];

export const CORRIDOR_BY_ID = new Map(
  INTERURBAN_CORRIDORS.map((c) => [c.id, c] as const),
);
