'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/app/components/Toast'

interface Referral {
  id: number
  code: string
  inviteeName: string
  status: string
  rewardClaimed: number
  createdAt: string
}

interface Tier {
  count: number
  reward: number
  label: string
  achieved: boolean
  badge?: string
}

interface ReferralData {
  code: string
  inviteUrl: string
  acceptedCount: number
  referrals: Referral[]
  tiers: Tier[]
}

export default function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetch('/api/member/referral')
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) setData(d.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = async () => {
    if (!data?.code) return
    try {
      await navigator.clipboard.writeText(data.code)
      setCopied(true)
      showToast('邀请码已复制', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('复制失败', 'error')
    }
  }

  const handleClaim = async () => {
    setClaiming(true)
    try {
      const res = await fetch('/api/member/referral', { method: 'POST' })
      const d = await res.json()
      if (d.code === 0) {
        showToast(d.message, 'success')
        // Refresh
        fetch('/api/member/referral')
          .then((r) => r.json())
          .then((d) => {
            if (d.code === 0) setData(d.data)
          })
      } else {
        showToast(d.message || '领取失败', 'error')
      }
    } catch {
      showToast('网络错误', 'error')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#0c0c18] p-6 rounded-xl border border-[rgba(0,229,255,0.1)] animate-pulse">
        <div className="h-5 bg-[#0c0c18] rounded w-24 mb-4" />
        <div className="h-12 bg-[#0c0c18] rounded mb-3" />
        <div className="h-4 bg-[#0c0c18] rounded w-3/4" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-[#0c0c18] p-6 rounded-xl border border-[rgba(0,229,255,0.1)] text-center text-[#9098b0]">
        <p>请先登录查看邀请信息</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0c0c18] p-6 rounded-xl border border-[rgba(0,229,255,0.1)] space-y-5">
      <h3 className="text-lg font-serif text-[#e8e8f0]">邀请好友</h3>

      {/* 邀请码 */}
      <div className="bg-[#0c0c18] rounded-lg p-4 border border-[rgba(0,229,255,0.1)]">
        <p className="text-xs text-[#9098b0] mb-2">你的邀请码</p>
        <div className="flex items-center gap-3">
          <span className="font-numeric text-2xl font-bold text-[var(--neon-cyan)] tracking-widest">
            {data.code}
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg text-xs bg-[var(--neon-cyan)] text-[#e8e8f0] font-semibold hover:bg-[var(--neon-cyan)]/80"
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <p className="text-xs text-[#505870] mt-2">邀请链接: {data.inviteUrl}</p>
      </div>

      {/* 阶梯奖励 */}
      <div>
        <p className="text-sm text-[#e8e8f0] font-medium mb-3">阶梯奖励</p>
        <div className="flex gap-2">
          {data.tiers.map((tier, i) => (
            <div
              key={i}
              className={`flex-1 p-3 rounded-lg border text-center ${
                tier.achieved
                  ? 'bg-[var(--neon-cyan)]/10 border-[var(--neon-cyan)]/30'
                  : 'bg-[#0c0c18] border-[rgba(0,229,255,0.1)] opacity-60'
              }`}
            >
              <p className="text-xs text-[#9098b0]">{tier.label}</p>
              <p className="font-numeric text-lg font-bold text-[var(--neon-cyan)]">
                +{tier.reward}
              </p>
              {tier.badge && (
                <p className="text-[10px] text-[var(--neon-cyan)] mt-1">{tier.badge}徽章</p>
              )}
              {tier.achieved && (
                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                  已达成
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 进度 */}
      <div>
        <div className="flex justify-between text-xs text-[#9098b0] mb-1">
          <span>已邀请 {data.acceptedCount} 人</span>
        </div>
        <div className="h-2 bg-[rgba(0,229,255,0.08)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--neon-cyan)] rounded-full transition-all"
            style={{ width: `${Math.min(100, (data.acceptedCount / 5) * 100)}%` }}
          />
        </div>
      </div>

      {/* 领取按钮 */}
      {data.tiers.some((t) => t.achieved) && (
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full py-2.5 rounded-lg text-sm bg-[var(--neon-cyan)] text-[#e8e8f0] font-semibold hover:bg-[var(--neon-cyan)]/80 disabled:opacity-50"
        >
          {claiming ? '领取中...' : '领取奖励'}
        </button>
      )}

      {/* 已邀请列表 */}
      {data.referrals.length > 0 && (
        <div>
          <p className="text-sm text-[#e8e8f0] font-medium mb-2">已邀请好友</p>
          <div className="space-y-2">
            {data.referrals.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 border-b border-[rgba(0,229,255,0.08)] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] flex items-center justify-center text-xs text-[#9098b0]">
                    {r.inviteeName.charAt(0)}
                  </div>
                  <span className="text-sm text-[#e8e8f0]">{r.inviteeName}</span>
                </div>
                <span className={`text-xs ${r.status === 'accepted' ? 'text-green-400' : 'text-[#505870]'}`}>
                  {r.status === 'accepted' ? '已接受' : '待注册'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
