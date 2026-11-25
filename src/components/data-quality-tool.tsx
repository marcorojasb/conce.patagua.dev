import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Info, Route as RouteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { StatTile } from '@/components/ui/stat-tile';
import { StatusChip } from '@/components/ui/status-chip';
import { useStickyState } from '@/hooks/use-sticky-state';
import { buildDataQualityReport, type DataQualityIssue, type DataQualitySeverity } from '@/lib/data-quality';

interface Props {
  onSelectRoute: (id: string) => void;
}

const SEVERITY_LABEL: Record<DataQualitySeverity, string> = {
  error: 'Errores',
  warning: 'Alertas',
  info: 'Info',
};

const SEVERITY_TONE: Record<DataQualitySeverity, string> = {
  error: 'text-destructive',
  warning: 'text-stale',
  info: 'text-muted-foreground',
};

const FILTER_OPTIONS = (['all', 'error', 'warning', 'info'] as const).map((value) => ({
  value,
  label: value === 'all' ? 'Todo' : SEVERITY_LABEL[value],
}));

export default function DataQualityTool({ onSelectRoute }: Props) {
  const report = useMemo(() => buildDataQualityReport(), []);
  // El filtro sigue igual al volver con Atrás desde un recorrido abierto aquí.
  const [filter, setFilter] = useStickyState<DataQualitySeverity | 'all'>('quality.filter', 'all');
  const visible = report.issues.filter((issue) => filter === 'all' || issue.severity === filter);

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-snug text-muted-foreground">
        Diagnóstico generado desde datasets locales: trazados, paraderos, horarios
        y cobertura de simulación. Las alertas no siempre son bugs: algunas indican
        datos fuente aproximados que el visor corrige en runtime.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <StatTile compact label="rutas" value={report.routeCount.toLocaleString('es-CL')} />
        <StatTile compact label="paraderos" value={report.stopCount.toLocaleString('es-CL')} />
        <StatTile compact label="simulables" value={report.simulatedRouteCount.toLocaleString('es-CL')} />
      </div>

      <SegmentedControl
        variant="toggle"
        size="sm"
        label="Filtrar hallazgos"
        value={filter}
        options={FILTER_OPTIONS}
        onChange={setFilter}
      />

      <div className="grid grid-cols-3 gap-2">
        <SeverityCard severity="error" count={report.summary.error} />
        <SeverityCard severity="warning" count={report.summary.warning} />
        <SeverityCard severity="info" count={report.summary.info} />
      </div>

      <div className="overflow-hidden rounded-md border">
        {visible.length === 0 ? (
          <div className="p-3 text-[12px] text-muted-foreground">
            Sin hallazgos para este filtro.
          </div>
        ) : (
          <ul className="divide-y">
            {visible.slice(0, 80).map((issue) => (
              <li key={`${issue.category}-${issue.title}-${issue.detail}`}>
                <IssueRow issue={issue} onSelectRoute={onSelectRoute} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {visible.length > 80 && (
        <Notice>Mostrando 80 de {visible.length} hallazgos para mantener el panel liviano.</Notice>
      )}
    </div>
  );
}

function SeverityCard({ severity, count }: { severity: DataQualitySeverity; count: number }) {
  const Icon = severity === 'info' ? Info : AlertTriangle;
  return (
    <StatTile
      compact
      label={
        <span className={`inline-flex items-center gap-1 ${SEVERITY_TONE[severity]}`}>
          <Icon className="size-3" />
          {SEVERITY_LABEL[severity]}
        </span>
      }
      value={count}
    />
  );
}

function IssueRow({
  issue,
  onSelectRoute,
}: {
  issue: DataQualityIssue;
  onSelectRoute: (id: string) => void;
}) {
  const okInfo = issue.severity === 'info' && issue.category === 'simulation';
  const Icon = okInfo ? CheckCircle2 : issue.severity === 'info' ? Info : AlertTriangle;
  const tone = SEVERITY_TONE[issue.severity];
  return (
    <div className="p-3">
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium">{issue.title}</span>
            <StatusChip tone="muted">{issue.category}</StatusChip>
          </div>
          <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {issue.detail}
          </div>
        </div>
        {issue.routeId && (
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            className="shrink-0"
            onClick={() => onSelectRoute(issue.routeId!)}
            aria-label={`Ver la ficha del recorrido de «${issue.title}»`}
          >
            <RouteIcon className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
