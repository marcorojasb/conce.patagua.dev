import { Badge } from '@/components/ui/badge';
import { cn, readableTextOn } from '@/lib/utils';

interface Props {
  /** Lo que se lee: routePillCode ("30Q/E") para la línea, directionCode ("30E") para un sentido. */
  code: string;
  color: string;
  className?: string;
  /** 'sm' para filas densas (estado del GPS, leyenda); 'md' por defecto. */
  size?: 'sm' | 'md';
}

/** Insignia con el código de la línea en su color (texto negro o blanco según el fondo). */
export function RouteBadge({ code, color, className, size = 'md' }: Props) {
  return (
    <Badge
      className={cn(
        'shrink-0 border-transparent font-mono tabular-nums',
        size === 'sm' && 'px-1.5 py-0 text-[10px] leading-4',
        className,
      )}
      style={{ background: color, color: readableTextOn(color) }}
    >
      {code}
    </Badge>
  );
}
