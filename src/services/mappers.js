/** Helpers that turn backend records into what the dashboard displays. */

export const SOURCE_LABELS = {
  manual: 'Manual',
  messenger: 'Messenger',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  website: 'Website',
  phone: 'Phone',
}

/** Backend IDs are long (order_4c97…); show the last 6 characters, like a reference number. */
export const shortId = (id) => id.split('_').pop().slice(-6).toUpperCase()

export function formatTime(iso) {
  const date = new Date(iso)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay
    ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const percent = (ratio) => (ratio === null || ratio === undefined ? '—' : `${(ratio * 100).toFixed(1)}%`)

/** The most recent AI analysis of each order. */
export function latestAnalysisByOrder(analyses) {
  const latest = new Map()
  for (const a of analyses) {
    const current = latest.get(a.orderId)
    if (!current || a.createdAt >= current.createdAt) latest.set(a.orderId, a)
  }
  return latest
}

export const byId = (records) => new Map(records.map((r) => [r.id, r]))

export const describeItem = (item) =>
  [item.productName, item.color, item.size !== null && item.size !== undefined ? `size ${item.size}` : null]
    .filter(Boolean)
    .join(', ')

/** Flatten an order with its customer and latest AI analysis into a table row. */
export function toOrderRow(order, customersById, analysisByOrder) {
  const customer = customersById.get(order.customerId)
  const analysis = analysisByOrder.get(order.id)
  return {
    id: order.id,
    ref: shortId(order.id),
    customerName: customer?.name ?? 'Unknown customer',
    phone: order.delivery.phone ?? customer?.phone ?? '',
    wilaya: order.delivery.wilaya ?? '—',
    amount: order.totalAmount,
    status: order.status,
    source: SOURCE_LABELS[order.source] ?? order.source,
    time: formatTime(order.createdAt),
    riskBand: analysis?.riskLevel ?? 'insufficient',
    recommended: analysis?.recommendedCourier ?? '—',
  }
}

/** Order statuses reachable from each status. Mirrors the backend rules; the backend still enforces them. */
export const NEXT_STATUSES = {
  draft: ['pending_confirmation', 'cancelled'],
  pending_confirmation: ['confirmed', 'draft', 'cancelled'],
  confirmed: ['pending_dispatch', 'cancelled'],
  pending_dispatch: ['shipped', 'confirmed', 'cancelled'],
  shipped: ['delivered', 'refused', 'returned'],
  delivered: ['returned'],
  refused: ['returned'],
  returned: [],
  cancelled: [],
}

export const ACTION_LABELS = {
  pending_confirmation: 'Send for confirmation',
  confirmed: 'Confirm order',
  draft: 'Back to draft',
  cancelled: 'Cancel order',
  pending_dispatch: 'Ready for dispatch',
  shipped: 'Mark as shipped',
  delivered: 'Mark as delivered',
  refused: 'Mark as refused',
  returned: 'Mark as returned',
}

export const ORDER_STATUS_OPTIONS = [
  ['draft', 'Draft'],
  ['pending_confirmation', 'Needs confirmation'],
  ['confirmed', 'Confirmed'],
  ['pending_dispatch', 'Ready to dispatch'],
  ['shipped', 'Shipped'],
  ['delivered', 'Delivered'],
  ['refused', 'Refused'],
  ['returned', 'Returned'],
  ['cancelled', 'Cancelled'],
]
