import { memo, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronRight, Clock, Eye, EyeOff, RotateCcw, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SectionLabel } from '@/components/ui/section-label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatusDot } from '@/components/ui/status-dot';
import { RouteBadge } from '@/components/route-badge';
import { ROUTE_TYPES, useRoutesVersion } from '@/data/routes';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import {
  compareRouteCodes,
  isInterurban,
  lineFamily,
  matchesRouteQuery,
  routePillCode,
  routeShortName,
} from '@/lib/route-labels';
import { cn } from '@/lib/utils';
import type { Route } from '@/types/transport';
import type { SidebarProps } from '@/types/ui-contracts';

type ListFilter = 'all' | 'micro' | 'interurban' | 'biotren';

const FILTERS: Array<{ value: ListFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'micro', label: 'Micros' },
  { value: 'interurban', label: 'Interurbanos' },
  { value: 'biotren', label: 'Biotrén' },
];

/** "En el mapa" muestra hasta aquí sin pedirlo: con 20 líneas enteras serían ~50 filas. */
const ON_MAP_ROWS = 20;

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

// En móvil el texto queda dentro de un objetivo táctil de 40 px.
const TEXT_BUTTON =
  'inline-flex min-h-10 min-w-10 items-center rounded-sm text-[11px] font-medium underline-offset-2 hover:text-foreground hover:underline focus-ring md:min-h-0 md:min-w-0';
const FOOTER_LINK =
  'inline-flex min-h-10 min-w-10 items-center justify-center rounded-sm hover:text-foreground focus-ring md:min-h-0 md:min-w-0';

