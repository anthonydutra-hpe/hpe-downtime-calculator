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
