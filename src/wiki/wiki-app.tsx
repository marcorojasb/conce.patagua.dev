// Wiki app, entry point for /wiki and /wiki/{slug}. Same DOM root as the
// visor, swapped at main.tsx based on location.pathname so we don't need
// a routing library yet. State changes via history.pushState; back/forward
// works because we listen to popstate.

import { Suspense, useSyncExternalStore, type MouseEvent } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Pencil } from 'lucide-react';
import { AppHeader } from '@/components/header';
import { buttonVariants } from '@/components/ui/button-variants';
import { Notice } from '@/components/ui/notice';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SectionLabel } from '@/components/ui/section-label';
import { Tooltip } from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { ARTICLES, findArticle, SECTION_LABELS, type ArticleMeta } from './articles';

const REPO_BASE = 'https://github.com/marcorojasb/conce.patagua.dev';

function getSlugFromPath(path: string): string | null {
  const match = path.match(/^\/wiki\/?([^/?#]+)?/);
  if (!match) return null;
  return match[1] ?? null;
}

/** Artículos abiertos dentro del wiki desde que se entró (en `history.state`). */
function wikiDepth(): number {
  const state: unknown = window.history.state;
  const depth = state && typeof state === 'object' ? (state as { wikiDepth?: unknown }).wikiDepth : undefined;
  return typeof depth === 'number' && depth > 0 ? depth : 0;
}

function navigateTo(slug: string | null): void {
  const url = slug ? `/wiki/${slug}` : '/wiki';
  if (window.location.pathname === url) return;
  window.history.pushState({ wikiDepth: wikiDepth() + 1 }, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// Si se llegó desde el visor (misma web, fuera de /wiki), la flecha vuelve a
// esa misma entrada del historial, con la ficha que estaba abierta, aunque se
// hayan leído otros artículos entremedio; si no (enlace directo al wiki), es
// un enlace normal al visor.
function backToVisor(event: MouseEvent<HTMLAnchorElement>): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  let referrer: URL;
  try {
    referrer = new URL(document.referrer);
  } catch {
    return;
  }
  if (referrer.origin !== window.location.origin || referrer.pathname.startsWith('/wiki')) return;
  const steps = wikiDepth() + 1;
  if (window.history.length <= steps) return;
  event.preventDefault();
  window.history.go(-steps);
}

export default function WikiApp() {
  const [theme, toggleTheme] = useTheme();
  const slug = useSyncExternalStore(subscribeToHistory, getCurrentSlug, getCurrentSlug);

  const article = slug ? findArticle(slug) : null;

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <AppHeader
        leading={
          <Tooltip content="Volver al visor" side="bottom">
            <a
              href="/"
              onClick={backToVisor}
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'shrink-0')}
              aria-label="Volver al visor"
            >
              <ArrowLeft className="size-[18px]" />
            </a>
          </Tooltip>
        }
        icon={BookOpen}
        title="conce.patagua.dev/wiki"
        subtitle="Conocimiento contribuido sobre el transporte y la planificación del Gran Concepción"
        repoUrl={`${REPO_BASE}/tree/main/src/wiki/articles`}
        repoLabel="Repositorio del wiki"
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-[280px] shrink-0 border-r md:flex md:flex-col">
          <ScrollArea className="flex-1">
            <WikiNav slug={slug} onSelect={navigateTo} />
          </ScrollArea>
        </aside>

        <main className="relative min-w-0 flex-1">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-[760px] px-4 py-6 md:px-8 md:py-10">
              {article ? (
                <article className="prose-wiki">
                  <ArticleHeader article={article} />
                  <Suspense fallback={<Notice>Cargando contenido…</Notice>}>
                    <article.Component />
                  </Suspense>
                </article>
              ) : (
                <WikiHome onSelect={navigateTo} />
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

function subscribeToHistory(onStoreChange: () => void): () => void {
  window.addEventListener('popstate', onStoreChange);
  return () => window.removeEventListener('popstate', onStoreChange);
}

function getCurrentSlug(): string | null {
  return getSlugFromPath(window.location.pathname);
}

function WikiNav({
  slug,
  onSelect,
}: {
  slug: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const grouped = ARTICLES.reduce<Record<string, ArticleMeta[]>>((acc, a) => {
    (acc[a.section] = acc[a.section] ?? []).push(a);
    return acc;
  }, {});

  return (
    <nav aria-label="Índice del wiki" className="space-y-4 p-4">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors focus-ring ${
          slug === null ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
        }`}
        aria-current={slug === null ? 'page' : undefined}
      >
        Índice del wiki
      </button>
      {Object.entries(grouped).map(([section, items]) => (
        <div key={section}>
          <SectionLabel className="mb-0 px-3 pb-1.5">
            {SECTION_LABELS[section as ArticleMeta['section']]}
          </SectionLabel>
          <ul className="space-y-0.5">
            {items.map((a) => {
              const active = a.slug === slug;
              return (
                <li key={a.slug}>
                  <button
                    type="button"
                    onClick={() => onSelect(a.slug)}
                    className={`block w-full rounded-md px-3 py-2 text-left text-sm leading-snug transition-colors focus-ring ${
                      active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {a.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ArticleHeader({ article }: { article: ArticleMeta }) {
  return (
    <header className="mb-6 border-b pb-4">
      <SectionLabel>{SECTION_LABELS[article.section]}</SectionLabel>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{article.title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{article.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span>Actualizado: {article.updated}</span>
        <span aria-hidden>·</span>
        <a
          href={`${REPO_BASE}/edit/main/src/wiki/articles/${article.slug}.tsx`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-1 rounded-sm focus-ring hover:text-foreground hover:underline md:min-h-0"
        >
          <Pencil className="size-3" aria-hidden />
          Editar en GitHub
        </a>
      </div>
    </header>
  );
}

function WikiHome({ onSelect }: { onSelect: (slug: string | null) => void }) {
  return (
    <div className="space-y-6">
      <header>
        <SectionLabel>Bienvenida</SectionLabel>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          El wiki de conce.patagua.dev
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Conocimiento contribuido sobre el transporte público, la planificación
          urbana y los servicios del Gran Concepción. Empezamos por lo que el
          GTFS oficial deja afuera (los corredores privados a Florida y Yumbel,
          el resto de los troncales Coronel–Lota, los colectivos y el Biotrén)
          y crecemos hacia ser el centro de verdad regional.
        </p>
      </header>

      <section className="rounded-md border bg-card p-4">
        {/* Receta de SectionLabel sobre un h2: conserva el encabezado para lectores de pantalla. */}
        <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Qué hay acá
        </h2>
        <ul className="space-y-2">
          {ARTICLES.map((a) => (
            <li key={a.slug}>
              <button
                type="button"
                onClick={() => onSelect(a.slug)}
                className="group block w-full rounded-md p-2 text-left transition-colors hover:bg-accent/50 focus-ring"
              >
                <div className="text-sm font-medium group-hover:underline">{a.title}</div>
                <div className="text-[12px] leading-snug text-muted-foreground">
                  {a.summary}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Notice className="leading-relaxed">
        <p>
          Este wiki es <strong>contribuido</strong>, no oficial. Los artículos
          se editan via pull requests en{' '}
          <a
            href={`${REPO_BASE}/tree/main/src/wiki/articles`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm underline underline-offset-2 focus-ring hover:text-foreground"
          >
            github.com/marcorojasb/conce.patagua.dev/tree/main/src/wiki/articles
            <ExternalLink className="ml-1 inline size-3" aria-hidden />
          </a>
          . Cada artículo cita sus fuentes. Cuando una fuente oficial cambia,
          actualizamos el artículo.
        </p>
      </Notice>
    </div>
  );
}
