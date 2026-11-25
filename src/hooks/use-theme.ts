// Tema claro/oscuro: un solo store de módulo para el visor y la wiki. Antes
// cada useTheme() tenía su propio estado; ahora cualquier componente (muestras
// de la leyenda, capas temáticas) lee el mismo valor con useCurrentTheme(), sin
// pasarlo por props ni observar la clase `dark` del DOM.
//
// Lectura inicial: la elección guardada en localStorage ('conce.theme') o, si
// no hay, la preferencia del sistema. Solo se guarda cuando la persona cambia
// el tema. localStorage puede fallar (modo privado, almacenamiento bloqueado):
// entonces el tema vale para la visita y nada más.

import { useSyncExternalStore } from 'react';
import type { Theme } from '@/types/transport';

const STORAGE_KEY = 'conce.theme';
const THEME_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#09090b' };

function readInitial(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Sin acceso a localStorage: se usa la preferencia del sistema.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  // La barra del navegador sigue al tema elegido en la página, no solo al del sistema.
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute('content', THEME_COLOR[theme]);
  });
}

let current: Theme = readInitial();
applyToDocument(current);

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Theme {
  return current;
}

function getServerSnapshot(): Theme {
  return 'light';
}

function setTheme(next: Theme): void {
  if (next === current) return;
  current = next;
  applyToDocument(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // No se pudo guardar: el cambio vale para esta visita.
  }
  for (const listener of listeners) listener();
}

function toggleTheme(): void {
  setTheme(current === 'dark' ? 'light' : 'dark');
}

/** Tema actual y cómo alternarlo (encabezado del visor y de la wiki). */
export function useTheme(): readonly [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [theme, toggleTheme] as const;
}

/** Solo lectura del tema actual, para componentes que dibujan según el tema. */
export function useCurrentTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
