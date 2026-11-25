// Sobre este wiki: propósito, límites, cómo se edita y manual de estilo.

import {
  ArticleSummary,
  CollapsibleSection,
  FactStrip,
  KeyValueList,
  Section,
} from './_components';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function SobreEsteWiki() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <FactStrip
        items={[
          { label: 'Naturaleza', value: 'Comunitaria, no oficial' },
          { label: 'Licencia', value: 'CC BY 4.0 (contenido)' },
          { label: 'Editar', value: 'Pull request en GitHub' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            El visor técnico de <code className="font-mono">conce.patagua.dev</code>{' '}
            solo muestra datos con origen abierto y citable.
          </>,
          <>
            Este wiki compila lo que no vive en ningún feed: itinerarios,
            tarifas, decisiones municipales y planes en consulta.
          </>,
          <>No es oficial ni reemplaza el horario impreso o la fuente directa.</>,
          <>Cada afirmación lleva fuente. Lo que no la tiene se marca como pendiente.</>,
        ]}
      />

      <Section title="Propósito">
        <p>
          El visor es un producto técnico que consume fuentes verificables:
          el{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS estático
          </a>{' '}
          de la DTPR, itinerarios de EFE, OpenStreetMap, INE y SINCA. Si un dato
          no puede citarse a un origen abierto, no entra al visor.
        </p>
        <p>
          La excepción declarada son las llegadas en vivo a un paradero. Vienen
          de una fuente no oficial (la de la app de Transapp) y el visor las
          rotula así.
        </p>
      </Section>

      <Section title="Qué este wiki no es">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>No es oficial.</strong> No representa a la DTPR, a la
            Subsecretaría de Transportes, a operadores ni a municipios.
          </li>
          <li>
            <strong>No reemplaza el horario impreso.</strong> Para decidir un
            viaje en tiempo real, consulta la fuente directa.
          </li>
          <li>
            <strong>No publica rumores.</strong> Sin fuente, el dato queda como
            «pendiente de verificación».
          </li>
        </ul>
      </Section>

      <Section title="Cómo funciona">
        <p>
          Cada artículo es un componente React en{' '}
          <code className="font-mono">src/wiki/articles/</code>. Para editarlo,
          usa el enlace «Editar en GitHub» de arriba y abre un pull request.
          La revisión es liviana: dos pares de ojos y un commit con autor claro.
        </p>
        <p>
          Todas las fichas siguen una plantilla en capas, definida en{' '}
          <code className="font-mono">_components.tsx</code> y ejemplificada en{' '}
          <a href="/wiki/biotren" className="underline underline-offset-2">
            Biotrén
          </a>
          :
        </p>
        <ol className="ml-5 list-decimal space-y-1">
          <li>
            Banners de estado: <code className="font-mono">VerifiedBanner</code>,{' '}
            <code className="font-mono">PendingBanner</code> o{' '}
            <code className="font-mono">IssueNotice</code>.
          </li>
          <li>
            <code className="font-mono">FactStrip</code>: hechos vigentes, con
            fecha del último cotejo.
          </li>
          <li>
            <code className="font-mono">ArticleSummary</code>: 4 a 6 frases de
            lo que hay que saber hoy.
          </li>
          <li>
            <code className="font-mono">NewsPulse</code>: 0 a 3 novedades
            recientes, cada una con fuente.
          </li>
          <li>Secciones operativas, con <code className="font-mono">Section</code>.</li>
          <li>
            <code className="font-mono">CollapsibleSection</code> para historia,
            pendientes y bibliografía.
          </li>
        </ol>
      </Section>

      <Section title="Manual de estilo">
        <p>
          Reglas mínimas para que las fichas se lean como salidas de una misma
          redacción.
        </p>
        <KeyValueList
          items={[
            [
              'Voz',
              'Español chileno neutro, informativo y sin jerga interna. Los hechos llevan fuente. Las hipótesis se marcan como tales («la hipótesis editorial es que…»).',
            ],
            [
              'Dinero',
              <>
                Signo <strong>$</strong> con separador de miles chileno: <strong>$1.500</strong>.
                Para UF: <strong>UF&nbsp;4.431.000</strong>. Conversión a USD entre paréntesis
                solo si ayuda a leer.
              </>,
            ],
            [
              'Banners',
              <>
                <code className="font-mono">PendingBanner</code> si un dato no está
                verificado contra fuente primaria. Se quita con un cambio que cite la
                fuente. <code className="font-mono">VerifiedBanner</code> si una fuente
                primaria (resolución, ordenanza, GTFS oficial, RNTPP) lo confirma. Cita
                la fuente en el texto; la fecha del cotejo va en el{' '}
                <code className="font-mono">FactStrip</code>.
              </>,
            ],
            [
              'Fuentes',
              <>
                Cada hecho factual no trivial cuelga de un{' '}
                <code className="font-mono">SourceLink</code>. Si una URL deja de
                responder, márcala con un comentario{' '}
                <code className="font-mono">{`{/* ROTO: fecha */}`}</code> y mantén el enlace
                mientras no haya un snapshot equivalente.
              </>,
            ],
            [
              'Grafía',
              <>
                «<strong>SpA</strong>» (no «S.P.A.»); «<strong>EFE Biobío</strong>» (no
                «Biotrén EFE»); «Concepción ↔ Tomé» para corredores.
              </>,
            ],
            [
              'Tablas y cronologías',
              <>
                <code className="font-mono">DataTable</code> para tablas,{' '}
                <code className="font-mono">KeyValueList</code> para fichas de dos
                columnas y <code className="font-mono">Timeline</code> para cronologías.
                Sin markdown crudo ni HTML sin clases del sistema.
              </>,
            ],
            [
              'Enlaces',
              <>
                Entre fichas: <code className="font-mono">{`<a href="/wiki/slug">`}</code>{' '}
                con clase <code className="font-mono">underline underline-offset-2</code>.
                Al mapa: <code className="font-mono">MapLink</code> de{' '}
                <code className="font-mono">@/wiki/map-link</code>.
              </>,
            ],
            [
              'Largo',
              'Lo visible debe leerse en ~60 s: FactStrip, resumen y 2 a 4 secciones. La historia, los pendientes y la bibliografía van en CollapsibleSection. Si el cuerpo visible supera ~900 líneas, parte la ficha en dos.',
            ],
            [
              'Radar X',
              'X es radar de actualidad, no fuente primaria (ver docs/wiki-research-queries.md y docs/research/). Un post entra al cuerpo solo con URL primaria o prensa nombrada al lado.',
            ],
            [
              'Histórico vs vigente',
              'Las citas de prensa con fecha se conservan como testimonio. Solo los datos «actuales» o «vigentes» (tarifas, autoridades, calendario en curso) se mantienen al día.',
            ],
          ]}
        />
      </Section>

      <CollapsibleSection title="Visión de mediano plazo">
        <p>
          Queremos que este wiki sea el <strong>centro de verdad regional</strong>{' '}
          sobre transporte público y planificación urbana del Gran Concepción y,
          luego, del Biobío. Enlazado con el visor (cada capa apunta a su ficha),
          con Wikidata (QID de entidades) y con OpenStreetMap (tags{' '}
          <code className="font-mono">route=</code> y{' '}
          <code className="font-mono">operator=</code> verificados).
        </p>
        <p>
          No compite con Wikipedia. Busca ser una base operacional de un dominio
          que Wikipedia no cubre con la profundidad ni la frescura necesarias.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Glosario de siglas">
        <p>
          Siglas que aparecen en las fichas. Si una ficha introduce una sigla
          recurrente nueva, agrégala aquí.
        </p>
        <KeyValueList
          items={[
            ['AFT', <><strong>Administrador Financiero del Transantiago</strong>. Modelo de recaudo que contrasta con el esquema de <a href="/wiki/buspay" className="underline underline-offset-2">BusPay</a>.</>],
            ['BCN', <><strong>Biblioteca del Congreso Nacional</strong> (bcn.cl). Fuente primaria para textos legales.</>],
            ['BusPay', <><strong>Sistema de recaudo electrónico</strong> licitado por el MTT para el Gran Concepción. Adjudicado el 28-ene-2026 al Consorcio Buspay, con Busmatick como operador técnico. Ver <a href="/wiki/buspay" className="underline underline-offset-2">BusPay</a>.</>],
            ['CGR', <><strong>Contraloría General de la República</strong>. Tomó razón de las bases de los electrocorredores MOP (13-nov-2024) y de la Res. Afecta 29/2023 que crea el PE Gran Concepción.</>],
            ['CTR', <><strong>Código de los subsidios rurales</strong> de la DTPR (p. ej. CTR0224, Decreto Exento 5863/2025). La sigla no está desarrollada en las fuentes citadas. Ver <a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">Concepción ↔ Yumbel</a>.</>],
            ['DTPM', <><strong>Directorio de Transporte Público Metropolitano</strong> (dtpm.cl). Coordina la Red Movilidad de Santiago. Contraste institucional en <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">SEREMITT Biobío y la DTPR</a>.</>],
            ['DTPR', <><strong>División de Transporte Público Regional</strong>, de la Subsecretaría de Transportes. Publica el GTFS oficial del Gran Concepción en dtpr.gob.cl. El sitio regional es dprbiobio.dpr.gob.cl.</>],
            ['EFE', <><strong>Empresa de los Ferrocarriles del Estado</strong> (efe.cl). Opera el Biotrén a través de EFE Trenes Metropolitanos. Ver <a href="/wiki/biotren" className="underline underline-offset-2">Biotrén</a>.</>],
            ['GTFS', <><strong>General Transit Feed Specification</strong> (gtfs.org). Formato estándar de horarios y trazados de transporte público. Ver <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS Gran Concepción</a>.</>],
            ['GTFS-RT', <><strong>GTFS Realtime</strong>: posiciones, predicciones y alertas en tiempo real. El wiki no registra un GTFS-RT oficial para el Gran Concepción (pendiente de verificar).</>],
            ['INE', <><strong>Instituto Nacional de Estadísticas</strong>. Fuente censal (Censo 2017) citada en varias fichas.</>],
            ['JUNAEB', <><strong>Junta Nacional de Auxilio Escolar y Becas</strong>. Administra la Tarjeta Nacional Estudiantil (TNE).</>],
            ['MOP', <><strong>Ministerio de Obras Públicas</strong>. Concesiona autopistas y corredores (Rutas 150 y 160, Autopista Concepción-Talcahuano). Ver <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">Electrocorredores MOP del Biobío</a>.</>],
            ['MTT', <><strong>Ministerio de Transportes y Telecomunicaciones</strong> (mtt.gob.cl). Firma decretos y resoluciones, y aprueba los programas de operación de los perímetros de exclusión.</>],
            ['OSM', <><strong>OpenStreetMap</strong> (openstreetmap.org). Base de estaciones, vía del Biotrén, terminales y otras capas del visor. Ver <a href="/wiki/openstreetmap-fuente-visor" className="underline underline-offset-2">OpenStreetMap como fuente</a>.</>],
            ['PE', <><strong>Perímetro de Exclusión</strong>. Art. 3° Ley 18.696: área donde el transporte público mayor lo prestan operadores adheridos al MTT. Fichas: PE Gran Concepción 2024, PE Tomé, PE Coronel-Lota (Res. Ex. 457).</>],
            ['Res. Ex.', <><strong>Resolución Exenta</strong>. Acto administrativo que no requiere toma de razón de Contraloría.</>],
            ['RNTPP', <><strong>Registro Nacional de Servicios de Transporte Público de Pasajeros</strong>. Inscripción obligatoria para operar.</>],
            ['RUT', <><strong>Rol Único Tributario</strong>, identificador fiscal (SII).</>],
            ['SEIA', <><strong>Sistema de Evaluación de Impacto Ambiental</strong> (sea.gob.cl). Tramita las DIA y EIA de los proyectos MOP citados.</>],
            ['SENAMA', <><strong>Servicio Nacional del Adulto Mayor</strong>. Coordina la tarifa rebajada de adultos mayores en BusPay.</>],
            ['SEREMI', <><strong>Secretaría Regional Ministerial</strong>, cargo político regional. En el wiki, el de Transportes y Telecomunicaciones Biobío.</>],
            ['SEREMITT', <><strong>Secretaría Regional Ministerial de Transportes y Telecomunicaciones</strong>. Titular desde el 28-nov-2025 según las fichas (Hugo Cautivo). Ver <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">SEREMITT Biobío y la DTPR</a>.</>],
            ['SII', <><strong>Servicio de Impuestos Internos</strong> (sii.cl). Fuente para cotejar razón social y RUT.</>],
            ['SINCA', <><strong>Sistema de Información Nacional de Calidad del Aire</strong> (sinca.mma.gob.cl). Fuente de la calidad del aire que muestra el visor.</>],
            ['SPV', <><strong>Special Purpose Vehicle</strong>: sociedad de propósito especial. Forma del Consorcio Buspay.</>],
            ['Subtrans', <><strong>Subsecretaría de Transportes</strong> (subtrans.gob.cl). Cabeza institucional de la DTPR. Publica las resoluciones de adjudicación.</>],
            ['TNE', <><strong>Tarjeta Nacional Estudiantil</strong>, administrada por JUNAEB. Da derecho a pasaje estudiantil rebajado.</>],
            ['UF', <><strong>Unidad de Fomento</strong>, reajustable por IPC. Las ofertas de los electrocorredores MOP se expresan en UF.</>],
            ['UN', <><strong>Unidad de Negocio</strong>: subdivisión de un perímetro de exclusión. El PE Gran Concepción 2024 tiene 36 UN; el PE Tomé, una (operador único).</>],
          ]}
        />
      </CollapsibleSection>

      <Section title="Licencia">
        <p>
          Contenido del wiki bajo <strong>CC&nbsp;BY&nbsp;4.0</strong>. Código del
          visor y del wiki bajo la licencia abierta del repositorio:{' '}
          <a
            href="https://github.com/marcorojasb/conce.patagua.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            github.com/marcorojasb/conce.patagua.dev
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
