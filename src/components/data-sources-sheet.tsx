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
  license?: string;
  count?: string;
}

const SOURCES: Source[] = [
  {
    title: 'GTFS estático Gran Concepción · fuente candidata',
    detail:
      'Recorridos de micros, paraderos, shapes y calendario programado cargados desde un feed GTFS funcional para Gran Concepción. La app lo consume como artefacto estático generado; no llama directo al mirror ni a endpoints internos.',
    count: `${microCount} recorridos · ${GTFS_STOPS.length} paraderos · fuente ${GTFS_CONCEPCION_SOURCE.source}`,
    link: {
      href: 'https://busmaps.com/en/chile/Subsecretaria-de-Transporte/gran-concepcion',
      label: 'busmaps.com/gran-concepcion',
    },
    license: 'Uso productivo sujeto a verificación de fuente primaria/licencia',
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
    title: 'Fuente primaria oficial del GTFS estático',
    detail:
      'El feed funciona técnicamente, pero antes de producción conviene confirmar el origen primario, versión vigente, atribución y condiciones de reutilización.',
    link: { href: 'https://datos.gob.cl/dataset?q=gtfs+gran+concepcion', label: 'datos.gob.cl' },
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
            Todo lo que ves en este visor viene de fuentes abiertas. Conce Transporte es un
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
              {s.license && (
                <span className="text-muted-foreground">{s.license}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
