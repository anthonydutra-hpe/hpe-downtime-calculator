export interface CostEstimate {
  capex: {
    low: number
    mid: number
    high: number
  }
  opexPerYear: {
    low: number
    mid: number
    high: number
  }
  assumptions: Record<string, number>
  confidence: 'Low' | 'Medium' | 'High'
}

export function estimateCostForOption(
  optionCode: string,
  vmCount: number = 0,
  dataFootprintTB: number = 0
): CostEstimate {
  const vc = Math.max(0, vmCount)
  const tb = Math.max(0, dataFootprintTB)
  const tbScale = Math.max(1, tb / 100)

  const clamp = (v: number) => Math.round(v)

  switch (optionCode) {
    case 'Option A': {
      const perVmLow = 10000
      const perVmHigh = 30000
      const storeLow = 50000
      const storeHigh = 150000
      const capexLow = vc * perVmLow + storeLow * tbScale
      const capexHigh = vc * perVmHigh + storeHigh * tbScale
      const capexMid = Math.round((capexLow + capexHigh) / 2)
      const opexLow = Math.round(capexLow * 0.08)
      const opexMid = Math.round((capexLow * 0.08 + capexHigh * 0.12) / 2)
      const opexHigh = Math.round(capexHigh * 0.12)
      return {
        capex: {
          low: clamp(capexLow),
          mid: clamp(capexMid),
          high: clamp(capexHigh),
        },
        opexPerYear: {
          low: clamp(opexLow),
          mid: clamp(opexMid),
          high: clamp(opexHigh),
        },
        assumptions: { vmCount: vc, dataFootprintTB: tb },
        confidence: 'Medium',
      }
    }
    case 'Option B': {
      const clusterSize = 100
      const clusterCount = Math.max(1, Math.ceil(vc / clusterSize))
      const clusterLow = 50000
      const clusterHigh = 200000
      const storageLow = 150000
      const storageHigh = 500000
      const capexLow = clusterCount * clusterLow + storageLow * tbScale
      const capexHigh = clusterCount * clusterHigh + storageHigh * tbScale
      const capexMid = Math.round((capexLow + capexHigh) / 2)
      const opexLow = Math.round(capexLow * 0.1)
      const opexMid = Math.round((capexLow * 0.1 + capexHigh * 0.16) / 2)
      const opexHigh = Math.round(capexHigh * 0.16)
      return {
        capex: {
          low: clamp(capexLow),
          mid: clamp(capexMid),
          high: clamp(capexHigh),
        },
        opexPerYear: {
          low: clamp(opexLow),
          mid: clamp(opexMid),
          high: clamp(opexHigh),
        },
        assumptions: { vmCount: vc, clusterCount, dataFootprintTB: tb },
        confidence: 'Medium',
      }
    }
    case 'Option C': {
      const baseLow = 500000
      const baseHigh = 2000000
      const capexLow = baseLow * tbScale
      const capexHigh = baseHigh * tbScale
      const capexMid = Math.round((capexLow + capexHigh) / 2)
      const opexLow = Math.round(capexLow * 0.07)
      const opexMid = Math.round((capexLow * 0.07 + capexHigh * 0.12) / 2)
      const opexHigh = Math.round(capexHigh * 0.12)
      return {
        capex: {
          low: clamp(capexLow),
          mid: clamp(capexMid),
          high: clamp(capexHigh),
        },
        opexPerYear: {
          low: clamp(opexLow),
          mid: clamp(opexMid),
          high: clamp(opexHigh),
        },
        assumptions: { dataFootprintTB: tb },
        confidence: 'Low',
      }
    }
    case 'Option D': {
      const baseLow = 1500000
      const baseHigh = 6000000
      const capexLow = baseLow * tbScale
      const capexHigh = baseHigh * tbScale
      const capexMid = Math.round((capexLow + capexHigh) / 2)
      const opexLow = Math.round(capexLow * 0.06)
      const opexMid = Math.round((capexLow * 0.06 + capexHigh * 0.12) / 2)
      const opexHigh = Math.round(capexHigh * 0.12)
      return {
        capex: {
          low: clamp(capexLow),
          mid: clamp(capexMid),
          high: clamp(capexHigh),
        },
        opexPerYear: {
          low: clamp(opexLow),
          mid: clamp(opexMid),
          high: clamp(opexHigh),
        },
        assumptions: { dataFootprintTB: tb },
        confidence: 'Low',
      }
    }
    default:
      return {
        capex: { low: 0, mid: 0, high: 0 },
        opexPerYear: { low: 0, mid: 0, high: 0 },
        assumptions: { vmCount: vc, dataFootprintTB: tb },
        confidence: 'Low',
      }
  }
}
