// Perímetro de Exclusión de Tomé — ficha INSTITUCIONAL / JURÍDICA del
// segundo perímetro metropolitano del Biobío.
//
// División editorial con `concepcion-tome.tsx`:
//   - Aquí vive el RÉGIMEN: decreto, marco legal, operador adjudicatario,
//     tarifa con polinomio, BusPay como sistema de recaudo, comparación
//     con el PE Gran Concepción 2024, sanciones / fiscalización DTPR.
//   - La OPERACIÓN del corredor (paraderos, trazado calle a calle,
//     frecuencias, integración intermodal observada, contexto industrial
//     y demanda) vive en `concepcion-tome.tsx`.
// Cualquier dato operacional aquí debe ser cross-link a esa ficha.
//
// Bien sostenido con fuente:
// - Decreto firmado por Andrés Gómez-Lobo en jul-2016, operación
//   efectiva 10-mar-2022 (BioBioChile, Wikipedia)
// - Tarifa de partida $750 adulto (BioBioChile 11-mar-2022)
// - Tarifas vigentes desde 23-feb-2025: $780 Concepción ↔ Tomé,
//   $830 Concepción ↔ Dichato (saneamiento round 2)
// - Operador único Transportes Tomé SpA, 71 buses declarados, servicios
//   401/411/421
// - Marco legal: art. 3° Ley 18.696 (mismo que el PE Gran Concepción)
// - Cobertura BusPay confirmada (Subtrans · 30-ene-2026)
//
// Pendiente (PendingBanner):
// - Número exacto del decreto MTT 2016 que crea el perímetro
// - Confirmación SII / RNTPP de "Transportes Tomé SpA" y RUT
// - Forma matemática del polinomio de ajuste tarifario
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

