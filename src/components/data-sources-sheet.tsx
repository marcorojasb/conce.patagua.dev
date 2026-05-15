import { ExternalLink } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ROUTES } from '@/data/routes';
import { GTFS_CONCEPCION_SOURCE, GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { TERMINALS } from '@/data/terminals.generated';

const microCount = ROUTES.filter((r) => r.type === 'micro').length;
const biotrenCount = ROUTES.filter((r) => r.type === 'biotren').length;

interface Source {
  title: string;
  detail: string;
  link?: { href: string; label: string };
  license?: string | { name: string; href: string };
  count?: string;
}

const SOURCES: Source[] = [
  {
    title: 'GTFS estático Gran Concepción',
    detail:
      'Recorridos de micros, paraderos, shapes y calendario programado de los 169 servicios urbanos. Publicado por la Subsecretaría de Transportes de Chile. La app consume un artefacto estático generado a partir del feed; las shapes pasan por una simplificación Douglas–Peucker (~16 m) — el resto se sirve tal cual.',
    count: `${microCount} recorridos · ${GTFS_STOPS.length} paraderos · fuente ${GTFS_CONCEPCION_SOURCE.source}`,
    link: {
      href: 'https://busmaps.com/en/chile/Subsecretaria-de-Transporte/gran-concepcion',
      label: 'busmaps.com (mirror)',
    },
    license: { name: 'CC BY 4.0 · Subsecretaría de Transportes (Chile)', href: 'https://creativecommons.org/licenses/by/4.0/' },
  },
  {
    title: 'Servicios en curso (simulación según horario)',
    detail:
      'La capa "Servicios en curso" proyecta dónde DEBERÍA estar cada bus según el horario GTFS estático para el día y hora actual — no es GPS real. Útil para entender el ritmo programado del servicio (cuántos buses circulan, frecuencias por corredor, picos por hora). Atrasos, cancelaciones y desvíos son invisibles desde acá hasta que DTPR libere GTFS-RT.',
    count: 'Calculado en cliente cada 4 s desde los ~27 k trips del feed',
    license: 'Capa derivada · misma licencia que el GTFS base',
  },
  {
    title: 'OpenStreetMap · Overpass API',
    detail:
      'Estaciones y trazado del Biotrén (railway=station + railway=rail + operator=EFE), terminales (amenity=bus_station) y puntos de interés urbanos.',
    count: `${biotrenCount} líneas Biotrén · ${TERMINALS.length} terminales`,
    link: { href: 'https://www.openstreetmap.org/about', label: 'openstreetmap.org' },
    license: 'Open Database License (ODbL)',
  },
  {
    title: 'EFE Trenes de Chile · Biotrén',
    detail:
      'Orden y nombres oficiales de las 26 estaciones del Biotrén L1 (Hualqui ↔ Mercado Talcahuano) y L2 (Coronel ↔ Concepción), más horarios de operación.',
    link: { href: 'https://www.efe.cl/nuestros-servicios/biotren/', label: 'efe.cl/biotren' },
  },
  {
    title: 'CARTO · basemaps light/dark',
    detail:
      'Tiles del mapa base, en versiones clara y oscura. Cambia automáticamente con el tema de la app.',
    link: { href: 'https://carto.com/attributions', label: 'carto.com' },
    license: 'OpenStreetMap contributors © CARTO',
  },
];

const PENDING: Source[] = [
  {
    title: 'DTPR · GTFS-RT Gran Concepción',
    detail:
      'Posiciones de buses en tiempo real, próximas llegadas a paradero y alertas de servicio. Aún no se verificó un feed público autorizado para producción.',
    link: { href: 'https://transformacion.dtpr.cl/', label: 'transformacion.dtpr.cl' },
  },
  {
    title: 'Servicios interurbanos licitados (Tomé, Santa Juana, Florida)',
    detail:
      'El feed GTFS Gran Concepción cubre el área metropolitana urbana — Concepción, Talcahuano, San Pedro, Hualpén, Chiguayante, Penco/Lirquén, Coronel, Lota. Quedan fuera servicios licitados que conectan con Tomé, Santa Juana, Florida, Yumbel, etc. (incluyendo los 201 / 201 AU a Santa Juana). Pendiente: incorporar estos recorridos cuando estén en un GTFS público o vía Wikidata + OSM.',
    count: 'Rutas conocidas pendientes: ~12 servicios interurbanos del Biobío',
  },
  {
    title: 'Tarifa y pago electrónico DTPR',
    detail:
      'Tarifa adulto urbana referencial $750 CLP (efectivo); rangos por tramo en Biotrén. DTPR anunció que el pago electrónico se activará en buses urbanos del Gran Concepción durante el ciclo 2026 — los valores oficiales por tarjeta integrada y reglas de transbordo se sumarán al visor cuando la resolución se publique.',
  },
];

interface DataSourcesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataSourcesSheet({ open, onOpenChange }: DataSourcesSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-4 sm:max-w-md sm:w-[440px]">
        <SheetHeader>
          <SheetTitle className="pr-8">Fuentes de datos</SheetTitle>
          <SheetDescription>
            Todo lo que ves en este visor viene de fuentes abiertas. conce.patagua.dev es un
            proyecto open source.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-4 px-5 pb-5">
            <SourceList title="En uso ahora" sources={SOURCES} />
            <SourceList title="Pendientes (esperando publicación oficial)" sources={PENDING} />

            <div className="rounded-md border bg-muted/40 p-3 text-[12px] text-muted-foreground">
              Si encuentras un error en un paradero o recorrido de micro, corrígelo en la
              fuente GTFS primaria cuando esté confirmada. Para terminales, POIs o Biotrén,
              sigue siendo útil{' '}
              <a
                className="underline underline-offset-2 hover:text-foreground"
                href="https://www.openstreetmap.org/edit"
                target="_blank"
                rel="noopener noreferrer"
              >
                editar OSM directamente
              </a>
              . Los cambios se reflejan en la próxima sincronización (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                npm run sync:all
              </code>
              ).
            </div>

            <div className="text-[11px] text-muted-foreground">
              <a
                className="underline underline-offset-2 hover:text-foreground"
                href="https://github.com/marcorojasb/conce.patagua.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/marcorojasb/conce.patagua.dev
              </a>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function SourceList({ title, sources }: { title: string; sources: Source[] }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.title} className="rounded-md border bg-card p-3">
            <div className="text-sm font-medium">{s.title}</div>
            <p className="mt-1 break-words text-[12px] leading-snug text-muted-foreground">{s.detail}</p>
            {s.count && (
              <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">{s.count}</div>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              {s.link && (
                <a
                  className="inline-flex items-center gap-1 text-foreground underline underline-offset-2 hover:opacity-80"
                  href={s.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                  {s.link.label}
                </a>
              )}
              {s.license &&
                (typeof s.license === 'string' ? (
                  <span className="text-muted-foreground">{s.license}</span>
                ) : (
                  <a
                    className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    href={s.license.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.license.name}
                  </a>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
