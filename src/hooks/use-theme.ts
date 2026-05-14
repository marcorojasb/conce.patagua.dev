import { useCallback, useEffect, useState } from 'react';
import type { Theme } from '@/types/transport';

const STORAGE_KEY = 'conce.theme';

function readInitial(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): readonly [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(readInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return [theme, toggle] as const;
}
