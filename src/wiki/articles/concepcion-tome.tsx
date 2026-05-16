// Concepción ↔ Tomé — corredor norte del Gran Concepción.
//
// Particularidad clave del corredor: el tramo Concepción ↔ Penco ↔ Lirquén
// está cubierto por el GTFS urbano (líneas 17M, 30B/C/E, 31F, 57Y, 62H que
// el visor sí muestra). El tramo verdaderamente interurbano —Lirquén → Tomé
// → Dichato— lo opera una empresa única, Transportes Tomé SpA, bajo el
// segundo perímetro de exclusión metropolitano (decreto MTT julio 2016,
// operativo marzo 2022). Esos servicios 401/411/421 NO están en el feed
// GTFS Gran Concepción.

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

export default function ConcepcionTome() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong>{' '}
        Existencia y configuración del perímetro de exclusión (decreto MTT
        julio 2016, operativo 10-mar-2022), operador único{' '}
        <em>Transportes Tomé</em>, códigos 401/411/421, tarifa de partida
        $750, flota declarada de 71 buses, terminales, ampliaciones 2025 e
        inversión MOP en Ruta 150: todo con fuente. <strong>Pendientes</strong>:
        razón social y RUT exactos de Transportes Tomé SpA, decreto exacto
        de adjudicación, tabla horaria completa. Tarifa adulto vigente 2026:
        $780 a Concepción / $830 a Dichato (alza 23-feb-2025).
      </VerifiedBanner>

      <Section title="Resumen ejecutivo">
        <p>
          El corredor Concepción ↔ Tomé es la <strong>espina dorsal
          norte</strong> del Gran Concepción metropolitano. Conecta la
          ciudad de Concepción con las comunas costeras de{' '}
          <strong>Penco</strong> (47.367 hab. Censo 2017),{' '}
          <strong>Lirquén</strong> (distrito censal de Penco con 11.544 hab.)
          y <strong>Tomé</strong> (54.946 hab.) por la <strong>Ruta 150</strong>{' '}
          ("Cruce Ruta 146 — Bypass Penco — Tomé").
        </p>
        <p>
          Tiene una <strong>particularidad regulatoria</strong> que lo
          distingue de los demás interurbanos del wiki:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Tramo urbano</strong> Concepción ↔ Penco ↔ Lirquén:
            cubierto por el <em>Perímetro de Exclusión del Gran Concepción</em>{' '}
            (vigente 1-ene-2024). Las líneas 17M, 30B/C/E, 31F, 57Y, 62H del
            GTFS urbano llegan hasta este tramo y aparecen en el visor.
          </li>
          <li>
            <strong>Tramo interurbano</strong> Concepción ↔ Tomé ↔ Dichato:
            cubierto por el <em>Perímetro de Exclusión de Tomé</em>{' '}
            (segundo perímetro creado en la zona, por decreto del ministro
            Andrés Gómez-Lobo en julio 2016, operativo desde el 10 de marzo
            de 2022). Servicios <strong>401, 411 y 421</strong>, operador
            único <strong>Transportes Tomé</strong>. NO están en el{' '}
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              feed GTFS Gran Concepción
            </a>
            {' '}y por eso no aparecen en el visor.
          </li>
        </ul>
        <p>
          A esto se suma una capa de inversión MOP histórica: el{' '}
          <strong>corredor de transporte público Ruta 150</strong>{' '}
          (
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            electrocorredor
          </a>
          ) cuya licitación recibió oferta única en
          diciembre 2025 — adjudicación esperada en 1S 2026, obras desde
          2029-2030, puesta en servicio proyectada 2032.
        </p>
      </Section>

      <Section title="Cobertura del visor (qué sí, qué no)">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            ✅ Sí están en el visor (feed GTFS Gran Concepción)
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Servicios urbanos que cruzan Concepción → Penco/Lirquén y
            terminan ahí. Identificables por código en el visor:
          </p>
          <ul className="mt-1 ml-5 list-disc space-y-0.5 text-[12px]">
            <li><strong>17M</strong> · Penco centro (operador Expresos Chiguayante)</li>
            <li><strong>30B / 30C</strong> · Penco - Lirquén</li>
            <li><strong>30E</strong> · Penco Chico</li>
            <li><strong>31F</strong> · Lirquén (línea "Ruta del Mar")</li>
            <li><strong>57Y</strong> · Cosmito camino a Penco (operador Denavi Sur, San Vicente ↔ Cosmito)</li>
            <li><strong>62H</strong> · Lirquén (operador Mi Expreso, San Vicente ↔ Lirquén)</li>
          </ul>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Estos servicios pasaron al Perímetro de Exclusión del Gran
            Concepción el <strong>1-ene-2024</strong>, reemplazando la
            licitación 2002 caducada el 31-mar-2024.
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            ❌ NO están en el visor (servicios interurbanos Tomé)
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Los servicios 401/411/421 que llegan a Tomé y Dichato operan
            bajo el <em>Perímetro de Exclusión de Tomé</em> (no Gran
            Concepción) y no comparten el feed GTFS. Una consulta directa
            al dataset GTFS confirma que no hay ninguna ruta con esos
            códigos en el feed urbano.
          </p>
          <p className="mt-1 text-[12px]">
            Lo más cercano que el visor tiene del corredor es la{' '}
            <strong>terminal en Concepción</strong>: nodo OSM way 425356582
            "Terminal de líneas a Tomé" (Manuel Rodríguez 2424 aprox.,{' '}
            <code className="font-mono">−36.8191, −73.0620</code>).
          </p>
          <p className="mt-2 text-[12px]">
            <MapLink route="401">
              Ver la 401 Tomé Alto en el mapa →
            </MapLink>
          </p>
        </div>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
            Wikipedia · Buses licitados Gran Concepción — fin licitación 2002 (31-mar-2024)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Geografía y vialidad">
        <KeyValueList
          items={[
            ['Distancia Concepción → Tomé', 'Aprox. 30 km por Ruta 150 (eje costero, sin grandes pendientes)'],
            ['Distancia Concepción → Dichato', 'Aprox. 42 km — Dichato es localidad costera al norte de Tomé urbano'],
            ['Tiempo en bus Concepción → Tomé', '~50 a 70 min según hora del día y trazado (parada Penco / Lirquén)'],
            [
              'Eje vial primario',
              <>
                <strong>Ruta 150</strong> (OSM <code className="font-mono">ref=150</code>,
                official_name "Cruce Ruta 146 (Concepción) — Bypass Penco —
                Tomé"). Doble vía concesionada en parte del tramo, pavimento
                de hormigón, máx. 60 km/h en bypass urbano.
              </>,
            ],
            [
              'Vías secundarias',
              'Camino histórico Penco - Cosmito - Concepción por Av. Latorre / La Atalaya; eje urbano Av. Manuel Rodríguez y Av. Los Carrera (Concepción) — Costanera (Tomé)',
            ],
            [
              'Estaciones / paraderos clave',
              'Plaza de Penco, Plaza de Lirquén, Bellavista Tomé, Costanera de Tomé, Tomé Alto, Dichato Av. Daniel Vera. El Biotrén no llega al corredor (terminal norte L1 es Mercado de Talcahuano); la extensión a Penco/Lirquén lleva años en estudio EFE — ver artículo Biotrén y sus extensiones.',
            ],
            ['Hidrografía cruzada', 'Río Andalién (entre Concepción y Penco), río Tomé y río Coliumo (en Tomé urbano), estero Dichato (en Dichato)'],
            ['Cordillera y geomorfología', 'Corredor costero plano-ondulado, sin cuesta dura como el corredor de El Pimentón; el tramo Lirquén-Tomé bordea acantilados de baja altura'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/way/1082594953">
            OSM way 1082594953 · Ruta 150 (ref=150, official_name verificado)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022 — Corredor Ruta 150 y debate Biotrén-Penco
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Historia industrial y desastres naturales">
        <p>
          Tomé fue el <strong>polo textil más importante del sur de Chile</strong>{' '}
          desde 1865 hasta inicios del siglo XXI. La fábrica{' '}
          <strong>Bellavista Oveja Tomé</strong>, fundada en 1865 por
          Guillermo Délano Ferguson y desarrollada bajo Carlos Werner desde
          1897, en su época de oro <strong>cubrió cerca del 77% de la demanda
          nacional de paños de lana</strong>. Confeccionó los uniformes del
          ejército durante toda la Guerra del Pacífico. Cerró el{' '}
          <strong>2007</strong> tras la competencia china e india; reabierta
          por Juan Carlos Sabat en 2010 a escala reducida. Compañías
          satélite (Fiap, Caupolicán) siguen una trayectoria similar de
          declive desde los años 80.
        </p>
        <p>
          La <strong>red de transporte público</strong> Concepción ↔ Tomé
          se calibró durante 100 años para el desplazamiento obrero diario
          desde Concepción a la fábrica. La caída del textil dejó al
          corredor con vocación residencial-pendular: gente que vive en
          Tomé/Dichato y trabaja en Concepción metropolitano.
        </p>
        <p>
          El <strong>terremoto y tsunami del 27 de febrero de 2010</strong>{' '}
          destruyó cerca del <strong>80% de Dichato</strong> y dejó 18
          fallecidos en esa localidad. La reconstrucción mejoró estándares
          de habitabilidad y recuperó la vocación turística (Pingueral,
          Dichato beach front nuevo). En lo inmediato post-27F, la
          frecuencia de buses a Tomé/Dichato cayó fuerte y en algunos
          tramos hubo días sin servicio directo.
        </p>
        <Sources>
          <SourceLink href="https://www.archivohistoricoconcepcion.cl/minisitios/economia-y-sociedad/bellavista-oveja-tome/">
            Archivo Histórico Concepción · Bellavista Oveja Tomé
          </SourceLink>
          <SourceLink href="https://www.memoriachilena.gob.cl/602/w3-article-93823.html">
            Memoria Chilena · Fábrica de Paños Bellavista de Tomé
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/2015/02/27/el-antes-y-despues-de-la-reconstruccion-de-dichato-a-cinco-anos-del-terremoto-y-tsunami.shtml">
            BioBioChile · 27-feb-2015 — Reconstrucción de Dichato
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/tvu-noticias/2024/02/27/a-14-anos-del-terremoto-y-tsunami-del-2010-como-luce-dichato-una-de-las-localidades-mas-afectadas.html">
            TVU · 27-feb-2024 — Dichato 14 años después
          </SourceLink>
        </Sources>
      </Section>

      <Section title="El Perímetro de Exclusión de Tomé (decreto 2016, operativo 2022)">
        <p>
          Es el <strong>segundo perímetro de exclusión</strong> creado en
          la zona metropolitana de Concepción (el primero fue el Gran
          Concepción 2002, recién reemplazado por uno nuevo el 1-ene-2024).
          Cronología documentada:
        </p>
        <KeyValueList
          items={[
            ['Decreto creación', 'Julio 2016 · firmado por el ministro de Transportes Andrés Gómez-Lobo'],
            ['Operación efectiva', '10 de marzo de 2022'],
            ['Tarifa de partida (2022)', '$750 adulto · una reducción de $150 respecto a la previa ($900)'],
            ['Tarifa Dichato (2022)', 'Cayó $200 respecto a la previa'],
            ['Ámbito', 'Servicios colectivos Concepción ↔ Tomé y Concepción ↔ Dichato (vía Tomé)'],
            ['Operador único', 'Transportes Tomé (formada por la fusión de operadores previos del corredor)'],
            ['Demanda referencial', 'Cerca de 10.000 pasajeros/día declarados al inicio del perímetro'],
            ['Frecuencias laborales (declaradas 2022)', 'Mejoradas respecto al régimen previo; horarios visibles en app Red Regional'],
            ['Pago electrónico', 'Comprometido desde 2022, perímetro BusPay 2026 incluye Tomé'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Los servicios <strong>401</strong> (Tomé Alto), <strong>411</strong>{' '}
          (Dichato) y <strong>421</strong> (Av. Estadio · agregado en
          noviembre 2022, sólo hora punta) componen la familia. Todos
          parten desde el terminal en Angol / Av. Manuel Rodríguez en
          Concepción.
        </p>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión Gran Concepción (sección Tomé)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml">
            BioBioChile · 11-mar-2022 — Inicio perímetro Tomé, tarifa $750
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Transporte público Gran Concepción
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Operador único: Transportes Tomé">
        <OperatorTable
          rows={[
            {
              name: 'Transportes Tomé',
              routes: '401 · Tomé Alto · 411 · Dichato · 421 · Av. Estadio (hora punta)',
              terminal: 'Terminal Angol / Av. Manuel Rodríguez (Concepción)',
              notes: (
                <>
                  <p>
                    Empresa formada en 2022 por la <strong>fusión de los
                    operadores históricos del corredor</strong> (Buses
                    Costa Azul S.A. y otras pequeñas razones sociales que
                    operaban bajo la licitación 2002 caducada) para
                    consolidar la operación dentro del perímetro de
                    exclusión. Representante legal y portavoz público:{' '}
                    <strong>Bernardo Montoya</strong>.
                  </p>
                  <p className="mt-1">
                    <strong>Flota declarada:</strong> 71 buses al cierre
                    de 2024 (Wikipedia cita esta cifra; sin confirmación
                    independiente del padrón DTPR).
                  </p>
                  <p className="mt-1">
                    <strong>Cita Montoya (mayo 2025):</strong> "ajustamos
                    los tiempos porque antes había diferencias de 20 a 21
                    minutos entre buses". Las mejoras de mayo 2025 se
                    decidieron localmente, "evitando decisiones desde
                    Santiago" — el operador trabajó con apoyo técnico
                    regional y monitoreo en terreno.
                  </p>
                </>
              ),
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html',
                label: 'Diario Concepción · 7-may-2025',
              },
            },
          ]}
        />
        <PendingBanner>
          <strong>Pendiente:</strong> razón social formal con tipo
          societario (SpA / S.A. / Ltda.), RUT, N° RNTPP, decreto de
          adjudicación del perímetro y plazo del contrato. Vía de cierre:
          Ley de Transparencia a DTPR Biobío o consulta SII por nombre
          comercial.
        </PendingBanner>
      </Section>

      <Section title="Servicios 401 / 411 / 421">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Código</th>
                <th className="px-3 py-2 font-medium">Origen — destino</th>
                <th className="px-3 py-2 font-medium">Estado / observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-mono font-medium">401</td>
                <td className="px-3 py-2">Concepción (T. Manuel Rodríguez) ↔ Tomé Alto</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Servicio troncal. ~64 paradas, ~82 min de viaje según
                  agregadores. Salida desde Concepción por Av. Chacabuco
                  (ida) y retorno por Av. Los Carrera.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono font-medium">411</td>
                <td className="px-3 py-2">Concepción ↔ Dichato (vía Tomé)</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Extensión norte hasta el balneario de Dichato. En mayo
                  2025 se sumó una <strong>cuarta salida de Dichato</strong>{' '}
                  entre 06:00 y 07:00, con frecuencia cada 15 min.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono font-medium">421</td>
                <td className="px-3 py-2">Concepción ↔ Av. Estadio (Tomé urbano)</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Agregado en <strong>noviembre 2022</strong>. Sólo hora
                  punta. Termina en Av. Estadio (no llega a Tomé Alto).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Códigos 401 / 411 / 421 y trazado
          </SourceLink>
          <SourceLink href="https://moovitapp.com/index/en/public_transit-line-401-Concepcion-3122-3753673-146991722-1">
            Moovit · Ruta 401 paradas y duración
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Trazado">
        <p>
          Trazado base derivado de la municipalidad y de la documentación
          comunitaria (PorDóndeVaLaMicro). Punto a punto:
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Concepción → Tomé (ida)
          </div>
          <p className="mt-1 text-[12px] leading-snug">
            Terminal Angol / <strong>Av. Manuel Rodríguez</strong> →
            Lincoyán → <strong>Av. Chacabuco</strong> → Plaza Perú → Av.
            21 de Mayo → Acceso Norte → <strong>Ruta 150</strong> → Cosmito →
            <strong>Plaza de Penco</strong> → <strong>Plaza de Lirquén</strong>{' '}
            → bordemar costero → <strong>Bellavista Tomé</strong> →
            Costanera de Tomé → Vicente Palacios → Diego Portales (Plaza
            de Tomé) → <strong>Tomé Alto</strong> [fin 401]. La 411
            continúa: Camino a Dichato → Av. Daniel Vera (Dichato).
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tomé → Concepción (vuelta)
          </div>
          <p className="mt-1 text-[12px] leading-snug">
            Tomé Alto → Av. Las Torres → Bellavista Oveja Tomé → Costanera
            → Ruta 150 → Lirquén → Penco → Cosmito → Acceso Norte → <strong>Av.
            Los Carrera</strong> → Lincoyán → Manuel Rodríguez (terminal).
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
      </Section>

      <Section title="Frecuencias y horarios (2025)">
        <KeyValueList
          items={[
            [
              'Hora punta tarde Conce → Tomé (16:00-21:00)',
              '70 salidas (subió 11% en mayo 2025, antes 63). Frecuencia cada 3-5 min',
            ],
            [
              'Hora punta tarde detallada',
              '16:00-16:30: cada 4 min · desde 17:30: cada 3 min (declarado por Montoya)',
            ],
            [
              'Hora punta mañana Tomé → Conce',
              'Servicio de inyección agregado mayo 2025: salida 06:20 desde sector Cementerio 2 (cubre Loma Larga y Villa El Mirador)',
            ],
            [
              'Dichato → Conce',
              'Mayo 2025 sumó cuarta salida entre 06:00-07:00, cada 15 min',
            ],
            ['Tarifa adulto base', '$750 al inicio del perímetro (mar-2022) → $780 vigente desde 23-feb-2025 (reajuste polinómico ratificado por el SEREMI Patricio Fierro)'],
            ['Tarifa Dichato', '$830 vigente desde 23-feb-2025 (diferencial Tomé-Dichato por kilometraje adicional)'],
            ['Información en tiempo real', 'App Red Regional de Movilidad — buscar "401" / "411"'],
            ['GTFS público', 'NO publicado. El servicio no aparece en el feed GTFS Gran Concepción.'],
            ['Pago electrónico', 'Comprometido — Tomé está dentro del perímetro BusPay 2026'],
          ]}
        />
        <PendingBanner>
          <strong>Tabla horaria completa pendiente.</strong> Los horarios
          publicados son anuncios puntuales (mayo 2025, etc.). Falta la
          ventana operativa formal lun-vie / sáb / dom / festivos para
          cada uno de los tres servicios. Una foto del cartel en la
          terminal Manuel Rodríguez cierra este hueco.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/08/en-11-aumentaron-las-salidas-de-buses-desde-concepcion-hacia-tome-en-horario-punta.html">
            Diario Concepción · 8-may-2025 — Salidas Conce→Tomé +11%
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2025/05/07/transporte-publico-refuerza-rutas-entre-tome-y-concepcion-con-mas-salidas-y-horarios-extendidos.html">
            TVU · 7-may-2025 — Refuerzo rutas Concepción-Tomé
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml">
            BioBioChile · 11-mar-2022 — Tarifa inicial $750
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/02/17/gran-concepcion-pasaje-de-transporte-publico-registrara-alza-de-20-desde-el-proximo-domingo.shtml">
            BioBioChile · 17-feb-2025 — Alza 23-feb-2025: Tomé-Concepción $780, Tomé-Dichato $830
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Integración intermodal">
        <KeyValueList
          items={[
            [
              'Biotrén (sin servicio al corredor)',
              <>
                El <strong>Biotrén no llega a Tomé, Lirquén ni Penco</strong>:
                el terminal norte de la Línea 1 es{' '}
                <strong>Mercado de Talcahuano</strong>. Para un viaje
                Tomé → Concepción no hay transbordo intermodal posible
                con el tren — los servicios 401/411/421 hacen el trayecto
                completo en bus. La <strong>extensión Biotrén a Penco /
                Lirquén</strong> lleva años en estudio EFE y queda
                tensionada con el electrocorredor MOP Ruta 150 que se
                licita en paralelo. Ver artículo{' '}
                <em>Biotrén y sus extensiones</em>.
              </>,
            ],
            [
              'Terminales de buses interurbanos en Concepción',
              <>
                Terminal Manuel Rodríguez (Angol esquina M. Rodríguez) — base de Transportes Tomé. <strong>NO</strong> es Terminal Camilo Henríquez ni Collao.
              </>,
            ],
            [
              'GTFS urbano',
              'Las micros urbanas 17M/30B/30C/30E/31F/57Y/62H sí aparecen en el visor y conectan los mismos puntos hasta Penco/Lirquén — útil para el tramo corto.',
            ],
            [
              'BusPay 2026',
              <>
                Tomé está dentro del perímetro de exclusión inicial de{' '}
                <a href="/wiki/buspay" className="underline underline-offset-2">
                  BusPay
                </a>{' '}
                (junto con Gran Concepción y Santa Juana). Cronograma
                alineado con la 201.
              </>,
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022 — Debate Biotrén-Penco y corredor Ruta 150
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Perímetro BusPay = Gran Concepción + Santa Juana + Tomé
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Inversión MOP: el electrocorredor Ruta 150">
        <p>
          La Dirección General de Concesiones MOP impulsa un{' '}
          <strong>corredor exclusivo de transporte público sobre la Ruta
          150</strong>, parte del paquete de "electrocorredores" del Gran
          Concepción (los primeros fuera de Santiago). Datos verificados:
        </p>
        <KeyValueList
          items={[
            ['Tramo', 'Rotonda Bonilla (Concepción) ↔ Enlace Penco — aprox. 8-9 km'],
            ['Tipo de obra', 'Pista bidireccional exclusiva para transporte público + ciclovía + veredas a ambos lados + estaciones de alta capacidad'],
            ['Inversión global (Ruta 150 + Autopista Conce-Talcahuano tramo II)', 'UF 4.431.000 ≈ USD 172 millones'],
            ['Inversión paquete electrocorredores total', 'USD 250 millones (los tres: Ruta 150, Ruta 160, Conce-Talcahuano II)'],
            ['Recepción de ofertas técnicas y económicas', '10 de diciembre de 2025 · oferta única del consorcio Electro Cointer II'],
            ['Apertura oferta económica', '15 de enero de 2026'],
            ['Adjudicación esperada', 'Primer semestre 2026'],
            ['Inicio de obras (proyectado)', '2S 2029 — 1S 2030'],
            ['Puesta en servicio (proyectada)', '2032'],
            ['Plazo de concesión', '300 meses (25 años)'],
            ['Buses', 'Eléctricos y diésel — SEREMI Patricio Fierro aclaró que el "electrocorredor" no implica flota 100% eléctrica'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Importante: este corredor MOP llega hasta el <strong>Enlace Penco</strong> y
          no continúa hasta Lirquén ni Tomé. La conectividad de Tomé con
          Concepción seguirá dependiendo del bypass urbano de Ruta 150 sin
          pista exclusiva. La municipalidad de Tomé ha pedido extender la
          inversión.
        </p>
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025 — Recepción ofertas Ruta 150 + Conce-Talcahuano II
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
            Diario Concepción · 7-nov-2025 — Electrocorredores Gran Concepción
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
            Diario Concepción · 13-nov-2024 — Visa CGR a licitaciones Rutas 160 / 150 / Conce-Talcahuano
          </SourceLink>
          <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
            Tomé al día · 2025-11 — Tomé pide extender beneficio del proyecto Ruta 150
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Demanda y población">
        <KeyValueList
          items={[
            ['Tomé (comuna)', '54.946 hab. (Censo 2017 INE) — Gran Concepción metropolitano · Coliumo, Cocholgüe, Dichato, Pingueral, Rafael, Menque'],
            ['Penco (comuna)', '47.367 hab. (Censo 2017 INE) — 107,6 km² · incluye Lirquén como distrito censal'],
            ['Lirquén (distrito de Penco)', '11.544 hab. (Censo 2017) — 24,4% de la población comunal de Penco'],
            ['Demanda diaria declarada al inicio del perímetro (2022)', 'Cerca de 10.000 pasajeros/día en el corredor Conce-Tomé'],
            ['Estacionalidad', 'Peak fuerte en verano (Dichato, Pingueral, Coliumo, Cocholgüe — turismo de playa) y fines de semana largos. En invierno: corredor netamente pendular trabajo-estudio.'],
            ['Punto de inflexión histórico', 'Cierre Bellavista Oveja Tomé 2007 → corredor pasa de "obrero textil" a "residencial dormitorio + turismo estacional"'],
            ['Vector de presión política', 'Unión Comunal de Juntas de Vecinos de Tomé (presidente 2025: Gonzalo Reyes) — gatilla peticiones de frecuencia atendidas en <20 días según mayo 2025'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8111">
            BCN · Reportes comunales Tomé 2017 — 54.946 hab.
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8107">
            BCN · Reportes comunales Penco 2017 — 47.367 hab.
          </SourceLink>
          <SourceLink href="https://telencuestas.com/censos-de-poblacion/chile/2017/biobio/concepcion/penco/lirquen">
            Telencuestas · INE Censo 2017 Lirquén — 11.544 hab.
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Tom%C3%A9">
            Wikipedia · Tomé (localidades de la comuna)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Issues conocidos">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Congestión Ruta 150 en hora punta
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El bypass Penco-Lirquén-Tomé tiene capacidad limitada y, al
              ser doble vía sin pista exclusiva, se satura cuando los
              buses del 401/411 acumulan demanda residencial con el flujo
              comercial. Es la razón política del electrocorredor MOP que
              se licita ahora.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Frecuencias desfasadas pre-mayo 2025
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Hasta abril 2025, según declaró el propio Bernardo Montoya,
              había "diferencias de 20 a 21 minutos entre buses" en
              algunos cortes de la hora punta. El ajuste de mayo 2025 fue
              reactivo a presión vecinal (resuelto en menos de 20 días
              desde la solicitud de la Unión Comunal de Juntas de
              Vecinos).
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Estacionalidad turística vs. capacidad regular
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              En enero-febrero y fines de semana largos, los servicios
              411 a Dichato/Pingueral colapsan. No hay refuerzo
              documentado formal en el contrato del perímetro para
              temporada alta.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Biotrén no llega a Tomé
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              La terminal del Biotrén urbano está en Lirquén. El alcalde
              de Penco Víctor Hugo Figueroa (2022) advirtió que el
              corredor Ruta 150 puede <em>frenar</em> la extensión a
              Penco/Tomé porque baja la demanda potencial del tren. EFE
              Sur tiene un estudio de prefactibilidad en curso.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Línea de tiempo">
        <Timeline
          items={[
            { date: '1865', event: 'Guillermo Délano Ferguson funda la fábrica textil Bellavista en Tomé. Inicia el ciclo industrial que define el corredor.' },
            { date: '1897', event: 'Carlos Werner adquiere Bellavista y construye la ciudad obrera (iglesia, escuela, casas) — primer "commuting" hacia la fábrica.' },
            {
              date: 'Era de oro mitad s.XX',
              event: 'Bellavista Oveja Tomé llega a producir el ~77% de los paños de lana de Chile. Buses obreros desde Concepción consolidan el corredor.',
              source: { href: 'https://www.archivohistoricoconcepcion.cl/minisitios/economia-y-sociedad/bellavista-oveja-tome/', label: 'Archivo Histórico' },
            },
            {
              date: '2007',
              event: 'Cierre de Bellavista Oveja Tomé tras la competencia china e india. Corredor cambia de obrero a residencial dormitorio.',
              source: { href: 'https://www.diarioconcepcion.cl/economia-y-negocios/2018/08/04/bellavista-oveja-tome-descarta-cierre-apostando-a-exportar-y-crear-proyectos.html', label: 'Diario Concepción' },
            },
            {
              date: '27-feb-2010',
              event: 'Terremoto y tsunami destruyen el ~80% de Dichato. 18 fallecidos en la localidad. Servicios al norte de Tomé caen drásticamente por semanas.',
              source: { href: 'https://www.biobiochile.cl/noticias/2015/02/27/el-antes-y-despues-de-la-reconstruccion-de-dichato-a-cinco-anos-del-terremoto-y-tsunami.shtml', label: 'BioBioChile' },
            },
            {
              date: 'Jul-2016',
              event: 'Ministro Andrés Gómez-Lobo firma decreto creando el Perímetro de Exclusión de Tomé (segundo de la zona después del Gran Conce 2002).',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '10-mar-2022',
              event: 'Perímetro Tomé operativo. Tarifa cae a $750 (-$150 vs régimen previo). Operador único: Transportes Tomé. Servicios 401 y 411.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml', label: 'BioBioChile' },
            },
            {
              date: 'Nov-2022',
              event: 'Se agrega el servicio 421 (Av. Estadio) en hora punta. Mismo año, Diario Concepción discute si el corredor MOP Ruta 150 frenará la extensión Biotrén-Penco.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html', label: 'Diario Concepción' },
            },
            {
              date: '1-ene-2024',
              event: 'Inicio del nuevo Perímetro de Exclusión del Gran Concepción (que cubre Penco/Lirquén urbano, no Tomé). Caduca la licitación urbana de 2002 el 31-mar-2024.',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '13-nov-2024',
              event: 'CGR visa los llamados a licitación MOP de corredores de transporte público para Rutas 150 / 160 y Autopista Conce-Talcahuano.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: '7-may-2025',
              event: 'Se anuncia refuerzo en hora punta: 70 salidas tarde Conce→Tomé (+11%), nueva inyección 06:20 desde Cementerio 2, cuarta salida Dichato cada 15 min.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html', label: 'Diario Concepción' },
            },
            {
              date: '10-dic-2025',
              event: 'MOP recibe la oferta única del consorcio Electro Cointer II para la concesión Ruta 150 + Conce-Talcahuano II (UF 4.431.000).',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones' },
            },
            {
              date: '15-ene-2026',
              event: 'Apertura oferta económica de la concesión Ruta 150. Adjudicación esperada 1S 2026 · puesta en servicio proyectada 2032.',
            },
          ]}
        />
      </Section>

      <Section title="Comparación con los otros corredores del wiki">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">Conce ↔ Tomé</th>
                <th className="px-3 py-2 font-medium">201 Santa Juana</th>
                <th className="px-3 py-2 font-medium">Conce ↔ Florida</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Instrumento</td>
                <td className="px-3 py-2">Perímetro de exclusión propio (dec. jul-2016, op. 2022)</td>
                <td className="px-3 py-2">Licitación pública DTPR ELC0007 (2024)</td>
                <td className="px-3 py-2">Privados + capas subsidiadas puntuales</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Operadores</td>
                <td className="px-3 py-2">UNO · Transportes Tomé (fusión)</td>
                <td className="px-3 py-2">UNO · Soc. Transp. Pasajeros Santa Juana SpA</td>
                <td className="px-3 py-2">CUATRO privados + capas subsidiadas</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tarifa adulto</td>
                <td className="px-3 py-2">$750 base (2022)</td>
                <td className="px-3 py-2">$1.000 fijo</td>
                <td className="px-3 py-2">$1.700-$2.500 privado / $400-$1.500 subsidiado</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Eje vial</td>
                <td className="px-3 py-2">Ruta 150 (costa norte)</td>
                <td className="px-3 py-2">Ruta 156 / Ruta de la Madera (costa sur)</td>
                <td className="px-3 py-2">Ruta 148 + Ruta del Itata (sur-oriente)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Distancia</td>
                <td className="px-3 py-2">~30 km Conce-Tomé · ~42 km Conce-Dichato</td>
                <td className="px-3 py-2">~52 km</td>
                <td className="px-3 py-2">~42 km vía Itata · ~50 km vía 148</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">BusPay 2026</td>
                <td className="px-3 py-2"><strong>SÍ</strong> en perímetro inicial</td>
                <td className="px-3 py-2"><strong>SÍ</strong> en perímetro inicial</td>
                <td className="px-3 py-2">NO en perímetro inicial</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">GTFS publicado</td>
                <td className="px-3 py-2">No (operador no publica feed; servicios 401/411/421 ausentes del feed urbano)</td>
                <td className="px-3 py-2">No (operador no publica feed). Trazado integrado nativamente al visor desde mayo 2026 vía digitalización OSM — ver artículo Ruta 201.</td>
                <td className="px-3 py-2">No (operador no publica feed)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Conexión Biotrén</td>
                <td className="px-3 py-2">SÍ en Lirquén (terminal norte)</td>
                <td className="px-3 py-2">SÍ en Juan Pablo II</td>
                <td className="px-3 py-2">NO directa</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La hipótesis editorial: Tomé fue el <em>primer</em> ensayo
          regional del modelo "perímetro de exclusión + operador único
          fusionado" — y, junto con{' '}
          <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
            Santa Juana
          </a>
          , está en la primera ola de modernización del transporte público
          metropolitano del Biobío.{' '}
          <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
            Florida
          </a>
          {' '}sigue siendo el caso pendiente. Para el panorama general del
          conjunto de corredores interurbanos, ver el{' '}
          <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
            índice de recorridos interurbanos
          </a>
          {' '}y la nota{' '}
          <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">
            sobre este wiki
          </a>
          .
        </p>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Razón social formal con tipo societario (SpA / S.A. / Ltda.), RUT y N° RNTPP de Transportes Tomé.</li>
          <li>Decreto exacto de adjudicación del perímetro de exclusión Tomé (2016/2022) y duración del contrato.</li>
          <li>Forma matemática del polinomio de ajuste y calendario completo de reajustes 2022-2026 (tarifa 2026 vigente: $780 a Concepción, $830 a Dichato).</li>
          <li>Tabla horaria oficial lun-vie / sáb / dom / festivos para 401, 411 y 421.</li>
          <li>Detalle del compromiso de pago electrónico BusPay para servicios 401/411/421 (validadores, cronograma).</li>
          <li>Operación temporada alta verano: ¿hay flota o frecuencia extra contractual? No documentado.</li>
          <li>Estado de la prefactibilidad EFE para extender Biotrén a Penco / Tomé.</li>
          <li>Verificación independiente de la flota declarada (71 buses).</li>
          <li>Lista de razones sociales originales que se fusionaron en Transportes Tomé.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a DTPR Biobío por el
          contrato vigente, consulta a SII por nombre comercial, foto del
          cartel del horario en la terminal Manuel Rodríguez en Concepción
          o terminal Tomé Alto.
        </p>
      </Section>

      <Section title="Bibliografía">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
              Wikipedia · Perímetro de Exclusión del Gran Concepción
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
              Wikipedia · Transporte público en el Gran Concepción
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml">
              BioBioChile · 11-mar-2022 — Tarifa $750 al inicio del perímetro
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
              Diario Concepción · 7-may-2025 — Nuevos servicios y +11% en hora punta
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/08/en-11-aumentaron-las-salidas-de-buses-desde-concepcion-hacia-tome-en-horario-punta.html">
              Diario Concepción · 8-may-2025 — Detalle del 11%
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.tvu.cl/prensa/2025/05/07/transporte-publico-refuerza-rutas-entre-tome-y-concepcion-con-mas-salidas-y-horarios-extendidos.html">
              TVU · 7-may-2025 — Refuerzo y horarios extendidos
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
              Diario Concepción · 1-nov-2022 — Corredor Ruta 150 vs Biotrén Penco
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
              MOP Concesiones · 10-dic-2025 — Ofertas Ruta 150
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
              Diario Concepción · 7-nov-2025 — Electrocorredores Gran Concepción
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.archivohistoricoconcepcion.cl/minisitios/economia-y-sociedad/bellavista-oveja-tome/">
              Archivo Histórico Concepción · Bellavista Oveja Tomé
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.memoriachilena.gob.cl/602/w3-article-93823.html">
              Memoria Chilena · Fábrica de Paños Bellavista de Tomé
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.biobiochile.cl/noticias/2015/02/27/el-antes-y-despues-de-la-reconstruccion-de-dichato-a-cinco-anos-del-terremoto-y-tsunami.shtml">
              BioBioChile · 27-feb-2015 — Reconstrucción de Dichato
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/way/1082594953">
              OSM way 1082594953 · Ruta 150 (ref=150)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Tom%C3%A9">
              Wikipedia · Tomé (Chile)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8111">
              BCN · Reportes comunales Tomé 2017
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8107">
              BCN · Reportes comunales Penco 2017
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://pordondevalamicro.wordpress.com/recorridos-micros-licitadas/tome/concepcion-%E2%86%92-tome-%E2%86%92-dichato/">
              PorDóndeVaLaMicro · Trazado Conce → Tomé → Dichato
            </SourceLink>
          </li>
        </ul>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes foto del cartel de horarios en la terminal Manuel
          Rodríguez de Concepción o en Tomé Alto, conoces la razón social
          formal de Transportes Tomé, o tienes copia del decreto MTT que
          adjudicó el perímetro — abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-tome.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-tome.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
