// Recorridos interurbanos del Gran Concepción
// Lista panorámica de servicios licitados que conectan el área urbana
// con comunas rurales/satélite y que NO están en el GTFS urbano que
// alimenta el visor principal.

export default function RecorridosInterurbanos() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <p>
        El visor principal de <code className="font-mono">conce.patagua.dev</code> se
        alimenta del feed <strong>GTFS estático Gran Concepción</strong> publicado por
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
        />
        <ServiceRow
          code="corredor"
          title="Corredor por El Pimentón (panorámico)"
          notes="Espina dorsal interurbana sur-oriente: cruce de la Cordillera de la Costa entre Concepción y Florida / Yumbel / rural Hualqui. Cuatro operadores privados, ~40 buses combinados, regulación fragmentada, capas subsidiadas nuevas en 2025."
          slug="corredor-el-pimenton"
          verified
        />
        <ServiceRow
          code="—"
          title="Concepción ↔ Tomé"
          notes="Múltiples operadores. Conexión norte que pasa por Penco y Lirquén (estos sí están en el visor)."
        />
        <ServiceRow
          code="4 op."
          title="Concepción ↔ Florida"
          notes="Troncal privado con 4 operadores (Delsal, Nueva Libertadores, Biocosta, Trinidad). El MTT reconoce que no puede obligar a aumentar frecuencias. Desde 2025 hay capas subsidiadas (zona norte oct-2025, Rahuil, Poñén-Roa, nocturno)."
          slug="concepcion-florida"
          verified
        />
        <ServiceRow
          code="—"
          title="Concepción ↔ Yumbel"
          notes="Servicio interurbano privado. Operadores reportados: Línea Azul, Transportes Bío Bío, Pullman, Buses Bío Bío. Terminal Camilo Henríquez y Collao. Demanda peak en Fiesta de San Sebastián (20-ene / 20-mar, ~250-350 mil peregrinos). Sin licitación DTPR específica conocida."
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
          Verificamos esto en la fuente: una consulta SQL al feed Gran
          Concepción candidate no devuelve coincidencias para "201",
          "Santa Juana", "Tomé", "Florida" ni "Yumbel". Los stops mencionados
          como "Tomé" en el dataset son nombres de calles, no servicios.
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="mt-4 text-base font-semibold tracking-tight">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ServiceRow({
  code,
  title,
  notes,
  slug,
  verified,
}: {
  code: string;
  title: string;
  notes: string;
  slug?: string;
  verified?: boolean;
}) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="flex items-baseline gap-2">
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{code}</span>
        <span className="text-[14px] font-medium">{title}</span>
        {verified && (
          <span className="ml-auto rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            verificado
          </span>
        )}
      </div>
      <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{notes}</p>
      {slug && (
        <a
          href={`/wiki/${slug}`}
          className="mt-1.5 inline-block text-[11px] underline underline-offset-2 hover:text-foreground"
        >
          Ver artículo →
        </a>
      )}
    </div>
  );
}
