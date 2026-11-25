// Ruta 201 / 201 AU · Concepción ↔ Santa Juana
//
// Servicio inaugurado el 15-jul-2024 bajo la licitación DTPR ELC0007,
// primera del Biobío en más de 10 años. Trazado del visor: GTFS oficial DTPR
// (versión 20250228), cotejado el 24-nov-2026. Salidas cotejadas el
// 25-nov-2026 con la lista de venta del operador en kupos.cl: el GTFS trae un
// programa a intervalo fijo (420 salidas en día hábil), no un itinerario.
// Hechos vigentes cotejados el 25-nov-2026 (ficha DTPR Biobío 2026, jun-2026,
// y prensa sobre BusPay).

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  IssueNotice,
  KeyValueList,
  NewsPulse,
  Section,
  ServiceCode,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';
import { MapLink } from '@/wiki/map-link';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function Ruta201SantaJuana() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado con fuentes primarias.</strong> Licitación DTPR
        ELC0007, decreto MTT N°93/2023, ficha DTPR Biobío 2026 y prensa
        regional; salidas de lunes a viernes según la lista de venta del
        operador (kupos.cl, 25-nov-2026). <strong>Pendientes</strong>: salidas
        de sábado, domingo y festivos, duración del contrato y tarifa vigente
        en 2026 (ver "Datos pendientes").
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Servicios', value: '201 · 201 AU' },
          { label: 'Operador', value: 'Transportes Santa Juana SpA' },
          { label: 'Tarifa adulto', value: '$1.000 (jul-2024)' },
          { label: 'Flota', value: '23 buses (6 AU)' },
          { label: 'Salidas lun–vie', value: '113 (operador)' },
          { label: 'Desde', value: '15-jul-2024' },
          { label: 'Mapa', value: <MapLink route="201">201</MapLink> },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Servicio rural subsidiado Santa Juana ↔ Concepción (~52 km), de la
            licitación{' '}
            <SourceLink href="https://dtpr.mtt.gob.cl/consultalicitaciones/webpage/ConsultaLicitaciones.aspx?id=5927">DTPR ELC0007</SourceLink>
            . Opera desde el 15-jul-2024 con 23 buses nuevos.
          </>,
          <>
            Está en el{' '}
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS oficial
            </a>
            : el visor dibuja trazado y paraderos de la 201 y la 201 AU. De
            lunes a viernes usa las 113 salidas que vende el operador, porque
            el GTFS trae un programa a intervalo fijo (420), no un itinerario.
          </>,
          <>
            Tarifa adulto $1.000 desde el inicio; adultos mayores, personas con
            discapacidad y menores de 7 años van gratis.
          </>,
          <>
            Será el primer servicio rural del país con pago electrónico
            (BusPay). La marcha blanca estaba prevista para noviembre de 2026;
            no hay confirmación de que ya haya partido.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: 'Jun-2026',
            title: 'DTPR sigue declarando el sistema de Santa Juana como subsidiado, con 23 buses',
            detail:
              'La ficha de subsidios Biobío 2026 (actualización de junio) lo describe como flota de 23 buses monitoreada por GPS, 6 de alto estándar, para más de 14 mil personas.',
            source: {
              href: 'https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf',
              label: 'DTPR · Ficha Biobío 2026',
            },
          },
          {
            date: 'Ago-2026',
            title: 'BusPay: marcha blanca en noviembre y operación completa hacia febrero de 2027',
            detail:
              'Santa Juana participó en la coordinación para entregar 21 mil tarjetas gratuitas a adultos mayores. El efectivo se eliminaría de forma gradual en tres meses.',
            source: {
              href: 'https://www.biobiochile.cl/noticias/servicios/explicado/2026/08/05/se-viene-pago-electronico-en-el-gran-concepcion-entregaran-21-mil-tarjetas-gratis-a-adultos-mayores.shtml',
              label: 'BioBioChile · 5-ago-2026',
            },
          },
        ]}
      />

      <Section title="En el visor">
        <p>
          La 201 y la 201 AU vienen en el GTFS oficial de la DTPR (programa
          del 28-feb-2025; su calendario venció el 31-dic-2025, pero es la
          última publicación). El visor las rotula «Interurbano Santa Juana» y
          toma del GTFS el trazado y los paraderos por sentido. Las salidas no:
          el GTFS trae un programa a intervalo fijo, no un itinerario. De lunes
          a viernes la ficha de la 201 usa la lista que vende el operador. El
          modo <strong>Micros en el mapa · Horario</strong> estima dónde
          debería ir cada bus según esas salidas, sin pasar de los 23 buses de
          la flota: no es GPS.
        </p>
        <KeyValueList
          items={[
            ['201, lunes a viernes', '53 salidas desde Santa Juana (06:30 a 22:01) y 60 desde Concepción (06:15 a 23:05): de día, casi siempre cada 10 a 20 min y hasta 6 por hora en punta; de noche, huecos de 25 a 60 min. Viaje declarado de 1 h 54 min a 1 h 57 min. Es la lista de kupos.cl del miércoles 25-nov-2026: se asume igual de lunes a viernes y no separa la 201 AU.'],
            ['201, fin de semana', 'Sin lista del operador: la ficha muestra el programa del GTFS como frecuencia (cada 10 min), sin contar salidas. La prensa habla de la mitad de las salidas de día hábil.'],
            ['GTFS (programa)', '220 + 200 salidas de la 201 y 55 + 29 de la 201 AU en día hábil, a intervalo fijo (cada 5, 15 y 30 min), de ~2 h 46 min cada una. Pondrían 86 buses en ruta a la vez, contra 23.'],
            ['201-AU en el visor', 'Sin datos propios: queda con el programa del GTFS, como frecuencia, y en el mapa se ralea para no pasar de la flota.'],
            ['Festivos', 'Ni el GTFS ni la lista del operador los declaran: un feriado se muestra como un día normal.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Con 23 buses y viajes de casi 2 h, la lista del operador pone hasta
          20 buses en ruta a la vez: cabe en la flota. Calza con la prensa:
          «hasta 60 frecuencias diarias en ambas direcciones» entre lunes y
          viernes al partir (BioBioChile, jul-2024) y 63 salidas desde Santa
          Juana en jul-2024 contra 46 en ene-2025 (Sabes.cl). Detalle del
          programa en{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción · Limitaciones
          </a>
          .
        </p>
        <p className="text-[12px]">
          <MapLink route="201">Ver la 201 en el mapa →</MapLink>
        </p>
        <Sources>
          <SourceLink href="https://kupos.cl/en/bus/tickets/santa-juana/concepcion">kupos.cl · Santa Juana → Concepción (25-nov-2026)</SourceLink>
          <SourceLink href="https://kupos.cl/en/bus/tickets/concepcion/santa-juana">kupos.cl · Concepción → Santa Juana (25-nov-2026)</SourceLink>
          <SourceLink href="https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/">DTPR · GTFS Gran Concepción (versión 20250228)</SourceLink>
          <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf">DTPR · Ficha Biobío 2026 (jun-2026), 23 buses</SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/07/15/importante-hito-en-santa-juana-inauguran-primer-servicio-de-transporte-subsidiado-en-la-comuna.shtml">BioBioChile 15-jul-2024</SourceLink>
          <SourceLink href="https://sabes.cl/2025/01/16/santa-juana-acusa-disminucion-frecuencias-transporte-publico-comuna/">Sabes.cl 16-ene-2025</SourceLink>
        </Sources>
      </Section>

      <Section title="Códigos de servicio">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-md border bg-card p-2">
            <div className="flex items-center gap-2">
              <ServiceCode>201</ServiceCode>
              <span className="text-[13px] font-medium">Estándar</span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Buses de la licitación sin accesibilidad universal.
            </p>
          </div>
          <div className="rounded-md border bg-card p-2">
            <div className="flex items-center gap-2">
              <ServiceCode>201 AU</ServiceCode>
              <span className="text-[13px] font-medium">Accesibilidad universal</span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Piso bajo, rampa y espacio para silla de ruedas (estándar RED).
            </p>
          </div>
        </div>
        <p className="text-[12px] text-muted-foreground">Mismo trazado en ambos.</p>
        <Sources>
          <SourceLink href="https://www.elconquistadorconcepcion.cl/2024/07/17/inauguran-nuevo-servicio-de-transporte-publico-que-conectara-concepcion-y-santa-juana-beneficiara-a-mas-de-14-mil-personas/">El Conquistador 17-jul-2024</SourceLink>
          <SourceLink href="https://www.facebook.com/61558500197393/posts/horarios-transportes-santa-juana-spa-pd-au-accesibilidad-universal/122129292698283339/">Facebook Transportes Santa Juana, Confirmación AU</SourceLink>
        </Sources>
      </Section>

      <Section title="Horario y frecuencia">
        <KeyValueList
          items={[
            ['Santa Juana → Concepción', 'Jul-2024 (MTT): primera 05:30, última 23:45. Lista del operador, nov-2026: 06:30 a 22:01, aunque la página de la empresa en kupos.cl dice que desde Santa Juana la primera sale a las 05:30.'],
            ['Concepción → Santa Juana', 'Jul-2024 (MTT): primera 06:45, última 23:20. Lista del operador, nov-2026: 06:15 a 23:05.'],
            ['Frecuencia máxima', '«La frecuencia máxima va a ser de 10 buses a la hora» (ministro Juan Carlos Muñoz, firma del contrato, 31-ene-2024). En la lista de nov-2026, hasta 6 por hora y sentido.'],
            ['Salidas diarias', 'Operador (kupos.cl, 25-nov-2026): 53 desde Santa Juana y 60 desde Concepción, de lunes a viernes. Prensa: «hasta 60 frecuencias diarias en ambas direcciones» al partir (jul-2024); desde Santa Juana, 63 en jul-2024 y 46 en ene-2025. Las 420 + 84 del GTFS son un programa a intervalo fijo, no salidas reales.'],
            ['Fin de semana y festivos', 'Sin tabla legible: la prensa habla de la mitad de las salidas de día hábil, y el GTFS solo trae un programa cada 10 min. Los festivos no están publicados.'],
            ['Tiempo de viaje', '1 h 54 min a 1 h 57 min según el operador (la de 07:01 desde Santa Juana, 2 h 23 min); ~2 h 46 min en el GTFS.'],
            ['Tiempo real', 'App Red Regional de Movilidad (buscar "201").'],
          ]}
        />
        <Sources>
          <SourceLink href="https://sabes.cl/2024/07/16/nuevo-transporte-publico-concepcion-santa-juana-esta-operativo-revisa-horarios-y-valores/">Sabes.cl, Comunicado MTT con ventana operativa</SourceLink>
          <SourceLink href="https://www.gob.cl/noticias/nuevo-servicio-transporte-publico-santa-juana-concepcion-buses-caracteristicas-tarifas-rebajadas/">Gob.cl, Frecuencia y app Red Regional</SourceLink>
          <SourceLink href="https://dtpr.gob.cl/ministro-juan-carlos-munoz-y-empresa-de-buses-firman-contrato-para-nuevo-servicio-santa-juana-concepcion/">DTPR 31-ene-2024, Frecuencia máxima</SourceLink>
          <SourceLink href="https://kupos.cl/en/bus/tickets/santa-juana/concepcion">kupos.cl · Santa Juana → Concepción</SourceLink>
          <SourceLink href="https://kupos.cl/en/bus/tickets/concepcion/santa-juana">kupos.cl · Concepción → Santa Juana</SourceLink>
          <SourceLink href="https://kupos.cl/es/pasajes/bus/transportes-santa-juana">kupos.cl · Transportes Santa Juana (página de la empresa, primera salida 05:30)</SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/07/15/importante-hito-en-santa-juana-inauguran-primer-servicio-de-transporte-subsidiado-en-la-comuna.shtml">BioBioChile 15-jul-2024, Salidas diarias</SourceLink>
          <SourceLink href="https://sabes.cl/2025/01/16/santa-juana-acusa-disminucion-frecuencias-transporte-publico-comuna/">Sabes.cl 16-ene-2025, Baja de salidas</SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifas">
        <DataTable columns={['Categoría', 'Tarifa', 'Notas']} bodyClassName="divide-y">
          <tr>
            <td className="px-3 py-2 font-medium">Adulto</td>
            <td className="px-3 py-2 font-mono">$1.000</td>
            <td className="px-3 py-2 text-muted-foreground">
              Desde el 15-jul-2024 (antes $1.700). No encontré reajuste
              publicado hasta el 25-nov-2026.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Estudiante TNE</td>
            <td className="px-3 py-2 font-mono">$330</td>
            <td className="px-3 py-2 text-muted-foreground">33 % de la tarifa adulto.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Adulto mayor (65+)</td>
            <td className="px-3 py-2 font-mono">Gratis</td>
            <td className="px-3 py-2 text-muted-foreground">
              Según las bases. En el resto de los buses de la región la
              rebaja es de 50 % (DTPR 2026).
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Discapacidad / menores de 7 años</td>
            <td className="px-3 py-2 font-mono">Gratis</td>
            <td className="px-3 py-2 text-muted-foreground">Menores acompañados.</td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          El contrato incluye un mecanismo de ajuste tarifario. Se paga en
          efectivo a bordo; hay compra anticipada en transportessantajuana.cl y
          kupos.cl.
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/10/con-tarifa-rebajada-nuevos-buses-entre-santa-juana-y-concepcion-inician-servicio-la-proxima-semana.html">Diario Concepción 10-jul-2024, Tarifas y ajuste</SourceLink>
          <SourceLink href="https://www.gob.cl/noticias/nuevo-servicio-transporte-publico-santa-juana-concepcion-buses-caracteristicas-tarifas-rebajadas/">Gob.cl, Tabla tarifaria completa</SourceLink>
        </Sources>
      </Section>

      <Section title="Licitación y operador">
        <p>
          La licitación{' '}
          <SourceLink href="https://dtpr.mtt.gob.cl/consultalicitaciones/webpage/ConsultaLicitaciones.aspx?id=5927">ELC0007</SourceLink>{' '}
          (conectividad al transporte rural de Santa Juana) fue la primera del
          Biobío en más de 10 años. Se adjudicó por decreto MTT N°93/2023 a{' '}
          <strong>Sociedad de Transporte de Pasajeros Santa Juana SpA</strong>{' '}
          (Transportes Santa Juana), sociedad nueva de inversionistas locales
          con experiencia en transporte. La inversión estatal fue de ~USD 4
          millones (subsidio + flota). En 2026 la DTPR sigue listando el
          sistema como subsidiado; no hay noticias de nueva licitación,
          término anticipado ni cambio de operador.
        </p>
        <KeyValueList
          items={[
            ['Bases y ofertas', 'Bases en jun-2023; apertura en ago-2023 con 3 postulantes.'],
            ['Adjudicación', 'Decreto N°93/2023 (5-dic-2023; publicado el 5-ene-2024).'],
            ['Contrato', 'Firmado el 30-ene-2024. Inicio el 15-jul-2024; ceremonia el 19-jul.'],
            ['Operador', 'Sitio transportessantajuana.cl; redes @transportessantajuana; representante Arturo Giusti (ceremonia de firma).'],
          ]}
        />
        <Sources>
          <SourceLink href="https://dtpr.mtt.gob.cl/consultalicitaciones/webpage/ConsultaLicitaciones.aspx?id=5927">DTPR Consulta licitaciones, ELC0007</SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/01/30/mtt-y-empresa-de-buses-firman-contrato-para-nuevo-servicio-santa-juana-concepcion.html">Diario Concepción 30-ene-2024, Firma de contrato</SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">DPR Biobío 22-jul-2024, Inauguración + cifras de inversión</SourceLink>
          <SourceLink href="https://transportessantajuana.cl/">transportessantajuana.cl</SourceLink>
          <SourceLink href="https://www.instagram.com/transportessantajuana/">Instagram @transportessantajuana</SourceLink>
          <SourceLink href="https://www.gob.cl/noticias/nuevo-servicio-transporte-publico-santa-juana-concepcion-buses-caracteristicas-tarifas-rebajadas/">Gob.cl, Comunicado oficial</SourceLink>
        </Sources>
      </Section>

      <Section title="Trazado">
        <p>
          Cruza el Biobío por el <strong>Puente Juan Pablo II</strong> (no por
          Llacolén) y usa la Ruta 156 (Ruta de la Madera) entre Santa Juana y
          San Pedro de la Paz. Hitos: Biotrén Juan Pablo II, Vega Monumental,
          Av. Los Carrera, Estadio Ester Roa y Terminal Collao. Son ~52 km; el
          tiempo oficial del servicio licitado no está publicado.
        </p>
        <p className="text-[12px]">
          <MapLink route="201">Ver la 201 en el mapa →</MapLink>
          {' · '}
          <MapLink terminal="osm-way-135488014">
            Estación Intermodal Concepción →
          </MapLink>
        </p>
        <Sources>
          <SourceLink href="https://sabes.cl/2024/07/16/nuevo-transporte-publico-concepcion-santa-juana-esta-operativo-revisa-horarios-y-valores/">Sabes.cl 16-jul-2024, Trazado calle por calle</SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">DPR Biobío 22-jul-2024, Hitos intermedios</SourceLink>
        </Sources>
      </Section>

      <Section title="Pago electrónico (BusPay)">
        <p>
          Santa Juana será el primer servicio rural del país con pago
          electrónico. Según BioBioChile (ago-2026), la marcha blanca partía en
          noviembre y la operación completa se esperaba hacia febrero de 2027;
          aún no hay confirmación de que la 201 cobre con tarjeta. Detalle en{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            BusPay
          </a>
          .
        </p>
      </Section>

      <CollapsibleSection title="Flota">
        <KeyValueList
          items={[
            ['Buses', '23 nuevos Agrale MT9000 (Euro V), representados por Andes Motor: 17 estándar y 6 con estándar RED (piso bajo, rampa).'],
            ['2026', 'La DTPR sigue declarando 23 buses, 6 de alto estándar (ficha Biobío 2026, jun-2026).'],
            ['Distinción', 'Primeros buses RED entregados en el Biobío.'],
            ['Equipamiento', 'GPS, cámaras, contadores de pasajeros, letrero LED, WiFi, USB y aire acondicionado.'],
            ['Conductoras', '8 mujeres (las bases exigían 2).'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.andesmotor.cl/-/entregan-primeros-buses-con-estandar-red-para-la-region-del-biobio-conectaran-santa-juana-con-concepcion">Andes Motor, Entrega de flota</SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">DPR Biobío, Equipamiento y compromiso laboral</SourceLink>
          <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf">DTPR · Ficha Biobío 2026 (jun-2026)</SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Línea de tiempo">
        <Timeline
          items={[
            { date: 'Jun-ago 2023', event: 'Bases de la licitación ELC0007 y apertura de ofertas (3 postulantes).' },
            { date: '5-dic-2023', event: 'Adjudicación por decreto MTT N°93/2023.' },
            { date: '30-ene-2024', event: 'Firma de contrato con el ministro Juan Carlos Muñoz.' },
            { date: '15-jul-2024', event: 'Inicio de operaciones.' },
            { date: 'Sep-2024', event: 'Quejas por espacio entre asientos; la SEREMI confirma el incumplimiento.' },
            {
              date: 'Sep 2025',
              event: 'MTT recibe 6 ofertas para el pago electrónico.',
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: 'Ene 2026',
              event: 'Adjudicación del pago electrónico al Consorcio Buspay.',
              source: {
                href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml',
                label: 'BioBioChile',
              },
            },
            {
              date: 'Nov 2026',
              event: 'Marcha blanca prevista, con efectivo y tarjeta en paralelo.',
              source: {
                href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/05/18/en-noviembre-comenzara-marcha-blanca-para-pago-con-tarjetas-en-micros-del-gran-concepcion.shtml',
                label: 'BioBioChile · 18-may-2026',
              },
            },
          ]}
        />
        <Sources>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">Subtrans, Consulta diseño de tarjeta</SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Issues y críticas">
        <IssueNotice title="Septiembre 2024 · Espacio entre filas de asientos">
          La SEREMITT Biobío confirmó que la separación entre filas no cumplía
          lo licitado. El operador se comprometió a quitar una fila de asientos
          por bus. No hay verificación posterior del cumplimiento.
          <Sources>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/09/24/buses-a-santa-juana-todavia-no-se-corrige-la-poca-distancia-entre-asientos-para-pasajeros.html">Diario Concepción 24-sep-2024</SourceLink>
          </Sources>
        </IssueNotice>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Salidas de sábado, domingo y festivos (la lista del operador leída es de un miércoles; el GTFS solo trae un programa a intervalo fijo).</li>
          <li>Si la lista del operador incluye la 201 AU (no la separa).</li>
          <li>Salidas desde Santa Juana antes de las 06:30 (la página de la empresa en kupos.cl dice 05:30; la lista del día empieza a las 06:30).</li>
          <li>Tiempo de viaje medido en la calle (el operador declara 1 h 54 min a 1 h 57 min).</li>
          <li>Flota tras jul-2026: la prensa habla de 25 buses en operación, pero no encontramos una fuente verificable; el visor usa los 23 de la DTPR.</li>
          <li>Tarifa vigente en 2026 y fecha exacta en que la 201 empiece a cobrar con BusPay.</li>
          <li>Duración del contrato (decreto N°93/2023 íntegro) y RUT de la sociedad.</li>
          <li>Cumplimiento del compromiso de espacio entre asientos.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          ¿Tienes una foto del cartel de horarios de fin de semana, el tiempo
          de viaje observado o una tarifa pagada con fecha? Abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/ruta-201-santa-juana.tsx">ruta-201-santa-juana.tsx</SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
