import { useState } from 'react'
import { X, Check, Clock } from 'lucide-react'
import { PageHeader, StatusPill, da } from '../components/ui'
import { shipments, timelineSteps, statusStep } from '../data/demo'

export default function Shipments() {
  const [selected, setSelected] = useState(shipments[0])
  const reached = statusStep[selected.status]
  const failed = selected.status === 'failed'

  return (
    <>
      <PageHeader title="Shipments" subtitle="Track every parcel from creation to delivery." />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-[14px] bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-blue-50 text-xs uppercase text-muted">
              <tr>{['Tracking', 'Customer', 'Courier', 'Destination', 'Status', 'Updated'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr
                  key={s.tracking}
                  onClick={() => setSelected(s)}
                  className={`cursor-pointer border-t border-blue-50 hover:bg-cyan-50 ${selected.tracking === s.tracking ? 'bg-cyan-50' : ''}`}
                >
                  <td className="px-4 py-3 font-bold">{s.tracking}</td>
                  <td className="px-4 py-3">{s.customer}</td>
                  <td className="px-4 py-3">{s.courier}</td>
                  <td className="px-4 py-3">{s.wilaya}</td>
                  <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                  <td className="px-4 py-3 text-muted">{s.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="rounded-[14px] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-muted">Tracking #{selected.tracking}</p>
          <h2 className="text-xl font-extrabold">{selected.courier} · {selected.wilaya}</h2>
          <p className="mb-4 text-sm text-muted">{da(selected.cod)} COD</p>

          <ol className="space-y-3">
            {timelineSteps.map((label, i) => {
              const done = i <= reached
              const isFailedStep = failed && i === reached
              return (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    isFailedStep ? 'bg-danger text-white' : done ? 'bg-success text-white' : 'border-2 border-blue-200'
                  }`}>
                    {isFailedStep ? <X size={14} /> : done ? <Check size={14} /> : null}
                  </span>
                  <span className={done ? 'font-semibold' : 'text-muted'}>
                    {isFailedStep ? 'Delivery failed' : label}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-blue-50 p-3 text-sm">
            <Clock size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">{failed ? 'Suggested action' : 'Next update'}</p>
              <p className="text-xs text-muted">{selected.next}</p>
            </div>
          </div>
          {failed && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="rounded-xl border border-blue-200 py-2 text-sm font-bold">Contact customer</button>
              <button className="rounded-xl bg-navy py-2 text-sm font-bold text-white">Reschedule</button>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}