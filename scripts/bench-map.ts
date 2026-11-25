// Benchmark del mapa con muchas líneas visibles: reposo, puntero, arrastre,
// zoom y encendido de líneas, sobre el build de producción (vite preview).
//
//   npm run build && npm run bench:map
//   npm run bench:map -- --scenario f20,all --throttle 1,4 --assert --json .cache/bench-map/rama.json
//   npm run bench:map -- --port 5285 --shots .cache/bench-map/capturas
//   npm run bench:map -- --base http://127.0.0.1:5285   (servidor ya levantado)
//   npm run bench:map -- --scenario layers --throttle 1,4 --assert   (toda la red + capas temáticas)
//
// Corre en Chromium headless, que compone por software: los valores absolutos
// salen más altos que en un equipo con GPU. Sirve para comparar ramas en la
// misma máquina y para el tope de `--assert` (ver THRESHOLDS), no como medida
// de lo que ve un usuario.
//
// Nunca consulta la fuente en vivo: preview arranca sin TRANSAPP_PHONE_ID en el
// entorno, /api/** se responde con datos de ejemplo (micros GPS sintéticas sobre
// los trazados GTFS; cualquier otra ruta de /api responde 404 y hace fallar la
// corrida), los tiles con un PNG fijo y la calidad del aire (SINCA, externa)
// no se enciende. El reloj del navegador queda
// en martes 24-11-2026 08:00 de Chile (punta de la mañana) y avanza en tiempo
// real; timers y performance.now son los reales.
//
// La barra lateral se maneja por nombres accesibles (SELECTORS): si la UI los
// cambia, se cambian aquí y en ningún otro lado. Los conteos de micros salen de
// los atributos data-* del canvas de micros (canvas.vehicle-canvas).
//
// No es parte de `npm run check`: tarda varios minutos y depende de la máquina.

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { deflateSync } from 'node:zlib';
import { chromium, type CDPSession, type Page } from 'playwright';
import { GTFS_BUS_ROUTES } from '../src/data/gtfs-bus-routes.generated.ts';

const DEFAULT_PORT = 5176;
const FIXED_NOW_MS = Date.parse('2026-11-24T11:00:00Z');
const VIEWPORT = { width: 1440, height: 900 };

const SELECTORS = {
  // Ojo de cada línea de la barra (las 36 lo tienen; parten cerradas, sin filas a la vista).
  familyToggle: 'section[aria-label="Micros urbanas"] button[aria-label^="Ver toda la línea"]',
  // Interruptor "Micros en el mapa: Horario | GPS en vivo".
  gpsMode: { role: 'radio' as const, name: 'GPS en vivo' },
  map: '.leaflet-container',
  vehicleCanvas: 'canvas.vehicle-canvas',
};

// Capas temáticas del escenario "layers" (todas menos la calidad del aire,
// que consulta SINCA fuera de /api).
const ALL_LAYERS_QUERY = '?paraderos=1&cobertura=1&ciclovias=1&verdes=1&educacion=1&terminales=1&pois=1&corredores=1';

type ScenarioId = 'default' | 'f20' | 'all' | 'gps-f20' | 'layers';
const SCENARIOS: Record<ScenarioId, { lines: number; gps: boolean; label: string; query?: string }> = {
  default: { lines: 0, gps: false, label: 'vista inicial (Biotrén + interurbanos)' },
  // Las 20 primeras líneas por número (02…42). Desde que la barra agrupa por
  // línea (2026-11) son otros recorridos que antes: no comparar f20 con
  // mediciones anteriores.
  f20: { lines: 20, gps: false, label: '20 líneas de micros encendidas' },
  // Hay 36 líneas, todas con ojo de grupo: "all" es toda la red visible.
  all: { lines: Infinity, gps: false, label: 'toda la red visible' },
  'gps-f20': { lines: 20, gps: true, label: '20 líneas, modo GPS en vivo (fixtures)' },
  layers: {
    lines: Infinity,
    gps: false,
    label: 'toda la red + paraderos, cobertura, ciclovías, áreas verdes, educación, terminales, lugares y corredores',
    query: ALL_LAYERS_QUERY,
  },
};

interface WindowResult {
  blockedMs: number;
  maxLongMs: number;
  frames: number;
  jankFrames: number;
  worstFrameMs: number;
  maxEventMs: number;
  taskMs: number;
  scriptMs: number;
  styleMs: number;
  layoutMs: number;
}

