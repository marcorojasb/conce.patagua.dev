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

// Estación Intermodal Concepción (osm-way-135488014) — punto de salida del
// 201 en el lado urbano. Coordenada copiada de terminals.generated.ts para
// no duplicar la fuente.
const INTERMODAL_CONCEPCION: LatLngTuple = [-36.8298968, -73.0605492];

export const INTERURBAN_CORRIDORS: InterurbanCorridor[] = [
  {
    id: 'ruta-201',
    wikiSlug: 'ruta-201-santa-juana',
    title: 'Ruta 201 · Concepción ↔ Santa Juana',
    subtitle: 'Servicio licitado DTPR ELC0007 · Transportes Santa Juana SpA',
    color: '#0f766e', // teal-700 — distinto del esquema urbano
    // Plaza de Armas / centro de Santa Juana. Fuente Nominatim: relation
    // 1622274 (límite administrativo "Santa Juana", Provincia de Concepción,
    // Biobío). El centroide reportado (-37.1738, -72.9426) cae sobre el
    // área urbana de la comuna — apropiado como anchor del lado rural.
    anchor: [-37.1738, -72.9426],
    terminal: INTERMODAL_CONCEPCION,
    sources: [
      {
        label: 'OSM relation/1622274 (Santa Juana, Biobío)',
        href: 'https://www.openstreetmap.org/relation/1622274',
      },
      {
        label: 'OSM way/135488014 (Estación Intermodal Concepción)',
        href: 'https://www.openstreetmap.org/way/135488014',
      },
    ],
  },
];

export const CORRIDOR_BY_ID = new Map(
  INTERURBAN_CORRIDORS.map((c) => [c.id, c] as const),
);
