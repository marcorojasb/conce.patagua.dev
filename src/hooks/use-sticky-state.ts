// Estado de formulario de las herramientas que sobrevive a desmontarlas: al
// abrir un recorrido desde Calidad de datos y volver con Atrás, el filtro y el
// formulario del fondo de pantalla siguen como estaban. Vive en un Map del
// módulo (no en la URL ni en localStorage): dura lo que dura la pestaña.

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

const store = new Map<string, unknown>();

export function readSticky<T>(key: string, initial: T | (() => T)): T {
  if (store.has(key)) return store.get(key) as T;
  const value = typeof initial === 'function' ? (initial as () => T)() : initial;
  store.set(key, value);
  return value;
}

export function writeSticky<T>(key: string, value: T): void {
  store.set(key, value);
}

/** Como useState, pero el valor queda guardado bajo `key` para el próximo montaje. */
export function useStickyState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readSticky(key, initial));
  const setSticky = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      // El Map siempre tiene el último valor (readSticky lo sembró al montar).
      const next =
        typeof action === 'function' ? (action as (prev: T) => T)(store.get(key) as T) : action;
      store.set(key, next);
      setValue(next);
    },
    [key],
  );
  return [value, setSticky];
}
