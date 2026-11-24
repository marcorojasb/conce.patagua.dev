import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  muted: 'border bg-muted/40 text-muted-foreground',
  warning:
    'border border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200',
  danger: 'border border-destructive/30 bg-destructive/10 text-destructive',
  success:
    'border border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200',
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
