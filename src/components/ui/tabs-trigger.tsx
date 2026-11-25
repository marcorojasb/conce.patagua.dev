import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-all focus-ring md:h-8',
      // Receta sutil de shadcn; la inactiva va en foreground/70 y no en
      // muted-foreground, que sobre bg-muted queda en 4,4:1 (bajo AA) en claro.
      'text-foreground/70 data-[state=inactive]:hover:text-foreground',
      'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