interface VehicleCounts {
  mode: string | null;
  vehicles: number;
  estimated: number;
  gps: number;
  stale: number;
  drawn: number;
}

interface ScenarioResult {
  scenario: ScenarioId;
  throttle: number;
  counts: {
    domNodes: number;
    markers: number;
    canvases: number;
    heapMB: number;
    layers: number | null;
    vehicles: VehicleCounts | null;
  };
  toggle: { count: number; medianBlockedMs: number; maxEventMs: number; maxLongMs: number };
  idle: WindowResult;
  hover: WindowResult;
  drag: WindowResult;
  zoom: WindowResult;
  /** Reposo de cerca (zoom 16), donde las micros llevan letrero. */
  idleNear: WindowResult;
}

// Topes de `--assert`, por escenario y freno de CPU. Calibrados en un
// contenedor de 4 vCPU (headless) con un prototipo de la arquitectura de
// canvas (trazados y paradas en un canvas, micros en otro): la meta es no
// depender de cuántas líneas haya encendidas. blocked = suma de (tarea larga − 50 ms).
interface Threshold {
  idleBlockedMs: number;
  idleJankPct: number;
  hoverMaxEventMs: number;
  dragBlockedMs: number;
  dragWorstFrameMs: number;
  /** Evento más largo del arrastre (soltar el mapa redibuja): lo que siente el dedo, como INP. */
  dragMaxEventMs: number;
  zoomBlockedMs: number;
  zoomWorstFrameMs: number;
  toggleMaxEventMs: number;
  maxDomNodes: number;
  maxLayers: number;
  maxHeapMB: number;
  /** Marcadores DOM de Leaflet: ninguno por micro ni por parada (plan: ≤ 150 con todas las capas). */
  maxMarkers: number;
}
// El evento de soltar un arrastre tiene el mismo tope que encender una línea:
// son los dos toques que redibujan todo el mapa.
const F20_1X: Threshold = { idleBlockedMs: 50, idleJankPct: 3, hoverMaxEventMs: 60, dragBlockedMs: 200, dragWorstFrameMs: 150, dragMaxEventMs: 150, zoomBlockedMs: 200, zoomWorstFrameMs: 200, toggleMaxEventMs: 150, maxDomNodes: 4000, maxLayers: 120, maxHeapMB: 35, maxMarkers: 150 };
const ALL_1X: Threshold = { idleBlockedMs: 150, idleJankPct: 5, hoverMaxEventMs: 80, dragBlockedMs: 300, dragWorstFrameMs: 200, dragMaxEventMs: 200, zoomBlockedMs: 300, zoomWorstFrameMs: 250, toggleMaxEventMs: 200, maxDomNodes: 4000, maxLayers: 120, maxHeapMB: 40, maxMarkers: 150 };
const ALL_4X: Threshold = { idleBlockedMs: 900, idleJankPct: 8, hoverMaxEventMs: 200, dragBlockedMs: 600, dragWorstFrameMs: 800, dragMaxEventMs: 600, zoomBlockedMs: 1200, zoomWorstFrameMs: 900, toggleMaxEventMs: 600, maxDomNodes: 4000, maxLayers: 120, maxHeapMB: 40, maxMarkers: 150 };
const THRESHOLDS: Record<string, Threshold> = {
  // La vista inicial no puede empeorar respecto de antes del canvas: reposo 0, arrastre ≤ 30 ms, zoom ≤ 29 ms.
  'default@1': { ...F20_1X, idleBlockedMs: 0, dragBlockedMs: 30, zoomBlockedMs: 29 },
  'f20@1': F20_1X,
  'gps-f20@1': F20_1X,
  'all@1': ALL_1X,
  'f20@4': { idleBlockedMs: 500, idleJankPct: 5, hoverMaxEventMs: 150, dragBlockedMs: 400, dragWorstFrameMs: 600, dragMaxEventMs: 400, zoomBlockedMs: 800, zoomWorstFrameMs: 700, toggleMaxEventMs: 400, maxDomNodes: 4000, maxLayers: 120, maxHeapMB: 35, maxMarkers: 150 },
  'all@4': ALL_4X,
  // Toda la red con las capas temáticas: los topes de toda la red, salvo dos
  // cosas medidas: cada marcador DOM (terminales 26, lugares 79, corredores 2)
  // es su propia capa de composición, y a 4x cada zoom redibuja además
  // paraderos, educación, ciclovías y áreas verdes (~1,25 s en 8 pasos).
  'layers@1': { ...ALL_1X, maxLayers: 200 },
  'layers@4': { ...ALL_4X, maxLayers: 200, zoomBlockedMs: 1500 },
};

