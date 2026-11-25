// Smoke con navegador del visor: levanta `vite` sin TRANSAPP_PHONE_ID y
// recorre la app con Playwright. Todo `/api/*` se intercepta con respuestas
// de ejemplo (src/realtime/*.fixtures.ts) y cualquier otra consulta a /api
// hace fallar el smoke: ninguna corrida consulta la fuente en vivo real.
//
// Los selectores siguen el contrato del refactor (roles y nombres accesibles,
// `[data-surface]`, `canvas.vehicle-canvas[data-*]`). Cada paso abre un
// contexto nuevo para partir con el historial limpio.
//
//   npm run smoke:services                  # puerto 5175
//   SMOKE_PORT=5285 SMOKE_ONLY=N1,G3 npm run smoke:services

import { spawn } from 'node:child_process';
import { register } from 'node:module';
import { chromium, devices, type Browser, type BrowserContextOptions, type Locator, type Page } from 'playwright';
import { GTFS_BUS_ROUTES } from '../src/data/gtfs-bus-routes.generated.ts';
import { GTFS_STOPS } from '../src/data/gtfs-stops.generated.ts';
import { stopInfoFixtures } from '../src/realtime/live-arrivals.fixtures.ts';
import { routeVehiclesFixtures } from '../src/realtime/route-vehicles.fixtures.ts';

const PORT = Number(process.env.SMOKE_PORT ?? 5175);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ONLY = (process.env.SMOKE_ONLY ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const MORNING = '2026-05-18T08:30:00-04:00';
const NIGHT = '2026-05-18T02:30:00-04:00';

// ── Datos del GTFS para elegir casos ────────────────────────────────────────

const byRef = (ref: string) => {
  const route = GTFS_BUS_ROUTES.find((r) => r.ref === ref);
  if (!route) throw new Error(`GTFS route ${ref} not found`);
  return route;
};
// route-colors.ts importa con el alias `@/` de Vite, que Node no entiende:
// se traduce a src/ solo para esta importación.
register(
  `data:text/javascript,${encodeURIComponent(`
    export async function resolve(specifier, context, next) {
      if (!specifier.startsWith('@/')) return next(specifier, context);
      return next(${JSON.stringify(new URL('../src/', import.meta.url).href)} + specifier.slice(2) + '.ts', context);
    }`)}`,
);
const { displayRouteColor } = await import('../src/lib/route-colors.ts');

const ROUTE_30QE = byRef('30QE');
// El mapa pinta el color de pantalla (tono oficial, luminosidad del tema); el smoke corre en claro.
const COLOR_30QE = displayRouteColor(ROUTE_30QE.colour ?? '#0d7215', 'light');

// Un paradero que solo toca el regreso (sentido 1) de un recorrido debe
// listarlo igual. Se elige uno sin otros recorridos para que el código se lea.
const stopRouteCount = new Map<string, number>();
for (const r of GTFS_BUS_ROUTES) {
  for (const id of new Set((r.directions ?? []).flatMap((d) => d.stopIds))) {
    stopRouteCount.set(id, (stopRouteCount.get(id) ?? 0) + 1);
  }
}
const returnOnlyStop = GTFS_BUS_ROUTES.flatMap((r) => {
  const [first, second] = r.directions ?? [];
  if (!first || !second || r.network?.startsWith('Interurbano')) return [];
  const outbound = new Set(first.stopIds);
  return second.stopIds
    .filter((id) => !outbound.has(id) && stopRouteCount.get(id) === 1)
    .map((stopId) => ({ stopId, code: second.variant ?? r.ref }));
})[0];
if (!returnOnlyStop) throw new Error('No GTFS stop served only by a return direction');

// Paradero que solo recorren la 302/304 (Lota), que la fuente en vivo no
// sigue: el visor no debe consultarla.
const refsByStop = new Map<string, Set<string>>();
for (const r of GTFS_BUS_ROUTES) {
  for (const id of new Set((r.directions ?? []).flatMap((d) => d.stopIds))) {
    refsByStop.set(id, (refsByStop.get(id) ?? new Set()).add(r.ref));
  }
}
const lotaOnlyStop = [...refsByStop].find(([, refs]) => [...refs].every((ref) => ref === '302' || ref === '304'))?.[0];
if (!lotaOnlyStop) throw new Error('No GTFS stop served only by 302/304');

// 20 líneas urbanas de dos sentidos: 40 pares, más que el tope de 16.
const TWENTY_LINES = GTFS_BUS_ROUTES.filter((r) => !r.network?.startsWith('Interurbano') && (r.directions ?? []).length === 2)
  .slice(0, 20)
  .map((r) => r.ref);

// ── Servidor ────────────────────────────────────────────────────────────────

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return;
    } catch {
      // Vite is still starting.
    }
    await wait(300);
  }
  throw new Error(`Dev server did not answer at ${BASE_URL}`);
}

async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    return chromium.launch({ headless: true });
  }
}

const child = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
  // Grupo de procesos propio: `npm run dev` lanza vite como nieto, y matar
  // solo a npm deja vite vivo con las tuberías abiertas (el smoke no termina).
  // TRANSAPP_PHONE_ID vacío pisa el del entorno y el de un .env.local: la
  // intermediaria queda sin configurar y nunca consulta la fuente real, aunque
  // una consulta se escape de page.route.
  {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
    env: { ...process.env, TRANSAPP_PHONE_ID: '' },
  },
);

let serverOutput = '';
child.stdout.on('data', (chunk) => {
  serverOutput += String(chunk);
});
child.stderr.on('data', (chunk) => {
  serverOutput += String(chunk);
});

// ── Sesiones con /api interceptado ──────────────────────────────────────────

type VehiclesMode = 'fixtures' | 'empty' | 'unconfigured';

interface OpenOptions {
  url?: string;
  mobile?: boolean;
  viewport?: { width: number; height: number };
  clock?: string;
  /** Deja la tarjeta de bienvenida como en una primera visita. */
  welcome?: boolean;
  vehicles?: VehiclesMode;
  /** Sin el reloj fijo: el paso instala el reloj de Playwright. */
  playwrightClock?: boolean;
}

interface Session {
  page: Page;
  liveStops: string[];
  vehicleQueries: string[][];
  unexpected: string[];
  errors: string[];
  setLiveUp(up: boolean): void;
  close(): Promise<void>;
}

let browser: Browser | null = null;

// Reloj fijo que avanza: el visor calcula horarios y antigüedades con Date.
function clockScript(iso: string): string {
  return `(() => {
    const fixedNow = new Date(${JSON.stringify(iso)}).valueOf();
    const start = performance.now();
    const RealDate = Date;
    class MockDate extends RealDate {
      constructor(...args) { if (args.length === 0) super(fixedNow + (performance.now() - start)); else super(...args); }
      static now() { return fixedNow + (performance.now() - start); }
    }
    globalThis.Date = MockDate;
  })();`;
}

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

async function open(options: OpenOptions = {}): Promise<Session> {
  if (!browser) throw new Error('Browser not started');
  // Teléfono: el iPhone 13, o con `viewport` uno más angosto (360 × 740).
  const contextOptions: BrowserContextOptions = options.mobile
    ? { ...devices['iPhone 13'], ...(options.viewport ? { viewport: options.viewport, screen: options.viewport } : {}) }
    : { viewport: options.viewport ?? { width: 1440, height: 900 } };
  delete (contextOptions as { defaultBrowserType?: string }).defaultBrowserType;
  const context = await browser.newContext({ ...contextOptions, acceptDownloads: true });
  const page = await context.newPage();
  const clock = options.clock ?? MORNING;
  const nowMs = new Date(clock).valueOf();
  const liveFixtures = stopInfoFixtures(nowMs / 1000);
  const vehicleFixtures = routeVehiclesFixtures(nowMs);
  const session: Session = {
    page,
    liveStops: [],
    vehicleQueries: [],
    unexpected: [],
    errors: [],
    setLiveUp: (up) => {
      liveUp = up;
    },
    close: () => context.close(),
  };
  let liveUp = true;

  // Teselas de fondo: una imagen vacía, sin salir a internet.
  await page.route(/server\.arcgisonline\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: TRANSPARENT_PNG }),
  );
  await page.route('**/api/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/stop-arrivals') {
      session.liveStops.push(url.searchParams.get('stop') ?? '');
      return route.fulfill(
        liveUp
          ? {
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ fetchedAt: nowMs, data: liveFixtures.withBuses }),
            }
          : { status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'upstream' }) },
      );
    }
    if (url.pathname === '/api/route-vehicles') {
      const pairs = (url.searchParams.get('services') ?? '').split(',').filter(Boolean);
      session.vehicleQueries.push(pairs);
      const mode = options.vehicles ?? 'fixtures';
      if (mode === 'unconfigured') {
        return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'unconfigured' }) });
      }
      const body =
        mode === 'empty'
          ? {
              fetchedAt: nowMs,
              services: Object.fromEntries(pairs.map((p) => [p, { status: 'ok', fetchedAt: nowMs - 5_000, vehicles: [] }])),
            }
          : vehicleFixtures.responseFor(pairs);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    }
    session.unexpected.push(url.pathname + url.search);
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"not_found"}' });
  });
  const init = [
    options.playwrightClock ? '' : clockScript(clock),
    options.welcome ? '' : "try { localStorage.setItem('conce.welcome', 'hidden'); } catch {}",
  ].join('\n');
  if (init.trim()) await page.addInitScript({ content: init });
  if (options.playwrightClock) await page.clock.install({ time: nowMs });
  page.on('console', (msg) => {
    if (msg.type() === 'error') session.errors.push(msg.text());
  });
  page.on('pageerror', (err) => session.errors.push(err.message));
  // Una entrada previa en el historial: un Atrás que saca del visor se nota.
  await page.goto('about:blank');
  if (options.url !== undefined) await goto(page, options.url);
  return session;
}

