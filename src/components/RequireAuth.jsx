import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'

function Screen({ children }) {
  return <div className="grid min-h-screen place-items-center bg-canvas p-4 text-ink">{children}</div>
}

function CreateFirstStore() {
  const { createStore, logout } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await createStore(name)
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Screen>
      <form onSubmit={submit} className="w-full max-w-sm rounded-[14px] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-extrabold">Create your store</h1>
        <p className="mb-4 text-sm text-muted">
          Your account has no store yet. Create one, or run <code className="rounded bg-blue-50 px-1">npm run seed</code> in the
          backend for demo data.
        </p>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Store name"
          className="mb-3 w-full rounded-xl border border-blue-100 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        {error && <p className="mb-3 text-sm font-semibold text-danger">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white disabled:opacity-60">
          Create store
        </button>
        <button type="button" onClick={logout} className="mt-2 w-full py-2 text-sm font-semibold text-muted">
          Sign out
        </button>
      </form>
    </Screen>
  )
}

/** Shows its children only to a signed-in owner with a store. */
export default function RequireAuth({ children }) {
  const { token, status, error, reload, logout, store } = useAuth()
  const location = useLocation()

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />

  if (status === 'loading' || status === 'anonymous') {
    return (
      <Screen>
        <Loader2 className="animate-spin text-brand" size={32} />
      </Screen>
    )
  }

  if (status === 'error') {
    return (
      <Screen>
        <div className="max-w-sm rounded-[14px] bg-white p-6 text-center shadow-sm">
          <p className="mb-4 font-semibold text-danger">{error}</p>
          <div className="flex justify-center gap-2">
            <button onClick={reload} className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white">Retry</button>
            <button onClick={logout} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted">Sign out</button>
          </div>
        </div>
      </Screen>
    )
  }

  if (!store) return <CreateFirstStore />

  return children
}
