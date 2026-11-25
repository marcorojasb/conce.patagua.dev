// Las micros urbanas del Gran Concepción: qué son, cómo se nombran y cómo se ven en el visor.
// Datos de la red: GTFS oficial DTPR «Gran Concepción20250228» (ver `gtfs-gran-concepcion`),
// ejemplos de letreros leídos de src/data/gtfs-bus-routes.generated.ts.
// Zonas y empresas: Wikipedia (Perímetro de Exclusión), que cita la Res. Ex. DTPR 2166/2023
// (el PDF original respondió 404 al verificarlo).

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  PendingBanner,
  Section,
  ServiceCode,
  SourceLink,
  VerifiedBanner,
} from './_components';
import { MapLink } from '@/wiki/map-link';

const LINK = 'underline underline-offset-2';
const WIKI_PE = 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n';

const ZONES: Array<[string, string, string]> = [
  ['Chiguayante', '10–17', '10 Vía Láctea · 11 Vía Futuro · 12 Sotrapel · 13 Vía Siglo XXI · 14 Chiguayante Sur · 16 Vía Universo · 17 Expresos Chiguayante'],
  ['Hualqui', '18, 80–81', '18 Buses Palomares · 80 Las Galaxias · 81 Vía del Sol'],
  ['San Pedro de la Paz', '20–24', '20 Nueva Llacolén · 21 Riviera Biobío · 22 Buses San Pedro · 23 San Pedro del Mar · 24 San Remo'],
  ['Penco', '30–32', '30 Ruta Las Playas · 31 y 32 Ruta del Mar (dos empresas distintas)'],
  ['Hualpén', '02, 40–44', '02 Hualpensan · 40 Las Golondrinas · 41 Mini Verde · 42 Buses Hualpencillo · 43 Flota Las Lilas · 44 Flota Centauro'],
  ['Talcahuano', '50–56', '50 Buses Campanil (y Denavi Sur) · 52 Géminis Sur · 56 Base Naval'],
  ['Concepción Norte', '60–65', '60 Buses Tucapel · 62 Mi Expreso · 63 Rengo Lientur · 65 Buses Cóndor'],
  ['Concepción Oriente', '70–72', '70 Las Bahías · 71 Buses Puchacay · 72 Pedro de Valdivia'],
  ['Concepción Poniente', '90', '90 Nueva Sol Yet'],
  ['Biobús', 'B0 (B01, B02)', 'Única unidad con micros naranjas; sin letras por sentido'],
];

const EXAMPLES: Array<[string, string, string, string]> = [
  ['10AN', 'Vía Láctea', '10A → Centinela', '10N → Los Bloques'],
  ['14ZU', 'Chiguayante Sur', '14Z → Term. Collao', '14U → Los Altos'],
  ['24MF', 'San Remo', '24M → Los Fresnos', '24F → Candelaria'],
  ['30QE', 'Ruta Las Playas', '30Q → Higueras', '30E → Penco Chico'],
  ['80H', 'Las Galaxias', 'sin sentido 0', '80H → Hualqui'],
  ['B02', 'Biobús', 'B02 → Casino Marina del Sol', 'B02 → Centro Concepción'],
];

