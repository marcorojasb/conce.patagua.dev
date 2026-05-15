import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import './index.css';

const App = lazy(() => import('./App'));
const WikiApp = lazy(() => import('./wiki/wiki-app'));

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Tiny path-based switch: /wiki and /wiki/* render the wiki, everything
// else renders the visor. Both are lazy chunks so users only download the
// app they actually opened. Internal navigation between visor and wiki
// uses regular <a href="/"> / <a href="/wiki"> — full reload is fine
// because they're independent products.
function pickApp(): JSX.Element {
  if (window.location.pathname.startsWith('/wiki')) {
    return <WikiApp />;
  }
  return <App />;
}

createRoot(rootElement).render(
  <StrictMode>
    <TooltipProvider delayDuration={200}>
      <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">Cargando…</div>}>
        {pickApp()}
      </Suspense>
    </TooltipProvider>
  </StrictMode>,
);
