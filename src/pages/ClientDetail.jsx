import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Search, Bed, Bath, Car, DollarSign, MapPin,
  CheckCircle2, Star, AlertCircle, Loader2, Maximize2,
  FileText, Send, Eye, ChevronRight
} from 'lucide-react'
import { getClient, getClientMatches, updateMatchStatus } from '../services/clients'
import { runMatchingForClient } from '../services/scoring'
import { transformedProperties } from '../data/mockProperties'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import { getMatchConfig } from '../components/MatchBadge'

function fmt(n) { return n?.toLocaleString('en-AU') ?? '—' }

// Mini property card used in the colour-coded columns
function PropertyTile({ match, onSave, onRecommend }) {
  const navigate = useNavigate()
  const p = match.properties ?? {}
  const cfg = getMatchConfig(match.match_score)
  const strengths = match.strengths ?? []
  const considerations = match.considerations ?? []
  const redFlags = match.red_flags ?? []

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-slate-100">
        <img
          src={p.images?.[0] ?? `https://picsum.photos/seed/${p.domain_listing_id}/800/500`}
          alt={p.address}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Score pill */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border"
            style={{ background: cfg.ringColor + '18', color: cfg.ringColor, borderColor: cfg.ringColor + '40' }}
          >
            {match.match_score} — {cfg.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2.5">
          <div className="text-sm font-bold text-slate-800 leading-snug truncate">{p.address}</div>
          <div className="text-xs text-slate-400 mt-0.5">{p.suburb}, {p.state}</div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2.5 font-medium">
          <span className="flex items-center gap-1"><Bed size={11} />{p.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath size={11} />{p.bathrooms}</span>
          <span className="flex items-center gap-1"><Car size={11} />{p.car_spaces}</span>
          {p.land_size > 0 && <span className="flex items-center gap-1"><Maximize2 size={11} />{fmt(p.land_size)}m²</span>}
        </div>

        {/* Price */}
        <div className="text-base font-extrabold text-slate-800 mb-3">${fmt(p.price)}</div>

        {/* Summary bullets — 2 max */}
        <ul className="space-y-1 mb-3">
          {strengths.slice(0, 1).map((s, i) => (
            <li key={`s${i}`} className="flex items-start gap-1.5 text-xs text-green-600">
              <CheckCircle2 size={11} className="mt-0.5 flex-shrink-0" />
              <span className="text-slate-600 line-clamp-1">{s}</span>
            </li>
          ))}
          {redFlags.slice(0, 1).map((s, i) => (
            <li key={`r${i}`} className="flex items-start gap-1.5 text-xs text-red-500">
              <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
              <span className="text-slate-500 line-clamp-1">{s}</span>
            </li>
          ))}
        </ul>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/properties/${match.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Eye size={12} /> View Analysis
          </button>
          <button
            onClick={() => onSave?.(match)}
            title="Generate Property Report"
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FileText size={13} className="text-slate-500" />
          </button>
          <button
            onClick={() => onRecommend?.(match)}
            title="Send to Client"
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Send size={13} className="text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Column for one tier
function MatchColumn({ title, color, bgColor, borderColor, dotColor, matches, onSave, onRecommend, limit = 3 }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? matches : matches.slice(0, limit)

  return (
    <div className={`rounded-2xl border p-4`} style={{ background: bgColor, borderColor }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
          <span className="text-sm font-bold" style={{ color }}>{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: dotColor + '20', color: dotColor }}>
            {matches.length}
          </span>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">No matches in this tier</div>
      ) : (
        <>
          <div className="space-y-3">
            {visible.map((m) => <PropertyTile key={m.id} match={m} onSave={onSave} onRecommend={onRecommend} />)}
          </div>
          {matches.length > limit && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 w-full py-2 text-xs font-semibold rounded-xl transition-colors hover:opacity-80"
              style={{ color, background: dotColor + '15' }}
            >
              {showAll ? 'Show less' : `+${matches.length - limit} more`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [c, m] = await Promise.all([getClient(id), getClientMatches(id)])
        setClient(c)
        setMatches(m)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  async function handleFindProperties() {
    setSearching(true)
    try {
      await runMatchingForClient(client, transformedProperties)
      const fresh = await getClientMatches(id)
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

  // Tier buckets
  const excellent = matches.filter((m) => m.match_score >= 80)
  const strong = matches.filter((m) => m.match_score >= 50 && m.match_score < 80)
  const poor = matches.filter((m) => m.match_score < 50)

  if (loading) return <div className="p-8 flex items-center gap-2 text-slate-400 text-sm"><Spinner />Loading…</div>
  if (!client) return <div className="p-8 text-slate-400 text-sm">Client not found.</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 mt-2 transition-colors font-medium">
        <ChevronLeft size={16} /> Back to Clients
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 text-2xl font-extrabold shadow-sm">
            {client.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{client.name}</h1>
              <StatusBadge status={client.status} />
            </div>
            <div className="text-sm text-slate-400">{client.email} · {client.phone}</div>
          </div>
        </div>
        <button
          onClick={handleFindProperties}
          disabled={searching}
          className="flex items-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/25 transition-all"
        >
          {searching ? <Spinner size={16} /> : <Search size={16} />}
          {searching ? 'Running AI Search…' : 'Find Properties'}
        </button>
      </div>

      {searching && (
        <div className="mb-5 px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-600 flex items-center gap-2 font-medium">
          <Loader2 size={14} className="animate-spin" />
          Scoring {transformedProperties.length} properties with Claude AI — this may take a minute…
        </div>
      )}

      {/* Brief summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Budget</div>
          <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-lg">
            <DollarSign size={15} className="text-brand-500" />
            ${fmt(client.budget_min)} – ${fmt(client.budget_max)}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">{client.investment_type}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Requirements</div>
          <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
            <span className="flex items-center gap-1"><Bed size={14} className="text-slate-300" />{client.bedrooms_min}+ bed</span>
            <span className="flex items-center gap-1"><Bath size={14} className="text-slate-300" />{client.bathrooms_min}+ bath</span>
            <span className="flex items-center gap-1"><Car size={14} className="text-slate-300" />{client.car_spaces} car</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">{client.property_type}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Preferred Locations</div>
          <div className="flex flex-wrap gap-1.5">
            {client.preferred_locations?.map((loc) => (
              <span key={loc} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium">
                <MapPin size={9} />{loc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Criteria detail */}
      {(client.must_haves?.length > 0 || client.nice_to_haves?.length > 0 || client.excluded_features?.length > 0) && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {client.must_haves?.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-700">Must Have</span>
              </div>
              <ul className="space-y-1.5">
                {client.must_haves.map((f) => <li key={f} className="text-sm text-green-800 font-medium">{f}</li>)}
              </ul>
            </div>
          )}
          {client.nice_to_haves?.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Nice to Have</span>
              </div>
              <ul className="space-y-1.5">
                {client.nice_to_haves.map((f) => <li key={f} className="text-sm text-amber-800 font-medium">{f}</li>)}
              </ul>
            </div>
          )}
          {client.excluded_features?.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-red-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-red-700">Excluded</span>
              </div>
              <ul className="space-y-1.5">
                {client.excluded_features.map((f) => <li key={f} className="text-sm text-red-800 font-medium">{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Matched properties section */}
      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
          <Search size={32} className="text-slate-200 mx-auto mb-3" />
          <div className="text-sm font-semibold text-slate-500 mb-1">No properties matched yet</div>
          <div className="text-xs text-slate-400 mb-5">Click "Find Properties" to run an AI-powered search for this client.</div>
          <button
            onClick={handleFindProperties}
            disabled={searching}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/25 transition-all"
          >
            {searching ? <Spinner size={15} /> : <Search size={15} />}
            {searching ? 'Searching…' : 'Find Properties'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Matched Properties</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{excellent.length} Excellent</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{strong.length} Strong</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{poor.length} Poor</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <MatchColumn
              title="Excellent Fit"
              color="#15803D" dotColor="#16A34A"
              bgColor="#F0FDF4" borderColor="#BBF7D0"
              matches={excellent} onSave={handleSave} onRecommend={handleRecommend}
            />
            <MatchColumn
              title="Strong Fit"
              color="#92400E" dotColor="#D97706"
              bgColor="#FFFBEB" borderColor="#FDE68A"
              matches={strong} onSave={handleSave} onRecommend={handleRecommend}
            />
            <MatchColumn
              title="Poor Fit"
              color="#991B1B" dotColor="#DC2626"
              bgColor="#FEF2F2" borderColor="#FECACA"
              matches={poor} onSave={handleSave} onRecommend={handleRecommend}
            />
          </div>
        </>
      )}
    </div>
  )
}
