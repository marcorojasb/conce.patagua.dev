// Respuestas de ejemplo de /api/route-vehicles con la forma que entrega la
// intermediaria (fuente comprobada el 24-nov-2026) y valores inventados:
// patentes "PRUE5x" de mentira y posiciones sobre los trazados del GTFS. Las
// usan las pruebas y el smoke con navegador (que intercepta
// /api/route-vehicles): ningún test consulta la fuente real.
//
// - 24F:R (24MF, sentido 1): 2 micros al día, una vieja (4 min) y una vencida (7 min).
// - 24M:I (24MF, sentido 0): 2 micros al día.
// - 201AUI:I: 1 micro. 201AUR:R no está: falta en `ok` y `responseFor` lo da sin micros.
// - 401I:I y 401R:R: la fuente responde sin micros ("sin GPS ahora", como pasa en Tomé).
// - 411I:I: solo una posición vencida; 411R:R sin micros.
// - 421I:I: no se pudo consultar; 421R:R: tope de consultas de la intermediaria.

interface FixtureVehicle {
  plate: string | null;
  lat: number;
  lng: number;
  bearing: number | null;
  reportedAt: number | null;
}

type FixtureService =
  | { status: 'ok'; fetchedAt: number; vehicles: FixtureVehicle[] }
  | { status: 'unavailable' | 'rate_limited' };

export function routeVehiclesFixtures(nowMs: number) {
  const fetchedAt = nowMs - 5_000;
  const ok = (vehicles: FixtureVehicle[]): FixtureService => ({ status: 'ok', fetchedAt, vehicles });
  const bus = (plate: string, lat: number, lng: number, bearing: number, agoMs: number): FixtureVehicle => ({
    plate,
    lat,
    lng,
    bearing,
    reportedAt: nowMs - agoMs,
  });

  const services: Record<string, FixtureService> = {
    '24F:R': ok([
      bus('PRUE51', -36.8221, -73.0478, 239, 20_000),
      bus('PRUE52', -36.8294, -73.0672, 250, 45_000),
      bus('PRUE53', -36.8412, -73.0915, 245, 4 * 60_000),
      bus('PRUE54', -36.846, -73.101, 260, 7 * 60_000),
    ]),
    '24M:I': ok([
      bus('PRUE55', -36.8387, -73.0896, 75, 15_000),
      bus('PRUE56', -36.8203, -73.0365, 60, 50_000),
    ]),
    '201AUI:I': ok([bus('PRUE57', -36.9785, -73.0037, 350, 30_000)]),
    '401I:I': ok([]),
    '401R:R': ok([]),
    '411I:I': ok([bus('PRUE58', -36.6273, -72.9557, 10, 7 * 60_000)]),
    '411R:R': ok([]),
    '421I:I': { status: 'unavailable' },
    '421R:R': { status: 'rate_limited' },
  };

  return {
    services,
    /** Todos los servicios de ejemplo en una respuesta. */
    ok: { fetchedAt: nowMs, services },
    /**
     * Respuesta para los pares pedidos: los de ejemplo tal cual y el resto
     * sin micros ("sin GPS ahora").
     */
    responseFor(pairs: string[]) {
      const out: Record<string, FixtureService> = {};
      for (const pair of pairs) out[pair] = services[pair] ?? ok([]);
      return { fetchedAt: nowMs, services: out };
    },
    unconfigured: { error: 'unconfigured' },
    unreadable: { fetchedAt: nowMs, services: 'sin datos' },
  };
}