function parseArgs(argv: string[]) {
  const get = (name: string): string | undefined => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    if (hit) return hit.slice(name.length + 3);
    const i = argv.indexOf(`--${name}`);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
  };
  const scenarios = (get('scenario') ?? 'default,f20,all').split(',') as ScenarioId[];
  for (const s of scenarios) if (!(s in SCENARIOS)) throw new Error(`Escenario desconocido: ${s}`);
  const port = Number(get('port') ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port <= 0) throw new Error(`Puerto inválido: ${get('port')}`);
  return {
    scenarios,
    throttles: (get('throttle') ?? '1').split(',').map(Number),
    assert: argv.includes('--assert'),
    json: get('json'),
    base: get('base'),
    shots: get('shots'),
    port,
  };
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buf) {
    let c = (crc ^ byte) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Tile gris de 256×256: decodificar y componer cuesta lo mismo que uno real,
// sin depender de la red.
function tilePng(): Buffer {
  const size = 256;
  const raw = Buffer.alloc((size * 3 + 1) * size, 230);
  for (let y = 0; y < size; y++) raw[y * (size * 3 + 1)] = 0;
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Micros GPS de ejemplo: 8 por servicio, repartidas sobre el trazado del
// sentido cuyo letrero calza con el nombre del servicio ("24F:R" → variante 24F).
function gpsFixture(url: string): string {
  const pairs = (new URL(url).searchParams.get('services') ?? '').split(',').filter(Boolean);
  const services: Record<string, unknown> = {};
  for (const pair of pairs) {
    const [service, dir] = pair.split(':');
    const direction = GTFS_BUS_ROUTES.flatMap((r) => r.directions ?? []).find(
      (d) => d.variant === service || `${d.variant}${dir}` === service,
    );
    const path = direction?.path ?? [[-36.82, -73.05]];
    const vehicles = Array.from({ length: 8 }, (_, i) => {
      const [lat, lng] = path[Math.floor(((i + 0.5) / 8) * path.length)] ?? path[0];
      return { plate: null, lat, lng, bearing: (i * 45) % 360, reportedAt: FIXED_NOW_MS - 20_000 };
    });
    services[pair] = { status: 'ok', fetchedAt: FIXED_NOW_MS - 5_000, vehicles };
  }
  return JSON.stringify({ fetchedAt: FIXED_NOW_MS, services });
}

const INIT_SCRIPT = `
try { localStorage.setItem('conce.welcome', 'hidden'); localStorage.setItem('conce.theme', 'light'); } catch {}
(() => {
  const RealDate = Date;
  const offset = ${FIXED_NOW_MS} - RealDate.now();
  function FixedDate(...args) {
    if (!new.target) return new RealDate(RealDate.now() + offset).toString();
    return args.length ? new RealDate(...args) : new RealDate(RealDate.now() + offset);
  }
  FixedDate.prototype = RealDate.prototype;
  FixedDate.now = () => RealDate.now() + offset;
  FixedDate.UTC = RealDate.UTC;
  FixedDate.parse = RealDate.parse;
  Object.setPrototypeOf(FixedDate, RealDate);
  globalThis.Date = FixedDate;
})();
window.__bench = { long: [], frames: [], events: [] };
new PerformanceObserver((list) => { for (const e of list.getEntries()) __bench.long.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true });
new PerformanceObserver((list) => { for (const e of list.getEntries()) __bench.events.push(e.duration); }).observe({ type: 'event', durationThreshold: 16, buffered: true });
(function frame(t) { __bench.frames.push(t); requestAnimationFrame(frame); })(performance.now());
`;

async function cdpMetrics(cdp: CDPSession): Promise<Record<string, number>> {
  const { metrics } = await cdp.send('Performance.getMetrics');
  return Object.fromEntries(metrics.map((m) => [m.name, m.value]));
}

async function measure(page: Page, cdp: CDPSession, action: () => Promise<void>): Promise<WindowResult> {
  const before = await cdpMetrics(cdp);
  const start = await page.evaluate(() => {
    const b = (window as any).__bench;
    return [performance.now(), b.long.length, b.frames.length, b.events.length];
  });
  await action();
  const result = await page.evaluate(([t, li, fi, ei]) => {
    const b = (window as any).__bench;
    const longs: Array<[number, number]> = b.long.slice(li).filter(([s]: [number, number]) => s >= t - 5);
    const frames: number[] = b.frames.slice(fi);
    const gaps = frames.slice(1).map((x, i) => x - frames[i]);
    return {
      blockedMs: Math.round(longs.reduce((a, [, d]) => a + Math.max(0, d - 50), 0)),
      maxLongMs: Math.round(Math.max(0, ...longs.map(([, d]) => d))),
      frames: gaps.length,
      jankFrames: gaps.filter((g) => g > 50).length,
      worstFrameMs: Math.round(Math.max(0, ...gaps)),
      maxEventMs: Math.round(Math.max(0, ...b.events.slice(ei))),
    };
  }, start);
  const after = await cdpMetrics(cdp);
  const ms = (k: string) => Math.round((after[k] - before[k]) * 1000);
  return {
    ...result,
    taskMs: ms('TaskDuration'),
    scriptMs: ms('ScriptDuration'),
    styleMs: ms('RecalcStyleDuration'),
    layoutMs: ms('LayoutDuration'),
  };
}

async function compositingLayers(cdp: CDPSession): Promise<number | null> {
  const layers = new Promise<number | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), 4000);
    cdp.once('LayerTree.layerTreeDidChange', (e) => {
      clearTimeout(timer);
      resolve(e.layers?.length ?? null);
    });
  });
  await cdp.send('LayerTree.enable');
  const n = await layers;
  await cdp.send('LayerTree.disable');
  return n;
}

