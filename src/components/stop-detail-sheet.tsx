import { useMemo } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ROUTES, ROUTE_TYPES } from '@/data/routes';
import type { StopWithRoutes } from '@/types/transport';

interface StopDetailSheetProps {
  open: boolean;
  stop: StopWithRoutes | null;
  onOpenChange: (open: boolean) => void;
  onSelectRoute: (id: string) => void;
}

export function StopDetailSheet({ open, stop, onOpenChange, onSelectRoute }: StopDetailSheetProps) {
  const routes = useMemo(() => {
    if (!stop) return [];
    return stop.routes.map((rid) => ROUTES.find((r) => r.id === rid)).filter((r) => !!r);
  }, [stop]);

  if (!stop) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-4 sm:max-w-md sm:w-[420px]">
        <SheetHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Paradero
          </div>
          <SheetTitle className="pr-8">{stop.name}</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recorridos que pasan
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1.5">
              {routes.map((r) => {
                const Icon = ROUTE_TYPES[r.type].Icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectRoute(r.id)}
                    className="flex w-full items-center gap-2 rounded-md border bg-card p-2 text-left transition-colors hover:bg-accent focus-ring"
                  >
                    <Badge
                      className="border-transparent font-mono"
                      style={{ background: r.color, color: '#fff' }}
                    >
                      {r.code}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{r.name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Icon className="h-[11px] w-[11px]" />
                        {ROUTE_TYPES[r.type].short} · cada {r.headway}
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          <div className="mt-4 rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
            <span className="font-mono">TODO</span> · próximas llegadas en tiempo real
            (GTFS-RT vehicle positions + stop_time_updates).
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
