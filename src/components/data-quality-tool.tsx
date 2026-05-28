import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Route as RouteIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildDataQualityReport, type DataQualityIssue, type DataQualitySeverity } from '@/lib/data-quality';

interface Props {
  onSelectRoute: (id: string) => void;
}

const SEVERITY_LABEL: Record<DataQualitySeverity, string> = {
  error: 'Errores',
  warning: 'Alertas',
  info: 'Info',
};

export default function DataQualityTool({ onSelectRoute }: Props) {
  const report = useMemo(() => buildDataQualityReport(), []);
  const [filter, setFilter] = useState<DataQualitySeverity | 'all'>('all');
  const visible = report.issues.filter((issue) => filter === 'all' || issue.severity === filter);

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-snug text-muted-foreground">
        Diagnóstico generado desde datasets locales: trazados, paraderos, horarios
        y cobertura de simulación. Las alertas no siempre son bugs: algunas indican
        datos fuente aproximados que el visor corrige en runtime.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <Metric label="rutas" value={report.routeCount} />
        <Metric label="paraderos" value={report.stopCount} />
        <Metric label="simulables" value={report.simulatedRouteCount} />
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {(['all', 'error', 'warning', 'info'] as const).map((id) => (
          <Button
            key={id}
            type="button"
            variant={filter === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(id)}
            className="h-8 px-2 text-[11px]"
          >
            {id === 'all' ? 'Todo' : SEVERITY_LABEL[id]}
          </Button>
        ))}
      </div>

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
            {visible.slice(0, 80).map((issue, index) => (
              <li key={`${issue.category}-${issue.title}-${index}`}>
                <IssueRow issue={issue} onSelectRoute={onSelectRoute} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {visible.length > 80 && (
        <div className="rounded-md border bg-muted/40 p-2 text-[11px] text-muted-foreground">
          Mostrando 80 de {visible.length} hallazgos para mantener el panel liviano.
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-base font-semibold">{value.toLocaleString('es-CL')}</div>
    </div>
  );
}

function SeverityCard({ severity, count }: { severity: DataQualitySeverity; count: number }) {
  const Icon = severity === 'error' ? AlertTriangle : severity === 'warning' ? AlertTriangle : Info;
  const color =
    severity === 'error'
      ? 'text-destructive'
      : severity === 'warning'
        ? 'text-amber-600'
        : 'text-muted-foreground';
  return (
    <div className="rounded-md border bg-card p-2">
      <div className={`flex items-center gap-1 text-[10px] uppercase tracking-wider ${color}`}>
        <Icon className="size-3" />
        {SEVERITY_LABEL[severity]}
      </div>
      <div className="font-mono text-base font-semibold">{count}</div>
    </div>
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
  const tone =
    issue.severity === 'error'
      ? 'text-destructive'
      : issue.severity === 'warning'
        ? 'text-amber-600'
        : 'text-muted-foreground';
  return (
    <div className="p-3">
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium">{issue.title}</span>
            <Badge variant="outline" className="text-[10px]">
              {issue.category}
            </Badge>
          </div>
          <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {issue.detail}
          </div>
        </div>
        {issue.routeId && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => onSelectRoute(issue.routeId!)}
            aria-label={`Ver ruta ${issue.routeId}`}
          >
            <RouteIcon className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
