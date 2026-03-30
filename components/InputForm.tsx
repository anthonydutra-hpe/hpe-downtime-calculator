'use client'
import React from 'react'
import { useState } from 'react'
import { formatCurrency, parseCurrency, formatNumber, parseInteger } from '@/lib/formatting'

interface InputFormProps {
  value: any
  onChange: (values: any) => void
}

// Fields that display as formatted currency with $ symbol
const CURRENCY_FIELDS = {
  annualRevenue: { fractionDigits: 0 },
  lostRevenuePerHour: { fractionDigits: 0 },
  avgHourlySalary: { fractionDigits: 2 },
}

// Fields that display as grouped integers (no currency symbol)
const INTEGER_GROUPED_FIELDS = new Set(['employees'])

export default function InputForm({ value, onChange }: InputFormProps) {
  const [errors, setErrors] = useState<any>({})
  const [editingField, setEditingField] = useState<string | null>(null)

  const set = (k: string, v: any) => {
    let finalValue
    if (v === '') {
      finalValue = null
    } else if (k === 'industry') {
      finalValue = v
    } else if (typeof v === 'string') {
      // For string inputs, parse them to remove formatting (e.g., commas)
      finalValue = parseInteger(v)
    } else {
      finalValue = v
    }
    onChange({ ...value, [k]: finalValue })
    // Clear error for this field when user starts typing
    if (errors[k]) {
      setErrors({ ...errors, [k]: '' })
    }
  }

  const handleFieldFocus = (key: string) => {
    setEditingField(key)
  }

  const handleFieldBlur = (key: string, inputStr: string) => {
    setEditingField(null)
    if (key in CURRENCY_FIELDS) {
      const parsed = parseCurrency(inputStr)
      set(key, parsed === null ? '' : parsed)
    } else if (INTEGER_GROUPED_FIELDS.has(key)) {
      const parsed = parseInteger(inputStr)
      set(key, parsed === null ? '' : parsed)
    }
  }

  const getDisplayValue = (key: string, numericValue: number | null): string => {
    if (editingField === key) {
      // While editing, show unformatted number
      return numericValue === null ? '' : String(numericValue)
    }
    // When not editing, show formatted based on field type
    if (key in CURRENCY_FIELDS) {
      return formatCurrency(numericValue, { fractionDigits: (CURRENCY_FIELDS as any)[key].fractionDigits })
    }
    if (INTEGER_GROUPED_FIELDS.has(key)) {
      return formatNumber(numericValue)
    }
    return numericValue === null ? '' : String(numericValue)
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Inputs</h2>
      <label className="block text-sm">Annual revenue (USD)</label>
      <input
        type="text"
        placeholder="e.g. 100000000"
        value={getDisplayValue('annualRevenue', value.annualRevenue)}
        onFocus={() => handleFieldFocus('annualRevenue')}
        onBlur={(e) => handleFieldBlur('annualRevenue', e.target.value)}
        onChange={(e) => {
          if (editingField === 'annualRevenue') {
            // Allow any input while editing; sanitize on blur
            set('annualRevenue', e.target.value)
          }
        }}
        className="w-full p-2 border rounded mb-2"
      />
      {errors.annualRevenue && <p className="text-red-500 text-xs mb-2">{errors.annualRevenue}</p>}
      
      <label className="block text-sm">Lost revenue per hour (optional)</label>
      <input
        type="text"
        placeholder="e.g. 10000"
        value={getDisplayValue('lostRevenuePerHour', value.lostRevenuePerHour)}
        onFocus={() => handleFieldFocus('lostRevenuePerHour')}
        onBlur={(e) => handleFieldBlur('lostRevenuePerHour', e.target.value)}
        onChange={(e) => {
          if (editingField === 'lostRevenuePerHour') {
            set('lostRevenuePerHour', e.target.value)
          }
        }}
        className="w-full p-2 border rounded mb-2"
      />
      
      <label className="block text-sm">Target RTO (hours)</label>
      <input
        type="number"
        placeholder="4"
        value={value.targetRTO === null ? '' : value.targetRTO}
        onChange={e => set('targetRTO', e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      {errors.targetRTO && <p className="text-red-500 text-xs mb-2">{errors.targetRTO}</p>}
      
      <label className="block text-sm">Target RPO (hours)</label>
      <input
        type="number"
        placeholder="4"
        value={value.targetRPO === null ? '' : value.targetRPO}
        onChange={e => set('targetRPO', e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      {errors.targetRPO && <p className="text-red-500 text-xs mb-2">{errors.targetRPO}</p>}
      
      <label className="block text-sm">Data footprint (TB)</label>
      <input
        type="number"
        placeholder="100"
        value={value.dataFootprintTB === null ? '' : value.dataFootprintTB}
        onChange={e => set('dataFootprintTB', e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      {errors.dataFootprintTB && <p className="text-red-500 text-xs mb-2">{errors.dataFootprintTB}</p>}
      
      <label className="block text-sm">Industry</label>
      <select
        value={value.industry || 'other'}
        onChange={e => set('industry', e.target.value)}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="finance">Finance</option>
        <option value="healthcare">Healthcare</option>
        <option value="other">Other</option>
      </select>
      
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.hasVMs || false}
          onChange={e => set('hasVMs', e.target.checked)}
        />
        Has VMs
      </label>
      
      <label className="block text-sm mt-2">VM count</label>
      <input
        type="number"
        placeholder="50"
        value={value.vmCount === null ? '' : value.vmCount}
        onChange={e => set('vmCount', e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      
      <label className="block text-sm">Mission-critical VM count</label>
      <input
        type="number"
        placeholder="10"
        value={value.missionCriticalVmCount === null ? '' : value.missionCriticalVmCount}
        onChange={e => set('missionCriticalVmCount', e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.requiresImmutability || false}
          onChange={e => set('requiresImmutability', e.target.checked)}
        />
        Requires immutability
      </label>
      
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.requiresAirGap || false}
          onChange={e => set('requiresAirGap', e.target.checked)}
        />
        Requires air-gap
      </label>
      
      <label className="block text-sm mt-2">Hours downtime</label>
      <input
        type="number"
        placeholder="1"
        value={value.hoursDowntime === null ? '' : value.hoursDowntime}
        onChange={e => set('hoursDowntime', e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      {errors.hoursDowntime && <p className="text-red-500 text-xs mb-2">{errors.hoursDowntime}</p>}
      
      <label className="block text-sm">% Revenue Impacted</label>
      <input
        type="number"
        placeholder="10"
        value={value.pctRevenueImpacted === null ? '' : value.pctRevenueImpacted}
        onChange={e => set('pctRevenueImpacted', e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      
      <label className="block text-sm">Employees</label>
      <input
        type="text"
        placeholder="e.g. 1000"
        value={getDisplayValue('employees', value.employees)}
        onFocus={() => handleFieldFocus('employees')}
        onBlur={(e) => handleFieldBlur('employees', e.target.value)}
        onChange={(e) => {
          if (editingField === 'employees') {
            set('employees', e.target.value)
          }
        }}
        className="w-full p-2 border rounded mb-2"
      />
      
      <label className="block text-sm">Avg hourly salary (USD)</label>
      <input
        type="text"
        placeholder="e.g. 50"
        value={getDisplayValue('avgHourlySalary', value.avgHourlySalary)}
        onFocus={() => handleFieldFocus('avgHourlySalary')}
        onBlur={(e) => handleFieldBlur('avgHourlySalary', e.target.value)}
        onChange={(e) => {
          if (editingField === 'avgHourlySalary') {
            set('avgHourlySalary', e.target.value)
          }
        }}
        className="w-full p-2 border rounded mb-2"
      />
    </div>
  )
}
