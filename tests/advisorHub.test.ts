import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvisorHub from '@/components/AdvisorHub';

test('renders option cards and roadmap', () => {
  const advice = {
    path: 'accelerated',
    options: [
      { code: 'Option A', name: 'VM Backup' },
      { code: 'Option B', name: 'Zerto DR' },
    ],
    recommendedProducts: [
      {
        code: 'Option A',
        name: 'VM Protection',
        rationale: 'protect VMs',
        confidence: 90,
        estAnnualCostAvoided: 500000,
      },
    ],
    roadmap: { years: ['Deploy infrastructure', 'Scale out', 'Optimize', 'Migrate', 'Plan upgrade'] },
    decisionTrace: [{ rule: 'hasVMs', evaluatedTo: true }],
  };

  render(React.createElement(AdvisorHub, { inputs: {}, calc: {}, advice }));

  // Check that option codes are rendered
  expect(screen.getByText(/Option A/)).toBeInTheDocument();
  expect(screen.getByText(/Option B/)).toBeInTheDocument();

  // Click "View Roadmap" for first option
  const roadmapButtons = screen.getAllByText('View Roadmap');
  fireEvent.click(roadmapButtons[0]);

  // Check that timeline appears with year headers (should use plain English titles now)
  expect(screen.getByText(/Year 1:/)).toBeInTheDocument();
  expect(screen.getByText(/Year 5:/)).toBeInTheDocument();
});

test('toggles technical details visibility in roadmap', () => {
  const advice = {
    path: 'starter',
    options: [{ code: 'Option A', name: 'Test Option' }],
    roadmap: { years: ['Test year 1', 'Test year 2'] },
    decisionTrace: [{ rule: 'testRule', evaluatedTo: true, details: 'test detail' }],
  };

  render(React.createElement(AdvisorHub, { inputs: {}, calc: {}, advice }));

  // Open the roadmap first
  const roadmapButtons = screen.getAllByText('View Roadmap');
  fireEvent.click(roadmapButtons[0]);

  // The technical details button should appear in the roadmap
  const technicalButton = screen.getByText(/Show technical rationale/);
  expect(screen.queryByText('testRule')).not.toBeInTheDocument();

  // Click to expand technical details
  fireEvent.click(technicalButton);
  expect(screen.getByText('testRule')).toBeInTheDocument();
});

test('dispatchesсобытия on Estimate Cost click', () => {
  const advice = {
    path: 'aggressive',
    options: [{ code: 'Option A', name: 'Test Option' }],
  };

  const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

  render(React.createElement(AdvisorHub, { inputs: {}, calc: {}, advice }));

  const estimateButton = screen.getByLabelText(/Estimate cost for/);
  fireEvent.click(estimateButton);

  expect(dispatchEventSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'advisor:estimate',
    })
  );

  dispatchEventSpy.mockRestore();
});
