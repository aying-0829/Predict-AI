'use client'

import type { LotteryType } from '@/lib/services'

type HistoryItem = {
  period: string
  date: string
  reds: number[]
  blue: number
  sum: number
  oddEven: string
  zone: string
}

const ZONE_META: Record<string, { label: string; range: string; color: string }[]> = {
  ssq: [
    { label: '一区', range: '01-11',  color: 'var(--neon-cyan)' },
    { label: '二区', range: '12-22',  color: '#e8c97a' },
    { label: '三区', range: '23-33',  color: '#8a7a50' },
  ],
  dlt: [
    { label: '一区', range: '01-12',  color: 'var(--neon-cyan)' },
    { label: '二区', range: '13-24',  color: '#e8c97a' },
    { label: '三区', range: '25-35',  color: '#8a7a50' },
  ],
  '3d': [
    { label: '小',   range: '0-4',    color: 'var(--neon-cyan)' },
    { label: '中',   range: '5-9',    color: '#e8c97a' },
    { label: '—',    range: '-',      color: '#8a7a50' },
  ],
}

export default function ZoneDisplay({ data, type }: { data: HistoryItem[]; type: LotteryType }) {
  const zones = ZONE_META[type] || ZONE_META.ssq

  // Parse zone string "z1:z2:z3" and aggregate
  const counts = [0, 0, 0]
  data.forEach(item => {
    const parts = item.zone.split(':').map(Number)
    if (parts.length === 3) {
      counts[0] += parts[0]
      counts[1] += parts[1]
      counts[2] += parts[2]
    }
  })

  const total = counts.reduce((s, n) => s + n, 0)
  const maxCount = Math.max(...counts, 1)

  return (
    <div className="space-y-4">
      {zones.map((zone, idx) => {
        const pct = total > 0 ? (counts[idx] / total * 100).toFixed(1) : '0'
        const widthPct = total > 0 ? counts[idx] / maxCount * 100 : 0

        return (
          <div key={zone.label} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#e8e8f0]">{zone.label}</span>
              <span className="text-[#9098b0]">{zone.range}</span>
              <span className="font-semibold text-[var(--neon-cyan)] font-numeric">{counts[idx]} 球 ({pct}%)</span>
            </div>
            <div className="h-2 bg-[rgba(0,229,255,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${zone.color}, ${zone.color}88)`,
                }}
              />
            </div>
          </div>
        )
      })}

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-[rgba(0,229,255,0.1)] text-xs text-[#9098b0] leading-relaxed">
        近 {data.length} 期区间占比：{zones[0].label} {total > 0 ? (counts[0] / total * 100).toFixed(1) : '0'}%，
        {zones[1].label} {total > 0 ? (counts[1] / total * 100).toFixed(1) : '0'}%，
        {zones[2].label} {total > 0 ? (counts[2] / total * 100).toFixed(1) : '0'}%。
        区间比倾向于 {counts.indexOf(maxCount) === 0 ? zones[0].label : counts.indexOf(maxCount) === 1 ? zones[1].label : zones[2].label} 热度最高。
      </div>
    </div>
  )
}
