import { Link } from 'react-router-dom'
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { PageHeader, Card, StatusPill, RiskBadge, LoadState, da } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { backend } from '../services/api'
import { loadOrderRows } from '../services/loaders'
import { percent } from '../services/mappers'

const BAR_COLORS = ['#2794b3', '#115c9e', '#ffb000', '#6d28d9']

async function loadOverview(storeId) {
  const [overview, orderStats, recent] = await Promise.all([
    backend.overview(storeId),
    backend.orderStats(storeId),
    loadOrderRows(storeId, { limit: 5 }),
  ])
  return { ...overview, orderStats, recent: recent.rows }
}

export default function Overview() {
  const { store, user } = useAuth()
  const { data, error, loading, reload } = useApi(() => loadOverview(store.id), [store.id])

  return (
    <>
      <PageHeader
        live
        title="Overview"
        subtitle={`Hello ${user?.name ?? ''}. Here's what needs your attention in ${store.name}.`}
        action={
          <Link to="/assistant" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white">
            <Sparkles size={16} /> Open AI assistant
          </Link>
        }
      />
      {data ? <OverviewContent data={data} /> : <LoadState loading={loading} error={error} onRetry={reload} />}
    </>
  )
}

function OverviewContent({ data }) {
  const { business, ai, orderStats, recent } = data
  const outcomes = orderStats.outcomes
  const awaiting = business.ordersByStatus.draft + business.ordersByStatus.pending_confirmation

  // Every number comes from the backend; nothing is estimated when data is missing.
  const kpis = [
    { label: 'Total orders', value: business.totalOrders, note: `${da(business.deliveredRevenue)} delivered revenue`, border: 'border-brand' },
    { label: 'Awaiting confirmation', value: awaiting, note: 'draft or waiting for the customer', border: 'border-accent' },
    {
      label: 'Delivery success',
      value: outcomes.completed === 0 ? '—' : percent(outcomes.delivered / outcomes.completed),
      note: `delivered / final outcomes (${outcomes.completed})`,
      border: 'border-gold',
    },
    {
      label: 'Refusal / return rate',
      value: percent(outcomes.actualReturnRate),
      note: 'actual outcomes · lower is better',
      border: 'border-danger',
    },
  ]

  const maxCourier = Math.max(1, ...ai.courierRecommendations.map((c) => c.orders))

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-[14px] border-t-4 bg-white p-5 shadow-sm ${k.border}`}>
            <span className="text-sm font-semibold">{k.label}</span>
            <p className="mt-2 text-3xl font-extrabold md:text-4xl">{k.value}</p>
            <p className="text-xs text-muted">{k.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Needs attention">
          <div className="space-y-3">
            {awaiting > 0 && (
              <Link to="/orders?status=pending_confirmation" className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-3 text-sm">
                <span className="flex items-center gap-3">
                  <Sparkles className="shrink-0 text-gold" size={20} />
                  <span><b>{awaiting} order{awaiting > 1 ? 's' : ''} not confirmed yet</b><br /><span className="text-xs text-muted">Confirm with the customer before dispatch</span></span>
                </span>
                <b className="shrink-0">Review →</b>
              </Link>
            )}
            {ai.highRiskOrders > 0 && (
              <Link to="/orders" className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm">
                <span className="flex items-center gap-3">
                  <AlertTriangle className="shrink-0 text-danger" size={20} />
                  <span><b>{ai.highRiskOrders} high-risk order{ai.highRiskOrders > 1 ? 's' : ''}</b><br /><span className="text-xs text-muted">Predicted by AI analysis · verify before dispatch</span></span>
                </span>
                <b className="shrink-0">Check →</b>
              </Link>
            )}
            {awaiting === 0 && ai.highRiskOrders === 0 && (
              <p className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
                <CheckCircle2 size={18} /> Nothing needs your attention right now.
              </p>
            )}
          </div>
        </Card>

        <Card title="AI courier recommendations">
          <p className="mb-3 text-xs text-muted">
            {ai.analyzedOrders} analyzed order{ai.analyzedOrders === 1 ? '' : 's'} · average predicted return risk {percent(ai.averagePredictedReturnRisk)}
          </p>
          {ai.courierRecommendations.length === 0 ? (
            <p className="text-sm text-muted">No AI analyses yet.</p>
          ) : (
            <div className="space-y-3">
              {ai.courierRecommendations.map((c, i) => (
                <div key={c.courier}>
                  <div className="mb-1 flex justify-between text-sm font-semibold">
                    <span>{c.courier}</span><span>{c.orders} order{c.orders > 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-blue-100">
                    <div className="h-2.5 rounded-full" style={{ width: `${(c.orders / maxCourier) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Recent orders" className="mt-5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>{['Order', 'Customer', 'Wilaya', 'Amount', 'Risk', 'Status', 'Time'].map((h) => <th key={h} className="py-2 pe-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-t border-blue-50">
                <td className="py-3 pe-3 font-bold">
                  <Link to={`/orders/${o.id}`}>#{o.ref}</Link>
                </td>
                <td className="pe-3">{o.customerName}</td>
                <td className="pe-3">{o.wilaya}</td>
                <td className="pe-3">{da(o.amount)}</td>
                <td className="pe-3"><RiskBadge band={o.riskBand} /></td>
                <td className="pe-3"><StatusPill status={o.status} /></td>
                <td className="text-muted">{o.time}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-muted">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  )
}
