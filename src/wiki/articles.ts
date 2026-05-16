// Wiki article registry. Articles are lazy-loaded components so the
// wiki bundle stays small until the user navigates to one.

import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export interface ArticleMeta {
  slug: string;
  title: string;
  summary: string;
  /** Section grouping in the index — keeps related articles together. */
  section: 'estructural' | 'interurbanos' | 'urbanos' | 'fuentes' | 'metodologia';
  /** Last edited date for the "actualizado" hint in the article header. */
  updated: string;
  /** Lazy-load the article body. */
  Component: LazyExoticComponent<ComponentType>;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: 'seremitt-dtpr-biobio',
    title: 'SEREMITT Biobío y la DTPR',
    summary:
      'Ficha institucional de la autoridad regional de transportes. SEREMITT Biobío (instancia política, encabezada por el SEREMI Patricio Fierro desde 10-ene-2025, sucesor de Héctor Silva) y DTPR Biobío (brazo técnico de la Subsecretaría de Transportes, opera dprbiobio.dpr.gob.cl). Diferencia con DTPM (Santiago) y 3CV. Marco legal: DFL 343, Leyes 18.059, 18.696, 20.378, 19.880, 20.285. Cartera regional 2024-2026: PE Gran Concepción, PE Tomé, PE Coronel-Lota, ELC0007 Santa Juana, BusPay, Electrocorredores MOP, subsidios Florida. Es el "marco institucional" detrás de cada artículo del wiki.',
    section: 'estructural',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/seremitt-dtpr-biobio')),
  },
  {
    slug: 'perimetro-exclusion-gran-concepcion-2024',
    title: 'Perímetro de Exclusión del Gran Concepción 2024',
    summary:
      'Régimen tarifario y operativo bajo el cual operan, desde el 1-ene-2024, todos los buses urbanos del Gran Concepción (7 comunas, 36 unidades de negocio, 35 empresas). Reemplaza la licitación 2002 caducada el 31-mar-2024. Tarifa $580 adulto (vigente 23-feb-2025), polinomio de ajuste, contrato hasta 31-dic-2028. BusPay adjudicado a Consorcio Buspay en ene-2026, marcha blanca Q3 2026. Columna vertebral conceptual del visor urbano.',
    section: 'estructural',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/perimetro-exclusion-gran-concepcion-2024')),
  },
  {
    slug: 'perimetro-exclusion-tome',
    title: 'Perímetro de Exclusión de Tomé',
    summary:
      'Segundo perímetro de exclusión metropolitano del Biobío (decreto MTT jul-2016 firmado por Andrés Gómez-Lobo, operativo 10-mar-2022). Régimen de operador único bajo art. 3° Ley 18.696: Transportes Tomé corre los servicios 401 / 411 / 421 desde Concepción hacia Penco, Lirquén, Tomé y Dichato con 71 buses declarados. Tarifa de partida $750 adulto (rebaja de $150 vs régimen previo). Refuerzos may-2025 +11% hora punta tarde. Integración BusPay desde Q3 2026. Tensión con el electrocorredor MOP Ruta 150 que solo llega hasta Enlace Penco. Los servicios 401/411/421 no están en el feed GTFS Gran Concepción.',
    section: 'estructural',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/perimetro-exclusion-tome')),
  },
  {
    slug: 'buspay-2026',
    title: 'BusPay · pago electrónico del Gran Concepción 2026',
    summary:
      'Sistema de recaudo electrónico adjudicado al Consorcio Buspay (operador técnico Busmatick) el 28-ene-2026 por el MTT. ~$750 millones/año, 1.800-2.000 validadores, 11 comunas (PE Gran Concepción + PE Tomé + PE Coronel-Lota + licitación 201 Santa Juana). Marcha blanca Q3 2026, régimen 100% electrónico proyectado fin de 2026. Tarifa $580 sin alteración, tarjeta Campanil UdeC elegida por consulta ciudadana. Cierra una deuda de casi 20 años desde el piloto Biobús 2016 fallido.',
    section: 'estructural',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/buspay-2026')),
  },
  {
    slug: 'electrocorredores-mop-biobio',
    title: 'Electrocorredores MOP del Biobío',
    summary:
      'Tres concesiones MOP de corredores exclusivos para buses urbanos sobre las troncales del Gran Concepción (Ruta 160 San Pedro-Coronel, Ruta 150 Concepción-Penco y Autopista Concepción-Talcahuano Tramo II). ~USD 250 millones, 23+ km, plazo 25 años (300 meses). Oferente único en los dos llamados (Electro-Cointer y Electro-Cointer II, ligados a Cointer Concesiones S.L. / Grupo Azvi). CGR visó bases 13-nov-2024; ofertas recibidas nov-dic 2025; adjudicación 1S 2026; obras 2029-2030; puesta en servicio 2031-2032. Tensión política con extensiones del Biotrén a Penco, Lota y Carriel Sur.',
    section: 'estructural',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/electrocorredores-mop-biobio')),
  },
  {
    slug: 'recorridos-interurbanos',
    title: 'Recorridos interurbanos del Gran Concepción',
    summary:
      'Servicios licitados que conectan Concepción metropolitana con Santa Juana, Tomé, Florida, Yumbel y otras comunas rurales del Biobío. No están en el GTFS urbano del visor.',
    section: 'interurbanos',
    updated: '2026-05-15',
    Component: lazy(() => import('./articles/recorridos-interurbanos')),
  },
  {
    slug: 'ruta-201-santa-juana',
    title: 'Ruta 201 y 201 AU · Concepción ↔ Santa Juana',
    summary:
      'Servicio licitado bajo DTPR ELC0007, operado por Sociedad de Transporte de Pasajeros Santa Juana SpA desde julio 2024. 23 buses Agrale Euro V, tarifa $1.000, accesibilidad universal en 6 unidades. Primera licitación del Biobío en 10+ años.',
    section: 'interurbanos',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/ruta-201-santa-juana')),
  },
  {
    slug: 'corredor-el-pimenton',
    title: 'Corredor interurbano por El Pimentón',
    summary:
      'Panorama del corredor sur-oriente que cruza la Cordillera de la Costa entre Concepción y la zona de Florida / Yumbel / Hualqui rural. Cuatro operadores privados, 40 buses combinados, regulación fragmentada y una capa de servicios subsidiados nueva en 2025.',
    section: 'interurbanos',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/corredor-el-pimenton')),
  },
  {
    slug: 'concepcion-florida',
    title: 'Concepción ↔ Florida · servicio troncal',
    summary:
      'Cuatro operadores privados (Delsal, Nueva Libertadores, Biocosta, Trinidad) en la troncal, más capas subsidiadas nuevas (zona norte oct-2025, Rahuil, Poñén-Roa, nocturno) que el MTT sumó desde 2025 sin licitar todavía el reemplazo del troncal.',
    section: 'interurbanos',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/concepcion-florida')),
  },
  {
    slug: 'concepcion-tome',
    title: 'Concepción ↔ Tomé · corredor norte',
    summary:
      'Segundo perímetro de exclusión metropolitano (decreto MTT jul-2016, operativo mar-2022) con operador único Transportes Tomé y servicios 401/411/421. Tarifa $750 al inicio, 71 buses, refuerzos may-2025 (+11% punta tarde). El tramo Concepción↔Penco↔Lirquén sí está en el GTFS urbano; Lirquén↔Tomé↔Dichato no. Electrocorredor MOP Ruta 150 (USD 172M) en licitación; puesta en servicio 2032.',
    section: 'interurbanos',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/concepcion-tome')),
  },
  {
    slug: 'concepcion-yumbel',
    title: 'Concepción ↔ Yumbel · corredor del valle central',
    summary:
      'Corredor privado puro (sin licitación DTPR ni perímetro de exclusión) por la Ruta 146 "Autopista Valles del Biobío" (concesión Sacyr, decreto MOP 179/2013). Cuatro operadores interurbanos (Línea Azul, Buses Bío Bío, Pullman Bus, Pullman Santa María) con frecuencias 30-60 min, tarifa $2.000-$3.500. Eje turístico-religioso: Fiesta de San Sebastián de Yumbel 20-ene y 20-mar mueve 250-350 mil peregrinos por jornada. Sin GTFS y fuera del perímetro Buspay 2026.',
    section: 'interurbanos',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/concepcion-yumbel')),
  },
  {
    slug: 'concepcion-coronel-lota',
    title: 'Concepción ↔ Coronel ↔ Lota · corredor sur',
    summary:
      'Espina dorsal sur del Gran Concepción por la Ruta 160 ("Camino a Lota"). Régimen especial bajo Resolución Exenta 457 MTT (2012-2013, "aproximada a un PE") sin operador único ni polinomio público — el PE Coronel-Lota formal está en bases en Contraloría desde jul-2025, proyecta 80 buses nuevos. Operadores parciales identificados (Las Galaxias, Buses J. Ewert). BusPay (Consorcio Buspay) cubre Coronel y Lota desde Q3 2026. Coexiste con la Línea 2 del Biotrén (Concepción-Coronel, 2009) y con el electrocorredor MOP Ruta 160 (UF 4.414.000, Electro-Cointer oferta única 5-nov-2025, puesta en servicio 2031-2032). Corredor más conflictivo del Biobío por la transición post-carbón (Enacar 14-abr-1997) y tarifa históricamente disputada.',
    section: 'interurbanos',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/concepcion-coronel-lota')),
  },
  {
    slug: 'biotren-extensiones',
    title: 'Biotrén y sus extensiones',
    summary:
      'Tren urbano del Gran Concepción operado por EFE Trenes Metropolitanos. Línea 1 Hualqui ↔ Mercado de Talcahuano (12 estaciones) y Línea 2 Coronel ↔ Concepción (14 estaciones), trazado y estaciones digitalizados desde OSM. Único tren urbano de Chile fuera de Santiago. Extensiones discutidas a Penco, Tomé, Lota y Carriel Sur — y la tensión con el electrocorredor MOP Ruta 150 que se licita en paralelo.',
    section: 'urbanos',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/biotren-extensiones')),
  },
  {
    slug: 'gtfs-gran-concepcion',
    title: 'GTFS Gran Concepción',
    summary:
      'Ficha metodológica del feed GTFS estático que alimenta el visor urbano. Publicado en el Portal de Datos Abiertos del Estado (datos.gob.cl) bajo gestión de la Subsecretaría de Transportes / DTPR Biobío, cubre los buses urbanos del Perímetro de Exclusión del Gran Concepción 2024 (7 comunas, 36 unidades, 35 empresas). Documenta qué cubre el feed y qué no (Tomé, Santa Juana, Florida, Yumbel, Biotrén quedan afuera), la estructura del ZIP, el pipeline de procesamiento del visor (scripts/generate-gtfs-concepcion.ts + simplificación RDP), licencia, limitaciones y comparación con otros feeds chilenos.',
    section: 'fuentes',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/gtfs-gran-concepcion')),
  },
  {
    slug: 'sobre-este-wiki',
    title: 'Sobre este wiki',
    summary:
      'Qué es, qué no es, cómo contribuir y la visión de mediano plazo: convertirse en el centro de verdad regional del transporte y la planificación urbana del Biobío.',
    section: 'metodologia',
    updated: '2026-05-15',
    Component: lazy(() => import('./articles/sobre-este-wiki')),
  },
];

export function findArticle(slug: string): ArticleMeta | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export const SECTION_LABELS: Record<ArticleMeta['section'], string> = {
  estructural: 'Régimen estructural',
  interurbanos: 'Recorridos interurbanos',
  urbanos: 'Modos urbanos',
  fuentes: 'Fuentes y datos',
  metodologia: 'Sobre este wiki',
};
