'use client'

import { useState } from 'react'
import {
  ChartBar,
  Users,
  ChatCircleText,
  Star,
  Clock,
  ChartLineUp,
  TrendUp,
  TelevisionSimple,
} from 'phosphor-react'
import { TABS, type TabKey } from './components/data'
import AnalysisTab from './components/AnalysisTab'
import LineupTab from './components/LineupTab'
import ChatTab from './components/ChatTab'
import RatingTab from './components/RatingTab'
import EventsTab from './components/EventsTab'
import StatsTab from './components/StatsTab'
import OddsTab from './components/OddsTab'
import VideoTab from './components/VideoTab'

// ─── Real data adapter ────────────────────────────────────────────────────
import {
  getLiveMatchInfo,
  getTeamRecentForm,
  getTeamFormStats,
  getMatchStats,
  getOddsData,
} from './components/realDataAdapter'

// ─── Compute real data once (stable references for the page lifetime) ─────
const realMatchInfo = getLiveMatchInfo()
const realHomeRecent = getTeamRecentForm(realMatchInfo.homeTeam)
const realAwayRecent = getTeamRecentForm(realMatchInfo.awayTeam)
const realHomeStats = getTeamFormStats(realMatchInfo.homeTeam)
const realAwayStats = getTeamFormStats(realMatchInfo.awayTeam)
const realMatchStats = getMatchStats()
const realOddsData = getOddsData()

// ─── Props for tabs that support real data ───────────────────────────────
const analysisProps = {
  homeRecent: realHomeRecent,
  homeStats: realHomeStats,
  awayRecent: realAwayRecent,
  awayStats: realAwayStats,
  matchInfo: {
    homeTeam: realMatchInfo.homeTeam,
    homeFlag: realMatchInfo.homeFlag,
    awayTeam: realMatchInfo.awayTeam,
    awayFlag: realMatchInfo.awayFlag,
  },
}

const statsProps = {
  matchStats: realMatchStats,
  matchInfo: {
    homeTeam: realMatchInfo.homeTeam,
    homeFlag: realMatchInfo.homeFlag,
    awayTeam: realMatchInfo.awayTeam,
    awayFlag: realMatchInfo.awayFlag,
  },
}

const oddsProps = {
  oddsData: realOddsData,
}

// ─── Icons & components ───────────────────────────────────────────────────
const TAB_ICONS: Record<TabKey, React.ReactNode> = {
  analysis: <ChartBar size={16} />,
  lineup: <Users size={16} />,
  chat: <ChatCircleText size={16} />,
  rating: <Star size={16} />,
  events: <Clock size={16} />,
  stats: <ChartLineUp size={16} />,
  odds: <TrendUp size={16} />,
  video: <TelevisionSimple size={16} />,
}

export default function LivePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('chat')

  const renderTab = () => {
    switch (activeTab) {
      case 'analysis':
        return <AnalysisTab {...analysisProps} />
      case 'lineup':
        return <LineupTab />
      case 'chat':
        return <ChatTab />
      case 'rating':
        return <RatingTab />
      case 'events':
        return <EventsTab />
      case 'stats':
        return <StatsTab {...statsProps} />
      case 'odds':
        return <OddsTab {...oddsProps} />
      case 'video':
        return <VideoTab />
      default:
        return <ChatTab />
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      {/* Fixed header: Scoreboard + Tab navigation */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: 'linear-gradient(180deg, #0a0a14 0%, rgba(10,10,20,0.97) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border-laser)',
        }}
      >
        {/* Scoreboard — powered by realMatchInfo */}
        <div>
          {/* League header */}
          <div className="text-center pt-2 pb-1 px-4">
            <span className="text-xs text-[var(--text-dim)] tracking-wider">
              {realMatchInfo.league} · {realMatchInfo.date}
            </span>
          </div>

          {/* Teams & score */}
          <div className="flex items-center justify-center gap-4 px-6 pb-3">
            {/* Home team */}
            <div className="flex flex-col items-center gap-1 flex-1 text-right">
              <span className="text-3xl">{realMatchInfo.homeFlag}</span>
              <span className="text-sm font-bold text-[var(--text-heading)]">{realMatchInfo.homeTeam}</span>
              <span className="text-[10px] text-[var(--text-label)]">
                世界排名第{realMatchInfo.homeRank}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <div
                className="flex items-center gap-4 px-5 py-1.5 rounded-2xl"
                style={{ background: 'rgba(0,240,255,0.05)' }}
              >
                <span
                  className="text-5xl font-black tracking-tighter tabular-nums"
                  style={{
                    color: 'var(--text-heading)',
                    textShadow: '0 0 30px rgba(0,240,255,0.2)',
                    fontFamily: 'Orbitron, "Space Grotesk", system-ui, sans-serif',
                  }}
                >
                  {realMatchInfo.homeScore}
                </span>
                <span className="text-2xl text-[var(--text-dim)]">-</span>
                <span
                  className="text-5xl font-black tracking-tighter tabular-nums"
                  style={{
                    color: 'var(--text-heading)',
                    textShadow: '0 0 30px rgba(0,240,255,0.2)',
                    fontFamily: 'Orbitron, "Space Grotesk", system-ui, sans-serif',
                  }}
                >
                  {realMatchInfo.awayScore}
                </span>
              </div>
              <span className="status-pill status-done mt-1.5 text-xs">{realMatchInfo.status}</span>
            </div>

            {/* Away team */}
            <div className="flex flex-col items-center gap-1 flex-1 text-left">
              <span className="text-3xl">{realMatchInfo.awayFlag}</span>
              <span className="text-sm font-bold text-[var(--text-heading)]">{realMatchInfo.awayTeam}</span>
              <span className="text-[10px] text-[var(--text-label)]">
                世界排名第{realMatchInfo.awayRank}
              </span>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-2 pb-2">
          <div className="flex gap-1 overflow-x-auto max-w-6xl mx-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-[rgba(0,240,255,0.12)] text-[var(--neon-cyan)] shadow-[0_0_12px_rgba(0,240,255,0.1)] border border-[var(--neon-cyan)]/20'
                    : 'text-[var(--text-dim)] border border-transparent hover:text-[var(--text-body)] hover:bg-[rgba(0,240,255,0.03)]'
                }`}
              >
                {TAB_ICONS[tab.key]}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        {renderTab()}
      </main>
    </div>
  )
}
