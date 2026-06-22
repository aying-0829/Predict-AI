'use client'

import { useState, useEffect, useCallback } from 'react'
import { getLotteryData, getAIPredictions, type LotteryDrawData, type LotteryType, type AIRecommendation, type LotteryTypeInfo } from '@/lib/services'
import type { LotteryHistoryItem, MissStat, HotColdItem } from '@/lib/services'
import ZoneDisplay from './deep/components/ZoneDisplay'
import { Loading as LoadingSkeleton } from '@/app/components/Loading'
import { BlueFreqChart } from '@/app/components/lottery/BlueFreqChart'
import { SumTrendChart } from '@/app/components/lottery/SumTrendChart'
import { HotColdPanel } from '@/app/components/lottery/HotColdPanel'
import { MissTable } from '@/app/components/lottery/MissTable'
import { RecommendationPanel } from '@/app/components/lottery/RecommendationPanel'

const lotteryTypes = ['双色球', '大乐透', '福彩3D']
const nameToType: Record<string, LotteryType> = { '双色球': 'ssq', '大乐透': 'dlt', '福彩3D': '3d' }
const typeLabels: Record<LotteryType, string> = { ssq: '双色球', dlt: '大乐透', '3d': '福彩3D' }
const isSSQorDLT = (t: LotteryType) => t === 'ssq' || t === 'dlt'

