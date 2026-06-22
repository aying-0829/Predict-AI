'use client'

type PointsRule = { action: string; points: number; description: string }

export { type PointsRule }

interface PointsCenterProps {
  points: number
  rules: PointsRule[]
}

export function PointsCenter({ points, rules }: PointsCenterProps) {
  const threshold = 3000
  const remainder = points % threshold
  const distance = remainder === 0 ? 0 : threshold - remainder
  const progressPct = Math.min(100, Math.round(remainder / threshold * 100))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--neon-cyan)]/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--neon-cyan)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          </div>
          <div>
            <div className="text-xs text-[#9098b0]">当前积分</div>
            <div className="font-numeric text-3xl font-bold text-[var(--neon-cyan)]">{points}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#9098b0] mb-1.5">
            <span>{distance === 0 ? '已满 3000 积分，可抵扣 1 个月会员' : `距离下次抵扣还差 ${distance} 积分`}</span>
            <span className="font-numeric">{progressPct}%</span>
          </div>
          <div className="h-2 bg-[rgba(0,229,255,0.08)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--neon-cyan)]/20 to-[var(--neon-cyan)] rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <p className="text-xs text-[#9098b0] leading-relaxed">
          满 3000 积分可抵扣 1 个月会员费用。积分通过签到、预测、分享等方式获取，长期有效。
        </p>
      </div>

      <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] p-6">
        <h3 className="text-sm font-semibold text-[var(--neon-cyan)] mb-4">积分获取规则</h3>
        <ul className="space-y-3">
          {rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--neon-cyan)]/10 flex items-center justify-center text-[var(--neon-cyan)] text-sm font-bold shrink-0">
                +{rule.points}
              </div>
              <div>
                <div className="text-sm text-[#e8e8f0] font-medium">{rule.action}</div>
                <div className="text-xs text-[#9098b0]">{rule.description}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
