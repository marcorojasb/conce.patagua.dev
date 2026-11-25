// Cómo se conocen las micros: datos curados a mano (no se generan).
//
// En el Gran Concepción la "línea" es la empresa, la unidad de negocio (UN)
// con su número: la prensa escribe "la línea 14 de microbuses Chiguayante
// Sur", "línea 56 Base Naval" o solo "Las Galaxias". El recorrido es el
// servicio del letrero (número + letra + destino: "10A Centinela").
//
// El GTFS de la DTPR no trae empresas (agency.txt solo dice "DTPR"): el
// operador sale del prefijo del letrero, que a veces no es el nombre
// comercial ("Buses Condor" sin tilde, "Ruta del Mar" para la 31 y la 32,
// que son empresas distintas, y la 50 con dos nombres). Por eso el nombre
// de cada línea sale de aquí y no del letrero, en la lista y también en las
// fichas y el comparador de operadores (src/data/routes.ts).
//
// Fuentes: Wikipedia, "Perímetro de Exclusión del Gran Concepción" (tabla de
// unidades de negocio y servicios; cita la Res. Ex. DTPR 2166/2023, manual de
// normas gráficas), y la prensa regional: BioBioChile (11-11-2019,
// 01-02-2020, 04-03-2024), Diario Concepción (01-04-2024), Chilevisión
// (30-06-2025), CNN Chile (27-11-2025) y Diario Oficial (Res. Ex. 2044/2025,
// "Unidad de Negocios Nº 60"). Las comunas cuadran con los destinos de cada
// sentido en el GTFS.

export interface BusLine {
  /** Número de la unidad de negocio: "02", "10", "B0" (Biobús). */
  number: string;
  /** Nombre con que la nombran la prensa y la gente. */
  name: string;
  /** Comunas que recorre; la primera y la última son los extremos que muestra la lista. */
  communes: readonly string[];
  /** Otras formas del nombre (prensa, razón social, letrero del GTFS) para la búsqueda. */
  aliases?: readonly string[];
  /**
   * La línea junta empresas distintas: cada recorrido conserva la de su
   * letrero en las fichas y el comparador (la 50: Buses Campanil o Denavi Sur).
   */
  operatorPerRoute?: true;
}

const CHIGUAYANTE_TALCAHUANO = ['Chiguayante', 'Concepción', 'Talcahuano'];
const SAN_PEDRO_CONCEPCION = ['San Pedro de la Paz', 'Concepción'];
const HUALPEN_CONCEPCION = ['Hualpén', 'Concepción'];

