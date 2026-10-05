import { HttpError } from './middleware/errors';

/** Today's date as YYYY-MM-DD (server local time). */
export function todayString() {
  return new Date().toLocaleDateString('en-CA');
}

/** Parses YYYY-MM-DD into a UTC-midnight Date (matches Postgres DATE columns). */
export function localDate(input?: string) {
  const s = input || todayString();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new HttpError(400, 'Invalid date, expected YYYY-MM-DD');
  const d = new Date(`${s}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, 'Invalid date');
  return d;
}

export function dateString(d: Date) {
  return d.toISOString().slice(0, 10);
}
