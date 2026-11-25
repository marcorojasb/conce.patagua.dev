// Concepción ↔ Coronel ↔ Lota, corredor sur metropolitano (eje Ruta 160,
// "Camino a Lota").
//
// Régimen: NO hay PE formal. Opera la Res. Ex. 457 MTT (2012-2013),
// "aproximada a un PE". La licitación del PE (80 buses: 50 eléctricos y 30
// diésel) tiene bases con toma de razón de Contraloría (dictamen
// E147498, 1-sep-2025), llamado el 12-sep-2025 y sigue sin adjudicar al
// 25-nov-2026 (quinta prórroga de admisibilidad, hasta el 3-dic-2026).
// El electrocorredor MOP Ruta 160 es otro proyecto (Electro-Cointer).
// En el visor: 302 y 304 (Lota ↔ Concepción) desde el GTFS oficial DTPR
// (versión 20250228, cotejado el 24-nov-2026); el resto de los troncales no.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  KeyValueList,
  NewsPulse,
  OperatorTable,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';
import { MapLink } from '@/wiki/map-link';

const LINK = 'underline underline-offset-2';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function ConcepcionCoronelLota() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias y prensa
        regional con nombre.</strong> Eje Ruta 160, población (Censo 2017
        BCN), licitación del PE Coronel-Lota (ofertas y prórrogas hasta el
        18-nov-2026), electrocorredor MOP y BusPay. <strong>Pendientes</strong>:
        texto de la Res. Ex. 457 MTT, tarifa adulto 2026, lista canónica de
        operadores y horario de los troncales.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Régimen', value: 'Res. Ex. 457 MTT (sin PE formal)' },
          { label: 'Licitación PE', value: '80 buses · sin adjudicar' },
          { label: 'En el visor', value: <><MapLink route="302">302</MapLink>{' · 304 · '}<MapLink route="L2">L2</MapLink></> },
          { label: 'Distancia', value: '~38 km a Lota' },
          { label: 'Tarifa adulto', value: 'sin publicar' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            El corredor une Concepción con San Pedro de la Paz, Coronel
            (116.262 hab.) y Lota (43.535 hab.) por la <strong>Ruta 160</strong>,
            con varias empresas privadas y sin operador único.
          </>,
          <>
            No hay perímetro de exclusión formal: rige la{' '}
            <strong>Res. Ex. 457 MTT</strong> (2012-2013), sin contrato de
            largo plazo ni polinomio público.
          </>,
          <>
            La licitación del PE (50 buses eléctricos y 30 diésel) recibió
            cinco ofertas y <strong>no está adjudicada</strong>: la admisibilidad
            suma cinco prórrogas, la última hasta el 3-dic-2026.
          </>,
          <>
            El visor muestra la <strong>302</strong> y la <strong>304</strong>{' '}
            (GTFS oficial) y la <strong>L2 del Biotrén</strong>. El resto de
            los troncales no tiene GTFS.
          </>,
          <>
            El electrocorredor MOP Ruta 160 y el Biotrén L2 comparten el eje,
            pero ninguno llega a Lota.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '18-nov-2026',
            title: 'Quinta prórroga de la licitación: admisibilidad hasta el 3-dic-2026',
            detail:
              'La evaluación se extendió 20 días. El alcalde de Coronel, Boris Chamorro, pidió explicaciones al ministro Louis de Grange; el senador Enrique Van Rysselberghe dijo que la prórroga no significa que la licitación haya fracasado.',
            source: {
              href: 'https://www.canal9.cl/episodios/2026/11/18/emplazan-a-de-grange-por-quinta-prorroga-en-licitacion-de-transporte-coronel-lota-debera-responder',
              label: 'Canal 9 · 18-nov-2026',
            },
          },
          {
            date: '21-oct-2026',
            title: 'Cinco ofertas y cuatro prórrogas de admisibilidad',
            detail:
              'Cuatro ofertas por los 50 buses eléctricos (Lota-Concepción y Lota-Talcahuano) y una por los 30 diésel (Colcura-Concepción). Alcaldes de Coronel y Lota exigen frenar nuevas postergaciones.',
            source: {
              href: 'https://www.diarioconcepcion.cl/politica/2026/10/21/retraso-licitacion-buses-lota-coronel.html',
              label: 'Diario Concepción · 21-oct-2026',
            },
          },
          {
            date: '4-ago-2026',
            title: 'Hacienda congela la adjudicación del electrocorredor Ruta 160',
            detail:
              'El MOP pasó el proyecto a obra pública directa. Estado y fechas en la ficha de corredores MOP.',
            source: {
              href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/04/gobierno-frena-corredores-de-transporte-publico-en-gran-concepcion-en-que-invertirian-us400-millones.shtml',
              label: 'BioBioChile · 4-ago-2026',
            },
          },
        ]}
      />

      <Section title="Servicios y frecuencias">
        <p className="text-[12px] text-muted-foreground">
          El{' '}
          <a href="/wiki/gtfs-gran-concepcion" className={LINK}>
            GTFS oficial de la DTPR
          </a>{' '}
          trae solo la <strong>302</strong> y la <strong>304</strong>, Lota ↔
          Concepción por Coronel y la Ruta 160 (cabecera en Av. Collao). El
          resto de los troncales no tiene GTFS.{' '}
          <MapLink route="302">Ver la 302 en el mapa →</MapLink>
        </p>
        <KeyValueList
          items={[
            ['302 (GTFS, programa 28-feb-2025)', 'De lunes a viernes, 169 salidas por sentido entre ~07:00 y ~21:00, una cada ~5 min; viaje de ~2 h 5 min a 2 h 15 min. Sábado y domingo, 73 por sentido entre ~08:00 y ~20:00.'],
            ['304 (GTFS)', 'Programa acotado: de lunes a viernes, 37 salidas hacia Concepción entre 06:03 y 09:03 y 85 hacia Lota entre 09:01 y 16:01.'],
            ['Otros troncales', 'Sin numeración unificada: se identifican por destino (Lota Bajo/Alto, Coronel terminal, Lagunillas, Maule, San Pedro del Mar). Frecuencia y primera/última salida, pendientes. La prensa cita saturación en la punta de la mañana hacia Concepción y de la tarde hacia el sur.'],
            ['Tiempo real', 'No documentado. La fuente de llegadas en vivo del visor (app de Transapp, no oficial) no sigue la 302 ni la 304.'],
          ]}
        />
        <PendingBanner>
          <strong>Tabla horaria oficial de los troncales pendiente.</strong>{' '}
          Cierre por foto del cartel en los terminales (Maipú / O'Higgins en
          Concepción, Coronel, Lota Bajo) y por Ley de Transparencia a la
          DTPR.
        </PendingBanner>
      </Section>

      <Section title="Operadores">
        <p className="text-[12px] text-muted-foreground">
          Varias empresas privadas, sin operador único. El wiki cruza dos:
        </p>
        <OperatorTable
          rows={[
            {
              name: 'Las Galaxias',
              routes: 'Línea 80 (UN80 PE GC) + corredor sur Res. Ex. 457',
              terminal: 'Concepción centro · pendiente',
              notes: <p>Titular de la <strong>UN80 / Línea 80</strong> en el PE GC 2024; misma razón social con presencia en Coronel-Lota. Líneas, flota y terminal pendientes.</p>,
              source: { href: 'https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              name: 'Buses J. Ewert',
              routes: 'Troncales Concepción ↔ Coronel ↔ Lota, códigos pendientes',
              terminal: 'Pendiente',
              notes: <p>Operador histórico en la cartera DPR Biobío. Sin razón social ni padrón confirmados.</p>,
            },
          ]}
        />
        <PendingBanner>
          <strong>Lista incompleta.</strong> El padrón de la Res. Ex. 457 no
          está publicado; faltan los operadores de Lota Bajo/Alto y Coronel
          urbano, y el de la 302 y la 304 (el GTFS no lo nombra).
        </PendingBanner>
      </Section>

      <Section title="Tarifa y ajuste">
        <KeyValueList
          items={[
            ['Tarifa adulto 2026', 'Sin tarifa única publicada: varía por operador y tramo (Concepción ↔ Coronel cuesta menos que ↔ Lota).'],
            ['Polinomio', 'No publicado. Los reajustes se tramitan caso a caso con SEREMITT, a diferencia del PE Gran Concepción ($580).'],
            ['Escolar y accesibilidad', 'Pendientes. La Res. Ex. 457 no exige flota accesible; el PE formal sí.'],
            ['Control', 'SEREMITT Biobío y DTPR, con el programa «Más Pasajes Por Tu Plata».'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          La tarifa es fuente recurrente de conflicto: hubo paros y huelgas de
          choferes en 2010-2020 (fechas pendientes) porque cada alza se
          discute sin polinomio público.
        </p>
        <Sources>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · sitio oficial
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura del visor">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">Lo que sí está</div>
          <ul className="mt-1 ml-5 list-disc space-y-0.5 text-[12px]">
            <li>
              <strong>L2 del Biotrén</strong> (Concepción ↔ Coronel): trazado
              y 14 estaciones desde OSM, horario del itinerario oficial de
              EFE. Ver{' '}
              <a href="/wiki/biotren" className={LINK}>Biotrén</a>.
            </li>
            <li>
              <strong>302 y 304</strong>, rotuladas «Interurbano Lota»:
              trazado por sentido, paraderos y horario programado. Sin
              llegadas en vivo.
            </li>
            <li>
              Algunos servicios del PE Gran Concepción (UN23, UN24) entran a
              San Pedro, pero no siguen a Coronel ni a Lota.
            </li>
          </ul>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">Lo que NO está</div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            El resto de los troncales (Res. Ex. 457), sin GTFS publicado. A
            diferencia de Tomé, donde todos los servicios están en el feed, la
            fragmentación deja fuera la mayor parte del corredor. Cuando se
            adjudique el PE y la DTPR publique su programa, la sincronización
            diaria propondrá sumarlo.
          </p>
        </div>
        <Sources>
          <SourceLink href="https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/">
            DTPR · GTFS Gran Concepción (versión 20250228, incluye 302 y 304)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="BusPay">
        <p>
          Subtrans incluyó Coronel y Lota entre las 11 comunas del{' '}
          <a href="/wiki/buspay" className={LINK}>BusPay</a> adjudicado el
          28-ene-2026, pero la prensa de sep-nov 2026 sobre la marcha blanca
          (1-dic-2026) no las nombra: cobertura real por confirmar. Según la
          ficha de BusPay, Sabes tendría un centro de atención en Lota.
        </p>
        <Sources>
          <SourceLink href="https://www.subtrans.gob.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026, Adjudicación BusPay (11 comunas)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026, BusPay adjudicado
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Electrocorredor MOP Ruta 160">
        <p>
          Proyecto de pista exclusiva San Pedro ↔ Coronel (14 km, UF
          4.414.000, oferta única de Electro-Cointer el 5-nov-2025). No llega
          a Lota: los últimos 8-10 km seguirían en vialidad mixta. Hacienda
          congeló la adjudicación el 4-ago-2026 y el MOP lo pasó a obra
          pública directa; no hay fecha de obra verificada. Detalle en{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className={LINK}>
            Electrocorredores MOP del Biobío
          </a>
          .
        </p>
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/project/corredor-de-transporte-publico-ruta-160/">
            MOP Concesiones · Corredor Ruta 160
          </SourceLink>
          <SourceLink href="https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/">
            MOP · 5-nov-2025, Oferta Electro-Cointer
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
            Diario Concepción · 13-nov-2024, CGR visa Ruta 160 / 150
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Biotrén Línea 2">
        <p>
          La L2 (Concepción ↔ Coronel, 14 estaciones, desde 2009) cubre el
          mismo eje, pero no llega a Lota: allí solo hay bus. El tren sirve el
          eje estructural y los buses la red capilar (Lota Alto/Bajo,
          periferia de Coronel). El Biotrén usa Conecta; la integración
          Conecta ↔ BusPay no está confirmada. La extensión a Lota está en la
          ficha{' '}
          <a href="/wiki/biotren-extensiones-proyectos" className={LINK}>
            Biotrén y sus extensiones
          </a>
          . <MapLink route="L2">Ver L2 Coronel ↔ Concepción →</MapLink>
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

      <CollapsibleSection title="Régimen jurídico, licitación 2025-2026 e historia">
        <p>
          Coronel y Lota quedaron fuera de la licitación 2002 (ver{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className={LINK}>
            PE Gran Concepción 2024
          </a>
          ). Hoy opera un instrumento ad hoc:
        </p>
        <KeyValueList
          items={[
            ['Instrumento', <><strong>Res. Ex. N° 457 MTT</strong> (2012-2013): regulación especial «aproximada a un PE», pero formalmente no lo es. Es una resolución exenta, más débil que un decreto supremo: no asegura contrato de largo plazo ni tarifa uniforme.</>],
            ['Licitación del PE', 'Bases con toma de razón de Contraloría (dictamen E147498, 1-sep-2025); llamado abierto el 12-sep-2025. 80 buses: 50 eléctricos (Lota-Concepción y Lota-Talcahuano) y 30 diésel (Colcura-Concepción), con dos operadores.'],
            ['Interés del mercado', '38 organizaciones compraron las bases; hubo cinco ofertas (cuatro por los eléctricos y una por los diésel, de Sociedad de Transportes de Pasajeros Lota S.A.).'],
            ['Oferentes eléctricos', 'Consorcio o Unión Temporal Provincial Lota Express, Transportes Jorge Alarcón Jara EIRL, Transportes Giovanni Concha Zanetti EIRL y Transportes Públicos de Pasajeros Ruta Las Playas S.A.'],
            ['Prórrogas de admisibilidad', '14-may-2026 (10 días hábiles), 29-may (20), 26-jun (30), 11-ago (60) y la quinta, de 20 días, hasta el 3-dic-2026.'],
            ['Estado al 25-nov-2026', 'Sin adjudicación ni inicio de operación. En ago-2026 el Gobierno esperaba adjudicar «este año»; la fecha no está confirmada.'],
          ]}
        />
        <PendingBanner>
          <strong>Pendientes:</strong> texto íntegro de la Res. Ex. 457 (citada
          «2012-2013» sin link al expediente), decreto de adjudicación del PE
          y fecha de marcha blanca. No hallé en fuentes primarias (MTT, DTPR,
          Contraloría) un comunicado de adjudicación.
        </PendingBanner>
        <h3 className="mt-3 text-[13px] font-medium">Historia</h3>
        <p>
          Enacar cerró el <strong>14-abr-1997</strong> (la Carbonífera
          Schwager de Coronel se había fusionado con ella en 1994; Lota Verde
          cerró también en 1997): el flujo pasó de obrero a pendular
          residencial hacia Concepción. Desde entonces el corredor es de los
          más tensionados del Biobío, con huelgas de choferes en 2010-2020 y
          colisiones recurrentes en la Ruta 160 (Lomas Coloradas, Coronel
          norte), uno de los motores del electrocorredor. La cronología
          detallada de paros y alzas está pendiente de archivo de prensa.
        </p>
        <h3 className="mt-3 text-[13px] font-medium">
          Comparación con los otros regímenes
        </h3>
        <DataTable columns={['Dimensión', 'PE Gran Concepción', 'PE Tomé', 'Coronel-Lota']}>
          <tr>
            <td className="px-3 py-2 font-medium">Instrumento</td>
            <td className="px-3 py-2">Decreto MTT, Ley 18.696 art. 3°</td>
            <td className="px-3 py-2">Decreto MTT, Ley 18.696 art. 3°</td>
            <td className="px-3 py-2">Res. Ex. 457 MTT (PE formal en licitación)</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Vigente desde</td>
            <td className="px-3 py-2">1-ene-2024</td>
            <td className="px-3 py-2">10-mar-2022 (decreto jul-2016)</td>
            <td className="px-3 py-2">2012-2013; PE formal aún no vigente</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Operadores</td>
            <td className="px-3 py-2">35 empresas en 36 UN</td>
            <td className="px-3 py-2">Uno · Transportes Tomé SpA</td>
            <td className="px-3 py-2">Varios, sin operador único</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Tarifa adulto</td>
            <td className="px-3 py-2">$580 (23-feb-2025)</td>
            <td className="px-3 py-2">$780 / $830 (feb-2025)</td>
            <td className="px-3 py-2">Sin tarifa única publicada</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Flota en la licitación</td>
            <td className="px-3 py-2">Renovación gradual</td>
            <td className="px-3 py-2">71 buses declarados</td>
            <td className="px-3 py-2"><strong>80 buses nuevos</strong></td>
          </tr>
        </DataTable>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/07/15/80-buses-nuevos-para-lota-y-coronel-las-bases-de-la-licitacion-estan-en-contraloria.html">
            Diario Concepción · 15-jul-2025, Bases PE Coronel-Lota en Contraloría
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/09/12/abren-licitacion-de-nuevo-sistema-de-transporte-a-coronel-y-lota-con-80-buses-de-alto-estandar.html">
            Diario Concepción · 12-sep-2025, Abren la licitación (80 buses)
          </SourceLink>
          <SourceLink href="https://vlex.cl/vid/dictamen-n-e147498-contraloria-1090894666">
            vLex · Dictamen E147498 de Contraloría, 1-sep-2025
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/13/vuelven-a-postergar-licitacion-para-regular-transporte-publico-de-buses-coronel-lota.shtml">
            BioBioChile · 13-ago-2026, Vuelven a postergar la licitación
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/24/gobierno-espera-este-ano-adjudicar-licitacion-de-servicio-de-transporte-publico-de-buses-coronel-lota.shtml">
            BioBioChile · 24-ago-2026, Gobierno espera adjudicar este año
          </SourceLink>
          <SourceLink href="https://sabes.cl/2026/02/10/licitacion-de-nuevos-buses-para-coronel-y-lota-logra-interes-de-empresarios/">
            Sabes · 10-feb-2026, Alto interés de empresarios
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción (sección PE Coronel-Lota)
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Lota">
            Wikipedia · Lota (cierre Enacar 1997)
          </SourceLink>
          <SourceLink href="https://www.memoriachilena.gob.cl/602/w3-article-3611.html">
            Memoria Chilena · Carbón de Lota
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Alcance geográfico">
        <KeyValueList
          items={[
            ['Comunas', 'Concepción (salida sur por Bicentenario / Llacolén), San Pedro de la Paz (Boca Sur, Candelaria, Michaihue, Lomas, San Pedro del Mar), Coronel (urbano, Yobilo, Maule, Lagunillas, Escuadrón) y Lota (Bajo y Alto).'],
            [
              'Eje vial',
              <>
                <strong>Ruta 160</strong> (OSM relation 9239557,{' '}
                <code className="font-mono">ref=160</code>): doble vía
                concesionada con peaje troncal en Coronel.
              </>,
            ],
            ['Distancia y tiempo', 'Concepción → Lota ~38 km; ~55-80 min en bus según hora y trazado.'],
            ['Vías secundarias', 'Av. Las Industrias / Costanera (San Pedro), camino antiguo Coronel-Lota Alto, accesos a Yobilo, Maule y Escuadrón.'],
            ['Corte del artículo', 'Concepción ↔ Coronel ↔ Lota. El interurbano a Laraquete / Arauco queda fuera (régimen privado distinto).'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/relation/9239557">
            OSM relation 9239557 · Ruta 160
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8102">
            BCN · Reportes comunales Coronel 2017, 116.262 hab.
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8105">
            BCN · Reportes comunales Lota 2017, 43.535 hab.
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Cronología">
        <Timeline
          items={[
            {
              date: '14-abr-1997',
              event: 'Cierre de Enacar y Lota Verde; el corredor pasa de obrero a pendular residencial.',
              source: { href: 'https://es.wikipedia.org/wiki/Lota', label: 'Wikipedia · Lota' },
            },
            {
              date: '2009',
              event: 'Apertura del Biotrén L2 (Concepción ↔ Coronel); no llega a Lota.',
              source: { href: 'https://es.wikipedia.org/wiki/Biotr%C3%A9n', label: 'Wikipedia · Biotrén' },
            },
            { date: '2012-2013', event: 'El MTT emite la Res. Ex. 457, regulación especial «aproximada a un PE».' },
            {
              date: '13-nov-2024',
              event: 'CGR visa las licitaciones MOP de corredores Ruta 150 / 160 / Autopista Concepción-Talcahuano.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: '15-jul-2025',
              event: 'Bases del PE Coronel-Lota en Contraloría; se anuncian 80 buses nuevos.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/07/15/80-buses-nuevos-para-lota-y-coronel-las-bases-de-la-licitacion-estan-en-contraloria.html', label: 'Diario Concepción · 15-jul-2025' },
            },
            {
              date: '12-sep-2025',
              event: 'Se abre la licitación del PE: 50 buses eléctricos y 30 diésel.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/12/abren-licitacion-de-nuevo-sistema-de-transporte-a-coronel-y-lota-con-80-buses-de-alto-estandar.html', label: 'Diario Concepción · 12-sep-2025' },
            },
            {
              date: '5-nov-2025',
              event: 'El MOP recibe la oferta única de Electro-Cointer para Ruta 160 (UF 4.414.000, 14 km, 25 años); apertura económica el 3-dic-2025.',
              source: { href: 'https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/', label: 'MOP · 5-nov-2025' },
            },
            {
              date: '28-ene-2026',
              event: 'El MTT adjudica BusPay al Consorcio Buspay (operador técnico Busmatick).',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
            {
              date: '4-ago-2026',
              event: 'Hacienda congela la adjudicación del electrocorredor Ruta 160.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/04/gobierno-frena-corredores-de-transporte-publico-en-gran-concepcion-en-que-invertirian-us400-millones.shtml', label: 'BioBioChile · 4-ago-2026' },
            },
            {
              date: '18-nov-2026',
              event: 'Quinta prórroga de la admisibilidad de la licitación de buses, hasta el 3-dic-2026.',
              source: { href: 'https://www.canal9.cl/episodios/2026/11/18/emplazan-a-de-grange-por-quinta-prorroga-en-licitacion-de-transporte-coronel-lota-debera-responder', label: 'Canal 9' },
            },
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes y vínculos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Número, fecha y texto íntegro de la Res. Ex. 457 MTT.</li>
          <li>Adjudicación del PE Coronel-Lota (resultado de la admisibilidad, decreto) y fecha de operación.</li>
          <li>Razón social, RUT, padrón y terminal de Las Galaxias y Buses J. Ewert; operador de la 302 y la 304.</li>
          <li>Códigos de línea canónicos, tarifa adulto 2026 por operador y tramo, y tabla horaria de los troncales.</li>
          <li>Paraderos y trazado de los troncales fuera del GTFS (San Pedro, Coronel, Lota Bajo/Alto).</li>
          <li>Cobertura real de BusPay en Coronel y Lota; integración Conecta ↔ BusPay.</li>
          <li>Cronología de paros, huelgas y alzas (1997-2025).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Cierre: Ley de Transparencia (Ley 20.285) a SUBTRANS y DTPR
          Biobío, consulta a Contraloría, archivo de prensa y fotos de
          carteles.
        </p>
        <p className="text-[13px]">
          Ver también:{' '}
          <a href="/wiki/seremitt-dtpr-biobio" className={LINK}>SEREMITT y DTPR</a>,{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className={LINK}>PE Gran Concepción</a>,{' '}
          <a href="/wiki/perimetro-exclusion-tome" className={LINK}>PE Tomé</a>,{' '}
          <a href="/wiki/buspay" className={LINK}>BusPay</a>,{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className={LINK}>corredores MOP</a>,{' '}
          <a href="/wiki/biotren" className={LINK}>Biotrén</a>,{' '}
          <a href="/wiki/gtfs-gran-concepcion" className={LINK}>GTFS Gran Concepción</a>,{' '}
          <a href="/wiki/concepcion-florida" className={LINK}>Concepción ↔ Florida</a> y{' '}
          <a href="/wiki/recorridos-interurbanos" className={LINK}>recorridos interurbanos</a>.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Bibliografía y cómo contribuir">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li><SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/07/15/80-buses-nuevos-para-lota-y-coronel-las-bases-de-la-licitacion-estan-en-contraloria.html">Diario Concepción · 15-jul-2025, Bases PE Coronel-Lota / 80 buses</SourceLink></li>
          <li><SourceLink href="https://www.diarioconcepcion.cl/politica/2026/10/21/retraso-licitacion-buses-lota-coronel.html">Diario Concepción · 21-oct-2026, Retraso de la licitación</SourceLink></li>
          <li><SourceLink href="https://www.canal9.cl/episodios/2026/11/18/emplazan-a-de-grange-por-quinta-prorroga-en-licitacion-de-transporte-coronel-lota-debera-responder">Canal 9 · 18-nov-2026, Quinta prórroga</SourceLink></li>
          <li><SourceLink href="https://www.subtrans.gob.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">Subtrans · 30-ene-2026, Adjudicación BusPay</SourceLink></li>
          <li><SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">BioBioChile · 28-ene-2026, Consorcio Buspay</SourceLink></li>
          <li><SourceLink href="https://concesiones.mop.gob.cl/project/corredor-de-transporte-publico-ruta-160/">MOP Concesiones · Corredor Ruta 160</SourceLink></li>
          <li><SourceLink href="https://www.mop.gob.cl/consorcio-electro-cointer-presento-oferta-para-proyecto-concesion-corredor-de-transporte-publico-ruta-160/">MOP · 5-nov-2025, Oferta Electro-Cointer</SourceLink></li>
          <li><SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">Diario Concepción · 13-nov-2024, CGR visa Ruta 160 / 150</SourceLink></li>
          <li><SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">Wikipedia · PE Gran Concepción (sección Coronel-Lota)</SourceLink></li>
          <li><SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">Wikipedia · Buses licitados del Gran Concepción</SourceLink></li>
          <li><SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">Wikipedia · Biotrén (L2)</SourceLink></li>
          <li>
            <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8102">BCN · Coronel 2017</SourceLink>
            {' '}·{' '}
            <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8105">BCN · Lota 2017</SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Lota">Wikipedia · Lota (cierre Enacar 1997)</SourceLink>
            {' '}·{' '}
            <SourceLink href="https://www.memoriachilena.gob.cl/602/w3-article-3611.html">Memoria Chilena · Carbón de Lota</SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/9239557">OSM relation 9239557 · Ruta 160</SourceLink>
            {' '}·{' '}
            <SourceLink href="https://dprbiobio.dpr.gob.cl/">DTPR Biobío</SourceLink>
          </li>
        </ul>
        <p className="mt-2 text-[12px]">
          ¿Tienes la Res. Ex. 457, el expediente de la licitación o fotos de
          carteles de horarios? Abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-coronel-lota.tsx">
            concepcion-coronel-lota.tsx
          </SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
