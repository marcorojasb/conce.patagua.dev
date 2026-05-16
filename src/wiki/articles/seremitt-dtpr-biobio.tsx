// SEREMITT Biobío y DTPR — ficha institucional de la autoridad regional
// de transportes. Es la entidad que está detrás de cada decisión que
// los demás artículos del wiki citan sin desarrollar: perímetros de
// exclusión, licitaciones DTPR, subsidios Ley 20.378, fiscalización,
// integración con MOP en electrocorredores.
//
// Distinción crítica que el artículo resuelve:
//   - SEREMITT = Secretaría Regional Ministerial de Transportes y
//     Telecomunicaciones. Es la representación POLÍTICA del MTT en
//     la región. La encabeza un(a) SEREMI nombrado(a) por el(la)
//     Presidente(a) a propuesta del ministro(a). Existe en cada
//     región del país (DFL 575/1974, después DFL 1-19.653/2000).
//   - DTPR = División de Transporte Público Regional. Es una
//     dependencia TÉCNICA de la Subsecretaría de Transportes que
//     opera bajo la coordinación regional de la SEREMITT. Ejecuta
//     licitaciones, gestiona subsidios, fiscaliza operadores. Tiene
//     oficinas regionales propias (DPR Biobío vive en
//     dprbiobio.dpr.gob.cl). Equivalente metropolitano: DTPM.
//   - DTPM = Dirección de Transporte Público Metropolitano. SOLO
//     opera el sistema RED de Santiago. No tiene jurisdicción en
//     el Biobío.
//   - 3CV = Centro de Control y Certificación Vehicular. Servicio
//     dependiente del MTT a nivel nacional. Certifica buses y
//     vehículos de transporte público. Sus pruebas se hacen en
//     centros distribuidos en regiones, pero la jefatura es central.
//
// Datos verificados con fuente primaria:
//   - Patricio Fierro asume como SEREMI Biobío 10-ene-2025 (DC).
//   - Héctor Silva fue el SEREMI anterior (citas DC ene-2024,
//     marzo 2024).
//   - Hugo Cautivo aparece como "seremi (s)" en mar-2026 — figura
//     de suplencia documentada en BusPay (Sala de Prensa).
//   - Sitio web DTPR Biobío activo: https://dprbiobio.dpr.gob.cl
//   - Sitio web MTT nacional: https://www.mtt.gob.cl
//   - Subsecretaría de Transportes: https://www.subtrans.gob.cl
//   - Marcos legales:
//     · DFL 343/1953 (organización del MTT)
//     · Ley 18.059 (atribuciones MTT en transporte terrestre)
//     · Ley 18.696 (perímetros de exclusión, art. 3°)
//     · Ley 20.378 (subsidio nacional al transporte público)
//     · Ley 19.880 (procedimientos administrativos)
//     · Ley 20.285 (transparencia activa)
//
// Lo que NO se puede verificar sin Ley de Transparencia y va en
// banner ámbar:
//   - Nombre y antecedentes del(la) director(a) regional DTPR
//     Biobío vigente en mayo 2026.
//   - Organigrama interno detallado (jefaturas de fiscalización,
//     perímetros, subsidios, autorizaciones).
//   - Dotación exacta (número de funcionarios) regional.
//   - Dirección física actual de la SEREMITT en Concepción
//     (consultable en transparencia.gob.cl pero no recuperada
//     en esta primera versión).
//   - Presupuesto regional anual ejecutado.

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';

