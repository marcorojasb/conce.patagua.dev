import { cn } from '@/lib/utils';

interface Props {
  on: boolean;
  /** Se lee (aria-label) y se ve al pasar el puntero (title). */
  label: string;
  className?: string;
}

/** Punto de estado (por ejemplo "Operando ahora" / "Fuera de horario ahora"). */
export function StatusDot({ on, label, className }: Props) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn('inline-block size-2 shrink-0 rounded-full', on ? 'bg-live' : 'bg-muted-foreground/40', className)}
    />
  );
}
