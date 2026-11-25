// Subsidio Nacional al Transporte Público (Ley 20.378), ficha del marco
// financiero que sostiene el transporte público regional fuera de Santiago.
// Publicada el 5-sep-2009 como "ley espejo" del subsidio al Transantiago.
//
// Prórrogas: fuentes secundarias citan las leyes 21.175 (2019) y 21.439
// (2022); la prórroga 2024-2025 y su vigencia al 2026 siguen sin cotejar
// en BCN. NO confundir con la Ley 21.659 (Seguridad Privada). DIPRES
// asigna el monto en la Ley de Presupuestos; Subtrans distribuye; la DTPR
// ejecuta en la región.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  IssueNotice,
  NewsPulse,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function SubsidioLey20378() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias y regionales.</strong>{' '}
        Origen, componentes y ejecución en el Biobío están citados. El
        presupuesto regional 2026 viene de la DTPR.{' '}
        <strong>Pendientes</strong>: número y vigencia de la última prórroga,
        monto nacional 2026 y su desagregación en DIPRES, y costo por
        pasajero. Lo no verificado queda en "Datos pendientes".
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Publicada', value: '5-sep-2009' },
          { label: 'Biobío 2026', value: '> $93 mil millones*' },
          { label: 'Ejecuta', value: 'DTPR Biobío' },
          { label: 'Prórroga', value: 'pendiente BCN' },
        ]}
      />
      <p className="-mt-3 text-[11px] text-muted-foreground">
        * Presupuesto regional que incluye la Ley 20.378 y otros subtítulos. No es el monto de la ley sola.
      </p>

      <ArticleSummary
        bullets={[
          <>
            La Ley 20.378 financia la operación del transporte público mayor
            fuera de Santiago, la renovación de flota y el reembolso de tarifas
            rebajadas (TNE, adulto mayor).
          </>,
          <>
            En el Gran Concepción paga el PE 2024, el PE de Tomé, la licitación
            de la Ruta 201 Santa Juana y las capas subsidiadas de Florida.
          </>,
          <>
            No es la Ley 21.659 (Seguridad Privada). BusPay es un contrato de
            recaudación; con qué recursos se paga queda por confirmar.
          </>,
          <>
            Vigencia: el régimen depende de prórrogas. La última no está
            cotejada en BCN.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '13-oct-2026',
            title: 'Proyecto 2027 recorta 41% el fondo de transporte del Biobío',
            detail:
              'El Fondo de Apoyo al Transporte Público y la Conectividad Regional pasaría de $25.391 a $14.868 millones. Es una línea distinta de la Ley 20.378 y el proyecto aún se tramita.',
            source: {
              href: 'https://www.diarioconcepcion.cl/politica/2026/10/13/recorte-fondos-transporte-biobio-2027.html',
              label: 'Diario Concepción · 13-oct-2026',
            },
          },
        ]}
      />

      <Section title="Aplicación al Biobío">
        <DataTable columns={['Línea', 'Qué financia', 'Estado']} bodyClassName="divide-y align-top text-[13px]">
          <tr>
            <td className="px-3 py-2 font-medium">PE Gran Concepción 2024</td>
            <td className="px-3 py-2">Subsidio operacional a las empresas de las 36 unidades de negocio. Liquidación mensual por la DTPR. Polinomio ligado a UF, combustible y salarios.</td>
            <td className="px-3 py-2">Vigente. Tarifa adulto $580 desde feb-2025.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">PE Tomé</td>
            <td className="px-3 py-2">Subsidio operacional al operador único (líneas 401, 411 y 421).</td>
            <td className="px-3 py-2">Vigente. Refuerzos may-2025 anunciados por la SEREMITT.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Ruta 201 Santa Juana (ELC0007)</td>
            <td className="px-3 py-2">Servicio licitado bajo art. 4° (zonas aisladas). 23 buses Agrale Euro V, tarifa $1.000.</td>
            <td className="px-3 py-2">Operativa desde 15-jul-2024.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Capas Florida</td>
            <td className="px-3 py-2">Zona norte, Rahuil, Poñén-Roa y servicio nocturno, bajo art. 4°.</td>
            <td className="px-3 py-2">Desde oct-2025. Sin licitar el corredor troncal.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Renovación de flota</td>
            <td className="px-3 py-2">Renueva Tu Micro (1.095 buses) y Renueva Tu Colectivo (1.063 autos, 2016-2023). Recursos del GORE de la ley espejo, aprobados cada año por el CORE.</td>
            <td className="px-3 py-2">Vigente desde 2011 (buses) y 2016 (colectivos).</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">TNE y adulto mayor</td>
            <td className="px-3 py-2">Rebaja estudiantil (TNE) y 50% a adultos desde los 65 años en buses de la región.</td>
            <td className="px-3 py-2">Vigente. Aplica también en zonas rurales.</td>
          </tr>
        </DataTable>
        <p className="text-[13px]">
          La ficha DTPR 2026 incluye el recaudo electrónico del Gran
          Concepción entre los usos del presupuesto regional. Con qué
          subtítulo se paga el contrato de BusPay no consta (ver{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">BusPay</a>).
        </p>
        <Sources>
          <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf">
            DTPR · Subsidios al transporte público, Región del Biobío 2026
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">
            DPR Biobío · 22-jul-2024, Santa Juana
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · ejecución regional
          </SourceLink>
          <SourceLink href="https://www.junaeb.cl/tne/">
            JUNAEB · Tarjeta Nacional Estudiantil
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cifras 2024-2026">
        <DataTable columns={['Concepto', 'Cifra', 'Nota']} bodyClassName="divide-y align-top text-[13px]">
          <tr>
            <td className="px-3 py-2 font-medium">Presupuesto regional 2026</td>
            <td className="px-3 py-2 font-mono tabular-nums">&gt; $93.000 millones</td>
            <td className="px-3 py-2 text-muted-foreground">Ley 20.378 más otros subtítulos. DTPR, jun-2026.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Fondo de Apoyo al Transporte Público y Conectividad Regional</td>
            <td className="px-3 py-2 font-mono tabular-nums">$25.391 → $14.868 millones</td>
            <td className="px-3 py-2 text-muted-foreground">2026 vs proyecto 2027 (−41,4%). No aprobado.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">BusPay (contrato)</td>
            <td className="px-3 py-2 font-mono tabular-nums">~$750 millones/año</td>
            <td className="px-3 py-2 text-muted-foreground">Fuente de pago sin confirmar.</td>
          </tr>
        </DataTable>
        <PendingBanner>
          <strong>Monto nacional 2026 de la Partida 19 y su desagregación por DIPRES: sin cotejar.</strong>{' '}
          La búsqueda no llegó al texto de la Ley de Presupuestos. No se publica un monto nacional.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/politica/2026/10/13/recorte-fondos-transporte-biobio-2027.html">
            Diario Concepción · 13-oct-2026, recorte del fondo
          </SourceLink>
          <SourceLink href="https://www.dipres.gob.cl/597/w3-propertyvalue-15494.html">
            DIPRES · Partida 19 - Ministerio de Transportes
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Qué es y por qué importa">
        <p>
          La <strong>Ley 20.378</strong>, publicada el <strong>5 de
          septiembre de 2009</strong>, creó el <strong>Subsidio Nacional al
          Transporte Público</strong>. Financia la operación, la renovación
          de flota y los servicios deficitarios del transporte mayor en
          todas las regiones, y el reembolso de tarifas rebajadas. Sin ella,
          buena parte del sistema regional sería inviable.
        </p>
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 20.378 (texto original)
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/subsidio-nacional-al-transporte-publico/">
            Subtrans · Subsidio Nacional al Transporte Público
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Componentes, distribución y operación">
        <DataTable columns={['Componente', 'Qué cubre', 'Base']} bodyClassName="divide-y align-top text-[13px]">
          <tr>
            <td className="px-3 py-2 font-medium">Subsidio nacional</td>
            <td className="px-3 py-2">Línea principal para la operación del transporte mayor, por región.</td>
            <td className="px-3 py-2">Ley 20.378</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Reembolso TNE</td>
            <td className="px-3 py-2">Pago al operador por cada validación con Tarjeta Nacional Estudiantil (JUNAEB).</td>
            <td className="px-3 py-2">MTT, con cargo a la ley</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Zonas aisladas</td>
            <td className="px-3 py-2">Servicios deficitarios de bien público en localidades sin demanda comercial.</td>
            <td className="px-3 py-2">Art. 4°</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Conectividad</td>
            <td className="px-3 py-2">Servicios marítimos y aéreos para zonas extremas. En el Biobío, solo si Isla Mocha lo requiere.</td>
            <td className="px-3 py-2">Ley 20.378</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Renovación de flota</td>
            <td className="px-3 py-2">Recambio de buses y colectivos (Renueva Tu Micro, Renueva Tu Colectivo).</td>
            <td className="px-3 py-2">Ley espejo y GORE</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Adulto mayor en perímetros</td>
            <td className="px-3 py-2">El contrato fija tarifa rebajada ($290 frente a $580). La diferencia se reembolsa al operador.</td>
            <td className="px-3 py-2">Ley y contrato</td>
          </tr>
        </DataTable>
        <p className="text-[13px]">
          <strong>Operación.</strong> DIPRES y el Congreso fijan el monto en
          la Ley de Presupuestos. Subtrans lo distribuye entre regiones por
          reglamento. La DTPR Biobío liquida cada mes según el contrato y
          aplica el polinomio. La Contraloría audita ex post.
        </p>
        <PendingBanner>
          <strong>Fórmula de distribución regional sin cotejar.</strong>{' '}
          El texto legal y las resoluciones anuales del MTT no están leídos.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.dipres.gob.cl/597/w3-multipropertyvalues-22769-26491.html">
            DIPRES · Ley de Presupuestos del Sector Público
          </SourceLink>
          <SourceLink href="https://www.contraloria.cl/">
            Contraloría General de la República
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/">
            Subsecretaría de Transportes · subtrans.gob.cl
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Origen y vigencia">
        <p>
          La ley nace del colapso del Transantiago en 2007, cuando el fisco
          inyectó recursos extraordinarios. Las regiones pidieron una
          transferencia equivalente: la "ley espejo", aprobada en 2009. Su
          vigencia original era de diez años y requiere prórrogas.
        </p>
        <PendingBanner>
          <strong>Cadena de prórrogas sin cotejar en BCN.</strong> Fuentes
          secundarias citan las leyes 21.175 (2019) y 21.439 (2022). La
          página BCN de la Ley 21.848 aparece como modificatoria del
          artículo tercero transitorio de la Ley 20.378; no se pudo leer su
          texto. El régimen sigue operando, así que hay alguna prórroga
          vigente. Su número hay que cerrarlo con texto primario.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1202067">
            BCN · Ley 21.659 (Seguridad Privada, no es prórroga)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1229210">
            BCN · Ley 21.848 (página de la norma)
          </SourceLink>
        </Sources>
      </Section>

      <CollapsibleSection title="Línea de tiempo">
        <Timeline
          items={[
            { date: 'Feb-2007', event: 'El Transantiago arranca con problemas. El fisco inyecta recursos extraordinarios.' },
            { date: '2008', event: 'Proyecto de "ley espejo" para compensar a las regiones.' },
            { date: '5-sep-2009', event: 'Se publica la Ley 20.378 en el Diario Oficial, con vigencia inicial de 10 años.', source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=1005871', label: 'BCN Ley 20.378' } },
            { date: '2010-2018', event: 'Implementación gradual: reembolso TNE, zonas aisladas, Renueva Tu Micro y distribución regional.' },
            { date: '27-sep-2019', event: 'Primera prórroga según fuentes secundarias: Ley 21.175 (número sin cotejar).' },
            { date: '2022', event: 'Segunda prórroga según fuentes secundarias: Ley 21.439 (número sin cotejar).' },
            { date: '1-ene-2024', event: 'Entra en vigor el PE Gran Concepción 2024, con polinomio de ajuste sobre el subsidio.', source: { href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/', label: 'DPR Biobío · 3-ene-2024' } },
            { date: '2024-2025', event: 'Tercera prórroga según fuentes secundarias (sin cotejar, incluida su vigencia).' },
            { date: 'feb-2025', event: 'Segundo ajuste polinómico del PE: tarifa adulto a $580.', source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html', label: 'Diario Concepción · 14-feb-2025' } },
            { date: 'oct-2025', event: 'SEREMITT anuncia la capa subsidiada Concepción ↔ Florida zona norte (art. 4°).' },
            { date: '28-ene-2026', event: 'Adjudicación de BusPay (~$750 millones/año). Contrato de recaudación; su fuente de pago no consta.', source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' } },
          ]}
        />
      </CollapsibleSection>

      <Section title="Críticas y reformas pendientes">
        <div className="space-y-2">
          <IssueNotice title="Vigencia por prórrogas">
            Cada prórroga abre un ciclo de incertidumbre. Convertirla en régimen permanente se ha propuesto sin prosperar.
          </IssueNotice>
          <IssueNotice title="Monto corto frente a la flota">
            Los gremios y la academia dicen que el reajuste por inflación no alcanza para renovar flota. El texto original no incentiva buses eléctricos.
          </IssueNotice>
          <IssueNotice title="Recortes en 2027 (proyecto)">
            El proyecto de Presupuesto 2027 baja el fondo regional de transporte un 41,4%. Parlamentarios de la región piden explicar los criterios.
          </IssueNotice>
        </div>
      </Section>

      <Section title="Comparación con el subsidio de Santiago">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>Santiago (RED)</strong>: subsidio implícito propio, administrado por la DTPM, con tarifa integrada bus + Metro + tren.</li>
          <li><strong>Regiones</strong>: Ley 20.378 y perímetros (Ley 18.696), administrados por la DTPR, con tarifas por servicio o perímetro.</li>
          <li><strong>Brecha</strong>: la RM recibe más subsidio per cápita que las regiones. Sin cifra cotejada en esta ficha.</li>
        </ul>
      </Section>

      <Section title="Qué ve el visor">
        <p className="text-[13px]">
          El visor no muestra dinero, pero casi todo lo que se ve depende
          de esta ley: los buses del PE 2024, los servicios 401, 411 y 421
          de Tomé, la Ruta 201 y las capas de Florida. Biotrén (EFE) no se
          financia con esta ley. Los corredores privados (Yumbel, El Pimentón)
          no reciben subsidio.
        </p>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">SEREMITT Biobío y la DTPR</a>: ejecutan el subsidio en la región.</li>
          <li><a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">Perímetro de Exclusión del Gran Concepción 2024</a>: el régimen mayor financiado con el subsidio operacional.</li>
          <li><a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">Perímetro de Exclusión de Tomé</a>: segundo régimen subsidiado.</li>
          <li><a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201 Concepción ↔ Santa Juana</a>: caso de art. 4°.</li>
          <li><a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción ↔ Florida</a>: capas subsidiadas sin licitar el troncal.</li>
          <li><a href="/wiki/buspay" className="underline underline-offset-2">BusPay</a>: pago electrónico en los buses subsidiados.</li>
          <li><a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">Electrocorredores MOP</a>: infraestructura del MOP; operación de buses bajo subsidio.</li>
          <li><a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">Recorridos interurbanos</a>: servicios licitados según art. 4°.</li>
        </ul>
      </Section>

      <CollapsibleSection title="Datos pendientes y contribución">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Número y fecha exacta de la última prórroga vigente al 2026 (BCN).</li>
          <li>Monto nacional 2026 de la Partida 19 y su desagregación por DIPRES.</li>
          <li>Monto anual del Biobío por componente (la cifra de $93 mil millones agrupa varios subtítulos).</li>
          <li>Fórmula de distribución regional y ponderadores.</li>
          <li>Reembolso TNE pagado a operadores del Biobío 2024-2026.</li>
          <li>Costo por pasajero subsidiado.</li>
          <li>Fórmula del polinomio del PE Gran Concepción 2024.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: DIPRES, BCN Ley Chile y Subtrans vía Ley 20.285.
        </p>
        <p className="text-[13px]">
          Si tienes el número de la última prórroga o las resoluciones MTT de
          distribución regional, abre un PR en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/subsidio-ley-20378.tsx">
            github.com/marcorojasb/conce.patagua.dev
          </SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
