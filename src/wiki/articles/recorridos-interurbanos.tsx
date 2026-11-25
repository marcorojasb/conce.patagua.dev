// Recorridos interurbanos del Gran Concepción: índice de servicios.
// 201/201-AU, 401/401Y/411/421 y 302/304 vienen del GTFS oficial DTPR
// (versión Gran Concepción20250228) que alimenta el visor. Florida y Yumbel no
// tienen GTFS: solo pins en src/data/interurban-corridors.ts.

import { ArticleSummary, CollapsibleSection, DataTable, Section, SourceLink } from './_components';
import { MapLink } from '@/wiki/map-link';

export default function RecorridosInterurbanos() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <ArticleSummary
        bullets={[
          <>
            El visor toma los interurbanos 201, 401, 411, 421, 302 y 304 del{' '}
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS oficial de la DTPR
            </a>
            , con sus dos sentidos, paraderos y horario programado.
          </>,
          <>
            Florida y Yumbel no publican GTFS. En el mapa aparecen solo como un
            pin que enlaza a su ficha.
          </>,
          <>
            Las llegadas en vivo no siguen la 302 ni la 304. El modo Horario de
            «Micros en el mapa» es una estimación, nunca GPS.
          </>,
          <>
            La autoridad es la{' '}
            <a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">
              SEREMITT Biobío
            </a>
            . El pago electrónico se trata en la ficha{' '}
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay
            </a>
            .
          </>,
        ]}
      />

      <Section title="Servicios">
        <DataTable columns={['Servicio', 'Ruta', 'Operador', 'Ficha y mapa']}>
          <tr>
            <td className="px-3 py-2 font-medium">Concepción ↔ Santa Juana</td>
            <td className="px-3 py-2 font-mono text-[12px]">201 · 201-AU</td>
            <td className="px-3 py-2 text-muted-foreground">Sociedad de Transporte de Pasajeros Santa Juana SpA</td>
            <td className="px-3 py-2 text-[12px]">
              <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">Ruta 201</a>
              {' · '}
              <MapLink route="201">Mapa</MapLink>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Concepción ↔ Tomé, Dichato y Bellavista</td>
            <td className="px-3 py-2 font-mono text-[12px]">401 · 401Y · 411 · 421</td>
            <td className="px-3 py-2 text-muted-foreground">Transportes Tomé (operador único del perímetro de Tomé)</td>
            <td className="px-3 py-2 text-[12px]">
              <a href="/wiki/concepcion-tome" className="underline underline-offset-2">Concepción ↔ Tomé</a>
              {' · '}
              <MapLink route="401">Mapa</MapLink>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Lota ↔ Concepción</td>
            <td className="px-3 py-2 font-mono text-[12px]">302 · 304</td>
            <td className="px-3 py-2 text-muted-foreground">Pendiente: el GTFS no nombra al operador</td>
            <td className="px-3 py-2 text-[12px]">
              <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">Concepción ↔ Coronel ↔ Lota</a>
              {' · '}
              <MapLink route="302">Mapa</MapLink>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Concepción ↔ Florida</td>
            <td className="px-3 py-2 text-muted-foreground">Sin GTFS</td>
            <td className="px-3 py-2 text-muted-foreground">Cuatro operadores privados (corredor de El Pimentón)</td>
            <td className="px-3 py-2 text-[12px]">
              <a href="/wiki/concepcion-florida" className="underline underline-offset-2">Concepción ↔ Florida</a>
              {' · '}
              <MapLink terminal="osm-way-597586612">Terminal Collao</MapLink>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Concepción ↔ Yumbel</td>
            <td className="px-3 py-2 text-muted-foreground">Sin GTFS (Ruta 146)</td>
            <td className="px-3 py-2 text-muted-foreground">Cuatro operadores privados</td>
            <td className="px-3 py-2 text-[12px]">
              <a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">Concepción ↔ Yumbel</a>
              {' · '}
              <MapLink terminal="osm-way-597586612">Terminal Collao</MapLink>
            </td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          El feed no distingue urbanos de interurbanos: el visor los rotula «Interurbano Santa Juana», «Interurbano Tomé»
          e «Interurbano Lota». Florida y Yumbel solo aparecen como pin, curado en{' '}
          <code className="font-mono">src/data/interurban-corridors.ts</code>.
        </p>
      </Section>

      <p className="text-[13px] text-muted-foreground">
        ¿Tienes horarios, operador o trazado de un interurbano? Abre un pull
        request al{' '}
        <a
          href="https://github.com/marcorojasb/conce.patagua.dev/tree/main/src/wiki/articles"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          repositorio del wiki
        </a>{' '}
        y cita la fuente de cada dato. Sin fuente, queda como pendiente de verificación.
      </p>

      <CollapsibleSection title="Fuentes oficiales conocidas">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <SourceLink href="https://dtpr.gob.cl/pe/gran-concepcion/gtfs-2/">
              DTPR · GTFS Gran Concepción
            </SourceLink>
            : el zip que usa el visor (201, 201-AU, 401, 401Y, 411, 421, 302 y 304).
          </li>
          <li>
            <SourceLink href="https://dtpr.gob.cl/pe/tome/gtfs/">DTPR · GTFS Tomé</SourceLink>
            : feed del Perímetro de Exclusión de Tomé (versión Tomé20230308).
          </li>
          <li>
            <SourceLink href="https://transformacion.dtpr.cl/">DTPR Biobío</SourceLink>
            : bases de licitación y resoluciones por servicio.
          </li>
          <li>
            <SourceLink href="https://www.subtrans.gob.cl/">Subsecretaría de Transportes</SourceLink>
            : documentos normativos del sector.
          </li>
          <li>OSM Overpass, para terminales y corredores sin GTFS (Florida, Yumbel).</li>
        </ul>
      </CollapsibleSection>
    </div>
  );
}
