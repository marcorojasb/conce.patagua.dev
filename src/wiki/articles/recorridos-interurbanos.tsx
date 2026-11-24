// Recorridos interurbanos del Gran Concepción
// Lista panorámica de servicios que conectan el área urbana con comunas
// rurales/satélite. 201/201-AU, 401/401Y/411/421 y 302/304 vienen en el GTFS
// oficial DTPR (versión 20250228) que alimenta el visor; Florida y Yumbel no
// tienen GTFS publicado.

import { Section, ServiceRow } from './_components';
import { MapLink } from '@/wiki/map-link';

const TOME_NOTES = (
  <>
    Segundo perímetro de exclusión metropolitano (decreto MTT jul-2016,
    operativo mar-2022). Operador único Transportes Tomé (fusión de operadores
    previos, representante Bernardo Montoya), 71 buses, tarifa $750 base
    (vigencia 2026 sin polinomio publicado). Servicios 401 (Tomé), 401Y
    (Bellavista, solo hacia Concepción en la punta mañana), 411 (Dichato) y
    421 (Av. Estadio, refuerzo de punta en día hábil), todos en el GTFS
    oficial DTPR con trazado, paraderos y horario programado. El tramo
    Concepción↔Penco↔Lirquén lo cubren además recorridos urbanos (17MC,
    30MB, 31DF, 62HM y otros).{' '}
    <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
      Electrocorredor MOP Ruta 150
    </a>{' '}
    en licitación.
  </>
);

