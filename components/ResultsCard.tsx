'use client'
import { formatCurrency } from '@/lib/formatting'

export default function ResultsCard({ calc }: any) {
  if (!calc) return <div className="bg-white p-4 rounded shadow">Fill in the form and results will appear here</div>
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold">Results</h2>
      <div className="mt-2">
        <div>Per hour: {formatCurrency(calc.perHour)}</div>
        <div>Per minute: {formatCurrency(calc.perMinute)}</div>
        <div>Total estimated cost: {formatCurrency(calc.totalEstimatedCost)}</div>
      </div>
    </div>
  )
}
