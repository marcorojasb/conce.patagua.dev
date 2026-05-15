// Lazy loader for the per-paradero hourly frequency dataset (~50 KB gz).
// The chunk is fetched the first time any consumer requests a stop's
// frequency; subsequent reads are synchronous against the cached map.

import { useEffect, useState } from 'react';

let freqPromise: Promise<Record<string, number[]>> | null = null;
function load(): Promise<Record<string, number[]>> {
  freqPromise ??= import('@/data/gtfs-stop-frequency.generated').then(
    (mod) => mod.STOP_FREQUENCY,
  );
  return freqPromise;
}

export interface FrequencyState {
  loading: boolean;
  error: string | null;
  /**
   * 168-length numeric array: `arr[day * 24 + hour]` = buses scheduled per
   * hour. Padded to 168 (script trims trailing zeros to save bytes).
   */
  hourly: number[] | null;
}

/**
 * 0=Monday..6=Sunday (matches RouteSchedule + STOP_FREQUENCY).
 */
export function isoDayOfWeek(date: Date): number {
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

const ZERO_PAD = new Array(168).fill(0);

export function useStopFrequency(stopId: string | null): FrequencyState {
  const [state, setState] = useState<FrequencyState>({
    loading: false,
    error: null,
    hourly: null,
  });

  useEffect(() => {
    if (!stopId) {
      setState({ loading: false, error: null, hourly: null });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    void load()
      .then((map) => {
        if (cancelled) return;
        const raw = map[stopId];
        // Pad trimmed arrays back to 168 so callers always read a fixed shape.
        const hourly = raw
          ? raw.length === 168
            ? raw
            : [...raw, ...ZERO_PAD.slice(raw.length)]
          : null;
        setState({ loading: false, error: null, hourly });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: err instanceof Error ? err.message : 'No se pudo cargar la frecuencia',
          hourly: null,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [stopId]);

  return state;
}
