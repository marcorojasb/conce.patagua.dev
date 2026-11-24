import { spawn } from 'node:child_process';
import { chromium, type Browser, type Page } from 'playwright';
import { GTFS_BUS_ROUTES } from '../src/data/gtfs-bus-routes.generated.ts';
import { stopInfoFixtures } from '../src/realtime/live-arrivals.fixtures.ts';

const PORT = 5175;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Visibles por defecto: Biotrén + interurbanos del GTFS oficial.
const DEFAULT_VISIBLE_ROUTE_IDS = new Set([
  'bt-l1',
  'bt-l2',
  ...GTFS_BUS_ROUTES.filter((r) => r.network?.startsWith('Interurbano')).map((r) => r.id),
]);

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
    .map((stopId) => ({ stopId, code: r.ref }));
})[0];
if (!returnOnlyStop) throw new Error('No GTFS stop served only by a return direction');

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 20_000;
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

// `innerText` devuelve el texto ya transformado por CSS, y varios títulos del
// visor llevan `uppercase` (p. ej. "Próximos servicios" se renderiza
// "PRÓXIMOS SERVICIOS"). Sin la `i` el patrón nunca calza contra el texto
// pintado, aunque el string esté en el DOM.
async function waitForBody(page: Page, pattern: RegExp, label: string): Promise<void> {
  const flags = pattern.flags.includes('i') ? pattern.flags : `${pattern.flags}i`;
  await page.waitForFunction(
    ({ source, flags: f }) => new RegExp(source, f).test(document.body.innerText),
    { source: pattern.source, flags },
    { timeout: 15_000 },
  ).catch(() => {
    throw new Error(`Expected body text for ${label}: ${pattern}`);
  });
}

const child = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
  // Grupo de procesos propio: `npm run dev` lanza vite como nieto, y matar
  // solo a npm deja vite vivo con las tuberías abiertas (el smoke no termina).
  { stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' },
);

let serverOutput = '';
child.stdout.on('data', (chunk) => {
  serverOutput += String(chunk);
});
child.stderr.on('data', (chunk) => {
  serverOutput += String(chunk);
});

let browser: Browser | null = null;

