// GTFS Gran Concepción, ficha metodológica del feed sobre el cual está
// construido el visor de buses. Es la pieza que los otros artículos del wiki
// referencian cuando explican "está en el feed" / "no está en el feed".
//
// Verificación (24-nov-2026)
// --------------------------
// Verificado con fuente primaria:
//   - Página "GTFS" de Gran Concepción en dtpr.gob.cl (publicada
//     26-sep-2025, modificada 9-dic-2025) y su adjunto granconcepcion.zip
//     (subido el 8-dic-2025, ~37,5 MB).
//   - feed_info.txt del zip: publicador "División de Transporte Público
//     Regional", feed_version "Gran Concepción20250228", vigencia declarada
//     20240101..20251231, contacto tt@mtt.gob.cl.
//   - Conteos (102 recorridos, 2.239 paraderos, 57.019 viajes, 3 calendarios
//     L/S/D, calendar_dates vacío, 1 agencia "DTPR"): leídos del zip y de
//     GTFS_CONCEPCION_SOURCE / SCHEDULE_META generados por
//     scripts/sync-gtfs-official.ts.
//   - El feed anterior del visor (Subsecretaría de Transportes, última
//     actualización 1-may-2019 según el mirror AmeriGEOSS de datos.gob.cl).
//   - Contraste con la fuente de llegadas en vivo (app Transapp, no oficial):
//     respuestas reales del 24-nov-2026 en paraderos de Concepción, Tomé,
//     San Pedro, Talcahuano y Coronel, más el cruce de paraderos y líneas.
//
// Ámbar (sin fuente primaria al cierre):
//   - Licencia de datos: la página de DTPR no declara ninguna.
//   - Cadencia de republicación: solo hay una versión publicada en dtpr.gob.cl.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  KeyValueList,
  NewsPulse,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';
import { MapLink } from '@/wiki/map-link';

