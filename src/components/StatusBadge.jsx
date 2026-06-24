const configs = {
  Active: 'bg-green-50 text-green-700 border-green-200',
  'On Hold': 'bg-amber-50 text-amber-700 border-amber-200',
  Settled: 'bg-slate-100 text-slate-500 border-slate-200',
  New: 'bg-brand-50 text-brand-600 border-brand-100',
  Saved: 'bg-blue-50 text-blue-600 border-blue-100',
  Rejected: 'bg-red-50 text-red-600 border-red-100',
  Recommended: 'bg-green-50 text-green-700 border-green-200',
}

export default function StatusBadge({ status }) {
  const cls = configs[status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  )
}
