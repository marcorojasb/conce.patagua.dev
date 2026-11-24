// Los horarios GTFS (stop_times, frequencies) y las ventanas de operación son
// hora de Chile continental. `Date#getHours()`/`getDay()` usan la zona del
// navegador, así que un visitante fuera de Chile (o CI en UTC) vería el día y
// la hora corridos. Intl resuelve la hora de pared en America/Santiago,
// incluido el cambio CLT (-04) / CLST (-03).

const chileFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Santiago',
  hourCycle: 'h23',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export interface ChileClock {
  /** 0=lunes..6=domingo (mismo orden que RouteSchedule y STOP_FREQUENCY). */
  day: number;
  /** Minutos desde la medianoche en Chile; los segundos van como fracción. */
  minutes: number;
}

export function chileClock(date: Date): ChileClock {
  let day = 0;
  let hour = 0;
  let minute = 0;
  let second = 0;
  for (const part of chileFormatter.formatToParts(date)) {
    if (part.type === 'weekday') day = WEEKDAY_INDEX[part.value] ?? 0;
    else if (part.type === 'hour') hour = Number(part.value) % 24; // algunos motores emiten "24" a medianoche
    else if (part.type === 'minute') minute = Number(part.value);
    else if (part.type === 'second') second = Number(part.value);
  }
  return { day, minutes: hour * 60 + minute + second / 60 };
}
