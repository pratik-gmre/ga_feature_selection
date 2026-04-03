

import React from 'react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">Generation {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {(Number(p.value) * 100).toFixed(2)}%
        </p>
      ))}
    </div>
  )
}

export default function AccuracyChart({ accuracyHistory = [], baseline = null }) {
  if (!accuracyHistory.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
        No accuracy data yet
      </div>
    )
  }

  const data = accuracyHistory.map((acc, i) => ({
    gen: i + 1,
    'GA Accuracy': parseFloat(acc.toFixed(4)),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7F77DD" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7F77DD" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
        <XAxis
          dataKey="gen"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          label={{ value: 'Generation', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 11 }}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          width={52}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: 8 }} />
        {baseline != null && (
          <ReferenceLine
            y={baseline}
            stroke="#f59e0b"
            strokeDasharray="5 3"
            label={{ value: 'Baseline', fill: '#f59e0b', fontSize: 10, position: 'right' }}
          />
        )}
        <Area
          type="monotone"
          dataKey="GA Accuracy"
          stroke="#7F77DD"
          strokeWidth={2}
          fill="url(#accGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
