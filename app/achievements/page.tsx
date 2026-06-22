'use client'

import { useState, useEffect, useCallback } from 'react'
import AchievementGrid from '@/app/components/achievements/AchievementGrid'
import AchievementDetail from '@/app/components/achievements/AchievementDetail'

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

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Achievement | null>(null)
  const [checking, setChecking] = useState(false)

  const fetchAchievements = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/achievements')
      const json = await res.json()
      if (json.code === 0) {
        setAchievements(json.data.list)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const handleCheck = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/achievements/check', { method: 'POST' })
      const json = await res.json()
      if (json.code === 0) {
        if (json.data.newlyUnlocked.length > 0) {
          // Refresh to show new unlocks
          fetchAchievements()
        }
      }
    } catch {
      // ignore
    } finally {
      setChecking(false)
    }
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="min-h-screen bg-[#06060c]">
      <div className="max-w-[1000px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--neon-cyan)]/15 border border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)] text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            成就系统
          </div>
          <h1 className="text-3xl font-serif text-[#e8e8f0] mb-2">你的成就</h1>
          <p className="text-sm text-[#9098b0]">
            已解锁{' '}
            <span className="text-[var(--neon-cyan)] font-bold">{unlockedCount}</span> / {totalCount} 个成就
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[#9098b0] mb-2">
            <span>总进度</span>
            <span>{totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-[rgba(0,229,255,0.08)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--neon-cyan)]/20 to-[var(--neon-cyan)] rounded-full transition-all duration-700"
              style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Check button */}
        <div className="text-right mb-6">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="px-5 py-2 rounded-lg text-sm bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] text-[#e8e8f0] hover:border-[rgba(0,229,255,0.3)] disabled:opacity-50"
          >
            {checking ? '检查中...' : '刷新成就'}
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-36 bg-[#0c0c18] rounded-xl animate-pulse border border-[rgba(0,229,255,0.1)]" />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-16 text-[#9098b0]">
            <p className="text-4xl mb-3">🏅</p>
            <p>暂无成就数据</p>
            <p className="text-sm mt-2">请先登录查看成就</p>
          </div>
        ) : (
          <AchievementGrid achievements={achievements} onSelect={setSelected} />
        )}

        {/* Detail Modal */}
        {selected && (
          <AchievementDetail achievement={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}
