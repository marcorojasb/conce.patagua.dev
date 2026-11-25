// Leyenda del mapa: qué significa cada símbolo y las líneas que hay en el mapa
// (trazo, código y nombre, como la leyenda de siempre). Todo se dibuja con
// map-swatches.tsx, el mismo código (o el mismo HTML de los pines) que pinta
// el mapa: la muestra es el símbolo. Las micros van primero (la del modo
// activo de "Micros en el mapa", de cerca y de lejos): que una estimada no es
// GPS tiene que verse sin desplazar. Las líneas van tras su propio botón,
// plegado (en escritorio ya están en la barra), y las claves de cada capa
// temática, mientras esa capa está encendida.
//
// Abierta de entrada solo en escritorio ancho (≥ 1024 px) y compacta (~180 px
// de alto): abierta con todo tapaba el doble de mapa que la del original y,
// en modo GPS, justo las micros de la vista inicial.

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { COVERAGE_BINS, UNDERSERVED_MIN_M } from '@/components/coverage-layer';
import { CYCLEWAY_KIND_STYLE } from '@/components/cycleways-layer';
import { GREEN_KIND_STYLE } from '@/components/greenspace-layer';
import { corridorPinHtml } from '@/components/interurban-corridors-layer';
import { POI_LABEL, poiPinHtml, terminalPinHtml } from '@/components/map/map-markers';
import {
  CircleMarkerSwatch,
  LineSwatch,
  PinSwatch,
  StopSwatch,
  VehicleDotSwatch,
  VehicleSwatch,
  type VehicleSymbol,
} from '@/components/map/map-swatches';
import { SCHOOL_KIND_LABEL, schoolMarkerStyle } from '@/components/schools-layer';
import { INTERURBAN_CORRIDORS } from '@/data/interurban-corridors';
import { ROUTES_BY_ID, useRoutesVersion } from '@/data/routes';
import type { SchoolKind } from '@/data/schools.generated';
import { categorize } from '@/hooks/use-air-quality';
import { useCurrentTheme } from '@/hooks/use-theme';
import { MAP_THEME } from '@/lib/map-theme';
import { displayRouteColor } from '@/lib/route-colors';
import { routePillCode, routeShortName } from '@/lib/route-labels';
import { cn } from '@/lib/utils';
import { VEHICLE_STYLE, type MapLegendProps } from '@/types/ui-contracts';
import type { PoiCategory, Route, Theme } from '@/types/transport';

const CYCLEWAY_KINDS = Object.values(CYCLEWAY_KIND_STYLE);
const BIOTREN_IDS = new Set(['bt-l1', 'bt-l2']);
/** Filas de líneas antes de "+ N más" (como la leyenda original): la leyenda no tapa medio mapa. */
const LINES_MAX = 6;
const POI_CATEGORIES: PoiCategory[] = ['hospital', 'university', 'college', 'mall'];
const SCHOOL_KINDS: SchoolKind[] = ['kindergarten', 'school', 'college', 'university'];
/** Un valor de PM2,5 por tramo de la escala (categorize): buena, regular, alerta, preemergencia, emergencia. */
const AIR_SAMPLES = [25, 60, 90, 130, 200];
/** Muestra de micro de 24 px: la estimada queda de Ø18 (en el mapa, Ø20 a zoom 13). */
const VEHICLE_SWATCH_PX = 24;

/** Pin A del planificador, como en el mapa (mismo token --origin). */
function PlannerPinSwatch() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="size-5 shrink-0 rounded-md bg-map-land">
      <circle cx="10" cy="10" r="7" fill="hsl(var(--origin))" stroke="hsl(var(--background))" strokeWidth="2" />
      <text
        x="10"
        y="13.5"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#ffffff"
        className="font-mono"
      >
        A
      </text>
    </svg>
  );
}

function Row({
  swatch,
  children,
  narrow = false,
  ...data
}: { swatch: ReactNode; children: ReactNode; narrow?: boolean } & Record<`data-${string}`, string>) {
  return (
    <li className="flex min-h-6 items-center gap-2 py-0.5" {...data}>
      <span className={cn('flex shrink-0 items-center justify-center gap-1', narrow ? 'w-6' : 'w-10')}>{swatch}</span>
      <span className="min-w-0 text-balance leading-tight">{children}</span>
    </li>
  );
}

function GroupTitle({ children }: { children: ReactNode }) {
  return <li className="pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{children}</li>;
}

/** Abierta de entrada solo con lugar de sobra: entre 768 y 1024 px tapaba un cuarto del mapa. */
function isWideDesktop(): boolean {
  return typeof window === 'undefined' || window.matchMedia('(min-width: 1024px)').matches;
}

