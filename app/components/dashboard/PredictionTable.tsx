'use client'

interface PredictionRecord {
  id: number; date: string; type: string; prediction: string
  actual: string | null; result: string; hitDetail: string; points: number
}

const filterButtons = [
  { label: '全部', type: '' }, { label: '双色球', type: 'ssq' }, { label: '大乐透', type: 'dlt' },
  { label: '世界杯', type: 'worldcup' }, { label: '已命中', type: 'hit' },
]
const typeLabels: Record<string, string> = { ssq: '双色球', dlt: '大乐透', worldcup: '世界杯' }
const resultBadge: Record<string, { label: string; cls: string }> = {
  pending: { label: '待定', cls: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/20' },
  hit: { label: '命中', cls: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/20' },
  miss: { label: '未命中', cls: 'bg-red-600/20 text-red-400 border-red-600/20' },
  partial: { label: '部分', cls: 'bg-blue-600/20 text-blue-400 border-blue-600/20' },
}

export function PredictionTable({ history, filterType, onFilter }: { history: PredictionRecord[]; filterType: string; onFilter: (t: string) => void }) {
  const safeHistory = Array.isArray(history) ? history : []
  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between" /* keep dynamic */>
        <h2 className="text-base font-semibold text-[var(--text-heading)]">预测记录</h2>
        <div className="flex gap-1.5">
          {filterButtons.map(btn => (
            <button key={btn.type} onClick={() => onFilter(btn.type)}
              className={`px-3 py-1 rounded-md text-xs transition-all ${filterType === btn.type ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30' : 'bg-transparent text-[var(--text-dim)] hover:text-[var(--text-body)] hover:bg-[rgba(0,229,255,0.06)]'}`}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--neon-cyan)] text-xs uppercase tracking-wide" /* keep dynamic */>
              <th className="px-4 py-3 text-left font-medium">日期</th><th className="px-4 py-3 text-left font-medium">类型</th>
              <th className="px-4 py-3 text-left font-medium">预测内容</th><th className="px-4 py-3 text-left font-medium">开奖结果</th>
              <th className="px-4 py-3 text-center font-medium">命中</th><th className="px-4 py-3 text-right font-medium">积分</th>
            </tr>
          </thead>
          <tbody>
            {safeHistory.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--text-dim)]">暂无预测记录</td></tr>
            ) : safeHistory.map(r => (
              <tr key={r.id} className="data-row" /* keep dynamic */>
                <td className="px-4 py-3 text-[var(--text-label)] whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-3 text-[var(--text-heading)]">{typeLabels[r.type] || r.type}</td>
                <td className="px-4 py-3 text-[var(--text-body)] font-mono text-xs">{r.prediction}</td>
                <td className="px-4 py-3 text-[var(--text-label)] text-xs">{r.actual || '—'}</td>
                <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${resultBadge[r.result]?.cls || ''}`}>{resultBadge[r.result]?.label || r.result}</span></td>
                <td className="px-4 py-3 text-right text-[var(--neon-cyan)] font-semibold">{r.points > 0 ? `+${r.points}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
