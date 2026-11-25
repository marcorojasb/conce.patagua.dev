// Lo común a las dos intermediarias de la fuente en vivo de la app de Transapp
// (phone.dtpr.transapp.cl/v7/phone/<id>/…): api/stop-arrivals.ts y
// api/route-vehicles.ts. Vercel no publica como función los archivos de api/
// que empiezan con "_".
//
// El <id> sale de TRANSAPP_PHONE_ID y nunca se escribe en respuestas, errores
// ni registros: una falla de la fuente se reduce a un mensaje sin la URL.

const UPSTREAM = 'https://phone.dtpr.transapp.cl/v7/phone';
const USER_AGENT = 'visor-transporte/1.0';

export function sourceId(): string | null {
  const id = process.env.TRANSAPP_PHONE_ID?.trim();
  return id ? id : null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function jsonResponse(body: unknown, status: number, cdnSeconds: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=0, s-maxage=${cdnSeconds}`,
    },
  });
}

/** JSON de `<id>/<pathAndQuery>`; lanza un error genérico si la fuente no responde bien. */
export async function fetchSource(id: string, pathAndQuery: string, timeoutMs: number): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${UPSTREAM}/${encodeURIComponent(id)}/${pathAndQuery}`, {
      headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new Error('la fuente no respondió');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  try {
    return await res.json();
  } catch {
    throw new Error('respuesta ilegible');
  }
}

/** Tope de consultas a la fuente en el último minuto, por instancia. */
export function minuteBudget(max: number): { take(now: number): boolean } {
  let calls: number[] = [];
  return {
    take(now) {
      calls = calls.filter((t) => now - t < 60_000);
      if (calls.length >= max) return false;
      calls.push(now);
      return true;
    },
  };
}
