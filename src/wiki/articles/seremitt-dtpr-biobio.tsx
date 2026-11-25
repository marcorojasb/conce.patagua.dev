// SEREMITT Biobío y DTPR, ficha institucional de la autoridad regional de
// transportes. SEREMITT = instancia política del MTT (la encabeza un SEREMI
// de confianza presidencial). DTPR = brazo técnico de Subtrans: licita,
// paga subsidios y fiscaliza. DTPM solo opera en la Región Metropolitana.
//
// Sucesión SEREMI: Héctor Silva (2023-2024) → Patricio Fierro (10-ene-2025
// a nov-2025) → Henry Campos Coa (desde ~27-mar-2026). Tramo nov-2025 a
// mar-2026 sin fuente primaria cerrada: ver PendingBanner.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  NewsPulse,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function SeremittDtprBiobio() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente.</strong> Estructura SEREMITT/DTPR,
        marcos legales, sucesión de SEREMIs y cartera 2026 con fuentes
        primarias o prensa regional con nombre. El último dato confirmado
        del titular es de jul-2026.{' '}
        <strong>Pendientes</strong>: director(a) regional de la DTPR
        Biobío, sede, dotación y presupuesto ejecutado.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'SEREMI', value: 'Henry Campos Coa' },
          { label: 'Desde', value: '~27-mar-2026' },
          { label: 'Brazo técnico', value: 'DTPR / DPR Biobío' },
          { label: 'Subsidios 2026', value: '> $93 mil millones' },
          { label: 'Portal', value: 'dprbiobio.dpr.gob.cl' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            <strong>SEREMITT</strong> pone la vocería y las resoluciones
            regionales. <strong>DTPR</strong> licita, paga subsidios y
            fiscaliza. Son dos caras del MTT en la región.
          </>,
          <>
            Titular: <strong>Henry Campos Coa</strong>, exalcalde de
            Talcahuano, desde ~27-mar-2026 (Subtrans y Diario Concepción).
          </>,
          <>
            Casi toda decisión de transporte del wiki pasa por una de las
            dos: perímetros, BusPay, subsidios y licitaciones.
          </>,
          <>
            Sin publicar todavía: director(a) regional de la DTPR, sede,
            dotación y presupuesto ejecutado.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: 'ago-2026',
            title: 'Corredores Ruta 160 y Ruta 150 pasan de concesión a obra pública',
            detail:
              'El decreto de adjudicación nunca se firmó. El Gobierno anuncia ejecución por Vialidad del MOP; falta confirmar si habrá licitación de obras. Ver Electrocorredores MOP.',
            source: {
              href: 'https://www.biobiochile.cl/noticias/bbcl-explica/bbcl-explica-notas/2026/08/07/de-concesion-a-obra-publica-el-nuevo-escenario-de-los-corredores-de-transporte-para-gran-concepcion.shtml',
              label: 'BioBioChile · 7-ago-2026',
            },
          },
          {
            date: '1-dic-2026',
            title: 'Marcha blanca del pago electrónico en micros',
            detail:
              'Efectivo, tarjetas bancarias y tarjeta de transporte conviven durante unos tres meses. Ver BusPay.',
            source: {
              href: 'https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta',
              label: 'Canal 9 · 23-nov-2026',
            },
          },
        ]}
      />

      <Section title="Qué es y por qué importa">
        <p>
          Toda decisión del wiki sobre transporte público regional pasa por
          la SEREMITT o la DTPR. Ejemplos:{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">PE Gran Concepción 2024</a>,{' '}
          <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">licitación Santa Juana</a>,{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">BusPay</a>,{' '}
          <a href="/wiki/concepcion-florida" className="underline underline-offset-2">subsidios a Florida</a> y{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">Electrocorredores MOP</a>.
        </p>
        <p>
          Distinción clave: <strong>la SEREMITT no licita ni paga
          subsidios</strong>. Coordina, comunica y firma resoluciones
          regionales. La DTPR ejecuta los contratos y paga la liquidación
          mensual.
        </p>
      </Section>

      <Section title="SEREMITT y DTPR en 2026">
        <DataTable columns={['', 'SEREMITT Biobío', 'DTPR Biobío']} bodyClassName="divide-y align-top text-[13px]">
          <tr>
            <td className="px-3 py-2 font-medium">Naturaleza</td>
            <td className="px-3 py-2">Instancia política. La encabeza un SEREMI nombrado por el Presidente a propuesta del ministro.</td>
            <td className="px-3 py-2">Dependencia técnica de la Subsecretaría de Transportes. Ejecuta licitaciones, contratos, subsidios y fiscalización.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Titular</td>
            <td className="px-3 py-2">
              <strong>Henry Campos Coa</strong> (desde ~27-mar-2026). Antes: Héctor Silva (2023-2024) y Patricio Fierro (10-ene-2025 a nov-2025).
            </td>
            <td className="px-3 py-2">Director(a) regional no nombrado en los comunicados. Pendiente.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Reporta a</td>
            <td className="px-3 py-2">Ministro(a) de Transportes en Santiago. Ministro actual: Louis de Grange Concha (desde 11-mar-2026).</td>
            <td className="px-3 py-2">Subsecretaría de Transportes → DTPR nacional → DPR Biobío.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Sede y portal</td>
            <td className="px-3 py-2">Concepción. Dirección exacta pendiente.</td>
            <td className="px-3 py-2">Concepción. <code className="font-mono text-[11px]">dprbiobio.dpr.gob.cl</code></td>
          </tr>
        </DataTable>
        <p className="text-[13px]">
          Los nombres de DTPM (solo Región Metropolitana) y 3CV (certificación
          vehicular, nacional) suelen confundirse con estas dos. No tienen
          jurisdicción en el Biobío.
        </p>
        <PendingBanner>
          <strong>Tramo nov-2025 a mar-2026.</strong> Versiones previas de
          esta ficha citaban a Hugo Cautivo como SEREMI de Transportes desde
          el 28-nov-2025. En 2025-2026 aparece como <strong>SEREMI de Obras
          Públicas (MOP)</strong> en prensa regional. No hay URL primaria que
          cierre su paso por Transportes. El hilo Fierro → Campos se mantiene
          y la laguna queda marcada.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.subtrans.gob.cl/secretarias/secretaria-regional-ministerial-del-biobio/">
            Subtrans · SEREMITT Biobío (Henry Campos Coa)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/politica/2026/03/27/biobio-suma-nuevas-autoridades-henry-campos-y-daniel-manchileo-asumen-como-seremis.html">
            Diario Concepción · 27-mar-2026, Henry Campos asume SEREMI Transportes
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html">
            Diario Concepción · 10-ene-2025, nombramiento de Patricio Fierro
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/">
            DPR Biobío · 3-ene-2024, cita a Héctor Silva como SEREMI
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · portal regional oficial
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/">
            Subtrans · subsecretaría matriz
          </SourceLink>
          <SourceLink href="https://www.mtt.gob.cl/">
            MTT · ministerio matriz
          </SourceLink>
          <SourceLink href="https://www.3ctsx.cl/">
            3CV · Centro de Control y Certificación Vehicular
          </SourceLink>
          <SourceLink href="https://www.dtpm.cl/">
            DTPM · referencia comparativa (solo RM)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Funciones">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>Perímetros de exclusión</strong> (Ley 18.696, art. 3°): diseño, licitación y administración.</li>
          <li><strong>Licitaciones de servicios</strong> urbanos e interurbanos: ej. ELC0007, Ruta 201 Santa Juana.</li>
          <li><strong>Subsidios</strong> de la Ley 20.378 y pagos mensuales a operadores.</li>
          <li><strong>Tarifas</strong>: aplica el polinomio de ajuste de los contratos de perímetro.</li>
          <li><strong>Autorizaciones</strong> de servicios y padrón regional (RNSTP).</li>
          <li><strong>Fiscalización</strong> con el 3CV y Carabineros. Sanciones: multas, suspensiones, caducidad.</li>
          <li><strong>Pago electrónico</strong>: licitación y seguimiento de BusPay.</li>
        </ul>
        <p className="text-[13px]">
          Las decisiones se formalizan en <strong>decretos</strong> (firma el
          Subsecretario), <strong>resoluciones exentas</strong> (sin visa
          CGR) y <strong>resoluciones afectas</strong> (con visa CGR). La
          Resolución Afecta 29/2023, visada en may-2023, fue la base del PE
          Gran Concepción 2024.
        </p>
      </Section>

      <Section title="Marco legal">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>DFL 343/1953</strong>: ley orgánica del antiguo MOP-Transportes; base histórica del MTT.</li>
          <li><strong>Ley 18.059 (1981)</strong>: el MTT como organismo rector del transporte terrestre.</li>
          <li><strong>Ley 18.696 (1988)</strong>: art. 3° habilita los perímetros de exclusión (PE GC 2024, Tomé, Coronel-Lota).</li>
          <li><strong>Ley 20.378 (2009)</strong>: subsidio nacional; art. 4° cubre zonas aisladas y servicios licitados (ver <a href="/wiki/subsidio-ley-20378" className="underline underline-offset-2">subsidio</a>).</li>
          <li><strong>Ley 19.880 (2003)</strong>: procedimiento administrativo de los actos de la SEREMITT y la DTPR.</li>
          <li><strong>Ley 20.285 (2008)</strong>: transparencia activa y acceso a la información.</li>
        </ul>
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29742">BCN · Ley 18.059</SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=30190">BCN · Ley 18.696</SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">BCN · Ley 20.378</SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=210676">BCN · Ley 19.880</SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=276363">BCN · Ley 20.285</SourceLink>
        </Sources>
      </Section>

      <Section title="Cartera regional 2024-2026">
        <DataTable columns={['Proyecto', 'Estado con fecha', 'Artículo']}>
          <tr>
            <td className="px-3 py-2 font-medium">PE Gran Concepción 2024</td>
            <td className="px-3 py-2">Operativo desde 1-ene-2024 hasta 31-dic-2028. 36 unidades de negocio. Tarifa adulto $580.</td>
            <td className="px-3 py-2"><a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">Ver</a></td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">PE Tomé</td>
            <td className="px-3 py-2">Decreto jul-2016. Operativo desde 10-mar-2022. Operador único Transportes Tomé.</td>
            <td className="px-3 py-2"><a href="/wiki/concepcion-tome" className="underline underline-offset-2">Ver</a></td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Ruta 201 Santa Juana (ELC0007)</td>
            <td className="px-3 py-2">Adjudicada en 2024. Operativa desde 15-jul-2024. 23 buses.</td>
            <td className="px-3 py-2"><a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ver</a></td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">BusPay</td>
            <td className="px-3 py-2">Adjudicado el 28-ene-2026. Marcha blanca desde el 1-dic-2026 según prensa.</td>
            <td className="px-3 py-2"><a href="/wiki/buspay" className="underline underline-offset-2">Ver</a></td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Electrocorredores MOP</td>
            <td className="px-3 py-2">Sin adjudicación. Desde ago-2026, anunciado como obra pública por Vialidad del MOP.</td>
            <td className="px-3 py-2"><a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">Ver</a></td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Florida</td>
            <td className="px-3 py-2">Capas subsidiadas desde oct-2025. Sin licitación del corredor troncal.</td>
            <td className="px-3 py-2"><a href="/wiki/concepcion-florida" className="underline underline-offset-2">Ver</a></td>
          </tr>
        </DataTable>
        <Sources>
          <SourceLink href="https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta">
            Canal 9 · marcha blanca BusPay (23-nov-2026)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · adjudicación BusPay (28-ene-2026)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/politica/2026/08/14/apuran-entrega-corredores-transporte-biobio-2031.html">
            Diario Concepción · corredores y plazo 2031 (14-ago-2026)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Subsidios en la región 2026">
        <p className="text-[13px]">
          Según la DTPR (actualización jun-2026), el presupuesto regional
          2026 supera los <strong>$93 mil millones</strong>. Incluye la Ley
          20.378 y otras subpartidas (transporte de carga, rebaja adulto
          mayor), así que no es el monto de la Ley 20.378 sola. Con cifras
          del documento:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Gran Concepción: flota de 1.894 buses bajo perímetro de exclusión.</li>
          <li>Zonas aisladas y rurales: 75 servicios, más de 35 mil personas.</li>
          <li>Renueva Tu Micro: 1.095 buses reemplazados. Renueva Tu Colectivo: 1.063 automóviles (2016-2023).</li>
          <li>Rebaja adulto mayor: 50% desde los 65 años en todos los buses de la región.</li>
        </ul>
        <Sources>
          <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf">
            DTPR · Subsidios al transporte público, Región del Biobío 2026
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Relación con el MTT central y otras instituciones">
        <p className="text-[13px]">
          La SEREMITT y la DTPR ejecutan la política del MTT central. Las
          decisiones de perímetro, bases de licitación y tarifa las firma el
          Subsecretario. La DTPR Biobío administra contratos y paga. Con otras
          instituciones:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>GORE Biobío</strong>: cofinancia subsidios complementarios vía FNDR y el Consejo Regional.</li>
          <li><strong>MOP</strong>: licita y ejecuta la infraestructura de los electrocorredores.</li>
          <li><strong>MINVU, municipios y EFE</strong>: paraderos, permisos de vía y coordinación intermodal con el Biotrén.</li>
          <li><strong>Contraloría</strong>: visa resoluciones afectas (Res. 29/2023; bases de electrocorredores, 13-nov-2024).</li>
          <li><strong>Carabineros y SII</strong>: fiscalización en ruta y cruce de padrones tributarios.</li>
        </ul>
      </Section>

      <Section title="Críticas y desafíos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>Atraso histórico</strong>: la licitación de 2002 operó 22 años. Santa Juana fue la primera licitación pública en más de 10 años.</li>
          <li><strong>Corredor Concepción ↔ Florida</strong> sigue sin licitación moderna pese a subsidios anuales.</li>
          <li><strong>Ranking de cumplimiento</strong> del PE 2024, la palanca más fuerte, no se publica desagregado.</li>
          <li><strong>Sin GTFS-Realtime</strong>: el feed oficial es estático, aunque el PE 2024 exige GPS online.</li>
          <li><strong>Rotación de SEREMIs</strong> (Silva → Fierro → Campos) y cambios de vocería. La continuidad recae en la DTPR.</li>
        </ul>
      </Section>

      <CollapsibleSection title="Cronología">
        <Timeline
          items={[
            { date: '1953', event: 'DFL 343 organiza el MOP-Transportes, antecedente del MTT actual.', source: { href: 'https://www.bcn.cl/leychile', label: 'BCN' } },
            { date: '1981', event: 'Ley 18.059 otorga al MTT el rol rector nacional del transporte terrestre.', source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=29742', label: 'BCN Ley 18.059' } },
            { date: '1988', event: 'Ley 18.696 crea el régimen de subsidio y habilita los perímetros de exclusión (art. 3°).', source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=30190', label: 'BCN Ley 18.696' } },
            { date: '2002', event: 'Contratos de la licitación regional con 37 empresas operadoras.' },
            { date: '2009', event: 'Ley 20.378 crea el subsidio nacional. Art. 4° habilita subsidios a zonas aisladas y rurales.', source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=1005871', label: 'BCN Ley 20.378' } },
            { date: '2013', event: 'Implementación del Perímetro de Exclusión Coronel-Lota.' },
            { date: 'jul-2016', event: 'Decreto MTT crea el PE de Tomé (operativo desde 10-mar-2022).' },
            { date: '27-abr-2017', event: 'Resolución exenta del MTT (archivo Resex_1005.2017), marco normativo del PE del Gran Concepción.', source: { href: 'https://www.mtt.gob.cl/wp-content/uploads/2017/10/Resex_1005.2017.pdf', label: 'MTT' } },
            { date: 'may-2023', event: 'Contraloría visa la Resolución Afecta 29/2023, que aprueba el PE Gran Concepción.' },
            { date: '22-nov-2023', event: 'SEREMITT facilita el acuerdo con las cinco federaciones gremiales del Gran Concepción. Vocería: Héctor Silva.', source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2023/11/22/perimetro-de-exclusion-gremios-del-gran-concepcion-llegan-a-acuerdo-con-ministerio-de-transportes.shtml', label: 'BioBioChile · 22-nov-2023' } },
            { date: '1-ene-2024', event: 'Entra en vigor el PE Gran Concepción 2024. Silva anuncia GPS obligatorio, fiscalización online y ranking.', source: { href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/', label: 'DPR Biobío · 3-ene-2024' } },
            { date: '15-jul-2024', event: 'Inicia operación la Ruta 201 Santa Juana (licitación ELC0007).', source: { href: 'https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/', label: 'DPR Biobío · 22-jul-2024' } },
            { date: '13-nov-2024', event: 'Contraloría visa las bases de los Electrocorredores MOP (Rutas 150 y 160; Autopista Concepción-Talcahuano).' },
            { date: '9-dic-2024', event: 'Primer ajuste polinómico del perímetro: tarifa adulto de $550 a $560.' },
            { date: '10-ene-2025', event: 'Patricio Fierro asume como SEREMI de Transportes del Biobío, en reemplazo de Héctor Silva.', source: { href: 'https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html', label: 'Diario Concepción · 10-ene-2025' } },
            { date: '23-feb-2025', event: 'Segundo ajuste polinómico: tarifa adulto $580, escolar $190, adulto mayor $290.', source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html', label: 'Diario Concepción · 14-feb-2025' } },
            { date: '23-sep-2025', event: 'La DTPR recibe 6 ofertas para el sistema de pago electrónico BusPay.', source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html', label: 'Diario Concepción · 23-sep-2025' } },
            { date: 'oct-2025', event: 'SEREMITT anuncia la capa subsidiada Concepción ↔ Florida zona norte (Ley 20.378).' },
            { date: '28-ene-2026', event: 'MTT adjudica BusPay al Consorcio Buspay: ~$750 millones/año, 11 comunas.', source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' } },
            { date: '27-mar-2026', event: 'Henry Campos Coa asume como SEREMI de Transportes y Telecomunicaciones del Biobío.', source: { href: 'https://www.diarioconcepcion.cl/politica/2026/03/27/biobio-suma-nuevas-autoridades-henry-campos-y-daniel-manchileo-asumen-como-seremis.html', label: 'Diario Concepción · 27-mar-2026' } },
            { date: 'ago-2026', event: 'Gobierno pasa los corredores Ruta 160 y 150 a obra pública (Vialidad MOP). No hubo adjudicación.', source: { href: 'https://www.biobiochile.cl/noticias/bbcl-explica/bbcl-explica-notas/2026/08/07/de-concesion-a-obra-publica-el-nuevo-escenario-de-los-corredores-de-transporte-para-gran-concepcion.shtml', label: 'BioBioChile · 7-ago-2026' } },
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Transparencia, datos abiertos y contacto">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>Transparencia activa</strong>: contratos, viáticos, dotación y normativa en transparencia.gob.cl (filtrar por MTT).</li>
          <li><strong>Solicitud Ley 20.285</strong>: portaltransparencia.cl. Plazo: 20 días hábiles, prorrogables. Útil para expedientes de licitación, padrón y ranking.</li>
          <li><strong>Datos abiertos</strong>: GTFS oficial del Gran Concepción en dtpr.gob.cl (ver <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS</a>).</li>
          <li><strong>Diario Oficial</strong>: publica decretos de perímetros, adjudicaciones y tarifas.</li>
          <li><strong>OIRS MTT</strong>: consultas y reclamos presenciales en Concepción y por formulario en mtt.gob.cl.</li>
          <li><strong>Subtrans</strong>: comunicados centrales y licitaciones grandes que afectan al Biobío.</li>
        </ul>
        <PendingBanner>
          <strong>Dirección física y teléfono de la sede en Concepción sin cotejar.</strong>{' '}
          Consultar en transparencia.gob.cl o en el call center del MTT.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.portaltransparencia.cl/PortalPdT/web/ministerio-de-transportes-y-telecomunicaciones">
            Portal de Transparencia · MTT
          </SourceLink>
          <SourceLink href="https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/">
            dtpr.gob.cl · GTFS Gran Concepción
          </SourceLink>
          <SourceLink href="https://datos.gob.cl/">
            datos.gob.cl · Portal de Datos Abiertos
          </SourceLink>
          <SourceLink href="https://www.diariooficial.interior.gob.cl/">
            Diario Oficial de la República de Chile
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">Perímetro de Exclusión del Gran Concepción 2024</a>: el régimen mayor de buses urbanos.</li>
          <li><a href="/wiki/buspay" className="underline underline-offset-2">BusPay</a>: pago electrónico adjudicado en ene-2026.</li>
          <li><a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201 Santa Juana</a>: licitación ELC0007, art. 4° Ley 20.378.</li>
          <li><a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a>: primer perímetro regional bajo la DTPR.</li>
          <li><a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción ↔ Florida</a>: capas subsidiadas sin licitar el troncal.</li>
          <li><a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">Concepción ↔ Yumbel</a>: corredor privado; solo autorizaciones individuales.</li>
          <li><a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">Recorridos interurbanos</a>: índice de servicios, con y sin GTFS.</li>
          <li><a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">Electrocorredores MOP</a>: infraestructura del MOP; operación de buses coordinada por la SEREMITT.</li>
          <li><a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">Biotrén y sus extensiones</a>: integración intermodal con EFE.</li>
          <li><a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS Gran Concepción</a>: feed estático que publica la DTPR.</li>
          <li><a href="/wiki/subsidio-ley-20378" className="underline underline-offset-2">Subsidio Ley 20.378</a>: el marco de financiamiento.</li>
          <li><a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">Sobre este wiki</a>: por qué marcamos lo que no verificamos.</li>
        </ul>
      </Section>

      <CollapsibleSection title="Datos pendientes y contribución">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Nombre y antecedentes del director(a) regional DTPR Biobío.</li>
          <li>Organigrama, dotación y dirección física de la SEREMITT y la DTPR Biobío.</li>
          <li>Presupuesto regional ejecutado 2024-2026, por programa.</li>
          <li>Ranking de cumplimiento del PE Gran Concepción 2024: ¿se publica?</li>
          <li>Tramo exacto Fierro → Campos (titular intermedio en Transportes).</li>
          <li>Decretos MTT del PE GC 2024 y PE Tomé 2016: número y texto.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía de cierre: <strong>Ley 20.285</strong> y transparencia.gob.cl.
        </p>
        <p className="text-[13px]">
          Aportes: PR en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/seremitt-dtpr-biobio.tsx">
            github.com/marcorojasb/conce.patagua.dev
          </SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
