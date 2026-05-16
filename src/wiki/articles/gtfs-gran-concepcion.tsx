// GTFS Gran Concepción — ficha metodológica del feed sobre el cual está
// construido el visor urbano. Es la pieza que los otros artículos del wiki
// referencian cuando explican "está en el feed" / "no está en el feed".
//
// Verificación
// ------------
// Verificado con fuente:
//   - Existencia del dataset "GTFS Gran Concepción" en el Portal de Datos
//     Abiertos del Estado (datos.gob.cl) — confirmado por catálogo
//     amerigeoss (mirror oficial de datos.gob.cl) y resultados de búsqueda
//     del portal. La instancia archivada más antigua que pudo trazarse
//     declara última actualización 1-may-2019; el archivo más reciente no
//     pudo abrirse al momento de escribir (datos.gob.cl respondiendo
//     HTTP 503).
//   - Estructura del feed (agency / routes / trips / stops / stop_times /
//     calendar / shapes): especificación gtfs.org, estándar internacional.
//   - Pipeline interno del visor: scripts/generate-gtfs-concepcion.ts
//     (descarga simplificación shapes RDP, split en gtfs-stops.generated.ts +
//     gtfs-bus-routes.generated.ts) y scripts/extract-gtfs-schedule.ts.
//   - Comparación con feed Santiago (RED Metropolitana de Movilidad,
//     dtpm.cl): verificado vía transitland — feed activo, publicación
//     periódica (varias actualizaciones al año), URL canónica con
//     versionado por fecha (GTFS_YYYYMMDD.zip).
//   - Tomé sin GTFS, 201 sin GTFS, Yumbel/Florida sin GTFS, Biotrén
//     procesado aparte: todo confirmado por los artículos hermanos del
//     wiki (concepcion-tome.tsx, ruta-201-santa-juana.tsx, biotren-
//     extensiones.tsx) y por el comportamiento del propio
//     scripts/generate-gtfs-concepcion.ts (filtra route_type=3, sólo bus).
//
// Ámbar (sin fuente primaria al cierre):
//   - Licencia exacta del feed (¿CC BY 4.0? Es lo más probable porque el
//     conjunto del catálogo datos.gob.cl declara CC BY 4.0 por defecto,
//     pero no se pudo abrir la ficha al momento de escribir).
//   - Cadencia formal de republicación post-perímetro 2024 y post-refuerzos
//     mayo 2025.
//   - Publicador formal de la versión vigente: ¿Subsecretaría de
//     Transportes a secas, DTPR Biobío específicamente, o el repositorio
//     de candidatos del backend operacional?

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function GtfsGranConcepcion() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <PendingBanner>
        <strong>Verificado parcialmente.</strong> Existencia del dataset en
        el Portal de Datos Abiertos del Estado (datos.gob.cl) y formato
        GTFS estándar: confirmados. <strong>Pendiente</strong> de
        verificación primaria al cierre de esta edición: licencia exacta
        del feed, cadencia formal de republicación, identidad del
        publicador vigente (Subsecretaría de Transportes / DTPR Biobío /
        repositorio candidato del backend operacional). El portal
        datos.gob.cl no respondió en los intentos de fetch al cierre — la
        ficha se actualiza cuando vuelva.
      </PendingBanner>

      <Section title="Qué es y por qué importa">
        <p>
          <strong>GTFS</strong> (<em>General Transit Feed Specification</em>)
          es el formato estándar de facto para describir servicios de
          transporte público en archivos abiertos. Nació en 2005 como
          colaboración entre la agencia TriMet de Portland (Oregon) y
          Google, y hoy lo administra MobilityData como especificación
          abierta. Una agencia que publica su GTFS estático habilita que
          cualquier aplicación —planificadores de viajes, visores cívicos,
          análisis académicos— lea el mismo input.
        </p>
        <p>
          El feed <strong>GTFS Gran Concepción</strong> es el archivo que
          documenta los servicios de buses urbanos que operan bajo el{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro de Exclusión del Gran Concepción 2024
          </a>
          . Es el insumo único del visor de{' '}
          <code className="font-mono">conce.patagua.dev</code> para todo lo
          relacionado con micros urbanas: trazado, paraderos, frecuencias
          programadas y horarios.
        </p>
        <p>
          Su importancia no es técnica sino política: lo que está en el
          feed entra al visor sin trabajo manual. Lo que <em>no</em> está
          requiere digitalización ad-hoc desde OpenStreetMap, prensa
          regional o trabajo en terreno — y por eso ocupa los demás
          artículos de este wiki.
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

      <Section title="Qué cubre y qué no">
        <p>
          El feed describe los servicios de buses urbanos del área
          metropolitana del Gran Concepción. Su alcance está acotado al
          régimen del Perímetro de Exclusión 2024 — 7 comunas, 36 unidades
          de negocio, 35 empresas. Servicios fuera de ese régimen no
          aparecen en el ZIP y por lo tanto no aparecen en el visor sin
          integración manual.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Servicio</th>
                <th className="px-3 py-2 font-medium">¿En el feed?</th>
                <th className="px-3 py-2 font-medium">Cómo lo muestra el visor</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Buses urbanos Gran Concepción (PE 2024)</td>
                <td className="px-3 py-2"><strong>Sí</strong></td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Trazados, paraderos y horarios programados servidos
                  directamente desde el ZIP. Comunas: Concepción,
                  Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante,
                  Penco/Lirquén, Coronel, Lota.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  Servicios 401 / 411 / 421 Tomé
                </td>
                <td className="px-3 py-2"><strong>No</strong></td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Pertenecen al <em>Perímetro de Exclusión de Tomé</em>
                  {' '}(decreto MTT jul-2016, operativo mar-2022) y no
                  comparten feed. El visor los integra nativamente con
                  trazado digitalizado desde OSM. Ver{' '}
                  <a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a>.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Ruta 201 Santa Juana</td>
                <td className="px-3 py-2"><strong>No</strong></td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Licitación DTPR ELC0007 separada (2024). Sin GTFS
                  publicado por el operador. El visor digitaliza el
                  trazado desde OSM. Ver{' '}
                  <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201</a>.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Concepción ↔ Yumbel</td>
                <td className="px-3 py-2"><strong>No</strong></td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Corredor privado puro, sin licitación DTPR. Cuatro
                  operadores sin obligación de publicar GTFS. Documentado
                  en el wiki, no graficado en el visor. Ver{' '}
                  <a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">Concepción ↔ Yumbel</a>.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Concepción ↔ Florida</td>
                <td className="px-3 py-2"><strong>No</strong></td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Troncal con cuatro operadores privados más capas
                  subsidiadas nuevas (2025) sin GTFS. Igual estado que
                  Yumbel. Ver{' '}
                  <a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción ↔ Florida</a>.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Biotrén (EFE Trenes Metropolitanos)</td>
                <td className="px-3 py-2"><strong>No</strong> (feed aparte)</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Sistema de EFE bajo otra gobernanza de datos. El visor
                  lo procesa por{' '}
                  <code className="font-mono">scripts/fetch-biotren.ts</code>{' '}
                  y <code className="font-mono">fetch-biotren-track.ts</code>{' '}
                  consumiendo OpenStreetMap (Overpass). Ver{' '}
                  <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">Biotrén y sus extensiones</a>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Hipótesis editorial: el alcance del feed sigue al régimen
          regulatorio del Perímetro de Exclusión, no a la unidad
          geográfica metropolitana. Por eso los corredores satélite
          (Tomé, Santa Juana, Florida, Yumbel) quedan fuera y requieren
          tratamiento aparte aunque comparten urbe.
        </p>
      </Section>

      <Section title="Estructura del feed">
        <p>
          GTFS estático es un ZIP con varios archivos{' '}
          <code className="font-mono">.txt</code> en formato CSV. El feed
          Gran Concepción incluye al menos los archivos obligatorios y los
          opcionales que el visor consume:
        </p>
        <KeyValueList
          items={[
            [
              'agency.txt',
              'Operadores (las 35 empresas del Perímetro de Exclusión, con su agency_id, nombre comercial y URL si declaran).',
            ],
            [
              'routes.txt',
              <>
                Una fila por servicio (<code className="font-mono">route_id</code>,{' '}
                <code className="font-mono">route_short_name</code>{' '}
                ej. "17M", "30B", "62H";{' '}
                <code className="font-mono">route_long_name</code> con el
                trayecto descriptivo;{' '}
                <code className="font-mono">route_type=3</code> para bus
                urbano). El visor sólo levanta <code className="font-mono">route_type=3</code>.
              </>,
            ],
            [
              'trips.txt',
              <>
                Una fila por viaje programado (<code className="font-mono">trip_id</code>{' '}
                único, asociado a un <code className="font-mono">route_id</code>{' '}
                y a un <code className="font-mono">shape_id</code> que da
                la traza geométrica, además del{' '}
                <code className="font-mono">service_id</code> que indica
                qué días opera).
              </>,
            ],
            [
              'stops.txt',
              <>
                Paraderos con identificador y coordenadas
                (<code className="font-mono">stop_id</code>,
                {' '}<code className="font-mono">stop_code</code>{' '}
                opcional para el letrero físico,{' '}
                <code className="font-mono">stop_name</code>,{' '}
                <code className="font-mono">stop_lat</code> /
                {' '}<code className="font-mono">stop_lon</code>).
              </>,
            ],
            [
              'stop_times.txt',
              'La tabla más grande del feed: una fila por (viaje, paradero) con la hora programada de paso. Es la fuente de las frecuencias horarias que el visor calcula por paradero.',
            ],
            [
              'calendar.txt',
              'Máscara de 7 días de la semana por service_id (qué días aplica un patrón de operación).',
            ],
            [
              'calendar_dates.txt',
              'Excepciones al calendar (festivos, refuerzos puntuales). Opcional pero típicamente presente.',
            ],
            [
              'shapes.txt',
              'Polilínea de cada trazado de viaje en coordenadas geográficas — lo que el visor renderiza como recorrido sobre el mapa Leaflet.',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://gtfs.org/documentation/schedule/reference/">
            gtfs.org · referencia formal de GTFS Schedule
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cómo lo usa este visor">
        <p>
          El feed alimenta dos productos generados del repositorio:{' '}
          <code className="font-mono">src/data/gtfs-bus-routes.generated.ts</code>{' '}
          (las rutas con polilínea) y{' '}
          <code className="font-mono">src/data/gtfs-stops.generated.ts</code>{' '}
          (los paraderos). Ambos archivos son generados por
          {' '}<code className="font-mono">scripts/generate-gtfs-concepcion.ts</code>{' '}
          a partir de una base SQLite local con el feed importado. El
          horario programado va a un archivo aparte por peso de bundle.
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Pipeline simplificado
          </div>
          <ol className="mt-2 ml-5 list-decimal space-y-1 text-[12px]">
            <li>
              Descarga del ZIP GTFS desde el publicador →{' '}
              <code className="font-mono">.sqlite</code> local (paso
              externo al repo, hoy hecho a mano contra una base{' '}
              <code className="font-mono">gran_concepcion_candidate.sqlite</code>).
            </li>
            <li>
              <code className="font-mono">npm run sync:gtfs-concepcion</code>{' '}
              lee las tablas <code className="font-mono">routes</code>,
              {' '}<code className="font-mono">trips</code>,
              {' '}<code className="font-mono">stop_times</code>,
              {' '}<code className="font-mono">shapes</code> vía
              {' '}<code className="font-mono">sqlite3 -json</code>.
            </li>
            <li>
              Selecciona un <strong>viaje representativo por ruta</strong>{' '}
              (el que tiene más paradas, desempate por{' '}
              <code className="font-mono">trip_id</code>) y arma el
              trazado desde <code className="font-mono">shapes.txt</code> —
              si no hay shape, cae a la secuencia de paraderos.
            </li>
            <li>
              Aplica <strong>simplificación Ramer-Douglas-Peucker</strong>{' '}
              con tolerancia ≈0,00008° (~9 m a la latitud de Concepción) —
              recorta entre 80% y 95% de los vértices sin pérdida visible
              al zoom urbano. Implementado en{' '}
              <code className="font-mono">scripts/lib/simplify.ts</code>.
            </li>
            <li>
              Filtra <code className="font-mono">route_type=3</code>{' '}
              (sólo bus urbano), normaliza el color hex de la ruta cuando
              está declarado, y arma{' '}
              <code className="font-mono">BusRoute[]</code> +{' '}
              <code className="font-mono">Paradero[]</code> tipados.
            </li>
            <li>
              Escribe dos archivos generados para que el visor{' '}
              <em>lazy-load</em> las rutas pesadas (con geometría) sin
              bloquear el primer render — los paraderos sí van eager
              porque el detalle de paradero los necesita al instante.
            </li>
          </ol>
        </div>
        <p>
          El horario programado se procesa aparte con{' '}
          <code className="font-mono">scripts/extract-gtfs-schedule.ts</code>{' '}
          (<code className="font-mono">npm run sync:gtfs-schedule</code>):
          de <code className="font-mono">stop_times.txt</code> +{' '}
          <code className="font-mono">calendar.txt</code> extrae, por
          ruta, la lista de viajes diarios codificados como{' '}
          <code className="font-mono">[startMinutosDesdeMedianoche, duracionMinutos]</code>.
          Esa tabla pesa ~50 KB gz y se carga sólo cuando el usuario
          enciende la capa <em>Buses simulados</em>.
        </p>
        <p>
          La frecuencia por paradero (el bloque <em>Frecuencia GTFS</em>{' '}
          de la ficha de paradero) la calcula{' '}
          <code className="font-mono">scripts/extract-stop-frequency.ts</code>,
          contando salidas por hora desde la misma tabla.
        </p>
      </Section>

      <Section title="Cadencia y publicador">
        <p>
          El feed se publica en el <strong>Portal de Datos Abiertos del
          Estado</strong> (<code className="font-mono">datos.gob.cl</code>)
          como dataset{' '}
          <code className="font-mono">gtfs-gran-concepcion</code>. La
          organización publicadora referenciada en el catálogo es la{' '}
          <strong>Subsecretaría de Transportes</strong>, dependencia
          territorial del MTT. La operación regional la lleva la{' '}
          <strong>División de Transporte Público Regional (DTPR)</strong>,
          que es quien gestiona el régimen del Perímetro de Exclusión y
          la app Red Regional (más de 25.000 descargas durante la marcha
          blanca del Perímetro 2024 según comunicaciones del MTT).
        </p>
        <PendingBanner>
          <strong>Cadencia formal pendiente.</strong> La instancia
          archivada más antigua del catálogo declara una actualización
          fechada el 1 de mayo de 2019. Después de eso hay republicaciones
          que no pueden datarse al cierre porque{' '}
          <code className="font-mono">datos.gob.cl</code> respondió HTTP 503
          al fetch. Como referencia: el feed equivalente de Santiago
          (DTPM · RED Metropolitana de Movilidad) republica con varias
          versiones al año y mantiene un URL canónico versionado por
          fecha (<code className="font-mono">GTFS_YYYYMMDD.zip</code>).
          Es plausible que el feed Concepción siga la misma convención,
          sin verificación primaria al cierre.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://datos.gob.cl/dataset/gtfs-gran-concepcion">
            datos.gob.cl · dataset gtfs-gran-concepcion (HTTP 503 al cierre)
          </SourceLink>
          <SourceLink href="https://data.amerigeoss.org/dataset/gtfs-gran-concepcion">
            AmeriGEOSS · mirror del catálogo datos.gob.cl
          </SourceLink>
          <SourceLink href="https://transformacion.dtpr.cl/">
            DTPR · División de Transporte Público Regional
          </SourceLink>
          <SourceLink href="https://www.dtpm.cl/index.php/noticias/gtfs-vigente">
            DTPM Santiago · referencia comparativa de cadencia de publicación
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Licencia">
        <p>
          El Portal de Datos Abiertos del Estado declara como licencia por
          defecto{' '}
          <strong>Creative Commons Atribución 4.0 Internacional (CC BY 4.0)</strong>{' '}
          para los datasets publicados por organismos del Estado. El
          dataset GTFS Gran Concepción se publica en ese mismo catálogo,
          por lo que la licencia operativa razonable de asumir es CC BY
          4.0 — atribución a la Subsecretaría de Transportes / DTPR como
          publicadora.
        </p>
        <PendingBanner>
          <strong>Verificación textual de licencia pendiente.</strong> El
          campo "Licencia" de la ficha del dataset en datos.gob.cl no
          pudo capturarse al cierre por HTTP 503. Cualquier uso productivo
          o redistribución del feed debe verificar la licencia exacta en
          la ficha original antes. El wiki marca este artículo como CC BY
          4.0 (su propio contenido) — no extiende esa licencia al feed
          upstream.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://datos.gob.cl/">
            datos.gob.cl · Portal de Datos Abiertos del Estado
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Limitaciones conocidas">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Sin GTFS-Realtime.</strong> El feed Concepción es{' '}
            <em>estático</em>: describe el horario programado, no la
            posición de los buses en tiempo real ni los retrasos. Por
            eso el visor renderiza viajes <em>simulados</em> sobre el
            horario teórico, no posiciones reales. DTPR abrió en 2024
            una "Convocatoria de acceso a datos GTFS-RT" para empezar a
            cubrir esa brecha, sin fecha pública de implementación al
            cierre.
          </li>
          <li>
            <strong>Variantes ida-vuelta no diferenciadas explícitamente.</strong>{' '}
            El visor selecciona un viaje representativo por{' '}
            <code className="font-mono">route_id</code> (el de más
            paradas). Si una ruta modela "ida" y "vuelta" como dos{' '}
            <code className="font-mono">route_id</code> separados aparecen
            como dos líneas en el mapa; si las modela como un solo
            <code className="font-mono">route_id</code> con dos{' '}
            <code className="font-mono">direction_id</code>, sólo se ve
            una. Cuál esquema usa el feed Gran Concepción está
            pendiente de revisión documental.
          </li>
          <li>
            <strong>Códigos de paradero (<code className="font-mono">stop_code</code>) pueden no calzar con el letrero físico</strong>{' '}
            del paradero en la calle. El proceso de marcación física de
            paraderos del Perímetro 2024 sigue en curso y la coincidencia
            uno-a-uno no está garantizada para todo el universo.
          </li>
          <li>
            <strong>Servicios fuera del Perímetro de Exclusión no entran.</strong>{' '}
            Tomé, Santa Juana, Florida, Yumbel y Hualqui rural no
            aparecen — ver tabla "Qué cubre y qué no" arriba.
          </li>
          <li>
            <strong>Biotrén no está en este feed.</strong> EFE Trenes
            Metropolitanos gestiona su propio catálogo de datos. El
            visor lo procesa por OSM (<code className="font-mono">scripts/fetch-biotren.ts</code>{' '}
            y <code className="font-mono">fetch-biotren-track.ts</code>),
            no por GTFS.
          </li>
          <li>
            <strong>Calidad de la geometría depende de shapes.txt.</strong>{' '}
            Cuando un viaje no declara <code className="font-mono">shape_id</code>,
            el visor cae a una polilínea que conecta paraderos con líneas
            rectas — visible como zigzag artificial en algunos servicios.
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://transformacion.dtpr.cl/">
            DTPR · Convocatoria Acceso a Datos GTFS-RT (sin fecha de implementación pública)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Comparación con otros feeds chilenos">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Ciudad / red</th>
                <th className="px-3 py-2 font-medium">Publicador</th>
                <th className="px-3 py-2 font-medium">Cadencia conocida</th>
                <th className="px-3 py-2 font-medium">GTFS-RT</th>
                <th className="px-3 py-2 font-medium">Estado verif.</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Santiago · RED Metropolitana de Movilidad</td>
                <td className="px-3 py-2 text-[12px]">DTPM (dtpm.cl)</td>
                <td className="px-3 py-2 text-[12px]">
                  Varias actualizaciones al año, URL canónica versionada
                  por fecha (<code className="font-mono">GTFS_YYYYMMDD.zip</code>)
                </td>
                <td className="px-3 py-2 text-[12px]">Parcial · Metro publica GTFS-RT propio</td>
                <td className="px-3 py-2 text-[12px]"><strong>Verificado</strong></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Gran Concepción</td>
                <td className="px-3 py-2 text-[12px]">Subsecretaría de Transportes / DTPR Biobío vía datos.gob.cl</td>
                <td className="px-3 py-2 text-[12px]">Pendiente · última datada conocida 1-may-2019</td>
                <td className="px-3 py-2 text-[12px]">No · convocatoria DTPR 2024 sin fecha</td>
                <td className="px-3 py-2 text-[12px]">Existencia verificada · cadencia ámbar</td>
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
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La verificación primaria de los feeds comparados (Valparaíso,
          Antofagasta, Temuco) requeriría abrir cada ficha en
          {' '}<code className="font-mono">datos.gob.cl</code> y leer
          campo licencia y cadencia. El portal respondió HTTP 503 al
          cierre. La ficha se actualiza cuando vuelva. Santiago se
          verificó vía transitland, que sí respondió.
        </p>
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
      </Section>

      <Section title="Trabajo futuro">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Inclusión de Ruta 201 Santa Juana</strong> al feed
            consolidado regional, cuando el operador adopte GTFS o el
            MTT lo exija como parte del paquete BusPay (que sí cubre los
            tres perímetros de exclusión iniciales: Gran Concepción +
            Santa Juana + Tomé).
          </li>
          <li>
            <strong>Inclusión de servicios 401/411/421 Tomé</strong>{' '}
            bajo la misma lógica — Tomé está en el perímetro Buspay
            2026, lo que crea presión técnica para unificar feeds.
          </li>
          <li>
            <strong>GTFS-Realtime</strong> con posición de buses en
            vivo. DTPR lanzó convocatoria en 2024; sin fecha pública
            de implementación al cierre.
          </li>
          <li>
            <strong>Integración explícita con el feed Biotrén</strong>{' '}
            (si EFE Trenes Metropolitanos publica el suyo como GTFS, hoy
            no documentado públicamente).
          </li>
          <li>
            <strong>Validación contra MobilityData Canonical GTFS
            Validator</strong> antes de cada republicación, con reporte
            de warnings publicado junto al ZIP — práctica estándar en
            jurisdicciones que cuidan calidad de feed (Bay Area, NYC,
            Helsinki).
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://gtfs.org/community/tools/#validators">
            gtfs.org · validadores oficiales (Canonical GTFS Validator de MobilityData)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cómo contribuir">
        <p>
          Si encuentras un error en el feed —un paradero corrido de
          posición, una ruta desactualizada, un horario que ya no calza
          con la operación real— tienes tres caminos de reporte:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>DTPR Biobío</strong> directamente, vía contacto en
            {' '}<SourceLink href="https://transformacion.dtpr.cl/">transformacion.dtpr.cl</SourceLink>{' '}
            — es la dependencia que opera el feed regional.
          </li>
          <li>
            <strong>MTT Consultas Ciudadanas</strong>{' '}
            (<SourceLink href="https://www.mtt.gob.cl/">mtt.gob.cl</SourceLink>)
            para temas con cobertura nacional o que cruzan
            jurisdicciones.
          </li>
          <li>
            <strong>Este wiki</strong> si lo que tienes es información
            de campo (foto de letrero, horario observado, contacto
            operador) que pueda enriquecer un artículo mientras el feed
            no se corrige upstream. Abre un pull request al{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/tree/main/src/wiki/articles">
              repositorio del wiki
            </SourceLink>
            .
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Reportes con foto y coordenadas (lat/lng) o{' '}
          <code className="font-mono">stop_id</code> y{' '}
          <code className="font-mono">stop_code</code> exactos del feed
          se procesan mucho más rápido que reportes descriptivos.
        </p>
      </Section>

      <Section title="Cronología">
        <Timeline
          items={[
            {
              date: '2005',
              event: 'TriMet (Portland, Oregon) y Google publican la primera versión de la especificación GTFS para integrar transporte público a Google Maps. Punto de origen del estándar.',
              source: { href: 'https://en.wikipedia.org/wiki/GTFS', label: 'Wikipedia · GTFS' },
            },
            {
              date: '1-may-2019',
              event: 'Última fecha de actualización conocida del dataset gtfs-gran-concepcion archivada por catálogos mirror (AmeriGEOSS / búsqueda datos.gob.cl). Republicaciones posteriores no datadas al cierre.',
              source: { href: 'https://data.amerigeoss.org/dataset/gtfs-gran-concepcion', label: 'AmeriGEOSS · mirror datos.gob.cl' },
            },
            {
              date: '1-ene-2024',
              event: 'Inicia el Perímetro de Exclusión del Gran Concepción 2024 (7 comunas, 36 unidades, 35 empresas). Reemplaza la licitación 2002 caducada el 31-mar-2024. El feed debe reflejar el nuevo régimen.',
            },
            {
              date: '2024',
              event: 'DTPR abre la "Convocatoria Acceso a Datos GTFS-RT" — primer paso público hacia tiempo real. Sin fecha de implementación al cierre.',
              source: { href: 'https://transformacion.dtpr.cl/', label: 'DTPR' },
            },
            {
              date: 'May-2025',
              event: 'Refuerzos +11% en hora punta tarde Conce→Tomé y nuevas inyecciones tempranas Dichato (servicios 401/411). Los cambios afectan operación, no el feed urbano — porque Tomé no está en el feed.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html', label: 'Diario Concepción' },
            },
            {
              date: '28-ene-2026',
              event: 'MTT adjudica BusPay al Consorcio Buspay para los tres perímetros de exclusión iniciales (Gran Concepción + Tomé + Santa Juana). Crea presión técnica para unificar feeds bajo una sola cobertura regional.',
            },
            {
              date: 'Q3 2026 (proyectado)',
              event: 'Marcha blanca BusPay. Régimen 100% electrónico proyectado para fines de 2026. El feed seguirá siendo el insumo del visor mientras GTFS-RT no entre en operación.',
            },
          ]}
        />
      </Section>

      <Section title="Vínculos con otros artículos">
        <p>
          Este artículo es la ficha metodológica que los demás textos del
          wiki referencian cuando explican qué está y qué no está en el
          visor:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción 2024
            </a>
            {' '}— el régimen regulatorio al que está acotado el feed.
          </li>
          <li>
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay 2026
            </a>
            {' '}— pago electrónico, motor de la unificación operativa
            que probablemente termine empujando una unificación del
            feed.
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Recorridos interurbanos
            </a>
            {' '}— índice de servicios que <em>no</em> están en este
            feed.
          </li>
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a>,{' '}
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201 Santa Juana</a>,{' '}
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción ↔ Florida (corredor de El Pimentón)</a>,{' '}
            <a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">Concepción ↔ Yumbel</a>
            {' '}— corredores que documentan por qué el feed los deja
            afuera y cómo el visor los integra (o no) de otra manera.
          </li>
          <li>
            <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">Biotrén y sus extensiones</a>
            {' '}— el otro modo urbano del Gran Concepción, fuera del feed
            GTFS de buses y procesado por OSM.
          </li>
          <li>
            <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">Sobre este wiki</a>
            {' '}— compromiso editorial general: si no hay fuente abierta,
            no entra al visor.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Licencia exacta del dataset gtfs-gran-concepcion (probablemente CC BY 4.0, sin verificación textual al cierre).</li>
          <li>Cadencia formal de republicación post-Perímetro 2024.</li>
          <li>Fecha exacta de la última versión vigente al cierre y su URL canónica.</li>
          <li>Identidad del publicador formal vigente (¿Subsecretaría de Transportes, DTPR Biobío, equipo del backend operacional, los tres a la vez?).</li>
          <li>Recuento exacto de rutas y paraderos del feed vigente (el visor lo refleja en su <code className="font-mono">GTFS_CONCEPCION_SOURCE.routes</code> / <code className="font-mono">.stops</code> generados, pero falta cruzarlo con la cifra que declara el publicador).</li>
          <li>Esquema de variantes ida-vuelta: ¿route_id separados o direction_id?</li>
          <li>Estado real del programa GTFS-RT post convocatoria DTPR 2024.</li>
          <li>¿Existe un feed GTFS publicado por EFE Trenes Metropolitanos para Biotrén que se pueda enlazar?</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía de cierre principal: cuando <code className="font-mono">datos.gob.cl</code>{' '}
          vuelva a responder, abrir la ficha del dataset y leer los
          campos licencia, frecuencia, recursos y fecha última. Vía
          secundaria: Ley de Transparencia a DTPR Biobío.
        </p>
      </Section>

      <VerifiedBanner>
        <strong>Compromiso de mantenimiento.</strong> Esta ficha se
        actualiza cuando se verifica un dato pendiente o cuando el feed
        cambia su esquema de publicación. Cada actualización lleva su
        fuente al lado y queda registrada en el git history del archivo{' '}
        <code className="font-mono">src/wiki/articles/gtfs-gran-concepcion.tsx</code>.
      </VerifiedBanner>

      <Section title="Fuentes">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://gtfs.org/">
              gtfs.org · especificación canónica administrada por MobilityData
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://gtfs.org/documentation/schedule/reference/">
              gtfs.org · referencia formal de GTFS Schedule (archivos del ZIP)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://en.wikipedia.org/wiki/GTFS">
              Wikipedia · General Transit Feed Specification
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://datos.gob.cl/dataset/gtfs-gran-concepcion">
              datos.gob.cl · dataset gtfs-gran-concepcion (HTTP 503 al cierre)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://data.amerigeoss.org/dataset/gtfs-gran-concepcion">
              AmeriGEOSS · mirror del catálogo datos.gob.cl
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://transformacion.dtpr.cl/">
              DTPR · División de Transporte Público Regional (incluye convocatoria GTFS-RT 2024)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.mtt.gob.cl/">
              MTT · Ministerio de Transportes y Telecomunicaciones
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.dtpm.cl/index.php/noticias/gtfs-vigente">
              DTPM Santiago · GTFS vigente RED Metropolitana de Movilidad (referencia comparativa)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.transit.land/feeds/f-66jc-transantiago~metrodesantiago">
              Transitland · feed Santiago (verificado)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.transit.land/feeds/f-67vc-transantofagasta">
              Transitland · feed TransAntofagasta
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.transit.land/feeds/f-66jh-vinabussa~trolebuseschilesa~busesdelgranvalparaisosa~topt">
              Transitland · feed Gran Valparaíso (multioperador)
            </SourceLink>
          </li>
          <li>
            Scripts del repositorio que procesan el feed:{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/generate-gtfs-concepcion.ts">
              generate-gtfs-concepcion.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/extract-gtfs-schedule.ts">
              extract-gtfs-schedule.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/extract-stop-frequency.ts">
              extract-stop-frequency.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/lib/simplify.ts">
              simplify.ts (RDP)
            </SourceLink>
            .
          </li>
        </ul>
      </Section>
    </div>
  );
}
