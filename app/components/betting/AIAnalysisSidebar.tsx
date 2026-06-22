'use client'

export type AIAnalysis = {
  safest: { match: string; reason: string }
  over25: { match: string; reason: string }
  upset: { match: string; reason: string }
}

interface AIAnalysisSidebarProps {
  analysis: AIAnalysis
}

export function AIAnalysisSidebar({ analysis }: AIAnalysisSidebarProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-[var(--neon-cyan)]">AI 今日推荐</h2>

      {/* safest */}
      <div className="card-premium p-4 border-l-4 border-l-green-500">
        <div className="text-xs text-green-400 font-semibold mb-1">最稳场次</div>
        <div className="text-sm font-semibold text-white mb-1">{analysis.safest.match}</div>
        <div className="text-xs text-[var(--neon-cyan)] leading-relaxed">{analysis.safest.reason}</div>
      </div>

      {/* over 2.5 */}
      <div className="card-premium p-4 border-l-4 border-l-blue-500">
        <div className="text-xs text-blue-400 font-semibold mb-1">大球概率</div>
        <div className="text-sm font-semibold text-white mb-1">{analysis.over25.match}</div>
        <div className="text-xs text-[var(--neon-cyan)] leading-relaxed">{analysis.over25.reason}</div>
      </div>

      {/* upset */}
      <div className="card-premium p-4 border-l-4 border-l-orange-500">
        <div className="text-xs text-orange-400 font-semibold mb-1">冷门预警</div>
        <div className="text-sm font-semibold text-white mb-1">{analysis.upset.match}</div>
        <div className="text-xs text-[var(--neon-cyan)] leading-relaxed">{analysis.upset.reason}</div>
      </div>
    </div>
  )
}
