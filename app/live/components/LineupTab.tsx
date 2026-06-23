'use client'

import { useState } from 'react'
import { SoccerBall, Flag } from 'phosphor-react'
import {
  MATCH_INFO,
  REFEREE_INFO,
  VENUE,
  LINEUP_VALUE,
  FORMATION,
  ARGENTINA_LINEUP,
  AUSTRIA_LINEUP,
} from './data'

interface Player {
  number: number
  name: string
}

function PlayerDot({ player, color }: { player: Player; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all hover:scale-110"
        style={{
          background: `rgba(10,13,28,0.8)`,
          borderColor: color,
          color: 'var(--text-heading)',
        }}
      >
        {player.number}
      </div>
      <span className="text-[10px] text-[var(--text-body)] leading-tight text-center max-w-[60px]">
        {player.name}
      </span>
    </div>
  )
}

function PitchView({
  lineup,
  teamName,
  flag,
}: {
  lineup: typeof ARGENTINA_LINEUP
  teamName: string
  flag: string
}) {
  const isHome = teamName === MATCH_INFO.homeTeam
  const homeColor = 'var(--neon-cyan)'
  const awayColor = '#f59e0b'

  return (
    <div className="laser-panel p-6">
      {/* Team header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{flag}</span>
          <span className="text-sm font-bold text-[var(--text-heading)]">{teamName}</span>
        </div>
        <span className="text-xs text-[var(--text-label)]">
          阵型 {FORMATION} | 首发身价 {LINEUP_VALUE}
        </span>
      </div>

      {/* Pitch visual */}
      <div
        className="relative rounded-lg p-6 mb-4"
        style={{
          background: `linear-gradient(180deg, #0d5e2e 0%, #0a4a1f 50%, #0d5e2e 100%)`,
          border: '2px solid rgba(255,255,255,0.15)',
          minHeight: '420px',
        }}
      >
        {/* Pitch markings */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        />
        <div
          className="absolute left-1/2 top-1/2 w-16 h-16 rounded-full border -translate-x-1/2 -translate-y-1/2"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        />

        {/* Goalkeeper */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2">
          {lineup.goalkeeper.map((p) => (
            <PlayerDot key={p.number} player={p} color={isHome ? homeColor : awayColor} />
          ))}
        </div>

        {/* Defenders */}
        <div className="absolute bottom-[22%] left-[5%] right-[5%] flex justify-around">
          {lineup.defenders.map((p) => (
            <PlayerDot key={p.number} player={p} color={isHome ? homeColor : awayColor} />
          ))}
        </div>

        {/* Midfielders */}
        <div className="absolute bottom-[42%] left-[5%] right-[5%] flex justify-around">
          {lineup.midfielders.map((p) => (
            <PlayerDot key={p.number} player={p} color={isHome ? homeColor : awayColor} />
          ))}
        </div>

        {/* Forwards */}
        <div className="absolute bottom-[62%] left-[5%] right-[5%] flex justify-around">
          {lineup.forwards.map((p) => (
            <PlayerDot key={p.number} player={p} color={isHome ? homeColor : awayColor} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LineupTab() {
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home')

  return (
    <div className="flex flex-col gap-4">
      {/* Match info bar */}
      <div className="laser-panel p-4 grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col items-center gap-1">
          <SoccerBall size={16} className="text-[var(--text-label)]" />
          <span className="text-[10px] text-[var(--text-label)] uppercase">裁判</span>
          <span className="text-xs text-[var(--text-body)]">
            {REFEREE_INFO.number} {REFEREE_INFO.name}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Flag size={16} className="text-[var(--text-label)]" />
          <span className="text-[10px] text-[var(--text-label)] uppercase">场地</span>
          <span className="text-xs text-[var(--text-body)]">{VENUE}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg">💰</span>
          <span className="text-[10px] text-[var(--text-label)] uppercase">首发身价</span>
          <span className="text-xs text-[var(--neon-cyan)] font-semibold">{LINEUP_VALUE}</span>
        </div>
      </div>

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

      {/* Pitch */}
      {activeTeam === 'home' ? (
        <PitchView lineup={ARGENTINA_LINEUP} teamName={MATCH_INFO.homeTeam} flag={MATCH_INFO.homeFlag} />
      ) : (
        <PitchView lineup={AUSTRIA_LINEUP} teamName={MATCH_INFO.awayTeam} flag={MATCH_INFO.awayFlag} />
      )}
    </div>
  )
}
