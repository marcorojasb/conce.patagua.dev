// Ficha de un corredor interurbano sin GTFS (Florida, Yumbel): reemplaza el
// popup de Leaflet que tenía el pin. Lo que sabemos es poco y se dice tal
// cual: título, operador o estado, de dónde salen las coordenadas y el
// artículo del wiki que lo documenta.

import { BookOpen, Crosshair, ExternalLink, Route as RouteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { SectionLabel } from '@/components/ui/section-label';
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { CORRIDOR_BY_ID } from '@/data/interurban-corridors';
import { wikiUrl } from '@/wiki/map-links';
import type { CorridorDetailSheetProps } from '@/types/ui-contracts';

const CORRIDOR_EYEBROW = (
  <>
    <RouteIcon />
    Corredor interurbano
  </>
);

export function CorridorDetailSheet({ chrome, corridorId, onFocus }: CorridorDetailSheetProps) {
  const corridor = CORRIDOR_BY_ID.get(corridorId);
  if (!corridor) return null;

  return (
    <FloatingInfoPanel
      chrome={chrome}
      title={corridor.title}
      eyebrow={CORRIDOR_EYEBROW}
      description={corridor.subtitle}
      actions={
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" asChild>
            <a href={wikiUrl(corridor.wikiSlug)}>
              <BookOpen className="size-3.5" />
              Ver en el wiki
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={onFocus}>
            <Crosshair className="size-3.5" />
            Centrar en el mapa
          </Button>
        </div>
      }
    >
      <Notice>
        <p className="font-medium text-foreground">Fuera del GTFS urbano · pin referencial</p>
        <p className="mt-1">
          No hay trazado ni horario oficial publicado para este corredor. El pin marca una
          coordenada de referencia en OpenStreetMap
          {corridor.terminal ? ' y la línea punteada solo une ese punto con su terminal en Concepción; no es el recorrido real.' : '.'}
        </p>
      </Notice>

      <section aria-label="Fuentes de las coordenadas">
        <SectionLabel>Fuentes de las coordenadas</SectionLabel>
        <ul className="space-y-1 text-[12px]">
          {corridor.sources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-ring"
              >
                {source.label}
                <ExternalLink className="size-3 shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </FloatingInfoPanel>
  );
}
