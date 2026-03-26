import rules from './rules.json'

export function advise(inputs:any, calc:any){
  const r = rules as any
  const out:any = { path: 'starter', options: [], recommendedProducts: [], flags: [], roadmap: { years: [] } }

  // Path selection
  const lrph = Number(calc?.lostRevenuePerHour || 0)
  if (inputs.annualRevenue > 100000000 || lrph > 100000) out.path = 'aggressive'
  else if (lrph >= 10000 && lrph <= 100000) out.path = 'accelerated'
  else out.path = 'starter'

  // Always-on VM rule
  if (inputs.hasVMs) {
    out.recommendedProducts.push({ name: 'Zerto', rationale: 'VM protection; included because hasVMs === true' })
    if (inputs.missionCriticalVmCount > 0) {
      out.recommendedProducts.push({ name: 'Zerto (mission-critical)', rationale: 'Protects mission-critical VMs as the mission-critical VM protection/DR layer.' })
    }
  }

  // Option D priority
  if (inputs.requiresImmutability || inputs.requiresAirGap || inputs.industry === 'finance' || inputs.industry === 'healthcare'){
    out.options.push({ code: 'Option D', name: 'HPE Cyber Resilience Vault (full stack)' })
    out.recommendedProducts.push({ name: 'HPE Cyber Resilience Vault', rationale: 'Required due to immutability/air-gap/compliance.' })
  }

  // Option C check
  if (inputs.dataFootprintTB >= r.largeDataFootprintTB){
    out.options.push({ code: 'Option C', name: 'Alletra MP X10000 with DPA' })
    out.recommendedProducts.push({ name: 'Alletra MP X10000', rationale: 'Large data footprint requires scale and DPA.' })
  }

  // RTO/RPO gap
  const estRestoreHours = (Number(inputs.dataFootprintTB) || 0) / r.restoreAssumptions.backupRestoreTBPerHour
  const rtoGap = Number(inputs.targetRTO) < Math.min(estRestoreHours, r.restoreAssumptions.snapshotRTOHours)
  const rpoGap = Number(inputs.targetRPO) < r.restoreAssumptions.achievableBackupRPOHours
  if (rtoGap || rpoGap) {
    out.flags.push('RTO/RPO gap detected')
    if (!out.options.find((o:any)=>o.code==='Option B')) out.options.push({ code: 'Option B', name: 'Zerto + Alletra MP B10000 + StoreOnce + Cloud Bank' })
    out.recommendedProducts.push({ name: 'Option B stack', rationale: 'Escalation due to RTO/RPO gap.' })
  }

  // Option B triggers
  const veryTightRTOMany = (inputs.vmCount >= 50 && inputs.targetRTO <= r.tightRTOFor50) || (inputs.vmCount >= 250 && inputs.targetRTO <= r.tightRTOFor250)
  if (inputs.vmCount >= r.highVmCount || veryTightRTOMany || lrph > 100000) {
    if (!out.options.find((o:any)=>o.code==='Option B')) out.options.push({ code: 'Option B', name: 'Zerto (DR) + Alletra MP B10000 + StoreOnce + Cloud Bank' })
    out.recommendedProducts.push({ name: 'Option B stack', rationale: 'High VM count, very tight RTOs, or very high economics.' })
  }

  // Option A conditions
  const maxSmallMission = Math.max(r.smallMissionCriticalMin, Math.ceil((inputs.vmCount || 0) * r.smallMissionCriticalRatio))
  const econModerate = lrph < 100000
  const missionSmallRelative = inputs.missionCriticalVmCount <= maxSmallMission
  if (missionSmallRelative && econModerate && !out.options.find((o:any)=>o.code==='OptionB')) {
    if (!out.options.find((o:any)=>o.code==='Option A')) out.options.push({ code: 'Option A', name: 'Alletra MP B10000 + StoreOnce + Zerto' })
  }

  // Ensure Zerto is labelled as mission-critical layer where applicable
  if (inputs.hasVMs && inputs.missionCriticalVmCount > 0) {
    // already added above
  }

  // Final tidy: if none options, surface best-fit by path
  if (out.options.length === 0) {
    if (out.path === 'aggressive') out.options.push({ code: 'Option B', name: 'Option B' })
    else if (out.path === 'accelerated') out.options.push({ code: 'Option A', name: 'Option A' })
    else out.options.push({ code: 'Option A', name: 'Option A' })
  }

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
