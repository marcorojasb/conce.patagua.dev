// Próximas pasadas programadas por un paradero (ficha de paradero).
//
// Micros: STOP_SERVICE_WINDOWS trae, por paradero, recorrido, sentido
// (headsign oficial) y día, la primera y la última pasada con el intervalo
// mediano. Esas dos son horas del programa; las de en medio se proyectan como
// primera + k·intervalo, así que son aproximadas. Las ventanas de ayer que
// pasan de 24:00 siguen valiendo de madrugada.
//
// Biotrén (sin GTFS): los patrones de static-service-patterns.ts traen cada
// salida desde la cabecera con su duración. La pasada por una estación
// intermedia se interpola según la distancia recorrida hasta ella, y la fila
// conserva la salida desde la cabecera para no presentarla como dato oficial.
//
// En ambos casos se muestra una fila por recorrido y sentido: la más próxima,
// sea de hoy o del día siguiente. Donde un sentido termina no se lista: el
// vehículo llega, pero no sale hacia su destino.

import { STATIC_SERVICE_PATTERNS, type StaticServiceDay } from '@/data/static-service-patterns';
import type { StopServiceWindow } from '@/data/gtfs-stop-services.generated';
import { expandFrequencyWindow } from '@/realtime/static-service-schedules';
import { chileClock } from '@/lib/chile-time';
import { distanceMeters } from '@/lib/geo';
import type { Route, Stop } from '@/types/transport';

const DAY_MIN = 1440;

export interface NextStopService {
  routeId: string;
  /** Código que muestra el vehículo en ese sentido ("10A"); sin él, el de la ruta. */
  variant?: string;
  /** Hacia dónde va, sin el nombre del operador. */
  destination: string;
  /** Minutos desde la medianoche de hoy en Chile: pasa de 1440 si es mañana. */
  scheduledMin: number;
  minutesUntil: number;
  /**
   * gtfs-window: desde la ventana del paradero; aproximada salvo `windowEdge`.
   * static-trips: salida publicada una a una (Biotrén/EFE).
   * static-frequency: salida reconstruida desde una frecuencia anunciada.
   */
  source: 'gtfs-window' | 'static-trips' | 'static-frequency';
  /** Solo gtfs-window: intervalo mediano y pasadas de ese día por el paradero. */
  headwayMin?: number;
  passesInDay?: number;
  /**
   * Solo gtfs-window: la hora es la primera o la última pasada del día tal
   * como la trae el programa (no proyectada).
   */
  windowEdge?: 'first' | 'last';
  /** Patrones estáticos: cabecera y salida desde ella si este no es el punto de partida. */
  origin?: { name: string; departureMin: number };
}

export interface StopServiceSnapshot {
  services: NextStopService[];
  generatedAt: Date;
}

