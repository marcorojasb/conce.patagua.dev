// Wiki app — entry point for /wiki and /wiki/{slug}. Same DOM root as the
// visor, swapped at main.tsx based on location.pathname so we don't need
// a routing library yet. State changes via history.pushState; back/forward
// works because we listen to popstate.

import { Suspense, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Github, Moon, Pencil, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { ARTICLES, findArticle, SECTION_LABELS, type ArticleMeta } from './articles';

const REPO_BASE = 'https://github.com/marcorojasb/conce.patagua.dev';

function getSlugFromPath(path: string): string | null {
  const match = path.match(/^\/wiki\/?([^/?#]+)?/);
  if (!match) return null;
  return match[1] ?? null;
}

function navigateTo(slug: string | null): void {
  const url = slug ? `/wiki/${slug}` : '/wiki';
  if (window.location.pathname === url) return;
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function WikiApp() {
  const [theme, toggleTheme] = useTheme();
  const [slug, setSlug] = useState<string | null>(() =>
    getSlugFromPath(window.location.pathname),
  );

  useEffect(() => {
    const onPop = () => setSlug(getSlugFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const article = slug ? findArticle(slug) : null;

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <header className="relative z-10 flex h-12 items-center gap-1.5 border-b bg-background/95 px-2 backdrop-blur md:h-14 md:gap-3 md:px-4">
        <a
          href="/"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-accent md:h-9 md:w-9"
          aria-label="Volver al visor"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </a>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-mono text-sm font-semibold tracking-tight">
              conce.patagua.dev/wiki
            </div>
            <div className="hidden truncate text-[11px] text-muted-foreground md:block">
              Conocimiento contribuido sobre el transporte y la planificación del Gran Concepción
            </div>
          </div>
        </div>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            window.open(`${REPO_BASE}/tree/main/src/wiki/articles`, '_blank', 'noopener')
          }
          aria-label="Repositorio del wiki"
          className="h-10 w-10 shrink-0 md:h-9 md:w-9"
        >
          <Github className="h-[18px] w-[18px]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          className="h-10 w-10 shrink-0 md:h-9 md:w-9"
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>
      </header>

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
                  <Suspense
                    fallback={
                      <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
                        Cargando contenido…
                      </div>
                    }
                  >
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
          <div className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {SECTION_LABELS[section as ArticleMeta['section']]}
          </div>
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
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {SECTION_LABELS[article.section]}
      </div>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{article.title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{article.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span>Actualizado: {article.updated}</span>
        <span aria-hidden>·</span>
        <a
          href={`${REPO_BASE}/edit/main/src/wiki/articles/${article.slug}.tsx`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
        >
          <Pencil className="h-3 w-3" />
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
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Bienvenida
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          El wiki de conce.patagua.dev
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Conocimiento contribuido sobre el transporte público, la planificación
          urbana y los servicios del Gran Concepción. Empezamos por lo que el
          GTFS oficial deja afuera — los recorridos interurbanos licitados —
          y crecemos hacia ser el centro de verdad regional.
        </p>
      </header>

      <section className="rounded-md border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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

      <section className="rounded-md border bg-muted/40 p-4 text-[12px] leading-relaxed text-muted-foreground">
        <p>
          Este wiki es <strong>contribuido</strong>, no oficial. Los artículos
          se editan via pull requests en{' '}
          <a
            href={`${REPO_BASE}/tree/main/src/wiki/articles`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            github.com/marcorojasb/conce.patagua.dev/tree/main/src/wiki/articles
            <ExternalLink className="ml-1 inline h-3 w-3" />
          </a>
          . Cada artículo cita sus fuentes. Cuando una fuente oficial cambia,
          actualizamos el artículo.
        </p>
      </section>
    </div>
  );
}
