// Ruta 201 / 201 AU · Concepción ↔ Santa Juana
//
// Artículo verificado con fuentes primarias (julio 2024 – enero 2026).
// Servicio inaugurado el 15-jul-2024 bajo la licitación DTPR ELC0007,
// primera del Biobío en más de 10 años.

import { KeyValueList, Section, SourceLink, Sources, Timeline, VerifiedBanner } from './_components';
import { MapLink } from '@/wiki/map-link';

export default function Ruta201SantaJuana() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Datos verificados con fuentes primarias.</strong> Licitación
        DTPR ELC0007, decreto MTT N°93/2023, comunicados oficiales y prensa
        regional 2023-2026. Algunos detalles operativos (tabla horaria
        completa, duración exacta del contrato) siguen pendientes — ver
        sección "Datos pendientes" al final.
      </VerifiedBanner>

      <Section title="Resumen ejecutivo">
        <p>
          Servicio de transporte público <strong>rural urbano subsidiado</strong> que conecta
          la comuna de Santa Juana con Concepción metropolitana. Operado por{' '}
          <strong>Sociedad de Transporte de Pasajeros Santa Juana SpA</strong>{' '}
          desde el 15 de julio de 2024 bajo la licitación{' '}
          <SourceLink href="https://dtpr.mtt.gob.cl/consultalicitaciones/webpage/ConsultaLicitaciones.aspx?id=5927">
            DTPR ELC0007
          </SourceLink>
          . Flota nueva de 23 buses Agrale MT9000 (Euro V), 17 estándar + 6 con
          accesibilidad universal. Tarifa adulto $1.000, gratis para adultos
          mayores y personas con discapacidad. Cubre a más de{' '}
          <SourceLink href="https://www.elconquistadorconcepcion.cl/2024/07/17/inauguran-nuevo-servicio-de-transporte-publico-que-conectara-concepcion-y-santa-juana-beneficiara-a-mas-de-14-mil-personas/">
            14 mil habitantes
          </SourceLink>
          .
        </p>
      </Section>

      <Section title="La licitación (DTPR ELC0007)">
        <KeyValueList
          items={[
            ['Nombre', 'Servicio de conectividad al transporte rural en la Comuna de Santa Juana'],
            ['ID licitación', 'ELC0007'],
            ['Publicación bases', 'Junio 2023'],
            ['Apertura ofertas', 'Agosto 2023 · 3 empresas postulantes'],
            ['Adjudicación', 'Decreto MTT N°93/2023 (5-dic-2023, publicado 5-ene-2024)'],
            ['Firma de contrato', '30 de enero de 2024'],
            ['Inicio operaciones', 'Lunes 15 de julio de 2024'],
            ['Ceremonia oficial', '19 de julio de 2024'],
            ['Inversión estatal', '~USD 4 millones (subsidio + flota)'],
            ['Contexto', 'Primera licitación de transporte público de la Región del Biobío en más de 10 años'],
          ]}
        />
        <Sources>
          <SourceLink href="https://dtpr.mtt.gob.cl/consultalicitaciones/webpage/ConsultaLicitaciones.aspx?id=5927">
            DTPR Consulta licitaciones — ELC0007
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/01/30/mtt-y-empresa-de-buses-firman-contrato-para-nuevo-servicio-santa-juana-concepcion.html">
            Diario Concepción 30-ene-2024 — Firma de contrato
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">
            DPR Biobío 22-jul-2024 — Inauguración + cifras de inversión
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Operador">
        <KeyValueList
          items={[
            ['Razón social', 'Sociedad de Transporte de Pasajeros Santa Juana SpA'],
            ['Nombre comercial', 'Transportes Santa Juana'],
            ['Sitio oficial', 'transportessantajuana.cl'],
            ['Redes', 'Instagram + Facebook @transportessantajuana'],
            ['Representante', 'Arturo Giusti (mencionado en ceremonia de firma)'],
            ['Notas', 'Sociedad nueva formada por inversionistas locales con experiencia previa en transporte'],
          ]}
        />
        <Sources>
          <SourceLink href="https://transportessantajuana.cl/">transportessantajuana.cl</SourceLink>
          <SourceLink href="https://www.instagram.com/transportessantajuana/">Instagram @transportessantajuana</SourceLink>
          <SourceLink href="https://www.gob.cl/noticias/nuevo-servicio-transporte-publico-santa-juana-concepcion-buses-caracteristicas-tarifas-rebajadas/">
            Gob.cl — Comunicado oficial
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Códigos de servicio">
        <div className="rounded-md border bg-card p-3">
          <p className="text-[13px]">
            Dos códigos en uso, mismo trazado, distinta accesibilidad:
          </p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <div className="rounded-sm border bg-background p-2">
              <div className="flex items-baseline gap-2">
                <span className="rounded bg-foreground px-1.5 py-0.5 font-mono text-[11px] text-background">
                  201
                </span>
                <span className="text-[13px] font-medium">Servicio estándar</span>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Buses estándar de la licitación, sin accesibilidad universal.
              </p>
            </div>
            <div className="rounded-sm border bg-background p-2">
              <div className="flex items-baseline gap-2">
                <span className="rounded bg-foreground px-1.5 py-0.5 font-mono text-[11px] text-background">
                  201 AU
                </span>
                <span className="text-[13px] font-medium">Accesibilidad Universal</span>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Piso bajo, rampa para silla de ruedas, espacio reservado.
                Estándar RED del MTT.
              </p>
            </div>
          </div>
        </div>
        <Sources>
          <SourceLink href="https://www.elconquistadorconcepcion.cl/2024/07/17/inauguran-nuevo-servicio-de-transporte-publico-que-conectara-concepcion-y-santa-juana-beneficiara-a-mas-de-14-mil-personas/">
            El Conquistador 17-jul-2024
          </SourceLink>
          <SourceLink href="https://www.facebook.com/61558500197393/posts/horarios-transportes-santa-juana-spa-pd-au-accesibilidad-universal/122129292698283339/">
            Facebook Transportes Santa Juana — Confirmación AU
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Trazado">
        <p>
          Trazado urbano-rural confirmado por comunicado MTT del 16-jul-2024.
          La ruta cruza el río Biobío por el <strong>Puente Juan Pablo II</strong>{' '}
          (no por el Puente Llacolén, como podría asumirse). Usa la{' '}
          <strong>Ruta de la Madera</strong> (Ruta 156) en el tramo
          Santa Juana – San Pedro de la Paz.
        </p>
        <p className="text-[12px]">
          <MapLink route="201">Ver la 201 en el mapa →</MapLink>
          {' · '}
          <MapLink terminal="osm-way-135488014">
            Estación Intermodal Concepción →
          </MapLink>
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Santa Juana → Concepción
          </div>
          <p className="mt-1 text-[12px] leading-snug">
            <strong>Santa Juana centro</strong> (Pedro de Valdivia / Irarrázaval /
            Yungay) → José Cardenio Avello → Lautaro → <strong>Ruta 156 (Ruta de
            la Madera)</strong> → San Pedro Viejo → Pedro Aguirre Cerda (San
            Pedro de la Paz) → <strong>Puente Juan Pablo II</strong> → Vega
            Monumental → Av. Manuel Rodríguez → Serrano → Bulnes → Castellón
          </p>
        </div>
        <p className="text-[12px] text-muted-foreground">
          <strong>Hitos intermedios destacados:</strong> Estación Biotrén Juan
          Pablo II (conexión con tren urbano), Vega Monumental, Av. Los Carrera,
          Estadio Ester Roa Rebolledo, Terminal de Buses Collao.
        </p>
        <p className="text-[12px] text-muted-foreground">
          <strong>Distancia aproximada:</strong> ~52 km. Tiempo de viaje
          referencial (operadores previos) ~1 h 15 min — el tiempo oficial del
          servicio licitado no está publicado.
        </p>
        <Sources>
          <SourceLink href="https://sabes.cl/2024/07/16/nuevo-transporte-publico-concepcion-santa-juana-esta-operativo-revisa-horarios-y-valores/">
            Sabes.cl 16-jul-2024 — Trazado calle por calle
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">
            DPR Biobío 22-jul-2024 — Hitos intermedios
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Horario y frecuencia">
        <KeyValueList
          items={[
            ['Salidas Santa Juana → Concepción', '05:30 a 23:45 hrs'],
            ['Salidas Concepción → Santa Juana', '06:45 a 23:20 hrs'],
            ['Frecuencia máxima', 'Hasta 10 buses/hora en hora punta (declaración ministro Juan Carlos Muñoz)'],
            ['Servicios diarios estimados', '> 80 (no publicado como cifra exacta)'],
            ['Sábado/domingo/festivos', 'Tabla horaria diferenciada — no publicada en fuente abierta'],
            ['Información en tiempo real', 'App Red Regional de Movilidad (buscar servicio "201")'],
          ]}
        />
        <Sources>
          <SourceLink href="https://sabes.cl/2024/07/16/nuevo-transporte-publico-concepcion-santa-juana-esta-operativo-revisa-horarios-y-valores/">
            Sabes.cl — Comunicado MTT con ventana operativa
          </SourceLink>
          <SourceLink href="https://www.gob.cl/noticias/nuevo-servicio-transporte-publico-santa-juana-concepcion-buses-caracteristicas-tarifas-rebajadas/">
            Gob.cl — Frecuencia y app Red Regional
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifas">
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Categoría</th>
                <th className="px-3 py-2 font-medium">Tarifa</th>
                <th className="px-3 py-2 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 font-medium">Adulto</td>
                <td className="px-3 py-2 font-mono">$1.000</td>
                <td className="px-3 py-2 text-muted-foreground">Antes con operador previo: $1.700</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Estudiante TNE</td>
                <td className="px-3 py-2 font-mono">$330</td>
                <td className="px-3 py-2 text-muted-foreground">33% de la tarifa adulto</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Adulto mayor (65+)</td>
                <td className="px-3 py-2 font-mono">Gratis</td>
                <td className="px-3 py-2 text-muted-foreground">Tarifa cero por reglamento</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Personas con discapacidad</td>
                <td className="px-3 py-2 font-mono">Gratis</td>
                <td className="px-3 py-2 text-muted-foreground">Sin distinción de edad</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Menores de 7 años</td>
                <td className="px-3 py-2 font-mono">Gratis</td>
                <td className="px-3 py-2 text-muted-foreground">Acompañados</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          El contrato incluye un <strong>mecanismo de ajuste tarifario</strong>{' '}
          que impide alzas injustificadas. Pago actual: <strong>efectivo</strong>{' '}
          a bordo. Compra anticipada disponible online en transportessantajuana.cl
          y kupos.cl.
        </p>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/07/10/con-tarifa-rebajada-nuevos-buses-entre-santa-juana-y-concepcion-inician-servicio-la-proxima-semana.html">
            Diario Concepción 10-jul-2024 — Tarifas y ajuste
          </SourceLink>
          <SourceLink href="https://www.gob.cl/noticias/nuevo-servicio-transporte-publico-santa-juana-concepcion-buses-caracteristicas-tarifas-rebajadas/">
            Gob.cl — Tabla tarifaria completa
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Flota">
        <KeyValueList
          items={[
            ['Cantidad', '23 buses nuevos'],
            ['Modelo', 'Agrale MT9000 — chasis brasileño/argentino, representado en Chile por Andes Motor'],
            ['Norma de emisiones', 'Euro V (diésel)'],
            ['Composición', '17 unidades estándar + 6 unidades estándar RED (piso bajo, rampa)'],
            ['Distinción regional', 'Primeros buses con estándar RED entregados en la Región del Biobío'],
            ['Equipamiento', 'GPS online, cámaras de seguridad, contadores de pasajeros, letrero LED frontal, WiFi gratuito, puertos USB, aire acondicionado'],
            ['Compromiso laboral', '8 conductoras mujeres (sobre el mínimo de 2 exigido en bases)'],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.andesmotor.cl/-/entregan-primeros-buses-con-estandar-red-para-la-region-del-biobio-conectaran-santa-juana-con-concepcion">
            Andes Motor — Entrega de flota
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/01/30/mtt-y-empresa-de-buses-firman-contrato-para-nuevo-servicio-santa-juana-concepcion.html">
            Diario Concepción 30-ene-2024 — Composición de flota
          </SourceLink>
          <SourceLink href="https://dprbiobio.dpr.gob.cl/2024/07/22/santa-juana-cuenta-con-nuevo-sistema-de-transporte-publico-licitado-y-renovada-flota-de-buses/">
            DPR Biobío — Equipamiento y compromiso laboral
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Pago electrónico — rollout 2026">
        <p>
          El servicio 201 será el <strong>primer servicio rural de Chile</strong>{' '}
          con pago electrónico integrado. Ficha completa del sistema en{' '}
          <a href="/wiki/buspay-2026" className="underline underline-offset-2">
            BusPay 2026
          </a>
          . Cronología:
        </p>
        <Timeline
          items={[
            {
              date: 'Sep 2025',
              event:
                'MTT recibe 6 ofertas para sistema de pago electrónico en 11 comunas del Gran Concepción + Santa Juana.',
              source: {
                href: 'https://www.diarioconcepcion.cl/ciudad/2025/09/23/gran-concepcion-avanza-hacia-el-pago-electronico-en-buses-mtt-recibe-seis-ofertas.html',
                label: 'Diario Concepción',
              },
            },
            {
              date: 'Ene 2026',
              event:
                'Adjudicación al Consorcio Buspay para operar el sistema.',
              source: {
                href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml',
                label: 'BioBioChile',
              },
            },
            {
              date: 'Abr-may 2026',
              event: 'Instalación de validadores en la flota.',
            },
            {
              date: 'Q3 2026',
              event: 'Marcha blanca con tarjeta y efectivo en paralelo.',
            },
            {
              date: 'Fin 2026',
              event: 'Pago 100% electrónico previsto.',
            },
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          Subtrans abrió consulta ciudadana para el diseño de la tarjeta entre
          tres opciones: puente ferroviario del Biobío, Coliseo La Tortuga,
          campus UdeC. El{' '}
          <strong>perímetro de exclusión del sistema incluye Gran Concepción +
          Santa Juana + Tomé</strong>.
        </p>
        <Sources>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans — Consulta diseño de tarjeta
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Línea de tiempo">
        <Timeline
          items={[
            { date: 'Jun 2023', event: 'Publicación de bases licitación ELC0007.' },
            { date: 'Ago 2023', event: 'Apertura de ofertas — 3 empresas postulantes.' },
            { date: 'Dic 2023', event: 'Adjudicación vía Decreto MTT N°93/2023.' },
            { date: 'Ene 2024', event: 'Firma de contrato con ministro Juan Carlos Muñoz.' },
            { date: 'Jul 2024', event: 'Inicio de operaciones (lunes 15). Ceremonia oficial 19.' },
            { date: 'Sep 2024', event: 'Quejas por espacio entre asientos — SEREMI confirma incumplimiento.' },
            { date: 'Sep 2025', event: 'MTT recibe ofertas para pago electrónico.' },
            { date: 'Ene 2026', event: 'Adjudicación pago electrónico a Consorcio Buspay.' },
          ]}
        />
      </Section>

      <Section title="Issues y críticas">
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
          <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
            Septiembre 2024 · Espacio entre filas de asientos
          </div>
          <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
            La SEREMI de Transportes confirmó que la distancia entre filas de
            asientos en la flota nueva no cumplía con lo licitado. El operador
            se comprometió a <strong>eliminar una fila de asientos</strong> en
            cada bus para corregir la separación. Estado del cumplimiento de
            ese compromiso: no verificado en fuentes recientes.
          </p>
          <Sources>
            <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/09/24/buses-a-santa-juana-todavia-no-se-corrige-la-poca-distancia-entre-asientos-para-pasajeros.html">
              Diario Concepción 24-sep-2024
            </SourceLink>
          </Sources>
        </div>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Tabla horaria detallada sábado / domingo / festivos.</li>
          <li>Tiempo oficial de viaje publicado por DTPR.</li>
          <li>Cantidad exacta de servicios diarios.</li>
          <li>Duración exacta del contrato de concesión (decreto N°93/2023 íntegro).</li>
          <li>RUT de Sociedad de Transporte de Pasajeros Santa Juana SpA.</li>
          <li>Tracking del cumplimiento del compromiso de espacio entre asientos.</li>
          <li>GTFS público del servicio — al publicarse, se incorpora al visor principal.</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Para cerrar estos huecos: solicitar Decreto N°93/2023 al Diario
          Oficial y consultar a DTPR Biobío por la disponibilidad del feed
          GTFS del servicio.
        </p>
      </Section>

      <Section title="Para contribuir">
        <p>
          Foto del cartel del horario en paradero o terminal, observación de
          tiempo de viaje real, tarifa pagada con fecha — todo aporte se cita
          en el commit con el contribuyente como autor. Abre un pull request
          en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/ruta-201-santa-juana.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/ruta-201-santa-juana.tsx
          </SourceLink>
          .
        </p>
      </Section>
    </div>
  );
}

// Componentes compartidos viven ahora en ./_components — el 201, el
// corredor de El Pimentón y Concepción↔Florida consumen la misma API.
