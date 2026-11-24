import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// El módulo guarda caché y tope en memoria: cada prueba lo carga de nuevo.
async function loadHandler() {
  vi.resetModules();
  return (await import('./stop-arrivals')).GET;
}

function request(stop: string): Request {
  return new Request(`https://example.test/api/stop-arrivals?stop=${encodeURIComponent(stop)}`);
}

function upstreamReply(body: unknown, status = 200): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('api/stop-arrivals', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TRANSAPP_PHONE_ID', 'id-de-prueba');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sin TRANSAPP_PHONE_ID no consulta la fuente', async () => {
    vi.stubEnv('TRANSAPP_PHONE_ID', '');
    const GET = await loadHandler();
    const res = await GET(request('P37520'));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'unconfigured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rechaza códigos que no son de paradero sin consultar', async () => {
    const GET = await loadHandler();
    for (const stop of ['', '../x', 'a'.repeat(21), 'P37520&mode=1', '37520', 'X37520', 'P37520-', 'P37520--', 'P12', 'P123456789']) {
      expect((await GET(request(stop))).status, stop).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('acepta el código de todos los paraderos del GTFS y los renombrados por la fuente', async () => {
    // Sin identificador responde 503 después de validar: un 400 sería un paradero real rechazado.
    vi.stubEnv('TRANSAPP_PHONE_ID', '');
    const GET = await loadHandler();
    const source = readFileSync(new URL('../src/data/gtfs-stops.generated.ts', import.meta.url), 'utf8');
    const ids = [...source.matchAll(/"id":"gtfs-stop-([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(2000);
    const rejected: string[] = [];
    for (const code of [...ids.map((id) => `P${id}`), 'PF-00003', 'PF-00004', 'PF40350']) {
      if ((await GET(request(code))).status === 400) rejected.push(code);
    }
    expect(rejected).toEqual([]);
  });

  it('reenvía predictions/routeInfo/alerts y arma la URL con el identificador', async () => {
    fetchMock.mockResolvedValueOnce(
      upstreamReply({ events: [{ x: 1 }], alerts: [], predictions: [{ route: '10A' }], routeInfo: [] }),
    );
    const GET = await loadHandler();
    const res = await GET(request('P37520'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=25');
    const body = (await res.json()) as { data: unknown; fetchedAt: unknown };
    expect(body.data).toEqual({ predictions: [{ route: '10A' }], routeInfo: [], alerts: [] });
    expect(typeof body.fetchedAt).toBe('number');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      'https://phone.dtpr.transapp.cl/v7/phone/id-de-prueba/stopInfo?stopCode=P37520&mode=3',
    );
    expect(new Headers(init?.headers).get('user-agent')).toBe('visor-transporte/1.0');
  });

  it('reenvía solo los campos que lee el visor, con valores simples', async () => {
    const prediction = {
      route: '24F',
      direction: 'R',
      epochTime: 1764000000,
      timeLabel: '3 min',
      distance: '850',
      realtime: true,
      latitude: -36.8298,
      longitude: -73.055,
      licensePlate: 'PRUE10',
      tripId: null,
    };
    fetchMock.mockResolvedValueOnce(
      upstreamReply({
        predictions: [
          { ...prediction, machineId: '00000000-0000-0000-0000-000000000000', resourceId: -1, eventNumber: 0 },
          { route: { machineId: '00000000-0000-0000-0000-000000000000' }, timeLabel: ['x'], realtime: true },
          { machineId: '00000000-0000-0000-0000-000000000000' },
          'texto suelto',
        ],
        routeInfo: [{ servicio: '24F', msg: 'pasa cada 10 min', icono: 'x' }, null],
        alerts: [{ message: '<b>Aviso</b>', id: 7, link: 'https://example.test' }],
        events: [{ x: 1 }],
      }),
    );
    const GET = await loadHandler();
    const res = await GET(request('P37520'));
    const text = await res.text();
    for (const leaked of ['machineId', 'resourceId', 'eventNumber', '00000000-0000', 'icono', 'example.test', 'events']) {
      expect(text).not.toContain(leaked);
    }
    expect((JSON.parse(text) as { data: unknown }).data).toEqual({
      predictions: [prediction, { realtime: true }],
      routeInfo: [{ servicio: '24F', msg: 'pasa cada 10 min' }],
      alerts: [{ message: '<b>Aviso</b>' }],
    });
  });

  it('guarda 25 s por paradero y comparte la consulta en vuelo', async () => {
    fetchMock.mockImplementation(async () => upstreamReply({ predictions: [] }));
    const GET = await loadHandler();
    await Promise.all([GET(request('P1001')), GET(request('P1001'))]);
    await GET(request('P1001'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await GET(request('P1002'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('el mismo paradero escrito en minúsculas usa la misma consulta y caché', async () => {
    fetchMock.mockImplementation(async () => upstreamReply({ predictions: [] }));
    const GET = await loadHandler();
    for (const stop of ['P37520', 'p37520', 'pPV42001', 'PPV42001']) {
      expect((await GET(request(stop))).status).toBe(200);
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain('stopCode=PPV42001&');
  });

  it('respuesta ilegible o HTTP de error → 502, sin guardar', async () => {
    fetchMock
      .mockResolvedValueOnce(upstreamReply({ predictions: 'x' }))
      .mockResolvedValueOnce(upstreamReply('<html>', 200))
      .mockResolvedValueOnce(upstreamReply({}, 500))
      .mockRejectedValueOnce(new Error('timeout'));
    const GET = await loadHandler();
    for (let i = 0; i < 4; i++) {
      const res = await GET(request('P999'));
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({ error: 'upstream' });
    }
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('respeta el tope de consultas por minuto', async () => {
    fetchMock.mockImplementation(async () => upstreamReply({ predictions: [] }));
    const GET = await loadHandler();
    const statuses: number[] = [];
    for (let i = 0; i < 32; i++) statuses.push((await GET(request(`P${10000 + i}`))).status);
    expect(fetchMock).toHaveBeenCalledTimes(30);
    expect(statuses.slice(30)).toEqual([429, 429]);
  });

  it('pasado el tope sirve lo último guardado del paradero (hasta 10 min) con su hora real', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const t0 = Date.UTC(2026, 10, 24, 12, 0, 0);
    vi.setSystemTime(t0);
    fetchMock.mockImplementation(async () => upstreamReply({ predictions: [{ route: '62H' }] }));
    const GET = await loadHandler();
    expect((await GET(request('P37477'))).status).toBe(200);

    // 30 s después el dato ya no está fresco y el tope se agota con otros paraderos.
    vi.setSystemTime(t0 + 30_000);
    for (let i = 0; i < 29; i++) await GET(request(`P${20000 + i}`));
    expect(fetchMock).toHaveBeenCalledTimes(30);

    const res = await GET(request('P37477'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=10');
    const body = (await res.json()) as { fetchedAt: number; data: { predictions: unknown[] } };
    expect(body.fetchedAt).toBe(t0);
    expect(body.data.predictions).toEqual([{ route: '62H' }]);
    expect(fetchMock).toHaveBeenCalledTimes(30);

    // Pasados 10 min lo guardado se descarta: sin cupo, 429.
    vi.setSystemTime(t0 + 10 * 60_000 + 1_000);
    for (let i = 0; i < 30; i++) await GET(request(`P${30000 + i}`));
    expect((await GET(request('P37477'))).status).toBe(429);
  });

  it('el identificador nunca sale en respuestas, cabeceras ni registros', async () => {
    const secret = 'identificador-secreto-0000';
    vi.stubEnv('TRANSAPP_PHONE_ID', secret);
    const logged: string[] = [];
    for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
        logged.push(args.map(String).join(' '));
      });
    }
    fetchMock
      .mockResolvedValueOnce(upstreamReply({ predictions: [] }))
      .mockResolvedValueOnce(upstreamReply({}, 500))
      .mockRejectedValueOnce(new Error(`fallo hacia /v7/phone/${secret}/stopInfo`))
      .mockResolvedValueOnce(upstreamReply('<html>', 200));
    const GET = await loadHandler();
    const responses = [
      await GET(request('P37520')),
      await GET(request('p37520')),
      await GET(request('P1001')),
      await GET(request('P1002')),
      await GET(request('P1003')),
      await GET(request('../x')),
    ];
    for (let i = 0; i < 30; i++) responses.push(await GET(request(`P${40000 + i}`)));
    expect(responses.some((r) => r.status === 429)).toBe(true);
    for (const res of responses) {
      expect(await res.text()).not.toContain(secret);
      res.headers.forEach((value) => expect(value).not.toContain(secret));
    }
    expect(logged.join('\n')).not.toContain(secret);
  });
});
