'use client'
import React from 'react'
import { estimateCostForOption } from '@/lib/costModel'
import { formatCurrency } from '@/lib/formatting'

interface CostEstimateModalProps {
  optionCode: string
  vmCount: number
  dataFootprintTB: number
  onClose: () => void
}

export default function CostEstimateModal({
  optionCode,
  vmCount,
  dataFootprintTB,
  onClose,
}: CostEstimateModalProps) {
  const estimate = estimateCostForOption(optionCode, vmCount, dataFootprintTB)

  const getExplanation = (code: string): string => {
    switch (code) {
      case 'Option A':
        return 'Per-VM backup appliances with StoreOnce deduplication. Scales linearly with VM count and storage footprint.'
      case 'Option B':
        return 'Zerto continuous replication with cloud bank scalability. Cluster-based sizing with flexible storage options.'
      case 'Option C':
        return 'Alletra MP X10000 for large-scale environments. Enterprise-grade performance with higher base cost.'
      case 'Option D':
        return 'Cyber Resilience Vault for immutable backup with air-gap support. Highest protection with premium pricing.'
      default:
        return 'Cost estimate based on input parameters.'
    }
  }

  const handleExportPDF = () => {
    // Trigger the browser print dialog to capture modal content
    window.print()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{optionCode} — Cost Estimate</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close cost estimate modal"
          >
            ✕
          </button>
        </div>

        {/* Assumptions */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Assumptions</h4>
          <div className="text-sm text-gray-700 space-y-1">
            {estimate.assumptions.vmCount !== undefined && (
              <div>
                <strong>VM Count:</strong> {estimate.assumptions.vmCount}
              </div>
            )}
            {estimate.assumptions.clusterCount !== undefined && (
              <div>
                <strong>Cluster Count:</strong> {estimate.assumptions.clusterCount}
              </div>
            )}
            <div>
              <strong>Data Footprint:</strong> {estimate.assumptions.dataFootprintTB} TB
            </div>
          </div>
        </div>

        {/* CAPEX Section */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Capital Expenditure (CAPEX)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 border border-gray-200 rounded">
              <div className="text-xs text-gray-600 font-medium">Conservative</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(estimate.capex.low)}
              </div>
            </div>
            <div className="p-3 border border-gray-200 rounded bg-blue-50">
              <div className="text-xs text-gray-600 font-medium">Mid-Range</div>
              <div className="text-lg font-semibold text-blue-900 mt-1">
                {formatCurrency(estimate.capex.mid)}
              </div>
            </div>
            <div className="p-3 border border-gray-200 rounded">
              <div className="text-xs text-gray-600 font-medium">Aggressive</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(estimate.capex.high)}
              </div>
            </div>
          </div>
        </div>

        {/* OPEX Section */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Annual Operating Expense (OPEX)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 border border-gray-200 rounded">
              <div className="text-xs text-gray-600 font-medium">Conservative</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(estimate.opexPerYear.low)}/yr
              </div>
            </div>
            <div className="p-3 border border-gray-200 rounded bg-green-50">
              <div className="text-xs text-gray-600 font-medium">Mid-Range</div>
              <div className="text-lg font-semibold text-green-900 mt-1">
                {formatCurrency(estimate.opexPerYear.mid)}/yr
              </div>
            </div>
            <div className="p-3 border border-gray-200 rounded">
              <div className="text-xs text-gray-600 font-medium">Aggressive</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(estimate.opexPerYear.high)}/yr
              </div>
            </div>
          </div>
        </div>

        {/* Confidence & Explanation */}
        <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded">
          <div className="flex items-start gap-3">
            <div className="text-sm">
              <div className="font-semibold text-gray-800 mb-2">
                Confidence: <span className="text-yellow-700">{estimate.confidence}</span>
              </div>
              <p className="text-sm text-gray-700">{getExplanation(optionCode)}</p>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Note:</strong> This is a ballpark estimate based on typical deployment patterns. Actual costs
                may vary based on implementation complexity, licensing details, and support options.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
            style={{ background: '#00B388' }}
          >
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  )
}
