// OpenStreetMap como fuente del visor — ficha metodológica de la SEGUNDA
// fuente de datos sobre la cual está construido conce.patagua.dev. Hermano
// de `gtfs-gran-concepcion.tsx`. El GTFS Gran Concepción cubre los buses
// urbanos del Perímetro de Exclusión 2024; OSM cubre TODO el resto: el
// Biotrén, los servicios interurbanos sin GTFS (201, 401/411/421, Yumbel,
// Florida), terminales, paraderos OSM, ciclovías, áreas verdes, escuelas,
// POIs y el contexto geográfico de calles/edificios que entrega CARTO.
//
// Verificación
// ------------
// Verificado contra Overpass (overpass-api.de, 2026-05-16):
//   - Biotrén Línea 1: route_master OSM relation 6857223
//     (ref=L1, operator="Ferrocarriles del Sur S.A.", wikidata=Q5985914,
//     wikipedia=es:Línea 1 del Biotrén, network=Red Concepción de Movilidad,
//     network:wikidata=Q64158439). Variantes direccionales: relation 2170415
//     (Mercado → Hualqui) y relation 6738372 (Hualqui → Mercado).
//   - Biotrén Línea 2: route_master OSM relation 6857222
//     (ref=L2, wikidata=Q5986175, wikipedia=es:Línea 2 del Biotrén).
//     Variantes direccionales: relation 2170438 (Concepción → Coronel) y
//     relation 6852288 (Coronel → Concepción).
//   - Tren Laja–Talcahuano: relations 6757914 / 6757915 — sistema EFE Sur,
//     comparte rieles con Biotrén L1 pero NO se grafica en el visor.
//   - Estación Coronel: node 4124952607 (railway=station, railway:ref=CW,
//     wikidata=Q5788800).
//   - Cita histórica fundacional de OSM: 2004, Steve Coast, University
//     College London. ODbL como licencia de los datos OSM (vigente desde
//     12-sep-2012 en sustitución de CC BY-SA 2.0).
//
// Verificado contra el repo:
//   - scripts/fetch-biotren.ts → src/data/biotren.generated.ts (26 estaciones
//     L1+L2, con Wikidata Q-ids cuando OSM los declara).
//   - scripts/fetch-biotren-track.ts → src/data/biotren-track.generated.ts
//     (railway=rail ways operadas por EFE, costureo via corridor-Dijkstra).
//   - scripts/fetch-interurban-routes.ts → src/data/interurban-routes.generated.ts
//     (servicios 201, 401, 411, 421 digitalizados con waypoints OSM citados
//     + Dijkstra-por-corredor sobre el grafo highway=).
//   - scripts/fetch-paraderos.ts → src/data/paraderos.generated.ts
//     (highway=bus_stop, around:12000 m de Plaza Independencia).
//   - scripts/fetch-terminals.ts → src/data/terminals.generated.ts
//     (amenity=bus_station + public_transport=station[bus=yes]).
//   - scripts/fetch-pois.ts, fetch-cycleways.ts, fetch-greenspace.ts,
//     fetch-schools.ts — todos parten del mismo bbox metropolitano y de
//     Overpass.
//   - scripts/lib/overpass.ts — wrapper con triple-mirror failover
//     (overpass.kumi.systems → overpass-api.de → overpass.osm.ch),
//     User-Agent identificable, curl como transporte por inestabilidad de
//     undici contra mirrors.
//   - scripts/lib/simplify.ts — Ramer–Douglas–Peucker, tolerancia 5e-5
//     grados (~5 m a la latitud de Concepción) en los scripts de tren e
//     interurbanos.
//   - src/components/conce-map.tsx — atribución del basemap incluye
//     "© OSM" y "© CARTO" en el control de atribución de Leaflet.
//   - src/components/data-sources-sheet.tsx — declara OpenStreetMap como
//     fuente con licencia "Open Database License (ODbL)".
//
// Ámbar (no verificable al cierre o pendiente de actualización):
//   - El banner de scripts/fetch-biotren.ts y de biotren.generated.ts dice
//     "OSM does not currently have the Biotrén lines as route relations" —
//     ese comentario está DESACTUALIZADO. Las relations route/route_master
//     SÍ existen al cierre (ver IDs arriba). El script descarga estaciones
//     vía nodo, no vía relation; el track viene de fetch-biotren-track.ts
//     reconstruyendo desde way["railway"="rail"]["operator"~"EFE"]. Migrar
//     a las relations route_master es trabajo futuro real, no inventado.
//   - Número exacto de paraderos OSM (highway=bus_stop) descargados en la
//     última corrida — el dato vive en paraderos.generated.ts y cambia con
//     cada sync.
//   - Cobertura porcentual de paraderos OSM vs paraderos GTFS — ningún
//     script lo calcula al cierre.

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function OpenstreetmapFuenteVisor() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado.</strong> IDs de relation OSM del Biotrén (L1
        relation 6857223, L2 relation 6857222 como{' '}
        <code className="font-mono">route_master</code>; sus variantes
        direccionales 2170415, 6738372, 2170438, 6852288 como{' '}
        <code className="font-mono">route</code>) confirmadas vía Overpass
        contra <code className="font-mono">overpass-api.de</code> el
        2026-05-16. Pipeline de scripts del repo, atribución del basemap y
        declaración ODbL en el sheet de fuentes del visor: todos confirmados
        en código. Aviso: el comentario de cabecera de{' '}
        <code className="font-mono">scripts/fetch-biotren.ts</code> declara
        que "OSM does not currently have the Biotrén lines as route
        relations" — ese comentario quedó desactualizado y se documenta como
        trabajo futuro en la sección correspondiente.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          <strong>OpenStreetMap</strong> (OSM) es una enciclopedia
          geográfica colaborativa, libre y editable. Fundada en 2004 por
          Steve Coast en University College London, hoy la administra la
          OpenStreetMap Foundation (organización sin fines de lucro
          registrada en el Reino Unido) y la mantiene una comunidad mundial
          de voluntarios. Los datos están licenciados bajo{' '}
          <strong>Open Database License (ODbL) 1.0</strong> — atribución y
          share-alike.
        </p>
        <p>
          Para este visor OSM es la <strong>segunda fuente estructural</strong>,
          complementaria del feed{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>
          . Si el GTFS describe los buses urbanos del Perímetro de Exclusión
          2024, OSM describe <em>todo lo demás</em> que el mapa muestra: el
          Biotrén (sistema EFE), los servicios interurbanos sin GTFS
          (Ruta 201 Santa Juana, 401/411/421 Tomé, eventualmente Florida y
          Yumbel), los terminales, los paraderos no GTFS, las ciclovías, las
          plazas, las escuelas, los hospitales y la trama vial completa que
          entrega CARTO como basemap.
        </p>
        <p>
          La división es nítida y deliberada: el GTFS llega estructurado
          (horarios, rutas, paraderos con <code className="font-mono">stop_id</code>);
          OSM llega como <em>geografía con tags</em> — nodos, vías y
          relaciones etiquetadas. Cada fuente cubre lo que la otra no.
          Juntas alimentan el 100% de las capas del visor.
        </p>
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/about">
            openstreetmap.org · acerca de
          </SourceLink>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/History_of_OpenStreetMap">
            OSM Wiki · History of OpenStreetMap (Steve Coast, 2004, UCL)
          </SourceLink>
          <SourceLink href="https://osmfoundation.org/">
            OpenStreetMap Foundation
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Qué datos del visor vienen de OSM">
        <p>
          Inventario exhaustivo a partir de los scripts{' '}
          <code className="font-mono">scripts/fetch-*.ts</code> del repo.
          Cada uno produce un archivo{' '}
          <code className="font-mono">*.generated.ts</code> que el bundle
          importa estáticamente. Los IDs de relation citados están
          verificados vía Overpass al 2026-05-16.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dataset del visor</th>
                <th className="px-3 py-2 font-medium">Filtro OSM (tags)</th>
                <th className="px-3 py-2 font-medium">Referencia OSM verificada</th>
                <th className="px-3 py-2 font-medium">Script · salida</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">
                  Biotrén Línea 1 — 12 estaciones (Hualqui ↔ Mercado de Talcahuano)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">node[railway~"^(station|halt)$"][operator~"EFE",i]</code>{' '}
                  en bbox -37.10,-73.25,-36.65,-72.80
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <SourceLink href="https://www.openstreetmap.org/relation/6857223">
                    relation 6857223
                  </SourceLink>
                  {' '}(<code className="font-mono">route_master</code>, ref=L1,
                  Wikidata Q5985914)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-biotren.ts</code> →{' '}
                  <code className="font-mono">src/data/biotren.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  Biotrén Línea 2 — 14 estaciones (Coronel ↔ Concepción)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Misma query L1; la línea se distingue por orden EFE de estaciones.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <SourceLink href="https://www.openstreetmap.org/relation/6857222">
                    relation 6857222
                  </SourceLink>
                  {' '}(<code className="font-mono">route_master</code>, ref=L2,
                  Wikidata Q5986175)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-biotren.ts</code> →{' '}
                  <code className="font-mono">src/data/biotren.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  Trazado físico Biotrén L1+L2 (riel real)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">way[railway="rail"][operator~"EFE",i]</code>{' '}
                  costureados con corridor-Dijkstra entre estaciones
                  consecutivas.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Comparte rieles con relations 6757914 / 6757915 (Tren
                  Laja–Talcahuano, EFE Sur).
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-biotren-track.ts</code> →{' '}
                  <code className="font-mono">src/data/biotren-track.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  Ruta 201 / 201 AU — Concepción ↔ Santa Juana (DTPR ELC0007)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  No existe <code className="font-mono">relation route=bus ref=201</code>{' '}
                  al cierre. Waypoints OSM citados (way 83652338, way 88968095,
                  way 452349096, way 113257664, etc.) + grafo highway=
                  jerárquico sobre Ruta 156 / Ruta de la Madera.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Trazado físico de la 156 verificable en OSM por
                  <code className="font-mono">ref=156</code>; la digitalización
                  del servicio bus es propia del visor.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-interurban-routes.ts</code> →{' '}
                  <code className="font-mono">src/data/interurban-routes.generated.ts</code>{' '}
                  (campo <code className="font-mono">digitized: true</code>)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  401 / 411 / 421 Tomé (Perímetro de Exclusión de Tomé)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Tampoco existen como <code className="font-mono">relation route=bus</code>{' '}
                  en OSM. Waypoints citados Concepción → Plaza Perú → Rotonda
                  Bonilla → Cosmito → Bypass Penco → Lirquén → Bellavista →
                  Costanera de Tomé → Diego Portales (Plaza de Tomé) →
                  Vicente Palacios → Tomé Alto / Av. Daniel Vera (Dichato).
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Eje Ruta 150 verificable por <code className="font-mono">ref=150</code>{' '}
                  (Bypass Penco, Viaducto Puerto de Lirquén).
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-interurban-routes.ts</code> →{' '}
                  <code className="font-mono">src/data/interurban-routes.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  Paraderos (highway=bus_stop)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">node[highway="bus_stop"]</code>{' '}
                  con <code className="font-mono">around:12000</code> de
                  Plaza Independencia (Concepción centro).
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Conjunto dinámico — cambia con cada sync. Cubre Concepción,
                  Talcahuano, San Pedro, Chiguayante.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-paraderos.ts</code> →{' '}
                  <code className="font-mono">src/data/paraderos.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  Terminales de buses
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">amenity=bus_station</code> +{' '}
                  <code className="font-mono">public_transport=station[bus=yes]</code>{' '}
                  en el bbox metropolitano.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Incluye Terminal Manuel Rodríguez (way 425356582), Terminal
                  Camilo Henríquez (way 114474600), Terminal Collao (way 597586612).
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-terminals.ts</code> →{' '}
                  <code className="font-mono">src/data/terminals.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  Puntos de interés (POIs)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">amenity~"^(hospital|university|college)$"</code>{' '}
                  + <code className="font-mono">shop=mall</code>, con tag{' '}
                  <code className="font-mono">name</code> obligatorio.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Hospitales, universidades, malls del Gran Concepción.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-pois.ts</code> →{' '}
                  <code className="font-mono">src/data/pois.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Ciclovías</td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">highway=cycleway</code> (segregada)
                  + <code className="font-mono">highway=path[bicycle=designated]</code>{' '}
                  + ciclovías sobre calzada (<code className="font-mono">cycleway=lane|track</code>{' '}
                  y sus sufijos <code className="font-mono">:both/:left/:right</code>).
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Capa visible en el visor con clasificación segregada vs
                  compartida.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-cycleways.ts</code> →{' '}
                  <code className="font-mono">src/data/cycleways.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Áreas verdes</td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">leisure=park|garden|nature_reserve</code>{' '}
                  + <code className="font-mono">landuse=forest</code> +{' '}
                  <code className="font-mono">highway=pedestrian[area=yes]</code>{' '}
                  (plazas peatonales como áreas).
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Parques, plazas, reservas naturales del bbox.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-greenspace.ts</code> →{' '}
                  <code className="font-mono">src/data/greenspace.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Establecimientos educacionales</td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">amenity~"^(kindergarten|school|college|university)$"</code>{' '}
                  con <code className="font-mono">name</code>, nodos y ways.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Capa de equipamiento usada en el análisis de cobertura.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-schools.ts</code> →{' '}
                  <code className="font-mono">src/data/schools.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  Refs MOP de carreteras (146 / 150 / 156 / 160 / Q-60-O)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Tag <code className="font-mono">ref=</code> sobre los{' '}
                  <code className="font-mono">way</code> de la red vial. No se
                  descargan como dataset propio; se consumen al digitalizar
                  los corredores interurbanos y se citan en los artículos del
                  wiki.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <SourceLink href="https://www.openstreetmap.org/relation/6582801">
                    relation 6582801 (Ruta 146 · Yumbel)
                  </SourceLink>
                  ,{' '}
                  <SourceLink href="https://www.openstreetmap.org/way/1082594953">
                    way 1082594953 (Ruta 150 · ref oficial verificada)
                  </SourceLink>
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Consumido por <code className="font-mono">fetch-interurban-routes.ts</code>{' '}
                  y citado en los artículos hermanos.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">
                  Basemap (trama urbana, edificios, calles)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Tiles vectoriales de CARTO Positron / Dark Matter, derivados
                  de OSM al renderizar.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Atribución obligatoria al pie del mapa:{' '}
                  <code className="font-mono">© OSM · © CARTO</code>.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Servido en runtime por Leaflet (<code className="font-mono">conce-map.tsx</code>),
                  no hay <code className="font-mono">*.generated.ts</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Adicionalmente, las estaciones del Biotrén enlazan a Wikidata vía
          el tag OSM <code className="font-mono">wikidata=Q…</code> (por
          ejemplo: Coronel = Q5788800, Concepción = Q5841708, Mercado de
          Talcahuano = Q5843722). El script{' '}
          <code className="font-mono">fetch-wikidata.ts</code> consume esos
          Q-ids para enriquecer cada estación con su fecha de inauguración,
          imagen y artículo de Wikipedia ES. Es una sinergia OSM ↔ Wikidata,
          no una fuente independiente.
        </p>
      </Section>

      <Section title="Modelo de datos OSM para transporte">
        <p>
          OSM no tiene "rutas" como objeto de primera clase al estilo del
          GTFS. Lo que tiene son tres primitivas geométricas —
          <strong> node</strong> (punto),{' '}
          <strong> way</strong> (línea o polígono cerrado) y{' '}
          <strong> relation</strong> (agrupación ordenada de nodes y ways) —
          y un sistema libre de tags <code className="font-mono">key=value</code>{' '}
          encima. Convenciones de la comunidad establecen qué tags significan
          qué, recogidas en el OSM Wiki.
        </p>
        <KeyValueList
          items={[
            [
              'node railway=station',
              <>
                Estación con andén físico y servicio de pasajeros (Biotrén,
                Tren Laja–Talcahuano). Suele venir con{' '}
                <code className="font-mono">name</code>,
                {' '}<code className="font-mono">operator</code>,
                {' '}<code className="font-mono">railway:ref</code>{' '}
                (código corto interno) y, si la mapeó alguien con ojo,{' '}
                <code className="font-mono">wikidata</code>.
              </>,
            ],
            [
              'node railway=halt',
              <>
                Apeadero — parada menor sin instalaciones de estación
                completa. Se usa de forma intercambiable con{' '}
                <code className="font-mono">railway=station</code> en el
                contexto del Biotrén; el script filtra ambos.
              </>,
            ],
            [
              'node highway=bus_stop',
              <>
                Paradero urbano de bus. La gran mayoría de los paraderos OSM
                en Concepción están como nodo en la vía. Tag
                {' '}<code className="font-mono">shelter=yes</code> indica
                refugio físico,
                {' '}<code className="font-mono">ref</code> el código del
                letrero cuando corresponde, y{' '}
                <code className="font-mono">operator</code> la empresa
                operadora si la conoce el mapper.
              </>,
            ],
            [
              'way railway=rail',
              <>
                Vía férrea física. Una línea ferroviaria operativa son varios{' '}
                <code className="font-mono">way</code> conectados. Es la
                materia prima de{' '}
                <code className="font-mono">fetch-biotren-track.ts</code>:
                filtra por <code className="font-mono">operator~"EFE",i</code>,
                arma un grafo de nodos y corre Dijkstra-por-corredor entre
                estaciones consecutivas.
              </>,
            ],
            [
              'way highway=*',
              <>
                Trama vial. Jerarquía relevante para los corredores
                interurbanos:{' '}
                <code className="font-mono">motorway / trunk / primary /
                secondary / tertiary</code>{' '}
                y sus <code className="font-mono">_link</code>. El tag{' '}
                <code className="font-mono">ref</code> guarda la
                identificación MOP (ej. <code className="font-mono">ref=150</code>{' '}
                en la Ruta 150 Concepción–Tomé).
              </>,
            ],
            [
              'relation type=route',
              <>
                Recorrido completo de una variante de servicio (ida o vuelta,
                o un día específico). Para el Biotrén existen 2170415 y
                6738372 (L1 en sus dos sentidos), 2170438 y 6852288 (L2 en
                sus dos sentidos). Cada uno agrupa los nodos de estación y
                los ways de vía en orden de recorrido.
              </>,
            ],
            [
              'relation type=route_master',
              <>
                Conjunto de variantes que conforman una "línea" como concepto
                operativo. Biotrén L1 es la relation 6857223; agrupa las dos
                relations <code className="font-mono">route=train</code>{' '}
                direccionales. L2 es la relation 6857222. El visor todavía no
                consume esta capa (ver Trabajo futuro), pero el dato está
                disponible.
              </>,
            ],
            [
              'amenity=bus_station',
              <>
                Terminal de buses con instalaciones. En el corredor Tomé el
                "Terminal de líneas a Tomé" es{' '}
                <code className="font-mono">way 425356582</code>; en Yumbel
                la Terminal Camilo Henríquez es{' '}
                <code className="font-mono">way 114474600</code>.
              </>,
            ],
            [
              'Tags comunes',
              <>
                <code className="font-mono">name</code>,{' '}
                <code className="font-mono">ref</code>,{' '}
                <code className="font-mono">operator</code>,{' '}
                <code className="font-mono">from</code> /{' '}
                <code className="font-mono">to</code> /{' '}
                <code className="font-mono">via</code> (extremos del
                recorrido),{' '}
                <code className="font-mono">network</code>,{' '}
                <code className="font-mono">wheelchair</code> (accesibilidad),{' '}
                <code className="font-mono">tactile_paving</code>,{' '}
                <code className="font-mono">wikidata</code>,{' '}
                <code className="font-mono">wikipedia</code>.
              </>,
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Public_transport">
            OSM Wiki · Public transport (esquema v2)
          </SourceLink>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Tag:railway%3Dstation">
            OSM Wiki · Tag:railway=station
          </SourceLink>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Tag:highway%3Dbus_stop">
            OSM Wiki · Tag:highway=bus_stop
          </SourceLink>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Relation:route_master">
            OSM Wiki · Relation:route_master
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cómo lo usa este visor">
        <p>
          El patrón es uniforme entre todos los scripts{' '}
          <code className="font-mono">fetch-*.ts</code> que consumen OSM:
          query Overpass al momento de <em>build</em> (no al request del
          usuario), parseo de la respuesta JSON, normalización a tipos
          internos, y escritura de un archivo{' '}
          <code className="font-mono">*.generated.ts</code> que el bundle
          importa. El resultado es que el visor no depende de la
          disponibilidad de Overpass en runtime, y cada cambio en los datos
          OSM queda como diff revisable en git.
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Pipeline simplificado
          </div>
          <ol className="mt-2 ml-5 list-decimal space-y-1 text-[12px]">
            <li>
              <strong>Query Overpass.</strong> Lenguaje Overpass QL, formato
              de salida <code className="font-mono">[out:json]</code>,
              timeout 30–180 s según script. Servidor inicial:{' '}
              <code className="font-mono">overpass.kumi.systems</code>; si
              falla, fail-over a{' '}
              <code className="font-mono">overpass-api.de</code> y luego{' '}
              <code className="font-mono">overpass.osm.ch</code>. El wrapper
              vive en{' '}
              <code className="font-mono">scripts/lib/overpass.ts</code> y
              shell-outea a <code className="font-mono">curl</code> (el fetch
              nativo de Node tiene ETIMEDOUT intermitente contra esos
              mirrors).
            </li>
            <li>
              <strong>Parseo y normalización.</strong> La respuesta llega
              como <code className="font-mono">{'{ elements: Array<node|way|relation> }'}</code>.
              Cada script filtra por tipo de elemento y arma una estructura
              propia (estaciones, paraderos, terminales, ways de calles
              etc.).
            </li>
            <li>
              <strong>Procesamiento geométrico</strong> cuando aplica:
              construcción de grafos (Biotrén track e interurbanos), filtros
              por corredor para evitar derivar por ramales industriales, y
              Dijkstra de menor distancia entre nodos OSM consecutivos. Cada
              vértice del trazado final es un nodo OSM real — no hay
              coordenadas inventadas.
            </li>
            <li>
              <strong>Simplificación Ramer–Douglas–Peucker</strong>{' '}
              (implementada en{' '}
              <code className="font-mono">scripts/lib/simplify.ts</code>)
              con tolerancia <code className="font-mono">5e-5</code> grados
              (~5 m a la latitud de Concepción) para los trazados de tren e
              interurbanos. Mismo algoritmo y compañía conceptual del
              pipeline GTFS, distinta tolerancia (los rieles tienen curvas
              más finas que un bus urbano).
            </li>
            <li>
              <strong>Citation stamps.</strong> Los scripts conservan el OSM
              type+id de cada waypoint o estación en el archivo generado.
              Ese stamp es lo único que distingue un dato verificable de uno
              inventado.
            </li>
            <li>
              <strong>Escritura del archivo generado.</strong> Banner con
              fecha ISO y línea{' '}
              <code className="font-mono">// AUTO-GENERATED by …</code>{' '}
              encabezando cada archivo. Idempotencia: el script de
              interurbanos compara el contenido (sin banner) con la versión
              previa y no reescribe si no hay cambios significativos.
            </li>
            <li>
              <strong>Importación estática</strong> desde React. Los
              <code className="font-mono">*.generated.ts</code> entran al
              bundle como cualquier módulo TS. Los más pesados (track del
              Biotrén, interurbanos) se cargan con import dinámico cuando el
              usuario enciende la capa correspondiente.
            </li>
            <li>
              <strong>Render en Leaflet</strong> (<code className="font-mono">src/components/conce-map.tsx</code>):
              los datos OSM se pintan sobre la TileLayer de CARTO que ya
              entrega la trama urbana derivada de OSM. La atribución del
              control de Leaflet ya declara{' '}
              <code className="font-mono">© OSM · © CARTO · GTFS Gran Concepción CC BY 4.0</code>.
            </li>
          </ol>
        </div>
        <p>
          Re-generación: el comando{' '}
          <code className="font-mono">npm run sync:all</code> corre los 11
          scripts OSM + GTFS en orden. Cada script tiene también su comando
          aislado (<code className="font-mono">npm run sync:biotren</code>,{' '}
          <code className="font-mono">sync:paraderos</code>,{' '}
          <code className="font-mono">sync:interurban-routes</code>, etc.).
          Como cada archivo generado se commitea, los cambios upstream en
          OSM aparecen como diffs revisables — no es magia que ocurre en
          producción sin trazabilidad.
        </p>
        <Sources>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide">
            OSM Wiki · Overpass QL Language Guide
          </SourceLink>
          <SourceLink href="https://overpass-turbo.eu/">
            Overpass Turbo · sandbox interactivo de Overpass QL
          </SourceLink>
          <SourceLink href="https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm">
            Wikipedia · algoritmo Ramer–Douglas–Peucker
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Licencia ODbL">
        <p>
          Los datos de OSM están licenciados bajo{' '}
          <strong>Open Database License (ODbL) 1.0</strong>, vigente desde
          el 12 de septiembre de 2012 en reemplazo de la CC BY-SA 2.0 que
          regía hasta entonces. La transición fue gestionada por la OSM
          Foundation y aprobada por una mayoría calificada de la comunidad
          mapper.
        </p>
        <p>
          Tres obligaciones operativas relevantes para un visor que consume
          datos OSM:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Atribución.</strong> Toda obra que use datos OSM debe
            atribuir explícitamente "© colaboradores de OpenStreetMap" (en
            inglés "© OpenStreetMap contributors") en un lugar visible. El
            visor cumple en{' '}
            <code className="font-mono">src/components/conce-map.tsx</code>:
            la atribución de la TileLayer de Leaflet incluye{' '}
            <code className="font-mono">© OSM · © CARTO</code> al pie de
            cada vista del mapa.
          </li>
          <li>
            <strong>Share-alike (cláusula 4.4 de ODbL).</strong> Si una
            "Derivative Database" (base de datos derivada) se distribuye
            públicamente, debe ofrecerse bajo ODbL también. Los archivos{' '}
            <code className="font-mono">*.generated.ts</code> del repo son
            colecciones derivadas: extraen, transforman y agregan datos OSM.
            Al estar el repo bajo licencia abierta (MIT en el código + ODbL
            implícita en los datos OSM derivados publicados) y al citar la
            fuente, la condición se cumple en lo que el visor controla.
          </li>
          <li>
            <strong>Producced Work vs Derivative Database.</strong> Una
            captura visual del mapa (un PNG, una screenshot) es una
            "Produced Work" y no exige share-alike, sólo atribución. Una
            base de datos completa o sustancial sí cae en share-alike. La
            distinción es importante para usuarios que toman screenshots del
            visor: deben mantener la atribución visible, pero no necesitan
            relicenciar nada.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          El{' '}
          <code className="font-mono">src/components/data-sources-sheet.tsx</code>{' '}
          del visor ya declara explícitamente "Open Database License (ODbL)"
          como licencia de los datos OSM, junto al recuento de líneas
          Biotrén y terminales que provienen de esa fuente. CARTO, por su
          parte, agrega su propia atribución encima de OSM (los basemaps
          Positron / Dark Matter son derivados, distribuidos bajo términos
          de servicio CARTO).
        </p>
        <Sources>
          <SourceLink href="https://opendatacommons.org/licenses/odbl/1-0/">
            Open Data Commons · Open Database License (ODbL) 1.0 · texto oficial
          </SourceLink>
          <SourceLink href="https://www.openstreetmap.org/copyright">
            openstreetmap.org/copyright · cómo atribuir correctamente
          </SourceLink>
          <SourceLink href="https://wiki.osmfoundation.org/wiki/Licence">
            OSMF · License page (transición de CC BY-SA a ODbL, 12-sep-2012)
          </SourceLink>
          <SourceLink href="https://carto.com/attributions">
            CARTO · atribución de basemaps derivados de OSM
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cómo verificar y corregir OSM">
        <p>
          OSM es editable por cualquier persona con cuenta. La barrera de
          entrada es baja para correcciones puntuales y subes la curva
          rápido si te interesa mapear sistemáticamente. Cualquier mejora
          que hagas aparece en este visor en el próximo{' '}
          <code className="font-mono">npm run sync:*</code> del dataset que
          la consume.
        </p>
        <KeyValueList
          items={[
            [
              'Editar online',
              <>
                <SourceLink href="https://www.openstreetmap.org/edit">
                  openstreetmap.org/edit
                </SourceLink>{' '}
                — editor iD integrado al sitio. Es el más fácil para
                correcciones de tag o de posición.
              </>,
            ],
            [
              'Editar desktop',
              <>
                <SourceLink href="https://josm.openstreetmap.de/">JOSM</SourceLink>{' '}
                — editor de escritorio en Java. Estándar para mappers
                serios; tiene validador integrado, soporte para presets
                Chile y plugin de imágenes aéreas.
              </>,
            ],
            [
              'Reportar nota',
              <>
                <SourceLink href="https://www.openstreetmap.org/note/new">
                  Crear una nota
                </SourceLink>{' '}
                en el sitio OSM si ves un error pero no quieres editar tú.
                Otro mapper recoge la nota y aplica el cambio.
              </>,
            ],
            [
              'Convenciones Chile',
              <>
                <SourceLink href="https://wiki.openstreetmap.org/wiki/WikiProject_Chile">
                  WikiProject Chile
                </SourceLink>{' '}
                en el OSM Wiki documenta nomenclatura de calles, refs MOP,
                presets locales. Lectura obligatoria antes de mapear refs
                de carreteras.
              </>,
            ],
            [
              'Validadores externos',
              <>
                <SourceLink href="https://keepright.at/">KeepRight</SourceLink>,{' '}
                <SourceLink href="https://osmose.openstreetmap.fr/es/map/">
                  OSMose
                </SourceLink>{' '}
                y el inspector dentro de JOSM detectan inconsistencias
                comunes (way no cerrado donde debería, tags rotos, etc.).
              </>,
            ],
            [
              'Comunidad chilena',
              <>
                Lista{' '}
                <SourceLink href="https://lists.openstreetmap.org/listinfo/talk-cl">
                  talk-cl@openstreetmap.org
                </SourceLink>{' '}
                para discusiones técnicas y convenciones. Mappy parties
                regionales suelen anunciarse ahí o por el canal{' '}
                <code className="font-mono">#osm-cl</code> en OSM Discord /
                Matrix.
              </>,
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Para correcciones en datos que el visor usa directamente —
          posición de un paradero OSM, nombre de una estación Biotrén, ref
          MOP de una carretera — editar OSM es lo único necesario. Para
          datos del feed GTFS (paraderos urbanos, horarios) hay que
          contactar DTPR; OSM no es la fuente. Ver{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>{' '}
          para la otra mitad del flujo.
        </p>
      </Section>

      <Section title="Comparación con GTFS Gran Concepción">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">OpenStreetMap</th>
                <th className="px-3 py-2 font-medium">GTFS Gran Concepción</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Modelo de datos</td>
                <td className="px-3 py-2 text-[12px]">
                  Geografía con tags — node / way / relation +
                  <code className="font-mono">key=value</code>.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Tablas CSV en un ZIP — agency, routes, trips, stops,
                  stop_times, calendar, shapes.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Licencia</td>
                <td className="px-3 py-2 text-[12px]">
                  <strong>ODbL 1.0</strong> · atribución + share-alike.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  CC BY 4.0 presunta · sólo atribución (sin verificación
                  textual al cierre, ver artículo hermano).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Cadencia de actualización</td>
                <td className="px-3 py-2 text-[12px]">
                  Continua. Cualquier edit aparece en minutos en la base
                  pública; el visor lo recoge en la próxima corrida{' '}
                  <code className="font-mono">sync:*</code>.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Periódica, no documentada formalmente. Última fecha
                  pública conocida 1-may-2019 (más versiones posteriores
                  sin datar al cierre).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Cobertura geográfica</td>
                <td className="px-3 py-2 text-[12px]">
                  Mundial. Calidad heterogénea: muy alta en Concepción
                  centro, decreciente hacia comunas rurales.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Acotada al Perímetro de Exclusión Gran Concepción 2024
                  (7 comunas urbanas).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tipo de datos</td>
                <td className="px-3 py-2 text-[12px]">
                  Geometría + atributos físicos y operativos básicos
                  (operador, refugio, accesibilidad, refs MOP).
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Horarios programados, frecuencias, paraderos con código
                  oficial, secuencias trip-stop, calendario operativo.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tiempo real</td>
                <td className="px-3 py-2 text-[12px]">
                  No es su fuerte. La capa de tránsito en vivo no existe en
                  OSM como tal.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  GTFS-Realtime es el camino estándar. DTPR abrió
                  convocatoria 2024, sin fecha pública de implementación.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tarifas</td>
                <td className="px-3 py-2 text-[12px]">
                  No se modelan en OSM. Las tarifas viven en los artículos
                  del wiki y en{' '}
                  <code className="font-mono">routes.ts</code>.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Soporta tablas opcionales{' '}
                  <code className="font-mono">fare_attributes.txt</code> y{' '}
                  <code className="font-mono">fare_rules.txt</code>; el feed
                  Concepción no las usa al cierre.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Mantenedor</td>
                <td className="px-3 py-2 text-[12px]">
                  Comunidad voluntaria global, gobernanza vía OSM Foundation.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Subsecretaría de Transportes / DTPR Biobío (operadores
                  obligados por el contrato del Perímetro de Exclusión).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Rol en este visor</td>
                <td className="px-3 py-2 text-[12px]">
                  Biotrén, interurbanos sin GTFS, terminales, paraderos OSM,
                  ciclovías, plazas, escuelas, POIs, basemap.
                </td>
                <td className="px-3 py-2 text-[12px]">
                  Buses urbanos del PE 2024: trazado, paraderos y horarios
                  programados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Las dos fuentes se complementan por diseño: OSM aporta geografía y
          tags ricos, GTFS aporta estructura de servicio y horario. El feed
          GTFS no podría cubrir el Biotrén (no es bus); OSM no podría
          entregar el horario programado de las 200+ rutas urbanas con la
          precisión que entrega <code className="font-mono">stop_times.txt</code>.
        </p>
      </Section>

      <Section title="Limitaciones conocidas en el Biobío">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Cobertura desigual.</strong> Concepción centro y los
            corredores troncales (Ruta 150, Ruta 156, Ruta 160) están bien
            mapeados. La trama de calles en comunas rurales (Florida
            interior, Yumbel rural, Hualqui rural) tiene huecos visibles —
            faltan calles secundarias, paraderos cabecera, ramales
            menores.
          </li>
          <li>
            <strong>Horarios y frecuencias casi nunca están en OSM.</strong>{' '}
            Existe el tag{' '}
            <code className="font-mono">interval</code> (las relations
            Biotrén lo declaran: L1 = 15 min, L2 = 30 min, ambas con{' '}
            <code className="font-mono">interval:source</code> apuntando a
            <code className="font-mono"> fesur.cl</code> 2019), pero es la
            excepción. Para horarios estructurados, GTFS gana.
          </li>
          <li>
            <strong>Tarifas no se modelan.</strong> OSM no tiene tag
            estable para precio de pasaje. El visor obtiene tarifas desde
            artículos del wiki y desde declaraciones oficiales.
          </li>
          <li>
            <strong>Refs MOP a veces desactualizados.</strong> El caso más
            visible: la Ruta Q-60-O (acceso a Yumbel) figura en OSM como{' '}
            <code className="font-mono">ref=Q-60-O</code> con{' '}
            <code className="font-mono">old_ref=O-60</code> — refleja la
            renumeración MOP que no toda la cartografía recoge aún. Mejorar
            esto en OSM mejora el visor directamente.
          </li>
          <li>
            <strong>
              Variantes de servicio no siempre se mapean como{' '}
              <code className="font-mono">route_master</code>.
            </strong>{' '}
            En el Biotrén sí están (relations 6857222 y 6857223). En los
            buses interurbanos del Biobío, no existe ninguna relation{' '}
            <code className="font-mono">route=bus</code> para los servicios
            201, 401, 411, 421, Línea Azul Yumbel ni los privados de Florida
            al cierre. Por eso el visor digitaliza desde waypoints.
          </li>
          <li>
            <strong>Comentario obsoleto en el script Biotrén.</strong>{' '}
            <code className="font-mono">scripts/fetch-biotren.ts</code> y el
            archivo generado declaran "OSM does not currently have the
            Biotrén lines as route relations". Esa afirmación quedó
            desactualizada: las route_master 6857222 / 6857223 sí existen y
            sus variantes direccionales también. Migrar el script a
            consumir directamente la relation (en vez de filtrar nodos por
            operador) es trabajo futuro real y reduciría errores cuando
            haya cambios de operador o duplicidad de nombres.
          </li>
        </ul>
      </Section>

      <Section title="Trabajo futuro">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Migrar el pipeline Biotrén a las relations</strong>{' '}
            <code className="font-mono">route_master</code> 6857222 / 6857223.
            Hoy se descargan estaciones por nodo individual + ways de riel
            por operador, y se costuran con Dijkstra. La relation ya trae
            los miembros en orden — más fácil, más exacto, y queda
            sincronizado con los cambios upstream sin tocar listas
            hardcoded de nombres.
          </li>
          <li>
            <strong>Mapear los servicios interurbanos como route=bus</strong>{' '}
            en OSM (201, 401, 411, 421 inicialmente; Yumbel y Florida
            cuando estén consolidados). Esto reemplazaría la digitalización
            por waypoints del repo por una descarga directa de la relation.
          </li>
          <li>
            <strong>Enriquecer estaciones vía Wikidata.</strong> Ya está
            iniciado en <code className="font-mono">fetch-wikidata.ts</code>{' '}
            (trae fecha de inauguración, imagen y artículo Wikipedia ES
            desde los Q-ids declarados en OSM). Extender a terminales y
            POIs cuando tengan Q-id.
          </li>
          <li>
            <strong>Validar la trama metropolitana con OSMose.</strong>{' '}
            Pasar el bbox <code className="font-mono">-37.10,-73.25,-36.65,-72.80</code>{' '}
            por OSMose y corregir los issues que afectan capas del visor
            (paraderos sin nombre, ways no conectados, refs MOP rotos).
          </li>
          <li>
            <strong>Actualizar refs MOP donde falten.</strong> Especialmente
            sobre Q-60-O / O-60 y los tramos de Ruta 146 en el corredor
            Yumbel.
          </li>
          <li>
            <strong>Mapear paraderos cabecera de los interurbanos</strong>{' '}
            (Terminal San Sebastián de Yumbel y Terminal San Francisco
            actualmente sin OSM ID en el wiki; Plaza de Florida; Plaza de
            Armas Santa Juana ya está como way 83652338).
          </li>
        </ul>
      </Section>

      <Section title="Cómo contribuir a OSM Biobío">
        <p>
          Tres caminos según tu disponibilidad. Cualquiera de los tres
          mejora el visor en la próxima sincronización.
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Reportar sin editar.</strong> Si ves un error pero no
            quieres pelearte con un editor:{' '}
            <SourceLink href="https://www.openstreetmap.org/note/new">
              crea una nota
            </SourceLink>
            {' '}sobre la zona afectada. Tarda unos segundos.
          </li>
          <li>
            <strong>Editar puntualmente.</strong> Crea cuenta en{' '}
            <SourceLink href="https://www.openstreetmap.org/">openstreetmap.org</SourceLink>
            , entra a{' '}
            <SourceLink href="https://www.openstreetmap.org/edit">
              modo edición
            </SourceLink>{' '}
            y mueve un paradero, corrige un nombre, agrega un tag{' '}
            <code className="font-mono">shelter=yes</code> en un refugio
            recién instalado. Los cambios pequeños son los más útiles y los
            menos riesgosos.
          </li>
          <li>
            <strong>Mapear sistemáticamente.</strong> Lee el{' '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/WikiProject_Chile">
              WikiProject Chile
            </SourceLink>{' '}
            para las convenciones nacionales, suscríbete a{' '}
            <SourceLink href="https://lists.openstreetmap.org/listinfo/talk-cl">
              talk-cl
            </SourceLink>
            , y considera JOSM para edits largos. Áreas con prioridad para
            este visor: paraderos del corredor Concepción ↔ Tomé, terminales
            interurbanos de Yumbel y Florida, refs MOP en la Ruta Q-60-O.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Si lo que tienes es información de campo sin saber dónde ponerla
          en OSM (una foto de un paradero, el nombre real de un letrero,
          una observación de horario), también puedes abrirla como issue o
          pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev">
            el repositorio del visor
          </SourceLink>{' '}
          — el wiki la recoge mientras esperamos que aparezca en OSM
          upstream.
        </p>
      </Section>

      <Section title="Cronología">
        <Timeline
          items={[
            {
              date: '9-ago-2004',
              event: 'Steve Coast crea OpenStreetMap en University College London como respuesta al Ordnance Survey británico (cartografía pública pero no abierta). Punto de origen del proyecto.',
              source: { href: 'https://wiki.openstreetmap.org/wiki/History_of_OpenStreetMap', label: 'OSM Wiki · History' },
            },
            {
              date: '22-ago-2006',
              event: 'Se constituye la OpenStreetMap Foundation en el Reino Unido como organización sin fines de lucro. Asume la gobernanza del proyecto.',
              source: { href: 'https://osmfoundation.org/', label: 'OSMF' },
            },
            {
              date: '12-sep-2012',
              event: 'OSM completa la transición de licencia: pasa de CC BY-SA 2.0 a Open Database License (ODbL) 1.0. Los contribuidores no aceptantes ven sus aportes removidos; el resto de la base queda relicenciado.',
              source: { href: 'https://wiki.osmfoundation.org/wiki/Licence', label: 'OSMF · License' },
            },
            {
              date: 'Ene-1999',
              event: 'Inauguración del Biotrén Línea 1 (Concepción ↔ Chiguayante inicial, hoy Hualqui ↔ Mercado de Talcahuano). Tag start_date="1999-01" en la relation OSM L1.',
              source: { href: 'https://www.openstreetmap.org/relation/6857223', label: 'relation 6857223 (L1)' },
            },
            {
              date: '24-nov-2005',
              event: 'Inauguración del Biotrén Línea 2 (Concepción ↔ Coronel). Tag start_date="2005-11-24" en la relation OSM L2.',
              source: { href: 'https://www.openstreetmap.org/relation/6857222', label: 'relation 6857222 (L2)' },
            },
            {
              date: '2019',
              event: 'Las relations route_master del Biotrén ya están mapeadas en OSM con interval:source apuntando a fesur.cl 2019. Es la última fecha verificable de actualización del tag interval en las relations al cierre.',
            },
            {
              date: 'Q2-Q4 2024',
              event: 'Se construyen y commitean los scripts fetch-biotren.ts, fetch-biotren-track.ts, fetch-paraderos.ts, fetch-terminals.ts y los demás fetch-*.ts del repo. Pipeline OSM → archivos .generated.ts → render Leaflet ya en línea.',
            },
            {
              date: '2025',
              event: 'Se agrega fetch-interurban-routes.ts: digitaliza 201, 401, 411 y 421 desde waypoints OSM citados + corridor-Dijkstra sobre highway= jerárquico. Reemplaza el zigzag que daban las líneas rectas entre paraderos.',
            },
            {
              date: '14-may-2026',
              event: 'Última corrida de sync:biotren conocida (banner de src/data/biotren.generated.ts). 26 estaciones L1+L2 con coords OSM verificadas y Wikidata Q-ids cuando aplican.',
            },
            {
              date: '16-may-2026',
              event: 'Verificación contra Overpass de las IDs de relation del Biotrén citadas en este artículo y publicación de la ficha metodológica.',
            },
          ]}
        />
      </Section>

      <Section title="Vínculos con otros artículos">
        <p>
          Esta es una ficha metodológica de fuente — los artículos
          temáticos del wiki dependen de ella tanto como del{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>
          :
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>
            {' '}— la otra fuente estructural del visor. Cubre los buses
            urbanos del Perímetro de Exclusión 2024; lo que no entra en ese
            feed entra por OSM.
          </li>
          <li>
            <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">
              Biotrén y sus extensiones
            </a>
            {' '}— estaciones y trazado vienen de OSM (relations 6857222 /
            6857223 + nodos railway=station).
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 Santa Juana
            </a>
            {' '}— trazado digitalizado desde waypoints OSM citados + Ruta
            156 / Ruta de la Madera.
          </li>
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>
            {' '}— servicios 401 / 411 / 421 digitalizados sobre la Ruta 150
            (OSM <code className="font-mono">ref=150</code>).
          </li>
          <li>
            <a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">
              Concepción ↔ Yumbel
            </a>
            {' '}— cita refs OSM (relation 6582801 para Ruta 146, way
            454984703 para Q-60-O) aunque el servicio mismo no está
            graficado al cierre.
          </li>
          <li>
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
              Concepción ↔ Florida
            </a>
            {' '}— misma dependencia de OSM como única vía de digitalización
            mientras no haya GTFS.
          </li>
          <li>
            <a href="/wiki/electrocorredores-mop-biobio" className="underline underline-offset-2">
              Electrocorredores MOP del Biobío
            </a>
            {' '}— refs MOP de Ruta 160 / Ruta 150 / Concepción–Talcahuano
            citadas vía OSM.
          </li>
          <li>
            <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">
              Sobre este wiki
            </a>
            {' '}— compromiso editorial: si no hay fuente abierta, no entra
            al visor. OSM es la columna que sostiene ese compromiso para
            todo lo que no es bus urbano licitado.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            Recuento exacto de paraderos OSM (highway=bus_stop) en la última
            corrida de <code className="font-mono">sync:paraderos</code>.
            Vive en el banner del archivo generado y cambia con cada sync.
          </li>
          <li>
            Cobertura porcentual de paraderos OSM vs paraderos GTFS en el
            bbox metropolitano. Ningún script lo calcula al cierre.
          </li>
          <li>
            Inventario verificable de relations <code className="font-mono">route=bus</code>{' '}
            existentes en OSM para el Biobío (esperado: 0 al cierre, pero
            sin barrido sistemático que lo confirme).
          </li>
          <li>
            Estado real de la migración del pipeline Biotrén a las relations
            route_master 6857222 / 6857223 — hoy el script trae estaciones
            por nodo y rieles por operador.
          </li>
          <li>
            Lista actualizada de Q-ids Wikidata para todas las estaciones,
            terminales y POIs (algunos ya están en OSM, otros no).
          </li>
          <li>
            Mappy parties activas en Concepción / Biobío. Si existen
            actualmente, este artículo debe nombrarlas con frecuencia y
            contacto.
          </li>
        </ul>
        <PendingBanner>
          Vía de cierre principal: una ronda de validación con OSMose sobre
          el bbox metropolitano + barrido con Overpass de relations route=bus
          y route=train. Vía secundaria: contactar talk-cl@openstreetmap.org
          para confirmar si hay mappy parties activas en la región.
        </PendingBanner>
      </Section>

      <Section title="Fuentes">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.openstreetmap.org/about">
              openstreetmap.org · acerca del proyecto
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/copyright">
              openstreetmap.org/copyright · atribución y licencia
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://osmfoundation.org/">
              OpenStreetMap Foundation
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://opendatacommons.org/licenses/odbl/1-0/">
              Open Data Commons · Open Database License (ODbL) 1.0 · texto oficial
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://wiki.osmfoundation.org/wiki/Licence">
              OSMF · License (transición CC BY-SA → ODbL, 12-sep-2012)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://wiki.openstreetmap.org/wiki/Public_transport">
              OSM Wiki · Public transport (esquema v2)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://wiki.openstreetmap.org/wiki/Relation:route_master">
              OSM Wiki · Relation:route_master
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide">
              OSM Wiki · Overpass QL Language Guide
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://wiki.openstreetmap.org/wiki/WikiProject_Chile">
              OSM Wiki · WikiProject Chile
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://overpass-turbo.eu/">
              Overpass Turbo · sandbox interactivo
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/6857223">
              OSM relation 6857223 · Biotrén L1 (route_master, Wikidata Q5985914)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/6857222">
              OSM relation 6857222 · Biotrén L2 (route_master, Wikidata Q5986175)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/2170415">
              OSM relation 2170415 · Biotrén L1 (Mercado → Hualqui)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/6738372">
              OSM relation 6738372 · Biotrén L1 (Hualqui → Mercado)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/2170438">
              OSM relation 2170438 · Biotrén L2 (Concepción → Coronel)
            </SourceLink>
          </li>
          <li>
            <SourceLink href="https://www.openstreetmap.org/relation/6852288">
              OSM relation 6852288 · Biotrén L2 (Coronel → Concepción)
            </SourceLink>
          </li>
          <li>
            Scripts del repositorio que consumen OSM:{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-biotren.ts">
              fetch-biotren.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-biotren-track.ts">
              fetch-biotren-track.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-interurban-routes.ts">
              fetch-interurban-routes.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-paraderos.ts">
              fetch-paraderos.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-terminals.ts">
              fetch-terminals.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-pois.ts">
              fetch-pois.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-cycleways.ts">
              fetch-cycleways.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-greenspace.ts">
              fetch-greenspace.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-schools.ts">
              fetch-schools.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-wikidata.ts">
              fetch-wikidata.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/lib/overpass.ts">
              lib/overpass.ts
            </SourceLink>
            ,{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/lib/simplify.ts">
              lib/simplify.ts (RDP)
            </SourceLink>
            .
          </li>
        </ul>
      </Section>
    </div>
  );
}
