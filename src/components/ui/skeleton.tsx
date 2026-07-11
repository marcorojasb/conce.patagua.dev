import { cn } from '@/lib/utils';

// Standard skeleton block with a gradient shimmer sweep. Not sourced from an
// exact documented shadcn `shimmer` utility snippet — shadcn's shimmer
// utility (docs/utils/shimmer) targets *text* status labels (e.g.
// "Generando…"), not gray block placeholders, so it doesn't apply directly
// here. This is the standard hand-rolled block shimmer: an animated
// background-position sweep over a muted rectangle, respecting
// prefers-reduced-motion via Tailwind's motion-reduce variant.
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'animate-shimmer motion-reduce:animate-none rounded-md bg-[linear-gradient(110deg,hsl(var(--muted))_8%,hsl(var(--muted-foreground)/0.15)_18%,hsl(var(--muted))_33%)] bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
