import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

export interface LayerLoadStatus {
  loading: boolean;
  error: string | null;
  ready: boolean;
}

export interface LayerStatusControls {
  start: () => void;
  succeed: () => void;
  fail: (err: unknown, fallback: string) => void;
  reset: () => void;
}

const IDLE_LAYER_STATUS: LayerLoadStatus = {
  loading: false,
  error: null,
  ready: false,
};

export function useLayerStatus(): {
  status: LayerLoadStatus;
  setStatus: Dispatch<SetStateAction<LayerLoadStatus>>;
  controls: LayerStatusControls;
} {
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

  const controls = useMemo(
    () => ({ start, succeed, fail, reset }),
    [start, succeed, fail, reset],
  );

  return { status, setStatus, controls };
}
