'use client'

import type { HotColdItem } from '@/lib/services'

function NumBall({ num, variant, size = 44 }: { num: number; variant: 'hot' | 'warm' | 'cold' | 'missing' | 'red' | 'blue' | 'ok'; size?: number }) {
  const styles: Record<string, string> = {
    hot: `bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30`,
    warm: `bg-gradient-to-br from-amber-500 to-amber-400 text-white`,
    cold: `bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30`,
    missing: `bg-gray-200 text-[#505870] border-2 border-dashed border-gray-400`,
    red: `bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-600/20`,
    blue: `bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20`,
    ok: `border-2 border-[rgba(0,229,255,0.1)] text-[#e8e8f0]`,
  }
  const className = styles[variant] || styles.ok
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold transition-transform hover:scale-110 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {String(num).padStart(2, '0')}
    </div>
  )
}

interface HotColdPanelProps {
  hot: HotColdItem[]
  cold: HotColdItem[]
  missed: HotColdItem[]
  historyLength: number
}

export function HotColdPanel({ hot, cold, missed, historyLength }: HotColdPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Left: Hot Numbers */}
      <div className="grid grid-cols-1 gap-5">
        <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[#e8e8f0]">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            热号 · 近{historyLength}期高频
          </h4>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {hot.map(h => (
              <NumBall key={`hot-${h.number}-${h.type}`} num={h.number} variant="hot" />
            ))}
          </div>
          <div className="border-t border-[rgba(0,229,255,0.1)] pt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9098b0]">平均间隔</span>
              <span className="font-semibold text-[#e8e8f0]">
                {Math.round(historyLength / Math.max(hot.length / 2, 1) / 2)} 期
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9098b0]">AI 持续概率</span>
              <span className="font-semibold text-red-400">
                {Math.max(...hot.map(h => h.probability || 0))}%
              </span>
            </div>
          </div>
        </div>

        {/* Big Miss */}
        <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] p-5">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[#e8e8f0]">
            <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />
            大遗漏 · 接近历史峰值
          </h4>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {missed.map(m => (
              <NumBall key={`miss-${m.number}-${m.type}`} num={m.number} variant="missing" />
            ))}
          </div>
          <div className="border-t border-[rgba(0,229,255,0.1)] pt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9098b0]">最大遗漏</span>
              <span className="font-semibold text-[var(--neon-cyan)]">
                {Math.max(...missed.map(m => m.maxMiss || 0))} 期
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#9098b0]">AI 近期需关注</span>
              <span className="font-semibold text-blue-400">
                {missed.filter(m => m.alert === 'high').map(m => String(m.number).padStart(2, '0')).join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Cold Numbers */}
      <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] p-5">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[#e8e8f0]">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
          冷号 · 近期低频
        </h4>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {cold.map(c => (
            <NumBall key={`cold-${c.number}-${c.type}`} num={c.number} variant="cold" />
          ))}
        </div>
        <div className="border-t border-[rgba(0,229,255,0.1)] pt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#9098b0]">平均遗漏</span>
            <span className="font-semibold text-[#e8e8f0]">
              {Math.round(cold.reduce((s, c) => s + (c.lastAppearance || 0), 0) / cold.length)} 期
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#9098b0]">AI 回补概率</span>
            <span className="font-semibold text-blue-400">
              {Math.round(cold.reduce((s, c) => s + (c.probability || 0), 0) / cold.length)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
