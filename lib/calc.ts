export function calculate(inputs:any){
  const annualRevenue = Number(inputs.annualRevenue || 0)
  const pctRevenueImpacted = Number(inputs.pctRevenueImpacted || 0)
  let lostRevenuePerHour = Number(inputs.lostRevenuePerHour || 0)
  if (!lostRevenuePerHour || lostRevenuePerHour <= 0) {
    lostRevenuePerHour = (annualRevenue / (365*24)) * (pctRevenueImpacted/100)
  }
  const employees = Number(inputs.employees || 0)
  const avgHourlySalary = Number(inputs.avgHourlySalary || 0)
  const productivityLossPerHour = Math.max(0, employees * avgHourlySalary * 0.3)
  const hoursDowntime = Number(inputs.hoursDowntime || 1)
  const totalDirectCost = lostRevenuePerHour * hoursDowntime
  const totalProductivityCost = productivityLossPerHour * hoursDowntime
  const totalEstimatedCost = totalDirectCost + totalProductivityCost
  const perHour = lostRevenuePerHour + productivityLossPerHour
  const perMinute = perHour / 60
  return {
    inputsEcho: inputs,
    lostRevenuePerHour,
    productivityLossPerHour,
    totalDirectCost,
    totalProductivityCost,
    totalEstimatedCost,
    perHour,
    perMinute
  }
}