async function goto(page: Page, path: string): Promise<void> {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'load' });
  await page.locator('.leaflet-container').waitFor({ timeout: 20_000 });
}

// ── Ayudas ──────────────────────────────────────────────────────────────────

function fail(message: string): never {
  throw new Error(message);
}

async function waitForBody(page: Page, pattern: RegExp, label: string, timeout = 15_000): Promise<void> {
  // innerText trae el texto ya transformado por CSS (`uppercase`): sin la `i`
  // el patrón no calzaría con lo pintado.
  const flags = pattern.flags.includes('i') ? pattern.flags : `${pattern.flags}i`;
  await page
    .waitForFunction(
      ({ source, flags: f }) => new RegExp(source, f).test(document.body.innerText),
      { source: pattern.source, flags },
      { timeout },
    )
    .catch(() => fail(`Expected body text for ${label}: ${pattern}`));
}

async function visible(locator: Locator, label: string, timeout = 10_000): Promise<void> {
  await locator.first().waitFor({ state: 'visible', timeout }).catch(() => fail(`Expected visible: ${label}`));
}

async function gone(locator: Locator, label: string, timeout = 10_000): Promise<void> {
  await locator.first().waitFor({ state: 'detached', timeout }).catch(async () => {
    if ((await locator.count()) > 0 && !(await locator.first().isVisible())) return;
    fail(`Expected gone: ${label}`);
  });
}

function surface(page: Page): Locator {
  return page.locator('[data-surface]');
}

// Con innerText (saltos de línea entre bloques, como se ve), no textContent:
// "02D" seguido de su destino no queda pegado como "02DParque".
async function surfaceWith(page: Page, pattern: RegExp, label: string): Promise<void> {
  const flags = pattern.flags.includes('i') ? pattern.flags : `${pattern.flags}i`;
  await page
    .waitForFunction(
      ({ source, flags: f }) =>
        [...document.querySelectorAll<HTMLElement>('[data-surface]')].some((el) => new RegExp(source, f).test(el.innerText)),
      { source: pattern.source, flags },
      { timeout: 15_000 },
    )
    .catch(() => fail(`Expected surface ${label} (${pattern})`));
}

async function noSurface(page: Page, label: string): Promise<void> {
  await gone(surface(page), `no surface (${label})`);
}

async function waitForUrl(page: Page, test: (url: URL) => boolean, label: string): Promise<void> {
  await page.waitForURL((url) => test(url), { timeout: 10_000 }).catch(() => fail(`${label}; URL is ${page.url()}`));
}

const param = (url: URL, key: string) => url.searchParams.get(key);

function vehicleCanvas(page: Page): Locator {
  return page.locator('canvas.vehicle-canvas');
}

async function canvasData(page: Page): Promise<Record<string, string>> {
  return vehicleCanvas(page).evaluate((el) => ({ ...(el as HTMLElement).dataset }) as Record<string, string>);
}

async function waitForCanvas(
  page: Page,
  test: (data: Record<string, string>) => boolean,
  label: string,
  timeout = 15_000,
): Promise<Record<string, string>> {
  const deadline = Date.now() + timeout;
  let last: Record<string, string> = {};
  while (Date.now() < deadline) {
    if ((await vehicleCanvas(page).count()) > 0) {
      last = await canvasData(page);
      if (test(last)) return last;
    }
    await wait(250);
  }
  fail(`Vehicle canvas never matched: ${label}; last ${JSON.stringify(last)}`);
}

async function openPalette(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Buscar recorridos y paraderos' }).click();
  const input = page.getByPlaceholder('Buscar recorridos, paraderos…');
  await visible(input, 'command palette input');
  return input;
}

async function pickFromPalette(page: Page, query: string, item: RegExp): Promise<void> {
  const input = await openPalette(page);
  await input.fill(query);
  const option = page.locator('[cmdk-item]').filter({ hasText: item }).first();
  await visible(option, `palette item ${item}`);
  await option.click();
}

async function capas(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Capas del mapa' }).click();
  const dialog = page.getByRole('dialog', { name: 'Capas del mapa' });
  await visible(dialog, 'Capas popover');
  return dialog;
}

/** Zoom del mapa, leído de las teselas del nivel activo ({z}/{y}/{x}). */
async function mapZoom(page: Page): Promise<number> {
  return page.evaluate(() => {
    let best: { z: number; level: number } | null = null;
    for (const container of document.querySelectorAll<HTMLElement>('.leaflet-tile-container')) {
      const level = Number(container.style.zIndex || 0);
      const img = container.querySelector<HTMLImageElement>('img.leaflet-tile');
      const z = img ? Number(/\/tile\/(\d+)\//.exec(img.src)?.[1]) : NaN;
      if (Number.isFinite(z) && (!best || level > best.level)) best = { z, level };
    }
    return best?.z ?? NaN;
  });
}

/**
 * Un punto de la pantalla sobre el trazado del color dado, leído del canvas
 * de vectores (el de micros no recibe el puntero) y no tapado por la interfaz.
 */
async function linePoint(page: Page, hex: string): Promise<{ x: number; y: number }> {
  const point = await page.evaluate((color) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const canvas = [...document.querySelectorAll<HTMLCanvasElement>('.leaflet-container canvas')].find(
      (c) => !c.classList.contains('vehicle-canvas'),
    );
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / width;
    const sy = rect.height / height;
    const candidates: Array<{ x: number; y: number }> = [];
    // El trazado se pinta con opacidad sobre su borde blanco: el color sale
    // mezclado, así que se acepta cerca del de la ruta y se pide que los
    // vecinos también lo sean (centro de la línea, no un borde ni un paradero).
    const near = (px: number, py: number) => {
      const i = (py * width + px) * 4;
      return data[i + 3] >= 180 && Math.abs(data[i] - r) <= 30 && Math.abs(data[i + 1] - g) <= 30 && Math.abs(data[i + 2] - b) <= 30;
    };
    for (let y = 2; y < height - 2; y += 3) {
      for (let x = 2; x < width - 2; x += 3) {
        if (!near(x, y) || !near(x - 1, y) || !near(x + 1, y) || !near(x, y - 1) || !near(x, y + 1)) continue;
        const cx = rect.left + x * sx;
        const cy = rect.top + y * sy;
        const hit = document.elementFromPoint(cx, cy);
        if (hit === canvas || hit?.classList.contains('vehicle-canvas')) candidates.push({ x: cx, y: cy });
      }
    }
    return candidates.length > 0 ? candidates[Math.floor(candidates.length / 2)] : null;
  }, hex);
  if (!point) fail(`No visible pixel of route colour ${hex} on the map canvas`);
  return point;
}

/** Botón de herramienta de la columna derecha (la barra lateral también tiene "Planificador"). */
function tool(page: Page, name: string): Locator {
  return page.getByRole('button', { name, exact: true }).last();
}

/** Abre "Detalle por línea" del modo GPS (abierto por defecto en escritorio, plegado en móvil). */
async function openGpsDetail(page: Page): Promise<void> {
  const toggle = page.locator('[data-micros-control]').getByRole('button', { name: /Detalle por línea/ });
  await visible(toggle, '"Detalle por línea"');
  if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
  await visible(page.locator('[data-gps-status]'), 'GPS detail list');
}

/** Zoom 12: las paradas de las líneas de la red no se dibujan y un clic cae en el trazado. */
async function zoomOutForLines(page: Page): Promise<void> {
  await page.locator('.leaflet-control-zoom-out').click();
  await wait(800);
}

/** Un punto del mapa libre de interfaz (para elegir A/B). */
async function emptyMapPoint(page: Page, fx: number, fy: number): Promise<{ x: number; y: number }> {
  const box = await page.locator('.leaflet-container').boundingBox();
  if (!box) fail('Map container has no box');
  return { x: box.x + box.width * fx, y: box.y + box.height * fy };
}

// ── Pasos ───────────────────────────────────────────────────────────────────

const steps: Array<[string, () => Promise<void>]> = [];
function step(name: string, run: () => Promise<void>): void {
  steps.push([name, run]);
}

async function withSession(options: OpenOptions, run: (s: Session) => Promise<void>): Promise<void> {
  const session = await open(options);
  try {
    await run(session);
    if (session.unexpected.length > 0) fail(`Unexpected /api requests: ${session.unexpected.join(', ')}`);
    const errors = session.errors.filter((e) => !/Failed to load resource: the server responded with a status of (502|503)/.test(e));
    if (errors.length > 0) fail(`Console errors:\n${errors.join('\n')}`);
  } finally {
    await session.close();
  }
}

