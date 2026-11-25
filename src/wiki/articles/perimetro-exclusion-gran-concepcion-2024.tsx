// Perímetro de Exclusión del Gran Concepción 2024: régimen tarifario y
// operativo que reemplazó a la licitación 2002 el 1-ene-2024 y bajo el
// cual operan las líneas urbanas del feed GTFS. Tarifa adulto $580
// desde 23-feb-2025; sin alza confirmada hasta mar-2026 (no verificado
// después). El pago electrónico vive en `buspay.tsx`: acá solo un
// resumen con enlace. Pendientes: lista íntegra de UN, texto del acto
// que aprobó el PE, forma matemática del polinomio.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  IssueNotice,
  KeyValueList,
  NewsPulse,
  OperatorTable,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
  type OperatorRow,
} from './_components';

const LINK = 'underline underline-offset-2';
const WIKI_LICITADOS = { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' };
const TVU_MAR24 = { href: 'https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html', label: 'TVU · 1-mar-2024' };
const HORA12 = { href: 'https://hora12.cl/2024/04/01/35-lineas-de-buses-integradas-al-proceso-de-licitacion-en-el-gran-concepcion/', label: 'Hora12 · 1-abr-2024' };

// Lista parcial: solo operadores que la prensa o Wikipedia nombraron.
const OPERATORS: OperatorRow[] = [
  { name: 'Buses Hualpensan', routes: 'Línea 02 (Talcahuano-Hualpén)', terminal: 'Talcahuano', notes: 'Primera ola (ene-2024).', source: WIKI_LICITADOS },
  { name: 'Vía Futuro', routes: 'Línea 11 · UN11', terminal: 'Concepción centro', notes: 'Gremio firmante del acuerdo de nov-2023.', source: WIKI_LICITADOS },
  { name: 'Nueva Sotrapel', routes: 'Línea 12 · UN12', terminal: 'Pedro de Valdivia', notes: 'Recorrido Lonco.', source: WIKI_LICITADOS },
  { name: 'Expresos Chiguayante', routes: 'Línea 17 · UN17 (17M/17S)', terminal: 'Chiguayante-Penco', notes: 'En el visor es 17MC: la 17M llega a Montahue (Penco) y la 17C a Leonera.', source: WIKI_LICITADOS },
  { name: 'Buses Palomares', routes: 'Línea 18 · UN18', terminal: 'Palomares', notes: 'Barrio Palomares con el centro.', source: WIKI_LICITADOS },
  { name: 'Buses San Pedro del Mar', routes: 'UN23', terminal: 'San Pedro de la Paz', notes: 'Segunda ola, desde 1-mar-2024.', source: TVU_MAR24 },
  { name: 'San Remo', routes: 'UN24', terminal: 'San Pedro de la Paz', notes: 'Segunda ola.', source: TVU_MAR24 },
  { name: 'Ruta Las Playas', routes: 'UN30 y UN50 (única con dos UN)', terminal: 'Playas norte', notes: 'Segunda ola. La 50YP reemplazó a la 57YP del régimen 2002.', source: WIKI_LICITADOS },
  { name: 'Ruta del Mar / Buses Ruta del Mar', routes: 'UN31 y UN32 · 31F Lirquén', terminal: 'Talcahuano-Penco', notes: 'Dos razones sociales relacionadas.', source: TVU_MAR24 },
  { name: 'Buses Mini Verde', routes: 'UN41', terminal: 'Pendiente', notes: 'Segunda ola.', source: TVU_MAR24 },
  { name: 'Buses Base Naval', routes: 'Línea 56 · fuera del PE', terminal: 'Base Naval', notes: 'Excluida en abr-2024 por deudas laborales (1,16% de la flota). Estado posterior no verificado.', source: HORA12 },
  { name: 'Transportes Denavi Sur', routes: 'Línea 57 · UN57 (57Y)', terminal: 'San Vicente', notes: 'Eje San Vicente-Cosmito.', source: WIKI_LICITADOS },
  { name: 'Mi Expreso', routes: 'Línea 62 · UN62 (62H)', terminal: 'San Vicente-Lirquén', notes: 'Hasta Lirquén; desde ahí es PE Tomé.', source: WIKI_LICITADOS },
  { name: 'Rengo Lientur', routes: 'UN63', terminal: 'Pendiente', notes: 'Segunda ola.', source: TVU_MAR24 },
  { name: 'Buses Cóndor', routes: 'UN65', terminal: 'Pendiente', notes: 'Segunda ola. Opera la línea 65.', source: TVU_MAR24 },
  { name: 'Las Galaxias', routes: 'Línea 80 · UN80', terminal: 'Concepción', notes: 'Corredor sur. También opera en Coronel-Lota (Res. Ex. 457).', source: WIKI_LICITADOS },
  { name: 'Vía del Sol', routes: 'UN81', terminal: 'Pendiente', notes: 'Segunda ola.', source: TVU_MAR24 },
  { name: 'Biobús (servicio especial)', routes: 'UNB0', terminal: 'Biotrén-micro', notes: 'Alimentador del Biotrén, con tarifa especial.', source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia · PE Gran Concepción' } },
];

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function PerimetroExclusionGranConcepcion2024() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias y prensa
        regional.</strong> Inicio (1-ene-2024), cierre de la licitación
        2002 (31-mar-2024), 7 comunas, 36 unidades de negocio, vigencia
        hasta 31-dic-2028 y tarifa $580 desde 23-feb-2025 tienen fuente.{' '}
        <strong>Pendientes</strong>: lista íntegra de UN con operador,
        texto del acto que aprobó el PE y forma matemática del
        polinomio.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Vigencia', value: '1-ene-2024 → 31-dic-2028' },
          { label: 'Comunas', value: '7' },
          { label: 'Unidades de negocio', value: '36' },
          { label: 'Tarifa adulto', value: '$580' },
          { label: 'Escolar · AM', value: '$190 · $290' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Régimen del MTT (art. 3° de la Ley 18.696) bajo el cual operan
            los buses urbanos de 7 comunas desde el{' '}
            <strong>1-ene-2024</strong>. Reemplazó a la licitación 2002.
          </>,
          <>
            Tarifa única <strong>$580</strong> desde el 23-feb-2025. En
            mar-2026 el Gobierno confirmó que no sube; después no hay
            dato verificado.
          </>,
          <>
            Pago electrónico: marcha blanca desde el 1-dic-2026 (ver{' '}
            <a href="/wiki/buspay" className={LINK}>BusPay</a>).
          </>,
          <>
            Define qué líneas urbanas trae el GTFS oficial. Los
            interurbanos del mismo feed son de otros regímenes.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '26-mar-2026',
            title: 'El Gobierno confirma que la tarifa regulada se mantiene',
            detail:
              'El ministro de Transportes, Louis de Grange, aseguró que el pasaje del transporte regulado del Gran Concepción no sube, a diferencia de recorridos rurales que sí registraron alzas.',
            source: {
              href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/03/26/gobierno-asegura-que-se-mantendra-tarifa-del-transporte-regulado-del-gran-concepcion.shtml',
              label: 'BioBioChile · 26-mar-2026',
            },
          },
          {
            date: '1-dic-2026',
            title: 'Marcha blanca del pago electrónico',
            detail:
              'El inicio de la marcha blanca quedó en el 1-dic-2026 (antes se hablaba del 1-nov); 100% electrónico desde el 1-mar-2027.',
            source: {
              href: 'https://www.diarioconcepcion.cl/ciudad/2026/10/30/venta-tarjetas-transporte-publico-gran-concepcion.html',
              label: 'Diario Concepción · 30-oct-2026',
            },
          },
        ]}
      />

      <Section title="Qué es">
        <p>
          El MTT usa el <strong>artículo 3°</strong> de la Ley 18.696,
          que le permite definir un área geográfica e imponer tarifas,
          programación vial, regularidad, frecuencia, antigüedad de
          vehículos y requisitos tecnológicos
          (
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN Ley Chile
          </SourceLink>
          ). Reemplazó a la <strong>licitación de 2002</strong>, que
          operó hasta el <strong>31-mar-2024</strong>.
        </p>
        <p>
          Para el visor es la base: define las líneas urbanas del GTFS,
          su tarifa y su operador. Artículos relacionados:{' '}
          <a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a>,{' '}
          <a href="/wiki/ruta-201-santa-juana" className={LINK}>Ruta 201</a>,{' '}
          <a href="/wiki/concepcion-florida" className={LINK}>Concepción ↔ Florida</a>.
        </p>
      </Section>

      <Section title="Tres perímetros y una licitación">
        <DataTable columns={['Régimen', 'Comunas', 'Operadores', 'Vigencia']}>
          <tr>
            <td className="px-3 py-2 font-medium">PE Gran Concepción (este artículo)</td>
            <td className="px-3 py-2">Concepción, Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante, Penco, Hualqui</td>
            <td className="px-3 py-2">~35 empresas en 36 UN</td>
            <td className="px-3 py-2">1-ene-2024 → 31-dic-2028 (renovable)</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium"><a href="/wiki/perimetro-exclusion-tome" className={LINK}>PE Tomé</a></td>
            <td className="px-3 py-2">Tomé y Dichato (401/411/421)</td>
            <td className="px-3 py-2">Transportes Tomé</td>
            <td className="px-3 py-2">Decreto jul-2016 · operativo 10-mar-2022</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Regulación especial Coronel-Lota</td>
            <td className="px-3 py-2">Coronel y Lota</td>
            <td className="px-3 py-2">Operadores locales (Las Galaxias, Buses J. Ewert, etc.)</td>
            <td className="px-3 py-2">Res. Ex. 457 MTT (2012-2013). El PE formal tenía bases en Contraloría a jul-2025; no vigente.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Licitación DTPR ELC0007</td>
            <td className="px-3 py-2">Santa Juana</td>
            <td className="px-3 py-2">Soc. Transporte Pasajeros Santa Juana SpA</td>
            <td className="px-3 py-2">Operativo 15-jul-2024. Ley 20.378 art. 4°, no PE.</td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Santa Juana quedó fuera porque su corredor es rural-urbano
          y se subsidia por el art. 4° de la Ley 20.378. Tomé tiene
          perímetro propio por antecedencia (decreto de 2016).
          Fuera del perímetro, sin régimen: Florida (operadores
          privados con subsidios parciales).
        </p>
        <Sources>
          <SourceLink href="https://www.subtrans.gob.cl/avanza-implementacion-de-nueva-regulacion-del-transporte-publico-en-gran-concepcion/">
            Subtrans · 10-ene-2024, Implementación PE (7 comunas, 19 empresas en operación, 31 líneas con contrato)
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción (incluye PE Tomé y Coronel-Lota)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 20.378 (subsidio, base de la licitación 201)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura">
        <KeyValueList
          items={[
            ['Concepción', 'Centro de la red; terminales Intermodal, Collao y Manuel Rodríguez.'],
            ['Talcahuano', 'Puerto, Base Naval, Las Higueras, El Morro y los cerros.'],
            ['Hualpén', 'Entre Talcahuano y Concepción; refinería ENAP, Lenga.'],
            ['San Pedro de la Paz', 'Margen sur: Boca Sur, San Pedro de la Costa.'],
            ['Chiguayante', 'Ribera norte del Biobío, río arriba.'],
            ['Penco', 'Norte del área metropolitana, incluye Lirquén.'],
            ['Hualqui', 'Margen sur río arriba; zona de refuerzo según la Seremi.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/">
            DPR Biobío · 3-ene-2024, Lista oficial de 7 comunas
          </SourceLink>
          <SourceLink href="https://www.radioudec.cl/como-entender-el-perimetro-de-exclusion-del-transporte-publico-del-gran-concepcion/">
            Radio UdeC · Explicador de comunas y régimen
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Unidades de negocio y operadores">
        <p>
          El perímetro tiene <strong>36 unidades de negocio (UN)</strong>
          {' '}y 35 empresas: Ruta Las Playas tiene dos (UN30 y UN50).
          Esta es la lista parcial de operadores que la prensa nombró.
        </p>
        <OperatorTable rows={OPERATORS} />
        <PendingBanner>
          <strong>Faltan ~18 UN</strong> sin nombre comercial ni razón
          social en fuentes accesibles. Vías: Ley de Transparencia a la
          DTPR Biobío o el expediente del acto que aprobó el PE.
          Movix, Vía Sur y Buses Conce, mencionados en otros artículos,
          no aparecen en fuentes primarias: pendiente de cotejo. Sin
          cambios de operador verificados a nov-2026.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
            Wikipedia · Buses licitados Gran Concepción (UN 2002 → 2024)
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2024/03/01/perimetro-de-exclusion-11-empresas-se-incorporan-a-nueva-regulacion-del-transporte-publico.html">
            TVU · 1-mar-2024, 11 empresas se incorporan
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2024/04/01/35-lineas-de-taxibuses-seran-parte-del-perimetro-de-exclusion-del-gran-concepcion.html">
            TVU · 1-abr-2024, 35 líneas totales, Base Naval excluida
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifa y polinomio">
        <DataTable columns={['Categoría', 'Desde 9-dic-2024', 'Desde 23-feb-2025', 'Nota']} bodyClassName="divide-y">
          <tr>
            <td className="px-3 py-2 font-medium">Adulto</td>
            <td className="px-3 py-2 font-mono">$560</td>
            <td className="px-3 py-2 font-mono">$580</td>
            <td className="px-3 py-2 text-muted-foreground">Única en las 7 comunas</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Estudiante (TNE)</td>
            <td className="px-3 py-2 font-mono">$180</td>
            <td className="px-3 py-2 font-mono">$190</td>
            <td className="px-3 py-2 text-muted-foreground">~33% del adulto</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Adulto mayor</td>
            <td className="px-3 py-2 font-mono">$280</td>
            <td className="px-3 py-2 font-mono">$290</td>
            <td className="px-3 py-2 text-muted-foreground">50% del adulto</td>
          </tr>
        </DataTable>
        <p>
          La tarifa se reajusta con un polinomio heredado del régimen
          2002 (diésel, neumático, bus, mano de obra). La Seremi lo
          describió en feb-2025 como una fórmula con &ldquo;diésel,
          dólar, IPC&rdquo;. En mar-2026 la Seremi dijo que no había alza
          contemplada, pero que el petróleo podía influir
          (
          <SourceLink href="https://sabes.cl/2026/03/04/descarta-alza-en-el-transporte-publico-del-gran-concepcion-eventual-ajuste-dependeria-de-factores-externos">
            Sabes · 4-mar-2026
          </SourceLink>
          ). Pago electrónico: <a href="/wiki/buspay" className={LINK}>BusPay</a>{' '}
          mantiene los $580.
        </p>
        <PendingBanner>
          <strong>Pendiente:</strong> forma matemática del polinomio
          (coeficientes de cada variable) y confirmar que ningún
          reajuste del segundo semestre de 2026 cambió la tarifa: no
          encontré fuente posterior a mar-2026.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/30/alza-en-el-transporte-del-gran-concepcion-en-cuanto-quedara-el-pasaje-y-cuando-sube.html">
            Diario Concepción · 30-nov-2024, Tarifa $560 desde 9-dic-2024
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html">
            Diario Concepción · 14-feb-2025, Tarifa $580 desde 23-feb-2025
          </SourceLink>
          <SourceLink href="https://www.canal9.cl/episodios/noticias/2025/02/24/pasaje-de-la-locomocion-colectiva-en-el-gran-concepcion-ya-es-de-580">
            Canal 9 · 24-feb-2025, Confirmación tarifa $580
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
            Wikipedia · Estructura polinómica
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Pago electrónico">
        <p>
          El perímetro exigía pago electrónico. Se adjudicó el 28-ene-2026
          al Consorcio Buspay; la marcha blanca parte el 1-dic-2026 y la
          tarifa sigue en $580. Detalle, cobertura y recarga en{' '}
          <a href="/wiki/buspay" className={LINK}>BusPay</a>.
        </p>
        <Sources>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026, Adjudicación BusPay
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026, Comunicado oficial
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura del visor">
        <p>
          Todas las líneas urbanas del GTFS oficial de la DTPR están en
          el PE (códigos como 10AN, 11EQ, 17MC, 50YP, 80H). Cada código
          junta las dos variantes, una por sentido. El mismo feed trae
          servicios de otros regímenes, con otra tarifa:
        </p>
        <ul className="ml-5 list-disc space-y-0.5 text-[13px]">
          <li><strong>201 / 201 AU</strong> Santa Juana (licitación ELC0007, $1.000): <a href="/wiki/ruta-201-santa-juana" className={LINK}>Ruta 201</a>.</li>
          <li><strong>401 / 401Y / 411 / 421</strong> (PE Tomé, $780-$830): <a href="/wiki/concepcion-tome" className={LINK}>Concepción ↔ Tomé</a>.</li>
          <li><strong>302 / 304</strong> Lota ↔ Concepción (Res. Ex. 457): <a href="/wiki/concepcion-coronel-lota" className={LINK}>Concepción ↔ Coronel ↔ Lota</a>.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          No están en el visor los servicios privados sin régimen
          (Concepción ↔ Florida, Concepción ↔ Yumbel):{' '}
          <a href="/wiki/concepcion-florida" className={LINK}>Concepción ↔ Florida</a>.
        </p>
      </Section>

      <Section title="Fiscalización y conflictos">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <strong>Herramientas del perímetro:</strong> GPS online
            obligatorio, indicadores de frecuencia y regularidad, y un
            ranking de cumplimiento que afecta el pago mensual del
            subsidio; el GPS detecta los &ldquo;recortes&rdquo; de
            recorrido
            (
            <SourceLink href="https://www.radioudec.cl/como-entender-el-perimetro-de-exclusion-del-transporte-publico-del-gran-concepcion/">
              Radio UdeC
            </SourceLink>
            ).
          </li>
          <li>
            <strong>22-nov-2023:</strong> las cinco federaciones
            gremiales (Alianza Gremial, de Luis Quiroz) firman acuerdo
            con el MTT que resuelve pasivos laborales
            (
            <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2023/11/22/perimetro-de-exclusion-gremios-del-gran-concepcion-llegan-a-acuerdo-con-ministerio-de-transportes.shtml">
              BioBioChile
            </SourceLink>
            ).
          </li>
          <li>
            <strong>1-abr-2024:</strong> la línea 56 Base Naval queda
            fuera por deudas laborales (1,16% de la flota); otros
            operadores cubren su trazado
            (
            <SourceLink href="https://hora12.cl/2024/04/01/35-lineas-de-buses-integradas-al-proceso-de-licitacion-en-el-gran-concepcion/">
              Hora12
            </SourceLink>
            ). Estado actual no verificado.
          </li>
          <li>
            <strong>Desde mar-2024:</strong> la Seremi marca zonas de
            refuerzo: sur de San Pedro de la Paz, Hualqui, Penco y los
            cerros de Talcahuano.
          </li>
          <li>
            Subsidios y financiamiento:{' '}
            <a href="/wiki/subsidio-ley-20378" className={LINK}>Ley 20.378</a>. Entidad fiscalizadora:{' '}
            <a href="/wiki/seremitt-dtpr-biobio" className={LINK}>Seremitt y DTPR Biobío</a>.
          </li>
        </ul>
      </Section>

      <CollapsibleSection title="Historia: de la licitación 2002 al perímetro">
        <Timeline
          items={[
            {
              date: '2000-2002',
              event: 'El MTT diseña y adjudica la licitación de buses urbanos, con 37 empresas.',
              source: WIKI_LICITADOS,
            },
            {
              date: '27-abr-2017',
              event: 'Resolución N° 1006 del MTT, marco normativo del perímetro (se ejecutó en 2024).',
              source: { href: 'https://www.mtt.gob.cl/wp-content/uploads/2017/10/Resex_1005.2017.pdf', label: 'MTT (norma adyacente)' },
            },
            {
              date: 'May-2023',
              event: 'Contraloría visa la Resolución Afecta N° 29 del MTT, que aprueba el perímetro y faculta negociar con los operadores existentes (art. 3°ter). Sin texto íntegro cotejado.',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '1-ene-2024',
              event: 'Entra en vigor con 30 empresas adheridas. La Seremi anuncia GPS obligatorio, fiscalización online y ranking.',
              source: { href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/', label: 'DPR Biobío · 3-ene-2024' },
            },
            {
              date: '2-feb-2024',
              event: 'Se anuncia la primera alza polinómica, a $550.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/02/02/a-550-pesos-subira-la-tarifa-del-transporte-publico-en-el-gran-concepcion.html', label: 'Diario Concepción · 2-feb-2024' },
            },
            {
              date: '1-mar-2024',
              event: 'Se suman 11 empresas (UN23, 24, 30, 31, 32, 41, 50, 63, 65, 81): 33 empresas en 34 UN.',
              source: TVU_MAR24,
            },
            {
              date: '31-mar-2024',
              event: 'Caduca la licitación 2002; la última línea en migrar es la 22 San Pedro. Quedan 35 líneas en 36 UN; la 56 Base Naval, fuera.',
              source: HORA12,
            },
            {
              date: '9-dic-2024',
              event: 'Adulto sube a $560 (estudiante $180, adulto mayor $280).',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/30/alza-en-el-transporte-del-gran-concepcion-en-cuanto-quedara-el-pasaje-y-cuando-sube.html', label: 'Diario Concepción · 30-nov-2024' },
            },
            {
              date: '23-feb-2025',
              event: 'Adulto sube a $580 (escolar $190, adulto mayor $290).',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html', label: 'Diario Concepción · 14-feb-2025' },
            },
            {
              date: '23-sep-2025 a 28-ene-2026',
              event: 'Licitación y adjudicación del pago electrónico (ver BusPay).',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html', label: 'Diario Concepción · 23-sep-2025' },
            },
            {
              date: '31-dic-2028',
              event: 'Vence el primer ciclo de 5 años, renovable.',
            },
          ]}
        />
        <Sources>
          <SourceLink href="https://www.mtt.gob.cl/wp-content/uploads/2023/07/Rex-1482-2023.pdf">
            MTT · Resolución Exenta N° 1482/2023 (PDF, URL puede estar caída)
          </SourceLink>
          <SourceLink href="https://mtt.gob.cl/wp-content/uploads/2017/10/Resex_1005.2017.pdf">
            MTT · Resolución Exenta N° 1006/2017 (el PDF devolvía 404 en may-2026)
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Consulta ciudadana diseño de tarjeta (Campanil UdeC)
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2026/02/26/transporte-publico-del-gran-concepcion-prepara-salto-digital-2-mil-maquinas-operaran-con-pago-electronico.html">
            TVU · 26-feb-2026, 2.000 validadores
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Issues conocidos">
        <div className="space-y-2">
          <IssueNotice title="Cobertura nocturna y periferias">
            El contrato fija ventanas operativas, sin obligación 24/7. Los
            servicios periféricos terminan temprano; sur de San Pedro de
            la Paz, Hualqui y los cerros de Talcahuano siguen críticos
            (Seremi, mar-2024).
          </IssueNotice>
          <IssueNotice title="Ranking sin desagregar">
            El ranking de cumplimiento no se publica por UN, así que el
            usuario no puede verificar a su operador.
          </IssueNotice>
          <IssueNotice title="GTFS sin actualizar">
            El GTFS oficial es el programa del 28-feb-2025, con calendario
            vencido el 31-dic-2025 y sin versión posterior al
            24-nov-2026. La app de Transapp ya sigue 11 servicios que no
            calzan (02H, 02L, 20F, 20N, 30H, 30Z, 50SY, 70FY, 70HY, 80B,
            80V). El visor no muestra diez de ellos (la 02L solo como
            02L-Y) hasta que la DTPR publique otra versión.
          </IssueNotice>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            Número y texto del acto MTT que aprobó el PE (fuentes citan
            la Res. Afecta N° 29, con año 2022 o 2023 según la fuente;
            el texto no se recuperó en BCN ni en el Diario Oficial). Subtrans
            confirma la implementación desde 1-ene-2024
            (
            <SourceLink href="https://www.subtrans.gob.cl/avanza-implementacion-de-nueva-regulacion-del-transporte-publico-en-gran-concepcion/">
              Subtrans · 10-ene-2024
            </SourceLink>
            ) sin citar el número.
          </li>
          <li>Lista de las 36 UN con razón social, RUT y RNTPP. La Wikipedia ES solo da la estructura del régimen 2002; no hay fuente primaria que liste la adjudicación 2024.</li>
          <li>Forma matemática del polinomio y antigüedad máxima de flota.</li>
          <li>Estado de la línea 56 Base Naval en 2026.</li>
          <li>Flota por UN, ranking de cumplimiento publicado y subsidio agregado al perímetro.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía principal: Ley de Transparencia a la DTPR Biobío y al MTT.
          Aportes por pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/perimetro-exclusion-gran-concepcion-2024.tsx">
            GitHub
          </SourceLink>
          .
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Bibliografía">
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Transporte público en el Gran Concepción
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html">
            Diario Concepción · 23-sep-2025, Seis ofertas BusPay
          </SourceLink>
          <SourceLink href="https://www.canal9.cl/episodios/2026/07/21/comenzara-entrega-gratuita-de-29-mil-tarjetas-para-pago-electronico-de-micros-en-el-gran-concepcion">
            Canal 9 · 21-jul-2026, Tarjetas gratuitas (marcha blanca 1-nov, corrida al 1-dic)
          </SourceLink>
        </Sources>
      </CollapsibleSection>
    </div>
  );
}
