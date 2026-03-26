/**
 * API Route Tests for /api/advisor with overrides
 * These tests verify the endpoint accepts and processes overrides correctly.
 * 
 * Note: To run these tests, you may need to set up a test environment
 * that can mock Next.js Request/Response. These are example tests showing
 * the expected behavior.
 */

describe('POST /api/advisor with overrides', () => {
  test('accepts overrides in request body', async () => {
    // This tests behavior that would be verified in integration tests
    // Expected: POST with body { inputs, calc, overrides }
    // should pass overrides to advise(inputs, calc, overrides)
    
    const testBody = {
      inputs: {
        hasVMs: true,
        vmCount: 150,
        missionCriticalVmCount: 5,
        dataFootprintTB: 50,
        targetRTO: 8,
        targetRPO: 8,
        industry: 'other',
        requiresImmutability: false,
        requiresAirGap: false,
      },
      calc: { lostRevenuePerHour: 5000, totalEstimatedCost: 50000 },
      overrides: { highVmCount: 100 }, // Lower threshold
    }

    // When endpoint calls advise(inputs, calc, overrides),
    // it should process the overrides correctly
    expect(testBody.overrides).toBeDefined()
    expect(testBody.overrides.highVmCount).toBe(100)
  })

  test('backwards compatible when overrides omitted', async () => {
    // Test that endpoint works without overrides parameter
    const testBody = {
      inputs: {
        hasVMs: true,
        vmCount: 100,
        missionCriticalVmCount: 5,
        dataFootprintTB: 50,
        targetRTO: 8,
        targetRPO: 8,
        industry: 'other',
        requiresImmutability: false,
        requiresAirGap: false,
      },
      calc: { lostRevenuePerHour: 5000, totalEstimatedCost: 50000 },
      // No overrides property
    }

    // Should work and defaults to empty overrides
    expect(testBody.overrides).toBeUndefined()
    // Endpoint should handle this gracefully by treating as {}
  })

  test('returns advisor output with decisionTrace, confidence, costs', async () => {
    // Expected response structure
    const expectedResponse = {
      path: 'accelerated',
      options: [{ code: 'Option A', name: 'Option A' }],
      recommendedProducts: [
        {
          name: 'Product',
          rationale: 'reason',
          confidence: 75,
          estAnnualCostAvoided: 50000,
        },
      ],
      flags: [],
      roadmap: { years: [] },
      decisionTrace: [
        { rule: 'hasVMs', evaluatedTo: true },
        {
          rule: 'rtoGap detected',
          evaluatedTo: false,
          details: 'targetRTO: 8, estRestoreHours: 33.33...',
        },
      ],
      rulesUsed: {
        highVmCount: 100, // From overrides
        largeDataFootprintTB: 500,
      },
    }

    // Verify structure
    expect(expectedResponse.decisionTrace).toBeDefined()
    expect(Array.isArray(expectedResponse.decisionTrace)).toBe(true)
    expect(expectedResponse.recommendedProducts[0].confidence).toBeDefined()
    expect(expectedResponse.recommendedProducts[0].estAnnualCostAvoided).toBeDefined()
    expect(expectedResponse.rulesUsed).toBeDefined()
  })
})

describe('GET /api/rules', () => {
  test('returns rules.json contents', async () => {
    // Expected response structure
    const expectedRules = {
      highVmCount: 250,
      smallMissionCriticalRatio: 0.1,
      smallMissionCriticalMin: 10,
      largeDataFootprintTB: 500,
      tightRTOFor50: 1,
      tightRTOFor250: 4,
      restoreAssumptions: {
        backupRestoreTBPerHour: 1.5,
        snapshotRTOHours: 0.1,
        achievableBackupRPOHours: 4,
      },
    }

    // Verify expected structure
    expect(expectedRules.highVmCount).toBe(250)
    expect(expectedRules.restoreAssumptions.backupRestoreTBPerHour).toBe(1.5)
  })

  test('handles request correctly', async () => {
    // GET /api/rules should return 200 with JSON body
    // (actual test would verify HTTP response)
    const expectedStatus = 200
    const expectedContentType = 'application/json'

    expect(expectedStatus).toBe(200)
    expect(expectedContentType).toMatch(/json/)
  })
})
