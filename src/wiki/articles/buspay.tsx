// BusPay · pago electrónico del Gran Concepción 2026.
// Sistema de recaudo adjudicado al Consorcio Buspay (operador técnico
// Busmatick) por el MTT el 28-ene-2026 y visado por Contraloría el
// 30-ene. Al público se presenta como tarjeta "Gran Concepción Conectado"
// y app BusApp. Marcha blanca desde el 1-dic-2026 (cronograma oficial
// de oct-nov 2026; la fecha de Q3 y el 1-nov quedaron superadas), pago
// 100% electrónico desde el 1-mar-2027. Este artículo es el dueño del
// tema: los artículos de perímetros y corredores enlazan acá.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  KeyValueList,
  NewsPulse,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

const LINK = 'underline underline-offset-2';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function BusPay() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado con fuentes oficiales y prensa regional hasta
        el 25-nov-2026.</strong> Fechas de marcha blanca y pago 100%
        electrónico, venta de tarjetas, puntos de recarga y adjudicación
        están citados.{' '}
        <strong>Pendientes</strong>: firma del contrato y composición del
        Consorcio, liquidación a operadores, tarifas con tarjeta vs
        efectivo, integración con Biotrén y conducta ante validador
        caído.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Marcha blanca', value: '1-dic-2026' },
          { label: '100% electrónico', value: '1-mar-2027' },
          { label: 'Tarifa adulto', value: '$580' },
          { label: 'Tarjeta', value: '$1.550' },
          { label: 'Recarga', value: '490–700 comercios' },
          { label: 'Operador', value: 'Consorcio Buspay (Busmatick)' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Sistema de pago electrónico para las micros del Gran
            Concepción. Tarjeta <strong>Gran Concepción Conectado</strong>,
            tarjeta bancaria sin contacto o código QR en la app BusApp.
          </>,
          <>
            <strong>Marcha blanca desde el martes 1-dic-2026</strong>: se
            puede pagar en efectivo o electrónico. Desde el{' '}
            <strong>1-mar-2027</strong> se elimina el efectivo a bordo.
          </>,
          <>
            La tarjeta cuesta <strong>$1.550</strong>. La tarifa adulto no
            cambia: <strong>$580</strong>.
          </>,
          <>
            Cubre 9 comunas según la prensa de sep-nov 2026 (11 según
            Subtrans en ene-2026). El Biotrén sigue con Conecta; la
            integración no estará al inicio.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '1-dic-2026',
            title: 'Marcha blanca con pago mixto hasta el 28-feb-2027',
            detail:
              'El cronograma de la seremi y del operador fija pago con efectivo, tarjeta, tarjeta bancaria o QR entre el 1-dic y el 28-feb, y pago 100% electrónico desde el 1-mar-2027. Reemplaza las fechas anteriores (Q3 y 1-nov-2026).',
            source: {
              href: 'https://www.diarioconcepcion.cl/ciudad/2026/10/30/venta-tarjetas-transporte-publico-gran-concepcion.html',
              label: 'Diario Concepción · 30-oct-2026',
            },
          },
          {
            date: '2 y 23-nov-2026',
            title: 'Venta de tarjetas y centros de atención',
            detail:
              'La venta partió el 2-nov en San Pedro de la Paz (Lota 23). Según la seremi, los centros de Concepción, Talcahuano y Tomé abrirían la semana del 23-nov; hay 490 comercios de venta y recarga y tótems en Hualqui, Hualpén, Penco y Chiguayante.',
            source: {
              href: 'https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta',
              label: 'Canal 9 · 23-nov-2026',
            },
          },
        ]}
      />

      <Section title="Cómo se paga y se recarga">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Tarjeta Gran Concepción Conectado.</strong> $1.550.
            La tarjeta azul (tarifa regular) se vende en los comercios;
            la de adulto mayor, solo en los centros de atención con
            cédula de identidad
            (
            <SourceLink href="https://sabes.cl/2026/11/02/saldo-vinculado-al-run-y-negocios-de-barrio-como-puntos-de-recarga-otras-de-las-caracteristicas-que-traera-el-pago-electronico-para-el-gran-concepcion">
              Sabes · 2-nov-2026
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Tarjeta bancaria.</strong> Modalidad &ldquo;Viaja,
            Acumula y Paga&rdquo;: los viajes del día se acumulan y se
            cobran después.
          </li>
          <li>
            <strong>QR en BusApp.</strong> Se genera en la app tras
            cargar saldo
            (
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2026/09/25/busappconce-cronograma-pago-electronico-gran-concepcion.html">
              Diario Concepción · 25-sep-2026
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Recarga.</strong> Online en{' '}
            <SourceLink href="https://mibusapp.cl/">mibusapp.cl</SourceLink>{' '}
            o en la app, en comercios con el cartel &ldquo;Recarga tu
            tarjeta aquí&rdquo; (pago con POS, efectivo o tarjeta
            bancaria) y en tótems. Las fuentes dan 490 comercios (Canal 9,
            23-nov) y 700 (Sabes, 2-nov): usar el mapa de Movired.
          </li>
          <li>
            <strong>Saldo vinculado al RUN.</strong> Si se enrola la
            tarjeta en BusApp, el saldo se conserva y se puede bloquear
            si se pierde (línea 600 de atención).
          </li>
        </ul>
        <KeyValueList
          items={[
            ['Centros de atención', 'Concepción (Angol 564), Talcahuano (Thompson 7), Tomé (Ignacio Serrano 1225), San Pedro de la Paz (Lota 23, único operativo el 23-nov). Sabes cuenta también uno en Lota.'],
            ['Biotrén', 'Sin integración al inicio por diferencias tecnológicas; se trabaja con EFE para "los próximos meses".'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta">
            Canal 9 · 23-nov-2026, Centros de atención, 490 puntos, tótems, Biotrén
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/servicios/toma-nota/2026/11/13/linea-de-buses-de-concepcion-sorteara-1-000-de-las-nuevas-tarjetas-de-pago-electronico-como-concursar.shtml">
            BioBioChile · 13-nov-2026, Marcha blanca 1-dic, tarjeta $1.550
          </SourceLink>
          <SourceLink href="https://www.canal9.cl/episodios/2026/10/08/pago-electronico-en-gran-concepcion-seremi-de-transportes-detallo-fechas-uso-de-tarjetas-y-plan-de-fiscalizacion">
            Canal 9 · 8-oct-2026, Seremi: fechas, medios de pago, plan de fiscalización
          </SourceLink>
        </Sources>
        <PendingBanner>
          <strong>Pendiente:</strong> montos mínimo y máximo de recarga,
          saldo máximo, reembolso por pérdida y qué pasa si el validador
          falla. No hay fuente publicada.
        </PendingBanner>
      </Section>

      <Section title="Estado hoy y retrasos">
        <p>
          El plazo original era iniciar la marcha blanca antes de marzo
          de 2026. Se corrió a Q3, luego al último trimestre, y hoy
          quedó en el <strong>1-dic-2026</strong>. En sep-2026 el
          operador instalaba cables y validadores en las flotas
          (
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2026/09/25/busappconce-cronograma-pago-electronico-gran-concepcion.html">
            Diario Concepción · 25-sep-2026
          </SourceLink>
          ). La seremi anunció una fiscalización especial para el
          arranque, con inspectores a bordo, por el temor de los
          gremios a la evasión; no publicó multas.
        </p>
        <p>
          El 1-nov-2026, fecha que daba antes el perímetro, quedó
          superada: ese día solo partió la venta de tarjetas y la marcha
          blanca se fijó para el 1-dic.
        </p>
        <PendingBanner>
          <strong>Pendiente:</strong> firma del contrato. En feb-2026 se
          esperaba para fines de marzo, sujeta a las boletas de garantía
          (
          <SourceLink href="https://sabes.cl/2026/02/26/retrasan-inicio-del-pago-electronico-en-micros-del-gran-concepcion/">
            Sabes · 26-feb-2026
          </SourceLink>
          ); no hay fecha de firma publicada.
        </PendingBanner>
      </Section>

      <Section title="Cobertura">
        <p>
          Subtrans habló de 11 comunas en su comunicado del 30-ene-2026
          (
          <SourceLink href="https://www.subtrans.gob.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026
          </SourceLink>
          ). La prensa de sep-nov 2026 nombra{' '}
          <strong>nueve</strong>: Concepción, Penco, Chiguayante,
          Hualqui, Hualpén, San Pedro de la Paz, Talcahuano, Tomé y
          Santa Juana. Coronel y Lota no aparecen en esas notas.
        </p>
        <DataTable columns={['Régimen', 'Comunas', 'Detalle']}>
          <tr>
            <td className="px-3 py-2 font-medium">
              <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className={LINK}>PE Gran Concepción</a>
            </td>
            <td className="px-3 py-2">7 comunas</td>
            <td className="px-3 py-2 text-muted-foreground">Concepción, Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante, Hualqui, Penco.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">
              <a href="/wiki/perimetro-exclusion-tome" className={LINK}>PE Tomé</a>
            </td>
            <td className="px-3 py-2">Tomé</td>
            <td className="px-3 py-2 text-muted-foreground">401/411/421, ver <a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a>.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Coronel-Lota</td>
            <td className="px-3 py-2">Coronel, Lota</td>
            <td className="px-3 py-2 text-muted-foreground">Regulación especial (Res. Ex. 457). Incluida por Subtrans en ene-2026; ausente en notas recientes: por confirmar.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Santa Juana</td>
            <td className="px-3 py-2">Santa Juana</td>
            <td className="px-3 py-2 text-muted-foreground">201 y 201 AU, primer servicio rural con pago electrónico. Ver <a href="/wiki/ruta-201-santa-juana" className={LINK}>Ruta 201</a>.</td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Fuera de BusPay:{' '}
          <a href="/wiki/biotren" className={LINK}>Biotrén</a>{' '}
          (sigue con Conecta),{' '}
          <a href="/wiki/concepcion-florida" className={LINK}>Concepción-Florida</a>
          , Concepción-Yumbel y El Pimentón (privados fuera del
          perímetro).
        </p>
      </Section>

      <Section title="Tarifas">
        <p>
          El sistema no cambia la tarifa: el adulto sigue en{' '}
          <strong>$580</strong> con cualquier medio (vigente desde el
          23-feb-2025) y no se anuncia descuento por usar tarjeta
          (
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026
          </SourceLink>
          ). La seremi llama a la tarjeta &ldquo;adulto mayor&rdquo; y a
          la TNE &ldquo;pasaje rebajado&rdquo;. El Estado paga el sistema
          (~$750 millones al año según prensa), no el pasajero. La tarifa
          sigue el polinomio del perímetro; los servicios fuera del PE
          Gran Concepción tienen tarifa propia (201 Santa Juana $1.000;
          401/411/421 Tomé $780-$830).
        </p>
        <DataTable columns={['Categoría', 'Tarifa', 'Nota']} bodyClassName="divide-y">
          <tr>
            <td className="px-3 py-2 font-medium">Adulto</td>
            <td className="px-3 py-2 font-mono">$580</td>
            <td className="px-3 py-2 text-muted-foreground">Sin diferencial tarjeta/efectivo confirmado.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Estudiante (TNE)</td>
            <td className="px-3 py-2 font-mono">$190</td>
            <td className="px-3 py-2 text-muted-foreground">~33% del adulto. Coordinación JUNAEB.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Adulto mayor</td>
            <td className="px-3 py-2 font-mono">$290</td>
            <td className="px-3 py-2 text-muted-foreground">50% del adulto. Coordinación SENAMA.</td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Las tarifas rebajadas son las de la versión anterior del
          artículo; no las reconfirmé en las notas de nov-2026.
        </p>
        <PendingBanner>
          <strong>Pendiente:</strong> transbordo gratuito y tarifa
          combinada bus-Biotrén. Hasta ahora no hay anuncio.
        </PendingBanner>
      </Section>

      <Section title="Consorcio Buspay y Busmatick">
        <KeyValueList
          items={[
            ['Adjudicatario', 'Consorcio Buspay (razón social, RUT y socios no publicados en fuente abierta).'],
            ['Operador técnico', 'Busmatick (Busmatick Andina en Sabes). Antecedente: Antofagasta Conectado (Antofagasta, Calama, Tocopilla).'],
            ['Imagen pública', 'Tarjeta Gran Concepción Conectado; app BusApp. Diario Concepción y BioBioChile usan "BusappConce" para el operador del recaudo.'],
            ['Dirección', 'Hollman Suárez, director de Busmatick Group.'],
            ['Flota', '~1.800 validadores (BioBioChile, DF) a ~2.000 (TVU, reunión del 27-feb-2026).'],
          ]}
        />
        <p className="text-[12px]">
          El despliegue replica Antofagasta: tarjeta dedicada, tarjetas
          bancarias, QR y tres meses de marcha blanca
          (
          <SourceLink href="https://dtpr.gob.cl/implementacion-del-sistema-de-pago-electronico-antofagasta-conectado/">
            DTPR · Antofagasta Conectado
          </SourceLink>
          ).
        </p>
        <PendingBanner>
          <strong>Pendiente:</strong> composición societaria del
          Consorcio y esquema de liquidación a operadores (plazo,
          comisión, quién retiene el saldo no usado). Vía de cierre:
          Ley de Transparencia a la DTPR Biobío o MTT.
        </PendingBanner>
      </Section>

      <CollapsibleSection title="Licitación y adjudicación">
        <KeyValueList
          items={[
            ['Mandante', 'MTT · División de Transporte Público Regional (DTPR)'],
            ['Cierre de ofertas', '23-sep-2025, 6 oferentes (evaluó la DTPR)'],
            ['Adjudicación', '28-ene-2026 al Consorcio Buspay'],
            ['Visa Contraloría', '30-ene-2026: "ya fue visada por la Contraloría, quedando en condiciones para su firma" (Subtrans)'],
            ['Inversión estatal', '~$750 millones al año (prensa regional); Subtrans no publica el monto'],
          ]}
        />
        <PendingBanner>
          <strong>Pendiente:</strong> ID de la licitación en
          MercadoPublico.cl, plazo y monto total del contrato, y
          identidad de las 5 oferentes no adjudicadas (Sonda mostró
          interés en nov-2024, pero no consta como oferente).
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html">
            Diario Concepción · 23-sep-2025, Cierre de licitación, 6 ofertas
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026, Comunicado oficial y visa Contraloría
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Historia y cronograma">
        <p>
          Concepción fue hasta 2026 la única gran ciudad del país sin
          pago electrónico en sus buses urbanos. El Biotrén sí lo
          tenía: tarjeta desde 2005, hoy Conecta
          (
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · transporte público Gran Concepción
          </SourceLink>
          ).
        </p>
        <Timeline
          items={[
            {
              date: '2016',
              event: <>Piloto Biobús fallido: más de <strong>50.000 tarjetas</strong> repartidas y la licitación 2002 no obligaba a instalar validadores.</>,
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/29/pago-con-tarjeta-en-buses-empresa-que-opera-en-transantiago-espera-participar-en-licitacion-en-la-zona.html', label: 'Diario Concepción · 29-nov-2024' },
            },
            {
              date: '1-ene-2024',
              event: <>Entra en vigor el Perímetro de Exclusión, con obligación contractual de pago electrónico.</>,
              source: { href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/', label: 'DPR Biobío · 3-ene-2024' },
            },
            {
              date: '23-sep-2025',
              event: <>MTT recibe 6 ofertas para 11 comunas.</>,
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html', label: 'Diario Concepción · 23-sep-2025' },
            },
            {
              date: '23-dic-2025 a 12-ene-2026',
              event: <>Consulta ciudadana sobre el diseño de la tarjeta; gana el Campanil UdeC.</>,
              source: { href: 'https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/', label: 'Subtrans · 23-dic-2025' },
            },
            {
              date: '28 y 30-ene-2026',
              event: <>Adjudicación al Consorcio Buspay y visa de Contraloría.</>,
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
            {
              date: '27-feb-2026',
              event: <>Reunión técnica con taxibuses (subsecretario Daza, Busmatick). Se anuncia retraso: marcha blanca en el último trimestre, contrato a fines de marzo.</>,
              source: { href: 'https://www.radioudec.cl/empresa-a-cargo-del-pago-electronico-se-reune-con-operadores-del-transporte-publico-del-gran-concepcion/', label: 'Radio UdeC · 27-feb-2026' },
            },
            {
              date: '22-jul-2026',
              event: <>Seremi confirma 29.000 tarjetas gratuitas desde agosto y marcha blanca el 1-nov (fecha luego corrida).</>,
              source: { href: 'https://www.canal9.cl/episodios/2026/07/21/comenzara-entrega-gratuita-de-29-mil-tarjetas-para-pago-electronico-de-micros-en-el-gran-concepcion', label: 'Canal 9 · 21-jul-2026' },
            },
            {
              date: '25-sep a 30-oct-2026',
              event: <>Operador fija marcha blanca 1-dic y pago 100% electrónico 1-mar-2027.</>,
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2026/10/30/venta-tarjetas-transporte-publico-gran-concepcion.html', label: 'Diario Concepción · 30-oct-2026' },
            },
          ]}
        />
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2026/07/22/entrega-tarjetas-gratuitas-pago-micros-gran-concepcion.html">
            Diario Concepción · 22-jul-2026, 29.000 tarjetas gratuitas
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/servicios/toma-nota/2026/02/19/cuando-inicia-el-nuevo-sistema-de-pago-electronico-del-transporte-en-el-gran-concepcion.shtml">
            BioBioChile · 19-feb-2026, Inicio Q3 2026 (superado)
          </SourceLink>
          <SourceLink href="https://revistanos.cl/pago-electronico-llegara-al-transporte-publico-del-gran-concepcion-el-tercer-trimestre-de-2026/">
            Revista Nos · 2026, Marcha blanca Q3 (superado)
          </SourceLink>
          <SourceLink href="https://www.saladeprensa.cl/alcanzara-a-estar-listo-en-2026-pago-electronico-en-el-gran-concepcion-sufre-nuevo-atraso/">
            Sala de Prensa, Atraso; 14.500 tarjetas estudiantes + 14.500 AM
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/politica/2026/02/01/pago-electronico-gobierno-planea-que-este-implementado-100-durante-este-ano-en-el-gran-concepcion.html">
            Diario Concepción · 1-feb-2026, Plan 100% durante 2026 (superado)
          </SourceLink>
          <SourceLink href="https://tiemporeal.periodismoudec.cl/2026/03/19/el-gran-concepcion-tendra-anhelado-pago-electronico-del-transporte-publico/">
            Tiempo Real UdeC · 19-mar-2026, Biobús 2016, espera histórica
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/penquistas-eligieron-al-campanil-como-la-imagen-de-la-primera-tarjeta-de-pago-electronico-del-transporte-publico/">
            Radio UdeC, Resultado consulta: Campanil UdeC
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Comparación con Bip!, Bipay y Antofagasta">
        <DataTable columns={['Aspecto', 'BusPay · Concepción', 'Bip! Santiago', 'Bipay · Temuco', 'Antofagasta Conectado']}>
          <tr>
            <td className="px-3 py-2 font-medium">Partida</td>
            <td className="px-3 py-2">Marcha blanca 1-dic-2026</td>
            <td className="px-3 py-2">2007</td>
            <td className="px-3 py-2">Sep 2025</td>
            <td className="px-3 py-2">Abr 2026</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Operador</td>
            <td className="px-3 py-2">Consorcio Buspay (Busmatick)</td>
            <td className="px-3 py-2">AFT, controlado por bancos</td>
            <td className="px-3 py-2">Bipay (BancoEstado, CompraQui)</td>
            <td className="px-3 py-2">Busmatick</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Integración con tren</td>
            <td className="px-3 py-2">Pendiente (Biotrén usa Conecta)</td>
            <td className="px-3 py-2">Sí (bus + Metro)</td>
            <td className="px-3 py-2">N/A</td>
            <td className="px-3 py-2">N/A</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Evasión</td>
            <td className="px-3 py-2">Sin dato</td>
            <td className="px-3 py-2">Histórica 20-30% en buses</td>
            <td className="px-3 py-2">1,6% (oct-2025)</td>
            <td className="px-3 py-2">Sin dato público</td>
          </tr>
        </DataTable>
        <p className="text-[12px]">
          Temuco, el referente más cercano, reportó 4 millones de
          validaciones en el primer mes y 1,6% de evasión
          (
          <SourceLink href="https://alertanoticiastemuco.cl/2025/10/11/pago-electronico-buses-temuco-padre-las-casas-4m-validaciones/">
            Alerta Temuco · 11-oct-2025
          </SourceLink>
          ). Bip! nunca fue interoperable con el Gran Concepción.
        </p>
        <Sources>
          <SourceLink href="https://antofagasta.busmatick.com/">
            antofagasta.busmatick.com, Portal del sistema en Antofagasta
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Riesgos e impacto en operadores">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <strong>Fin del corte de boleto.</strong> Alejandro
            Riquelme (taxibuses): &ldquo;vamos a transparentar la
            recaudación real de los buses&rdquo;
            (
            <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
              DF · 2026
            </SourceLink>
            ). Menos efectivo reduce el incentivo al robo en zonas como
            Candelaria y Boca Sur, y apunta a contratos con sueldo fijo.
          </li>
          <li>
            <strong>Datos por línea, hora y paradero</strong> para la
            DTPR y el ranking de cumplimiento del perímetro.
          </li>
          <li>
            <strong>Liquidación opaca.</strong> El Consorcio recauda y
            liquida a la vez; no hay un equivalente a la AFT de
            Santiago. Sin plazos ni comisión publicados.
          </li>
          <li>
            <strong>Validador caído y buses sin validador:</strong> sin
            norma pública. Es la principal fuente de fricción reportada
            en Temuco.
          </li>
          <li>
            <strong>Brecha digital en adulto mayor.</strong> La entrega
            gratuita de 29.000 tarjetas (14.500 estudiantes y 14.500
            adultos mayores) cubre solo una parte.
          </li>
          <li>
            <strong>Dos tarjetas paralelas</strong> (Bipay en
            Temuco, Chillán y Valdivia; Busmatick en el Gran
            Concepción) sin interoperabilidad.
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://www.tvu.cl/prensa/2026/02/26/transporte-publico-del-gran-concepcion-prepara-salto-digital-2-mil-maquinas-operaran-con-pago-electronico.html">
            TVU · 26-feb-2026, 2.000 validadores
          </SourceLink>
          <SourceLink href="https://www.elmostrador.cl/datos-utiles/2026/03/17/nuevo-sistema-de-pago-en-transporte-de-concepcion-en-que-comunas-se-implementara/">
            El Mostrador · 17-mar-2026, Comunas, centros de atención, puntos de recarga
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Cobertura del visor">
        <p>
          El visor no muestra hoy datos de BusPay. Las capas previstas
          (insignia &ldquo;acepta BusPay&rdquo; en las rutas del
          perímetro, centros de atención y comercios de recarga)
          dependen de que la DTPR o el operador publiquen datos
          abiertos.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Razón social, RUT y socios del Consorcio Buspay.</li>
          <li>Firma del contrato, plazo y monto total.</li>
          <li>ID de licitación en MercadoPublico.cl y las 5 oferentes no adjudicadas.</li>
          <li>Comunas efectivas: 9 en prensa reciente vs 11 en Subtrans (Coronel y Lota).</li>
          <li>Esquema de liquidación a operadores.</li>
          <li>Tarifas rebajadas (TNE y adulto mayor) reconfirmadas con el operador.</li>
          <li>Diferencial tarjeta vs efectivo, transbordo y integración con Biotrén.</li>
          <li>Conducta ante validador caído y monto de multas por evasión.</li>
          <li>Recarga mínima y máxima, saldo máximo y reembolso por pérdida.</li>
          <li>Texto del decreto de adjudicación.</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li><a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className={LINK}>Perímetro de Exclusión del Gran Concepción 2024</a></li>
          <li><a href="/wiki/perimetro-exclusion-tome" className={LINK}>Perímetro de Exclusión de Tomé</a></li>
          <li><a href="/wiki/ruta-201-santa-juana" className={LINK}>Ruta 201 Santa Juana</a></li>
          <li><a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a></li>
          <li><a href="/wiki/biotren" className={LINK}>Biotrén</a></li>
          <li><a href="/wiki/concepcion-florida" className={LINK}>Concepción ↔ Florida</a></li>
          <li><a href="/wiki/sobre-este-wiki" className={LINK}>Sobre este wiki</a></li>
        </ul>
        <p className="text-[12px]">
          Para aportar un dato (ID de licitación, razón social, red de
          recarga):{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/buspay.tsx">
            pull request en GitHub
          </SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
