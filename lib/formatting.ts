export const formatCurrency = (
  value?: number | null,
  opts?: { fractionDigits?: number }
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const fractionDigits = opts?.fractionDigits ?? 0;
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: fractionDigits,
  });
};

export const parseCurrency = (s: string): number | null => {
  if (!s && s !== '0') return null;
  // remove non-numeric except dot and minus
  const cleaned = String(s).replace(/[^0-9.-]/g, '');
  if (cleaned === '' || cleaned === '.' || cleaned === '-') return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
};

/**
 * Format a number with thousands separators, no currency symbol.
 * Used for non-currency numeric fields like employee count.
 */
export const formatNumber = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return Number(value).toLocaleString('en-US');
};

/**
 * Parse an integer string, removing non-digit characters.
 * Returns the integer as a number or null if invalid.
 */
export const parseInteger = (s: string): number | null => {
  if (!s) return null;
  // remove non-digit characters (allow leading minus for future use, but strip it here)
  const cleaned = String(s).replace(/[^0-9]/g, '');
  if (cleaned === '') return null;
  const n = parseInt(cleaned, 10);
  return Number.isNaN(n) ? null : n;
};
