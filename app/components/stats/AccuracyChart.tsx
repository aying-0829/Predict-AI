'use client'

import { useState, useEffect } from 'react'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'

type RangeKey = '7d' | '30d' | 'season' | 'all'

interface AccuracyChartProps {
  range: RangeKey
}

interface DataPoint {
  date: string
  accuracy: number
  predictions: number
}

// Seed-based pseudo-random number generator (mulberry32)
function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Deterministic prediction counts per day (seeded, looks natural)
const seedPredictionCounts = [5, 3, 7, 2, 4, 6, 1, 8, 3, 5, 4, 7, 2, 6, 3, 5, 4, 8, 2, 7, 3, 6, 1, 5, 4, 7, 3, 8, 2, 6,
  4, 5, 3, 7, 1, 6, 4, 8, 2, 5, 3, 7, 4, 6, 2, 8, 3, 5, 4, 7, 1, 6, 3, 5, 2, 8, 4, 7, 3, 6,
  2, 5, 4, 8, 1, 7, 3, 6, 4, 5, 2, 7, 3, 8, 4, 6, 2, 5, 3, 7, 4, 6, 1, 8, 3, 5, 4, 7, 2, 6]

function generateData(range: RangeKey): DataPoint[] {
  const count = range === '7d' ? 7 : range === '30d' ? 30 : range === 'season' ? 60 : 90
  const data: DataPoint[] = []
  const now = new Date('2026-06-17')
  const rng = mulberry32(42) // fixed seed for reproducible "random" data
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const base = 68
    const wave = Math.sin(i * 0.3) * 8 + Math.cos(i * 0.7) * 4
    const noise = (rng() - 0.5) * 4
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      accuracy: Math.round((base + wave + noise) * 10) / 10,
      predictions: seedPredictionCounts[i % seedPredictionCounts.length],
    })
  }
  return data
}

export default function AccuracyChart({ range }: AccuracyChartProps) {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    setData(generateData(range))
  }, [range])

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-[#505870] text-sm">加载中...</div>
  }

  return (
    <div className="animate-in bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">预测准确率趋势</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--neon-cyan)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8a7a50' }} axisLine={false} tickLine={false} />
          <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#8a7a50' }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#201c18', border: '1px solid #8a7a50', borderRadius: 8, fontSize: 12,
            }}
            labelStyle={{ color: 'var(--neon-cyan)' }}
            formatter={(val: any) => [`${val}%`, '准确率']}
          />
          <Area type="monotone" dataKey="accuracy" stroke="var(--neon-cyan)" strokeWidth={2} fill="url(#accuracyGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
