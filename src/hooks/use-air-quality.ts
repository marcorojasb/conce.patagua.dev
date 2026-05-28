// Fetches the SINCA realtime feed and exposes the subset of stations within
// the Biobío metro bbox, parsing the latest PM2.5 / PM10 reading per station.
//
// SINCA updates roughly hourly. We poll every 10 minutes when the layer is
// active, and dedupe by station key.

import { useEffect, useSyncExternalStore } from 'react';
import type { AirQualityStation } from '@/types/transport';

const ENDPOINT = 'https://sinca.mma.gob.cl/index.php/json/listadomapa2k19/';
const BBOX = { minLat: -37.1, maxLat: -36.65, minLng: -73.25, maxLng: -72.8 };
const REFRESH_MS = 10 * 60 * 1000;

interface SincaRow {
  c?: Array<{ v: number | string | null } | null>;
}

interface SincaSensor {
  code?: string;
  name?: string;
  info?: {
    cols?: Array<{ label: string }>;
    rows?: SincaRow[];
  };
}

interface SincaStation {
  nombre: string;
  key: string;
  latitud: number;
  longitud: number;
  comuna: string;
  red: string;
  region: string;
  empresa?: string;
  realtime?: SincaSensor[];
}

function latestReading(sensor: SincaSensor): number | null {
  const rows = sensor.info?.rows;
  if (!rows || !rows.length) return null;
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    const v = row?.c?.[1]?.v;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return null;
}

function parseStations(raw: unknown): AirQualityStation[] {
  if (!Array.isArray(raw)) return [];
  const out: AirQualityStation[] = [];
  for (const r of raw as SincaStation[]) {
    if (!r || typeof r !== 'object') continue;
    if (typeof r.latitud !== 'number' || typeof r.longitud !== 'number') continue;
    if (
      r.latitud < BBOX.minLat ||
      r.latitud > BBOX.maxLat ||
      r.longitud < BBOX.minLng ||
      r.longitud > BBOX.maxLng
    ) {
      continue;
    }
    const sensorsByCode = new Map(r.realtime?.map((s) => [s.code, s]) ?? []);
    const pm25Sensor = sensorsByCode.get('PM25');
    const pm10Sensor = sensorsByCode.get('PM10');
    out.push({
      id: `sinca-${r.key}`,
      name: r.nombre,
      comuna: r.comuna,
      operator: r.empresa ?? r.red,
      lat: r.latitud,
      lng: r.longitud,
      pm25: pm25Sensor ? latestReading(pm25Sensor) : null,
      pm10: pm10Sensor ? latestReading(pm10Sensor) : null,
    });
  }
  return out;
}

export interface AirQualityState {
  stations: AirQualityStation[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const INITIAL: AirQualityState = {
  stations: [],
  loading: false,
  error: null,
  lastFetched: null,
};

let snapshot = INITIAL;
let pollingId: number | null = null;
let activeConsumers = 0;
const listeners = new Set<() => void>();

function setSnapshot(next: AirQualityState): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AirQualityState {
  return snapshot;
}

async function loadAirQuality(): Promise<void> {
  setSnapshot({ ...snapshot, loading: true, error: null });
  try {
    const res = await fetch(ENDPOINT, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`SINCA ${res.status}`);
    const json = await res.json();
    setSnapshot({
      stations: parseStations(json),
      loading: false,
      error: null,
      lastFetched: Date.now(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setSnapshot({ ...snapshot, loading: false, error: message });
  }
}

function startPolling(): void {
  void loadAirQuality();
  if (pollingId != null) return;
  pollingId = window.setInterval(() => void loadAirQuality(), REFRESH_MS);
}

function stopPolling(): void {
  if (pollingId == null) return;
  window.clearInterval(pollingId);
  pollingId = null;
}

export function useAirQuality(active: boolean, retryKey = 0): AirQualityState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!active) return;
    activeConsumers += 1;
    startPolling();
    return () => {
      activeConsumers = Math.max(0, activeConsumers - 1);
      if (activeConsumers === 0) stopPolling();
    };
  }, [active, retryKey]);

  return state;
}

// PM2.5 category boundaries from the Chilean ICA Aire scale.
export function categorize(pm25: number | null): {
  level: 'good' | 'moderate' | 'alert' | 'preemergency' | 'emergency' | 'unknown';
  color: string;
  label: string;
} {
  if (pm25 == null || !Number.isFinite(pm25)) {
    return { level: 'unknown', color: '#94a3b8', label: 'Sin dato' };
  }
  if (pm25 <= 50) return { level: 'good', color: '#16A34A', label: 'Buena' };
  if (pm25 <= 79) return { level: 'moderate', color: '#EAB308', label: 'Regular' };
  if (pm25 <= 109) return { level: 'alert', color: '#F97316', label: 'Alerta' };
  if (pm25 <= 169) return { level: 'preemergency', color: '#DC2626', label: 'Preemergencia' };
  return { level: 'emergency', color: '#7C3AED', label: 'Emergencia' };
}
