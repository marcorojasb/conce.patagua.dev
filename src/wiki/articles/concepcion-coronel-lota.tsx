// Concepción ↔ Coronel ↔ Lota — el corredor sur metropolitano.
//
// Tercer y último corredor metropolitano del Gran Concepción sin documentar
// en el wiki. Eje vial: Ruta 160 ("Camino a Lota"), la misma que el MOP
// licita como electrocorredor desde 2024 (Consorcio Electro-Cointer, UF
// 4.414.000, oferta única 5-nov-2025).
//
// Hallazgo regulatorio clave del saneamiento previo:
//   - El "PE Coronel-Lota" NO es un perímetro de exclusión formal vigente.
//   - Lo que opera al cierre 2025 es la Resolución Exenta 457 del MTT
//     (2012-2013), una regulación especial sobre los servicios públicos
//     de transporte mayor de Coronel y Lota, "aproximada a un PE".
//   - El PE Coronel-Lota formal está en bases de licitación en Contraloría
//     desde julio de 2025; proyecta 80 buses nuevos. Aún no adjudicado al
//     cierre de este artículo.
//
// El corredor coexiste con dos modos competidores documentados en el wiki:
// el Biotrén Línea 2 (Concepción ↔ Coronel, sin llegar a Lota) y el
// electrocorredor MOP Ruta 160. La capacidad real instalada y las
// frecuencias específicas por servicio quedan en banner ámbar — fuentes
// abiertas no resuelven el detalle operacional.

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
import { MapLink } from '@/wiki/map-link';

