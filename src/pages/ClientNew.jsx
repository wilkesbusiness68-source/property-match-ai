import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Save } from 'lucide-react'
import { createClient } from '../services/clients'
import { triggerBriefCreated } from '../services/n8n'
import TagInput from '../components/TagInput'
import Spinner from '../components/Spinner'

const PROPERTY_TYPES = ['House', 'Apartment', 'Townhouse', 'Land']
const INVESTMENT_TYPES = ['Owner Occupier', 'Investment']
const STATUSES = ['Active', 'On Hold', 'Settled']

const inp = 'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all'
const sel = `${inp} appearance-none cursor-pointer`

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children, required, half }) {
  return (
    <div className={half ? '' : ''}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function ClientNew() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    budget_min: '', budget_max: '',
    preferred_locations: [],
    property_type: 'House',
    bedrooms_min: '', bathrooms_min: '', car_spaces: '', land_size_min: '',
    investment_type: 'Owner Occupier',
    must_haves: [], nice_to_haves: [], excluded_features: [],
    notes: '', status: 'Active',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        budget_min: Number(form.budget_min) || null,
        budget_max: Number(form.budget_max) || null,
        bedrooms_min: Number(form.bedrooms_min) || null,
        bathrooms_min: Number(form.bathrooms_min) || null,
        car_spaces: Number(form.car_spaces) || null,
        land_size_min: Number(form.land_size_min) || null,
      }
      const created = await createClient(payload)
      await triggerBriefCreated(created.id)
      navigate(`/clients/${created.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 mt-2 transition-colors font-medium">
        <ChevronLeft size={16} /> Back to Clients
      </button>
      <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-6">New Client Brief</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Section title="Contact Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inp} placeholder="Jane Smith" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={sel}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inp} placeholder="jane@example.com" />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inp} placeholder="0400 000 000" />
            </Field>
          </div>
        </Section>

        <Section title="Budget">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Minimum ($)">
              <input type="number" value={form.budget_min} onChange={(e) => set('budget_min', e.target.value)} className={inp} placeholder="500,000" />
            </Field>
            <Field label="Maximum ($)" required>
              <input required type="number" value={form.budget_max} onChange={(e) => set('budget_max', e.target.value)} className={inp} placeholder="900,000" />
            </Field>
          </div>
        </Section>

        <Section title="Property Requirements">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Property Type">
              <select value={form.property_type} onChange={(e) => set('property_type', e.target.value)} className={sel}>
                {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Investment Type">
              <select value={form.investment_type} onChange={(e) => set('investment_type', e.target.value)} className={sel}>
                {INVESTMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Min Bedrooms">
              <input type="number" min={0} value={form.bedrooms_min} onChange={(e) => set('bedrooms_min', e.target.value)} className={inp} placeholder="3" />
            </Field>
            <Field label="Min Bathrooms">
              <input type="number" min={0} value={form.bathrooms_min} onChange={(e) => set('bathrooms_min', e.target.value)} className={inp} placeholder="2" />
            </Field>
            <Field label="Car Spaces">
              <input type="number" min={0} value={form.car_spaces} onChange={(e) => set('car_spaces', e.target.value)} className={inp} placeholder="1" />
            </Field>
            <Field label="Min Land Size (m²)">
              <input type="number" min={0} value={form.land_size_min} onChange={(e) => set('land_size_min', e.target.value)} className={inp} placeholder="400" />
            </Field>
          </div>
          <TagInput
            label="Preferred Locations (suburbs)"
            value={form.preferred_locations}
            onChange={(v) => set('preferred_locations', v)}
            placeholder="Type suburb and press Enter"
          />
        </Section>

        <Section title="Priorities & Deal Breakers">
          <div className="space-y-4">
            <TagInput label="Must Haves" value={form.must_haves} onChange={(v) => set('must_haves', v)} placeholder="e.g. Pool, Double garage, North facing" />
            <TagInput label="Nice to Haves" value={form.nice_to_haves} onChange={(v) => set('nice_to_haves', v)} placeholder="e.g. Home office, Solar panels" />
            <TagInput label="Excluded / Deal Breakers" value={form.excluded_features} onChange={(v) => set('excluded_features', v)} placeholder="e.g. High body corporate, Main road" />
          </div>
        </Section>

        <Section title="Additional Notes">
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            className={`${inp} resize-none`}
            placeholder="Context about this buyer's situation, timeline, or preferences…"
          />
        </Section>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">{error}</div>
        )}

        <div className="flex gap-3 pb-6">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/25 transition-all">
            {saving ? <Spinner size={16} /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Client Brief'}
          </button>
          <button type="button" onClick={() => navigate('/clients')} className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl border border-slate-200 transition-all">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
