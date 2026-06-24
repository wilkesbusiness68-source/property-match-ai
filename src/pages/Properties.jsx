import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, Loader2, Building2 } from 'lucide-react'
import { getClients, getClientMatches, updateMatchStatus } from '../services/clients'
import { runMatchingForClient } from '../services/scoring'
import { transformedProperties } from '../data/mockProperties'
import { getMatchConfig } from '../components/MatchBadge'
import Spinner from '../components/Spinner'
import { Bed, Bath, Car, Maximize2, Eye, FileText, Send, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

function fmt(n) { return n?.toLocaleString('en-AU') ?? '—' }

function PropertyCard({ match, onSave, onRecommend }) {
  const navigate = useNavigate()
  const p = match.properties ?? {}
  const cfg = getMatchConfig(match.match_score)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={p.images?.[0] ?? `https://picsum.photos/seed/${p.domain_listing_id}/800/500`}
          alt={p.address}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: cfg.ringColor }}>
            {match.match_score} — {cfg.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <div className="text-sm font-bold text-slate-800 truncate">{p.address}</div>
          <div className="text-xs text-slate-400 mt-0.5">{p.suburb}, {p.state}</div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-3">
          <span className="flex items-center gap-1"><Bed size={11} />{p.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath size={11} />{p.bathrooms}</span>
          <span className="flex items-center gap-1"><Car size={11} />{p.car_spaces}</span>
          {p.land_size > 0 && <span className="flex items-center gap-1"><Maximize2 size={11} />{fmt(p.land_size)}m²</span>}
        </div>

        <div className="text-base font-extrabold text-slate-800 mb-3">${fmt(p.price)}</div>

        <ul className="space-y-1 mb-3">
          {(match.strengths ?? []).slice(0, 1).map((s, i) => (
            <li key={`s${i}`} className="flex items-start gap-1.5 text-xs text-green-600">
              <CheckCircle2 size={11} className="mt-0.5 flex-shrink-0" />
              <span className="text-slate-600 line-clamp-1">{s}</span>
            </li>
          ))}
          {(match.red_flags ?? []).slice(0, 1).map((s, i) => (
            <li key={`r${i}`} className="flex items-start gap-1.5 text-xs text-red-500">
              <XCircle size={11} className="mt-0.5 flex-shrink-0" />
              <span className="text-slate-500 line-clamp-1">{s}</span>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/properties/${match.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Eye size={12} /> View Analysis
          </button>
          <button onClick={() => onSave?.(match)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="Save">
            <FileText size={13} className="text-slate-500" />
          </button>
          <button onClick={() => onRecommend?.(match)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="Recommend">
            <Send size={13} className="text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Properties() {
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    getClients().then((cs) => {
      setClients(cs)
      if (cs.length > 0) setSelectedClientId(cs[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedClientId) return
    setLoading(true)
    getClientMatches(selectedClientId).then(setMatches).catch(console.error).finally(() => setLoading(false))
  }, [selectedClientId])

  async function handleSearch() {
    const client = clients.find((c) => c.id === selectedClientId)
    if (!client) return
    setSearching(true)
    try {
      await runMatchingForClient(client, transformedProperties)
      const fresh = await getClientMatches(selectedClientId)
      setMatches(fresh)
    } catch (e) { console.error(e) }
    finally { setSearching(false) }
  }

  async function handleSave(match) {
    await updateMatchStatus(match.id, 'Saved')
    setMatches((prev) => prev.map((m) => m.id === match.id ? { ...m, status: 'Saved' } : m))
  }
  async function handleRecommend(match) {
    await updateMatchStatus(match.id, 'Recommended')
    setMatches((prev) => prev.map((m) => m.id === match.id ? { ...m, status: 'Recommended' } : m))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 mt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Property Finder</h1>
          <p className="text-sm text-slate-400 mt-0.5">AI-powered matching for your clients</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative w-72">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all cursor-pointer shadow-sm"
          >
            {clients.length === 0 && <option value="">No clients yet</option>}
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !selectedClientId}
          className="flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/25 transition-all"
        >
          {searching ? <Spinner size={15} /> : <Search size={15} />}
          {searching ? 'Running AI Search…' : 'Find Properties'}
        </button>
      </div>

      {searching && (
        <div className="mb-5 px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-600 flex items-center gap-2 font-medium">
          <Loader2 size={14} className="animate-spin" />
          Scoring {transformedProperties.length} properties with Claude AI — this may take a minute…
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2"><Spinner /> Loading…</div>
      ) : matches.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Building2 size={36} className="text-slate-200 mx-auto mb-3" />
          <div className="text-sm font-semibold text-slate-500 mb-1">No properties matched yet</div>
          <div className="text-xs text-slate-400">Select a client and click "Find Properties" to run an AI search.</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-500 font-medium">{matches.length} properties matched</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {matches.map((m) => (
              <PropertyCard key={m.id} match={m} onSave={handleSave} onRecommend={handleRecommend} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
