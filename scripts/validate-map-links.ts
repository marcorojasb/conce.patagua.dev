// Valida el puente wiki ↔ visor:
//  1. Cada <MapLink …> en artículos apunta a una entidad que existe.
//  2. Cada slug del índice reverso MAP_WIKI_LINKS existe en ARTICLES.
//  3. Cada key del índice (route code / terminal / corridor) existe en data.
//
// Se corre con: npm run maplinks:validate  (incluido en npm run check).

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BIOTREN_L1_STOPS, BIOTREN_L2_STOPS } from '../src/data/biotren.generated.ts';
import { GTFS_BUS_ROUTES } from '../src/data/gtfs-bus-routes.generated.ts';
import { GTFS_STOPS } from '../src/data/gtfs-stops.generated.ts';
import { INTERURBAN_BUS_ROUTES, INTERURBAN_PARADEROS } from '../src/data/interurban-routes.generated.ts';
import { CORRIDOR_BY_ID, INTERURBAN_CORRIDORS } from '../src/data/interurban-corridors.ts';
import { POIS } from '../src/data/pois.generated.ts';
import { TERMINALS } from '../src/data/terminals.generated.ts';
import { MAP_WIKI_LINK_INDEX } from '../src/wiki/map-links.ts';

const ROOT = join(import.meta.dirname, '..');
const ARTICLES_DIR = join(ROOT, 'src/wiki/articles');
const ARTICLES_REGISTRY = join(ROOT, 'src/wiki/articles.ts');

const errors: string[] = [];

function fail(msg: string) {
  errors.push(msg);
}

// --- Entity sets -----------------------------------------------------------

const routeCodes = new Set<string>(['L1', 'L2']);
const routeIds = new Set<string>(['bt-l1', 'bt-l2']);
for (const r of INTERURBAN_BUS_ROUTES) {
  routeCodes.add(r.ref);
  routeIds.add(r.id);
}
for (const r of GTFS_BUS_ROUTES) {
  routeCodes.add(r.ref);
  routeIds.add(r.id);
}

const stopIds = new Set<string>();
for (const s of [...BIOTREN_L1_STOPS, ...BIOTREN_L2_STOPS]) stopIds.add(s.id);
for (const s of GTFS_STOPS) stopIds.add(s.id);
for (const s of INTERURBAN_PARADEROS) stopIds.add(s.id);

const terminalIds = new Set(TERMINALS.map((t) => t.id));
const poiIds = new Set(POIS.map((p) => p.id));
const corridorIds = new Set(INTERURBAN_CORRIDORS.map((c) => c.id));

// Article slugs from the registry (avoid importing lazy React components).
const articleSource = readFileSync(ARTICLES_REGISTRY, 'utf8');
const articleSlugs = new Set(
  [...articleSource.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]!),
);

// --- Scan MapLink usages in article TSX ------------------------------------

type MapLinkKind = 'route' | 'corridor' | 'terminal' | 'stop' | 'poi';

interface MapLinkHit {
  file: string;
  kind: MapLinkKind;
  id: string;
  line: number;
}

function scanArticleFile(filePath: string, relative: string): MapLinkHit[] {
  const text = readFileSync(filePath, 'utf8');
  const hits: MapLinkHit[] = [];
  // Match <MapLink … prop="value" …> across a single tag (no nested JSX).
  const tagRe = /<MapLink\b([^>]*)\/?>/g;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagRe.exec(text)) !== null) {
    const attrs = tagMatch[1] ?? '';
    const line = text.slice(0, tagMatch.index).split('\n').length;
    const propRe = /\b(route|corridor|terminal|stop|poi)=["']([^"']+)["']/g;
    let propMatch: RegExpExecArray | null;
    let found = false;
    while ((propMatch = propRe.exec(attrs)) !== null) {
      found = true;
      hits.push({
        file: relative,
        kind: propMatch[1] as MapLinkKind,
        id: propMatch[2]!,
        line,
      });
    }
    if (!found) {
      fail(`${relative}:${line}: <MapLink> without route/corridor/terminal/stop/poi prop`);
    }
  }
  return hits;
}

