import React, { useEffect, useState } from 'react'
import { getSubscriberOverview } from '../../../api/business'
import type { SubscriberOverview } from '../../../api/business'

const SubscriberPanel: React.FC = () => {
  const [overview, setOverview] = useState<SubscriberOverview | null>(null)
  const [status, setStatus] = useState('Loading subscriber overview...')
  const [error, setError] = useState<string | null>(null)

  const loadOverview = async () => {
    setStatus('Loading subscriber overview...')
    setError(null)

    try {
      const data = await getSubscriberOverview()
      setOverview(data)
      setStatus('Subscriber overview loaded.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriber overview.')
      setStatus('Unable to load subscriber overview.')
    }
  }

  useEffect(() => {
    loadOverview()
  }, [])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/5">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Subscriber analytics</h2>
          <p className="text-sm text-slate-500">API-driven engagement metrics for subscriptions and churn.</p>
        </div>
        <button
          type="button"
          onClick={loadOverview}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {status && <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{status}</div>}

      {overview ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Active subscribers</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{overview.activeSubscribers}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">New this month</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{overview.newThisMonth}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Churn rate</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{overview.churnRate}%</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Trial users</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{overview.trialUsers}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Subscriber analytics will display here after API load.</div>
      )}
    </section>
  )
}

export default SubscriberPanel