// Rutas de /api que pidió la app y que el benchmark no conoce: la corrida falla.
const unexpectedApi: string[] = [];

async function vehicleCounts(page: Page): Promise<VehicleCounts | null> {
  return page.evaluate((selector) => {
    const canvas = document.querySelector<HTMLCanvasElement>(selector);
    if (!canvas) return null;
    const n = (key: string) => Number(canvas.dataset[key] ?? 0);
    return {
      mode: canvas.dataset.mode ?? null,
      vehicles: n('vehicles'),
      estimated: n('estimated'),
      gps: n('gps'),
      stale: n('stale'),
      drawn: n('drawn'),
    };
  }, SELECTORS.vehicleCanvas);
}

async function runScenario(
  baseUrl: string,
  scenario: ScenarioId,
  throttle: number,
  shots: string | undefined,
): Promise<ScenarioResult> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: VIEWPORT, colorScheme: 'light' });
    const page = await context.newPage();
    const tile = tilePng();
    await page.route('**/api/**', (r) => {
      const url = r.request().url();
      const { pathname } = new URL(url);
      if (pathname === '/api/route-vehicles') {
        return r.fulfill({ status: 200, contentType: 'application/json', body: gpsFixture(url) });
      }
      if (pathname === '/api/stop-arrivals') {
        return r.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unconfigured"}' });
      }
      unexpectedApi.push(pathname);
      return r.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"not_found"}' });
    });
    await page.route(/arcgisonline\.com/, (r) => r.fulfill({ status: 200, contentType: 'image/png', body: tile }));
    await page.addInitScript({ content: INIT_SCRIPT });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable', { timeDomain: 'threadTicks' });
    if (throttle !== 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });

    await page.goto(`${baseUrl}/${SCENARIOS[scenario].query ?? ''}`, { waitUntil: 'load' });
    await page.locator(SELECTORS.familyToggle).first().waitFor({ timeout: 60_000 });
    await page.waitForTimeout(throttle > 1 ? 6000 : 3000);
    const settle = throttle > 1 ? 1500 : 700;

    const { lines, gps } = SCENARIOS[scenario];
    const toggles: WindowResult[] = [];
    const buttons = page.locator(SELECTORS.familyToggle);
    const n = await buttons.count();
    for (let i = 0; i < n && toggles.length < lines; i++) {
      const button = buttons.nth(i);
      if ((await button.getAttribute('aria-pressed')) === 'true' || !(await button.isVisible())) continue;
      toggles.push(
        await measure(page, cdp, async () => {
          await button.click();
          await page.waitForTimeout(settle);
        }),
      );
    }
    if (gps) {
      await page.getByRole(SELECTORS.gpsMode.role, { name: SELECTORS.gpsMode.name }).click();
      await page.waitForTimeout(settle * 2);
    }
    await page.waitForTimeout(settle * 2);

    await cdp.send('HeapProfiler.collectGarbage');
    const after = await cdpMetrics(cdp);
    const dom = await page.evaluate(() => ({
      markers: document.querySelectorAll('.leaflet-marker-icon').length,
      canvases: document.querySelectorAll('.leaflet-pane canvas').length,
    }));
    const vehicles = await vehicleCounts(page);
    const layers = await compositingLayers(cdp);
    if (shots) {
      mkdirSync(shots, { recursive: true });
      await page.screenshot({ path: `${shots}/${scenario}-${throttle}x.png` });
    }

    const idle = await measure(page, cdp, () => page.waitForTimeout(10_000));
    const box = await page.locator(SELECTORS.map).boundingBox();
    if (!box) throw new Error('El mapa no tiene tamaño');
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const hover = await measure(page, cdp, async () => {
      for (let s = 0; s < 40; s++) {
        await page.mouse.move(cx - 300 + s * 15, cy - 150 + s * 7);
        await page.waitForTimeout(50);
      }
    });
    const drag = await measure(page, cdp, async () => {
      for (let k = 0; k < 3; k++) {
        await page.mouse.move(cx, cy);
        await page.mouse.down();
        for (let s = 1; s <= 20; s++) await page.mouse.move(cx + s * 12, cy + s * 6);
        await page.mouse.up();
        await page.waitForTimeout(300);
      }
    });
    const zoom = await measure(page, cdp, async () => {
      await page.mouse.move(cx, cy);
      for (const dy of [-300, -300, -300, -300, 300, 300, 300, 300]) {
        await page.mouse.wheel(0, dy);
        await page.waitForTimeout(450);
      }
    });

    // De cerca (zoom 13 → 16 con el control): letreros, y nada debería animarse en reposo.
    for (let k = 0; k < 3; k++) {
      await page.locator('.leaflet-control-zoom-in').click();
      await page.waitForTimeout(settle);
    }
    await page.waitForTimeout(settle);
    const idleNear = await measure(page, cdp, () => page.waitForTimeout(5_000));

    const blocked = toggles.map((t) => t.blockedMs).sort((a, b) => a - b);
    return {
      scenario,
      throttle,
      counts: {
        domNodes: after.Nodes,
        markers: dom.markers,
        canvases: dom.canvases,
        heapMB: Math.round(after.JSHeapUsedSize / 1048576),
        layers,
        vehicles,
      },
      toggle: {
        count: toggles.length,
        medianBlockedMs: blocked[Math.floor(blocked.length / 2)] ?? 0,
        maxEventMs: Math.max(0, ...toggles.map((t) => t.maxEventMs)),
        maxLongMs: Math.max(0, ...toggles.map((t) => t.maxLongMs)),
      },
      idle,
      hover,
      drag,
      zoom,
      idleNear,
    };
  } finally {
    await browser.close();
  }
}