const articleFiles = readdirSync(ARTICLES_DIR).filter(
  (f) => f.endsWith('.tsx') && !f.startsWith('_'),
);

const allHits: MapLinkHit[] = [];
for (const file of articleFiles) {
  allHits.push(...scanArticleFile(join(ARTICLES_DIR, file), `src/wiki/articles/${file}`));
}

for (const hit of allHits) {
  const label = `${hit.file}:${hit.line} MapLink ${hit.kind}="${hit.id}"`;
  switch (hit.kind) {
    case 'route':
      if (!routeCodes.has(hit.id) && !routeIds.has(hit.id)) {
        fail(`${label}: route code/id not found in Biotrén, interurban or GTFS datasets`);
      }
      break;
    case 'stop':
      if (!stopIds.has(hit.id)) {
        fail(`${label}: stop id not found in Biotrén/GTFS/interurban stops`);
      }
      break;
    case 'terminal':
      if (!terminalIds.has(hit.id)) {
        fail(`${label}: terminal id not found in terminals.generated.ts`);
      }
      break;
    case 'poi':
      if (!poiIds.has(hit.id)) {
        fail(`${label}: poi id not found in pois.generated.ts`);
      }
      break;
    case 'corridor':
      if (!corridorIds.has(hit.id) && !CORRIDOR_BY_ID.has(hit.id)) {
        fail(`${label}: corridor id not found in interurban-corridors.ts`);
      }
      break;
  }
}

// --- Reverse index integrity -----------------------------------------------

for (const [code, slug] of Object.entries(MAP_WIKI_LINK_INDEX.byRouteCode)) {
  if (!articleSlugs.has(slug)) {
    fail(`map-links byRouteCode["${code}"] → slug "${slug}" not in articles.ts`);
  }
  // Alias codes (ej. "201 AU") pueden vivir en el índice aunque el dataset
  // solo exponga el ref canónico ("201"). Si el visor algún día muestra ese
  // code en una sheet, el botón wiki aparece; si no, la entrada es inocua.
  if (!routeCodes.has(code)) {
    console.warn(
      `Warning: map-links byRouteCode["${code}"] is not in current route datasets (alias or future code).`,
    );
  }
}

for (const [id, slug] of Object.entries(MAP_WIKI_LINK_INDEX.byCorridorId)) {
  if (!articleSlugs.has(slug)) {
    fail(`map-links byCorridorId["${id}"] → slug "${slug}" not in articles.ts`);
  }
  if (!corridorIds.has(id)) {
    fail(`map-links byCorridorId["${id}"]: corridor not in INTERURBAN_CORRIDORS`);
  }
}

for (const [id, slug] of Object.entries(MAP_WIKI_LINK_INDEX.byTerminalId)) {
  if (!articleSlugs.has(slug)) {
    fail(`map-links byTerminalId["${id}"] → slug "${slug}" not in articles.ts`);
  }
  if (!terminalIds.has(id)) {
    fail(`map-links byTerminalId["${id}"]: terminal not in terminals.generated.ts`);
  }
}

// Corridor wikiSlug must also resolve.
for (const c of INTERURBAN_CORRIDORS) {
  if (!articleSlugs.has(c.wikiSlug)) {
    fail(`INTERURBAN_CORRIDORS["${c.id}"].wikiSlug "${c.wikiSlug}" not in articles.ts`);
  }
}

// --- Report ----------------------------------------------------------------

if (errors.length > 0) {
  console.error('Map-link validation failed:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `Map-links OK: ${allHits.length} MapLink(s) in articles, ` +
    `${Object.keys(MAP_WIKI_LINK_INDEX.byRouteCode).length} route reverse, ` +
    `${Object.keys(MAP_WIKI_LINK_INDEX.byTerminalId).length} terminal reverse, ` +
    `${Object.keys(MAP_WIKI_LINK_INDEX.byCorridorId).length} corridor reverse, ` +
    `${INTERURBAN_CORRIDORS.length} corridor pin(s).`,
);
