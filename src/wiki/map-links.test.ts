import { describe, expect, it } from 'vitest';
import { ARTICLES } from '@/wiki/articles';
import {
  findWikiSlugForCorridor,
  findWikiSlugForRouteCode,
  findWikiSlugForTerminal,
  MAP_WIKI_LINK_INDEX,
  mapFocusUrl,
  wikiUrl,
} from '@/wiki/map-links';

const articleSlugs = new Set(ARTICLES.map((a) => a.slug));

describe('MAP_WIKI_LINKS reverse index', () => {
  it('maps Biotrén and interurban route codes to known articles', () => {
    expect(findWikiSlugForRouteCode('L1')).toBe('biotren');
    expect(findWikiSlugForRouteCode('L2')).toBe('biotren');
    expect(findWikiSlugForRouteCode('201')).toBe('ruta-201-santa-juana');
    expect(findWikiSlugForRouteCode('201 AU')).toBe('ruta-201-santa-juana');
    expect(findWikiSlugForRouteCode('401')).toBe('concepcion-tome');
    expect(findWikiSlugForRouteCode('411')).toBe('concepcion-tome');
    expect(findWikiSlugForRouteCode('421')).toBe('concepcion-tome');
  });

  it('returns null for unknown route codes', () => {
    expect(findWikiSlugForRouteCode('10A')).toBeNull();
    expect(findWikiSlugForRouteCode('')).toBeNull();
  });

  it('maps key terminals to articles', () => {
    expect(findWikiSlugForTerminal('osm-way-135488014')).toBe('recorridos-interurbanos');
    expect(findWikiSlugForTerminal('osm-way-114474600')).toBe('recorridos-interurbanos');
    expect(findWikiSlugForTerminal('osm-way-597586612')).toBe('recorridos-interurbanos');
    expect(findWikiSlugForTerminal('osm-node-6718688807')).toBe('concepcion-coronel-lota');
    expect(findWikiSlugForTerminal('osm-way-425356582')).toBe('concepcion-tome');
  });

  it('maps Florida and Yumbel corridor ids', () => {
    expect(findWikiSlugForCorridor('concepcion-florida')).toBe('concepcion-florida');
    expect(findWikiSlugForCorridor('concepcion-yumbel')).toBe('concepcion-yumbel');
  });

  it('only references existing wiki article slugs', () => {
    const slugs = [
      ...Object.values(MAP_WIKI_LINK_INDEX.byRouteCode),
      ...Object.values(MAP_WIKI_LINK_INDEX.byCorridorId),
      ...Object.values(MAP_WIKI_LINK_INDEX.byTerminalId),
    ];
    for (const slug of slugs) {
      expect(articleSlugs.has(slug), `missing article for slug "${slug}"`).toBe(true);
    }
  });
});

describe('wikiUrl / mapFocusUrl', () => {
  it('builds public wiki paths', () => {
    expect(wikiUrl('biotren')).toBe('/wiki/biotren');
  });

  it('builds focus deep-links with encoding', () => {
    expect(mapFocusUrl('route', '201')).toBe('/?focus=route:201');
    expect(mapFocusUrl('route', '201 AU')).toBe('/?focus=route:201%20AU');
    expect(mapFocusUrl('corridor', 'concepcion-florida')).toBe(
      '/?focus=corridor:concepcion-florida',
    );
  });
});
