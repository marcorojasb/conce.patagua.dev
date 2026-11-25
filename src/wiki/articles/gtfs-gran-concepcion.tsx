// GTFS Gran Concepción: ficha metodológica del feed sobre el que está construido
// el visor de buses. Es la pieza a la que enlazan los otros artículos cuando
// dicen «está en el feed» o «no está en el feed».
//
// Verificación (24-nov-2026), con fuente primaria:
//   - Página GTFS de dtpr.gob.cl (publicada 26-sep-2025, modificada 9-dic-2025)
//     y granconcepcion.zip (subido el 8-dic-2025, ~37,5 MB).
//   - feed_info.txt: publicador DTPR, feed_version «Gran Concepción20250228»,
//     vigencia declarada 20240101..20251231, contacto tt@mtt.gob.cl.
//   - Conteos (102 recorridos, 188 sentidos, 2.239 paraderos, 57.019 viajes,
//     3 calendarios, calendar_dates vacío, 1 agencia): leídos del zip con
//     scripts/sync-gtfs-official.ts.
//   - Programa a intervalo fijo (25-nov-2026): trip_id «POT-…» en los 57.019
//     viajes, block_id vacío, sin frequencies.txt; 182 de 188 sentidos de día
//     hábil con un solo intervalo (regla de src/lib/schedule-program.ts). Se
//     contrastó con la flota de la ficha DTPR Biobío 2026, la ficha UN65
//     (sep-2026), la Seremi (feb-2026) y la lista del operador de la 201.
//   - Feed anterior del visor: Subsecretaría de Transportes, 1-may-2019
//     (mirror AmeriGEOSS de datos.gob.cl).
//   - Contraste con la fuente de llegadas en vivo (no oficial): respuestas del
//     24-nov-2026 en Concepción, Tomé, San Pedro, Talcahuano y Coronel.
//   - Consulta del 25-nov-2026 en dtpr.gob.cl: no se encontró una versión
//     posterior (la página GTFS no mostró archivos en esa consulta).
//
// Ámbar: licencia de datos (la página no declara ninguna) y cadencia de
// republicación (solo hay una versión publicada).

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
        <strong>Verificado con fuente primaria (24-nov-2026).</strong> Archivo{' '}
        <SourceLink href={DTPR_GTFS_ZIP}>granconcepcion.zip</SourceLink>, versión
        «Gran Concepción20250228», publicado en{' '}
        <SourceLink href={DTPR_GTFS_PAGE}>dtpr.gob.cl · Gran Concepción · GTFS</SourceLink>.
        Una consulta del 25-nov-2026 no encontró una versión posterior (la página GTFS no mostró archivos en esa consulta).{' '}
        <strong>Pendiente</strong>: licencia de datos y cadencia de republicación.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-24"
        items={[
          { label: 'Publicador', value: 'DTPR · Subsecretaría de Transportes' },
          { label: 'Versión', value: 'Programa del 28-feb-2025' },
          { label: 'Vigencia declarada', value: '1-ene-2024 a 31-dic-2025 (vencida)' },
          { label: 'Recorridos', value: '102 · 188 sentidos' },
          { label: 'Paraderos', value: '2.239' },
          { label: 'Viajes', value: '57.019 (programa)' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Es el GTFS oficial que la <strong>DTPR</strong> publica para el Gran
            Concepción. El visor lo revisa cada día y propone los cambios en un pull request.
          </>,
          <>
            Su calendario venció el <strong>31-dic-2025</strong>. No hay versión
            posterior publicada: el visor lo usa como el último programa oficial y lo indica en cada ficha.
          </>,
          <>
            Cubre la red urbana y los interurbanos <strong>201 / 201-AU</strong>,{' '}
            <strong>401 / 401Y / 411 / 421</strong> y <strong>302 / 304</strong>.
            Biotrén, Florida, Yumbel y taxis colectivos quedan fuera.
          </>,
          <>
            Desde el 24-nov-2026 reemplazó al feed 2019 de la Subsecretaría (169 servicios, uno por letra).
          </>,
          <>
            Es un <strong>programa a intervalo fijo</strong>, no un itinerario: reparte las salidas cada 5 min (en la
            mayoría de los sentidos) de la primera a la última. El visor muestra su frecuencia y su ventana, no cuenta
            salidas. Las llegadas en vivo vienen de otra fuente, no oficial.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '8-dic-2025',
            title: 'DTPR sube el GTFS de Gran Concepción',
            detail: 'granconcepcion.zip, versión «Gran Concepción20250228». En la misma tanda sube el GTFS de Tomé.',
            source: { href: DTPR_GTFS_PAGE, label: 'dtpr.gob.cl · Gran Concepción · GTFS' },
          },
          {
            date: '24-nov-2026',
            title: 'El visor pasa al GTFS oficial DTPR',
            detail: 'Reemplaza el feed 2019. Los interurbanos 201, 401 y 302 se dibujan desde el GTFS, no desde trazados OSM.',
            source: { href: `${REPO}/scripts/sync-gtfs-official.ts`, label: 'scripts/sync-gtfs-official.ts' },
          },
        ]}
      />

      <Section title="Qué es y por qué importa">
        <p>
          <strong>GTFS</strong> (<em>General Transit Feed Specification</em>) es el formato estándar para describir
          servicios de transporte público en archivos abiertos. Nació en 2005 de la colaboración entre TriMet (Portland)
          y Google. Lo que está en el feed entra al visor sin transcribir nada a mano: basta aprobar la actualización diaria.
        </p>
        <Sources>
          <SourceLink href="https://gtfs.org/">gtfs.org · especificación canónica</SourceLink>
          <SourceLink href="https://en.wikipedia.org/wiki/GTFS">Wikipedia · General Transit Feed Specification</SourceLink>
        </Sources>
      </Section>

      <Section title="Versión y vigencia">
        <KeyValueList
          items={[
            ['Publicador', 'División de Transporte Público Regional (DTPR), Subsecretaría de Transportes, MTT. Contacto del feed: tt@mtt.gob.cl.'],
            ['Dónde', <>Página <SourceLink href={DTPR_GTFS_PAGE}>dtpr.gob.cl/pe/gran-concepcion/gtfs-2</SourceLink> y archivo <SourceLink href={DTPR_GTFS_ZIP}>granconcepcion.zip</SourceLink> (subido el 8-dic-2025).</>],
            ['Versión y vigencia', <><code className="font-mono">feed_version</code> «Gran Concepción20250228». <code className="font-mono">feed_start_date</code> 1-ene-2024; <code className="font-mono">feed_end_date</code> 31-dic-2025.</>],
            ['Cómo lo trata el visor', 'Usa los días de servicio de calendar.txt sin filtrar por fecha, y cada ficha indica que el programa es del 28-feb-2025 y que su vigencia terminó el 31-dic-2025.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Cambios de recorrido, frecuencia o código posteriores a feb-2025 no aparecen hasta que la DTPR publique otra
          versión. Cuando el archivo cambie, la sincronización abre un pull request.
        </p>
        <Sources>
          <SourceLink href={DTPR_GTFS_PAGE}>dtpr.gob.cl · Gran Concepción · GTFS</SourceLink>
          <SourceLink href={DTPR_GTFS_ZIP}>DTPR · granconcepcion.zip (feed_info.txt)</SourceLink>
        </Sources>
      </Section>

      <Section title="Qué cubre">
        <DataTable columns={['Servicio', 'En el feed', 'Dónde se ve']}>
          <tr>
            <td className="px-3 py-2 font-medium">Buses urbanos (94 recorridos)</td>
            <td className="px-3 py-2"><strong>Sí</strong></td>
            <td className="px-3 py-2 text-[12px] text-muted-foreground">
              Concepción, Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante, Hualqui y Penco/Lirquén. Incluye el Biobús B02.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Interurbanos 201, 401, 302 y sus variantes</td>
            <td className="px-3 py-2"><strong>Sí</strong></td>
            <td className="px-3 py-2 text-[12px] text-muted-foreground">
              Ver <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">recorridos interurbanos</a>,{' '}
              <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201</a>{' '}
              <MapLink route="201">en el mapa →</MapLink>,{' '}
              <a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a> y{' '}
              <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">Concepción ↔ Coronel ↔ Lota</a>.
              La DTPR publica además un GTFS de Tomé (<SourceLink href={DTPR_TOME_PAGE}>tome.zip</SourceLink>,
              «Tomé20230308»); el visor usa el de Gran Concepción.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Florida, Yumbel, Biotrén, taxis colectivos</td>
            <td className="px-3 py-2"><strong>No</strong></td>
            <td className="px-3 py-2 text-[12px] text-muted-foreground">
              Florida y Yumbel: solo pin. Biotrén: <a href="/wiki/biotren" className="underline underline-offset-2">horarios de EFE</a>.
              Taxis: <a href="/wiki/taxis-colectivos-gran-concepcion" className="underline underline-offset-2">otro régimen</a>.
            </td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          El feed no distingue urbanos de interurbanos. La etiqueta «Interurbano Santa Juana / Tomé / Lota» es una
          clasificación propia, en <code className="font-mono">scripts/lib/gtfs-transform.ts</code>.
        </p>
      </Section>

      <Section title="Estructura del feed">
        <DataTable columns={['Archivo', 'Contenido en la versión 20250228']}>
          <tr>
            <td className="px-3 py-2 font-mono text-[12px]">agency.txt</td>
            <td className="px-3 py-2 text-[12px]">Una agencia, «DTPR». Los operadores aparecen en el letrero del viaje («Vía Láctea 10A - Centinela»).</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-mono text-[12px]">routes.txt</td>
            <td className="px-3 py-2 text-[12px]">102 recorridos, todos bus. <strong>10AN</strong> es el 10A en un sentido y el 10N en el otro.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-mono text-[12px]">trips.txt</td>
            <td className="px-3 py-2 text-[12px]">57.019 viajes con <code className="font-mono">direction_id</code>, <code className="font-mono">shape_id</code> y letrero. 29.240 en día hábil, 14.405 sábado, 13.374 domingo. Son los viajes de un programa a intervalo fijo (ver Limitaciones), no salidas reales.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-mono text-[12px]">stops.txt · shapes.txt</td>
            <td className="px-3 py-2 text-[12px]">2.239 paraderos con coordenadas, y la polilínea de cada trazado. Frente al feed 2019 desaparecieron 449 paraderos y aparecieron 578.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-mono text-[12px]">stop_times.txt</td>
            <td className="px-3 py-2 text-[12px]">~4,5 millones de filas (~312 MB sin comprimir). Solo algunas paradas traen hora; las vacías no se leen como 00:00.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-mono text-[12px]">calendar.txt · calendar_dates.txt</td>
            <td className="px-3 py-2 text-[12px]">Tres calendarios (L, S, D), todos del 1-ene-2024 al 31-dic-2025. Las excepciones están vacías: no hay festivos.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-mono text-[12px]">feed_info.txt</td>
            <td className="px-3 py-2 text-[12px]">Publicador, versión, vigencia declarada y contacto.</td>
          </tr>
        </DataTable>
        <Sources>
          <SourceLink href="https://gtfs.org/documentation/schedule/reference/">gtfs.org · referencia de GTFS Schedule</SourceLink>
          <SourceLink href={DTPR_GTFS_ZIP}>DTPR · granconcepcion.zip</SourceLink>
        </Sources>
      </Section>

      <Section title="Cómo lo usa el visor">
        <p>
          Un solo script, <code className="font-mono">scripts/sync-gtfs-official.ts</code> (
          <code className="font-mono">npm run sync:gtfs</code>), descarga el zip y regenera los{' '}
          <code className="font-mono">src/data/gtfs-*.generated.ts</code>. Lee el zip en streaming con Node, sin sqlite.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Arma los <strong>dos sentidos</strong> de cada recorrido desde su secuencia de paraderos, su shape y su letrero.</li>
          <li>Calcula horarios por recorrido, sentido y día, y frecuencias por paradero. Son el programa tal cual: el visor detecta al mostrarlos los sentidos a intervalo fijo.</li>
          <li>Un workflow corre cada día a las 06:30 UTC y abre un pull request si el feed cambió. Si dtpr.gob.cl falla, los datos anteriores quedan.</li>
        </ul>
        <CollapsibleSection title="Pipeline de sincronización">
          <ol className="ml-5 list-decimal space-y-1 text-[13px]">
            <li>
              <strong>Descarga.</strong> Baja el zip desde dtpr.gob.cl (o lee uno local con{' '}
              <code className="font-mono">GTFS_ZIP_PATH</code>), lo guarda en <code className="font-mono">.cache/gtfs/</code>{' '}
              y no lo vuelve a bajar si no cambió.
            </li>
            <li>
              <strong>Sentidos.</strong> La secuencia de paraderos más común por <code className="font-mono">direction_id</code>.
              El letrero da la variante (10A, 10N) y el destino. Se corrigen los letreros cruzados (ver Limitaciones).
            </li>
            <li>
              <strong>Trazados.</strong> Simplificación Ramer-Douglas-Peucker, tolerancia ≈0,00008° (~9 m en Concepción;{' '}
              <code className="font-mono">scripts/lib/simplify.ts</code>).
            </li>
            <li>
              <strong>Horarios.</strong> Salidas y duración por recorrido, sentido y día, tal como vienen en el programa;
              tramos con servicio por día. Por paradero: pasadas por hora, primera y última pasada, intervalo mediano y
              número de pasadas. El visor detecta en tiempo de ejecución los sentidos a intervalo fijo (
              <code className="font-mono">src/lib/schedule-program.ts</code>) y en ellos muestra frecuencia y ventana; donde
              conoce la flota, ralea las micros estimadas.
            </li>
            <li>
              <strong>Escritura.</strong> Paraderos (carga inmediata), recorridos (diferida) y horarios (al abrir una ficha
              o mostrar micros según el programa). Después recalcula la grilla de cobertura.
            </li>
          </ol>
          <p className="text-[12px] text-muted-foreground">
            Versión, vigencia, URL, sha256 y fecha de descarga quedan en <code className="font-mono">GTFS_CONCEPCION_SOURCE</code>.
          </p>
          <Sources>
            <SourceLink href={`${REPO}/scripts/sync-gtfs-official.ts`}>scripts/sync-gtfs-official.ts</SourceLink>
            <SourceLink href={`${REPO}/.github/workflows/sync-data.yml`}>.github/workflows/sync-data.yml</SourceLink>
          </Sources>
        </CollapsibleSection>
      </Section>

      <Section title="Licencia">
        <p>
          Ni la página de la DTPR ni el zip declaran licencia. El visor usa el feed como información pública del Estado,
          atribuida a la DTPR, y enlaza el archivo original. El feed 2019 figuraba en datos.gob.cl con CC BY 4.0 por defecto;
          esa licencia no se extiende sin más a dtpr.gob.cl.
        </p>
        <PendingBanner>
          <strong>Licencia pendiente.</strong> Para redistribuir el feed, confirma los términos con la DTPR. La licencia del
          wiki (CC BY 4.0) no cambia la del feed.
        </PendingBanner>
      </Section>

      <Section title="Limitaciones conocidas">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Programa vencido.</strong> Lo que cambió en la calle después de feb-2025 no está. Sin festivos: un feriado
            se muestra con el horario de su día de la semana.
          </li>
          <li>
            <strong>Programa a intervalo fijo, no itinerario.</strong> Las salidas del feed salen de un programa de operación
            repartido a intervalo parejo, no de una tabla horaria. La evidencia:
            <ul className="ml-5 mt-1 list-[circle] space-y-1 text-[13px]">
              <li>
                Los 57.019 viajes tienen <code className="font-mono">trip_id</code> «POT-…», sin{' '}
                <code className="font-mono">block_id</code> ni <code className="font-mono">frequencies.txt</code> (
                <SourceLink href={DTPR_GTFS_ZIP}>granconcepcion.zip</SourceLink>).
              </li>
              <li>
                En día hábil, 182 de 188 sentidos salen a un solo intervalo de la primera a la última salida; 141 de
                ellos, cada 5 min (cálculo del visor sobre el zip).
              </li>
              <li>
                En día hábil el programa pone más de 3.000 micros urbanas en ruta a la vez; el perímetro tiene 1.894
                inscritas (<SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf">DTPR · Ficha Biobío 2026</SourceLink>).
              </li>
              <li>
                La línea 65 tiene 1.062 salidas de día hábil en el GTFS; su programa de operación normal, 342 expediciones (
                <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/09/UN65-FICHA-MODIFICACION-2026-09.pdf">DTPR · ficha UN65, sep-2026</SourceLink>).
              </li>
              <li>
                Entre las 07:00 y las 09:00 de un día hábil el GTFS trae 3.797 salidas en el Gran Concepción, Santa Juana y
                Tomé (3.869 con la 302 y la 304 a Lota); para ese mismo alcance la Seremi anunció 1.771 (
                <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2026/02/25/informan-aumento-del-11-de-la-oferta-de-transporte-publico-a-partir-del-2-de-marzo.html">Diario Concepción, 25-feb-2026</SourceLink>).
              </li>
              <li>
                La 201 trae 420 salidas en día hábil (y 84 la 201-AU); el operador vende 113 (
                <SourceLink href="https://kupos.cl/en/bus/tickets/santa-juana/concepcion">kupos.cl</SourceLink>, 25-nov-2026). Ver{' '}
                <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201</a>.
              </li>
            </ul>
            <p className="mt-1">
              Qué hace el visor: en los días en que un sentido es programa (12 salidas o más y 80 % de los intervalos
              iguales, ±1 min), la ficha muestra su frecuencia y su ventana, sin contar salidas ni dibujar salidas por hora. La
              201 usa de lunes a viernes la lista del operador. En el mapa, las líneas con flota oficial conocida no
              dibujan más micros que buses. Detalle en{' '}
              <SourceLink href={`${REPO}/src/lib/schedule-program.ts`}>schedule-program.ts</SourceLink>.
            </p>
          </li>
          <li>
            <strong>Paraderos lejos de su trazado.</strong> En sentido 1, los paraderos 39514 (63FH, 63LB) y 40344 (70F)
            quedan a más de 100 m de su shape. El script los reporta en cada sincronización.
          </li>
          <li>
            <strong>Letreros cruzados.</strong> En 02AD y 02KP el letrero de cada sentido trae la letra del otro; en 23BS, también
            el destino. <code className="font-mono">correctTripHeadsign</code> los corrige solo cuando vienen cruzados.
          </li>
          <li>
            <strong>Sin tiempo real oficial.</strong> Las llegadas en vivo vienen de una fuente no oficial (abajo).
          </li>
          <li>
            <strong>Códigos de paradero.</strong> El <code className="font-mono">stop_code</code> puede no calzar con el letrero
            físico; la marcación de paraderos del Perímetro sigue en curso.
          </li>
        </ul>
      </Section>

      <Section title="Llegadas en vivo y contraste con la operación 2026">
        <p>
          El GTFS dice qué debería pasar, no dónde va cada micro. Para eso, solo en el paradero abierto, el visor usa la
          fuente que consume la app de Transapp. <strong>No es oficial ni está documentada</strong>: puede cambiar, caerse
          o responder vacía. Pasa por una intermediaria del visor que guarda cada paradero 25 s y no hace más de 30
          consultas por minuto.
        </p>
        <KeyValueList
          items={[
            ['Paraderos', 'Calzan 2.202 de los 2.239 paraderos del GTFS; 6 tienen otro nombre y 31 no existen en la fuente.'],
            ['Líneas', 'La fuente nombra cada sentido por separado. 183 de los 188 sentidos oficiales tienen par. La 302 y la 304 no se siguen en vivo.'],
            ['Servicios de 2026 sin par en el GTFS', <>02H, 02L, 20F, 20N, 30H, 30Z, 50SY, 70FY, 70HY, 80B y 80V. La red de 2026 los corre y el programa del 28-feb-2025 no los trae con ese nombre. La 02L solo figura como la variante 02L-Y (2 viajes en día hábil).</>],
            ['Ubicación de paraderos', 'Las coordenadas de la fuente coinciden con las oficiales: mediana de 3 m y 97% a menos de 20 m.'],
            ['Comprobado', 'Respuestas reales del 24-nov-2026 en Concepción, Tomé, San Pedro de la Paz, Talcahuano y Coronel.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Las micros del modo <strong>Horario</strong> son una estimación según el programa, nunca GPS. El visor la rotula así
          y avisa que en la calle puede haber otra cantidad de micros, casi siempre menos.
        </p>
      </Section>

      <CollapsibleSection title="Comparación con otros feeds chilenos">
        <DataTable columns={['Red', 'Publicador', 'Estado de verificación']}>
          <tr>
            <td className="px-3 py-2 font-medium">Santiago · RED</td>
            <td className="px-3 py-2 text-[12px]">DTPM</td>
            <td className="px-3 py-2 text-[12px]"><strong>Verificado</strong></td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Gran Concepción</td>
            <td className="px-3 py-2 text-[12px]">DTPR, vía dtpr.gob.cl</td>
            <td className="px-3 py-2 text-[12px]"><strong>Verificado</strong> (24-nov-2026)</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Gran Valparaíso · TMV</td>
            <td className="px-3 py-2 text-[12px]">Operadores agregados vía Transitland</td>
            <td className="px-3 py-2 text-[12px]">Ámbar</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Antofagasta · Temuco - Padre Las Casas</td>
            <td className="px-3 py-2 text-[12px]">Antofagasta, archivado en Transitland · Temuco, MTT vía datos.gob.cl</td>
            <td className="px-3 py-2 text-[12px]">Ámbar</td>
          </tr>
        </DataTable>
        <Sources>
          <SourceLink href="https://www.transit.land/feeds/f-66jc-transantiago~metrodesantiago">Transitland · feed Santiago (RED + Metro)</SourceLink>
          <SourceLink href="https://www.transit.land/feeds/f-67vc-transantofagasta">Transitland · feed TransAntofagasta</SourceLink>
          <SourceLink href="https://www.transit.land/feeds/f-66jh-vinabussa~trolebuseschilesa~busesdelgranvalparaisosa~topt">Transitland · feed Gran Valparaíso</SourceLink>
          <SourceLink href="https://www.dtpm.cl/index.php/noticias/gtfs-vigente">DTPM · GTFS vigente Santiago</SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Cómo contribuir">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>DTPR</strong>, que publica el feed: <SourceLink href="https://dtpr.gob.cl/">dtpr.gob.cl</SourceLink> o tt@mtt.gob.cl.
          </li>
          <li>
            <strong>MTT Consultas Ciudadanas</strong> (<SourceLink href="https://www.mtt.gob.cl/">mtt.gob.cl</SourceLink>),
            para temas que cruzan jurisdicciones.
          </li>
          <li>
            <strong>Este wiki</strong>, con información de campo mientras el feed no se corrige. Abre un pull request al{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/tree/main/src/wiki/articles">repositorio del wiki</SourceLink>.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Los reportes con foto, coordenadas o el <code className="font-mono">stop_id</code> exacto se procesan más rápido.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Cronología">
        <Timeline
          items={[
            {
              date: '2005',
              event: 'TriMet (Portland) y Google publican la primera versión de la especificación GTFS.',
              source: { href: 'https://en.wikipedia.org/wiki/GTFS', label: 'Wikipedia · GTFS' },
            },
            {
              date: '1-may-2019',
              event: 'Última actualización conocida del feed de la Subsecretaría en datos.gob.cl. Es el que usó el visor hasta nov-2026.',
              source: { href: 'https://data.amerigeoss.org/dataset/gtfs-gran-concepcion', label: 'AmeriGEOSS · mirror datos.gob.cl' },
            },
            { date: '1-ene-2024', event: 'Inicia el Perímetro de Exclusión del Gran Concepción 2024 y la vigencia declarada del feed actual.' },
            {
              date: '28-feb-2025',
              event: 'Fecha del programa de operación del feed vigente («Gran Concepción20250228»).',
              source: { href: DTPR_GTFS_ZIP, label: 'DTPR · feed_info.txt' },
            },
            {
              date: '8-dic-2025',
              event: 'La DTPR sube granconcepcion.zip y tome.zip a dtpr.gob.cl.',
              source: { href: DTPR_GTFS_PAGE, label: 'dtpr.gob.cl · GTFS' },
            },
            { date: '31-dic-2025', event: 'Termina la vigencia declarada del feed. No se publica una versión nueva.' },
            {
              date: '24-nov-2026',
              event: 'El visor reemplaza el feed 2019 por el GTFS oficial DTPR, con sincronización diaria. Los interurbanos 201, 401, 411 y 421 dejan de dibujarse desde OpenStreetMap.',
              source: { href: `${REPO}/scripts/sync-gtfs-official.ts`, label: 'sync-gtfs-official.ts' },
            },
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1">
          <li><a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">Perímetro de Exclusión del Gran Concepción 2024</a>: el régimen de la mayoría de los recorridos.</li>
          <li><a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">Recorridos interurbanos</a>: cuáles están en el feed y cuáles no.</li>
          <li><a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">SEREMITT Biobío y la DTPR</a>: la institución que publica el feed.</li>
          <li><a href="/wiki/openstreetmap-fuente-visor" className="underline underline-offset-2">OpenStreetMap como fuente del visor</a>: lo que el feed no cubre.</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Licencia de datos del feed publicado en dtpr.gob.cl.</li>
          <li>Cadencia de republicación y si habrá una versión con calendario 2026.</li>
          <li>Programas de operación vigentes por servicio (salidas por hora) para reemplazar el programa a intervalo fijo.</li>
          <li>Si existe un GTFS-Realtime oficial para Gran Concepción.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía de cierre: consulta a la DTPR (tt@mtt.gob.cl) o solicitud por Ley de Transparencia.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Fuentes">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li><SourceLink href={DTPR_GTFS_PAGE}>DTPR · Gran Concepción · GTFS (página)</SourceLink></li>
          <li><SourceLink href={DTPR_GTFS_ZIP}>DTPR · granconcepcion.zip (Gran Concepción20250228)</SourceLink></li>
          <li><SourceLink href={DTPR_TOME_PAGE}>DTPR · Tomé · GTFS (tome.zip, Tomé20230308)</SourceLink></li>
          <li><SourceLink href="https://data.amerigeoss.org/dataset/gtfs-gran-concepcion">AmeriGEOSS · mirror de datos.gob.cl con el feed 2019</SourceLink></li>
          <li><SourceLink href="https://gtfs.org/documentation/schedule/reference/">gtfs.org · referencia de GTFS Schedule</SourceLink></li>
          <li><SourceLink href="https://en.wikipedia.org/wiki/GTFS">Wikipedia · General Transit Feed Specification</SourceLink></li>
          <li><SourceLink href="https://www.mtt.gob.cl/">MTT · Ministerio de Transportes y Telecomunicaciones</SourceLink></li>
          <li>
            Scripts del repo:{' '}
            <SourceLink href={`${REPO}/scripts/sync-gtfs-official.ts`}>sync-gtfs-official.ts</SourceLink>,{' '}
            <SourceLink href={`${REPO}/scripts/lib/gtfs-transform.ts`}>gtfs-transform.ts</SourceLink>,{' '}
            <SourceLink href={`${REPO}/scripts/lib/simplify.ts`}>simplify.ts (RDP)</SourceLink>.
          </li>
        </ul>
      </CollapsibleSection>
    </div>
  );
}
