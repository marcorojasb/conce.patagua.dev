// Hora actual que avanza sola. Las llegadas en vivo se descuentan contra ella
// entre una consulta y otra: sin este reloj, los minutos, la edad del dato y
// el vencimiento a los 10 min quedarían congelados hasta la próxima respuesta
// (5 min tras varias fallas).
//
// Con la pestaña oculta no avanza (nadie la mira y cada tic vuelve a dibujar
// quien la usa); al volver a la vista se pone al día en el acto.

import { useEffect, useState } from 'react';

export function useClock(tickMs: number, active = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    let id: number | null = null;
    const start = () => {
      setNow(Date.now());
      if (id == null) id = window.setInterval(() => setNow(Date.now()), tickMs);
    };
    const stop = () => {
      if (id != null) window.clearInterval(id);
      id = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [tickMs, active]);
  return now;
}
