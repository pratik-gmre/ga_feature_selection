/**
 * pages/Simulation.jsx
 * Configure GA params, run full evolution or step-by-step,
 * watch live fitness + chromosome visualization.
 */

import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Square, ChevronRight, RotateCcw, ArrowRight } from 'lucide-react'
import { useGA } from '../context/GAContext'
import { initializeGA, runGA, stepGA } from '../services/api'
import { Alert, MetricCard, Spinner, ProgressBar, ChromosomeViz, SectionTitle } from '../components/UI'
import GAConfigForm from '../components/GAConfigForm'
import EvolutionChart from '../components/EvolutionChart'

export default function Simulation() {
  const navigate = useNavigate()
  const {
    sessionId, gaConfig, datasetMeta, setDatasetMeta,
    status, setStatus,
    generation, setGeneration,
    history, setHistory,
    accuracyHistory, setAccuracyHistory,
    bestChromosome, setBestChromosome,
    bestAccuracy, setBestAccuracy,
    setResults, error, setError,
    resetSimulation,
  } = useGA()

  const [loading, setLoading]     = useState(false)
  const [initDone, setInitDone]   = useState(false)
  const [localMsg, setLocalMsg]   = useState(null)
  const abortRef = useRef(false)

  // ── Initialize ─────────────────────────────────────────────────────────────
  const handleInit = useCallback(async () => {
    if (!sessionId) { setError('Upload a dataset first.'); return }
    if (!gaConfig.target_column) { setError('Select a target column on the Upload page.'); return }
    setLoading(true); setError(null); setLocalMsg(null)
    resetSimulation()
    setInitDone(false)
    try {
      const res = await initializeGA({
        session_id:      sessionId,
        target_column:   gaConfig.target_column,
        model_name:      gaConfig.model_name,
        population_size: gaConfig.population_size,
        mutation_rate:   gaConfig.mutation_rate,
        crossover_rate:  gaConfig.crossover_rate,
        alpha:           gaConfig.alpha,
        elitism_count:   gaConfig.elitism_count,
        test_size:       gaConfig.test_size,
      })
      setDatasetMeta(res.dataset_meta)
      setStatus('initialized')
      setInitDone(true)
      setLocalMsg({ type: 'success', text: `GA ready — ${res.dataset_meta.n_features} features, baseline ${(res.dataset_meta.baseline_accuracy * 100).toFixed(1)}%` })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [sessionId, gaConfig, resetSimulation, setDatasetMeta, setError, setStatus])

  // ── Full run ────────────────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!initDone) { setError('Click Initialize first.'); return }
    abortRef.current = false
    setLoading(true); setStatus('running'); setError(null)
    try {
      const res = await runGA(sessionId, gaConfig.n_generations, gaConfig.crossover_type)
      if (abortRef.current) return
      setHistory(res.history)
      setAccuracyHistory(res.accuracy_history)
      setGeneration(res.total_generations)
      if (res.result) {
        setBestAccuracy(res.result.accuracy)
        setBestChromosome(
          Array.from({ length: res.result.n_total }, (_, i) =>
            res.result.selected_indices.includes(i) ? 1 : 0
          )
        )
        setResults(res)
      }
      setStatus('done')
    } catch (e) {
      setError(e.message); setStatus('error')
    } finally {
      setLoading(false)
    }
  }, [initDone, sessionId, gaConfig, setHistory, setAccuracyHistory, setGeneration,
      setBestAccuracy, setBestChromosome, setResults, setStatus, setError])

  // ── Single step ─────────────────────────────────────────────────────────────
  const handleStep = useCallback(async () => {
    if (!initDone) { setError('Click Initialize first.'); return }
    setLoading(true); setError(null)
    try {
      const res = await stepGA(sessionId, gaConfig.crossover_type)
      setHistory(res.history)
      setGeneration(res.generation)
      if (res.best_accuracy != null) setBestAccuracy(res.best_accuracy)
      setStatus('running')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [initDone, sessionId, gaConfig, setHistory, setGeneration, setBestAccuracy, setStatus, setError])

  const handleReset = () => {
    abortRef.current = true
    resetSimulation()
    setInitDone(false)
    setLocalMsg(null)
  }

  const totalGen = gaConfig.n_generations
  const pct = totalGen > 0 ? (generation / totalGen) * 100 : 0
  const featureNames = datasetMeta?.feature_names ?? []
  const latestEntry  = history[history.length - 1]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Simulation</h1>
        <p className="text-gray-400 text-sm mt-1">Configure, initialize, then run the Genetic Algorithm.</p>
      </div>

      {!sessionId && (
        <Alert type="warning">No dataset uploaded yet. <button className="underline ml-1" onClick={() => navigate('/upload')}>Upload one →</button></Alert>
      )}
      {error && <Alert type="error">{error}</Alert>}
      {localMsg && <Alert type={localMsg.type}>{localMsg.text}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left panel: config + controls ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card space-y-4">
            <SectionTitle>GA Parameters</SectionTitle>
            <GAConfigForm disabled={loading} />
          </div>

          {/* Action buttons */}
          <div className="card space-y-3">
            <SectionTitle>Controls</SectionTitle>
            <button
              className="btn-secondary w-full flex items-center justify-center gap-2"
              onClick={handleInit}
              disabled={loading || !sessionId}
            >
              {loading && !initDone ? <Spinner size={14} /> : <RotateCcw size={14} />}
              Initialize GA
            </button>
            <button
              className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={handleRun}
              disabled={loading || !initDone}
            >
              {loading && status === 'running' ? <Spinner size={14} /> : <Play size={14} />}
              Run Full GA ({gaConfig.n_generations} generations)
            </button>
            <button
              className="btn-secondary w-full flex items-center justify-center gap-2"
              onClick={handleStep}
              disabled={loading || !initDone}
            >
              <ChevronRight size={14} /> Step One Generation
            </button>
            <button
              className="btn-secondary w-full flex items-center justify-center gap-2 text-red-400 border-red-900"
              onClick={handleReset}
              disabled={loading}
            >
              <Square size={13} /> Reset
            </button>
          </div>

          {/* Dataset meta quick stats */}
          {datasetMeta && (
            <div className="card space-y-3">
              <SectionTitle>Dataset</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard label="Features"  value={datasetMeta.n_features} />
                <MetricCard label="Classes"   value={datasetMeta.n_classes} />
                <MetricCard label="Train rows" value={datasetMeta.train_samples} />
                <MetricCard label="Baseline"  value={`${(datasetMeta.baseline_accuracy * 100).toFixed(1)}%`} accent />
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel: charts + live state ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress */}
          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <SectionTitle>Progress</SectionTitle>
              <span className="text-xs text-gray-500 font-mono">
                Generation {generation} / {totalGen}
              </span>
            </div>
            <ProgressBar pct={pct} />
          </div>

          {/* Live metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label="Generation"
              value={generation}
              sub={`of ${totalGen}`}
            />
            <MetricCard
              label="Best Accuracy"
              value={bestAccuracy != null ? `${(bestAccuracy * 100).toFixed(1)}%` : '—'}
              accent
            />
            <MetricCard
              label="Baseline Acc"
              value={datasetMeta ? `${(datasetMeta.baseline_accuracy * 100).toFixed(1)}%` : '—'}
            />
            <MetricCard
              label="Features Selected"
              value={latestEntry ? `${latestEntry.n_selected} / ${datasetMeta?.n_features ?? '?'}` : '—'}
            />
          </div>

          {/* Fitness chart */}
          <div className="card">
            <SectionTitle>Fitness Over Generations</SectionTitle>
            <EvolutionChart history={history} />
            <div className="flex gap-4 mt-2 text-xs text-gray-600">
              <span><span className="inline-block w-3 h-0.5 bg-brand-400 mr-1 align-middle"></span>Best</span>
              <span><span className="inline-block w-3 h-0.5 bg-accent-400 mr-1 align-middle"></span>Avg</span>
              <span><span className="inline-block w-3 h-0.5 bg-red-500 mr-1 align-middle"></span>Worst</span>
            </div>
          </div>

          {/* Generation log table */}
          <div className="card">
            <SectionTitle>Generation Log</SectionTitle>
            <div className="overflow-auto max-h-52 rounded-lg border border-gray-800">
              <table className="text-xs w-full">
                <thead className="bg-gray-800 text-gray-400 sticky top-0">
                  <tr>
                    {['Gen', 'Best Fitness', 'Avg Fitness', 'Worst Fitness', 'Features'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((h) => (
                    <tr key={h.generation} className="border-t border-gray-800 hover:bg-gray-800/40">
                      <td className="px-3 py-1.5 font-mono text-brand-400">{h.generation}</td>
                      <td className="px-3 py-1.5 font-mono">{h.best_fitness.toFixed(4)}</td>
                      <td className="px-3 py-1.5 font-mono text-gray-500">{h.avg_fitness.toFixed(4)}</td>
                      <td className="px-3 py-1.5 font-mono text-gray-600">{h.worst_fitness.toFixed(4)}</td>
                      <td className="px-3 py-1.5">{h.n_selected}</td>
                    </tr>
                  ))}
                  {!history.length && (
                    <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-600">No data yet — run the GA</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chromosome visualization */}
          <div className="card space-y-3">
            <SectionTitle>Best Chromosome</SectionTitle>
            {bestChromosome ? (
              <>
                <ChromosomeViz chromosome={bestChromosome} featureNames={featureNames} />
                <p className="text-xs text-gray-600">
                  Purple = selected · Dark = excluded · Hover for feature name
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">Run the GA to see the best chromosome.</p>
            )}
          </div>

          {status === 'done' && (
            <div className="flex justify-end">
              <button
                className="btn-accent flex items-center gap-2"
                onClick={() => navigate('/results')}
              >
                View Results <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
