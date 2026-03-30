import { formatCurrency } from '../lib/formatting'

describe('formatCurrency', () => {
  test('formats 1000 as $1,000', () => {
    expect(formatCurrency(1000)).toBe('$1,000')
  })

  test('formats 1000000 as $1,000,000', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000')
  })

  test('formats 0 as $0', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  test('formats null as em dash', () => {
    expect(formatCurrency(null)).toBe('—')
  })

  test('formats undefined as em dash', () => {
    expect(formatCurrency(undefined)).toBe('—')
  })

  test('formats NaN as em dash', () => {
    expect(formatCurrency(NaN)).toBe('—')
  })

  test('formats 50000 as $50,000', () => {
    expect(formatCurrency(50000)).toBe('$50,000')
  })
})

describe('formatCurrency with fraction digits', () => {
  test('formats with 2 fraction digits', () => {
    const { formatCurrency } = require('../lib/formatting')
    expect(formatCurrency(50.5, { fractionDigits: 2 })).toBe('$50.50')
  })

  test('formats with 0 fraction digits', () => {
    const { formatCurrency } = require('../lib/formatting')
    expect(formatCurrency(50.99, { fractionDigits: 0 })).toBe('$51')
  })
})
