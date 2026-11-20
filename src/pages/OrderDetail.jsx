import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader, Card, StatusPill, RiskBadge, LoadState, da } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { backend, errorMessage } from '../services/api'
import { ACTION_LABELS, describeItem, formatDateTime, NEXT_STATUSES, percent, shortId, SOURCE_LABELS } from '../services/mappers'
import { quotes } from '../data/demo'

async function loadOrder(storeId, orderId) {
  const order = await backend.order(storeId, orderId)
  const [customer, analyses] = await Promise.all([
    backend.customer(storeId, order.customerId).catch(() => null),
    backend.orderAnalyses(storeId, orderId),
  ])
  return { order, customer, analyses }
}

export default function OrderDetail() {
  const { id } = useParams()
  const { store } = useAuth()
  const { data, error, loading, reload } = useApi(() => loadOrder(store.id, id), [store.id, id])

  return (
    <>
      <Link to="/orders" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-muted">
        <ArrowLeft size={14} /> Orders
      </Link>
      {data ? (
        <OrderContent {...data} storeId={store.id} onChanged={reload} />
      ) : (
        <LoadState loading={loading} error={error} onRetry={reload} />
      )}
    </>
  )
}

function OrderContent({ order, customer, analyses, storeId, onChanged }) {
  const [busy, setBusy] = useState(null)
  const analysis = analyses.latest

  async function changeStatus(status) {
    setBusy(status)
    try {
      await backend.setOrderStatus(storeId, order.id, status)
      toast.success(`Order is now ${status.replaceAll('_', ' ')}`)
      onChanged()
    } catch (err) {
      toast.error(errorMessage(err), { duration: 6000 })
    } finally {
      setBusy(null)
    }
  }

  const d = order.delivery
  const checks = [
    ['Customer name', !!customer?.name],
    ['Phone', !!d.phone],
    ['Wilaya', !!d.wilaya],
    ['Exact address', !!d.address],
    ['Items', order.items.length > 0],
    ['Courier (needed to ship)', !!d.company],
  ]

  const courierQuotes = (quotes[d.wilaya] ?? []).filter((q) => q.price !== null)

  return (
    <>
      <PageHeader
        live
        title={`Order #${shortId(order.id)}`}
        subtitle={`${SOURCE_LABELS[order.source] ?? order.source} · ${formatDateTime(order.createdAt)}`}
        action={<StatusPill status={order.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <Card title="Customer">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Name</dt><dd className="font-semibold">{customer?.name ?? 'Unknown customer'}</dd></div>
              <div><dt className="text-muted">Phone</dt><dd className="font-semibold">{d.phone ?? '—'}</dd></div>
              <div><dt className="text-muted">Wilaya</dt><dd className="font-semibold">{d.wilaya ?? '—'}</dd></div>
              <div><dt className="text-muted">Payment</dt><dd className="font-semibold">COD · {da(order.totalAmount)}</dd></div>
            </dl>
            <div className="mt-4 text-sm">
              <p className="text-muted">Exact address</p>
              {d.address ? (
                <p className="font-semibold">{d.address}</p>
              ) : (
                <p className="rounded-xl border border-gold bg-amber-50 p-2.5 font-semibold text-amber-800">Missing: ask the customer</p>
              )}
            </div>
          </Card>

          <Card title="Items">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-3 border-b border-blue-50 py-2 text-sm last:border-0">
                <span>
                  {describeItem(item)} × {item.quantity}
                  <span className="ms-2 text-xs text-muted">{da(item.unitPrice)} each</span>
                </span>
                <span className="font-semibold">{da(item.lineTotal)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-blue-100 pt-2 text-sm font-bold">
              <span>Total (calculated by the backend)</span>
              <span>{da(order.totalAmount)}</span>
            </div>
          </Card>

          <DeliveryForm order={order} storeId={storeId} onSaved={onChanged} />

          <Card title="Status history">
            <ol className="space-y-2 text-sm">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <StatusPill status={h.status} />
                  <span className="text-muted">{formatDateTime(h.at)}</span>
                  {h.note && <span>· {h.note}</span>}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Delivery risk (AI)">
            {analysis ? (
              <>
                <div className="flex items-center justify-between">
                  <RiskBadge band={analysis.riskLevel} />
                  <span className="text-xs text-muted">
                    Predicted return risk {percent(analysis.returnRisk)} · {analyses.history.length} analysis{analyses.history.length > 1 ? 'es' : ''}
                  </span>
                </div>
                {analysis.recommendations.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 ps-5 text-sm">
                    {analysis.recommendations.map((r) => <li key={r}>{r}</li>)}
                  </ul>
                )}
                {analysis.recommendedCourier && (
                  <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm font-semibold">Recommended courier: {analysis.recommendedCourier}</p>
                )}
              </>
            ) : (
              <>
                <RiskBadge band="insufficient" />
                <p className="mt-3 text-sm text-muted">Not analyzed yet. AI risk analyses will appear here once n8n is connected.</p>
              </>
            )}
          </Card>

          <Card title="Courier prices">
            <span className="mb-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-muted">Demo data</span>
            {courierQuotes.length === 0 ? (
              <p className="text-sm text-muted">No price data for this destination yet. Courier integrations come in a later milestone.</p>
            ) : (
              <div className="space-y-2">
                {courierQuotes.map((c) => (
                  <div key={c.name} className="rounded-xl border border-blue-100 p-3 text-sm">
                    <span className="font-bold">{c.name}</span>
                    <p className="mt-1 text-xs text-muted">{da(c.price)} · {c.days[0]}–{c.days[1]} days · {c.success}% delivered</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Order status">
            <ul className="space-y-1.5 text-sm">
              {checks.map(([label, ok]) => (
                <li key={label} className="flex items-center gap-2">
                  {ok ? <Check size={16} className="text-success" /> : <X size={16} className="text-danger" />}
                  <span className={ok ? '' : 'font-semibold text-danger'}>{label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2">
              {NEXT_STATUSES[order.status].map((next) => (
                <button
                  key={next}
                  onClick={() => changeStatus(next)}
                  disabled={busy !== null}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 ${
                    next === 'cancelled' || next === 'refused' || next === 'returned'
                      ? 'border border-red-200 text-danger'
                      : next === 'draft' ? 'border border-blue-200 text-muted' : 'bg-brand text-white'
                  }`}
                >
                  {busy === next && <Loader2 size={16} className="animate-spin" />}
                  {ACTION_LABELS[next]}
                </button>
              ))}
              {NEXT_STATUSES[order.status].length === 0 && (
                <p className="text-sm text-muted">This order is closed; its status can no longer change.</p>
              )}
            </div>
            <p className="mt-3 text-xs text-muted">The backend checks every change: confirming needs a complete address, phone, chosen size/color and stock; shipping needs a courier.</p>
          </Card>
        </div>
      </div>
    </>
  )
}

const DELIVERY_FIELDS = [
  ['wilaya', 'Wilaya'],
  ['address', 'Exact address'],
  ['phone', 'Phone'],
  ['company', 'Courier'],
  ['trackingNumber', 'Tracking number'],
]

function DeliveryForm({ order, storeId, onSaved }) {
  const initial = Object.fromEntries(DELIVERY_FIELDS.map(([key]) => [key, order.delivery[key] ?? '']))
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)

  // Send only the fields that changed; an emptied field is cleared (null).
  const changed = Object.fromEntries(
    DELIVERY_FIELDS.filter(([key]) => values[key].trim() !== initial[key]).map(([key]) => [key, values[key].trim() || null]),
  )
  const dirty = Object.keys(changed).length > 0

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await backend.updateOrder(storeId, order.id, { delivery: changed })
      toast.success('Delivery details saved')
      onSaved()
    } catch (err) {
      toast.error(errorMessage(err), { duration: 6000 })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Delivery details">
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        {DELIVERY_FIELDS.map(([key, label]) => (
          <label key={key} className={`text-sm font-semibold ${key === 'address' ? 'sm:col-span-2' : ''}`}>
            {label}
            <input
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-blue-100 px-3 py-2 text-sm font-normal outline-none focus:border-brand"
            />
          </label>
        ))}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={!dirty || saving}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save delivery details'}
          </button>
        </div>
      </form>
    </Card>
  )
}
