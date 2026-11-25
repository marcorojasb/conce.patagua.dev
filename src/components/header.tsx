import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Bus, Github, Moon, PanelLeft, Search, Sun, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';
import type { Theme } from '@/types/transport';
import type { HeaderProps } from '@/types/ui-contracts';

// El buscador (cmdk + diálogo) se descarga la primera vez que se abre.
const CommandPalette = lazy(() => import('@/components/command-palette'));

const REPO_URL = 'https://github.com/marcorojasb/conce.patagua.dev';

interface AppHeaderProps {
  /** A la izquierda de la marca: la barra lateral en el visor, volver en el wiki. */
  leading: ReactNode;
  /** Ícono de la marca: micro en el visor, libro en el wiki. */
  icon: LucideIcon;
  title: string;
  /** El visor rotula la página con la marca; en el wiki el h1 es el del artículo. */
  titleAs?: 'h1' | 'div';
  subtitle: string;
  repoUrl: string;
  repoLabel: string;
  theme: Theme;
  onToggleTheme: () => void;
  /** Ranura derecha, antes de GitHub y el tema (el buscador del visor). */
  children?: ReactNode;
}

/**
 * Encabezado común del visor y del wiki: misma altura, marca y botones. No
 * importa datos (ni `@/data/routes`) para no arrastrar el GTFS al wiki.
 */
export function AppHeader({
  leading,
  icon: Icon,
  title,
  titleAs: Title = 'div',
  subtitle,
  repoUrl,
  repoLabel,
  theme,
  onToggleTheme,
  children,
}: AppHeaderProps) {
  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center gap-1.5 border-b bg-background/95 px-2 md:h-14 md:gap-3 md:px-4">
      {leading}

      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon className="size-4" aria-hidden />
        </div>
        {/* Una sola línea aunque los botones aprieten; semibold como en 7d6cdbf. */}
        <div className="min-w-0 leading-tight">
          <Title className="truncate font-mono text-sm font-semibold tracking-tight">{title}</Title>
          <div className="hidden truncate text-[11px] text-muted-foreground md:block">{subtitle}</div>
        </div>
      </div>

      <Badge variant="outline" className="ml-2 hidden shrink-0 font-mono text-[11px] md:inline-flex">
        open source
      </Badge>

      <div className="flex-1" />

      {children}

      <Tooltip content={repoLabel} side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(repoUrl, '_blank', 'noopener')}
          aria-label={repoLabel}
          className="shrink-0"
        >
          <Github className="size-[18px]" />
        </Button>
      </Tooltip>

      <Tooltip content={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} side="bottom">
        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Cambiar tema" className="shrink-0">
          {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </Button>
      </Tooltip>
    </header>
  );
}

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

  return (
    <AppHeader
      leading={
        <Tooltip content="Mostrar/ocultar barra lateral" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label="Mostrar u ocultar barra lateral"
            className="shrink-0"
          >
            <PanelLeft className="size-[18px]" />
          </Button>
        </Tooltip>
      }
      icon={Bus}
      title="conce.patagua.dev"
      titleAs="h1"
      subtitle="Visor del Gran Concepción"
      repoUrl={REPO_URL}
      repoLabel="Repositorio en GitHub"
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="group relative flex size-10 shrink-0 items-center justify-center rounded-md border bg-background text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-ring md:h-9 md:w-full md:max-w-[280px] md:justify-start md:gap-2 md:px-3"
        aria-label="Buscar recorridos y paraderos"
      >
        <Search className="size-4 opacity-60 md:size-[15px]" />
        <span className="hidden truncate md:inline">Buscar recorridos, paraderos…</span>
        <span className="ml-auto hidden items-center gap-1 md:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

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
    </AppHeader>
  );
}
