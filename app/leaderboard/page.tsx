'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import RankingTable from '@/app/components/leaderboard/RankingTable'
import TopThreePodium from '@/app/components/leaderboard/TopThreePodium'
import SeasonSelector from '@/app/components/leaderboard/SeasonSelector'
import GradientText from '@/app/components/GradientText'
import FadeContent from '@/app/components/FadeContent'

const DotField = dynamic(() => import('@/app/components/DotField'), { ssr: false })

interface LeaderboardUser { rank:number; userId:number; username:string; points:number; accuracy:number; currentStreak:number; longestStreak:number; totalPredictions:number; totalHits:number }

export default function LeaderboardPage() {
  const [type, setType] = useState<'accuracy'|'streak'|'points'>('accuracy')
  const [season, setSeason] = useState('current')
  const [data, setData] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState<{rank:number;accuracy:number}|null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?type=${type}&season=${season}`)
      const json = await res.json()
      if (json.code === 0) { setData(json.data.list); setMyRank(json.data.myRank||null) }
    } catch {} finally { setLoading(false) }
  }, [type, season])

  useEffect(() => { fetchData() }, [fetchData])

  const typeLabel = type === 'accuracy' ? '准确率榜' : type === 'streak' ? '连胜榜' : '积分榜'

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <div className="data-badge inline-flex mb-4">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          排行榜
        </div>
        <h1 className="text-3xl font-bold mb-2">
          <GradientText colors={['#00e5ff', '#a855f7']}>{typeLabel}</GradientText>
        </h1>
        <p className="text-sm text-[var(--text-dim)]">与全站用户一较高下，登上预测之巅</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="tab-bar">
          {(['accuracy','streak','points'] as const).map(t => (
            <button key={t} onClick={()=>setType(t)}
              className={`tab-item px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type===t?'active':'text-[var(--text-dim)] hover:text-[var(--text-body)]'}`}>
              {t==='accuracy'?'准确率':t==='streak'?'连胜':'积分'}
            </button>
          ))}
        </div>
        <SeasonSelector currentSeason={season} onSeasonChange={setSeason} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_,i)=>(<div key={i} className="h-14 glass-card rounded-xl animate-pulse" />))}
        </div>
      ) : (
        <>
          {data.length >= 3 && (
            <FadeContent blur={true} duration={1000} initialOpacity={0}>
              <TopThreePodium topThree={data.slice(0,3).map(u=>({rank:u.rank,userId:u.userId,username:u.username,accuracy:u.accuracy,points:u.points,currentStreak:u.currentStreak}))} type={type} />
            </FadeContent>
          )}
          <div className="glass-panel overflow-hidden"><RankingTable data={data} type={type} /></div>
          {myRank && (
            <div className="mt-4 glass-panel p-4 text-center border-[var(--neon-cyan)]/30">
              <p className="text-sm text-[var(--text-body)]">
                你的排名: <span className="text-[var(--neon-cyan)] font-bold">#{myRank.rank}</span>
                {type==='accuracy' && <span className="ml-2 text-[var(--neon-cyan)]">准确率 {myRank.accuracy}%</span>}
              </p>
            </div>
          )}
          {data.length === 0 && !loading && (
            <div className="text-center py-16 text-[var(--text-dim)]"><p className="text-4xl mb-3">📊</p><p>暂无排行数据，快去预测吧！</p></div>
          )}
        </>
      )}
    </div>
  )
}
