import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Bed, Bath, Car, Maximize2, ExternalLink,
  CheckCircle2, AlertCircle, XCircle, Bookmark, Star,
  ClipboardCheck, FileText, Send, DollarSign, MapPin,
  TrendingUp, Home
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { updateMatchStatus } from '../services/clients'
import { createInspection, getInspectionByMatch } from '../services/inspections'
import ScoreRing from '../components/ScoreRing'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import { getMatchConfig } from '../components/MatchBadge'

function fmt(n) { return n?.toLocaleString('en-AU') ?? '—' }

function BreakdownBar({ label, score }) {
  const cfg = getMatchConfig(score)
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-600 capitalize">{label}</span>
        <span className="text-xs font-bold" style={{ color: cfg.ringColor }}>{score}/100</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: cfg.ringColor }} />
      </div>
    </div>
  )
}

// Brief vs property comparison row
function BriefRow({ label, brief, actual, pass }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-6 text-xs font-semibold">
        <span className="text-slate-400">{brief}</span>
        <span className={pass ? 'text-green-600' : 'text-red-500'}>{actual}</span>
        {pass
          ? <CheckCircle2 size={14} className="text-green-500" />
          : <XCircle size={14} className="text-red-400" />
        }
      </div>
    </div>
  )
}

// Similar property mini card
function SimilarCard({ match }) {
  const navigate = useNavigate()
  const p = match.properties ?? {}
  const cfg = getMatchConfig(match.match_score)
  return (
    <div
      onClick={() => navigate(`/properties/${match.id}`)}
      className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md cursor-pointer transition-all group"
    >
      <div className="h-28 overflow-hidden bg-slate-100 relative">
        <img
          src={p.images?.[0]}
          alt={p.address}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: cfg.ringColor }}>
            {match.match_score}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="text-xs font-bold text-slate-700 truncate">{p.address}</div>
        <div className="text-xs text-slate-400 mt-0.5">${fmt(p.price)}</div>
      </div>
    </div>
  )
}

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [client, setClient] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: m } = await supabase
          .from('property_matches')
          .select('*, properties(*), clients(*)')
          .eq('id', id)
          .single()

        setMatch(m)
        setClient(m?.clients ?? null)

        // Load similar matches for the same client, excluding this one
        if (m?.client_id) {
          const { data: sims } = await supabase
            .from('property_matches')
            .select('*, properties(*)')
            .eq('client_id', m.client_id)
            .neq('id', id)
            .order('match_score', { ascending: false })
            .limit(4)
          setSimilar(sims ?? [])
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  async function handleStatus(status) {
    setActionLoading(true)
    const updated = await updateMatchStatus(id, status)
    setMatch((m) => ({ ...m, status: updated.status }))
    setActionLoading(false)
  }

  async function handleBeginInspection() {
    setActionLoading(true)
    const existing = await getInspectionByMatch(id)
    if (existing) navigate(`/inspections/${existing.id}`)
    else { const c = await createInspection(id); navigate(`/inspections/${c.id}`) }
    setActionLoading(false)
  }

  if (loading) return <div className="p-8 flex items-center gap-2 text-slate-400 text-sm"><Spinner />Loading…</div>
  if (!match) return <div className="p-8 text-slate-400 text-sm">Match not found.</div>

  const property = match.properties ?? {}
  const breakdown = match.score_breakdown ?? {}

  // Build brief vs actual comparisons
  const comparisons = client ? [
    {
      label: 'Price',
      brief: `Up to $${fmt(client.budget_max)}`,
      actual: `$${fmt(property.price)}`,
      pass: property.price <= (client.budget_max ?? Infinity),
    },
    {
      label: 'Bedrooms',
      brief: `Min ${client.bedrooms_min ?? 0} bed`,
      actual: `${property.bedrooms} bed`,
      pass: property.bedrooms >= (client.bedrooms_min ?? 0),
    },
    {
      label: 'Bathrooms',
      brief: `Min ${client.bathrooms_min ?? 0} bath`,
      actual: `${property.bathrooms} bath`,
      pass: property.bathrooms >= (client.bathrooms_min ?? 0),
    },
    {
      label: 'Car Spaces',
      brief: `Min ${client.car_spaces ?? 0}`,
      actual: `${property.car_spaces}`,
      pass: property.car_spaces >= (client.car_spaces ?? 0),
    },
    {
      label: 'Property Type',
      brief: client.property_type,
      actual: property.property_type,
      pass: !client.property_type || client.property_type === property.property_type,
    },
    {
      label: 'Land Size',
      brief: client.land_size_min ? `Min ${fmt(client.land_size_min)}m²` : 'No min',
      actual: property.land_size > 0 ? `${fmt(property.land_size)}m²` : 'N/A',
      pass: !client.land_size_min || property.land_size >= client.land_size_min,
    },
  ] : []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 mt-2 transition-colors font-medium">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Left / Main ────────────────────────────── */}
        <div className="col-span-2 space-y-5">
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden h-64 bg-slate-100 shadow-sm">
            <img src={property.images?.[0]} alt={property.address} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-6 right-6">
              <h1 className="text-xl font-extrabold text-white tracking-tight">{property.address}</h1>
              <div className="text-sm text-white/70 mt-0.5">{property.suburb}, {property.state} {property.postcode}</div>
            </div>
          </div>

          {/* Property stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Bed, label: 'Bedrooms', val: property.bedrooms },
              { icon: Bath, label: 'Bathrooms', val: property.bathrooms },
              { icon: Car, label: 'Car Spaces', val: property.car_spaces },
              { icon: Maximize2, label: 'Land Size', val: property.land_size > 0 ? `${fmt(property.land_size)}m²` : 'N/A' },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                <Icon size={16} className="text-brand-400 mx-auto mb-2" />
                <div className="text-lg font-extrabold text-slate-800">{val}</div>
                <div className="text-xs text-slate-400 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* AI Commentary */}
          {match.ai_commentary && (
            <div className="bg-gradient-to-br from-brand-50 to-brand-100/30 border border-brand-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
                  <TrendingUp size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600">AI Analysis</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{match.ai_commentary}</p>
            </div>
          )}

          {/* Analysis vs Buyer Brief */}
          {comparisons.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-800 mb-1">Analysis vs Buyer Brief</h2>
              <p className="text-xs text-slate-400 mb-4">How this property stacks up against {client?.name}'s requirements</p>
              <div className="grid grid-cols-2 gap-x-6">
                <div className="text-xs font-bold text-slate-400 flex justify-between pb-2 border-b border-slate-100 mb-1">
                  <span>Criteria</span>
                  <div className="flex gap-6"><span>Required</span><span>Actual</span><span></span></div>
                </div>
                <div className="text-xs font-bold text-slate-400 flex justify-between pb-2 border-b border-slate-100 mb-1">
                  <span>Criteria</span>
                  <div className="flex gap-6"><span>Required</span><span>Actual</span><span></span></div>
                </div>
                {comparisons.map((row) => (
                  <BriefRow key={row.label} {...row} />
                ))}
              </div>
            </div>
          )}

          {/* Strengths / Considerations / Red Flags */}
          <div className="grid grid-cols-3 gap-4">
            {match.strengths?.length > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-green-700">Strengths</span>
                </div>
                <ul className="space-y-2">
                  {match.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 size={11} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-green-800 font-medium">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {match.considerations?.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Considerations</span>
                </div>
                <ul className="space-y-2">
                  {match.considerations.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <AlertCircle size={11} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-amber-800 font-medium">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {match.red_flags?.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <XCircle size={14} className="text-red-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-red-700">Red Flags</span>
                </div>
                <ul className="space-y-2">
                  {match.red_flags.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <XCircle size={11} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-red-800 font-medium">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Listing Description */}
          {property.description && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800">Listing Description</h2>
                {property.listing_url && (
                  <a href={property.listing_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-semibold">
                    View on Domain <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Similar Properties */}
          {similar.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-3">Similar Properties for {client?.name}</h2>
              <div className="grid grid-cols-4 gap-3">
                {similar.map((m) => <SimilarCard key={m.id} match={m} />)}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ───────────────────────────── */}
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Match Score</div>
            <ScoreRing score={match.match_score} size={130} />
            <div className="mt-4 w-full text-center">
              <StatusBadge status={match.status} />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Actions</div>
            <button
              onClick={() => handleStatus('Recommended')}
              disabled={actionLoading || match.status === 'Recommended'}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all"
            >
              <FileText size={14} /> Generate Property Report
            </button>
            <button
              onClick={() => handleStatus('Saved')}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-sm font-semibold rounded-xl transition-all"
            >
              <Send size={14} /> Send Form to Client
            </button>
            <button
              onClick={handleBeginInspection}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-sm font-semibold rounded-xl border border-slate-200 transition-all"
            >
              <ClipboardCheck size={14} /> Begin Inspection
            </button>
            <button
              onClick={() => handleStatus('Rejected')}
              disabled={actionLoading || match.status === 'Rejected'}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-red-50 disabled:opacity-40 text-red-500 text-sm font-semibold rounded-xl border border-slate-200 hover:border-red-200 transition-all"
            >
              <XCircle size={14} /> Reject Property
            </button>
          </div>

          {/* Score Breakdown */}
          {Object.keys(breakdown).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Score Breakdown</div>
              <div className="space-y-3.5">
                {Object.entries(breakdown).map(([k, v]) => (
                  <BreakdownBar key={k} label={k} score={v} />
                ))}
              </div>
            </div>
          )}

          {/* Price & Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Listing Details</div>
            <div className="text-2xl font-extrabold text-slate-800 mb-1">${fmt(property.price)}</div>
            <div className="text-xs text-slate-400 mb-4 font-medium">{property.days_on_market} days on market</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Type</span>
                <span className="text-slate-700 font-semibold">{property.property_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Suburb</span>
                <span className="text-slate-700 font-semibold">{property.suburb}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">State</span>
                <span className="text-slate-700 font-semibold">{property.state}</span>
              </div>
            </div>
          </div>

          {/* Client brief link */}
          {client && (
            <div
              onClick={() => navigate(`/clients/${client.id}`)}
              className="bg-brand-50 border border-brand-100 rounded-2xl p-4 cursor-pointer hover:bg-brand-100/50 transition-colors"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Client</div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-200 flex items-center justify-center text-brand-600 text-sm font-bold flex-shrink-0">
                  {client.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-700">{client.name}</div>
                  <div className="text-xs text-brand-400">${fmt(client.budget_min)} – ${fmt(client.budget_max)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
