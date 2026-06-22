'use client'

interface Predictor {
  userId: number
  username: string
  accuracy: number
  totalPredictions: number
  currentStreak: number
}

interface Props {
  predictors: Predictor[]
}

export default function TopPredictors({ predictors }: Props) {
  if (predictors.length === 0) {
    return (
      <div className="text-center py-8 text-[#9098b0]">
        <p className="text-2xl mb-1">🏅</p>
        <p className="text-xs">暂无数据</p>
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {predictors.map((p, i) => (
        <div
          key={p.userId}
          className="flex-shrink-0 w-40 bg-[#0c0c18] p-4 rounded-xl border border-[rgba(0,229,255,0.1)] text-center"
        >
          <div className="text-2xl mb-1">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣'][i] || `#${i + 1}`}</div>
          <div className="w-10 h-10 mx-auto rounded-full bg-[#0c0c18] border border-[var(--neon-cyan)]/30 flex items-center justify-center text-sm font-bold text-[var(--neon-cyan)] mb-2">
            {p.username.charAt(0)}
          </div>
          <p className="text-sm text-[#e8e8f0] font-medium truncate">{p.username}</p>
          <p className="text-xs text-[var(--neon-cyan)] font-numeric">{p.accuracy}%</p>
          <p className="text-xs text-[#9098b0]">{p.totalPredictions} 次预测</p>
        </div>
      ))}
    </div>
  )
}
