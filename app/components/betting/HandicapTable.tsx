'use client'

type HandicapItem = {
  matchId: string; homeTeam: string; awayTeam: string
  handicap: string; odds: { home: number; draw: number; away: number }
  aiPick: 'home' | 'away' | 'draw'
}
type Selection = { matchId: string; pick: string; odds: number; label: string }

const winnerLabel: Record<string, string> = { home: '主胜', away: '客胜', draw: '平局' }

interface HandicapTableProps {
  handicap: HandicapItem[]
  selections: Selection[]
  onToggleOdds: (matchId: string, pick: string, odds: number, home: string, away: string) => void
}

export function HandicapTable({ handicap, selections, onToggleOdds }: HandicapTableProps) {
  if (handicap.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold text-[var(--neon-cyan)] mb-4">让球盘分析</h2>
      <div className="card-premium overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,229,255,0.1)]/30 bg-[#0c0c18]/30 text-[var(--neon-cyan)] text-xs">
              <th className="text-left px-4 py-3">赛事</th>
              <th className="text-left px-4 py-3">主队</th>
              <th className="text-center px-4 py-3">让球</th>
              <th className="text-left px-4 py-3">客队</th>
              <th className="text-center px-3 py-3">主胜</th>
              <th className="text-center px-3 py-3">平局</th>
              <th className="text-center px-3 py-3">客胜</th>
              <th className="text-center px-4 py-3">AI 推荐</th>
            </tr>
          </thead>
          <tbody>
            {handicap.map(h => {
              const s = selections.find(sl => sl.matchId === h.matchId)
              return (
                <tr key={h.matchId} className="border-b border-[rgba(0,229,255,0.1)]/15 hover:bg-[#0c0c18]/5 transition-colors">
                  <td className="px-4 py-3 text-[#9098b0] text-xs">{h.matchId.toUpperCase()}</td>
                  <td className="px-4 py-3 text-white font-medium">{h.homeTeam}</td>
                  <td className="px-4 py-3 text-center text-[var(--neon-cyan)] font-semibold">{h.handicap}</td>
                  <td className="px-4 py-3 text-white font-medium">{h.awayTeam}</td>
                  {(['home', 'draw', 'away'] as const).map(pick => {
                    const selected = s?.pick === pick
                    return (
                      <td key={pick} className="px-3 py-3 text-center">
                        <OddsButton
                          pick={pick}
                          odds={h.odds[pick]}
                          selected={!!selected}
                          onClick={() => onToggleOdds(h.matchId, pick, h.odds[pick], h.homeTeam, h.awayTeam)}
                        />
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className="text-[var(--neon-cyan)] font-semibold text-xs">
                      {winnerLabel[h.aiPick]}
                    </span>
                    <span className="ml-1 text-[10px] bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] px-1.5 py-0.5 rounded">AI</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OddsButton({
  odds, selected, onClick,
}: {
  pick: string; odds: number; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
        selected
          ? 'bg-[var(--neon-cyan)]/20 border border-[rgba(0,229,255,0.3)] text-[var(--neon-cyan)]'
          : 'text-white hover:bg-[#0c0c18]/40'
      }`}
    >
      {odds}
    </button>
  )
}
