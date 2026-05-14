import { useMemo, useState } from 'react';
import { Building2, MapPin, Search } from 'lucide-react';
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
  terminalsCount: number;
  paraderosCount: number;
  showTerminals: boolean;
  showParaderos: boolean;
  onToggleTerminals: () => void;
  onToggleParaderos: () => void;
}

export function Sidebar({
  open,
  routes,
  visibleRouteIds,
  onToggleVisible,
  selectedRouteId,
  onSelectRoute,
  typeFilters,
  onToggleType,
  terminalsCount,
  paraderosCount,
  showTerminals,
  showParaderos,
  onToggleTerminals,
  onToggleParaderos,
}: SidebarProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return routes.filter((r) => {
      if (!typeFilters[r.type]) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        ROUTE_TYPES[r.type].label.toLowerCase().includes(q)
      );
    });
  }, [query, routes, typeFilters]);

  const visibleCount = visibleRouteIds.length;
  const totalCount = routes.length;

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
              placeholder="Buscar recorrido…"
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
                  </button>
                );
              })}
            </div>
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
            {filtered.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                Sin recorridos para los filtros actuales.
              </div>
            )}
            {filtered.map((r) => {
              const isSelected = selectedRouteId === r.id;
              const isVisible = visibleRouteIds.includes(r.id);
              const Icon = ROUTE_TYPES[r.type].Icon;
              return (
                <div
                  key={r.id}
                  className={cn(
                    'group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 transition-colors',
                    isSelected ? 'border-border bg-accent' : 'hover:bg-accent/60',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectRoute(r.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left focus-ring"
                  >
                    <Badge
                      className="shrink-0 border-transparent font-mono"
                      style={{ backgroundColor: r.color, color: '#fff' }}
                    >
                      {r.code}
                    </Badge>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium leading-tight">{r.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Icon className="h-[11px] w-[11px]" />
                        <span>{ROUTE_TYPES[r.type].short}</span>
                        <span aria-hidden>·</span>
                        <span>{r.stops.length} paraderos</span>
                      </div>
                    </div>
                  </button>
                  <Tooltip
                    content={isVisible ? 'Ocultar en el mapa' : 'Mostrar en el mapa'}
                    side="left"
                  >
                    <Switch
                      checked={isVisible}
                      onCheckedChange={() => onToggleVisible(r.id)}
                      aria-label={isVisible ? 'Ocultar en el mapa' : 'Mostrar en el mapa'}
                    />
                  </Tooltip>
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
            <span>v0.2</span>
          </div>
          {/* TODO: conectar GTFS Gran Concepción cuando DTPR lo publique */}
        </div>
      </div>
    </aside>
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
