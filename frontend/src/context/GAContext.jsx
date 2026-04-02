/**
 * context/GAContext.jsx
 * Global state shared across all pages via React Context.
 */

import React, { createContext, useContext, useState, useCallback } from 'react'

const GAContext = createContext(null)

export function GAProvider({ children }) {
  // ── Upload state ─────────────────────────────────────────────────────────
  const [sessionId, setSessionId]       = useState(null)
  const [uploadData, setUploadData]     = useState(null)   // raw /upload response
  const [datasetMeta, setDatasetMeta]   = useState(null)   // from /initialize

  // ── GA config ────────────────────────────────────────────────────────────
  const [gaConfig, setGaConfig] = useState({
    target_column:   '',
    model_name:      'logistic_regression',
    population_size: 30,
    mutation_rate:   0.02,
    crossover_rate:  0.8,
    alpha:           0.1,
    elitism_count:   2,
    test_size:       0.2,
    n_generations:   50,
    crossover_type:  'two_point',
  })

  // ── Simulation state ─────────────────────────────────────────────────────
  const [status, setStatus]             = useState('idle') // idle | initialized | running | done | error
  const [generation, setGeneration]     = useState(0)
  const [history, setHistory]           = useState([])     // per-generation stats
  const [accuracyHistory, setAccuracyHistory] = useState([])
  const [bestChromosome, setBestChromosome]   = useState(null)
  const [bestAccuracy, setBestAccuracy]       = useState(null)
  const [results, setResults]           = useState(null)   // /result response
  const [error, setError]               = useState(null)

  // ── Helpers ──────────────────────────────────────────────────────────────
  const resetSimulation = useCallback(() => {
    setStatus('idle')
    setGeneration(0)
    setHistory([])
    setAccuracyHistory([])
    setBestChromosome(null)
    setBestAccuracy(null)
    setResults(null)
    setError(null)
  }, [])

  const value = {
    // upload
    sessionId, setSessionId,
    uploadData, setUploadData,
    datasetMeta, setDatasetMeta,
    // config
    gaConfig, setGaConfig,
    // simulation
    status, setStatus,
    generation, setGeneration,
    history, setHistory,
    accuracyHistory, setAccuracyHistory,
    bestChromosome, setBestChromosome,
    bestAccuracy, setBestAccuracy,
    results, setResults,
    error, setError,
    resetSimulation,
  }

  return <GAContext.Provider value={value}>{children}</GAContext.Provider>
}

export const useGA = () => {
  const ctx = useContext(GAContext)
  if (!ctx) throw new Error('useGA must be used within <GAProvider>')
  return ctx
}
