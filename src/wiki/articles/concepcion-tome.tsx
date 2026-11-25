// Concepción ↔ Tomé, ficha OPERACIONAL del corredor norte del Gran
// Concepción.
//
// División editorial con `perimetro-exclusion-tome.tsx`:
//   - Aquí vive la OPERACIÓN: trazado calle a calle, paraderos,
//     frecuencias observadas, refuerzos may-2025, contexto industrial
//     (Bellavista Oveja Tomé), demanda y población, intermodalidad
//     observada (Biotrén, terminales, BusPay desde la perspectiva del
//     pasajero), issues operacionales (congestión, estacionalidad).
//   - El RÉGIMEN regulatorio (decreto MTT, marco legal, tarifa con
//     polinomio, operador adjudicado, BusPay institucional,
//     comparación con PE Gran Concepción, sanciones DTPR) vive en
//     `perimetro-exclusion-tome.tsx`.
// Cualquier dato regulatorio aquí debe ser cross-link a esa ficha.

import {
  DataTable,
  IssueNotice,
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';
import { MapLink } from '@/wiki/map-link';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function ConcepcionTome() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong>{' '}
        Trazado calle a calle de los servicios 401 / 411 / 421, tiempos
        de viaje, refuerzo de may-2025 (+11% en hora punta tarde),
        contexto industrial de Bellavista Oveja Tomé y demanda
        referencial del corredor: todo con fuente. La{' '}
        <strong>ficha institucional</strong> del régimen (decreto MTT
        jul-2016, operador adjudicado, tarifa $780 / $830 con polinomio
        de ajuste vigente desde 23-feb-2025, BusPay como sistema de
        recaudo) vive en{' '}
        <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
          Perímetro de Exclusión de Tomé
        </a>
        . Trazado, paraderos y horario programado de 401, 401Y, 411 y 421:
        GTFS oficial de la DTPR (programa del 28-feb-2025, verificado el
        24-nov-2026). <strong>Pendientes operacionales</strong>: horario
        vigente 2026 y de festivos, composición de flota verificada,
        refuerzos contractuales de temporada alta.
      </VerifiedBanner>

      <Section title="Resumen ejecutivo">
        <p>
          El corredor Concepción ↔ Tomé es la <strong>espina dorsal
          norte</strong> del Gran Concepción metropolitano. Conecta la
          ciudad de Concepción con las comunas costeras de{' '}
          <strong>Penco</strong> (47.367 hab. Censo 2017),{' '}
          <strong>Lirquén</strong> (distrito censal de Penco con 11.544 hab.)
          y <strong>Tomé</strong> (54.946 hab.) por la <strong>Ruta 150</strong>{' '}
          ("Cruce Ruta 146, Bypass Penco, Tomé").
        </p>
        <p>
          Operacionalmente, el corredor se mueve sobre <strong>dos
          regímenes regulatorios distintos</strong> según el tramo:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Tramo urbano</strong> Concepción ↔ Penco ↔ Lirquén:
            cubierto por servicios del{' '}
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción
            </a>
            . Los recorridos 17MC, 30MB, 30NC, 30QE, 31DF, 50YP y 62HM
            del GTFS oficial llegan hasta este tramo y aparecen en el
            visor (tarifa $580).
          </li>
          <li>
            <strong>Tramo interurbano</strong> Concepción ↔ Tomé ↔
            Dichato: cubierto por servicios <strong>401, 411 y 421</strong>{' '}
            del{' '}
            <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
              Perímetro de Exclusión de Tomé
            </a>
            , operados por Transportes Tomé. Tarifas vigentes:
            <strong> $780</strong> a Tomé / <strong>$830</strong> a
            Dichato (desde 23-feb-2025). Estos servicios, junto con la{' '}
            <strong>401Y</strong>, vienen en el{' '}
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS oficial de la DTPR
            </a>{' '}
            y el visor los muestra con trazado, paraderos y horario
            programado.
          </li>
        </ul>
        <p>
          A esto se suma una capa de inversión MOP histórica: el{' '}
          <strong>corredor de transporte público Ruta 150</strong>{' '}
          (
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            corredor MOP
          </a>
          ) cuya licitación recibió oferta única en
          diciembre 2025, puesta en servicio proyectada 2032.
        </p>
      </Section>

      <Section title="Cobertura del visor (qué sí, qué no)">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Recorridos urbanos hasta Penco y Lirquén (PE Gran Concepción)
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Servicios urbanos que cruzan Concepción → Penco/Lirquén y
            terminan ahí. El código del GTFS junta las dos variantes del
            recorrido, una por sentido; entre paréntesis, la que va hacia
            el norte:
          </p>
          <ul className="mt-1 ml-5 list-disc space-y-0.5 text-[12px]">
            <li><strong>17MC</strong> (17M) · Montahue, Penco (operador Expresos Chiguayante)</li>
            <li><strong>30MB / 30NC</strong> (30B, 30C) · Penco - Lirquén (Ruta Las Playas)</li>
            <li><strong>30QE</strong> (30E) · Penco Chico (Ruta Las Playas)</li>
            <li><strong>31DF</strong> (31F) · Lirquén (Ruta del Mar)</li>
            <li><strong>50YP</strong> (50Y) · Cosmito (operador Denavi Sur, San Vicente ↔ Cosmito)</li>
            <li><strong>62HM</strong> (62H) · Lirquén (operador Mi Expreso, San Vicente ↔ Lirquén)</li>
          </ul>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Estos servicios pasaron al Perímetro de Exclusión del Gran
            Concepción el <strong>1-ene-2024</strong>, reemplazando la
            licitación 2002 caducada el 31-mar-2024. Operadores según el
            letrero de cada viaje en el GTFS oficial.
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Interurbanos del PE Tomé (también en el GTFS oficial)
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Los servicios <strong>401, 401Y, 411 y 421</strong> operan bajo
            el Perímetro de Exclusión de Tomé, pero la DTPR los publica en
            el mismo GTFS de Gran Concepción que usa el visor (versión del
            28-feb-2025). Aparecen como recorridos normales, rotulados
            «Interurbano Tomé», con sus dos sentidos (la 401Y, uno solo),
            sus paraderos y su horario programado. La DTPR publica además
            un GTFS propio del PE Tomé (versión Tomé20230308) con los
            mismos cuatro códigos. Hasta nov-2026, cuando el visor usaba
            el feed 2019, estos servicios se dibujaban desde trazados OSM
            digitalizados a mano. El contexto institucional vive en{' '}
            <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
              PE Tomé · GTFS y cobertura del visor
            </a>
            .
          </p>
          <p className="mt-1 text-[12px]">
            El nodo principal del corredor en Concepción es la{' '}
            <strong>terminal a Tomé</strong>: OSM way 425356582
            "Terminal de líneas a Tomé" (Manuel Rodríguez 2424 aprox.,{' '}
            <code className="font-mono">−36.8191, −73.0620</code>).
          </p>
          <p className="mt-2 text-[12px]">
            <MapLink route="401">
              Ver la 401 en el mapa →
            </MapLink>
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

      <Section title="Horario programado (GTFS oficial)">
        <p>
          El programa que publica la DTPR (versión del 28-feb-2025; su
          calendario declarado venció el 31-dic-2025, pero es la última
          publicación) trae estas salidas. Son las que usa el visor en la
          ficha de cada recorrido y en la capa <strong>Servicios en
          curso</strong>, que estima dónde debería ir cada bus según ese
          horario: no es GPS.
        </p>
        <DataTable columns={['Servicio', 'Lunes a viernes', 'Sábado', 'Domingo']} bodyClassName="divide-y align-top text-[12px]">
          <tr>
            <td className="px-3 py-2 font-medium">401 Tomé</td>
            <td className="px-3 py-2">100 salidas hacia Concepción (05:25 a 21:58) y 103 hacia Tomé (06:25 a 23:30), cada ~10 min, ~1 h 26 min de viaje</td>
            <td className="px-3 py-2">99 y 103 salidas</td>
            <td className="px-3 py-2">99 y 101 salidas</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">401Y Bellavista</td>
            <td className="px-3 py-2">2 salidas hacia Concepción (06:45 y 07:00); no publica el sentido inverso</td>
            <td className="px-3 py-2">Sin servicio</td>
            <td className="px-3 py-2">Sin servicio</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">411 Dichato</td>
            <td className="px-3 py-2">85 salidas hacia Concepción (05:55 a 19:58) y 78 hacia Dichato (07:12 a 20:08), ~1 h 45 min de viaje</td>
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
          normal de ese día de la semana. Los refuerzos de mayo de 2025
          (ver más abajo) son posteriores al programa del 28-feb-2025 y
          pueden no estar reflejados.
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

      <Section title="Geografía y vialidad">
        <KeyValueList
          items={[
            ['Distancia Concepción → Tomé', 'Aprox. 30 km por Ruta 150 (eje costero, sin grandes pendientes)'],
            ['Distancia Concepción → Dichato', 'Aprox. 42 km, Dichato es localidad costera al norte de Tomé urbano'],
            ['Tiempo en bus Concepción → Tomé', '~50 a 70 min según hora del día y trazado (parada Penco / Lirquén)'],
            [
              'Eje vial primario',
              <>
                <strong>Ruta 150</strong> (OSM <code className="font-mono">ref=150</code>,
                official_name "Cruce Ruta 146 (Concepción), Bypass Penco, Tomé"). Doble vía concesionada en parte del tramo, pavimento
                de hormigón, máx. 60 km/h en bypass urbano.
              </>,
            ],
            [
              'Vías secundarias',
              'Camino histórico Penco - Cosmito - Concepción por Av. Latorre / La Atalaya; eje urbano Av. Manuel Rodríguez y Av. Los Carrera (Concepción), Costanera (Tomé)',
            ],
            [
              'Estaciones / paraderos clave',
              'Plaza de Penco, Plaza de Lirquén, Bellavista Tomé, Costanera de Tomé, Tomé Alto, Dichato Av. Daniel Vera. El Biotrén no llega al corredor (terminal norte L1 es Mercado de Talcahuano); la extensión a Penco/Lirquén lleva años en estudio EFE, ver artículo Biotrén y sus extensiones.',
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
            Diario Concepción · 1-nov-2022, Corredor Ruta 150 y debate Biotrén-Penco
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
            BioBioChile · 27-feb-2015, Reconstrucción de Dichato
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/tvu-noticias/2024/02/27/a-14-anos-del-terremoto-y-tsunami-del-2010-como-luce-dichato-una-de-las-localidades-mas-afectadas.html">
            TVU · 27-feb-2024, Dichato 14 años después
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Servicios 401 / 411 / 421">
        <p>
          El operador único <strong>Transportes Tomé</strong> presta tres
          servicios bajo el perímetro. El detalle institucional del
          operador (origen societario por fusión de Buses Costa Azul
          S.A. y otros, representante legal Bernardo Montoya, flota
          declarada de 71 buses) vive en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
            PE Tomé · Operador único
          </a>
          .
        </p>
        <DataTable columns={['Código', 'Origen, destino', 'Estado / observaciones']}>
              <tr>
                <td className="px-3 py-2 font-mono font-medium">401</td>
                <td className="px-3 py-2">Concepción (T. Manuel Rodríguez) ↔ Tomé Alto</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Servicio troncal. ~64 paradas, ~82 min de viaje según
                  agregadores. Salida desde Concepción por Av. Chacabuco
                  (ida) y retorno por Av. Los Carrera. Operativo desde
                  el inicio del perímetro (mar-2022).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono font-medium">401Y</td>
                <td className="px-3 py-2">Tomé (Bellavista) → Concepción</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Variante de punta mañana. En el GTFS oficial solo trae el
                  sentido hacia Concepción: 2 salidas de lunes a viernes
                  (06:45 y 07:00).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono font-medium">411</td>
                <td className="px-3 py-2">Concepción ↔ Dichato (vía Tomé)</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Extensión norte hasta el balneario de Dichato. Tarifa
                  diferenciada ($830 desde 23-feb-2025). En mayo 2025
                  se sumó una <strong>cuarta salida desde Dichato</strong>{' '}
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

      <Section title="Frecuencias y refuerzo may-2025">
        <KeyValueList
          items={[
            [
              'Hora punta tarde Conce → Tomé (16:00-21:00)',
              '70 salidas (subió 11% en mayo 2025, antes 63). Frecuencia cada 3-5 min.',
            ],
            [
              'Hora punta tarde detallada',
              '16:00-16:30: cada 4 min · desde 17:30: cada 3 min (declarado por Bernardo Montoya).',
            ],
            [
              'Hora punta mañana Tomé → Conce',
              'Servicio de inyección agregado mayo 2025: salida 06:20 desde sector Cementerio 2 (cubre Loma Larga y Villa El Mirador).',
            ],
            [
              'Dichato → Conce',
              'Mayo 2025 sumó cuarta salida entre 06:00-07:00, cada 15 min.',
            ],
            ['Información en tiempo real', 'App Red Regional de Movilidad, buscar "401" / "411".'],
            ['GTFS público', 'Sí. 401, 401Y, 411 y 421 vienen en el GTFS oficial de Gran Concepción que publica la DTPR (el que usa el visor) y en un GTFS propio del PE Tomé (versión Tomé20230308).'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          <strong>Origen del refuerzo:</strong> Bernardo Montoya
          (representante legal) reconoció en prensa que hasta abril 2025
          había "diferencias de 20 a 21 minutos entre buses" en algunos
          cortes de la hora punta. El ajuste se decidió localmente,
          "evitando decisiones desde Santiago", como reacción a la
          presión de la <strong>Unión Comunal de Juntas de Vecinos de
          Tomé</strong> (presidente 2025: Gonzalo Reyes), resuelta en
          menos de 20 días desde la solicitud.
        </p>
        <p className="text-[12px] text-muted-foreground">
          <strong>Tarifas adulto vigentes:</strong> $780 Concepción ↔
          Tomé y $830 Concepción ↔ Dichato desde el reajuste polinómico
          del 23-feb-2025. Detalle del polinomio y tarifas TNE / adulto
          mayor en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
            PE Tomé · Tarifa y polinomio de ajuste
          </a>
          .
        </p>
        <PendingBanner>
          <strong>Horario vigente 2026 pendiente.</strong> El único
          programa oficial publicado es el del GTFS (28-feb-2025, ver
          "Horario programado"), sin festivos. Los anuncios de mayo de
          2025 son posteriores. Una foto del cartel en la terminal Manuel
          Rodríguez permitiría contrastarlo.
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
                con el tren, los servicios 401/411/421 hacen el trayecto
                completo en bus. La <strong>extensión Biotrén a Penco /
                Lirquén</strong> lleva años en estudio EFE y queda
                tensionada con el corredor MOP Ruta 150. Ver{' '}
                <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
                  Biotrén · extensiones y proyectos
                </a>
                .
              </>,
            ],
            [
              'Terminal en Concepción',
              <>
                <strong>Terminal Manuel Rodríguez</strong> (Angol esquina
                M. Rodríguez), base de Transportes Tomé. <strong>NO</strong>{' '}
                es Terminal Camilo Henríquez ni Collao. Nodo OSM way
                425356582 "Terminal de líneas a Tomé".
              </>,
            ],
            [
              'Taxis colectivos',
              <>
                En los extremos del corredor (centros de Penco, Lirquén,
                Tomé y Dichato) la red local de{' '}
                <a href="/wiki/taxis-colectivos-gran-concepcion" className="underline underline-offset-2">
                  taxis colectivos
                </a>
                {' '}suele complementar la última milla. No hay
                integración tarifaria con los servicios del PE Tomé.
              </>,
            ],
            [
              'GTFS urbano (visor)',
              'Los recorridos urbanos 17MC, 30MB, 30NC, 30QE, 31DF, 50YP y 62HM aparecen en el visor y conectan los mismos puntos hasta Penco/Lirquén, útil para el tramo corto si el pasajero no necesita continuar a Tomé.',
            ],
            [
              'BusPay 2026',
              <>
                Desde el Q3 2026, marcha blanca de pago electrónico
                contactless sobre la flota de Transportes Tomé.
                Detalles del sistema en{' '}
                <a href="/wiki/buspay" className="underline underline-offset-2">
                  BusPay
                </a>
                ; cobertura institucional sobre el perímetro en{' '}
                <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
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

      <Section title="Demanda y población">
        <KeyValueList
          items={[
            ['Tomé (comuna)', '54.946 hab. (Censo 2017 INE), Gran Concepción metropolitano · Coliumo, Cocholgüe, Dichato, Pingueral, Rafael, Menque'],
            ['Penco (comuna)', '47.367 hab. (Censo 2017 INE), 107,6 km² · incluye Lirquén como distrito censal'],
            ['Lirquén (distrito de Penco)', '11.544 hab. (Censo 2017), 24,4% de la población comunal de Penco'],
            ['Demanda diaria declarada al inicio del perímetro (2022)', 'Cerca de 10.000 pasajeros/día en el corredor Conce-Tomé'],
            ['Estacionalidad', 'Peak fuerte en verano (Dichato, Pingueral, Coliumo, Cocholgüe, turismo de playa) y fines de semana largos. En invierno: corredor netamente pendular trabajo-estudio.'],
            ['Punto de inflexión histórico', 'Cierre Bellavista Oveja Tomé 2007 → corredor pasa de "obrero textil" a "residencial dormitorio + turismo estacional"'],
            ['Vector de presión política', 'Unión Comunal de Juntas de Vecinos de Tomé (presidente 2025: Gonzalo Reyes), gatilla peticiones de frecuencia atendidas en <20 días según mayo 2025'],
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
      </Section>

      <Section title="Inversión MOP: el corredor Ruta 150 (impacto operacional)">
        <p>
          La concesión MOP de un <strong>corredor exclusivo de
          transporte público sobre la Ruta 150</strong> impactará la
          operación cotidiana del corredor a partir de 2032. Datos
          clave verificados de la concesión:
        </p>
        <KeyValueList
          items={[
            ['Tramo cubierto', 'Rotonda Bonilla (Concepción) ↔ Enlace Penco, aprox. 8-9 km'],
            ['Tipo de obra', 'Pista bidireccional exclusiva para transporte público + ciclovía + veredas + estaciones de alta capacidad'],
            ['Adjudicación esperada', 'Primer semestre 2026 (oferta única consorcio Electro-Cointer II)'],
            ['Puesta en servicio (proyectada)', '2032'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          <strong>Para el pasajero del corredor:</strong> los servicios
          401 / 411 / 421 ganarían tiempo en el tramo Rotonda Bonilla ↔
          Enlace Penco, pero el cuello de botella del bypass urbano
          Penco ↔ Lirquén ↔ Tomé (~20 km sin pista exclusiva) se
          mantiene. La municipalidad de Tomé ha pedido extender la
          inversión, sin compromiso MOP a la fecha.
        </p>
        <p className="text-[12px] text-muted-foreground">
          Detalle técnico completo (inversión UF 4.431.000, consorcios,
          calendario, paquete de corredores MOP) en{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            Corredores de Transporte Público MOP del Biobío
          </a>
          . Tensión institucional del perímetro con la concesión MOP en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
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

      <Section title="Issues operacionales conocidos">
        <div className="space-y-2">
          <IssueNotice title="Congestión Ruta 150 en hora punta">
            El bypass Penco-Lirquén-Tomé tiene capacidad limitada y, al
            ser doble vía sin pista exclusiva, se satura cuando los
            buses del 401/411 acumulan demanda residencial con el flujo
            comercial. Es la razón política del corredor MOP que se
            licita ahora.
          </IssueNotice>
          <IssueNotice title="Estacionalidad turística vs. capacidad regular">
            En enero-febrero y fines de semana largos, los servicios
            411 a Dichato/Pingueral colapsan. No hay refuerzo
            documentado contractualmente para temporada alta, el
            régimen no exige al operador único una flota o frecuencia
            extra estival.
          </IssueNotice>
          <IssueNotice title="Biotrén no llega a Tomé">
            La terminal del Biotrén urbano está en Mercado de Talcahuano.
            El alcalde de Penco Víctor Hugo Figueroa (2022) advirtió
            que el corredor Ruta 150 puede <em>frenar</em> la extensión
            a Penco/Tomé porque baja la demanda potencial del tren. EFE
            Sur tiene un estudio de prefactibilidad en curso.
          </IssueNotice>
          <IssueNotice title="Operador único sin alternativa en el régimen">
            Al ser un perímetro de exclusión con operador único, si
            Transportes Tomé baja frecuencia o sube quejas, el
            pasajero no tiene alternativa formal dentro del régimen.
            La compensación es presión vecinal directa y
            fiscalización DTPR. Lectura institucional del riesgo en{' '}
            <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
              PE Tomé · Fiscalización y riesgo monopólico
            </a>
            .
          </IssueNotice>
        </div>
      </Section>

      <Section title="Línea de tiempo operacional">
        <Timeline
          items={[
            { date: '1865', event: 'Guillermo Délano Ferguson funda la fábrica textil Bellavista en Tomé. Inicia el ciclo industrial que define el corredor.' },
            { date: '1897', event: 'Carlos Werner adquiere Bellavista y construye la ciudad obrera (iglesia, escuela, casas), primer "commuting" hacia la fábrica.' },
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
              date: '10-mar-2022',
              event: 'Entra en operación el Perímetro de Exclusión de Tomé. Servicios 401 y 411 desde la terminal Manuel Rodríguez. Detalles regulatorios en PE Tomé.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml', label: 'BioBioChile' },
            },
            {
              date: 'Nov-2022',
              event: 'Se agrega el servicio 421 (Av. Estadio) en hora punta. Mismo año, Diario Concepción discute si el corredor MOP Ruta 150 frenará la extensión Biotrén-Penco.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html', label: 'Diario Concepción' },
            },
            {
              date: '7-may-2025',
              event: 'Refuerzo en hora punta: 70 salidas tarde Conce → Tomé (+11%), nueva inyección 06:20 desde Cementerio 2, cuarta salida Dichato cada 15 min entre 06:00-07:00. Decisión reactiva a presión de la Unión Comunal de Juntas de Vecinos.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html', label: 'Diario Concepción' },
            },
            {
              date: '10-dic-2025',
              event: 'MOP recibe la oferta única del consorcio Electro-Cointer II para la concesión Ruta 150 + Conce-Talcahuano II.',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones' },
            },
            {
              date: 'Q3 2026 (proyectado)',
              event: 'Marcha blanca BusPay sobre la flota de Transportes Tomé. Efectivo y pago electrónico operan en paralelo.',
            },
            {
              date: '24-nov-2026',
              event: 'El visor toma 401, 401Y, 411 y 421 del GTFS oficial de la DTPR (programa del 28-feb-2025) y deja los trazados OSM digitalizados a mano.',
              source: { href: 'https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/', label: 'dtpr.gob.cl · GTFS' },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          La cronología <strong>institucional</strong> del régimen
          (decreto Gómez-Lobo 2016, fusión de operadores 2016-2022,
          reajuste tarifario 23-feb-2025, adjudicación BusPay 28-ene-2026)
          vive en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
            PE Tomé · Cronología institucional
          </a>
          .
        </p>
      </Section>

      <Section title="Comparación con los otros corredores del wiki">
        <DataTable columns={['Dimensión', 'Conce ↔ Tomé', '201 Santa Juana', 'Conce ↔ Florida']}>
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
                <td className="px-3 py-2 font-medium">Tarifa adulto vigente</td>
                <td className="px-3 py-2">$780 (Tomé) / $830 (Dichato)</td>
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
                <td className="px-3 py-2">Sí: GTFS oficial DTPR de Gran Concepción (401, 401Y, 411, 421), que usa el visor, y GTFS propio del PE Tomé</td>
                <td className="px-3 py-2">Sí: 201 y 201-AU en el GTFS oficial DTPR de Gran Concepción. Hasta nov-2026 el visor los digitalizaba desde OSM.</td>
                <td className="px-3 py-2">No (operador no publica feed)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Conexión Biotrén</td>
                <td className="px-3 py-2">NO directa (terminal norte L1 = Mercado de Talcahuano)</td>
                <td className="px-3 py-2">SÍ en Juan Pablo II</td>
                <td className="px-3 py-2">NO directa</td>
              </tr>
            </DataTable>
        <p className="text-[12px] text-muted-foreground">
          La hipótesis editorial: Tomé fue el <em>primer</em> ensayo
          regional del modelo "perímetro de exclusión + operador único
          fusionado", y, junto con{' '}
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

      <Section title="Datos operacionales pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Tabla horaria oficial lun-vie / sáb / dom / festivos para 401, 411 y 421.</li>
          <li>Composición de flota verificada (marca, modelo, año, norma Euro), la cifra declarada de 71 buses requiere cotejo con padrón DTPR.</li>
          <li>Número de conductores y composición laboral del operador.</li>
          <li>Operación temporada alta verano: ¿hay flota o frecuencia extra observada en terreno? No documentado.</li>
          <li>Estado de la prefactibilidad EFE para extender Biotrén a Penco / Tomé.</li>
          <li>Reclamos OIRS / Subtrans documentados específicamente por el corredor.</li>
          <li>Conteo de pasajeros actualizado post may-2025 (las cifras públicas son de 2022).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: foto del cartel del horario en la terminal
          Manuel Rodríguez en Concepción o terminal Tomé Alto, conteo
          en paradero, observación de terreno en temporada alta. Los
          pendientes <strong>institucionales</strong> (decreto exacto,
          RUT, plazo contractual, polinomio matemático, sanciones DTPR)
          viven en{' '}
          <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">
            PE Tomé · Datos institucionales pendientes
          </a>
          .
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
              BioBioChile · 11-mar-2022, Inicio del perímetro
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
              Diario Concepción · 7-may-2025, Nuevos servicios y +11% en hora punta
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/08/en-11-aumentaron-las-salidas-de-buses-desde-concepcion-hacia-tome-en-horario-punta.html">
              Diario Concepción · 8-may-2025, Detalle del 11%
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.tvu.cl/prensa/2025/05/07/transporte-publico-refuerza-rutas-entre-tome-y-concepcion-con-mas-salidas-y-horarios-extendidos.html">
              TVU · 7-may-2025, Refuerzo y horarios extendidos
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
              Diario Concepción · 1-nov-2022, Corredor Ruta 150 vs Biotrén Penco
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
              MOP Concesiones · 10-dic-2025, Ofertas Ruta 150
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
              BioBioChile · 27-feb-2015, Reconstrucción de Dichato
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
            <SourceLink href="https://pordondevalamicro.wordpress.com/recorridos-micros-licitadas/tome/concepcion-%E2%86%92-tome-%E2%86%92-dichato/">
              PorDóndeVaLaMicro · Trazado Conce → Tomé → Dichato
            </SourceLink>
          </li>
        </ul>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes foto del cartel de horarios en la terminal Manuel
          Rodríguez de Concepción o en Tomé Alto, conteo de pasajeros
          actualizado, o información operacional del corredor, abre un
          pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-tome.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-tome.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
