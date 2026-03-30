import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvisorHub from '@/components/AdvisorHub';

// Mock child components to avoid dependency issues
jest.mock('@/components/CostEstimateModal', () => {
  return function DummyCostModal() {
    return <div>Cost Modal</div>;
  };
});

jest.mock('@/components/SimulationPanel', () => {
  return function DummySimulationPanel() {
    return <div>Simulation Panel</div>;
  };
});

jest.mock('@/helpers/simulation', () => ({
  runSimulation: jest.fn(() =>
    Promise.resolve({
      simulatedInputs: {},
      simCalc: {},
      simAdvice: {},
    })
  ),
}));

const mockAdvice = {
  path: 'balanced',
  options: [
    {
      code: 'Option A',
      name: 'Per-VM Backup Appliances',
    },
    {
      code: 'Option B',
      name: 'Zerto-Centric DR',
    },
  ],
  recommendedProducts: [
    {
      code: 'Option A',
      name: 'HPE StoreOnce',
      rationale: 'Provides efficient backup with deduplication.',
      confidence: 85,
      estAnnualCostAvoided: 200000,
    },
    {
      code: 'Option B',
      name: 'Zerto Replication',
      rationale: 'Enables continuous replication for quick recovery.',
      confidence: 90,
      estAnnualCostAvoided: 350000,
    },
  ],
  roadmap: {
    years: [
      'Deploy backup infrastructure for first 100 VMs. Configure Zerto replication.',
      'Expand to all VMs. Optimize recovery procedures.',
      'Implement immutability policies. Test recovery drills.',
      'Scale storage infrastructure. Migrate remaining workloads.',
      'Evaluate next-generation solutions. Plan upgrade path.',
    ],
  },
  decisionTrace: [
    {
      rule: 'hasVMs',
      evaluatedTo: true,
      details: 'Environment contains 150 VMs',
    },
    {
      rule: 'vmCountHigh',
      evaluatedTo: true,
      details: 'VM count exceeds 100',
    },
    {
      rule: 'rtoGap',
      evaluatedTo: true,
      details: 'Target RTO is 2 hours, estimated restore is 4 hours',
    },
  ],
};

const mockInputs = {
  vmCount: 150,
  dataFootprintTB: 500,
};

const mockCalc = {
  totalEstimatedCost: 250000,
  perHour: 100,
};