function NumBall({ num, variant }: { num: number; variant: 'red' | 'blue' }) {
  return (
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center font-mono text-xl font-bold transition-all duration-300 ${
        variant === 'red'
          ? 'laser-panel hover:border-[var(--neon-cyan)] hover:scale-[1.08] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]'
          : 'bg-[rgba(0,240,255,0.06)] border border-[var(--border-laser)] text-[var(--neon-cyan)] hover:scale-[1.08] hover:border-[var(--neon-cyan)] hover:shadow-[0_0_20px_rgba(0,240,255,0.12)]'
      }`}
    >
      {String(num).padStart(2, '0')}
    </div>
  )
}

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

export default function LotteryPage() {
  useEffect(() => { document.title = 'Predict AI | AI 彩票预测' }, [])

  const [activeType, setActiveType] = useState('双色球')
  const [filteredData, setFilteredData] = useState<LotteryDrawData[]>([])
  const [recommend, setRecommend] = useState<AIRecommendation | null>(null)

  // 深层分析状态
  const [types, setTypes] = useState<LotteryTypeInfo[]>([])
  const [history, setHistory] = useState<LotteryHistoryItem[]>([])
  const [hotCold, setHotCold] = useState<{ hot: HotColdItem[]; cold: HotColdItem[]; missed: HotColdItem[] } | null>(null)
  const [predictions, setPredictions] = useState<{ current: AIRecommendation; next: AIRecommendation } | null>(null)
  const [missStats, setMissStats] = useState<MissStat[]>([])
  const [analysisLoading, setAnalysisLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'blueFreq' | 'sum' | 'ratio' | 'zone'>('blueFreq')

  const regenerate = useCallback(() => {
    const pred = getAIPredictions(nameToType[activeType], Math.floor(Math.random() * 2147483647))
    setRecommend(pred.current)
  }, [activeType])

  useEffect(() => { regenerate() }, [regenerate])

  useEffect(() => {
    setFilteredData(getLotteryData().filter((d: LotteryDrawData) => d.name === activeType))
  }, [activeType])

  // 深层分析数据获取
  const fetchAnalysisData = async (type: LotteryType) => {
    setAnalysisLoading(true)
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
    setAnalysisLoading(false)
  }

  useEffect(() => {
    fetchAnalysisData(nameToType[activeType])
  }, [activeType])

  const latestDraw = filteredData[0]

  const tabOptions = [
    { key: 'blueFreq' as const, label: isSSQorDLT(nameToType[activeType]) ? '蓝球频率' : '号码频率' },
    { key: 'sum' as const, label: '和值走势' },
    { key: 'ratio' as const, label: '奇偶比例' },
    { key: 'zone' as const, label: '区间分布' },
  ]

  return (
    <div className="min-h-screen relative">
      <div className="max-w-[1240px] mx-auto px-6 py-8 relative z-[1]">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-[rgba(10,10,15,0.92)] backdrop-blur-sm -mx-6 px-6 pt-4 pb-2 mb-8">
          <h1 className="text-3xl font-bold mb-3 text-[var(--text-heading)]">
            数字彩{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              · AI 深度学习引擎
            </span>
          </h1>
          <div className="tab-bar inline-flex">
            {lotteryTypes.map((t) => (
              <button key={t} onClick={() => setActiveType(t)} className={`tab-item ${activeType === t ? 'active' : ''}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Latest Draw */}
        {latestDraw && (
          <section className="mb-10">
            <div className="laser-panel p-10 text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-xs text-[var(--text-label)] tracking-wider">第 {latestDraw.period} 期</span>
                <span className="text-xs text-[var(--text-label)]">{latestDraw.date}</span>
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                {latestDraw.redBalls.map((n: number, i: number) => (
                  <NumBall key={`red-${i}`} num={n} variant="red" />
                ))}
                {latestDraw.blueBalls.map((n: number, i: number) => (
                  <NumBall key={`blue-${i}`} num={n} variant="blue" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* AI Recommend */}
        <section className="mb-10">
          <div className="holo-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-laser)] flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--neon-cyan)]">AI 推荐号码（{activeType}）</h2>
              <span className="data-badge">置信度分析</span>
            </div>
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--text-dim)] mb-6">
                基于近 500 期历史数据 · 冷热号分析 · 区间分布 · 奇偶比优化
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {recommend ? (
                  <>
                    {recommend.reds.map((n, i) => (
                      <div key={`r-${i}`} className="w-14 h-14 rounded-full laser-panel flex items-center justify-center font-mono text-xl font-bold text-[var(--neon-cyan)] transition-all duration-300 hover:border-[var(--neon-cyan)] hover:scale-[1.08] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                        {String(n).padStart(2, '0')}
                      </div>
                    ))}
                    {recommend.blues.map((n, i) => (
                      <div key={`b-${i}`} className="w-14 h-14 rounded-full bg-[rgba(0,240,255,0.06)] border border-[var(--border-laser)] flex items-center justify-center font-mono text-xl font-bold text-[var(--neon-cyan)] transition-all duration-300 hover:scale-[1.15] hover:border-[var(--neon-cyan)] hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                        {String(n).padStart(2, '0')}
                      </div>
                    ))}
                  </>
                ) : (
                  <span className="text-[var(--text-dim)]">正在生成推荐...</span>
                )}
              </div>

              {recommend && recommend.numberProbabilities && recommend.numberProbabilities.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs text-[var(--text-label)] mb-3">
                    号码置信度概率
                    <span className="ml-2 inline-flex items-center gap-1 bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] text-[10px] px-2 py-0.5 rounded-full">
                      综合置信度 {recommend.confidence}%
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {recommend.numberProbabilities.map(({ number, probability }, i) => {
                      const isBlue = recommend.blues.includes(number)
                      return (
                        <div key={`prob-${i}`} className="flex items-center gap-1.5 min-w-[120px]">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                            style={{
                              color: isBlue ? '#2563eb' : '#dc2626',
                              background: isBlue ? 'rgba(37,99,235,0.12)' : 'rgba(220,38,38,0.12)',
                              border: `1.5px solid ${isBlue ? 'rgba(37,99,235,0.3)' : 'rgba(220,38,38,0.3)'}`,
                            }}
                          >
                            {String(number).padStart(2, '0')}
                          </span>
                          <div className="flex-1 h-1.5 bg-[rgba(0,229,255,0.06)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${probability}%`,
                                background: isBlue ? 'linear-gradient(90deg, #2563eb, #3b82f6)' : 'linear-gradient(90deg, #dc2626, #ef4444)',
                              }}
                            />
                          </div>
                          <span className="w-9 text-right text-[10px] font-mono text-[#9098b0]">{probability}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <button className="btn-holo" onClick={regenerate}>重新生成推荐</button>
            </div>
          </div>
        </section>

        {/* History Table */}
        <section className="mb-10">
          <div className="laser-panel overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-laser)]">
              <h2 className="text-lg font-bold text-[var(--text-heading)]">历史开奖记录</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[rgba(0,0,0,0.3)] text-[var(--text-label)] text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 text-left">期号</th>
                    <th className="py-3 px-4 text-left">日期</th>
                    <th className="py-3 px-4 text-left">红球</th>
                    <th className="py-3 px-4 text-left">蓝球</th>
                    <th className="py-3 px-4 text-left">AI 推荐</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((draw: LotteryDrawData) => (
                    <tr key={draw.id} className="data-row border-b border-[var(--border-laser)]">
                      <td className="py-4 px-4 font-medium text-[var(--neon-cyan)] font-mono">{draw.period}</td>
                      <td className="py-4 px-4 text-[var(--text-dim)] font-mono text-xs">{draw.date}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1.5">
                          {draw.redBalls.map((n: number, i: number) => (
                            <span key={i} className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center text-xs font-bold">
                              {String(n).padStart(2, '0')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1.5">
                          {draw.blueBalls.length > 0 ? draw.blueBalls.map((n: number, i: number) => (
                            <span key={i} className="w-7 h-7 rounded-full bg-blue-600/90 text-white flex items-center justify-center text-xs font-bold">
                              {String(n).padStart(2, '0')}
                            </span>
                          )) : <span className="text-xs text-[var(--text-dim)]">-</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {draw.aiRecommend.red.map((n: number, i: number) => (
                            <span key={i} className="w-7 h-7 rounded-full bg-red-400/80 text-white flex items-center justify-center text-xs font-bold">
                              {String(n).padStart(2, '0')}
                            </span>
                          ))}
                          {draw.aiRecommend.blue.map((n: number, i: number) => (
                            <span key={`b${i}`} className="w-7 h-7 rounded-full bg-blue-400/80 text-white flex items-center justify-center text-xs font-bold">
                              {String(n).padStart(2, '0')}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 深层分析加载中 */}
        {analysisLoading ? (
          <section className="mb-10"><LoadingSkeleton rows={8} className="max-w-2xl mx-auto" /></section>
        ) : (
          <>
            {/* 历史开奖趋势 */}
            <section className="mb-10">
              <h3 className="text-lg font-serif text-[#e8e8f0] border-b-2 border-[rgba(0,229,255,0.3)] inline-block pb-1 mb-6">
                历史开奖趋势
              </h3>
              <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgba(0,229,255,0.1)] flex justify-between items-center">
                  <div className="flex gap-0.5 bg-[rgba(0,229,255,0.03)] p-0.5 rounded-lg">
                    {tabOptions.map(tab => (
                      <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-1.5 rounded-md text-xs transition-all ${
                          activeTab === tab.key ? 'bg-[#0c0c18] text-[var(--neon-cyan)]' : 'text-[#505870] hover:text-[#e8e8f0]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-[#505870]">近 {history.length} 期</span>
                </div>
                <div className="p-6">
                  {activeTab === 'blueFreq' && <BlueFreqChart data={history} type={nameToType[activeType]} />}
                  {activeTab === 'sum' && <SumTrendChart data={history} type={nameToType[activeType]} />}
                  {activeTab === 'ratio' && <RatioDisplay data={history} type={nameToType[activeType]} />}
                  {activeTab === 'zone' && <ZoneDisplay data={history} type={nameToType[activeType]} />}
                </div>
              </div>
            </section>

            {/* 冷热号分析 */}
            {hotCold && (
              <section className="mb-10">
                <h3 className="text-lg font-serif text-[#e8e8f0] border-b-2 border-[rgba(0,229,255,0.3)] inline-block pb-1 mb-6">
                  冷热号分析
                </h3>
                <HotColdPanel hot={hotCold.hot} cold={hotCold.cold} missed={hotCold.missed} historyLength={history.length} />
              </section>
            )}

            {/* AI 多期预测 */}
            {predictions && (
              <section className="mb-10">
                <h3 className="text-lg font-serif text-[#e8e8f0] border-b-2 border-[rgba(0,229,255,0.3)] inline-block pb-1 mb-6">
                  AI 多期预测
                </h3>
                <RecommendationPanel predictions={predictions} activeType={nameToType[activeType]} />
              </section>
            )}

            {/* 遗漏统计表 */}
            {missStats.length > 0 && (
              <section className="mb-10">
                <h3 className="text-lg font-serif text-[#e8e8f0] border-b-2 border-[rgba(0,229,255,0.3)] inline-block pb-1 mb-6">
                  遗漏统计表
                </h3>
                <MissTable missStats={missStats} />
              </section>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="laser-panel p-4 text-xs text-[var(--text-dim)] border-[var(--neon-amber)]/10">
          <p className="font-semibold text-[var(--text-heading)] mb-1">声明</p>
          <p>
            AI 选号基于统计概率模型，仅供娱乐参考。彩票开奖结果为独立随机事件，历史数据无法预测未来结果。请理性购彩。
          </p>
        </div>
      </div>
    </div>
  )
}
