import {
  summarizeOption,
  plainRoadmapFromTemplate,
  humanizeDecisionTrace,
  shortenToPlainEnglish,
} from '@/lib/textHelpers';

describe('summarizeOption', () => {
  test('produces a title combining code and name', () => {
    const option = { code: 'Option A', name: 'VM Backup' };
    const { title } = summarizeOption(option);
    expect(title).toContain('Option A');
    expect(title).toContain('VM Backup');
  });

  test('returns non-empty summary', () => {
    const option = { code: 'Option B', name: 'Zerto DR' };
    const rec = { rationale: 'Enables continuous replication' };
    const { summary } = summarizeOption(option, [rec]);
    expect(summary).toBeTruthy();
    expect(summary.length).toBeGreaterThan(0);
  });

  test('returns at least one what-it-fixes bullet', () => {
    const option = { code: 'Option C', name: 'Storage' };
    const rec = { rationale: 'High-throughput storage consolidation' };
    const { bullets } = summarizeOption(option, [rec]);
    expect(bullets.length).toBeGreaterThanOrEqual(1);
    expect(bullets[0]).toContain('What it fixes');
  });

  test('includes impact bullet with cost when available', () => {
    const option = { code: 'Option D', name: 'Vault' };
    const rec = { estAnnualCostAvoided: 150000 };
    const { bullets } = summarizeOption(option, [rec]);
    const impactBullet = bullets.find((b) => b.includes('Impact'));
    expect(impactBullet).toContain('150,000');
  });

  test('includes next-step bullet', () => {
    const option = { code: 'Option A', name: 'Test' };
    const { bullets } = summarizeOption(option);
    const nextStepBullet = bullets.find((b) => b.includes('Immediate next step'));
    expect(nextStepBullet).toBeTruthy();
  });

  test('handles empty recommended products gracefully', () => {
    const option = { code: 'Option B', name: 'Test' };
    const { summary, bullets } = summarizeOption(option, []);
    expect(summary).toBeTruthy();
    expect(bullets).toBeTruthy();
  });

  test('includes option-specific guidance in next-step', () => {
    const optionB = { code: 'Option B', name: 'Zerto' };
    const { bullets: bulletsB } = summarizeOption(optionB);
    expect(bulletsB.length).toBeGreaterThanOrEqual(3);
    expect(bulletsB[2]).toContain('Zerto');

    const optionD = { code: 'Option D', name: 'Vault' };
    const { bullets: bulletsD } = summarizeOption(optionD);
    expect(bulletsD.length).toBeGreaterThanOrEqual(3);
    expect(bulletsD[2]).toContain('immutability');
  });
});

describe('plainRoadmapFromTemplate', () => {
  test('returns array of year objects with year property', () => {
    const roadmap = { years: ['Deploy infrastructure', 'Scale out'] };
    const result = plainRoadmapFromTemplate(roadmap);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].year).toBe(1);
    expect(result[1].year).toBe(2);
  });

  test('generates plain-English year titles', () => {
    const roadmap = { years: ['Deploy test infrastructure', 'Expand coverage'] };
    const result = plainRoadmapFromTemplate(roadmap);
    expect(result[0].title).toContain('Year 1');
    expect(result[0].title).not.toContain('Deploy');
  });

  test('extracts and limits items to 4 per year', () => {
    const roadmap = {
      years: ['Item 1. Item 2. Item 3. Item 4. Item 5. Item 6'],
    };
    const result = plainRoadmapFromTemplate(roadmap);
    expect(result[0].items.length).toBeLessThanOrEqual(4);
  });

  test('handles structured objects with items array', () => {
    const roadmap = {
      years: [
        { items: ['First activity', 'Second activity'] },
        { items: ['Third activity'] },
      ],
    };
    const result = plainRoadmapFromTemplate(roadmap);
    expect(result[0].items.length).toBe(2);
    expect(result[0].items[0]).toContain('First');
  });

  test('returns default roadmap for empty input', () => {
    const result = plainRoadmapFromTemplate(null);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBe(1);
    expect(result[0].items.length).toBeGreaterThan(0);
  });

  test('applies shortenToPlainEnglish to each item', () => {
    const roadmap = {
      years: [
        'Configure Zerto replication threshold >= 100GB. Deploy across 5 regions.',
      ],
    };
    const result = plainRoadmapFromTemplate(roadmap);
    const item = result[0].items[0];
    expect(item).not.toContain('threshold');
    expect(item).not.toContain('>=');
  });
});

