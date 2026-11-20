import { backend } from './api'
import { byId, latestAnalysisByOrder, toOrderRow } from './mappers'

/**
 * Orders as table rows, joined with their customer and latest AI analysis.
 * Loads up to 100 records of each kind (the backend's page maximum) — enough for the prototype.
 */
export async function loadOrderRows(storeId, params = {}) {
  const [orders, customers, analyses] = await Promise.all([
    backend.orders(storeId, params),
    backend.customers(storeId),
    backend.aiAnalyses(storeId),
  ])
  const customersById = byId(customers.items)
  const analysisByOrder = latestAnalysisByOrder(analyses.items)
  return {
    rows: orders.items.map((order) => toOrderRow(order, customersById, analysisByOrder)),
    total: orders.pagination.total,
  }
}
