import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Building2, TrendingUp, Activity, Plus, Search,
  ArrowRight, ArrowUpRight, Star, Clock, ChevronRight
} from 'lucide-react'
import { supabase } from '../lib/supabase'

function StatCard({ icon: Icon, label, value, sub, trend, accentClass, iconBg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-5">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={18} className={accentClass} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
            <ArrowUpRight size={11} className={trend < 0 ? 'rotate-90' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">{value}</div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function ScoreDot({ score }) {
  const color = score >= 80 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626'
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: color }}
    >
      {score}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ clients: 0, matchesWeek: 0, highMatch: 0 })
  const [activity, setActivity] = useState([])
  const [recentClients, setRecentClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const [r1, r2, r3, r4, r5] = await Promise.all([
          supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
          supabase.from('property_matches').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
          supabase.from('property_matches').select('*', { count: 'exact', head: true }).gte('match_score', 80),
          supabase.from('property_matches')
            .select('*, properties(address, suburb), clients(name)')
            .order('created_at', { ascending: false }).limit(8),
          supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(5),
        ])
        setStats({ clients: r1.count ?? 0, matchesWeek: r2.count ?? 0, highMatch: r3.count ?? 0 })
        setActivity(r4.data ?? [])
        setRecentClients(r5.data ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Good morning 👋</h1>
          <p className="text-sm text-slate-400 mt-0.5">Here's what's happening across your portfolio today.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate('/properties')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-all shadow-sm"
          >
            <Search size={15} /> Run Search
          </button>
          <button
            onClick={() => navigate('/clients/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand-500/25"
          >
            <Plus size={15} /> New Client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Active Clients" value={stats.clients} trend={12} accentClass="text-brand-500" iconBg="bg-brand-50" />
        <StatCard icon={Building2} label="Matches This Week" value={stats.matchesWeek} trend={8} accentClass="text-blue-500" iconBg="bg-blue-50" />
        <StatCard icon={Star} label="High Matches (80%+)" value={stats.highMatch} trend={5} accentClass="text-green-600" iconBg="bg-green-50" />
        <StatCard icon={Activity} label="Platform Status" value="Live" sub="All systems operational" accentClass="text-green-600" iconBg="bg-green-50" />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-3 gap-5">
        {/* Recent Matches — wide */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Recent Matches</h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest AI-scored properties</p>
            </div>
            <button
              onClick={() => navigate('/properties')}
              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-semibold transition-colors"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
          ) : activity.length === 0 ? (
            <div className="py-14 text-center px-6">
              <Building2 size={30} className="text-slate-200 mx-auto mb-3" />
              <div className="text-sm text-slate-500 font-medium mb-1">No matches yet</div>
              <div className="text-xs text-slate-400">Add a client and run a property search to get started.</div>
              <button
                onClick={() => navigate('/clients/new')}
                className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand-500/25 inline-flex items-center gap-2"
              >
                <Plus size={14} /> Add First Client
              </button>
            </div>
          ) : (
            <ul>
              {activity.map((m, i) => (
                <li
                  key={m.id}
                  onClick={() => navigate(`/properties/${m.id}`)}
                  className={`flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group ${i < activity.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <ScoreDot score={m.match_score} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700 truncate">{m.properties?.address ?? 'Property'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{m.clients?.name} · {m.properties?.suburb}</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent Clients */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <h2 className="text-sm font-bold text-slate-800">Recent Clients</h2>
              <button onClick={() => navigate('/clients')} className="text-xs text-brand-500 hover:text-brand-600 font-semibold">View all</button>
            </div>
            {recentClients.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No clients yet</div>
            ) : (
              <ul>
                {recentClients.map((c, i) => (
                  <li
                    key={c.id}
                    onClick={() => navigate(`/clients/${c.id}`)}
                    className={`flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${i < recentClients.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold flex-shrink-0">
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">{c.name}</div>
                      <div className="text-xs text-slate-400 truncate">{c.preferred_locations?.slice(0,2).join(', ')}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-5 shadow-lg shadow-brand-500/20">
            <div className="text-white font-bold text-sm mb-1">Ready to find properties?</div>
            <div className="text-brand-200 text-xs mb-4">Run AI matching across 12 live listings for any client.</div>
            <button
              onClick={() => navigate('/properties')}
              className="w-full py-2.5 bg-white text-brand-600 text-sm font-bold rounded-xl hover:bg-brand-50 transition-colors"
            >
              Run Property Search
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