step('S1 buscador: búsqueda sin tildes y selección', () =>
  withSession({ url: '/' }, async ({ page }) => {
    const input = await openPalette(page);
    // GTFS oficial DTPR: route_id 833 = "02AD" (variantes 02A/02D). Sin tildes
    // y sin que cmdk vuelva a filtrar: "Lirquén" encuentra recorridos.
    await input.fill('Lirquén');
    await visible(page.locator('[cmdk-group-heading]', { hasText: 'Recorridos' }), 'palette routes for "Lirquén"');
    await input.fill('02AD');
    await page.locator('[cmdk-item]').filter({ hasText: /02A\/D/ }).first().click();
    await surfaceWith(page, /02A\/D/, 'route from palette shows the pill 02A/D');
    await waitForUrl(page, (u) => param(u, 'route') === '02AD', 'Expected ?route=02AD after choosing from the palette');
    // Lo que muestra la píldora también se busca: "30Q/E" encuentra la 30QE en ⌘K y en la barra lateral.
    const again = await openPalette(page);
    await again.fill('30Q/E');
    await visible(page.locator('[cmdk-item]').filter({ hasText: /30Q\/E/ }), 'palette finds the pill label 30Q/E');
    await page.keyboard.press('Escape');
    const sidebar = page.getByRole('complementary', { name: 'Recorridos' });
    await sidebar.getByLabel('Buscar recorrido por número o destino').fill('30Q/E');
    await visible(sidebar.getByRole('button', { name: /^30Q\/E/ }), 'sidebar finds the pill label 30Q/E');
  }),
);

step('S2 enlaces a recorridos: id, variante y sentido', () =>
  withSession({}, async ({ page }) => {
    await goto(page, '/?route=gtfs-route-833');
    await surfaceWith(page, /02A|Mirador del Pacífico/, 'GTFS route deep link');
    await waitForUrl(page, (u) => param(u, 'route') === '02AD', 'Expected the id to be rewritten as the code 02AD');
    // La variante de un sentido ("10A", lo que muestra la micro y cita el
    // wiki) abre el recorrido oficial que la contiene, aunque llegue en el
    // chunk diferido, y el sentido queda en la URL.
    await goto(page, '/?focus=route:10A');
    await surfaceWith(page, /10A/, 'focus by direction variant 10A');
    await waitForUrl(
      page,
      (u) => param(u, 'route') === '10AN' && param(u, 'dir') === '0' && !u.searchParams.has('focus'),
      'Expected ?focus=route:10A to become ?route=10AN&dir=0',
    );
    await goto(page, '/?focus=route:10N');
    await waitForUrl(page, (u) => param(u, 'route') === '10AN' && param(u, 'dir') === '1', 'Expected dir=1 for 10N');
    await page.reload({ waitUntil: 'load' });
    await page.getByRole('tab', { name: 'Recorrido' }).click();
    await visible(
      page.getByRole('group', { name: 'Sentido' }).getByRole('button', { name: /^10N/, pressed: true }),
      'reloaded ?route=10AN&dir=1 opens the 10N direction',
    );
  }),
);

step('S3 paradero que solo toca el regreso de un recorrido', () =>
  withSession({ url: `/?stop=${returnOnlyStop.stopId}` }, async ({ page }) => {
    await surfaceWith(
      page,
      new RegExp(`\\b${returnOnlyStop.code}\\b`),
      `stop ${returnOnlyStop.stopId} served only by the ${returnOnlyStop.code} return direction`,
    );
  }),
);

step('S4 "Operando ahora" por fila según el horario oficial', () =>
  withSession({ url: '/' }, async ({ page }) => {
    // A las 08:30 de un lunes la 11C (solo 17:00–19:49) está fuera de horario y la 10AN no.
    const sidebar = page.getByRole('complementary', { name: 'Recorridos' });
    const search = sidebar.getByLabel('Buscar recorrido por número o destino');
    for (const [code, expected] of [['11C', 'Fuera de horario ahora'], ['10A/N', 'Operando ahora']] as const) {
      await search.fill(code.replace('/', ''));
      const row = sidebar.locator('li, [role="listitem"], button').filter({ hasText: code }).first();
      await visible(row.locator(`[title="${expected}"]`), `sidebar row ${code} says "${expected}"`);
    }
    await search.fill('');
  }),
);

step('S5+G6 paradero con llegadas en vivo: GPS solo en modo GPS', () =>
  withSession({ url: '/?stop=gtfs-stop-37477' }, async ({ page }) => {
    await waitForBody(page, /Próximas pasadas|Cargando próximas pasadas programadas/, 'stop next services');
    await waitForBody(page, /GTFS oficial DTPR|programa publicado/, 'programmed stop services source copy');
    await visible(page.locator('[data-live-state="live"]'), 'live block in "live" state', 15_000);
    // Fixture: la 62H (sentido 0 de 62HM) llega en 40 s, a 211 m, patente de mentira PRUE20.
    await waitForBody(page, /Llegadas en vivo[\s\S]*62H[\s\S]*hacia [\s\S]*patente PRUE20[\s\S]*1 min/, 'live arrivals block');
    await waitForBody(page, /fuente no oficial/, 'live arrivals source disclaimer');
    await waitForBody(page, /estimado, sin GPS/, 'non-GPS prediction label');
    // El paradero abierto se marca aunque ninguno de sus recorridos esté visible.
    if ((await page.locator('.stop-marker.is-active').count()) !== 1) {
      fail('Expected the open stop to be drawn as exactly one active stop marker.');
    }
    if ((await page.locator('[role="dialog"][aria-modal="true"]').count()) > 0) {
      fail('Expected detail panels to be non-modal.');
    }
    // G6: en Horario el mapa nunca dibuja GPS, aunque el paradero tenga micros con GPS.
    await waitForCanvas(page, (d) => d.mode === 'schedule' && Number(d.estimated) > 0, 'schedule mode with estimates');
    await wait(1_000);
    const schedule = await canvasData(page);
    if (schedule.gps !== '0') fail(`Horario mode drew GPS vehicles: ${JSON.stringify(schedule)}`);
    await page.getByRole('button', { name: 'Ver en el mapa con GPS en vivo' }).click();
    await waitForUrl(page, (u) => param(u, 'micros') === 'gps', 'Expected micros=gps after "Ver en el mapa con GPS en vivo"');
    // Las 3 micros del paradero con GPS y posición (ni la estimada PRUE21 ni la sin señal).
    const gps = await waitForCanvas(page, (d) => d.mode === 'gps' && Number(d.gps) >= 3, 'GPS mode with the stop vehicles');
    if (gps.estimated !== '0') fail(`GPS mode drew estimated vehicles: ${JSON.stringify(gps)}`);
  }),
);

step('S6 paradero solo de la 302/304: no se consulta la fuente', () =>
  withSession({ url: `/?stop=${lotaOnlyStop}` }, async ({ page, liveStops }) => {
    await visible(page.locator('[data-live-state="untracked"]'), `${lotaOnlyStop} (302/304 only) says the source does not follow its lines`);
    const lotaCode = `P${lotaOnlyStop.replace(/^gtfs-stop-/, '')}`;
    if (liveStops.includes(lotaCode)) fail(`Expected no live query for ${lotaCode}, served only by 302/304.`);
  }),
);

step('S7 metadatos PWA / iOS', () =>
  withSession({ url: '/' }, async ({ page }) => {
    const meta = await page.evaluate(() => ({
      manifest: document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href ?? '',
      appleIcon: document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')?.href ?? '',
      appleTitle: document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')?.content ?? '',
      appleCapable: document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-capable"]')?.content ?? '',
    }));
    if (
      !meta.manifest.endsWith('/manifest.webmanifest') ||
      !meta.appleIcon.endsWith('/apple-touch-icon.png') ||
      meta.appleTitle !== 'conce.patagua.dev' ||
      meta.appleCapable !== 'yes'
    ) {
      fail(`Unexpected PWA/iOS metadata: ${JSON.stringify(meta)}`);
    }
  }),
);

step('S8 capas con carga diferida: cobertura y áreas verdes', () =>
  withSession({ url: '/' }, async ({ page }) => {
    const dialog = await capas(page);
    await dialog.getByRole('switch', { name: 'Cobertura territorial' }).click();
    await waitForBody(page, /Cargando grilla|Distancia al paradero\b|No se pudo cargar/, 'coverage layer status');
    await dialog.getByRole('switch', { name: 'Áreas verdes' }).click();
    await waitForBody(page, /Cargando polígonos|Parques, plazas y reservas|No se pudo cargar/, 'greenspace layer status');
    await waitForUrl(page, (u) => param(u, 'cobertura') === '1' && param(u, 'verdes') === '1', 'Expected layers in the URL');
  }),
);

step('S9 micros en Horario: estimadas de mis líneas y de toda la red', () =>
  withSession({ url: '/' }, async ({ page, vehicleQueries }) => {
    const group = page.getByRole('radiogroup', { name: 'Micros en el mapa' });
    await visible(group.getByRole('radio', { name: 'Horario', checked: true }), 'Horario checked by default');
    const mine = await waitForCanvas(page, (d) => d.mode === 'schedule' && Number(d.estimated) > 0, 'estimates of my lines');
    if (mine.gps !== '0') fail(`Horario drew GPS vehicles: ${JSON.stringify(mine)}`);
    await waitForBody(page, /estimadas/, 'MicrosControl estimate count');
    await page.getByRole('radio', { name: 'Toda la red' }).click();
    await waitForUrl(page, (u) => param(u, 'red') === '1', 'Expected red=1 for "Toda la red"');
    await waitForCanvas(
      page,
      (d) => Number(d.estimated) > Number(mine.estimated),
      `all-network scope adds vehicles (mine ${mine.estimated})`,
    );
    if (vehicleQueries.length > 0) fail('Horario mode queried GPS vehicles.');
  }),
);

