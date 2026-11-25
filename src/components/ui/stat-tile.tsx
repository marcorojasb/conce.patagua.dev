import type { ReactNode } from 'react';
import { SectionLabel } from '@/components/ui/section-label';
import { cn } from '@/lib/utils';

interface Props {
  label: ReactNode;
  /** Cifra u hora destacada: las cifras van en JetBrains Mono y las palabras en Inter. */
  value: ReactNode;
  detail?: ReactNode;
  compact?: boolean;
  className?: string;
}

// Cifras, horas y duraciones ("191", "05:48–21:48", "~5 min", "3,2 km"): en
// mono, como en el diseño original ("175" / "recorridos"). Las palabras que
// las acompañan ("paraderos", "cada", "Sin servicio") quedan en Inter.
const FIGURE = /~?\d[\d.,:]*(?:\s?[–-]\s?\d[\d.,:]*)?(?:\s?(?:min|km|h|m|s)\b)?/g;

/** Parte un texto en cifras (mono) y palabras (Inter). */
export function splitFigures(text: string): Array<{ text: string; figure: boolean }> {
  const parts: Array<{ text: string; figure: boolean }> = [];
  let last = 0;
  for (const match of text.matchAll(FIGURE)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: text.slice(last, index), figure: false });
    parts.push({ text: match[0], figure: true });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), figure: false });
  return parts;
}

function Value({ value }: { value: ReactNode }) {
  if (typeof value !== 'string' && typeof value !== 'number') return <>{value}</>;
  return (
    <>
      {splitFigures(String(value)).map((part, i) => (
        <span key={i} className={part.figure ? 'font-mono' : 'font-sans'}>
          {part.text}
        </span>
      ))}
    </>
  );
}

/** Cifra destacada con su rótulo (fichas, planificador, tarjeta de inicio). */
export function StatTile({ label, value, detail, compact = false, className }: Props) {
  return (
    <div className={cn('min-w-0 rounded-md border bg-card', compact ? 'p-1.5' : 'p-2.5', className)}>
      <SectionLabel className="mb-0">{label}</SectionLabel>
      <div
        className={cn(
          'mt-0.5 font-semibold tabular-nums leading-tight text-card-foreground',
          compact ? 'text-[13px]' : 'text-base',
        )}
      >
        <Value value={value} />
      </div>
      {detail != null && <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{detail}</div>}
    </div>
  );
}
