'use client'

import { useState } from 'react'
import { Star, Users, TrendUp } from 'phosphor-react'
import { ARGENTINA_RATINGS, MATCH_INFO } from './data'

function RatingCard({
  player,
  index,
}: {
  player: (typeof ARGENTINA_RATINGS)[number]
  index: number
}) {
  const ratingColor =
    player.rating >= 8.8
      ? 'text-[#ff6b6b]'
      : player.rating >= 8.5
      ? 'text-[var(--neon-amber)]'
      : 'text-[var(--neon-cyan)]'

  return (
    <div
      className="laser-panel p-4 flex gap-4 items-start hover:border-[var(--border-laser-hover)] transition-all"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Avatar placeholder */}
      <div
        className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(255,0,170,0.08))',
          border: '2px solid var(--border-laser)',
        }}
      >
        ⚽
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <h4 className="text-sm font-bold text-[var(--text-heading)]">{player.name}</h4>
          {player.goals > 0 && (
            <span className="text-[10px] text-emerald-400">
              {player.goals}进球
            </span>
          )}
          {player.assists > 0 && (
            <span className="text-[10px] text-[var(--neon-cyan)]">
              {player.assists}助攻
            </span>
          )}
        </div>

        {/* Rating display */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`text-2xl font-black ${ratingColor}`}
            style={{ textShadow: `0 0 20px currentColor` }}
          >
            {player.rating}
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} weight="fill" className="text-[var(--neon-amber)]" />
            <span className="text-[10px] text-[var(--text-dim)]">{player.votes}人已评</span>
          </div>
        </div>

        {/* Hot comment */}
        <div
          className="p-3 rounded-lg"
          style={{ background: 'rgba(0,240,255,0.03)', borderLeft: '2px solid var(--border-laser)' }}
        >
          <div className="flex items-center gap-1 mb-1">
            <TrendUp size={12} className="text-[var(--neon-cyan)]/60" />
            <span className="text-[10px] text-[var(--text-label)] uppercase tracking-wider">热评</span>
          </div>
          <p className="text-xs text-[var(--text-body)]/80 leading-relaxed italic">
            「{player.comment}」
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RatingTab() {
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home')

  return (
    <div className="flex flex-col gap-4">
      {/* Team switch */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTeam('home')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTeam === 'home'
              ? 'bg-[rgba(0,240,255,0.12)] text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30'
              : 'bg-transparent text-[var(--text-dim)] border border-[var(--border-laser)] hover:text-[var(--text-body)]'
          }`}
        >
          {MATCH_INFO.homeFlag} {MATCH_INFO.homeTeam}
        </button>
        <button
          onClick={() => setActiveTeam('away')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTeam === 'away'
              ? 'bg-[rgba(0,240,255,0.12)] text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30'
              : 'bg-transparent text-[var(--text-dim)] border border-[var(--border-laser)] hover:text-[var(--text-body)]'
          }`}
        >
          {MATCH_INFO.awayFlag} {MATCH_INFO.awayTeam}
        </button>
      </div>

      {/* Rating cards */}
      <div className="flex flex-col gap-3">
        {activeTeam === 'home'
          ? ARGENTINA_RATINGS.map((player, i) => (
              <RatingCard key={player.name} player={player} index={i} />
            ))
          : // Austria ratings (mock data)
            [
              { name: '马尔科·阿瑙托维奇', goals: 0, assists: 0, rating: 7.2, votes: 312, comment: '作为队长拼尽全力，但球队整体进攻乏力' },
              { name: '帕特里克·彭茨', goals: 0, assists: 0, rating: 7.8, votes: 289, comment: '多次关键扑救，是奥地利本场表现最好的球员' },
              { name: '马塞尔·萨比策', goals: 0, assists: 0, rating: 7.0, votes: 198, comment: '中场组织有亮点，但最后一传质量不够' },
              { name: '凯文·丹索', goals: 0, assists: 0, rating: 6.8, votes: 156, comment: '防守端压力很大，吃到黄牌' },
              { name: '迈克尔·格雷戈里奇', goals: 0, assists: 0, rating: 6.5, votes: 134, comment: '前场跑动积极，但机会不多' },
            ].map((player, i) => (
              <RatingCard key={player.name} player={player} index={i} />
            ))
        }
      </div>
    </div>
  )
}