export const BUS_LINES: readonly BusLine[] = [
  { number: '02', name: 'Hualpensan', communes: ['Hualpén', 'Talcahuano'], aliases: ['Buses Hualpensan'] },
  { number: '10', name: 'Vía Láctea', communes: CHIGUAYANTE_TALCAHUANO },
  { number: '11', name: 'Vía Futuro', communes: CHIGUAYANTE_TALCAHUANO },
  {
    number: '12',
    name: 'Sotrapel',
    communes: ['Chiguayante', 'Concepción', 'Hualpén', 'Talcahuano'],
    aliases: ['Nueva Sotrapel'],
  },
  { number: '13', name: 'Vía Siglo XXI', communes: CHIGUAYANTE_TALCAHUANO, aliases: ['Siglo XXI'] },
  { number: '14', name: 'Chiguayante Sur', communes: CHIGUAYANTE_TALCAHUANO },
  { number: '16', name: 'Vía Universo', communes: CHIGUAYANTE_TALCAHUANO },
  {
    number: '17',
    name: 'Expresos Chiguayante',
    communes: ['Chiguayante', 'Concepción', 'Penco'],
    aliases: ['Expreso Chiguayante'],
  },
  // Número de los 10, pero su terminal está en la zona Hualqui.
  { number: '18', name: 'Buses Palomares', communes: ['Hualqui', 'Chiguayante', 'Concepción'] },
  { number: '20', name: 'Nueva Llacolén', communes: ['San Pedro de la Paz', 'Concepción', 'Talcahuano'] },
  { number: '21', name: 'Riviera Biobío', communes: SAN_PEDRO_CONCEPCION, aliases: ['Riviera Bio Bío'] },
  // "Buses" la separa de la comuna y de la 23.
  { number: '22', name: 'Buses San Pedro', communes: SAN_PEDRO_CONCEPCION },
  { number: '23', name: 'San Pedro del Mar', communes: SAN_PEDRO_CONCEPCION, aliases: ['Buses San Pedro del Mar'] },
  { number: '24', name: 'San Remo', communes: SAN_PEDRO_CONCEPCION },
  // Ruta Las Playas S.A. también opera la UN 50 (Campanil), que es otra línea.
  { number: '30', name: 'Ruta Las Playas', communes: ['Penco', 'Concepción', 'Hualpén', 'Talcahuano'] },
  // La 31 y la 32 son empresas distintas aunque el letrero del GTFS diga
  // "Ruta del Mar" en las dos: Wikipedia llama "Buses Ruta del Mar" a la 32.
  { number: '31', name: 'Ruta del Mar', communes: ['Penco', 'Concepción', 'Talcahuano'] },
  { number: '32', name: 'Buses Ruta del Mar', communes: ['Penco', 'Concepción', 'Talcahuano'] },
  { number: '40', name: 'Las Golondrinas', communes: ['Hualpén', 'Concepción', 'San Pedro de la Paz'] },
  { number: '41', name: 'Mini Verde', communes: HUALPEN_CONCEPCION, aliases: ['Buses Mini Verde'] },
  { number: '42', name: 'Buses Hualpencillo', communes: HUALPEN_CONCEPCION, aliases: ['Mini Buses Hualpencillo'] },
  { number: '43', name: 'Flota Las Lilas', communes: HUALPEN_CONCEPCION },
  { number: '44', name: 'Flota Centauro', communes: HUALPEN_CONCEPCION },
  // La UN 50 es Buses Campanil; la 50YP reemplazó a la 57YP de Denavi Sur y
  // en el GTFS sigue con ese letrero. Cada fila dice cuál es cuál.
  {
    number: '50',
    name: 'Campanil y Denavi Sur',
    communes: ['Talcahuano', 'Concepción', 'Penco'],
    aliases: ['Buses Campanil', 'Denavi Sur'],
    operatorPerRoute: true,
  },
  { number: '52', name: 'Géminis Sur', communes: ['Talcahuano', 'Concepción'], aliases: ['Buses Géminis Sur'] },
  { number: '56', name: 'Base Naval', communes: ['Talcahuano', 'Concepción'] },
  { number: '60', name: 'Buses Tucapel', communes: ['Concepción', 'Hualpén'] },
  { number: '62', name: 'Mi Expreso', communes: ['Talcahuano', 'Concepción', 'Penco'] },
  { number: '63', name: 'Rengo Lientur', communes: ['Concepción', 'San Pedro de la Paz'] },
  { number: '65', name: 'Buses Cóndor', communes: ['Concepción', 'Hualpén'] },
  { number: '70', name: 'Las Bahías', communes: ['Concepción', 'Talcahuano'] },
  { number: '71', name: 'Buses Puchacay', communes: ['Concepción', 'Hualpén'] },
  { number: '72', name: 'Pedro de Valdivia', communes: ['Concepción'] },
  { number: '80', name: 'Las Galaxias', communes: ['Hualqui', 'Chiguayante', 'Concepción', 'Talcahuano'] },
  { number: '81', name: 'Vía del Sol', communes: ['Hualqui', 'Chiguayante', 'Concepción', 'Hualpén', 'Talcahuano'] },
  { number: '90', name: 'Nueva Sol Yet', communes: HUALPEN_CONCEPCION },
  // UN B0, la única con micros naranjas; sus servicios son B01 y B02.
  { number: 'B0', name: 'Biobús', communes: ['Concepción', 'Talcahuano'] },
];

export interface InterurbanNetwork {
  /** Red del GTFS ("Interurbano Tomé"). */
  network: string;
  /** Destino con que se conoce el corredor desde Concepción. */
  name: string;
  /** Operador con fuente; null si no hay una que lo confirme. */
  operator: string | null;
}

export const INTERURBAN_NETWORKS: readonly InterurbanNetwork[] = [
  // 201 y 201-AU: contrato con el MTT de la Sociedad de Transporte de
  // Pasajeros Santa Juana SpA (Diario Concepción, 30-01-2024).
  { network: 'Interurbano Santa Juana', name: 'Santa Juana', operator: 'Transportes Santa Juana' },
  // 302 y 304: el GTFS no trae operador y no hay fuente que lo relacione con
  // estos códigos (la wiki lo deja pendiente).
  { network: 'Interurbano Lota', name: 'Lota', operator: null },
  // 401, 401Y, 411 y 421: el Perímetro de Exclusión de Tomé tiene un solo
  // contrato, con la Sociedad de Transportes Tomé SpA (UNBT). DTPR, Res. Ex.
  // 2731/2026 (modifica la Res. 22/2021) e Informe Tomé (índices UNBT 401 y 411).
  { network: 'Interurbano Tomé', name: 'Tomé', operator: 'Transportes Tomé' },
];

/** Operador de un interurbano por su red del GTFS; undefined si no hay uno confirmado. */
export function interurbanOperator(network: string | undefined): string | undefined {
  return INTERURBAN_NETWORKS.find((c) => c.network === network)?.operator ?? undefined;
}
