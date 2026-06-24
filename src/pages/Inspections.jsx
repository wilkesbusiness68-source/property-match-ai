import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, ChevronRight, MapPin } from 'lucide-react'
import { getInspections } from '../services/inspections'
import Spinner from '../components/Spinner'

export default function Inspections() {
  const navigate = useNavigate()
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInspections().then(setInspections).catch(console.error).finally(() => setLoading(false))
  }, [])

  const scoreKeys = ['exterior_score','interior_score','kitchen_score','bathroom_score','flooring_score','roof_score','structural_score','neighbourhood_score','noise_score']

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Inspections</h1>
        <p className="text-sm text-slate-400 mt-0.5">{inspections.length} report{inspections.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2"><Spinner /> Loading…</div>
      ) : inspections.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <ClipboardCheck size={36} className="text-slate-200 mx-auto mb-3" />
          <div className="text-sm font-semibold text-slate-500 mb-1">No inspection reports yet</div>
          <div className="text-xs text-slate-400">Open a property analysis and click "Begin Inspection" to start one.</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {inspections.map((insp, i) => {
            const property = insp.property_matches?.properties
            const submitted = !!insp.submitted_at
            const scores = scoreKeys.map((k) => insp[k]).filter(Boolean)
            const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

            return (
              <div
                key={insp.id}
                onClick={() => navigate(`/inspections/${insp.id}`)}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors group ${i < inspections.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className={`p-2.5 rounded-xl ${submitted ? 'bg-green-50' : 'bg-amber-50'}`}>
                  <ClipboardCheck size={17} className={submitted ? 'text-green-600' : 'text-amber-600'} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-slate-800">{property?.address ?? 'Unknown Property'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${submitted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {submitted ? 'Submitted' : 'In Progress'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <MapPin size={10} /> {property?.suburb}
                    {insp.submitted_at && <span className="ml-3">{new Date(insp.submitted_at).toLocaleDateString('en-AU')}</span>}
                  </div>
                </div>

                {avg !== null && (
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-slate-800">{avg}<span className="text-sm text-slate-400 font-medium">/10</span></div>
                    <div className="text-xs text-slate-400">avg score</div>
                  </div>
                )}

                <ChevronRight size={15} className="text-slate-300 group-hover:text-brand-400 transition-colors flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