export default function RecorridosInterurbanos() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <p>
        Los buses del visor de <code className="font-mono">conce.patagua.dev</code>{' '}
        salen del{' '}
        <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
          <strong>GTFS oficial de la DTPR</strong>
        </a>{' '}
        (programa del 28-feb-2025; su calendario declarado venció el
        31-dic-2025, pero es la última versión publicada). Además de la red
        urbana, ese archivo trae ocho servicios interurbanos:{' '}
        <strong>201 y 201-AU</strong> a Santa Juana,{' '}
        <strong>401, 401Y, 411 y 421</strong> a Tomé y Dichato, y{' '}
        <strong>302 y 304</strong> entre Lota y Concepción. El visor los
        muestra con sus dos sentidos, sus paraderos y su horario programado.
      </p>
      <p>
        Quedan fuera los corredores privados sin GTFS publicado (Florida,
        Yumbel), que este índice documenta con fuentes secundarias. La
        autoridad que regula los servicios (vía Ley 18.696, Ley 20.378 y
        autorizaciones puntuales) es la{' '}
        <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
          SEREMITT Biobío
        </a>{' '}, sucesión vigente Silva → Fierro → Cautivo (desde 28-nov-2025) , , y
        los financiamientos se estructuran sobre el{' '}
        <a href="/wiki/subsidio-ley-20378" className="underline underline-offset-2">
          Subsidio Nacional al Transporte Público
        </a>.
      </p>

      <Section title="Servicios identificados">
        <ServiceRow
          code="201 · 201-AU"
          title="Concepción ↔ Santa Juana"
          notes="Licitado bajo DTPR ELC0007, operado por Sociedad de Transporte de Pasajeros Santa Juana SpA desde julio 2024. AU = Accesibilidad Universal (piso bajo, rampa). 23 buses Agrale Euro V, tarifa adulto $1.000. Primera licitación del Biobío en 10+ años. Pago electrónico previsto fin de 2026. Ambos códigos están en el GTFS oficial DTPR."
          slug="ruta-201-santa-juana"
          verified
          extra={<MapLink route="201">Ver la 201 en el mapa →</MapLink>}
        />
        <ServiceRow
          code="401 · 401Y · 411 · 421"
          title="Concepción ↔ Tomé"
          notes={TOME_NOTES}
          slug="concepcion-tome"
          verified
          extra={<MapLink route="401">Ver la 401 en el mapa →</MapLink>}
        />
        <ServiceRow
          code="302 · 304"
          title="Lota ↔ Concepción"
          notes="Dos servicios del GTFS oficial DTPR que van de Lota a Concepción por Coronel y la Ruta 160. El resto de los troncales del corredor sur (régimen Res. Ex. 457) no tiene GTFS publicado."
          slug="concepcion-coronel-lota"
          extra={<MapLink route="302">Ver la 302 en el mapa →</MapLink>}
        />
        <ServiceRow
          code="4 op."
          title="Concepción ↔ Florida (corredor de El Pimentón)"
          notes="Troncal privado con 4 operadores (Delsal, Nueva Libertadores, Biocosta, Trinidad), conocido coloquialmente como 'corredor de El Pimentón' por la cuesta interior de la Cordillera de la Costa. ~40 buses combinados; el MTT reconoce que no puede obligar a aumentar frecuencias. Desde 2025 hay capas subsidiadas (zona norte oct-2025, Rahuil, Poñén-Roa, nocturno)."
          slug="concepcion-florida"
          verified
          extra={<MapLink terminal="osm-way-597586612">Terminal Collao en el mapa →</MapLink>}
        />
        <ServiceRow
          code="4 op."
          title="Concepción ↔ Yumbel"
          notes="Corredor privado puro (sin licitación DTPR ni perímetro de exclusión) por la Ruta 146 'Autopista Valles del Biobío' (concesión Sacyr, peaje Huinanco en Yumbel km 33,9). Cuatro operadores: Línea Azul (retomó jul-2024 tras 5 años), Buses Bío Bío, Pullman Bus (retomó ene-2024 tras pugna municipal), Pullman Santa María. Demanda peak en Fiesta de San Sebastián (20-ene / 20-mar, 250-350 mil peregrinos/jornada, 400 carabineros en 2025). Fuera de BusPay 2026."
          slug="concepcion-yumbel"
          verified
          extra={<MapLink terminal="osm-way-597586612">Terminal Collao en el mapa →</MapLink>}
        />
        <ServiceRow
          code=", "
          title="Conexiones a Hualqui rural"
          notes="Más allá de la estación Biotrén Hualqui, sectores rurales hacia el interior. Talcamávida, Unihue y Quilacoya conectan principalmente por ferrocarril, no bus."
        />
      </Section>

      <Section title="Qué está en el visor y qué no">
        <p>
          La DTPR publica estos interurbanos en el mismo GTFS que la red
          urbana, así que entran al visor sin trabajo manual: trazado de
          cada sentido, paraderos y horario programado por día. El feed no
          los distingue de los urbanos; el visor los rotula «Interurbano
          Santa Juana», «Interurbano Tomé» e «Interurbano Lota».
        </p>
        <p>
          Hasta noviembre de 2026 el visor usaba el feed 2019 de la
          Subsecretaría de Transportes, que no traía ninguno de estos
          servicios. Por eso la 201 y las 401/411/421 se dibujaban desde
          OpenStreetMap con ventanas horarias estimadas. Eso quedó atrás:
          hoy todo sale de la fuente oficial.
        </p>
        <p>
          Florida y Yumbel siguen fuera: son operadores privados que no
          publican GTFS. En el mapa aparecen solo como un pin del corredor
          que enlaza a su artículo.
        </p>
      </Section>

      <Section title="Cómo contribuir">
        <p>
          Si conoces un servicio interurbano, sus horarios, su operador o su
          trazado aproximado, abre un pull request al{' '}
          <a
            href="https://github.com/marcorojasb/conce.patagua.dev/tree/main/src/wiki/articles"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            repositorio del wiki
          </a>
          . El compromiso editorial: <strong>citar la fuente</strong> de cada
          dato (foto de horario en paradero, ordenanza municipal, publicación
          DTPR). Sin fuente, queda como "información pendiente de verificación".
        </p>
      </Section>

      <Section title="Fuentes oficiales conocidas">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <a
              href="https://transformacion.dtpr.cl/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              DTPR Biobío
            </a>{' '}, bases de licitación y resoluciones por servicio.
          </li>
          <li>
            <a
              href="https://www.subtrans.gob.cl/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Subsecretaría de Transportes
            </a>{' '}, feed GTFS Gran Concepción y otros documentos normativos.
          </li>
          <li>OSM Overpass, relaciones <code className="font-mono">route=bus</code> taggeadas con el ID del servicio cuando existen.</li>
        </ul>
      </Section>
    </div>
  );
}
