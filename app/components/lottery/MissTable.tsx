'use client'

import type { MissStat } from '@/lib/services'

function Badge({ label, variant }: { label: string; variant: 'hot' | 'warn' | 'alert' }) {
  const colors: Record<string, string> = {
    hot: 'bg-blue-600/10 text-blue-400',
    warn: 'bg-amber-500/10 text-amber-400',
    alert: 'bg-red-600/10 text-red-400',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors[variant]}`}>
      {label}
    </span>
  )
}

interface MissTableProps {
  missStats: MissStat[]
}

export function MissTable({ missStats }: MissTableProps) {
  const RED = '#dc2626'
  const BLUE = '#2563eb'

  return (
    <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-[#0c0c18] text-[#9098b0] text-[11px] uppercase tracking-wider font-semibold">
            <th className="py-3 px-4 text-left">号码</th>
            <th className="py-3 px-4 text-left">上次出现</th>
            <th className="py-3 px-4 text-left">遗漏期数</th>
            <th className="py-3 px-4 text-left">历史最大遗漏</th>
            <th className="py-3 px-4 text-left">平均遗漏</th>
            <th className="py-3 px-4 text-left">AI 提醒</th>
          </tr>
        </thead>
        <tbody>
          {missStats.map((s) => {
            const alertVariant = s.alert === 'alert' ? 'alert' as const : s.alert === 'warn' ? 'warn' as const : 'hot' as const
            const alertLabel = s.alert === 'alert' ? '高度关注' : s.alert === 'warn' ? '建议关注' : s.alert === 'hot' ? '热号' : '正常'
            const isRed = s.type === 'red'
            const isMaxMiss = s.missCount >= s.maxMiss
            return (
              <tr key={`${s.type}-${s.number}`} className="border-b border-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,229,255,0.08)]/50 transition-colors">
                <td className="py-3 px-4">
                  <span
                    className="inline-flex items-center justify-center rounded-full font-bold text-xs"
                    style={{
                      width: 32, height: 32,
                      background: isRed ? RED : BLUE,
                      color: 'white',
                    }}
                  >
                    {String(s.number).padStart(2, '0')}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#9098b0]">{s.lastAppearance}</td>
                <td className={`py-3 px-4 font-numeric font-semibold ${isMaxMiss ? 'text-[var(--neon-cyan)]' : 'text-[#e8e8f0]'}`}>{s.missCount}</td>
                <td className="py-3 px-4 font-numeric text-[#9098b0]">{s.maxMiss}</td>
                <td className="py-3 px-4 font-numeric text-[#9098b0]">{s.avgMiss}</td>
                <td className="py-3 px-4"><Badge label={alertLabel} variant={alertVariant} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
