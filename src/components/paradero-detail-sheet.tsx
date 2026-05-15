import { ArrowDownToDot, ArrowUpFromDot, ChevronRight, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ROUTES_BY_ID, ROUTE_TYPES, STOPS } from '@/data/routes';
import type { Paradero } from '@/types/transport';

interface ParaderoDetailSheetProps {
  open: boolean;
  paradero: Paradero | null;
  onOpenChange: (open: boolean) => void;
  onSelectRoute: (id: string) => void;
  onUseAsOrigin: (point: { lat: number; lng: number }) => void;
  onUseAsDestination: (point: { lat: number; lng: number }) => void;
}

export function ParaderoDetailSheet({
  open,
  paradero,
  onOpenChange,
  onSelectRoute,
  onUseAsOrigin,
  onUseAsDestination,
}: ParaderoDetailSheetProps) {
  const stop = useMemo(
    () => (paradero ? STOPS.find((s) => s.id === paradero.id) : undefined),
    [paradero],
  );

  const routes = useMemo(() => {
    if (!stop) return [];
    return stop.routes.map((id) => ROUTES_BY_ID.get(id)).filter((r) => !!r);
  }, [stop]);

  if (!paradero) return null;

  const name = paradero.name ?? `Paradero ${paradero.ref ?? paradero.sourceId ?? ''}`.trim();
  const point = { lat: paradero.lat, lng: paradero.lng };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-4 sm:w-[420px] sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Paradero GTFS
          </div>
          <SheetTitle className="pr-8">{name}</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {paradero.lat.toFixed(5)}, {paradero.lng.toFixed(5)}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-2 px-5">
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => onUseAsOrigin(point)}
          >
            <ArrowUpFromDot className="h-4 w-4 text-emerald-600" />
            Origen
          </Button>
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => onUseAsDestination(point)}
          >
            <ArrowDownToDot className="h-4 w-4 text-red-600" />
            Destino
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
          <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Recorridos vinculados</span>
            <span className="font-mono normal-case tracking-normal">
              {routes.length || 'sin match'}
            </span>
          </div>

          <ScrollArea className="flex-1">
            {routes.length > 0 ? (
              <div className="space-y-1.5">
                {routes.map((route) => {
                  const Icon = ROUTE_TYPES[route.type].Icon;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => onSelectRoute(route.id)}
                      className="flex w-full items-center gap-2 rounded-md border bg-card p-2 text-left transition-colors hover:bg-accent focus-ring"
                    >
                      <Badge
                        className="border-transparent font-mono"
                        style={{ background: route.color, color: '#fff' }}
                      >
                        {route.code}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{route.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Icon className="h-[11px] w-[11px]" />
                          {ROUTE_TYPES[route.type].short} · {route.operator}
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md border bg-muted/40 p-3 text-[12px] leading-snug text-muted-foreground">
                Este punto existe en <span className="font-mono">stops.txt</span>, pero no
                apareció en el viaje representativo usado para dibujar recorridos. Sigue
                sirviendo como punto de referencia y para planificar origen/destino.
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
            Próximas llegadas quedan pendientes hasta verificar un feed GTFS-RT público para
            Gran Concepción.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
