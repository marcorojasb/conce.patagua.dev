import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS_DIR = join(process.cwd(), 'dist', 'assets');
const KB = 1024;

const budgets: Array<{ pattern: RegExp; maxBytes: number; label: string }> = [
  { pattern: /^index-.*\.js$/, maxBytes: 800 * KB, label: 'main app' },
  { pattern: /^App-.*\.js$/, maxBytes: 750 * KB, label: 'React app shell' },
  { pattern: /gtfs-bus-routes.*\.js$/, maxBytes: 800 * KB, label: 'GTFS routes' },
  { pattern: /gtfs-schedule.*\.js$/, maxBytes: 800 * KB, label: 'GTFS schedules' },
  { pattern: /gtfs-stop-frequency.*\.js$/, maxBytes: 1_100 * KB, label: 'GTFS stop frequency' },
  { pattern: /greenspace.*\.js$/, maxBytes: 1_500 * KB, label: 'green spaces' },
];

function budgetFor(file: string): { maxBytes: number; label: string } {
  return budgets.find((budget) => budget.pattern.test(file)) ?? {
    maxBytes: 500 * KB,
    label: 'unclassified chunk',
  };
}

const jsFiles = readdirSync(ASSETS_DIR).filter((file) => file.endsWith('.js'));
const failures: string[] = [];

for (const file of jsFiles) {
  const size = statSync(join(ASSETS_DIR, file)).size;
  const budget = budgetFor(file);
  if (size > budget.maxBytes) {
    failures.push(
      `${file}: ${(size / KB).toFixed(1)} KB > ${(budget.maxBytes / KB).toFixed(0)} KB (${budget.label})`,
    );
  }
}

if (failures.length > 0) {
  console.error('Bundle budget exceeded:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Bundle budget OK (${jsFiles.length} JS chunks checked).`);
