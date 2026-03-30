import { simulateOptionBehavior, runSimulation } from '@/helpers/simulation';

describe('simulateOptionBehavior', () => {
  const baseInputs = {
    vmCount: 100,
    missionCriticalVmCount: 0,
    targetRTO: 4,
    targetRPO: 4,
    dataFootprintTB: 100,
    requiresImmutability: false,
    requiresAirGap: false,
    annualRevenue: 1000000,
    lostRevenuePerHour: 1000,
    employees: 500,
    avgHourlySalary: 50,
  };

  describe('Option A - Mission-Critical Targeting', () => {
    test('sets missionCriticalVmCount to 15% of total VMs', () => {
      const result = simulateOptionBehavior('Option A', baseInputs);
      expect(result.missionCriticalVmCount).toBe(15); // ceil(100 * 0.15) = 15
    });

    test('enforces minimum of 10 mission-critical VMs', () => {
      const smallInputs = { ...baseInputs, vmCount: 50 };
      const result = simulateOptionBehavior('Option A', smallInputs);
      expect(result.missionCriticalVmCount).toBe(10);
    });

    test('does not exceed vmCount', () => {
      const smallInputs = { ...baseInputs, vmCount: 20 };
      const result = simulateOptionBehavior('Option A', smallInputs);
      expect(result.missionCriticalVmCount).toBeLessThanOrEqual(20);
    });

    test('adds simulation note', () => {
      const result = simulateOptionBehavior('Option A', baseInputs);
      expect(result.simulationNote).toContain('mission-critical');
    });

    test('preserves other fields', () => {
      const result = simulateOptionBehavior('Option A', baseInputs);
      expect(result.vmCount).toBe(100);
      expect(result.dataFootprintTB).toBe(100);
    });
  });

  describe('Option B - RTO/RPO Tightening', () => {
    test('reduces targetRTO by 50%', () => {
      const result = simulateOptionBehavior('Option B', baseInputs);
      expect(result.targetRTO).toBe(2);
    });

    test('reduces targetRPO by 50%', () => {
      const result = simulateOptionBehavior('Option B', baseInputs);
      expect(result.targetRPO).toBe(2);
    });

    test('enforces minimum RTO of 0.5', () => {
      const smallInputs = { ...baseInputs, targetRTO: 0.8 };
      const result = simulateOptionBehavior('Option B', smallInputs);
      expect(result.targetRTO).toBe(0.5);
    });

    test('enforces minimum RPO of 0.25', () => {
      const smallInputs = { ...baseInputs, targetRPO: 0.4 };
      const result = simulateOptionBehavior('Option B', smallInputs);
      expect(result.targetRPO).toBe(0.25);
    });

    test('adds simulation note about RTO/RPO', () => {
      const result = simulateOptionBehavior('Option B', baseInputs);
      expect(result.simulationNote).toContain('RTO/RPO');
    });
  });

  describe('Option C - Storage Consolidation', () => {
    test('increases dataFootprintTB by 20%', () => {
      const result = simulateOptionBehavior('Option C', baseInputs);
      expect(result.dataFootprintTB).toBe(120); // 100 * 1.2 = 120
    });

    test('rounds data footprint to integer', () => {
      const oddInputs = { ...baseInputs, dataFootprintTB: 77 };
      const result = simulateOptionBehavior('Option C', oddInputs);
      expect(result.dataFootprintTB).toBeCloseTo(92, 0);
    });

    test('adds simulation note about consolidation', () => {
      const result = simulateOptionBehavior('Option C', baseInputs);
      expect(result.simulationNote).toContain('consolidation');
    });

    test('preserves RTO/RPO', () => {
      const result = simulateOptionBehavior('Option C', baseInputs);
      expect(result.targetRTO).toBe(4);
      expect(result.targetRPO).toBe(4);
    });
  });

  describe('Option D - Immutability + Air-Gap Vault', () => {
    test('sets requiresImmutability to true', () => {
      const result = simulateOptionBehavior('Option D', baseInputs);
      expect(result.requiresImmutability).toBe(true);
    });

    test('sets requiresAirGap to true', () => {
      const result = simulateOptionBehavior('Option D', baseInputs);
      expect(result.requiresAirGap).toBe(true);
    });

    test('preserves other requirements', () => {
      const inputsWithPreexisting = {
        ...baseInputs,
        requiresImmutability: false,
        requiresAirGap: false,
      };
      const result = simulateOptionBehavior('Option D', inputsWithPreexisting);
      expect(result.requiresImmutability).toBe(true);
      expect(result.requiresAirGap).toBe(true);
    });

    test('adds simulation note about vault', () => {
      const result = simulateOptionBehavior('Option D', baseInputs);
      expect(result.simulationNote).toContain('immutability');
    });
  });

  describe('Deep copying and isolation', () => {
    test('does not mutate input object', () => {
      const original = { ...baseInputs };
      const copy = JSON.parse(JSON.stringify(baseInputs));
      simulateOptionBehavior('Option A', baseInputs);
      expect(baseInputs).toEqual(copy);
    });

    test('returns independent object', () => {
      const result1 = simulateOptionBehavior('Option A', baseInputs);
      const result2 = simulateOptionBehavior('Option A', baseInputs);
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('Edge cases and null handling', () => {
    test('handles undefined inputs gracefully', () => {
      const result = simulateOptionBehavior('Option A', {});
      expect(result).toBeDefined();
      // With no vmCount, 15% of 0 = 0, and Max(10, 0) = 10, but Min(0, 10) = 0
      // because vmCount defaults to 0
      expect(result.missionCriticalVmCount).toBe(0);
    });

    test('handles empty inputs with explicit vmCount', () => {
      const result = simulateOptionBehavior('Option A', { vmCount: 100 });
      expect(result.missionCriticalVmCount).toBe(15);
    });

    test('unknown option codes pass through unchanged', () => {
      const result = simulateOptionBehavior('Option E', baseInputs);
      expect(result.missionCriticalVmCount).toBe(0);
      expect(result.targetRTO).toBe(4);
      expect(result.dataFootprintTB).toBe(100);
    });

    test('includes simulationNote even for unknown options', () => {
      const result = simulateOptionBehavior('Option E', baseInputs);
      expect(result.simulationNote).toBe('No simulation changes applied.');
    });
  });
});

describe('runSimulation', () => {
  const baseInputs = {
    vmCount: 100,
    missionCriticalVmCount: 0,
    targetRTO: 4,
    targetRPO: 4,
    dataFootprintTB: 100,
    requiresImmutability: false,
    requiresAirGap: false,
  };

  // Mock fetch globally
  const mockFetch = jest.fn();
  global.fetch = mockFetch as any;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('calls /api/calc with simulated inputs', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalEstimatedCost: 100000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ path: 'premium' }),
      });

    await runSimulation('Option A', baseInputs);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    const firstCall = mockFetch.mock.calls[0];
    expect(firstCall[0]).toBe('/api/calc');
    expect(firstCall[1].method).toBe('POST');
  });

  test('calls /api/advisor with simulated data', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalEstimatedCost: 100000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ path: 'premium' }),
      });

    const result = await runSimulation('Option A', baseInputs);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    const secondCall = mockFetch.mock.calls[1];
    expect(secondCall[0]).toBe('/api/advisor');
  });

  test('returns SimulationResult with all fields', async () => {
    const mockCalc = { totalEstimatedCost: 150000, perHour: 50 };
    const mockAdvice = { path: 'premium', options: ['Option A', 'Option B'] };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCalc,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAdvice,
      });

    const result = await runSimulation('Option A', baseInputs);

    expect(result.simulatedInputs).toBeDefined();
    expect(result.simulatedInputs.missionCriticalVmCount).toBe(15);
    expect(result.simCalc).toEqual(mockCalc);
    expect(result.simAdvice).toEqual(mockAdvice);
    expect(result.error).toBeUndefined();
  });

  test('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await runSimulation('Option A', baseInputs);

    expect(result.error).toBeDefined();
    expect(result.error).toContain('Network error');
  });

  test('handles calc API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    const result = await runSimulation('Option A', baseInputs);

    expect(result.error).toBeDefined();
    expect(result.error).toContain('calc API failed');
  });

  test('includes overrides in advisor request when provided', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalEstimatedCost: 100000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ path: 'premium' }),
      });

    const overrides = { confidenceOverride: 95 };
    await runSimulation('Option A', baseInputs, overrides);

    const secondCall = mockFetch.mock.calls[1];
    const body = JSON.parse(secondCall[1].body);
    expect(body.overrides).toEqual(overrides);
  });
});
