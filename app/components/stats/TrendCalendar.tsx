'use client'

interface DayCell {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateHeatmapData(): DayCell[][] {
  const weeks: DayCell[][] = []
  const now = new Date('2026-06-17')
  const rng = mulberry32(123) // fixed seed
  for (let w = 0; w < 26; w++) {
    const week: DayCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(now)
      date.setDate(date.getDate() - ((26 - w - 1) * 7 + (6 - d)))
      const rand = rng()
      const count = rand < 0.3 ? 0 : Math.floor(rand * 5) + 1
      const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 2 ? 2 : count <= 3 ? 3 : 4 as 0 | 1 | 2 | 3 | 4
      week.push({ date: `${date.getMonth() + 1}/${date.getDate()}`, count, level })
    }
    weeks.push(week)
  }
  return weeks
}

const levelColors: Record<number, string> = {
  0: 'bg-[rgba(0,229,255,0.08)]',
  1: 'bg-[rgba(0,229,255,0.20)]',
  2: 'bg-[rgba(0,229,255,0.20)]',
  3: 'bg-[rgba(0,229,255,0.20)]',
  4: 'bg-[var(--neon-cyan)]',
}

export default function TrendCalendar() {
  const weeks = generateHeatmapData()
  const dayLabels = ['', '一', '', '三', '', '五', '']

  // 计算月份标签位置
  const monthLabels: { label: string; col: number }[] = []
  const now = new Date('2026-06-17')
  for (let w = 0; w < weeks.length; w++) {
    const d = new Date(now)
    d.setDate(d.getDate() - ((26 - w - 1) * 7))
    const month = d.getMonth() + 1
    const prevCol = monthLabels.length > 0 ? monthLabels[monthLabels.length - 1] : null
    if (!prevCol || prevCol.label !== `${month}月`) {
      monthLabels.push({ label: `${month}月`, col: w })
    }
  }

  return (
    <div className="animate-in animate-in-delay-1 bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">预测活跃度热力图</h3>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-0.5">
          {/* 月份标签 */}
          <div className="flex flex-col gap-0.5 mr-1">
            <div className="h-3" />
            {monthLabels.map((m, i) => (
              <div key={i} className="text-[10px] text-[#505870] h-3" style={{ gridColumn: m.col + 2 }}>
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm ${levelColors[day.level]} transition-colors`}
                    title={`${day.date}: ${day.count} 次预测`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-[#9098b0]">
        <span>少</span>
        <div className="w-3 h-3 rounded-sm bg-[rgba(0,229,255,0.08)]" />
        <div className="w-3 h-3 rounded-sm bg-[rgba(0,229,255,0.20)]" />
        <div className="w-3 h-3 rounded-sm bg-[rgba(0,229,255,0.20)]" />
        <div className="w-3 h-3 rounded-sm bg-[rgba(0,229,255,0.20)]" />
        <div className="w-3 h-3 rounded-sm bg-[var(--neon-cyan)]" />
        <span>多</span>
      </div>
    </div>
  )
}
