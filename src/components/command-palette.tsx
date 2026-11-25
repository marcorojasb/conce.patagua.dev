// Buscador ⌘K: recorridos (también por la variante de un sentido, "30E"),
// paraderos y artículos del wiki. Se carga recién la primera vez que se abre
// (cmdk y el diálogo de Radix no van en el chunk inicial del visor); después
// queda montado y conserva lo escrito.

import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, MapPin } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';
import { RouteBadge } from '@/components/route-badge';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { ROUTES, ROUTES_BY_ID, ROUTE_TYPES, STOPS, useRoutesVersion } from '@/data/routes';
import {
  directionCode,
  fold,
  matchesRouteQuery,
  routeCodeKey,
  routePillCode,
  routeShortName,
} from '@/lib/route-labels';
import { ARTICLES } from '@/wiki/articles';
import type { Route, RouteDirection } from '@/types/transport';
import type { HeaderProps } from '@/types/ui-contracts';

/**
 * Sentido cuyo letrero es exactamente lo buscado ("30E" en la 30QE): el
 * resultado abre ese sentido. Si lo buscado es el código de la línea, o los
 * dos sentidos usan el mismo letrero, no se elige ninguno.
 */
function variantHit(route: Route, query: string): RouteDirection | null {
  const key = routeCodeKey(query);
  if (!key || routeCodeKey(route.code) === key) return null;
  const hits = (route.directions ?? []).filter((d) => d.variant && routeCodeKey(d.variant) === key);
  return hits.length === 1 ? hits[0] : null;
}

type CommandPaletteProps = Pick<HeaderProps, 'onSelectRoute' | 'onSelectStop'> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CommandPalette({ open, onOpenChange, onSelectRoute, onSelectStop }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const setCommandOpen = onOpenChange;

  // Todo se compara sin tildes ("Lirquén" = "lirquen") y la lista ya filtrada
  // es la que se muestra: cmdk no vuelve a filtrar (shouldFilter={false}).
  const q = fold(query.trim());
  // `ROUTES` y `STOPS` se mutan in-place cuando llega el chunk lazy de micros,
  // así que sin la versión en las deps el buscador queda indexando solo los
  // recorridos y paraderos del primer paint.
  const routesVersion = useRoutesVersion();
  const routeMatches = useMemo(
    () => {
      void routesVersion;
      return ROUTES.filter(
        (r) => matchesRouteQuery(r, q) || fold(ROUTE_TYPES[r.type].label).includes(q),
      );
    },
    [q, routesVersion],
  );
  const stopMatches = useMemo(() => {
    void routesVersion;
    if (!q) return STOPS.slice(0, 6);
    return STOPS.filter((s) => fold(s.name).includes(q)).slice(0, 10);
  }, [q, routesVersion]);
  const wikiMatches = useMemo(
    () =>
      ARTICLES.filter(
        (a) =>
          !q ||
          fold(a.title).includes(q) ||
          fold(a.summary).includes(q) ||
          fold(a.slug).includes(q),
      ),
    [q],
  );

  return (
    <CommandDialog open={open} onOpenChange={setCommandOpen} shouldFilter={false}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Buscar recorridos, paraderos…"
      />
      <CommandList>
        {routeMatches.length === 0 &&
          stopMatches.length === 0 &&
          wikiMatches.length === 0 && (
            <CommandEmpty>Sin resultados.</CommandEmpty>
          )}
        {routeMatches.length > 0 && (
          <CommandGroup heading="Recorridos">
            {routeMatches.map((r) => {
              const hit = variantHit(r, query);
              return (
                <CommandItem
                  key={r.id}
                  value={r.id}
                  onSelect={() => {
                    setCommandOpen(false);
                    setQuery('');
                    if (hit) onSelectRoute(r.id, hit.directionId);
                    else onSelectRoute(r.id);
                  }}
                >
                  <RouteBadge code={hit ? directionCode(r, hit.directionId) : routePillCode(r)} color={r.color} />
                  {hit ? (
                    <span className="flex min-w-0 items-center gap-1">
                      <ArrowRight className="shrink-0 text-muted-foreground" aria-label="hacia" />
                      <span className="truncate font-medium">{hit.destination ?? hit.headsign}</span>
                    </span>
                  ) : (
                    <span className="truncate">{routeShortName(r)}</span>
                  )}
                  <CommandShortcut>{ROUTE_TYPES[r.type].short}</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
        {stopMatches.length > 0 && (
          <CommandGroup heading="Paraderos">
            {stopMatches.map((s) => (
              <CommandItem
                key={s.id}
                value={s.id}
                onSelect={() => {
                  setCommandOpen(false);
                  setQuery('');
                  onSelectStop(s.id);
                }}
              >
                <MapPin className="size-[15px] text-muted-foreground" />
                <span className="min-w-0 truncate font-medium">{s.name}</span>
                <CommandShortcut className="max-w-[45%] shrink-0 truncate font-mono text-[11px] tracking-normal">
                  {s.routes
                    .flatMap((rid) => {
                      const route = ROUTES_BY_ID.get(rid);
                      return route ? [routePillCode(route)] : [];
                    })
                    .join(' · ')}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {wikiMatches.length > 0 && (
          <CommandGroup heading="Wiki">
            {wikiMatches.map((a) => (
              <CommandItem
                key={a.slug}
                value={`wiki-${a.slug}`}
                onSelect={() => {
                  setCommandOpen(false);
                  setQuery('');
                  // Navegación interna al wiki: usar mismo patrón que
                  // WikiLinkButton (anchor href) para que respete history
                  // y service worker / preloading del browser.
                  window.location.assign(`/wiki/${a.slug}`);
                }}
              >
                <BookOpen className="size-[15px] text-muted-foreground" />
                <span className="font-medium">{a.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Kbd>↑↓</Kbd> navegar
          <Kbd>↵</Kbd> abrir
        </div>
        <div className="flex items-center gap-2">
          <Kbd>esc</Kbd> cerrar
        </div>
      </div>
    </CommandDialog>
  );
}
