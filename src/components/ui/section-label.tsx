import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  /** Ícono lucide antes del texto. */
  icon?: ReactNode;
  /** Dato a la derecha (conteo, hora, estado). */
  aside?: ReactNode;
  className?: string;
}

/** Rótulo de sección de las fichas: mayúsculas chicas, con dato opcional a la derecha. */
export function SectionLabel({ children, icon, aside, className }: Props) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground',
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5 [&_svg]:size-3.5 [&_svg]:shrink-0">
        {icon}
        <span className="truncate">{children}</span>
      </span>
      {aside != null && (
        <span className="shrink-0 font-mono normal-case tracking-normal">{aside}</span>
      )}
    </div>
  );
}
