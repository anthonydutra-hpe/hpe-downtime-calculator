'use client'

import React, { useState, useEffect } from 'react'

interface Rules {
  highVmCount?: number
  smallMissionCriticalRatio?: number
  smallMissionCriticalMin?: number
  largeDataFootprintTB?: number
  tightRTOFor50?: number
  tightRTOFor250?: number
  restoreAssumptions?: {
    backupRestoreTBPerHour?: number
    snapshotRTOHours?: number
    achievableBackupRPOHours?: number
  }
}

interface AssumptionsDrawerProps {
  isOpen: boolean
  onClose: () => void
  inputs: any
  calc: any
  currentAdvice: any
  onApplyOverrides: (overrides: any) => void
}

export default function AssumptionsDrawer({
  isOpen,
  onClose,
  inputs,
  calc,
  currentAdvice,
  onApplyOverrides,
}: AssumptionsDrawerProps) {
  const [rules, setRules] = useState<Rules | null>(null)
  const [overrides, setOverrides] = useState<any>({})
  const [previewAdvice, setPreviewAdvice] = useState<any>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set())

  // Fetch rules on drawer open
  useEffect(() => {
    if (isOpen && !rules) {
      const fetchRules = async () => {
        try {
          const res = await fetch('/api/rules')
          const data = await res.json()
          setRules(data)
        } catch (err) {
          console.error('Failed to fetch rules:', err)
        }
      }
      fetchRules()
    }
  }, [isOpen, rules])

  // Track which values changed
  const handleOverrideChange = (key: string, value: number) => {
    const newOverrides = { ...overrides }
    
    // Handle nested keys like "restoreAssumptions.backupRestoreTBPerHour"
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      if (!newOverrides[parent]) newOverrides[parent] = {}
      newOverrides[parent][child] = value
    } else {
      newOverrides[key] = value
    }

    setOverrides(newOverrides)

    // Track what changed
    const newChanged = new Set(changedKeys)
    if (rules) {
      let originalValue: any = rules[key as keyof Rules]
      if (key.includes('.')) {
        const [parent, child] = key.split('.')
        originalValue = rules[parent as keyof Rules]?.[child as any]
      }
      if (originalValue !== value) {
        newChanged.add(key)
      } else {
        newChanged.delete(key)
      }
    }
    setChangedKeys(newChanged)
  }

  const handlePreview = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          inputs,
          calc,
          overrides,
        }),
      })
      const data = await res.json()
      setPreviewAdvice(data)
      setIsPreviewing(true)
    } catch (err) {
      console.error('Preview failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    onApplyOverrides(overrides)
    setIsPreviewing(false)
    setOverrides({})
    setChangedKeys(new Set())
    onClose()
  }

  const handleReset = () => {
    setOverrides({})
    setPreviewAdvice(null)
    setIsPreviewing(false)
    setChangedKeys(new Set())
  }

  if (!isOpen || !rules) return null

  const restoreAssumptions = rules.restoreAssumptions || {}

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-start justify-end">
      <div
        className="bg-white h-screen w-full md:w-96 shadow-lg overflow-y-auto"
        role="dialog"
        aria-label="Assumptions Drawer"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assumptions & Thresholds</h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Preview Status Badge */}
        {isPreviewing && (
          <div className="m-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <div className="font-semibold">🔍 Previewing Overrides</div>
            <div className="text-xs mt-1">
              {changedKeys.size} threshold{changedKeys.size !== 1 ? 's' : ''} changed
            </div>
          </div>
        )}

        {/* Editable Form */}
        <div className="p-4 space-y-4">
          <fieldset>
            <legend className="text-sm font-semibold text-gray-700 mb-3">VM Thresholds</legend>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  High VM Count Threshold
                </label>
                <input
                  type="number"
                  value={overrides.highVmCount ?? rules.highVmCount ?? 250}
                  onChange={(e) =>
                    handleOverrideChange('highVmCount', Number(e.target.value))
                  }
                  className="mt-1 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default: {rules.highVmCount}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Small Mission-Critical Ratio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={overrides.smallMissionCriticalRatio ?? rules.smallMissionCriticalRatio ?? 0.1}
                  onChange={(e) =>
                    handleOverrideChange('smallMissionCriticalRatio', Number(e.target.value))
                  }
                  className="mt-1 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default: {rules.smallMissionCriticalRatio}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Small Mission-Critical Min
                </label>
                <input
                  type="number"
                  value={overrides.smallMissionCriticalMin ?? rules.smallMissionCriticalMin ?? 10}
                  onChange={(e) =>
                    handleOverrideChange('smallMissionCriticalMin', Number(e.target.value))
                  }
                  className="mt-1 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default: {rules.smallMissionCriticalMin}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-gray-700 mb-3">Data & Storage</legend>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Large Data Footprint (TB)
                </label>
                <input
                  type="number"
                  value={overrides.largeDataFootprintTB ?? rules.largeDataFootprintTB ?? 500}
                  onChange={(e) =>
                    handleOverrideChange('largeDataFootprintTB', Number(e.target.value))
                  }
                  className="mt-1 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default: {rules.largeDataFootprintTB}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-gray-700 mb-3">RTO Thresholds</legend>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Tight RTO for 50 VMs (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={overrides.tightRTOFor50 ?? rules.tightRTOFor50 ?? 1}
                  onChange={(e) =>
                    handleOverrideChange('tightRTOFor50', Number(e.target.value))
                  }
                  className="mt-1 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default: {rules.tightRTOFor50}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Tight RTO for 250 VMs (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={overrides.tightRTOFor250 ?? rules.tightRTOFor250 ?? 4}
                  onChange={(e) =>
                    handleOverrideChange('tightRTOFor250', Number(e.target.value))
                  }
                  className="mt-1 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default: {rules.tightRTOFor250}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-gray-700 mb-3">Restore Assumptions</legend>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Backup Restore Rate (TB/hour)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={overrides['restoreAssumptions.backupRestoreTBPerHour'] ??
                    restoreAssumptions.backupRestoreTBPerHour ??
                    1.5}
                  onChange={(e) =>
                    handleOverrideChange(
                      'restoreAssumptions.backupRestoreTBPerHour',
                      Number(e.target.value)
                    )
                  }
                  className="mt-1 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default: {restoreAssumptions.backupRestoreTBPerHour}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Snapshot RTO (hours)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={overrides['restoreAssumptions.snapshotRTOHours'] ??
                    restoreAssumptions.snapshotRTOHours ??
                    0.1}
                  onChange={(e) =>
                    handleOverrideChange(
                      'restoreAssumptions.snapshotRTOHours',
                      Number(e.target.value)
                    )
                  }
                  className="mt-1 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default: {restoreAssumptions.snapshotRTOHours}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Achievable Backup RPO (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={overrides['restoreAssumptions.achievableBackupRPOHours'] ??
                    restoreAssumptions.achievableBackupRPOHours ??
                    4}
                  onChange={(e) =>
                    handleOverrideChange(
                      'restoreAssumptions.achievableBackupRPOHours',
                      Number(e.target.value)
                    )
                  }
                  className="mt-1 w-full px-2 py-1 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Default: {restoreAssumptions.achievableBackupRPOHours}
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Preview Pane */}
        {isPreviewing && previewAdvice && (
          <div className="border-t m-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-sm mb-2">Preview Results</h3>
            <div className="text-xs space-y-2">
              <div>
                <strong>Path:</strong> {previewAdvice.path}
              </div>
              <div>
                <strong>Options:</strong>{' '}
                {previewAdvice.options?.map((o: any) => o.code).join(', ') || 'None'}
              </div>
              <div>
                <strong>Recommendations:</strong>{' '}
                {previewAdvice.recommendedProducts?.length || 0} products
              </div>
              {previewAdvice.flags?.length > 0 && (
                <div>
                  <strong>Flags:</strong> {previewAdvice.flags.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-4 space-y-2">
          <button
            onClick={handlePreview}
            disabled={loading || Object.keys(overrides).length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          >
            {loading ? 'Loading...' : 'Preview'}
          </button>

          <button
            onClick={handleApply}
            disabled={!isPreviewing}
            className="w-full px-4 py-2 bg-green-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
          >
            Apply Overrides
          </button>

          <button
            onClick={handleReset}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition"
          >
            Reset
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
