import { calculate } from '../lib/calc'

test('calculate returns positive totals', ()=>{
  const inputs = { annualRevenue: 1000000, pctRevenueImpacted: 10, employees: 100, avgHourlySalary: 50, hoursDowntime: 2 }
  const out = calculate(inputs)
  expect(out.totalEstimatedCost).toBeGreaterThan(0)
})
