import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { nextSnap, shownSnap, toggleSnap, type SheetSnap } from '@/lib/sheet-snap';
import { cn } from '@/lib/utils';
import type { FloatingInfoPanelProps } from '@/types/ui-contracts';

interface Props extends FloatingInfoPanelProps {
  /** En escritorio el panel mide lo que su contenido (hasta el alto disponible) en vez de ocupar toda la altura. */
  fit?: boolean;
}

// La única superficie a la vista: panel a la derecha en escritorio, hoja
// inferior con tres alturas en móvil. "←" vuelve a la superficie anterior y
// "×" al mapa; Escape lo maneja la navegación (use-view-state), no el panel.

// La hoja inferior solo existe bajo `sm`; desde ahí el panel flota a la
// derecha y el gesto no aplica.
const DESKTOP_QUERY = '(min-width: 640px)';
// Umbral de toque de iOS/Android (~10 px): un dedo que se corre un poco al
// tocar la "×" sigue siendo un toque, no un arrastre.
const DRAG_START_PX = 12;
const DRAG_MIN_HEIGHT_PX = 72;

const SNAP_HEIGHT: Record<SheetSnap, string> = {
  // Asomada: solo el encabezado (título y acción principal), ~120 px.
  peek: 'h-auto max-h-[45dvh]',
  // Media: nunca más arriba que el riel derecho del mapa (encabezado 48 +
  // 8 + cinco botones de 40 con sus separaciones = 287 px, más 8 de aire y
  // los 8 del margen de abajo ≈ 19rem): una ficha que cortaba "Más
  // herramientas" por la mitad lo dejaba tocable solo en su parte de arriba.
  // En pantallas bajas (< ~480 px) eso la dejaba más baja que su encabezado:
  // ahí manda el contenido, con un piso de 15rem (sin pasar de 58dvh).
  half: 'h-[max(min(58dvh,calc(100dvh-19rem)),min(58dvh,15rem))]',
  // Deja a la vista el header (h-12) más un respiro, también bajo un notch.
  full: 'h-[min(90dvh,calc(100dvh-4rem-env(safe-area-inset-top)))]',
};

interface SheetDrag {
  pointerId: number;
  startY: number;
  startHeight: number;
  dragging: boolean;
}

