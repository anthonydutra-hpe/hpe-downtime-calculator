'use client'
export default function ResultsCard({ calc }: any) {
  if (!calc) return <div className="bg-white p-4 rounded shadow">Calculating...</div>
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold">Results</h2>
      <div className="mt-2">
        <div>Per hour: ${calc.perHour.toFixed(2)}</div>
        <div>Per minute: ${calc.perMinute.toFixed(2)}</div>
        <div>Total estimated cost: ${calc.totalEstimatedCost.toFixed(2)}</div>
      </div>
    </div>
  )
}
