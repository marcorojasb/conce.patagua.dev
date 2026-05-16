// Biotrén · extensiones y proyectos futuros.
//
// Para el Biotrén actualmente operativo (servicio EFE Biobío L1
// Hualqui ↔ Mercado de Talcahuano + L2 Coronel ↔ Concepción, tarifas
// vigentes, estaciones, frecuencias) ver `biotren`. Esta ficha cubre
// las extensiones y proyectos en distintas etapas:
//
//  - Extensión norte a Penco (L1)
//  - Extensión norte a Tomé (continuación)
//  - Extensión sur a Lota (L2)
//  - Eventual ramal al Aeropuerto Carriel Sur
//
// Ninguna de estas extensiones tiene contrato firmado, RS vigente en
// MIDESO ni decreto MOP/MTT al cierre de 2025-2026. Toda esta ficha
// va bajo banner ámbar de "debate público, no obra adjudicada".

import {
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function BiotrenExtensionesProyectos() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con prensa regional y
        declaraciones públicas.</strong> Hitos del electrocorredor MOP
        Ruta 150 (CGR 13-nov-2024, oferta única 10-dic-2025) y
        declaraciones del alcalde de Penco (1-nov-2022) están citados.{' '}
        <strong>Pendientes</strong>: estado exacto del estudio de
        prefactibilidad EFE de la extensión a Penco, RS MIDESO de
        cualquiera de las extensiones, fechas de licitación o inicio de
        obras. Toda esta ficha es{' '}
        <em>debate público, no obra adjudicada</em> — ninguna extensión
        tiene contrato firmado al cierre 2025-2026.
      </VerifiedBanner>

      <div className="rounded-md border bg-card p-3 text-[13px]">
        <strong>Para el Biotrén actualmente operativo</strong>, ver{' '}
        <a href="/wiki/biotren" className="underline underline-offset-2">
          Biotrén
        </a>{' '}
        (servicio EFE Biobío, L1 Hualqui ↔ Mercado de Talcahuano + L2
        Coronel ↔ Concepción, tarifas vigentes Z1-Z10, frecuencias,
        estaciones). Esta ficha cubre las <strong>extensiones y
        proyectos</strong> en distintas etapas de estudio y debate.
      </div>

      <Section title="Qué cubre esta ficha">
        <p>
          El sistema Biotrén opera hoy con dos líneas. Las propuestas de
          extensión existen desde la década de 2010 y se reactivan
          periódicamente con cada ciclo político — pero ninguna ha
          alcanzado RS (recomendación social) vigente en MIDESO ni
          decreto MOP/MTT al cierre de 2025-2026. Las cuatro propuestas
          principales:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Extensión norte a Penco</strong> — continúa la L1
            desde Mercado de Talcahuano por el corredor costero hasta
            Penco aprovechando trazas férreas existentes. Es la
            extensión más debatida.
          </li>
          <li>
            <strong>Extensión norte a Tomé</strong> — segunda fase de la
            anterior, rehabilitando la traza histórica Penco-Tomé que
            tuvo riel hasta los 80.
          </li>
          <li>
            <strong>Extensión sur a Lota</strong> — continúa la L2 desde
            Coronel hasta Lota por la traza histórica del ramal del
            carbón.
          </li>
          <li>
            <strong>Ramal al Aeropuerto Carriel Sur</strong> — idea
            recurrente sin propuesta formal: cerrar la brecha de ~3 km
            entre la estación El Arenal (L1) y el aeropuerto.
          </li>
        </ul>
        <p>
          En paralelo, el MOP licitó en 2025 el{' '}
          <strong>electrocorredor de bus sobre la Ruta 150</strong>{' '}
          (UF 4,4 millones, ≈USD 172M), planteando la pregunta política
          del corredor norte: ¿tren extendido o BRT eléctrico? Esta
          ficha documenta esa tensión en detalle.
        </p>
      </Section>

      <Section title="Línea temporal del debate">
        <Timeline
          items={[
            {
              date: '~2010',
              event: 'Entran al debate público las extensiones a Penco y Tomé. La L2 a Lota es mencionada de modo recurrente sin estudios formales.',
            },
            {
              date: '1-nov-2022',
              event: 'El alcalde de Penco Víctor Hugo Figueroa advierte que el corredor MOP Ruta 150 puede frenar la llegada del Biotrén al bajar la demanda potencial del tren.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html', label: 'Diario Concepción' },
            },
            {
              date: '13-nov-2024',
              event: 'CGR visa licitaciones MOP de corredores de transporte público para Rutas 150 / 160 / Conce-Talcahuano. Empieza la disputa política tren-vs-bus eléctrico.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: 'nov-2025',
              event: 'Municipalidad de Tomé pide que el beneficio del proyecto MOP se extienda hasta Tomé, no sólo hasta el Enlace Penco. La petición es sobre el corredor de buses, no sobre el tren.',
              source: { href: 'http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html', label: 'Tomé al día' },
            },
            {
              date: '10-dic-2025',
              event: 'Oferta única (Electro-Cointer II) para concesión Ruta 150 + Conce-Talcahuano II (UF 4.431.000). La extensión Biotrén-Penco queda postergada otra vez.',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones' },
            },
          ]}
        />
      </Section>

      <Section title="Extensiones propuestas">
        <PendingBanner>
          <strong>Toda esta sección es debate público, no obra
          adjudicada.</strong> Ninguna de las extensiones que siguen
          tiene contrato firmado, RS vigente en MIDESO ni decreto MOP /
          MTT al cierre de 2025-2026. Las cifras son referenciales de
          prensa regional y declaraciones públicas, no de bases de
          licitación. Verificación a fondo requiere acceso a estudios
          de prefactibilidad de EFE Trenes (Ley de Transparencia).
        </PendingBanner>

        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">
            Extensión norte a Penco (Línea 1)
          </div>
          <p className="text-[12px] leading-snug">
            Es la extensión más debatida. La L1 termina hoy en{' '}
            <strong>Mercado de Talcahuano</strong>; la propuesta es
            extender por el corredor costero hasta Penco aprovechando
            trazas férreas existentes (algunas en desuso, otras
            compartidas con el ramal de carga al puerto de Lirquén). La
            comuna de Penco (47.367 hab. Censo 2017) hoy depende del bus
            urbano (líneas 17M, 30B/C/E, 31F, 57Y, 62H del{' '}
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              feed GTFS Gran Concepción
            </a>
            ) o de buses interurbanos de Transportes Tomé
            (servicios 401/411/421).
          </p>
          <p className="text-[12px] leading-snug">
            El alcalde de Penco <strong>Víctor Hugo Figueroa</strong>{' '}
            advirtió en noviembre 2022 que el corredor MOP Ruta 150
            puede <em>frenar</em> la llegada del Biotrén porque baja la
            demanda potencial del tren al mejorar el bus por carretera.
            EFE Trenes tiene un estudio de prefactibilidad en curso —
            estado y resultado al cierre 2025-2026 no han sido
            publicados.
          </p>
          <div className="text-[11px] text-muted-foreground">
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
              Diario Concepción · 1-nov-2022 — Ruta 150 puede frenar Biotrén-Penco
            </SourceLink>
          </div>
        </div>

        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">
            Extensión norte a Tomé (continuación de la anterior)
          </div>
          <p className="text-[12px] leading-snug">
            Una vez en Penco, una segunda fase llevaría el riel hasta
            Tomé (54.946 hab. Censo 2017) por la costa. Es la propuesta
            alternativa al electrocorredor Ruta 150: en vez de un BRT
            eléctrico sobre asfalto, recuperar la conexión ferroviaria
            histórica. El argumento técnico es que la traza Penco-Tomé
            tuvo riel hasta la década de 1980 (servicio textil hacia
            Bellavista Oveja Tomé) y rehabilitarla sería menos invasivo
            que ensanchar la carretera. Sin proyecto formal de EFE ni
            recomendación MIDESO.
          </p>
          <p className="text-[12px] leading-snug">
            La municipalidad de Tomé pidió en noviembre 2025 que el
            beneficio del proyecto MOP se extienda hasta Tomé, no sólo
            hasta el Enlace Penco — pero esa petición es sobre el
            corredor de buses, no sobre el tren. Para el detalle político
            ver{' '}
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>
            .
          </p>
          <div className="text-[11px] text-muted-foreground">
            <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
              Tomé al día · nov-2025 — Tomé pide extensión del beneficio
            </SourceLink>
          </div>
        </div>

        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">
            Extensión sur a Lota (Línea 2)
          </div>
          <p className="text-[12px] leading-snug">
            La L2 termina hoy en <strong>Coronel</strong> (urbano).
            Continuar 8-10 km al sur hasta Lota (~43.535 hab. Censo
            2017) por la traza histórica del ramal del carbón es una
            propuesta recurrente de autoridades locales — el ramal
            existió hasta el cierre de la minería del carbón (Schwager
            cerró 1994, Lota Verde 1997). No hay proyecto EFE formal en
            curso. La traza está parcialmente desarmada, parcialmente
            ocupada por usos urbanos. Para el detalle del corredor sur
            actual y la transición post-carbón ver{' '}
            <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">
              Concepción ↔ Coronel ↔ Lota
            </a>
            .
          </p>
        </div>

        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">
            Ramal al Aeropuerto Carriel Sur (especulativo)
          </div>
          <p className="text-[12px] leading-snug">
            Concepción es uno de los pocos aeropuertos chilenos
            relevantes <em>sin</em> conexión por tren. Carriel Sur
            (Talcahuano) está a ~3 km de la estación El Arenal de la L1.
            Un ramal corto cerraría esa brecha, pero <strong>no existe
            propuesta formal documentada</strong> al cierre 2025-2026.
            Es una idea recurrente de columnas de opinión y proyectos
            académicos, no de la planificación de EFE ni MOP.
          </p>
        </div>

        <PendingBanner>
          <strong>Datos por confirmar para cada extensión:</strong>{' '}
          inversión estimada (UF / USD), fecha de RS MIDESO, estado del
          estudio de prefactibilidad / ingeniería básica, ventana de
          ejecución proyectada. Cierre por solicitud de Ley de
          Transparencia a EFE Trenes Metropolitanos y a la SUBTRANS
          Biobío.
        </PendingBanner>
      </Section>

      <Section title="Tensión con el electrocorredor Ruta 150">
        <p>
          Esta es la disputa de política pública más fuerte del corredor
          norte y vale documentarla en su propio bloque. Los datos del{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            electrocorredor MOP
          </a>{' '}
          están desarrollados en su artículo propio y referenciados en{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          ; aquí los resumimos en clave Biotrén.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">Extensión Biotrén Penco</th>
                <th className="px-3 py-2 font-medium">Electrocorredor MOP Ruta 150</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top text-[12px]">
              <tr>
                <td className="px-3 py-2 font-medium">Modo</td>
                <td className="px-3 py-2">Tren eléctrico sobre riel (3 kV DC)</td>
                <td className="px-3 py-2">Buses (eléctricos y diésel) sobre pista exclusiva en carretera</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Inversión referencial</td>
                <td className="px-3 py-2">No publicada — estudio de prefactibilidad en EFE</td>
                <td className="px-3 py-2">UF 4.431.000 ≈ USD 172M (Ruta 150 + Conce-Talcahuano II)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Estado 2025-2026</td>
                <td className="px-3 py-2">Estudio EFE, sin RS MIDESO ni licitación abierta</td>
                <td className="px-3 py-2">Oferta única recibida 10-dic-2025 · apertura económica 15-ene-2026 · adjudicación 1S 2026 esperada</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Capacidad estructural</td>
                <td className="px-3 py-2">Cientos de pax por composición; orden de magnitud sobre el bus</td>
                <td className="px-3 py-2">Buses 18-26 m articulados; capacidad agregada vía frecuencia</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Cobertura territorial</td>
                <td className="px-3 py-2">Punto a punto (estaciones); cobertura de "última milla" insuficiente sin alimentadores</td>
                <td className="px-3 py-2">Buses pueden seguir hasta Lirquén / Tomé / Dichato; mejor cobertura</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Horizonte de puesta en servicio</td>
                <td className="px-3 py-2">No comprometido</td>
                <td className="px-3 py-2">2032 proyectado (obras 2S 2029 — 1S 2030)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Veto político</td>
                <td className="px-3 py-2">Alcalde Penco (2022): el corredor puede "frenar" la llegada del tren</td>
                <td className="px-3 py-2">Municipalidad Tomé (2025) pide extender el beneficio hasta Tomé</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La lectura editorial: el electrocorredor <em>desplaza
          políticamente</em> a la extensión Biotrén — no son
          incompatibles técnicamente, pero el presupuesto público no
          alcanza para ambos y la priorización MOP es por carretera. Si
          el electrocorredor se ejecuta y absorbe la demanda, la
          demanda residual no justifica el riel a Penco. Si la
          extensión a Penco hubiera entrado antes en la cola de
          inversión MIDESO, el orden podría haberse invertido.
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022 — Ruta 150 vs Biotrén
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025 — Ofertas Ruta 150
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
            Diario Concepción · 7-nov-2025 — Electrocorredores
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura del visor">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            ❌ Las extensiones NO están en el visor
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Las extensiones propuestas (Penco, Tomé, Lota, Carriel Sur)
            son <em>proyectos</em> sin trazado oficial digitalizable —
            sin RS MIDESO, sin bases licitadas, sin ingeniería básica
            pública, no hay un GeoJSON que el visor pueda renderizar de
            forma honesta. Lo único que el visor muestra hoy son las
            <strong> dos líneas operativas</strong> (L1, L2). Ver{' '}
            <a href="/wiki/biotren" className="underline underline-offset-2">
              Biotrén
            </a>{' '}
            para la cobertura del servicio vigente.
          </p>
        </div>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/biotren" className="underline underline-offset-2">
              Biotrén
            </a>{' '}
            — el <em>servicio operacional vigente</em>: L1, L2,
            estaciones, tarifas Z1-Z10 vigentes desde 2-ene-2026,
            frecuencias, material rodante. Ficha hermana de ésta,
            dedicada al <em>presente</em>.
          </li>
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>{' '}
            — el corredor norte completo, con la cobertura más detallada
            del electrocorredor MOP y del transbordo bus-tren en
            Lirquén / Penco.
          </li>
          <li>
            <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
              Corredores de Transporte Público MOP del Biobío
            </a>{' '}
            — los tres electrocorredores MOP que compiten políticamente
            con las extensiones Biotrén (Ruta 150 ↔ Penco, Ruta 160 ↔
            Lota, Autopista Conce-Talcahuano ↔ Carriel Sur).
          </li>
          <li>
            <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">
              Concepción ↔ Coronel ↔ Lota
            </a>{' '}
            — corredor sur post-carbón donde la extensión Biotrén a Lota
            se discute periódicamente.
          </li>
          <li>
            <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
              Perímetro de Exclusión de Tomé
            </a>{' '}
            — el régimen de operador único Transportes Tomé que hoy
            cubre el eje Concepción ↔ Penco ↔ Tomé sin tren.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Estado y resultado del estudio de prefactibilidad EFE para extensión a Penco.</li>
          <li>Inversión estimada y RS MIDESO de cada extensión (Penco, Tomé, Lota, Carriel Sur).</li>
          <li>Fechas tentativas de licitación o inicio de obras.</li>
          <li>Posición oficial actualizada del MTT y del MOP sobre la priorización tren-vs-bus.</li>
          <li>Documentos de planificación urbana regional (PROT Biobío, PRMC) que recojan o no las extensiones.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a EFE Trenes
          Metropolitanos S.A., SUBTRANS Biobío y MIDESO. Consulta a
          municipalidades de Penco, Tomé y Lota por convenios o cartas
          formales de gestión.
        </p>
      </Section>

      <Section title="Bibliografía">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
              Diario Concepción · 1-nov-2022 — Ruta 150 puede frenar Biotrén a Penco
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
              Diario Concepción · 13-nov-2024 — CGR visa licitaciones electrocorredores
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
              MOP Concesiones · 10-dic-2025 — Ofertas Ruta 150 + Conce-Talcahuano II
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
              Diario Concepción · 7-nov-2025 — Electrocorredores Gran Concepción
            </SourceLink>
          </li>
          <li>
            <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
              Tomé al día · nov-2025 — Petición de extensión del beneficio
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
              Wikipedia · Biotrén (historia y propuestas de extensión)
            </SourceLink>
          </li>
        </ul>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si conoces el estado del estudio de prefactibilidad de la
          extensión Biotrén-Penco, tienes copia de bases técnicas o
          ingeniería básica de cualquiera de las extensiones, o sabes
          de algún hito reciente de MIDESO / EFE Sur sobre las
          extensiones — abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/biotren-extensiones-proyectos.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/biotren-extensiones-proyectos.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
