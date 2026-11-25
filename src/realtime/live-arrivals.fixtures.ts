// Respuestas de ejemplo de stopInfo con la forma real de la fuente (campos
// comprobados el 24-nov-2026) y valores inventados: patentes, viajes y
// equipos GPS de mentira. Las usan las pruebas y el smoke con navegador (que
// intercepta /api/stop-arrivals): ningún test consulta la fuente real.
//
// `withBuses` trae 3 micros con GPS y posición (las que van al mapa), una
// estimada sin GPS (`realtime: false`), una con GPS sin señal (0,0) y una que
// espera en la cabecera: su viaje sale en 12 min, pero la fuente le da 8 min
// de llegada (lo que pasó en el paradero P20318 con la 201).
//
// El tripId lleva la hora de salida del viaje en hora de Chile, relativa a
// `nowSeconds` (ver tripDeparture en live-arrivals.ts). Import relativo: el
// smoke con navegador carga este archivo con Node, sin el alias "@/".

import { chileClock } from '../lib/chile-time.ts';

function tripId(route: string, direction: 'I' | 'R', nowSeconds: number, departsInMin: number): string {
  const minutes = Math.floor(chileClock(new Date((nowSeconds + departsInMin * 60) * 1000)).minutes);
  const hhmm = `${String(Math.floor(minutes / 60)).padStart(2, '0')}${String(minutes % 60).padStart(2, '0')}`;
  return `${route}_${direction}_L_${hhmm}`;
}

function prediction(
  nowSeconds: number,
  fields: {
    route: string;
    direction: 'I' | 'R';
    inSeconds: number;
    timeLabel: string;
    distance: number;
    lat: number;
    lng: number;
    plate: string;
    /** Salida del viaje desde la cabecera, en minutos desde ahora (negativo: ya salió). */
    departsInMin: number;
    realtime?: boolean;
  },
) {
  return {
    routeId: '9001',
    tripId: tripId(fields.route, fields.direction, nowSeconds, fields.departsInMin),
    route: fields.route,
    direction: fields.direction,
    epochTime: nowSeconds + fields.inSeconds,
    timeLabel: fields.timeLabel,
    realtime: fields.realtime ?? true,
    resourceId: -1,
    distanceLabel: `${(fields.distance / 1000).toFixed(2)}Km`,
    distance: fields.distance,
    latitude: fields.lat,
    longitude: fields.lng,
    events: [],
    licensePlate: fields.plate,
    machineId: '00000000-0000-4000-8000-000000000000',
  };
}

export function stopInfoFixtures(nowSeconds: number) {
  return {
    withBuses: {
      events: [],
      alerts: [],
      routeInfo: [{ servicio: '11R', msg: 'Bus pasa cada 10 minutos aprox.' }],
      predictions: [
        prediction(nowSeconds, {
          route: '30Q',
          direction: 'I',
          inSeconds: 4 * 60 + 10,
          timeLabel: '3 a 5 min',
          distance: 1450.4,
          lat: -36.8205,
          lng: -73.0402,
          plate: 'PRUE10',
          departsInMin: -25,
        }),
        prediction(nowSeconds, {
          route: '62H',
          direction: 'I',
          inSeconds: 40,
          timeLabel: 'Llegando',
          distance: 210.7,
          lat: -36.8262,
          lng: -73.0497,
          plate: 'PRUE20',
          departsInMin: -38,
        }),
        prediction(nowSeconds, {
          route: '30Q',
          direction: 'I',
          inSeconds: 19 * 60,
          timeLabel: '17 a 21 min',
          distance: 6890,
          lat: -36.7951,
          lng: -73.0611,
          plate: 'PRUE30',
          departsInMin: -10,
        }),
        prediction(nowSeconds, {
          route: '62H',
          direction: 'I',
          inSeconds: 6 * 60,
          timeLabel: '5 a 7 min',
          distance: 2300,
          lat: -36.8301,
          lng: -73.0602,
          plate: 'PRUE21',
          departsInMin: -30,
          realtime: false,
        }),
        prediction(nowSeconds, {
          route: '30Q',
          direction: 'I',
          inSeconds: 25 * 60,
          timeLabel: '+ de 21 min',
          distance: 9100,
          lat: 0,
          lng: 0,
          plate: 'PRUE40',
          departsInMin: -5,
        }),
        prediction(nowSeconds, {
          route: '30Q',
          direction: 'I',
          inSeconds: 8 * 60,
          timeLabel: '7 a 9 min',
          distance: 5200,
          lat: -36.7712,
          lng: -73.0838,
          plate: 'PRUE50',
          departsInMin: 12,
        }),
      ],
    },
    empty: { events: [], alerts: [], predictions: [], routeInfo: [] },
    noLiveData: {
      events: [],
      alerts: [
        {
          author: 'Red',
          message:
            '<div>🚨 <strong>Alerta GPS</strong>: Servicio <strong>201AU (Regreso)</strong> no está enviando información en tiempo real.</div>',
          externalId: 'x',
          urlImage: '',
          useful: 0,
          useless: 0,
        },
      ],
      routeInfo: [{ servicio: '201AUR', msg: 'Bus pasa cada 1 hora aprox.' }],
      predictions: [],
    },
    unreadable: { events: [], alerts: [], predictions: 'sin datos' },
  };
}
