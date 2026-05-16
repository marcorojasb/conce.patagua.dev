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
    slug: 'perimetro-exclusion-gran-concepcion-2024',
    title: 'Perímetro de Exclusión del Gran Concepción 2024',
    summary:
      'Régimen tarifario y operativo bajo el cual operan, desde el 1-ene-2024, todos los buses urbanos del Gran Concepción (7 comunas, 36 unidades de negocio, 35 empresas). Reemplaza la licitación 2002 caducada el 31-mar-2024. Tarifa $580 adulto (vigente 23-feb-2025), polinomio de ajuste, contrato hasta 31-dic-2028. BusPay adjudicado a Consorcio Buspay en ene-2026, marcha blanca Q3 2026. Columna vertebral conceptual del visor urbano.',
    section: 'estructural',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/perimetro-exclusion-gran-concepcion-2024')),
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
    slug: 'biotren-extensiones',
    title: 'Biotrén y sus extensiones',
    summary:
      'Tren urbano del Gran Concepción operado por EFE Trenes Metropolitanos. Línea 1 Hualqui ↔ Mercado de Talcahuano (12 estaciones) y Línea 2 Coronel ↔ Concepción (14 estaciones), trazado y estaciones digitalizados desde OSM. Único tren urbano de Chile fuera de Santiago. Extensiones discutidas a Penco, Tomé, Lota y Carriel Sur — y la tensión con el electrocorredor MOP Ruta 150 que se licita en paralelo.',
    section: 'urbanos',
    updated: '2026-05-16',
    Component: lazy(() => import('./articles/biotren-extensiones')),
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
