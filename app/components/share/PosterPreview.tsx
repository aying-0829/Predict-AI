'use client'

import type { PosterData } from '@/lib/services/poster'

function WinStreakFlame({ data }: { data: PosterData }) {
  return (
    <div className="relative flex flex-col items-center px-6 pt-10" style={{ background: 'linear-gradient(180deg, #1a0a00 0%, #3d1500 30%, #1a0a00 100%)' }}>
      {/* Flame effect overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        background: 'radial-gradient(ellipse at center, #ff6b00 0%, transparent 70%), radial-gradient(ellipse at 50% 30%, #ffcc00 0%, transparent 50%)',
      }} />
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-4xl mb-2">🔥</div>
        <div className="text-[10px] text-orange-400/70 uppercase tracking-widest">连胜战绩</div>
        <div className="text-5xl font-bold text-orange-400 mt-2" style={{ fontFamily: 'Georgia, serif' }}>
          {data.streak}
          <span className="text-sm ml-1">连胜</span>
        </div>
        <div className="text-xs text-orange-500/60 mt-1">最长连胜 {data.maxStreak || 0} 场</div>
        <div className="grid grid-cols-2 gap-3 w-64 mt-6">
          <div className="text-center py-3 rounded bg-black/30 border border-orange-900/30">
            <div className="text-xs text-orange-500/50">总准确率</div>
            <div className="text-lg font-bold text-orange-300 mt-1">{data.accuracy}%</div>
          </div>
          <div className="text-center py-3 rounded bg-black/30 border border-orange-900/30">
            <div className="text-xs text-orange-500/50">总命中</div>
            <div className="text-lg font-bold text-orange-300 mt-1">{data.hits}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PredictCompare({ data }: { data: PosterData }) {
  return (
    <div className="relative flex flex-col items-center px-6 pt-8">
      <div className="text-[10px] text-teal-400/70 uppercase tracking-widest mb-2">预测对比</div>
      <div className="text-4xl font-bold text-teal-400" style={{ fontFamily: 'Georgia, serif' }}>
        {data.accuracy}%
      </div>
      <div className="text-xs text-teal-500/60 mt-1">AI 预测准确率</div>

      {/* Comparison cards */}
      <div className="w-full mt-6 space-y-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded bg-teal-950/20 border border-teal-900/30">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <div className="flex-1 text-xs text-teal-300">AI 预测命中</div>
          <div className="text-sm font-bold text-teal-400">{data.hits}</div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded bg-red-950/20 border border-red-900/30">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="flex-1 text-xs text-red-300">预测未中</div>
          <div className="text-sm font-bold text-red-400">{data.totalPredictions - data.hits}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5 text-xs text-teal-500/50">
        <span>超越 {data.overPercent}% 预测者</span>
      </div>
    </div>
  )
}

function InvitePoster({ data }: { data: PosterData }) {
  const inviteCode = `PREDICT${String(data.rank || 42).padStart(4, '0')}`
  return (
    <div className="relative flex flex-col items-center px-6 pt-8">
      <div className="text-[10px] text-violet-400/70 uppercase tracking-widest mb-2">邀请好友</div>
      <div className="text-lg font-bold text-violet-300">加入 PREDICT AI</div>

      {/* Invite card */}
      <div className="w-full mt-5 p-4 rounded-xl bg-violet-950/20 border border-violet-900/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-violet-500/50 uppercase">我的邀请码</div>
            <div className="text-xl font-bold text-violet-300 font-mono tracking-widest mt-1">
              {inviteCode}
            </div>
          </div>
          <div className="w-14 h-14 rounded bg-violet-900/30 border border-violet-700/30 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <rect width="40" height="40" fill="#4a3060"/>
              <rect x="4" y="4" width="12" height="12" rx="1" fill="none" stroke="#a78bfa" strokeWidth="2"/>
              <rect x="6" y="6" width="5" height="5" fill="#a78bfa"/>
              <rect x="24" y="4" width="12" height="12" rx="1" fill="none" stroke="#a78bfa" strokeWidth="2"/>
              <rect x="28" y="8" width="6" height="3" fill="#a78bfa"/>
              <rect x="4" y="24" width="12" height="12" rx="1" fill="none" stroke="#a78bfa" strokeWidth="2"/>
              <rect x="7" y="29" width="3" height="5" fill="#a78bfa"/>
              <rect x="20" y="12" width="4" height="4" fill="#a78bfa"/>
              <rect x="27" y="20" width="3" height="3" fill="#a78bfa"/>
              <rect x="12" y="22" width="3" height="3" fill="#a78bfa"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div className="w-full mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-violet-400">🎁</span>
          <span className="text-violet-300/80">双方各得 <strong className="text-violet-200">200 积分</strong></span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-violet-400">⭐</span>
          <span className="text-violet-300/80">解锁 <strong className="text-violet-200">VIP 预测</strong> 3天</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-violet-400">🏆</span>
          <span className="text-violet-300/80">冲刺 <strong className="text-violet-200">邀请排行榜</strong></span>
        </div>
      </div>

      <div className="text-[10px] text-violet-500/40 mt-5">
        扫码或搜索「PREDICT AI」下载应用
      </div>
    </div>
  )
}

const templateList: { key: string; label: string; component: React.FC<{ data: PosterData }> }[] = [
  { key: 'stats', label: '战绩卡', component: null! },
  { key: 'streak', label: '连胜炫耀', component: null! },
  { key: 'badge', label: '排名勋章', component: null! },
  { key: 'winstreak-flame', label: '连胜战绩', component: WinStreakFlame },
  { key: 'predict-compare', label: '预测对比', component: PredictCompare },
  { key: 'invite', label: '邀请海报', component: InvitePoster },
]

export { WinStreakFlame, PredictCompare, InvitePoster, templateList }
