'use client'
import { useEffect, useState } from 'react'
import InputForm from '../components/InputForm'
import ResultsCard from '../components/ResultsCard'
import SensitivityChart from '../components/SensitivityChart'
import AdvisorPanel from '../components/AdvisorPanel'
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

  useEffect(() => {
    const q = encodeURIComponent(Buffer.from(JSON.stringify(inputs)).toString('base64'))
    history.replaceState(null, '', `?q=${q}`)

    async function run() {
      const c = await fetch('/api/calc', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(inputs) }).then(r=>r.json())
      setCalc(c)
      const a = await fetch('/api/advisor', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({inputs, calc: c}) }).then(r=>r.json())
      setAdvisor(a)
    }
    run()
  }, [inputs])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <InputForm value={inputs} onChange={setInputs} />
        </div>
        <div className="col-span-2 space-y-4">
          <ResultsCard calc={calc} />
          <SensitivityChart inputs={inputs} calc={calc} onChange={setInputs} />
          <AdvisorPanel advisor={advisor} />
          <PdfExportButton />
        </div>
      </div>
    </div>
  )
}
