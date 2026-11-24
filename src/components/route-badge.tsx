import { Badge } from '@/components/ui/badge';
import { cn, readableTextOn } from '@/lib/utils';

interface Props {
  code: string;
  color: string;
  className?: string;
}

/** Insignia con el código de la línea en su color (texto legible sobre ese fondo). */
export function RouteBadge({ code, color, className }: Props) {
  return (
    <Badge
      className={cn('shrink-0 border-transparent font-mono', className)}
      style={{ background: color, color: readableTextOn(color) }}
    >
      {code}
    </Badge>
  );
}
