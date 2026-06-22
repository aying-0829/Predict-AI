'use client'

import { useState, useEffect } from 'react'
import OddsComparison from '@/app/components/odds/OddsComparison'

interface OddsEntry {
  matchId: string
  homeTeam: string
  awayTeam: string
  league: string
  time: string
  marketOdds: {
    homeWin: number
    draw: number
    awayWin: number
    provider: string
  }
  platformPrediction: {
    homeProb: number
    drawProb: number
    awayProb: number
    confidence: number
  }
  valueIndicator: 'home' | 'draw' | 'away' | null
  valueDiff: number
}

export default function OddsPage() {
  const [entries, setEntries] = useState<OddsEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'value'>('all')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('/api/odds')
      .then(r => r.json())
      .then(json => {
        if (json.code === 0) setEntries(json.data || [])
        else setError(json.message || '加载失败')
      })
      .catch(() => setError('网络错误'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'value'
    ? entries.filter(e => e.valueIndicator)
    : entries

  const valueCount = entries.filter(e => e.valueIndicator).length

  return (
    <div className="px-8 md:px-16 py-10 pb-16">
      <div className="max-w-3xl mx-auto">
        {/* 页头 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-[var(--neon-cyan)]">赔率对比</h1>
            <p className="text-xs text-[#505870] mt-1">AI 预测 vs 市场赔率 · 价值投注识别</p>
          </div>
        </div>

        {/* 筛选切换 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-[var(--neon-cyan)] text-[#e8e8f0]'
                : 'bg-[#0c0c18] text-[#9098b0] border border-[rgba(0,229,255,0.1)] hover:border-[var(--neon-cyan)]/50'
            }`}
          >
            全部赛事 ({entries.length})
          </button>
          <button
            onClick={() => setFilter('value')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === 'value'
                ? 'bg-green-600 text-white'
                : 'bg-[#0c0c18] text-[#9098b0] border border-[rgba(0,229,255,0.1)] hover:border-green-700/50'
            }`}
          >
            价值投注 ({valueCount})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-lg animate-pulse">
                <div className="h-12 bg-[rgba(0,229,255,0.08)]/50" />
                <div className="h-32 bg-[rgba(0,229,255,0.03)]" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="text-[#505870]">{error}</p>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-[#505870]">
            <p className="text-lg mb-2">
              {filter === 'value' ? '暂无价值投注机会' : '暂无赔率数据'}
            </p>
            {filter === 'value' && (
              <p className="text-sm">当前没有平台预测与市场赔率差异 &gt;10% 的赛事</p>
            )}
          </div>
        )}

        {/* 对比列表 */}
        {!loading && !error && filtered.length > 0 && (
          <OddsComparison entries={filtered} />
        )}
      </div>
    </div>
  )
}
