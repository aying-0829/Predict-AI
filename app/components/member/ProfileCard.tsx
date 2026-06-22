'use client'

interface UserProfile {
  name: string; plan: string; planName: string; expireDate: string
  totalPredictions: number; checkinDays: number; points: number
}

export { type UserProfile }

interface ProfileCardProps {
  profile: UserProfile
  onSubscribe: (planId: string) => void
}

export function ProfileCard({ profile, onSubscribe }: ProfileCardProps) {
  return (
    <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[#a855f7] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[var(--neon-cyan)]/20">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif text-[var(--neon-cyan)] font-semibold">{profile.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30">
                {profile.planName}
              </span>
            </div>
            <p className="text-xs text-[#9098b0] mt-0.5">到期日：{profile.expireDate}</p>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="font-numeric text-2xl font-bold text-[var(--neon-cyan)]">{profile.totalPredictions}</div>
            <div className="text-xs text-[#9098b0]">累计预测</div>
          </div>
          <div className="text-center">
            <div className="font-numeric text-2xl font-bold text-[var(--neon-cyan)]">{profile.checkinDays}</div>
            <div className="text-xs text-[#9098b0]">连续签到（天）</div>
          </div>
          <div className="text-center">
            <div className="font-numeric text-2xl font-bold text-[var(--neon-cyan)]">{profile.points}</div>
            <div className="text-xs text-[#9098b0]">积分余额</div>
          </div>
          <div className="text-center">
            <div className="font-numeric text-2xl font-bold text-[var(--neon-cyan)]">{profile.expireDate}</div>
            <div className="text-xs text-[#9098b0]">到期日</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onSubscribe('yearly')}
            disabled={profile.plan === 'yearly'}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              profile.plan === 'yearly'
                ? 'bg-[rgba(0,229,255,0.08)] text-[#505870] cursor-default'
                : 'bg-[var(--neon-cyan)] text-[#080808] hover:bg-[var(--neon-cyan)]'
            }`}
          >
            {profile.plan === 'yearly' ? '已是年卡' : '续费年卡'}
          </button>
          <button
            onClick={() => onSubscribe('monthly')}
            disabled={profile.plan === 'monthly'}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all border ${
              profile.plan === 'monthly'
                ? 'border-[rgba(0,229,255,0.1)] text-[#505870] cursor-default'
                : 'border-[rgba(0,229,255,0.3)]/40 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10'
            }`}
          >
            {profile.plan === 'monthly' ? '当前方案' : '切换月卡'}
          </button>
        </div>
      </div>
    </div>
  )
}
