// Perímetro de Exclusión de Tomé: ficha institucional / jurídica del
// segundo perímetro del Biobío. La operación del corredor (paraderos,
// trazado, frecuencias) vive en `concepcion-tome.tsx`; el pago
// electrónico, en `buspay.tsx`.
//
// Cerrado con fuente primaria (DTPR, Res. Ex. 2731/2026, 19-jun-2026):
// el PE se estableció por Res. Ex. 1929/2016 del MTT, las condiciones
// de operación son la Res. 22/2021, el contrato de adscripción con la
// Sociedad de Transportes Tomé SpA lo aprobó el Decreto Exento 1235/2022
// y el recaudo electrónico en Tomé lo paga el MTT.
// Pendiente: RUT/RNTPP, fecha del decreto de 2016, polinomio, tarifas
// TNE/AM y fecha de vencimiento del contrato.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  IssueNotice,
  KeyValueList,
  NewsPulse,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

const LINK = 'underline underline-offset-2';
const RES_2731 = 'https://dtpr.gob.cl/wp-content/uploads/2026/06/02-06ModRes-22-Tome_recaudo-electronico_firmado_LDGC.pdf';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function PerimetroExclusionTome() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado con fuente primaria de la DTPR (jun-2026) y
        prensa regional.</strong> Resolución de creación, condiciones de
        operación, operador, inicio (10-mar-2022), tarifas desde
        23-feb-2025 y recaudo electrónico a costo del MTT tienen
        fuente. <strong>Pendientes</strong>: RUT y RNTPP del operador,
        fecha exacta del acto de 2016, polinomio, tarifas TNE y adulto
        mayor, y vencimiento del contrato. La operación del corredor
        está en{' '}
        <a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a>.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Operación desde', value: '10-mar-2022' },
          { label: 'Operador', value: 'Soc. de Transportes Tomé SpA' },
          { label: 'Servicios', value: '401 · 401Y · 411 · 421' },
          { label: 'Tarifa', value: '$780 Tomé · $830 Dichato' },
          { label: 'Vigencia', value: '60 meses' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Segundo perímetro del Biobío (art. 3° de la Ley 18.696).
            Creado por la <strong>Res. Ex. 1929/2016</strong> del MTT,
            con operación desde el <strong>10-mar-2022</strong>.
          </>,
          <>
            <strong>Operador único</strong>: Sociedad de Transportes Tomé
            SpA, con los servicios 401, 401Y, 411 y 421.
          </>,
          <>
            Tarifa desde el 23-feb-2025: <strong>$780</strong>{' '}
            Concepción ↔ Tomé y <strong>$830</strong> Concepción ↔ Dichato.
          </>,
          <>
            Tomé está en el pago electrónico, financiado por el MTT. Ver{' '}
            <a href="/wiki/buspay" className={LINK}>BusPay</a>.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '19-jun-2026',
            title: 'El MTT modifica el perímetro para el recaudo electrónico',
            detail:
              'La Res. Ex. 2731/2026 de la DTPR modifica las condiciones de operación (Res. 22/2021): el recaudo electrónico en Tomé lo contrata y paga el MTT, es obligatorio para el operador y agrega multas por mal uso del equipo y por no enviar datos AVL. El operador firmó su conformidad el 23-oct-2025.',
            source: { href: RES_2731, label: 'DTPR · Res. Ex. 2731/2026' },
          },
          {
            date: '23-nov-2026',
            title: 'Centro de atención en Tomé y marcha blanca el 1-dic',
            detail:
              'La seremi ubica un centro de atención en Ignacio Serrano 1225, Tomé. La marcha blanca del pago electrónico parte el 1-dic-2026.',
            source: {
              href: 'https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta',
              label: 'Canal 9 · 23-nov-2026',
            },
          },
        ]}
      />

      <Section title="Qué es y marco legal">
        <p>
          Régimen del MTT que rige el corredor norte{' '}
          <strong>Concepción ↔ Penco ↔ Lirquén ↔ Tomé ↔ Dichato</strong>.
          Usa la misma facultad que el{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className={LINK}>
            PE Gran Concepción 2024
          </a>
          : el art. 3° de la Ley 18.696
          (
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN Ley Chile
          </SourceLink>
          ).
        </p>
        <KeyValueList
          items={[
            ['Creación', <>Res. Ex. N° 1929 de 2016 del MTT, que fijó el área geográfica. Wikipedia lo fecha en julio de 2016 y lo atribuye al ministro Andrés Gómez-Lobo; el mes no está cotejado con el acto (<SourceLink href={RES_2731}>DTPR · Res. Ex. 2731/2026</SourceLink>).</>],
            ['Condiciones de operación', 'Res. N° 22 de 2021 del MTT, tras cerrar la negociación con los operadores vigentes.'],
            ['Contrato', 'Decreto Exento N° 1235 de 2022: contrato de adscripción y subsidio entre el MTT y la Sociedad de Transportes Tomé SpA.'],
            ['Inicio', '10-mar-2022 (Oficio 5929 de la Seremi, 9-mar-2022).'],
            ['Vigencia', '60 meses desde que quede tramitado el decreto que aprueba el contrato. Esa fecha no consta: el vencimiento queda pendiente.'],
            ['Última modificación', 'Res. Ex. 2731/2026 DTPR (19-jun-2026): recaudo electrónico y sanciones.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 18.696 (art. 3°, base de los perímetros)
          </SourceLink>
          <SourceLink href="https://dtpr.gob.cl/pe/tome/">
            DTPR · Perímetro de Tomé (resoluciones, indicadores, GTFS)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml">
            BioBioChile · 11-mar-2022, Puesta en operación
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción (sección Tomé)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Alcance">
        <KeyValueList
          items={[
            ['Tomé', '54.946 hab. (Censo 2017). Tomé urbano y Tomé Alto, Bellavista, Dichato, Coliumo, Cocholgüe y Pingueral; Rafael y Menque con menos frecuencia.'],
            ['Penco', '47.367 hab. (Censo 2017). El perímetro cruza Penco centro y Lirquén; la operación urbana de Penco es del PE Gran Concepción.'],
            ['Concepción', 'Solo origen y destino: terminal en Angol esquina Manuel Rodríguez.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Entre Concepción, Penco y Lirquén el eje lo cubren también los
          servicios urbanos del PE Gran Concepción ($580). El PE Tomé es
          exclusivo en Lirquén → Tomé → Dichato. Detalle en{' '}
          <a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a>.
        </p>
        <Sources>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8111">
            BCN · Reportes comunales Tomé 2017
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8107">
            BCN · Reportes comunales Penco 2017
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Operador único: Transportes Tomé">
        <KeyValueList
          items={[
            ['Razón social', 'Sociedad de Transportes Tomé SpA (unidad de negocio UNBT), según el contrato aprobado por el Decreto Exento 1235/2022.'],
            ['RUT y RNTPP', 'Pendientes.'],
            ['Portavoz', 'Bernardo Montoya (declaraciones, may-2025).'],
            ['Flota', '71 buses a fines de 2024 (Wikipedia; sin cotejo con el padrón DTPR).'],
            ['Servicios', <>401, 401Y, 411 y 421. Detalle en <a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a>.</>],
            ['Terminal', 'Angol esquina Manuel Rodríguez, Concepción.'],
          ]}
        />
        <PendingBanner>
          <strong>Pendiente:</strong> RUT, N° RNTPP, vencimiento del
          contrato y orígenes societarios. La versión anterior de este
          artículo atribuía el origen a una fusión de operadores
          históricos (Buses Costa Azul S.A. y otros) en 2022; no está
          cotejada y no aparece en las fuentes primarias. Vía: Ley de
          Transparencia a la DTPR Biobío.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
            Diario Concepción · 7-may-2025, Declaraciones de Bernardo Montoya
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Transporte público Gran Concepción (flota Transportes Tomé)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifa y polinomio">
        <DataTable columns={['Categoría', 'Partida (10-mar-2022)', 'Desde 23-feb-2025', 'Nota']} bodyClassName="divide-y">
          <tr>
            <td className="px-3 py-2 font-medium">Concepción ↔ Tomé</td>
            <td className="px-3 py-2 font-mono">$750</td>
            <td className="px-3 py-2 font-mono">$780</td>
            <td className="px-3 py-2 text-[12px] text-muted-foreground">La partida bajó $150 respecto de $900.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Concepción ↔ Dichato</td>
            <td className="px-3 py-2 font-mono">No publicada</td>
            <td className="px-3 py-2 font-mono">$830</td>
            <td className="px-3 py-2 text-[12px] text-muted-foreground">Bajó $200 en 2022.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">TNE · adulto mayor</td>
            <td className="px-3 py-2 font-mono" colSpan={2}>No publicadas</td>
            <td className="px-3 py-2 text-[12px] text-muted-foreground">Rebajas estándar (~33% y ~50%), sin cifra.</td>
          </tr>
        </DataTable>
        <p className="text-[12px]">
          La tarifa se ajusta con polinomio (diésel, neumático, bus,
          mano de obra); la DTPR dice que impide alzas injustificadas
          (
          <SourceLink href="https://dtpr.gob.cl/pe/tome/">DTPR · Tomé</SourceLink>
          ). El alza de feb-2025 acompañó la del Gran Concepción ($560
          → $580). No hay fuente de alzas posteriores: las tarifas
          quedan como las de feb-2025, sin reconfirmar en 2026.
        </p>
        <PendingBanner>
          <strong>Pendiente:</strong> coeficientes del polinomio y tarifas
          TNE y adulto mayor.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml">
            BioBioChile · 11-mar-2022, Tarifa inicial $750
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/02/17/gran-concepcion-pasaje-de-transporte-publico-registrara-alza-de-20-desde-el-proximo-domingo.shtml">
            BioBioChile · 17-feb-2025, Tomé $780, Dichato $830
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html">
            Diario Concepción · 14-feb-2025, Alza en Gran Concepción y Tomé
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Comparación con el PE Gran Concepción">
        <DataTable columns={['', 'PE Tomé', 'PE Gran Concepción 2024']}>
          <tr>
            <td className="px-3 py-2 font-medium">Inicio</td>
            <td className="px-3 py-2">10-mar-2022</td>
            <td className="px-3 py-2">1-ene-2024</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Operadores</td>
            <td className="px-3 py-2"><strong>1</strong> (una UN)</td>
            <td className="px-3 py-2">~35 empresas en 36 UN</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Tarifa adulto</td>
            <td className="px-3 py-2">$780 / $830</td>
            <td className="px-3 py-2">$580</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Flota</td>
            <td className="px-3 py-2">71 buses (2024)</td>
            <td className="px-3 py-2">~1.700 estimados</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">GTFS</td>
            <td className="px-3 py-2">Propio y dentro del de Gran Concepción</td>
            <td className="px-3 py-2">GTFS DTPR (28-feb-2025)</td>
          </tr>
        </DataTable>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión Gran Concepción (comparación)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Pago electrónico">
        <p>
          Tomé entra en el sistema BusPay. Para Tomé, el MTT definió una
          licitación pública con financiamiento estatal, y la Res. Ex.
          2731/2026 la hizo obligatoria para el operador
          (
          <SourceLink href={RES_2731}>DTPR · 19-jun-2026</SourceLink>
          ). Hay un centro de atención en Tomé (Ignacio Serrano 1225). La
          marcha blanca parte el 1-dic-2026. Detalle, tarifas y recarga
          en{' '}
          <a href="/wiki/buspay" className={LINK}>BusPay</a>.
        </p>
        <Sources>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026, Adjudicación al Consorcio Buspay
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026, Cobertura BusPay incluye PE Tomé
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Consulta ciudadana diseño de tarjeta
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Corredor MOP Ruta 150">
        <p>
          El MOP impulsa un corredor exclusivo de transporte público en
          la Ruta 150 (Rotonda Bonilla ↔ Enlace Penco). El contrato no
          llega a Tomé y el municipio pidió extenderlo
          (
          <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
            Tomé al día · nov-2025
          </SourceLink>
          ). Detalle en{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className={LINK}>
            Corredores MOP del Biobío
          </a>{' '}
          y en{' '}
          <a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a>.
        </p>
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025, Ofertas Ruta 150
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Fiscalización y riesgo monopólico">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <strong>Sin competencia interna.</strong> Si el operador baja
            la frecuencia, no hay alternativa dentro del régimen. La
            fiscalización recae en la Seremi y la DTPR (
            <a href="/wiki/seremitt-dtpr-biobio" className={LINK}>Seremitt y DTPR</a>
            ).
          </li>
          <li>
            <strong>Sanciones nuevas (19-jun-2026):</strong> multa de 5
            UF por cada mes de descuido del equipo embarcado y de 5 UF
            por evento de AVL parcial o no enviado. Si no habilita el
            recaudo: término del contrato o multa de 20% del subsidio
            mensual (
            <SourceLink href={RES_2731}>Res. Ex. 2731/2026</SourceLink>
            ).
          </li>
          <li>
            <strong>May-2025:</strong> la Unión Comunal de Juntas de
            Vecinos logró un refuerzo de salidas en menos de 20 días
            (
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
              Diario Concepción · 7-may-2025
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Indicador de evaluación:</strong> la DTPR publicó el
            Indicador N° 4 de la unidad BT (mar-2025 a feb-2026) el
            12-jun-2026; no leí su contenido.
          </li>
        </ul>
        <IssueNotice title="Temporada alta">
          El régimen no obliga a reforzar en verano. El 411 a Dichato y
          Pingueral colapsa en enero y febrero y fines de semana largos,
          sin refuerzos contractuales documentados.
        </IssueNotice>
        <PendingBanner>
          <strong>Pendiente:</strong> multas o procesos sancionatorios
          aplicados a Transportes Tomé; la DTPR no los publica.
        </PendingBanner>
      </Section>

      <Section title="Cobertura del visor">
        <p>
          La DTPR publica un GTFS propio (<code className="font-mono">tome.zip</code>,
          versión Tomé20230308) y el{' '}
          <a href="/wiki/gtfs-gran-concepcion" className={LINK}>GTFS de Gran Concepción</a>{' '}
          (20250228), que trae los mismos cuatro servicios. El visor usa
          este último: desde el 24-nov-2026 los servicios de Tomé
          muestran trazado por sentido, paraderos y horario programado,
          rotulados &ldquo;Interurbano Tomé&rdquo;.
        </p>
        <Sources>
          <SourceLink href="https://dtpr.gob.cl/pe/tome/gtfs/">
            DTPR · Tomé · GTFS (tome.zip, versión Tomé20230308)
          </SourceLink>
          <SourceLink href="https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/">
            DTPR · Gran Concepción · GTFS (versión 20250228)
          </SourceLink>
        </Sources>
      </Section>

      <CollapsibleSection title="Cronología institucional">
        <Timeline
          items={[
            {
              date: '2016',
              event: 'Res. Ex. 1929 del MTT establece el perímetro en Tomé. Wikipedia lo ubica en julio y lo atribuye al ministro Gómez-Lobo.',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '2021',
              event: 'Res. 22 del MTT aprueba las condiciones de operación, tras la negociación con los operadores.',
              source: { href: RES_2731, label: 'DTPR · Res. Ex. 2731/2026' },
            },
            {
              date: '10-mar-2022',
              event: 'Parte el perímetro. La tarifa Concepción ↔ Tomé baja a $750 (rebaja de $150) y la de Dichato en $200. Operador único: Transportes Tomé.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml', label: 'BioBioChile · 11-mar-2022' },
            },
            {
              date: '1-ene-2024',
              event: 'Parte el PE Gran Concepción. Concepción ↔ Penco ↔ Lirquén queda cubierto por ambos regímenes.',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '23-feb-2025',
              event: 'Reajuste polinómico: $780 Tomé y $830 Dichato.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/02/17/gran-concepcion-pasaje-de-transporte-publico-registrara-alza-de-20-desde-el-proximo-domingo.shtml', label: 'BioBioChile · 17-feb-2025' },
            },
            {
              date: '23-oct-2025',
              event: 'El operador firma una declaración jurada de conformidad con el recaudo financiado por el MTT.',
              source: { href: RES_2731, label: 'DTPR · Res. Ex. 2731/2026' },
            },
            {
              date: '28-ene-2026',
              event: 'El MTT adjudica BusPay al Consorcio Buspay; la cobertura incluye Tomé.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
            {
              date: '19-jun-2026',
              event: 'Res. Ex. 2731/2026 modifica las condiciones de operación para el recaudo electrónico.',
              source: { href: RES_2731, label: 'DTPR · Res. Ex. 2731/2026' },
            },
            {
              date: '1-dic-2026 (programado)',
              event: 'Marcha blanca del pago electrónico en el Gran Concepción.',
              source: { href: 'https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta', label: 'Canal 9 · 23-nov-2026' },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          La cronología operacional del corredor está en{' '}
          <a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a>.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Fecha exacta (mes) de la Res. Ex. 1929/2016 y su texto íntegro.</li>
          <li>RUT y N° RNTPP de la Sociedad de Transportes Tomé SpA.</li>
          <li>Fecha de tramitación del Decreto Exento 1235/2022 y, con ella, el vencimiento de los 60 meses.</li>
          <li>Tarifas TNE y adulto mayor, y coeficientes del polinomio.</li>
          <li>Reajustes de tarifa posteriores a feb-2025.</li>
          <li>Contenido del Indicador N° 4 (mar-2025 a feb-2026) y multas aplicadas.</li>
          <li>Número de validadores y cronograma en la flota de Tomé.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía principal: Ley de Transparencia a la DTPR Biobío y al MTT.
          Aportes por pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/perimetro-exclusion-tome.tsx">
            GitHub
          </SourceLink>
          .
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Bibliografía y vínculos">
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 18.696 (art. 3°)
          </SourceLink>
          <SourceLink href={RES_2731}>
            DTPR · Res. Ex. 2731/2026 (19-jun-2026), modifica la Res. 22/2021
          </SourceLink>
          <SourceLink href="https://dtpr.gob.cl/pe/tome/">
            DTPR · Perímetro de Tomé
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Transporte público en el Gran Concepción
          </SourceLink>
        </Sources>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a>, operación del corredor.</li>
          <li><a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className={LINK}>PE Gran Concepción 2024</a>, el perímetro hermano.</li>
          <li><a href="/wiki/buspay" className={LINK}>BusPay</a>, pago electrónico.</li>
          <li><a href="/wiki/corredores-transporte-publico-mop-biobio" className={LINK}>Corredores MOP del Biobío</a>.</li>
          <li><a href="/wiki/gtfs-gran-concepcion" className={LINK}>GTFS Gran Concepción</a>.</li>
          <li><a href="/wiki/biotren-extensiones-proyectos" className={LINK}>Biotrén · extensiones y proyectos</a>.</li>
        </ul>
      </CollapsibleSection>
    </div>
  );
}
