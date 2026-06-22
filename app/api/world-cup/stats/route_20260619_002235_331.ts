import { NextResponse } from 'next/server'
import { getTournamentStats, getTopScorers } from '@/lib/services'
import { fetchWorldCupGames } from '@/lib/footballApi'

export async function GET() {
  try {
    const wcGames = await fetchWorldCupGames()

    if (wcGames && wcGames.length > 0) {
      // 基于真实数据计算统计
      const totalMatches = wcGames.length
      const finished = wcGames.filter((m: any) => {
        const s = (m.status || '').toLowerCase()
        return s.includes('finish') || s.includes('ended') || s.includes('completed') || s.includes('ft')
      }).length
      const live = wcGames.filter((m: any) => {
        const s = (m.status || '').toLowerCase()
        return s.includes('live') || s.includes('ongoing') || s.includes('in_play')
      }).length
      const upcoming = totalMatches - finished - live

      // 计算总进球数
      let totalGoals = 0
      for (const m of wcGames) {
        const hs = (m as any).home_score ?? (m as any).homeScore ?? 0
        const as = (m as any).away_score ?? (m as any).awayScore ?? 0
        if (hs != null && as != null) totalGoals += Number(hs) + Number(as)
      }

      const avgGoals = finished > 0 ? (totalGoals / finished).toFixed(1) : '0'

      return NextResponse.json({
        code: 0,
        data: {
          stats: {
            totalMatches,
            matchesPlayed: finished,
            totalGoals,
            avgGoalsPerMatch: Number(avgGoals),
            liveMatches: live,
            upcomingMatches: upcoming,
            homeWins: 0,
            drawMatches: 0,
            awayWins: 0,
          },
          scorers: getTopScorers(), // 射手榜暂用 mock
        },
        source: 'worldcup26.ir',
      })
    }
  } catch {
    // 降级
  }

  return NextResponse.json({
    code: 0,
    data: {
      stats: getTournamentStats(),
      scorers: getTopScorers(),
    },
    source: 'mock',
  })
}
