import { useEffect, type ReactNode } from 'react';
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
}: FloatingInfoPanelProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const body = (
    <div className={cn('space-y-4 px-5 py-4', contentClassName)}>
      {children}
    </div>
  );

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
      <section
        aria-label={typeof title === 'string' ? title : undefined}
        className="pointer-events-auto grid h-full max-h-[inherit] min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-lg border bg-background/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/90 animate-fade-in"
      >
        <div className="flex justify-center py-1.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>

        <div className="border-b px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {eyebrow && (
                <div className="mb-1.5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                  {eyebrow}
                </div>
              )}
              <h2 className="pr-8 text-lg font-semibold leading-tight tracking-tight text-foreground">
                {title}
              </h2>
              {description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-2 -mt-2 size-9 shrink-0"
            >
              <X className="size-5" />
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
