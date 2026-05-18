import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const ASSETS_DIR = join(process.cwd(), 'dist', 'assets');
const KB = 1024;

const budgets: Array<{ pattern: RegExp; maxBytes: number; maxGzipBytes: number; label: string }> = [
  { pattern: /^index-.*\.js$/, maxBytes: 800 * KB, maxGzipBytes: 90 * KB, label: 'main app' },
  { pattern: /^App-.*\.js$/, maxBytes: 750 * KB, maxGzipBytes: 190 * KB, label: 'React app shell' },
  { pattern: /gtfs-bus-routes.*\.js$/, maxBytes: 800 * KB, maxGzipBytes: 120 * KB, label: 'GTFS routes' },
  { pattern: /gtfs-schedule.*\.js$/, maxBytes: 800 * KB, maxGzipBytes: 65 * KB, label: 'GTFS schedules' },
  { pattern: /gtfs-stop-frequency.*\.js$/, maxBytes: 1_100 * KB, maxGzipBytes: 75 * KB, label: 'GTFS stop frequency' },
  { pattern: /greenspace.*\.js$/, maxBytes: 1_500 * KB, maxGzipBytes: 230 * KB, label: 'green spaces' },
];

function budgetFor(file: string): { maxBytes: number; maxGzipBytes: number; label: string } {
  return budgets.find((budget) => budget.pattern.test(file)) ?? {
    maxBytes: 500 * KB,
    maxGzipBytes: 170 * KB,
    label: 'unclassified chunk',
  };
}

const jsFiles = readdirSync(ASSETS_DIR).filter((file) => file.endsWith('.js'));
const failures: string[] = [];

for (const file of jsFiles) {
  const path = join(ASSETS_DIR, file);
  const size = statSync(path).size;
  const gzipSize = gzipSync(readFileSync(path)).length;
  const budget = budgetFor(file);
  if (size > budget.maxBytes) {
    failures.push(
      `${file}: raw ${(size / KB).toFixed(1)} KB > ${(budget.maxBytes / KB).toFixed(0)} KB (${budget.label})`,
    );
  }
  if (gzipSize > budget.maxGzipBytes) {
    failures.push(
      `${file}: gzip ${(gzipSize / KB).toFixed(1)} KB > ${(budget.maxGzipBytes / KB).toFixed(0)} KB (${budget.label})`,
    );
  }
}

if (failures.length > 0) {
  console.error('Bundle budget exceeded:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Bundle budget OK (${jsFiles.length} JS chunks checked, raw + gzip).`);
