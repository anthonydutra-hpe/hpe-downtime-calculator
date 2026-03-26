'use client'
import { useEffect, useState } from 'react'
import InputForm from '../components/InputForm'
import ResultsCard from '../components/ResultsCard'
import SensitivityChart from '../components/SensitivityChart'
import AdvisorHub from '../components/AdvisorHub'
import AssumptionsDrawer from '../components/AssumptionsDrawer'
import PdfExportButton from '../components/PdfExportButton'

const SAMPLE = {
  annualRevenue: 100000000,
  lostRevenuePerHour: 10000,
  targetRTO: 4,
  targetRPO: 4,
  dataFootprintTB: 100,
  industry: 'other',
  hasVMs: true,
  vmCount: 50,
  missionCriticalVmCount: 10,
  requiresImmutability: false,
  requiresAirGap: false,
  hoursDowntime: 1,
  pctRevenueImpacted: 10,
  employees: 1000,
  avgHourlySalary: 50
}

export default function Page() {
  const [inputs, setInputs] = useState<any>(SAMPLE)
  const [calc, setCalc] = useState<any>(null)
  const [advisor, setAdvisor] = useState<any>(null)
  const [overrides, setOverrides] = useState<any>({})
  const [showAssumptions, setShowAssumptions] = useState(false)

  useEffect(() => {
    const q = encodeURIComponent(Buffer.from(JSON.stringify(inputs)).toString('base64'))
    history.replaceState(null, '', `?q=${q}`)

    async function run() {
      const c = await fetch('/api/calc', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(inputs) }).then(r=>r.json())
      setCalc(c)
      // Include overrides when calling advisor
      const a = await fetch('/api/advisor', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({inputs, calc: c, overrides}) }).then(r=>r.json())
      setAdvisor(a)
    }
    run()
  }, [inputs, overrides])

  const handleApplyOverrides = (newOverrides: any) => {
    setOverrides(newOverrides)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Downtime Impact Calculator</h1>
        <button
          onClick={() => setShowAssumptions(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-medium transition"
          aria-label="Open assumptions and thresholds editor"
        >
          ⚙️ Assumptions
          {Object.keys(overrides).length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
              {Object.keys(overrides).length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <InputForm value={inputs} onChange={setInputs} />
        </div>
        <div className="col-span-2 space-y-4">
          <ResultsCard calc={calc} />
          <SensitivityChart inputs={inputs} calc={calc} onChange={setInputs} />
          <AdvisorHub inputs={inputs} calc={calc} advice={advisor} />
          <PdfExportButton />
        </div>
      </div>

      <AssumptionsDrawer
        isOpen={showAssumptions}
        onClose={() => setShowAssumptions(false)}
        inputs={inputs}
        calc={calc}
        currentAdvice={advisor}
        onApplyOverrides={handleApplyOverrides}
      />
    </div>
  )
}
