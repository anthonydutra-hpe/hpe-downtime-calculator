'use client'
export default function AdvisorPanel({ advisor }: any) {
  if (!advisor) return <div className="bg-white p-4 rounded shadow">Loading advisor...</div>
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold">Advisor</h2>
      <div className="mt-2">
        <div><strong>Path:</strong> {advisor.path}</div>
        <div><strong>Options:</strong> {advisor.options?.map((o:any)=>o.code).join(', ')}</div>
        <div className="mt-2"><strong>Recommendations:</strong>
          <ul className="list-disc pl-6">
            {advisor.recommendedProducts?.map((p:any, i:number)=> (<li key={i}><strong>{p.name}:</strong> {p.rationale}</li>))}
          </ul>
        </div>
        {advisor.flags?.length>0 && (
          <div className="mt-2 text-red-600"><strong>Flags:</strong> {advisor.flags.join(', ')}</div>
        )}
        <div className="mt-2"><strong>5-year roadmap:</strong>
          <ol className="list-decimal pl-6">
            {advisor.roadmap?.years?.map((y:any,i:number)=>(<li key={i}>{y}</li>))}
          </ol>
        </div>
      </div>
    </div>
  )
}
