'use client'

interface LiveMatchInfo {
  home: string; away: string; homeScore: number; awayScore: number
  minute: number; aiPrediction: string; aiConfidence: number; status: string
}

export function LiveMatchCard({ match }: { match: LiveMatchInfo }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-heading)]">实时比赛</h3>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full animate-pulse bg-[var(--neon-orange)]" style={{ boxShadow: '0 0 8px rgba(255,107,53,0.6)' }} />
          <span className="text-xs text-[var(--neon-orange)] font-semibold uppercase">进行中 {match.minute}&apos;</span>
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-center flex-1"><div className="text-lg font-bold text-[var(--text-heading)]">{match.home}</div></div>
        <div className="text-center flex-1"><div className="vs-score text-[2.5rem]">{match.homeScore} - {match.awayScore}</div></div>
        <div className="text-center flex-1"><div className="text-lg font-bold text-[var(--text-heading)]">{match.away}</div></div>
      </div>
      <div className="mt-4 pt-3 flex items-center justify-between text-xs" /* keep dynamic */>
        <span className="text-[var(--text-label)]">AI 预测</span>
        <span className="text-[var(--neon-cyan)] font-semibold">{match.aiPrediction}</span>
        <span className="text-[var(--neon-cyan)]">置信度 {match.aiConfidence}%</span>
      </div>
    </div>
  )
}
