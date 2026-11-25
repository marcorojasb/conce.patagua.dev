// "Micros en el mapa" sobre el mapa. El modo GPS se consulta aquí y no en
// App: cada sondeo (30 s) y cada tic de antigüedad vuelve a dibujar solo este
// control, no todo el visor. El mapa recibe las micros por `gpsVehicleFeed`.

import { memo } from 'react';
import { MicrosControl } from '@/components/micros-control';
import { useGpsMode } from '@/hooks/use-gps-mode';
import type { LiveArrivalsSnapshot } from '@/hooks/use-live-arrivals';
import type { Route } from '@/types/transport';
import type { MicrosMode, SimulationScope } from '@/types/ui-contracts';

interface MicrosSlotProps {
  mode: MicrosMode;
  onModeChange: (mode: MicrosMode) => void;
  scope: SimulationScope;
  onScopeChange: (scope: SimulationScope) => void;
  /** Recorridos a consultar en orden de prioridad: foco primero, luego los últimos agregados. */
  routes: readonly Route[];
  selectedRouteId: string | null;
  stopLive: LiveArrivalsSnapshot | null;
  onOpenLines: () => void;
  /** Teléfono con una ficha abierta: el selector y, si algo falla, una línea. */
  compact: boolean;
  /** Detalle GPS por línea plegado: ficha abierta en escritorio o avisos debajo. */
  detailCollapsed: boolean;
  onRetrySchedule: () => void;
}

export const MicrosSlot = memo(function MicrosSlot({
  mode,
  onModeChange,
  scope,
  onScopeChange,
  routes,
  selectedRouteId,
  stopLive,
  onOpenLines,
  compact,
  detailCollapsed,
  onRetrySchedule,
}: MicrosSlotProps) {
  const gps = useGpsMode({ enabled: mode === 'gps', routes, selectedRouteId, stopLive });
  return (
    <MicrosControl
      mode={mode}
      onModeChange={onModeChange}
      scope={scope}
      onScopeChange={onScopeChange}
      gps={gps}
      onOpenLines={onOpenLines}
      compact={compact}
      onRetrySchedule={onRetrySchedule}
      selectedRouteId={selectedRouteId}
      linesOnMap={routes.length}
      detailCollapsed={detailCollapsed}
    />
  );
});
