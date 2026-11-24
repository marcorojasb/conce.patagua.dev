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

// "2025-12-31" → "31-12-2025", como se escriben las fechas en el resto del visor.
function dmy(iso: string): string {
  return iso.split('-').reverse().join('-');
}

// Los conteos se calculan al renderizar, no al importar: `ROUTES` se muta
// in-place cuando aterriza el chunk lazy de micros, así que un const de módulo
// quedaría congelado con los 6 recorridos del primer paint.
function buildSources(): Source[] {
  const microCount = ROUTES.filter((r) => r.type === 'micro').length;
  const biotrenCount = ROUTES.filter((r) => r.type === 'biotren').length;
  const gtfs = GTFS_CONCEPCION_SOURCE;
  const gtfsExpired = new Date().toISOString().slice(0, 10) > gtfs.feedEndDate;

  return [
    {
      title: 'GTFS oficial Gran Concepción · DTPR',
      detail:
        `Programa oficial de buses que publica la División de Transporte Público Regional (DTPR, Ministerio de Transportes) en dtpr.gob.cl: trazado y paraderos de cada sentido y horario programado por día, para la red urbana y los interurbanos 201/201-AU (Santa Juana), 401/401Y/411/421 (Tomé y Dichato) y 302/304 (Lota). Versión «${gtfs.feedVersion}», calendario declarado del ${dmy(gtfs.feedStartDate)} al ${dmy(gtfs.feedEndDate)}` +
        (gtfsExpired
          ? ': ya venció, pero es la última publicación oficial y el visor la usa como el programa más reciente.'
          : '.') +
        ' Un proceso diario revisa el archivo y, si cambió, abre una solicitud de cambios que se publica al aprobarla. Las shapes se simplifican (~9 m), se usa la secuencia de paraderos más común de cada sentido y se corrigen los letreros cruzados de 02AD, 02KP y 23BS; el resto se usa tal cual.',
      count: `${microCount.toLocaleString('es-CL')} recorridos · ${GTFS_STOPS.length.toLocaleString('es-CL')} paraderos · ${gtfs.source}`,
      link: { href: gtfs.url, label: 'granconcepcion.zip (dtpr.gob.cl)' },
      license: 'La DTPR no declara licencia de datos · información pública del Estado',
    },
    {
      title: 'Llegadas en vivo · fuente de la app Transapp (no oficial)',
      detail:
        'Al abrir un paradero, el visor consulta solo ese paradero en la fuente que usa la app de Transapp para la DTPR. No es un feed oficial ni documentado: puede caerse o responder vacío. Por cada micro trae línea, sentido, minutos, posición GPS, patente y distancia en línea recta (no por la ruta). Una línea sin GPS aparece como "sin datos en vivo · pasa cada N". La consulta pasa por la intermediaria del visor (/api/stop-arrivals), con caché de 25 s por paradero y un tope de 30 consultas por minuto a la fuente. Un dato vale 10 min mostrando su edad.',
      count: 'Calce con el GTFS: 2.202 de 2.239 paraderos (código P + stop_id) · 183 de 188 sentidos · sin 302/304',
      license: 'Fuente no oficial · sin licencia de datos publicada',
    },
    {
      title: 'Servicios en curso (estimación según horario)',
      detail:
        'La capa "Servicios en curso" proyecta dónde DEBERÍA estar cada bus o tren según su horario programado: GTFS oficial DTPR para los buses (interurbanos incluidos) e itinerarios oficiales de EFE para el Biotrén. Es una estimación, no GPS: atrasos, cancelaciones y desvíos no se ven. En el mapa van redondas con borde punteado; las micros con GPS real van cuadradas con anillo verde.',
      count: 'Calculado en el navegador cada 1 s desde los horarios programados',
      license: 'Capa derivada · GTFS DTPR + itinerarios EFE',
    },
    {
      title: 'EFE · itinerarios del Biotrén',
      detail:
        'Horario de cada tren de L1 (Hualqui ↔ Mercado Talcahuano) y L2 (Coronel ↔ Concepción), transcrito tren por tren desde los itinerarios oficiales vigentes desde el 15-07-2026 (lunes a viernes, sábado y domingo). EFE no publica GTFS. También vienen de EFE el orden y los nombres oficiales de las 25 estaciones (12 en L1 y 14 en L2, con Concepción compartida).',
      count: 'Día hábil: L1 37 trenes · L2 104 trenes (de cabecera a cabecera)',
      link: { href: 'https://www.efe.cl/itinerario-biotren/', label: 'efe.cl/itinerario-biotren' },
    },
    {
      title: 'OpenStreetMap · Overpass API',
      detail:
        'Estaciones y vía del Biotrén (railway=station + railway=rail + operator=EFE), terminales (amenity=bus_station), puntos de interés urbanos, ciclovías, áreas verdes y colegios. Los pins de los corredores Florida y Yumbel, que no tienen GTFS, usan coordenadas de OSM.',
      count: `${biotrenCount} líneas Biotrén · ${TERMINALS.length} terminales`,
      link: { href: 'https://www.openstreetmap.org/about', label: 'openstreetmap.org' },
      license: 'Open Database License (ODbL)',
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
    title: 'GTFS DTPR con programa 2026',
    detail:
      'La versión publicada es el programa del 28-02-2025. La red que sigue la app de Transapp en 2026 ya tiene 11 servicios que no calzan con ese GTFS (02H, 02L, 20F, 20N, 30H, 30Z, 50SY, 70FY, 70HY, 80B, 80V): diez no aparecen como recorrido en el visor y la 02L solo como la variante 02L-Y (2 viajes en día hábil). Cuando la DTPR publique una versión nueva, el proceso diario abrirá una solicitud de cambios con los datos y entrarán al visor al aprobarla.',
    link: { href: 'https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/', label: 'dtpr.gob.cl · GTFS Gran Concepción' },
  },
  {
    title: 'DTPR · GTFS-RT Gran Concepción',
    detail:
      'Posiciones de toda la flota en tiempo real y alertas de servicio en un feed oficial. No hay uno público; mientras tanto las llegadas en vivo vienen de la fuente de la app de Transapp (ver arriba), solo para el paradero abierto.',
    link: { href: 'https://transformacion.dtpr.cl/', label: 'transformacion.dtpr.cl' },
  },
  {
    title: 'Corredores sin GTFS (Florida, Yumbel, resto de Coronel–Lota)',
    detail:
      'El GTFS oficial ya trae los interurbanos 201/201-AU, 401/401Y/411/421 y 302/304. Quedan fuera los corredores privados Concepción ↔ Florida y Concepción ↔ Yumbel, que en el mapa son solo un pin con enlace al wiki, y el resto de los troncales Coronel–Lota. Entrarán como recorridos si alguien publica su GTFS.',
  },
  {
    title: 'Tarifa y pago electrónico DTPR',
    detail:
      'Tarifa urbana vigente desde el 23-feb-2025: $580 adulto, $290 adulto mayor, $190 estudiante. Cada interurbano tiene la suya: 201/201-AU $1.000 adulto, Concepción–Tomé $780 y –Dichato $830; para 302/304 no hay una tarifa única publicada. El Biotrén cobra por zonas (Z1–Z10, $420–$850 adulto) con su tarjeta Conecta. DTPR anunció que el pago electrónico se activará en buses urbanos del Gran Concepción durante el ciclo 2026, los valores oficiales por tarjeta integrada y reglas de transbordo se sumarán al visor cuando la resolución se publique.',
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
        Si encuentras un error en un paradero o recorrido de micro, repórtalo a la
        DTPR, que publica el GTFS (tt@mtt.gob.cl). Para terminales, POIs o
        estaciones del Biotrén, sigue siendo útil{' '}
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
