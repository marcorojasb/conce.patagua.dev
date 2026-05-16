// Perímetro de Exclusión del Gran Concepción 2024 — columna vertebral
// conceptual del visor urbano.
//
// Es el régimen tarifario y operativo que reemplazó a la licitación 2002
// el 1-ene-2024 y bajo el cual operan hoy todas las líneas urbanas del
// feed GTFS Gran Concepción. Los otros artículos del wiki lo referencian
// sin desarrollarlo — este es el desarrollo.
//
// Cosas que están bien sostenidas con fuente primaria/secundaria:
// - Fecha de inicio (1-ene-2024) y cierre licitación 2002 (31-mar-2024)
// - 7 comunas cubiertas, 35-36 unidades de negocio, 33-35 empresas
// - Plazo del contrato (5 años, vence 31-dic-2028)
// - Tarifa adulto $560 (dic-2024) → $580 (23-feb-2025), escolar $190, AM $290
// - Polinomio de ajuste basado en diésel + neumáticos + bus + mano de obra
// - Acuerdo gremios 22-nov-2023 (Luis Quiroz, Alianza Gremial)
// - Caso línea 56 Base Naval fuera del perímetro (deudas laborales)
// - BusPay adjudicado al consorcio Buspay (28-ene-2026), $580 inalterable,
//   1.800 validadores en 11 comunas, marcha blanca Q3 2026
//
// Cosas pendientes y marcadas con PendingBanner:
// - Lista exacta de los 36 UN con su empresa adjudicada (Wikipedia ES
//   sólo lista líneas 02-90 del régimen 2002, no UN del 2024)
// - Número y texto del decreto MTT que adjudicó el perímetro 2024
//   (Wikipedia menciona Res. 1006/2017 como marco y Res. afecta 29/2023
//   visada por Contraloría en may-2023, no he validado el texto íntegro)
// - Razones sociales y RUT de los operadores
// - Tarifa estudiante TNE 2026 actualizada post-feb-2025

