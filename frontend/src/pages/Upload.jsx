/**
 * pages/Upload.jsx
 * Upload a CSV dataset, preview it, pick the target column, then proceed.
 */

import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, FileText, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { useGA } from '../context/GAContext'
import { uploadDataset, checkHealth } from '../services/api'
import { Alert, MetricCard, Spinner } from '../components/UI'

export default function Upload() {
  const navigate = useNavigate()
  const { setSessionId, setUploadData, gaConfig, setGaConfig, resetSimulation } = useGA()

  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [data, setData]         = useState(null)      // /upload response
  const [apiUrl, setApiUrl]     = useState('http://localhost:8000')
  const [healthMsg, setHealthMsg] = useState(null)
  const fileInputRef = useRef()

  // ── Health check ──────────────────────────────────────────────────────────
  const testConnection = async () => {
    setHealthMsg(null)
    try {
      await checkHealth()
      setHealthMsg({ ok: true, text: 'Backend connected ✓' })
    } catch {
      setHealthMsg({ ok: false, text: 'Cannot reach backend. Is uvicorn running on ' + apiUrl + '?' })
    }
  }

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.')
      return
    }
    setError(null)
    setLoading(true)
    resetSimulation()
    try {
      const res = await uploadDataset(file)
      setData(res)
      setSessionId(res.session_id)
      setUploadData(res)
      // Pre-select last column as target
      const lastCol = res.columns[res.columns.length - 1]
      setGaConfig((prev) => ({ ...prev, target_column: lastCol }))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [resetSimulation, setGaConfig, setSessionId, setUploadData])

  const onFileInput = (e) => handleFile(e.target.files[0])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  // ── Proceed ───────────────────────────────────────────────────────────────
  const proceed = () => {
    if (!gaConfig.target_column) { setError('Please select a target column.'); return }
    navigate('/simulate')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Upload Dataset</h1>
        <p className="text-gray-400 text-sm mt-1">
          Upload a CSV file. Missing values, categorical encoding, and feature scaling are handled automatically.
        </p>
      </div>

      {/* Backend connection */}
      <div className="card space-y-3">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500">Backend</h2>
        <div className="flex gap-2">
          <input
            className="form-input flex-1"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
          />
          <button className="btn-secondary flex items-center gap-1.5 shrink-0" onClick={testConnection}>
            <RefreshCw size={13} /> Test
          </button>
        </div>
        {healthMsg && (
          <Alert type={healthMsg.ok ? 'success' : 'error'}>{healthMsg.text}</Alert>
        )}
      </div>

      {/* Upload zone */}
      <div className="card space-y-4">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500">CSV File</h2>
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
            ${dragging ? 'border-brand-400 bg-brand-900/20' : data ? 'border-accent-400 bg-accent-900/10' : 'border-gray-700 hover:border-gray-600'}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input type="file" accept=".csv" ref={fileInputRef} onChange={onFileInput} className="hidden" />
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner size={28} />
              <p className="text-sm text-gray-400">Uploading…</p>
            </div>
          ) : data ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle size={32} className="text-accent-400" />
              <p className="text-sm font-medium text-accent-300">{data.filename}</p>
              <p className="text-xs text-gray-500">{data.n_rows} rows × {data.n_cols} columns</p>
              <p className="text-xs text-gray-600 mt-1">Click to upload a different file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadIcon size={32} className="text-gray-600" />
              <p className="text-sm font-medium text-gray-300">Drop CSV here or click to browse</p>
              <p className="text-xs text-gray-600">Supports any CSV with a header row</p>
            </div>
          )}
        </div>
        {error && <Alert type="error">{error}</Alert>}
      </div>

      {/* Dataset info + preview */}
      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Rows"     value={data.n_rows.toLocaleString()} />
            <MetricCard label="Columns"  value={data.n_cols} />
            <MetricCard label="Missing"  value={Object.values(data.null_counts ?? {}).reduce((a,b)=>a+b,0)} />
            <MetricCard label="File"     value={data.filename?.split('.')[0]} sub=".csv" />
          </div>

          {/* Target column picker */}
          <div className="card space-y-3">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500">Target Column</h2>
            <p className="text-xs text-gray-500">Select the column you want to predict (classification target).</p>
            <select
              className="form-select"
              value={gaConfig.target_column}
              onChange={(e) => setGaConfig((p) => ({ ...p, target_column: e.target.value }))}
            >
              <option value="">— select target —</option>
              {data.columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Data preview */}
          <div className="card space-y-3">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500">Preview (first 5 rows)</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="text-xs w-full">
                <thead className="bg-gray-800 text-gray-400">
                  <tr>
                    {data.columns.slice(0, 10).map((c) => (
                      <th key={c} className="px-3 py-2 text-left font-medium whitespace-nowrap">{c}</th>
                    ))}
                    {data.columns.length > 10 && <th className="px-3 py-2 text-gray-600">+{data.columns.length - 10}</th>}
                  </tr>
                </thead>
                <tbody>
                  {(data.preview ?? []).map((row, i) => (
                    <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                      {data.columns.slice(0, 10).map((c) => (
                        <td key={c} className="px-3 py-2 text-gray-300 whitespace-nowrap">
                          {String(row[c] ?? '').slice(0, 18)}
                        </td>
                      ))}
                      {data.columns.length > 10 && <td className="px-3 py-2 text-gray-600">…</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column types */}
          <div className="card space-y-3">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500">Column Types</h2>
            <div className="flex flex-wrap gap-2">
              {data.columns.map((c) => (
                <span
                  key={c}
                  className={`badge ${c === gaConfig.target_column ? 'badge-purple' : 'badge-gray'}`}
                >
                  {c}
                  <span className="ml-1 opacity-60">{data.dtypes?.[c]}</span>
                  {c === gaConfig.target_column && <span className="ml-1 font-bold">★</span>}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-600">★ = selected target column</p>
          </div>

          <div className="flex justify-end">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={proceed}
              disabled={!gaConfig.target_column}
            >
              Configure GA <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
