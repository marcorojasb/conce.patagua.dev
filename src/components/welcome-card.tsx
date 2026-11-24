import { useState } from 'react';
import { MapPin, Radio, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';

interface Props {
  routesCount: number;
  stopsCount: number;
  onSearch: () => void;
  onShowStops: () => void;
}

const STORAGE_KEY = 'conce.welcome';

function readHidden(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'hidden';
  } catch {
    return false;
  }
}

/**
 * Tarjeta de inicio: dice qué se puede hacer en vez de describir el proyecto.
 * Las llegadas en vivo solo aparecen en paraderos GTFS, que no se ven en la
 * vista por defecto (Biotrén + interurbanos), así que hay un atajo directo.
 */
export function WelcomeCard({ routesCount, stopsCount, onSearch, onShowStops }: Props) {
  const [hidden, setHidden] = useState(readHidden);
  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, 'hidden');
    } catch {
      // Sin almacenamiento (modo privado): se oculta solo en esta visita.
    }
  };

  return (
    <section
      aria-label="Cómo empezar"
      className="pointer-events-auto w-[min(300px,calc(100vw-4.5rem))] rounded-lg border bg-background/90 p-3 shadow-md backdrop-blur animate-fade-in supports-[backdrop-filter]:bg-background/80"
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

      <p className="mt-2.5 font-mono text-[10px] text-muted-foreground">
        {routesCount.toLocaleString('es-CL')} recorridos · {stopsCount.toLocaleString('es-CL')} paraderos
      </p>
    </section>
  );
}
