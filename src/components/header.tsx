import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Github, MapPin, Moon, PanelLeft, Search, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { ROUTES, ROUTES_BY_ID, ROUTE_TYPES, STOPS } from '@/data/routes';
import { ARTICLES } from '@/wiki/articles';
import type { Theme } from '@/types/transport';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onSelectRoute: (id: string) => void;
  onSelectStop: (id: string) => void;
}

export function Header({
  theme,
  onToggleTheme,
  onToggleSidebar,
  onSelectRoute,
  onSelectStop,
}: HeaderProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const routeMatches = useMemo(
    () =>
      ROUTES.filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          ROUTE_TYPES[r.type].label.toLowerCase().includes(q),
      ),
    [q],
  );
  const stopMatches = useMemo(() => {
    if (!q) return STOPS.slice(0, 6);
    return STOPS.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 10);
  }, [q]);
  const wikiMatches = useMemo(
    () =>
      ARTICLES.filter(
        (a) =>
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q),
      ),
    [q],
  );

  const BrandIcon = ROUTE_TYPES.micro.Icon;

  return (
    <header className="relative z-30 flex h-12 items-center gap-1.5 border-b bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:h-14 md:gap-3 md:px-4">
      <Tooltip content="Mostrar/ocultar barra lateral" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Mostrar u ocultar barra lateral"
          className="h-10 w-10 shrink-0 md:h-9 md:w-9"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </Button>
      </Tooltip>

      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BrandIcon className="h-4 w-4" />
        </div>
        {/* min-w-0 + truncate keeps the title on a single line on narrow
            viewports even when the toolbar (search, github, theme) crowds it. */}
        <div className="min-w-0 leading-tight">
          <div className="truncate font-mono text-sm font-semibold tracking-tight">
            conce.patagua.dev
          </div>
          <div className="hidden truncate text-[11px] text-muted-foreground md:block">
            Visor del Gran Concepción
          </div>
        </div>
      </div>

      <div className="ml-2 hidden md:flex">
        <Badge variant="outline" className="font-mono text-[10px]">
          open source · demo
        </Badge>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-ring md:h-9 md:w-full md:max-w-[280px] md:justify-start md:gap-2 md:px-3"
        aria-label="Buscar recorridos y paraderos"
      >
        <Search className="h-4 w-4 opacity-60 md:h-[15px] md:w-[15px]" />
        <span className="hidden truncate md:inline">Buscar recorridos, paraderos…</span>
        <span className="ml-auto hidden items-center gap-1 md:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

      <Tooltip content="Repositorio en GitHub" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            window.open(
              'https://github.com/marcorojasb/conce.patagua.dev',
              '_blank',
              'noopener',
            )
          }
          aria-label="Repositorio en GitHub"
          className="h-10 w-10 shrink-0 md:h-9 md:w-9"
        >
          <Github className="h-[18px] w-[18px]" />
        </Button>
      </Tooltip>

      <Tooltip content={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label="Cambiar tema"
          className="h-10 w-10 shrink-0 md:h-9 md:w-9"
        >
          {theme === 'dark' ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </Button>
      </Tooltip>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
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
                const Icon = ROUTE_TYPES[r.type].Icon;
                return (
                  <CommandItem
                    key={r.id}
                    value={`${r.code} ${r.name}`}
                    onSelect={() => {
                      setCommandOpen(false);
                      setQuery('');
                      onSelectRoute(r.id);
                    }}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-md text-white"
                      style={{ background: r.color }}
                    >
                      <Icon className="h-[13px] w-[13px]" />
                    </span>
                    <span className="font-medium">{r.code}</span>
                    <span className="truncate text-muted-foreground">{r.name}</span>
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
                  value={s.name}
                  onSelect={() => {
                    setCommandOpen(false);
                    setQuery('');
                    onSelectStop(s.id);
                  }}
                >
                  <MapPin className="h-[15px] w-[15px] text-muted-foreground" />
                  <span className="font-medium">{s.name}</span>
                  <CommandShortcut>
                    {s.routes
                      .map((rid) => ROUTES_BY_ID.get(rid)?.code)
                      .filter(Boolean)
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
                  value={`${a.title} ${a.slug}`}
                  onSelect={() => {
                    setCommandOpen(false);
                    setQuery('');
                    // Navegación interna al wiki: usar mismo patrón que
                    // WikiLinkButton (anchor href) para que respete history
                    // y service worker / preloading del browser.
                    window.location.assign(`/wiki/${a.slug}`);
                  }}
                >
                  <BookOpen className="h-[15px] w-[15px] text-muted-foreground" />
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
    </header>
  );
}
