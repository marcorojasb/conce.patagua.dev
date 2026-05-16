// Corredor interurbano por El Pimentón — Concepción ↔ Florida / Yumbel /
// Hualqui rural por la Cordillera de la Costa.
//
// Este artículo cubre el corredor como pieza territorial: por qué importa,
// qué conecta, qué operadores lo cruzan, qué decisiones de política pública
// están en juego. Las fichas individuales viven en archivos hermanos
// (concepcion-florida.tsx para el servicio principal). Los datos de la
// 201 Santa Juana NO entran aquí — Santa Juana sale por Ruta 156 (Ruta de
// la Madera, costa), no por El Pimentón.

import {
  CorridorMap,
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

export default function CorredorElPimenton() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong> La
        existencia y operación del corredor (operadores, paraderos, hitos
        recientes 2024-2025) está sostenida por prensa regional, comunicados
        municipales y prensa del MOP. El topónimo popular{' '}
        <em>"El Pimentón"</em> no fue confirmado en cartografía oficial IGM
        ni en OpenStreetMap como nombre de cuesta — ver{' '}
        <strong>Nota sobre el topónimo</strong> al final.
      </VerifiedBanner>

      <Section title="Resumen ejecutivo">
        <p>
          El <strong>corredor de El Pimentón</strong> es la espina dorsal
          interurbana sur-oriente del Gran Concepción: el conjunto de viajes
          en bus que cruzan la Cordillera de la Costa para conectar la
          metrópoli con la comuna de <strong>Florida</strong> (~10.624 hab.,
          60% rural —{' '}
          <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
            ver artículo del servicio troncal Concepción ↔ Florida
          </a>
          ) y, vía Florida o vía rutas alternativas, con sectores
          rurales de Hualqui y la comuna de <strong>Yumbel</strong>{' '}
          (~21.198 hab.).
        </p>
        <p>
          A diferencia del eje Concepción ↔ Santa Juana (Ruta 156 / Ruta de
          la Madera, costa), este corredor se mete por el interior y trepa
          la cuesta de la Cordillera de la Costa. Lo conforman, hoy:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            La <strong>Ruta 148</strong> Concepción-Bulnes (eje histórico,
            del{' '}
            <SourceLink href="https://www.archivohistoricoconcepcion.cl/minisitios/monografias-regionales/los_siete_puentes_a_florida/">
              gobernador Ambrosio O'Higgins
            </SourceLink>
            ).
          </li>
          <li>
            La <strong>Ruta del Itata (concesionada)</strong> con su acceso
            norte a Concepción y, desde 2019, un{' '}
            <SourceLink href="https://biobio.mop.gob.cl/vecinos-de-florida-ya-pueden-usar-ruta-del-itata-para-llegar-a-concepcion/">
              enlace habilitado para Florida
            </SourceLink>
            .
          </li>
          <li>
            Caminos rurales O-540 (Florida-San Antonio de Dadi) y Q-560
            (Ruta 148-Peleco-Cancha Los Monteros), parcialmente en{' '}
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/09/05/florida-pavimentaran-conexion-con-copiulemu-por-mas-de-3-mil-millones.html">
              proceso de pavimentación MOP (2024-)
            </SourceLink>
            .
          </li>
        </ul>
        <p>
          Es un corredor <strong>regulatoriamente fragmentado</strong>:
          servicios privados (que el MTT reconoce que no puede obligar a
          aumentar frecuencias), contratos de "conectividad rural"
          subsidiados (1 inaugurado en octubre 2025 para la zona norte de
          Florida, 1 a Rahuil desde 2025, 1 a Poñén-Roa) y operadores
          interurbanos de larga distancia que sólo pasan de paso. No hay un
          decreto único que lo gobierne y, hasta hoy, ningún feed GTFS
          público lo describe.
        </p>
      </Section>

      <Section title="Geografía del corredor">
        <KeyValueList
          items={[
            ['Sentido general', 'Concepción (zona urbana, 10-30 m s.n.m.) → cruce Cordillera de la Costa → Florida (~330 m) → valle del Itata → Yumbel (intermedio, ~80 m)'],
            ['Distancia Conce-Florida (ruta corta vía Itata)', '~42 km · ~50 min sin congestión'],
            ['Distancia Conce-Florida (ruta histórica Bulnes)', '~50 km · ~1 h 10 min'],
            ['Distancia Conce-Yumbel', '~68 km · ~1 h - 1 h 30 min en bus'],
            ['Cordillera de la Costa local', 'Lomas amesetadas, valles de poca extensión llamados vegas; altitudes 4-677 m en la franja Hualqui-Florida'],
            ['Comunas atravesadas', 'Concepción, Chiguayante o Penco según trazado, Hualqui (rural), Florida, eventualmente Yumbel/Quillón'],
            ['Hitos hidrográficos', 'Río Andalién (paralelo a la Ruta 148 histórica), estero Primer Agua, río Itata aguas abajo'],
            ['Clima', 'Mediterráneo Csb. En invierno: neblinas matinales en la cuesta, lluvias intensas, escarchas puntuales (no nieve persistente)'],
          ]}
        />
        <Sources>
          <SourceLink href="https://es-es.topographic-map.com/map-5ms14/Hualqui/">
            Topographic-map · Altitudes Hualqui (4 a 677 m)
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Florida_(Chile)">
            Wikipedia · Florida (Chile) — 42 km a Concepción, 609 km², 60,19% rural
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Yumbel">
            Wikipedia · Yumbel — 68 km a Concepción, 21.198 hab. (Censo 2017)
          </SourceLink>
          <SourceLink href="https://hualqui.com/caracteristicas/">
            Municipalidad Hualqui · Geografía local
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Trazados y waypoints">
        <p className="text-[12px] text-muted-foreground">
          El corredor admite al menos tres trazados activos según el
          operador y el destino final. Ningún operador publica un GeoJSON
          oficial — los waypoints siguientes se derivan de prensa, de la
          municipalidad de Florida, de OpenStreetMap y del paradero
          confirmado de Colo-Colo con Av. Los Carrera (Concepción).
        </p>
        <CorridorMap
          corridorId="el-pimenton"
          caption={
            <>
              Trazado referencial. El visor principal aún no tiene una capa
              GTFS para este corredor — cuando exista, esta caja la enchufa
              automáticamente por el atributo{' '}
              <code className="font-mono">data-corridor-id="el-pimenton"</code>.
            </>
          }
          waypoints={[
            { km: 'km 0', label: 'Concepción centro', note: 'Paradero Colo-Colo / Av. Los Carrera, esquina Las Heras (parada histórica de Florida)' },
            { km: 'km 5', label: 'Salida nororiente', note: 'Av. 21 de Mayo / Av. Chacabuco / Costanera → empalme con Ruta 148 o Ruta del Itata' },
            { km: 'km 12-15', label: 'Cuesta de la Cordillera de la Costa', note: 'Pendiente sostenida; punto donde el habla local sitúa "El Pimentón" (topónimo no oficial)' },
            { km: 'km 13', label: 'Agua Amarilla', note: 'Plaza de peaje de la Ruta del Itata para tráfico que viene del Acceso Norte a Concepción' },
            { km: 'km 30-32', label: 'Enlace Florida (Ruta del Itata, hab. dic 2019)', note: 'Permite saltarse el camino histórico y entrar a Florida en ~30 min menos' },
            { km: 'km 42', label: 'Florida urbano', note: 'Plaza de Florida, terminal informal frente a la municipalidad' },
            { km: 'km +', label: 'Ramales rurales', note: 'Copiulemu (al oriente, hacia Cabrero) · Granerillos · Roa (~16 km al norte) · Trecacura · Manco · Poñén · Rahuil' },
            { km: 'km 68', label: 'Yumbel urbano', note: 'Terminal San Sebastián. Servicios privados, no DTPR subsidiados' },
          ]}
        />
        <Sources>
          <SourceLink href="https://biobio.mop.gob.cl/vecinos-de-florida-ya-pueden-usar-ruta-del-itata-para-llegar-a-concepcion/">
            Seremi MOP Biobío · Habilitación enlace Florida-Itata (12-dic-2019)
          </SourceLink>
          <SourceLink href="https://www.mundochileno.com/plaza-peaje-agua-amarilla-F120FC7041DD540">
            Mundo Chileno · Peaje Agua Amarilla, Autopista del Itata, Penco
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml">
            BioBioChile · Paradero Colo-Colo con Los Carrera (mar-2024)
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Florida_(Chile)">
            Wikipedia · Localidades rurales (Copiulemu, Roa, Trecacura, Manco, Granerillos, Rahuil, Poñén)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Operadores en el corredor (mapa de actores)">
        <p>
          El corredor mezcla cuatro tipos de servicio: <strong>(a)</strong>{' '}
          rurales-interurbanos privados entre Concepción y Florida que
          paran en localidades intermedias; <strong>(b)</strong>{' '}
          interurbanos de larga distancia que <em>cruzan</em> el corredor
          camino a Bulnes o Chillán y a veces venden tramos cortos;{' '}
          <strong>(c)</strong> servicios <em>subsidiados</em> bajo
          contratos de conectividad rural del MTT (los más nuevos, 2024-2025);
          y <strong>(d)</strong> servicios privados específicos a Yumbel
          que comparten parte del trazado.
        </p>
        <OperatorTable
          rows={[
            {
              name: 'Buses Delsal Ltda.',
              routes: 'Concepción ↔ Quillón ↔ Bulnes (pasa por Florida en algunas vueltas)',
              terminal: 'Terminal Camilo Henríquez',
              notes: (
                <>
                  Fundada en <strong>1977</strong>. Horario publicado en
                  fuente privada (no DTPR). Servicio cada ~30 min en franja
                  diurna. Una nota municipal de Florida la lista entre los
                  tres operadores que conectan Florida ↔ Concepción.
                </>
              ),
              source: { href: 'https://www.horariodebuses.cl/buses-delsal', label: 'horariodebuses.cl · Delsal' },
            },
            {
              name: 'Buses Nueva Libertadores (Los Libertadores)',
              routes: 'Concepción ↔ Florida (servicio rural-interurbano)',
              terminal: 'Paradero Colo-Colo / Av. Los Carrera',
              notes: (
                <>
                  Reportada como operador principal del corredor por la
                  prensa regional (jul-2024). Representante mencionada:{' '}
                  <strong>Ulda Espinoza</strong>. En marzo 2024 protagonizó
                  un incidente público de violencia entre conductores con
                  BioCosta por competencia de paradas.
                </>
              ),
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html',
                label: 'Diario Concepción · jul-2024',
              },
            },
            {
              name: 'Buses Biocosta',
              routes: 'Concepción ↔ Florida · también Concepción ↔ Santa Juana antes de la licitación 201',
              terminal: 'Paradero Colo-Colo / Av. Los Carrera',
              notes: (
                <>
                  Operador rural-interurbano. Conductor citado en prensa:{' '}
                  <strong>Miguel Ángel Sepúlveda</strong>. Denunció
                  amenazas y violencia desde Los Libertadores por
                  competencia de captación de pasajeros (mar-2024).
                </>
              ),
              source: {
                href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml',
                label: 'BioBioChile · mar-2024',
              },
            },
            {
              name: 'Transportes Trinidad',
              routes: 'Concepción ↔ Copiulemu, Chaimavida, El Pino (sectores rurales)',
              terminal: 'No publicado',
              notes: (
                <>
                  Identificado en prensa como operador rural específico
                  para localidades del interior. Representante mencionado:{' '}
                  <strong>Blas Pereira</strong>. Trazado y frecuencias no
                  publicados en fuente abierta.
                </>
              ),
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html',
                label: 'Diario Concepción · jul-2024',
              },
            },
            {
              name: 'Línea Azul',
              routes: 'Chillán ↔ Concepción (pasa por Yumbel/Bulnes); vende tramos Concepción ↔ Yumbel',
              terminal: 'Terminal Collao',
              notes: (
                <>
                  Empresa fundada en <strong>1964</strong> en Chillán. Es
                  interurbana de larga distancia, no servicio rural
                  subsidiado. Frecuencia hacia Yumbel reportada cada 30 min
                  desde Collao.
                </>
              ),
              source: {
                href: 'https://www.concepcionchile.cl/terminal-buses-concepcion-chile.php',
                label: 'concepcionchile.cl · Terminal Collao',
              },
            },
            {
              name: 'Transportes Bío Bío',
              routes: 'Concepción ↔ Yumbel ↔ Los Ángeles',
              terminal: 'Terminal Camilo Henríquez',
              notes: (
                <>
                  Interurbano privado. Cubre la franja Conce-Yumbel con
                  frecuencias declaradas cada 30-60 min, viaje ~1 h - 1 h
                  30 min, tarifa referencial $2.000-$3.500. Sin GTFS
                  público.
                </>
              ),
              source: {
                href: 'https://www.busbud.com/en/terminal-camilo-henriquez-de-concepcion/s/22354',
                label: 'Busbud · Terminal Camilo Henríquez',
              },
            },
            {
              name: 'Pullman Bus (división Sur)',
              routes: 'Servicios pasantes Santiago ↔ Concepción que paran en Yumbel',
              terminal: 'Terminal Collao',
              notes: 'Larga distancia. No es operador local del corredor; aparece como opción de venta en plataformas de pasajes.',
              source: { href: 'https://kupos.cl/en/bus/tickets/concepcion/yumbel', label: 'kupos · Conce-Yumbel' },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          La flota combinada de los tres operadores Conce-Florida fue
          declarada por el SEREMI en <strong>~40 buses</strong> en julio
          2024.
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
            Diario Concepción · 27-jul-2024 — Flota combinada 40 buses
          </SourceLink>
        </Sources>
      </Section>

      <Section title="La fragmentación regulatoria">
        <p>
          La declaración clave para entender este corredor la hizo el
          SEREMI de Transportes <strong>Héctor Silva</strong> en julio 2024:
        </p>
        <blockquote className="border-l-2 border-muted-foreground/30 bg-muted/30 px-3 py-2 text-[13px] italic text-muted-foreground">
          "La regulación es muy genérica y no nos permite obligar a los
          operadores a cumplir ciertas frecuencias."
        </blockquote>
        <p>
          En la práctica: los servicios privados rural-interurbanos a
          Florida <strong>no pueden ser obligados</strong> por el MTT a
          subir frecuencia o cobertura. La única vía es{' '}
          <strong>licitar un contrato de conectividad rural subsidiado</strong>{' '}
          — exactamente lo que se hizo en Santa Juana con la 201 (DTPR
          ELC0007) y lo que empezó a hacerse en Florida a partir de 2025
          por <em>tramos</em> rurales (no por la troncal Florida ↔
          Concepción).
        </p>
        <p>
          La ministra/seremi reemplazante <strong>Patricio Fierro</strong>{' '}
          (nombrado en enero 2025) confirmó el mismo diagnóstico en marzo
          2025 al anunciar el servicio nocturno y los subsidiados de
          Rahuil y Poñén-Roa.
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
            Diario Concepción · 27-jul-2024 — Declaración Héctor Silva
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html">
            Diario Concepción · 10-ene-2025 — Nombramiento Patricio Fierro
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html">
            Diario Concepción · 28-mar-2025 — Servicio nocturno y subsidiados rurales
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Servicios subsidiados nuevos (2025)">
        <p>
          A diferencia de Santa Juana, donde un solo decreto reemplazó al
          operador privado, en Florida el MTT eligió{' '}
          <strong>sumar capas subsidiadas a los tramos rurales más
          débiles</strong> sin tocar (todavía) la troncal Florida ↔
          Concepción que sigue en manos privadas. Tres contratos
          confirmados al cierre de 2025:
        </p>
        <div className="space-y-2">
          <div className="rounded-md border bg-card p-3">
            <div className="text-[12px] font-medium">
              Servicio rural zona norte de Florida (inaugurado oct 2025)
            </div>
            <KeyValueList
              items={[
                ['Tipo', 'Contrato de Transporte Aislado'],
                ['Servicios', '10 a la semana, lunes a viernes + festivos'],
                ['Tarifa', '$400 a $1.500 según destino'],
                ['Inversión', '$63.720.000'],
                ['Plazo', '36 meses'],
                ['Financia', 'Ministerio de Transportes y Telecomunicaciones'],
                ['Inauguración formal', 'Fines de octubre 2025 (servicio ya operativo antes)'],
                ['Localidades', 'Decena de localidades zona norte (lista exacta no publicada por la municipalidad)'],
                ['Operador', 'No publicado en fuente abierta'],
              ]}
            />
            <Sources>
              <SourceLink href="https://muniflorida.cl/florida-cuenta-con-nuevo-servicio-de-transporte-rural/">
                Municipalidad de Florida · "Florida cuenta con nuevo servicio de transporte rural"
              </SourceLink>
              <SourceLink href="https://www.soychile.cl/concepcion/sociedad/2025/10/31/927147/transprote-publico-rural-biobio.html">
                Soychile · 31-oct-2025 — Confirma "decena de localidades de la zona norte"
              </SourceLink>
            </Sources>
          </div>
          <div className="rounded-md border bg-card p-3">
            <div className="text-[12px] font-medium">
              Servicio rural Rahuil ↔ Florida urbano (abr 2025)
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Anunciado para inicio de operaciones a fines de abril 2025 o
              antes. Mejora la conectividad de Rahuil con el centro de
              Florida (no llega a Concepción directo). Operador y decreto
              no publicados.
            </p>
            <Sources>
              <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html">
                Diario Concepción · 28-mar-2025
              </SourceLink>
            </Sources>
          </div>
          <div className="rounded-md border bg-card p-3">
            <div className="text-[12px] font-medium">
              Servicio subsidiado Poñén-Roa, martes y jueves (2025)
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Cobertura limitada (dos días/semana, mañana y tarde). Es
              ejemplo del modelo DTPR de "conectividad rural" que sólo
              busca <em>existir</em> en sectores donde no había bus.
            </p>
            <Sources>
              <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html">
                Diario Concepción · 28-mar-2025
              </SourceLink>
            </Sources>
          </div>
          <div className="rounded-md border bg-card p-3">
            <div className="text-[12px] font-medium">
              Servicio nocturno Concepción ↔ Florida (abr 2025)
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Salidas declaradas <strong>18:30 y 22:30 hrs</strong>. El
              alcalde de Florida{' '}
              <strong>Rodrigo Montero</strong> anticipó que "en mayo
              debería comenzar a operar un servicio subvencionado cuya
              licitación ya fue cerrada". El seremi Fierro habló de
              "acelerar todos los procesos para reponer el servicio a la
              brevedad". Operador exacto y decreto: no publicados.
            </p>
            <Sources>
              <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html">
                Diario Concepción · 28-mar-2025
              </SourceLink>
            </Sources>
          </div>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Contexto regional:{' '}
          <SourceLink href="https://www.soychile.cl/concepcion/sociedad/2025/10/31/927147/transprote-publico-rural-biobio.html">
            Biobío tiene 29 servicios subvencionados de transporte público
            rural al cierre de octubre 2025
          </SourceLink>{' '}
          — los más recientes son Quilleco (oct) y Florida zona norte (oct).
        </p>
      </Section>

      <Section title="Demanda y estacionalidad">
        <KeyValueList
          items={[
            [
              'Florida',
              <>
                ~10.624 hab. comunales (Censo 2017), 60,19% rural. Sin
                Biotrén; depende 100% del corredor. El alcalde y la
                Asociación de Municipalidades del Biobío han presionado
                desde 2024 por aumento de frecuencia y cámaras.
              </>,
            ],
            [
              'Yumbel',
              <>
                ~21.198 hab. (Censo 2017). La Fiesta de{' '}
                <strong>San Sebastián</strong> el <strong>20 de enero</strong>{' '}
                y el <strong>20 de marzo</strong> moviliza una estimación
                de <strong>250.000 a 350.000 peregrinos</strong> por
                evento (no validado por INE, citado por prensa y
                literatura UBB).
              </>,
            ],
            [
              'Copiulemu y zona oriente Florida',
              'Localidad mayor de Florida después del casco urbano. Acceso por camino rural en proceso de pavimentación 2024-.',
            ],
            [
              'Estacionalidad',
              'Verano alto (turismo rural de Florida y Quillón), peaks de peregrinación a Yumbel (ene/mar), retorno escolar (marzo), Fiestas Patrias.',
            ],
            [
              'Pico de demanda diaria',
              'Hora punta AM hacia Concepción y PM hacia Florida — el SEREMI confirmó que la flota privada acopla bien al pico laboral, pero colapsa en frecuencia fines de semana y festivos.',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Florida_(Chile)">
            Wikipedia · Florida (Chile) — Población y composición rural-urbana
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Yumbel">
            Wikipedia · Yumbel — Cifra de peregrinos San Sebastián
          </SourceLink>
          <SourceLink href="https://revistas.ubiobio.cl/index.php/TYE/article/download/4863/4398?inline=1">
            UBB · Análisis histórico de la peregrinación a Yumbel
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
            Diario Concepción · jul-2024 — Frecuencia colapsa fines de semana
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Integración intermodal (en Concepción)">
        <p>
          Los buses del corredor "aterrizan" en el centro de Concepción en
          tres puntos distintos según el operador, y <strong>no</strong>{' '}
          tienen un único terminal:
        </p>
        <p className="text-[12px]">
          <MapLink terminal="osm-way-114474600">
            Terminal Camilo Henríquez en el mapa →
          </MapLink>
          {' · '}
          <MapLink terminal="osm-way-597586612">
            Terminal Collao en el mapa →
          </MapLink>
        </p>
        <KeyValueList
          items={[
            [
              'Paradero Colo-Colo / Av. Los Carrera',
              'Punto histórico del recorrido Conce-Florida. Está en plena ciudad, no es terminal cerrado: los buses paran en la calzada. SEREMI mencionó "fiscalización municipal" como medida pendiente.',
            ],
            [
              'Terminal Camilo Henríquez',
              'Camilo Henríquez 2565. Origen de larga distancia (Delsal, Buses Bío Bío, Línea Azul a Chillán). El interurbano hacia Yumbel sale desde aquí según Busbud.',
            ],
            [
              'Terminal Collao',
              'Tegualda 860. Servicios de paso Santiago-Concepción que venden Conce-Yumbel.',
            ],
            [
              'Conexión con Biotrén / GTFS urbano',
              'NINGUNA directa documentada. El corredor no enchufa con el Biotrén (que va por la costa, no por el interior) ni está en el feed GTFS Gran Concepción que alimenta el visor principal.',
            ],
            [
              'App Red Regional de Movilidad',
              'Los servicios privados Conce-Florida no aparecen en la app (a diferencia del 201 Santa Juana que sí está). Acuerdo de incorporarlos: comprometido en julio 2024, no verificado al cierre de 2025.',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.busbud.com/en/terminal-camilo-henriquez-de-concepcion/s/22354">
            Busbud · Terminal Camilo Henríquez (dirección)
          </SourceLink>
          <SourceLink href="https://www.concepcionchile.cl/terminal-buses-concepcion-chile.php">
            Terminal Collao (Tegualda 860)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
            Diario Concepción · Acuerdo Red de Movilidad + fiscalización en Colo-Colo
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Comparación con la licitación 201 Santa Juana">
        <p>
          La 201 (Santa Juana) y los servicios subsidiados de Florida son
          la misma <em>familia</em> de instrumento (subsidio MTT a
          conectividad rural) pero con configuraciones muy distintas:
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">201 Santa Juana</th>
                <th className="px-3 py-2 font-medium">Corredor El Pimentón (Florida)</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Instrumento</td>
                <td className="px-3 py-2">Licitación pública DTPR ELC0007, decreto MTT 93/2023</td>
                <td className="px-3 py-2">Contrato de Transporte Aislado (zona norte) + servicios subsidiados puntuales</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Alcance</td>
                <td className="px-3 py-2">Reemplaza el operador privado existente con flota nueva</td>
                <td className="px-3 py-2">Suma capas a tramos rurales débiles; troncal Florida-Conce sigue privada</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Flota</td>
                <td className="px-3 py-2">23 buses nuevos Agrale Euro V (17 + 6 AU)</td>
                <td className="px-3 py-2">No publicada (servicio nuevo zona norte: cantidad no informada)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tarifa adulto</td>
                <td className="px-3 py-2">$1.000 fijo</td>
                <td className="px-3 py-2">$400-$1.500 según destino (zona norte); privados Conce-Florida ≈ $1.700-$2.500</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Frecuencia</td>
                <td className="px-3 py-2">Hasta 10 buses/h en punta, ventana 05:30-23:45</td>
                <td className="px-3 py-2">Servicios privados frecuencia alta laboral / baja fin de semana; subsidiados ≤10 servicios semanales</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Trazado de la cuesta</td>
                <td className="px-3 py-2">Ruta 156 (Madera) por la costa, NO cruza El Pimentón</td>
                <td className="px-3 py-2">Sube por la Cordillera de la Costa interior (cuesta colloquialmente llamada El Pimentón)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Pago electrónico</td>
                <td className="px-3 py-2">Incluido en perímetro Buspay 2026</td>
                <td className="px-3 py-2">Florida + Yumbel <strong>no</strong> están en el perímetro inicial Buspay</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">App Red Movilidad</td>
                <td className="px-3 py-2">Sí, código "201"</td>
                <td className="px-3 py-2">No (acuerdo julio 2024 no verificado)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          La hipótesis editorial: Florida es más complejo porque hay{' '}
          <em>cuatro operadores privados</em> ya instalados con flota y
          paraderos, lo que obliga al MTT a una transición fragmentada en
          vez de un reemplazo limpio como en Santa Juana.
        </p>
      </Section>

      <Section title="Tarifas (rangos observados)">
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Servicio</th>
                <th className="px-3 py-2 font-medium">Tarifa adulto</th>
                <th className="px-3 py-2 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 font-medium">Conce ↔ Florida privado</td>
                <td className="px-3 py-2 font-mono">Pendiente cita</td>
                <td className="px-3 py-2 text-muted-foreground">Rangos $1.700-$2.500 reportados por usuarios; sin tabla oficial publicada por los operadores en 2025</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Florida zona norte (subsidiado)</td>
                <td className="px-3 py-2 font-mono">$400 - $1.500</td>
                <td className="px-3 py-2 text-muted-foreground">Rango oficial municipal según destino dentro de la zona norte</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Conce ↔ Yumbel privado</td>
                <td className="px-3 py-2 font-mono">$2.000 - $3.500</td>
                <td className="px-3 py-2 text-muted-foreground">Rango Línea Azul / Pullman / Bío Bío citado por agregadores</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">TNE / Adulto mayor / PcD</td>
                <td className="px-3 py-2 font-mono">Variable</td>
                <td className="px-3 py-2 text-muted-foreground">Los servicios privados aplican TNE 33%; gratuidad a adultos mayores y PcD <strong>sólo</strong> aplica obligatoriamente en servicios subsidiados (Santa Juana sí; troncal Florida no garantizado)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <PendingBanner>
          <strong>Pendiente:</strong> tabla tarifaria oficial 2025-2026 de
          los tres operadores Conce-Florida y de las empresas Yumbel.
          Fuente que falta: ordenanza tarifaria municipal o publicación
          directa de las empresas (no encontrada al cierre).
        </PendingBanner>
      </Section>

      <Section title="Línea de tiempo del corredor">
        <Timeline
          items={[
            {
              date: 'Finales s. XVIII',
              event: 'El gobernador Ambrosio O\'Higgins ordena el primer camino Concepción-Florida para transportar granos, cereales y vino desde el interior.',
              source: {
                href: 'https://www.archivohistoricoconcepcion.cl/minisitios/monografias-regionales/los_siete_puentes_a_florida/',
                label: 'Archivo Histórico Concepción',
              },
            },
            {
              date: '1920-1930',
              event: 'Domingo Arteaga construye los siete puentes que aún hoy estructuran la Ruta 148 sobre el río Andalién. Diseño doble vía con barandas bajas en hormigón.',
              source: {
                href: 'https://www.saladeprensa.cl/la-historia-de-los-7-puentes-camino-a-florida/',
                label: 'Sala de Prensa',
              },
            },
            {
              date: '12-dic-2019',
              event: 'Seremi MOP Biobío inaugura el enlace Florida con la Ruta del Itata. Acorta 30 min el viaje a Concepción.',
              source: {
                href: 'https://biobio.mop.gob.cl/vecinos-de-florida-ya-pueden-usar-ruta-del-itata-para-llegar-a-concepcion/',
                label: 'MOP Biobío',
              },
            },
            {
              date: '14-mar-2024',
              event: 'Pelea pública entre conductores de Biocosta y Los Libertadores en paradero Colo-Colo/Los Carrera. Pasajeros graban. Causa: competencia por captación de pasajeros.',
              source: {
                href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml',
                label: 'BioBioChile',
              },
            },
            {
              date: 'Jul-2024',
              event: 'Crimen de Daniela Olate gatilla discusión pública sobre seguridad nocturna en el corredor. Autoridades reconocen falencias de regulación.',
              source: {
                href: 'https://sabes.cl/2024/07/23/transporte-publico-rural-entre-florida-y-concepcion-uno-de-los-tema-de-fondo-en-el-crimen-de-daniela-olate/',
                label: 'Sabes.cl',
              },
            },
            {
              date: '27-jul-2024',
              event: 'SEREMI Héctor Silva: "La regulación no nos permite obligar a los operadores a cumplir ciertas frecuencias". Mesa con 4 operadores (40 buses).',
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: '5-sep-2024',
              event: 'MOP anuncia pavimentación de rutas O-540 (Florida-San Antonio de Dadi) y Q-560 (Ruta 148-Peleco-Cancha Los Monteros) por más de $3.000 millones.',
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/09/05/florida-pavimentaran-conexion-con-copiulemu-por-mas-de-3-mil-millones.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: '10-ene-2025',
              event: 'Patricio Fierro asume como nuevo SEREMI de Transportes de Biobío.',
              source: {
                href: 'https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: '28-mar-2025',
              event: 'Se anuncia servicio nocturno Concepción-Florida (18:30 y 22:30 hrs) para abril, servicio rural Rahuil-Florida y servicio Poñén-Roa martes/jueves.',
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: 'Oct-2025',
              event: 'Florida inaugura servicio rural subsidiado a 10 localidades de la zona norte: 10 viajes/semana, tarifa $400-$1.500, $63.720.000 a 36 meses.',
              source: {
                href: 'https://muniflorida.cl/florida-cuenta-con-nuevo-servicio-de-transporte-rural/',
                label: 'Municipalidad de Florida',
              },
            },
            {
              date: '31-oct-2025',
              event: 'Biobío llega a 29 servicios subvencionados de transporte público rural — los más recientes Quilleco y Florida zona norte.',
              source: {
                href: 'https://www.soychile.cl/concepcion/sociedad/2025/10/31/927147/transprote-publico-rural-biobio.html',
                label: 'Soychile',
              },
            },
          ]}
        />
      </Section>

      <Section title="Nota sobre el topónimo &quot;El Pimentón&quot;">
        <PendingBanner>
          <strong>El nombre &quot;El Pimentón&quot; no aparece en
          cartografía oficial.</strong> Búsqueda directa en{' '}
          <SourceLink href="https://nominatim.openstreetmap.org/search?q=Pimenton&countrycodes=cl&format=json">
            Nominatim/OpenStreetMap (Chile)
          </SourceLink>{' '}
          devuelve sólo resultados en la Región de Valparaíso (Quebrada del
          Pimentón en San Esteban, Mina Pimentón) y un restaurante en
          Valparaíso ciudad. <strong>Ningún feature con ese nombre en la
          Región del Biobío.</strong>
        </PendingBanner>
        <p>
          Hipótesis editorial: <em>"El Pimentón"</em> es probablemente un
          nombre <strong>colloquial-popular</strong> que conductores y
          usuarios del corredor le dan a la cuesta de la Cordillera de la
          Costa entre Concepción y Florida — del mismo modo que <em>"La
          Cuesta del Litre"</em> o <em>"La Cuesta de Las Raíces"</em> en
          otras regiones nacen del habla local antes de pasar (a veces) a
          cartografía. Las monografías históricas consultadas (Archivo
          Histórico de Concepción sobre los 7 puentes, Sala de Prensa,
          municipalidad de Hualqui) <strong>no</strong> mencionan el
          topónimo. Tampoco lo hacen las notas del MOP sobre la Ruta del
          Itata ni los planes DTPR.
        </p>
        <p>
          Tratamiento que hace este wiki: usamos <em>"corredor de El
          Pimentón"</em> como nombre <strong>editorial paraguas</strong>{' '}
          que identifica el corredor interurbano sur-oriente Concepción ↔
          Florida (con extensiones a Yumbel y rural Hualqui) y dejamos
          marcada esta nota para que cualquier corrección o documento
          oficial nuevo pueda reasignar el rótulo.
        </p>
        <Sources>
          <SourceLink href="https://nominatim.openstreetmap.org/search?q=Pimenton&countrycodes=cl&format=json&limit=10">
            Nominatim · Búsqueda "Pimenton" en Chile
          </SourceLink>
          <SourceLink href="https://www.bibliotecanacionaldigital.gob.cl/bnd/631/w3-article-334555.html">
            Biblioteca Nacional Digital · Hoja IGM "Florida" (Concepción/Ñuble)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Datos pendientes de verificación">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Razón social y RUT exactos de Nueva Libertadores, Biocosta y Trinidad.</li>
          <li>Tabla horaria oficial 2025-2026 de los servicios privados Conce-Florida.</li>
          <li>Operador y decreto del servicio subsidiado nocturno Conce-Florida (abr 2025).</li>
          <li>Operador y decreto del servicio rural zona norte de Florida (oct 2025).</li>
          <li>Lista completa de las "10 localidades de la zona norte" cubiertas.</li>
          <li>Frecuencia documentada Concepción-Yumbel por operador.</li>
          <li>Cifras de demanda diaria/anual del corredor (no hay encuesta O/D pública 2020+).</li>
          <li>Kilometraje exacto y pendiente máxima de la cuesta entre Concepción y Florida.</li>
          <li>Si Buspay incluirá eventualmente Florida y Yumbel en alguna fase posterior.</li>
          <li>Confirmar o refutar el topónimo "El Pimentón" con fuente IGM, municipal o comunitaria.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Para cerrar estos huecos: solicitar a DTPR Biobío vía Ley de
          Transparencia los contratos vigentes en la comuna de Florida,
          consultar el padrón RNTPP por las razones sociales de los cuatro
          operadores, y revisar las hojas IGM 1:50.000 Florida y Concepción
          buscando la denominación.
        </p>
      </Section>

      <Section title="Bibliografía">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
              Diario Concepción · 27-jul-2024 — Transportes no puede obligar a buses a Florida
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html">
              Diario Concepción · 28-mar-2025 — Nuevo recorrido nocturno
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/09/05/florida-pavimentaran-conexion-con-copiulemu-por-mas-de-3-mil-millones.html">
              Diario Concepción · 5-sep-2024 — Pavimentación Florida-Copiulemu
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html">
              Diario Concepción · 10-ene-2025 — Nuevo SEREMI Patricio Fierro
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml">
              BioBioChile · 14-mar-2024 — Violencia entre conductores
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://muniflorida.cl/florida-cuenta-con-nuevo-servicio-de-transporte-rural/">
              Municipalidad de Florida · Nuevo servicio rural zona norte
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.soychile.cl/concepcion/sociedad/2025/10/31/927147/transprote-publico-rural-biobio.html">
              Soychile · 31-oct-2025 — 29 servicios subvencionados en Biobío
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://biobio.mop.gob.cl/vecinos-de-florida-ya-pueden-usar-ruta-del-itata-para-llegar-a-concepcion/">
              MOP Biobío · 12-dic-2019 — Enlace Florida ↔ Ruta del Itata
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.archivohistoricoconcepcion.cl/minisitios/monografias-regionales/los_siete_puentes_a_florida/">
              Archivo Histórico Concepción · Los 7 puentes a Florida
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Florida_(Chile)">
              Wikipedia · Florida (Chile)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Yumbel">
              Wikipedia · Yumbel
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://revistas.ubiobio.cl/index.php/TYE/article/download/4863/4398?inline=1">
              Universidad del Biobío · Estudio histórico San Sebastián de Yumbel
            </SourceLink>
          </li>
        </ul>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si conoces el operador del nocturno Conce-Florida, los horarios
          reales que rigen en 2026, o tienes una hoja IGM/municipal que
          mencione "El Pimentón" como topónimo formal — abre un pull
          request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/corredor-el-pimenton.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/corredor-el-pimenton.tsx
          </SourceLink>
          . Toda contribución se cita en el commit.
        </p>
      </Section>
    </div>
  );
}
