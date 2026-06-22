'use client'

type Selection = { matchId: string; pick: string; odds: number; label: string }

interface BetSlipBarProps {
  selections: Selection[]
  onRemove: (matchId: string, pick: string) => void
  onSubmit: () => void
  submitting?: boolean
}

export function BetSlipBar({ selections, onRemove, onSubmit, submitting }: BetSlipBarProps) {
  if (selections.length === 0) return null

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c18] border-t border-[rgba(0,229,255,0.1)]/60 shadow-2xl">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
        {/* selections */}
        <div className="flex-1 flex flex-wrap gap-2">
          {selections.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 bg-[var(--neon-cyan)]/15 border border-[var(--neon-cyan)]/30 rounded-full px-3 py-1 text-xs text-white">
              <span className="text-[#9098b0]">{s.label}</span>
              <span className="text-[var(--neon-cyan)]">@{s.odds}</span>
              <button
                onClick={() => onRemove(s.matchId, s.pick)}
                className="text-[#9098b0] hover:text-red-400 ml-1"
              >
                脳
              </button>
            </span>
          ))}
        </div>
        {/* total + submit */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="text-right">
            <div className="text-xs text-[#9098b0]">缁勫悎璧旂巼</div>
            <div className="text-lg font-bold text-[var(--neon-cyan)]">{totalOdds.toFixed(2)}</div>
          </div>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="btn-premium px-5 sm:px-6 py-2.5 text-xs sm:text-sm disabled:opacity-50"
          >
            {submitting ? '鎶曟敞涓?..' : '妯℃嫙鎶曟敞 路 100 绉垎'}
          </button>
        </div>
      </div>
      <div className="text-center text-[10px] text-[#9098b0] pb-2">
        浠呬緵 AI 棰勬祴鍑嗙‘鎬ч獙璇侊紝涓嶆秹鍙婄湡瀹為噾閽?      </div>
    </div>
  )
}
