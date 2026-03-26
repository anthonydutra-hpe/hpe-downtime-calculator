import rules from './rules.json'

interface DecisionTraceEntry {
  rule: string
  evaluatedTo: boolean
  details?: string
}

interface RecommendedProduct {
  name: string
  rationale: string
  confidence?: number
  estAnnualCostAvoided?: number
}

export function advise(inputs: any, calc: any, overrides: any = {}) {
  const r = { ...rules, ...overrides } as any
  const decisionTrace: DecisionTraceEntry[] = []
  const out: any = {
    path: 'starter',
    options: [],
    recommendedProducts: [],
    flags: [],
    roadmap: { years: [] },
    decisionTrace: [],
    rulesUsed: r
  }

  // Helper to calculate base cost
  const getTotalCost = () => {
    if (calc?.totalEstimatedCost > 0) return calc.totalEstimatedCost
    const lrph = Number(calc?.lostRevenuePerHour || 0)
    return lrph * 8760 * 0.01 // tiny fallback estimate
  }

  // Helper to add decision trace entry
  const addTrace = (rule: string, evaluatedTo: boolean, details?: string) => {
    decisionTrace.push({ rule, evaluatedTo, details })
  }

  // Helper to calculate confidence for an option based on triggers
  const calculateConfidence = (
    optionCode: string,
    triggers: { rule: string; weight: number }[]
  ): number => {
    const baseConfidence: Record<string, number> = {
      'Option A': 55,
      'Option B': 70,
      'Option C': 60,
      'Option D': 75
    }
    let conf = baseConfidence[optionCode] || 55

    // Apply trigger bonuses
    triggers.forEach(({ rule, weight }) => {
      const isComplianceTrigger =
        rule.includes('Immutability') ||
        rule.includes('AirGap') ||
        rule.includes('Industry') ||
        rule.includes('RTO') ||
        rule.includes('RPO')
      if (isComplianceTrigger) conf += weight
    })

    // Cap at 100
    return Math.min(conf, 100)
  }

  // Helper to calculate estimated annual cost avoided
  const calcEstAnnualCostAvoided = (optionCode: string): number => {
    const impactFactors: Record<string, number> = {
      'Option A': 0.25,
      'Option B': 0.6,
      'Option C': 0.2,
      'Option D': 0.75
    }
    const totalCost = getTotalCost()
    const factor = impactFactors[optionCode] || 0.15
    return Math.min(totalCost * factor, totalCost * 0.9)
  }

  // Path selection
  const lrph = Number(calc?.lostRevenuePerHour || 0)
  if (inputs.annualRevenue > 100000000 || lrph > 100000) out.path = 'aggressive'
  else if (lrph >= 10000 && lrph <= 100000) out.path = 'accelerated'
  else out.path = 'starter'

  // === DECISION TRACE EVALUATIONS ===

  // 1. hasVMs check
  const hasVMs = Boolean(inputs.hasVMs)
  addTrace('hasVMs', hasVMs)

  // 2. missionCriticalVmCount check
  const missionCriticalVmCount = Number(inputs.missionCriticalVmCount || 0)
  const hasMissionCritical = missionCriticalVmCount > 0
  addTrace('missionCriticalVmCount > 0', hasMissionCritical, `Count: ${missionCriticalVmCount}`)

  // 3. vmCount high check
  const vmCount = Number(inputs.vmCount || 0)
  const vmCountHigh = vmCount >= r.highVmCount
  addTrace('vmCount >= highVmCount', vmCountHigh, `vmCount: ${vmCount}, threshold: ${r.highVmCount}`)

  // 4. Very tight RTO with many VMs
  const veryTightRTOMany =
    (vmCount >= 50 && Number(inputs.targetRTO || 999) <= r.tightRTOFor50) ||
    (vmCount >= 250 && Number(inputs.targetRTO || 999) <= r.tightRTOFor250)
  addTrace('veryTightRTOMany', veryTightRTOMany, `vmCount: ${vmCount}, targetRTO: ${inputs.targetRTO}`)

  // 5. Large data footprint
  const dataFootprintTB = Number(inputs.dataFootprintTB || 0)
  const isLargeData = dataFootprintTB >= r.largeDataFootprintTB
  addTrace('dataFootprintTB >= largeDataFootprintTB', isLargeData, `TB: ${dataFootprintTB}, threshold: ${r.largeDataFootprintTB}`)

  // 6. Compliance/Industry strict check
  const requiresImmutability = Boolean(inputs.requiresImmutability)
  const requiresAirGap = Boolean(inputs.requiresAirGap)
  const strictIndustry = inputs.industry === 'finance' || inputs.industry === 'healthcare'
  const needsCompliance = requiresImmutability || requiresAirGap || strictIndustry
  addTrace('requiresImmutability', requiresImmutability)
  addTrace('requiresAirGap', requiresAirGap)
  addTrace('strictIndustry (finance/healthcare)', strictIndustry, `Industry: ${inputs.industry}`)

  // 7. RTO/RPO gaps
  const estRestoreHours = dataFootprintTB / r.restoreAssumptions.backupRestoreTBPerHour
  const rtoGap = Number(inputs.targetRTO) < Math.min(estRestoreHours, r.restoreAssumptions.snapshotRTOHours)
  const rpoGap = Number(inputs.targetRPO) < r.restoreAssumptions.achievableBackupRPOHours
  addTrace('rtoGap detected', rtoGap, `targetRTO: ${inputs.targetRTO}, estRestoreHours: ${estRestoreHours}, snapshotRTO: ${r.restoreAssumptions.snapshotRTOHours}`)
  addTrace('rpoGap detected', rpoGap, `targetRPO: ${inputs.targetRPO}, achievableRPO: ${r.restoreAssumptions.achievableBackupRPOHours}`)

  // === BUILD OPTIONS AND RECOMMENDATIONS ===

  const optionsTriggered: Set<string> = new Set()

  // Always-on VM rule
  if (hasVMs) {
    const zertoConf = calculateConfidence('Option A', [
      { rule: 'hasVMs', weight: 5 },
      ...(hasMissionCritical ? [{ rule: 'missionCriticalVmCount', weight: 10 }] : [])
    ])
    const zertoCost = calcEstAnnualCostAvoided('Option A')
    out.recommendedProducts.push({
      name: 'Zerto',
      rationale: 'VM protection; included because hasVMs === true',
      confidence: zertoConf,
      estAnnualCostAvoided: zertoCost
    })

    if (hasMissionCritical) {
      out.recommendedProducts.push({
        name: 'Zerto (mission-critical)',
        rationale: 'Protects mission-critical VMs as the mission-critical VM protection/DR layer.',
        confidence: Math.min(zertoConf + 15, 100),
        estAnnualCostAvoided: zertoCost * 1.2
      })
    }
  }

  // Option D priority (compliance)
  if (needsCompliance) {
    optionsTriggered.add('Option D')
    out.options.push({ code: 'Option D', name: 'HPE Cyber Resilience Vault (full stack)' })
    const optDConf = calculateConfidence('Option D', [{ rule: 'Compliance', weight: 20 }])
    const optDCost = calcEstAnnualCostAvoided('Option D')
    out.recommendedProducts.push({
      name: 'HPE Cyber Resilience Vault',
      rationale: 'Required due to immutability/air-gap/compliance.',
      confidence: optDConf,
      estAnnualCostAvoided: optDCost
    })
  }

  // Option C check (large data)
  if (isLargeData) {
    optionsTriggered.add('Option C')
    out.options.push({ code: 'Option C', name: 'Alletra MP X10000 with DPA' })
    const optCConf = calculateConfidence('Option C', [{ rule: 'largeDataFootprint', weight: 15 }])
    const optCCost = calcEstAnnualCostAvoided('Option C')
    out.recommendedProducts.push({
      name: 'Alletra MP X10000',
      rationale: 'Large data footprint requires scale and DPA.',
      confidence: optCConf,
      estAnnualCostAvoided: optCCost
    })
  }

  // RTO/RPO gap escalation
  if (rtoGap || rpoGap) {
    out.flags.push('RTO/RPO gap detected')
    if (!optionsTriggered.has('Option B')) {
      optionsTriggered.add('Option B')
      out.options.push({ code: 'Option B', name: 'Zerto + Alletra MP B10000 + StoreOnce + Cloud Bank' })
    }
    const optBConf = calculateConfidence('Option B', [
      { rule: 'rtoGap', weight: 20 },
      { rule: 'rpoGap', weight: 20 }
    ])
    const optBCost = calcEstAnnualCostAvoided('Option B')
    out.recommendedProducts.push({
      name: 'Option B stack (RTO/RPO)',
      rationale: 'Escalation due to RTO/RPO gap.',
      confidence: optBConf,
      estAnnualCostAvoided: optBCost
    })
  }

  // Option B triggers (high VM count, tight RTOs, high economics)
  if (vmCountHigh || veryTightRTOMany || lrph > 100000) {
    if (!optionsTriggered.has('Option B')) {
      optionsTriggered.add('Option B')
      out.options.push({ code: 'Option B', name: 'Zerto (DR) + Alletra MP B10000 + StoreOnce + Cloud Bank' })
    }
    const triggers = [
      ...(vmCountHigh ? [{ rule: 'highVmCount', weight: 15 }] : []),
      ...(veryTightRTOMany ? [{ rule: 'veryTightRTOMany', weight: 20 }] : []),
      ...(lrph > 100000 ? [{ rule: 'highEconomics', weight: 15 }] : [])
    ]
    const optBConf = calculateConfidence('Option B', triggers)
    const optBCost = calcEstAnnualCostAvoided('Option B')
    if (!out.recommendedProducts.find((p: RecommendedProduct) => p.name.includes('Option B'))) {
      out.recommendedProducts.push({
        name: 'Option B stack',
        rationale: 'High VM count, very tight RTOs, or very high economics.',
        confidence: optBConf,
        estAnnualCostAvoided: optBCost
      })
    }
  }

  // Option A conditions (moderate economics, small mission-critical ratio)
  const maxSmallMission = Math.max(r.smallMissionCriticalMin, Math.ceil(vmCount * r.smallMissionCriticalRatio))
  const econModerate = lrph < 100000
  const missionSmallRelative = missionCriticalVmCount <= maxSmallMission
  if (missionSmallRelative && econModerate && !optionsTriggered.has('Option B')) {
    if (!optionsTriggered.has('Option A')) {
      optionsTriggered.add('Option A')
      out.options.push({ code: 'Option A', name: 'Alletra MP B10000 + StoreOnce + Zerto' })
      const optAConf = calculateConfidence('Option A', [
        { rule: 'smallMissionCritical', weight: 10 },
        { rule: 'moderateEconomics', weight: 5 }
      ])
      const optACost = calcEstAnnualCostAvoided('Option A')
      out.recommendedProducts.push({
        name: 'Option A stack',
        rationale: 'Balanced protection for moderate-scale environments.',
        confidence: optAConf,
        estAnnualCostAvoided: optACost
      })
    }
  }

  // Final tidy: if none options, surface best-fit by path
  if (out.options.length === 0) {
    if (out.path === 'aggressive') {
      optionsTriggered.add('Option B')
      out.options.push({ code: 'Option B', name: 'Option B' })
      const optBConf = calculateConfidence('Option B', [{ rule: 'aggressivePath', weight: 5 }])
      const optBCost = calcEstAnnualCostAvoided('Option B')
      out.recommendedProducts.push({
        name: 'Option B (default aggressive)',
        rationale: 'Default recommendation for aggressive path.',
        confidence: optBConf,
        estAnnualCostAvoided: optBCost
      })
    } else if (out.path === 'accelerated') {
      optionsTriggered.add('Option A')
      out.options.push({ code: 'Option A', name: 'Option A' })
      const optAConf = calculateConfidence('Option A', [{ rule: 'acceleratedPath', weight: 5 }])
      const optACost = calcEstAnnualCostAvoided('Option A')
      out.recommendedProducts.push({
        name: 'Option A (default accelerated)',
        rationale: 'Default recommendation for accelerated path.',
        confidence: optAConf,
        estAnnualCostAvoided: optACost
      })
    } else {
      optionsTriggered.add('Option A')
      out.options.push({ code: 'Option A', name: 'Option A' })
      const optAConf = calculateConfidence('Option A', [{ rule: 'starterPath', weight: 5 }])
      const optACost = calcEstAnnualCostAvoided('Option A')
      out.recommendedProducts.push({
        name: 'Option A (default starter)',
        rationale: 'Default recommendation for starter path.',
        confidence: optAConf,
        estAnnualCostAvoided: optACost
      })
    }
  }

  // Attach decision trace
  out.decisionTrace = decisionTrace

  // Roadmaps: include exact strings per path
  const roadmaps:any = {
    aggressive: [
      'Year 1: Baseline protection: StoreOnce + Alletra MP B10000 snapshots; monitoring and recovery process; if hasVMs, deploy Zerto and protect missionCriticalVmCount first.',
      'Year 2: Expand Zerto coverage; formalize DR runbooks and recovery testing; introduce Cloud Bank if needed.',
      'Year 3: Standardize app-tier policies (gold/silver/bronze); automate failover/failback; if large dataFootprintTB or ingest constrained, add/transition to Alletra MP X10000 with DPA (Option C).',
      'Year 4: Add cyber resilience controls: immutable copy requirements, isolation/segmentation, expanded recovery testing; if immutability/air-gap required, move to Cyber Resilience Vault (Option D).',
      'Year 5: Mature posture: quarterly recovery validation, audited compliance artifacts, and air-gapped/immutable recovery foundation—typically culminating in HPE Cyber Resilience Vault when justified.'
    ],
    accelerated: [
      'Year 1: StoreOnce + Alletra MP B10000 snapshots; if hasVMs, deploy Zerto for mission-critical VMs (Option A).',
      'Year 2: Runbook automation and routine recovery testing; if vmCount high or targetRTO tight across many VMs, expand toward Option B.',
      'Year 3: Add Cloud Bank for longer retention; introduce policy tiers.',
      'Year 4: If TB–PB scale or ingest constraints appear, incorporate Alletra MP X10000 with DPA.',
      'Year 5: If immutability/air-gap or stricter compliance required, transition to Cyber Resilience Vault (Option D).'
    ],
    starter: [
      'Year 1: StoreOnce backups + basic monitoring; if hasVMs, include Zerto for mission-critical VMs.',
      'Year 2: Add Alletra MP B10000 snapshots for top workloads; document recovery steps; run at least one test.',
      'Year 3: Expand snapshot coverage; refine retention; add Cloud Bank if needed.',
      'Year 4: If volumes or ingest rates jump to TB–PB, evaluate Alletra MP X10000 with DPA.',
      'Year 5: If business adopts immutability/air-gap or risk increases, recommend Cyber Resilience Vault (Option D).'
    ]
  }
  out.roadmap.years = roadmaps[out.path] || roadmaps.starter

  return out
}
