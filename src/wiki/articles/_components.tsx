// Componentes reutilizables para los artículos del wiki.
//
// Originalmente vivían inline en ruta-201-santa-juana.tsx. Se extrajeron
// aquí porque el corredor de El Pimentón sumó dos artículos hermanos que
// necesitan exactamente la misma UI (KeyValueList, Timeline, banners).
//
// Mantener la API estable: el 201 sigue importando los mismos nombres.

import type { ReactNode } from 'react';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="mt-4 text-base font-semibold tracking-tight">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function KeyValueList({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <dl className="overflow-hidden rounded-md border">
      {items.map(([key, value], i) => (
        <div
          key={key}
          className={`grid grid-cols-[140px_1fr] gap-3 px-3 py-2 text-[13px] ${
            i === 0 ? '' : 'border-t'
          }`}
        >
          <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {key}
          </dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:text-foreground"
    >
      {children}
    </a>
  );
}

export function Sources({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label="Fuentes citadas"
      className="mt-2 rounded-sm border border-muted-foreground/20 bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground"
    >
      <span className="font-medium uppercase tracking-wider">Fuentes</span>
      <div className="mt-1 flex flex-col gap-0.5">{children}</div>
    </aside>
  );
}

export function Timeline({
  items,
}: {
  items: Array<{ date: string; event: ReactNode; source?: { href: string; label: string } }>;
}) {
  return (
    <ol className="space-y-2 border-l border-muted pl-4">
      {items.map((item) => (
        <li key={`${item.date}-${item.source?.href ?? item.source?.label ?? ''}`} className="relative">
          <span
            aria-hidden
            className="absolute -left-[18px] mt-1 inline-block size-2 rounded-full bg-muted-foreground"
          />
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {item.date}
          </div>
          <div className="text-[13px] leading-snug">
            {item.event}
            {item.source && (
              <>
                {' '}
                <SourceLink href={item.source.href}>({item.source.label})</SourceLink>
              </>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Banners verificación / pendiente. Se usan al tope de un artículo o sección
// para marcar el estatus editorial del bloque que sigue.

export function VerifiedBanner({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label="Bloque verificado"
      className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-[12px] text-emerald-900 dark:text-emerald-200"
    >
      {children}
    </aside>
  );
}

export function PendingBanner({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label="Bloque pendiente de verificación"
      className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-[12px] text-amber-900 dark:text-amber-200"
    >
      {children}
    </aside>
  );
}

// Tabla comparativa de operadores en un corredor. La paleta y los bordes
// siguen el patrón de la tabla tarifaria del 201.

export interface OperatorRow {
  name: string;
  routes: string;
  terminal: string;
  notes: ReactNode;
  source?: { href: string; label: string };
}

export function OperatorTable({ rows }: { rows: OperatorRow[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-2 font-medium">Operador</th>
            <th className="px-3 py-2 font-medium">Rutas observadas</th>
            <th className="px-3 py-2 font-medium">Terminal Concepción</th>
            <th className="px-3 py-2 font-medium">Notas y fuente</th>
          </tr>
        </thead>
        <tbody className="divide-y align-top">
          {rows.map((row) => (
            <tr key={`${row.name}-${row.routes}-${row.terminal}`}>
              <td className="px-3 py-2 font-medium">{row.name}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.routes}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.terminal}</td>
              <td className="px-3 py-2 text-[12px] text-muted-foreground">
                {row.notes}
                {row.source && (
                  <>
                    {' '}
                    <SourceLink href={row.source.href}>({row.source.label})</SourceLink>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Fila de servicio para el índice "Recorridos interurbanos". Reutilizable
// si en el futuro otro índice quiere listar artículos del mismo formato:
// código, título, nota corta y opcionalmente link al artículo + badge
// verificado.

export interface ServiceRowProps {
  code: string;
  title: string;
  notes: ReactNode;
  slug?: string;
  verified?: boolean;
  /** Extra slot a la derecha del link "Ver artículo →" (ej. un <MapLink>). */
  extra?: ReactNode;
}

export function ServiceRow({ code, title, notes, slug, verified, extra }: ServiceRowProps) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="flex items-baseline gap-2">
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{code}</span>
        <span className="text-[14px] font-medium">{title}</span>
        {verified && (
          <span className="ml-auto rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            verificado
          </span>
        )}
      </div>
      <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{notes}</p>
      {(slug || extra) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px]">
          {slug && (
            <a
              href={`/wiki/${slug}`}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Ver artículo →
            </a>
          )}
          {extra}
        </div>
      )}
    </div>
  );
}