export default function SeremittDtprBiobio() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias y prensa
        regional 2023-2026.</strong> La estructura institucional
        (SEREMITT como instancia política, DTPR como dependencia
        técnica de la Subsecretaría de Transportes), los marcos
        legales que invoca (DFL 343, Ley 18.059, Ley 18.696, Ley
        20.378), la sucesión de SEREMI (Héctor Silva durante 2024 y
        Patricio Fierro desde 10-ene-2025), la suplencia documentada
        de Hugo Cautivo en mar-2026 y la cartera regional 2024-2026
        están citadas con fuente.{' '}
        <strong>Pendientes</strong>: nombre del(la) director(a)
        regional DTPR Biobío vigente, organigrama interno, dirección
        física actualizada, dotación exacta, presupuesto anual
        ejecutado. Marcadas con banner ámbar abajo.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          La <strong>SEREMITT Biobío</strong> (Secretaría Regional
          Ministerial de Transportes y Telecomunicaciones) y la{' '}
          <strong>DTPR Biobío</strong> (División de Transporte
          Público Regional) son las dos caras de la autoridad
          regional del Ministerio de Transportes y Telecomunicaciones
          (MTT) en la región. Toda decisión de transporte público
          que aparece en este wiki —el{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro de Exclusión del Gran Concepción 2024
          </a>
          , la{' '}
          <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
            licitación de la Ruta 201 Santa Juana
          </a>
          , el sistema{' '}
          <a href="/wiki/buspay-2026" className="underline underline-offset-2">
            BusPay 2026
          </a>
          , los subsidios al corredor{' '}
          <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
            Concepción ↔ Florida
          </a>
          , los{' '}
          <a href="/wiki/electrocorredores-mop-biobio" className="underline underline-offset-2">
            Electrocorredores MOP
          </a>{' '}
          y la publicación del{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            feed GTFS Gran Concepción
          </a>
          — pasa por una o por ambas instancias.
        </p>
        <p>
          La distinción que el público confunde y que este artículo
          resuelve: <strong>la SEREMITT no licita ni paga subsidios
          directamente</strong>. Eso lo hace la DTPR como brazo
          técnico de la Subsecretaría de Transportes. La SEREMITT
          coordina, fiscaliza políticamente, comunica a la prensa y
          firma resoluciones regionales; la DTPR ejecuta el
          contrato, paga la liquidación mensual y abre los
          expedientes.
        </p>
      </Section>

      <Section title="Estructura: SEREMITT vs DTPR vs DTPM">
        <p>
          En Chile coexisten tres siglas distintas que la prensa
          regional usa como sinónimos pero que tienen funciones
          separadas. Importante no confundirlas:
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Sigla</th>
                <th className="px-3 py-2 font-medium">Nombre</th>
                <th className="px-3 py-2 font-medium">Naturaleza</th>
                <th className="px-3 py-2 font-medium">Jurisdicción</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">SEREMITT</td>
                <td className="px-3 py-2">Secretaría Regional Ministerial de Transportes y Telecomunicaciones</td>
                <td className="px-3 py-2">Instancia política. La encabeza un(a) SEREMI nombrado(a) por el(la) Presidente(a) a propuesta del(la) ministro(a) de Transportes.</td>
                <td className="px-3 py-2">Una por cada región del país (16 SEREMITT). En el Biobío, sede en Concepción.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">DTPR</td>
                <td className="px-3 py-2">División de Transporte Público Regional</td>
                <td className="px-3 py-2">Dependencia técnica de la Subsecretaría de Transportes. Brazo ejecutor: licitaciones, contratos, subsidios, fiscalización operativa.</td>
                <td className="px-3 py-2">Tiene oficinas regionales propias. DPR Biobío opera en <code className="font-mono text-[11px]">dprbiobio.dpr.gob.cl</code> y cubre toda la región.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">DTPM</td>
                <td className="px-3 py-2">Dirección de Transporte Público Metropolitano</td>
                <td className="px-3 py-2">Equivalente metropolitano de la DTPR, pero con personalidad jurídica propia y un director(a) nombrado(a) por el(la) ministro(a).</td>
                <td className="px-3 py-2"><strong>SOLO Región Metropolitana</strong>. Administra RED (ex Transantiago). No tiene jurisdicción en el Biobío.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">3CV</td>
                <td className="px-3 py-2">Centro de Control y Certificación Vehicular</td>
                <td className="px-3 py-2">Servicio dependiente del MTT a nivel nacional. Certifica buses, vehículos pesados y normas de emisión.</td>
                <td className="px-3 py-2">Nacional con sedes regionales. La SEREMITT y la DTPR articulan con el 3CV los procedimientos de inspección y certificación de flota.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Una forma simple de leer las fuentes: cuando una nota dice
          "el SEREMI anunció...", está hablando de la instancia
          política regional (SEREMITT). Cuando un decreto dice
          "DTPR adjudica..." o un comunicado se publica en
          <code className="font-mono"> dprbiobio.dpr.gob.cl</code>,
          está hablando del brazo técnico. Ambos coordinan: por
          ejemplo, el inicio del perímetro 2024 lo anunció el
          SEREMI Héctor Silva y lo ejecutó la DTPR.
        </p>
        <Sources>
          <SourceLink href="https://www.subtrans.gob.cl/">
            Subsecretaría de Transportes · sitio oficial
          </SourceLink>
          <SourceLink href="https://www.dtpm.cl/">
            DTPM · Dirección de Transporte Público Metropolitano (referencia comparativa)
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · portal oficial
          </SourceLink>
          <SourceLink href="https://www.3ctsx.cl/">
            3CV · Centro de Control y Certificación Vehicular (operador técnico)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="SEREMITT Biobío en 2026">
        <p>
          La instancia política se encarna en una persona y un
          equipo de gabinete:
        </p>
        <KeyValueList
          items={[
            ['SEREMI titular', 'Patricio Fierro Cifuentes (asumió el 10-ene-2025; nombrado por el Presidente Gabriel Boric a propuesta del Ministro de Transportes Juan Carlos Muñoz)'],
            ['SEREMI anterior', 'Héctor Silva (titular durante 2023-2024). Bajo su gestión arrancó el perímetro de exclusión 1-ene-2024 y se firmó el acuerdo gremial 22-nov-2023.'],
            ['Suplencias documentadas', 'Hugo Cautivo aparece como "SEREMI (s)" en marzo de 2026 en actos de BusPay — figura de subrogancia durante ausencias del titular.'],
            ['Sede', 'Concepción. Dirección exacta pendiente de cotejo en transparencia activa.'],
            ['Funciones políticas', 'Vocería ante prensa regional · firma de resoluciones regionales · coordinación con GORE Biobío, MOP y municipios · representación del MTT ante el Gobierno Regional y el Consejo Regional (CORE)'],
            ['Reportabilidad', 'Reporta al(la) Ministro(a) de Transportes en Santiago. No depende del Gobernador Regional electo, aunque coordina con el GORE.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          El cargo de SEREMI es de exclusiva confianza presidencial:
          el(la) Presidente(a) puede removerlo(a) sin expresión de
          causa. Cada cambio de gobierno (marzo de cada cuatro años)
          arrastra una renovación completa de las SEREMITT del
          país. Concepción ha tenido al menos dos SEREMI en el
          periodo de cobertura del wiki (Silva → Fierro).
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html">
            Diario Concepción · 10-ene-2025 — Nombramiento de Patricio Fierro
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/">
            DPR Biobío · 3-ene-2024 — Cita Héctor Silva como SEREMI 2024
          </SourceLink>
        </Sources>
      </Section>

      <Section title="DTPR Biobío en 2026">
        <p>
          El brazo técnico tiene una estructura más estable y
          menos sujeta a la rotación política:
        </p>
        <KeyValueList
          items={[
            ['Dependencia jerárquica', 'Subsecretaría de Transportes (Santiago) → División de Transporte Público Regional (DTPR nacional) → DPR Biobío (sede regional).'],
            ['Sede', 'Concepción. Sitio web: dprbiobio.dpr.gob.cl'],
            ['Funciones centrales', 'Licitaciones DTPR (ej. ELC0007 Santa Juana) · pagos de subsidio Ley 20.378 · fiscalización operativa con apoyo del 3CV y Carabineros · trato directo con operadores en régimen de perímetro · autorización de servicios urbanos e interurbanos'],
            ['Padrón regional', 'Lleva el padrón de operadores autorizados del Registro Nacional de Servicios de Transporte de Pasajeros (RNSTP) en el Biobío.'],
            ['Datos abiertos', 'Publica el feed GTFS del Gran Concepción a través de datos.gob.cl bajo coordinación con la Subsecretaría de Transportes.'],
            ['Comisión evaluadora', 'En licitaciones grandes (BusPay 2026, Santa Juana 2024) la Comisión Evaluadora de la DTPR puntúa ofertas técnicas y económicas según las bases.'],
          ]}
        />
        <PendingBanner>
          <strong>Nombre del(la) director(a) regional DTPR Biobío
          pendiente.</strong> Los comunicados oficiales del portal
          DPR Biobío no nombran rutinariamente al(la) responsable
          regional —se identifica con frecuencia al(la) SEREMITT
          como vocero(a) político(a)—. La nómina actual del cargo
          es consultable por Ley 20.285 (transparencia activa) o
          en el directorio del MTT.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · portal regional oficial
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/">
            Subtrans · subsecretaría matriz
          </SourceLink>
          <SourceLink href="https://www.mtt.gob.cl/">
            MTT · ministerio matriz
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Funciones principales">
        <KeyValueList
          items={[
            ['Licitar perímetros', 'Diseña, licita y administra los perímetros de exclusión bajo el art. 3° de la Ley 18.696. En el Biobío: PE Gran Concepción 2024, PE Tomé (2016 / operativo 2022) y PE Coronel-Lota (2013).'],
            ['Licitaciones DTPR', 'Llama y administra las licitaciones públicas de servicios urbanos e interurbanos bajo el Estatuto. Ejemplo regional: licitación ELC0007 (Ruta 201 Santa Juana, jul-2024).'],
            ['Subsidios Ley 20.378', 'Paga el subsidio nacional al transporte público y los subsidios complementarios al transporte escolar, zonas aisladas y transporte rural. Liquidaciones mensuales.'],
            ['Autorizaciones', 'Otorga, modifica y revoca autorizaciones de servicios urbanos e interurbanos. Lleva el padrón regional del Registro Nacional de Servicios de Transporte de Pasajeros (RNSTP).'],
            ['Fiscalización', 'Con apoyo del 3CV (certificación vehicular) y Carabineros (control en ruta). Sanciones administrativas: multas, suspensiones, caducidad de autorizaciones.'],
            ['Tarifas y polinomio', 'Aplica el polinomio de ajuste tarifario de los contratos de perímetro. En el Gran Concepción la tarifa adulto pasó de $550 (feb-2024) a $560 (dic-2024) a $580 (feb-2025).'],
            ['Pago electrónico', 'Llama y administra la licitación del sistema de recaudo electrónico. BusPay adjudicado al Consorcio Buspay el 28-ene-2026.'],
            ['Coordinación interagencias', 'Con MOP (electrocorredores), GORE Biobío (subsidios complementarios), MINVU (paraderos urbanos), municipios (rutas locales), EFE (Biotrén) y MTT central (políticas nacionales).'],
            ['Atención ciudadana', 'OIRS (Oficina de Información, Reclamos y Sugerencias) del MTT. Recibe consultas, reclamos y solicitudes ciudadanas Ley 20.285.'],
          ]}
        />
      </Section>

      <Section title="Marco legal">
        <p>
          La autoridad regional opera sobre seis cuerpos legales
          que se citan en este wiki cada vez que aparece la
          palabra "perímetro", "licitación", "subsidio" o
          "fiscalización":
        </p>
        <KeyValueList
          items={[
            ['DFL 343/1953', 'Ley orgánica del Ministerio de Obras Públicas, Transportes y Telecomunicaciones (después dividido). Base histórica de la organización del MTT.'],
            ['Ley 18.059 (1981)', 'Otorga al MTT el carácter de organismo rector nacional del transporte terrestre. Atribuciones generales de fiscalización, normativa y planificación.'],
            ['Ley 18.696 (1988)', 'Crea el régimen de subsidio al transporte mayor. El art. 3° faculta al MTT a definir perímetros de exclusión con tarifa, frecuencia, antigüedad y tecnología regulada (base legal del PE Gran Concepción 2024, PE Tomé y PE Coronel-Lota).'],
            ['Ley 20.378 (2009)', 'Crea el subsidio nacional al transporte público. El art. 4° habilita los subsidios a zonas aisladas y transporte rural (base legal de la licitación ELC0007 Santa Juana y de las capas subsidiadas Florida).'],
            ['Ley 19.880 (2003)', 'Procedimientos administrativos. Rige los actos resolutivos de la SEREMITT y la DTPR.'],
            ['Ley 20.285 (2008)', 'Transparencia activa y derecho de acceso a la información pública. Base normativa para solicitar expedientes de licitación, contratos y rankings de cumplimiento.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Adicionalmente, las decisiones regionales materiales se
          materializan en <strong>decretos del Ministerio</strong>{' '}
          (firmados por el Subsecretario(a) de Transportes y, en
          casos sustanciales, visados por la Contraloría General de
          la República), <strong>resoluciones exentas</strong> (no
          requieren visa CGR) y <strong>resoluciones afectas</strong>{' '}
          (sí la requieren). La Resolución Afecta 29/2023 del MTT,
          visada por la Contraloría en mayo de 2023, fue la base
          regulatoria del Perímetro de Exclusión del Gran Concepción
          2024.
        </p>
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29742">
            BCN · Ley 18.059 (atribuciones MTT en transporte terrestre)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=30190">
            BCN · Ley 18.696 (perímetros de exclusión y subsidios)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 20.378 (subsidio nacional al transporte público)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=210676">
            BCN · Ley 19.880 (procedimientos administrativos)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=276363">
            BCN · Ley 20.285 (transparencia y acceso a la información pública)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cartera regional 2024-2026">
        <p>
          Hitos materiales que la SEREMITT Biobío y la DTPR han
          ejecutado, anunciado o están tramitando en el periodo de
          cobertura del wiki:
        </p>
        <KeyValueList
          items={[
            ['PE Gran Concepción 2024', 'Operativo 1-ene-2024 → 31-dic-2028. 7 comunas, 36 unidades de negocio, ~35 empresas. Tarifa $580 adulto. Reemplazó la licitación 2002.'],
            ['PE Tomé', 'Decreto MTT jul-2016, operativo 10-mar-2022. Operador único Transportes Tomé. Líneas 401 / 411 / 421.'],
            ['PE Coronel-Lota', 'Implementado en 2013. Históricamente subfinanciado. Operadores locales (Las Galaxias, Buses J. Ewert, otros).'],
            ['Licitación ELC0007 Santa Juana', 'Adjudicada en 2024 a Sociedad de Transporte de Pasajeros Santa Juana SpA. 23 buses Agrale Euro V, tarifa $1.000, operativo desde 15-jul-2024. Primera licitación pública del Biobío en 10+ años.'],
            ['BusPay 2026', 'Adjudicado al Consorcio Buspay el 28-ene-2026. ~$750 millones/año, 1.800-2.000 validadores en 11 comunas (las 7 del PE GC + Tomé + Coronel + Lota + Santa Juana). Marcha blanca Q3 2026, régimen 100% electrónico fines 2026.'],
            ['Electrocorredores MOP', 'Coordinación con MOP Concesiones en tres proyectos sobre la Ruta 160 (San Pedro-Coronel), Ruta 150 (Concepción-Penco) y Autopista Concepción-Talcahuano Tramo II. Inversión ~USD 250M, plazo concesión 25 años, ofertas únicas Electro-Cointer en 2025, adjudicación 1S 2026.'],
            ['Subsidios Florida', 'Capa zona norte oct-2025, Rahuil, Poñén-Roa y servicio nocturno: nuevas líneas subsidiadas Ley 20.378 anunciadas por la SEREMITT desde 2025 sin licitar todavía el reemplazo del corredor troncal Concepción ↔ Florida.'],
            ['GTFS Gran Concepción', 'Feed estático publicado en datos.gob.cl bajo coordinación Subtrans / DTPR Biobío. Cubre las 36 unidades de negocio del PE Gran Concepción 2024.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Cada uno de estos hitos tiene un artículo propio (o
          aparece reflejado) en este wiki, accesible desde la
          sección "Vínculos con otros artículos" más abajo.
        </p>
      </Section>

      <Section title="Relación con el MTT central (Santiago)">
        <p>
          La SEREMITT y la DTPR Biobío no son autónomas: ejecutan
          la política del MTT central. La división del trabajo
          práctica es:
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Decisión</th>
                <th className="px-3 py-2 font-medium">Quién firma</th>
                <th className="px-3 py-2 font-medium">Quién ejecuta</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Decreto de perímetro de exclusión</td>
                <td className="px-3 py-2">Ministro(a) de Transportes / Subsecretario(a)</td>
                <td className="px-3 py-2">DTPR Biobío (administra contratos)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Bases de licitación pública</td>
                <td className="px-3 py-2">Subsecretario(a) (resolución afecta, visada por CGR)</td>
                <td className="px-3 py-2">DTPR Biobío (publica, evalúa, adjudica)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Resolución afecta de adjudicación</td>
                <td className="px-3 py-2">Subsecretario(a) + visa CGR</td>
                <td className="px-3 py-2">DTPR Biobío (notifica al operador, firma contrato)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Resolución exenta regional (autorizaciones, sanciones)</td>
                <td className="px-3 py-2">SEREMI Biobío</td>
                <td className="px-3 py-2">DTPR Biobío</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Ajuste tarifario polinómico</td>
                <td className="px-3 py-2">Subsecretario(a) (resolución exenta)</td>
                <td className="px-3 py-2">DTPR Biobío comunica a operadores</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Pago mensual del subsidio</td>
                <td className="px-3 py-2">Subsecretario(a) / Tesorería General de la República</td>
                <td className="px-3 py-2">DTPR Biobío liquida</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Esto explica por qué cuando se adjudica BusPay
          (28-ene-2026) la noticia menciona simultáneamente al
          MTT, la Subsecretaría de Transportes, la DTPR Biobío y a
          la SEREMITT regional: cada actor cumple un rol distinto
          en el mismo acto administrativo.
        </p>
      </Section>

      <Section title="Relación con otras instituciones regionales">
        <KeyValueList
          items={[
            ['GORE Biobío', 'Gobierno Regional. Cofinancia subsidios complementarios al transporte rural y escolar a través del FNDR. Coordinación a través del Consejo Regional (CORE) y el Gobernador Regional electo.'],
            ['MOP Biobío', 'Ministerio de Obras Públicas. Licita y supervisa los Electrocorredores (Ruta 160, Ruta 150, Autopista Concepción-Talcahuano Tramo II). La SEREMITT MTT aporta la operación de buses; el MOP, la infraestructura vial.'],
            ['MINVU Biobío', 'Ministerio de Vivienda y Urbanismo. Coordina paraderos urbanos, infraestructura peatonal y planes maestros de transporte urbano (PMTU).'],
            ['Municipios', 'Las 33 comunas de la región. Permisos de uso de vías locales, terminales municipales, mantención de paraderos. La SEREMITT coordina con cada municipio cuando el régimen toca su comuna (en el AMC, 11 comunas con coordinación activa).'],
            ['EFE Trenes Metropolitanos', 'Empresa de los Ferrocarriles del Estado, operadora del Biotrén. Coordinación tarifaria e intermodal (Conecta, Biobús) con la SEREMITT y la DTPR.'],
            ['Carabineros de Chile', 'Apoya la fiscalización en ruta de servicios autorizados. Sanciona en terreno; la DTPR procesa administrativamente.'],
            ['Contraloría General de la República', 'Visa las resoluciones afectas del MTT que afectan recursos públicos sustanciales. Visa CGR a la Res. 29/2023 (PE Gran Concepción) en mayo 2023; visa CGR a bases de electrocorredores 13-nov-2024.'],
            ['Servicio de Impuestos Internos', 'Padrón tributario de operadores. La DTPR cruza datos de RNSTP con SII para verificar regularidad.'],
          ]}
        />
      </Section>

      <Section title="Transparencia y datos abiertos">
        <p>
          La SEREMITT y la DTPR están sujetas al régimen general de
          transparencia activa (Ley 20.285) y al portal de datos
          abiertos del Estado:
        </p>
        <KeyValueList
          items={[
            ['Transparencia activa', 'Publicación obligatoria de adquisiciones, contratos, viáticos, dotación, organigrama y normativa. Accesible vía transparencia.gob.cl filtrando por MTT.'],
            ['Solicitudes Ley 20.285', 'Vía portal "Solicitud de Acceso a la Información Pública". Plazo de respuesta legal: 20 días hábiles, prorrogables.'],
            ['Datos abiertos', 'Feed GTFS Gran Concepción publicado en datos.gob.cl bajo licencia CC-BY. Ver artículo dedicado.'],
            ['Diario Oficial', 'Publicación de decretos del MTT que crean perímetros, adjudican licitaciones o ajustan tarifas (DO requerido para actos administrativos generales).'],
            ['OIRS regional', 'Oficina de Información, Reclamos y Sugerencias del MTT. Atiende consultas ciudadanas presenciales y telefónicas.'],
            ['Ranking de cumplimiento', 'El PE Gran Concepción 2024 prevé la publicación de un ranking de cumplimiento por unidad de negocio. Su periodicidad y desagregación específica no han sido cotejadas en fuente abierta — pendiente.'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.portaltransparencia.cl/PortalPdT/web/ministerio-de-transportes-y-telecomunicaciones">
            Portal de Transparencia · MTT
          </SourceLink>
          <SourceLink href="https://datos.gob.cl/">
            datos.gob.cl · Portal de Datos Abiertos del Estado
          </SourceLink>
          <SourceLink href="https://www.diariooficial.interior.gob.cl/">
            Diario Oficial de la República de Chile
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Críticas y desafíos">
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Atraso histórico en licitar
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              La licitación 2002 del Gran Concepción operó 22 años
              antes de que el régimen sucesor (PE 2024) entrara en
              vigor. La licitación pública moderna de un servicio
              regional (ELC0007 Santa Juana) fue la primera en{' '}
              <strong>más de 10 años</strong> en el Biobío. El
              corredor Concepción ↔ Florida sigue sin licitación
              moderna en 2026 a pesar de tener subsidios anuales.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Capacidad sancionatoria limitada
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Las sanciones a operadores son administrativas (multa,
              descuento sobre subsidio, eventual caducidad de
              autorización) y se procesan en plazos largos. El
              ranking de cumplimiento prometido por el PE 2024 es la
              palanca más fuerte pero no se publica desagregado en
              forma abierta.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Falta de GTFS-Realtime
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El feed GTFS Gran Concepción es estático. No hay
              GTFS-Realtime (posiciones en vivo) publicado al
              público, pese a que los contratos del PE 2024 exigen
              GPS online a la flota. El dato existe en los servidores
              de la DTPR pero no se abre a desarrolladores ni
              ciudadanos.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Recorridos interurbanos privados sin licitación moderna
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Concepción ↔ Florida, Concepción ↔ Yumbel y el corredor
              de El Pimentón siguen operando bajo régimen privado con
              autorización individual a cada empresa. La SEREMITT ha
              sumado capas subsidiadas a Florida (oct-2025, Rahuil,
              Poñén-Roa, nocturno) pero no ha llamado a licitación
              integral del corredor.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Rotación política de la SEREMITT
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El cambio de SEREMI (Silva → Fierro en enero de 2025) y
              las subrogancias (Hugo Cautivo como SEREMI (s) en
              marzo de 2026) implican discontinuidades en la
              vocería política. La continuidad técnica recae en la
              DTPR, pero el público lee la rotación como falta de
              foco.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Cronología">
        <Timeline
          items={[
            {
              date: '1953',
              event: 'DFL 343 organiza el Ministerio de Obras Públicas, Transportes y Telecomunicaciones — antecedente histórico del MTT actual.',
              source: { href: 'https://www.bcn.cl/leychile', label: 'BCN' },
            },
            {
              date: '1981',
              event: 'Ley 18.059 otorga al MTT el carácter de organismo rector nacional del transporte terrestre.',
              source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=29742', label: 'BCN Ley 18.059' },
            },
            {
              date: '1988',
              event: 'Ley 18.696 crea el régimen de subsidio al transporte mayor. El art. 3° habilita los perímetros de exclusión.',
              source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=30190', label: 'BCN Ley 18.696' },
            },
            {
              date: '2000-2002',
              event: 'La SEREMITT Biobío diseña la primera licitación moderna del Gran Concepción. Se adjudican contratos a 37 empresas operadoras en 2002.',
            },
            {
              date: '2009',
              event: 'Ley 20.378 crea el subsidio nacional al transporte público. El art. 4° habilita los subsidios a zonas aisladas y transporte rural.',
              source: { href: 'https://www.bcn.cl/leychile/navegar?idNorma=1005871', label: 'BCN Ley 20.378' },
            },
            {
              date: '2013',
              event: 'Implementación del Perímetro de Exclusión Coronel-Lota.',
            },
            {
              date: 'Jul-2016',
              event: 'Decreto MTT crea el Perímetro de Exclusión de Tomé (operativo desde 10-mar-2022).',
            },
            {
              date: '27-abr-2017',
              event: 'Resolución N° 1006 del MTT — marco normativo del perímetro de exclusión del Gran Concepción (base regulatoria que recién se ejecutó en 2024).',
              source: { href: 'https://www.mtt.gob.cl/wp-content/uploads/2017/10/Resex_1005.2017.pdf', label: 'MTT' },
            },
            {
              date: 'May-2023',
              event: 'Contraloría visa la Resolución Afecta N° 29/2023 del MTT, que aprueba el PE Gran Concepción y faculta la negociación directa con operadores existentes.',
            },
            {
              date: '22-nov-2023',
              event: 'SEREMITT Biobío facilita el acuerdo entre el MTT y las cinco federaciones gremiales del Gran Concepción. Desactiva paros previstos para fin de año. Vocería política a cargo del SEREMI Héctor Silva.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2023/11/22/perimetro-de-exclusion-gremios-del-gran-concepcion-llegan-a-acuerdo-con-ministerio-de-transportes.shtml', label: 'BioBioChile · 22-nov-2023' },
            },
            {
              date: '1-ene-2024',
              event: 'Entra en vigor el Perímetro de Exclusión del Gran Concepción 2024. SEREMI Héctor Silva anuncia GPS obligatorio, fiscalización online y ranking de cumplimiento.',
              source: { href: 'https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/', label: 'DPR Biobío · 3-ene-2024' },
            },
            {
              date: '15-jul-2024',
              event: 'Inicio operativo de la Ruta 201 Santa Juana bajo licitación DTPR ELC0007 — primera licitación pública del Biobío en más de una década.',
              source: { href: 'https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/', label: 'DPR Biobío · 22-jul-2024' },
            },
            {
              date: '13-nov-2024',
              event: 'Contraloría visa las bases de los Electrocorredores MOP (Rutas 150, 160 y Autopista Concepción-Talcahuano Tramo II). Coordinación SEREMITT-MOP.',
            },
            {
              date: '9-dic-2024',
              event: 'Primer ajuste polinómico bajo el perímetro: tarifa adulto sube de $550 a $560.',
            },
            {
              date: '10-ene-2025',
              event: 'Patricio Fierro Cifuentes asume como SEREMI de Transportes y Telecomunicaciones del Biobío, en reemplazo de Héctor Silva.',
              source: { href: 'https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html', label: 'Diario Concepción · 10-ene-2025' },
            },
            {
              date: '23-feb-2025',
              event: 'Segundo ajuste polinómico bajo el régimen 2024: tarifa adulto $580, escolar $190, adulto mayor $290. Vocería del SEREMI Patricio Fierro.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html', label: 'Diario Concepción · 14-feb-2025' },
            },
            {
              date: '23-sep-2025',
              event: 'La DTPR Biobío recibe 6 ofertas para operar el sistema de pago electrónico BusPay. Comisión Evaluadora puntúa según las bases.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html', label: 'Diario Concepción · 23-sep-2025' },
            },
            {
              date: 'Oct-2025',
              event: 'SEREMITT anuncia capa subsidiada Concepción ↔ Florida zona norte bajo Ley 20.378 (sin licitación integral del corredor todavía).',
            },
            {
              date: '5-nov-2025',
              event: 'Apertura de ofertas técnicas del Electrocorredor Ruta 160: oferente único Electro-Cointer (Grupo Azvi).',
            },
            {
              date: '28-ene-2026',
              event: 'MTT adjudica BusPay al Consorcio Buspay. ~$750 millones/año, 1.800-2.000 validadores, 11 comunas. SEREMI Patricio Fierro vocero político; DTPR ejecuta.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
            {
              date: 'Mar-2026',
              event: 'Hugo Cautivo aparece en actos públicos como "SEREMI (s)" del Biobío — figura de subrogancia durante una ausencia del titular Patricio Fierro.',
            },
          ]}
        />
      </Section>

      <Section title="Cómo contactar y consultar">
        <p>
          Si necesitas levantar un reclamo, hacer una consulta
          ciudadana o solicitar información pública sobre transporte
          regional, estos son los canales formales:
        </p>
        <KeyValueList
          items={[
            ['OIRS MTT', 'Oficina de Información, Reclamos y Sugerencias del Ministerio. Atención presencial en la sede SEREMITT de Concepción y vía formulario en mtt.gob.cl.'],
            ['Portal DPR Biobío', 'dprbiobio.dpr.gob.cl — comunicados regionales, anuncios y direcciones de contacto del brazo técnico.'],
            ['Transparencia activa', 'transparencia.gob.cl filtrando "Ministerio de Transportes y Telecomunicaciones". Allí encuentras contratos, viáticos, dotación y normativa publicada.'],
            ['Solicitudes Ley 20.285', 'Vía portaltransparencia.cl → "Solicitud de Acceso a la Información Pública". Plazo de respuesta: 20 días hábiles. Útil para pedir expedientes de licitación, padrón de operadores, ranking de cumplimiento.'],
            ['Diario Oficial', 'diariooficial.interior.gob.cl — texto íntegro de decretos del MTT que crean perímetros, adjudican licitaciones o ajustan tarifas.'],
            ['BCN Ley Chile', 'leychile.cl — texto consolidado de leyes citadas (18.059, 18.696, 20.378, 19.880, 20.285).'],
            ['Subtrans', 'subtrans.gob.cl — comunicados centrales de la Subsecretaría matriz, incluyendo licitaciones grandes que afectan al Biobío.'],
            ['Datos abiertos', 'datos.gob.cl — feed GTFS Gran Concepción y otros datasets del MTT.'],
          ]}
        />
        <PendingBanner>
          <strong>Dirección física y teléfono de la sede SEREMITT
          en Concepción pendientes de cotejo.</strong> Consultables
          en la sección "Contacto" de transparencia.gob.cl o
          llamando al call center central del MTT. No publicamos
          datos sin cotejar.
        </PendingBanner>
      </Section>

      <Section title="Vínculos con otros artículos">
        <p>
          Como toda licitación, perímetro, autorización o subsidio
          del transporte público regional pasa por la SEREMITT o la
          DTPR, este artículo es el "marco institucional" detrás
          de cada ficha del wiki. Los enlaces siguientes son los
          puntos donde la actuación de la autoridad se materializa
          en una decisión concreta:
        </p>
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción 2024
            </a>{' '}
            — el régimen mayor que la SEREMITT (vocería Silva, luego
            Fierro) anunció y la DTPR ejecuta. Tarifa $580, 36
            unidades de negocio, contrato hasta 31-dic-2028.
          </li>
          <li>
            <a href="/wiki/buspay-2026" className="underline underline-offset-2">
              BusPay 2026
            </a>{' '}
            — el sistema de pago electrónico que la DTPR licitó y
            adjudicó al Consorcio Buspay el 28-ene-2026. Marcha
            blanca Q3 2026.
          </li>
          <li>
            <a href="/wiki/ruta-201-santa-juana" className="underline underline-offset-2">
              Ruta 201 Santa Juana
            </a>{' '}
            — la primera licitación pública moderna de la DTPR en el
            Biobío en más de 10 años. ELC0007, Ley 20.378 art. 4°.
          </li>
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>{' '}
            — el primer perímetro regional (jul-2016, operativo
            mar-2022) bajo administración de la DTPR Biobío.
          </li>
          <li>
            <a href="/wiki/concepcion-florida" className="underline underline-offset-2">
              Concepción ↔ Florida
            </a>{' '}
            — el caso donde la SEREMITT ha sumado capas subsidiadas
            (zona norte oct-2025, Rahuil, Poñén-Roa, nocturno) sin
            licitar todavía el reemplazo del corredor troncal.
          </li>
          <li>
            <a href="/wiki/concepcion-yumbel" className="underline underline-offset-2">
              Concepción ↔ Yumbel
            </a>{' '}
            — corredor privado puro sin perímetro ni licitación
            DTPR. La SEREMITT solo otorga autorizaciones
            individuales a cada operador.
          </li>
          <li>
            <a href="/wiki/corredor-el-pimenton" className="underline underline-offset-2">
              Corredor de El Pimentón
            </a>{' '}
            — corredor interurbano sin régimen unificado bajo
            cuatro operadores privados.
          </li>
          <li>
            <a href="/wiki/recorridos-interurbanos" className="underline underline-offset-2">
              Recorridos interurbanos del Gran Concepción
            </a>{' '}
            — índice general de servicios autorizados por la DTPR
            pero que no están en el feed GTFS urbano.
          </li>
          <li>
            <a href="/wiki/electrocorredores-mop-biobio" className="underline underline-offset-2">
              Electrocorredores MOP del Biobío
            </a>{' '}
            — proyectos de infraestructura del MOP donde la
            SEREMITT MTT coordina el componente de operación de
            buses. SEREMI Patricio Fierro aclaró en nov-2025 que
            la concesión no obliga a flota 100% eléctrica.
          </li>
          <li>
            <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">
              Biotrén y sus extensiones
            </a>{' '}
            — la SEREMITT coordina con EFE la integración
            intermodal y la discusión sobre las extensiones a Penco,
            Tomé, Lota y Carriel Sur.
          </li>
          <li>
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>{' '}
            — el feed estático que publica la DTPR Biobío vía
            datos.gob.cl bajo coordinación con la Subsecretaría de
            Transportes.
          </li>
          <li>
            <a href="/wiki/sobre-este-wiki" className="underline underline-offset-2">
              Sobre este wiki
            </a>{' '}
            — el modelo editorial: por qué citamos a la SEREMITT y a
            la DTPR como autoridades regionales y por qué marcamos
            como pendiente lo que no podemos verificar sin
            transparencia activa.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Nombre y antecedentes del(la) director(a) regional DTPR Biobío vigente en mayo 2026.</li>
          <li>Organigrama interno de la SEREMITT y la DTPR Biobío (jefaturas de fiscalización, perímetros, subsidios, autorizaciones, OIRS).</li>
          <li>Dotación exacta (número de funcionarios) de la SEREMITT y la DTPR Biobío.</li>
          <li>Dirección física actualizada de la SEREMITT en Concepción.</li>
          <li>Presupuesto regional ejecutado 2024-2025-2026 desagregado por programa (subsidios, fiscalización, gastos operativos).</li>
          <li>Periodicidad y formato del ranking de cumplimiento del PE Gran Concepción 2024 (¿se publica? ¿con qué desagregación?).</li>
          <li>Calendario de fiscalizaciones recientes y sanciones aplicadas (con resoluciones públicas si las hay).</li>
          <li>Número y texto de los decretos MTT que adjudicaron el PE Gran Concepción 2024 y el PE Tomé 2016 (probable Resolución Afecta N° 29/2023 para el primero, texto íntegro no recuperado).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía de cierre principal:{' '}
          <strong>solicitud de Ley 20.285</strong> al MTT y a la
          DTPR Biobío, complementada con cotejo en{' '}
          <code className="font-mono">transparencia.gob.cl</code>{' '}
          (transparencia activa).
        </p>
      </Section>

      <Section title="Bibliografía">
        <Sources>
          <SourceLink href="https://www.mtt.gob.cl/">
            MTT · Ministerio de Transportes y Telecomunicaciones
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/">
            Subsecretaría de Transportes
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/">
            DPR Biobío · portal regional oficial
          </SourceLink>
          <SourceLink href="https://www.dtpm.cl/">
            DTPM · Dirección de Transporte Público Metropolitano (referencia comparativa)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=29742">
            BCN · Ley 18.059 (atribuciones MTT en transporte terrestre)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=30190">
            BCN · Ley 18.696 (perímetros de exclusión, art. 3°)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 20.378 (subsidio nacional al transporte público)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=210676">
            BCN · Ley 19.880 (procedimientos administrativos)
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=276363">
            BCN · Ley 20.285 (transparencia y acceso a la información pública)
          </SourceLink>
          <SourceLink href="https://www.portaltransparencia.cl/PortalPdT/web/ministerio-de-transportes-y-telecomunicaciones">
            Portal de Transparencia · MTT
          </SourceLink>
          <SourceLink href="https://datos.gob.cl/">
            datos.gob.cl · Portal de Datos Abiertos del Estado
          </SourceLink>
          <SourceLink href="https://www.diariooficial.interior.gob.cl/">
            Diario Oficial de la República de Chile
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/politica/2025/01/10/nombran-nuevo-seremi-de-transportes-y-telecomunicaciones-en-biobio.html">
            Diario Concepción · 10-ene-2025 — Nombramiento de Patricio Fierro como SEREMI Biobío
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/01/03/transporte-publico-del-gran-concepcion-opera-bajo-nueva-normativa-de-perimetro-de-exclusion/">
            DPR Biobío · 3-ene-2024 — Inicio operativo perímetro (cita SEREMI Héctor Silva)
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">
            DPR Biobío · 22-jul-2024 — Inauguración Ruta 201 Santa Juana
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2023/11/22/perimetro-de-exclusion-gremios-del-gran-concepcion-llegan-a-acuerdo-con-ministerio-de-transportes.shtml">
            BioBioChile · 22-nov-2023 — Acuerdo cinco federaciones gremiales
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 — Adjudicación Consorcio Buspay
          </SourceLink>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 2026 — Comunicado oficial BusPay
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html">
            Diario Concepción · 14-feb-2025 — Anuncio alza $580 (cita SEREMI Patricio Fierro)
          </SourceLink>
          <SourceLink href="https://www.mtt.gob.cl/wp-content/uploads/2017/10/Resex_1005.2017.pdf">
            MTT · Resolución Exenta N° 1006/2017 (marco normativo PE Gran Concepción)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes el nombre actual del(la) director(a) regional
          DTPR Biobío, una copia del organigrama oficial, fotos de
          la sede de Concepción, datos de dotación o el ranking de
          cumplimiento publicado por la DTPR — abre un pull request
          en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/seremitt-dtpr-biobio.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/seremitt-dtpr-biobio.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
