import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;

// Radix marca como usado (preventDefault) el Escape que cierra un tooltip. Un
// tooltip es solo una ayuda al pasar el puntero o el foco: ese mismo Escape
// tiene que seguir cerrando la ficha o la capa de abajo. Aquí se anotan esos
// Escape para que el manejador global (use-view-state) no los descarte.
const hintEscapes = new WeakSet<Event>();

/** El Escape solo lo usó un tooltip para cerrarse: sigue valiendo para lo de abajo. */
export function escapeOnlyClosedHint(event: Event): boolean {
  return hintEscapes.has(event);
}

const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, onEscapeKeyDown, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      onEscapeKeyDown={(event) => {
        onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) hintEscapes.add(event);
      }}
      className={cn(
        // Mismo estilo que el tooltip del mapa (.surface-tooltip).
        'surface-tooltip z-50 overflow-hidden animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export function Tooltip({ children, content, side = 'bottom', delayDuration = 200 }: TooltipProps) {
  return (
    <TooltipRoot delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </TooltipRoot>
  );
}
