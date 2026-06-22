'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/app/components/Toast'
import { WinStreakFlame, PredictCompare, InvitePoster } from '@/app/components/share/PosterPreview'

type TemplateType = 'stats' | 'streak' | 'badge' | 'winstreak-flame' | 'predict-compare' | 'invite'

interface PosterData {
  accuracy: number
  totalPredictions: number
  hits: number
  recentPredictions: number
  rank: number
  overPercent: number
  streak: number
  template: TemplateType
  maxStreak?: number
  recentResults?: { date: string; result: string; hit: boolean }[]
  unlockedBadges?: { name: string; icon: string; unlockedAt: string }[]
  lockedBadges?: { name: string; icon: string; requirement: string }[]
  nickname?: string
  avatarUrl?: string
  inviteCode?: string
}

function PosterPreview({ data }: { data: PosterData }) {
  return (
    <div className="relative mx-auto overflow-hidden rounded-2xl border border-[rgba(0,229,255,0.1)]"
      style={{ width: 380, height: 570, background: 'linear-gradient(180deg, #06060c 0%, rgba(12,12,30,0.6) 50%, #06060c 100%)' }}>
      {/* Top logo area */}
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="text-[var(--neon-cyan)] font-bold font-serif tracking-widest text-sm">PREDICT AI</span>
        <span className="text-xs text-[var(--neon-cyan)] border border-[var(--neon-cyan)] rounded-full px-3 py-0.5">
          AI 预测战绩
        </span>
      </div>

      {data.template === 'stats' && <StatsContent data={data} />}
      {data.template === 'streak' && <StreakContent data={data} />}
      {data.template === 'badge' && <BadgeContent data={data} />}
      {data.template === 'winstreak-flame' && <WinStreakFlame data={data} />}
      {data.template === 'predict-compare' && <PredictCompare data={data} />}
      {data.template === 'invite' && <InvitePoster data={data} />}

      {/* Bottom QR area */}
      <div className="absolute bottom-6 left-0 right-0 px-6">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <rect width="40" height="40" fill="#0c0c18"/>
              <rect x="4" y="4" width="12" height="12" rx="1" fill="none" stroke="var(--neon-cyan)" strokeWidth="2"/>
              <rect x="6" y="6" width="5" height="5" fill="var(--neon-cyan)"/>
              <rect x="24" y="4" width="12" height="12" rx="1" fill="none" stroke="var(--neon-cyan)" strokeWidth="2"/>
              <rect x="28" y="8" width="6" height="3" fill="var(--neon-cyan)"/>
              <rect x="4" y="24" width="12" height="12" rx="1" fill="none" stroke="var(--neon-cyan)" strokeWidth="2"/>
              <rect x="7" y="29" width="3" height="5" fill="var(--neon-cyan)"/>
              <rect x="20" y="12" width="4" height="4" fill="var(--neon-cyan)"/>
              <rect x="27" y="20" width="3" height="3" fill="var(--neon-cyan)"/>
              <rect x="12" y="22" width="3" height="3" fill="var(--neon-cyan)"/>
              <rect x="19" y="23" width="3" height="3" fill="var(--neon-cyan)"/>
              <rect x="23" y="27" width="2" height="2" fill="var(--neon-cyan)"/>
              <rect x="30" y="25" width="2" height="2" fill="var(--neon-cyan)"/>
              <rect x="17" y="29" width="5" height="2" fill="var(--neon-cyan)"/>
              <rect x="25" y="15" width="2" height="2" fill="var(--neon-cyan)"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-[var(--neon-cyan)]">扫码查看完整预测战绩</p>
            <p className="text-[10px] text-[#505870] mt-0.5">prescient-ai.marvis.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsContent({ data }: { data: PosterData }) {
  return (
    <div className="flex flex-col items-center px-6 pt-10">
      <div className="text-sm text-[#8a7a50] uppercase tracking-widest mb-3">准确率</div>
      <div className="text-[48px] font-bold text-[var(--neon-cyan)] leading-none" style={{ fontFamily: 'Georgia, serif' }}>
        {data.accuracy}%
      </div>
      <div className="text-xs text-[#505870] mt-2">
        超越 <span className="text-[var(--neon-cyan)] font-semibold">{data.overPercent}%</span> 预测者
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mt-8">
        <StatCell label="总预测" value={String(data.totalPredictions)} />
        <StatCell label="近7天" value={String(data.recentPredictions)} />
        <StatCell label="命中" value={String(data.hits)} />
        <StatCell label="全站排名" value={`#${data.rank}`} />
      </div>

      <div className="flex items-center gap-2 mt-6 text-[var(--neon-cyan)]">
        <span className="text-xl">🔥</span>
        <span className="text-sm font-semibold">{data.streak} 连胜中</span>
      </div>
    </div>
  )
}

function StreakContent({ data }: { data: PosterData }) {
  return (
    <div className="flex flex-col items-center px-6 pt-8">
      <div className="text-sm text-[#8a7a50] uppercase tracking-widest mb-3">当前连胜</div>
      <div className="text-[54px] font-bold text-[var(--neon-cyan)] leading-none" style={{ fontFamily: 'Georgia, serif' }}>
        {data.streak}
        <span className="text-sm text-[#8a7a50] ml-1">场</span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[var(--neon-cyan)]">
        <span>🔥</span>
        <span className="text-xs">连胜中 · 最长 {data.maxStreak} 场</span>
      </div>

      {data.recentResults && (
        <div className="w-full mt-6 space-y-2">
          {data.recentResults.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded bg-[#0c0c18] border border-[#0c0c18]">
              <span className="text-[#505870]">{r.date}</span>
              <span className="text-[#b8a060]">{r.result}</span>
              <span className={r.hit ? 'text-green-500' : 'text-red-400'}>
                {r.hit ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-[#505870] mt-6">
        总预测命中 <span className="text-[var(--neon-cyan)] font-semibold">{data.hits}</span> 场
      </div>
    </div>
  )
}

function BadgeContent({ data }: { data: PosterData }) {
  return (
    <div className="flex flex-col px-6 pt-6 pb-24">
      <div className="text-center text-sm text-[#8a7a50] uppercase tracking-widest mb-1">已解锁勋章</div>
      <div className="text-center text-xs text-[#505870] mb-4">{data.unlockedBadges?.length || 0} / {((data.unlockedBadges?.length || 0) + (data.lockedBadges?.length || 0))} 枚</div>

      {data.unlockedBadges && (
        <div className="space-y-2 mb-4">
          {data.unlockedBadges.map((b, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded bg-[#0c0c18] border border-[rgba(0,229,255,0.1)]">
              <span className="text-2xl">{b.icon}</span>
              <div className="flex-1">
                <div className="text-sm text-[var(--neon-cyan)] font-semibold">{b.name}</div>
                <div className="text-[10px] text-[#505870]">解锁于 {b.unlockedAt}</div>
              </div>
              <span className="text-green-500 text-xs">已解锁</span>
            </div>
          ))}
        </div>
      )}

      {data.lockedBadges && (
        <div className="space-y-2">
          <div className="text-[10px] text-[#505870] uppercase tracking-wider mb-1">未解锁</div>
          {data.lockedBadges.map((b, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded bg-[#15120a] border border-[#222010] opacity-60">
              <span className="text-xl grayscale">{b.icon}</span>
              <div className="flex-1">
                <div className="text-xs text-[#505870]">{b.name}</div>
                <div className="text-[10px] text-[#4a4020]">{b.requirement}</div>
              </div>
              <span className="text-[#4a4020] text-xs">🔒</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center py-3 rounded bg-[#0c0c18] border border-[#0c0c18]">
      <div className="text-xs text-[#505870]">{label}</div>
      <div className="text-lg font-bold text-[var(--neon-cyan)] mt-1">{value}</div>
    </div>
  )
}

export default function SharePage() {
  const [template, setTemplate] = useState<TemplateType>('stats')
  const [data, setData] = useState<PosterData | null>(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const posterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData(template)
  }, [template])

  async function fetchData(t: TemplateType) {
    setLoading(true)
    try {
      const res = await fetch(`/api/poster?template=${t}`)
      const json = await res.json()
      if (json.code === 0) setData(json.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const tabs: { key: TemplateType; label: string }[] = [
    { key: 'stats', label: '战绩卡' },
    { key: 'streak', label: '连胜炫耀' },
    { key: 'badge', label: '排名勋章' },
    { key: 'winstreak-flame', label: '连胜战绩' },
    { key: 'predict-compare', label: '预测对比' },
    { key: 'invite', label: '邀请海报' },
  ]

  async function handleSaveImage() {
    if (!posterRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `prescient-ai-poster-${template}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('海报已保存', 'success')
    } catch {
      showToast('保存失败，请重试', 'error')
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('链接已复制', 'success')
    } catch {
      showToast('复制失败', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-[#06060c] bg-[#06060c]">
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--neon-cyan)] font-serif">海报分享</h1>
          <p className="text-sm text-[#505870] text-[#9098b0] mt-2">生成专属战绩海报，分享到社区或朋友圈</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTemplate(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                template === tab.key
                  ? 'bg-[var(--neon-cyan)] text-black'
                  : 'bg-[#0c0c18] bg-gray-800 text-[#505870] text-[#9098b0] hover:text-[var(--neon-cyan)] border border-[rgba(0,229,255,0.1)] border-[rgba(0,229,255,0.1)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Poster preview */}
        <div className="flex justify-center items-center mb-8">
          {loading && (
            <div className="flex items-center justify-center" style={{ width: 380, height: 570 }}>
              <div className="animate-spin w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full" />
            </div>
          )}
          {!loading && data && <div ref={posterRef}><PosterPreview data={data} /></div>}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSaveImage}
            className="px-8 py-3 bg-[var(--neon-cyan)] text-black rounded-full font-semibold text-sm hover:bg-[var(--neon-cyan)] transition-colors"
          >
            保存海报
          </button>
          <button
            onClick={handleCopyLink}
            className="px-8 py-3 bg-[#0c0c18] bg-gray-800 text-[var(--neon-cyan)] border border-[rgba(0,229,255,0.3)] rounded-full font-semibold text-sm hover:bg-[rgba(0,229,255,0.08)] hover:bg-gray-700 transition-colors"
          >
            复制链接
          </button>
        </div>
      </main>
    </div>
  )
}
