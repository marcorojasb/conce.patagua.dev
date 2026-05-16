// Sobre este wiki — propósito, alcance, modelo editorial y la visión
// de mediano plazo (centro de verdad regional).

import { KeyValueList, Section } from './_components';

export default function SobreEsteWiki() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <Section title="Propósito">
        <p>
          El visor principal de <code className="font-mono">conce.patagua.dev</code> es
          un producto técnico que consume fuentes <strong>verificables</strong>
          {' '}— <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS estático</a>,
          OpenStreetMap, INE, SINCA. Si un dato no puede
          citarse a un origen abierto, no entra al visor.
        </p>
        <p>
          Pero hay una cantidad enorme de información operativa que <em>no</em>
          {' '}vive en ningún feed: itinerarios de servicios interurbanos
          licitados que aún no tienen GTFS público, frecuencias observadas en
          paradero, tarifas vigentes, decisiones del concejo municipal sobre
          ciclovías, planes reguladores en consulta. Este wiki es donde esa
          información se compila, cita y mantiene — sin contaminar el visor
          técnico.
        </p>
      </Section>

      <Section title="Qué este wiki no es">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>No es oficial.</strong> No representa al DTPR, a la
            Subsecretaría de Transportes, a operadores ni a municipios. Es
            comunitario.
          </li>
          <li>
            <strong>No reemplaza el horario impreso.</strong> Para decisiones
            de viaje en tiempo real, consulta la fuente directa.
          </li>
          <li>
            <strong>No publica rumores.</strong> Cada afirmación debe citar
            una fuente; las afirmaciones sin fuente se marcan explícitamente
            como "pendiente de verificación".
          </li>
        </ul>
      </Section>

      <Section title="Cómo funciona">
        <p>
          Los artículos viven como componentes React en{' '}
          <code className="font-mono">src/wiki/articles/</code> del repositorio.
          Editar es abrir un pull request en GitHub — cada artículo tiene un
          link "Editar en GitHub" arriba que apunta al archivo correcto.
        </p>
        <p>
          La revisión es liviana: dos pares de ojos, un commit con autor
          claro. Si el cambio introduce una afirmación factual, debe venir
          con su fuente al lado.
        </p>
      </Section>

      <Section title="Visión de mediano plazo">
        <p>
          A futuro queremos que este wiki sea el{' '}
          <strong>centro de verdad regional</strong> sobre transporte público
          y planificación urbana del Gran Concepción y, por extensión, del
          Biobío. Conectado a:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>El visor (capas que enlazan a su artículo cuando existe).</li>
          <li>Wikidata (entidades con QID, datos estructurados).</li>
          <li>OpenStreetMap (tags route= / operator= verificadas).</li>
          <li>Notebooks de análisis (cuando aparezcan).</li>
        </ul>
        <p>
          La idea no es competir con Wikipedia — es servir como{' '}
          <strong>knowledge base operacional</strong> de un dominio que
          Wikipedia no cubre con la profundidad ni la frescura necesaria.
        </p>
      </Section>

      <Section title="Glosario de siglas">
        <p>
          Siglas y abreviaciones que aparecen recurrentemente en los
          artículos del wiki. Solo se listan las que efectivamente
          figuran en las fichas; cuando corresponde, se enlaza al
          artículo donde la sigla se usa más.
        </p>
        <KeyValueList
          items={[
            [
              'AFT',
              <>
                <strong>Administrador Financiero del Transantiago</strong>.
                Entidad que históricamente administró el recaudo y la
                liquidación de la tarjeta bip! en Santiago. Modelo
                citado en el artículo{' '}
                <a href="/wiki/buspay-2026" className="underline underline-offset-2">
                  BusPay 2026
                </a>{' '}
                como contraste con el esquema operacional adoptado en
                el Gran Concepción.
              </>,
            ],
            [
              'BCN',
              <>
                <strong>Biblioteca del Congreso Nacional de Chile</strong>{' '}
                (bcn.cl). Fuente primaria para textos legales (Ley
                Chile) y para reportes comunales utilizados en las
                fichas.
              </>,
            ],
            [
              'BusPay',
              <>
                Sistema de recaudo electrónico licitado por el MTT para
                el Gran Concepción 2026. Adjudicatario: Consorcio
                Buspay. Operador técnico: Busmatick. Ver{' '}
                <a href="/wiki/buspay-2026" className="underline underline-offset-2">
                  artículo BusPay
                </a>
                .
              </>,
            ],
            [
              'CGR',
              <>
                <strong>Contraloría General de la República</strong>.
                Tomó razón de las bases de los electrocorredores MOP el
                13-nov-2024 y de la Res. Afecta 29/2023 que crea el PE
                Gran Concepción.
              </>,
            ],
            [
              'DPR',
              <>
                <strong>División de Transporte Público Regional</strong>{' '}
                (dpr.gob.cl). En el wiki aparece más como{' '}
                <em>DTPR</em>; ver entrada DTPR.
              </>,
            ],
            [
              'DTPM',
              <>
                <strong>Directorio de Transporte Público
                Metropolitano</strong> (dtpm.cl). Coordinador del Red
                Movilidad de Santiago. Aparece como contraste
                institucional con la DTPR Biobío en el artículo{' '}
                <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
                  SEREMITT Biobío y la DTPR
                </a>
                .
              </>,
            ],
            [
              'DTPR',
              <>
                <strong>División de Transporte Público Regional</strong>{' '}
                (antes DPRTM). Brazo técnico de la Subsecretaría de
                Transportes para regiones. El sitio regional Biobío es
                dprbiobio.dpr.gob.cl.
              </>,
            ],
            [
              'EFE',
              <>
                <strong>Empresa de los Ferrocarriles del Estado</strong>{' '}
                (efe.cl). EFE Sur opera el Biotrén a través de su
                filial EFE Trenes Metropolitanos S.A. Ver{' '}
                <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">
                  Biotrén y sus extensiones
                </a>
                .
              </>,
            ],
            [
              'GTFS',
              <>
                <strong>General Transit Feed Specification</strong>{' '}
                (gtfs.org). Formato estándar para describir
                horarios y geometrías de transporte público. Ver{' '}
                <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
                  GTFS Gran Concepción
                </a>
                .
              </>,
            ],
            [
              'GTFS-RT',
              <>
                <strong>GTFS Realtime</strong>. Extensión del GTFS para
                posiciones de vehículos, predicciones y alertas en
                tiempo real. No publicado para el Gran Concepción al
                cierre 2026.
              </>,
            ],
            [
              'INE',
              <>
                <strong>Instituto Nacional de Estadísticas</strong>.
                Fuente censal (Censo 2017) citada en varias fichas.
              </>,
            ],
            [
              'JUNAEB',
              <>
                <strong>Junta Nacional de Auxilio Escolar y
                Becas</strong>. Administra la Tarjeta Nacional
                Estudiantil (TNE). Coordinará la integración TNE con
                BusPay.
              </>,
            ],
            [
              'MOP',
              <>
                <strong>Ministerio de Obras Públicas</strong>. Concesiona
                las autopistas y los corredores MOP (Rutas 150, 160 y
                Autopista Concepción-Talcahuano). Ver{' '}
                <a href="/wiki/electrocorredores-mop-biobio" className="underline underline-offset-2">
                  Electrocorredores MOP del Biobío
                </a>
                .
              </>,
            ],
            [
              'MTT',
              <>
                <strong>Ministerio de Transportes y
                Telecomunicaciones</strong> (mtt.gob.cl). Autoridad
                política. Firma decretos, resoluciones exentas y
                aprueba programas de operación de los perímetros de
                exclusión.
              </>,
            ],
            [
              'OSM',
              <>
                <strong>OpenStreetMap</strong> (openstreetmap.org). Base
                cartográfica con la que se digitalizan estaciones,
                terminales y trazados que el visor muestra.
              </>,
            ],
            [
              'PE',
              <>
                <strong>Perímetro de Exclusión</strong>. Régimen
                regulatorio del art. 3° Ley 18.696 que delimita un área
                donde los servicios de transporte público mayor solo
                pueden ser prestados por operadores adheridos al MTT.
                Fichas: PE Gran Concepción 2024, PE Tomé, PE
                Coronel-Lota (Res. Ex. 457).
              </>,
            ],
            [
              'Res. Ex.',
              <>
                <strong>Resolución Exenta</strong>. Acto administrativo
                de un órgano del Estado que no requiere toma de razón
                de Contraloría. La Res. Ex. 1006/2017 del MTT abrió el
                proceso del PE Gran Concepción; la Res. Ex. 457
                regula Coronel-Lota.
              </>,
            ],
            [
              'RNTPP',
              <>
                <strong>Registro Nacional de Servicios de Transporte
                Público de Pasajeros</strong> (rntpp.mtt.gob.cl).
                Inscripción obligatoria para operar servicios de
                transporte público.
              </>,
            ],
            [
              'RUT',
              <>
                <strong>Rol Único Tributario</strong>. Identificador
                fiscal en Chile (SII). Pendiente para varias razones
                sociales operadoras citadas en el wiki.
              </>,
            ],
            [
              'SEIA',
              <>
                <strong>Sistema de Evaluación de Impacto Ambiental</strong>{' '}
                (sea.gob.cl). Tramita las DIA / EIA de los proyectos
                MOP citados en las fichas.
              </>,
            ],
            [
              'SENAMA',
              <>
                <strong>Servicio Nacional del Adulto Mayor</strong>.
                Coordina la tarifa rebajada de adultos mayores en
                BusPay.
              </>,
            ],
            [
              'SEREMI',
              <>
                <strong>Secretaría Regional Ministerial</strong>. Cargo
                político del gobierno central en regiones. En el wiki
                aparece principalmente el SEREMI de Transportes y
                Telecomunicaciones Biobío.
              </>,
            ],
            [
              'SEREMITT',
              <>
                <strong>Secretaría Regional Ministerial de Transportes
                y Telecomunicaciones</strong>. Ver{' '}
                <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
                  SEREMITT Biobío y la DTPR
                </a>
                . Cargo actual: Patricio Fierro (desde 10-ene-2025).
              </>,
            ],
            [
              'SII',
              <>
                <strong>Servicio de Impuestos Internos</strong>{' '}
                (sii.cl). Fuente para cotejar razón social y RUT de
                operadores.
              </>,
            ],
            [
              'SINCA',
              <>
                <strong>Sistema de Información Nacional de Calidad del
                Aire</strong> (sinca.mma.gob.cl). Citado como fuente
                verificable en el modelo editorial del wiki.
              </>,
            ],
            [
              'SPV',
              <>
                <strong>Special Purpose Vehicle</strong> (vehículo
                societario de propósito especial). Forma jurídica del
                Consorcio Buspay, constituido específicamente para
                operar el contrato BusPay.
              </>,
            ],
            [
              'Subtrans',
              <>
                <strong>Subsecretaría de Transportes</strong>{' '}
                (subtrans.gob.cl). Cabeza institucional de la DTPR.
                Publica las resoluciones de adjudicación.
              </>,
            ],
            [
              'TNE',
              <>
                <strong>Tarjeta Nacional Estudiantil</strong>.
                Administrada por JUNAEB. Da derecho al pasaje
                estudiantil rebajado (~33% del adulto en buses urbanos,
                67% en Biotrén).
              </>,
            ],
            [
              'UF',
              <>
                <strong>Unidad de Fomento</strong>. Unidad de cuenta
                reajustable por IPC. Las ofertas económicas de los
                electrocorredores MOP se expresan en UF (p. ej. UF
                4.431.000 = ~CLP 175.000 millones nominales 2025).
              </>,
            ],
            [
              'UN',
              <>
                <strong>Unidad de Negocio</strong>. Subdivisión
                operativa de un perímetro de exclusión. El PE Gran
                Concepción 2024 tiene 36 UN; el PE Tomé tiene 1
                (operador único).
              </>,
            ],
          ]}
        />
      </Section>

      <Section title="Licencia">
        <p>
          Contenido del wiki bajo <strong>CC&nbsp;BY&nbsp;4.0</strong>. Código
          del visor y del wiki bajo licencia abierta del repo.{' '}
          <a
            href="https://github.com/marcorojasb/conce.patagua.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            github.com/marcorojasb/conce.patagua.dev
          </a>
        </p>
      </Section>
    </div>
  );
}
