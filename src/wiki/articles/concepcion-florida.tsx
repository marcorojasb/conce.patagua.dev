// Concepción ↔ Florida, único artículo del corredor (también conocido
// coloquialmente como "el corredor de El Pimentón"; absorbe la ficha
// "corredor-el-pimenton", fusionada el 2026-05-16).
//
// El troncal diurno es PRIVADO: cuatro operadores (Delsal, Nueva
// Libertadores, Biocosta, Trinidad) sin decreto único. Desde 2025 hay
// servicios subsidiados para tramos rurales. Sin GTFS: el visor solo tiene
// pins en src/data/interurban-corridors.ts.
// Hechos cotejados el 2026-11-25 (ficha DTPR Biobío 2026, junio).

import {
  ArticleSummary,
  CollapsibleSection,
  FactStrip,
  IssueNotice,
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

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function ConcepcionFlorida() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente.</strong> Operadores, flota (~40
        buses, SEREMI 2024), hitos 2024-2025 y servicios subsidiados: con
        fuente. <strong>Pendientes</strong>: tabla horaria, tarifas por
        operador y estado de la licitación del servicio nocturno; no hay datos
        posteriores a mayo de 2026 en fuente abierta.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Operadores', value: '4 privados' },
          { label: 'Distancia', value: '~42–50 km' },
          { label: 'Viaje', value: '50 min–1 h 10' },
          { label: 'Tarifa adulto', value: '$1.700–$2.500 (referencial)' },
          { label: 'GTFS', value: 'No hay' },
          { label: 'Mapa', value: <MapLink corridor="concepcion-florida">Corredor Florida</MapLink> },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Servicio rural-interurbano <strong>privado</strong> entre Florida
            (~10.624 hab., 60,19 % rural) y Concepción, por la cuesta de la
            Cordillera de la Costa. El MTT no puede obligar a los operadores a
            subir la frecuencia.
          </>,
          <>
            Todos terminan en el paradero Colo-Colo / Av. Los Carrera. El
            Terminal Camilo Henríquez, cabecera histórica, aparece en obra en{' '}
            <SourceLink href="https://www.openstreetmap.org/way/114474600">OSM</SourceLink>{' '}
            desde el 31-may-2026.
          </>,
          <>
            Desde 2025 se sumaron servicios subsidiados: zona norte de Florida
            (oct-2025), Rahuil y Poñén-Roa. La ficha DTPR 2026 lista además
            los contratos CTR0345 (Florida ↔ Concepción y Puente Seis-Roa ↔
            Concepción) y CTA0691 (Rahuil Alto ↔ Florida).
          </>,
          <>
            No está en el{' '}
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS</a>{' '}
            ni en BusPay. Distinto de la{' '}
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">201 Santa Juana</a>,
            que va por la costa (Ruta 156).
          </>,
        ]}
      />

      <Section title="Trazado">
        <p>
          Dos trazados, según operador y hora. Ambos terminan en Concepción en
          el paradero histórico de Colo-Colo con Av. Los Carrera.
        </p>
        <KeyValueList
          items={[
            ['A · Ruta del Itata (rápido)', 'Florida → enlace Florida → Ruta del Itata (concesionada) → peaje Agua Amarilla → Acceso Norte → Av. 21 de Mayo → Av. Los Carrera. ~50 min sin congestión; ahorra 30 min desde 2019.'],
            ['B · Ruta 148 (lento)', 'Florida → Ruta 148 junto al río Andalién, con los 7 puentes de Domingo Arteaga (1920-1930) → Av. Los Carrera. ~1 h 10 min. Lo prefieren servicios rurales (Copiulemu, Chaimavida) por las paradas intermedias.'],
          ]}
        />
        <p className="text-[12px]">
          <MapLink corridor="concepcion-florida">Ver corredor Florida en el mapa →</MapLink>
          {' · '}
          <MapLink terminal="osm-way-597586612">Terminal Collao en el mapa →</MapLink>
        </p>
        <Sources>
          <SourceLink href="https://biobio.mop.gob.cl/vecinos-de-florida-ya-pueden-usar-ruta-del-itata-para-llegar-a-concepcion/">MOP Biobío · Enlace Florida-Itata (12-dic-2019)</SourceLink>
          <SourceLink href="https://www.archivohistoricoconcepcion.cl/minisitios/monografias-regionales/los_siete_puentes_a_florida/">Archivo Histórico Concepción · 7 puentes y Ruta 148</SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml">BioBioChile · Paradero Colo-Colo / Los Carrera</SourceLink>
        </Sources>
      </Section>

      <Section title="Operadores (4 confirmados) y servicios subsidiados">
        <OperatorTable
          rows={[
            {
              name: 'Buses Delsal Ltda.',
              routes: 'Concepción ↔ Quillón ↔ Bulnes (paradas en Florida)',
              terminal: 'Terminal Camilo Henríquez 2565 + reserva propia',
              notes: <>Fundada en 1977. Fonos (41) 2380421 y (41) 2380006.</>,
              source: { href: 'https://www.horariodebuses.cl/buses-delsal', label: 'horariodebuses.cl' },
            },
            {
              name: 'Buses Nueva Libertadores',
              routes: 'Concepción ↔ Florida',
              terminal: 'Paradero Colo-Colo / Av. Los Carrera',
              notes: <>Representante: <strong>Ulda Espinoza</strong>. Operador histórico; la municipalidad de Florida la lista entre los operadores oficiales.</>,
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html',
                label: 'Diario Concepción · jul-2024',
              },
            },
            {
              name: 'Buses Biocosta',
              routes: 'Concepción ↔ Florida (antes también Conce-Santa Juana, hasta mayo 2020)',
              terminal: 'Paradero Colo-Colo / Av. Los Carrera',
              notes: <>Un conductor, <strong>Miguel Ángel Sepúlveda</strong>, denunció en marzo 2024 amenazas de Los Libertadores.</>,
              source: {
                href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml',
                label: 'BioBioChile · mar-2024',
              },
            },
            {
              name: 'Transportes Trinidad',
              routes: 'Concepción ↔ Copiulemu, Chaimavida, El Pino',
              terminal: 'No publicado',
              notes: <>Representante: <strong>Blas Pereira</strong>. Sin horarios publicados.</>,
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html',
                label: 'Diario Concepción · jul-2024',
              },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          El SEREMI Héctor Silva declaró en julio 2024 una flota combinada de{' '}
          <strong>~40 buses</strong> para tres operadores; la prensa suma a
          Trinidad como cuarto, que probablemente sirve ramales rurales dentro
          de Florida y no cuenta en la mesa del troncal.
        </p>
        <p className="text-[13px] font-medium">Servicios subsidiados (desde 2025)</p>
        <p>
          En vez de licitar un reemplazo único (como la 201), el MTT agregó
          capas subsidiadas y dejó el troncal diurno en manos privadas:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <strong>Zona norte de Florida</strong> (desde oct-2025): contrato
            de transporte aislado, 10 servicios a la semana, tarifa $400 a
            $1.500 según destino, $63.720.000 de inversión MTT a 36 meses.
            Operador no publicado.
          </li>
          <li>
            <strong>Nocturno Concepción ↔ Florida</strong>: salidas 18:30 y
            22:30, anunciado por el SEREMI Patricio Fierro para abril 2025. El
            alcalde dijo en marzo 2025 que la licitación ya estaba cerrada;
            no encontré en fuente abierta fecha de inicio, operador ni decreto.
          </li>
          <li>
            <strong>Rahuil ↔ Florida urbano</strong> (desde abr-2025) y{' '}
            <strong>Poñén-Roa</strong> (martes y jueves): conectividad rural.
            La ficha DTPR 2026 lista el CTA0691 (Rahuil Alto ↔ Florida) y el
            CTR0345 (Florida ↔ Concepción y Puente Seis-Roa ↔ Concepción), sin
            operador; no dice cuál contrato es cuál servicio de arriba.
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf">DTPR · Ficha Biobío 2026 (jun-2026)</SourceLink>
          <SourceLink href="https://muniflorida.cl/florida-cuenta-con-nuevo-servicio-de-transporte-rural/">Municipalidad de Florida · Nuevo servicio rural</SourceLink>
          <SourceLink href="https://www.soychile.cl/concepcion/sociedad/2025/10/31/927147/transprote-publico-rural-biobio.html">Soychile · 31-oct-2025</SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html">Diario Concepción · 28-mar-2025, nocturno</SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">Diario Concepción · 27-jul-2024, flota combinada de 40 buses</SourceLink>
        </Sources>
        <p className="text-[12px] text-muted-foreground">
          Sobre BusPay: Florida no está en el perímetro inicial (Gran
          Concepción, Santa Juana y{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">Tomé</a>
          ); ver <a href="/wiki/buspay" className="underline underline-offset-2">BusPay</a>.
        </p>
      </Section>

      <Section title="Frecuencias y horarios">
        <KeyValueList
          items={[
            ['Lunes a viernes', 'Buena en hora punta según usuarios; sin tabla oficial.'],
            ['Fin de semana y festivos', 'Muy baja y con esperas largas en Colo-Colo (dirigentes vecinales, jul-2024).'],
            ['Primer y último despacho', 'No publicados. El nocturno subsidiado extendería salidas hasta las 22:30.'],
            ['Tiempo real', 'No hay. La integración a la app Red Regional se comprometió en jul-2024 y no se verificó después.'],
          ]}
        />
        <PendingBanner>
          <strong>Tabla horaria pendiente.</strong> Ningún operador publica
          horarios completos en fuente abierta. Una foto fechada del cartel en
          el paradero Colo-Colo lo cierra.
        </PendingBanner>
      </Section>

      <Section title="Tarifas">
        <PendingBanner>
          <strong>Pendiente.</strong> Ningún operador publica tarifas 2026 en
          fuente abierta (revisión del 25-nov-2026). Rangos de agregadores, no
          oficiales: $1.700-$2.500 el viaje directo Concepción-Florida y
          $400-$1.500 el subsidiado de la zona norte. La gratuidad de adultos
          mayores y personas con discapacidad solo es obligatoria en servicios
          subsidiados; los privados aplican TNE (33 %). En la región, la
          rebaja de adulto mayor es de 50 % en todos los buses (DTPR 2026).
        </PendingBanner>
      </Section>

      <Section title="Issues recientes">
        <div className="space-y-2">
          <IssueNotice title="27-jul-2024 · El MTT no puede obligar a los privados">
            El SEREMI Silva: <em>"La regulación es muy genérica y no nos
            permite obligar a los operadores a cumplir ciertas frecuencias"</em>.
            Acuerdos voluntarios: coordinar los 40 buses, fiscalizar Colo-Colo,
            GPS y cámaras financiadas por el MTT, app Red Regional. Cumplimiento
            no verificado.
            <Sources>
              <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">Diario Concepción · 27-jul-2024</SourceLink>
            </Sources>
          </IssueNotice>
          <IssueNotice title="Jul-2024 · Crimen de Daniela Olate y seguridad nocturna">
            Puso en agenda la falta de transporte nocturno seguro y llevó al
            servicio nocturno subvencionado anunciado en marzo 2025.
            <Sources>
              <SourceLink href="https://sabes.cl/2024/07/23/transporte-publico-rural-entre-florida-y-concepcion-uno-de-los-tema-de-fondo-en-el-crimen-de-daniela-olate/">Sabes.cl · 23-jul-2024</SourceLink>
            </Sources>
          </IssueNotice>
          <IssueNotice title="14-mar-2024 · Pelea entre conductores en Colo-Colo">
            Conductores de Biocosta y Los Libertadores se pelearon en el
            paradero; el de Biocosta denunció amenazas recurrentes.
            <Sources>
              <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml">BioBioChile · 14-mar-2024</SourceLink>
            </Sources>
          </IssueNotice>
          <IssueNotice title="Mar-2025 · Servicio caído sin identificar">
            El SEREMI Fierro habló de <em>"reponer el servicio a la brevedad"</em>;
            la fuente no dice qué operador ni por qué.
          </IssueNotice>
        </div>
      </Section>

      <CollapsibleSection title="Tecnología comprometida (jul-2024)">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>GPS y cámaras en la flota: financia el MTT; sin verificación en 2025-2026.</li>
          <li>App Red Regional: integración comprometida; el servicio no aparecía a fines de 2025.</li>
          <li>Contadores de pasajeros: no incluidos (sí en Lota-Coronel).</li>
        </ul>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">Diario Concepción · jul-2024, acuerdo de tecnología</SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/08/30/taxibuses-lota-coronel-incorporan-contadores-de-pasajeros-camaras-y-gps.html">Diario Concepción · ago-2024, Lota-Coronel (comparación)</SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Infraestructura vial (2024-2025)">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <strong>Ruta del Itata</strong>: Acceso Norte y enlace Florida
            (habilitado el 12-dic-2019); peaje en Agua Amarilla (Penco).
          </li>
          <li>
            <strong>Ruta 148</strong>: camino del s. XVIII con los 7 puentes de
            Arteaga; sobrevivió a los terremotos de 1939, 1960, 1985 y 2010.
          </li>
          <li>
            <strong>Florida-Copiulemu (O-540 / Q-560)</strong>: pavimentación
            MOP de más de $3.000 millones, en licitación en sep-2024. No afecta
            aún al troncal.
          </li>
        </ul>
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/uploads/sites/4/2025/11/Informe-Ejecutivo_RutasdelItata_septiembre2025.pdf">MOP Concesiones · Informe Ejecutivo Ruta del Itata (sep-2025)</SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/09/05/florida-pavimentaran-conexion-con-copiulemu-por-mas-de-3-mil-millones.html">Diario Concepción · Pavimentación Florida-Copiulemu</SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Línea de tiempo">
        <Timeline
          items={[
            { date: '12-dic-2019', event: 'Se habilita el enlace Florida ↔ Ruta del Itata (-30 min).' },
            { date: '14-mar-2024', event: 'Pelea entre conductores en Colo-Colo.' },
            { date: '27-jul-2024', event: 'Mesa MTT-operadores (40 buses); acuerdo de tecnología y app.' },
            { date: '5-sep-2024', event: 'MOP anuncia la pavimentación Florida-Copiulemu.' },
            {
              date: '10-ene-2025',
              event: 'Patricio Fierro asume como SEREMI de Transportes de Biobío.',
              source: {
                href: 'https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html',
                label: 'Diario Concepción',
              },
            },
            { date: '28-mar-2025', event: 'Anuncio del nocturno y de los servicios Rahuil y Poñén-Roa.' },
            { date: 'Oct-2025', event: 'Inauguración del servicio rural de la zona norte ($63,72 millones, 36 meses).' },
            { date: '31-oct-2025', event: 'Biobío llega a 29 servicios subvencionados rurales.' },
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title='Sobre el topónimo "El Pimentón"'>
        <p>
          "El Pimentón" es uso popular, no oficial: en{' '}
          <SourceLink href="https://nominatim.openstreetmap.org/search?q=Pimenton&countrycodes=cl&format=json&limit=10">Nominatim</SourceLink>{' '}
          solo aparece en Valparaíso, y las monografías históricas ni la
          municipalidad de Hualqui (
          <SourceLink href="https://hualqui.com/caracteristicas/">altitudes 4-677 m</SourceLink>
          ) lo mencionan. Lo tratamos como nombre paraguas del corredor hasta
          que una fuente IGM, municipal o comunitaria lo confirme.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Razón social, RUT y N° RNTPP de los 4 operadores.</li>
          <li>Horarios completos y tarifas oficiales 2026 por operador.</li>
          <li>Inicio, operador y decreto del servicio nocturno.</li>
          <li>Localidades exactas de la zona norte cubiertas por el contrato.</li>
          <li>Cumplimiento del acuerdo de tecnología (GPS, cámaras, app).</li>
          <li>Demanda diaria (no hay encuesta O/D pública 2020+).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a la DTPR Biobío, consulta SII y
          foto del cartel en Colo-Colo. Aportes por pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-florida.tsx">concepcion-florida.tsx</SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
