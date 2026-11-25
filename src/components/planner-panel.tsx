import { useMemo } from 'react';
import { Footprints, LocateFixed, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { SectionLabel } from '@/components/ui/section-label';
import { StatTile } from '@/components/ui/stat-tile';
import { RouteBadge } from '@/components/route-badge';
import { GTFS_STOPS } from '@/data/gtfs-stops.generated';
import { ROUTE_TYPES } from '@/data/routes';
import { nearestStop } from '@/lib/nearest-stop';
import { routePillCode, routeShortName } from '@/lib/route-labels';
import { formatDistanceMeters, formatDurationSeconds, type RoutingResult } from '@/lib/routing';
import { cn } from '@/lib/utils';
import type { LatLng, PlannerPanelProps } from '@/types/ui-contracts';

/** Hasta dónde un paradero sirve para nombrar el punto ("Cerca de …"). */
const NAME_RADIUS_M = 300;
const MAX_LISTED = 10;

export function PlannerPanel({
  a,
  b,
  pick,
  matches,
  searchAll,
  onSearchAllChange,
  linesOnMap,
  onPick,
  onCancelPick,
  onClear,
  onSelectRoute,
  midpoint,
  midpointLoading,
  midpointError,
  onComputeMidpoint,
  onClearMidpoint,
}: PlannerPanelProps) {
  return (
    <div className="min-w-0 space-y-3">
      <div className="space-y-2">
        <PointRow target="a" point={a} active={pick === 'a'} onPick={onPick} onCancel={onCancelPick} />
        <PointRow target="b" point={b} active={pick === 'b'} onPick={onPick} onCancel={onCancelPick} />
      </div>

      {(a || b) && (
        <Button type="button" size="sm" variant="ghost" className="px-2" onClick={onClear}>
          <X className="size-3.5" />
          Limpiar
        </Button>
      )}

      {!a || !b ? (
        <p className="text-[12px] leading-snug text-muted-foreground">
          Elige el origen (A) y el destino (B) tocando el mapa: aquí aparecen los recorridos que
          pasan a 400 m o menos de los dos.
        </p>
      ) : (
        <>
          <section aria-label="Recorridos que sirven">
            <MatchesHeader
              count={matches.length}
              searchAll={searchAll}
              linesOnMap={linesOnMap}
              onSearchAllChange={onSearchAllChange}
            />
            {matches.length > 0 && (
              <ul className="space-y-1">
                {matches.slice(0, MAX_LISTED).map((m) => (
                  <li key={m.route.id}>
                    <button
                      type="button"
                      onClick={() => onSelectRoute(m.route.id)}
                      className="flex w-full items-center gap-2 rounded-md border bg-card p-2 text-left transition-colors hover:bg-accent focus-ring"
                    >
                      <RouteBadge code={routePillCode(m.route)} color={m.route.color} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium">{routeShortName(m.route)}</div>
                        <div className="text-[11px] text-muted-foreground tabular-nums">
                          {ROUTE_TYPES[m.route.type].short} · A {Math.round(m.originDistance)} m · B{' '}
                          {Math.round(m.destinationDistance)} m
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
                {matches.length > MAX_LISTED && (
                  <li className="text-center text-[11px] text-muted-foreground">
                    + {matches.length - MAX_LISTED} más
                  </li>
                )}
              </ul>
            )}
          </section>

          <MidpointSection
            midpoint={midpoint}
            loading={midpointLoading}
            error={midpointError}
            onCompute={onComputeMidpoint}
            onClear={onClearMidpoint}
          />
        </>
      )}
    </div>
  );
}

/** "Cerca de {paradero} · 120 m"; sin paradero a 300 m, las coordenadas (detail null). */
function describePoint(point: LatLng): { label: string; detail: string | null } {
  const near = nearestStop(point, GTFS_STOPS, NAME_RADIUS_M);
  const coords = `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
  if (!near?.stop.name) return { label: coords, detail: null };
  // Sobre el mismo paradero (p. ej. "Salir desde aquí") la distancia no aporta.
  const meters = Math.round(near.meters);
  return { label: meters < 10 ? `Cerca de ${near.stop.name}` : `Cerca de ${near.stop.name} · ${meters} m`, detail: coords };
}

function PointRow({
  target,
  point,
  active,
  onPick,
  onCancel,
}: {
  target: 'a' | 'b';
  point: LatLng | null;
  active: boolean;
  onPick: (target: 'a' | 'b') => void;
  onCancel: () => void;
}) {
  const isOrigin = target === 'a';
  const noun = isOrigin ? 'origen' : 'destino';
  const described = useMemo(() => (point ? describePoint(point) : null), [point]);
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-md border bg-card p-2 transition-colors',
        active && 'border-foreground/60 bg-accent/60',
      )}
      data-planner-point={target}
    >
      <span
        className={cn(
          // Redondo, como el pin A/B del mapa y de la leyenda.
          'inline-flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-bold text-white shadow-sm',
          isOrigin ? 'bg-origin' : 'bg-destination',
        )}
        aria-hidden
      >
        {isOrigin ? 'A' : 'B'}
      </span>
      <div className="min-w-0 flex-1">
        <SectionLabel className="mb-0">{isOrigin ? 'Origen' : 'Destino'}</SectionLabel>
        {active ? (
          <div className="flex items-center gap-1 text-[13px] font-medium">
            <LocateFixed className="size-3.5 shrink-0" aria-hidden />
            Toca el mapa…
          </div>
        ) : described ? (
          <>
            <div
              // Sin paradero cerca el título son las coordenadas: en mono, como cuando van de detalle.
              className={cn('truncate text-[13px] font-medium', !described.detail && 'font-mono tabular-nums')}
              title={described.label}
            >
              {described.label}
            </div>
            {described.detail && (
              <div className="truncate font-mono text-[11px] text-muted-foreground">{described.detail}</div>
            )}
          </>
        ) : (
          <div className="text-[13px] text-muted-foreground">Sin elegir</div>
        )}
      </div>
      {active ? (
        <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={onCancel}>
          Cancelar
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant={point ? 'ghost' : 'outline'}
          className="shrink-0"
          onClick={() => onPick(target)}
        >
          <MapPin className="size-3.5" />
          Elegir {noun}
        </Button>
      )}
    </div>
  );
}

function MatchesHeader({
  count,
  searchAll,
  linesOnMap,
  onSearchAllChange,
}: {
  count: number;
  searchAll: boolean;
  linesOnMap: number;
  onSearchAllChange: (value: boolean) => void;
}) {
  const pool = searchAll ? 'todas las líneas' : `las ${linesOnMap} ${linesOnMap === 1 ? 'línea' : 'líneas'} del mapa`;
  const toggle = (
    <button
      type="button"
      onClick={() => onSearchAllChange(!searchAll)}
      className="inline-flex min-h-10 shrink-0 items-center rounded-sm font-medium text-foreground underline underline-offset-2 hover:opacity-80 focus-ring md:min-h-0"
    >
      {searchAll ? 'Solo las del mapa' : 'Buscar en todas'}
    </button>
  );
  if (count === 0) {
    return (
      <Notice className="mb-2">
        <span>
          {searchAll
            ? 'Ningún recorrido pasa a 400 m o menos de A y B.'
            : linesOnMap === 0
              ? 'No tienes líneas en el mapa'
              : `Sin coincidencias entre ${pool}`}
        </span>{' '}
        {!searchAll && <>· {toggle}</>}
      </Notice>
    );
  }
  return (
    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
      <span>
        {count} {count === 1 ? 'recorrido pasa' : 'recorridos pasan'} cerca de A y B · entre {pool}
      </span>
      {toggle}
    </div>
  );
}

function MidpointSection({
  midpoint,
  loading,
  error,
  onCompute,
  onClear,
}: {
  midpoint: RoutingResult | null;
  loading: boolean;
  error: string | null;
  onCompute: () => void;
  onClear: () => void;
}) {
  return (
    <section aria-label="Punto medio caminando" className="space-y-2 border-t pt-3">
      <SectionLabel
        className="mb-0"
        icon={<Footprints />}
        aside={
          midpoint && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-10 items-center rounded-sm px-1 text-[11px] text-muted-foreground hover:text-foreground focus-ring md:min-h-0"
            >
              Quitar
            </button>
          )
        }
      >
        Punto medio caminando
      </SectionLabel>

      {!midpoint && !loading && (
        <Button type="button" size="sm" variant="outline" className="w-full justify-center" onClick={onCompute}>
          <Footprints className="size-3.5" />
          Calcular trazado por calles
        </Button>
      )}

      {loading && (
        <div role="status">
          <Notice>Consultando OSRM (ruteo peatonal)…</Notice>
        </div>
      )}

      {error && !loading && <Notice tone="danger">{error}</Notice>}

      {midpoint && !loading && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <StatTile compact label="Distancia" value={formatDistanceMeters(midpoint.distanceMeters)} />
            <StatTile compact label="Tiempo a pie" value={formatDurationSeconds(midpoint.durationSeconds)} />
            <StatTile compact label="A → M" value={formatDistanceMeters(midpoint.distanceFromAMeters)} />
            <StatTile compact label="M → B" value={formatDistanceMeters(midpoint.distanceToBMeters)} />
          </div>
          <div className="text-[11px] text-muted-foreground">
            Punto medio:{' '}
            <span className="font-mono tabular-nums">
              {midpoint.midpoint[0].toFixed(5)}, {midpoint.midpoint[1].toFixed(5)}
            </span>
          </div>
          <div className="text-[11px] leading-snug text-muted-foreground">
            Trazado a pie según OSRM público (OSM). El punto medio es exacto sobre la mitad del
            recorrido peatonal, no la línea recta entre A y B.
          </div>
        </>
      )}
    </section>
  );
}
