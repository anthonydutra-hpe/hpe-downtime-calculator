'use client'
import React from 'react'
import { formatCurrency } from '@/lib/formatting'

interface SimulationPanelProps {
  currentCalc?: any
  currentAdvice?: any
  currentInputs?: any
  simCalc?: any
  simAdvice?: any
  simulatedInputs?: any
  onApply?: () => void
  onClose: () => void
  isApplying?: boolean
}

export default function SimulationPanel({
  currentCalc,
  currentAdvice,
  currentInputs,
  simCalc,
  simAdvice,
  simulatedInputs,
  onApply,
  onClose,
  isApplying,
}: SimulationPanelProps) {
  if (!simCalc || !simAdvice) return null

  const currentPath = currentAdvice?.path || 'unknown'
  const simPath = simAdvice?.path || 'unknown'
  const pathChanged = currentPath !== simPath

  const currentOptions = (currentAdvice?.options || []).map((o: any) => o.code).join(', ')
  const simOptions = (simAdvice?.options || []).map((o: any) => o.code).join(', ')
  const optionsChanged = currentOptions !== simOptions

  const currentCost = currentCalc?.totalEstimatedCost ?? 0
  const simCost = simCalc?.totalEstimatedCost ?? 0
  const costDelta = simCost - currentCost
  const costPctChange = currentCost ? ((costDelta / currentCost) * 100).toFixed(1) : '0'

  const currentPerHour = currentCalc?.perHour ?? 0
  const simPerHour = simCalc?.perHour ?? 0

  // Count flags/requirements
  const getFlags = (inputs: any) => {
    const flags = []
    if (inputs?.requiresImmutability) flags.push('Immutability')
    if (inputs?.requiresAirGap) flags.push('Air-gap')
    if (inputs?.hasVMs) flags.push('VMs')
    return flags
  }

  const currentFlags = getFlags(currentInputs)
  const simFlags = getFlags(simulatedInputs)
  const flagsChanged = currentFlags.join(',') !== simFlags.join(',')

  // Top recommended product and savings
  const getTopRecommendation = (advice: any) => {
    const rec = advice?.recommendedProducts?.[0]
    return rec
      ? {
          name: rec.name || '—',
          saved: rec.estAnnualCostAvoided || 0,
        }
      : { name: '—', saved: 0 }
  }

  const currentRec = getTopRecommendation(currentAdvice)
  const simRec = getTopRecommendation(simAdvice)

  const note = simulatedInputs?.simulationNote || 'Simulation applied.'

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-4xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">Simulation: What-If Analysis</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close simulation"
          >
            ✕
          </button>
        </div>

        {/* Simulation Note */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-900">
            <strong>Applied change:</strong> {note}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Metric</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Current</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Simulated</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Delta</th>
              </tr>
            </thead>
            <tbody>
              {/* Path */}
              <tr className={`border-b ${pathChanged ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-2 font-medium">Recommendation Path</td>
                <td className="px-4 py-2">
                  <span className="capitalize">{currentPath}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`capitalize ${pathChanged ? 'font-semibold text-blue-600' : ''}`}>
                    {simPath}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs">
                  {pathChanged ? '✓ Changed' : '—'}
                </td>
              </tr>

              {/* Options */}
              <tr className={`border-b ${optionsChanged ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-2 font-medium">Available Options</td>
                <td className="px-4 py-2 text-xs">{currentOptions}</td>
                <td className="px-4 py-2 text-xs">
                  <span className={optionsChanged ? 'font-semibold text-blue-600' : ''}>
                    {simOptions}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs">
                  {optionsChanged ? '✓ Changed' : '—'}
                </td>
              </tr>

              {/* Total Cost */}
              <tr className="border-b bg-gray-50">
                <td className="px-4 py-2 font-medium">Total Estimated Cost</td>
                <td className="px-4 py-2">{formatCurrency(currentCost)}</td>
                <td className="px-4 py-2 font-semibold text-blue-600">
                  {formatCurrency(simCost)}
                </td>
                <td className={`px-4 py-2 font-semibold text-white text-xs rounded px-2 py-1 ${costDelta > 0 ? 'bg-red-500' : 'bg-green-500'}`}>
                  {costDelta > 0 ? '+' : ''}{formatCurrency(costDelta)} ({costPctChange}%)
                </td>
              </tr>

              {/* Per Hour Cost */}
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Cost per Hour (Downtime)</td>
                <td className="px-4 py-2">{formatCurrency(currentPerHour)}</td>
                <td className="px-4 py-2">{formatCurrency(simPerHour)}</td>
                <td className="px-4 py-2 text-xs">
                  {simPerHour !== currentPerHour ? '✓ Changed' : '—'}
                </td>
              </tr>

              {/* Flags/Requirements */}
              <tr className={`border-b ${flagsChanged ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-2 font-medium">Requirements</td>
                <td className="px-4 py-2 text-xs">
                  {currentFlags.length > 0 ? currentFlags.join(', ') : '(none)'}
                </td>
                <td className="px-4 py-2 text-xs">
                  <span className={flagsChanged ? 'font-semibold text-blue-600' : ''}>
                    {simFlags.length > 0 ? simFlags.join(', ') : '(none)'}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs">
                  {flagsChanged ? '✓ Changed' : '—'}
                </td>
              </tr>

              {/* Top Product Recommendation */}
              <tr className="border-b">
                <td className="px-4 py-2 font-medium">Top Recommendation</td>
                <td className="px-4 py-2 text-xs">{currentRec.name}</td>
                <td className="px-4 py-2 text-xs font-semibold text-blue-600">
                  {simRec.name}
                </td>
                <td className="px-4 py-2 text-xs">
                  {simRec.name !== currentRec.name ? '✓ Changed' : '—'}
                </td>
              </tr>

              {/* Annual Cost Avoided */}
              <tr>
                <td className="px-4 py-2 font-medium">Est. Annual Savings</td>
                <td className="px-4 py-2 text-green-600">
                  {formatCurrency(currentRec.saved)}
                </td>
                <td className="px-4 py-2 text-green-600 font-semibold">
                  {formatCurrency(simRec.saved)}
                </td>
                <td className="px-4 py-2 text-xs">
                  {simRec.saved !== currentRec.saved ? '✓ Changed' : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition"
          >
            Close
          </button>
          {onApply && (
            <button
              onClick={onApply}
              disabled={isApplying}
              title="Replace main inputs with this simulation scenario"
              className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: '#00B388' }}
            >
              {isApplying ? 'Applying...' : 'Apply Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
