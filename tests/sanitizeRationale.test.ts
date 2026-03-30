import { sanitizeRationale } from '@/lib/textHelpers'

describe('sanitizeRationale', () => {
  describe('detects and sanitizes code-like rationales', () => {
    test('converts "hasVMs === true" to friendly message about VMs', () => {
      const result = sanitizeRationale('hasVMs === true', { code: 'Option A', name: 'Zerto' })
      expect(result).toContain('virtual machines')
      expect(result).not.toContain('hasVMs')
      expect(result).not.toContain('===')
    })

    test('converts "vmCount > 100" to friendly message about VM scale', () => {
      const result = sanitizeRationale('vmCount > 100', { code: 'Option B' })
      expect(result).toContain('scale')
      expect(result).not.toContain('vmCount')
      expect(result).not.toContain('>')
    })

    test('converts "immutability === true" to friendly message', () => {
      const result = sanitizeRationale('immutability === true', { code: 'Option D' })
      expect(result).toContain('immut')
      expect(result).not.toContain('===')
      expect(result).not.toContain('true')
    })

    test('handles complex rule text like "VM protection; included because hasVMs === true"', () => {
      const result = sanitizeRationale(
        'VM protection; included because hasVMs === true',
        { code: 'Option A' }
      )
      expect(result).not.toContain('hasVMs')
      expect(result).not.toContain('===')
      expect(result).not.toContain('included because')
      // Should contain friendly language
      expect(result.toLowerCase()).toMatch(/virtual machines|vms|protect/)
    })

    test('cleans "rtoGap === true; rpoGap === false" to recovery time message', () => {
      const result = sanitizeRationale('rtoGap === true; rpoGap === false', { code: 'Option B' })
      expect(result).not.toContain('rtoGap')
      expect(result).not.toContain('===')
      expect(result.toLowerCase()).toContain('rto')
    })

    test('converts dataLarge/data footprint to storage message', () => {
      const result = sanitizeRationale('dataLarge > 500TB', { code: 'Option C' })
      expect(result).not.toContain('dataLarge')
      expect(result).not.toContain('>')
      expect(result.toLowerCase()).toMatch(/high-throughput|storage|data/)
    })
  })

  describe('handles clean rationales gracefully', () => {
    test('preserves clean, plain-English rationale', () => {
      const clean = 'Provides efficient backup with deduplication.'
      const result = sanitizeRationale(clean, { code: 'Option A' })
      expect(result).toBe(clean)
    })

    test('truncates overly long clean rationale to 120 chars', () => {
      const longRationale =
        'This is a very long rationale that provides a comprehensive explanation of the recovery solution and why it is the best choice for your business needs and recovery objectives. It goes on and on.'
      const result = sanitizeRationale(longRationale, { code: 'Option A' })
      expect(result.length).toBeLessThanOrEqual(120)
      expect(result).toContain('…')
    })

    test('ensures clean rationale ends with period', () => {
      const result = sanitizeRationale('Enables continuous replication for quick recovery', {
        code: 'Option B',
      })
      expect(result).toMatch(/\.$/)
    })
  })

  describe('generates fallback rationales when rationale is missing or unclean', () => {
    test('generates Option A fallback when rationale is empty', () => {
      const result = sanitizeRationale('', { code: 'Option A' }, [])
      expect(result).toContain('mission-critical VMs')
      expect(result).toContain('snapshot')
    })

    test('generates Option B fallback when rationale is undefined', () => {
      const result = sanitizeRationale(undefined, { code: 'Option B' }, [])
      expect(result).toContain('Zerto')
      expect(result).toContain('DR')
    })

    test('generates Option D fallback for immutability/air-gap', () => {
      const result = sanitizeRationale(undefined, { code: 'Option D' }, [])
      expect(result).toContain('immutable')
      expect(result).toContain('air')
    })

    test('includes flags in fallback rationale', () => {
      const flags = ['VM Protection', 'Compliance']
      const result = sanitizeRationale(undefined, { code: 'Option A' }, flags)
      expect(result).toContain('VM Protection')
      // Compliance might be truncated, so just check for first few chars
      expect(result).toContain('Compli')
    })
  })

  describe('integrates with summarizeOption flow', () => {
    test('sanitized rationale is not code-like', () => {
      const inputs = { vmCount: 150, dataFootprintTB: 500 }
      const codeRationale = 'VM protection; included because hasVMs === true && vmCountHigh === true'
      const result = sanitizeRationale(codeRationale, { code: 'Option A' }, [], inputs)
      
      // Should not contain any code-like patterns
      expect(result).not.toContain('===')
      expect(result).not.toContain('&&')
      expect(result).not.toContain('hasVMs')
      expect(result).not.toContain('vmCountHigh')
      
      // Should be readable English
      expect(result).toMatch(/\w+/)
    })

    test('null, empty, and code rationales all produce reasonable output', () => {
      const option = { code: 'Option A', name: 'Backup Solution' }
      
      const nullResult = sanitizeRationale(null as any, option)
      const emptyResult = sanitizeRationale('', option)
      const codeResult = sanitizeRationale('hasVMs === true', option)
      
      expect(nullResult.length).toBeGreaterThan(0)
      expect(emptyResult.length).toBeGreaterThan(0)
      expect(codeResult.length).toBeGreaterThan(0)
      
      // None should contain code patterns
      expect(nullResult).not.toContain('===')
      expect(emptyResult).not.toContain('===')
      expect(codeResult).not.toContain('===')
    })
  })
})
