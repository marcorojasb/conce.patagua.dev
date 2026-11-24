import { useEffect, useEffectEvent, useRef, type ReactNode } from 'react';
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
  // Los paneles reciben `onClose` como arrow inline, así que cambia de
  // identidad en cada render del padre. Con useEffectEvent el listener de
  // Escape no depende de él y no se re-suscribe en cada render.
  const close = useEffectEvent(onClose);

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

  const body = (
    <div className={cn('space-y-4 px-5 py-4', contentClassName)}>
      {children}
    </div>
  );

  const dialogLabel = typeof title === 'string' ? title : 'Detalle';

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-2 bottom-2 z-[5000] h-[58dvh] pb-[env(safe-area-inset-bottom)]',
        'sm:left-auto sm:right-[64px] sm:bottom-3 sm:top-16 sm:h-auto',
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
        className="pointer-events-auto grid outline-none h-full max-h-[inherit] min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-lg border bg-background/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/90 animate-fade-in"
      >
        <div className="flex justify-center py-1.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>

        <div className="border-b px-4 py-3 sm:px-5 sm:py-4">
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
