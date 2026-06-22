'use client'

import { useState, useEffect } from 'react'

interface SportMatch {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  time: string
  status: string
  homeScore?: number
  awayScore?: number
}

interface CalendarData {
  year: number
  month: number
  daysInMonth: number
  firstDayOfWeek: number
  matches: Record<string, SportMatch[]>
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setSelectedDay(null)
    fetch(`/api/calendar?year=${year}&month=${month}`)
      .then(r => r.json())
      .then(json => setData(json.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [year, month])

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  if (loading || !data) {
    return (
      <div className="px-8 md:px-16 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#0c0c18]/60 rounded w-48" />
          <div className="h-96 bg-[#0c0c18]/40 rounded-lg" />
        </div>
      </div>
    )
  }

  // 构建日历网格
  const cells: { day: number; dateKey: string; matches: SportMatch[]; isPadding: boolean }[] = []
  for (let i = 0; i < data.firstDayOfWeek; i++) {
    cells.push({ day: 0, dateKey: '', matches: [], isPadding: true })
  }
  for (let d = 1; d <= data.daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, dateKey, matches: data.matches[dateKey] || [], isPadding: false })
  }

  const selectedMatches = selectedDay ? data.matches[selectedDay] || [] : []

  return (
    <div className="px-8 md:px-16 py-10 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* 月份切换 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-serif text-[var(--neon-cyan)]">赛事日历</h1>
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 rounded hover:bg-[#0c0c18] text-[#9098b0] hover:text-[var(--neon-cyan)] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-serif text-xl text-[#e8e8f0] min-w-[120px] text-center">
              {year}年{month}月
            </span>
            <button onClick={nextMonth} className="p-2 rounded hover:bg-[#0c0c18] text-[#9098b0] hover:text-[var(--neon-cyan)] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 月历网格 */}
        <div className="bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-lg overflow-hidden">
          {/* 周标题 */}
          <div className="grid grid-cols-7 border-b border-[rgba(0,229,255,0.1)]">
            {WEEKDAYS.map(w => (
              <div key={w} className="py-2.5 text-center text-xs font-medium text-[#9098b0] uppercase tracking-wider">
                {w}
              </div>
            ))}
          </div>

          {/* 日期格 */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => cell.day > 0 && setSelectedDay(cell.dateKey)}
                disabled={cell.isPadding}
                className={`min-h-[80px] p-1.5 border-b border-r border-[rgba(0,229,255,0.1)] text-left transition-colors ${
                  cell.isPadding ? 'bg-[#0c0c18]/50 cursor-default' :
                  selectedDay === cell.dateKey ? 'bg-[var(--neon-cyan)]/10 ring-1 ring-[var(--neon-cyan)]' :
                  'hover:bg-[rgba(0,229,255,0.08)]/50'
                }`}
              >
                {cell.day > 0 && (
                  <>
                    <span className={`inline-block text-xs font-numeric w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                      cell.matches.length > 0 ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]' : 'text-[#9098b0]'
                    }`}>
                      {cell.day}
                    </span>
                    {cell.matches.slice(0, 2).map(m => (
                      <div key={m.id} className="text-[9px] text-[#9098b0] truncate leading-tight px-0.5">
                        {m.homeTeam} vs {m.awayTeam}
                      </div>
                    ))}
                    {cell.matches.length > 2 && (
                      <div className="text-[9px] text-[var(--neon-cyan)] mt-0.5 pl-0.5">
                        +{cell.matches.length - 2} 场
                      </div>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 选中日赛事弹出 */}
        {selectedDay && (
          <div className="mt-6 bg-[#0c0c18] border border-[rgba(0,229,255,0.15)]/30 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e8e8f0]">
                {selectedDay} 赛事 ({selectedMatches.length} 场)
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-xs text-[#9098b0] hover:text-[#e8e8f0]"
              >
                关闭
              </button>
            </div>
            {selectedMatches.length === 0 ? (
              <p className="text-sm text-[#9098b0] py-4">当日暂无赛事</p>
            ) : (
              <div className="space-y-2">
                {selectedMatches.map(m => (
                  <a
                    key={m.id}
                    href={`/betting?id=${m.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,229,255,0.08)]/50 hover:bg-[rgba(0,229,255,0.08)] transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#9098b0] bg-[rgba(0,229,255,0.08)] px-2 py-0.5 rounded">{m.league}</span>
                        <span className="text-xs text-[#9098b0]">{m.time}</span>
                      </div>
                      <div className="text-sm text-[#e8e8f0] mt-1 font-medium">
                        {m.homeTeam} vs {m.awayTeam}
                      </div>
                    </div>
                    <span className="text-[var(--neon-cyan)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      查看详情 →
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
