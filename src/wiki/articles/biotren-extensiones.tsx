// Biotrén y sus extensiones — tren urbano del Gran Concepción.
//
// Es el único tren urbano de Chile fuera de la red Metro de Santiago en
// operación regular (Merval Valparaíso es interurbano de cercanías; Tren
// Limache-Puerto comparte status, debatible). Lo opera EFE Trenes
// Metropolitanos S.A. (filial de EFE Sur, antes FESUR), sobre el corredor
// histórico Concepción-Talcahuano (Línea Sur del antiguo sistema EFE).
//
// El artículo verifica datos contra OSM (estaciones en
// `src/data/biotren.generated.ts`, way `railway=rail` operator=EFE en
// `biotren-track.generated.ts`) y prensa regional. Las extensiones
// (Penco, Tomé, Lota, Carriel Sur) están en distintos grados de estudio
// y debate y por eso van con banners ámbar.

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

export default function BiotrenExtensiones() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong>{' '}
        Estaciones, trazado, código de servicio L1/L2, operador EFE Trenes
        Metropolitanos y hitos históricos (1872 línea Sur, 1995 FESUR,
        proyecto Biotrén 2005, electrificación, 27F-2010) están citados.{' '}
        <strong>Pendientes</strong>: tarifa adulto vigente 2026 con
        polinomio de ajuste, demanda diaria 2025-2026, estado exacto del
        estudio de prefactibilidad de la extensión a Penco, decreto MTT
        del subsidio operacional. Las <em>extensiones</em> a Penco, Tomé,
        Lota y Carriel Sur están en debate público pero ninguna está
        adjudicada ni con RS (recomendación social) vigente en MIDESO al
        cierre 2025-2026 — toda esa sección lleva banner ámbar.
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
            hundidas. Extender el servicio es órdenes de magnitud más
            barato que construir un metro nuevo.
          </li>
          <li>
            <strong>Punto de tensión con el electrocorredor MOP Ruta
            150</strong>: la inversión más grande de transporte público
            en el Gran Concepción de la última década (UF 4,4 millones,
            ≈USD 172M) corre por la <em>carretera</em>, no por el riel.
            La decisión de mover dinero a bus eléctrico en vez de
            extender el Biotrén a Penco/Tomé es la disputa de política
            pública más jugosa del corredor norte (cubierta en detalle
            en{' '}
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>
            ).
          </li>
        </ul>
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
        <p>
          Las <strong>extensiones a Penco</strong> y a Tomé entraron al
          debate público desde la década de 2010. La Línea 2 a Lota no
          ha avanzado en estudios formales recientes. En paralelo, el
          MOP licitó en <strong>2025</strong> el electrocorredor de bus
          eléctrico sobre la Ruta 150, planteando la pregunta política:
          ¿tren extendido o BRT eléctrico?
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
              date: '13-nov-2024',
              event: 'CGR visa licitaciones MOP de corredores de transporte público para Rutas 150 / 160 / Conce-Talcahuano. Empieza la disputa política tren-vs-bus eléctrico.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: '10-dic-2025',
              event: 'Oferta única (Electro Cointer II) para concesión Ruta 150 + Conce-Talcahuano II (UF 4.431.000). La extensión Biotrén-Penco queda postergada otra vez.',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones' },
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
              '05:45 — 23:10 (Lun-Vie). Detalle por día festivo no documentado acá; revisar app oficial.',
            ],
            [
              'Material rodante',
              'Trenes eléctricos Xtrapolis (fabricados por Alstom Brasil) y unidades ABe históricas. Composiciones de 3 coches articulados. Electrificación 3 kV DC catenaria.',
            ],
            [
              'Tarifa adulto',
              'Por tramo (zonas), no plana. El visor anota "CLP por tramo" para diferenciar de buses (que cobran por viaje). Valor exacto 2026 no citado acá.',
            ],
            [
              'Información en tiempo real',
              'App "EFE Trenes" (sucesora de la app Biotrén) y avisos en estaciones.',
            ],
          ]}
        />
        <PendingBanner>
          <strong>Tarifa y polinomio de ajuste 2026 pendientes</strong>.
          La estructura tarifaria del Biotrén es <em>por zonas</em> (no
          plana como los buses urbanos), con valores diferenciados
          adulto / estudiante / adulto mayor. Cierre por foto del cuadro
          tarifario en cualquier estación o consulta a la app oficial.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.efetrenes.cl/biotren">
            EFE Trenes · servicio Biotrén
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
            Wikipedia · Biotrén (frecuencias, material rodante)
          </SourceLink>
        </Sources>
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

      <Section title="Extensiones propuestas">
        <PendingBanner>
          <strong>Toda esta sección es debate público, no obra
          adjudicada.</strong> Ninguna de las extensiones que siguen
          tiene contrato firmado, RS vigente en MIDESO ni decreto MOP /
          MTT al cierre de 2025-2026. Las cifras son referenciales de
          prensa regional y declaraciones públicas, no de bases de
          licitación. Verificación a fondo requiere acceso a estudios
          de prefactibilidad de EFE Trenes (Ley de Transparencia).
        </PendingBanner>

        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">
            Extensión norte a Penco (Línea 1)
          </div>
          <p className="text-[12px] leading-snug">
            Es la extensión más debatida. La L1 termina hoy en{' '}
            <strong>Mercado de Talcahuano</strong>; la propuesta es
            extender por el corredor costero hasta Penco aprovechando
            trazas férreas existentes (algunas en desuso, otras
            compartidas con el ramal de carga al puerto de Lirquén). La
            comuna de Penco (47.367 hab. Censo 2017) hoy depende del bus
            urbano (líneas 17M, 30B/C/E, 31F, 57Y, 62H del feed GTFS
            Gran Concepción) o de buses interurbanos de Transportes Tomé
            (servicios 401/411/421).
          </p>
          <p className="text-[12px] leading-snug">
            El alcalde de Penco <strong>Víctor Hugo Figueroa</strong>{' '}
            advirtió en noviembre 2022 que el corredor MOP Ruta 150
            puede <em>frenar</em> la llegada del Biotrén porque baja la
            demanda potencial del tren al mejorar el bus por carretera.
            EFE Trenes tiene un estudio de prefactibilidad en curso —
            estado y resultado al cierre 2025-2026 no han sido
            publicados.
          </p>
          <div className="text-[11px] text-muted-foreground">
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
              Diario Concepción · 1-nov-2022 — Ruta 150 puede frenar Biotrén-Penco
            </SourceLink>
          </div>
        </div>

        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">
            Extensión norte a Tomé (continuación de la anterior)
          </div>
          <p className="text-[12px] leading-snug">
            Una vez en Penco, una segunda fase llevaría el riel hasta
            Tomé (54.946 hab. Censo 2017) por la costa. Es la propuesta
            alternativa al electrocorredor Ruta 150: en vez de un BRT
            eléctrico sobre asfalto, recuperar la conexión ferroviaria
            histórica. El argumento técnico es que la traza Penco-Tomé
            tuvo riel hasta la década de 1980 (servicio textil hacia
            Bellavista Oveja Tomé) y rehabilitarla sería menos invasivo
            que ensanchar la carretera. Sin proyecto formal de EFE ni
            recomendación MIDESO.
          </p>
          <p className="text-[12px] leading-snug">
            La municipalidad de Tomé pidió en noviembre 2025 que el
            beneficio del proyecto MOP se extienda hasta Tomé, no sólo
            hasta el Enlace Penco — pero esa petición es sobre el
            corredor de buses, no sobre el tren. Para el detalle político
            ver{' '}
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>
            .
          </p>
          <div className="text-[11px] text-muted-foreground">
            <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
              Tomé al día · nov-2025 — Tomé pide extensión del beneficio
            </SourceLink>
          </div>
        </div>

        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">
            Extensión sur a Lota (Línea 2)
          </div>
          <p className="text-[12px] leading-snug">
            La L2 termina hoy en <strong>Coronel</strong> (urbano).
            Continuar 8-10 km al sur hasta Lota (~43.535 hab. Censo
            2017) por la traza histórica del ramal del carbón es una
            propuesta recurrente de autoridades locales — el ramal
            existió hasta el cierre de la minería del carbón (Schwager
            cerró 1994, Lota Verde 1997). No hay proyecto EFE formal en
            curso. La traza está parcialmente desarmada, parcialmente
            ocupada por usos urbanos.
          </p>
        </div>

        <div className="rounded-md border bg-card p-3 space-y-2">
          <div className="text-[13px] font-semibold">
            Ramal al Aeropuerto Carriel Sur (especulativo)
          </div>
          <p className="text-[12px] leading-snug">
            Concepción es uno de los pocos aeropuertos chilenos
            relevantes <em>sin</em> conexión por tren. Carriel Sur
            (Talcahuano) está a ~3 km de la estación El Arenal de la L1.
            Un ramal corto cerraría esa brecha, pero <strong>no existe
            propuesta formal documentada</strong> al cierre 2025-2026.
            Es una idea recurrente de columnas de opinión y proyectos
            académicos, no de la planificación de EFE ni MOP.
          </p>
        </div>

        <PendingBanner>
          <strong>Datos por confirmar para cada extensión:</strong>{' '}
          inversión estimada (UF / USD), fecha de RS MIDESO, estado del
          estudio de prefactibilidad / ingeniería básica, ventana de
          ejecución proyectada. Cierre por solicitud de Ley de
          Transparencia a EFE Trenes Metropolitanos y a la SUBTRANS
          Biobío.
        </PendingBanner>
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
              'EFE Trenes Metropolitanos recibe subsidio MTT vía Ley de Presupuestos anual. Monto y polinomio pendientes de cita.',
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

      <Section title="Tarifa e integración">
        <KeyValueList
          items={[
            [
              'Estructura tarifaria',
              'Por tramo (zonas), no plana. El visor anota "CLP por tramo" en la sheet de detalle de la línea. Adulto, estudiante, adulto mayor / persona con discapacidad — distintas tarifas.',
            ],
            [
              'Pago',
              'Tarjeta del Biotrén (sistema histórico EFE) en validadores de estación. No es la misma tarjeta que usan los buses urbanos.',
            ],
            [
              'Integración con buses urbanos',
              'NO hay integración tarifaria con buses urbanos del Gran Concepción al cierre 2025-2026. Un viaje bus + Biotrén paga dos veces.',
            ],
            [
              'BusPay 2026',
              'BusPay es el sistema de pago electrónico para buses del Perímetro de Exclusión del Gran Concepción + Santa Juana + Tomé (puesta en marcha proyectada 2026). El Biotrén NO está dentro del perímetro inicial de BusPay según la información SUBTRANS publicada — la integración con tren es pendiente de definición.',
            ],
            [
              'Tarifa adulto vigente 2026',
              'Pendiente. Cierre por foto del cuadro tarifario en cualquier estación.',
            ],
          ]}
        />
        <PendingBanner>
          <strong>Hueco editorial conocido:</strong> el cuadro tarifario
          completo del Biotrén por zona y por categoría no está
          replicado en este artículo. Sin la tabla oficial, evitamos
          poner valores aproximados que envejecen mal.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Perímetro inicial BusPay = Gran Concepción + Santa Juana + Tomé
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tensión con el electrocorredor Ruta 150">
        <p>
          Esta es la disputa de política pública más fuerte del corredor
          norte y vale documentarla en su propio bloque. Los datos del
          electrocorredor están desarrollados en{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          ; acá los resumimos en clave Biotrén.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">Extensión Biotrén Penco</th>
                <th className="px-3 py-2 font-medium">Electrocorredor MOP Ruta 150</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top text-[12px]">
              <tr>
                <td className="px-3 py-2 font-medium">Modo</td>
                <td className="px-3 py-2">Tren eléctrico sobre riel (3 kV DC)</td>
                <td className="px-3 py-2">Buses (eléctricos y diésel) sobre pista exclusiva en carretera</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Inversión referencial</td>
                <td className="px-3 py-2">No publicada — estudio de prefactibilidad en EFE</td>
                <td className="px-3 py-2">UF 4.431.000 ≈ USD 172M (Ruta 150 + Conce-Talcahuano II)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Estado 2025-2026</td>
                <td className="px-3 py-2">Estudio EFE, sin RS MIDESO ni licitación abierta</td>
                <td className="px-3 py-2">Oferta única recibida 10-dic-2025 · apertura económica 15-ene-2026 · adjudicación 1S 2026 esperada</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Capacidad estructural</td>
                <td className="px-3 py-2">Cientos de pax por composición; orden de magnitud sobre el bus</td>
                <td className="px-3 py-2">Buses 18-26 m articulados; capacidad agregada vía frecuencia</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Cobertura territorial</td>
                <td className="px-3 py-2">Punto a punto (estaciones); cobertura de "última milla" insuficiente sin alimentadores</td>
                <td className="px-3 py-2">Buses pueden seguir hasta Lirquén / Tomé / Dichato; mejor cobertura</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Horizonte de puesta en servicio</td>
                <td className="px-3 py-2">No comprometido</td>
                <td className="px-3 py-2">2032 proyectado (obras 2S 2029 — 1S 2030)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Veto político</td>
                <td className="px-3 py-2">Alcalde Penco (2022): el corredor puede "frenar" la llegada del tren</td>
                <td className="px-3 py-2">Municipalidad Tomé (2025) pide extender el beneficio hasta Tomé</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La lectura editorial: el electrocorredor <em>desplaza
          políticamente</em> a la extensión Biotrén — no son
          incompatibles técnicamente, pero el presupuesto público no
          alcanza para ambos y la priorización MOP es por carretera. Si
          el electrocorredor se ejecuta y absorbe la demanda, la
          demanda residual no justifica el riel a Penco. Si la
          extensión a Penco hubiera entrado antes en la cola de
          inversión MIDESO, el orden podría haberse invertido.
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022 — Ruta 150 vs Biotrén
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025 — Ofertas Ruta 150
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
            Diario Concepción · 7-nov-2025 — Electrocorredores
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
              extensiones (Penco, Tomé): los operadores que sirven hoy
              esos corredores pierden demanda si el tren llega.
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
              Cuadro tarifario por zona y por categoría — el visor
              anota "CLP por tramo" sin valor exacto.
            </li>
            <li>
              Las extensiones propuestas (Penco, Tomé, Lota, Carriel
              Sur) — son <em>proyectos</em> sin trazado oficial
              digitalizable.
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>{' '}
            — el corredor norte completo, con la cobertura más detallada
            del electrocorredor MOP y del transbordo bus-tren en
            Lirquén / Penco.
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 · Concepción ↔ Santa Juana
            </a>{' '}
            — transbordo natural en la estación Juan Pablo II (L2).
          </li>
          <li>
            <a href="/wiki/corredor-el-pimenton" className="underline underline-offset-2">
              Corredor de El Pimentón
            </a>{' '}
            — Florida y la zona sur-oriente no tienen Biotrén y dependen
            100% del bus interurbano; cita cruzada útil para el contraste
            de cobertura.
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Índice de recorridos interurbanos
            </a>{' '}
            — ese índice menciona que Talcamávida, Unihue y Quilacoya
            conectan por ferrocarril, no por bus. Esa función la cumple
            la cabecera sur de la L1 (Hualqui) y servicios EFE Sur
            interurbanos que comparten traza.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Tarifa adulto vigente 2026 por zona y por categoría.</li>
          <li>Demanda diaria declarada 2025-2026 por línea.</li>
          <li>Estado y resultado del estudio de prefactibilidad EFE para extensión a Penco.</li>
          <li>Inversión estimada y RS MIDESO de cada extensión (Penco, Tomé, Lota, Carriel Sur).</li>
          <li>Fechas exactas de inauguración comercial L1 (1999 vs 2005) y L2 (2009).</li>
          <li>Subsidio operacional MTT al Biotrén — monto anual y polinomio.</li>
          <li>Capacidad por composición Xtrapolis (norma de aforo aplicada).</li>
          <li>Detalle de accidentalidad histórica en pasos a nivel (campañas EFE, estadísticas).</li>
          <li>Integración tarifaria proyectada entre BusPay 2026 y la tarjeta Biotrén.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a EFE Trenes
          Metropolitanos S.A. y a la SUBTRANS Biobío, foto del cuadro
          tarifario en estación Concepción, consulta a MIDESO por
          fichas IDI de las extensiones.
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
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
              Diario Concepción · 1-nov-2022 — Ruta 150 puede frenar Biotrén a Penco
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
              MOP Concesiones · 10-dic-2025 — Ofertas Ruta 150 + Conce-Talcahuano II
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
              Diario Concepción · 7-nov-2025 — Electrocorredores Gran Concepción
            </SourceLink>
          </li>
          <li>
            <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
              Tomé al día · nov-2025 — Petición de extensión del beneficio
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
          Si tenés foto del cuadro tarifario vigente en la estación
          Concepción, conocés el estado del estudio de prefactibilidad
          de la extensión Biotrén-Penco, o tenés copia de la última
          memoria anual de EFE Trenes Metropolitanos — abrí un pull
          request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/biotren-extensiones.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/biotren-extensiones.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
