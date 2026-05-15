// Wiki article registry. Articles are lazy-loaded components so the
// wiki bundle stays small until the user navigates to one.

import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export interface ArticleMeta {
  slug: string;
  title: string;
  summary: string;
  /** Section grouping in the index — keeps related articles together. */
  section: 'interurbanos' | 'fuentes' | 'metodologia';
  /** Last edited date for the "actualizado" hint in the article header. */
  updated: string;
  /** Lazy-load the article body. */
  Component: LazyExoticComponent<ComponentType>;
}

export const ARTICLES: ArticleMeta[] = [
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
    updated: '2026-05-15',
    Component: lazy(() => import('./articles/ruta-201-santa-juana')),
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
  interurbanos: 'Recorridos interurbanos',
  fuentes: 'Fuentes y datos',
  metodologia: 'Sobre este wiki',
};
