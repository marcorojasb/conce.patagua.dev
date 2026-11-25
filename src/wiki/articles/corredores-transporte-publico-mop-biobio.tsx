// Corredores de transporte público MOP del Biobío: Ruta 160, Ruta 150 y
// Autopista Concepción-Talcahuano Tramo II. Se licitaron como concesiones
// (oferente único: Electro-Cointer / Electro-Cointer II, Grupo Azvi); en
// ago-2026 Hacienda congeló las adjudicaciones y el MOP pasó los proyectos
// a obra pública directa (Dirección de Vialidad). Estado al 2026-11-25.

import { Info } from 'lucide-react';
import { Notice } from '@/components/ui/notice';
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

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function CorredoresTransportePublicoMOPBiobio() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado con MOP Concesiones y prensa regional y
        nacional con nombre, hasta el 29-oct-2026.</strong> Licitación,
        ofertas, congelamiento de Hacienda (4-ago-2026) y paso a obra
        pública directa (6-ago-2026).{' '}
        <strong>Pendientes</strong>: el acto administrativo de la
        revocación (solo lo reporta prensa), calendario nuevo, flota
        eléctrica y financiamiento anual.
      </VerifiedBanner>

      <Notice icon={<Info />}>
        <strong>Nombre.</strong> El wiki usa "Corredores de Transporte
        Público MOP"; "electrocorredor" queda como clave de búsqueda
        porque así los llama la prensa (y se llaman los oferentes:
        Electro-Cointer). El contrato no exige flota 100% eléctrica
        (SEREMI Patricio Fierro, nov-2025).
      </Notice>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Proyectos', value: '3 (2 llamados)' },
          { label: 'Pista exclusiva', value: '~23 km' },
          { label: 'Inversión', value: '~US$ 400 M (agosto 2026)' },
          { label: 'Régimen', value: 'Obra pública directa (MOP)' },
          { label: 'Servicio', value: 'sin fecha firme' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Son pistas exclusivas para buses sobre la Ruta 160 (San Pedro
            de la Paz ↔ Coronel), la Ruta 150 (Concepción ↔ Penco) y la
            Autopista Concepción-Talcahuano Tramo II.
          </>,
          <>
            Se licitaron como concesiones a 25 años y Electro-Cointer fue
            el único oferente en ambos llamados. El 4-ago-2026 Hacienda
            congeló los decretos de adjudicación por razones fiscales.
          </>,
          <>
            Desde el 6-ago-2026 el MOP los ejecuta con fondos directos,
            vía Vialidad. Aún no hay contrato de obras ni fecha de
            inicio: primero vienen dos años de ingeniería y permisos.
          </>,
          <>
            El ministro Louis de Grange mantiene "fines de 2031" como
            meta de operación. El exministro Juan Carlos Muñoz advierte
            que sin concesión el plazo se alarga.
          </>,
          <>
            Ninguno está en el visor: las pistas no existen todavía.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '4-ago-2026',
            title: 'Hacienda congela la adjudicación a Azvi de ambos corredores',
            detail:
              'Por oficio al MOP, el ministro Jorge Quiroz dijo que los compromisos fiscales de las dos concesiones "no es posible absorber[los]" hoy. Los decretos estaban en tramitación final; la inversión conjunta bordea los US$ 400 millones.',
            source: {
              href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/04/gobierno-frena-corredores-de-transporte-publico-en-gran-concepcion-en-que-invertirian-us400-millones.shtml',
              label: 'BioBioChile · 4-ago-2026',
            },
          },
          {
            date: '5-ago-2026',
            title: 'El Gobierno da marcha atrás y confirma los corredores como obra pública',
            detail:
              'Tras el rechazo transversal a la suspensión, el gobernador Sergio Giacaman confirmó —tras reunirse con el ministro del Interior, Claudio Alvarado— que los corredores de las rutas 160 y 150 se ejecutarán, pero no como concesiones.',
            source: {
              href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/05/gobernador-anuncia-que-corredores-del-gran-concepcion-si-se-realizaran-pero-no-como-concesiones.shtml',
              label: 'BioBioChile · 5-ago-2026',
            },
          },
          {
            date: '29-oct-2026',
            title: 'Muñoz y De Grange discuten los plazos; se reporta la revocación de las adjudicaciones',
            detail:
              'De Grange dice que el proyecto "sigue avanzando" y que ambas RS se obtuvieron hace poco; Muñoz habla de "más de una década" sin concesión. La nota menciona la revocación de las adjudicaciones a Electro-Cointer II, sin fecha del acto.',
            source: {
              href: 'https://www.theclinic.cl/2026/10/29/que-mala-noticia-para-el-biobio-el-tenso-cruce-entre-juan-carlos-munoz-y-louis-de-grange-por-los-corredores-de-transporte-publico-en-concepcion/',
              label: 'The Clinic · 29-oct-2026',
            },
          },
        ]}
      />

      <Section title="Estado hoy por proyecto">
        <DataTable
          columns={['Proyecto', 'Estado al 25-nov-2026', 'Lo que viene']}
          bodyClassName="divide-y align-top text-[12px]"
        >
          <tr>
            <td className="px-3 py-2 font-medium">
              Ruta 160 · San Pedro de la Paz ↔ Coronel · ~14 km
            </td>
            <td className="px-3 py-2">
              Oferta única de Electro-Cointer (5-nov-2025, UF 4.414.000,
              ~US$ 171 M). Adjudicación congelada el 4-ago-2026; pasa a
              obra pública directa.
            </td>
            <td className="px-3 py-2">
              Ingeniería y permisos (~2 años según el MOP); sin licitación
              de obras publicada.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">
              Ruta 150 · Rotonda Bonilla ↔ Enlace Penco · 6,7 km
            </td>
            <td className="px-3 py-2">
              Oferta única de Electro-Cointer II (10-dic-2025), abierta
              la económica el 15-ene-2026. Misma suerte que la Ruta 160.
            </td>
            <td className="px-3 py-2">
              Igual. Tomé pide extender el corredor más allá de Penco;
              no está en el proyecto.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">
              Autopista Concepción-Talcahuano Tramo II · 2,6 km
            </td>
            <td className="px-3 py-2">
              Licitada junto con la Ruta 150 (UF 4.431.000 por las dos,
              ~US$ 172 M). Igual estado.
            </td>
            <td className="px-3 py-2">
              Incluye soterramiento parcial de pistas privadas en El
              Trébol; el diseño se mantiene según el MOP.
            </td>
          </tr>
        </DataTable>
        <p>
          Qué cambia con la obra pública directa, según De Grange (
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/06/de-grange-dice-que-se-mantendra-diseno-y-plazos-de-corredores-de-transporte-publico-de-gran-concepcion.shtml">
            BioBioChile · 6-ago-2026
          </SourceLink>
          ): paga el MOP desde la Dirección de Vialidad, no una
          concesionaria que cobra al Fisco en cuotas por 25 años; las
          si las obras van en paralelo o por etapas se define con
          la ingeniería, según la geología de cada tramo; reconoce que
          podría haber litigios con la empresa, aunque "todavía no ha
          salido el decreto de adjudicación". Según De Grange, el cambio
          ahorra más de 20% en costos (
          <SourceLink href="https://www.theclinic.cl/2026/10/29/que-mala-noticia-para-el-biobio-el-tenso-cruce-entre-juan-carlos-munoz-y-louis-de-grange-por-los-corredores-de-transporte-publico-en-concepcion/">
            The Clinic · 29-oct-2026
          </SourceLink>
          ).
        </p>
        <p>
          El 20-ago-2026 la Dirección General de Concesiones aún no
          materializaba el retiro de la toma de razón de la concesión
          adjudicada a Azvi, y los alcaldes de Lota, San Pedro y Penco
          pedían claridad sobre plazos (
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/20/corredores-de-ruta-160-y-camino-a-penco-siguen-en-incertidumbre-mop-aun-no-retira-concesion.shtml">
            BioBioChile · 20-ago-2026
          </SourceLink>
          ).
        </p>
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/project/corredor-de-transporte-publico-ruta-160/">
            MOP Concesiones · ficha proyecto Ruta 160
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/project/corredores-de-transporte-publico-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · ficha proyecto Ruta 150 + Conce-Talcahuano II
          </SourceLink>
        </Sources>
        <PendingBanner>
          <strong>Sin verificar:</strong> el decreto o resolución que
          revoca las adjudicaciones (The Clinic lo reporta sin fecha; no
          lo encontré en el Diario Oficial ni en MOP Concesiones); fecha de
          inicio de obras; si Electro-Cointer reclamará; monto del
          presupuesto MOP 2027 para estos proyectos.
        </PendingBanner>
      </Section>

      <Section title="Qué son y por qué importan">
        <p>
          Segregan, en el eje de las troncales más cargadas, una pista
          bidireccional exclusiva para buses, con paraderos en mediana,
          cruces peatonales, ciclovía y veredas. Serían los{' '}
          <strong>primeros corredores segregados fuera de Santiago</strong>:
          más de 23 km de pista y ~US$ 250 M en la licitación de 2025 (
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
            Diario Concepción · 7-nov-2025
          </SourceLink>
          ). Las cifras de prensa de ago-2026 suben a ~US$ 400 M para las
          dos obras; el artículo no reconcilia ambas.
        </p>
        <p>
          Hoy las líneas que circularían por ellos comparten pista con el
          tráfico: Ruta 160 con la 302 y la 304; Ruta 150 con 17MC, 30MB,
          30NC, 30QE, 31DF, 50YP, 62HM y los interurbanos 401/411/421
          (ver{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          ); el Tramo II con servicios a Hualpén y Talcahuano.
        </p>
        <Sources>
          <SourceLink href="https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/">
            MOP · 5-nov-2025, Oferta Electro-Cointer Ruta 160
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025, Ofertas Ruta 150 + Conce-Talcahuano II
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-conocio-la-oferta-economica-del-consorcio-electro-cointer-ii-para-desarrollar-el-proyecto-de-corredores-de-transporte-publico-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 15-ene-2026, Apertura económica Electro-Cointer II
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Buses, tren y pago">
        <p>
          <strong>Buses.</strong> La concesión incluía solo la pista, no buses; los buses siguen en el régimen MTT del{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro de Exclusión 2024
          </a>
          . Flota eléctrica: no hay compromiso, y la compra de buses sigue
          sin definir.
        </p>
        <p>
          <strong>Biotrén.</strong> Compiten por el mismo presupuesto
          regional con las extensiones a Penco y Lota. Para el estado de
          esas extensiones y el debate bus-tren, ver{' '}
          <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
            Biotrén · extensiones y proyectos
          </a>
          . Penco-Lirquén y los corredores no son excluyentes en lo
          técnico.
        </p>
        <p>
          <strong>Pago.</strong> La integración tarifaria depende de{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            BusPay
          </a>
          ; los corredores, de operar, llegarían cuando el sistema ya
          lleve años en régimen.
        </p>
      </Section>

      <CollapsibleSection title="Marco legal y financiamiento original (concesión)">
        <KeyValueList
          items={[
            [
              'Régimen',
              'Ley de Concesiones (DS MOP 900 de 1996), Dirección General de Concesiones. Los llamados se publicaron en el Diario Oficial tras la visa de la CGR del 13-nov-2024.',
            ],
            [
              'Modelo',
              'BOT a 300 meses (25 años) desde la puesta en servicio; la concesionaria construía, mantenía y operaba la pista, y cobraba al Fisco (no al usuario) según disponibilidad y niveles de servicio.',
            ],
            [
              'Subsidio al bus',
              <>
                Separado del contrato: Ley 20.378 de 2009 (Subsidio
                Nacional al Transporte Público). Monto para estos corredores
                no publicado.
              </>,
            ],
            [
              'Oferente',
              'Cointer Concesiones S.L., filial del Grupo Azvi (Sevilla); en Chile integra (30%) el consorcio Red Norte de Aeropuertos con Sacyr.',
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Con la obra pública directa, el pago por disponibilidad y la
          concesión dejan de aplicar. El nuevo esquema contractual no está
          publicado.
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
            Diario Concepción · 13-nov-2024, Visa CGR a llamados
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-publicaron-en-el-diario-oficial-los-llamados-a-licitacion-de-dos-proyectos-de-corredores-de-transporte-publico-para-concepcion/">
            MOP Concesiones · publicación llamados Diario Oficial
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1006182">
            BCN · Ley 20.378 (Subsidio Nacional al Transporte Público)
          </SourceLink>
          <SourceLink href="https://cointer.eu/quienes-somos/">
            Cointer Concesiones S.L. · sitio corporativo (matriz)
          </SourceLink>
          <SourceLink href="https://reportediario.cl/2025/11/06/cointer-la-empresa-espanola-que-busca-construir-el-corredor-de-transporte-publico-de-la-ruta-160-en-chile/">
            Reporte Diario · 6-nov-2025, Perfil Cointer (matriz Grupo Azvi)
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Cronología">
        <Timeline
          items={[
            {
              date: '13-nov-2024',
              event: 'La CGR visa los llamados a licitación de los tres corredores; entran al Diario Oficial.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: '5-nov-2025',
              event: 'MOP recibe las ofertas de la Ruta 160. Único oferente: Consorcio Electro-Cointer (UF 4.414.000, 14 km, 25 años).',
              source: { href: 'https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/', label: 'MOP · 5-nov-2025' },
            },
            {
              date: '7-nov-2025',
              event: 'El SEREMI Patricio Fierro aclara que "electrocorredor" no implica flota 100% eléctrica y proyecta inicio de obras en 2027 (luego corrido a 2029-2030).',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html', label: 'Diario Concepción' },
            },
            {
              date: '3-dic-2025',
              event: 'Se abre la oferta económica de la Ruta 160; Electro-Cointer queda como único postulante.',
              source: { href: 'https://www.elconquistadorconcepcion.cl/2025/12/04/concesiones-ratifica-unica-oferta-para-construir-14-kilometros-de-corredor-de-transporte-publico-en-la-ruta-160/', label: 'El Conquistador Concepción · 4-dic-2025' },
            },
            {
              date: '10-dic-2025',
              event: 'Ofertas de Ruta 150 + Tramo II. Único oferente: Electro-Cointer II (UF 4.431.000, 9,3 km, 300 meses).',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones' },
            },
            {
              date: '15-ene-2026',
              event: 'Se abre la oferta económica de Electro-Cointer II; sigue la oferta única.',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-conocio-la-oferta-economica-del-consorcio-electro-cointer-ii-para-desarrollar-el-proyecto-de-corredores-de-transporte-publico-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones · 15-ene-2026' },
            },
            {
              date: '4-ago-2026',
              event: 'Hacienda congela los decretos de adjudicación a Azvi.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/04/gobierno-frena-corredores-de-transporte-publico-en-gran-concepcion-en-que-invertirian-us400-millones.shtml', label: 'BioBioChile' },
            },
            {
              date: '6-ago-2026',
              event: 'De Grange anuncia obra pública directa con Vialidad, ingeniería previa de ~2 años y operación a fines de 2031.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/06/de-grange-dice-que-se-mantendra-diseno-y-plazos-de-corredores-de-transporte-publico-de-gran-concepcion.shtml', label: 'BioBioChile' },
            },
            {
              date: '29-oct-2026',
              event: 'Se reporta la revocación de las adjudicaciones; De Grange afirma que el proyecto sigue.',
              source: { href: 'https://www.theclinic.cl/2026/10/29/que-mala-noticia-para-el-biobio-el-tenso-cruce-entre-juan-carlos-munoz-y-louis-de-grange-por-los-corredores-de-transporte-publico-en-concepcion/', label: 'The Clinic' },
            },
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Riesgos y críticas">
        <div className="space-y-2">
          <IssueNotice title="Plazos">
            El MOP mantiene la operación a fines de 2031, pero partirá con
            dos años de ingeniería. Muñoz proyecta "más de una década" sin
            concesión. Sin licitación de obras publicada, la fecha es
            declaración, no calendario.
          </IssueNotice>
          <IssueNotice title="Litigio posible">
            El MOP reconoce que podría haber litigios con Electro-Cointer;
            al 6-ago-2026 el decreto de adjudicación aún no se
            emitía.
          </IssueNotice>
          <IssueNotice title="Oferta única y estudios de demanda">
            Los dos llamados tuvieron un solo oferente. Los estudios de
            demanda no son públicos y los operadores del perímetro no han
            fijado posición sobre flota.
          </IssueNotice>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Beneficios no oficiales citados antes (empleo directo en obras del
          orden de miles, menor NOx y ruido; el PM2.5 viene sobre todo de la
          leña) no tienen cifra publicada. SEIA y RCA de cada proyecto
          siguen pendientes (el MOP dice que ambas RS se obtuvieron
          recientemente).
        </p>
      </CollapsibleSection>

      <Section title="Cobertura del visor">
        <p className="text-[13px]">
          Ningún corredor está en el visor: las pistas no existen y no hay
          GTFS ni capa <code className="font-mono">highway=busway</code> en
          OSM. Solo se ven las líneas que hoy comparten pista con el
          tráfico.
        </p>
      </Section>

      <CollapsibleSection title="Datos pendientes y vínculos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Acto administrativo de la revocación y posible litigio con Azvi.</li>
          <li>Calendario de ingeniería, licitación de obras y presupuesto anual.</li>
          <li>Política de flota eléctrica y modelo de compra de buses.</li>
          <li>Integración tarifaria BusPay ↔ Biotrén (Conecta).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a la Dirección de Vialidad y a
          Concesiones MOP; mercadopublico.cl.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>
            : ficha del corredor norte (Ruta 150).
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Recorridos interurbanos
            </a>
            : índice de los corredores troncales.
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Bibliografía y contribución">
        <Sources>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/12/03/avanza-concesion-de-corredor-de-transporte-publico-en-la-ruta-160-consorcio-cointer-presento-oferta.shtml">
            BioBioChile · 3-dic-2025, Avance Ruta 160 con Cointer
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/avanza-el-corredor-de-transporte-publico-de-la-ruta-160-con-apertura-de-la-oferta-economica/">
            Radio UdeC · dic-2025, Apertura económica Ruta 160
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022, alcalde de Penco: la Ruta 150 puede frenar el Biotrén
          </SourceLink>
          <SourceLink href="https://www.openstreetmap.org/relation/9239557">
            OSM relation 9239557 · Ruta 160 (ref=160, decreto MOP 121/2009)
          </SourceLink>
          <SourceLink href="https://www.openstreetmap.org/relation/6599805">
            OSM relation 6599805 · Ruta 150 (ref=150, decreto MOP 179/2013)
          </SourceLink>
        </Sources>
        <p className="text-[13px]">
          ¿Tienes el decreto de revocación, las bases de la nueva licitación
          o el calendario de Vialidad? Abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/corredores-transporte-publico-mop-biobio.tsx">
            github.com/marcorojasb/conce.patagua.dev
          </SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
