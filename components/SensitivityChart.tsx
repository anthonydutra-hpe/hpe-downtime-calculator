'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import React from 'react'

export default function SensitivityChart({ inputs, calc, onChange }: any) {
  if (!calc) return null
  const data = Array.from({ length: 13 }).map((_, i) => {
    const hours = i
    const total = calc.perHour * hours
    return { hours, total }
  })
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">Sensitivity: Cost vs Hours</h3>
      <div style={{ height: 220 }} className="mt-2">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="hours" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#00B388" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
