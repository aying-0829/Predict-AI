'use client'

import { ChartBar, ChartLineUp } from 'phosphor-react'
import { MATCH_STATS, MATCH_INFO } from './data'

function StatBar({
  label,
  homeValue,
  awayValue,
  isPercent = false,
}: {
  label: string
  homeValue: number
  awayValue: number
  isPercent?: boolean
}) {
  const max = Math.max(homeValue, awayValue, 1)
  const homePct = (homeValue / max) * 100
  const awayPct = (awayValue / max) * 100

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-[var(--text-heading)] tabular-nums w-8 text-right">
          {homeValue}{isPercent ? '%' : ''}
        </span>
        <span className="text-xs text-[var(--text-label)] mx-3">{label}</span>
        <span className="text-sm font-semibold text-[var(--text-heading)] tabular-nums w-8 text-left">
          {awayValue}{isPercent ? '%' : ''}
        </span>
      </div>
      <div className="flex gap-1.5">
        {/* Home bar (right-aligned) */}
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-[rgba(255,255,255,0.04)]">
          <div
            className="h-full rounded-full ml-auto transition-all duration-700"
            style={{
              width: `${homePct}%`,
              background: `linear-gradient(90deg, transparent, var(--neon-cyan))`,
              boxShadow: '0 0 8px rgba(0,240,255,0.3)',
            }}
          />
        </div>
        {/* Away bar (left-aligned) */}
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-[rgba(255,255,255,0.04)]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${awayPct}%`,
              background: `linear-gradient(90deg, #f59e0b, transparent)`,
              direction: 'rtl',
              boxShadow: '0 0 8px rgba(245,158,11,0.3)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export interface StatsTabProps {
  /** Real match stats (from realDataAdapter). Falls back to data.ts MATCH_STATS. */
  matchStats?: Array<{ label: string; home: number; away: number; isPercent?: boolean }>
  /** Real match info. Falls back to data.ts MATCH_INFO. */
  matchInfo?: { homeTeam: string; homeFlag: string; awayTeam: string; awayFlag: string }
}

export default function StatsTab(props: StatsTabProps = {}) {
  const {
    matchStats = MATCH_STATS,
    matchInfo = MATCH_INFO,
  } = props

  return (
    <div className="laser-panel p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[var(--border-laser)]">
        <div className="flex items-center gap-2">
          <ChartBar size={18} className="text-[var(--neon-cyan)]" />
          <span className="text-sm font-bold text-[var(--text-heading)]">技术统计</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[var(--neon-cyan)] font-semibold">
            {matchInfo.homeFlag} {matchInfo.homeTeam}
          </span>
          <span className="text-[var(--text-dim)]">vs</span>
          <span className="text-[#f59e0b] font-semibold">
            {matchInfo.awayTeam} {matchInfo.awayFlag}
          </span>
        </div>
      </div>

      {/* Stats bars */}
      <div className="flex flex-col">
        {matchStats.map((stat) => (
          <StatBar
            key={stat.label}
            label={stat.label}
            homeValue={stat.home}
            awayValue={stat.away}
            isPercent={stat.isPercent}
          />
        ))}
      </div>
    </div>
  )
}
