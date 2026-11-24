import type {
  ScheduledTrip,
  SimulationConfidence,
  SimulationSourceKind,
} from '@/types/transport';

export type StaticServiceDay = 'weekday' | 'saturday' | 'sunday';
export type StaticServiceDirection = 'forward' | 'reverse';

export interface StaticServicePattern {
  id: string;
  routeId: string;
  direction: StaticServiceDirection;
  directionLabel: string;
  days: StaticServiceDay[];
  startMin: number;
  endMin: number;
  headwayMin: number;
  durationMin: number;
  sourceKind: SimulationSourceKind;
  confidence: SimulationConfidence;
  sourceLabel: string;
  sourceUrl: string;
  note: string;
  /**
   * Salidas publicadas una a una, [salidaMin, duraciónMin]. Si existe, el
   * horario se expande desde aquí y start/end/headway/duration quedan solo
   * como resumen (primera, última, intervalo y duración medianos).
   */
  trips?: ScheduledTrip[];
}

function min(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

const WEEKDAY: StaticServiceDay[] = ['weekday'];
const SATURDAY: StaticServiceDay[] = ['saturday'];
const SUNDAY: StaticServiceDay[] = ['sunday'];

// Biotrén no tiene GTFS oficial. Los patrones bt-* transcriben los itinerarios
// que EFE publica como imagen en https://www.efe.cl/itinerario-biotren/
// (vigentes desde el 15-07-2026). Cada corrida es [salida, llegada] tal como
// aparece en la primera y la última columna de la imagen; la duración sale de
// la diferencia (no es fija: 42–45 min en L2, 56–67 min en L1). En fin de
// semana las filas "Sábado" corren solo el sábado y las "Sáb/Dom" ambos días.
//
// Solo entran corridas de cabecera a cabecera: la simulación interpola cada
// viaje sobre el trazado completo, así que los servicios cortos de lunes a
// viernes quedan fuera y se nombran en la nota de cada patrón.
const EFE_VALID_FROM = '15-07-2026';
const EFE_UPLOADS = 'https://www.efe.cl/wp-content/uploads/2026/07/';

type EfeRun = readonly [departure: string, arrival: string];
type EfeWeekendRun = readonly [departure: string, arrival: string, days: 'sab' | 'sab-dom'];

function medianMin(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function efePattern(
  meta: Pick<StaticServicePattern, 'id' | 'routeId' | 'direction' | 'directionLabel' | 'days' | 'note'> & {
    itinerary: string;
    image: string;
  },
  runs: readonly EfeRun[],
): StaticServicePattern {
  const trips = runs
    .map(([departure, arrival]): ScheduledTrip => [min(departure), min(arrival) - min(departure)])
    .sort((a, b) => a[0] - b[0]);
  const starts = trips.map(([start]) => start);
  return {
    id: meta.id,
    routeId: meta.routeId,
    direction: meta.direction,
    directionLabel: meta.directionLabel,
    days: meta.days,
    startMin: starts[0],
    endMin: starts[starts.length - 1],
    headwayMin: medianMin(starts.slice(1).map((start, i) => start - starts[i])),
    durationMin: medianMin(trips.map(([, duration]) => duration)),
    sourceKind: 'official',
    confidence: 'official',
    sourceLabel: `EFE · itinerario ${meta.itinerary} · vigente desde ${EFE_VALID_FROM}`,
    sourceUrl: `${EFE_UPLOADS}${meta.image}`,
    note: meta.note,
    trips,
  };
}

function runsOn(runs: readonly EfeWeekendRun[], day: 'saturday' | 'sunday'): EfeRun[] {
  return runs
    .filter(([, , days]) => day === 'saturday' || days === 'sab-dom')
    .map(([departure, arrival]): EfeRun => [departure, arrival]);
}

// L1 · 8-L1-HQ-a-TH-scaled.jpg (lunes a viernes)
const L1_HUALQUI_MERCADO_WEEKDAY: EfeRun[] = [
  ['06:20', '07:24'], ['06:56', '07:56'], ['07:30', '08:26'], ['08:00', '08:56'],
  ['08:30', '09:26'], ['09:15', '10:11'], ['10:00', '10:56'], ['11:40', '12:37'],
  ['12:17', '13:13'], ['15:37', '16:33'], ['16:00', '16:56'], ['16:30', '17:26'],
  ['17:00', '17:56'], ['18:00', '18:56'], ['18:30', '19:26'], ['19:00', '19:56'],
  ['20:00', '21:07'], ['21:00', '21:56'], ['21:52', '22:48'],
];

// L1 · 9-L1-TH-a-QH-scaled.jpg (lunes a viernes)
const L1_MERCADO_HUALQUI_WEEKDAY: EfeRun[] = [
  ['06:31', '07:27'], ['07:01', '07:58'], ['07:31', '08:27'], ['08:01', '08:57'],
  ['08:31', '09:32'], ['09:01', '09:57'], ['10:01', '10:57'], ['11:55', '12:51'],
  ['15:01', '15:57'], ['15:31', '16:27'], ['16:01', '16:57'], ['17:01', '17:57'],
  ['17:31', '18:27'], ['18:01', '18:57'], ['19:01', '19:57'], ['19:31', '20:27'],
  ['20:01', '20:57'], ['20:55', '21:51'],
];

// L1 · 10-FDS-L1-scaled.jpg, tabla de abajo (Hualqui → Talcahuano)
const L1_HUALQUI_MERCADO_WEEKEND: EfeWeekendRun[] = [
  ['09:00', '09:56', 'sab'], ['09:27', '10:23', 'sab-dom'], ['12:17', '13:13', 'sab-dom'],
  ['16:00', '16:56', 'sab'], ['17:00', '17:56', 'sab-dom'], ['18:00', '18:56', 'sab'],
  ['19:00', '19:56', 'sab'], ['20:30', '21:26', 'sab-dom'],
];

// L1 · 10-FDS-L1-scaled.jpg, tabla de arriba (Talcahuano → Hualqui)
const L1_MERCADO_HUALQUI_WEEKEND: EfeWeekendRun[] = [
  ['08:30', '09:26', 'sab-dom'], ['10:01', '10:57', 'sab'], ['12:30', '13:26', 'sab-dom'],
  ['16:01', '16:57', 'sab-dom'], ['17:01', '17:57', 'sab'], ['18:01', '18:57', 'sab'],
  ['19:01', '19:57', 'sab'], ['20:01', '20:57', 'sab-dom'],
];

// L2 · 4-L2-CW-a-CC-scaled.jpg (punta mañana) + 5-L2-CW-a-CC-1-scaled.jpg (punta tarde)
const L2_CORONEL_CONCEPCION_WEEKDAY: EfeRun[] = [
  ['05:55', '06:40'], ['06:09', '06:54'], ['06:20', '07:05'], ['06:37', '07:22'],
  ['06:51', '07:36'], ['07:08', '07:53'], ['07:19', '08:04'], ['07:26', '08:11'],
  ['07:33', '08:18'], ['07:43', '08:28'], ['07:54', '08:39'], ['08:05', '08:50'],
  ['08:19', '09:01'], ['08:30', '09:12'], ['08:45', '09:27'], ['09:04', '09:46'],
  ['09:16', '09:58'], ['09:40', '10:22'], ['09:55', '10:37'], ['10:05', '10:47'],
  ['10:40', '11:22'], ['11:00', '11:42'], ['11:20', '12:02'], ['11:35', '12:17'],
  ['12:15', '12:57'],
  ['12:30', '13:12'], ['13:50', '14:32'], ['14:30', '15:12'], ['14:45', '15:27'],
  ['15:35', '16:17'], ['16:05', '16:47'], ['16:50', '17:32'], ['17:02', '17:44'],
  ['17:14', '17:56'], ['17:26', '18:08'], ['17:38', '18:20'], ['17:50', '18:32'],
  ['18:02', '18:44'], ['18:14', '18:56'], ['18:26', '19:08'], ['18:43', '19:25'],
  ['18:58', '19:40'], ['19:15', '19:57'], ['19:29', '20:11'], ['19:40', '20:25'],
  ['20:00', '20:42'], ['20:11', '20:56'], ['20:30', '21:12'], ['20:45', '21:27'],
  ['21:00', '21:42'], ['21:35', '22:17'], ['21:55', '22:37'],
];

// L2 · 2-L2-CC-a-CW-1-scaled.jpg (punta mañana) + 3-L2-CC-a-CW-scaled.jpg (punta tarde)
const L2_CONCEPCION_CORONEL_WEEKDAY: EfeRun[] = [
  ['06:45', '07:27'], ['06:57', '07:39'], ['07:13', '07:55'], ['07:28', '08:10'],
  ['07:44', '08:26'], ['07:56', '08:38'], ['08:19', '09:01'], ['08:31', '09:13'],
  ['08:42', '09:24'], ['08:53', '09:35'], ['09:04', '09:46'], ['09:15', '09:57'],
  ['09:30', '10:12'], ['09:50', '10:32'], ['10:05', '10:47'], ['10:30', '11:12'],
  ['11:30', '12:12'], ['11:45', '12:27'], ['12:10', '12:52'], ['12:23', '13:05'],
  ['13:00', '13:42'], ['13:15', '13:57'],
  ['14:35', '15:17'], ['15:15', '15:57'], ['15:30', '16:12'], ['16:20', '17:02'],
  ['16:40', '17:22'], ['16:55', '17:37'], ['17:12', '17:57'], ['17:24', '18:09'],
  ['17:36', '18:21'], ['17:48', '18:33'], ['18:00', '18:45'], ['18:12', '18:57'],
  ['18:24', '19:09'], ['18:36', '19:21'], ['18:48', '19:33'], ['19:00', '19:45'],
  ['19:10', '19:55'], ['19:17', '20:02'], ['19:30', '20:15'], ['19:45', '20:27'],
  ['20:00', '20:42'], ['20:15', '20:57'], ['20:30', '21:12'], ['20:45', '21:27'],
  ['21:00', '21:42'], ['21:15', '21:57'], ['21:30', '22:12'], ['21:45', '22:27'],
  ['22:25', '23:07'], ['22:50', '23:32'],
];

// L2 · 7-L2-FDS-CW-a-CC-scaled.jpg
const L2_CORONEL_CONCEPCION_WEEKEND: EfeWeekendRun[] = [
  ['06:30', '07:12', 'sab'], ['07:00', '07:42', 'sab'], ['07:30', '08:12', 'sab'],
  ['08:00', '08:42', 'sab'], ['08:30', '09:12', 'sab-dom'], ['09:00', '09:42', 'sab'],
  ['09:15', '09:57', 'sab-dom'], ['09:40', '10:22', 'sab-dom'], ['10:05', '10:47', 'sab-dom'],
  ['10:40', '11:22', 'sab'], ['11:00', '11:42', 'sab-dom'], ['11:20', '12:02', 'sab-dom'],
  ['12:15', '12:57', 'sab-dom'], ['12:30', '13:12', 'sab-dom'], ['13:50', '14:32', 'sab-dom'],
  ['14:45', '15:27', 'sab-dom'], ['15:35', '16:17', 'sab-dom'], ['16:45', '17:27', 'sab-dom'],
  ['17:15', '17:57', 'sab'], ['17:45', '18:27', 'sab-dom'], ['18:15', '18:57', 'sab-dom'],
  ['18:45', '19:27', 'sab'], ['19:15', '19:57', 'sab-dom'], ['19:45', '20:27', 'sab'],
  ['20:15', '20:57', 'sab-dom'], ['20:45', '21:27', 'sab'],
];

// L2 · 6-L2-FDS-CC-a-CW-1-scaled.jpg
const L2_CONCEPCION_CORONEL_WEEKEND: EfeWeekendRun[] = [
  ['06:45', '07:27', 'sab'], ['07:15', '07:57', 'sab'], ['07:45', '08:27', 'sab'],
  ['08:15', '08:57', 'sab'], ['08:30', '09:12', 'sab-dom'], ['08:45', '09:27', 'sab'],
  ['09:15', '09:57', 'sab-dom'], ['09:50', '10:32', 'sab'], ['10:05', '10:47', 'sab-dom'],
  ['10:30', '11:12', 'sab-dom'], ['11:30', '12:12', 'sab-dom'], ['11:45', '12:27', 'sab-dom'],
  ['12:10', '12:52', 'sab-dom'], ['13:00', '13:42', 'sab'], ['13:15', '13:57', 'sab-dom'],
  ['14:35', '15:17', 'sab-dom'], ['15:30', '16:12', 'sab-dom'], ['16:40', '17:22', 'sab-dom'],
  ['17:30', '18:12', 'sab-dom'], ['18:00', '18:42', 'sab'], ['18:30', '19:12', 'sab-dom'],
  ['19:00', '19:42', 'sab-dom'], ['19:30', '20:12', 'sab'], ['20:00', '20:42', 'sab-dom'],
  ['20:30', '21:12', 'sab'], ['21:00', '21:42', 'sab-dom'], ['21:30', '22:12', 'sab'],
];

const HUALQUI_MERCADO = { direction: 'forward', directionLabel: 'Hualqui → Mercado Talcahuano' } as const;
const MERCADO_HUALQUI = { direction: 'reverse', directionLabel: 'Mercado Talcahuano → Hualqui' } as const;
const CORONEL_CONCEPCION = { direction: 'forward', directionLabel: 'Coronel → Concepción' } as const;
const CONCEPCION_CORONEL = { direction: 'reverse', directionLabel: 'Concepción → Coronel' } as const;
const L1_WEEKEND = { itinerary: 'L1 fin de semana', image: '10-FDS-L1-scaled.jpg' } as const;
const L1_SUNDAY_NOTE =
  'Domingo solo corren las filas "Sáb/Dom" (todas son servicios Tren Laja–Talcahuano).';

const BIOTREN_PATTERNS: StaticServicePattern[] = [
  efePattern(
    {
      id: 'bt-l1-hualqui-mercado-weekday',
      routeId: 'bt-l1',
      ...HUALQUI_MERCADO,
      days: WEEKDAY,
      itinerary: 'L1 Hualqui a Talcahuano, lunes a viernes',
      image: '8-L1-HQ-a-TH-scaled.jpg',
      note:
        'Incluye 4 servicios Tren Laja–Talcahuano (08:00, 12:17, 15:37, 21:52). No incluye 6 servicios ' +
        'cortos que solo llegan hasta Arenal: desde Concepción 07:21 y 08:20; desde Leonera 08:25, ' +
        '08:55, 09:40 y 17:40.',
    },
    L1_HUALQUI_MERCADO_WEEKDAY,
  ),
  efePattern(
    {
      id: 'bt-l1-mercado-hualqui-weekday',
      routeId: 'bt-l1',
      ...MERCADO_HUALQUI,
      days: WEEKDAY,
      itinerary: 'L1 Talcahuano a Hualqui, lunes a viernes',
      image: '9-L1-TH-a-QH-scaled.jpg',
      note:
        'Incluye 4 servicios Tren Laja–Talcahuano (07:01, 08:01, 11:55, 20:55). No incluye 5 servicios ' +
        'parciales: Concepción → Leonera 07:45 y 08:15; Arenal → Leonera 08:45; Arenal → Hualqui ' +
        '08:15 y 16:30.',
    },
    L1_MERCADO_HUALQUI_WEEKDAY,
  ),
  efePattern(
    {
      id: 'bt-l1-hualqui-mercado-saturday',
      routeId: 'bt-l1',
      ...HUALQUI_MERCADO,
      ...L1_WEEKEND,
      days: SATURDAY,
      note: 'Sábado: filas "Sábado" y "Sáb/Dom" de la tabla Hualqui a Talcahuano.',
    },
    runsOn(L1_HUALQUI_MERCADO_WEEKEND, 'saturday'),
  ),
  efePattern(
    {
      id: 'bt-l1-mercado-hualqui-saturday',
      routeId: 'bt-l1',
      ...MERCADO_HUALQUI,
      ...L1_WEEKEND,
      days: SATURDAY,
      note: 'Sábado: filas "Sábado" y "Sáb/Dom" de la tabla Talcahuano a Hualqui.',
    },
    runsOn(L1_MERCADO_HUALQUI_WEEKEND, 'saturday'),
  ),
  efePattern(
    {
      id: 'bt-l1-hualqui-mercado-sunday',
      routeId: 'bt-l1',
      ...HUALQUI_MERCADO,
      ...L1_WEEKEND,
      days: SUNDAY,
      note: L1_SUNDAY_NOTE,
    },
    runsOn(L1_HUALQUI_MERCADO_WEEKEND, 'sunday'),
  ),
  efePattern(
    {
      id: 'bt-l1-mercado-hualqui-sunday',
      routeId: 'bt-l1',
      ...MERCADO_HUALQUI,
      ...L1_WEEKEND,
      days: SUNDAY,
      note: L1_SUNDAY_NOTE,
    },
    runsOn(L1_MERCADO_HUALQUI_WEEKEND, 'sunday'),
  ),
  efePattern(
    {
      id: 'bt-l2-coronel-concepcion-weekday',
      routeId: 'bt-l2',
      ...CORONEL_CONCEPCION,
      days: WEEKDAY,
      itinerary: 'L2 Coronel a Concepción, lunes a viernes',
      image: '4-L2-CW-a-CC-scaled.jpg',
      note:
        `Punta mañana (esta imagen) más punta tarde (${EFE_UPLOADS}5-L2-CW-a-CC-1-scaled.jpg). ` +
        'No incluye 2 salidas parciales hacia Concepción: Los Canelos 06:37 y Cristo Redentor 07:04.',
    },
    L2_CORONEL_CONCEPCION_WEEKDAY,
  ),
  efePattern(
    {
      id: 'bt-l2-concepcion-coronel-weekday',
      routeId: 'bt-l2',
      ...CONCEPCION_CORONEL,
      days: WEEKDAY,
      itinerary: 'L2 Concepción a Coronel, lunes a viernes',
      image: '2-L2-CC-a-CW-1-scaled.jpg',
      note: `Punta mañana (esta imagen) más punta tarde (${EFE_UPLOADS}3-L2-CC-a-CW-scaled.jpg).`,
    },
    L2_CONCEPCION_CORONEL_WEEKDAY,
  ),
  efePattern(
    {
      id: 'bt-l2-coronel-concepcion-saturday',
      routeId: 'bt-l2',
      ...CORONEL_CONCEPCION,
      days: SATURDAY,
      itinerary: 'L2 Coronel a Concepción, fin de semana',
      image: '7-L2-FDS-CW-a-CC-scaled.jpg',
      note: 'Sábado: filas "Sábado" y "Sáb/Dom".',
    },
    runsOn(L2_CORONEL_CONCEPCION_WEEKEND, 'saturday'),
  ),
  efePattern(
    {
      id: 'bt-l2-concepcion-coronel-saturday',
      routeId: 'bt-l2',
      ...CONCEPCION_CORONEL,
      days: SATURDAY,
      itinerary: 'L2 Concepción a Coronel, fin de semana',
      image: '6-L2-FDS-CC-a-CW-1-scaled.jpg',
      note: 'Sábado: filas "Sábado" y "Sáb/Dom".',
    },
    runsOn(L2_CONCEPCION_CORONEL_WEEKEND, 'saturday'),
  ),
  efePattern(
    {
      id: 'bt-l2-coronel-concepcion-sunday',
      routeId: 'bt-l2',
      ...CORONEL_CONCEPCION,
      days: SUNDAY,
      itinerary: 'L2 Coronel a Concepción, fin de semana',
      image: '7-L2-FDS-CW-a-CC-scaled.jpg',
      note: 'Domingo solo corren las filas "Sáb/Dom".',
    },
    runsOn(L2_CORONEL_CONCEPCION_WEEKEND, 'sunday'),
  ),
  efePattern(
    {
      id: 'bt-l2-concepcion-coronel-sunday',
      routeId: 'bt-l2',
      ...CONCEPCION_CORONEL,
      days: SUNDAY,
      itinerary: 'L2 Concepción a Coronel, fin de semana',
      image: '6-L2-FDS-CC-a-CW-1-scaled.jpg',
      note: 'Domingo solo corren las filas "Sáb/Dom".',
    },
    runsOn(L2_CONCEPCION_CORONEL_WEEKEND, 'sunday'),
  ),
];

// Los interurbanos 201/401/411/421 tuvieron aquí ventanas comunitarias
// estimadas; ahora salen del GTFS oficial DTPR con horarios viaje a viaje.
export const STATIC_SERVICE_PATTERNS: StaticServicePattern[] = BIOTREN_PATTERNS;
