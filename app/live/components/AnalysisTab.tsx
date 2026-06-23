'use client'

import { useState } from 'react'
import { Funnel } from 'phosphor-react'
import {
  ARGENTINA_RECENT,
  ARGENTINA_STATS,
  AUSTRIA_RECENT,
  AUSTRIA_STATS,
  MATCH_INFO,
} from './data'

type FilterMode = 'all' | 'same'

interface RecentRow {
  date: string
  event: string
  match: string
  handicap: string
  total: string
}

interface TeamStatsLike {
  winRate: number
  handicapRate: number
  overRate: number
  /** optional: generated from real data, e.g. "4胜0平0负" */
  record?: string
}

function RecentTable({ data }: { data: RecentRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[var(--text-label)] text-xs uppercase tracking-wider border-b border-[var(--border-laser)]">
            <th className="py-2 px-3 text-left font-medium">时间</th>
            <th className="py-2 px-3 text-left font-medium">赛事</th>
            <th className="py-2 px-3 text-left font-medium">对阵比分</th>
            <th className="py-2 px-3 text-left font-medium">让球</th>
            <th className="py-2 px-3 text-left font-medium">进球数</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--border-laser)]/30 data-row hover:bg-[rgba(0,240,255,0.03)] transition-colors"
            >
              <td className="py-2.5 px-3 text-[var(--text-body)] font-mono text-xs">{row.date}</td>
              <td className="py-2.5 px-3 text-[var(--text-body)]">{row.event}</td>
              <td className="py-2.5 px-3 text-[var(--text-heading)]">{row.match}</td>
              <td className="py-2.5 px-3">
                <span
                  className={
                    row.handicap.includes('赢')
                      ? 'text-emerald-400'
                      : row.handicap.includes('输')
                      ? 'text-red-400'
                      : 'text-[var(--text-dim)]'
                  }
                >
                  {row.handicap}
                </span>
              </td>
              <td className="py-2.5 px-3">
                <span
                  className={
                    row.total.includes('大球')
                      ? 'text-emerald-400'
                      : row.total.includes('小球')
                      ? 'text-blue-400'
                      : 'text-[var(--text-dim)]'
                  }
                >
                  {row.total}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamAnalysis({
  teamName,
  flag,
  recentData,
  stats,
  defaultFilter,
}: {
  teamName: string
  flag: string
  recentData: RecentRow[]
  stats: TeamStatsLike
  defaultFilter: FilterMode
}) {
  const [filter, setFilter] = useState<FilterMode>(defaultFilter)
  const filtered = filter === 'all' ? recentData : recentData

  const recordText = stats.record ?? buildDefaultRecord(recentData)

  return (
    <div className="laser-panel p-5">
      {/* Team header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{flag}</span>
        <h3 className="text-lg font-bold text-[var(--text-heading)]">{teamName}</h3>
        <span className="text-xs text-[var(--text-label)]">近期战绩（近{recentData.length}场）</span>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[rgba(0,240,255,0.04)] border border-[var(--border-laser)] rounded-lg p-3 text-center">
          <div className="text-xs text-[var(--text-label)] mb-1">胜率</div>
          <div className="text-xl font-bold text-emerald-400">{stats.winRate}%</div>
          <div className="text-[10px] text-[var(--text-dim)] mt-0.5">{recordText}</div>
        </div>
        <div className="bg-[rgba(0,240,255,0.04)] border border-[var(--border-laser)] rounded-lg p-3 text-center">
          <div className="text-xs text-[var(--text-label)] mb-1">赢盘率</div>
          <div className="text-xl font-bold text-[var(--neon-cyan)]">{stats.handicapRate}%</div>
          <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
            {recentData.filter((r) => r.handicap.includes('赢')).length}赢
            {recentData.filter((r) => r.handicap.includes('输')).length}输
            {recentData.filter((r) => !r.handicap.includes('赢') && !r.handicap.includes('输')).length}走
          </div>
        </div>
        <div className="bg-[rgba(0,240,255,0.04)] border border-[var(--border-laser)] rounded-lg p-3 text-center">
          <div className="text-xs text-[var(--text-label)] mb-1">大球率</div>
          <div className="text-xl font-bold text-[var(--neon-amber)]">{stats.overRate}%</div>
          <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
            {recentData.filter((r) => r.total.includes('大球')).length}大
            {recentData.filter((r) => r.total.includes('走')).length}平
            {recentData.filter((r) => r.total.includes('小球')).length}小
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'all'
              ? 'bg-[rgba(0,240,255,0.12)] text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30'
              : 'bg-transparent text-[var(--text-dim)] border border-[var(--border-laser)] hover:text-[var(--text-body)]'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('same')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'same'
              ? 'bg-[rgba(0,240,255,0.12)] text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30'
              : 'bg-transparent text-[var(--text-dim)] border border-[var(--border-laser)] hover:text-[var(--text-body)]'
          }`}
        >
          同主客
        </button>
      </div>

      <RecentTable data={filtered} />
    </div>
  )
}

function buildDefaultRecord(rows: RecentRow[]): string {
  let wins = 0, draws = 0, losses = 0
  for (const r of rows) {
    const parts = r.match.split(' ')
    // find score pattern like "3-0"
    const scoreIdx = parts.findIndex((p) => /^\d+-\d+$/.test(p))
    if (scoreIdx > 0) {
      const [gf, ga] = parts[scoreIdx].split('-').map(Number)
      if (gf > ga) wins++
      else if (gf === ga) draws++
      else losses++
    }
  }
  return `${wins}胜${draws}平${losses}负`
}

export interface AnalysisTabProps {
  /** Real home-team recent form (from realDataAdapter). Falls back to data.ts mock. */
  homeRecent?: RecentRow[]
  /** Real home-team stats (from realDataAdapter) */
  homeStats?: TeamStatsLike
  /** Real away-team recent form */
  awayRecent?: RecentRow[]
  /** Real away-team stats */
  awayStats?: TeamStatsLike
  /** Real match info (for team names / flags). Falls back to data.ts MATCH_INFO. */
  matchInfo?: { homeTeam: string; homeFlag: string; awayTeam: string; awayFlag: string }
}

export default function AnalysisTab(props: AnalysisTabProps = {}) {
  const {
    homeRecent = ARGENTINA_RECENT,
    homeStats = ARGENTINA_STATS,
    awayRecent = AUSTRIA_RECENT,
    awayStats = AUSTRIA_STATS,
    matchInfo = MATCH_INFO,
  } = props

  return (
    <div className="flex flex-col gap-6">
      <TeamAnalysis
        teamName={matchInfo.homeTeam}
        flag={matchInfo.homeFlag}
        recentData={homeRecent}
        stats={homeStats}
        defaultFilter="all"
      />
      <TeamAnalysis
        teamName={matchInfo.awayTeam}
        flag={matchInfo.awayFlag}
        recentData={awayRecent}
        stats={awayStats}
        defaultFilter="all"
      />
    </div>
  )
}
