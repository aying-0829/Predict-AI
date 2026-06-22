'use client'

import type { LotteryType, AIRecommendation } from '@/lib/services'

function NumBall({ num, variant, size = 44 }: { num: number; variant: 'hot' | 'warm' | 'cold' | 'missing' | 'red' | 'blue' | 'ok'; size?: number }) {
  const styles: Record<string, string> = {
    hot: `bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30`,
    warm: `bg-gradient-to-br from-amber-500 to-amber-400 text-white`,
    cold: `bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30`,
    missing: `bg-gray-200 text-[#505870] border-2 border-dashed border-gray-400`,
    red: `bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-600/20`,
    blue: `bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20`,
    ok: `border-2 border-[rgba(0,229,255,0.1)] text-[#e8e8f0]`,
  }
  return (
    <div className={`rounded-full flex items-center justify-center font-bold transition-transform hover:scale-110 ${styles[variant] || styles.ok}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {String(num).padStart(2, '0')}
    </div>
  )
}

interface RecommendationPanelProps {
  predictions: { current: AIRecommendation; next: AIRecommendation }
  activeType: LotteryType
}

export function RecommendationPanel({ predictions, activeType }: RecommendationPanelProps) {
  const RED = '#dc2626'
  const BLUE = '#2563eb'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {(['current', 'next'] as const).map((period) => {
        const pred = predictions[period]
        if (!pred) return null
        const { reds, blues } = pred
        const displayPeriod = pred.period || '-'
        const displayDate = pred.date || '-'

        return (
          <div key={period} className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-[var(--neon-cyan)]/10 to-transparent flex justify-between items-center">
              <h4 className="text-sm font-semibold text-[#e8e8f0]">
                {period === 'current' ? `本期推荐 · 第 ${displayPeriod} 期` : `下期预判 · 第 ${displayPeriod} 期`}
              </h4>
              <span className="text-[11px] text-[#505870]">
                {displayDate} 开奖
              </span>
            </div>
            <div className="p-5">
              {/* Large recommendation balls */}
              <div className="flex gap-3 justify-center mb-5">
                {reds.map((n, i) => (
                  <NumBall key={`pred-r-${i}`} num={n} variant="red" size={56} />
                ))}
                {blues.map((n, i) => (
                  <NumBall key={`pred-b-${i}`} num={n} variant="blue" size={56} />
                ))}
              </div>

              {/* Prob bars */}
              <div className="space-y-2 mb-4">
                {pred.numberProbabilities.map(({ number, probability }, i) => (
                  <div key={`prob-${i}`} className="flex items-center gap-2 text-[11px]">
                    <span className="w-5 text-right text-[#e8e8f0] font-semibold">
                      {String(number).padStart(2, '0')}
                    </span>
                    <div className="flex-1 h-1.5 bg-[rgba(0,229,255,0.08)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${probability}%`,
                          background: blues.includes(number)
                            ? `linear-gradient(90deg, ${BLUE}, #3b82f6)`
                            : `linear-gradient(90deg, ${RED}, #ef4444)`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-[#9098b0] font-numeric">
                      {probability}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-1 bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] text-[11px] px-2.5 py-1 rounded-full mb-2">
                AI 推荐置信度: <span className="font-numeric font-semibold text-[var(--neon-cyan)]">{pred.confidence}%</span>
              </div>
              <p className="text-[11px] text-[#9098b0] leading-relaxed">{pred.analysis}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
