import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// El módulo guarda caché y tope en memoria: cada prueba lo carga de nuevo.
async function loadHandler() {
  vi.resetModules();
  return (await import('./route-vehicles')).GET;
}

function request(services: string | null): Request {
  const query = services == null ? '' : `?services=${encodeURIComponent(services)}`;
  return new Request(`https://example.test/api/route-vehicles${query}`);
}

function upstreamReply(body: unknown, status = 200): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// Forma comprobada de la fuente, con valores inventados.
function machine(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    licensePlate: 'PRUE10',
    machineId: '00000000-0000-0000-0000-000000000000',
    latitude: -36.8298,
    longitude: -73.055,
    bearing: 239.0,
    timestamp: '2026-11-24T15:55:22Z',
    resourceId: -1,
    eventNumber: 0,
    ...overrides,
  };
}

interface Body {
  fetchedAt: number;
  services: Record<string, { status: string; fetchedAt?: number; vehicles?: Array<Record<string, unknown>> }>;
}

function upstreamPair(call: Parameters<typeof fetch>): string {
  const url = new URL(String(call[0]));
  return `${url.searchParams.get('route')}:${url.searchParams.get('direction')}`;
}

describe('api/route-vehicles', () => {
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
    vi.stubEnv('TRANSAPP_PHONE_ID', '  ');
    const GET = await loadHandler();
    const res = await GET(request('24F:R'));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'unconfigured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rechaza pares inválidos, vacíos o demasiados sin consultar', async () => {
    const GET = await loadHandler();
    const tooMany = Array.from({ length: 17 }, (_, i) => `S${String(i).padStart(3, '0')}:I`).join(',');
    for (const services of [
      null,
      '',
      ',',
      '24F',
      '24F:',
      '24F:X',
      '24F:IR',
      ':I',
      'A:I',
      'ABCDEFGH:I',
      '24F:I,',
      '24F:I,,401I:I',
      '24F-Y:I',
      '24Ñ:I',
      '../x:I',
      '24F:I&route=x',
      '24F:I;401I:I',
      tooMany,
    ]) {
      const res = await GET(request(services));
      expect(res.status, String(services)).toBe(400);
      expect(await res.json()).toEqual({ error: 'bad_request' });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('acepta minúsculas, quita repetidos y admite 16 pares distintos', async () => {
    vi.stubEnv('TRANSAPP_PHONE_ID', '');
    const GET = await loadHandler();
    const sixteen = Array.from({ length: 16 }, (_, i) => `S${String(i).padStart(3, '0')}:R`);
    // Sin identificador responde 503 después de validar: un 400 sería un par válido rechazado.
    for (const services of ['24f:r', '201AUR:R,02CY:I', [...sixteen, sixteen[0].toLowerCase()].join(','), ' 24F:R , 401I:I ']) {
      expect((await GET(request(services))).status, services).toBe(503);
    }
  });

  it('consulta cada par en paralelo y entrega solo patente, posición, rumbo y hora', async () => {
    fetchMock.mockImplementation(async (input) => {
      const pair = upstreamPair([input]);
      if (pair === '24F:R') {
        return upstreamReply({ machines: [machine(), machine({ licensePlate: 'PRUE11', bearing: 12.6 })], stops: [] });
      }
      return upstreamReply({ machines: [], stops: [] });
    });
    const GET = await loadHandler();
    const res = await GET(request('24f:R,401I:I,24F:r'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('public, max-age=0, s-maxage=15');
    const text = await res.text();
    for (const leaked of ['machineId', 'resourceId', 'eventNumber', '00000000-0000']) {
      expect(text).not.toContain(leaked);
    }
    const body = JSON.parse(text) as Body;
    expect(typeof body.fetchedAt).toBe('number');
    expect(Object.keys(body.services)).toEqual(['24F:R', '401I:I']);
    expect(body.services['24F:R']).toEqual({
      status: 'ok',
      fetchedAt: expect.any(Number),
      vehicles: [
        { plate: 'PRUE10', lat: -36.8298, lng: -73.055, bearing: 239, reportedAt: Date.UTC(2026, 10, 24, 15, 55, 22) },
        { plate: 'PRUE11', lat: -36.8298, lng: -73.055, bearing: 13, reportedAt: Date.UTC(2026, 10, 24, 15, 55, 22) },
      ],
    });
    // Línea que no transmite: lista vacía, no falla.
    expect(body.services['401I:I']).toEqual({ status: 'ok', fetchedAt: expect.any(Number), vehicles: [] });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const urls = fetchMock.mock.calls.map((call) => String(call[0])).sort();
    expect(urls).toEqual([
      'https://phone.dtpr.transapp.cl/v7/phone/id-de-prueba/synoptic/machines?route=24F&direction=R',
      'https://phone.dtpr.transapp.cl/v7/phone/id-de-prueba/synoptic/machines?route=401I&direction=I',
    ]);
    const init = fetchMock.mock.calls[0][1];
    expect(new Headers(init?.headers).get('user-agent')).toBe('visor-transporte/1.0');
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('descarta posiciones sin señal y normaliza patente, rumbo y hora', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.UTC(2026, 10, 24, 16, 0, 0));
    fetchMock.mockResolvedValueOnce(
      upstreamReply({
        machines: [
          machine({ latitude: 0, longitude: 0 }),
          machine({ latitude: -33.45, longitude: -70.66 }),
          machine({ latitude: null }),
          machine({ longitude: 'x' }),
          'no es un objeto',
          null,
          machine({ latitude: '-36.71', longitude: '-72.97', licensePlate: 'ab-cd 12', bearing: 360, timestamp: '2026-11-24T12:59:00-03:00' }),
          machine({ licensePlate: 'NO-SE', bearing: -1, timestamp: 'ayer' }),
          machine({ licensePlate: 12345, bearing: '90', timestamp: '2026-11-24T16:30:00Z' }),
          machine({ licensePlate: null, bearing: null, timestamp: 1764000000 }),
        ],
      }),
    );
    const GET = await loadHandler();
    const body = (await (await GET(request('62H:I'))).json()) as Body;
    expect(body.services['62H:I'].vehicles).toEqual([
      { plate: 'ABCD12', lat: -36.71, lng: -72.97, bearing: 0, reportedAt: Date.UTC(2026, 10, 24, 15, 59, 0) },
      // Hora inválida o 30 min en el futuro (reloj del GPS desajustado): desconocida.
      { plate: null, lat: -36.8298, lng: -73.055, bearing: null, reportedAt: null },
      { plate: null, lat: -36.8298, lng: -73.055, bearing: 90, reportedAt: null },
      { plate: null, lat: -36.8298, lng: -73.055, bearing: null, reportedAt: null },
    ]);
  });

  it('respuesta ilegible, HTTP de error o sin respuesta → "unavailable" solo para ese par', async () => {
    const replies: Record<string, () => Promise<Response>> = {
      '10A:I': async () => upstreamReply({ machines: 'x' }),
      '10N:R': async () => upstreamReply('<html>'),
      '11R:I': async () => upstreamReply({}, 500),
      '12A:I': async () => {
        throw new Error('timeout');
      },
      '24F:R': async () => upstreamReply({ machines: [machine()] }),
    };
    fetchMock.mockImplementation((input) => replies[upstreamPair([input])]());
    const GET = await loadHandler();
    const res = await GET(request(Object.keys(replies).join(',')));
    expect(res.status).toBe(200);
    const body = (await res.json()) as Body;
    for (const pair of ['10A:I', '10N:R', '11R:I', '12A:I']) {
      expect(body.services[pair], pair).toEqual({ status: 'unavailable' });
    }
    expect(body.services['24F:R'].status).toBe('ok');
    expect(body.services['24F:R'].vehicles).toHaveLength(1);
  });

  it('guarda 20 s por par y comparte la consulta en vuelo', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const t0 = Date.UTC(2026, 10, 24, 12, 0, 0);
    vi.setSystemTime(t0);
    fetchMock.mockImplementation(async () => upstreamReply({ machines: [machine()] }));
    const GET = await loadHandler();
    await Promise.all([GET(request('24F:R')), GET(request('24F:R,401I:I'))]);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.setSystemTime(t0 + 19_000);
    const cached = (await (await GET(request('401I:I,24F:R'))).json()) as Body;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cached.services['24F:R'].fetchedAt).toBe(t0);

    vi.setSystemTime(t0 + 20_000);
    const fresh = (await (await GET(request('24F:R'))).json()) as Body;
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fresh.services['24F:R'].fetchedAt).toBe(t0 + 20_000);
  });

  it('pasado el tope de 60 consultas por minuto sirve lo último del par (hasta 2 min) o "rate_limited"', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const t0 = Date.UTC(2026, 10, 24, 12, 0, 0);
    vi.setSystemTime(t0);
    fetchMock.mockImplementation(async () => upstreamReply({ machines: [machine()] }));
    const GET = await loadHandler();
    await GET(request('24F:R'));

    // 30 s después el dato ya no está fresco y el tope se agota con otros pares.
    vi.setSystemTime(t0 + 30_000);
    const others = Array.from({ length: 59 }, (_, i) => `S${String(i).padStart(3, '0')}:I`);
    for (let i = 0; i < others.length; i += 16) await GET(request(others.slice(i, i + 16).join(',')));
    expect(fetchMock).toHaveBeenCalledTimes(60);

    const body = (await (await GET(request('24F:R,99Z:I'))).json()) as Body;
    expect(fetchMock).toHaveBeenCalledTimes(60);
    expect(body.services['24F:R']).toEqual({ status: 'ok', fetchedAt: t0, vehicles: [expect.any(Object)] });
    expect(body.services['99Z:I']).toEqual({ status: 'rate_limited' });

    // Lo guardado del par vale 2 min: pasado eso y sin cupo, "rate_limited".
    vi.setSystemTime(t0 + 2 * 60_000 + 1_000);
    const more = Array.from({ length: 60 }, (_, i) => `T${String(i).padStart(3, '0')}:R`);
    for (let i = 0; i < more.length; i += 16) await GET(request(more.slice(i, i + 16).join(',')));
    expect(fetchMock).toHaveBeenCalledTimes(120);
    const late = (await (await GET(request('24F:R'))).json()) as Body;
    expect(late.services['24F:R']).toEqual({ status: 'rate_limited' });
  });

  it('si la fuente falla sirve lo último del par (hasta 2 min) con su hora real', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const t0 = Date.UTC(2026, 10, 24, 12, 0, 0);
    vi.setSystemTime(t0);
    fetchMock.mockResolvedValueOnce(upstreamReply({ machines: [machine()] }));
    const GET = await loadHandler();
    await GET(request('24F:R'));

    fetchMock.mockImplementation(async () => upstreamReply({}, 502));
    vi.setSystemTime(t0 + 90_000);
    const fallback = (await (await GET(request('24F:R'))).json()) as Body;
    expect(fallback.services['24F:R']).toEqual({ status: 'ok', fetchedAt: t0, vehicles: [expect.any(Object)] });

    vi.setSystemTime(t0 + 2 * 60_000);
    const gone = (await (await GET(request('24F:R'))).json()) as Body;
    expect(gone.services['24F:R']).toEqual({ status: 'unavailable' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
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
      .mockResolvedValueOnce(upstreamReply({ machines: [machine()] }))
      .mockResolvedValueOnce(upstreamReply({}, 500))
      .mockRejectedValueOnce(new Error(`fallo hacia /v7/phone/${secret}/synoptic/machines`))
      .mockResolvedValueOnce(upstreamReply(`<html>${secret}</html>`))
      .mockImplementation(async () => upstreamReply({ machines: [], echo: secret }));
    const GET = await loadHandler();
    const responses = [
      await GET(request('24F:R')),
      await GET(request('10A:I')),
      await GET(request('10N:R')),
      await GET(request('11R:I')),
      await GET(request('12A:I')),
      await GET(request('../x')),
    ];
    for (let i = 0; i < 4; i++) {
      const batch = Array.from({ length: 16 }, (_, j) => `S${String(i * 16 + j).padStart(3, '0')}:I`);
      responses.push(await GET(request(batch.join(','))));
    }
    const texts = await Promise.all(responses.map((res) => res.text()));
    expect(texts.some((text) => text.includes('rate_limited'))).toBe(true);
    for (const [i, res] of responses.entries()) {
      expect(texts[i]).not.toContain(secret);
      res.headers.forEach((value) => expect(value).not.toContain(secret));
    }
    expect(logged.join('\n')).not.toContain(secret);
  });
});
