import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, ClipboardCheck, Zap } from 'lucide-react'
import SetupBanner from './SetupBanner'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/inspections', label: 'Inspections', icon: ClipboardCheck },
]

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 shadow-sm">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/30">
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 leading-none">PropertyMatch</div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-none uppercase tracking-wider font-medium">AI Platform</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 border border-brand-100'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
            v1.0 · Buyer's Agent AI
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <SetupBanner />
        {children}
      </main>
    </div>
  )
}