function check(result: ScenarioResult): string[] {
  const limit = THRESHOLDS[`${result.scenario}@${result.throttle}`];
  if (!limit) return [];
  const failures: string[] = [];
  const over = (what: string, value: number | null, max: number) => {
    if (value != null && value > max) failures.push(`${result.scenario}@${result.throttle}x ${what}: ${value} > ${max}`);
  };
  over('reposo bloqueado ms', result.idle.blockedMs, limit.idleBlockedMs);
  over('reposo % cuadros > 50 ms', Math.round((100 * result.idle.jankFrames) / Math.max(1, result.idle.frames)), limit.idleJankPct);
  over('arrastre bloqueado ms', result.drag.blockedMs, limit.dragBlockedMs);
  over('arrastre peor cuadro ms', result.drag.worstFrameMs, limit.dragWorstFrameMs);
  over('arrastre, evento máx (soltar) ms', result.drag.maxEventMs, limit.dragMaxEventMs);
  over('zoom bloqueado ms', result.zoom.blockedMs, limit.zoomBlockedMs);
  over('zoom peor cuadro ms', result.zoom.worstFrameMs, limit.zoomWorstFrameMs);
  over('encender línea, evento máx ms', result.toggle.maxEventMs, limit.toggleMaxEventMs);
  over('puntero, evento máx ms', result.hover.maxEventMs, limit.hoverMaxEventMs);
  over('reposo a zoom 16 bloqueado ms', result.idleNear.blockedMs, limit.idleBlockedMs);
  over(
    'reposo a zoom 16 % cuadros > 50 ms',
    Math.round((100 * result.idleNear.jankFrames) / Math.max(1, result.idleNear.frames)),
    limit.idleJankPct,
  );
  over('nodos DOM', result.counts.domNodes, limit.maxDomNodes);
  over('capas de composición', result.counts.layers, limit.maxLayers);
  over('heap MB', result.counts.heapMB, limit.maxHeapMB);
  over('marcadores DOM', result.counts.markers, limit.maxMarkers);
  const v = result.counts.vehicles;
  const gps = SCENARIOS[result.scenario].gps;
  if (!v) {
    failures.push(`${result.scenario}@${result.throttle}x: no está ${SELECTORS.vehicleCanvas}`);
  } else if (gps ? v.mode !== 'gps' || v.estimated > 0 : v.mode !== 'schedule' || v.gps > 0) {
    // Estimadas y GPS nunca se mezclan: cada modo dibuja solo su fuente.
    failures.push(`${result.scenario}@${result.throttle}x: micros mezcladas o modo inesperado ${JSON.stringify(v)}`);
  }
  return failures;
}

