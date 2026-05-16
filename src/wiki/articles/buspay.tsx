// BusPay · pago electrónico del Gran Concepción 2026.
//
// Sistema de recaudo electrónico adjudicado al Consorcio Buspay
// (operador técnico: Busmatick) por el MTT el 28-ene-2026 — visado
// por Contraloría en marzo 2026 y con marcha blanca proyectada para
// el tercer trimestre 2026. Es el complemento natural del régimen
// del Perímetro de Exclusión 2024 y la pieza que pone fin (al menos
// nominalmente) al pago en efectivo en los buses urbanos del Gran
// Concepción.
//
// El artículo del Perímetro 2024 ya verificó:
//   - adjudicación 28-ene-2026 al Consorcio Buspay
//   - 6 ofertas en sep-2025
//   - ~$750 millones/año
//   - 1.800 validadores · 11 comunas
//   - marcha blanca Q3 2026
//   - tarifa $580 sin alteración
//   - diseño tarjeta Campanil UdeC vía consulta ciudadana
//
// Lo que profundiza este artículo (con fuente nueva citada inline):
//   - Operador técnico Busmatick · director Hollman Suárez (Radio UdeC
//     27-feb-2026)
//   - Fecha alternativa de visa Contraloría 30-ene-2026 (Subtrans)
//   - Sonda (Smart Cities Marco Ossandón) compitió y NO ganó (DC
//     29-nov-2024)
//   - 500 puntos de recarga · 5 Centros de Atención al Usuario
//     (Concepción, San Pedro, Talcahuano, Tomé, Lota)
//   - 29.000 tarjetas gratis iniciales · 14.500 estudiantes + 14.500
//     AM (Sala de Prensa) — el Mostrador menciona el precio ~$1.550
//   - Cronograma instalación abril-mayo 2026, marcha blanca Q3,
//     régimen 100% electrónico fines 2026 (DF · Sala de Prensa)
//   - Antecedente fallido: piloto Biobús 2016 con >50.000 tarjetas
//     repartidas que nunca operó (BioBioChile 19-feb-2026, Tiempo
//     Real UdeC mar-2026, Diario Concepción 29-nov-2024)
//   - Antecedente parcial: tarjeta Biotrén 2005-2022 → Conecta 2023
//     (Wikipedia · transporte público Gran Concepción)
//   - Comparación operativa: Bipay Temuco-Padre Las Casas (sep-2025,
//     4M validaciones/mes, 1,6% evasión)
//   - Consulta ciudadana diseño tarjeta: 23-dic-2025 → 12-ene-2026,
//     ganó Campanil UdeC (Radio UdeC + Subtrans)
//
// Lo que NO está verificado y va en PendingBanner:
//   - Razón social, RUT y composición societaria del Consorcio Buspay
//   - Identidad de las 6 oferentes que perdieron en sep-2025 (más
//     allá de Sonda mencionada en prensa)
//   - Plazo del contrato (años) y monto total agregado
//   - Forma exacta de liquidación a operadores y plazos de pago
//   - Modelo tarifario detallado: ¿descuento por usar BusPay vs
//     efectivo? ¿integración Biotrén Conecta ↔ BusPay?
//   - Comportamiento del sistema en caso de validador caído

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function BusPay() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias y prensa
        regional 2024-2026.</strong> Adjudicación (28-ene-2026), operador
        técnico Busmatick, visa Contraloría, 1.800 validadores, 11
        comunas, ~$750 millones/año, 5 CAU, ~500 puntos de recarga,
        marcha blanca Q3 2026, diseño Campanil UdeC y antecedente del
        piloto Biobús 2016 fallido están citados.{' '}
        <strong>Pendientes</strong>: razón social y composición societaria
        del Consorcio Buspay, identidad completa de las 6 oferentes
        derrotadas, plazo y monto total del contrato, esquema de
        liquidación a operadores, integración tarifaria con la tarjeta
        Conecta del Biotrén, y conducta del sistema en caso de validador
        caído. Toda cifra dura está citada inline; lo no verificable
        está marcado con banner ámbar abajo.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          <strong>BusPay</strong> es el sistema de pago electrónico para
          el transporte público del Gran Concepción, adjudicado el{' '}
          <strong>28 de enero de 2026</strong> por el MTT al{' '}
          <strong>Consorcio Buspay</strong> (operador técnico:{' '}
          <strong>Busmatick</strong>). Es la pieza que cierra el
          compromiso central del{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro de Exclusión del Gran Concepción 2024
          </a>
          : reemplazar el pago en efectivo y el "corte de boleto" por un
          recaudo digital, trazable y auditable
          (
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026
          </SourceLink>
          ).
        </p>
        <p>
          Importa por tres razones de fondo:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Cierra una deuda histórica de casi 20 años.</strong>{' '}
            Santiago tiene Bip! desde 2007. Concepción intentó un piloto
            ("Biobús") en 2016 que entregó más de{' '}
            <strong>50.000 tarjetas</strong> sin que el sistema llegara a
            operar en buses
            (
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/29/pago-con-tarjeta-en-buses-empresa-que-opera-en-transantiago-espera-participar-en-licitacion-en-la-zona.html">
              Diario Concepción · 29-nov-2024
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Integra regímenes regulatorios distintos en un solo
            medio de pago.</strong> Cubre el PE Gran Concepción (7
            comunas), el PE Tomé (1 comuna), la regulación especial
            Coronel-Lota (2 comunas, Resolución Exenta 457/2012-2013 del
            MTT — no es un Perímetro de Exclusión formal aún; el decreto
            PE estaba en bases de licitación en Contraloría a jul-2025)
            y la licitación 201 Santa Juana — Santa Juana es{' '}
            <em>el primer servicio rural de Chile</em> con pago
            electrónico
            (
            <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
              Subtrans · 30-ene-2026
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Materializa el compromiso seguridad-trabajo.</strong>{' '}
            Eliminar efectivo reduce robos a buses en zonas de alta
            vulnerabilidad (Candelaria, Boca Sur) y termina con el
            modelo de pago directo al chofer ("corte de boleto"),
            empujando a relaciones laborales formales
            (
            <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
              Diario Financiero · 2026
            </SourceLink>
            ).
          </li>
        </ul>
        <p>
          La tarifa adulto del Perímetro <strong>no se altera</strong>:
          sigue siendo <strong>$580</strong> (vigente desde 23-feb-2025).
          El sistema lo paga el Estado, no el pasajero
          (
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026
          </SourceLink>
          ).
        </p>
      </Section>

      <Section title="Historia: por qué Concepción no tuvo pago electrónico antes">
        <p>
          Concepción es la segunda área metropolitana de Chile y, hasta
          2026, la única gran ciudad del país <em>sin</em> pago
          electrónico en sus buses urbanos. El Biotrén sí lo tenía
          (tarjeta Biotrén desde 2005, hoy <strong>Conecta</strong>{' '}
          desde 2023) — los buses no
          (
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · transporte público Gran Concepción
          </SourceLink>
          ). Hubo dos antecedentes relevantes:
        </p>
        <Timeline
          items={[
            {
              date: '2005',
              event: (
                <>
                  <strong>Tarjeta Biotrén.</strong> Empieza a operar
                  como medio de pago del tren urbano (Línea 1
                  Concepción-Talcahuano y, después, Línea 2 hacia
                  Coronel). Es la primera tarjeta sin contacto de
                  transporte público del Gran Concepción.
                </>
              ),
              source: {
                href: 'https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n',
                label: 'Wikipedia',
              },
            },
            {
              date: '2016',
              event: (
                <>
                  <strong>Piloto Biobús — fallido.</strong> El MTT
                  anuncia que el sistema de pago electrónico empezaría
                  ese año en el transporte mayor del Gran Concepción.
                  Se reparten <strong>más de 50.000 tarjetas</strong>{' '}
                  bajo la marca "Biobús". La iniciativa no llegó a
                  operar en buses urbanos: el sistema regulatorio de la
                  licitación 2002 no obligaba a los operadores a
                  instalar validadores y los acuerdos voluntarios no
                  prosperaron.
                </>
              ),
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/29/pago-con-tarjeta-en-buses-empresa-que-opera-en-transantiago-espera-participar-en-licitacion-en-la-zona.html',
                label: 'Diario Concepción · 29-nov-2024',
              },
            },
            {
              date: '2005-2019',
              event: (
                <>
                  Mientras existió, la tarjeta Biotrén podía usarse en
                  la línea de buses <em>Biobús</em> (servicio de
                  alimentación al tren), permitiendo integración
                  tarifaria parcial. La integración Biotrén ↔ Biobús se
                  desactivó en 2019.
                </>
              ),
              source: {
                href: 'https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n',
                label: 'Wikipedia',
              },
            },
            {
              date: '2023',
              event: (
                <>
                  La tarjeta Biotrén es reemplazada por la tarjeta{' '}
                  <strong>Conecta</strong>, que mantiene la operación
                  en el tren. Hasta hoy es "el primer y único medio de
                  transporte público del Gran Concepción en ocupar el
                  sistema de pago electrónico".
                </>
              ),
              source: {
                href: 'https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n',
                label: 'Wikipedia',
              },
            },
            {
              date: '1-ene-2024',
              event: (
                <>
                  Entra en vigor el <strong>Perímetro de Exclusión del
                  Gran Concepción</strong> (régimen Ley 18.696 art. 3°),
                  que sí incluye obligación contractual de pago
                  electrónico. La fecha proyectada original era 2025.
                </>
              ),
              source: {
                href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/',
                label: 'DPR Biobío · 3-ene-2024',
              },
            },
            {
              date: 'Feb-2024',
              event: (
                <>
                  El gobierno anuncia formalmente la <em>licitación</em>{' '}
                  para la implementación del pago electrónico en los
                  buses del Perímetro durante 2025.
                </>
              ),
              source: {
                href: 'https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n',
                label: 'Wikipedia',
              },
            },
            {
              date: '29-nov-2024',
              event: (
                <>
                  <strong>Sonda manifiesta interés.</strong> Marco
                  Ossandón, gerente comercial Smart Cities & Mobility
                  Chile de Sonda, declara a Diario Concepción que la
                  compañía (operadora histórica de Transantiago)
                  espera participar en la licitación. El subsecretario
                  Jorge Daza confirma diciembre 2025 como meta de
                  implementación.
                </>
              ),
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/29/pago-con-tarjeta-en-buses-empresa-que-opera-en-transantiago-espera-participar-en-licitacion-en-la-zona.html',
                label: 'Diario Concepción · 29-nov-2024',
              },
            },
            {
              date: '23-sep-2025',
              event: (
                <>
                  Cierre de la licitación: el MTT recibe{' '}
                  <strong>6 ofertas</strong> para operar el sistema en
                  11 comunas. Una Comisión Evaluadora de la DTPR
                  certifica la presentación correcta de documentos.
                </>
              ),
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html',
                label: 'Diario Concepción · 23-sep-2025',
              },
            },
            {
              date: '23-dic-2025 → 12-ene-2026',
              event: (
                <>
                  <strong>Consulta ciudadana de diseño de tarjeta.</strong>{' '}
                  Tres opciones a votar: puente ferroviario del Biobío,
                  Coliseo Monumental La Tortuga (Talcahuano) y
                  Campanil de la UdeC. Voto vía formulario en redes
                  @mttbiobio.
                </>
              ),
              source: {
                href: 'https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/',
                label: 'Subtrans · 23-dic-2025',
              },
            },
            {
              date: '28-ene-2026',
              event: (
                <>
                  <strong>Adjudicación al Consorcio Buspay.</strong>{' '}
                  Inversión estatal ~$750 millones/año. 1.800 validadores
                  en flota de 11 comunas. Tarifa $580 inalterada.
                </>
              ),
              source: {
                href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml',
                label: 'BioBioChile · 28-ene-2026',
              },
            },
            {
              date: '30-ene-2026',
              event: (
                <>
                  Comunicado oficial del MTT/Subtrans confirma la
                  adjudicación y la <strong>visa de Contraloría</strong>{' '}
                  al contrato. Resultado del concurso ciudadano:{' '}
                  <strong>Campanil UdeC</strong>.
                </>
              ),
              source: {
                href: 'https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/',
                label: 'Subtrans · 30-ene-2026',
              },
            },
            {
              date: '27-feb-2026',
              event: (
                <>
                  Primera reunión técnica entre el operador y los
                  taxibuses. Asisten el subsecretario Jorge Daza, el
                  seremi (s) Hugo Cautivo y representantes de{' '}
                  <strong>Busmatick</strong> liderados por su director{' '}
                  <strong>Hollman Suárez</strong>. Tema: cronograma de
                  instalación de validadores en la flota de ~2.000
                  buses.
                </>
              ),
              source: {
                href: 'https://www.radioudec.cl/empresa-a-cargo-del-pago-electronico-se-reune-con-operadores-del-transporte-publico-del-gran-concepcion/',
                label: 'Radio UdeC · 27-feb-2026',
              },
            },
            {
              date: 'Abr-may 2026 (proyectado)',
              event: (
                <>
                  Instalación de validadores a bordo de los buses.
                </>
              ),
              source: {
                href: 'https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira',
                label: 'Diario Financiero',
              },
            },
            {
              date: 'Q3 2026 (proyectado)',
              event: (
                <>
                  <strong>Marcha blanca.</strong> Efectivo y BusPay
                  coexisten durante un período de aproximadamente tres
                  meses para facilitar la adaptación de usuarios.
                </>
              ),
              source: {
                href: 'https://revistanos.cl/pago-electronico-llegara-al-transporte-publico-del-gran-concepcion-el-tercer-trimestre-de-2026/',
                label: 'Revista Nos',
              },
            },
            {
              date: 'Fin de 2026 (proyectado)',
              event: (
                <>
                  Régimen <strong>100% electrónico</strong>. Jorge Daza
                  (subsecretario): "esperamos que a fines de 2026
                  podamos eliminar definitivamente el efectivo de las
                  máquinas". La fecha original (Q2 2026) se postergó.
                </>
              ),
              source: {
                href: 'https://www.saladeprensa.cl/alcanzara-a-estar-listo-en-2026-pago-electronico-en-el-gran-concepcion-sufre-nuevo-atraso/',
                label: 'Sala de Prensa',
              },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          La tarjeta Bip! de Santiago <strong>nunca</strong> tuvo
          interoperabilidad con el Gran Concepción. Bip! opera bajo
          AFT (Administrador Financiero del Transantiago) y un esquema
          contractual específico de la Región Metropolitana — no es
          extrapolable a otras regiones sin un proceso DTPR propio
          (que es exactamente lo que recién en 2025-2026 se hizo
          en el Biobío).
        </p>
      </Section>

      <Section title="Licitación y adjudicación">
        <KeyValueList
          items={[
            ['Mandante', 'Ministerio de Transportes y Telecomunicaciones (MTT) · División de Transporte Público Regional (DTPR)'],
            ['Bases publicadas', 'Mediados de 2025 (mes exacto pendiente — apertura efectiva 23-sep-2025)'],
            ['Cierre de ofertas', '23 de septiembre de 2025 — 6 oferentes recibidos'],
            ['Comisión evaluadora', 'DTPR (Diario Concepción · 23-sep-2025)'],
            ['Adjudicación', '28 de enero de 2026 — Consorcio Buspay'],
            ['Visa Contraloría', 'Enero-febrero 2026 (fecha exacta no publicada — Subtrans confirma el 30-ene-2026 que el contrato "queda en condiciones para su firma")'],
            ['Inversión estatal', '~$750 millones anuales durante todo el período de la concesión'],
            ['Cobertura', '11 comunas: 7 PE Gran Concepción + Tomé + Coronel + Lota + Santa Juana (rural)'],
            ['Validadores', '1.800 unidades (la prensa también cita "~2.000 máquinas" según el TVU)'],
            ['Tarifa', '$580 sin alteración — el sistema lo paga el Estado'],
          ]}
        />
        <p className="text-[12px]">
          <strong>Sonda</strong>, la compañía operadora del sistema
          financiero de Transantiago, declaró públicamente interés en
          competir en noviembre 2024 a través de Marco Ossandón
          (gerente comercial Smart Cities & Mobility Chile)
          (
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/29/pago-con-tarjeta-en-buses-empresa-que-opera-en-transantiago-espera-participar-en-licitacion-en-la-zona.html">
            Diario Concepción · 29-nov-2024
          </SourceLink>
          ). Si presentó oferta y en qué posición quedó no está
          publicado.
        </p>
        <PendingBanner>
          <strong>ID exacto de la licitación en MercadoPublico.cl
          pendiente.</strong> El concurso lo gestionó la DTPR Biobío y
          la base reglamentaria es Ley 18.696 art. 3° (vía Perímetro de
          Exclusión); el padrón con el ID DTPR/MercadoPublico y los
          puntajes de las 6 ofertas se pueden recuperar por Ley de
          Transparencia. Identidad de las 5 oferentes derrotadas (Sonda
          es la única confirmada como interesada, no como oferente
          formal) también pendiente.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html">
            Diario Concepción · 23-sep-2025 — Cierre licitación, 6 ofertas
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 — Adjudicación al Consorcio Buspay
          </SourceLink>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026 — Confirmación oficial y visa Contraloría
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Consorcio Buspay y Busmatick">
        <p>
          El nombre comercial del sistema (BusPay) y el del operador
          adjudicado (<em>Consorcio Buspay</em>) coinciden. Detrás del
          consorcio aparece <strong>Busmatick</strong>, empresa
          tecnológica con experiencia previa en sistemas de recaudo en
          buses urbanos en Europa, América Latina y el Caribe
          (
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026
          </SourceLink>
          ).
        </p>
        <KeyValueList
          items={[
            ['Marca del sistema', 'BusPay'],
            ['Razón social adjudicada', 'Consorcio Buspay (composición societaria, RUT y registro mercantil pendientes en fuente abierta)'],
            ['Operador técnico de referencia', 'Busmatick'],
            ['Director identificado', 'Hollman Suárez (asistió a la reunión técnica del 27-feb-2026 con operadores y autoridades)'],
            ['Antecedente operacional Chile', 'Sistema de recaudo en los buses eléctricos de Antofagasta — proyecto "Antofagasta Conectado" (Antofagasta, Calama y Tocopilla)'],
            ['Antecedentes internacionales', 'Europa, América Latina y el Caribe (sin detalle de país/ciudad en fuente abierta)'],
            ['URL del operador Antofagasta', 'antofagasta.busmatick.com'],
          ]}
        />
        <p className="text-[12px]">
          El operador modeló su despliegue en Concepción sobre el
          mismo libreto que aplicó en Antofagasta: tarjeta dedicada con
          tarifa adulto, AM y TNE; tarjetas bancarias contactless; QR
          por celular; <strong>tres meses de marcha blanca</strong>{' '}
          donde efectivo y tarjeta conviven; cierre del efectivo al
          finalizar la marcha blanca
          (
          <SourceLink href="https://dtpr.gob.cl/implementacion-del-sistema-de-pago-electronico-antofagasta-conectado/">
            DTPR · Antofagasta Conectado
          </SourceLink>
          ).
        </p>
        <PendingBanner>
          <strong>Composición societaria del Consorcio Buspay
          pendiente.</strong> No hay publicación abierta del RUT, los
          socios fundadores ni la forma jurídica del consorcio
          (¿sociedad anónima? ¿SpA? ¿joint venture entre Busmatick y
          una contraparte chilena?). El expediente del proceso DTPR es
          la vía natural para cerrarlo. Tampoco está publicada la
          eventual relación con operadores de buses locales.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.radioudec.cl/empresa-a-cargo-del-pago-electronico-se-reune-con-operadores-del-transporte-publico-del-gran-concepcion/">
            Radio UdeC · 27-feb-2026 — Reunión Busmatick / Hollman Suárez / operadores
          </SourceLink>
          <SourceLink href="https://antofagasta.busmatick.com/">
            antofagasta.busmatick.com — Portal del sistema en Antofagasta (referencia operacional)
          </SourceLink>
          <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
            Diario Financiero · 2026 — Antecedentes internacionales
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura — 11 comunas, tres regímenes">
        <p>
          BusPay opera sobre cuatro regímenes regulatorios distintos
          unificados en un solo medio de pago. La cobertura supera al
          Perímetro Gran Concepción (7 comunas) porque incorpora
          también el Perímetro Tomé, la regulación especial Coronel-Lota
          (Res. Ex. 457 MTT, 2012-2013 — el PE formal está en licitación
          y aún no vigente al cierre 2025) y la licitación rural Santa
          Juana
          (
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026
          </SourceLink>
          ).
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Comuna</th>
                <th className="px-3 py-2 font-medium">Régimen</th>
                <th className="px-3 py-2 font-medium">Servicios afectados</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Concepción</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">Líneas urbanas de las 36 UN (10A, 11, 12, 17M, 18, 22, 30B/C/E, 31F, 50YP, 57Y, 62H, 80, 81…)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Talcahuano</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">Líneas urbanas + 57Y San Vicente-Cosmito, 62H San Vicente-Lirquén</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Hualpén</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">Línea 02 Talcahuano-Hualpén y servicios costeros</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">San Pedro de la Paz</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">UN23 (San Pedro del Mar), UN24 (San Remo) y servicios margen sur</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Chiguayante</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">UN17 (Expresos Chiguayante, servicios 17M/17S)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Penco</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">UN31/UN32 (Ruta del Mar), 17M Penco centro, 31F Lirquén</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Hualqui</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">Servicios sur-este al margen del Biobío</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tomé</td>
                <td className="px-3 py-2">PE Tomé (decreto MTT jul-2016, operativo mar-2022)</td>
                <td className="px-3 py-2 text-muted-foreground">Servicios 401 / 411 / 421 Concepción-Penco-Tomé-Dichato operados por Transportes Tomé SpA — ver <a href="/wiki/concepcion-tome" className="underline underline-offset-2">artículo Concepción ↔ Tomé</a></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Coronel</td>
                <td className="px-3 py-2">Regulación especial Coronel-Lota (Res. Ex. 457 MTT, 2012-2013 — PE formal en licitación, aún no vigente)</td>
                <td className="px-3 py-2 text-muted-foreground">Operadores locales (Las Galaxias, Buses J. Ewert, etc.)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Lota</td>
                <td className="px-3 py-2">Regulación especial Coronel-Lota (Res. Ex. 457 MTT, 2012-2013 — PE formal en licitación, aún no vigente)</td>
                <td className="px-3 py-2 text-muted-foreground">Operadores locales</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Santa Juana</td>
                <td className="px-3 py-2">Licitación DTPR ELC0007 — Ley 20.378 art. 4°</td>
                <td className="px-3 py-2 text-muted-foreground">Líneas 201 y 201 AU Concepción-Santa Juana, operadas por Soc. Transporte Pasajeros Santa Juana SpA — <strong>primer servicio rural con pago electrónico en Chile</strong>. Ver <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">artículo Ruta 201</a></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          <strong>NO están en BusPay 2026:</strong> Biotrén (sigue con
          su tarjeta Conecta · ver <a href="/wiki/biotren" className="underline underline-offset-2">artículo Biotrén</a>),
          corredor Concepción-Florida (operadores privados sin
          régimen formal · ver{' '}
          <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
            artículo Florida
          </a>
          ), corredor Concepción-Yumbel y la troncal de El Pimentón
          (todos privados, fuera del Perímetro). La integración Biotrén
          ↔ BusPay no está confirmada en fuente abierta — es una
          pregunta abierta importante para 2026-2027.
        </p>
      </Section>

      <Section title="Funcionamiento técnico">
        <p>
          BusPay es un sistema de <strong>recaudo electrónico de
          múltiples medios</strong> sobre validadores embarcados. No es
          una "tarjeta única obligatoria" tipo Bip! antigua: el
          usuario elige el medio
          (
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026
          </SourceLink>
          ).
        </p>
        <KeyValueList
          items={[
            ['Tarjeta dedicada BusPay', 'Sin contacto (NFC). Diseño Campanil UdeC elegido por consulta ciudadana 23-dic-2025 a 12-ene-2026. Costo unitario ~$1.550 (el Mostrador · 17-mar-2026). Disponible en versiones adulto, adulto mayor y TNE estudiantil.'],
            ['Tarjetas bancarias', 'Pago contactless directo con tarjeta de débito o crédito (Visa, Mastercard) — mismo gesto que en el Biotrén desde noviembre 2024.'],
            ['Celular (QR / NFC)', 'Pago vía teléfono móvil — sistema equivalente al de Bipay (Temuco-Padre Las Casas) y Antofagasta Conectado.'],
            ['Tarjeta Nacional Estudiantil', 'La TNE pasa a operar como billetera electrónica, con tarifa estudiantil $190 (~33% del adulto). Habilitación coordinada con JUNAEB.'],
            ['Tarjeta AM', 'Tarjeta especial con tarifa adulto mayor reducida ($290, ~50% del adulto). Coordinación con SENAMA / Servicio Nacional de la Persona Mayor.'],
            ['Efectivo', 'Durante marcha blanca Q3 2026 sigue aceptado. Después, se elimina (proyectado fin 2026).'],
          ]}
        />
        <p className="text-[12px]">
          <strong>Esquema operacional típico (basado en lo conocido en
          Antofagasta y declaraciones del operador):</strong> el
          pasajero acerca la tarjeta o el celular al validador del bus
          al subir; el validador descuenta la tarifa correspondiente al
          tipo de tarjeta y comunica la transacción al backoffice; el
          backoffice agrega las recaudaciones por línea, ruta y
          operador para liquidación posterior.
        </p>
        <PendingBanner>
          <strong>Comportamiento ante validador caído: no
          documentado.</strong> Preguntas abiertas sin fuente: ¿el chofer
          puede cobrar efectivo "de emergencia" si el validador se
          cae? ¿hay una tarjeta supervisora? ¿el bus sale de operación
          hasta arreglarse el equipo? La respuesta a esto es central
          para el éxito de la marcha blanca y no está publicada.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
            Diario Financiero · 2026 — Funciones, medios de pago, costos
          </SourceLink>
          <SourceLink href="https://www.elmostrador.cl/datos-utiles/2026/03/17/nuevo-sistema-de-pago-en-transporte-de-concepcion-en-que-comunas-se-implementara/">
            El Mostrador · 17-mar-2026 — Precio tarjeta ~$1.550
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/penquistas-eligieron-al-campanil-como-la-imagen-de-la-primera-tarjeta-de-pago-electronico-del-transporte-publico/">
            Radio UdeC — Resultado consulta ciudadana: Campanil UdeC
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Modelo tarifario">
        <p>
          A diferencia de Bip! Santiago (que tuvo durante años una
          tarifa explícita "tarjeta vs efectivo" con diferencial), la
          comunicación oficial de BusPay <strong>no anuncia
          descuento</strong> por usar tarjeta vs efectivo. La tarifa
          adulto sigue siendo $580 con cualquiera de los tres medios
          de pago — el costo lo absorbe el Estado vía el subsidio anual
          ~$750 millones
          (
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026
          </SourceLink>
          ).
        </p>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Categoría</th>
                <th className="px-3 py-2 font-medium">Tarifa Perímetro 2025-2026</th>
                <th className="px-3 py-2 font-medium">Tarifa con BusPay</th>
                <th className="px-3 py-2 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 font-medium">Adulto</td>
                <td className="px-3 py-2 font-mono">$580</td>
                <td className="px-3 py-2 font-mono">$580</td>
                <td className="px-3 py-2 text-muted-foreground">Sin diferencial tarjeta/efectivo confirmado.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Estudiante (TNE)</td>
                <td className="px-3 py-2 font-mono">$190</td>
                <td className="px-3 py-2 font-mono">$190</td>
                <td className="px-3 py-2 text-muted-foreground">~33% del adulto · TNE pasa a billetera electrónica.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Adulto mayor</td>
                <td className="px-3 py-2 font-mono">$290</td>
                <td className="px-3 py-2 font-mono">$290</td>
                <td className="px-3 py-2 text-muted-foreground">50% del adulto · tarjeta especial requerida.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La tarifa del Perímetro sigue ajustándose por el polinomio
          (diésel + neumático + bus + mano de obra) — BusPay no la
          altera, solo cambia el <em>cómo</em> se paga, no el cuánto.
          Servicios fuera del PE Gran Concepción mantienen su tarifa
          propia: la 201 Santa Juana sigue en $1.000 y las 401/411/421
          Tomé en $780-$830.
        </p>
        <PendingBanner>
          <strong>Integración tarifaria pendiente.</strong> No está
          confirmado: ¿hay transbordo gratuito o pagado entre buses?
          ¿integración bus ↔ Biotrén (tarjeta Conecta) con tarifa
          combinada? ¿el sistema permite saldo monedero o solo cobro
          por viaje? Una integración bus ↔ tren sería una innovación
          enorme — ningún sistema regional de Chile la tiene hoy salvo
          parcialmente Antofagasta Conectado entre las tres ciudades
          del norte.
        </PendingBanner>
      </Section>

      <Section title="Despliegue — cronograma">
        <KeyValueList
          items={[
            ['Adjudicación', '28 de enero de 2026 (BioBioChile · 28-ene-2026)'],
            ['Visa Contraloría', 'Confirmada al 30 de enero de 2026 (Subtrans)'],
            ['Reunión técnica con operadores', '27 de febrero de 2026 (Radio UdeC · 27-feb-2026)'],
            ['Instalación validadores', 'Abril-mayo 2026 (Diario Financiero · 2026)'],
            ['Inicio marcha blanca', 'Tercer trimestre 2026 — efectivo + BusPay en paralelo (Subtrans · 30-ene-2026)'],
            ['Duración marcha blanca', 'Aproximadamente 3 meses (Revista Nos · 2026, modelo Antofagasta Conectado)'],
            ['Régimen 100% electrónico', 'Proyectado fin de 2026 (Subsecretario Jorge Daza)'],
            ['Fecha original (descartada)', 'Q2 2026 — postergada por demora administrativa post-adjudicación (Sala de Prensa)'],
          ]}
        />
        <p className="text-[12px]">
          <strong>Volumen del retrofit:</strong> el operador debe
          instalar entre <strong>1.800 y 2.000 validadores</strong> en
          los buses de las 11 comunas. La cifra "1.800" aparece en
          BioBioChile y DF; "~2.000 máquinas" aparece en TVU y en la
          reunión técnica del 27-feb-2026. La diferencia probablemente
          corresponde a la variabilidad de la flota efectiva en
          circulación más unidades de reserva.
        </p>
        <PendingBanner>
          <strong>Qué pasa con los buses que no logren instalación a
          tiempo:</strong> no documentado. En Antofagasta el modelo fue
          instalar la totalidad de la flota antes de iniciar la marcha
          blanca; si en Concepción se aplica la misma regla, todo bus
          sin validador queda fuera de operación. En la práctica:
          incentivo brutal para que los operadores cooperen, pero
          también riesgo de "buses fantasma" si el calendario se
          atrasa.
        </PendingBanner>
      </Section>

      <Section title="Recarga y atención al cliente">
        <KeyValueList
          items={[
            ['Centros de Atención al Usuario (CAU)', '5 centros: Concepción, San Pedro de la Paz, Talcahuano, Tomé y Lota (Subtrans · 30-ene-2026)'],
            ['Puntos físicos de recarga', '~500 distribuidos en la zona — convenios con comercio minorista esperables (modelo Antofagasta Conectado)'],
            ['Portal web', 'Sitio del operador con consulta de saldo, historial, bloqueo por extravío (modelo Bipay/Antofagasta)'],
            ['Aplicación móvil', 'Billetera digital con QR — equivalente funcional a Bipay Wallet (Temuco) y Busmatick (Antofagasta)'],
            ['Call center', 'Mesa de ayuda telefónica (Sala de Prensa)'],
            ['Tarjetas gratis iniciales', '~29.000 entregas gratuitas en el lanzamiento: 14.500 para estudiantes (coordinación JUNAEB) + 14.500 para adultos mayores (Sala de Prensa)'],
            ['Precio tarjeta adulto', '~$1.550 (El Mostrador · 17-mar-2026)'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          La red de recarga es la prueba de fuego operacional: 500
          puntos en una conurbación de ~1 millón de habitantes son
          ~2.000 personas por punto de recarga — comparable a la
          densidad de Bipay en Temuco-Padre Las Casas pero menos densa
          que Bip! en Santiago (que tiene miles de puntos entre
          BancoEstado, kioscos y estaciones de metro).
        </p>
        <PendingBanner>
          <strong>Identidad de la red minorista de recarga
          pendiente.</strong> No está publicado si la recarga se hará
          en supermercados (Líder, Tottus, Unimarc), en BancoEstado
          ServiEstado, en farmacias, en kioscos asociados a Cajas de
          Compensación, o vía CompraQui (BancoEstado · usado por
          Bipay). Tampoco está publicado el monto mínimo / máximo de
          recarga ni el saldo máximo que la tarjeta puede acumular.
        </PendingBanner>
      </Section>

      <Section title="Comparación con BIP! Santiago y RED Movilidad">
        <p>
          Ubicar BusPay contra los sistemas chilenos más maduros sirve
          tanto para evaluar realismo como para anticipar problemas:
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Aspecto</th>
                <th className="px-3 py-2 font-medium">BusPay · Concepción 2026</th>
                <th className="px-3 py-2 font-medium">Bip! / RED Movilidad · Santiago</th>
                <th className="px-3 py-2 font-medium">Bipay · Temuco 2025</th>
                <th className="px-3 py-2 font-medium">Antofagasta Conectado · 2026</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Año de partida</td>
                <td className="px-3 py-2">2026 (marcha blanca Q3)</td>
                <td className="px-3 py-2">2007</td>
                <td className="px-3 py-2">Sep 2025</td>
                <td className="px-3 py-2">Abr 2026</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Operador</td>
                <td className="px-3 py-2">Consorcio Buspay (Busmatick)</td>
                <td className="px-3 py-2">AFT (Administrador Financiero del Transantiago) — controlado por bancos</td>
                <td className="px-3 py-2">Bipay (BancoEstado · CompraQui)</td>
                <td className="px-3 py-2">Busmatick</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Cobertura</td>
                <td className="px-3 py-2">11 comunas · 3 regímenes</td>
                <td className="px-3 py-2">RM completa · Metro + buses + Metrotren</td>
                <td className="px-3 py-2">2 comunas (Temuco + Padre Las Casas)</td>
                <td className="px-3 py-2">3 comunas (Antofagasta + Calama + Tocopilla)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Integración con tren</td>
                <td className="px-3 py-2">Pendiente confirmar (Biotrén usa Conecta)</td>
                <td className="px-3 py-2">Sí — Bip! única en bus y Metro</td>
                <td className="px-3 py-2">N/A (sin tren urbano)</td>
                <td className="px-3 py-2">N/A</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Medios de pago</td>
                <td className="px-3 py-2">Tarjeta + tarjetas bancarias + QR/NFC celular</td>
                <td className="px-3 py-2">Bip! · QR · contactless (despliegue gradual)</td>
                <td className="px-3 py-2">Tarjeta · TNE · bancarias · QR Bipay Wallet</td>
                <td className="px-3 py-2">Tarjeta Antofagasta Conectado · TNE</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Evasión post-implementación</td>
                <td className="px-3 py-2">Sin dato (sistema no operativo)</td>
                <td className="px-3 py-2">Histórica 20-30% en buses</td>
                <td className="px-3 py-2">1,6% en fiscalizaciones a 3.000+ pasajeros (oct-2025)</td>
                <td className="px-3 py-2">Sin dato público</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Mix de pagos efectivos</td>
                <td className="px-3 py-2">Por verse</td>
                <td className="px-3 py-2">~95% Bip! adulto · resto tarjetas + QR</td>
                <td className="px-3 py-2">39,5% tarjeta · 36,6% TNE · 13% banca · 10,9% QR Bipay</td>
                <td className="px-3 py-2">Por verse</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px]">
          <strong>Lectura de la tabla:</strong> Temuco es el referente
          más cercano y reciente y muestra que el modelo
          multi-medio-de-pago funciona — 4 millones de validaciones en
          el primer mes, 1,6% de evasión declarada. Si BusPay replica
          esa curva, sería una mejora radical contra el efectivo
          opaco actual del PE Gran Concepción
          (
          <SourceLink href="https://alertanoticiastemuco.cl/2025/10/11/pago-electronico-buses-temuco-padre-las-casas-4m-validaciones/">
            Alerta Temuco · 11-oct-2025
          </SourceLink>
          ).
        </p>
        <p className="text-[12px] text-muted-foreground">
          <strong>Riesgos heredados de Bip! observables hoy:</strong>{' '}
          (a) saldos bloqueados por errores de validador, (b) atención
          al cliente saturada en la primera semana, (c) buses con
          validador caído que igual operan y crean tensión chofer-pasajero,
          (d) opacidad del backoffice respecto a la liquidación a
          operadores. Ninguno está resuelto a priori para BusPay y los
          tres primeros aparecen recurrentemente en Antofagasta y
          Temuco.
        </p>
      </Section>

      <Section title="Cobertura del visor">
        <p>
          Hoy el visor de{' '}
          <code className="font-mono">conce.patagua.dev</code>{' '}
          <strong>no</strong> muestra información de BusPay — el
          sistema no opera todavía. Pero es probable que sea una capa
          relevante a partir de Q3 2026:
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Lo que el visor podría sumar cuando BusPay opere
          </div>
          <ul className="mt-1 ml-5 list-disc space-y-1 text-[12px]">
            <li>
              Badge "Acepta BusPay" en el sidebar de cada ruta urbana
              del PE Gran Concepción una vez que el régimen sea 100%
              electrónico.
            </li>
            <li>
              Banner explicativo en el detalle de ruta para servicios
              fuera del PE (Florida, Yumbel, El Pimentón) aclarando
              que <em>no</em> aceptan BusPay y se mantienen en
              efectivo / tarifa libre.
            </li>
            <li>
              Mapa de Centros de Atención al Usuario (5 ubicaciones)
              como capa overlay del visor, equivalente a cómo hoy se
              muestran los terminales.
            </li>
            <li>
              Mapa de puntos de recarga (~500) como capa overlay con
              filtros por tipo (kiosco, supermercado, BancoEstado) una
              vez publicada la red oficial.
            </li>
            <li>
              Integración con el detalle de la 201 Santa Juana, las
              401/411/421 Tomé y los servicios de Coronel-Lota — las
              cuatro líneas comparten medio de pago aunque pertenezcan
              a regímenes distintos.
            </li>
          </ul>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Estas capas dependen de que el operador (o la DTPR) publique
          datasets abiertos: lista de validadores por línea, ubicación
          de CAU y de puntos de recarga. Si no se publican, el visor
          documentará el sistema únicamente desde el wiki — sin
          ingerencia en el mapa.
        </p>
      </Section>

      <Section title="Riesgos y preguntas abiertas">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Cronograma optimista
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              La meta original era Q2 2026; ya se postergó a "fin de
              2026". Entre la adjudicación (28-ene-2026) y la primera
              reunión técnica con operadores (27-feb-2026) pasó un mes;
              entre esta reunión y la marcha blanca Q3 quedan ~4 meses
              para retrofit, capacitación, despliegue de CAU y red de
              recarga. Comparable a Antofagasta pero <em>más comunas</em>{' '}
              y <em>más flota</em>.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Conducta ante validador caído sin documentar
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El bus debe estar operativo aunque el validador falle.
              ¿Se reembolsa el pasaje? ¿Hay tarifa de respaldo en
              efectivo durante la marcha blanca? Esta pregunta es la
              principal fuente de fricción documentada en Bipay
              Temuco al inicio de operaciones.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Float y liquidación a operadores
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              ¿Cómo y cada cuánto se liquidan las recaudaciones a los
              35 operadores del PE Gran Concepción + Transportes Tomé
              + Soc. Santa Juana SpA + operadores Coronel-Lota? ¿Quién
              se queda con el float (saldo no ejecutado)? En
              Transantiago esto fue históricamente un punto crítico
              que justificó la creación del AFT. Aquí no hay AFT
              equivalente: el Consorcio Buspay es a la vez recaudador
              y liquidador, lo que es una arquitectura distinta y no
              probada en una metrópoli del tamaño del Gran Concepción.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Tarjeta sin contacto y dispositivos antiguos
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El sistema asume celulares con NFC o tarjeta física. La
              brecha digital relevante es Adultos Mayores +
              estudiantes de escuelas rurales que pueden no tener
              dispositivos compatibles. La entrega gratuita inicial de
              29.000 tarjetas (14.500 estudiantes + 14.500 AM) atiende
              parte del problema, pero la población AM del Gran
              Concepción es mayor (estimación: 100.000+).
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Sin integración Biotrén ↔ BusPay confirmada
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El Biotrén (operador EFE Trenes Metropolitanos) usa la
              tarjeta <strong>Conecta</strong> y desde noviembre 2024
              acepta también tarjetas bancarias contactless. BusPay
              tiene tarjeta propia. Una integración real (tarifa
              combinada bus + tren) requeriría acuerdo bilateral
              EFE-Buspay no anunciado. Para el visor: dos sistemas
              paralelos a mostrar.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Posible asimetría con Bipay nacional
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Bipay (BancoEstado) opera en Temuco, Chillán, Valdivia y
              otras conurbaciones del sur. El Gran Concepción adjudicó
              a Busmatick, no a Bipay. A mediano plazo, esto puede
              significar que el sur de Chile termine con <em>dos
              tarjetas paralelas</em> sin interoperabilidad, un patrón
              que el país intentó evitar con el rol del MTT/DTPR como
              árbitro nacional.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Impacto en operadores">
        <p>
          Para los 35 operadores del PE Gran Concepción + Transportes
          Tomé + Soc. Santa Juana SpA + operadores Coronel-Lota, BusPay
          es un cambio estructural mayor — comparable en magnitud al
          propio paso del régimen 2002 al Perímetro:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <strong>Fin del "corte de boleto".</strong> El chofer ya
            no maneja efectivo ni boletos físicos. El conflicto
            chofer-pasajero por vuelto, billete falso o tarifa
            estudiante mal cobrada desaparece. Alejandro Riquelme,
            presidente de la Asociación Gremial de Taxibuses, lo
            describe como "vamos a transparentar la recaudación real
            de los buses"
            (
            <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
              DF · 2026
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Eliminación del incentivo al robo.</strong> Buses
            sin caja chica son menos atractivos para asaltos — el
            Subsecretario Daza vincula esto explícitamente a zonas
            como Candelaria (San Pedro) y Boca Sur
            (
            <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
              DF · 2026
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Pago vía liquidación periódica.</strong> El operador
            ya no factura por boletos vendidos sino que recibe del
            Consorcio Buspay una liquidación periódica con la
            recaudación de sus líneas. Mecanismo y plazo: pendientes.
          </li>
          <li>
            <strong>Datos auditables.</strong> Por primera vez DTPR y
            MTT tendrán datos finos de demanda por línea, hora y
            paradero, alimentando el ranking de cumplimiento que el
            Perímetro ya creó pero al que le faltaba esta señal de
            "boletería real" cruzada con GPS.
          </li>
          <li>
            <strong>Formalización laboral.</strong> El término del
            modelo "chofer-cobrador" empuja hacia contratos formales
            de conductor con sueldo fijo + bonos, dejando atrás el
            componente porcentaje-de-recaudo. Compromiso del MTT y de
            los gremios desde noviembre 2023.
          </li>
        </ul>
        <PendingBanner>
          <strong>Esquema concreto de liquidación pendiente.</strong>{' '}
          ¿Pago semanal? ¿quincenal? ¿con anticipo y ajuste? ¿el
          Consorcio Buspay cobra una comisión sobre la recaudación
          (modelo AFT Transantiago) o solo el fee fijo del subsidio
          de $750 millones anuales? Es lo más opaco del proceso y lo
          más relevante para los operadores.
        </PendingBanner>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción 2024
            </a>{' '}
            — el régimen regulatorio del que BusPay es la pieza
            tecnológica que faltaba. El Perímetro creó la obligación
            contractual; BusPay la materializa.
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 Santa Juana
            </a>{' '}
            — primer servicio <em>rural</em> de Chile con pago
            electrónico (vía BusPay). Operado bajo licitación DTPR
            ELC0007 / Ley 20.378 art. 4°, NO bajo PE.
          </li>
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>{' '}
            — el corredor norte (servicios 401/411/421) entra a BusPay
            a través del Perímetro de Exclusión Tomé (decreto MTT
            jul-2016). Operador único Transportes Tomé SpA.
          </li>
          <li>
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
              Biotrén y sus extensiones
            </a>{' '}
            — el modo masivo del Gran Concepción <em>no</em> está en
            BusPay. Sigue con su tarjeta Conecta (sucesora de la
            tarjeta Biotrén 2005). Integración tarifaria bus ↔ tren:
            pregunta abierta para 2026-2027.
          </li>
          <li>
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
              Concepción ↔ Florida
            </a>{' '}
            — fuera de BusPay. Operadores privados sin régimen formal,
            tarifa libre, efectivo.
          </li>
          <li>
            <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">
              Sobre este wiki
            </a>{' '}
            — modelo editorial y cómo se cita lo verificado vs lo
            pendiente.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Razón social, RUT y composición societaria exacta del Consorcio Buspay (¿Busmatick + socio chileno? ¿SpA? ¿joint venture?).</li>
          <li>ID de licitación en MercadoPublico.cl / DTPR Biobío y lista de las 6 oferentes con puntajes.</li>
          <li>Plazo del contrato (años) y monto total agregado (más allá del flujo anual de $750 millones).</li>
          <li>Identidad de las 5 oferentes derrotadas — sólo Sonda está confirmada como interesada (no como oferente formal).</li>
          <li>Esquema concreto de liquidación a operadores: plazo, comisión, modelo de float, base de cálculo.</li>
          <li>¿Hay descuento tarjeta vs efectivo? ¿transbordo gratuito? ¿integración Biotrén?</li>
          <li>Conducta del sistema ante validador caído (tarifa de respaldo, reembolso, fuera de operación).</li>
          <li>Red minorista de recarga: ¿BancoEstado CompraQui? ¿supermercados? ¿kioscos?</li>
          <li>Monto mínimo / máximo de recarga y saldo máximo acumulable.</li>
          <li>Reembolso al perder la tarjeta y bloqueo remoto.</li>
          <li>Texto íntegro del decreto MTT que aprobó la adjudicación.</li>
          <li>Si la marcha blanca empieza en julio, agosto o septiembre 2026 (Q3 es un trimestre, la fecha exacta no está fijada).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: solicitud por <strong>Ley de Transparencia
          20.285</strong> a la DTPR Biobío y al MTT por el expediente
          íntegro del proceso de licitación BusPay; consulta directa
          al Consorcio Buspay / Busmatick una vez activo el call
          center; revisión del padrón de proveedores en
          MercadoPublico.cl una vez publicado el acto administrativo
          de adjudicación.
        </p>
      </Section>

      <Section title="Bibliografía">
        <Sources>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 — Adjudicación al Consorcio Buspay
          </SourceLink>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026 — Comunicado oficial MTT, visa Contraloría, 11 comunas
          </SourceLink>
          <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
            Diario Financiero · 2026 — 1.800 buses, $750M/año, evasión, cronograma abr-may, fin 2026
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html">
            Diario Concepción · 23-sep-2025 — Cierre licitación, 6 ofertas
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/29/pago-con-tarjeta-en-buses-empresa-que-opera-en-transantiago-espera-participar-en-licitacion-en-la-zona.html">
            Diario Concepción · 29-nov-2024 — Sonda manifiesta interés, antecedente Biobús 2016 (50.000 tarjetas)
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/empresa-a-cargo-del-pago-electronico-se-reune-con-operadores-del-transporte-publico-del-gran-concepcion/">
            Radio UdeC · 27-feb-2026 — Reunión Busmatick/Hollman Suárez/operadores, ~2.000 buses
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/pago-electronico-adjudican-operacion-del-sistema-en-micros-del-gran-concepcion/">
            Radio UdeC — Adjudicación BusPay (cobertura)
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/penquistas-eligieron-al-campanil-como-la-imagen-de-la-primera-tarjeta-de-pago-electronico-del-transporte-publico/">
            Radio UdeC — Resultado consulta: Campanil UdeC ganador
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · 23-dic-2025 — Consulta ciudadana, 3 diseños, voto vía @mttbiobio
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/servicios/toma-nota/2026/02/19/cuando-inicia-el-nuevo-sistema-de-pago-electronico-del-transporte-en-el-gran-concepcion.shtml">
            BioBioChile · 19-feb-2026 — Inicio Q3 2026, marcha blanca
          </SourceLink>
          <SourceLink href="https://www.elmostrador.cl/datos-utiles/2026/03/17/nuevo-sistema-de-pago-en-transporte-de-concepcion-en-que-comunas-se-implementara/">
            El Mostrador · 17-mar-2026 — 11 comunas, 5 CAU, ~500 puntos de recarga, costo tarjeta ~$1.550
          </SourceLink>
          <SourceLink href="https://revistanos.cl/pago-electronico-llegara-al-transporte-publico-del-gran-concepcion-el-tercer-trimestre-de-2026/">
            Revista Nos · 2026 — Marcha blanca Q3, 3 meses de coexistencia con efectivo
          </SourceLink>
          <SourceLink href="https://www.saladeprensa.cl/alcanzara-a-estar-listo-en-2026-pago-electronico-en-el-gran-concepcion-sufre-nuevo-atraso/">
            Sala de Prensa — Atraso, 14.500 tarjetas estudiantes + 14.500 AM, JUNAEB/SENAMA
          </SourceLink>
          <SourceLink href="https://tiemporeal.periodismoudec.cl/2026/03/19/el-gran-concepcion-tendra-anhelado-pago-electronico-del-transporte-publico/">
            Tiempo Real UdeC · 19-mar-2026 — Antecedente Biobús 2016, espera histórica
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/politica/2026/02/01/pago-electronico-gobierno-planea-que-este-implementado-100-durante-este-ano-en-el-gran-concepcion.html">
            Diario Concepción · 1-feb-2026 — Plan 100% durante 2026
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Transporte público en el Gran Concepción (tarjeta Biotrén 2005, Conecta 2023, integración Biobús hasta 2019)
          </SourceLink>
          <SourceLink href="https://dtpr.gob.cl/implementacion-del-sistema-de-pago-electronico-antofagasta-conectado/">
            DTPR · Antofagasta Conectado — Modelo de referencia operacional
          </SourceLink>
          <SourceLink href="https://antofagasta.busmatick.com/">
            antofagasta.busmatick.com — Portal del sistema en Antofagasta
          </SourceLink>
          <SourceLink href="https://alertanoticiastemuco.cl/2025/10/11/pago-electronico-buses-temuco-padre-las-casas-4m-validaciones/">
            Alerta Temuco · 11-oct-2025 — Comparativo Bipay: 4M validaciones, 1,6% evasión
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2026/02/26/transporte-publico-del-gran-concepcion-prepara-salto-digital-2-mil-maquinas-operaran-con-pago-electronico.html">
            TVU · 26-feb-2026 — 2.000 validadores y "salto digital"
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes el ID exacto de la licitación en MercadoPublico, la
          razón social y RUT del Consorcio Buspay, el texto del decreto
          MTT de adjudicación, la red minorista de recarga publicada o
          fotos de validadores instalados en buses del PE — abre un
          pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/buspay.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/buspay.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
