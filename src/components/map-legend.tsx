import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { routeShortName } from '@/lib/route-labels';
import { cn } from '@/lib/utils';
import type { Route } from '@/types/transport';

interface Props {
  routes: Route[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

const MAX_ROWS = 10;

export function MapLegend({ routes, selectedRouteId, onSelectRoute }: Props) {
  // En pantallas chicas arranca plegada: ahí el mapa es lo que importa.
  const [open, setOpen] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(min-width: 768px)').matches,
  );
  const shown = routes.slice(0, MAX_ROWS);
  const hidden = routes.length - shown.length;

  return (
    <div
      className={cn(
        'pointer-events-auto overflow-hidden rounded-lg border bg-background/90 text-[11px] shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/80',
        open ? 'w-[min(280px,calc(100vw-5rem))]' : 'w-auto',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-ring"
      >
        <span>
          Leyenda
          <span className="ml-1.5 font-mono normal-case tracking-normal">{routes.length}</span>
        </span>
        <ChevronDown className={cn('size-3.5 transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <ul className="thin-scroll max-h-[30vh] overflow-y-auto border-t px-1 py-1 md:max-h-[40vh]">
          {shown.map((route) => (
            <li key={route.id}>
              <button
                type="button"
                onClick={() => onSelectRoute(route.id)}
                aria-pressed={selectedRouteId === route.id}
                title={route.name}
                className={cn(
                  'grid w-full grid-cols-[1.25rem_2.25rem_minmax(0,1fr)] items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-accent focus-ring',
                  selectedRouteId === route.id && 'bg-accent',
                )}
              >
                <span aria-hidden className="h-[3px] w-5 rounded-full" style={{ background: route.color }} />
                <span className="truncate font-mono text-[10px] text-muted-foreground">{route.code}</span>
                <span className="truncate">{routeShortName(route)}</span>
              </button>
            </li>
          ))}
          {hidden > 0 && (
            <li className="px-2 py-1 text-muted-foreground">+ {hidden} más en la lista lateral</li>
          )}
        </ul>
      )}
    </div>
  );
}
