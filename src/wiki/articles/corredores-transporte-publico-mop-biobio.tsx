// Electrocorredores MOP del Biobío — tres proyectos concesionados de
// corredores exclusivos para buses urbanos sobre las troncales del Gran
// Concepción (Rutas 160, 150 y Autopista Concepción-Talcahuano Tramo
// II). Inversión global ~USD 250M, plazo 300 meses (25 años). Oferente
// único en los tres llamados: Electro-Cointer / Electro-Cointer II
// (Cointer Concesiones S.L., Grupo Azvi, España).

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function CorredoresTransportePublicoMOPBiobio() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado con fuentes primarias MOP Concesiones y
        prensa regional 2024-2026.</strong> Existencia y configuración
        de los tres proyectos (Rutas 160, 150 y Autopista
        Concepción-Talcahuano Tramo II), visa CGR 13-nov-2024,
        recepción de ofertas (5-nov-2025 y 10-dic-2025), oferente
        único (Electro-Cointer / Electro-Cointer II ligado al Grupo
        Azvi español vía Cointer Concesiones S.L.), montos en UF y
        USD, kilometrajes, plazo de concesión (300 meses / 25 años),
        cronograma proyectado (obras 2029-2030, puesta en servicio
        2031-2032) y autoridades citadas con nombre.{' '}
        <strong>Pendientes</strong>: composición societaria exacta
        de las SPV oferentes, política de electromovilidad del
        contrato (porcentaje flota eléctrica), modelo de compra de
        buses, integración tarifaria con BusPay y subsidio
        operacional MTT al operador.
      </VerifiedBanner>

      <p className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
        <strong>Nota sobre el nombre.</strong> El wiki adopta{' '}
        <strong>"Corredores de Transporte Público MOP"</strong> como
        nombre canónico, siguiendo el uso del MTT y MOP. El término{' '}
        "electrocorredor" se mantiene como clave de búsqueda porque es
        el nombre que usa la prensa y los expedientes MOP (los oferentes
        se llaman Electro-Cointer y Electro-Cointer II). El SEREMI
        Patricio Fierro aclaró en nov-2025 que no se exige flota 100%
        eléctrica.
      </p>

      <Section title="Qué son y por qué importan">
        <p>
          Los <strong>"electrocorredores"</strong> son tres proyectos
          de infraestructura concesionada por el <strong>MOP</strong>{' '}
          (Ley de Concesiones, DS MOP 900) que segregan, sobre las
          troncales más cargadas, una <strong>pista exclusiva
          bidireccional para buses</strong> en el eje central de la ruta,
          con paraderos sobre mediana, cruces peatonales, ciclovía y
          veredas. El SEREMI <strong>Patricio Fierro</strong> aclaró en
          nov-2025 que el contrato <strong>no exige flota 100%
          eléctrica</strong>.
        </p>
        <p>
          Son los <strong>primeros corredores segregados fuera de
          Santiago</strong>. Cartera global ~<strong>USD 250 millones</strong>{' '}
          y más de <strong>23 km</strong> de pista exclusiva, plazo{' '}
          <strong>300 meses (25 años)</strong> desde la puesta en
          servicio (
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
            Diario Concepción · 7-nov-2025
          </SourceLink>
          ).
        </p>
        <p>
          Cambian la jerarquía de la red: con pista exclusiva el bus
          pasa por arriba del cuello de botella. La pregunta abierta es
          si la demanda justifica el costo y si no desplaza políticamente
          las extensiones del{' '}
          <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
            Biotrén
          </a>
          {' '}que llevan años en cola en EFE-MIDESO.
        </p>
      </Section>

      <Section title="Los tres proyectos">
        <KeyValueList
          items={[
            [
              'Ruta 160',
              <>
                <strong>Corredor de Transporte Público Ruta 160</strong>{' '}
                · San Pedro de la Paz ↔ Coronel · 14 km bidireccionales
                · UF 4.414.000 (~USD 171 millones) · oferente único{' '}
                <strong>Consorcio Electro-Cointer</strong> el
                5-nov-2025 · apertura económica 3-dic-2025 ·
                adjudicación esperada 1T 2026 · plazo 25 años. Sector
                A: Daniel Belmar ↔ Av. Cuatro Sur (7,3 km, San Pedro
                de la Paz). Sector B: Av. Cuatro Sur ↔ acceso Parque
                Industrial Escuadrón I (6,9 km, Coronel).
              </>,
            ],
            [
              'Ruta 150',
              <>
                <strong>Corredor de Transporte Público Ruta 150</strong>{' '}
                (parte del paquete combinado con Autopista
                Concepción-Talcahuano Tramo II) · Rotonda Bonilla ↔
                Enlace Penco · 6,7 km · oferente único{' '}
                <strong>Consorcio Electro-Cointer II</strong> el
                10-dic-2025. Detalles operativos y trazado se
                desarrollan en el artículo{' '}
                <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
                  Concepción ↔ Tomé
                </a>
                . La municipalidad de Tomé ha pedido extender el
                corredor más allá del Enlace Penco; no está
                incorporado al contrato actual.
              </>,
            ],
            [
              'Autopista Concepción-Talcahuano Tramo II',
              <>
                <strong>Corredor de Transporte Público Autopista
                Concepción-Talcahuano Tramo II</strong> · 2,6 km de
                pista exclusiva sobre el eje El Trébol ↔ acceso
                Talcahuano · licitado en conjunto con Ruta 150 (UF
                4.431.000 total ≈ USD 172 millones por las dos obras).
                Incluye soterramiento parcial de pistas para vehículos
                privados a la altura del Mall El Trébol y rediseño de
                enlaces. Mismo oferente: <strong>Electro-Cointer II</strong>.
              </>,
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Los tres proyectos comparten oferente único de matriz española.
          Cointer Concesiones S.L. es filial del <strong>Grupo Azvi</strong>{' '}
          (Sevilla); en Chile integra (30%) el consorcio Red Norte de
          Aeropuertos junto a Sacyr.
        </p>
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/project/corredor-de-transporte-publico-ruta-160/">
            MOP Concesiones · ficha proyecto Ruta 160
          </SourceLink>
          <SourceLink href="https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/">
            MOP · 5-nov-2025 — Oferta Electro-Cointer Ruta 160
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025 — Ofertas Ruta 150 + Conce-Talcahuano II
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-conocio-la-oferta-economica-del-consorcio-electro-cointer-ii-para-desarrollar-el-proyecto-de-corredores-de-transporte-publico-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 15-ene-2026 — Apertura económica Electro-Cointer II
          </SourceLink>
          <SourceLink href="https://cointer.eu/quienes-somos/">
            Cointer Concesiones S.L. · Grupo Azvi (matriz)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Marco legal y financiamiento">
        <KeyValueList
          items={[
            [
              'Régimen',
              <>
                Ley de Concesiones de Obras Públicas (DS MOP 900 de
                1996, texto refundido) administrada por la{' '}
                <strong>Dirección General de Concesiones</strong> del
                MOP. Los tres llamados se publicaron en el Diario
                Oficial tras la <strong>visa de la Contraloría General
                de la República el 13-nov-2024</strong>.
              </>,
            ],
            [
              'Plazo de concesión',
              '300 meses (25 años) desde la puesta en servicio. Modelo BOT clásico: la concesionaria construye, mantiene y opera la infraestructura, no los buses.',
            ],
            [
              'Mecanismo de pago',
              'Peaje sombra (Ingreso Mínimo Garantizado) + subsidios fiscales. La concesionaria NO cobra al usuario final; cobra al Fisco según niveles de servicio y disponibilidad.',
            ],
            [
              'Aporte fiscal global comprometido',
              'Aproximadamente USD 250 millones de inversión total entre los tres proyectos (UF 4.414.000 Ruta 160 + UF 4.431.000 Ruta 150 + Conce-Talcahuano II).',
            ],
            [
              'Subsidio operacional al bus',
              <>
                Separado del contrato MOP. Los buses que circulen por
                el corredor reciben subsidio operacional MTT por la{' '}
                <strong>Ley 20.378 de 2009</strong> ("Subsidio
                Nacional al Transporte Público"). El monto exacto del
                subsidio para los corredores del Biobío no está
                publicado.
              </>,
            ],
            [
              'Operador del bus',
              'No está definido en el contrato MOP. La hipótesis técnica es que los buses los aporten los operadores del Perímetro de Exclusión del Gran Concepción (vigente desde 1-ene-2024) y, en Tomé, Transportes Tomé bajo su perímetro propio.',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
            Diario Concepción · 13-nov-2024 — Visa CGR a llamados de licitación
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-publicaron-en-el-diario-oficial-los-llamados-a-licitacion-de-dos-proyectos-de-corredores-de-transporte-publico-para-concepcion/">
            MOP Concesiones · publicación en Diario Oficial
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1006182">
            BCN · Ley 20.378 de Subsidio Nacional al Transporte Público
          </SourceLink>
        </Sources>
        <PendingBanner>
          <strong>Pendientes:</strong> niveles exactos de Ingreso
          Mínimo Garantizado y polinomio de reajuste del subsidio
          fiscal; mecanismo de coordinación contractual entre la
          concesionaria MOP de la infraestructura y los operadores
          MTT de los buses; monto del subsidio Ley 20.378 asignado al
          corredor. Vía de cierre: Ley de Transparencia a la
          Dirección General de Concesiones MOP por las bases
          definitivas de los tres llamados.
        </PendingBanner>
      </Section>

      <Section title="Material rodante y operación">
        <p>
          El contrato MOP <strong>no construye buses</strong>, solo la
          pista. Los buses y su recaudo viven en el régimen MTT: el{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro de Exclusión del Gran Concepción 2024
          </a>
          {' '}para Ruta 160 y Autopista Conce-Talcahuano II, y el{' '}
          Perímetro de Exclusión de Tomé (jul-2016, operativo mar-2022)
          para el extremo norte de la Ruta 150.
        </p>
        <KeyValueList
          items={[
            [
              'Política eléctrica del contrato',
              <>
                El SEREMI Patricio Fierro aclaró en noviembre de 2025
                que <strong>"electrocorredor" no equivale a flota 100%
                eléctrica</strong>. El diseño es compatible con buses
                eléctricos pero no excluye buses diésel/Euro VI o
                híbridos. La transición a flota eléctrica depende del
                ciclo de renovación de cada operador y de subsidios
                MTT específicos, no del contrato MOP.
              </>,
            ],
            [
              'Marcas candidatas (referenciales)',
              'BYD, Yutong y Foton dominan la oferta de buses eléctricos en Chile (Red Metropolitana de Movilidad / RED Santiago). En Concepción, los operadores del perímetro 2024 han recibido flota Euro V/VI nueva pero sin componente eléctrica masiva todavía.',
            ],
            [
              'Compra de los buses',
              'NO está cerrada. Hipótesis abiertas: (a) el actual operador del perímetro de exclusión renueva flota con apoyo Ley 20.378; (b) MTT abre una licitación de unidades de negocio específica para los corredores; (c) la concesionaria MOP los aporta como activo complementario. Las bases públicas no zanjan el modelo.',
            ],
            [
              'Frecuencia objetivo',
              'No publicada. Los proyectos similares en Santiago (Independencia, Vicuña Mackenna, Pajaritos) operan con frecuencias 1-3 min en hora punta sobre pista exclusiva.',
            ],
            [
              'Validación / pago',
              <>
                Vía{' '}
                <a href="/wiki/buspay" className="underline underline-offset-2">
                  BusPay
                </a>
                : los tres tramos cruzan el perímetro inicial del
                sistema (Gran Concepción + Tomé + Santa Juana). La
                integración tarifaria entre BusPay y el Biotrén
                (tarjeta Conecta) sigue pendiente — el wiki la rastrea
                en el artículo BusPay.
              </>,
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
            Diario Concepción · 7-nov-2025 — Cita de Patricio Fierro sobre flota
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1006182">
            BCN · Ley 20.378 (subsidio operacional)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tensión con el Biotrén">
        <p>
          Tensión política central del paquete. El{' '}
          <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
            Biotrén
          </a>
          {' '}tiene tres extensiones que cruzan territorialmente con
          los electrocorredores: <strong>Penco/Lirquén</strong> (Ruta
          150), <strong>Lota</strong> (Ruta 160) y <strong>Carriel Sur</strong>{' '}
          (Autopista Tramo II). Ninguna tiene RS MIDESO ni licitación
          abierta; las tres están "en estudio" en EFE Sur.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">Extensión Biotrén</th>
                <th className="px-3 py-2 font-medium">Electrocorredor MOP</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top text-[12px]">
              <tr>
                <td className="px-3 py-2 font-medium">Modo</td>
                <td className="px-3 py-2">Tren eléctrico sobre riel (3 kV DC)</td>
                <td className="px-3 py-2">Buses sobre pista exclusiva en carretera</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Capacidad teórica por composición / vehículo</td>
                <td className="px-3 py-2">Hasta cientos de pasajeros por composición</td>
                <td className="px-3 py-2">80-160 pax (bus articulado 18-26 m), capacidad agregada vía frecuencia</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Cobertura territorial</td>
                <td className="px-3 py-2">Punto a punto (estaciones); requiere alimentadores</td>
                <td className="px-3 py-2">Puede continuar fuera del corredor por la red vial normal</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Costo de capital referencial</td>
                <td className="px-3 py-2">No publicado (estudios EFE)</td>
                <td className="px-3 py-2">~USD 250M global, ~USD 11-12M por km</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Estado 2026</td>
                <td className="px-3 py-2">Estudios sin RS MIDESO</td>
                <td className="px-3 py-2">Ofertas únicas recibidas, adjudicación 1S 2026</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Horizonte</td>
                <td className="px-3 py-2">No comprometido</td>
                <td className="px-3 py-2">Obras 2029-2030, servicio 2031-2032</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Bus y tren no son sustitutos perfectos pero compiten por el
          mismo presupuesto regional. Si los electrocorredores absorben
          la demanda residencial Conce↔Penco y Conce↔Coronel, la
          demanda residual difícilmente justifica el riel. El alcalde
          de Penco <strong>Víctor Hugo Figueroa</strong> advirtió en
          nov-2022 que la Ruta 150 podía "frenar" la llegada del Biotrén.
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022 — Cita Figueroa
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tensión con BusPay y referente RED">
        <p>
          La línea oficial es que los buses de los electrocorredores
          aceptarán{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            BusPay
          </a>
          {' '}desde su marcha blanca (Q3 2026). Hay desfase de
          cronograma: BusPay entra en régimen 100% electrónico a fines
          de 2026; los electrocorredores en servicio en{' '}
          <strong>2031-2032</strong>. Cuando los corredores estén
          operativos, BusPay ya llevará 5 años con datos reales.
        </p>
        <p>
          La pregunta abierta es si los buses serán flota dedicada
          (tipo RED Santiago) o se mezclarán con el padrón del
          perímetro 2024. Las bases MOP no zanjan el punto.
        </p>
        <p>
          Los corredores RED de Santiago (Independencia, Vicuña
          Mackenna, Santa Rosa, Pajaritos) son referente. Aprendizajes
          clave: pista exclusiva en mediana funciona sobre 30.000
          pax/día; cruce peatonal seguro es la pieza más cara y
          primera sacrificada; capacidad agregada 8.000-12.000
          pax/hora-sentido (vs metro &gt;40.000); pre-pay reduce 40-60%
          el tiempo de detención (las bases MOP contemplan estaciones
          cerradas pero BusPay valida a bordo — decisión pendiente);
          integración multimodal con Biotrén Conecta sigue pendiente.
        </p>
      </Section>

      <Section title="Cronología">
        <Timeline
          items={[
            {
              date: '13-nov-2024',
              event: 'Contraloría General de la República visa los llamados a licitación MOP para los tres corredores (Ruta 160, Ruta 150 + Autopista Conce-Talcahuano Tramo II). Las bases entran al Diario Oficial.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: '5-nov-2025',
              event: 'MOP recibe las ofertas técnicas y económicas para el Corredor Ruta 160 (San Pedro de la Paz ↔ Coronel). Único oferente: Consorcio Electro-Cointer. UF 4.414.000, 14 km, plazo 25 años.',
              source: { href: 'https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/', label: 'MOP · 5-nov-2025' },
            },
            {
              date: '7-nov-2025',
              event: 'Cobertura regional con cita del SEREMI Patricio Fierro: aclara que "electrocorredor" no implica flota 100% eléctrica. Confirma inversión global ~USD 250M e inicio de obras proyectado 2027 (luego corrido a 2029-2030).',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html', label: 'Diario Concepción' },
            },
            {
              date: '3-dic-2025',
              event: 'Apertura de la oferta económica de Electro-Cointer para Ruta 160. El consorcio queda como único postulante a la adjudicación.',
              source: { href: 'https://www.elconquistadorconcepcion.cl/2025/12/04/concesiones-ratifica-unica-oferta-para-construir-14-kilometros-de-corredor-de-transporte-publico-en-la-ruta-160/', label: 'El Conquistador Concepción · 4-dic-2025' },
            },
            {
              date: '10-dic-2025',
              event: 'MOP recibe las ofertas técnicas y económicas para Ruta 150 + Autopista Concepción-Talcahuano Tramo II. Único oferente: Consorcio Electro-Cointer II (matriz Cointer Concesiones S.L. / Grupo Azvi). UF 4.431.000, 9,3 km, plazo 300 meses.',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones' },
            },
            {
              date: '15-ene-2026',
              event: 'Apertura de la oferta económica de Electro-Cointer II para Ruta 150 + Conce-Talcahuano II. Se mantiene la oferta única.',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-conocio-la-oferta-economica-del-consorcio-electro-cointer-ii-para-desarrollar-el-proyecto-de-corredores-de-transporte-publico-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones · 15-ene-2026' },
            },
            {
              date: '1S 2026',
              event: 'Adjudicación esperada de los tres corredores (las dos concesiones, ya que Ruta 150 y Autopista Tramo II son una sola). Decreto MOP de adjudicación y firma de contrato.',
            },
            {
              date: '2S 2029 — 1S 2030',
              event: 'Inicio de obras proyectado (puede correrse según evaluación ambiental SEIA y expropiaciones).',
            },
            {
              date: '2031-2032',
              event: 'Puesta en servicio proyectada de los tres corredores. El plazo de concesión de 300 meses (25 años) comienza a correr desde la puesta en servicio de cada obra.',
            },
          ]}
        />
      </Section>

      <Section title="Riesgos y críticas">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Oferta única en los tres llamados
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Electro-Cointer / Electro-Cointer II (Cointer / Grupo
              Azvi) fue el único postulante. USD 250M concentrados en
              una sola SPV; presión sobre el precio se pierde. Repite
              el patrón "oferente único" de Red Norte de Aeropuertos.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Sobrecostos típicos en concesiones MOP
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Sobrecosto histórico promedio 15-30% por modificaciones
              contractuales. Costo final podría acercarse a USD 300-325M.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Demanda inducida vs. real y gremio sin posición
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Estudios de demanda no son públicos. Los operadores del
              Perímetro 2024 no han fijado posición sobre qué proporción
              de flota usará los corredores ni si la entrada exige flota
              nueva. Sin claridad regulatoria, hay riesgo de bloqueo.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Desplazamiento político del Biotrén
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Si los electrocorredores consumen el techo presupuestario
              regional para la próxima década, las extensiones del
              Biotrén a Penco, Lota y Carriel Sur quedan postergadas.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Impacto regional">
        <KeyValueList
          items={[
            [
              'Empleo construcción',
              'Por orden de magnitud: 1.500-3.000 empleos directos durante obras (2029-2032), más indirectos en proveedores locales. Cifra no oficial.',
            ],
            [
              'Electromovilidad efectiva',
              <>
                Depende de decisiones MTT y operadora del Perímetro 2024,
                no del contrato MOP. Sin exigencia de electrificación, la
                transición puede tardar 10-15 años desde puesta en
                servicio. Fierro fue explícito en nov-2025; la postura no
                se modificó tras la sucesión Fierro → Cautivo (28-nov-2025).
              </>,
            ],
            [
              'Calidad del aire',
              'PM2.5 metropolitano excede norma anual; fuente principal es leña (~70% invierno), no transporte. La reducción por corredor electrificado es marginal sobre PM2.5 pero relevante en NOx y ruido.',
            ],
            [
              'Reducción CO₂',
              'Sin número MOP. Referencia: bus diésel Euro VI ~1,3 kg CO₂/km; eléctrico ~0,3 kg CO₂/km. Ahorro grueso ~30.000 tCO₂/año para los tres corredores combinados.',
            ],
            [
              'Plusvalía inmobiliaria',
              'Cuadras a 400 m de estación BRT suben 10-20% en 5 años (proyectos similares). Sectores: Av. Cuatro Sur (San Pedro), Coronel norte, Penco eje Ruta 150, Hualpén eje El Trébol.',
            ],
          ]}
        />
        <PendingBanner>
          <strong>Pendientes:</strong> SEIA de cada proyecto, empleos
          oficiales en construcción y métrica oficial de reducción de
          emisiones. RCA debe ingresarse antes del inicio de obras.
        </PendingBanner>
      </Section>

      <Section title="Estado del arte 2026">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Ruta 160</strong>: oferta económica abierta
            (3-dic-2025) · adjudicación esperada 1T 2026 · firma de
            contrato + decreto a publicar en Diario Oficial · entrada
            en RCA SEIA pendiente.
          </li>
          <li>
            <strong>Ruta 150 + Autopista Concepción-Talcahuano
            Tramo II</strong>: oferta económica abierta (15-ene-2026)
            · adjudicación esperada 1S 2026.
          </li>
          <li>
            <strong>Cuarta línea no anunciada</strong>: la Municipalidad
            de Tomé ha pedido extender la Ruta 150 más allá del Enlace
            Penco hasta Tomé urbano. No está en la cartera MOP actual
            (2025-2026). Vía política regular: el alcalde respectivo
            presiona vía Gobierno Regional / Subsecretaría de
            Transportes.
          </li>
          <li>
            <strong>Sin GTFS</strong>: ninguno de los electrocorredores
            tiene feed de transporte público hoy. La operación
            comienza en 2031-2032 como muy temprano; el visor sólo
            podrá representarlos cuando el operador entrante publique
            GTFS o cuando se digitalicen capas OSM con
            <code className="ml-1 font-mono">highway=busway</code>.
          </li>
        </ul>
      </Section>

      <Section title="Cobertura del visor">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Ningún electrocorredor está en el visor hoy
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Las pistas exclusivas todavía no existen físicamente (mayo
            2026). Las rutas que en el futuro circularán por estos
            corredores hoy se ven en el visor compartiendo pista con
            el tráfico normal: Ruta 160 (San Pedro ↔ Coronel) en el
            feed GTFS Gran Concepción; Ruta 150 con servicios 17M,
            30B/C/E, 31F, 57Y, 62H — ver{' '}
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>
            ; Autopista Tramo II con servicios hacia Hualpén y Talcahuano.
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Cuando entren en servicio (2031-2032) podrán dibujarse con
            capa segregada si el operador publica GTFS o se digitalizan
            en OSM (<code className="font-mono">highway=busway</code>).
          </p>
        </div>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>
            : la ficha del corredor norte ya documenta en detalle la
            Ruta 150 con datos verificados (trazado, tarifas, operador
            Transportes Tomé, perímetro de exclusión 2016/2022).
          </li>
          <li>
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
              Biotrén y sus extensiones
            </a>
            : la tensión modal con el electrocorredor Ruta 150 está
            desarrollada ahí en clave EFE. Penco/Lirquén, Lota y
            Carriel Sur son las tres extensiones tensionadas.
          </li>
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción 2024
            </a>
            : régimen MTT bajo el que opera la flota actual que
            heredará los corredores Ruta 160 y Conce-Talcahuano II.
          </li>
          <li>
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay 2026
            </a>
            : sistema de recaudo electrónico que entrará en régimen
            varios años antes que la puesta en servicio de los
            corredores. La integración tarifaria multimodal con
            Biotrén Conecta sigue pendiente.
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Recorridos interurbanos del Gran Concepción
            </a>
            : índice general de los corredores troncales.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Composición societaria de Electro-Cointer y Electro-Cointer II (socios chilenos, participación).</li>
          <li>Política de electromovilidad del contrato MOP (porcentaje mínimo, hito, quién paga capex).</li>
          <li>Modelo de compra de buses (operador PE 2024 + Ley 20.378, licitación MTT o concesionaria MOP).</li>
          <li>Ingreso Mínimo Garantizado y polinomio de ajuste fiscal.</li>
          <li>Integración tarifaria BusPay ↔ Biotrén Conecta.</li>
          <li>RCA SEIA de cada proyecto y estudio de demanda detallado.</li>
          <li>Cronograma definitivo post-adjudicación.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a DGC MOP y SEREMITT
          Biobío, mercadopublico.cl.
        </p>
      </Section>

      <Sources>
        <SourceLink href="https://concesiones.mop.gob.cl/project/corredor-de-transporte-publico-ruta-160/">
          MOP Concesiones · ficha proyecto Ruta 160
        </SourceLink>
        <SourceLink href="https://concesiones.mop.gob.cl/project/corredores-de-transporte-publico-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
          MOP Concesiones · ficha proyecto Ruta 150 + Conce-Talcahuano II
        </SourceLink>
        <SourceLink href="https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/">
          MOP · 5-nov-2025 — Oferta Electro-Cointer Ruta 160
        </SourceLink>
        <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
          MOP Concesiones · 10-dic-2025 — Ofertas Ruta 150 + Conce-Talcahuano II
        </SourceLink>
        <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-conocio-la-oferta-economica-del-consorcio-electro-cointer-ii-para-desarrollar-el-proyecto-de-corredores-de-transporte-publico-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
          MOP Concesiones · 15-ene-2026 — Apertura económica Electro-Cointer II
        </SourceLink>
        <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-publicaron-en-el-diario-oficial-los-llamados-a-licitacion-de-dos-proyectos-de-corredores-de-transporte-publico-para-concepcion/">
          MOP Concesiones · publicación llamados Diario Oficial
        </SourceLink>
        <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
          Diario Concepción · 13-nov-2024 — Visa CGR a llamados
        </SourceLink>
        <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
          Diario Concepción · 7-nov-2025 — Electrocorredores y cita Patricio Fierro
        </SourceLink>
        <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/12/03/avanza-concesion-de-corredor-de-transporte-publico-en-la-ruta-160-consorcio-cointer-presento-oferta.shtml">
          BioBioChile · 3-dic-2025 — Avance Ruta 160 con Cointer
        </SourceLink>
        <SourceLink href="https://www.elconquistadorconcepcion.cl/2025/12/04/concesiones-ratifica-unica-oferta-para-construir-14-kilometros-de-corredor-de-transporte-publico-en-la-ruta-160/">
          El Conquistador Concepción · 4-dic-2025 — Oferta única ratificada Ruta 160
        </SourceLink>
        <SourceLink href="https://www.radioudec.cl/avanza-el-corredor-de-transporte-publico-de-la-ruta-160-con-apertura-de-la-oferta-economica/">
          Radio UdeC · diciembre 2025 — Apertura económica Ruta 160
        </SourceLink>
        <SourceLink href="https://reportediario.cl/2025/11/06/cointer-la-empresa-espanola-que-busca-construir-el-corredor-de-transporte-publico-de-la-ruta-160-en-chile/">
          Reporte Diario · 6-nov-2025 — Perfil Cointer (matriz Grupo Azvi)
        </SourceLink>
        <SourceLink href="https://cointer.eu/quienes-somos/">
          Cointer Concesiones S.L. · sitio corporativo (matriz)
        </SourceLink>
        <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1006182">
          BCN · Ley 20.378 (Subsidio Nacional al Transporte Público)
        </SourceLink>
        <SourceLink href="https://www.openstreetmap.org/relation/9239557">
          OSM relation 9239557 · Ruta 160 (ref=160, decreto MOP 121/2009)
        </SourceLink>
        <SourceLink href="https://www.openstreetmap.org/relation/6599805">
          OSM relation 6599805 · Ruta 150 (ref=150, decreto MOP 179/2013)
        </SourceLink>
      </Sources>

      <Section title="Para contribuir">
        <p>
          Si tienes bases técnicas definitivas, composición societaria
          de Electro-Cointer o copia del decreto de adjudicación, abre
          un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/corredores-transporte-publico-mop-biobio.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/corredores-transporte-publico-mop-biobio.tsx
          </SourceLink>
          .
        </p>
      </Section>
    </div>
  );
}
