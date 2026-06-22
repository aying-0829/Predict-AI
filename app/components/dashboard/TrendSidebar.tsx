'use client'

import dynamic from 'next/dynamic'

interface TrendPoint { date: string; hitCount: number; detail: string }

const TrendChart = dynamic(() => import('../TrendChart'), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-[rgba(10,13,28,0.5)] rounded animate-pulse" />,
})

export function TrendSidebar({ trend, title: _title = '近7期双色球预测回顾' }: { trend: TrendPoint[]; title?: string }) {
  const safeTrend = Array.isArray(trend) ? trend : []
  const hitCounts = safeTrend.map(t => t.hitCount)
  const maxHit = hitCounts.length > 0 ? Math.max(...hitCounts) : 0
  const minHit = hitCounts.length > 0 ? Math.min(...hitCounts) : 0
  const avgHit = safeTrend.length > 0 ? safeTrend.reduce((s, t) => s + t.hitCount, 0) / safeTrend.length : 0

  return (
    <div className="glass-panel p-5">
      <h3 className="text-sm font-semibold text-[var(--text-heading)] pl-3 mb-4 flex items-center gap-2" /* keep dynamic */>近7期双色球预测回顾</h3>
      <TrendChart data={safeTrend} />
      <div className="flex justify-between text-xs text-[var(--text-label)] mt-4 pt-3" /* keep dynamic */>
        <span>最高: <strong className="text-[var(--neon-cyan)]">{maxHit}</strong> 命中</span>
        <span>平均: <strong className="text-[var(--neon-cyan)]">{avgHit.toFixed(1)}</strong> 命中</span>
        <span>最低: <strong className="text-[var(--neon-cyan)]">{minHit}</strong> 命中</span>
      </div>
    </div>
  )
}