export default function PerimetroExclusionTome() {
  return (
    <div className="space-y-5 text-[14px] leading-relaxed">
      <VerifiedBanner>
        <strong>Verificado parcialmente con fuentes primarias y prensa
        regional.</strong> Existencia del régimen, decreto firmado por
        el ministro Andrés Gómez-Lobo en julio 2016, operación efectiva
        el 10-mar-2022, operador único Transportes Tomé, tarifa de
        partida $750 adulto y tarifas vigentes desde 23-feb-2025 ($780
        Concepción ↔ Tomé, $830 Concepción ↔ Dichato): todo con
        fuente. La operación cotidiana del corredor (trazado calle a
        calle, paraderos, frecuencias, refuerzos may-2025) vive en{' '}
        <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
          Concepción ↔ Tomé
        </a>
        . <strong>Pendientes</strong>: número exacto del decreto MTT
        2016, confirmación SII / RNTPP del tipo societario y RUT,
        forma matemática del polinomio de ajuste, plazo contractual
        del perímetro y eventuales sanciones DTPR publicadas.
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
          Este artículo describe el <em>régimen</em>: decreto, operador
          adjudicatario, tarifa, polinomio de ajuste, BusPay,
          comparación con su perímetro hermano. La <strong>operación
          cotidiana</strong> del corredor —trazado calle a calle,
          paraderos, frecuencias, refuerzos may-2025, contexto
          industrial de Bellavista Oveja Tomé, demanda y población—
          vive en{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          .
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
              <>
                Nov-2022: incorporación del servicio 421 (Av. Estadio,
                hora punta). May-2025: aumento +11% de salidas en hora
                punta tarde. El detalle operacional vive en{' '}
                <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
                  Concepción ↔ Tomé
                </a>
                .
              </>,
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
              'Solo como origen / destino: Terminal Manuel Rodríguez (Angol esquina Manuel Rodríguez). El régimen no aplica a la operación urbana de Concepción.',
            ],
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          <strong>Tramo solapado con el PE Gran Concepción:</strong> el
          eje Concepción ↔ Penco ↔ Lirquén es cubierto en paralelo por
          servicios urbanos del PE Gran Concepción (líneas 17M, 30B /
          30C / 30E, 31F, 57Y, 62H). Los pasajeros pueden elegir
          micro urbana ($580) o servicio del PE Tomé en ese tramo.
          El PE Tomé tiene exclusividad recién en{' '}
          <strong>Lirquén → Tomé → Dichato</strong>. Detalle de los
          servicios urbanos en{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          .
        </p>
        <Sources>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8111">
            BCN · Reportes comunales Tomé 2017
          </SourceLink>
          <SourceLink href="https://www.bcn.cl/siit/reportescomunales/comunas_v.html?anno=2017&idcom=8107">
            BCN · Reportes comunales Penco 2017
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
            ['Nombre comercial', 'Transportes Tomé'],
            [
              'Razón social formal',
              'Citada como "Transportes Tomé SpA" en el artículo BusPay; el tipo societario exacto (SpA / S.A. / Ltda.) y el RUT siguen pendientes de cotejo SII / RNTPP.',
            ],
            ['RUT', 'Pendiente.'],
            [
              'Origen societario',
              'Fusión de operadores históricos del corredor norte (Buses Costa Azul S.A. y otros) consolidados en 2022 para entrar al perímetro.',
            ],
            ['Representante legal y portavoz', 'Bernardo Montoya (declaraciones públicas may-2025).'],
            [
              'Flota declarada',
              '71 buses al cierre de 2024 (cifra citada en Wikipedia; sin verificación independiente del padrón DTPR). Composición de flota (marca, modelo, año, norma Euro) no publicada en fuente abierta.',
            ],
            [
              'Terminal en Concepción',
              'Angol esquina Manuel Rodríguez — NO es Terminal Camilo Henríquez ni Collao. Nodo OSM way 425356582 "Terminal de líneas a Tomé" (~36.8191° S, ~73.0620° O).',
            ],
            ['Sede operativa en Tomé', 'Tomé Alto (base de retorno de la 401). Sin confirmación de dirección comercial publicada.'],
            [
              'Servicios adjudicados',
              <>
                401, 411 y 421. Detalle operacional (códigos, paraderos,
                trazado, frecuencias, refuerzos may-2025) en{' '}
                <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
                  Concepción ↔ Tomé
                </a>
                .
              </>,
            ],
          ]}
        />
        <PendingBanner>
          <strong>Pendiente:</strong> razón social formal con tipo
          societario confirmado (SpA / S.A. / Ltda.), RUT, N° RNTPP,
          decreto de adjudicación con su número exacto y plazo del
          contrato. Vía de cierre: Ley de Transparencia a DTPR Biobío,
          consulta SII por nombre comercial o búsqueda del decreto en
          BCN.
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

      <Section title="Tarifa y polinomio de ajuste">
        <p>
          La tarifa adulto vigente del PE Tomé sigue el polinomio de
          ajuste heredado del régimen general MTT en el Biobío. La
          fijación inicial al inicio del perímetro fue una rebaja
          política (la "rebaja Gómez-Lobo"); los reajustes posteriores
          han seguido la fórmula.
        </p>
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
          <strong>mano de obra</strong>. El SEREMI Patricio Fierro lo
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
                <td className="px-3 py-2 font-medium">Tarifa adulto vigente</td>
                <td className="px-3 py-2">$780 (Tomé) / $830 (Dichato) desde 23-feb-2025</td>
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
                <td className="px-3 py-2">~95 servicios urbanos</td>
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
            BusPay
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

      <Section title="Tensión institucional con el Corredor MOP Ruta 150">
        <p>
          La Dirección General de Concesiones del MOP impulsa un{' '}
          <strong>corredor exclusivo de transporte público sobre la
          Ruta 150</strong> (Rotonda Bonilla ↔ Enlace Penco). El
          contrato MOP no llega hasta Tomé. Aquí lo que importa es la
          <strong> tensión regulatoria</strong>: dos regímenes
          distintos (MTT perímetro de exclusión vs. MOP concesión vial
          con vocación de transporte público) confluyen sobre la misma
          traza física sin que exista un instrumento que los coordine
          contractualmente. La municipalidad de Tomé pidió formalmente
          extender la inversión hasta Tomé (
          <SourceLink href="http://www.tomealdia.com/2025/11/tome-tambien-se-beneficara-con-proyecto.html">
            Tomé al día · 2025-11
          </SourceLink>
          ), petición no comprometida en el contrato MOP.
        </p>
        <p className="text-[12px] text-muted-foreground">
          Detalle técnico del corredor MOP (tramo, inversión, consorcio
          Electro Cointer II, calendario 2026-2032) en{' '}
          <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
            Corredores de Transporte Público MOP del Biobío
          </a>
          . Lectura modal del impacto en la operación cotidiana del
          corredor en{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          . Tensión con la extensión Biotrén a Penco / Lirquén en{' '}
          <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
            Biotrén · extensiones y proyectos
          </a>
          .
        </p>
        <Sources>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025 — Recepción ofertas Ruta 150
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Fiscalización y riesgo monopólico">
        <p>
          Como es un régimen de <strong>operador único</strong>, no hay
          competencia interna al perímetro. Esto genera un{' '}
          <strong>riesgo monopólico</strong> que no aplica al PE Gran
          Concepción (donde 35 empresas compiten dentro de un techo
          regulatorio común): si Transportes Tomé baja frecuencia o
          eleva quejas, el pasajero no tiene operador alternativo
          dentro del régimen. La compensación es la fiscalización del
          MTT / SEREMITT y la presión vecinal directa, que efectivamente
          se ejerció (la Unión Comunal de Juntas de Vecinos de Tomé
          gatilló el refuerzo de may-2025 en menos de 20 días desde la
          solicitud — detalle operacional en{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          ).
        </p>
        <div className="space-y-2">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Sanciones DTPR no publicadas
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              No hay registro público de multas o procesos
              sancionatorios DTPR Biobío contra Transportes Tomé bajo
              el perímetro. No significa que no existan: la DTPR no
              publica un ranking de cumplimiento desagregado del PE
              Tomé como sí existe en discusión para el PE Gran
              Concepción. Vía de cierre: Ley de Transparencia.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Refuerzos de temporada alta no contractuales
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              El régimen no exige al operador único una flota o
              frecuencia extra estival. Los servicios 411 a Dichato y
              Pingueral colapsan en enero-febrero y fines de semana
              largos sin que existan refuerzos documentados
              contractualmente.
            </p>
          </div>
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-[12px] font-medium text-amber-900 dark:text-amber-200">
              Transparencia tarifaria menor que PE Gran Concepción
            </div>
            <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
              La forma matemática del polinomio de ajuste y el detalle
              de descuentos TNE / adulto mayor no aparecen en fuente
              abierta. El PE Gran Concepción publica un detalle algo
              mayor del cálculo, no así el PE Tomé.
            </p>
          </div>
        </div>
        <Sources>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
            Diario Concepción · 7-may-2025 — Presión vecinal Unión Comunal Tomé
          </SourceLink>
        </Sources>
      </Section>

      <Section title="Hueco GTFS y cobertura del visor">
        <p>
          El operador del PE Tomé <strong>no publica feed GTFS</strong>{' '}
          y no está integrado al feed urbano de Subtrans / DTPR. El
          feed{' '}
          <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
            GTFS Gran Concepción
          </a>
          {' '}cubre solo los servicios urbanos del PE Gran Concepción
          que físicamente recorren el tramo Concepción ↔ Penco ↔
          Lirquén (17M, 30B / 30C / 30E, 31F, 57Y, 62H). Los servicios
          401 / 411 / 421 del PE Tomé operan en exclusiva el tramo
          Lirquén → Tomé → Dichato y no aparecen en el feed.
        </p>
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
        <p className="text-[12px] text-muted-foreground">
          Detalle de qué sí y qué no aparece en el visor para el
          corredor en{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          .
        </p>
      </Section>

      <Section title="Cronología institucional">
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
              date: '2016-2022',
              event: 'Etapa de fusión de operadores: las razones sociales históricas del corredor (Buses Costa Azul S.A. y otras) se consolidan en Transportes Tomé para entrar al perímetro como adjudicatario único. Negociación lenta — toma casi seis años desde el decreto hasta la operación.',
            },
            {
              date: '10-mar-2022',
              event: 'Perímetro de Exclusión de Tomé operativo. Tarifa Concepción ↔ Tomé cae a $750 adulto (rebaja de $150). Tarifa Concepción ↔ Dichato cae $200. Operador único: Transportes Tomé.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2022/03/11/rebajan-tarifa-de-buses-entre-tome-y-concepcion.shtml', label: 'BioBioChile · 11-mar-2022' },
            },
            {
              date: '1-ene-2024',
              event: 'Inicio del Perímetro de Exclusión del Gran Concepción 2024 (el perímetro "hermano"). El tramo Concepción ↔ Penco ↔ Lirquén queda cubierto en paralelo por ambos regímenes; Lirquén → Tomé → Dichato queda en exclusiva del PE Tomé.',
              source: { href: 'https://es.wikipedia.org/wiki/Per%C3%ADmetro_de_Exclusi%C3%B3n_del_Gran_Concepci%C3%B3n', label: 'Wikipedia' },
            },
            {
              date: '23-feb-2025',
              event: 'Reajuste tarifario polinómico ratificado por el SEREMI Patricio Fierro: $780 Concepción ↔ Tomé y $830 Concepción ↔ Dichato.',
              source: { href: 'https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/02/17/gran-concepcion-pasaje-de-transporte-publico-registrara-alza-de-20-desde-el-proximo-domingo.shtml', label: 'BioBioChile · 17-feb-2025' },
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
          ]}
        />
        <p className="text-[12px] text-muted-foreground">
          La cronología <strong>operacional</strong> del corredor
          (modificaciones de servicios, refuerzos de frecuencia,
          hitos urbanísticos e históricos como Bellavista Oveja Tomé
          y el 27F) vive en{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          .
        </p>
      </Section>

      <Section title="Vínculos con otros artículos">
        <ul className="ml-5 list-disc space-y-1.5 text-[13px]">
          <li>
            <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
              Concepción ↔ Tomé
            </a>{' '}
            — la operación del corredor: paraderos, trazado calle a
            calle, frecuencias, refuerzos may-2025, contexto industrial
            (Bellavista Oveja Tomé), estacionalidad turística,
            integración intermodal observada. Si quieres saber por
            dónde pasa la 401, mira ese artículo. Si quieres saber
            bajo qué decreto se ampara, este es el artículo correcto.
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
              BusPay
            </a>{' '}
            — el sistema de recaudo electrónico que entra en marcha
            blanca el Q3 2026 sobre la flota del PE Tomé. Cambia el
            cobro de efectivo a contactless sin alterar la tarifa.
          </li>
          <li>
            <a href="/wiki/corredores-transporte-publico-mop-biobio" className="underline underline-offset-2">
              Corredores de Transporte Público MOP del Biobío
            </a>{' '}
            — el corredor exclusivo Ruta 150 (Rotonda Bonilla ↔ Enlace
            Penco) que entra en servicio en 2032 y solapa parcialmente
            con la traza del PE Tomé.
          </li>
          <li>
            <a href="/wiki/gtfs-gran-concepcion" className="underline underline-offset-2">
              GTFS Gran Concepción
            </a>{' '}
            — el feed que cubre el corredor hasta Lirquén pero no
            incluye los servicios 401 / 411 / 421 del PE Tomé.
          </li>
          <li>
            <a href="/wiki/biotren-extensiones-proyectos" className="underline underline-offset-2">
              Biotrén · extensiones y proyectos
            </a>{' '}
            — el tren urbano que no llega a Tomé y cuya extensión a
            Penco / Lirquén compite políticamente con el
            corredor MOP Ruta 150.
          </li>
        </ul>
      </Section>

      <Section title="Datos institucionales pendientes">
        <ul className="ml-5 list-disc space-y-1 text-[13px]">
          <li>Número exacto y texto íntegro del decreto MTT 2016 que crea el perímetro (firmado por el ministro Gómez-Lobo).</li>
          <li>Confirmación SII del tipo societario formal de Transportes Tomé (¿SpA? ¿S.A.? ¿Ltda.?) y RUT.</li>
          <li>N° de inscripción en el Registro Nacional de Transporte Público de Pasajeros (RNTPP).</li>
          <li>Plazo del contrato del perímetro y condiciones de renovación.</li>
          <li>Tarifas TNE estudiante y adulto mayor con su descuento publicado.</li>
          <li>Forma matemática del polinomio de ajuste tarifario (coeficiente de cada variable).</li>
          <li>Razones sociales originales que se fusionaron en Transportes Tomé.</li>
          <li>Procesos sancionatorios DTPR Biobío bajo el perímetro (multas, suspensiones, requerimientos).</li>
          <li>Detalle contractual del despliegue BusPay sobre la flota de Transportes Tomé (cantidad de validadores, cronograma específico).</li>
        </ul>
        <p className="text-[12px] text-muted-foreground">
          Vía de cierre principal: <strong>solicitud por Ley de
          Transparencia</strong> a DTPR Biobío y al MTT por el
          expediente íntegro del PE Tomé. Vías complementarias:
          búsqueda en BCN Ley Chile por ministro y fecha, consulta
          SII por nombre comercial. Los pendientes operacionales
          (tabla horaria, composición de flota verificada, refuerzos
          de verano observados) viven en{' '}
          <a href="/wiki/concepcion-tome" className="underline underline-offset-2">
            Concepción ↔ Tomé
          </a>
          .
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
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/02/14/anuncian-alza-en-las-tarifas-del-transporte-publico-en-el-gran-concepcion-y-tome.html">
            Diario Concepción · 14-feb-2025 — Alza tarifaria Gran Concepción y Tomé
          </SourceLink>
          <SourceLink href="https://www.biobiochile.cl/noticias/nacional/region-del-bio-bio/2025/02/17/gran-concepcion-pasaje-de-transporte-publico-registrara-alza-de-20-desde-el-proximo-domingo.shtml">
            BioBioChile · 17-feb-2025 — Tarifas vigentes desde 23-feb-2025
          </SourceLink>
          <SourceLink href="https://www.diarioconcepcion.cl/ciudad/2025/05/07/concepcion-tome-anuncian-nuevos-servicios-de-transporte-y-mas-frecuencias-en-horas-punta.html">
            Diario Concepción · 7-may-2025 — Declaraciones Bernardo Montoya
          </SourceLink>
          <SourceLink href="https://concesiones.mop.gob.cl/hoy-se-recibieron-las-ofertas-tecnicas-y-economicas-para-proyecto-corredores-de-transporte-publico-en-ruta-150-y-autopista-concepcion-talcahuano-tramo-ii/">
            MOP Concesiones · 10-dic-2025 — Ofertas Ruta 150 + Conce-Talcahuano II
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
