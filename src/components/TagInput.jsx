import { useState } from 'react'
import { X } from 'lucide-react'

export default function TagInput({ label, value = [], onChange, placeholder }) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed])
    setInput('')
  }

  const remove = (tag) => onChange(value.filter((t) => t !== tag))

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>}
      <div className="bg-white border border-slate-200 rounded-xl p-3 min-h-[52px] focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-600 text-xs rounded-lg border border-brand-100 font-medium">
              {tag}
              <button onClick={() => remove(tag)} className="hover:text-brand-700 transition-colors ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder ?? 'Type and press Enter'}
          className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
        />
      </div>
    </div>
  )
}
