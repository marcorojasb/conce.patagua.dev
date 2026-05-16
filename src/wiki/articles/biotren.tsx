// Biotrén — tren urbano operacional del Gran Concepción.
// L1 Hualqui ↔ Mercado de Talcahuano, L2 Coronel ↔ Concepción,
// 26 estaciones (OSM), tarifas Z1-Z10 vigentes desde 2-ene-2026.
// Extensiones futuras → `biotren-extensiones-proyectos`.

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
        Estaciones, trazado, operador EFE Trenes Metropolitanos, hitos
        históricos (1872, 1995 FESUR, 2005 Biotrén, 27F-2010) y tarifas
        por zona Z1-Z10 vigentes desde 2-ene-2026 ($420-$850 adulto):
        todo citado.{' '}
        <strong>Pendientes</strong>: demanda diaria 2025-2026, monto del
        subsidio MTT, integración tarifaria con BusPay 2026.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          El <strong>Biotrén</strong> es el sistema de tren urbano del
          Gran Concepción, operado por <strong>EFE Trenes Metropolitanos
          S.A.</strong> (filial de EFE Sur). Es el{' '}
          <strong>único tren urbano de Chile en operación regular fuera
          de la red Metro de Santiago</strong> — Merval y EFE Central son
          cercanías-interurbano.
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Capacidad estructural</strong>: cada composición
            Xtrapolis o ABe lleva centenares de pasajeros — un orden de
            magnitud sobre cualquier bus.
          </li>
          <li>
            <strong>Infraestructura hundida</strong>: línea férrea
            Concepción-Talcahuano de 1872, electrificación 3 kV DC y doble
            vía urbana ya construidas.
          </li>
          <li>
            <strong>Capa nativa del visor</strong>: a diferencia de los
            buses (feed{' '}
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>
            ), el Biotrén se procesa desde OSM (relations 6857222 / 6857223
            + nodos <code>railway=station</code>).
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Extensiones (Penco, Tomé, Lota, Carriel Sur) y tensión con el
          electrocorredor MOP Ruta 150 →{' '}
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
          La línea férrea Concepción-Talcahuano se inauguró en{' '}
          <strong>1872</strong> como parte del sistema Sur de EFE. En{' '}
          <strong>1995</strong> se creó la filial regional FESUR
          (Ferrocarriles Suburbanos de Concepción S.A.) para operar
          cercanías. El servicio comercial <strong>Biotrén</strong> partió
          en <strong>2005</strong> con electrificación 3 kV DC y trenes
          Xtrapolis modular (Alstom Brasil). La <strong>Línea 2</strong>{' '}
          (Concepción ↔ Coronel) entró en <strong>2009</strong> sobre el
          ramal histórico del carbón (Schwager, Lota).
        </p>
        <p>
          El <strong>27F-2010</strong> dañó puentes y estaciones
          (especialmente el puente Biobío de la L2). En <strong>2017</strong>{' '}
          FESUR fue absorbida y reorganizada como EFE Trenes Metropolitanos
          S.A. La pandemia 2020-2021 desplomó la demanda con frecuencias
          y ventanas reducidas.
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
          <strong>Pendientes históricos:</strong> fechas exactas de
          electrificación 3 kV DC del eje urbano y de apertura comercial
          L1/L2 (fuentes mencionan 1999, 2005 y 2009 inconsistentemente).
          Cierre por Ley de Transparencia a EFE Trenes.
        </PendingBanner>
      </Section>

      <Section title="Servicios actuales">
        <p>
          Dos líneas con terminal común en <strong>Estación Concepción</strong>{' '}
          (OSM <code className="font-mono">node 310000768</code>,
          {' '}<code className="font-mono">−36.8302, −73.0610</code>):
        </p>
        <KeyValueList
          items={[
            ['Línea 1', <><strong>Hualqui ↔ Mercado de Talcahuano</strong> · 12 estaciones · azul claro. <MapLink route="L1">Ver L1 →</MapLink></>],
            ['Línea 2', <><strong>Coronel ↔ Concepción</strong> · ramal del carbón (Lomas Coloradas, San Pedro, Juan Pablo II) · 14 estaciones · azul oscuro. <MapLink route="L2">Ver L2 →</MapLink></>],
            ['Operador', 'EFE Trenes Metropolitanos S.A. (filial EFE Sur), con subsidio operacional MTT.'],
            ['Headway', '6-12 min punta · 15 min valle (Lun-Vie); 12-20 min sábado; 20-30 min domingo.'],
            ['Ventana operativa', '05:45 — 23:10 (Lun-Vie). Festivos en app oficial.'],
            ['Material rodante', 'Xtrapolis (Alstom Brasil) y ABe históricas; 3 coches articulados; 3 kV DC catenaria.'],
            ['Estructura tarifaria', 'Zonas Z1-Z10 desde 2-ene-2026 (rango $420-$850 adulto). Ver sección "Tarifas vigentes 2026".'],
            ['Tiempo real', 'App "EFE Trenes" y avisos en estaciones.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.efetrenes.cl/biotren">
            EFE Trenes · sitio oficial Biotrén
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
            Wikipedia · Biotrén
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifas vigentes 2026">
        <p>
          Estructura por <strong>zonas Z1-Z10</strong> desde el{' '}
          <strong>2-ene-2026</strong>. Alza promedio $60/viaje (rango
          $40-$70). EFE Sur cita "alza acumulada por inflación no aplicada
          en pandemia" como fundamento.
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
          <strong>Descuentos:</strong> TNE <strong>67%</strong> (media y
          superior, básica liberada). Adultos mayores <strong>50%</strong>{' '}
          los 365 días.
        </p>
        <KeyValueList
          items={[
            ['Pago', 'Tarjeta Conecta (sucesora de Biotrén 2005) en validadores de estación. Distinta a la tarjeta de buses urbanos.'],
            ['Integración con buses', 'SIN integración tarifaria al cierre 2025-2026. Bus + tren paga dos veces.'],
            [
              'BusPay 2026',
              <>
                BusPay (PE Gran Concepción + Santa Juana + Tomé, marcha
                blanca Q3 2026) <strong>NO</strong> incluye al Biotrén en
                su perímetro inicial. Ver{' '}
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
          <strong>Por confirmar:</strong> tarifas exactas Z5, Z7, Z8, Z9.
          Cierre por foto del cuadro tarifario en estación Concepción o
          PDF oficial EFE Sur.
        </PendingBanner>
      </Section>

      <Section title="Estaciones">
        <p>
          26 estaciones (12 en L1, 14 en L2) digitalizadas desde OSM
          (<code>railway=stop</code> con <code>operator~EFE</code>) en{' '}
          <code className="font-mono">src/data/biotren.generated.ts</code>.
          Códigos EFE (<code>HQ</code>, <code>CC</code>, <code>TH</code>)
          provienen de efetrenes.cl.
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
          <strong>Concepción</strong> es la única estación común a ambas
          líneas (transbordo cross-platform).{' '}
          <strong>Juan Pablo II</strong> es el transbordo natural entre L2
          y los servicios a Santa Juana — ver{' '}
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
            ['Operador', 'EFE Trenes Metropolitanos S.A. — filial de EFE Sur (reorganización 2017; antes FESUR, 1995).'],
            ['Tipo de tren', 'Xtrapolis modular (Alstom Brasil), 3 coches articulados, motorización distribuida. ABe históricas en complemento.'],
            ['Electrificación', '3 kV DC catenaria (misma tensión que la Línea Central Santiago ↔ Chillán).'],
            ['Vía', 'Ancho ibérico 1.676 mm. Doble vía en el tramo urbano (Concepción ↔ Talcahuano, Concepción ↔ Hualqui).'],
            ['Frecuencias', '6-12 min punta · 15 min valle (Lun-Vie); 12-20 min sábado; 20-30 min domingo.'],
            ['Capacidad por composición', 'No documentada con cifra única. Cierre por ficha del fabricante.'],
            ['Subsidio operacional', 'EFE Trenes Metropolitanos vía Ley de Presupuestos anual. Monto y polinomio pendientes. EFE no se financia con Ley 20.378.'],
            ['Accidentes en pasos a nivel', 'Issue recurrente — Lorenzo Arenas, Los Cóndores, Lomas Coloradas. Campañas y señalética sin resolver el problema estructural.'],
          ]}
        />
        <PendingBanner>
          <strong>Pendiente cuantitativo:</strong> demanda diaria 2025-2026
          (pre-pandemia ~25.000 pax/día según prensa; sin cifra pública
          post-pandemia) y estadísticas de accidentalidad en pasos a nivel.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
            Wikipedia · Biotrén (material rodante, electrificación)
          </SourceLink>
          <SourceLink href="https://www.efetrenes.cl/">
            EFE Trenes · estructura corporativa
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Issues conocidos">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Frecuencia y cabotaje
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              15 min valle y 20-30 min domingo es alto. En punta hay pasajeros
              en andén (Chiguayante, Concepción).
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Pasos a nivel sin segregar
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Lorenzo Arenas, Los Cóndores, Lomas Coloradas. Accidentes
              recurrentes; desniveles requieren inversión MOP.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Conflicto con operadores de bus
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Gremios perciben al Biotrén como competencia desleal por el
              subsidio. Tensión sube con cada extensión — ver{' '}
              <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
                Biotrén · extensiones y proyectos
              </a>
              .
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Integración tarifaria con BusPay
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Bus + tren paga dos veces. BusPay 2026 no incluye al Biotrén
              en su perímetro inicial.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Cobertura del visor">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Biotrén nativo en el visor
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            L1 y L2 viven en{' '}
            <code className="font-mono">src/data/biotren.generated.ts</code>{' '}
            y{' '}
            <code className="font-mono">biotren-track.generated.ts</code>.
            Estaciones por Overpass (<code>operator~EFE</code>); trazado
            reconstruido desde <code>railway=rail</code> con Dijkstra.
            Re-generación:{' '}
            <code className="font-mono">npm run sync:biotren</code> y{' '}
            <code className="font-mono">sync:biotren-track</code>.
          </p>
          <p className="mt-2 text-[12px]">
            <MapLink route="L1">L1 Hualqui ↔ Talcahuano →</MapLink>{' '}·{' '}
            <MapLink route="L2">L2 Coronel ↔ Concepción →</MapLink>
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">Lo que NO está</div>
          <ul className="mt-1 ml-5 list-disc space-y-0.5 text-[12px] text-muted-foreground">
            <li>Frecuencias por franja horaria detallada.</li>
            <li>Cuadro tarifario Z1-Z10 en el visor (vive en esta ficha).</li>
            <li>
              Extensiones propuestas (Penco, Tomé, Lota, Carriel Sur) —
              sin trazado oficial digitalizable. Ver{' '}
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
            — Tren a Lota, ramales a Penco / Tomé, Carriel Sur; tensión
            con el electrocorredor MOP Ruta 150.
          </li>
          <li>
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>{' '}
            — el feed urbano NO incluye al Biotrén; el visor lo arma desde
            OSM.
          </li>
          <li>
            <a href="/wiki/openstreetmap-fuente-visor" className="underline underline-offset-2">
              OpenStreetMap como fuente del visor
            </a>{' '}
            — ficha metodológica de las estaciones y trazado.
          </li>
          <li>
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay · pago electrónico del Gran Concepción
            </a>{' '}
            — el Biotrén NO entra en el perímetro inicial; sigue con
            tarjeta Conecta / Biotrén.
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 · Concepción ↔ Santa Juana
            </a>{' '}
            — transbordo natural en Juan Pablo II (L2).
          </li>
          <li>
            <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">
              Concepción ↔ Coronel ↔ Lota
            </a>{' '}
            — la L2 cubre el eje sur hasta Coronel; los buses llegan a
            Lota (sin tren).
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Índice de recorridos interurbanos
            </a>{' '}
            — Talcamávida, Unihue y Quilacoya conectan por ferrocarril
            (cabecera sur L1 y servicios EFE Sur).
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Tarifas exactas Z5, Z7, Z8, Z9.</li>
          <li>Demanda diaria 2025-2026 por línea.</li>
          <li>Fechas exactas de inauguración L1 (1999 vs 2005) y L2 (2009).</li>
          <li>Subsidio MTT al Biotrén — monto anual y polinomio.</li>
          <li>Capacidad por composición Xtrapolis (norma de aforo).</li>
          <li>Accidentalidad histórica en pasos a nivel.</li>
          <li>Integración tarifaria BusPay ↔ Conecta / Biotrén.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Cierre: Ley de Transparencia a EFE Trenes Metropolitanos y
          SUBTRANS Biobío; foto del cuadro tarifario en estación
          Concepción; fichas IDI de MIDESO.
        </p>
      </Section>

      <Section title="Bibliografía">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.efetrenes.cl/biotren">
              EFE Trenes · sitio oficial Biotrén (estaciones, códigos, horarios)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.efe.cl/efe-sur-informa-nueva-estructura-tarifaria-del-biotren-a-partir-del-2-de-enero-de-2026/">
              EFE Sur · 30-dic-2025 — Nueva estructura tarifaria 2-ene-2026
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.efe.cl/nuestros-servicios/biotren/tarifas-del-servicio/">
              EFE Trenes · Tarifas del servicio Biotrén
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.biobiochile.cl/noticias/servicios/toma-nota/2025/12/30/efe-sur-anuncia-alza-en-la-tarifa-del-biotren-para-2026-revisa-a-cuanto-subira-el-pasaje.shtml">
              BioBioChile · 30-dic-2025 — Alza promedio $60, tabla por zona
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Biotr%C3%A9n">
              Wikipedia · Biotrén
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Ferrocarril_Concepci%C3%B3n-Talcahuano">
              Wikipedia · Ferrocarril Concepción-Talcahuano (1872)
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
            Datasets internos:{' '}
            <code className="font-mono">src/data/biotren.generated.ts</code>{' '}
            (estaciones) y{' '}
            <code className="font-mono">biotren-track.generated.ts</code>{' '}
            (trazado).
          </li>
        </ul>
      </Section>

      <Section title="Para contribuir">
        <p>
          Foto del cuadro tarifario completo Z1-Z10 en estación Concepción,
          demanda diaria 2025-2026 o memoria anual EFE Trenes Metropolitanos
          → pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/biotren.tsx">
            github.com/marcorojasb/conce.patagua.dev
          </SourceLink>
          .
        </p>
      </Section>
    </div>
  );
}
