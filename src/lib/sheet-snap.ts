// Alturas de la hoja inferior en móvil y cómo cambia con un deslizamiento.
// Tres alturas: asomada (título y acción principal), media y completa. Subir
// avanza una altura; bajar retrocede una y, desde la asomada, descarta la hoja
// (un paso atrás). Bajo el umbral el gesto es un toque y no cambia nada.

export type SheetSnap = 'peek' | 'half' | 'full';

/** Distancia vertical (px) desde la que un arrastre cambia de altura al soltar. */
export const SNAP_DRAG_PX = 40;

const ORDER: readonly SheetSnap[] = ['peek', 'half', 'full'];

/** dy > 0 es hacia abajo (como clientY). */
export function nextSnap(current: SheetSnap, dy: number): SheetSnap | 'dismiss' {
  if (Math.abs(dy) < SNAP_DRAG_PX) return current;
  const index = ORDER.indexOf(current);
  if (dy < 0) return ORDER[Math.min(index + 1, ORDER.length - 1)];
  return index === 0 ? 'dismiss' : ORDER[index - 1];
}

/**
 * Altura a la vista. Con `collapsed` (eligiendo un punto, barra lateral
 * abierta) manda la asomada, salvo que el usuario la haya movido mientras
 * tanto (`collapsedSnap`); al terminar vuelve sola la que tenía (`snap`).
 */
export function shownSnap(snap: SheetSnap, collapsed: boolean, collapsedSnap: SheetSnap | null): SheetSnap {
  if (!collapsed) return snap;
  return collapsedSnap ?? 'peek';
}

/** Toque en la manija: sube una altura; desde la completa vuelve a la media. */
export function toggleSnap(current: SheetSnap): SheetSnap {
  return current === 'full' ? 'half' : current === 'half' ? 'full' : 'half';
}
