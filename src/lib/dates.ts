// Format helpers for episode dates. Tolerant of missing/odd input —
// content authors may write either ISO strings or human strings.

const LONG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Format an air date as "9 January 1986".
 * Accepts ISO strings ("1986-01-09") or anything Date can parse.
 * Returns `null` if it can't be parsed.
 */
export function formatAirDate(input: string | undefined): string | null {
  if (!input) return null;
  // Build from explicit YYYY-MM-DD parts when possible to avoid timezone drift.
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (iso) {
    const [, y, m, d] = iso;
    const month = LONG_MONTHS[parseInt(m, 10) - 1];
    return `${parseInt(d, 10)} ${month} ${y}`;
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input; // fall back to raw text
  return `${date.getDate()} ${LONG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format a review date as "May 2026".
 * Accepts "2026-05", "2026-05-04", or human strings (returned verbatim).
 */
export function formatReviewDate(input: string | undefined): string | null {
  if (!input) return null;
  const ym = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(input);
  if (ym) {
    const [, y, m] = ym;
    const month = LONG_MONTHS[parseInt(m, 10) - 1];
    return `${month} ${y}`;
  }
  return input;
}
