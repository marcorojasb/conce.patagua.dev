// OpenStreetMap como fuente del visor: ficha metodológica de la segunda fuente
// estructural (hermana de gtfs-gran-concepcion.tsx). Desde el 24-nov-2026 los
// interurbanos 201/401/411/421 salen del GTFS oficial DTPR, no de OSM.
//
// Verificación de IDs: Overpass, 16-may-2026 (relations de variantes y
// terminales). Relations route_master L1 (6857223) y L2 (6857222): consultadas
// en openstreetmap.org el 25-nov-2026, siguen vigentes con sus start_date.
//
// Aviso: el comentario de fetch-biotren.ts "OSM does not currently have the
// Biotrén lines as route relations" está desactualizado: las route_master sí
// existen. Migrar el pipeline a esas relations es trabajo futuro.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function OpenstreetmapFuenteVisor() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado.</strong> Las relations de Biotrén siguen vigentes en
        OSM (consultadas el 25-nov-2026): L1 = 6857223 y L2 = 6857222, ambas{' '}
        <code className="font-mono">route_master</code>. Los IDs de variantes se
        confirmaron en Overpass el 16-may-2026 y no se han vuelto a cotejar.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25 (relations L1 y L2)"
        items={[
          { label: 'Licencia', value: 'ODbL 1.0' },
          { label: 'Biotrén', value: 'L1 y L2 · estaciones y vía' },
          { label: 'Relations', value: '6857223 · 6857222' },
          { label: 'Interurbanos', value: 'Desde el GTFS, no OSM' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            OSM aporta la geografía que el GTFS no trae: estaciones y vía del
            Biotrén, terminales, pins de Florida y Yumbel, capas y el basemap.
          </>,
          <>
            Los trazados de 201, 401, 411 y 421 ya no salen de OSM: vienen del{' '}
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS oficial DTPR
            </a>{' '}
            desde el 24-nov-2026.
          </>,
          <>
            El visor no consulta OSM en vivo. Los datos se generan al sincronizar,
            y cada cambio queda como diff revisable.
          </>,
          <>Para corregir un dato, edita OSM: se verá en la siguiente sincronización.</>,
        ]}
      />

      <Section title="Qué datos del visor vienen de OSM">
        <DataTable columns={['Dataset', 'Filtro y referencia OSM', 'Script · salida']}>
          <tr>
            <td className="px-3 py-2 font-medium">Biotrén L1 y L2 (estaciones)</td>
            <td className="px-3 py-2 text-[12px]">
              Estaciones y apeaderos con operador EFE.{' '}
              <SourceLink href="https://www.openstreetmap.org/relation/6857223">relation 6857223</SourceLink>{' '}
              (L1, Q5985914) y{' '}
              <SourceLink href="https://www.openstreetmap.org/relation/6857222">relation 6857222</SourceLink>{' '}
              (L2, Q5986175)
            </td>
            <td className="px-3 py-2 text-[12px]">
              <code className="font-mono">fetch-biotren.ts</code> → <code className="font-mono">biotren.generated.ts</code>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Vía del Biotrén</td>
            <td className="px-3 py-2 text-[12px]">
              Vías férreas de operador EFE, con Dijkstra entre estaciones. Comparte rieles con
              6757914 y 6757915 (Tren Laja-Talcahuano).
            </td>
            <td className="px-3 py-2 text-[12px]">
              <code className="font-mono">fetch-biotren-track.ts</code> → <code className="font-mono">biotren-track.generated.ts</code>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Pins de Florida y Yumbel</td>
            <td className="px-3 py-2 text-[12px]">Un pin por corredor, citado por <code className="font-mono">osm_id</code>. Sin trazado.</td>
            <td className="px-3 py-2 text-[12px]">
              <code className="font-mono">src/data/interurban-corridors.ts</code> (curado a mano)
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Terminales</td>
            <td className="px-3 py-2 text-[12px]">
              Manuel Rodríguez (way 425356582), Camilo Henríquez (way 114474600), Collao (way 597586612).
            </td>
            <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-terminals.ts</code></td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Capas y basemap</td>
            <td className="px-3 py-2 text-[12px]">
              POIs, ciclovías, áreas verdes y escuelas. Basemap Esri Gray Canvas, derivado de OSM,
              con atribución «© OSM · Esri, HERE, Garmin».
            </td>
            <td className="px-3 py-2 text-[12px]">
              <code className="font-mono">fetch-pois.ts</code>, <code className="font-mono">fetch-cycleways.ts</code>,{' '}
              <code className="font-mono">fetch-greenspace.ts</code>, <code className="font-mono">fetch-schools.ts</code>.
              Basemap en runtime (<code className="font-mono">conce-map.tsx</code>).
            </td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Las estaciones enlazan Wikidata (Coronel Q5788800, Concepción Q5841708, Mercado de Talcahuano Q5843722)
          y <code className="font-mono">fetch-wikidata.ts</code> agrega fecha, imagen y artículo en español. Es sinergia, no
          otra fuente. <code className="font-mono">fetch-interurban-routes.ts</code> ya no alimenta el visor:
          sus trazados de 201, 401, 411 y 421 quedan en <code className="font-mono">interurban-routes.generated.ts</code>{' '}
          solo porque el wiki los cita.
        </p>
      </Section>

      <CollapsibleSection title="Pipeline de generación">
        <p>
          Cada <code className="font-mono">fetch-*.ts</code> consulta Overpass al <em>build</em>, normaliza la respuesta y
          escribe su <code className="font-mono">*.generated.ts</code>. El visor no depende de Overpass en runtime.{' '}
          <code className="font-mono">sync:osm</code> corre en el workflow diario (06:30 UTC) y abre un pull request si hay cambios.
        </p>
        <ol className="ml-5 list-decimal space-y-1 text-[13px]">
          <li>
            <strong>Consulta.</strong> Overpass QL con <code className="font-mono">[out:json]</code>, con failover entre tres
            mirrors (<code className="font-mono">scripts/lib/overpass.ts</code>), vía curl.
          </li>
          <li>
            <strong>Geometría.</strong> Dijkstra por el grafo de la vía, entre nodos OSM reales. Simplificación
            Ramer-Douglas-Peucker con tolerancia <code className="font-mono">5e-5</code>° (~5 m).
          </li>
          <li>
            <strong>Citas.</strong> Cada estación y vértice conserva su tipo e ID de OSM. Ese stamp separa el dato
            verificable de lo inventado.
          </li>
          <li>
            <strong>Archivo y render.</strong> Banner <code className="font-mono">// AUTO-GENERATED</code> con fecha ISO.
            Las capas pesadas entran con import dinámico. Leaflet dibuja en <code className="font-mono">conce-map.tsx</code>,
            atribución «© OSM · Esri, HERE, Garmin».
          </li>
        </ol>
        <p className="text-[12px] text-muted-foreground">
          <code className="font-mono">npm run sync:osm</code> corre biotren, terminals, biotren-track, pois, wikidata,
          cycleways, greenspace y schools. <code className="font-mono">sync:all</code> suma el GTFS.
        </p>
        <Sources>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide">OSM Wiki · Overpass QL</SourceLink>
          <SourceLink href="https://overpass-turbo.eu/">Overpass Turbo · sandbox</SourceLink>
          <SourceLink href="https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm">Wikipedia · RDP</SourceLink>
        </Sources>
      </CollapsibleSection>

      <Section title="Modelo y licencia">
        <p>
          OSM no tiene «rutas» como el GTFS. Tiene <strong>nodos</strong>, <strong>vías</strong> y{' '}
          <strong>relaciones</strong> con tags <code className="font-mono">key=value</code>. Las líneas del Biotrén son
          relaciones <code className="font-mono">route_master</code>, y cada variante es una relación{' '}
          <code className="font-mono">route</code>.
        </p>
        <p>
          Los datos están bajo <strong>ODbL 1.0</strong>, vigente desde el 12-sep-2012 en reemplazo de CC BY-SA 2.0.
          Atribución: el visor muestra «© OSM · Esri, HERE, Garmin» al pie del mapa. Share-alike: una base derivada distribuida
          debe ofrecerse bajo ODbL, y los <code className="font-mono">*.generated.ts</code> son derivados que citan
          su fuente. Una captura del mapa solo requiere atribución.
        </p>
        <Sources>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Relation:route_master">OSM Wiki · route_master</SourceLink>
          <SourceLink href="https://opendatacommons.org/licenses/odbl/1-0/">Open Data Commons · ODbL 1.0</SourceLink>
          <SourceLink href="https://www.openstreetmap.org/copyright">openstreetmap.org/copyright</SourceLink>
          <SourceLink href="https://wiki.osmfoundation.org/wiki/Licence">OSMF · License (CC BY-SA → ODbL, 12-sep-2012)</SourceLink>
        </Sources>
        <p className="text-[12px] text-muted-foreground">
          <code className="font-mono">data-sources-sheet.tsx</code> declara ODbL como licencia de OSM. El basemap Esri se
          rige por sus términos de servicio:{' '}
          <SourceLink href="https://www.esri.com/en-us/legal/terms/full-master-agreement">Esri · términos de servicio de basemaps</SourceLink>.
        </p>
      </Section>

      <Section title="Comparación con el GTFS">
        <DataTable columns={['Dimensión', 'OpenStreetMap', 'GTFS Gran Concepción']}>
          <tr>
            <td className="px-3 py-2 font-medium">Modelo</td>
            <td className="px-3 py-2 text-[12px]">Nodos, vías, relaciones y tags</td>
            <td className="px-3 py-2 text-[12px]">Tablas CSV en zip: rutas, viajes, paraderos, horarios</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Actualización</td>
            <td className="px-3 py-2 text-[12px]">Continua; el visor la recoge con cada <code>sync:*</code></td>
            <td className="px-3 py-2 text-[12px]">Una versión publicada (programa del 28-feb-2025)</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Rol en el visor</td>
            <td className="px-3 py-2 text-[12px]">Biotrén, terminales, pins, capas y basemap</td>
            <td className="px-3 py-2 text-[12px]">Buses urbanos e interurbanos: trazado, paraderos, horarios</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Licencia</td>
            <td className="px-3 py-2 text-[12px]"><strong>ODbL 1.0</strong></td>
            <td className="px-3 py-2 text-[12px]">No declarada por la DTPR</td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Complementarias: OSM aporta geografía; el GTFS aporta el servicio y su horario. Detalle en{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS Gran Concepción</a>.
        </p>
      </Section>

      <Section title="Limitaciones">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Cobertura desigual.</strong> Concepción centro y los troncales (Ruta 150, 156, 160) están bien
            mapeados. Florida interior, Yumbel rural y Hualqui rural tienen huecos.
          </li>
          <li>
            <strong>Horarios casi nunca en OSM.</strong> El visor no usa los tags <code>interval</code>.
          </li>
          <li>
            <strong>Sin relation de bus para interurbanos.</strong> Ni 201, 401, 411, 421, Yumbel ni Florida tenían
            relation <code>route=bus</code> al 16-may-2026. Florida y Yumbel quedan como pin.
          </li>
          <li>
            <strong>Refs MOP desactualizados.</strong> Q-60-O figura como <code>ref=Q-60-O</code> con{' '}
            <code>old_ref=O-60</code>.
          </li>
        </ul>
      </Section>

      <CollapsibleSection title="Cómo verificar y corregir OSM">
        <p>OSM se edita con cuenta. Las correcciones puntuales tienen barrera baja.</p>
        <KeyValueList
          items={[
            ['Editar online', <><SourceLink href="https://www.openstreetmap.org/edit">openstreetmap.org/edit</SourceLink>, editor iD para tags y posiciones.</>],
            ['Editar desktop', <><SourceLink href="https://josm.openstreetmap.de/">JOSM</SourceLink>, validador y presets de Chile.</>],
            ['Reportar nota', <><SourceLink href="https://www.openstreetmap.org/note/new">Crear nota</SourceLink> si ves un error y no quieres editar.</>],
            ['Convenciones Chile', <><SourceLink href="https://wiki.openstreetmap.org/wiki/WikiProject_Chile">WikiProject Chile</SourceLink>: nombres de calles, refs MOP, presets.</>],
            ['Validadores', <><SourceLink href="https://keepright.at/">KeepRight</SourceLink> y <SourceLink href="https://osmose.openstreetmap.fr/es/map/">OSMose</SourceLink>: ways rotos y tags inconsistentes.</>],
            ['Comunidad CL', <><SourceLink href="https://lists.openstreetmap.org/listinfo/talk-cl">talk-cl</SourceLink> y <code className="font-mono">#osm-cl</code> en Discord y Matrix.</>],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Dato de OSM (paradero, estación, ref MOP): edita OSM. Dato del GTFS (paraderos, horarios): contacta a la DTPR,
          según <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS Gran Concepción</a>.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Cómo contribuir a OSM Biobío">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Reportar sin editar.</strong>{' '}
            <SourceLink href="https://www.openstreetmap.org/note/new">Crear nota</SourceLink> sobre la zona.
          </li>
          <li>
            <strong>Editar puntualmente.</strong> Cuenta en{' '}
            <SourceLink href="https://www.openstreetmap.org/">openstreetmap.org</SourceLink> y{' '}
            <SourceLink href="https://www.openstreetmap.org/edit">modo edición</SourceLink>: mueve un paradero, corrige
            un nombre, agrega <code>shelter=yes</code>.
          </li>
          <li>
            <strong>Mapear sistemáticamente.</strong> Lee{' '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/WikiProject_Chile">WikiProject Chile</SourceLink>,
            suscríbete a <SourceLink href="https://lists.openstreetmap.org/listinfo/talk-cl">talk-cl</SourceLink>{' '}
            y usa JOSM. Prioridades: paraderos Concepción ↔ Tomé, terminales de Yumbel y Florida, refs Q-60-O.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          ¿Información de campo sin saber dónde mapearla? Abre un issue o PR en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev">el repo del visor</SourceLink>.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Trabajo futuro">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Migrar el pipeline Biotrén a route_master</strong> (6857222 / 6857223): las relations traen miembros
            en orden, más exacto que filtrar nodos por operador.
          </li>
          <li>
            <strong>Mapear Florida y Yumbel como route=bus.</strong> Sin GTFS, es la única vía para dibujarlos como recorrido.
          </li>
          <li>
            <strong>Enriquecer con Wikidata</strong> terminales y POIs, como ya se hace con las estaciones.
          </li>
          <li>
            <strong>Validar con OSMose</strong> el bbox <code className="font-mono">-37.10,-73.25,-36.65,-72.80</code>{' '}
            y corregir paraderos sin nombre, ways desconectados y refs MOP rotos.
          </li>
          <li>
            <strong>Mapear paraderos cabecera</strong> de los interurbanos (Terminal San Sebastián de Yumbel, Terminal San
            Francisco, Plaza de Florida). La Plaza de Armas de Santa Juana ya está (way 83652338).
          </li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Cronología">
        <Timeline
          items={[
            {
              date: '1999-01',
              event: 'Inicio de la L1 del Biotrén, según el tag start_date de su relation en OSM.',
              source: { href: 'https://www.openstreetmap.org/relation/6857223', label: 'relation 6857223' },
            },
            {
              date: '9-ago-2004',
              event: 'Steve Coast crea OpenStreetMap en University College London.',
              source: { href: 'https://wiki.openstreetmap.org/wiki/History_of_OpenStreetMap', label: 'OSM Wiki · History' },
            },
            {
              date: '24-nov-2005',
              event: 'Inicio de la L2 del Biotrén, según el tag start_date de su relation en OSM.',
              source: { href: 'https://www.openstreetmap.org/relation/6857222', label: 'relation 6857222' },
            },
            {
              date: '22-ago-2006',
              event: 'Se constituye la OpenStreetMap Foundation en el Reino Unido, sin fines de lucro.',
              source: { href: 'https://osmfoundation.org/', label: 'OSMF' },
            },
            {
              date: '12-sep-2012',
              event: 'OSM pasa de CC BY-SA 2.0 a ODbL 1.0.',
              source: { href: 'https://wiki.osmfoundation.org/wiki/Licence', label: 'OSMF · License' },
            },
            { date: '2019', event: 'Relations route_master del Biotrén con interval:source apuntando a fesur.cl 2019.' },
            { date: 'Q2-Q4 2024', event: 'Pipeline OSM → .generated.ts → Leaflet en línea (fetch-biotren, fetch-terminals, fetch-pois, etc.).' },
            { date: '2025', event: 'fetch-interurban-routes.ts digitaliza 201, 401, 411 y 421 desde waypoints OSM.' },
            { date: '14-may-2026', event: 'Última corrida conocida de sync:biotren: 25 estaciones L1+L2, con Concepción compartida.' },
            { date: '16-may-2026', event: 'Verificación de las relations Biotrén en Overpass y publicación de esta ficha.' },
            { date: '24-nov-2026', event: '201, 401, 411 y 421 pasan a salir del GTFS oficial DTPR. El visor deja de usar los trazados OSM digitalizados.' },
            { date: '25-nov-2026', event: 'Consulta de las relations route_master L1 y L2: siguen vigentes.' },
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1">
          <li><a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS Gran Concepción</a>: la otra fuente estructural.</li>
          <li><a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">Biotrén y sus extensiones</a>: estaciones y trazado desde las relations 6857222 y 6857223.</li>
          <li><a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201 Santa Juana</a>: trazado del GTFS desde nov-2026 (antes, waypoints OSM sobre la Ruta 156).</li>
          <li><a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a>: 401, 411 y 421 desde el GTFS.</li>
          <li><a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">Concepción ↔ Yumbel</a>: cita la relation 6582801 (Ruta 146); servicio no graficado.</li>
          <li><a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción ↔ Florida</a>: solo un pin con coordenadas OSM.</li>
          <li><a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">Electrocorredores MOP del Biobío</a>: refs MOP de las Rutas 160 y 150 vía OSM.</li>
          <li><a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">SEREMITT Biobío y la DTPR</a>: publica el GTFS.</li>
          <li><a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">Sobre este wiki</a>: sin fuente abierta no entra al visor.</li>
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Cobertura de paraderos OSM (<code>highway=bus_stop</code>) frente a los 2.239 paraderos del GTFS.</li>
          <li>Inventario de relations <code>route=bus</code> en el Biobío (se espera 0).</li>
          <li>Migración del pipeline Biotrén a route_master 6857222 / 6857223.</li>
          <li>Q-ids de Wikidata para estaciones, terminales y POIs que faltan.</li>
        </ul>
        <PendingBanner>
          Cierre: ronda de validación con OSMose sobre el bbox y barrido de Overpass de relations route=bus y route=train.
        </PendingBanner>
      </CollapsibleSection>

      <CollapsibleSection title="Fuentes">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.openstreetmap.org/about">openstreetmap.org · acerca</SourceLink>
            {' · '}
            <SourceLink href="https://osmfoundation.org/">OSM Foundation</SourceLink>
          </li>
          <li>
            <SourceLink href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL 1.0 · texto oficial</SourceLink>
          </li>
          <li>
            OSM Wiki:{' '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/Public_transport">Public transport v2</SourceLink>
            {' · '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/Tag:railway%3Dstation">railway=station</SourceLink>
            {' · '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/Tag:highway%3Dbus_stop">highway=bus_stop</SourceLink>
            {' · '}
            <SourceLink href="https://overpass-turbo.eu/">Overpass Turbo</SourceLink>
          </li>
          <li>
            Relations Biotrén:{' '}
            <SourceLink href="https://www.openstreetmap.org/relation/6857223">6857223 (L1 route_master, Q5985914)</SourceLink>
            {', '}
            <SourceLink href="https://www.openstreetmap.org/relation/6857222">6857222 (L2 route_master, Q5986175)</SourceLink>
            {', '}
            <SourceLink href="https://www.openstreetmap.org/relation/2170415">2170415</SourceLink>
            {', '}
            <SourceLink href="https://www.openstreetmap.org/relation/6738372">6738372</SourceLink>
            {' (variantes L1); '}
            <SourceLink href="https://www.openstreetmap.org/relation/2170438">2170438</SourceLink>
            {', '}
            <SourceLink href="https://www.openstreetmap.org/relation/6852288">6852288</SourceLink>
            {' (variantes L2).'}
          </li>
          <li>
            Refs MOP:{' '}
            <SourceLink href="https://www.openstreetmap.org/relation/6582801">relation 6582801 (Ruta 146)</SourceLink>
            {', '}
            <SourceLink href="https://www.openstreetmap.org/way/1082594953">way 1082594953 (Ruta 150)</SourceLink>.
          </li>
          <li>
            Scripts del repo:{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-biotren.ts">fetch-biotren</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-biotren-track.ts">fetch-biotren-track</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-interurban-routes.ts">fetch-interurban-routes (en desuso)</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-terminals.ts">fetch-terminals</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-pois.ts">fetch-pois</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-cycleways.ts">fetch-cycleways</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-greenspace.ts">fetch-greenspace</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-schools.ts">fetch-schools</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-wikidata.ts">fetch-wikidata</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/lib/overpass.ts">lib/overpass</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/lib/simplify.ts">lib/simplify (RDP)</SourceLink>
            .
          </li>
        </ul>
      </CollapsibleSection>
    </div>
  );
}
