import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  /** Ícono lucide antes del texto. */
  icon?: ReactNode;
  /** Dato a la derecha (conteo, hora, estado). */
  aside?: ReactNode;
  /** El dato de la derecha es una hora o cifra: va en JetBrains Mono. */
  asideMono?: boolean;
  className?: string;
}

/** Rótulo de sección de las fichas: mayúsculas chicas, con dato opcional a la derecha. */
export function SectionLabel({ children, icon, aside, asideMono = false, className }: Props) {
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
        <span className={cn('shrink-0 normal-case tracking-normal tabular-nums', asideMono && 'font-mono')}>
          {aside}
        </span>
      )}
    </div>
  );
}
