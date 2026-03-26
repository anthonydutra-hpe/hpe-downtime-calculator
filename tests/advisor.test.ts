import { advise } from '../lib/advisor'

test('Option D surfaced when immutability required', ()=>{
  const inputs:any = { requiresImmutability: true, hasVMs:false, dataFootprintTB: 10, vmCount:0, missionCriticalVmCount:0, industry: 'other', targetRTO:4, targetRPO:4 }
  const calc = { lostRevenuePerHour: 1000 }
  const out = advise(inputs, calc)
  expect(out.options.find((o:any)=>o.code==='Option D')).toBeTruthy()
})
