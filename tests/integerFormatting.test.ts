import { formatNumber, parseInteger } from '@/lib/formatting';

describe('formatNumber', () => {
  test('formats number with thousands separators', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  test('formats larger numbers', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  test('formats single digit numbers', () => {
    expect(formatNumber(5)).toBe('5');
  });

  test('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  test('returns empty string for null', () => {
    expect(formatNumber(null)).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(formatNumber(undefined)).toBe('');
  });

  test('returns empty string for NaN', () => {
    expect(formatNumber(NaN)).toBe('');
  });

  test('handles decimal numbers with grouping', () => {
    // formatNumber keeps the decimal in display (not strictly an integer formatter, more a "grouped formatter")
    expect(formatNumber(1234.567)).toBe('1,234.567');
  });
});

describe('parseInteger', () => {
  test('parses simple integer string', () => {
    expect(parseInteger('1234')).toBe(1234);
  });

  test('parses number with comma separators', () => {
    expect(parseInteger('1,234')).toBe(1234);
  });

  test('strips non-digit characters', () => {
    expect(parseInteger('1$234#567')).toBe(1234567);
  });

  test('parses zero', () => {
    expect(parseInteger('0')).toBe(0);
  });

  test('returns null for empty string', () => {
    expect(parseInteger('')).toBeNull();
  });

  test('returns null for null input', () => {
    expect(parseInteger(null as any)).toBeNull();
  });

  test('returns null for string with no digits', () => {
    expect(parseInteger('$$$')).toBeNull();
  });

  test('handles leading zeros', () => {
    expect(parseInteger('001234')).toBe(1234);
  });

  test('round-trips with formatNumber', () => {
    const original = 123456;
    const formatted = formatNumber(original);
    const parsed = parseInteger(formatted);
    expect(parsed).toBe(original);
  });
});
