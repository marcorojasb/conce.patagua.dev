import { useMemo, useRef, useState } from 'react';
import { ChevronRight, Clock, Eye, EyeOff, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SectionLabel } from '@/components/ui/section-label';
import { RouteBadge } from '@/components/route-badge';
import { ROUTE_TYPES, useRoutesVersion } from '@/data/routes';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import { compareRouteCodes, isInterurban, lineFamily, matchesRouteQuery, routeShortName } from '@/lib/route-labels';
import { cn } from '@/lib/utils';
import type { Route } from '@/types/transport';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  routes: Route[];
  visibleRouteIds: string[];
  onToggleVisible: (id: string) => void;
  onSetVisible: (ids: string[], visible: boolean) => void;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onlyOperatingNow: boolean;
  onToggleOnlyOperatingNow: () => void;
  onOpenSources: () => void;
  onOpenAnalysis: () => void;
}

type ListFilter = 'all' | 'micro' | 'interurban' | 'biotren';

const FILTERS: Array<{ id: ListFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'micro', label: 'Micros' },
  { id: 'interurban', label: 'Interurbanos' },
  { id: 'biotren', label: 'Biotrén' },
];

interface LineGroup {
  family: string;
  routes: Route[];
  operator: string | null;
}

function kindOf(route: Route): Exclude<ListFilter, 'all'> {
  if (route.type === 'biotren') return 'biotren';
  return isInterurban(route) ? 'interurban' : 'micro';
}

function groupByLine(routes: Route[]): LineGroup[] {
  const byFamily = new Map<string, Route[]>();
  for (const route of routes) {
    const family = lineFamily(route.code);
    const list = byFamily.get(family) ?? [];
    list.push(route);
    byFamily.set(family, list);
  }
  return Array.from(byFamily, ([family, list]) => {
    list.sort((a, b) => compareRouteCodes(a.code, b.code));
    const operators = new Set(list.map((r) => r.operator).filter(Boolean));
    return { family, routes: list, operator: operators.size === 1 ? list[0].operator : null };
  }).sort((a, b) => compareRouteCodes(a.family, b.family));
}

