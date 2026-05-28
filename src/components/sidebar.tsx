import { useMemo, useState } from 'react';
import { ChevronRight, Clock, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { ROUTE_TYPES } from '@/data/routes';
import { cn } from '@/lib/utils';
import type { Route, RouteTypeId } from '@/types/transport';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  routes: Route[];
  visibleRouteIds: string[];
  onToggleVisible: (id: string) => void;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  typeFilters: Record<RouteTypeId, boolean>;
  onToggleType: (typeId: RouteTypeId) => void;
  onSetAllByType: (typeId: RouteTypeId, on: boolean) => void;
  onSetAllByOperator: (operator: string, on: boolean) => void;
  onlyOperatingNow: boolean;
  onToggleOnlyOperatingNow: () => void;
  onOpenSources: () => void;
  onOpenAnalysis: () => void;
}

type TypeStats = Partial<Record<RouteTypeId, { total: number; visible: number }>>;

interface OperatorGroup {
  operator: string;
  routes: Route[];
  visible: number;
}

const NO_OPERATOR_LABEL = 'Sin operador registrado';

export function Sidebar({
  open,
  onClose,
  routes,
  visibleRouteIds,
  onToggleVisible,
  selectedRouteId,
  onSelectRoute,
  typeFilters,
  onToggleType,
  onSetAllByType,
  onSetAllByOperator,
  onlyOperatingNow,
  onToggleOnlyOperatingNow,
  onOpenSources,
  onOpenAnalysis,
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const [expandedOps, setExpandedOps] = useState<Set<string>>(new Set());

  const visibleSet = useMemo(() => new Set(visibleRouteIds), [visibleRouteIds]);
  const typeStats = useMemo(() => buildTypeStats(routes, visibleSet), [routes, visibleSet]);
  const filteredFlat = useMemo(
    () => filterRoutes(routes, query, typeFilters),
    [query, routes, typeFilters],
  );
  const grouped = useMemo(() => groupRoutesByOperator(filteredFlat, visibleSet), [
    filteredFlat,
    visibleSet,
  ]);

  const showFlat = query.trim().length > 0;

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
      >
        <div
          className={cn(
            'flex h-full min-w-0 flex-col overflow-hidden transition-opacity',
            open ? 'opacity-100' : 'hidden pointer-events-none opacity-0',
          )}
        >
          <SidebarFilters
            query={query}
            onQueryChange={setQuery}
            visibleCount={visibleRouteIds.length}
            totalCount={routes.length}
            typeFilters={typeFilters}
            typeStats={typeStats}
            onToggleType={onToggleType}
            onSetAllByType={onSetAllByType}
            onlyOperatingNow={onlyOperatingNow}
            onToggleOnlyOperatingNow={onToggleOnlyOperatingNow}
          />
          <SidebarRouteList
            showFlat={showFlat}
            filteredFlat={filteredFlat}
            grouped={grouped}
            visibleSet={visibleSet}
            selectedRouteId={selectedRouteId}
            expandedOps={expandedOps}
            onExpandedOpsChange={setExpandedOps}
            onSelectRoute={onSelectRoute}
            onToggleVisible={onToggleVisible}
            onSetAllByOperator={onSetAllByOperator}
          />
          <SidebarFooter onOpenAnalysis={onOpenAnalysis} onOpenSources={onOpenSources} />
        </div>
      </aside>
    </>
  );
}

function buildTypeStats(routes: Route[], visibleSet: Set<string>): TypeStats {
  const stats: TypeStats = {};
  for (const r of routes) {
    const s = stats[r.type] ?? { total: 0, visible: 0 };
    s.total += 1;
    if (visibleSet.has(r.id)) s.visible += 1;
    stats[r.type] = s;
  }
  return stats;
}

function filterRoutes(
  routes: Route[],
  query: string,
  typeFilters: Record<RouteTypeId, boolean>,
): Route[] {
  const q = query.trim().toLowerCase();
  return routes.filter((r) => {
    if (!typeFilters[r.type]) return false;
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      ROUTE_TYPES[r.type].label.toLowerCase().includes(q) ||
      (r.operator?.toLowerCase().includes(q) ?? false)
    );
  });
}

