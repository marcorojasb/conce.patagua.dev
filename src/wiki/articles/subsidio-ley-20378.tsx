// Subsidio Nacional al Transporte Público (Ley 20.378) — ficha
// estructural del marco financiero que sostiene al transporte
// público regional fuera de Santiago. Publicada 5-sep-2009 como
// "ley espejo" del subsidio implícito al Transantiago.
//
// Prórrogas: Ley 21.175 (2019), Ley 21.439 (2022) y prórroga
// 2024-2025 (número pendiente cotejo BCN). DIPRES asigna por Ley
// de Presupuestos anual; Subtrans distribuye; DTPR ejecuta a nivel
// regional; Contraloría audita. Componentes Art. 2°/3°/4° y
// conectividad/renovación de flota.

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function SubsidioLey20378() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias 2009-2026.</strong>{' '}
        Origen (Ley 20.378 publicada 5-sep-2009 como "ley espejo" del
        subsidio implícito al Transantiago), arquitectura de
        componentes (subsidio nacional, reembolso TNE, zonas aisladas,
        conectividad, renovación de flotas) y aterrizajes regionales
        en el Biobío (PE Gran Concepción 2024, PE Tomé, licitación
        ELC0007 Santa Juana, capas subsidiadas Florida 2025) están
        citados con fuente.{' '}
        <strong>Pendientes</strong>: número exacto y fecha de la
        última prórroga vigente al 2026, monto agregado nacional
        2024-2026 desagregado por DIPRES, monto Biobío anual, costo
        por pasajero subsidiado y fórmula exacta de distribución
        regional. Marcadas con banner ámbar abajo. Cifras
        presupuestarias no verificadas con texto oficial NO se
        publican.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          La <strong>Ley 20.378</strong>, publicada en el Diario
          Oficial el <strong>5 de septiembre de 2009</strong>, creó
          el <strong>Subsidio Nacional al Transporte Público</strong>
          : un programa permanente del Estado de Chile que aporta
          recursos para sostener la operación, la renovación de
          flota y los servicios deficitarios del transporte público
          mayor en todas las regiones del país, además de financiar
          el reembolso a los operadores por las tarifas rebajadas a
          estudiantes y adultos mayores.
        </p>
        <p>
          Sin esta ley, buena parte del sistema regional sería
          inviable. Es <strong>el dinero detrás</strong> de cada
          perímetro de exclusión, cada licitación DTPR, cada
          servicio rural deficitario y cada Tarjeta Nacional
          Estudiantil (TNE) emitida en Chile. En el Biobío
          específicamente, la Ley 20.378 financia:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            El subsidio operacional al{' '}
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción 2024
            </a>{' '}
            (~36 unidades de negocio, ~35 empresas, contrato hasta
            31-dic-2028).
          </li>
          <li>
            El subsidio operacional al{' '}
            <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
              Perímetro de Exclusión de Tomé
            </a>{' '}
            (operador único Transportes Tomé, líneas 401 / 411 /
            421).
          </li>
          <li>
            El subsidio al servicio licitado bajo la{' '}
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 Concepción ↔ Santa Juana
            </a>{' '}
            (ELC0007, base legal art. 4° Ley 20.378).
          </li>
          <li>
            Las capas subsidiadas que la SEREMITT sumó desde 2025
            al corredor{' '}
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
              Concepción ↔ Florida
            </a>{' '}
            (zona norte oct-2025, Rahuil, Poñén-Roa, servicio
            nocturno).
          </li>
          <li>
            El reembolso por tarifa rebajada al estudiante (TNE) que
            JUNAEB y MTT aplican a estudiantes secundarios y de
            educación superior en toda la región.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          El sistema de pago electrónico{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            BusPay
          </a>{' '}
          no recibe subsidio Ley 20.378 directamente (el
          adjudicatario, el Consorcio Buspay, cobra por la
          recaudación), pero la operación de buses que BusPay
          recauda sí está subsidiada bajo esta ley.
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

      <Section title="Historia: del Transantiago a la 'ley espejo'">
        <p>
          El origen político está atado al <strong>colapso del
          Transantiago en 2007</strong>. Los problemas operativos
          masivos obligaron al fisco a inyectar recursos extraordinarios
          —el <em>subsidio implícito al Transantiago</em>—. La oposición
          y las regiones plantearon que si la RM recibe ese flujo, las
          regiones merecen una transferencia equivalente. Esa es la
          lógica de "ley espejo" que aterrizó en el proyecto presentado
          al Congreso en 2008 y aprobado en 2009 como Ley 20.378.
        </p>
        <p>
          Vigencia original: <strong>diez años</strong> (2009-2018). El
          régimen no es permanente por diseño: requiere prórrogas
          legislativas periódicas.
        </p>
        <PendingBanner>
          <strong>Cadena de prórrogas pendiente de cotejo BCN.</strong>{' '}
          <strong>Ley 21.175</strong> (publicada 27-sep-2019) prorrogó
          el régimen; <strong>Ley 21.439</strong> (2022) lo extendió
          hasta 2024. Una <strong>tercera prórroga</strong> habría sido
          aprobada en 2024-2025 (posiblemente Ley 21.659) extendiendo
          hasta ~2030; número exacto pendiente. Al 16-may-2026 el
          régimen sigue operativo y los pagos continúan.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 20.378 (texto original 2009)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/buscador?tipos_norma=L&q=21.175">
            BCN · Buscador Ley 21.175 (prórroga 2019)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/buscador?tipos_norma=L&q=21.439">
            BCN · Buscador Ley 21.439 (prórroga 2022)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Componentes del subsidio">
        <p>
          La Ley 20.378 articula un conjunto de subsidios
          complementarios. No es un solo cheque, sino una
          arquitectura de líneas presupuestarias que financian
          piezas distintas del sistema:
        </p>
        <KeyValueList
          items={[
            [
              'Subsidio Nacional al Transporte Público',
              'Línea principal. Aporta recursos a las regiones para financiar la operación del transporte mayor (urbano e interurbano regional). Distribución por fórmula entre las 15 regiones distintas de la RM. En el Biobío financia el PE Gran Concepción, el PE Tomé y los contratos DTPR licitados.',
            ],
            [
              'Reembolso por tarifa rebajada (TNE)',
              'Aporte al operador por cada validación de estudiante con Tarjeta Nacional Estudiantil. La TNE es administrada por JUNAEB; el reembolso lo paga el MTT con cargo a Ley 20.378. Cubre estudiantes de educación básica, media y superior.',
            ],
            [
              'Subsidio a zonas aisladas',
              'Art. 4° de la Ley 20.378. Habilita al MTT a subsidiar servicios deficitarios obligados por bien público en localidades sin demanda comercial suficiente. Base legal de la Ruta 201 Santa Juana (ELC0007) y de las capas subsidiadas Florida zona norte (oct-2025), Rahuil, Poñén-Roa y servicio nocturno.',
            ],
            [
              'Subsidio a la conectividad',
              'Servicios marítimos y aéreos para zonas extremas y archipiélagos (Magallanes, Aysén, Chiloé, islas). En el Biobío aplica a la conexión con Isla Mocha (Lebu ↔ Mocha) si está vigente; no aplica directamente a los servicios continentales del Gran Concepción.',
            ],
            [
              'Subsidio a la renovación de flotas',
              'Programa "Renueva tu Micro" y variantes posteriores. Aporte estatal para que operadores reemplacen buses Euro III/IV por unidades Euro V/VI o eléctricas. Hay debate vigente sobre si la actualización 2024-2025 incorpora incentivos explícitos a electromovilidad — pendiente de cotejo en texto refundido.',
            ],
            [
              'Reembolso adulto mayor en perímetros',
              'En perímetros de exclusión (PE Gran Concepción, PE Tomé) el contrato fija una tarifa rebajada para adulto mayor ($290 adulto mayor vs $580 adulto en el PE Gran Concepción a feb-2025). La diferencia entre la tarifa rebajada y la tarifa de equilibrio operacional se reembolsa al operador — base normativa entre Ley 20.378 y los contratos específicos.',
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Los nombres exactos de cada línea presupuestaria
          aparecen en la Ley de Presupuestos anual (Partida 19 -
          Ministerio de Transportes y Telecomunicaciones) y en
          el texto refundido de la Ley 20.378 en BCN.
        </p>
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 20.378
          </SourceLink>
          <SourceLink href="https://www.dipres.gob.cl/597/w3-multipropertyvalues-22769-26491.html">
            DIPRES · Ley de Presupuestos del Sector Público
          </SourceLink>
          <SourceLink href="https://www.junaeb.cl/tne/">
            JUNAEB · Tarjeta Nacional Estudiantil
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Distribución regional">
        <p>
          La Ley 20.378 distribuye los recursos mediante una fórmula
          que combina población urbana servida, kilometraje de rutas,
          niveles de demanda y un factor de equidad territorial. Las
          tres regiones que históricamente reciben más subsidio son{' '}
          <strong>Biobío</strong>, <strong>Valparaíso</strong> y{' '}
          <strong>Antofagasta/Tarapacá</strong>, por sus poblaciones
          urbanas y sistemas más complejos. En términos per cápita,
          siguen siendo inferiores al subsidio implícito a la RM.
        </p>
        <PendingBanner>
          <strong>Fórmula exacta y porcentajes Biobío 2024-2026
          pendientes</strong> — texto refundido + resoluciones MTT, vía
          Ley 20.285.
        </PendingBanner>
      </Section>

      <Section title="Aplicación al Biobío">
        <p>
          La Ley 20.378 aterriza en el Biobío a través de
          varios canales operativos que la{' '}
          <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
            SEREMITT y la DTPR Biobío
          </a>{' '}
          administran:
        </p>
        <KeyValueList
          items={[
            [
              'PE Gran Concepción 2024',
              'Subsidio operacional a las ~35 empresas que conforman las 36 unidades de negocio del régimen. Liquidaciones mensuales por DTPR Biobío. Polinomio de ajuste tarifario ligado a UF, combustible y salarios. Tarifa adulto $580 a feb-2025.',
            ],
            [
              'PE Tomé',
              'Subsidio operacional al operador único Transportes Tomé (líneas 401 / 411 / 421). Refuerzos may-2025 (+11% punta tarde) anunciados por la SEREMITT — financiados con cargo al subsidio Ley 20.378.',
            ],
            [
              'Ruta 201 Santa Juana (ELC0007)',
              'Licitación DTPR adjudicada en 2024 bajo art. 4° Ley 20.378 (zonas aisladas / servicios deficitarios). Operadora: Sociedad de Transporte de Pasajeros Santa Juana SpA. 23 buses Agrale Euro V, tarifa $1.000. Pago al operador con cargo al subsidio.',
            ],
            [
              'Capas Florida',
              'Zona norte (oct-2025), Rahuil, Poñén-Roa, servicio nocturno: nuevas líneas subsidiadas Ley 20.378 art. 4° que la SEREMITT anunció desde 2025 sin licitar todavía el reemplazo del corredor troncal Concepción ↔ Florida.',
            ],
            [
              'TNE Biobío',
              'Reembolso por tarifa estudiantil en toda la región. Aplica en el PE Gran Concepción, PE Tomé, Ruta 201 y otros servicios autorizados. Administración compartida JUNAEB / MTT.',
            ],
            [
              'Renovación de flota regional',
              'Programas de recambio para operadores del Gran Concepción y servicios interurbanos. Los 23 buses Agrale Euro V de Santa Juana y la renovación parcial de flota del PE Gran Concepción se beneficiaron de líneas relacionadas.',
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          El{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            sistema BusPay
          </a>{' '}
          no recibe subsidio Ley 20.378 directamente (línea
          presupuestaria distinta), pero los operadores cuyos buses
          equipa con validadores sí lo reciben por su operación.
        </p>
      </Section>

      <Section title="Cómo funciona operativamente">
        <p>
          El flujo de un peso del subsidio Ley 20.378 desde el
          presupuesto nacional hasta la caja de un operador
          regional involucra cuatro niveles institucionales:
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Etapa</th>
                <th className="px-3 py-2 font-medium">Quién</th>
                <th className="px-3 py-2 font-medium">Qué hace</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">1. Asignación</td>
                <td className="px-3 py-2">DIPRES + Congreso</td>
                <td className="px-3 py-2">Asigna el monto anual del Subsidio Nacional al Transporte Público en la Ley de Presupuestos (Partida 19 - MTT). Aprobada en diciembre del año anterior.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">2. Distribución</td>
                <td className="px-3 py-2">Subsecretaría de Transportes</td>
                <td className="px-3 py-2">Distribuye el monto entre las regiones aplicando la fórmula del reglamento. Emite resoluciones que asignan recursos por línea (operacional, zonas aisladas, renovación, TNE).</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">3. Ejecución regional</td>
                <td className="px-3 py-2">DTPR Biobío</td>
                <td className="px-3 py-2">Liquida mensualmente a cada operador según el contrato (perímetro o licitación DTPR), validando kilometraje, validaciones y estándares de cumplimiento. Aplica polinomio de ajuste tarifario cuando corresponde.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">4. Auditoría</td>
                <td className="px-3 py-2">Contraloría General de la República</td>
                <td className="px-3 py-2">Visa las resoluciones afectas que afectan recursos sustanciales. Audita ex post el uso del subsidio en regiones y en operadores específicos.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          El <strong>polinomio de ajuste</strong> indexa los pagos a
          costos (UF, diésel/electricidad, salarios). Es la razón por
          la que la tarifa PE Gran Concepción pasó de $550 (feb-2024) a
          $580 (feb-2025).
        </p>
        <Sources>
          <SourceLink href="https://www.dipres.gob.cl/597/w3-propertyvalue-15494.html">
            DIPRES · Partida 19 - Ministerio de Transportes
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/">
            Subsecretaría de Transportes
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · ejecución regional
          </SourceLink>
          <SourceLink href="https://www.contraloria.cl/">
            Contraloría General de la República
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cifras 2024-2026">
        <PendingBanner>
          <strong>Cifras presupuestarias pendientes de DIPRES</strong>{' '}
          — Partida 19 MTT, Programa 06. Valores exactos por año
          (2024-2026) y desagregación Biobío no publicados aquí sin
          fuente primaria confirmada.
        </PendingBanner>
        <p>Documentado cualitativamente con fuente regional:</p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>PE Gran Concepción 2024</strong>: 36 unidades de negocio con subsidio operacional continuo; perímetro con polinomio.</li>
          <li><strong>Licitación ELC0007 Santa Juana</strong>: primera licitación pública moderna del Biobío en 10+ años; pago por km con cargo a Ley 20.378 art. 4°.</li>
          <li><strong>BusPay</strong> (ene-2026, ~$750M/año al Consorcio Buspay) NO es Ley 20.378 sino contrato de recaudación: línea distinta.</li>
        </ul>
      </Section>

      <Section title="Críticas y reformas pendientes">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Falta de permanencia
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Depende de prórrogas legislativas cíclicas (2018-2019,
              2022, 2024-2025). Cada ciclo abre incertidumbre. La
              conversión a régimen permanente se ha propuesto sin
              prosperar.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Insuficiencia y débil incentivo a electromovilidad
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El polinomio reajusta por inflación pero gremios y
              academia señalan que el monto queda corto frente a la
              inversión en flota e infraestructura. El texto original
              no incorpora incentivos explícitos a buses eléctricos;
              SEREMI Fierro aclaró en nov-2025 que el Gran Concepción
              no exige flota 100% eléctrica.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Brecha per cápita RM vs regiones y fiscalización limitada
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              15 años después, la RM sigue recibiendo más subsidio per
              cápita que la suma de regiones. La DTPR fiscaliza pero el
              ranking de cumplimiento del PE Gran Concepción 2024 —su
              palanca más fuerte— no se publica desagregado.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Comparación con el subsidio implícito de Santiago">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">RM (RED)</th>
                <th className="px-3 py-2 font-medium">Regiones (Ley 20.378)</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Marco legal</td>
                <td className="px-3 py-2">Leyes específicas RED + subsidio implícito + Ley 20.378 (espejo).</td>
                <td className="px-3 py-2">Ley 20.378 + Ley 18.696 (perímetros).</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Administración</td>
                <td className="px-3 py-2">DTPM (personalidad jurídica propia).</td>
                <td className="px-3 py-2">DTPR (dependencia técnica Subtrans).</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Modelo tarifario</td>
                <td className="px-3 py-2">Tarifa integrada bus + Metro + tren. Pago electrónico universal (bip!).</td>
                <td className="px-3 py-2">Tarifas por servicio o perímetro. BusPay 2026 en Conce.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Inversión infraestructura</td>
                <td className="px-3 py-2">Metro, corredores exclusivos extensos, BRT.</td>
                <td className="px-3 py-2">Electrocorredores MOP recién en licitación; paraderos heterogéneos.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Subsidio per cápita</td>
                <td className="px-3 py-2">Superior al regional.</td>
                <td className="px-3 py-2">Brecha persistente pese a "ley espejo".</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La promesa de equidad se cumple en parte: las regiones reciben
          recursos que no recibían antes de 2009, pero la brecha
          estructural persiste.
        </p>
      </Section>

      <Section title="Cronología">
        <Timeline
          items={[
            {
              date: 'Feb-2007',
              event: 'Lanzamiento del Transantiago bajo el primer gobierno de Michelle Bachelet. Problemas operativos agudos en los primeros meses obligan al fisco a inyectar recursos extraordinarios — el "subsidio implícito".',
            },
            {
              date: '2008',
              event: 'Debate parlamentario del proyecto de "ley espejo" del subsidio Transantiago, presentado para compensar a las regiones que no reciben aportes equivalentes.',
            },
            {
              date: '5-sep-2009',
              event: 'Publicación de la Ley 20.378 en el Diario Oficial. Crea el Subsidio Nacional al Transporte Público con vigencia inicial de 10 años (2009-2018).',
              source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=1005871', label: 'BCN Ley 20.378' },
            },
            {
              date: '2010-2018',
              event: 'Implementación gradual de los componentes de la ley: reembolso TNE, subsidios a zonas aisladas, programa Renueva tu Micro, distribución regional por fórmula.',
            },
            {
              date: '27-sep-2019',
              event: 'Publicación de la Ley 21.175 — primera prórroga del Subsidio Nacional al Transporte Público (número pendiente de cotejo definitivo en BCN).',
            },
            {
              date: '2022',
              event: 'Publicación de la Ley 21.439 — segunda prórroga del subsidio, extendiendo su vigencia hasta 2024 (número pendiente de cotejo definitivo en BCN).',
            },
            {
              date: '1-ene-2024',
              event: 'Inicio del Perímetro de Exclusión del Gran Concepción 2024. Toda la operación regional pasa al régimen de subsidio Ley 20.378 con polinomio de ajuste.',
              source: { href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/', label: 'DPR Biobío · 3-ene-2024' },
            },
            {
              date: '15-jul-2024',
              event: 'Inicio operativo de la Ruta 201 Santa Juana bajo licitación DTPR ELC0007 — primera licitación pública del Biobío en más de una década, financiada con cargo al art. 4° Ley 20.378.',
              source: { href: 'https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/', label: 'DPR Biobío · 22-jul-2024' },
            },
            {
              date: '2024-2025',
              event: 'Tercera prórroga del Subsidio Nacional al Transporte Público (Ley 21.659 o número similar — pendiente de cotejo definitivo en BCN). Extiende la vigencia del régimen aproximadamente hasta 2030.',
            },
            {
              date: 'Feb-2025',
              event: 'Segundo ajuste polinómico del PE Gran Concepción: tarifa adulto sube a $580. El polinomio reajusta el componente subsidiado por inflación de costos.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html', label: 'Diario Concepción · 14-feb-2025' },
            },
            {
              date: 'Oct-2025',
              event: 'La SEREMITT Biobío anuncia la capa subsidiada Concepción ↔ Florida zona norte bajo art. 4° Ley 20.378 — sin licitación integral del corredor todavía.',
            },
            {
              date: '28-ene-2026',
              event: 'Adjudicación de BusPay al Consorcio Buspay (~$750 millones/año). No es Ley 20.378 (es contrato de servicio de recaudación), pero los operadores cuyos buses BusPay equipa sí siguen recibiendo subsidio Ley 20.378 por su operación.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
          ]}
        />
      </Section>

      <Section title="Cobertura del visor">
        <p>
          El visor no muestra dinero, pero <strong>todo lo que se ve
          está financiado, directa o indirectamente, por la Ley
          20.378</strong>:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>Buses urbanos GTFS Gran Concepción</strong>: PE Gran Concepción 2024, 36 unidades de negocio.</li>
          <li><strong>Servicios 401/411/421</strong> (Penco, Lirquén, Tomé): PE Tomé, operador Transportes Tomé.</li>
          <li><strong>Ruta 201 Santa Juana</strong>: art. 4° bajo licitación DTPR ELC0007.</li>
          <li><strong>Capas Florida</strong> (zona norte, Rahuil, Poñén-Roa, nocturno): art. 4° desde 2025.</li>
          <li><strong>Biotrén</strong>: régimen EFE, NO Ley 20.378; integración intermodal en discusión.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Los corredores privados puros (Conce↔Yumbel, El Pimentón){' '}
          <strong>no reciben subsidio Ley 20.378</strong>: tarifa libre
          con autorización individual SEREMITT.
        </p>
      </Section>

      <Section title="Vínculos con otros artículos">
        <p>
          Si quieres seguir el rastro del dinero por el wiki,
          estos son los puntos donde la Ley 20.378 se
          materializa en una decisión concreta:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
              SEREMITT Biobío y la DTPR
            </a>{' '}
            — la institución que ejecuta el subsidio en la
            región. La DTPR liquida mensualmente a cada
            operador con cargo a Ley 20.378.
          </li>
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción 2024
            </a>{' '}
            — el régimen mayor de la región, financiado por el
            subsidio operacional Ley 20.378 a 36 unidades de
            negocio.
          </li>
          <li>
            <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
              Perímetro de Exclusión de Tomé
            </a>{' '}
            — segundo régimen subsidiado del Biobío. Refuerzos
            may-2025 también se financiaron con cargo a Ley
            20.378.
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 Concepción ↔ Santa Juana
            </a>{' '}
            — caso paradigmático de art. 4° Ley 20.378
            (servicio deficitario obligado por bien público).
          </li>
          <li>
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
              Concepción ↔ Florida
            </a>{' '}
            — capas subsidiadas 2025 bajo art. 4° Ley 20.378
            sumadas al corredor troncal privado.
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Recorridos interurbanos del Gran Concepción
            </a>{' '}
            — índice general; cada servicio licitado en el
            índice depende de Ley 20.378 art. 4°.
          </li>
          <li>
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay 2026
            </a>{' '}
            — el sistema de recaudación no es Ley 20.378 pero
            recauda en buses cuya operación sí está
            subsidiada por ella.
          </li>
          <li>
            <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
              Electrocorredores MOP del Biobío
            </a>{' '}
            — la infraestructura la paga el MOP por concesión;
            la operación de buses sobre la infraestructura
            seguirá financiada por Ley 20.378.
          </li>
          <li>
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
              Biotrén y sus extensiones
            </a>{' '}
            — EFE no se financia con Ley 20.378, pero la
            integración tarifaria con buses subsidiados es
            tema abierto.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Número y fecha exacta de la última prórroga vigente 2026 (BCN).</li>
          <li>Monto agregado anual 2024-2026 (DIPRES Partida 19 - MTT) y desagregación Biobío por componente.</li>
          <li>Fórmula de distribución regional (ponderadores).</li>
          <li>Reembolso TNE pagado a operadores del Biobío 2024-2026.</li>
          <li>Costo por pasajero subsidiado (razón subsidio/validaciones).</li>
          <li>Texto íntegro de Resolución MTT de distribución regional anual.</li>
          <li>Detalle del programa de renovación de flota y montos al Biobío.</li>
          <li>Fórmula del polinomio de ajuste del PE Gran Concepción 2024.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: DIPRES, BCN Ley Chile, Subtrans vía Ley 20.285.
        </p>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes número y fecha de la última prórroga al 2026,
          cifras DIPRES Partida 19 desagregadas o resoluciones MTT de
          distribución regional — abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/subsidio-ley-20378.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/subsidio-ley-20378.tsx
          </SourceLink>
          .
        </p>
      </Section>
    </div>
  );
}
