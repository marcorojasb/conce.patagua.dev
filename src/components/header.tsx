import { lazy, Suspense, useEffect, useState } from 'react';
import { Github, Moon, PanelLeft, Search, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';
import { ROUTE_TYPES } from '@/data/routes';
import type { HeaderProps } from '@/types/ui-contracts';

// El buscador (cmdk + diálogo) se descarga la primera vez que se abre.
const CommandPalette = lazy(() => import('@/components/command-palette'));

export function Header({
  theme,
  onToggleTheme,
  onToggleSidebar,
  onSelectRoute,
  onSelectStop,
  commandOpen,
  onCommandOpenChange,
}: HeaderProps) {
  const setCommandOpen = onCommandOpenChange;
  // Montado desde la primera apertura: conserva lo escrito entre aperturas.
  const [paletteLoaded, setPaletteLoaded] = useState(commandOpen);
  if (commandOpen && !paletteLoaded) setPaletteLoaded(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onCommandOpenChange(!commandOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandOpen, onCommandOpenChange]);

  const BrandIcon = ROUTE_TYPES.micro.Icon;

  return (
    <header className="relative z-30 flex h-12 items-center gap-1.5 border-b bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:h-14 md:gap-3 md:px-4">
      <Tooltip content="Mostrar/ocultar barra lateral" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Mostrar u ocultar barra lateral"
          className="size-10 shrink-0 md:h-9 md:w-9"
        >
          <PanelLeft className="size-[18px]" />
        </Button>
      </Tooltip>

      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BrandIcon className="size-4" />
        </div>
        {/* min-w-0 + truncate keeps the title on a single line on narrow
            viewports even when the toolbar (search, github, theme) crowds it. */}
        <div className="min-w-0 leading-tight">
          <h1 className="truncate font-mono text-sm font-semibold tracking-tight">
            conce.patagua.dev
          </h1>
          <div className="hidden truncate text-[11px] text-muted-foreground md:block">
            Visor del Gran Concepción
          </div>
        </div>
      </div>

      <div className="ml-2 hidden md:flex">
        <Badge variant="outline" className="font-mono text-[10px]">
          open source
        </Badge>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="group relative flex size-10 shrink-0 items-center justify-center rounded-md border bg-background text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-ring md:h-9 md:w-full md:max-w-[280px] md:justify-start md:gap-2 md:px-3"
        aria-label="Buscar recorridos y paraderos"
      >
        <Search className="size-4 opacity-60 md:h-[15px] md:w-[15px]" />
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
          className="size-10 shrink-0 md:h-9 md:w-9"
        >
          <Github className="size-[18px]" />
        </Button>
      </Tooltip>

      <Tooltip content={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label="Cambiar tema"
          className="size-10 shrink-0 md:h-9 md:w-9"
        >
          {theme === 'dark' ? (
            <Sun className="size-[18px]" />
          ) : (
            <Moon className="size-[18px]" />
          )}
        </Button>
      </Tooltip>

      {paletteLoaded && (
        <Suspense fallback={null}>
          <CommandPalette
            open={commandOpen}
            onOpenChange={setCommandOpen}
            onSelectRoute={onSelectRoute}
            onSelectStop={onSelectStop}
          />
        </Suspense>
      )}
    </header>
  );
}
