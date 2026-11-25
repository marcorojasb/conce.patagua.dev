// Concepción ↔ Tomé, ficha OPERACIONAL del corredor norte del Gran Concepción.
//
// División con `perimetro-exclusion-tome.tsx`:
//   - Aquí: operación (trazado, horario programado, frecuencias, refuerzos,
//     contexto del corredor, intermodalidad, problemas operacionales).
//   - Allá: régimen (decreto MTT, operador, tarifa con polinomio, BusPay
//     institucional, sanciones DTPR). Todo dato regulatorio aquí enlaza a esa ficha.

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

const LINK = 'underline underline-offset-2';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function ConcepcionTome() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong>{' '}
        Trazado, paraderos y programa de salidas de 401, 401Y, 411 y 421 salen
        del GTFS oficial de la DTPR (programa del 28-feb-2025, cotejado el
        24-nov-2026). El régimen (decreto MTT, operador, tarifa, BusPay) está
        en{' '}
        <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
          Perímetro de Exclusión de Tomé
        </a>
        . <strong>Pendientes</strong>: horario vigente 2026 y de festivos,
        flota verificada, refuerzos de temporada alta y tarifa 2026
        reconfirmada.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Servicios', value: '401 · 401Y · 411 · 421' },
          { label: 'Tarifa adulto', value: '$780 Tomé · $830 Dichato' },
          { label: 'Operador', value: 'Transportes Tomé SpA' },
          { label: 'Distancia', value: '~30 km a Tomé' },
          { label: 'Pago electrónico', value: 'marcha blanca 1-dic-2026' },
          { label: 'Mapa', value: <MapLink route="401">401</MapLink> },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            El corredor une Concepción con Penco, Lirquén, Tomé y Dichato por
            la <strong>Ruta 150</strong>. Los servicios <strong>401, 401Y, 411
            y 421</strong> los opera <strong>Transportes Tomé</strong> bajo el{' '}
            <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
              Perímetro de Exclusión de Tomé
            </a>
            .
          </>,
          <>
            El visor los dibuja desde el GTFS oficial: trazado, paraderos y
            programa de salidas (a intervalo fijo, no un itinerario). Sin
            llegadas en vivo.
          </>,
          <>
            Tarifa vigente conocida: <strong>$780</strong> a Tomé y{' '}
            <strong>$830</strong> a Dichato, desde el 23-feb-2025; sin alzas
            posteriores documentadas.
          </>,
          <>
            Refuerzo de mayo de 2025: 70 salidas en la punta de la tarde
            Concepción → Tomé (+11 %).
          </>,
          <>
            El Biotrén no llega al corredor; la extensión a Penco-Lirquén
            sigue en estudio.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '23-nov-2026',
            title: 'Pago electrónico: marcha blanca el 1-dic-2026 y centro de atención en Tomé',
            detail:
              'El centro de atención de Tomé (Ignacio Serrano 1225) aún no operaba el 23-nov: solo el de San Pedro de la Paz. Efectivo y tarjeta conviven en la marcha blanca; el pago solo electrónico se proyecta para marzo de 2027. Detalle en BusPay.',
            source: {
              href: 'https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta',
              label: 'Canal 9 · 23-nov-2026',
            },
          },
          {
            date: '12-sep-2026',
            title: 'Ocho buses eléctricos para Tomé-Concepción durante 2027',
            detail:
              'El CORE del Biobío aprobó recursos adicionales para «Renueva tu Micro»; el consejero Larry Sandoval anunció los ocho buses. La nota no dice quién los compra.',
            source: {
              href: 'http://www.tomealdia.com/2026/09/tome-tendra-sus-primeros-ocho-buses.html',
              label: 'Tomé al Día · 12-sep-2026',
            },
          },
          {
            date: '4-ago-2026',
            title: 'Hacienda congela la adjudicación del corredor MOP Ruta 150',
            detail:
              'El MOP pasó el proyecto a obra pública directa. Estado actual en la ficha de corredores MOP.',
            source: {
              href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/04/gobierno-frena-corredores-de-transporte-publico-en-gran-concepcion-en-que-invertirian-us400-millones.shtml',
              label: 'BioBioChile · 4-ago-2026',
            },
          },
        ]}
      />

      <Section title="Cobertura del visor">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Interurbanos 401, 401Y, 411 y 421 (PE Tomé)
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            La DTPR los publica en el mismo{' '}
            <a href="/wiki/gtfs-gran-concepcion" className={LINK}>
              GTFS de Gran Concepción
            </a>{' '}
            que usa el visor (versión del 28-feb-2025). Aparecen rotulados
            «Interurbano Tomé», con sus dos sentidos (la 401Y, uno solo),
            paraderos y programa de salidas. La DTPR publica además un GTFS
            propio del PE Tomé (versión Tomé20230308) con los mismos cuatro
            códigos. Antes del 24-nov-2026 se dibujaban desde trazados OSM
            hechos a mano. Contexto institucional en{' '}
            <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
              PE Tomé · GTFS y cobertura del visor
            </a>
            .
          </p>
          <p className="mt-1 text-[12px]">
            Nodo en Concepción: <strong>terminal a Tomé</strong> (OSM way
            425356582, Manuel Rodríguez 2424 aprox.,{' '}
            <code className="font-mono">−36.8191, −73.0620</code>).{' '}
            <MapLink route="401">Ver la 401 en el mapa →</MapLink>
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Urbanos hasta Penco y Lirquén (PE Gran Concepción, tarifa $580)
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Una variante por sentido; entre paréntesis, la que va al norte:{' '}
            <strong>17MC</strong> (17M, Montahue-Penco),{' '}
            <strong>30MB / 30NC</strong> (30B, 30C, Penco-Lirquén),{' '}
            <strong>30QE</strong> (30E, Penco Chico), <strong>31DF</strong>{' '}
            (31F, Lirquén), <strong>50YP</strong> (50Y, Cosmito) y{' '}
            <strong>62HM</strong> (62H, Lirquén). Entraron al perímetro del
            Gran Concepción el <strong>1-ene-2024</strong>, tras caducar la
            licitación 2002 el 31-mar-2024. Operadores según el letrero de
            cada viaje en el GTFS: Expresos Chiguayante (17MC), Ruta Las
            Playas (30MB, 30NC, 30QE), Ruta del Mar (31DF), Denavi Sur (50YP)
            y Mi Expreso (62HM).
          </p>
        </div>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
            Wikipedia · Buses licitados Gran Concepción, fin licitación 2002 (31-mar-2024)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Programa del GTFS oficial">
        <p>
          Salidas del programa de la DTPR (28-feb-2025; su calendario venció
          el 31-dic-2025, pero es la última publicación). Es un programa a
          intervalo fijo: reparte las salidas cada 10 min de la primera a la
          última, así que las cifras de la tabla son las que reparte el
          programa, no las reales. La prensa habla de una cada 3 a 4 min en la
          punta de la tarde (ver «Frecuencias y refuerzo de mayo de 2025»). El
          visor muestra la frecuencia y la ventana en la ficha de cada
          recorrido y lo usa en <strong>Micros en el mapa · Horario</strong>,
          que estima dónde debería ir cada bus: no es GPS.
        </p>
        <DataTable columns={['Servicio', 'Lunes a viernes', 'Sábado', 'Domingo']} bodyClassName="divide-y align-top text-[12px]">
          <tr>
            <td className="px-3 py-2 font-medium">401 Tomé</td>
            <td className="px-3 py-2">100 salidas hacia Concepción (05:25 a 21:58) y 103 hacia Tomé (06:25 a 23:30), programa cada 10 min, ~1 h 26 min de viaje</td>
            <td className="px-3 py-2">99 y 103 salidas</td>
            <td className="px-3 py-2">99 y 101 salidas</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">401Y Bellavista</td>
            <td className="px-3 py-2">2 salidas hacia Concepción (06:45 y 07:00); sin sentido inverso</td>
            <td className="px-3 py-2">Sin servicio</td>
            <td className="px-3 py-2">Sin servicio</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">411 Dichato</td>
            <td className="px-3 py-2">85 salidas hacia Concepción (05:55 a 19:58) y 78 hacia Dichato (07:12 a 20:08), programa cada 10 min, ~1 h 45 min de viaje</td>
            <td className="px-3 py-2">73 y 69 salidas</td>
            <td className="px-3 py-2">67 y 72 salidas</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">421 Av. Estadio</td>
            <td className="px-3 py-2">4 salidas hacia Concepción (06:05 a 06:35) y 13 hacia Tomé (18:20 a 20:20): refuerzo de punta</td>
            <td className="px-3 py-2">Sin servicio</td>
            <td className="px-3 py-2">Sin servicio</td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          El GTFS no declara festivos: un feriado se muestra con el horario
          normal de ese día. Los refuerzos de mayo de 2025 son posteriores al
          programa y pueden no estar reflejados.
        </p>
        <Sources>
          <SourceLink href="https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/">
            DTPR · GTFS Gran Concepción (versión 20250228)
          </SourceLink>
          <SourceLink href="https://www.dtpr.cl/pdf/perimetros/tome/resolucionesgenerales/Res_22_2021_Subsecretaria_de_Transportes.pdf">
            DTPR · Perímetro de Exclusión de Tomé
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Servicios 401 / 411 / 421">
        <p>
          Los presta el operador único <strong>Transportes Tomé</strong>
          (fusión de Buses Costa Azul S.A. y otros; flota declarada de 71
          buses en 2024, sin cotejo con el padrón DTPR). Detalle en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
            PE Tomé · Operador único
          </a>
          .
        </p>
        <DataTable columns={['Código', 'Origen, destino', 'Observaciones']}>
          <tr>
            <td className="px-3 py-2 font-mono font-medium">401</td>
            <td className="px-3 py-2">Concepción (T. Manuel Rodríguez) ↔ Tomé Alto</td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Troncal, ~64 paradas. Sale por Av. Chacabuco y vuelve por Av.
              Los Carrera. Opera desde el inicio del perímetro (mar-2022).
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-mono font-medium">401Y</td>
            <td className="px-3 py-2">Tomé (Bellavista) → Concepción</td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Variante de punta de mañana; en el GTFS solo trae el sentido
              hacia Concepción.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-mono font-medium">411</td>
            <td className="px-3 py-2">Concepción ↔ Dichato (vía Tomé)</td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Extensión al balneario, con tarifa propia ($830 desde
              23-feb-2025).
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-mono font-medium">421</td>
            <td className="px-3 py-2">Concepción ↔ Av. Estadio (Tomé urbano)</td>
            <td className="px-3 py-2 text-muted-foreground text-[12px]">
              Desde nov-2022, solo hora punta; no llega a Tomé Alto.
            </td>
          </tr>
        </DataTable>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Códigos 401 / 411 / 421 y trazado
          </SourceLink>
          <SourceLink href="https://moovitapp.com/index/en/public_transit-line-401-Concepcion-3122-3753673-146991722-1">
            Moovit · Ruta 401 paradas y duración
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Frecuencias y refuerzo de mayo de 2025">
        <KeyValueList
          items={[
            ['Punta tarde Conce → Tomé (16:00-21:00)', '70 salidas (antes 63, +11 %). Cada 4 min entre 16:00 y 16:30 y cada 3 min desde las 17:30, según el representante legal Bernardo Montoya.'],
            ['Punta mañana Tomé → Conce', 'Inyección nueva a las 06:20 desde el sector Cementerio 2 (cubre Loma Larga y Villa El Mirador).'],
            ['Dichato → Conce', 'Cuarta salida entre 06:00 y 07:00, cada 15 min.'],
            ['Tiempo real', 'App Red Regional de Movilidad, buscar «401» o «411». El visor no tiene llegadas en vivo para estos servicios.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Montoya reconoció en prensa «diferencias de 20 a 21 minutos entre
          buses» hasta abril de 2025. El ajuste se decidió localmente, tras la
          presión de la Unión Comunal de Juntas de Vecinos de Tomé
          (presidente 2025: Gonzalo Reyes), en menos de 20 días.
        </p>
        <PendingBanner>
          <strong>Horario vigente 2026 pendiente.</strong> El único programa
          oficial publicado es el del GTFS (28-feb-2025), sin festivos. Una
          foto del cartel en la terminal Manuel Rodríguez permitiría
          contrastarlo.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
            Diario Concepción · 7-may-2025, Refuerzo en hora punta
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/08/en-11-aumentaron-las-salidas-de-buses-desde-concepcion-hacia-tome-en-horario-punta.html">
            Diario Concepción · 8-may-2025, Salidas Conce→Tomé +11%
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2025/05/07/transporte-publico-refuerza-rutas-entre-tome-y-concepcion-con-mas-salidas-y-horarios-extendidos.html">
            TVU · 7-may-2025, Refuerzo rutas Concepción-Tomé
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifa">
        <KeyValueList
          items={[
            ['Concepción ↔ Tomé', '$780 adulto desde el 23-feb-2025 (reajuste polinómico).'],
            ['Concepción ↔ Dichato', '$830 adulto desde la misma fecha.'],
            ['Vigencia a nov-2026', 'No hay fuente de alzas posteriores, pero tampoco una reconfirmación 2026: se asume sin cambio.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Polinomio y tarifas TNE y adulto mayor en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
            PE Tomé · Tarifa y polinomio de ajuste
          </a>
          .
        </p>
      </Section>

      <Section title="Intermodalidad y pago">
        <KeyValueList
          items={[
            [
              'Biotrén',
              <>
                No llega a Tomé, Lirquén ni Penco: su terminal norte es
                Mercado de Talcahuano. La extensión a Penco-Lirquén sigue en
                estudio EFE, ver{' '}
                <a href="/wiki/biotren-extensiones-proyectos" className={LINK}>
                  Biotrén · extensiones y proyectos
                </a>
                .
              </>,
            ],
            [
              'Terminal',
              <>
                <strong>Terminal Manuel Rodríguez</strong> (Angol esquina M.
                Rodríguez), base de Transportes Tomé. No es Camilo Henríquez
                ni Collao.
              </>,
            ],
            [
              'Colectivos y urbanos',
              <>
                En Penco, Lirquén, Tomé y Dichato, los{' '}
                <a href="/wiki/taxis-colectivos-gran-concepcion" className={LINK}>
                  taxis colectivos
                </a>{' '}
                cubren la última milla, sin integración tarifaria. Los urbanos
                17MC a 62HM sirven el tramo corto hasta Penco y Lirquén.
              </>,
            ],
            [
              'BusPay',
              <>
                Marcha blanca desde el 1-dic-2026 sobre la flota de
                Transportes Tomé. Ver{' '}
                <a href="/wiki/buspay" className={LINK}>BusPay</a> y{' '}
                <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
                  PE Tomé · Integración con BusPay
                </a>
                .
              </>,
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022, Debate Biotrén-Penco y corredor Ruta 150
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Perímetro BusPay = Gran Concepción + Santa Juana + Tomé
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Corredor MOP Ruta 150">
        <p>
          El corredor exclusivo de buses Rotonda Bonilla ↔ Enlace Penco (8-9
          km) recibió una oferta única el 10-dic-2025, pero Hacienda congeló
          la adjudicación el 4-ago-2026 y el MOP lo pasó a obra pública
          directa; las fechas de obra no están verificadas. Aun así, solo
          aliviaría el tramo inicial: el bypass Penco-Lirquén-Tomé (~20 km)
          seguiría sin pista exclusiva. Estado, inversión y calendario en{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className={LINK}>
            Corredores de Transporte Público MOP del Biobío
          </a>
          ; tensión con el perímetro en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
            PE Tomé · Tensión con Corredor MOP Ruta 150
          </a>
          .
        </p>
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025, Recepción ofertas Ruta 150 + Conce-Talcahuano II
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
            Diario Concepción · 7-nov-2025, Corredores MOP del Gran Concepción
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Problemas operacionales conocidos">
        <div className="space-y-2">
          <IssueNotice title="Congestión de la Ruta 150 en punta">
            El bypass Penco-Lirquén-Tomé es doble vía sin pista exclusiva y se
            satura cuando la demanda residencial se mezcla con el flujo
            comercial. Es la razón del corredor MOP.
          </IssueNotice>
          <IssueNotice title="Temporada alta">
            En enero-febrero y fines de semana largos, la 411 a Dichato y
            Pingueral colapsa. El régimen no obliga al operador a reforzar en
            verano y no hay refuerzo documentado.
          </IssueNotice>
          <IssueNotice title="Operador único">
            Si Transportes Tomé baja frecuencia, el pasajero no tiene
            alternativa dentro del régimen: queda la presión vecinal y la
            fiscalización DTPR. Ver{' '}
            <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
              PE Tomé · Fiscalización y riesgo monopólico
            </a>
            .
          </IssueNotice>
        </div>
      </Section>

      <CollapsibleSection title="Trazado calle a calle">
        <p className="text-[12px] text-muted-foreground">
          Base municipal y documentación comunitaria (PorDóndeVaLaMicro).
        </p>
        <div className="mt-2 rounded-md border bg-card p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Concepción → Tomé (ida)
          </div>
          <p className="mt-1 text-[12px] leading-snug">
            Terminal Angol / <strong>Av. Manuel Rodríguez</strong> → Lincoyán
            → <strong>Av. Chacabuco</strong> → Plaza Perú → Av. 21 de Mayo →
            Acceso Norte → <strong>Ruta 150</strong> → Cosmito →{' '}
            <strong>Plaza de Penco</strong> → <strong>Plaza de Lirquén</strong>{' '}
            → bordemar → <strong>Bellavista Tomé</strong> → Costanera →
            Vicente Palacios → Diego Portales (Plaza de Tomé) →{' '}
            <strong>Tomé Alto</strong> [fin 401]. La 411 sigue por Camino a
            Dichato hasta Av. Daniel Vera.
          </p>
        </div>
        <div className="mt-2 rounded-md border bg-card p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tomé → Concepción (vuelta)
          </div>
          <p className="mt-1 text-[12px] leading-snug">
            Tomé Alto → Av. Las Torres → Bellavista Oveja Tomé → Costanera →
            Ruta 150 → Lirquén → Penco → Cosmito → Acceso Norte →{' '}
            <strong>Av. Los Carrera</strong> → Lincoyán → Manuel Rodríguez.
          </p>
        </div>
        <Sources>
          <SourceLink href="https://pordondevalamicro.wordpress.com/recorridos-micros-licitadas/tome/concepcion-%E2%86%92-tome-%E2%86%92-dichato/">
            PorDóndeVaLaMicro · Concepción → Tomé → Dichato (trazado calle a calle)
          </SourceLink>
          <SourceLink href="https://pordondevalamicro.wordpress.com/recorridos-micros-licitadas/tome/dichato-%E2%86%92-tome-%E2%86%92-concepcion/">
            PorDóndeVaLaMicro · Dichato → Tomé → Concepción (vuelta)
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Historia industrial y desastres naturales">
        <p>
          Tomé fue el polo textil del sur de Chile desde 1865: la fábrica
          Bellavista Oveja Tomé (Guillermo Délano Ferguson, luego Carlos
          Werner desde 1897) llegó a cubrir cerca del 77 % de los paños de
          lana del país y cerró en 2007 por la competencia asiática. El
          corredor nació para llevar obreros desde Concepción y hoy es
          residencial y turístico. El terremoto y tsunami del 27-feb-2010
          destruyó cerca del 80 % de Dichato (18 fallecidos) y cortó por
          semanas los servicios al norte de Tomé.
        </p>
        <Sources>
          <SourceLink href="https://www.archivohistoricoconcepcion.cl/minisitios/economia-y-sociedad/bellavista-oveja-tome/">
            Archivo Histórico Concepción · Bellavista Oveja Tomé
          </SourceLink>
          <SourceLink href="https://www.memoriachilena.gob.cl/602/w3-article-93823.html">
            Memoria Chilena · Fábrica de Paños Bellavista de Tomé
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/2015/02/27/el-antes-y-despues-de-la-reconstruccion-de-dichato-a-cinco-anos-del-terremoto-y-tsunami.shtml">
            BioBioChile · 27-feb-2015, Reconstrucción de Dichato
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/tvu-noticias/2024/02/27/a-14-anos-del-terremoto-y-tsunami-del-2010-como-luce-dichato-una-de-las-localidades-mas-afectadas.html">
            TVU · 27-feb-2024, Dichato 14 años después
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Geografía y vialidad">
        <KeyValueList
          items={[
            ['Distancias', 'Concepción → Tomé ~30 km; → Dichato ~42 km, por la Ruta 150 (eje costero, sin grandes pendientes).'],
            ['Tiempo en bus', '~50 a 70 min a Tomé según hora y trazado (paradas en Penco y Lirquén).'],
            [
              'Eje vial',
              <>
                <strong>Ruta 150</strong> (OSM <code className="font-mono">ref=150</code>,
                «Cruce Ruta 146 (Concepción), Bypass Penco, Tomé»): doble vía,
                pavimento de hormigón, máx. 60 km/h en el bypass urbano.
              </>,
            ],
            ['Vías secundarias', 'Camino histórico Penco-Cosmito-Concepción por Av. Latorre / La Atalaya; Av. Manuel Rodríguez y Av. Los Carrera (Concepción); Costanera (Tomé).'],
            ['Paraderos clave', 'Plazas de Penco y Lirquén, Bellavista Tomé, Costanera, Tomé Alto, Dichato Av. Daniel Vera.'],
            ['Ríos', 'Andalién (entre Concepción y Penco), Tomé y Coliumo (Tomé urbano), estero Dichato.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/way/1082594953">
            OSM way 1082594953 · Ruta 150 (ref=150, official_name verificado)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022, Corredor Ruta 150 y debate Biotrén-Penco
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Demanda y población">
        <KeyValueList
          items={[
            ['Tomé (comuna)', '54.946 hab. (Censo 2017 INE); incluye Coliumo, Cocholgüe, Dichato, Pingueral, Rafael y Menque.'],
            ['Penco (comuna)', '47.367 hab. (Censo 2017), 107,6 km²; incluye Lirquén.'],
            ['Lirquén (distrito de Penco)', '11.544 hab. (Censo 2017), 24,4 % de Penco.'],
            ['Demanda al inicio del perímetro (2022)', 'Cerca de 10.000 pasajeros por día en el corredor. No hay cifra posterior a mayo de 2025.'],
            ['Estacionalidad', 'Peak de verano (Dichato, Pingueral, Coliumo, Cocholgüe) y fines de semana largos; en invierno, viaje pendular de trabajo y estudio.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8111">
            BCN · Reportes comunales Tomé 2017, 54.946 hab.
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8107">
            BCN · Reportes comunales Penco 2017, 47.367 hab.
          </SourceLink>
          <SourceLink href="https://telencuestas.com/censos-de-poblacion/chile/2017/biobio/concepcion/penco/lirquen">
            Telencuestas · INE Censo 2017 Lirquén, 11.544 hab.
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Tom%C3%A9">
            Wikipedia · Tomé (localidades de la comuna)
          </SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Línea de tiempo">
        <Timeline
          items={[
            {
              date: '1865-2007',
              event: 'Bellavista Oveja Tomé (fundada 1865, ciudad obrera desde 1897) llega al ~77 % de los paños de lana de Chile y cierra en 2007; el corredor pasa de obrero a residencial.',
              source: { href: 'https://www.diarioconcepcion.cl/economia-y-negocios/2018/08/04/bellavista-oveja-tome-descarta-cierre-apostando-a-exportar-y-crear-proyectos.html', label: 'Diario Concepción' },
            },
            {
              date: '27-feb-2010',
              event: 'Terremoto y tsunami destruyen cerca del 80 % de Dichato.',
              source: { href: 'https://www.biobiochile.cl/noticias/2015/02/27/el-antes-y-despues-de-la-reconstruccion-de-dichato-a-cinco-anos-del-terremoto-y-tsunami.shtml', label: 'BioBioChile' },
            },
            {
              date: '10-mar-2022',
              event: 'Entra en operación el Perímetro de Exclusión de Tomé (401 y 411 desde la terminal Manuel Rodríguez).',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml', label: 'BioBioChile' },
            },
            {
              date: 'Nov-2022',
              event: 'Se agrega la 421 (Av. Estadio) en hora punta.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html', label: 'Diario Concepción' },
            },
            {
              date: '7-may-2025',
              event: 'Refuerzo de punta: 70 salidas tarde Conce → Tomé (+11 %), inyección de las 06:20 y cuarta salida de Dichato.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html', label: 'Diario Concepción' },
            },
            {
              date: '10-dic-2025',
              event: 'El MOP recibe la oferta única de Electro-Cointer II para Ruta 150 + Conce-Talcahuano II.',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones' },
            },
            {
              date: '24-nov-2026',
              event: 'El visor toma 401, 401Y, 411 y 421 del GTFS oficial y deja los trazados OSM hechos a mano.',
              source: { href: 'https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/', label: 'dtpr.gob.cl · GTFS' },
            },
            {
              date: '1-dic-2026 (programado)',
              event: 'Marcha blanca del pago electrónico BusPay en la flota de Transportes Tomé.',
              source: { href: 'https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta', label: 'Canal 9' },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Cronología institucional (decreto 2016, fusión de operadores,
          reajuste de feb-2025, adjudicación BusPay del 28-ene-2026) en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
            PE Tomé · Cronología institucional
          </a>
          .
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Comparación con los otros corredores">
        <DataTable columns={['Dimensión', 'Conce ↔ Tomé', '201 Santa Juana', 'Conce ↔ Florida']}>
          <tr>
            <td className="px-3 py-2 font-medium">Instrumento</td>
            <td className="px-3 py-2">Perímetro de exclusión propio (dec. jul-2016, op. 2022)</td>
            <td className="px-3 py-2">Licitación pública DTPR ELC0007 (2024)</td>
            <td className="px-3 py-2">Privados + capas subsidiadas puntuales</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Operadores</td>
            <td className="px-3 py-2">Uno · Transportes Tomé</td>
            <td className="px-3 py-2">Uno · Soc. Transp. Pasajeros Santa Juana SpA</td>
            <td className="px-3 py-2">Cuatro privados + capas subsidiadas</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Tarifa adulto</td>
            <td className="px-3 py-2">$780 (Tomé) / $830 (Dichato)</td>
            <td className="px-3 py-2">$1.000 fijo</td>
            <td className="px-3 py-2">$1.700-$2.500 privado / $400-$1.500 subsidiado</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Eje y distancia</td>
            <td className="px-3 py-2">Ruta 150, ~30 km a Tomé · ~42 km a Dichato</td>
            <td className="px-3 py-2">Ruta 156, ~52 km</td>
            <td className="px-3 py-2">Ruta 148 + Ruta del Itata, ~42-50 km</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">GTFS publicado</td>
            <td className="px-3 py-2">Sí (oficial DTPR de Gran Concepción y propio del PE Tomé)</td>
            <td className="px-3 py-2">Sí (201 y 201-AU en el GTFS oficial)</td>
            <td className="px-3 py-2">No</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Conexión Biotrén</td>
            <td className="px-3 py-2">No directa</td>
            <td className="px-3 py-2">Sí, en Juan Pablo II</td>
            <td className="px-3 py-2">No directa</td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Tomé fue el primer ensayo regional de «perímetro de exclusión +
          operador único» y, con{' '}
          <a href="/wiki/ruta-201-santa-juana" className={LINK}>Santa Juana</a>,
          forma la primera ola de modernización;{' '}
          <a href="/wiki/concepcion-florida" className={LINK}>Florida</a>{' '}
          sigue pendiente. Panorama en el{' '}
          <a href="/wiki/recorridos-interurbanos" className={LINK}>
            índice de recorridos interurbanos
          </a>{' '}
          y{' '}
          <a href="/wiki/sobre-este-wiki" className={LINK}>sobre este wiki</a>.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Datos operacionales pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Horario oficial 2026 lun-vie / sáb / dom / festivos de 401, 411 y 421. Los festivos 2026 no se pudieron verificar.</li>
          <li>Tarifa 2026 reconfirmada (la última fuente es de feb-2025).</li>
          <li>
            Flota verificada (marca, año, norma Euro): los 71 buses declarados
            requieren cotejo con el padrón DTPR. La ficha DTPR Biobío 2026
            (jun-2026) dice 65 (
            <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf">
              DTPR · Ficha Biobío 2026
            </SourceLink>
            ); un buscador citó 64 en una versión anterior, no leída.
          </li>
          <li>Licitación DTPR 2024-2025 de Tomé (oferta única, adjudicación): no apareció en fuentes primarias; el contrato vigente es el del Decreto Exento 1235/2022.</li>
          <li>Conductores, refuerzo de temporada alta observado, reclamos OIRS y conteo de pasajeros posterior a may-2025.</li>
          <li>Quién compra los 8 buses eléctricos anunciados para 2027.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: foto del cartel en la terminal Manuel Rodríguez o en
          Tomé Alto, conteo en paradero, observación en verano. Los pendientes
          institucionales viven en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className={LINK}>
            PE Tomé · Datos institucionales pendientes
          </a>
          .
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Bibliografía y cómo contribuir">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li><SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">Wikipedia · Perímetro de Exclusión del Gran Concepción</SourceLink></li>
          <li><SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">Wikipedia · Transporte público en el Gran Concepción</SourceLink></li>
          <li><SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml">BioBioChile · 11-mar-2022, Inicio del perímetro</SourceLink></li>
          <li><SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">Diario Concepción · 7-may-2025, Nuevos servicios y +11 % en hora punta</SourceLink></li>
          <li><SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/08/en-11-aumentaron-las-salidas-de-buses-desde-concepcion-hacia-tome-en-horario-punta.html">Diario Concepción · 8-may-2025, Detalle del 11 %</SourceLink></li>
          <li><SourceLink href="https://www.tvu.cl/prensa/2025/05/07/transporte-publico-refuerza-rutas-entre-tome-y-concepcion-con-mas-salidas-y-horarios-extendidos.html">TVU · 7-may-2025, Refuerzo y horarios extendidos</SourceLink></li>
          <li><SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">Diario Concepción · 1-nov-2022, Corredor Ruta 150 vs Biotrén Penco</SourceLink></li>
          <li><SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">MOP Concesiones · 10-dic-2025, Ofertas Ruta 150</SourceLink></li>
          <li><SourceLink href="https://www.archivohistoricoconcepcion.cl/minisitios/economia-y-sociedad/bellavista-oveja-tome/">Archivo Histórico Concepción · Bellavista Oveja Tomé</SourceLink></li>
          <li><SourceLink href="https://www.memoriachilena.gob.cl/602/w3-article-93823.html">Memoria Chilena · Fábrica de Paños Bellavista de Tomé</SourceLink></li>
          <li><SourceLink href="https://www.biobiochile.cl/noticias/2015/02/27/el-antes-y-despues-de-la-reconstruccion-de-dichato-a-cinco-anos-del-terremoto-y-tsunami.shtml">BioBioChile · 27-feb-2015, Reconstrucción de Dichato</SourceLink></li>
          <li><SourceLink href="https://www.openstreetmap.org/way/1082594953">OSM way 1082594953 · Ruta 150 (ref=150)</SourceLink></li>
          <li><SourceLink href="https://es.wikipedia.org/wiki/Tom%C3%A9">Wikipedia · Tomé (Chile)</SourceLink></li>
          <li><SourceLink href="https://pordondevalamicro.wordpress.com/recorridos-micros-licitadas/tome/concepcion-%E2%86%92-tome-%E2%86%92-dichato/">PorDóndeVaLaMicro · Trazado Conce → Tomé → Dichato</SourceLink></li>
        </ul>
        <p className="mt-2 text-[12px]">
          ¿Tienes una foto del cartel de horarios o un conteo de pasajeros?
          Abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-tome.tsx">
            concepcion-tome.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </CollapsibleSection>
    </div>
  );
}
