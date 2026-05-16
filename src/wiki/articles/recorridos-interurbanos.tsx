// Recorridos interurbanos del Gran Concepción
// Lista panorámica de servicios licitados que conectan el área urbana
// con comunas rurales/satélite y que NO están en el GTFS urbano que
// alimenta el visor principal.

import { Section, ServiceRow } from './_components';
import { MapLink } from '@/wiki/map-link';

export default function RecorridosInterurbanos() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <p>
        El visor principal de <code className="font-mono">conce.patagua.dev</code> se
        alimenta del feed{' '}
        <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
          <strong>GTFS estático Gran Concepción</strong>
        </a>{' '}
        publicado por
        la Subsecretaría de Transportes (CC&nbsp;BY&nbsp;4.0). Ese feed cubre el área
        urbana metropolitana — Concepción, Talcahuano, San Pedro, Hualpén, Chiguayante,
        Penco/Lirquén, Coronel y Lota — y deja afuera los <strong>servicios
        interurbanos licitados</strong> que conectan el Gran Concepción con comunas
        rurales o satélite del Biobío.
      </p>
      <p>
        Esta página es un índice abierto: información compilada desde fuentes
        secundarias mientras esperamos un feed GTFS público para estos servicios.
        Cuando aparezca, se enchufa al visor y este artículo queda como contexto
        histórico.
      </p>

      <Section title="Servicios identificados">
        <ServiceRow
          code="201 · 201 AU"
          title="Concepción ↔ Santa Juana"
          notes="Licitado bajo DTPR ELC0007, operado por Sociedad de Transporte de Pasajeros Santa Juana SpA desde julio 2024. AU = Accesibilidad Universal (piso bajo, rampa). 23 buses Agrale Euro V, tarifa adulto $1.000. Primera licitación del Biobío en 10+ años. Pago electrónico previsto fin de 2026."
          slug="ruta-201-santa-juana"
          verified
          extra={<MapLink route="201">Ver la 201 en el mapa →</MapLink>}
        />
        <ServiceRow
          code="corredor"
          title="Corredor por El Pimentón (panorámico)"
          notes="Espina dorsal interurbana sur-oriente: cruce de la Cordillera de la Costa entre Concepción y Florida / Yumbel / rural Hualqui. Cuatro operadores privados, ~40 buses combinados, regulación fragmentada, capas subsidiadas nuevas en 2025."
          slug="corredor-el-pimenton"
          verified
        />
        <ServiceRow
          code="401 · 411 · 421"
          title="Concepción ↔ Tomé"
          notes={<>Segundo perímetro de exclusión metropolitano (decreto MTT jul-2016, operativo mar-2022). Operador único Transportes Tomé (fusión de operadores previos, representante Bernardo Montoya), 71 buses, tarifa $750 base (vigencia 2026 sin polinomio publicado). Servicios 401 (Tomé Alto), 411 (Dichato), 421 (Av. Estadio). El tramo Concepción↔Penco↔Lirquén sí está en el visor (líneas 17M/30B/30C/30E/31F/57Y/62H del GTFS urbano); Lirquén↔Tomé↔Dichato no. <a href="/wiki/electrocorredores-mop-biobio" className="underline underline-offset-2">Electrocorredor MOP Ruta 150</a> en licitación.</>}
          slug="concepcion-tome"
          verified
          extra={<MapLink route="401">Ver la 401 Tomé Alto en el mapa →</MapLink>}
        />
        <ServiceRow
          code="4 op."
          title="Concepción ↔ Florida"
          notes="Troncal privado con 4 operadores (Delsal, Nueva Libertadores, Biocosta, Trinidad). El MTT reconoce que no puede obligar a aumentar frecuencias. Desde 2025 hay capas subsidiadas (zona norte oct-2025, Rahuil, Poñén-Roa, nocturno)."
          slug="concepcion-florida"
          verified
          extra={
            <MapLink terminal="osm-way-114474600">
              Terminal Camilo Henríquez en el mapa →
            </MapLink>
          }
        />
        <ServiceRow
          code="4 op."
          title="Concepción ↔ Yumbel"
          notes="Corredor privado puro (sin licitación DTPR ni perímetro de exclusión) por la Ruta 146 'Autopista Valles del Biobío' (concesión Sacyr, peaje Huinanco en Yumbel km 33,9). Cuatro operadores: Línea Azul (retomó jul-2024 tras 5 años), Buses Bío Bío, Pullman Bus (retomó ene-2024 tras pugna municipal), Pullman Santa María. Demanda peak en Fiesta de San Sebastián (20-ene / 20-mar, 250-350 mil peregrinos/jornada, 400 carabineros en 2025). Fuera de BusPay 2026."
          slug="concepcion-yumbel"
          verified
          extra={
            <MapLink terminal="osm-way-114474600">
              Terminal Camilo Henríquez en el mapa →
            </MapLink>
          }
        />
        <ServiceRow
          code="—"
          title="Conexiones a Hualqui rural"
          notes="Más allá de la estación Biotrén Hualqui — sectores rurales hacia el interior. Talcamávida, Unihue y Quilacoya conectan principalmente por ferrocarril, no bus."
        />
      </Section>

      <Section title="¿Por qué no están en el visor principal?">
        <p>
          El feed GTFS urbano del Gran Concepción es un producto técnico — un
          archivo conformado a un estándar específico — que la Subsecretaría
          publica con un alcance acotado al área metropolitana. Los servicios
          interurbanos están bajo licitaciones distintas y no se reflejan en
          ese feed. Sin un feed GTFS público para ellos, no hay forma directa
          de validar trazado, frecuencia o paraderos en código.
        </p>
        <p>
          Lo confirma una revisión directa del feed GTFS Gran Concepción
          publicado por la Subsecretaría: no contiene servicios con códigos
          "201", "Santa Juana", "Tomé", "Florida" ni "Yumbel". Los stops del
          dataset que mencionan "Tomé" son nombres de calles dentro del área
          urbana, no servicios interurbanos hacia esa comuna.
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
            </a>{' '}
            — bases de licitación y resoluciones por servicio.
          </li>
          <li>
            <a
              href="https://www.subtrans.gob.cl/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Subsecretaría de Transportes
            </a>{' '}
            — feed GTFS Gran Concepción y otros documentos normativos.
          </li>
          <li>OSM Overpass — relaciones <code className="font-mono">route=bus</code> taggeadas con el ID del servicio cuando existen.</li>
        </ul>
      </Section>
    </div>
  );
}
