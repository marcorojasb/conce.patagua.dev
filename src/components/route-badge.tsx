import { Badge } from '@/components/ui/badge';
import { routeColorVars } from '@/lib/route-colors';
import { cn } from '@/lib/utils';

interface Props {
  /** Lo que se lee: routePillCode ("30Q/E") para la línea, directionCode ("30E") para un sentido. */
  code: string;
  color: string;
  className?: string;
  /** 'sm' para filas densas (estado del GPS, leyenda); 'md' por defecto. */
  size?: 'sm' | 'md';
}

/**
 * Insignia con el código de la línea en su color de pantalla de cada tema
 * (texto negro o blanco según el fondo). El ancho mínimo (3,625 rem en `md`)
 * deja caber "201-AU", el código más largo, así la columna de nombres queda
 * alineada en la barra, en ⌘K y en las fichas.
 */
export function RouteBadge({ code, color, className, size = 'md' }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'shrink-0 justify-center rounded-md border-transparent font-mono font-medium tabular-nums',
        'bg-[var(--route)] text-[color:var(--route-fg)] dark:bg-[var(--route-dark)] dark:text-[color:var(--route-fg-dark)]',
        size === 'md' ? 'min-w-[3.625rem] px-1.5 text-xs' : 'min-w-[2.5rem] px-1 py-0 text-[10px] leading-4',
        className,
      )}
      style={routeColorVars(color)}
    >
      {code}
    </Badge>
  );
}
