// Concepción ↔ Yumbel, corredor interurbano del valle central.
// Eje principal: Ruta 146 (Autopista Valles del Biobío, ex Q-50-O).
// Operadores privados de larga distancia, sin licitación DTPR específica y
// sin GTFS: el visor solo tiene pins en src/data/interurban-corridors.ts.
// Hechos cotejados el 2026-11-25. Evento distintivo: Fiesta de San
// Sebastián (20-ene y 20-mar).

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  IssueNotice,
  KeyValueList,
  NewsPulse,
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
export default function ConcepcionYumbel() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias.</strong> Ruta
        146 (decreto MOP N°179/2013, concesión Sacyr), población (21.198 hab.,
        Censo 2017), operadores, conflicto municipal con Pullman Bus (resuelto
        en ene-2024) y subsidio CTR0224 (decreto N°5863/2025).{' '}
        <strong>Pendientes</strong>: tarifa 2026 oficial por operador, tabla
        horaria oficial y razón social/RUT de cada operador.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Distancia', value: '~68 km (Ruta 146)' },
          { label: 'Viaje', value: '~1 h – 1 h 30' },
          { label: 'Tarifa adulto', value: '$2.000–$4.000 (agregadores)' },
          { label: 'Régimen', value: 'Privado, sin licitación' },
          { label: 'GTFS / BusPay', value: 'No / No' },
          { label: 'Mapa', value: <MapLink corridor="concepcion-yumbel">Corredor Yumbel</MapLink> },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            Conecta el Gran Concepción con <strong>Yumbel</strong> (21.198
            hab., 765,25 km²) por la Ruta 146, concesionada a Valles del
            Biobío (grupo Sacyr) desde 2012.
          </>,
          <>
            Lo cubren Línea Azul, Buses Bío Bío, Pullman Bus y Pullman Santa
            María, que venden el tramo corto de rutas mayores. No hay contrato
            MTT ni obligación de frecuencia.
          </>,
          <>
            Cada 20 de enero y 20 de marzo la Fiesta de San Sebastián satura
            la Ruta 146 y los terminales (250-350 mil personas por jornada,
            según prensa).
          </>,
          <>
            Sin GTFS, fuera de BusPay y sin app oficial. En Concepción sale
            del Terminal Camilo Henríquez (hoy en obra según OSM).
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: 'Jun-2026',
            title: 'Inauguración de la pavimentación Ruta O-60 Yumbel-Rere',
            detail:
              'Más de 16 km con doble tratamiento asfáltico; el MOP informa $5.100 millones de inversión (la prensa de abril citó $7.983 millones para el contrato). Mejora el camino interior alternativo a la Ruta 146. Las fuentes no hablan de buses; como los interurbanos van por la 146, no vemos cambio en trazados ni tiempos del corredor (lectura editorial).',
            source: {
              href: 'https://www.diarioestrategia.cl/texto-diario/mostrar/5931298/pavimentacion-ruta-yumbel-rere-marca-hito-provincia-biobio',
              label: 'Diario Estrategia · 24-jun-2026',
            },
          },
          {
            date: '17-abr-2026',
            title: 'La Ruta O-60 Yumbel-Rere llega a su fase final',
            detail: '16,3 km entre los km 18,5 y 34,7, 99,05 % de avance al 10-abr-2026 (Serviterra Ltda.).',
            source: {
              href: 'https://www.latribuna.cl/desarrollo/2026/04/17/ruta-o-60-yumbelrere-llega-a-su-fase-final-y-mejora-acceso-a-zona-con-valor-historico-y-turistico-de-biobio.html',
              label: 'La Tribuna · 17-abr-2026',
            },
          },
        ]}
      />

      <Section title="Operadores">
        <OperatorTable
          rows={[
            {
              name: 'Buses Línea Azul',
              routes: 'Chillán ↔ Concepción (pasa por Yumbel y vende tramo corto)',
              terminal: 'Terminal Camilo Henríquez · Concepción',
              notes: <p>Fundada en 1964. Cesó en agosto 2019 tras un accidente fatal en Mostazal (6 fallecidos) y retomó el 19-jul-2024 con ~32 buses.</p>,
              source: { href: 'https://radionuble.cl/v1/2024/07/18/vuelve-linea-azul-flota-retoma-servicio-chillan-concepcion/', label: 'Radio Ñuble · 18-jul-2024' },
            },
            {
              name: 'Buses Bío Bío',
              routes: 'Concepción ↔ Los Ángeles vía Yumbel · Temuco',
              terminal: 'Terminal Camilo Henríquez · Concepción',
              notes: <p>Fundada el 15-abr-1960 por Carlos Bugmann Spielmann en Temuco. Sin GTFS.</p>,
              source: { href: 'https://biomex.cl/que-buses-hay-desde-concepcion-hacia-yumbel/', label: 'Biomex · Conce-Yumbel' },
            },
            {
              name: 'Pullman Bus',
              routes: 'Yumbel ↔ Concepción (servicio dedicado al tramo)',
              terminal: 'Camilo Henríquez · en Yumbel, Terminal San Francisco (Las Heras 595)',
              notes: <p>Suspendido en 2023 por conflicto con la municipalidad; resuelto por Decreto Alcaldicio N°2348 (27-dic-2023). Reanudó el 9-ene-2024.</p>,
              source: { href: 'https://www.latribuna.cl/cronica-ciudadana/2024/01/09/empresa-de-bus-retomara-servicios-en-yumbel-tras-fin-de-pugna-con-municipio.html', label: 'La Tribuna · 9-ene-2024' },
            },
            {
              name: 'Pullman Santa María',
              routes: 'Servicios pasantes Santiago ↔ sur',
              terminal: 'Terminal Camilo Henríquez · Concepción',
              notes: <>Larga distancia; figura en agregadores. No es operador local.</>,
              source: { href: 'https://biomex.cl/que-buses-hay-desde-concepcion-hacia-yumbel/', label: 'Biomex · operadores' },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Ninguno es exclusivo del corredor. Razón social, RUT y N° RNTPP:
          pendientes.
        </p>
      </Section>

      <Section title="Tarifas y frecuencias">
        <KeyValueList
          items={[
            ['Tarifa adulto', <>Entre <strong>$2.000 y $4.000</strong> según operador y horario. Agregadores (Biomex, kupos, pasajebus, recorrido.cl; 2024-2026) dan cifras distintas: kupos $4.000 para Línea Azul y Pullman Bus, pasajebus $3.000 para Línea Azul. Ninguna empresa publica tabla oficial.</>],
            ['Frecuencia', 'Cada 30 a 60 min, aprox. 06:00 a 22:00 (agregadores).'],
            ['Tiempo de viaje', '~1 h sin congestión; 1 h 30 min en punta o en días de peregrinación.'],
            ['TNE y adulto mayor', 'TNE 33 %; la gratuidad de adultos mayores y personas con discapacidad no está garantizada (no es servicio subsidiado).'],
            ['BusPay, GTFS y app', 'Fuera de los tres: BusPay cubre Gran Concepción, Santa Juana y Tomé, y no hay GTFS ni app Red Regional para este corredor.'],
          ]}
        />
        <PendingBanner>
          <strong>Pendiente:</strong> tarifa 2026 oficial y tabla horaria. Se
          cierran con una foto fechada del cartel en el Terminal Camilo
          Henríquez, en Terminal San Francisco o en el de Yumbel.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://biomex.cl/que-buses-hay-desde-concepcion-hacia-yumbel/">Biomex · Rango $2.000-$3.500 y frecuencia 30-60 min</SourceLink>
          <SourceLink href="https://kupos.cl/en/bus/tickets/concepcion/yumbel">kupos · Conce-Yumbel, operadores y rangos</SourceLink>
          <SourceLink href="https://www.recorrido.cl/en/bus/concepcion/yumbel">recorrido.cl · Conce-Yumbel</SourceLink>
          <SourceLink href="https://www.pasajebus.com/en/bus/tickets/yumbel/concepcion">pasajebus · Yumbel-Concepción (Línea Azul, $3.000)</SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura del visor">
        <p>
          <strong>El corredor no está en el visor.</strong> El{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS oficial</a>{' '}
          cubre la red urbana y los interurbanos 201 (Santa Juana), 401/411/421
          (Tomé) y 302/304 (Lota); ningún servicio representa a Yumbel, porque
          son buses privados sin feed y sin licitación que obligue a publicarlo.
        </p>
        <ul className="ml-5 list-disc space-y-0.5 text-[13px]">
          <li>
            Sí aparecen el <strong>Terminal Camilo Henríquez</strong> (OSM way
            114474600) y el <strong>Terminal Collao</strong> (OSM way
            597586612); la Ruta 146 está como vía del basemap, no como ruta de
            bus.
          </li>
          <li>Los terminales de Yumbel (San Sebastián, San Francisco) no están mapeados, por eso no hay MapLink hacia allá.</li>
        </ul>
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/way/114474600">OSM way 114474600 · Terminal Camilo Henríquez</SourceLink>
          <SourceLink href="https://www.openstreetmap.org/way/597586612">OSM way 597586612 · Terminal Collao</SourceLink>
        </Sources>
      </Section>

      <Section title="Conexiones intermodales">
        <p className="text-[12px]">
          <MapLink corridor="concepcion-yumbel">Ver corredor Yumbel en el mapa →</MapLink>
          {' · '}
          <MapLink terminal="osm-way-597586612">Terminal Collao en el mapa →</MapLink>
        </p>
        <KeyValueList
          items={[
            ['Camilo Henríquez (Concepción)', 'Camilo Henríquez 2565, fono 041-2851626. Cabecera del corredor para Línea Azul, Bío Bío y los dos Pullman. OSM lo marcó como recinto en obra el 31-may-2026, por eso el visor ya no lo lista.'],
            ['Collao (Concepción)', 'Tegualda 860. Servicios pasantes; menos central para este corredor.'],
            ['San Sebastián (Yumbel)', 'Terminal principal: Línea Azul, Jota Be, Ruta Sur, Rometur. No mapeado en el visor.'],
            ['San Francisco (Yumbel)', 'Las Heras 595. Sale Pullman Bus desde el 9-ene-2024; también Eme Bus y Jota Be según agregadores.'],
            ['Biotrén / FFCC', 'Sin conexión: el Biotrén llega hasta Coronel y Lirquén, y el ramal del FCAB por Yumbel hoy es solo de carga.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.busbud.com/en/terminal-camilo-henriquez-de-concepcion/s/22354">Busbud · Terminal Camilo Henríquez (Camilo Henríquez 2565)</SourceLink>
          <SourceLink href="https://www.horariodebuses.cl/terminal-camilo-henriquez-de-concepcion.html">horariodebuses.cl · Terminal Camilo Henríquez · operadores</SourceLink>
          <SourceLink href="https://www.latribuna.cl/cronica-ciudadana/2024/01/09/empresa-de-bus-retomara-servicios-en-yumbel-tras-fin-de-pugna-con-municipio.html">La Tribuna · Terminal San Francisco, Las Heras 595 Yumbel</SourceLink>
        </Sources>
      </Section>

      <Section title="¿Hay licitación DTPR específica?">
        <p>
          <strong>No.</strong> Al 25-nov-2026 no hay contrato MTT para el
          troncal, que sigue privado y sin obligación de frecuencia (mismo
          problema que{' '}
          <a href="/wiki/concepcion-florida" className="underline underline-offset-2">Florida</a>
          ). Lo más cercano es el Decreto Exento N°5863/2025 (24-dic-2025),
          con $11.106.265.700 en subsidios CTR para 21 comunas; su ruta CTR0224
          (La Mata ↔ Monte Águila ↔ Cabrero) toca el entorno de Yumbel, pero no
          el tramo Conce-Yumbel. No existe perímetro de exclusión para este
          corredor.
        </p>
        <Sources>
          <SourceLink href="https://apps.dtpr.cl/ConsultaLicitaciones/Descargar?documentoId=22712462">DTPR · Decreto Exento N°5863/2025 (subsidios CTR Biobío 2025)</SourceLink>
          <SourceLink href="https://www.dtpr.gob.cl/conectividadrural">DTPR · Programa de Conectividad Rural, marco legal</SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">Diario Concepción · 27-jul-2024, SEREMI no puede obligar a privados</SourceLink>
        </Sources>
      </Section>

      <CollapsibleSection title="Peregrinación de San Sebastián (20-ene y 20-mar)">
        <p>
          Es un dato de demanda: dos jornadas al año concentran la fiesta, el
          20 de enero y el 20 de marzo. La cifra de peregrinos varía por
          fuente: 250.000 en enero y 350.000 en marzo (Wikipedia, desde prensa),
          &quot;hasta 500 mil&quot; (prensa 2025 y alerta temprana de Senapred),
          sin metodología publicada. En 2025 hubo 400 carabineros y misa
          principal a las 09:00; el culto se remonta a ~1663. Los operadores
          suman buses extraordinarios sin cifra oficial, y la Ruta 146 se
          congestiona en el enlace a Yumbel y el peaje Huinanco. No encontré
          en fuente abierta cifras ni plan de contingencia de la jornada del
          20-ene-2026.
        </p>
        <Sources>
          <SourceLink href="https://www.latribuna.cl/nuestra-gente/2025/01/20/tierra-de-fe-y-devocion-yumbel-recibe-a-miles-de-peregrinos-en-conmemoracion-de-san-sebastian.html">La Tribuna · 20-ene-2025, Yumbel recibe peregrinos, 400 carabineros</SourceLink>
          <SourceLink href="https://iglesiadeconcepcion.cl/noticias/conoce-los-horarios-de-la-festividad-de-san-sebastian-de-yumbel-este-20-de-enero/">Arzobispado de la Santísima Concepción · Horarios festividad enero</SourceLink>
          <SourceLink href="https://iglesiadeconcepcion.cl/noticias/fieles-celebraran-la-festividad-de-san-sebastian-en-yumbel-este-20-de-marzo/">Arzobispado · Festividad 20 de marzo</SourceLink>
          <SourceLink href="https://www.santuariosansebastian.cl/festividad-enero-2025">Santuario San Sebastián · Festividad enero 2025</SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Yumbel">Wikipedia · cifras de peregrinos (250-350 mil por jornada)</SourceLink>
          <SourceLink href="https://revistas.ubiobio.cl/index.php/TYE/article/download/4863/4398?inline=1">UBB · Análisis histórico de la peregrinación a Yumbel</SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Geografía y vialidad">
        <KeyValueList
          items={[
            ['Ruta 146', 'Autopista Valles del Biobío (ex Q-50-O), designada por decreto MOP N°179 del 9-abr-2013. 72,3 km de Ruta 146 más 31,1 km de O-97-N en Ñuble (103,4 km de concesión). Pasa por Concepción, Florida, Yumbel y Cabrero.'],
            ['Concesión', 'Valles del Biobío S.A. (Sacyr): obras desde el 24-sep-2012, doble vía en jun-2016, peajes desde ago-2016. Peaje troncal Huinanco, km 33,9, en Yumbel.'],
            ['Ruta interior Q-60-O (O-60)', 'Hualqui ↔ Talcamávida ↔ Rere ↔ Yumbel; ruta histórica que no usan los buses interurbanos. Tramo Yumbel-Rere pavimentado en 2026 (ver novedades).'],
            ['Entorno', 'Concepción a 10-30 m s.n.m., Yumbel a ~80-100 m; cruza los ríos Andalién y Laja y el estero Pichaco.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Renumeración MOP 2013: O-60 y Q-60-O son la misma vía interior;
          todos los operadores van por la 146.
        </p>
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/relation/6582801">OSM relation 6582801 · Ruta 146 (ref=146, decreto MOP 179/2013)</SourceLink>
          <SourceLink href="https://www.openstreetmap.org/way/454984703">OSM way 454984703 · Ruta Q-60-O (ref=Q-60-O, old_ref=O-60)</SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Ruta_146">Wikipedia · Ruta 146 (Cabrero ↔ Concepción · ex Q-50-O)</SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Autopista_Valles_del_Biob%C3%ADo">Wikipedia · Autopista Valles del Biobío (concesión Sacyr)</SourceLink>
          <SourceLink href="https://peajeschile.com/peaje-huinanco/">Peajes de Chile · Huinanco km 33,9 Ruta 146 (Yumbel)</SourceLink>
          <SourceLink href="https://www.latribuna.cl/desarrollo/2026/04/17/ruta-o-60-yumbelrere-llega-a-su-fase-final-y-mejora-acceso-a-zona-con-valor-historico-y-turistico-de-biobio.html">La Tribuna · 17-abr-2026, Ruta O-60 (Q-60-O) Yumbel-Rere fase final</SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Historia y línea de tiempo">
        <p>
          Yumbel nació el 8-may-1585 como Fuerte San Felipe de Austria (Alonso
          de Sotomayor) y es ciudad desde el 16-mar-1871. El bus quedó como
          conexión única tras el cierre del ramal del FCAB.
        </p>
        <Timeline
          items={[
            { date: '1960', event: 'Se funda Buses Bío Bío en Temuco.' },
            { date: '1964', event: 'Se funda Buses Línea Azul en Chillán.' },
            { date: '24-sep-2012', event: 'Inicio de obras de la Autopista Valles del Biobío (103,4 km).' },
            { date: '9-abr-2013', event: 'Decreto MOP N°179 designa la Ruta 146.' },
            { date: 'Jun-ago 2016', event: 'Doble vía operativa y comienzo del cobro de peaje en Huinanco.' },
            { date: 'Ago-2019', event: 'Línea Azul cesa operaciones; vuelve en jul-2024.' },
            { date: '27-dic-2023', event: 'Decreto Alcaldicio N°2348 ordena la operación local de buses.' },
            { date: '9-ene-2024', event: 'Pullman Bus retoma Yumbel-Concepción desde Terminal San Francisco.' },
            { date: '20-ene-2025', event: 'Festividad San Sebastián: 400 carabineros.' },
            { date: '24-dic-2025', event: 'Decreto Exento N°5863/2025: subsidios CTR (CTR0224 La Mata-Monte Águila-Cabrero).' },
            { date: 'Abr-jun 2026', event: 'Fin de obras y pavimentación de la Ruta O-60 Yumbel-Rere.' },
          ]}
        />
        <Sources>
          <SourceLink href="https://biomex.cl/que-buses-hay-desde-concepcion-hacia-yumbel/">Biomex</SourceLink>
          <SourceLink href="https://radionuble.cl/v1/2024/07/18/vuelve-linea-azul-flota-retoma-servicio-chillan-concepcion/">Radio Ñuble · Línea Azul</SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Autopista_Valles_del_Biob%C3%ADo">Wikipedia · Autopista Valles del Biobío</SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8313">BCN · Reporte comunal Yumbel 2017, 21.198 hab., 765,25 km²</SourceLink>
        </Sources>
      </CollapsibleSection>

      <CollapsibleSection title="Issues conocidos">
        <div className="space-y-2">
          <IssueNotice title="Peregrinación sin plan de contingencia publicado">
            Las jornadas del 20-ene y 20-mar saturan la Ruta 146, el peaje
            Huinanco y los terminales; no hay plan MOP-MTT-Carabineros público
            más allá de los 400 efectivos de 2025.
          </IssueNotice>
          <IssueNotice title="Régimen privado y conflictos municipales">
            El MTT no puede obligar a subir la frecuencia, y el caso Pullman Bus
            (2023-2024) muestra la operación expuesta a ordenanzas locales.
          </IssueNotice>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Vínculos con otros artículos">
        <DataTable columns={['Corredor', 'Eje vial', 'Régimen', 'Estado wiki']}>
          <tr>
            <td className="px-3 py-2 font-medium">
              <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">201 Santa Juana</a>
            </td>
            <td className="px-3 py-2">Ruta 156 (Ruta de la Madera)</td>
            <td className="px-3 py-2">Licitación DTPR ELC0007</td>
            <td className="px-3 py-2">Integrado al visor</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">
              <a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a>
            </td>
            <td className="px-3 py-2">Ruta 150 (costa norte)</td>
            <td className="px-3 py-2">Perímetro de exclusión (Tomé 2016/2022)</td>
            <td className="px-3 py-2">Integrado al visor (401/411/421)</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">
              <a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción ↔ Florida</a>
            </td>
            <td className="px-3 py-2">Ruta 148 + Ruta del Itata</td>
            <td className="px-3 py-2">Privados + capas subsidiadas 2025</td>
            <td className="px-3 py-2">No en visor (sin GTFS)</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium"><strong>Concepción ↔ Yumbel</strong> (este artículo)</td>
            <td className="px-3 py-2"><strong>Ruta 146</strong> (valle central)</td>
            <td className="px-3 py-2"><strong>Privado puro</strong></td>
            <td className="px-3 py-2">No en visor (sin GTFS)</td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Ver también el{' '}
          <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">índice de recorridos interurbanos</a>{' '}
          y la nota <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">sobre este wiki</a>.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes y cómo contribuir">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Razón social, RUT y N° RNTPP de cada operador.</li>
          <li>Tarifa 2026 oficial y tabla horaria completa.</li>
          <li>Plan de contingencia y buses extraordinarios de San Sebastián; aforo oficial del santuario.</li>
          <li>Servicios CTR del decreto 5863/2025 que tocan Yumbel.</li>
          <li>OSM ID de los terminales San Sebastián y San Francisco; texto del Decreto Alcaldicio N°2348.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia (municipalidad de Yumbel y DTPR
          Biobío), consulta SII y foto del cartel en cada terminal. Aportes por
          pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-yumbel.tsx">concepcion-yumbel.tsx</SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