step('S10 herramientas: calidad de datos y fondo de pantalla con descarga', () =>
  withSession({ url: '/' }, async ({ page }) => {
    await capas(page);
    await tool(page, 'Planificador').click();
    await gone(page.getByRole('dialog', { name: 'Capas del mapa' }), 'Capas closes when a tool opens');
    await visible(page.getByRole('dialog', { name: /Planificador/ }), 'planner surface');
    await tool(page, 'Calidad de datos').click();
    await visible(page.getByRole('dialog', { name: /Calidad de datos/ }), 'data quality surface');
    await waitForBody(page, /Cobertura de simulación|Segmento largo|Calidad de datos/, 'data quality tool');
    await tool(page, 'Fondo de pantalla').click();
    await visible(page.getByRole('dialog', { name: /Fondo de pantalla/ }), 'wallpaper surface');
    await page.getByRole('button', { name: /Editorial/ }).click();
    await page.getByRole('button', { name: 'Manual', exact: true }).click();
    await page.getByRole('button', { name: 'Generar preview' }).click();
    await visible(page.getByAltText('Vista previa del fondo de pantalla'), 'wallpaper preview', 30_000);
    const downloadPromise = page.waitForEvent('download', { timeout: 45_000 });
    await page.getByRole('button', { name: 'Descargar PNG' }).click();
    const download = await downloadPromise;
    if (!download.suggestedFilename().endsWith('.png')) fail(`Expected PNG wallpaper, got ${download.suggestedFilename()}`);
  }),
);

/**
 * En el teléfono la ficha a media altura no corta ningún botón del riel
 * derecho: o se ve entero o queda del todo bajo la ficha (expandida).
 */
async function railClearOfSheet(page: Page, what: string): Promise<void> {
  // La hoja cambia de alto con una transición de 300 ms.
  await wait(450);
  const clash = await page.evaluate(() => {
    const sheet = document.querySelector('[data-surface] [role="dialog"]')?.getBoundingClientRect();
    if (!sheet) return 'no sheet';
    for (const el of document.querySelectorAll('[data-map-rail] button')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const x = Math.min(r.right, sheet.right) - Math.max(r.left, sheet.left);
      const y = Math.min(r.bottom, sheet.bottom) - Math.max(r.top, sheet.top);
      if (x > 0 && y > 0 && y < r.height) {
        return `${el.getAttribute('aria-label')} [${Math.round(r.top)}–${Math.round(r.bottom)}] vs sheet top ${Math.round(sheet.top)}`;
      }
    }
    return null;
  });
  if (clash) fail(`Rail button cut by the sheet (${what}): ${clash}`);
}

step('S11 móvil: ficha de paradero, capas y menú de herramientas', () =>
  withSession({ mobile: true, url: '/?stop=gtfs-stop-37477' }, async ({ page }) => {
    await waitForBody(page, /Próximas pasadas|Cargando próximas pasadas programadas/, 'mobile stop panel');
    await visible(page.getByRole('button', { name: 'Cerrar' }), 'mobile sheet close button');
    await railClearOfSheet(page, 'stop sheet');
    await page.getByRole('button', { name: 'Expandir panel' }).click();
    await visible(page.getByRole('button', { name: 'Reducir panel' }), 'expanded mobile sheet');
    await goto(page, '/');
    await capas(page);
    await tool(page, 'Planificador').click();
    await gone(page.getByRole('dialog', { name: 'Capas del mapa' }), 'mobile Capas closes when the planner opens');
    // En móvil las herramientas secundarias viven en el menú "Más herramientas".
    await page.getByRole('button', { name: 'Más herramientas' }).click();
    await page.getByRole('menuitemradio', { name: 'Calidad de datos' }).click();
    await visible(page.getByRole('dialog', { name: /Calidad de datos/ }), 'mobile data quality surface');
    if ((await page.getByRole('menu').count()) !== 0) fail('Mobile tools menu stayed open after choosing a tool.');
    // "Más herramientas" queda encendido (herramienta del menú a la vista) y entero sobre la ficha.
    await railClearOfSheet(page, 'tool from the overflow menu');
  }),
);

step('S12 wiki y enlaces desde el wiki (?focus=)', () =>
  withSession({}, async ({ page }) => {
    for (const slug of ['gtfs-gran-concepcion', 'ruta-201-santa-juana', 'openstreetmap-fuente-visor']) {
      await page.goto(`${BASE_URL}/wiki/${slug}`, { waitUntil: 'load' });
      await waitForBody(page, /Wiki|Fuente|Ruta|GTFS|OpenStreetMap/, `wiki article ${slug}`);
    }
    for (const [focus, text] of [
      ['route:201', /201|Santa Juana/],
      ['route:L1', /Hualqui|Biotrén|L1/],
      ['terminal:osm-way-135488014', /Intermodal|Concepción/],
    ] as const) {
      await goto(page, `/?focus=${focus}`);
      await surfaceWith(page, text, `focus ${focus}`);
      await visible(page.getByRole('link', { name: /Ver en el wiki/i }), `wiki link for ${focus}`);
      if (page.url().includes('focus=')) fail(`Expected focus= to be removed from the URL, got ${page.url()}`);
    }
    // G10: un corredor abre su ficha, sin popup de Leaflet.
    await goto(page, '/?focus=corridor:concepcion-florida');
    await surfaceWith(page, /Florida/, 'corridor sheet from ?focus=corridor:');
    if ((await page.locator('.leaflet-popup').count()) > 0) fail('Corridor opened a Leaflet popup.');
    await waitForUrl(page, (u) => param(u, 'corredor') === 'concepcion-florida', 'Expected ?corredor= in the URL');
  }),
);

step('S13 GPS en vivo vence con el reloj (modo GPS)', () =>
  withSession({ playwrightClock: true }, async (session) => {
    const { page } = session;
    // Sin líneas en el mapa: solo las micros del paradero (las de /api/route-vehicles
    // traen la hora del servidor de ejemplo, que no avanza con este reloj).
    await goto(page, '/?stop=gtfs-stop-37477&micros=gps&lineas=');
    await visible(page.locator('[data-live-state="live"]'), 'live block before the clock moves', 15_000);
    await waitForCanvas(page, (d) => d.mode === 'gps' && Number(d.gps) >= 3, 'GPS vehicles before expiry');
    // Con la fuente caída, pasados 10 min las posiciones vencen: el bloque dice
    // "caída" (nunca "sin micros") y el mapa no dibuja ninguna.
    session.setLiveUp(false);
    await page.clock.fastForward('11:00');
    await page
      .locator('[data-live-state="down"]')
      .waitFor({ timeout: 15_000 })
      .catch(async () => {
        const state = await page.locator('[data-live-state]').getAttribute('data-live-state');
        fail(`Expected the live block to be "down" 11 min after a failure, got "${state}"`);
      });
    await waitForCanvas(page, (d) => d.gps === '0' && d.estimated === '0', 'no GPS vehicles after the data expired');
  }),
);

