/**
 * pages/Results.jsx
 * Shows the final GA result: best feature subset, accuracy charts,
 * chromosome visualization, and GA vs. all-features comparison.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useGA } from '../context/GAContext'
import { Alert, MetricCard, ChromosomeViz, FeatureTag, SectionTitle } from '../components/UI'
import AccuracyChart from '../components/AccuracyChart'
import EvolutionChart from '../components/EvolutionChart'

export default function Results() {
  const navigate  = useNavigate()
  const { results, history, accuracyHistory, datasetMeta, status } = useGA()

  if (status !== 'done' || !results) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pt-8">
        <Alert type="warning">
          No results yet. Run the Genetic Algorithm on the{' '}
          <button className="underline" onClick={() => navigate('/simulate')}>Simulation page</button> first.
        </Alert>
      </div>
    )
  }

  const r = results.result           // /run response.result
  const meta = datasetMeta

  const deltaAcc   = r.accuracy - r.baseline_accuracy
  const deltaSign  = deltaAcc > 0.0005 ? 'up' : deltaAcc < -0.0005 ? 'down' : 'same'
  const DeltaIcon  = deltaSign === 'up' ? TrendingUp : deltaSign === 'down' ? TrendingDown : Minus
  const deltaColor = deltaSign === 'up' ? 'text-accent-400' : deltaSign === 'down' ? 'text-red-400' : 'text-gray-400'

  // Build full binary chromosome array from selected_indices
  const n = r.n_total
  const chromosome = Array.from({ length: n }, (_, i) =>
    r.selected_indices.includes(i) ? 1 : 0
  )
  const featureNames = meta?.feature_names ?? Array.from({ length: n }, (_, i) => `f${i}`)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Results</h1>
          <p className="text-gray-400 text-sm mt-1">
            Best feature subset found by the Genetic Algorithm after {history.length} generations.
          </p>
        </div>
        <button
          className="btn-secondary flex items-center gap-2 shrink-0"
          onClick={() => navigate('/simulate')}
        >
          <RotateCcw size={13} /> Run Again
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="GA Accuracy"
          value={`${(r.accuracy * 100).toFixed(2)}%`}
          accent
        />
        <MetricCard
          label="Baseline Accuracy"
          value={`${(r.baseline_accuracy * 100).toFixed(2)}%`}
          sub="(all features)"
        />
        <MetricCard
          label="Features Selected"
          value={`${r.n_selected} / ${r.n_total}`}
          sub={`${r.feature_reduction_pct}% reduction`}
        />
        <MetricCard
          label="Accuracy Delta"
          value={
            <span className={deltaColor}>
              {deltaSign === 'up' ? '+' : ''}{(deltaAcc * 100).toFixed(2)}%
            </span>
          }
          sub={<span className={`flex items-center gap-1 ${deltaColor}`}><DeltaIcon size={12} /> vs baseline</span>}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <SectionTitle>GA Accuracy over Generations</SectionTitle>
          <AccuracyChart
            accuracyHistory={accuracyHistory}
            baseline={r.baseline_accuracy}
          />
          <div className="flex gap-4 mt-2 text-xs text-gray-600">
            <span><span className="inline-block w-3 h-0.5 bg-brand-400 mr-1 align-middle"></span>GA accuracy</span>
            <span><span className="inline-block w-3 h-0.5 bg-yellow-500 mr-1 align-middle border-dashed"></span>Baseline</span>
          </div>
        </div>

        <div className="card">
          <SectionTitle>Fitness Landscape</SectionTitle>
          <EvolutionChart history={history} />
          <div className="flex gap-4 mt-2 text-xs text-gray-600">
            <span><span className="inline-block w-3 h-0.5 bg-brand-400 mr-1 align-middle"></span>Best</span>
            <span><span className="inline-block w-3 h-0.5 bg-accent-400 mr-1 align-middle"></span>Avg</span>
            <span><span className="inline-block w-3 h-0.5 bg-red-500 mr-1 align-middle"></span>Worst</span>
          </div>
        </div>
      </div>

      {/* GA vs Baseline comparison table */}
      <div className="card">
        <SectionTitle>GA vs Baseline Comparison</SectionTitle>
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left py-2 font-medium">Metric</th>
                <th className="text-right py-2 font-medium">All Features (Baseline)</th>
                <th className="text-right py-2 font-medium">GA Selected</th>
                <th className="text-right py-2 font-medium">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="py-2.5 text-gray-300">Accuracy</td>
                <td className="py-2.5 text-right font-mono text-gray-400">{(r.baseline_accuracy * 100).toFixed(2)}%</td>
                <td className="py-2.5 text-right font-mono text-brand-300">{(r.accuracy * 100).toFixed(2)}%</td>
                <td className={`py-2.5 text-right font-mono ${deltaColor}`}>
                  {deltaSign === 'up' ? '+' : ''}{(deltaAcc * 100).toFixed(2)}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-gray-300">Features used</td>
                <td className="py-2.5 text-right font-mono text-gray-400">{r.n_total}</td>
                <td className="py-2.5 text-right font-mono text-brand-300">{r.n_selected}</td>
                <td className="py-2.5 text-right font-mono text-accent-400">−{r.n_total - r.n_selected}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-gray-300">Feature reduction</td>
                <td className="py-2.5 text-right font-mono text-gray-400">0%</td>
                <td className="py-2.5 text-right font-mono text-brand-300">{r.feature_reduction_pct}%</td>
                <td className="py-2.5 text-right font-mono text-accent-400">↓ {r.feature_reduction_pct}%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-gray-300">Model</td>
                <td className="py-2.5 text-right text-gray-500 text-xs" colSpan={3}>{r.model_name?.replace(/_/g, ' ')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature grid */}
      <div className="card">
        <SectionTitle>All Features — selected vs excluded</SectionTitle>
        <div className="flex flex-wrap gap-2 mt-1">
          {featureNames.map((name, i) => (
            <FeatureTag key={i} name={name} selected={chromosome[i] === 1} />
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-600">
          <span><span className="inline-block w-2 h-2 rounded-sm bg-brand-600 mr-1 align-middle"></span>Selected by GA</span>
          <span><span className="inline-block w-2 h-2 rounded-sm bg-gray-800 mr-1 align-middle"></span>Excluded</span>
        </div>
      </div>

      {/* Selected features list */}
      <div className="card">
        <SectionTitle>Selected Feature Names</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {r.selected_features.map((name, i) => (
            <div key={i} className="flex items-center gap-2 bg-brand-900/30 border border-brand-800/50 rounded-lg px-3 py-2">
              <span className="text-brand-400 font-mono text-xs font-semibold w-5">{r.selected_indices[i]}</span>
              <span className="text-sm text-gray-200">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chromosome binary visualization */}
      <div className="card">
        <SectionTitle>Best Chromosome (binary encoding)</SectionTitle>
        <ChromosomeViz chromosome={chromosome} featureNames={featureNames} />
        <p className="text-xs text-gray-600 mt-3">
          Each square = one feature. <span className="text-brand-400">Purple = selected (1)</span> · <span className="text-gray-500">Dark = excluded (0)</span> · Hover to see feature name.
        </p>
      </div>

      {/* GA history summary */}
      {history.length > 0 && (
        <div className="card">
          <SectionTitle>Evolution Summary</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Total Generations" value={history.length} />
            <MetricCard label="Best Fitness"  value={Math.max(...history.map(h => h.best_fitness)).toFixed(4)} accent />
            <MetricCard label="Initial Fitness" value={history[0]?.best_fitness.toFixed(4)} />
            <MetricCard label="Improvement"
              value={`+${(Math.max(...history.map(h => h.best_fitness)) - history[0]?.best_fitness).toFixed(4)}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
