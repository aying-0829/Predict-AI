'use client'

import { useState, useEffect, useTransition } from 'react'
import { QuickLink } from '@/app/components/dashboard/QuickLink'
import { RecommendCard } from '@/app/components/dashboard/RecommendCard'
import { LiveMatchCard } from '@/app/components/dashboard/LiveMatchCard'
import { PredictionTable } from '@/app/components/dashboard/PredictionTable'
import { AccuracyOverview } from '@/app/components/dashboard/AccuracyOverview'
import { TrendSidebar } from '@/app/components/dashboard/TrendSidebar'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'
import FloatingLines from '@/app/components/FloatingLines'
import StaggerContainer from '@/app/components/animations/StaggerContainer'
import useCountUp from '@/app/hooks/useCountUp'
import { useTranslation } from '@/lib/i18n'

/* ===== Types ===== */
type KpiStats = {
  totalPredictions: number
  accuracy: number
  accuracyChange: number
  checkinDays: number
  points: number
  weeklyPredictions: number
}
type AccuracyBreakdown = {
  hits: number
  misses: number
  partials: number
  maxStreak: number
}
type PredictionRecord = {
  id: number
  date: string
  type: string
  prediction: string
  actual: string | null
  result: string
  hitDetail: string
  points: number
}
type TrendPoint = { date: string; hitCount: number; detail: string }
type TodayRecommendation = {
  id: string
  type: 'match' | 'lottery'
  title: string
  subtitle: string
  confidence: number
  detail: string
}
type LiveMatchInfo = {
  home: string
  away: string
  homeScore: number
  awayScore: number
  minute: number
  aiPrediction: string
  aiConfidence: number
  status: string
}

async function fetchJson(url: string) {
  const res = await fetch(url)
  const json = await res.json()
  return json.data
}

