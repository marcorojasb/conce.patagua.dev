import { useMemo } from 'react';
import { Building2, Map as MapIcon, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { WikiLinkButton } from '@/components/wiki-link';
import type { Terminal } from '@/types/transport';

interface TerminalDetailSheetProps {
  open: boolean;
  terminal: Terminal | null;
  onOpenChange: (open: boolean) => void;
  onFocus: () => void;
}

const TERMINAL_EYEBROW = (
  <>
    <Building2 className="size-3.5" />
    Terminal / Estación intermodal
  </>
);

export function TerminalDetailSheet({ open, terminal, onOpenChange, onFocus }: TerminalDetailSheetProps) {
  const panelChrome = useMemo(() => {
    if (!terminal) return null;
    const osmUrl = `https://www.openstreetmap.org/node/${terminal.osmId}`;
    return {
      description: (
        <span className="font-mono text-xs">
          {terminal.lat.toFixed(5)}, {terminal.lng.toFixed(5)}
        </span>
      ),
      actions: (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" onClick={onFocus}>
            <MapIcon className="size-3.5" />
            Centrar en mapa
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(osmUrl, '_blank', 'noopener')}
          >
            <ExternalLink className="size-3.5" />
            Ver en OSM
          </Button>
          <WikiLinkButton kind="terminal" terminalId={terminal.id} />
        </div>
      ),
    };
  }, [onFocus, terminal]);

  if (!terminal || !panelChrome) return null;

  return (
    <FloatingInfoPanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={terminal.name}
      eyebrow={TERMINAL_EYEBROW}
      description={panelChrome.description}
      actions={panelChrome.actions}
    >
      <div className="space-y-2 rounded-md border bg-card p-3 text-sm">
        <Row label="Red">
          {terminal.network ? (
            <Badge variant="secondary" className="font-mono">{terminal.network}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Row>
        <Row label="Operador">
          <span className="text-foreground">{terminal.operator ?? '—'}</span>
        </Row>
        <Row label="OSM ID">
          <span className="font-mono text-[11px] text-muted-foreground">{terminal.osmId}</span>
        </Row>
      </div>

      <div className="rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
        Datos extraídos de OpenStreetMap. La cobertura depende de los aportes
        de la comunidad; algunos nodos aún no publican operador verificable.
      </div>
    </FloatingInfoPanel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{children}</span>
    </div>
  );
}
