'use client'

import { useState } from 'react'
import { TrendUp, CurrencyCircleDollar } from 'phosphor-react'
import { ODDS_DATA, MATCH_INFO } from './data'

type OddsCategory = 'asian' | 'euro' | 'overUnder'

const CATEGORY_LABELS: Record<OddsCategory, string> = {
  asian: '亚洲指数',
  euro: '欧赔指数',
  overUnder: '大小球',
}

export interface OddsTabProps {
  /** Real odds data (from realDataAdapter). Falls back to data.ts ODDS_DATA. */
  oddsData?: typeof ODDS_DATA
}

export default function OddsTab(props: OddsTabProps = {}) {
  const { oddsData = ODDS_DATA } = props
  const [category, setCategory] = useState<OddsCategory>('asian')

  return (
    <div className="laser-panel p-5">
      {/* Category tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg bg-[rgba(10,13,28,0.5)] border border-[var(--border-laser)]">
        {(Object.entries(CATEGORY_LABELS) as [OddsCategory, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
              category === key
                ? 'bg-[rgba(0,240,255,0.12)] text-[var(--neon-cyan)] shadow-[0_0_8px_rgba(0,240,255,0.08)]'
                : 'text-[var(--text-dim)] hover:text-[var(--text-body)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Odds table */}
      {category === 'asian' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[var(--text-label)] uppercase border-b border-[var(--border-laser)]">
                <th className="py-2 px-3 text-left font-medium">公司</th>
                <th className="py-2 px-3 text-center font-medium">主队</th>
                <th className="py-2 px-3 text-center font-medium">盘口</th>
                <th className="py-2 px-3 text-center font-medium">客队</th>
              </tr>
            </thead>
            <tbody>
              {oddsData.asian.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border-laser)]/20 hover:bg-[rgba(0,240,255,0.03)] transition-colors">
                  <td className="py-3 px-3 text-[var(--text-body)] text-xs">{row.company}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[var(--neon-cyan)] font-semibold tabular-nums">{row.home.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-[var(--text-heading)] font-semibold">{row.handicap}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[#f59e0b] font-semibold tabular-nums">{row.away.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {category === 'euro' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[var(--text-label)] uppercase border-b border-[var(--border-laser)]">
                <th className="py-2 px-3 text-left font-medium">公司</th>
                <th className="py-2 px-3 text-center font-medium">胜</th>
                <th className="py-2 px-3 text-center font-medium">平</th>
                <th className="py-2 px-3 text-center font-medium">负</th>
              </tr>
            </thead>
            <tbody>
              {oddsData.euro.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border-laser)]/20 hover:bg-[rgba(0,240,255,0.03)] transition-colors">
                  <td className="py-3 px-3 text-[var(--text-body)] text-xs">{row.company}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[var(--neon-cyan)] font-semibold tabular-nums">{row.home.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-[var(--text-dim)] tabular-nums">{row.draw.toFixed(2)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[#f59e0b] font-semibold tabular-nums">{row.away.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {category === 'overUnder' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[var(--text-label)] uppercase border-b border-[var(--border-laser)]">
                <th className="py-2 px-3 text-left font-medium">公司</th>
                <th className="py-2 px-3 text-center font-medium">大球</th>
                <th className="py-2 px-3 text-center font-medium">盘口</th>
                <th className="py-2 px-3 text-center font-medium">小球</th>
              </tr>
            </thead>
            <tbody>
              {oddsData.overUnder.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border-laser)]/20 hover:bg-[rgba(0,240,255,0.03)] transition-colors">
                  <td className="py-3 px-3 text-[var(--text-body)] text-xs">{row.company}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-emerald-400 font-semibold tabular-nums">{row.over.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-[var(--text-heading)] font-semibold">{row.total}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-blue-400 font-semibold tabular-nums">{row.under.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-5 text-[10px] text-[var(--text-dim)]/60 text-center">
        赔率数据仅供参考，以实际投注时为准
      </p>
    </div>
  )
}
