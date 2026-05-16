// OpenStreetMap como fuente del visor — ficha metodológica de la
// segunda fuente estructural (hermana de `gtfs-gran-concepcion.tsx`).
// OSM cubre lo que el GTFS no: Biotrén, interurbanos sin GTFS (201,
// 401/411/421, Yumbel, Florida), terminales, paraderos OSM, ciclovías,
// áreas verdes, escuelas, POIs y el basemap de CARTO.
//
// Verificación contra Overpass (overpass-api.de, 2026-05-16):
//   - Biotrén L1: route_master relation 6857223 (ref=L1, Q5985914).
//     Variantes 2170415 / 6738372.
//   - Biotrén L2: route_master relation 6857222 (ref=L2, Q5986175).
//     Variantes 2170438 / 6852288.
//   - Tren Laja–Talcahuano: 6757914 / 6757915 (comparte rieles con L1).
//   - Estación Coronel: node 4124952607 (Q5788800).
//   - OSM fundado en 2004 (Steve Coast, UCL). ODbL desde 12-sep-2012.
//
// Aviso de desactualización: el comentario de `fetch-biotren.ts` dice
// "OSM does not currently have the Biotrén lines as route relations" —
// está desactualizado, las route_master sí existen. Migrar el pipeline
// a las relations es trabajo futuro real.

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
        <strong>Verificado.</strong> IDs de relation Biotrén (L1: 6857223,
        L2: 6857222 como <code className="font-mono">route_master</code>;
        variantes 2170415, 6738372, 2170438, 6852288) confirmadas en
        Overpass el 2026-05-16. Pipeline de scripts, atribución del basemap
        y declaración ODbL en el visor: confirmados en código. Aviso: el
        comentario de cabecera de{' '}
        <code className="font-mono">scripts/fetch-biotren.ts</code> sobre
        "OSM does not currently have the Biotrén lines as route relations"
        quedó desactualizado (ver Trabajo futuro).
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          <strong>OpenStreetMap</strong> (OSM) es una enciclopedia
          geográfica colaborativa, libre y editable. Fundada en 2004 por
          Steve Coast en University College London, hoy la administra la
          OpenStreetMap Foundation (sin fines de lucro, Reino Unido). Los
          datos están bajo <strong>Open Database License (ODbL) 1.0</strong>{' '}
          — atribución + share-alike.
        </p>
        <p>
          Para este visor OSM es la <strong>segunda fuente estructural</strong>,
          complementaria del feed{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>
          . Si el GTFS cubre los buses urbanos del PE 2024, OSM cubre{' '}
          <em>todo lo demás</em>: Biotrén, interurbanos sin GTFS (201,
          401/411/421, Florida, Yumbel), terminales, paraderos no GTFS,
          ciclovías, plazas, escuelas, hospitales y la trama vial que
          entrega CARTO como basemap.
        </p>
        <p>
          La división es deliberada: GTFS llega estructurado (horarios,
          rutas, <code>stop_id</code>); OSM llega como <em>geografía con
          tags</em> — nodos, vías y relaciones etiquetadas. Juntas
          alimentan el 100% del visor.
        </p>
        <Sources>
          <SourceLink href="https://www.openstreetmap.org/about">openstreetmap.org · acerca</SourceLink>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/History_of_OpenStreetMap">OSM Wiki · History (2004, UCL)</SourceLink>
          <SourceLink href="https://osmfoundation.org/">OpenStreetMap Foundation</SourceLink>
        </Sources>
      </Section>

      <Section title="Qué datos del visor vienen de OSM">
        <p>
          Inventario a partir de los scripts{' '}
          <code className="font-mono">scripts/fetch-*.ts</code>. Cada uno
          produce un <code className="font-mono">*.generated.ts</code> que
          el bundle importa estáticamente. IDs de relation verificados al
          2026-05-16.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dataset</th>
                <th className="px-3 py-2 font-medium">Filtro OSM</th>
                <th className="px-3 py-2 font-medium">Referencia</th>
                <th className="px-3 py-2 font-medium">Script · salida</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Biotrén L1 (12 estaciones Hualqui ↔ Talcahuano)</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">node[railway~"^(station|halt)$"][operator~"EFE",i]</code> en bbox metropolitano</td>
                <td className="px-3 py-2 text-[12px]">
                  <SourceLink href="https://www.openstreetmap.org/relation/6857223">relation 6857223</SourceLink>{' '}
                  (ref=L1, Q5985914)
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <code className="font-mono">fetch-biotren.ts</code> → <code className="font-mono">biotren.generated.ts</code>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Biotrén L2 (14 estaciones Coronel ↔ Concepción)</td>
                <td className="px-3 py-2 text-[12px]">Misma query L1; orden EFE distingue líneas.</td>
                <td className="px-3 py-2 text-[12px]">
                  <SourceLink href="https://www.openstreetmap.org/relation/6857222">relation 6857222</SourceLink>{' '}
                  (ref=L2, Q5986175)
                </td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-biotren.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Trazado físico L1+L2</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">way[railway="rail"][operator~"EFE",i]</code> + corridor-Dijkstra entre estaciones.</td>
                <td className="px-3 py-2 text-[12px]">Comparte rieles con 6757914 / 6757915 (Tren Laja-Talcahuano).</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-biotren-track.ts</code> → <code className="font-mono">biotren-track.generated.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Ruta 201 — Concepción ↔ Santa Juana</td>
                <td className="px-3 py-2 text-[12px]">No existe relation route=bus ref=201. Waypoints OSM citados (way 83652338, 88968095, 452349096, 113257664) + grafo highway= sobre Ruta 156.</td>
                <td className="px-3 py-2 text-[12px]">Ruta 156 verificable por <code className="font-mono">ref=156</code>.</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-interurban-routes.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">401 / 411 / 421 Tomé</td>
                <td className="px-3 py-2 text-[12px]">Sin relation route=bus. Waypoints: Plaza Perú → Rotonda Bonilla → Cosmito → Bypass Penco → Lirquén → Bellavista → Costanera Tomé → Diego Portales → Tomé Alto / Dichato.</td>
                <td className="px-3 py-2 text-[12px]">Ruta 150 por <code className="font-mono">ref=150</code>.</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-interurban-routes.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Paraderos</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">node[highway="bus_stop"] around:12000</code> de Plaza Independencia.</td>
                <td className="px-3 py-2 text-[12px]">Cubre Concepción, Talcahuano, San Pedro, Chiguayante.</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-paraderos.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Terminales</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">amenity=bus_station</code> + <code className="font-mono">public_transport=station[bus=yes]</code>.</td>
                <td className="px-3 py-2 text-[12px]">Manuel Rodríguez (way 425356582), Camilo Henríquez (114474600), Collao (597586612).</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-terminals.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">POIs</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">amenity~"^(hospital|university|college)$"</code> + <code className="font-mono">shop=mall</code>.</td>
                <td className="px-3 py-2 text-[12px]">Hospitales, universidades, malls del Gran Concepción.</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-pois.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Ciclovías</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">highway=cycleway</code> + <code className="font-mono">path[bicycle=designated]</code> + <code className="font-mono">cycleway=lane|track</code>.</td>
                <td className="px-3 py-2 text-[12px]">Segregada vs compartida en el visor.</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-cycleways.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Áreas verdes</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">leisure=park|garden|nature_reserve</code> + <code className="font-mono">landuse=forest</code> + plazas peatonales.</td>
                <td className="px-3 py-2 text-[12px]">Parques y reservas del bbox.</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-greenspace.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Escuelas</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">amenity~"^(kindergarten|school|college|university)$"</code> con name.</td>
                <td className="px-3 py-2 text-[12px]">Equipamiento para análisis de cobertura.</td>
                <td className="px-3 py-2 text-[12px]"><code className="font-mono">fetch-schools.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Refs MOP (146/150/156/160/Q-60-O)</td>
                <td className="px-3 py-2 text-[12px]">Tag <code className="font-mono">ref=</code> sobre ways viales. No es dataset propio; se consume al digitalizar interurbanos.</td>
                <td className="px-3 py-2 text-[12px]">
                  <SourceLink href="https://www.openstreetmap.org/relation/6582801">relation 6582801 (Ruta 146)</SourceLink>,{' '}
                  <SourceLink href="https://www.openstreetmap.org/way/1082594953">way 1082594953 (Ruta 150)</SourceLink>
                </td>
                <td className="px-3 py-2 text-[12px]">Consumido por <code className="font-mono">fetch-interurban-routes.ts</code></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Basemap</td>
                <td className="px-3 py-2 text-[12px]">Tiles CARTO Positron / Dark Matter, derivados de OSM.</td>
                <td className="px-3 py-2 text-[12px]">Atribución <code className="font-mono">© OSM · © CARTO</code> al pie.</td>
                <td className="px-3 py-2 text-[12px]">Runtime en Leaflet (<code className="font-mono">conce-map.tsx</code>), sin <code>.generated.ts</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Las estaciones Biotrén enlazan Wikidata vía OSM{' '}
          <code className="font-mono">wikidata=Q…</code> (Coronel Q5788800,
          Concepción Q5841708, Mercado de Talcahuano Q5843722).{' '}
          <code className="font-mono">fetch-wikidata.ts</code> enriquece
          con fecha de inauguración, imagen y artículo Wikipedia ES.
          Sinergia OSM ↔ Wikidata, no fuente independiente.
        </p>
      </Section>

      <Section title="Modelo de datos OSM para transporte">
        <p>
          OSM no tiene "rutas" como objeto de primera clase como GTFS.
          Tiene tres primitivas — <strong>node</strong> (punto),{' '}
          <strong>way</strong> (línea/polígono) y{' '}
          <strong>relation</strong> (agrupación ordenada) — y tags libres{' '}
          <code className="font-mono">key=value</code> encima. Convenciones
          en el OSM Wiki.
        </p>
        <KeyValueList
          items={[
            ['node railway=station', <>Estación con andén físico (Biotrén, Laja-Talcahuano). Tags: <code>name</code>, <code>operator</code>, <code>railway:ref</code>, <code>wikidata</code>.</>],
            ['node railway=halt', <>Apeadero menor. Intercambiable con <code>railway=station</code> para el Biotrén; el script filtra ambos.</>],
            ['node highway=bus_stop', <>Paradero urbano. <code>shelter=yes</code> indica refugio, <code>ref</code> el código del letrero, <code>operator</code> la empresa.</>],
            ['way railway=rail', <>Vía férrea física. Materia prima de <code className="font-mono">fetch-biotren-track.ts</code>: filtra <code>operator~"EFE",i</code> y corre Dijkstra-por-corredor.</>],
            ['way highway=*', <>Trama vial. Jerarquía <code>motorway/trunk/primary/secondary/tertiary</code>. Tag <code>ref</code> guarda ID MOP (ej. <code>ref=150</code>).</>],
            ['relation type=route', <>Recorrido por variante. Biotrén: 2170415 / 6738372 (L1) y 2170438 / 6852288 (L2).</>],
            ['relation type=route_master', <>Conjunto de variantes = "línea" operativa. Biotrén L1 = 6857223, L2 = 6857222. El visor aún no consume esta capa (ver Trabajo futuro).</>],
            ['amenity=bus_station', <>Terminal. Tomé: <code>way 425356582</code>; Yumbel Camilo Henríquez: <code>way 114474600</code>.</>],
            ['Tags comunes', <><code>name</code>, <code>ref</code>, <code>operator</code>, <code>from/to/via</code>, <code>network</code>, <code>wheelchair</code>, <code>tactile_paving</code>, <code>wikidata</code>, <code>wikipedia</code>.</>],
          ]}
        />
        <Sources>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Public_transport">OSM Wiki · Public transport v2</SourceLink>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Tag:railway%3Dstation">OSM Wiki · railway=station</SourceLink>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Tag:highway%3Dbus_stop">OSM Wiki · highway=bus_stop</SourceLink>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Relation:route_master">OSM Wiki · route_master</SourceLink>
        </Sources>
      </Section>

      <Section title="Cómo lo usa este visor">
        <p>
          Patrón uniforme en todos los <code className="font-mono">fetch-*.ts</code>:
          query Overpass al <em>build</em>, parseo JSON, normalización y
          escritura de <code className="font-mono">*.generated.ts</code>{' '}
          que el bundle importa. El visor no depende de Overpass en runtime;
          cada cambio queda como diff revisable en git.
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Pipeline simplificado
          </div>
          <ol className="mt-2 ml-5 list-decimal space-y-1 text-[12px]">
            <li>
              <strong>Query Overpass.</strong> Overpass QL,{' '}
              <code className="font-mono">[out:json]</code>, timeout 30-180 s.
              Triple-mirror failover (<code className="font-mono">kumi.systems</code>{' '}
              → <code className="font-mono">overpass-api.de</code> →{' '}
              <code className="font-mono">osm.ch</code>) en{' '}
              <code className="font-mono">scripts/lib/overpass.ts</code>{' '}
              vía curl (el fetch nativo de Node sufre ETIMEDOUT contra los
              mirrors).
            </li>
            <li>
              <strong>Parseo y normalización.</strong> Respuesta{' '}
              <code className="font-mono">{'{ elements: Array<node|way|relation> }'}</code>{' '}
              filtrada por tipo a estructuras propias.
            </li>
            <li>
              <strong>Procesamiento geométrico</strong>: grafos (Biotrén
              track, interurbanos), filtros por corredor para evitar
              ramales industriales, Dijkstra entre nodos OSM consecutivos.
              Cada vértice es un nodo OSM real.
            </li>
            <li>
              <strong>Simplificación Ramer-Douglas-Peucker</strong>{' '}
              (<code className="font-mono">scripts/lib/simplify.ts</code>),
              tolerancia <code className="font-mono">5e-5</code> grados
              (~5 m en la latitud de Concepción).
            </li>
            <li>
              <strong>Citation stamps.</strong> Los scripts conservan el
              OSM type+id de cada waypoint o estación. Ese stamp distingue
              dato verificable de inventado.
            </li>
            <li>
              <strong>Escritura del archivo generado</strong> con banner{' '}
              <code className="font-mono">// AUTO-GENERATED by …</code> y
              fecha ISO. El script de interurbanos no reescribe si no hay
              cambios significativos.
            </li>
            <li>
              <strong>Importación estática</strong> desde React. Los
              datasets pesados (track Biotrén, interurbanos) entran con
              import dinámico al encender la capa.
            </li>
            <li>
              <strong>Render Leaflet</strong> (<code className="font-mono">conce-map.tsx</code>)
              sobre TileLayer CARTO. Atribución del control:{' '}
              <code className="font-mono">© OSM · © CARTO · GTFS Gran Concepción CC BY 4.0</code>.
            </li>
          </ol>
        </div>
        <p>
          Re-generación: <code className="font-mono">npm run sync:all</code>{' '}
          corre los 11 scripts. Cada uno tiene comando aislado
          (<code className="font-mono">sync:biotren</code>,{' '}
          <code className="font-mono">sync:paraderos</code>,
          {' '}<code className="font-mono">sync:interurban-routes</code>,
          etc.). Cambios upstream aparecen como diffs revisables al commitear.
        </p>
        <Sources>
          <SourceLink href="https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide">OSM Wiki · Overpass QL</SourceLink>
          <SourceLink href="https://overpass-turbo.eu/">Overpass Turbo · sandbox</SourceLink>
          <SourceLink href="https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm">Wikipedia · RDP</SourceLink>
        </Sources>
      </Section>

      <Section title="Licencia ODbL">
        <p>
          Datos OSM bajo <strong>Open Database License (ODbL) 1.0</strong>,
          vigente desde el <strong>12-sep-2012</strong> en reemplazo de la
          CC BY-SA 2.0. Tres obligaciones operativas:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Atribución.</strong> "© colaboradores de OpenStreetMap"
            visible. El visor cumple en{' '}
            <code className="font-mono">conce-map.tsx</code>:{' '}
            <code className="font-mono">© OSM · © CARTO</code> al pie del
            mapa.
          </li>
          <li>
            <strong>Share-alike (cláusula 4.4).</strong> "Derivative
            Database" distribuida públicamente debe ofrecerse bajo ODbL.
            Los <code className="font-mono">*.generated.ts</code> son
            derivados; el repo cita fuente.
          </li>
          <li>
            <strong>Produced Work vs Derivative Database.</strong> Una
            screenshot del mapa es "Produced Work" — solo atribución, sin
            share-alike. Una base de datos sustancial sí cae en share-alike.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          <code className="font-mono">data-sources-sheet.tsx</code> declara
          "Open Database License (ODbL)" como licencia OSM. CARTO agrega
          atribución propia (basemaps Positron / Dark Matter bajo términos
          de servicio CARTO).
        </p>
        <Sources>
          <SourceLink href="https://opendatacommons.org/licenses/odbl/1-0/">Open Data Commons · ODbL 1.0</SourceLink>
          <SourceLink href="https://www.openstreetmap.org/copyright">openstreetmap.org/copyright</SourceLink>
          <SourceLink href="https://wiki.osmfoundation.org/wiki/Licence">OSMF · License (CC BY-SA → ODbL, 12-sep-2012)</SourceLink>
          <SourceLink href="https://carto.com/attributions">CARTO · atribución basemaps</SourceLink>
        </Sources>
      </Section>

      <Section title="Cómo verificar y corregir OSM">
        <p>
          OSM es editable con cuenta. Correcciones puntuales tienen barrera
          baja; cualquier mejora aparece en el próximo{' '}
          <code className="font-mono">npm run sync:*</code>.
        </p>
        <KeyValueList
          items={[
            ['Editar online', <><SourceLink href="https://www.openstreetmap.org/edit">openstreetmap.org/edit</SourceLink> — editor iD para correcciones de tag o posición.</>],
            ['Editar desktop', <><SourceLink href="https://josm.openstreetmap.de/">JOSM</SourceLink> — Java, validador, presets Chile, imágenes aéreas.</>],
            ['Reportar nota', <><SourceLink href="https://www.openstreetmap.org/note/new">Crear nota</SourceLink> si ves un error y no quieres editar.</>],
            ['Convenciones Chile', <><SourceLink href="https://wiki.openstreetmap.org/wiki/WikiProject_Chile">WikiProject Chile</SourceLink> — nomenclatura de calles, refs MOP, presets.</>],
            ['Validadores', <><SourceLink href="https://keepright.at/">KeepRight</SourceLink> y <SourceLink href="https://osmose.openstreetmap.fr/es/map/">OSMose</SourceLink> detectan ways rotos, tags inconsistentes.</>],
            ['Comunidad CL', <><SourceLink href="https://lists.openstreetmap.org/listinfo/talk-cl">talk-cl</SourceLink> y <code className="font-mono">#osm-cl</code> en OSM Discord/Matrix.</>],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Datos OSM (paradero, estación, ref MOP) → editar OSM directamente.
          Datos GTFS (paraderos urbanos, horarios) → contactar DTPR (ver{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>
          ).
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
                <td className="px-3 py-2 font-medium">Modelo</td>
                <td className="px-3 py-2 text-[12px]">node/way/relation + tags <code>key=value</code></td>
                <td className="px-3 py-2 text-[12px]">CSV en ZIP — agency, routes, trips, stops, stop_times, calendar, shapes</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Licencia</td>
                <td className="px-3 py-2 text-[12px]"><strong>ODbL 1.0</strong> · atribución + share-alike</td>
                <td className="px-3 py-2 text-[12px]">CC BY 4.0 presunta · solo atribución (sin verificación textual)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Actualización</td>
                <td className="px-3 py-2 text-[12px]">Continua; el visor recoge cada <code>sync:*</code></td>
                <td className="px-3 py-2 text-[12px]">Periódica sin documentar. Última fecha pública 1-may-2019</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Cobertura</td>
                <td className="px-3 py-2 text-[12px]">Mundial. Alta en Concepción centro, decreciente al rural</td>
                <td className="px-3 py-2 text-[12px]">PE Gran Concepción 2024 (7 comunas urbanas)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Datos</td>
                <td className="px-3 py-2 text-[12px]">Geometría + atributos físicos/operativos (operador, refugio, AU, refs)</td>
                <td className="px-3 py-2 text-[12px]">Horarios, frecuencias, stop_id, secuencias trip-stop, calendario</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tiempo real</td>
                <td className="px-3 py-2 text-[12px]">No</td>
                <td className="px-3 py-2 text-[12px]">GTFS-Realtime estándar. DTPR convocatoria 2024 sin fecha</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tarifas</td>
                <td className="px-3 py-2 text-[12px]">No se modelan; viven en wiki y <code>routes.ts</code></td>
                <td className="px-3 py-2 text-[12px]"><code>fare_attributes.txt</code> opcional; el feed CCP no las usa</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Mantenedor</td>
                <td className="px-3 py-2 text-[12px]">Comunidad voluntaria global · OSMF</td>
                <td className="px-3 py-2 text-[12px]">SUBTRANS / DTPR Biobío (operadores PE obligados)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Rol en el visor</td>
                <td className="px-3 py-2 text-[12px]">Biotrén, interurbanos, terminales, paraderos OSM, ciclovías, plazas, escuelas, POIs, basemap</td>
                <td className="px-3 py-2 text-[12px]">Buses urbanos PE 2024: trazado, paraderos, horarios</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Complementarias por diseño: OSM aporta geografía + tags; GTFS
          aporta estructura de servicio y horario. GTFS no cubre Biotrén
          (no es bus); OSM no entrega <code>stop_times.txt</code> para
          200+ rutas urbanas.
        </p>
      </Section>

      <Section title="Limitaciones conocidas en el Biobío">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Cobertura desigual.</strong> Concepción centro y
            troncales (Ruta 150 / 156 / 160) bien mapeados. Comunas rurales
            (Florida interior, Yumbel rural, Hualqui rural) con huecos:
            calles secundarias, paraderos cabecera, ramales menores.
          </li>
          <li>
            <strong>Horarios casi nunca en OSM.</strong> Tag{' '}
            <code className="font-mono">interval</code> excepcional (L1 = 15
            min, L2 = 30 min, <code>interval:source</code> = fesur.cl 2019).
            Para horarios estructurados, GTFS gana.
          </li>
          <li>
            <strong>Tarifas no se modelan</strong> — viven en artículos del
            wiki y declaraciones oficiales.
          </li>
          <li>
            <strong>Refs MOP a veces desactualizados.</strong> Q-60-O
            figura como <code>ref=Q-60-O</code> con <code>old_ref=O-60</code>;
            no toda la cartografía recoge la renumeración.
          </li>
          <li>
            <strong>Variantes route_master incompletas.</strong> Biotrén
            sí (6857222/6857223). Buses interurbanos (201, 401, 411, 421,
            Yumbel, Florida) NO tienen relation <code>route=bus</code> al
            cierre — el visor digitaliza desde waypoints.
          </li>
          <li>
            <strong>Comentario obsoleto.</strong>{' '}
            <code className="font-mono">scripts/fetch-biotren.ts</code>{' '}
            declara "OSM does not currently have the Biotrén lines as
            route relations" — las route_master sí existen. Migrar el
            script a consumir relation reduciría errores ante cambios de
            operador.
          </li>
        </ul>
      </Section>

      <Section title="Trabajo futuro">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Migrar pipeline Biotrén a route_master</strong>{' '}
            (6857222 / 6857223). La relation trae miembros en orden — más
            exacto que filtrar nodos por operador.
          </li>
          <li>
            <strong>Mapear interurbanos como route=bus</strong> en OSM
            (201, 401, 411, 421; Yumbel y Florida después). Reemplazaría la
            digitalización por waypoints.
          </li>
          <li>
            <strong>Enriquecer estaciones vía Wikidata.</strong>{' '}
            <code className="font-mono">fetch-wikidata.ts</code> trae
            fecha, imagen, artículo Wikipedia desde Q-ids. Extender a
            terminales y POIs.
          </li>
          <li>
            <strong>Validar con OSMose</strong> el bbox{' '}
            <code className="font-mono">-37.10,-73.25,-36.65,-72.80</code>{' '}
            y corregir paraderos sin name, ways no conectados, refs MOP rotos.
          </li>
          <li>
            <strong>Actualizar refs MOP</strong> en Q-60-O y tramos de
            Ruta 146 (Yumbel).
          </li>
          <li>
            <strong>Mapear paraderos cabecera</strong> de interurbanos
            (Terminal San Sebastián Yumbel, Terminal San Francisco, Plaza
            de Florida; Plaza de Armas Santa Juana ya está como way
            83652338).
          </li>
        </ul>
      </Section>

      <Section title="Cómo contribuir a OSM Biobío">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>Reportar sin editar.</strong>{' '}
            <SourceLink href="https://www.openstreetmap.org/note/new">
              Crear nota
            </SourceLink>{' '}
            sobre la zona afectada.
          </li>
          <li>
            <strong>Editar puntualmente.</strong> Cuenta en{' '}
            <SourceLink href="https://www.openstreetmap.org/">openstreetmap.org</SourceLink>
            , <SourceLink href="https://www.openstreetmap.org/edit">modo edición</SourceLink> —
            mueve un paradero, corrige nombre, agrega <code>shelter=yes</code>.
          </li>
          <li>
            <strong>Mapear sistemáticamente.</strong> Lee{' '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/WikiProject_Chile">WikiProject Chile</SourceLink>,
            suscríbete a <SourceLink href="https://lists.openstreetmap.org/listinfo/talk-cl">talk-cl</SourceLink>,
            usa JOSM. Prioridades: paraderos Concepción ↔ Tomé, terminales
            Yumbel/Florida, refs Q-60-O.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Información de campo sin saber dónde mapear → issue o PR en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev">
            el repo del visor
          </SourceLink>
          .
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
              event: 'Inauguración Biotrén L1 (tag start_date="1999-01" en relation OSM L1).',
              source: { href: 'https://www.openstreetmap.org/relation/6857223', label: 'relation 6857223 (L1)' },
            },
            {
              date: '24-nov-2005',
              event: 'Inauguración Biotrén L2 (tag start_date="2005-11-24" en relation OSM L2).',
              source: { href: 'https://www.openstreetmap.org/relation/6857222', label: 'relation 6857222 (L2)' },
            },
            { date: '2019', event: 'Relations route_master Biotrén con interval:source apuntando a fesur.cl 2019.' },
            { date: 'Q2-Q4 2024', event: 'Pipeline OSM → .generated.ts → Leaflet en línea (scripts fetch-biotren, fetch-paraderos, fetch-terminals, etc.).' },
            { date: '2025', event: 'fetch-interurban-routes.ts digitaliza 201, 401, 411, 421 desde waypoints OSM + corridor-Dijkstra.' },
            { date: '14-may-2026', event: 'Última corrida sync:biotren conocida. 26 estaciones L1+L2 verificadas con Q-ids.' },
            { date: '16-may-2026', event: 'Verificación Overpass de las relations Biotrén y publicación de la ficha.' },
          ]}
        />
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>{' '}
            — la otra fuente estructural. Cubre buses urbanos PE 2024.
          </li>
          <li>
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
              Biotrén y sus extensiones
            </a>{' '}
            — estaciones y trazado desde relations 6857222/6857223.
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 Santa Juana
            </a>{' '}
            — trazado desde waypoints OSM + Ruta 156.
          </li>
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>{' '}
            — 401/411/421 digitalizados sobre <code>ref=150</code>.
          </li>
          <li>
            <a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">
              Concepción ↔ Yumbel
            </a>{' '}
            — cita relation 6582801 (Ruta 146) y way 454984703 (Q-60-O),
            servicio no graficado.
          </li>
          <li>
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
              Concepción ↔ Florida
            </a>{' '}
            — OSM como única vía de digitalización mientras no haya GTFS.
          </li>
          <li>
            <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
              Electrocorredores MOP del Biobío
            </a>{' '}
            — refs MOP de Ruta 160 / 150 / Concepción-Talcahuano vía OSM.
          </li>
          <li>
            <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">
              Sobre este wiki
            </a>{' '}
            — compromiso: sin fuente abierta no entra al visor. OSM
            sostiene todo lo no-bus-urbano.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Recuento exacto de paraderos OSM en la última <code className="font-mono">sync:paraderos</code> (vive en el banner del archivo, cambia con cada sync).</li>
          <li>Cobertura porcentual paraderos OSM vs GTFS en el bbox.</li>
          <li>Inventario verificable de relations <code>route=bus</code> en el Biobío (esperado 0).</li>
          <li>Estado de migración del pipeline Biotrén a route_master 6857222/6857223.</li>
          <li>Q-ids Wikidata para estaciones, terminales y POIs faltantes.</li>
          <li>Mappy parties activas en Concepción / Biobío.</li>
        </ul>
        <PendingBanner>
          Cierre: ronda de validación con OSMose sobre el bbox + barrido
          Overpass de relations route=bus/route=train. Secundario: contactar
          talk-cl@openstreetmap.org.
        </PendingBanner>
      </Section>

      <Section title="Fuentes">
        <ul className="ml-5 list-disc space-y-1 text-[12px]">
          <li>
            <SourceLink href="https://www.openstreetmap.org/about">openstreetmap.org · acerca</SourceLink>
            {' · '}
            <SourceLink href="https://www.openstreetmap.org/copyright">copyright / atribución</SourceLink>
            {' · '}
            <SourceLink href="https://osmfoundation.org/">OSM Foundation</SourceLink>
          </li>
          <li>
            <SourceLink href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL 1.0 · texto oficial</SourceLink>
            {' · '}
            <SourceLink href="https://wiki.osmfoundation.org/wiki/Licence">OSMF License (CC BY-SA → ODbL, 12-sep-2012)</SourceLink>
          </li>
          <li>
            OSM Wiki:{' '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/Public_transport">Public transport v2</SourceLink>
            {' · '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/Relation:route_master">route_master</SourceLink>
            {' · '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide">Overpass QL</SourceLink>
            {' · '}
            <SourceLink href="https://wiki.openstreetmap.org/wiki/WikiProject_Chile">WikiProject Chile</SourceLink>
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
            {' (L1 variantes); '}
            <SourceLink href="https://www.openstreetmap.org/relation/2170438">2170438</SourceLink>
            {', '}
            <SourceLink href="https://www.openstreetmap.org/relation/6852288">6852288</SourceLink>
            {' (L2 variantes).'}
          </li>
          <li>
            Scripts del repo que consumen OSM:{' '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-biotren.ts">fetch-biotren</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-biotren-track.ts">fetch-biotren-track</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-interurban-routes.ts">fetch-interurban-routes</SourceLink>
            {', '}
            <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/blob/main/scripts/fetch-paraderos.ts">fetch-paraderos</SourceLink>
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
      </Section>
    </div>
  );
}
