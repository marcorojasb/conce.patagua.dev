import { useMemo } from 'react';
import {
  ExternalLink,
  GraduationCap,
  HeartPulse,
  Map as MapIcon,
  Route as RouteIcon,
  ShoppingBag,
} from 'lucide-react';
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
import { ROUTES, ROUTE_TYPES } from '@/data/routes';
import { distanceMeters } from '@/lib/geo';
import type { Poi, PoiCategory, Route } from '@/types/transport';

const CATEGORY_LABEL: Record<PoiCategory, string> = {
  hospital: 'Hospital',
  university: 'Universidad',
  college: 'Centro de formación',
  mall: 'Mall / centro comercial',
};

const CATEGORY_ICON: Record<PoiCategory, typeof HeartPulse> = {
  hospital: HeartPulse,
  university: GraduationCap,
  college: GraduationCap,
  mall: ShoppingBag,
};

const NEARBY_RADIUS_M = 400;

function nearbyRoutes(poi: Poi): Array<{ route: Route; minDistance: number }> {
  const matches: Array<{ route: Route; minDistance: number }> = [];
  for (const r of ROUTES) {
    let best = Infinity;
    for (const p of r.path) {
      const d = distanceMeters([poi.lat, poi.lng], [p[0], p[1]]);
      if (d < best) best = d;
      if (best <= 10) break;
    }
    if (best <= NEARBY_RADIUS_M) {
      matches.push({ route: r, minDistance: best });
    }
  }
  matches.sort((a, b) => a.minDistance - b.minDistance);
  return matches;
}

interface PoiDetailSheetProps {
  open: boolean;
  poi: Poi | null;
  onOpenChange: (open: boolean) => void;
  onFocus: () => void;
  onSelectRoute: (id: string) => void;
}

export function PoiDetailSheet({
  open,
  poi,
  onOpenChange,
  onFocus,
  onSelectRoute,
}: PoiDetailSheetProps) {
  const nearby = useMemo(() => (poi ? nearbyRoutes(poi) : []), [poi]);

  if (!poi) return null;

  const CategoryIcon = CATEGORY_ICON[poi.category];
  const osmUrl = `https://www.openstreetmap.org/${poi.osmType}/${poi.osmId}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-4 sm:max-w-md sm:w-[440px]">
        <SheetHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CategoryIcon className="h-3.5 w-3.5" />
            <span>Centro de atracción · {CATEGORY_LABEL[poi.category]}</span>
          </div>
          <SheetTitle className="pr-8">{poi.name}</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {poi.lat.toFixed(5)}, {poi.lng.toFixed(5)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pb-5">
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" onClick={onFocus}>
              <MapIcon className="h-3.5 w-3.5" />
              Centrar en mapa
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(osmUrl, '_blank', 'noopener')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver en OSM
            </Button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span>
                <RouteIcon className="mr-1 inline h-3 w-3" />
                Recorridos a ≤{NEARBY_RADIUS_M} m
              </span>
              <span className="font-mono">{nearby.length} encontrados</span>
            </div>
            <ScrollArea className="max-h-[40vh]">
              {nearby.length === 0 ? (
                <div className="rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
                  Ningún recorrido cargado pasa a menos de {NEARBY_RADIUS_M} m. Activa más
                  micros en la sidebar para extender la búsqueda — el cálculo se hace contra
                  los recorridos cargados, no contra los activos en el mapa.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {nearby.slice(0, 20).map(({ route, minDistance }) => {
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
                            {ROUTE_TYPES[route.type].short}
                            <span aria-hidden>·</span>
                            <span>{Math.round(minDistance)} m</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {nearby.length > 20 && (
                    <div className="pt-1 text-center text-[11px] text-muted-foreground">
                      + {nearby.length - 20} recorridos más
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
            Cálculo de proximidad por vértice del trazado. No considera distancia caminable
            ni accesibilidad peatonal — solo proximidad euclidiana al polyline.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