// react-doctor-disable-next-line react-doctor/no-giant-component -- La barra lateral junta buscador, filtros y las secciones de la lista; partirla solo reparte el mismo estado en más props.
export function Sidebar({
  open,
  onClose,
  routes,
  visibleRouteIds,
  hiddenByFilter,
  isDefaultLines,
  onToggleVisible,
  onSetVisible,
  onRestoreDefault,
  onClearAll,
  selectedRouteId,
  onSelectRoute,
  onlyOperatingNow,
  onToggleOnlyOperatingNow,
  onOpenPlanner,
  onOpenSources,
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ListFilter>('all');
  const [showAllOnMap, setShowAllOnMap] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  // Quitar algo de "En el mapa" desmonta el botón pulsado; el foco vuelve a la
  // sección para no caer en <body>.
  const onMapRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // `ROUTES` se muta in-place cuando llega el chunk lazy de micros (misma
  // identidad de array), así que la señal real para recalcular es la versión.
  const routesVersion = useRoutesVersion();
  const visibleSet = useMemo(() => new Set(visibleRouteIds), [visibleRouteIds]);
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // Catálogo con búsqueda y tipo, antes del filtro de horario: así se puede
  // decir "N de M" y por qué la lista quedó vacía.
  const matching = useMemo(() => {
    void routesVersion;
    return routes.filter((r) => (filter === 'all' || kindOf(r) === filter) && matchesRouteQuery(r, q));
  }, [routes, filter, q, routesVersion]);
  const filtered = useMemo(
    () => (onlyOperatingNow ? matching.filter((r) => isRouteOperatingNow(r)) : matching),
    [matching, onlyOperatingNow],
  );

  const sections = useMemo(() => {
    const biotren = filtered.filter((r) => kindOf(r) === 'biotren');
    const interurban = filtered
      .filter((r) => kindOf(r) === 'interurban')
      .sort((a, b) => compareRouteCodes(a.code, b.code));
    const micro = groupByLine(filtered.filter((r) => kindOf(r) === 'micro'));
    return { biotren, interurban, micro };
  }, [filtered]);

  // Todo lo que está en el mapa, en orden de agregado; las que "Operando
  // ahora" saca del dibujo se listan igual, atenuadas.
  const onMap = useMemo(() => {
    void routesVersion;
    const byId = new Map(routes.map((r) => [r.id, r]));
    return visibleRouteIds.map((id) => byId.get(id)).filter((r): r is Route => !!r);
  }, [routes, visibleRouteIds, routesVersion]);
  const offScheduleCount = onMap.filter((r) => hiddenByFilter.has(r.id)).length;
  const onMapShown = showAllOnMap ? onMap : onMap.slice(0, ON_MAP_ROWS);

  const toggleFamily = useCallback(
    (family: string) =>
      setExpanded((cur) => {
        const next = new Set(cur);
        if (next.has(family)) next.delete(family);
        else next.add(family);
        return next;
      }),
    [],
  );

  const toggleFromOnMap = useCallback(
    (id: string) => {
      onToggleVisible(id);
      onMapRef.current?.focus();
    },
    [onToggleVisible],
  );

  const clearSearch = () => {
    setQuery('');
    // El botón desaparece al vaciar: el foco vuelve al buscador.
    searchRef.current?.focus();
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Cerrar barra lateral"
          onClick={onClose}
          className="absolute inset-0 z-[35] bg-black/40 backdrop-blur-[1px] md:hidden"
        />
      )}
      <aside
        className={cn(
          'box-border flex h-full min-w-0 shrink-0 flex-col overflow-hidden border-r bg-background transition-all duration-200 ease-out',
          'absolute inset-y-0 left-0 z-[35] shadow-xl md:relative md:z-auto md:shadow-none',
          open
            ? 'w-[88vw] max-w-[340px] translate-x-0 md:w-[320px] md:max-w-[320px] lg:w-[340px] lg:max-w-[340px]'
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
              <Search className="pointer-events-none absolute inset-y-0 left-2.5 my-auto size-3.5 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Número o destino: 30Q, Lomas, Tomé…"
                aria-label="Buscar recorrido por número o destino"
                className={cn('pl-8', query ? 'pr-10 md:pr-8' : 'pr-3')}
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Borrar búsqueda"
                  className="absolute inset-y-0 right-0 my-auto grid size-10 place-items-center rounded-md text-muted-foreground hover:text-foreground focus-ring md:right-1.5 md:size-6"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            {/* Cada opción crece desde su ancho natural: a partes iguales
                "Interurbanos" no cabe en la barra. */}
            <SegmentedControl
              variant="toggle"
              size="sm"
              label="Filtrar la lista"
              value={filter}
              options={FILTERS}
              onChange={setFilter}
              className="[&>button]:flex-auto"
            />
            {/* El interruptor es solo visual: el estado lo dice aria-pressed del botón. */}
            <button
              type="button"
              onClick={onToggleOnlyOperatingNow}
              aria-pressed={onlyOperatingNow}
              className={cn(
                'flex min-h-10 w-full items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors focus-ring md:min-h-8',
                onlyOperatingNow
                  ? 'border-live text-foreground'
                  : 'bg-background text-foreground/75 hover:bg-accent hover:text-foreground',
              )}
            >
              <Clock className={cn('size-3.5 shrink-0', onlyOperatingNow && 'text-live')} aria-hidden />
              <span className="flex-1 text-left">Operando ahora</span>
              <span
                aria-hidden
                className={cn(
                  'flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-colors',
                  onlyOperatingNow
                    ? 'justify-end border-live bg-live'
                    : 'justify-start border-muted-foreground bg-card',
                )}
              >
                <span
                  className={cn(
                    'block size-4 rounded-full',
                    onlyOperatingNow ? 'bg-background shadow-sm' : 'scale-75 bg-muted-foreground',
                  )}
                />
              </span>
            </button>
          </div>

          <ScrollArea className="min-w-0 flex-1 scroll-fade-y">
            <div className="min-w-0 space-y-4 p-3">
              {!searching && (
                <section aria-label="En el mapa" ref={onMapRef} tabIndex={-1} className="outline-none">
                  <SectionLabel icon={<Eye />}>
                    En el mapa · {onMap.length}
                    {offScheduleCount > 0 && ` (${offScheduleCount} fuera de horario)`}
                  </SectionLabel>
                  {(!isDefaultLines || onMap.length > 0) && (
                    <div className="-mt-2 flex flex-wrap gap-x-3 px-0.5 text-muted-foreground md:-mt-1 md:mb-1.5 md:gap-y-1">
                      {!isDefaultLines && (
                        <button
                          type="button"
                          onClick={() => {
                            onRestoreDefault();
                            onMapRef.current?.focus();
                          }}
                          className={cn(TEXT_BUTTON, 'inline-flex items-center gap-1')}
                        >
                          <RotateCcw className="size-3" aria-hidden />
                          Restaurar vista inicial
                        </button>
                      )}
                      {onMap.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            onClearAll();
                            onMapRef.current?.focus();
                          }}
                          className={TEXT_BUTTON}
                        >
                          Quitar todo
                        </button>
                      )}
                    </div>
                  )}
                  {onMap.length > 0 ? (
                    <div className="space-y-0.5">
                      {onMapShown.map((route) => (
                        <RouteRow
                          key={route.id}
                          route={route}
                          visible
                          selected={selectedRouteId === route.id}
                          offSchedule={hiddenByFilter.has(route.id)}
                          compact
                          onSelect={onSelectRoute}
                          onToggleVisible={toggleFromOnMap}
                        />
                      ))}
                      {onMap.length > ON_MAP_ROWS && (
                        <button
                          type="button"
                          onClick={() => setShowAllOnMap((v) => !v)}
                          aria-expanded={showAllOnMap}
                          className={cn(TEXT_BUTTON, 'px-1.5 text-muted-foreground md:py-1')}
                        >
                          {showAllOnMap ? 'Mostrar menos' : `Mostrar las ${onMap.length}`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed px-3 py-2.5 text-[12px] leading-snug text-muted-foreground">
                      Nada dibujado. Toca el ojo de un recorrido para dejarlo en el mapa, o tócalo para ver
                      su ficha.
                    </p>
                  )}
                </section>
              )}

              {onlyOperatingNow && filtered.length > 0 && (
                <p className="rounded-md border border-live/30 bg-live/10 px-2.5 py-1.5 text-[11px] leading-snug text-foreground">
                  Mostrando solo lo que opera ahora ({filtered.length} de {matching.length}) ·{' '}
                  <button type="button" onClick={onToggleOnlyOperatingNow} className={cn(TEXT_BUTTON, 'underline')}>
                    Ver todos
                  </button>
                </p>
              )}

              {filtered.length === 0 && (
                <EmptyCatalog
                  query={query.trim()}
                  kind={FILTERS.find((f) => f.value === filter && f.value !== 'all')?.label ?? null}
                  onlyOperatingNow={onlyOperatingNow}
                  matchingCount={matching.length}
                  onClearFilter={onToggleOnlyOperatingNow}
                  onClearSearch={clearSearch}
                  onClearKind={() => setFilter('all')}
                />
              )}

              {sections.biotren.length > 0 && (
                <section aria-label="Biotrén">
                  <SectionLabel aside={sections.biotren.length}>Biotrén</SectionLabel>
                  <div className="space-y-0.5">
                    {sections.biotren.map((route) => (
                      <RouteRow
                        key={route.id}
                        route={route}
                        visible={visibleSet.has(route.id)}
                        selected={selectedRouteId === route.id}
                        onSelect={onSelectRoute}
                        onToggleVisible={onToggleVisible}
                      />
                    ))}
                  </div>
                </section>
              )}

              {sections.interurban.length > 0 && (
                <section aria-label="Interurbanos">
                  <SectionLabel aside={sections.interurban.length}>Interurbanos</SectionLabel>
                  <div className="space-y-0.5">
                    {sections.interurban.map((route) => (
                      <RouteRow
                        key={route.id}
                        route={route}
                        visible={visibleSet.has(route.id)}
                        selected={selectedRouteId === route.id}
                        onSelect={onSelectRoute}
                        onToggleVisible={onToggleVisible}
                      />
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
                        group.routes.map((route) => (
                          <RouteRow
                            key={route.id}
                            route={route}
                            visible={visibleSet.has(route.id)}
                            selected={selectedRouteId === route.id}
                            onSelect={onSelectRoute}
                            onToggleVisible={onToggleVisible}
                          />
                        ))
                      ) : (
                        <LineGroupRow
                          key={group.family}
                          group={group}
                          expanded={expanded.has(group.family)}
                          visibleCount={group.routes.filter((r) => visibleSet.has(r.id)).length}
                          onToggleExpanded={toggleFamily}
                          onSetVisible={onSetVisible}
                        >
                          {group.routes.map((route) => (
                            <RouteRow
                              key={route.id}
                              route={route}
                              visible={visibleSet.has(route.id)}
                              selected={selectedRouteId === route.id}
                              onSelect={onSelectRoute}
                              onToggleVisible={onToggleVisible}
                            />
                          ))}
                        </LineGroupRow>
                      ),
                    )}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between gap-3 border-t px-3 py-0.5 text-[11px] text-muted-foreground md:py-2.5">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onOpenPlanner} className={FOOTER_LINK}>
                Planificador
              </button>
              <button type="button" onClick={onOpenSources} className={FOOTER_LINK}>
                Fuentes de datos
              </button>
              <a href="/wiki" className={FOOTER_LINK}>
                Wiki
              </a>
            </div>
            <a
              href="https://github.com/marcorojasb/conce.patagua.dev"
              target="_blank"
              rel="noopener noreferrer"
              className={FOOTER_LINK}
            >
              Código abierto
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

/** Lista vacía: dice qué la vació (búsqueda, tipo, horario) y cómo deshacerlo. */
function EmptyCatalog({
  query,
  kind,
  onlyOperatingNow,
  matchingCount,
  onClearFilter,
  onClearSearch,
  onClearKind,
}: {
  query: string;
  kind: string | null;
  onlyOperatingNow: boolean;
  /** Coincidencias sin el filtro de horario. */
  matchingCount: number;
  onClearFilter: () => void;
  onClearSearch: () => void;
  onClearKind: () => void;
}) {
  const byFilter = onlyOperatingNow && matchingCount > 0;
  let text: ReactNode;
  if (byFilter) {
    text = query
      ? <>Ningún recorrido que coincida con «{query}» opera ahora ({matchingCount} fuera de horario).</>
      : <>Ningún recorrido{kind ? ` de ${kind}` : ''} opera ahora ({matchingCount} fuera de horario).</>;
  } else if (query) {
    text = <>Ningún recorrido{kind ? ` de ${kind}` : ''} coincide con «{query}».</>;
  } else {
    text = <>No hay recorridos de {kind ?? 'este tipo'}.</>;
  }
  return (
    <div className="space-y-2 rounded-md border border-dashed px-3 py-4 text-center text-[12px] text-muted-foreground">
      <p>{text}</p>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {onlyOperatingNow && (
          <button type="button" onClick={onClearFilter} className={cn(TEXT_BUTTON, 'text-foreground underline')}>
            Quitar filtro
          </button>
        )}
        {query && (
          <button type="button" onClick={onClearSearch} className={cn(TEXT_BUTTON, 'text-foreground underline')}>
            Borrar búsqueda
          </button>
        )}
        {kind && !byFilter && (
          <button type="button" onClick={onClearKind} className={cn(TEXT_BUTTON, 'text-foreground underline')}>
            Ver todos los tipos
          </button>
        )}
      </div>
    </div>
  );
}

interface RouteRowProps {
  route: Route;
  visible: boolean;
  selected: boolean;
  /** En el mapa pero fuera del dibujo por "Operando ahora". */
  offSchedule?: boolean;
  compact?: boolean;
  onSelect: (id: string) => void;
  onToggleVisible: (id: string) => void;
}

/** Fila de un recorrido: tocarla abre su ficha; el ojo lo pone o lo saca del mapa. */
const RouteRow = memo(function RouteRow({
  route,
  visible,
  selected,
  offSchedule = false,
  compact,
  onSelect,
  onToggleVisible,
}: RouteRowProps) {
  const operating = isRouteOperatingNow(route);
  const TypeIcon = ROUTE_TYPES[route.type].Icon;
  return (
    <div
      className={cn(
        'group flex min-w-0 items-center gap-1 rounded-md transition-colors',
        selected ? 'bg-accent' : 'hover:bg-accent/60',
      )}
      data-off-schedule={offSchedule || undefined}
    >
      <button
        type="button"
        onClick={() => onSelect(route.id)}
        aria-current={selected ? 'true' : undefined}
        className={cn(
          'flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left focus-ring',
          offSchedule && 'opacity-60',
        )}
      >
        {/* El ancho mínimo de RouteBadge cabe "201-AU": la columna de nombres queda alineada. */}
        <RouteBadge code={routePillCode(route)} color={route.color} />
        <span className="min-w-0 flex-1">
          {/* 13 px y hasta dos líneas: "Santa Juana ↔ Concepción" se lee entero, no "Santa Juana ↔ Concep…". */}
          <span className="line-clamp-2 break-words text-[13px] font-medium leading-tight">{routeShortName(route)}</span>
          {offSchedule ? (
            <span className="block truncate text-[11px] text-stale">Fuera de horario · no se dibuja</span>
          ) : (
            !compact && (
              <span className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                <TypeIcon className="size-3 shrink-0" />
                <span className="truncate">{route.operator}</span>
              </span>
            )
          )}
        </span>
        <StatusDot on={operating} label={operating ? 'Operando ahora' : 'Fuera de horario ahora'} />
      </button>
      <button
        type="button"
        onClick={() => onToggleVisible(route.id)}
        aria-pressed={visible}
        aria-label={`Ver ${route.code} en el mapa`}
        title={visible ? 'Quitar del mapa' : 'Mostrar en el mapa'}
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-md transition-colors focus-ring md:size-8',
          visible ? 'text-foreground hover:bg-background' : 'text-muted-foreground/60 hover:text-foreground',
        )}
      >
        {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </button>
    </div>
  );
});

interface LineGroupRowProps {
  group: LineGroup;
  expanded: boolean;
  visibleCount: number;
  onToggleExpanded: (family: string) => void;
  onSetVisible: (ids: readonly string[], visible: boolean) => void;
  children: ReactNode;
}

function LineGroupRow({ group, expanded, visibleCount, onToggleExpanded, onSetVisible, children }: LineGroupRowProps) {
  const allVisible = visibleCount === group.routes.length;
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-1 rounded-md hover:bg-accent/60">
        <button
          type="button"
          onClick={() => onToggleExpanded(group.family)}
          aria-expanded={expanded}
          className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left focus-ring"
        >
          <ChevronRight
            className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-90')}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium leading-tight">Línea {group.family}</span>
            <span className="block truncate text-[11px] text-muted-foreground">
              <span className="font-mono">{group.routes.map((r) => routePillCode(r)).join(' · ')}</span>
              {group.operator ? ` — ${group.operator}` : ''}
            </span>
          </span>
          {visibleCount > 0 && (
            <span className="h-5 min-w-5 shrink-0 rounded-full bg-foreground px-1.5 text-center font-mono text-[11px] leading-5 text-background">
              {visibleCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onSetVisible(group.routes.map((r) => r.id), !allVisible)}
          aria-pressed={allVisible}
          aria-label={`Ver toda la línea ${group.family} en el mapa`}
          title={allVisible ? 'Quitar la línea del mapa' : 'Mostrar toda la línea'}
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-md transition-colors focus-ring md:size-8',
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
