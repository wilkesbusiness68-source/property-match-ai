import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save, CheckCircle2 } from 'lucide-react'
import { getInspection, submitInspection } from '../services/inspections'
import { triggerInspectionComplete } from '../services/n8n'
import Spinner from '../components/Spinner'

const CATEGORIES = [
  { key: 'exterior_score', label: 'Exterior & Façade' },
  { key: 'interior_score', label: 'Interior & Layout' },
  { key: 'kitchen_score', label: 'Kitchen' },
  { key: 'bathroom_score', label: 'Bathrooms' },
  { key: 'flooring_score', label: 'Flooring' },
  { key: 'roof_score', label: 'Roof & Gutters' },
  { key: 'structural_score', label: 'Structural Integrity' },
  { key: 'neighbourhood_score', label: 'Neighbourhood' },
  { key: 'noise_score', label: 'Noise Levels' },
]

function ScorePicker({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {[1,2,3,4,5,6,7,8,9,10].map((n) => {
        const isActive = value === n
        const activeColor = n >= 8 ? 'bg-green-500 text-white border-green-500' : n >= 5 ? 'bg-amber-400 text-white border-amber-400' : 'bg-red-400 text-white border-red-400'
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-xl text-sm font-bold border-2 transition-all disabled:cursor-not-allowed ${
              isActive ? activeColor : 'bg-white border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-500'
            }`}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

export default function InspectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inspection, setInspection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    getInspection(id).then((insp) => {
      setInspection(insp)
      const init = {}
      CATEGORIES.forEach(({ key }) => { init[key] = insp[key] ?? null })
      init.renovation_required = insp.renovation_required ?? false
      init.estimated_reno_cost = insp.estimated_reno_cost ?? ''
      init.notes = insp.notes ?? ''
      setForm(init)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, estimated_reno_cost: form.estimated_reno_cost ? Number(form.estimated_reno_cost) : null }
      const updated = await submitInspection(id, payload)
      setInspection(updated)
      await triggerInspectionComplete(id)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 flex items-center gap-2 text-slate-400 text-sm"><Spinner />Loading…</div>
  if (!inspection) return <div className="p-8 text-slate-400 text-sm">Inspection not found.</div>

  const submitted = !!inspection.submitted_at
  const property = inspection.property_matches?.properties
  const filled = CATEGORIES.filter(({ key }) => form[key] != null).length
  const avg = filled > 0 ? Math.round(CATEGORIES.filter(({ key }) => form[key] != null).reduce((a, { key }) => a + form[key], 0) / filled) : null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate('/inspections')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 mt-2 transition-colors font-medium">
        <ChevronLeft size={16} /> Back to Inspections
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">
            {submitted ? 'Inspection Report' : 'New Inspection'}
          </h1>
          <div className="text-sm text-slate-400 font-medium">{property?.address}</div>
        </div>
        {avg !== null && (
          <div className="text-right bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3">
            <div className="text-2xl font-extrabold text-slate-800">{avg}<span className="text-base text-slate-400 font-medium">/10</span></div>
            <div className="text-xs text-slate-400">avg score</div>
          </div>
        )}
      </div>

      {submitted && (
        <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2 font-semibold">
          <CheckCircle2 size={15} /> Submitted {new Date(inspection.submitted_at).toLocaleDateString('en-AU')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-800">{label}</label>
              {form[key] != null && (
                <span className={`text-sm font-extrabold ${form[key] >= 8 ? 'text-green-600' : form[key] >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                  {form[key]}/10
                </span>
              )}
            </div>
            <ScorePicker value={form[key]} onChange={(v) => set(key, v)} disabled={submitted} />
          </div>
        ))}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <input type="checkbox" id="reno" checked={form.renovation_required} onChange={(e) => set('renovation_required', e.target.checked)} disabled={submitted} className="w-4 h-4 accent-brand-500 rounded" />
            <label htmlFor="reno" className="text-sm font-bold text-slate-800 cursor-pointer">Renovation Required</label>
          </div>
          {form.renovation_required && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Estimated Renovation Cost ($)</label>
              <input
                type="number"
                value={form.estimated_reno_cost}
                onChange={(e) => set('estimated_reno_cost', e.target.value)}
                disabled={submitted}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:opacity-50 transition-all"
                placeholder="25,000"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <label className="block text-xs font-semibold text-slate-500 mb-2">Notes</label>
          <textarea
            rows={5}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            disabled={submitted}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none disabled:opacity-50 transition-all"
            placeholder="General observations, specific concerns, recommended actions…"
          />
        </div>

        {!submitted && (
          <button
            type="submit"
            disabled={saving || filled === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-2xl shadow-md shadow-brand-500/25 transition-all"
          >
            {saving ? <Spinner size={16} /> : <Save size={16} />}
            {saving ? 'Submitting…' : 'Submit Inspection Report'}
          </button>
        )}
      </form>
    </div>
  )
}
