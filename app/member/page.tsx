'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlanCard } from '@/app/components/member/PlanCard'
import type { MemberPlan, MemberFeature } from '@/app/components/member/PlanCard'
import { ProfileCard } from '@/app/components/member/ProfileCard'
import type { UserProfile } from '@/app/components/member/ProfileCard'
import { FeatureComparisonTable } from '@/app/components/member/FeatureComparisonTable'
import ReferralCard from '@/app/components/member/ReferralCard'
import { PointsCenter } from '@/app/components/member/PointsCenter'
import type { PointsRule } from '@/app/components/member/PointsCenter'
import { PointsHistoryTable } from '@/app/components/member/PointsHistoryTable'
import type { PointsRecord } from '@/app/components/member/PointsHistoryTable'
import { useToast } from '@/app/components/Toast'
import useCountUp from '@/app/hooks/useCountUp'

export default function MemberPage() {
  const [plans, setPlans] = useState<MemberPlan[]>([])
  const [features, setFeatures] = useState<MemberFeature[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [pointsHistory, setPointsHistory] = useState<PointsRecord[]>([])
  const [pointsRules, setPointsRules] = useState<PointsRule[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const { showToast } = useToast()

  const pointsValue = profile?.points ?? 0
  const threshold = 3000
  const remainder = pointsValue % threshold
  const distance = remainder === 0 ? 0 : threshold - remainder
  const progressPct = Math.min(100, Math.round(remainder / threshold * 100))

  const { displayValue } = useCountUp({ target: pointsValue, duration: 1500, format: 'number' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [plansRes, profileRes, pointsRes, historyRes] = await Promise.all([
        fetch('/api/member/plans').then(r => r.json()).catch(() => null),
        fetch('/api/member/profile').then(r => r.json()).catch(() => null),
        fetch('/api/member/points').then(r => r.json()).catch(() => null),
        fetch('/api/member/points/history').then(r => r.json()).catch(() => null),
      ])

      if (plansRes?.code === 0) {
        setPlans(plansRes.data.plans)
        setFeatures(plansRes.data.features)
      }
      if (profileRes?.code === 0) {
        const raw = profileRes.data
        setProfile({
          name: raw.name,
          plan: raw.plan || raw.membership_type || 'free',
          planName: raw.planName || raw.plan_name || '免费版',
          expireDate: raw.expireDate || raw.expire_date || '—',
          totalPredictions: raw.totalPredictions || 0,
          checkinDays: raw.checkinDays || 0,
          points: raw.points || 0,
        })
      }
      if (pointsRes?.code === 0) {
        const rawRules = pointsRes.data.rules || []
        setPointsRules(rawRules.map((r: { id: number; action: string; reward: number; limit: number }) => ({
          action: r.action,
          points: r.reward,
          description: r.limit ? `每日上限 ${r.limit} 次` : '不限次数',
        })))
      }
      if (historyRes?.code === 0) setPointsHistory(historyRes.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId)
    try {
      const res = await fetch('/api/member/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.code === 0) {
        showToast(`订阅成功！已升级为${data.data.plan}，到期日 ${data.data.expireDate}`, 'success')
        setTimeout(() => fetchData(), 500)
      } else {
        showToast(data.message || '订阅失败', 'error')
      }
    } catch {
      showToast('网络错误，请重试', 'error')
    } finally {
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060c] flex items-center justify-center">
        <div className="space-y-4 w-64">
          <div className="h-6 bg-[#0c0c18]/80 rounded animate-pulse border border-[rgba(0,229,255,0.1)]" />
          <div className="h-4 bg-[#0c0c18]/60 rounded animate-pulse border border-[rgba(0,229,255,0.1)] w-3/4" />
          <div className="h-4 bg-[#0c0c18]/60 rounded animate-pulse border border-[rgba(0,229,255,0.1)] w-1/2" />
        </div>
      </div>
    )
  }

  const freeFeatures = [
    { label: 'AI 预测次数', value: '每日 3 次' },
    { label: '概率分析深度', value: '基础' },
    { label: '赛事直播', value: '文字直播' },
    { label: '社区讨论', value: '基础' },
  ]

  // SVG ring calculations
  const ringR = 90
  const ringCircumference = 2 * Math.PI * ringR
  const ringOffset = ringCircumference - (progressPct / 100) * ringCircumference

  return (
    <div className="min-h-screen bg-[#06060c]">

      {/* Hero — Points Ring Display */}
      <section className="bg-[#0c0c18] pt-10 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--neon-cyan)]/15 border border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)] text-xs font-semibold uppercase tracking-wider mb-6">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6l3 8h14l3-8-5 4-5-9-5 9-5-4z" /></svg>
          会员中心
        </div>

        {/* SVG Ring */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <svg width="220" height="220" viewBox="0 0 220 220">
            {/* Background ring */}
            <circle
              cx="110" cy="110" r={ringR}
              fill="none"
              stroke="currentColor"
              className="text-[#505870]"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              cx="110" cy="110" r={ringR}
              fill="none"
              stroke="currentColor"
              className="text-[var(--neon-cyan)]"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 110 110)"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-numeric text-6xl text-[var(--neon-cyan)]" style={{ animation: 'countIn 0.6s ease-out both' }}>
              {displayValue}
            </span>
            <span className="text-sm text-[#9098b0] mt-1">当前积分</span>
            <span className="text-xs text-[var(--neon-cyan)] mt-1">
              {distance === 0 ? '已满 3000 积分，可抵扣 1 个月会员' : `距离下次抵扣还需 ${distance} 分`}
            </span>
          </div>
        </div>

        <p className="text-sm text-[#9098b0] max-w-lg mx-auto mt-4">
          无限次 AI 预测、深度分析报告、专属数据工具——让每一次决策都有数据支撑
        </p>
      </section>

      {/* Plan Cards — Horizontal Scroll */}
      <section className="max-w-[1240px] mx-auto px-6 mt-10">
        <h2 className="text-xl font-serif text-[#e8e8f0] text-center mb-8">选择你的方案</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 px-2">
          {/* 免费版 */}
          <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] p-6 flex flex-col flex-shrink-0 w-72">
            <h3 className="text-lg font-serif text-[var(--neon-cyan)] mb-1">免费版</h3>
            <p className="text-xs text-[#9098b0] mb-5">体验基础功能</p>
            <div className="mb-5">
              <span className="font-numeric text-3xl font-bold text-[var(--neon-cyan)]">¥0</span>
              <span className="text-sm text-[#9098b0] ml-1">/永久</span>
            </div>
            <ul className="flex-1 space-y-2.5 mb-6">
              {freeFeatures.map(f => (
                <li key={f.label} className="text-xs flex items-start gap-2 text-[var(--neon-cyan)]">
                  <svg className="w-4 h-4 text-[var(--neon-cyan)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f.label}：{f.value}
                </li>
              ))}
              {features.slice(2).map(f => (
                <li key={f.key} className="text-xs flex items-start gap-2 text-[#9098b0] line-through">
                  <svg className="w-4 h-4 text-red-400/40 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {f.label}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 rounded-lg border border-[rgba(0,229,255,0.1)] text-[#e8e8f0] text-sm font-medium cursor-default">当前方案</button>
          </div>

          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              profilePlan={profile?.plan}
              features={features}
              onSubscribe={handleSubscribe}
              subscribing={subscribing}
            />
          ))}
        </div>
      </section>

      {profile && (
        <section className="max-w-[1240px] mx-auto px-6 mt-10">
          <ProfileCard profile={profile} onSubscribe={handleSubscribe} />
        </section>
      )}

      <section className="max-w-[1240px] mx-auto px-6 mt-10">
        <h2 className="text-xl font-serif text-[var(--neon-cyan)] mb-6">权益对比</h2>
        <FeatureComparisonTable features={features} />
      </section>

      <section className="max-w-[1240px] mx-auto px-6 mt-10">
        <h2 className="text-xl font-serif text-[var(--neon-cyan)] mb-6">邀请有礼</h2>
        <ReferralCard />
      </section>

      <section className="max-w-[1240px] mx-auto px-6 mt-10">
        <h2 className="text-xl font-serif text-[#e8e8f0] mb-6">积分中心</h2>
        <PointsCenter points={pointsValue} rules={pointsRules} />
      </section>

      <section className="max-w-[1240px] mx-auto px-6 mt-10 pb-14">
        <h2 className="text-xl font-serif text-[var(--neon-cyan)] mb-6">积分记录</h2>
        <PointsHistoryTable history={pointsHistory} />
      </section>
    </div>
  )
}
