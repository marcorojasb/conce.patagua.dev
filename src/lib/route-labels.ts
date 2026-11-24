import type { Route } from '@/types/transport';

/** "02A: Centinela I" → "Centinela I"; "Biotrén L1 · Hualqui ↔ …" → "Hualqui ↔ …". */
export function routeShortName(route: Pick<Route, 'code' | 'name'>): string {
  const code = route.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stripped = route.name.replace(new RegExp(`^(Biotrén\\s+)?${code}\\s*[:·]\\s*`), '');
  return stripped || route.name;
}

/**
 * Número de línea al que pertenece una variante: "30Q" y "30B" son la línea
 * 30, "02A" la 2, "10 J" la 10. Así se agrupa en la lista: la gente conoce
 * las micros por número, no por la empresa que las opera.
 */
export function lineFamily(code: string): string {
  const match = /^0*(\d+)/.exec(code.trim());
  return match ? match[1] : code.trim();
}

const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

/** Orden natural de códigos: 2A < 10A < 10B < 30Q < 201. */
export function compareRouteCodes(a: string, b: string): number {
  return collator.compare(a, b);
}

/** Servicios fuera del GTFS urbano: hoy "Interurbano Biobío" (201) e "Interurbano Tomé" (401/411/421). */
export function isInterurban(route: Pick<Route, 'network'>): boolean {
  return route.network?.startsWith('Interurbano') ?? false;
}
