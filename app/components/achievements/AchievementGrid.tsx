'use client'

import { useState } from 'react'

interface Achievement {
  key: string
  name: string
  description: string
  icon: string
  category: string
  unlocked: boolean
  unlockedAt: string | null
  progress: number
  target: number
}

interface Props {
  achievements: Achievement[]
  onSelect: (ach: Achievement) => void
}

const categoryLabels: Record<string, string> = {
  prediction: '预测',
  checkin: '签到',
  social: '社交',
  mastery: '精通',
  special: '特殊',
}

const categoryFilters = ['全部', '预测', '签到', '社交', '精通', '特殊']

export default function AchievementGrid({ achievements, onSelect }: Props) {
  const [filter, setFilter] = useState('全部')

  const filtered = filter === '全部'
    ? achievements
    : achievements.filter((a) => categoryLabels[a.category] === filter)

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#9098b0]">
          已解锁 <span className="text-[var(--neon-cyan)] font-bold">{unlockedCount}</span> / {achievements.length}
        </p>
        <div className="flex gap-1 flex-wrap">
          {categoryFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                filter === f
                  ? 'bg-[var(--neon-cyan)] text-[#e8e8f0]'
                  : 'bg-[#0c0c18] text-[#9098b0] hover:text-[#e8e8f0]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[#9098b0]">
          <p className="text-3xl mb-2">🏅</p>
          <p>该分类暂无成就</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((ach) => (
            <button
              key={ach.key}
              onClick={() => onSelect(ach)}
              className={`p-4 rounded-xl border text-left transition-all hover:border-[var(--neon-cyan)]/50 ${
                ach.unlocked
                  ? 'bg-[#0c0c18] border-[var(--neon-cyan)]/30'
                  : 'bg-[#0c0c18] border-[rgba(0,229,255,0.1)] opacity-60'
              }`}
            >
              <div className="text-3xl mb-2">{ach.unlocked ? ach.icon : '🔒'}</div>
              <h3 className={`text-sm font-semibold ${ach.unlocked ? 'text-[#e8e8f0]' : 'text-[#505870]'}`}>
                {ach.name}
              </h3>
              <p className="text-xs text-[#9098b0] mt-1 line-clamp-2">{ach.description}</p>
              {!ach.unlocked && ach.target > 1 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-[rgba(0,229,255,0.08)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--neon-cyan)]/40 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (ach.progress / ach.target) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#505870] mt-1">
                    {ach.progress} / {ach.target}
                  </p>
                </div>
              )}
              {ach.unlocked && ach.unlockedAt && (
                <p className="text-[10px] text-[var(--neon-cyan)] mt-2">
                  {ach.unlockedAt.slice(0, 10)}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
