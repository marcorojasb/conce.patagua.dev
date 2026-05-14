import { Clock, Github, Info, Route as RouteIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTE_TYPES } from '@/data/routes';
import type { Route } from '@/types/transport';

interface RouteDetailSheetProps {
  open: boolean;
  route: Route | null;
  onOpenChange: (open: boolean) => void;
  onFocusRoute: () => void;
  onSelectStop: (id: string) => void;
}

function pathKilometers(path: Array<[number, number]>): number {
  let km = 0;
  for (let i = 1; i < path.length; i++) {
    const [a, b] = [path[i - 1], path[i]];
    const R = 6371;
    const dLat = ((b[0] - a[0]) * Math.PI) / 180;
    const dLng = ((b[1] - a[1]) * Math.PI) / 180;
    const lat1 = (a[0] * Math.PI) / 180;
    const lat2 = (b[0] * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    km += 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  return km;
}

export function RouteDetailSheet({
  open,
  route,
  onOpenChange,
  onFocusRoute,
  onSelectStop,
}: RouteDetailSheetProps) {
  if (!route) return null;
  const TypeIcon = ROUTE_TYPES[route.type].Icon;
  const lengthKm = pathKilometers(route.path);
  const hasStops = route.stops.length > 0;
  const hasFrequency = Object.keys(route.frequencyByDay).length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-4 sm:max-w-md sm:w-[420px]"
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white"
              style={{ background: route.color }}
            >
              <TypeIcon className="h-4 w-4" />
            </span>
            <Badge
              className="border-transparent font-mono"
              style={{ background: route.color, color: '#fff' }}
            >
              {route.code}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {ROUTE_TYPES[route.type].label}
            </span>
          </div>
          <SheetTitle className="pr-8">{route.name}</SheetTitle>
          <SheetDescription>{route.operator}</SheetDescription>
        </SheetHeader>

        <div className="px-5">
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" onClick={onFocusRoute}>
              <RouteIcon className="h-3.5 w-3.5" />
              Centrar en mapa
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('https://github.com', '_blank', 'noopener')}
            >
              <Github className="h-3.5 w-3.5" />
              Reportar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="info" className="flex min-h-0 flex-1 flex-col px-5 pb-5">
          <TabsList className="self-start">
            <TabsTrigger value="info">
              <Info className="h-3 w-3" />
              Info
            </TabsTrigger>
            <TabsTrigger value="recorrido">
              <RouteIcon className="h-3 w-3" />
              Recorrido
            </TabsTrigger>
            <TabsTrigger value="horarios">
              <Clock className="h-3 w-3" />
              Horarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              <div className="grid grid-cols-2 gap-2">
                <Card>
                  <CardHeader className="space-y-0.5 p-3">
                    <CardDescription className="text-[11px] uppercase tracking-wider">
                      Frecuencia
                    </CardDescription>
                    <CardTitle className="text-base">{route.headway}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="space-y-0.5 p-3">
                    <CardDescription className="text-[11px] uppercase tracking-wider">
                      Horario
                    </CardDescription>
                    <CardTitle className="text-base">{route.hours}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="space-y-0.5 p-3">
                    <CardDescription className="text-[11px] uppercase tracking-wider">
                      {hasStops ? 'Paraderos' : 'Recorrido'}
                    </CardDescription>
                    <CardTitle className="text-base">
                      {hasStops ? route.stops.length : `${lengthKm.toFixed(1)} km`}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="space-y-0.5 p-3">
                    <CardDescription className="text-[11px] uppercase tracking-wider">
                      Tipo
                    </CardDescription>
                    <CardTitle className="text-base">
                      {ROUTE_TYPES[route.type].short}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Operador
                </div>
                <p className="text-sm">{route.operator}</p>
              </div>

              <div className="mt-4 rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
                {hasStops ? (
                  <>
                    Datos: estaciones desde <span className="font-mono">OSM</span> · trazado{' '}
                    <span className="font-mono">railway=rail</span> ways · horarios EFE Trenes.
                  </>
                ) : (
                  <>
                    Recorrido mapeado en OpenStreetMap como{' '}
                    <span className="font-mono">route=bus</span>. Los paraderos
                    individuales se ven activando la capa{' '}
                    <span className="font-medium">Paraderos OSM</span> en la barra lateral.
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recorrido" className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              {hasStops ? (
                <ol className="relative">
                  {route.stops.map((s, i) => (
                    <li key={s.id} className="relative flex gap-3 pb-3">
                      {i < route.stops.length - 1 && (
                        <span
                          className="absolute left-[7px] top-4 h-full w-px"
                          style={{ background: route.color, opacity: 0.4 }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => onSelectStop(s.id)}
                        className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 bg-background"
                        style={{ borderColor: route.color }}
                        aria-label={`Centrar paradero ${s.name}`}
                      />
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onSelectStop(s.id)}
                          className="block rounded-sm text-left focus-ring"
                        >
                          <div className="text-sm font-medium leading-tight">{s.name}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                          </div>
                        </button>
                      </div>
                      <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
                  Esta ruta proviene de una relación{' '}
                  <span className="font-mono">route=bus</span> de OpenStreetMap.
                  Los paraderos individuales no están enlazados aún. Largo total
                  del recorrido: <span className="font-semibold">{lengthKm.toFixed(1)} km</span>.
                  Activa la capa <span className="font-medium">Paraderos OSM</span> para ver
                  todos los paraderos en el área.
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="horarios" className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-2">
              {hasFrequency ? (
                <div className="space-y-2">
                  {Object.entries(route.frequencyByDay).map(([day, freq]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between rounded-md border bg-card p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">{day}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Operativo {route.hours}
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {freq}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
                  Los horarios y frecuencias no están publicados de forma abierta para
                  este operador. <span className="font-mono">TODO</span> · cuando DTPR
                  libere GTFS Gran Concepción se enchufa el campo{' '}
                  <span className="font-mono">stop_times.txt</span> y se reemplaza este
                  bloque.
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
