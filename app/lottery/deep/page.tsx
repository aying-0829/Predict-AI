'use client'

import { useState, useEffect } from 'react'
import type { LotteryType, LotteryHistoryItem, AIRecommendation, MissStat, LotteryTypeInfo } from '@/lib/services'
import ZoneDisplay from './components/ZoneDisplay'
import { Loading as LoadingSkeleton } from '@/app/components/Loading'
import { BlueFreqChart } from '@/app/components/lottery/BlueFreqChart'
import { SumTrendChart } from '@/app/components/lottery/SumTrendChart'
import { HotColdPanel } from '@/app/components/lottery/HotColdPanel'
import type { HotColdItem } from '@/lib/services'
import { MissTable } from '@/app/components/lottery/MissTable'
import { RecommendationPanel } from '@/app/components/lottery/RecommendationPanel'

const typeLabels: Record<LotteryType, string> = { ssq: '双色球', dlt: '大乐透', '3d': '福彩3D' }
const isSSQorDLT = (t: LotteryType) => t === 'ssq' || t === 'dlt'

function RatioDisplay({ data, type }: { data: LotteryHistoryItem[]; type: LotteryType }) {
  const recent = data.slice(0, 12)
  const oddCounts = recent.map(d => parseInt(d.oddEven.split(':')[0]))
  const zoneCounts = recent.map(d => d.zone)

  if (type === '3d') {
    return (
      <div className="space-y-3">
        <div>
          <span className="text-xs text-[#9098b0]">奇偶比例（近12期）：</span>
          <span className="text-xs text-[#e8e8f0]">{oddCounts.join(' / ')}</span>
        </div>
        <div>
          <span className="text-xs text-[#9098b0]">百十个位和值趋势：</span>
          <span className="text-xs text-[#e8e8f0]">
            {recent.map(d => d.reds.reduce((a: number, b: number) => a + b, 0)).join(' / ')}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs text-[#9098b0]">奇偶比例：</span>
        <span className="text-xs text-[#e8e8f0]">{oddCounts.join(' / ')}</span>
      </div>
      <div>
        <span className="text-xs text-[#9098b0]">区间分布：</span>
        <span className="text-xs text-[#e8e8f0]">{zoneCounts.join(' | ')}</span>
      </div>
    </div>
  )
}

export default function LotteryDeepPage() {
  const [activeType, setActiveType] = useState<LotteryType>('ssq')
  const [types, setTypes] = useState<LotteryTypeInfo[]>([])
  const [history, setHistory] = useState<LotteryHistoryItem[]>([])
  const [hotCold, setHotCold] = useState<{ hot: HotColdItem[]; cold: HotColdItem[]; missed: HotColdItem[] } | null>(null)
  const [predictions, setPredictions] = useState<{ current: AIRecommendation; next: AIRecommendation } | null>(null)
  const [missStats, setMissStats] = useState<MissStat[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'blueFreq' | 'sum' | 'ratio' | 'zone'>('blueFreq')

  const fetchData = async (type: LotteryType) => {
    setLoading(true)
    const base = `/api/lottery`
    const [histRes, hcRes, predRes, missRes, typesRes] = await Promise.all([
      fetch(`${base}/history?type=${type}&limit=50`),
      fetch(`${base}/hotcold?type=${type}`),
      fetch(`${base}/predictions?type=${type}`),
      fetch(`${base}/miss?type=${type}`),
      fetch(`${base}/types`),
    ])
    const [histJson, hcJson, predJson, missJson, typesJson] = await Promise.all([
      histRes.json(), hcRes.json(), predRes.json(), missRes.json(), typesRes.json(),
    ])
    setHistory(histJson.data || [])
    setHotCold(hcJson.data || null)
    setPredictions(predJson.data?.recommendations || null)
    setMissStats(missJson.data || [])
    if (typesJson.data?.length && types.length === 0) setTypes(typesJson.data)
    setLoading(false)
  }

  useEffect(() => { fetchData(activeType) }, [activeType])

  const tabOptions = [
    { key: 'blueFreq' as const, label: isSSQorDLT(activeType) ? '蓝球频率' : '号码频率' },
    { key: 'sum' as const, label: '和值走势' },
    { key: 'ratio' as const, label: '奇偶比例' },
    { key: 'zone' as const, label: '区间分布' },
  ]

  return (
    <div className="min-h-screen bg-[#06060c]">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-serif text-[#e8e8f0] mb-2">
          <strong className="text-[var(--neon-cyan)] font-bold">AI 数字彩</strong> · 深度学习分析引擎
        </h1>
        <p className="text-xs text-[#505870] tracking-[4px] uppercase">Lottery AI · Data-Driven Intelligence</p>
      </div>

      <div className="flex gap-2 mb-10">
        {(types.length ? types : [
          { id: 'ssq' as const, name: '双色球' },
          { id: 'dlt' as const, name: '大乐透' },
          { id: '3d' as const, name: '福彩3D' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setActiveType(t.id)}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeType === t.id
                ? 'bg-[#0c0c18] text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30'
                : 'bg-transparent text-[#505870] border border-[rgba(0,229,255,0.1)] hover:border-[rgba(0,229,255,0.08)] hover:text-[#e8e8f0]'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 px-6">
          <LoadingSkeleton rows={8} className="max-w-2xl mx-auto" />
        </div>
      ) : (
        <>
          <section className="mb-10">
            <h3 className="text-lg font-serif text-[#e8e8f0] border-b-2 border-[rgba(0,229,255,0.3)] inline-block pb-1 mb-6">
              历史开奖趋势
            </h3>
            <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[rgba(0,229,255,0.1)] flex justify-between items-center">
                <div className="flex gap-0.5 bg-[rgba(0,229,255,0.03)] p-0.5 rounded-lg">
                  {tabOptions.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-1.5 rounded-md text-xs transition-all ${
                        activeTab === tab.key
                          ? 'bg-[#0c0c18] text-[var(--neon-cyan)]'
                          : 'text-[#505870] hover:text-[#e8e8f0]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[#505870]">近 {history.length} 期</span>
              </div>
              <div className="p-6">
                {activeTab === 'blueFreq' && <BlueFreqChart data={history} type={activeType} />}
                {activeTab === 'sum' && <SumTrendChart data={history} type={activeType} />}
                {activeTab === 'ratio' && <RatioDisplay data={history} type={activeType} />}
                {activeTab === 'zone' && <ZoneDisplay data={history} type={activeType} />}
              </div>
            </div>
          </section>

          {hotCold && (
            <section className="mb-10">
              <h3 className="text-lg font-serif text-[#e8e8f0] border-b-2 border-[rgba(0,229,255,0.3)] inline-block pb-1 mb-6">
                冷热号分析
              </h3>
              <HotColdPanel hot={hotCold.hot} cold={hotCold.cold} missed={hotCold.missed} historyLength={history.length} />
            </section>
          )}

          {predictions && (
            <section className="mb-10">
              <h3 className="text-lg font-serif text-[#e8e8f0] border-b-2 border-[rgba(0,229,255,0.3)] inline-block pb-1 mb-6">
                AI 多期预测
              </h3>
              <RecommendationPanel predictions={predictions} activeType={activeType} />
            </section>
          )}

          {missStats.length > 0 && (
            <section className="mb-10">
              <h3 className="text-lg font-serif text-[#e8e8f0] border-b-2 border-[rgba(0,229,255,0.3)] inline-block pb-1 mb-6">
                遗漏统计表
              </h3>
              <MissTable missStats={missStats} />
            </section>
          )}

          <div className="p-4 bg-[#0c0c18] rounded-lg text-[11px] text-[#9098b0] leading-relaxed border border-[rgba(0,229,255,0.1)]">
            <strong className="text-[#e8e8f0]">声明：</strong>
            AI 预测基于历史数据统计模型与概率分析，仅供娱乐参考。数字彩票开奖为独立随机事件，历史频率不代表未来概率。请理性参与，切勿沉迷。
          </div>
        </>
      )}
    </div>
    </div>
  )
}
