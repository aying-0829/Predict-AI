'use client'

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
  achievement: Achievement
  onClose: () => void
}

export default function AchievementDetail({ achievement, onClose }: Props) {
  const pct = achievement.target > 1
    ? Math.min(100, Math.round((achievement.progress / achievement.target) * 100))
    : achievement.unlocked ? 100 : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0c0c18] rounded-2xl border border-[rgba(0,229,255,0.1)] p-8 max-w-sm w-full mx-4 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9098b0] hover:text-[#e8e8f0] text-xl"
        >
          ✕
        </button>

        <div className={`text-6xl mb-4 ${achievement.unlocked ? '' : 'grayscale opacity-40'}`}>
          {achievement.unlocked ? achievement.icon : '🔒'}
        </div>

        <h2 className={`text-xl font-serif mb-2 ${achievement.unlocked ? 'text-[var(--neon-cyan)]' : 'text-[#505870]'}`}>
          {achievement.name}
        </h2>
        <p className="text-sm text-[#9098b0] mb-6">{achievement.description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#9098b0] mb-1">
            <span>进度</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-[rgba(0,229,255,0.08)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${achievement.unlocked ? 'bg-[var(--neon-cyan)]' : 'bg-[var(--neon-cyan)]/40'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {achievement.target > 1 && (
            <p className="text-xs text-[#505870] mt-1">
              {achievement.progress} / {achievement.target}
            </p>
          )}
        </div>

        {achievement.unlocked ? (
          <div className="bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/30 rounded-lg py-2 px-4">
            <p className="text-xs text-[var(--neon-cyan)]">
              已解锁于 {achievement.unlockedAt?.slice(0, 10)}
            </p>
          </div>
        ) : (
          <p className="text-xs text-[#505870]">继续努力解锁此成就</p>
        )}

        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 rounded-lg text-sm bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] text-[#9098b0] hover:text-[#e8e8f0]"
        >
          关闭
        </button>
      </div>
    </div>
  )
}
