// Perímetro de Exclusión de Tomé — segundo perímetro metropolitano del
// Biobío, paralelo conceptual al PE Gran Concepción 2024.
//
// Este artículo describe el RÉGIMEN. El corredor operacional
// Concepción ↔ Tomé (paraderos, trazado, horarios) vive en
// `concepcion-tome.tsx`. Aquí la pregunta es regulatoria: qué decreto
// crea el perímetro, qué comunas cubre, quién es el operador único,
// cómo se ajusta la tarifa, cómo entra BusPay y cómo se tensiona con
// el electrocorredor MOP Ruta 150.
//
// Bien sostenido con fuente:
// - Decreto firmado por Andrés Gómez-Lobo en jul-2016, operación
//   efectiva 10-mar-2022 (BioBioChile, Wikipedia)
// - Tarifa de partida $750 adulto (BioBioChile 11-mar-2022)
// - Operador único Transportes Tomé, 71 buses declarados, servicios
//   401/411/421, refuerzos +11% may-2025 (Diario Concepción may-2025)
// - Marco legal: art. 3° Ley 18.696 (mismo que el PE Gran Concepción)
// - Cobertura BusPay confirmada (Subtrans · 30-ene-2026)
// - Tensión con electrocorredor Ruta 150 (MOP Concesiones, dic-2025)
//
// Pendiente (PendingBanner):
// - Número exacto del decreto MTT 2016 que crea el perímetro
// - Razón social formal (¿SpA? ¿S.A.? ¿Ltda.?) y RUT de Transportes
//   Tomé. El artículo buspay cita "Transportes Tomé SpA" sin
//   fuente primaria — pendiente cotejo SII / RNTPP.
// - Forma matemática del polinomio de ajuste tarifario (tarifa 2026
//   vigente: $780 a Concepción, $830 a Dichato — confirmado).
// - Plazo del contrato del perímetro
// - Sanciones DTPR documentadas

import {
  KeyValueList,
  PendingBanner,
  Section,
  SourceLink,
  Sources,
  Timeline,
  VerifiedBanner,
} from './_components';
import { MapLink } from '@/wiki/map-link';

