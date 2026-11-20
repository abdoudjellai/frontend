import { PageHeader, LoadState } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { backend } from '../services/api'
import { percent, SOURCE_LABELS } from '../services/mappers'

/** Customers with their actual delivery history, counted from their orders. */
async function loadCustomers(storeId) {
  const [customers, orders] = await Promise.all([backend.customers(storeId), backend.orders(storeId)])
  const history = new Map()
  for (const order of orders.items) {
    const h = history.get(order.customerId) ?? { orders: 0, delivered: 0, refused: 0 }
    h.orders += 1
    if (order.status === 'delivered') h.delivered += 1
    if (order.status === 'refused' || order.status === 'returned') h.refused += 1
    history.set(order.customerId, h)
  }
  return customers.items.map((c) => ({ ...c, ...(history.get(c.id) ?? { orders: 0, delivered: 0, refused: 0 }) }))
}

export default function Customers() {
  const { store } = useAuth()
  const { data, error, loading, reload } = useApi(() => loadCustomers(store.id), [store.id])

  return (
    <>
      <PageHeader live title="Customers" subtitle="Delivery history based on your own orders." />
      {!data ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : (
        <div className="overflow-x-auto rounded-[14px] bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-blue-50 text-xs uppercase text-muted">
              <tr>
                {['Customer', 'Phone', 'Wilaya', 'Source', 'Orders', 'Delivered', 'Refused / returned', 'Return rate'].map((h) => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((c) => {
                const completed = c.delivered + c.refused
                return (
                  <tr key={c.id} className="border-t border-blue-50">
                    <td className="px-4 py-3 font-bold">{c.name ?? 'Unknown customer'}</td>
                    <td className="px-4 py-3">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3">{c.wilaya ?? '—'}</td>
                    <td className="px-4 py-3">{SOURCE_LABELS[c.source] ?? c.source}</td>
                    <td className="px-4 py-3">{c.orders}</td>
                    <td className="px-4 py-3">{c.delivered}</td>
                    <td className="px-4 py-3">{c.refused}</td>
                    <td className="px-4 py-3">
                      {completed === 0 ? (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">Not enough data</span>
                      ) : (
                        percent(c.refused / completed)
                      )}
                    </td>
                  </tr>
                )
              })}
              {data.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted">No customers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
