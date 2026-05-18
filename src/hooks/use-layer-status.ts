import { useCallback, useState } from 'react';

export interface LayerLoadStatus {
  loading: boolean;
  error: string | null;
  ready: boolean;
}

export const IDLE_LAYER_STATUS: LayerLoadStatus = {
  loading: false,
  error: null,
  ready: false,
};

export function useLayerStatus() {
  const [status, setStatus] = useState<LayerLoadStatus>(IDLE_LAYER_STATUS);

  const start = useCallback(() => {
    setStatus({ loading: true, error: null, ready: false });
  }, []);

  const succeed = useCallback(() => {
    setStatus({ loading: false, error: null, ready: true });
  }, []);

  const fail = useCallback((err: unknown, fallback: string) => {
    setStatus({
      loading: false,
      error: err instanceof Error ? err.message : fallback,
      ready: false,
    });
  }, []);

  const reset = useCallback(() => {
    setStatus(IDLE_LAYER_STATUS);
  }, []);

  return { status, setStatus, start, succeed, fail, reset };
}