export default function PerimetroExclusionTome() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias y prensa
        regional.</strong> Existencia del régimen, decreto firmado por el
        ministro Andrés Gómez-Lobo en julio 2016, operación efectiva el
        10-mar-2022, operador único Transportes Tomé, servicios 401 /
        411 / 421, tarifa de partida $750 adulto, flota declarada de 71
        buses, refuerzos de may-2025 (+11% hora punta tarde) y
        cobertura BusPay confirmada: todo con fuente. Tarifas vigentes
        desde 23-feb-2025 ($780 Concepción ↔ Tomé, $830 Concepción ↔
        Dichato) también verificadas con prensa regional.{' '}
        <strong>Pendientes</strong>: número exacto del decreto MTT
        2016, razón social formal y RUT de Transportes Tomé, forma
        matemática del polinomio de ajuste, plazo contractual del
        perímetro y eventuales sanciones DTPR publicadas.
      </VerifiedBanner>

      <Section title="Qué es y por qué importa">
        <p>
          El <strong>Perímetro de Exclusión de Tomé</strong> es el
          régimen regulatorio bajo el cual operan, desde el{' '}
          <strong>10 de marzo de 2022</strong>, los servicios de
          transporte público mayor del corredor norte del Gran
          Concepción: <strong>Concepción ↔ Penco ↔ Lirquén ↔ Tomé ↔
          Dichato</strong>. Lo crea el Ministerio de Transportes y
          Telecomunicaciones (MTT) usando la facultad que entrega el{' '}
          <strong>artículo 3°</strong> del DFL N° 343 / Ley 18.696
          (régimen de subsidio al transporte mayor), el mismo
          instrumento legal que sostiene al{' '}
          <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
            Perímetro de Exclusión del Gran Concepción 2024
          </a>
          {' '}(
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN Ley Chile
          </SourceLink>
          ).
        </p>
        <p>
          Es el <strong>segundo perímetro</strong> metropolitano del
          Biobío: el decreto que lo crea es de <strong>julio 2016</strong>,
          firmado por el ministro <strong>Andrés Gómez-Lobo</strong>{' '}
          bajo el segundo gobierno de Michelle Bachelet, y precede al
          perímetro del Gran Concepción que recién se ejecutó el
          1-ene-2024. La hipótesis editorial es que el MTT lo
          mantuvo separado para no contaminar el calendario del
          régimen mayor — el corredor norte tenía un único operador
          consolidable y el MTT lo prefirió en pista aparte.
        </p>
        <p>
          Particularidad clave para el visor de{' '}
          <code className="font-mono">conce.patagua.dev</code>: bajo
          este régimen operan los servicios{' '}
          <MapLink route="401">401</MapLink>,{' '}
          <MapLink route="411">411</MapLink> y{' '}
          <MapLink route="421">421</MapLink>{' '}
          de Transportes Tomé, que <strong>no</strong> aparecen en el
          feed GTFS Gran Concepción porque el operador no publica feed
          propio (ver{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>
          ). El corredor operacional —paraderos, trazado, horarios,
          contexto industrial— vive en el artículo{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          . Aquí se describe el <em>régimen</em>.
        </p>
      </Section>

      <Section title="Marco legal y decreto">
        <p>
          El perímetro descansa en la misma habilitación legal que el
          PE Gran Concepción y el PE Coronel-Lota:
        </p>
        <KeyValueList
          items={[
            [
              'Habilitación legal',
              <>
                <strong>Artículo 3°</strong> del DFL N° 343 / Ley 18.696
                (Ministerio de Transportes y Telecomunicaciones — régimen de
                subsidio al transporte mayor). Permite al MTT definir un
                área geográfica y, dentro de ella, imponer "tarifas,
                estructuras tarifarias, programación vial, regularidad,
                frecuencia, antigüedad de los vehículos, requisitos
                tecnológicos o administrativos".
              </>,
            ],
            [
              'Decreto creación',
              'Julio 2016 · firmado por el ministro de Transportes y Telecomunicaciones Andrés Gómez-Lobo (segundo gobierno Bachelet). Número de resolución exacto pendiente de cotejo en BCN / transparencia MTT.',
            ],
            [
              'Operación efectiva',
              '10 de marzo de 2022 — casi seis años después del decreto. La demora se atribuye a la negociación con los operadores históricos del corredor para fusionarse en un solo adjudicatario.',
            ],
            [
              'Ámbito',
              'Servicios colectivos urbanos e interurbanos del corredor norte del Gran Concepción metropolitano: Concepción ↔ Penco ↔ Lirquén ↔ Tomé urbano ↔ Tomé Alto, con extensión a Dichato (localidad costera de la comuna de Tomé).',
            ],
            [
              'Tipo de régimen',
              'Operador único adjudicatario (Transportes Tomé) — a diferencia del PE Gran Concepción que mantiene 35 empresas en 36 unidades de negocio.',
            ],
            [
              'Plazo del contrato',
              'No publicado en fuente abierta — pendiente.',
            ],
            [
              'Modificaciones posteriores',
              'Nov-2022: incorporación del servicio 421 (Av. Estadio, hora punta). May-2025: aumento +11% de salidas en hora punta tarde y nueva inyección 06:20 desde sector Cementerio 2. Otras modificaciones no documentadas.',
            ],
          ]}
        />
        <PendingBanner>
          <strong>Número y texto íntegro del decreto MTT 2016 pendiente.</strong>{' '}
          La prensa cita la firma del ministro Gómez-Lobo en julio 2016
          pero no he recuperado la Resolución Exenta o Decreto Supremo
          numerado. Vía de cierre: búsqueda en BCN Ley Chile por
          ministro y fecha, o solicitud por Ley de Transparencia al MTT
          / DTPR Biobío.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 18.696 (art. 3° — base de los perímetros de exclusión)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml">
            BioBioChile · 11-mar-2022 — Puesta en operación del perímetro
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión Gran Concepción (sección Tomé)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Alcance geográfico">
        <p>
          El perímetro cubre <strong>dos comunas completas</strong> en
          la práctica operacional:
        </p>
        <KeyValueList
          items={[
            [
              'Tomé',
              '54.946 hab. (Censo 2017 INE). Comuna completa incluida vía servicios 401 / 411 / 421. Localidades cubiertas dentro de la comuna: Tomé urbano (centro y Tomé Alto), Bellavista, Dichato (balneario al norte), Coliumo, Cocholgüe, Pingueral, Rafael y Menque (estos últimos con frecuencia menor o transbordo informal).',
            ],
            [
              'Penco (zonas norte y centro)',
              '47.367 hab. (Censo 2017). Los servicios del perímetro atraviesan Penco centro y Lirquén (distrito censal de Penco con 11.544 hab.). El régimen aplica sobre el tramo en el sentido del corredor norte — no a la operación urbana local de Penco, que está dentro del PE Gran Concepción 2024.',
            ],
            [
              'Concepción (punta sur del corredor)',
              'Solo como origen / destino: Terminal Manuel Rodríguez (Angol esquina Manuel Rodríguez), Av. Chacabuco, Plaza Perú, Av. 21 de Mayo, Acceso Norte. El régimen no aplica a la operación urbana de Concepción.',
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          <strong>Tramo solapado con el PE Gran Concepción:</strong> el
          eje Concepción ↔ Penco ↔ Lirquén es cubierto en paralelo por
          servicios urbanos del PE Gran Concepción (líneas 17M, 30B /
          30C / 30E, 31F, 57Y, 62H). Los pasajeros pueden elegir
          micro urbana ($580) o servicio del PE Tomé (tarifa $750+) en
          ese tramo. El PE Tomé tiene exclusividad recién en{' '}
          <strong>Lirquén → Tomé → Dichato</strong>.
        </p>
        <Sources>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8111">
            BCN · Reportes comunales Tomé 2017
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8107">
            BCN · Reportes comunales Penco 2017
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Tom%C3%A9">
            Wikipedia · Tomé (Chile) — localidades de la comuna
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Operador único: Transportes Tomé">
        <p>
          El régimen adjudica el corredor a una <strong>sola empresa
          operadora</strong>, formada en 2022 por la fusión de los
          operadores históricos del corredor (Buses Costa Azul S.A. y
          otras pequeñas razones sociales que operaban antes del
          perímetro). Esto distingue al PE Tomé del PE Gran Concepción
          —35 empresas— y del PE Coronel-Lota —varios operadores
          locales—.
        </p>
        <KeyValueList
          items={[
            [
              'Nombre comercial',
              'Transportes Tomé',
            ],
            [
              'Razón social formal',
              'Pendiente verificación. El artículo BusPay 2026 cita "Transportes Tomé SpA"; el artículo Concepción ↔ Tomé lo deja con interrogación entre SpA / S.A. / Ltda. Cotejo SII / RNTPP requerido.',
            ],
            [
              'RUT',
              'Pendiente.',
            ],
            [
              'Origen societario',
              'Fusión de operadores históricos del corredor norte (Buses Costa Azul S.A. y otros) consolidados en 2022 para entrar al perímetro.',
            ],
            [
              'Representante legal y portavoz',
              'Bernardo Montoya (declaraciones públicas may-2025).',
            ],
            [
              'Flota declarada',
              '71 buses al cierre de 2024 (cifra citada en Wikipedia; sin verificación independiente del padrón DTPR). Composición de flota (marca, modelo, año, norma Euro) no publicada en fuente abierta.',
            ],
            [
              'Terminal en Concepción',
              'Angol esquina Manuel Rodríguez — NO es Terminal Camilo Henríquez ni Collao. Nodo OSM way 425356582 "Terminal de líneas a Tomé" (~36.8191° S, ~73.0620° O).',
            ],
            [
              'Sede operativa en Tomé',
              'Tomé Alto (base de retorno de la 401). Sin confirmación de dirección comercial publicada.',
            ],
            [
              'Conductores',
              'Número no publicado en fuente abierta.',
            ],
            [
              'Servicios operados',
              '401 (Concepción ↔ Tomé Alto) · 411 (Concepción ↔ Dichato) · 421 (Concepción ↔ Av. Estadio, hora punta — agregado nov-2022).',
            ],
          ]}
        />
        <PendingBanner>
          <strong>Pendiente:</strong> razón social formal con tipo
          societario (SpA / S.A. / Ltda.), RUT, N° RNTPP, decreto de
          adjudicación con su número exacto y plazo del contrato. Vía
          de cierre: Ley de Transparencia a DTPR Biobío, consulta SII
          por nombre comercial o búsqueda del decreto en BCN.
        </PendingBanner>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
            Diario Concepción · 7-may-2025 — Declaraciones Bernardo Montoya
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Transporte público Gran Concepción (flota Transportes Tomé)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Servicios 401, 411 y 421">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Código</th>
                <th className="px-3 py-2 font-medium">Origen — destino</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-mono font-medium">401</td>
                <td className="px-3 py-2">Concepción (T. Manuel Rodríguez) ↔ Tomé Alto</td>
                <td className="px-3 py-2 text-muted-foreground">Troncal</td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  ~64 paradas, ~82 min de viaje. Salida desde Concepción
                  por Av. Chacabuco (ida) y retorno por Av. Los Carrera.
                  Operativo desde el inicio del perímetro (mar-2022).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono font-medium">411</td>
                <td className="px-3 py-2">Concepción ↔ Dichato (vía Tomé)</td>
                <td className="px-3 py-2 text-muted-foreground">Variante extendida</td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  Continúa después de Tomé Alto hacia el balneario de
                  Dichato. En may-2025 se sumó una cuarta salida de
                  Dichato entre 06:00 y 07:00 con frecuencia cada 15 min.
                  Tarifa diferenciada (mayor que $750 — diferencial no
                  publicado).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono font-medium">421</td>
                <td className="px-3 py-2">Concepción ↔ Av. Estadio (Tomé urbano)</td>
                <td className="px-3 py-2 text-muted-foreground">Variante de hora punta</td>
                <td className="px-3 py-2 text-[12px] text-muted-foreground">
                  Agregada en <strong>noviembre 2022</strong>. Solo
                  opera en hora punta. Termina en Av. Estadio (no llega
                  a Tomé Alto).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <KeyValueList
          items={[
            [
              'Refuerzos may-2025',
              <>
                <strong>+11% de salidas Concepción → Tomé en hora punta
                tarde</strong> (16:00-21:00): 70 salidas en mayo 2025
                contra 63 previas. Frecuencia objetivo: cada 4 min entre
                16:00 y 16:30, y cada 3 min desde las 17:30. Además, se
                agregó una salida inyectada 06:20 desde sector Cementerio
                2 hacia Concepción (cubre Loma Larga y Villa El Mirador).
                El operador atribuyó el ajuste a presión de la Unión
                Comunal de Juntas de Vecinos de Tomé (presidente Gonzalo
                Reyes), resuelta en menos de 20 días.
              </>,
            ],
            [
              'Horarios oficiales',
              'Tabla horaria formal lun-vie / sáb / dom / festivos no publicada en fuente abierta. App Red Regional de Movilidad muestra horarios en tiempo real.',
            ],
            [
              'GTFS público',
              'NO publicado. Los servicios 401 / 411 / 421 no aparecen en el feed GTFS Gran Concepción porque el operador no publica feed propio.',
            ],
          ]}
        />
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
            Diario Concepción · 7-may-2025 — Refuerzo en hora punta
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/08/en-11-aumentaron-las-salidas-de-buses-desde-concepcion-hacia-tome-en-horario-punta.html">
            Diario Concepción · 8-may-2025 — Detalle del +11%
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2025/05/07/transporte-publico-refuerza-rutas-entre-tome-y-concepcion-con-mas-salidas-y-horarios-extendidos.html">
            TVU · 7-may-2025 — Refuerzo rutas Concepción ↔ Tomé
          </SourceLink>
          <SourceLink href="https://moovitapp.com/index/en/public_transit-line-401-Concepcion-3122-3753673-146991722-1">
            Moovit · Ruta 401 paradas y duración
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tarifa y ajuste">
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Categoría</th>
                <th className="px-3 py-2 font-medium">Tarifa de partida (10-mar-2022)</th>
                <th className="px-3 py-2 font-medium">Vigente desde 23-feb-2025</th>
                <th className="px-3 py-2 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 font-medium">Adulto Concepción ↔ Tomé</td>
                <td className="px-3 py-2 font-mono">$750</td>
                <td className="px-3 py-2 font-mono">$780</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Cayó $150 respecto al régimen previo de $900. Era el
                  argumento político central del perímetro (rebaja).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Adulto Concepción ↔ Dichato</td>
                <td className="px-3 py-2 font-mono">Diferencial superior</td>
                <td className="px-3 py-2 font-mono">$830</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Cayó $200 respecto al régimen previo. Diferencial de
                  $50 sobre la tarifa Tomé por kilometraje adicional.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Estudiante (TNE)</td>
                <td className="px-3 py-2 font-mono">No publicado</td>
                <td className="px-3 py-2 font-mono">No publicado</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Cobertura TNE estándar a nivel nacional (~33% del adulto).
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Adulto mayor (60+)</td>
                <td className="px-3 py-2 font-mono">No publicado</td>
                <td className="px-3 py-2 font-mono">No publicado</td>
                <td className="px-3 py-2 text-muted-foreground text-[12px]">
                  Beneficio descuento estándar (~50% del adulto).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px]">
          <strong>Polinomio de ajuste:</strong> el perímetro hereda la
          estructura tarifaria polinómica del régimen general MTT en
          el Biobío, que pondera el <strong>valor del diésel</strong>,
          el <strong>valor del neumático</strong>, el{' '}
          <strong>valor del bus</strong> y la{' '}
          <strong>mano de obra</strong>. El Seremi Patricio Fierro lo
          describió en prensa (feb-2025) como una fórmula que considera
          "diésel, dólar, IPC, entre otros factores". La forma
          matemática exacta no está publicada en fuente abierta.
        </p>
        <p className="text-[12px] text-muted-foreground">
          <strong>Reajuste 23-feb-2025:</strong> el SEREMI Patricio
          Fierro ratificó en prensa que el alza del Gran Concepción ($560
          → $580 adulto) tuvo correlato en el PE Tomé. Las tarifas vigentes
          a partir del 23-feb-2025 son <strong>$780 Concepción ↔ Tomé</strong>{' '}
          y <strong>$830 Concepción ↔ Dichato</strong>. La forma matemática
          del polinomio y el detalle de descuentos TNE / adulto mayor
          siguen pendientes en fuente abierta.
        </p>
        <Sources>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml">
            BioBioChile · 11-mar-2022 — Tarifa inicial $750 (rebaja de $150)
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/02/17/gran-concepcion-pasaje-de-transporte-publico-registrara-alza-de-20-desde-el-proximo-domingo.shtml">
            BioBioChile · 17-feb-2025 — Alza 23-feb-2025: Tomé-Concepción $780, Tomé-Dichato $830
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html">
            Diario Concepción · 14-feb-2025 — Alza en Gran Concepción y Tomé
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Comparación con PE Gran Concepción 2024">
        <p>
          El paralelo conceptual es directo: ambos perímetros descansan
          en el mismo artículo de ley, persiguen el mismo objetivo
          regulatorio y se ejecutan con instrumentos similares. Pero
          difieren fuerte en escala, en régimen de competencia y en
          fecha de ejecución.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-medium">Dimensión</th>
                <th className="px-3 py-2 font-medium">PE Tomé (este artículo)</th>
                <th className="px-3 py-2 font-medium">PE Gran Concepción 2024</th>
              </tr>
            </thead>
            <tbody className="divide-y align-top">
              <tr>
                <td className="px-3 py-2 font-medium">Decreto creación</td>
                <td className="px-3 py-2">Julio 2016 (Andrés Gómez-Lobo)</td>
                <td className="px-3 py-2">Res. Afecta N° 29/2023 visada Contraloría may-2023</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Operación efectiva</td>
                <td className="px-3 py-2">10-mar-2022</td>
                <td className="px-3 py-2">1-ene-2024 (último adherente 31-mar-2024)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Comunas cubiertas</td>
                <td className="px-3 py-2">Tomé (con Dichato) + tramo norte de Penco (con Lirquén)</td>
                <td className="px-3 py-2">Concepción, Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante, Penco, Hualqui (7)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">N° operadores</td>
                <td className="px-3 py-2"><strong>1</strong> (Transportes Tomé)</td>
                <td className="px-3 py-2"><strong>~35 empresas</strong></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">N° unidades de negocio</td>
                <td className="px-3 py-2"><strong>1</strong> (corredor integral)</td>
                <td className="px-3 py-2"><strong>36 UN</strong></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Régimen de competencia</td>
                <td className="px-3 py-2">Monopolio adjudicado (fusión de operadores previos)</td>
                <td className="px-3 py-2">Competencia entre UN bajo techo regulatorio común</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Tarifa adulto</td>
                <td className="px-3 py-2">$750 base (2022) · 2026 con polinomio aplicado (pendiente)</td>
                <td className="px-3 py-2">$580 desde 23-feb-2025</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Flota</td>
                <td className="px-3 py-2">71 buses declarados (2024)</td>
                <td className="px-3 py-2">~1.700 buses estimados en las 36 UN</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Servicios</td>
                <td className="px-3 py-2">401 / 411 / 421 (tres códigos)</td>
                <td className="px-3 py-2">~95 servicios urbanos (10A, 11, 12, 17M, 18, 22, 30B/C/E, 31F, 50YP, 57Y, 62H, 80, 81…)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">GTFS público</td>
                <td className="px-3 py-2">NO (operador no publica feed)</td>
                <td className="px-3 py-2">SÍ (feed oficial Subtrans / DTPR)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Pago electrónico inicial</td>
                <td className="px-3 py-2">100% efectivo (cambia con BusPay Q3 2026)</td>
                <td className="px-3 py-2">100% efectivo (cambia con BusPay Q3 2026)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Marco legal</td>
                <td className="px-3 py-2">Art. 3° Ley 18.696</td>
                <td className="px-3 py-2">Art. 3° Ley 18.696</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-muted-foreground">
          <strong>Conclusión:</strong> son perímetros distintos con el
          mismo paraguas legal. La diferencia operacional dominante es
          el <strong>régimen de competencia</strong> — operador único
          en Tomé contra ~35 empresas en el Gran Concepción — y la
          escala (un corredor único contra 7 comunas con red urbana
          completa).
        </p>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión Gran Concepción (comparación PE Tomé / PE Coronel-Lota)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Integración con BusPay (Q3 2026)">
        <p>
          El alcance de <strong>BusPay</strong> —sistema de recaudo
          electrónico licitado por el MTT y adjudicado el{' '}
          <strong>28-ene-2026</strong> al <strong>Consorcio Buspay</strong>{' '}
          (operador técnico <strong>Busmatick</strong>)— incluye al PE
          Tomé desde la marcha blanca, junto al PE Gran Concepción, el
          PE Coronel-Lota y la licitación 201 Santa Juana. Para Tomé
          este es un cambio importante: pasa de <strong>cobro 100% en
          efectivo</strong> al pago electrónico contactless por
          tarjeta bancaria, código QR y tarjeta dedicada (
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026
          </SourceLink>
          ). Ficha técnica completa en{' '}
          <a href="/wiki/buspay" className="underline underline-offset-2">
            BusPay 2026
          </a>
          .
        </p>
        <KeyValueList
          items={[
            ['Operador adjudicado', 'Consorcio Buspay (no confundir con la marca del sistema)'],
            ['Operador técnico', 'Busmatick (subcontratado por el Consorcio)'],
            ['Fecha adjudicación', '28 de enero de 2026'],
            ['Inicio instalación validadores', 'Abril-mayo 2026 (proyectado, alineado con PE Gran Concepción)'],
            ['Marcha blanca', 'Tercer trimestre 2026 — efectivo y tarjeta operan en paralelo'],
            ['Régimen 100% electrónico', 'Proyectado para fines de 2026'],
            ['Validador físico', 'Embarcado en cada bus de la flota de Transportes Tomé. Lee NFC contactless (tarjeta bancaria, tarjeta BusPay, TNE) y código QR.'],
            ['Medios de pago aceptados', 'Tarjeta bancaria contactless, código QR vía celular, TNE estudiantes, tarjeta dedicada BusPay con diseño Campanil UdeC elegido por consulta ciudadana.'],
            ['Tarifa', 'Sin alteración por la migración — el sistema lo paga el Estado al Consorcio, no el pasajero. La tarifa adulto vigente se mantiene bajo polinomio de ajuste regular.'],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          <strong>Significancia para Tomé:</strong> es un salto
          tecnológico que el corredor norte no había hecho antes (a
          diferencia de Santiago con Bip!, o de Antofagasta con
          Busmatick local). El operador único facilita la
          implementación frente a una red de 35 empresas como la del
          Gran Concepción.
        </p>
        <Sources>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 — Adjudicación al Consorcio Buspay
          </SourceLink>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026 — Cobertura BusPay incluye PE Tomé
          </SourceLink>
          <SourceLink href="https://www.subtrans.gob.cl/biobio-consulta-online-definira-primer-diseno-de-tarjeta-de-pago-electronico/">
            Subtrans · Consulta ciudadana diseño tarjeta Campanil UdeC
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Tensión con el Electrocorredor Ruta 150">
        <p>
          La Dirección General de Concesiones del MOP impulsa un{' '}
          <strong>corredor exclusivo de transporte público sobre la
          Ruta 150</strong>, parte del paquete de electrocorredores
          del Gran Concepción (los primeros fuera de Santiago). Genera
          una tensión modal clara con el PE Tomé:
        </p>
        <KeyValueList
          items={[
            [
              'Tramo del electrocorredor',
              'Rotonda Bonilla (Concepción) ↔ Enlace Penco — aprox. 6,7 a 8 km de pista bidireccional exclusiva',
            ],
            [
              'Inversión Ruta 150 + Autopista Conce-Talcahuano II',
              'UF 4.431.000 (~USD 172 millones)',
            ],
            [
              'Oferta única',
              'Consorcio Electro Cointer II (recepción de ofertas 10-dic-2025, apertura económica 15-ene-2026)',
            ],
            [
              'Adjudicación esperada',
              'Primer semestre 2026',
            ],
            [
              'Puesta en servicio',
              '2032 (obras 2029-2030, plazo de concesión 300 meses)',
            ],
            [
              'Flota del electrocorredor',
              'Buses eléctricos y diésel — SEREMI Patricio Fierro aclaró que el "electrocorredor" no implica flota 100% eléctrica. La hipótesis técnica es que los buses los aporten los operadores del PE Gran Concepción y, en el tramo Penco-Tomé, Transportes Tomé.',
            ],
          ]}
        />
        <p className="text-[12px]">
          <strong>El punto de tensión:</strong> el corredor MOP llega
          hasta el <strong>Enlace Penco</strong> y <em>no</em>{' '}
          continúa hasta Lirquén ni Tomé. La municipalidad de Tomé ha
          pedido públicamente extender la inversión más allá del
          Enlace Penco (
          <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
            Tomé al día · 2025-11
          </SourceLink>
          ), pero no está comprometido en el contrato MOP. El
          escenario probable al 2032 es de <strong>coexistencia con
          asimetría</strong>: los servicios 401 / 411 / 421 ganan
          tiempo en el tramo Rotonda Bonilla ↔ Enlace Penco (~8 km),
          pero el cuello de botella del tramo Penco ↔ Lirquén ↔ Tomé
          (~20 km de bypass urbano sin pista exclusiva) se mantiene.
        </p>
        <p className="text-[12px] text-muted-foreground">
          La extensión <strong>Biotrén a Penco / Lirquén</strong> lleva
          años en estudio EFE Sur. El alcalde de Penco Víctor Hugo
          Figueroa advirtió en nov-2022 que el corredor MOP Ruta 150
          puede <em>frenar</em> esa extensión al bajar la demanda
          potencial del tren (
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022
          </SourceLink>
          ). Ver{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            Electrocorredores MOP del Biobío
          </a>
          {' '}y{' '}
          <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">
            Biotrén y sus extensiones
          </a>
          .
        </p>
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025 — Recepción ofertas Ruta 150
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
            Diario Concepción · 7-nov-2025 — Electrocorredores Gran Concepción
          </SourceLink>
          <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
            Tomé al día · 2025-11 — Petición de extensión hasta Tomé
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Críticas y fiscalización">
        <p>
          Como es un régimen de <strong>operador único</strong>, no hay
          competencia interna al perímetro. Esto genera un{' '}
          <strong>riesgo monopólico</strong> que no aplica al PE Gran
          Concepción (donde 35 empresas compiten dentro de un techo
          regulatorio común): si Transportes Tomé baja frecuencia o
          eleva quejas, el pasajero no tiene operador alternativo
          dentro del régimen. La compensación es la fiscalización del
          MTT y la presión vecinal directa.
        </p>
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Frecuencias desfasadas pre-may 2025
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              Hasta abril 2025, el propio Bernardo Montoya (representante
              legal) reconoció en prensa que había "diferencias de 20 a
              21 minutos entre buses" en algunos cortes de la hora
              punta. El ajuste de mayo 2025 fue reactivo a la presión de
              la Unión Comunal de Juntas de Vecinos (presidente Gonzalo
              Reyes), resuelta en menos de 20 días.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Estacionalidad turística vs. capacidad regular
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              En enero-febrero y fines de semana largos, los servicios
              411 a Dichato / Pingueral colapsan. No hay refuerzo
              documentado contractualmente para temporada alta — el
              régimen no exige al operador único una flota o frecuencia
              extra estival.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Sanciones DTPR no publicadas
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              No tengo registro público de multas o procesos
              sancionatorios DTPR Biobío contra Transportes Tomé bajo
              el perímetro. No significa que no existan: la DTPR no
              publica un ranking de cumplimiento desagregado del PE
              Tomé como sí existe en discusión para el PE Gran
              Concepción. Vía de cierre: Ley de Transparencia.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Tarifa Dichato no publicada
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El servicio 411 a Dichato cobra una tarifa diferenciada
              (mayor que $750) pero el valor exacto no aparece en
              fuente abierta. La transparencia tarifaria del perímetro
              es menor que la del PE Gran Concepción.
            </p>
          </div>
        </div>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
            Diario Concepción · 7-may-2025 — Cita Montoya sobre desfase 20-21 min
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cobertura del visor">
        <p>
          Para los efectos del visor de{' '}
          <code className="font-mono">conce.patagua.dev</code>, el PE
          Tomé tiene un comportamiento mixto:
        </p>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Tramo Concepción ↔ Penco ↔ Lirquén — cubierto por el GTFS urbano
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            El feed GTFS Gran Concepción incluye los servicios urbanos
            del PE Gran Concepción que físicamente recorren el mismo
            corredor hasta Lirquén: 17M (Penco centro), 30B / 30C / 30E
            (Penco - Lirquén), 31F (Lirquén "Ruta del Mar"), 57Y
            (Cosmito), 62H (San Vicente ↔ Lirquén). Son servicios de
            otro régimen (PE Gran Concepción 2024, tarifa $580) que
            <em> físicamente</em> sirven el mismo tramo. Por eso el
            visor muestra cobertura del corredor norte aunque el feed
            no incluya específicamente los servicios del PE Tomé.
          </p>
        </div>
        <div className="rounded-md border bg-card p-3">
          <div className="text-[12px] font-medium">
            Tramo Lirquén ↔ Tomé ↔ Dichato — NO cubierto por el feed urbano
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Aquí termina la cobertura del GTFS urbano. Ningún servicio
            del PE Gran Concepción cruza Lirquén hacia el norte. Los
            servicios 401 / 411 / 421 del PE Tomé operan ese tramo en
            exclusiva, pero{' '}
            <strong>el operador no publica feed GTFS propio</strong> y
            tampoco está integrado al feed urbano de Subtrans / DTPR.
            Resultado: para el visor, el tramo Lirquén → Tomé →
            Dichato es un hueco de transporte público.
          </p>
          <p className="mt-2 text-[12px]">
            <MapLink route="401">Ver la 401 Tomé Alto en el mapa →</MapLink>{' '}
            (trazado nativo digitalizado desde OSM, no proveniente de
            GTFS).
          </p>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Por qué pasa esto: el feed GTFS Gran Concepción es producido
          y mantenido por Subtrans / DTPR Biobío con foco en el PE
          Gran Concepción 2024. El operador del PE Tomé no fue
          incluido en ese pipeline porque opera bajo otro perímetro y
          no entrega datos de horarios y trazados al MTT en formato
          GTFS. La marcha blanca BusPay Q3 2026 puede cambiar esta
          situación si el contrato del consorcio exige al operador
          publicar feed propio — no está confirmado en fuente abierta.
        </p>
        <Sources>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · PE Gran Concepción (líneas que llegan a Lirquén)
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Cronología">
        <Timeline
          items={[
            {
              date: '2014-2015',
              event: 'MTT inicia diseño del segundo perímetro de exclusión metropolitano del Biobío para regularizar el corredor norte que históricamente operaba bajo autorizaciones precarias.',
            },
            {
              date: 'Jul-2016',
              event: 'Ministro de Transportes y Telecomunicaciones Andrés Gómez-Lobo firma el decreto que crea el Perímetro de Exclusión de Tomé. Es el segundo perímetro del Biobío después del Gran Concepción 2002.',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '27-feb-2010',
              event: 'Antecedente: terremoto y tsunami destruyen ~80% de Dichato (18 fallecidos en la localidad). La reconstrucción y el alza en demanda de transporte durante la década siguiente presionan al MTT a estructurar el corredor.',
              source: { href: 'https://www.biobiochile.cl/noticias/2015/02/27/el-antes-y-despues-de-la-reconstruccion-de-dichato-a-cinco-anos-del-terremoto-y-tsunami.shtml', label: 'BioBioChile' },
            },
            {
              date: '2016-2022',
              event: 'Etapa de fusión de operadores: las razones sociales históricas del corredor (Buses Costa Azul S.A. y otras) se consolidan en Transportes Tomé para entrar al perímetro como adjudicatario único. Negociación lenta — toma casi seis años desde el decreto hasta la operación.',
            },
            {
              date: '10-mar-2022',
              event: 'Perímetro de Exclusión de Tomé operativo. Tarifa Concepción ↔ Tomé cae a $750 adulto (rebaja de $150). Tarifa Concepción ↔ Dichato cae $200. Operador único: Transportes Tomé. Demanda referencial: ~10.000 pasajeros/día. Servicios iniciales: 401 (Tomé Alto) y 411 (Dichato).',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml', label: 'BioBioChile · 11-mar-2022' },
            },
            {
              date: 'Nov-2022',
              event: 'Se incorpora el servicio 421 (Concepción ↔ Av. Estadio, Tomé urbano) en hora punta. Mismo mes, Diario Concepción abre el debate público sobre si el electrocorredor MOP Ruta 150 frenará la extensión Biotrén-Penco.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html', label: 'Diario Concepción' },
            },
            {
              date: '1-ene-2024',
              event: 'Inicio del Perímetro de Exclusión del Gran Concepción 2024 (el perímetro "hermano"). El tramo Concepción ↔ Penco ↔ Lirquén queda cubierto en paralelo por ambos regímenes; Lirquén → Tomé → Dichato queda en exclusiva del PE Tomé.',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '13-nov-2024',
              event: 'CGR visa las bases de licitación MOP de corredores de transporte público para Rutas 150 / 160 y Autopista Conce-Talcahuano.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html', label: 'Diario Concepción' },
            },
            {
              date: '14-feb-2025',
              event: 'Alza tarifaria anunciada para Gran Concepción y Tomé bajo el polinomio de ajuste regular. El valor exacto resultante en el PE Tomé no se ha recuperado en fuente primaria.',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html', label: 'Diario Concepción' },
            },
            {
              date: '7-may-2025',
              event: 'Se anuncia refuerzo en hora punta: 70 salidas tarde Concepción → Tomé (+11% respecto a las 63 previas), nueva inyección 06:20 desde Cementerio 2 hacia Concepción, cuarta salida desde Dichato cada 15 min entre 06:00 y 07:00. Decisión local de Transportes Tomé "evitando decisiones desde Santiago" (declaración Bernardo Montoya).',
              source: { href: 'https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html', label: 'Diario Concepción · 7-may-2025' },
            },
            {
              date: '10-dic-2025',
              event: 'MOP recibe la oferta única del consorcio Electro Cointer II para la concesión Ruta 150 + Conce-Talcahuano II (UF 4.431.000).',
              source: { href: 'https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/', label: 'MOP Concesiones' },
            },
            {
              date: '28-ene-2026',
              event: 'MTT adjudica BusPay al Consorcio Buspay (operador técnico Busmatick). La cobertura incluye al PE Tomé desde marcha blanca.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml', label: 'BioBioChile · 28-ene-2026' },
            },
            {
              date: 'Q3 2026 (proyectado)',
              event: 'Marcha blanca BusPay en PE Tomé: validadores embarcados en flota de Transportes Tomé. Efectivo y pago electrónico operan en paralelo. Régimen 100% electrónico proyectado para fines de 2026.',
            },
            {
              date: '2032 (proyectado)',
              event: 'Puesta en servicio del electrocorredor Ruta 150 (Rotonda Bonilla ↔ Enlace Penco). Posible coexistencia con asimetría: el corredor MOP no llega a Tomé, manteniendo el cuello de botella en el bypass urbano Penco-Tomé.',
            },
          ]}
        />
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>{' '}
            — la operación del corredor: paraderos, trazado calle a
            calle, contexto industrial (Bellavista Oveja Tomé),
            estacionalidad turística, integración con el Biotrén. Si
            quieres saber por dónde pasa la 401, mira ese artículo. Si
            quieres saber bajo qué decreto se ampara, este es el
            artículo correcto.
          </li>
          <li>
            <a href="/wiki/perimetro-exclusion-gran-concepcion-2024" className="underline underline-offset-2">
              Perímetro de Exclusión del Gran Concepción 2024
            </a>{' '}
            — el perímetro "hermano". Mismo marco legal (art. 3° Ley
            18.696), distinta escala (7 comunas, ~35 empresas, 36 UN,
            tarifa $580). La sección "Comparación con PE Gran
            Concepción 2024" de este artículo resume las diferencias.
          </li>
          <li>
            <a href="/wiki/buspay" className="underline underline-offset-2">
              BusPay 2026
            </a>{' '}
            — el sistema de recaudo electrónico que entra en marcha
            blanca el Q3 2026 sobre la flota del PE Tomé. Cambia el
            cobro de efectivo a contactless sin alterar la tarifa.
            Consorcio Buspay como adjudicatario y Busmatick como
            operador técnico.
          </li>
          <li>
            <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
              Electrocorredores MOP del Biobío
            </a>{' '}
            — el corredor exclusivo Ruta 150 (Rotonda Bonilla ↔ Enlace
            Penco) que entra en servicio en 2032 y solapa parcialmente
            con la traza del PE Tomé. La tensión modal con la
            extensión Biotrén-Penco también vive ahí.
          </li>
          <li>
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>{' '}
            — el feed que cubre el corredor hasta Lirquén pero no
            incluye los servicios 401 / 411 / 421 del PE Tomé. Si te
            preguntas por qué Tomé no aparece en el visor con datos
            GTFS, ese artículo lo explica.
          </li>
          <li>
            <a href="/wiki/biotren-extensiones" className="underline underline-offset-2">
              Biotrén y sus extensiones
            </a>{' '}
            — el tren urbano que no llega a Tomé y cuya extensión a
            Penco / Lirquén compite políticamente con el
            electrocorredor MOP Ruta 150.
          </li>
        </ul>
      </Section>

      <Section title="Datos pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Número exacto y texto íntegro del decreto MTT 2016 que crea el perímetro (firmado por el ministro Gómez-Lobo).</li>
          <li>Razón social formal de Transportes Tomé con tipo societario (¿SpA? ¿S.A.? ¿Ltda.?) y RUT.</li>
          <li>N° de inscripción en el Registro Nacional de Transporte Público de Pasajeros (RNTPP).</li>
          <li>Plazo del contrato del perímetro y condiciones de renovación.</li>
          <li>Tarifas TNE estudiante y adulto mayor con su descuento publicado (tarifa adulto 2026 confirmada: $780 a Concepción, $830 a Dichato).</li>
          <li>Forma matemática del polinomio de ajuste tarifario (coeficiente de cada variable).</li>
          <li>Tabla horaria oficial lun-vie / sáb / dom / festivos para 401, 411 y 421.</li>
          <li>Composición de flota (marca, modelo, año, norma Euro) verificada — la cifra de 71 buses requiere cotejo con padrón DTPR.</li>
          <li>Número de conductores y composición laboral del operador.</li>
          <li>Razones sociales originales que se fusionaron en Transportes Tomé.</li>
          <li>Procesos sancionatorios DTPR Biobío bajo el perímetro (multas, suspensiones, requerimientos).</li>
          <li>Reclamos OIRS / Subtrans documentados específicamente por el corredor norte.</li>
          <li>Detalle contractual del despliegue BusPay sobre la flota de Transportes Tomé (cantidad de validadores, cronograma específico).</li>
          <li>Refuerzos para temporada alta verano (¿hay flota o frecuencia extra contractual?).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía de cierre principal: <strong>solicitud por Ley de
          Transparencia</strong> a DTPR Biobío y al MTT por el
          expediente íntegro del PE Tomé. Vías complementarias:
          búsqueda en BCN Ley Chile por ministro y fecha, consulta
          SII por nombre comercial, foto del cartel tarifario en
          terminal Manuel Rodríguez o Tomé Alto.
        </p>
      </Section>

      <Section title="Bibliografía">
        <Sources>
          <SourceLink href="https://www.bcn.cl/leychile/navegar?idNorma=1005871">
            BCN · Ley 18.696 (art. 3° — base de los perímetros de exclusión)
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n">
            Wikipedia · Perímetro de Exclusión del Gran Concepción (sección PE Tomé)
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Transporte_p%C3%BAblico_en_el_Gran_Concepci%C3%B3n">
            Wikipedia · Transporte público en el Gran Concepción
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml">
            BioBioChile · 11-mar-2022 — Inicio del perímetro, tarifa $750
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
            Diario Concepción · 7-may-2025 — Refuerzo en hora punta (+11%)
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/08/en-11-aumentaron-las-salidas-de-buses-desde-concepcion-hacia-tome-en-horario-punta.html">
            Diario Concepción · 8-may-2025 — Detalle del +11%
          </SourceLink>
          <SourceLink href="https://www.tvu.cl/prensa/2025/05/07/transporte-publico-refuerza-rutas-entre-tome-y-concepcion-con-mas-salidas-y-horarios-extendidos.html">
            TVU · 7-may-2025 — Refuerzo de rutas Concepción ↔ Tomé
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html">
            Diario Concepción · 14-feb-2025 — Alza tarifaria Gran Concepción y Tomé
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2022/11/01/nuevo-corredor-vial-de-la-ruta-150-puede-frenar-llegada-de-biotren-a-penco.html">
            Diario Concepción · 1-nov-2022 — Corredor Ruta 150 vs. extensión Biotrén-Penco
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025 — Ofertas Ruta 150 + Conce-Talcahuano II
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/11/07/gran-concepcion-contara-con-mas-de-30-km-de-electrocorredores-los-primeros-fuera-de-santiago.html">
            Diario Concepción · 7-nov-2025 — Electrocorredores Gran Concepción
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2024/11/13/visan-licitaciones-para-convertir-rutas-160-150-y-autopista-concepcion-talcahuano-en-corredores-de-transporte-publico.html">
            Diario Concepción · 13-nov-2024 — Visa CGR a licitaciones MOP
          </SourceLink>
          <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
            Tomé al día · nov-2025 — Petición de extensión Ruta 150
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2026/01/28/gobierno-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion.shtml">
            BioBioChile · 28-ene-2026 — Adjudicación BusPay al Consorcio Buspay
          </SourceLink>
          <SourceLink href="https://www.subtrans.cl/mtt-adjudica-operacion-del-sistema-de-pago-electronico-en-micros-del-gran-concepcion/">
            Subtrans · 30-ene-2026 — Cobertura BusPay incluye PE Tomé
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8111">
            BCN · Reportes comunales Tomé 2017
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8107">
            BCN · Reportes comunales Penco 2017
          </SourceLink>
          <SourceLink href="https://es.wikipedia.org/wiki/Tom%C3%A9">
            Wikipedia · Tomé (Chile)
          </SourceLink>
          <SourceLink href="https://moovitapp.com/index/en/public_transit-line-401-Concepcion-3122-3753673-146991722-1">
            Moovit · Ruta 401 Tomé Alto
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Para contribuir">
        <p>
          Si tienes copia del decreto MTT 2016 que crea el perímetro,
          la razón social formal de Transportes Tomé, foto del cartel
          tarifario vigente en la terminal Manuel Rodríguez o en Tomé
          Alto, o cualquier dato que ayude a cerrar los pendientes —
          abre un pull request en{' '}
          <SourceLink href="https://github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/perimetro-exclusion-tome.tsx">
            github.com/marcorojasb/conce.patagua.dev/edit/main/src/wiki/articles/perimetro-exclusion-tome.tsx
          </SourceLink>
          . Toda contribución se cita en el commit con autoría.
        </p>
      </Section>
    </div>
  );
}
