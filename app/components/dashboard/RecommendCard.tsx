'use client'

import { useMemo } from 'react'

interface TodayRecommendation {
  id: string
  type: 'match' | 'lottery'
  title: string
  subtitle: string
  confidence: number
  detail: string
}

interface RecommendCardProps { rec: TodayRecommendation }

function parseLotteryNumbers(detail: string): { reds: string[]; blues: string[] } | null {
  const redMatch = detail.match(/(?:红球|前区)[：:]\s*([\d,\s]+)/)
  const blueMatch = detail.match(/(?:蓝球|后区)[：:]\s*([\d,\s]+)/)
  if (!redMatch) return null
  const reds = redMatch[1].split(',').map(s => s.trim()).filter(Boolean)
  const blues = blueMatch ? blueMatch[1].split(',').map(s => s.trim()).filter(Boolean) : []
  if (reds.length === 0) return null
  return { reds, blues }
}

export function RecommendCard({ rec }: RecommendCardProps) {
  const numbers = useMemo(() => rec.type === 'lottery' ? parseLotteryNumbers(rec.detail) : null, [rec.type, rec.detail])

  const confCls = rec.confidence >= 70
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : rec.confidence >= 50
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-[var(--text-dim)] bg-[var(--text-dim)]/10 border-[var(--text-dim)]/20'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="overflow-hidden">
          <h3 className="text-sm font-semibold text-[var(--text-heading)] truncate">{rec.title}</h3>
          <p className="text-xs text-[var(--text-label)] mt-0.5">{rec.subtitle}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ml-3 font-semibold ${confCls}`}>置信度 {rec.confidence}%</span>
      </div>
      {rec.type === 'match' ? (
        <p className="text-sm text-[var(--text-body)] leading-relaxed">{rec.detail}</p>
      ) : numbers ? (
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {numbers.reds.map((n, i) => (
              <span key={`r-${i}`} className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold" style={{ boxShadow: '0 0 10px rgba(220,38,38,0.3)' }}>{n.padStart(2, '0')}</span>
            ))}
            {numbers.blues.map((n, i) => (
              <span key={`b-${i}`} className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold" style={{ boxShadow: '0 0 10px rgba(37,99,235,0.3)' }}>{n.padStart(2, '0')}</span>
            ))}
          </div>
          <p className="text-xs text-[var(--text-label)] mt-2">{rec.detail}</p>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-body)] leading-relaxed">{rec.detail}</p>
      )}
    </div>
  )
}