export function formatServiceClock(totalMin: number): string {
  const wrapped = ((Math.floor(totalMin) % DAY_MIN) + DAY_MIN) % DAY_MIN;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Próxima pasada >= ahora dentro de una ventana desplazada `dayOffset` días. */
function nextFromWindow(
  firstMin: number,
  lastMin: number,
  headwayMin: number,
  nowMin: number,
  dayOffset: number,
): number | null {
  const first = firstMin + dayOffset * DAY_MIN;
  const last = lastMin + dayOffset * DAY_MIN;
  if (nowMin > last) return null;
  if (nowMin <= first) return first;
  if (headwayMin <= 0) return null;
  // La última pasada es del programa: si la proyección se pasa, queda ella.
  return Math.min(first + Math.ceil((nowMin - first) / headwayMin) * headwayMin, last);
}

function keepEarliest(best: Map<string, NextStopService>, key: string, service: NextStopService): void {
  const current = best.get(key);
  if (!current || service.scheduledMin < current.scheduledMin) best.set(key, service);
}

/** El paradero es el último del sentido: la micro llega y termina, no sale hacia su destino. */
export function endsAt(stops: readonly Stop[], stopId: string): boolean {
  return stops.length > 1 && stops[stops.length - 1].id === stopId;
}

function windowServices(
  windows: readonly StopServiceWindow[],
  routes: ReadonlyMap<string, Route>,
  stopId: string,
  day: number,
  nowMin: number,
): NextStopService[] {
  const best = new Map<string, NextStopService>();
  for (const [routeId, headsign, windowDay, first, last, headway, count] of windows) {
    if (!routes.has(routeId) || count <= 0) continue;
    const dayOffset = [-1, 0, 1].find((offset) => (day + offset + 7) % 7 === windowDay);
    if (dayOffset === undefined) continue;
    const next = nextFromWindow(first, last, headway, nowMin, dayOffset);
    if (next === null) continue;
    const direction = routes.get(routeId)?.directions?.find((d) => d.headsign === headsign);
    if (direction && endsAt(direction.stops, stopId)) continue;
    const shift = dayOffset * DAY_MIN;
    keepEarliest(best, `${routeId}|${headsign}`, {
      routeId,
      variant: direction?.variant,
      destination: direction?.destination ?? headsign,
      scheduledMin: next,
      minutesUntil: Math.max(0, Math.round(next - nowMin)),
      source: 'gtfs-window',
      headwayMin: headway > 0 ? headway : undefined,
      passesInDay: count,
      windowEdge: next === first + shift ? 'first' : next === last + shift ? 'last' : undefined,
    });
  }
  return [...best.values()];
}

function dayKind(day: number): StaticServiceDay {
  return day < 5 ? 'weekday' : day === 5 ? 'saturday' : 'sunday';
}

/**
 * Fracción (0..1) del recorrido en sentido `forward` a la que queda la parada,
 * medida en línea recta entre paradas consecutivas. null si no es del recorrido.
 */
export function stopPositionAlong(stops: readonly Stop[], stopId: string): number | null {
  const index = stops.findIndex((stop) => stop.id === stopId);
  if (index < 0) return null;
  let total = 0;
  let upTo = 0;
  for (let i = 1; i < stops.length; i++) {
    total += distanceMeters([stops[i - 1].lat, stops[i - 1].lng], [stops[i].lat, stops[i].lng]);
    if (i === index) upTo = total;
  }
  return total > 0 ? upTo / total : 0;
}

const PATTERNS_BY_ROUTE = new Map<string, typeof STATIC_SERVICE_PATTERNS>();
for (const pattern of STATIC_SERVICE_PATTERNS) {
  const list = PATTERNS_BY_ROUTE.get(pattern.routeId) ?? [];
  list.push(pattern);
  PATTERNS_BY_ROUTE.set(pattern.routeId, list);
}

/** "Hualqui → Mercado Talcahuano" → ["Hualqui", "Mercado Talcahuano"]. */
function splitDirectionLabel(label: string): [origin: string, destination: string] {
  const [origin, destination] = label.split('→').map((part) => part.trim());
  return [origin, destination || label];
}

// Los patrones `forward` recorren `route.stops` en orden y los `reverse` al
// revés (así los arma static-service-patterns.ts y así los simula el mapa).
function staticServices(
  routes: readonly Route[],
  stopId: string,
  day: number,
  nowMin: number,
): NextStopService[] {
  const best = new Map<string, NextStopService>();
  for (const route of routes) {
    const patterns = PATTERNS_BY_ROUTE.get(route.id);
    if (!patterns) continue;
    const position = stopPositionAlong(route.stops, stopId);
    if (position === null) continue;
    for (const dayOffset of [0, 1]) {
      const kind = dayKind((day + dayOffset) % 7);
      for (const pattern of patterns) {
        if (!pattern.days.includes(kind)) continue;
        const fraction = pattern.direction === 'forward' ? position : 1 - position;
        // En su estación terminal el tren llega, no sale hacia ningún lado.
        if (fraction >= 1) continue;
        const [origin, destination] = splitDirectionLabel(pattern.directionLabel);
        for (const [start, duration] of expandFrequencyWindow(pattern)) {
          const departure = start + dayOffset * DAY_MIN;
          const pass = departure + Math.round(fraction * duration);
          if (pass < nowMin) continue;
          keepEarliest(best, `${route.id}|${pattern.direction}`, {
            routeId: route.id,
            destination,
            scheduledMin: pass,
            minutesUntil: Math.max(0, Math.round(pass - nowMin)),
            source: pattern.trips ? 'static-trips' : 'static-frequency',
            origin: fraction > 0 ? { name: origin, departureMin: departure } : undefined,
          });
        }
      }
    }
  }
  return [...best.values()];
}

export function getNextStopServices(input: {
  stopId: string;
  /** Recorridos del paradero (con sus sentidos, si los tienen). */
  routes: readonly Route[];
  windows: readonly StopServiceWindow[] | undefined;
  now: Date;
  limit?: number;
}): StopServiceSnapshot {
  const { day, minutes: nowMin } = chileClock(input.now);
  const routesById = new Map(input.routes.map((route) => [route.id, route] as const));
  const services = [
    ...windowServices(input.windows ?? [], routesById, input.stopId, day, nowMin),
    ...staticServices(input.routes, input.stopId, day, nowMin),
  ];
  services.sort((a, b) => a.scheduledMin - b.scheduledMin || a.routeId.localeCompare(b.routeId));
  return { services: services.slice(0, input.limit ?? 8), generatedAt: input.now };
}