export default function DashboardPage() {
  useEffect(() => {
    document.title = 'Predict AI | AI 预测竞技场'
  }, [])
  const [kpi, setKpi] = useState<KpiStats | null>(null)
  const [accuracy, setAccuracy] = useState<AccuracyBreakdown | null>(null)
  const [history, setHistory] = useState<PredictionRecord[]>([])
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [recommendations, setRecommendations] = useState<TodayRecommendation[]>([])
  const [liveMatch, setLiveMatch] = useState<LiveMatchInfo | null>(null)
  const [filterType, setFilterType] = useState('')
  const [checkinState, setCheckinState] = useState<'idle' | 'loading' | 'done' | 'already'>('idle')
  const [checkinMsg, setCheckinMsg] = useState('')
  const [_isPending, startTransition] = useTransition()
  const { t } = useTranslation()

  useEffect(() => {
    Promise.all([
      fetchJson('/api/stats/overview').catch(() => null),
      fetchJson('/api/stats/accuracy').catch(() => null),
      fetchJson('/api/stats/history').catch(() => null),
      fetchJson('/api/stats/trend').catch(() => null),
      fetchJson('/api/recommendations').catch(() => null),
      fetchJson('/api/live').catch(() => null),
    ]).then(([kpiData, accData, histData, trendData, recData, liveData]) => {
      if (kpiData) setKpi(kpiData)
      if (accData) setAccuracy(accData)
      const historyList = histData?.list || histData
      if (Array.isArray(historyList)) setHistory(historyList)
      else if (historyList) {
        console.warn('[Dashboard] history data format issue')
        setHistory([])
      }
      const trendList = trendData?.trend || trendData
      if (Array.isArray(trendList)) setTrend(trendList)
      else if (trendList) {
        console.warn('[Dashboard] trend data format issue')
        setTrend([])
      }
      if (Array.isArray(recData)) setRecommendations(recData)
      else if (recData) {
        console.warn('[Dashboard] recommendations data format issue')
        setRecommendations([])
      }
      if (liveData) setLiveMatch(liveData)
    })
  }, [])

  const handleFilter = (type: string) => {
    startTransition(() => setFilterType(type))
    const url = type ? `/api/stats/history?type=${type}` : '/api/stats/history'
    fetchJson(url)
      .then((data) => {
        if (data) setHistory(data)
      })
      .catch(() => {})
  }

  const handleCheckin = async () => {
    setCheckinState('loading')
    try {
      const res = await fetch('/api/member/checkin', { method: 'POST' })
      const data = await res.json()
      if (data.code === 0) {
        setCheckinState('done')
        setCheckinMsg(`+10 积分，连续签到 ${data.data.streak} 天`)
        fetchJson('/api/stats/overview')
          .then((d) => d && setKpi(d))
          .catch(() => {})
      } else if (data.code === -1 && data.message?.includes('今日已签到')) {
        setCheckinState('already')
        setCheckinMsg('今日已签到')
      }
    } catch {
      setCheckinState('idle')
    }
  }

  const accuracyDisplay = useCountUp({
    target: kpi?.accuracy || 0,
    duration: 1500,
    format: 'percent',
  })
  const predictionsDisplay = useCountUp({
    target: kpi?.totalPredictions || 0,
    duration: 1200,
  })

  return (
    <>
    <ErrorBoundary silent>
      <FloatingLines
        animationSpeed={0.8}
        lineCount={[6, 20, 10]}
        lineDistance={[4, 2, 3]}
        linesGradient={['#c084fc', '#60a5fa', '#22d3ee', '#f472b6', '#a78bfa', '#818cf8']}
        middleWavePosition={{ x: 0.5, y: 0.0, rotate: 0.1 }}
        bottomWavePosition={{ x: 0.5, y: -0.35, rotate: -0.7 }}
        topWavePosition={{ x: 3.0, y: 0.65, rotate: -0.3 }}
        mixBlendMode="normal"
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 1 }}
      />
    </ErrorBoundary>

      {(!kpi || !accuracy) ? (
        <div className="max-w-5xl mx-auto px-6 py-20 relative z-[1]">
          <div className="animate-pulse space-y-6">
            <div className="h-32 laser-panel rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 laser-panel" />
              ))}
            </div>
          </div>
        </div>
      ) : kpi.totalPredictions === 0 ? (
        <div className="welcome-hero">
          <div className="welcome-ambient-glow" />

          <div className="text-center px-6 max-w-2xl mx-auto relative">
            <h1 className="mb-5">
              <span className="welcome-title-cyan">欢迎来到</span>
              <span className="welcome-title-brand">Predict AI</span>
            </h1>

            <p className="welcome-subtitle mb-3">
              你还没有任何预测记录。AI
              预测引擎已就绪，从世界杯赛事或 AI 智能选号开始你的第一笔预测吧。
            </p>

            <div className="welcome-btn-group">
              <a href="/world-cup" className="welcome-btn welcome-btn-cyan">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                世界杯预测
              </a>
              <a href="/lottery/deep" className="welcome-btn welcome-btn-magenta">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                AI 智能选号
              </a>
            </div>
          </div>
        </div>
      ) : (
      <div className="max-w-5xl mx-auto px-6 pb-10 relative z-[1]">

        <StaggerContainer>
          {/* Hero Section — 全息剧院 */}
          <section className="pt-16 pb-14">
            <div
              className="laser-panel p-8 md:p-12"
              style={{
                boxShadow:
                  '0 0 60px rgba(0,240,255,0.06), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex flex-col md:flex-row items-center gap-10 mb-8">
                <div className="flex-1 text-center md:text-left">
                <div className="data-badge mb-4 text-[var(--neon-cyan)]">
                  AI 预测准确率
                </div>
                <div className="hero-number mt-3">{accuracyDisplay.displayValue}</div>
                <p className="text-[var(--text-dim)] text-sm mt-3">
                  {t.dashboard.accuracy}
                  <span className="text-[var(--neon-cyan)] ml-2">
                    ↑ {kpi.accuracyChange}% {t.dashboard.upThisWeek}
                  </span>
                </p>
              </div>

              <div className="w-full md:w-80 space-y-3">
                {/* KPI Card 1 — 激光面板 */}
                <div className="laser-panel px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-label)] uppercase tracking-wider">
                      {t.dashboard.monthlyPredictions}
                    </p>
                    <p className="kpi-number">{predictionsDisplay.displayValue}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[var(--neon-cyan)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* KPI Card 2 — 全息投射 */}
                <div className="holo-card px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-label)] uppercase tracking-wider">
                      {t.dashboard.totalPoints}
                    </p>
                    <p className="kpi-number">{kpi.points.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,0,170,0.1)] border border-[rgba(255,0,170,0.2)]">
                    <svg
                      className="w-5 h-5 text-[var(--neon-magenta)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Check-in Card */}
                <div className="laser-panel px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-label)] uppercase tracking-wider">
                      {t.dashboard.checkinDays}
                    </p>
                    <p
                      className="kpi-number"
                      style={{
                        color: 'var(--neon-amber)',
                        textShadow: '0 0 16px rgba(245,158,11,0.25)',
                      }}
                    >
                      {kpi.checkinDays}{' '}
                      <span className="text-sm font-normal">{t.dashboard.days}</span>
                    </p>
                  </div>
                  {checkinState !== 'already' ? (
                    <button
                      onClick={handleCheckin}
                      disabled={checkinState === 'loading' || checkinState === 'done'}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        checkinState === 'done'
                          ? 'bg-green-600/20 text-green-400 cursor-default'
                          : 'text-[var(--neon-amber)] border border-[var(--neon-amber)]/30 hover:bg-[var(--neon-amber)]/10'
                      } disabled:opacity-50`}
                    >
                      {checkinState === 'loading'
                        ? '签到中...'
                        : checkinState === 'done'
                          ? checkinMsg
                          : '签到'}
                    </button>
                  ) : (
                    <span className="text-xs text-green-400 px-3 py-1.5 rounded-full bg-green-600/10 border border-green-600/20">
                      已签到
                    </span>
                  )}
                </div>
              </div>
            </div>

          <hr className="glow-divider my-8" />

          {/* Recommendations + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10">
            <div className="space-y-6">
              <h2 className="section-title">{t.dashboard.todayPicks}</h2>
              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <div className="laser-panel px-6 py-8 text-center text-[var(--text-dim)] text-sm">
                    暂无推荐
                  </div>
                ) : (
                  recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="neon-card flex border-l-[3px] border-l-solid"
                      style={{
                        borderLeftColor:
                          rec.type === 'match'
                            ? 'var(--neon-cyan)'
                            : 'var(--neon-magenta)',
                      }}
                    >
                      <div className="p-5 flex-1">
                        <RecommendCard rec={rec} />
                      </div>
                    </div>
                  ))
                )}
                {liveMatch && (
                  <div className="neon-card flex border-l-[3px] border-l-solid border-l-[var(--neon-amber)]">
                    <div className="p-5 flex-1">
                      <LiveMatchCard match={liveMatch} />
                    </div>
                  </div>
                )}
              </div>
              <PredictionTable
                history={history}
                filterType={filterType}
                onFilter={handleFilter}
              />
            </div>
            <div className="space-y-6">
              <TrendSidebar trend={trend} />
              <AccuracyOverview accuracy={kpi.accuracy} breakdown={accuracy} />
            </div>
          </div>

          <hr className="glow-divider my-8" />

          {/* Quick Links */}
          <h3
            className="text-center text-sm font-semibold mb-8"
            style={{
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t.dashboard.forYou}
          </h3>
          <div className="flex flex-wrap gap-6 justify-center">
            <QuickLink
              href="/lottery/deep"
              icon="🎯"
              title={t.dashboard.aiPick}
              desc={t.dashboard.aiPickDesc}
            />
            <QuickLink
              href="/world-cup"
              icon="⚽"
              title={t.dashboard.worldCupSim}
              desc={t.dashboard.worldCupDesc}
            />
            <QuickLink
              href="/lottery/deep?tab=hotcold"
              icon="📊"
              title={t.dashboard.deepAnalysis}
              desc={t.dashboard.deepAnalysisDesc}
            />
          </div>
            </div>
          </section>
        </StaggerContainer>
      </div>
      )}
    </>
  )
}
