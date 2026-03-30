import { formatCurrency } from '@/lib/formatting'

/* ========================================
   Helpers to detect and sanitize code-like or rule-based strings
   ======================================== */

/**
 * Check if a string looks like code or a rule (contains ===, ==, true, false, variable names, etc.)
 */
function looksLikeCodeOrRule(s?: string): boolean {
  if (!s || typeof s !== 'string') return false
  const codePatterns = [
    /===|==|!==|!=|>=|<=|>|</,  // comparison operators
    /\btrue\b|\bfalse\b/,       // boolean literals
    /\bhasVMs\b/,               // VM flag variable
    /\bvmCount\b/,              // VM count variable
    /\brtoGap\b|\brpoGap\b/,    // gap variables
    /\bimmut|airgap|Immutability|air-gap/i, // immutability/airgap keywords
    /\bthreshold\b|\brule\b/,   // technical terms
    /\bdataLarge\b|\bdataFootprint\b/i, // data size variables
  ]
  return codePatterns.some((rx) => rx.test(s))
}

/**
 * Map technical token to a friendly English phrase
 */
function tokenMapToFriendly(token: string): string {
  const t = String(token).toLowerCase()
  // Check for exact token names (avoid broad substring matches)
  if (t === 'hasvms') {
    return 'The environment contains virtual machines that require protection.'
  }
  if (t === 'vmcounthigh' || t === 'vmcount') {
    return 'Large VM count — recommend scale-capable protection.'
  }
  if (t.includes('immut') || t.includes('airgap')) {
    return 'Requires immutability or air-gap controls for compliance and ransomware protection.'
  }
  if (t === 'rtogap' || t === 'rto') {
    return 'Target RTO is tighter than estimated restore time; consider DR tooling to meet objectives.'
  }
  if (t === 'rpogap' || t === 'rpo') {
    return 'Target RPO is tighter than backup cadence; consider continuous replication options.'
  }
  if (t === 'datalarge' || t === 'data' || t.includes('footprint')) {
    return 'Large data footprint — high-throughput storage and consolidation recommended.'
  }
  return ''
}

/**
 * Generate a fallback friendly rationale based on option, flags, and inputs
 */
function generateFallbackRationale(option: any, flags: string[] = [], inputs: any = {}): string {
  const baseByOption: Record<string, string> = {
    'Option A': 'Protect a focused set of mission-critical VMs and enable fast snapshot-based recovery.',
    'Option B': 'Provide a Zerto-centric DR solution for tight RTO/RPO and large VM scale.',
    'Option C': 'Deliver high-throughput, TB–PB-scale protection with enterprise storage.',
    'Option D': 'Implement an immutable, air-gapped resilience vault for compliance and cyber resilience.',
  }
  const base =
    baseByOption[option?.code] ||
    (option?.name ? `Adopt ${option.name} to improve recoverability.` : 'Improve recoverability and reduce downtime.')
  const flagNote = flags && flags.length ? ` Addresses: ${flags.slice(0, 2).join('; ')}.` : ''
  return (base + flagNote).slice(0, 120)
}

/**
 * Sanitize rationale: detect code-like strings and replace with friendly English.
 * If the original rationale is clean, lightly clean it up and return.
 * Otherwise, fall back to a generated friendly rationale.
 */
export function sanitizeRationale(
  raw?: string,
  option?: any,
  flags: string[] = [],
  inputs?: any
): string {
  const s = typeof raw === 'string' ? raw.trim() : ''
  
  if (!s) {
    return generateFallbackRationale(option, flags, inputs)
  }

  // If it looks like code or a rule, try to map known tokens to friendly sentences
  if (looksLikeCodeOrRule(s)) {
    const tokensFound: string[] = []
    
    // Check for known tokens and map them to friendly phrases
    if (/\bhasVMs\b/i.test(s)) {
      tokensFound.push(tokenMapToFriendly('hasVMs'))
    }
    if (/\bvmCount\b/i.test(s) || /\bvmCountHigh\b/i.test(s)) {
      tokensFound.push(tokenMapToFriendly('vmCountHigh'))
    }
    if (/\bimmut|airgap|immutability/i.test(s)) {
      tokensFound.push(tokenMapToFriendly('immutOrAirgap'))
    }
    if (/\brtoGap\b|\brto\b/i.test(s)) {
      tokensFound.push(tokenMapToFriendly('rtoGap'))
    }
    if (/\brpoGap\b|\brpo\b/i.test(s)) {
      tokensFound.push(tokenMapToFriendly('rpoGap'))
    }
    if (/\bdataFootprint\b|\bdataLarge\b|\bTB\b/i.test(s)) {
      tokensFound.push(tokenMapToFriendly('dataLarge'))
    }

    const compact = tokensFound.filter(Boolean)
    if (compact.length) {
      // Join first two mapped phrases into one short sentence
      return compact.slice(0, 2).join(' ')
    }

    // If we couldn't map tokens, fallback to generated rationale based on option & flags
    return generateFallbackRationale(option, flags, inputs)
  }

  // Otherwise, clean up punctuation and trim overly verbose reason text
  // Remove repeated "included because ..." patterns
  let cleaned = s
    .replace(/\bincluded because\b.*$/i, '')
    .replace(/\bhasVMs\b/gi, 'virtual machines')
    .replace(/\s+/g, ' ')
    .trim()
  
  if (cleaned.length > 120) {
    cleaned = cleaned.slice(0, 117).trim() + '…'
  }
  
  // If the cleaned string still contains typical variable tokens, fallback
  if (looksLikeCodeOrRule(cleaned)) {
    return generateFallbackRationale(option, flags, inputs)
  }
  
  return cleaned.endsWith('.') ? cleaned : cleaned + '.'
}

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
  const rawRationale = topRec?.rationale || ''
  
  // Sanitize the rationale to remove any code-like or rule-y strings
  const summary = sanitizeRationale(rawRationale, option, flags)

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
