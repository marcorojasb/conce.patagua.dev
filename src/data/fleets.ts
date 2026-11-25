// Flotas reales de las líneas donde la DTPR publica la cifra. Sirven para no
// dibujar en el modo Horario más micros que buses (el programa a intervalo fijo
// del GTFS pide muchas más) y para cotejar el GTFS en la calidad de datos.
//
// - Solo entran cifras oficiales de la DTPR, leídas en el documento citado. La
//   planilla pública «Flota P.E. 2024», de autor no identificado, no se usa.
// - Las ids son las del GTFS «Gran Concepción20250228»: si cambian,
//   data:validate falla («Flota curada con recorrido inexistente»).
// - Para la 201 se usa la cifra oficial de 23, aunque la prensa de jul-2026
//   habla de 25 en operación.
// - Las fichas no miden igual: en UN11 y UN63 la cifra es la flota total,
//   con la sobreflota (reserva) incluida; en UN80 es la flota mínima del
//   programa normal y la comparte con la 80BV, que no está en el GTFS. Es un
//   tope, no la cantidad de micros en la calle.
//
// Sin imports: data-quality.ts carga este archivo con Node.

export interface KnownFleet {
  id: string;
  /** Cómo se nombra en un texto: "la 201 y la 201-AU". */
  label: string;
  /** Recorridos del GTFS que comparten la flota (código en comentario). */
  routeIds: readonly string[];
  buses: number;
  sourceLabel: string;
  sourceUrl: string;
}

const FICHA_BIOBIO_2026 = {
  sourceLabel: 'DTPR · Ficha Biobío 2026 (jun-2026)',
  sourceUrl: 'https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf',
};

export const KNOWN_FLEETS: readonly KnownFleet[] = [
  {
    id: 'santa-juana',
    label: 'la 201 y la 201-AU',
    routeIds: [
      'gtfs-route-949', // 201
      'gtfs-route-950', // 201-AU
    ],
    buses: 23,
    ...FICHA_BIOBIO_2026,
  },
  {
    id: 'tome',
    label: 'la 401, 401Y, 411 y 421 (Tomé)',
    routeIds: [
      'gtfs-route-540', // 401
      'gtfs-route-544', // 401Y
      'gtfs-route-541', // 411
      'gtfs-route-693', // 421
    ],
    // Un buscador citó 64 en una versión anterior de la ficha (mar/abr-2026), no leída.
    buses: 65,
    ...FICHA_BIOBIO_2026,
  },
  {
    id: 'un11',
    label: 'la línea 11 (Vía Futuro)',
    routeIds: [
      'gtfs-route-871', // 11C
      'gtfs-route-873', // 11EQ
      'gtfs-route-874', // 11FR
      'gtfs-route-872', // 11M
    ],
    // Flota total con la reserva: la ficha imprime mínima 59, sobreflota 7 y
    // total 68 (no suman; se usa el total impreso).
    buses: 68,
    sourceLabel: 'DTPR · ficha de modificación del programa UN11 (sep-2026)',
    sourceUrl: 'https://dtpr.gob.cl/wp-content/uploads/2026/09/UN11-FICHA-MODIFICACION-2026-09.pdf',
  },
  {
    id: 'un63',
    label: 'la línea 63 (Rengo Lientur)',
    routeIds: [
      'gtfs-route-856', // 63FH
      'gtfs-route-857', // 63IG
      'gtfs-route-858', // 63KP
      'gtfs-route-859', // 63LB
    ],
    // Flota total con la reserva: 52 de flota mínima + 11 de sobreflota.
    buses: 63,
    sourceLabel: 'DTPR · ficha de recepción UN63 (jun-2026)',
    sourceUrl: 'https://dtpr.gob.cl/wp-content/uploads/2026/06/FICHA-DE-RECEPCION-UN63-JUNIO-2026.pdf',
  },
  {
    id: 'un80',
    label: 'la línea 80 (Las Galaxias)',
    routeIds: [
      'gtfs-route-820', // 80H
      'gtfs-route-817', // 80J
      'gtfs-route-943', // 80J-Y
      'gtfs-route-819', // 80K
      'gtfs-route-821', // 80L
      'gtfs-route-818', // 80Q
      'gtfs-route-822', // 80Z
    ],
    // Flota mínima del programa normal, sin reserva, para 80JQ, 80KH, 80LZ, 80J-Y
    // y la 80BV, que no está en el GTFS. La 80TC (tampoco en el GTFS) suma 9:
    // 106 en total.
    buses: 97,
    sourceLabel: 'DTPR · ficha de modificación del programa UN80 (sep-2026)',
    sourceUrl: 'https://dtpr.gob.cl/wp-content/uploads/2026/09/FICHA-MODIFICACION-PO-UN80_v_final.pdf',
  },
];

export function knownFleetOfRoute(routeId: string): KnownFleet | null {
  return KNOWN_FLEETS.find((fleet) => fleet.routeIds.includes(routeId)) ?? null;
}

/** Buses inscritos en todo el perímetro urbano: la red "GTFS Gran Concepción" del feed. */
export const URBAN_PERIMETER_FLEET: {
  network: 'GTFS Gran Concepción';
  buses: 1894;
  label: string;
  sourceLabel: string;
  sourceUrl: string;
} = {
  network: 'GTFS Gran Concepción',
  buses: 1894,
  label: 'el Perímetro de Exclusión del Gran Concepción',
  ...FICHA_BIOBIO_2026,
};
