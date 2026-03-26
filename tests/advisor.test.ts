import { advise } from '../lib/advisor'

test('Option D surfaced when immutability required', () => {
  const inputs: any = {
    requiresImmutability: true,
    hasVMs: false,
    dataFootprintTB: 10,
    vmCount: 0,
    missionCriticalVmCount: 0,
    industry: 'other',
    targetRTO: 4,
    targetRPO: 4
  }
  const calc = { lostRevenuePerHour: 1000, totalEstimatedCost: 100000 }
  const out = advise(inputs, calc)

  // Verify Option D is present
  expect(out.options.find((o: any) => o.code === 'Option D')).toBeTruthy()

  // Verify decisionTrace is present and populated
  expect(out.decisionTrace).toBeDefined()
  expect(out.decisionTrace.length).toBeGreaterThan(0)

  // Verify immutability trace
  const immutabilityTrace = out.decisionTrace.find((t: any) => t.rule === 'requiresImmutability')
  expect(immutabilityTrace).toBeDefined()
  expect(immutabilityTrace.evaluatedTo).toBe(true)

  // Verify Cyber Resilience Vault recommendation has confidence >= 80 and cost avoided
  const vaultRec = out.recommendedProducts.find((p: any) => p.name.includes('Cyber Resilience Vault'))
  expect(vaultRec).toBeTruthy()
  expect(vaultRec.confidence).toBeGreaterThanOrEqual(80)
  expect(vaultRec.estAnnualCostAvoided).toBeGreaterThan(0)
})

test('decisionTrace includes all major evaluations', () => {
  const inputs: any = {
    hasVMs: true,
    vmCount: 300,
    missionCriticalVmCount: 5,
    dataFootprintTB: 600,
    targetRTO: 2,
    targetRPO: 2,
    industry: 'finance',
    requiresImmutability: false,
    requiresAirGap: false,
    annualRevenue: 50000000,
    pctRevenueImpacted: 20,
    employees: 100,
    avgHourlySalary: 75
  }
  const calc = {
    lostRevenuePerHour: 50000,
    totalEstimatedCost: 500000
  }
  const out = advise(inputs, calc)

  // Verify key rules are in trace
  const ruleNames = out.decisionTrace.map((t: any) => t.rule)
  expect(ruleNames).toContain('hasVMs')
  expect(ruleNames).toContain('missionCriticalVmCount > 0')
  expect(ruleNames).toContain('vmCount >= highVmCount')
  expect(ruleNames).toContain('dataFootprintTB >= largeDataFootprintTB')
  expect(ruleNames).toContain('rtoGap detected')
  expect(ruleNames).toContain('rpoGap detected')
  expect(ruleNames).toContain('strictIndustry (finance/healthcare)')
})

test('recommended products include confidence and cost estimates', () => {
  const inputs: any = {
    hasVMs: true,
    vmCount: 100,
    missionCriticalVmCount: 3,
    dataFootprintTB: 50,
    targetRTO: 8,
    targetRPO: 8,
    industry: 'other',
    requiresImmutability: false,
    requiresAirGap: false,
    annualRevenue: 10000000,
    pctRevenueImpacted: 10,
    employees: 50,
    avgHourlySalary: 40
  }
  const calc = {
    lostRevenuePerHour: 10000,
    totalEstimatedCost: 100000
  }
  const out = advise(inputs, calc)

  // Verify all recommended products have fields
  out.recommendedProducts.forEach((prod: any) => {
    expect(prod.name).toBeDefined()
    expect(prod.rationale).toBeDefined()
    expect(prod.confidence).toBeDefined()
    expect(typeof prod.confidence).toBe('number')
    expect(prod.confidence).toBeGreaterThan(0)
    expect(prod.confidence).toBeLessThanOrEqual(100)
    expect(prod.estAnnualCostAvoided).toBeDefined()
    expect(typeof prod.estAnnualCostAvoided).toBe('number')
    expect(prod.estAnnualCostAvoided).toBeGreaterThan(0)
  })

  // Verify Zerto is present and has confidence/cost
  const zerto = out.recommendedProducts.find((p: any) => p.name.includes('Zerto'))
  expect(zerto).toBeTruthy()
  expect(zerto.confidence).toBeGreaterThan(0)
  expect(zerto.estAnnualCostAvoided).toBeGreaterThan(0)
})

test('rulesUsed snapshot is populated', () => {
  const inputs: any = { hasVMs: false, vmCount: 0, missionCriticalVmCount: 0, dataFootprintTB: 10, targetRTO: 4, targetRPO: 4, industry: 'other', requiresImmutability: false, requiresAirGap: false }
  const calc = { lostRevenuePerHour: 1000 }
  const out = advise(inputs, calc)

  expect(out.rulesUsed).toBeDefined()
  expect(out.rulesUsed.highVmCount).toBeDefined()
  expect(out.rulesUsed.largeDataFootprintTB).toBeDefined()
  expect(out.rulesUsed.restoreAssumptions).toBeDefined()
})

test('advise accepts overrides parameter', () => {
  const inputs: any = { hasVMs: false, vmCount: 0, missionCriticalVmCount: 0, dataFootprintTB: 10, targetRTO: 4, targetRPO: 4, industry: 'other', requiresImmutability: false, requiresAirGap: false }
  const calc = { lostRevenuePerHour: 1000 }
  const overrides = { highVmCount: 100 }
  const out = advise(inputs, calc, overrides)

  expect(out.rulesUsed.highVmCount).toBe(100)
})
