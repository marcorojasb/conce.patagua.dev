// Taxis colectivos del Gran Concepción, modo urbano masivo fuera del visor.
// Marco: DS 212/1992 MTT (define la modalidad), Ley 18.290 (Tránsito),
// Ley 18.696 (atribuciones MTT), Ley 20.474 (padrón cerrado, 2011). Color
// reglamentario: negro con techo amarillo. No entran a BusPay ni al GTFS
// Gran Concepción.

import {
  ArticleSummary,
  CollapsibleSection,
  DataTable,
  FactStrip,
  KeyValueList,
  NewsPulse,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

// react-doctor-disable-next-line react-doctor/no-giant-component -- Long-form wiki article: a single content component keeps chronology, citations, and copy review coherent.
export default function TaxisColectivosGranConcepcion() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificación parcial con fuentes primarias.</strong> Marco
        legal, color reglamentario, alcance de BusPay (solo buses) y el
        programa de renovación de colectivos están citados.{' '}
        <strong>Pendientes</strong>: cantidad de vehículos, catastro de
        líneas, tarifas 2026 por línea y federación regional. Las cifras
        gruesas que no tienen fuente quedan en "Datos pendientes".
      </VerifiedBanner>

      <FactStrip
        snapshot="2026-11-25"
        items={[
          { label: 'Modalidad', value: 'hasta 6 pasajeros' },
          { label: 'Padrón', value: 'cerrado desde 2011' },
          { label: 'Pago', value: 'solo efectivo' },
          { label: 'Visor', value: 'no aparece' },
        ]}
      />

      <ArticleSummary
        bullets={[
          <>
            <strong>El visor no muestra taxis colectivos.</strong> Solo
            muestra buses urbanos del GTFS oficial y Biotrén. Los colectivos
            no publican GTFS.
          </>,
          <>
            Son autos de hasta seis pasajeros en líneas fijas, con tarifa por
            persona. Su régimen es la inscripción en el RNSTP (DS 212/1992).
          </>,
          <>
            El padrón está cerrado desde la Ley 20.474 (2011). Un cupo solo
            cambia de vehículo o de dueño.
          </>,
          <>
            Quedan fuera de BusPay. Pagan en efectivo, con tarifa que
            fija cada línea por resolución.
          </>,
        ]}
      />

      <NewsPulse
        items={[
          {
            date: '1-dic-2026',
            title: 'BusPay inicia marcha blanca en micros',
            detail:
              'La nota habla de micros y no menciona colectivos. El alcance adjudicado es de buses. Ver BusPay.',
            source: {
              href: 'https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta',
              label: 'Canal 9 · 23-nov-2026',
            },
          },
        ]}
      />

      <Section title="Cobertura del visor">
        <p>
          El feed que alimenta el visor es el{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS Gran Concepción</a>{' '}
          que publica la DTPR. Incluye la red urbana del PE 2024 y algunos
          interurbanos. Los colectivos no están en ese feed: no es una decisión
          editorial del visor. Su régimen no exige GTFS y operan sin
          trazabilidad digital.
        </p>
      </Section>

      <Section title="Líneas troncales">
        <PendingBanner>
          <strong>El catastro de líneas activas no está cerrado.</strong> Los
          ejes siguientes son corredores observados en prensa y en terreno, no
          la lista oficial de la DTPR. Cada eje tiene entre dos y seis líneas
          con número y razón social propios.
        </PendingBanner>
        <DataTable columns={['Eje', 'Recorrido', 'Nota']} bodyClassName="divide-y align-top text-[13px]">
          <tr>
            <td className="px-3 py-2 font-medium">Talcahuano</td>
            <td className="px-3 py-2">Plaza Independencia ↔ Talcahuano centro (San Vicente, El Morro, Higueras).</td>
            <td className="px-3 py-2">Compite con la <a href="/wiki/biotren" className="underline underline-offset-2">Línea 1 del Biotrén</a>.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Hualpén</td>
            <td className="px-3 py-2">Plaza Independencia ↔ Hualpencillo, El Triángulo, Caleta Lenga.</td>
            <td className="px-3 py-2">Alta dependencia del transporte menor.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Chiguayante</td>
            <td className="px-3 py-2">Plaza Independencia ↔ Chiguayante centro, Lonco Parque, Manquimávida.</td>
            <td className="px-3 py-2">Compite con la L1 del Biotrén.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">San Pedro de la Paz</td>
            <td className="px-3 py-2">Plaza Independencia ↔ Costanera, Boca Sur, Michaihue.</td>
            <td className="px-3 py-2">Cruza por el puente Llacolén o el Juan Pablo II.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Barrio universitario</td>
            <td className="px-3 py-2">Plaza Perú ↔ UdeC ↔ UdeC Lomas y Barrio Norte.</td>
            <td className="px-3 py-2">Demanda alta en período lectivo, baja en verano.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Nor-oriente</td>
            <td className="px-3 py-2">Plaza Acevedo ↔ Lomas de San Sebastián, Nonguén, Collao alto.</td>
            <td className="px-3 py-2">Topografía exigente para el bus.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Hualqui (interurbano corto)</td>
            <td className="px-3 py-2">Concepción ↔ Hualqui por la ribera sur del Biobío.</td>
            <td className="px-3 py-2">Límite entre lo urbano y lo interurbano.</td>
          </tr>
        </DataTable>
        <p className="text-[12px] text-muted-foreground">
          Los colectivos salen en general desde el centro de Concepción (Plaza
          Independencia, Plaza Perú, Plaza Acevedo). Ejes adicionales como
          Pedro de Valdivia o Lorenzo Arenas no están detallados.
        </p>
      </Section>

      <Section title="Qué son y marco legal">
        <p>
          Un <strong>taxi colectivo</strong> es un automóvil de hasta{' '}
          <strong>seis pasajeros</strong> que opera en <strong>líneas fijas
          con tarifa por persona</strong>. Desvía puntualmente su recorrido.
          Su modalidad está en el <strong>art. 2° del DS 212/1992</strong>{' '}
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=11497">
            (BCN)
          </SourceLink>
          .
        </p>
        <KeyValueList
          items={[
            ['DS 212/1992 (MTT)', <>Reglamento del transporte público de pasajeros. Define la modalidad, el registro RNSTP, la señalética y el régimen disciplinario.</>],
            ['Ley 18.290 (Tránsito)', <>Licencia profesional del conductor (clase A2) y normas de circulación.</>],
            ['Ley 18.696', <>Atribuciones del MTT. El art. 3° sirve para perímetros de buses; no se ha usado para taxis colectivos en el Gran Concepción.</>],
            ['Ley 20.474 (2011)', <>Suspende la inscripción de nuevos taxis en el RNSTP. Prórrogas sucesivas mantienen el cierre.</>],
          ]}
        />
        <PendingBanner>
          <strong>Sin verificar:</strong> la última prórroga del padrón cerrado, un
          eventual perímetro específico de colectivos en el Biobío y la
          antigüedad máxima vigente para colectivos urbanos.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=11497">BCN · DS 212/1992</SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29708">BCN · Ley 18.290</SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29994">BCN · Ley 18.696</SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1024893">BCN · Ley 20.474</SourceLink>
        </Sources>
      </Section>

      <Section title="Operadores, flota, tarifa y pago">
        <DataTable columns={['Tema', 'Situación']} bodyClassName="divide-y align-top text-[13px]">
          <tr>
            <td className="px-3 py-2 font-medium">Operadores</td>
            <td className="px-3 py-2">Propietarios por línea (cooperativas o SpA), con uno o dos vehículos cada uno. Los 33-35 operadores del PE 2024 tienen contrato MTT; los colectivos no tienen contrato ni métricas. Federación nacional: CONATACOCH. Federación regional ("FERETAX") sin cita primaria.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Flota</td>
            <td className="px-3 py-2">Sin cifra total publicada. Observación de calle, sin cita: autos subcompactos y compactos. Renovación: el programa Renueva Tu Colectivo corre desde 2016 con recursos de la ley espejo: 1.063 autos reemplazados, $2.480 millones entre 2016 y 2023.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Tarifa</td>
            <td className="px-3 py-2">No es única. Cada línea la fija por resolución de la SEREMITT, según costo por kilómetro y ocupación. Hay recargo nocturno, en general entre 22:00 y 06:00. La tarifa 2026 por línea no está consolidada.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Pago</td>
            <td className="px-3 py-2">Solo efectivo. No hay sistema electrónico nacional para colectivos.</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Electrificación</td>
            <td className="px-3 py-2">Sin política específica al cierre 2025-2026. Los colectivos siguen con combustión.</td>
          </tr>
        </DataTable>
        <PendingBanner>
          <strong>Flota total y tarifa 2026 por línea: sin fuente.</strong> Las
          estimaciones de prensa (entre dos y cuatro mil vehículos) no son
          auditables. No se fija un número hasta tener fuente primaria, por
          ejemplo una solicitud a la DTPR vía Ley 20.285.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf">
            DTPR · Subsidios al transporte público, Región del Biobío 2026 (Renueva Tu Colectivo)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Diferencias con el bus urbano">
        <DataTable columns={['Dimensión', 'Bus urbano (PE 2024)', 'Taxi colectivo']} bodyClassName="divide-y align-top text-[12px]">
          <tr>
            <td className="px-3 py-2 font-medium">Capacidad</td>
            <td className="px-3 py-2">30 a 70 pasajeros</td>
            <td className="px-3 py-2">Hasta 6 pasajeros, con el conductor</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Frecuencia</td>
            <td className="px-3 py-2">Programada por contrato MTT</td>
            <td className="px-3 py-2">"Sale cuando se llena"</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Tarifa adulto</td>
            <td className="px-3 py-2">$580, fija desde 23-feb-2025</td>
            <td className="px-3 py-2">Por línea, por resolución</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Pago</td>
            <td className="px-3 py-2">Efectivo y BusPay</td>
            <td className="px-3 py-2">Solo efectivo</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">Régimen</td>
            <td className="px-3 py-2">Perímetro de exclusión (art. 3°, Ley 18.696), con métricas</td>
            <td className="px-3 py-2">Inscripción RNSTP por línea, sin métricas de calidad</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium">En el visor</td>
            <td className="px-3 py-2">Sí, vía GTFS</td>
            <td className="px-3 py-2">No, sin GTFS</td>
          </tr>
        </DataTable>
      </Section>

      <Section title="Cómo se identifica en la calle">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>Color</strong>: negro con techo amarillo, fijado por el DS 212/1992 para todos los taxis. Algunas líneas agregan franjas o logos.</li>
          <li><strong>Letrero de techo</strong>: número de línea y destinos. Es la pista principal del recorrido.</li>
          <li><strong>Puerta</strong>: número de línea y número de móvil interno.</li>
          <li><strong>Patente</strong>: común con el taxi básico. La distinción es el letrero y el color.</li>
          <li><strong>Cuadro tarifario</strong>: obligatorio al interior, con tarifa diurna y nocturna.</li>
        </ul>
      </Section>

      <Section title="Integración con BusPay">
        <p className="text-[13px]">
          BusPay (Consorcio Buspay, operador técnico Busmatick) cubre buses de
          11 comunas y no incluye colectivos. Quien combine bus y colectivo
          paga con dos sistemas distintos. No consta una segunda fase con
          fecha que incorpore colectivos (pendiente). Detalle del sistema en{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">BusPay</a>.
        </p>
        <Sources>
          <SourceLink href="https://www.subtrans.gob.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · adjudicación BusPay (30-ene-2026, alcance: buses)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 (BusPay cubre micros, no colectivos)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tendencias y desafíos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><strong>Apps de transporte</strong> (Uber, Cabify, DiDi) desde 2017-2018. La Ley 21.431 (2022) las regula, pero no las equipara en tarifa.</li>
          <li><strong>Mercado de cupos</strong>: con el padrón cerrado, el cupo es escaso y caro. El sector cuesta atraer conductores jóvenes.</li>
          <li><strong>Sin electrificación</strong>: los buses avanzan a flota eléctrica (PE 2024); los colectivos siguen a combustión.</li>
        </ul>
      </Section>

      <CollapsibleSection title="Cronología">
        <Timeline
          items={[
            { date: '21-nov-1992', event: 'DS 212/1992 del MTT define la modalidad "taxi colectivo".', source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=11497', label: 'BCN · DS 212/1992' } },
            { date: '11-sep-2011', event: 'Ley 20.474 suspende por cinco años la inscripción de nuevos taxis en el RNSTP. Inicia el padrón cerrado.', source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=1024893', label: 'BCN · Ley 20.474' } },
            { date: '2017-2018', event: 'Llegan las apps de transporte al Gran Concepción. Presión sobre tarifa y demanda.' },
            { date: '1-ene-2024', event: 'Entra el PE 2024, solo para buses urbanos. Los colectivos mantienen su régimen RNSTP.', source: { href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/', label: 'DPR Biobío · 3-ene-2024' } },
            { date: '28-ene-2026', event: 'Adjudicación de BusPay (11 comunas, solo buses). Los colectivos quedan fuera.', source: { href: 'https://www.subtrans.gob.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/', label: 'Subtrans · 30-ene-2026' } },
            { date: '1-dic-2026', event: 'Marcha blanca de BusPay en micros. La fuente no menciona colectivos.', source: { href: 'https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta', label: 'Canal 9 · 23-nov-2026' } },
          ]}
        />
        <PendingBanner>
          <strong>Hitos pendientes:</strong> decreto de la última prórroga del
          padrón cerrado, resoluciones tarifarias por línea y paros gremiales
          del sector en el Biobío. Cierre por archivo de BCN y prensa regional.
        </PendingBanner>
      </CollapsibleSection>

      <CollapsibleSection title="Datos pendientes y contribución">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Cantidad de colectivos activos 2025-2026 (DTPR o RNSTP).</li>
          <li>Catastro de líneas: número, razón social, recorrido, terminal, tarifa.</li>
          <li>Tarifa diurna y nocturna 2026 por línea.</li>
          <li>Antigüedad máxima aplicable en 2026.</li>
          <li>Última prórroga legal del padrón cerrado.</li>
          <li>Federación regional del Biobío ("FERETAX", sin cita primaria).</li>
          <li>Valor de mercado del cupo y participación modal (SECTRA).</li>
          <li>Existencia de un perímetro específico para colectivos.</li>
          <li>Política 2026-2027 sobre integración a BusPay.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vías de cierre: Ley 20.285 a la DTPR Biobío, CONATACOCH, prensa regional
          y SECTRA.
        </p>
        <p className="text-[13px]">
          Si tienes catastro de líneas, fotos de letreros o resoluciones
          tarifarias, abre un PR en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/taxis-colectivos-gran-concepcion.tsx">
            github.com/marcorojasb/conce.patagua.dev
          </SourceLink>
          .
        </p>
      </CollapsibleSection>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li><a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">Biotrén y sus extensiones</a>: el otro modo urbano masivo, regulado y visible en el visor.</li>
          <li><a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">Perímetro de Exclusión del Gran Concepción 2024</a>: régimen de los buses urbanos, con el mismo art. 3° de la Ley 18.696.</li>
          <li><a href="/wiki/buspay" className="underline underline-offset-2">BusPay</a>: el sistema de recaudo del que los colectivos quedan fuera.</li>
          <li><a href="/wiki/seremitt-dtpr-biobio" className="underline underline-offset-2">SEREMITT Biobío y la DTPR</a>: autoriza tarifas, recorridos y cupos de los colectivos por resolución.</li>
          <li><a href="/wiki/subsidio-ley-20378" className="underline underline-offset-2">Subsidio Ley 20.378</a>: los colectivos no son licitados y no entran en su ámbito. Sí financian la renovación de flota vía el programa regional.</li>
          <li><a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS Gran Concepción</a>: qué cubre el feed del visor y por qué no incluye colectivos.</li>
        </ul>
      </Section>

      <Sources>
        <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=11497">BCN Ley Chile · DS 212/1992</SourceLink>
        <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29708">BCN Ley Chile · Ley 18.290</SourceLink>
        <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29994">BCN Ley Chile · Ley 18.696</SourceLink>
        <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1024893">BCN Ley Chile · Ley 20.474</SourceLink>
        <SourceLink href="https://www.subtrans.gob.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">Subtrans · adjudicación BusPay (alcance: buses)</SourceLink>
        <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">BioBioChile · 28-ene-2026</SourceLink>
        <SourceLink href="https://www.canal9.cl/episodios/2026/11/23/pago-electronico-en-micros-del-gran-concepcion-comienza-el-1-de-diciembre-conozca-donde-comprar-y-cargar-la-tarjeta">Canal 9 · marcha blanca BusPay (23-nov-2026)</SourceLink>
        <SourceLink href="https://dtpr.gob.cl/wp-content/uploads/2026/06/Ficha-Biobio-2026-vdef.pdf">DTPR · Subsidios Biobío 2026</SourceLink>
        <SourceLink href="https://es.wikipedia.org/wiki/Taxi_colectivo">Wikipedia · Taxi colectivo (cita cruzada)</SourceLink>
      </Sources>
    </div>
  );
}
