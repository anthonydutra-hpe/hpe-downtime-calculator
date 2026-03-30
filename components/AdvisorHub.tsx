'use client';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/formatting';
import CostEstimateModal from './CostEstimateModal';

type Advice = any;

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
  const [showTrace, setShowTrace] = useState(false);
  const [simulateOption, setSimulateOption] = useState<string | null>(null);
  const [showCostEstimate, setShowCostEstimate] = useState(false);
  const [costEstimateOption, setCostEstimateOption] = useState<string | null>(null);

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
            const rec =
              (advice.recommendedProducts || []).find(
                (r: any) =>
                  (r.name || '').includes(opt.name || '') ||
                  (opt.name || '').includes(r.name || '')
              ) || {};

            return (
              <article
                key={opt.code}
                role="article"
                aria-label={`Option ${opt.code}`}
                className="min-w-[280px] p-4 border rounded hover:shadow-md transition"
              >
                {/* Header: Code & Confidence */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="inline-block px-2 py-1 bg-gray-100 text-xs font-bold rounded mb-1">
                      {opt.code}
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {opt.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Confidence</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {rec.confidence ?? '—'}
                      {rec.confidence ? '%' : ''}
                    </div>
                  </div>
                </div>

                {/* Rationale */}
                <div className="mt-2 text-sm text-gray-700">
                  {rec.rationale || opt.name}
                </div>

                {/* Cost Avoided */}
                {rec.estAnnualCostAvoided ? (
                  <div className="mt-2 text-sm font-medium" style={{ color: '#00B388' }}>
                    Est. annual saved: {formatCurrency(rec.estAnnualCostAvoided)}
                  </div>
                ) : null}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
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
                    onClick={() =>
                      setSimulateOption(simulateOption === opt.code ? null : opt.code)
                    }
                    aria-label={`Simulate ${opt.code}`}
                    className="px-3 py-1 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Simulate
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
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {(advice.roadmap?.years || []).map((y: string, i: number) => (
              <div key={i} className="min-w-[200px] p-3 border rounded bg-gray-50">
                <div className="font-semibold text-sm">Year {i + 1}</div>
                <div className="text-sm text-gray-700 mt-1">{y}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Trace */}
      {(advice.decisionTrace || []).length > 0 && (
        <div className="mt-6 p-4 border-t">
          <button
            onClick={() => setShowTrace(!showTrace)}
            aria-expanded={showTrace}
            aria-label="Toggle decision trace visibility"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {showTrace ? '▼' : '▶'} Decision Trace
          </button>
          {showTrace && (
            <div className="mt-3 space-y-2">
              {advice.decisionTrace.map((trace: any, i: number) => (
                <div key={i} className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-semibold">{trace.rule}</div>
                  <div className="text-gray-600">
                    Evaluated to: <strong>{String(trace.evaluatedTo)}</strong>
                  </div>
                  {trace.details && (
                    <div className="text-gray-600 mt-1">Details: {trace.details}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Simulation Overlay */}
      {simulateOption && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md">
            <h4 className="font-semibold text-lg">Simulation: {simulateOption}</h4>
            <p className="text-sm text-gray-700 mt-3">
              This is a simulation overlay for <strong>{simulateOption}</strong>. Replace
              with real simulation logic later.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSimulateOption(null)}
                className="flex-1 px-3 py-2 rounded text-white font-medium transition hover:opacity-90"
                style={{ background: '#00B388' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
