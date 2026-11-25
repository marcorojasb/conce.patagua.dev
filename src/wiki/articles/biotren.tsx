// Biotrén, tren urbano operacional del Gran Concepción.
// L1 Hualqui ↔ Mercado de Talcahuano, L2 Coronel ↔ Concepción,
// 25 estaciones (OSM; Concepción la comparten L1 y L2), tarifas Z1-Z10 vigentes desde 2-ene-2026, horarios
// de los itinerarios oficiales de EFE vigentes desde 15-jul-2026 (transcritos
// tren por tren en src/data/static-service-patterns.ts).
// Extensiones futuras → `biotren-extensiones-proyectos`.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  IssueNotice,
  KeyValueList,
  NewsPulse,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';
import { MapLink } from '@/wiki/map-link';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function Biotren() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong>{' '}
        Estaciones, trazado, operador, tarifas Z1-Z10 desde 2-ene-2026 ($420-$850
        adulto) e itinerarios EFE desde el 15-jul-2026.{' '}
        <strong>Pendientes</strong>: demanda diaria, monto del subsidio MTT,
        la tarifa de Z5 e integración tarifaria con BusPay (sin
        anuncio al 25-nov-2026).
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Líneas', value: 'L1 · L2' },
          { label: 'Estaciones', value: '25 (OSM)' },
          { label: 'Tarifa adulto', value: '$420–$850 (Z1–Z10)' },
          { label: 'Operador', value: 'EFE Trenes Metropolitanos' },
          { label: 'Trenes lun–vie', value: 'L1 37 · L2 104 (itinerario EFE)' },
          { label: 'Mapa', value: <><MapLink route="L1">L1</MapLink>{' · '}<MapLink route="L2">L2</MapLink></> },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Único tren urbano de Chile en operación regular fuera de Metro
            Santiago; lo opera EFE Trenes Metropolitanos (EFE Sur).
          </>,
          <>
            <strong>L1</strong> Hualqui ↔ Mercado de Talcahuano (12 estaciones)
            y <strong>L2</strong> Coronel ↔ Concepción (14), con estación común
            en Concepción.
          </>,
          <>
            Tarifas por zonas <strong>Z1–Z10</strong> desde el 2-ene-2026
            (adulto $420–$850). Se paga con tarjeta Conecta, no con BusPay.
          </>,
          <>
            Itinerarios EFE desde el 15-jul-2026: en día hábil, L1 corre 37
            trenes (cada ~30 min en punta) y L2 104 (cada ~12 min en punta).
          </>,
          <>
            EFE no publica GTFS: el visor dibuja L1/L2 desde OSM y proyecta
            cada tren según el itinerario oficial. No es GPS en vivo.
          </>,
          <>
            Extensiones a Penco-Lirquén y Lota → {' '}
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
              ficha de proyectos
            </a>
            .
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '20-oct-2026',
            title: 'Extensión a Penco y Lirquén: estudios, obras desde 2032 y servicio en 2034',
            detail:
              'EFE Sur estima US$ 210 M en total y US$ 16 M para la etapa de estudios. Detalle y Lota en la ficha de extensiones.',
            source: {
              href: 'https://www.meganoticias.cl/nacional/534357-biotren-extension-recorrido-penco-lirquen-inversion-efe-sur-obras-2034-20-10-2026.html',
              label: 'Meganoticias · 20-oct-2026',
            },
          },
          {
            date: '15-jul-2026',
            title: 'Itinerarios L1 y L2 vigentes desde el 15-jul-2026',
            detail:
              'EFE publica las tablas de salidas por línea, sentido y día (lunes a viernes y fin de semana). El visor las usa tren por tren.',
            source: {
              href: 'https://www.efe.cl/itinerario-biotren/',
              label: 'EFE · Itinerario Biotrén',
            },
          },
          {
            date: '7-abr-2026',
            title: '10 trenes nuevos CRRC Sifang: la mayoría para Concepción-Coronel',
            detail:
              'Cada tren llevaría 717 pasajeros (222 sentados). El subsecretario Martín Mackenna dijo que duplicará la capacidad hacia 2028; las dos primeras unidades llegarían a fines de abril para pruebas. Sin fecha de servicio.',
            source: {
              href: 'https://www.meganoticias.cl/nacional/518866-nuevos-trenes-efe-para-el-servicio-de-concepcion-y-coronel-07-04-2026.html',
              label: 'Meganoticias · 7-abr-2026',
            },
          },
        ]}
      />

      <Section title="Horario oficial y trenes en el mapa">
        <p>
          EFE publica los itinerarios como imágenes, por línea, sentido y
          día, vigentes desde el <strong>15-jul-2026</strong>. El visor los
          transcribe salida por salida y arma con ellos la ficha de cada
          línea y el modo <strong>Micros en el mapa · Horario</strong>. La
          posición no viene de GPS: cada tren se proyecta sobre el trazado
          OSM entre su salida y su llegada publicadas.
        </p>
        <DataTable columns={['Línea', 'Lunes a viernes', 'Sábado', 'Domingo']} bodyClassName="divide-y align-top text-[12px]">
          <tr>
            <td className="px-3 py-2 font-medium">L1 Hualqui ↔ Mercado</td>
            <td className="px-3 py-2">
              37 trenes (19 desde Hualqui, 18 desde Mercado) · cada ~30 min
              en punta; entre 10:00 y 15:00 solo 2 o 3 por sentido y ningún
              tren en vía entre ~13:15 y 15:00 · 06:20 a 22:48
            </td>
            <td className="px-3 py-2">16 trenes (8 por sentido) · 08:30 a 21:26</td>
            <td className="px-3 py-2">8 trenes (4 por sentido, todos Tren Laja–Talcahuano) · 08:30 a 21:26</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">L2 Coronel ↔ Concepción</td>
            <td className="px-3 py-2">
              104 trenes (52 por sentido) · cada ~12 min en punta, 15–80 min
              al mediodía · 05:55 a 23:32
            </td>
            <td className="px-3 py-2">53 trenes (26 desde Coronel, 27 desde Concepción) · cada ~30 min · 06:30 a 22:12</td>
            <td className="px-3 py-2">32 trenes (16 por sentido) · cada ~45 min en promedio (entre 15 y 80 min) · 08:30 a 21:42</td>
          </tr>
        </DataTable>
        <KeyValueList
          items={[
            ['Qué cuenta', 'Solo trenes de cabecera a cabecera. L1 suma 4 servicios Tren Laja–Talcahuano por sentido en día hábil; los servicios cortos de día hábil (hasta Arenal, Leonera, Los Canelos o Cristo Redentor) no se simulan.'],
            ['Tiempo de viaje', 'L1 56–67 min de cabecera a cabecera; L2 42–45 min.'],
            ['Limitación', 'Sin GTFS ni ubicación en vivo: atrasos, cancelaciones, contingencias y horarios de feriado no aparecen.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.efe.cl/itinerario-biotren/">
            EFE · Itinerario Biotrén (vigente desde 15-jul-2026)
          </SourceLink>
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/src/data/static-service-patterns.ts">
            Transcripción tren por tren · src/data/static-service-patterns.ts
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Qué es y servicios">
        <p>
          El <strong>Biotrén</strong> corre sobre la línea Concepción-Talcahuano
          de 1872, electrificada a 3 kV DC. A diferencia de los buses del feed{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>
          , no tiene GTFS: el visor toma estaciones y vía de OSM (relations
          6857222 / 6857223) y horarios de EFE.
        </p>
        <KeyValueList
          items={[
            ['Línea 1', <><strong>Hualqui ↔ Mercado de Talcahuano</strong> · 12 estaciones. <MapLink route="L1">Ver L1 →</MapLink></>],
            ['Línea 2', <><strong>Coronel ↔ Concepción</strong> · ramal del carbón · 14 estaciones. <MapLink route="L2">Ver L2 →</MapLink></>],
            ['Operador', 'EFE Trenes Metropolitanos S.A. (EFE Sur; antes FESUR, 1995; reorganizada en 2017), con subsidio operacional.'],
            ['Tiempo real', 'App "EFE Trenes" y avisos en estaciones. EFE advierte en su página de tarifas (revisada el 25-nov-2026) que los tiempos de viaje están más largos que lo usual por ajustes operacionales.'],
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
          Zonas <strong>Z1-Z10</strong> desde el <strong>2-ene-2026</strong>.
          Alza promedio $60 por viaje (rango $40-$70), por mayores costos de
          energía e IPC no aplicado en pandemia. Al 25-nov-2026 no
          hay un reajuste posterior publicado.
        </p>
        <DataTable columns={['Zona', 'Estaciones (extracto)', 'Adulto']} bodyClassName="divide-y align-top text-[12px] [&_td]:px-3 [&_td]:py-2">
          <tr><td className="font-mono">Z1</td><td>Hualqui (terminal sur L1)</td><td className="font-mono">$550</td></tr>
          <tr><td className="font-mono">Z2</td><td>La Leonera, Manquimávida, Pedro Medina, Chiguayante</td><td className="font-mono">$510</td></tr>
          <tr><td className="font-mono">Z3</td><td>Concepción, Lorenzo Arenas</td><td className="font-mono">$420</td></tr>
          <tr><td className="font-mono">Z4</td><td>UTFSM, Los Cóndores, Higueras</td><td className="font-mono">$500</td></tr>
          <tr><td className="font-mono">Z5</td><td>El Arenal, Mercado de Talcahuano</td><td className="text-muted-foreground">por confirmar</td></tr>
          <tr><td className="font-mono">Z6</td><td>Juan Pablo II, Diagonal Bío-Bío (L2)</td><td className="font-mono">$570</td></tr>
          <tr><td className="font-mono">Z7</td><td>Alborada, Costa Mar (L2)</td><td className="font-mono">$570</td></tr>
          <tr><td className="font-mono">Z8</td><td>El Parque, Lomas Coloradas (L2)</td><td className="font-mono">$570</td></tr>
          <tr><td className="font-mono">Z9</td><td>Cardenal Raúl Silva Henríquez (L2)</td><td className="font-mono">$570</td></tr>
          <tr><td className="font-mono">Z10</td><td>Coronel, Laguna Quiñenco, Cristo Redentor, Huinca, Los Canelos, Hito Galvarino (L2)</td><td className="font-mono">$850</td></tr>
        </DataTable>
        <KeyValueList
          items={[
            ['Descuentos', 'TNE 67% (media y superior; básica liberada). Adultos mayores 50% los 365 días.'],
            ['Pago', 'Tarjeta Conecta ($2.500; se recarga en boleterías, máquinas, app y efe.cl). No es la tarjeta de los buses urbanos.'],
            [
              'Integración con buses',
              <>
                Sin integración tarifaria publicada: bus + tren paga dos
                veces. El perímetro inicial de BusPay no incluye al Biotrén;
                ver{' '}
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
            EFE Trenes · 30-dic-2025, Nueva estructura tarifaria Biotrén vigente 2-ene-2026
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/servicios/toma-nota/2025/12/30/efe-sur-anuncia-alza-en-la-tarifa-del-biotren-para-2026-revisa-a-cuanto-subira-el-pasaje.shtml">
            BioBioChile · 30-dic-2025, Alza promedio $60 (Hualqui $500→$550; Coronel $780→$850)
          </SourceLink>
          <SourceLink href="https://www.efe.cl/nuestros-servicios/biotren/tarifas-del-servicio/">
            EFE Trenes · Tarifas del servicio Biotrén (calculadora)
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Perímetro inicial BusPay = Gran Concepción + Santa Juana + Tomé
          </SourceLink>
        </Sources>
        <PendingBanner>
          <strong>Por confirmar:</strong> la tarifa de Z5 y la asignación
          exacta de estaciones a zona. BioBioChile cita $850 hacia Concepción
          desde Hito, Los Canelos, Huinca, Cristo, Laguna Quiñenco y Coronel, y
          $570 desde JP II, Diagonal Bío-Bío, Alborada, Costa Mar, El Parque,
          Lomas Coloradas y CRSH. Cierre: cuadro tarifario en estación o PDF de EFE Sur.
        </PendingBanner>
      </Section>

      <CollapsibleSection title="Estaciones (25)">
        <p>
          Estaciones de OSM (<code>railway=station</code> o <code>halt</code>{' '}
          con <code>operator~EFE</code>) en{' '}
          <code className="font-mono">src/data/biotren.generated.ts</code>; los códigos
          EFE (<code>HQ</code>, <code>CC</code>, <code>TH</code>) vienen de efetrenes.cl.
        </p>
        <DataTable columns={['Línea', 'Estación', 'Código EFE', 'Visor']} bodyClassName="divide-y align-top text-[12px] [&_td]:px-3 [&_td]:py-1.5">
          <tr><td>L1</td><td>Hualqui (terminal sur)</td><td className="font-mono">HQ</td><td><MapLink stop="osm-4455930417">→</MapLink></td></tr>
          <tr><td>L1</td><td>La Leonera</td><td className="font-mono">ZW</td><td><MapLink stop="osm-4514615375">→</MapLink></td></tr>
          <tr><td>L1</td><td>Manquimávida</td><td className="font-mono">man</td><td><MapLink stop="osm-4514615376">→</MapLink></td></tr>
          <tr><td>L1</td><td>Pedro Medina</td><td className="font-mono">pme</td><td><MapLink stop="osm-4514589079">→</MapLink></td></tr>
          <tr><td>L1</td><td>Chiguayante</td><td className="font-mono">CV</td><td><MapLink stop="osm-4514590030">→</MapLink></td></tr>
          <tr><td>L1 + L2</td><td><strong>Concepción</strong> (estación central)</td><td className="font-mono">CC</td><td><MapLink stop="osm-310000768">→</MapLink></td></tr>
          <tr><td>L1</td><td>Lorenzo Arenas</td><td className="font-mono">lor</td><td><MapLink stop="osm-332795804">→</MapLink></td></tr>
          <tr><td>L1</td><td>UTF Santa María</td><td className="font-mono">utf</td><td><MapLink stop="osm-5583753385">→</MapLink></td></tr>
          <tr><td>L1</td><td>Los Cóndores</td><td className="font-mono">con</td><td><MapLink stop="osm-4514677144">→</MapLink></td></tr>
          <tr><td>L1</td><td>Higueras</td><td className="font-mono">hig</td><td><MapLink stop="osm-4514677093">→</MapLink></td></tr>
          <tr><td>L1</td><td>El Arenal</td><td className="font-mono">EZ</td><td><MapLink stop="osm-332793725">→</MapLink></td></tr>
          <tr><td>L1</td><td><strong>Mercado de Talcahuano</strong> (terminal norte)</td><td className="font-mono">TH</td><td><MapLink stop="osm-2063360442">→</MapLink></td></tr>
          <tr><td>L2</td><td><strong>Coronel</strong> (terminal sur)</td><td className="font-mono">CW</td><td><MapLink stop="osm-4124952607">→</MapLink></td></tr>
          <tr><td>L2</td><td>Laguna Quiñenco</td><td className="font-mono">lqu</td><td><MapLink stop="osm-4124951369">→</MapLink></td></tr>
          <tr><td>L2</td><td>Cristo Redentor</td><td className="font-mono">cri</td><td><MapLink stop="osm-4124950639">→</MapLink></td></tr>
          <tr><td>L2</td><td>Huinca</td><td className="font-mono">hui</td><td><MapLink stop="osm-6329456006">→</MapLink></td></tr>
          <tr><td>L2</td><td>Los Canelos</td><td className="font-mono">can</td><td><MapLink stop="osm-4124944293">→</MapLink></td></tr>
          <tr><td>L2</td><td>Hito Galvarino</td><td className="font-mono">ES</td><td><MapLink stop="osm-4124947356">→</MapLink></td></tr>
          <tr><td>L2</td><td>Cardenal Raúl Silva Henríquez</td><td className="font-mono">Sin dato</td><td><MapLink stop="osm-4124945257">→</MapLink></td></tr>
          <tr><td>L2</td><td>Lomas Coloradas</td><td className="font-mono">LM</td><td><MapLink stop="osm-4593412639">→</MapLink></td></tr>
          <tr><td>L2</td><td>El Parque</td><td className="font-mono">par</td><td><MapLink stop="osm-4593443220">→</MapLink></td></tr>
          <tr><td>L2</td><td>Costa Mar</td><td className="font-mono">cma</td><td><MapLink stop="osm-4593412640">→</MapLink></td></tr>
          <tr><td>L2</td><td>Alborada</td><td className="font-mono">SU</td><td><MapLink stop="osm-3369569831">→</MapLink></td></tr>
          <tr><td>L2</td><td>Diagonal Bío-Bío</td><td className="font-mono">dia</td><td><MapLink stop="osm-353772399">→</MapLink></td></tr>
          <tr><td>L2</td><td>Juan Pablo II</td><td className="font-mono">BB</td><td><MapLink stop="osm-315019820">→</MapLink></td></tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Concepción es la única estación común (transbordo en el mismo andén).
          Juan Pablo II conecta con los servicios a Santa Juana, ver{' '}
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
      </CollapsibleSection>

      <Section title="Material rodante y operación">
        <KeyValueList
          items={[
            ['Flota actual', 'Xtrapolis (Alstom Brasil), 3 coches articulados, y ABe históricas de apoyo. 3 kV DC por catenaria.'],
            ['Flota nueva', '10 trenes CRRC Sifang de 717 pasajeros, la mayoría para L2; sin fecha de servicio (ver novedades).'],
            ['Vía', 'Ancho ibérico 1.676 mm; doble vía en el tramo urbano.'],
            ['Subsidio', 'EFE recibe aportes por Ley de Presupuestos anual (no por la Ley 20.378). Monto pendiente.'],
          ]}
        />
        <PendingBanner>
          <strong>Pendiente:</strong> demanda diaria 2025-2026 (pre-pandemia
          ~25.000 pax/día según prensa; sin cifra pública posterior),
          capacidad de los Xtrapolis y estadísticas de accidentes en pasos a
          nivel.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.efetrenes.cl/">
            EFE Trenes · estructura corporativa
          </SourceLink>
        </Sources>
      </Section>

      <CollapsibleSection title="Issues conocidos">
        <div className="space-y-2">
          <IssueNotice title="Frecuencia a media jornada">
            Con el itinerario del 15-jul-2026, la L1 corre solo 2 o 3 trenes
            por sentido entre 10:00 y 15:00 en día hábil y el domingo 4 por
            sentido. En punta hay pasajeros en andén (Chiguayante,
            Concepción).
          </IssueNotice>
          <IssueNotice title="Pasos a nivel sin segregar">
            Lorenzo Arenas, Los Cóndores y Lomas Coloradas tienen accidentes
            recurrentes; los desniveles requieren inversión del MOP.
          </IssueNotice>
          <IssueNotice title="Sin integración con buses">
            Bus + tren paga dos veces; el perímetro inicial de BusPay no
            incluye al Biotrén (25-nov-2026). Los gremios de buses ven el
            subsidio al tren como competencia; la tensión crece con cada
            extensión (ver{' '}
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
              extensiones y proyectos
            </a>
            ).
          </IssueNotice>
        </div>
      </CollapsibleSection>

      <Section title="Cobertura del visor">
        <p className="text-[13px]">
          L1 y L2 están en el visor con estaciones y trazado de OSM:{' '}
          <MapLink route="L1">L1 Hualqui ↔ Talcahuano →</MapLink>{' '}·{' '}
          <MapLink route="L2">L2 Coronel ↔ Concepción →</MapLink>. Regenerar con{' '}
          <code className="font-mono">npm run sync:biotren</code> y{' '}
          <code className="font-mono">sync:biotren-track</code>.
        </p>
        <p className="text-[13px] text-muted-foreground">
          No están: los servicios cortos de día hábil (Arenal, Leonera, Los
          Canelos, Cristo Redentor), atrasos y cancelaciones, el cuadro
          tarifario y las{' '}
          <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
            extensiones propuestas
          </a>
          .
        </p>
      </Section>

      <CollapsibleSection title="Historia y cronología">
        <Timeline
          items={[
            {
              date: '1872',
              event: 'Se inaugura la línea Concepción-Talcahuano, parte del sistema Sur de EFE, con tráfico mixto de pasajeros y carga.',
              source: { href: 'https://es.wikipedia.org/wiki/Ferrocarril_Concepci%C3%B3n-Talcahuano', label: 'Wikipedia · línea Concepción-Talcahuano' },
            },
            {
              date: '1995',
              event: 'Se crea FESUR (Ferrocarriles Suburbanos de Concepción S.A.), filial regional de EFE para cercanías.',
              source: { href: 'https://es.wikipedia.org/wiki/Biotr%C3%A9n', label: 'Wikipedia · Biotrén' },
            },
            {
              date: '2005',
              event: 'Parte el servicio Biotrén con trenes Xtrapolis y electrificación 3 kV DC en Concepción ↔ Talcahuano y Concepción ↔ Chiguayante.',
              source: { href: 'https://es.wikipedia.org/wiki/Biotr%C3%A9n', label: 'Wikipedia · Biotrén' },
            },
            {
              date: '2009',
              event: 'Abre la Línea 2 a Coronel sobre el ramal histórico del carbón (sin llegar a Lota urbano).',
            },
            {
              date: '27-feb-2010',
              event: 'Terremoto y tsunami: daños en puentes y estaciones (crítico el puente Biobío de la L2).',
            },
            {
              date: '2017',
              event: 'FESUR pasa a ser EFE Trenes Metropolitanos S.A.',
            },
            {
              date: '2020-2021',
              event: 'Pandemia: cae la demanda y se reducen frecuencias y horario.',
            },
            {
              date: 'jul–nov 2025',
              event: 'Nuevo puente ferroviario del Biobío: pasajeros por la 1.ª vía desde julio; inauguración formal en noviembre.',
              source: { href: 'https://www.efe.cl/proyectos/puente-bio-bio/', label: 'EFE · Proyecto Puente Bío-Bío' },
            },
            {
              date: '2-ene-2026',
              event: 'Entra en vigencia la estructura Z1-Z10 ($420-$850 adulto), alza promedio $60 por viaje.',
              source: { href: 'https://www.efe.cl/efe-sur-informa-nueva-estructura-tarifaria-del-biotren-a-partir-del-2-de-enero-de-2026/', label: 'EFE Sur · 30-dic-2025' },
            },
          ]}
        />
        <PendingBanner>
          <strong>Pendiente:</strong> fechas exactas de electrificación y de
          apertura comercial de L1/L2 (las fuentes dicen 1999, 2005 y 2009 sin
          coincidir). Cierre: Ley de Transparencia a EFE.
        </PendingBanner>
      </CollapsibleSection>

      <CollapsibleSection title="Vínculos, datos pendientes y bibliografía">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">Biotrén · extensiones y proyectos</a>
            : Penco-Lirquén, Lota, Tomé, Carriel Sur.
          </li>
          <li>
            <a href="/wiki/openstreetmap-fuente-visor" className="underline underline-offset-2">OpenStreetMap como fuente del visor</a>
            : método de estaciones y trazado.
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201</a>
            {' '}(transbordo en Juan Pablo II),{' '}
            <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">Concepción ↔ Coronel ↔ Lota</a>
            {' '}(los buses llegan a Lota; el tren, hasta Coronel) y{' '}
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">recorridos interurbanos</a>
            {' '}(Talcamávida, Unihue y Quilacoya por ferrocarril).
          </li>
        </ul>
        <p className="text-[13px]">
          <strong>Datos pendientes:</strong> tarifa Z5;
          demanda diaria por línea; fechas de inauguración L1 (1999 vs 2005)
          y L2 (2009); subsidio MTT anual; capacidad de los Xtrapolis;
          accidentalidad en pasos a nivel; integración con BusPay. Cierre:
          Ley de Transparencia a EFE y SUBTRANS Biobío, cuadro tarifario en
          estación, fichas IDI de MIDESO.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.efe.cl/proyectos/puente-bio-bio/">
              EFE · Proyecto Puente Bío-Bío (1.ª vía 07/2025, inauguración nov-2025)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Ferrocarril_Concepci%C3%B3n-Talcahuano">
              Wikipedia · Ferrocarril Concepción-Talcahuano (1872)
            </SourceLink>
          </li>
          <li>
            Datasets internos: <code className="font-mono">biotren.generated.ts</code>,{' '}
            <code className="font-mono">biotren-track.generated.ts</code>,{' '}
            <code className="font-mono">static-service-patterns.ts</code>.
          </li>
        </ul>
        <p className="text-[13px]">
          ¿Tienes el cuadro tarifario Z1-Z10, la demanda 2025-2026 o la
          memoria anual de EFE? Abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/biotren.tsx">
            github.com/marcorojasb/conce.patagua.dev
          </SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
