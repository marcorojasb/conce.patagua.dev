import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Fondos y textos con AA a 11 px en ambos temas: --stale sobre su propio tinte
// al 10 % queda en 4,4:1 en claro, por eso ahí el tinte baja al 5 %; y
// muted-foreground sobre bg-muted queda en 4,4:1, por eso estimate/muted usan
// foreground/70.
const TONES = {
  live: 'bg-live/10 text-live',
  stale: 'bg-stale/5 text-stale dark:bg-stale/10',
  estimate: 'bg-muted text-foreground/70',
  muted: 'bg-muted text-foreground/70',
  dashed: 'border border-dashed text-muted-foreground',
} as const;

export type StatusChipTone = keyof typeof TONES;

interface Props {
  tone: StatusChipTone;
  icon?: ReactNode;
  children: ReactNode;
  title?: string;
  className?: string;
}

/** Etiqueta corta de estado: en vivo, dato viejo, estimado, sin dato. */
export function StatusChip({ tone, icon, children, title, className }: Props) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight [&_svg]:size-3 [&_svg]:shrink-0',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
