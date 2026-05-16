// BusPay · pago electrónico del Gran Concepción 2026.
// Sistema de recaudo adjudicado al Consorcio Buspay (operador técnico
// Busmatick) por el MTT el 28-ene-2026, visado por Contraloría 30-ene
// y con marcha blanca proyectada para Q3 2026. Cubre 11 comunas (PE
// Gran Concepción + PE Tomé + Coronel-Lota + Santa Juana). Pendientes
// principales en banners: razón social y composición del Consorcio,
// identidad completa de las 6 oferentes, plazo y monto agregado del
// contrato, esquema de liquidación a operadores, integración con
// Conecta del Biotrén y conducta del sistema ante validador caído.

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function BusPay2026() {
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
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Cierra una deuda histórica de ~20 años.</strong>{' '}
            Santiago tiene Bip! desde 2007. Concepción intentó el
            piloto "Biobús" en 2016 con más de{' '}
            <strong>50.000 tarjetas</strong> repartidas sin que el
            sistema llegara a operar
            (
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/29/pago-con-tarjeta-en-buses-empresa-que-opera-en-transantiago-espera-participar-en-licitacion-en-la-zona.html">
              DC · 29-nov-2024
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Integra regímenes distintos en un solo medio.</strong>{' '}
            PE Gran Concepción (7 comunas), PE Tomé (1), regulación
            especial Coronel-Lota (Res. Ex. 457/2012-2013 — PE formal
            en bases a jul-2025) y la 201 Santa Juana, primer servicio
            rural de Chile con pago electrónico
            (
            <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
              Subtrans · 30-ene-2026
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Materializa el compromiso seguridad-trabajo.</strong>{' '}
            Eliminar efectivo reduce robos en zonas vulnerables
            (Candelaria, Boca Sur) y termina con el "corte de boleto",
            empujando a relaciones laborales formales
            (
            <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
              DF · 2026
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
          2026, la única gran ciudad sin pago electrónico en sus buses
          urbanos. El Biotrén sí lo tenía (tarjeta Biotrén desde 2005,
          hoy <strong>Conecta</strong> desde 2023)
          (
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · transporte público Gran Concepción
          </SourceLink>
          ).
        </p>
        <Timeline
          items={[
            {
              date: '2005',
              event: <><strong>Tarjeta Biotrén</strong>. Primera tarjeta sin contacto del Gran Concepción (L1 y luego L2). Usable en buses <em>Biobús</em> alimentadores hasta 2019.</>,
              source: { href: 'https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '2016',
              event: <><strong>Piloto Biobús — fallido</strong>. Se repartieron más de <strong>50.000 tarjetas</strong> pero la licitación 2002 no obligaba a los operadores a instalar validadores y los acuerdos voluntarios no prosperaron.</>,
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/29/pago-con-tarjeta-en-buses-empresa-que-opera-en-transantiago-espera-participar-en-licitacion-en-la-zona.html', label: 'Diario Concepción · 29-nov-2024' },
            },
            {
              date: '2023',
              event: <>Tarjeta Biotrén reemplazada por <strong>Conecta</strong>, único medio electrónico de transporte público del Gran Concepción hasta 2026.</>,
              source: { href: 'https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '1-ene-2024',
              event: <>Entra en vigor el <strong>Perímetro de Exclusión del Gran Concepción</strong> (Ley 18.696 art. 3°), que incluye obligación contractual de pago electrónico.</>,
              source: { href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/', label: 'DPR Biobío · 3-ene-2024' },
            },
            {
              date: '29-nov-2024',
              event: <><strong>Sonda manifiesta interés</strong> vía Marco Ossandón (Smart Cities Chile). Subsecretario Daza confirma diciembre 2025 como meta.</>,
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/29/pago-con-tarjeta-en-buses-empresa-que-opera-en-transantiago-espera-participar-en-licitacion-en-la-zona.html', label: 'Diario Concepción · 29-nov-2024' },
            },
            {
              date: '23-sep-2025',
              event: <>Cierre de licitación: MTT recibe <strong>6 ofertas</strong> para 11 comunas. Comisión Evaluadora DTPR certifica documentos.</>,
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html', label: 'Diario Concepción · 23-sep-2025' },
            },
            {
              date: '23-dic-2025 → 12-ene-2026',
              event: <><strong>Consulta ciudadana</strong> del diseño de la tarjeta: puente ferroviario, La Tortuga o Campanil UdeC. Voto vía @mttbiobio.</>,
              source: { href: 'https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/', label: 'Subtrans · 23-dic-2025' },
            },
            {
              date: '28-ene-2026',
              event: <><strong>Adjudicación al Consorcio Buspay</strong>. ~$750 millones/año, 1.800 validadores, tarifa $580 inalterada.</>,
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
            {
              date: '30-ene-2026',
              event: <>MTT/Subtrans confirma adjudicación y <strong>visa de Contraloría</strong>. Resultado consulta: <strong>Campanil UdeC</strong>.</>,
              source: { href: 'https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/', label: 'Subtrans · 30-ene-2026' },
            },
            {
              date: '27-feb-2026',
              event: <>Reunión técnica con taxibuses. Asisten subsecretario Daza, SEREMI Hugo Cautivo (titular desde 28-nov-2025) y <strong>Hollman Suárez</strong> (director Busmatick). Tema: instalación en flota de ~2.000 buses.</>,
              source: { href: 'https://www.radioudec.cl/empresa-a-cargo-del-pago-electronico-se-reune-con-operadores-del-transporte-publico-del-gran-concepcion/', label: 'Radio UdeC · 27-feb-2026' },
            },
            {
              date: 'Abr-may 2026 (proyectado)',
              event: 'Instalación de validadores a bordo.',
              source: { href: 'https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira', label: 'Diario Financiero' },
            },
            {
              date: 'Q3 2026 (proyectado)',
              event: <><strong>Marcha blanca</strong> (~3 meses de coexistencia efectivo + BusPay).</>,
              source: { href: 'https://revistanos.cl/pago-electronico-llegara-al-transporte-publico-del-gran-concepcion-el-tercer-trimestre-de-2026/', label: 'Revista Nos' },
            },
            {
              date: 'Fin de 2026 (proyectado)',
              event: <>Régimen <strong>100% electrónico</strong> (Jorge Daza). Fecha original Q2 2026, postergada.</>,
              source: { href: 'https://www.saladeprensa.cl/alcanzara-a-estar-listo-en-2026-pago-electronico-en-el-gran-concepcion-sufre-nuevo-atraso/', label: 'Sala de Prensa' },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Bip! Santiago nunca tuvo interoperabilidad con el Gran
          Concepción: opera bajo AFT y un esquema contractual de la
          RM, no extrapolable sin un proceso DTPR propio (que recién
          se hizo en 2025-2026 en el Biobío).
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
        <PendingBanner>
          <strong>ID exacto de la licitación en MercadoPublico.cl
          pendiente</strong> (base: Ley 18.696 art. 3°, vía PE).
          Identidad de las 5 oferentes derrotadas también pendiente
          (Sonda confirmada como interesada vía Marco Ossandón en
          nov-2024, no como oferente formal). Cierre por Ley de
          Transparencia.
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
        <KeyValueList
          items={[
            ['Marca del sistema', 'BusPay'],
            ['Razón social adjudicada', 'Consorcio Buspay (composición societaria, RUT y registro mercantil pendientes en fuente abierta)'],
            ['Operador técnico', 'Busmatick — antecedente operacional en Antofagasta Conectado (Antofagasta, Calama, Tocopilla). Experiencia previa en Europa, América Latina y el Caribe.'],
            ['Director identificado', 'Hollman Suárez (reunión técnica 27-feb-2026)'],
            ['URL del operador Antofagasta', 'antofagasta.busmatick.com'],
          ]}
        />
        <p className="text-[12px]">
          El despliegue replica el libreto de Antofagasta: tarjeta
          dedicada (adulto, AM, TNE), tarjetas bancarias contactless,
          QR por celular y <strong>tres meses de marcha blanca</strong>{' '}
          (
          <SourceLink href="https://dtpr.gob.cl/implementacion-del-sistema-de-pago-electronico-antofagasta-conectado/">
            DTPR · Antofagasta Conectado
          </SourceLink>
          ).
        </p>
        <PendingBanner>
          <strong>Composición societaria del Consorcio Buspay
          pendiente.</strong> Sin publicación abierta del RUT, socios
          fundadores ni forma jurídica (¿SpA? ¿joint venture
          Busmatick + contraparte chilena?). Vía de cierre:
          expediente DTPR.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.radioudec.cl/empresa-a-cargo-del-pago-electronico-se-reune-con-operadores-del-transporte-publico-del-gran-concepcion/">
            Radio UdeC · 27-feb-2026 — Reunión Busmatick / Hollman Suárez / operadores
          </SourceLink>
          <SourceLink href="https://antofagasta.busmatick.com/">
            antofagasta.busmatick.com — Portal del sistema en Antofagasta
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura — 11 comunas, tres regímenes">
        <p>
          Cuatro regímenes unificados en un solo medio de pago:
          Perímetro Gran Concepción (7 comunas), Perímetro Tomé,
          regulación especial Coronel-Lota (Res. Ex. 457 MTT,
          2012-2013 — PE formal en licitación, no vigente al cierre
          2025) y la licitación rural Santa Juana
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
                <td className="px-3 py-2 text-muted-foreground">Urbanas 36 UN (10A, 11, 12, 17M, 18, 22, 30B/C/E, 31F, 50YP, 57Y, 62H, 80, 81…)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Talcahuano · Hualpén</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">Urbanas + 57Y, 62H · Línea 02 Talcahuano-Hualpén y costeros</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">San Pedro de la Paz</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">UN23 (San Pedro del Mar), UN24 (San Remo) y margen sur</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Chiguayante · Hualqui</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">UN17 (17M/17S) · servicios sur-este margen del Biobío</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Penco</td>
                <td className="px-3 py-2">PE Gran Concepción 2024</td>
                <td className="px-3 py-2 text-muted-foreground">UN31/UN32 (Ruta del Mar), 17M Penco centro, 31F Lirquén</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tomé</td>
                <td className="px-3 py-2">PE Tomé (decreto jul-2016, operativo mar-2022)</td>
                <td className="px-3 py-2 text-muted-foreground">401 / 411 / 421 Concepción-Penco-Tomé-Dichato (Transportes Tomé SpA) · ver <a href="/wiki/concepcion-tome" className="underline underline-offset-2">artículo</a></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Coronel · Lota</td>
                <td className="px-3 py-2">Regulación especial (Res. Ex. 457 MTT 2012-2013 — PE formal en licitación, no vigente)</td>
                <td className="px-3 py-2 text-muted-foreground">Operadores locales (Las Galaxias, Buses J. Ewert, etc.)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Santa Juana</td>
                <td className="px-3 py-2">Licitación DTPR ELC0007 · Ley 20.378 art. 4°</td>
                <td className="px-3 py-2 text-muted-foreground">201 y 201 AU (Soc. Transporte Pasajeros Santa Juana SpA) · <strong>primer servicio rural con pago electrónico en Chile</strong> · ver <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">artículo</a></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          <strong>NO en BusPay:</strong>{' '}
          <a href="/wiki/biotren" className="underline underline-offset-2">Biotrén</a>{' '}
          (sigue con Conecta), corredor{' '}
          <a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción-Florida</a>
          , Concepción-Yumbel y El Pimentón (operadores privados fuera
          del Perímetro). Integración Biotrén ↔ BusPay no confirmada.
        </p>
      </Section>

      <Section title="Funcionamiento técnico">
        <p>
          Recaudo de múltiples medios sobre validadores embarcados. No
          es tarjeta única obligatoria — el usuario elige el medio
          (
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026
          </SourceLink>
          ).
        </p>
        <KeyValueList
          items={[
            ['Tarjeta dedicada BusPay', 'Sin contacto (NFC), diseño Campanil UdeC. Costo ~$1.550 (El Mostrador · 17-mar-2026). Versiones adulto, AM y TNE.'],
            ['Tarjetas bancarias', 'Pago contactless directo (débito o crédito Visa/Mastercard) — mismo gesto que el Biotrén desde nov-2024.'],
            ['Celular (QR / NFC)', 'Equivalente a Bipay y Antofagasta Conectado.'],
            ['TNE', 'Billetera electrónica con tarifa $190 (~33%). Coordinación JUNAEB.'],
            ['Tarjeta AM', 'Tarifa $290 (~50%). Coordinación SENAMA.'],
            ['Efectivo', 'Aceptado durante la marcha blanca Q3 2026, eliminado a fin de año (proyectado).'],
          ]}
        />
        <PendingBanner>
          <strong>Comportamiento ante validador caído: no
          documentado.</strong> ¿Cobro de emergencia en efectivo?
          ¿Tarjeta supervisora? ¿Bus fuera de operación hasta
          arreglarse? Respuesta central para la marcha blanca y no
          publicada.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
            Diario Financiero · 2026 — Funciones, medios de pago, costos
          </SourceLink>
          <SourceLink href="https://www.elmostrador.cl/datos-utiles/2026/03/17/nuevo-sistema-de-pago-en-transporte-de-concepcion-en-que-comunas-se-implementara/">
            El Mostrador · 17-mar-2026 — Precio tarjeta ~$1.550
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/penquistas-eligieron-al-campanil-como-la-imagen-de-la-primera-tarjeta-de-pago-electronico-del-transporte-publico/">
            Radio UdeC — Resultado consulta: Campanil UdeC
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Modelo tarifario">
        <p>
          A diferencia de Bip! Santiago (que tuvo años con diferencial
          tarjeta/efectivo explícito), BusPay <strong>no anuncia
          descuento</strong> por usar tarjeta vs efectivo. La tarifa
          adulto sigue en $580 con cualquier medio — el costo lo
          absorbe el Estado vía el subsidio ~$750 millones/año
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
          La tarifa del Perímetro sigue bajo polinomio (diésel +
          neumático + bus + mano de obra). Servicios fuera del PE
          Gran Concepción mantienen tarifa propia: 201 Santa Juana
          $1.000, 401/411/421 Tomé $780-$830.
        </p>
        <PendingBanner>
          <strong>Integración tarifaria pendiente.</strong>{' '}
          ¿Transbordo gratuito entre buses? ¿Integración bus ↔
          Biotrén con tarifa combinada? ¿Saldo monedero o cobro por
          viaje? Una integración bus ↔ tren sería innovación — ningún
          sistema regional de Chile la tiene hoy salvo parcialmente
          Antofagasta Conectado.
        </PendingBanner>
      </Section>

      <Section title="Despliegue — cronograma">
        <p className="text-[12px]">
          Cronograma detallado en la Timeline. <strong>Volumen del
          retrofit:</strong> 1.800-2.000 validadores en 11 comunas
          (1.800 en BioBioChile/DF, ~2.000 en TVU y reunión técnica
          27-feb-2026 — la diferencia probablemente corresponde a
          flota efectiva más reserva).
        </p>
        <PendingBanner>
          <strong>Buses sin instalación a tiempo: no documentado.</strong>{' '}
          En Antofagasta el modelo fue instalar la totalidad antes de
          la marcha blanca. Si se replica, todo bus sin validador
          queda fuera de operación: incentivo brutal a cooperar, pero
          riesgo de "buses fantasma" si el calendario se atrasa.
        </PendingBanner>
      </Section>

      <Section title="Recarga y atención al cliente">
        <KeyValueList
          items={[
            ['Centros de Atención al Usuario (CAU)', '5: Concepción, San Pedro de la Paz, Talcahuano, Tomé y Lota (Subtrans · 30-ene-2026)'],
            ['Puntos físicos de recarga', '~500 con comercio minorista (modelo Antofagasta) — densidad ~2.000 hab./punto, comparable a Bipay Temuco'],
            ['Portal web + app móvil', 'Consulta saldo, historial, bloqueo por extravío, billetera digital con QR'],
            ['Call center', 'Mesa de ayuda telefónica (Sala de Prensa)'],
            ['Tarjetas gratis iniciales', '~29.000: 14.500 estudiantes (JUNAEB) + 14.500 AM (Sala de Prensa)'],
            ['Precio tarjeta adulto', '~$1.550 (El Mostrador · 17-mar-2026)'],
          ]}
        />
        <PendingBanner>
          <strong>Red minorista de recarga pendiente.</strong> No está
          publicado si será supermercados, BancoEstado ServiEstado,
          farmacias, kioscos o CompraQui. Tampoco el monto mínimo /
          máximo de recarga ni saldo máximo acumulable.
        </PendingBanner>
      </Section>

      <Section title="Comparación con BIP! Santiago y RED Movilidad">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Aspecto</th>
                <th className="px-3 py-2 font-medium">BusPay · Concepción 2026</th>
                <th className="px-3 py-2 font-medium">Bip! Santiago</th>
                <th className="px-3 py-2 font-medium">Bipay · Temuco 2025</th>
                <th className="px-3 py-2 font-medium">Antofagasta Conectado 2026</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Partida</td>
                <td className="px-3 py-2">2026 (marcha blanca Q3)</td>
                <td className="px-3 py-2">2007</td>
                <td className="px-3 py-2">Sep 2025</td>
                <td className="px-3 py-2">Abr 2026</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Operador</td>
                <td className="px-3 py-2">Consorcio Buspay (Busmatick)</td>
                <td className="px-3 py-2">AFT — controlado por bancos</td>
                <td className="px-3 py-2">Bipay (BancoEstado · CompraQui)</td>
                <td className="px-3 py-2">Busmatick</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Cobertura</td>
                <td className="px-3 py-2">11 comunas · 3 regímenes</td>
                <td className="px-3 py-2">RM · Metro + buses + Metrotren</td>
                <td className="px-3 py-2">2 comunas</td>
                <td className="px-3 py-2">3 comunas</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Integración con tren</td>
                <td className="px-3 py-2">Pendiente (Biotrén usa Conecta)</td>
                <td className="px-3 py-2">Sí (bus + Metro)</td>
                <td className="px-3 py-2">N/A</td>
                <td className="px-3 py-2">N/A</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Evasión post-impl.</td>
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2">Histórica 20-30% en buses</td>
                <td className="px-3 py-2">1,6% (3.000+ pax fiscalizados oct-2025)</td>
                <td className="px-3 py-2">Sin dato público</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px]">
          Temuco es el referente más cercano: 4 millones de validaciones
          en el primer mes y 1,6% de evasión declarada
          (
          <SourceLink href="https://alertanoticiastemuco.cl/2025/10/11/pago-electronico-buses-temuco-padre-las-casas-4m-validaciones/">
            Alerta Temuco · 11-oct-2025
          </SourceLink>
          ). Riesgos heredados de Bip! recurrentes en Antofagasta y
          Temuco: saldos bloqueados por errores del validador, atención
          al cliente saturada en la primera semana, buses con validador
          caído que igual operan, y opacidad del backoffice sobre la
          liquidación a operadores.
        </p>
      </Section>

      <Section title="Cobertura del visor">
        <p>
          El visor de <code className="font-mono">conce.patagua.dev</code>{' '}
          no muestra hoy información de BusPay (sistema no operativo).
          Capas previstas a partir de Q3 2026, condicionadas a que la
          DTPR/operador publique datasets abiertos:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>Badge "Acepta BusPay" en sidebar de rutas urbanas del PE Gran Concepción.</li>
          <li>Banner explicativo en rutas fuera del PE (Florida, Yumbel, El Pimentón) que mantienen efectivo y tarifa libre.</li>
          <li>Capa overlay con los 5 CAU y los ~500 puntos de recarga (filtrables por tipo de comercio).</li>
          <li>Integración con 201 Santa Juana, 401/411/421 Tomé y servicios Coronel-Lota, que comparten medio de pago.</li>
        </ul>
      </Section>

      <Section title="Riesgos y preguntas abiertas">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <strong>Cronograma optimista.</strong> Meta original Q2
            2026, postergada a fin de 2026. Entre adjudicación
            (28-ene) y reunión técnica (27-feb) pasó un mes; quedan
            ~4 meses para retrofit, capacitación, CAU y red de recarga
            en más comunas y más flota que en Antofagasta.
          </li>
          <li>
            <strong>Conducta ante validador caído sin documentar.</strong>{' '}
            ¿Tarifa de respaldo en efectivo durante la marcha blanca?
            ¿Reembolso? Principal fuente de fricción registrada en
            Bipay Temuco al inicio.
          </li>
          <li>
            <strong>Float y liquidación a operadores.</strong> ¿Plazos
            y comisión? ¿Quién retiene el saldo no ejecutado? El
            Consorcio Buspay es recaudador y liquidador a la vez — no
            hay AFT equivalente, arquitectura no probada en metrópoli
            de este tamaño.
          </li>
          <li>
            <strong>Brecha digital AM.</strong> La entrega inicial de
            29.000 tarjetas (14.500 estudiantes + 14.500 AM) atiende
            parte del problema, pero la población AM del Gran
            Concepción es mayor (estimación 100.000+).
          </li>
          <li>
            <strong>Sin integración Biotrén ↔ BusPay confirmada.</strong>{' '}
            Conecta (EFE) y BusPay son sistemas paralelos. Una tarifa
            combinada bus + tren requeriría acuerdo bilateral
            EFE-Buspay no anunciado.
          </li>
          <li>
            <strong>Posible asimetría con Bipay nacional.</strong>{' '}
            Bipay (BancoEstado) opera en Temuco, Chillán, Valdivia.
            El Gran Concepción adjudicó a Busmatick — riesgo de dos
            tarjetas paralelas sin interoperabilidad en el sur de
            Chile.
          </li>
        </ul>
      </Section>

      <Section title="Impacto en operadores">
        <p>
          Para los 35 operadores del PE Gran Concepción + Transportes
          Tomé + Soc. Santa Juana SpA + operadores Coronel-Lota,
          BusPay es un cambio estructural comparable al paso del
          régimen 2002 al Perímetro:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <strong>Fin del "corte de boleto".</strong> Desaparece el
            conflicto chofer-pasajero por vuelto, billete falso o
            tarifa estudiante. Alejandro Riquelme (Asociación
            Gremial de Taxibuses): "vamos a transparentar la
            recaudación real de los buses"
            (
            <SourceLink href="https://www.df.cl/regiones/biobio/empresas/nuevo-pago-electronico-en-transporte-publico-del-gran-concepcion-reducira">
              DF · 2026
            </SourceLink>
            ).
          </li>
          <li>
            <strong>Menos incentivo al robo.</strong> El subsecretario
            Daza vincula la medida a zonas como Candelaria (San Pedro)
            y Boca Sur.
          </li>
          <li>
            <strong>Pago vía liquidación periódica.</strong> El
            operador recibe del Consorcio Buspay una liquidación
            periódica — mecanismo y plazo pendientes.
          </li>
          <li>
            <strong>Datos auditables.</strong> DTPR y MTT tendrán por
            primera vez demanda fina por línea, hora y paradero,
            alimentando el ranking de cumplimiento del Perímetro.
          </li>
          <li>
            <strong>Formalización laboral.</strong> Fin del
            "chofer-cobrador", contratos con sueldo fijo + bonos
            (compromiso MTT-gremios desde nov-2023).
          </li>
        </ul>
        <PendingBanner>
          <strong>Esquema de liquidación pendiente.</strong> ¿Semanal,
          quincenal, con anticipo? ¿El Consorcio cobra comisión sobre
          la recaudación (modelo AFT) o solo el fee fijo del subsidio
          $750M anuales? Lo más opaco y relevante para los operadores.
        </PendingBanner>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">Perímetro de Exclusión del Gran Concepción 2024</a>{' '}— el régimen del que BusPay es la pieza tecnológica que faltaba.
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201 Santa Juana</a>{' '}— primer servicio rural de Chile con pago electrónico (licitación DTPR ELC0007 / Ley 20.378, NO bajo PE).
          </li>
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a>{' '}— corredor norte (401/411/421) entra a BusPay vía el PE Tomé (decreto MTT jul-2016).
          </li>
          <li>
            <a href="/wiki/biotren" className="underline underline-offset-2">Biotrén</a>{' '}— el modo masivo NO está en BusPay; sigue con Conecta. Integración bus ↔ tren pendiente.
          </li>
          <li>
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción ↔ Florida</a>{' '}— fuera de BusPay (operadores privados sin régimen formal, tarifa libre).
          </li>
          <li>
            <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">Sobre este wiki</a>{' '}— modelo editorial.
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
          Vías de cierre: Ley de Transparencia 20.285 a la DTPR Biobío
          y al MTT por el expediente íntegro; consulta directa al
          Consorcio Buspay / Busmatick; revisión del padrón en
          MercadoPublico.cl.
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
            Radio UdeC · 27-feb-2026 — Reunión Busmatick/operadores
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/penquistas-eligieron-al-campanil-como-la-imagen-de-la-primera-tarjeta-de-pago-electronico-del-transporte-publico/">
            Radio UdeC — Resultado consulta: Campanil UdeC
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
          ID de licitación en MercadoPublico, razón social y RUT del
          Consorcio Buspay, texto del decreto MTT de adjudicación,
          red minorista de recarga o fotos de validadores instalados:
          pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/buspay.tsx">
            github.com/marcorojasb/conce.patagua.dev/.../buspay.tsx
          </SourceLink>
          .
        </p>
      </Section>
    </div>
  );
}
