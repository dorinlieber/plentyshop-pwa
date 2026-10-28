// Versandtage wie im DeliveryTimeWidget des bisherigen Shops: Annahmeschluss, kein Samstagsversand, Feiertage Sachsen.
// Gerechnet wird in deutscher Zeit, unabhängig von der Zeitzone des Besuchers.

import type { BerlinNow, ShippingInfo } from './types';

// Annahmeschluss in Minuten nach Mitternacht: 05:30, dann entstehen die Picklisten (Dorin 28.10.2026; LTS-Widget steht noch auf 06:00)
export const CUTOFF_MINUTES = 5 * 60 + 30;
export const SATURDAY_SHIPPING = false;

export const berlinNow = (date: Date): BerlinNow => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: part('year'),
    month: part('month'),
    day: part('day'),
    seconds: part('hour') * 3600 + part('minute') * 60 + part('second'),
  };
};

// Kalendertage als UTC-Mitternacht, damit Sommerzeit nicht hineinrechnet
const utcDay = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day));
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);
const key = (date: Date) => date.toISOString().slice(0, 10);

const easterSunday = (year: number) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcDay(year, month, day);
};

const holidayCache = new Map<number, Set<string>>();

export const saxonyHolidays = (year: number) => {
  const cached = holidayCache.get(year);
  if (cached) return cached;
  const easter = easterSunday(year);
  // Buß- und Bettag: Mittwoch zwischen dem 16. und 22. November
  const repentanceDay = Array.from({ length: 7 }, (_, n) => utcDay(year, 11, 16 + n)).find(
    (date) => date.getUTCDay() === 3,
  )!;
  const holidays = new Set(
    [
      utcDay(year, 1, 1),
      addDays(easter, -2),
      addDays(easter, 1),
      utcDay(year, 5, 1),
      addDays(easter, 39),
      addDays(easter, 50),
      utcDay(year, 10, 3),
      utcDay(year, 10, 31),
      repentanceDay,
      utcDay(year, 12, 25),
      utcDay(year, 12, 26),
    ].map(key),
  );
  holidayCache.set(year, holidays);
  return holidays;
};

export const isShippingDay = (date: Date) => {
  const weekday = date.getUTCDay();
  if (weekday === 0 || (weekday === 6 && !SATURDAY_SHIPPING)) return false;
  return !saxonyHolidays(date.getUTCFullYear()).has(key(date));
};

export const shippingInfo = (now: BerlinNow): ShippingInfo => {
  const today = utcDay(now.year, now.month, now.day);
  const secondsLeft = CUTOFF_MINUTES * 60 - now.seconds;
  if (secondsLeft > 0 && isShippingDay(today)) {
    return { minutesLeft: Math.floor(secondsLeft / 60), daysAhead: 0, shipDate: today };
  }
  let daysAhead = 1;
  while (!isShippingDay(addDays(today, daysAhead))) daysAhead++;
  return { minutesLeft: null, daysAhead, shipDate: addDays(today, daysAhead) };
};
