import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FloatingInfoPanelProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  contentClassName?: string;
  widthClassName?: string;
  scroll?: boolean;
  /** Nombre accesible del botón de cierre. */
  closeLabel?: string;
}

// La hoja inferior solo existe bajo `sm`; desde ahí el panel flota a la
// derecha y el gesto no aplica.
const DESKTOP_QUERY = '(min-width: 640px)';
// Distancia mínima antes de tratar el puntero como arrastre (bajo esto sigue
// siendo un toque/clic normal) y distancia para cambiar de estado al soltar.
// Umbral de toque de iOS/Android (~10 px): un dedo que se corre un poco al
// tocar la "×" sigue siendo un toque, no un arrastre.
const DRAG_START_PX = 12;
const DRAG_SNAP_PX = 40;
const DRAG_MIN_HEIGHT_PX = 96;

interface SheetDrag {
  pointerId: number;
  startY: number;
  startHeight: number;
  dragging: boolean;
}

export function FloatingInfoPanel({
  open,
  title,
  description,
  eyebrow,
  actions,
  children,
  onClose,
  className,
  contentClassName,
  widthClassName = 'sm:w-[420px]',
  scroll = true,
  closeLabel = 'Cerrar',
}: FloatingInfoPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<SheetDrag | null>(null);
  const suppressClickRef = useRef(false);
  // Los paneles reciben `onClose` como arrow inline, así que cambia de
  // identidad en cada render del padre. Con useEffectEvent el listener de
  // Escape no depende de él y no se re-suscribe en cada render.
  const close = useEffectEvent(onClose);

  const dialogLabel = typeof title === 'string' ? title : 'Detalle';
  // Al pasar a otra ficha (otro título) o al cerrar, la hoja vuelve sola a
  // su alto reducido.
  const [expanded, setExpanded] = useState(false);
  const [expandedLabel, setExpandedLabel] = useState(dialogLabel);
  if (expandedLabel !== dialogLabel || (!open && expanded)) {
    setExpandedLabel(dialogLabel);
    setExpanded(false);
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    // No modal: sin trampa de foco, pero el foco entra al panel para que un
    // lector de pantalla caiga en un diálogo con nombre y no en el mapa. Va al
    // panel y no a la "×": así no se dibuja el anillo de foco al abrir.
    panelRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!open) return null;

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
    const dy = clientY - drag.startY;
    // Solo se descarta el clic si el arrastre cambió algo; un arrastre corto
    // que vuelve a su alto deja pasar el toque.
    suppressClickRef.current = Math.abs(dy) >= DRAG_SNAP_PX;
    if (dy <= -DRAG_SNAP_PX) setExpanded(true);
    else if (dy >= DRAG_SNAP_PX) {
      if (expanded) setExpanded(false);
      else onClose();
    }
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

  const onDragCancel = () => {
    dragRef.current = null;
    resetSheetStyle();
  };

  // Un arrastre que empezó sobre un botón no debe terminar activándolo. Los
  // clics de teclado (detail 0) nunca vienen de un arrastre: no se tocan.
  const onDragClickCapture = (event: ReactMouseEvent) => {
    if (!suppressClickRef.current || event.detail === 0) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const body = (
    <div className={cn('space-y-4 px-5 py-4', contentClassName)}>
      {children}
    </div>
  );

  return (
    <div
      ref={sheetRef}
      className={cn(
        'pointer-events-none fixed inset-x-2 bottom-2 z-[5000] pb-[env(safe-area-inset-bottom)]',
        // Expandida deja a la vista el header (h-12) más un respiro, también
        // bajo un notch si algún día se activa viewport-fit=cover.
        expanded ? 'h-[min(90dvh,calc(100dvh-4rem-env(safe-area-inset-top)))]' : 'h-[58dvh]',
        'transition-[height] duration-300 ease-out motion-reduce:transition-none',
        'sm:left-auto sm:right-[64px] sm:bottom-3 sm:top-16 sm:h-auto sm:transition-none',
        widthClassName,
        className,
      )}
      aria-live="polite"
    >
      {/* Panel no modal y flotante sobre el mapa: ya gestiona foco inicial,
          Escape, aria-label y aria-live. `<dialog>` no-modal exige show()/close()
          imperativos y trae layout propio (centrado, ::backdrop) que pelea con
          el posicionamiento absoluto y las animaciones. */}
      {/* react-doctor-disable-next-line react-doctor/prefer-html-dialog -- Migrar a <dialog> no es un reemplazo equivalente para paneles no modales ya accesibles. */}
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={dialogLabel}
        className="pointer-events-auto grid outline-none h-full max-h-[inherit] min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg border bg-background/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/90 animate-fade-in"
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
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? 'Reducir panel' : 'Expandir panel'}
            aria-expanded={expanded}
            className="flex h-6 w-full items-center justify-center rounded-t-lg focus-ring sm:hidden"
          >
            <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
          </button>

          <div className="border-b px-4 pb-3 pt-1 sm:px-5 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {eyebrow && (
                  <div className="mb-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
                    {eyebrow}
                  </div>
                )}
                <h2 className="text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg">
                  {title}
                </h2>
                {description && (
                  <div className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {description}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label={closeLabel}
                className="-mr-2 -mt-1 size-8 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
            {actions && <div className="mt-3">{actions}</div>}
          </div>
        </div>

        {scroll ? (
          <ScrollArea className="min-h-0 flex-1 scroll-fade-y">
            {body}
          </ScrollArea>
        ) : (
          <div className="min-h-0 flex-1">{children}</div>
        )}
      </section>
    </div>
  );
}
