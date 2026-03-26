'use client'
import React from 'react'

export default function InputForm({ value, onChange }: any) {
  const handle = (k:any, v:any) => onChange({ ...value, [k]: v })
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Inputs</h2>
      <label className="block text-sm">Annual revenue (USD)</label>
      <input type="number" value={value.annualRevenue} onChange={e=>handle('annualRevenue', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="block text-sm">Lost revenue per hour (optional)</label>
      <input type="number" value={value.lostRevenuePerHour} onChange={e=>handle('lostRevenuePerHour', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="block text-sm">Target RTO (hours)</label>
      <input type="number" value={value.targetRTO} onChange={e=>handle('targetRTO', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="block text-sm">Target RPO (hours)</label>
      <input type="number" value={value.targetRPO} onChange={e=>handle('targetRPO', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="block text-sm">Data footprint (TB)</label>
      <input type="number" value={value.dataFootprintTB} onChange={e=>handle('dataFootprintTB', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="block text-sm">Industry</label>
      <select value={value.industry} onChange={e=>handle('industry', e.target.value)} className="w-full p-2 border rounded mb-2">
        <option value="finance">Finance</option>
        <option value="healthcare">Healthcare</option>
        <option value="other">Other</option>
      </select>
      <label className="flex items-center gap-2"><input type="checkbox" checked={value.hasVMs} onChange={e=>handle('hasVMs', e.target.checked)} /> Has VMs</label>
      <label className="block text-sm mt-2">VM count</label>
      <input type="number" value={value.vmCount} onChange={e=>handle('vmCount', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="block text-sm">Mission-critical VM count</label>
      <input type="number" value={value.missionCriticalVmCount} onChange={e=>handle('missionCriticalVmCount', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="flex items-center gap-2"><input type="checkbox" checked={value.requiresImmutability} onChange={e=>handle('requiresImmutability', e.target.checked)} /> Requires immutability</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={value.requiresAirGap} onChange={e=>handle('requiresAirGap', e.target.checked)} /> Requires air-gap</label>
      <label className="block text-sm mt-2">Hours downtime</label>
      <input type="number" value={value.hoursDowntime} onChange={e=>handle('hoursDowntime', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="block text-sm">% Revenue Impacted</label>
      <input type="number" value={value.pctRevenueImpacted} onChange={e=>handle('pctRevenueImpacted', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="block text-sm">Employees</label>
      <input type="number" value={value.employees} onChange={e=>handle('employees', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
      <label className="block text-sm">Avg hourly salary (USD)</label>
      <input type="number" value={value.avgHourlySalary} onChange={e=>handle('avgHourlySalary', Number(e.target.value))} className="w-full p-2 border rounded mb-2" />
    </div>
  )
}
