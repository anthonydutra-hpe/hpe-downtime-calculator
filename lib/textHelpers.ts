import { formatCurrency } from '@/lib/formatting'

/**
 * Convert technical option details into customer-friendly title, summary, and bullet points.
 */
export function summarizeOption(
  option: any,
  recommendedProducts: any[] = [],
  flags: string[] = []
) {
  const title = `${option.code} — ${option.name || 'Recovery Solution'}`

  // Extract top recommendation and its benefit
  const topRec = recommendedProducts?.[0] || null
  const summaryParts: string[] = []

  if (topRec?.rationale) {
    // Clean up the rationale to a concise benefit line
    const cleaned = String(topRec.rationale)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120)
    summaryParts.push(cleaned)
  } else {
    summaryParts.push('A focused approach to reduce downtime and improve recovery time.')
  }

  const summary = summaryParts[0]

  // Impact bullet: costs or requirements
  let impactBullet = 'Improves recoverability and operational efficiency.'
  if (topRec?.estAnnualCostAvoided && topRec.estAnnualCostAvoided > 0) {
    impactBullet = `Estimated annual recovery cost avoided: ${formatCurrency(topRec.estAnnualCostAvoided)}`
  } else if (flags?.length > 0) {
    impactBullet = `Addresses: ${flags.slice(0, 2).join('; ')}`
  }

  // Immediate next step - option-specific guidance
  const nextStep = (() => {
    switch (option.code) {
      case 'Option A':
        return 'Next: Pilot protection for top 10 mission-critical VMs and validate recovery workflows.'
      case 'Option B':
        return 'Next: Size Zerto for mission-critical VMs and plan recovery test within 90 days.'
      case 'Option C':
        return 'Next: Evaluate Alletra sizing based on data footprint and plan storage consolidation.'
      case 'Option D':
        return 'Next: Begin immutability and air-gap planning; engage security and compliance teams.'
      default:
        return 'Next: Review the roadmap and schedule a kickoff meeting.'
    }
  })()

  const bullets = [
    `What it fixes: ${summary}`,
    `Impact: ${impactBullet}`,
    `Immediate next step: ${nextStep}`,
  ]

  return { title, summary, bullets }
}

/**
 * Convert raw roadmap data into a list of years with plain-English titles and action items.
 */
export function plainRoadmapFromTemplate(roadmapRaw: any) {
  const years = Array.isArray(roadmapRaw?.years) ? roadmapRaw.years : roadmapRaw || []

  if (!Array.isArray(years) || years.length === 0) {
    return [
      {
        year: 1,
        title: 'Year 1: Foundation',
        items: ['Establish baseline environment and recovery objectives.'],
      },
    ]
  }

  return years.map((entry: any, idx: number) => {
    const year = idx + 1
    const items: string[] = []

    // Extract items based on entry type
    if (typeof entry === 'string') {
      // Parse comma or period-delimited items from a string
      const parts = entry
        .split(/[,.;]\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 4)

      items.push(
        ...parts.map((p) => shortenToPlainEnglish(p))
      )
    } else if (Array.isArray(entry?.items)) {
      items.push(
        ...entry.items
          .slice(0, 4)
          .map((it: any) => shortenToPlainEnglish(String(it)))
      )
    } else if (typeof entry === 'object' && entry !== null) {
      const values = Object.values(entry)
        .filter((v) => typeof v === 'string')
        .slice(0, 4)
      items.push(
        ...values.map((v: any) => shortenToPlainEnglish(String(v)))
      )
    }

    // Default if no items extracted
    if (items.length === 0) {
      items.push('Define objectives and success criteria.')
    }

    // Infer a friendly title from the first item or use a default
    const inferredTitle =
      inferYearTitle(items[0] || '') || `Key Activities`
    const title = `Year ${year}: ${inferredTitle}`

    return { year, title, items }
  })
}

/**
 * Convert technical decision trace into a human-friendly explanation
 * with optional collapsible technical details.
 */
export function humanizeDecisionTrace(decisionTrace: any[] = []) {
  if (
    !Array.isArray(decisionTrace) ||
    decisionTrace.length === 0
  ) {
    return {
      paragraph:
        'Recommendation based on your inputs and recovery requirements.',
      technical: [],
    }
  }

  const positives: string[] = []
  const concerns: string[] = []

  decisionTrace.forEach((d: any) => {
    const rule = String(d.rule || '').toLowerCase()
    const evaluated = Boolean(d.evaluatedTo)

    if (evaluated) {
      // Map technical rule names to customer-friendly observations
      if (rule.includes('hasvms') || rule.includes('vmcount')) {
        positives.push('Your environment contains multiple VMs that need protection.')
      }
      if (rule.includes('vmcounthigh') || rule.includes('scale')) {
        positives.push('Your VM count benefits from scale-capable DR solutions.')
      }
      if (rule.includes('rtogap') || rule.includes('rto')) {
        concerns.push('Achieving your target RTO requires faster recovery capabilities.')
      }
      if (rule.includes('rpogap') || rule.includes('rpo')) {
        concerns.push('Your data change rate calls for continuous replication.')
      }
      if (rule.includes('datalarge') || rule.includes('datafoot')) {
        positives.push('Your data size warrants higher-throughput storage options.')
      }
      if (rule.includes('immutability') || rule.includes('airgap') || rule.includes('compliance')) {
        concerns.push('Compliance or security requirements call for immutable backup.')
      }
    }
  })

  // Build a conversational paragraph
  const paragraphs: string[] = []

  if (positives.length > 0) {
    const pos = positives.slice(0, 2).join(' ')
    paragraphs.push(pos)
  }

  if (concerns.length > 0) {
    const concern = concerns.slice(0, 2).join(' ')
    paragraphs.push(`To address your constraints, ${concern}.`)
  }

  const paragraph =
    paragraphs.length > 0
      ? paragraphs.join(' ')
      : 'Recommendation derived from your input sizes and recovery goals.'

  return {
    paragraph,
    technical: decisionTrace,
  }
}

/**
 * Infer a short, friendly title from the first roadmap item.
 */
function inferYearTitle(item: string): string {
  if (!item) return ''

  // Remove common action verbs and technical jargon
  let s = item
    .replace(/(deploy|deploying|plan|planning|configure|setup|implement|enable|assess)/gi, '')
    .split(/[:|;]/)[0]
    .trim()

  // Clean up leftover technical words
  s = s.replace(/(threshold|rule|evaluate|evaluat|>=|<=|==|&|rule-based)/gi, '').trim()

  // Capitalize and limit length
  const title =
    s.length > 0
      ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      : 'Key Activities'

  return title.slice(0, 60)
}

/**
 * Convert a long, technical string into a short, plain-English sentence.
 */
export function shortenToPlainEnglish(s: string): string {
  // Remove rule/technical language
  let t = String(s).replace(
    /(threshold|rule|evaluat(ed|ion)|>=|<=|==|defined|configured|&&|\|\|)/gi,
    ''
  )

  // Clean up extra whitespace and punctuation
  t = t.replace(/\s+/g, ' ').trim()

  // Capitalize if lowercase start
  if (t.length > 0 && t[0] === t[0].toLowerCase() && !/^\d/.test(t)) {
    t = t.charAt(0).toUpperCase() + t.slice(1)
  }

  // Truncate if too long
  const short = t.length > 120 ? t.slice(0, 117).trim() + '…' : t

  // Ensure it ends with a period
  return short.endsWith('.') || short.endsWith('…') ? short : short + '.'
}