describe('humanizeDecisionTrace', () => {
  test('returns object with paragraph and technical fields', () => {
    const trace = [
      { rule: 'hasVMs', evaluatedTo: true },
    ];
    const result = humanizeDecisionTrace(trace);
    expect(result.paragraph).toBeTruthy();
    expect(Array.isArray(result.technical)).toBe(true);
  });

  test('includes VMs observation when hasVMs is true', () => {
    const trace = [{ rule: 'hasVMs', evaluatedTo: true }];
    const result = humanizeDecisionTrace(trace);
    expect(
      result.paragraph.includes('VMs') || result.paragraph.includes('Environment')
    ).toBe(true);
  });

  test('includes RTO gap concern when rtoGap is true', () => {
    const trace = [{ rule: 'rtoGap', evaluatedTo: true }];
    const result = humanizeDecisionTrace(trace);
    expect(
      result.paragraph.includes('RTO') || result.paragraph.includes('recovery')
    ).toBe(true);
  });

  test('includes scale consideration when vmCountHigh is true', () => {
    const trace = [{ rule: 'vmCountHigh', evaluatedTo: true }];
    const result = humanizeDecisionTrace(trace);
    expect(result.paragraph.length).toBeGreaterThan(0);
  });

  test('preserves technical trace in technical field', () => {
    const trace = [
      { rule: 'testRule', evaluatedTo: true, details: 'test detail' },
    ];
    const result = humanizeDecisionTrace(trace);
    expect(result.technical).toEqual(trace);
  });

  test('handles empty trace gracefully', () => {
    const result = humanizeDecisionTrace([]);
    expect(result.paragraph).toBeTruthy();
    expect(result.technical).toEqual([]);
  });

  test('handles null/undefined trace gracefully', () => {
    const result = humanizeDecisionTrace();
    expect(result.paragraph).toBeTruthy();
  });

  test('combines positives and concerns in paragraph', () => {
    const trace = [
      { rule: 'hasVMs', evaluatedTo: true },
      { rule: 'rtoGap', evaluatedTo: true },
    ];
    const result = humanizeDecisionTrace(trace);
    // Should have content from both rules combined
    expect(result.paragraph.length).toBeGreaterThan(20);
  });
});

describe('shortenToPlainEnglish', () => {
  test('removes technical rule words', () => {
    const input = 'threshold >= 100GB rule evaluated as true';
    const result = shortenToPlainEnglish(input);
    expect(result).not.toContain('threshold');
    expect(result).not.toContain('>=');
    expect(result).not.toContain('rule');
  });

  test('truncates string over 120 characters', () => {
    const long =
      'This is a very long string that should be truncated because it exceeds the character limit and is not useful in the context of a short bullet point for roadmap items ' +
      'and should be shortened';
    const result = shortenToPlainEnglish(long);
    expect(result.length).toBeLessThanOrEqual(120);
  });

  test('ensures string ends with period', () => {
    const input = 'Deploy infrastructure';
    const result = shortenToPlainEnglish(input);
    expect(result.endsWith('.') || result.endsWith('…')).toBe(true);
  });

  test('capitalizes lowercase start', () => {
    const input = 'deploy infrastructure';
    const result = shortenToPlainEnglish(input);
    expect(result[0]).toBe('D');
  });

  test('handles strings with logical operators', () => {
    const input = 'VM count && data size || single region';
    const result = shortenToPlainEnglish(input);
    expect(result).not.toContain('&&');
    expect(result).not.toContain('||');
  });
});
