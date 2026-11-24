// Reglas puras para convertir el GTFS oficial de DTPR al modelo del visor.
// Viven separadas de scripts/sync-gtfs-official.ts para poder probarlas sin
// leer el zip.

/** Colapsa espacios repetidos: el feed trae "23S -  Av. Michaihue". */
export function cleanText(value: string | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

/** "20240101" → "2024-01-01". */
export function formatGtfsDate(value: string | undefined): string | null {
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec((value ?? '').trim());
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

/** DTPR versiona como "Gran Concepción20250228": la fecha va pegada al final. */
export function feedVersionDate(version: string | undefined): string | null {
  const match = /(\d{8})\s*$/.exec(version ?? '');
  return match ? formatGtfsDate(match[1]) : null;
}

// Un stop_code de verdad es corto y lleva dígitos. En unos pocos paraderos
// DTPR puso ahí las calles entre las que está ("Entre San Martin y Bulnes")
// y un hito en stop_name ("Plaza de Armas"): eso es parte del nombre, no un
// código.
const STOP_CODE_RE = /^[A-Z]{0,4}-?\d+[A-Z]?$/i;

export function stopNameAndRef(
  stopName: string | undefined,
  stopCode: string | undefined,
  stopId: string,
): { name: string; ref?: string } {
  const name = cleanText(stopName);
  const code = cleanText(stopCode);
  if (!code) return { name: name || `Paradero ${stopId}` };
  if (STOP_CODE_RE.test(code)) return { name: name || `Paradero ${code}`, ref: code };
  return { name: name ? `${name} (${code})` : code };
}

// Código de variante que se ve en el letrero de la micro: "10P", "02K",
// "B02", "201", "201-AU". "XXI" (Vía Siglo XXI) no califica: no tiene dígitos.
const VARIANT_RE = /^[A-Z]?\d{1,3}[A-Z]{0,2}(?:-[A-Z]{1,2})?$/;

export interface ParsedHeadsign {
  operator?: string;
  variant?: string;
  destination: string;
}

/**
 * El trip_headsign de DTPR es "<operador> <variante> - <destino>"
 * ("Vía Láctea 10P - Leonera"). Los interurbanos traen solo la variante
 * ("201-AU - Santa Juana") o solo el destino ("Concepción").
 */
export function parseHeadsign(headsign: string): ParsedHeadsign {
  const text = cleanText(headsign);
  const split = /^(.*?)\s+-\s+(.*)$/.exec(text);
  if (!split) return { destination: text };
  const tokens = split[1].split(' ');
  const last = tokens[tokens.length - 1];
  if (!VARIANT_RE.test(last)) return { destination: split[2] };
  const operator = tokens.slice(0, -1).join(' ');
  return {
    ...(operator ? { operator } : {}),
    variant: last,
    destination: split[2],
  };
}

// Letreros cruzados entre sentidos en el feed DTPR «Gran Concepción20250228».
// En 02AD y 02KP solo la variante está invertida (el viaje del sentido 0 dice
// "02D - Mirador del Pacífico" y termina en Pingueral, que es la 02A); en
// 23BS está invertido el letrero completo (el sentido 0 termina en el
// Terminal Collao pero dice "23S - Av. Michaihue"). Lo confirman el orden de
// letras del código (la primera es el sentido 0), los paraderos extremos de
// cada sentido y la red que publica la app de Transapp/DTPR (nov-2026).
// Solo se corrige si el letrero viene cruzado: un feed corregido pasa tal cual.
const CROSSED_HEADSIGNS: Readonly<Record<string, { destinations?: readonly [string, string] }>> = {
  '02AD': {},
  '02KP': {},
  '23BS': { destinations: ['Terminal Collao', 'Av. Michaihue'] },
};

export function correctTripHeadsign(ref: string, directionId: 0 | 1, headsign: string): string {
  const fix = CROSSED_HEADSIGNS[ref];
  const pair = /^(\d{2})([A-Z])([A-Z])$/.exec(ref);
  if (!fix || !pair) return headsign;
  const parsed = parseHeadsign(headsign);
  const expected = pair[1] + (directionId === 0 ? pair[2] : pair[3]);
  const crossed = pair[1] + (directionId === 0 ? pair[3] : pair[2]);
  if (parsed.variant !== crossed) return headsign;
  const destination = fix.destinations?.[directionId] ?? parsed.destination;
  return `${parsed.operator ? `${parsed.operator} ` : ''}${expected} - ${destination}`;
}

/** Operador de la ruta solo si todos los headsigns que lo traen coinciden. */
export function routeOperator(headsigns: Iterable<string>): string | undefined {
  const operators = new Set<string>();
  for (const headsign of headsigns) {
    const { operator } = parseHeadsign(headsign);
    if (operator) operators.add(operator);
  }
  return operators.size === 1 ? [...operators][0] : undefined;
}

export const URBAN_NETWORK = 'GTFS Gran Concepción';

// Servicios interurbanos que DTPR publica en el mismo feed que la red urbana
// (route_short_name → etiqueta). La UI agrupa por el prefijo "Interurbano".
// Curado a mano: el feed no distingue urbanos de interurbanos.
export const INTERURBAN_NETWORK_BY_REF: Readonly<Record<string, string>> = {
  '201': 'Interurbano Santa Juana',
  '201-AU': 'Interurbano Santa Juana',
  '401': 'Interurbano Tomé',
  '401Y': 'Interurbano Tomé',
  '411': 'Interurbano Tomé', // Dichato, por Tomé
  '421': 'Interurbano Tomé',
  '302': 'Interurbano Lota',
  '304': 'Interurbano Lota',
};

export function routeNetwork(ref: string): string {
  return INTERURBAN_NETWORK_BY_REF[ref] ?? URBAN_NETWORK;
}

const WEEKDAY_COLUMNS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

/** Fila de calendar.txt → 7 días (0 = lunes … 6 = domingo). */
export function serviceDaysFromCalendar(row: Record<string, string>): boolean[] {
  return WEEKDAY_COLUMNS.map((column) => {
    const value = (row[column] ?? '').trim();
    if (value !== '0' && value !== '1') {
      throw new Error(`calendar.txt: ${column}="${row[column]}" en service_id ${row.service_id}`);
    }
    return value === '1';
  });
}

/** Máxima duración razonable de un viaje; más que esto es un dato roto. */
export const MAX_TRIP_MINUTES = 6 * 60;

export interface TripWindowAccumulator {
  timedStops: number;
  firstSequence: number;
  firstDeparture: number | null;
  lastSequence: number;
  lastArrival: number | null;
}

export function emptyTripWindow(): TripWindowAccumulator {
  return {
    timedStops: 0,
    firstSequence: Infinity,
    firstDeparture: null,
    lastSequence: -Infinity,
    lastArrival: null,
  };
}

/**
 * Suma una fila de stop_times (en cualquier orden) a la ventana del viaje:
 * salida de la primera parada con hora → llegada de la última con hora. Las
 * horas vacías se ignoran (no son 00:00).
 */
export function addTripStopTime(
  acc: TripWindowAccumulator,
  sequence: number,
  arrival: number | null,
  departure: number | null,
): void {
  if (arrival === null && departure === null) return;
  acc.timedStops += 1;
  if (departure !== null && sequence < acc.firstSequence) {
    acc.firstSequence = sequence;
    acc.firstDeparture = departure;
  }
  if (arrival !== null && sequence > acc.lastSequence) {
    acc.lastSequence = sequence;
    acc.lastArrival = arrival;
  }
}

export type TripDropReason = 'sin horas' | 'duración ≤ 0' | 'duración > 6 h';

export type TripWindow =
  | { ok: true; startMin: number; durationMin: number }
  | { ok: false; reason: TripDropReason };

export function finishTripWindow(acc: TripWindowAccumulator): TripWindow {
  if (acc.firstDeparture === null || acc.lastArrival === null) return { ok: false, reason: 'sin horas' };
  const durationMin = Math.round((acc.lastArrival - acc.firstDeparture) / 60);
  if (durationMin <= 0) return { ok: false, reason: 'duración ≤ 0' };
  if (durationMin > MAX_TRIP_MINUTES) return { ok: false, reason: 'duración > 6 h' };
  return { ok: true, startMin: Math.floor(acc.firstDeparture / 60), durationMin };
}

/** Clave con más apariciones; empate → la menor (salida estable entre corridas). */
export function mostCommonKey(counts: ReadonlyMap<string, number>): string | undefined {
  let best: string | undefined;
  let bestCount = -1;
  for (const [key, count] of counts) {
    if (count > bestCount || (count === bestCount && best !== undefined && key < best)) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Pasadas (minutos desde medianoche, pueden pasar de 1440) de una
 * ruta/headsign por un paradero en un día → [primera, última, intervalo
 * mediano, cantidad]. Mismas reglas que el extractor sqlite anterior: se
 * deduplican minutos y solo cuentan intervalos de 1 a 180 min.
 */
export function serviceWindow(minutes: readonly number[]): [number, number, number, number] | null {
  const unique = Array.from(new Set(minutes)).sort((a, b) => a - b);
  if (unique.length === 0) return null;
  const gaps: number[] = [];
  for (let i = 1; i < unique.length; i++) {
    const gap = unique[i] - unique[i - 1];
    if (gap > 0 && gap <= 180) gaps.push(gap);
  }
  return [unique[0], unique[unique.length - 1], median(gaps), unique.length];
}
