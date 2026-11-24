import { useMemo } from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { FloatingInfoPanel } from '@/components/floating-info-panel';
import { ROUTES, useRoutesVersion } from '@/data/routes';
import { GTFS_CONCEPCION_SOURCE, GTFS_STOPS } from '@/data/gtfs-concepcion.generated';
import { TERMINALS } from '@/data/terminals.generated';

interface Source {
  title: string;
  detail: string;
  link?: { href: string; label: string };
  license?: string | { name: string; href: string };
  count?: string;
}

// Los conteos se calculan al renderizar, no al importar: `ROUTES` se muta
// in-place cuando aterriza el chunk lazy de micros, así que un const de módulo
// quedaría congelado con los 6 recorridos del primer paint.
function buildSources(): Source[] {
  const microCount = ROUTES.filter((r) => r.type === 'micro').length;
  const biotrenCount = ROUTES.filter((r) => r.type === 'biotren').length;

  return [
    {
      title: 'GTFS estático Gran Concepción',
      detail:
        'Recorridos de micros, paraderos, shapes y calendario programado de los 169 servicios urbanos. Publicado por la Subsecretaría de Transportes de Chile. La app consume un artefacto estático generado a partir del feed; las shapes pasan por una simplificación Douglas–Peucker (~16 m), el resto se sirve tal cual.',
      count: `${microCount} recorridos · ${GTFS_STOPS.length} paraderos · fuente ${GTFS_CONCEPCION_SOURCE.source}`,
      link: {
        href: 'https://busmaps.com/en/chile/Subsecretaria-de-Transporte/gran-concepcion',
        label: 'busmaps.com (mirror)',
      },
      license: { name: 'CC BY 4.0 · Subsecretaría de Transportes (Chile)', href: 'https://creativecommons.org/licenses/by/4.0/' },
    },
    {
      title: 'Llegadas en vivo · app Transapp/DTPR (no oficial)',
      detail:
        'Al abrir un paradero, el visor muestra las micros que vienen a ese paradero con su GPS real: línea, minutos, distancia y patente, y las dibuja en el mapa. Es la misma fuente que usa la app de Transapp para el Gran Concepción; no es un feed oficial ni documentado, así que puede caerse o responder vacío. Se consulta solo el paradero abierto, cada 30 s, a través de una intermediaria con caché de 25 s por paradero y tope de consultas. Un dato vale 10 min mostrando su edad.',
      count: 'Solo el paradero abierto · hasta ~30 min de anticipación',
      link: { href: 'https://transformacion.dtpr.cl/', label: 'transformacion.dtpr.cl' },
      license: 'Fuente no oficial · sin licencia de datos publicada',
    },
    {
      title: 'Servicios en curso (simulación según horario)',
      detail:
        'La capa "Servicios en curso" proyecta dónde DEBERÍA estar cada bus o tren según horarios públicos: GTFS urbano oficial, Biotrén por frecuencia publicada y 201/401/411/421 por ventanas/frecuencias DTPR, operador, Moovit/Red Regional y comunidad. No es GPS real: atrasos, cancelaciones y desvíos no se ven. En el mapa van redondas con borde punteado; las micros con GPS real van cuadradas con anillo verde.',
      count: 'Calculado en cliente cada 1 s desde GTFS + patrones horarios documentados',
      license: 'Capa derivada · GTFS CC BY 4.0 + fuentes públicas citadas en wiki',
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
      title: 'Esri · Gray Canvas basemaps',
      detail:
        'Tiles del mapa base, en versiones clara (Light Gray Canvas) y oscura (Dark Gray Canvas). Cambia automáticamente con el tema de la app. Se usa en lugar de CARTO porque sus basemaps gratuitos exigen API key desde 2026.',
      link: { href: 'https://www.esri.com/en-us/arcgis/products/arcgis-online/overview', label: 'esri.com' },
      license: 'OpenStreetMap contributors © Esri · HERE, Garmin',
    },
  ];
}

const PENDING: Source[] = [
  {
    title: 'DTPR · GTFS-RT Gran Concepción',
    detail:
      'Posiciones de toda la flota en tiempo real y alertas de servicio en un feed oficial. Aún no se verificó un feed público autorizado; mientras tanto las llegadas en vivo vienen de la app de Transapp (ver arriba), solo para el paradero abierto.',
    link: { href: 'https://transformacion.dtpr.cl/', label: 'transformacion.dtpr.cl' },
  },
  {
    title: 'Servicios interurbanos licitados (Tomé, Santa Juana, Florida)',
    detail:
      'El feed GTFS Gran Concepción cubre el área metropolitana urbana, Concepción, Talcahuano, San Pedro, Hualpén, Chiguayante, Penco/Lirquén, Coronel, Lota. Quedan fuera servicios licitados que conectan con Tomé, Santa Juana, Florida, Yumbel, etc. (incluyendo los 201 / 201 AU a Santa Juana). Pendiente: incorporar estos recorridos cuando estén en un GTFS público o vía Wikidata + OSM.',
    count: 'Rutas conocidas pendientes: ~12 servicios interurbanos del Biobío',
  },
  {
    title: 'Tarifa y pago electrónico DTPR',
    detail:
      'Tarifa adulto urbana referencial $750 CLP (efectivo); rangos por tramo en Biotrén. DTPR anunció que el pago electrónico se activará en buses urbanos del Gran Concepción durante el ciclo 2026, los valores oficiales por tarjeta integrada y reglas de transbordo se sumarán al visor cuando la resolución se publique.',
  },
];

const SOURCES_EYEBROW = (
  <>
    <Database />
    Proyecto
  </>
);

interface DataSourcesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataSourcesSheet({ open, onOpenChange }: DataSourcesSheetProps) {
  const routesVersion = useRoutesVersion();
  const sources = useMemo(() => {
    void routesVersion;
    return buildSources();
  }, [routesVersion]);

  return (
    <FloatingInfoPanel
      open={open}
      onClose={() => onOpenChange(false)}
      title="Fuentes de datos"
      eyebrow={SOURCES_EYEBROW}
      description="De dónde sale cada capa del visor y cuánto confiar en ella. conce.patagua.dev es open source."
    >
      <SourceList title="En uso ahora" sources={sources} />
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
    </FloatingInfoPanel>
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
                  <ExternalLink className="size-3" />
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
