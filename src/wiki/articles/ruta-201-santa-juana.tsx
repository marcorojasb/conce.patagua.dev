// Ruta 201 / 201 AU · Concepción ↔ Santa Juana
// Información compilada desde fuentes secundarias mientras esperamos
// el GTFS oficial. Mantener marcada como "pendiente de verificación".

export default function Ruta201SantaJuana() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-[12px] text-amber-900 dark:text-amber-200">
        <strong>Pendiente de verificación primaria.</strong> Este artículo
        recopila lo que se sabe del servicio en publicaciones DTPR y
        observación de campo. Cuando aparezca un GTFS público oficial
        para los servicios interurbanos del Biobío, los datos del visor
        principal lo reemplazarán como fuente.
      </div>

      <Section title="Resumen">
        <p>
          El servicio <strong>201</strong> conecta Concepción con la comuna
          de Santa Juana — un trayecto interurbano que sale del área cubierta
          por el GTFS Gran Concepción urbano. La variante <strong>201&nbsp;AU</strong>
          (siglas en revisión, probablemente "Anticipado Urbano" o "Auxiliar")
          opera con frecuencia diferente y/o trazado parcial, según
          observaciones.
        </p>
      </Section>

      <Section title="Trazado aproximado">
        <p>
          Concepción centro (Plaza de la Independencia / Terminal de
          Collao) → San Pedro de la Paz → puente Llacolén → Ruta&nbsp;160 sur
          → desvío a Ruta&nbsp;156 → Santa Juana centro.
        </p>
        <p className="text-[12px] text-muted-foreground">
          Esta descripción es <strong>secundaria</strong>: no proviene de
          shapes.txt oficiales. Se incluye para orientar a quien no
          conoce el servicio.
        </p>
      </Section>

      <Section title="Frecuencia y horario">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            <strong>Hora punta mañana:</strong> múltiples salidas (dato
            pendiente de cifras).
          </li>
          <li>
            <strong>Valle:</strong> frecuencia menor, ~cada 45–60 min según
            observación.
          </li>
          <li>
            <strong>Fin de semana:</strong> servicio reducido.
          </li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Datos cualitativos. Si tienes una foto del horario publicado en
          paradero o terminal, súbela al issue tracker del repo.
        </p>
      </Section>

      <Section title="Tarifa">
        <p>
          Tarifa interurbana por tramo. <strong>Pago electrónico</strong> aún
          no integrado al sistema DTPR urbano — los anuncios sobre la
          unificación del medio de pago para el ciclo 2026 cubren los
          servicios urbanos del Gran Concepción; el caso interurbano se
          tratará en una etapa posterior según la última publicación
          revisada.
        </p>
      </Section>

      <Section title="Operador">
        <p>
          Empresa operadora bajo concesión DTPR Biobío. Identificación
          específica <strong>pendiente</strong> — requiere revisar las
          bases de la licitación vigente.
        </p>
      </Section>

      <Section title="Fuentes a revisar">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>
            Resoluciones DTPR Biobío publicadas en{' '}
            <a
              href="https://transformacion.dtpr.cl/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              transformacion.dtpr.cl
            </a>
            .
          </li>
          <li>
            OSM Overpass: relación{' '}
            <code className="font-mono">route=bus + ref=201</code> en el bbox
            Concepción-Santa Juana (si está cargada por la comunidad).
          </li>
          <li>
            Cuentas oficiales en redes sociales del operador (cuando se
            identifique).
          </li>
          <li>
            Fotografía del horario impreso en terminal/paradero de Santa Juana.
          </li>
        </ul>
      </Section>

      <Section title="Aporte de la comunidad">
        <p>
          Si te subes regularmente al 201, abre un pull request con:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Hora exacta de salida que tomas.</li>
          <li>Foto del cartel del horario (si la tienes).</li>
          <li>Tiempo aproximado de viaje punta vs valle.</li>
          <li>Tarifa pagada (con fecha).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Cada aporte se cita en el commit con el contribuyente como autor.
        </p>
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
