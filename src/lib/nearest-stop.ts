import { distanceMeters } from '@/lib/geo';
import type { LatLng } from '@/types/ui-contracts';

interface NamedPoint {
  name?: string;
  lat: number;
  lng: number;
}

/** ~111 km por grado de latitud: descarta lejanos sin calcular la distancia. */
const METERS_PER_DEG_LAT = 111_320;

/**
 * Paradero con nombre más cercano a un punto, si está a `maxMeters` o menos.
 * Sirve para mostrar "Cerca de Plaza Perú · 120 m" en vez de coordenadas.
 */
export function nearestStop<T extends NamedPoint>(
  point: LatLng,
  stops: readonly T[],
  maxMeters: number,
): { stop: T; meters: number } | null {
  const maxDLat = maxMeters / METERS_PER_DEG_LAT;
  const maxDLng = maxDLat / Math.max(Math.cos((point.lat * Math.PI) / 180), 0.01);
  let best: { stop: T; meters: number } | null = null;
  for (const stop of stops) {
    if (!stop.name) continue;
    if (Math.abs(stop.lat - point.lat) > maxDLat || Math.abs(stop.lng - point.lng) > maxDLng) continue;
    const meters = distanceMeters([point.lat, point.lng], [stop.lat, stop.lng]);
    if (meters <= maxMeters && (!best || meters < best.meters)) best = { stop, meters };
  }
  return best;
}
