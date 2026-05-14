import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background shadow-lg transition ease-in-out data-[state=open]:duration-300 data-[state=closed]:duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        // The right-side sheet is responsive: on mobile (<md) it docks at
        // the BOTTOM with a peek of 80vh — preserving spatial context with
        // the map. From md: up it returns to the right-side panel.
        right: [
          // mobile (bottom-sheet)
          'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          // desktop (right panel)
          'md:inset-y-0 md:inset-x-auto md:right-0 md:bottom-auto',
          'md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-l md:border-t-0',
          'md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right',
          'md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0',
        ].join(' '),
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    {/* No overlay rendered here. The sheet is a side panel docked over the
        map — dimming the whole viewport (including the sidebar) hides the
        very controls the user is comparing against. Radix's onEscapeKeyDown
        and the close button still handle dismissal. */}
    <DialogPrimitive.Content
      ref={ref}
      onPointerDownOutside={(e) => {
        // Allow clicking on the map/sidebar without auto-closing the sheet;
        // the user can dismiss via the X button or Escape. This matches
        // how transit map apps (Citymapper, Google Maps) behave.
        e.preventDefault();
      }}
      className={cn(sheetVariants({ side }), 'flex flex-col', className)}
      {...props}
    >
      {/* Drag handle — visible only on mobile (bottom-sheet mode). Decorative
          for now; full swipe-to-dismiss is a follow-up. */}
      {side === 'right' && (
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30 md:hidden"
          aria-hidden="true"
        />
      )}
      {children}
      <DialogPrimitive.Close
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md opacity-70 ring-offset-background transition-opacity hover:bg-accent hover:opacity-100 focus-ring disabled:pointer-events-none"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 px-5 pt-5', className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-5 pb-5', className)}
      {...props}
    />
  );
}

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
