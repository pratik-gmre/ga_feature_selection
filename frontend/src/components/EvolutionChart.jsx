/**
 * components/EvolutionChart.jsx
 * Recharts line chart showing best / avg / worst fitness per generation.
 */

import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">Generation {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(4)}
        </p>
      ))}
    </div>
  )
}

export default function EvolutionChart({ history = [] }) {
  if (!history.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
        Run the GA to see evolution progress
      </div>
    )
  }

  const data = history.map((h) => ({
    gen:   h.generation,
    Best:  parseFloat(h.best_fitness.toFixed(4)),
    Avg:   parseFloat(h.avg_fitness.toFixed(4)),
    Worst: parseFloat(h.worst_fitness.toFixed(4)),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
        <XAxis
          dataKey="gen"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          label={{ value: 'Generation', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 11 }}
        />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} width={52} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: 8 }}
        />
        <Line type="monotone" dataKey="Best"  stroke="#7F77DD" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Avg"   stroke="#1D9E75" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
        <Line type="monotone" dataKey="Worst" stroke="#ef4444" strokeWidth={1}   dot={false} strokeDasharray="2 4" />
      </LineChart>
    </ResponsiveContainer>
  )
}