try {
  await waitForServer();
  browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  // Las llegadas en vivo salen de respuestas de ejemplo: el smoke nunca
  // consulta la fuente real (ni la intermediaria la tiene configurada aquí).
  const fixedNowMs = new Date('2026-05-18T08:30:00-04:00').valueOf();
  const liveFixtures = stopInfoFixtures(fixedNowMs / 1000);
  await page.route('**/api/stop-arrivals**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ fetchedAt: fixedNowMs, data: liveFixtures.withBuses }),
    }),
  );
  await page.addInitScript(() => {
    const fixedNow = new Date('2026-05-18T08:30:00-04:00').valueOf();
    const RealDate = Date;
    class MockDate extends RealDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        if (args.length === 0) {
          super(fixedNow);
        } else {
          super(...args);
        }
      }
      static now() {
        return fixedNow;
      }
    }
    globalThis.Date = MockDate as DateConstructor;
  });
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(BASE_URL, { waitUntil: 'load' });
  await waitForBody(page, /conce\.patagua\.dev/, 'initial map shell');

  await page.getByRole('button', { name: 'Buscar recorridos y paraderos' }).click();
  // GTFS oficial DTPR: route_id 833 = "02AD" (variantes 02A/02D); el paradero
  // 37477 (O'Higgins esq. Salas) lo recorren la 62H y decenas de líneas más.
  await page.getByPlaceholder('Buscar recorridos, paraderos…').fill('02AD');
  await page.getByText('02AD', { exact: true }).first().click();
  await waitForBody(page, /02A/, 'route search selection');
  await page.keyboard.press('Escape');

  await page.goto(`${BASE_URL}/?route=gtfs-route-833`, { waitUntil: 'load' });
  await waitForBody(page, /02A|Mirador del Pacífico/, 'GTFS route deep link');

  // La variante de un sentido ("10A", lo que muestra la micro y cita el wiki)
  // abre el recorrido oficial que la contiene (10AN), aunque llegue en el
  // chunk diferido.
  await page.goto(`${BASE_URL}/?focus=route:10A`, { waitUntil: 'load' });
  await waitForBody(page, /10AN/, 'focus by direction variant 10A');
  await page.waitForURL(/[?&]route=gtfs-route-835\b/, { timeout: 10_000 }).catch(() => {
    throw new Error(`Expected ?focus=route:10A to select gtfs-route-835, URL is ${page.url()}`);
  });

  await page.goto(`${BASE_URL}/?stop=${returnOnlyStop.stopId}`, { waitUntil: 'load' });
  await waitForBody(
    page,
    new RegExp(`\\b${returnOnlyStop.code}\\b`),
    `stop ${returnOnlyStop.stopId} served only by the ${returnOnlyStop.code} return direction`,
  );

  // "Operando ahora" sigue el horario oficial por día: a las 08:30 de un
  // lunes la 11C (solo 17:00–19:49) está fuera de horario y la 10AN no.
  const sidebar = page.getByRole('complementary', { name: 'Recorridos' });
  const sidebarSearch = sidebar.getByLabel('Buscar recorrido por número o destino');
  for (const [code, expected] of [['11C', 'Fuera de horario ahora'], ['10AN', 'Operando ahora']] as const) {
    await sidebarSearch.fill(code);
    const row = sidebar.getByRole('button', { name: new RegExp(`^${code} `) }).first();
    await row.locator(`[title="${expected}"]`).waitFor({ timeout: 10_000 }).catch(() => {
      throw new Error(`Expected sidebar row ${code} to say "${expected}"`);
    });
  }
  await sidebarSearch.fill('');
  await page.goto(`${BASE_URL}/?stop=gtfs-stop-37477`, { waitUntil: 'load' });
  await waitForBody(page, /Próximas pasadas|Cargando próximas pasadas programadas/, 'stop next services');
  await waitForBody(page, /GTFS oficial DTPR|programa publicado/, 'programmed stop services source copy');
  await page.locator('[data-live-state="live"]').waitFor({ timeout: 10_000 });
  await waitForBody(page, /Llegadas en vivo[\s\S]*62H[\s\S]*regreso[\s\S]*1 min/, 'live arrivals block');
  await waitForBody(page, /fuente no oficial/, 'live arrivals source disclaimer');
  await page.getByRole('dialog').filter({ hasText: /Ruta 160|Próximas pasadas/ }).first().waitFor({ timeout: 5_000 });
  const modalDetailCount = await page.locator('[role="dialog"][aria-modal="true"]').count();
  if (modalDetailCount > 0) {
    throw new Error('Expected detail panels to be non-modal.');
  }
  await page
    .getByRole('complementary', { name: 'Recorridos' })
    .getByRole('button', { name: /^L1 / })
    .first()
    .click();
  await waitForBody(page, /Hualqui|Mercado/, 'sidebar click while detail panel is open');
  await page.getByRole('button', { name: 'Abrir capas del mapa' }).click();
  await page.getByRole('dialog', { name: 'Capas del mapa' }).waitFor({ timeout: 5_000 });
  const routeDialogsAfterLayers = await page.getByRole('dialog').filter({ hasText: /Hualqui|Mercado/ }).count();
  if (routeDialogsAfterLayers > 0) {
    throw new Error('Detail panel stayed open after opening layers.');
  }
  await page.goto(BASE_URL, { waitUntil: 'load' });

  const pwaMetadata = await page.evaluate(() => ({
    manifest: document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href ?? '',
    appleIcon: document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')?.href ?? '',
    appleTitle: document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')?.content ?? '',
    appleCapable: document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-capable"]')?.content ?? '',
  }));
  if (
    !pwaMetadata.manifest.endsWith('/manifest.webmanifest') ||
    !pwaMetadata.appleIcon.endsWith('/apple-touch-icon.png') ||
    pwaMetadata.appleTitle !== 'conce.patagua.dev' ||
    pwaMetadata.appleCapable !== 'yes'
  ) {
    throw new Error(`Unexpected PWA/iOS metadata: ${JSON.stringify(pwaMetadata)}`);
  }

  await page.getByRole('button', { name: 'Abrir capas del mapa' }).click();
  await page.getByRole('switch', { name: 'Cobertura territorial' }).click();
  await waitForBody(
    page,
    /Cargando grilla|Distancia al paradero mas cercano|Distancia al paradero más cercano|Error al cargar grilla/,
    'coverage layer status',
  );
  await page.getByRole('switch', { name: 'Áreas verdes' }).click();
  await waitForBody(
    page,
    /Cargando polígonos|Parques, plazas, bosques y reservas|Error al cargar polígonos/,
    'greenspace layer status',
  );
  const servicesSwitch = page.getByRole('switch', { name: 'Servicios en curso' });
  const servicesChecked = await servicesSwitch.getAttribute('aria-checked');
  if (servicesChecked !== 'true') {
    throw new Error('Expected Servicios en curso to be enabled by default.');
  }
  await page.waitForSelector('.vehicle-marker', { timeout: 15_000 });
  const unlabeledEstimates = await page.locator('.vehicle-marker:not(.is-estimate)').count();
  if (unlabeledEstimates > 0) {
    throw new Error(`Expected every simulated vehicle to be marked as estimate, got ${unlabeledEstimates} without it.`);
  }

  const bodyText = await page.locator('body').innerText();
  const match = bodyText.match(/([\d.]+)\s+en curso\s+·\s+rutas visibles/);
  const count = match ? Number.parseInt(match[1].replace(/\./g, ''), 10) : 0;
  const markers = await page.locator('.vehicle-marker').count();
  const nonGtfsMarkers = await page.locator('.vehicle-marker:not([data-source-kind="gtfs"])').count();

  if (!Number.isFinite(count) || count <= 0) {
    throw new Error(`Expected active service count > 0, got ${match?.[1] ?? 'none'}`);
  }
  if (markers <= 0) {
    throw new Error('Expected at least one .vehicle-marker');
  }
  if (nonGtfsMarkers <= 0) {
    throw new Error('Expected at least one Biotrén (non-GTFS) .vehicle-marker');
  }
  if (markers === nonGtfsMarkers) {
    throw new Error('Expected official interurban (GTFS) vehicles in the default scope.');
  }
  const markerRouteIds = await page
    .locator('.vehicle-marker')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-route-id') ?? ''));
  const outsideDefault = markerRouteIds.filter((id) => !DEFAULT_VISIBLE_ROUTE_IDS.has(id));
  if (outsideDefault.length > 0) {
    throw new Error(`Default scope drew vehicles of non-visible routes: ${[...new Set(outsideDefault)].join(', ')}`);
  }
  await page.getByRole('button', { name: 'Toda la red' }).click();
  await page.waitForFunction(
    (previous) => document.querySelectorAll('.vehicle-marker').length > previous,
    markers,
    { timeout: 15_000 },
  );
  const allScopeBodyText = await page.locator('body').innerText();
  const allScopeMatch = allScopeBodyText.match(/([\d.]+)\s+en curso\s+·\s+toda la red/);
  const allScopeCount = allScopeMatch ? Number.parseInt(allScopeMatch[1].replace(/\./g, ''), 10) : 0;
  const allScopeMarkers = await page.locator('.vehicle-marker').count();
  if (!Number.isFinite(allScopeCount) || allScopeCount <= count || allScopeMarkers <= markers) {
    throw new Error(`Expected all-network scope to add vehicles, visible=${count}/${markers}, all=${allScopeCount}/${allScopeMarkers}`);
  }
  if (errors.length > 0) {
    throw new Error(`Console errors:\n${errors.join('\n')}`);
  }

  await page.getByRole('button', { name: 'Planificador (cobertura OD)' }).click();
  const layerDialogsAfterTool = await page.getByRole('dialog', { name: 'Capas del mapa' }).count();
  if (layerDialogsAfterTool !== 0) {
    throw new Error('Layer panel stayed open after opening a tool panel.');
  }

  await page.getByRole('button', { name: 'Calidad de datos' }).click();
  await page.getByRole('dialog', { name: 'Calidad de datos' }).waitFor({ timeout: 10_000 });
  await waitForBody(page, /Cobertura de simulación|Segmento largo|Calidad de datos/, 'data quality tool');

  await page.getByRole('button', { name: 'Fondo de pantalla' }).click();
  await page.getByRole('dialog', { name: 'Fondo de pantalla' }).waitFor({ timeout: 5_000 });
  await page.getByRole('button', { name: /Editorial/ }).click();
  await page.getByRole('button', { name: 'Manual', exact: true }).click();
  await page.getByRole('button', { name: 'Generar preview' }).click();
  await page.getByAltText('Previsualización del wallpaper').waitFor({ timeout: 30_000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 45_000 });
  await page.getByRole('button', { name: 'Descargar PNG' }).click();
  const download = await downloadPromise;
  const filename = download.suggestedFilename();
  if (!filename.endsWith('.png')) {
    throw new Error(`Expected PNG wallpaper download, got ${filename}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/?stop=gtfs-stop-37477`, { waitUntil: 'load' });
  await waitForBody(page, /Próximas pasadas|Cargando próximas pasadas programadas/, 'mobile stop panel');
  await page.mouse.wheel(0, 1400);
  await waitForBody(page, /no vienen del GPS|Sin próximas pasadas/, 'mobile detail scroll');
  await page.getByRole('button', { name: 'Cerrar' }).first().waitFor({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Expandir panel' }).click();
  await page.getByRole('button', { name: 'Reducir panel', expanded: true }).waitFor({ timeout: 5_000 });
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Abrir capas del mapa' }).click();
  await page.getByRole('dialog', { name: 'Capas del mapa' }).waitFor({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Planificador (cobertura OD)' }).click();
  const mobileLayerDialogs = await page.getByRole('dialog', { name: 'Capas del mapa' }).count();
  if (mobileLayerDialogs !== 0) {
    throw new Error('Mobile layer panel stayed open after opening planner.');
  }
  // En móvil las herramientas secundarias viven en el menú "Más herramientas".
  await page.getByRole('button', { name: 'Más herramientas' }).click();
  await page.getByRole('menuitemradio', { name: 'Calidad de datos' }).click();
  await page.getByRole('dialog', { name: 'Calidad de datos' }).waitFor({ timeout: 10_000 });
  if ((await page.getByRole('menu').count()) !== 0) {
    throw new Error('Mobile tools menu stayed open after choosing a tool.');
  }

  for (const slug of ['gtfs-gran-concepcion', 'ruta-201-santa-juana', 'openstreetmap-fuente-visor']) {
    await page.goto(`${BASE_URL}/wiki/${slug}`, { waitUntil: 'load' });
    await waitForBody(page, /Wiki|Fuente|Ruta|GTFS|OpenStreetMap/, `wiki article ${slug}`);
  }

  // Wiki → visor deep-links (`MapLink` / `?focus=`). After apply, focus is
  // stripped from the URL; the sheet + wiki reverse button should remain.
  await page.goto(`${BASE_URL}/?focus=route:201`, { waitUntil: 'load' });
  await waitForBody(page, /201|Santa Juana/, 'focus route 201');
  await page.getByRole('link', { name: /Ver en el wiki/i }).first().waitFor({ timeout: 5_000 });

  await page.goto(`${BASE_URL}/?focus=route:L1`, { waitUntil: 'load' });
  await waitForBody(page, /Hualqui|Biotrén|L1/, 'focus route L1');
  await page.getByRole('link', { name: /Ver en el wiki/i }).first().waitFor({ timeout: 5_000 });

  await page.goto(`${BASE_URL}/?focus=terminal:osm-way-135488014`, { waitUntil: 'load' });
  await waitForBody(page, /Intermodal|Concepción/, 'focus terminal intermodal');
  await page.getByRole('link', { name: /Ver en el wiki/i }).first().waitFor({ timeout: 5_000 });

  await page.goto(`${BASE_URL}/?focus=corridor:concepcion-florida`, { waitUntil: 'load' });
  // Corridor focus only flyTo + enables the layer (no detail sheet). Pins
  // render as `.interurban-pin` once INTERURBAN_CORRIDORS is non-empty.
  await page.waitForSelector('.interurban-pin', { timeout: 10_000 }).catch(() => {
    throw new Error('Expected interurban corridor pin after ?focus=corridor:concepcion-florida');
  });

  if (errors.length > 0) {
    throw new Error(`Console errors:\n${errors.join('\n')}`);
  }

  console.log(
    `Browser smoke OK: ${count.toLocaleString('es-CL')} visible-scope services, ${allScopeCount.toLocaleString('es-CL')} all-network services, map/wiki/focus/variant/direction/mobile checks.`,
  );
} catch (err) {
  console.error(serverOutput.trim());
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGTERM');
  else child.kill('SIGTERM');
}
