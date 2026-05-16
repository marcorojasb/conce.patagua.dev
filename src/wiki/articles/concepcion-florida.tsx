// Concepción ↔ Florida — único artículo del corredor (también conocido
// coloquialmente como "el corredor de El Pimentón").
//
// El servicio troncal sigue siendo PRIVADO al cierre de 2025: cuatro
// operadores (Delsal, Nueva Libertadores, Biocosta, Trinidad) compiten en
// la misma franja sin un decreto único. En paralelo, desde 2025 hay
// servicios subsidiados nuevos para tramos rurales específicos y un
// servicio nocturno. Este artículo concentra la ficha del servicio
// (troncal diurno + capas subsidiadas) y absorbe lo que antes vivía en
// la ficha separada "corredor-el-pimenton" (fusionada 2026-05-16): el
// topónimo coloquial, la geografía de la cuesta y la fragmentación
// regulatoria del corredor.

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

export default function ConcepcionFlorida() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente.</strong> Operadores (4),
        paradero histórico en Concepción, flota combinada (~40 buses),
        declaraciones del SEREMI, hitos 2024-2025 y nuevas capas
        subsidiadas: con fuente primaria. <strong>Pendientes</strong>:
        tabla horaria oficial 2026, tarifas vigentes de cada operador,
        razón social/RUT de cada uno, decreto del servicio nocturno.
      </VerifiedBanner>

      <Section title="Resumen ejecutivo">
        <p>
          Servicio <strong>rural-interurbano privado</strong> Concepción ↔
          Florida (conocido coloquialmente como{' '}
          <em>"el corredor de El Pimentón"</em> por la cuesta de la
          Cordillera de la Costa que atraviesa) con cuatro operadores que
          conectan la comuna de Florida (~10.624 hab., 60,19% rural) con
          Concepción metropolitana. Distancia ~42 km por la Ruta del
          Itata, ~50 km por la Ruta 148 histórica; el trazado trepa la
          cuesta interior entre Concepción y Florida (altitudes 4-677 m
          en la franja Hualqui-Florida). Tiempo referencial 50 min - 1 h
          10 min según trazado y tráfico. El MTT no puede obligar a
          estos operadores privados a aumentar frecuencia: regulación
          genérica. A partir de 2025 se sumaron{' '}
          <strong>servicios subsidiados</strong> para tramos rurales
          (Rahuil, Poñén-Roa, zona norte) y un servicio nocturno
          Concepción-Florida — pero el troncal diurno sigue privado.
        </p>
        <p>
          Pieza de movilidad <em>no</em> integrada al GTFS Gran Concepción
          ni al sistema BusPay 2026. Pasa por la cuesta interior, no por
          la costa (Ruta 156, Madera) — esa es la diferencia clave con el
          eje Conce ↔ Santa Juana (ver{' '}
          <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
            201 Santa Juana
          </a>
          ).
        </p>
      </Section>

      <Section title="Operadores (4 confirmados)">
        <OperatorTable
          rows={[
            {
              name: 'Buses Delsal Ltda.',
              routes: 'Concepción ↔ Quillón ↔ Bulnes (incluye paradas en Florida)',
              terminal: 'Terminal Camilo Henríquez 2565 + reserva propia',
              notes: (
                <>
                  Fundada en 1977. Teléfonos publicados: (41) 2380421 y
                  (41) 2380006. Asientos ejecutivos, baño y A/C en flota
                  larga distancia.
                </>
              ),
              source: { href: 'https://www.horariodebuses.cl/buses-delsal', label: 'horariodebuses.cl' },
            },
            {
              name: 'Buses Nueva Libertadores',
              routes: 'Concepción ↔ Florida (servicio rural-interurbano)',
              terminal: 'Paradero Colo-Colo / Av. Los Carrera (Concepción)',
              notes: (
                <>
                  Representante mencionada: <strong>Ulda Espinoza</strong>.
                  Operador histórico del corredor. La municipalidad de
                  Florida la lista entre los tres operadores oficiales
                  que conectan Florida con Concepción.
                </>
              ),
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html',
                label: 'Diario Concepción · jul-2024',
              },
            },
            {
              name: 'Buses Biocosta',
              routes: 'Concepción ↔ Florida · históricamente también Conce-Santa Juana (antes de la 201)',
              terminal: 'Paradero Colo-Colo / Av. Los Carrera (Concepción)',
              notes: (
                <>
                  Conductor citado en prensa:{' '}
                  <strong>Miguel Ángel Sepúlveda</strong>, que en marzo
                  2024 denunció amenazas de Los Libertadores. Operó
                  Conce-Santa Juana hasta mayo 2020 con frecuencia cada
                  30 min según anuncio histórico.
                </>
              ),
              source: {
                href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml',
                label: 'BioBioChile · mar-2024',
              },
            },
            {
              name: 'Transportes Trinidad',
              routes: 'Concepción ↔ sectores rurales (Copiulemu, Chaimavida, El Pino)',
              terminal: 'No publicado',
              notes: (
                <>
                  Representante mencionado:{' '}
                  <strong>Blas Pereira</strong>. Sirve localidades del
                  oriente de Florida (Copiulemu, Chaimavida, El Pino).
                  Frecuencias y horarios no publicados.
                </>
              ),
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html',
                label: 'Diario Concepción · jul-2024',
              },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          La flota combinada de los <strong>tres operadores Conce-Florida</strong>{' '}
          (sin contar Trinidad) fue declarada por el SEREMI Héctor Silva
          en julio 2024 como <strong>~40 buses</strong>. Los operadores
          eran 3 hasta 2024 según ese mismo comunicado; algunas fuentes
          (incluyendo notas municipales de Florida) listan a Trinidad
          como cuarto operador del corredor rural ampliado.
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
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
            Diario Concepción · 27-jul-2024 — Flota combinada de 40 buses
          </SourceLink>
        </Sources>
        <PendingBanner>
          <strong>Conflicto de fuentes:</strong> el comunicado del SEREMI
          (jul-2024) describe <em>"tres operadores"</em>; la prensa
          regional y plataformas de venta listan <em>"cuatro operadores"</em>{' '}
          incluyendo a Trinidad. Probable explicación: Trinidad sirve
          ramales rurales <em>dentro</em> de Florida y no es contado como
          operador del troncal Conce-Florida en la mesa MTT, pero sí
          aparece en la operación día a día.
        </PendingBanner>
      </Section>

      <Section title="Trazado">
        <p>
          Dos trazados activos según el operador y la hora del día.
          Ambos terminan en Concepción en{' '}
          <strong>el mismo paradero histórico</strong>: Colo-Colo con
          Av. Los Carrera (entre Las Heras y Av. Los Carrera), no en un
          terminal cerrado.
        </p>
        <div className="space-y-2">
          <div className="rounded-md border bg-card p-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Trazado A · vía Ruta del Itata (rápido, post-2019)
            </div>
            <p className="mt-1 text-[12px] leading-snug">
              Florida (plaza/municipio) → enlace Florida → <strong>Ruta del
              Itata (concesionada)</strong> → peaje Agua Amarilla → Acceso
              Norte a Concepción → Av. 21 de Mayo / Costanera → Av. Los
              Carrera → <strong>paradero Colo-Colo / Los Carrera</strong>.
              Tiempo referencial 50 min sin congestión. Reduce el viaje
              en 30 min respecto al trazado histórico.
            </p>
          </div>
          <div className="rounded-md border bg-card p-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Trazado B · vía Ruta 148 histórica (lento, "los 7 puentes")
            </div>
            <p className="mt-1 text-[12px] leading-snug">
              Florida → <strong>Ruta 148</strong> (eje histórico, río
              Andalién) cruzando los 7 puentes de Domingo Arteaga
              (1920-1930) → Concepción nororiente → Av. Los Carrera →{' '}
              <strong>paradero Colo-Colo / Los Carrera</strong>. Tiempo
              referencial 1 h 10 min. Algunos operadores y servicios
              rurales (Copiulemu, Chaimavida) prefieren este eje porque
              permite paradas intermedias.
            </p>
          </div>
        </div>
        <Sources>
          <SourceLink href="https://biobio.mop.gob.cl/vecinos-de-florida-ya-pueden-usar-ruta-del-itata-para-llegar-a-concepcion/">
            MOP Biobío · Enlace Florida-Itata (12-dic-2019)
          </SourceLink>
          <SourceLink href="https://www.archivohistoricoconcepcion.cl/minisitios/monografias-regionales/los_siete_puentes_a_florida/">
            Archivo Histórico Concepción · 7 puentes y Ruta 148
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml">
            BioBioChile · Paradero Colo-Colo / Los Carrera
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Servicios subsidiados que complementan el troncal">
        <p>
          A partir de 2025, en lugar de licitar un único reemplazo (como
          la{' '}
          <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
            201 Santa Juana
          </a>
          , primer caso licitado del Biobío en más de una década), el MTT eligió{' '}
          <strong>añadir capas subsidiadas</strong> al corredor, dejando
          el troncal Conce-Florida diurno en manos de los privados:
        </p>
        <div className="space-y-2">
          <div className="rounded-md border bg-card p-3">
            <div className="text-[12px] font-medium">
              Servicio rural zona norte de Florida — operativo desde
              oct-2025
            </div>
            <KeyValueList
              items={[
                ['Tipo de contrato', 'Contrato de Transporte Aislado'],
                ['Servicios', '10 a la semana (lunes a viernes + festivos)'],
                ['Tarifa', '$400 - $1.500 según destino'],
                ['Inversión MTT', '$63.720.000'],
                ['Plazo', '36 meses'],
                ['Inauguración formal', 'Fines de octubre 2025'],
                ['Cobertura', 'Decena de localidades de la zona norte de la comuna'],
                ['Operador', 'No publicado en fuente abierta — pendiente'],
              ]}
            />
            <Sources>
              <SourceLink href="https://muniflorida.cl/florida-cuenta-con-nuevo-servicio-de-transporte-rural/">
                Municipalidad de Florida · Nuevo servicio rural
              </SourceLink>
              <SourceLink href="https://www.soychile.cl/concepcion/sociedad/2025/10/31/927147/transprote-publico-rural-biobio.html">
                Soychile · 31-oct-2025
              </SourceLink>
            </Sources>
          </div>
          <div className="rounded-md border bg-card p-3">
            <div className="text-[12px] font-medium">
              Servicio nocturno Concepción ↔ Florida — anunciado abr-2025
            </div>
            <KeyValueList
              items={[
                ['Salidas declaradas', '18:30 y 22:30 hrs'],
                ['Estado', 'Anunciado por SEREMI Patricio Fierro para abril 2025; servicio subvencionado'],
                ['Cita Mayor Montero', '"En mayo debería comenzar a operar un servicio subvencionado cuya licitación ya fue cerrada"'],
                ['Cita SEREMI Fierro', '"Estamos acelerando todos los procesos para reponer el servicio a la brevedad, con carácter urgente"'],
                ['Origen político', 'Crimen de Daniela Olate (jul-2024) puso la seguridad nocturna del corredor en agenda'],
                ['Operador / decreto', 'No publicados al cierre de búsqueda — pendiente'],
              ]}
            />
            <Sources>
              <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html">
                Diario Concepción · 28-mar-2025
              </SourceLink>
            </Sources>
          </div>
          <div className="rounded-md border bg-card p-3">
            <div className="text-[12px] font-medium">
              Servicio Rahuil ↔ Florida urbano — desde abr-2025
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Conecta localidad rural de Rahuil con el casco urbano de
              Florida. No llega a Concepción directamente. Operador y
              decreto no publicados.
            </p>
          </div>
          <div className="rounded-md border bg-card p-3">
            <div className="text-[12px] font-medium">
              Servicio Poñén-Roa — martes y jueves desde 2025
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Cobertura limitada (dos días/semana, mañana y tarde). Es
              servicio subvencionado de "conectividad rural" para
              localidades sin transporte previo.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Frecuencias y horarios">
        <KeyValueList
          items={[
            [
              'Frecuencia laboral (lun-vie)',
              'Reportada como buena en hora punta laboral. Sin tabla oficial publicada.',
            ],
            [
              'Frecuencia fin de semana y festivos',
              'Reportada como muy baja por usuarios y dirigentes vecinales (julio 2024). Esperas prolongadas en paradero Colo-Colo.',
            ],
            [
              'Primer / último despacho',
              'No publicados oficialmente. El nocturno subsidiado (anunciado abr-2025) extiende salidas hasta 22:30.',
            ],
            [
              'Información en tiempo real',
              'NO disponible en app oficial. Acuerdo de incorporarlos a app Red Regional de Movilidad: comprometido en julio 2024, no verificado en 2025.',
            ],
            [
              'GTFS',
              <>
                No publicado para ninguno de los operadores. El servicio no aparece en el{' '}
                <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
                  feed GTFS Gran Concepción
                </a>
                .
              </>,
            ],
          ]}
        />
        <PendingBanner>
          <strong>Tabla horaria pendiente.</strong> Ninguno de los cuatro
          operadores Conce-Florida publica horarios completos en fuente
          abierta. Fuente que falta: ordenanza municipal, cartel físico
          en paradero, o publicación directa de las empresas. Una
          contribución (foto del cartel del horario con fecha) cierra
          este hueco.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
            Diario Concepción · 27-jul-2024 — Esperas en Colo-Colo + acuerdo Red Movilidad
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifas">
        <PendingBanner>
          <strong>Pendiente.</strong> Ningún operador publica tabla
          tarifaria oficial 2025-2026 en fuente abierta. Rangos
          observados por usuarios y agregadores (no oficiales):
          $1.700-$2.500 tarifa adulto Concepción-Florida directo;{' '}
          $400-$1.500 el servicio subsidiado zona norte intra-comuna.
          La gratuidad para adultos mayores y personas con discapacidad
          es <strong>obligatoria sólo en servicios subsidiados</strong>{' '}
          — los privados aplican TNE (33%) pero no garantizan gratuidad.
        </PendingBanner>
      </Section>

      <Section title="Issues recientes y críticas">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              14-mar-2024 · Violencia entre conductores
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Pelea pública entre conductores de Biocosta y Los
              Libertadores en el paradero Colo-Colo/Los Carrera. Pasajeros
              grabaron la pelea. Conductor de Biocosta denunció amenazas
              recurrentes ("nos van a quebrar los vidrios"). Los
              Libertadores no entregó declaración pública.
            </p>
            <Sources>
              <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml">
                BioBioChile · 14-mar-2024
              </SourceLink>
            </Sources>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Jul-2024 · Crimen de Daniela Olate y seguridad nocturna
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El crimen instaló en agenda pública la <strong>falta de
              conectividad nocturna segura</strong> entre Florida y
              Concepción. Llevó al acuerdo de mesa MTT-operadores
              (jul-2024) y, eventualmente, al servicio nocturno
              subvencionado anunciado en marzo 2025.
            </p>
            <Sources>
              <SourceLink href="https://sabes.cl/2024/07/23/transporte-publico-rural-entre-florida-y-concepcion-uno-de-los-tema-de-fondo-en-el-crimen-de-daniela-olate/">
                Sabes.cl · 23-jul-2024
              </SourceLink>
            </Sources>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              27-jul-2024 · El MTT reconoce que no puede obligar a los privados
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El SEREMI Héctor Silva: <em>"La regulación es muy genérica y
              no nos permite obligar a los operadores a cumplir ciertas
              frecuencias"</em>. Acuerdos voluntarios: coordinación entre
              los 40 buses, fiscalización municipal del paradero
              Colo-Colo, GPS y cámaras financiadas por MTT, integración a
              app Red Regional. Estado de cumplimiento: no verificado.
            </p>
            <Sources>
              <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
                Diario Concepción · 27-jul-2024
              </SourceLink>
            </Sources>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Suspendido temporalmente (mar-2025)
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              En marzo 2025 el SEREMI Fierro habló de{' '}
              <em>"reponer el servicio a la brevedad"</em>, lo que
              implica que algún servicio del corredor estaba caído al
              momento del anuncio. La fuente no detalla cuál operador ni
              por qué; queda como pendiente de aclaración.
            </p>
            <Sources>
              <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html">
                Diario Concepción · 28-mar-2025
              </SourceLink>
            </Sources>
          </div>
        </div>
      </Section>

      <Section title="Tecnología comprometida (jul-2024)">
        <KeyValueList
          items={[
            ['GPS online en flota', 'MTT financia. Estado: comprometido jul-2024, no verificado en flota 2025.'],
            ['Cámaras de seguridad', 'MTT financia. Estado: comprometido jul-2024, no verificado en flota 2025.'],
            ['Contadores de pasajeros', 'No mencionado en el acuerdo (sí en Lota-Coronel).'],
            ['App Red Regional', 'Integración comprometida; el servicio no aparecía al cierre 2025.'],
            [
              'Pago electrónico BusPay',
              <>
                NO está en el perímetro inicial (perímetro Gran Concepción +
                Santa Juana +{' '}
                <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
                  Tomé
                </a>
                {' '}— este último es el segundo perímetro de exclusión de la zona).
              </>,
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html">
            Diario Concepción · jul-2024 — Acuerdo de tecnología
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/08/30/taxibuses-lota-coronel-incorporan-contadores-de-pasajeros-camaras-y-gps.html">
            Diario Concepción · ago-2024 — Lota-Coronel (referencia de comparación)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Infraestructura vial relevante (2024-2025)">
        <p>
          El corredor depende de tres ejes viales que están en fases
          distintas de inversión MOP:
        </p>
        <KeyValueList
          items={[
            [
              'Ruta del Itata (concesionada)',
              <>
                Acceso Norte a Concepción + enlace Florida (hab.
                12-dic-2019). Plaza de peaje en{' '}
                <strong>Agua Amarilla</strong> (Penco). Concesión vigente,
                informe ejecutivo MOP de septiembre 2025 publicado.
              </>,
            ],
            [
              'Ruta 148 histórica',
              'Eje del s. XVIII (Ambrosio O\'Higgins) con los 7 puentes de Domingo Arteaga (1920-1930). Patrimonio regional; sobrevivió a los terremotos 1939, 1960, 1985, 2010.',
            ],
            [
              'Pavimentación Florida-Copiulemu (O-540 / Q-560)',
              <>
                Inversión MOP <strong>{'> $3.000 millones'}</strong>.
                Beneficia San Antonio de Dadi, San Antonio de Cuda, La
                Paz y Cancha Los Monteros. En proceso de licitación al
                cierre de septiembre 2024; ejecución 2025-. Aún no
                impacta el servicio Conce-Florida troncal.
              </>,
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://biobio.mop.gob.cl/vecinos-de-florida-ya-pueden-usar-ruta-del-itata-para-llegar-a-concepcion/">
            MOP Biobío · Enlace Florida-Itata
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/uploads/sites/4/2025/11/Informe-Ejecutivo_RutasdelItata_septiembre2025.pdf">
            MOP Concesiones · Informe Ejecutivo Ruta del Itata (sep-2025)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/09/05/florida-pavimentaran-conexion-con-copiulemu-por-mas-de-3-mil-millones.html">
            Diario Concepción · Pavimentación Florida-Copiulemu
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Línea de tiempo">
        <Timeline
          items={[
            { date: 'Finales s. XVIII', event: 'Ambrosio O\'Higgins ordena el primer camino Concepción-Florida.' },
            { date: '1920-1930', event: 'Construcción de los 7 puentes de la Ruta 148 por Domingo Arteaga.' },
            { date: '12-dic-2019', event: 'Habilitación del enlace Florida ↔ Ruta del Itata. -30 min al viaje.' },
            {
              date: '14-mar-2024',
              event: 'Violencia entre conductores Biocosta y Los Libertadores en paradero Colo-Colo.',
              source: {
                href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2024/03/14/pasajera-capta-violenta-pelea-entre-conductores-de-buses-que-unen-concepcion-con-florida.shtml',
                label: 'BioBioChile',
              },
            },
            { date: 'Jul-2024', event: 'Crimen de Daniela Olate; el caso instala la seguridad nocturna del corredor en agenda pública.' },
            {
              date: '27-jul-2024',
              event: 'Mesa MTT-operadores (40 buses combinados). SEREMI Silva: "no podemos obligar a los privados". Acuerdo de tecnología y app.',
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/07/27/transportes-no-puede-obligar-a-buses-a-florida-para-que-aumenten-su-frecuencia.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: '5-sep-2024',
              event: 'MOP anuncia pavimentación Florida-Copiulemu por más de $3.000 millones.',
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2024/09/05/florida-pavimentaran-conexion-con-copiulemu-por-mas-de-3-mil-millones.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: '10-ene-2025',
              event: 'Patricio Fierro asume como SEREMI de Transportes de Biobío.',
              source: {
                href: 'https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: '28-mar-2025',
              event: 'Anuncio del servicio nocturno (18:30 y 22:30) + servicios subsidiados Rahuil y Poñén-Roa.',
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2025/03/28/en-abril-comienza-nuevo-recorrido-nocturno-desde-concepcion-a-florida.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: 'Oct-2025',
              event: 'Inauguración formal del servicio rural subsidiado zona norte de Florida. $63,72 millones a 36 meses.',
              source: {
                href: 'https://muniflorida.cl/florida-cuenta-con-nuevo-servicio-de-transporte-rural/',
                label: 'Municipalidad Florida',
              },
            },
            {
              date: '31-oct-2025',
              event: 'Biobío llega a 29 servicios subvencionados rurales; Florida zona norte entre los más recientes.',
              source: {
                href: 'https://www.soychile.cl/concepcion/sociedad/2025/10/31/927147/transprote-publico-rural-biobio.html',
                label: 'Soychile',
              },
            },
          ]}
        />
      </Section>

      <Section title="Nota sobre el topónimo &quot;El Pimentón&quot;">
        <p>
          El corredor se conoce coloquialmente como{' '}
          <em>"el corredor de El Pimentón"</em> por la cuesta que cruza la
          Cordillera de la Costa entre Concepción y Florida. El topónimo
          es <strong>uso popular</strong>, no oficial: una búsqueda en{' '}
          <SourceLink href="https://nominatim.openstreetmap.org/search?q=Pimenton&countrycodes=cl&format=json&limit=10">
            Nominatim/OpenStreetMap (Chile)
          </SourceLink>{' '}
          devuelve sólo resultados en la Región de Valparaíso (Quebrada
          del Pimentón en San Esteban, Mina Pimentón) y ningún feature
          con ese nombre en la Región del Biobío. Las monografías
          históricas consultadas (Archivo Histórico de Concepción sobre
          los 7 puentes, municipalidad de Hualqui) tampoco mencionan el
          rótulo. Tratamos <em>"El Pimentón"</em> como nombre paraguas
          del corredor —válido para búsqueda y memoria oral— hasta que
          aparezca una fuente IGM, municipal o comunitaria que lo
          confirme o reasigne.
        </p>
        <Sources>
          <SourceLink href="https://nominatim.openstreetmap.org/search?q=Pimenton&countrycodes=cl&format=json&limit=10">
            Nominatim · Búsqueda "Pimenton" en Chile
          </SourceLink>
          <SourceLink href="https://hualqui.com/caracteristicas/">
            Municipalidad de Hualqui · Geografía local (altitudes 4-677 m)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Razón social, RUT y N° RNTPP de cada uno de los 4 operadores.</li>
          <li>Horarios completos lun-vie / sáb / dom / festivos por operador.</li>
          <li>Tarifas oficiales adulto / TNE / adulto mayor / PcD 2025-2026.</li>
          <li>Operador y decreto del servicio nocturno subvencionado.</li>
          <li>Lista exacta de las 10 localidades de la zona norte de Florida cubiertas por el contrato $63,72M.</li>
          <li>Estado actual de cumplimiento del acuerdo de tecnología (GPS, cámaras, app Red Movilidad).</li>
          <li>Identidad del servicio que estaba "suspendido temporalmente" en mar-2025.</li>
          <li>GTFS público del corredor (cuando exista, se incorpora al visor principal).</li>
          <li>Demanda diaria (vehículos·persona) verificada — no hay encuesta O/D pública 2020+.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a DTPR Biobío por
          contratos vigentes Florida, consulta SII por las razones
          sociales, foto del cartel de horarios en el paradero
          Colo-Colo/Los Carrera.
        </p>
      </Section>

      <Section title="Para contribuir">
        <p>
          Foto del cartel del horario en el paradero, datos de la
          empresa operadora del nocturno, tarifa pagada con fecha,
          experiencia operativa: todo aporte se cita en el commit con el
          contribuyente como autor. Abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-florida.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/concepcion-florida.tsx
          </SourceLink>
          .
        </p>
      </Section>
    </div>
  );
}
