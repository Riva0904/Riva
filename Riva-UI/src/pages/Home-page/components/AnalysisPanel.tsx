import React, { useEffect, useState } from 'react'
import { getAnalysisSummary } from '../../../api/analysis'
import type { AnalysisSummary } from '../../../api/analysis'

const AnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null)
  const [status, setStatus] = useState('Loading backend analysis...')
  const [error, setError] = useState<string | null>(null)

  const loadAnalysis = async () => {
    setStatus('Loading backend analysis...')
    setError(null)

    try {
      const result = await getAnalysisSummary()
      setAnalysis(result)
      setStatus('Backend analysis loaded successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load backend analysis.')
      setStatus('Backend analysis failed.')
    }
  }

  useEffect(() => {
    loadAnalysis()
  }, [])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/5">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Backend analysis</h2>
          <p className="text-sm text-slate-500">This panel fetches a health summary from the API and shows backend availability details.</p>
        </div>
        <button
          type="button"
          onClick={loadAnalysis}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {status && <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{status}</div>}

      {analysis ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Status</p>
            <p className="mt-2 text-sm text-slate-600">{analysis.status}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Server time</p>
            <p className="mt-2 text-sm text-slate-600">{analysis.serverTimeUtc}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Host</p>
            <p className="mt-2 text-sm text-slate-600">{analysis.host}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Runtime</p>
            <p className="mt-2 text-sm text-slate-600">{analysis.runtime}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Waiting for backend analysis result.</div>
      )}
    </section>
  )
}

export default AnalysisPanel;
