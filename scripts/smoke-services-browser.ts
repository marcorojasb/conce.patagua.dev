import { spawn } from 'node:child_process';
import { chromium, type Browser, type Page } from 'playwright';

const PORT = 5175;
const BASE_URL = `http://127.0.0.1:${PORT}`;

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

async function waitForBody(page: Page, pattern: RegExp, label: string): Promise<void> {
  await page.waitForFunction(
    ({ source, flags }) => new RegExp(source, flags).test(document.body.innerText),
    { source: pattern.source, flags: pattern.flags },
    { timeout: 15_000 },
  ).catch(() => {
    throw new Error(`Expected body text for ${label}: ${pattern}`);
  });
}

const child = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
  { stdio: ['ignore', 'pipe', 'pipe'] },
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
  await page.getByPlaceholder('Buscar recorridos, paraderos…').fill('02A');
  await page.getByText('02A', { exact: true }).first().click();
  await waitForBody(page, /02A/, 'route search selection');
  await page.keyboard.press('Escape');

  await page.goto(`${BASE_URL}/?route=gtfs-route-2991`, { waitUntil: 'load' });
  await waitForBody(page, /02A|Centinela/, 'GTFS route deep link');
  await page.goto(BASE_URL, { waitUntil: 'load' });

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
    throw new Error('Expected at least one non-GTFS .vehicle-marker');
  }
  if (markers !== nonGtfsMarkers) {
    throw new Error(`Expected default scope to show only visible non-GTFS routes, got ${markers} markers / ${nonGtfsMarkers} non-GTFS.`);
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

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Abrir capas del mapa' }).click();
  await page.getByRole('dialog', { name: 'Capas del mapa' }).waitFor({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Planificador (cobertura OD)' }).click();
  const mobileLayerDialogs = await page.getByRole('dialog', { name: 'Capas del mapa' }).count();
  if (mobileLayerDialogs !== 0) {
    throw new Error('Mobile layer panel stayed open after opening planner.');
  }

  for (const slug of ['gtfs-gran-concepcion', 'ruta-201-santa-juana', 'openstreetmap-fuente-visor']) {
    await page.goto(`${BASE_URL}/wiki/${slug}`, { waitUntil: 'load' });
    await waitForBody(page, /Wiki|Fuente|Ruta|GTFS|OpenStreetMap/, `wiki article ${slug}`);
  }

  if (errors.length > 0) {
    throw new Error(`Console errors:\n${errors.join('\n')}`);
  }

  console.log(
    `Browser smoke OK: ${count.toLocaleString('es-CL')} visible-scope services, ${allScopeCount.toLocaleString('es-CL')} all-network services, map/wiki/mobile checks.`,
  );
} catch (err) {
  console.error(serverOutput.trim());
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser?.close();
  child.kill('SIGTERM');
}
