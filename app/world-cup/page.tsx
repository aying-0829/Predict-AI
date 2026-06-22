'use client'

import { Suspense, useEffect, useState, type ComponentType } from 'react'
import { useSearchParams } from 'next/navigation'
import { getWorldCupMatches, getLiveMatch } from '@/lib/services'
import type { Match } from '@/lib/data'

/* ===== Async Radar Background ===== */
let Radar: ComponentType | null = null
try {
  const mod = require('@/app/components/Radar')
  Radar = mod.default || mod.Radar
} catch {
  // Radar 不可用时降级为纯色背景
}

function MatchesContent() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get('match')
  const initialMatch = getLiveMatch(matchId ?? '') ?? null

  const [matches] = useState<Match[]>(() => getWorldCupMatches())
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(initialMatch)
  const [activeRound, setActiveRound] = useState<'group' | 'knockout'>(
    initialMatch ? (initialMatch.group.includes('组') ? 'group' : 'knockout') : 'group'
  )

  const groupMatches = matches.filter((m) => m.group.includes('组'))
  const knockoutMatches = matches.filter((m) => !m.group.includes('组'))
  const displayMatches = activeRound === 'group' ? groupMatches : knockoutMatches

  return (
    <div className="max-w-[1240px] mx-auto px-6 py-8 relative z-[1]">
      {/* 电路网格底纹 */}
      <div className="absolute inset-0 circuit-grid pointer-events-none" />

      {/* Header */}
      <div className="relative z-[1] flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">世界杯 2026</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">AI 实时预测 &middot; 深度分析</p>
        </div>
        <div className="flex bg-[rgba(10,13,28,0.5)] border border-[var(--border-laser)] rounded-lg p-1">
          {(['group', 'knockout'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setActiveRound(r)
                setSelectedMatch(null)
              }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                activeRound === r
                  ? 'bg-[rgba(0,240,255,0.12)] text-[var(--neon-cyan)] shadow-[0_0_12px_rgba(0,240,255,0.12)]'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-body)]'
              }`}
            >
              {r === 'group' ? '小组赛' : '淘汰赛'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-[1] flex gap-6 flex-col lg:flex-row">
        {/* 赛事列表 */}
        <div className="lg:w-[400px] flex-shrink-0 space-y-3">
          {displayMatches.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMatch(m)}
              className={`w-full text-left laser-panel p-4 transition-all ${
                selectedMatch?.id === m.id
                  ? 'border-[var(--neon-cyan)] shadow-[0_0_20px_rgba(0,240,255,0.08)]'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFlagEmoji(m.homeFlag)}</span>
                  <span className="text-sm font-medium text-[var(--text-heading)]">{m.home}</span>
                </div>
                <span className="text-xs text-[var(--text-dim)] font-mono">VS</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--text-heading)]">{m.away}</span>
                  <span className="text-2xl">{getFlagEmoji(m.awayFlag)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-[var(--text-label)] uppercase">
                  {m.time}
                </span>
                <span className="text-[10px] text-[var(--neon-cyan)]/60">
                  AI 预测: {m.aiScore ?? '待定'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 详情面板 — 霓虹仪表盘 */}
        <div className="flex-1">
          {selectedMatch ? (
            <div className="laser-panel p-8 scanline-overlay">
              {/* 对战双方 */}
              <div className="flex items-center justify-center gap-12 mb-8">
                <div className="text-center">
                  <div
                    className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-6xl border-2 border-[var(--neon-cyan)]/15"
                    style={{ background: 'rgba(10,13,28,0.7)' }}
                  >
                    {getFlagEmoji(selectedMatch.homeFlag)}
                  </div>
                  <div className="text-2xl font-bold text-[var(--text-heading)]">
                    {selectedMatch.home}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[var(--text-dim)] text-lg font-bold mb-1">VS</div>
                  <div className="kpi-number">{selectedMatch.aiScore}</div>
                  <div className="text-[10px] text-[var(--text-label)] mt-1">AI 预测比分</div>
                </div>
                <div className="text-center">
                  <div
                    className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-6xl border-2 border-[var(--neon-cyan)]/15"
                    style={{ background: 'rgba(10,13,28,0.7)' }}
                  >
                    {getFlagEmoji(selectedMatch.awayFlag)}
                  </div>
                  <div className="text-2xl font-bold text-[var(--text-heading)]">
                    {selectedMatch.away}
                  </div>
                </div>
              </div>

              {/* 赔率 / 概率条 — 霓虹仪表盘 */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--text-label)]">{selectedMatch.home} 胜</span>
                    <span className="text-[var(--neon-cyan)] font-mono">{selectedMatch.homeWin}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-[rgba(0,240,255,0.06)] border border-[var(--border-laser)]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${selectedMatch.homeWin}%`,
                        background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))',
                        boxShadow: '0 0 12px rgba(0,240,255,0.3)',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--text-label)]">平局</span>
                    <span className="text-[var(--text-dim)] font-mono">{selectedMatch.draw}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-[rgba(0,240,255,0.04)] border border-[var(--border-laser)]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${selectedMatch.draw}%`,
                        background: 'var(--text-dim)',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--text-label)]">{selectedMatch.away} 胜</span>
                    <span className="text-[var(--neon-magenta)] font-mono">{selectedMatch.awayWin}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-[rgba(255,0,170,0.04)] border border-[var(--border-laser)]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${selectedMatch.awayWin}%`,
                        background: 'linear-gradient(90deg, var(--neon-magenta), var(--neon-amber))',
                        boxShadow: '0 0 12px rgba(255,0,170,0.25)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* AI 推荐 */}
              <div className="mt-8 p-5 rounded-xl bg-[rgba(0,240,255,0.03)] border border-[var(--border-laser)]">
                <div className="text-xs text-[var(--neon-cyan)] uppercase tracking-widest mb-2 font-mono">
                  AI 推荐
                </div>
                <p className="text-sm text-[var(--text-body)]">
                  AI 模型预测比分 {selectedMatch.aiScore ?? '—'}，建议关注 {selectedMatch.home} 进攻端表现。
                </p>
              </div>

              {/* 热成像对比 */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { label: '进攻火力', home: 82, away: 65, unit: 'pts' },
                  { label: '防守强度', home: 71, away: 78, unit: 'pts' },
                  { label: '历史交锋', home: 60, away: 40, unit: '%' },
                ].map((item, i) => (
                  <div key={i} className="laser-panel p-4 text-center">
                    <div className="text-[10px] text-[var(--text-label)] uppercase mb-3 font-mono">
                      {item.label}
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white border-2"
                          style={{
                            background: `rgba(0,240,255,${item.home / 100 * 0.4})`,
                            borderColor: 'var(--neon-cyan)',
                          }}
                        >
                          {item.home}
                        </div>
                        <div className="text-[10px] text-[var(--text-dim)] mt-1 font-mono">
                          {selectedMatch.home.substring(0, 2)}
                        </div>
                      </div>
                      <div className="text-[10px] text-[var(--text-dim)] font-mono">
                        {item.unit}
                      </div>
                      <div>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white border-2"
                          style={{
                            background: `rgba(255,0,170,${item.away / 100 * 0.4})`,
                            borderColor: 'var(--neon-magenta)',
                          }}
                        >
                          {item.away}
                        </div>
                        <div className="text-[10px] text-[var(--text-dim)] mt-1 font-mono">
                          {selectedMatch.away.substring(0, 2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="laser-panel p-16 text-center">
              <div className="text-[var(--text-dim)] text-sm">
                选择一场比赛以查看 AI 深度分析
              </div>
              <div className="mt-3 text-[10px] text-[var(--text-label)] uppercase tracking-widest font-mono">
                雷达扫描引擎就绪
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getFlagEmoji(code: string) {
  const map: Record<string, string> = {
    QA: '🇶🇦', CH: '🇨🇭', BR: '🇧🇷', MA: '🇲🇦', HT: '🇭🇹',
    'GB-SCT': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', AU: '🇦🇺', TR: '🇹🇷', DE: '🇩🇪',
    CW: '🇨🇼', NL: '🇳🇱', JP: '🇯🇵', CI: '🇨🇮', EC: '🇪🇨', SE: '🇸🇪', TN: '🇹🇳',
  }
  return map[code] || '🏳️'
}

export default function WorldCupPage() {
  useEffect(() => { document.title = 'Predict AI | 世界杯预测' }, [])

  return (
    <div className="min-h-screen relative">
      {Radar && (
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none" aria-hidden="true">
          <Radar />
        </div>
      )}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh] text-[var(--text-dim)]">
            加载中...
          </div>
        }
      >
        <MatchesContent />
      </Suspense>
    </div>
  )
}
