'use client'

interface AccuracyBreakdown { hits: number; misses: number; partials: number; maxStreak: number }

function AccuracyStat({ label, value, color, glowColor }: { label: string; value: string | number; color: string; glowColor: string }) {
  return (
    <div className="glass-card p-3 text-center">
      <div className="text-xl font-bold" style={{ color, textShadow: `0 0 10px ${glowColor}` }}>{value}</div>
      <div className="text-xs text-[var(--text-label)] mt-0.5">{label}</div>
    </div>
  )
}

export function AccuracyOverview({ accuracy, breakdown }: { accuracy: number; breakdown: AccuracyBreakdown }) {
  return (
    <div className="glass-panel p-5">
      <h3 className="text-sm font-semibold text-[var(--text-heading)] pl-3 mb-4 flex items-center gap-2" /* keep dynamic */>准确率总览</h3>
      <div className="text-center mb-5">
        <div className="kpi-number text-[3.5rem]">{accuracy}%</div>
        <div className="text-xs text-[var(--text-label)] mt-1">综合预测准确率</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <AccuracyStat label="命中" value={breakdown.hits} color="#34d399" glowColor="rgba(52,211,153,0.3)" />
        <AccuracyStat label="未命中" value={breakdown.misses} color="#f87171" glowColor="rgba(248,113,113,0.3)" />
        <AccuracyStat label="部分命中" value={breakdown.partials} color="#60a5fa" glowColor="rgba(96,165,250,0.3)" />
        <AccuracyStat label="连胜" value={`${breakdown.maxStreak}期`} color="#fb923c" glowColor="rgba(251,146,60,0.3)" />
      </div>
    </div>
  )
}
