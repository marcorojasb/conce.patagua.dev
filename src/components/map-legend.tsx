// Leyenda del mapa: qué significa cada símbolo, no la lista de líneas (esa
// está en la barra lateral). Muestra solo las micros del modo activo de
// "Micros en el mapa", dibujadas con VEHICLE_STYLE igual que el canvas del
// mapa, y las claves de cobertura y ciclovías mientras esas capas están a la
// vista (antes vivían dentro de Capas y desaparecían al cerrarla).

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { COVERAGE_BINS, UNDERSERVED_MIN_M } from '@/components/coverage-layer';
import { CYCLEWAY_KIND_STYLE } from '@/components/cycleways-layer';
import { ESTIMATE_HALO } from '@/components/map/vehicle-draw';
import { cn } from '@/lib/utils';
import { VEHICLE_STYLE, type MapLegendProps } from '@/types/ui-contracts';

/** Color de muestra para "el color de la línea". */
const SAMPLE_COLOR = '#475569';

const CYCLEWAY_KINDS = Object.values(CYCLEWAY_KIND_STYLE);

export type VehicleSymbol = 'estimate' | 'gps' | 'gpsStale';

/**
 * Micro como la dibuja el canvas a zoom medio: estimada = círculo con anillo
 * blanco punteado; con GPS = cuadrado con borde blanco y anillo verde (ámbar
 * y más tenue si el dato es viejo). Va sobre un fondo tipo mapa para que el
 * anillo blanco se vea.
 */
export function VehicleSwatch({ symbol, className }: { symbol: VehicleSymbol; className?: string }) {
  const style = VEHICLE_STYLE[symbol];
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={cn('size-5 shrink-0 rounded bg-slate-300 dark:bg-slate-600', className)}
      data-vehicle-symbol={symbol}
    >
      {style.shape === 'circle' ? (
        <>
          <circle cx="10" cy="10" r="7.5" fill="none" stroke={ESTIMATE_HALO} strokeWidth="1" />
          <circle
            cx="10"
            cy="10"
            r="6"
            fill={SAMPLE_COLOR}
            fillOpacity={style.alpha}
            stroke={style.ring}
            strokeWidth="1.5"
            strokeDasharray={style.dash.join(' ')}
          />
        </>
      ) : (
        <g opacity={style.alpha}>
          <rect x="2" y="2" width="16" height="16" rx="5" fill="none" stroke={style.ring} strokeWidth="2" />
          <rect x="4" y="4" width="12" height="12" rx="3" fill={SAMPLE_COLOR} stroke="#ffffff" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}

/** Pin A o B del planificador, como en el mapa. */
function PinSwatch() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="size-5 shrink-0 rounded bg-slate-300 dark:bg-slate-600">
      <circle cx="10" cy="10" r="7" fill="#16A34A" stroke="#ffffff" strokeWidth="1.5" />
      <text x="10" y="13.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff">
        A
      </text>
    </svg>
  );
}

function LineSwatch({ color, dash, casing = false }: { color: string; dash?: string; casing?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="size-5 shrink-0 rounded bg-slate-300 dark:bg-slate-600">
      {casing && <path d="M2 10h16" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.6" />}
      <path d="M2 10h16" stroke={color} strokeWidth={casing ? 4 : 3} strokeLinecap="round" strokeDasharray={dash} />
    </svg>
  );
}

function StopSwatch() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="size-5 shrink-0 rounded bg-slate-300 dark:bg-slate-600">
      <circle cx="10" cy="10" r="4" fill="#ffffff" stroke={SAMPLE_COLOR} strokeWidth="2" />
    </svg>
  );
}

function Row({ swatch, children, ...data }: { swatch: ReactNode; children: ReactNode } & Record<`data-${string}`, string>) {
  return (
    <li className="flex items-center gap-2 py-0.5" {...data}>
      {swatch}
      <span className="min-w-0 leading-tight">{children}</span>
    </li>
  );
}

function GroupTitle({ children }: { children: ReactNode }) {
  return (
    <li className="pb-0.5 pt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{children}</li>
  );
}

function isDesktop(): boolean {
  return typeof window === 'undefined' || window.matchMedia('(min-width: 768px)').matches;
}

export function MapLegend({ micros, layers, collapsed, plannerPoints = false }: MapLegendProps) {
  // Abierta o plegada a gusto; con una superficie encima se pliega sola y se
  // puede abrir un momento (al cerrar la superficie vuelve a lo elegido).
  const [expanded, setExpanded] = useState(isDesktop);
  const [peek, setPeek] = useState(false);
  const [wasCollapsed, setWasCollapsed] = useState(collapsed);
  if (collapsed !== wasCollapsed) {
    setWasCollapsed(collapsed);
    setPeek(false);
  }
  const open = collapsed ? peek : expanded;
  const toggle = () => (collapsed ? setPeek((v) => !v) : setExpanded((v) => !v));

  const coverageBins =
    layers.coverageThreshold === 'underserved' ? COVERAGE_BINS.filter((b) => b.min >= UNDERSERVED_MIN_M) : COVERAGE_BINS;

  return (
    <section
      aria-label="Leyenda del mapa"
      data-legend-mode={micros}
      className={cn(
        'overflow-hidden rounded-lg border bg-background/90 text-[11px] shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/80',
        open && 'w-[min(15rem,calc(100vw-5rem))]',
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-ring"
      >
        Leyenda
        <ChevronDown className={cn('size-3.5 transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <ul className="thin-scroll max-h-[40vh] overflow-y-auto border-t px-3 py-1.5">
          <Row swatch={<LineSwatch color={SAMPLE_COLOR} casing />}>Recorrido (color de la línea)</Row>
          <Row swatch={<StopSwatch />}>Paradero</Row>
          {micros === 'schedule' && (
            <Row swatch={<VehicleSwatch symbol="estimate" />} data-legend-symbol="estimate">
              {VEHICLE_STYLE.estimate.label} <span className="text-muted-foreground">(no es GPS)</span>
            </Row>
          )}
          {micros === 'gps' && (
            <>
              <Row swatch={<VehicleSwatch symbol="gps" />} data-legend-symbol="gps">
                {VEHICLE_STYLE.gps.label}
              </Row>
              <Row swatch={<VehicleSwatch symbol="gpsStale" />} data-legend-symbol="gps-stale">
                {VEHICLE_STYLE.gpsStale.label}
              </Row>
            </>
          )}
          {plannerPoints && (
            <Row swatch={<PinSwatch />} data-legend-symbol="planner">
              Origen (A) y destino (B) del planificador
            </Row>
          )}
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
          {layers.cycleways && (
            <>
              <GroupTitle>Ciclovías</GroupTitle>
              {CYCLEWAY_KINDS.map((kind) => (
                <Row key={kind.label} swatch={<LineSwatch color={kind.color} dash={kind.dash} />}>
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