async function waitForServer(url: string): Promise<void> {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // preview todavía no responde
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`vite preview no respondió en ${url}`);
}

const options = parseArgs(process.argv.slice(2));
let server: ReturnType<typeof spawn> | null = null;
let baseUrl = options.base;
if (!baseUrl) {
  if (!existsSync('dist/index.html')) throw new Error('Falta dist/: corre `npm run build` antes del benchmark.');
  baseUrl = `http://127.0.0.1:${options.port}`;
  // Grupo de procesos propio para poder matar a vite junto con npx. La
  // variable se saca del entorno (no basta vaciarla): así la intermediaria
  // nunca consulta la fuente real.
  const env = { ...process.env };
  delete env.TRANSAPP_PHONE_ID;
  server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(options.port), '--strictPort'], {
    stdio: 'ignore',
    detached: true,
    env,
  });
}

const results: ScenarioResult[] = [];
try {
  await waitForServer(baseUrl);
  for (const throttle of options.throttles) {
    for (const scenario of options.scenarios) {
      const r = await runScenario(baseUrl, scenario, throttle, options.shots);
      results.push(r);
      const v = r.counts.vehicles;
      console.log(
        `${scenario.padEnd(8)} ${throttle}x · DOM ${r.counts.domNodes} · capas ${r.counts.layers ?? '?'} · heap ${r.counts.heapMB} MB` +
          ` · marcadores ${r.counts.markers} · micros ${v ? `${v.mode} ${v.vehicles} (estimadas ${v.estimated}, GPS ${v.gps}, viejas ${v.stale}, dibujadas ${v.drawn})` : '?'}` +
          ` · reposo ${r.idle.blockedMs} ms (${r.idle.jankFrames}/${r.idle.frames} cuadros > 50 ms)` +
          ` · puntero ${r.hover.maxEventMs} ms · arrastre ${r.drag.blockedMs} ms (peor ${r.drag.worstFrameMs}, soltar ${r.drag.maxEventMs})` +
          ` · zoom ${r.zoom.blockedMs} ms (peor ${r.zoom.worstFrameMs})` +
          ` · encender ${r.toggle.count} líneas: mediana ${r.toggle.medianBlockedMs} ms, evento máx ${r.toggle.maxEventMs} ms` +
          ` · reposo z16 ${r.idleNear.blockedMs} ms (${r.idleNear.jankFrames}/${r.idleNear.frames}, script ${r.idleNear.scriptMs} ms)`,
      );
    }
  }
} finally {
  if (server?.pid) process.kill(-server.pid, 'SIGTERM');
}

if (options.json) {
  mkdirSync(dirname(options.json), { recursive: true });
  writeFileSync(options.json, JSON.stringify({ at: new Date().toISOString(), results, unexpectedApi }, null, 2));
}
if (unexpectedApi.length > 0) {
  console.error(`Pedidos a /api sin respuesta de ejemplo: ${[...new Set(unexpectedApi)].join(', ')}`);
  process.exit(1);
}
if (options.assert) {
  const failures = results.flatMap(check);
  if (failures.length > 0) {
    console.error('Mapa sobre el presupuesto de rendimiento:');
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('Rendimiento del mapa dentro del presupuesto.');
}
