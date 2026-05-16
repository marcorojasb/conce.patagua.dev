// Concepción ↔ Yumbel — corredor interurbano del valle central.
//
// Yumbel es el último nodo del valle central-cordillera que pendía del
// índice de corredores interurbanos del wiki, junto con Tomé (norte) y
// Florida (sur-oriente). Eje vial principal: Ruta 146 ("Autopista Valles
// del Biobío", Concepción ↔ Cabrero, ex Q-50-O) — NO confundir con Ruta
// O-60 / Q-60-O Hualqui-Yumbel-Rere que es la ruta interior.
//
// El corredor lo sostienen cuatro operadores privados de larga distancia
// (Línea Azul, Buses Bío Bío, Pullman Bus, Pullman Santa María); no hay
// licitación DTPR específica para Concepción-Yumbel al cierre de 2025,
// pero sí servicios subsidiados rurales puntuales en el entorno (Ruta 1
// CTR0224 La Mata-Monte Águila-Cabrero). El evento que distingue al
// corredor de los demás del wiki es la Fiesta de San Sebastián de Yumbel
// (20-ene y 20-mar), que mueve 250-350 mil peregrinos por jornada.

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

export default function ConcepcionYumbel() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong>{' '}
        Vialidad oficial (Ruta 146 ex Q-50-O · decreto MOP N°179 del
        9-abr-2013, concesión Sacyr Valles del Biobío con peaje troncal
        Huinanco en Yumbel km 33,9), población de Yumbel (21.198 hab.
        Censo 2017 BCN), peregrinación San Sebastián (estimaciones
        prensa-Wikipedia 250-350 mil por jornada, 400 carabineros 2025),
        existencia de Línea Azul (1964) y Buses Bío Bío (1960), conflicto
        municipal con Pullman Bus (resuelto en enero 2024) y servicio
        rural subsidiado CTR0224 La Mata-Monte Águila-Cabrero (decreto
        N°5863/2025): todo con fuente. <strong>Pendientes</strong>:
        tarifas adulto 2026 exactas por operador, tabla horaria oficial,
        razón social/RUT de cada operador, decreto MTT específico para
        Conce-Yumbel (no existe licitación DTPR del corredor).
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          El corredor <strong>Concepción ↔ Yumbel</strong> es la
          conexión interurbana del Gran Concepción con la primera comuna
          del <strong>valle central</strong> hacia el oriente —{' '}
          <strong>Yumbel</strong> (21.198 hab. Censo 2017, 765,25 km²)
          — y, como tal, también es el eje natural de salida hacia la
          Ruta 5 Sur por <strong>Cabrero</strong> y la conexión con la
          provincia de Ñuble. Lo recorre la <strong>Ruta 146</strong>{' '}
          (Autopista Valles del Biobío), concesionada y operada por
          Sociedad Concesionaria Valles del Biobío S.A. (grupo Sacyr)
          desde 2012.
        </p>
        <p>
          Tres rasgos lo distinguen de los otros corredores del wiki:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Régimen privado puro.</strong> A diferencia de la 201
            Santa Juana (licitación DTPR ELC0007) o el corredor Tomé
            (perímetro de exclusión propio), Concepción-Yumbel{' '}
            <strong>no tiene</strong> contrato MTT específico. Lo
            cubren operadores interurbanos de larga distancia (Línea
            Azul, Buses Bío Bío, Pullman) que pasan camino a Chillán o
            Los Ángeles y venden el tramo corto.
          </li>
          <li>
            <strong>Eje turístico-religioso anual.</strong> La{' '}
            <strong>Fiesta de San Sebastián de Yumbel</strong> el{' '}
            <strong>20 de enero</strong> y el <strong>20 de marzo</strong>{' '}
            convierte un corredor de baja demanda regular en uno de los
            mayores movimientos peregrinos del sur de Chile: <em>"más
            de doscientos cincuenta mil personas en enero, y trescientos
            cincuenta mil en marzo"</em>, según la enciclopedia abierta
            que recoge prensa regional histórica. La festividad de enero
            2025 desplegó <strong>400 carabineros</strong> en operativos
            de control en la comuna.
          </li>
          <li>
            <strong>Eje histórico de descarga del valle central.</strong>{' '}
            Yumbel fue fundado como Fuerte San Felipe de Austria en 1585
            y consolidado como nodo del eje granero / vitivinícola del
            valle del Itata hacia Concepción. El cierre de la fase
            obrera del ferrocarril del FCAB (estación Yumbel) dejó al
            bus como conexión única; la concesión 2012-2016 de la Ruta
            146 lo modernizó pero no lo licitó.
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8313">
            BCN · Reporte comunal Yumbel 2017 — 21.198 hab., 765,25 km²
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Yumbel">
            Wikipedia · Yumbel (Chile) — fundación 1585, San Sebastián, vialidad
          </SourceLink>
          <SourceLink href="https://www.latribuna.cl/nuestra-gente/2025/01/20/tierra-de-fe-y-devocion-yumbel-recibe-a-miles-de-peregrinos-en-conmemoracion-de-san-sebastian.html">
            La Tribuna · 20-ene-2025 — Festividad San Sebastián 2025, 400 carabineros
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Historia">
        <p>
          Yumbel es uno de los asentamientos más antiguos del centro-sur
          de Chile. Fundado el 8 de mayo de <strong>1585</strong> por el
          gobernador <strong>Alonso de Sotomayor</strong> como{' '}
          <em>Fuerte San Felipe de Austria</em>, fue reconstruido
          múltiples veces durante la Guerra de Arauco. Recibió título de{' '}
          <strong>villa</strong> en 1823 y de <strong>ciudad</strong> el{' '}
          <strong>16 de marzo de 1871</strong>.
        </p>
        <p>
          La <strong>festividad de San Sebastián</strong> está
          documentada desde el siglo XVII y la imagen patronal habría
          llegado a la zona en 1663. La peregrinación moderna nace en
          el siglo XIX y se masifica con la apertura del ramal
          ferroviario y, ya en el siglo XX, con la red de buses.
        </p>
        <p>
          El corredor Concepción-Yumbel se estructuró sobre el camino
          histórico Concepción ↔ Cabrero ↔ Ruta 5 (ex Ruta 148, ex Ruta
          O-50), modernizado por el MOP en sucesivas etapas:
        </p>
        <Timeline
          items={[
            {
              date: '8-may-1585',
              event: 'Alonso de Sotomayor funda el Fuerte San Felipe de Austria (origen de Yumbel) durante la Guerra de Arauco.',
              source: { href: 'https://es.wikipedia.org/wiki/Yumbel', label: 'Wikipedia' },
            },
            {
              date: '16-mar-1871',
              event: 'Yumbel recibe título de ciudad. Para entonces es nodo del valle central agrícola de Concepción.',
              source: { href: 'https://es.wikipedia.org/wiki/Yumbel', label: 'Wikipedia' },
            },
            {
              date: '1960',
              event: 'Carlos Bugmann Spielmann funda Buses Bío Bío en Temuco — uno de los operadores que pasarán a cubrir el corredor Conce-Yumbel.',
              source: { href: 'https://biomex.cl/que-buses-hay-desde-concepcion-hacia-yumbel/', label: 'Biomex' },
            },
            {
              date: '1964',
              event: 'Se funda Buses Línea Azul en Chillán. Operará el eje Chillán-Concepción (que cruza Yumbel) durante décadas.',
              source: { href: 'https://radionuble.cl/v1/2024/07/18/vuelve-linea-azul-flota-retoma-servicio-chillan-concepcion/', label: 'Radio Ñuble' },
            },
            {
              date: '9-abr-2013',
              event: 'Decreto MOP N°179 designa oficialmente como "Ruta 146" al eje Cabrero ↔ Concepción (consolida tramos ex Ruta 148 y ex Q-50-O / O-50). Concepción-Yumbel queda integrado en la nueva ruta nacional.',
              source: { href: 'https://www.openstreetmap.org/relation/6582801', label: 'OSM relation 6582801' },
            },
            {
              date: '24-sep-2012',
              event: 'Inicio de obras de la Autopista Valles del Biobío bajo concesión Sociedad Concesionaria Valles del Biobío S.A. (grupo Sacyr). Conversión a doble vía de 103,4 km.',
              source: { href: 'https://es.wikipedia.org/wiki/Autopista_Valles_del_Biob%C3%ADo', label: 'Wikipedia' },
            },
            {
              date: 'Jun-2016',
              event: 'Doble vía Ruta 146 operativa provisionalmente. Acorta los tiempos de viaje Conce-Yumbel.',
              source: { href: 'https://es.wikipedia.org/wiki/Autopista_Valles_del_Biob%C3%ADo', label: 'Wikipedia' },
            },
            {
              date: 'Ago-2016',
              event: 'Inicio de cobro de peaje en Huinanco (km 33,9 Ruta 146, comuna de Yumbel) y Puentes Negros.',
              source: { href: 'https://peajeschile.com/peaje-huinanco/', label: 'Peajes de Chile' },
            },
            {
              date: 'Ago-2019',
              event: 'Buses Línea Azul cesa operaciones tras accidente en Mostazal (6 fallecidos) y detección de irregularidades. El corredor Conce-Yumbel pierde uno de sus operadores históricos durante casi 5 años.',
              source: { href: 'https://radionuble.cl/v1/2024/07/18/vuelve-linea-azul-flota-retoma-servicio-chillan-concepcion/', label: 'Radio Ñuble' },
            },
            {
              date: '27-dic-2023',
              event: 'Decreto Alcaldicio Yumbel N°2348 ordena la operación local de buses tras pugna municipal-empresa por paraderos.',
              source: { href: 'https://www.latribuna.cl/cronica-ciudadana/2024/01/09/empresa-de-bus-retomara-servicios-en-yumbel-tras-fin-de-pugna-con-municipio.html', label: 'La Tribuna' },
            },
            {
              date: '9-ene-2024',
              event: 'Pullman Bus retoma el servicio Yumbel ↔ Concepción operando desde Terminal San Francisco (Las Heras 595 Yumbel) tras fin de pugna con la municipalidad.',
              source: { href: 'https://www.latribuna.cl/cronica-ciudadana/2024/01/09/empresa-de-bus-retomara-servicios-en-yumbel-tras-fin-de-pugna-con-municipio.html', label: 'La Tribuna' },
            },
            {
              date: 'Jul-2024',
              event: 'Buses Línea Azul retoma operaciones Chillán-Concepción (que cruza Yumbel) tras casi 5 años de cese.',
              source: { href: 'https://radionuble.cl/v1/2024/07/18/vuelve-linea-azul-flota-retoma-servicio-chillan-concepcion/', label: 'Radio Ñuble' },
            },
            {
              date: '20-ene-2025',
              event: 'Festividad San Sebastián 2025: estimación periodística "hasta 500 mil personas" podrían visitar el santuario. 400 carabineros en operativo.',
              source: { href: 'https://www.latribuna.cl/nuestra-gente/2025/01/20/tierra-de-fe-y-devocion-yumbel-recibe-a-miles-de-peregrinos-en-conmemoracion-de-san-sebastian.html', label: 'La Tribuna' },
            },
            {
              date: '24-dic-2025',
              event: 'Decreto Exento N°5863/2025 DTPR adjudica subsidios CTR para conectividad rural en Biobío. Ruta 1: La Mata ↔ Monte Águila ↔ Cabrero (ID CTR0224) toca el entorno de Yumbel pero NO el troncal Conce-Yumbel.',
              source: { href: 'https://apps.dtpr.cl/ConsultaLicitaciones/Descargar?documentoId=22712462', label: 'DTPR · Dec. Ex. 5863/2025' },
            },
            {
              date: '20-abr-2026',
              event: 'Fin de obras MOP Ruta O-60 (Q-60-O) Yumbel-Rere (16,3 km, $7.983 millones, Serviterra Ltda.). Mejora el camino interior alternativo a la Ruta 146 desde Hualqui hacia Yumbel y Rere.',
              source: { href: 'https://www.latribuna.cl/desarrollo/2026/04/17/ruta-o-60-yumbelrere-llega-a-su-fase-final-y-mejora-acceso-a-zona-con-valor-historico-y-turistico-de-biobio.html', label: 'La Tribuna · 17-abr-2026' },
            },
          ]}
        />
      </Section>

      <Section title="Geografía y vialidad">
        <KeyValueList
          items={[
            ['Distancia Concepción → Yumbel', 'Aprox. 68 km por Ruta 146 (Wikipedia / municipalidad de Yumbel)'],
            ['Tiempo en bus', '~1 h a 1 h 30 min según hora del día y paradas intermedias (Cabrero / Monte Águila / Salto del Laja en algunos servicios)'],
            [
              'Eje vial primario',
              <>
                <strong>Ruta 146</strong> "Autopista Valles del Biobío"
                (OSM <code className="font-mono">ref=146</code>, relation
                6582801; oficial Decreto MOP N°179 del 9-abr-2013).
                Designación previa: <strong>Ruta Q-50-O</strong>. Doble
                vía concesionada Concepción ↔ Cabrero ↔ Ruta 5; 72,3 km
                de Ruta 146 + 31,1 km de Ruta O-97-N en Ñuble (total
                concesión 103,4 km).
              </>,
            ],
            [
              'Concesionaria',
              <>
                <strong>Sociedad Concesionaria Valles del Biobío S.A.</strong>{' '}
                (grupo <strong>Sacyr Concesiones</strong>). Obras desde
                24-sep-2012, doble vía operativa jun-2016, peajes operativos
                ago-2016. Peaje troncal <strong>Huinanco</strong> en km 33,9
                Ruta 146, comuna de Yumbel.
              </>,
            ],
            [
              'Ruta alternativa interior',
              <>
                <strong>Ruta Q-60-O</strong> Hualqui ↔ Talcamávida ↔ Rere ↔
                Yumbel (OSM <code className="font-mono">ref=Q-60-O</code>,{' '}
                <code className="font-mono">old_ref=O-60</code>, way
                454984703). Es la ruta histórica interior; tramo Yumbel-Rere
                (16,3 km entre km 18,5 y 34,7) recién terminó obras MOP en
                abril 2026 ($7.983 millones, Serviterra Ltda., 99,05% de
                avance al 10-abr-2026). No la usan los buses interurbanos.
              </>,
            ],
            [
              'Comunas atravesadas (Ruta 146)',
              'Concepción → Florida → Yumbel → Cabrero (y prolongación O-97-N a Yungay/Cholguán)',
            ],
            ['Altitudes', 'Concepción 10-30 m s.n.m. · cuesta de la Cordillera de la Costa interior · Yumbel valle central ~80-100 m s.n.m.'],
            ['Hidrografía cruzada', 'Río Andalién (Concepción), estero Pichaco, río Laja (cerca de Yumbel y Monte Águila)'],
            [
              'Peaje Huinanco',
              'Plaza troncal de la Ruta 146 dentro de la comuna de Yumbel. Marca el punto de inflexión donde el corredor pasa de "metropolitano" a "valle central".',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/relation/6582801">
            OSM relation 6582801 · Ruta 146 (ref=146, decreto MOP 179/2013)
          </SourceLink>
          <SourceLink href="https://www.openstreetmap.org/way/454984703">
            OSM way 454984703 · Ruta Q-60-O (ref=Q-60-O, old_ref=O-60)
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Ruta_146">
            Wikipedia · Ruta 146 (Cabrero ↔ Concepción · ex Q-50-O)
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Autopista_Valles_del_Biob%C3%ADo">
            Wikipedia · Autopista Valles del Biobío (concesión Sacyr)
          </SourceLink>
          <SourceLink href="https://peajeschile.com/peaje-huinanco/">
            Peajes de Chile · Huinanco km 33,9 Ruta 146 (Yumbel)
          </SourceLink>
          <SourceLink href="https://www.latribuna.cl/desarrollo/2026/04/17/ruta-o-60-yumbelrere-llega-a-su-fase-final-y-mejora-acceso-a-zona-con-valor-historico-y-turistico-de-biobio.html">
            La Tribuna · 17-abr-2026 — Ruta O-60 (Q-60-O) Yumbel-Rere fase final
          </SourceLink>
        </Sources>
        <PendingBanner>
          <strong>Nota sobre <em>refs</em>:</strong> dos lecciones del
          wiki (Ruta 156 que no es Ruta 160; Ruta 146 que no es Ruta
          148/O-50). Las redes viales del Biobío fueron renumeradas por
          el MOP en 2013. La <strong>Ruta 146</strong> es la
          designación vigente del eje Concepción-Cabrero (que cruza
          Yumbel); <strong>O-60</strong> y <strong>Q-60-O</strong> son
          la misma vía interior Hualqui-Yumbel (OSM ya migró al ref
          Q-60-O, La Tribuna y el MOP siguen citando "O-60" en prensa
          de obras). Ningún operador interurbano local usa el eje
          O-60/Q-60-O — todos van por la Ruta 146.
        </PendingBanner>
      </Section>

      <Section title="Operadores">
        <p>
          Cuatro operadores privados de larga distancia cubren el
          corredor en distintas frecuencias y vendiendo el tramo corto
          Conce-Yumbel como segmento de rutas troncales mayores. Ningún
          operador es exclusivo Conce-Yumbel — el corredor no tiene
          masa crítica para justificarlo:
        </p>
        <OperatorTable
          rows={[
            {
              name: 'Buses Línea Azul',
              routes: 'Chillán ↔ Concepción (pasa por Yumbel y vende tramo corto)',
              terminal: 'Terminal Camilo Henríquez · Concepción (Camilo Henríquez 2565)',
              notes: (
                <>
                  <p>
                    Empresa fundada en <strong>1964</strong> en Chillán
                    (terminal propio en Av. Brasil 541). Cesó
                    operaciones en <strong>agosto 2019</strong> tras el
                    accidente fatal en Mostazal (6 fallecidos) y
                    detección de irregularidades en flota.{' '}
                    <strong>Retomó servicio el viernes 19 de julio de
                    2024</strong> con pasajes ya disponibles online
                    desde el 18-jul-2024.
                  </p>
                  <p className="mt-1">
                    Flota declarada al regreso: ~32 buses Marcopolo y
                    Busscar con categorías ejecutivo, semi-cama y cama.
                    Opera ~66 rutas en el día (la mayoría larga
                    distancia). Sale a Yumbel desde Terminal Camilo
                    Henríquez en Concepción.
                  </p>
                </>
              ),
              source: { href: 'https://radionuble.cl/v1/2024/07/18/vuelve-linea-azul-flota-retoma-servicio-chillan-concepcion/', label: 'Radio Ñuble · 18-jul-2024' },
            },
            {
              name: 'Buses Bío Bío',
              routes: 'Concepción ↔ Los Ángeles vía Yumbel · servicios a Temuco / Araucanía',
              terminal: 'Terminal Camilo Henríquez · Concepción',
              notes: (
                <>
                  <p>
                    Empresa interurbana fundada el <strong>15-abr-1960</strong>{' '}
                    por <strong>Carlos Bugmann Spielmann</strong> en
                    Temuco. Casa matriz Lautaro 853, Temuco (call center
                    228 227 988; teléfonos pasajes 045-2657877/2657876;
                    sitio busesbiobio.cl).
                  </p>
                  <p className="mt-1">
                    Cubre Biobío y Araucanía. La frecuencia hacia Yumbel
                    está integrada a su eje Concepción-Los Ángeles. Sin
                    GTFS público.
                  </p>
                </>
              ),
              source: { href: 'https://biomex.cl/que-buses-hay-desde-concepcion-hacia-yumbel/', label: 'Biomex · Conce-Yumbel' },
            },
            {
              name: 'Pullman Bus',
              routes: 'Yumbel ↔ Concepción (servicio dedicado al tramo)',
              terminal: 'Terminal Camilo Henríquez · Concepción · sale en Yumbel desde Terminal San Francisco (Las Heras 595)',
              notes: (
                <>
                  <p>
                    Es la única operadora de larga distancia que tiene
                    un servicio puntual <strong>Yumbel ↔ Concepción</strong>{' '}
                    no como tramo de venta, sino como pareja
                    origen-destino. Estuvo suspendido durante 2023 tras
                    un conflicto con la municipalidad de Yumbel, que
                    prohibió las detenciones en el paradero anterior
                    (calle Cruz entre Quezada y Castellón) para{' '}
                    <em>"ordenar el espacio público"</em>.
                  </p>
                  <p className="mt-1">
                    El conflicto se resolvió mediante{' '}
                    <strong>Decreto Alcaldicio N°2348 del 27-dic-2023</strong>{' '}
                    y la empresa retomó operaciones el 9-ene-2024 desde
                    el nuevo punto: <strong>Terminal San Francisco, Las
                    Heras 595, Yumbel</strong>.
                  </p>
                </>
              ),
              source: { href: 'https://www.latribuna.cl/cronica-ciudadana/2024/01/09/empresa-de-bus-retomara-servicios-en-yumbel-tras-fin-de-pugna-con-municipio.html', label: 'La Tribuna · 9-ene-2024' },
            },
            {
              name: 'Pullman Santa María',
              routes: 'Servicios pasantes Santiago ↔ sur que venden Conce-Yumbel',
              terminal: 'Terminal Camilo Henríquez · Concepción',
              notes: (
                <>
                  Operador interurbano de larga distancia. Aparece como
                  alternativa de venta para Conce-Yumbel en agregadores
                  (kupos, recorrido, busbud). No es operador local del
                  corredor.
                </>
              ),
              source: { href: 'https://biomex.cl/que-buses-hay-desde-concepcion-hacia-yumbel/', label: 'Biomex · operadores' },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Otras empresas referidas por agregadores de pasajes (Buses
          Cruz del Sur, Buses Mar y Tierra, Buses Ruta Sur, Eme Bus, Jota
          Be, Rometur) operan servicios de paso que pueden detenerse en
          Yumbel pero no son operadores específicos del corredor corto.
        </p>
        <PendingBanner>
          <strong>Pendiente:</strong> razón social formal, RUT y N°
          RNTPP de cada operador; flota dedicada al corredor (vs. flota
          total); tarifa adulto vigente 2026 por operador; tabla
          horaria oficial lun-vie / sáb / dom / festivos. Vía de
          cierre: ChileAtiende para registros RNTPP, consulta SII por
          nombre comercial, o foto del cartel en cada terminal.
        </PendingBanner>
      </Section>

      <Section title="Peregrinación San Sebastián (eje turístico-religioso)">
        <p>
          La <strong>Fiesta de San Sebastián de Yumbel</strong> es el
          evento que transforma estacionalmente al corredor. Dos
          jornadas al año concentran la peregrinación:
        </p>
        <KeyValueList
          items={[
            ['Fecha principal', '20 de enero (festividad litúrgica de San Sebastián)'],
            ['Fecha secundaria', '20 de marzo (festividad de "el regreso", instaurada por tradición popular post-cuaresmal)'],
            [
              'Estimación de peregrinos por jornada',
              <>
                <strong>250.000</strong> personas en enero y{' '}
                <strong>350.000</strong> en marzo (Wikipedia, cifra
                recogida de prensa regional). La prensa local 2025 citó
                "hasta 500 mil personas" como techo, sin cita primaria
                INE / municipalidad.
              </>,
            ],
            ['Operativo de seguridad 2025', '400 efectivos de Carabineros desplegados en puntos estratégicos de la comuna durante la jornada del 20-ene-2025'],
            ['Misa principal 2025', '09:00 hrs presidida por Mons. Sergio Pérez de Arce, arzobispo de Concepción · Procesión 17:00 hrs · misa 10:30 transmitida por YouTube'],
            [
              'Origen del culto',
              'Imagen patronal en la zona desde ~1663 (segunda mitad del siglo XVII). Santuario actual es Templo Jubilar 2025 designado por la arquidiócesis de Concepción.',
            ],
            ['Contexto religioso 2025', 'Jubileo "Peregrinos de Esperanza" — incremento adicional de afluencia'],
          ]}
        />
        <p>
          <strong>Impacto en el corredor de buses.</strong> Cada jornada
          de peregrinación obliga a los operadores a sumar refuerzos
          (declarados por la prensa como "buses extraordinarios desde
          Concepción, Talcahuano y todo el sur"). No hay cifra oficial
          de buses extraordinarios; la prensa católica reporta arribos
          desde toda la región Biobío y el sur de Chile. La Ruta 146
          recibe flujo de vehículos particulares más allá de su demanda
          regular y se han registrado congestiones puntuales en el
          enlace a Yumbel y en el peaje Huinanco.
        </p>
        <Sources>
          <SourceLink href="https://www.latribuna.cl/nuestra-gente/2025/01/20/tierra-de-fe-y-devocion-yumbel-recibe-a-miles-de-peregrinos-en-conmemoracion-de-san-sebastian.html">
            La Tribuna · 20-ene-2025 — Yumbel recibe peregrinos, 400 carabineros
          </SourceLink>
          <SourceLink href="https://iglesiadeconcepcion.cl/noticias/conoce-los-horarios-de-la-festividad-de-san-sebastian-de-yumbel-este-20-de-enero/">
            Arzobispado de la Santísima Concepción · Horarios festividad enero
          </SourceLink>
          <SourceLink href="https://iglesiadeconcepcion.cl/noticias/fieles-celebraran-la-festividad-de-san-sebastian-en-yumbel-este-20-de-marzo/">
            Arzobispado · Festividad 20 de marzo
          </SourceLink>
          <SourceLink href="https://www.santuariosansebastian.cl/festividad-enero-2025">
            Santuario San Sebastián · Festividad enero 2025
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Yumbel">
            Wikipedia · cifras de peregrinos (250-350 mil por jornada)
          </SourceLink>
          <SourceLink href="https://revistas.ubiobio.cl/index.php/TYE/article/download/4863/4398?inline=1">
            UBB · Análisis histórico de la peregrinación a Yumbel
          </SourceLink>
        </Sources>
        <PendingBanner>
          <strong>Pendiente:</strong> número de buses extraordinarios
          declarados al MTT en cada jornada de peregrinación, plan de
          contingencia formal MOP-SEREMI-Carabineros, cifras oficiales
          de aforo del santuario (¿INE? ¿municipalidad?). Las cifras
          de prensa varían entre 250 mil y 500 mil sin metodología
          publicada.
        </PendingBanner>
      </Section>

      <Section title="Tarifas y frecuencias">
        <KeyValueList
          items={[
            [
              'Tarifa adulto (rango observado)',
              <>
                <strong>$2.000 - $3.500</strong> según operador y
                horario (Línea Azul, Buses Bío Bío, Pullman). Rango
                citado por agregadores (Biomex / kupos / recorrido.cl,
                observado 2024-2025); no hay tabla oficial publicada
                por las empresas.
                {/* PENDIENTE: tarifa vigente 2026 sin confirmar oficialmente */}
              </>,
            ],
            ['Frecuencia declarada', 'Cada 30 a 60 min desde temprano en la mañana hasta entrada la noche (Biomex / agregadores)'],
            ['Tiempo de viaje', '~1 h sin congestión · 1 h 30 min en hora punta o jornadas de peregrinación'],
            ['Ventana operativa', 'Aprox. 06:00 - 22:00 (no publicada formalmente por los operadores)'],
            [
              'Pago electrónico',
              <>
                <strong>NO</strong> está en el perímetro BusPay 2026
                (que cubre Gran Concepción + Santa Juana + Tomé).
                Yumbel queda fuera de la primera fase.
              </>,
            ],
            ['TNE / adulto mayor', 'TNE 33% aplicable; gratuidad adulto mayor/PcD NO garantizada (no es servicio subsidiado MTT)'],
            [
              'GTFS público',
              'NO publicado. Ni el feed urbano Gran Concepción ni el feed regional Biobío contienen los servicios Conce-Yumbel.',
            ],
          ]}
        />
        <PendingBanner>
          <strong>Tabla horaria y tarifaria oficial pendiente.</strong>{' '}
          Los rangos citados son agregadores de venta online y no
          carteles oficiales. Cierre posible: foto del cartel en
          Terminal Camilo Henríquez (Concepción), Terminal San
          Francisco (Yumbel, Las Heras 595) o Terminal de Yumbel.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://biomex.cl/que-buses-hay-desde-concepcion-hacia-yumbel/">
            Biomex · Rango $2.000-$3.500 y frecuencia 30-60 min
          </SourceLink>
          <SourceLink href="https://kupos.cl/en/bus/tickets/concepcion/yumbel">
            kupos · Conce-Yumbel — operadores y rangos
          </SourceLink>
          <SourceLink href="https://www.recorrido.cl/en/bus/concepcion/yumbel">
            recorrido.cl · Conce-Yumbel
          </SourceLink>
        </Sources>
      </Section>

      <Section title="¿Hay licitación DTPR específica?">
        <p>
          <strong>No</strong>. Al cierre de 2025, no existe contrato
          MTT específico para el corredor troncal Concepción ↔ Yumbel.
          Lo que sí existe en el entorno geográfico:
        </p>
        <KeyValueList
          items={[
            [
              'Decreto Exento N°5863/2025 DTPR',
              <>
                Adjudicado el <strong>24-dic-2025</strong>. Subsidios
                a la conectividad rural en Biobío por{' '}
                <strong>$11.106.265.700</strong> sobre 21 comunas
                de la región. Yumbel figura entre las 21 comunas
                cubiertas pero como parte de un paquete CTR{' '}
                (Conectividad de Transporte Rural).
              </>,
            ],
            [
              'Ruta 1 · CTR0224',
              'Servicio La Mata ↔ Monte Águila ↔ Cabrero — entorno geográfico de Yumbel (Cabrero está al norte de Yumbel sobre la Ruta 146) pero NO cubre el tramo Conce-Yumbel ni reemplaza a los privados.',
            ],
            [
              'Régimen del corredor troncal',
              'Sigue siendo enteramente privado, sin obligación de frecuencia (mismo problema que Florida — el SEREMI Héctor Silva lo dijo explícito en jul-2024 para Florida; el marco legal aplica igual a Yumbel).',
            ],
            [
              'Perímetro de exclusión',
              'No existe perímetro de exclusión Yumbel-Concepción. Los dos perímetros vigentes en la zona metropolitana son: Gran Concepción (1-ene-2024) y Tomé (10-mar-2022).',
            ],
            [
              'App Red Regional de Movilidad',
              'No tiene los servicios Conce-Yumbel (a diferencia de la 201 Santa Juana, que sí está).',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://apps.dtpr.cl/ConsultaLicitaciones/Descargar?documentoId=22712462">
            DTPR · Decreto Exento N°5863/2025 (subsidios CTR Biobío 2025)
          </SourceLink>
          <SourceLink href="https://www.dtpr.gob.cl/conectividadrural">
            DTPR · Programa de Conectividad Rural — marco legal
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
            Diario Concepción · 27-jul-2024 — SEREMI no puede obligar a privados (aplicable a Yumbel)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Conexiones intermodales">
        <p>
          En Concepción, el corredor aterriza esencialmente en{' '}
          <strong>dos terminales</strong> identificables en el mapa del
          visor; en Yumbel, los servicios paran en dos terminales
          urbanas que no están mapeadas todavía en el dataset del
          visor:
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
              'Terminal Camilo Henríquez (Concepción)',
              <>
                Camilo Henríquez 2565. Es la <strong>cabecera principal</strong>{' '}
                del corredor en Concepción: Línea Azul, Buses Bío Bío,
                Pullman Bus y Pullman Santa María salen desde aquí hacia
                Yumbel (entre otros destinos). Teléfono terminal:
                041-2851626.
              </>,
            ],
            [
              'Terminal Collao (Concepción)',
              'Tegualda 860. Servicios pasantes Santiago ↔ Concepción que pueden venderse como Conce-Yumbel; menos central para este corredor que Camilo Henríquez.',
            ],
            [
              'Terminal San Sebastián de Yumbel',
              'Terminal principal de la ciudad de Yumbel. Hub de la mayoría de los servicios (Línea Azul, Pullman Jota Be, Buses Ruta Sur, Rometur). No mapeado en el dataset OSM del visor todavía.',
            ],
            [
              'Terminal San Francisco (Yumbel)',
              'Las Heras 595, Yumbel. Punto de salida de Pullman Bus desde el 9-ene-2024 tras el conflicto con la municipalidad. También opera Eme Bus / Jota Be según agregadores.',
            ],
            [
              'Biotrén / FFCC',
              <>
                <strong>No hay conexión actual.</strong> El Biotrén
                urbano termina al sur en Coronel y al norte en Lirquén;
                no llega ni a Florida ni a Yumbel. El ramal histórico
                del FCAB pasaba por Yumbel pero hoy es de carga / sin
                servicio de pasajeros.
              </>,
            ],
            [
              'BusPay 2026',
              'NO aplica. El perímetro BusPay 2026 cubre Gran Concepción + Santa Juana + Tomé. Yumbel queda fuera.',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.busbud.com/en/terminal-camilo-henriquez-de-concepcion/s/22354">
            Busbud · Terminal Camilo Henríquez (Camilo Henríquez 2565)
          </SourceLink>
          <SourceLink href="https://www.horariodebuses.cl/terminal-camilo-henriquez-de-concepcion.html">
            horariodebuses.cl · Terminal Camilo Henríquez · operadores
          </SourceLink>
          <SourceLink href="https://www.latribuna.cl/cronica-ciudadana/2024/01/09/empresa-de-bus-retomara-servicios-en-yumbel-tras-fin-de-pugna-con-municipio.html">
            La Tribuna · Terminal San Francisco, Las Heras 595 Yumbel
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura del visor (qué sí, qué no)">
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            ❌ El corredor Concepción ↔ Yumbel NO está en el visor
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            El <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">feed GTFS Gran Concepción</a> que alimenta el visor principal
            cubre el área metropolitana urbana (Concepción, Talcahuano,
            Hualpén, San Pedro, Chiguayante, Penco/Lirquén, Coronel,
            Lota). Una revisión directa del dataset confirma que no
            existe ningún servicio con código que represente el corredor
            a Yumbel — porque los servicios Línea Azul, Buses Bío Bío y
            Pullman son interurbanos privados sin GTFS publicado y no
            existe licitación DTPR específica que obligue a publicar
            uno.
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            ✅ Lo que sí aparece en el visor relacionado con el corredor
          </div>
          <ul className="mt-1 ml-5 list-disc space-y-0.5 text-[12px]">
            <li>
              <strong>Terminal Camilo Henríquez</strong> · cabecera de
              Línea Azul, Buses Bío Bío y Pullman (OSM way 114474600,
              dataset interno <code className="font-mono">terminals.generated.ts</code>).
            </li>
            <li>
              <strong>Terminal Collao</strong> · servicios pasantes que
              también venden Conce-Yumbel (OSM way 597586612).
            </li>
            <li>
              <strong>Ruta 146</strong> en el basemap OSM como vía
              nacional (no como ruta de bus).
            </li>
          </ul>
          <p className="mt-1 text-[12px] text-muted-foreground">
            <strong>Terminales en Yumbel</strong> (San Sebastián y San
            Francisco) NO están mapeadas todavía en{' '}
            <code className="font-mono">terminals.generated.ts</code>.
            Por eso este artículo no incluye{' '}
            <code>&lt;MapLink terminal=…&gt;</code> apuntando a Yumbel.
          </p>
        </div>
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/way/114474600">
            OSM way 114474600 · Terminal Camilo Henríquez (mapeada)
          </SourceLink>
          <SourceLink href="https://www.openstreetmap.org/way/597586612">
            OSM way 597586612 · Terminal Collao (mapeada)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Issues conocidos">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Peregrinación San Sebastián colapsa el corredor (20-ene y 20-mar)
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              250-350 mil personas concentradas en una jornada
              saturan la Ruta 146, el peaje Huinanco y los terminales
              de Yumbel. No hay plan de contingencia publicado
              MOP-MTT-Carabineros más allá del despliegue de 400
              efectivos.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Régimen privado sin obligación de frecuencia
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Mismo diagnóstico que el SEREMI Héctor Silva hizo para
              Florida en jul-2024: el MTT no puede obligar a
              operadores privados a subir frecuencia. Conce-Yumbel
              comparte el problema y, al no estar entre las prioridades
              de licitación (lo están Santa Juana ✓ y Tomé ✓), seguirá
              así en el corto plazo.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Conflictos municipales por paraderos
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El caso Pullman Bus ↔ municipalidad de Yumbel (suspensión
              2023 → resolución dic-2023 → reanudación ene-2024) muestra
              que la falta de marco regulatorio formal deja la
              operación expuesta a ordenanzas locales caso a caso.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Sin pago electrónico ni BusPay
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Yumbel queda fuera del perímetro BusPay 2026 (que cubre
              Gran Concepción + Santa Juana + Tomé). El usuario paga
              en efectivo a bordo, con TNE 33% como única reducción
              estructural.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Sin GTFS público ni capa OSM bus
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Ninguno de los cuatro operadores publica feed GTFS y no
              hay relaciones OSM <code className="font-mono">route=bus</code>{' '}
              taggeadas con los servicios. La integración nativa al
              visor — como se hizo con la 201 y la 401/411/421 —
              requeriría digitalización manual con riesgo de inventar
              datos.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Vínculos con otros artículos">
        <p>
          Concepción-Yumbel cierra el set de tres corredores
          interurbanos del valle central-cordillera del wiki. Cada uno
          representa un modelo regulatorio distinto:
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Corredor</th>
                <th className="px-3 py-2 font-medium">Eje vial</th>
                <th className="px-3 py-2 font-medium">Régimen</th>
                <th className="px-3 py-2 font-medium">Estado wiki</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">
                  <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
                    201 Santa Juana
                  </a>
                </td>
                <td className="px-3 py-2">Ruta 156 (Ruta de la Madera, costa)</td>
                <td className="px-3 py-2">Licitación DTPR ELC0007</td>
                <td className="px-3 py-2">Integrado al visor</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
                    Concepción ↔ Tomé
                  </a>
                </td>
                <td className="px-3 py-2">Ruta 150 (costa norte)</td>
                <td className="px-3 py-2">Perímetro de exclusión (Tomé 2016/2022)</td>
                <td className="px-3 py-2">Integrado al visor (401/411/421)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
                    Concepción ↔ Florida
                  </a>
                </td>
                <td className="px-3 py-2">Ruta 148 + Ruta del Itata (sur-oriente)</td>
                <td className="px-3 py-2">Privados + capas subsidiadas 2025</td>
                <td className="px-3 py-2">No en visor (sin GTFS)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  <strong>Concepción ↔ Yumbel</strong> (este artículo)
                </td>
                <td className="px-3 py-2"><strong>Ruta 146</strong> (Autopista Valles del Biobío, valle central)</td>
                <td className="px-3 py-2"><strong>Privado puro</strong> (sin licitación específica)</td>
                <td className="px-3 py-2">No en visor (sin GTFS)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Lectura complementaria recomendada: el{' '}
          <a href="/wiki/corredor-el-pimenton" className="underline underline-offset-2">
            corredor de El Pimentón
          </a>{' '}
          (artículo paraguas Concepción ↔ Florida / Yumbel / Hualqui
          rural) describe el contexto sur-oriente cordillerano y trata
          Yumbel como nodo secundario; este artículo lo trata como
          nodo protagonista. La diferencia geográfica clave: el
          Pimentón sube por la Cordillera de la Costa interior y
          desemboca en Florida, mientras que Yumbel se alcanza
          principalmente por el corredor de <strong>valle</strong>{' '}
          (Ruta 146), no por la cuesta. Ver también el{' '}
          <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
            índice de recorridos interurbanos
          </a>{' '}
          y la nota <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">sobre este wiki</a>.
        </p>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Razón social, RUT y N° RNTPP de Línea Azul, Buses Bío Bío, Pullman Bus y Pullman Santa María en el segmento Conce-Yumbel.</li>
          <li>Tarifa adulto vigente 2026 por operador, con fuente directa (cartel o sitio oficial).</li>
          <li>Tabla horaria completa lun-vie / sáb / dom / festivos.</li>
          <li>Plan de contingencia formal MOP-MTT-Carabineros para la peregrinación San Sebastián (20-ene y 20-mar).</li>
          <li>Número de "buses extraordinarios" declarados al MTT cada jornada de peregrinación.</li>
          <li>Cifra oficial de aforo del santuario (¿INE? ¿municipalidad de Yumbel? ¿arquidiócesis?).</li>
          <li>Lista exacta de los servicios CTR de Biobío que tocan Yumbel (decreto 5863/2025).</li>
          <li>Coordenadas y OSM ID de la Terminal San Sebastián de Yumbel y la Terminal San Francisco (Las Heras 595).</li>
          <li>Decreto Alcaldicio N°2348 del 27-dic-2023 (texto completo del acuerdo Pullman ↔ Municipalidad de Yumbel).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a la municipalidad de
          Yumbel (decreto N°2348 y acuerdos con operadores), Ley de
          Transparencia a DTPR Biobío (servicios CTR vigentes en
          Yumbel), consulta SII por razón social, y foto de cartel en
          cada terminal.
        </p>
      </Section>

      <Section title="Bibliografía">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Yumbel">
              Wikipedia · Yumbel (Chile)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8313">
              BCN · Reporte comunal Yumbel 2017 — 21.198 hab.
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Ruta_146">
              Wikipedia · Ruta 146 (Cabrero ↔ Concepción · ex Q-50-O)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Autopista_Valles_del_Biob%C3%ADo">
              Wikipedia · Autopista Valles del Biobío (concesión Sacyr)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/6582801">
              OSM relation 6582801 · Ruta 146
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/way/454984703">
              OSM way 454984703 · Ruta Q-60-O (ex O-60)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://concesiones.mop.gob.cl/project/concesion-autopista-concepcion-cabrero/">
              MOP Concesiones · Autopista Concepción-Cabrero
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://peajeschile.com/peaje-huinanco/">
              Peajes de Chile · Huinanco km 33,9 Ruta 146 (Yumbel)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.latribuna.cl/desarrollo/2026/04/17/ruta-o-60-yumbelrere-llega-a-su-fase-final-y-mejora-acceso-a-zona-con-valor-historico-y-turistico-de-biobio.html">
              La Tribuna · 17-abr-2026 — Ruta O-60 Yumbel-Rere
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.latribuna.cl/nuestra-gente/2025/01/20/tierra-de-fe-y-devocion-yumbel-recibe-a-miles-de-peregrinos-en-conmemoracion-de-san-sebastian.html">
              La Tribuna · 20-ene-2025 — Festividad San Sebastián 2025
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://iglesiadeconcepcion.cl/noticias/conoce-los-horarios-de-la-festividad-de-san-sebastian-de-yumbel-este-20-de-enero/">
              Arzobispado de la Santísima Concepción · Festividad enero
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.santuariosansebastian.cl/festividad-enero-2025">
              Santuario San Sebastián · Festividad enero 2025
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://radionuble.cl/v1/2024/07/18/vuelve-linea-azul-flota-retoma-servicio-chillan-concepcion/">
              Radio Ñuble · 18-jul-2024 — Línea Azul retoma servicio
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.latribuna.cl/cronica-ciudadana/2024/01/09/empresa-de-bus-retomara-servicios-en-yumbel-tras-fin-de-pugna-con-municipio.html">
              La Tribuna · 9-ene-2024 — Pullman Bus retoma Yumbel-Concepción
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.busbud.com/en/terminal-camilo-henriquez-de-concepcion/s/22354">
              Busbud · Terminal Camilo Henríquez
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://biomex.cl/que-buses-hay-desde-concepcion-hacia-yumbel/">
              Biomex · Operadores Concepción-Yumbel
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://apps.dtpr.cl/ConsultaLicitaciones/Descargar?documentoId=22712462">
              DTPR · Decreto Exento N°5863/2025 (CTR Biobío)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.dtpr.gob.cl/conectividadrural">
              DTPR · Programa Conectividad Rural
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://revistas.ubiobio.cl/index.php/TYE/article/download/4863/4398?inline=1">
              UBB · Estudio histórico San Sebastián de Yumbel
            </SourceLink>
          </li>
        </ul>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes la tabla horaria oficial de Línea Azul, Buses Bío
          Bío, Pullman Bus o Pullman Santa María para Conce-Yumbel,
          fotos de los carteles tarifarios en cualquiera de los
          terminales (Camilo Henríquez en Concepción, San Sebastián o
          San Francisco en Yumbel), el texto del Decreto Alcaldicio
          N°2348 de Yumbel, o el plan de contingencia oficial para la
          festividad San Sebastián — abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-yumbel.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-yumbel.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
