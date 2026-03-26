import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdvisorHub from '@/components/AdvisorHub';

test('renders option cards and roadmap', () => {
  const advice = {
    path: 'accelerated',
    options: [
      { code: 'Option A', name: 'Opt A' },
      { code: 'Option B', name: 'Opt B' },
    ],
    recommendedProducts: [
      {
        name: 'Opt A',
        rationale: 'protect VMs',
        confidence: 90,
        estAnnualCostAvoided: 500000,
      },
    ],
    roadmap: { years: ['y1', 'y2', 'y3', 'y4', 'y5'] },
    decisionTrace: [{ rule: 'hasVMs', evaluatedTo: true }],
  };

  render(React.createElement(AdvisorHub, { inputs: {}, calc: {}, advice }));

  // Check that option names are rendered
  expect(screen.getByText('Opt A')).toBeInTheDocument();
  expect(screen.getByText('Opt B')).toBeInTheDocument();

  // Click "View Roadmap" for first option
  const roadmapButtons = screen.getAllByText('View Roadmap');
  fireEvent.click(roadmapButtons[0]);

  // Check that timeline appears with year headers
  expect(screen.getByText('Year 1')).toBeInTheDocument();
  expect(screen.getByText('Year 5')).toBeInTheDocument();
});

test('toggles decision trace visibility', () => {
  const advice = {
    path: 'starter',
    options: [],
    decisionTrace: [{ rule: 'testRule', evaluatedTo: true, details: 'test detail' }],
  };

  render(React.createElement(AdvisorHub, { inputs: {}, calc: {}, advice }));

  const traceButton = screen.getByText(/Decision Trace/);
  expect(screen.queryByText('test detail')).not.toBeInTheDocument();

  fireEvent.click(traceButton);
  expect(screen.getByText('test detail')).toBeInTheDocument();
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
