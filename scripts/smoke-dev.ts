import { spawn } from 'node:child_process';

const PORT = 5174;
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

async function assertPage(path: string, expected: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`${path} returned HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes(expected)) {
    throw new Error(`${path} did not include expected marker: ${expected}`);
  }
}

const child = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);

let output = '';
child.stdout.on('data', (chunk) => {
  output += String(chunk);
});
child.stderr.on('data', (chunk) => {
  output += String(chunk);
});

try {
  await waitForServer();
  await assertPage('/', 'id="root"');
  await assertPage('/wiki', 'id="root"');
  console.log('Smoke OK: / and /wiki answered from Vite dev server.');
} catch (err) {
  console.error(output.trim());
  console.error(err);
  process.exitCode = 1;
} finally {
  child.kill('SIGTERM');
}