function groupRoutesByOperator(
  routes: Route[],
  visibleSet: Set<string>,
): { biotren: Route[]; operators: OperatorGroup[] } {
  const biotren: Route[] = [];
  const byOp = new Map<string, Route[]>();
  for (const r of routes) {
    if (r.type === 'biotren') {
      biotren.push(r);
      continue;
    }
    const op = r.operator ?? NO_OPERATOR_LABEL;
    const list = byOp.get(op) ?? [];
    list.push(r);
    byOp.set(op, list);
  }
  const operators = Array.from(byOp.entries())
    .map(([operator, opRoutes]) => ({
      operator,
      routes: opRoutes,
      visible: opRoutes.reduce((acc, r) => acc + (visibleSet.has(r.id) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.routes.length - a.routes.length);
  return { biotren, operators };
}

interface SidebarFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  visibleCount: number;
  totalCount: number;
  typeFilters: Record<RouteTypeId, boolean>;
  typeStats: TypeStats;
  onToggleType: (typeId: RouteTypeId) => void;
  onSetAllByType: (typeId: RouteTypeId, on: boolean) => void;
  onlyOperatingNow: boolean;
  onToggleOnlyOperatingNow: () => void;
}

function SidebarFilters({
  query,
  onQueryChange,
  visibleCount,
  totalCount,
  typeFilters,
  typeStats,
  onToggleType,
  onSetAllByType,
  onlyOperatingNow,
  onToggleOnlyOperatingNow,
}: SidebarFiltersProps) {
  return (
    <div className="min-w-0 border-b p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar recorrido u operador…"
          className="h-9 pl-8"
        />
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tipo
          </span>
          <span className="text-[11px] text-muted-foreground">
            {visibleCount}/{totalCount} visibles
          </span>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-1.5">
          {Object.values(ROUTE_TYPES).map((t) => {
            const active = !!typeFilters[t.id];
            const Icon = t.Icon;
            const stats = typeStats[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleType(t.id)}
                aria-pressed={active}
                className={cn(
                  'inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-md border p-2 text-xs transition-colors focus-ring md:min-h-8 md:px-2.5 md:py-1.5',
                  active
                    ? 'border-foreground/70 bg-foreground text-background shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {t.short}
                {stats && stats.total > 1 && (
                  <span className="opacity-70">
                    {stats.visible}/{stats.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {Object.values(ROUTE_TYPES).map((t) => {
          const stats = typeStats[t.id];
          if (!stats || stats.total < 5) return null;
          const allVisible = stats.visible === stats.total;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSetAllByType(t.id, !allVisible)}
              className="mt-1.5 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-[11px] text-muted-foreground hover:text-foreground focus-ring"
            >
              {allVisible
                ? `Quitar todos los ${t.short.toLowerCase()}s (${stats.total})`
                : `Activar todos los ${t.short.toLowerCase()}s (${stats.total})`}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex min-h-9 items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5 text-[12px]">
        <Clock className="size-3.5 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate leading-tight">Solo activos ahora</span>
        <Switch
          checked={onlyOperatingNow}
          onCheckedChange={onToggleOnlyOperatingNow}
          aria-label="Solo recorridos activos ahora"
          className="shrink-0 scale-90"
        />
      </div>
    </div>
  );
}

interface SidebarRouteListProps {
  showFlat: boolean;
  filteredFlat: Route[];
  grouped: { biotren: Route[]; operators: OperatorGroup[] };
  visibleSet: Set<string>;
  selectedRouteId: string | null;
  expandedOps: Set<string>;
  onExpandedOpsChange: (updater: (current: Set<string>) => Set<string>) => void;
  onSelectRoute: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onSetAllByOperator: (operator: string, on: boolean) => void;
}

function SidebarRouteList({
  showFlat,
  filteredFlat,
  grouped,
  visibleSet,
  selectedRouteId,
  expandedOps,
  onExpandedOpsChange,
  onSelectRoute,
  onToggleVisible,
  onSetAllByOperator,
}: SidebarRouteListProps) {
  return (
    <ScrollArea className="min-w-0 flex-1">
      <div className="min-w-0 max-w-full space-y-1 overflow-hidden p-2 pr-4">
        {filteredFlat.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Sin recorridos para los filtros actuales.
          </div>
        )}

        {showFlat &&
          filteredFlat.map((r) => (
            <RouteRow
              key={r.id}
              route={r}
              visible={visibleSet.has(r.id)}
              selected={selectedRouteId === r.id}
              onSelect={() => onSelectRoute(r.id)}
              onToggle={() => onToggleVisible(r.id)}
            />
          ))}

        {!showFlat && grouped.biotren.length > 0 && (
          <div className="pt-1">
            <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Biotrén
            </div>
            {grouped.biotren.map((r) => (
              <RouteRow
                key={r.id}
                route={r}
                visible={visibleSet.has(r.id)}
                selected={selectedRouteId === r.id}
                onSelect={() => onSelectRoute(r.id)}
                onToggle={() => onToggleVisible(r.id)}
              />
            ))}
          </div>
        )}

        {!showFlat &&
          grouped.operators.map((g) => (
            <OperatorSection
              key={g.operator}
              group={g}
              visibleSet={visibleSet}
              selectedRouteId={selectedRouteId}
              expanded={expandedOps.has(g.operator)}
              onToggleExpanded={() =>
                onExpandedOpsChange((cur) => {
                  const next = new Set(cur);
                  if (next.has(g.operator)) next.delete(g.operator);
                  else next.add(g.operator);
                  return next;
                })
              }
              onSelectRoute={onSelectRoute}
              onToggleVisible={onToggleVisible}
              onSetAllByOperator={onSetAllByOperator}
            />
          ))}
      </div>
    </ScrollArea>
  );
}

interface OperatorSectionProps {
  group: OperatorGroup;
  visibleSet: Set<string>;
  selectedRouteId: string | null;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelectRoute: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onSetAllByOperator: (operator: string, on: boolean) => void;
}

function OperatorSection({
  group,
  visibleSet,
  selectedRouteId,
  expanded,
  onToggleExpanded,
  onSelectRoute,
  onToggleVisible,
  onSetAllByOperator,
}: OperatorSectionProps) {
  const allVisible = group.visible === group.routes.length;
  return (
    <div className="min-w-0 pt-1">
      <div className="grid min-w-0 max-w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-1 px-1">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex min-w-0 overflow-hidden rounded-md px-1.5 py-1 text-left text-[12px] hover:bg-accent/60 focus-ring"
          aria-expanded={expanded}
        >
          <ChevronRight
            className={cn(
              'mr-1 size-3 shrink-0 text-muted-foreground transition-transform',
              expanded && 'rotate-90',
            )}
          />
          <span className="min-w-0 flex-1 truncate font-medium">{group.operator}</span>
          <span className="ml-2 shrink-0 rounded border bg-muted/30 px-1 font-mono text-[10px] text-muted-foreground">
            {group.visible}/{group.routes.length}
          </span>
        </button>
        <Tooltip
          content={allVisible ? 'Quitar todos del operador' : 'Activar todos del operador'}
          side="left"
        >
          <span className="inline-flex">
            <Switch
              checked={allVisible}
              onCheckedChange={() => onSetAllByOperator(group.operator, !allVisible)}
              aria-label={`Alternar todos los recorridos de ${group.operator}`}
              className="scale-90"
            />
          </span>
        </Tooltip>
      </div>
      {expanded && (
        <div className="mt-0.5">
          {group.routes.map((r) => (
            <RouteRow
              key={r.id}
              route={r}
              visible={visibleSet.has(r.id)}
              selected={selectedRouteId === r.id}
              onSelect={() => onSelectRoute(r.id)}
              onToggle={() => onToggleVisible(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarFooterProps {
  onOpenAnalysis: () => void;
  onOpenSources: () => void;
}

function SidebarFooter({ onOpenAnalysis, onOpenSources }: SidebarFooterProps) {
  return (
    <div className="border-t p-3">
      <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAnalysis}
            className="rounded-sm underline-offset-2 hover:text-foreground hover:underline focus-ring"
          >
            Análisis
          </button>
          <span aria-hidden className="text-muted-foreground/50">
            ·
          </span>
          <button
            type="button"
            onClick={onOpenSources}
            className="rounded-sm underline-offset-2 hover:text-foreground hover:underline focus-ring"
          >
            Fuentes
          </button>
          <span aria-hidden className="text-muted-foreground/50">
            ·
          </span>
          <a
            href="/wiki"
            className="rounded-sm underline-offset-2 hover:text-foreground hover:underline focus-ring"
          >
            Wiki
          </a>
        </div>
        <span>v0.8</span>
      </div>
      <div className="mt-2 text-[10px] leading-snug text-muted-foreground">
        Programado por{' '}
        <a
          href="https://patagua.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-2 hover:text-foreground hover:underline"
        >
          mrcr en patagua.dev
        </a>
        . Visión: aporte a la comunidad y a la política pública del Gran Concepción.
      </div>
    </div>
  );
}

interface RouteRowProps {
  route: Route;
  visible: boolean;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}

function RouteRow({ route, visible, selected, onSelect, onToggle }: RouteRowProps) {
  const Icon = ROUTE_TYPES[route.type].Icon;
  return (
    <div
      className={cn(
        'group flex min-h-11 min-w-0 max-w-full overflow-hidden rounded-md border border-transparent p-2 transition-colors',
        selected ? 'border-border bg-accent' : 'hover:bg-accent/60',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 basis-0 items-center gap-2 overflow-hidden rounded-sm text-left focus-ring"
      >
        <Badge
          className="shrink-0 border-transparent font-mono"
          style={{ backgroundColor: route.color, color: '#fff' }}
        >
          {route.code}
        </Badge>
        <div className="min-w-0 flex-1 basis-0">
          <div className="truncate text-sm font-medium leading-tight">{route.name}</div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
            <Icon className="size-[11px]" />
            <span className="shrink-0">{ROUTE_TYPES[route.type].short}</span>
            {route.stops.length > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="truncate">{route.stops.length} paraderos</span>
              </>
            )}
          </div>
        </div>
      </button>
      <Tooltip content={visible ? 'Ocultar en el mapa' : 'Mostrar en el mapa'} side="left">
        <span className="inline-flex">
          <Switch
            checked={visible}
            onCheckedChange={onToggle}
            aria-label={visible ? 'Ocultar en el mapa' : 'Mostrar en el mapa'}
            className="shrink-0 scale-90"
          />
        </span>
      </Tooltip>
    </div>
  );
}
