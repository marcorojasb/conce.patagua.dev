import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// El texto va siempre en foreground (AA en ambos temas); el tono lo dan el
// borde, el fondo y el ícono con los tokens semánticos (--stale, --live).
const TONES = {
  muted: 'border bg-muted/40 text-muted-foreground',
  warning: 'border border-stale/30 bg-stale/10 text-foreground [&_svg]:text-stale',
  danger: 'border border-destructive/30 bg-destructive/10 text-foreground [&_svg]:text-destructive',
  success: 'border border-live/30 bg-live/10 text-foreground [&_svg]:text-live',
} as const;

interface Props {
  children: ReactNode;
  tone?: keyof typeof TONES;
  icon?: ReactNode;
  className?: string;
}

/** Caja de aviso o nota de las fichas y herramientas (un solo estilo por tono). */
export function Notice({ children, tone = 'muted', icon, className }: Props) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md p-2.5 text-[12px] leading-snug',
        TONES[tone],
        className,
      )}
    >
      {icon && <span className="mt-0.5 shrink-0 [&_svg]:size-3.5">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
