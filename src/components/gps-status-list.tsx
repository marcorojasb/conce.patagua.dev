// Detalle del modo "GPS en vivo": una fila por línea del mapa con lo que se
// sabe de su GPS. Las líneas sin GPS se nombran, nunca se rellenan con
// estimadas: "sin GPS ahora" (la fuente responde sin micros), "la fuente no
// la sigue" (Biotrén, 302/304), "no se pudo consultar" y, pasado el tope de
// 16 sentidos por consulta, cuáles quedaron fuera.

import { RouteBadge } from '@/components/route-badge';
import { StatusChip, type StatusChipTone } from '@/components/ui/status-chip';
import { ROUTES_BY_ID } from '@/data/routes';
import { routePillCode } from '@/lib/route-labels';
import { noGpsText } from '@/realtime/gps-mode-summary';
import { MAX_GPS_PAIRS } from '@/realtime/route-vehicles';
import type { GpsLineStatus } from '@/types/ui-contracts';

// En vivo en verde; "no se pudo consultar" en el tono de advertencia; la
// fuente que no sigue la línea con borde punteado (no es un fallo, nunca
// tendrá GPS); el resto, neutro.
const STATUS_TONE: Record<GpsLineStatus['status'], StatusChipTone> = {
  live: 'live',
  'no-gps': 'muted',
  untracked: 'dashed',
  unavailable: 'stale',
  pending: 'muted',
  omitted: 'muted',
};

function statusText(line: GpsLineStatus, isBiotren: boolean): string {
  switch (line.status) {
    case 'live':
      return line.vehicles === 1 ? '1 micro' : `${line.vehicles} micros`;
    case 'no-gps':
      return noGpsText(line);
    case 'untracked':
      return isBiotren ? 'Biotrén: sin GPS (la fuente no la sigue)' : 'sin GPS (la fuente no la sigue)';
    case 'unavailable':
      return 'no se pudo consultar';
    case 'pending':
      return 'consultando…';
    case 'omitted':
      return 'sin consultar';
  }
}

function LineRow({ line }: { line: GpsLineStatus }) {
  const route = ROUTES_BY_ID.get(line.routeId);
  const isBiotren = route?.type === 'biotren';
  return (
    <li data-gps-line={line.code} data-status={line.status} className="flex min-h-5 items-center gap-2">
      <RouteBadge code={route ? routePillCode(route) : line.code} color={line.color} size="sm" />
      <StatusChip tone={STATUS_TONE[line.status]} className="min-w-0">
        <span className="truncate">{statusText(line, isBiotren)}</span>
      </StatusChip>
    </li>
  );
}

export function GpsStatusList({ lines, id }: { lines: readonly GpsLineStatus[]; id?: string }) {
  const shown = lines.filter((line) => line.status !== 'omitted');
  const omitted = lines.filter((line) => line.status === 'omitted');
  const queried = shown.filter((line) => line.status !== 'untracked').length;

  return (
    <div id={id} data-gps-status className="thin-scroll max-h-44 overflow-y-auto text-[11px] md:max-h-[30vh]">
      <ul aria-label="GPS por línea" className="space-y-0.5">
        {shown.map((line) => (
          <LineRow key={line.routeId} line={line} />
        ))}
      </ul>
      {omitted.length > 0 && (
        <div className="mt-1 border-t pt-1">
          <p data-gps-omitted className="text-muted-foreground">
            Solo se consultan las primeras {queried} {queried === 1 ? 'línea' : 'líneas'} (hasta {MAX_GPS_PAIRS}{' '}
            sentidos por consulta). Quedan fuera:
          </p>
          <ul aria-label="Líneas sin consultar" className="mt-0.5 flex flex-wrap gap-1">
            {omitted.map((line) => {
              const route = ROUTES_BY_ID.get(line.routeId);
              return (
                <li key={line.routeId} data-gps-line={line.code} data-status="omitted">
                  <RouteBadge code={route ? routePillCode(route) : line.code} color={line.color} size="sm" />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
