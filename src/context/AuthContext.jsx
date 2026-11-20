import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { backend, errorMessage, tokenStore } from '../services/api'

/**
 * Login session and current store.
 * status: 'anonymous' (no token) → 'loading' → 'ready' | 'error'.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.get())
  const [user, setUser] = useState(null)
  const [stores, setStores] = useState(null)
  const [storeId, setStoreId] = useState(null)
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'loading' : 'anonymous'))
  const [error, setError] = useState(null)

  const logout = useCallback(() => {
    tokenStore.clear()
    setToken(null)
    setUser(null)
    setStores(null)
    setStoreId(null)
    setStatus('anonymous')
  }, [])

  // The API client fires this event when the backend rejects the token (e.g. expired).
  useEffect(() => {
    window.addEventListener('confirmely:logout', logout)
    return () => window.removeEventListener('confirmely:logout', logout)
  }, [logout])

  const loadSession = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const [me, storePage] = await Promise.all([backend.me(), backend.stores()])
      setUser(me)
      setStores(storePage.items)
      setStoreId((current) => (storePage.items.some((s) => s.id === current) ? current : storePage.items[0]?.id ?? null))
      setStatus('ready')
    } catch (err) {
      if (err.response?.status === 401) return logout()
      setError(errorMessage(err))
      setStatus('error')
    }
  }, [logout])

  useEffect(() => {
    if (token) loadSession()
  }, [token, loadSession])

  const login = useCallback(async (email, password) => {
    const result = await backend.login(email, password)
    tokenStore.set(result.accessToken)
    setToken(result.accessToken)
  }, [])

  const createStore = useCallback(async (name) => {
    const store = await backend.createStore({ name })
    setStores((current) => [store, ...(current ?? [])])
    setStoreId(store.id)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      stores,
      store: stores?.find((s) => s.id === storeId) ?? null,
      setStoreId,
      status,
      error,
      login,
      logout,
      reload: loadSession,
      createStore,
    }),
    [token, user, stores, storeId, status, error, login, logout, loadSession, createStore],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
