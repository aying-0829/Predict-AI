'use client'

interface Prediction {
  id: number
  userId: number
  username: string
  lotteryType: string
  numbers: string
  result: string
  isHit: number
  createdAt: string
}

interface Props {
  predictions: Prediction[]
}

const typeLabels: Record<string, string> = {
  ssq: '双色球',
  dlt: '大乐透',
  '3d': '福彩3D',
  sport: '竞彩足球',
  pl5: '排列五',
}

export default function PredictionFeed({ predictions }: Props) {
  if (predictions.length === 0) {
    return (
      <div className="text-center py-12 text-[#9098b0]">
        <p className="text-3xl mb-2">📡</p>
        <p>暂无预测动态</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {predictions.map((p) => (
        <div
          key={p.id}
          className="bg-[#0c0c18] p-4 rounded-xl border border-[rgba(0,229,255,0.1)] hover:border-[var(--neon-cyan)]/30 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] flex items-center justify-center text-sm">
              {p.username.charAt(0)}
            </div>
            <div>
              <span className="text-sm text-[#e8e8f0] font-medium">{p.username}</span>
              <span className="text-xs text-[#9098b0] ml-2">{p.createdAt?.slice(0, 16)}</span>
            </div>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] border border-[rgba(0,229,255,0.3)]/20">
              {typeLabels[p.lotteryType] || p.lotteryType}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-[#9098b0]">预测: </span>
              <span className="text-[#e8e8f0] font-mono">{p.numbers}</span>
            </div>
            {p.result && (
              <div>
                <span className="text-[#9098b0]">结果: </span>
                <span className="text-[#e8e8f0] font-mono">{p.result}</span>
              </div>
            )}
            <span
              className={`text-xs font-semibold ml-auto ${
                p.isHit ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {p.isHit ? '命中' : '未中'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
