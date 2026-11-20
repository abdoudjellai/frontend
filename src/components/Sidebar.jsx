import { NavLink } from 'react-router-dom'
import { LayoutGrid, Package, Users, Truck, Store, TrendingUp, Bot, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/overview', label: 'Overview', icon: LayoutGrid },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/shipments', label: 'Shipments', icon: Truck },
  { to: '/couriers', label: 'Couriers', icon: Store },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
]

const link = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
    isActive ? 'bg-navy-light text-white' : 'text-sky/80 hover:bg-navy-light/60'
  }`

function LogoMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 44 44" aria-hidden="true">
      <path d="M7 31 L23 14 L34 25" fill="none" stroke="#96d8f4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="37" cy="33" r="4.5" fill="#96d8f4" />
    </svg>
  )
}

export default function Sidebar({ open, onClose }) {
  const { store, stores, setStoreId } = useAuth()
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[260px] shrink-0 flex-col overflow-y-auto bg-navy p-4 text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-6 flex items-center gap-2 px-2">
        <LogoMark />
        <span className="text-2xl font-extrabold tracking-tight">
          confirmi<span className="text-sky">ly</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={link} onClick={onClose}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink to="/settings" className={link} onClick={onClose}>
        <Settings size={18} />
        Settings
      </NavLink>

      <div className="mt-3 rounded-xl bg-navy-light p-3">
        {stores && stores.length > 1 ? (
          <select
            value={store?.id ?? ''}
            onChange={(e) => setStoreId(e.target.value)}
            className="w-full rounded-md bg-navy px-1 py-0.5 text-sm font-bold text-white outline-none"
            aria-label="Current store"
          >
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        ) : (
          <p className="text-sm font-bold">{store?.name ?? 'No store'}</p>
        )}
        <p className="text-xs text-sky/80">Expéditeur</p>
      </div>
    </aside>
  )
}