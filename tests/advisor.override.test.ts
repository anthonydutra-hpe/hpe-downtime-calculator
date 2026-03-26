import { advise } from '../../lib/advisor'

describe('/api/advisor overrides', () => {
  test('returns same advisor output without overrides (backwards compatible)', () => {
    const inputs = {
      hasVMs: true,
      vmCount: 100,
      missionCriticalVmCount: 5,
      dataFootprintTB: 50,
      targetRTO: 8,
      targetRPO: 8,
      industry: 'other',
      requiresImmutability: false,
      requiresAirGap: false,
      annualRevenue: 10000000,
      pctRevenueImpacted: 10,
      employees: 50,
      avgHourlySalary: 40,
    }
    const calc = { lostRevenuePerHour: 10000, totalEstimatedCost: 100000 }

    // Without overrides
    const out1 = advise(inputs, calc)
    // With empty overrides
    const out2 = advise(inputs, calc, {})

    expect(out1.options.length).toBe(out2.options.length)
    expect(out1.path).toBe(out2.path)
  })

  test('lowering highVmCount threshold surfaces Option B where it would not otherwise', () => {
    const inputs = {
      hasVMs: true,
      vmCount: 150, // Below default threshold of 250
      missionCriticalVmCount: 3,
      dataFootprintTB: 50,
      targetRTO: 8,
      targetRPO: 8,
      industry: 'other',
      requiresImmutability: false,
      requiresAirGap: false,
      annualRevenue: 5000000,
      pctRevenueImpacted: 10,
      employees: 50,
      avgHourlySalary: 40,
    }
    const calc = { lostRevenuePerHour: 5000, totalEstimatedCost: 50000 }

    // Without override: vmCount 150 < default highVmCount 250, so no Option B
    const without = advise(inputs, calc)
    const hasOptionB1 = without.options.find((o: any) => o.code === 'Option B')

    // With override: highVmCount = 100, so vmCount 150 > 100, triggers Option B
    const withOverride = advise(inputs, calc, { highVmCount: 100 })
    const hasOptionB2 = withOverride.options.find((o: any) => o.code === 'Option B')

    // The override should cause Option B to appear
    expect(hasOptionB1).toBeFalsy()
    expect(hasOptionB2).toBeTruthy()
  })

  test('increasing largeDataFootprintTB threshold prevents Option C from surfacing', () => {
    const inputs = {
      hasVMs: true,
      vmCount: 50,
      missionCriticalVmCount: 2,
      dataFootprintTB: 600, // Larger than default 500
      targetRTO: 8,
      targetRPO: 8,
      industry: 'other',
      requiresImmutability: false,
      requiresAirGap: false,
      annualRevenue: 5000000,
      pctRevenueImpacted: 10,
      employees: 50,
      avgHourlySalary: 40,
    }
    const calc = { lostRevenuePerHour: 5000, totalEstimatedCost: 50000 }

    // Without override: 600 > 500, so Option C surfaces
    const without = advise(inputs, calc)
    const hasOptionC1 = without.options.find((o: any) => o.code === 'Option C')

    // With override: largeDataFootprintTB = 1000, 600 < 1000, so Option C does NOT surface
    const withOverride = advise(inputs, calc, { largeDataFootprintTB: 1000 })
    const hasOptionC2 = withOverride.options.find((o: any) => o.code === 'Option C')

    expect(hasOptionC1).toBeTruthy()
    expect(hasOptionC2).toBeFalsy()
  })

  test('overrides affect decision trace and confidence scores', () => {
    const inputs = {
      hasVMs: true,
      vmCount: 150,
      missionCriticalVmCount: 5,
      dataFootprintTB: 50,
      targetRTO: 1, // Very tight
      targetRPO: 1, // Very tight
      industry: 'other',
      requiresImmutability: false,
      requiresAirGap: false,
      annualRevenue: 10000000,
      pctRevenueImpacted: 10,
      employees: 50,
      avgHourlySalary: 40,
    }
    const calc = { lostRevenuePerHour: 10000, totalEstimatedCost: 100000 }

    // Lower the threshold to trigger RTO gap
    const withOverride = advise(inputs, calc, {
      tightRTOFor50: 0.5,
      tightRTOFor250: 2,
    })

    // Verify decision trace includes RTO gap
    const rtoGapTrace = withOverride.decisionTrace.find(
      (t: any) => t.rule.includes('rtoGap')
    )
    expect(rtoGapTrace).toBeTruthy()

    // Verify recommendations have confidence scores from the override
    withOverride.recommendedProducts.forEach((p: any) => {
      expect(p.confidence).toBeDefined()
      expect(typeof p.confidence).toBe('number')
    })
  })

  test('nested overrides for restoreAssumptions work correctly', () => {
    const inputs = {
      hasVMs: true,
      vmCount: 100,
      missionCriticalVmCount: 5,
      dataFootprintTB: 500,
      targetRTO: 0.5, // Very tight
      targetRPO: 0.5, // Very tight
      industry: 'other',
      requiresImmutability: false,
      requiresAirGap: false,
      annualRevenue: 20000000,
      pctRevenueImpacted: 15,
      employees: 100,
      avgHourlySalary: 50,
    }
    const calc = { lostRevenuePerHour: 20000, totalEstimatedCost: 200000 }

    // Improve restore speed
    const withOverride = advise(inputs, calc, {
      restoreAssumptions: {
        backupRestoreTBPerHour: 10, // Much faster than default 1.5
        snapshotRTOHours: 0.01,
        achievableBackupRPOHours: 0.5,
      },
    })

    // With faster restore, RTO gap should be resolved
    const rtoGap = withOverride.decisionTrace.find(
      (t: any) => t.rule === 'rtoGap detected'
    )
    expect(rtoGap?.evaluatedTo).toBe(false)
  })

  test('rulesUsed includes overrides', () => {
    const inputs = {
      hasVMs: false,
      vmCount: 0,
      missionCriticalVmCount: 0,
      dataFootprintTB: 10,
      targetRTO: 4,
      targetRPO: 4,
      industry: 'other',
      requiresImmutability: false,
      requiresAirGap: false,
    }
    const calc = { lostRevenuePerHour: 1000 }
    const customOverrides = { highVmCount: 50, largeDataFootprintTB: 100 }

    const result = advise(inputs, calc, customOverrides)

    expect(result.rulesUsed.highVmCount).toBe(50)
    expect(result.rulesUsed.largeDataFootprintTB).toBe(100)
    // Non-overridden rule should still be present
    expect(result.rulesUsed.smallMissionCriticalRatio).toBeDefined()
  })
})
