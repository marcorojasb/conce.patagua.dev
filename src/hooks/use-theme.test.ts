import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Sin DOM en las pruebas: useSyncExternalStore se reemplaza por una lectura
// directa que además guarda la suscripción, y window/document son dobles
// mínimos. Cada prueba importa el módulo de nuevo (el tema se lee al cargarlo).
let subscribeCalls: Array<(listener: () => void) => () => void> = [];

vi.mock('react', () => ({
  useSyncExternalStore: (subscribe: (listener: () => void) => () => void, getSnapshot: () => unknown) => {
    subscribeCalls.push(subscribe);
    return getSnapshot();
  },
}));

interface Env {
  stored?: string | null;
  systemDark?: boolean;
  storageThrows?: boolean;
}

function installEnv({ stored = null, systemDark = false, storageThrows = false }: Env) {
  const storage = new Map<string, string>();
  if (stored != null) storage.set('conce.theme', stored);
  const classes = new Set<string>();
  const metas = [{ content: '#ffffff' }, { content: '#09090b' }];
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => {
        if (storageThrows) throw new Error('bloqueado');
        return storage.get(key) ?? null;
      },
      setItem: (key: string, value: string) => {
        if (storageThrows) throw new Error('bloqueado');
        storage.set(key, value);
      },
    },
    matchMedia: (query: string) => ({ matches: systemDark && query === '(prefers-color-scheme: dark)' }),
  });
  vi.stubGlobal('document', {
    documentElement: {
      classList: {
        toggle: (name: string, force: boolean) => {
          if (force) classes.add(name);
          else classes.delete(name);
          return force;
        },
      },
    },
    querySelectorAll: () =>
      metas.map((meta) => ({ setAttribute: (_: string, value: string) => (meta.content = value) })),
  });
  return { storage, classes, metas };
}

async function load() {
  vi.resetModules();
  subscribeCalls = [];
  return import('./use-theme');
}

describe('store del tema', () => {
  beforeEach(() => {
    subscribeCalls = [];
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lee la elección guardada antes que la del sistema y la aplica al documento', async () => {
    const env = installEnv({ stored: 'dark', systemDark: false });
    const { useTheme, useCurrentTheme } = await load();
    expect(useTheme()[0]).toBe('dark');
    expect(useCurrentTheme()).toBe('dark');
    expect(env.classes.has('dark')).toBe(true);
    expect(env.metas.map((m) => m.content)).toEqual(['#09090b', '#09090b']);
  });

  it('sin elección guardada usa la del sistema y no la guarda', async () => {
    const env = installEnv({ systemDark: true });
    const { useCurrentTheme } = await load();
    expect(useCurrentTheme()).toBe('dark');
    expect(env.storage.has('conce.theme')).toBe(false);
  });

  it('alternar cambia la clase, guarda, avisa a los suscriptores y conserva la firma [tema, alternar]', async () => {
    const env = installEnv({ stored: 'light' });
    const { useTheme, useCurrentTheme } = await load();
    const [theme, toggle] = useTheme();
    expect(theme).toBe('light');
    const listener = vi.fn();
    const unsubscribe = subscribeCalls[0](listener);

    toggle();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(useCurrentTheme()).toBe('dark');
    expect(env.classes.has('dark')).toBe(true);
    expect(env.storage.get('conce.theme')).toBe('dark');
    expect(env.metas[0].content).toBe('#09090b');

    unsubscribe();
    useTheme()[1]();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(useCurrentTheme()).toBe('light');
    expect(env.classes.has('dark')).toBe(false);
  });

  it('si localStorage falla, el tema sale del sistema y alternar igual funciona', async () => {
    const env = installEnv({ systemDark: true, storageThrows: true });
    const { useTheme, useCurrentTheme } = await load();
    expect(useCurrentTheme()).toBe('dark');
    expect(() => useTheme()[1]()).not.toThrow();
    expect(useCurrentTheme()).toBe('light');
    expect(env.classes.has('dark')).toBe(false);
  });
});
