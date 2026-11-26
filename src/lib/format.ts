/**
 * The one place a product turns money, dates and sizes into text, so the same value reads the same everywhere. The locale defaults to en-GB
 * (day-first dates, 24-hour time); pass another locale as the last argument. Currency is a code the caller names ("QAR 1,500"); an application
 * that has one currency binds it once in its own thin wrapper.
 */
export const DEFAULT_LOCALE = 'en-GB';
const LOCALE = DEFAULT_LOCALE;

const isEmpty = (v: unknown) => v === undefined || v === null || v === '';

/** "1,500" / "112.50" - an amount without its currency, for where "QAR" is drawn beside it: whole amounts have no decimals, fractional amounts always have two. */
export function formatAmount(amount: number): string {
  return Number.isInteger(amount)
    ? amount.toLocaleString(LOCALE)
    : amount.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** formatAmount for any value: a number, or text that holds one, is formatted; other text passes through. */
export function formatAmountAny(v: unknown): string {
  if (typeof v === 'number') return formatAmount(v);
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return formatAmount(Number(v));
  return String(v ?? '');
}

/** "QAR 1,500" - the currency code, then the amount: whole amounts have no decimals, fractional amounts always have two ("QAR 112.50"). */
export function formatMoney(currency: string, amount: number, opts: { nbsp?: boolean } = {}): string {
  return `${currency}${opts.nbsp ? '\u00a0' : ' '}${formatAmount(amount)}`;
}

/** formatMoney for any value: a number, or text that holds one ("12.5"), is formatted (two decimals when it has any); other text passes through after the currency. */
export function formatMoneyAny(currency: string, v: unknown): string {
  if (typeof v === 'number') return formatMoney(currency, v);
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return formatMoney(currency, Number(v));
  return `${currency} ${String(v ?? '')}`;
}

/** formatMoney for a value that may be missing or not a number: numbers format, other text passes through, empty is undefined. */
export function formatMoneyLoose(currency: string, v: unknown): string | undefined {
  if (isEmpty(v)) return undefined;
  return typeof v === 'number' ? formatMoney(currency, v) : `${currency} ${String(v)}`;
}

const toDate = (v: unknown): Date | undefined => {
  if (isEmpty(v)) return undefined;
  const d = v instanceof Date ? v : new Date(typeof v === 'number' ? v : String(v));
  return Number.isNaN(d.getTime()) ? undefined : d;
};

/** "12/03/2025" (dd/mm/yyyy). Unparseable text is returned as-is; empty is ''. */
export function formatDate(v: unknown): string {
  const d = toDate(v);
  if (!d) return isEmpty(v) ? '' : String(v);
  return d.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** "14:32" (24-hour). */
export function formatTime(v: unknown): string {
  const d = toDate(v);
  if (!d) return isEmpty(v) ? '' : String(v);
  return d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** "12/03/2025, 14:32". */
export function formatDateTime(v: unknown): string {
  const d = toDate(v);
  if (!d) return isEmpty(v) ? '' : String(v);
  return `${formatDate(d)}, ${formatTime(d)}`;
}

/** "03/2025" (mm/yyyy: a month with no day). */
export function formatMonthYear(v: unknown): string {
  const d = toDate(v);
  if (!d) return isEmpty(v) ? '' : String(v);
  return d.toLocaleDateString(LOCALE, { month: '2-digit', year: 'numeric' });
}

/** "3 pages" / "1 page" for a document whose page count is known; '' when it is not (an image, or a file whose pages cannot be counted). */
export const pagesLabel = (pageCount?: number): string => (pageCount ? `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}` : '');

/** "148 KB" or, for a document with a known page count, "148 KB · 3 pages". */
export const fileSizeLabel = (bytes: number, pageCount?: number): string => [formatBytes(bytes), pagesLabel(pageCount)].filter(Boolean).join(' · ');

/** "1.2 MB", "340 KB", "812 B". */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
