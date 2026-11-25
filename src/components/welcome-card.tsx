import { useSyncExternalStore } from 'react';
import { MapPin, Radio, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { StatTile } from '@/components/ui/stat-tile';
import type { WelcomeCardProps } from '@/types/ui-contracts';

// Si la tarjeta de inicio está a la vista. Se guarda en localStorage
// ('conce.welcome' = 'hidden') para no volver a mostrarla tras el primer uso;
// el botón "?" de la columna del mapa la vuelve a mostrar. Sin almacenamiento
// (modo privado) vale solo para la visita. `requested` marca que la pidió el
// "?": entonces se muestra aunque haya una ficha abierta (si no, el botón
// parecería no hacer nada).
const STORAGE_KEY = 'conce.welcome';

function readVisible(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'hidden';
  } catch {
    return true;
  }
}

let state = { visible: typeof window === 'undefined' ? false : readVisible(), requested: false };
const listeners = new Set<() => void>();

function setVisible(next: boolean, requested = false): void {
  if (next === state.visible && requested === state.requested) return;
  state = { visible: next, requested };
  try {
    if (next) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, 'hidden');
  } catch {
    // Sin almacenamiento: queda solo en memoria.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getState = () => state;
const hide = () => setVisible(false);
const show = () => setVisible(true, true);

export function useWelcomeCard(): { visible: boolean; requested: boolean; hide: () => void; show: () => void } {
  const { visible, requested } = useSyncExternalStore(subscribe, getState, getState);
  return { visible, requested, hide, show };
}

/**
 * Tarjeta de inicio: dice qué se puede hacer en vez de describir el proyecto.
 * Las llegadas en vivo solo aparecen en paraderos GTFS, que no se ven en la
 * vista por defecto (Biotrén + interurbanos), así que hay un atajo directo.
 * En el teléfono queda lo justo (cómo abrir una ficha y las dos acciones)
 * para no tapar más de un tercio del mapa; el resto y las cifras (en mono,
 * como en el diseño original) desde `sm`.
 */
export function WelcomeCard({ routesCount, stopsCount, onSearch, onShowStops, onDismiss }: WelcomeCardProps) {
  const dismiss = () => {
    // La tarjeta se desmonta con el botón pulsado: el foco pasa al mapa.
    document.querySelector<HTMLElement>('.leaflet-container')?.focus();
    onDismiss();
  };

  return (
    <section aria-label="Cómo empezar" className="surface-control w-[min(20rem,calc(100vw-4.5rem))] p-2 sm:p-3 md:w-80">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {/* En el teléfono el rótulo queda para lectores de pantalla y arriba va qué hacer. */}
          <h2 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground max-sm:sr-only">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            Concepción · Biobío
          </h2>
          <p className="text-[13px] leading-snug sm:hidden">Toca una línea, un paradero o una micro para ver su ficha.</p>
          <p className="mt-1 hidden text-[13px] leading-snug sm:block">
            Micros, Biotrén y paraderos del Gran Concepción, con llegadas en vivo.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={dismiss}
          aria-label="Ocultar guía de inicio"
          className="-mr-1.5 -mt-1.5 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-2 grid gap-1.5 sm:mt-2.5">
        <Button type="button" variant="outline" size="sm" className="justify-start gap-2" onClick={onSearch}>
          <Search className="size-3.5" />
          Buscar recorrido o paradero
          <span className="ml-auto hidden items-center gap-0.5 md:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </Button>
        <Button type="button" variant="outline" size="sm" className="justify-start gap-2" onClick={onShowStops}>
          <Radio className="size-3.5 text-live" />
          Ver paraderos y llegadas en vivo
        </Button>
      </div>

      <ul className="mt-2.5 hidden space-y-1 text-[12px] leading-snug text-muted-foreground sm:block">
        <li>Toca una línea, un paradero o una micro para ver su ficha.</li>
        <li>
          Arriba eliges las micros: <span className="text-foreground">Horario</span> las estima;{' '}
          <span className="text-foreground">GPS en vivo</span> muestra solo las que transmiten.
        </li>
        <li>Atrás deshace el último paso.</li>
      </ul>

      <div className="mt-2.5 hidden grid-cols-2 gap-1.5 sm:grid">
        <StatTile compact label="Recorridos" value={routesCount.toLocaleString('es-CL')} />
        <StatTile compact label="Paraderos" value={stopsCount.toLocaleString('es-CL')} />
      </div>
    </section>
  );
}
