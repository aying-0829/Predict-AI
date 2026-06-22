'use client'

import type { LotteryType, LotteryHistoryItem } from '@/lib/services'

const GOLD = 'var(--neon-cyan)'

function EmptyDim({ type }: { type: LotteryType }) {
  const labels: Record<LotteryType, string> = { ssq: '双色球', dlt: '大乐透', '3d': '福彩3D' }
  return <p className="text-xs text-gray-400 text-center py-4">{labels[type]}暂无图表数据</p>
}

interface SumTrendChartProps {
  data: LotteryHistoryItem[]
  type: LotteryType
}

export function SumTrendChart({ data, type }: SumTrendChartProps) {
  const recent = data.slice(0, 12).reverse()
  const w = 380
  const h = 160
  const pad = 32

  // 3D: sum = all three digits; SSQ/DLT: use precomputed sum field
  const sums = type === '3d'
    ? recent.map(d => (d.reds || []).reduce((a: number, b: number) => a + b, 0))
    : recent.map(d => d.sum)
  if (sums.length === 0) return <EmptyDim type={type} />

  const minS = Math.min(...sums) - (type === '3d' ? 2 : 10)
  const maxS = Math.max(...sums) + (type === '3d' ? 2 : 10)
  const range = maxS - minS || 1
  const points = sums.map((s, i) => {
    const x = pad + (i / (sums.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (s - minS) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mx-auto">
      <text x={pad} y={14} fill="#a0a0a0" fontSize="10">和值走势（近12期）</text>
      {[0, 0.25, 0.5, 0.75, 1].map(pct => (
        <line key={pct} x1={pad} y1={pad + pct * (h - pad * 2)} x2={w - pad} y2={pad + pct * (h - pad * 2)}
          stroke="#3a3530" strokeWidth="0.5" strokeDasharray="3,3" />
      ))}
      <polyline points={points} fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
      {sums.map((s, i) => {
        const x = pad + (i / (sums.length - 1)) * (w - pad * 2)
        const y = pad + (1 - (s - minS) / range) * (h - pad * 2)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill={GOLD} />
            <text x={x} y={y - 8} textAnchor="middle" fontSize="8" fill="#a0a0a0">{s}</text>
          </g>
        )
      })}
    </svg>
  )
}
