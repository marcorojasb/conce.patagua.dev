import { memo, useCallback, useId, useMemo, useRef, useState, type ReactNode } from 'react';
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
  groupByCorridor,
  groupByLine,
  groupDetail,
  isInterurban,
  matchesRouteQuery,
  routeDirectionsLabel,
  routeGroupContext,
  routePillCode,
  routeShortName,
  searchGroups,
  type GroupSearchResult,
  type RouteGroup,
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

type ListGroup = GroupSearchResult<Route>;

interface Catalog {
  biotren: Route[];
  interurban: ListGroup[];
  micro: ListGroup[];
}

const EMPTY_KEYS: ReadonlySet<string> = new Set();

const expandKey = (query: string, key: string) => (query ? `${query}\u0000${key}` : key);

function kindOf(route: Route): Exclude<ListFilter, 'all'> {
  if (route.type === 'biotren') return 'biotren';
  return isInterurban(route) ? 'interurban' : 'micro';
}

const routeCount = (catalog: Catalog) =>
  catalog.biotren.length + [...catalog.interurban, ...catalog.micro].reduce((n, g) => n + g.routes.length, 0);

const recorridos = (n: number) => `${n} ${n === 1 ? 'recorrido' : 'recorridos'}`;

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
  // Líneas abiertas a mano. Al buscar, la línea que calza por número o
  // empresa ya viene abierta, y lo que se abre o cierra vale solo para esa
  // búsqueda: la clave lleva lo buscado ("via lactea\u000010").
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(EMPTY_KEYS);

  // `ROUTES` se muta in-place cuando llega el chunk lazy de micros (misma
  // identidad de array), así que la señal real para recalcular es la versión.
  const routesVersion = useRoutesVersion();
  const visibleSet = useMemo(() => new Set(visibleRouteIds), [visibleRouteIds]);
  const q = query.trim();
  const searching = q.length > 0;

  // Catálogo con búsqueda y tipo, antes del filtro de horario: así se puede
  // decir "N de M" y por qué la lista quedó vacía. Micros por línea (empresa
  // y número) e interurbanos por corredor; la búsqueda deja la línea entera
  // si calza su número o su empresa, o solo los recorridos que calzan.
  const matching = useMemo((): Catalog => {
    void routesVersion;
    const ofKind = (kind: Exclude<ListFilter, 'all'>) =>
      filter === 'all' || filter === kind ? routes.filter((r) => kindOf(r) === kind) : [];
    return {
      biotren: ofKind('biotren').filter((r) => matchesRouteQuery(r, q)),
      interurban: searchGroups(groupByCorridor(ofKind('interurban')), q),
      micro: searchGroups(groupByLine(ofKind('micro')), q),
    };
  }, [routes, filter, q, routesVersion]);
  const sections = useMemo((): Catalog => {
    if (!onlyOperatingNow) return matching;
    const operating = (groups: ListGroup[]) =>
      groups.flatMap((g) => {
        const routes = g.routes.filter((r) => isRouteOperatingNow(r));
        return routes.length > 0 ? [{ ...g, routes }] : [];
      });
    return {
      biotren: matching.biotren.filter((r) => isRouteOperatingNow(r)),
      interurban: operating(matching.interurban),
      micro: operating(matching.micro),
    };
  }, [matching, onlyOperatingNow]);
  const matchingCount = routeCount(matching);
  const filteredCount = routeCount(sections);

  // Todo lo que está en el mapa, en orden de agregado; las que "Operando
  // ahora" saca del dibujo se listan igual, atenuadas.
  const onMap = useMemo(() => {
    void routesVersion;
    const byId = new Map(routes.map((r) => [r.id, r]));
    return visibleRouteIds.map((id) => byId.get(id)).filter((r): r is Route => !!r);
  }, [routes, visibleRouteIds, routesVersion]);
  const offScheduleCount = onMap.filter((r) => hiddenByFilter.has(r.id)).length;
  const onMapShown = showAllOnMap ? onMap : onMap.slice(0, ON_MAP_ROWS);

  const isOpen = (group: ListGroup) => (group.match === 'open') !== expanded.has(expandKey(q, group.key));
  const toggleGroup = useCallback(
    (key: string) =>
      setExpanded((cur) => {
        const next = new Set(cur);
        const k = expandKey(q, key);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      }),
    [q],
  );

  const routeRow = (route: Route, detail?: string) => (
    <RouteRow
      key={route.id}
      route={route}
      visible={visibleSet.has(route.id)}
      selected={selectedRouteId === route.id}
      detail={detail}
      onSelect={onSelectRoute}
      onToggleVisible={onToggleVisible}
    />
  );

  // Un grupo con su encabezado, o (buscando, si solo calzan recorridos
  // sueltos) sus filas con la línea al lado: "10 · Vía Láctea".
  const groupRows = (group: ListGroup) =>
    searching && !group.match ? (
      group.routes.map((route) => routeRow(route, routeGroupContext(group, route)))
    ) : (
      <RouteGroupRow
        key={group.key}
        group={group}
        expanded={isOpen(group)}
        visibleCount={group.routes.filter((r) => visibleSet.has(r.id)).length}
        onToggleExpanded={toggleGroup}
        onSetVisible={onSetVisible}
      >
        {/* La 50 trae dos empresas en sus letreros: cada fila dice la suya. */}
        {group.routes.map((route) => routeRow(route, group.operators.length > 1 ? route.operator : undefined))}
      </RouteGroupRow>
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
                placeholder="Número, empresa o destino"
                aria-label="Buscar recorrido por número, empresa o destino"
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

              {onlyOperatingNow && filteredCount > 0 && (
                <p className="rounded-md border border-live/30 bg-live/10 px-2.5 py-1.5 text-[11px] leading-snug text-foreground">
                  Mostrando solo lo que opera ahora ({filteredCount} de {matchingCount}) ·{' '}
                  <button type="button" onClick={onToggleOnlyOperatingNow} className={cn(TEXT_BUTTON, 'underline')}>
                    Ver todos
                  </button>
                </p>
              )}

              {filteredCount === 0 && (
                <EmptyCatalog
                  query={query.trim()}
                  kind={FILTERS.find((f) => f.value === filter && f.value !== 'all')?.label ?? null}
                  onlyOperatingNow={onlyOperatingNow}
                  matchingCount={matchingCount}
                  onClearFilter={onToggleOnlyOperatingNow}
                  onClearSearch={clearSearch}
                  onClearKind={() => setFilter('all')}
                />
              )}

              {sections.biotren.length > 0 && (
                <section aria-label="Biotrén">
                  <SectionLabel aside={sections.biotren.length}>Biotrén</SectionLabel>
                  <div className="space-y-0.5">{sections.biotren.map((route) => routeRow(route, route.operator))}</div>
                </section>
              )}

              {sections.interurban.length > 0 && (
                <section aria-label="Interurbanos">
                  <SectionLabel aside={sections.interurban.reduce((n, g) => n + g.routes.length, 0)}>
                    Interurbanos
                  </SectionLabel>
                  <div className="space-y-0.5">{sections.interurban.map(groupRows)}</div>
                </section>
              )}

              {sections.micro.length > 0 && (
                <section aria-label="Micros urbanas">
                  <SectionLabel aside={sections.micro.reduce((n, g) => n + g.routes.length, 0)}>
                    Micros urbanas
                  </SectionLabel>
                  <div className="space-y-0.5">{sections.micro.map(groupRows)}</div>
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
  /**
   * Segunda línea: la línea de la fila cuando se lista fuera de su grupo
   * ("10 · Vía Láctea"), o el operador. Sin ella la fila es de una línea.
   */
  detail?: string;
  onSelect: (id: string) => void;
  onToggleVisible: (id: string) => void;
}

/**
 * Fila de un recorrido: la píldora es el letrero ("10A/N") y el nombre, sus
 * destinos en el mismo orden ("Centinela ↔ Los Bloques"). Tocarla abre su
 * ficha; el ojo lo pone o lo saca del mapa.
 */
const RouteRow = memo(function RouteRow({
  route,
  visible,
  selected,
  offSchedule = false,
  detail,
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
        // "10A hacia Centinela, 10N hacia Los Bloques": lo que dice cada letrero.
        title={routeDirectionsLabel(route) ?? undefined}
        className={cn(
          'flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left focus-ring',
          offSchedule && 'opacity-60',
        )}
      >
        {/* El ancho mínimo de RouteBadge cabe "201-AU": la columna de nombres queda alineada. */}
        <RouteBadge code={routePillCode(route)} color={route.color} />
        <span className="min-w-0 flex-1">
          {/* 13 px y hasta dos líneas parejas, con la flecha pegada al primer destino:
              "Centinela ↔ / Los Bloques" y no "Centinela ↔ Los / Bloques" ni "Las Canchas / ↔ Leonera". */}
          <span className="line-clamp-2 break-words text-balance text-[13px] font-medium leading-tight">
            {routeShortName(route).replace(' ↔ ', '\u00a0↔ ')}
          </span>
          {offSchedule ? (
            <span className="block truncate text-[11px] text-stale">Fuera de horario · no se dibuja</span>
          ) : (
            detail && (
              <span className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                <TypeIcon className="size-3 shrink-0" />
                <span className="truncate">{detail}</span>
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

interface RouteGroupRowProps {
  group: RouteGroup;
  /** Solo las líneas se pliegan; los corredores interurbanos van siempre abiertos. */
  expanded: boolean;
  visibleCount: number;
  onToggleExpanded: (key: string) => void;
  onSetVisible: (ids: readonly string[], visible: boolean) => void;
  children: ReactNode;
}

/**
 * Encabezado de una línea: su número como va en la micro, en una insignia
 * neutra (el color es de cada recorrido), y la empresa, que es como la
 * nombra la gente ("14 Chiguayante Sur"); debajo, de qué comuna a qué comuna
 * llega. Los corredores interurbanos dicen su destino y su operador.
 */
function RouteGroupRow({ group, expanded, visibleCount, onToggleExpanded, onSetVisible, children }: RouteGroupRowProps) {
  const line = group.kind === 'line';
  const total = group.routes.length;
  const allVisible = visibleCount === total;
  const detail = groupDetail(group);
  const detailId = useId();
  // Al pasar el puntero, lo que no cabe: todas las comunas y cuántos recorridos tiene.
  const fullDetail = [group.communes.join(', ') || detail, recorridos(total)].join(' · ');
  const eye = line
    ? {
        label: `Ver toda la línea ${group.number} ${group.name} en el mapa`,
        title: allVisible ? 'Quitar la línea del mapa' : 'Mostrar toda la línea',
      }
    : {
        label: `Ver todos los interurbanos de ${group.name} en el mapa`,
        title: allVisible ? 'Quitar del mapa' : 'Mostrar todos',
      };
  const heading = (
    <>
      {group.number && (
        <span
          aria-hidden
          className="inline-flex min-w-9 shrink-0 items-center justify-center rounded-md border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums text-foreground"
        >
          {group.number}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold leading-tight">{group.name}</span>
        <span id={detailId} className="block truncate text-[11px] text-muted-foreground">
          {detail}
        </span>
      </span>
      {visibleCount > 0 && (
        <span
          aria-hidden
          className="h-5 min-w-5 shrink-0 rounded-full bg-foreground px-1.5 text-center font-mono text-[11px] leading-5 text-background"
        >
          {visibleCount}
        </span>
      )}
      {/* En la línea la cuenta va en el aria-label del botón; el corredor no tiene botón. */}
      {!line && visibleCount > 0 && <span className="sr-only">, {visibleCount} en el mapa</span>}
    </>
  );
  return (
    <div className="min-w-0" role={line ? undefined : 'group'} aria-label={line ? undefined : `Interurbanos de ${group.name}`}>
      <div className={cn('flex min-w-0 items-center gap-1 rounded-md', line && 'hover:bg-accent/60')}>
        {line ? (
          <button
            type="button"
            onClick={() => onToggleExpanded(group.key)}
            aria-expanded={expanded}
            // Como lo escribe la prensa: "línea 14 Chiguayante Sur".
            aria-label={`Línea ${group.number} ${group.name}, ${recorridos(total)}${
              visibleCount > 0 ? `, ${visibleCount} en el mapa` : ''
            }`}
            // El aria-label tapa el contenido: las comunas que se ven van como descripción.
            aria-describedby={detailId}
            title={fullDetail}
            className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left focus-ring"
          >
            <ChevronRight
              aria-hidden
              className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-90')}
            />
            {heading}
          </button>
        ) : (
          <div className="flex min-h-10 min-w-0 flex-1 items-center gap-2 px-2 py-1" title={fullDetail}>
            {heading}
          </div>
        )}
        <button
          type="button"
          onClick={() => onSetVisible(group.routes.map((r) => r.id), !allVisible)}
          aria-pressed={allVisible}
          aria-label={eye.label}
          title={eye.title}
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-md transition-colors focus-ring md:size-8',
            allVisible ? 'text-foreground' : 'text-muted-foreground/60 hover:text-foreground',
          )}
        >
          {allVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      </div>
      {(expanded || !line) && <div className="ml-4 border-l pl-1.5">{children}</div>}
    </div>
  );
}