export default function MicrosUrbanasGranConcepcion() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado con el feed del visor (25-nov-2026).</strong> Conteos y
        letreros salen del GTFS oficial. La numeración por zona y los nombres de
        empresa vienen de Wikipedia, que cita una resolución DTPR que no pudimos
        abrir: ver los pendientes al final.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Recorridos', value: '102' },
          { label: 'Sentidos', value: '188' },
          { label: 'Paraderos', value: '2.239' },
          { label: 'Feed', value: 'DTPR · Gran Concepción20250228' },
          { label: 'Régimen', value: 'Perímetro de exclusión' },
          { label: 'Tarifa adulto', value: <a href="/wiki/buspay" className={LINK}>$580</a> },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Las micros urbanas son el servicio licitado del{' '}
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className={LINK}>perímetro de exclusión</a>.
          </>,
          <>
            «Línea» es la empresa (una unidad de negocio con su número); el
            recorrido es el <strong>servicio</strong>: número + letra + destino.
          </>,
          <>
            Un código del visor junta los dos sentidos: <MapLink route="10AN">10AN</MapLink>{' '}
            es la 10A (sentido 0) más la 10N (sentido 1).
          </>,
          <>
            El número indica la zona del terminal de la empresa en la licitación de 2002,
            no adónde van sus micros.
          </>,
          <>
            El feed vence el 31-dic-2025 y no trae 11 servicios de 2026. El mapa muestra
            «Horario» (estimación) o «GPS en vivo», nunca las dos a la vez.
          </>,
        ]}
      />

      <Section title="Qué son">
        <p>
          Son las micros del Gran Concepción que operan bajo el régimen de
          perímetro de exclusión, que reemplazó a los taxibuses de la licitación
          de 2002. El marco legal, las olas de incorporación y los plazos están en{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className={LINK}>perímetro de exclusión 2024</a>;
          el subsidio, en{' '}
          <a href="/wiki/subsidio-ley-20378" className={LINK}>Ley 20.378</a>. Se pagan con{' '}
          <a href="/wiki/buspay" className={LINK}>BusPay</a> o en efectivo. Los colectivos son otro servicio:{' '}
          <a href="/wiki/taxis-colectivos-gran-concepcion" className={LINK}>taxis colectivos</a>.
        </p>
      </Section>

      <Section title="Quién las opera y qué número lleva">
        <p>
          El GTFS trae una sola agencia, «DTPR». El nombre de empresa que muestra el
          visor sale del prefijo del letrero. Según Wikipedia (que cita la Res. Ex.
          DTPR 2166/2023), cada empresa lleva el número de la zona donde tenía su
          terminal en 2002. Concepción Centro y Concepción Sur son solo zonas de
          destino, sin terminal.
        </p>
        <DataTable columns={['Zona del terminal', 'Números', 'Empresas']}>
          {ZONES.map(([zone, range, companies]) => (
            <tr key={zone}>
              <td className="px-3 py-2 font-medium">{zone}</td>
              <td className="px-3 py-2 font-mono text-[12px]">{range}</td>
              <td className="px-3 py-2 text-[12px] text-muted-foreground">{companies}</td>
            </tr>
          ))}
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Lista parcial: solo empresas con fuente. Hay números que no aparecen
          aquí. La 02 es el antiguo servicio local de Hualpén y la 18 está en el
          rango de los 10 pero es de Hualqui.
        </p>
        <p>
          El número dice de dónde es la empresa, no adónde van sus servicios: la
          10 sale de Chiguayante y llega a Talcahuano. Los 30 son solo Penco; los
          60, Concepción Norte; los 80, Hualqui. Los interurbanos (201, 302/304,
          401/411/421) no son parte de esta red: ver{' '}
          <a href="/wiki/recorridos-interurbanos" className={LINK}>recorridos interurbanos</a>.
        </p>
      </Section>

      <Section title="Cómo se nombran">
        <p>
          El código es el <strong>número de la empresa más dos letras</strong>, una
          por sentido, y cada letra identifica un destino. El letrero oficial dice{' '}
          <code className="font-mono">empresa + variante - destino</code>.
          Por ejemplo, «Vía Láctea 10A - Centinela» y «Vía Láctea 10N - Los Bloques»
          son los dos sentidos del 10AN. La primera letra es el sentido 0.
        </p>
        <DataTable columns={['Código', 'Empresa', 'Sentido 0', 'Sentido 1']} bodyClassName="divide-y align-top text-[12px]">
          {EXAMPLES.map(([code, company, dir0, dir1]) => (
            <tr key={code}>
              <td className="px-3 py-2">
                <ServiceCode>{code}</ServiceCode>
              </td>
              <td className="px-3 py-2">{company}</td>
              <td className="px-3 py-2">{dir0}</td>
              <td className="px-3 py-2">{dir1}</td>
            </tr>
          ))}
        </DataTable>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            Las letras no tienen significado propio: AN, KP, BS o AD son solo las
            letras de los dos destinos. Al principio no se repetían dentro de una
            zona; con los años sí (10A y 02A).
          </li>
          <li>
            Los servicios de un solo sentido (70F, 80H) traen solo la letra de ese
            destino. La Biobús usa B + número, sin letras.
          </li>
          <li>
            <strong>Letreros cruzados.</strong> En <MapLink route="02AD">02AD</MapLink>,
            02KP y 23BS el feed trae el letrero cambiado entre sentidos (por ejemplo,
            el viaje que termina en el Terminal Collao dice «23S - Av. Michaihue»).
            El visor lo corrige solo cuando viene cruzado y no se edita a mano en
            los datos generados.
          </li>
        </ul>
        <p>
          En la calle, la prensa nombra la micro por la empresa («Las Galaxias»,
          «Chiguayante Sur») y a veces con número («línea 14»); para un servicio
          preciso usa el código del letrero («10JL»). No encontramos fuentes sobre
          cómo lo dice la gente en voz alta.
        </p>
      </Section>

      <Section title="Cómo se ven en el visor">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <strong>Líneas y sentido.</strong> Se elige una línea (por ejemplo{' '}
            <MapLink route="30QE">30QE</MapLink>) y un sentido; el mapa dibuja el trazado
            y sus paraderos. La ficha muestra la frecuencia y la ventana del programa
            oficial (no es un itinerario).
          </li>
          <li>
            <strong>Modo Horario.</strong> Micros estimadas según el programa
            oficial, nunca GPS; la interfaz las rotula como estimación. Donde se
            conoce la flota, no se dibujan más micros que buses tiene la línea.
          </li>
          <li>
            <strong>Modo GPS en vivo.</strong> Solo posiciones GPS reales. El mapa
            dibuja una fuente a la vez y no rellena el modo GPS con estimaciones; una
            línea sin micros dice «sin GPS ahora».
          </li>
          <li>
            <strong>Llegadas en vivo.</strong> Al abrir un paradero, la ficha lista las
            micros que vienen, con minutos y distancia. La fuente es la app de
            Transapp, no oficial ni documentada: puede cambiar o cortarse sin aviso.
            Si no está activada en el servidor, el visor lo dice.
          </li>
          <li>
            Ejemplos para abrir: <MapLink route="10AN">10AN</MapLink>,{' '}
            <MapLink route="24MF">24MF</MapLink>,{' '}
            <MapLink route="14ZU">14ZU</MapLink>, <MapLink route="80H">80H</MapLink> y{' '}
            <MapLink route="B02">B02</MapLink>.
          </li>
        </ul>
      </Section>

      <Section title="Límites">
        <PendingBanner>
          <strong>El feed está vencido.</strong> Su calendario declarado va de
          2024-01-01 a 2025-12-31 y es la última publicación oficial; el visor lo
          usa sin filtrar por fecha y lo avisa. Detalle en{' '}
          <a href="/wiki/gtfs-gran-concepcion" className={LINK}>GTFS Gran Concepción</a>.
        </PendingBanner>
        <p>
          La red cambió en 2026. La fuente en vivo ya sigue 11 servicios que el GTFS
          no trae: 02H, 02L, 20F, 20N, 30H, 30Z, 50SY, 70FY, 70HY, 80B y 80V. De la
          02L el feed solo tiene la variante 02L-Y. Hasta que la DTPR publique otro
          feed, esos servicios no tienen trazado ni horario en el visor.
        </p>
      </Section>

      <CollapsibleSection title="Datos pendientes y bibliografía">
        <p className="text-[13px]">
          <strong>Pendientes:</strong> abrir la Res. Ex. DTPR 2166/2023 (manual de
          normas gráficas) y confirmar zonas y empresas con fuente primaria; razón
          social y operador de cada número que falta en la tabla; qué nombre lleva
          pintada la 42 y la 50 (Campanil o Denavi Sur) en 2026; si existe una norma
          para los interurbanos por centena (2xx, 3xx, 4xx), hoy solo observada en el
          feed; cómo se dice cada micro en la calle.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2025/12/granconcepcion.zip">
              DTPR · GTFS Gran Concepción20250228
            </SourceLink>{' '}
            (ver <a href="/wiki/gtfs-gran-concepcion" className={LINK}>ficha del feed</a>)
          </li>
          <li>
            <SourceLink href={WIKI_PE}>Wikipedia · Perímetro de Exclusión del Gran Concepción</SourceLink>{' '}
            (zonas, letreros, empresas; cita Res. Ex. DTPR 2166/2023)
          </li>
          <li>
            <SourceLink href="https://es.wikipedia.org/wiki/Buses_licitados_del_Gran_Concepci%C3%B3n">
              Wikipedia · Buses licitados del Gran Concepción
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.diariooficial.interior.gob.cl/publicaciones/2025/10/21/44280/01/2714624.pdf">
              Diario Oficial · Res. Ex. 2044/2025 SEREMITT Biobío
            </SourceLink>{' '}
            («Unidad de Negocios Nº 60», Buses Tucapel)
          </li>
          <li>
            <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2019/11/11/estas-son-las-lineas-de-buses-que-han-llamado-a-paralizar-servicios-en-el-gran-concepcion.shtml">
              BioBioChile · 11-nov-2019
            </SourceLink>{' '}
            (líneas nombradas por empresa)
          </li>
          <li>
            <SourceLink href="https://www.cnnchile.com/pais/sistema-transporte-gran-concepcion-nuevo-bus-electrico-este-sera-su-recorrido_20251127/">
              CNN Chile · 27-nov-2025
            </SourceLink>{' '}
            (servicio 10JL)
          </li>
        </ul>
      </CollapsibleSection>
    </div>
  );
}
