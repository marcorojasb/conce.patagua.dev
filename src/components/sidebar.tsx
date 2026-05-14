import { useMemo, useState } from 'react';
import { Building2, ChevronRight, MapPin, Search } from 'lucide-react';
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
  routes: Route[];
  visibleRouteIds: string[];
  onToggleVisible: (id: string) => void;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  typeFilters: Record<RouteTypeId, boolean>;
  onToggleType: (typeId: RouteTypeId) => void;
  onSetAllByType: (typeId: RouteTypeId, on: boolean) => void;
  onSetAllByOperator: (operator: string, on: boolean) => void;
  terminalsCount: number;
  paraderosCount: number;
  showTerminals: boolean;
  showParaderos: boolean;
  onToggleTerminals: () => void;
  onToggleParaderos: () => void;
}

const NO_OPERATOR_LABEL = 'Sin operador registrado';

export function Sidebar({
  open,
  routes,
  visibleRouteIds,
  onToggleVisible,
  selectedRouteId,
  onSelectRoute,
  typeFilters,
  onToggleType,
  onSetAllByType,
  onSetAllByOperator,
  terminalsCount,
  paraderosCount,
  showTerminals,
  showParaderos,
  onToggleTerminals,
  onToggleParaderos,
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const [expandedOps, setExpandedOps] = useState<Set<string>>(new Set());

  const visibleSet = useMemo(() => new Set(visibleRouteIds), [visibleRouteIds]);

  const visibleCount = visibleRouteIds.length;
  const totalCount = routes.length;

  const typeStats = useMemo(() => {
    const stats: Partial<Record<RouteTypeId, { total: number; visible: number }>> = {};
    for (const r of routes) {
      const s = stats[r.type] ?? { total: 0, visible: 0 };
      s.total += 1;
      if (visibleSet.has(r.id)) s.visible += 1;
      stats[r.type] = s;
    }
    return stats;
  }, [routes, visibleSet]);

  const filteredFlat = useMemo(() => {
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
  }, [query, routes, typeFilters]);

  // Group by operator (only relevant for micros — Biotrén stays flat).
  const grouped = useMemo(() => {
    const biotren: Route[] = [];
    const byOp = new Map<string, Route[]>();
    for (const r of filteredFlat) {
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
      .map(([op, list]) => ({
        operator: op,
        routes: list,
        visible: list.reduce((acc, r) => acc + (visibleSet.has(r.id) ? 1 : 0), 0),
      }))
      .sort((a, b) => b.routes.length - a.routes.length);
    return { biotren, operators };
  }, [filteredFlat, visibleSet]);

  const showFlat = query.trim().length > 0;

  return (
    <aside
      className={cn(
        'relative z-20 flex h-full flex-col border-r bg-background transition-[width] duration-200 ease-out',
        open ? 'w-[300px]' : 'w-0',
      )}
      data-state={open ? 'open' : 'closed'}
    >
      <div
        className={cn(
          'flex h-full flex-col overflow-hidden transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className="border-b p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
            <div className="flex flex-wrap gap-1.5">
              {Object.values(ROUTE_TYPES).map((t) => {
                const active = !!typeFilters[t.id];
                const Icon = t.Icon;
                const stats = typeStats[t.id];
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onToggleType(t.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors focus-ring',
                      active
                        ? 'border-foreground/80 bg-foreground text-background'
                        : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <Icon className="h-3 w-3" />
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

          <div className="mt-3 border-t pt-3">
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Capas
            </div>
            <div className="space-y-1.5">
              <LayerRow
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Terminales"
                count={terminalsCount}
                checked={showTerminals}
                onChange={onToggleTerminals}
              />
              <LayerRow
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Paraderos OSM"
                count={paraderosCount}
                checked={showParaderos}
                onChange={onToggleParaderos}
              />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
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
              grouped.operators.map((g) => {
                const isExpanded = expandedOps.has(g.operator);
                const allVisible = g.visible === g.routes.length;
                return (
                  <div key={g.operator} className="pt-1">
                    <div className="flex items-stretch gap-1 px-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOps((cur) => {
                            const next = new Set(cur);
                            if (next.has(g.operator)) next.delete(g.operator);
                            else next.add(g.operator);
                            return next;
                          })
                        }
                        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[12px] hover:bg-accent/60 focus-ring"
                        aria-expanded={isExpanded}
                      >
                        <ChevronRight
                          className={cn(
                            'h-3 w-3 shrink-0 text-muted-foreground transition-transform',
                            isExpanded && 'rotate-90',
                          )}
                        />
                        <span className="truncate font-medium">{g.operator}</span>
                        <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                          {g.visible}/{g.routes.length}
                        </span>
                      </button>
                      <Tooltip
                        content={
                          allVisible
                            ? 'Quitar todos del operador'
                            : 'Activar todos del operador'
                        }
                        side="left"
                      >
                        <Switch
                          checked={allVisible}
                          onCheckedChange={() => onSetAllByOperator(g.operator, !allVisible)}
                          aria-label={`Alternar todos los recorridos de ${g.operator}`}
                        />
                      </Tooltip>
                    </div>
                    {isExpanded && (
                      <div className="mt-0.5">
                        {g.routes.map((r) => (
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
              })}
          </div>
        </ScrollArea>

        <div className="border-t p-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              Datos: <span className="font-mono">OSM + EFE</span>
            </span>
            <span>v0.3</span>
          </div>
        </div>
      </div>
    </aside>
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
        'group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 transition-colors',
        selected ? 'border-border bg-accent' : 'hover:bg-accent/60',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left focus-ring"
      >
        <Badge
          className="shrink-0 border-transparent font-mono"
          style={{ backgroundColor: route.color, color: '#fff' }}
        >
          {route.code}
        </Badge>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium leading-tight">{route.name}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Icon className="h-[11px] w-[11px]" />
            <span>{ROUTE_TYPES[route.type].short}</span>
            {route.stops.length > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>{route.stops.length} paraderos</span>
              </>
            )}
          </div>
        </div>
      </button>
      <Tooltip content={visible ? 'Ocultar en el mapa' : 'Mostrar en el mapa'} side="left">
        <Switch
          checked={visible}
          onCheckedChange={onToggle}
          aria-label={visible ? 'Ocultar en el mapa' : 'Mostrar en el mapa'}
        />
      </Tooltip>
    </div>
  );
}

interface LayerRowProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}

function LayerRow({ icon, label, count, checked, onChange }: LayerRowProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-sm hover:bg-accent/40">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 leading-tight">{label}</span>
      <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}
