import { useSyncExternalStore } from 'react';
import { MapPin, Radio, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
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
 */
export function WelcomeCard({ routesCount, stopsCount, onSearch, onShowStops, onDismiss }: WelcomeCardProps) {
  const dismiss = () => {
    // La tarjeta se desmonta con el botón pulsado: el foco pasa al mapa.
    document.querySelector<HTMLElement>('.leaflet-container')?.focus();
    onDismiss();
  };

  return (
    <section
      aria-label="Cómo empezar"
      className="w-[min(20rem,calc(100vw-5rem))] rounded-lg border bg-background/90 p-3 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <MapPin className="size-3.5" />
            Concepción · Biobío
          </h2>
          <p className="mt-1 text-[13px] leading-snug">
            Micros, Biotrén y paraderos del Gran Concepción, con llegadas en vivo.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={dismiss}
          aria-label="Ocultar guía de inicio"
          className="-mr-1.5 -mt-1.5 size-7 shrink-0 text-muted-foreground"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <div className="mt-2.5 grid gap-1.5">
        <Button type="button" variant="outline" size="sm" className="justify-start gap-2" onClick={onSearch}>
          <Search className="size-3.5" />
          Buscar recorrido o paradero
          <span className="ml-auto hidden items-center gap-0.5 md:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </Button>
        <Button type="button" variant="outline" size="sm" className="justify-start gap-2" onClick={onShowStops}>
          <Radio className="size-3.5 text-emerald-600" />
          Ver paraderos y llegadas en vivo
        </Button>
      </div>

      {/* En móvil solo lo primero: el mapa es lo que importa. */}
      <ul className="mt-2.5 space-y-1 text-[12px] leading-snug text-muted-foreground">
        <li>Toca una línea, un paradero o una micro para ver su ficha.</li>
        <li className="hidden sm:list-item">
          Arriba eliges las micros: <span className="text-foreground">Horario</span> las estima;{' '}
          <span className="text-foreground">GPS en vivo</span> muestra solo las que transmiten.
        </li>
        <li className="hidden sm:list-item">Atrás deshace el último paso.</li>
      </ul>

      <p className="mt-2.5 hidden font-mono text-[10px] text-muted-foreground sm:block">
        {routesCount.toLocaleString('es-CL')} recorridos · {stopsCount.toLocaleString('es-CL')} paraderos
      </p>
    </section>
  );
}
