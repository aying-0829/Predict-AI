'use client'

import { useEffect, useRef } from 'react'

type Selection = { matchId: string; pick: string; odds: number; label: string }

interface BetSlipDrawerProps {
  selections: Selection[]
  onRemove: (matchId: string, pick: string) => void
  onSubmit: () => void
  submitting?: boolean
  open: boolean
  onClose: () => void
}

export function BetSlipDrawer({ selections, onRemove, onSubmit, submitting, open, onClose }: BetSlipDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-96 max-w-[90vw] z-50 bg-[#0c0c18] shadow-2xl flex flex-col"
        style={{ animation: 'slideInLeft 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,229,255,0.1)]">
          <h2 className="text-sm font-semibold text-[var(--neon-cyan)] font-serif">
            投注单
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(0,229,255,0.08)] text-[#9098b0] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>

        {/* Selections List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {selections.length === 0 ? (
            <p className="text-sm text-[#9098b0] text-center py-12">暂无投注项，请从下方选择盘口</p>
          ) : (
            selections.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#0c0c18] rounded-lg px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{s.label}</p>
                  <p className="text-xs text-[var(--neon-cyan)] mt-0.5">赔率 @{s.odds}</p>
                </div>
                <button
                  onClick={() => onRemove(s.matchId, s.pick)}
                  className="ml-3 text-[#9098b0] hover:text-red-400 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="3" y1="3" x2="11" y2="11" />
                    <line x1="11" y1="3" x2="3" y2="11" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: Total + Submit */}
        {selections.length > 0 && (
          <div className="px-5 py-4 border-t border-[rgba(0,229,255,0.1)] space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#9098b0]">组合赔率</span>
              <span className="font-numeric text-3xl text-[var(--neon-cyan)]">
                {totalOdds.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#9098b0]">预估收益</span>
              <span className="text-xs text-[var(--neon-cyan)]">
                100 积分 × {totalOdds.toFixed(2)} = {(100 * totalOdds).toFixed(0)} 积分
              </span>
            </div>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider bg-[var(--neon-cyan)] text-[#e8e8f0] hover:shadow-lg hover:shadow-[var(--neon-cyan)]/30 disabled:opacity-50 transition-all"
            >
              {submitting ? '投注中...' : '模拟投注 · 100 积分'}
            </button>
            <p className="text-center text-[10px] text-[#9098b0]">
              仅供 AI 预测准确性验证，不涉及真实金钱
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