// Las líneas se abren a pedido (abiertas, en el teléfono la leyenda tapaba
// medio mapa); lo elegido se recuerda mientras dure la visita.
let linesOpenChoice = false;

/** Micro de cerca (insignia, como a zoom 13) y de lejos (punto, zoom ≤ 12), las dos con el código del mapa. */
function VehicleRow({ kind, children }: { kind: VehicleSymbol; children: ReactNode }) {
  return (
    <Row
      data-legend-symbol={kind === 'gpsStale' ? 'gps-stale' : kind}
      swatch={
        <>
          <VehicleSwatch kind={kind} size={VEHICLE_SWATCH_PX} />
          <VehicleDotSwatch kind={kind} />
        </>
      }
    >
      {children}
    </Row>
  );
}

/**
 * "Líneas en el mapa · N": un botón que despliega las filas (sin acción:
 * elegir una línea se hace en la barra o en el mapa).
 */
function LineRows({ routes }: { routes: readonly Route[] }) {
  const theme = useCurrentTheme();
  const [open, setOpen] = useState(linesOpenChoice);
  const listId = useId();
  const toggle = () => {
    linesOpenChoice = !open;
    setOpen(!open);
  };
  return (
    <>
      <li className="pt-0.5">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          className="-mx-1 flex min-h-10 w-[calc(100%+0.5rem)] items-center justify-between gap-2 rounded-md px-1 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-ring md:min-h-7"
        >
          <span>
            Líneas en el mapa · <span className="tabular-nums">{routes.length}</span>
          </span>
          <ChevronDown className={cn('size-3.5 shrink-0 transition-transform', !open && '-rotate-90')} />
        </button>
      </li>
      {open && (
        <li id={listId}>
          <ul>
            <LineList routes={routes} theme={theme} />
          </ul>
        </li>
      )}
    </>
  );
}

function LineList({ routes, theme }: { routes: readonly Route[]; theme: Theme }) {
  return (
    <>
      {routes.slice(0, LINES_MAX).map((route) => (
        <li key={route.id} data-legend-line={route.id} className="flex min-h-5 items-center gap-2">
          <span className="flex w-6 shrink-0 items-center justify-center">
            <LineSwatch color={displayRouteColor(route.color, theme)} />
          </span>
          <span className="w-12 shrink-0 font-mono text-[11px] text-muted-foreground">{routePillCode(route)}</span>
          <span className="min-w-0 truncate">{routeShortName(route)}</span>
        </li>
      ))}
      {routes.length > LINES_MAX && (
        <li className="min-h-5 pt-0.5 text-muted-foreground">+ {routes.length - LINES_MAX} más</li>
      )}
    </>
  );
}

