// Botón "Ver en el wiki →" que renderiza solo si la entidad tiene
// artículo dedicado. Se usa en las detail sheets del mapa (route,
// terminal, eventualmente paradero) para llevar al usuario al artículo
// correspondiente sin contaminar la sheet con prosa.
//
// La fuente de verdad es `src/wiki/map-links.ts`. Cualquier nuevo
// enlace mapa→wiki se agrega ahí, NO acá.

import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  findWikiSlugForCorridor,
  findWikiSlugForRouteCode,
  findWikiSlugForTerminal,
  wikiUrl,
} from '@/wiki/map-links';

type Props =
  | { kind: 'route'; code: string; className?: string }
  | { kind: 'corridor'; corridorId: string; className?: string }
  | { kind: 'terminal'; terminalId: string; className?: string }
  | { kind: 'slug'; slug: string; className?: string };

function resolveSlug(props: Props): string | null {
  switch (props.kind) {
    case 'route':
      return findWikiSlugForRouteCode(props.code);
    case 'corridor':
      return findWikiSlugForCorridor(props.corridorId);
    case 'terminal':
      return findWikiSlugForTerminal(props.terminalId);
    case 'slug':
      return props.slug;
  }
}

export function WikiLinkButton(props: Props) {
  const slug = resolveSlug(props);
  if (!slug) return null;
  return (
    <Button size="sm" variant="outline" asChild>
      <a href={wikiUrl(slug)} className={props.className}>
        <BookOpen className="h-3.5 w-3.5" />
        Ver en el wiki
      </a>
    </Button>
  );
}
