/**
 * Simulation Helper: Deterministic "what-if" scenario builder
 * 
 * Each simulation applies small, documented changes to model the effect
 * of adopting a particular solution option. Changes are designed to be:
 * - Deterministic (same input → same output)
 * - Minimal (single lever or small change per option)
 * - Explainable (simulationNote describes the change)
 */

export interface SimulationResult {
  simulatedInputs: any
  simCalc: any
  simAdvice: any
  error?: string
}

/**
 * Simulate the effect of adopting an option.
 * Returns a deep copy of inputs with deterministic modifications.
 */
export function simulateOptionBehavior(optionCode: string, inputs: any): any {
  const copy = JSON.parse(JSON.stringify(inputs || {}))
  let note = ''

  switch (optionCode) {
    case 'Option A': {
      // Option A: Per-VM backup appliances
      // Simulation: Increase mission-critical VM protection targeting
      // This models the effect of targeting a larger slice of VMs with backup
      const vmCount = copy.vmCount ?? 0
      copy.missionCriticalVmCount = Math.min(
        vmCount,
        Math.max(10, Math.ceil(vmCount * 0.15))
      )
      note =
        'Targeting a larger mission-critical subset (15% of VMs) to model expanded backup coverage with per-VM appliances.'
      break
    }

    case 'Option B': {
      // Option B: Zerto continuous replication
      // Simulation: Tighten RTO and RPO to model DR capabilities
      // Zerto dramatically improves these metrics
      if (copy.targetRTO != null) {
        copy.targetRTO = Math.max(0.5, (copy.targetRTO || 4) * 0.5)
      }
      if (copy.targetRPO != null) {
        copy.targetRPO = Math.max(0.25, (copy.targetRPO || 4) * 0.5)
      }
      note =
        'Tightening RTO/RPO targets (50% reduction) to model Zerto continuous replication capabilities for faster recovery.'
      break
    }

    case 'Option C': {
      // Option C: Alletra MP X10000
      // Simulation: Increase data footprint 20% to model storage consolidation
      // X10000 is a high-throughput appliance often used for consolidation
      copy.dataFootprintTB = Math.round((copy.dataFootprintTB || 100) * 1.2)
      note =
        'Increasing data footprint 20% to simulate storage consolidation onto Alletra MP X10000 high-performance platform.'
      break
    }

    case 'Option D': {
      // Option D: Cyber Resilience Vault
      // Simulation: Enable immutability and air-gap requirements
      // These are core features of vault-based backup
      copy.requiresImmutability = true
      copy.requiresAirGap = true
      note =
        'Enabling immutability + air-gap to model Cyber Resilience Vault posture (core ransomware defense features).'
      break
    }

    default:
      note = 'No simulation changes applied.'
  }

  copy.simulationNote = note
  return copy
}

/**
 * Run a full simulation: modify inputs, call calc and advisor,
 * and return comparison data.
 */
export async function runSimulation(
  optionCode: string,
  currentInputs: any,
  overrides?: any
): Promise<SimulationResult> {
  try {
    const simulatedInputs = simulateOptionBehavior(optionCode, currentInputs)

    // Call /api/calc
    const calcResp = await fetch('/api/calc', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(simulatedInputs),
    })
    if (!calcResp.ok) throw new Error('calc API failed')
    const simCalc = await calcResp.json()

    // Call /api/advisor
    const advResp = await fetch('/api/advisor', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        inputs: simulatedInputs,
        calc: simCalc,
        overrides: overrides || {},
      }),
    })
    if (!advResp.ok) throw new Error('advisor API failed')
    const simAdvice = await advResp.json()

    return { simulatedInputs, simCalc, simAdvice }
  } catch (err: any) {
    return {
      simulatedInputs: {},
      simCalc: {},
      simAdvice: {},
      error: err.message || 'Simulation failed',
    }
  }
}
