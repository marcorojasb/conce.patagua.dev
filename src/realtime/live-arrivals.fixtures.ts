// Respuestas de ejemplo de stopInfo con la forma real de la fuente y valores
// inventados. Las usan las pruebas y el smoke con navegador (que intercepta
// /api/stop-arrivals): ningún test consulta la fuente real.

export function stopInfoFixtures(nowSeconds: number) {
  return {
    withBuses: {
      events: [],
      alerts: [],
      routeInfo: [
        { servicio: '30QI', msg: 'Bus pasa cada 10 min aprox.' },
        { servicio: '62HR', msg: 'Bus pasa cada 15 min aprox.' },
      ],
      predictions: [
        {
          route: '30Q',
          direction: 'I',
          epochTime: nowSeconds + 4 * 60 + 10,
          timeLabel: '3 a 5 min',
          distance: 1450.4,
        },
        {
          route: '62H',
          direction: 'R',
          epochTime: nowSeconds + 40,
          timeLabel: 'Llegando',
          distance: 210.7,
        },
        {
          route: '30Q',
          direction: 'I',
          epochTime: nowSeconds + 19 * 60,
          timeLabel: '17 a 21 min',
          distance: 6890,
        },
      ],
    },
    empty: { events: [], alerts: [], predictions: [] },
    noLiveData: {
      events: [],
      alerts: [
        {
          author: 'DTPR',
          message:
            '<div>🚨 <strong>Alerta GPS</strong>: Servicio <strong>201 (Ida)</strong> no está enviando información en tiempo real.</div>',
        },
      ],
      routeInfo: [{ servicio: '201I', msg: 'Bus pasa cada 1 hora aprox.' }],
      predictions: [],
    },
    unreadable: { events: [], alerts: [], predictions: 'sin datos' },
  };
}
