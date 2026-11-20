import { PageHeader } from '../components/ui'
import { couriers } from '../data/demo'

export default function Couriers() {
  return (
    <>
      <PageHeader
        title="Couriers"
        subtitle="Manage delivery integrations and compare real performance."
        action={<button className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white">+ Connect courier</button>}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {couriers.map((c) => {
          const issue = c.status === 'sync_issue'
          return (
            <div key={c.name} className={`rounded-[14px] border-t-4 bg-white p-5 shadow-sm ${c.border}`}>
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-sm font-extrabold text-navy">{c.short}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${issue ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                  {issue ? 'Sync issue' : 'Connected'}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-extrabold">{c.name}</h2>
              <p className="text-sm text-muted">{issue ? 'Needs attention' : 'Connected and syncing'}</p>

              <dl className="mt-4 space-y-2 border-t border-blue-50 pt-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted">API credential</dt><dd className="font-bold">{c.credential}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Last sync</dt><dd className="font-bold">{c.lastSync}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Delivery success</dt><dd className="font-bold">{c.success}%</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Average cost</dt><dd className="font-bold">{c.avgCost} DA</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Average time</dt><dd className="font-bold">{c.avgDays} days</dd></div>
              </dl>

              <div className="mt-4 flex gap-2">
                <button className="rounded-xl border border-blue-200 px-3 py-2 text-sm font-bold">Test connection</button>
                {issue ? (
                  <button className="rounded-xl bg-gold px-3 py-2 text-sm font-bold">Reconnect</button>
                ) : (
                  <button className="px-3 py-2 text-sm font-bold text-muted">Disconnect</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}