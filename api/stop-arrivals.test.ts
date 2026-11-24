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
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sin TRANSAPP_PHONE_ID no consulta la fuente', async () => {
    vi.stubEnv('TRANSAPP_PHONE_ID', '');
    const GET = await loadHandler();
    const res = await GET(request('37520'));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'unconfigured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rechaza códigos de paradero raros sin consultar', async () => {
    const GET = await loadHandler();
    for (const stop of ['', '../x', 'a'.repeat(21), '37520&mode=1']) {
      expect((await GET(request(stop))).status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reenvía predictions/routeInfo/alerts y arma la URL con el identificador', async () => {
    fetchMock.mockResolvedValueOnce(
      upstreamReply({ events: [{ x: 1 }], alerts: [], predictions: [{ route: '10A' }], routeInfo: [] }),
    );
    const GET = await loadHandler();
    const res = await GET(request('37520'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=25');
    const body = (await res.json()) as { data: unknown; fetchedAt: unknown };
    expect(body.data).toEqual({ predictions: [{ route: '10A' }], routeInfo: [], alerts: [] });
    expect(typeof body.fetchedAt).toBe('number');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      'https://phone.dtpr.transapp.cl/v7/phone/id-de-prueba/stopInfo?stopCode=37520&mode=3',
    );
    expect(new Headers(init?.headers).get('user-agent')).toBe('visor-transporte/1.0');
  });

  it('guarda 25 s por paradero y comparte la consulta en vuelo', async () => {
    fetchMock.mockImplementation(async () => upstreamReply({ predictions: [] }));
    const GET = await loadHandler();
    await Promise.all([GET(request('1')), GET(request('1'))]);
    await GET(request('1'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await GET(request('2'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('respuesta ilegible o HTTP de error → 502, sin guardar', async () => {
    fetchMock
      .mockResolvedValueOnce(upstreamReply({ predictions: 'x' }))
      .mockResolvedValueOnce(upstreamReply('<html>', 200))
      .mockResolvedValueOnce(upstreamReply({}, 500))
      .mockRejectedValueOnce(new Error('timeout'));
    const GET = await loadHandler();
    for (let i = 0; i < 4; i++) {
      const res = await GET(request('9'));
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({ error: 'upstream' });
    }
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('respeta el tope de consultas por minuto', async () => {
    fetchMock.mockImplementation(async () => upstreamReply({ predictions: [] }));
    const GET = await loadHandler();
    const statuses: number[] = [];
    for (let i = 0; i < 32; i++) statuses.push((await GET(request(`s${i}`))).status);
    expect(fetchMock).toHaveBeenCalledTimes(30);
    expect(statuses.slice(30)).toEqual([429, 429]);
  });
});
