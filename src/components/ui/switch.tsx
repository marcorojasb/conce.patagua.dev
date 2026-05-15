import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50',
      // Solid colors instead of opacity-modulated. The previous attempt
      // (bg-muted-foreground/20) composited with bg-background to ~9 %
      // contrast in dark mode — basically invisible. Now: checked =
      // filled primary, unchecked = card-colored fill with a hard
      // muted-foreground border. Reads clearly as "empty toggle" vs
      // "filled toggle" in both themes.
      'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
      'data-[state=unchecked]:border-muted-foreground data-[state=unchecked]:bg-card',
      className,
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
        'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;
