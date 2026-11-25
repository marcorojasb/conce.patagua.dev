// Avisos sobre el mapa, en el orden en que importan: el modo de elegir un
// punto del planificador (todo toque en el mapa es ese punto, con salida
// visible), el filtro "Operando ahora" (que esconde líneas), el aviso de zoom
// de la capa de paraderos (que bajo zoom 14 no dibuja nada), los puntos A/B
// del planificador que quedaron en el mapa con el planificador cerrado y el
// aviso del momento ("Deshacer", enlaces que no existen). Ninguno se pierde
// en silencio y todo lo que queda puesto se puede quitar desde aquí.

import { useSyncExternalStore } from 'react';
import { Clock, Crosshair, MapPin, Route as RouteIcon, X, ZoomIn } from 'lucide-react';
import { getMapZoom, subscribeMapViewport } from '@/lib/map-viewport';
import { cn } from '@/lib/utils';
import type { MapHintsProps } from '@/types/ui-contracts';

/** Desde este zoom la capa de paraderos se dibuja. */
const PARADEROS_MIN_ZOOM = 14;

// Selector: solo cambia al cruzar el umbral, así un arrastre o un zoom que no
// lo cruza no vuelve a dibujar los avisos.
function belowParaderosZoom(): boolean {
  const zoom = getMapZoom();
  return zoom != null && zoom < PARADEROS_MIN_ZOOM;
}

// Las acciones miden 40 px de alto en el teléfono (32 en escritorio) y se
// comen el relleno vertical del aviso con -my-1.5: el toque es grande y el
// aviso sigue en una línea delgada.
const CHIP = 'surface-control flex max-w-full items-center gap-2 px-3 py-1.5 text-[12px]';
const CHIP_ACTION =
  '-my-1.5 inline-flex min-h-10 shrink-0 items-center rounded-md px-1.5 font-medium text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground focus-ring md:min-h-8';

function ParaderosZoomChip({ onZoomIn }: { onZoomIn: () => void }) {
  const below = useSyncExternalStore(subscribeMapViewport, belowParaderosZoom, belowParaderosZoom);
  if (!below) return null;
  return (
    <div className={CHIP} data-map-hint="paraderos-zoom">
      <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0">Acércate para ver paraderos</span>
      <button type="button" onClick={onZoomIn} className={CHIP_ACTION}>
        <ZoomIn className="mr-1 size-3.5" />
        Acercar
      </button>
    </div>
  );
}

export function MapHints({
  operatingFilter,
  paraderosZoom,
  pick,
  plannerPoints = null,
  notice,
  onDismissNotice,
}: MapHintsProps) {
  if (!operatingFilter && !paraderosZoom && !pick && !plannerPoints && !notice) return null;
  return (
    <div className="flex max-w-full flex-col items-start gap-1.5">
      {pick && (
        <div
          role="status"
          data-map-hint="pick"
          className={cn(CHIP, 'border-foreground bg-foreground text-background')}
        >
          <Crosshair className="size-4 shrink-0" />
          <span className="min-w-0 font-medium">
            Toca el mapa para elegir {pick.target === 'a' ? 'el origen' : 'el destino'}
          </span>
          <button
            type="button"
            onClick={pick.onCancel}
            className="-my-1.5 inline-flex min-h-10 shrink-0 items-center rounded-md border border-background/30 px-2.5 font-medium transition-colors hover:bg-background/15 focus-ring md:min-h-8"
          >
            Cancelar
          </button>
        </div>
      )}
      {operatingFilter && (
        <div className={CHIP} data-map-hint="operating">
          <Clock className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0">
            Operando ahora ·{' '}
            {operatingFilter.hiddenCount === 0
              ? 'ninguna línea oculta'
              : operatingFilter.hiddenCount === 1
                ? '1 línea oculta'
                : `${operatingFilter.hiddenCount} líneas ocultas`}
          </span>
          <button type="button" onClick={operatingFilter.onClear} className={CHIP_ACTION}>
            Quitar
          </button>
        </div>
      )}
      {paraderosZoom && <ParaderosZoomChip onZoomIn={paraderosZoom.onZoomIn} />}
      {plannerPoints && (
        <div className={CHIP} data-map-hint="planner-points">
          <RouteIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0">Puntos A/B del planificador</span>
          <button type="button" onClick={plannerPoints.onOpen} className={CHIP_ACTION}>
            Ver
          </button>
          <button type="button" onClick={plannerPoints.onClear} className={CHIP_ACTION}>
            Quitar
          </button>
        </div>
      )}
      {notice && (
        <div key={notice.id} role="status" data-map-notice className={cn(CHIP, 'animate-fade-in pr-0.5')}>
          <span className="min-w-0">{notice.text}</span>
          {notice.action && (
            <button
              type="button"
              onClick={() => {
                notice.action?.run();
                onDismissNotice();
              }}
              className={CHIP_ACTION}
            >
              {notice.action.label}
            </button>
          )}
          <button
            type="button"
            onClick={onDismissNotice}
            aria-label="Cerrar aviso"
            className="-my-1.5 grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-ring md:size-8"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
