import { useMemo } from 'react';
import { Accessibility, ChevronRight, ExternalLink, Footprints, MapPin } from 'lucide-react';
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
import { BIOTREN_WIKIDATA } from '@/data/wikidata.generated';
import { isRouteOperatingNow } from '@/lib/operating-hours';
import { cn } from '@/lib/utils';
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

  const activeCount = useMemo(
    () => routes.reduce((acc, r) => acc + (isRouteOperatingNow(r) ? 1 : 0), 0),
    [routes],
  );

  if (!stop) return null;

  const wikidata = stop.wikidata ? BIOTREN_WIKIDATA[stop.wikidata] : undefined;
  const hasAccessibility = stop.wheelchair || stop.tactilePaving;
  const hasEnrichment = !!wikidata && (wikidata.openedYear || wikidata.imageUrl || wikidata.wikipediaEs);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-4 sm:max-w-md sm:w-[420px]">
        <SheetHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {stop.wikidata ? 'Estación Biotrén' : 'Paradero'}
          </div>
          <SheetTitle className="pr-8">{stop.name}</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
          </SheetDescription>
        </SheetHeader>

        {(hasEnrichment || hasAccessibility) && (
          <div className="space-y-2 px-5">
            {wikidata?.imageUrl && (
              <img
                src={wikidata.imageUrl}
                alt={stop.name}
                className="aspect-video w-full rounded-md border object-cover"
                loading="lazy"
              />
            )}
            <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
              {wikidata?.openedYear && (
                <Badge variant="secondary" className="font-mono">
                  Inaugurada {wikidata.openedYear}
                </Badge>
              )}
              {stop.wheelchair === 'yes' && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Accessibility className="h-3 w-3" />
                  Accesible
                </Badge>
              )}
              {stop.wheelchair === 'limited' && (
                <Badge variant="outline" className="gap-1 font-normal">
                  <Accessibility className="h-3 w-3" />
                  Acceso limitado
                </Badge>
              )}
              {stop.tactilePaving && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Footprints className="h-3 w-3" />
                  Pavimento podotáctil
                </Badge>
              )}
              {wikidata?.wikipediaEs && (
                <a
                  href={wikidata.wikipediaEs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 rounded-sm text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-ring"
                >
                  Wikipedia <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
          <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Recorridos que pasan</span>
            <span className="font-mono normal-case tracking-normal text-muted-foreground">
              {activeCount}/{routes.length} operando ahora
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1.5">
              {routes.map((r) => {
                const Icon = ROUTE_TYPES[r.type].Icon;
                const active = isRouteOperatingNow(r);
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
                        {ROUTE_TYPES[r.type].short}
                        {r.headway !== '—' && ` · cada ${r.headway}`}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex h-2 w-2 shrink-0 rounded-full',
                        active ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                      )}
                      aria-label={active ? 'Operando ahora' : 'Fuera de horario o sin datos'}
                    />
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
