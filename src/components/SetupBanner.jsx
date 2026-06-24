import { AlertTriangle } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase'

export default function SetupBanner() {
  if (isSupabaseConfigured) return null
  return (
    <div className="mx-6 mt-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
      <AlertTriangle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-700 leading-relaxed">
        <span className="font-semibold">Supabase not connected.</span>{' '}
        Add <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
        <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to{' '}
        <code className="font-mono bg-amber-100 px-1 rounded">.env</code>, then run{' '}
        <code className="font-mono bg-amber-100 px-1 rounded">supabase-schema.sql</code>. UI is fully navigable.
      </p>
    </div>
  )
}
