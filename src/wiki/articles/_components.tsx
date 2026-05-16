// Componentes reutilizables para los artículos del wiki.
//
// Originalmente vivían inline en ruta-201-santa-juana.tsx. Se extrajeron
// acá porque el corredor de El Pimentón sumó dos artículos hermanos que
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
          key={i}
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
    <div className="mt-2 rounded-sm border-l-2 border-muted-foreground/30 bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
      <span className="font-medium uppercase tracking-wider">Fuentes</span>
      <div className="mt-1 flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: Array<{ date: string; event: ReactNode; source?: { href: string; label: string } }>;
}) {
  return (
    <ol className="space-y-2 border-l-2 border-muted pl-4">
      {items.map((item, i) => (
        <li key={i} className="relative">
          <span
            aria-hidden
            className="absolute -left-[18px] mt-1 inline-block h-2 w-2 rounded-full bg-muted-foreground"
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
    <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-[12px] text-emerald-900 dark:text-emerald-200">
      {children}
    </div>
  );
}

export function PendingBanner({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-[12px] text-amber-900 dark:text-amber-200">
      {children}
    </div>
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
          {rows.map((row, i) => (
            <tr key={i}>
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

// Placeholder reservado para que el agente del mapa lo conecte al visor
// real más tarde. Mientras tanto: caja con dimensiones, nodo identificable
// por data-corridor-id, y un mini-listado de hitos opcional.

export function CorridorMap({
  corridorId,
  caption,
  waypoints,
}: {
  corridorId: string;
  caption?: ReactNode;
  waypoints?: Array<{ km: string; label: string; note?: string }>;
}) {
  return (
    <div
      data-corridor-id={corridorId}
      className="rounded-md border bg-muted/20 p-3"
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="font-medium">Mapa del corredor</span>
        <span className="font-mono">id: {corridorId}</span>
      </div>
      <div
        aria-hidden
        className="mt-2 flex h-[180px] items-center justify-center rounded-sm border border-dashed border-muted-foreground/30 bg-background/40 text-[12px] text-muted-foreground"
      >
        Placeholder · el visor enchufa el mapa cuando exista una capa propia
        para este corredor
      </div>
      {caption && (
        <p className="mt-2 text-[12px] text-muted-foreground">{caption}</p>
      )}
      {waypoints && waypoints.length > 0 && (
        <ol className="mt-2 space-y-1 text-[12px]">
          {waypoints.map((wp, i) => (
            <li key={i} className="flex gap-2">
              <span className="w-12 shrink-0 font-mono text-muted-foreground">
                {wp.km}
              </span>
              <span>
                <strong>{wp.label}</strong>
                {wp.note && (
                  <span className="text-muted-foreground"> · {wp.note}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
