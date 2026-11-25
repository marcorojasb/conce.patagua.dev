// Selector de opciones en fila (Horario / GPS en vivo, Mis líneas / Toda la red,
// filtros, sentido). La elegida va invertida (fondo foreground), como la barra y
// Capas del diseño original: se distingue a 14–18:1 del resto, no por un gris
// sobre otro gris.
//
// - variant 'radio': una sola elección (patrón radiogroup de ARIA): un solo
//   tab stop, flechas para moverse y elegir.
// - variant 'toggle': botones con aria-pressed dentro de un role=group (los
//   smokes y consumidores que ya leen aria-pressed siguen igual).

import { useId, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Nombre accesible; sin él, el nombre sale del contenido visible. */
  name?: string;
  /** Segunda línea corta (11 px), solo en la opción elegida. */
  meta?: ReactNode;
  icon?: ReactNode;
  title?: string;
}

interface Props<T extends string> {
  label: string;
  value: T | null;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  size?: 'md' | 'sm';
  variant: 'radio' | 'toggle';
  /** 'equal': todas del mismo ancho. 'content': la elegida toma el espacio que sobra. */
  fit?: 'equal' | 'content';
  className?: string;
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  size = 'md',
  variant,
  fit = 'equal',
  className,
}: Props<T>) {
  const radio = variant === 'radio';
  const focusable = value ?? options[0]?.value;
  const metaId = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (step === 0 || options.length === 0) return;
    event.preventDefault();
    const index = options.findIndex((o) => o.value === value);
    const next = options[(index + step + options.length) % options.length];
    onChange(next.value);
    const radios = event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
    radios[options.indexOf(next)]?.focus();
  };

  return (
    <div
      role={radio ? 'radiogroup' : 'group'}
      aria-label={label}
      onKeyDown={radio ? onKeyDown : undefined}
      className={cn('flex min-w-0 gap-1', className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        const showMeta = checked && option.meta != null;
        return (
          <button
            key={option.value}
            type="button"
            role={radio ? 'radio' : undefined}
            aria-checked={radio ? checked : undefined}
            aria-pressed={radio ? undefined : checked}
            aria-label={option.name}
            // `name` pisa el contenido: el meta ("171 estimadas") se enlaza aparte.
            aria-describedby={showMeta ? metaId : undefined}
            title={option.title}
            tabIndex={radio ? (option.value === focusable ? 0 : -1) : undefined}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 font-medium transition-colors focus-ring',
              size === 'md' ? 'h-10 text-[13px] md:h-8' : 'h-10 text-xs md:h-7',
              showMeta ? 'justify-start text-left' : 'justify-center',
              fit === 'equal' ? 'min-w-0 flex-1' : checked ? 'min-w-0 flex-[1_1_auto]' : 'flex-none',
              checked
                ? 'border-foreground bg-foreground text-background shadow-sm'
                : 'border-border bg-background text-foreground/75 hover:bg-accent hover:text-foreground',
            )}
          >
            {option.icon != null && (
              <span aria-hidden className="inline-flex shrink-0 [&_svg]:size-4">
                {option.icon}
              </span>
            )}
            {showMeta ? (
              <span className="min-w-0">
                <span className="block leading-tight">{option.label}</span>
                <span id={metaId} className="block truncate text-[11px] font-normal leading-tight text-background/80">
                  {option.meta}
                </span>
              </span>
            ) : (
              option.label
            )}
          </button>
        );
      })}
    </div>
  );
}
