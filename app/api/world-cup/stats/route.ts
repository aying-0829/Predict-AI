import { NextResponse } from 'next/server'
import { fetchWorldCupGames } from '@/lib/footballApi'
import { getRealTournamentStats, getRealTopScorers } from '@/lib/worldCupRealData'

export async function GET() {
  try {
    const wcGames = await fetchWorldCupGames()

    if (wcGames && wcGames.length > 0) {
      // 基于真实数据计算统计
      const totalMatches = wcGames.length
      const finished = wcGames.filter((m: any) => {
        // worldcup26 API: finished is a boolean or string field
        const f = m.finished ?? m.time_elapsed ?? m.status ?? ''
        const s = typeof f === 'boolean' ? (f ? 'true' : 'false') : String(f).toLowerCase()
        return s === 'true' || s === 'finished' || s.includes('ft') || s.includes('ended') || s.includes('completed') || s.includes('finish')
      }).length
      const live = wcGames.filter((m: any) => {
        const s = (m.status || '').toLowerCase()
        return s.includes('live') || s.includes('ongoing') || s.includes('in_play')
      }).length
      const upcoming = totalMatches - finished - live

      // 计算总进球数
      let totalGoals = 0
      let homeWins = 0
      let awayWins = 0
      let draws = 0
      for (const m of wcGames) {
        const hs = (m as any).home_score ?? (m as any).homeScore ?? null
        const as = (m as any).away_score ?? (m as any).awayScore ?? null
        if (hs != null && as != null) {
          totalGoals += Number(hs) + Number(as)
          if (Number(hs) > Number(as)) homeWins++
          else if (Number(as) > Number(hs)) awayWins++
          else draws++
        }
      }

      const avgGoals = finished > 0 ? (totalGoals / finished).toFixed(2) : '0'

      return NextResponse.json({
        stats: {
          totalMatches,
          completedMatches: totalMatches,
          totalGoals,
          avgGoalsPerMatch: avgGoals,
          homeWins,
          awayWins,
          draws,
          cleanSheets: 0,
        },
        scorers: getRealTopScorers(),
      })
    }
  } catch (error) {
    console.error('[world-cup/stats]', error)
  }

  // 降级到静态数据
  return NextResponse.json({
    stats: getRealTournamentStats(),
    scorers: getRealTopScorers(),
  })
}
