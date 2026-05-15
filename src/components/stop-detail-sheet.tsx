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
import { isoDayOfWeek, useStopFrequency } from '@/hooks/use-stop-frequency';
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

  // Only load the frequency chunk when the sheet is actually open and we
  // have a paradero — avoids paying the chunk download for users who never
  // tap a stop.
  const freqStopId = open && stop ? stop.id : null;
  const frequency = useStopFrequency(freqStopId);

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

          <FrequencyBlock
            stop={stop}
            hourly={frequency.hourly}
            loading={frequency.loading}
          />

          <div className="mt-4 rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
            Próximas llegadas en tiempo real (GTFS-RT vehicle positions +
            stop_time_updates) cuando DTPR publique el feed. Hasta entonces, los
            datos son el horario estático.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function FrequencyBlock({
  stop,
  hourly,
  loading,
}: {
  stop: StopWithRoutes;
  hourly: number[] | null;
  loading: boolean;
}) {
  const now = new Date();
  const today = isoDayOfWeek(now);
  const hourNow = now.getHours();

  const stats = useMemo(() => {
    if (!hourly) return null;
    const todaySlice = hourly.slice(today * 24, today * 24 + 24);
    const totalToday = todaySlice.reduce((a, b) => a + b, 0);
    const totalWeek = hourly.reduce((a, b) => a + b, 0);
    const peakHour = todaySlice.reduce(
      (acc, count, hour) => (count > acc.count ? { hour, count } : acc),
      { hour: 0, count: 0 },
    );
    return {
      now: todaySlice[hourNow] ?? 0,
      totalToday,
      totalWeek,
      peakHour,
      todaySlice,
    };
  }, [hourly, today, hourNow]);

  if (loading) {
    return (
      <div className="mt-4 rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
        Cargando frecuencia programada…
      </div>
    );
  }

  if (!hourly || !stats) {
    return (
      <div className="mt-4 rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
        Sin datos de frecuencia GTFS para este paradero — probablemente solo lo
        atienden recorridos sin horario publicado (Biotrén o líneas fuera del
        feed Gran Concepción).
      </div>
    );
  }

  const max = Math.max(...stats.todaySlice, 1);

  return (
    <div className="mt-4 rounded-md border bg-card p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Frecuencia programada</span>
        <span className="font-mono normal-case tracking-normal text-muted-foreground">
          {DAY_LABELS[today]} · {String(hourNow).padStart(2, '0')}:00
        </span>
      </div>

      <div className="mb-2 grid grid-cols-3 gap-2">
        <Stat label="esta hora" value={stats.now} suffix="buses" />
        <Stat label="hoy" value={stats.totalToday} suffix="buses" />
        <Stat
          label="hora pico"
          value={stats.peakHour.count}
          suffix={`@${String(stats.peakHour.hour).padStart(2, '0')}h`}
        />
      </div>

      <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Distribución horaria · {DAY_LABELS[today]}
      </div>
      <HourlyBars hourly={stats.todaySlice} max={max} currentHour={hourNow} />

      <div className="mt-2 text-[10px] leading-snug text-muted-foreground">
        Datos: GTFS estático Gran Concepción · {stop.routes.length} recorridos
        registrados aquí.
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-base font-semibold leading-none">{value}</span>
        <span className="text-[10px] text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function HourlyBars({
  hourly,
  max,
  currentHour,
}: {
  hourly: number[];
  max: number;
  currentHour: number;
}) {
  return (
    <div className="flex h-12 items-end gap-[2px]">
      {hourly.map((count, hour) => {
        const pct = max > 0 ? (count / max) * 100 : 0;
        const isCurrent = hour === currentHour;
        const tooltip = `${String(hour).padStart(2, '0')}:00 · ${count} buses`;
        return (
          <div
            key={hour}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
            title={tooltip}
            aria-label={tooltip}
          >
            <div
              className={cn(
                'w-full rounded-t-sm transition-colors',
                isCurrent
                  ? 'bg-foreground'
                  : count > 0
                    ? 'bg-foreground/40'
                    : 'bg-foreground/10',
              )}
              style={{ height: `${Math.max(pct, count > 0 ? 4 : 1)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
