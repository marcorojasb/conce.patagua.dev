// Taxis colectivos del Gran Concepción — modo urbano masivo
// invisibilizado. Marco: DS 212/1992 MTT (define modalidad), Ley
// 18.290 (Tránsito), Ley 18.696 (atribuciones MTT), Ley 20.474 (cierre
// padrón nacional, 2011). Color reglamentario: negro con techo
// amarillo. Quedan fuera de BusPay 2026 (solo buses urbanos) y fuera
// del GTFS Gran Concepción.

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
        legal (DS 212/1992, Ley 18.290, Ley 18.696, Ley 20.474), color
        reglamentario (negro con techo amarillo) y alcance BusPay 2026
        (buses urbanos + Ruta 201, sin colectivos) están citados.{' '}
        <strong>Pendientes</strong>: cantidad total operando, catastro
        íntegro de líneas con razones sociales, tarifa 2026 por línea,
        federación gremial regional, participación modal. Números gruesos
        llevan banner ámbar inline (orden de magnitud, no dato auditado).
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
          Importan en el Gran Concepción por cuatro razones:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Mueven proporción significativa del viaje urbano.</strong>{' '}
            Compiten en volumen con buses urbanos en ejes cortos (Conce↔Talcahuano,
            Conce↔Chiguayante, barrio universitario). Cifra exacta de
            participación modal pendiente.
          </li>
          <li>
            <strong>Llenan el hueco entre taxi puro y bus.</strong> Frecuencia
            más alta ("sale cuando se llena"), asiento garantizado y tarifa
            muy por debajo del taxi básico.
          </li>
          <li>
            <strong>Padrón nacional cerrado desde 2011.</strong>{' '}
            <strong>Ley 20.474</strong> congeló inscripciones; prórrogas
            sucesivas mantienen el cierre. Cupos fijos con mercado secundario
            apreciable
            (
            <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1024893">
              BCN · Ley 20.474
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Quedan fuera de BusPay 2026.</strong> Adjudicado al{' '}
            <strong>Consorcio Buspay</strong> (operador técnico{' '}
            <strong>Busmatick</strong>) en ene-2026, cubre buses urbanos
            de PE GC, PE Tomé, Coronel-Lota y Ruta 201 — no menciona
            colectivos
            (
            <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
              Subtrans · 30-ene-2026
            </SourceLink>
            ). Los colectivos seguirán cobrando en efectivo.
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
          completa requiere acceso al catastro RNSTP regional vía Ley de
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
                <a href="/wiki/biotren" className="underline underline-offset-2">
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
          Organización en <strong>sindicatos o asociaciones de
          propietarios por línea</strong> (cooperativa o SpA), agrupados
          en una federación regional. Cada propietario corre uno o dos
          vehículos.
        </p>
        <PendingBanner>
          <strong>Federación regional pendiente.</strong> La referencia
          nacional es <strong>CONATACOCH</strong>. La federación regional
          del Biobío (a veces citada como "FERETAX") está pendiente de
          cita primaria.
        </PendingBanner>
        <p className="text-[12px] text-muted-foreground">
          Diferencia estructural con el bus urbano: los operadores del{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro 2024
          </a>{' '}
          son 33-35 empresas con flotas de 30-150 buses y contrato MTT.
          Los operadores de colectivo son centenares de propietarios sin
          contrato, sin métricas ni GTFS.
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
          <strong>Busmatick</strong>) en ene-2026 abarca 11 comunas y 4
          regímenes — <strong>todos en modo bus</strong>:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>PE Gran Concepción</strong> (7 comunas): 36 unidades de negocio.</li>
          <li><strong>PE Tomé</strong>: 401/411/421 de Transportes Tomé SpA.</li>
          <li><strong>Regulación especial Coronel-Lota</strong>: Res. Ex. 457 MTT, 2012-2013.</li>
          <li><strong>Licitación rural ELC0007 Santa Juana</strong>: líneas 201 y 201 AU.</li>
        </ul>
        <p>
          <strong>En ninguno se mencionan los taxis colectivos.</strong>{' '}
          El sistema fue diseñado con validadores embarcados en buses; el
          precedente Bipay Temuco-Padre Las Casas también se limita a
          buses
          (
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026
          </SourceLink>
          ).
        </p>
        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">Implicancias para el usuario</div>
          <ul className="ml-5 list-disc space-y-1 text-[12px]">
            <li>En régimen permanente BusPay (fines 2026), el usuario pagará con tarjeta en bus pero <strong>seguirá pagando en efectivo en el colectivo</strong>. Viaje multimodal con dos sistemas de pago.</li>
            <li>Sin BusPay no hay trazabilidad ni datos de demanda para colectivos.</li>
            <li>Sin tarifa integrada, el costo combinado del viaje multimodal sube.</li>
          </ul>
        </div>
        <PendingBanner>
          <strong>Pregunta abierta 2026-2027:</strong> ¿segunda fase de
          BusPay que incorpore colectivos? Sin respuesta oficial al
          1T-2026.
        </PendingBanner>
      </Section>

      <Section title="Cobertura del visor">
        <p>
          El visor <strong>NO muestra taxis colectivos</strong>. El feed
          que alimenta la capa de buses es el{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>{' '}
          publicado por Subtrans para el PE 2024. Los colectivos no están
          obligados a publicar GTFS y no lo hacen, por: régimen legal
          distinto (inscripción RNSTP sin contrato equivalente), operación
          fragmentada (centenares de propietarios), sin obligación
          regulatoria y recorridos con desvíos puntuales que no encajan
          en GTFS estático.
        </p>
      </Section>

      <Section title="Tendencias y desafíos">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Competencia con apps y disputa por paraderos
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Desde 2017-2018 las EAT (Uber, Cabify, DiDi) presionan al
              sector; Ley 21.431 (2022) las regula pero no las equipara
              tarifariamente. Impacto cuantitativo pendiente. Buses,
              colectivos e interurbanos cortos compiten por Plaza
              Independencia y calles centrales (O'Higgins, Aníbal Pinto,
              Barros Arana).
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Mercado secundario de cupos y envejecimiento
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Con padrón cerrado desde 2011, el cupo es activo escaso
              (prensa nacional cita varios millones de pesos por cupo;
              dato Biobío 2026 pendiente). El sector reporta dificultad
              para atraer conductores jóvenes y la flota tiende al tope
              reglamentario por falta de incentivo a renovar.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Electrificación pendiente
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Mientras los buses avanzan a flota eléctrica
              (electrocorredores MOP, PE 2024), los colectivos siguen
              100% combustión interna. Sin programa público de
              electrificación al cierre 2025-2026.
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
          Si puedes aportar catastro de líneas activas (número, razón
          social, terminal, recorrido, tarifa 2026), fotografías de
          letreros y cuadros tarifarios, copia de resoluciones tarifarias
          de SEREMITT, datos del mercado de cupos o estadísticas de
          demanda SECTRA, abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/taxis-colectivos-gran-concepcion.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/taxis-colectivos-gran-concepcion.tsx
          </SourceLink>
          .
        </p>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
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
          <li>Cantidad total de colectivos activos 2025-2026 (cifra DTPR/RNSTP).</li>
          <li>Catastro íntegro de líneas (número, razón social, recorrido, terminal, tarifa).</li>
          <li>Tarifa diurna/nocturna 2026 por línea.</li>
          <li>Antigüedad máxima reglamentaria aplicable en 2026.</li>
          <li>Última prórroga legal del padrón cerrado nacional.</li>
          <li>Razón social de federación regional Biobío ("FERETAX" pendiente).</li>
          <li>Valor de mercado secundario del cupo por línea.</li>
          <li>Participación modal del colectivo (encuestas SECTRA).</li>
          <li>Existencia de perímetro de exclusión específico para colectivos.</li>
          <li>Política MTT 2026-2027 sobre integración futura a BusPay.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a DTPR Biobío, consulta a
          CONATACOCH, archivo de prensa regional, encuestas SECTRA.
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
