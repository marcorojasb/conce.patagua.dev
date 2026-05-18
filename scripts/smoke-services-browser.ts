import { spawn } from 'node:child_process';
import { chromium, type Browser } from 'playwright';

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
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(BASE_URL, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Abrir capas del mapa' }).click();
  await page.getByRole('switch', { name: 'Servicios en curso' }).click();
  await page.waitForSelector('.vehicle-marker', { timeout: 15_000 });

  const bodyText = await page.locator('body').innerText();
  const match = bodyText.match(/([\d.]+)\s+programados\s+·\s+GTFS urbano/);
  const count = match ? Number.parseInt(match[1].replace(/\./g, ''), 10) : 0;
  const markers = await page.locator('.vehicle-marker').count();

  if (!Number.isFinite(count) || count <= 0) {
    throw new Error(`Expected active service count > 0, got ${match?.[1] ?? 'none'}`);
  }
  if (markers <= 0) {
    throw new Error('Expected at least one .vehicle-marker');
  }
  if (errors.length > 0) {
    throw new Error(`Console errors:\n${errors.join('\n')}`);
  }

  console.log(`Services smoke OK: ${count.toLocaleString('es-CL')} services, ${markers} markers.`);
} catch (err) {
  console.error(serverOutput.trim());
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser?.close();
  child.kill('SIGTERM');
}
