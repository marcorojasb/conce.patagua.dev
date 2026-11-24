// Hora actual que avanza sola. Las llegadas en vivo se descuentan contra ella
// entre una consulta y otra: sin este reloj, los minutos, la edad del dato y
// el vencimiento a los 10 min quedarían congelados hasta la próxima respuesta
// (5 min tras varias fallas, o nunca con la pestaña oculta).

import { useEffect, useState } from 'react';

export function useClock(tickMs: number, active = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs, active]);
  return now;
}
