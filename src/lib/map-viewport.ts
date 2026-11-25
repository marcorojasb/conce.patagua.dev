// Último encuadre del mapa, fuera de React. El mapa lo escribe en moveend y
// zoomend; quien lo necesita lo lee en el momento (fondo de pantalla, "Acercar")
// o se suscribe con un selector (aviso de zoom de paraderos), así un arrastre
// no vuelve a renderizar App. Se crea tal cual en todos los paquetes.

export type MapBounds = [[number, number], [number, number]];

export interface MapViewport {
  bounds: MapBounds;
  center: { lat: number; lng: number };
  zoom: number;
}

let viewport: MapViewport | null = null;
const listeners = new Set<() => void>();

export function setMapViewport(next: MapViewport): void {
  viewport = next;
  for (const listener of listeners) listener();
}

export function getMapViewport(): MapViewport | null {
  return viewport;
}

export function getMapZoom(): number | null {
  return viewport?.zoom ?? null;
}

export function subscribeMapViewport(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