export function FloatingInfoPanel({
  chrome,
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
  contentClassName,
  // 380 px hasta 1280×720 inclusive (el mapa sigue usable con la barra lateral
  // abierta); 420 px desde pantallas más anchas.
  widthClassName = 'sm:w-[380px] min-[1360px]:w-[420px]',
  scroll = true,
  closeLabel = 'Cerrar',
  fit = false,
}: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<SheetDrag | null>(null);
  const suppressClickRef = useRef(false);

  const dialogLabel = typeof title === 'string' ? title : 'Detalle';
  const [snap, setSnap] = useState<SheetSnap>('half');
  // Altura elegida a mano mientras la hoja está plegada; se olvida al desplegarse.
  const [collapsedSnap, setCollapsedSnap] = useState<SheetSnap | null>(null);
  if (!chrome.collapsed && collapsedSnap !== null) setCollapsedSnap(null);
  const shown = shownSnap(snap, chrome.collapsed, collapsedSnap);
  const peek = shown === 'peek';

  useEffect(() => {
    // No modal: sin trampa de foco, pero el foco entra al panel para que un
    // lector de pantalla caiga en un diálogo con nombre y no en el mapa. Va al
    // panel y no a la "×": así no se dibuja el anillo de foco al abrir.
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  const applySnap = (next: SheetSnap | 'dismiss') => {
    if (next === 'dismiss') {
      if (chrome.back) chrome.back.onBack();
      else chrome.onClose();
    } else if (chrome.collapsed) setCollapsedSnap(next);
    else setSnap(next);
  };

  const resetSheetStyle = () => {
    sheetRef.current?.style.removeProperty('height');
    sheetRef.current?.style.removeProperty('transition');
  };

  const moveDrag = (pointerId: number, clientY: number, captureTarget: Element | null) => {
    const drag = dragRef.current;
    const sheet = sheetRef.current;
    if (!drag || drag.pointerId !== pointerId || !sheet) return;
    const dy = clientY - drag.startY;
    if (!drag.dragging) {
      if (Math.abs(dy) < DRAG_START_PX) return;
      drag.dragging = true;
      // La captura recién al confirmar el arrastre: capturar en pointerdown
      // redirigiría el clic de la "×" o de las acciones al contenedor.
      captureTarget?.setPointerCapture(pointerId);
    }
    // La hoja sigue al dedo sin transición; al soltar vuelve a la clase.
    const maxHeight = window.innerHeight - 64;
    sheet.style.transition = 'none';
    sheet.style.height = `${Math.min(maxHeight, Math.max(DRAG_MIN_HEIGHT_PX, drag.startHeight - dy))}px`;
  };

  const endDrag = (pointerId: number, clientY: number) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== pointerId) return;
    dragRef.current = null;
    if (!drag.dragging) return;
    resetSheetStyle();
    const next = nextSnap(shown, clientY - drag.startY);
    // Solo se descarta el clic si el arrastre cambió algo; un arrastre corto
    // que vuelve a su alto deja pasar el toque.
    suppressClickRef.current = next !== shown;
    if (next !== shown) applySnap(next);
  };

  const onDragCancel = () => {
    dragRef.current = null;
    resetSheetStyle();
  };

  const onDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    suppressClickRef.current = false;
    if (!event.isPrimary || event.button !== 0 || !sheetRef.current) return;
    if (window.matchMedia(DESKTOP_QUERY).matches) return;
    if ((event.target as Element).closest('input, textarea, select')) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: sheetRef.current.getBoundingClientRect().height,
      dragging: false,
    };
    // El dedo queda capturado solo por el elemento que tocó; el mouse no: al
    // subir desde la manija (24 px, en el borde) sale de la zona antes del
    // umbral y sus movimientos irían al mapa. Se sigue desde window hasta soltar.
    if (event.pointerType === 'mouse') {
      const onMove = (e: PointerEvent) => moveDrag(e.pointerId, e.clientY, null);
      const onUp = (e: PointerEvent) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (e.type === 'pointercancel') onDragCancel();
        else endDrag(e.pointerId, e.clientY);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    }
  };

  const onDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    moveDrag(event.pointerId, event.clientY, event.currentTarget);
  };

  const onDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    endDrag(event.pointerId, event.clientY);
  };

  // Un arrastre que empezó sobre un botón no debe terminar activándolo. Los
  // clics de teclado (detail 0) nunca vienen de un arrastre: no se tocan.
  const onDragClickCapture = (event: ReactMouseEvent) => {
    if (!suppressClickRef.current || event.detail === 0) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const back = chrome.back;
  // En la asomada (solo móvil) el encabezado se reduce a título y acciones.
  const peekHidden = peek && 'max-sm:hidden';

  return (
    <div
      ref={sheetRef}
      data-surface={dialogLabel}
      data-snap={shown}
      className={cn(
        'pointer-events-none fixed inset-x-2 bottom-2 z-30 pb-[env(safe-area-inset-bottom)]',
        SNAP_HEIGHT[shown],
        'transition-[height] duration-300 ease-out motion-reduce:transition-none',
        'sm:left-auto sm:right-[64px] sm:bottom-3 sm:top-16 sm:h-auto sm:max-h-none sm:transition-none',
        fit && 'sm:bottom-auto',
        widthClassName,
        className,
      )}
    >
      {/* Panel no modal y flotante sobre el mapa: ya gestiona foco inicial y
          aria-label. `<dialog>` no-modal exige show()/close() imperativos y
          trae layout propio (centrado, ::backdrop) que pelea con el
          posicionamiento absoluto y las animaciones. */}
      {/* react-doctor-disable-next-line react-doctor/prefer-html-dialog -- Migrar a <dialog> no es un reemplazo equivalente para paneles no modales ya accesibles. */}
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={dialogLabel}
        className={cn(
          // Columna explícita minmax(0,1fr): sin ella la columna implícita crece
          // hasta el ancho mínimo del contenido (textos truncados) y el panel se
          // desborda de lado.
          'surface-panel pointer-events-auto grid h-full max-h-[inherit] min-h-0 grid-cols-[minmax(0,1fr)] overflow-hidden outline-none animate-fade-in',
          peek ? 'grid-rows-[auto] sm:grid-rows-[auto_minmax(0,1fr)]' : 'grid-rows-[auto_minmax(0,1fr)]',
          // Con alto según contenido el tope va aquí (top-16 + 1 rem de respiro):
          // un max-height en % del contenedor no se resolvería contra un alto
          // automático, y la fila 1fr se achica hasta caber.
          fit && 'sm:max-h-[calc(100dvh-5rem)]',
        )}
      >
        {/* Zona de arrastre (manija + encabezado) de la hoja móvil. pan-x deja
            al navegador los desplazamientos horizontales de las acciones y nos
            entrega los verticales. */}
        <div
          className="touch-pan-x sm:touch-auto"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragCancel}
          onClickCapture={onDragClickCapture}
        >
          <button
            type="button"
            onClick={() => applySnap(toggleSnap(shown))}
            aria-label={shown === 'full' ? 'Reducir panel' : 'Expandir panel'}
            aria-expanded={shown === 'full'}
            className="flex h-10 w-full items-center justify-center rounded-t-lg focus-ring sm:hidden"
          >
            <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
          </button>

          <div className={cn('px-5 pb-3 sm:py-4', !peek && 'border-b', peek && 'sm:border-b')}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {back && (
                  <button
                    type="button"
                    onClick={back.onBack}
                    aria-label={`Volver a ${back.label}`}
                    className="-ml-1.5 mb-1 inline-flex h-10 max-w-full items-center gap-1 rounded-md px-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-ring md:h-7"
                  >
                    <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{back.label}</span>
                  </button>
                )}
                {eyebrow && (
                  <div
                    className={cn(
                      'mb-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0',
                      peekHidden,
                    )}
                  >
                    {eyebrow}
                  </div>
                )}
                <h2
                  className={cn(
                    'text-lg font-semibold leading-tight tracking-tight text-foreground',
                    peek && 'max-sm:truncate',
                  )}
                >
                  {title}
                </h2>
                {description && (
                  <div className={cn('mt-1 text-[13px] leading-snug text-muted-foreground', peekHidden)}>
                    {description}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={chrome.onClose}
                aria-label={closeLabel}
                className="-mr-2.5 -mt-2 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </Button>
            </div>
            {actions && <div className="mt-3">{actions}</div>}
          </div>
        </div>

        <div className={cn('min-h-0 min-w-0', peekHidden)}>
          {scroll ? (
            <ScrollArea className="h-full min-h-0 scroll-fade-y">
              <div className={cn('space-y-4 px-5 py-4', contentClassName)}>{children}</div>
            </ScrollArea>
          ) : (
            <div className="h-full min-h-0">{children}</div>
          )}
        </div>
      </section>
    </div>
  );
}
