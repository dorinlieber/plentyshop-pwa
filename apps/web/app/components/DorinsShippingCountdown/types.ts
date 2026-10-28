export interface BerlinNow {
  year: number;
  month: number;
  day: number;
  seconds: number;
}

export interface ShippingInfo {
  // Minuten bis zum Annahmeschluss, wenn heute noch versendet wird, sonst null
  minutesLeft: number | null;
  daysAhead: number;
  shipDate: Date;
}
