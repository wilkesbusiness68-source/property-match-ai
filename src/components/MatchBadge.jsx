export function getMatchConfig(score) {
  if (score >= 80) return {
    color: '#16A34A', label: 'Excellent Fit',
    badgeCls: 'bg-green-50 text-green-700 border-green-200',
    ringColor: '#16A34A', tier: 'excellent',
  }
  if (score >= 50) return {
    color: '#D97706', label: 'Strong Fit',
    badgeCls: 'bg-amber-50 text-amber-700 border-amber-200',
    ringColor: '#D97706', tier: 'strong',
  }
  if (score >= 30) return {
    color: '#EA580C', label: 'Possible Match',
    badgeCls: 'bg-orange-50 text-orange-700 border-orange-200',
    ringColor: '#EA580C', tier: 'possible',
  }
  return {
    color: '#DC2626', label: 'Poor Fit',
    badgeCls: 'bg-red-50 text-red-700 border-red-200',
    ringColor: '#DC2626', tier: 'poor',
  }
}

export default function MatchBadge({ score, showLabel = true, size = 'sm' }) {
  const cfg = getMatchConfig(score)
  if (size === 'lg') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold ${cfg.badgeCls}`}>
        <span className="text-base font-bold">{score}</span>
        {showLabel && <span className="text-sm">{cfg.label}</span>}
      </div>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badgeCls}`}>
      <span className="font-bold">{score}</span>
      {showLabel && <span className="opacity-80">— {cfg.label}</span>}
    </span>
  )
}