const DTPR_GTFS_PAGE = 'https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/';
const DTPR_GTFS_ZIP = 'https://dtpr.gob.cl/wp-content/uploads/2025/12/granconcepcion.zip';
const DTPR_TOME_PAGE = 'https://dtpr.gob.cl/pe/tome/gtfs/';
const REPO = 'https://github.com/marcorojasb/conce.patagua.dev/blob/main';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function GtfsGranConcepcion() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado con fuente primaria (24-nov-2026).</strong>{' '}
        Archivo{' '}
        <SourceLink href={DTPR_GTFS_ZIP}>granconcepcion.zip</SourceLink>{' '}
        publicado por la DTPR en{' '}
        <SourceLink href={DTPR_GTFS_PAGE}>dtpr.gob.cl · Gran Concepción · GTFS</SourceLink>
        : versión «Gran Concepción20250228», calendario declarado del
        1-ene-2024 al 31-dic-2025. Contraste con la red que sigue en vivo
        la app de Transapp: 24-nov-2026. <strong>Pendiente</strong>: licencia
        de datos (la página no declara ninguna) y cadencia de republicación.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-24"
        items={[
          { label: 'Publicador', value: 'DTPR · Subsecretaría de Transportes' },
          { label: 'Versión', value: 'Programa del 28-feb-2025' },
          { label: 'Vigencia declarada', value: '1-ene-2024 a 31-dic-2025 (vencida)' },
          { label: 'Recorridos', value: '102 · 188 sentidos' },
          { label: 'Paraderos', value: '2.239' },
          { label: 'Viajes', value: '57.019 (día hábil + sábado + domingo)' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Es el GTFS oficial que la <strong>DTPR</strong> publica para el
            Gran Concepción en dtpr.gob.cl. Un proceso nocturno lo
            descarga y procesa; si cambió, abre una solicitud de cambios
            que se publica en el visor cuando alguien la revisa y aprueba.
          </>,
          <>
            La versión publicada es el programa del{' '}
            <strong>28-feb-2025</strong>. Su calendario declarado venció el
            31-dic-2025, pero al 24-nov-2026 sigue siendo la última
            publicación: el visor la usa como el programa oficial más
            reciente y lo dice en la ficha de cada recorrido.
          </>,
          <>
            Cubre los buses urbanos del Perímetro de Exclusión y también los
            interurbanos <strong>201 / 201-AU</strong> (Santa Juana),{' '}
            <strong>401 / 401Y / 411 / 421</strong> (Tomé) y{' '}
            <strong>302 / 304</strong> (Lota). Biotrén, Florida, Yumbel y
            los taxis colectivos quedan fuera.
          </>,
          <>
            Reemplaza al feed 2019 de la Subsecretaría de Transportes que
            usó el visor hasta nov-2026 (169 servicios, uno por letra).
          </>,
          <>
            Es un horario <strong>programado</strong>: no trae posiciones
            en vivo. Las llegadas en vivo del visor vienen de otra fuente,
            no oficial, y solo para el paradero abierto.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '8-dic-2025',
            title: 'DTPR sube el GTFS de Gran Concepción a dtpr.gob.cl',
            detail:
              'granconcepcion.zip (~37,5 MB), versión «Gran Concepción20250228». En la misma tanda sube el GTFS de Tomé.',
            source: { href: DTPR_GTFS_PAGE, label: 'dtpr.gob.cl · Gran Concepción · GTFS' },
          },
          {
            date: '24-nov-2026',
            title: 'El visor pasa al GTFS oficial DTPR',
            detail:
              'Deja el feed 2019 de la Subsecretaría y el procesamiento con sqlite. Recorridos con sus dos sentidos e interurbanos oficiales (201, 401, 302 y otros) en vez de trazados digitalizados a mano.',
            source: { href: `${REPO}/scripts/sync-gtfs-official.ts`, label: 'scripts/sync-gtfs-official.ts' },
          },
        ]}
      />

      <Section title="Qué es y por qué importa">
        <p>
          <strong>GTFS</strong> (<em>General Transit Feed Specification</em>)
          es el formato estándar de facto para describir servicios de
          transporte público en archivos abiertos. Nació en 2005 como
          colaboración entre la agencia TriMet de Portland (Oregon) y
          Google, y hoy lo administra MobilityData como especificación
          abierta. Una agencia que publica su GTFS estático habilita que
          cualquier aplicación (planificadores de viaje, visores cívicos,
          análisis académicos) lea el mismo insumo.
        </p>
        <p>
          El GTFS de Gran Concepción describe los servicios de buses que
          regula la DTPR en el área metropolitana, la mayoría bajo el{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro de Exclusión del Gran Concepción 2024
          </a>
          . Es el insumo del visor de{' '}
          <code className="font-mono">conce.patagua.dev</code> para todo lo
          que es bus: trazado de cada sentido, paraderos, horario
          programado por día de la semana y frecuencia por paradero.
        </p>
        <p>
          Lo que está en el feed entra al visor sin transcribir nada a
          mano: basta aprobar la actualización que propone el proceso
          diario. Lo que{' '}
          <em>no</em> está (Biotrén, Florida, Yumbel, colectivos) se
          documenta aparte en este wiki o llega por otra fuente citada.
        </p>
        <Sources>
          <SourceLink href="https://gtfs.org/">
            gtfs.org · especificación canónica administrada por MobilityData
          </SourceLink>
          <SourceLink href="https://en.wikipedia.org/wiki/GTFS">
            Wikipedia · General Transit Feed Specification (origen TriMet + Google 2005)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Versión vigente y vigencia">
        <KeyValueList
          items={[
            ['Publicador', 'División de Transporte Público Regional (DTPR), Subsecretaría de Transportes, MTT. Contacto declarado en el feed: tt@mtt.gob.cl.'],
            ['Dónde', <>Página <SourceLink href={DTPR_GTFS_PAGE}>dtpr.gob.cl/pe/gran-concepcion/gtfs-2</SourceLink>, archivo <SourceLink href={DTPR_GTFS_ZIP}>granconcepcion.zip</SourceLink> (subido el 8-dic-2025).</>],
            ['Versión', <><code className="font-mono">feed_version</code> «Gran Concepción20250228»: programa de operación del 28-feb-2025.</>],
            ['Vigencia declarada', <><code className="font-mono">feed_start_date</code> 1-ene-2024, <code className="font-mono">feed_end_date</code> 31-dic-2025.</>],
            ['Estado', 'Calendario formalmente vencido desde el 1-ene-2026. Al 24-nov-2026 no hay una versión posterior publicada, así que es el último programa oficial disponible.'],
            ['Cómo lo trata el visor', 'Usa los días de servicio de calendar.txt sin filtrar por fecha y muestra en la ficha de cada recorrido que el programa es del 28-feb-2025 y que su vigencia declarada terminó el 31-dic-2025.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Consecuencia práctica: cambios de recorrido, frecuencia o código
          posteriores a febrero de 2025 no aparecen en el visor hasta que
          la DTPR publique una versión nueva. Cuando cambie el archivo, la
          sincronización diaria abrirá una solicitud de cambios con los
          datos nuevos, que llegan al visor al aprobarla.
        </p>
        <Sources>
          <SourceLink href={DTPR_GTFS_PAGE}>dtpr.gob.cl · Gran Concepción · GTFS</SourceLink>
          <SourceLink href={DTPR_GTFS_ZIP}>DTPR · granconcepcion.zip (feed_info.txt)</SourceLink>
        </Sources>
      </Section>

      <Section title="Qué cubre y qué no">
        <DataTable columns={['Servicio', '¿En el feed?', 'Cómo lo muestra el visor']}>
          <tr>
            <td className="px-3 py-2 font-medium">Buses urbanos (94 recorridos)</td>
            <td className="px-3 py-2"><strong>Sí</strong></td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Trazado y paraderos de cada sentido y horario programado,
              directo del zip. Comunas: Concepción, Talcahuano, Hualpén,
              San Pedro de la Paz, Chiguayante, Hualqui y Penco/Lirquén.
              Incluye el Biobús B02.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">201 / 201-AU Santa Juana</td>
            <td className="px-3 py-2"><strong>Sí</strong></td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Licitación DTPR ELC0007, en el mismo zip que la red urbana.
              Ver{' '}
              <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201</a>
              {' · '}<MapLink route="201">en el mapa →</MapLink>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">401 / 401Y / 411 / 421 Tomé</td>
            <td className="px-3 py-2"><strong>Sí</strong></td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Perímetro de Exclusión de Tomé. La DTPR además publica un
              GTFS propio de Tomé (
              <SourceLink href={DTPR_TOME_PAGE}>tome.zip</SourceLink>
              , versión «Tomé20230308»); el visor usa el de Gran
              Concepción, que trae los mismos códigos. Ver{' '}
              <a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a>.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">302 / 304 Lota ↔ Concepción</td>
            <td className="px-3 py-2"><strong>Sí</strong></td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Por Coronel y la Ruta 160. El resto de los troncales del
              corredor sur no está. Ver{' '}
              <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">Concepción ↔ Coronel ↔ Lota</a>.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Concepción ↔ Florida · Concepción ↔ Yumbel</td>
            <td className="px-3 py-2"><strong>No</strong></td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Operadores privados sin GTFS publicado. Documentados en el
              wiki; en el mapa solo hay un pin del corredor. Ver{' '}
              <a href="/wiki/concepcion-florida" className="underline underline-offset-2">Florida</a> y{' '}
              <a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">Yumbel</a>.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Biotrén (EFE)</td>
            <td className="px-3 py-2"><strong>No</strong></td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              EFE no publica GTFS. Estaciones y vía salen de OpenStreetMap
              y los horarios, de los itinerarios oficiales de EFE vigentes
              desde el 15-jul-2026. Ver{' '}
              <a href="/wiki/biotren" className="underline underline-offset-2">Biotrén</a>.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Taxis colectivos</td>
            <td className="px-3 py-2"><strong>No</strong></td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Otro régimen legal, sin GTFS. Ver{' '}
              <a href="/wiki/taxis-colectivos-gran-concepcion" className="underline underline-offset-2">Taxis colectivos</a>.
            </td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          El feed no distingue urbanos de interurbanos. La etiqueta
          «Interurbano Santa Juana / Tomé / Lota» que muestra el visor es
          una clasificación propia, curada a mano en{' '}
          <code className="font-mono">scripts/lib/gtfs-transform.ts</code>.
        </p>
      </Section>

      <Section title="Estructura del feed">
        <p>
          GTFS estático es un zip con archivos{' '}
          <code className="font-mono">.txt</code> en formato CSV. Lo que
          trae la versión 20250228:
        </p>
        <KeyValueList
          items={[
            ['agency.txt', 'Una sola agencia, «DTPR». Los operadores no vienen como agencias: su nombre aparece al inicio del letrero de cada viaje (por ejemplo «Vía Láctea 10A - Centinela»). El visor lo toma de ahí.'],
            [
              'routes.txt',
              <>
                102 recorridos, todos <code className="font-mono">route_type=3</code>{' '}
                (bus). El <code className="font-mono">route_short_name</code>{' '}
                junta dos letras: <strong>10AN</strong> es el 10A en un
                sentido y el 10N en el otro. Los interurbanos usan su
                número (201, 401, 302…).
              </>,
            ],
            [
              'trips.txt',
              <>
                57.019 viajes, con <code className="font-mono">direction_id</code>{' '}
                0/1, <code className="font-mono">shape_id</code> y letrero
                (<code className="font-mono">trip_headsign</code>). Cada viaje
                tiene un solo calendario: 29.240 corren de lunes a viernes,
                14.405 el sábado y 13.374 el domingo, unas 174 mil salidas
                en una semana. La primera letra del código es el sentido 0 y
                la segunda el sentido 1. 16 recorridos traen un solo
                sentido.
              </>,
            ],
            ['stops.txt', '2.239 paraderos con coordenadas. Respecto del feed 2019 desaparecieron 449 identificadores (por ejemplo 1506365) y aparecieron 578.'],
            ['stop_times.txt', 'La tabla grande: ~4,5 millones de filas (~312 MB sin comprimir). Solo algunas paradas traen hora (timepoint); el visor ignora las horas vacías en vez de leerlas como 00:00.'],
            ['calendar.txt', 'Tres calendarios: L (lunes a viernes), S (sábado) y D (domingo), todos del 1-ene-2024 al 31-dic-2025.'],
            ['calendar_dates.txt', 'Vacío: el feed no declara festivos ni excepciones.'],
            ['shapes.txt', 'Polilínea de cada trazado, lo que el visor dibuja sobre el mapa.'],
            ['feed_info.txt', 'Publicador, versión, vigencia declarada y contacto.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://gtfs.org/documentation/schedule/reference/">
            gtfs.org · referencia formal de GTFS Schedule
          </SourceLink>
          <SourceLink href={DTPR_GTFS_ZIP}>DTPR · granconcepcion.zip</SourceLink>
        </Sources>
      </Section>

      <Section title="Cómo lo usa este visor">
        <p>
          Un solo script,{' '}
          <code className="font-mono">scripts/sync-gtfs-official.ts</code>{' '}
          (<code className="font-mono">npm run sync:gtfs</code>), descarga
          el zip oficial y regenera todos los archivos{' '}
          <code className="font-mono">src/data/gtfs-*.generated.ts</code>.
          No usa sqlite ni binarios del sistema: lee el zip en streaming con
          Node.
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Pipeline
          </div>
          <ol className="mt-2 ml-5 list-decimal space-y-1 text-[12px]">
            <li>
              Descarga <code className="font-mono">granconcepcion.zip</code>{' '}
              desde dtpr.gob.cl (o lee un zip local con{' '}
              <code className="font-mono">GTFS_ZIP_PATH</code>). Guarda una
              copia en <code className="font-mono">.cache/gtfs/</code> y no
              la vuelve a bajar si el servidor informa el mismo archivo.
            </li>
            <li>
              Por cada recorrido arma <strong>sus dos sentidos</strong>: la
              secuencia de paraderos más común de cada{' '}
              <code className="font-mono">direction_id</code>, su shape y su
              letrero. Del letrero salen la variante (10A, 10N) y el
              destino. En tres recorridos el letrero viene cruzado entre
              sentidos y el script lo corrige, solo cuando viene cruzado
              (ver Limitaciones).
            </li>
            <li>
              Simplifica cada trazado con Ramer-Douglas-Peucker (tolerancia
              ≈0,00008°, ~9 m en Concepción;{' '}
              <code className="font-mono">scripts/lib/simplify.ts</code>).
            </li>
            <li>
              Horarios: por recorrido, sentido y día de la semana, cada viaje
              se guarda como salida y duración. Además deja los tramos con
              servicio de cada día, que el visor usa para decir si un
              recorrido opera ahora.
            </li>
            <li>
              Por paradero: pasadas por hora (bloque de frecuencia) y, por
              recorrido, letrero y día, la primera y la última pasada, el
              intervalo mediano y el número de pasadas.
            </li>
            <li>
              Escribe paraderos (carga inmediata), recorridos (carga
              diferida) y horarios (se cargan al abrir una ficha o encender
              Servicios en curso), y después recalcula la grilla de
              cobertura.
            </li>
          </ol>
        </div>
        <p>
          Un workflow de GitHub Actions corre la sincronización todos los
          días a las 06:30 UTC y abre un pull request si el feed cambió. Si
          dtpr.gob.cl no responde o el zip viene roto, los datos anteriores
          quedan como estaban.
        </p>
        <p className="text-[12px] text-muted-foreground">
          La versión, la vigencia declarada, la URL, el sha256 y la fecha
          de descarga quedan en{' '}
          <code className="font-mono">GTFS_CONCEPCION_SOURCE</code>. El
          panel de fuentes del visor y la ficha de cada recorrido muestran
          la versión, la vigencia y el enlace al archivo.
        </p>
        <Sources>
          <SourceLink href={`${REPO}/scripts/sync-gtfs-official.ts`}>
            scripts/sync-gtfs-official.ts
          </SourceLink>
          <SourceLink href={`${REPO}/.github/workflows/sync-data.yml`}>
            .github/workflows/sync-data.yml (sincronización diaria)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Licencia">
        <p>
          Ni la página de la DTPR ni el zip declaran una licencia de datos.
          El visor usa el feed como información pública del Estado,
          atribuida a la DTPR, y enlaza el archivo original. El feed 2019
          sí estaba catalogado en datos.gob.cl, cuya licencia por defecto
          es CC BY 4.0; esa licencia no se puede extender sin más a la
          publicación de dtpr.gob.cl.
        </p>
        <PendingBanner>
          <strong>Licencia pendiente.</strong> Quien quiera redistribuir el
          feed debería confirmar los términos con la DTPR. El contenido de
          este wiki es CC BY 4.0; eso no cambia la licencia del feed.
        </PendingBanner>
      </Section>

      <Section title="Limitaciones conocidas">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Programa vencido.</strong> El calendario declarado
            terminó el 31-dic-2025. Lo que cambió en la calle después de
            febrero de 2025 no está.
          </li>
          <li>
            <strong>Sin festivos.</strong> <code className="font-mono">calendar_dates.txt</code>{' '}
            viene vacío: un feriado se muestra con el horario normal de ese
            día de la semana.
          </li>
          <li>
            <strong>Algunas frecuencias parecen nominales.</strong> Por
            ejemplo, el feed programa la 201 con una salida cada 5 min de
            05:38 a 23:53 en día hábil y viajes de ~2 h 45 min, más de lo
            que permite una flota de 23 buses. La hipótesis editorial es
            que parte del programa declara frecuencias máximas y no salidas
            reales.
          </li>
          <li>
            <strong>Paraderos lejos de su trazado.</strong> En la versión
            20250228 los paraderos 39514 (63FH, 63LB) y 40344 (70F) del
            sentido 1 quedan a más de 100 m de su shape. El script los
            reporta en cada sincronización.
          </li>
          <li>
            <strong>Letreros cruzados.</strong> En 02AD y 02KP el letrero
            de cada sentido trae la letra de la variante del otro; en 23BS
            también el destino: el sentido 0 termina en Terminal Collao
            pero dice «23S - Av. Michaihue». La sincronización los corrige
            (<code className="font-mono">correctTripHeadsign</code> en{' '}
            <code className="font-mono">scripts/lib/gtfs-transform.ts</code>)
            solo cuando vienen cruzados, así que una versión nueva ya
            corregida pasa tal cual. Evidencia: el orden de letras del
            código, los paraderos terminales de cada sentido y la red que
            publica la app de Transapp para la DTPR.
          </li>
          <li>
            <strong>La red de 2026 ya es otra en algunos servicios.</strong>{' '}
            La fuente en vivo sigue 11 servicios que no calzan con esta
            versión (02H, 02L, 20F, 20N, 30H, 30Z, 50SY, 70FY, 70HY, 80B,
            80V). El visor no muestra diez de ellos como recorrido; la 02L
            solo aparece como la variante 02L-Y (2 viajes en día hábil),
            que la fuente no nombra así.
          </li>
          <li>
            <strong>Sin tiempo real oficial.</strong> El feed es estático.
            Las llegadas en vivo del visor vienen de la fuente que usa la
            app de Transapp, que no es oficial, y solo se consultan para el
            paradero abierto (ver la sección siguiente).
          </li>
          <li>
            <strong>Códigos de paradero.</strong> El{' '}
            <code className="font-mono">stop_code</code> puede no calzar con
            el letrero físico; la marcación de paraderos del Perímetro
            sigue en curso.
          </li>
        </ul>
      </Section>

      <Section title="Llegadas en vivo y contraste con la operación 2026">
        <p>
          El GTFS dice qué debería pasar; no dice dónde va cada micro. Para
          eso el visor usa, solo en el paradero que abres, la fuente que
          consume la app de Transapp para la DTPR. <strong>No es oficial ni
          está documentada</strong>: puede cambiar, caerse o responder vacía
          sin aviso. La consulta pasa por una intermediaria del propio visor
          (<code className="font-mono">/api/stop-arrivals</code>) que guarda
          cada paradero 25 s y no hace más de 30 consultas por minuto a la
          fuente.
        </p>
        <KeyValueList
          items={[
            ['Qué trae', 'Por cada micro: línea, sentido, minutos, posición GPS, patente y distancia al paradero en línea recta (no por la ruta). Una línea sin GPS llega como «sin datos en vivo · pasa cada N».'],
            ['Paraderos', 'El código de la fuente es «P» más el stop_id oficial: calzan 2.202 de los 2.239 paraderos del GTFS, 6 más tienen otro nombre y 31 no existen en la fuente.'],
            ['Líneas', 'La fuente nombra cada sentido por separado («20A», «401I»). 183 de los 188 sentidos oficiales tienen su par. La 302 y la 304 (Lota) no se siguen en vivo.'],
            ['Servicios sin par en el GTFS', '02H, 02L, 20F, 20N, 30H, 30Z, 50SY, 70FY, 70HY, 80B y 80V: los corre la red de 2026 y no están con ese nombre en el programa del 28-feb-2025. La 02L solo figura como la variante 02L-Y (2 viajes en día hábil).'],
            ['Ubicación de paraderos', 'Las coordenadas de la fuente coinciden con las oficiales: mediana 3 m y 97% a menos de 20 m. Es un respaldo independiente de la ubicación de los paraderos del GTFS.'],
            ['Comprobado', 'Respuestas reales del 24-nov-2026 en paraderos de Concepción, Tomé, San Pedro de la Paz, Talcahuano y Coronel.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Las micros de <strong>Servicios en curso</strong> son otra cosa:
          una estimación de dónde debería ir cada viaje según el horario
          programado del GTFS, nunca GPS. El visor las dibuja y rotula como
          estimación.
        </p>
      </Section>

      <CollapsibleSection title="Comparación con otros feeds chilenos">
        <DataTable columns={['Ciudad / red', 'Publicador', 'Cadencia conocida', 'GTFS-RT', 'Estado verif.']}>
          <tr>
            <td className="px-3 py-2 font-medium">Santiago · RED Metropolitana de Movilidad</td>
            <td className="px-3 py-2 text-[12px]">DTPM (dtpm.cl)</td>
            <td className="px-3 py-2 text-[12px]">
              Varias actualizaciones al año, URL canónica versionada por
              fecha (<code className="font-mono">GTFS_YYYYMMDD.zip</code>)
            </td>
            <td className="px-3 py-2 text-[12px]">Parcial · Metro publica GTFS-RT propio</td>
            <td className="px-3 py-2 text-[12px]"><strong>Verificado</strong></td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Gran Concepción</td>
            <td className="px-3 py-2 text-[12px]">DTPR vía dtpr.gob.cl</td>
            <td className="px-3 py-2 text-[12px]">Una versión publicada (programa 28-feb-2025, subida 8-dic-2025); antes, feed 2019 en datos.gob.cl</td>
            <td className="px-3 py-2 text-[12px]">No oficial</td>
            <td className="px-3 py-2 text-[12px]"><strong>Verificado</strong> (24-nov-2026)</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Gran Valparaíso · TMV</td>
            <td className="px-3 py-2 text-[12px]">Operadores (Viña Bus, Trolebuses, Buses Gran Valparaíso, otros) agregados vía transitland</td>
            <td className="px-3 py-2 text-[12px]">Pendiente</td>
            <td className="px-3 py-2 text-[12px]">Pendiente</td>
            <td className="px-3 py-2 text-[12px]">Ámbar</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Antofagasta · TransAntofagasta</td>
            <td className="px-3 py-2 text-[12px]">Catalogado en datos.gob.cl, archivado en transitland</td>
            <td className="px-3 py-2 text-[12px]">Pendiente</td>
            <td className="px-3 py-2 text-[12px]">Pendiente</td>
            <td className="px-3 py-2 text-[12px]">Ámbar</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Temuco - Padre Las Casas</td>
            <td className="px-3 py-2 text-[12px]">MTT vía datos.gob.cl (32 microbuses + 1 tren Temuco-Victoria)</td>
            <td className="px-3 py-2 text-[12px]">Pendiente</td>
            <td className="px-3 py-2 text-[12px]">Pendiente</td>
            <td className="px-3 py-2 text-[12px]">Ámbar</td>
          </tr>
        </DataTable>
        <Sources>
          <SourceLink href="https://www.transit.land/feeds/f-66jc-transantiago~metrodesantiago">
            Transitland · feed Santiago (RED + Metro)
          </SourceLink>
          <SourceLink href="https://www.transit.land/feeds/f-67vc-transantofagasta">
            Transitland · feed TransAntofagasta
          </SourceLink>
          <SourceLink href="https://www.transit.land/feeds/f-66jh-vinabussa~trolebuseschilesa~busesdelgranvalparaisosa~topt">
            Transitland · feed Gran Valparaíso (multioperador)
          </SourceLink>
          <SourceLink href="https://www.dtpm.cl/index.php/noticias/gtfs-vigente">
            DTPM · GTFS vigente Santiago
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Cómo contribuir">
        <p>
          Si encuentras un error en el feed (un paradero corrido, un
          recorrido que ya no existe, un horario que no calza con la
          operación real), hay tres caminos:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>DTPR</strong>, que publica el feed: contacto en{' '}
            <SourceLink href="https://dtpr.gob.cl/">dtpr.gob.cl</SourceLink>{' '}
            o al correo que declara el propio feed (tt@mtt.gob.cl).
          </li>
          <li>
            <strong>MTT Consultas Ciudadanas</strong>{' '}
            (<SourceLink href="https://www.mtt.gob.cl/">mtt.gob.cl</SourceLink>)
            para temas que cruzan jurisdicciones.
          </li>
          <li>
            <strong>Este wiki</strong>, si lo que tienes es información de
            campo (foto de letrero, horario observado) que sirva mientras el
            feed no se corrige. Abre un pull request al{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/tree/main/src/wiki/articles">
              repositorio del wiki
            </SourceLink>
            .
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Los reportes con foto y coordenadas, o con el{' '}
          <code className="font-mono">stop_id</code> exacto del feed, se
          procesan mucho más rápido que los descriptivos.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Cronología">
        <Timeline
          items={[
            {
              date: '2005',
              event: 'TriMet (Portland, Oregon) y Google publican la primera versión de la especificación GTFS.',
              source: { href: 'https://en.wikipedia.org/wiki/GTFS', label: 'Wikipedia · GTFS' },
            },
            {
              date: '1-may-2019',
              event: 'Última actualización conocida del dataset gtfs-gran-concepcion de la Subsecretaría de Transportes en datos.gob.cl. Es el feed que usó el visor hasta nov-2026: 169 servicios, uno por letra.',
              source: { href: 'https://data.amerigeoss.org/dataset/gtfs-gran-concepcion', label: 'AmeriGEOSS · mirror datos.gob.cl' },
            },
            {
              date: '1-ene-2024',
              event: 'Inicia el Perímetro de Exclusión del Gran Concepción 2024. Es también el inicio de la vigencia declarada del feed actual.',
            },
            {
              date: '28-feb-2025',
              event: 'Fecha del programa de operación que trae el feed vigente («Gran Concepción20250228»).',
              source: { href: DTPR_GTFS_ZIP, label: 'DTPR · feed_info.txt' },
            },
            {
              date: '8-dic-2025',
              event: 'La DTPR sube granconcepcion.zip y tome.zip a dtpr.gob.cl.',
              source: { href: DTPR_GTFS_PAGE, label: 'dtpr.gob.cl · GTFS' },
            },
            {
              date: '31-dic-2025',
              event: 'Termina la vigencia declarada del feed. No se publica una versión nueva.',
            },
            {
              date: '24-nov-2026',
              event: 'El visor reemplaza el feed 2019 por el GTFS oficial DTPR, con sincronización diaria desde dtpr.gob.cl. Los interurbanos 201, 401, 411 y 421 dejan de dibujarse desde OpenStreetMap y se suman 201-AU, 401Y, 302 y 304.',
              source: { href: `${REPO}/scripts/sync-gtfs-official.ts`, label: 'sync-gtfs-official.ts' },
            },
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción 2024
            </a>
            {', '}el régimen de la mayoría de los recorridos del feed.
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Recorridos interurbanos
            </a>
            {', '}cuáles están en el feed y cuáles no.
          </li>
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a>,{' '}
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201 Santa Juana</a>,{' '}
            <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">Concepción ↔ Coronel ↔ Lota</a>,{' '}
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción ↔ Florida</a>,{' '}
            <a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">Concepción ↔ Yumbel</a>
            {', '}los corredores, con y sin GTFS.
          </li>
          <li>
            <a href="/wiki/biotren" className="underline underline-offset-2">Biotrén</a>
            {', '}fuera del feed; horarios desde los itinerarios de EFE.
          </li>
          <li>
            <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">SEREMITT Biobío y la DTPR</a>
            {', '}la institución que publica el feed.
          </li>
          <li>
            <a href="/wiki/openstreetmap-fuente-visor" className="underline underline-offset-2">OpenStreetMap como fuente del visor</a>
            {', '}lo que el feed no cubre.
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Licencia de datos del feed publicado en dtpr.gob.cl.</li>
          <li>Cadencia de republicación y si habrá una versión con calendario 2026.</li>
          <li>Si el programa de algunos servicios (201, entre otros) declara frecuencias máximas en vez de salidas reales.</li>
          <li>Estado de un GTFS-Realtime oficial para Gran Concepción.</li>
          <li>Si EFE publicará un GTFS del Biotrén.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía de cierre: consulta a la DTPR (tt@mtt.gob.cl) o solicitud por
          Ley de Transparencia.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Fuentes">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href={DTPR_GTFS_PAGE}>DTPR · Gran Concepción · GTFS (página)</SourceLink>
          </li>
          <li>
            <SourceLink href={DTPR_GTFS_ZIP}>DTPR · granconcepcion.zip (versión Gran Concepción20250228)</SourceLink>
          </li>
          <li>
            <SourceLink href={DTPR_TOME_PAGE}>DTPR · Tomé · GTFS (tome.zip, versión Tomé20230308)</SourceLink>
          </li>
          <li>
            <SourceLink href="https://data.amerigeoss.org/dataset/gtfs-gran-concepcion">
              AmeriGEOSS · mirror de datos.gob.cl con el feed 2019
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://gtfs.org/documentation/schedule/reference/">
              gtfs.org · referencia formal de GTFS Schedule
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://en.wikipedia.org/wiki/GTFS">Wikipedia · General Transit Feed Specification</SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.mtt.gob.cl/">MTT · Ministerio de Transportes y Telecomunicaciones</SourceLink>
          </li>
          <li>
            Scripts del repositorio:{' '}
            <SourceLink href={`${REPO}/scripts/sync-gtfs-official.ts`}>sync-gtfs-official.ts</SourceLink>
            ,{' '}
            <SourceLink href={`${REPO}/scripts/lib/gtfs-transform.ts`}>gtfs-transform.ts</SourceLink>
            ,{' '}
            <SourceLink href={`${REPO}/scripts/lib/simplify.ts`}>simplify.ts (RDP)</SourceLink>
            .
          </li>
        </ul>
      </CollapsibleSection>
    </div>
  );
}
