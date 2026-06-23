'use client'

import { useState } from 'react'
import { Newspaper, Play, SoccerBall, ToggleRight } from 'phosphor-react'
import { MATCH_EVENTS, MATCH_INFO } from './data'

const eventStyles: Record<string, string> = {
  goal: 'border-l-emerald-500',
  card: 'border-l-amber-400',
  chance: 'border-l-blue-400',
  info: 'border-l-[var(--text-dim)]/30',
  ht: 'border-l-[var(--neon-cyan)]',
  ft: 'border-l-red-500',
}
const eventTextColors: Record<string, string> = {
  goal: 'text-emerald-400 font-semibold',
  card: 'text-amber-300',
  chance: 'text-blue-300',
  info: 'text-[var(--text-body)]/80',
  ht: 'text-[var(--neon-cyan)] font-semibold',
  ft: 'text-red-400 font-semibold',
}

export default function EventsTab() {
  const [subTab, setSubTab] = useState<'text' | 'key'>('text')
  const [goalsOnly, setGoalsOnly] = useState(false)

  const displayEvents = goalsOnly
    ? MATCH_EVENTS.filter((e) => e.type === 'goal')
    : MATCH_EVENTS

  return (
    <div className="flex flex-col gap-4">
      {/* Report card */}
      <div className="laser-panel p-4 flex gap-4 items-start">
        <div
          className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{ background: 'rgba(0,240,255,0.08)' }}
        >
          <Newspaper size={22} className="text-[var(--neon-cyan)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[var(--text-heading)] mb-1">
            阿根廷2-0战胜奥地利 小组赛两连胜提前出线
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-label)]">来源：央视新闻</span>
          </div>
        </div>
      </div>

      {/* Video highlights */}
      <div className="laser-panel p-4">
        <h4 className="text-xs text-[var(--text-label)] mb-3 flex items-center gap-1.5">
          <Play size={14} className="text-[var(--neon-cyan)]" />
          直击现场
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '环球体育', time: '18:15', title: '阿根廷vs奥地利' },
            { label: '环球体育', time: '19:30', title: '阿根廷2比0奥地利 阿根廷主帅说比赛过程' },
            { label: '环球体育', time: '20:00', title: '赛后第二次参加世界杯' },
          ].map((v, i) => (
            <div
              key={i}
              className="laser-panel p-3 cursor-pointer hover:border-[var(--border-laser-hover)] transition-all text-center"
            >
              <div
                className="aspect-video rounded-md mb-2 flex items-center justify-center"
                style={{ background: 'rgba(0,240,255,0.04)' }}
              >
                <Play size={20} className="text-[var(--neon-cyan)]/60" />
              </div>
              <p className="text-[10px] text-[var(--text-label)] mb-0.5">
                {v.label} | {v.time}
              </p>
              <p className="text-xs text-[var(--text-body)] line-clamp-1">{v.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Event timeline */}
      <div className="laser-panel">
        {/* Sub tabs + filter */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-laser)]">
          <div className="flex gap-1">
            <button
              onClick={() => setSubTab('text')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                subTab === 'text'
                  ? 'bg-[rgba(0,240,255,0.12)] text-[var(--neon-cyan)]'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-body)]'
              }`}
            >
              文字直播
            </button>
            <button
              onClick={() => setSubTab('key')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                subTab === 'key'
                  ? 'bg-[rgba(0,240,255,0.12)] text-[var(--neon-cyan)]'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-body)]'
              }`}
            >
              重要事件
            </button>
          </div>
          <button
            onClick={() => setGoalsOnly(!goalsOnly)}
            className={`flex items-center gap-1.5 text-xs transition-all ${
              goalsOnly ? 'text-[var(--neon-cyan)]' : 'text-[var(--text-dim)]'
            }`}
          >
            <ToggleRight size={16} weight={goalsOnly ? 'fill' : 'regular'} />
            只看进球
          </button>
        </div>

        {/* Events list */}
        <div className="p-4 max-h-[600px] overflow-y-auto">
          {displayEvents.map((e, i) => (
            <div
              key={i}
              className={`flex gap-3 py-2.5 px-3 border-l-2 mb-1 rounded-r transition-all
                ${eventStyles[e.type] || ''}
              `}
              style={{ background: 'rgba(10,13,28,0.3)' }}
            >
              <span className="text-xs text-[var(--text-label)] min-w-[36px] font-mono pt-px">
                {e.minute}&apos;
              </span>
              <span className="text-xs w-5 text-center pt-px">{e.icon}</span>
              <span className={`text-sm leading-relaxed ${eventTextColors[e.type] || ''}`}>
                {e.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
