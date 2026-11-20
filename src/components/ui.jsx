/** `live` pages show backend data; the others still show the built-in demo data. */
export function PageHeader({ title, subtitle, action, live = false }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        {live ? (
          <span className="mb-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            Live data
          </span>
        ) : (
          <span className="mb-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-muted">
            Demo data
          </span>
        )}
        <h1 className="text-2xl font-extrabold text-ink md:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

const STATUS = {
  // Backend order statuses
  draft: ['Draft', 'bg-gray-100 text-gray-700'],
  pending_confirmation: ['Needs confirmation', 'bg-amber-100 text-amber-800'],
  pending_dispatch: ['Ready to dispatch', 'bg-sky-100 text-sky-800'],
  shipped: ['Shipped', 'bg-cyan-100 text-cyan-800'],
  refused: ['Refused', 'bg-red-100 text-red-700'],
  // Demo data statuses
  needs_confirmation: ['Needs confirmation', 'bg-amber-100 text-amber-800'],
  confirmed: ['Confirmed', 'bg-green-100 text-green-800'],
  cancelled: ['Cancelled', 'bg-red-100 text-red-700'],
  created: ['Created', 'bg-sky-100 text-sky-800'],
  picked_up: ['Picked up', 'bg-sky-100 text-sky-800'],
  in_transit: ['In transit', 'bg-amber-100 text-amber-800'],
  out_for_delivery: ['Out for delivery', 'bg-cyan-100 text-cyan-800'],
  delivered: ['Delivered', 'bg-green-100 text-green-800'],
  failed: ['Failed', 'bg-red-100 text-red-700'],
  returned: ['Returned', 'bg-red-100 text-red-700'],
}

export function StatusPill({ status }) {
  const [label, cls] = STATUS[status] ?? [status, 'bg-gray-100 text-gray-700']
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>{label}</span>
}

const RISK = {
  low: ['Low risk', 'bg-green-100 text-green-800'],
  medium: ['Medium risk', 'bg-amber-100 text-amber-800'],
  high: ['High risk', 'bg-red-100 text-red-700'],
  insufficient: ['Not enough data', 'bg-gray-100 text-gray-600'],
}

export function RiskBadge({ band }) {
  const [label, cls] = RISK[band] ?? RISK.insufficient
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>{label}</span>
}

export function Card({ title, children, className = '' }) {
  return (
    <section className={`overflow-x-auto rounded-[14px] bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="mb-3 text-base font-bold">{title}</h2>}
      {children}
    </section>
  )
}

export function Skeleton({ className = 'h-24' }) {
  return <div className={`animate-pulse rounded-xl bg-blue-100 ${className}`} />
}

export const da = (n) => `${n.toLocaleString('fr-FR')} DA`

/** Loading and error states for pages that fetch backend data. */
export function LoadState({ loading, error, onRetry }) {
  if (error) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-danger">
        <span>{error}</span>
        {onRetry && <button onClick={onRetry} className="rounded-lg bg-white px-3 py-1.5 text-ink shadow-sm">Retry</button>}
      </div>
    )
  }
  if (loading) return <Skeleton className="h-40" />
  return null
}