export default function ConcepcionCoronelLota() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong>{' '}
        Eje vial Ruta 160 (concesión MOP), poblaciones comunales (Censo
        2017 BCN: Coronel 116.262 hab., Lota 43.535 hab.), cierre del
        carbón el <strong>14-abr-1997</strong> (Enacar / Lota Verde),
        Biotrén Línea 2 inaugurada en 2009, electrocorredor MOP Ruta 160
        (UF 4.414.000, oferente único Consorcio Electro-Cointer el
        5-nov-2025) y BusPay 2026 (Consorcio Buspay, adjudicado 28-ene-2026
        e incluye Coronel y Lota): todo con fuente.{' '}
        <strong>Pendiente</strong>: número exacto, fecha de emisión y
        texto completo de la Resolución Exenta 457 MTT (citada
        consistentemente en el wiki como "2012-2013" pero sin link directo
        al expediente); estado actual de las bases del PE Coronel-Lota en
        Contraloría (visadas / no visadas); tarifa adulto 2026; lista
        canónica y razones sociales formales de los operadores.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          El corredor <strong>Concepción ↔ Coronel ↔ Lota</strong> es la{' '}
          <strong>espina dorsal sur</strong> del Gran Concepción
          metropolitano. Conecta el centro de Concepción con{' '}
          <strong>San Pedro de la Paz</strong> (cruzando el puente Llacolén
          / Bicentenario sobre el río Biobío),{' '}
          <strong>Lomas Coloradas</strong>, <strong>Coronel</strong>{' '}
          (116.262 hab. Censo 2017) y <strong>Lota</strong> (43.535 hab.
          Censo 2017), siguiendo el eje de la <strong>Ruta 160</strong>{' '}
          ("Camino a Lota").
        </p>
        <p>
          Tres rasgos lo distinguen de los otros corredores del wiki:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Régimen regulatorio especial sin PE formal.</strong>{' '}
            Coronel y Lota nunca entraron a la licitación 2002 del Gran
            Concepción. Al cierre 2025 operan bajo la{' '}
            <strong>Resolución Exenta 457 del MTT</strong> (2012-2013),
            una regulación especial "aproximada a un perímetro de
            exclusión" pero más débil: sin contrato de largo plazo, sin
            polinomio publicado, con fiscalización delegada a la SEREMITT
            Biobío.
          </li>
          <li>
            <strong>Conflictividad histórica.</strong> Es probablemente el
            corredor más tensionado del Biobío por la transición post-cierre
            del carbón (Enacar y Lota Verde cerraron el 14 de abril de
            1997), las huelgas y paros recurrentes de choferes y la
            disputa tarifaria. La Ruta 160 también ha sido escenario de
            accidentes notorios por congestión y diseño vial.
          </li>
          <li>
            <strong>Coexistencia con tren urbano y electrocorredor.</strong>{' '}
            La <strong>Línea 2 del Biotrén</strong> (Concepción ↔ Coronel,
            14 estaciones, en servicio desde 2009) cubre el mismo eje;
            el <strong>electrocorredor MOP Ruta 160</strong> (San Pedro
            ↔ Coronel, 14 km, UF 4.414.000) reemplazará parcialmente la
            vialidad a partir de 2031-2032. Es el único corredor del wiki
            con tres modos competidores activos simultáneamente.
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8102">
            BCN · Reportes comunales Coronel 2017 — 116.262 hab.
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8105">
            BCN · Reportes comunales Lota 2017 — 43.535 hab.
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/07/15/80-buses-nuevos-para-lota-y-coronel-las-bases-de-la-licitacion-estan-en-contraloria.html">
            Diario Concepción · 15-jul-2025 — 80 buses nuevos para Lota y Coronel
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Alcance geográfico">
        <KeyValueList
          items={[
            [
              'Comunas cubiertas',
              <>
                <strong>Concepción</strong> (centro y salida sur por puente
                Bicentenario / Llacolén), <strong>San Pedro de la Paz</strong>{' '}
                (Boca Sur, Candelaria, Michaihue, Lomas Coloradas, San
                Pedro del Mar), <strong>Coronel</strong> (urbano, Yobilo,
                Maule, Lagunillas, Escuadrón) y <strong>Lota</strong>{' '}
                (Lota Bajo y Lota Alto).
              </>,
            ],
            [
              'Eje vial primario',
              <>
                <strong>Ruta 160</strong> (OSM relation 9239557,{' '}
                <code className="font-mono">ref=160</code>, official_name
                "Camino a Lota"). Doble vía concesionada (Concesionaria
                Autopista del Itata / Sociedad Concesionaria Autopista
                Costa Arauco según tramo), peaje troncal en Coronel.
              </>,
            ],
            [
              'Distancia Concepción → Lota',
              'Aprox. 38 km por Ruta 160 (peaje troncal Coronel, sector Boca Sur, intercambio Lagunillas)',
            ],
            [
              'Tiempo en bus Concepción → Lota',
              '~55 a 80 min según hora del día y trazado intermedio (San Pedro / Lomas / Coronel terminal)',
            ],
            [
              'Vías secundarias',
              'Av. Las Industrias / Costanera (eje paralelo en San Pedro), camino antiguo a Lota por Coronel-Lota Alto, accesos urbanos Yobilo, Maule, Escuadrón',
            ],
            [
              'Corte del artículo',
              <>
                Este artículo se acota a{' '}
                <strong>Concepción ↔ Coronel ↔ Lota</strong> (corredor
                metropolitano regulado por Res. Ex. 457 MTT). El tramo
                interurbano puro hacia <strong>Laraquete / Carampangue
                / Arauco</strong> (provincia de Arauco) opera bajo
                régimen privado distinto y queda fuera; podría documentarse
                en un artículo hermano "Concepción ↔ provincia de Arauco".
              </>,
            ],
            [
              'Hidrografía / geomorfología',
              'Cruce del río Biobío (puente Bicentenario / Llacolén / Juan Pablo II), bordemar de San Pedro hasta la desembocadura del estero Boca Sur, plano costero hasta Coronel y Lota; sin cuesta dura — el corredor sigue paralelo al mar.',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/relation/9239557">
            OSM relation 9239557 · Ruta 160 (ref=160, official_name "Camino a Lota")
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8102">
            BCN · Coronel 2017 (incluye localidades: Lagunillas, Escuadrón, Yobilo, Maule)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Régimen jurídico: Res. Ex. 457 y la licitación 2025">
        <p>
          La regulación del corredor sur es{' '}
          <strong>distinta</strong> a la del resto del Gran Concepción.
          Coronel y Lota quedaron históricamente fuera de la licitación
          2002 que cubrió las siete comunas urbanas centrales (ver{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            PE Gran Concepción 2024
          </a>
          ). Lo que opera hoy es un instrumento ad-hoc:
        </p>
        <KeyValueList
          items={[
            [
              'Instrumento vigente',
              <>
                <strong>Resolución Exenta N° 457</strong> del MTT (período
                <strong> 2012-2013</strong>). Crea una regulación especial
                para los servicios de transporte mayor en Coronel y Lota
                — el wiki la describe como "aproximada a un perímetro de
                exclusión", pero formalmente no lo es.
              </>,
            ],
            [
              'Naturaleza jurídica',
              'Resolución administrativa exenta de toma de razón previa, no un decreto supremo. Más débil que un PE: no asegura contrato de largo plazo ni obliga estándar tarifario uniforme.',
            ],
            [
              'Tarifa',
              'No fija una tarifa única vinculante en el sentido de un PE. Los operadores ajustan tarifa con anuencia de la SEREMITT Biobío bajo polinomio no publicado en fuente abierta.',
            ],
            [
              'Fiscalización',
              'A cargo de la SEREMITT Biobío (instancia política) y la DTPR Biobío (brazo técnico). Programa permanente "Más Pasajes Por Tu Plata".',
            ],
            [
              'Cobertura geográfica',
              'Servicios mayores de transporte público de Coronel y Lota — incluyendo los troncales que llegan hasta Concepción por la Ruta 160.',
            ],
            [
              'Vigencia',
              'Activa al cierre de 2025, en espera del reemplazo por el PE Coronel-Lota formal que está en Contraloría.',
            ],
          ]}
        />
        <p className="mt-2">
          En paralelo, las{' '}
          <strong>bases de licitación del Perímetro de Exclusión
          Coronel-Lota formal</strong>{' '}
          están en Contraloría General de la República desde{' '}
          <strong>julio de 2025</strong>:
        </p>
        <KeyValueList
          items={[
            ['Estado a jul-2025', 'Bases ingresadas a Contraloría — pendiente de toma de razón (visación) al cierre del artículo'],
            ['Flota proyectada', '80 buses nuevos para Coronel y Lota — primera renovación masiva del corredor sur'],
            ['Anuncio de prensa', 'Diario Concepción · 15-jul-2025 ("80 buses nuevos para Lota y Coronel")'],
            [
              'Calendario tentativo',
              'Sujeto a CGR. Visación → llamado a oferentes → adjudicación → marcha blanca. Sin fecha pública firme al cierre de 2025.',
            ],
            [
              'Encaje con BusPay',
              <>
                BusPay (adjudicado al{' '}
                <a href="/wiki/buspay" className="underline underline-offset-2">
                  Consorcio Buspay
                </a>{' '}
                el 28-ene-2026, marcha blanca Q3 2026) cubre Coronel y
                Lota desde el inicio. El PE formal, cuando entre en
                vigor, hereda los validadores BusPay ya instalados.
              </>,
            ],
          ]}
        />
        <PendingBanner>
          <strong>Texto exacto de la Res. Ex. 457 pendiente.</strong> La
          referencia "Resolución Exenta 457 MTT 2012-2013" aparece en
          varios artículos del wiki (
          <a href="/wiki/buspay" className="underline underline-offset-2">
            BusPay 2026
          </a>
          ,{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            PE Gran Concepción 2024
          </a>
          ) sin link directo al expediente. Vía de cierre: solicitud por
          Ley de Transparencia (Ley 20.285) a la Subsecretaría de
          Transportes pidiendo copia íntegra de la resolución y su
          numeración correlativa exacta. Una vez verificado el número,
          fecha y contenido, se actualizan los tres artículos hermanos
          en bloque.
        </PendingBanner>
        <h3 className="mt-3 text-[13px] font-medium">
          Comparación con los otros regímenes metropolitanos
        </h3>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">PE Gran Concepción</th>
                <th className="px-3 py-2 font-medium">PE Tomé</th>
                <th className="px-3 py-2 font-medium">Coronel-Lota</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Instrumento</td>
                <td className="px-3 py-2">Decreto MTT — Ley 18.696 art. 3°</td>
                <td className="px-3 py-2">Decreto MTT — Ley 18.696 art. 3°</td>
                <td className="px-3 py-2">Resolución Exenta 457 MTT (regulación especial — PE formal en Contraloría)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Vigente desde</td>
                <td className="px-3 py-2">1-ene-2024</td>
                <td className="px-3 py-2">10-mar-2022 (decreto jul-2016)</td>
                <td className="px-3 py-2">2012-2013 (Res. Ex.) — PE formal aún no vigente</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Operadores</td>
                <td className="px-3 py-2">35 empresas en 36 UN</td>
                <td className="px-3 py-2">UNO · Transportes Tomé SpA</td>
                <td className="px-3 py-2">Múltiples operadores locales (sin operador único)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tarifa adulto</td>
                <td className="px-3 py-2">$580 (23-feb-2025)</td>
                <td className="px-3 py-2">$750 base (2022)</td>
                <td className="px-3 py-2">Sin tarifa única publicada — varía por operador</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Pago electrónico</td>
                <td className="px-3 py-2">BusPay desde Q3 2026</td>
                <td className="px-3 py-2">BusPay desde Q3 2026</td>
                <td className="px-3 py-2">BusPay desde Q3 2026 (vía cobertura cross-cutting)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Flota proyectada en próxima licitación</td>
                <td className="px-3 py-2">Renovación gradual contractual</td>
                <td className="px-3 py-2">71 buses declarados</td>
                <td className="px-3 py-2"><strong>80 buses nuevos</strong> (bases en CGR jul-2025)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/07/15/80-buses-nuevos-para-lota-y-coronel-las-bases-de-la-licitacion-estan-en-contraloria.html">
            Diario Concepción · 15-jul-2025 — Bases PE Coronel-Lota en Contraloría
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción (sección PE Coronel-Lota)
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · sitio oficial DTPR
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Operadores">
        <p className="text-[12px] text-muted-foreground">
          Bajo la Res. Ex. 457 operan múltiples empresas privadas — no
          hay operador único. El wiki tiene mención cruzada de{' '}
          <strong>Las Galaxias</strong> en el artículo{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            PE Gran Concepción 2024
          </a>{' '}
          y de <strong>Buses J. Ewert</strong> en la cartera general del
          DPR. La lista canónica completa es pendiente:
        </p>
        <OperatorTable
          rows={[
            {
              name: 'Las Galaxias',
              routes: 'Línea 80 (UN80 del PE Gran Concepción) + presencia en corredor sur Res. Ex. 457',
              terminal: 'Concepción centro · pendiente terminal exacto',
              notes: (
                <>
                  <p>
                    Operador grande del corredor sur. Aparece nombrado en
                    la documentación del PE Gran Concepción 2024 como
                    titular de la <strong>UN80 / Línea 80</strong>, y la
                    misma razón social tiene presencia en la regulación
                    especial Coronel-Lota.
                  </p>
                  <p className="mt-1">
                    Pendiente: cuántas líneas troncales corre bajo Res.
                    Ex. 457, flota declarada, terminal en Coronel/Lota.
                  </p>
                </>
              ),
              source: {
                href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n',
                label: 'Wikipedia',
              },
            },
            {
              name: 'Buses J. Ewert',
              routes: 'Servicios troncales Concepción ↔ Coronel ↔ Lota — códigos pendientes',
              terminal: 'Pendiente',
              notes: (
                <>
                  <p>
                    Operador histórico de la zona sur del Gran Concepción,
                    mencionado en la cartera regional DPR Biobío. Sin
                    confirmación independiente de razón social formal,
                    RUT ni padrón de flota.
                  </p>
                </>
              ),
            },
          ]}
        />
        <PendingBanner>
          <strong>Lista de operadores incompleta.</strong> Fuentes
          abiertas no publican el padrón vigente bajo Res. Ex. 457. Las
          dos razones sociales anteriores son las que el wiki tiene
          cruzadas con otras fichas; faltan los operadores específicos
          de Lota Bajo / Lota Alto / Coronel urbano y la subdivisión
          por familias de línea. Vía de cierre: Ley de Transparencia a
          DTPR Biobío por el padrón Res. Ex. 457 y, una vez visada,
          consulta al expediente de licitación del PE Coronel-Lota en
          Contraloría.
        </PendingBanner>
      </Section>

      <Section title="Servicios y frecuencias">
        <p className="text-[12px] text-muted-foreground">
          El feed{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>{' '}
          <strong>no cubre</strong> los servicios del corredor sur (porque
          Coronel-Lota está bajo Res. Ex. 457 y no en el PE 2024). Por
          eso el visor del proyecto no muestra trazado ni paraderos de
          este corredor — solo aparece la <em>Línea 2 del Biotrén</em>,
          que sí está digitalizada desde OSM.
        </p>
        <KeyValueList
          items={[
            [
              'Codificación de líneas',
              'Sin numeración unificada publicada en fuente abierta. Los operadores usan nombres comerciales y números de máquina; las líneas troncales se identifican por destino (Lota Bajo, Lota Alto, Coronel terminal, Lagunillas, Maule, San Pedro del Mar).',
            ],
            [
              'Variantes de trazado',
              'Tres familias funcionales: troncal Concepción ↔ Lota Bajo (eje completo), troncal Concepción ↔ Coronel terminal (corta en Coronel), ramales internos Coronel-Lota Alto y servicios alimentadores hacia Lomas Coloradas / Boca Sur / Candelaria desde San Pedro.',
            ],
            [
              'Frecuencia hora punta',
              'Pendiente. La presión vecinal y la prensa local citan saturación punta mañana hacia Concepción y punta tarde hacia el sur. Sin tabla horaria oficial publicada.',
            ],
            [
              'Primera y última salida',
              'Pendiente verificar en terreno — no hay cartel oficial publicado en fuente abierta.',
            ],
            [
              'Información en tiempo real',
              'No documentada. La app Red Regional de Movilidad cubre PE Gran Concepción y PE Tomé; cobertura para Res. Ex. 457 Coronel-Lota no está confirmada al cierre 2025.',
            ],
            [
              'GTFS público',
              'NO publicado. Servicios del corredor sur ausentes del feed GTFS Gran Concepción — y, por lo mismo, del visor del wiki.',
            ],
          ]}
        />
        <PendingBanner>
          <strong>Tabla horaria oficial pendiente.</strong> Sin
          numeración canónica de líneas ni archivo GTFS, el detalle
          operacional del corredor queda en hueco. Vía de cierre: foto
          del cartel en los terminales de Concepción (Maipú / O'Higgins,
          área histórica de salida de buses a Lota), Coronel y Lota
          Bajo, más solicitud por transparencia a DTPR Biobío del padrón
          Res. Ex. 457 con códigos de servicio.
        </PendingBanner>
      </Section>

      <Section title="Tarifa y ajuste">
        <KeyValueList
          items={[
            [
              'Tarifa adulto vigente 2026',
              'Pendiente confirmar — sin tarifa única publicada. Varía por operador y por tramo (Concepción ↔ Coronel suele ser menor que Concepción ↔ Lota).',
            ],
            [
              'Tarifa escolar',
              'Pendiente — Ley 20.378 establece subsidio nacional de transporte escolar; aplicación específica bajo Res. Ex. 457 no documentada en fuente abierta.',
            ],
            [
              'Accesibilidad universal',
              'Pendiente — el régimen Res. Ex. 457 no exige flota AU al estándar PE; en la licitación del PE formal sí se proyecta exigencia AU.',
            ],
            [
              'Polinomio de ajuste',
              'No publicado. Bajo Res. Ex. 457 los reajustes se tramitan con la SEREMITT Biobío sin polinomio público (a diferencia del PE Gran Concepción 2024, cuyo polinomio sí está formalizado en el contrato).',
            ],
          ]}
        />
        <p className="mt-2">
          La tarifa ha sido <strong>fuente recurrente de
          conflicto</strong> en el corredor:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <strong>Paros y huelgas de choferes</strong> de las líneas
            sur en distintos años de la década de 2010-2020 (verificación
            de fechas exactas pendiente). La regulación especial sin
            polinomio público hace que cada alza tarifaria se discuta
            caso a caso, generando tensión sindical y vecinal.
          </li>
          <li>
            <strong>Programa "Más Pasajes Por Tu Plata"</strong> de la
            SEREMITT Biobío como mecanismo de control de precio
            aplicado, entre otras zonas, al corredor sur.
          </li>
          <li>
            Pendiente: cronología documentada de paros y de variaciones
            tarifarias en el corredor. Vía de cierre: archivo BioBioChile
            y Diario Concepción con búsqueda "paro buses Coronel Lota"
            por año.
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · sitio oficial (referencias a programas de fiscalización tarifaria)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Integración con BusPay (Q3 2026)">
        <p>
          BusPay, el sistema de recaudo electrónico adjudicado al{' '}
          <strong>Consorcio Buspay</strong> el <strong>28-ene-2026</strong>{' '}
          (operador técnico <strong>Busmatick</strong>, ver{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            artículo BusPay 2026
          </a>
          ), <strong>sí cubre</strong> Coronel y Lota desde el inicio.
          Es una decisión política relevante: BusPay no se limita al PE
          Gran Concepción 2024, sino que cruza los regímenes (PE GC + PE
          Tomé + Res. Ex. 457 Coronel-Lota + licitación 201 Santa Juana)
          unificándolos en un solo medio de pago.
        </p>
        <KeyValueList
          items={[
            [
              'Cobertura',
              'Coronel y Lota incluidas — son 2 de las 11 comunas del alcance BusPay.',
            ],
            [
              'Validadores',
              'Parte del paquete de 1.800-2.000 validadores embarcados que el Consorcio Buspay desplegará en el conjunto de las 11 comunas.',
            ],
            [
              'Marcha blanca',
              'Q3 2026 — la fecha exacta para Coronel-Lota dentro del cronograma BusPay no está desglosada en fuente abierta.',
            ],
            [
              'Régimen 100% electrónico',
              'Proyectado fin de 2026 a nivel del conjunto BusPay. Para los operadores actuales de Res. Ex. 457 implica instalar validadores antes que el PE formal entre en vigor.',
            ],
            [
              'Encaje con el PE Coronel-Lota formal',
              'Cuando el PE formal entre en vigor (post-adjudicación de las bases en Contraloría), heredará la infraestructura BusPay ya instalada — no habrá segunda licitación de recaudo.',
            ],
            [
              'Tarjeta',
              'Tarjeta Campanil UdeC (definida por consulta ciudadana en el marco BusPay) y medios de pago electrónicos diversos (tarjeta bancaria contactless, QR, etc.).',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026 — Adjudicación BusPay (cobertura 11 comunas incl. Coronel y Lota)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 — BusPay adjudicado a Consorcio Buspay
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tensión con el Electrocorredor Ruta 160">
        <p>
          El <strong>electrocorredor MOP Ruta 160</strong> es el proyecto
          de infraestructura que más afecta al corredor sur. Datos
          verificados (ver{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            artículo Electrocorredores MOP del Biobío
          </a>
          ):
        </p>
        <KeyValueList
          items={[
            ['Tramo', 'San Pedro de la Paz ↔ Coronel · 14 km bidireccionales'],
            ['Sector A', 'Daniel Belmar ↔ Av. Cuatro Sur — 7,3 km en San Pedro de la Paz'],
            ['Sector B', 'Av. Cuatro Sur ↔ acceso Parque Industrial Escuadrón I — 6,9 km en Coronel'],
            ['Inversión', 'UF 4.414.000 (~USD 171 millones)'],
            ['Oferente único', 'Consorcio Electro-Cointer (matriz Cointer Concesiones S.L. / Grupo Azvi)'],
            ['Recepción de ofertas', '5 de noviembre de 2025'],
            ['Apertura económica', '3 de diciembre de 2025'],
            ['Adjudicación esperada', 'Primer trimestre 2026'],
            ['Plazo de concesión', '300 meses (25 años)'],
            ['Puesta en servicio proyectada', '2031-2032'],
            [
              'Alcance del corredor exclusivo',
              <>
                Llega hasta el acceso al Parque Industrial Escuadrón I
                (Coronel norte). <strong>NO continúa hasta Lota</strong>:
                los últimos 8-10 km del corredor sur seguirán dependiendo
                de la Ruta 160 sin pista exclusiva.
              </>,
            ],
            [
              'Coexistencia con buses actuales',
              'En 2031-2032, los buses del corredor sur (urbanos bajo PE Coronel-Lota formal o lo que quede de Res. Ex. 457) usarán la pista exclusiva en el tramo San Pedro-Coronel; en Coronel-Lota seguirán en vialidad mixta.',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/project/corredor-de-transporte-publico-ruta-160/">
            MOP Concesiones · ficha proyecto Corredor Ruta 160
          </SourceLink>
          <SourceLink href="https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/">
            MOP · 5-nov-2025 — Oferta Electro-Cointer Ruta 160
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
            Diario Concepción · 13-nov-2024 — CGR visa licitaciones Rutas 160 / 150
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tensión con el Biotrén Línea 2">
        <p>
          La <strong>Línea 2 del Biotrén</strong> (Concepción ↔ Coronel,
          14 estaciones, en servicio desde 2009) cubre el mismo eje que
          el corredor de buses sur. A diferencia del corredor Concepción
          ↔ Tomé (donde el Biotrén no llega), aquí los buses y el tren
          conviven directamente.
        </p>
        <KeyValueList
          items={[
            [
              'Terminal sur del tren',
              'Estación Coronel — el tren NO llega a Lota. Lota se conecta solo en bus desde Coronel terminal.',
            ],
            [
              'Capacidad relativa',
              'Tren: trenes ALSTOM XTrapolis cada 12-15 min en punta. Bus: múltiples operadores con frecuencia agregada típicamente mayor pero capacidad por vehículo menor.',
            ],
            [
              'Tarifa',
              'Biotrén: $410 hora valle / $580 hora punta (verificar valor 2026 en el artículo Biotrén). Bus Res. Ex. 457: pendiente confirmar tarifa adulto vigente.',
            ],
            [
              'Tarjeta',
              'Biotrén usa Conecta (desde 2023, reemplazó Biotrén 2005). Bus usará BusPay (Q3 2026). Integración tarifaria Conecta ↔ BusPay aún NO confirmada en fuente abierta.',
            ],
            [
              'Coexistencia',
              <>
                El tren cubre el corredor estructural; los buses cubren
                la red capilar (Lota Alto, Lota Bajo, sectores
                periféricos de Coronel que no llegan a la estación). La
                discusión política sobre <em>extender el Biotrén a
                Lota</em> aparece recurrentemente (ver{' '}
                <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
                  artículo Biotrén y sus extensiones
                </a>
                ) — pero la inversión en buses nuevos (80 buses del PE
                formal) y el electrocorredor MOP están más cerca de
                ejecutarse.
              </>,
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          <MapLink route="L2">Ver Línea 2 Coronel ↔ Concepción en el mapa →</MapLink>
        </p>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
            Wikipedia · Biotrén (Línea 2 Concepción-Coronel, 2009)
          </SourceLink>
          <SourceLink href="https://www.efe.cl/biotren/">
            EFE Trenes Metropolitanos · Biotrén
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Historia operacional">
        <p>
          El corredor sur tiene una historia operacional más{' '}
          <strong>política</strong> que la del corredor norte (Tomé) o
          el corredor del valle (Yumbel). Tres ejes:
        </p>
        <h3 className="mt-2 text-[13px] font-medium">
          Cierre del carbón (14-abr-1997)
        </h3>
        <p>
          Lota y Coronel fueron, durante más de un siglo, el centro
          carbonífero de Chile. La <strong>Empresa Nacional del Carbón
          (Enacar)</strong> cerró el <strong>14 de abril de 1997</strong>,
          marcando el fin del ciclo industrial-obrero. La{' '}
          <strong>Compañía Carbonífera Schwager</strong> (Coronel) había
          cerrado antes; <strong>Lota Verde</strong> cerró también en 1997.
        </p>
        <p>
          El impacto en la demanda de transporte fue profundo: el flujo
          dejó de ser <em>commuting</em> obrero hacia las minas y pasó a
          ser pendular residencial hacia Concepción (trabajo, salud,
          educación). El corredor de buses se mantuvo, pero perdió la
          base económica que justificaba alta frecuencia local.
        </p>
        <h3 className="mt-2 text-[13px] font-medium">
          Conflictividad sindical y tarifaria
        </h3>
        <p>
          La regulación Res. Ex. 457, al no fijar polinomio público, dejó
          la tarifa expuesta a negociación caso a caso. Hay registros de
          prensa de huelgas, paros parciales y disputas tarifarias en
          distintos años de la década 2010-2020 — detalle cronológico
          pendiente de archivo BioBioChile y Diario Concepción.
        </p>
        <h3 className="mt-2 text-[13px] font-medium">
          Accidentes en Ruta 160
        </h3>
        <p>
          La Ruta 160 ha sido escenario recurrente de accidentes graves
          (colisiones múltiples, salidas de pista, atropellos peatonales
          en cruces de Lomas Coloradas y Coronel norte). Es uno de los
          motores políticos del electrocorredor MOP que ahora se licita
          — la pista exclusiva reduce el conflicto entre flujo
          residencial, flujo industrial portuario y buses urbanos.
        </p>
        <PendingBanner>
          <strong>Cronología detallada de accidentes y paros pendiente.</strong>{' '}
          Esta sección está fundada en consenso de prensa regional pero
          sin fechas verificadas. Vía de cierre: archivo digitalizado
          BioBioChile + Diario Concepción + El Sur, búsqueda por año
          1997-2025 con términos "Ruta 160 accidente", "paro Coronel
          Lota", "huelga choferes Coronel".
        </PendingBanner>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Lota">
            Wikipedia · Lota (cierre Enacar 1997)
          </SourceLink>
          <SourceLink href="https://www.memoriachilena.gob.cl/602/w3-article-3611.html">
            Memoria Chilena · Carbón de Lota
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura del visor">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Lo que sí está en el visor
          </div>
          <ul className="mt-1 ml-5 list-disc space-y-0.5 text-[12px]">
            <li>
              <strong>Línea 2 del Biotrén</strong> (Concepción ↔ Coronel)
              — trazado y 14 estaciones digitalizadas desde OSM. La capa
              de tren no depende del feed GTFS de buses. Ver el artículo{' '}
              <a href="/wiki/biotren" className="underline underline-offset-2">
                Biotrén
              </a>
              .
            </li>
            <li>
              Algunos servicios urbanos del PE Gran Concepción que entran
              a San Pedro de la Paz por el lado norte del río Biobío
              (UN23 San Pedro del Mar, UN24 San Remo) — pero terminan en
              San Pedro, no continúan a Coronel ni Lota.
            </li>
          </ul>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Lo que NO está en el visor
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Todos los servicios troncales del corredor sur Concepción ↔
            Coronel ↔ Lota — porque operan bajo Res. Ex. 457 y no
            pertenecen al feed GTFS Gran Concepción del PE 2024. La
            ausencia es la misma que la del corredor Tomé (servicios
            401/411/421), pero allá hay un operador único identificable;
            aquí la fragmentación operacional dificulta incluso una
            digitalización OSM completa.
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Cuando se adjudique el PE Coronel-Lota formal y el operador
            ganador publique GTFS, el visor podrá sumar el corredor a la
            capa urbana. Mientras tanto, la única referencia visual del
            corredor en el visor es el tren.
          </p>
        </div>
        <Sources>
          <SourceLink href="https://datos.gob.cl/dataset/gtfs-gran-concepcion">
            Datos Abiertos del Estado · GTFS Gran Concepción (alcance limitado al PE 2024)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cronología">
        <Timeline
          items={[
            {
              date: '14-abr-1997',
              event: 'Cierre de Enacar y Lota Verde. Fin del ciclo carbonífero en Lota y Coronel. El corredor de buses pasa de obrero-industrial a residencial pendular.',
              source: { href: 'https://es.wikipedia.org/wiki/Lota', label: 'Wikipedia · Lota' },
            },
            {
              date: '2009',
              event: 'Apertura comercial de la Línea 2 del Biotrén (Concepción ↔ Coronel) rehabilitando el ramal histórico Concepción-Lota. El tren no llega a Lota urbano.',
              source: { href: 'https://es.wikipedia.org/wiki/Biotr%C3%A9n', label: 'Wikipedia · Biotrén' },
            },
            {
              date: '2012-2013',
              event: 'MTT emite la Resolución Exenta 457 creando una regulación especial para los servicios de transporte mayor de Coronel y Lota — "aproximada a un perímetro de exclusión", pero sin contrato de largo plazo ni operador único.',
            },
            {
              date: '13-nov-2024',
              event: 'CGR visa los llamados a licitación MOP de corredores de transporte público para Rutas 150 / 160 y Autopista Concepción-Talcahuano. Empieza el calendario del electrocorredor Ruta 160.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: '15-jul-2025',
              event: 'Diario Concepción publica que las bases de licitación del Perímetro de Exclusión Coronel-Lota están en Contraloría. Se anuncian 80 buses nuevos para el corredor sur.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/07/15/80-buses-nuevos-para-lota-y-coronel-las-bases-de-la-licitacion-estan-en-contraloria.html', label: 'Diario Concepción · 15-jul-2025' },
            },
            {
              date: '5-nov-2025',
              event: 'MOP recibe la oferta única del Consorcio Electro-Cointer para el corredor Ruta 160 (UF 4.414.000, 14 km, plazo 25 años).',
              source: { href: 'https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/', label: 'MOP · 5-nov-2025' },
            },
            {
              date: '3-dic-2025',
              event: 'Apertura de la oferta económica de Electro-Cointer para Ruta 160 — queda como único postulante a la adjudicación.',
            },
            {
              date: '28-ene-2026',
              event: 'MTT adjudica BusPay al Consorcio Buspay (operador técnico Busmatick). La cobertura incluye Coronel y Lota desde el inicio, cruzando el régimen Res. Ex. 457 con el PE Gran Concepción 2024 y el PE Tomé.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
            {
              date: 'Q3 2026 (proyectado)',
              event: 'Marcha blanca BusPay. Los operadores actuales del corredor sur instalan validadores antes de que el PE Coronel-Lota formal entre en vigor.',
            },
            {
              date: 'Post-2026 (proyectado)',
              event: 'Adjudicación del PE Coronel-Lota formal (sujeto a visación CGR de las bases, llamado a oferentes y proceso de evaluación). Renovación con 80 buses nuevos. Hereda la infraestructura BusPay ya instalada.',
            },
            {
              date: '2031-2032 (proyectado)',
              event: 'Puesta en servicio del electrocorredor MOP Ruta 160 entre San Pedro de la Paz y Coronel. Los últimos 8-10 km hasta Lota siguen en vialidad mixta.',
            },
          ]}
        />
      </Section>

      <Section title="Vínculos con otros artículos">
        <p>
          Si llegas a esta ficha buscando el régimen institucional que
          regula el corredor, mira primero{' '}
          <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
            SEREMITT Biobío y la DTPR
          </a>{' '}
          — es la autoridad que fiscaliza la Res. Ex. 457 y la que
          tramita las bases del PE formal en Contraloría.
        </p>
        <p>
          Para entender por qué Coronel-Lota está fuera del régimen
          principal del Gran Concepción, lee{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro de Exclusión del Gran Concepción 2024
          </a>{' '}
          y compara con el otro perímetro metropolitano del Biobío,{' '}
          <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
            Perímetro de Exclusión de Tomé
          </a>
          .
        </p>
        <p>
          El sistema de pago electrónico que cruza los tres regímenes
          (PE Gran Concepción + PE Tomé + Res. Ex. 457 Coronel-Lota +
          licitación 201 Santa Juana) está documentado en{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            BusPay 2026
          </a>
          .
        </p>
        <p>
          Para la infraestructura vial que reemplazará parcialmente al
          corredor desde 2031-2032, ve{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            Electrocorredores MOP del Biobío
          </a>
          . Para el modo competidor por el mismo eje, lee{' '}
          <a href="/wiki/biotren" className="underline underline-offset-2">
            Biotrén
          </a>
          .
        </p>
        <p>
          La razón por la que el visor no muestra los servicios troncales
          del corredor sur está explicada en{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>
          .
        </p>
        <p>
          Para operadores con presencia cruzada en otros corredores del
          wiki (Las Galaxias también opera la Línea 80 / UN80 del PE
          Gran Concepción), ve{' '}
          <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
            Concepción ↔ Florida (corredor de El Pimentón)
          </a>{' '}
          y el resto del índice en{' '}
          <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
            Recorridos interurbanos del Gran Concepción
          </a>
          .
        </p>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Número exacto, fecha de emisión y texto íntegro de la Resolución Exenta 457 del MTT (citada como "2012-2013" en el wiki, sin link directo al expediente).</li>
          <li>Estado actual de las bases del PE Coronel-Lota en Contraloría — ¿visadas? ¿con observaciones? ¿llamado a oferentes publicado?</li>
          <li>Razón social formal y RUT de los operadores actuales (Las Galaxias S.A.?, Buses J. Ewert qué razón social?), padrón de flota y terminal de cada uno.</li>
          <li>Códigos de línea canónicos bajo Res. Ex. 457 (no hay numeración unificada publicada).</li>
          <li>Tarifa adulto vigente 2026 por operador y por tramo (Concepción ↔ Coronel vs. Concepción ↔ Lota).</li>
          <li>Tabla horaria oficial lun-vie / sáb / dom para las troncales.</li>
          <li>Cronología documentada de paros, huelgas y conflictos tarifarios del corredor sur (1997-2025).</li>
          <li>Estado de la digitalización OSM del corredor — paraderos clave en San Pedro, Coronel, Lota Bajo y Lota Alto.</li>
          <li>Integración tarifaria Conecta (Biotrén) ↔ BusPay (bus) — confirmación pública pendiente.</li>
          <li>Decreto MTT futuro de adjudicación del PE Coronel-Lota formal cuando se publique.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia (Ley 20.285) a la
          Subsecretaría de Transportes y a la DTPR Biobío; consulta a
          Contraloría por el expediente de las bases del PE; archivo
          digital de BioBioChile, Diario Concepción y El Sur con
          búsqueda por año; foto del cartel de horarios en los terminales
          de Coronel y Lota.
        </p>
      </Section>

      <Section title="Bibliografía">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/07/15/80-buses-nuevos-para-lota-y-coronel-las-bases-de-la-licitacion-estan-en-contraloria.html">
              Diario Concepción · 15-jul-2025 — Bases PE Coronel-Lota en Contraloría · 80 buses nuevos
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
              Subtrans · 30-ene-2026 — Adjudicación BusPay (incluye Coronel y Lota)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
              BioBioChile · 28-ene-2026 — Consorcio Buspay adjudicado
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://concesiones.mop.gob.cl/project/corredor-de-transporte-publico-ruta-160/">
              MOP Concesiones · ficha proyecto Corredor Ruta 160
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/">
              MOP · 5-nov-2025 — Oferta Electro-Cointer Ruta 160
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
              Diario Concepción · 13-nov-2024 — CGR visa licitaciones Ruta 160 / Ruta 150
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
              Wikipedia · Perímetro de Exclusión del Gran Concepción (sección Coronel-Lota)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
              Wikipedia · Buses licitados del Gran Concepción
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
              Wikipedia · Biotrén (Línea 2 Concepción-Coronel)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8102">
              BCN · Reportes comunales Coronel 2017
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8105">
              BCN · Reportes comunales Lota 2017
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Lota">
              Wikipedia · Lota (cierre Enacar 1997)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.memoriachilena.gob.cl/602/w3-article-3611.html">
              Memoria Chilena · Carbón de Lota
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/9239557">
              OSM relation 9239557 · Ruta 160 (ref=160)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://dprbiobio.dpr.gob.cl/">
              DTPR Biobío · sitio oficial
            </SourceLink>
          </li>
        </ul>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes copia de la Resolución Exenta 457 del MTT, el
          expediente de las bases del PE Coronel-Lota en Contraloría,
          foto del cartel de horarios en los terminales de Concepción /
          Coronel / Lota, o conoces la razón social y RUT formales de
          los operadores actuales — abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-coronel-lota.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-coronel-lota.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
