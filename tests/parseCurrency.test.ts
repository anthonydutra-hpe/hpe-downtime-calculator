import { parseCurrency } from '../lib/formatting'

describe('parseCurrency', () => {
  test('parses $1,000 as 1000', () => {
    expect(parseCurrency('$1,000')).toBe(1000)
  })

  test('parses 1000 as 1000', () => {
    expect(parseCurrency('1000')).toBe(1000)
  })

  test('parses 1,234.56 as 1234.56', () => {
    expect(parseCurrency('1,234.56')).toBe(1234.56)
  })

  test('parses $10,000.99 as 10000.99', () => {
    expect(parseCurrency('$10,000.99')).toBe(10000.99)
  })

  test('parses empty string as null', () => {
    expect(parseCurrency('')).toBe(null)
  })

  test('parses "0" as 0', () => {
    expect(parseCurrency('0')).toBe(0)
  })

  test('parses "abc" as null', () => {
    expect(parseCurrency('abc')).toBe(null)
  })

  test('parses "-1000" as -1000', () => {
    expect(parseCurrency('-1000')).toBe(-1000)
  })

  test('parses "50.5" as 50.5', () => {
    expect(parseCurrency('50.5')).toBe(50.5)
  })
})
