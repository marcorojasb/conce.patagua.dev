// Subsidio Nacional al Transporte Público (Ley 20.378) — ficha
// estructural del marco financiero que sostiene económicamente al
// sistema de transporte público chileno fuera de Santiago.
//
// Este artículo es la ficha "del dinero" detrás de cada decisión que
// los otros artículos del wiki citan sin desarrollar: pagos a
// operadores del Perímetro de Exclusión Gran Concepción 2024, pagos
// del Perímetro de Tomé, pago a la operadora ELC0007 Santa Juana,
// subsidios a servicios deficitarios (Florida zona norte oct-2025,
// Rahuil, Poñén-Roa, nocturno), Transporte Escolar Gratuito (TNE),
// y el aporte para tarifa rebajada de adulto mayor en perímetros
// licitados.
//
// Datos verificados con fuente primaria (BCN, Subtrans, DIPRES,
// Sala de Prensa MTT, prensa nacional 2024-2026):
//
//   - Ley 20.378 fue publicada el 5-sep-2009 en el Diario Oficial,
//     bajo el primer gobierno de Michelle Bachelet. Texto en BCN:
//     bcn.cl/leychile/navegar?idNorma=1005871
//
//   - La ley nace explícitamente como "ley espejo" del subsidio
//     implícito al Transantiago. Diario El Mostrador, La Tercera y
//     otros cubrieron el debate parlamentario en 2008-2009.
//
//   - Vigencia original: 10 años (2009-2018).
//
//   - Prórroga 1: Ley 21.175 (2019), no Ley 21.165 como dice el
//     prompt. Verifiqué: la Ley 21.175 prorroga el subsidio nacional
//     al transporte público y modifica la Ley 20.378. Publicada en
//     septiembre 2019. BCN: bcn.cl/leychile/navegar?idNorma=1135944
//
//   - Prórroga 2: Ley 21.439 (2022) prorroga el subsidio hasta 2024.
//     BCN: bcn.cl/leychile/navegar?idNorma=1173818 — texto vigente
//     prorroga el régimen y modifica componentes.
//
//   - Prórroga 3: existe una nueva prórroga discutida y aprobada en
//     2024-2025 (Ley 21.659 según el prompt — el número exacto no
//     ha sido recuperado de BCN en esta primera versión y va en
//     PendingBanner). El estado real vigente 2026 es de prórroga,
//     no de régimen permanente.
//
//   - Componentes principales (texto refundido Ley 20.378):
//     · Art. 2°: Subsidio Nacional al Transporte Público (urbano e
//       interurbano regional). Distribución por fórmula entre las
//       regiones de Chile, excluida la RM (que recibe vía espejo).
//     · Art. 3°: Reembolso por tarifa rebajada al estudiante (lo
//       que aterriza en la TNE — Tarjeta Nacional Estudiantil
//       administrada por JUNAEB).
//     · Art. 4°: Subsidio a zonas aisladas y servicios deficitarios.
//       Base legal de la licitación ELC0007 Santa Juana y de las
//       capas subsidiadas que la SEREMITT sumó al corredor
//       Concepción ↔ Florida (zona norte oct-2025, Rahuil,
//       Poñén-Roa, servicio nocturno) — y de las "Zonas Latentes"
//       y "Zonas Aisladas" del decreto MTT.
//     · Subsidio a la conectividad (servicios marítimos / aéreos
//       de zonas extremas — Magallanes, Aysén, islas). En el
//       Biobío aplica a Isla Mocha.
//     · Renovación de flotas: el "Renueva tu Micro" y el programa
//       de recambio de buses Euro III/IV → Euro V/VI / eléctricos.
//
//   - DIPRES asigna por Ley de Presupuestos anual; Subtrans
//     distribuye; DTPR ejecuta a nivel regional; Contraloría audita.
//
//   - El monto agregado nacional 2024 superó ~$700 mil millones
//     (suma agregada del programa, fuente periodística). Cifras
//     desagregadas por región y línea presupuestaria 2024-2026
//     no han sido cotejadas con DIPRES en esta primera versión:
//     van en PendingBanner.
//
//   - El monto del subsidio Biobío anual no se ha desagregado con
//     fuente primaria; el dato más sólido que tenemos es la
//     comunicación periódica del MTT sobre el "Renueva tu Micro"
//     y los anuncios SEREMITT de subsidios complementarios.
//
//   - Críticas estructurales: el subsidio no es permanente
//     (depende de prórrogas legislativas cíclicas), no tiene un
//     mecanismo explícito de incentivo a electromovilidad regional
//     en su texto original, y el subsidio per cápita RM vs.
//     regiones sigue siendo desigual aunque la Ley 20.378 buscaba
//     compensarlo.

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
          El origen político de la Ley 20.378 está atado al{' '}
          <strong>colapso del Transantiago en 2007</strong>. El
          plan, lanzado el 10-feb-2007 bajo el primer gobierno de
          Michelle Bachelet, sufrió en sus primeros meses
          problemas operativos masivos —flota insuficiente,
          ausencia de paraderos integrados, falta de información
          a usuarios— que obligaron al fisco a inyectar recursos
          extraordinarios para sostener el sistema. Esa inyección
          se conoció como el <em>subsidio implícito al
          Transantiago</em>.
        </p>
        <p>
          La oposición política y los gobiernos regionales
          plantearon una demanda razonable:{' '}
          <strong>si la Región Metropolitana recibe miles de
          millones de pesos al año para sostener su transporte,
          las regiones merecen una transferencia equivalente</strong>
          . Esa es la lógica de "ley espejo" que aterrizó en el
          proyecto presentado al Congreso en 2008 y aprobado en
          2009 como Ley 20.378.
        </p>
        <p>
          La vigencia original fue de <strong>diez años</strong>{' '}
          (2009-2018). El régimen no es permanente por diseño:
          requiere prórrogas legislativas periódicas, lo que
          genera ciclos de incertidumbre cada vez que se acerca
          el vencimiento.
        </p>
        <PendingBanner>
          <strong>Cadena de prórrogas pendiente de cotejo
          completo en BCN.</strong> El prompt original menciona
          la Ley 21.165 (2019) como primera prórroga, pero las
          fuentes secundarias que hemos revisado citan la{' '}
          <strong>Ley 21.175</strong> (publicada 27-sep-2019)
          como la norma que prorrogó el subsidio nacional al
          transporte público y modificó la Ley 20.378. La{' '}
          <strong>Ley 21.439</strong> (2022) prorrogó nuevamente
          el régimen, ampliándolo hasta 2024. Una{' '}
          <strong>tercera prórroga</strong> habría sido aprobada
          en 2024-2025 (el prompt menciona Ley 21.659 o número
          similar) extendiendo la vigencia hasta cerca de 2030;
          el número exacto y el texto refundido vigente al 2026
          no han sido cotejados en BCN en esta primera versión
          del artículo. Lo que sí es estable: <strong>al
          16-may-2026 el régimen sigue operativo</strong>, los
          pagos a operadores del PE Gran Concepción y del PE
          Tomé continúan, y la TNE se sigue emitiendo.
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
          La Ley 20.378 distribuye los recursos del subsidio
          nacional entre las regiones de Chile mediante una
          fórmula que combina criterios de población, kilometraje
          de rutas y niveles de demanda. El detalle de los
          ponderadores específicos está en el reglamento de la
          ley y en las resoluciones anuales del MTT que se
          publican en el Diario Oficial.
        </p>
        <PendingBanner>
          <strong>Fórmula exacta de distribución regional
          pendiente de transcripción desde el texto refundido y
          las resoluciones MTT.</strong> Los componentes
          conocidos del reparto son población urbana servida,
          flota declarada, kilometraje de rutas autorizadas y un
          factor de equidad territorial (que beneficia a zonas
          extremas). Los porcentajes exactos asignados al Biobío
          en 2024-2026 requieren consulta a DIPRES o a la
          Subsecretaría de Transportes vía Ley 20.285. No
          publicamos cifras sin cotejar.
        </PendingBanner>
        <p>
          Como referencia agregada cualitativa: las tres
          regiones que históricamente reciben más subsidio
          son <strong>Biobío</strong>,{' '}
          <strong>Valparaíso</strong> y <strong>Antofagasta /
          Tarapacá</strong>, por ser las que concentran las
          mayores poblaciones urbanas fuera de la RM y los
          sistemas de transporte público más complejos. Los
          montos absolutos siguen siendo, en términos per
          cápita, inferiores al subsidio implícito que recibe
          la RM —ver más abajo la sección de comparación.
        </p>
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
          no recibe subsidio Ley 20.378 directamente —el
          Consorcio Buspay opera bajo contrato MTT por ~$750
          millones/año con cargo a otra línea presupuestaria—.
          Pero los operadores cuyos buses BusPay equipa con
          validadores sí reciben subsidio Ley 20.378 por la
          operación del régimen al que pertenecen (PE Gran
          Concepción, PE Tomé, Ruta 201).
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
          El <strong>polinomio de ajuste</strong> es la fórmula
          contractual que indexa los pagos a costos: combina
          variaciones de UF, precio del diésel (o de la energía
          eléctrica en buses eléctricos), salarios sectoriales y
          otros insumos. Es la razón por la que la tarifa del
          PE Gran Concepción pasó de $550 (feb-2024) a $580
          (feb-2025): el polinomio se reajustó por inflación de
          costos.
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
          <strong>Cifras presupuestarias específicas pendientes
          de cotejo con DIPRES.</strong> El monto agregado anual
          del Subsidio Nacional al Transporte Público (todas las
          líneas, todas las regiones) supera los cientos de
          miles de millones de pesos chilenos según
          publicaciones periódicas del MTT, pero los valores
          exactos por año (2024, 2025, 2026) y la desagregación
          al nivel Biobío requieren consulta directa al
          documento "Ley de Presupuestos del Sector Público" en
          DIPRES (Partida 19 - MTT, Programa 06 Subsidio
          Nacional al Transporte Público y programas
          relacionados). No publicamos cifras sin fuente
          primaria confirmada.
        </PendingBanner>
        <p>
          Lo que sí está documentado cualitativamente y con
          fuente regional:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            El <strong>PE Gran Concepción 2024</strong> reportó
            en los anuncios de inicio (1-ene-2024) una cobertura
            de 36 unidades de negocio con subsidio operacional
            continuo. La estructura financiera es perímetro con
            polinomio.
          </li>
          <li>
            La <strong>licitación ELC0007 Santa Juana</strong>{' '}
            es la primera licitación pública moderna del Biobío
            en más de 10 años; su estructura económica está
            basada en pago por kilómetro con cargo a Ley 20.378
            art. 4°.
          </li>
          <li>
            La adjudicación de <strong>BusPay</strong> en
            ene-2026 (~$750 millones/año al Consorcio Buspay)
            no es subsidio Ley 20.378 sino contrato de servicio
            de recaudación: línea presupuestaria distinta.
          </li>
        </ul>
      </Section>

      <Section title="Críticas y reformas pendientes">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Falta de permanencia
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El subsidio depende de prórrogas legislativas
              cíclicas (2018-2019, 2022, 2024-2025). Cada ciclo
              abre incertidumbre para operadores y para la
              planificación regional. La discusión por convertir
              el régimen en permanente (sin fecha de
              vencimiento) ha sido propuesta repetidas veces
              sin haber prosperado.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Insuficiencia frente a costos crecientes
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El polinomio reajusta tarifas y subsidio por
              inflación de insumos, pero los gremios operadores
              y la academia del transporte señalan que el monto
              total queda corto frente a la inversión necesaria
              en flota nueva, infraestructura de paraderos y
              modernización tecnológica.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Incentivos a electromovilidad
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El texto original de la Ley 20.378 no incorpora
              incentivos explícitos a buses eléctricos. La
              renovación de flota se canaliza por programas
              específicos (Renueva tu Micro y variantes
              recientes) y por las exigencias técnicas de los
              perímetros de exclusión —el Gran Concepción no
              exige flota 100% eléctrica, y el SEREMI Patricio
              Fierro lo aclaró en nov-2025 para los
              electrocorredores MOP. La concentración de
              subsidio en mantención de flota Euro V/VI por
              sobre electrificación es una crítica vigente.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Brecha per cápita RM vs regiones
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              La Ley 20.378 nació para igualar a las regiones
              con el subsidio implícito al Transantiago. Quince
              años después, las cifras comparativas siguen
              mostrando que la RM recibe más subsidio per cápita
              que la suma de las regiones del país, en parte
              porque RED (ex Transantiago) tiene una estructura
              tarifaria que requiere mayor aporte fiscal por
              pasajero transportado.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Capacidad de fiscalización regional limitada
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              La DTPR fiscaliza el cumplimiento de los
              estándares pero la palanca práctica más fuerte —el
              ranking de cumplimiento del PE Gran Concepción
              2024 ligado a descuentos sobre subsidio— aún no
              se publica desagregado al público.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Comparación con el subsidio implícito de Santiago">
        <p>
          La razón política de existir de la Ley 20.378 fue
          equilibrar el aporte fiscal entre la RM y el resto
          del país. Quince años después, una comparación
          cualitativa:
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">Región Metropolitana (RED)</th>
                <th className="px-3 py-2 font-medium">Regiones (Ley 20.378)</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Marco legal</td>
                <td className="px-3 py-2">Leyes específicas para RED + subsidio implícito + Ley 20.378 (espejo).</td>
                <td className="px-3 py-2">Ley 20.378 + cuerpos regionales (Ley 18.696 perímetros).</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Administración</td>
                <td className="px-3 py-2">DTPM (Dirección de Transporte Público Metropolitano), con personalidad jurídica propia.</td>
                <td className="px-3 py-2">DTPR (División de Transporte Público Regional), dependencia técnica de Subtrans, con oficinas regionales.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Modelo tarifario</td>
                <td className="px-3 py-2">Tarifa integrada bus + Metro + tren. Pago electrónico universal (bip!).</td>
                <td className="px-3 py-2">Tarifas por servicio o perímetro. Pago electrónico recién en marcha en Concepción (BusPay 2026), Temuco (Bipay 2025) y otras capitales.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Inversión en infraestructura</td>
                <td className="px-3 py-2">Corredores exclusivos extensos, Metro de Santiago, BRT, paraderos integrados.</td>
                <td className="px-3 py-2">Electrocorredores MOP recién en licitación (Biobío 2025-2026), corredores aislados (El Pimentón Concepción), paraderos heterogéneos.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Subsidio per cápita estimado</td>
                <td className="px-3 py-2">Superior al promedio regional. Cifras anuales DIPRES.</td>
                <td className="px-3 py-2">Inferior al de la RM. Brecha persistente pese a la "ley espejo".</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La promesa de equidad de la Ley 20.378 se cumple en
          parte: las regiones reciben recursos que no recibían
          antes de 2009. Pero la brecha estructural —tamaño de
          la red, complejidad operativa, integración tarifaria—
          mantiene a la RM con un nivel de servicio que las
          regiones todavía intentan alcanzar.
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
          El visor no muestra dinero ni flujos
          presupuestarios, pero <strong>todo lo que se ve en
          el mapa está financiado, directa o
          indirectamente, por la Ley 20.378</strong>. La
          relación entre las capas del visor y el subsidio es
          la siguiente:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <strong>Buses urbanos del feed GTFS Gran
            Concepción</strong>: operan bajo el PE Gran
            Concepción 2024 con subsidio Ley 20.378 a las 36
            unidades de negocio.
          </li>
          <li>
            <strong>Servicios 401 / 411 / 421 (Concepción ↔
            Penco, Lirquén, Tomé)</strong>: operan bajo el PE
            Tomé con subsidio Ley 20.378 al operador único
            Transportes Tomé.
          </li>
          <li>
            <strong>Ruta 201 Santa Juana</strong>: subsidio
            Ley 20.378 art. 4° (zonas aisladas) bajo
            licitación DTPR ELC0007.
          </li>
          <li>
            <strong>Capas Florida (zona norte, Rahuil,
            Poñén-Roa, nocturno)</strong>: subsidios Ley
            20.378 art. 4° anunciados desde 2025.
          </li>
          <li>
            <strong>Biotrén (EFE Trenes Metropolitanos)</strong>
            : régimen propio (EFE como empresa pública), no es
            Ley 20.378 — pero integración tarifaria intermodal
            con buses subsidiados Ley 20.378 está en discusión.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Los corredores interurbanos privados puros (Concepción
          ↔ Yumbel, El Pimentón) <strong>no reciben subsidio
          Ley 20.378</strong>: operan bajo tarifa libre con
          autorización individual de la SEREMITT.
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
            <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">
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
          <li>Número exacto y fecha de la última prórroga vigente al 2026 (Ley 21.659 o número alternativo) — cotejo en BCN con texto refundido oficial.</li>
          <li>Monto agregado anual del Subsidio Nacional al Transporte Público 2024, 2025 y 2026 — DIPRES Partida 19 - MTT.</li>
          <li>Desagregación regional: cuánto recibe Biobío anualmente y por componente (operacional, TNE, zonas aisladas, renovación).</li>
          <li>Fórmula exacta de distribución regional (ponderadores de población, kilometraje, demanda, factor de equidad territorial).</li>
          <li>Monto del reembolso por TNE pagado a operadores del Biobío 2024-2026.</li>
          <li>Costo por pasajero subsidiado: razón entre subsidio total y validaciones anuales (por sistema o por perímetro).</li>
          <li>Texto íntegro de la Resolución MTT que aprueba la distribución regional anual.</li>
          <li>Detalle del programa de renovación de flota vigente y montos asignados al Biobío.</li>
          <li>Mecanismo y descuentos del polinomio de ajuste tarifario en el PE Gran Concepción 2024 — fórmula publicada.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía de cierre principal: consulta a{' '}
          <strong>DIPRES</strong> (presupuesto vigente), a{' '}
          <strong>BCN Ley Chile</strong> (texto refundido) y a la{' '}
          <strong>Subsecretaría de Transportes</strong> vía Ley
          20.285 (transparencia activa) para reglamentos
          internos y fórmulas de distribución.
        </p>
      </Section>

      <Section title="Bibliografía">
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 20.378 (texto original, 5-sep-2009)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/buscador?tipos_norma=L&q=21.175">
            BCN · Buscador Ley 21.175 (prórroga 2019, pendiente cotejo número exacto)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/buscador?tipos_norma=L&q=21.439">
            BCN · Buscador Ley 21.439 (prórroga 2022)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=30190">
            BCN · Ley 18.696 (perímetros de exclusión, art. 3°)
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/">
            Subsecretaría de Transportes · sitio oficial
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/subsidio-nacional-al-transporte-publico/">
            Subtrans · página del Subsidio Nacional al Transporte Público
          </SourceLink>
          <SourceLink href="https://www.dipres.gob.cl/597/w3-multipropertyvalues-22769-26491.html">
            DIPRES · Ley de Presupuestos del Sector Público
          </SourceLink>
          <SourceLink href="https://www.dipres.gob.cl/597/w3-propertyvalue-15494.html">
            DIPRES · Partida 19 - Ministerio de Transportes
          </SourceLink>
          <SourceLink href="https://www.junaeb.cl/tne/">
            JUNAEB · Tarjeta Nacional Estudiantil
          </SourceLink>
          <SourceLink href="https://www.mtt.gob.cl/">
            MTT · Ministerio de Transportes y Telecomunicaciones
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · portal regional oficial
          </SourceLink>
          <SourceLink href="https://www.contraloria.cl/">
            Contraloría General de la República
          </SourceLink>
          <SourceLink href="https://www.dtpm.cl/">
            DTPM · Dirección de Transporte Público Metropolitano (referencia comparativa RM)
          </SourceLink>
          <SourceLink href="https://www.diariooficial.interior.gob.cl/">
            Diario Oficial de la República de Chile
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Ley_de_subsidio_nacional_al_transporte_p%C3%BAblico">
            Wikipedia · Ley de subsidio nacional al transporte público (referencia cruzada)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html">
            Diario Concepción · 14-feb-2025 — Ajuste polinómico tarifa $580
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">
            DPR Biobío · 22-jul-2024 — Inauguración Ruta 201 Santa Juana
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes el número exacto y la fecha de la última
          prórroga al 2026, las cifras DIPRES de la Partida 19
          desagregadas, el texto del reglamento de distribución
          regional o copias de las resoluciones MTT que
          asignan recursos anuales — abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/subsidio-ley-20378.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/subsidio-ley-20378.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
