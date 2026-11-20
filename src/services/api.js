import axios from 'axios'

/**
 * Client for the Confirmely backend (hackathon-api).
 * Every backend response looks like { success, data, requestId } or { success: false, error: { code, message, details } }.
 */

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

const TOKEN_KEY = 'confirmely.accessToken'

export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token) } catch { /* storage unavailable: token lives for this page only */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
  },
}

export const api = axios.create({ baseURL: `${API_URL}/api/v1`, timeout: 15000 })

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// An expired or invalid token logs the user out everywhere.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.endsWith('/auth/login')
    if (error.response?.status === 401 && !isLogin) {
      tokenStore.clear()
      window.dispatchEvent(new Event('confirmely:logout'))
    }
    return Promise.reject(error)
  },
)

const unwrap = (response) => response.data.data
const enc = encodeURIComponent

/** A readable message for any API error, including the backend's validation details. */
export function errorMessage(err) {
  const e = err?.response?.data?.error
  if (e) {
    if (e.details?.missingFields?.length) return `${e.message}: ${e.details.missingFields.join(', ')}`
    if (Array.isArray(e.details) && e.details.length > 0) {
      const parts = e.details.map((d) => (d.path ? `${d.path} ${d.message}` : d.message ?? '')).filter(Boolean)
      if (parts.length > 0) return `${e.message}: ${parts.join('; ')}`
    }
    return e.message
  }
  if (err?.request && !err.response) return `Cannot reach the backend at ${API_URL}. Is it running?`
  return err?.message ?? 'Unexpected error'
}

export const backend = {
  login: (email, password) => api.post('/auth/login', { email, password }).then(unwrap),
  me: () => api.get('/auth/me').then(unwrap),

  stores: () => api.get('/stores', { params: { limit: 100 } }).then(unwrap),
  createStore: (body) => api.post('/stores', body).then(unwrap),

  customers: (storeId, params = {}) => api.get(`/stores/${enc(storeId)}/customers`, { params: { limit: 100, ...params } }).then(unwrap),
  customer: (storeId, customerId) => api.get(`/stores/${enc(storeId)}/customers/${enc(customerId)}`).then(unwrap),

  orders: (storeId, params = {}) => api.get(`/stores/${enc(storeId)}/orders`, { params: { limit: 100, ...params } }).then(unwrap),
  order: (storeId, orderId) => api.get(`/stores/${enc(storeId)}/orders/${enc(orderId)}`).then(unwrap),
  updateOrder: (storeId, orderId, body) => api.patch(`/stores/${enc(storeId)}/orders/${enc(orderId)}`, body).then(unwrap),
  setOrderStatus: (storeId, orderId, status, note) =>
    api.patch(`/stores/${enc(storeId)}/orders/${enc(orderId)}/status`, { status, ...(note ? { note } : {}) }).then(unwrap),

  aiAnalyses: (storeId, params = {}) => api.get(`/stores/${enc(storeId)}/ai-analytics`, { params: { limit: 100, ...params } }).then(unwrap),
  orderAnalyses: (storeId, orderId) => api.get(`/stores/${enc(storeId)}/orders/${enc(orderId)}/ai-analytics`).then(unwrap),

  overview: (storeId) => api.get(`/stores/${enc(storeId)}/analytics/overview`).then(unwrap),
  orderStats: (storeId, params = {}) => api.get(`/stores/${enc(storeId)}/analytics/orders`, { params }).then(unwrap),
}
