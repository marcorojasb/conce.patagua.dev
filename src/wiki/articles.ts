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
      'Quién decide el transporte público en el Biobío: qué hace la SEREMITT, qué hace la DTPR y por qué casi toda resolución, licitación y subsidio del wiki pasa por una de las dos.',
    section: 'estructural',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/seremitt-dtpr-biobio')),
  },
  {
    slug: 'perimetro-exclusion-gran-concepcion-2024',
    title: 'Perímetro de Exclusión del Gran Concepción 2024',
    summary:
      'El régimen bajo el que operan las micros urbanas de 7 comunas desde 2024: tarifa, contrato y pago electrónico. Explica qué líneas trae el GTFS oficial.',
    section: 'estructural',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/perimetro-exclusion-gran-concepcion-2024')),
  },
  {
    slug: 'perimetro-exclusion-tome',
    title: 'Perímetro de Exclusión de Tomé',
    summary:
      'El segundo perímetro de exclusión del Biobío: un solo operador para los servicios 401, 401Y, 411 y 421 entre Concepción y Tomé, con sus tarifas y su pago electrónico.',
    section: 'estructural',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/perimetro-exclusion-tome')),
  },
  {
    slug: 'buspay',
    title: 'BusPay · pago electrónico del Gran Concepción',
    summary:
      'Cómo funcionará el pago electrónico en las micros del Gran Concepción: medios de pago, fechas de la marcha blanca, costo de la tarjeta y qué comunas cubre.',
    section: 'estructural',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/buspay')),
  },
  {
    slug: 'corredores-transporte-publico-mop-biobio',
    title: 'Corredores de Transporte Público MOP del Biobío',
    summary:
      'Los tres corredores exclusivos para buses que el MOP quiere construir en el Gran Concepción: qué son, por qué quedaron congelados y qué se sabe de los plazos.',
    section: 'estructural',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/corredores-transporte-publico-mop-biobio')),
  },
  {
    slug: 'subsidio-ley-20378',
    title: 'Subsidio Nacional al Transporte Público (Ley 20.378)',
    summary:
      'La ley que financia el transporte público fuera de Santiago y qué paga en el Gran Concepción: perímetros, la Ruta 201 y los servicios subsidiados de Florida.',
    section: 'estructural',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/subsidio-ley-20378')),
  },
  {
    slug: 'recorridos-interurbanos',
    title: 'Recorridos interurbanos del Gran Concepción',
    summary:
      'Qué servicios interurbanos muestra el visor (201, 401, 411, 421, 302 y 304), con qué datos, y por qué Florida y Yumbel aparecen solo como un pin.',
    section: 'interurbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/recorridos-interurbanos')),
  },
  {
    slug: 'ruta-201-santa-juana',
    title: 'Ruta 201 y 201 AU · Concepción ↔ Santa Juana',
    summary:
      'El servicio rural subsidiado entre Santa Juana y Concepción: quién lo opera, cuánto cuesta, cómo se ve en el visor y qué falta para el pago electrónico.',
    section: 'interurbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/ruta-201-santa-juana')),
  },
  {
    slug: 'concepcion-florida',
    title: 'Concepción ↔ Florida · corredor de El Pimentón',
    summary:
      'Cómo se viaja entre Concepción y Florida por privados, sin contrato del MTT que obligue a mejorar frecuencias, y qué servicios subsidiados se han sumado desde 2025.',
    section: 'interurbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/concepcion-florida')),
  },
  {
    slug: 'concepcion-tome',
    title: 'Concepción ↔ Tomé · corredor norte',
    summary:
      'El corredor norte por la Ruta 150: servicios 401, 401Y, 411 y 421 de Transportes Tomé, sus tarifas vigentes, los refuerzos y cómo se ven en el visor.',
    section: 'interurbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/concepcion-tome')),
  },
  {
    slug: 'concepcion-yumbel',
    title: 'Concepción ↔ Yumbel · corredor del valle central',
    summary:
      'El corredor privado por la Ruta 146 hacia Yumbel: quién lo cubre, por qué no hay contrato ni frecuencia garantizada y cómo se satura en las fiestas de San Sebastián.',
    section: 'interurbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/concepcion-yumbel')),
  },
  {
    slug: 'concepcion-coronel-lota',
    title: 'Concepción ↔ Coronel ↔ Lota · corredor sur',
    summary:
      'El corredor sur por la Ruta 160: sin operador único ni perímetro formal, con una licitación pendiente. Qué muestra el visor (302, 304 y Biotrén L2) y qué no.',
    section: 'interurbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/concepcion-coronel-lota')),
  },
  {
    slug: 'micros-urbanas-gran-concepcion',
    title: 'Las micros urbanas del Gran Concepción',
    summary:
      'Cómo leer las micros urbanas del Gran Concepción: qué significan la línea, el número y la letra de un servicio, quién las opera y cómo las muestra el visor.',
    section: 'urbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/micros-urbanas-gran-concepcion')),
  },
  {
    slug: 'biotren',
    title: 'Biotrén',
    summary:
      'El tren urbano del Gran Concepción: líneas, estaciones, tarifas por zona, itinerarios oficiales de EFE y cómo el visor proyecta cada tren sin usar GPS.',
    section: 'urbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/biotren')),
  },
  {
    slug: 'biotren-extensiones-proyectos',
    title: 'Biotrén · extensiones y proyectos',
    summary:
      'Qué se sabe de las extensiones del Biotrén a Penco-Lirquén y Lota, y de las ideas sin estudio para Tomé y Carriel Sur: costos, plazos y dudas.',
    section: 'urbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/biotren-extensiones-proyectos')),
  },
  {
    slug: 'taxis-colectivos-gran-concepcion',
    title: 'Taxis colectivos del Gran Concepción',
    summary:
      'Qué son los taxis colectivos, cómo se regulan y por qué el visor no los muestra ni entran al pago electrónico.',
    section: 'urbanos',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/taxis-colectivos-gran-concepcion')),
  },
  {
    slug: 'gtfs-gran-concepcion',
    title: 'GTFS Gran Concepción',
    summary:
      'El GTFS oficial de la DTPR que alimenta los buses del visor: qué cubre, qué no, por qué su calendario está vencido y cómo se mantiene al día.',
    section: 'fuentes',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/gtfs-gran-concepcion')),
  },
  {
    slug: 'openstreetmap-fuente-visor',
    title: 'OpenStreetMap como fuente del visor',
    summary:
      'Qué datos del visor vienen de OpenStreetMap (Biotrén, terminales, capas, mapa base), cómo se sincronizan y cómo corregirlos.',
    section: 'fuentes',
    updated: '2026-11-25',
    Component: lazy(() => import('./articles/openstreetmap-fuente-visor')),
  },
  {
    slug: 'sobre-este-wiki',
    title: 'Sobre este wiki',
    summary:
      'Qué es este wiki, qué no es y cómo contribuir. Incluye el glosario de siglas que se repiten en los artículos.',
    section: 'metodologia',
    updated: '2026-11-25',
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
