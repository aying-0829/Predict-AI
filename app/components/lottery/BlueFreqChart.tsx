'use client'

import type { LotteryType, LotteryHistoryItem } from '@/lib/services'

const GOLD = 'var(--neon-cyan)'
const RED = '#dc2626'
const AMBER = '#f59e0b'

function EmptyDim({ type }: { type: LotteryType }) {
  const labels: Record<LotteryType, string> = { ssq: '双色球', dlt: '大乐透', '3d': '福彩3D' }
  return <p className="text-xs text-gray-400 text-center py-4">{labels[type]}暂无图表数据</p>
}

function isSSQorDLT(t: LotteryType) { return t === 'ssq' || t === 'dlt' }

interface BlueFreqChartProps {
  data: LotteryHistoryItem[]
  type: LotteryType
}

export function BlueFreqChart({ data, type }: BlueFreqChartProps) {
  // 3D: show digit frequency 0-9 across all positions
  if (type === '3d') {
    const freq: Record<number, number> = {}
    for (let i = 0; i <= 9; i++) freq[i] = 0
    data.forEach(d => {
      (d.reds || []).forEach(n => { if (n >= 0 && n <= 9) freq[n]++ })
    })
    const entries = Object.entries(freq).map(([k, v]) => ({ num: +k, count: v }))
    const maxCount = Math.max(...entries.map(e => e.count), 1)
    const barW = 32
    const chartH = 200
    const padding = 24
    const w = entries.length * (barW + 6) + padding * 2

    return (
      <svg width={w > 400 ? w : 400} height={chartH + 40} className="mx-auto">
        <text x={padding} y={16} fill="#8b7e6a" fontSize="11">号码出现频率（近{data.length}期）</text>
        {entries.map((e, i) => {
          const h = (e.count / maxCount) * (chartH - 40)
          const x = padding + i * (barW + 6)
          const y = chartH - h
          let fill = GOLD
          if (e.count >= maxCount * 0.85) fill = RED
          else if (e.count >= maxCount * 0.6) fill = AMBER
          return (
            <g key={e.num}>
              <rect x={x} y={y} width={barW} height={h} rx="3" fill={fill} opacity={0.85} />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="9" fill="#a0a0a0">{e.count}次</text>
              <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="11" fill="#b0b0b0" fontWeight="600">
                {String(e.num).padStart(2, '0')}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  if (!isSSQorDLT(type)) return <EmptyDim type={type} />
  const blueMax = type === 'dlt' ? 12 : 16
  const freq: Record<number, number> = {}
  for (let i = 1; i <= blueMax; i++) freq[i] = 0
  data.forEach(d => { if (d.blue > 0) freq[d.blue]++ })
  const entries = Object.entries(freq).map(([k, v]) => ({ num: +k, count: v }))
  const maxCount = Math.max(...entries.map(e => e.count), 1)
  const barW = 28
  const chartH = 200
  const padding = 24
  const w = entries.length * (barW + 8) + padding * 2

  return (
    <svg width={w > 400 ? w : 400} height={chartH + 40} className="mx-auto">
      <text x={padding} y={16} fill="#8b7e6a" fontSize="11">蓝球出现频率（近{data.length}期）</text>
      {entries.map((e, i) => {
        const h = (e.count / maxCount) * (chartH - 40)
        const x = padding + i * (barW + 8)
        const y = chartH - h
        let fill = GOLD
        if (e.count >= maxCount * 0.85) fill = RED
        else if (e.count >= maxCount * 0.6) fill = AMBER
        return (
          <g key={e.num}>
            <rect x={x} y={y} width={barW} height={h} rx="3" fill={fill} opacity={0.85} />
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="9" fill="#a0a0a0">{e.count}次</text>
            <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="11" fill="#b0b0b0" fontWeight="600">
              {String(e.num).padStart(2, '0')}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
