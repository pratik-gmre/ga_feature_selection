/**
 * components/GAConfigForm.jsx
 * Form to configure all GA hyperparameters.
 * Reads/writes via the shared GAContext.
 */

import React from 'react'
import { useGA } from '../context/GAContext'

const MODELS = [
  { value: 'logistic_regression', label: 'Logistic Regression' },
  { value: 'decision_tree',       label: 'Decision Tree' },
  { value: 'random_forest',       label: 'Random Forest' },
]

const CROSSOVER_TYPES = [
  { value: 'two_point',    label: 'Two-Point Crossover' },
  { value: 'single_point', label: 'Single-Point Crossover' },
]

export default function GAConfigForm({ disabled = false }) {
  const { gaConfig, setGaConfig, uploadData } = useGA()

  const set = (key) => (e) =>
    setGaConfig((prev) => ({ ...prev, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const columns = uploadData?.columns ?? []

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Target column */}
      <div className="sm:col-span-2">
        <label className="form-label">Target Column</label>
        <select
          className="form-select"
          value={gaConfig.target_column}
          onChange={set('target_column')}
          disabled={disabled}
        >
          <option value="">— select —</option>
          {columns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* ML model */}
      <div>
        <label className="form-label">ML Model</label>
        <select className="form-select" value={gaConfig.model_name} onChange={set('model_name')} disabled={disabled}>
          {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Crossover type */}
      <div>
        <label className="form-label">Crossover Type</label>
        <select className="form-select" value={gaConfig.crossover_type} onChange={set('crossover_type')} disabled={disabled}>
          {CROSSOVER_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Population size */}
      <div>
        <label className="form-label">Population Size</label>
        <input
          className="form-input"
          type="number"
          min={5} max={200}
          value={gaConfig.population_size}
          onChange={set('population_size')}
          disabled={disabled}
        />
      </div>

      {/* Generations */}
      <div>
        <label className="form-label">Number of Generations</label>
        <input
          className="form-input"
          type="number"
          min={1} max={500}
          value={gaConfig.n_generations}
          onChange={set('n_generations')}
          disabled={disabled}
        />
      </div>

      {/* Mutation rate */}
      <div>
        <label className="form-label">Mutation Rate <span className="text-gray-600">({gaConfig.mutation_rate})</span></label>
        <input
          className="form-input"
          type="number"
          min={0} max={1} step={0.01}
          value={gaConfig.mutation_rate}
          onChange={set('mutation_rate')}
          disabled={disabled}
        />
      </div>

      {/* Crossover rate */}
      <div>
        <label className="form-label">Crossover Rate <span className="text-gray-600">({gaConfig.crossover_rate})</span></label>
        <input
          className="form-input"
          type="number"
          min={0} max={1} step={0.05}
          value={gaConfig.crossover_rate}
          onChange={set('crossover_rate')}
          disabled={disabled}
        />
      </div>

      {/* Alpha */}
      <div>
        <label className="form-label">Alpha — Feature Penalty <span className="text-gray-600">({gaConfig.alpha})</span></label>
        <input
          className="form-input"
          type="number"
          min={0} max={1} step={0.01}
          value={gaConfig.alpha}
          onChange={set('alpha')}
          disabled={disabled}
        />
        <p className="text-xs text-gray-600 mt-1">Higher → penalise more features</p>
      </div>

      {/* Test split */}
      <div>
        <label className="form-label">Test Split <span className="text-gray-600">({Math.round(gaConfig.test_size * 100)}%)</span></label>
        <input
          className="form-input"
          type="number"
          min={0.05} max={0.5} step={0.05}
          value={gaConfig.test_size}
          onChange={set('test_size')}
          disabled={disabled}
        />
      </div>

      {/* Elitism */}
      <div>
        <label className="form-label">Elitism Count</label>
        <input
          className="form-input"
          type="number"
          min={0} max={10}
          value={gaConfig.elitism_count}
          onChange={set('elitism_count')}
          disabled={disabled}
        />
        <p className="text-xs text-gray-600 mt-1">Best N individuals preserved each generation</p>
      </div>
    </div>
  )
}
