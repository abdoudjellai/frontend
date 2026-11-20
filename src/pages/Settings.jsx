import { useState } from 'react'
import { PageHeader, Card } from '../components/ui'

function Toggle({ label, hint, on, onChange }) {
  return (
    <div className="flex items-center justify-between border-b border-blue-50 py-3 last:border-0">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!on)}
        aria-pressed={on}
        className={`h-6 w-11 rounded-full p-0.5 transition ${on ? 'bg-brand' : 'bg-blue-200'}`}
      >
        <span className={`block h-5 w-5 rounded-full bg-white transition ${on ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const [autoDraft, setAutoDraft] = useState(true)
  const [autoApprove, setAutoApprove] = useState(false)
  const [notify, setNotify] = useState(true)
  const [strategy, setStrategy] = useState('balanced')

  return (
    <>
      <PageHeader title="Settings" subtitle="Store profile, automation and recommendation preferences." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Store profile">
          <label className="text-xs font-semibold text-muted">Store name</label>
          <input defaultValue="ModaNova Store" className="mb-3 mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm" />
          <label className="text-xs font-semibold text-muted">Default payment method</label>
          <select className="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm"><option>Cash on delivery (COD)</option></select>
        </Card>

        <Card title="Courier recommendation">
          <label className="text-xs font-semibold text-muted">Default strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="mt-1 w-full rounded-xl border border-blue-100 p-2.5 text-sm"
          >
            <option value="balanced">Balanced</option>
            <option value="cheapest">Lowest price</option>
            <option value="fastest">Fastest</option>
            <option value="success">Highest success</option>
          </select>
        </Card>

        <Card title="Automation" className="lg:col-span-2">
          <Toggle label="Create draft orders automatically from chat" hint="Drafts always need your confirmation." on={autoDraft} onChange={setAutoDraft} />
          <Toggle label="Approve low-risk orders automatically" hint="Off by default: the seller stays in control." on={autoApprove} onChange={setAutoApprove} />
          <Toggle label="Notify me about failed deliveries" on={notify} onChange={setNotify} />
        </Card>
      </div>
    </>
  )
}