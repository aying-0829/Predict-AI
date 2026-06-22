'use client'

import { useState, useEffect } from 'react'
import { MatchCard } from '@/app/components/betting/MatchCard'
import type { SportMatch } from '@/app/components/betting/MatchCard'
import { HandicapTable } from '@/app/components/betting/HandicapTable'
import { BetSlipDrawer } from '@/app/components/betting/BetSlipDrawer'
import { AIAnalysisSidebar } from '@/app/components/betting/AIAnalysisSidebar'
import type { AIAnalysis } from '@/app/components/betting/AIAnalysisSidebar'
import { useToast } from '@/app/components/Toast'
import { fetchJson } from '@/lib/fetch'

type HandicapItem = {
  matchId: string; homeTeam: string; awayTeam: string
  handicap: string; odds: { home: number; draw: number; away: number }
  aiPick: 'home' | 'away' | 'draw'
}
type Selection = { matchId: string; pick: string; odds: number; label: string }

const leagues = ['英超', '西甲', '德甲', '意甲'] as const

export default function BettingPage() {
  const [activeLeague, setActiveLeague] = useState<string>('英超')
  const [matches, setMatches] = useState<SportMatch[]>([])
  const [handicap, setHandicap] = useState<HandicapItem[]>([])
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [selections, setSelections] = useState<Selection[]>([])
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchJson<{ code: number; data: SportMatch[] }>('/api/sports/matches?filter=today')
      .then(r => setMatches(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    Promise.all([
      fetchJson<{ code: number; data: HandicapItem[] }>('/api/sports/handicap').catch(() => null),
      fetchJson<{ code: number; data: AIAnalysis }>('/api/sports/analysis').catch(() => null),
    ]).then(([hRes, aRes]) => {
      if (hRes) setHandicap(hRes.data)
      if (aRes) setAnalysis(aRes.data)
    })
  }, [])

  const toggleOdds = (matchId: string, pick: string, odds: number, home: string, away: string) => {
    setSelections(prev => {
      const exists = prev.find(s => s.matchId === matchId && s.pick === pick)
      if (exists) return prev.filter(s => !(s.matchId === matchId && s.pick === pick))
      const cleaned = prev.filter(s => s.matchId !== matchId)
      return [...cleaned, { matchId, pick, odds, label: `${home} vs ${away} ${pick}` }]
    })
  }

  const removeSelection = (matchId: string, pick: string) => {
    setSelections(prev => prev.filter(s => !(s.matchId === matchId && s.pick === pick)))
  }

  const handleSubmitBet = async () => {
    setSubmitting(true)
    try {
      const json = await fetchJson<{ code: number; message?: string; data: { totalOdds: number } }>('/api/sports/bet', {
        method: 'POST',
        body: JSON.stringify({ selections: selections.map(s => ({ matchId: s.matchId, pick: s.pick, odds: s.odds })) }),
      })
      if (json.code === 0) {
        showToast(`投注成功！组合赔率 ${json.data.totalOdds}，消耗 100 积分`, 'success')
        setSelections([])
        setDrawerOpen(false)
      } else {
        showToast(json.message || '投注失败，请重试', 'error')
      }
    } catch {
      showToast('投注失败，请重试', 'error')
    }
    setSubmitting(false)
  }

  const leagueMatches = matches.filter(m => m.league === activeLeague)

  return (
    <div className="min-h-screen bg-[#06060c] bg-[#06060c] pb-24">

      {/* ========== Sticky Filter Bar ========== */}
      <div className="sticky top-0 z-30 bg-[#06060c]/80 bg-[#06060c]/80 backdrop-blur border-b border-[rgba(0,229,255,0.08)] border-[rgba(0,229,255,0.08)]">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-4">
          <h1 className="text-2xl font-bold text-white text-gray-100 font-serif mb-4">
            <span className="text-[var(--neon-cyan)]">竞彩足球</span> · AI 智能预测
          </h1>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {leagues.map(league => (
              <button
                key={league}
                onClick={() => setActiveLeague(league)}
                className={`px-5 py-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  activeLeague === league
                    ? 'text-[var(--neon-cyan)] border-[rgba(0,229,255,0.3)]'
                    : 'text-[#9098b0] text-[#505870] border-transparent hover:text-white hover:text-[#e8e8f0]'
                }`}
              >
                {league}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ========== Match List ========== */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-[#0c0c18]/60 bg-gray-800/60 rounded-lg animate-pulse border border-[rgba(0,229,255,0.1)] border-[rgba(0,229,255,0.1)]" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {leagueMatches.length === 0 ? (
                  <p className="text-[#9098b0] text-[#505870] text-center py-12">暂无 {activeLeague} 赛事数据</p>
                ) : (
                  leagueMatches.map(m => (
                    <div key={m.id} className="hover:bg-[rgba(0,229,255,0.08)] hover:bg-[#0c0c18] transition-colors duration-200 rounded-lg">
                      <MatchCard m={m} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ========== AI Analysis Sidebar ========== */}
          {analysis && (
            <div className="lg:col-span-1">
              <AIAnalysisSidebar analysis={analysis} />
            </div>
          )}
        </div>

        {/* ========== Handicap Table ========== */}
        <HandicapTable handicap={handicap} selections={selections} onToggleOdds={toggleOdds} />
      </div>

      {/* ========== FAB trigger for Drawer ========== */}
      {selections.length > 0 && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--neon-cyan)] text-[#e8e8f0] text-gray-950 shadow-lg shadow-[var(--neon-cyan)]/30 hover:shadow-xl hover:shadow-[var(--neon-cyan)]/40 transition-all flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
            {selections.length}
          </span>
        </button>
      )}

      {/* ========== Bet Slip Drawer ========== */}
      <BetSlipDrawer
        selections={selections}
        onRemove={removeSelection}
        onSubmit={handleSubmitBet}
        submitting={submitting}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
