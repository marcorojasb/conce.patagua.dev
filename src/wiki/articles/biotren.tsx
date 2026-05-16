// Biotrén — tren urbano operacional vigente del Gran Concepción.
//
// Esta ficha cubre el servicio EFE Biobío operado HOY: dos líneas (L1
// Hualqui ↔ Mercado de Talcahuano, L2 Coronel ↔ Concepción), 26
// estaciones digitalizadas desde OSM, tarifas por zona vigentes
// desde 2-ene-2026 (alza promedio $60, rango Z1-Z10 $420-$850),
// frecuencias y operación. Para extensiones y proyectos futuros
// (Penco, Tomé, Lota, Carriel Sur), ver `biotren-extensiones-proyectos`.
//
// Verificación contra OSM (`src/data/biotren.generated.ts`, way
// `railway=rail` operator=EFE en `biotren-track.generated.ts`),
// EFE Sur (efe.cl) y prensa regional.

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';
import { MapLink } from '@/wiki/map-link';

export default function Biotren() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong>{' '}
        Estaciones, trazado, código de servicio L1/L2, operador EFE Trenes
        Metropolitanos y hitos históricos (1872 línea Sur, 1995 FESUR,
        proyecto Biotrén 2005, electrificación, 27F-2010) están citados.
        Tarifas por zona vigentes desde 2-ene-2026 (alza promedio $60,
        rango Z1-Z10 $420-$850) también verificadas con EFE Sur.{' '}
        <strong>Pendientes</strong>: demanda diaria 2025-2026, decreto MTT
        del subsidio operacional, integración tarifaria proyectada con
        BusPay 2026.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          El <strong>Biotrén</strong> es el sistema de tren urbano del
          Gran Concepción, operado por <strong>EFE Trenes Metropolitanos
          S.A.</strong> (filial de Empresa de los Ferrocarriles del
          Estado, EFE Sur). Es el <strong>único tren urbano de Chile en
          operación regular fuera de la red Metro de Santiago</strong>{' '}
          — Merval (Valparaíso) y EFE Central tienen vocación
          cercanías-interurbano, y la red de Santiago es subterránea. Es
          también el único <em>tren</em> visible en el visor de{' '}
          <code>conce.patagua.dev</code> hoy (líneas L1 y L2 nativas,
          paraderos con id OSM verificable).
        </p>
        <p>
          Importa por tres razones:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Capacidad estructural</strong>: cada tren Xtrapolis o
            ABe lleva centenares de pasajeros por composición — un orden
            de magnitud por sobre cualquier bus. En su eje (Concepción ↔
            Talcahuano, Concepción ↔ Coronel) es <em>el</em> modo masivo
            de la región.
          </li>
          <li>
            <strong>Infraestructura ya construida</strong>: la línea
            férrea Concepción-Talcahuano existe desde 1872; la
            electrificación 3 kV DC y la doble vía urbana son inversiones
            hundidas. El servicio Biotrén corre sobre traza histórica
            consolidada.
          </li>
          <li>
            <strong>Capa nativa del visor</strong>: a diferencia de los
            buses urbanos (que entran por el feed{' '}
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>
            ), el Biotrén se procesa desde OSM (relations 6857222 / 6857223
            + nodos <code>railway=station</code>) y vive en el visor sin
            depender del GTFS urbano.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Para extensiones discutidas (Penco, Tomé, Lota, Carriel Sur) y
          la tensión política con el electrocorredor MOP Ruta 150, ver{' '}
          <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
            Biotrén · extensiones y proyectos
          </a>
          .
        </p>
        <Sources>
          <SourceLink href="https://www.efetrenes.cl/biotren">
            EFE Trenes · sitio oficial Biotrén
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
            Wikipedia · Biotrén
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Historia">
        <p>
          La <strong>línea férrea Concepción-Talcahuano</strong> se
          inauguró en <strong>1872</strong> como parte del sistema Sur de
          la Empresa de los Ferrocarriles del Estado (EFE), conectando la
          capital regional con el puerto de Talcahuano. Durante un siglo
          fue el ferrocarril de carga y pasajeros de larga distancia.
        </p>
        <p>
          En <strong>1995</strong>, en plena modernización de EFE post
          década de 1980, se creó la <strong>filial regional FESUR</strong>{' '}
          (Ferrocarriles Suburbanos de Concepción S.A.) para operar
          servicios de cercanías en el Gran Concepción. El servicio
          comercial <strong>Biotrén</strong> arrancó en{' '}
          <strong>2005</strong> tras inversión en electrificación 3 kV
          DC, la incorporación de trenes <strong>Xtrapolis modular</strong>{' '}
          (fabricados por Alstom Brasil, derivados del Xtrapolis de
          Buenos Aires) y la habilitación de estaciones nuevas en el eje
          Concepción-Chiguayante-Hualqui.
        </p>
        <p>
          La <strong>Línea 2</strong> (Concepción ↔ Coronel por el ramal
          de Lota) entró en servicio en <strong>2009</strong> tras la
          electrificación y rehabilitación del ramal sur, aprovechando
          infraestructura férrea histórica que servía a las minas de
          carbón de Schwager y Lota.
        </p>
        <p>
          El <strong>terremoto del 27 de febrero de 2010</strong> dañó
          puentes y estaciones del sistema; el servicio se interrumpió
          parcialmente y la reconstrucción se extendió durante meses. El
          puente sobre el río Biobío (estructura crítica para la L2) fue
          uno de los puntos más golpeados.
        </p>
        <p>
          En <strong>2017</strong> FESUR fue absorbida por la matriz EFE
          y reorganizada como <strong>EFE Trenes Metropolitanos S.A.</strong>{' '}
          (filial actual). En la pandemia 2020-2021 la demanda se
          desplomó; el servicio se mantuvo con frecuencia reducida y
          ventanas operativas acortadas.
        </p>
        <Timeline
          items={[
            {
              date: '1872',
              event: 'Inauguración de la línea férrea Concepción-Talcahuano como parte del sistema Sur de EFE. Trafico mixto pasajeros + carga.',
              source: { href: 'https://es.wikipedia.org/wiki/Ferrocarril_Concepci%C3%B3n-Talcahuano', label: 'Wikipedia · línea Concepción-Talcahuano' },
            },
            {
              date: '1995',
              event: 'Creación de FESUR (Ferrocarriles Suburbanos de Concepción S.A.), filial regional de EFE para servicios de cercanías.',
              source: { href: 'https://es.wikipedia.org/wiki/Biotr%C3%A9n', label: 'Wikipedia · Biotrén' },
            },
            {
              date: '2005',
              event: 'Lanzamiento del servicio Biotrén con trenes Xtrapolis y electrificación 3 kV DC del eje Concepción ↔ Talcahuano y Concepción ↔ Chiguayante.',
              source: { href: 'https://es.wikipedia.org/wiki/Biotr%C3%A9n', label: 'Wikipedia · Biotrén' },
            },
            {
              date: '2009',
              event: 'Apertura de la Línea 2 hacia Coronel, rehabilitando el ramal histórico Concepción ↔ Lota (sin llegar a Lota urbano).',
            },
            {
              date: '27-feb-2010',
              event: 'Terremoto y tsunami. Daños en puentes y estaciones (incl. puente Biobío crítico para L2). Servicio interrumpido parcialmente; reconstrucción durante meses.',
            },
            {
              date: '2017',
              event: 'FESUR absorbida por la matriz EFE y reorganizada como EFE Trenes Metropolitanos S.A. (filial regional).',
            },
            {
              date: '2020-2021',
              event: 'Pandemia COVID-19: demanda colapsa, servicio reducido en frecuencia y ventana horaria.',
            },
            {
              date: '2-ene-2026',
              event: 'Entra en vigencia nueva estructura tarifaria por zonas Z1-Z10 ($420-$850 adulto), alza promedio $60 por viaje. EFE Sur cita "alza acumulada por inflación no aplicada en pandemia" como fundamento.',
              source: { href: 'https://www.efe.cl/efe-sur-informa-nueva-estructura-tarifaria-del-biotren-a-partir-del-2-de-enero-de-2026/', label: 'EFE Sur · 30-dic-2025' },
            },
          ]}
        />
        <PendingBanner>
          <strong>Pendientes históricos:</strong> fecha exacta de
          electrificación 3 kV DC del eje urbano, fecha exacta de
          apertura comercial de la Línea 1 y la Línea 2 (algunas fuentes
          mencionan 1999, otras 2005 y 2009; el período "1999-2005"
          parece corresponder a estudios y obras previos al lanzamiento
          comercial). Cierre por consulta directa a EFE Trenes via Ley
          de Transparencia.
        </PendingBanner>
      </Section>

      <Section title="Servicios actuales">
        <p>
          Dos líneas en operación, ambas con terminal común en{' '}
          <strong>Estación Concepción</strong> (id OSM{' '}
          <code className="font-mono">node 310000768</code>,{' '}
          <code className="font-mono">−36.8302, −73.0610</code>):
        </p>
        <KeyValueList
          items={[
            [
              'Línea 1',
              <>
                <strong>Hualqui ↔ Mercado de Talcahuano</strong> · cruza
                Concepción de sur-oriente a nor-poniente · 12 estaciones
                · color azul claro en el visor.{' '}
                <MapLink route="L1">Ver L1 en el visor →</MapLink>
              </>,
            ],
            [
              'Línea 2',
              <>
                <strong>Coronel ↔ Concepción</strong> · eje sur por el
                ramal del carbón (Lomas Coloradas, San Pedro de la Paz,
                Juan Pablo II) · 14 estaciones · color azul oscuro en el
                visor.{' '}
                <MapLink route="L2">Ver L2 en el visor →</MapLink>
              </>,
            ],
            [
              'Operador',
              'EFE Trenes Metropolitanos S.A. (filial de EFE Sur). Operación con subsidio operacional MTT.',
            ],
            [
              'Headway publicado en visor',
              'Cada 6-12 min en hora punta · 15 min hora valle (Lun-Vie). Sábado 12-20 min. Domingo 20-30 min.',
            ],
            [
              'Ventana operativa',
              '05:45 — 23:10 (Lun-Vie). Detalle por día festivo no documentado en este artículo; revisar app oficial.',
            ],
            [
              'Material rodante',
              'Trenes eléctricos Xtrapolis (fabricados por Alstom Brasil) y unidades ABe históricas. Composiciones de 3 coches articulados. Electrificación 3 kV DC catenaria.',
            ],
            [
              'Estructura tarifaria',
              'Por zonas Z1-Z10, no plana. Reajuste vigente desde 2-ene-2026: alza promedio $60 por viaje (rango $40-$70 según zona). Detalle del cuadro en sección "Tarifas vigentes 2026".',
            ],
            [
              'Información en tiempo real',
              'App "EFE Trenes" (sucesora de la app Biotrén) y avisos en estaciones.',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.efetrenes.cl/biotren">
            EFE Trenes · sitio oficial Biotrén
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
            Wikipedia · Biotrén (frecuencias, material rodante)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifas vigentes 2026">
        <p>
          Estructura tarifaria por <strong>zonas Z1-Z10</strong> vigente
          desde el <strong>2 de enero de 2026</strong>. Alza promedio
          de $60 por viaje respecto del cuadro anterior (rango $40-$70
          según zona). EFE Sur cita "alza acumulada por inflación no
          aplicada en pandemia" como fundamento del ajuste.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Zona</th>
                <th className="px-3 py-2 font-medium">Estaciones incluidas (extracto)</th>
                <th className="px-3 py-2 font-medium">Tarifa adulto</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top text-[12px]">
              <tr>
                <td className="px-3 py-2 font-mono">Z1</td>
                <td className="px-3 py-2">Hualqui (terminal sur L1)</td>
                <td className="px-3 py-2 font-mono">$550</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Z2</td>
                <td className="px-3 py-2">La Leonera, Manquimávida, Pedro Medina, Chiguayante</td>
                <td className="px-3 py-2 font-mono">$510</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Z3</td>
                <td className="px-3 py-2">Concepción (estación central), Lorenzo Arenas</td>
                <td className="px-3 py-2 font-mono">$420</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Z4</td>
                <td className="px-3 py-2">UTFSM, Los Cóndores, Higueras</td>
                <td className="px-3 py-2 font-mono">$500</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Z5</td>
                <td className="px-3 py-2">El Arenal, Mercado de Talcahuano (terminal norte L1)</td>
                <td className="px-3 py-2 text-muted-foreground">por confirmar</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Z6</td>
                <td className="px-3 py-2">Juan Pablo II, Diagonal Bío-Bío (L2)</td>
                <td className="px-3 py-2 font-mono">$570</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Z7</td>
                <td className="px-3 py-2">Alborada, Costa Mar (L2)</td>
                <td className="px-3 py-2 text-muted-foreground">por confirmar</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Z8</td>
                <td className="px-3 py-2">El Parque, Lomas Coloradas (L2)</td>
                <td className="px-3 py-2 text-muted-foreground">por confirmar</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Z9</td>
                <td className="px-3 py-2">Cardenal Raúl Silva Henríquez, Hito Galvarino (L2)</td>
                <td className="px-3 py-2 text-muted-foreground">por confirmar</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Z10</td>
                <td className="px-3 py-2">Coronel (terminal sur L2)</td>
                <td className="px-3 py-2 font-mono">$850</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px]">
          <strong>Descuentos vigentes:</strong> Estudiantes con TNE
          activa: <strong>67% de descuento</strong> en enseñanza media y
          superior (básica liberada). Adultos mayores: <strong>50% de
          descuento</strong>, los 365 días del año.
        </p>
        <KeyValueList
          items={[
            [
              'Pago',
              'Tarjeta del Biotrén (Conecta, sucesora de la tarjeta Biotrén 2005) en validadores de estación. No es la misma tarjeta que usan los buses urbanos.',
            ],
            [
              'Integración con buses urbanos',
              'NO hay integración tarifaria con buses urbanos del Gran Concepción al cierre 2025-2026. Un viaje bus + Biotrén paga dos veces.',
            ],
            [
              'BusPay 2026',
              <>
                BusPay es el sistema de pago electrónico para buses del
                Perímetro de Exclusión del Gran Concepción + Santa Juana
                + Tomé (marcha blanca Q3 2026). El Biotrén <strong>NO</strong>{' '}
                está dentro del perímetro inicial de BusPay según la
                información SUBTRANS publicada — la integración con tren
                es pendiente de definición. Ver{' '}
                <a href="/wiki/buspay" className="underline underline-offset-2">
                  BusPay
                </a>
                .
              </>,
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.efe.cl/efe-sur-informa-nueva-estructura-tarifaria-del-biotren-a-partir-del-2-de-enero-de-2026/">
            EFE Trenes · 30-dic-2025 — Nueva estructura tarifaria Biotrén vigente 2-ene-2026
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/servicios/toma-nota/2025/12/30/efe-sur-anuncia-alza-en-la-tarifa-del-biotren-para-2026-revisa-a-cuanto-subira-el-pasaje.shtml">
            BioBioChile · 30-dic-2025 — Alza promedio $60, tabla por zona
          </SourceLink>
          <SourceLink href="https://www.efe.cl/nuestros-servicios/biotren/tarifas-del-servicio/">
            EFE Trenes · Tarifas del servicio Biotrén (cuadro vigente)
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Perímetro inicial BusPay = Gran Concepción + Santa Juana + Tomé
          </SourceLink>
        </Sources>
        <PendingBanner>
          <strong>Por confirmar:</strong> tarifas exactas de Z5, Z7, Z8
          y Z9 (no aparecen explicitadas en la cobertura de prensa con
          el mismo nivel de detalle que Z1-Z4, Z6 y Z10). Cierre por
          foto del cuadro tarifario completo en estación Concepción o
          PDF oficial EFE Sur.
        </PendingBanner>
      </Section>

      <Section title="Estaciones">
        <p>
          Las 12 estaciones de L1 y las 14 de L2 están digitalizadas
          desde OpenStreetMap (nodos <code>railway=stop</code> con{' '}
          <code>operator~EFE</code>) y forman parte del visor nativo —
          ver <code className="font-mono">src/data/biotren.generated.ts</code>.
          El orden y los códigos de tres letras (<code>HQ</code>,{' '}
          <code>CC</code>, <code>TH</code>, etc.) provienen de la web
          oficial de EFE Trenes.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Línea</th>
                <th className="px-3 py-2 font-medium">Estación</th>
                <th className="px-3 py-2 font-medium">Código EFE</th>
                <th className="px-3 py-2 font-medium">OSM id</th>
                <th className="px-3 py-2 font-medium">Ver en visor</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top text-[12px]">
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">Hualqui (terminal sur)</td>
                <td className="px-3 py-2 font-mono">HQ</td>
                <td className="px-3 py-2 font-mono">osm-4455930417</td>
                <td className="px-3 py-2"><MapLink stop="osm-4455930417">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">La Leonera</td>
                <td className="px-3 py-2 font-mono">ZW</td>
                <td className="px-3 py-2 font-mono">osm-4514615375</td>
                <td className="px-3 py-2"><MapLink stop="osm-4514615375">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">Manquimávida</td>
                <td className="px-3 py-2 font-mono">man</td>
                <td className="px-3 py-2 font-mono">osm-4514615376</td>
                <td className="px-3 py-2"><MapLink stop="osm-4514615376">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">Pedro Medina</td>
                <td className="px-3 py-2 font-mono">pme</td>
                <td className="px-3 py-2 font-mono">osm-4514589079</td>
                <td className="px-3 py-2"><MapLink stop="osm-4514589079">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">Chiguayante</td>
                <td className="px-3 py-2 font-mono">CV</td>
                <td className="px-3 py-2 font-mono">osm-4514590030</td>
                <td className="px-3 py-2"><MapLink stop="osm-4514590030">→</MapLink></td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-3 py-2 font-mono">L1 + L2</td>
                <td className="px-3 py-2"><strong>Concepción</strong> (estación central)</td>
                <td className="px-3 py-2 font-mono">CC</td>
                <td className="px-3 py-2 font-mono">osm-310000768</td>
                <td className="px-3 py-2"><MapLink stop="osm-310000768">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">Lorenzo Arenas</td>
                <td className="px-3 py-2 font-mono">lor</td>
                <td className="px-3 py-2 font-mono">osm-332795804</td>
                <td className="px-3 py-2"><MapLink stop="osm-332795804">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">UTF Santa María</td>
                <td className="px-3 py-2 font-mono">utf</td>
                <td className="px-3 py-2 font-mono">osm-5583753385</td>
                <td className="px-3 py-2"><MapLink stop="osm-5583753385">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">Los Cóndores</td>
                <td className="px-3 py-2 font-mono">con</td>
                <td className="px-3 py-2 font-mono">osm-4514677144</td>
                <td className="px-3 py-2"><MapLink stop="osm-4514677144">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">Higueras</td>
                <td className="px-3 py-2 font-mono">hig</td>
                <td className="px-3 py-2 font-mono">osm-4514677093</td>
                <td className="px-3 py-2"><MapLink stop="osm-4514677093">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2">El Arenal</td>
                <td className="px-3 py-2 font-mono">EZ</td>
                <td className="px-3 py-2 font-mono">osm-332793725</td>
                <td className="px-3 py-2"><MapLink stop="osm-332793725">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L1</td>
                <td className="px-3 py-2"><strong>Mercado de Talcahuano</strong> (terminal norte)</td>
                <td className="px-3 py-2 font-mono">TH</td>
                <td className="px-3 py-2 font-mono">osm-2063360442</td>
                <td className="px-3 py-2"><MapLink stop="osm-2063360442">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2"><strong>Coronel</strong> (terminal sur)</td>
                <td className="px-3 py-2 font-mono">CW</td>
                <td className="px-3 py-2 font-mono">osm-4124952607</td>
                <td className="px-3 py-2"><MapLink stop="osm-4124952607">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Laguna Quiñenco</td>
                <td className="px-3 py-2 font-mono">lqu</td>
                <td className="px-3 py-2 font-mono">osm-4124951369</td>
                <td className="px-3 py-2"><MapLink stop="osm-4124951369">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Cristo Redentor</td>
                <td className="px-3 py-2 font-mono">cri</td>
                <td className="px-3 py-2 font-mono">osm-4124950639</td>
                <td className="px-3 py-2"><MapLink stop="osm-4124950639">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Huinca</td>
                <td className="px-3 py-2 font-mono">hui</td>
                <td className="px-3 py-2 font-mono">osm-6329456006</td>
                <td className="px-3 py-2"><MapLink stop="osm-6329456006">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Los Canelos</td>
                <td className="px-3 py-2 font-mono">can</td>
                <td className="px-3 py-2 font-mono">osm-4124944293</td>
                <td className="px-3 py-2"><MapLink stop="osm-4124944293">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Hito Galvarino</td>
                <td className="px-3 py-2 font-mono">ES</td>
                <td className="px-3 py-2 font-mono">osm-4124947356</td>
                <td className="px-3 py-2"><MapLink stop="osm-4124947356">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Cardenal Raúl Silva Henríquez</td>
                <td className="px-3 py-2 text-muted-foreground">—</td>
                <td className="px-3 py-2 font-mono">osm-4124945257</td>
                <td className="px-3 py-2"><MapLink stop="osm-4124945257">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Lomas Coloradas</td>
                <td className="px-3 py-2 font-mono">LM</td>
                <td className="px-3 py-2 font-mono">osm-4593412639</td>
                <td className="px-3 py-2"><MapLink stop="osm-4593412639">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">El Parque</td>
                <td className="px-3 py-2 font-mono">par</td>
                <td className="px-3 py-2 font-mono">osm-4593443220</td>
                <td className="px-3 py-2"><MapLink stop="osm-4593443220">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Costa Mar</td>
                <td className="px-3 py-2 font-mono">cma</td>
                <td className="px-3 py-2 font-mono">osm-4593412640</td>
                <td className="px-3 py-2"><MapLink stop="osm-4593412640">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Alborada</td>
                <td className="px-3 py-2 font-mono">SU</td>
                <td className="px-3 py-2 font-mono">osm-3369569831</td>
                <td className="px-3 py-2"><MapLink stop="osm-3369569831">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Diagonal Bío-Bío</td>
                <td className="px-3 py-2 font-mono">dia</td>
                <td className="px-3 py-2 font-mono">osm-353772399</td>
                <td className="px-3 py-2"><MapLink stop="osm-353772399">→</MapLink></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">L2</td>
                <td className="px-3 py-2">Juan Pablo II</td>
                <td className="px-3 py-2 font-mono">BB</td>
                <td className="px-3 py-2 font-mono">osm-315019820</td>
                <td className="px-3 py-2"><MapLink stop="osm-315019820">→</MapLink></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La estación <strong>Concepción</strong> es la única común a
          ambas líneas (transbordo cross-platform en algunas franjas).
          <strong> Juan Pablo II</strong> es el punto de transbordo
          natural entre L2 y los servicios licitados a Santa Juana — ver{' '}
          <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
            Ruta 201
          </a>
          .
        </p>
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/node/310000768">
            OSM node 310000768 · Estación Concepción
          </SourceLink>
          <SourceLink href="https://www.efetrenes.cl/biotren">
            EFE Trenes · servicio Biotrén (orden de estaciones y códigos EFE)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Material rodante y operación">
        <KeyValueList
          items={[
            [
              'Operador',
              'EFE Trenes Metropolitanos S.A. — filial regional de EFE Sur. Reorganización 2017 (antes FESUR, creada 1995).',
            ],
            [
              'Tipo de tren',
              'Composiciones eléctricas Xtrapolis modular (Alstom Brasil) — 3 coches articulados, motorización distribuida. Unidades ABe históricas en complemento.',
            ],
            [
              'Electrificación',
              '3 kV DC catenaria, estándar histórico EFE Sur. La misma tensión que se usa en la Línea Central Santiago ↔ Chillán.',
            ],
            [
              'Vía',
              'Ancho ibérico 1.676 mm. Doble vía en el tramo urbano más cargado (Concepción ↔ Talcahuano y Concepción ↔ Hualqui).',
            ],
            [
              'Frecuencias',
              'Cada 6-12 min punta · 15 min valle (Lun-Vie); 12-20 min sábado; 20-30 min domingo. Valores publicados en el visor.',
            ],
            [
              'Capacidad referencial por composición',
              'No documentada con cifra única — depende de configuración y norma de aforo. Cierre por foto del cuadro técnico o ficha del fabricante.',
            ],
            [
              'Subsidio operacional',
              'EFE Trenes Metropolitanos recibe subsidio MTT vía Ley de Presupuestos anual. Monto y polinomio pendientes de cita. Nota: EFE no se financia con Ley 20.378.',
            ],
            [
              'Accidentes en pasos a nivel',
              'Issue recurrente del Biotrén — pasos no segregados en sectores Lorenzo Arenas, Los Cóndores y Lomas Coloradas. EFE ha hecho campañas y reforzado señalética pero los siniestros siguen.',
            ],
          ]}
        />
        <PendingBanner>
          <strong>Pendiente cuantitativo:</strong> demanda diaria
          declarada 2025-2026 (pre-pandemia rondaba ~25.000 pax/día
          según prensa regional; post-pandemia no hay cifra pública
          consolidada). Cifras de accidentalidad y campañas de
          seguridad en pasos a nivel también pendientes.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
            Wikipedia · Biotrén (material rodante, electrificación)
          </SourceLink>
          <SourceLink href="https://www.efetrenes.cl/">
            EFE Trenes · estructura corporativa (Trenes Metropolitanos como filial)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Issues conocidos">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Frecuencia y capacidad de cabotaje
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Cada 15 min en valle y 20-30 min los domingos es alto
              para un tren urbano. La capacidad de cabotaje (mover
              gente entre estaciones intermedias en franjas cortas)
              queda restringida. En horario punta el tren va lleno y
              quedan pasajeros en andén, especialmente Chiguayante y
              Concepción.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Pasos a nivel sin segregar
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Tramos urbanos cruzan calles sin paso superior ni
              inferior (Lorenzo Arenas, Los Cóndores, Lomas Coloradas).
              Accidentes recurrentes — peatones, autos y, en pocas
              ocasiones, otros trenes. EFE ha reforzado señalética
              pero la solución estructural (pasos a desnivel) requiere
              inversión MOP.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Conflicto con operadores de bus (subsidio competitivo)
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Algunos gremios de buses urbanos del Gran Concepción
              perciben al Biotrén como competencia desleal por su
              subsidio operacional. La tensión sube cuando se discuten
              extensiones — ver{' '}
              <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
                Biotrén · extensiones y proyectos
              </a>
              .
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Integración tarifaria pendiente con bus + BusPay
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Un viaje multimodal bus + tren paga dos veces. BusPay
              2026 no incluye al Biotrén en su perímetro inicial. Es
              uno de los frentes de modernización pendientes más
              obvios.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Cobertura del visor">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            ✅ Biotrén ya está nativo en el visor
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Las dos líneas (L1, L2) viven en{' '}
            <code className="font-mono">src/data/biotren.generated.ts</code>{' '}
            y{' '}
            <code className="font-mono">src/data/biotren-track.generated.ts</code>.
            Las estaciones se obtienen via Overpass API filtrando{' '}
            <code className="font-mono">operator~EFE</code> en el bbox
            del Biobío; el trazado se reconstruye recorriendo las vías{' '}
            <code className="font-mono">railway=rail</code> de OSM
            mediante un Dijkstra entre estaciones consecutivas.
            Re-generación con{' '}
            <code className="font-mono">npm run sync:biotren</code> y{' '}
            <code className="font-mono">npm run sync:biotren-track</code>.
          </p>
          <p className="mt-2 text-[12px]">
            <MapLink route="L1">L1 Hualqui ↔ Talcahuano →</MapLink>{' '}
            ·{' '}
            <MapLink route="L2">L2 Coronel ↔ Concepción →</MapLink>
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            ❌ Lo que NO está (todavía)
          </div>
          <ul className="mt-1 ml-5 list-disc space-y-0.5 text-[12px] text-muted-foreground">
            <li>
              Frecuencias por franja horaria detallada (sólo el headway
              global aparece en la sheet).
            </li>
            <li>
              Cuadro tarifario completo por zona en el visor — los
              valores Z1-Z10 viven sólo en esta ficha.
            </li>
            <li>
              Las extensiones propuestas (Penco, Tomé, Lota, Carriel
              Sur) — son <em>proyectos</em> sin trazado oficial
              digitalizable. Ver{' '}
              <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
                ficha de proyectos
              </a>
              .
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
              Biotrén · extensiones y proyectos
            </a>{' '}
            — Tren a Lota, ramales a Penco / Tomé, eventual conexión al
            Aeropuerto Carriel Sur. Estado, debates, tensión con el
            electrocorredor MOP Ruta 150. Ficha hermana de ésta, dedicada
            al <em>futuro</em>.
          </li>
          <li>
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>{' '}
            — el feed urbano de buses NO incluye al Biotrén; el visor lo
            arma desde OSM.
          </li>
          <li>
            <a href="/wiki/openstreetmap-fuente-visor" className="underline underline-offset-2">
              OpenStreetMap como fuente del visor
            </a>{' '}
            — ficha metodológica de la fuente que alimenta las
            estaciones y el trazado del Biotrén.
          </li>
          <li>
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay · pago electrónico del Gran Concepción
            </a>{' '}
            — el Biotrén NO entra en el perímetro inicial de BusPay
            2026. Sigue con tarjeta propia (Conecta / Biotrén).
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 · Concepción ↔ Santa Juana
            </a>{' '}
            — transbordo natural en la estación Juan Pablo II (L2).
          </li>
          <li>
            <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">
              Concepción ↔ Coronel ↔ Lota
            </a>{' '}
            — la L2 cubre la espina dorsal sur hasta Coronel; los buses
            urbanos hacen la red capilar y llegan a Lota (donde el tren
            no entra).
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Índice de recorridos interurbanos
            </a>{' '}
            — Talcamávida, Unihue y Quilacoya conectan por ferrocarril,
            no por bus. Esa función la cumple la cabecera sur de la L1
            (Hualqui) y servicios EFE Sur interurbanos que comparten
            traza.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Tarifas exactas de zonas Z5, Z7, Z8 y Z9 (las no listadas en la cobertura inicial de prensa).</li>
          <li>Demanda diaria declarada 2025-2026 por línea.</li>
          <li>Fechas exactas de inauguración comercial L1 (1999 vs 2005) y L2 (2009).</li>
          <li>Subsidio operacional MTT al Biotrén — monto anual y polinomio.</li>
          <li>Capacidad por composición Xtrapolis (norma de aforo aplicada).</li>
          <li>Detalle de accidentalidad histórica en pasos a nivel (campañas EFE, estadísticas).</li>
          <li>Integración tarifaria proyectada entre BusPay 2026 y la tarjeta Conecta / Biotrén.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a EFE Trenes
          Metropolitanos S.A. y a la SUBTRANS Biobío, foto del cuadro
          tarifario completo en estación Concepción, consulta a MIDESO
          por fichas IDI de las extensiones.
        </p>
      </Section>

      <Section title="Bibliografía">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.efetrenes.cl/biotren">
              EFE Trenes · sitio oficial Biotrén (estaciones, códigos EFE, horarios)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.efe.cl/efe-sur-informa-nueva-estructura-tarifaria-del-biotren-a-partir-del-2-de-enero-de-2026/">
              EFE Sur · 30-dic-2025 — Nueva estructura tarifaria Biotrén vigente 2-ene-2026
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.efe.cl/nuestros-servicios/biotren/tarifas-del-servicio/">
              EFE Trenes · Tarifas del servicio Biotrén (cuadro vigente)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.biobiochile.cl/noticias/servicios/toma-nota/2025/12/30/efe-sur-anuncia-alza-en-la-tarifa-del-biotren-para-2026-revisa-a-cuanto-subira-el-pasaje.shtml">
              BioBioChile · 30-dic-2025 — Alza promedio $60, tabla por zona
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
              Wikipedia · Biotrén (historia, material rodante)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Ferrocarril_Concepci%C3%B3n-Talcahuano">
              Wikipedia · Ferrocarril Concepción-Talcahuano (línea 1872)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
              Subtrans · BusPay 2026 (perímetro inicial sin Biotrén)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/node/310000768">
              OSM · Estación Concepción (node 310000768)
            </SourceLink>
          </li>
          <li>
            Datasets internos del visor: <code className="font-mono">src/data/biotren.generated.ts</code> (estaciones desde Overpass) y{' '}
            <code className="font-mono">src/data/biotren-track.generated.ts</code> (trazado <em>railway=rail</em> stitched).
          </li>
        </ul>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes foto del cuadro tarifario vigente en la estación
          Concepción (con todos los Z1-Z10 explicitados), conoces la
          demanda diaria 2025-2026, o tienes copia de la última memoria
          anual de EFE Trenes Metropolitanos — abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/biotren.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/biotren.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
