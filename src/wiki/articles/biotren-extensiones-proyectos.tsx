// Biotrén · extensiones y proyectos futuros (estado al 2026-11-25).
// Para el servicio operativo (L1, L2, tarifas, horarios) ver `biotren`.
// Extensiones: Penco-Lirquén (L1, en estudios), Lota (L2, ingeniería
// adjudicada en 2025), Tomé y ramal a Carriel Sur (solo ideas). Ninguna
// tiene contrato de obras.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  NewsPulse,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function BiotrenExtensionesProyectos() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Proyectos en estudio, no obras adjudicadas.</strong>{' '}
        Las extensiones a Penco-Lirquén y a Lota tienen estudios o
        ingeniería en marcha con fuente (EFE Sur, prensa con nombre, hasta
        el 20-oct-2026); Tomé y Carriel Sur siguen sin proyecto formal.
        Ninguna tiene contrato de obras. Toda fecha de servicio es
        proyección de EFE, no compromiso.
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Penco-Lirquén', value: 'estudios · servicio 2034 (proy.)' },
          { label: 'Lota', value: 'ingeniería adjudicada 2025 · diseño a 2028' },
          { label: 'Tomé', value: 'sin proyecto' },
          { label: 'Carriel Sur', value: 'sin proyecto' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            <strong>Penco-Lirquén (L1)</strong>: pasa a estudios de
            factibilidad, ingeniería y evaluación ambiental. EFE Sur
            estima US$ 210 M en total y US$ 16 M para esta etapa; obras
            desde 2032 y operación en 2034.
          </>,
          <>
            <strong>Lota (L2)</strong>: 9 km, 5 estaciones y US$ 155 M
            (EFE, jun-2025); la ingeniería ya está adjudicada y termina
            en 2028. Sin fecha de obras.
          </>,
          <>
            <strong>Tomé y Carriel Sur</strong>: ideas sin estudio ni
            recomendación social.
          </>,
          <>
            En ago-2026 los alcaldes de Lota y Penco temieron que la
            congelación de los corredores de bus afectara a estas
            extensiones; no se ha confirmado ningún atraso. La carta Gantt
            que citó Penco (obras 2029, entrega 2031) difiere de la de EFE
            en octubre (2032 y 2034).
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '20-oct-2026',
            title: 'Biotrén a Penco y Lirquén: estudios, obras desde 2032 y servicio en 2034',
            detail:
              'El presidente de EFE Sur, Jorge Sabag, dijo que los recursos están en la Ley de Presupuestos 2026 y que la licitación se hará. Las consultorías durarían tres años; el directorio de EFE debía aprobar su licitación en noviembre y la mesa con las autoridades vuelve a reunirse el 27-nov.',
            source: {
              href: 'https://www.meganoticias.cl/nacional/534357-biotren-extension-recorrido-penco-lirquen-inversion-efe-sur-obras-2034-20-10-2026.html',
              label: 'Meganoticias · 20-oct-2026',
            },
          },
          {
            date: '5-ago-2026',
            title: 'Alcaldes de Lota y Penco piden asegurar la continuidad de la extensión',
            detail:
              'Tras la congelación de los corredores de bus (Rutas 160 y 150), Jaime Vásquez (Lota) y Rodrigo Vera (Penco) pidieron sostener los proyectos del Biotrén. Vera citó una carta Gantt entregada en 2025, con obras desde 2029 y entrega en 2031, distinta de la de EFE en octubre (obras 2032, servicio 2034).',
            source: {
              href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/05/alcaldes-de-lota-y-penco-expresan-preocupacion-por-continuidad-de-proyecto-de-extension-del-biotren.shtml',
              label: 'BioBioChile · 5-ago-2026',
            },
          },
        ]}
      />

      <Section title="Estado de cada extensión">
        <DataTable
          columns={['Extensión', 'Estado', 'Cifras (fuente)']}
          bodyClassName="divide-y align-top text-[12px]"
        >
          <tr>
            <td className="px-3 py-2 font-medium">Penco-Lirquén (L1)</td>
            <td className="px-3 py-2">
              Estudios de factibilidad, ingeniería y evaluación ambiental;
              consultorías por licitar. Prefactibilidad con "alta
              rentabilidad social" (EFE Sur, oct-2026).
            </td>
            <td className="px-3 py-2">
              US$ 210 M total, US$ 16 M esta etapa; obras desde 2032,
              servicio 2034 (Meganoticias, 20-oct-2026).
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Lota (L2, desde Coronel)</td>
            <td className="px-3 py-2">
              Diseño de ingeniería adjudicado; define estaciones, vía y
              pasos peatonales. El tramo tiene hoy una sola vía de carga.
            </td>
            <td className="px-3 py-2">
              ~9 km, 5 estaciones, US$ 155 M; Lota a 51 min de Concepción;
              diseño listo en 2028 (BioBioChile, 12-jun-2025). Sin fecha de
              obras.
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Tomé</td>
            <td className="px-3 py-2">
              Sin proyecto de EFE ni recomendación social. Tomé pidió en
              nov-2025 extender el beneficio del corredor de bus, no el tren.
            </td>
            <td className="px-3 py-2">Sin cifras.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Carriel Sur</td>
            <td className="px-3 py-2">
              Idea recurrente (~3 km desde El Arenal); sin propuesta
              formal de EFE ni del MOP.
            </td>
            <td className="px-3 py-2">Sin cifras.</td>
          </tr>
        </DataTable>
        <p>
          Penco tiene hoy servicio de bus urbano (17MC, 30MB, 30NC, 30QE,
          31DF, 50YP, 62HM del{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>
          ) e interurbano de Transportes Tomé (401/411/421). Para el eje
          norte completo ver{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          ; para Lota,{' '}
          <a href="/wiki/concepcion-coronel-lota" className="underline underline-offset-2">
            Concepción ↔ Coronel ↔ Lota
          </a>
          .
        </p>
        <Sources>
          <SourceLink href="https://www.meganoticias.cl/nacional/534357-biotren-extension-recorrido-penco-lirquen-inversion-efe-sur-obras-2034-20-10-2026.html">
            Meganoticias · 20-oct-2026, Penco y Lirquén
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/06/12/efe-anuncia-avances-en-proyecto-de-extension-del-biotren-que-conectara-lota-con-coronel-y-concepcion.shtml">
            BioBioChile · 12-jun-2025, Extensión a Lota
          </SourceLink>
          <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
            Tomé al día · nov-2025, Tomé pide extender el beneficio del corredor
          </SourceLink>
        </Sources>
        <PendingBanner>
          <strong>Pendiente:</strong> trazado y estaciones de Penco-Lirquén,
          inversión de Tomé y Carriel Sur, recomendación social (MIDESO) de
          cada una y si la licitación de consultorías se aprobó en
          noviembre. Cierre: Ley de Transparencia a EFE Sur y reunión del
          27-nov.
        </PendingBanner>
      </Section>

      <Section title="Tensión con el electrocorredor Ruta 150">
        <p>
          El alcalde de Penco Víctor Hugo Figueroa advirtió en nov-2022 que
          el corredor de bus podía "frenar" el tren. Hoy el corredor está
          congelado como concesión y pasó a obra pública directa del MOP,
          sin calendario de obras; la extensión Penco-Lirquén avanza en
          estudios. El detalle del corredor está en{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            Corredores de Transporte Público MOP
          </a>
          .{' '}
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022
          </SourceLink>
        </p>
      </Section>

      <Section title="Cobertura del visor">
        <p className="text-[13px]">
          Las extensiones no están en el visor: no hay trazado oficial que
          dibujar. Solo se ven L1 y L2 operativas (ver{' '}
          <a href="/wiki/biotren" className="underline underline-offset-2">
            Biotrén
          </a>
          ).
        </p>
      </Section>

      <CollapsibleSection title="Línea temporal">
        <Timeline
          items={[
            {
              date: '~2010',
              event: 'Entran al debate público las extensiones a Penco y Tomé; la de Lota se menciona sin estudios formales.',
              source: { href: 'https://es.wikipedia.org/wiki/Biotr%C3%A9n', label: 'Wikipedia · Biotrén' },
            },
            {
              date: '1-nov-2022',
              event: 'El alcalde de Penco advierte que el corredor MOP Ruta 150 puede frenar la llegada del Biotrén.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html', label: 'Diario Concepción' },
            },
            {
              date: '13-nov-2024',
              event: 'La CGR visa las licitaciones de los corredores de bus de las Rutas 150 y 160 y Autopista Concepción-Talcahuano.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: '12-jun-2025',
              event: 'EFE presenta el avance de la extensión a Lota: US$ 155 M, 9 km, 5 estaciones; diseño de ingeniería adjudicado.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/06/12/efe-anuncia-avances-en-proyecto-de-extension-del-biotren-que-conectara-lota-con-coronel-y-concepcion.shtml', label: 'BioBioChile' },
            },
            {
              date: '7-nov-2025',
              event: 'Cobertura regional de los electrocorredores y de su cronograma.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html', label: 'Diario Concepción' },
            },
            {
              date: 'nov-2025',
              event: 'Tomé pide que el beneficio del corredor MOP llegue hasta Tomé (no es sobre el tren).',
              source: { href: 'http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html', label: 'Tomé al día' },
            },
            {
              date: '10-dic-2025',
              event: 'Oferta única de Electro-Cointer II para Ruta 150 + Conce-Talcahuano II.',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones' },
            },
            {
              date: '5-ago-2026',
              event: 'Alcaldes de Lota y Penco piden continuidad tras el congelamiento de los corredores.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/08/05/alcaldes-de-lota-y-penco-expresan-preocupacion-por-continuidad-de-proyecto-de-extension-del-biotren.shtml', label: 'BioBioChile' },
            },
            {
              date: '20-oct-2026',
              event: 'EFE Sur: estudios de Penco-Lirquén, obras desde 2032 y servicio en 2034.',
              source: { href: 'https://www.meganoticias.cl/nacional/534357-biotren-extension-recorrido-penco-lirquen-inversion-efe-sur-obras-2034-20-10-2026.html', label: 'Meganoticias' },
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Otras fuentes: Wikipedia · Biotrén (historia y propuestas).
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Vínculos, datos pendientes y contribución">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <a href="/wiki/biotren" className="underline underline-offset-2">Biotrén</a>
            : servicio operativo, tarifas y horarios.
          </li>
          <li>
            <a href="/wiki/perimetro-exclusion-tome" className="underline underline-offset-2">Perímetro de Exclusión de Tomé</a>
            : régimen de bus que hoy cubre Concepción ↔ Penco ↔ Tomé.
          </li>
          <li>Pendientes: posición actual del MTT y del MOP sobre tren vs bus; documentos de planificación regional (PROT Biobío, PRMC).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley de Transparencia a EFE Sur, SUBTRANS Biobío y
          MIDESO; cartas de las municipalidades de Penco, Tomé y Lota.
        </p>
        <p className="text-[13px]">
          ¿Tienes bases de las consultorías o la carta Gantt actualizada?
          Abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/biotren-extensiones-proyectos.tsx">
            github.com/marcorojasb/conce.patagua.dev
          </SourceLink>
          .
        </p>
      </CollapsibleSection>
    </div>
  );
}
