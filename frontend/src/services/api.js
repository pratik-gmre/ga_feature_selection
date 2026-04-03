
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body.detail ?? detail
    } catch (_) { /* ignore */ }
    throw new Error(detail)
  }
  return res.json()
}

// ─── Health ────────────────────────────────────────────────────────────────
export const checkHealth = () => request('/health')

// ─── Upload ────────────────────────────────────────────────────────────────
export const uploadDataset = (file) => {
  const form = new FormData()
  form.append('file', file)
  return request('/upload', { method: 'POST', body: form })
}

// ─── Initialize GA ─────────────────────────────────────────────────────────
/**
 * @param {Object} params
 * @param {string} params.session_id
 * @param {string} params.target_column
 * @param {string} params.model_name
 * @param {number} params.population_size
 * @param {number} params.mutation_rate
 * @param {number} params.crossover_rate
 * @param {number} params.alpha
 * @param {number} params.elitism_count
 * @param {number} params.test_size
 */
export const initializeGA = (params) =>
  request('/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })


export const runGA = (sessionId, nGenerations, crossoverType = 'two_point') =>
  request('/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      n_generations: nGenerations,
      crossover_type: crossoverType,
    }),
  })


export const stepGA = (sessionId, crossoverType = 'two_point') =>
  request('/step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      crossover_type: crossoverType,
    }),
  })

// ─── Get result ────────────────────────────────────────────────────────────
export const getResult = (sessionId) =>
  request(`/result?session_id=${sessionId}`)
