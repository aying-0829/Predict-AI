'use client'

import { useState, useEffect } from 'react'
import AccuracyChart from '@/app/components/stats/AccuracyChart'
import TrendCalendar from '@/app/components/stats/TrendCalendar'
import PredictionBreakdown from '@/app/components/stats/PredictionBreakdown'
import StreakTracker from '@/app/components/stats/StreakTracker'
import LeaguePerformance from '@/app/components/stats/LeaguePerformance'

type RangeKey = '7d' | '30d' | 'season' | 'all'

export default function StatsPage() {
  useEffect(() => {
    document.title = 'Predict AI | 数据统计'
  }, [])
  const [range, setRange] = useState<RangeKey>('30d')
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [showExportMenu, setShowExportMenu] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const now = new Date()
      let startDate = ''
      if (range === '7d') {
        const d = new Date(now)
        d.setDate(d.getDate() - 7)
        startDate = d.toISOString().slice(0, 10)
      } else if (range === '30d') {
        const d = new Date(now)
        d.setDate(d.getDate() - 30)
        startDate = d.toISOString().slice(0, 10)
      } else if (range === 'season') {
        const d = new Date(now)
        d.setDate(d.getDate() - 60)
        startDate = d.toISOString().slice(0, 10)
      }

      const params = new URLSearchParams({ format: exportFormat })
      if (startDate) params.set('start', startDate)
      params.set('end', now.toISOString().slice(0, 10))

      const res = await fetch(`/api/export?${params}`)
      if (exportFormat === 'csv') {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `predict-history-${now.toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const json = await res.json()
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `predict-history-${now.toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // 静默失败
    } finally {
      setExporting(false)
      setShowExportMenu(false)
    }
  }

  const rangeOptions: { key: RangeKey; label: string }[] = [
    { key: '7d', label: '最近7天' },
    { key: '30d', label: '最近30天' },
    { key: 'season', label: '本赛季' },
    { key: 'all', label: '全部' },
  ]

  return (
    <div className="px-6 md:px-10 py-10 pb-16 relative z-[1]">
      <div className="max-w-6xl mx-auto">
        {/* 页头 — 霓虹仪表盘标题 */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="page-title">数据统计</h1>
          <div className="flex items-center gap-3">
            {/* 时间范围选择 — Tab Bar */}
            <div className="tab-bar">
              {rangeOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setRange(opt.key)}
                  className={`tab-item ${range === opt.key ? 'active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* 导出 */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting}
                className="btn-laser text-xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {exporting ? '导出中...' : '导出数据'}
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 laser-panel py-1 min-w-[140px] z-20 shadow-xl">
                  <button
                    onClick={() => {
                      setExportFormat('csv')
                      handleExport()
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[var(--text-body)] hover:bg-[rgba(0,240,255,0.06)] transition-colors"
                  >
                    导出 CSV
                  </button>
                  <button
                    onClick={() => {
                      setExportFormat('json')
                      handleExport()
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[var(--text-body)] hover:bg-[rgba(0,240,255,0.06)] transition-colors"
                  >
                    导出 JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 第一行：折线图 + 饼图 — 激光雷达组合 */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-5">
          <AccuracyChart range={range} />
          <PredictionBreakdown />
        </div>

        {/* 第二行：热力图 + 连胜追踪 — 热成像风格 */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-5">
          <TrendCalendar />
          <StreakTracker />
        </div>

        {/* 第三行：雷达图 — 激光雷达面板 */}
        <div className="max-w-lg">
          <LeaguePerformance />
        </div>
      </div>
    </div>
  )
}