step('N1 ⌘K → ficha → recorrido → sentido → paradero; Atrás/Adelante', () =>
  withSession({ url: '/' }, async ({ page }) => {
    // "30Q" es la variante del sentido 0: abre el recorrido 30QE en ese sentido.
    await pickFromPalette(page, '30Q', /^\s*30Q(?!\/)/);
    await surfaceWith(page, /30Q\/E/, 'route sheet 30Q/E');
    await waitForUrl(page, (u) => param(u, 'route') === '30QE' && param(u, 'dir') === '0', 'Expected the variant 30Q to open dir=0');
    await page.getByRole('tab', { name: 'Recorrido' }).click();
    await page.getByRole('group', { name: 'Sentido' }).getByRole('button', { name: /^30E/ }).click();
    await waitForUrl(
      page,
      (u) => param(u, 'route') === '30QE' && param(u, 'dir') === '1' && param(u, 'tab') === 'recorrido',
      'Expected ?route=30QE&dir=1&tab=recorrido',
    );
    await wait(1_500);
    const routeZoom = await mapZoom(page);
    // Un paradero del sentido 30E, por su nombre en la lista del recorrido.
    const stopId = ROUTE_30QE.directions?.[1]?.stopIds?.[3];
    const stopName = GTFS_STOPS.find((stop) => stop.id === stopId)?.name;
    if (!stopName) fail('30QE has no named stop in direction 1');
    await surface(page).getByRole('button', { name: new RegExp(stopName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first().click();
    await visible(page.getByRole('button', { name: 'Volver a 30Q/E' }), 'stop sheet with "← 30Q/E"');
    if (!new URL(page.url()).searchParams.has('stop')) fail(`Expected ?stop= after tapping a stop, got ${page.url()}`);
    await wait(1_500);
    await page.goBack();
    await waitForUrl(
      page,
      (u) => param(u, 'route') === '30QE' && param(u, 'dir') === '1' && param(u, 'tab') === 'recorrido' && !u.searchParams.has('stop'),
      'Back returns to the route sheet with tab and direction',
    );
    await visible(page.getByRole('tab', { name: 'Recorrido', selected: true }), 'Recorrido tab kept after Back');
    await wait(1_500);
    const restoredZoom = await mapZoom(page);
    if (Number.isFinite(routeZoom) && restoredZoom !== routeZoom) {
      fail(`Expected Back to restore the map zoom ${routeZoom}, got ${restoredZoom}`);
    }
    await page.goBack();
    await noSurface(page, 'second Back closes the route sheet');
    if (new URL(page.url()).origin !== BASE_URL || new URL(page.url()).search !== '') {
      fail(`Expected to stay on the visor at "/", got ${page.url()}`);
    }
    await page.goForward();
    await surfaceWith(page, /30Q\/E/, 'Forward re-opens the route sheet');
    await wait(1_500);
    const forwardZoom = await mapZoom(page);
    if (Number.isFinite(routeZoom) && forwardZoom !== routeZoom) {
      fail(`Expected Forward to restore the map zoom ${routeZoom}, got ${forwardZoom}`);
    }
  }),
);

step('N2 enlace directo: el primer Atrás cierra la ficha y queda en el visor', () =>
  withSession({ url: '/?route=30QE' }, async ({ page }) => {
    await surfaceWith(page, /30Q\/E/, 'deep-linked route sheet');
    await page.goBack();
    await noSurface(page, 'first Back after a deep link');
    const url = new URL(page.url());
    if (url.origin !== BASE_URL || url.pathname !== '/') fail(`Expected to stay on the visor, got ${page.url()}`);
  }),
);

step('N3 Escape: cierra solo ⌘K; en un campo de texto no cierra la ficha', () =>
  withSession({ url: '/?route=30QE' }, async ({ page }) => {
    await surfaceWith(page, /30Q\/E/, 'route sheet');
    await openPalette(page);
    await page.keyboard.press('Escape');
    await gone(page.getByPlaceholder('Buscar recorridos, paraderos…'), 'palette closed by Escape');
    await surfaceWith(page, /30Q\/E/, 'route sheet survives Escape on the palette');
    const search = page.getByRole('complementary', { name: 'Recorridos' }).getByLabel('Buscar recorrido por número o destino');
    await search.click();
    await search.fill('10');
    await page.keyboard.press('Escape');
    await wait(500);
    await surfaceWith(page, /30Q\/E/, 'route sheet survives Escape in the sidebar search');
    // Un tooltip de ayuda (foco en una herramienta) no se queda con el Escape: un solo toque cierra la ficha.
    await tool(page, 'Planificador').focus();
    await visible(page.getByRole('tooltip').filter({ hasText: 'Planificador' }), 'tool hint tooltip');
    await page.keyboard.press('Escape');
    await noSurface(page, 'one Escape closes the sheet even with a hint tooltip open');
    await page.locator('.leaflet-container').focus();
    await page.keyboard.press('Escape');
    await noSurface(page, 'Escape on the map closes the sheet');
  }),
);

step('N4 elegir origen/destino: cancelar, cerrar, captura y paso a B', () =>
  withSession({ url: '/?lineas=30QE&micros=off' }, async ({ page }) => {
    await tool(page, 'Planificador').click();
    await page.getByRole('button', { name: 'Elegir origen' }).click();
    await visible(page.getByRole('status').filter({ hasText: 'Toca el mapa para elegir el origen' }), 'origin pick banner');
    if (!(await page.locator('.leaflet-container.is-picking').count())) fail('Expected the crosshair (is-picking) while picking.');
    await page.locator('.leaflet-container').focus();
    await page.keyboard.press('Escape');
    await gone(page.getByRole('status').filter({ hasText: 'Toca el mapa para elegir' }), 'Escape cancels the pick');
    if (new URL(page.url()).searchParams.has('a')) fail('Escape while picking set a point.');
    await visible(page.getByRole('dialog', { name: /Planificador/ }), 'planner stays after cancelling the pick');
    // Elegir de nuevo y cerrar el planificador termina la elección.
    await page.getByRole('button', { name: 'Elegir origen' }).click();
    await page.getByRole('button', { name: 'Cerrar' }).first().click();
    await noSurface(page, 'planner closed with ×');
    await gone(page.locator('.leaflet-container.is-picking'), 'pick ends when the planner closes');
    await zoomOutForLines(page);
    const onLine = await linePoint(page, COLOR_30QE);
    await page.mouse.click(onLine.x, onLine.y);
    await surfaceWith(page, /30Q\/E/, 'map clicks select lines again after the pick ended');
    // En modo elegir, tocar una línea fija el punto y no abre nada; luego pasa a B.
    await tool(page, 'Planificador').click();
    await page.getByRole('button', { name: 'Elegir origen' }).click();
    const a = await linePoint(page, COLOR_30QE);
    await page.mouse.click(a.x, a.y);
    await waitForUrl(page, (u) => u.searchParams.has('a'), 'Expected a= after picking the origin');
    await visible(page.getByRole('status').filter({ hasText: 'Toca el mapa para elegir el destino' }), 'pick moves to B');
    await visible(page.getByRole('dialog', { name: /Planificador/ }), 'still the planner after tapping a line in pick mode');
    const b = await emptyMapPoint(page, 0.35, 0.6);
    await page.mouse.click(b.x, b.y);
    await waitForUrl(page, (u) => u.searchParams.has('b'), 'Expected b= after picking the destination');
    await gone(page.getByRole('status').filter({ hasText: 'Toca el mapa para elegir' }), 'pick ends after B');
    await gone(page.locator('.leaflet-container.is-picking'), 'crosshair gone after B');
  }),
);

step('N5 "Salir desde aquí": planificador con A y destino; Atrás en dos pasos', () =>
  withSession({ url: '/?stop=gtfs-stop-37477' }, async ({ page }) => {
    await page.getByRole('button', { name: 'Salir desde aquí' }).click();
    await visible(page.getByRole('dialog', { name: /Planificador/ }), 'planner after "Salir desde aquí"');
    await waitForBody(page, /Cerca de/, 'origin shown as the nearest stop');
    await visible(page.getByRole('status').filter({ hasText: 'Toca el mapa para elegir el destino' }), 'destination pick banner');
    await page.goBack();
    await gone(page.getByRole('status').filter({ hasText: 'Toca el mapa para elegir' }), 'first Back ends the pick');
    await visible(page.getByRole('dialog', { name: /Planificador/ }), 'planner stays after the first Back');
    await page.goBack();
    await visible(page.locator('[data-live-state]'), 'second Back returns to the stop sheet');
  }),
);

step('N6 Capas no toca la selección; Escape y Atrás cierran solo Capas', () =>
  withSession({ url: '/?route=30QE' }, async ({ page }) => {
    await surfaceWith(page, /30Q\/E/, 'route sheet');
    const dialog = await capas(page);
    if (param(new URL(page.url()), 'route') !== '30QE') fail('Opening Capas changed the route in the URL.');
    await dialog.getByRole('switch', { name: 'Paraderos GTFS' }).click();
    await waitForUrl(page, (u) => param(u, 'paraderos') === '1', 'Expected paraderos=1');
    await surfaceWith(page, /30Q\/E/, 'route sheet stays while toggling a layer');
    await page.keyboard.press('Escape');
    await gone(page.getByRole('dialog', { name: 'Capas del mapa' }), 'Escape closes Capas');
    await surfaceWith(page, /30Q\/E/, 'route sheet stays after Escape on Capas');
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName);
    if (focused !== 'Capas del mapa') fail(`Closing Capas should return focus to its button, focus is on ${focused}`);
    await capas(page);
    await page.goBack();
    await gone(page.getByRole('dialog', { name: 'Capas del mapa' }), 'Back closes Capas');
    await surfaceWith(page, /30Q\/E/, 'route sheet stays after Back on Capas');
    if (param(new URL(page.url()), 'paraderos') !== '1') fail('Back undid a layer toggle.');
    // Recargar con Capas abierta: Capas no vuelve y el primer Atrás no cae en la misma pantalla.
    await capas(page);
    await page.reload({ waitUntil: 'load' });
    await surfaceWith(page, /30Q\/E/, 'route sheet after reloading with Capas open');
    await wait(1_000);
    if ((await page.getByRole('dialog', { name: 'Capas del mapa' }).count()) > 0) fail('Capas came back after a reload.');
    await page.goBack();
    await noSurface(page, 'first Back after reloading with Capas open closes the sheet');
  }),
);

step('N7 "Operando ahora" de noche: foco, aviso, catálogo vacío y conteos', () =>
  withSession({ clock: NIGHT, url: '/?route=30QE&activos=1' }, async ({ page }) => {
    await surfaceWith(page, /Fuera de horario ahora/, 'route sheet says it is out of service');
    const chip = page.locator('[data-map-hint="operating"]');
    await visible(chip.filter({ hasText: /Operando ahora · \d+ líneas? ocultas?/ }), 'operating filter chip');
    const sidebar = page.getByRole('complementary', { name: 'Recorridos' });
    await visible(sidebar.getByRole('button', { name: 'Quitar filtro' }), 'sidebar empty catalog offers "Quitar filtro"');
    await visible(sidebar.locator('[aria-label^="En el mapa"]').filter({ hasText: /L1/ }), '"En el mapa" lists the hidden lines');
    await chip.getByRole('button', { name: 'Quitar' }).click();
    await waitForUrl(page, (u) => !u.searchParams.has('activos'), 'Expected "Quitar" to clear activos=1');
  }),
);

step('N8 elegir el recorrido abierto otra vez no lo cierra', () =>
  withSession({ url: '/?route=30QE' }, async ({ page }) => {
    await surfaceWith(page, /30Q\/E/, 'route sheet');
    const before = await page.evaluate(() => history.length);
    await pickFromPalette(page, '30QE', /30Q\/E/);
    await surfaceWith(page, /30Q\/E/, 'still open after choosing it again from ⌘K');
    const sidebar = page.getByRole('complementary', { name: 'Recorridos' });
    await sidebar.getByLabel('Buscar recorrido por número o destino').fill('30Q');
    await sidebar.getByRole('button', { name: /^30Q\/E/ }).first().click();
    await surfaceWith(page, /30Q\/E/, 'still open after choosing it again from the sidebar');
    const after = await page.evaluate(() => history.length);
    if (after !== before) fail(`Re-selecting pushed history entries (${before} → ${after}).`);
  }),
);

step('N9 líneas: elegir no agrega; operadores con Deshacer; restaurar; recarga y wiki', () =>
  withSession({ url: '/?route=30QE' }, async ({ page }) => {
    await surfaceWith(page, /30Q\/E/, 'route sheet');
    await visible(page.getByRole('button', { name: 'Agregar al mapa' }), 'sheet offers "Agregar al mapa"');
    if (new URL(page.url()).searchParams.has('lineas')) fail('Selecting a line added it to the map.');
    await tool(page, 'Operadores').click();
    const panel = page.getByRole('dialog', { name: /Operadores/ });
    await visible(panel, 'operators panel');
    await panel.getByRole('button', { name: /Mostrar \d+ recorridos?/ }).first().click();
    await visible(page.locator('[data-map-notice]').filter({ hasText: /Agregados \d+/ }), 'notice "Agregados N"');
    await visible(panel, 'operators panel stays open');
    await waitForUrl(page, (u) => u.searchParams.has('lineas'), 'Expected lineas= after adding an operator');
    await page.locator('[data-map-notice]').getByRole('button', { name: 'Deshacer' }).click();
    await waitForUrl(page, (u) => !u.searchParams.has('lineas'), 'Expected Deshacer to restore the default lines');
    // El panel quedó encima de la ficha: Atrás vuelve a ella y "Agregar al mapa" la suma.
    await page.goBack();
    await surfaceWith(page, /30Q\/E/, 'route sheet after Back from the operators panel');
    await page.getByRole('button', { name: 'Agregar al mapa' }).click();
    await waitForUrl(page, (u) => (param(u, 'lineas') ?? '').includes('30QE'), 'Expected 30QE in lineas=');
    await page.reload({ waitUntil: 'load' });
    await waitForUrl(page, (u) => (param(u, 'lineas') ?? '').includes('30QE'), 'lineas= survives a reload');
    await page.goto(`${BASE_URL}/wiki`, { waitUntil: 'load' });
    await page.goBack({ waitUntil: 'load' });
    await waitForUrl(page, (u) => (param(u, 'lineas') ?? '').includes('30QE'), 'lineas= survives a round trip to the wiki');
    await page.getByRole('button', { name: 'Restaurar vista inicial' }).click();
    await waitForUrl(page, (u) => !u.searchParams.has('lineas'), 'Expected "Restaurar vista inicial" to drop lineas=');
  }),
);

step('N10 resultado de una herramienta: ficha con "←" y vuelta con el estado intacto', () =>
  withSession({}, async ({ page }) => {
    const [a, b] = [ROUTE_30QE.path[5], ROUTE_30QE.path[ROUTE_30QE.path.length - 40]];
    await goto(page, `/?panel=planificador&lineas=30QE&a=${a[0].toFixed(5)},${a[1].toFixed(5)}&b=${b[0].toFixed(5)},${b[1].toFixed(5)}`);
    const planner = page.getByRole('dialog', { name: /Planificador/ });
    await visible(planner, 'planner from the URL');
    await planner.getByRole('button', { name: /30Q\/E/ }).first().click();
    await visible(page.getByRole('button', { name: 'Volver a Planificador' }), 'route sheet with "← Planificador"');
    await page.getByRole('button', { name: 'Volver a Planificador' }).click();
    await visible(planner.getByRole('button', { name: /30Q\/E/ }), 'planner results intact after Back');
    if (!new URL(page.url()).searchParams.has('a')) fail('Planner points lost after Back.');

    await tool(page, 'Calidad de datos').click();
    const quality = page.getByRole('dialog', { name: /Calidad de datos/ });
    await visible(quality, 'quality panel');
    const result = quality.getByRole('button', { name: /^Ver la ficha del recorrido/ }).first();
    await result.click();
    await visible(page.getByRole('button', { name: 'Volver a Calidad de datos' }), 'route sheet with "← Calidad de datos"');
    await page.goBack();
    await visible(quality, 'quality panel after Back');

    // El formulario del fondo de pantalla sobrevive a cerrarlo y abrirlo.
    await tool(page, 'Fondo de pantalla').click();
    await page.getByRole('button', { name: /Editorial/ }).click();
    await page.getByRole('button', { name: 'Cerrar' }).first().click();
    await tool(page, 'Fondo de pantalla').click();
    await visible(page.getByRole('button', { name: /Editorial/, pressed: true }), 'wallpaper form kept after reopening');
  }),
);

step('N11 móvil: tres alturas, barra lateral, elegir punto y bienvenida', () =>
  withSession({ mobile: true, welcome: true, url: '/' }, async ({ page }) => {
    await visible(page.getByRole('button', { name: /Buscar recorrido|Buscar/ }).first(), 'welcome / search');
    await pickFromPalette(page, '30QE', /30Q\/E/);
    const sheet = surface(page);
    await visible(sheet, 'mobile route sheet');
    const snap = () => sheet.first().getAttribute('data-snap');
    const handle = page.getByRole('button', { name: /Expandir panel|Reducir panel/ }).first();
    const box = await handle.boundingBox();
    if (box && (await snap()) === 'half') {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 160, { steps: 8 });
      await page.mouse.up();
      await page.waitForFunction(() => document.querySelector('[data-surface]')?.getAttribute('data-snap') === 'peek', null, { timeout: 5_000 }).catch(async () =>
        fail(`Expected a swipe down from half to peek, got ${await snap()}`),
      );
    }
    // La barra lateral es una capa del historial: asoma la ficha y Atrás la cierra.
    await page.getByRole('button', { name: 'Mostrar u ocultar barra lateral' }).click();
    await visible(page.locator('aside[aria-label="Recorridos"][data-state="open"]'), 'mobile sidebar open');
    await page.waitForFunction(() => document.querySelector('[data-surface]')?.getAttribute('data-snap') === 'peek', null, { timeout: 5_000 }).catch(() =>
      fail('Expected the sheet to peek while the mobile sidebar is open'),
    );
    await page.goBack();
    await page
      .locator('aside[aria-label="Recorridos"][data-state="closed"]')
      .waitFor({ state: 'attached', timeout: 5_000 })
      .catch(() => fail('Back did not close the mobile sidebar'));
    // Asomada, la hoja muestra solo el título corto: se comprueba por la URL.
    if (param(new URL(page.url()), 'route') !== '30QE') fail(`Back closed more than the sidebar: ${page.url()}`);
    await visible(surface(page), 'route sheet stays after closing the sidebar');
    // Elegir un punto también asoma la hoja.
    await page.getByRole('button', { name: 'Planificador', exact: true }).last().click();
    await page.getByRole('button', { name: 'Elegir origen' }).click();
    await page.waitForFunction(() => document.querySelector('[data-surface]')?.getAttribute('data-snap') === 'peek', null, { timeout: 5_000 }).catch(() =>
      fail('Expected the sheet to peek while picking a point'),
    );
    await page.getByRole('status').filter({ hasText: 'Toca el mapa para elegir' }).getByRole('button', { name: 'Cancelar' }).click();
    // La bienvenida no vuelve tras el primer uso; "Cómo usar el mapa" la muestra.
    await goto(page, '/');
    await wait(1_000);
    if (await page.getByRole('region', { name: 'Cómo empezar' }).count()) fail('Welcome card came back after first use.');
    await page.getByRole('button', { name: 'Cómo usar el mapa' }).click();
    await visible(page.getByRole('button', { name: /Ver paraderos y llegadas en vivo/ }), 'welcome card shown again from "?"');
  }),
);

step('N12 la flecha del wiki vuelve a la misma entrada del visor', () =>
  withSession({ url: '/?route=30QE' }, async ({ page }) => {
    await surfaceWith(page, /30Q\/E/, 'route sheet');
    const wikiLink = page.getByRole('link', { name: /Ver en el wiki/i }).first();
    if ((await wikiLink.count()) === 0) {
      // 30QE puede no tener artículo: se usa el 201, que sí lo tiene.
      await goto(page, '/?route=201');
    }
    await surfaceWith(page, /201|30Q\/E/, 'route sheet with a wiki article');
    const before = page.url();
    await page.getByRole('link', { name: /Ver en el wiki/i }).first().click();
    await page.waitForURL(/\/wiki/, { timeout: 10_000 });
    // Leer otro artículo antes de volver: la flecha igual vuelve al visor, no al artículo anterior.
    const articleUrl = page.url();
    const nav = page.getByRole('navigation', { name: 'Índice del wiki' });
    if ((await nav.count()) > 0 && (await nav.isVisible())) {
      await nav.locator('button:not([aria-current])').nth(1).click();
      await page.waitForURL((u) => u.href !== articleUrl, { timeout: 10_000 });
    }
    await page.getByRole('link', { name: 'Volver al visor' }).click();
    await page.waitForURL((u) => !u.pathname.startsWith('/wiki'), { timeout: 10_000 });
    await page.locator('.leaflet-container').waitFor();
    if (page.url() !== before) fail(`Expected the wiki arrow to return to ${before}, got ${page.url()}`);
    await visible(surface(page), 'route sheet open after returning from the wiki');
  }),
);

step('N12b un <MapLink> del wiki: Atrás vuelve al artículo en un paso', () =>
  withSession({}, async ({ page }) => {
    for (const [href, text] of [
      ['/?focus=route:L1', /Hualqui|L1/],
      ['/?focus=route:NOEXISTE', null],
    ] as const) {
      await page.goto(`${BASE_URL}/wiki/biotren`, { waitUntil: 'load' });
      await waitForBody(page, /Biotrén/, 'wiki article');
      // Un enlace del artículo (misma web, con referrer del wiki).
      await page.evaluate((h) => {
        const a = document.createElement('a');
        a.href = h;
        a.id = 'smoke-map-link';
        a.textContent = 'Ver en el mapa';
        document.body.prepend(a);
      }, href);
      await page.click('#smoke-map-link');
      await page.locator('.leaflet-container').waitFor({ timeout: 20_000 });
      if (text) await surfaceWith(page, text, `sheet from ${href}`);
      else await visible(page.locator('[data-map-notice]'), `notice for ${href}`);
      await page.goBack();
      await page
        .waitForURL((u) => u.pathname === '/wiki/biotren', { timeout: 10_000 })
        .catch(() => fail(`Back after the MapLink ${href} should return to the article, got ${page.url()}`));
    }
  }),
);

step('N13 enlaces inválidos avisan y se limpian; aviso de zoom de paraderos', async () => {
  for (const [path, text] of [
    ['/?route=NOEXISTE', /No encontramos el recorrido «NOEXISTE»/],
    ['/?stop=NOEXISTE', /No encontramos el paradero «NOEXISTE»/],
  ] as const) {
    // Sesión nueva (about:blank + el enlace): el enlace inválido no deja una entrada muerta.
    await withSession({ url: path }, async ({ page }) => {
      await visible(page.locator('[data-map-notice]').filter({ hasText: text }), `notice for ${path}`);
      await waitForUrl(page, (u) => u.search === '', `Expected ${path} to be cleaned from the URL`);
      await noSurface(page, `no sheet for ${path}`);
      const length = await page.evaluate(() => history.length);
      if (length !== 2) fail(`${path} left ${length - 2} extra history entries (history.length ${length}).`);
      await page.goBack();
      await page
        .waitForURL((u) => u.href === 'about:blank', { timeout: 10_000 })
        .catch(() => fail(`The first Back after ${path} should leave the visor, got ${page.url()}`));
    });
  }
  await withSession({}, async ({ page }) => {
    await goto(page, '/?paraderos=1');
    const chip = page.getByText('Acércate para ver paraderos');
    await visible(chip, 'paraderos zoom chip at the initial zoom');
    await page.getByRole('button', { name: 'Acercar' }).click();
    await gone(chip, 'chip hides after zooming in');
  });
});

step('N14 clic en una línea tras prender y apagar cada capa vectorial', () =>
  withSession({ url: '/?lineas=30QE&micros=off' }, async ({ page }) => {
    await zoomOutForLines(page);
    for (const layer of ['Paraderos GTFS', 'Cobertura territorial', 'Ciclovías', 'Áreas verdes', 'Educación']) {
      const dialog = await capas(page);
      const toggle = dialog.getByRole('switch', { name: new RegExp(`^${layer}`) }).first();
      await toggle.click();
      await wait(1_500);
      await toggle.click();
      await page.keyboard.press('Escape');
      await gone(page.getByRole('dialog', { name: 'Capas del mapa' }), `Capas closed after ${layer}`);
      const point = await linePoint(page, COLOR_30QE);
      await page.mouse.click(point.x, point.y);
      await surfaceWith(page, /30Q\/E/, `line click works after toggling ${layer}`);
      await page.getByRole('button', { name: 'Cerrar' }).first().click();
      await noSurface(page, `sheet closed after ${layer}`);
    }
  }),
);

for (const [label, options] of [
  ['1440x900', { viewport: { width: 1440, height: 900 } }],
  ['1280x720', { viewport: { width: 1280, height: 720 } }],
  ['iPhone 13', { mobile: true }],
] as const) {
  step(`G1 "Micros en el mapa" visible (${label})`, () =>
    withSession({ ...options, url: '/' }, async ({ page }) => {
      const group = page.getByRole('radiogroup', { name: 'Micros en el mapa' });
      await visible(group, 'Micros en el mapa radiogroup');
      const inCapas = await page.locator('[role="dialog"][aria-label="Capas del mapa"] [role="radiogroup"]').count();
      if (inCapas > 0) fail('The micros switch is inside Capas.');
      const box = await group.boundingBox();
      const viewport = page.viewportSize();
      if (!box || !viewport || box.x < 0 || box.y < 0 || box.x + box.width > viewport.width) {
        fail(`Micros switch is off screen: ${JSON.stringify(box)}`);
      }
    }),
  );
}

step('G14 leyenda con muchas líneas a 1280×720: la micro estimada se ve sin desplazar', () =>
  withSession({ viewport: { width: 1280, height: 720 }, url: `/?lineas=${TWENTY_LINES.slice(0, 14).join(',')},L1` }, async ({ page }) => {
    const legend = page.getByRole('region', { name: 'Leyenda del mapa' });
    await visible(legend, 'map legend');
    const symbol = legend.locator('[data-legend-symbol="estimate"]');
    await visible(symbol, 'estimate row in the legend');
    const fits = await symbol.evaluate((row) => {
      const list = row.closest('ul');
      if (!list) return false;
      const a = row.getBoundingClientRect();
      const b = list.getBoundingClientRect();
      return a.top >= b.top - 0.5 && a.bottom <= b.bottom + 0.5;
    });
    if (!fits) fail('The estimate symbol is below the fold of the legend list.');
  }),
);

step('G13 móvil: "Micros en el mapa" plegado en una fila, con la cuenta a la vista', () =>
  withSession({ mobile: true, url: '/' }, async ({ page }) => {
    const control = page.locator('[data-micros-control]');
    await visible(control, '"Micros en el mapa"');
    const box = await control.boundingBox();
    if (!box || box.height > 52) fail(`Collapsed micros control is ${box?.height} px tall (max 52).`);
    // La cuenta de la elegida, siempre a la vista y sin cortar a 390 px.
    const meta = control.locator('[data-micros-meta]');
    await visible(meta.filter({ hasText: /\d+ estimadas?|cargando|sin horario/ }), 'micros meta of the chosen option');
    const cut = await meta.evaluate((el) => el.scrollWidth > el.clientWidth);
    if (cut) fail(`Micros meta is cut: ${await meta.textContent()}`);
    // El estado completo y el alcance, tras "Estado de las micros".
    const allNetwork = page.getByRole('radio', { name: 'Toda la red' });
    if (await allNetwork.isVisible()) fail('"Toda la red" is visible with the micros control collapsed.');
    const status = control.getByRole('button', { name: 'Estado de las micros' });
    await status.click();
    if ((await status.getAttribute('aria-expanded')) !== 'true') fail('"Estado de las micros" did not expand.');
    await visible(allNetwork, '"Toda la red" after opening "Estado de las micros"');
  }),
);

for (const [label, viewport] of [
  ['390', undefined],
  ['360×740', { width: 360, height: 740 }],
] as const) {
  step(`G13 móvil (${label}): en GPS la cuenta plegada no se corta y avisa del dato viejo`, () =>
    withSession({ mobile: true, viewport, url: '/?micros=gps&lineas=24MF,401,421,L1,302' }, async ({ page }) => {
      await waitForCanvas(page, (d) => d.mode === 'gps' && d.stale === '1', 'one stale GPS vehicle');
      const control = page.locator('[data-micros-control]');
      const box = await control.boundingBox();
      if (!box || box.height > 52) fail(`Collapsed micros control is ${box?.height} px tall (max 52).`);
      const meta = control.locator('[data-micros-meta]');
      await visible(meta.filter({ hasText: /\d+ GPS/ }), 'GPS meta of the chosen option');
      const cut = await meta.evaluate((el) => {
        const text = el.querySelector('.truncate') ?? el;
        return text.scrollWidth > text.clientWidth || el.scrollWidth > el.clientWidth;
      });
      if (cut) fail(`GPS meta is cut: ${await meta.textContent()}`);
      // El dato viejo se ve sin el detalle: un ícono, y su texto para lectores de pantalla.
      if ((await meta.getAttribute('data-stale')) !== 'true' || (await meta.locator('svg').count()) === 0) {
        fail('The collapsed GPS meta does not flag the stale vehicle.');
      }
      const description = await page.getByRole('radio', { name: 'GPS en vivo' }).evaluate((radio) => {
        const id = radio.getAttribute('aria-describedby');
        return id ? document.getElementById(id)?.textContent ?? '' : '';
      });
      if (!/1 con dato viejo/.test(description)) fail(`GPS radio description lacks the stale count: "${description}"`);
    }),
  );
}

step('G15 leyenda: abierta y compacta en escritorio ancho, plegada a 768 px', async () => {
  // Cuánto del mapa tapan los controles (micros, leyenda, riel, zoom, atribución).
  const covered = (page: Page) =>
    page.evaluate(() => {
      const map = document.querySelector('.leaflet-container')!.getBoundingClientRect();
      const selector =
        'section[aria-label="Micros en el mapa"], section[aria-label="Leyenda del mapa"], [data-map-rail] button, .leaflet-control-zoom a, .leaflet-control-attribution';
      let area = 0;
      for (const el of document.querySelectorAll(selector)) {
        const r = el.getBoundingClientRect();
        const w = Math.max(0, Math.min(r.right, map.right) - Math.max(r.left, map.left));
        const h = Math.max(0, Math.min(r.bottom, map.bottom) - Math.max(r.top, map.top));
        area += w * h;
      }
      return (100 * area) / (map.width * map.height);
    });
  for (const [url, max, label] of [
    ['/', 12, 'inicio'],
    // En GPS "Detalle por línea" va abierto en escritorio (antes de este diseño, 13,9 %).
    ['/?lineas=24MF,24TR,30QE,201-AU&micros=gps', 15, 'GPS'],
  ] as const) {
    await withSession({ viewport: { width: 1440, height: 900 }, url }, async ({ page }) => {
      const legend = page.getByRole('region', { name: 'Leyenda del mapa' });
      await visible(legend, 'map legend');
      if ((await legend.getByRole('button', { name: 'Leyenda' }).getAttribute('aria-expanded')) !== 'true') {
        fail(`Legend starts collapsed at 1440 px (${label}).`);
      }
      await wait(600);
      const pct = await covered(page);
      if (pct > max) fail(`Map controls cover ${pct.toFixed(1)} % of the map at 1440×900 (${label}, max ${max} %).`);
    });
  }
  await withSession({ viewport: { width: 768, height: 1024 }, url: '/' }, async ({ page }) => {
    const button = page.getByRole('region', { name: 'Leyenda del mapa' }).getByRole('button', { name: 'Leyenda' });
    await visible(button, 'legend button at 768 px');
    if ((await button.getAttribute('aria-expanded')) !== 'false') fail('Legend starts open at 768 px.');
  });
});

step('G2 modo GPS en la URL, con replace', () =>
  withSession({ url: '/' }, async ({ page }) => {
    const before = await page.evaluate(() => history.length);
    await page.getByRole('radio', { name: 'GPS en vivo' }).click();
    await waitForUrl(page, (u) => param(u, 'micros') === 'gps', 'Expected micros=gps');
    const after = await page.evaluate(() => history.length);
    if (after !== before) fail(`Switching micros pushed a history entry (${before} → ${after}).`);
    await page.reload({ waitUntil: 'load' });
    await visible(page.getByRole('radio', { name: 'GPS en vivo', checked: true }), '?micros=gps restores GPS mode');
    await page.getByRole('button', { name: 'Ocultar micros' }).click();
    await waitForUrl(page, (u) => param(u, 'micros') === 'off', 'Expected micros=off');
    await waitForCanvas(page, (d) => d.mode === 'off' || (d.gps === '0' && d.estimated === '0'), 'no vehicles with micros off');
  }),
);

step('G3 modo GPS con datos: conteos y estado por línea', () =>
  withSession({ url: '/?micros=gps&lineas=24MF,401,421,L1,302' }, async ({ page }) => {
    // 24F:R: 2 al día + 1 vieja (4 min) + 1 vencida (7 min, fuera); 24M:I: 2 al día.
    const data = await waitForCanvas(page, (d) => d.mode === 'gps' && d.gps === '5', 'GPS vehicles of 24MF');
    if (data.estimated !== '0') fail(`GPS mode drew estimates: ${JSON.stringify(data)}`);
    if (data.stale !== '1') fail(`Expected 1 stale GPS vehicle, got ${JSON.stringify(data)}`);
    await openGpsDetail(page);
    const status = page.locator('[data-gps-status]');
    for (const [line, state, text] of [
      ['401', 'no-gps', /sin GPS ahora/],
      ['L1', 'untracked', /sin GPS \(la fuente no la sigue\)/],
      ['302', 'untracked', /sin GPS \(la fuente no la sigue\)/],
      ['421', 'unavailable', /no se pudo consultar/],
    ] as const) {
      await visible(
        status.locator(`[data-gps-line="${line}"][data-status="${state}"]`).filter({ hasText: text }),
        `GPS row ${line} ${state}`,
      );
    }
  }),
);

step('G4 modo GPS vacío y sin configurar', async () => {
  await withSession({ url: '/?micros=gps', vehicles: 'empty' }, async ({ page }) => {
    await waitForBody(page, /Ninguna de tus líneas transmite GPS ahora/, 'empty GPS state');
    await visible(page.getByRole('button', { name: 'Cambiar a Horario' }), '"Cambiar a Horario"');
    const data = await waitForCanvas(page, (d) => d.mode === 'gps', 'GPS canvas');
    if (data.gps !== '0' || data.estimated !== '0') fail(`Expected no vehicles, got ${JSON.stringify(data)}`);
  });
  await withSession({ url: '/?micros=gps', vehicles: 'unconfigured' }, async ({ page }) => {
    await waitForBody(page, /El GPS en vivo no está activado en este servidor/, 'unconfigured GPS state');
  });
});

step('G5 veinte líneas en GPS: a lo más 16 sentidos y aviso de tope', () =>
  withSession({ url: `/?micros=gps&lineas=${TWENTY_LINES.join(',')}` }, async ({ page, vehicleQueries }) => {
    await waitForCanvas(page, (d) => d.mode === 'gps', 'GPS canvas');
    const deadline = Date.now() + 10_000;
    while (vehicleQueries.length === 0 && Date.now() < deadline) await wait(200);
    if (vehicleQueries.length === 0) fail('No /api/route-vehicles request in GPS mode.');
    const widest = Math.max(...vehicleQueries.map((q) => q.length));
    if (widest > 16) fail(`Requested ${widest} pairs in one URL (max 16).`);
    await openGpsDetail(page);
    await visible(page.locator('[data-gps-status]').getByText(/Solo se consultan las primeras \d+ líneas/), 'omitted lines row');
  }),
);

step('G5b tope de 16 sentidos sin micros: el estado dice que hay líneas sin consultar', () =>
  withSession({ url: `/?micros=gps&lineas=${TWENTY_LINES.join(',')}`, vehicles: 'empty' }, async ({ page }) => {
    await waitForBody(page, /Ninguna de las \d+ líneas consultadas transmite GPS ahora/, 'empty state names the queried lines');
    await visible(page.locator('[data-gps-omitted-summary]').filter({ hasText: /Se consultan \d+ de 20 líneas/ }), 'omitted summary');
  }),
);

step('G4b móvil con una ficha abierta: el GPS que falta se dice igual', async () => {
  await withSession({ mobile: true, url: '/?micros=gps&route=401' }, async ({ page }) => {
    await visible(page.locator('[data-state="gps-compact"]').filter({ hasText: '401: sin GPS ahora' }), 'compact 401 notice');
  });
  await withSession({ mobile: true, url: '/?micros=gps&route=24MF', vehicles: 'unconfigured' }, async ({ page }) => {
    await visible(page.locator('[data-state="gps-compact"]').filter({ hasText: /no está activado/ }), 'compact unconfigured notice');
  });
});

step('G12 pines A/B fuera del planificador: se explican, se tocan y se quitan', () =>
  withSession({ url: '/?a=-36.81423,-73.07264&b=-36.84322,-73.05376' }, async ({ page }) => {
    const chip = page.locator('[data-map-hint="planner-points"]');
    await visible(chip, '"Puntos A/B del planificador" chip');
    await page.locator('.planner-pin').filter({ hasText: 'A' }).first().click();
    await visible(page.getByRole('dialog', { name: /Planificador/ }), 'tapping pin A opens the planner');
    await page.goBack();
    await noSurface(page, 'Back closes the planner');
    await chip.getByRole('button', { name: 'Quitar' }).click();
    await waitForUrl(page, (u) => !u.searchParams.has('a') && !u.searchParams.has('b'), '"Quitar" removes a= and b=');
    if ((await page.locator('.planner-pin').count()) > 0) fail('Planner pins stayed after "Quitar".');
  }),
);

// ── Corrida ─────────────────────────────────────────────────────────────────

const passed: string[] = [];
try {
  await waitForServer();
  browser = await launchBrowser();
  for (const [name, run] of steps) {
    if (ONLY.length > 0 && !ONLY.some((prefix) => name.startsWith(prefix))) continue;
    const started = Date.now();
    try {
      await run();
    } catch (err) {
      throw new Error(`[${name}] ${err instanceof Error ? err.message : String(err)}`, { cause: err });
    }
    passed.push(name);
    console.log(`ok  ${name} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
  }
  console.log(`Browser smoke OK: ${passed.length} steps (navigation N1–N14, GPS G1–G6, G12, G13 and G15, services, wiki, mobile).`);
} catch (err) {
  console.error(serverOutput.trim());
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGTERM');
  else child.kill('SIGTERM');
}
