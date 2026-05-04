import React, { useEffect, useState } from 'react'
import { getPaymentSummary } from '../../../api/business'
import type { PaymentSummary } from '../../../api/business'

const PaymentPanel: React.FC = () => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [status, setStatus] = useState('Loading payment summary...')
  const [error, setError] = useState<string | null>(null)

  const loadSummary = async () => {
    setStatus('Loading payment summary...')
    setError(null)

    try {
      const data = await getPaymentSummary()
      setSummary(data)
      setStatus('Payment summary loaded.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment summary.')
      setStatus('Unable to load payment summary.')
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/5">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Payment summary</h2>
          <p className="text-sm text-slate-500">Live API-backed finance metrics for your account.</p>
        </div>
        <button
          type="button"
          onClick={loadSummary}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {status && <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{status}</div>}

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Total revenue</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">${summary.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Transactions</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.recentTransactions}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Paid customers</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.paidCustomers}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Pending invoices</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{summary.pendingInvoices}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Payment analytics will display here after API load.</div>
      )}
    </section>
  )
}

export default PaymentPanel