describe('AdvisorHub Content Rendering', () => {
  test('renders section with advisor heading', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    expect(screen.getByText('Roadmap Recommendation')).toBeInTheDocument();
  });

  test('renders both option cards', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    expect(screen.getByText(/Per-VM Backup Appliances/)).toBeInTheDocument();
    expect(screen.getByText(/Zerto-Centric DR/)).toBeInTheDocument();
  });

  test('displays new-format option card with customer-friendly title', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    // Check that Option A title is rendered (should contain the helper-formatted output)
    expect(screen.getByText(/Option A — Per-VM Backup Appliances/)).toBeInTheDocument();
  });

  test('displays one-line benefit summary on option card', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    // The summary should come from the helper (either from matched product or default)
    const cards = screen.getAllByText(/What it fixes:/);
    expect(cards.length).toBeGreaterThan(0);
  });

  test('displays three bullet points per option card', () => {
    const { container } = render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    // Each option card should have three bullet points
    const cards = container.querySelectorAll('article');
    expect(cards.length).toBeGreaterThanOrEqual(2);
    // Check at least one card has three bullet divs
    let foundCardWithBullets = false;
    cards.forEach((card) => {
      const bullets = card.querySelectorAll('[class*="text-xs text-gray-600"]');
      if (bullets.length >= 3) {
        foundCardWithBullets = true;
      }
    });
    expect(foundCardWithBullets).toBe(true);
  });

  test('displays confidence and annual savings on card', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    // Multiple cards exist, so there can be multiple "Confidence:" text
    const confidenceElements = screen.getAllByText(/Confidence:/);
    expect(confidenceElements.length).toBeGreaterThan(0);
    // At least one card should show savings
    const savingsElements = screen.queryAllByText(/Saves/);
    expect(savingsElements.length).toBeGreaterThanOrEqual(1);
  });

  test('renders View Roadmap button', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    const buttons = screen.getAllByText('View Roadmap');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  test('opens roadmap timeline when View Roadmap clicked', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    const viewRoadmapButtons = screen.getAllByLabelText(/View roadmap for/);
    fireEvent.click(viewRoadmapButtons[0]);
    // Should display the roadmap title with the selected option
    expect(screen.getByText(/5-Year Roadmap — Option A/)).toBeInTheDocument();
  });

  test('displays Year titles in plain English format', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    fireEvent.click(screen.getAllByLabelText(/View roadmap for/)[0]);
    // The plain roadmap template should generate readable year titles like "Year 1: ..."
    expect(screen.getByText(/Year 1:/)).toBeInTheDocument();
  });

  test('displays roadmap action items as bullet points', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    fireEvent.click(screen.getAllByLabelText(/View roadmap for/)[0]);
    // Should show bullet items under the year title
    const roadmapSection = screen.getByLabelText('Roadmap timeline');
    expect(roadmapSection.textContent).toContain('•');
  });

  test('displays "Why we recommended this path" section', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    fireEvent.click(screen.getAllByLabelText(/View roadmap for/)[0]);
    expect(screen.getByText(/Why we recommended this path/)).toBeInTheDocument();
  });

  test('displays humanized recommendation paragraph in roadmap', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    fireEvent.click(screen.getAllByLabelText(/View roadmap for/)[0]);
    // Should show a paragraph from humanizeDecisionTrace (mentions environment, VMs, recovery, etc)
    const roadmapSection = screen.getByLabelText('Roadmap timeline');
    const paragraph = roadmapSection.querySelector('[class*="text-sm text-gray-700"]');
    expect(paragraph?.textContent?.length).toBeGreaterThan(10);
  });

  test('shows "Show technical rationale" collapsible button', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    fireEvent.click(screen.getAllByLabelText(/View roadmap for/)[0]);
    expect(screen.getByText(/Show technical rationale/)).toBeInTheDocument();
  });

  test('toggles technical details visibility', () => {
    const { rerender } = render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    fireEvent.click(screen.getAllByLabelText(/View roadmap for/)[0]);
    const technicalButton = screen.getByText(/Show technical rationale/);
    expect(technicalButton.className).toContain('text-blue-600');
    fireEvent.click(technicalButton);
    // After clicking, the raw decision trace should be visible
    expect(screen.getByText('hasVMs')).toBeInTheDocument();
  });

  test('displays technical trace entries when expanded', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    fireEvent.click(screen.getAllByLabelText(/View roadmap for/)[0]);
    fireEvent.click(screen.getByText(/Show technical rationale/));
    // Should show the rule name from decisionTrace
    expect(screen.getByText('hasVMs')).toBeInTheDocument();
    // Check that the technical details section is visible with rules
    const technicalDetails = screen.getByText('hasVMs').closest('[class*="bg-gray-50"]');
    expect(technicalDetails).toBeInTheDocument();
  });

  test('closes roadmap when close button clicked', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    fireEvent.click(screen.getAllByLabelText(/View roadmap for/)[0]);
    expect(screen.getByLabelText('Roadmap timeline')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close roadmap'));
    const roadmapSection = screen.queryByLabelText('Roadmap timeline');
    expect(roadmapSection).not.toBeInTheDocument();
  });

  test('hides none of the original buttons (Estimate Cost, etc)', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    expect(screen.getAllByText('Estimate Cost').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Simulate|Running/i).length).toBeGreaterThan(0);
  });

  test('renders path label', () => {
    render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={mockAdvice} />);
    expect(screen.getByText(/Balanced/)).toBeInTheDocument();
  });

  describe('sanitizes rule-like rationales in UI', () => {
    test('never displays raw rule text like "hasVMs === true" in option card summary', () => {
      const ruleAdvice = {
        ...mockAdvice,
        recommendedProducts: [
          {
            code: 'Option A',
            name: 'HPE StoreOnce',
            rationale: 'VM protection; included because hasVMs === true',
            confidence: 85,
            estAnnualCostAvoided: 200000,
          },
        ],
      };

      render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={ruleAdvice} />);

      // The rationale string should NOT appear in the visible text
      expect(screen.queryByText(/hasVMs === true/)).not.toBeInTheDocument();
      expect(screen.queryByText(/included because hasVMs/)).not.toBeInTheDocument();

      // But friendly text should appear
      const summaryTexts = screen.getAllByText(/What it fixes:/);
      const summaryText = summaryTexts[0].closest('.text-xs')?.textContent || '';
      expect(summaryText.toLowerCase()).toMatch(
        /virtual machines|vms|protect|protection/
      );
    });

    test('sanitizes rule operators and boolean values from visible text', () => {
      const ruleAdvice = {
        ...mockAdvice,
        recommendedProducts: [
          {
            code: 'Option B',
            name: 'Zerto Replication',
            rationale: 'rtoGap === true && vmCountHigh === true',
            confidence: 90,
            estAnnualCostAvoided: 350000,
          },
        ],
      };

      const { container } = render(
        <AdvisorHub inputs={mockInputs} calc={mockCalc} advice={ruleAdvice} />
      );

      const allText = container.textContent || '';
      // Should not leak rule syntax into visible content
      expect(allText).not.toContain('===');
      expect(allText).not.toContain('&&');
      expect(allText).not.toContain('rtoGap');
      expect(allText).not.toContain(' true ');
    });

    test('displays friendly text in "What it fixes" bullet even with code-like rationale', () => {
      const ruleAdvice = {
        ...mockAdvice,
        options: [
          {
            code: 'Option D',
            name: 'Cyber Resilience Vault',
          },
        ],
        recommendedProducts: [
          {
            code: 'Option D',
            name: 'Cyber Resilience Vault',
            rationale: 'immutability === true || airgap === true',
            confidence: 95,
            estAnnualCostAvoided: 500000,
          },
        ],
      };

      render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={ruleAdvice} />);

      // Find the "What it fixes" section
      const whatItFixesTexts = screen.getAllByText(/What it fixes:/);
      const whatItFixesText = whatItFixesTexts[0].closest('.text-xs')?.textContent || '';

      // Should have friendly language about immutability or air-gap
      expect(whatItFixesText.toLowerCase()).toMatch(
        /immut|air|gap|compliance|ransomware/
      );

      // Should NOT have code operators or boolean literals
      expect(whatItFixesText).not.toContain('===');
      expect(whatItFixesText).not.toContain('||');
      expect(whatItFixesText).not.toContain(' true');
      expect(whatItFixesText).not.toContain(' false');
    });

    test('keeps technical details in collapsed section untouched', () => {
      const ruleAdvice = {
        ...mockAdvice,
        decisionTrace: [
          {
            rule: 'hasVMs === true',
            evaluatedTo: true,
            details: 'Environment contains VMs',
          },
        ],
      };

      render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={ruleAdvice} />);

      // Open roadmap
      fireEvent.click(screen.getAllByLabelText(/View roadmap for/)[0]);

      // Expand technical details
      fireEvent.click(screen.getByText(/Show technical rationale/));

      // Raw rule text SHOULD appear in the collapsed technical section
      // (This is intentional — engineers can view the raw rules there)
      expect(screen.getByText(/hasVMs === true/)).toBeInTheDocument();
    });

    test('renders clean, non-code rationales unchanged in UI', () => {
      const cleanAdvice = {
        ...mockAdvice,
        recommendedProducts: [
          {
            code: 'Option A',
            name: 'HPE StoreOnce',
            rationale: 'Provides efficient backup with deduplication.',
            confidence: 85,
            estAnnualCostAvoided: 200000,
          },
        ],
      };

      render(<AdvisorHub inputs={mockInputs} calc={mockCalc} advice={cleanAdvice} />);

      // Clean rationale should appear as-is (might be truncated if long)
      const allWhatItFixes = screen.getAllByText(/What it fixes:/);
      const cleanText = allWhatItFixes[0].closest('.text-xs')?.textContent || '';
      expect(cleanText).toContain('Provides efficient backup with deduplication');
    });
  });
});

