import { Building2, Map as MapIcon, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Terminal } from '@/types/transport';

interface TerminalDetailSheetProps {
  open: boolean;
  terminal: Terminal | null;
  onOpenChange: (open: boolean) => void;
  onFocus: () => void;
}

export function TerminalDetailSheet({ open, terminal, onOpenChange, onFocus }: TerminalDetailSheetProps) {
  if (!terminal) return null;

  const osmUrl = `https://www.openstreetmap.org/node/${terminal.osmId}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-4 sm:max-w-md sm:w-[420px]">
        <SheetHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            Terminal / Estación intermodal
          </div>
          <SheetTitle className="pr-8">{terminal.name}</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {terminal.lat.toFixed(5)}, {terminal.lng.toFixed(5)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pb-5">
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" onClick={onFocus}>
              <MapIcon className="h-3.5 w-3.5" />
              Centrar en mapa
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(osmUrl, '_blank', 'noopener')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver en OSM
            </Button>
          </div>

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
            de la comunidad — falta operador en algunos nodos. <span className="font-mono">TODO</span>{' '}
            cruzar con la lista oficial de terminales DTPR cuando esté disponible.
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
