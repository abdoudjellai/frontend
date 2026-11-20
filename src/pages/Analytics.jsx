import { PageHeader, Card } from '../components/ui'
import { successTrend, courierPerformance, refusalReasons, riskyWilayas } from '../data/demo'

export default function Analytics() {
  return (
    <>
      <PageHeader title="Analytics" subtitle="Delivery success = delivered / shipments with a final outcome. Sample: 386 shipments, last 30 days." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Delivery success, last 6 weeks">
          <div className="flex h-48 items-end gap-3">
            {successTrend.map((w) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-bold">{w.value}%</span>
                <div className="w-full rounded-t-lg bg-brand" style={{ height: `${(w.value - 70) * 5}px` }} />
                <span className="text-xs text-muted">{w.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Bars start at 70% to make differences visible.</p>
        </Card>

        <Card title="Courier comparison">
          <div className="space-y-4">
            {courierPerformance.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-sm font-semibold"><span>{c.name}</span><span>{c.value}%</span></div>
                <div className="h-3 rounded-full bg-blue-100">
                  <div className="h-3 rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Refusal reasons">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted"><tr><th className="py-2">Reason</th><th>Count</th><th>Share</th></tr></thead>
            <tbody>
              {refusalReasons.map((r) => (
                <tr key={r.reason} className="border-t border-blue-50">
                  <td className="py-2.5">{r.reason}</td><td>{r.count}</td><td className="font-bold">{r.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="High-risk destinations">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted"><tr><th className="py-2">Wilaya</th><th>Refusal / RTO</th><th>Orders</th></tr></thead>
            <tbody>
              {riskyWilayas.map((w) => (
                <tr key={w.wilaya} className="border-t border-blue-50">
                  <td className="py-2.5 font-bold">{w.wilaya}</td><td>{w.rate}</td><td>{w.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  )
}