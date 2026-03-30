import { estimateCostForOption, CostEstimate } from '../lib/costModel'

describe('costModel - estimateCostForOption', () => {
  test('returns valid cost estimate structure for Option A', () => {
    const result = estimateCostForOption('Option A', 50, 100)

    expect(result).toHaveProperty('capex')
    expect(result).toHaveProperty('opexPerYear')
    expect(result).toHaveProperty('assumptions')
    expect(result).toHaveProperty('confidence')

    expect(result.capex).toHaveProperty('low')
    expect(result.capex).toHaveProperty('mid')
    expect(result.capex).toHaveProperty('high')

    expect(result.opexPerYear).toHaveProperty('low')
    expect(result.opexPerYear).toHaveProperty('mid')
    expect(result.opexPerYear).toHaveProperty('high')
  })

  test('returns numbers for all cost fields', () => {
    const result = estimateCostForOption('Option A', 50, 100)

    expect(typeof result.capex.low).toBe('number')
    expect(typeof result.capex.mid).toBe('number')
    expect(typeof result.capex.high).toBe('number')
    expect(typeof result.opexPerYear.low).toBe('number')
    expect(typeof result.opexPerYear.mid).toBe('number')
    expect(typeof result.opexPerYear.high).toBe('number')
  })

  test('CAPEX increases with VM count for Option A', () => {
    const low = estimateCostForOption('Option A', 10, 100)
    const high = estimateCostForOption('Option A', 100, 100)

    expect(high.capex.low).toBeGreaterThan(low.capex.low)
    expect(high.capex.mid).toBeGreaterThan(low.capex.mid)
    expect(high.capex.high).toBeGreaterThan(low.capex.high)
  })

  test('CAPEX increases with data footprint for Option A', () => {
    const low = estimateCostForOption('Option A', 50, 50)
    const high = estimateCostForOption('Option A', 50, 200)

    expect(high.capex.low).toBeGreaterThan(low.capex.low)
    expect(high.capex.mid).toBeGreaterThan(low.capex.mid)
    expect(high.capex.high).toBeGreaterThan(low.capex.high)
  })

  test('Option B returns cluster count in assumptions', () => {
    const result = estimateCostForOption('Option B', 250, 100)

    expect(result.assumptions).toHaveProperty('clusterCount')
    expect(result.assumptions.clusterCount).toBeGreaterThan(0)
  })

  test('Option C has different cost range than Option A', () => {
    const optionA = estimateCostForOption('Option A', 50, 500)
    const optionC = estimateCostForOption('Option C', 50, 500)

    expect(optionC.capex.low).not.toBe(optionA.capex.low)
  })

  test('Option D (most expensive) > Option C > Option A', () => {
    const optionA = estimateCostForOption('Option A', 50, 500)
    const optionC = estimateCostForOption('Option C', 50, 500)
    const optionD = estimateCostForOption('Option D', 50, 500)

    expect(optionD.capex.mid).toBeGreaterThan(optionC.capex.mid)
    expect(optionC.capex.mid).toBeGreaterThan(optionA.capex.mid)
  })

  test('low <= mid <= high for all cost ranges', () => {
    const options = ['Option A', 'Option B', 'Option C', 'Option D']

    options.forEach((opt) => {
      const result = estimateCostForOption(opt, 50, 100)

      expect(result.capex.low).toBeLessThanOrEqual(result.capex.mid)
      expect(result.capex.mid).toBeLessThanOrEqual(result.capex.high)

      expect(result.opexPerYear.low).toBeLessThanOrEqual(result.opexPerYear.mid)
      expect(result.opexPerYear.mid).toBeLessThanOrEqual(result.opexPerYear.high)
    })
  })

  test('returns zero costs for unknown option', () => {
    const result = estimateCostForOption('Unknown Option', 50, 100)

    expect(result.capex.low).toBe(0)
    expect(result.capex.mid).toBe(0)
    expect(result.capex.high).toBe(0)
    expect(result.opexPerYear.low).toBe(0)
    expect(result.opexPerYear.mid).toBe(0)
    expect(result.opexPerYear.high).toBe(0)
  })

  test('handles zero inputs gracefully', () => {
    const result = estimateCostForOption('Option A', 0, 0)

    expect(result.capex.low).toBeGreaterThanOrEqual(0)
    expect(result.capex.mid).toBeGreaterThanOrEqual(0)
    expect(result.capex.high).toBeGreaterThanOrEqual(0)
  })

  test('OPEx is reasonable percentage of CAPEX', () => {
    const result = estimateCostForOption('Option A', 50, 100)

    const opexLowPct = (result.opexPerYear.low / result.capex.low) * 100
    const opexHighPct = (result.opexPerYear.high / result.capex.high) * 100

    // For Option A, should be between 8% and 12%
    expect(opexLowPct).toBeGreaterThanOrEqual(7)
    expect(opexHighPct).toBeLessThanOrEqual(13)
  })

  test('confidence levels are valid', () => {
    const validConfidence = ['Low', 'Medium', 'High']

    const options = ['Option A', 'Option B', 'Option C', 'Option D']
    options.forEach((opt) => {
      const result = estimateCostForOption(opt, 50, 100)
      expect(validConfidence).toContain(result.confidence)
    })
  })

  test('all returned values are integers (no decimals)', () => {
    const result = estimateCostForOption('Option B', 150, 750)

    expect(result.capex.low).toEqual(Math.round(result.capex.low))
    expect(result.capex.mid).toEqual(Math.round(result.capex.mid))
    expect(result.capex.high).toEqual(Math.round(result.capex.high))
    expect(result.opexPerYear.low).toEqual(Math.round(result.opexPerYear.low))
    expect(result.opexPerYear.mid).toEqual(Math.round(result.opexPerYear.mid))
    expect(result.opexPerYear.high).toEqual(Math.round(result.opexPerYear.high))
  })
})
