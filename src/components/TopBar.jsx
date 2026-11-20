import { Search, Bell, Menu, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth()
  const name = user?.name ?? ''

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-blue-100 bg-white px-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button onClick={onMenu} className="lg:hidden" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <label className="flex w-full max-w-md items-center gap-2 text-muted">
          <Search size={18} className="shrink-0" />
          <input
            placeholder="Search orders, customers, tracking..."
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted/70"
          />
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-4">
        <div className="hidden rounded-lg bg-blue-50 p-1 text-xs font-bold sm:flex">
          <button className="rounded-md bg-white px-2.5 py-1 shadow-sm">FR</button>
          <button className="px-2.5 py-1 text-muted">AR</button>
          <button className="px-2.5 py-1 text-muted">EN</button>
        </div>
        <Bell size={18} className="text-muted" />
        <div className="flex items-center gap-2" title={user?.email}>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-xs font-bold text-navy">{initials(name)}</span>
          <span className="hidden text-sm font-bold md:inline">{name}</span>
        </div>
        <button onClick={logout} className="text-muted hover:text-ink" aria-label="Sign out" title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
