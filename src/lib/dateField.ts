// The date field's text <-> date conversions, pure (no React), so the field, the calendar and the tests share one definition.
// A date is written DD/MM/YYYY on screen and entered by hand or picked from the calendar; a field stores either that text ('dmy') or an ISO date ('iso').

export interface YmdParts {
  y: number;
  m: number;
  d: number;
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** A real calendar date (month 1-12, a day that exists in it, a four-digit year); undefined for anything else. */
export function validYmd(y: number, m: number, d: number): YmdParts | undefined {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d) || y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1) return undefined;
  return d <= daysInMonth(y, m) ? { y, m, d } : undefined;
}

export const daysInMonth = (y: number, m: number): number => new Date(y, m, 0).getDate();

/** DD/MM/YYYY (the separators / . - or a space are accepted) -> its date, or undefined when it is not a real date. */
export function parseDmy(text: string | undefined): YmdParts | undefined {
  const parts = /^(\d{1,2})[\s./-](\d{1,2})[\s./-](\d{4})$/.exec((text ?? '').trim());
  return parts ? validYmd(Number(parts[3]), Number(parts[2]), Number(parts[1])) : undefined;
}

/** YYYY-MM-DD (a time after it is ignored) -> its date, or undefined. */
export function parseIso(text: string | undefined): YmdParts | undefined {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec((text ?? '').trim());
  return parts ? validYmd(Number(parts[1]), Number(parts[2]), Number(parts[3])) : undefined;
}

export const toDmy = ({ y, m, d }: YmdParts): string => `${pad(d)}/${pad(m)}/${pad(y, 4)}`;
export const toIso = ({ y, m, d }: YmdParts): string => `${pad(y, 4)}-${pad(m)}-${pad(d)}`;

/** A stored value as the field shows it: an ISO date as DD/MM/YYYY, DD/MM/YYYY text as it is, anything unreadable as given. */
export function displayDate(stored: string | undefined, format: 'dmy' | 'iso'): string {
  if (!stored) return '';
  if (format === 'dmy') return stored;
  const parts = parseIso(stored);
  return parts ? toDmy(parts) : '';
}

/** Leaving the field tidies the date to DD/MM/YYYY (30112029 -> 30/11/2029, 1.2.2030 -> 01/02/2030); text that is not a date is left as typed. */
export function tidyDmy(text: string): string {
  const t = text.trim();
  const digits = /^\d{8}$/.exec(t);
  if (digits) return `${t.slice(0, 2)}/${t.slice(2, 4)}/${t.slice(4)}`;
  const parts = /^(\d{1,2})[\s./-](\d{1,2})[\s./-](\d{4})$/.exec(t);
  return parts ? `${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}/${parts[3]}` : text;
}

/** Compares two dates (negative: a is before b). */
export const compareYmd = (a: YmdParts, b: YmdParts): number => a.y - b.y || a.m - b.m || a.d - b.d;

/** Whether a date is inside the allowed range (either bound may be absent). */
export const inRange = (date: YmdParts, min?: YmdParts, max?: YmdParts): boolean => (!min || compareYmd(date, min) >= 0) && (!max || compareYmd(date, max) <= 0);

/** The date `days` after (or, negative, before) another. */
export function addDays({ y, m, d }: YmdParts, days: number): YmdParts {
  const next = new Date(y, m - 1, d + days);
  return { y: next.getFullYear(), m: next.getMonth() + 1, d: next.getDate() };
}

/** The date `months` after another, the day kept where the month has it and clamped to the month's last day where it does not. */
export function addMonths({ y, m, d }: YmdParts, months: number): YmdParts {
  const index = y * 12 + (m - 1) + months;
  const ny = Math.floor(index / 12);
  const nm = (index % 12 + 12) % 12 + 1;
  return { y: ny, m: nm, d: Math.min(d, daysInMonth(ny, nm)) };
}

/** The cells of a month grid: whole weeks starting on `weekStart` (0 Sunday ... 6 Saturday), with the neighbouring months' days filling the first and last week. */
export function monthGrid(y: number, m: number, weekStart = 6): YmdParts[] {
  const first = new Date(y, m - 1, 1).getDay();
  const lead = (first - weekStart + 7) % 7;
  const total = Math.ceil((lead + daysInMonth(y, m)) / 7) * 7;
  return Array.from({ length: total }, (_, i) => addDays({ y, m, d: 1 }, i - lead));
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
/** Saturday first: the Qatar working week. */
export const WEEKDAY_NAMES = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'] as const;
