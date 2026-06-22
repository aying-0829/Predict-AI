'use client'

interface DuelData {
  id: number
  challengerId: number
  challengerName: string
  opponentId: number
  opponentName: string
  matchInfo: string
  stake: number
  result: string
  winnerId: number | null
  createdAt: string
  settledAt: string | null
}

interface Props {
  duels: DuelData[]
  currentUserId: number
}

export default function DuelHistory({ duels, currentUserId }: Props) {
  const settled = duels.filter((d) => d.result !== 'pending')

  if (settled.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-3xl mb-2">⚔️</p>
        <p>暂无历史对战记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {settled.map((d) => {
        const won = d.winnerId === currentUserId

        return (
          <div
            key={d.id}
            className="flex items-center justify-between bg-vault-surface-1 p-3 rounded-lg border border-vault-surface-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{won ? '🏆' : d.result === 'draw' ? '🤝' : '💔'}</span>
              <div>
                <p className="text-sm text-gray-300">
                  {d.challengerName} vs {d.opponentName}
                </p>
                {d.matchInfo && <p className="text-xs text-gray-400">{d.matchInfo}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${won ? 'text-green-400' : d.result === 'draw' ? 'text-gray-400' : 'text-red-400'}`}>
                {won ? `+${d.stake}` : d.result === 'draw' ? '0' : `-${d.stake}`} 分
              </p>
              <p className="text-xs text-gray-400">{d.settledAt?.slice(0, 10) || d.createdAt?.slice(0, 10)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
