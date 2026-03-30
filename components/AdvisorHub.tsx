'use client';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/formatting';
import { summarizeOption, plainRoadmapFromTemplate, humanizeDecisionTrace } from '@/lib/textHelpers';
import CostEstimateModal from './CostEstimateModal';
import SimulationPanel from './SimulationPanel';
import { runSimulation } from '@/helpers/simulation';

type Advice = any;

interface SimulationResult {
  simulatedInputs: any;
  simCalc: any;
  simAdvice: any;
  error?: string;
}

export default function AdvisorHub({
  inputs,
  calc,
  advice,
}: {
  inputs: any;
  calc: any;
  advice: Advice;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showCostEstimate, setShowCostEstimate] = useState(false);
  const [costEstimateOption, setCostEstimateOption] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Listen for estimate cost events
  useEffect(() => {
    const handleEstimateEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const optionCode = customEvent.detail?.optionCode;
      if (optionCode) {
        setCostEstimateOption(optionCode);
        setShowCostEstimate(true);
      }
    };

    window.addEventListener('advisor:estimate', handleEstimateEvent);
    return () => window.removeEventListener('advisor:estimate', handleEstimateEvent);
  }, []);

  if (!advice) return null;

  const pathLabel =
    (advice.path || 'starter').charAt(0).toUpperCase() +
    (advice.path || 'starter').slice(1);

  const handleEstimate = (code: string) =>
    window.dispatchEvent(
      new CustomEvent('advisor:estimate', { detail: { optionCode: code } })
    );

  const handleSimulate = async (optionCode: string) => {
    setIsSimulating(true);
    try {
      const result = await runSimulation(optionCode, inputs);
      setSimulationResult(result);
    } catch (error: any) {
      setSimulationResult({
        simulatedInputs: {},
        simCalc: {},
        simAdvice: {},
        error: error?.message || 'Simulation failed',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplySimulation = () => {
    if (simulationResult?.simulatedInputs && simulationResult?.simCalc) {
      // Optional: Update main inputs with simulated ones
      // This could trigger a re-calculation in the parent component
      console.log('Apply simulation:', simulationResult.simulatedInputs);
      // For now, just close the simulation panel
      setSimulationResult(null);
    }
  };

  return (
    <section
      role="region"
      aria-labelledby="advisor-heading"
      className="bg-white rounded shadow p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="advisor-heading" className="text-lg font-semibold">
          Roadmap Recommendation
        </h2>
        <div
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ background: '#E6FFF7', color: '#006A4D' }}
        >
          {pathLabel}
        </div>
      </div>

      {/* Option Cards */}
      <div className="mt-4 overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {(advice.options || []).map((opt: any) => {
            const recs = advice.recommendedProducts || [];
            // Match by code first (Option A, B, C, D), then fall back to name matching
            const rec = recs.find(
              (r: any) =>
                r.code === opt.code ||
                (r.name || '').includes(opt.name || '') ||
                (opt.name || '').includes(r.name || '')
            ) || {};

            // Use the text helper to generate customer-friendly content
            const { title, summary, bullets } = summarizeOption(opt, [rec], []);

            return (
              <article
                key={opt.code}
                role="article"
                aria-label={`Option ${opt.code}`}
                className="min-w-[320px] p-4 border rounded hover:shadow-md transition"
              >
                {/* New: Customer-friendly title from helper */}
                <div className="mb-3">
                  <div className="text-sm font-bold text-blue-700 mb-1">
                    {title}
                  </div>
                  <div className="text-sm text-gray-700">
                    {summary}
                  </div>
                </div>

                {/* New: Three short bullets */}
                <div className="mt-3 space-y-2 mb-4">
                  {bullets.map((bullet: string, idx: number) => (
                    <div key={idx} className="text-xs text-gray-600">
                      <span className="font-semibold">{bullet.split(':')[0]}:</span>
                      {' '}
                      {bullet.split(':').slice(1).join(':').trim()}
                    </div>
                  ))}
                </div>

                {/* Confidence badge and cost (legacy, kept for context) */}
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Confidence: {rec.confidence ?? '—'}%</span>
                    {rec.estAnnualCostAvoided ? (
                      <span style={{ color: '#00B388' }} className="font-semibold">
                        Saves {formatCurrency(rec.estAnnualCostAvoided)}/yr
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedOption(opt.code);
                      setShowTimeline(true);
                    }}
                    aria-label={`View roadmap for ${opt.code}`}
                    className="px-3 py-1 rounded text-white text-sm font-medium transition hover:opacity-90"
                    style={{ background: '#00B388' }}
                  >
                    View Roadmap
                  </button>
                  <button
                    onClick={() => handleEstimate(opt.code)}
                    aria-label={`Estimate cost for ${opt.code}`}
                    className="px-3 py-1 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Estimate Cost
                  </button>
                  <button
                    onClick={() => handleSimulate(opt.code)}
                    aria-label={`Simulate ${opt.code}`}
                    className="px-3 py-1 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                    disabled={isSimulating}
                  >
                    {isSimulating ? 'Running...' : 'Simulate'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Roadmap Timeline */}
      {showTimeline && selectedOption && (
        <div className="mt-6 p-4 border-t" role="region" aria-label="Roadmap timeline">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-md">5-Year Roadmap — {selectedOption}</h3>
            <button
              onClick={() => {
                setShowTimeline(false);
                setSelectedOption(null);
              }}
              aria-label="Close roadmap"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* New: Plain-English roadmap years with action items */}
          <div className="mt-4 space-y-3">
            {plainRoadmapFromTemplate(advice.roadmap).map((yearData: any) => (
              <div key={yearData.year} className="p-3 border rounded bg-blue-50">
                <div className="font-semibold text-sm text-blue-900 mb-2">
                  {yearData.title}
                </div>
                <ul className="space-y-1">
                  {yearData.items.map((item: string, itemIdx: number) => (
                    <li key={itemIdx} className="text-sm text-gray-700 ml-4">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Why we recommended this */}
          <div className="mt-6 pt-4 border-t">
            <div className="prose prose-sm max-w-none mb-4">
              <h4 className="text-sm font-semibold mb-2">Why we recommended this path</h4>
              <p className="text-sm text-gray-700 mb-3">
                {humanizeDecisionTrace(advice.decisionTrace).paragraph}
              </p>
            </div>

            {/* Collapsible Technical Details */}
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              aria-expanded={showTechnicalDetails}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showTechnicalDetails ? '▼' : '▶'} Show technical rationale
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-xs font-mono space-y-2">
                  {humanizeDecisionTrace(advice.decisionTrace).technical.map(
                    (trace: any, idx: number) => (
                      <div key={idx} className="border-b pb-2 last:border-b-0">
                        <div className="font-semibold text-gray-800">{trace.rule}</div>
                        <div className="text-gray-600">
                          Evaluated: <span className="font-semibold">{String(trace.evaluatedTo)}</span>
                        </div>
                        {trace.details && (
                          <div className="text-gray-600 mt-1">Details: {trace.details}</div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulation Panel */}
      {simulationResult && (
        <SimulationPanel
          currentCalc={calc}
          currentAdvice={advice}
          currentInputs={inputs}
          simCalc={simulationResult.simCalc}
          simAdvice={simulationResult.simAdvice}
          simulatedInputs={simulationResult.simulatedInputs}
          onApply={handleApplySimulation}
          onClose={() => setSimulationResult(null)}
          isApplying={false}
        />
      )}

      {/* Cost Estimate Modal */}
      {showCostEstimate && costEstimateOption && (
        <CostEstimateModal
          optionCode={costEstimateOption}
          vmCount={inputs.vmCount || 0}
          dataFootprintTB={inputs.dataFootprintTB || 0}
          onClose={() => {
            setShowCostEstimate(false);
            setCostEstimateOption(null);
          }}
        />
      )}
    </section>
  );
}
