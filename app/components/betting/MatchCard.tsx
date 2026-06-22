'use client'

type AiPrediction = {
  winner: 'home' | 'away' | 'draw'
  confidence: number
  scorePrediction: string
  bar: { home: number; draw: number; away: number }
}
type ActualResult = { homeScore: number; awayScore: number; hit: boolean }
export type SportMatch = {
  id: string; league: string; homeTeam: string; awayTeam: string
  homeFlag: string; awayFlag: string; time: string
  status: 'live' | 'upcoming' | 'finished'
  homeScore?: number; awayScore?: number; minute?: number
  aiPrediction: AiPrediction
  actualResult?: ActualResult
}

const winnerLabel: Record<string, string> = { home: '主胜', away: '客胜', draw: '平局' }

function probBar(home: number, draw: number, away: number, winner: string) {
  const items = [
    { label: '主胜', pct: home, type: 'home' },
    { label: '平局', pct: draw, type: 'draw' },
    { label: '客胜', pct: away, type: 'away' },
  ]
  return (
    <div className="flex gap-1.5 mt-2">
      {items.map(it => (
        <div key={it.type} className="flex-1">
          <div className="flex justify-between text-[11px] text-[#9098b0] mb-0.5">
            <span>{it.label}</span>
            <span className={it.type === winner ? 'text-[var(--neon-cyan)] font-semibold' : ''}>{it.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[rgba(0,229,255,0.08)]/40 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${it.type === winner ? 'bg-[var(--neon-cyan)]' : 'bg-[rgba(0,229,255,0.20)]'}`}
              style={{ width: `${it.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

interface MatchCardProps {
  m: SportMatch
}

export function MatchCard({ m }: MatchCardProps) {
  const isLive = m.status === 'live'
  const isUpcoming = m.status === 'upcoming'
  const isFinished = m.status === 'finished'
  const hit = m.actualResult?.hit

  return (
    <div key={m.id} className="card-premium p-5">
      {/* header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#0c0c18]/60 text-[var(--neon-cyan)] px-2 py-0.5 rounded">{m.league}</span>
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              进行中 {m.minute}&apos;
            </span>
          )}
          {isUpcoming && <span className="text-xs text-[#9098b0]">{m.time}</span>}
          {isFinished && (
            <span className="text-xs text-[#9098b0]">
              {m.time} · 完场
              {hit === true && <span className="ml-1.5 text-green-400">✔</span>}
              {hit === false && <span className="ml-1.5 text-red-400">✘</span>}
            </span>
          )}
        </div>
      </div>

      {/* teams + score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg">{m.homeFlag}</span>
          <span className="text-base font-semibold text-white">{m.homeTeam}</span>
        </div>
        {isLive || isFinished ? (
          <div className="text-2xl font-bold text-[var(--neon-cyan)] mx-4">
            {m.homeScore} - {m.awayScore}
          </div>
        ) : (
          <span className="text-sm text-[#9098b0] mx-4">VS</span>
        )}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-base font-semibold text-white">{m.awayTeam}</span>
          <span className="text-lg">{m.awayFlag}</span>
        </div>
      </div>

      {/* AI prediction */}
      <div className="mt-3 pt-3 border-t border-[rgba(0,229,255,0.1)]/30">
        <div className="flex items-center gap-2 text-xs text-[#9098b0]">
          <span className="text-[var(--neon-cyan)] font-semibold">AI 预测</span>
          {!isFinished && (
            <>
              <span>{winnerLabel[m.aiPrediction.winner]}</span>
              <span>· 比分 {m.aiPrediction.scorePrediction}</span>
              <span>· 置信度 {m.aiPrediction.confidence}%</span>
            </>
          )}
          {isFinished && m.actualResult && (
            <>
              <span>赛前预测: {winnerLabel[m.aiPrediction.winner]}</span>
              <span>{m.aiPrediction.scorePrediction}</span>
              <span className={hit ? 'text-green-400' : 'text-red-400'}>
                {hit ? '命中' : '未命中'}
              </span>
            </>
          )}
        </div>
        {!isFinished && probBar(m.aiPrediction.bar.home, m.aiPrediction.bar.draw, m.aiPrediction.bar.away, m.aiPrediction.winner)}
      </div>
    </div>
  )
}
