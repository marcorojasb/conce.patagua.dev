// Sobre este wiki — propósito, alcance, modelo editorial y la visión
// de mediano plazo (centro de verdad regional).

import { Section } from './_components';

export default function SobreEsteWiki() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <Section title="Propósito">
        <p>
          El visor principal de <code className="font-mono">conce.patagua.dev</code> es
          un producto técnico que consume fuentes <strong>verificables</strong>
          {' '}— <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">GTFS estático</a>,
          OpenStreetMap, INE, SINCA. Si un dato no puede
          citarse a un origen abierto, no entra al visor.
        </p>
        <p>
          Pero hay una cantidad enorme de información operativa que <em>no</em>
          {' '}vive en ningún feed: itinerarios de servicios interurbanos
          licitados que aún no tienen GTFS público, frecuencias observadas en
          paradero, tarifas vigentes, decisiones del concejo municipal sobre
          ciclovías, planes reguladores en consulta. Este wiki es donde esa
          información se compila, cita y mantiene — sin contaminar el visor
          técnico.
        </p>
      </Section>

      <Section title="Qué este wiki no es">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong>No es oficial.</strong> No representa al DTPR, a la
            Subsecretaría de Transportes, a operadores ni a municipios. Es
            comunitario.
          </li>
          <li>
            <strong>No reemplaza el horario impreso.</strong> Para decisiones
            de viaje en tiempo real, consulta la fuente directa.
          </li>
          <li>
            <strong>No publica rumores.</strong> Cada afirmación debe citar
            una fuente; las afirmaciones sin fuente se marcan explícitamente
            como "pendiente de verificación".
          </li>
        </ul>
      </Section>

      <Section title="Cómo funciona">
        <p>
          Los artículos viven como componentes React en{' '}
          <code className="font-mono">src/wiki/articles/</code> del repositorio.
          Editar es abrir un pull request en GitHub — cada artículo tiene un
          link "Editar en GitHub" arriba que apunta al archivo correcto.
        </p>
        <p>
          La revisión es liviana: dos pares de ojos, un commit con autor
          claro. Si el cambio introduce una afirmación factual, debe venir
          con su fuente al lado.
        </p>
      </Section>

      <Section title="Visión de mediano plazo">
        <p>
          A futuro queremos que este wiki sea el{' '}
          <strong>centro de verdad regional</strong> sobre transporte público
          y planificación urbana del Gran Concepción y, por extensión, del
          Biobío. Conectado a:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>El visor (capas que enlazan a su artículo cuando existe).</li>
          <li>Wikidata (entidades con QID, datos estructurados).</li>
          <li>OpenStreetMap (tags route= / operator= verificadas).</li>
          <li>Notebooks de análisis (cuando aparezcan).</li>
        </ul>
        <p>
          La idea no es competir con Wikipedia — es servir como{' '}
          <strong>knowledge base operacional</strong> de un dominio que
          Wikipedia no cubre con la profundidad ni la frescura necesaria.
        </p>
      </Section>

      <Section title="Licencia">
        <p>
          Contenido del wiki bajo <strong>CC&nbsp;BY&nbsp;4.0</strong>. Código
          del visor y del wiki bajo licencia abierta del repo.{' '}
          <a
            href="https://github.com/marcorojasb/conce.patagua.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            github.com/marcorojasb/conce.patagua.dev
          </a>
        </p>
      </Section>
    </div>
  );
}
