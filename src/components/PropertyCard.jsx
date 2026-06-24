import { useNavigate } from 'react-router-dom'
import { Bed, Bath, Car, Maximize2, CheckCircle2, AlertCircle, XCircle, Eye, Bookmark, Star } from 'lucide-react'
import MatchBadge from './MatchBadge'

function fmt(n) {
  return n?.toLocaleString('en-AU') ?? '—'
}

export default function PropertyCard({ match, onSave, onRecommend }) {
  const navigate = useNavigate()
  const property = match.properties ?? match
  const score = match.match_score
  const strengths = match.strengths ?? []
  const considerations = match.considerations ?? []
  const redFlags = match.red_flags ?? []

  const summaryItems = [
    ...strengths.slice(0, 2).map((s) => ({ icon: CheckCircle2, text: s, color: 'text-green-400' })),
    ...considerations.slice(0, 1).map((s) => ({ icon: AlertCircle, text: s, color: 'text-yellow-400' })),
    ...redFlags.slice(0, 1).map((s) => ({ icon: XCircle, text: s, color: 'text-red-400' })),
  ].slice(0, 4)

  return (
    <div className="bg-[#161922] border border-white/5 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[#1E2235]">
        <img
          src={property.images?.[0] ?? `https://picsum.photos/seed/${property.domain_listing_id}/800/500`}
          alt={property.address}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <MatchBadge score={score} showLabel={false} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#161922] to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <div className="text-sm font-semibold text-white leading-snug">{property.address}</div>
          <div className="text-xs text-white/40 mt-0.5">{property.suburb}, {property.state}</div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
          <span className="flex items-center gap-1"><Bed size={13} />{property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath size={13} />{property.bathrooms}</span>
          <span className="flex items-center gap-1"><Car size={13} />{property.car_spaces}</span>
          {property.land_size > 0 && (
            <span className="flex items-center gap-1"><Maximize2 size={13} />{fmt(property.land_size)}m²</span>
          )}
        </div>

        {/* Price + Score */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-white">${fmt(property.price)}</div>
          <MatchBadge score={score} />
        </div>

        {/* Summary dots */}
        {summaryItems.length > 0 && (
          <ul className="space-y-1 mb-4">
            {summaryItems.map((item, i) => (
              <li key={i} className={`flex items-start gap-1.5 text-xs ${item.color}`}>
                <item.icon size={12} className="mt-0.5 flex-shrink-0" />
                <span className="text-white/60 line-clamp-1">{item.text}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/properties/${match.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Eye size={13} /> View Analysis
          </button>
          {onSave && (
            <button
              onClick={() => onSave(match)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              title="Save"
            >
              <Bookmark size={14} className="text-white/50" />
            </button>
          )}
          {onRecommend && (
            <button
              onClick={() => onRecommend(match)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              title="Recommend"
            >
              <Star size={14} className="text-white/50" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
