'use client'

interface OddsEntry {
  matchId: string
  homeTeam: string
  awayTeam: string
  league: string
  time: string
  marketOdds: {
    homeWin: number
    draw: number
    awayWin: number
    provider: string
  }
  platformPrediction: {
    homeProb: number
    drawProb: number
    awayProb: number
    confidence: number
  }
  valueIndicator: 'home' | 'draw' | 'away' | null
  valueDiff: number
}

function ValueBadge({ indicator, diff }: { indicator: 'home' | 'draw' | 'away' | null; diff: number }) {
  if (!indicator) return null
  const label = indicator === 'home' ? '主胜价值' : indicator === 'draw' ? '平局价值' : '客胜价值'
  return (
    <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 text-xs rounded-full bg-green-900/50 text-green-300 border border-green-700/50">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      {label} +{diff}%
    </span>
  )
}

export default function OddsComparison({ entries }: { entries: OddsEntry[] }) {
  return (
    <div className="space-y-4">
      {entries.map(entry => (
        <div
          key={entry.matchId}
          className="bg-[#0c0c18] rounded-lg border border-[rgba(0,229,255,0.1)] overflow-hidden gold-glow-hover"
        >
          {/* 头部 */}
          <div className="px-5 py-3 border-b border-[rgba(0,229,255,0.1)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#e8e8f0]">
                  {entry.homeTeam} vs {entry.awayTeam}
                </span>
                {entry.valueIndicator && <ValueBadge indicator={entry.valueIndicator} diff={entry.valueDiff} />}
              </div>
              <div className="text-xs text-[#505870] mt-0.5">{entry.league} · {entry.time}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#505870]">AI置信度</div>
              <div className="text-sm font-numeric text-[var(--neon-cyan)]">{entry.platformPrediction.confidence}%</div>
            </div>
          </div>

          {/* 左右对比表 */}
          <div className="grid grid-cols-2 divide-x divide-[rgba(0,229,255,0.1)]">
            {/* 左侧：市场赔率 */}
            <div className="px-5 py-3">
              <div className="text-xs text-[#505870] uppercase tracking-wider mb-2">
                {entry.marketOdds.provider}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9098b0]">主胜</span>
                  <span className="text-[#e8e8f0] font-numeric">{entry.marketOdds.homeWin}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9098b0]">平局</span>
                  <span className="text-[#e8e8f0] font-numeric">{entry.marketOdds.draw}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9098b0]">客胜</span>
                  <span className="text-[#e8e8f0] font-numeric">{entry.marketOdds.awayWin}</span>
                </div>
              </div>
            </div>

            {/* 右侧：平台预测 */}
            <div className="px-5 py-3">
              <div className="text-xs text-[var(--neon-cyan)] uppercase tracking-wider mb-2">
                PREDICT AI 预测
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9098b0]">主胜概率</span>
                  <span className="text-[var(--neon-cyan)] font-numeric">{entry.platformPrediction.homeProb}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9098b0]">平局概率</span>
                  <span className="text-[var(--neon-cyan)] font-numeric">{entry.platformPrediction.drawProb}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9098b0]">客胜概率</span>
                  <span className="text-[var(--neon-cyan)] font-numeric">{entry.platformPrediction.awayProb}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 进度条对比 */}
          <div className="px-5 py-3 border-t border-[rgba(0,229,255,0.1)]">
            <div className="flex items-center gap-2 text-xs text-[#505870] mb-1">
              <span>主胜</span>
              <span className="ml-auto">客胜</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-[rgba(0,229,255,0.08)]">
              <div
                className="bg-[var(--neon-cyan)]/60 transition-all duration-500"
                style={{ width: `${entry.platformPrediction.homeProb}%` }}
              />
              <div
                className="bg-gray-600/40 transition-all duration-500"
                style={{ width: `${entry.platformPrediction.drawProb}%` }}
              />
              <div
                className="bg-blue-600/40 transition-all duration-500"
                style={{ width: `${entry.platformPrediction.awayProb}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#9098b0] mt-1">
              <span>{entry.platformPrediction.homeProb}%</span>
              <span>{entry.platformPrediction.drawProb}%</span>
              <span>{entry.platformPrediction.awayProb}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
