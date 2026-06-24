import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronRight, DollarSign, MapPin, Users } from 'lucide-react'
import { getClients } from '../services/clients'
import StatusBadge from '../components/StatusBadge'

function fmt(n) { return n?.toLocaleString('en-AU') ?? '—' }

export default function ClientList() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    getClients().then(setClients).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.email?.toLowerCase().includes(query.toLowerCase()) ||
      c.preferred_locations?.some((l) => l.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 mt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Clients</h1>
          <p className="text-sm text-slate-400 mt-0.5">{clients.length} client{clients.length !== 1 ? 's' : ''} in your portfolio</p>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/25 transition-all"
        >
          <Plus size={15} /> New Client
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or suburb…"
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading clients…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Users size={36} className="text-slate-200 mx-auto mb-3" />
          <div className="text-sm font-semibold text-slate-500 mb-1">
            {query ? 'No clients match your search' : 'No clients yet'}
          </div>
          {!query && (
            <button
              onClick={() => navigate('/clients/new')}
              className="mt-4 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/25 transition-all inline-flex items-center gap-2"
            >
              <Plus size={14} /> Add First Client
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {filtered.map((c, i) => (
            <div
              key={c.id}
              onClick={() => navigate(`/clients/${c.id}`)}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors group ${i < filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
                {c.name?.charAt(0).toUpperCase() ?? '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-slate-800">{c.name}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-xs text-slate-400">{c.email}</div>
              </div>

              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <DollarSign size={12} className="text-slate-300" />
                ${fmt(c.budget_min)} – ${fmt(c.budget_max)}
              </div>

              <div className="hidden lg:flex items-center gap-1.5 flex-wrap max-w-[180px]">
                {c.preferred_locations?.slice(0, 2).map((loc) => (
                  <span key={loc} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg font-medium">
                    <MapPin size={9} />{loc}
                  </span>
                ))}
                {(c.preferred_locations?.length ?? 0) > 2 && (
                  <span className="text-xs text-slate-400">+{c.preferred_locations.length - 2}</span>
                )}
              </div>

              <div className="hidden md:block px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-slate-500 font-medium">{c.property_type}</div>

              <ChevronRight size={15} className="text-slate-300 group-hover:text-brand-400 transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
