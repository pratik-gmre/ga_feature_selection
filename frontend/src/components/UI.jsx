/**
 * components/UI.jsx
 * Shared presentational components: MetricCard, Alert, Spinner, Badge,
 * SectionTitle, ProgressBar, ChromosomeViz, GeneGrid.
 */

import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

// ─── MetricCard ─────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, accent = false }) {
  return (
    <div className={`metric-card flex flex-col gap-1 ${accent ? 'border-brand-600' : ''}`}>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className={`text-2xl font-semibold ${accent ? 'text-brand-400' : 'text-gray-100'}`}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

// ─── Alert ──────────────────────────────────────────────────────────────────
const ALERT_STYLES = {
  info:    { bg: 'bg-blue-950/60 border-blue-800 text-blue-300',    Icon: Info },
  success: { bg: 'bg-green-950/60 border-green-800 text-green-300', Icon: CheckCircle },
  error:   { bg: 'bg-red-950/60 border-red-800 text-red-300',       Icon: AlertCircle },
  warning: { bg: 'bg-yellow-950/60 border-yellow-800 text-yellow-300', Icon: AlertTriangle },
}

export function Alert({ type = 'info', children }) {
  const { bg, Icon } = ALERT_STYLES[type] ?? ALERT_STYLES.info
  return (
    <div className={`flex items-start gap-2 px-4 py-3 rounded-lg border text-sm ${bg}`}>
      <Icon size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

// ─── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin text-brand-400"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity=".2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── SectionTitle ────────────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">
      {children}
    </h2>
  )
}

// ─── ProgressBar ────────────────────────────────────────────────────────────
export function ProgressBar({ pct, color = 'bg-brand-400' }) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  )
}

// ─── ChromosomeViz ────────────────────────────────────────────────────────────
/**
 * Visual binary chromosome — coloured squares for selected genes, dark for unselected.
 * @param {number[]} chromosome — binary array (0 | 1)
 * @param {string[]} featureNames — optional label per index
 */
export function ChromosomeViz({ chromosome = [], featureNames = [] }) {
  if (!chromosome.length) return null
  return (
    <div className="flex flex-wrap gap-1">
      {chromosome.map((bit, i) => (
        <div
          key={i}
          title={featureNames[i] ?? `f${i}`}
          className={`gene-pop w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono font-semibold cursor-default select-none transition-colors
            ${bit ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-600'}`}
        >
          {bit}
        </div>
      ))}
    </div>
  )
}

// ─── FeatureTag ──────────────────────────────────────────────────────────────
export function FeatureTag({ name, selected }) {
  return (
    <span
      className={`inline-block text-xs px-2.5 py-1 rounded-md border font-medium
        ${selected
          ? 'bg-brand-600/20 border-brand-600 text-brand-200'
          : 'bg-gray-800 border-gray-700 text-gray-500'
        }`}
    >
      {name}
    </span>
  )
}
