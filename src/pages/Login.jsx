import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { API_URL, errorMessage } from '../services/api'

export default function Login() {
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const destination = location.state?.from?.pathname ?? '/overview'
  if (token) return <Navigate to={destination} replace />

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-4 text-ink">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[14px] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold">
          confirmi<span className="text-accent">ly</span>
        </h1>
        <p className="mb-5 text-sm text-muted">Sign in to your store dashboard.</p>

        <label className="mb-3 block text-sm font-semibold">
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-blue-100 px-3 py-2 text-sm font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="mb-4 block text-sm font-semibold">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-blue-100 px-3 py-2 text-sm font-normal outline-none focus:border-brand"
          />
        </label>

        {error && <p className="mb-3 rounded-xl bg-red-50 p-2.5 text-sm font-semibold text-danger">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Sign in
        </button>
        <p className="mt-4 text-center text-xs text-muted">Backend: {API_URL}</p>
      </form>
    </div>
  )
}
