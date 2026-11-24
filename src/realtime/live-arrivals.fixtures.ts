// Respuestas de ejemplo de stopInfo con la forma real de la fuente (campos
// comprobados el 24-nov-2026) y valores inventados: patentes, viajes y
// equipos GPS de mentira. Las usan las pruebas y el smoke con navegador (que
// intercepta /api/stop-arrivals): ningún test consulta la fuente real.
//
// `withBuses` trae 3 micros con GPS y posición (las que van al mapa), una
// estimada sin GPS (`realtime: false`) y una con GPS sin señal (0,0).

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
    trip: string;
    realtime?: boolean;
  },
) {
  return {
    routeId: '9001',
    tripId: fields.trip,
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
          trip: '30Q_I_L_1310',
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
          trip: '62H_I_L_1325',
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
          trip: '30Q_I_L_1250',
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
          trip: '62H_I_L_1340',
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
          trip: '30Q_I_L_1235',
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
