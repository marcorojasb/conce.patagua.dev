// Taxis colectivos del Gran Concepción — modo urbano masivo invisibilizado.
//
// Hasta hoy la sección "urbanos" del wiki solo tenía el Biotrén. Los taxis
// colectivos son el otro modo urbano masivo del Gran Concepción y no estaban
// documentados en ninguna ficha. Este artículo abre la pieza.
//
// Lo que está bien sostenido con fuente primaria:
//   - DS 212/1992 del MTT (Reglamento de los Servicios Nacionales de
//     Transporte Público de Pasajeros) define la modalidad colectivo.
//   - Ley 18.696 (régimen de subsidio y atribuciones MTT) — la misma que
//     sostiene los perímetros de exclusión.
//   - Ley 18.290 (Ley de Tránsito) regula vehículos, licencias y señalética.
//   - Ley 20.474 (cierre del padrón nacional de taxis, año 2011) — congela
//     inscripciones por 5 años, prorrogada por leyes posteriores.
//   - Color reglamentario nacional: negro con techo amarillo (DS 212/1992).
//   - Alcance BusPay 2026 = solo buses urbanos de los Perímetros + Ruta 201.
//     Los taxis colectivos NO están incluidos (Subtrans · 30-ene-2026).
//   - GTFS Gran Concepción cubre buses urbanos del Perímetro 2024; los
//     taxis colectivos no están en el feed (ver gtfs-gran-concepcion).
//
// Lo que va con banner ámbar (no verificable a la fecha de cierre):
//   - Cantidad total exacta de taxis colectivos operando en el Gran
//     Concepción 2025-2026.
//   - Lista íntegra de líneas troncales con su número y razón social.
//   - Tarifa diurna/nocturna vigente 2026 — varía por línea, no hay
//     tarifa unificada como en el bus urbano del Perímetro.
//   - Nombre y existencia exacta de "FERETAX" como federación regional.
//   - Estadísticas de participación modal en viajes del Gran Concepción.
//   - Decreto regional Biobío que cree un perímetro de exclusión específico
//     para taxis colectivos (no me consta que exista).
//
// Política de nombres aplicada: BusPay (camelCase) para el sistema,
// Consorcio Buspay para la SPV, Busmatick para el operador técnico.

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function TaxisColectivosGranConcepcion() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificación parcial con fuentes primarias.</strong> Marco
        legal (DS 212/1992, Ley 18.290, Ley 18.696, Ley 20.474 que cerró el
        padrón nacional de taxis en 2011), color reglamentario nacional
        (negro con techo amarillo) y alcance declarado de BusPay 2026
        (buses urbanos de los Perímetros + Ruta 201, sin taxis colectivos)
        están citados. <strong>Pendientes</strong>: cantidad total de taxis
        colectivos operando en el Gran Concepción 2025-2026, catastro
        íntegro de líneas troncales con sus razones sociales y códigos,
        tarifa adulto/nocturna vigente 2026 por línea (varía — no es
        tarifa única como el bus del Perímetro), nombre exacto y vigencia
        de la federación gremial regional, estadísticas de participación
        modal. Todo número grueso lleva banner ámbar inline para que el
        lector lo trate como orden de magnitud, no como dato auditado.
      </VerifiedBanner>

      <Section title="Qué son y por qué importan">
        <p>
          Los <strong>taxis colectivos</strong> son vehículos tipo automóvil
          de hasta <strong>seis pasajeros</strong> que operan en{' '}
          <strong>líneas fijas con tarifa por persona</strong> (no por
          vehículo, como el taxi básico). Se mueven por recorridos
          declarados ante la autoridad, con paraderos en cabecera y desvíos
          puntuales por la línea, y cobran una tarifa plana o por tramo
          equivalente a "media micro" — funcionan como una{' '}
          <em>micro chica</em>. La modalidad está definida en el{' '}
          <strong>artículo 2°</strong> del{' '}
          <strong>DS 212/1992</strong> del MTT, Reglamento de los Servicios
          Nacionales de Transporte Público de Pasajeros
          (
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=11497">
            BCN Ley Chile · DS 212/1992
          </SourceLink>
          ).
        </p>
        <p>
          Importan en el Gran Concepción por cuatro razones de fondo:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Mueven una proporción significativa del viaje urbano
            diario.</strong> La encuesta origen-destino de SECTRA y los
            catastros DTPR Biobío sostienen históricamente que los taxis
            colectivos compiten en volumen con los buses urbanos en ejes
            cortos (Concepción ↔ Talcahuano, Concepción ↔ Chiguayante,
            Plaza Independencia ↔ barrio universitario). La cifra exacta
            de participación modal 2024-2026 está pendiente de cita.
          </li>
          <li>
            <strong>Llenan el hueco entre el taxi puro y el bus.</strong>{' '}
            Frecuencia más alta que el bus ("sale cuando se llena"),
            asiento garantizado, tiempo de viaje menor en hora punta, pero
            tarifa muy por debajo del taxi básico — el costo se reparte
            entre los pasajeros.
          </li>
          <li>
            <strong>Padrón nacional cerrado desde 2011.</strong> La{' '}
            <strong>Ley 20.474</strong> congeló las inscripciones de taxis
            (incluidos los colectivos) a nivel nacional por cinco años, y
            sucesivas prórrogas legales han mantenido el cierre. En el
            Gran Concepción esto significa que las líneas operan con{' '}
            <em>cupos fijos</em>: no entran autos nuevos al sistema; los
            cupos se traspasan entre operadores con valor de mercado
            secundario apreciable
            (
            <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1024893">
              BCN · Ley 20.474
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Quedan fuera de BusPay 2026.</strong> El sistema de
            pago electrónico licitado al{' '}
            <strong>Consorcio Buspay</strong> (operador técnico{' '}
            <strong>Busmatick</strong>) en enero de 2026 cubre buses
            urbanos de los Perímetros del Gran Concepción y Tomé, la
            regulación especial Coronel-Lota y la Ruta 201 Santa Juana —
            no menciona taxis colectivos en el alcance publicado
            (
            <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
              Subtrans · 30-ene-2026
            </SourceLink>
            ). Implicancia inmediata: los colectivos seguirán cobrando en
            efectivo cuando los buses del Perímetro estén en régimen
            electrónico.
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=11497">
            BCN Ley Chile · DS 212/1992 (define modalidad colectivo)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1024893">
            BCN Ley Chile · Ley 20.474 (padrón nacional cerrado 2011)
          </SourceLink>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · adjudicación BusPay 28-ene-2026 (alcance buses, no colectivos)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Marco legal">
        <p>
          El régimen de los taxis colectivos se sostiene en cuatro normas
          principales, todas aplicables a nivel nacional. La autoridad
          que las opera en la región es la{' '}
          <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
            SEREMITT Biobío y la DTPR
          </a>
          .
        </p>
        <KeyValueList
          items={[
            [
              'DS 212/1992 del MTT',
              <>
                Reglamento de los Servicios Nacionales de Transporte
                Público de Pasajeros. Define la modalidad{' '}
                <strong>"taxi colectivo"</strong> (vehículo automóvil de
                hasta 6 pasajeros, recorrido y tarifa fija autorizados),
                obligaciones de inscripción en el Registro Nacional de
                Servicios de Transporte de Pasajeros (RNSTP), señalética
                exterior, antigüedad máxima del vehículo y régimen
                disciplinario.{' '}
                <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=11497">
                  BCN · DS 212/1992
                </SourceLink>
              </>,
            ],
            [
              'Ley 18.290 · Ley de Tránsito',
              <>
                Regula el vehículo (categoría automóvil), la licencia
                profesional del conductor (clase A2 para transporte
                público menor de pasajeros) y las normas generales de
                circulación.{' '}
                <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29708">
                  BCN · Ley 18.290
                </SourceLink>
              </>,
            ],
            [
              'Ley 18.696',
              <>
                Régimen general de subsidio al transporte público mayor y
                atribuciones del MTT para regular. El{' '}
                <strong>artículo 3°</strong> es el mismo que se usa para
                crear los perímetros de exclusión de buses — habilita al
                MTT a fijar tarifas y condiciones operativas en zonas
                geográficas definidas. No se ha usado al cierre 2025-2026
                para crear un perímetro de exclusión específico de taxis
                colectivos en el Gran Concepción.{' '}
                <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29994">
                  BCN · Ley 18.696
                </SourceLink>
              </>,
            ],
            [
              'Ley 20.474 (2011) · padrón cerrado',
              <>
                Suspendió por cinco años la inscripción de nuevos taxis
                (básicos, ejecutivos y colectivos) en el RNSTP. Prórrogas
                sucesivas han mantenido el cierre — al cierre 2025-2026
                no se otorgan nuevas inscripciones a nivel nacional. El
                stock de cupos por línea queda fijo y los traspasos
                ocurren en mercado secundario.{' '}
                <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1024893">
                  BCN · Ley 20.474
                </SourceLink>
              </>,
            ],
          ]}
        />
        <PendingBanner>
          <strong>Pendiente verificar:</strong> número exacto y fecha de
          la última prórroga legal del padrón cerrado vigente en 2026,
          existencia (o no) de un decreto regional Biobío que cree un{' '}
          <em>perímetro de exclusión de taxis colectivos</em> específico
          para el Gran Concepción, y antigüedad máxima reglamentaria
          aplicable a colectivos urbanos en la región (el DS 212 fija un
          tope, pero distintas zonas tarifarias del país aplican
          regímenes distintos vía resoluciones del MTT). Cierre por Ley
          de Transparencia a la DTPR Biobío.
        </PendingBanner>
      </Section>

      <Section title="Líneas troncales">
        <PendingBanner>
          <strong>El catastro íntegro de líneas activas en el Gran
          Concepción no está cerrado en este artículo.</strong> Los
          ejemplos que siguen son <em>corredores observables</em>{' '}
          documentados en prensa regional y conocimiento de campo, no la
          lista oficial de la DTPR. Cada línea opera con un número
          (asignado por la autoridad) y una razón social — la tabla
          completa requiere acceso al catastro RNSTP regional via Ley de
          Transparencia. Lo que sigue es el mapa cualitativo de ejes,
          no la lista cuantitativa.
        </PendingBanner>
        <p>
          Los taxis colectivos del Gran Concepción operan típicamente
          radialmente desde el centro de Concepción (Plaza Independencia,
          Plaza Perú, Plaza Acevedo) hacia las comunas y barrios
          conurbados. Los ejes troncales identificables son:
        </p>
        <KeyValueList
          items={[
            [
              'Eje Talcahuano',
              <>
                Plaza Independencia ↔ Talcahuano centro (incluye variantes
                por San Vicente, El Morro, Higueras). Eje histórico — la
                ruta entre las dos cabeceras urbanas del área. Compite
                directamente con la <strong>Línea 1 del Biotrén</strong>{' '}
                (
                <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">
                  ver artículo Biotrén
                </a>
                ) y con líneas del{' '}
                <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
                  Perímetro 2024
                </a>
                .
              </>,
            ],
            [
              'Eje Hualpén',
              'Plaza Independencia ↔ Hualpencillo, El Triángulo, Caleta Lenga. Comuna joven (creada 2004) con dependencia alta del transporte menor.',
            ],
            [
              'Eje Chiguayante',
              'Plaza Independencia ↔ Chiguayante centro, Lonco Parque, Manquimávida. Compite con la L1 Biotrén y con servicios licitados.',
            ],
            [
              'Eje San Pedro de la Paz',
              'Plaza Independencia ↔ Costanera de San Pedro, Boca Sur, Michaihue. Cruza el puente Llacolén o el Juan Pablo II.',
            ],
            [
              'Eje Pedro de Valdivia / Lorenzo Arenas',
              'Recorridos cortos intra-Concepción que sirven barrios residenciales del poniente.',
            ],
            [
              'Eje barrio universitario',
              'Plaza Perú ↔ Universidad de Concepción ↔ UdeC Lomas / Barrio Norte. Demanda fuerte en período lectivo, demanda baja en verano.',
            ],
            [
              'Eje Collao / Nonguén / Lomas',
              'Plaza Acevedo ↔ sectores nor-oriente de Concepción (Lomas de San Sebastián, Nonguén, Collao alto). Topografía exigente que el bus no siempre sirve bien.',
            ],
            [
              'Eje Hualqui (interurbano corto)',
              'Concepción ↔ Hualqui por la ribera sur del Biobío. Es ruta limítrofe entre lo urbano y lo interurbano corto.',
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          La lista anterior es <strong>cualitativa, no exhaustiva</strong>.
          Cada uno de estos ejes tiene en la práctica entre dos y seis
          líneas autorizadas (con distintos recorridos, terminales y
          razones sociales), cuya identificación detallada queda fuera del
          alcance de este artículo hasta tener acceso al catastro RNSTP
          regional.
        </p>
      </Section>

      <Section title="Operadores y federación gremial">
        <p>
          La organización empresarial del sector se da en{' '}
          <strong>sindicatos o asociaciones de propietarios por línea</strong>{' '}
          (frecuentemente bajo figura de cooperativa o sociedad por
          acciones pequeña), agrupados a su vez en una federación
          regional. Cada propietario corre típicamente uno o dos
          vehículos; la línea funciona como un colectivo gremial que
          coordina turnos, paraderos y mantención.
        </p>
        <PendingBanner>
          <strong>Federación regional pendiente de verificar.</strong> La
          referencia conocida en prensa nacional es la{' '}
          <strong>CONATACOCH</strong> (Confederación Nacional de Taxis
          Colectivos de Chile), que agrupa federaciones regionales. La
          existencia, nombre exacto, razón social y vigencia de la
          federación regional del Biobío (a veces referida en prensa
          local como "FERETAX" o similar) está pendiente de cita
          primaria. Cierre por contacto directo con CONATACOCH o
          consulta al Registro de Asociaciones Gremiales del Ministerio
          de Economía.
        </PendingBanner>
        <p className="text-[12px] text-muted-foreground">
          La diferencia con el sector bus urbano es estructural: los
          operadores de bus del{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro 2024
          </a>{' '}
          son 33-35 empresas con flotas de 30-150 buses cada una, sujetas
          a contrato MTT con métricas de calidad. Los operadores de taxi
          colectivo son centenares de propietarios con uno o dos autos
          cada uno, sin contrato MTT, sin métricas de servicio fijas y
          sin obligación de publicar GTFS.
        </p>
      </Section>

      <Section title="Flota">
        <PendingBanner>
          <strong>Cifra total de la flota pendiente.</strong> No hay
          publicación oficial reciente de la DTPR Biobío con el total de
          taxis colectivos operando en el Gran Concepción 2025-2026.
          Estimaciones de prensa regional citan órdenes de magnitud entre
          dos mil y cuatro mil vehículos activos, pero ninguna cifra es
          auditable a la fecha de cierre. Este wiki no fija un número
          mientras no exista fuente primaria. Cierre por consulta vía
          Ley de Transparencia al RNSTP regional.
        </PendingBanner>
        <KeyValueList
          items={[
            [
              'Tipo de vehículo',
              'Automóvil sedán o hatchback de hasta 6 pasajeros (incluido el conductor), reglamentado por el DS 212/1992 y la Ley 18.290.',
            ],
            [
              'Marcas y modelos dominantes',
              'Hyundai Accent, Kia Rio, Chevrolet Sail, Suzuki Swift y derivados — segmento subcompacto y compacto económico, motorización 1.4–1.6 L bencina. Observación de calle, sin cita auditable.',
            ],
            [
              'Antigüedad máxima',
              'El DS 212/1992 y sus modificaciones fijan topes de antigüedad para vehículos de transporte público. La cifra exacta aplicable a colectivos urbanos en 2026 (típicamente entre 8 y 12 años según zona y norma vigente) está pendiente de cita primaria.',
            ],
            [
              'Renovación',
              'Sujeta al padrón cerrado (Ley 20.474) — un cupo solo puede ser ocupado por un vehículo nuevo si reemplaza a uno dado de baja. No hay entrada neta de cupos al sistema desde 2011.',
            ],
            [
              'Electrificación',
              'Pendiente. No existe al cierre 2025-2026 una política específica de electrificación de taxis colectivos en el Gran Concepción equivalente a la que sí tiene el sector bus (electrocorredores MOP, buses eléctricos del Perímetro).',
            ],
          ]}
        />
      </Section>

      <Section title="Tarifa y reajuste">
        <PendingBanner>
          <strong>La tarifa no es única.</strong> A diferencia del bus
          urbano del Perímetro de Exclusión 2024 (tarifa fija $580 adulto
          desde 23-feb-2025), cada línea de taxi colectivo fija su tarifa
          mediante resolución del MTT/SEREMITT para esa línea específica,
          con base en un cálculo de costos por kilómetro recorrido y
          ocupación promedio. Esto produce un rango: distintas líneas
          pueden cobrar valores distintos por el mismo eje. La tarifa
          vigente 2026 por línea no está consolidada en este artículo.
        </PendingBanner>
        <KeyValueList
          items={[
            [
              'Estructura tarifaria',
              'Plana por línea o por tramo (cabecera ↔ punto intermedio ↔ destino). El pasajero paga al subir o al bajar; cada pasajero paga su propio boleto.',
            ],
            [
              'Reajuste',
              'A solicitud del operador, vía resolución de la SEREMITT regional con base en un polinomio de costos (combustible, neumáticos, vehículo, mano de obra). Sin polinomio único nacional.',
            ],
            [
              'Tarifa nocturna',
              'Habitualmente con recargo respecto del valor diurno, en una franja típicamente entre 22:00 y 06:00. El recargo exacto se autoriza por resolución y varía por línea.',
            ],
            [
              'Forma de pago',
              'Efectivo. No hay sistema de pago electrónico nacional para taxis colectivos. BusPay 2026 NO los cubre — ver sección "Integración con BusPay" más abajo.',
            ],
            [
              'Información al usuario',
              'Cuadro tarifario obligatorio fijado al interior del vehículo (DS 212/1992). En la calle, la tarifa se conoce por uso o por consulta al conductor.',
            ],
          ]}
        />
      </Section>

      <Section title="Diferencias con buses urbanos">
        <p>
          Aunque comparten función (transporte público regular en
          recorrido fijo), bus urbano y taxi colectivo son productos
          distintos en seis dimensiones:
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">Bus urbano (Perímetro 2024)</th>
                <th className="px-3 py-2 font-medium">Taxi colectivo</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top text-[12px]">
              <tr>
                <td className="px-3 py-2 font-medium">Capacidad por vehículo</td>
                <td className="px-3 py-2">30-70 pasajeros (12 m / 18 m)</td>
                <td className="px-3 py-2">Hasta 6 pasajeros (incluido conductor)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Frecuencia</td>
                <td className="px-3 py-2">Programada por contrato MTT (cada 5-15 min en troncales, más en alimentadores)</td>
                <td className="px-3 py-2">"Sale cuando se llena" — frecuencia emergente más alta en ejes saturados, baja en ejes débiles</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Confort</td>
                <td className="px-3 py-2">Pasajero parado posible y frecuente en hora punta</td>
                <td className="px-3 py-2">Asiento garantizado siempre (no hay pasajero parado por reglamento)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Recorrido</td>
                <td className="px-3 py-2">Fijo y publicado (GTFS, paradas oficiales)</td>
                <td className="px-3 py-2">Línea fija con desvíos puntuales habituales (acercar al pasajero)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tarifa adulto</td>
                <td className="px-3 py-2">$580 plana (Perímetro 2024, vigente desde 23-feb-2025)</td>
                <td className="px-3 py-2">Variable por línea, autorizada por resolución MTT (cifra 2026 pendiente)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Pago</td>
                <td className="px-3 py-2">Efectivo + BusPay (marcha blanca Q3 2026)</td>
                <td className="px-3 py-2">Solo efectivo. Fuera de BusPay</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Régimen</td>
                <td className="px-3 py-2">Perímetro de exclusión por art. 3° Ley 18.696 (contrato MTT con métricas)</td>
                <td className="px-3 py-2">Inscripción en RNSTP por línea (sin contrato MTT, sin métricas de calidad)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Visibilidad en visor</td>
                <td className="px-3 py-2">GTFS Gran Concepción los publica → aparecen en el visor</td>
                <td className="px-3 py-2">NO están en el GTFS → NO aparecen en el visor</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La asimetría regulatoria explica por qué el visor de{' '}
          <code>conce.patagua.dev</code> hoy muestra buses urbanos y
          Biotrén pero no muestra taxis colectivos: no es decisión
          editorial del visor, es ausencia del feed.
        </p>
      </Section>

      <Section title="Integración con BusPay (Q3 2026)">
        <p>
          La adjudicación de <strong>BusPay</strong> al{' '}
          <strong>Consorcio Buspay</strong> (operador técnico{' '}
          <strong>Busmatick</strong>) en enero de 2026 marca el inicio del
          régimen de pago electrónico en el transporte público del Gran
          Concepción. El alcance publicado por la Subsecretaría de
          Transportes detalla once comunas y cuatro regímenes regulatorios
          unificados — <strong>todos en modo bus</strong>:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <strong>PE Gran Concepción</strong> (7 comunas): buses urbanos
            de las 36 unidades de negocio.
          </li>
          <li>
            <strong>PE Tomé</strong>: servicios 401 / 411 / 421 de
            Transportes Tomé SpA.
          </li>
          <li>
            <strong>Regulación especial Coronel-Lota</strong>: operadores
            locales de buses (Res. Ex. 457 MTT, 2012-2013).
          </li>
          <li>
            <strong>Licitación rural ELC0007 Santa Juana</strong>: líneas
            201 y 201 AU de buses (Soc. Transporte de Pasajeros Santa
            Juana SpA).
          </li>
        </ul>
        <p>
          <strong>En ninguno de los cuatro alcances se mencionan los
          taxis colectivos.</strong> La comunicación oficial habla de
          "micros del Gran Concepción", "buses urbanos" y "operadores
          de buses". El sistema fue diseñado con validadores embarcados
          en buses, con un esquema económico de liquidación a operadores
          de bus, y el precedente de Bipay Temuco-Padre Las Casas (que
          BusPay toma como modelo) también está limitado a buses
          (
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026
          </SourceLink>
          ).
        </p>
        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">
            Implicancias para el usuario del Gran Concepción
          </div>
          <ul className="ml-5 list-disc space-y-1 text-[12px]">
            <li>
              En el régimen permanente BusPay (proyectado fines de 2026),
              el usuario podrá pagar con tarjeta sin contacto en bus
              urbano pero <strong>seguirá pagando en efectivo en el
              colectivo</strong>. Para un viaje multimodal bus + colectivo
              quedan dos sistemas de pago distintos.
            </li>
            <li>
              Sin BusPay no hay <strong>trazabilidad</strong> ni datos
              consolidados de demanda para los colectivos. La pregunta
              "cuántos viajes urbanos del Gran Concepción se hacen en
              colectivo" queda sin respuesta dura.
            </li>
            <li>
              Sin tarifa integrada, el costo combinado del viaje
              multimodal sube respecto del régimen ideal (un solo medio
              de pago, un solo descuento por transbordo).
            </li>
          </ul>
        </div>
        <PendingBanner>
          <strong>Pregunta abierta para 2026-2027:</strong> ¿se contempla
          una segunda fase de BusPay (o un piloto separado) que incorpore
          taxis colectivos? La pregunta no aparece resuelta en la
          comunicación oficial del MTT al cierre del primer trimestre de
          2026. Cierre por consulta directa a SEREMITT Biobío y al
          gremio regional.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · adjudicación BusPay 28-ene-2026 (alcance: micros / buses urbanos)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 (alcance: micros)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura del visor">
        <p>
          El visor de <code>conce.patagua.dev</code> hoy{' '}
          <strong>NO muestra taxis colectivos</strong>. La razón es de
          datos, no de política editorial. El feed que alimenta la capa
          de buses urbanos es el{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>{' '}
          publicado por la Subsecretaría de Transportes para los buses
          del Perímetro de Exclusión 2024. Los taxis colectivos no están
          obligados a publicar GTFS y, en la práctica, no lo hacen.
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Por qué los colectivos no están en el feed GTFS
          </div>
          <ul className="ml-5 mt-1 list-disc space-y-0.5 text-[12px] text-muted-foreground">
            <li>
              <strong>Régimen legal distinto.</strong> Los buses del
              Perímetro están bajo contrato MTT con obligaciones de
              servicio y reporte; los colectivos están bajo inscripción
              RNSTP sin contrato equivalente.
            </li>
            <li>
              <strong>Operación fragmentada.</strong> Centenares de
              propietarios con uno o dos vehículos cada uno —
              consolidación de trayectos en tiempo real fuera del
              alcance del operador individual.
            </li>
            <li>
              <strong>Sin obligación regulatoria.</strong> La DTPR Biobío
              no exige a las líneas de colectivos publicar feed GTFS al
              cierre 2025-2026.
            </li>
            <li>
              <strong>Recorridos con desvíos puntuales.</strong> Un
              colectivo se desvía habitualmente para dejar a un pasajero
              en su casa — esa flexibilidad no encaja en el modelo
              determinista del GTFS estático.
            </li>
          </ul>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Una digitalización futura de las líneas de colectivo (catastro
          de recorridos, paraderos de cabecera, tarifas por línea) sería
          un aporte valioso al visor. Por ahora queda como{' '}
          <em>hueco editorial conocido</em>.
        </p>
      </Section>

      <Section title="Tendencias y desafíos">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Competencia con apps (Uber, Cabify, DiDi)
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Desde 2017-2018 las apps de transporte por aplicación
              (TAP) han presionado al sector. La Ley 21.431 (publicada
              en 2022) reguló a las EAT (empresas de aplicaciones de
              transporte) y obliga a registro pero no las equipara
              tarifariamente al colectivo. El impacto cuantitativo en
              demanda de colectivos en el Gran Concepción está
              pendiente de cita primaria.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Disputa por paraderos y saturación de Plaza Independencia
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Buses urbanos del Perímetro, taxis colectivos y servicios
              interurbanos cortos comparten el entorno de Plaza
              Independencia y calles centrales (O'Higgins, Aníbal Pinto,
              Barros Arana). La gestión de paraderos y tiempos de
              detención es una fricción urbana recurrente.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Mercado secundario de cupos
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Con el padrón cerrado desde 2011 (Ley 20.474), el "cupo"
              para operar en una línea es un activo escaso con valor de
              mercado secundario. La cifra exacta varía por línea y
              ciudad, pero a nivel nacional la prensa ha citado valores
              de varios millones de pesos por cupo. En el Gran
              Concepción el dato puntual 2026 está pendiente.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Envejecimiento del conductor y de la flota
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El sector reporta dificultad para atraer conductores
              jóvenes — la licencia profesional clase A2, las jornadas
              largas y la presión competitiva de las EAT reducen el
              atractivo. La edad promedio de la flota tiende a acercarse
              al tope reglamentario por falta de incentivo a renovar
              bajo padrón cerrado. Cifras puntuales para Biobío 2026
              pendientes.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Electrificación pendiente
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Mientras los buses urbanos avanzan a flota eléctrica
              (electrocorredores MOP, buses eléctricos del Perímetro
              2024), los colectivos siguen 100% combustión interna. No
              existe al cierre 2025-2026 un programa público de apoyo a
              la electrificación del segmento.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Cómo se identifica en la calle">
        <KeyValueList
          items={[
            [
              'Color reglamentario',
              <>
                <strong>Negro con techo amarillo</strong>, color nacional
                fijado por el DS 212/1992 para todos los taxis (básico,
                ejecutivo y colectivo). Algunas líneas suman franjas o
                logos del operador, pero el techo amarillo es la marca
                visual estable.
              </>,
            ],
            [
              'Letrero de techo',
              'Cartel iluminado o pintado con el número de la línea y los destinos cabecera ↔ cabecera. Es la principal pista del recorrido.',
            ],
            [
              'Número de línea en puerta',
              'Pintado en la puerta delantera del lado del conductor, junto al número de móvil interno asignado por la línea.',
            ],
            [
              'Patente',
              'Placa patente única chilena, sin distintivo especial respecto del taxi básico — la distinción es por letrero de techo y color, no por la patente.',
            ],
            [
              'Conductor',
              'Licencia profesional clase A2 (transporte público menor de pasajeros). Credencial visible obligatoria al interior del vehículo (DS 212/1992).',
            ],
            [
              'Cuadro tarifario',
              'Obligatorio al interior del vehículo, en lugar visible, indicando tarifa diurna y nocturna y tramos si aplica.',
            ],
          ]}
        />
      </Section>

      <Section title="Cronología">
        <Timeline
          items={[
            {
              date: '21-nov-1992',
              event: 'Publicación del DS 212/1992 del MTT — Reglamento de los Servicios Nacionales de Transporte Público de Pasajeros. Define la modalidad "taxi colectivo" como categoría regulada.',
              source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=11497', label: 'BCN · DS 212/1992' },
            },
            {
              date: '11-sep-2011',
              event: 'Publicación de la Ley 20.474 — suspende por 5 años la inscripción de nuevos taxis (básicos, ejecutivos y colectivos) en el RNSTP. Inicia el régimen de "padrón cerrado" del sector.',
              source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=1024893', label: 'BCN · Ley 20.474' },
            },
            {
              date: '2017-2018',
              event: 'Entrada en operación masiva de apps de transporte por aplicación (Uber, Cabify, DiDi) en el Gran Concepción. Presión competitiva sobre tarifa y demanda de colectivos.',
            },
            {
              date: '1-ene-2024',
              event: 'Entrada en vigencia del Perímetro de Exclusión del Gran Concepción 2024 — régimen específico para buses urbanos. Los taxis colectivos quedan fuera del nuevo régimen, mantienen su esquema de líneas RNSTP.',
              source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=1005871', label: 'BCN · Ley 18.696 art. 3°' },
            },
            {
              date: '28-ene-2026',
              event: 'MTT adjudica BusPay al Consorcio Buspay (operador técnico Busmatick). Alcance: 11 comunas, 4 regímenes regulatorios — todos en modo bus. Los taxis colectivos NO están incluidos en el alcance.',
              source: { href: 'https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/', label: 'Subtrans · 30-ene-2026' },
            },
            {
              date: 'Q3 2026',
              event: 'Marcha blanca BusPay en buses del Gran Concepción. Los colectivos siguen cobrando 100% en efectivo. Brecha de medio de pago entre los dos modos urbanos masivos.',
            },
          ]}
        />
        <PendingBanner>
          <strong>Hitos pendientes:</strong> fecha del último decreto que
          prorroga el padrón cerrado nacional, decretos del MTT que han
          reajustado tarifas autorizadas para líneas de colectivos
          específicas del Gran Concepción, paros gremiales notorios del
          sector taxi colectivo regional 2010-2026. Cierre por archivo
          de BCN Ley Chile y archivo de prensa BioBioChile / Diario
          Concepción.
        </PendingBanner>
      </Section>

      <Section title="Cómo contribuir">
        <p>
          Este artículo es el primero del wiki sobre taxis colectivos y
          tiene huecos importantes. Si tienes información primaria que
          pueda cerrar alguno de los pendientes, puedes aportar:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <strong>Catastro de líneas activas</strong>: número de línea,
            razón social, terminal cabecera, recorrido (origen ↔ destino),
            tarifa adulto y nocturna 2026.
          </li>
          <li>
            <strong>Fotografías</strong> de letreros de techo, cuadros
            tarifarios al interior de vehículos, paraderos oficiales en
            Plaza Independencia / Plaza Perú / Plaza Acevedo.
          </li>
          <li>
            <strong>Copia de resoluciones MTT/SEREMITT</strong> que
            autoricen tarifas o modifiquen recorridos de líneas
            específicas.
          </li>
          <li>
            <strong>Datos del padrón cerrado</strong>: valor de mercado
            secundario observado de un cupo por línea, número total de
            cupos autorizados por línea (si está disponible vía Ley de
            Transparencia).
          </li>
          <li>
            <strong>Estadísticas de demanda</strong>: encuestas
            origen-destino SECTRA o estudios académicos que cuantifiquen
            participación modal del colectivo en viajes urbanos del Gran
            Concepción.
          </li>
        </ul>
        <p>
          Abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/taxis-colectivos-gran-concepcion.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/taxis-colectivos-gran-concepcion.tsx
          </SourceLink>
          . Cada contribución se cita en el commit con autoría.
        </p>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">
              Biotrén y sus extensiones
            </a>{' '}
            — el otro modo urbano masivo del Gran Concepción, con la
            asimetría justo opuesta: tren regulado, agendado, digitalizado
            en el visor; colectivo regulado pero fragmentado y ausente
            del feed.
          </li>
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción 2024
            </a>{' '}
            — el régimen paralelo de los buses urbanos. Mismo artículo 3°
            de la Ley 18.696 que se podría usar (y no se ha usado) para
            crear un perímetro de exclusión específico de taxis
            colectivos.
          </li>
          <li>
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay · pago electrónico del Gran Concepción 2026
            </a>{' '}
            — el sistema de recaudo electrónico del que los colectivos
            quedan fuera. Lectura cruzada útil para entender qué cubre y
            qué no el régimen de pago.
          </li>
          <li>
            <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
              SEREMITT Biobío y la DTPR
            </a>{' '}
            — la autoridad regional que autoriza tarifas, recorridos y
            cupos de las líneas de colectivos vía resoluciones.
          </li>
          <li>
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>{' '}
            — explica qué cubre el feed que alimenta el visor (buses
            urbanos del Perímetro) y por qué los colectivos no están.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Cantidad total de taxis colectivos activos en el Gran Concepción 2025-2026 (cifra DTPR/RNSTP).</li>
          <li>Catastro íntegro de líneas autorizadas con número, razón social, recorrido, terminal y tarifa.</li>
          <li>Tarifa adulto diurna y nocturna vigente 2026 por línea.</li>
          <li>Antigüedad máxima reglamentaria aplicable a colectivos urbanos del Gran Concepción 2026.</li>
          <li>Fecha y número de la última prórroga legal del padrón cerrado nacional.</li>
          <li>Existencia y razón social de la federación regional gremial del Biobío (referencia "FERETAX" pendiente de cita primaria).</li>
          <li>Valor de mercado secundario observado del cupo por línea.</li>
          <li>Participación modal del colectivo en viajes urbanos del Gran Concepción (encuestas SECTRA o equivalentes).</li>
          <li>Existencia (o no) de un decreto regional Biobío que cree perímetro de exclusión específico para taxis colectivos.</li>
          <li>Política específica del MTT 2026-2027 sobre integración futura de los colectivos a BusPay.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: solicitud Ley de Transparencia a la DTPR
          Biobío (catastro RNSTP regional, resoluciones tarifarias),
          consulta directa a CONATACOCH y a la federación regional,
          archivo de prensa BioBioChile / Diario Concepción / TVU,
          encuestas origen-destino SECTRA del Gran Concepción.
        </p>
      </Section>

      <Sources>
        <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=11497">
          BCN Ley Chile · DS 212/1992 (Reglamento de los Servicios Nacionales de Transporte Público de Pasajeros)
        </SourceLink>
        <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29708">
          BCN Ley Chile · Ley 18.290 (Ley de Tránsito)
        </SourceLink>
        <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29994">
          BCN Ley Chile · Ley 18.696 (régimen de subsidio y atribuciones MTT)
        </SourceLink>
        <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1024893">
          BCN Ley Chile · Ley 20.474 (padrón nacional cerrado, 2011)
        </SourceLink>
        <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
          Subtrans · adjudicación BusPay 28-ene-2026 (alcance: buses urbanos)
        </SourceLink>
        <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
          BioBioChile · 28-ene-2026 (BusPay cubre micros, no colectivos)
        </SourceLink>
        <SourceLink href="https://es.wikipedia.org/wiki/Taxi_colectivo">
          Wikipedia · Taxi colectivo (cita cruzada con fuentes primarias)
        </SourceLink>
      </Sources>
    </div>
  );
}
