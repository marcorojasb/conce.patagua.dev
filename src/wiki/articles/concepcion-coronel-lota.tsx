// Concepción ↔ Coronel ↔ Lota — corredor sur metropolitano.
// Eje Ruta 160 ("Camino a Lota"), también electrocorredor MOP en
// licitación (Consorcio Electro-Cointer, UF 4.414.000, 5-nov-2025).
//
// Régimen jurídico: NO hay PE formal. Opera la Res. Ex. 457 MTT
// (2012-2013), "aproximada a un PE". El PE formal está en bases de
// licitación en Contraloría desde jul-2025 (80 buses proyectados).
// Coexiste con Biotrén L2 (sin llegar a Lota) y el electrocorredor MOP.

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
        Eje Ruta 160, poblaciones (Censo 2017 BCN: Coronel 116.262 hab.,
        Lota 43.535 hab.), cierre del carbón el <strong>14-abr-1997</strong>{' '}
        (Enacar / Lota Verde), Biotrén L2 (2009), electrocorredor Ruta 160
        (UF 4.414.000, Consorcio Electro-Cointer 5-nov-2025) y BusPay 2026
        (adjudicado 28-ene-2026, incluye Coronel y Lota): todo con fuente.{' '}
        <strong>Pendiente</strong>: texto completo de la Res. Ex. 457 MTT,
        estado de las bases del PE Coronel-Lota en Contraloría, tarifa
        adulto 2026, lista canónica de operadores.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          El corredor <strong>Concepción ↔ Coronel ↔ Lota</strong> es la{' '}
          <strong>espina dorsal sur</strong> del Gran Concepción. Conecta
          el centro de Concepción con <strong>San Pedro de la Paz</strong>{' '}
          (puente Llacolén / Bicentenario sobre el Biobío),{' '}
          <strong>Lomas Coloradas</strong>, <strong>Coronel</strong>{' '}
          (116.262 hab. Censo 2017) y <strong>Lota</strong> (43.535 hab.)
          por la <strong>Ruta 160</strong>.
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Régimen sin PE formal.</strong> Coronel y Lota
            quedaron fuera de la licitación 2002. Operan bajo{' '}
            <strong>Res. Ex. 457 MTT</strong> (2012-2013): "aproximada a
            un PE", sin contrato de largo plazo ni polinomio publicado,
            con fiscalización SEREMITT.
          </li>
          <li>
            <strong>Conflictividad histórica.</strong> El más tensionado
            del Biobío por la transición post-carbón (Enacar y Lota Verde,
            14-abr-1997), huelgas recurrentes y accidentes en Ruta 160.
          </li>
          <li>
            <strong>Coexistencia con tren y electrocorredor.</strong> El{' '}
            <strong>Biotrén L2</strong> (Concepción ↔ Coronel, 14
            estaciones, desde 2009) cubre el mismo eje; el{' '}
            <strong>electrocorredor MOP Ruta 160</strong> (San Pedro ↔
            Coronel, 14 km, UF 4.414.000) reemplazará parte de la vialidad
            desde 2031-2032. Único corredor del wiki con tres modos
            competidores simultáneos.
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
              'Comunas',
              <>
                <strong>Concepción</strong> (centro, salida sur por
                Bicentenario / Llacolén), <strong>San Pedro de la Paz</strong>{' '}
                (Boca Sur, Candelaria, Michaihue, Lomas, San Pedro del Mar),{' '}
                <strong>Coronel</strong> (urbano, Yobilo, Maule, Lagunillas,
                Escuadrón) y <strong>Lota</strong> (Bajo y Alto).
              </>,
            ],
            [
              'Eje vial',
              <>
                <strong>Ruta 160</strong> (OSM relation 9239557,{' '}
                <code className="font-mono">ref=160</code>, "Camino a Lota").
                Doble vía concesionada (Autopista del Itata / Costa Arauco),
                peaje troncal en Coronel.
              </>,
            ],
            ['Distancia Concepción → Lota', '~38 km (peaje Coronel, Boca Sur, intercambio Lagunillas)'],
            ['Tiempo en bus', '~55-80 min según hora y trazado intermedio'],
            ['Vías secundarias', 'Av. Las Industrias / Costanera (San Pedro), camino antiguo Coronel-Lota Alto, accesos Yobilo, Maule, Escuadrón.'],
            [
              'Corte del artículo',
              <>
                Acotado a <strong>Concepción ↔ Coronel ↔ Lota</strong>{' '}
                (Res. Ex. 457). El interurbano hacia Laraquete / Arauco
                queda fuera (régimen privado distinto).
              </>,
            ],
            ['Hidrografía', 'Cruce del Biobío, bordemar San Pedro, plano costero a Coronel/Lota; sin cuestas duras.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/relation/9239557">
            OSM relation 9239557 · Ruta 160
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8102">
            BCN · Coronel 2017
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Régimen jurídico: Res. Ex. 457 y la licitación 2025">
        <p>
          La regulación del corredor sur es <strong>distinta</strong> al
          resto del Gran Concepción. Coronel y Lota quedaron fuera de la
          licitación 2002 (ver{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            PE Gran Concepción 2024
          </a>
          ). Lo que opera hoy es un instrumento ad-hoc:
        </p>
        <KeyValueList
          items={[
            ['Instrumento', <><strong>Res. Ex. N° 457 MTT</strong> (2012-2013). Regulación especial para Coronel y Lota, "aproximada a un PE" pero formalmente no lo es.</>],
            ['Naturaleza jurídica', 'Resolución exenta de toma de razón; más débil que un decreto supremo (no asegura contrato de largo plazo ni tarifa uniforme).'],
            ['Tarifa', 'Sin tarifa única vinculante. Operadores ajustan con anuencia de SEREMITT bajo polinomio no publicado.'],
            ['Fiscalización', 'SEREMITT Biobío + DTPR Biobío. Programa "Más Pasajes Por Tu Plata".'],
            ['Cobertura', 'Servicios mayores de Coronel y Lota, incluyendo troncales a Concepción por Ruta 160.'],
            ['Vigencia', 'Activa al cierre 2025, en espera del PE formal en Contraloría.'],
          ]}
        />
        <p className="mt-2">
          En paralelo, las <strong>bases del PE Coronel-Lota formal</strong>{' '}
          están en Contraloría desde <strong>julio de 2025</strong>:
        </p>
        <KeyValueList
          items={[
            ['Estado a jul-2025', 'Bases ingresadas a CGR — pendiente toma de razón.'],
            ['Flota proyectada', '80 buses nuevos — primera renovación masiva del corredor sur.'],
            ['Anuncio', 'Diario Concepción · 15-jul-2025.'],
            ['Calendario', 'Visación → llamado → adjudicación → marcha blanca. Sin fecha firme.'],
            [
              'Encaje con BusPay',
              <>
                BusPay (adjudicado a{' '}
                <a href="/wiki/buspay" className="underline underline-offset-2">
                  Consorcio Buspay
                </a>{' '}
                el 28-ene-2026, marcha blanca Q3 2026) cubre Coronel y
                Lota desde el inicio. El PE formal hereda los validadores
                ya instalados.
              </>,
            ],
          ]}
        />
        <PendingBanner>
          <strong>Texto exacto de la Res. Ex. 457 pendiente.</strong> La
          referencia "2012-2013" aparece en varios artículos del wiki
          (BusPay 2026, PE Gran Concepción 2024) sin link al expediente.
          Cierre por Ley de Transparencia a SUBTRANS pidiendo copia
          íntegra y numeración correlativa.
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
          Múltiples empresas privadas — sin operador único. El wiki
          cruza <strong>Las Galaxias</strong> y <strong>Buses J. Ewert</strong>:
        </p>
        <OperatorTable
          rows={[
            {
              name: 'Las Galaxias',
              routes: 'Línea 80 (UN80 PE GC) + corredor sur Res. Ex. 457',
              terminal: 'Concepción centro · pendiente',
              notes: <p>Titular de la <strong>UN80 / Línea 80</strong> en el PE GC 2024; misma razón social con presencia en Coronel-Lota. Líneas, flota y terminal específicos pendientes.</p>,
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Buses J. Ewert',
              routes: 'Troncales Concepción ↔ Coronel ↔ Lota — códigos pendientes',
              terminal: 'Pendiente',
              notes: <p>Operador histórico en la cartera DPR Biobío. Sin razón social ni padrón confirmados.</p>,
            },
          ]}
        />
        <PendingBanner>
          <strong>Lista incompleta.</strong> Padrón Res. Ex. 457 no
          publicado. Faltan operadores de Lota Bajo/Alto y Coronel urbano.
          Cierre por Ley de Transparencia a DTPR Biobío.
        </PendingBanner>
      </Section>

      <Section title="Servicios y frecuencias">
        <p className="text-[12px] text-muted-foreground">
          El feed{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>{' '}
          <strong>no cubre</strong> el corredor sur (Res. Ex. 457 ≠ PE
          2024). El visor solo muestra la <em>L2 del Biotrén</em> en este
          eje.
        </p>
        <KeyValueList
          items={[
            ['Codificación', 'Sin numeración unificada publicada. Operadores usan nombres comerciales y números de máquina; troncales se identifican por destino (Lota Bajo/Alto, Coronel terminal, Lagunillas, Maule, San Pedro del Mar).'],
            ['Variantes de trazado', 'Tres familias: troncal a Lota Bajo (eje completo), troncal a Coronel terminal, ramales internos Coronel-Lota Alto + alimentadores Lomas / Boca Sur / Candelaria.'],
            ['Frecuencia punta', 'Pendiente. Prensa local cita saturación punta mañana hacia Concepción y tarde hacia el sur.'],
            ['Primera/última salida', 'Pendiente verificar en terreno.'],
            ['Tiempo real', 'No documentado. App Red Regional cubre PE GC y PE Tomé; Coronel-Lota no confirmado.'],
            ['GTFS público', 'NO publicado. Ausente del visor.'],
          ]}
        />
        <PendingBanner>
          <strong>Tabla horaria oficial pendiente.</strong> Cierre por
          foto del cartel en terminales (Maipú / O'Higgins en Concepción,
          Coronel, Lota Bajo) y Ley de Transparencia a DTPR por el padrón
          Res. Ex. 457.
        </PendingBanner>
      </Section>

      <Section title="Tarifa y ajuste">
        <KeyValueList
          items={[
            ['Tarifa adulto 2026', 'Pendiente — sin tarifa única publicada. Varía por operador y tramo (Concepción ↔ Coronel < Concepción ↔ Lota).'],
            ['Tarifa escolar', 'Pendiente. Aplicación de Ley 20.378 bajo Res. Ex. 457 no documentada.'],
            ['Accesibilidad universal', 'Pendiente. Res. Ex. 457 no exige flota AU; el PE formal sí.'],
            ['Polinomio', 'No publicado. Reajustes se tramitan con SEREMITT caso a caso (a diferencia del PE Gran Concepción).'],
          ]}
        />
        <p className="mt-2">
          La tarifa es <strong>fuente recurrente de conflicto</strong>:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <strong>Paros y huelgas de choferes</strong> en la década
            2010-2020 (fechas exactas pendientes). La regulación sin
            polinomio público hace que cada alza se discuta caso a caso.
          </li>
          <li>
            <strong>"Más Pasajes Por Tu Plata"</strong> de SEREMITT
            Biobío como mecanismo de control aplicado al corredor sur.
          </li>
          <li>
            Pendiente: cronología documentada de paros y alzas tarifarias.
            Cierre por archivo BioBioChile / Diario Concepción.
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · sitio oficial
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Integración con BusPay (Q3 2026)">
        <p>
          BusPay, adjudicado al <strong>Consorcio Buspay</strong> el{' '}
          <strong>28-ene-2026</strong> (operador técnico Busmatick, ver{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            BusPay 2026
          </a>
          ), <strong>sí cubre</strong> Coronel y Lota desde el inicio.
          Cruza regímenes (PE GC + PE Tomé + Res. Ex. 457 + 201 Santa
          Juana) en un solo medio de pago.
        </p>
        <KeyValueList
          items={[
            ['Cobertura', 'Coronel y Lota = 2 de las 11 comunas del alcance BusPay.'],
            ['Validadores', 'Parte del paquete de 1.800-2.000 validadores embarcados.'],
            ['Marcha blanca', 'Q3 2026. Fecha exacta para Coronel-Lota no desglosada.'],
            ['100% electrónico', 'Proyectado fin de 2026. Para operadores Res. Ex. 457 implica instalar validadores antes del PE formal.'],
            ['Encaje con PE formal', 'El PE Coronel-Lota formal hereda la infraestructura BusPay ya instalada — sin segunda licitación de recaudo.'],
            ['Tarjeta', 'Campanil UdeC (consulta ciudadana) + tarjeta bancaria contactless, QR.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026 — Adjudicación BusPay (11 comunas)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 — BusPay adjudicado
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tensión con el Electrocorredor Ruta 160">
        <p>
          El <strong>electrocorredor MOP Ruta 160</strong> es el proyecto
          que más afecta al corredor sur (ver{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            Electrocorredores MOP del Biobío
          </a>
          ):
        </p>
        <KeyValueList
          items={[
            ['Tramo', 'San Pedro ↔ Coronel · 14 km bidireccionales'],
            ['Sector A', 'Daniel Belmar ↔ Av. Cuatro Sur — 7,3 km (San Pedro)'],
            ['Sector B', 'Av. Cuatro Sur ↔ Parque Industrial Escuadrón I — 6,9 km (Coronel)'],
            ['Inversión', 'UF 4.414.000 (~USD 171 millones)'],
            ['Oferente único', 'Consorcio Electro-Cointer (Cointer Concesiones / Grupo Azvi)'],
            ['Recepción ofertas', '5-nov-2025'],
            ['Apertura económica', '3-dic-2025'],
            ['Adjudicación', 'Q1 2026'],
            ['Plazo', '300 meses (25 años)'],
            ['Puesta en servicio', '2031-2032'],
            [
              'Alcance',
              <>
                Hasta Parque Industrial Escuadrón I (Coronel norte).{' '}
                <strong>NO llega a Lota</strong>: últimos 8-10 km en
                vialidad mixta.
              </>,
            ],
            ['Coexistencia con buses', 'En 2031-2032 los buses usan pista exclusiva San Pedro-Coronel; en Coronel-Lota siguen en vialidad mixta.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/project/corredor-de-transporte-publico-ruta-160/">
            MOP Concesiones · Corredor Ruta 160
          </SourceLink>
          <SourceLink href="https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/">
            MOP · 5-nov-2025 — Oferta Electro-Cointer
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
            Diario Concepción · 13-nov-2024 — CGR visa Ruta 160 / 150
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tensión con el Biotrén Línea 2">
        <p>
          La <strong>L2 del Biotrén</strong> (Concepción ↔ Coronel, 14
          estaciones, desde 2009) cubre el mismo eje. A diferencia de
          Concepción ↔ Tomé (donde el tren no llega), aquí buses y tren
          conviven directamente.
        </p>
        <KeyValueList
          items={[
            ['Terminal sur del tren', 'Estación Coronel — el tren NO llega a Lota. Lota solo en bus.'],
            ['Capacidad', 'Tren: Xtrapolis cada 12-15 min punta. Bus: frecuencia agregada mayor, capacidad por vehículo menor.'],
            ['Tarifa', 'Biotrén Z1-Z10 desde 2-ene-2026 (ver artículo Biotrén). Bus Res. Ex. 457: pendiente.'],
            ['Tarjeta', 'Biotrén: Conecta (desde 2023). Bus: BusPay (Q3 2026). Integración Conecta ↔ BusPay no confirmada.'],
            [
              'Coexistencia',
              <>
                Tren cubre el eje estructural; buses cubren la red capilar
                (Lota Alto/Bajo, periferia de Coronel). Extender el
                Biotrén a Lota se discute recurrentemente (ver{' '}
                <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
                  Biotrén y sus extensiones
                </a>
                ), pero 80 buses del PE formal y el electrocorredor MOP
                están más cerca de ejecutarse.
              </>,
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          <MapLink route="L2">Ver L2 Coronel ↔ Concepción →</MapLink>
        </p>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
            Wikipedia · Biotrén (L2, 2009)
          </SourceLink>
          <SourceLink href="https://www.efe.cl/biotren/">
            EFE Trenes Metropolitanos · Biotrén
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Historia operacional">
        <p>
          El corredor sur tiene una historia más <strong>política</strong>{' '}
          que la del corredor norte (Tomé) o el del valle (Yumbel):
        </p>
        <h3 className="mt-2 text-[13px] font-medium">
          Cierre del carbón (14-abr-1997)
        </h3>
        <p>
          <strong>Enacar</strong> cerró el <strong>14-abr-1997</strong>,
          fin del ciclo industrial-obrero. La <strong>Carbonífera
          Schwager</strong> (Coronel) había cerrado antes;{' '}
          <strong>Lota Verde</strong> también en 1997. El flujo de
          transporte dejó de ser commuting obrero a las minas y pasó a
          pendular residencial hacia Concepción (trabajo, salud,
          educación).
        </p>
        <h3 className="mt-2 text-[13px] font-medium">
          Conflictividad sindical y tarifaria
        </h3>
        <p>
          Res. Ex. 457 sin polinomio público expone cada alza a
          negociación caso a caso. Hay registros de huelgas y paros en
          2010-2020; cronología pendiente de archivo de prensa.
        </p>
        <h3 className="mt-2 text-[13px] font-medium">Accidentes en Ruta 160</h3>
        <p>
          Ruta 160 ha sido escenario recurrente de colisiones, salidas de
          pista y atropellos (Lomas Coloradas, Coronel norte). Es uno de
          los motores políticos del electrocorredor MOP — la pista
          exclusiva reduce conflicto entre flujo residencial, industrial
          portuario y buses.
        </p>
        <PendingBanner>
          <strong>Cronología detallada pendiente.</strong> Fundada en
          consenso de prensa regional sin fechas verificadas. Cierre por
          archivo BioBioChile + Diario Concepción + El Sur (1997-2025).
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
          <div className="text-[12px] font-medium">Lo que sí está</div>
          <ul className="mt-1 ml-5 list-disc space-y-0.5 text-[12px]">
            <li>
              <strong>L2 del Biotrén</strong> (Concepción ↔ Coronel) —
              trazado y 14 estaciones desde OSM. No depende del GTFS de
              buses. Ver{' '}
              <a href="/wiki/biotren" className="underline underline-offset-2">
                Biotrén
              </a>
              .
            </li>
            <li>
              Algunos servicios del PE Gran Concepción que entran a San
              Pedro (UN23, UN24) — terminan en San Pedro, no siguen a
              Coronel ni Lota.
            </li>
          </ul>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">Lo que NO está</div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Todos los troncales del corredor sur — operan bajo Res. Ex.
            457, fuera del GTFS PE 2024. A diferencia de Tomé (operador
            único, 401/411/421), la fragmentación operacional aquí
            dificulta incluso la digitalización OSM. Cuando se adjudique
            el PE formal y se publique GTFS, el visor podrá sumar el
            corredor.
          </p>
        </div>
        <Sources>
          <SourceLink href="https://datos.gob.cl/dataset/gtfs-gran-concepcion">
            Datos Abiertos · GTFS Gran Concepción (alcance PE 2024)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cronología">
        <Timeline
          items={[
            {
              date: '14-abr-1997',
              event: 'Cierre de Enacar y Lota Verde. Fin del ciclo carbonífero; el corredor pasa de obrero-industrial a pendular residencial.',
              source: { href: 'https://es.wikipedia.org/wiki/Lota', label: 'Wikipedia · Lota' },
            },
            {
              date: '2009',
              event: 'Apertura del Biotrén L2 (Concepción ↔ Coronel) sobre el ramal histórico. El tren no llega a Lota urbano.',
              source: { href: 'https://es.wikipedia.org/wiki/Biotr%C3%A9n', label: 'Wikipedia · Biotrén' },
            },
            {
              date: '2012-2013',
              event: 'MTT emite la Res. Ex. 457 — regulación especial para Coronel y Lota "aproximada a un PE", sin contrato de largo plazo.',
            },
            {
              date: '13-nov-2024',
              event: 'CGR visa licitaciones MOP de corredores Ruta 150 / 160 / Autopista Concepción-Talcahuano.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: '15-jul-2025',
              event: 'Bases del PE Coronel-Lota en Contraloría. Se anuncian 80 buses nuevos.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/07/15/80-buses-nuevos-para-lota-y-coronel-las-bases-de-la-licitacion-estan-en-contraloria.html', label: 'Diario Concepción · 15-jul-2025' },
            },
            {
              date: '5-nov-2025',
              event: 'MOP recibe oferta única del Consorcio Electro-Cointer para Ruta 160 (UF 4.414.000, 14 km, 25 años).',
              source: { href: 'https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/', label: 'MOP · 5-nov-2025' },
            },
            {
              date: '3-dic-2025',
              event: 'Apertura económica Electro-Cointer — único postulante.',
            },
            {
              date: '28-ene-2026',
              event: 'MTT adjudica BusPay al Consorcio Buspay (operador técnico Busmatick), cobertura incluye Coronel y Lota.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
            { date: 'Q3 2026 (proyectado)', event: 'Marcha blanca BusPay. Validadores en operadores Res. Ex. 457.' },
            { date: 'Post-2026 (proyectado)', event: 'Adjudicación del PE formal con 80 buses nuevos. Hereda infraestructura BusPay.' },
            { date: '2031-2032 (proyectado)', event: 'Puesta en servicio del electrocorredor MOP Ruta 160 (San Pedro ↔ Coronel). Lota sigue en vialidad mixta.' },
          ]}
        />
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
              SEREMITT Biobío y la DTPR
            </a>{' '}
            — autoridad que fiscaliza Res. Ex. 457 y tramita el PE formal.
          </li>
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              PE Gran Concepción 2024
            </a>{' '}
            y{' '}
            <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
              PE Tomé
            </a>{' '}
            — los otros regímenes metropolitanos para comparación.
          </li>
          <li>
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay 2026
            </a>{' '}
            — pago electrónico que cruza los tres regímenes + 201 Santa
            Juana.
          </li>
          <li>
            <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
              Electrocorredores MOP del Biobío
            </a>{' '}
            — infraestructura vial que reemplazará parte del corredor
            desde 2031-2032.
          </li>
          <li>
            <a href="/wiki/biotren" className="underline underline-offset-2">
              Biotrén
            </a>{' '}
            — modo competidor por el mismo eje.
          </li>
          <li>
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>{' '}
            — por qué el visor no muestra los troncales del corredor sur.
          </li>
          <li>
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
              Concepción ↔ Florida
            </a>{' '}
            y{' '}
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Recorridos interurbanos
            </a>{' '}
            — operadores con presencia cruzada (Las Galaxias / Línea 80).
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Número, fecha y texto íntegro de la Res. Ex. 457 MTT (citada "2012-2013" sin link al expediente).</li>
          <li>Estado de las bases del PE Coronel-Lota en Contraloría (visadas / observaciones).</li>
          <li>Razón social, RUT, padrón de flota y terminal de Las Galaxias y Buses J. Ewert.</li>
          <li>Códigos de línea canónicos bajo Res. Ex. 457.</li>
          <li>Tarifa adulto 2026 por operador y tramo (Concepción ↔ Coronel vs ↔ Lota).</li>
          <li>Tabla horaria lun-vie / sáb / dom de las troncales.</li>
          <li>Cronología de paros, huelgas y alzas tarifarias (1997-2025).</li>
          <li>Digitalización OSM de paraderos clave (San Pedro, Coronel, Lota Bajo/Alto).</li>
          <li>Integración tarifaria Conecta ↔ BusPay.</li>
          <li>Decreto MTT de adjudicación del PE formal.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Cierre: Ley de Transparencia (Ley 20.285) a SUBTRANS y DTPR
          Biobío; consulta a Contraloría; archivo BioBioChile / Diario
          Concepción / El Sur; foto de carteles en terminales.
        </p>
      </Section>

      <Section title="Bibliografía">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/07/15/80-buses-nuevos-para-lota-y-coronel-las-bases-de-la-licitacion-estan-en-contraloria.html">
              Diario Concepción · 15-jul-2025 — Bases PE Coronel-Lota / 80 buses
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
              Subtrans · 30-ene-2026 — Adjudicación BusPay
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
              BioBioChile · 28-ene-2026 — Consorcio Buspay
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://concesiones.mop.gob.cl/project/corredor-de-transporte-publico-ruta-160/">
              MOP Concesiones · Corredor Ruta 160
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/">
              MOP · 5-nov-2025 — Oferta Electro-Cointer
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
              Diario Concepción · 13-nov-2024 — CGR visa Ruta 160 / 150
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
              Wikipedia · PE Gran Concepción (sección Coronel-Lota)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
              Wikipedia · Buses licitados del Gran Concepción
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
              Wikipedia · Biotrén (L2)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8102">
              BCN · Coronel 2017
            </SourceLink>
            {' '}·{' '}
            <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8105">
              BCN · Lota 2017
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Lota">
              Wikipedia · Lota (cierre Enacar 1997)
            </SourceLink>
            {' '}·{' '}
            <SourceLink href="https://www.memoriachilena.gob.cl/602/w3-article-3611.html">
              Memoria Chilena · Carbón de Lota
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/9239557">
              OSM relation 9239557 · Ruta 160
            </SourceLink>
            {' '}·{' '}
            <SourceLink href="https://dprbiobio.dpr.gob.cl/">
              DTPR Biobío
            </SourceLink>
          </li>
        </ul>
      </Section>

      <Section title="Para contribuir">
        <p>
          Copia de la Res. Ex. 457 MTT, expediente del PE Coronel-Lota en
          Contraloría, foto de carteles de horarios o razón social y RUT
          de los operadores → pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-coronel-lota.tsx">
            github.com/marcorojasb/conce.patagua.dev
          </SourceLink>
          .
        </p>
      </Section>
    </div>
  );
}