// react-doctor-disable-next-line react-doctor/no-giant-component -- La barra lateral junta buscador, filtros y las tres secciones de la lista; partirla solo reparte el mismo estado en más props.
export function Sidebar({
  open,
  onClose,
  routes,
  visibleRouteIds,
  onToggleVisible,
  onSetVisible,
  selectedRouteId,
  onSelectRoute,
  onlyOperatingNow,
  onToggleOnlyOperatingNow,
  onOpenSources,
  onOpenAnalysis,
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ListFilter>('all');
  const searchRef = useRef<HTMLInputElement>(null);
  // Quitar algo de "En el mapa" desmonta el botón pulsado; el foco vuelve a la
  // sección para no caer en <body>.
  const onMapRef = useRef<HTMLElement>(null);
  const focusOnMap = () => onMapRef.current?.focus();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // `ROUTES` se muta in-place cuando llega el chunk lazy de micros (misma
  // identidad de array), así que la señal real para recalcular es la versión.
  const routesVersion = useRoutesVersion();
  const visibleSet = useMemo(() => new Set(visibleRouteIds), [visibleRouteIds]);
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    void routesVersion;
    return routes.filter(
      (r) =>
        (filter === 'all' || kindOf(r) === filter) &&
        matchesRouteQuery(r, q) &&
        (!onlyOperatingNow || isRouteOperatingNow(r)),
    );
  }, [routes, filter, q, onlyOperatingNow, routesVersion]);

  const sections = useMemo(() => {
    const biotren = filtered.filter((r) => kindOf(r) === 'biotren');
    const interurban = filtered.filter((r) => kindOf(r) === 'interurban').sort((a, b) => compareRouteCodes(a.code, b.code));
    const micro = groupByLine(filtered.filter((r) => kindOf(r) === 'micro'));
    return { biotren, interurban, micro };
  }, [filtered]);

  const onMap = useMemo(() => {
    void routesVersion;
    const byId = new Map(routes.map((r) => [r.id, r]));
    // Mismo criterio que el mapa: con "Operando ahora" no se dibuja lo que
    // está fuera de horario, así que tampoco se cuenta aquí.
    return visibleRouteIds
      .map((id) => byId.get(id))
      .filter((r): r is Route => !!r && (!onlyOperatingNow || isRouteOperatingNow(r)));
  }, [routes, visibleRouteIds, onlyOperatingNow, routesVersion]);

  const toggleFamily = (family: string) =>
    setExpanded((cur) => {
      const next = new Set(cur);
      if (next.has(family)) next.delete(family);
      else next.add(family);
      return next;
    });

  const rowProps = (route: Route) => ({
    route,
    visible: visibleSet.has(route.id),
    selected: selectedRouteId === route.id,
    onSelect: () => onSelectRoute(route.id),
    onToggleVisible: () => onToggleVisible(route.id),
  });

  const searching = q.length > 0;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Cerrar barra lateral"
          onClick={onClose}
          className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[1px] md:hidden"
        />
      )}
      <aside
        className={cn(
          'box-border flex h-full min-w-0 shrink-0 flex-col overflow-hidden border-r bg-background transition-all duration-200 ease-out',
          'absolute inset-y-0 left-0 z-20 shadow-xl md:relative md:shadow-none',
          open
            ? 'w-[88vw] max-w-[340px] translate-x-0 md:w-[340px] md:max-w-[340px] lg:w-[360px] lg:max-w-[360px]'
            : 'w-0 max-w-0 -translate-x-full border-r-0 md:translate-x-0',
        )}
        data-state={open ? 'open' : 'closed'}
        aria-hidden={!open}
        aria-label="Recorridos"
      >
        <div
          className={cn(
            'flex h-full min-w-0 flex-col overflow-hidden transition-opacity',
            open ? 'opacity-100' : 'pointer-events-none hidden opacity-0',
          )}
        >
          <div className="space-y-2.5 border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Número o destino: 30Q, Lomas, Tomé…"
                aria-label="Buscar recorrido por número o destino"
                className="h-9 pl-8 pr-8"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    // El botón desaparece al vaciar: el foco vuelve al buscador.
                    searchRef.current?.focus();
                  }}
                  aria-label="Borrar búsqueda"
                  className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground focus-ring"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar la lista">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs transition-colors focus-ring',
                    filter === f.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                </button>
              ))}
              <button
                type="button"
                onClick={onToggleOnlyOperatingNow}
                aria-pressed={onlyOperatingNow}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors focus-ring',
                  onlyOperatingNow
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                <Clock className="size-3" />
                Operando ahora
              </button>
            </div>
          </div>

          <ScrollArea className="min-w-0 flex-1 scroll-fade-y">
            <div className="min-w-0 space-y-4 p-3">
              {!searching && (
                <section aria-label="En el mapa" ref={onMapRef} tabIndex={-1} className="outline-none">
                  <SectionLabel
                    icon={<Eye />}
                    aside={
                      onMap.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            onSetVisible(onMap.map((r) => r.id), false);
                            focusOnMap();
                          }}
                          className="rounded-sm text-[11px] underline-offset-2 hover:text-foreground hover:underline focus-ring"
                        >
                          Quitar todo
                        </button>
                      )
                    }
                  >
                    En el mapa · {onMap.length}
                  </SectionLabel>
                  {onMap.length > 0 ? (
                    <div className="space-y-0.5">
                      {onMap.map((route) => (
                        <RouteRow
                          key={route.id}
                          {...rowProps(route)}
                          compact
                          onToggleVisible={() => {
                            onToggleVisible(route.id);
                            focusOnMap();
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed px-3 py-2.5 text-[12px] leading-snug text-muted-foreground">
                      Nada dibujado. Toca el ojo de un recorrido para dejarlo en el mapa, o tócalo para ver su ficha.
                    </p>
                  )}
                </section>
              )}

              {filtered.length === 0 && (
                <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                  Ningún recorrido coincide{onlyOperatingNow ? ' (y opere ahora)' : ''}.
                </p>
              )}

              {sections.biotren.length > 0 && (
                <section aria-label="Biotrén">
                  <SectionLabel aside={sections.biotren.length}>Biotrén</SectionLabel>
                  <div className="space-y-0.5">
                    {sections.biotren.map((route) => (
                      <RouteRow key={route.id} {...rowProps(route)} />
                    ))}
                  </div>
                </section>
              )}

              {sections.interurban.length > 0 && (
                <section aria-label="Interurbanos">
                  <SectionLabel aside={sections.interurban.length}>Interurbanos</SectionLabel>
                  <div className="space-y-0.5">
                    {sections.interurban.map((route) => (
                      <RouteRow key={route.id} {...rowProps(route)} />
                    ))}
                  </div>
                </section>
              )}

              {sections.micro.length > 0 && (
                <section aria-label="Micros urbanas">
                  <SectionLabel aside={`${sections.micro.reduce((n, g) => n + g.routes.length, 0)}`}>
                    Micros urbanas
                  </SectionLabel>
                  <div className="space-y-0.5">
                    {sections.micro.map((group) =>
                      searching || group.routes.length === 1 ? (
                        group.routes.map((route) => <RouteRow key={route.id} {...rowProps(route)} />)
                      ) : (
                        <LineGroupRow
                          key={group.family}
                          group={group}
                          expanded={expanded.has(group.family)}
                          visibleCount={group.routes.filter((r) => visibleSet.has(r.id)).length}
                          onToggleExpanded={() => toggleFamily(group.family)}
                          onSetVisible={(visible) => onSetVisible(group.routes.map((r) => r.id), visible)}
                        >
                          {group.routes.map((route) => (
                            <RouteRow key={route.id} {...rowProps(route)} />
                          ))}
                        </LineGroupRow>
                      ),
                    )}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between gap-3 border-t px-3 py-2.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onOpenAnalysis} className="rounded-sm hover:text-foreground focus-ring">
                Planificador
              </button>
              <button type="button" onClick={onOpenSources} className="rounded-sm hover:text-foreground focus-ring">
                Fuentes de datos
              </button>
              <a href="/wiki" className="rounded-sm hover:text-foreground focus-ring">
                Wiki
              </a>
            </div>
            <a
              href="https://github.com/marcorojasb/conce.patagua.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm hover:text-foreground focus-ring"
            >
              Código abierto
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

interface RouteRowProps {
  route: Route;
  visible: boolean;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
}

function RouteRow({ route, visible, selected, compact, onSelect, onToggleVisible }: RouteRowProps) {
  const operating = isRouteOperatingNow(route);
  const TypeIcon = ROUTE_TYPES[route.type].Icon;
  return (
    <div
      className={cn(
        'group flex min-w-0 items-center gap-1 rounded-md transition-colors',
        selected ? 'bg-accent' : 'hover:bg-accent/60',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? 'true' : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1.5 text-left focus-ring"
      >
        <RouteBadge code={route.code} color={route.color} className="min-w-[2.75rem] justify-center" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] leading-tight">{routeShortName(route)}</span>
          {!compact && (
            <span className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
              <TypeIcon className="size-3 shrink-0" />
              <span className="truncate">{route.operator}</span>
            </span>
          )}
        </span>
        <span
          className={cn('size-1.5 shrink-0 rounded-full', operating ? 'bg-emerald-500' : 'bg-muted-foreground/30')}
          title={operating ? 'Operando ahora' : 'Fuera de horario ahora'}
          aria-label={operating ? 'Operando ahora' : 'Fuera de horario ahora'}
        />
      </button>
      <button
        type="button"
        onClick={onToggleVisible}
        aria-pressed={visible}
        aria-label={`Ver ${route.code} en el mapa`}
        title={visible ? 'Quitar del mapa' : 'Mostrar en el mapa'}
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-md transition-colors focus-ring',
          visible ? 'text-foreground hover:bg-background' : 'text-muted-foreground/60 hover:text-foreground',
        )}
      >
        {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </button>
    </div>
  );
}

interface LineGroupRowProps {
  group: LineGroup;
  expanded: boolean;
  visibleCount: number;
  onToggleExpanded: () => void;
  onSetVisible: (visible: boolean) => void;
  children: React.ReactNode;
}

function LineGroupRow({ group, expanded, visibleCount, onToggleExpanded, onSetVisible, children }: LineGroupRowProps) {
  const allVisible = visibleCount === group.routes.length;
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-1 rounded-md hover:bg-accent/60">
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1.5 text-left focus-ring"
        >
          <ChevronRight
            className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-90')}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium leading-tight">Línea {group.family}</span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {group.routes.map((r) => r.code).join(' · ')}
              {group.operator ? ` — ${group.operator}` : ''}
            </span>
          </span>
          {visibleCount > 0 && (
            <span className="shrink-0 rounded-full bg-foreground px-1.5 font-mono text-[10px] text-background">
              {visibleCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onSetVisible(!allVisible)}
          aria-pressed={allVisible}
          aria-label={`Ver toda la línea ${group.family} en el mapa`}
          title={allVisible ? 'Quitar la línea del mapa' : 'Mostrar toda la línea'}
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-md transition-colors focus-ring',
            allVisible ? 'text-foreground' : 'text-muted-foreground/60 hover:text-foreground',
          )}
        >
          {allVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      </div>
      {expanded && <div className="ml-4 border-l pl-1.5">{children}</div>}
    </div>
  );
}
