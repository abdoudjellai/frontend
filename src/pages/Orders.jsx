import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader, StatusPill, RiskBadge, LoadState, da } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { loadOrderRows } from '../services/loaders'
import { ORDER_STATUS_OPTIONS } from '../services/mappers'

export default function Orders() {
  const nav = useNavigate()
  const { store } = useAuth()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const status = params.get('status') ?? 'all'

  // The status filter runs in the backend; the text search filters the loaded rows.
  const { data, error, loading, reload } = useApi(
    () => loadOrderRows(store.id, status === 'all' ? {} : { status }),
    [store.id, status],
  )

  const rows = (data?.rows ?? []).filter((o) =>
    `${o.ref} ${o.customerName} ${o.phone}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <>
      <PageHeader
        live
        title="Orders"
        subtitle="Validate, organize and act on every customer order."
        action={
          <button
            onClick={() => toast('The manual order form is not built yet')}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus size={16} /> New order
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order, customer or phone"
          className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm outline-none sm:w-72"
        />
        <select
          value={status}
          onChange={(e) => setParams(e.target.value === 'all' ? {} : { status: e.target.value })}
          className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Status: All</option>
          {ORDER_STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {!data ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : (
        <div className="overflow-x-auto rounded-[14px] bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-blue-50 text-xs uppercase text-muted">
              <tr>
                {['Order', 'Customer', 'Wilaya', 'Amount', 'Risk', 'Recommended', 'Status', 'Source', 'Time'].map((h) => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => nav(`/orders/${o.id}`)}
                  className="cursor-pointer border-t border-blue-50 hover:bg-cyan-50"
                >
                  <td className="px-4 py-3 font-bold">#{o.ref}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">{o.wilaya}</td>
                  <td className="px-4 py-3">{da(o.amount)}</td>
                  <td className="px-4 py-3"><RiskBadge band={o.riskBand} /></td>
                  <td className="px-4 py-3">{o.recommended}</td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-3">{o.source}</td>
                  <td className="px-4 py-3 text-muted">{o.time}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-muted">No orders match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