export function MapLegend({ micros, layers, collapsed, plannerPoints = false, lines }: MapLegendProps) {
  const theme = useCurrentTheme();
  // Las micros GTFS llegan en un chunk diferido: al llegar se resuelven sus ids.
  useRoutesVersion();
  // Abierta o plegada a gusto; con una superficie encima se pliega sola y se
  // puede abrir un momento (al cerrar la superficie vuelve a lo elegido).
  const [expanded, setExpanded] = useState(isWideDesktop);
  const [peek, setPeek] = useState(false);
  const [wasCollapsed, setWasCollapsed] = useState(collapsed);
  if (collapsed !== wasCollapsed) {
    setWasCollapsed(collapsed);
    setPeek(false);
  }
  const open = collapsed ? peek : expanded;
  const toggle = () => (collapsed ? setPeek((v) => !v) : setExpanded((v) => !v));

  const routes = (lines ?? []).map((id) => ROUTES_BY_ID.get(id)).filter((r): r is Route => r != null);
  const biotren = routes.find((r) => BIOTREN_IDS.has(r.id));
  // El aro de la parada es el de la línea que se pinta encima: la muestra usa
  // la última del orden de pintado (o la gris de ejemplo sin líneas).
  const top = routes.at(-1);
  const coverageBins =
    layers.coverageThreshold === 'underserved' ? COVERAGE_BINS.filter((b) => b.min >= UNDERSERVED_MIN_M) : COVERAGE_BINS;

  return (
    <section
      aria-label="Leyenda del mapa"
      data-legend-mode={micros}
      // Sin overflow-hidden: recortaba el anillo de foco del botón. En
      // escritorio, 15 rem (la del original medía ~10): más angosta que la
      // columna de "Micros en el mapa".
      className={cn('surface-control text-[11px]', open && 'w-[min(20rem,calc(100vw-4.5rem))] md:w-60')}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={cn(
          'flex min-h-10 w-full items-center justify-between gap-3 px-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-ring md:min-h-8',
          open ? 'rounded-t-lg' : 'rounded-lg',
        )}
      >
        Leyenda
        <ChevronDown className={cn('size-3.5 transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <ul className="thin-scroll max-h-[40vh] overflow-y-auto rounded-b-lg border-t px-3 py-1.5">
          {micros === 'schedule' && (
            <VehicleRow kind="estimate">
              {VEHICLE_STYLE.estimate.label} <span className="whitespace-nowrap text-muted-foreground">(no es GPS)</span>
            </VehicleRow>
          )}
          {micros === 'gps' && (
            <>
              <VehicleRow kind="gps">{VEHICLE_STYLE.gps.label}</VehicleRow>
              <VehicleRow kind="gpsStale">{VEHICLE_STYLE.gpsStale.label}</VehicleRow>
            </>
          )}
          {routes.length === 0 && <Row swatch={<LineSwatch />}>Recorrido (color de la línea)</Row>}
          <Row swatch={<StopSwatch color={top && displayRouteColor(top.color, theme)} />} data-legend-symbol="stop">
            Paradero <span className="text-muted-foreground">(aro de su línea)</span>
          </Row>
          {biotren && (
            <Row swatch={<StopSwatch station color={displayRouteColor(biotren.color, theme)} />}>Estación del Biotrén</Row>
          )}
          {layers.paraderos && (
            <Row swatch={<StopSwatch layer />} data-legend-symbol="paradero-layer">
              Paradero de la capa Paraderos
            </Row>
          )}
          {layers.terminals && (
            <Row swatch={<PinSwatch html={terminalPinHtml(false)} />} data-legend-symbol="terminal">
              Terminal de buses
            </Row>
          )}
          {layers.corridors && INTERURBAN_CORRIDORS.length > 0 && (
            <Row
              swatch={<PinSwatch html={corridorPinHtml(INTERURBAN_CORRIDORS[0], false)} scale={0.7} className="[&>div::after]:hidden" />}
              data-legend-symbol="corridor"
            >
              Corredor sin recorrido oficial (sin GTFS)
            </Row>
          )}
          {plannerPoints && (
            <Row swatch={<PlannerPinSwatch />} data-legend-symbol="planner">
              Origen (A) y destino (B) del planificador
            </Row>
          )}
          {routes.length > 0 && <LineRows routes={routes} />}
          {layers.coverage && (
            <>
              <GroupTitle>Distancia al paradero</GroupTitle>
              {coverageBins.map((bin) => (
                <Row
                  key={bin.label}
                  swatch={<span aria-hidden className="h-3 w-5 shrink-0 rounded-sm opacity-80" style={{ background: bin.color }} />}
                >
                  {bin.label}
                </Row>
              ))}
            </>
          )}
          {layers.pois && (
            <>
              <GroupTitle>Centros de atracción</GroupTitle>
              <li>
                <ul className="grid grid-cols-2 gap-x-2">
                  {POI_CATEGORIES.map((category) => (
                    <Row key={category} swatch={<PinSwatch html={poiPinHtml(category, false)} />} narrow>
                      {POI_LABEL[category]}
                    </Row>
                  ))}
                </ul>
              </li>
            </>
          )}
          {layers.schools && (
            <>
              <GroupTitle>Educación</GroupTitle>
              <li>
                <ul className="grid grid-cols-2 gap-x-2">
                  {SCHOOL_KINDS.map((kind) => (
                    <Row key={kind} swatch={<CircleMarkerSwatch style={schoolMarkerStyle(kind)} />} narrow>
                      {SCHOOL_KIND_LABEL[kind]}
                    </Row>
                  ))}
                </ul>
              </li>
            </>
          )}
          {layers.greenspace && (
            <Row
              swatch={
                <span
                  aria-hidden
                  className="h-3 w-5 shrink-0 rounded-sm border"
                  style={{ background: GREEN_KIND_STYLE.park.fill, borderColor: GREEN_KIND_STYLE.park.stroke }}
                />
              }
            >
              Área verde
            </Row>
          )}
          {layers.airQuality && (
            <Row
              swatch={
                <span aria-hidden className="flex gap-px">
                  {AIR_SAMPLES.map((pm) => (
                    <span key={pm} className="size-1.5 rounded-full" style={{ background: categorize(pm).color }} />
                  ))}
                </span>
              }
            >
              Calidad del aire (PM2,5): de buena a emergencia
            </Row>
          )}
          {layers.cycleways && (
            <>
              <GroupTitle>Ciclovías</GroupTitle>
              {CYCLEWAY_KINDS.map((kind) => (
                <Row
                  key={kind.label}
                  swatch={
                    <LineSwatch color={MAP_THEME[theme].cycleway} dash={kind.dash} weight={kind.weight} casing={false} />
                  }
                >
                  {kind.label}
                </Row>
              ))}
            </>
          )}
        </ul>
      )}
    </section>
  );
}
