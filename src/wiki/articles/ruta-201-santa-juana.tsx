// Ruta 201 / 201 AU · Concepción ↔ Santa Juana
//
// Servicio inaugurado el 15-jul-2024 bajo la licitación DTPR ELC0007,
// primera del Biobío en más de 10 años. Trazado y horario programado del
// visor: GTFS oficial DTPR (versión 20250228), cotejado el 24-nov-2026.
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
        regional. <strong>Pendientes</strong>: tabla horaria real, duración
        del contrato y tarifa vigente en 2026 (ver "Datos pendientes").
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Servicios', value: '201 · 201 AU' },
          { label: 'Operador', value: 'Transportes Santa Juana SpA' },
          { label: 'Tarifa adulto', value: '$1.000 (jul-2024)' },
          { label: 'Flota', value: '23 buses (6 AU)' },
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
            : el visor dibuja trazado, paraderos y horario programado de la 201
            y la 201 AU.
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

      <Section title="En el visor (GTFS oficial)">
        <p>
          La 201 y la 201 AU vienen en el GTFS oficial de la DTPR (programa
          del 28-feb-2025; su calendario venció el 31-dic-2025, pero es la
          última publicación). El visor las rotula «Interurbano Santa Juana» y
          las muestra con trazado y paraderos por sentido y horario programado
          por día. El modo <strong>Micros en el mapa · Horario</strong> estima
          dónde debería ir cada bus según ese horario: no es GPS.
        </p>
        <KeyValueList
          items={[
            ['201, lunes a viernes', '220 salidas hacia Concepción (05:38 a 23:53) y 200 hacia Santa Juana (06:54 a 23:29); una cada ~5 min; ~2 h 46 min de viaje programado.'],
            ['201, fin de semana', 'Sábado 92 salidas por sentido; domingo 82 hacia Concepción y 88 hacia Santa Juana; una cada ~10 min.'],
            ['201-AU', 'Lunes a viernes 55 salidas hacia Concepción y 29 hacia Santa Juana; sábado 7 y 6; domingo 1 y 2.'],
            ['Festivos', 'El GTFS no los declara: un feriado se muestra con el horario normal de ese día.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Una salida cada 5 min con viajes de casi tres horas exigiría muchos
          más buses que los 23 del contrato. Hipótesis editorial: el programa
          declara frecuencias máximas, no salidas reales (ver{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción · Limitaciones
          </a>
          ).
        </p>
        <p className="text-[12px]">
          <MapLink route="201">Ver la 201 en el mapa →</MapLink>
        </p>
        <Sources>
          <SourceLink href="https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/">DTPR · GTFS Gran Concepción (versión 20250228)</SourceLink>
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
            ['Santa Juana → Concepción', 'Primera salida 05:30, última 23:45.'],
            ['Concepción → Santa Juana', 'Primera salida 06:45, última 23:20.'],
            ['Frecuencia máxima', 'Hasta 10 buses por hora en punta (ministro Juan Carlos Muñoz, 2024).'],
            ['Salidas diarias', 'Prensa: sin cifra exacta (más de 80). GTFS: 420 de la 201 y 84 de la 201 AU de lunes a viernes.'],
            ['Fin de semana y festivos', 'Hay tabla diferenciada para sábado y domingo en el GTFS; los festivos no están publicados.'],
            ['Tiempo real', 'App Red Regional de Movilidad (buscar "201").'],
          ]}
        />
        <Sources>
          <SourceLink href="https://sabes.cl/2024/07/16/nuevo-transporte-publico-concepcion-santa-juana-esta-operativo-revisa-horarios-y-valores/">Sabes.cl, Comunicado MTT con ventana operativa</SourceLink>
          <SourceLink href="https://www.gob.cl/noticias/nuevo-servicio-transporte-publico-santa-juana-concepcion-buses-caracteristicas-tarifas-rebajadas/">Gob.cl, Frecuencia y app Red Regional</SourceLink>
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
            ['Distinción', 'Primeros buses RED entregados en el Biobío.'],
            ['Equipamiento', 'GPS, cámaras, contadores de pasajeros, letrero LED, WiFi, USB y aire acondicionado.'],
            ['Conductoras', '8 mujeres (las bases exigían 2).'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.andesmotor.cl/-/entregan-primeros-buses-con-estandar-red-para-la-region-del-biobio-conectaran-santa-juana-con-concepcion">Andes Motor, Entrega de flota</SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">DPR Biobío, Equipamiento y compromiso laboral</SourceLink>
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
          <li>Tabla horaria real y horario de festivos (el GTFS no los declara; consulta a la DTPR Biobío).</li>
          <li>Si las ~420 salidas diarias del GTFS son reales o frecuencias máximas.</li>
          <li>Tiempo de viaje real (el GTFS programa ~2 h 46 min).</li>
          <li>Tarifa vigente en 2026 y fecha exacta en que la 201 empiece a cobrar con BusPay.</li>
          <li>Duración del contrato (decreto N°93/2023 íntegro) y RUT de la sociedad.</li>
          <li>Cumplimiento del compromiso de espacio entre asientos.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          ¿Tienes una foto del cartel de horarios, el tiempo de viaje observado
          o una tarifa pagada con fecha? Abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/ruta-201-santa-juana.tsx">ruta-201-santa-juana.tsx</SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