import {
  KeyValueList,
  OperatorTable,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function PerimetroExclusionGranConcepcion2024() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias y prensa
        regional.</strong> Existencia del régimen, fecha de inicio
        (1-ene-2024), cierre de la licitación 2002 (31-mar-2024), las 7
        comunas cubiertas, las 36 unidades de negocio, el plazo del
        contrato (vence 31-dic-2028), la tarifa adulto vigente desde
        23-feb-2025 ($580), el caso Base Naval excluido por deudas
        laborales y la adjudicación BusPay (28-ene-2026): todo con
        fuente. <strong>Pendientes</strong>: lista íntegra de UN con su
        operador adjudicado, RUT de cada empresa, número y texto exacto
        del decreto MTT que adjudicó el perímetro 2024, polinomio de
        ajuste tarifario en su forma matemática.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          El <strong>Perímetro de Exclusión del Gran Concepción</strong> es
          el régimen regulatorio bajo el cual operan, desde el{' '}
          <strong>1 de enero de 2024</strong>, todos los buses urbanos del
          área metropolitana. Lo crea el Ministerio de Transportes y
          Telecomunicaciones (MTT) usando la facultad que le entrega el{' '}
          <strong>artículo 3°</strong> del DFL N° 343 / Ley 18.696
          (régimen de subsidio al transporte mayor), que le permite
          definir un área geográfica y, dentro de ella, imponer{' '}
          <em>"tarifas, estructuras tarifarias, programación vial,
          regularidad, frecuencia, antigüedad de los vehículos,
          requisitos tecnológicos o administrativos"</em>{' '}
          (
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN Ley Chile
          </SourceLink>
          ).
        </p>
        <p>
          Reemplazó a la <strong>licitación de 2002</strong>, que rigió
          22 años (operativa hasta el <strong>31 de marzo de 2024</strong>)
          y se cayó por obsolescencia: contratos sin métricas de
          calidad, fiscalización débil, sin pago electrónico, sin GPS
          obligatorio.
        </p>
        <p>
          Para el visor de <code className="font-mono">conce.patagua.dev</code>,
          este perímetro es <strong>la columna vertebral</strong>: define
          qué líneas son urbanas del Gran Concepción (las que aparecen
          en el feed GTFS oficial), qué tarifa pagan, qué operador las
          corre y bajo qué reglas. Los artículos hermanos del wiki —
          {' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          ,{' '}
          <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
            Ruta 201 Santa Juana
          </a>
          ,{' '}
          <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
            Concepción ↔ Florida (corredor de El Pimentón)
          </a>
          {' '}— lo nombran sin desarrollarlo. Aquí está el desarrollo.
        </p>
      </Section>

      <Section title="Distinción regulatoria: tres perímetros en el Biobío">
        <p>
          En la Región del Biobío conviven hoy <strong>tres perímetros
          de exclusión</strong> y <strong>una licitación pública</strong>.
          Importante para no confundirlos:
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Régimen</th>
                <th className="px-3 py-2 font-medium">Comunas</th>
                <th className="px-3 py-2 font-medium">Operadores</th>
                <th className="px-3 py-2 font-medium">Vigencia</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">PE Gran Concepción (este artículo)</td>
                <td className="px-3 py-2">Concepción, Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante, Penco, Hualqui (7)</td>
                <td className="px-3 py-2">~35 empresas en 36 UN</td>
                <td className="px-3 py-2">1-ene-2024 → 31-dic-2028 (renovable)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">PE Tomé</td>
                <td className="px-3 py-2">Tomé y Dichato (corredor 401/411/421 desde Concepción)</td>
                <td className="px-3 py-2">Operador único Transportes Tomé</td>
                <td className="px-3 py-2">Decreto jul-2016 · operativo 10-mar-2022</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Regulación especial Coronel-Lota</td>
                <td className="px-3 py-2">Coronel y Lota</td>
                <td className="px-3 py-2">Operadores locales (Las Galaxias, Buses J. Ewert, etc.)</td>
                <td className="px-3 py-2">Resolución Exenta 457 MTT (2012-2013) — equivalente parcial a un PE, históricamente subfinanciado. El decreto formal de PE Coronel-Lota está en proceso de licitación (bases en Contraloría a jul-2025) y aún no vigente.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Licitación DTPR ELC0007</td>
                <td className="px-3 py-2">Santa Juana (única comuna)</td>
                <td className="px-3 py-2">Soc. Transporte Pasajeros Santa Juana SpA</td>
                <td className="px-3 py-2">Operativo 15-jul-2024 — primera licitación pública del Biobío en 10+ años</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          ¿Por qué Santa Juana NO entró al PE Gran Concepción y sí al
          régimen de licitación pública? Porque el corredor Santa Juana
          ↔ Concepción es <em>rural-urbano</em> (cruza la Ruta 156 /
          Ruta de la Madera) y opera bajo subsidio del{' '}
          <strong>artículo 4° de la Ley 20.378</strong>{' '}
          (
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN Ley 20.378
          </SourceLink>
          ), no del artículo 3° de la Ley 18.696. Son dos instrumentos
          legales distintos.
        </p>
        <p className="text-[12px] text-muted-foreground">
          ¿Por qué Tomé tiene perímetro propio? Por antecedencia: el
          decreto Tomé es de julio 2016 (ministro Andrés Gómez-Lobo,
          operativo 10-mar-2022), <em>anterior</em> al perímetro Gran
          Concepción, y el corredor norte tenía un único operador
          consolidable que el MTT prefirió mantener separado para no
          contaminar el calendario del régimen mayor.
        </p>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción (incluye PE Tomé y PE Coronel-Lota)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 20.378 (subsidio Zonas Aisladas, base de la licitación 201)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Historia: de la licitación 2002 al perímetro 2024">
        <p>
          La regulación moderna del transporte público del Gran Concepción
          empezó como respuesta paralela al Transantiago: en el año{' '}
          <strong>2000</strong> el MTT comenzó a diseñar el modelo de
          licitación regional, que se materializó en <strong>2002</strong>{' '}
          adjudicando contratos a 37 empresas. Operó 22 años bajo el
          mismo polinomio tarifario, hasta el cierre formal el{' '}
          <strong>31 de marzo de 2024</strong>, cuando llegó la última
          línea (la 22 San Pedro) al nuevo perímetro.
        </p>
        <Timeline
          items={[
            {
              date: '2000-2002',
              event: 'MTT diseña y adjudica la licitación de buses urbanos del Gran Concepción. Inicia con 37 empresas operadoras, contratos firmados bajo el régimen general de la Ley 18.696 más reglamentación específica.',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '2007-2008',
              event: 'Primer ajuste tarifario relevante post-Transantiago. La tarifa polinómica (diésel + neumático + bus + mano de obra) se aplica desde estos años de manera formalizada.',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '27-feb-2010',
              event: 'Terremoto y tsunami 27F. La operación se ve interrumpida por semanas en varios sectores costeros; varios buses dañados se retiran del sistema. La licitación 2002 sigue vigente pero con frecuencias mermadas durante meses.',
            },
            {
              date: '27-abr-2017',
              event: 'Resolución N° 1006 del MTT — marco normativo del perímetro de exclusión del Gran Concepción (base regulatoria que recién se ejecutó en 2024).',
              source: { href: 'https://www.mtt.gob.cl/wp-content/uploads/2017/10/Resex_1005.2017.pdf', label: 'MTT (norma adyacente)' },
            },
            {
              date: 'May-2023',
              event: 'Contraloría visa la Resolución Afecta N° 29/2023 del MTT, que aprueba el perímetro de exclusión del Gran Concepción y faculta la negociación directa con operadores existentes (art. 3°ter Ley 18.696).',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '22-nov-2023',
              event: 'Las cinco federaciones gremiales del Gran Concepción firman acuerdo con el MTT. Luis Quiroz, presidente de la Alianza Gremial de Transporte: "habían elementos laborales que estaban pendientes y pudimos subsanar". Comienza la firma escalonada de contratos.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2023/11/22/perimetro-de-exclusion-gremios-del-gran-concepcion-llegan-a-acuerdo-con-ministerio-de-transportes.shtml', label: 'BioBioChile · 22-nov-2023' },
            },
            {
              date: '1-ene-2024',
              event: 'Perímetro de Exclusión del Gran Concepción entra en vigor. Inicia con 30 empresas adheridas. SEREMI Héctor Silva anuncia GPS obligatorio, fiscalización online, ranking de cumplimiento.',
              source: { href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/', label: 'DPR Biobío · 3-ene-2024' },
            },
            {
              date: '2-feb-2024',
              event: 'Diario Concepción anuncia que la tarifa adulto subirá a $550 durante el primer trimestre 2024 — primer ajuste polinómico bajo el nuevo régimen.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/02/02/a-550-pesos-subira-la-tarifa-del-transporte-publico-en-el-gran-concepcion.html', label: 'Diario Concepción · 2-feb-2024' },
            },
            {
              date: '1-mar-2024',
              event: 'Se suman 11 empresas más al perímetro: Buses San Pedro del Mar (UN23), San Remo (UN24), Ruta Las Playas (UN30 y UN50), Ruta del Mar (UN31), Buses Ruta del Mar (UN32), Buses Mini Verde (UN41), Rengo Lientur (UN63), Buses Cóndor (UN65), Vía del Sol (UN81). Total: 33 empresas en 34 UN.',
              source: { href: 'https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html', label: 'TVU · 1-mar-2024' },
            },
            {
              date: '31-mar-2024',
              event: 'Caduca la licitación 2002. Última línea en migrar al perímetro: línea 22 San Pedro. Total: 35 líneas en 36 unidades de negocio. Línea 56 Base Naval queda fuera por deudas laborales (1,16% de la flota).',
              source: { href: 'https://hora12.cl/2024/04/01/35-lineas-de-buses-integradas-al-proceso-de-licitacion-en-el-gran-concepcion/', label: 'Hora12 · 1-abr-2024' },
            },
            {
              date: '9-dic-2024',
              event: 'Primer ajuste polinómico bajo el perímetro: adulto sube $10 a $560; estudiante $180; tercera edad $280.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/30/alza-en-el-transporte-del-gran-concepcion-en-cuanto-quedara-el-pasaje-y-cuando-sube.html', label: 'Diario Concepción · 30-nov-2024' },
            },
            {
              date: '23-feb-2025',
              event: 'Segundo ajuste polinómico: adulto $580, escolar $190, adulto mayor $290. SEREMI Patricio Fierro lo justifica con "la realidad de la economía familiar" y la fórmula del polinomio (diésel, dólar, IPC).',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html', label: 'Diario Concepción · 14-feb-2025' },
            },
            {
              date: '23-sep-2025',
              event: 'MTT recibe 6 ofertas para operar el sistema de pago electrónico (BusPay) en 11 comunas del Gran Concepción + Santa Juana + Tomé.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html', label: 'Diario Concepción · 23-sep-2025' },
            },
            {
              date: '28-ene-2026',
              event: 'MTT adjudica la operación de BusPay al Consorcio Buspay. Inversión estatal $750 millones/año. Cobertura 1.800 validadores en flota de 11 comunas. Tarifa $580 sin alteración.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
            {
              date: 'Q3 2026 (proyectado)',
              event: 'Marcha blanca BusPay con efectivo y tarjeta en paralelo. 100% pago electrónico esperado a fines de 2026.',
              source: { href: 'https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/', label: 'Subtrans · 2026' },
            },
            {
              date: '31-dic-2028',
              event: 'Vencimiento del primer ciclo del perímetro de exclusión (5 años). Renovable.',
            },
          ]}
        />
      </Section>

      <Section title="Cobertura geográfica">
        <p>
          El perímetro cubre <strong>siete comunas</strong> del área
          metropolitana de Concepción (AMC):
        </p>
        <KeyValueList
          items={[
            ['Concepción', 'Capital regional · centro de la red, terminales clave: Intermodal Concepción, Collao, Manuel Rodríguez'],
            ['Talcahuano', 'Puerto, Base Naval, barrios populares (Las Higueras, El Morro) y "los cerros" (zona alta históricamente sub-atendida)'],
            ['Hualpén', 'Comuna costera entre Talcahuano y Concepción, refinería ENAP, Lenga, Caleta Lenga'],
            ['San Pedro de la Paz', 'Margen sur del Biobío, Boca Sur, San Pedro de la Costa — terminal Biotrén Juan Pablo II y San Pedro'],
            ['Chiguayante', 'Río arriba del Biobío, comuna lineal sobre la ribera norte'],
            ['Penco', 'Norte del AMC, incluye distrito de Lirquén — terminal norte del Biotrén'],
            ['Hualqui', 'Río arriba en la margen sur, comuna interior pendiente de mejor frecuencia (zona de "refuerzo" según monitoreo Seremi)'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          <strong>Comunas del AMC que NO están en este perímetro:</strong>{' '}
          Tomé y Dichato (PE propio), Coronel y Lota (PE propio), Santa
          Juana (licitación pública DTPR ELC0007 bajo Ley 20.378),
          Florida (sin régimen — operadores privados + subsidios
          parciales por servicio).
        </p>
        <Sources>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/">
            DPR Biobío · 3-ene-2024 — Lista oficial de 7 comunas cubiertas
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/como-entender-el-perimetro-de-exclusion-del-transporte-publico-del-gran-concepcion/">
            Radio UdeC · explicador de comunas y régimen
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Unidades de negocio y operadores">
        <p>
          El perímetro divide al Gran Concepción en{' '}
          <strong>36 unidades de negocio (UN)</strong>, cada una con un
          conjunto de líneas asignadas a una empresa operadora. Hay 35
          empresas porque <strong>Ruta Las Playas</strong> tiene dos UN
          (30 y 50).
        </p>
        <p className="text-[12px] text-muted-foreground">
          Lo que sigue es la <strong>lista parcial conocida</strong>{' '}
          (operadores que la prensa o Wikipedia nombraron explícitamente).
          Una lista completa de los 36 UN con su empresa adjudicada
          requiere acceso al expediente DTPR — pendiente.
        </p>
        <OperatorTable
          rows={[
            {
              name: 'Buses Hualpensan',
              routes: 'Línea 02 (Talcahuano - Hualpén) · ex UN02 régimen 2002',
              terminal: 'Terminal Talcahuano',
              notes: 'Operador histórico hualpenino, traspasó al PE en la primera ola (ene-2024).',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia · licitados' },
            },
            {
              name: 'Vía Futuro',
              routes: 'Línea 11 · UN11',
              terminal: 'Concepción centro',
              notes: 'Una de las cinco federaciones gremiales firmantes nov-2023.',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Nueva Sotrapel',
              routes: 'Línea 12 · UN12',
              terminal: 'Pedro de Valdivia / Concepción',
              notes: 'Tradicional operador conocido por el recorrido Lonco — Concepción.',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Expresos Chiguayante',
              routes: 'Línea 17 · UN17 (servicios 17M / 17S al norte)',
              terminal: 'Chiguayante - Concepción - Penco',
              notes: 'El 17M aparece en el visor llegando hasta Penco centro.',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Buses Palomares',
              routes: 'Línea 18 · UN18',
              terminal: 'Palomares (Concepción norte)',
              notes: 'Conecta el populoso barrio Palomares con el centro.',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Buses San Pedro del Mar',
              routes: 'UN23',
              terminal: 'San Pedro de la Paz',
              notes: 'Adhirió en la segunda ola — operativo desde 1-mar-2024.',
              source: { href: 'https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html', label: 'TVU · 1-mar-2024' },
            },
            {
              name: 'San Remo',
              routes: 'UN24',
              terminal: 'San Pedro de la Paz',
              notes: 'Segunda ola (1-mar-2024).',
              source: { href: 'https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html', label: 'TVU · 1-mar-2024' },
            },
            {
              name: 'Ruta Las Playas',
              routes: 'UN30 y UN50 (única empresa con dos UN) · servicios 50YP reemplazaron a 57YP de la licitación 2002',
              terminal: 'Concepción - playas norte',
              notes: 'Adhirió 1-mar-2024. El renombre 57YP→50YP es ilustrativo de cómo el PE renumera servicios.',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Ruta del Mar / Buses Ruta del Mar',
              routes: 'UN31 y UN32 · línea 31F (Lirquén "Ruta del Mar")',
              terminal: 'Talcahuano - Concepción - Penco/Lirquén',
              notes: 'Dos razones sociales relacionadas. La 31F llega a Lirquén dentro del PE.',
              source: { href: 'https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html', label: 'TVU · 1-mar-2024' },
            },
            {
              name: 'Buses Mini Verde',
              routes: 'UN41',
              terminal: 'Pendiente',
              notes: 'Segunda ola (1-mar-2024).',
              source: { href: 'https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html', label: 'TVU · 1-mar-2024' },
            },
            {
              name: 'Buses Base Naval',
              routes: 'Línea 56 · NO está en el perímetro',
              terminal: 'Talcahuano - Base Naval',
              notes: 'Excluida en abr-2024 por deudas laborales pendientes. Representa el 1,16% de la flota. Otros operadores cubren su trazado mientras tanto. Estado posterior no verificado.',
              source: { href: 'https://hora12.cl/2024/04/01/35-lineas-de-buses-integradas-al-proceso-de-licitacion-en-el-gran-concepcion/', label: 'Hora12 · 1-abr-2024' },
            },
            {
              name: 'Transportes Denavi Sur',
              routes: 'Línea 57 · UN57 (servicios 57Y San Vicente ↔ Cosmito)',
              terminal: 'Talcahuano San Vicente',
              notes: 'Operador del eje San Vicente - Cosmito, cubre tramo industrial Talcahuano.',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Mi Expreso',
              routes: 'Línea 62 · UN62 (62H San Vicente ↔ Lirquén)',
              terminal: 'San Vicente - Lirquén',
              notes: 'Llega hasta Lirquén dentro del PE — el tramo Lirquén → Tomé ya es PE Tomé.',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Rengo Lientur',
              routes: 'UN63',
              terminal: 'Pendiente',
              notes: 'Segunda ola (1-mar-2024).',
              source: { href: 'https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html', label: 'TVU · 1-mar-2024' },
            },
            {
              name: 'Buses Cóndor',
              routes: 'UN65',
              terminal: 'Pendiente',
              notes: 'Segunda ola (1-mar-2024).',
              source: { href: 'https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html', label: 'TVU · 1-mar-2024' },
            },
            {
              name: 'Las Galaxias',
              routes: 'Línea 80 · UN80',
              terminal: 'Concepción',
              notes: 'Operador grande del corredor sur. Misma razón social tiene presencia también en la regulación especial Coronel-Lota (Res. Ex. 457 MTT, 2012-2013).',
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Vía del Sol',
              routes: 'UN81',
              terminal: 'Pendiente',
              notes: 'Segunda ola (1-mar-2024).',
              source: { href: 'https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html', label: 'TVU · 1-mar-2024' },
            },
            {
              name: 'Biobús (servicio especial)',
              routes: 'UNB0 (única UN con sufijo no numérico)',
              terminal: 'Conexión Biotrén - micro',
              notes: 'Servicio de alimentación al Biotrén. Diferenciada por categoría y tarifa especial.',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia · PE Gran Concepción' },
            },
          ]}
        />
        <PendingBanner>
          <strong>Lista completa de los 36 UN pendiente.</strong> Los
          operadores anteriores son los que la prensa nombró
          explícitamente; faltan ~18 UN cuyo nombre comercial y razón
          social no aparecen en fuentes secundarias accesibles. Vías de
          cierre: solicitud por Ley de Transparencia a DTPR Biobío del
          padrón vigente del perímetro, o consulta al expediente de la
          Resolución 29/2023 del MTT visada por Contraloría. Operadores
          mencionados informalmente en otros artículos del wiki
          (Movix, Vía Sur, Buses Conce) <em>no</em> aparecen en fuentes
          primarias revisadas — pendiente cotejo de nombre comercial vs
          razón social formal.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
            Wikipedia · Buses licitados Gran Concepción (estructura UN 2002 → 2024)
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html">
            TVU · 1-mar-2024 — 11 empresas se incorporan (lista de UN23, 24, 30, 31, 32, 41, 50, 63, 65, 81)
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2024/04/01/35-lineas-de-taxibuses-seran-parte-del-perimetro-de-exclusion-del-gran-concepcion.html">
            TVU · 1-abr-2024 — 35 líneas totales, Base Naval excluida
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifa y polinomio de ajuste">
        <p>
          El perímetro mantiene una <strong>tarifa fija a través de
          todas las líneas</strong> (a diferencia de servicios
          interurbanos donde varía por kilómetro). Tres categorías:
        </p>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Categoría</th>
                <th className="px-3 py-2 font-medium">Vigente desde 9-dic-2024</th>
                <th className="px-3 py-2 font-medium">Vigente desde 23-feb-2025</th>
                <th className="px-3 py-2 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 font-medium">Adulto</td>
                <td className="px-3 py-2 font-mono">$560</td>
                <td className="px-3 py-2 font-mono">$580</td>
                <td className="px-3 py-2 text-muted-foreground">Tarifa única en las 7 comunas</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Estudiante (TNE)</td>
                <td className="px-3 py-2 font-mono">$180</td>
                <td className="px-3 py-2 font-mono">$190</td>
                <td className="px-3 py-2 text-muted-foreground">~33% del adulto · Tarjeta Nacional Estudiantil</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Adulto mayor (60+)</td>
                <td className="px-3 py-2 font-mono">$280</td>
                <td className="px-3 py-2 font-mono">$290</td>
                <td className="px-3 py-2 text-muted-foreground">50% del adulto · acreditación con cédula</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px]">
          <strong>Polinomio de ajuste:</strong> heredado del régimen
          2002, la tarifa se reajusta por una fórmula que pondera el{' '}
          <strong>valor del diésel</strong>, el{' '}
          <strong>valor del neumático</strong>, el{' '}
          <strong>valor del bus</strong> y la{' '}
          <strong>mano de obra</strong>. El SEREMI Patricio Fierro
          (feb-2025) lo describió en prensa como una fórmula que
          considera "diésel, dólar, IPC, entre otros factores" — la
          forma matemática exacta del polinomio no está publicada en
          fuente abierta.
        </p>
        <PendingBanner>
          <strong>Forma matemática del polinomio pendiente.</strong> El
          contrato de cada UN incluye el polinomio como cláusula
          tarifaria, pero ni el MTT ni DTPR publican el coeficiente de
          cada variable. Disponible por Ley de Transparencia.
        </PendingBanner>
        <p className="text-[12px] text-muted-foreground">
          La línea 56 Base Naval, durante el período en que estuvo fuera
          del perímetro (post 1-abr-2024), pudo cobrar tarifa distinta —
          no documentado.
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/30/alza-en-el-transporte-del-gran-concepcion-en-cuanto-quedara-el-pasaje-y-cuando-sube.html">
            Diario Concepción · 30-nov-2024 — Tarifa $560 desde 9-dic-2024
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html">
            Diario Concepción · 14-feb-2025 — Tarifa $580 desde 23-feb-2025
          </SourceLink>
          <SourceLink href="https://www.canal9.cl/episodios/noticias/2025/02/24/pasaje-de-la-locomocion-colectiva-en-el-gran-concepcion-ya-es-de-580">
            Canal 9 · 24-feb-2025 — Confirmación tarifa $580 operativa
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
            Wikipedia · Estructura polinómica (diésel + neumático + bus + mano de obra)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="BusPay — pago electrónico 2026">
        <p>
          El perímetro contempla la migración al{' '}
          <strong>pago electrónico</strong> como uno de sus
          compromisos centrales. El sistema se conoce como{' '}
          <strong>BusPay</strong> y fue adjudicado al{' '}
          <strong>Consorcio Buspay</strong> el{' '}
          <strong>28 de enero de 2026</strong>. Ficha técnica completa
          en{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            BusPay 2026
          </a>
          .
        </p>
        <KeyValueList
          items={[
            ['Operador adjudicado', 'Consorcio Buspay (no confundir con la marca del sistema)'],
            ['Fecha adjudicación', '28 de enero de 2026'],
            ['Inversión estatal', '~$750 millones / año (mantenimiento operativo)'],
            ['Cobertura', '1.800 a 2.000 validadores en 11 comunas: las 7 del PE Gran Concepción + Tomé + Coronel + Lota + Santa Juana'],
            ['Medios de pago', 'Tarjeta bancaria contactless, código QR vía celular, TNE para estudiantes, tarjeta dedicada con diseño UdeC Campanil'],
            ['Tarifa', '$580 sin alteración — el sistema lo paga el Estado, no el pasajero'],
            ['Cronograma instalación', 'Abril-mayo 2026 instalación de validadores'],
            ['Marcha blanca', 'Tercer trimestre 2026 (Q3) — efectivo y tarjeta en paralelo'],
            ['Operación 100% electrónica', 'Proyectada para fines de 2026'],
            ['Diseño de tarjeta', 'Consulta ciudadana Subtrans · 3 opciones (puente ferroviario Biobío, Coliseo La Tortuga, Campanil UdeC). Resultado: Campanil UdeC.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          El sistema integra el régimen del Gran Concepción (PE 7
          comunas), el régimen Tomé (PE propio) y la licitación 201
          Santa Juana — los <strong>tres</strong> regímenes operan bajo
          el mismo medio de pago. BusPay sí incluye a Coronel y Lota,
          ampliando la cobertura más allá del PE Gran Concepción.
        </p>
        <Sources>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 — Adjudicación BusPay
          </SourceLink>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 2026 — Comunicado oficial
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html">
            Diario Concepción · 23-sep-2025 — Seis ofertas recibidas
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Consulta ciudadana diseño de tarjeta
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2026/02/26/transporte-publico-del-gran-concepcion-prepara-salto-digital-2-mil-maquinas-operaran-con-pago-electronico.html">
            TVU · 26-feb-2026 — 2.000 validadores y salto digital
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura del visor">
        <p>
          Para los efectos del visor de{' '}
          <code className="font-mono">conce.patagua.dev</code>, este
          perímetro <strong>define el universo de líneas urbanas</strong>{' '}
          que aparecen en el{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            feed GTFS Gran Concepción
          </a>
          :
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Sí están en el visor (líneas dentro del PE Gran Concepción)
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Todas las líneas urbanas del feed GTFS — códigos como{' '}
            <strong>10A, 11, 12, 17M, 18, 22, 30B/C/E, 31F, 50YP, 57Y,
            62H, 80, 81</strong> y todas las demás de las 36 UN
            adheridas. Tarifa $580 adulto, accesibles vía rutas urbanas
            del visor.
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Integradas como interurbanos al visor (perímetros vecinos)
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            El visor incluye selectivamente algunos servicios
            interurbanos integrados al ecosistema metropolitano:
          </p>
          <ul className="mt-1 ml-5 list-disc space-y-0.5 text-[12px]">
            <li>
              <strong>201 / 201 AU</strong> Santa Juana (licitación DTPR
              ELC0007 — NO del PE Gran Concepción) — ver{' '}
              <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
                artículo Ruta 201
              </a>
              .
            </li>
            <li>
              <strong>401 / 411 / 421</strong> Tomé (PE Tomé — NO del PE
              Gran Concepción) — ver{' '}
              <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
                artículo Concepción ↔ Tomé
              </a>
              .
            </li>
          </ul>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Estos servicios aparecen en el visor por su relevancia
            metropolitana aunque <strong>no compartan régimen</strong>{' '}
            con el PE Gran Concepción. La tarifa difiere ($1.000 la 201,
            $780-$830 las 401/411/421).
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            NO están en el visor (interurbanos sin régimen formal)
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Servicios privados sin perímetro ni licitación: Concepción ↔
            Florida (operadores Delsal, Nueva Libertadores, Biocosta,
            Trinidad; corredor coloquialmente "de El Pimentón") y
            Concepción ↔ Yumbel. Ver{' '}
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
              artículo Concepción ↔ Florida
            </a>
            .
          </p>
        </div>
      </Section>

      <Section title="Fiscalización y conflictos">
        <p>
          El perímetro entrega al MTT (vía SEREMI de Transportes Biobío
          y DTPR) un conjunto de herramientas que la licitación 2002 no
          tenía:
        </p>
        <KeyValueList
          items={[
            ['GPS online', 'Obligatorio en toda la flota — monitoreo continuo de posición'],
            ['Indicadores de servicio', 'Frecuencia, regularidad y puntualidad medidos en tiempo real'],
            ['Ranking de cumplimiento', 'El MTT publica un ranking que afecta los pagos mensuales del subsidio (sanciones / reconocimientos)'],
            ['Control de "recortes"', 'Práctica donde el conductor termina el recorrido antes de llegar al barrio periférico — el GPS la detecta y se sanciona'],
            ['Refuerzo zonal', 'Marzo 2024 en adelante, SEREMI identifica zonas de bajo desempeño: sur de San Pedro de la Paz, Hualqui, Penco, "los cerros" de Talcahuano'],
            ['Frecuencia y horarios', 'El operador no puede acortar la ventana operativa unilateralmente — debe respetar la tabla contractual'],
            ['Antigüedad de flota', 'El PE define un máximo (no publicado en fuente abierta) — incentivo a renovar usando subsidio "Renueva tu bus" ($6.000 millones disponibles)'],
            ['Plataforma al público', 'App "RED Regional de Movilidad" muestra recorridos y horarios al pasajero'],
          ]}
        />
        <p className="text-[12px]">
          <strong>Caso emblemático — Línea 56 Base Naval:</strong> Es la
          única línea que <strong>no entró</strong> al perímetro en
          abril 2024, por deudas laborales con sus conductores. Otros
          operadores cubrieron su trazado mientras tanto. Representa
          el 1,16% de la flota total. Estado actual (post-2024) no
          verificado.
        </p>
        <p className="text-[12px]">
          <strong>Acuerdo gremial 22-nov-2023:</strong> Las cinco
          federaciones (Alianza Gremial de Transporte, presidida por
          Luis Quiroz, más cuatro más) firmaron acuerdo con el MTT
          desactivando paros previstos para fin de 2023. El acuerdo
          incluyó resolución de pasivos laborales y reconocimiento de
          antigüedad para conductores.
        </p>
        <Sources>
          <SourceLink href="https://www.radioudec.cl/como-entender-el-perimetro-de-exclusion-del-transporte-publico-del-gran-concepcion/">
            Radio UdeC · GPS, ranking, control de recortes
          </SourceLink>
          <SourceLink href="https://hora12.cl/2024/04/01/35-lineas-de-buses-integradas-al-proceso-de-licitacion-en-el-gran-concepcion/">
            Hora12 · 1-abr-2024 — Caso Base Naval (1,16% flota)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2023/11/22/perimetro-de-exclusion-gremios-del-gran-concepcion-llegan-a-acuerdo-con-ministerio-de-transportes.shtml">
            BioBioChile · 22-nov-2023 — Acuerdo cinco federaciones / Luis Quiroz
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Issues conocidos">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Cobertura nocturna débil
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El contrato del PE define ventanas operativas pero la
              cobertura nocturna (post 22:00) sigue siendo
              históricamente débil. Los servicios periféricos terminan temprano. El
              régimen no estableció obligación de servicio 24/7.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Frecuencias en periferias
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Mismas zonas que el SEREMI identificó en marzo 2024 como
              necesitadas de refuerzo siguen siendo críticas: sur de
              San Pedro de la Paz (Boca Sur, Michaihue), Hualqui, "los
              cerros" de Talcahuano. El ranking de cumplimiento es la
              palanca para presionar a los operadores adjudicados.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Pago electrónico tardío
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El compromiso de tener pago electrónico en 2025 se
              postergó: licitación recién en sep-2025, adjudicación en
              ene-2026, marcha blanca Q3 2026, 100% electrónico a fines
              de 2026 — dos años después del perímetro.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Conflicto operador-pasajero
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Quejas recurrentes en redes sociales por buses que pasan
              llenos sin parar, recortes de recorrido en horario punta,
              choferes que cobran tarifa adulto a estudiantes sin TNE
              firmada. El ranking no se publica desagregado por UN —
              difícil para el usuario verificar si su operador cumple.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              GTFS público sin actualizar
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Cambios en código de servicio (ej. 57YP → 50YP cuando
              Ruta Las Playas tomó UN50) tardan en propagarse al feed
              GTFS público. El visor depende del feed, así que cualquier
              desfase contractual aparece como "ruta inexistente" hasta
              el siguiente release.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay 2026
            </a>{' '}
            — la capa de pago electrónico que se monta sobre este
            perímetro. Adjudicado al Consorcio Buspay el 28-ene-2026,
            $580 sin alteración, 1.800-2.000 validadores en 11
            comunas, marcha blanca Q3 2026.
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 Santa Juana
            </a>{' '}
            — la "otra cara" del régimen: en vez de PE, una{' '}
            <em>licitación pública</em> bajo Ley 20.378, art. 4°.
            Tarifa $1.000 fija, operador único nuevo, primer servicio
            rural de Chile con pago electrónico (BusPay).
          </li>
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>{' '}
            — el "primer hermano" del PE Gran Concepción: PE propio
            creado en jul-2016 (anterior al de Gran Concepción),
            operativo desde 10-mar-2022, operador único Transportes
            Tomé. El tramo Conce-Penco-Lirquén es PE Gran Concepción;
            Lirquén-Tomé-Dichato es PE Tomé.
          </li>
          <li>
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
              Concepción ↔ Florida (corredor de El Pimentón)
            </a>{' '}
            — el contraejemplo: corredor metropolitano todavía{' '}
            <em>sin</em> régimen formal. Cuatro privados (Delsal,
            Nueva Libertadores, Biocosta, Trinidad) operan sin
            licitación, tarifa libre, ~40 buses combinados; trazado vía
            cordillera de la costa. Capas subsidiadas nuevas (zona
            norte oct-2025, Rahuil, Poñén-Roa, nocturno) suman piezas
            pero no resuelven el modelo.
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Recorridos interurbanos del Gran Concepción
            </a>{' '}
            — índice general de los servicios que <em>no</em> están en
            el GTFS urbano. Útil para entender qué cae dentro del PE
            (urbano) vs. qué cae fuera.
          </li>
          <li>
            <a href="/wiki/subsidio-ley-20378" className="underline underline-offset-2">
              Subsidio Nacional al Transporte Público (Ley 20.378)
            </a>{' '}
            — la Ley 20.378 (art. 2°) es la que financia el subsidio
            que sostiene la tarifa $580 del PE. El art. 4° (servicios
            licitados subsidiados) habilita servicios como la Ruta 201.
          </li>
          <li>
            <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">
              Sobre este wiki
            </a>{' '}
            — modelo editorial: por qué este artículo cita 20+ fuentes
            primarias y marca como "pendiente" lo que no pudo
            verificarse.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Número y texto íntegro del decreto MTT que aprobó la adjudicación del PE Gran Concepción 2024 (probable Resolución Afecta N° 29/2023 visada por Contraloría en mayo 2023 — texto no recuperado).</li>
          <li>Lista íntegra de las 36 UN con la razón social, RUT y N° RNTPP de cada operador adjudicado.</li>
          <li>Cláusula tarifaria con forma matemática del polinomio de ajuste (coeficiente de cada variable: diésel, neumático, bus, mano de obra, IPC).</li>
          <li>Antigüedad máxima de flota permitida por el contrato del perímetro.</li>
          <li>Estado actual (2026) de la línea 56 Base Naval — ¿se incorporó al PE? ¿sigue fuera?</li>
          <li>Cuotas de flota por UN (cuántos buses opera cada empresa).</li>
          <li>Ranking de cumplimiento publicado por DTPR Biobío (¿se publica? ¿con qué desagregación?).</li>
          <li>Subsidio total al perímetro: cifra agregada del aporte fiscal.</li>
          <li>Estatus formal de Movix, Vía Sur, Buses Conce — nombres mencionados informalmente pero no verificados en fuentes primarias revisadas.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía de cierre principal: <strong>solicitud de Ley de
          Transparencia</strong> a DTPR Biobío y al MTT por el
          expediente íntegro del PE Gran Concepción 2024.
        </p>
      </Section>

      <Section title="Bibliografía">
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
            Wikipedia · Buses licitados del Gran Concepción (régimen 2002 → 2024)
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Transporte público en el Gran Concepción
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 20.378 (subsidio art. 4° — base de licitación Santa Juana)
          </SourceLink>
          <SourceLink href="https://mtt.gob.cl/wp-content/uploads/2017/10/Resex_1005.2017.pdf">
            MTT · Resolución Exenta N° 1006/2017 (marco normativo, base del PE)
          </SourceLink>
          {/* NOTE: el PDF directo en mtt.gob.cl devolvía 404 en mayo 2026.
              Mantenemos la cita por trazabilidad; pendiente snapshot en
              Wayback Machine o reubicación del PDF en el portal MTT. */}
          <SourceLink href="https://www.mtt.gob.cl/wp-content/uploads/2023/07/Rex-1482-2023.pdf">
            MTT · Resolución Exenta N° 1482/2023 (PDF — URL puede estar caída)
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/">
            DPR Biobío · 3-ene-2024 — Inicio operativo perímetro
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/02/02/a-550-pesos-subira-la-tarifa-del-transporte-publico-en-el-gran-concepcion.html">
            Diario Concepción · 2-feb-2024 — Primera alza bajo PE ($550)
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html">
            TVU · 1-mar-2024 — Segunda ola: 11 empresas se incorporan
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2024/04/01/35-lineas-de-taxibuses-seran-parte-del-perimetro-de-exclusion-del-gran-concepcion.html">
            TVU · 1-abr-2024 — 35 líneas finales, Base Naval excluida
          </SourceLink>
          <SourceLink href="https://hora12.cl/2024/04/01/35-lineas-de-buses-integradas-al-proceso-de-licitacion-en-el-gran-concepcion/">
            Hora12 · 1-abr-2024 — Cierre del proceso, caso Base Naval (1,16% flota)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2023/11/22/perimetro-de-exclusion-gremios-del-gran-concepcion-llegan-a-acuerdo-con-ministerio-de-transportes.shtml">
            BioBioChile · 22-nov-2023 — Acuerdo Luis Quiroz / cinco federaciones
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/30/alza-en-el-transporte-del-gran-concepcion-en-cuanto-quedara-el-pasaje-y-cuando-sube.html">
            Diario Concepción · 30-nov-2024 — Anuncio alza $560 (9-dic-2024)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html">
            Diario Concepción · 14-feb-2025 — Anuncio alza $580 (23-feb-2025)
          </SourceLink>
          <SourceLink href="https://www.canal9.cl/episodios/noticias/2025/02/24/pasaje-de-la-locomocion-colectiva-en-el-gran-concepcion-ya-es-de-580">
            Canal 9 · 24-feb-2025 — Tarifa $580 operativa
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/como-entender-el-perimetro-de-exclusion-del-transporte-publico-del-gran-concepcion/">
            Radio UdeC · Explicador del régimen (GPS, ranking, sanción)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html">
            Diario Concepción · 23-sep-2025 — Seis ofertas BusPay
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 — Adjudicación Consorcio Buspay
          </SourceLink>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 2026 — Comunicado oficial BusPay
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Consulta ciudadana diseño tarjeta (Campanil UdeC)
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2026/02/26/transporte-publico-del-gran-concepcion-prepara-salto-digital-2-mil-maquinas-operaran-con-pago-electronico.html">
            TVU · 26-feb-2026 — 2.000 validadores BusPay
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes copia del decreto MTT del perímetro 2024, lista
          íntegra de UN con su operador adjudicado, foto del cartel
          tarifario en paradero o terminal, captura del ranking de
          cumplimiento DTPR, o cualquier dato que ayude a cerrar los
          pendientes — abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/perimetro-exclusion-gran-concepcion-2024.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/perimetro-exclusion-gran-concepcion-2024.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
