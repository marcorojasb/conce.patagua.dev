// Componente <MapLink> — disponible para artículos del wiki que quieran
// enlazar a una vista enfocada del visor. Renderiza un anchor con la URL
// `/` + `?focus=<kind>:<id>` que el visor reconoce en su primer render
// (ver `src/hooks/use-url-state.ts` y `src/App.tsx`).
//
// Uso típico desde un artículo:
//
//   import { MapLink } from '@/wiki/map-link';
//
//   <MapLink corridor="ruta-201">Ver corredor en el mapa →</MapLink>
//   <MapLink route="10A">Trazado 10A en el visor →</MapLink>
//   <MapLink terminal="osm-way-135488014">Estación Intermodal →</MapLink>
//
// El componente NO valida que la entidad exista — eso es decisión del
// autor del artículo. El visor sí hace fallback graceful: si el id no
// se encuentra, abre la vista por defecto sin centrar nada.

import { MapPin } from 'lucide-react';
import { mapFocusUrl } from '@/wiki/map-links';

type Props = {
  children?: React.ReactNode;
  className?: string;
} & (
  | { route: string }
  | { corridor: string }
  | { terminal: string }
  | { stop: string }
  | { poi: string }
);

function resolveTarget(props: Props): { kind: 'route' | 'corridor' | 'terminal' | 'stop' | 'poi'; id: string } {
  if ('route' in props) return { kind: 'route', id: props.route };
  if ('corridor' in props) return { kind: 'corridor', id: props.corridor };
  if ('terminal' in props) return { kind: 'terminal', id: props.terminal };
  if ('stop' in props) return { kind: 'stop', id: props.stop };
  return { kind: 'poi', id: props.poi };
}

export function MapLink(props: Props) {
  const { kind, id } = resolveTarget(props);
  const href = mapFocusUrl(kind, id);
  const label =
    props.children ?? 'Ver en el mapa →';
  return (
    <a
      href={href}
      className={
        props.className ??
        'inline-flex items-center gap-1 rounded-sm text-[12px] underline underline-offset-2 hover:text-foreground'
      }
    >
      <MapPin className="h-3 w-3" aria-hidden />
      {label}
    </a>
  );
}
