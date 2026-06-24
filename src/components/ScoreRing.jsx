import { getMatchConfig } from './MatchBadge'

export default function ScoreRing({ score, size = 140 }) {
  const cfg = getMatchConfig(score)
  const r = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={10} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={cfg.ringColor} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold leading-none" style={{ color: cfg.ringColor }}>{score}</div>
        <div className="text-xs text-slate-400 mt-0.5 font-medium">/ 100</div>
      </div>
    </div>
  )
}
